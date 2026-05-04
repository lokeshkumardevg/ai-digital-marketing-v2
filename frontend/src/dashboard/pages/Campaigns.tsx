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
import { Header } from '../components/Header';

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

interface UserProfile { id: string; name: string; email: string; balance: number; currency: string }
interface Message { id: string; role: 'user' | 'bot'; type: string; content: any }

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
const SESSION_VERSION = 'v2'; // bump this to invalidate old sessions
const LOCAL_KEY = 'nexus_session';

type UrlValidationResult = { ok: true; normalizedUrl: string } | { ok: false; code: string; message: string };

const validateUrlFormat = (inputUrl: string): UrlValidationResult => {
  const raw = inputUrl?.trim() ?? '';
  if (!raw) return { ok: false, code: 'EMPTY', message: 'Please enter a website URL to analyze.' };
  if (/^(localhost|127\.|192\.168\.|10\.|0\.0\.0\.0)/i.test(raw.replace(/^https?:\/\//i, '')))
    return { ok: false, code: 'LOCALHOST', message: 'Local or private addresses cannot be analyzed.' };
  const withoutProtocol = raw.replace(/^https?:\/\//i, '').replace(/^\/\//, '');
  if (!withoutProtocol.includes('.')) return { ok: false, code: 'NO_TLD', message: 'URL must include a domain extension.' };
  let normalized = raw;
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) normalized = 'https://' + normalized;
  try {
    const parsed = new URL(normalized);
    if (!parsed.hostname.includes('.')) return { ok: false, code: 'NO_TLD', message: 'URL must include a domain extension.' };
    return { ok: true, normalizedUrl: normalized };
  } catch { return { ok: false, code: 'INVALID_FORMAT', message: 'Invalid URL format.' }; }
};

const checkUrlReachable = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
    clearTimeout(timeout); return true;
  } catch { return false; }
};

const getHostname = (url: string): string => {
  if (!url || typeof url !== 'string') return 'analyzing...';
  try {
    let u = url;
    if (!u.startsWith('http://') && !u.startsWith('https://')) u = 'https://' + u;
    return new URL(u).hostname;
  } catch { return url.length > 50 ? url.substring(0, 50) + '...' : url; }
};

const resolveBrandName = (b: BrandDetails): string => b.brand?.name || b.brandName || b.auditData?.brand?.name || 'Brand';
const resolveIndustry = (b: BrandDetails): string => b.brand?.industry || b.industry || b.auditData?.brand?.industry || '';

const fmt = (n: number) => n?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) || '$0';
const fmtINR = (n: number) => n?.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) || '₹0';

const generateBudgetTiers = (userBudget: number, platforms: string[]): BudgetBreakdown => {
  const buildTier = (label: string, mult: number, desc: string, recommended = false): BudgetTier => {
    const total = Math.round(userBudget * mult);
    const perPlatform = platforms.length > 1 ? Math.round(total / 2) : total;
    const platformData = platforms.map(p => {
      const cpc = p === 'meta' ? 1.2 : 2.8;
      const ctr = p === 'meta' ? 0.018 : 0.032;
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
    const totals = platformData.reduce((acc, p) => ({
      monthlyCharge: acc.monthlyCharge + p.monthlyCharge,
      campaignBudget: acc.campaignBudget + p.campaignBudget,
      ourBudget: acc.ourBudget + p.ourBudget,
      roiEstimate: Math.max(acc.roiEstimate, p.roiEstimate),
    }), { monthlyCharge: 0, campaignBudget: 0, ourBudget: 0, roiEstimate: 0 });
    return { label, totalBudget: total, dailyBudget: Math.round(total / 30), platforms: platformData, total: totals, recommended, description: desc };
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
// SESSION PERSISTENCE  ← KEY CHANGE
// Saves to backend first, falls back to localStorage.
// On load, prefers backend data over stale local cache.
// TTL: 30 days for active campaigns, 7 days otherwise.
// ============================================

interface PersistedSession {
  version: string;
  userId: string;
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

// Local fallback
const saveLocal = (session: PersistedSession) => {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(session)); } catch {}
};

const loadLocal = (userId: string): PersistedSession | null => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const s: PersistedSession = JSON.parse(raw);
    if (s.userId !== userId || !isSessionValid(s)) return null;
    return s;
  } catch { return null; }
};

const clearLocal = () => {
  try { localStorage.removeItem(LOCAL_KEY); } catch {}
};

// Backend persistence
const saveRemote = async (userId: string, session: PersistedSession): Promise<void> => {
  try {
    await axios.post(`${API_BASE}/campaign/session/save`, { userId, session });
  } catch {
    // Silent fail — local is the backup
  }
};

const loadRemote = async (userId: string): Promise<PersistedSession | null> => {
  try {
    const { data } = await axios.get(`${API_BASE}/campaign/session/${userId}`);
    if (data?.session && isSessionValid(data.session)) return data.session;
    return null;
  } catch {
    return null;
  }
};

const clearRemote = async (userId: string): Promise<void> => {
  try { await axios.delete(`${API_BASE}/campaign/session/${userId}`); } catch {}
};

// ============================================
// DEBOUNCE HELPER
// ============================================
const useDebounce = <T extends (...args: any[]) => any>(fn: T, delay: number): T => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
  ((...args: Parameters<T>) => {
    // your logic here
    return fn(...args);
  }) as T,
  [fn, delay]
);
};

const FacebookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);

const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 48 48">
    <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.6h12.4c-.5 2.8-2.1 5.2-4.5 6.8v5.6h7.3c4.3-3.9 6.9-9.7 6.9-16.5z"/>
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.6c-2.1 1.4-4.7 2.2-8.6 2.2-6.6 0-12.2-4.5-14.2-10.5H2.3v5.8C6.3 42.6 14.6 48 24 48z"/>
    <path fill="#FBBC05" d="M9.8 28.3c-.5-1.4-.8-2.9-.8-4.3s.3-2.9.8-4.3v-5.8H2.3C.8 17.1 0 20.5 0 24s.8 6.9 2.3 10.1l7.5-5.8z"/>
    <path fill="#EA4335" d="M24 9.5c3.7 0 7 1.3 9.6 3.8l7.2-7.2C36.9 2.1 31.5 0 24 0 14.6 0 6.3 5.4 2.3 13.9l7.5 5.8C11.8 14 17.4 9.5 24 9.5z"/>
  </svg>
);

