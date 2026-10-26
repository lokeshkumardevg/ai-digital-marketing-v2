// src/services/socialMediaApi.ts
import { api } from '../api/axios';

export interface UploadedMedia {
  url: string; // '/uploads/123.mp4' (relative to the backend)
  type: 'image' | 'video';
  size: number;
  name: string;
}

/** Uploads one image/video for a social post (POST /social/media, streamed to disk, videos up to 512 MB). */
export async function uploadSocialMedia(file: File, onProgress?: (percent: number) => void): Promise<UploadedMedia> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post('/social/media', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 0,
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return res.data.data as UploadedMedia;
}

const VIDEO_RE = /\.(mp4|mov|m4v|webm|avi|mkv)(\?.*)?$/i;
export const isVideoUrl = (u: string) => VIDEO_RE.test(u);

/** Turns '/uploads/x.png' into a link the browser can show */
export const mediaSrc = (u: string): string =>
  u.startsWith('/uploads/') ? `${(import.meta as any).env?.VITE_API_URL || ''}${u}` : u;
