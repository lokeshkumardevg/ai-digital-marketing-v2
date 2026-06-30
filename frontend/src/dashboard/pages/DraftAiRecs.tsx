import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  FileEdit, Sparkles, Plus, Trash2,
  ToggleLeft, ToggleRight, Image, PauseCircle, Send, CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react';

import { motion } from 'framer-motion';
import AdCampaignDashboard from '../components/Adcampaigndashboard';
/* ─── CONSTANTS ──────────────────────────────────────────── */
const API_BASE = import.meta.env.VITE_API_URL;
const PLATFORMS_FILTER = ['All', 'Meta', 'Google', 'X', 'LinkedIn'];

/* ─── TYPES ──────────────────────────────────────────────── */
type PlatformId = 'meta' | 'google' | 'x' | 'linkedin';
type LoadingState = 'publish' | 'draft' | null;
type ToastType = 'success' | 'error' | 'info';
type BillingCycle = 'monthly' | 'yearly';
type PlanId = 'free' | 'silver' | 'gold';
type View = 'list' | 'editor';

interface CampaignDoc {
  _id: string;
  userId?: string;
  campaignId?: string;
  name: string;
  platform: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  autoPublish?: boolean;
  data?: {
    audienceId?: string | null;
    caption?: string;
    cta?: string;
    image?: string | null;
    budget?: string;
    event?: string;
    schedule?: string;
    finalUrl?: string;
    location?: string;
    advantagePlus?: boolean;
  };
  aiGeneratedContent?: {
    headline?: string;
    primaryText?: string;
    description?: string;
    imageUrl?: string;
  };
  aiStrategy?: {
    performanceScore?: number;
    marketingStrategy?: string;
  };
  budgetDaily?: number;
}

interface DraftCard {
  id: string;
  name: string;
  platform: string;
  status: string;
  score: number;
  rec: string;
  components: string[];
  raw: CampaignDoc;
}

interface BrandDetails {
  brand?: { name?: string };
  name?: string;
  logoUrl?: string;
  assets?: { favicon?: string; images?: string[]; banners?: string[]; thumbnails?: string[] };
}

interface AdCopy {
  headlines: string[];
  primaryTexts: string[];
  callToAction: string;
}

interface ToastState { message: string; type: ToastType; }

/* ─── SEED DATA ─────────────────────────────────────────── */
const SEED = {
  event: 'Purchase', budget: '5.83 USD', schedule: 'May 08, 2026',
  location: 'India', advantagePlus: true,
  caption: 'Discover our latest campaign — built for results.',
  cta: 'Shop Now',
  estimatedAudience: '394,400,000 – 464,000,000+',
  headlines: ['Powerful Solutions for Every Business', 'Grow Your Brand Today', 'Results That Matter'],
  primaryTexts: ['Discover our latest campaign — built for results.', 'Affordable and eco-friendly solutions.'],
  demoImages: [
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80',
    'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80',
  ],
};

/* ─── PLATFORM CONFIG ────────────────────────────────────── */
const PLATFORM_LIST = [
  { id: 'meta' as PlatformId, name: 'Meta', color: '#60a5fa', bg: '#0d1f3c' },
  { id: 'google' as PlatformId, name: 'Google', color: '#34d399', bg: '#0d2a20' },
  { id: 'x' as PlatformId, name: 'X', color: '#93c5fd', bg: '#0d1f3c' },
  { id: 'linkedin' as PlatformId, name: 'LinkedIn', color: '#38bdf8', bg: '#0d1a2e' },
];

// Platform utility helpers

/* ─── STATUS UTILITIES ───────────────────────────────────── */
const normaliseStatus = (raw: string): string => (raw || 'draft').toLowerCase();

const statusStyle = (status: string): React.CSSProperties => {
  const s = normaliseStatus(status);
  const map: Record<string, React.CSSProperties> = {
    draft: { background: '#1c1a05', color: '#fbbf24', border: '1px solid #92400e' },
    published: { background: '#052010', color: '#34d399', border: '1px solid #065f46' },
    approved: { background: '#052010', color: '#34d399', border: '1px solid #065f46' },
    rejected: { background: '#200505', color: '#f87171', border: '1px solid #7f1d1d' },
    pending: { background: 'var(--bg-card)', color: '#a78bfa', border: '1px solid var(--glass-border)' },
  };
  return map[s] || map.draft;
};

