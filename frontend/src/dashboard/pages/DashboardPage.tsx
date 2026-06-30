// ─── DashboardPage.tsx ───────────────────────────────────────
// Route: /reviews/dashboard
//
// Displays KPI stat cards, area/pie/bar charts, and AI insights.
// Data fetched via Redux → reputationSlice → fetchDashboardStats.

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  RefreshCw, AlertCircle, MessageSquare, Star,
  ThumbsUp, ThumbsDown, Send, TrendingUp, Sparkles,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { GlassCard } from '../components/GlassCard';
import { PLATFORM_META } from '../components/Reviewhelpers';
import { fetchDashboardStats } from '../../store/slices/Reputationslice';
import type { AppDispatch, RootState } from '../../store';

// ─── Responsive styles injected once ─────────────────────────
const RESPONSIVE_CSS = `
  .dash-kpi-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: clamp(10px, 1.5vw, 16px);
  }
  @media (max-width: 1100px) { .dash-kpi-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 600px)  { .dash-kpi-grid { grid-template-columns: repeat(2, 1fr); } }

  .dash-row2 {
    display: grid;
    grid-template-columns: 1.8fr 1fr;
    gap: clamp(14px, 2.5vw, 24px);
  }
  @media (max-width: 820px) { .dash-row2 { grid-template-columns: 1fr; } }

  .dash-row3 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(14px, 2.5vw, 24px);
  }
  @media (max-width: 700px) { .dash-row3 { grid-template-columns: 1fr; } }

  .dash-insights {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  @media (max-width: 900px) { .dash-insights { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 500px) { .dash-insights { grid-template-columns: 1fr; } }

  .dash-platform-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  @media (max-width: 420px) { .dash-platform-grid { grid-template-columns: 1fr; } }

  .dash-pie-row {
    display: flex;
    gap: 20px;
    align-items: center;
  }
  @media (max-width: 380px) {
    .dash-pie-row { flex-direction: column; align-items: flex-start; }
  }

  .dash-kpi-value {
    font-size: clamp(1.15rem, 2.2vw, 1.6rem);
    font-weight: 700;
    line-height: 1;
    margin-bottom: 8px;
  }
  .dash-kpi-label {
    font-size: clamp(0.62rem, 1.1vw, 0.72rem);
    font-weight: 500;
    line-height: 1.2;
  }
  .dash-card-title {
    margin: 0;
    font-size: clamp(0.84rem, 1.4vw, 1rem);
    font-weight: 600;
  }
`;

