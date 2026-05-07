import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Globe, Target, DollarSign, Search, Brain,
  ShieldCheck, Wallet, RefreshCw, CheckCircle2, XCircle,
  ArrowRight, BriefcaseBusiness, TrendingUp, Users, Eye,
  Building2, Rocket, AlertTriangle, CreditCard, Loader2,
  BarChart2, Link2, Shield, Smartphone, MousePointer, Activity,
  Award, Gauge, Play, Clock, Wifi, WifiOff, ChevronRight,
  Layers, PieChart, MousePointer2, Star, ArrowUpRight, PlusCircle,
  CreditCardIcon, IndianRupee, History, Settings,
  TrendingDown, MousePointerClick, EyeIcon, BarChart,
  RefreshCcw, Pause, PlayCircle, Edit3, MessageSquare,
  LayoutDashboard, ArrowLeft, Download, Share2, Maximize2,
  AlertCircle, CheckCheck, X
} from 'lucide-react';
import axios from 'axios';
import { getAuthUser } from '../../landing/lib/auth';  // adjust path to match your project
import { Header } from '../components/Header';
import LiveDashboard from '../components/CampaignLivedashboard';

// ============================================
// TYPES
// ============================================
interface CompetitorDetail {
  name: string;
  strengths?: string[];
  weaknesses?: string[];
  comparison?: string;
}

interface BrandDetails {
  brandId?: string;
  campaignId?: string;
  brand?: {
    name?: string;
    tagline?: string;
    industry?: string;
    founded?: string;
    businessModel?: string;
    toneOfVoice?: string;
    registeredAddress?: string;
    CIN?: string;
    overallScore?: number;
  };
  brandName?: string;
  logo?: string;
  industry?: string;
  avgCpc?: number;
  avgCtr?: number;
  conversionRate?: number;
  tagline?: string;
  founded?: string;
  overallScore?: number;
  coreObjective?: string;
  websiteAudit?: any;
  keywords?: any;
  competition?: any;
  analyticsDashboard?: any;
  budget?: any;
  auditData?: any;
}

interface BudgetTier {
  label: string;
  totalBudget: number;
  dailyBudget: number;
  platforms: {
    name: string;
    monthlyCharge: number;
    campaignBudget: number;
    ourBudget: number;
    cpcEstimate: number;
    ctrEstimate: number;
    impressionsEstimate: number;
    clicksEstimate: number;
    roiEstimate: number;
  }[];
  total: {
    monthlyCharge: number;
    campaignBudget: number;
    ourBudget: number;
    roiEstimate: number;
  };
  recommended?: boolean;
  description?: string;
}

interface BudgetBreakdown {
  tiers: BudgetTier[];
  aiRecommendation: string;
  userBudget: number;
}

interface PlatformMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
  conversions: number;
  costPerClick: number;
  roi: number;
  cpa?: number;
  frequency?: number;
  reach?: number;
  videoViews?: number;
  engagement?: number;
  qualityScore?: number;
  adRank?: number;
  impressionsShare?: number;
}

interface AdSet {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  budget: number;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  ctr: number;
  roi: number;
}

interface PlatformData {
  name: string;
  status: 'PENDING' | 'CREATING' | 'ACTIVE' | 'PAUSED' | 'FAILED';
  metrics: PlatformMetrics;
  adSets: AdSet[];
  liveUrl?: string;
  lastUpdated: string;
}

interface LiveCampaignData {
  campaignId: string;
  campaignName: string;
  status: 'CREATING' | 'PROCESSING' | 'ACTIVE' | 'PAUSED' | 'FAILED';
  createdAt: string;
  platforms: PlatformData[];
  overallMetrics: {
    totalImpressions: number;
    totalClicks: number;
    totalSpend: number;
    totalConversions: number;
    overallRoi: number;
    avgCtr: number;
    avgCpc: number;
    totalReach: number;
    totalVideoViews: number;
  };
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  balance: number;
  currency: string;
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  type: string;
  content: any;
}

interface AppState {
  url: string;
  urlStatus: string;
  isChatMode: boolean;
  brandDetails: BrandDetails | null;
  selectedPlatform: string;
  budgetBreakdown: BudgetBreakdown | null;
  selectedTier: BudgetTier | null;
  liveCampaign: LiveCampaignData | null;
  campaignId: string | null;
  userProfile: UserProfile;
  messages: Message[];
  viewMode: 'landing' | 'chat' | 'dashboard';
}

// ============================================
// HELPERS
// ============================================
const API_BASE = 'http://localhost:3000';
let msgCounter = 0;
const newMsgId = () => `msg-${++msgCounter}`;
const SESSION_VERSION = 'v2';

// ─── KEY: strictly per-user ──────────────────────────────────
const localKeyForUser = (userId: string) => `nexus_session_${userId}`;
// Prefix used to find ALL nexus session keys for cleanup
const SESSION_KEY_PREFIX = 'nexus_session_';

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
  } catch {
    return false;
  }
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

const fmt = (n: number) =>
  n?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) || '$0';
const fmtINR = (n: number) =>
  n?.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) || '$0';

const generateBudgetTiers = (userBudget: number, platforms: string[]): BudgetBreakdown => {
  const buildTier = (label: string, mult: number, desc: string, recommended = false): BudgetTier => {
    const total = Math.round(userBudget * mult);
    const perPlatform = platforms.length > 1 ? Math.round(total / 2) : total;
    const platformData = platforms.map(p => {
      const cpcMap: Record<string,number> = { meta: 1.2, google: 2.8, twitter: 0.9, linkedin: 5.2 };
      const ctrMap: Record<string,number> = { meta: 0.018, google: 0.032, twitter: 0.012, linkedin: 0.009 };
      const cpc = cpcMap[p] ?? 2.0;
      const ctr = ctrMap[p] ?? 0.015;
      const campaignBudget = Math.round(perPlatform * 0.8);
      const monthlyCharge = Math.round(perPlatform * 0.2);
      const clicks = Math.round(campaignBudget / cpc);
      const impressions = Math.round(clicks / ctr);
      return {
        name: p, monthlyCharge, campaignBudget, ourBudget: perPlatform,
        cpcEstimate: cpc, ctrEstimate: ctr,
        impressionsEstimate: impressions, clicksEstimate: clicks,
        roiEstimate: Math.round(180 + mult * 80),
      };
    });
    const totals = platformData.reduce(
      (acc, p) => ({
        monthlyCharge: acc.monthlyCharge + p.monthlyCharge,
        campaignBudget: acc.campaignBudget + p.campaignBudget,
        ourBudget: acc.ourBudget + p.ourBudget,
        roiEstimate: Math.max(acc.roiEstimate, p.roiEstimate),
      }),
      { monthlyCharge: 0, campaignBudget: 0, ourBudget: 0, roiEstimate: 0 }
    );
    return {
      label, totalBudget: total, dailyBudget: Math.round(total / 30),
      platforms: platformData, total: totals, recommended, description: desc,
    };
  };
  return {
    tiers: [
      buildTier('Starter', 0.7, 'Conservative spend with steady growth. Best for testing the waters.'),
      buildTier('Growth', 1.0, 'Balanced spend matching your budget. Optimal for most businesses.', true),
      buildTier('Scale', 1.5, 'Aggressive spend for maximum reach. Best when you want to dominate.'),
    ],
    aiRecommendation: `Based on your ${platforms.join(' + ')} campaign, the Growth tier at ${fmt(userBudget)}/mo offers the best ROI balance.`,
    userBudget,
  };
};

// ============================================
// SESSION PERSISTENCE — strictly per-user
// ============================================
interface PersistedSession {
  version: string;
  userId: string;   // ← always stored and checked
  timestamp: number;
  url: string;
  urlStatus: string;
  isChatMode: boolean;
  viewMode: 'landing' | 'chat' | 'dashboard';
  brandDetails: BrandDetails | null;
  selectedPlatform: string;
  budgetBreakdown: BudgetBreakdown | null;
  selectedTier: BudgetTier | null;
  liveCampaign: LiveCampaignData | null;
  campaignId: string | null;
  messages: Message[];
}

const buildSession = (userId: string, state: Partial<AppState>): PersistedSession => ({
  version: SESSION_VERSION,
  userId,
  timestamp: Date.now(),
  url: state.url || '',
  urlStatus: state.urlStatus || 'idle',
  isChatMode: state.isChatMode || false,
  viewMode: state.viewMode || 'landing',
  brandDetails: state.brandDetails || null,
  selectedPlatform: state.selectedPlatform || '',
  budgetBreakdown: state.budgetBreakdown || null,
  selectedTier: state.selectedTier || null,
  liveCampaign: state.liveCampaign || null,
  campaignId: state.campaignId || null,
  messages: state.messages || [],
});

const sessionTTL = (session: PersistedSession): number =>
  session.liveCampaign ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

const isSessionValid = (session: PersistedSession): boolean => {
  if (!session || session.version !== SESSION_VERSION) return false;
  return Date.now() - session.timestamp < sessionTTL(session);
};

// ─── Local storage: strictly per-user key ───────────────────
const saveLocal = (session: PersistedSession) => {
  try {
    localStorage.setItem(localKeyForUser(session.userId), JSON.stringify(session));
  } catch {}
};

const loadLocal = (userId: string): PersistedSession | null => {
  try {
    const raw = localStorage.getItem(localKeyForUser(userId));
    if (!raw) return null;
    const s: PersistedSession = JSON.parse(raw);
    // Hard guard: never load another user's data
    if (s.userId !== userId || !isSessionValid(s)) return null;
    // Sanitize messages — ensure every entry has an id
    if (Array.isArray(s.messages)) {
      s.messages = s.messages.map((m, i) => ({ ...m, id: m.id || `msg-local-${i}` }));
    }
    return s;
  } catch {
    return null;
  }
};

const clearLocal = (userId: string) => {
  try {
    localStorage.removeItem(localKeyForUser(userId));
  } catch {}
};

/**
 * FIX: When a new user logs in, wipe ALL other nexus session keys from
 * localStorage so their data never bleeds into the new user's view.
 */
const clearAllOtherUsersLocal = (currentUserId: string) => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SESSION_KEY_PREFIX) && key !== localKeyForUser(currentUserId)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch {}
};

// ─── Remote ──────────────────────────────────────────────────
const saveRemote = async (userId: string, session: PersistedSession): Promise<void> => {
  try {
    await axios.post(`${API_BASE}/campaign/session/save`, { userId, session });
  } catch {}
};

const normalizeRemoteSession = (raw: any, userId: string): PersistedSession | null => {
  if (!raw || typeof raw !== 'object') return null;

  // The backend returns a MongoDB document. Fields we need may live directly
  // on the doc (not nested under a "session" key inside itself).
  // Reconstruct a clean PersistedSession from whatever shape arrives.
  const s = raw;

  // Hard guard: never load another user's data
  if (s.userId !== userId) return null;

  // Derive timestamp: prefer stored timestamp, fall back to updatedAt, createdAt
  const timestamp =
    typeof s.timestamp === 'number'
      ? s.timestamp
      : s.updatedAt
        ? new Date(s.updatedAt).getTime()
        : s.createdAt
          ? new Date(s.createdAt).getTime()
          : 0;

  // Sanitize messages: ensure every message has an id
  const messages: Message[] = Array.isArray(s.messages)
    ? s.messages.map((m: any, i: number) => ({
        ...m,
        id: m.id || `msg-restored-${i}`,
      }))
    : [];

  const session: PersistedSession = {
    version: SESSION_VERSION,   // always stamp current version — don't rely on stored value
    userId: s.userId,
    timestamp,
    url: s.url || '',
    urlStatus: s.urlStatus || 'idle',
    isChatMode: s.isChatMode || false,
    viewMode: s.viewMode || 'landing',
    brandDetails: s.brandDetails || null,
    selectedPlatform: s.selectedPlatform || '',
    budgetBreakdown: s.budgetBreakdown || null,
    selectedTier: s.selectedTier || null,
    liveCampaign: s.liveCampaign || null,
    campaignId: s.campaignId || null,
    messages,
  };

  // Validate TTL using the derived timestamp
  const ttl = session.liveCampaign ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > ttl) return null;

  return session;
};

const loadRemote = async (userId: string): Promise<PersistedSession | null> => {
  try {
    const { data } = await axios.get(`${API_BASE}/campaign/session/${userId}`);
    if (!data?.found || !data?.session) return null;
    return normalizeRemoteSession(data.session, userId);
  } catch {
    return null;
  }
};