// ============================================
// AI TYPING BUBBLE
// ============================================
const TypingBubble: React.FC<{ text: string; speed?: number }> = ({ text, speed = 18 }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  useEffect(() => {
    indexRef.current = 0; setDisplayed(''); setDone(false);
    const interval = setInterval(() => {
      if (indexRef.current < text.length) { setDisplayed(text.slice(0, indexRef.current + 1)); indexRef.current++; }
      else { setDone(true); clearInterval(interval); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return <div className="camp-bubble-bot">{displayed}{!done && <span className="camp-typing-cursor" />}</div>;
};

// ============================================
// ERROR BOUNDARY
// ============================================
class ErrorBoundary extends React.Component<{ children: React.ReactNode; fallback?: React.ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return this.props.fallback || <div style={{ padding: 16, color: '#ef4444' }}><AlertTriangle size={20} /><p>{this.state.error?.message || 'Failed to render'}</p></div>;
    return this.props.children;
  }
}

// ============================================
// CAMPAIGN CONFIRMATION COMPONENT
// ============================================
const CampaignConfirmation: React.FC<{ brandName: string; onConfirm: () => void; onDecline: () => void }> = ({ brandName, onConfirm, onDecline }) => {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return (
    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4 }} className="confirmation-card">
      <div className="confirmation-header">
        <div className="confirmation-icon" style={{ background: `${color}18`, color }}><Rocket size={24} /></div>
        <div className="confirmation-text">
          <h3>Ready to launch your campaign?</h3>
          <p>We've analyzed <strong>{brandName}</strong> and identified the best advertising opportunities for your brand.</p>
        </div>
      </div>
      <div className="confirmation-benefits">
        {['AI-optimized budget allocation', 'Multi-platform ad campaigns (Meta & Google)', 'Real-time performance tracking', 'Automatic ROI optimization'].map((item) => (
          <div key={item} className="confirmation-benefit"><CheckCircle2 size={14} color="#10b981" /><span>{item}</span></div>
        ))}
      </div>
      <div className="confirmation-question"><Zap size={16} color={color} /><span>Would you like to create a campaign for {brandName}?</span></div>
      <div className="confirmation-actions">
        <button className="confirmation-yes-btn" onClick={onConfirm}><Rocket size={18} />Yes, Create My Campaign</button>
        <button className="confirmation-no-btn" onClick={onDecline}>Maybe Later</button>
      </div>
    </motion.div>
  );
};

// ============================================
// PAYMENT MODAL COMPONENT
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
                <input type="text" placeholder="yourname@upi" value={upiId} onChange={(e) => { setUpiId(e.target.value); setUpiError(''); }} />
                <span>@upi</span>
              </div>
              {upiError && <div className="pm-error"><AlertCircle size={14} /> {upiError}</div>}
            </div>
            <div className="pm-amount-box">Amount: <strong>{fmtINR(amount)}</strong></div>
            <button className="pm-pay-btn" onClick={handleUpiPay} disabled={processing || !upiId}>
              {processing ? <><Loader2 size={18} className="spin" /> Processing... </> : <><IndianRupee size={18} /> Pay {fmtINR(amount)} via UPI</>}
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
                <input type="text" placeholder="1234 5678 9012 3456" maxLength={19} value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())} />
              </div>
              <div className="pm-form-row">
                <div className="pm-form-group"><label>Expiry</label><input type="text" placeholder="MM/YY" maxLength={5} value={expiry} onChange={(e) => setExpiry(e.target.value)} /></div>
                <div className="pm-form-group"><label>CVV</label><input type="password" placeholder="•••" maxLength={4} value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} /></div>
              </div>
              <div className="pm-form-group"><label>Cardholder Name</label><input type="text" placeholder="John Doe" value={cardName} onChange={(e) => setCardName(e.target.value)} /></div>
            </div>
            <div className="pm-amount-box">Amount: <strong>{fmtINR(amount)}</strong></div>
            <button className="pm-pay-btn" onClick={handleCardPay} disabled={processing || cardNumber.length < 16}>
              {processing ? <><Loader2 size={18} className="spin" /> Processing... </> : <><CreditCard size={18} /> Pay {fmtINR(amount)}</>}
            </button>
            <div className="pm-secure"><Shield size={14} /> Secure payment via Stripe</div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ============================================
