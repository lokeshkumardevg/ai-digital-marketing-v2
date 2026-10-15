// src/messaging/inbox/inbox.types.ts
export type InboxChannel = 'facebook' | 'instagram' | 'google' | 'whatsapp' | 'email';

export const INBOX_CHANNELS: InboxChannel[] = ['facebook', 'instagram', 'google', 'whatsapp', 'email'];

export interface IncomingAttachment {
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  name?: string;
}

export interface IncomingMessage {
  externalId: string;
  direction: 'in' | 'out';
  text: string;
  attachments?: IncomingAttachment[];
  senderName?: string;
  sentAt: Date;
}

export interface Participant {
  id: string;
  name?: string;
  handle?: string;
  avatar?: string;
}

/** Error raised by a channel provider; `needsReconnect` tells the UI to ask for fresh permissions. */
export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly channel: InboxChannel,
    public readonly needsReconnect = false,
  ) {
    super(message);
  }
}
