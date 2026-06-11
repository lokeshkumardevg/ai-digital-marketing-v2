/**
 * Campaigns.tsx — v9
 *
 * Changes from v8:
 * - Added isSameBrand() helper (case-insensitive trim comparison).
 * - BrandReplaceModal now only opens when the new brand name differs from
 *   the existing one. If they match, commitBrandConfirm() is called directly
 *   (silent overwrite, no interruption to the user).
 * - Both code paths that can set replaceRequired (response body + HTTP 409
 *   catch) now go through the same isSameBrand guard.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import {
  Zap, Globe, DollarSign, Brain,
  ShieldCheck, RefreshCw, CheckCircle2, XCircle,
  ArrowRight, TrendingUp,
  Building2, Rocket, AlertTriangle, Loader2,
  X, Upload, Image,
  Sparkles, AlertCircle, LayoutDashboard, History,
} from 'lucide-react';
import axios from 'axios';
import { upsertBrandLocally } from '../../store/slices/workspaceSlice';
import { Header } from '../components/Header';
import AdCampaignDashboard from '../components/Adcampaigndashboard';
// toast import removed


// ============================================================
// TYPES
// ============================================================
interface CompetitorDetail {
  name: string;
  strengths?: string[];
  weaknesses?: string[];
}

interface BrandAssets {
  logoUrl?: string;
  logoPreview?: string;
  websiteImages?: string[];
  favicon?: string;
  brandColors?: string[];
  websiteScreenshot?: string;
}

interface BrandDetails {
  brandId?: string;
  campaignId?: string;
  brand?: {
    name?: string; tagline?: string; industry?: string; founded?: string;
    businessModel?: string; toneOfVoice?: string; registeredAddress?: string;
    CIN?: string; overallScore?: number;
  };
  brandName?: string;
  logo?: string;
  logoPreview?: string;
  industry?: string;
  avgCpc?: number; avgCtr?: number; conversionRate?: number;
  tagline?: string; overallScore?: number; coreObjective?: string;
  website?: string;
  websiteAudit?: any; keywords?: any; competition?: any;
  analyticsDashboard?: any; budget?: any; auditData?: any;
  assets?: BrandAssets;
}

interface PromoObjectiveData {
  businessType: string; adGoal: string; businessGoal: string;
  targetLocations: string; platform: string; promotionType: string;
  dailyBudget: number; platforms: string[];
  headlines?: string[]; primaryTexts?: string[];
  callToAction?: string; finalUrl?: string;
}

interface Message {
  id: string; role: 'user' | 'bot'; type: string; content: any;
}

interface BrandFormData {
  brandName: string; brandUrl: string;
  logoFile: File | null; logoPreview: string | null;
}

interface CampaignSession {
  messages: Message[];
  brandDetails: BrandDetails | null;
  promoData: PromoObjectiveData | null;
  campaignId: string | null;
  viewMode: 'landing' | 'chat' | 'dashboard';
  savedAt: string;
  assets?: BrandAssets;
}

interface BrandSaveOk {
  ok: true;
  replaced: boolean;
  message: string;
}
interface BrandSaveReplace {
  ok: false;
  replaceRequired: true;
  message: string;
  existingBrand: any;
  newBrand: any;
}
type BrandSaveResult = BrandSaveOk | BrandSaveReplace;

interface PendingBrandConfirm {
  formData: BrandFormData;
  updatedBrand: BrandDetails;
  defaultPromo: PromoObjectiveData;
  newMsgs: Omit<Message, 'id'>[];
  existingBrandName: string;
  newBrandName: string;
}

// ============================================================
// HELPERS
// ============================================================
const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
let msgCounter = 0;
const newMsgId = () => `msg-${++msgCounter}`;
type UrlValidationResult =
  | { ok: true; normalizedUrl: string }
  | { ok: false; code: string; message: string };

const validateUrlFormat = (inputUrl: string): UrlValidationResult => {
  const raw = inputUrl?.trim() ?? '';
  if (!raw) return { ok: false, code: 'EMPTY', message: 'Please enter a website URL to analyze.' };
  if (/^(localhost|127\.|192\.168\.|10\.|0\.0\.0\.0)/i.test(raw.replace(/^https?:\/\//i, '')))
    return { ok: false, code: 'LOCALHOST', message: 'Local or private addresses cannot be analyzed.' };
  const withoutProtocol = raw.replace(/^https?:\/\//i, '').replace(/^\/\//, '');
  if (!withoutProtocol.includes('.'))
    return { ok: false, code: 'NO_TLD', message: 'URL must include a domain extension.' };
  let normalized = raw;
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://'))
    normalized = 'https://' + normalized;
  try {
    const parsed = new URL(normalized);
    if (!parsed.hostname.includes('.'))
      return { ok: false, code: 'NO_TLD', message: 'URL must include a domain extension.' };
    return { ok: true, normalizedUrl: normalized };
  } catch {
    return { ok: false, code: 'INVALID_FORMAT', message: 'Invalid URL format.' };
  }
};

const checkUrlReachable = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
    clearTimeout(timeout);
    return true;
  } catch { return false; }
};

const getHostname = (url: string): string => {
  if (!url || typeof url !== 'string') return 'analyzing...';
  try {
    let u = url;
    if (!u.startsWith('http://') && !u.startsWith('https://')) u = 'https://' + u;
    return new URL(u).hostname;
  } catch {
    return url.length > 50 ? url.substring(0, 50) + '...' : url;
  }
};

const resolveBrandName = (b: BrandDetails): string =>
  b.brand?.name || b.brandName || b.auditData?.brand?.name || 'Brand';
const resolveIndustry = (b: BrandDetails): string =>
  b.brand?.industry || b.industry || b.auditData?.brand?.industry || '';

// ============================================================
// ASSET URL NORMALISATION HELPERS
// ============================================================
const toAbsoluteAssetUrl = (path: string | undefined, apiBase: string): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  return `${apiBase.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const firstNonEmpty = (...candidates: (string | undefined)[]): string | undefined =>
  candidates.find(v => typeof v === 'string' && v.trim() !== '');

const fetchBrandAssets = async (
  website: string,
  apiBase: string
): Promise<BrandAssets> => {
  try {
    const { data } = await axios.post(`${apiBase}/campaign/assets`, { website });
    const raw = data?.assets || {};

    const screenshotRaw = raw.websiteScreenshot ?? undefined;
    const websiteScreenshot = toAbsoluteAssetUrl(screenshotRaw, apiBase);

    const logoUrlRaw = toAbsoluteAssetUrl(raw.logoUrl ?? undefined, apiBase);
    const faviconRaw = toAbsoluteAssetUrl(raw.favicon ?? undefined, apiBase);
    const hostname = getHostname(website);
    const googleFavicon = `https://www.google.com/s2/favicons?sz=128&domain=${hostname}`;
    const resolvedLogo = firstNonEmpty(logoUrlRaw, faviconRaw, googleFavicon)!;

    const rawImages: string[] = Array.isArray(raw.websiteImages) ? raw.websiteImages : [];
    const websiteImages = rawImages
      .map(img => toAbsoluteAssetUrl(img, apiBase))
      .filter((img): img is string => !!img);

    return {
      logoUrl: resolvedLogo,
      logoPreview: resolvedLogo,
      favicon: firstNonEmpty(faviconRaw, googleFavicon),
      websiteScreenshot,
      websiteImages,
      brandColors: Array.isArray(raw.brandColors) ? raw.brandColors : [],
    };
  } catch (error) {
    console.error('fetchBrandAssets error:', error);
    const hostname = getHostname(website);
    const googleFavicon = `https://www.google.com/s2/favicons?sz=128&domain=${hostname}`;
    return {
      logoUrl: googleFavicon,
      logoPreview: googleFavicon,
      favicon: googleFavicon,
      websiteImages: [],
      brandColors: [],
    };
  }
};

const nonEmpty = (v: string | undefined): string | undefined =>
  v && v.trim() !== '' ? v : undefined;

const mergeAssets = (existing: BrandAssets | undefined, incoming: Partial<BrandAssets>): BrandAssets => {
  const logoUrl = nonEmpty(incoming.logoUrl) ?? nonEmpty(existing?.logoUrl);
  const logoPreview = nonEmpty(incoming.logoPreview) ?? nonEmpty(existing?.logoPreview) ?? logoUrl;
  const favicon = nonEmpty(incoming.favicon) ?? nonEmpty(existing?.favicon);
  const websiteScreenshot = nonEmpty(incoming.websiteScreenshot) ?? nonEmpty(existing?.websiteScreenshot);

  const incomingImages = Array.isArray(incoming.websiteImages) && incoming.websiteImages.length > 0
    ? incoming.websiteImages : undefined;
  const websiteImages = incomingImages ?? existing?.websiteImages ?? [];

  const incomingColors = Array.isArray(incoming.brandColors) && incoming.brandColors.length > 0
    ? incoming.brandColors : undefined;
  const brandColors = incomingColors ?? existing?.brandColors ?? [];

  return { logoUrl, logoPreview, favicon, websiteScreenshot, websiteImages, brandColors };
};

// ============================================================
// FIX (v9): compare brand names — case-insensitive, trimmed.
// Returns true when both names refer to the same brand so the
// replace-confirmation modal can be skipped.
// ============================================================
const isSameBrand = (a: string, b: string): boolean =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

// ============================================================
// SESSION HOOK
// ============================================================
const useCampaignSession = (userId: string) => {
  const saveSession = useCallback(async (payload: CampaignSession) => {
    if (!userId) return;
    try {
      const enriched: CampaignSession = {
        ...payload,
        savedAt: new Date().toISOString(),
        assets: payload.brandDetails?.assets ?? payload.assets,
      };
      await axios.post(`${API_BASE}/campaign/session/${userId}`, enriched);
    } catch (err) {
      console.warn('[session] save failed:', err);
    }
  }, [userId]);

  const loadSession = useCallback(async (): Promise<CampaignSession | null> => {
    if (!userId) return null;
    try {
      const { data } = await axios.get(`${API_BASE}/campaign/session/${userId}`);
      const session: CampaignSession | null = data?.session ?? null;

      if (session && session.assets && session.brandDetails) {
        session.brandDetails.assets = mergeAssets(
          session.brandDetails.assets,
          session.assets,
        );
      }
      return session;
    } catch {
      return null;
    }
  }, [userId]);

  const clearSession = useCallback(async () => {
    if (!userId) return;
    try {
      await axios.delete(`${API_BASE}/campaign/session/${userId}`);
    } catch (err) {
      console.warn('[session] clear failed:', err);
    }
  }, [userId]);

  return { saveSession, loadSession, clearSession };
};

// ============================================================
// ICONS
// ============================================================
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#3b82f6">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.6h12.4c-.5 2.8-2.1 5.2-4.5 6.8v5.6h7.3c4.3-3.9 6.9-9.7 6.9-16.5z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.6c-2.1 1.4-4.7 2.2-8.6 2.2-6.6 0-12.2-4.5-14.2-10.5H2.3v5.8C6.3 42.6 14.6 48 24 48z" />
    <path fill="#FBBC05" d="M9.8 28.3c-.5-1.4-.8-2.9-.8-4.3s.3-2.9.8-4.3v-5.8H2.3C.8 17.1 0 20.5 0 24s.8 6.9 2.3 10.1l7.5-5.8z" />
    <path fill="#EA4335" d="M24 9.5c3.7 0 7 1.3 9.6 3.8l7.2-7.2C36.9 2.1 31.5 0 24 0 14.6 0 6.3 5.4 2.3 13.9l7.5 5.8C11.8 14 17.4 9.5 24 9.5z" />
  </svg>
);
const TwitterXIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#e7e7e7">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0a66c2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

// ============================================================
// TYPING BUBBLE
// ============================================================
const TypingBubble: React.FC<{ text: string; speed?: number; skipAnimation?: boolean }> = ({
  text, speed = 18, skipAnimation = false,
}) => {
  const [displayed, setDisplayed] = useState(skipAnimation ? text : '');
  const [done, setDone] = useState(skipAnimation);
  const indexRef = useRef(0);
  useEffect(() => {
    if (skipAnimation) { setDisplayed(text); setDone(true); return; }
    indexRef.current = 0; setDisplayed(''); setDone(false);
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else { setDone(true); clearInterval(interval); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, skipAnimation]);
  return (
    <div className="camp-bubble-bot">
      {displayed}
      {!done && <span className="camp-typing-cursor" />}
    </div>
  );
};

// ============================================================
// ERROR BOUNDARY
// ============================================================
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError)
      return this.props.fallback || (
        <div style={{ padding: 16, color: '#ef4444' }}>
          <AlertTriangle size={20} />
          <p>{this.state.error?.message || 'Failed to render'}</p>
        </div>
      );
    return this.props.children;
  }
}

// ============================================================
// RESTORE SESSION BANNER
// ============================================================
const RestoreSessionBanner: React.FC<{
  session: CampaignSession;
  onRestore: () => void;
  onDiscard: () => void;
}> = ({ session, onRestore, onDiscard }) => {
  const brandName = session.brandDetails
    ? resolveBrandName(session.brandDetails)
    : 'your previous campaign';
  const savedDate = new Date(session.savedAt);
  const timeAgo = (() => {
    const diff = Date.now() - savedDate.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return savedDate.toLocaleDateString();
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="restore-banner"
    >
      <div className="restore-banner-icon"><History size={20} /></div>
      <div className="restore-banner-body">
        <div className="restore-banner-title">Resume where you left off</div>
        <div className="restore-banner-sub">
          You have an unsaved campaign for <strong>{brandName}</strong> from {timeAgo}.
        </div>
      </div>
      <div className="restore-banner-actions">
        <button className="restore-btn-primary" onClick={onRestore}>
          <History size={13} /> Resume
        </button>
        <button className="restore-btn-secondary" onClick={onDiscard}>
          <X size={13} /> Discard
        </button>
      </div>
    </motion.div>
  );
};

// ============================================================
// WEBSITE PREVIEW CARD
// ============================================================
const WebsitePreviewCard: React.FC<{ url: string }> = ({ url }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
  const hostname = (() => { try { return new URL(cleanUrl).hostname; } catch { return cleanUrl; } })();
  const screenshotSrc = `${API_BASE}/campaign/screenshot?url=${encodeURIComponent(cleanUrl)}`;
  const fallbackSrc = `https://www.google.com/s2/favicons?sz=128&domain=${hostname}`;
  return (
    <div className="site-preview-card">
      <div className="site-preview-browser-bar">
        <div className="site-preview-dots">
          <span className="red" /><span className="yellow" /><span className="green" />
        </div>
        <div className="site-preview-url-bar"><Globe size={12} /><span>{hostname}</span></div>
        <div className="site-preview-ai-badge"><span className="dot" />AI scanning</div>
      </div>
      <div className="site-preview-img-wrap">
        {!imgLoaded && !imgError && <div className="site-preview-loading"><Loader2 className="spin" size={24} /></div>}
        {!imgError && (
          <img
            src={screenshotSrc}
            alt={`${hostname} preview`}
            className={`site-preview-img ${imgLoaded ? 'loaded' : ''}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}
        {imgError && (
          <div className="site-preview-fallback">
            <img src={fallbackSrc} alt="favicon" className="fallback-icon" />
            <h3>{hostname}</h3>
          </div>
        )}
        {imgLoaded && !imgError && (
          <div className="site-preview-loaded-badge"><CheckCircle2 size={14} /> Homepage Captured</div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// RESEARCH TERMINAL
// ============================================================
const ResearchTerminal: React.FC<{ url?: string }> = ({ url }) => {
  const safeUrl = typeof url === 'string' ? url.trim() : '';
  const [logs, setLogs] = useState<string[]>([`> Connecting to ${getHostname(safeUrl)}...`]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!safeUrl) return;
    const lines = [
      '> Fetching DOM structure...',
      '> Capturing website screenshot...',
      '> Extracting brand images & logos...',
      '> Analyzing SEO meta tags...',
      '> Checking performance metrics...',
      '[SUCCESS] Brand assets extracted',
      '> Analyzing competitors...',
      '> Extracting keywords...',
      '[SUCCESS] Analysis complete',
      '> Generating AI campaign report...',
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setLogs(prev => [...prev, lines[i] ?? '']);
        if (i === 1) setShowPreview(true);
        i++;
      } else clearInterval(interval);
    }, 600);
    return () => clearInterval(interval);
  }, [safeUrl]);

  return (
    <div className="camp-terminal">
      <div className="camp-terminal-header">
        <span><Brain size={11} /></span>
        <span className="camp-terminal-url">{getHostname(safeUrl)}</span>
      </div>
      {showPreview && safeUrl && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 10 }}
        >
          <WebsitePreviewCard url={safeUrl} />
        </motion.div>
      )}
      {logs.map((log, idx) => (
        <div key={idx} className={`camp-log-line ${log.includes('SUCCESS') ? 'success' : ''}`}>{log}</div>
      ))}
      <span className="camp-cursor" />
    </div>
  );
};

// ============================================================
// BRAND DETAILS FORM
// ============================================================
const BrandDetailsForm: React.FC<{
  initialName?: string; initialUrl?: string;
  onSubmit: (data: BrandFormData) => Promise<void>;
}> = ({ initialName = '', initialUrl = '', onSubmit }) => {
  const [brandName, setBrandName] = useState(initialName);
  const [brandUrl, setBrandUrl] = useState(initialUrl);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hostname = getHostname(initialUrl);
  const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = ev => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!brandName.trim()) { setError('Brand name is required'); return; }
    if (!brandUrl.trim()) { setError('Brand URL is required'); return; }
    setError('');
    setSaveState('saving');
    try {
      await onSubmit({
        brandName: brandName.trim(),
        brandUrl: brandUrl.trim(),
        logoFile,
        logoPreview,
      });
      setSaveState('done');
    } catch (err: any) {
      setSaveState('error');
      setError(err?.message || 'Something went wrong. Please try again.');
    }
  };

  if (saveState === 'done') return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="brand-form-done"
    >
      <CheckCircle2 size={16} color="#10b981" />
      <span>Brand details confirmed — <strong>{brandName}</strong></span>
    </motion.div>
  );

  const isSaving = saveState === 'saving';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="brand-form-card"
    >
      <div className="brand-form-header">
        <div className="brand-form-icon"><Building2 size={20} /></div>
        <div>
          <div className="brand-form-title">Confirm your brand details</div>
          <div className="brand-form-sub">AI pre-filled these — edit if anything looks off</div>
        </div>
        <div className="brand-form-ai-tag"><Brain size={11} /><span>AI detected</span></div>
      </div>
      <div className="brand-form-grid">
        <div className="brand-form-group">
          <label className="brand-form-label" htmlFor="bf-name"><Building2 size={12} /> Brand name</label>
          <input id="bf-name" className="brand-form-input" type="text" placeholder="e.g. Acme Inc."
            value={brandName}
            disabled={isSaving}
            onChange={e => { setBrandName(e.target.value); setError(''); setSaveState('idle'); }} />
        </div>
        <div className="brand-form-group">
          <label className="brand-form-label" htmlFor="bf-url"><Globe size={12} /> Brand website</label>
          <input id="bf-url" className="brand-form-input" type="url" placeholder="https://acme.com"
            value={brandUrl}
            disabled={isSaving}
            onChange={e => { setBrandUrl(e.target.value); setError(''); setSaveState('idle'); }} />
        </div>
      </div>
      <div className="brand-form-group">
        <label className="brand-form-label"><Image size={12} /> Brand logo</label>
        <div className="brand-logo-row">
          <div className="brand-logo-preview">
            {logoPreview
              ? <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }} />
              : <div className="brand-logo-placeholder"><Image size={20} color="#334155" /></div>}
          </div>
          <div className="brand-logo-controls">
            <input ref={fileInputRef} type="file" accept="image/*,image/svg+xml" style={{ display: 'none' }} onChange={handleLogoChange} />
            <button className="brand-logo-upload-btn" disabled={isSaving} onClick={() => fileInputRef.current?.click()}><Upload size={13} /> Upload logo</button>
            <button className="brand-logo-favicon-btn" disabled={isSaving} onClick={() => setLogoPreview(faviconUrl)}>
              <img src={faviconUrl} alt="favicon" width={14} height={14} style={{ borderRadius: 3 }} />
              Use favicon from {hostname}
            </button>
            {logoPreview && (
              <button className="brand-logo-clear-btn" disabled={isSaving} onClick={() => { setLogoPreview(null); setLogoFile(null); }}>
                <X size={11} /> Clear
              </button>
            )}
            <div className="brand-logo-hint">PNG, SVG, JPG · recommended 256×256px</div>
          </div>
        </div>
      </div>
      {error && <div className="brand-form-error"><AlertCircle size={13} /> {error}</div>}
      <button
        className={`brand-form-submit ${isSaving ? 'saving' : ''}`}
        onClick={handleSubmit}
        disabled={isSaving}
      >
        {isSaving ? (
          <><Loader2 size={16} className="camp-spin" /> Saving brand...</>
        ) : saveState === 'error' ? (
          <><AlertCircle size={16} /> Retry</>
        ) : (
          <><CheckCircle2 size={16} />Confirm brand & continue<ArrowRight size={15} /></>
        )}
      </button>
    </motion.div>
  );
};

// ============================================================
// BRAND AUDIT CARD
// ============================================================
const BrandAuditCard: React.FC<{ brand: BrandDetails }> = ({ brand }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const tabs = ['overview', 'website', 'keywords', 'competition', 'analytics'];
  const displayName = brand.brand?.name || brand.brandName || 'Brand';
  const displayIndustry = brand.brand?.industry || brand.industry || '';
  const overallScore = brand.brand?.overallScore ?? brand.overallScore;
  const scoreColor = (s: number) => s >= 80 ? '#10b981' : s >= 65 ? '#f59e0b' : '#ef4444';
  const intensityColors: Record<string, string> = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
  const intensityWidths: Record<string, string> = { High: '90%', Medium: '55%', Low: '25%' };

  return (
    <div className="audit-card">
      <div className="audit-topbar">
        <div className="audit-brand-identity">
          <div className="audit-brand-icon"><Building2 size={20} /></div>
          <div>
            <div className="audit-brand-name">{displayName}</div>
            <div className="audit-brand-industry">{displayIndustry}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {overallScore && (
            <div className="audit-score-badge">
              <div className="audit-score-num">{overallScore}</div>
              <div className="audit-score-lbl">Score</div>
            </div>
          )}
          <span className="camp-ai-badge">AI Analysis</span>
        </div>
      </div>
      <div className="audit-tabs">
        {tabs.map(t => (
          <button key={t} className={`audit-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="audit-panel">
        {activeTab === 'overview' && (
          <div>
            {brand.coreObjective && <div className="audit-objective">🎯 {brand.coreObjective}</div>}
            <div className="audit-section-card">
              <h4><Building2 size={16} color="#3b82f6" /> Brand Details</h4>
              {brand.brand?.tagline && <div className="audit-info-row"><span>Tagline</span><p>"{brand.brand.tagline}"</p></div>}
              {brand.brand?.businessModel && <div className="audit-info-row"><span>Model</span><strong>{brand.brand.businessModel}</strong></div>}
              {brand.brand?.toneOfVoice && <div className="audit-info-row"><span>Tone</span><strong>{brand.brand.toneOfVoice}</strong></div>}
              {brand.brand?.CIN && <div className="audit-info-row"><span>CIN</span><strong className="audit-mono">{brand.brand.CIN}</strong></div>}
            </div>
          </div>
        )}
        {activeTab === 'website' && brand.websiteAudit && (() => {
          const wa = brand.websiteAudit;
          const scores: [string, number][] = [
            ['Overall', wa.overallScore], ['SEO', wa.seoScore], ['Perf', wa.performanceScore],
            ['UX', wa.uxScore], ['Content', wa.contentScore], ['Technical', wa.technicalScore],
            ['Mobile', wa.mobileScore], ['Security', wa.securityScore],
          ].filter(([, v]) => v != null) as [string, number][];
          return (
            <div>
              <div className="audit-score-circles">
                {scores.map(([label, val]) => (
                  <div key={label} className="audit-circle" style={{ borderColor: `${scoreColor(val)}40` }}>
                    <div className="ac-value" style={{ color: scoreColor(val) }}>{val}</div>
                    <div className="ac-label">{label}</div>
                  </div>
                ))}
              </div>
              {wa.criticalIssue && <div className="audit-issue-list"><div className="audit-issue critical">⚠️ {wa.criticalIssue}</div></div>}
              {wa.findings?.length > 0 && <div className="audit-issue-group"><div className="audit-issue-group-label">Findings</div>{wa.findings.map((f: string, i: number) => <div key={i} className="audit-issue warning">📋 {f}</div>)}</div>}
              {wa.technicalIssues?.length > 0 && <div className="audit-issue-group"><div className="audit-issue-group-label">Technical Issues</div>{wa.technicalIssues.map((t: string, i: number) => <div key={i} className="audit-issue critical">🔧 {t}</div>)}</div>}
              {wa.quickWins?.length > 0 && <div className="audit-issue-group"><div className="audit-issue-group-label">Quick Wins</div>{wa.quickWins.map((w: string, i: number) => <div key={i} className="audit-issue success">✅ {w}</div>)}</div>}
            </div>
          );
        })()}
        {activeTab === 'keywords' && brand.keywords && (
          <div>
            {brand.keywords.primary?.length > 0 && <div className="audit-kw-section"><h4>Primary Keywords</h4><div className="audit-pills">{brand.keywords.primary.map((k: string) => <span key={k} className="audit-pill blue">{k}</span>)}</div></div>}
            {brand.keywords.secondary?.length > 0 && <div className="audit-kw-section"><h4>Secondary Keywords</h4><div className="audit-pills">{brand.keywords.secondary.map((k: string) => <span key={k} className="audit-pill purple">{k}</span>)}</div></div>}
            {brand.keywords.longTail?.length > 0 && <div className="audit-kw-section"><h4>Long-Tail Keywords</h4><div className="audit-pills">{brand.keywords.longTail.map((k: string) => <span key={k} className="audit-pill teal">{k}</span>)}</div></div>}
          </div>
        )}
        {activeTab === 'competition' && brand.competition && (() => {
          const c = brand.competition;
          const ic = intensityColors[c.intensity] || '#f59e0b';
          const iw = intensityWidths[c.intensity] || '50%';
          return (
            <div>
              <div className="comp-intensity-bar">
                <span>Intensity</span>
                <div className="comp-bar-track"><div className="comp-bar-fill" style={{ width: iw }} /></div>
                <span className="comp-intensity-label" style={{ color: ic }}>{c.intensity}</span>
              </div>
              {c.competitors?.map((comp: CompetitorDetail, i: number) => (
                <div key={i} className="competitor-card">
                  <div className="competitor-name">{comp.name}</div>
                  <div className="comp-sw-grid">
                    <div className="comp-sw-box"><div className="comp-sw-title green">Strengths</div><ul className="comp-sw-list">{comp.strengths?.map((s, j) => <li key={j}>{s}</li>)}</ul></div>
                    <div className="comp-sw-box"><div className="comp-sw-title red">Weaknesses</div><ul className="comp-sw-list">{comp.weaknesses?.map((w, j) => <li key={j}>{w}</li>)}</ul></div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
        {activeTab === 'analytics' && brand.analyticsDashboard && (() => {
          const a = brand.analyticsDashboard;
          return (
            <div>
              <div className="audit-analytics-grid">
                {a.estimatedMonthlyVisits && <div className="aa-metric"><div className="aa-value">{Number(a.estimatedMonthlyVisits).toLocaleString()}</div><div className="aa-label">Monthly Visits</div></div>}
                {a.estimatedDomainAuthority && <div className="aa-metric"><div className="aa-value">{a.estimatedDomainAuthority}</div><div className="aa-label">Domain Authority</div></div>}
                {a.bounceRate && <div className="aa-metric"><div className="aa-value">{a.bounceRate}</div><div className="aa-label">Bounce Rate</div></div>}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

// ============================================================
// BRAND VALUE CARD
// ============================================================
const BrandValueCard: React.FC<{ brand: BrandDetails }> = ({ brand }) => {
  const myScore = brand?.brand?.overallScore ?? 65;
  const competitors = brand?.competition?.competitors ?? [];
  const bName = brand?.brand?.name || 'Your Brand';
  const rows = [
    { name: bName, score: myScore, isUs: true },
    ...competitors.slice(0, 3).map((c: any) => ({
      name: c.name, score: c.score || Math.max(20, Math.min(95, myScore - 10)), isUs: false,
    })),
  ];
  const withUs = [myScore, Math.min(myScore + 5, 99), Math.min(myScore + 10, 99), Math.min(myScore + 20, 99), Math.min(myScore + 30, 99)];
  const scoreColor = (s: number) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';
  const maxScore = Math.max(...rows.map(r => r.score), 100);

  return (
    <div className="bvc-wrap">
      <div className="bvc-header">
        <div className="bvc-header-icon"><TrendingUp size={18} /></div>
        <div>
          <div className="bvc-title">Brand Value Intelligence</div>
          <div className="bvc-sub">How you compare & where campaigns take you</div>
        </div>
      </div>
      <div className="bvc-section-label">📊 Brand Score vs Competitors</div>
      <div className="bvc-score-rows">
        {rows.map((row, i) => (
          <div key={i} className={`bvc-score-row ${row.isUs ? 'is-us' : ''}`}>
            <div className="bvc-score-name">
              {row.isUs && <span className="bvc-us-dot" />}
              {row.name}
              {row.isUs && <span className="bvc-us-badge">You</span>}
            </div>
            <div className="bvc-score-bar-wrap">
              <div className="bvc-score-bar-track">
                <div className="bvc-score-bar-fill" style={{
                  width: `${(row.score / maxScore) * 100}%`,
                  background: row.isUs
                    ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                    : `${scoreColor(row.score)}88`,
                }} />
              </div>
              <span className="bvc-score-num" style={{ color: row.isUs ? '#60a5fa' : scoreColor(row.score) }}>{row.score}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bvc-insight">
        <Zap size={13} color="#f59e0b" />
        <span>Our campaigns can grow your brand score from <strong style={{ color: '#60a5fa' }}>{myScore}</strong> to <strong style={{ color: '#10b981' }}>{withUs[4]}</strong> in 12 months.</span>
      </div>
    </div>
  );
};

// ============================================================
// EDITABLE PROMO OBJECTIVE
// ============================================================


const EditablePromoObjective: React.FC<{
  brandName: string;
  initialData: PromoObjectiveData;
  onGenerate: (data: PromoObjectiveData) => void;
  onDecline: () => void;
  user: any
}> = ({ brandName, initialData, onGenerate, onDecline: _onDecline, user }) => {
  const [data, setData] = useState<PromoObjectiveData>(initialData);
  const [submitted, setSubmitted] = useState(false);
  const businessTypes = ['Online Shopping', 'Solution & Online Service', 'Local Store & Service', 'App'];
  const set = (key: keyof PromoObjectiveData, val: any) => setData(prev => ({ ...prev, [key]: val }));
  const PLATFORM_OPTIONS = [
    {
      value: 'meta',
      label: 'Meta',
      icon: <FacebookIcon />,
      connected: !!user?.metaAccessToken,

    },
    {
      value: 'google',
      label: 'Google',
      icon: <GoogleIcon />,
      connected: !!(user?.googleRefreshToken || user?.googleAccessToken),
    },
    {
      value: 'twitter',
      label: 'Twitter/X',
      icon: <TwitterXIcon />,
      connected: !!user?.twitterAccessToken,
    },
    {
      value: 'linkedin',
      label: 'LinkedIn',
      icon: <LinkedInIcon />,
      connected: !!user?.linkedinAccessToken,
    },
  ];
  if (submitted) return (
    <div className="brand-form-done">
      <Rocket size={16} color="#10b981" />
      <span>Campaign generating for <strong>{brandName}</strong>…</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="promo-obj-card"
    >
      <div className="promo-obj-banner">
        <Sparkles size={18} />
        <p>🎉 All set! Your best ad strategy is ready. Review your goals below and edit anything before generating.</p>
      </div>
      <div className="promo-obj-header">
        <div className="promo-obj-icon"><Rocket size={22} /></div>
        <div>
          <h3>Promotion Objective</h3>
          <p>AI-analyzed <strong>{brandName}</strong> — edit any field below</p>
        </div>
      </div>
      <div className="promo-obj-grid">
        <div className="promo-field">
          <label>Business Type</label>
          <select className="promo-select" value={data.businessType} onChange={e => set('businessType', e.target.value)}>
            {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="promo-field">
          <label>Ad Performance Goal</label>
          <select className="promo-select" value={data.adGoal} onChange={e => set('adGoal', e.target.value)}>
            {['In-web actions', 'Brand awareness', 'Lead generation', 'App installs', 'Video views', 'Store visits'].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="promo-field">
          <label>Business Goal</label>
          <select className="promo-select" value={data.businessGoal} onChange={e => set('businessGoal', e.target.value)}>
            {['Sales', 'Lead generation', 'Brand awareness', 'Customer retention', 'App growth', 'Traffic'].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="promo-field">
          <label>Target Locations</label>
          <input className="promo-input" value={data.targetLocations} onChange={e => set('targetLocations', e.target.value)} placeholder="e.g. India, USA" />
        </div>
        <div className="promo-field">
          <label>Ad Platforms</label>

          <div className="promo-platform-row">
  {PLATFORM_OPTIONS.map(p => {
    const isActive = data.platforms?.includes(p.value);

    return (
      <div key={p.value} className="platform-wrapper">
        <button
          type="button"
          className={`promo-plat-btn ${isActive ? 'active' : ''}`}
          onClick={() => {

            const current = data.platforms || [];

            const updated = isActive
              ? current.filter(v => v !== p.value)
              : [...current, p.value];

            set('platforms', updated);
          }}
        >
          {p.icon}
          <span>{p.label}</span>
        </button>

        {/* 👇 Tooltip */}
        {!p.connected && (
          <div className="platform-tooltip">
            Please connect {p.label} account in AdStudio first
          </div>
        )}
      </div>
    );
  })}
