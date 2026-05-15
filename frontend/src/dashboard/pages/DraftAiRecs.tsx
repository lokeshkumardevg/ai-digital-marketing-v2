/**
 * DraftAiRecs — unified module
 *
 * VIEW 1 (list):  Fetch all draft campaigns for the logged-in user,
 *                 show them as expandable cards with AI recs.
 * VIEW 2 (editor): Click any campaign → AdCampaignDashboard opens inline.
 *                  Publish / Save Draft → returns to list.
 *
 * API:
 *   GET  /campaign/draft/:userId  → { success, message, data: Campaign[] }
 *   POST /campaign/draft          → { message }  (save/update a draft)
 *   POST /campaign/publish        → { message }  (publish with planId)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  FileEdit, Sparkles, Plus, Wand2, Copy, Trash2,
  ChevronDown, ToggleLeft, ToggleRight, Image, Type, Video,
} from 'lucide-react';

/* ─── CONSTANTS ──────────────────────────────────────────── */
const API_BASE = 'http://localhost:3000';
const PLATFORMS_FILTER = ['All', 'Meta', 'Google', 'X', 'LinkedIn'];

/* ─── TYPES (shared) ─────────────────────────────────────── */
type PlatformId   = 'meta' | 'google' | 'x' | 'linkedin';
type LoadingState = 'publish' | 'draft' | null;
type ToastType    = 'success' | 'error' | 'info';
type BillingCycle = 'monthly' | 'yearly';
type PlanId       = 'free' | 'silver' | 'gold';
type View         = 'list' | 'editor';

interface CampaignDoc {
  _id: string;
  name: string;
  platform: string;
  status: string;
  aiStrategy?: { performanceScore?: number; marketingStrategy?: string };
  data?: {
    caption?: string; cta?: string; image?: string | null;
    budget?: string; event?: string; schedule?: string;
    finalUrl?: string; location?: string; advantagePlus?: boolean;
  };
  // backend fields from saveDraft
  aiGeneratedContent?: {
    headline?: string;
    primaryText?: string;
    description?: string;
    imageUrl?: string;
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
  { id: 'meta'     as PlatformId, name: 'Meta',     color: '#2563eb', bg: '#EFF6FF' },
  { id: 'google'   as PlatformId, name: 'Google',   color: '#34a853', bg: '#ECFDF5' },
  { id: 'x'        as PlatformId, name: 'X',        color: '#0F1733', bg: '#F1F5FE' },
  { id: 'linkedin' as PlatformId, name: 'LinkedIn',  color: '#0a66c2', bg: '#EFF6FF' },
];

const platformName = (id: string) =>
  PLATFORM_LIST.find(p => p.id === id)?.name ?? id;

const platformColor = (id: string) =>
  PLATFORM_LIST.find(p => p.id === id)?.color ?? '#2563eb';

/* ─── GLOBAL CSS (AdCampaignDashboard styles) ─────────────── */
const DASH_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