let cssInjected = false;
function injectCSS() {
  if (cssInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = RESPONSIVE_CSS;
  document.head.appendChild(style);
  cssInjected = true;
}

// ─── Component ───────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  injectCSS();

  const dispatch = useDispatch<AppDispatch>();

  // ── Selectors ──────────────────────────────────────────────
  const stats        = useSelector((s: RootState) => s.reputation.dashboardStats);
  const dashLoad     = useSelector((s: RootState) => s.reputation.dashboardLoad);
  const { user }     = useSelector((s: RootState) => (s as any).auth);
  const { activeBrandId } = useSelector((s: any) => s.workspace);
  const brandId: string = activeBrandId || user?.id || 'demo';
  const isLoading = dashLoad.status === 'idle' || dashLoad.status === 'loading';
  const isError   = dashLoad.status === 'failed';

  // ── Fetch on mount ─────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchDashboardStats({ brandId }));
  }, [dispatch, brandId]);

  const handleRetry = () => dispatch(fetchDashboardStats({ brandId }));

  const tooltipStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    fontSize: '12px',
  };

  // ── Loading ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'var(--accent-primary)' }}>
          <RefreshCw size={36} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────
  if (isError || !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <AlertCircle size={36} style={{ marginBottom: '12px', color: '#ef4444' }} />
          <p>{dashLoad.error || 'Failed to load dashboard stats.'}</p>
          <button
            onClick={handleRetry}
            style={{ marginTop: '12px', background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Derived data ──────────────────────────────────────────
  const STAT_CARDS = [
    { label: 'Total Reviews',      value: stats.totalReviews.toLocaleString(), icon: MessageSquare, color: '#7033f5', bg: 'rgba(112,51,245,0.12)', trend: '+18.6%', trendUp: true  },
    { label: 'Average Rating',     value: `${stats.averageRating} ★`,          icon: Star,          color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', trend: '+0.2',   trendUp: true  },
    { label: 'Positive Sentiment', value: `${stats.positiveSentiment}%`,       icon: ThumbsUp,      color: '#10b981', bg: 'rgba(16,185,129,0.12)', trend: '+6.3%',  trendUp: true  },
    { label: 'Negative Sentiment', value: `${stats.negativeSentiment}%`,       icon: ThumbsDown,    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  trend: '-2.1%',  trendUp: false },
    { label: 'Response Rate',      value: `${stats.responseRate}%`,            icon: Send,          color: '#6366f1', bg: 'rgba(99,102,241,0.12)', trend: '+5.7%',  trendUp: true  },
    { label: 'Review Growth',      value: `+${stats.reviewGrowth}%`,           icon: TrendingUp,    color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  trend: '+24%',   trendUp: true  },
  ];

  const platformData = Object.entries(stats.byPlatform || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: PLATFORM_META[name]?.color || '#7033f5',
  }));

  const ratingData = [1, 2, 3, 4, 5].map(r => ({
    star: `${r} Star`,
    count: (stats.ratingDistribution as Record<string, number>)?.[r] || 0,
  }));

  const trendData = (stats.trend || []).map(t => ({
    date:    t._id,
    reviews: t.count,
    rating:  Math.round(t.avgRating * 10) / 10,
  }));

  const RATING_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981'];

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2.5vw, 24px)', padding: 'clamp(14px, 2.5vw, 24px)' }}>

      {/* ── KPI Stat Cards ── */}
      <div className="dash-kpi-grid">
        {STAT_CARDS.map(card => {
          const Icon = card.icon;
          return (
            <GlassCard key={card.label} style={{ padding: 'clamp(14px, 2vw, 20px)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', flexShrink: 0, borderRadius: '10px', background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={17} />
                </div>
                <span className="dash-kpi-label" style={{ color: 'var(--text-secondary)', paddingTop: '2px' }}>
                  {card.label}
                </span>
              </div>
              <div className="dash-kpi-value">{card.value}</div>
              <div style={{ fontSize: '0.68rem', color: card.trendUp ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                {card.trendUp ? '↑' : '↓'} {card.trend} vs last period
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* ── Reviews Over Time + Platform Breakdown ── */}
      <div className="dash-row2">

        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 className="dash-card-title">Reviews Over Time</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '4px 12px', borderRadius: '20px' }}>Daily</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="reviewGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7033f5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7033f5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#4b5563" tick={{ fontSize: 10 }} interval="preserveStartEnd" tickCount={6} />
              <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} width={32} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="reviews" stroke="#7033f5" fill="url(#reviewGradient)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <div style={{ marginBottom: '20px' }}>
            <h3 className="dash-card-title">Reviews by Platform</h3>
          </div>
          <div className="dash-pie-row">
            <ResponsiveContainer width="45%" height={130}>
              <PieChart>
                <Pie data={platformData} dataKey="value" innerRadius={35} outerRadius={55} strokeWidth={0}>
                  {platformData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {platformData.map(p => (
                <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{(p.value as number).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

      </div>

      {/* ── Ratings Distribution + Platform Overview ── */}
      <div className="dash-row3">

        <GlassCard>
          <div style={{ marginBottom: '20px' }}>
            <h3 className="dash-card-title">Ratings Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ratingData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="star" stroke="#4b5563" tick={{ fontSize: 10 }} />
              <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} width={32} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {ratingData.map((_, i) => <Cell key={i} fill={RATING_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <div style={{ marginBottom: '16px' }}>
            <h3 className="dash-card-title">Platform Overview</h3>
          </div>
          <div className="dash-platform-grid">
            {Object.entries(stats.byPlatform || {}).map(([platform, count]) => {
              const meta = PLATFORM_META[platform];
              return (
                <div key={platform} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '14px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: meta?.bg, color: meta?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                      {meta?.icon}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: meta?.color }}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </span>
                  </div>
                  <div style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)', fontWeight: 700 }}>
                    {(count as number).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#10b981', marginTop: '4px' }}>↑ 12% vs last month</div>
                </div>
              );
            })}
          </div>
        </GlassCard>

      </div>

      {/* ── AI Insights ── */}
<GlassCard>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
    <Sparkles size={18} color="#f59e0b" />
    <h3 className="dash-card-title">AI Insights</h3>
    <span style={{ 
      fontSize: '0.6rem', 
      color: 'var(--accent-primary)', 
      background: 'rgba(245, 158, 11, 0.15)',
      padding: '2px 10px',
      borderRadius: '12px',
      fontWeight: '500',
      letterSpacing: '0.3px',
      textTransform: 'uppercase'
    }}>
      Coming Soon
    </span>
    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer' }}>View all</span>
  </div>
        {/* <div className="dash-insights">
          {[
            { icon: '🚚', title: 'Shipping complaints increased 24%',    sub: 'Compared to last month',                color: '#ef4444', bg: 'rgba(239,68,68,0.07)'   },
            { icon: '❤️', title: 'Customers love your product quality',  sub: 'Positive mentions increased 18%',       color: '#10b981', bg: 'rgba(16,185,129,0.07)'  },
            { icon: '⚡', title: 'Great opportunity to ask for reviews', sub: 'Review conversion rate is 32%',         color: '#f59e0b', bg: 'rgba(245,158,11,0.07)'  },
            { icon: '🤖', title: 'New AI suggested campaign ready',      sub: 'Increase reviews for summer collection', color: '#7033f5', bg: 'rgba(112,51,245,0.07)' },
          ].map(insight => (
            <div
              key={insight.title}
              style={{ background: insight.bg, borderRadius: '12px', padding: 'clamp(12px, 2vw, 16px)', border: `1px solid ${insight.color}22` }}
            >
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>{insight.icon}</div>
              <div style={{ fontSize: 'clamp(0.72rem, 1.2vw, 0.82rem)', fontWeight: 600, marginBottom: '4px', lineHeight: 1.35 }}>{insight.title}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{insight.sub}</div>
              <button style={{ marginTop: '12px', fontSize: '0.68rem', color: insight.color, background: 'transparent', border: `1px solid ${insight.color}44`, borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>
                View details
              </button>
            </div>
          ))}
        </div> */}
      </GlassCard>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default DashboardPage;