</div>
        </div>
        <div className="promo-field">
          <label>Promotion Type</label>
          <select className="promo-select" value={data.promotionType} onChange={e => set('promotionType', e.target.value)}>
            {['Long-term', 'Short-term', 'Seasonal', 'Event-based', 'Always-on'].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="promo-field promo-field-full">
          <label>Suggested Daily Limit (USD)</label>
          <div className="promo-budget-row">
            <input className="promo-input promo-budget-input" type="number" min={1}
              value={data.dailyBudget} onChange={e => set('dailyBudget', Number(e.target.value))} />
            <span className="promo-budget-unit">USD / day</span>
          </div>
        </div>
      </div>
      <div className="promo-benefits">
        {['AI-optimized budget allocation', 'Multi-platform campaign setup', 'Real-time performance tracking', 'Automatic ROI optimization'].map(item => (
          <div key={item} className="promo-benefit-row">
            <CheckCircle2 size={15} className="benefit-check" /><span>{item}</span>
          </div>
        ))}
      </div>
      <div className="promo-actions">
<button
  className="promo-generate-btn"
  onClick={() => {
    const cleanedData: PromoObjectiveData = {
      ...data,
      platforms: data.platforms || [],
    };

    setSubmitted(true);
    onGenerate(cleanedData);
  }}
>
  <Rocket size={18} /> Generate Campaign
</button>
      </div>
    </motion.div>
  );
};

