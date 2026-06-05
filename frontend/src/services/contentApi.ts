import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000'}/content`;

export interface FetchUrlImagesResponse {
  success: boolean;
  url: string;
  images: string[];
}

export interface GenerateReferenceCreativePayload {
  prompt: string;
  referenceImages: string[];
  productUrl?: string;
  size?: string;
  quality?: 'low' | 'medium' | 'high' | 'auto';
}

export const contentApi = {
  async fetchUrlImages(url: string) {
    const { data } = await axios.post<FetchUrlImagesResponse>(`${API_BASE}/fetch-url-images`, {
      url,
    });
    return data;
  },

  async generateReferenceCreative(payload: GenerateReferenceCreativePayload) {
    const { data } = await axios.post(`${API_BASE}/generate-reference-creative`, payload);
    return data;
  },
};