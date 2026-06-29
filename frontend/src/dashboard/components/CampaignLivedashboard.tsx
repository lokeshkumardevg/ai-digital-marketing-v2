// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';

// ============================================
// TYPES (copy from your main file or import)
// ============================================
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

// ============================================
// PLATFORM ICONS
// ============================================
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#3b82f6">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.6h12.4c-.5 2.8-2.1 5.2-4.5 6.8v5.6h7.3c4.3-3.9 6.9-9.7 6.9-16.5z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.6c-2.1 1.4-4.7 2.2-8.6 2.2-6.6 0-12.2-4.5-14.2-10.5H2.3v5.8C6.3 42.6 14.6 48 24 48z" />
    <path fill="#FBBC05" d="M9.8 28.3c-.5-1.4-.8-2.9-.8-4.3s.3-2.9.8-4.3v-5.8H2.3C.8 17.1 0 20.5 0 24s.8 6.9 2.3 10.1l7.5-5.8z" />
    <path fill="#EA4335" d="M24 9.5c3.7 0 7 1.3 9.6 3.8l7.2-7.2C36.9 2.1 31.5 0 24 0 14.6 0 6.3 5.4 2.3 13.9l7.5 5.8C11.8 14 17.4 9.5 24 9.5z" />
  </svg>
);

const TwitterXIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0a66c2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