// ============================================================
// GO TO DASHBOARD CARD
// ============================================================
const GoToDashboardCard: React.FC<{ campaignId?: string; onGoToDashboard?: () => void }> = ({ campaignId, onGoToDashboard }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="go-to-dashboard-card loader-card">
    <div className="gtds-header">
      <div className="gtds-icon loader-spin"><LayoutDashboard size={24} /></div>
      <div className="gtds-content">
        <h3>Launching campaign dashboard...</h3>
        <p>Preparing AI campaign workspace</p>
      </div>
    </div>
    <div className="gtds-progress"><div className="gtds-progress-bar" /></div>
    {campaignId && (
      <div className="gtds-info">
        <span>Campaign ID:</span><code>{campaignId.slice(0, 20)}...</code>
      </div>
    )}
    <button className="gtds-dashboard-btn" onClick={onGoToDashboard}>
      <LayoutDashboard size={16} />Open Dashboard
    </button>
  </motion.div>
);

// ============================================================
// BRAND REPLACE CONFIRMATION MODAL
// ============================================================
const BrandReplaceModal: React.FC<{
  existingBrandName: string;
  newBrandName: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ existingBrandName, newBrandName, onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="brand-replace-overlay"
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 24 }}
      transition={{ duration: 0.25 }}
      className="brand-replace-modal"
    >
      <div className="brm-icon-wrap">
        <AlertTriangle size={28} color="#f59e0b" />
      </div>
      <h3 className="brm-title">Replace Existing Brand?</h3>
      <p className="brm-body">
        You already have <strong>"{existingBrandName}"</strong> saved.
        <br />
        Do you want to replace it with <strong>"{newBrandName}"</strong>?
      </p>
      <div className="brm-note">
        <AlertCircle size={13} /> Your previous brand data will be overwritten.
      </div>
      <div className="brm-actions">
        <button className="brm-btn-cancel" onClick={onCancel}>
          <X size={14} /> Keep "{existingBrandName}"
        </button>
        <button className="brm-btn-confirm" onClick={onConfirm}>
          <RefreshCw size={14} /> Replace with "{newBrandName}"
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================
export const Campaigns: React.FC = () => {
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState<string>('');
  const [urlStatus, setUrlStatus] = useState<'idle' | 'checking' | 'valid' | 'error'>('idle');
  const [isChatMode, setIsChatMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state: any) => state.auth);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [brandDetails, setBrandDetails] = useState<BrandDetails | null>(null);
  const [promoData, setPromoData] = useState<PromoObjectiveData | null>(null);
  const campaignIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [viewMode, setViewMode] = useState<'landing' | 'chat' | 'dashboard'>('landing');

  const [pendingSession, setPendingSession] = useState<CampaignSession | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const isFirstRender = useRef(true);

  const [pendingBrandConfirm, setPendingBrandConfirm] = useState<PendingBrandConfirm | null>(null);

  const userId = user?._id || '';
  const dispatch = useDispatch();
  const { saveSession, loadSession, clearSession } = useCampaignSession(userId);

  useEffect(() => {
    if (!userId) return;
    loadSession().then(session => {
      if (session && session.messages?.length > 0) setPendingSession(session);
      setSessionChecked(true);
    });
  }, [userId, loadSession]);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (!userId || viewMode === 'landing') return;
    saveSession(buildSessionSnapshot(messages, brandDetails, promoData, campaignIdRef.current, viewMode));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  if (!userId) { window.location.href = '/login'; return null; }

  const addMsg = (msgs: Omit<Message, 'id'>[]) =>
    setMessages(prev => [...prev, ...msgs.map(m => ({ ...m, id: newMsgId() }))]);

  const isLatestOfType = (msgId: string, type: string) => {
    const idx = messages.findIndex(m => m.id === msgId);
    return !messages.slice(idx + 1).some(m => m.type === type);
  };

  const buildSessionSnapshot = (
    msgs: Message[],
    brand: BrandDetails | null,
    promo: PromoObjectiveData | null,
    campId: string | null,
    view: 'landing' | 'chat' | 'dashboard',
  ): CampaignSession => {
    const currentAssets: BrandAssets | undefined = brand?.assets
      ? { ...brand.assets }
      : undefined;

    const brandWithAssets: BrandDetails | null = brand
      ? { ...brand, assets: currentAssets }
      : null;

    return {
      messages: msgs,
      brandDetails: brandWithAssets,
      promoData: promo,
      campaignId: campId,
      viewMode: view,
      savedAt: new Date().toISOString(),
      assets: currentAssets,
    };
  };

  const handleRestoreSession = () => {
    if (!pendingSession) return;

    let restoredBrand = pendingSession.brandDetails;
    if (restoredBrand && pendingSession.assets) {
      restoredBrand = {
        ...restoredBrand,
        assets: mergeAssets(restoredBrand.assets, pendingSession.assets),
      };
    }

    setMessages(pendingSession.messages);
    setBrandDetails(restoredBrand);
    setPromoData(pendingSession.promoData);
    campaignIdRef.current = pendingSession.campaignId;

    const restoredView = pendingSession.viewMode ?? 'chat';
    setViewMode(restoredView);
    setIsChatMode(restoredView !== 'landing');
    setPendingSession(null);
  };

  const handleDiscardSession = async () => {
    setPendingSession(null);
    await clearSession();
  };

  const handleBackToChat = useCallback(() => {
    setViewMode('chat');
    setIsChatMode(true);
  }, []);

  const handleReset = async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    await clearSession();
    setIsChatMode(false);
    setUrl('');
    setMessages([]);
    setBrandDetails(null);
    setPromoData(null);
    campaignIdRef.current = null;
    setViewMode('landing');
    setUrlStatus('idle');
    setUrlError('');
    setPendingSession(null);
    isFirstRender.current = true;
  };

  const handleDashboardSaveDraft = useCallback(async (result: { success: boolean }) => {
    if (result.success) {
      await clearSession();

      // Reset everything → back to landing page with clean state
      setMessages([]);
      setBrandDetails(null);
      setPromoData(null);
      campaignIdRef.current = null;
      setViewMode('landing');
      setIsChatMode(false);
      setUrl('');
      setUrlStatus('idle');
      setUrlError('');
      setPendingSession(null);
      isFirstRender.current = true;
    }
  }, [clearSession]);

  const handleDashboardPublish = useCallback(async (result: { success: boolean; message?: string }, _planId?: string) => {
    if (result.success) await clearSession();
  }, [clearSession]);

  // ── STEP 1: Deep research + asset extraction ──────────────
  const handleDeepResearch = async () => {
    const formatResult = validateUrlFormat(url);
    if (!formatResult.ok) { setUrlError(formatResult.message); setUrlStatus('error'); return; }
    const normalizedUrl = formatResult.normalizedUrl;
    setUrlStatus('checking'); setUrlError(''); setLoading(true);
    const reachable = await checkUrlReachable(normalizedUrl);
    if (!reachable) { setUrlStatus('error'); setUrlError("We couldn't reach this website."); setLoading(false); return; }
    setUrlStatus('valid'); setIsChatMode(true); setViewMode('chat');

    const initialMessages: Message[] = [
      { id: newMsgId(), role: 'user', type: 'text', content: normalizedUrl },
      { id: newMsgId(), role: 'bot', type: 'text', content: 'Initializing Neural Engine... Analyzing website structure:' },
      { id: newMsgId(), role: 'bot', type: 'research', content: { url: normalizedUrl } },
    ];
    setMessages(initialMessages);

    try {
      const domain = new URL(normalizedUrl).hostname.replace('www.', '').split('.')[0];

      const [brandResp, assets] = await Promise.all([
        axios.post(`${API_BASE}/campaign/discover`, { website: normalizedUrl, brandName: domain }),
        fetchBrandAssets(normalizedUrl, API_BASE),
      ]);

      const brand: BrandDetails = {
        ...brandResp.data,
        website: normalizedUrl,
        assets,
        logoPreview: assets.logoPreview ?? assets.logoUrl ?? assets.favicon,
      };
      setBrandDetails(brand);
      if (brand.campaignId) campaignIdRef.current = brand.campaignId;
      setLoading(false);

      const name = resolveBrandName(brand);
      const industry = resolveIndustry(brand);
      const assetSummary = [
        assets.websiteImages?.length ? `${assets.websiteImages.length} website images` : null,
        assets.favicon ? '1 favicon/logo' : null,
        assets.websiteScreenshot ? '1 screenshot' : null,
      ].filter(Boolean).join(', ');

      const newMsgs: Omit<Message, 'id'>[] = [
        { role: 'bot', type: 'audit', content: brand },
        { role: 'bot', type: 'brand_form', content: { brandName: name, brandUrl: normalizedUrl } },
        { role: 'bot', type: 'text', content: `✅ Brand analysis complete for ${name} in the ${industry} industry.\n${assetSummary ? `📸 Brand assets extracted: ${assetSummary}.\n` : ''}Please confirm your brand details above, then we'll build your campaign.` },
      ];
      setMessages(prev => {
        const updated = [...prev, ...newMsgs.map(m => ({ ...m, id: newMsgId() }))];
        saveSession(buildSessionSnapshot(updated, brand, null, brand.campaignId || null, 'chat'));
        return updated;
      });
    } catch (e) {
      console.error(e); setLoading(false);
      addMsg([{ role: 'bot', type: 'text', content: '❌ Failed to analyze website. Please try again.' }]);
    }
  };

  // ── STEP 2: Brand form submitted ─────────────────────────
  const handleBrandFormSubmit = async (data: BrandFormData) => {
    if (!brandDetails) return;

    const mergedAssets = mergeAssets(brandDetails.assets, {
      logoUrl: data.logoPreview || undefined,
      logoPreview: data.logoPreview || undefined,
    });

    const updatedBrand: BrandDetails = {
      ...brandDetails,
      brandName: data.brandName,
      logoPreview: data.logoPreview || brandDetails.logoPreview,
      logo: data.logoPreview || brandDetails.logo,
      assets: mergedAssets,
      brand: brandDetails.brand ? { ...brandDetails.brand, name: data.brandName } : brandDetails.brand,
    };

    const defaultPromo: PromoObjectiveData = {
      businessType: updatedBrand.brand?.businessModel || 'Solution & Online Service',
      adGoal: 'In-web actions',
      businessGoal: 'Sales',
      targetLocations: 'India',
      platform: 'meta',
      promotionType: 'Long-term',
      dailyBudget: 35,
      platforms: ['meta', 'google'],
      finalUrl: data.brandUrl,
      headlines: [
        `Discover ${data.brandName} Today`,
        `Trusted by Thousands — ${data.brandName}`,
        `Get Started with ${data.brandName}`,
      ],
      primaryTexts: [
        `Discover our latest campaign — built for results.`,
        `Affordable and trusted solutions from ${data.brandName}.`,
      ],
      callToAction: 'Learn More',
    };

    const newMsgs: Omit<Message, 'id'>[] = [
      { role: 'user', type: 'text', content: `Brand confirmed: ${data.brandName}${data.logoPreview ? ' (with logo)' : ''}` },
      { role: 'bot', type: 'text', content: `Perfect! 🎯 Here's your brand intelligence and campaign objectives. Review and edit anything before generating:` },
      { role: 'bot', type: 'promo_objective', content: { brandName: data.brandName, promoData: defaultPromo } },
    ];

    const snapshot = buildSessionSnapshot(
      messages, updatedBrand, defaultPromo, campaignIdRef.current, 'chat',
    );

    try {
      const res = await axios.post<BrandSaveResult>(
        `${API_BASE}/campaign/brand-save/${userId}`,
        snapshot,
      );

      const saveResult = res.data;

      if (!saveResult.ok && saveResult.replaceRequired) {
        const existingName =
          (saveResult as any).existingBrand?.name ||
          (saveResult as any).existingBrand?.brandName || '';
        const newName =
          (saveResult as any).newBrand?.name || data.brandName;

        // ── v9 FIX: skip modal when it's the same brand ──
        if (isSameBrand(existingName, newName)) {
          commitBrandConfirm(updatedBrand, defaultPromo, newMsgs, snapshot);
          return;
        }

        setPendingBrandConfirm({
          formData: data,
          updatedBrand,
          defaultPromo,
          newMsgs,
          existingBrandName: existingName || 'existing brand',
          newBrandName: newName,
        });
        return;
      }

      // ok: true — proceed normally
      commitBrandConfirm(updatedBrand, defaultPromo, newMsgs, snapshot);
    } catch (err: any) {
      const status = err?.response?.status;
      const payload = err?.response?.data;

      if (status === 409 && payload?.replaceRequired) {
        const existingName =
          payload?.existingBrand?.name || payload?.existingBrand?.brandName || '';
        const newName = payload?.newBrand?.name || data.brandName;

        // ── v9 FIX: skip modal when it's the same brand ──
        if (isSameBrand(existingName, newName)) {
          commitBrandConfirm(updatedBrand, defaultPromo, newMsgs, snapshot);
          return;
        }

        setPendingBrandConfirm({
          formData: data,
          updatedBrand,
          defaultPromo,
          newMsgs,
          existingBrandName: existingName || 'existing brand',
          newBrandName: newName,
        });
        return;
      }

      console.warn('[brand-save] API error:', err);
      commitBrandConfirm(updatedBrand, defaultPromo, newMsgs, snapshot);
    }
  };

  const commitBrandConfirm = (
    updatedBrand: BrandDetails,
    defaultPromo: PromoObjectiveData,
    newMsgs: Omit<Message, 'id'>[],
    snapshot: CampaignSession,
  ) => {
    setBrandDetails(updatedBrand);
    setPromoData(defaultPromo);
    setMessages(prev => {
      const updatedMsgs = [...prev, ...newMsgs.map(m => ({ ...m, id: newMsgId() }))];
      saveSession({ ...snapshot, messages: updatedMsgs });
      return updatedMsgs;
    });
    dispatch(upsertBrandLocally(updatedBrand));
  };

  const handleBrandReplaceConfirm = async () => {
    if (!pendingBrandConfirm) return;
    const { updatedBrand, defaultPromo, newMsgs } = pendingBrandConfirm;

    setPendingBrandConfirm(null);

    const snapshot = buildSessionSnapshot(
      messages,
      updatedBrand,
      defaultPromo,
      campaignIdRef.current,
      'chat',
    );

    try {
      await axios.post(
        `${API_BASE}/campaign/brand-save/${userId}?forceReplace=true`,
        snapshot,
      );
    } catch (err) {
      console.warn('[brand-save] forceReplace error:', err);
    }

    commitBrandConfirm(updatedBrand, defaultPromo, newMsgs, snapshot);
  };

  const handleBrandReplaceCancel = () => {
    setPendingBrandConfirm(null);
  };

  // ── STEP 3: Generate campaign ─────────────────────────────
  const handleGenerateCampaign = async (finalPromo: PromoObjectiveData) => {
    const name = brandDetails ? resolveBrandName(brandDetails) : 'your brand';
    setPromoData(finalPromo);

    addMsg([{
      role: 'user', type: 'text',
      content: `Generate campaign for ${name} on ${finalPromo.platforms?.join(', ') || finalPromo.platform} — $${finalPromo.dailyBudget}/day`,
    }]);
    setLoading(true);

    try {
      const brandId = brandDetails?.brandId || brandDetails?.campaignId;
      const { data: draft } = await axios.post(`${API_BASE}/campaign/tempdraft`, {
        brandId,
        platforms: finalPromo.platforms || [finalPromo.platform],
        budget: { daily: finalPromo.dailyBudget, total: finalPromo.dailyBudget * 30 },
        userId,
        promoData: finalPromo,
        assets: brandDetails?.assets,
        brandDetails: brandDetails,
      });
      campaignIdRef.current = draft.campaignId;
      await axios.post(`${API_BASE}/campaign/publish/${draft.campaignId}`);
      setLoading(false);

      const successMsgs: Omit<Message, 'id'>[] = [
        { role: 'bot', type: 'text', content: '🎉 Campaign going for creation...' },
        { role: 'bot', type: 'live_dashboard', content: { campaignId: draft.campaignId } },
      ];
      setMessages(prev => {
        const updated = [...prev, ...successMsgs.map(m => ({ ...m, id: newMsgId() }))];
        saveSession(buildSessionSnapshot(updated, brandDetails, finalPromo, draft.campaignId, 'dashboard'));
        return updated;
      });
      setTimeout(() => setViewMode('dashboard'), 3000);
    } catch (err: any) {
      setLoading(false);
      const localId = `local-${Date.now()}`;
      campaignIdRef.current = localId;

      const fallbackMsgs: Omit<Message, 'id'>[] = [
        { role: 'bot', type: 'text', content: '⚠️ Campaign queued — API unavailable. Opening dashboard with your settings.' },
        { role: 'bot', type: 'live_dashboard', content: { campaignId: localId } },
      ];
      setMessages(prev => {
        const updated = [...prev, ...fallbackMsgs.map(m => ({ ...m, id: newMsgId() }))];
        saveSession(buildSessionSnapshot(updated, brandDetails, finalPromo, localId, 'dashboard'));
        return updated;
      });
      setTimeout(() => setViewMode('dashboard'), 2000);
    }
  };

  const handleCampaignDecline = () => {
    const name = brandDetails ? resolveBrandName(brandDetails) : 'your brand';
    addMsg([
      { role: 'user', type: 'text', content: 'Maybe later' },
      { role: 'bot', type: 'text', content: `No problem! The analysis for ${name} has been saved. Come back anytime.` },
    ]);
  };

  // ============================================================
  // LANDING PAGE
  // ============================================================
  if (!isChatMode) {
    return (
      <>
        <style>{CSS}</style>
        <div style={{ background: '#0f172a', color: '#f1f5f9', position: 'fixed', zIndex: 9999, width: '80%' }}><Header /></div>
        <div className="land-root">
          <div className="land-grid" aria-hidden="true" />
          <div className="land-orb land-orb-1" aria-hidden="true" />
          <div className="land-orb land-orb-2" aria-hidden="true" />
          <div className="land-orb land-orb-3" aria-hidden="true" />
          <div className="land-particles" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} className="land-particle" style={{ '--i': i } as any} />
            ))}
          </div>
          <div className="land-content">
            <AnimatePresence>
              {sessionChecked && pendingSession && (
                <RestoreSessionBanner
                  session={pendingSession}
                  onRestore={handleRestoreSession}
                  onDiscard={handleDiscardSession}
                />
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="land-badge">
              <span className="land-badge-dot" /><Zap size={11} /> AI-Powered · Real-time · Multi-Platform
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="land-headline">
              Turn Your Brand Into a
              <span className="land-headline-line2">
                <span className="land-hl-static">Revenue</span>
                <span className="land-hl-machine"> Machine</span>
              </span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="land-sub">
              Drop your URL. Our AI deep-scans your brand, extracts logos & images, builds optimized campaigns across<br />
              Meta, Google, Twitter & LinkedIn — then manages spend for maximum ROI.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="land-input-section">
              <div className={`land-input-shell ${urlStatus === 'error' ? 'is-error' : urlStatus === 'valid' ? 'is-valid' : urlStatus === 'checking' ? 'is-checking' : ''}`}>
                <div className="land-input-prefix">
                  {urlStatus === 'valid' ? <CheckCircle2 size={17} color="#10b981" /> :
                    urlStatus === 'error' ? <XCircle size={17} color="#ef4444" /> :
                      urlStatus === 'checking' ? <Loader2 size={17} color="#38bdf8" className="camp-spin" /> :
                        <Globe size={17} color="#475569" />}
                </div>
                <input
                  value={url}
                  onChange={e => { setUrl(e.target.value); if (urlStatus === 'error') { setUrlStatus('idle'); setUrlError(''); } }}
                  onKeyDown={e => { if (e.key === 'Enter' && !loading && url) handleDeepResearch(); }}
                  placeholder="https://your-company.com"
                  className="land-url-input"
                  disabled={loading}
                  spellCheck={false}
                />
                <button className="land-cta-btn" onClick={handleDeepResearch} disabled={loading || !url || urlStatus === 'checking'}>
                  {loading ? <><Loader2 size={15} className="camp-spin" /> Analyzing</> : <><Rocket size={15} /> Launch AI Scan</>}
                </button>
              </div>
              <AnimatePresence>
                {urlError && (
                  <motion.div className="land-url-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <AlertTriangle size={12} /> {urlError}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="land-input-hint"><ShieldCheck size={12} color="#334155" /> No credit card needed to scan &nbsp;·&nbsp; Results in under 30 seconds</div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="land-platforms">
              <span className="land-platforms-label">Runs campaigns on</span>
              <div className="land-platform-icons">
                {[
                  { name: 'Meta', color: '#3b82f6', icon: <FacebookIcon /> },
                  { name: 'Google', color: '#ea4335', icon: <GoogleIcon /> },
                  { name: 'Twitter', color: '#e7e9ea', icon: <TwitterXIcon /> },
                  { name: 'LinkedIn', color: '#0a66c2', icon: <LinkedInIcon /> },
                ].map(p => (
                  <div key={p.name} className="land-platform-pill" style={{ '--pc': p.color } as any}>
                    {p.icon}<span>{p.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="land-stats">
              {[
                { value: '2,400+', label: 'Campaigns Launched', icon: <Rocket size={16} /> },
                { value: '98.4%', label: 'Analysis Accuracy', icon: <Brain size={16} /> },
                { value: '3.8×', label: 'Avg ROI Uplift', icon: <TrendingUp size={16} /> },
                { value: '$12M+', label: 'Ad Spend Managed', icon: <DollarSign size={16} /> },
              ].map(s => (
                <div key={s.label} className="land-stat-card">
                  <div className="land-stat-icon">{s.icon}</div>
                  <div className="land-stat-value">{s.value}</div>
                  <div className="land-stat-label">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  // ============================================================
  // DASHBOARD VIEW
  // ============================================================
  if (viewMode === 'dashboard') {
    return (
      <>
        <style>{CSS}</style>
        <div className="dashboard-wrapper">
          <AdCampaignDashboard
            brandDetails={brandDetails || undefined}
            promoData={promoData || undefined}
            campaignId={campaignIdRef.current || undefined}
            onBack={handleBackToChat}
            onPublish={handleDashboardPublish}
            onSaveDraft={handleDashboardSaveDraft}
          />
        </div>
      </>
    );
  }

  // ============================================================
  // CHAT VIEW
  // ============================================================
  return (
    <>
      <style>{CSS}</style>
      <div className="camp-header-wrapper">
        <Header />
        <div className="camp-topbar-right">
          {promoData && (
            <button className="camp-dashboard-btn" onClick={() => setViewMode('dashboard')}>
              <LayoutDashboard size={14} /> Dashboard
            </button>
          )}
          <button className="camp-restart-top-right" onClick={handleReset}><RefreshCw size={13} /></button>
        </div>
      </div>
      <div className="camp-chat-page">
        <div className="camp-chat-scroll">
          <div className="camp-chat-inner">
            <AnimatePresence>
              {messages.map(msg => {
                const latest = isLatestOfType(msg.id, msg.type);
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`camp-msg-row ${msg.role}`}
                  >
                    <div className={`camp-avatar ${msg.role}`}>
                      {msg.role === 'bot' ? <Brain size={15} /> : <div className="camp-user-dot" />}
                    </div>
                    <div className="camp-msg-body">
                      {msg.type === 'text' && msg.role === 'bot' && (
                        <TypingBubble text={msg.content} skipAnimation={!!pendingSession} />
                      )}
                      {msg.type === 'text' && msg.role === 'user' && (
                        <div className="camp-bubble-user">{msg.content}</div>
                      )}
                      {msg.type === 'research' && (
                        <ErrorBoundary><ResearchTerminal url={msg.content?.url} /></ErrorBoundary>
                      )}
                      {msg.type === 'audit' && <BrandAuditCard brand={msg.content} />}
                      {msg.type === 'brand_form' && (latest
                        ? <BrandDetailsForm initialName={msg.content?.brandName} initialUrl={msg.content?.brandUrl} onSubmit={handleBrandFormSubmit} />
                        : <div className="camp-bubble-bot camp-muted">Brand details confirmed ✓</div>
                      )}
                      {msg.type === 'promo_objective' && (latest
                        ? <div>
                          <BrandValueCard brand={brandDetails!} />
                          <EditablePromoObjective
                            brandName={msg.content?.brandName}
                            initialData={msg.content?.promoData}
                            onGenerate={handleGenerateCampaign}
                            onDecline={handleCampaignDecline}
                            user={user}
                          />
                        </div>
                        : <div className="camp-bubble-bot camp-muted">Campaign objectives confirmed ✓</div>
                      )}
                      {msg.type === 'live_dashboard' && (
                        <GoToDashboardCard
                          campaignId={msg.content?.campaignId}
                          onGoToDashboard={() => { setViewMode('dashboard'); setIsChatMode(true); }}
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="camp-loading-row">
                  <div className="camp-avatar bot"><Brain size={15} /></div>
                  <div className="camp-ai-thinking">
                    <span className="camp-dot" /><span className="camp-dot" /><span className="camp-dot" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Brand-replace confirmation modal — only shown when brands differ */}
      <AnimatePresence>
        {pendingBrandConfirm && (
          <BrandReplaceModal
            existingBrandName={pendingBrandConfirm.existingBrandName}
            newBrandName={pendingBrandConfirm.newBrandName}
            onConfirm={handleBrandReplaceConfirm}
            onCancel={handleBrandReplaceCancel}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================================
// CSS — unchanged from v8
// ============================================================
const CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  .camp-spin { animation: spin 1s linear infinite; }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .restore-banner {
    display: flex; align-items: center; gap: 14px;
    width: 100%; max-width: 680px; margin-bottom: 24px;
    padding: 14px 16px;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.35);
    border-radius: 14px;
  }
  .restore-banner-icon {
    width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
    background: rgba(99,102,241,0.15); display: flex; align-items: center;
    justify-content: center; color: #a5b4fc;
  }
  .restore-banner-body { flex: 1; min-width: 0; }
  .restore-banner-title { font-size: 0.88rem; font-weight: 700; color: #e2e8f0; margin-bottom: 3px; }
  .restore-banner-sub { font-size: 0.75rem; color: #64748b; }
  .restore-banner-sub strong { color: #94a3b8; }
  .restore-banner-actions { display: flex; gap: 8px; flex-shrink: 0; }
  .restore-btn-primary {
    display: flex; align-items: center; gap: 6px; padding: 9px 16px;
    border-radius: 9px; background: rgba(99,102,241,0.2);
    border: 1px solid rgba(99,102,241,0.45); color: #a5b4fc;
    font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
    white-space: nowrap;
  }
  .restore-btn-primary:hover { background: rgba(99,102,241,0.35); }
  .restore-btn-secondary {
    display: flex; align-items: center; gap: 6px; padding: 9px 14px;
    border-radius: 9px; background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.09); color: #4b5563;
    font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
    white-space: nowrap;
  }
  .restore-btn-secondary:hover { color: #64748b; border-color: rgba(255,255,255,0.15); }

  .camp-header-wrapper { position: fixed; width: 80%; z-index: 100; }
  .camp-topbar-right { position: absolute; top: 130%; right: 10px; transform: translateY(-50%); z-index: 200; display: flex; align-items: center; gap: 10px; }
  .camp-dashboard-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.3); color: #60a5fa; cursor: pointer; font-size: 0.82rem; font-weight: 600; transition: all 0.2s; }
  .camp-dashboard-btn:hover { background: rgba(59,130,246,0.22); }
  .camp-restart-top-right { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #f87171; cursor: pointer; font-size: 0.82rem; font-weight: 600; transition: all 0.2s; }
  .camp-restart-top-right:hover { background: rgba(239,68,68,0.22); }

  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  .land-root { position: relative; min-height: calc(100vh - 68px); background: #020408; overflow: hidden; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; }
  .land-grid { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(59,130,246,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.055) 1px, transparent 1px); background-size: 52px 52px; mask-image: radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%); }
  .land-orb { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(80px); }
  .land-orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%); top: -180px; left: -120px; animation: orbDrift1 14s ease-in-out infinite alternate; }
  .land-orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%); bottom: -100px; right: -80px; animation: orbDrift2 18s ease-in-out infinite alternate; }
  .land-orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(56,189,248,0.10) 0%, transparent 70%); top: 40%; left: 60%; animation: orbDrift1 22s ease-in-out infinite alternate-reverse; }
  @keyframes orbDrift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(40px,30px) scale(1.08); } }
  @keyframes orbDrift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-30px,20px) scale(1.05); } }
  .land-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .land-particle { position: absolute; width: 2px; height: 2px; border-radius: 50%; background: rgba(56,189,248,0.6); left: calc(var(--i) * 5.8% + 2%); top: calc(100% + 10px); animation: particleRise calc(8s + var(--i) * 0.5s) linear infinite; animation-delay: calc(var(--i) * -0.6s); }
  @keyframes particleRise { 0% { transform: translateY(0) scale(1); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 0.4; } 100% { transform: translateY(-110vh) scale(0.3); opacity: 0; } }
  .land-content { position: relative; z-index: 10; width: 100%; max-width: 900px; padding: 120px 24px 100px; text-align: center; display: flex; flex-direction: column; align-items: center; }
  .land-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px 6px 10px; border-radius: 99px; border: 1px solid rgba(99,102,241,0.35); background: rgba(99,102,241,0.08); color: #a5b4fc; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.04em; margin-bottom: 28px; }
  .land-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; box-shadow: 0 0 6px #10b981; animation: pulseDot 2s ease-in-out infinite; }
  @keyframes pulseDot { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.7); } }
  .land-headline { font-size: clamp(2.6rem, 6vw, 4.2rem); font-weight: 700; line-height: 1.08; letter-spacing: -0.03em; color: #f1f5f9; margin: 0 0 6px; }
  .land-headline-line2 { display: block; margin-top: 4px; }
  .land-hl-static { background: linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .land-hl-machine { background: linear-gradient(135deg, #0665ff 50%, #22d3ee 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .land-sub { font-size: 1.05rem; line-height: 1.7; color: #64748b; margin: 20px 0 36px; max-width: 600px; }
  .land-input-section { width: 100%; max-width: 680px; margin-bottom: 24px; }
  .land-input-shell { display: flex; align-items: center; background: rgba(15,23,42,0.95); border: 1px solid rgba(99,102,241,0.3); border-radius: 14px; padding: 6px 6px 6px 16px; transition: border-color 0.2s, box-shadow 0.2s; }
  .land-input-shell:focus-within { border-color: rgba(99,102,241,0.7); box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
  .land-input-shell.is-valid { border-color: rgba(16,185,129,0.6); box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
  .land-input-shell.is-error { border-color: rgba(239,68,68,0.6); box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
  .land-input-shell.is-checking { border-color: rgba(56,189,248,0.5); }
  .land-input-prefix { display: flex; align-items: center; flex-shrink: 0; margin-right: 10px; }
  .land-url-input { flex: 1; background: transparent; border: none; outline: none; font-size: 0.95rem; color: #e2e8f0; font-family: 'JetBrains Mono', monospace; padding: 12px 0; min-width: 0; }
  .land-url-input::placeholder { color: #334155; font-family: 'Space Grotesk', sans-serif; }
  .land-cta-btn { display: flex; align-items: center; gap: 8px; flex-shrink: 0; padding: 13px 24px; border-radius: 10px; background: linear-gradient(135deg, #0665ff 50%, #22d3ee 100%); border: none; color: #fff; font-size: 0.88rem; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.2s; box-shadow: 0 4px 16px rgba(99,102,241,0.35); }
  .land-cta-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(99,102,241,0.5); }
  .land-cta-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .land-url-error { display: flex; align-items: center; gap: 7px; margin-top: 10px; padding: 9px 14px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.22); border-radius: 8px; color: #fca5a5; font-size: 0.8rem; text-align: left; }
  .land-input-hint { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 12px; color: #334155; font-size: 0.75rem; }
  .land-platforms { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 40px; }
  .land-platforms-label { font-size: 0.72rem; color: #334155; letter-spacing: 0.08em; text-transform: uppercase; }
  .land-platform-icons { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: center; }
  .land-platform-pill { display: flex; align-items: center; gap: 7px; padding: 7px 14px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); font-size: 0.8rem; font-weight: 600; color: #64748b; transition: all 0.2s; }
  .land-platform-pill:hover { border-color: var(--pc); color: #94a3b8; transform: translateY(-2px); }
  .land-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; width: 100%; margin-bottom: 56px; }
  .land-stat-card { background: rgba(15,23,42,0.7); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 20px 16px; display: flex; flex-direction: column; align-items: center; gap: 6px; transition: all 0.25s; }
  .land-stat-card:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-3px); }
  .land-stat-icon { color: #6366f1; margin-bottom: 2px; }
  .land-stat-value { font-size: 1.7rem; font-weight: 700; color: #f1f5f9; line-height: 1; }
  .land-stat-label { font-size: 0.7rem; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; }
  .camp-chat-page { width: 100%; min-height: calc(100vh - 68px); background: #0a0a0f; display: flex; flex-direction: column; }
  .camp-chat-scroll { flex: 1; overflow-y: auto; padding: 32px 20px 48px; }
  .camp-chat-inner { max-width: 1020px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; width: 100%; }
  .camp-msg-row { display: flex; gap: 14px; align-items: flex-start; }
  .camp-msg-row.user { flex-direction: row-reverse; }
  .camp-avatar { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; }
  .camp-avatar.bot { background: linear-gradient(135deg, #002f7a, #4f91fc); }
  .camp-avatar.user { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); }
  .camp-user-dot { width: 9px; height: 9px; background: #38bdf8; border-radius: 50%; }
  .camp-msg-body { max-width: calc(100% - 54px); }
  .camp-bubble-bot { padding: 14px 18px; border-radius: 4px 16px 16px 16px; background: rgba(20,20,30,0.85); border: 1px solid rgba(255,255,255,0.05); line-height: 1.6; color: #e2e8f0; white-space: pre-line; font-size: 0.9rem; }
  .camp-typing-cursor { display: inline-block; width: 2px; height: 14px; background: #38bdf8; margin-left: 2px; vertical-align: middle; border-radius: 1px; animation: blink 0.7s step-end infinite; }
  @keyframes blink { 50% { opacity: 0; } }
  .camp-bubble-user { padding: 12px 18px; border-radius: 16px 4px 16px 16px; background: linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.15)); border: 1px solid rgba(59,130,246,0.2); color: #fff; font-size: 0.9rem; }
  .camp-muted { color: #4b5563 !important; font-style: italic; }
  .camp-loading-row { display: flex; gap: 14px; align-items: center; }
  .camp-ai-thinking { display: flex; align-items: center; gap: 5px; padding: 14px 18px; background: rgba(20,20,30,0.85); border: 1px solid rgba(255,255,255,0.05); border-radius: 4px 16px 16px 16px; }
  .camp-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #38bdf8; animation: bounce 1.1s ease-in-out infinite; }
  .camp-dot:nth-child(2) { animation-delay: 0.18s; }
  .camp-dot:nth-child(3) { animation-delay: 0.36s; }
  @keyframes bounce { 0%,80%,100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-6px); opacity: 1; } }
  .camp-ai-badge { padding: 3px 10px; background: linear-gradient(135deg, #0062ff, #5c97f6); border-radius: 20px; font-size: 0.62rem; font-weight: 700; color: #fff; white-space: nowrap; }
  .site-preview-card { width: 100%; border-radius: 20px; overflow: hidden; background: #020817; border: 1px solid rgba(59,130,246,0.2); }
  .site-preview-browser-bar { height: 58px; display: flex; align-items: center; justify-content: space-between; padding: 0 18px; background: rgba(15,23,42,0.95); border-bottom: 1px solid rgba(255,255,255,0.05); }
  .site-preview-dots { display: flex; gap: 8px; }
  .site-preview-dots span { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
  .red { background: #ef4444; } .yellow { background: #f59e0b; } .green { background: #10b981; }
  .site-preview-url-bar { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 12px; background: rgba(255,255,255,0.05); color: #94a3b8; font-size: 13px; }
  .site-preview-ai-badge { display: flex; align-items: center; gap: 8px; color: #38bdf8; font-size: 13px; font-weight: 600; }
  .site-preview-ai-badge .dot { width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; animation: pulseDot 1.4s ease-in-out infinite; }
  .site-preview-img-wrap { position: relative; width: 100%; height: 220px; background: #000; overflow: hidden; }
  .site-preview-img { width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.5s ease; }
  .site-preview-img.loaded { opacity: 1; }
  .site-preview-loading { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; color: #cbd5e1; background: rgba(2,6,23,0.9); }
  .site-preview-fallback { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #020817; color: white; gap: 10px; }
  .fallback-icon { width: 70px; height: 70px; border-radius: 16px; }
  .site-preview-loaded-badge { position: absolute; bottom: 16px; right: 16px; display: flex; align-items: center; gap: 8px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); color: #10b981; border-radius: 12px; font-size: 8px; font-weight: 600; padding: 6px 10px; backdrop-filter: blur(10px); }
  .camp-terminal { background: #080810; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; font-family: 'Courier New', monospace; margin-top: 6px; min-width: 360px; }
  .camp-terminal-header { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #4b5563; font-size: 0.72rem; }
  .camp-terminal-url { color: #3b82f6; }
  .camp-log-line { color: #38bdf8; font-size: 0.78rem; margin-bottom: 4px; line-height: 1.5; }
  .camp-log-line.success { color: #10b981; }
  .camp-cursor { display: inline-block; width: 7px; height: 12px; background: #38bdf8; margin-top: 8px; animation: blink 1s step-end infinite; }
  .brand-form-card { background: rgba(12,18,30,0.95); border: 1px solid rgba(59,130,246,0.22); border-radius: 16px; padding: 22px; margin-top: 6px; max-width: 580px; }
  .brand-form-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 20px; }
  .brand-form-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.25); display: flex; align-items: center; justify-content: center; color: #60a5fa; flex-shrink: 0; }
  .brand-form-title { font-size: 0.95rem; font-weight: 700; color: #fff; }
  .brand-form-sub { font-size: 0.72rem; color: #64748b; margin-top: 3px; }
  .brand-form-ai-tag { display: flex; align-items: center; gap: 5px; padding: 4px 10px; background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25); border-radius: 6px; font-size: 0.65rem; color: #a5b4fc; font-weight: 600; white-space: nowrap; margin-left: auto; flex-shrink: 0; }
  .brand-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
  .brand-form-group { margin-bottom: 14px; }
  .brand-form-label { display: flex; align-items: center; gap: 5px; font-size: 0.72rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 7px; }
  .brand-form-input { width: 100%; padding: 11px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 0.9rem; outline: none; transition: border-color 0.2s; font-family: inherit; }
  .brand-form-input:focus { border-color: rgba(59,130,246,0.5); background: rgba(255,255,255,0.06); }
  .brand-logo-row { display: flex; align-items: flex-start; gap: 12px; }
  .brand-logo-preview { width: 64px; height: 64px; border-radius: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
  .brand-logo-placeholder { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
  .brand-logo-controls { flex: 1; display: flex; flex-direction: column; gap: 7px; }
  .brand-logo-upload-btn { display: flex; align-items: center; gap: 7px; padding: 9px 14px; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.25); border-radius: 9px; color: #60a5fa; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .brand-logo-favicon-btn { display: flex; align-items: center; gap: 7px; padding: 9px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 9px; color: #94a3b8; font-size: 0.78rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
  .brand-logo-clear-btn { display: flex; align-items: center; gap: 5px; padding: 5px 10px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 7px; color: #f87171; font-size: 0.72rem; cursor: pointer; width: fit-content; }
  .brand-logo-hint { font-size: 0.68rem; color: #4b5563; }
  .brand-form-error { display: flex; align-items: center; gap: 7px; margin-bottom: 12px; padding: 9px 12px; background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; color: #fca5a5; font-size: 0.8rem; }
  .brand-form-submit { width: 100%; padding: 13px; background: linear-gradient(135deg, #3b82f6, #2563eb); border: none; border-radius: 12px; color: #fff; font-size: 0.92rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 9px; cursor: pointer; transition: all 0.2s; }
  .brand-form-submit:hover:not(:disabled) { transform: scale(1.02); box-shadow: 0 0 24px rgba(59,130,246,0.35); }
  .brand-form-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
  .brand-form-submit.saving { background: linear-gradient(135deg, #1d4ed8, #1e40af); }
  .brand-form-done { display: flex; align-items: center; gap: 9px; padding: 12px 16px; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.22); border-radius: 10px; color: #6ee7b7; font-size: 0.85rem; margin-top: 4px; }
  .bvc-wrap { background: rgba(12,16,28,0.95); border: 1px solid rgba(59,130,246,0.2); border-radius: 16px; padding: 18px; margin-bottom: 18px; }
  .bvc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .bvc-header-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.15)); display: flex; align-items: center; justify-content: center; color: #60a5fa; flex-shrink: 0; }
  .bvc-title { font-size: 0.92rem; font-weight: 700; color: #fff; }
  .bvc-sub { font-size: 0.72rem; color: #64748b; margin-top: 2px; }
  .bvc-section-label { font-size: 0.72rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 10px; }
  .bvc-score-rows { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
  .bvc-score-row { display: flex; align-items: center; gap: 10px; }
  .bvc-score-row.is-us .bvc-score-name { color: #60a5fa; font-weight: 700; }
  .bvc-score-name { font-size: 0.78rem; color: #94a3b8; width: 120px; flex-shrink: 0; display: flex; align-items: center; gap: 6px; }
  .bvc-us-dot { width: 6px; height: 6px; border-radius: 50%; background: #3b82f6; flex-shrink: 0; }
  .bvc-us-badge { font-size: 0.55rem; padding: 1px 6px; background: rgba(59,130,246,0.2); border: 1px solid rgba(59,130,246,0.4); border-radius: 99px; color: #60a5fa; font-weight: 700; }
  .bvc-score-bar-wrap { flex: 1; display: flex; align-items: center; gap: 8px; }
  .bvc-score-bar-track { flex: 1; height: 8px; background: rgba(255,255,255,0.05); border-radius: 99px; overflow: hidden; }
  .bvc-score-bar-fill { height: 100%; border-radius: 99px; transition: width 0.8s ease; }
  .bvc-score-num { font-size: 0.78rem; font-weight: 700; width: 28px; text-align: right; flex-shrink: 0; }
  .bvc-insight { display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px; background: rgba(245,158,11,0.07); border: 1px solid rgba(245,158,11,0.2); border-radius: 9px; font-size: 0.76rem; color: #cbd5e1; line-height: 1.5; margin-top: 12px; }
  .promo-obj-card { background: rgba(12,16,28,0.97); border: 2px solid rgba(0,86,247,0.3); border-radius: 24px; padding: 22px; max-width: 640px; }
  .promo-obj-banner { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3); background: rgba(16,185,129,0.08); color: #6ee7b7; font-size: 0.82rem; font-weight: 500; }
  .promo-obj-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
  .promo-obj-icon { width: 48px; height: 48px; border-radius: 14px; background: rgba(92,151,246,0.15); border: 1px solid rgba(92,146,246,0.3); display: flex; align-items: center; justify-content: center; color: #0066ff; flex-shrink: 0; }
  .promo-obj-header h3 { margin: 0 0 4px; font-size: 1.1rem; font-weight: 700; color: #fff; }
  .promo-obj-header p { margin: 0; font-size: 0.78rem; color: #64748b; }
  .promo-obj-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }
  .promo-field { display: flex; flex-direction: column; gap: 7px; }
  .promo-field-full { grid-column: 1 / -1; }
  .promo-field label { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .promo-input { padding: 11px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 0.9rem; outline: none; transition: border-color 0.2s; font-family: inherit; width: 100%; }
  .promo-select { padding: 11px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 0.9rem; outline: none; font-family: inherit; width: 100%; cursor: pointer; appearance: none; }
  .promo-select option { background: #1e293b; color: #fff; }
  .promo-platform-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .promo-plat-btn { display: flex; align-items: center; gap: 7px; padding: 9px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #64748b; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .promo-plat-btn.active { border-color: rgba(92,143,246,0.7); background: rgba(139,92,246,0.15); color: #b5cdfd; box-shadow: 0 0 12px rgba(139,92,246,0.2); }
  .promo-budget-row { display: flex; align-items: center; gap: 10px; }
  .promo-budget-input { flex: 1; }
  .promo-budget-unit { color: #64748b; font-size: 0.85rem; white-space: nowrap; }
  .promo-benefits { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; padding: 14px; background: rgba(0,0,0,0.2); border-radius: 12px; }
  .promo-benefit-row { display: flex; align-items: center; gap: 9px; font-size: 0.82rem; color: #94a3b8; }
  .benefit-check { color: #10b981; flex-shrink: 0; }
  .promo-actions { display: flex; gap: 12px; }
  .promo-generate-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 20px; background: linear-gradient(135deg, #0073ff, #022b5e); border: none; border-radius: 14px; color: #fff; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 6px 20px rgba(58,142,237,0.35); }
  .promo-generate-btn:hover { transform: scale(1.02); box-shadow: 0 8px 28px rgba(58,136,237,0.5); }
  .audit-card { background: rgba(12,14,22,0.95); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; margin-top: 6px; overflow: hidden; }
  .audit-topbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .audit-brand-identity { display: flex; align-items: center; gap: 12px; }
  .audit-brand-icon { width: 42px; height: 42px; border-radius: 10px; background: linear-gradient(135deg, #1e3a5f, #1e1b4b); border: 1px solid rgba(59,130,246,0.3); display: flex; align-items: center; justify-content: center; color: #60a5fa; flex-shrink: 0; }
  .audit-brand-name { font-size: 1rem; font-weight: 700; color: #fff; text-transform: capitalize; }
  .audit-brand-industry { font-size: 0.72rem; color: #64748b; margin-top: 2px; }
  .audit-tabs { display: flex; overflow-x: auto; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 0 16px; scrollbar-width: none; }
  .audit-tabs::-webkit-scrollbar { display: none; }
  .audit-tab { padding: 12px 16px; font-size: 0.78rem; font-weight: 600; color: #4b5563; background: transparent; border: none; border-bottom: 2px solid transparent; cursor: pointer; transition: color 0.2s, border-color 0.2s; white-space: nowrap; }
  .audit-tab.active { color: #60a5fa; border-bottom-color: #3b82f6; }
  .audit-panel { padding: 16px; }
  .audit-section-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; }
  .audit-section-card h4 { margin: 0 0 10px; color: #fff; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; }
  .audit-info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .audit-info-row:last-child { border-bottom: none; }
  .audit-info-row span { color: #64748b; font-size: 0.82rem; }
  .audit-info-row strong { color: #e2e8f0; }
  .audit-info-row p { color: #94a3b8; font-size: 0.8rem; font-style: italic; margin: 0; text-align: right; }
  .audit-mono { font-family: 'Courier New',monospace; font-size: 0.72rem !important; }
  .audit-objective { padding: 12px 14px; background: linear-gradient(135deg,rgba(59,130,246,0.08),rgba(139,92,246,0.06)); border: 1px solid rgba(59,130,246,0.18); border-radius: 10px; color: #93c5fd; font-size: 0.82rem; line-height: 1.55; margin-bottom: 12px; }
  .audit-score-circles { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 14px; }
  .audit-circle { width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.03); border: 2px solid rgba(59,130,246,0.3); display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .ac-value { font-size: 1.4rem; font-weight: 800; color: #60a5fa; }
  .ac-label { font-size: 0.6rem; color: #64748b; text-transform: uppercase; }
  .audit-kw-section { margin-bottom: 14px; }
  .audit-kw-section h4 { margin: 0 0 10px; color: #94a3b8; font-size: 0.78rem; text-transform: uppercase; }
  .audit-pills { display: flex; flex-wrap: wrap; gap: 8px; }
  .audit-pill { display: inline-block; padding: 5px 12px; border-radius: 99px; font-size: 0.78rem; font-weight: 500; }
  .audit-pill.blue { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
  .audit-pill.purple { background: rgba(139,92,246,0.15); color: #a78bfa; border: 1px solid rgba(139,92,246,0.3); }
  .audit-pill.teal { background: rgba(20,184,166,0.12); color: #2dd4bf; border: 1px solid rgba(20,184,166,0.28); }
  .audit-issue-list { display: flex; flex-direction: column; gap: 6px; }
  .audit-issue-group { margin-top: 12px; }
  .audit-issue-group-label { font-size: 0.68rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
  .audit-issue { display: flex; align-items: flex-start; gap: 8px; padding: 8px 12px; border-radius: 8px; font-size: 0.78rem; line-height: 1.5; margin-bottom: 5px; }
  .audit-issue.critical { background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.18); color: #fca5a5; }
  .audit-issue.warning { background: rgba(245,158,11,0.07); border: 1px solid rgba(245,158,11,0.18); color: #fcd34d; }
  .audit-issue.success { background: rgba(16,185,129,0.07); border: 1px solid rgba(16,185,129,0.18); color: #6ee7b7; }
  .comp-intensity-bar { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: rgba(255,255,255,0.025); border-radius: 10px; margin-bottom: 12px; }
  .comp-intensity-bar span:first-child { color: #64748b; font-size: 0.78rem; flex-shrink: 0; }
  .comp-bar-track { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; }
  .comp-bar-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444); }
  .comp-intensity-label { font-size: 0.75rem; font-weight: 700; }
  .competitor-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px; margin-bottom: 10px; }
  .competitor-name { font-size: 0.9rem; font-weight: 700; color: #fff; margin-bottom: 10px; }
  .comp-sw-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .comp-sw-box { background: rgba(0,0,0,0.2); border-radius: 8px; padding: 10px; }
  .comp-sw-title { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
  .comp-sw-title.green { color: #10b981; } .comp-sw-title.red { color: #ef4444; }
  .comp-sw-list { list-style: none; display: flex; flex-direction: column; gap: 4px; }
  .comp-sw-list li { font-size: 0.73rem; color: #94a3b8; line-height: 1.4; }
  .audit-analytics-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 14px; }
  .aa-metric { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; text-align: center; }
  .aa-value { font-size: 1.5rem; font-weight: 800; color: #60a5fa; margin-bottom: 4px; }
  .aa-label { font-size: 0.7rem; color: #64748b; text-transform: uppercase; }
  .audit-score-badge { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 52px; height: 52px; border-radius: 12px; background: linear-gradient(135deg,rgba(16,185,129,0.15),rgba(59,130,246,0.1)); border: 1px solid rgba(16,185,129,0.3); }
  .audit-score-num { font-size: 1.2rem; font-weight: 800; color: #10b981; line-height: 1; }
  .audit-score-lbl { font-size: 0.52rem; color: #4b5563; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
  .go-to-dashboard-card { background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.05)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin-top: 6px; max-width: 420px; }
  .gtds-header { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 16px; }
  .gtds-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(16,185,129,0.15); display: flex; align-items: center; justify-content: center; color: #10b981; flex-shrink: 0; }
  .gtds-content h3 { margin: 0; font-size: 16px; font-weight: 700; color: #fff; }
  .gtds-content p { margin: 4px 0 0; opacity: 0.7; font-size: 13px; color: #94a3b8; }
  .gtds-info { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: rgba(0,0,0,0.2); border-radius: 8px; margin-bottom: 16px; color: #64748b; font-size: 0.78rem; }
  .gtds-info code { color: #38bdf8; font-family: monospace; }
  .gtds-progress { width: 100%; height: 8px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; margin-top: 18px; margin-bottom: 16px; }
  .gtds-progress-bar { width: 40%; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #3b82f6, #06b6d4); animation: loadingBar 1.6s ease-in-out infinite; }
  @keyframes loadingBar { 0% { transform: translateX(-100%); } 100% { transform: translateX(260%); } }
  .loader-spin { animation: spin 1.4s linear infinite; }
  .gtds-dashboard-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 12px; color: #fff; font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; }
  .dashboard-wrapper { min-height: 100vh; background: #0a0a0f; }

  .brand-replace-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.72); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
  }
  .brand-replace-modal {
    width: 100%; max-width: 440px;
    background: #0d1117; border: 1px solid rgba(245,158,11,0.35);
    border-radius: 20px; padding: 32px 28px;
    display: flex; flex-direction: column; align-items: center; text-align: center;
    box-shadow: 0 24px 80px rgba(0,0,0,0.6);
  }
  .brm-icon-wrap {
    width: 60px; height: 60px; border-radius: 16px;
    background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.3);
    display: flex; align-items: center; justify-content: center; margin-bottom: 18px;
  }
  .brm-title { font-size: 1.15rem; font-weight: 700; color: #f1f5f9; margin: 0 0 12px; }
  .brm-body { font-size: 0.88rem; color: #94a3b8; line-height: 1.65; margin: 0 0 14px; }
  .brm-body strong { color: #e2e8f0; }
  .brm-note {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 14px; margin-bottom: 24px;
    background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.22);
    border-radius: 8px; color: #fca5a5; font-size: 0.75rem; width: 100%;
  }
  .brm-actions { display: flex; flex-direction: column; gap: 10px; width: 100%; }
  .brm-btn-confirm {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 13px 20px; border-radius: 12px;
    background: linear-gradient(135deg, #dc2626, #991b1b);
    border: none; color: #fff; font-size: 0.9rem; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
  }
  .brm-btn-confirm:hover { transform: scale(1.02); box-shadow: 0 6px 20px rgba(220,38,38,0.4); }
  .brm-btn-cancel {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 13px 20px; border-radius: 12px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
    color: #94a3b8; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .brm-btn-cancel:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
  .platform-wrapper {
  position: relative;
  display: inline-block;
}

/* hidden by default */
.platform-tooltip {
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%);
  background: #111;
  color: #fff;
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: 0.2s ease;
  z-index: 10;
}

/* show on hover */
.platform-wrapper:hover .platform-tooltip {
  opacity: 1;
}
`;

export default Campaigns;