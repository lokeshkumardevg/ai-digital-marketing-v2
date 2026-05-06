export type AdPlatform = 'meta' | 'google' | 'twitter' | 'linkedin';

export interface PlatformConfig {
  id: AdPlatform;
  label: string;
  icon: string;
  color: string;
  bgColor?: string;
  description?: string;
  features?: string[];
  bestFor?: string;
}

export const PLATFORM_CONFIG: Record<AdPlatform, PlatformConfig> = {
  meta: {
    id: 'meta',
    label: 'Meta Ads',
    icon: '𝕄',
    color: '#1877f2',
    bgColor: 'rgba(24, 119, 242, 0.05)',
    description: 'Facebook & Instagram',
    features: ['2.9B+ users', 'Visual ads', 'Interest targeting'],
    bestFor: 'B2C & Brand'
  },
  google: {
    id: 'google',
    label: 'Google Ads',
    icon: 'G',
    color: '#ea4335',
    bgColor: 'rgba(234, 67, 53, 0.05)',
    description: 'Search, Display, YouTube',
    features: ['8.5B searches', 'Intent targeting', 'Display network'],
    bestFor: 'Lead Gen'
  },
  twitter: {
    id: 'twitter',
    label: 'X Ads',
    icon: '𝕏',
    color: '#000000',
    bgColor: 'rgba(0, 0, 0, 0.05)',
    description: 'Trending & Viral Reach',
    features: ['600M+ users', 'Viral potential', 'Trend targeting'],
    bestFor: 'Awareness'
  },
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn Ads',
    icon: '💼',
    color: '#0a66c2',
    bgColor: 'rgba(10, 102, 194, 0.05)',
    description: 'Professional Network',
    features: ['1B+ professionals', 'B2B targeting', 'Decision makers'],
    bestFor: 'B2B & SaaS'
  }
};

export const getPlatformConfig = (platform: AdPlatform): PlatformConfig => {
  return PLATFORM_CONFIG[platform];
};

export const getAllPlatforms = (): PlatformConfig[] => {
  return Object.values(PLATFORM_CONFIG);
};