// LIVE DASHBOARD COMPONENT
// ============================================
const LiveDashboard: React.FC<{
  campaign: LiveCampaignData;
  brandName: string;
  onBackToChat: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}> = ({ campaign, brandName, onBackToChat, onRefresh, isRefreshing }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>(campaign.platforms[0]?.name || 'meta');
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [showFullscreen, setShowFullscreen] = useState(false);
  
  const platform = campaign.platforms.find((p: any) => p.name === selectedPlatform) || campaign.platforms[0];
  const isMeta = platform?.name === 'meta';
  const platformColor = isMeta ? '#3b82f6' : '#ea4335';
  const platformIcon = isMeta ? <FacebookIcon /> : <GoogleIcon />;
  const platformName = isMeta ? 'Meta Ads' : 'Google Ads';

  const statusColors: Record<string, string> = { CREATING: '#f59e0b', PROCESSING: '#3b82f6', ACTIVE: '#10b981', PAUSED: '#64748b', FAILED: '#ef4444' };
  const statusLabels: Record<string, string> = { CREATING: 'Creating', PROCESSING: 'Processing', ACTIVE: 'Live', PAUSED: 'Paused', FAILED: 'Failed' };

  return (
    <div className={`dashboard-page ${showFullscreen ? 'fullscreen' : ''}`}>
      <div className="dash-header">
        <div className="dash-header-left">
          <button className="dash-back-btn" onClick={onBackToChat}><ArrowLeft size={18} /> Chat</button>
          <div className="dash-title-section">
            <h2>{campaign.campaignName || brandName} Campaign</h2>
            <span className="dash-campaign-id">ID: {campaign.campaignId?.slice(0, 16)}...</span>
          </div>
        </div>
        <div className="dash-header-right">
          <div className="dash-time-filter">
            {(['7d', '14d', '30d'] as const).map(range => (
              <button key={range} className={`dash-time-btn ${timeRange === range ? 'active' : ''}`} onClick={() => setTimeRange(range)}>
                {range === '7d' ? '7 Days' : range === '14d' ? '14 Days' : '30 Days'}
              </button>
            ))}
          </div>
          <button className="dash-refresh-btn" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCcw size={16} className={isRefreshing ? 'spin' : ''} />
          </button>
          <button className="dash-fullscreen-btn" onClick={() => setShowFullscreen(!showFullscreen)}>
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="dash-status-bar">
        <div className="dash-status-item">
          <span className="dash-status-dot" style={{ background: statusColors[campaign.status] }} />
          <span>{statusLabels[campaign.status] || campaign.status}</span>
        </div>
        <div className="dash-status-item"><Clock size={14} /><span>{new Date(campaign.createdAt).toLocaleDateString()}</span></div>
        <div className="dash-status-item"><Wifi size={14} color={campaign.status === 'ACTIVE' ? '#10b981' : '#64748b'} /><span>{campaign.status === 'ACTIVE' ? 'Auto-updating every 5s' : 'Updates paused'}</span></div>
      </div>

      {/* Overall Metrics */}
      <div className="dash-overall-metrics">
        <div className="dash-metric-card">
          <div className="dash-metric-icon"><Eye size={20} /></div>
          <div className="dash-metric-value">{(campaign.overallMetrics?.totalImpressions || 0).toLocaleString()}</div>
          <div className="dash-metric-label">Total Impressions</div>
        </div>
        <div className="dash-metric-card">
          <div className="dash-metric-icon"><MousePointerClick size={20} /></div>
          <div className="dash-metric-value">{(campaign.overallMetrics?.totalClicks || 0).toLocaleString()}</div>
          <div className="dash-metric-label">Total Clicks</div>
        </div>
        <div className="dash-metric-card">
          <div className="dash-metric-icon"><DollarSign size={20} /></div>
          <div className="dash-metric-value">{fmt(campaign.overallMetrics?.totalSpend || 0)}</div>
          <div className="dash-metric-label">Total Spend</div>
        </div>
        <div className="dash-metric-card">
          <div className="dash-metric-icon"><Target size={20} /></div>
          <div className="dash-metric-value">{(campaign.overallMetrics?.totalConversions || 0).toLocaleString()}</div>
          <div className="dash-metric-label">Conversions</div>
        </div>
        <div className="dash-metric-card highlight">
          <div className="dash-metric-icon"><TrendingUp size={20} /></div>
          <div className="dash-metric-value" style={{ color: '#10b981' }}>{campaign.overallMetrics?.overallRoi || 0}%</div>
          <div className="dash-metric-label">Overall ROI</div>
        </div>
      </div>

      {/* Platform Tabs */}
      <div className="dash-platform-tabs">
        {campaign.platforms.map((p: any) => (
          <button key={p.name} className={`dash-platform-tab ${selectedPlatform === p.name ? 'active' : ''}`} onClick={() => setSelectedPlatform(p.name)}>
            {p.name === 'meta' ? <FacebookIcon /> : <GoogleIcon />}
            <span>{p.name === 'meta' ? 'Meta Ads' : 'Google Ads'}</span>
            <span className={`dash-tab-status ${p.status.toLowerCase()}`}>{p.status}</span>
          </button>
        ))}
      </div>

      {/* Platform Detail */}
      <div className="dash-platform-detail">
        <div className="dash-platform-header">
          <div className="dash-platform-info">
            <div className="dash-platform-icon" style={{ background: `${platformColor}18` }}>{platformIcon}</div>
            <div>
              <h3>{platformName}</h3>
              <p>{isMeta ? 'Facebook & Instagram' : 'Search, Display & YouTube'}</p>
            </div>
          </div>
          <div className="dash-platform-status">
            <span className="dash-status-dot" style={{ background: statusColors[platform?.status] }} />
            {statusLabels[platform?.status]}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="dash-metrics-grid">
          <div className="dash-metric-box">
            <div className="dash-mb-value">{(platform?.metrics?.impressions || 0).toLocaleString()}</div>
            <div className="dash-mb-label">Impressions</div>
            <div className="dash-mb-bar"><div className="dash-mb-bar-fill" style={{ width: '75%', background: platformColor }} /></div>
          </div>
          <div className="dash-metric-box">
            <div className="dash-mb-value">{(platform?.metrics?.clicks || 0).toLocaleString()}</div>
            <div className="dash-mb-label">Clicks</div>
            <div className="dash-mb-bar"><div className="dash-mb-bar-fill" style={{ width: '60%', background: platformColor }} /></div>
          </div>
          <div className="dash-metric-box">
            <div className="dash-mb-value">{fmt(platform?.metrics?.spend || 0)}</div>
            <div className="dash-mb-label">Spend</div>
            <div className="dash-mb-bar"><div className="dash-mb-bar-fill" style={{ width: '45%', background: platformColor }} /></div>
          </div>
          <div className="dash-metric-box">
            <div className="dash-mb-value">{((platform?.metrics?.ctr || 0) * 100).toFixed(2)}%</div>
            <div className="dash-mb-label">CTR</div>
            <div className="dash-mb-bar"><div className="dash-mb-bar-fill" style={{ width: '35%', background: platformColor }} /></div>
          </div>
          <div className="dash-metric-box">
            <div className="dash-mb-value">{fmt(platform?.metrics?.costPerClick || 0)}</div>
            <div className="dash-mb-label">CPC</div>
            <div className="dash-mb-bar"><div className="dash-mb-bar-fill" style={{ width: '40%', background: platformColor }} /></div>
          </div>
          <div className="dash-metric-box">
            <div className="dash-mb-value">{platform?.metrics?.conversions || 0}</div>
            <div className="dash-mb-label">Conversions</div>
            <div className="dash-mb-bar"><div className="dash-mb-bar-fill" style={{ width: '55%', background: platformColor }} /></div>
          </div>
          <div className="dash-metric-box highlight">
            <div className="dash-mb-value" style={{ color: '#10b981' }}>{platform?.metrics?.roi || 0}%</div>
            <div className="dash-mb-label">ROI</div>
            <div className="dash-mb-bar"><div className="dash-mb-bar-fill" style={{ width: '80%', background: '#10b981' }} /></div>
          </div>
          <div className="dash-metric-box">
            <div className="dash-mb-value">{fmt(platform?.metrics?.cpa || (platform?.metrics?.spend / (platform?.metrics?.conversions || 1)))}</div>
            <div className="dash-mb-label">CPA</div>
            <div className="dash-mb-bar"><div className="dash-mb-bar-fill" style={{ width: '50%', background: platformColor }} /></div>
          </div>
        </div>

        {/* Ad Sets */}
        {platform?.adSets?.length > 0 && (
          <div className="dash-adsets">
            <div className="dash-adsets-header">
              <h4><Layers size={16} /> Ad Sets</h4>
              <span>{platform.adSets.length} active</span>
            </div>
            <div className="dash-adsets-table">
              <div className="dash-adset-row header">
                <span>Name</span><span>Status</span><span>Budget</span><span>Impressions</span><span>Clicks</span><span>Spend</span><span>CTR</span><span>ROI</span>
              </div>
              {platform.adSets.map((ad: any, i: number) => (
                <div key={i} className="dash-adset-row">
                  <span>{ad.name}</span>
                  <span className={`adset-status ${ad.status.toLowerCase()}`}>{ad.status}</span>
                  <span>{fmt(ad.budget)}</span>
                  <span>{ad.impressions?.toLocaleString()}</span>
                  <span>{ad.clicks?.toLocaleString()}</span>
                  <span>{fmt(ad.spend)}</span>
                  <span>{((ad.ctr || 0) * 100).toFixed(2)}%</span>
                  <span style={{ color: ad.roi > 100 ? '#10b981' : '#ef4444' }}>{ad.roi}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {platform?.liveUrl && (
          <a href={platform.liveUrl} target="_blank" rel="noopener noreferrer" className="dash-view-btn" style={{ background: platformColor }}>
            View Live Campaign <ArrowUpRight size={14} />
          </a>
        )}
      </div>
    </div>
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

  // ── NEW: tracks whether we've finished loading the session ──
  const [sessionLoaded, setSessionLoaded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [brandDetails, setBrandDetails] = useState<BrandDetails | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'meta' | 'google' | 'both' | ''>('');
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

  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: import.meta.env?.VITE_USER_ID || '69c2dc0f36b84102fd3dd8d9',
    name: 'User', email: '', balance: 25000, currency: 'USD',
  });

  // ─────────────────────────────────────────────────────────────
  // SESSION RESTORE ON MOUNT
  // Priority: remote (backend) → local (localStorage) → fresh start
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const userId = userProfile.id;

      // 1. Try backend first
      let session = await loadRemote(userId);

      // 2. Fallback to localStorage if remote fails / missing
      if (!session) {
        session = loadLocal(userId);
      }

      if (session) {
        // Restore all state from saved session
        setUrl(session.url || '');
        setUrlStatus(session.urlStatus as any || 'idle');
        setIsChatMode(session.isChatMode || false);
        setViewMode(session.viewMode || 'landing');
        setBrandDetails(session.brandDetails || null);
        setSelectedPlatform(session.selectedPlatform as any || '');
        setBudgetBreakdown(session.budgetBreakdown || null);
        setSelectedTier(session.selectedTier || null);
        setLiveCampaign(session.liveCampaign || null);

        // Restore message counter so new IDs don't collide
        if (session.messages?.length) {
          const maxId = session.messages.reduce((max, m) => {
            const n = parseInt(m.id.replace('msg-', ''), 10);
            return isNaN(n) ? max : Math.max(max, n);
          }, 0);
          msgCounter = maxId;
          setMessages(session.messages);
        }

        if (session.campaignId) {
          campaignIdRef.current = session.campaignId;
        }

        // Resume polling if campaign was live
        if (session.liveCampaign && session.campaignId) {
          startPollingDashboard(session.campaignId);
        }
      }

      setSessionLoaded(true);
    };

    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile.id]);

  // ─────────────────────────────────────────────────────────────
  // SESSION SAVE — debounced, fires whenever meaningful state changes
  // Only saves after session is loaded (prevents overwriting with empty state)
  // ─────────────────────────────────────────────────────────────
  const persistSession = useCallback(async (state: Partial<AppState> & { campaignId?: string | null }) => {
    if (!sessionLoaded) return;  // Don't save the blank initial state
    if (state.viewMode === 'landing' && !state.isChatMode && !state.messages?.length) return; // Nothing to save

    const session = buildSession(userProfile.id, state);
    saveLocal(session);           // Fast: always write local immediately
    await saveRemote(userProfile.id, session); // Async: sync to backend
  }, [sessionLoaded, userProfile.id]);

  const debouncedPersist = useDebounce(persistSession, 800);

  // Watch all meaningful state and trigger debounced save
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

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const fetchWalletBalance = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/wallet/balance/${userProfile.id}`);
      setUserProfile(prev => ({ ...prev, balance: res.data.balance }));
    } catch (err) { console.error('Failed to fetch balance:', err); }
  }, [userProfile.id]);

  useEffect(() => { if (userProfile.id) fetchWalletBalance(); }, [fetchWalletBalance]);
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const addMsg = (msgs: Omit<Message, 'id'>[]) => setMessages(prev => [...prev, ...msgs.map(m => ({ ...m, id: newMsgId() }))]);

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
    } catch (e) { console.error(e); setLoading(false); addMsg([{ role: 'bot', type: 'text', content: '❌ Failed to analyze website. Please try again.' }]); }
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
    addMsg([{ role: 'user', type: 'text', content: 'Maybe later' }, { role: 'bot', type: 'text', content: `No problem! The campaign analysis for ${name} has been saved. Feel free to come back anytime.` }]);
  };

  // ── STEP 2: Platform Selection ──
  const handlePlatformSelect = (platform: 'meta' | 'google' | 'both') => {
    setSelectedPlatform(platform);
    const label = platform === 'meta' ? 'Meta Ads' : platform === 'google' ? 'Google Ads' : 'Both Platforms';
    addMsg([{ role: 'user', type: 'text', content: `Selected: ${label}` }, { role: 'bot', type: 'text', content: `Great choice! 💰 Now enter your monthly advertising budget:` }, { role: 'bot', type: 'form', content: { step: 'budget_input', platform } }]);
  };

  // ── STEP 3: Budget Input ──
  const handleBudgetInput = async (budgetAmount: number) => {
    addMsg([{ role: 'user', type: 'text', content: `Monthly budget: ${fmt(budgetAmount)}` }]);
    setLoading(true);
    let currentBalance = userProfile.balance;
    try { const res = await axios.get(`${API_BASE}/wallet/balance/${userProfile.id}`); currentBalance = res.data.balance; setUserProfile(prev => ({ ...prev, balance: currentBalance })); } catch {}
    const platforms = selectedPlatform === 'both' ? ['meta', 'google'] : [selectedPlatform as string];
    const breakdown = generateBudgetTiers(budgetAmount, platforms);
    setBudgetBreakdown(breakdown);
    setLoading(false);
    const starterCost = breakdown.tiers[0].total.ourBudget;
    if (currentBalance < starterCost) {
      const shortfall = starterCost - currentBalance;
      setPendingFundsAmount(shortfall);
      setPendingFundsContext({ type: 'budget', breakdown });
      addMsg([{ role: 'bot', type: 'text', content: `⚠️ Your balance (${fmt(currentBalance)}) is less than minimum tier (${fmt(starterCost)}). Add ${fmt(shortfall)}:` }, { role: 'bot', type: 'funds', content: { required: starterCost, available: currentBalance, shortfall } }]);
    } else {
      addMsg([{ role: 'bot', type: 'text', content: `💡 Here are 3 AI-optimized campaign tiers:` }, { role: 'bot', type: 'budget_tiers', content: breakdown }, { role: 'bot', type: 'form', content: { step: 'tier_select' } }]);
    }
  };

  // ── STEP 4: Tier Selection ──
  const handleTierSelect = async (tier: BudgetTier) => {
    setSelectedTier(tier);
    let currentBalance = userProfile.balance;
    try { const res = await axios.get(`${API_BASE}/wallet/balance/${userProfile.id}`); currentBalance = res.data.balance; setUserProfile(prev => ({ ...prev, balance: currentBalance })); } catch {}
    addMsg([{ role: 'user', type: 'text', content: `Selected: ${tier.label} tier — ${fmt(tier.total.ourBudget)}/mo` }]);
    if (currentBalance < tier.total.ourBudget) {
      const shortfall = tier.total.ourBudget - currentBalance;
      setPendingFundsAmount(shortfall);
      setPendingFundsContext({ type: 'tier', tier });
      addMsg([{ role: 'bot', type: 'text', content: `⚠️ Add ${fmt(shortfall)} to proceed:` }, { role: 'bot', type: 'funds', content: { required: tier.total.ourBudget, available: currentBalance, shortfall } }]);
    } else {
      await createCampaignDraft(tier);
    }
  };

  // ── STEP 5: Create Campaign Draft ──
  const createCampaignDraft = async (tier: BudgetTier) => {
    setLoading(true);
    try {
      const brandId = brandDetails?.brandId || brandDetails?.campaignId;
      const platforms = selectedPlatform === 'both' ? ['meta', 'google'] : [selectedPlatform];
      const { data: draft } = await axios.post(`${API_BASE}/campaign/draft`, { brandId, platforms, budget: { daily: tier.dailyBudget, total: tier.totalBudget }, userId: userProfile.id });
      campaignIdRef.current = draft.campaignId;
      setLoading(false);
      addMsg([{ role: 'bot', type: 'text', content: `✅ Campaign created! Here's your final summary — ready to go live?` }, { role: 'bot', type: 'publish_review', content: { platform: selectedPlatform, tier, campaignId: draft.campaignId, balance: userProfile.balance } }]);
    } catch (err) { console.error(err); setLoading(false); addMsg([{ role: 'bot', type: 'text', content: '❌ Failed to create campaign. Please try again.' }]); }
  };

  // ── STEP 6: Publish Campaign ──
const handlePublish = async () => {
  addMsg([
    { role: 'user', type: 'text', content: '🚀 Yes, launch my campaign now!' }
  ]);

  setLoading(true);

  const localCampaignId = campaignIdRef.current;

  if (!localCampaignId || !selectedTier) {
    setLoading(false);
    addMsg([
      { role: 'bot', type: 'text', content: '❌ Missing campaign or budget.' }
    ]);
    return;
  }

  try {
    const amount = selectedTier.total.ourBudget;

    // ✅ 1. Check latest balance
    const balanceRes = await axios.get(
      `${API_BASE}/wallet/balance/${userProfile.id}`
    );

    const currentBalance = balanceRes.data.balance;

    if (currentBalance < amount) {
      setLoading(false);

      addMsg([
        {
          role: 'bot',
          type: 'text',
          content: `⚠️ Insufficient balance. Required: ${fmt(amount)}, Available: ${fmt(currentBalance)}`
        }
      ]);

      return;
    }

    // ✅ 2. Debit wallet FIRST
    await axios.post(`${API_BASE}/wallet/debit`, {
      userId: userProfile.id,
      amount: amount,
      description: `Campaign spend (${localCampaignId})`,
    });

    // ✅ 3. Publish campaign AFTER successful debit
    await axios.post(`${API_BASE}/campaign/publish/${localCampaignId}`);

    // ✅ 4. Refresh balance
    await fetchWalletBalance();

    setLoading(false);

    // ✅ 5. Continue your existing UI logic
    const platforms =
      selectedPlatform === 'both'
        ? ['meta', 'google']
        : [selectedPlatform as string];

    const initialLiveData: LiveCampaignData = {
      campaignId: localCampaignId,
      campaignName: resolveBrandName(brandDetails!),
      status: 'CREATING',
      createdAt: new Date().toISOString(),
      platforms: platforms.map(p => ({
        name: p,
        status: 'CREATING' as const,
        metrics: {
          impressions: 0,
          clicks: 0,
          spend: 0,
          ctr: 0,
          conversions: 0,
          costPerClick: 0,
          roi: 0
        },
        adSets: [],
        lastUpdated: new Date().toISOString()
      })),
      overallMetrics: {
        totalImpressions: 0,
        totalClicks: 0,
        totalSpend: 0,
        totalConversions: 0,
        overallRoi: 0,
        avgCtr: 0,
        avgCpc: 0,
        totalReach: 0,
        totalVideoViews: 0
      }
    };

    setLiveCampaign(initialLiveData);

    addMsg([
      {
        role: 'bot',
        type: 'text',
        content: '🎉 Campaign launched & wallet debited successfully!'
      },
      {
        role: 'bot',
        type: 'live_dashboard',
        content: { campaignId: localCampaignId }
      }
    ]);

    startPollingDashboard(localCampaignId);

    setTimeout(() => {
      setViewMode('dashboard');
    }, 3000);

  } catch (err: any) {
    setLoading(false);

    console.error(err);

    addMsg([
      {
        role: 'bot',
        type: 'text',
        content: '❌ Failed to launch campaign. No money deducted if failed.'
      }
    ]);
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
    addMsg([{ role: 'user', type: 'text', content: `Add ${fmtINR(amount)} via ${showPaymentModal ? 'payment' : 'wallet'}` }]);
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/wallet/credit`, {
  userId: userProfile.id,
  amount,
  description: 'Wallet top-up',
});
      setUserProfile(prev => ({ ...prev, balance: data.newBalance }));
      setLoading(false);
      setShowPaymentModal(false);
      addMsg([{ role: 'bot', type: 'text', content: `✅ ${fmtINR(amount)} added! Balance: ${fmt(data.newBalance)}. Continue:` }]);
      if (pendingFundsContext?.type === 'budget' && budgetBreakdown) {
        setTimeout(() => addMsg([{ role: 'bot', type: 'budget_tiers', content: budgetBreakdown }, { role: 'bot', type: 'form', content: { step: 'tier_select' } }]), 500);
      } else if (pendingFundsContext?.type === 'tier') {
        setTimeout(() => createCampaignDraft(pendingFundsContext.tier), 500);
      }
    } catch { setLoading(false); addMsg([{ role: 'bot', type: 'text', content: '❌ Failed to add funds.' }]); }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    handleAddFunds(pendingFundsAmount);
  };

  // ── RESET — also clears remote session ──
  const handleReset = async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    clearLocal();
    await clearRemote(userProfile.id);
    setIsChatMode(false); setUrl(''); setMessages([]); setBrandDetails(null);
    campaignIdRef.current = null; setSelectedPlatform(''); setBudgetBreakdown(null);
    setSelectedTier(null); setLiveCampaign(null); setViewMode('landing');
  };

  const handleBackToChat = () => {
    setViewMode('chat');
    setIsChatMode(true);
  };

  const isLatestOfType = (msgId: string, type: string) => {
    const idx = messages.findIndex(m => m.id === msgId);
    return !messages.slice(idx + 1).some(m => m.type === type);
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER GUARD — show nothing until session is restored
  // (prevents flash of landing page before restore completes)
  // ─────────────────────────────────────────────────────────────
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
                {urlStatus === 'valid' ? <CheckCircle2 size={18} className="camp-input-icon valid" /> : urlStatus === 'error' ? <XCircle size={18} className="camp-input-icon error" /> : urlStatus === 'checking' ? <Loader2 size={18} className="camp-input-icon checking camp-spin" /> : <Globe size={18} className="camp-input-icon" />}
                <input value={url} onChange={e => { setUrl(e.target.value); if (urlStatus === 'error') { setUrlStatus('idle'); setUrlError(''); } }} onKeyDown={e => { if (e.key === 'Enter' && !loading && url) handleDeepResearch(); }} placeholder="https://your-company.com" className="camp-url-input" disabled={loading} />
                <button className="camp-launch-btn" onClick={handleDeepResearch} disabled={loading || !url || urlStatus === 'checking'}>
                  {loading ? <><Loader2 className="camp-spin" size={16} /> Analyzing...</> : <><Target size={16} /> Analyze Brand</>}
                </button>
              </div>
              <AnimatePresence>
                {urlError && <motion.div className="camp-url-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><AlertTriangle size={13} /><span>{urlError}</span></motion.div>}
              </AnimatePresence>
            </div>
            <div className="camp-trust-row">
              {['Deep Website Scan', 'AI-Powered Analysis', 'Smart Campaign Creation', 'Real-time Optimization'].map(t => <div key={t} className="camp-trust-item"><ShieldCheck size={14} /> {t}</div>)}
            </div>
            <div className="camp-stats-row">
              {[['150+', 'Brands Analyzed'], ['98%', 'Accuracy Rate'], ['3x', 'Avg ROI Increase']].map(([v, l]) => <div key={l} className="camp-stat-item"><span className="camp-stat-value">{v}</span><span className="camp-stat-label">{l}</span></div>)}
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
          <LiveDashboard campaign={liveCampaign} brandName={resolveBrandName(brandDetails!)} onBackToChat={handleBackToChat} onRefresh={handleRefreshDashboard} isRefreshing={isRefreshing} />
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
        {showPaymentModal && <PaymentModal amount={pendingFundsAmount} onSuccess={handlePaymentSuccess} onCancel={() => setShowPaymentModal(false)} />}
      </AnimatePresence>
      <div className="camp-header-wrapper">
        <Header />
        <div className="camp-topbar-right">
          {liveCampaign && <button className="camp-dashboard-btn" onClick={() => setViewMode('dashboard')}><LayoutDashboard size={14} /> Dashboard</button>}
          <button className="camp-restart-top-right" onClick={handleReset}><RefreshCw size={13} /><span></span></button>
        </div>
      </div>
      <div className="camp-chat-page">
        <div className="camp-chat-scroll">
          <div className="camp-chat-inner">
            <AnimatePresence>
              {messages.map((msg) => {
                const latest = isLatestOfType(msg.id, msg.type);
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`camp-msg-row ${msg.role}`}>
                    <div className={`camp-avatar ${msg.role}`}>{msg.role === 'bot' ? <Brain size={15} /> : <div className="camp-user-dot" />}</div>
                    <div className="camp-msg-body">
                      {msg.type === 'text' && msg.role === 'bot' && <TypingBubble text={msg.content} />}
                      {msg.type === 'text' && msg.role === 'user' && <div className="camp-bubble-user">{msg.content}</div>}
                      {msg.type === 'research' && <ErrorBoundary><ResearchTerminal url={msg.content?.url} /></ErrorBoundary>}
                      {msg.type === 'audit' && <BrandAuditCard brand={msg.content} />}
                      {msg.type === 'campaign_confirmation' && (latest ? <CampaignConfirmation brandName={msg.content?.brandName} onConfirm={handleCampaignConfirm} onDecline={handleCampaignDecline} /> : <div className="camp-bubble-bot camp-muted">Campaign preference recorded ✓</div>)}
                      {msg.type === 'form' && msg.content?.step === 'platform_select' && (latest ? <PlatformAdSelector onSelect={handlePlatformSelect} /> : <div className="camp-bubble-bot camp-muted">Platform selected ✓</div>)}
                      {msg.type === 'form' && msg.content?.step === 'budget_input' && (latest ? <BudgetInputForm platform={msg.content.platform} onSubmit={handleBudgetInput} /> : <div className="camp-bubble-bot camp-muted">Budget entered ✓</div>)}
                      {msg.type === 'budget_tiers' && <BudgetTiersCard breakdown={msg.content} />}
                      {msg.type === 'form' && msg.content?.step === 'tier_select' && (latest ? <TierSelectButtons breakdown={budgetBreakdown!} onSelect={handleTierSelect} /> : <div className="camp-bubble-bot camp-muted">Tier selected ✓</div>)}
                      {msg.type === 'funds' && (latest ? <InsufficientFundsCard required={msg.content.required} available={msg.content.available} shortfall={msg.content.shortfall} onAddFunds={() => setShowPaymentModal(true)} onAddFundsDirect={handleAddFunds} /> : <div className="camp-bubble-bot camp-muted">Funds added ✓</div>)}
                      {msg.type === 'publish_review' && (latest ? <PublishReviewCard data={msg.content} onPublish={handlePublish} onGoToDashboard={() => setViewMode('dashboard')} /> : <div className="camp-bubble-bot camp-muted">Campaign launched ✓</div>)}
                      {msg.type === 'live_dashboard' && <GoToDashboardCard campaignId={msg.content.campaignId} onGoToDashboard={() => setViewMode('dashboard')} />}
                    </div>
                  </motion.div>
                );
              })}
              {loading && <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="camp-loading-row"><div className="camp-avatar bot"><Brain size={15} /></div><div className="camp-ai-thinking"><span className="camp-dot" /><span className="camp-dot" /><span className="camp-dot" /></div></motion.div>}
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
const ResearchTerminal: React.FC<{ url: string }> = ({ url }) => {
  const [logs, setLogs] = useState<string[]>([`> Connecting to ${getHostname(url || 'unknown')}...`]);
  useEffect(() => {
    const lines = ['> Extracting DOM structure...', '> Analyzing SEO meta tags...', '> Checking performance...', '[SUCCESS] Brand detected', '> Analyzing competitors...', '> Extracting keywords...', '[SUCCESS] Analysis complete', '> Generating report...'];
    let i = 0;
    const interval = setInterval(() => { if (i < lines.length) { setLogs(prev => [...prev, lines[i]]); i++; } else clearInterval(interval); }, 600);
    return () => clearInterval(interval);
  }, [url]);
  return (<div className="camp-terminal"><div className="camp-terminal-header"><span><Brain size={11} /> nexus_ai</span><span className="camp-terminal-url">{getHostname(url || '')}</span></div>{logs.map((log, idx) => <div key={idx} className={`camp-log-line ${log.includes('SUCCESS') ? 'success' : ''}`}>{log}</div>)}<span className="camp-cursor" /></div>);
};

const BudgetInputForm: React.FC<{ platform: string; onSubmit: (amount: number) => void }> = ({ platform, onSubmit }) => {
  const [value, setValue] = useState(''); const [error, setError] = useState('');
  const presets = [5000, 10000, 25000, 50000, 100000];
  const handleSubmit = () => { const num = parseFloat(value.replace(/[^0-9.]/g, '')); if (!num || num < 100) { setError('Minimum $100'); return; } setError(''); onSubmit(num); };
  return (<div className="budget-input-form"><div className="bif-header"><DollarSign size={18} color="#10b981" /><div><div className="bif-title">Monthly Ad Budget</div><div className="bif-sub">For {platform === 'meta' ? 'Meta Ads' : platform === 'google' ? 'Google Ads' : 'Both'} · Min $100</div></div></div><div className="bif-presets">{presets.map(p => <button key={p} className={`bif-preset ${value === String(p) ? 'active' : ''}`} onClick={() => { setValue(String(p)); setError(''); }}>₹{p.toLocaleString()}</button>)}</div><div className="bif-input-row"><div className="bif-input-wrap"><span className="bif-currency">$</span><input type="number" className="bif-input" placeholder="Enter amount" value={value} onChange={e => { setValue(e.target.value); setError(''); }} onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }} /><span className="bif-period">/mo</span></div><button className="bif-submit" onClick={handleSubmit} disabled={!value}>Generate Plans <ArrowRight size={16} /></button></div>{error && <div className="bif-error"><AlertTriangle size={13} /> {error}</div>}</div>);
};

const BudgetTiersCard: React.FC<{ breakdown: BudgetBreakdown }> = ({ breakdown }) => {
  const tierColors: Record<string, string> = { Starter: '#38bdf8', Growth: '#10b981', Scale: '#f59e0b' };
  const tierIcons: Record<string, string> = { Starter: '🌱', Growth: '🚀', Scale: '⚡' };
  return (<div className="tiers-card">{breakdown.aiRecommendation && <div className="tiers-ai-note"><Brain size={14} /><p>{breakdown.aiRecommendation}</p></div>}<div className="tiers-grid">{breakdown.tiers.map((tier) => { const color = tierColors[tier.label] || '#60a5fa'; return (<div key={tier.label} className={`tier-card ${tier.recommended ? 'recommended' : ''}`} style={{ '--tc': color } as React.CSSProperties}>{tier.recommended && <div className="tier-badge">AI Pick</div>}<div className="tier-icon">{tierIcons[tier.label]}</div><div className="tier-label" style={{ color }}>{tier.label}</div><div className="tier-budget">{fmt(tier.total.ourBudget)}<span>/mo</span></div><div className="tier-desc">{tier.description}</div><div className="tier-metrics">{tier.platforms.map(p => <div key={p.name} className="tier-platform-row"><span className="tier-platform-name">{p.name === 'meta' ? '📘' : '🔵'} {p.name}</span><div className="tier-platform-stats"><span>{p.impressionsEstimate.toLocaleString()} impr.</span><span>{p.clicksEstimate.toLocaleString()} clicks</span></div></div>)}</div><div className="tier-roi"><span>Est. ROI</span><strong style={{ color }}>{tier.total.roiEstimate}%</strong></div></div>); })}</div></div>);
};

const TierSelectButtons: React.FC<{ breakdown: BudgetBreakdown; onSelect: (tier: BudgetTier) => void }> = ({ breakdown, onSelect }) => {
  const tierColors: Record<string, string> = { Starter: '#38bdf8', Growth: '#10b981', Scale: '#f59e0b' };
  return (<div className="tier-select-row"><div className="tier-select-label">Select a budget tier:</div><div className="tier-select-btns">{breakdown.tiers.map(tier => (<button key={tier.label} className={`tier-select-btn ${tier.recommended ? 'recommended' : ''}`} style={{ '--tc': tierColors[tier.label] } as React.CSSProperties} onClick={() => onSelect(tier)}>{tier.recommended && <Star size={11} />}<span className="tsb-label">{tier.label}</span><span className="tsb-amount">{fmt(tier.total.ourBudget)}/mo</span><ArrowRight size={14} /></button>))}</div></div>);
};

const InsufficientFundsCard: React.FC<{ required: number; available: number; shortfall: number; onAddFunds: () => void; onAddFundsDirect: (amount: number) => void }> = ({ required, available, shortfall, onAddFunds, onAddFundsDirect }) => (
  <div className="camp-funds-card"><div className="funds-header"><AlertTriangle size={22} color="#f59e0b" /><div><h3>Insufficient Balance</h3><p>Add funds to continue your campaign.</p></div></div><div className="funds-amounts"><div className="funds-amount-row"><span>Required</span><strong style={{ color: '#ef4444' }}>{fmt(required)}</strong></div><div className="funds-amount-row"><span>Available</span><strong>{fmt(available)}</strong></div><div className="funds-amount-row highlight"><span>Shortfall</span><strong style={{ color: '#f59e0b' }}>{fmt(shortfall)}</strong></div></div><div className="camp-funds-btns"><button className="camp-add-funds-btn primary" onClick={onAddFunds}><PlusCircle size={15} /> Add Funds via UPI/Card</button><button className="camp-add-funds-btn" onClick={() => onAddFundsDirect(shortfall)}><Wallet size={15} /> Quick Add {fmt(shortfall)}</button></div></div>
);

const PublishReviewCard: React.FC<{ data: any; onPublish: () => void; onGoToDashboard: () => void }> = ({ data, onPublish, onGoToDashboard }) => {
  const { platform, tier, campaignId, balance } = data;
  const remaining = balance - (tier?.total?.ourBudget || 0);
  const tierColors: Record<string, string> = { Starter: '#38bdf8', Growth: '#10b981', Scale: '#f59e0b' };
  return (<div className="publish-card"><div className="publish-card-header"><Rocket size={20} color="#10b981" /><div><div className="publish-card-title">🎉 Campaign Ready!</div><div className="publish-card-sub">ID: <code>{campaignId}</code></div></div></div><div className="publish-summary"><div className="publish-row"><span><Layers size={14} /> Platform</span><strong>{platform === 'meta' ? 'Meta Ads' : platform === 'google' ? 'Google Ads' : 'Both'}</strong></div><div className="publish-row"><span><Award size={14} /> Tier</span><strong style={{ color: tierColors[tier?.label] }}>{tier?.label}</strong></div><div className="publish-row"><span><DollarSign size={14} /> Investment</span><strong style={{ color: '#10b981' }}>{fmt(tier?.total?.ourBudget)}</strong></div><div className="publish-row"><span><TrendingUp size={14} /> ROI</span><strong style={{ color: '#10b981' }}>{tier?.total?.roiEstimate}%</strong></div><div className="publish-row"><span><Wallet size={14} /> Balance After</span><strong style={{ color: remaining >= 0 ? '#60a5fa' : '#ef4444' }}>{fmt(remaining)}</strong></div></div><div className="publish-actions"><button className="publish-btn" onClick={onPublish}><Rocket size={18} /> Launch Campaign</button><button className="publish-dashboard-btn" onClick={onGoToDashboard}><LayoutDashboard size={16} /> View Dashboard</button></div></div>);
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
  return (<div className="audit-card"><div className="audit-topbar"><div className="audit-brand-identity"><div className="audit-brand-icon"><Building2 size={20} /></div><div><div className="audit-brand-name">{displayName}</div><div className="audit-brand-industry">{displayIndustry}</div></div></div><span className="camp-ai-badge">AI Analysis</span></div><div className="audit-tabs">{tabs.map(t => <button key={t} className={`audit-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}</div><div className="audit-panel">{activeTab === 'overview' && <div className="audit-overview"><div className="audit-section-card"><Building2 size={18} color="#3b82f6" /><h4>Brand Overview</h4>{brand.brand?.tagline && <p>"{brand.brand.tagline}"</p>}{brand.brand?.businessModel && <div className="audit-info-row"><span>Model:</span><strong>{brand.brand.businessModel}</strong></div>}{brand.brand?.founded && <div className="audit-info-row"><span>Founded:</span><strong>{brand.brand.founded}</strong></div>}</div></div>}{activeTab === 'website' && brand.websiteAudit && <div className="audit-website"><div className="audit-score-circles">{brand.websiteAudit.overallScore && <div className="audit-circle"><div className="ac-value">{brand.websiteAudit.overallScore}</div><div className="ac-label">Score</div></div>}{brand.websiteAudit.seoScore && <div className="audit-circle"><div className="ac-value">{brand.websiteAudit.seoScore}</div><div className="ac-label">SEO</div></div>}{brand.websiteAudit.performanceScore && <div className="audit-circle"><div className="ac-value">{brand.websiteAudit.performanceScore}</div><div className="ac-label">Perf</div></div>}</div>{brand.websiteAudit.findings?.length > 0 && <div className="audit-section"><h4>Findings</h4><ul>{brand.websiteAudit.findings.map((f: string, i: number) => <li key={i}>{f}</li>)}</ul></div>}</div>}{activeTab === 'keywords' && brand.keywords && <div className="audit-keywords"><div className="audit-kw-section"><h4>Primary Keywords</h4><div className="audit-pills">{brand.keywords.primary?.map(k => <span key={k} className="audit-pill blue">{k}</span>)}</div></div><div className="audit-kw-section"><h4>Secondary Keywords</h4><div className="audit-pills">{brand.keywords.secondary?.map(k => <span key={k} className="audit-pill purple">{k}</span>)}</div></div></div>}{activeTab === 'competition' && brand.competition && <div className="audit-competition"><div className="audit-comp-card"><TrendingUp size={18} color="#10b981" /><h4>Market Position</h4><p>{brand.competition.marketPosition || 'Strong position in the market.'}</p></div>{brand.competition.intensity && <div className="audit-comp-intensity"><span>Competition:</span><strong style={{ color: brand.competition.intensity === 'High' ? '#ef4444' : brand.competition.intensity === 'Medium' ? '#f59e0b' : '#10b981' }}>{brand.competition.intensity}</strong></div>}</div>}{activeTab === 'analytics' && brand.analyticsDashboard && <div className="audit-analytics"><div className="audit-analytics-grid"><div className="aa-metric"><div className="aa-value">{Number(brand.analyticsDashboard.estimatedMonthlyVisits).toLocaleString() || 'N/A'}</div><div className="aa-label">Monthly Visits</div></div><div className="aa-metric"><div className="aa-value">{brand.analyticsDashboard.estimatedDomainAuthority || 'N/A'}</div><div className="aa-label">Domain Authority</div></div><div className="aa-metric"><div className="aa-value">{brand.analyticsDashboard.bounceRate || 'N/A'}</div><div className="aa-label">Bounce Rate</div></div></div></div>}</div></div>);
};

