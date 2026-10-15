// src/messaging/inbox/inbox.service.ts
// Unified inbox: one conversation/message model for every channel.
//   facebook / instagram  -> Graph API conversations (pull) + webhooks (push) + /me/messages (send)
//   google                -> Business Profile reviews, each review is a thread; reply = review reply
//   whatsapp / email      -> outbound via existing Twilio / Nodemailer providers;
//                            WhatsApp customer replies arrive on the Twilio webhook
import {
  BadGatewayException, BadRequestException, Injectable, Logger, NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import axios from 'axios';
import { UsersService } from '../../users/users.service';
import { GoogleBusinessService } from '../../google-business/google-business.service';
import { WhatsAppService } from '../providers/whatsapp.service';
import { EmailService } from '../providers/email.service';
import { AppGateway } from '../../app.gateway';
import {
  InboxAccount, InboxAccountDocument, InboxConversation, InboxConversationDocument,
  InboxMessage, InboxMessageDocument,
} from './schemas/inbox.schemas';
import {
  IncomingMessage, InboxChannel, INBOX_CHANNELS, Participant, ProviderError,
} from './inbox.types';
import { NewConversationDto } from './dto/inbox.dto';

const DAY = 24 * 60 * 60 * 1000;
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const stripPrefix = (v: string, prefix: string) => (v || '').replace(new RegExp(`^${prefix}/`), '');

@Injectable()
export class InboxService {
  private readonly logger = new Logger(InboxService.name);
  private readonly graph: string;
  private readonly lastSync = new Map<string, number>();

  constructor(
    @InjectModel(InboxAccount.name) private accountModel: Model<InboxAccountDocument>,
    @InjectModel(InboxConversation.name) private convModel: Model<InboxConversationDocument>,
    @InjectModel(InboxMessage.name) private msgModel: Model<InboxMessageDocument>,
    private readonly users: UsersService,
    private readonly google: GoogleBusinessService,
    private readonly whatsapp: WhatsAppService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
    private readonly gateway: AppGateway,
  ) {
    this.graph = `https://graph.facebook.com/${this.config.get<string>('META_GRAPH_VERSION') || 'v20.0'}`;
  }

  // ───────────────────────── channels / accounts ─────────────────────────

  async getChannels(userId: string) {
    const user: any = await this.users.findById(userId);
    const accounts = await this.accountModel.find({ userId }).lean();
    const unread = await this.convModel.aggregate([
      { $match: { userId, unreadCount: { $gt: 0 } } },
      { $group: { _id: '$channel', n: { $sum: 1 } } },
    ]);
    const unreadBy: Record<string, number> = {};
    unread.forEach((u: any) => (unreadBy[u._id] = u.n));

    const fb = accounts.filter(a => a.channel === 'facebook');
    const ig = accounts.filter(a => a.channel === 'instagram');
    return {
      channels: {
        facebook: { connected: fb.length > 0, accounts: fb.map(a => ({ id: a.accountId, name: a.name, picture: a.picture, subscribed: a.subscribed })), unread: unreadBy.facebook || 0 },
        instagram: { connected: ig.length > 0, accounts: ig.map(a => ({ id: a.accountId, name: a.name, username: a.username, picture: a.picture, subscribed: a.subscribed })), unread: unreadBy.instagram || 0 },
        google: { connected: !!user?.googleRefreshToken, unread: unreadBy.google || 0 },
        whatsapp: { connected: !!this.config.get('TWILIO_ACCOUNT_SID'), unread: unreadBy.whatsapp || 0 },
        email: { connected: !!this.config.get('EMAIL_USERNAME'), unread: unreadBy.email || 0 },
      },
      // Meta can be linked from this screen only if the user already did the Meta login in Settings
      metaLoginDone: !!user?.metaAccessToken,
    };
  }

  /** Reads the Pages (and linked Instagram accounts) of the logged-in Meta user and stores page tokens. */
  async connectMeta(userId: string) {
    const user: any = await this.users.findById(userId);
    if (!user?.metaAccessToken) {
      throw new BadRequestException('Meta connect nahi hai. Pehle Settings mein Facebook/Meta connect karo.');
    }

    let pages: any[] = [];
    try {
      const res = await axios.get(`${this.graph}/me/accounts`, {
        params: {
          access_token: user.metaAccessToken,
          fields: 'id,name,access_token,picture{url},instagram_business_account{id,username,name,profile_picture_url}',
          limit: 50,
        },
      });
      pages = res.data?.data || [];
    } catch (e: any) {
      throw this.metaError(e, 'facebook');
    }
    if (!pages.length) {
      throw new BadRequestException('Is Meta account par koi Facebook Page nahi mila.');
    }

    const warnings: string[] = [];
    let connected = 0;
    for (const p of pages) {
      if (!p.access_token) continue;
      const subscribe = await this.subscribePage(p.id, p.access_token);
      if (subscribe) warnings.push(`${p.name}: ${subscribe}`);

      await this.accountModel.updateOne(
        { userId, channel: 'facebook', accountId: p.id },
        { $set: { name: p.name, picture: p.picture?.data?.url, accessToken: p.access_token, subscribed: !subscribe, subscribeError: subscribe || undefined } },
        { upsert: true },
      );
      connected++;

      const ig = p.instagram_business_account;
      if (ig?.id) {
        await this.accountModel.updateOne(
          { userId, channel: 'instagram', accountId: ig.id },
          { $set: { pageId: p.id, name: ig.name || p.name, username: ig.username, picture: ig.profile_picture_url, accessToken: p.access_token, subscribed: !subscribe, subscribeError: subscribe || undefined } },
          { upsert: true },
        );
        connected++;
      }
    }
    return { connected, warnings };
  }

  /** Subscribes the page to our webhook. Returns an error string, or '' on success. */
  private async subscribePage(pageId: string, pageToken: string): Promise<string> {
    try {
      await axios.post(`${this.graph}/${pageId}/subscribed_apps`, null, {
        params: { access_token: pageToken, subscribed_fields: 'messages,messaging_postbacks' },
      });
      return '';
    } catch (e: any) {
      return e?.response?.data?.error?.message || 'Webhook subscribe nahi ho paya (real-time off, sync se kaam chalega).';
    }
  }

  // ───────────────────────────── sync (pull) ─────────────────────────────

  async syncAll(userId: string, force = false) {
    const last = this.lastSync.get(userId) || 0;
    if (!force && Date.now() - last < 30_000) return { skipped: true, errors: [] as any[] };
    this.lastSync.set(userId, Date.now());

    const errors: { channel: InboxChannel; message: string; needsReconnect: boolean }[] = [];
    const record = (channel: InboxChannel, e: any) => {
      const pe = e instanceof ProviderError ? e : this.toProviderError(e, channel);
      this.logger.warn(`[inbox sync] ${channel}: ${pe.message}`);
      errors.push({ channel, message: pe.message, needsReconnect: pe.needsReconnect });
    };

    const accounts = await this.accountModel.find({ userId }).select('+accessToken');
    await Promise.all(accounts.map(async acc => {
      try { await this.syncMetaAccount(userId, acc); } catch (e) { record(acc.channel as InboxChannel, e); }
    }));
    try { await this.syncGoogle(userId); } catch (e) { record('google', e); }

    return { skipped: false, errors };
  }

  private async syncMetaAccount(userId: string, acc: InboxAccountDocument) {
    const isIg = acc.channel === 'instagram';
    const edgeOwner = isIg ? acc.pageId : acc.accountId;
    if (!edgeOwner || !acc.accessToken) return;

    let data: any[] = [];
    try {
      const res = await axios.get(`${this.graph}/${edgeOwner}/conversations`, {
        params: {
          access_token: acc.accessToken,
          platform: isIg ? 'instagram' : 'messenger',
          limit: 25,
          fields: isIg
            ? 'id,updated_time,participants,messages.limit(25){id,message,from,created_time}'
            : 'id,updated_time,participants,messages.limit(25){id,message,from,created_time,attachments}',
        },
      });
      data = res.data?.data || [];
    } catch (e: any) {
      throw this.metaError(e, acc.channel as InboxChannel);
    }

    for (const c of data) {
      const people: any[] = c.participants?.data || [];
      const other = people.find(p => p.id !== acc.accountId) || people[0];
      if (!other?.id) continue;

      const messages: IncomingMessage[] = (c.messages?.data || []).map((m: any) => ({
        externalId: m.id,
        direction: m.from?.id === acc.accountId ? 'out' : 'in',
        text: m.message || '',
        attachments: this.metaAttachments(m.attachments),
        senderName: m.from?.name || m.from?.username,
        sentAt: new Date(m.created_time),
      }));
      if (!messages.length) continue;

      await this.ingest({
        userId, channel: acc.channel as InboxChannel, accountId: acc.accountId, externalId: c.id,
        participant: { id: other.id, name: other.name || other.username, handle: other.username },
        messages, backfill: true,
      });
    }
    await this.accountModel.updateOne({ _id: acc._id }, { $set: { lastSyncAt: new Date() } });
  }

  private metaAttachments(att: any) {
    const items: any[] = att?.data || [];
    return items
      .map(a => {
        const url = a.image_data?.url || a.file_url;
        if (!url) return null;
        const mime: string = a.mime_type || '';
        const type = mime.startsWith('image') ? 'image' : mime.startsWith('video') ? 'video' : mime.startsWith('audio') ? 'audio' : 'file';
        return { type: type as 'image' | 'video' | 'audio' | 'file', url, name: a.name };
      })
      .filter(Boolean) as { type: 'image' | 'video' | 'audio' | 'file'; url: string; name?: string }[];
  }

  /** Google Business Profile reviews: every review is a thread, the owner reply is the outbound message. */
  private async syncGoogle(userId: string) {
    const user: any = await this.users.findById(userId);
    if (!user?.googleRefreshToken) return;

    const accounts: any[] = (await this.google.getAccounts(userId)) || [];
    const stars: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

    for (const account of accounts.slice(0, 3)) {
      const gAccountId = stripPrefix(account.name, 'accounts');
      const locations: any[] = (await this.google.getLocations(userId, gAccountId)) || [];

      for (const loc of locations.slice(0, 10)) {
        const locationId = stripPrefix(loc.name, 'locations');
        let reviews: any[] = [];
        try { reviews = (await this.google.getReviews(userId, gAccountId, locationId)) || []; }
        catch (e: any) { this.logger.warn(`[inbox sync] google reviews ${locationId}: ${e?.message}`); continue; }

        for (const r of reviews) {
          const reviewId = r.reviewId || (r.name || '').split('/').pop();
          if (!reviewId) continue;
          const rating = stars[r.starRating] || 0;
          const messages: IncomingMessage[] = [{
            externalId: `review-${reviewId}`,
            direction: 'in',
            text: r.comment || `${rating}★ rating (no written review)`,
            senderName: r.reviewer?.displayName,
            sentAt: new Date(r.createTime),
          }];
          if (r.reviewReply?.comment) {
            messages.push({
              externalId: `reply-${reviewId}`, direction: 'out', text: r.reviewReply.comment,
              sentAt: new Date(r.reviewReply.updateTime || r.updateTime || r.createTime),
            });
          }
          await this.ingest({
            userId, channel: 'google', accountId: gAccountId, externalId: reviewId,
            participant: { id: r.reviewer?.displayName || reviewId, name: r.reviewer?.displayName || 'Google user', avatar: r.reviewer?.profilePhotoUrl },
            subject: loc.title,
            meta: { accountId: gAccountId, locationId, reviewId, rating },
            messages, backfill: true,
          });
        }
      }
    }
  }

  // ─────────────────────── ingestion (sync + webhooks) ───────────────────────

  private async ingest(p: {
    userId: string; channel: InboxChannel; accountId: string; externalId: string;
    participant: Participant; subject?: string; meta?: Record<string, any>;
    messages: IncomingMessage[]; backfill: boolean;
  }) {
    const ids = p.messages.map(m => m.externalId);
    const existingIds = new Set<string>(
      await this.msgModel.distinct('externalId', { userId: p.userId, channel: p.channel, externalId: { $in: ids } }),
    );
    const fresh = p.messages.filter(m => !existingIds.has(m.externalId)).sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());

    const key = { userId: p.userId, channel: p.channel, accountId: p.accountId, externalId: p.externalId };
    let conv = await this.convModel.findOne(key);
    // Meta webhooks carry no thread id, so they create a thread keyed `facebook:<psid>`. When a sync later
    // brings the real Graph thread id, adopt that thread instead of creating a duplicate.
    if (!conv && (p.channel === 'facebook' || p.channel === 'instagram')) {
      conv = await this.convModel.findOne({ userId: p.userId, channel: p.channel, accountId: p.accountId, participantId: p.participant.id });
      const synthetic = `${p.channel}:`;
      if (conv && conv.externalId.startsWith(synthetic) && !p.externalId.startsWith(synthetic)) {
        await this.convModel.updateOne({ _id: conv._id }, { $set: { externalId: p.externalId } });
        conv.externalId = p.externalId;
      }
    }
    if (!fresh.length && conv) return conv;
    if (!fresh.length) return null;

    const newInbound = fresh.filter(m => m.direction === 'in').length;
    const latest = fresh[fresh.length - 1];
    const latestInbound = [...fresh].reverse().find(m => m.direction === 'in');

    let created = false;
    if (!conv) {
      try {
        created = true;
        conv = await this.convModel.create({
          ...key,
          participantId: p.participant.id,
          participantName: p.participant.name,
          participantHandle: p.participant.handle,
          participantAvatar: p.participant.avatar,
          subject: p.subject,
          meta: p.meta,
          lastMessageText: this.preview(latest),
          lastMessageAt: latest.sentAt,
          lastDirection: latest.direction,
          lastInboundAt: latestInbound?.sentAt,
          // History imported by a sync is not "new": only flag it if the customer spoke last.
          unreadCount: p.backfill ? (latest.direction === 'in' ? 1 : 0) : newInbound,
        });
      } catch (e: any) {
        if (e?.code !== 11000) throw e;
        created = false;
        conv = await this.convModel.findOne(key); // lost a race, use the winner
      }
    }
    if (!conv) return null;

    const isNewest = latest.sentAt.getTime() >= conv.lastMessageAt.getTime();
    const set: Record<string, any> = {};
    if (isNewest) Object.assign(set, { lastMessageText: this.preview(latest), lastMessageAt: latest.sentAt, lastDirection: latest.direction });
    if (latestInbound && (!conv.lastInboundAt || latestInbound.sentAt > conv.lastInboundAt)) set.lastInboundAt = latestInbound.sentAt;
    if (!conv.participantName && p.participant.name) set.participantName = p.participant.name;
    if (!conv.participantAvatar && p.participant.avatar) set.participantAvatar = p.participant.avatar;
    if (p.meta) set.meta = { ...(conv.meta || {}), ...p.meta };
    // a customer writing again re-opens a resolved thread
    if (newInbound > 0 && conv.status === 'resolved' && isNewest) set.status = 'open';

    // for a brand-new conversation the unread count was already set in create()
    const inc: Record<string, number> = {};
    if (newInbound > 0 && !created) inc.unreadCount = newInbound;

    const update: Record<string, any> = {};
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(inc).length) update.$inc = inc;
    if (Object.keys(update).length) await this.convModel.updateOne({ _id: conv._id }, update);

    try {
      await this.msgModel.insertMany(
        fresh.map(m => ({
          userId: p.userId, conversationId: conv!._id, channel: p.channel, externalId: m.externalId,
          direction: m.direction, text: m.text, attachments: m.attachments || [], senderName: m.senderName,
          sentAt: m.sentAt, status: m.direction === 'out' ? 'sent' : 'received',
        })),
        { ordered: false },
      );
    } catch (e: any) {
      if (e?.code !== 11000 && !e?.writeErrors) throw e; // duplicates are fine (idempotent)
    }

    if (!p.backfill) this.emit(p.userId, { type: 'message', conversationId: String(conv._id), channel: p.channel });
    return conv;
  }

  private preview(m: IncomingMessage) {
    if (m.text) return m.text.slice(0, 200);
    return m.attachments?.length ? '[Attachment]' : '';
  }

  private emit(userId: string, payload: any) {
    try { this.gateway?.server?.to(`user_${userId}`).emit('inbox:update', payload); } catch { /* socket is optional */ }
  }

  // ───────────────────────────── webhooks ─────────────────────────────

  async handleMetaWebhook(body: any) {
    const channel: InboxChannel = body?.object === 'instagram' ? 'instagram' : 'facebook';
    if (body?.object !== 'page' && body?.object !== 'instagram') return;

    for (const entry of body.entry || []) {
      const acc = await this.accountModel.findOne({ channel, accountId: String(entry.id) }).select('+accessToken');
      if (!acc) { this.logger.debug(`[inbox webhook] no account for ${channel}:${entry.id}`); continue; }

      for (const ev of entry.messaging || []) {
        const m = ev.message;
        if (!m || !m.mid) continue; // reads, deliveries, postbacks are ignored for now
        const isEcho = !!m.is_echo;
        const customerId = String(isEcho ? ev.recipient?.id : ev.sender?.id);
        if (!customerId) continue;

        const existing = await this.convModel.findOne({ userId: acc.userId, channel, accountId: acc.accountId, participantId: customerId });
        const profile = existing?.participantName ? null : await this.fetchProfile(acc, customerId);

        const attachments = (m.attachments || [])
          .filter((a: any) => a?.payload?.url)
          .map((a: any) => ({ type: ['image', 'video', 'audio'].includes(a.type) ? a.type : 'file', url: a.payload.url }));

        await this.ingest({
          userId: acc.userId, channel, accountId: acc.accountId,
          externalId: existing?.externalId || `${channel}:${customerId}`, // webhook has no thread id; sync later reuses participant match
          participant: { id: customerId, name: profile?.name, handle: profile?.username, avatar: profile?.profile_pic },
          messages: [{
            externalId: m.mid, direction: isEcho ? 'out' : 'in', text: m.text || '', attachments,
            sentAt: new Date(ev.timestamp || Date.now()),
          }],
          backfill: false,
        });
      }
    }
  }

  private async fetchProfile(acc: InboxAccountDocument, id: string): Promise<any | null> {
    try {
      const res = await axios.get(`${this.graph}/${id}`, {
        params: { access_token: acc.accessToken, fields: acc.channel === 'instagram' ? 'name,username,profile_pic' : 'name,profile_pic' },
      });
      return res.data;
    } catch { return null; }
  }

  /** Twilio WhatsApp inbound. We only know the tenant if we have written to this number before. */
  async handleTwilioInbound(params: Record<string, string>) {
    const phone = (params.From || '').replace(/^whatsapp:/, '');
    if (!phone || !params.MessageSid) return;

    const owner = await this.convModel
      .findOne({ channel: 'whatsapp', participantId: phone })
      .sort({ lastMessageAt: -1 })
      .lean();
    if (!owner) { this.logger.warn(`[inbox twilio] inbound from ${phone} but no conversation owns it`); return; }

    const attachments = Number(params.NumMedia || 0) > 0 && params.MediaUrl0
      ? [{ type: (params.MediaContentType0 || '').startsWith('image') ? 'image' as const : 'file' as const, url: params.MediaUrl0 }]
      : [];
    await this.ingest({
      userId: owner.userId, channel: 'whatsapp', accountId: owner.accountId, externalId: owner.externalId,
      participant: { id: phone, name: params.ProfileName },
      messages: [{ externalId: params.MessageSid, direction: 'in', text: params.Body || '', attachments, sentAt: new Date() }],
      backfill: false,
    });
  }

  // ───────────────────────────── reading ─────────────────────────────

  async listConversations(userId: string, q: { channel?: string; status?: string; unread?: string; search?: string; before?: string; limit?: string }) {
    const limit = Math.min(Math.max(parseInt(q.limit || '30', 10) || 30, 1), 100);
    const filter: Record<string, any> = { userId };
    if (q.channel && (INBOX_CHANNELS as string[]).includes(q.channel)) filter.channel = q.channel;
    if (q.status === 'open' || q.status === 'resolved') filter.status = q.status;
    if (q.unread === 'true') filter.unreadCount = { $gt: 0 };
    if (q.search?.trim()) {
      const rx = new RegExp(escapeRegex(q.search.trim().slice(0, 60)), 'i');
      filter.$or = [{ participantName: rx }, { participantHandle: rx }, { lastMessageText: rx }, { subject: rx }];
    }
    if (q.before) { const d = new Date(q.before); if (!isNaN(d.getTime())) filter.lastMessageAt = { $lt: d }; }

    const rows = await this.convModel.find(filter).sort({ lastMessageAt: -1 }).limit(limit + 1).lean();
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(c => this.toConversationDto(c));
    return { items, nextCursor: hasMore ? items[items.length - 1].lastMessageAt : null };
  }

  async getMessages(userId: string, conversationId: string, before?: string, limitRaw?: string) {
    const conv = await this.ownConversation(userId, conversationId);
    const limit = Math.min(Math.max(parseInt(limitRaw || '50', 10) || 50, 1), 200);
    const filter: Record<string, any> = { conversationId: conv._id, userId };
    if (before) { const d = new Date(before); if (!isNaN(d.getTime())) filter.sentAt = { $lt: d }; }
    const rows = await this.msgModel.find(filter).sort({ sentAt: -1 }).limit(limit + 1).lean();
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).reverse().map(m => ({
      id: String(m._id), direction: m.direction, text: m.text, attachments: m.attachments || [],
      senderName: m.senderName, sentAt: m.sentAt,
    }));
    return { conversation: this.toConversationDto(conv.toObject ? conv.toObject() : conv), items, hasMore };
  }

  async markRead(userId: string, id: string) {
    const conv = await this.ownConversation(userId, id);
    await this.convModel.updateOne({ _id: conv._id }, { $set: { unreadCount: 0 } });
    return { ok: true };
  }

  async setStatus(userId: string, id: string, status: 'open' | 'resolved') {
    const conv = await this.ownConversation(userId, id);
    await this.convModel.updateOne({ _id: conv._id }, { $set: { status } });
    return { ok: true, status };
  }

  // ───────────────────────────── sending ─────────────────────────────

  async sendReply(userId: string, id: string, rawText: string) {
    const text = (rawText || '').trim();
    if (!text) throw new BadRequestException('Message khali hai.');
    const conv = await this.ownConversation(userId, id);
    const channel = conv.channel as InboxChannel;

    let externalId: string;
    switch (channel) {
      case 'facebook':
      case 'instagram': externalId = await this.sendMeta(userId, conv, text); break;
      case 'google': externalId = await this.sendGoogleReply(userId, conv, text); break;
      case 'whatsapp': externalId = await this.sendWhatsApp(conv.participantId, text); break;
      case 'email': externalId = await this.sendEmail(conv.participantId, conv.subject, text); break;
      default: throw new BadRequestException('Is channel par reply supported nahi hai.');
    }
    return this.recordOutbound(userId, conv, externalId, text);
  }

  async startConversation(userId: string, dto: NewConversationDto) {
    const text = dto.text.trim();
    if (!text) throw new BadRequestException('Message khali hai.');

    let participantId: string;
    let externalId: string;
    if (dto.channel === 'whatsapp') {
      participantId = this.normalizePhone(dto.to);
      if (participantId.replace(/\D/g, '').length < 10) throw new BadRequestException('Phone number sahi nahi hai.');
      externalId = participantId;
      await this.sendWhatsApp(participantId, text);
    } else {
      participantId = dto.to.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participantId)) throw new BadRequestException('Email sahi nahi hai.');
      externalId = participantId;
      await this.sendEmail(participantId, dto.subject, text);
    }

    const key = { userId, channel: dto.channel, accountId: 'default', externalId };
    let conv = await this.convModel.findOne(key);
    if (!conv) {
      conv = await this.convModel.create({
        ...key, participantId, participantName: dto.name || participantId, subject: dto.subject,
        lastMessageText: text.slice(0, 200), lastMessageAt: new Date(), lastDirection: 'out', unreadCount: 0,
      });
    }
    return this.recordOutbound(userId, conv, `out-${new Types.ObjectId().toHexString()}`, text);
  }

  private async recordOutbound(userId: string, conv: InboxConversationDocument, externalId: string, text: string) {
    const sentAt = new Date();
    const msg = await this.msgModel.create({
      userId, conversationId: conv._id, channel: conv.channel, externalId, direction: 'out',
      text, sentAt, status: 'sent', senderName: 'You',
    });
    await this.convModel.updateOne(
      { _id: conv._id },
      { $set: { lastMessageText: text.slice(0, 200), lastMessageAt: sentAt, lastDirection: 'out', unreadCount: 0 } },
    );
    return { conversationId: String(conv._id), message: { id: String(msg._id), direction: 'out', text, attachments: [], senderName: 'You', sentAt } };
  }

  private async sendMeta(userId: string, conv: InboxConversationDocument, text: string): Promise<string> {
    const isIg = conv.channel === 'instagram';
    if (text.length > (isIg ? 1000 : 2000)) throw new BadRequestException(`Is channel par message ${isIg ? 1000 : 2000} characters se chhota rakho.`);

    const acc = await this.accountModel.findOne({ userId, channel: conv.channel, accountId: conv.accountId }).select('+accessToken');
    if (!acc?.accessToken) throw new BadRequestException('Ye account ab connected nahi hai. Meta dobara connect karo.');

    // Meta messaging policy: free reply only within 24h of the customer's last message.
    const since = conv.lastInboundAt ? Date.now() - conv.lastInboundAt.getTime() : Infinity;
    const body: Record<string, any> = { recipient: { id: conv.participantId }, message: { text } };
    if (since <= DAY) {
      body.messaging_type = 'RESPONSE';
    } else if (since <= 7 * DAY && this.config.get('META_HUMAN_AGENT_ENABLED') === 'true') {
      body.messaging_type = 'MESSAGE_TAG';
      body.tag = 'HUMAN_AGENT';
    } else {
      throw new BadRequestException('Meta ki policy: customer ke last message ke 24 ghante baad reply nahi bheja ja sakta. Wo dobara message kare tab reply kar paoge.');
    }

    try {
      const res = await axios.post(`${this.graph}/me/messages`, body, { params: { access_token: acc.accessToken } });
      return res.data?.message_id || `out-${Date.now()}`;
    } catch (e: any) {
      throw new BadGatewayException(e?.response?.data?.error?.message || 'Message bhejne mein dikkat aayi.');
    }
  }

  private async sendGoogleReply(userId: string, conv: InboxConversationDocument, text: string): Promise<string> {
    const m = conv.meta || {};
    if (!m.accountId || !m.locationId || !m.reviewId) throw new BadRequestException('Review ki detail nahi mili. Sync karke dobara try karo.');
    if (text.length > 4000) throw new BadRequestException('Google reply 4000 characters se chhota rakho.');
    try {
      await this.google.replyToReview(userId, m.accountId, m.locationId, m.reviewId, text);
      return `reply-${m.reviewId}-${Date.now()}`;
    } catch (e: any) {
      throw new BadGatewayException(e?.response?.data?.error?.message || e?.message || 'Google reply nahi ho paya.');
    }
  }

  private async sendWhatsApp(to: string, text: string): Promise<string> {
    try { await this.whatsapp.sendMessage(to, text); } catch (e: any) {
      throw new BadGatewayException(e?.message || 'WhatsApp message nahi gaya.');
    }
    return `out-${new Types.ObjectId().toHexString()}`;
  }

  private async sendEmail(to: string, subject: string | undefined, text: string): Promise<string> {
    const subj = subject ? (/^re:/i.test(subject) ? subject : `Re: ${subject}`) : 'Message from us';
    try { await this.email.sendEmail(to, subj, `<div style="white-space:pre-wrap">${escapeHtml(text)}</div>`); } catch (e: any) {
      throw new BadGatewayException(e?.message || 'Email nahi gaya.');
    }
    return `out-${new Types.ObjectId().toHexString()}`;
  }

  private normalizePhone(phone: string): string {
    const digits = (phone || '').replace(/\D/g, '');
    if (!digits) return '';
    return digits.length === 10 ? `+91${digits}` : `+${digits}`;
  }

  // ───────────────────────────── helpers ─────────────────────────────

  private async ownConversation(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Conversation nahi mila.');
    const conv = await this.convModel.findOne({ _id: id, userId }); // ownership enforced in the query
    if (!conv) throw new NotFoundException('Conversation nahi mila.');
    return conv;
  }

  private toConversationDto(c: any) {
    const since = c.lastInboundAt ? Date.now() - new Date(c.lastInboundAt).getTime() : Infinity;
    const metaChannel = c.channel === 'facebook' || c.channel === 'instagram';
    return {
      id: String(c._id),
      channel: c.channel,
      participantName: c.participantName || c.participantHandle || 'Unknown',
      participantHandle: c.participantHandle,
      participantAvatar: c.participantAvatar,
      subject: c.subject,
      lastMessageText: c.lastMessageText,
      lastMessageAt: c.lastMessageAt,
      lastDirection: c.lastDirection,
      unreadCount: c.unreadCount || 0,
      status: c.status,
      rating: c.meta?.rating,
      // when can we still reply? (null = no limit)
      replyBy: metaChannel && c.lastInboundAt ? new Date(new Date(c.lastInboundAt).getTime() + DAY) : null,
      canReply: metaChannel ? since <= DAY || (since <= 7 * DAY && this.config.get('META_HUMAN_AGENT_ENABLED') === 'true') : true,
    };
  }

  private metaError(e: any, channel: InboxChannel): ProviderError {
    const err = e?.response?.data?.error;
    const code = err?.code;
    // 190 token expired/invalid, 10/200-299 permission missing
    const needsReconnect = code === 190 || code === 10 || (code >= 200 && code < 300);
    const msg = needsReconnect
      ? 'Meta permission missing ya token expire ho gaya. Messaging permissions ke saath Meta dobara connect karo.'
      : err?.message || e?.message || 'Meta se data nahi aa paya.';
    return new ProviderError(msg, channel, needsReconnect);
  }

  private toProviderError(e: any, channel: InboxChannel): ProviderError {
    if (channel === 'google') {
      const status = e?.response?.status;
      return new ProviderError(
        status === 401 || status === 403 ? 'Google connection expire / permission missing. Google dobara connect karo.' : e?.message || 'Google se data nahi aa paya.',
        channel, status === 401 || status === 403,
      );
    }
    return new ProviderError(e?.message || 'Sync fail ho gaya.', channel);
  }
}
