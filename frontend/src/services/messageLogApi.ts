import { api } from '../api/axios';

export interface RecipientLog {
  name: string;
  phone?: string;
  email?: string;
  status: 'pending' | 'success' | 'failed';
  errorMessage?: string;
}

export interface MessageLog {
  _id: string;
  messageContent: string;
  channel: 'whatsapp' | 'email' | 'both';
  audienceList: RecipientLog[];
  totalRecipients: number;
  successCount: number;
  failedCount: number;
  processedCount: number;
  status: 'pending' | 'success' | 'partial' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export const messageLogApi = {
  async getLogs(filter?: '5days' | '15days' | '30days') {
    const params = filter ? { filter } : {};
    const { data } = await api.get<{ success: boolean; count: number; data: MessageLog[] }>(
      '/messaging/logs',
      { params }
    );
    return data;
  },
};

