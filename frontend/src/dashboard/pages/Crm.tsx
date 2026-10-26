import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { SmartTable } from '../components/SmartTable';
import {
  Users, RefreshCw, Database, Megaphone, Share2, Sparkles,
  Bot, Search, Star, Gem, Briefcase, ArrowUpRight,
  CheckCircle2, Layers, ExternalLink, Activity,
  TrendingUp, BarChart3, ShieldCheck, MessageSquare, PhoneCall
} from 'lucide-react';
import { AdInsights } from './AdInsights';
import { AiAnalysis } from './AiAnalysis';
import { PageLoader } from '../components/Loader';

const dateRanges = ['Last 7 days', 'Last 14 days', 'Last 30 days', 'Last 90 days', 'Today'];

type DashboardTab = 'overview' | 'ads' | 'social' | 'ai-bots' | 'seo-rep' | 'insights' | 'ai';

const ChartLine: React.FC<{ data: number[]; color: string; height: number; width: number }> = ({ data, color, height, width }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data) || 1;
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 20) - 10;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

// ── Dark token palette (matches landing page) ──────────────────
const D = {
  bg: '#0a0f1e',          // deepest background
  surface: '#0f1629',          // card surfaces
  surfaceAlt: '#141d35',          // slightly lighter card
  border: 'rgba(99,102,241,0.18)',
  borderGlow: 'rgba(112,51,245,0.35)',
  purple: '#0665ff',
  purpleSoft: 'rgba(124,58,237,0.15)',
  purpleText: '#a78bfa',
  green: '#10b981',
  greenSoft: 'rgba(16,185,129,0.15)',
  greenText: '#34d399',
  textPrimary: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  white005: 'rgba(255,255,255,0.05)',
  white010: 'rgba(255,255,255,0.08)',
  inputBg: 'rgba(255,255,255,0.04)',
};

const getCurrencySymbol = (currency: string) => {
  switch (currency?.toUpperCase()) {
    case 'INR': return '₹';
    case 'USD': return '$';
    case 'GBP': return '£';
    case 'EUR': return '€';
    case 'CAD': return '$';
    case 'AUD': return '$';
    case 'AED': return 'د.إ';
    default: return '₹';
  }
};