/* ─── GLOBAL CSS ───────────────────────────────────────────── */
const DASH_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

  .dash-root {
    --grad: linear-gradient(135deg, #0665ff 50%, #0665ff 100%);
    --blue: #0665ff;
    --blue-lt: #071c4a;
    --blue-mid: #0a2460;
    --blue-bdr: #1a3a7a;
    --blue-dark: #0550d0;
    --cyan: #22d3ee;
    --cyan-lt: #061e28;
    --white: #e2eaff;
    --surface: var(--bg-elevated);
    --surface2: #0a1733;
    --card: #0d1e3a;
    --bdr: #1a2d50;
    --bdr2: #1e3660;
    --t1: #e2eaff;
    --t2: #8aaad8;
    --t3: #4a6090;
    --green: #34d399;
    --green-lt: #05201a;
    --green-bdr: #065f46;
    --purple: #818cf8;
    --purple-lt: #0f1040;
    --purple-bdr: #3730a3;
    --amber: #fbbf24;
    --amber-lt: #1c1a05;
    --red: #f87171;
    font-family: 'DM Sans', system-ui, sans-serif;
    background: var(--bg-primary);
    color: var(--t1);
    font-size: 13px;
    -webkit-font-smoothing: antialiased;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .dash-inner { display: flex; flex: 1 1 0; min-height: 0; overflow: hidden; }
  .dash-main { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; overflow: hidden; height: 100%; }
  .dash-scroll { flex: 1 1 0; min-height: 0; overflow-y: auto; padding: 0; background: var(--bg-primary); }
  .dash-root * { box-sizing: border-box; }
  .dash-root ::-webkit-scrollbar { width: 4px; height: 4px; }
  .dash-root ::-webkit-scrollbar-track { background: transparent; }
  .dash-root ::-webkit-scrollbar-thumb { background: #1a3a7a; border-radius: 4px; }

  .btn-back:hover { background: var(--surface2) !important; transform: translateX(-2px); }
  .btn-pub:hover:not(:disabled) { box-shadow: 0 4px 18px rgba(6,101,255,0.5); transform: translateY(-2px); }
  .btn-pub:active:not(:disabled) { transform: translateY(0); }
  .btn-draft:hover:not(:disabled) { background: var(--surface2) !important; transform: translateY(-1px); }
  .gen-btn:hover:not(:disabled) { opacity: 0.88; transform: scale(1.02); box-shadow: 0 4px 16px rgba(6,101,255,0.4); }
  .gen-btn:disabled { opacity: .4; cursor: not-allowed; }

  .tag-pill { cursor: pointer; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
  .tag-pill:hover { background: var(--blue-lt) !important; border-color: var(--blue-bdr) !important; transform: translateY(-1px); }
  .tag-pill.on { background: var(--blue-lt) !important; border-color: var(--blue) !important; color: #93c5fd !important; box-shadow: 0 0 0 3px rgba(6,101,255,0.15); }

  .img-th { cursor: pointer; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
  .img-th:hover { border-color: var(--blue) !important; transform: scale(1.06); box-shadow: 0 8px 20px rgba(0,0,0,0.4); }
  .img-th.sel { border-color: var(--cyan) !important; box-shadow: 0 0 0 3px rgba(34,211,238,0.25); }

  .hd-in:focus, .pt-ta:focus, .editable-input:focus { outline: none; border-color: var(--blue) !important; box-shadow: 0 0 0 3px rgba(6,101,255,0.2); }
  .add-btn:hover { background: var(--blue-lt) !important; border-color: var(--blue-bdr) !important; transform: scale(1.02); }
  .tb-sel:hover { border-color: var(--blue-bdr) !important; background: var(--blue-lt) !important; }

  .brand-asset-img { cursor: pointer; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); border-radius: 7px; overflow: hidden; border: 2px solid var(--bdr); }
  .brand-asset-img:hover { border-color: var(--blue) !important; transform: scale(1.04); box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
  .brand-asset-img.sel { border-color: var(--cyan) !important; box-shadow: 0 0 0 3px rgba(34,211,238,0.25); }

  .section-tab { cursor: pointer; padding: 5px 12px; border-radius: 20px; font-size: 10px; font-weight: 700; border: 1px solid var(--bdr); background: var(--surface2); color: var(--t3); transition: all 0.2s cubic-bezier(0.4,0,0.2,1); font-family: inherit; }
  .section-tab:hover { background: var(--blue-lt) !important; border-color: var(--blue-bdr) !important; color: #93c5fd !important; transform: translateY(-1px); }
  .section-tab.active { background: var(--blue-lt) !important; border-color: var(--blue) !important; color: #93c5fd !important; box-shadow: 0 0 0 2px rgba(6,101,255,0.15); }

  .editable-input { background: var(--surface); border: 1px solid var(--bdr); border-radius: 7px; padding: 6px 10px; color: var(--t1); font-size: 12px; font-family: inherit; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); width: 100%; }
  .editable-input:hover { border-color: var(--blue-bdr); }

  /* ── TOAST ── */
  .acd-toast { position: fixed; bottom: 24px; right: 24px; z-index: 99999; background: #052010; color: #34d399; padding: 12px 20px; border: 1.5px solid #065f46; border-radius: 12px; font-size: 12px; font-weight: 600; box-shadow: 0 8px 32px rgba(6,101,255,0.35); animation: toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; display: flex; align-items: center; gap: 10px; }
  .acd-toast.error { background: #200505; color: #f87171; border-color: #7f1d1d; }
  .acd-toast.info { background: #071c4a; color: #93c5fd; border-color: #1a3a7a; }

  /* ── ANIMATIONS ── */
  @keyframes toastIn { from { opacity: 0; transform: translateY(40px) scale(0.8); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes shimmer { 0% { background-position: -600px 0 } 100% { background-position: 600px 0 } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
  @keyframes slideInRight { from { opacity: 0; transform: translateX(32px); } to { opacity: 1; transform: none; } }
  @keyframes expandIn { from { opacity: 0; transform: translateY(-6px) scale(0.98); } to { opacity: 1; transform: none; } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes rowIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: none; } }
  @keyframes cardIn { from { opacity: 0; transform: translateY(18px) scale(0.97); } to { opacity: 1; transform: none; } }
  @keyframes scoreDash { from { stroke-dashoffset: 113; } }
  @keyframes glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(6,101,255,0); } 50% { box-shadow: 0 0 18px 4px rgba(6,101,255,0.22); } }
  @keyframes badgePop { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
  @keyframes tabSlide { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @keyframes statCount { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @keyframes iconBounce { 0%,100% { transform: translateY(0); } 40% { transform: translateY(-4px); } 70% { transform: translateY(-2px); } }
  @keyframes emptyFloat { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }

  .expanded-body { animation: expandIn 0.2s cubic-bezier(0.4,0,0.2,1); }
  .spinner { width: 13px; height: 13px; border: 2px solid #1a3a7a; border-top-color: var(--blue); border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
  .shimmer { background: linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-card) 50%, var(--bg-elevated) 75%); background-size: 800px 100%; animation: shimmer 1.4s infinite; }

  .fb-post, .google-ad, .x-post, .li-post { transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
  .fb-post:hover, .google-ad:hover, .x-post:hover, .li-post:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(6,101,255,0.2); }

  .plan-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); cursor: pointer; }
  .plan-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(6,101,255,0.25); }

  /* ── PLATFORM TABS ── */
  .platform-tab-btn { display: flex; align-items: center; gap: 7px; padding: 10px 20px; border: none; background: transparent; cursor: pointer; font-size: 13px; font-weight: 500; color: var(--t3); border-bottom: 2px solid transparent; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); font-family: inherit; white-space: nowrap; position: relative; }
  .platform-tab-btn:hover { color: var(--t1); background: var(--bg-elevated); }
  .platform-tab-btn.active { color: var(--t1); font-weight: 600; }
  .platform-tab-btn.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px; background: linear-gradient(135deg, #0665ff 50%, #22d3ee 100%); animation: tabSlide 0.25s cubic-bezier(0.4,0,0.2,1); transform-origin: left; }
  .platform-tab-btn .tab-icon { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease; }
  .platform-tab-btn:hover .tab-icon, .platform-tab-btn.active .tab-icon { transform: scale(1.15); }

  /* ── REC SECTION ── */
  .rec-section { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; margin: 16px 24px 0; overflow: hidden; transition: all 0.2s ease; animation: cardIn 0.45s cubic-bezier(0.4,0,0.2,1) both; }
  .rec-header { display: flex; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--glass-border); }
  .rec-header-left { flex: 1; }
  .rec-header-left h2 { margin: 0 0 2px; font-size: 15px; font-weight: 700; color: var(--t1); }
  .rec-header-left p { margin: 0; font-size: 12px; color: var(--t3); }
  .rec-stats { display: flex; align-items: center; gap: 0; }
  .rec-stat-box { display: flex; align-items: center; gap: 10px; padding: 6px 20px; border-left: 1px solid #1a2d50; transition: all 0.2s ease; }
  .rec-stat-box:hover { background: var(--bg-secondary); }
  .rec-stat-box .stat-num { font-size: 20px; font-weight: 700; color: var(--t1); line-height: 1; animation: statCount 0.5s ease both; }
  .rec-stat-box .stat-label { font-size: 11px; color: var(--t3); font-weight: 500; }

  .auto-pub-btn { display: flex; align-items: center; gap: 7px; padding: 7px 14px; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--bg-card); cursor: pointer; font-size: 12px; font-weight: 600; color: var(--t1); font-family: inherit; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
  .auto-pub-btn:hover { background: var(--bg-secondary); transform: translateY(-1px); box-shadow: 0 2px 12px rgba(6,101,255,0.2); }
  .pause-btn { display: flex; align-items: center; gap: 5px; padding: 7px 14px; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--bg-card); cursor: pointer; font-size: 12px; font-weight: 600; color: var(--t3); font-family: inherit; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); margin-left: 8px; }
  .pause-btn:hover { background: #200505; color: #f87171; border-color: #7f1d1d; transform: translateY(-1px); }

  /* ── EMPTY STATE ── */
  .rec-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }
  .rec-empty-icons { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; justify-content: center; }
  .rec-empty-icon-item { display: flex; flex-direction: column; align-items: center; gap: 6px; transition: all 0.2s ease; animation: emptyFloat 3s ease-in-out infinite; }
  .rec-empty-icon-item:nth-child(2) { animation-delay: 0.3s; }
  .rec-empty-icon-item:nth-child(3) { animation-delay: 0.6s; }
  .rec-empty-icon-item:nth-child(4) { animation-delay: 0.9s; }
  .rec-empty-icon-item:nth-child(5) { animation-delay: 1.2s; }
  .rec-empty-icon-item:nth-child(6) { animation-delay: 0.45s; }
  .rec-empty-icon-item:nth-child(7) { animation-delay: 0.75s; }
  .rec-empty-icon-item:nth-child(8) { animation-delay: 1.05s; }
  .rec-empty-icon-item:hover { transform: translateY(-4px) scale(1.08); }
  .rec-empty-icon-circle { width: 48px; height: 48px; border-radius: 50%; border: 1.5px solid #1a2d50; display: flex; align-items: center; justify-content: center; background: var(--bg-secondary); transition: all 0.25s ease; }
  .rec-empty-icon-item:hover .rec-empty-icon-circle { border-color: #0665ff; background: #071c4a; box-shadow: 0 0 16px rgba(6,101,255,0.25); }
  .rec-empty-icon-label { font-size: 11px; color: var(--t3); font-weight: 500; }
  .rec-empty-text { text-align: center; font-size: 13px; color: var(--t2); line-height: 1.7; max-width: 480px; }
  .rec-empty-text strong { color: var(--t1); }

  /* ── DRAFTS SECTION ── */
  .drafts-section { background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; margin: 16px 24px 24px; overflow: hidden; animation: cardIn 0.55s cubic-bezier(0.4,0,0.2,1) both; animation-delay: 0.08s; }
  .drafts-header { padding: 16px 20px; border-bottom: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: space-between; }
  .drafts-header h2 { margin: 0; font-size: 15px; font-weight: 700; color: var(--t1); }

  /* ── TABLE ── */
  .drafts-table { width: 100%; border-collapse: collapse; }
  .drafts-table th { padding: 10px 16px; text-align: left; font-size: 11.5px; font-weight: 600; color: var(--t3); background: var(--bg-elevated); border-bottom: 1px solid var(--glass-border); white-space: nowrap; }
  .drafts-table td { padding: 14px 16px; font-size: 13px; color: var(--t1); border-bottom: 1px solid #0d1e3a; vertical-align: middle; transition: background 0.15s ease; }
  .drafts-table tr:last-child td { border-bottom: none; }
  .drafts-table tr.draft-row { animation: rowIn 0.35s cubic-bezier(0.4,0,0.2,1) both; }
  .drafts-table tr.draft-row:hover td { background: var(--bg-secondary); }
  .drafts-table tr.draft-row:hover td:first-child { border-left: 2px solid #0665ff; }

  /* ── DRAFT CARDS (mobile) ── */
  .draft-card-mobile { background: var(--bg-secondary); border: 1px solid var(--glass-border); border-radius: 12px; padding: 14px; animation: cardIn 0.38s cubic-bezier(0.4,0,0.2,1) both; transition: all 0.2s ease; }
  .draft-card-mobile:hover { border-color: #1e3660; box-shadow: 0 4px 20px rgba(6,101,255,0.12); transform: translateY(-2px); }
  .draft-card-mobile:hover { border-left: 2px solid #0665ff; }

  /* ── SCORE RING ── */
  .score-ring { position: relative; width: 44px; height: 44px; flex-shrink: 0; }
  .score-ring svg { position: absolute; inset: 0; transform: rotate(-90deg); }
  .score-ring svg circle.ring-fg { animation: scoreDash 1s cubic-bezier(0.4,0,0.2,1) both; }
  .score-ring .score-val { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; }

  /* ── MISC CELLS ── */
  .queue-plus-btn { width: 28px; height: 28px; border-radius: 6px; border: 1.5px dashed #1a2d50; background: var(--bg-elevated); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--t3); transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
  .queue-plus-btn:hover { border-color: #0665ff; color: #93c5fd; background: #071c4a; transform: scale(1.1); box-shadow: 0 0 10px rgba(6,101,255,0.2); }

  .campaign-name-cell { font-size: 12.5px; font-weight: 600; color: var(--t1); line-height: 1.4; max-width: 200px; }
  .campaign-name-cell span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .creative-thumb { width: 40px; height: 34px; border-radius: 6px; object-fit: cover; border: 1.5px solid #1a2d50; transition: all 0.2s ease; }
  .creative-thumb:hover { transform: scale(1.15) translateY(-2px); z-index: 10; box-shadow: 0 6px 16px rgba(6,101,255,0.4); }
  .creative-thumb-stack { display: flex; align-items: center; }
  .creative-thumb-stack .creative-thumb:not(:first-child) { margin-left: -10px; border: 2px solid var(--bg-card); }

  .action-btn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--glass-border); background: var(--bg-elevated); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--t3); transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
  .action-btn:hover { background: var(--bg-elevated); color: var(--t1); border-color: #1e3660; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
  .action-btn.danger:hover { background: #200505; color: #f87171; border-color: #7f1d1d; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(248,113,113,0.2); }
  .action-btn.primary:hover { background: #071c4a; color: #93c5fd; border-color: #1a3a7a; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(6,101,255,0.2); }

  .audience-cell { font-size: 12px; color: var(--t2); max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .budget-cell { font-size: 13px; font-weight: 600; color: var(--t1); }
  .product-cell { font-size: 12px; color: #93c5fd; text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px; display: block; transition: all 0.2s ease; }
  .product-cell:hover { color: #22d3ee; text-decoration: underline; }
  .time-cell { font-size: 11.5px; color: var(--t3); white-space: nowrap; }

  /* ── STATUS BADGE ANIMATED ── */
  .status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 10.5px; font-weight: 700; animation: badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
  .status-badge .dot { width: 6px; height: 6px; border-radius: 50%; animation: pulse 2s ease-in-out infinite; }

  /* ── TOGGLE BUTTON ── */
  .auto-toggle-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0 10px; height: 30px; border-radius: 6px; border: 1px solid var(--glass-border); background: var(--bg-elevated); cursor: pointer; font-size: 11px; font-weight: 600; min-width: 92px; font-family: inherit; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
  .auto-toggle-btn:hover { transform: translateY(-1px); }
  .auto-toggle-btn.on { background: #071c4a; border-color: #1a3a7a; color: #93c5fd; box-shadow: 0 0 10px rgba(6,101,255,0.15); }
  .auto-toggle-btn.off { color: var(--t3); }
  .auto-toggle-btn.on:hover { box-shadow: 0 0 16px rgba(6,101,255,0.3); }
  .auto-toggle-btn.off:hover { background: var(--bg-elevated); color: var(--t2); }

  /* ── SKELETON LOADER ── */
  .skeleton-row td { padding: 14px 16px; }
  .sk { border-radius: 6px; background: linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-card) 50%, var(--bg-elevated) 75%); background-size: 600px 100%; animation: shimmer 1.4s infinite; display: inline-block; }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .rec-section, .drafts-section { margin: 12px 12px 0; }
    .drafts-section { margin-bottom: 16px; }
    .rec-header { flex-direction: column; align-items: flex-start; gap: 12px; }
    .rec-stats { flex-wrap: wrap; border-left: none; padding-left: 0; }
    .rec-stat-box { border-left: none; padding: 6px 12px 6px 0; }
    .platform-tab-btn { padding: 10px 12px; font-size: 12px; }
    .drafts-header { flex-direction: column; align-items: flex-start; gap: 8px; }
    .draft-cards-grid { display: flex; flex-direction: column; gap: 10px; padding: 12px; }
  }
  @media (min-width: 769px) {
    .draft-cards-grid { display: none !important; }
    .table-wrapper { display: block !important; }
  }
  @media (max-width: 768px) {
    .table-wrapper { display: none !important; }
    .draft-cards-grid { display: flex !important; }
  }

  /* ── GLOW ON PUBLISH ── */
  .pub-glow { animation: glow 2s ease-in-out infinite; }
`;

/* ─── SMALL SHARED COMPONENTS ────────────────────────────── */
const I = {
  Settings: () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 10a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.4" /><path d="M13.5 8a5.5 5.5 0 01-.1 1l1.4 1.1-1.5 2.6-1.7-.7a5.5 5.5 0 01-1.7 1l-.3 1.8h-3l-.3-1.8a5.5 5.5 0 01-1.7-1l-1.7.7L1.2 10.1 2.6 9A5.5 5.5 0 012.5 8a5.5 5.5 0 01.1-1L1.2 5.9l1.5-2.6 1.7.7a5.5 5.5 0 011.7-1L6.4 1.3h3l.3 1.7a5.5 5.5 0 011.7 1l1.7-.7 1.5 2.6-1.4 1.1a5.5 5.5 0 01.1 1z" stroke="currentColor" strokeWidth="1.3" /></svg>,
  Users: () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.4" /><path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>,
  Sparkle: () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 2v3M8 11v3M2 8h3M11 8h3M3.8 3.8l2 2M10.2 10.2l2 2M10.2 3.8l-2 2M5.8 10.2l-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  Upload: () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 10V4M5.5 6.5L8 4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><rect x="2" y="12" width="12" height="1.5" rx=".75" fill="currentColor" /></svg>,
  Back: () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Check: () => <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Lock: () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" /><path d="M5 7V5.5a3 3 0 016 0V7" stroke="currentColor" strokeWidth="1.4" /></svg>,
};

const card = (ex: React.CSSProperties = {}): React.CSSProperties => ({
  background: 'var(--bg-card)',
  border: '1px solid var(--glass-border)',
  borderRadius: 14,
  padding: 16,
  position: 'relative',
  transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
  ...ex,
});

const sLabel = (color = '#8aaad8'): React.CSSProperties => ({
  fontSize: 10,
  fontWeight: 700,
  color,
  textTransform: 'uppercase',
  letterSpacing: '.7px',
  marginBottom: 10,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
});

/* ─── SCORE RING ─────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r; // ~113
  const offset = circ - (score / 100) * circ;
  const textColor = score >= 70 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171';
  return (
    <div className="score-ring">
      <svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#1a2d50" strokeWidth="3.5" />
        <circle
          className="ring-fg"
          cx="22" cy="22" r={r}
          fill="none"
          stroke={textColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="score-val" style={{ color: textColor }}>{score}</div>
    </div>
  );
}

/* ─── STATUS BADGE ───────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const s = normaliseStatus(status);
  const styles = statusStyle(s);
  const dotColors: Record<string, string> = {
    draft: '#fbbf24', published: '#34d399', approved: '#34d399',
    rejected: '#f87171', pending: '#a78bfa',
  };
  return (
    <span className="status-badge" style={styles}>
      <span className="dot" style={{ background: dotColors[s] || '#fbbf24' }} />
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}

/* ─── SKELETON ROWS ──────────────────────────────────────── */
function SkeletonRows() {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <tr key={i} className="skeleton-row">
          <td><span className="sk" style={{ width: 28, height: 28 }} /></td>
          <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span className="sk" style={{ width: 28, height: 28 }} /><span className="sk" style={{ width: 120, height: 14 }} /></div></td>
          <td><span className="sk" style={{ width: 60, height: 14 }} /></td>
          <td><span className="sk" style={{ width: 80, height: 14 }} /></td>
          <td><div style={{ display: 'flex', gap: -8 }}><span className="sk" style={{ width: 40, height: 34 }} /></div></td>
          <td><span className="sk" style={{ width: 90, height: 14 }} /></td>
          <td><span className="sk" style={{ width: 100, height: 14 }} /></td>
          <td><div style={{ display: 'flex', gap: 6 }}><span className="sk" style={{ width: 30, height: 30 }} /><span className="sk" style={{ width: 30, height: 30 }} /><span className="sk" style={{ width: 30, height: 30 }} /></div></td>
        </tr>
      ))}
    </>
  );
}

/* ─── SKELETON CARDS (mobile) ────────────────────────────── */
function SkeletonCards() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12 }}>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="sk" style={{ width: 32, height: 32, borderRadius: 8 }} />
            <span className="sk" style={{ flex: 1, height: 14 }} />
            <span className="sk" style={{ width: 50, height: 20, borderRadius: 10 }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <span className="sk" style={{ width: 80, height: 12 }} />
            <span className="sk" style={{ width: 60, height: 12 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── TOAST ──────────────────────────────────────────────── */
function Toast({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className={`acd-toast ${type}`} role="alert">
      {type === 'success' && <CheckCircle2 size={16} />}
      {type === 'error' && <AlertCircle size={16} />}
      {type === 'info' && <Sparkles size={16} />}
      {message}
    </div>
  );
}

function DisabledOverlay() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--glass-bg)', borderRadius: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, zIndex: 5, backdropFilter: 'blur(3px)', animation: 'fadeIn 0.2s ease' }}>
      <span style={{ color: 'var(--text-dim)' }}><I.Lock /></span>
      <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 500, textAlign: 'center', lineHeight: 1.6, padding: '0 16px' }}>Switch to Meta<br />to enable</span>
    </div>
  );
}

/* ─── PLATFORM ICONS ─────────────────────────────────────── */
const MetaIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6.897 4h-.024l-.031 2.615h.022c1.715 0 3.046 1.357 5.94 6.246l.175.297.012.02 1.62-2.438-.012-.019a48.763 48.763 0 0 0-1.098-1.716 28.01 28.01 0 0 0-1.175-1.629C10.413 4.932 8.812 4 6.896 4z" fill="url(#mi0)" />
    <path d="M6.873 4C4.95 4.01 3.247 5.258 2.02 7.17l2.254 1.231.011-.017c.718-1.083 1.61-1.774 2.568-1.785h.021L6.896 4h-.023z" fill="url(#mi1)" />
    <path d="M2.019 7.17l-.011.017C1.2 8.447.598 9.995.274 11.664l2.534.6.004-.022c.27-1.467.786-2.828 1.456-3.845l.011-.017L2.02 7.17z" fill="url(#mi2)" />
    <path d="M2.807 12.264l-2.533-.6-.005.022c-.177.918-.267 1.851-.269 2.786l2.598.233v-.023a12.591 12.591 0 0 1 .21-2.44z" fill="url(#mi3)" />
    <path d="M10.78 9.654c-1.528 2.35-2.454 3.825-2.454 3.825-2.035 3.2-2.739 3.917-3.871 3.917a1.545 1.545 0 0 1-1.186-.508l-2.017 1.744.014.017C2.01 19.518 3.058 20 4.356 20c1.963 0 3.374-.928 5.884-5.33l1.766-3.13a41.283 41.283 0 0 0-1.227-1.886z" fill="#0082FB" />
    <path d="M20.918 5.713C19.853 4.633 18.583 4 17.225 4c-1.432 0-2.637.787-3.723 1.944l1.382 1.24.016-.017c.715-.747 1.408-1.12 2.176-1.12.826 0 1.6.39 2.27 1.075l1.589-1.425-.016-.016z" fill="#0082FB" />
    <path d="M23.998 14.125c-.06-3.467-1.27-6.566-3.064-8.396l-1.588 1.424.015.016c1.35 1.392 2.277 3.98 2.361 6.971h2.292v-.022z" fill="url(#mi7)" />
    <path d="M18.309 16.515c-.55-.642-1.232-1.712-2.303-3.44l-1.396-2.336-.011-.02-1.62 2.438.012.02.989 1.668c.959 1.61 1.74 2.774 2.493 3.585l1.834-1.914a2.353 2.353 0 0 1-.014-.017z" fill="url(#mi12)" />
    <defs>
      <linearGradient id="mi0" x1="75.897%" x2="26.312%" y1="89.199%" y2="12.194%"><stop offset=".06%" stopColor="#0867DF" /><stop offset="85.91%" stopColor="#0064E0" /></linearGradient>
      <linearGradient id="mi1" x1="21.67%" x2="97.068%" y1="75.874%" y2="23.985%"><stop offset="13.23%" stopColor="#0064DF" /><stop offset="99.88%" stopColor="#0064E0" /></linearGradient>
      <linearGradient id="mi2" x1="38.263%" x2="60.895%" y1="89.127%" y2="16.131%"><stop offset="1.47%" stopColor="#0072EC" /><stop offset="68.81%" stopColor="#0064DF" /></linearGradient>
      <linearGradient id="mi3" x1="47.032%" x2="52.15%" y1="90.19%" y2="15.745%"><stop offset="7.31%" stopColor="#007CF6" /><stop offset="99.43%" stopColor="#0072EC" /></linearGradient>
      <linearGradient id="mi7" x1="43.762%" x2="57.602%" y1="6.235%" y2="98.514%"><stop offset="0%" stopColor="#0082FB" /><stop offset="99.95%" stopColor="#0081FA" /></linearGradient>
      <linearGradient id="mi12" x1="32.254%" x2="68.003%" y1="19.719%" y2="84.908%"><stop offset="27.65%" stopColor="#0867DF" /><stop offset="100%" stopColor="#0471E9" /></linearGradient>
    </defs>
  </svg>
);
const GoogleIcon = ({ size = 18 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 48 48"><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.6h12.4c-.5 2.8-2.1 5.2-4.5 6.8v5.6h7.3c4.3-3.9 6.9-9.7 6.9-16.5z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.6c-2.1 1.4-4.7 2.2-8.6 2.2-6.6 0-12.2-4.5-14.2-10.5H2.3v5.8C6.3 42.6 14.6 48 24 48z" /><path fill="#FBBC05" d="M9.8 28.3c-.5-1.4-.8-2.9-.8-4.3s.3-2.9.8-4.3v-5.8H2.3C.8 17.1 0 20.5 0 24s.8 6.9 2.3 10.1l7.5-5.8z" /><path fill="#EA4335" d="M24 9.5c3.7 0 7 1.3 9.6 3.8l7.2-7.2C36.9 2.1 31.5 0 24 0 14.6 0 6.3 5.4 2.3 13.9l7.5 5.8C11.8 14 17.4 9.5 24 9.5z" /></svg>);
const XIcon = ({ size = 16 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="#e2eaff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>);
const LinkedInIcon = ({ size = 18 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="#38bdf8"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>);

const PLATFORM_ICONS: Record<PlatformId, React.ReactNode> = {
  meta: <MetaIcon />, google: <GoogleIcon />, x: <XIcon />, linkedin: <LinkedInIcon />,
};
const PLATFORM_ICONS_SM: Record<PlatformId, React.ReactNode> = {
  meta: <MetaIcon size={14} />, google: <GoogleIcon size={14} />, x: <XIcon size={12} />, linkedin: <LinkedInIcon size={14} />,
};

const PLATFORM_TAB_ICONS: Record<string, React.ReactNode> = {
  All: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="#4a6090" /><rect x="9" y="1" width="6" height="6" rx="1.5" fill="#4a6090" /><rect x="1" y="9" width="6" height="6" rx="1.5" fill="#4a6090" /><rect x="9" y="9" width="6" height="6" rx="1.5" fill="#4a6090" /></svg>,
  Meta: <MetaIcon size={16} />,
  Google: <GoogleIcon size={16} />,
  X: <XIcon size={14} />,
  LinkedIn: <LinkedInIcon size={16} />,
};

/* ═══════════════════════════════════════════════════════════
   EDITOR SUBCOMPONENTS
   ═══════════════════════════════════════════════════════════ */

interface AdSettingCardProps {
  event: string; budget: string; schedule: string; finalUrl: string; enabled: boolean;
  onEventChange: (v: string) => void; onBudgetChange: (v: string) => void;
  onScheduleChange: (v: string) => void; onFinalUrlChange: (v: string) => void;
}
function AdSettingCard({ event, budget, schedule, finalUrl, enabled, onEventChange, onBudgetChange, onScheduleChange, onFinalUrlChange }: AdSettingCardProps) {
  return (
    <div style={{ ...card(), borderTop: '3px solid #0665ff' }}>
      <div style={sLabel('#93c5fd')}><I.Settings /> Ad Setting</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, fontWeight: 500 }}>Event</div>
          <input className="editable-input" value={event} onChange={e => onEventChange(e.target.value)} placeholder="e.g. Purchase" />
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, fontWeight: 500 }}>Budget</div>
          <input className="editable-input" value={budget} onChange={e => onBudgetChange(e.target.value)} placeholder="e.g. 5.83 USD" style={{ color: '#22d3ee', fontWeight: 700 }} />
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--glass-border)', margin: '10px 0' }} />
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, fontWeight: 500 }}>Schedule</div>
        <input className="editable-input" value={schedule} onChange={e => onScheduleChange(e.target.value)} placeholder="e.g. May 08, 2026" />
      </div>
      <div>
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, fontWeight: 500 }}>Final URL</div>
        <input className="editable-input" value={finalUrl} onChange={e => onFinalUrlChange(e.target.value)} placeholder="https://yourbrand.com" style={{ color: '#22d3ee', fontSize: 11 }} />
      </div>
      {!enabled && <DisabledOverlay />}
    </div>
  );
}

interface TargetAudienceCardProps {
  location: string; advantagePlus: boolean; enabled: boolean;
  onLocationChange: (v: string) => void; onAdvantageToggle: () => void;
}
function TargetAudienceCard({ location, advantagePlus, enabled, onLocationChange, onAdvantageToggle }: TargetAudienceCardProps) {
  return (
    <div style={{ ...card(), borderTop: '3px solid #34d399' }}>
      <div style={sLabel('#34d399')}><I.Users /> Target Audience</div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, fontWeight: 500 }}>Location</div>
        <input className="editable-input" value={location} onChange={e => onLocationChange(e.target.value)} placeholder="e.g. United States" />
      </div>
      <div onClick={onAdvantageToggle} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: advantagePlus ? '#34d399' : 'var(--text-dim)', background: advantagePlus ? 'var(--success)' : 'var(--bg-elevated)', border: `1px solid ${advantagePlus ? 'var(--success)' : 'var(--glass-border)'}`, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)', userSelect: 'none' }}>
        {advantagePlus ? '✦' : '○'} Advantage+ {advantagePlus ? 'on' : 'off'}
      </div>
      {!enabled && <DisabledOverlay />}
    </div>
  );
}

/* ─── PLATFORM PREVIEWS ──────────────────────────────────── */
interface PreviewProps { brandName: string; logoUrl?: string; caption: string; cta: string; imageUrl?: string | null; }

function MetaPreview({ brandName, logoUrl, caption, cta, imageUrl }: PreviewProps) {
  return (
    <div className="fb-post" style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px 8px', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-secondary)', border: '2px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {logoUrl ? <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 15, fontWeight: 700, color: '#60a5fa' }}>{(brandName[0] ?? 'B').toUpperCase()}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{brandName}</div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Sponsored · 🌐</div>
        </div>
      </div>
      <div style={{ padding: '2px 14px 8px', fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{caption}</div>
      <div style={{ width: '100%', aspectRatio: '1.91/1', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {imageUrl ? <img src={imageUrl} alt="Ad" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 11, color: '#1a3a7a' }}>Upload or generate image</span>}
      </div>
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-elevated)', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{caption}</div>
        <button style={{ background: 'linear-gradient(135deg, #0665ff 50%, #22d3ee 100%)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{cta}</button>
      </div>
      <div style={{ display: 'flex', borderTop: '1px solid var(--glass-border)' }}>
        {['👍 Like', '💬 Comment', '↗ Share'].map(l => <button key={l} style={{ flex: 1, fontSize: 12, color: 'var(--text-dim)', fontWeight: 500, cursor: 'pointer', padding: '10px 4px', background: 'none', border: 'none', fontFamily: 'inherit' }}>{l}</button>)}
      </div>
    </div>
  );
}
function GooglePreview({ caption, imageUrl }: PreviewProps) {
  return (
    <div className="google-ad" style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ background: '#34a853', color: 'var(--text-primary)', fontSize: 9, padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>Ad</span><span>brandname.com</span></div>
      <div style={{ fontSize: 16, color: '#22d3ee', fontWeight: 500, marginBottom: 4, lineHeight: 1.4 }}>{caption?.slice(0, 60) || 'Powerful Solutions — Official Site'}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{caption}</div>
      {imageUrl && <img src={imageUrl} alt="Ad" style={{ width: '100%', aspectRatio: '1.91/1', objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />}
    </div>
  );
}
function XPreview({ brandName, logoUrl, caption, cta, imageUrl }: PreviewProps) {
  return (
    <div className="x-post" style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: 14 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {logoUrl ? <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{(brandName[0] ?? 'B').toUpperCase()}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3, color: 'var(--text-primary)' }}>{brandName} <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>· Promoted</span></div>
          <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 10, color: 'var(--text-secondary)' }}>{caption}</div>
          {imageUrl ? <img src={imageUrl} alt="Ad" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 12, marginBottom: 10 }} /> : <div style={{ width: '100%', aspectRatio: '16/9', background: 'var(--bg-elevated)', borderRadius: 12, marginBottom: 10, border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'var(--text-dim)', fontSize: 24 }}>🖼</span></div>}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>brandname.com</span>
            <button style={{ background: 'linear-gradient(135deg, #0665ff 50%, #22d3ee 100%)', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{cta}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
function LinkedInPreview({ brandName, logoUrl, caption, cta, imageUrl }: PreviewProps) {
  return (
    <div className="li-post" style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px 8px', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {logoUrl ? <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8' }}>{(brandName[0] ?? 'B').toUpperCase()}</span>}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{brandName}</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Sponsored · <span style={{ color: '#38bdf8' }}>Follow</span></div>
        </div>
      </div>
      <div style={{ padding: '4px 14px 10px', fontSize: 13, lineHeight: 1.65, color: 'var(--text-secondary)' }}>{caption}</div>
      {imageUrl ? <img src={imageUrl} alt="Ad" style={{ width: '100%', aspectRatio: '1.91/1', objectFit: 'cover', display: 'block' }} /> : <div style={{ width: '100%', aspectRatio: '1.91/1', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'var(--text-dim)', fontSize: 32 }}>🖼</span></div>}
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)' }}>
        <div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{brandName}</div><div style={{ fontSize: 11, color: 'var(--text-dim)' }}>brandname.com</div></div>
        <button style={{ background: 'transparent', color: '#38bdf8', border: '1.5px solid #38bdf8', borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{cta}</button>
      </div>
    </div>
  );
}

function PlatformPreview({ platformId, brandName, logoUrl, caption, cta, imageUrl, estimatedAudience }: { platformId: PlatformId; brandName: string; logoUrl?: string; caption: string; cta: string; imageUrl?: string | null; estimatedAudience: string }) {
  const previews: Record<PlatformId, React.ReactNode> = {
    meta: <MetaPreview brandName={brandName} logoUrl={logoUrl} caption={caption} cta={cta} imageUrl={imageUrl} />,
    google: <GooglePreview brandName={brandName} caption={caption} cta={cta} imageUrl={imageUrl} />,
    x: <XPreview brandName={brandName} logoUrl={logoUrl} caption={caption} cta={cta} imageUrl={imageUrl} />,
    linkedin: <LinkedInPreview brandName={brandName} logoUrl={logoUrl} caption={caption} cta={cta} imageUrl={imageUrl} />,
  };
  const meta = {
    meta: { label: 'Meta Ads Feed', color: '#60a5fa' },
    google: { label: 'Google Search Ad', color: '#34d399' },
    x: { label: 'X Promoted Post', color: '#93c5fd' },
    linkedin: { label: 'LinkedIn Sponsored', color: '#38bdf8' },
  }[platformId];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.7px' }}>{meta.label}</span>
        <span style={{ fontSize: 10, background: 'var(--bg-secondary)', color: meta.color, padding: '2px 10px', borderRadius: 20, fontWeight: 700, border: `1px solid var(--glass-border)` }}>Ad 1</span>
      </div>
      {previews[platformId]}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#22d3ee', marginBottom: 6 }}>Est. audience: {estimatedAudience}</div>
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 6, background: 'linear-gradient(135deg, #0665ff 50%, #22d3ee 100%)', width: '40%' }} />
        </div>
      </div>
    </div>
  );
}

/* ─── CREATIVE STUDIO ─────────────────────────────────────── */
type ImageTab = 'brand' | 'ai' | 'upload';
interface CreativeStudioProps {
  brandName: string; adCopy: AdCopy; activePlatformId: PlatformId; brandAssetImages: string[];
  onHeadingChange: (v: string) => void; onSubheadingChange: (v: string) => void;
  onImageSelect: (url: string) => void; onCtaChange: (v: string) => void;
  initialCaption?: string; initialCta?: string; initialImage?: string | null;
}
function CreativeStudio({ adCopy, activePlatformId, brandAssetImages, onSubheadingChange, onImageSelect, onCtaChange, initialCaption, initialCta, initialImage }: CreativeStudioProps) {
  const [heading, setHeading] = useState(adCopy.headlines[0] || '');
  const [sub, setSub] = useState(initialCaption || adCopy.primaryTexts[0] || '');
  const [cta, setCta] = useState(initialCta || adCopy.callToAction || 'Shop Now');
  const [sIdx, setSIdx] = useState(0);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiImgs, setAiImgs] = useState<string[]>([]);
  const [selImg, setSelImg] = useState<string | null>(initialImage || null);
  const [loading, setLoading] = useState(false);
  const [aiErr, setAiErr] = useState<string | null>(null);
  const [imgTab, setImgTab] = useState<ImageTab>('brand');
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadedImgs, setUploadedImgs] = useState<string[]>([]);
  const enabled = activePlatformId === 'meta';

  const pickS = (s: string, i: number) => { setSub(s); setSIdx(i); onSubheadingChange(s); };
  const pickImg = (url: string) => { setSelImg(url); onImageSelect(url); };
  const handleCtaChange = (v: string) => { setCta(v); onCtaChange(v); };

  const generate = async () => {
    if (!aiPrompt.trim()) return;
    setLoading(true); setAiErr(null);
    try {
      const key = (window as any).__OPENAI_KEY || '';
      if (!key) throw new Error('No OpenAI key — set window.__OPENAI_KEY');
      const r = await fetch('https://api.openai.com/v1/images/generations', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify({ model: 'dall-e-3', prompt: aiPrompt, n: 1, size: '1024x1024' }) });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error?.message || `API ${r.status}`); }
      const d = await r.json(); const url = d.data[0]?.url || '';
      if (url) { setAiImgs(p => [url, ...p].slice(0, 6)); pickImg(url); }
    } catch (e) { setAiErr(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  };

  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = URL.createObjectURL(f);
    setUploadedImgs(p => [url, ...p].slice(0, 6)); pickImg(url); setImgTab('upload');
  };

  const emptyMsg = imgTab === 'brand' ? 'No brand assets.' : imgTab === 'ai' ? 'Generate an image above.' : 'Upload an image above.';

  return (
    <div style={{ ...card({ padding: 0 }), borderTop: '3px solid #818cf8', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={sLabel('#818cf8')}><I.Sparkle /> Creative Studio</div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Edit copy · Choose visuals</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Headline</div>
          <input className="hd-in" value={heading} onChange={e => setHeading(e.target.value)} style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all .15s' }} placeholder="Enter headline…" />
          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 3 }}>{heading.length}/125</div>
        </div>
        <div style={{ borderTop: '1px solid var(--glass-border)' }} />
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Primary Text</div>
          <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
            {adCopy.primaryTexts.map((s, i) => <button key={i} className={`tag-pill${sIdx === i ? ' on' : ''}`} onClick={() => pickS(s, i)} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, border: '1px solid var(--glass-border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontFamily: 'inherit' }}>P{i + 1}</button>)}
          </div>
          <textarea className="pt-ta" value={sub} onChange={e => { setSub(e.target.value); onSubheadingChange(e.target.value); }} rows={3} style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text-primary)', fontSize: 12, lineHeight: 1.65, resize: 'vertical', fontFamily: 'inherit', transition: 'all .15s' }} placeholder="Enter primary text…" />
        </div>
        <div style={{ borderTop: '1px solid var(--glass-border)' }} />
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Call to Action</div>
          <input className="hd-in" value={cta} onChange={e => handleCtaChange(e.target.value)} style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: '9px 12px', color: '#22d3ee', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', transition: 'all .15s' }} placeholder="e.g. Shop Now" />
        </div>
        <div style={{ borderTop: '1px solid var(--glass-border)' }} />
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>Ad Creative</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {(['brand', 'ai', 'upload'] as ImageTab[]).map(t => <button key={t} className={`section-tab${imgTab === t ? ' active' : ''}`} onClick={() => setImgTab(t)}>{t === 'brand' ? `Brand (${brandAssetImages.length})` : t === 'ai' ? 'AI Gen' : 'Uploaded'}</button>)}
          </div>
          {imgTab === 'brand' && (
            brandAssetImages.length === 0
              ? <div style={{ background: 'var(--bg-elevated)', border: '1.5px dashed #1a2d50', borderRadius: 10, padding: '20px 14px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 11 }}>{emptyMsg}</div>
              : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                {brandAssetImages.map((url, i) => <div key={i} className={`brand-asset-img${selImg === url ? ' sel' : ''}`} onClick={() => pickImg(url)} style={{ aspectRatio: '1', position: 'relative', overflow: 'hidden', border: `2px solid ${selImg === url ? '#22d3ee' : '#1a2d50'}`, cursor: 'pointer' }}><img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />{selImg === url && <div style={{ position: 'absolute', inset: 0, background: '#0665ff1a', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 4 }}><div style={{ width: 18, height: 18, borderRadius: '50%', background: '#0665ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><I.Check /></div></div>}</div>)}
              </div>
          )}
          {imgTab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: 12 }}>
                <textarea className="pt-ta" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder='e.g. "Eco-friendly solar panels at golden hour"' rows={2} style={{ width: '100%', background: '#0a0d2e', border: '1px solid var(--glass-border)', borderRadius: 7, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 11, lineHeight: 1.5, resize: 'vertical', fontFamily: 'inherit' }} />
                {aiErr && <div style={{ fontSize: 10, color: '#f87171', marginTop: 5, background: '#200505', padding: '5px 8px', borderRadius: 6 }}>{aiErr}</div>}
                <button className="gen-btn" onClick={generate} disabled={loading || !aiPrompt.trim()} style={{ marginTop: 8, width: '100%', background: 'linear-gradient(135deg, #0665ff 50%, #22d3ee 100%)', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {loading ? <><Loader2 size={14} className="spinner" /><span>Generating…</span></> : <><I.Sparkle /><span>Generate Image</span></>}
                </button>
              </div>
              {aiImgs.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>{aiImgs.map((url, i) => <div key={i} className={`img-th${selImg === url ? ' sel' : ''}`} onClick={() => pickImg(url)} style={{ aspectRatio: '1', borderRadius: 7, overflow: 'hidden', border: `2px solid ${selImg === url ? '#22d3ee' : '#1a2d50'}`, position: 'relative' }}><img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />{selImg === url && <div style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: '50%', background: '#0665ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><I.Check /></div>}</div>)}</div>}
              {aiImgs.length === 0 && !loading && <div style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center' }}>{emptyMsg}</div>}
            </div>
          )}
          {imgTab === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={upload} />
              <button onClick={() => fileRef.current?.click()} style={{ width: '100%', background: 'var(--bg-elevated)', border: '1.5px dashed #1e3660', borderRadius: 9, padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s ease' }}><I.Upload /> Upload from folder</button>
              {uploadedImgs.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>{uploadedImgs.map((url, i) => <div key={i} className={`img-th${selImg === url ? ' sel' : ''}`} onClick={() => pickImg(url)} style={{ aspectRatio: '1', borderRadius: 7, overflow: 'hidden', border: `2px solid ${selImg === url ? '#22d3ee' : '#1a2d50'}`, position: 'relative' }}><img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>)}</div>}
            </div>
          )}
        </div>
      </div>
      {!enabled && (
        <div style={{ position: 'absolute', inset: 0, background: 'var(--glass-bg)', borderRadius: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 10, backdropFilter: 'blur(4px)' }}>
          <I.Lock />
          <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 500, textAlign: 'center', padding: '0 24px', lineHeight: 1.7 }}>Creative Studio is only available<br />for the active platform.</span>
        </div>
      )}
    </div>
  );
}

/* ─── PUBLISH PLAN MODAL ─────────────────────────────────── */
function PublishPlanModal({ isOpen, onClose, onSelectPlan }: { isOpen: boolean; onClose: () => void; onSelectPlan: (id: PlanId) => void }) {
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const plans = [
    { id: 'free' as PlanId, name: 'Free', price: '$0', features: ['1 campaign/month', 'Basic analytics', 'Standard publishing'], color: 'var(--text-secondary)' },
    { id: 'silver' as PlanId, name: 'Silver', price: billing === 'monthly' ? '$29' : '$290', features: ['10 campaigns/month', 'Advanced analytics', 'Priority support', 'Unlimited AI images', 'A/B testing'], color: '#0665ff', popular: true },
    { id: 'gold' as PlanId, name: 'Gold', price: billing === 'monthly' ? '$79' : '$790', features: ['Unlimited campaigns', 'Real-time analytics', '24/7 support', 'Multi-platform', 'Custom integrations'], color: '#fbbf24' },
  ];
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--glass-bg)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, animation: 'fadeIn .2s ease' }} onClick={onClose}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 20, maxWidth: 780, width: '92%', maxHeight: '88vh', overflow: 'auto', padding: 28, position: 'relative', animation: 'slideUp .25s ease' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-dim)', width: 28, height: 28, borderRadius: 8, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}>✕</button>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, fontFamily: "'Space Grotesk',sans-serif", color: 'var(--text-primary)' }}>Choose Publishing Plan</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Select the plan that fits your campaign needs</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 40, padding: 4, border: '1px solid var(--glass-border)' }}>
            {(['monthly', 'yearly'] as BillingCycle[]).map(b => <button key={b} onClick={() => setBilling(b)} style={{ padding: '7px 22px', borderRadius: 32, border: 'none', background: billing === b ? 'linear-gradient(135deg, #0665ff 50%, #22d3ee 100%)' : 'transparent', color: billing === b ? '#fff' : '#8aaad8', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease' }}>{b.charAt(0).toUpperCase() + b.slice(1)}</button>)}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 14, marginBottom: 20 }}>
          {plans.map(plan => (
            <div key={plan.id} className="plan-card" onClick={() => onSelectPlan(plan.id)} style={{ border: `${(plan as any).popular ? '2px' : '1px'} solid ${(plan as any).popular ? plan.color + '55' : '#1a2d50'}`, borderRadius: 16, padding: 20, background: (plan as any).popular ? `${plan.color}10` : 'var(--bg-elevated)', position: 'relative' }}>
              {(plan as any).popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #0665ff 50%, #22d3ee 100%)', color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>Most Popular</div>}
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>{plan.name}</div>
                <div><span style={{ fontSize: 30, fontWeight: 800, color: plan.color }}>{plan.price}</span><span style={{ fontSize: 12, color: 'var(--text-dim)' }}>/{billing === 'monthly' ? 'mo' : 'yr'}</span></div>
              </div>
              <ul style={{ listStyle: 'none', margin: '0 0 16px', borderTop: '1px solid var(--glass-border)', paddingTop: 12 }}>
                {plan.features.map((f, i) => <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}><CheckCircle2 size={13} color={plan.color} />{f}</li>)}
              </ul>
              <button style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1.5px solid ${plan.color}`, background: (plan as any).popular ? 'linear-gradient(135deg, #0665ff 50%, #22d3ee 100%)' : 'transparent', color: (plan as any).popular ? '#fff' : plan.color, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease' }}>Select {plan.name}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── BOTTOM BAR ─────────────────────────────────────────── */
function BottomBar({ onBack, onPublish, onSaveDraft, loading, activePlatformName }: { onBack: () => void; onPublish: () => void; onSaveDraft: () => void; loading: LoadingState; activePlatformName: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--glass-border)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, flexWrap: 'wrap', gap: 8 }}>
      <button className="btn-back" onClick={onBack} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s ease' }}>
        <I.Back /> Back to Drafts
      </button>
      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Publishing to <span style={{ color: '#22d3ee', fontWeight: 600 }}>{activePlatformName}</span></div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className={`btn-pub${!loading ? ' pub-glow' : ''}`} onClick={onPublish} disabled={!!loading} style={{ background: 'linear-gradient(135deg, #0665ff 50%, #22d3ee 100%)', color: '#fff', border: 'none', padding: '8px 26px', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease', opacity: loading ? .7 : 1 }}>
          {loading === 'publish' ? 'Publishing...' : 'Publish'}
        </button>
        <button className="btn-draft" onClick={onSaveDraft} disabled={!!loading} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease', opacity: loading ? .7 : 1 }}>
          {loading === 'draft' ? 'Saving...' : 'Save Draft'}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CAMPAIGN EDITOR
   ═══════════════════════════════════════════════════════════ */
interface CampaignEditorProps {
  campaign: CampaignDoc;
  brandDetails?: BrandDetails;
  onBack: () => void;
  onSaved: () => void;
  showToast: (msg: string, type: ToastType) => void;
}

export function CampaignEditor({ campaign, brandDetails, onBack, onSaved, showToast }: CampaignEditorProps) {
  const brandName = brandDetails?.brand?.name || brandDetails?.name || campaign.name || 'Brand';
  const logoUrl = brandDetails?.logoUrl || brandDetails?.assets?.favicon || '';

  const collectBrandImages = (): string[] => {
    if (!brandDetails?.assets) return SEED.demoImages;
    const a = brandDetails.assets;
    const out: string[] = [];
    if (Array.isArray(a.images)) out.push(...a.images.filter(Boolean));
    if (Array.isArray(a.banners)) out.push(...a.banners.filter(Boolean));
    if (Array.isArray(a.thumbnails)) out.push(...a.thumbnails.filter(Boolean));
    return out.length > 0 ? out : SEED.demoImages;
  };

  const saved = campaign.data || {};
  const aiContent = campaign.aiGeneratedContent || {};

  const [activePid] = useState<PlatformId>((campaign.platform?.toLowerCase() as PlatformId) || 'meta');
  const [loading, setLoading] = useState<LoadingState>(null);
  const [showPlan, setShowPlan] = useState(false);

  const [adEvent, setAdEvent] = useState(saved.event || SEED.event);
  const [adBudget, setAdBudget] = useState(saved.budget || (campaign.budgetDaily ? `${campaign.budgetDaily} USD` : SEED.budget));
  const [adSchedule, setAdSchedule] = useState(saved.schedule || SEED.schedule);
  const [adFinalUrl, setAdFinalUrl] = useState(saved.finalUrl || '');
  const [adLocation, setAdLocation] = useState(saved.location || SEED.location);
  const [adAdvantage, setAdAdvantage] = useState<boolean>(saved.advantagePlus ?? SEED.advantagePlus);

  const [pvCaption, setPvCaption] = useState(
    saved.caption || aiContent.primaryText || aiContent.headline || SEED.caption
  );
  const [pvImage, setPvImage] = useState<string | null>(
    (saved.image && saved.image.trim() !== '') ? saved.image : (aiContent.imageUrl || null)
  );
  const [pvCta, setPvCta] = useState(saved.cta || SEED.cta);

  const activePlat = PLATFORM_LIST.find(p => p.id === activePid) || PLATFORM_LIST[0];
  const campaignTitle = campaign.name || `${brandName}_Campaign_${activePlat.name}`;

  const adCopy: AdCopy = {
    headlines: [aiContent.headline || SEED.headlines[0], ...SEED.headlines.slice(1)],
    primaryTexts: [pvCaption, ...SEED.primaryTexts.slice(1)],
    callToAction: pvCta,
  };

  const handleDraft = useCallback(async () => {
    setLoading('draft');
    try {
      const res = await fetch(`${API_BASE}/campaign/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign._id, name: campaignTitle, platform: activePid,
          data: { caption: pvCaption, cta: pvCta, image: pvImage, budget: adBudget, event: adEvent, schedule: adSchedule, finalUrl: adFinalUrl, location: adLocation, advantagePlus: adAdvantage },
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save draft');
      showToast(result.message || 'Draft saved!', 'success');
      onSaved();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to save draft', 'error');
    } finally { setLoading(null); }
  }, [campaign._id, campaignTitle, activePid, pvCaption, pvCta, pvImage, adBudget, adEvent, adSchedule, adFinalUrl, adLocation, adAdvantage, showToast, onSaved]);

  const handleSelectPlan = useCallback(async (planId: PlanId) => {
    setShowPlan(false);
    setLoading('publish');
    try {
      const res = await fetch(`${API_BASE}/campaign/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign._id, platform: activePid, planId,
          data: { caption: pvCaption, cta: pvCta, image: pvImage, budget: adBudget, event: adEvent, schedule: adSchedule, finalUrl: adFinalUrl, location: adLocation, advantagePlus: adAdvantage },
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Publish failed');
      // Also check result.success - Google API may return 200 but with success:false when API fails
      if (result.success === false) {
        const errMsg = result.error || result.message || 'Publish failed on platform API.';
        showToast(`❌ ${activePlat.name}: ${errMsg}`, 'error');
        return;
      }
      showToast(`✅ Published on ${activePlat.name}!`, 'success');
      onSaved();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Publish failed', 'error');
    } finally { setLoading(null); }
  }, [campaign._id, activePid, pvCaption, pvCta, pvImage, adBudget, adEvent, adSchedule, adFinalUrl, adLocation, adAdvantage, activePlat.name, showToast, onSaved]);

  return (
    <div className="dash-root" style={{ animation: 'slideInRight .25s ease' }}>
      <div style={{ display: 'flex', gap: 8, padding: '10px 16px', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-card)', alignItems: 'flex-end', flexWrap: 'wrap', flexShrink: 0, position: 'relative', opacity: activePid === 'meta' ? 1 : .35, pointerEvents: activePid === 'meta' ? 'auto' : 'none' }}>
        {['Ad Account', 'Page', 'Instagram', 'Pixel'].map(f => (
          <div key={f} style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 110 }}>
            <span style={{ fontSize: 9, color: '#60a5fa', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase' }}>{f}</span>
            <div className="tb-sel" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: '7px 10px', color: 'var(--text-dim)', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}><span>Select {f.toLowerCase()}</span><span style={{ fontSize: 10 }}>▾</span></div>
          </div>
        ))}
        {activePid !== 'meta' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text-dim)', background: 'var(--glass-bg)', backdropFilter: 'blur(2px)', zIndex: 2 }}>
            <I.Lock /> &nbsp;Switch to Meta to configure
          </div>
        )}
      </div>
      <div className="dash-inner">
        <div className="dash-main">
          <div className="dash-scroll">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 16px', padding: '9px 14px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 10, borderLeft: `4px solid ${activePlat.color}` }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{campaignTitle}</span>
              <span style={{ fontSize: 10, background: `${activePlat.color}18`, color: activePlat.color, padding: '2px 10px', borderRadius: 20, fontWeight: 700, border: `1px solid ${activePlat.color}33` }}>{activePlat.name}</span>
              <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'monospace' }}>ID: {campaign._id}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px,1fr) minmax(260px,1.1fr) minmax(200px,1fr)', gap: 14, padding: '0 16px 16px', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <AdSettingCard event={adEvent} budget={adBudget} schedule={adSchedule} finalUrl={adFinalUrl} enabled={activePid === 'meta'} onEventChange={setAdEvent} onBudgetChange={setAdBudget} onScheduleChange={setAdSchedule} onFinalUrlChange={setAdFinalUrl} />
                <TargetAudienceCard location={adLocation} advantagePlus={adAdvantage} enabled={activePid === 'meta'} onLocationChange={setAdLocation} onAdvantageToggle={() => setAdAdvantage(p => !p)} />
              </div>
              <PlatformPreview platformId={activePid} brandName={brandName} logoUrl={logoUrl} caption={pvCaption} cta={pvCta} imageUrl={pvImage} estimatedAudience={SEED.estimatedAudience} />
              <CreativeStudio brandName={brandName} adCopy={adCopy} activePlatformId={activePid} brandAssetImages={collectBrandImages()} onHeadingChange={() => { }} onSubheadingChange={setPvCaption} onImageSelect={setPvImage} onCtaChange={setPvCta} initialCaption={saved.caption || aiContent.primaryText} initialCta={saved.cta} initialImage={(saved.image && saved.image.trim() !== '') ? saved.image : (aiContent.imageUrl || null)} />
            </div>
          </div>
          <BottomBar onBack={onBack} onPublish={() => setShowPlan(true)} onSaveDraft={handleDraft} loading={loading} activePlatformName={activePlat.name} />
        </div>
      </div>
      <PublishPlanModal isOpen={showPlan} onClose={() => setShowPlan(false)} onSelectPlan={handleSelectPlan} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DRAFT LIST HELPERS
   ═══════════════════════════════════════════════════════════ */
function mapToCard(c: CampaignDoc): DraftCard {
  return {
    id: c._id,
    name: c.name || 'AI Campaign Concept',
    platform: (c.platform || 'meta').toLowerCase(),
    status: normaliseStatus(c.status),
    score: Math.floor(c.aiStrategy?.performanceScore ?? 0),
    rec: c.aiStrategy?.marketingStrategy || 'Add urgency CTA — "Limited time only!" to boost CTR',
    components: ['Image', 'Headline', 'Copy', 'CTA'],
    raw: c,
  };
}

/* ─── DRAFT MOBILE CARD ──────────────────────────────────── */
function DraftMobileCard({
  draft, images, onEdit, onToggleAuto, onPublish, onDelete,
}: {
  draft: DraftCard;
  images: string[];
  onEdit: () => void;
  onToggleAuto: () => void;
  onPublish: () => void;
  onDelete: () => void;
}) {
  const platConfig = PLATFORM_LIST.find(p => p.id === draft.platform) || PLATFORM_LIST[0];
  const d = draft.raw.data || {};
  const audience = d.advantagePlus ? 'Advantage+' : d.location || '—';

  return (
    <div className="draft-card-mobile">
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: platConfig.bg, border: `1px solid ${platConfig.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {PLATFORM_ICONS_SM[draft.platform as PlatformId] ?? <Image size={13} color={platConfig.color} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{draft.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{platConfig.name}</div>
        </div>
        <StatusBadge status={draft.status} />
      </div>

      {/* Creatives row */}
      {images.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {images.slice(0, 4).map((url, i) => (
            <img key={i} src={url} alt="" style={{ width: 48, height: 38, borderRadius: 6, objectFit: 'cover', border: '1.5px solid #1a2d50', flex: i === 0 ? '0 0 80px' : '0 0 48px' }} />
          ))}
        </div>
      )}

      {/* Meta row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
        {d.budget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>Budget</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{d.budget}</span>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>Audience</span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{audience}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>Score</span>
          <ScoreRing score={draft.score} />
        </div>
      </div>

      {d.finalUrl && (
        <a href={d.finalUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#93c5fd', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 10 }}>🔗 {d.finalUrl}</a>
      )}

      {/* Actions row */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid var(--glass-border)' }}>
        <button className={`auto-toggle-btn ${draft.raw?.autoPublish ? 'on' : 'off'}`} onClick={onToggleAuto}>
          {draft.raw?.autoPublish ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
          {draft.raw?.autoPublish ? 'Auto' : 'Manual'}
        </button>
        <button className="action-btn primary" title="Edit" onClick={onEdit} style={{ flex: 1 }}><FileEdit size={13} /></button>
        <button className="action-btn primary" title="Publish" onClick={onPublish} style={{ flex: 1 }}><Send size={13} /></button>
        <button className="action-btn danger" title="Delete" onClick={onDelete} style={{ flex: 1 }}><Trash2 size={13} /></button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT EXPORT
   ═══════════════════════════════════════════════════════════ */
export const DraftAiRecs: React.FC<{ brandDetails?: BrandDetails }> = ({ brandDetails }) => {
  const { user } = useSelector((state: any) => state.auth);

  const [view, setView] = useState<View>('list');
  const [selectedCampaign, setSelected] = useState<CampaignDoc | null>(null);
  const [activePlatform, setActivePlatform] = useState('All');
  const [drafts, setDrafts] = useState<DraftCard[]>([]);
  const [rawDocs, setRawDocs] = useState<CampaignDoc[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [autoPublish, setAutoPublish] = useState<Record<string, boolean>>({});
  const [globalAutoPublish, setGlobalAutoPublish] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((msg: string, type: ToastType = 'info') => {
    setToast({ message: msg, type });
  }, []);
  const clearToast = useCallback(() => setToast(null), []);

  const fetchDrafts = useCallback(() => {
    const userId = user?._id || user?.id;
    if (!userId) {
      setFetchError('User not logged in. Please refresh and try again.');
      setListLoading(false);
      return;
    }
    setListLoading(true);
    setFetchError(null);

    fetch(`${API_BASE}/campaign/draft/${userId}`)
      .then(async r => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.message || `Server error ${r.status}`);
        }
        return r.json();
      })
      .then((json: { success: boolean; message: string; data: CampaignDoc[] }) => {
        const arr: CampaignDoc[] = Array.isArray(json?.data) ? json.data : [];
        setRawDocs(arr);
        setDrafts(arr.map(mapToCard));
      })
      .catch((err: Error) => {
        setFetchError(err.message || 'Failed to load drafts');
        showToast(err.message || 'Failed to load drafts', 'error');
      })
      .finally(() => setListLoading(false));
  }, [user, showToast]);

  useEffect(() => { fetchDrafts(); }, [fetchDrafts]);

  const handleToggleAutoPublish = useCallback((campaignId: string) => {
    setDrafts(prev =>
      prev.map(draft =>
        draft.id === campaignId
          ? { ...draft, raw: { ...draft.raw, autoPublish: !draft.raw?.autoPublish } }
          : draft
      )
    );
    setAutoPublish(prev => ({ ...prev, [campaignId]: !prev[campaignId] }));
    showToast(`Auto-publish ${autoPublish[campaignId] ? 'disabled' : 'enabled'}`, 'success');
  }, [autoPublish, showToast]);

  const filtered = activePlatform === 'All'
    ? drafts
    : drafts.filter(d => d.platform === activePlatform.toLowerCase());

  const openEditor = (draftId: string) => {
    const raw = rawDocs.find(r => r._id === draftId);
    if (!raw) return;
    setSelected(raw);
    setView('editor');
  };

  const handleBack = () => {
    setView('list');
    setSelected(null);
    fetchDrafts();
  };

  /* ── EDITOR VIEW ── */
  if (view === 'editor' && selectedCampaign) {
    const draftPromoData = {
      platforms: selectedCampaign.platform ? selectedCampaign.platform.split(',') : ['meta'],
      budgetDaily: selectedCampaign.budgetDaily,
      budget: selectedCampaign.budgetDaily,
      event: selectedCampaign.data?.event,
    };
    
    return (
      <AdCampaignDashboard
        brandDetails={brandDetails}
        promoData={draftPromoData}
        campaignId={selectedCampaign._id}
        initialDraftData={selectedCampaign.data || {}}
        onBack={handleBack}
        onPublish={handleBack}
        onSaveDraft={handleBack}
      />
    );
  }

  /* ── LOADING ── */
  if (listLoading) {
    return (
      <>
        <style>{DASH_CSS}</style>
        <div style={{ minHeight: '100%', background: 'var(--bg-primary)', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
          <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--glass-border)', padding: '0 24px', display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
            {PLATFORMS_FILTER.map(p => (
              <button key={p} className="platform-tab-btn" style={{ color: 'var(--text-dim)' }}>
                <span className="tab-icon">{PLATFORM_TAB_ICONS[p]}</span>{p}
              </button>
            ))}
          </div>
          <div className="rec-section">
            <div className="rec-header">
              <div className="rec-header-left">
                <div className="sk" style={{ width: 140, height: 16, borderRadius: 6 }} />
                <div className="sk" style={{ width: 220, height: 12, borderRadius: 5, marginTop: 6 }} />
              </div>
            </div>
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 12 }}>Loading recommendations…</div>
          </div>
          <div className="drafts-section">
            <div className="drafts-header"><div className="sk" style={{ width: 160, height: 16, borderRadius: 6 }} /></div>
            <div style={{ overflowX: 'auto' }}>
              <table className="drafts-table">
                <thead><tr><th>Queues</th><th>Campaign</th><th>Daily budget</th><th>Audience</th><th>Creatives</th><th>Product</th><th>Update time</th><th>Actions</th></tr></thead>
                <tbody><SkeletonRows /></tbody>
              </table>
            </div>
            <SkeletonCards />
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  /* ── ERROR STATE ── */
  if (fetchError && drafts.length === 0) {
    return (
      <>
        <style>{DASH_CSS}</style>
        <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'var(--bg-primary)', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ fontSize: 40, animation: 'iconBounce 1s ease infinite' }}>⚠️</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f87171' }}>{fetchError}</div>
          <button onClick={fetchDrafts} style={{ padding: '9px 22px', borderRadius: 9, background: 'linear-gradient(135deg, #0665ff 50%, #22d3ee 100%)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s ease', fontFamily: 'inherit' }}>Retry</button>
        </div>
      </>
    );
  }

  /* ── LIST VIEW ── */
  const publishedCount = drafts.filter(d => d.status === 'published').length;

  const emptyIcons = [
    { label: 'Interest', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="#4a6090" strokeWidth="1.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M16.9 16.9l2.1 2.1M4.9 19.1l2.1-2.1M16.9 7.1l2.1-2.1" stroke="#4a6090" strokeWidth="1.5" strokeLinecap="round" /></svg> },
    { label: 'Creatives', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="#4a6090" strokeWidth="1.5" /><path d="M3 15l5-5 4 4 3-3 6 5" stroke="#4a6090" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="8.5" cy="8.5" r="1.5" fill="#4a6090" /></svg> },
    { label: 'Ad Copy', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 10h10M4 14h12M4 18h8" stroke="#4a6090" strokeWidth="1.5" strokeLinecap="round" /></svg> },
    { label: 'Age', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#4a6090" strokeWidth="1.5" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#4a6090" strokeWidth="1.5" strokeLinecap="round" /></svg> },
    { label: 'Gender', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="5" stroke="#4a6090" strokeWidth="1.5" /><path d="M16 6l5-5M21 6V1h-5" stroke="#4a6090" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M11 16v6M8 19h6" stroke="#4a6090" strokeWidth="1.5" strokeLinecap="round" /></svg> },
    { label: 'Locations', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.7 2 6 4.7 6 8c0 5 6 14 6 14s6-9 6-14c0-3.3-2.7-6-6-6z" stroke="#4a6090" strokeWidth="1.5" /><circle cx="12" cy="8" r="2" stroke="#4a6090" strokeWidth="1.5" /></svg> },
    { label: 'Products', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#4a6090" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="#4a6090" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { label: 'CTA', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 12h16M12 4l8 8-8 8" stroke="#4a6090" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  ];
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const statsBoxVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2, ease: "easeInOut" }
    },
    tap: {
      scale: 0.98
    }
  };

  const iconItemVariants = {
    hidden: { opacity: 0, y: 30, rotate: -10 },
    visible: (custom: any) => ({
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        duration: 0.5,
        delay: custom * 0.1,
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }),
    hover: {
      y: -5,
      rotate: 5,
      transition: { duration: 0.2 }
    }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };


  return (
    <>
      <style>{DASH_CSS}</style>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      <div style={{ minHeight: '100%', background: 'var(--bg-primary)', fontFamily: "'DM Sans',system-ui,sans-serif" }}>

        {/* ── Platform Tabs ── */}
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--glass-border)', padding: '0 24px', display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
          {PLATFORMS_FILTER.map(p => (
            <button
              key={p}
              className={`platform-tab-btn${activePlatform === p ? ' active' : ''}`}
              onClick={() => setActivePlatform(p)}
            >
              <span className="tab-icon">{PLATFORM_TAB_ICONS[p]}</span>
              {p}
            </button>
          ))}
        </div>

        {/* ── Recommended Ads Section ── */}
        <div className="rec-section">
          <motion.div
            className="rec-header"
            variants={containerVariants as any}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="rec-header-left" variants={itemVariants as any}>
              <motion.h2
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                Recommended Ads
              </motion.h2>
              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                Top campaigns recommended. Select one to view structure.
              </motion.p>
            </motion.div>

            <motion.div className="rec-stats" variants={itemVariants as any}>
              <motion.div
                className="rec-stat-box"
                variants={statsBoxVariants as any}
                whileHover="hover"
                whileTap="tap"
              >
                <div style={{ border: 'none', padding: '0 12px 0 0', gap: 8, display: 'flex', alignItems: 'center' }}>
                  <motion.div
                    style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                  <div>
                    <motion.div
                      className="stat-num"
                      animate={pulseAnimation}
                    >
                      0
                    </motion.div>
                    <div className="stat-label">Recommendations</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="rec-stat-box"
                variants={statsBoxVariants as any}
                whileHover="hover"
                whileTap="tap"
              >
                <motion.div
                  style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #065f46' }}
                  whileHover={{ scale: 1.1, rotate: -15 }}
                >
                  <Send size={15} color="#34d399" />
                </motion.div>
                <div>
                  <motion.div
                    className="stat-num"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.5 }}
                  >
                    {publishedCount}
                  </motion.div>
                  <div className="stat-label">Published</div>
                </div>
              </motion.div>

              <motion.div
                style={{ paddingLeft: 16, display: 'flex', alignItems: 'center', gap: 8 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <motion.button
                  className="auto-pub-btn"
                  onClick={() => {
                    const campaignsToPublish = drafts.filter(draft => draft.raw?.autoPublish);
                    if (campaignsToPublish.length === 0) {
                      showToast('Select at least one campaign for auto publish', 'info');
                      return;
                    }
                    setGlobalAutoPublish(p => !p);
                    showToast(`Auto-publish ${!globalAutoPublish ? 'enabled' : 'disabled'}`, 'success');
                  }}
                  style={{ color: globalAutoPublish ? '#22d3ee' : '#e2eaff' }}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={{ rotate: globalAutoPublish ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    {globalAutoPublish ? <ToggleRight size={18} color="#0665ff" /> : <ToggleLeft size={18} color="#4a6090" />}
                  </motion.div>
                  Auto-Publish
                </motion.button>

                <motion.button
                  className="pause-btn"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ x: [0, -2, 2, -2, 0] }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  <PauseCircle size={15} />
                  Pause
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="rec-empty"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            <motion.div
              className="rec-empty-icons"
              variants={containerVariants as any}
              initial="hidden"
              animate="visible"
            >
              {emptyIcons.map((item, index) => (
                <motion.div
                  key={item.label}
                  className="rec-empty-icon-item"
                  custom={index}
                  variants={iconItemVariants as any}
                  whileHover="hover"
                >
                  <motion.div
                    className="rec-empty-icon-circle"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {item.icon}
                  </motion.div>
                  <motion.span
                    className="rec-empty-icon-label"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {item.label}
                  </motion.span>
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              className="rec-empty-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <motion.strong
                animate={{ color: ['#60a5fa', '#a78bfa', '#60a5fa'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Wheedle.AI
              </motion.strong> monitors your first campaign for 24 hours, then uses AI-powered insights to recommend your next best campaigns.
              Switch on <motion.strong
                whileHover={{ scale: 1.05, display: 'inline-block' }}
              >
                Auto-publish ↗
              </motion.strong> to launch them automatically for maximum impact.
            </motion.p>
          </motion.div>
        </div>

        {/* ── Unpublished Drafts Section ── */}
        <div className="drafts-section">
          <div className="drafts-header">
            <h2>Unpublished Drafts</h2>
            <span style={{ fontSize: 12, color: 'var(--text-dim)', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', padding: '3px 10px', borderRadius: 20 }}>
              {filtered.length} draft{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)', fontSize: 13, animation: 'fadeIn 0.3s ease' }}>
              No drafts found for this platform.
            </div>
          ) : (
            <>
              {/* ── DESKTOP TABLE ── */}
              <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="drafts-table">
                  <thead>
                    <tr>
                      <th style={{ width: 48 }}>Queue</th>
                      <th>Campaign</th>
                      <th>Budget</th>
                      <th>Audience</th>
                      <th>Creatives</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((draft, idx) => {
                      const platConfig = PLATFORM_LIST.find(p => p.id === draft.platform) || PLATFORM_LIST[0];
                      const d = draft.raw.data || {};
                      const audience = d.advantagePlus ? 'Advantage+' : d.location || '—';
                      const draftImg = draft.raw.data?.image || draft.raw.aiGeneratedContent?.imageUrl;
                      const rawImages = [];
                      if (draftImg) rawImages.push(draftImg);
                      rawImages.push(
                        ...(brandDetails?.assets?.images || []),
                        ...(brandDetails?.assets?.banners || [])
                      );
                      const images = rawImages
                        .filter(Boolean)
                        .filter((img, idx, self) => self.indexOf(img) === idx)
                        .slice(0, 3);
                      if (images.length === 0) images.push(...SEED.demoImages.slice(0, 2));

                      return (
                        <tr key={draft.id} className="draft-row" style={{ animationDelay: `${idx * 0.06}s` }}>
                          <td style={{ textAlign: 'center' }}>
                            <button className="queue-plus-btn" title="Add to queue">
                              <Plus size={13} />
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 6, background: platConfig.bg, border: `1px solid ${platConfig.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {PLATFORM_ICONS[draft.platform as PlatformId] ?? <Image size={14} color={platConfig.color} />}
                              </div>
                              <div className="campaign-name-cell">
                                <span title={draft.name}>{draft.name}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="budget-cell">{d.budget || (draft.raw.budgetDaily ? `$${draft.raw.budgetDaily}` : '—')}</span>
                          </td>
                          <td>
                            <span className="audience-cell" title={audience}>{audience}</span>
                          </td>
                          <td>
                            <div className="creative-thumb-stack">
                              {images.slice(0, 3).map((url, i) => (
                                <img key={i} src={url} alt="" className="creative-thumb" />
                              ))}
                            </div>
                          </td>
                          <td>
                            <ScoreRing score={draft.score} />
                          </td>
                          <td>
                            <StatusBadge status={draft.status} />
                          </td>
                          <td>
                            <span className="time-cell">
                              {draft.raw.updatedAt
                                ? new Date(draft.raw.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
                                : '—'
                              }
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                              <button
                                className={`auto-toggle-btn ${draft.raw?.autoPublish ? 'on' : 'off'}`}
                                title={draft.raw?.autoPublish ? 'Auto Publish Enabled' : 'Enable Auto Publish'}
                                onClick={() => handleToggleAutoPublish(draft.id)}
                              >
                                {draft.raw?.autoPublish ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                                {draft.raw?.autoPublish ? 'Auto' : 'Manual'}
                              </button>
                              <button className="action-btn primary" title="Edit campaign" onClick={() => openEditor(draft.id)}>
                                <FileEdit size={13} />
                              </button>
                              <button className="action-btn primary" title="Publish" onClick={() => openEditor(draft.id)}>
                                <Send size={13} />
                              </button>
                              <button className="action-btn danger" title="Delete">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── MOBILE CARDS ── */}
              <div className="draft-cards-grid">
                {filtered.map((draft, idx) => {
                  const draftImg = draft.raw.data?.image || draft.raw.aiGeneratedContent?.imageUrl;
                  const rawImages = [];
                  if (draftImg) rawImages.push(draftImg);
                  rawImages.push(
                    ...(brandDetails?.assets?.images || []),
                    ...(brandDetails?.assets?.banners || [])
                  );
                  const images = rawImages
                    .filter(Boolean)
                    .filter((img, idx, self) => self.indexOf(img) === idx)
                    .slice(0, 4);
                  if (images.length === 0) images.push(...SEED.demoImages.slice(0, 3));

                  return (
                    <div key={draft.id} style={{ animationDelay: `${idx * 0.07}s` }}>
                      <DraftMobileCard
                        draft={draft}
                        images={images}
                        onEdit={() => openEditor(draft.id)}
                        onToggleAuto={() => handleToggleAutoPublish(draft.id)}
                        onPublish={() => openEditor(draft.id)}
                        onDelete={() => showToast('Delete not implemented yet', 'info')}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DraftAiRecs;