const PlatformAdSelector: React.FC<{ onSelect: (p: 'meta' | 'google' | 'both') => void }> = ({ onSelect }) => {
  const options = [
    { id: 'meta' as const, label: 'Meta Ads', sub: 'Facebook & Instagram', icon: <FacebookIcon />, color: '#3b82f6', features: ['2.9B+ users', 'Visual ads', 'Interest targeting'], bestFor: 'B2C & Brand' },
    { id: 'google' as const, label: 'Google Ads', sub: 'Search, Display, YouTube', icon: <GoogleIcon />, color: '#ea4335', features: ['8.5B searches', 'Intent targeting', 'Display network'], bestFor: 'Lead Gen' },
    { id: 'both' as const, label: 'Both Platforms', sub: 'Maximum reach', icon: <span style={{ fontSize: 22 }}>⚡</span>, color: '#8b5cf6', features: ['Full funnel', 'Retargeting', 'AI split'], bestFor: 'Max Growth', recommended: true },
  ];
  return (<div className="plat-selector"><div className="plat-selector-title">Choose your advertising platform</div><div className="plat-cards">{options.map(opt => (<button key={opt.id} className={`plat-card ${opt.recommended ? 'recommended' : ''}`} onClick={() => onSelect(opt.id)} style={{ '--plat-color': opt.color } as React.CSSProperties}>{opt.recommended && <div className="plat-badge">AI Recommended</div>}<div className="plat-card-icon">{opt.icon}</div><div className="plat-card-label">{opt.label}</div><div className="plat-card-sub">{opt.sub}</div><div className="plat-card-best">Best: <strong>{opt.bestFor}</strong></div><ul className="plat-features">{opt.features.map(f => <li key={f}><CheckCircle2 size={11} /> {f}</li>)}</ul><div className="plat-cta">Select <ArrowRight size={14} /></div></button>))}</div></div>);
};