  .dash-root {
    --blue:#2563EB;--blue-lt:#EFF6FF;--blue-mid:#DBEAFE;--blue-bdr:#BFDBFE;--blue-dark:#1D4ED8;
    --white:#FFF;--surface:#F8FAFF;--surface2:#F1F5FE;--card:#FFF;--bdr:#E2E8F4;--bdr2:#C7D7F0;
    --t1:#0F1733;--t2:#4A5878;--t3:#8A97B0;--green:#059669;--green-lt:#ECFDF5;--green-bdr:#A7F3D0;
    --purple:#7C3AED;--purple-lt:#F5F3FF;--purple-bdr:#DDD6FE;--amber:#D97706;--amber-lt:#FFFBEB;
    --red:#DC2626;--cyan:#0891B2;
    font-family:'DM Sans',system-ui,sans-serif;background:var(--surface);color:var(--t1);
    font-size:13px;-webkit-font-smoothing:antialiased;display:flex;flex-direction:column;
    width:100%;height:100%;overflow:hidden;
  }
  .dash-inner{display:flex;flex:1 1 0;min-height:0;overflow:hidden;}
  .dash-sidebar{width:200px;min-width:200px;flex-shrink:0;background:#fff;border-right:1px solid var(--bdr);display:flex;flex-direction:column;overflow:hidden;height:100%;}
  .dash-main{flex:1 1 0;min-width:0;display:flex;flex-direction:column;overflow:hidden;height:100%;}
  .dash-scroll{flex:1 1 0;min-height:0;overflow-y:auto;padding:14px 16px;background:var(--surface);}
  .dash-root *{box-sizing:border-box;}
  .dash-root ::-webkit-scrollbar{width:4px;height:4px;}
  .dash-root ::-webkit-scrollbar-track{background:transparent;}
  .dash-root ::-webkit-scrollbar-thumb{background:var(--blue-bdr);border-radius:4px;}
  .sid-cam{cursor:pointer;transition:all .15s;}.sid-cam:hover{background:var(--blue-lt)!important;}
  .btn-back:hover{background:var(--surface2)!important;}
  .btn-pub:hover:not(:disabled){background:var(--blue-dark)!important;box-shadow:0 4px 14px #2563eb33;}
  .btn-draft:hover:not(:disabled){background:var(--surface2)!important;}
  .gen-btn:hover:not(:disabled){background:#6D28D9!important;}
  .gen-btn:disabled{opacity:.45;cursor:not-allowed;}
  .tag-pill{cursor:pointer;transition:all .12s;}.tag-pill:hover{background:var(--blue-lt)!important;border-color:var(--blue-bdr)!important;}
  .tag-pill.on{background:var(--blue-lt)!important;border-color:var(--blue)!important;color:var(--blue)!important;}
  .img-th{cursor:pointer;transition:all .15s;}.img-th:hover{border-color:var(--blue)!important;transform:scale(1.04);}
  .img-th.sel{border-color:var(--blue)!important;box-shadow:0 0 0 3px #2563eb18;}
  .hd-in:focus,.pt-ta:focus,.editable-input:focus{outline:none;border-color:var(--blue)!important;box-shadow:0 0 0 3px #2563eb14;}
  .add-btn:hover{background:var(--blue-lt)!important;border-color:var(--blue-bdr)!important;}
  .tb-sel:hover{border-color:var(--blue-bdr)!important;}
  .plat-tab:hover{background:var(--blue-lt)!important;}
  .brand-asset-img{cursor:pointer;transition:all .15s;border-radius:7px;overflow:hidden;border:2px solid var(--bdr);}
  .brand-asset-img:hover{border-color:var(--blue)!important;transform:scale(1.04);}
  .brand-asset-img.sel{border-color:var(--blue)!important;box-shadow:0 0 0 3px #2563eb18;}
  .section-tab{cursor:pointer;padding:5px 12px;border-radius:20px;font-size:10px;font-weight:700;border:1px solid var(--bdr);background:var(--surface2);color:var(--t3);transition:all .15s;font-family:inherit;}
  .section-tab:hover{background:var(--blue-lt)!important;border-color:var(--blue-bdr)!important;color:var(--blue)!important;}
  .section-tab.active{background:var(--blue-lt)!important;border-color:var(--blue)!important;color:var(--blue)!important;}
  .editable-input{background:var(--surface);border:1px solid var(--bdr);border-radius:7px;padding:6px 10px;color:var(--t1);font-size:12px;font-family:inherit;transition:all .15s;width:100%;}
  .acd-toast{position:fixed;bottom:24px;right:24px;z-index:99999;background:#059668;color:#FFF;padding:10px 18px;border:1.5px solid #00c788cc;border-radius:12px;font-size:12px;font-weight:600;box-shadow:0 8px 32px rgba(37,99,235,.35);animation:acd-fi .2s ease;display:flex;align-items:center;gap:8px;}
  .acd-toast.error{background:var(--red);border-color:#FCA5A5;}
  .acd-toast.info{background:var(--blue);border-color:var(--blue-bdr);}
  @keyframes acd-fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spinner{width:13px;height:13px;border:2px solid #2563eb44;border-top-color:var(--blue);border-radius:50%;animation:spin .7s linear infinite;display:inline-block;}
  @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
  .shimmer{background:linear-gradient(90deg,#F1F5FE 25%,#E8EFFA 50%,#F1F5FE 75%);background-size:800px 100%;animation:shimmer 1.4s infinite;}
  .fb-post{background:#fff;border:1px solid #E4E6EB;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.05);}
  .google-ad{background:#fff;border:1px solid #E4E6EB;border-radius:10px;overflow:hidden;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,.05);}
  .x-post{background:#fff;border:1px solid #E4E6EB;border-radius:10px;overflow:hidden;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,.05);}
  .li-post{background:#fff;border:1px solid #E4E6EB;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.05);}
  .nav-active{background:var(--blue-lt)!important;border-color:var(--blue-bdr)!important;}
  .plan-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(37,99,235,.10);}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
  @keyframes slideInRight{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:none}}
`;

/* ─── SMALL SHARED COMPONENTS ────────────────────────────── */
const I = {
  Settings: () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 10a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.4"/><path d="M13.5 8a5.5 5.5 0 01-.1 1l1.4 1.1-1.5 2.6-1.7-.7a5.5 5.5 0 01-1.7 1l-.3 1.8h-3l-.3-1.8a5.5 5.5 0 01-1.7-1l-1.7.7L1.2 10.1 2.6 9A5.5 5.5 0 012.5 8a5.5 5.5 0 01.1-1L1.2 5.9l1.5-2.6 1.7.7a5.5 5.5 0 011.7-1L6.4 1.3h3l.3 1.7a5.5 5.5 0 011.7 1l1.7-.7 1.5 2.6-1.4 1.1a5.5 5.5 0 01.1 1z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  Users:    () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Sparkle:  () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 2v3M8 11v3M2 8h3M11 8h3M3.8 3.8l2 2M10.2 10.2l2 2M10.2 3.8l-2 2M5.8 10.2l-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  Upload:   () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 10V4M5.5 6.5L8 4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="2" y="12" width="12" height="1.5" rx=".75" fill="currentColor"/></svg>,
  Plus:     () => <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  Back:     () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Check:    () => <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Lock:     () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 7V5.5a3 3 0 016 0V7" stroke="currentColor" strokeWidth="1.4"/></svg>,
  Campaign: () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 5h12M2 8h8M2 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Image:    () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M2 11l4-4 3 3 2-2 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="5.5" cy="5.5" r="1" fill="currentColor"/></svg>,
  Edit:     () => <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

const card = (ex: React.CSSProperties = {}): React.CSSProperties => ({
  background: '#fff', border: '1px solid var(--bdr)', borderRadius: 14, padding: 16, position: 'relative', ...ex,
});
const sLabel = (color = 'var(--t2)'): React.CSSProperties => ({
  fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.7px',
  marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
});

function Toast({ message, type }: { message: string; type: ToastType }) {
  const dot = type === 'success' ? 'var(--green)' : type === 'error' ? 'var(--red)' : 'var(--blue)';
  return (
    <div className={`acd-toast ${type}`}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, display: 'inline-block' }} />
      {message}
    </div>
  );
}

function DisabledOverlay() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(248,250,255,.92)', borderRadius: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, zIndex: 5, backdropFilter: 'blur(3px)' }}>
      <span style={{ color: 'var(--t3)' }}><I.Lock /></span>
      <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 500, textAlign: 'center', lineHeight: 1.6, padding: '0 16px' }}>Switch to Meta<br />to enable</span>
    </div>
  );
}

/* ─── PLATFORM ICONS ─────────────────────────────────────── */
const MetaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none">
    <path d="M6.897 4h-.024l-.031 2.615h.022c1.715 0 3.046 1.357 5.94 6.246l.175.297.012.02 1.62-2.438-.012-.019a48.763 48.763 0 0 0-1.098-1.716 28.01 28.01 0 0 0-1.175-1.629C10.413 4.932 8.812 4 6.896 4z" fill="url(#mi0)"/>
    <path d="M6.873 4C4.95 4.01 3.247 5.258 2.02 7.17l2.254 1.231.011-.017c.718-1.083 1.61-1.774 2.568-1.785h.021L6.896 4h-.023z" fill="url(#mi1)"/>
    <path d="M2.019 7.17l-.011.017C1.2 8.447.598 9.995.274 11.664l2.534.6.004-.022c.27-1.467.786-2.828 1.456-3.845l.011-.017L2.02 7.17z" fill="url(#mi2)"/>
    <path d="M2.807 12.264l-2.533-.6-.005.022c-.177.918-.267 1.851-.269 2.786l2.598.233v-.023a12.591 12.591 0 0 1 .21-2.44z" fill="url(#mi3)"/>
    <path d="M10.78 9.654c-1.528 2.35-2.454 3.825-2.454 3.825-2.035 3.2-2.739 3.917-3.871 3.917a1.545 1.545 0 0 1-1.186-.508l-2.017 1.744.014.017C2.01 19.518 3.058 20 4.356 20c1.963 0 3.374-.928 5.884-5.33l1.766-3.13a41.283 41.283 0 0 0-1.227-1.886z" fill="#0082FB"/>
    <path d="M20.918 5.713C19.853 4.633 18.583 4 17.225 4c-1.432 0-2.637.787-3.723 1.944l1.382 1.24.016-.017c.715-.747 1.408-1.12 2.176-1.12.826 0 1.6.39 2.27 1.075l1.589-1.425-.016-.016z" fill="#0082FB"/>
    <path d="M23.998 14.125c-.06-3.467-1.27-6.566-3.064-8.396l-1.588 1.424.015.016c1.35 1.392 2.277 3.98 2.361 6.971h2.292v-.022z" fill="url(#mi7)"/>
    <path d="M18.309 16.515c-.55-.642-1.232-1.712-2.303-3.44l-1.396-2.336-.011-.02-1.62 2.438.012.02.989 1.668c.959 1.61 1.74 2.774 2.493 3.585l1.834-1.914a2.353 2.353 0 0 1-.014-.017z" fill="url(#mi12)"/>
    <defs>
      <linearGradient id="mi0" x1="75.897%" x2="26.312%" y1="89.199%" y2="12.194%"><stop offset=".06%" stopColor="#0867DF"/><stop offset="85.91%" stopColor="#0064E0"/></linearGradient>
      <linearGradient id="mi1" x1="21.67%" x2="97.068%" y1="75.874%" y2="23.985%"><stop offset="13.23%" stopColor="#0064DF"/><stop offset="99.88%" stopColor="#0064E0"/></linearGradient>
      <linearGradient id="mi2" x1="38.263%" x2="60.895%" y1="89.127%" y2="16.131%"><stop offset="1.47%" stopColor="#0072EC"/><stop offset="68.81%" stopColor="#0064DF"/></linearGradient>
      <linearGradient id="mi3" x1="47.032%" x2="52.15%" y1="90.19%" y2="15.745%"><stop offset="7.31%" stopColor="#007CF6"/><stop offset="99.43%" stopColor="#0072EC"/></linearGradient>
      <linearGradient id="mi7" x1="43.762%" x2="57.602%" y1="6.235%" y2="98.514%"><stop offset="0%" stopColor="#0082FB"/><stop offset="99.95%" stopColor="#0081FA"/></linearGradient>
      <linearGradient id="mi12" x1="32.254%" x2="68.003%" y1="19.719%" y2="84.908%"><stop offset="27.65%" stopColor="#0867DF"/><stop offset="100%" stopColor="#0471E9"/></linearGradient>
    </defs>
  </svg>
);
const GoogleIcon = () => (<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.6h12.4c-.5 2.8-2.1 5.2-4.5 6.8v5.6h7.3c4.3-3.9 6.9-9.7 6.9-16.5z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.6c-2.1 1.4-4.7 2.2-8.6 2.2-6.6 0-12.2-4.5-14.2-10.5H2.3v5.8C6.3 42.6 14.6 48 24 48z"/><path fill="#FBBC05" d="M9.8 28.3c-.5-1.4-.8-2.9-.8-4.3s.3-2.9.8-4.3v-5.8H2.3C.8 17.1 0 20.5 0 24s.8 6.9 2.3 10.1l7.5-5.8z"/><path fill="#EA4335" d="M24 9.5c3.7 0 7 1.3 9.6 3.8l7.2-7.2C36.9 2.1 31.5 0 24 0 14.6 0 6.3 5.4 2.3 13.9l7.5 5.8C11.8 14 17.4 9.5 24 9.5z"/></svg>);
const XIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="#0F1733"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>);
const LinkedInIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="#0a66c2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>);

const PLATFORM_ICONS: Record<PlatformId, React.ReactNode> = {
  meta: <MetaIcon />, google: <GoogleIcon />, x: <XIcon />, linkedin: <LinkedInIcon />,
};

/* ═══════════════════════════════════════════════════════════
   SECTION A — DASHBOARD EDITOR SUBCOMPONENTS
   ═══════════════════════════════════════════════════════════ */

/* ─── AD SETTING CARD ────────────────────────────────────── */
interface AdSettingCardProps {
  event: string; budget: string; schedule: string; finalUrl: string; enabled: boolean;
  onEventChange: (v: string) => void; onBudgetChange: (v: string) => void;
  onScheduleChange: (v: string) => void; onFinalUrlChange: (v: string) => void;
}
function AdSettingCard({ event, budget, schedule, finalUrl, enabled, onEventChange, onBudgetChange, onScheduleChange, onFinalUrlChange }: AdSettingCardProps) {
  return (
    <div style={{ ...card(), borderTop: '3px solid var(--blue)' }}>
      <div style={sLabel('var(--blue)')}><I.Settings /> Ad Setting</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 4, fontWeight: 500 }}>Event</div>
          <input className="editable-input" value={event} onChange={e => onEventChange(e.target.value)} placeholder="e.g. Purchase" />
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 4, fontWeight: 500 }}>Budget</div>
          <input className="editable-input" value={budget} onChange={e => onBudgetChange(e.target.value)} placeholder="e.g. 5.83 USD" style={{ color: 'var(--blue)', fontWeight: 700 }} />
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--bdr)', margin: '10px 0' }} />
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 4, fontWeight: 500 }}>Schedule</div>
        <input className="editable-input" value={schedule} onChange={e => onScheduleChange(e.target.value)} placeholder="e.g. May 08, 2026" />
      </div>
      <div>
        <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 4, fontWeight: 500 }}>Final URL</div>
        <input className="editable-input" value={finalUrl} onChange={e => onFinalUrlChange(e.target.value)} placeholder="https://yourbrand.com" style={{ color: 'var(--cyan)', fontSize: 11 }} />
      </div>
      {!enabled && <DisabledOverlay />}
    </div>
  );
}

/* ─── TARGET AUDIENCE CARD ───────────────────────────────── */
interface TargetAudienceCardProps {
  location: string; advantagePlus: boolean; enabled: boolean;
  onLocationChange: (v: string) => void; onAdvantageToggle: () => void;
}
function TargetAudienceCard({ location, advantagePlus, enabled, onLocationChange, onAdvantageToggle }: TargetAudienceCardProps) {
  return (
    <div style={{ ...card(), borderTop: '3px solid var(--green)' }}>
      <div style={sLabel('var(--green)')}><I.Users /> Target Audience</div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 4, fontWeight: 500 }}>Location</div>
        <input className="editable-input" value={location} onChange={e => onLocationChange(e.target.value)} placeholder="e.g. United States" />
      </div>
      <div onClick={onAdvantageToggle} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: advantagePlus ? 'var(--green)' : 'var(--t3)', background: advantagePlus ? 'var(--green-lt)' : 'var(--surface2)', border: `1px solid ${advantagePlus ? 'var(--green-bdr)' : 'var(--bdr)'}`, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', transition: 'all .2s', userSelect: 'none' }}>
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
    <div className="fb-post">
      <div style={{ padding: '12px 14px 8px', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#EFF6FF', border: '2px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {logoUrl ? <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 15, fontWeight: 700, color: '#2563EB' }}>{(brandName[0] ?? 'B').toUpperCase()}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{brandName}</div>
          <div style={{ fontSize: 10, color: '#8A97B0' }}>Sponsored · 🌐</div>
        </div>
      </div>
      <div style={{ padding: '2px 14px 8px', fontSize: 13, lineHeight: 1.6 }}>{caption}</div>
      <div style={{ width: '100%', aspectRatio: '1.91/1', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {imageUrl ? <img src={imageUrl} alt="Ad" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 11, color: '#93C5FD' }}>Upload or generate image</span>}
      </div>
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFF', borderTop: '1px solid #E2E8F4' }}>
        <div style={{ fontSize: 11, color: '#8A97B0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{caption}</div>
        <button style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{cta}</button>
      </div>
      <div style={{ display: 'flex', borderTop: '1px solid #E2E8F4' }}>
        {['👍 Like', '💬 Comment', '↗ Share'].map(l => <button key={l} style={{ flex: 1, fontSize: 12, color: '#8A97B0', fontWeight: 500, cursor: 'pointer', padding: '10px 4px', background: 'none', border: 'none', fontFamily: 'inherit' }}>{l}</button>)}
      </div>
    </div>
  );
}
function GooglePreview({ caption, imageUrl }: PreviewProps) {
  return (
    <div className="google-ad">
      <div style={{ fontSize: 10, color: '#8A97B0', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ background: '#34a853', color: '#fff', fontSize: 9, padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>Ad</span><span>brandname.com</span></div>
      <div style={{ fontSize: 16, color: '#1558D6', fontWeight: 500, marginBottom: 4, lineHeight: 1.4 }}>{caption?.slice(0, 60) || 'Powerful Solutions — Official Site'}</div>
      <div style={{ fontSize: 12, color: '#4A5878', lineHeight: 1.6, marginBottom: 12 }}>{caption}</div>
      {imageUrl && <img src={imageUrl} alt="Ad" style={{ width: '100%', aspectRatio: '1.91/1', objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />}
    </div>
  );
}
function XPreview({ brandName, logoUrl, caption, cta, imageUrl }: PreviewProps) {
  return (
    <div className="x-post">
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {logoUrl ? <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 16, fontWeight: 700 }}>{(brandName[0] ?? 'B').toUpperCase()}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{brandName} <span style={{ fontSize: 11, color: '#8A97B0' }}>· Promoted</span></div>
          <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 10 }}>{caption}</div>
          {imageUrl ? <img src={imageUrl} alt="Ad" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 12, marginBottom: 10 }} /> : <div style={{ width: '100%', aspectRatio: '16/9', background: '#F1F5FE', borderRadius: 12, marginBottom: 10, border: '1px solid #E2E8F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#BFDBFE', fontSize: 24 }}>🖼</span></div>}
          <div style={{ background: '#F8FAFF', border: '1px solid #E2E8F4', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#8A97B0' }}>brandname.com</span>
            <button style={{ background: '#0F1733', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{cta}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
function LinkedInPreview({ brandName, logoUrl, caption, cta, imageUrl }: PreviewProps) {
  return (
    <div className="li-post">
      <div style={{ padding: '12px 14px 8px', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {logoUrl ? <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 18, fontWeight: 700, color: '#0a66c2' }}>{(brandName[0] ?? 'B').toUpperCase()}</span>}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{brandName}</div>
          <div style={{ fontSize: 11, color: '#8A97B0' }}>Sponsored · <span style={{ color: '#0a66c2' }}>Follow</span></div>
        </div>
      </div>
      <div style={{ padding: '4px 14px 10px', fontSize: 13, lineHeight: 1.65 }}>{caption}</div>
      {imageUrl ? <img src={imageUrl} alt="Ad" style={{ width: '100%', aspectRatio: '1.91/1', objectFit: 'cover', display: 'block' }} /> : <div style={{ width: '100%', aspectRatio: '1.91/1', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#BFDBFE', fontSize: 32 }}>🖼</span></div>}
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E2E8F4' }}>
        <div><div style={{ fontSize: 13, fontWeight: 600 }}>{brandName}</div><div style={{ fontSize: 11, color: '#8A97B0' }}>brandname.com</div></div>
        <button style={{ background: 'transparent', color: '#0a66c2', border: '1.5px solid #0a66c2', borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{cta}</button>
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
  const meta = { meta: { label: 'Meta Ads Feed', color: '#2563eb' }, google: { label: 'Google Search Ad', color: '#34a853' }, x: { label: 'X Promoted Post', color: '#0F1733' }, linkedin: { label: 'LinkedIn Sponsored', color: '#0a66c2' } }[platformId];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '.7px' }}>{meta.label}</span>
        <span style={{ fontSize: 10, background: '#EFF6FF', color: meta.color, padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>Ad 1</span>
      </div>
      {previews[platformId]}
      <div style={{ background: '#fff', border: '1px solid var(--bdr)', borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue)', marginBottom: 6 }}>Est. audience: {estimatedAudience}</div>
        <div style={{ background: '#F1F5FE', borderRadius: 6, height: 6, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 6, background: `linear-gradient(90deg,var(--green),${meta.color})`, width: '40%' }} />
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
function CreativeStudio({ brandName, adCopy, activePlatformId, brandAssetImages, onSubheadingChange, onImageSelect, onCtaChange, initialCaption, initialCta, initialImage }: CreativeStudioProps) {
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

  const currentImgs = imgTab === 'brand' ? brandAssetImages : imgTab === 'ai' ? aiImgs : uploadedImgs;
  const emptyMsg = imgTab === 'brand' ? 'No brand assets. Add to brandDetails.assets.images' : imgTab === 'ai' ? 'Generate an image above.' : 'Upload an image above.';

  return (
    <div style={{ ...card({ padding: 0 }), borderTop: '3px solid var(--purple)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--bdr)' }}>
        <div style={sLabel('var(--purple)')}><I.Sparkle /> Creative Studio</div>
        <div style={{ fontSize: 11, color: 'var(--t3)' }}>Edit copy · Choose visuals</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Headline */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Headline</div>
          <input className="hd-in" value={heading} onChange={e => { setHeading(e.target.value); }} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--bdr)', borderRadius: 8, padding: '9px 12px', color: 'var(--t1)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all .15s' }} placeholder="Enter headline…" />
          <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 3 }}>{heading.length}/125</div>
        </div>
        <div style={{ borderTop: '1px solid var(--bdr)' }} />
        {/* Primary Text */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Primary Text</div>
          <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
            {adCopy.primaryTexts.map((s, i) => <button key={i} className={`tag-pill${sIdx === i ? ' on' : ''}`} onClick={() => pickS(s, i)} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, border: '1px solid var(--bdr)', background: 'var(--surface2)', color: 'var(--t2)', fontFamily: 'inherit' }}>P{i + 1}</button>)}
          </div>
          <textarea className="pt-ta" value={sub} onChange={e => { setSub(e.target.value); onSubheadingChange(e.target.value); }} rows={3} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--bdr)', borderRadius: 8, padding: '9px 12px', color: 'var(--t1)', fontSize: 12, lineHeight: 1.65, resize: 'vertical', fontFamily: 'inherit', transition: 'all .15s' }} placeholder="Enter primary text…" />
        </div>
        <div style={{ borderTop: '1px solid var(--bdr)' }} />
        {/* CTA */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Call to Action</div>
          <input className="hd-in" value={cta} onChange={e => handleCtaChange(e.target.value)} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--bdr)', borderRadius: 8, padding: '9px 12px', color: 'var(--blue)', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', transition: 'all .15s' }} placeholder="e.g. Shop Now" />
        </div>
        <div style={{ borderTop: '1px solid var(--bdr)' }} />
        {/* Ad Creative */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>Ad Creative</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {(['brand', 'ai', 'upload'] as ImageTab[]).map(t => <button key={t} className={`section-tab${imgTab === t ? ' active' : ''}`} onClick={() => setImgTab(t)}>{t === 'brand' ? `Brand (${brandAssetImages.length})` : t === 'ai' ? 'AI Gen' : 'Uploaded'}</button>)}
          </div>
          {imgTab === 'brand' && (
            brandAssetImages.length === 0
              ? <div style={{ background: 'var(--surface2)', border: '1.5px dashed var(--bdr2)', borderRadius: 10, padding: '20px 14px', textAlign: 'center', color: 'var(--t3)', fontSize: 11 }}>{emptyMsg}</div>
              : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                  {brandAssetImages.map((url, i) => <div key={i} className={`brand-asset-img${selImg === url ? ' sel' : ''}`} onClick={() => pickImg(url)} style={{ aspectRatio: '1', position: 'relative', overflow: 'hidden', border: `2px solid ${selImg === url ? 'var(--blue)' : 'var(--bdr)'}`, cursor: 'pointer' }}><img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />{selImg === url && <div style={{ position: 'absolute', inset: 0, background: '#2563eb1a', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 4 }}><div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><I.Check /></div></div>}</div>)}
                </div>
          )}
          {imgTab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: 'var(--purple-lt)', border: '1px solid var(--purple-bdr)', borderRadius: 10, padding: 12 }}>
                <textarea className="pt-ta" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder='e.g. "Eco-friendly solar panels at golden hour"' rows={2} style={{ width: '100%', background: '#fff', border: '1px solid var(--purple-bdr)', borderRadius: 7, padding: '8px 10px', color: 'var(--t1)', fontSize: 11, lineHeight: 1.5, resize: 'vertical', fontFamily: 'inherit' }} />
                {aiErr && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 5, background: '#FEF2F2', padding: '5px 8px', borderRadius: 6 }}>{aiErr}</div>}
                <button className="gen-btn" onClick={generate} disabled={loading || !aiPrompt.trim()} style={{ marginTop: 8, width: '100%', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {loading ? <><span className="spinner" /><span>Generating…</span></> : <><I.Sparkle /><span>Generate Image</span></>}
                </button>
              </div>
              {aiImgs.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>{aiImgs.map((url, i) => <div key={i} className={`img-th${selImg === url ? ' sel' : ''}`} onClick={() => pickImg(url)} style={{ aspectRatio: '1', borderRadius: 7, overflow: 'hidden', border: `2px solid ${selImg === url ? 'var(--blue)' : 'var(--bdr)'}`, position: 'relative' }}><img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />{selImg === url && <div style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><I.Check /></div>}</div>)}</div>}
              {aiImgs.length === 0 && !loading && <div style={{ fontSize: 11, color: 'var(--t3)', textAlign: 'center' }}>{emptyMsg}</div>}
            </div>
          )}
          {imgTab === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={upload} />
              <button onClick={() => fileRef.current?.click()} style={{ width: '100%', background: 'var(--surface)', border: '1.5px dashed var(--bdr2)', borderRadius: 9, padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, cursor: 'pointer', color: 'var(--t2)', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}><I.Upload /> Upload from folder</button>
              {uploadedImgs.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>{uploadedImgs.map((url, i) => <div key={i} className={`img-th${selImg === url ? ' sel' : ''}`} onClick={() => pickImg(url)} style={{ aspectRatio: '1', borderRadius: 7, overflow: 'hidden', border: `2px solid ${selImg === url ? 'var(--blue)' : 'var(--bdr)'}`, position: 'relative' }}><img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>)}</div>}
            </div>
          )}
        </div>
      </div>
      {!enabled && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(248,250,255,.93)', borderRadius: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 10, backdropFilter: 'blur(4px)' }}>
          <I.Lock />
          <span style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 500, textAlign: 'center', padding: '0 24px', lineHeight: 1.7 }}>Creative Studio is only available<br />for the active platform.</span>
        </div>
      )}
    </div>
  );
}

/* ─── DASHBOARD SIDEBAR ──────────────────────────────────── */
interface DashSidebarProps {
  activePid: PlatformId;
  campaignName: string;
  onPlatformSwitch: (id: PlatformId) => void;
}
function DashSidebar({ activePid, campaignName, onPlatformSwitch }: DashSidebarProps) {
  const ap = PLATFORM_LIST.find(p => p.id === activePid) || PLATFORM_LIST[0];
  return (
    <aside className="dash-sidebar">
      {/* <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--bdr)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, background: 'var(--blue)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h7M3 12h9" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>AdStudio</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {PLATFORM_LIST.map(p => {
            const active = p.id === activePid;
            return (
              <div key={p.id} className={`plat-tab${active ? ' nav-active' : ''}`} onClick={() => onPlatformSwitch(p.id)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', borderRadius: 10, border: `1px solid ${active ? 'var(--blue-bdr)' : 'var(--bdr)'}`, cursor: 'pointer', transition: 'all .15s', background: active ? 'var(--blue-lt)' : 'transparent' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: active ? p.bg : 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {PLATFORM_ICONS[p.id]}
                </div>
                <span style={{ fontSize: 10, color: active ? p.color : 'var(--t3)', fontWeight: active ? 700 : 400 }}>{p.name}</span>
                {active && <span style={{ width: 4, height: 4, borderRadius: '50%', background: p.color }} />}
              </div>
            );
          })}
        </div>
      </div> */}
      <div style={{ padding: '14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: `${ap.color}12`, border: `1px solid ${ap.color}30`, borderRadius: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: ap.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{PLATFORM_ICONS[ap.id]}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: ap.color }}>{ap.name}</div>
            <div style={{ fontSize: 9, color: 'var(--t3)' }}>Active Platform</div>
          </div>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'pulse-dot 2s ease-in-out infinite', flexShrink: 0 }} />
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Campaign</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 8px', borderRadius: 10, background: 'var(--blue-lt)', border: '1px solid var(--blue-bdr)' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--blue-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--blue)' }}><I.Campaign /></div>
            <span style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{campaignName}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ─── PUBLISH PLAN MODAL ─────────────────────────────────── */
function PublishPlanModal({ isOpen, onClose, onSelectPlan }: { isOpen: boolean; onClose: () => void; onSelectPlan: (id: PlanId) => void }) {
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const plans = [
    { id: 'free' as PlanId, name: 'Free', price: '$0', features: ['1 campaign/month', 'Basic analytics', 'Standard publishing'], color: '#64748b' },
    { id: 'silver' as PlanId, name: 'Silver', price: billing === 'monthly' ? '$29' : '$290', features: ['10 campaigns/month', 'Advanced analytics', 'Priority support', 'Unlimited AI images', 'A/B testing'], color: '#2563EB', popular: true },
    { id: 'gold' as PlanId, name: 'Gold', price: billing === 'monthly' ? '$79' : '$790', features: ['Unlimited campaigns', 'Real-time analytics', '24/7 support', 'Multi-platform', 'Custom integrations'], color: '#D97706' },
  ];
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,51,.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, animation: 'fadeIn .2s ease' }} onClick={onClose}>
      <div style={{ background: '#fff', border: '1px solid var(--bdr)', borderRadius: 20, maxWidth: 780, width: '92%', maxHeight: '88vh', overflow: 'auto', padding: 28, position: 'relative', animation: 'slideUp .25s ease' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--surface2)', border: '1px solid var(--bdr)', color: 'var(--t3)', width: 28, height: 28, borderRadius: 8, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, fontFamily: "'Space Grotesk',sans-serif" }}>Choose Publishing Plan</h2>
          <p style={{ fontSize: 13, color: 'var(--t2)' }}>Select the plan that fits your campaign needs</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 40, padding: 4, border: '1px solid var(--bdr)' }}>
            {(['monthly', 'yearly'] as BillingCycle[]).map(b => <button key={b} onClick={() => setBilling(b)} style={{ padding: '7px 22px', borderRadius: 32, border: 'none', background: billing === b ? 'var(--blue)' : 'transparent', color: billing === b ? '#fff' : 'var(--t2)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>{b.charAt(0).toUpperCase() + b.slice(1)}</button>)}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
          {plans.map(plan => (
            <div key={plan.id} className="plan-card" onClick={() => onSelectPlan(plan.id)} style={{ border: `${(plan as any).popular ? '2px' : '1px'} solid ${(plan as any).popular ? plan.color + '44' : 'var(--bdr)'}`, borderRadius: 16, padding: 20, background: (plan as any).popular ? `${plan.color}08` : 'var(--surface)', cursor: 'pointer', transition: 'all .2s', position: 'relative' }}>
              {(plan as any).popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>Most Popular</div>}
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, fontFamily: "'Space Grotesk',sans-serif" }}>{plan.name}</div>
                <div><span style={{ fontSize: 30, fontWeight: 800, color: plan.color }}>{plan.price}</span><span style={{ fontSize: 12, color: 'var(--t3)' }}>/{billing === 'monthly' ? 'mo' : 'yr'}</span></div>
              </div>
              <ul style={{ listStyle: 'none', margin: '0 0 16px', borderTop: '1px solid var(--bdr)', paddingTop: 12 }}>
                {plan.features.map((f, i) => <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--t2)', marginBottom: 8 }}><svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke={plan.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>{f}</li>)}
              </ul>
              <button style={{ width: '100%', padding: '8px', borderRadius: 8, border: `1.5px solid ${plan.color}`, background: (plan as any).popular ? plan.color : 'transparent', color: (plan as any).popular ? '#fff' : plan.color, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Select {plan.name}</button>
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
    <div style={{ background: '#fff', borderTop: '1px solid var(--bdr)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
      <button className="btn-back" onClick={onBack} style={{ background: 'var(--surface)', border: '1px solid var(--bdr)', color: 'var(--t2)', padding: '8px 16px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
        <I.Back /> Back to Drafts
      </button>
      <div style={{ fontSize: 11, color: 'var(--t3)' }}>Publishing to <span style={{ color: 'var(--blue)', fontWeight: 600 }}>{activePlatformName}</span></div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-pub" onClick={onPublish} disabled={!!loading} style={{ background: 'var(--blue)', color: '#fff', border: 'none', padding: '8px 26px', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all .15s', opacity: loading ? .7 : 1 }}>
          {loading === 'publish' ? 'Publishing…' : 'Publish'}
        </button>
        <button className="btn-draft" onClick={onSaveDraft} disabled={!!loading} style={{ background: 'var(--surface)', border: '1px solid var(--bdr)', color: 'var(--t2)', padding: '8px 16px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all .12s', opacity: loading ? .7 : 1 }}>
          {loading === 'draft' ? 'Saving…' : 'Save Draft'}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION B — CAMPAIGN EDITOR
   ═══════════════════════════════════════════════════════════ */
interface CampaignEditorProps {
  campaign: CampaignDoc;
  brandDetails?: BrandDetails;
  onBack: () => void;
  onSaved: () => void;
  showToast: (msg: string, type: ToastType) => void;
}

function CampaignEditor({ campaign, brandDetails, onBack, onSaved, showToast }: CampaignEditorProps) {
  const brandName = brandDetails?.brand?.name || brandDetails?.name || campaign.name || 'Brand';
  const logoUrl   = brandDetails?.logoUrl || brandDetails?.assets?.favicon || '';

  const collectBrandImages = (): string[] => {
    if (!brandDetails?.assets) return SEED.demoImages;
    const a = brandDetails.assets;
    const out: string[] = [];
    if (Array.isArray(a.images))     out.push(...a.images.filter(Boolean));
    if (Array.isArray(a.banners))    out.push(...a.banners.filter(Boolean));
    if (Array.isArray(a.thumbnails)) out.push(...a.thumbnails.filter(Boolean));
    return out.length > 0 ? out : SEED.demoImages;
  };

  // Pre-fill from both campaign.data (frontend saves) and campaign.aiGeneratedContent (backend saves)
  const saved        = campaign.data || {};
  const aiContent    = campaign.aiGeneratedContent || {};

  const [activePid,   setActivePid]   = useState<PlatformId>((campaign.platform?.toLowerCase() as PlatformId) || 'meta');
  const [loading,     setLoading]     = useState<LoadingState>(null);
  const [showPlan,    setShowPlan]    = useState(false);

  const [adEvent,     setAdEvent]     = useState(saved.event     || SEED.event);
  const [adBudget,    setAdBudget]    = useState(saved.budget    || (campaign.budgetDaily ? `${campaign.budgetDaily} USD` : SEED.budget));
  const [adSchedule,  setAdSchedule]  = useState(saved.schedule  || SEED.schedule);
  const [adFinalUrl,  setAdFinalUrl]  = useState(saved.finalUrl  || '');
  const [adLocation,  setAdLocation]  = useState(saved.location  || SEED.location);
  const [adAdvantage, setAdAdvantage] = useState<boolean>(saved.advantagePlus ?? SEED.advantagePlus);

  // caption: prefer saved.caption → aiGeneratedContent.primaryText → aiGeneratedContent.headline → SEED
  const [pvCaption, setPvCaption] = useState(
    saved.caption || aiContent.primaryText || aiContent.headline || SEED.caption
  );
  const [pvImage,   setPvImage]   = useState<string | null>(saved.image || aiContent.imageUrl || null);
  const [pvCta,     setPvCta]     = useState(saved.cta || SEED.cta);

  const activePlat   = PLATFORM_LIST.find(p => p.id === activePid) || PLATFORM_LIST[0];
  const campaignTitle = `${brandName}_${campaign.name || 'Campaign'}_${activePlat.name}`;

  const adCopy: AdCopy = {
    headlines:    [aiContent.headline || SEED.headlines[0], ...SEED.headlines.slice(1)],
    primaryTexts: [aiContent.primaryText || SEED.primaryTexts[0], ...SEED.primaryTexts.slice(1)],
    callToAction: pvCta,
  };

  /* ── Save Draft ── */
  const handleDraft = useCallback(async () => {
    setLoading('draft');
    try {
      const res = await fetch(`${API_BASE}/campaign/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign._id,
          name: campaignTitle,
          platform: activePid,
          data: {
            caption: pvCaption, cta: pvCta, image: pvImage,
            budget: adBudget, event: adEvent, schedule: adSchedule,
            finalUrl: adFinalUrl, location: adLocation, advantagePlus: adAdvantage,
          },
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

  /* ── Publish ── */
  const handleSelectPlan = useCallback(async (planId: PlanId) => {
    setShowPlan(false);
    setLoading('publish');
    try {
      const res = await fetch(`${API_BASE}/campaign/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign._id,
          platform: activePid,
          planId,
          data: {
            caption: pvCaption, cta: pvCta, image: pvImage,
            budget: adBudget, event: adEvent, schedule: adSchedule,
            finalUrl: adFinalUrl, location: adLocation, advantagePlus: adAdvantage,
          },
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Publish failed');
      showToast(`Published on ${activePlat.name} with ${planId} plan!`, 'success');
      onSaved();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Publish failed', 'error');
    } finally { setLoading(null); }
  }, [campaign._id, activePid, pvCaption, pvCta, pvImage, adBudget, adEvent, adSchedule, adFinalUrl, adLocation, adAdvantage, activePlat.name, showToast, onSaved]);

  return (
    <div className="dash-root" style={{ animation: 'slideInRight .25s ease' }}>
      {/* TopBar */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 16px', borderBottom: '1px solid var(--bdr)', background: '#fff', alignItems: 'flex-end', flexWrap: 'wrap', flexShrink: 0, position: 'relative', opacity: activePid === 'meta' ? 1 : .35, pointerEvents: activePid === 'meta' ? 'auto' : 'none' }}>
        {['Ad Account', 'Page', 'Instagram', 'Pixel'].map(f => (
          <div key={f} style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 110 }}>
            <span style={{ fontSize: 9, color: 'var(--blue)', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase' }}>{f}</span>
            <div className="tb-sel" style={{ background: 'var(--surface)', border: '1px solid var(--bdr)', borderRadius: 8, padding: '7px 10px', color: 'var(--t3)', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}><span>Select {f.toLowerCase()}</span><span style={{ fontSize: 10 }}>▾</span></div>
          </div>
        ))}
        {activePid !== 'meta' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--t3)', background: 'rgba(248,250,255,.85)', backdropFilter: 'blur(2px)', zIndex: 2 }}>
            <I.Lock /> &nbsp;Switch to Meta to configure
          </div>
        )}
      </div>

      <div className="dash-inner">
        {/* <DashSidebar activePid={activePid} campaignName={campaignTitle} onPlatformSwitch={setActivePid} /> */}
        <div className="dash-main">
          <div className="dash-scroll">
            {/* Campaign title bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '9px 14px', background: '#fff', border: '1px solid var(--bdr)', borderRadius: 10, borderLeft: `4px solid ${activePlat.color}` }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{campaignTitle}</span>
              <span style={{ fontSize: 10, background: `${activePlat.color}14`, color: activePlat.color, padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>{activePlat.name}</span>
              <span style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'monospace' }}>ID: {campaign._id}</span>
            </div>

            {/* 3-col layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px,1fr) minmax(260px,1.1fr) minmax(200px,1fr)', gap: 14, alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <AdSettingCard event={adEvent} budget={adBudget} schedule={adSchedule} finalUrl={adFinalUrl} enabled={activePid === 'meta'} onEventChange={setAdEvent} onBudgetChange={setAdBudget} onScheduleChange={setAdSchedule} onFinalUrlChange={setAdFinalUrl} />
                <TargetAudienceCard location={adLocation} advantagePlus={adAdvantage} enabled={activePid === 'meta'} onLocationChange={setAdLocation} onAdvantageToggle={() => setAdAdvantage(p => !p)} />
              </div>
              <PlatformPreview platformId={activePid} brandName={brandName} logoUrl={logoUrl} caption={pvCaption} cta={pvCta} imageUrl={pvImage} estimatedAudience={SEED.estimatedAudience} />
              <CreativeStudio brandName={brandName} adCopy={adCopy} activePlatformId={activePid} brandAssetImages={collectBrandImages()} onHeadingChange={() => {}} onSubheadingChange={setPvCaption} onImageSelect={setPvImage} onCtaChange={setPvCta} initialCaption={saved.caption || aiContent.primaryText} initialCta={saved.cta} initialImage={saved.image || aiContent.imageUrl || null} />
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
   SECTION C — DRAFT LIST HELPERS
   ═══════════════════════════════════════════════════════════ */
const componentIcons: Record<string, React.ElementType> = {
  Image, Headline: Type, Copy: FileEdit, Video, CTA: Sparkles,
};

function mapToCard(c: CampaignDoc): DraftCard {
  return {
    id:         c._id,
    name:       c.name || 'AI Campaign Concept',
    platform:   c.platform || 'Meta',
    status:     (c.status || 'draft').toLowerCase(),
    score:      Math.floor(c.aiStrategy?.performanceScore ?? (Math.random() * 30 + 60)),
    rec:        c.aiStrategy?.marketingStrategy || 'Add urgency CTA — "Limited time only!" to boost CTR by ~18%',
    components: ['Image', 'Headline', 'Copy'],
    raw:        c,
  };
}

/* ═══════════════════════════════════════════════════════════
   SECTION D — ROOT EXPORT
   ═══════════════════════════════════════════════════════════ */
export const DraftAiRecs: React.FC<{ brandDetails?: BrandDetails }> = ({ brandDetails }) => {
  // ── Auth ──────────────────────────────────────────────────
  const { user } = useSelector((state: any) => state.auth);

  // ── View state ────────────────────────────────────────────
  const [view,             setView]             = useState<View>('list');
  const [selectedCampaign, setSelected]         = useState<CampaignDoc | null>(null);
  const [activePlatform,   setActivePlatform]   = useState('All');
  const [expanded,         setExpanded]         = useState<string | null>(null);
  const [drafts,           setDrafts]           = useState<DraftCard[]>([]);
  const [rawDocs,          setRawDocs]          = useState<CampaignDoc[]>([]);
  const [listLoading,      setListLoading]      = useState(true);
  const [fetchError,       setFetchError]       = useState<string | null>(null);
  const [autoPublish,      setAutoPublish]      = useState<Record<string, boolean>>({});
  const [toast,            setToast]            = useState<ToastState | null>(null);

  const showToast = useCallback((msg: string, type: ToastType = 'info') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // ── Fetch drafts from GET /campaign/draft/:userId ─────────
  const fetchDrafts = useCallback(() => {
    // Resolve userId — MongoDB uses _id, some backends use id
    const userId = user?._id || user?.id;

    if (!userId) {
      setFetchError('User not logged in. Please refresh and try again.');
      setListLoading(false);
      return;
    }

    setListLoading(true);
    setFetchError(null);

    // No auth token required — direct public endpoint
    fetch(`${API_BASE}/campaign/draft/${userId}`)
      .then(async r => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.message || `Server error ${r.status}`);
        }
        return r.json();
      })
      .then((json: { success: boolean; message: string; data: CampaignDoc[] }) => {
        // Backend returns { success, message, data: [...] }
        const arr: CampaignDoc[] = Array.isArray(json?.data) ? json.data : [];
        setRawDocs(arr);
        setDrafts(arr.map(mapToCard));
        // Auto-expand the first card
        if (arr.length > 0) setExpanded(prev => prev ?? arr[0]._id);
      })
      .catch((err: Error) => {
        console.error('Drafts fetch failed:', err);
        setFetchError(err.message || 'Failed to load drafts');
        showToast(err.message || 'Failed to load drafts', 'error');
      })
      .finally(() => setListLoading(false));
  }, [user, showToast]);

  useEffect(() => { fetchDrafts(); }, [fetchDrafts]);

  // ── Filtered list ─────────────────────────────────────────
  const filtered = activePlatform === 'All'
    ? drafts
    : drafts.filter(d => d.platform.toLowerCase() === activePlatform.toLowerCase());

  // ── Open editor ───────────────────────────────────────────
  const openEditor = (draftId: string) => {
    const raw = rawDocs.find(r => r._id === draftId);
    if (!raw) return;
    setSelected(raw);
    setView('editor');
  };

  // ── Back from editor → refresh list ──────────────────────
  const handleBack = () => {
    setView('list');
    setSelected(null);
    fetchDrafts();
  };

  const handleSaved = () => { handleBack(); };

  /* ───────── EDITOR VIEW ───────── */
  if (view === 'editor' && selectedCampaign) {
    return (
      <>
        <style>{DASH_CSS}</style>
        <CampaignEditor
          campaign={selectedCampaign}
          brandDetails={brandDetails}
          onBack={handleBack}
          onSaved={handleSaved}
          showToast={showToast}
        />
        {toast && <Toast message={toast.message} type={toast.type} />}
      </>
    );
  }

  /* ───────── LOADING ───────── */
  if (listLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'var(--bg-primary)' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#2631d6', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Loading drafts…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ───────── ERROR STATE ───────── */
  if (fetchError && drafts.length === 0) {
    return (
      <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ fontSize: 32 }}>⚠️</div>
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#dc2626' }}>{fetchError}</div>
        <button onClick={fetchDrafts} style={{ padding: '8px 20px', borderRadius: 8, background: '#2631d6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
          Retry
        </button>
      </div>
    );
  }

  /* ───────── LIST VIEW ───────── */
  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <div style={{ minHeight: '100%', background: 'var(--bg-primary)' }}>

        {/* Header */}
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--glass-border)', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '3px' }}>AI Optimize</div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Draft & AI Recs</h1>
          </div>
          {/* <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '8px', background: 'linear-gradient(135deg,#2631d6,#1e27a8)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
            <Plus size={14} /> New Draft
          </button> */}
        </div>

        <div style={{ padding: '24px 32px' }}>

          {/* Platform Tabs */}
          <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-elevated)', borderRadius: '8px', padding: '3px', width: 'fit-content', marginBottom: '20px' }}>
            {PLATFORMS_FILTER.map(p => (
              <button key={p} onClick={() => setActivePlatform(p)} style={{ padding: '6px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, background: activePlatform === p ? '#fff' : 'transparent', color: activePlatform === p ? '#0f172a' : '#64748b', boxShadow: activePlatform === p ? '0 1px 4px rgba(0,0,0,.08)' : 'none', transition: 'all .15s' }}>{p}</button>
            ))}
          </div>

          {/* Count */}
          <div style={{ marginBottom: '10px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Recommended Ads{' '}
            <span style={{ background: '#2631d6', color: '#fff', borderRadius: '99px', padding: '1px 8px', fontSize: '0.72rem', fontWeight: 700, marginLeft: '6px' }}>{filtered.length}</span>
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              No drafts found. Create your first campaign!
            </div>
          )}

          {/* Draft cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(draft => (
              <div key={draft.id} style={{ background: 'var(--bg-card)', border: `1px solid ${expanded === draft.id ? '#c4b5fd' : '#e8eaf0'}`, borderRadius: '12px', overflow: 'hidden', transition: 'all .2s' }}>

                {/* Card Header */}
                <div onClick={() => setExpanded(expanded === draft.id ? null : draft.id)}
                  style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>

                  {/* Platform Icon */}
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f8f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
                    {PLATFORM_ICONS[(draft.platform.toLowerCase() as PlatformId)] ?? <Image size={18} color="#2631d6" />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{draft.name}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 5, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 600 }}>{draft.platform}</span>
                      <span style={{ padding: '2px 8px', borderRadius: 5, background: draft.status === 'approved' ? '#f0fdf4' : '#fffbeb', color: draft.status === 'approved' ? '#16a34a' : '#d97706', fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize' }}>{draft.status}</span>
                    </div>
                  </div>

                  {/* Auto-publish Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={e => e.stopPropagation()}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Auto-publish</span>
                    <button onClick={() => setAutoPublish(prev => ({ ...prev, [draft.id]: !prev[draft.id] }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: autoPublish[draft.id] ? '#2631d6' : '#cbd5e1', padding: 0 }}>
                      {autoPublish[draft.id] ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                  </div>

                  {/* AI Score */}
                  <div style={{ textAlign: 'center', minWidth: 50, flexShrink: 0 }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: draft.score > 75 ? '#16a34a' : draft.score > 55 ? '#d97706' : '#dc2626' }}>{draft.score}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600 }}>AI SCORE</div>
                  </div>

                  <ChevronDown size={16} color="#94a3b8" style={{ transform: expanded === draft.id ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }} />
                </div>

                {/* Expanded Content */}
                {expanded === draft.id && (
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 20px' }}>

                    {/* Campaign details from DB */}
                    <div style={{ marginBottom: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                      {draft.raw.aiGeneratedContent?.headline && (
                        <div style={{ background: '#f8faff', border: '1px solid #e2e8f4', borderRadius: 8, padding: '8px 12px' }}>
                          <div style={{ fontSize: '0.65rem', color: '#8a97b0', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Headline</div>
                          <div style={{ fontSize: '0.8rem', color: '#0f1733', fontWeight: 500, lineHeight: 1.4 }}>{draft.raw.aiGeneratedContent.headline}</div>
                        </div>
                      )}
                      {draft.raw.budgetDaily != null && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8, padding: '8px 12px' }}>
                          <div style={{ fontSize: '0.65rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Daily Budget</div>
                          <div style={{ fontSize: '0.8rem', color: '#0f1733', fontWeight: 600 }}>${draft.raw.budgetDaily} USD</div>
                        </div>
                      )}
                    </div>

                    {/* Ad Components */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Ad Components</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {draft.components.map((comp: string) => {
                          const Icon = componentIcons[comp] || FileEdit;
                          return (
                            <div key={comp} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, background: '#f8f4ff', border: '1px solid #ede9fe', color: '#1e27a8', fontSize: '0.78rem', fontWeight: 600 }}>
                              <Icon size={12} /> {comp}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* AI Recommendation */}
                    <div style={{ background: 'linear-gradient(135deg,#faf5ff,#f3e8ff)', border: '1px solid #e9d5ff', borderRadius: 10, padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 10 }}>
                      <Sparkles size={16} color="#2631d6" style={{ flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2631d6', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Recommendation</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.5 }}>{draft.rec}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEditor(draft.id)}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 8, background: 'linear-gradient(135deg,#2631d6,#1e27a8)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                        <Wand2 size={13} /> Edit Campaign
                      </button>
                      <button style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--glass-border)', background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', fontWeight: 600 }}>
                        <Copy size={13} /> Duplicate
                      </button>
                      <button style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #fee2e2', background: 'var(--bg-card)', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', fontWeight: 600 }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DraftAiRecs;