const clearRemote = async (userId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE}/campaign/session/${userId}`);
  } catch {}
};

// ─── Beacon on page unload (refresh/close) ───────────────────
const registerRefreshClear = (userId: string) => {
  const handler = () => {
    const blob = new Blob([JSON.stringify({ userId })], { type: 'application/json' });
    navigator.sendBeacon(`${API_BASE}/campaign/session/${userId}/clear`, blob);
    clearLocal(userId);
  };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
};

// ============================================
// DEBOUNCE HELPER
// ============================================
const useDebounce = <T extends (...args: any[]) => any>(fn: T, delay: number): T => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  return useCallback(
    ((...args: any[]) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fnRef.current(...args), delay);
    }) as T,
    [delay]
  );
};

// ============================================
// ICONS
// ============================================
const FacebookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 48 48">
    <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.6h12.4c-.5 2.8-2.1 5.2-4.5 6.8v5.6h7.3c4.3-3.9 6.9-9.7 6.9-16.5z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.6c-2.1 1.4-4.7 2.2-8.6 2.2-6.6 0-12.2-4.5-14.2-10.5H2.3v5.8C6.3 42.6 14.6 48 24 48z" />
    <path fill="#FBBC05" d="M9.8 28.3c-.5-1.4-.8-2.9-.8-4.3s.3-2.9.8-4.3v-5.8H2.3C.8 17.1 0 20.5 0 24s.8 6.9 2.3 10.1l7.5-5.8z" />
    <path fill="#EA4335" d="M24 9.5c3.7 0 7 1.3 9.6 3.8l7.2-7.2C36.9 2.1 31.5 0 24 0 14.6 0 6.3 5.4 2.3 13.9l7.5 5.8C11.8 14 17.4 9.5 24 9.5z" />
  </svg>
);


// const TwitterXIcon = () => (
//   <svg width="24" height="24" viewBox="0 0 24 24" fill="#e7e9ea">
//     <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
//   </svg>
// );

// const LinkedInIcon = () => (
//   <svg width="24" height="24" viewBox="0 0 24 24" fill="#0a66c2">
//     <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
//   </svg>
// );

// ============================================
// AI TYPING BUBBLE
// ============================================
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
      } else {
        setDone(true);
        clearInterval(interval);
      }
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

// ============================================
// ERROR BOUNDARY
// ============================================
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

// ============================================
// CAMPAIGN CONFIRMATION
// ============================================
const CampaignConfirmation: React.FC<{
  brandName: string;
  onConfirm: () => void;
  onDecline: () => void;
}> = ({ brandName, onConfirm, onDecline }) => {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="confirmation-card"
    >
      <div className="confirmation-header">
        <div className="confirmation-icon" style={{ background: `${color}18`, color }}>
          <Rocket size={24} />
        </div>
        <div className="confirmation-text">
          <h3>Ready to launch your campaign?</h3>
          <p>We've analyzed <strong>{brandName}</strong> and identified the best advertising opportunities.</p>
        </div>
      </div>
      <div className="confirmation-benefits">
        {['AI-optimized budget allocation', 'Multi-platform ad campaigns (Meta & Google)', 'Real-time performance tracking', 'Automatic ROI optimization'].map(item => (
          <div key={item} className="confirmation-benefit">
            <CheckCircle2 size={14} color="#10b981" /><span>{item}</span>
          </div>
        ))}
      </div>
      <div className="confirmation-question">
        <Zap size={16} color={color} />
        <span>Would you like to create a campaign for {brandName}?</span>
      </div>
      <div className="confirmation-actions">
        <button className="confirmation-yes-btn" onClick={onConfirm}>
          <Rocket size={18} />Yes, Create My Campaign
        </button>
        <button className="confirmation-no-btn" onClick={onDecline}>Maybe Later</button>
      </div>
    </motion.div>
  );
};

// ============================================
// PAYMENT MODAL
// ============================================
const PaymentModal: React.FC<{
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ amount, onSuccess, onCancel }) => {
  const [showUpi, setShowUpi] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const handleUpiPay = () => {
    if (!upiId || !upiId.includes('@')) { setUpiError('Please enter a valid UPI ID'); return; }
    setProcessing(true);
    setTimeout(() => { setProcessing(false); onSuccess(); }, 2500);
  };

  const handleCardPay = () => {
    if (cardNumber.length < 16 || !expiry || cvv.length < 3) return;
    setProcessing(true);
    setTimeout(() => { setProcessing(false); onSuccess(); }, 2500);
  };

  return (
    <motion.div className="payment-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="payment-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="payment-modal-header">
          <div><Wallet size={24} color="#10b981" /><h3>Add Funds</h3><p>Amount: <strong>{fmtINR(amount)}</strong></p></div>
          <button className="pm-close" onClick={onCancel}><X size={20} /></button>
        </div>
        {!showUpi && !showCardForm && (
          <div className="pm-options">
            <div className="pm-title">Choose Payment Method</div>
            <button className="pm-option" onClick={() => setShowUpi(true)}>
              <div className="pm-option-icon" style={{ background: '#10b98115' }}><Smartphone size={28} color="#10b981" /></div>
              <div className="pm-option-info"><div className="pm-option-name">UPI</div><div className="pm-option-desc">GPay, PhonePe, Paytm, etc.</div></div>
              <span className="pm-badge">Popular</span>
            </button>
            <button className="pm-option" onClick={() => setShowCardForm(true)}>
              <div className="pm-option-icon" style={{ background: '#3b82f615' }}><CreditCard size={28} color="#3b82f6" /></div>
              <div className="pm-option-info"><div className="pm-option-name">Card / Net Banking</div><div className="pm-option-desc">Credit, Debit, Net Banking</div></div>
            </button>
          </div>
        )}
        {showUpi && (
          <div className="pm-upi">
            <button className="pm-back" onClick={() => setShowUpi(false)}><ArrowLeft size={16} /> Back</button>
            <div className="pm-upi-box">
              <label>Enter UPI ID</label>
              <div className="pm-upi-input">
                <input type="text" placeholder="yourname@upi" value={upiId} onChange={e => { setUpiId(e.target.value); setUpiError(''); }} />
                <span>@upi</span>
              </div>
              {upiError && <div className="pm-error"><AlertCircle size={14} /> {upiError}</div>}
            </div>
            <div className="pm-amount-box">Amount: <strong>{fmtINR(amount)}</strong></div>
            <button className="pm-pay-btn" onClick={handleUpiPay} disabled={processing || !upiId}>
              {processing ? <><Loader2 size={18} className="spin" /> Processing...</> : <><IndianRupee size={18} /> Pay {fmtINR(amount)} via UPI</>}
            </button>
            <div className="pm-secure"><Shield size={14} /> Secure payment via UPI</div>
          </div>
        )}
        {showCardForm && (
          <div className="pm-card">
            <button className="pm-back" onClick={() => setShowCardForm(false)}><ArrowLeft size={16} /> Back</button>
            <div className="pm-card-form">
              <div className="pm-form-group">
                <label>Card Number</label>
                <input type="text" placeholder="1234 5678 9012 3456" maxLength={19}
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())} />
              </div>
              <div className="pm-form-row">
                <div className="pm-form-group"><label>Expiry</label><input type="text" placeholder="MM/YY" maxLength={5} value={expiry} onChange={e => setExpiry(e.target.value)} /></div>
                <div className="pm-form-group"><label>CVV</label><input type="password" placeholder="•••" maxLength={4} value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, ''))} /></div>
              </div>
              <div className="pm-form-group"><label>Cardholder Name</label><input type="text" placeholder="John Doe" value={cardName} onChange={e => setCardName(e.target.value)} /></div>
            </div>
            <div className="pm-amount-box">Amount: <strong>{fmtINR(amount)}</strong></div>
            <button className="pm-pay-btn" onClick={handleCardPay} disabled={processing || cardNumber.length < 16}>
              {processing ? <><Loader2 size={18} className="spin" /> Processing...</> : <><CreditCard size={18} /> Pay {fmtINR(amount)}</>}
            </button>
            <div className="pm-secure"><Shield size={14} /> Secure payment via Stripe</div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export const Campaigns: React.FC = () => {
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState<string>('');
  const [urlStatus, setUrlStatus] = useState<'idle' | 'checking' | 'valid' | 'error'>('idle');
  const [isChatMode, setIsChatMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  // FIX: sessionLoaded tracks whether we've finished restoring for the CURRENT user.
  // We start as false and set to true only after restoration completes.
  const [sessionLoaded, setSessionLoaded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [brandDetails, setBrandDetails] = useState<BrandDetails | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'meta' | 'google' | 'twitter' | 'linkedin' | 'both' | 'all' | ''>('');
  const [budgetBreakdown, setBudgetBreakdown] = useState<BudgetBreakdown | null>(null);
  const [selectedTier, setSelectedTier] = useState<BudgetTier | null>(null);
  const [liveCampaign, setLiveCampaign] = useState<LiveCampaignData | null>(null);
  const campaignIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingFundsAmount, setPendingFundsAmount] = useState(0);
  const [pendingFundsContext, setPendingFundsContext] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'landing' | 'chat' | 'dashboard'>('landing');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // FIX: Get the real logged-in user from your auth system.
  // Replace this with however your app exposes the current user.
  // The user ID MUST change when a different user logs in.
  // ─────────────────────────────────────────────────────────────
  // ─── Read the logged-in user from localStorage ───────────────
  // auth.ts saves the user object after every login/register/social-auth.
  // getAuthUser() returns { _id, name, email } or null if not logged in.
  const authUser = getAuthUser();

  const [userProfile, setUserProfile] = useState<UserProfile>(() => ({
    id:       authUser?._id   || '',
    name:     authUser?.name  || 'User',
    email:    authUser?.email || '',
    balance:  25000,
    currency: 'USD',
  }));

  // ─────────────────────────────────────────────────────────────
  // Register beforeunload beacon — re-registers when user changes
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    return registerRefreshClear(userProfile.id);
  }, [userProfile.id]);

  // ─────────────────────────────────────────────────────────────
  // FIX: FULL RESET + SESSION RESTORE when userId changes.
  // This is the core fix. Every time the userId changes (i.e. a
  // different user logs in), we:
  //   1. Immediately wipe ALL UI state to blank
  //   2. Remove ALL other users' localStorage keys
  //   3. Load only the current user's session (local or remote)
  //   4. Mark sessionLoaded = true so the UI renders
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // ── Step 1: Hard reset all UI state immediately ──────────
    // This prevents the previous user's chat flashing on screen
    setSessionLoaded(false);
    setIsChatMode(false);
    setUrl('');
    setUrlStatus('idle');
    setUrlError('');
    setMessages([]);
    setBrandDetails(null);
    setSelectedPlatform('');
    setBudgetBreakdown(null);
    setSelectedTier(null);
    setLiveCampaign(null);
    setViewMode('landing');
    setLoading(false);
    setShowPaymentModal(false);
    setPendingFundsAmount(0);
    setPendingFundsContext(null);
    campaignIdRef.current = null;
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }

    const userId = userProfile.id;

    // Skip if userId is empty — Redux hasn't hydrated yet.
    // The guard above redirects to /login in this case,
    // but this also prevents the async restore from running with a blank id.
    if (!userId) {
      setSessionLoaded(true);
      return;
    }

    // ── Step 2: Wipe all other users' local sessions ─────────
    clearAllOtherUsersLocal(userId);

    // ── Step 3: Load THIS user's session ─────────────────────
    const restoreSession = async () => {
      // Try remote first (source of truth)
      let session = await loadRemote(userId);
      // Fallback to local
      if (!session) session = loadLocal(userId);

      if (session) {
        // Final hard guard — never load another user's data
        if (session.userId !== userId) {
          setSessionLoaded(true);
          return;
        }

        setUrl(session.url || '');
        setUrlStatus(session.urlStatus as any || 'idle');
        setIsChatMode(session.isChatMode || false);
        setViewMode(session.viewMode || 'landing');
        setBrandDetails(session.brandDetails || null);
        setSelectedPlatform(session.selectedPlatform as any || '');
        setBudgetBreakdown(session.budgetBreakdown || null);
        setSelectedTier(session.selectedTier || null);
        setLiveCampaign(session.liveCampaign || null);

        if (session.messages?.length) {
          const maxId = session.messages.reduce((max, m) => {
            const n = parseInt(m.id.replace(/[^0-9]/g, ''), 10);
            return isNaN(n) ? max : Math.max(max, n);
          }, 0);
          msgCounter = maxId;
          setMessages(session.messages);
        }

        if (session.campaignId) {
          campaignIdRef.current = session.campaignId;
        }

        if (session.liveCampaign && session.campaignId) {
          startPollingDashboard(session.campaignId);
        }

        // If dashboard view but no live campaign, fall back to chat
        if (session.viewMode === 'dashboard' && !session.liveCampaign) {
          setViewMode('chat');
        }
      }

      // ── Step 4: Mark ready ────────────────────────────────
      setSessionLoaded(true);
    };

    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile.id]);

  // ─────────────────────────────────────────────────────────────
  // SESSION SAVE — debounced, fires on state changes
  // Only saves after session has been fully loaded for this user
  // ─────────────────────────────────────────────────────────────
  const persistSession = useCallback(
    async (state: Partial<AppState> & { campaignId?: string | null }) => {
      if (!sessionLoaded) return;
      // Don't bother saving a blank landing page
      if (state.viewMode === 'landing' && !state.isChatMode && !state.messages?.length) return;

      const session = buildSession(userProfile.id, state);
      saveLocal(session);
      await saveRemote(userProfile.id, session);
    },
    [sessionLoaded, userProfile.id]
  );

  const debouncedPersist = useDebounce(persistSession, 800);

  useEffect(() => {
    if (!sessionLoaded) return;
    debouncedPersist({
      url,
      urlStatus,
      isChatMode,
      viewMode,
      brandDetails,
      selectedPlatform,
      budgetBreakdown,
      selectedTier,
      liveCampaign,
      campaignId: campaignIdRef.current,
      messages,
    });
  }, [
    sessionLoaded, url, urlStatus, isChatMode, viewMode,
    brandDetails, selectedPlatform, budgetBreakdown,
    selectedTier, liveCampaign, messages,
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchWalletBalance = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/wallet/balance/${userProfile.id}`);
      setUserProfile(prev => ({ ...prev, balance: res.data.balance }));
    } catch (err) { console.error('Failed to fetch balance:', err); }
  }, [userProfile.id]);

  useEffect(() => { if (userProfile.id) fetchWalletBalance(); }, [fetchWalletBalance]);
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const addMsg = (msgs: Omit<Message, 'id'>[]) =>
    setMessages(prev => [...prev, ...msgs.map(m => ({ ...m, id: newMsgId() }))]);

  // ── STEP 1: Deep Research ──
  const handleDeepResearch = async () => {
    const formatResult = validateUrlFormat(url);
    if (!formatResult.ok) { setUrlError(formatResult.message); setUrlStatus('error'); return; }
    const normalizedUrl = formatResult.normalizedUrl;
    setUrlStatus('checking'); setUrlError(''); setLoading(true);
    const reachable = await checkUrlReachable(normalizedUrl);
    if (!reachable) { setUrlStatus('error'); setUrlError("We couldn't reach this website."); setLoading(false); return; }
    setUrlStatus('valid'); setUrlError(''); setIsChatMode(true); setViewMode('chat');
    setMessages([
      { id: newMsgId(), role: 'user', type: 'text', content: normalizedUrl },
      { id: newMsgId(), role: 'bot', type: 'text', content: 'Initializing Neural Engine... Analyzing website structure:' },
      { id: newMsgId(), role: 'bot', type: 'research', content: { url: normalizedUrl } },
    ]);
    try {
      const domain = new URL(normalizedUrl).hostname.replace('www.', '').split('.')[0];
      const { data: brand } = await axios.post(`${API_BASE}/campaign/discover`, { website: normalizedUrl, brandName: domain });
      setBrandDetails(brand);
      if (brand.campaignId) campaignIdRef.current = brand.campaignId;
      setLoading(false);
      const name = resolveBrandName(brand);
      const industry = resolveIndustry(brand);
      addMsg([
        { role: 'bot', type: 'audit', content: brand },
        { role: 'bot', type: 'text', content: `✅ Brand analysis complete for ${name} in the ${industry} industry.\n\nBased on our analysis, I can help you create a high-converting advertising campaign tailored to your brand.` },
        { role: 'bot', type: 'campaign_confirmation', content: { brandName: name } },
      ]);
    } catch (e) {
      console.error(e);
      setLoading(false);
      addMsg([{ role: 'bot', type: 'text', content: '❌ Failed to analyze website. Please try again.' }]);
    }
  };

  // ── STEP 1.5: Campaign Confirmation ──
  const handleCampaignConfirm = () => {
    const name = brandDetails ? resolveBrandName(brandDetails) : 'your brand';
    addMsg([
      { role: 'user', type: 'text', content: `Yes, create a campaign for ${name}` },
      { role: 'bot', type: 'text', content: `Awesome! 🎯 Let's build your campaign. First, choose your advertising platform:` },
      { role: 'bot', type: 'form', content: { step: 'platform_select' } },
    ]);
  };

  const handleCampaignDecline = () => {
    const name = brandDetails ? resolveBrandName(brandDetails) : 'your brand';
    addMsg([
      { role: 'user', type: 'text', content: 'Maybe later' },
      { role: 'bot', type: 'text', content: `No problem! The campaign analysis for ${name} has been saved. Feel free to come back anytime.` },
    ]);
  };

  // ── STEP 2: Platform Selection ──
  const platformLabel = (p: string) => {
    const map: Record<string,string> = { meta: 'Meta Ads', google: 'Google Ads', twitter: 'Twitter (X)', linkedin: 'LinkedIn Ads', both: 'Meta + Google', all: 'All Platforms' };
    return map[p] || p;
  };

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform as any);
    addMsg([
      { role: 'user', type: 'text', content: `Selected: ${platformLabel(platform)}` },
      { role: 'bot', type: 'text', content: `Great choice! 💰 Now enter your monthly advertising budget:` },
      { role: 'bot', type: 'form', content: { step: 'budget_input', platform } },
    ]);
  };

  // ── STEP 3: Budget Input ──
  const handleBudgetInput = async (budgetAmount: number) => {
    addMsg([{ role: 'user', type: 'text', content: `Monthly budget: ${fmt(budgetAmount)}` }]);
    setLoading(true);
    let currentBalance = userProfile.balance;
    try {
      const res = await axios.get(`${API_BASE}/wallet/balance/${userProfile.id}`);
      currentBalance = res.data.balance;
      setUserProfile(prev => ({ ...prev, balance: currentBalance }));
    } catch {}
    const resolvePlatforms = (p: string): string[] => {
      if (p === 'both')   return ['meta', 'google'];
      if (p === 'social') return ['meta', 'twitter', 'linkedin'];
      if (p === 'all')    return ['meta', 'google', 'twitter', 'linkedin'];
      if (p.includes('_')) return p.split('_');
      return [p];
    };
    const platforms = resolvePlatforms(selectedPlatform);
    const breakdown = generateBudgetTiers(budgetAmount, platforms);
    setBudgetBreakdown(breakdown);
    setLoading(false);
    const starterCost = breakdown.tiers[0].total.ourBudget;
    if (currentBalance < starterCost) {
      const shortfall = starterCost - currentBalance;
      setPendingFundsAmount(shortfall);
      setPendingFundsContext({ type: 'budget', breakdown });
      addMsg([
        { role: 'bot', type: 'text', content: `⚠️ Your balance (${fmt(currentBalance)}) is less than minimum tier (${fmt(starterCost)}). Add ${fmt(shortfall)}:` },
        { role: 'bot', type: 'funds', content: { required: starterCost, available: currentBalance, shortfall } },
      ]);
    } else {
      addMsg([
        { role: 'bot', type: 'text', content: `💡 Here are 3 AI-optimized campaign tiers:` },
        { role: 'bot', type: 'budget_tiers', content: breakdown },
        { role: 'bot', type: 'form', content: { step: 'tier_select' } },
      ]);
    }
  };

  // ── STEP 4: Tier Selection ──
  const handleTierSelect = async (tier: BudgetTier) => {
    setSelectedTier(tier);
    let currentBalance = userProfile.balance;
    try {
      const res = await axios.get(`${API_BASE}/wallet/balance/${userProfile.id}`);
      currentBalance = res.data.balance;
      setUserProfile(prev => ({ ...prev, balance: currentBalance }));
    } catch {}
    addMsg([{ role: 'user', type: 'text', content: `Selected: ${tier.label} tier — ${fmt(tier.total.ourBudget)}/mo` }]);
    if (currentBalance < tier.total.ourBudget) {
      const shortfall = tier.total.ourBudget - currentBalance;
      setPendingFundsAmount(shortfall);
      setPendingFundsContext({ type: 'tier', tier });
      addMsg([
        { role: 'bot', type: 'text', content: `⚠️ Add ${fmt(shortfall)} to proceed:` },
        { role: 'bot', type: 'funds', content: { required: tier.total.ourBudget, available: currentBalance, shortfall } },
      ]);
    } else {
      await createCampaignDraft(tier);
    }
  };

  // ── STEP 5: Create Campaign Draft ──
  const createCampaignDraft = async (tier: BudgetTier) => {
    setLoading(true);
    try {
      const brandId = brandDetails?.brandId || brandDetails?.campaignId;
      const resolvePlatforms2 = (p: string): string[] => {
        if (p === 'both')   return ['meta', 'google'];
        if (p === 'social') return ['meta', 'twitter', 'linkedin'];
        if (p === 'all')    return ['meta', 'google', 'twitter', 'linkedin'];
        if (p.includes('_')) return p.split('_');
        return [p];
      };
      const platforms = resolvePlatforms2(selectedPlatform);
      const { data: draft } = await axios.post(`${API_BASE}/campaign/draft`, {
        brandId, platforms,
        budget: { daily: tier.dailyBudget, total: tier.totalBudget },
        userId: userProfile.id,
      });
      campaignIdRef.current = draft.campaignId;
      setLoading(false);
      addMsg([
        { role: 'bot', type: 'text', content: `✅ Campaign created! Here's your final summary — ready to go live?` },
        { role: 'bot', type: 'publish_review', content: { platform: selectedPlatform, tier, campaignId: draft.campaignId, balance: userProfile.balance } },
      ]);
    } catch (err) {
      console.error(err);
      setLoading(false);
      addMsg([{ role: 'bot', type: 'text', content: '❌ Failed to create campaign. Please try again.' }]);
    }
  };

  // ── STEP 6: Publish Campaign ──
  const handlePublish = async () => {
    addMsg([{ role: 'user', type: 'text', content: '🚀 Yes, launch my campaign now!' }]);
    setLoading(true);
    const localCampaignId = campaignIdRef.current;
    if (!localCampaignId || !selectedTier) {
      setLoading(false);
      addMsg([{ role: 'bot', type: 'text', content: '❌ Missing campaign or budget.' }]);
      return;
    }
    try {
      const amount = selectedTier.total.ourBudget;
      const balanceRes = await axios.get(`${API_BASE}/wallet/balance/${userProfile.id}`);
      const currentBalance = balanceRes.data.balance;
      if (currentBalance < amount) {
        setLoading(false);
        addMsg([{ role: 'bot', type: 'text', content: `⚠️ Insufficient balance. Required: ${fmt(amount)}, Available: ${fmt(currentBalance)}` }]);
        return;
      }
      await axios.post(`${API_BASE}/wallet/debit`, { userId: userProfile.id, amount, description: `Campaign spend (${localCampaignId})` });
      await axios.post(`${API_BASE}/campaign/publish/${localCampaignId}`);
      await fetchWalletBalance();
      setLoading(false);
      const resolvePlatforms = (p: string): string[] => {
      if (p === 'both')   return ['meta', 'google'];
      if (p === 'social') return ['meta', 'twitter', 'linkedin'];
      if (p === 'all')    return ['meta', 'google', 'twitter', 'linkedin'];
      if (p.includes('_')) return p.split('_');
      return [p];
    };
    const platforms = resolvePlatforms(selectedPlatform);
      const initialLiveData: LiveCampaignData = {
        campaignId: localCampaignId,
        campaignName: resolveBrandName(brandDetails!),
        status: 'CREATING',
        createdAt: new Date().toISOString(),
        platforms: platforms.map(p => ({
          name: p, status: 'CREATING' as const,
          metrics: { impressions: 0, clicks: 0, spend: 0, ctr: 0, conversions: 0, costPerClick: 0, roi: 0 },
          adSets: [], lastUpdated: new Date().toISOString(),
        })),
        overallMetrics: { totalImpressions: 0, totalClicks: 0, totalSpend: 0, totalConversions: 0, overallRoi: 0, avgCtr: 0, avgCpc: 0, totalReach: 0, totalVideoViews: 0 },
      };
      setLiveCampaign(initialLiveData);
      addMsg([
        { role: 'bot', type: 'text', content: '🎉 Campaign launched & wallet debited successfully!' },
        { role: 'bot', type: 'live_dashboard', content: { campaignId: localCampaignId } },
      ]);
      startPollingDashboard(localCampaignId);
      setTimeout(() => { setViewMode('dashboard'); }, 3000);
    } catch (err: any) {
      setLoading(false);
      console.error(err);
      addMsg([{ role: 'bot', type: 'text', content: '❌ Failed to launch campaign. No money deducted if failed.' }]);
    }
  };

  // ── POLLING ──
  const startPollingDashboard = (campaignId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts > 100) { clearInterval(pollRef.current!); return; }
      try {
        const { data } = await axios.get(`${API_BASE}/campaign/${campaignId}/live-dashboard`);
        setLiveCampaign(data);
        if (data.status === 'ACTIVE') clearInterval(pollRef.current!);
      } catch (err) { console.error('Poll error:', err); }
    }, 5000);
  };

  const handleRefreshDashboard = async () => {
    setIsRefreshing(true);
    if (campaignIdRef.current) {
      try {
        const { data } = await axios.get(`${API_BASE}/campaign/${campaignIdRef.current}/live-dashboard`);
        setLiveCampaign(data);
      } catch (err) { console.error('Refresh error:', err); }
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // ── ADD FUNDS ──
  const handleAddFunds = async (amount: number) => {
    addMsg([{ role: 'user', type: 'text', content: `Add ${fmtINR(amount)} via wallet` }]);
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/wallet/credit`, { userId: userProfile.id, amount, description: 'Wallet top-up' });
      setUserProfile(prev => ({ ...prev, balance: data.newBalance }));
      setLoading(false);
      setShowPaymentModal(false);
      addMsg([{ role: 'bot', type: 'text', content: `✅ ${fmtINR(amount)} added! Balance: ${fmt(data.newBalance)}. Continue:` }]);
      if (pendingFundsContext?.type === 'budget' && budgetBreakdown) {
        setTimeout(() => addMsg([
          { role: 'bot', type: 'budget_tiers', content: budgetBreakdown },
          { role: 'bot', type: 'form', content: { step: 'tier_select' } },
        ]), 500);
      } else if (pendingFundsContext?.type === 'tier') {
        setTimeout(() => createCampaignDraft(pendingFundsContext.tier), 500);
      }
    } catch {
      setLoading(false);
      addMsg([{ role: 'bot', type: 'text', content: '❌ Failed to add funds.' }]);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    handleAddFunds(pendingFundsAmount);
  };

  // ── RESET — clears ONLY this user's data ──
  const handleReset = async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    clearLocal(userProfile.id);
    await clearRemote(userProfile.id);
    setIsChatMode(false); setUrl(''); setMessages([]); setBrandDetails(null);
    campaignIdRef.current = null; setSelectedPlatform(''); setBudgetBreakdown(null);
    setSelectedTier(null); setLiveCampaign(null); setViewMode('landing');
  };

  const handleBackToChat = () => { setViewMode('chat'); setIsChatMode(true); };

  const isLatestOfType = (msgId: string, type: string) => {
    const idx = messages.findIndex(m => m.id === msgId);
    return !messages.slice(idx + 1).some(m => m.type === type);
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER GUARD — show spinner until THIS user's session loads
  // ─────────────────────────────────────────────────────────────
  // If no user is found in localStorage, redirect to login.
  if (!userProfile.id) {
    window.location.href = '/login';
    return null;
  }

  if (!sessionLoaded) {
    return (
      <>
        <style>{CSS}</style>
        <Header />
        <div className="session-loading">
          <Loader2 size={28} className="camp-spin" color="#3b82f6" />
          <span>Restoring your session...</span>
        </div>
      </>
    );
  }

  // ============================================
  // LANDING PAGE
  // ============================================
  if (!isChatMode) {
    return (
      <>
        <style>{CSS}</style>
        <Header />
        <div className="camp-landing-page">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="camp-landing-inner">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="camp-badge">
              <Brain size={13} /> AI-Powered Campaign Automation
            </motion.div>
            <h1 className="camp-headline">Launch Smarter <span className="camp-gradient-text">Campaigns</span></h1>
            <p className="camp-sub">Our AI analyzes your brand, creates optimized campaigns,<br />and manages your ad spend for maximum ROI.</p>
            <div className="camp-input-wrap">
              <div className={`camp-input-glow ${urlStatus === 'error' ? 'error' : urlStatus === 'valid' ? 'valid' : ''}`} />
              <div className={`camp-input-inner ${urlStatus === 'error' ? 'has-error' : urlStatus === 'valid' ? 'is-valid' : ''}`}>
                {urlStatus === 'valid'
                  ? <CheckCircle2 size={18} className="camp-input-icon valid" />
                  : urlStatus === 'error'
                    ? <XCircle size={18} className="camp-input-icon error" />
                    : urlStatus === 'checking'
                      ? <Loader2 size={18} className="camp-input-icon checking camp-spin" />
                      : <Globe size={18} className="camp-input-icon" />}
                <input
                  value={url}
                  onChange={e => { setUrl(e.target.value); if (urlStatus === 'error') { setUrlStatus('idle'); setUrlError(''); } }}
                  onKeyDown={e => { if (e.key === 'Enter' && !loading && url) handleDeepResearch(); }}
                  placeholder="https://your-company.com"
                  className="camp-url-input"
                  disabled={loading}
                />
                <button className="camp-launch-btn" onClick={handleDeepResearch} disabled={loading || !url || urlStatus === 'checking'}>
                  {loading ? <><Loader2 className="camp-spin" size={16} /> Analyzing...</> : <><Target size={16} /> Analyze Brand</>}
                </button>
              </div>
              <AnimatePresence>
                {urlError && (
                  <motion.div className="camp-url-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <AlertTriangle size={13} /><span>{urlError}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="camp-trust-row">
              {['Deep Website Scan', 'AI-Powered Analysis', 'Smart Campaign Creation', 'Real-time Optimization'].map(t => (
                <div key={t} className="camp-trust-item"><ShieldCheck size={14} /> {t}</div>
              ))}
            </div>
            <div className="camp-stats-row">
              {[['150+', 'Brands Analyzed'], ['98%', 'Accuracy Rate'], ['3x', 'Avg ROI Increase']].map(([v, l]) => (
                <div key={l} className="camp-stat-item">
                  <span className="camp-stat-value">{v}</span>
                  <span className="camp-stat-label">{l}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  // ============================================
  // DASHBOARD VIEW
  // ============================================
  if (viewMode === 'dashboard' && liveCampaign) {
    return (
      <>
        <style>{CSS}</style>
        <Header />
        <div className="dashboard-wrapper">
          <LiveDashboard
            campaign={liveCampaign}
            brandName={resolveBrandName(brandDetails!)}
            onBackToChat={handleBackToChat}
            onRefresh={handleRefreshDashboard}
            isRefreshing={isRefreshing}
          />
        </div>
      </>
    );
  }

  // ============================================
  // CHAT VIEW
  // ============================================
  return (
    <>
      <style>{CSS}</style>
      <AnimatePresence>
        {showPaymentModal && (
          <PaymentModal
            amount={pendingFundsAmount}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentModal(false)}
          />
        )}
      </AnimatePresence>
      <div className="camp-header-wrapper">
        <Header />
        <div className="camp-topbar-right">
          {liveCampaign && (
            <button className="camp-dashboard-btn" onClick={() => setViewMode('dashboard')}>
              <LayoutDashboard size={14} /> Dashboard
            </button>
          )}
          <button className="camp-restart-top-right" onClick={handleReset}>
            <RefreshCw size={13} /><span></span>
          </button>
        </div>
      </div>
      <div className="camp-chat-page">
        <div className="camp-chat-scroll">
          <div className="camp-chat-inner">
            <AnimatePresence>
              {messages.map(msg => {
                const latest = isLatestOfType(msg.id, msg.type);
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`camp-msg-row ${msg.role}`}>
                    <div className={`camp-avatar ${msg.role}`}>{msg.role === 'bot' ? <Brain size={15} /> : <div className="camp-user-dot" />}</div>
                    <div className="camp-msg-body">
                      {msg.type === 'text' && msg.role === 'bot' && <TypingBubble text={msg.content} />}
                      {msg.type === 'text' && msg.role === 'user' && <div className="camp-bubble-user">{msg.content}</div>}
                      {msg.type === 'research' && <ErrorBoundary><ResearchTerminal url={msg.content?.url} /></ErrorBoundary>}
                      {msg.type === 'audit' && <BrandAuditCard brand={msg.content} />}
                      {msg.type === 'campaign_confirmation' && (latest
                        ? <CampaignConfirmation brandName={msg.content?.brandName} onConfirm={handleCampaignConfirm} onDecline={handleCampaignDecline} />
                        : <div className="camp-bubble-bot camp-muted">Campaign preference recorded ✓</div>
                      )}
                      {msg.type === 'form' && msg.content?.step === 'platform_select' && (latest
                        ? <PlatformAdSelector onSelect={handlePlatformSelect} brand={brandDetails} />
                        : <div className="camp-bubble-bot camp-muted">Platform selected ✓</div>
                      )}
                      {msg.type === 'form' && msg.content?.step === 'budget_input' && (latest
                        ? <BudgetInputForm platform={msg.content.platform} onSubmit={handleBudgetInput} />
                        : <div className="camp-bubble-bot camp-muted">Budget entered ✓</div>
                      )}
                      {msg.type === 'budget_tiers' && <BudgetTiersCard breakdown={msg.content} />}
                      {msg.type === 'form' && msg.content?.step === 'tier_select' && (latest
                        ? <TierSelectButtons breakdown={budgetBreakdown!} onSelect={handleTierSelect} />
                        : <div className="camp-bubble-bot camp-muted">Tier selected ✓</div>
                      )}
                      {msg.type === 'funds' && (latest
                        ? <InsufficientFundsCard required={msg.content.required} available={msg.content.available} shortfall={msg.content.shortfall} onAddFunds={() => setShowPaymentModal(true)} onAddFundsDirect={handleAddFunds} />
                        : <div className="camp-bubble-bot camp-muted">Funds added ✓</div>
                      )}
                      {msg.type === 'publish_review' && (latest
                        ? <PublishReviewCard data={msg.content} onPublish={handlePublish} onGoToDashboard={() => setViewMode('dashboard')} />
                        : <div className="camp-bubble-bot camp-muted">Campaign launched ✓</div>
                      )}
                      {msg.type === 'live_dashboard' && (
                        <GoToDashboardCard campaignId={msg.content.campaignId} onGoToDashboard={() => setViewMode('dashboard')} />
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
    </>
  );
};

// ============================================
// SUB-COMPONENTS
// ============================================
const ResearchTerminal: React.FC<{ url?: string }> = ({ url }) => {
  const safeUrl = url?.trim() || '';
  const [logs, setLogs] = useState<string[]>([`> Connecting to ${getHostname(safeUrl)}...`]);
  useEffect(() => {
    if (!safeUrl) return;
    const lines = [
      '> Extracting DOM structure...', '> Analyzing SEO meta tags...', '> Checking performance...',
      '[SUCCESS] Brand detected', '> Analyzing competitors...', '> Extracting keywords...',
      '[SUCCESS] Analysis complete', '> Generating report...',
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) { setLogs(prev => [...prev, lines[i]]); i++; }
      else { clearInterval(interval); }
    }, 600);
    return () => clearInterval(interval);
  }, [safeUrl]);
  return (
    <div className="camp-terminal">
      <div className="camp-terminal-header"><span><Brain size={11} /></span><span className="camp-terminal-url">{getHostname(safeUrl)}</span></div>
      {logs.map((log, idx) => {
        if (!log || typeof log !== 'string') return null;
        return <div key={idx} className={`camp-log-line ${log.includes('SUCCESS') ? 'success' : ''}`}>{log}</div>;
      })}
      <span className="camp-cursor" />
    </div>
  );
};

const BudgetInputForm: React.FC<{ platform: string; onSubmit: (amount: number) => void }> = ({ platform, onSubmit }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const presets = [5000, 10000, 25000, 50000, 100000];
  const handleSubmit = () => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (!num || num < 100) { setError('Minimum $100'); return; }
    setError(''); onSubmit(num);
  };
  return (
    <div className="budget-input-form">
      <div className="bif-header"><DollarSign size={18} color="#10b981" /><div><div className="bif-title">Monthly Ad Budget</div><div className="bif-sub">For {({'meta':'Meta Ads','google':'Google Ads','twitter':'Twitter (X)','linkedin':'LinkedIn Ads','both':'Meta + Google','all':'All Platforms'} as any)[platform] || platform} · Min $100</div></div></div>
      <div className="bif-presets">{presets.map(p => <button key={p} className={`bif-preset ${value === String(p) ? 'active' : ''}`} onClick={() => { setValue(String(p)); setError(''); }}>${p.toLocaleString()}</button>)}</div>
      <div className="bif-input-row">
        <div className="bif-input-wrap"><span className="bif-currency">$</span><input type="number" className="bif-input" placeholder="Enter amount" value={value} onChange={e => { setValue(e.target.value); setError(''); }} onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }} /><span className="bif-period">/mo</span></div>
        <button className="bif-submit" onClick={handleSubmit} disabled={!value}>Generate Plans <ArrowRight size={16} /></button>
      </div>
      {error && <div className="bif-error"><AlertTriangle size={13} /> {error}</div>}
    </div>
  );
};

const BudgetTiersCard: React.FC<{ breakdown: BudgetBreakdown }> = ({ breakdown }) => {
  const tierColors: Record<string, string> = { Starter: '#38bdf8', Growth: '#10b981', Scale: '#f59e0b' };
  const tierIcons: Record<string, string> = { Starter: '🌱', Growth: '🚀', Scale: '⚡' };
  return (
    <div className="tiers-card">
      {breakdown.aiRecommendation && <div className="tiers-ai-note"><Brain size={14} /><p>{breakdown.aiRecommendation}</p></div>}
      <div className="tiers-grid">
        {breakdown.tiers.map(tier => {
          const color = tierColors[tier.label] || '#60a5fa';
          return (
            <div key={tier.label} className={`tier-card ${tier.recommended ? 'recommended' : ''}`} style={{ '--tc': color } as React.CSSProperties}>
              {tier.recommended && <div className="tier-badge">AI Pick</div>}
              <div className="tier-icon">{tierIcons[tier.label]}</div>
              <div className="tier-label" style={{ color }}>{tier.label}</div>
              <div className="tier-budget">{fmt(tier.total.ourBudget)}<span>/mo</span></div>
              <div className="tier-desc">{tier.description}</div>
              <div className="tier-metrics">{tier.platforms.map(p => (
                <div key={p.name} className="tier-platform-row">
                  <span className="tier-platform-name">{ {meta:'📘',google:'🔵',twitter:'🐦',linkedin:'💼'} [p.name as 'meta'|'google'|'twitter'|'linkedin'] || '📢'} {({'meta':'Meta','google':'Google','twitter':'Twitter(X)','linkedin':'LinkedIn'} as any)[p.name] || p.name}</span>
                  <div className="tier-platform-stats"><span>{p.impressionsEstimate.toLocaleString()} impr.</span><span>{p.clicksEstimate.toLocaleString()} clicks</span></div>
                </div>
              ))}</div>
              <div className="tier-roi"><span>Est. ROI</span><strong style={{ color }}>{tier.total.roiEstimate}%</strong></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TierSelectButtons: React.FC<{ breakdown: BudgetBreakdown; onSelect: (tier: BudgetTier) => void }> = ({ breakdown, onSelect }) => {
  const tierColors: Record<string, string> = { Starter: '#38bdf8', Growth: '#10b981', Scale: '#f59e0b' };
  return (
    <div className="tier-select-row">
      <div className="tier-select-label">Select a budget tier:</div>
      <div className="tier-select-btns">
        {breakdown.tiers.map(tier => (
          <button key={tier.label} className={`tier-select-btn ${tier.recommended ? 'recommended' : ''}`} style={{ '--tc': tierColors[tier.label] } as React.CSSProperties} onClick={() => onSelect(tier)}>
            {tier.recommended && <Star size={11} />}
            <span className="tsb-label">{tier.label}</span>
            <span className="tsb-amount">{fmt(tier.total.ourBudget)}/mo</span>
            <ArrowRight size={14} />
          </button>
        ))}
      </div>
    </div>
  );
};

const InsufficientFundsCard: React.FC<{
  required: number; available: number; shortfall: number;
  onAddFunds: () => void; onAddFundsDirect: (amount: number) => void;
}> = ({ required, available, shortfall, onAddFunds, onAddFundsDirect }) => (
  <div className="camp-funds-card">
    <div className="funds-header"><AlertTriangle size={22} color="#f59e0b" /><div><h3>Insufficient Balance</h3><p>Add funds to continue your campaign.</p></div></div>
    <div className="funds-amounts">
      <div className="funds-amount-row"><span>Required</span><strong style={{ color: '#ef4444' }}>{fmt(required)}</strong></div>
      <div className="funds-amount-row"><span>Available</span><strong>{fmt(available)}</strong></div>
      <div className="funds-amount-row highlight"><span>Shortfall</span><strong style={{ color: '#f59e0b' }}>{fmt(shortfall)}</strong></div>
    </div>
    <div className="camp-funds-btns">
      <button className="camp-add-funds-btn primary" onClick={onAddFunds}><PlusCircle size={15} /> Add Funds via UPI/Card</button>
      <button className="camp-add-funds-btn" onClick={() => onAddFundsDirect(shortfall)}><Wallet size={15} /> Quick Add {fmt(shortfall)}</button>
    </div>
  </div>
);

const PublishReviewCard: React.FC<{
  data: any; onPublish: () => void; onGoToDashboard: () => void;
}> = ({ data, onPublish, onGoToDashboard }) => {
  const { platform, tier, campaignId, balance } = data;
  const remaining = balance - (tier?.total?.ourBudget || 0);
  const tierColors: Record<string, string> = { Starter: '#38bdf8', Growth: '#10b981', Scale: '#f59e0b' };
  return (
    <div className="publish-card">
      <div className="publish-card-header"><Rocket size={20} color="#10b981" /><div><div className="publish-card-title">🎉 Campaign Ready!</div><div className="publish-card-sub">ID: <code>{campaignId}</code></div></div></div>
      <div className="publish-summary">
        <div className="publish-row"><span><Layers size={14} /> Platform</span><strong>{({'meta':'Meta Ads','google':'Google Ads','twitter':'Twitter (X)','linkedin':'LinkedIn Ads','both':'Meta + Google','all':'All Platforms'} as any)[platform] || platform}</strong></div>
        <div className="publish-row"><span><Award size={14} /> Tier</span><strong style={{ color: tierColors[tier?.label] }}>{tier?.label}</strong></div>
        <div className="publish-row"><span><DollarSign size={14} /> Investment</span><strong style={{ color: '#10b981' }}>{fmt(tier?.total?.ourBudget)}</strong></div>
        <div className="publish-row"><span><TrendingUp size={14} /> ROI</span><strong style={{ color: '#10b981' }}>{tier?.total?.roiEstimate}%</strong></div>
        <div className="publish-row"><span><Wallet size={14} /> Balance After</span><strong style={{ color: remaining >= 0 ? '#60a5fa' : '#ef4444' }}>{fmt(remaining)}</strong></div>
      </div>
      <div className="publish-actions">
        <button className="publish-btn" onClick={onPublish}><Rocket size={18} /> Launch Campaign</button>
        <button className="publish-dashboard-btn" onClick={onGoToDashboard}><LayoutDashboard size={16} /> View Dashboard</button>
      </div>
    </div>
  );
};

const GoToDashboardCard: React.FC<{ campaignId: string; onGoToDashboard: () => void }> = ({ campaignId, onGoToDashboard }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="go-to-dashboard-card">
    <div className="gtds-header"><div className="gtds-icon"><LayoutDashboard size={24} /></div><div><h3>Campaign Live!</h3><p>Track your campaigns in real-time dashboard</p></div></div>
    <div className="gtds-info"><span>Campaign ID:</span><code>{campaignId.slice(0, 20)}...</code></div>
    <button className="gtds-btn" onClick={onGoToDashboard}><LayoutDashboard size={18} /> Go to Live Dashboard</button>
  </motion.div>
);

const BrandAuditCard: React.FC<{ brand: BrandDetails }> = ({ brand }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const tabs = ['overview', 'website', 'keywords', 'competition', 'analytics'];
  const displayName = brand.brand?.name || brand.brandName || 'Brand';
  const displayIndustry = brand.brand?.industry || brand.industry || '';
  const overallScore = brand.brand?.overallScore ?? brand.overallScore;
  const scoreColor = (s: number) => s >= 80 ? '#10b981' : s >= 65 ? '#f59e0b' : '#ef4444';
  const intensityColors: Record<string, string> = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
  const intensityWidths: Record<string, string> = { High: '90%', Medium: '55%', Low: '25%' };
  const trafficColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];
  const trafficWidths = ['72%', '48%', '31%', '20%'];

  return (
    <div className="audit-card">
      <div className="audit-topbar">
        <div className="audit-brand-identity">
          <div className="audit-brand-icon"><Building2 size={20} /></div>
          <div><div className="audit-brand-name">{displayName}</div><div className="audit-brand-industry">{displayIndustry}</div></div>
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
            {brand.keywords.gaps?.length > 0 && <div className="audit-issue-group"><div className="audit-issue-group-label">Keyword Gaps</div>{brand.keywords.gaps.map((g: string, i: number) => <div key={i} className="audit-issue warning">🕳️ {g}</div>)}</div>}
            {brand.keywords.recommendations?.length > 0 && <div className="audit-issue-group"><div className="audit-issue-group-label">Recommendations</div>{brand.keywords.recommendations.map((r: string, i: number) => <div key={i} className="audit-issue success">💡 {r}</div>)}</div>}
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
              {c.marketPosition && <div className="audit-objective" style={{ marginBottom: 12 }}>📍 {c.marketPosition}</div>}
              {c.competitors?.map((comp: CompetitorDetail, i: number) => (
                <div key={i} className="competitor-card">
                  <div className="competitor-name">{comp.name}</div>
                  <div className="comp-sw-grid">
                    <div className="comp-sw-box"><div className="comp-sw-title green">Strengths</div><ul className="comp-sw-list">{comp.strengths?.map((s, j) => <li key={j}>{s}</li>)}</ul></div>
                    <div className="comp-sw-box"><div className="comp-sw-title red">Weaknesses</div><ul className="comp-sw-list">{comp.weaknesses?.map((w, j) => <li key={j}>{w}</li>)}</ul></div>
                  </div>
                  {comp.comparison && <div className="comp-comparison">💬 {comp.comparison}</div>}
                </div>
              ))}
              {c.differentiators?.length > 0 && <div style={{ marginTop: 12 }}><div className="audit-issue-group-label" style={{ marginBottom: 8 }}>Our Differentiators</div><div className="audit-pills">{c.differentiators.map((d: string) => <span key={d} className="audit-pill teal">⚡ {d}</span>)}</div></div>}
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
                {a.estimatedBacklinks && <div className="aa-metric"><div className="aa-value">{a.estimatedBacklinks}</div><div className="aa-label">Backlinks</div></div>}
                {a.avgSessionDuration && <div className="aa-metric"><div className="aa-value" style={{ fontSize: '1rem' }}>{a.avgSessionDuration}</div><div className="aa-label">Avg Session</div></div>}
                {a.bounceRate && <div className="aa-metric"><div className="aa-value">{a.bounceRate}</div><div className="aa-label">Bounce Rate</div></div>}
              </div>
              {a.topTrafficSources?.length > 0 && <div><div className="audit-issue-group-label" style={{ marginBottom: 8 }}>Top Traffic Sources</div><div className="audit-traffic-sources">{a.topTrafficSources.map((s: string, i: number) => (<div key={i} className="audit-traffic-item"><span className="audit-traffic-name">{s}</span><div className="audit-traffic-bar"><div className="audit-traffic-fill" style={{ width: trafficWidths[i] || '20%', background: trafficColors[i] || '#64748b' }} /></div></div>))}</div></div>}
              {a.conversionFocusAreas?.length > 0 && <div style={{ marginTop: 14 }}><div className="audit-issue-group-label" style={{ marginBottom: 8 }}>Conversion Focus Areas</div><div className="audit-pills">{a.conversionFocusAreas.map((c: string) => <span key={c} className="audit-pill amber">{c}</span>)}</div></div>}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

// ── Twitter / X Icon ──
const TwitterXIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#e7e7e7">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// ── LinkedIn Icon ──
const LinkedInIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#0a66c2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

// ── Brand Value Comparison Card (shown inside platform selector) ──
const BrandValueCard: React.FC<{ brand: BrandDetails }> = ({ brand }) => {
  const myScore = brand?.brand?.overallScore ?? 65;
  const competitors = brand?.competition?.competitors ?? [];
  const brandName = brand?.brand?.name || 'Your Brand';

  // Build comparison rows: our brand + up to 3 competitors
  const rows = [
    { name: brandName, score: myScore, isUs: true },
    ...competitors.slice(0, 3).map((c: any, i: number) => ({
      name: c.name,
      score: Math.max(20, Math.min(95, myScore + [-12, 15, -5][i % 3])),
      isUs: false,
    })),
  ];

  // Growth projection: with us vs without, over 12 months
  const months = ['Now', '3mo', '6mo', '9mo', '12mo'];
  const withUs    = [myScore, myScore + 8,  myScore + 18, myScore + 30, myScore + 45].map(v => Math.min(v, 99));
  const withoutUs = [myScore, myScore + 1,  myScore + 2,  myScore + 3,  myScore + 5].map(v => Math.min(v, 99));
  const industryAvg = rows.filter(r => !r.isUs).map(r => r.score);
  const avgScore = industryAvg.length ? Math.round(industryAvg.reduce((a, b) => a + b, 0) / industryAvg.length) : myScore - 8;

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

      {/* ── Score vs Competitors ── */}
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
                <div
                  className="bvc-score-bar-fill"
                  style={{
                    width: `${(row.score / maxScore) * 100}%`,
                    background: row.isUs
                      ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                      : `${scoreColor(row.score)}88`,
                  }}
                />
              </div>
              <span className="bvc-score-num" style={{ color: row.isUs ? '#60a5fa' : scoreColor(row.score) }}>
                {row.score}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Gap Summary ── */}
      <div className="bvc-gap-row">
        <div className="bvc-gap-item">
          <span className="bvc-gap-label">Industry Avg</span>
          <strong style={{ color: '#f59e0b' }}>{avgScore}</strong>
        </div>
        <div className="bvc-gap-item">
          <span className="bvc-gap-label">Your Score</span>
          <strong style={{ color: '#60a5fa' }}>{myScore}</strong>
        </div>
        <div className="bvc-gap-item">
          <span className="bvc-gap-label">Gap</span>
          <strong style={{ color: myScore >= avgScore ? '#10b981' : '#ef4444' }}>
            {myScore >= avgScore ? '+' : ''}{myScore - avgScore}
          </strong>
        </div>
        <div className="bvc-gap-item">
          <span className="bvc-gap-label">Projected (12mo)</span>
          <strong style={{ color: '#10b981' }}>{withUs[4]}</strong>
        </div>
      </div>

      {/* ── Growth Timeline Chart ── */}
      <div className="bvc-section-label" style={{ marginTop: 16 }}>📈 12-Month Growth Projection</div>
      <div className="bvc-chart">
        <div className="bvc-chart-lines">
          {[100, 75, 50, 25].map(v => (
            <div key={v} className="bvc-chart-line">
              <span className="bvc-chart-line-label">{v}</span>
            </div>
          ))}
        </div>
        <div className="bvc-chart-bars">
          {months.map((m, i) => (
            <div key={m} className="bvc-chart-col">
              <div className="bvc-chart-col-bars">
                {/* With Us bar */}
                <div className="bvc-bar-wrap" title={`With us: ${withUs[i]}`}>
                  <div
                    className="bvc-bar with-us"
                    style={{ height: `${withUs[i]}%` }}
                  />
                </div>
                {/* Without bar */}
                <div className="bvc-bar-wrap" title={`Without campaigns: ${withoutUs[i]}`}>
                  <div
                    className="bvc-bar without-us"
                    style={{ height: `${withoutUs[i]}%` }}
                  />
                </div>
              </div>
              <span className="bvc-chart-month">{m}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bvc-legend">
        <span className="bvc-legend-item"><span className="bvc-legend-dot with-us" />With our campaigns</span>
        <span className="bvc-legend-item"><span className="bvc-legend-dot without-us" />Without campaigns</span>
      </div>

      {/* ── Insight ── */}
      <div className="bvc-insight">
        <Zap size={13} color="#f59e0b" />
        <span>
          Our campaigns can grow your brand score from <strong style={{color:'#60a5fa'}}>{myScore}</strong> to{' '}
          <strong style={{color:'#10b981'}}>{withUs[4]}</strong> in 12 months —{' '}
          <strong style={{color:'#f59e0b'}}>{withUs[4] - myScore} points</strong> ahead of doing nothing.
        </span>
      </div>
    </div>
  );
};

const PlatformAdSelector: React.FC<{ onSelect: (p: string) => void; brand?: BrandDetails | null }> = ({ onSelect, brand }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const platforms = [
    { id: 'meta',     label: 'Meta Ads',    sub: 'Facebook & Instagram', icon: <FacebookIcon />,  color: '#3b82f6', features: ['2.9B+ users', 'Visual ads', 'Interest targeting'],      bestFor: 'B2C & Brand' },
    { id: 'google',   label: 'Google Ads',  sub: 'Search, Display, YouTube', icon: <GoogleIcon />, color: '#ea4335', features: ['8.5B searches', 'Intent targeting', 'Display network'], bestFor: 'Lead Gen' },
    { id: 'twitter',  label: 'X (Twitter)', sub: 'Trending & Viral Reach',   icon: <TwitterXIcon />, color: '#e7e7e7', features: ['600M+ users', 'Viral potential', 'Trend targeting'],  bestFor: 'Awareness' },
    { id: 'linkedin', label: 'LinkedIn Ads', sub: 'Professional Network',    icon: <LinkedInIcon />, color: '#0a66c2', features: ['1B+ professionals', 'B2B targeting', 'Decision makers'], bestFor: 'B2B & SaaS' },
  ];

  const combos = [
    { id: 'both',     label: 'Meta + Google',    ids: ['meta','google'],                     color: '#8b5cf6', icon: '⚡', desc: 'Best for consumer brands with search intent' },
    { id: 'social',   label: 'All Social',       ids: ['meta','twitter','linkedin'],          color: '#ec4899', icon: '🌐', desc: 'Maximum social presence across all networks' },
    { id: 'all',      label: 'All Platforms',    ids: ['meta','google','twitter','linkedin'], color: '#f59e0b', icon: '🚀', desc: 'Full-funnel domination across every channel', recommended: true },
  ];

  const toggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCombo = (combo: typeof combos[0]) => {
    onSelect(combo.id);
  };

  const handleCustomSelect = () => {
    if (!selectedIds.length) return;
    if (selectedIds.length === 1) { onSelect(selectedIds[0]); return; }
    // For custom multi-select, join as underscore key e.g. "meta_twitter"
    onSelect(selectedIds.join('_'));
  };

  return (
    <div className="plat-selector">
      {/* ── Brand Value Card ── */}
      {brand && <BrandValueCard brand={brand} />}

      <div className="plat-selector-title" style={{ marginTop: brand ? 20 : 0 }}>
        Choose your advertising platform
      </div>

      {/* ── Individual platforms (multi-select) ── */}
      <div className="plat-cards-grid">
        {platforms.map(opt => {
          const active = selectedIds.includes(opt.id);
          return (
            <button
              key={opt.id}
              className={`plat-card-v2 ${active ? 'active' : ''}`}
              onClick={() => toggle(opt.id)}
              style={{ '--plat-color': opt.color } as React.CSSProperties}
            >
              <div className="plat-v2-check">{active && <CheckCircle2 size={14} color="#10b981" />}</div>
              <div className="plat-v2-icon">{opt.icon}</div>
              <div className="plat-v2-label">{opt.label}</div>
              <div className="plat-v2-sub">{opt.sub}</div>
              <div className="plat-v2-best">Best for: <strong>{opt.bestFor}</strong></div>
              <ul className="plat-v2-features">
                {opt.features.map(f => <li key={f}><CheckCircle2 size={10} />{f}</li>)}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Custom selection CTA */}
      {selectedIds.length > 0 && (
        <button className="plat-custom-btn" onClick={handleCustomSelect}>
          <Zap size={15} />
          Start with {selectedIds.map(id => platforms.find(p => p.id === id)?.label).join(' + ')}
          <ArrowRight size={15} />
        </button>
      )}

      {/* ── Or pick a bundle ── */}
      <div className="plat-divider"><span>or choose a bundle</span></div>

      <div className="plat-combo-row">
        {combos.map(c => (
          <button
            key={c.id}
            className={`plat-combo-btn ${c.recommended ? 'recommended' : ''}`}
            style={{ '--plat-color': c.color } as React.CSSProperties}
            onClick={() => handleCombo(c)}
          >
            {c.recommended && <span className="plat-combo-badge">AI Pick</span>}
            <span className="plat-combo-icon">{c.icon}</span>
            <span className="plat-combo-label">{c.label}</span>
            <span className="plat-combo-desc">{c.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================
// CSS (unchanged)
// ============================================
const CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  .camp-spin { animation: spin 1s linear infinite; }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .session-loading { display: flex; align-items: center; justify-content: center; gap: 14px; min-height: calc(100vh - 68px); background: #0a0a0f; color: #64748b; font-size: 0.9rem; }
  .camp-header-wrapper { position: fixed; width :80%}
  .camp-topbar-right { position: absolute; top: 130%; right: 10px; transform: translateY(-50%); z-index: 200; display: flex; align-items: center; gap: 10px; }
  .camp-balance-chip { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); color: #6ee7b7; font-size: 0.82rem; font-weight: 700; }
  .camp-dashboard-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.3); color: #60a5fa; cursor: pointer; font-size: 0.82rem; font-weight: 600; transition: all 0.2s; }
  .camp-dashboard-btn:hover { background: rgba(59,130,246,0.22); }
  .camp-restart-top-right { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #f87171; cursor: pointer; font-size: 0.82rem; font-weight: 600; transition: all 0.2s; }
  .camp-restart-top-right:hover { background: rgba(239,68,68,0.22); }
  .camp-landing-page { width: 100%; min-height: calc(100vh - 68px); display: flex; align-items: center; justify-content: center; padding: 60px 32px; background: #f4f4fb; position: relative; overflow: hidden; }
  .camp-landing-page::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 70% 50% at 30% 20%, rgba(112,51,245,0.07) 0%, transparent 60%), radial-gradient(ellipse 55% 45% at 75% 70%, rgba(59,130,246,0.06) 0%, transparent 60%); pointer-events: none; }
  .camp-landing-inner { position: relative; z-index: 1; width: 100%; max-width: 780px; text-align: center; }
  .camp-badge { display: inline-flex; align-items: center; gap: 7px; padding: 7px 18px; border-radius: 99px; background: rgba(112,51,245,0.08); border: 1px solid rgba(112,51,245,0.18); color: #7033f5; font-size: 0.78rem; font-weight: 600; margin-bottom: 28px; }
  .camp-headline { font-size: clamp(2.2rem, 5vw, 3.6rem); font-weight: 800; color: #0f172a; margin-bottom: 18px; line-height: 1.15; letter-spacing: -0.02em; }
  .camp-gradient-text { background: linear-gradient(135deg, #7033f5, #3b82f6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .camp-sub { font-size: 1.05rem; color: #64748b; margin-bottom: 44px; line-height: 1.65; }
  .camp-input-wrap { position: relative; max-width: 680px; margin: 0 auto; }
  .camp-input-glow { position: absolute; inset: -2px; background: linear-gradient(90deg, #7033f5, #3b82f6, #ec4899); border-radius: 99px; filter: blur(14px); opacity: 0.35; z-index: 0; }
  .camp-input-glow.error { background: linear-gradient(90deg, #ef4444, #f97316); }
  .camp-input-glow.valid { background: linear-gradient(90deg, #10b981, #3b82f6); opacity: 0.25; }
  .camp-input-inner { position: relative; z-index: 1; display: flex; align-items: center; gap: 8px; background: #fff; padding: 6px; border-radius: 99px; border: 1px solid #e2e8f0; box-shadow: 0 4px 24px rgba(112,51,245,0.08); }
  .camp-input-inner.has-error { border-color: rgba(239,68,68,0.5) !important; }
  .camp-input-inner.is-valid { border-color: rgba(16,185,129,0.4) !important; }
  .camp-input-icon { color: #94a3b8; flex-shrink: 0; margin-left: 14px; }
  .camp-input-icon.valid { color: #10b981; }
  .camp-input-icon.error { color: #ef4444; }
  .camp-input-icon.checking { color: #38bdf8; }
  .camp-url-input { flex: 1; padding: 13px 16px; border: none; font-size: 0.95rem; color: #1e293b; outline: none; background: transparent; min-width: 0; }
  .camp-url-input::placeholder { color: #94a3b8; }
  .camp-url-error { display: flex; align-items: center; gap: 7px; margin-top: 10px; padding: 9px 16px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.22); border-radius: 10px; color: #fca5a5; font-size: 0.82rem; overflow: hidden; }
  .camp-launch-btn { display: flex; align-items: center; gap: 8px; padding: 13px 28px; border-radius: 99px; background: linear-gradient(135deg, #7033f5, #4f46e5); color: #fff; border: none; cursor: pointer; font-weight: 700; font-size: 0.9rem; white-space: nowrap; transition: opacity 0.2s, transform 0.2s; flex-shrink: 0; }
  .camp-launch-btn:hover:not(:disabled) { opacity: 0.9; transform: scale(1.02); }
  .camp-launch-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .camp-trust-row { display: flex; justify-content: center; gap: 24px; margin-top: 44px; flex-wrap: wrap; }
  .camp-trust-item { display: flex; align-items: center; gap: 6px; color: #94a3b8; font-size: 0.8rem; font-weight: 500; }
  .camp-stats-row { display: flex; justify-content: center; gap: 56px; margin-top: 52px; padding-top: 28px; border-top: 1px solid #e8e8f0; }
  .camp-stat-item { text-align: center; }
  .camp-stat-value { display: block; font-size: 1.9rem; font-weight: 800; color: #7033f5; margin-bottom: 6px; }
  .camp-stat-label { display: block; font-size: 0.75rem; color: #94a3b8; font-weight: 500; }
  .camp-chat-page { width: 100%; min-height: calc(100vh - 68px); background: #0a0a0f; display: flex; flex-direction: column; }
  .camp-chat-scroll { flex: 1; overflow-y: auto; padding: 32px 20px 48px; }
  .camp-chat-inner { max-width: 1020px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; width: 100%; }
  .camp-msg-row { display: flex; gap: 14px; align-items: flex-start; }
  .camp-msg-row.user { flex-direction: row-reverse; }
  .camp-avatar { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; }
  .camp-avatar.bot { background: linear-gradient(135deg, #3b82f6, #8b5cf6); }
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
  @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-6px); opacity: 1; } }
  .camp-ai-badge { padding: 3px 10px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 20px; font-size: 0.62rem; font-weight: 700; color: #fff; white-space: nowrap; }
  .confirmation-card { background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.05)); border: 1px solid rgba(16,185,129,0.25); border-radius: 16px; padding: 24px; margin-top: 6px; max-width: 520px; }
  .confirmation-header { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 20px; }
  .confirmation-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .confirmation-text h3 { margin: 0 0 6px; font-size: 1.1rem; font-weight: 700; color: #fff; }
  .confirmation-text p { margin: 0; font-size: 0.85rem; color: #94a3b8; line-height: 1.55; }
  .confirmation-text strong { color: #60a5fa; }
  .confirmation-benefits { background: rgba(0,0,0,0.2); border-radius: 10px; padding: 14px; margin-bottom: 18px; display: flex; flex-direction: column; gap: 10px; }
  .confirmation-benefit { display: flex; align-items: center; gap: 10px; font-size: 0.82rem; color: #e2e8f0; }
  .confirmation-question { display: flex; align-items: center; gap: 10px; padding: 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; margin-bottom: 16px; font-size: 0.9rem; font-weight: 600; color: #fff; }
  .confirmation-actions { display: flex; flex-direction: column; gap: 10px; }
  .confirmation-yes-btn { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 20px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 12px; color: #fff; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .confirmation-yes-btn:hover { transform: scale(1.02); box-shadow: 0 0 24px rgba(16,185,129,0.4); }
  .confirmation-no-btn { padding: 12px 20px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; color: #64748b; font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .confirmation-no-btn:hover { background: rgba(255,255,255,0.08); color: #94a3b8; }
  .payment-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .payment-modal { background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 28px; width: 100%; max-width: 460px; }
  .payment-modal-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
  .payment-modal-header > div:first-child { flex: 1; display: flex; flex-direction: column; gap: 4px; }
  .payment-modal-header h3 { margin: 0; color: #fff; font-size: 1.2rem; }
  .payment-modal-header p { margin: 0; color: #94a3b8; font-size: 0.85rem; }
  .payment-modal-header strong { color: #10b981; }
  .pm-close { background: none; border: none; color: #64748b; cursor: pointer; padding: 4px; }
  .pm-close:hover { color: #fff; }
  .pm-options { display: flex; flex-direction: column; gap: 12px; }
  .pm-title { font-size: 0.8rem; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
  .pm-option { display: flex; align-items: center; gap: 14px; padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.2s; color: inherit; }
  .pm-option:hover { border-color: #3b82f6; background: rgba(59,130,246,0.08); }
  .pm-option-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .pm-option-info { flex: 1; }
  .pm-option-name { font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 2px; }
  .pm-option-desc { font-size: 0.75rem; color: #64748b; }
  .pm-badge { font-size: 0.65rem; padding: 3px 8px; background: #10b981; color: #fff; border-radius: 4px; font-weight: 700; }
  .pm-back { display: flex; align-items: center; gap: 6px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 0.82rem; margin-bottom: 16px; }
  .pm-back:hover { color: #fff; }
  .pm-upi-box, .pm-card-form { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin-bottom: 16px; }
  .pm-upi-box label, .pm-form-group label { display: block; font-size: 0.75rem; color: #64748b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
  .pm-upi-input { display: flex; align-items: center; gap: 4px; }
  .pm-upi-input input { flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px; color: #fff; font-size: 1rem; outline: none; }
  .pm-upi-input span { color: #64748b; font-size: 0.9rem; }
  .pm-error { display: flex; align-items: center; gap: 6px; margin-top: 8px; color: #ef4444; font-size: 0.78rem; }
  .pm-amount-box { text-align: center; padding: 12px; background: rgba(16,185,129,0.1); border-radius: 8px; margin-bottom: 16px; color: #94a3b8; }
  .pm-amount-box strong { color: #10b981; font-size: 1.2rem; }
  .pm-pay-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 12px; color: #fff; font-size: 0.95rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
  .pm-pay-btn:hover:not(:disabled) { transform: scale(1.02); box-shadow: 0 0 20px rgba(16,185,129,0.3); }
  .pm-pay-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .pm-secure { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 12px; color: #64748b; font-size: 0.72rem; }
  .pm-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .pm-form-group input { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px; color: #fff; font-size: 1rem; outline: none; }
  .camp-terminal { background: #080810; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; font-family: 'Courier New', monospace; margin-top: 6px; min-width: 360px; }
  .camp-terminal-header { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #4b5563; font-size: 0.72rem; }
  .camp-terminal-url { color: #3b82f6; }
  .camp-log-line { color: #38bdf8; font-size: 0.78rem; margin-bottom: 4px; line-height: 1.5; }
  .camp-log-line.success { color: #10b981; }
  .camp-cursor { display: inline-block; width: 7px; height: 12px; background: #38bdf8; margin-top: 8px; animation: blink 1s step-end infinite; }
  .audit-card { background: rgba(12,14,22,0.95); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; margin-top: 6px; overflow: hidden; }
  .audit-topbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .audit-brand-identity { display: flex; align-items: center; gap: 12px; }
  .audit-brand-icon { width: 42px; height: 42px; border-radius: 10px; background: linear-gradient(135deg, #1e3a5f, #1e1b4b); border: 1px solid rgba(59,130,246,0.3); display: flex; align-items: center; justify-content: center; color: #60a5fa; flex-shrink: 0; }
  .audit-brand-name { font-size: 1rem; font-weight: 700; color: #fff; text-transform: capitalize; }
  .audit-brand-industry { font-size: 0.72rem; color: #64748b; margin-top: 2px; }
  .audit-tabs { display: flex; overflow-x: auto; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 0 16px; scrollbar-width: none; }
  .audit-tabs::-webkit-scrollbar { display: none; }
  .audit-tab { padding: 12px 16px; font-size: 0.78rem; font-weight: 600; color: #4b5563; background: transparent; border: none; border-bottom: 2px solid transparent; cursor: pointer; transition: color 0.2s, border-color 0.2s; white-space: nowrap; }
  .audit-tab:hover { color: #94a3b8; }
  .audit-tab.active { color: #60a5fa; border-bottom-color: #3b82f6; }
  .audit-panel { padding: 16px; }
  .audit-section-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; }
  .audit-section-card h4 { margin: 0 0 10px; color: #fff; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; }
  .audit-info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .audit-info-row:last-child { border-bottom: none; }
  .audit-info-row span { color: #64748b; font-size: 0.82rem; }
  .audit-info-row strong { color: #e2e8f0; }
  .audit-score-circles { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 14px; }
  .audit-circle { width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.03); border: 2px solid rgba(59,130,246,0.3); display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .ac-value { font-size: 1.4rem; font-weight: 800; color: #60a5fa; }
  .ac-label { font-size: 0.6rem; color: #64748b; text-transform: uppercase; }
  .audit-kw-section h4 { margin: 0 0 10px; color: #94a3b8; font-size: 0.78rem; text-transform: uppercase; }
  .audit-pills { display: flex; flex-wrap: wrap; gap: 8px; }
  .audit-pill { display: inline-block; padding: 5px 12px; border-radius: 99px; font-size: 0.78rem; font-weight: 500; }
  .audit-pill.blue { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
  .audit-pill.purple { background: rgba(139,92,246,0.15); color: #a78bfa; border: 1px solid rgba(139,92,246,0.3); }
  .audit-pill.teal { background: rgba(20,184,166,0.12); color: #2dd4bf; border: 1px solid rgba(20,184,166,0.28); }
  .audit-pill.amber { background: rgba(245,158,11,0.12); color: #fcd34d; border: 1px solid rgba(245,158,11,0.28); }
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
  .competitor-name { font-size: 0.9rem; font-weight: 700; color: #fff; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
  .competitor-name::before { content: ''; display: inline-block; width: 8px; height: 8px; border-radius: 2px; background: #8b5cf6; }
  .comp-sw-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
  .comp-sw-box { background: rgba(0,0,0,0.2); border-radius: 8px; padding: 10px; }
  .comp-sw-title { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
  .comp-sw-title.green { color: #10b981; }
  .comp-sw-title.red { color: #ef4444; }
  .comp-sw-list { list-style: none; display: flex; flex-direction: column; gap: 4px; }
  .comp-sw-list li { font-size: 0.73rem; color: #94a3b8; line-height: 1.4; display: flex; align-items: flex-start; gap: 5px; }
  .comp-sw-list li::before { content: '–'; color: #4b5563; flex-shrink: 0; }
  .comp-comparison { padding: 8px 12px; background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.14); border-radius: 8px; color: #93c5fd; font-size: 0.75rem; font-style: italic; line-height: 1.5; }
  .audit-analytics-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 14px; }
  .aa-metric { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; text-align: center; }
  .aa-value { font-size: 1.5rem; font-weight: 800; color: #60a5fa; margin-bottom: 4px; }
  .aa-label { font-size: 0.7rem; color: #64748b; text-transform: uppercase; }
  .audit-traffic-sources { display: flex; flex-direction: column; gap: 6px; }
  .audit-traffic-item { display: flex; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.025); border-radius: 8px; gap: 10px; }
  .audit-traffic-name { font-size: 0.78rem; color: #94a3b8; width: 130px; flex-shrink: 0; }
  .audit-traffic-bar { flex: 1; height: 4px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; }
  .audit-traffic-fill { height: 100%; border-radius: 99px; }
  .audit-score-badge { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 52px; height: 52px; border-radius: 12px; background: linear-gradient(135deg,rgba(16,185,129,0.15),rgba(59,130,246,0.1)); border: 1px solid rgba(16,185,129,0.3); }
  .audit-score-num { font-size: 1.2rem; font-weight: 800; color: #10b981; line-height: 1; }
  .audit-score-lbl { font-size: 0.52rem; color: #4b5563; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
  .audit-objective { padding: 12px 14px; background: linear-gradient(135deg,rgba(59,130,246,0.08),rgba(139,92,246,0.06)); border: 1px solid rgba(59,130,246,0.18); border-radius: 10px; color: #93c5fd; font-size: 0.82rem; line-height: 1.55; margin-bottom: 12px; }
  .audit-info-row p { color: #94a3b8; font-size: 0.8rem; font-style: italic; margin: 0; text-align: right; }
  .audit-mono { font-family: 'Courier New',monospace; font-size: 0.72rem !important; }
  .plat-selector { margin-top: 8px; }
  .plat-selector-title { font-size: 0.88rem; font-weight: 700; color: #e2e8f0; margin-bottom: 14px; }

  /* ── Brand Value Card ── */
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
  .bvc-gap-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 10px; margin-bottom: 4px; }
  .bvc-gap-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .bvc-gap-label { font-size: 0.62rem; color: #4b5563; text-transform: uppercase; letter-spacing: 0.06em; }
  .bvc-gap-item strong { font-size: 1rem; font-weight: 800; }
  /* Chart */
  .bvc-chart { position: relative; height: 110px; display: flex; gap: 0; margin: 10px 0 6px; padding-left: 28px; }
  .bvc-chart-lines { position: absolute; left: 0; top: 0; bottom: 20px; width: 26px; display: flex; flex-direction: column; justify-content: space-between; }
  .bvc-chart-line { display: flex; align-items: flex-end; }
  .bvc-chart-line-label { font-size: 0.56rem; color: #4b5563; line-height: 1; }
  .bvc-chart-bars { flex: 1; display: flex; align-items: flex-end; gap: 6px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 20px; }
  .bvc-chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 90px; justify-content: flex-end; position: relative; }
  .bvc-chart-col-bars { display: flex; gap: 3px; align-items: flex-end; height: 80px; width: 100%; justify-content: center; }
  .bvc-bar-wrap { flex: 1; display: flex; align-items: flex-end; height: 80px; max-width: 18px; }
  .bvc-bar { width: 100%; border-radius: 3px 3px 0 0; transition: height 0.8s ease; min-height: 3px; }
  .bvc-bar.with-us { background: linear-gradient(180deg, #3b82f6, #6366f1); }
  .bvc-bar.without-us { background: rgba(100,116,139,0.4); }
  .bvc-chart-month { font-size: 0.6rem; color: #4b5563; position: absolute; bottom: 0; white-space: nowrap; }
  .bvc-legend { display: flex; gap: 16px; justify-content: center; margin-bottom: 12px; }
  .bvc-legend-item { display: flex; align-items: center; gap: 5px; font-size: 0.68rem; color: #64748b; }
  .bvc-legend-dot { width: 10px; height: 10px; border-radius: 2px; }
  .bvc-legend-dot.with-us { background: linear-gradient(135deg,#3b82f6,#6366f1); }
  .bvc-legend-dot.without-us { background: rgba(100,116,139,0.5); }
  .bvc-insight { display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px; background: rgba(245,158,11,0.07); border: 1px solid rgba(245,158,11,0.2); border-radius: 9px; font-size: 0.76rem; color: #cbd5e1; line-height: 1.5; }

  /* ── New platform grid (4 platforms) ── */
  .plat-cards-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px; }
  .plat-card-v2 { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 7px; padding: 14px 12px; background: rgba(15,20,35,0.9); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; cursor: pointer; text-align: left; transition: all 0.22s; color: inherit; }
  .plat-card-v2:hover { border-color: var(--plat-color); background: color-mix(in srgb, var(--plat-color) 8%, rgba(15,20,35,0.9)); transform: translateY(-2px); }
  .plat-card-v2.active { border-color: var(--plat-color); background: color-mix(in srgb, var(--plat-color) 12%, rgba(15,20,35,0.9)); box-shadow: 0 0 18px color-mix(in srgb, var(--plat-color) 20%, transparent); }
  .plat-v2-check { position: absolute; top: 8px; right: 8px; height: 18px; }
  .plat-v2-icon { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; }
  .plat-v2-label { font-size: 0.82rem; font-weight: 700; color: #fff; }
  .plat-v2-sub { font-size: 0.65rem; color: #64748b; }
  .plat-v2-best { font-size: 0.63rem; color: #94a3b8; padding: 3px 7px; background: rgba(255,255,255,0.04); border-radius: 5px; }
  .plat-v2-best strong { color: var(--plat-color); }
  .plat-v2-features { list-style: none; margin: 2px 0 0; padding: 0; display: flex; flex-direction: column; gap: 3px; }
  .plat-v2-features li { display: flex; align-items: center; gap: 5px; color: #4b5563; font-size: 0.65rem; }
  .plat-v2-features li svg { color: #10b981; flex-shrink: 0; }
  /* Custom select button */
  .plat-custom-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 12px; background: linear-gradient(135deg,rgba(59,130,246,0.15),rgba(139,92,246,0.12)); border: 1px solid rgba(59,130,246,0.35); border-radius: 10px; color: #60a5fa; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-bottom: 14px; }
  .plat-custom-btn:hover { background: linear-gradient(135deg,rgba(59,130,246,0.25),rgba(139,92,246,0.2)); box-shadow: 0 0 20px rgba(59,130,246,0.2); }
  /* Divider */
  .plat-divider { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .plat-divider::before, .plat-divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
  .plat-divider span { font-size: 0.7rem; color: #4b5563; white-space: nowrap; }
  /* Bundle/Combo row */
  .plat-combo-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
  .plat-combo-btn { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 5px; padding: 12px 14px; background: rgba(15,20,35,0.9); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; cursor: pointer; text-align: left; transition: all 0.22s; color: inherit; }
  .plat-combo-btn:hover { border-color: var(--plat-color); transform: translateY(-2px); }
  .plat-combo-btn.recommended { border-color: rgba(245,158,11,0.4); background: rgba(245,158,11,0.05); }
  .plat-combo-badge { position: absolute; top: -1px; right: 10px; background: linear-gradient(135deg,#f59e0b,#d97706); color: #000; font-size: 0.55rem; font-weight: 800; padding: 2px 7px; border-radius: 0 0 6px 6px; }
  .plat-combo-icon { font-size: 1.4rem; line-height: 1; }
  .plat-combo-label { font-size: 0.82rem; font-weight: 700; color: #fff; }
  .plat-combo-desc { font-size: 0.65rem; color: #64748b; line-height: 1.4; }
  /* keep old single-card classes for fallback */
  .plat-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .plat-card { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 18px 16px; background: rgba(15,20,35,0.9); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; cursor: pointer; text-align: left; transition: all 0.25s; color: inherit; }
  .plat-card:hover { border-color: var(--plat-color); background: color-mix(in srgb, var(--plat-color) 8%, rgba(15,20,35,0.9)); transform: translateY(-2px); }
  .plat-badge { position: absolute; top: -1px; right: 12px; background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: #fff; font-size: 0.6rem; font-weight: 700; padding: 3px 8px; border-radius: 0 0 8px 8px; }
  .plat-card-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
  .plat-card-label { font-size: 0.95rem; font-weight: 700; color: #fff; }
  .plat-card-sub { font-size: 0.72rem; color: #64748b; margin-top: -4px; }
  .plat-card-best { font-size: 0.7rem; color: #94a3b8; padding: 4px 8px; background: rgba(255,255,255,0.04); border-radius: 6px; }
  .plat-card-best strong { color: var(--plat-color); }
  .plat-features { list-style: none; margin: 4px 0 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
  .plat-features li { display: flex; align-items: center; gap: 6px; color: #64748b; font-size: 0.72rem; }
  .plat-features li svg { color: #10b981; flex-shrink: 0; }
  .plat-cta { display: flex; align-items: center; gap: 5px; color: var(--plat-color); font-size: 0.78rem; font-weight: 600; margin-top: 4px; }
  @media (max-width: 780px) { .plat-cards-grid { grid-template-columns: repeat(2,1fr); } .plat-combo-row { grid-template-columns: 1fr 1fr; } .bvc-gap-row { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 480px) { .plat-cards-grid { grid-template-columns: 1fr 1fr; } .plat-combo-row { grid-template-columns: 1fr; } }
  .budget-input-form { background: rgba(12,18,30,0.95); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; margin-top: 6px; }
  .bif-header { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
  .bif-title { font-size: 0.95rem; font-weight: 700; color: #fff; }
  .bif-sub { font-size: 0.72rem; color: #64748b; margin-top: 2px; }
  .bif-presets { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
  .bif-preset { padding: 7px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #94a3b8; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .bif-preset:hover, .bif-preset.active { background: rgba(59,130,246,0.15); border-color: rgba(59,130,246,0.4); color: #60a5fa; }
  .bif-input-row { display: flex; gap: 10px; align-items: center; }
  .bif-input-wrap { flex: 1; display: flex; align-items: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 0 14px; }
  .bif-currency { color: #10b981; font-weight: 700; font-size: 1.1rem; margin-right: 4px; }
  .bif-input { flex: 1; background: transparent; border: none; color: #fff; font-size: 1rem; font-weight: 600; padding: 12px 6px; outline: none; }
  .bif-input::-webkit-outer-spin-button, .bif-input::-webkit-inner-spin-button { -webkit-appearance: none; }
  .bif-period { color: #4b5563; font-size: 0.8rem; }
  .bif-submit { display: flex; align-items: center; gap: 8px; padding: 12px 22px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 10px; color: #fff; font-weight: 700; cursor: pointer; font-size: 0.88rem; white-space: nowrap; transition: all 0.2s; flex-shrink: 0; }
  .bif-submit:hover:not(:disabled) { transform: scale(1.02); box-shadow: 0 0 20px rgba(16,185,129,0.3); }
  .bif-submit:disabled { opacity: 0.4; cursor: not-allowed; }
  .bif-error { display: flex; align-items: center; gap: 7px; margin-top: 10px; color: #fca5a5; font-size: 0.8rem; }
  .tiers-card { margin-top: 6px; }
  .tiers-ai-note { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 14px; padding: 12px 14px; background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.15); border-radius: 10px; }
  .tiers-ai-note svg { color: #60a5fa; flex-shrink: 0; margin-top: 2px; }
  .tiers-ai-note p { color: #93c5fd; font-size: 0.82rem; line-height: 1.55; margin: 0; }
  .tiers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .tier-card { position: relative; background: rgba(12,18,30,0.95); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px 16px; display: flex; flex-direction: column; gap: 10px; transition: all 0.25s; }
  .tier-card.recommended { border-color: var(--tc); background: color-mix(in srgb, var(--tc) 6%, rgba(12,18,30,0.95)); box-shadow: 0 0 30px color-mix(in srgb, var(--tc) 15%, transparent); }
  .tier-badge { position: absolute; top: -1px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, var(--tc), color-mix(in srgb, var(--tc) 70%, #000)); color: #fff; font-size: 0.58rem; font-weight: 800; padding: 3px 10px; border-radius: 0 0 8px 8px; letter-spacing: 0.06em; white-space: nowrap; }
  .tier-icon { font-size: 1.8rem; line-height: 1; }
  .tier-label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }
  .tier-budget { font-size: 1.7rem; font-weight: 900; color: #fff; line-height: 1; }
  .tier-budget span { font-size: 0.75rem; color: #64748b; font-weight: 500; }
  .tier-desc { font-size: 0.72rem; color: #64748b; line-height: 1.5; }
  .tier-metrics { display: flex; flex-direction: column; gap: 6px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 8px; }
  .tier-platform-row { display: flex; justify-content: space-between; align-items: center; }
  .tier-platform-name { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }
  .tier-platform-stats { display: flex; gap: 8px; }
  .tier-platform-stats span { font-size: 0.65rem; color: #4b5563; }
  .tier-roi { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); }
  .tier-roi span { font-size: 0.72rem; color: #64748b; }
  .tier-roi strong { font-size: 0.95rem; font-weight: 800; }
  .tier-select-row { margin-top: 8px; }
  .tier-select-label { font-size: 0.8rem; color: #64748b; margin-bottom: 10px; }
  .tier-select-btns { display: flex; gap: 8px; flex-wrap: wrap; }
  .tier-select-btn { display: flex; align-items: center; gap: 8px; padding: 10px 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #94a3b8; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }
  .tier-select-btn:hover, .tier-select-btn.recommended { background: color-mix(in srgb, var(--tc) 12%, transparent); border-color: var(--tc); color: var(--tc); }
  .tsb-label { font-weight: 700; }
  .tsb-amount { font-size: 0.78rem; color: #64748b; }
  .camp-funds-card { background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.25); border-radius: 14px; padding: 20px; margin-top: 6px; }
  .funds-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
  .funds-header h3 { margin: 0 0 4px; color: #fff; font-size: 0.95rem; }
  .funds-header p { margin: 0; color: #94a3b8; font-size: 0.82rem; }
  .funds-amounts { background: rgba(0,0,0,0.2); border-radius: 10px; overflow: hidden; margin-bottom: 16px; }
  .funds-amount-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .funds-amount-row:last-child { border-bottom: none; }
  .funds-amount-row.highlight { background: rgba(245,158,11,0.06); }
  .funds-amount-row span { color: #64748b; font-size: 0.83rem; }
  .camp-funds-btns { display: flex; flex-direction: column; gap: 8px; }
  .camp-add-funds-btn { padding: 10px 18px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; color: #fff; font-weight: 600; display: flex; align-items: center; gap: 7px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }
  .camp-add-funds-btn.primary { background: linear-gradient(135deg, #f59e0b, #d97706); border: none; }
  .camp-add-funds-btn:hover { opacity: 0.88; transform: scale(1.01); }
  .publish-card { background: rgba(12,18,30,0.95); border: 1px solid rgba(16,185,129,0.25); border-radius: 16px; padding: 22px; margin-top: 6px; }
  .publish-card-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 20px; }
  .publish-card-title { font-size: 1.05rem; font-weight: 700; color: #fff; }
  .publish-card-sub { font-size: 0.72rem; color: #64748b; margin-top: 3px; }
  .publish-card-sub code { font-family: monospace; color: #38bdf8; }
  .publish-summary { display: flex; flex-direction: column; margin-bottom: 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden; }
  .publish-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .publish-row:last-child { border-bottom: none; }
  .publish-row span { display: flex; align-items: center; gap: 7px; color: #64748b; font-size: 0.84rem; }
  .publish-row strong { color: #fff; font-size: 0.9rem; }
  .publish-actions { display: flex; flex-direction: column; gap: 10px; }
  .publish-btn { width: 100%; padding: 15px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 12px; color: #fff; font-weight: 700; font-size: 0.97rem; display: flex; align-items: center; justify-content: center; gap: 9px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
  .publish-btn:hover { transform: scale(1.02); box-shadow: 0 0 24px rgba(16,185,129,0.35); }
  .publish-dashboard-btn { width: 100%; padding: 12px; background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.3); border-radius: 12px; color: #60a5fa; font-weight: 600; font-size: 0.88rem; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
  .publish-dashboard-btn:hover { background: rgba(59,130,246,0.22); }
  .go-to-dashboard-card { background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.05)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin-top: 6px; max-width: 420px; }
  .gtds-header { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 16px; }
  .gtds-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(16,185,129,0.15); display: flex; align-items: center; justify-content: center; color: #10b981; flex-shrink: 0; }
  .gtds-header h3 { margin: 0 0 4px; color: #fff; font-size: 1.05rem; }
  .gtds-header p { margin: 0; color: #94a3b8; font-size: 0.82rem; }
  .gtds-info { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: rgba(0,0,0,0.2); border-radius: 8px; margin-bottom: 16px; color: #64748b; font-size: 0.78rem; }
  .gtds-info code { color: #38bdf8; font-family: monospace; }
  .gtds-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 12px; color: #fff; font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.2s; }
  .gtds-btn:hover { transform: scale(1.02); box-shadow: 0 0 24px rgba(16,185,129,0.4); }
  .dashboard-wrapper { min-height: calc(100vh - 68px); background: #0a0a0f; }
  .dashboard-page { max-width: 1400px; margin: 0 auto; padding: 24px; }
  .dashboard-page.fullscreen { max-width: 100%; padding: 20px; }
  .dash-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
  .dash-header-left { display: flex; align-items: center; gap: 16px; }
  .dash-back-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #94a3b8; cursor: pointer; font-size: 0.82rem; transition: all 0.2s; }
  .dash-back-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
  .dash-title-section h2 { margin: 0; color: #fff; font-size: 1.3rem; }
  .dash-campaign-id { font-size: 0.72rem; color: #64748b; }
  .dash-header-right { display: flex; align-items: center; gap: 10px; }
  .dash-time-filter { display: flex; background: rgba(255,255,255,0.04); border-radius: 8px; overflow: hidden; }
  .dash-time-btn { padding: 8px 14px; background: none; border: none; color: #64748b; cursor: pointer; font-size: 0.78rem; font-weight: 600; transition: all 0.2s; }
  .dash-time-btn.active, .dash-time-btn:hover { background: rgba(59,130,246,0.2); color: #60a5fa; }
  .dash-refresh-btn, .dash-fullscreen-btn { padding: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #94a3b8; cursor: pointer; transition: all 0.2s; }
  .dash-refresh-btn:hover, .dash-fullscreen-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
  .dash-status-bar { display: flex; align-items: center; gap: 20px; padding: 12px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; margin-bottom: 20px; flex-wrap: wrap; }
  .dash-status-item { display: flex; align-items: center; gap: 7px; color: #64748b; font-size: 0.78rem; }
  .dash-status-dot { width: 8px; height: 8px; border-radius: 50%; }
  .dash-overall-metrics { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 20px; }
  .dash-metric-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; text-align: center; transition: all 0.2s; }
  .dash-metric-card:hover { background: rgba(255,255,255,0.06); }
  .dash-metric-card.highlight { border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.05); }
  .dash-metric-icon { margin-bottom: 8px; color: #64748b; }
  .dash-metric-value { font-size: 1.6rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
  .dash-metric-label { font-size: 0.68rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .dash-platform-tabs { display: flex; gap: 10px; margin-bottom: 16px; }
  .dash-platform-tab { display: flex; align-items: center; gap: 10px; padding: 12px 20px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #94a3b8; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
  .dash-platform-tab.active { background: rgba(59,130,246,0.15); border-color: rgba(59,130,246,0.4); color: #60a5fa; }
  .dash-tab-status { font-size: 0.62rem; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
  .dash-tab-status.active { background: rgba(16,185,129,0.15); color: #10b981; }
  .dash-tab-status.creating { background: rgba(245,158,11,0.15); color: #f59e0b; }
  .dash-platform-detail { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px; }
  .dash-platform-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .dash-platform-info { display: flex; align-items: center; gap: 14px; }
  .dash-platform-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
  .dash-platform-info h3 { margin: 0 0 4px; color: #fff; font-size: 1.1rem; }
  .dash-platform-info p { margin: 0; color: #64748b; font-size: 0.78rem; }
  .dash-platform-status { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: rgba(255,255,255,0.05); border-radius: 8px; color: #94a3b8; font-size: 0.82rem; font-weight: 600; }
  .dash-metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
  .dash-metric-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 14px; }
  .dash-metric-box.highlight { border-color: rgba(16,185,129,0.2); background: rgba(16,185,129,0.05); }
  .dash-mb-value { font-size: 1.2rem; font-weight: 800; color: #fff; margin-bottom: 2px; }
  .dash-mb-label { font-size: 0.62rem; color: #64748b; text-transform: uppercase; margin-bottom: 8px; }
  .dash-mb-bar { height: 3px; background: rgba(255,255,255,0.05); border-radius: 99px; overflow: hidden; }
  .dash-mb-bar-fill { height: 100%; border-radius: 99px; }
  .dash-adsets { background: rgba(0,0,0,0.2); border-radius: 10px; overflow: hidden; margin-bottom: 16px; }
  .dash-adsets-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .dash-adsets-header h4 { margin: 0; display: flex; align-items: center; gap: 8px; color: #fff; font-size: 0.85rem; }
  .dash-adsets-header span { color: #64748b; font-size: 0.75rem; }
  .dash-adsets-table { max-height: 200px; overflow-y: auto; }
  .dash-adset-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr; gap: 10px; padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 0.78rem; align-items: center; }
  .dash-adset-row:last-child { border-bottom: none; }
  .dash-adset-row.header { background: rgba(255,255,255,0.02); font-size: 0.65rem; color: #64748b; text-transform: uppercase; }
  .dash-adset-row span { color: #94a3b8; }
  .adset-status { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.62rem; font-weight: 700; text-transform: uppercase; }
  .adset-status.active { background: rgba(16,185,129,0.15); color: #10b981; }
  .adset-status.paused { background: rgba(245,158,11,0.15); color: #f59e0b; }
  .dash-view-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 12px; border-radius: 10px; color: #fff; font-size: 0.85rem; font-weight: 600; text-decoration: none; transition: opacity 0.2s; }
  .dash-view-btn:hover { opacity: 0.85; }
  @media (max-width: 1100px) { .dash-overall-metrics { grid-template-columns: repeat(3, 1fr); } .dash-metrics-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 900px) { .plat-cards { grid-template-columns: 1fr; } .tiers-grid { grid-template-columns: 1fr; } .dash-overall-metrics { grid-template-columns: repeat(2, 1fr); } .dash-adset-row { grid-template-columns: 2fr 1fr 1fr 1fr 1fr; overflow-x: auto; } }
  @media (max-width: 680px) { .camp-landing-page { padding: 40px 20px; } .camp-headline { font-size: 2rem; } .camp-stats-row { gap: 28px; } .camp-topbar-right { gap: 6px; } .camp-restart-top-right span { display: none; } .bif-input-row { flex-direction: column; } .bif-submit { width: 100%; justify-content: center; } .dash-header { flex-direction: column; align-items: flex-start; } .dash-overall-metrics { grid-template-columns: 1fr 1fr; } .dash-metrics-grid { grid-template-columns: 1fr 1fr; } .dash-platform-tabs { flex-direction: column; } .dash-platform-header { flex-direction: column; align-items: flex-start; gap: 12px; } }

`;

export default Campaigns;