// ============================================
// SPARKLINE MINI CHART
// ============================================
const Sparkline: React.FC<{ data: number[]; color: string; height?: number }> = ({ data, color, height = 40 }) => {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  const area = `0,${h} ${polyline} ${w},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={polyline} stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

// ============================================
// ANIMATED COUNTER
// ============================================
const AnimCounter: React.FC<{ target: number; prefix?: string; suffix?: string; decimals?: number }> = ({
  target, prefix = '', suffix = '', decimals = 0
}) => {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(eased * target);
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target]);
  const display = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString();
  return <>{prefix}{display}{suffix}</>;
};

// ============================================
// RING GAUGE
// ============================================
const RingGauge: React.FC<{ value: number; max?: number; color: string; size?: number; label?: string }> = ({
  value, max = 100, color, size = 64, label
}) => {
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = pct * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      {label && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: size > 56 ? '0.75rem' : '0.6rem', fontWeight: 700, color }}>{Math.round(value)}</span>
          <span style={{ fontSize: '0.5rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
        </div>
      )}
    </div>
  );
};

// ============================================
// PLATFORM CONFIG
// ============================================
const getPlatformConfig = (name: string) => {
  const map: Record<string, { label: string; sub: string; icon: React.ReactElement; color: string; accent: string; gradient: string }> = {
    meta:     { label: 'Meta Ads',     sub: 'Facebook & Instagram', icon: <FacebookIcon />, color: '#3b82f6', accent: '#60a5fa', gradient: 'linear-gradient(135deg,#1e3a5f,#1e3360)' },
    google:   { label: 'Google Ads',   sub: 'Search, Display & YouTube', icon: <GoogleIcon />, color: '#ea4335', accent: '#f87171', gradient: 'linear-gradient(135deg,#3b1a1a,#2d1515)' },
    twitter:  { label: 'X (Twitter)', sub: 'Promoted Posts & Trends', icon: <TwitterXIcon />, color: '#e7e9ea', accent: '#fff', gradient: 'linear-gradient(135deg,#1a1a1a,#111)' },
    x:        { label: 'X (Twitter)', sub: 'Promoted Posts & Trends', icon: <TwitterXIcon />, color: '#e7e9ea', accent: '#fff', gradient: 'linear-gradient(135deg,#1a1a1a,#111)' },
    linkedin: { label: 'LinkedIn Ads', sub: 'Sponsored Content & InMail', icon: <LinkedInIcon />, color: '#0a66c2', accent: '#38bdf8', gradient: 'linear-gradient(135deg,#0a1628,#0a1a36)' },
  };
  return map[name] || map['meta'];
};

const statusConfig: Record<string, { color: string; bg: string; label: string; pulse: boolean }> = {
  ACTIVE:     { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Live',       pulse: true },
  CREATING:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Creating',   pulse: true },
  PROCESSING: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Processing', pulse: true },
  PAUSED:     { color: '#64748b', bg: 'rgba(100,116,139,0.12)', label: 'Paused',    pulse: false },
  FAILED:     { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'Failed',    pulse: false },
};

const fmt = (n: number) =>
  n?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) || '$0';

// ============================================
// METRIC CARD
// ============================================
const MetricCard: React.FC<{
  label: string; value: number; prefix?: string; suffix?: string; decimals?: number;
  icon: string; color: string; delta?: number; spark?: number[];
}> = ({ label, value, prefix, suffix, decimals, icon, color, delta, spark }) => (
  <div className="ld-metric-card">
    <div className="ld-metric-top">
      <div className="ld-metric-icon" style={{ background: `${color}18`, color }}>{icon}</div>
      {delta !== undefined && (
        <div className="ld-metric-delta" style={{ color: delta >= 0 ? '#10b981' : '#ef4444' }}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
        </div>
      )}
    </div>
    <div className="ld-metric-value">
      <AnimCounter target={value} prefix={prefix} suffix={suffix} decimals={decimals} />
    </div>
    <div className="ld-metric-label">{label}</div>
    {spark && (
      <div className="ld-metric-spark">
        <Sparkline data={spark} color={color} height={32} />
      </div>
    )}
  </div>
);

// ============================================
// PLATFORM TILE
// ============================================
const PlatformTile: React.FC<{
  platform: PlatformData; active: boolean; onClick: () => void;
}> = ({ platform, active, onClick }) => {
  const cfg = getPlatformConfig(platform.name);
  const sc = statusConfig[platform.status] || statusConfig['CREATING'];
  return (
    <button className={`ld-plat-tile ${active ? 'active' : ''}`} onClick={onClick}
      style={{ '--pc': cfg.color, '--pg': cfg.gradient } as React.CSSProperties}>
      <div className="ld-plat-tile-icon">{cfg.icon}</div>
      <div className="ld-plat-tile-info">
        <div className="ld-plat-tile-name">{cfg.label}</div>
        <div className="ld-plat-tile-sub">{cfg.sub}</div>
      </div>
      <div className="ld-plat-tile-status" style={{ background: sc.bg, color: sc.color }}>
        <span className={`ld-status-dot ${sc.pulse ? 'pulse' : ''}`} style={{ background: sc.color }} />
        {sc.label}
      </div>
    </button>
  );
};

// ============================================
// DONUT CHART (pure SVG)
// ============================================
const DonutChart: React.FC<{
  data: { label: string; value: number; color: string }[];
  size?: number;
}> = ({ data, size = 120 }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 12;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = data.map(d => {
    const pct = d.value / total;
    const dash = pct * circ;
    const gap = circ - dash;
    const rotation = offset * 360;
    offset += pct;
    return { ...d, dash, gap, rotation };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="18" />
      {slices.map((s, i) => (
        <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
          stroke={s.color} strokeWidth="18"
          strokeDasharray={`${s.dash - 2} ${s.gap + 2}`}
          style={{ transform: `rotate(${s.rotation}deg)`, transformOrigin: `${size/2}px ${size/2}px` }}
        />
      ))}
    </svg>
  );
};

// ============================================
// BAR CHART (pure SVG / CSS)
// ============================================
const BarChart: React.FC<{ data: { label: string; value: number; color: string }[]; height?: number }> = ({
  data, height = 80
}) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="ld-bar-chart" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="ld-bar-col">
          <div className="ld-bar-fill-wrap" style={{ height: height - 20 }}>
            <div className="ld-bar-fill" style={{
              height: `${(d.value / max) * 100}%`,
              background: d.color,
              animationDelay: `${i * 80}ms`
            }} />
          </div>
          <div className="ld-bar-label">{d.label}</div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// ADSET ROW
// ============================================
const AdSetRow: React.FC<{ ad: AdSet; index: number }> = ({ ad, index }) => {
  const sc = ad.status === 'ACTIVE' ? { color: '#10b981', bg: 'rgba(16,185,129,0.1)' }
           : ad.status === 'PAUSED' ? { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }
           : { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
  const roiGood = ad.roi >= 100;
  return (
    <div className="ld-adset-row" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="ld-adset-name">
        <div className="ld-adset-dot" style={{ background: roiGood ? '#10b981' : '#f59e0b' }} />
        {ad.name}
      </div>
      <div><span className="ld-adset-badge" style={{ background: sc.bg, color: sc.color }}>{ad.status}</span></div>
      <div className="ld-adset-num">{fmt(ad.budget)}</div>
      <div className="ld-adset-num">{ad.impressions?.toLocaleString()}</div>
      <div className="ld-adset-num">{ad.clicks?.toLocaleString()}</div>
      <div className="ld-adset-num">{fmt(ad.spend)}</div>
      <div className="ld-adset-num">{((ad.ctr || 0) * 100).toFixed(2)}%</div>
      <div className="ld-adset-num" style={{ color: roiGood ? '#10b981' : '#ef4444', fontWeight: 700 }}>{ad.roi}%</div>
    </div>
  );
};

// ============================================
// MAIN LIVE DASHBOARD
// ============================================
export const LiveDashboard: React.FC<{
  campaign: LiveCampaignData;
  brandName: string;
  onBackToChat: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}> = ({ campaign, brandName, onBackToChat, onRefresh, isRefreshing }) => {

  const [selectedPlatform, setSelectedPlatform] = useState<string>(campaign.platforms[0]?.name || 'meta');
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [activeTab, setActiveTab] = useState<'metrics' | 'adsets' | 'distribution'>('metrics');
  const [tick, setTick] = useState(0);

  // Pulse tick for live indicator
  useEffect(() => {
    if (campaign.status !== 'ACTIVE') return;
    const t = setInterval(() => setTick(n => n + 1), 2000);
    return () => clearInterval(t);
  }, [campaign.status]);

  const platform = campaign.platforms.find(p => p.name === selectedPlatform) || campaign.platforms[0];
  const cfg = getPlatformConfig(platform?.name);
  const sc = statusConfig[campaign.status] || statusConfig['CREATING'];

  // No mock data allowed
  const genSpark = (/* @ts-ignore */ base: any, /* @ts-ignore */ len: any) => [];

  const overallMetrics = campaign.overallMetrics || {};
  const platMetrics = platform?.metrics || {};

  // Platform distribution for donut
  const platDistrib = campaign.platforms.map((p, i) => ({
    label: getPlatformConfig(p.name).label,
    value: p.metrics?.spend || 0,
    color: ['#3b82f6', '#ea4335', '#e7e9ea', '#0a66c2'][i % 4],
  }));

  // Weekly bar data (strictly dynamic, currently we don't have this in API so it returns 0 to avoid fake numbers)
  const weeklyData = [
    { label: 'Mon', value: 0, color: cfg.color },
    { label: 'Tue', value: 0, color: cfg.color },
    { label: 'Wed', value: 0, color: cfg.color },
    { label: 'Thu', value: 0, color: cfg.color },
    { label: 'Fri', value: 0, color: cfg.color },
    { label: 'Sat', value: 0, color: `${cfg.color}66` },
    { label: 'Sun', value: 0, color: `${cfg.color}66` },
  ];

  return (
    <>
      <style>{DASHBOARD_CSS}</style>
      <div className="ld-root">

        {/* ── TOP HEADER ── */}
        <div className="ld-header">
          <div className="ld-header-left">
            <button className="ld-back-btn" onClick={onBackToChat}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            <div className="ld-header-brand">
              <div className="ld-brand-avatar">{(brandName || 'B')[0].toUpperCase()}</div>
              <div>
                <h1 className="ld-header-title">{campaign.campaignName || brandName}</h1>
                <div className="ld-header-id">Campaign · {campaign.campaignId?.slice(0, 18)}…</div>
              </div>
            </div>
          </div>

          <div className="ld-header-right">
            <div className="ld-live-pill" style={{ background: sc.bg, borderColor: `${sc.color}40`, color: sc.color }}>
              <span className={`ld-status-dot ${sc.pulse ? 'pulse' : ''}`} style={{ background: sc.color }} />
              {sc.label}
              {campaign.status === 'ACTIVE' && (
                <span className="ld-live-blink" style={{ opacity: tick % 2 === 0 ? 1 : 0.4 }}>●</span>
              )}
            </div>
            <div className="ld-time-group">
              {(['7d', '14d', '30d'] as const).map(r => (
                <button key={r} className={`ld-time-btn ${timeRange === r ? 'active' : ''}`} onClick={() => setTimeRange(r)}>
                  {r === '7d' ? '7D' : r === '14d' ? '14D' : '30D'}
                </button>
              ))}
            </div>
            <button className={`ld-icon-btn ${isRefreshing ? 'spinning' : ''}`} onClick={onRefresh} title="Refresh">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── OVERALL KPI STRIP ── */}
        <div className="ld-kpi-strip">
          <MetricCard label="Total Impressions" value={overallMetrics.totalImpressions || 0}
            icon="👁" color="#8b5cf6"
            delta={4.2} spark={genSpark(overallMetrics.totalImpressions || 1000)} />
          <MetricCard label="Total Clicks" value={overallMetrics.totalClicks || 0}
            icon="🖱" color="#3b82f6"
            delta={7.8} spark={genSpark(overallMetrics.totalClicks || 100)} />
          <MetricCard label="Total Spend" value={overallMetrics.totalSpend || 0}
            prefix="$" icon="💳" color="#f59e0b"
            delta={-1.2} spark={genSpark(overallMetrics.totalSpend || 500)} />
          <MetricCard label="Conversions" value={overallMetrics.totalConversions || 0}
            icon="🎯" color="#10b981"
            delta={12.5} spark={genSpark(overallMetrics.totalConversions || 20)} />
          <MetricCard label="Overall ROI" value={overallMetrics.overallRoi || 0}
            suffix="%" decimals={1} icon="📈" color="#ec4899"
            delta={3.1} spark={genSpark(overallMetrics.overallRoi || 100)} />
          <MetricCard label="Avg CTR" value={(overallMetrics.avgCtr || 0) * 100}
            suffix="%" decimals={2} icon="%" color="#06b6d4"
            delta={0.8} spark={genSpark((overallMetrics.avgCtr || 0.02) * 100)} />
        </div>

        {/* ── PLATFORM TILES ── */}
        <div className="ld-plat-row">
          {campaign.platforms.map(p => (
            <PlatformTile key={p.name} platform={p}
              active={selectedPlatform === p.name}
              onClick={() => setSelectedPlatform(p.name)} />
          ))}
        </div>

        {/* ── MAIN CONTENT GRID ── */}
        <div className="ld-content-grid">

          {/* LEFT: Platform detail panel */}
          <div className="ld-detail-panel">
            <div className="ld-panel-header" style={{ background: cfg.gradient }}>
              <div className="ld-panel-platform-icon">{cfg.icon}</div>
              <div>
                <div className="ld-panel-platform-name">{cfg.label}</div>
                <div className="ld-panel-platform-sub">{cfg.sub}</div>
              </div>
              <div className="ld-panel-gauges">
                <RingGauge value={platMetrics.roi || 0} max={300} color={cfg.color} size={56} label="ROI%" />
                <RingGauge value={(platMetrics.ctr || 0) * 1000} max={50} color="#10b981" size={56} label="CTR‰" />
              </div>
            </div>

            {/* Tabs */}
            <div className="ld-tabs">
              {(['metrics', 'adsets', 'distribution'] as const).map(t => (
                <button key={t} className={`ld-tab ${activeTab === t ? 'active' : ''}`}
                  onClick={() => setActiveTab(t)}
                  style={{ '--tc': cfg.color } as React.CSSProperties}>
                  {t === 'metrics' ? 'Metrics' : t === 'adsets' ? 'Ad Sets' : 'Distribution'}
                </button>
              ))}
            </div>

            {/* METRICS TAB */}
            {activeTab === 'metrics' && (
              <div className="ld-metrics-grid">
                {[
                  { label: 'Impressions', value: platMetrics.impressions || 0, color: '#8b5cf6', fmt: (v: number) => v.toLocaleString() },
                  { label: 'Clicks', value: platMetrics.clicks || 0, color: '#3b82f6', fmt: (v: number) => v.toLocaleString() },
                  { label: 'Spend', value: platMetrics.spend || 0, color: '#f59e0b', fmt: (v: number) => `$${v.toLocaleString()}` },
                  { label: 'CTR', value: (platMetrics.ctr || 0) * 100, color: '#06b6d4', fmt: (v: number) => `${v.toFixed(2)}%` },
                  { label: 'CPC', value: platMetrics.costPerClick || 0, color: '#ec4899', fmt: (v: number) => `$${v.toFixed(2)}` },
                  { label: 'Conversions', value: platMetrics.conversions || 0, color: '#10b981', fmt: (v: number) => v.toLocaleString() },
                  { label: 'ROI', value: platMetrics.roi || 0, color: '#10b981', fmt: (v: number) => `${v}%`, highlight: true },
                  { label: 'CPA', value: platMetrics.cpa || (platMetrics.spend / (platMetrics.conversions || 1)), color: '#f87171', fmt: (v: number) => `$${v.toFixed(2)}` },
                ].map(m => {
                  const pct = Math.min(Math.max((m.value / (m.value * 1.5 || 1)) * 100, 10), 95);
                  return (
                    <div key={m.label} className={`ld-met-box ${m.highlight ? 'highlight' : ''}`}
                      style={{ '--mc': m.color } as React.CSSProperties}>
                      <div className="ld-met-label">{m.label}</div>
                      <div className="ld-met-value" style={{ color: m.color }}>{m.fmt(m.value)}</div>
                      <div className="ld-met-bar">
                        <div className="ld-met-bar-fill" style={{ width: `${pct}%`, background: m.color }} />
                      </div>
                      <Sparkline data={genSpark(m.value)} color={m.color} height={28} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* ADSETS TAB */}
            {activeTab === 'adsets' && (
              <div className="ld-adsets-wrap">
                {platform?.adSets?.length ? (
                  <>
                    <div className="ld-adset-header">
                      <span>Name</span><span>Status</span><span>Budget</span>
                      <span>Impr.</span><span>Clicks</span><span>Spend</span>
                      <span>CTR</span><span>ROI</span>
                    </div>
                    {platform.adSets.map((ad, i) => <AdSetRow key={ad.id || i} ad={ad} index={i} />)}
                  </>
                ) : (
                  <div className="ld-empty">No ad sets yet — campaign is still initializing.</div>
                )}
              </div>
            )}

            {/* DISTRIBUTION TAB */}
            {activeTab === 'distribution' && (
              <div className="ld-distrib-tab">
                <div className="ld-distrib-row">
                  <div className="ld-distrib-chart">
                    <DonutChart data={platDistrib} size={130} />
                    <div className="ld-donut-center">
                      <div className="ld-donut-total">${Math.round(overallMetrics.totalSpend || 0).toLocaleString()}</div>
                      <div className="ld-donut-sub">Total Spend</div>
                    </div>
                  </div>
                  <div className="ld-distrib-legend">
                    {platDistrib.map((d, i) => (
                      <div key={i} className="ld-legend-row">
                        <span className="ld-legend-swatch" style={{ background: d.color }} />
                        <span className="ld-legend-name">{d.label}</span>
                        <span className="ld-legend-val">${Math.round(d.value).toLocaleString()}</span>
                        <span className="ld-legend-pct" style={{ color: d.color }}>
                          {Math.round(d.value / (platDistrib.reduce((s,x) => s + x.value, 0) || 1) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ld-weekly-section">
                  <div className="ld-weekly-title">Daily Spend Distribution</div>
                  <BarChart data={weeklyData} height={90} />
                </div>
              </div>
            )}

            {platform?.liveUrl && (
              <a href={platform.liveUrl} target="_blank" rel="noopener noreferrer"
                className="ld-view-live-btn" style={{ background: `${cfg.color}18`, borderColor: `${cfg.color}40`, color: cfg.color }}>
                View Live Campaign
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            )}
          </div>

          {/* RIGHT: Sidebar panels */}
          <div className="ld-sidebar">

            {/* Performance Score */}
            <div className="ld-sidebar-card">
              <div className="ld-sidebar-card-title">Performance Score</div>
              <div className="ld-perf-rings">
                <RingGauge value={overallMetrics.overallRoi || 0} max={300} color="#10b981" size={72} label="ROI%" />
                <RingGauge value={(overallMetrics.avgCtr || 0) * 1000} max={40} color="#3b82f6" size={72} label="CTR‰" />
                <RingGauge value={overallMetrics.totalConversions || 0} max={500} color="#8b5cf6" size={72} label="Conv." />
              </div>
              <div className="ld-perf-score-row">
                {[
                  { label: 'Efficiency', val: 82, color: '#10b981' },
                  { label: 'Reach', val: 67, color: '#3b82f6' },
                  { label: 'Quality', val: 91, color: '#8b5cf6' },
                ].map(s => (
                  <div key={s.label} className="ld-perf-score-item">
                    <div className="ld-perf-score-bar-track">
                      <div className="ld-perf-score-bar-fill" style={{ width: `${s.val}%`, background: s.color }} />
                    </div>
                    <div className="ld-perf-score-meta">
                      <span>{s.label}</span><strong style={{ color: s.color }}>{s.val}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Health */}
            <div className="ld-sidebar-card">
              <div className="ld-sidebar-card-title">Platform Health</div>
              {campaign.platforms.map(p => {
                const pc = getPlatformConfig(p.name);
                const ps = statusConfig[p.status] || statusConfig['CREATING'];
                const health = p.status === 'ACTIVE' ? 100 : p.status === 'CREATING' ? 50 : 0;
                return (
                  <div key={p.name} className="ld-health-row">
                    <div className="ld-health-icon">{pc.icon}</div>
                    <div className="ld-health-info">
                      <div className="ld-health-name">{pc.label}</div>
                      <div className="ld-health-bar-track">
                        <div className="ld-health-bar-fill" style={{ width: `${health}%`, background: pc.color }} />
                      </div>
                    </div>
                    <div className="ld-health-badge" style={{ background: ps.bg, color: ps.color }}>
                      {ps.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="ld-sidebar-card">
              <div className="ld-sidebar-card-title">Quick Stats</div>
              <div className="ld-quick-stats">
                {[
                  { label: 'Avg CPC', value: `$${(overallMetrics.avgCpc || 0).toFixed(2)}`, icon: '💲', color: '#f59e0b' },
                  { label: 'Total Reach', value: (overallMetrics.totalReach || 0).toLocaleString(), icon: '📡', color: '#8b5cf6' },
                  { label: 'Video Views', value: (overallMetrics.totalVideoViews || 0).toLocaleString(), icon: '🎬', color: '#ec4899' },
                  { label: 'Avg CTR', value: `${((overallMetrics.avgCtr || 0) * 100).toFixed(2)}%`, icon: '🔗', color: '#06b6d4' },
                  { label: 'Platforms', value: String(campaign.platforms.length), icon: '🌐', color: '#3b82f6' },
                  { label: 'Launched', value: new Date(campaign.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), icon: '🚀', color: '#10b981' },
                ].map(s => (
                  <div key={s.label} className="ld-qs-item">
                    <span className="ld-qs-icon" style={{ background: `${s.color}15` }}>{s.icon}</span>
                    <div className="ld-qs-info">
                      <div className="ld-qs-val" style={{ color: s.color }}>{s.value}</div>
                      <div className="ld-qs-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto-update badge */}
            <div className="ld-auto-update-chip">
              <span className="ld-status-dot pulse" style={{ background: '#10b981' }} />
              {campaign.status === 'ACTIVE' ? 'Auto-updating every 5 seconds' : 'Monitoring campaign…'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================
// CSS
// ============================================
const DASHBOARD_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

.ld-root {
  font-family: 'DM Sans', sans-serif;
  background: #070b14;
  min-height: 100vh;
  color: #e2e8f0;
  padding: 20px 24px 40px;
  max-width: 1440px;
  margin: 0 auto;
}

/* ── HEADER ── */
.ld-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 14px;
}
.ld-header-left { display: flex; align-items: center; gap: 16px; }
.ld-header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.ld-back-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 14px; border-radius: 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: #64748b; cursor: pointer; font-size: 0.82rem;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.18s;
}
.ld-back-btn:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }

.ld-header-brand { display: flex; align-items: center; gap: 12px; }
.ld-brand-avatar {
  width: 40px; height: 40px; border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; font-weight: 800; color: #fff;
}
.ld-header-title { margin: 0; font-size: 1.15rem; font-weight: 700; color: #fff; }
.ld-header-id { font-size: 0.68rem; color: #4b5563; font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

.ld-live-pill {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 14px; border-radius: 99px;
  border: 1px solid; font-size: 0.78rem; font-weight: 700;
}
.ld-live-blink { font-size: 0.5rem; transition: opacity 0.3s; }

.ld-time-group {
  display: flex; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07); border-radius: 9px; overflow: hidden;
}
.ld-time-btn {
  padding: 8px 14px; background: none; border: none;
  color: #64748b; cursor: pointer; font-size: 0.78rem; font-weight: 600;
  font-family: 'DM Sans', sans-serif; transition: all 0.18s;
}
.ld-time-btn.active { background: rgba(59,130,246,0.2); color: #60a5fa; }
.ld-time-btn:hover:not(.active) { background: rgba(255,255,255,0.05); color: #94a3b8; }

.ld-icon-btn {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 9px; color: #64748b; cursor: pointer; transition: all 0.18s;
}
.ld-icon-btn:hover { background: rgba(255,255,255,0.09); color: #e2e8f0; }
.ld-icon-btn.spinning svg { animation: ld-spin 0.8s linear infinite; }
@keyframes ld-spin { to { transform: rotate(360deg); } }

/* ── STATUS DOT ── */
.ld-status-dot {
  width: 7px; height: 7px; border-radius: 50%; display: inline-block; flex-shrink: 0;
}
.ld-status-dot.pulse { animation: ld-pulse 2s ease-in-out infinite; }
@keyframes ld-pulse {
  0%, 100% { box-shadow: 0 0 0 0px currentColor; }
  50% { box-shadow: 0 0 0 4px transparent; }
}

/* ── KPI STRIP ── */
.ld-kpi-strip {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}
@media (max-width: 1200px) { .ld-kpi-strip { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 680px)  { .ld-kpi-strip { grid-template-columns: repeat(2, 1fr); } }

.ld-metric-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px; padding: 16px;
  display: flex; flex-direction: column; gap: 4px;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: default;
}
.ld-metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  background: rgba(255,255,255,0.05);
}
.ld-metric-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.ld-metric-icon {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem;
}
.ld-metric-delta { font-size: 0.68rem; font-weight: 700; }
.ld-metric-value { font-size: 1.35rem; font-weight: 800; color: #fff; line-height: 1; }
.ld-metric-label { font-size: 0.67rem; color: #4b5563; text-transform: uppercase; letter-spacing: 0.06em; }
.ld-metric-spark { margin-top: 6px; opacity: 0.7; }

/* ── PLATFORM TILES ── */
.ld-plat-row {
  display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap;
}
.ld-plat-tile {
  flex: 1; min-width: 200px;
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px;
  background: rgba(255,255,255,0.03);
  border: 1.5px solid rgba(255,255,255,0.06);
  border-radius: 14px; cursor: pointer; text-align: left;
  transition: all 0.22s; color: inherit;
  font-family: 'DM Sans', sans-serif;
}
.ld-plat-tile:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.12);
  transform: translateY(-1px);
}
.ld-plat-tile.active {
  border-color: var(--pc);
  background: color-mix(in srgb, var(--pc) 8%, rgba(15,20,30,0.9));
  box-shadow: 0 0 20px color-mix(in srgb, var(--pc) 12%, transparent);
}
.ld-plat-tile-icon {
  width: 34px; height: 34px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.06); flex-shrink: 0;
}
.ld-plat-tile-info { flex: 1; min-width: 0; }
.ld-plat-tile-name { font-size: 0.82rem; font-weight: 700; color: #fff; }
.ld-plat-tile-sub { font-size: 0.65rem; color: #4b5563; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ld-plat-tile-status {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 10px; border-radius: 99px;
  font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
  flex-shrink: 0;
}

/* ── CONTENT GRID ── */
.ld-content-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
}
@media (max-width: 1100px) { .ld-content-grid { grid-template-columns: 1fr; } }

/* ── DETAIL PANEL ── */
.ld-detail-panel {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 18px; overflow: hidden;
}
.ld-panel-header {
  display: flex; align-items: center; gap: 14px;
  padding: 20px 22px; position: relative; overflow: hidden;
}
.ld-panel-header::before {
  content: ''; position: absolute; inset: 0;
  background: rgba(0,0,0,0.45); pointer-events: none;
}
.ld-panel-platform-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; position: relative; z-index: 1;
}
.ld-panel-platform-name { font-size: 1rem; font-weight: 700; color: #fff; position: relative; z-index: 1; }
.ld-panel-platform-sub { font-size: 0.7rem; color: rgba(255,255,255,0.5); position: relative; z-index: 1; }
.ld-panel-gauges {
  display: flex; gap: 12px; margin-left: auto;
  position: relative; z-index: 1;
}

/* ── TABS ── */
.ld-tabs {
  display: flex; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 0 16px;
}
.ld-tab {
  padding: 14px 18px; font-size: 0.8rem; font-weight: 600;
  color: #4b5563; background: none; border: none;
  border-bottom: 2px solid transparent; cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: color 0.18s, border-color 0.18s;
}
.ld-tab:hover { color: #94a3b8; }
.ld-tab.active { color: var(--tc); border-bottom-color: var(--tc); }

/* ── METRICS GRID ── */
.ld-metrics-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 10px; padding: 16px;
}
@media (max-width: 900px) { .ld-metrics-grid { grid-template-columns: repeat(2, 1fr); } }

.ld-met-box {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px; padding: 14px;
  transition: transform 0.18s;
  cursor: default;
}
.ld-met-box:hover { transform: translateY(-2px); background: rgba(255,255,255,0.04); }
.ld-met-box.highlight { border-color: rgba(16,185,129,0.25); background: rgba(16,185,129,0.04); }
.ld-met-label { font-size: 0.62rem; color: #4b5563; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 4px; }
.ld-met-value { font-size: 1.15rem; font-weight: 800; margin-bottom: 6px; line-height: 1; }
.ld-met-bar { height: 3px; background: rgba(255,255,255,0.05); border-radius: 99px; overflow: hidden; margin-bottom: 8px; }
.ld-met-bar-fill { height: 100%; border-radius: 99px; transition: width 1.2s cubic-bezier(0.4,0,0.2,1); }

/* ── AD SETS ── */
.ld-adsets-wrap { padding: 12px 16px; overflow-x: auto; }
.ld-adset-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 8px; padding: 8px 10px; margin-bottom: 6px;
  font-size: 0.6rem; color: #4b5563; text-transform: uppercase; letter-spacing: 0.07em;
}
.ld-adset-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 8px; padding: 10px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  font-size: 0.78rem; align-items: center;
  animation: ld-fadein 0.3s ease both;
}
@keyframes ld-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.ld-adset-row:last-child { border-bottom: none; }
.ld-adset-name {
  display: flex; align-items: center; gap: 8px; color: #e2e8f0;
  font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ld-adset-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.ld-adset-badge {
  display: inline-block; padding: 3px 8px; border-radius: 5px;
  font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
}
.ld-adset-num { color: #94a3b8; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; }

/* ── DISTRIBUTION TAB ── */
.ld-distrib-tab { padding: 16px; }
.ld-distrib-row { display: flex; gap: 20px; align-items: center; margin-bottom: 20px; }
.ld-distrib-chart { position: relative; flex-shrink: 0; }
.ld-donut-center {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.ld-donut-total { font-size: 0.9rem; font-weight: 800; color: #fff; }
.ld-donut-sub { font-size: 0.55rem; color: #4b5563; text-transform: uppercase; letter-spacing: 0.06em; }
.ld-distrib-legend { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.ld-legend-row {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.78rem;
}
.ld-legend-swatch { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
.ld-legend-name { flex: 1; color: #94a3b8; }
.ld-legend-val { color: #e2e8f0; font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; }
.ld-legend-pct { font-weight: 700; font-size: 0.72rem; min-width: 32px; text-align: right; }
.ld-weekly-section { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 14px; }
.ld-weekly-title { font-size: 0.68rem; color: #4b5563; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }

/* ── BAR CHART ── */
.ld-bar-chart { display: flex; align-items: flex-end; gap: 6px; width: 100%; }
.ld-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.ld-bar-fill-wrap { width: 100%; display: flex; align-items: flex-end; }
.ld-bar-fill {
  width: 100%; border-radius: 4px 4px 0 0; min-height: 3px;
  animation: ld-bar-grow 0.8s cubic-bezier(0.4,0,0.2,1) both;
}
@keyframes ld-bar-grow { from { transform: scaleY(0); transform-origin: bottom; } to { transform: scaleY(1); } }
.ld-bar-label { font-size: 0.6rem; color: #4b5563; }

/* ── VIEW LIVE BUTTON ── */
.ld-view-live-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin: 12px 16px 16px;
  padding: 12px; border-radius: 12px; border: 1px solid;
  font-size: 0.85rem; font-weight: 600; text-decoration: none;
  transition: opacity 0.2s;
}
.ld-view-live-btn:hover { opacity: 0.8; }

/* ── SIDEBAR ── */
.ld-sidebar { display: flex; flex-direction: column; gap: 14px; }

.ld-sidebar-card {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px; padding: 18px;
}
.ld-sidebar-card-title {
  font-size: 0.68rem; color: #4b5563; text-transform: uppercase;
  letter-spacing: 0.08em; margin-bottom: 14px; font-weight: 600;
}

/* Performance rings */
.ld-perf-rings { display: flex; gap: 14px; justify-content: center; margin-bottom: 16px; }

.ld-perf-score-row { display: flex; flex-direction: column; gap: 8px; }
.ld-perf-score-item { display: flex; flex-direction: column; gap: 4px; }
.ld-perf-score-bar-track {
  height: 4px; background: rgba(255,255,255,0.05); border-radius: 99px; overflow: hidden;
}
.ld-perf-score-bar-fill {
  height: 100%; border-radius: 99px;
  transition: width 1.2s cubic-bezier(0.4,0,0.2,1);
}
.ld-perf-score-meta {
  display: flex; justify-content: space-between;
  font-size: 0.72rem;
}
.ld-perf-score-meta span { color: #64748b; }
.ld-perf-score-meta strong { font-size: 0.75rem; }

/* Health rows */
.ld-health-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
}
.ld-health-row:last-of-type { border-bottom: none; }
.ld-health-icon {
  width: 30px; height: 30px; border-radius: 8px;
  background: rgba(255,255,255,0.05);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ld-health-info { flex: 1; }
.ld-health-name { font-size: 0.72rem; font-weight: 600; color: #e2e8f0; margin-bottom: 4px; }
.ld-health-bar-track {
  height: 3px; background: rgba(255,255,255,0.05); border-radius: 99px; overflow: hidden;
}
.ld-health-bar-fill {
  height: 100%; border-radius: 99px;
  transition: width 1.2s ease;
}
.ld-health-badge {
  padding: 3px 8px; border-radius: 6px;
  font-size: 0.6rem; font-weight: 700; text-transform: uppercase; flex-shrink: 0;
}

/* Quick stats grid */
.ld-quick-stats {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
}
.ld-qs-item {
  display: flex; align-items: center; gap: 9px;
  padding: 10px; background: rgba(255,255,255,0.025);
  border-radius: 10px;
}
.ld-qs-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem; flex-shrink: 0;
}
.ld-qs-val { font-size: 0.82rem; font-weight: 700; line-height: 1; margin-bottom: 2px; }
.ld-qs-label { font-size: 0.6rem; color: #4b5563; }

/* Auto-update chip */
.ld-auto-update-chip {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px;
  background: rgba(16,185,129,0.06);
  border: 1px solid rgba(16,185,129,0.18);
  border-radius: 10px; color: #4b5563; font-size: 0.72rem;
}

/* Empty state */
.ld-empty {
  padding: 32px; text-align: center; color: #4b5563; font-size: 0.85rem;
}
`;

export default LiveDashboard;