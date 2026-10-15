// src/messaging/inbox/schemas/inbox.schemas.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InboxAccountDocument = HydratedDocument<InboxAccount>;
export type InboxConversationDocument = HydratedDocument<InboxConversation>;
export type InboxMessageDocument = HydratedDocument<InboxMessage>;

/** A connected Facebook Page or Instagram business account that we read/send DMs for. */
@Schema({ timestamps: true })
export class InboxAccount {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, enum: ['facebook', 'instagram'] })
  channel!: string;

  /** Page ID (facebook) or Instagram business account ID (instagram). Webhooks use this as entry.id */
  @Prop({ required: true })
  accountId!: string;

  /** Instagram only: the Facebook Page the IG account is linked to (conversations API is called on the Page). */
  @Prop()
  pageId?: string;

  @Prop()
  name?: string;

  @Prop()
  username?: string;

  @Prop()
  picture?: string;

  /** Page access token. Never returned by default queries. */
  @Prop({ select: false })
  accessToken?: string;

  @Prop({ default: false })
  subscribed!: boolean;

  @Prop()
  subscribeError?: string;

  @Prop()
  lastSyncAt?: Date;
}
export const InboxAccountSchema = SchemaFactory.createForClass(InboxAccount);
InboxAccountSchema.index({ userId: 1, channel: 1, accountId: 1 }, { unique: true });
InboxAccountSchema.index({ channel: 1, accountId: 1 }); // webhook lookup

@Schema({ timestamps: true })
export class InboxConversation {
  _id!: Types.ObjectId;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true, enum: ['facebook', 'instagram', 'google', 'whatsapp', 'email'] })
  channel!: string;

  /** Which connected account this belongs to (page id / ig id / google account id / 'default'). */
  @Prop({ required: true })
  accountId!: string;

  /** Thread id on the platform (or a stable key: phone, email, google review id). */
  @Prop({ required: true })
  externalId!: string;

  /** Who we are talking to. For Meta: the user's PSID/IGSID. For whatsapp: +E164. For email: address. */
  @Prop({ required: true })
  participantId!: string;

  @Prop()
  participantName?: string;

  @Prop()
  participantHandle?: string;

  @Prop()
  participantAvatar?: string;

  /** Email subject / Google location name */
  @Prop()
  subject?: string;

  @Prop({ default: '' })
  lastMessageText!: string;

  @Prop({ default: () => new Date() })
  lastMessageAt!: Date;

  @Prop({ enum: ['in', 'out'], default: 'in' })
  lastDirection!: string;

  /** Last time the customer wrote to us — drives the 24h reply window on Facebook/Instagram. */
  @Prop()
  lastInboundAt?: Date;

  @Prop({ default: 0 })
  unreadCount!: number;

  @Prop({ enum: ['open', 'resolved'], default: 'open' })
  status!: string;

  /** Channel specific data (google: accountId/locationId/reviewId/rating). */
  @Prop({ type: Object })
  meta?: Record<string, any>;
}
export const InboxConversationSchema = SchemaFactory.createForClass(InboxConversation);
InboxConversationSchema.index({ userId: 1, channel: 1, accountId: 1, externalId: 1 }, { unique: true });
InboxConversationSchema.index({ userId: 1, lastMessageAt: -1 });
InboxConversationSchema.index({ userId: 1, channel: 1, participantId: 1, lastMessageAt: -1 }); // whatsapp inbound owner lookup

@Schema({ timestamps: true })
export class InboxMessage {
  _id!: Types.ObjectId;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ type: Types.ObjectId, required: true, ref: 'InboxConversation' })
  conversationId!: Types.ObjectId;

  @Prop({ required: true })
  channel!: string;

  /** Platform message id — makes webhook + sync ingestion idempotent. */
  @Prop({ required: true })
  externalId!: string;

  @Prop({ required: true, enum: ['in', 'out'] })
  direction!: string;

  @Prop({ default: '' })
  text!: string;

  @Prop({ type: [{ type: { type: String }, url: String, name: String, _id: false }], default: [] })
  attachments!: { type: string; url: string; name?: string }[];

  @Prop()
  senderName?: string;

  @Prop({ required: true })
  sentAt!: Date;

  @Prop({ enum: ['sent', 'received'], default: 'received' })
  status!: string;
}
export const InboxMessageSchema = SchemaFactory.createForClass(InboxMessage);
InboxMessageSchema.index({ userId: 1, channel: 1, externalId: 1 }, { unique: true });
InboxMessageSchema.index({ conversationId: 1, sentAt: -1 });
