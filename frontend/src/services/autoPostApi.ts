import { api } from '../api/axios';

export interface AutoPostTopic {
  _id: string;
  userId: string;
  workspaceId: string;
  topic: string;
  context?: string;
  tone: string;
  platforms: string[];
  frequency: string;
  preferredTime: string;
  timezone: string;
  isActive: boolean;
  lastPostedAt?: string;
  totalPostsGenerated: number;
  hashtags?: string[];
  language?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAutoPostTopicPayload {
  topic: string;
  context?: string;
  tone?: string;
  platforms: string[];
  frequency?: string;
  preferredTime?: string;
  timezone?: string;
  hashtags?: string[];
  language?: string;
  workspaceId?: string;
}

export const getAutoPostTopics = async (workspaceId?: string): Promise<AutoPostTopic[]> => {
  const query = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : '';
  const res = await api.get(`/social/auto-post${query}`);
  return res.data.data;
};

export const createAutoPostTopic = async (payload: CreateAutoPostTopicPayload): Promise<AutoPostTopic> => {
  const res = await api.post('/social/auto-post', payload);
  return res.data.data;
};

export const updateAutoPostTopic = async (
  id: string,
  payload: Partial<CreateAutoPostTopicPayload>,
): Promise<AutoPostTopic> => {
  const res = await api.patch(`/social/auto-post/${id}`, payload);
  return res.data.data;
};

export const toggleAutoPostTopic = async (id: string): Promise<AutoPostTopic> => {
  const res = await api.patch(`/social/auto-post/${id}/toggle`);
  return res.data.data;
};

export const deleteAutoPostTopic = async (id: string): Promise<{ deleted: boolean }> => {
  const res = await api.delete(`/social/auto-post/${id}`);
  return res.data.data;
};

export const previewAutoPostTopic = async (id: string): Promise<{ content: string }> => {
  const res = await api.post(`/social/auto-post/${id}/preview`);
  return res.data.data;
};

export const triggerAutoPostTopic = async (id: string): Promise<{ generatedContent: string; post: any }> => {
  const res = await api.post(`/social/auto-post/${id}/trigger`);
  return res.data.data;
};

export const generateAiContent = async (prompt: string, context?: string): Promise<string> => {
  const res = await api.post('/ai/generate', { prompt, context });
  return res.data.data;
};

export const generatePostFromImage = async (
  imageUrl: string,
  prompt?: string,
  tone?: string,
  platforms?: string[],
): Promise<string> => {
  const res = await api.post('/ai/generate-from-image', {
    imageUrl,
    prompt,
    tone,
    platforms,
  });
  return res.data.data;
};

