// ─── reviewHelpers.tsx ───────────────────────────────────────
// Shared constants, types, and UI atoms used across all Reviews pages.

import React from 'react';
import { Star } from 'lucide-react';

// ─── Platform & Sentiment Meta ────────────────────────────────
export const PLATFORM_META: Record<string, { color: string; icon: string; bg: string }> = {
  google:     { color: '#ea4335', icon: 'G',  bg: 'rgba(234,67,53,0.12)' },
  facebook:   { color: '#1877f2', icon: 'f',  bg: 'rgba(24,119,242,0.12)' },
  trustpilot: { color: '#00b67a', icon: '★', bg: 'rgba(0,182,122,0.12)' },
  website:    { color: '#a855f7', icon: '⊕', bg: 'rgba(168,85,247,0.12)' },
};

export const SENTIMENT_META: Record<string, { color: string; label: string; bg: string }> = {
  positive: { color: '#10b981', label: 'Positive', bg: 'rgba(16,185,129,0.12)' },
  negative: { color: '#ef4444', label: 'Negative', bg: 'rgba(239,68,68,0.12)' },
  neutral:  { color: '#f59e0b', label: 'Neutral',  bg: 'rgba(245,158,11,0.12)' },
  mixed:    { color: '#6366f1', label: 'Mixed',    bg: 'rgba(99,102,241,0.12)' },
};

// ─── Shared UI Atoms ──────────────────────────────────────────
export const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 14 }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} size={size} fill={s <= rating ? '#f59e0b' : 'none'} color={s <= rating ? '#f59e0b' : '#374151'} />
    ))}
  </div>
);

export const PlatformBadge: React.FC<{ platform: string }> = ({ platform }) => {
  const meta = PLATFORM_META[platform] || PLATFORM_META.website;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: meta.bg, color: meta.color,
      padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700,
    }}>
      <span style={{ fontSize: '11px' }}>{meta.icon}</span>
      {platform.charAt(0).toUpperCase() + platform.slice(1)}
    </span>
  );
};

export const SentimentBadge: React.FC<{ sentiment: string }> = ({ sentiment }) => {
  const meta = SENTIMENT_META[sentiment] || SENTIMENT_META.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: meta.bg, color: meta.color,
      padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600,
    }}>
      {sentiment === 'positive' ? '😊' : sentiment === 'negative' ? '😞' : '😐'} {meta.label}
    </span>
  );
};

// ─── Customer Type (used by Customers page) ───────────────────
export interface Customer {
  _id:          string;
  userId:       string;
  brandId:      string;
  name:         string;
  email:        string;
  phone?:       string;
  reviewStatus: 'pending' | 'sent' | 'completed';
  source:       'manual' | 'csv' | 'website' | 'shopify' | 'referral';
  status:       'pending' | 'active' | 'inactive';
  createdAt?:   string;
  updatedAt?:   string;
}

export const SOURCE_META: Record<string, { color: string; bg: string }> = {
  Csv:     { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  Manual:  { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  Shopify: { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
};