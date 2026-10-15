// src/services/inboxApi.ts
import { api } from '../api/axios';

export type InboxChannel = 'facebook' | 'instagram' | 'google' | 'whatsapp' | 'email';

export interface ChannelInfo {
  connected: boolean;
  unread: number;
  accounts?: { id: string; name?: string; username?: string; picture?: string; subscribed: boolean }[];
}

export interface ChannelsResponse {
  channels: Record<InboxChannel, ChannelInfo>;
  metaLoginDone: boolean;
}

export interface Conversation {
  id: string;
  channel: InboxChannel;
  participantName: string;
  participantHandle?: string;
  participantAvatar?: string;
  subject?: string;
  lastMessageText: string;
  lastMessageAt: string;
  lastDirection: 'in' | 'out';
  unreadCount: number;
  status: 'open' | 'resolved';
  rating?: number;
  /** Facebook / Instagram only: reply must be sent before this time */
  replyBy: string | null;
  canReply: boolean;
}

export interface InboxMessage {
  id: string;
  direction: 'in' | 'out';
  text: string;
  attachments: { type: string; url: string; name?: string }[];
  senderName?: string;
  sentAt: string;
}

export interface SyncError {
  channel: InboxChannel;
  message: string;
  needsReconnect: boolean;
}

export interface ConversationQuery {
  channel?: InboxChannel;
  status?: 'open' | 'resolved';
  unread?: boolean;
  search?: string;
  before?: string;
}

export const inboxApi = {
  async channels() {
    const { data } = await api.get<ChannelsResponse>('/messaging/inbox/channels');
    return data;
  },
  async connectMeta() {
    const { data } = await api.post<{ connected: number; warnings: string[] }>('/messaging/inbox/connect/meta');
    return data;
  },
  async sync(force = false) {
    const { data } = await api.post<{ skipped: boolean; errors: SyncError[] }>('/messaging/inbox/sync', null, {
      params: force ? { force: 'true' } : undefined,
    });
    return data;
  },
  async conversations(q: ConversationQuery = {}) {
    const { data } = await api.get<{ items: Conversation[]; nextCursor: string | null }>('/messaging/inbox/conversations', {
      params: { ...q, unread: q.unread ? 'true' : undefined, limit: 30 },
    });
    return data;
  },
  async messages(id: string, before?: string) {
    const { data } = await api.get<{ conversation: Conversation; items: InboxMessage[]; hasMore: boolean }>(
      `/messaging/inbox/conversations/${id}/messages`,
      { params: before ? { before } : undefined },
    );
    return data;
  },
  async reply(id: string, text: string) {
    const { data } = await api.post<{ conversationId: string; message: InboxMessage }>(
      `/messaging/inbox/conversations/${id}/messages`,
      { text },
    );
    return data;
  },
  async markRead(id: string) {
    await api.post(`/messaging/inbox/conversations/${id}/read`);
  },
  async setStatus(id: string, status: 'open' | 'resolved') {
    await api.patch(`/messaging/inbox/conversations/${id}`, { status });
  },
  async start(dto: { channel: 'whatsapp' | 'email'; to: string; name?: string; subject?: string; text: string }) {
    const { data } = await api.post<{ conversationId: string; message: InboxMessage }>('/messaging/inbox/conversations', dto);
    return data;
  },
};

/** Nest returns { message } or { message: string[] } for validation errors */
export function apiError(e: any, fallback = 'Kuch galat ho gaya. Dobara try karo.'): string {
  const m = e?.response?.data?.message;
  if (Array.isArray(m)) return m.join(', ');
  return m || e?.message || fallback;
}
