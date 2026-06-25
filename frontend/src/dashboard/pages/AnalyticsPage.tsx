// ─── AnalyticsPage.tsx ───────────────────────────────────────
// Route: /reviews/analytics
//
// Deep performance charts: volume, rating, sentiment trend,
// brand health radar, and topics analysis.
// Data is fetched via Redux → reputationSlice → fetchAnalytics.

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Clock, Target, Award, TrendingUp } from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, RadarChart, Radar,
    PolarGrid, PolarAngleAxis, Line,
} from 'recharts';
import { GlassCard } from '../components/GlassCard';
import { fetchAnalytics } from '../../store/slices/Reputationslice';
import type { AppDispatch, RootState } from '../../store';

// ─── Static radar data (no dedicated endpoint) ────────────────
const radarData = [
    { subject: 'Quality', A: 88 },
    { subject: 'Service', A: 76 },
    { subject: 'Speed', A: 62 },
    { subject: 'Value', A: 71 },
    { subject: 'UX', A: 84 },
    { subject: 'Trust', A: 79 },
];

// ─── Skeleton loader ──────────────────────────────────────────
const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 220 }) => (
    <div
        style={{
            height,
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.04)',
            animation: 'pulse 1.5s ease-in-out infinite',
        }}
    />
);

// ─── Component ────────────────────────────────────────────────
const AnalyticsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    // ── Selectors ──────────────────────────────────────────────
    const { ratingTrend, sentimentTrend, topicBreakdown } = useSelector(
        (s: RootState) => s.reputation.analytics
    );
    const { status, error } = useSelector(
        (s: RootState) => s.reputation.analyticsLoad
    );

    const loading = status === 'loading' || status === 'idle';

    // ── Fetch on mount ─────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchAnalytics("" as any));
    }, [dispatch]);

    // ── Retry handler ──────────────────────────────────────────
    const handleRetry = () => dispatch(fetchAnalytics("" as any));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: 'clamp(14px, 2.5vw, 24px)' }}>

            {/* ── Error banner ── */}
            {error && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#f87171',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <span>⚠</span>
                    <span>{error}</span>
                    <button
                        onClick={handleRetry}
                        style={{
                            marginLeft: 'auto',
                            background: 'none',
                            border: '1px solid rgba(239,68,68,0.4)',
                            color: '#f87171',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                        }}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* ── KPI Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                    { label: 'Avg. Response Time', value: '2.4h', icon: Clock, color: '#7033f5', bg: 'rgba(112,51,245,0.12)', trend: '-18% faster' },
                    { label: 'Conversion Rate', value: '32%', icon: Target, color: '#10b981', bg: 'rgba(16,185,129,0.12)', trend: '+5% this month' },
                    { label: 'NPS Score', value: '68', icon: Award, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', trend: '+4 pts vs last' },
                    { label: 'Review Velocity', value: '+24%', icon: TrendingUp, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', trend: 'vs last quarter' },
                ].map(card => {
                    const Icon = card.icon;
                    return (
                        <GlassCard key={card.label} style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={18} />
                                </div>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{card.label}</span>
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1, marginBottom: '6px' }}>{card.value}</div>
                            <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>↑ {card.trend}</div>
                        </GlassCard>
                    );
                })}
            </div>

            {/* ── Volume & Rating + Radar ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
                <GlassCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Monthly Review Volume & Rating</h3>
                        {loading && <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Loading…</span>}
                    </div>
                    {loading ? (
                        <ChartSkeleton height={220} />
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={ratingTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" stroke="#4b5563" tick={{ fontSize: 11 }} />
                                <YAxis yAxisId="left" stroke="#4b5563" tick={{ fontSize: 11 }} />
                                <YAxis yAxisId="right" orientation="right" domain={[0, 5]} stroke="#4b5563" tick={{ fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                                <Bar yAxisId="left" dataKey="count" fill="#7033f5" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                                <Line yAxisId="right" type="monotone" dataKey="avgRating" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />

                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </GlassCard>

                {/* Radar uses static data — no dedicated endpoint */}
                <GlassCard>
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Brand Health Radar</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.08)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                            <Radar name="Score" dataKey="A" stroke="#7033f5" fill="#7033f5" fillOpacity={0.25} strokeWidth={2} />
                        </RadarChart>
                    </ResponsiveContainer>
                </GlassCard>
            </div>

            {/* ── Sentiment Trend + Topics Analysis ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <GlassCard>
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Sentiment Trend</h3>
                        {loading && <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Loading…</span>}
                    </div>
                    {loading ? (
                        <ChartSkeleton height={200} />
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={sentimentTrend}>
                                <defs>
                                    <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" stroke="#4b5563" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                                <Area type="monotone" dataKey="positive" stroke="#10b981" fill="url(#posGrad)" strokeWidth={2} />
                                <Area type="monotone" dataKey="negative" stroke="#ef4444" fill="url(#negGrad)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </GlassCard>

                <GlassCard>
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Topics Analysis</h3>
                        {loading && <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Loading…</span>}
                    </div>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} style={{ height: '36px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {topicBreakdown.map((t, idx) => (
                                <div key={t.topic ?? (t as any)._id ?? idx}>   {/* ← was: key={t.topic} which can be undefined */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{t.topic ?? (t as any)._id}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>{(t as any).positive}% positive</span>
                                    </div>
                                    <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${(t as any).positive}%`, background: 'linear-gradient(90deg, #10b981, #6366f1)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </GlassCard>
            </div>

            {/* ── Pulse keyframe ── */}
            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
        </div>
    );
};

export default AnalyticsPage;