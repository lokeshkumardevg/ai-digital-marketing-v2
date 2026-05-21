export type SeoStoredData = {
  url: string;
  result: any;
  updatedAt: string;
};

const SEO_SESSION_KEY = 'seo_session_data_v1';

export const saveSeoData = (data: SeoStoredData): void => {
  try {
    sessionStorage.setItem(SEO_SESSION_KEY, JSON.stringify(data));
  } catch {
    // ignore quota / serialization errors
  }
};

export const getSeoData = (): SeoStoredData | null => {
  try {
    const raw = sessionStorage.getItem(SEO_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SeoStoredData;
  } catch {
    return null;
  }
};

export const clearSeoData = (): void => {
  try {
    sessionStorage.removeItem(SEO_SESSION_KEY);
  } catch {
    // ignore
  }
};