export const Crm: React.FC = () => {
  const navigate = useNavigate();
  const [activeRange, setActiveRange] = useState('Last 7 days');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [audiences, setAudiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  // const [rechargeAmount, setRechargeAmount] = useState(500);
  // const [walletBalance, setWalletBalance] = useState(0);
  const { user } = useSelector((state: any) => state.auth);
  const cur = getCurrencySymbol(user?.currency || 'INR');
  const [kpis, setKpis] = useState([
    { label: 'Spend', value: `${cur}0.00`, color: D.purple, checked: true, key: 'spend' },
    { label: 'CPM', value: `${cur}0.00`, color: D.textDim, checked: false, key: 'cpm' },
    { label: 'CPC', value: `${cur}0.00`, color: D.textDim, checked: false, key: 'cpc' },
    { label: 'CTR', value: '0.00%', color: D.textDim, checked: false, key: 'ctr' },
    { label: 'ROAS', value: '0.00', color: D.green, checked: true, key: 'roas' },
    { label: 'Purchase Value', value: `${cur}0.00`, color: D.textDim, checked: false, key: 'purchaseValue' },
  ]);

  const fetchData = useCallback(async () => {
    try {
      const { api } = await import('../../api/axios');
      const [resAnal, resAud] = await Promise.all([
        api.get(`/analytics/dashboard?dateRange=${encodeURIComponent(activeRange)}`),
        api.get('/crm/audiences'),
      ]);
      setAnalyticsData(resAnal.data);
      setAudiences(resAud.data);
      const summary = resAnal.data.summary;
      setKpis(prev => prev.map(k => {
        const rawValue = summary?.[k.key];
        if (rawValue === undefined || rawValue === null)
          return { ...k, value: k.key === 'ctr' ? '0%' : k.key === 'roas' ? '0.00' : `${cur}0.00` };
        const formattedValue = (k.key === 'ctr' || k.key === 'roas')
          ? (typeof rawValue === 'string' ? rawValue : Number(rawValue).toFixed(2)) + (k.key === 'ctr' ? '%' : '')
          : `${cur}${parseFloat(String(rawValue)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        return { ...k, value: formattedValue };
      }));
      setLoading(false);
    } catch (error) {
      console.error('CRM Fetch Failed', error);
      setLoading(false);
    }
  }, [activeRange]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const googleConnected = url.searchParams.get('googleConnected');
      const metaConnected = url.searchParams.get('metaConnected');
      const xConnected = url.searchParams.get('xConnected');
      const linkedinConnected = url.searchParams.get('linkedinConnected');

      if (googleConnected === 'success') toast.success('Google Ads connected successfully');
      if (googleConnected === 'error') toast.error('Failed to connect Google Ads');
      if (metaConnected === 'success') toast.success('Meta Ads connected successfully');
      if (metaConnected === 'error') toast.error('Failed to connect Meta Ads');
      if (xConnected === 'success') toast.success('X Ads connected successfully');
      if (xConnected === 'error') toast.error('Failed to connect X Ads');
      if (linkedinConnected === 'success') toast.success('LinkedIn account connected successfully');
      if (linkedinConnected === 'error') toast.error('Failed to connect LinkedIn');

      let changed = false;
      if (googleConnected) { url.searchParams.delete('googleConnected'); changed = true; }
      if (metaConnected) { url.searchParams.delete('metaConnected'); changed = true; }
      if (xConnected) { url.searchParams.delete('xConnected'); changed = true; }
      if (linkedinConnected) { url.searchParams.delete('linkedinConnected'); changed = true; }

      if (changed) {
        window.history.replaceState({}, '', url.toString());
      }
    } catch { }

    // import('../../api/axios').then(({ api }) => {
    //   api.get('/billing/wallet').then(res => {
    //     setWalletBalance(res.data?.balance ?? 0);
    //   }).catch(() => {});
    // });
  }, []);


  // const handleRazorpayRecharge = async () => {
  //   try {
  //     const { api } = await import('../../api/axios');
  //     const orderRes = await api.post('/billing/razorpay/create-order', {
  //       amount: rechargeAmount,
  //       tenantId: 'default_tenant',
  //     });
  //     const order = orderRes.data.order;
  // 
  //     const options = {
  //       key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  //       amount: order.amount,
  //       currency: 'INR',
  //       name: 'Wheedle.ai',
  //       description: 'Wallet Recharge',
  //       order_id: order.id,
  //       handler: async (response: any) => {
  //         try {
  //           await api.post('/billing/razorpay/verify', {
  //             tenantId: 'default_tenant',
  //             amount: rechargeAmount,
  //             razorpay_order_id: response.razorpay_order_id,
  //             razorpay_payment_id: response.razorpay_payment_id,
  //             razorpay_signature: response.razorpay_signature,
  //           });
  //           toast.success(`$${rechargeAmount} added to wallet!`);
  //           setWalletBalance(prev => prev + rechargeAmount);
  //         } catch {
  //           toast.error('Payment verification failed');
  //         }
  //       },
  //       prefill: { name: 'Wheedle User', email: 'user@Wheedle.ai' },
  //      theme: { color: '#0665ff' },
  //     };
  // 
  //     if (!(window as unknown as { Razorpay?: unknown }).Razorpay) {
  //       await new Promise<void>((resolve, reject) => {
  //         const script = document.createElement('script');
  //         script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  //         script.onload = () => resolve();
  //         script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
  //         document.body.appendChild(script);
  //       });
  //     }
  // 
  //     const Rzp = (window as unknown as { Razorpay: new (opts: typeof options) => { open: () => void } }).Razorpay;
  //     const rzp = new Rzp(options);
  //     rzp.open();
  //   } catch (err: unknown) {
  //     const ax = err as { response?: { data?: { message?: string } } };
  //     toast.error(ax?.response?.data?.message || 'Failed to initiate payment');
  //   }
  // };

  const toggleKpi = (i: number) => {
    const newKpis = [...kpis];
    newKpis[i].checked = !newKpis[i].checked;
    setKpis(newKpis);
  };

  if (loading) return (
    <PageLoader
      message="Syncing Live AI Command Matrix..."
      submessage="Aggregating cross-channel ad spend, ROAS performance & CRM audience nodes"
    />
  );

  const activeDates = analyticsData?.daily?.map((d: any) => d.date) || [];
  const activeSpend = analyticsData?.daily?.map((d: any) => d.spend) || [];
  const activeRoas = analyticsData?.daily?.map((d: any) => d.roas) || [];

  const syncPlatform = async (platform: 'meta' | 'google' | 'x' | 'linkedin') => {
    const names: Record<string, string> = {
      meta: 'Meta Ads',
      google: 'Google Ads',
      x: 'X Ads',
      linkedin: 'LinkedIn Ads',
    };
    const t = toast.loading(`Syncing ${names[platform]} data...`);
    try {
      const { api } = await import('../../api/axios');
      await api.post(`/analytics/sync/${platform}`);
      toast.dismiss(t);
      toast.success(`${names[platform]} synced successfully!`);
      void fetchData();
    } catch (e: unknown) {
      toast.dismiss(t);
      const ax = e as { response?: { data?: { message?: string } } };
      toast.error(ax?.response?.data?.message || `Sync failed for ${names[platform]}`);
    }
  };

  const handleConnect = async (platform: string) => {
    try {
      const { api } = await import('../../api/axios');
      if (platform === 'LinkedIn') {
        const res = await api.get('/linkedin-crm/oauth/url');
        if (res.data?.url) window.location.href = res.data.url;
      } else if (platform === 'Google') {
        const res = await api.get('/social/auth/google');
        if (res.data?.data?.url) window.location.href = res.data.data.url;
      } else if (platform === 'Meta') {
        const res = await api.get('/social/auth/facebook');
        if (res.data?.data?.url) window.location.href = res.data.data.url;
      } else if (platform === 'X') {
        const res = await api.get('/social/auth/twitter');
        if (res.data?.data?.url) window.location.href = res.data.data.url;
      }
    } catch {
      toast.error(`Unable to connect ${platform}`);
    }
  };

  const handleDisconnect = async (platform: string) => {
    try {
      const { api } = await import('../../api/axios');
      let endpoint = '/analytics/disconnect/meta';
      if (platform === 'Google') endpoint = '/analytics/disconnect/google';
      else if (platform === 'X') endpoint = '/analytics/disconnect/x';
      else if (platform === 'LinkedIn') endpoint = '/analytics/disconnect/linkedin';
      await api.post(endpoint);
      toast.success(`${platform} disconnected.`);
      void fetchData();
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { message?: string } } };
      toast.error(ax?.response?.data?.message || `Failed to disconnect ${platform}`);
    }
  };

  const adNetworks = [
    { key: 'meta' as const, label: 'Meta Ads', connected: !!user?.metaAccessToken },
    { key: 'google' as const, label: 'Google Ads', connected: !!(user?.googleRefreshToken || user?.googleAccessToken) },
    { key: 'x' as const, label: 'X Ads', connected: !!user?.twitterAccessToken },
    { key: 'linkedin' as const, label: 'LinkedIn Ads', connected: !!user?.linkedinAccessToken },
  ];

  const categoryCardStyle: React.CSSProperties = {
    background: D.surface,
    border: `1px solid ${D.border}`,
    borderRadius: 18,
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.22s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '170px',
  };

  const categoryTabs: { id: DashboardTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'overview', label: 'Command Matrix', icon: Layers },
    { id: 'ads', label: 'Paid Ads Hub', icon: Megaphone, badge: 'Live ROAS' },
    { id: 'social', label: 'Publishing & Social', icon: Share2, badge: 'Auto-Pilot' },
    { id: 'ai-bots', label: 'AI Bots & Voice', icon: Bot, badge: 'WhatsApp' },
    { id: 'seo-rep', label: 'SEO & Reputation', icon: Search },
    { id: 'insights', label: 'Ad Insights', icon: BarChart3 },
    { id: 'ai', label: 'AI Deep Analysis', icon: Sparkles },
  ];

  return (
    <div style={{ minHeight: '100%', background: D.bg, color: D.textPrimary }}>

      {/* ── Top Command Bar ── */}
      <div style={{
        background: D.surface,
        borderBottom: `1px solid ${D.border}`,
        padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: D.textPrimary, fontFamily: 'Outfit' }}>
            Intelligence <span className="text-gradient">Command Center</span>
          </span>
          <div style={{ padding: '4px 12px', background: D.purpleSoft, border: `1px solid ${D.borderGlow}`, borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, color: D.purpleText, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: D.greenText, animation: 'pulse 1.8s infinite' }} />
            Live AI Matrix
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => void fetchData()}
            style={{ fontSize: '0.8rem', fontWeight: 600, color: D.textMuted, display: 'flex', alignItems: 'center', gap: 6, background: D.white005, border: `1px solid ${D.border}`, padding: '8px 14px', borderRadius: 10, cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = D.purpleText; }}
            onMouseLeave={e => { e.currentTarget.style.color = D.textMuted; }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            onClick={() => navigate('/campaigns')}
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              background: 'var(--accent-gradient)',
              color: '#fff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 14px rgba(6, 101, 255, 0.28)',
            }}
          >
            <Megaphone size={14} /> + New Campaign
          </button>
        </div>
      </div>

      {/* ── Category View Switcher Tabs ── */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${D.border}`,
        background: D.surfaceAlt,
        padding: '0 24px',
        overflowX: 'auto',
      }}>
        {categoryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '13px 18px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: isActive ? D.purpleText : D.textMuted,
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.84rem',
                borderBottom: isActive ? `2px solid ${D.purpleText}` : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
                transition: 'all 0.18s ease',
              }}
            >
              <Icon size={15} style={{ opacity: isActive ? 1 : 0.7 }} />
              {tab.label}
              {tab.badge && (
                <span style={{
                  fontSize: '0.62rem',
                  padding: '1px 6px',
                  borderRadius: 99,
                  background: isActive ? D.purpleSoft : D.white005,
                  color: isActive ? D.purpleText : D.textDim,
                  fontWeight: 700,
                  border: `1px solid ${isActive ? D.borderGlow : D.border}`,
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════
          VIEW 1: COMMAND MATRIX (UNIFIED OVERVIEW)
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div style={{ padding: '24px 32px' }}>

          {/* ── Category Suite Navigator Cards ── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={16} color={D.purpleText} />
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: D.textPrimary }}>Platform Category Suites</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: D.textDim }}>Direct category launchpad & active metrics</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))', gap: 16 }}>
              {/* Card 1: Paid Ads */}
              <div
                onClick={() => setActiveTab('ads')}
                style={categoryCardStyle}
                onMouseEnter={e => { e.currentTarget.style.borderColor = D.borderGlow; e.currentTarget.style.background = D.surfaceAlt; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = D.border; e.currentTarget.style.background = D.surface; }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(6, 101, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Megaphone size={16} color="#0665ff" />
                    </div>
                    <span style={{ fontSize: '0.64rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(6, 101, 255, 0.12)', color: '#38bdf8' }}>
                      Paid Ads
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>Paid Ads & ROAS</h4>
                  <p style={{ fontSize: '0.74rem', color: D.textMuted, margin: 0, lineHeight: 1.4 }}>
                    Multi-channel ad spend, ROAS tracking & AI campaign wizard.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${D.border}`, marginTop: 12 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: D.purpleText }}>
                    {kpis[0].value}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate('/campaigns'); }}
                    style={{ fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: 'var(--accent-gradient)', color: '#fff', border: 'none', cursor: 'pointer' }}
                  >
                    + Campaign
                  </button>
                </div>
              </div>

              {/* Card 2: Publishing & Auto-Pilot */}
              <div
                onClick={() => setActiveTab('social')}
                style={categoryCardStyle}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)'; e.currentTarget.style.background = D.surfaceAlt; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = D.border; e.currentTarget.style.background = D.surface; }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Share2 size={16} color="#10b981" />
                    </div>
                    <span style={{ fontSize: '0.64rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(16, 185, 129, 0.12)', color: '#34d399' }}>
                      Social Hub
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>Post & Auto-Pilot</h4>
                  <p style={{ fontSize: '0.74rem', color: D.textMuted, margin: 0, lineHeight: 1.4 }}>
                    AI multimodal post creator, trending hashtags & autopilot topics.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${D.border}`, marginTop: 12 }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: D.greenText }}>
                    ● 5 Channels
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate('/post-publisher'); }}
                    style={{ fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', cursor: 'pointer' }}
                  >
                    Compose
                  </button>
                </div>
              </div>

              {/* Card 3: AI Bots & Voice */}
              <div
                onClick={() => setActiveTab('ai-bots')}
                style={categoryCardStyle}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)'; e.currentTarget.style.background = D.surfaceAlt; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = D.border; e.currentTarget.style.background = D.surface; }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bot size={16} color="#a855f7" />
                    </div>
                    <span style={{ fontSize: '0.64rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(168, 85, 247, 0.12)', color: '#c084fc' }}>
                      AI Suite
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>Bots & Voice AI</h4>
                  <p style={{ fontSize: '0.74rem', color: D.textMuted, margin: 0, lineHeight: 1.4 }}>
                    Web Chatbot builder, embeddable WhatsApp AI widget & calling.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${D.border}`, marginTop: 12 }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#c084fc' }}>
                    WhatsApp Live
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate('/chatbot'); }}
                    style={{ fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)', cursor: 'pointer' }}
                  >
                    Bots Hub
                  </button>
                </div>
              </div>

              {/* Card 4: SEO & Reputation */}
              <div
                onClick={() => setActiveTab('seo-rep')}
                style={categoryCardStyle}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)'; e.currentTarget.style.background = D.surfaceAlt; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = D.border; e.currentTarget.style.background = D.surface; }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Search size={16} color="#f59e0b" />
                    </div>
                    <span style={{ fontSize: '0.64rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24' }}>
                      Search IQ
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>SEO & Reputation</h4>
                  <p style={{ fontSize: '0.74rem', color: D.textMuted, margin: 0, lineHeight: 1.4 }}>
                    Organic site audit, rank tracking, and customer review sentiment.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${D.border}`, marginTop: 12 }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#fbbf24' }}>
                    Audit Ready
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate('/seo'); }}
                    style={{ fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', cursor: 'pointer' }}
                  >
                    SEO Audit
                  </button>
                </div>
              </div>

              {/* Card 5: Brand & CRM */}
              <div
                onClick={() => navigate('/linkedin-crm')}
                style={categoryCardStyle}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)'; e.currentTarget.style.background = D.surfaceAlt; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = D.border; e.currentTarget.style.background = D.surface; }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Briefcase size={16} color="#06b6d4" />
                    </div>
                    <span style={{ fontSize: '0.64rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(6, 182, 212, 0.12)', color: '#22d3ee' }}>
                      Brand & Leads
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>Brand Studio & CRM</h4>
                  <p style={{ fontSize: '0.74rem', color: D.textMuted, margin: 0, lineHeight: 1.4 }}>
                    Brand identity, target customer persona & LinkedIn B2B pipeline.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${D.border}`, marginTop: 12 }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#22d3ee' }}>
                    Pipeline Active
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate('/brand/profile'); }}
                    style={{ fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.3)', cursor: 'pointer' }}
                  >
                    Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Ad Network Node Station ── */}
          <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 18, padding: '20px 24px', marginBottom: 24, boxShadow: '0 4px 30px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Database size={17} color={D.purpleText} />
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: D.textPrimary }}>Connected Ad Network Nodes & Sync Station</span>
              </div>
              <span style={{ fontSize: '0.76rem', color: D.textDim }}>Auto-sync every 15 min · Last updated: {new Date().toLocaleTimeString()}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14 }}>
              {adNetworks.map((net) => (
                <div
                  key={net.label}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: D.surfaceAlt,
                    border: `1px solid ${net.connected ? D.borderGlow : D.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: net.connected ? D.greenText : '#64748b',
                      boxShadow: net.connected ? '0 0 8px rgba(52, 211, 153, 0.6)' : 'none',
                    }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem', color: net.connected ? D.textPrimary : D.textMuted }}>{net.label}</div>
                      <div style={{ fontSize: '0.7rem', color: net.connected ? D.greenText : D.textDim }}>
                        {net.connected ? 'Connected' : 'Not linked'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {net.connected ? (
                      <>
                        <button
                          type="button"
                          onClick={() => syncPlatform(net.key)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 8,
                            background: D.purpleSoft,
                            border: `1px solid ${D.borderGlow}`,
                            color: D.purpleText,
                            fontSize: '0.73rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Sync
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDisconnect(net.label.split(' ')[0])}
                          style={{
                            padding: '5px 8px',
                            borderRadius: 8,
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            color: '#ef4444',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConnect(net.label.split(' ')[0])}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          background: 'rgba(16,185,129,0.12)',
                          border: '1px solid rgba(16,185,129,0.3)',
                          color: D.greenText,
                          fontSize: '0.73rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Date Range Filters ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {dateRanges.map(r => (
              <button key={r} onClick={() => setActiveRange(r)} style={{
                padding: '8px 20px', borderRadius: 99, cursor: 'pointer', transition: '0.2s',
                border: activeRange === r ? `1px solid ${D.purple}` : `1px solid ${D.border}`,
                background: activeRange === r ? D.purple : D.white005,
                color: activeRange === r ? '#fff' : D.textMuted,
                fontSize: '0.85rem', fontWeight: 700,
              }}>
                {r}
              </button>
            ))}
            <div style={{ padding: '8px 20px', borderRadius: 99, border: `1px solid ${D.border}`, background: D.white005, fontSize: '0.8rem', color: D.textDim, display: 'flex', alignItems: 'center', gap: 8 }}>
              📅 {activeDates[0] ?? '—'} → {activeDates[activeDates.length - 1] ?? '—'}
            </div>
          </div>

          {/* ── KPI Grid ── */}
          <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 20, padding: 24, marginBottom: 24, boxShadow: '0 4px 30px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              {kpis.map((kpi, i) => (
                <div
                  key={kpi.label}
                  onClick={() => toggleKpi(i)}
                  style={{
                    padding: 20, borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
                    border: `2px solid ${kpi.checked ? kpi.color + '50' : D.border}`,
                    background: kpi.checked ? kpi.color + '10' : D.white005,
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = kpi.checked ? kpi.color + '18' : D.white010}
                  onMouseLeave={e => e.currentTarget.style.background = kpi.checked ? kpi.color + '10' : D.white005}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 14, height: 4, borderRadius: 2, background: kpi.checked ? kpi.color : D.textDim }} />
                      <span style={{ fontSize: '0.82rem', color: D.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</span>
                    </div>
                    <div style={{ fontSize: '1.7rem', fontWeight: 800, color: kpi.checked ? D.textPrimary : D.textDim, fontFamily: 'Outfit' }}>
                      {kpi.value}
                    </div>
                  </div>
                  <input type="checkbox" checked={kpi.checked} readOnly style={{ accentColor: D.purple, width: 16, height: 16, cursor: 'pointer', marginTop: 4 }} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Performance Chart ── */}
          <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 20, padding: 32, marginBottom: 24, boxShadow: '0 4px 30px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: D.textPrimary, margin: 0 }}>Cross-Channel Performance Trajectory</h3>
                <p style={{ fontSize: '0.76rem', color: D.textDim, margin: '4px 0 0' }}>Real-time spend correlation with conversion return factor</p>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                {[['#0665ff', 'Spend'], ['#10b981', 'ROAS Factor']].map(([color, label]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: D.textMuted }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ position: 'relative', height: 220, width: '100%' }}>
              <div style={{ position: 'absolute', inset: 0 }}>
                <ChartLine data={activeSpend} color="#0665ff" height={220} width={1200} />
              </div>
              <div style={{ position: 'absolute', inset: 0 }}>
                <ChartLine data={activeRoas.map((v: number) => v * 10)} color="#10b981" height={220} width={1200} />
              </div>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${(i / 3) * 85 + 5}%`, borderTop: `1px solid ${D.border}`, pointerEvents: 'none' }} />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, borderTop: `1px solid ${D.border}`, paddingTop: 12 }}>
              {activeDates.map((d: string) => (
                <span key={d} style={{ fontSize: '0.72rem', color: D.textDim, fontWeight: 600 }}>
                  {d.split('-').slice(1).join('/')}
                </span>
              ))}
            </div>
          </div>

          {/* ── Audience Segments ── */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Users size={16} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: D.textPrimary }}>Intelligence Audience Segments</h3>
            </div>
            {audiences.length === 0 ? (
              <div style={{ padding: 20, borderRadius: 16, background: D.surfaceAlt, border: `1px solid ${D.border}`, color: D.textMuted, fontSize: '0.85rem' }}>
                No custom audience segments loaded yet. Sync your connected ad accounts to populate CRM segments automatically.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {audiences.slice(0, 3).map((aud, i) => (
                  <div key={i} style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 16, padding: 20, transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: D.textPrimary }}>{aud.name}</span>
                      <span style={{ background: D.greenSoft, color: D.greenText, padding: '2px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700 }}>
                        {((aud.estimatedSize || 0) / 1000).toFixed(1)}k Reach
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: D.textDim, lineHeight: 1.6 }}>{aud.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Analytics Table ── */}
          <div style={{ marginTop: 32 }}>
            <SmartTable
              title="Daily Performance Analytics"
              columns={[
                { key: 'date', label: 'Node Date', sortable: true, render: (row) => <span style={{ fontWeight: 700, color: D.textPrimary }}>{row.date}</span> },
                { key: 'spend', label: 'Daily Spend', sortable: true, render: (row) => <span style={{ fontWeight: 800, color: D.purpleText }}>{cur}{row.spend?.toFixed(2) ?? '0.00'}</span> },
                { key: 'cpm', label: 'CPM', sortable: true, render: (r) => <span style={{ color: D.textMuted }}>{cur}{r.cpm?.toFixed(2) ?? '0.00'}</span> },
                { key: 'cpc', label: 'CPC', sortable: true, render: (r) => <span style={{ color: D.textMuted }}>{cur}{r.cpc?.toFixed(2) ?? '0.00'}</span> },
                { key: 'ctr', label: 'CTR Matrix', sortable: true, render: (r) => <span style={{ fontWeight: 600, color: D.textPrimary }}>{r.ctr?.toFixed(2) ?? '0.00'}%</span> },
                { key: 'roas', label: 'ROAS Factor', sortable: true, render: (r) => <span style={{ fontWeight: 800, color: D.greenText }}>{r.roas?.toFixed(2) ?? '0.00'}x</span> },
              ]}
              data={analyticsData?.daily?.slice().reverse() ?? []}
              dark={true}
            />
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          VIEW 2: PAID ADS HUB
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'ads' && (
        <div style={{ padding: '24px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>Paid Advertising & ROAS Matrix</h2>
              <p style={{ fontSize: '0.82rem', color: D.textMuted, margin: 0 }}>Configure ad channels, monitor spend efficiency and launch optimized campaigns.</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => navigate('/campaigns')}
                style={{ padding: '9px 18px', borderRadius: 10, background: 'var(--accent-gradient)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Megaphone size={15} /> Launch Ad Wizard
              </button>
              <button
                onClick={() => navigate('/ai/ads-manager')}
                style={{ padding: '9px 16px', borderRadius: 10, background: D.surfaceAlt, color: D.textPrimary, border: `1px solid ${D.border}`, fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}
              >
                Ads Manager
              </button>
            </div>
          </div>

          <div style={{ height: 'calc(100vh - 220px)', overflowY: 'auto' }}>
            <AdInsights />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          VIEW 3: PUBLISHING & SOCIAL
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'social' && (
        <div style={{ padding: '24px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>Publishing & Social Hub</h2>
              <p style={{ fontSize: '0.82rem', color: D.textMuted, margin: 0 }}>Manage multi-platform post publishing, auto-pilot schedules & creative assets.</p>
            </div>
            <button
              onClick={() => navigate('/post-publisher')}
              style={{ padding: '9px 20px', borderRadius: 10, background: 'var(--accent-gradient)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Share2 size={15} /> Open Post Publisher
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 18, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Sparkles size={20} color="#10b981" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#fff' }}>Post & Auto-Pilot Studio</h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: D.textMuted, lineHeight: 1.5, marginBottom: 20 }}>
                Generate engaging, viral posts using AI, write copy directly from attached visual assets, and set recurring auto-pilot topic schedules across Instagram, Facebook, LinkedIn, YouTube, and X.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => navigate('/post-publisher')}
                  style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--accent-gradient)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Create New Post
                </button>
                <button
                  onClick={() => navigate('/post-publisher')}
                  style={{ padding: '8px 16px', borderRadius: 8, background: D.surfaceAlt, color: D.textPrimary, border: `1px solid ${D.border}`, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Auto-Pilot Topics
                </button>
              </div>
            </div>

            <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 18, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Gem size={20} color="#0665ff" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#fff' }}>Creative Studio Hub</h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: D.textMuted, lineHeight: 1.5, marginBottom: 20 }}>
                Produce AI-generated banners, ad visuals, product backdrops, and creative copy tailored to your brand identity with 1-click publishing pipelines.
              </p>
              <button
                onClick={() => navigate('/content')}
                style={{ padding: '8px 18px', borderRadius: 8, background: D.purpleSoft, color: D.purpleText, border: `1px solid ${D.borderGlow}`, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Open Creative Hub →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          VIEW 4: AI CONVERSATIONAL SUITE
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'ai-bots' && (
        <div style={{ padding: '24px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>AI Conversational & Voice Suite</h2>
              <p style={{ fontSize: '0.82rem', color: D.textMuted, margin: 0 }}>Configure 24/7 lead capture chatbots, embeddable WhatsApp AI widgets & autonomous agents.</p>
            </div>
            <button
              onClick={() => navigate('/chatbot')}
              style={{ padding: '9px 20px', borderRadius: 10, background: 'var(--accent-gradient)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Bot size={15} /> Bot Builder & WhatsApp
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 18, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <MessageSquare size={20} color="#25D366" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#fff' }}>WhatsApp AI Widget</h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: D.textMuted, lineHeight: 1.5, marginBottom: 18 }}>
                Floating interactive WhatsApp bubble for client websites with auto-greetings, live sound effects, and direct WhatsApp customer routing.
              </p>
              <button
                onClick={() => navigate('/chatbot')}
                style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(37, 211, 102, 0.15)', color: '#25D366', border: '1px solid rgba(37, 211, 102, 0.3)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Configure WhatsApp Widget →
              </button>
            </div>

            <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 18, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <PhoneCall size={20} color="#38bdf8" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#fff' }}>Voice Calling Agent</h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: D.textMuted, lineHeight: 1.5, marginBottom: 18 }}>
                Deploy autonomous outbound and inbound voice calling agents to qualify leads, book calendar meetings, and follow up instantly.
              </p>
              <button
                onClick={() => navigate('/calling-agent')}
                style={{ padding: '8px 16px', borderRadius: 8, background: D.surfaceAlt, color: D.textPrimary, border: `1px solid ${D.border}`, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Open Voice Agent →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          VIEW 5: SEO & REPUTATIONIQ
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'seo-rep' && (
        <div style={{ padding: '24px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>Search Intelligence & ReputationIQ</h2>
              <p style={{ fontSize: '0.82rem', color: D.textMuted, margin: 0 }}>Site health, keyword rank audits & Google reviews reputation tracking.</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => navigate('/seo')}
                style={{ padding: '9px 18px', borderRadius: 10, background: 'var(--accent-gradient)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Search size={15} /> SEO Site Audit
              </button>
              <button
                onClick={() => navigate('/reputation/dashboard')}
                style={{ padding: '9px 16px', borderRadius: 10, background: D.surfaceAlt, color: D.textPrimary, border: `1px solid ${D.border}`, fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Star size={15} /> Reputation Dashboard
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 18, padding: 24 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 8px', color: '#fff' }}>SEO Organic Health & Audit</h3>
              <p style={{ fontSize: '0.82rem', color: D.textMuted, lineHeight: 1.5, marginBottom: 18 }}>
                Analyze backlinks, monitor daily search keyword rankings, and generate technical SEO health fixes to beat organic competitors.
              </p>
              <button
                onClick={() => navigate('/seo/audit')}
                style={{ padding: '8px 16px', borderRadius: 8, background: D.purpleSoft, color: D.purpleText, border: `1px solid ${D.borderGlow}`, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Run Site Audit →
              </button>
            </div>

            <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 18, padding: 24 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 8px', color: '#fff' }}>Customer Reviews & Sentiment</h3>
              <p style={{ fontSize: '0.82rem', color: D.textMuted, lineHeight: 1.5, marginBottom: 18 }}>
                Aggregate Google Business reviews, reply to customer feedback automatically with AI, and track sentiment trends.
              </p>
              <button
                onClick={() => navigate('/reputation/inbox')}
                style={{ padding: '8px 16px', borderRadius: 8, background: D.surfaceAlt, color: D.textPrimary, border: `1px solid ${D.border}`, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                View Review Inbox →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          VIEW 6: AD INSIGHTS
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'insights' && (
        <div style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
          <AdInsights />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          VIEW 7: AI ANALYSIS
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'ai' && (
        <div style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
          <AiAnalysis />
        </div>
      )}

    </div>
  );
};