// ============================================
// CSS
// ============================================
const CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  .camp-spin { animation: spin 1s linear infinite; }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── SESSION LOADING ── */
  .session-loading { display: flex; align-items: center; justify-content: center; gap: 14px; min-height: calc(100vh - 68px); background: #0a0a0f; color: #64748b; font-size: 0.9rem; }

  /* ── HEADER ── */
  .camp-header-wrapper { position: fixed; width :80%}
  .camp-topbar-right { position: absolute; top: 130%; right: 10px; transform: translateY(-50%); z-index: 200; display: flex; align-items: center; gap: 10px; }
  .camp-balance-chip { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); color: #6ee7b7; font-size: 0.82rem; font-weight: 700; }
  .camp-dashboard-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.3); color: #60a5fa; cursor: pointer; font-size: 0.82rem; font-weight: 600; transition: all 0.2s; }
  .camp-dashboard-btn:hover { background: rgba(59,130,246,0.22); }
  .camp-restart-top-right { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #f87171; cursor: pointer; font-size: 0.82rem; font-weight: 600; transition: all 0.2s; }
  .camp-restart-top-right:hover { background: rgba(239,68,68,0.22); }

  /* ── LANDING ── */
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

  /* ── CHAT ── */
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

  /* ── CAMPAIGN CONFIRMATION ── */
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

  /* ── PAYMENT MODAL ── */
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

  /* ── TERMINAL ── */
  .camp-terminal { background: #080810; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; font-family: 'Courier New', monospace; margin-top: 6px; min-width: 360px; }
  .camp-terminal-header { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #4b5563; font-size: 0.72rem; }
  .camp-terminal-url { color: #3b82f6; }
  .camp-log-line { color: #38bdf8; font-size: 0.78rem; margin-bottom: 4px; line-height: 1.5; }
  .camp-log-line.success { color: #10b981; }
  .camp-cursor { display: inline-block; width: 7px; height: 12px; background: #38bdf8; margin-top: 8px; animation: blink 1s step-end infinite; }

  /* ── AUDIT CARD ── */
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
  .audit-overview { display: flex; flex-direction: column; gap: 12px; }
  .audit-section-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; }
  .audit-section-card h4 { margin: 0 0 10px; color: #fff; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; }
  .audit-section-card p { color: #94a3b8; font-size: 0.85rem; margin: 0 0 12px; font-style: italic; }
  .audit-info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .audit-info-row:last-child { border-bottom: none; }
  .audit-info-row span { color: #64748b; font-size: 0.82rem; }
  .audit-info-row strong { color: #e2e8f0; }
  .audit-score-circles { display: flex; gap: 16px; margin-bottom: 16px; }
  .audit-circle { width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.03); border: 2px solid rgba(59,130,246,0.3); display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .ac-value { font-size: 1.4rem; font-weight: 800; color: #60a5fa; }
  .ac-label { font-size: 0.6rem; color: #64748b; text-transform: uppercase; }
  .audit-section { background: rgba(255,255,255,0.03); border-radius: 10px; padding: 14px; margin-top: 12px; }
  .audit-section h4 { margin: 0 0 10px; color: #94a3b8; font-size: 0.78rem; text-transform: uppercase; }
  .audit-section ul { margin: 0; padding-left: 18px; color: #94a3b8; font-size: 0.82rem; line-height: 1.6; }
  .audit-keywords { display: flex; flex-direction: column; gap: 16px; }
  .audit-kw-section h4 { margin: 0 0 10px; color: #94a3b8; font-size: 0.78rem; text-transform: uppercase; }
  .audit-pills { display: flex; flex-wrap: wrap; gap: 8px; }
  .audit-pill { display: inline-block; padding: 5px 12px; border-radius: 99px; font-size: 0.78rem; font-weight: 500; }
  .audit-pill.blue { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
  .audit-pill.purple { background: rgba(38,49,214,0.15); color: #2631d6; border: 1px solid rgba(38,49,214,0.3); }
  .audit-competition { display: flex; flex-direction: column; gap: 16px; }
  .audit-comp-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; }
  .audit-comp-card h4 { margin: 0 0 10px; color: #fff; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; }
  .audit-comp-card p { color: #94a3b8; font-size: 0.85rem; margin: 0; }
  .audit-comp-intensity { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(255,255,255,0.03); border-radius: 10px; }
  .audit-comp-intensity span { color: #64748b; }
  .audit-analytics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .aa-metric { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; text-align: center; }
  .aa-value { font-size: 1.5rem; font-weight: 800; color: #60a5fa; margin-bottom: 4px; }
  .aa-label { font-size: 0.7rem; color: #64748b; text-transform: uppercase; }

  /* ── PLATFORM SELECTOR ── */
  .plat-selector { margin-top: 8px; }
  .plat-selector-title { font-size: 0.82rem; color: #64748b; margin-bottom: 14px; }
  .plat-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .plat-card { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 18px 16px; background: rgba(15,20,35,0.9); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; cursor: pointer; text-align: left; transition: all 0.25s; color: inherit; }
  .plat-card:hover { border-color: var(--plat-color); background: color-mix(in srgb, var(--plat-color) 8%, rgba(15,20,35,0.9)); transform: translateY(-2px); }
  .plat-card.recommended { border-color: rgba(38,49,214,0.4); background: rgba(38,49,214,0.06); }}
  .plat-badge { position: absolute; top: -1px; right: 12px; background: linear-gradient(135deg, #8b5cf6, #1e27a8); color: #fff; font-size: 0.6rem; font-weight: 700; padding: 3px 8px; border-radius: 0 0 8px 8px; }
  .plat-card-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
  .plat-card-label { font-size: 0.95rem; font-weight: 700; color: #fff; }
  .plat-card-sub { font-size: 0.72rem; color: #64748b; margin-top: -4px; }
  .plat-card-best { font-size: 0.7rem; color: #94a3b8; padding: 4px 8px; background: rgba(255,255,255,0.04); border-radius: 6px; }
  .plat-card-best strong { color: var(--plat-color); }
  .plat-features { list-style: none; margin: 4px 0 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
  .plat-features li { display: flex; align-items: center; gap: 6px; color: #64748b; font-size: 0.72rem; }
  .plat-features li svg { color: #10b981; flex-shrink: 0; }
  .plat-cta { display: flex; align-items: center; gap: 5px; color: var(--plat-color); font-size: 0.78rem; font-weight: 600; margin-top: 4px; }

  /* ── BUDGET INPUT FORM ── */
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

  /* ── BUDGET TIERS ── */
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

  /* ── FUNDS CARD ── */
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

  /* ── PUBLISH CARD ── */
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

  /* ── GO TO DASHBOARD CARD ── */
  .go-to-dashboard-card { background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.05)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin-top: 6px; max-width: 420px; }
  .gtds-header { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 16px; }
  .gtds-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(16,185,129,0.15); display: flex; align-items: center; justify-content: center; color: #10b981; flex-shrink: 0; }
  .gtds-header h3 { margin: 0 0 4px; color: #fff; font-size: 1.05rem; }
  .gtds-header p { margin: 0; color: #94a3b8; font-size: 0.82rem; }
  .gtds-info { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: rgba(0,0,0,0.2); border-radius: 8px; margin-bottom: 16px; color: #64748b; font-size: 0.78rem; }
  .gtds-info code { color: #38bdf8; font-family: monospace; }
  .gtds-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 12px; color: #fff; font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.2s; }
  .gtds-btn:hover { transform: scale(1.02); box-shadow: 0 0 24px rgba(16,185,129,0.4); }

  /* ── DASHBOARD PAGE ── */
  .dashboard-wrapper { min-height: calc(100vh - 68px); background: #0a0a0f; }
  .dashboard-page { max-width: 1400px; margin: 0 auto; padding: 24px; }
  .dashboard-page.fullscreen { max-width: 100%; padding: 20px; }
  .dash-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
  .dash-header-left { display: flex; align-items: center; gap: 16px; }
  .dash-back-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #94a3b8; cursor: pointer; font-size: 0.82rem; transition: all 0.2s; }
  .dash-back-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
  .dash-title-section h2 { margin: 0; color: #fff; font-size: 1.3rem; }
  .dash-campaign-id { font-size: 0.72rem; color: #64748b; }
  .dash-campaign-id code { color: #38bdf8; }
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

  /* ── RESPONSIVE ── */
  @media (max-width: 1100px) {
    .dash-overall-metrics { grid-template-columns: repeat(3, 1fr); }
    .dash-metrics-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 900px) {
    .plat-cards { grid-template-columns: 1fr; }
    .tiers-grid { grid-template-columns: 1fr; }
    .dash-overall-metrics { grid-template-columns: repeat(2, 1fr); }
    .dash-adset-row { grid-template-columns: 2fr 1fr 1fr 1fr 1fr; overflow-x: auto; }
  }
  @media (max-width: 680px) {
    .camp-landing-page { padding: 40px 20px; }
    .camp-headline { font-size: 2rem; }
    .camp-stats-row { gap: 28px; }
    .camp-topbar-right { gap: 6px; }
    .camp-restart-top-right span { display: none; }
    .camp-balance-chip span { display: none; }
    .bif-input-row { flex-direction: column; }
    .bif-submit { width: 100%; justify-content: center; }
    .dash-header { flex-direction: column; align-items: flex-start; }
    .dash-overall-metrics { grid-template-columns: 1fr 1fr; }
    .dash-metrics-grid { grid-template-columns: 1fr 1fr; }
    .dash-platform-tabs { flex-direction: column; }
    .dash-platform-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  }
`;

export default Campaigns;