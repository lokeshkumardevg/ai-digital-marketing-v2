// ─── AnalyticsPage.tsx ────────────────────────────────────────────────────────
// Route: /reviews/analytics
//
// NEW Backend shape contracts (after patch):
//
// GET /reputation/analytics/rating-trend?brandId=xxx&months=6
// → {
//     data: [{
//       month: "2024-06",
//       avgRating: 4.2,       ← Google only (null if FB-only month)
//       count: 15,            ← Google + FB combined
//       googleCount: 10,
//       fbCount: 5,
//     }],
//     totals: {
//       totalReviews: 120,
//       googleReviews: 80,
//       fbComments: 40,
//       overallAvgRating: 4.1,
//     },
//     isDemoData: false
//   }
//
// GET /reputation/analytics/sentiment-trend?brandId=xxx
// → {
//     data: [{
//       month: "2024-06",
//       positive: 8,          ← Google rating > 3
//       negative: 3,          ← Google rating <= 3
//       neutral: 5,           ← Facebook comments
//       total: 16,
//     }],
//     totals: {
//       totalReviews, googleReviews, fbComments,
//       totalPositive, totalNegative, totalNeutral,
//       positivePct, negativePct,
//     },
//     isDemoData: false
//   }
//
// GET /reputation/analytics/topic-breakdown?brandId=xxx
// → {
//     data: [{
//       _id: "product",
//       total: 42,
//       positive: 30,
//       negative: 12,
//       positivePercent: 71,  ← already calculated by backend
//       negativePercent: 29,
//       avgRating: 4.2,
//       platforms: ["google", "trustpilot"],
//     }],
//     totals: {
//       totalReviews, googleReviews, fbComments,
//       totalPositive, totalNegative, totalTopicMentions,
//       positivePct, negativePct,
//     },
//     isDemoData: false
//   }
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    MessageSquare, Star, ThumbsUp, ThumbsDown,
    Hash, MessageCircle,
} from 'lucide-react';
import {
    AreaChart, Area,
    ComposedChart, Bar, Line,
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    XAxis, YAxis, Tooltip, CartesianGrid,
    ResponsiveContainer, Legend,
} from 'recharts';
import { GlassCard } from '../components/GlassCard';
import { fetchAnalytics } from '../../store/slices/Reputationslice';
import type { AppDispatch, RootState } from '../../store';

// ─── Colors ───────────────────────────────────────────────────
const C = {
    purple : '#7033f5',
    green  : '#10b981',
    red    : '#ef4444',
    amber  : '#f59e0b',
    cyan   : '#06b6d4',
    indigo : '#6366f1',
    blue   : '#3b82f6',
    sub    : '#6b7280',
    muted  : 'rgba(255,255,255,0.06)',
    border : 'rgba(255,255,255,0.08)',
};

const TT = {
    contentStyle: {
        background: '#0f172a',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        fontSize: '12px',
    },
};

// ─── Helpers ──────────────────────────────────────────────────
const fmtMonth = (v: any) => {
    const [y, m] = (v || '').split('-');
    if (!y || !m) return v;
    return new Date(Number(y), Number(m) - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
};

const Skel: React.FC<{ h?: number }> = ({ h = 200 }) => (
    <div style={{ height: h, borderRadius: 8, background: C.muted, animation: 'pulse 1.5s ease-in-out infinite' }} />
);

const Empty: React.FC<{ h?: number; msg?: string }> = ({ h = 200, msg = 'No data yet' }) => (
    <div style={{
        height: h, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: C.sub, fontSize: '0.8rem', gap: 8,
        background: 'rgba(255,255,255,0.02)', borderRadius: 8,
        border: `1px dashed ${C.border}`,
    }}>
        <span style={{ fontSize: '1.5rem' }}>📊</span>
        <span>{msg}</span>
    </div>
);

// ─── Static Radar data ────────────────────────────────────────
const radarData = [
    { subject: 'Quality', A: 88 },
    { subject: 'Service', A: 76 },
    { subject: 'Speed',   A: 62 },
    { subject: 'Value',   A: 71 },
    { subject: 'UX',      A: 84 },
    { subject: 'Trust',   A: 79 },
];

// ─── Component ────────────────────────────────────────────────
const AnalyticsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    // ── Redux selectors ────────────────────────────────────────
    // Slice stores the full API response objects now:
    //   ratingTrend   = { data[], totals }
    //   sentimentTrend= { data[], totals }
    //   topicBreakdown= { data[], totals }
    const { ratingTrend: rtData, sentimentTrend: stData, topicBreakdown: tbDataRaw, ratingTotals: rtTotals, sentimentTotals: stTotals, topicTotals: tbTotals } = useSelector(
        (s: RootState) => s.reputation.analytics
    );
    const { status, error } = useSelector(
        (s: RootState) => s.reputation.analyticsLoad
    );

    const loading = status === 'loading' || status === 'idle';

    useEffect(() => { dispatch(fetchAnalytics("" as any)); }, [dispatch]);
    const handleRetry = () => dispatch(fetchAnalytics("" as any));

    // rtData, stData, tbDataRaw and rtTotals/stTotals/tbTotals come straight
    // from Redux state now — no further unwrapping needed, the slice's
    // fetchAnalytics.fulfilled reducer already separates data[] from totals.
    const tbData = tbDataRaw;

    // ──────────────────────────────────────────────────────────
    // sentimentTrend: backend now returns already-pivoted rows
    //   { month, positive, negative, neutral, total }
    // But also handle OLD shape { _id:{year,month,sentiment}, count }
    // ──────────────────────────────────────────────────────────
    const sentimentData = useMemo(() => {
        if (!stData.length) return [];

        // Detect shape: if first row has .month → already pivoted
        if ((stData[0] as any).month) return stData as any[];

        // OLD shape — pivot manually
        const map: Record<string, { month: string; positive: number; negative: number; neutral: number; total: number }> = {};
        stData.forEach((row: any) => {
            if (!row._id || typeof row._id !== 'object') return;
            const { year, month, sentiment } = row._id;
            const key = `${year}-${String(month).padStart(2, '0')}`;
            if (!map[key]) map[key] = { month: key, positive: 0, negative: 0, neutral: 0, total: 0 };
            if (sentiment === 'positive')      map[key].positive += row.count;
            else if (sentiment === 'negative') map[key].negative += row.count;
            else                               map[key].neutral  += row.count;
            map[key].total += row.count;
        });
        return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
    }, [stData]);

    // ──────────────────────────────────────────────────────────
    // topicBreakdown: backend now sends positivePercent/negativePercent
    // Fallback: compute if missing
    // ──────────────────────────────────────────────────────────
    const topicsData = useMemo(() => {
        return tbData.map((t: any) => ({
            topic           : t._id ?? t.topic ?? 'Unknown',
            total           : t.total ?? 0,
            positive        : t.positive ?? 0,
            negative        : t.negative ?? 0,
            positivePercent : t.positivePercent ?? (t.total > 0 ? Math.round((t.positive / t.total) * 100) : 0),
            negativePercent : t.negativePercent ?? (t.total > 0 ? Math.round((t.negative / t.total) * 100) : 0),
            avgRating       : t.avgRating ?? null,
            platforms       : t.platforms ?? [],
        }));
    }, [tbData]);

    // ──────────────────────────────────────────────────────────
    // KPI values — ALWAYS sourced from `totals` (backend-computed,
    // reliable even when `data[]` is sparse/empty — e.g. topic-breakdown
    // can return totals with real numbers while data:[] is empty).
    //
    // Each of the 3 endpoints independently returns the same overall
    // totalReviews/googleReviews/fbComments, so we cross-fallback across
    // them — prefer ratingTrend.totals for rating-specific figures,
    // sentimentTrend.totals for sentiment %, topicBreakdown.totals as a
    // last-resort fallback for review counts.
    // ──────────────────────────────────────────────────────────
    const totalReviews     = rtTotals?.totalReviews    ?? stTotals?.totalReviews    ?? tbTotals?.totalReviews    ?? 0;
    const googleReviews    = rtTotals?.googleReviews   ?? stTotals?.googleReviews   ?? tbTotals?.googleReviews   ?? 0;
    const fbComments       = rtTotals?.fbComments      ?? stTotals?.fbComments      ?? tbTotals?.fbComments      ?? 0;
    const overallAvgRating = rtTotals?.overallAvgRating ?? 0;

    const positivePct      = stTotals?.positivePct ?? tbTotals?.positivePct ?? 0;
    const negativePct      = stTotals?.negativePct ?? tbTotals?.negativePct ?? 0;
    const totalPositive    = stTotals?.totalPositive ?? tbTotals?.totalPositive ?? 0;
    const totalNegative    = stTotals?.totalNegative ?? tbTotals?.totalNegative ?? 0;
    const totalNeutral     = stTotals?.totalNeutral  ?? 0;

    const totalTopicMentions = tbTotals?.totalTopicMentions ?? 0;
    const topTopicName     = topicsData[0]?.topic ?? '—';

    // Month-over-month growth from ratingTrend data — only meaningful
    // when we have at least 2 months of data; otherwise hide the badge
    const hasGrowthData = rtData.length >= 2;
    const lastCount = rtData[rtData.length - 1]?.count ?? 0;
    const prevCount = rtData[rtData.length - 2]?.count ?? 0;
    const growthPct = hasGrowthData && prevCount > 0
        ? Math.round(((lastCount - prevCount) / prevCount) * 100)
        : 0;

    // ── KPI Cards ──────────────────────────────────────────────
    const kpis = [
        {
            label : 'Total Reviews',
            value : loading ? null : totalReviews.toLocaleString(),
            sub   : loading ? null : `Google ${googleReviews.toLocaleString()} · FB ${fbComments.toLocaleString()}`,
            icon  : MessageSquare,
            color : C.purple,
            bg    : 'rgba(112,51,245,0.12)',
            badge : loading ? null : (hasGrowthData && growthPct !== 0)
                ? { text: `${growthPct > 0 ? '+' : ''}${growthPct}% MoM`, color: growthPct >= 0 ? C.green : C.red }
                : null,
        },
        {
            label : 'Avg. Rating',
            value : loading ? null : overallAvgRating > 0 ? `${overallAvgRating} ★` : '—',
            sub   : loading ? null : 'Google reviews only',
            icon  : Star,
            color : C.amber,
            bg    : 'rgba(245,158,11,0.12)',
            badge : null,
        },
        {
            label : 'Positive Sentiment',
            value : loading ? null : `${positivePct}%`,
            sub   : loading ? null : `${totalPositive.toLocaleString()} positive reviews`,
            icon  : ThumbsUp,
            color : C.green,
            bg    : 'rgba(16,185,129,0.12)',
            badge : null,
        },
        {
            label : 'Negative Sentiment',
            value : loading ? null : `${negativePct}%`,
            sub   : loading ? null : `${totalNegative.toLocaleString()} negative reviews`,
            icon  : ThumbsDown,
            color : C.red,
            bg    : 'rgba(239,68,68,0.12)',
            badge : null,
        },
        {
            label : 'FB Comments',
            value : loading ? null : fbComments.toLocaleString(),
            sub   : loading ? null : `${totalNeutral.toLocaleString()} in neutral bucket`,
            icon  : MessageCircle,
            color : '#1877F2',
            bg    : 'rgba(24,119,242,0.12)',
            badge : null,
        },
        {
            label : 'Top Topic',
            value : loading ? null : topTopicName,
            sub   : loading ? null : (topicsData.length > 0
                ? `${topicsData[0].total} mentions · ${topicsData[0].positivePercent}% positive`
                : `${totalTopicMentions.toLocaleString()} total mentions`),
            icon  : Hash,
            color : C.cyan,
            bg    : 'rgba(6,182,212,0.12)',
            badge : null,
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 'clamp(14px, 2.5vw, 24px)' }}>

            {/* ── Error banner ── */}
            {error && (
                <div style={{
                    padding: '12px 16px', borderRadius: 8,
                    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#f87171', fontSize: '0.85rem',
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <span>⚠</span><span>{error}</span>
                    <button onClick={handleRetry} style={{
                        marginLeft: 'auto', background: 'none',
                        border: '1px solid rgba(239,68,68,0.4)', color: '#f87171',
                        padding: '3px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem',
                    }}>Retry</button>
                </div>
            )}

            {/* ══════════════════════════════════════════════
                ROW 1 — 6 KPI Cards
            ══════════════════════════════════════════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
                {kpis.map(k => {
                    const Icon = k.icon;
                    return (
                        <GlassCard key={k.label} style={{ padding: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <div style={{
                                    width: 34, height: 34, borderRadius: 9,
                                    background: k.bg, color: k.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <Icon size={16} />
                                </div>
                                {k.badge && !loading && (
                                    <span style={{
                                        fontSize: '0.6rem', fontWeight: 700,
                                        color: k.badge.color,
                                        background: `${k.badge.color}18`,
                                        padding: '2px 6px', borderRadius: 6,
                                    }}>{k.badge.text}</span>
                                )}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 6 }}>
                                {k.label}
                            </div>
                            {loading ? (
                                <Skel h={36} />
                            ) : (
                                <>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1, marginBottom: 5, color: k.color }}>
                                        {k.value}
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: C.sub, lineHeight: 1.3 }}>
                                        {k.sub}
                                    </div>
                                </>
                            )}
                        </GlassCard>
                    );
                })}
            </div>

            {/* ══════════════════════════════════════════════
                ROW 2 — Monthly Volume + Avg Rating (ComposedChart)
                       + Radar
            ══════════════════════════════════════════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
                <GlassCard>
                    <div style={{ marginBottom: 20 }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Monthly Volume & Avg Rating</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            Purple bars = Google + FB combined · Amber line = avg rating (Google only, right axis)
                        </p>
                    </div>
                    {loading ? (
                        <Skel h={220} />
                    ) : rtData.length === 0 ? (
                        <Empty h={220} />
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <ComposedChart data={rtData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" stroke="#4b5563" tick={{ fontSize: 10 }} tickFormatter={fmtMonth} />
                                <YAxis yAxisId="left"  stroke="#4b5563" tick={{ fontSize: 11 }} allowDecimals={false} />
                                <YAxis yAxisId="right" orientation="right" domain={[0, 5]} stroke="#4b5563" tick={{ fontSize: 11 }} />
                                <Tooltip
                                    {...TT}
                                    formatter={(v: any, name: any) => {
                                        if (name === 'avgRating') return [v != null ? `${v} ★` : 'N/A', 'Avg Rating (Google)'];
                                        if (name === 'googleCount') return [v, 'Google Reviews'];
                                        if (name === 'fbCount')     return [v, 'FB Comments'];
                                        return [v, name];
                                    }}
                                    labelFormatter={fmtMonth}
                                />
                                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                                {/* Stacked bars: google (purple) + fb (blue) */}
                                <Bar yAxisId="left" dataKey="googleCount" stackId="a" fill={C.purple} fillOpacity={0.85} radius={[0, 0, 0, 0]} maxBarSize={36} name="googleCount" />
                                <Bar yAxisId="left" dataKey="fbCount"     stackId="a" fill="#1877F2"  fillOpacity={0.7}  radius={[4, 4, 0, 0]} maxBarSize={36} name="fbCount" />
                                <Line yAxisId="right" type="monotone" dataKey="avgRating" stroke={C.amber} strokeWidth={2}
                                    dot={{ fill: C.amber, r: 3 }} connectNulls={false} name="avgRating" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
                </GlassCard>

                {/* Radar — static brand health */}
                <GlassCard>
                    <div style={{ marginBottom: 20 }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Brand Health Radar</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            Composite quality dimension scores
                        </p>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.08)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                            <Radar name="Score" dataKey="A" stroke={C.purple} fill={C.purple} fillOpacity={0.25} strokeWidth={2} />
                            <Tooltip {...TT} formatter={(v: any) => [`${v}/100`, 'Score']} />
                        </RadarChart>
                    </ResponsiveContainer>
                </GlassCard>
            </div>

            {/* ══════════════════════════════════════════════
                ROW 3 — Sentiment Trend + Source Summary
            ══════════════════════════════════════════════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
                <GlassCard>
                    <div style={{ marginBottom: 20 }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Sentiment Trend</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            Green = positive (rating &gt;3) · Red = negative (rating ≤3) · Amber = FB comments (unrated)
                        </p>
                    </div>
                    {loading ? (
                        <Skel h={200} />
                    ) : sentimentData.length === 0 ? (
                        <Empty h={200} />
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={sentimentData}>
                                <defs>
                                    <linearGradient id="posG" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor={C.green} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="negG" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor={C.red} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="neutG" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor={C.amber} stopOpacity={0.25} />
                                        <stop offset="95%" stopColor={C.amber} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" stroke="#4b5563" tick={{ fontSize: 10 }} tickFormatter={fmtMonth} />
                                <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} allowDecimals={false} />
                                <Tooltip
                                    {...TT}
                                    formatter={(v: any, name: any) => {
                                        const l: Record<string, string> = {
                                            positive: '✅ Positive (Google)',
                                            negative: '❌ Negative (Google)',
                                            neutral : '⚪ FB Comments',
                                        };
                                        return [v, l[name] || name];
                                    }}
                                    labelFormatter={fmtMonth}
                                />
                                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                                <Area type="monotone" dataKey="positive" stroke={C.green} fill="url(#posG)"  strokeWidth={2} name="positive" />
                                <Area type="monotone" dataKey="negative" stroke={C.red}   fill="url(#negG)"  strokeWidth={2} name="negative" />
                                {sentimentData.some((d: any) => d.neutral > 0) && (
                                    <Area type="monotone" dataKey="neutral" stroke={C.amber} fill="url(#neutG)" strokeWidth={1.5} strokeDasharray="4 2" name="neutral" />
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </GlassCard>

                {/* Sentiment + Source summary from totals */}
                <GlassCard style={{ padding: 24 }}>
                    <h3 style={{ margin: '0 0 18px', fontSize: '1rem', fontWeight: 600 }}>Sentiment Summary</h3>
                    {loading ? <Skel h={200} /> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* Positive */}
                            <div style={{
                                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                                borderRadius: 10, padding: '14px 16px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: C.sub, marginBottom: 4 }}>✅ Positive</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: C.green, lineHeight: 1 }}>{positivePct}%</div>
                                    <div style={{ fontSize: '0.65rem', color: C.sub, marginTop: 3 }}>{totalPositive.toLocaleString()} reviews · rating &gt;3</div>
                                </div>
                                <ThumbsUp size={28} color={C.green} strokeWidth={1.5} />
                            </div>

                            {/* Negative */}
                            <div style={{
                                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: 10, padding: '14px 16px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: C.sub, marginBottom: 4 }}>❌ Negative</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: C.red, lineHeight: 1 }}>{negativePct}%</div>
                                    <div style={{ fontSize: '0.65rem', color: C.sub, marginTop: 3 }}>{totalNegative.toLocaleString()} reviews · rating ≤3</div>
                                </div>
                                <ThumbsDown size={28} color={C.red} strokeWidth={1.5} />
                            </div>

                            {/* FB Neutral */}
                            <div style={{
                                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                                borderRadius: 10, padding: '14px 16px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: C.sub, marginBottom: 4 }}>⚪ FB Comments</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: C.amber, lineHeight: 1 }}>{totalNeutral.toLocaleString()}</div>
                                    <div style={{ fontSize: '0.65rem', color: C.sub, marginTop: 3 }}>unrated — neutral bucket</div>
                                </div>
                                <MessageCircle size={28} color="#1877F2" strokeWidth={1.5} />
                            </div>
                        </div>
                    )}
                </GlassCard>
            </div>

            {/* ══════════════════════════════════════════════
                ROW 4 — Topic Breakdown
            ══════════════════════════════════════════════ */}
            <GlassCard>
                <div style={{ marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Topic Analysis</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        Top {topicsData.length} topics · mention count · positive % · negative % · avg rating · platforms
                        {tbTotals && !loading && (
                            <span style={{ marginLeft: 12, color: C.sub }}>
                                ({tbTotals.totalTopicMentions?.toLocaleString()} total mentions across {tbTotals.googleReviews?.toLocaleString()} Google reviews)
                            </span>
                        )}
                    </p>
                </div>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[1, 2, 3, 4, 5].map(i => <Skel key={i} h={42} />)}
                    </div>
                ) : topicsData.length === 0 ? (
                    <Empty h={160} msg="No topic data yet" />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {topicsData.map((t, idx) => (
                            <div key={t.topic + idx}>
                                {/* Header row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'capitalize' }}>
                                            {t.topic}
                                        </span>
                                        {/* mention count badge */}
                                        <span style={{
                                            fontSize: '0.62rem', color: 'var(--text-secondary)',
                                            background: C.muted, padding: '2px 7px', borderRadius: 10,
                                        }}>{t.total} mentions</span>
                                        {/* avg rating badge */}
                                        {t.avgRating != null && (
                                            <span style={{
                                                fontSize: '0.62rem', color: C.amber,
                                                background: 'rgba(245,158,11,0.1)', padding: '2px 7px', borderRadius: 10,
                                            }}>★ {t.avgRating}</span>
                                        )}
                                        {/* platforms */}
                                        {t.platforms.length > 0 && t.platforms.map((p: string) => (
                                            <span key={p} style={{
                                                fontSize: '0.58rem', color: C.sub,
                                                background: C.muted, padding: '2px 6px', borderRadius: 8,
                                                textTransform: 'capitalize',
                                            }}>{p}</span>
                                        ))}
                                    </div>
                                    {/* positive / negative % */}
                                    <div style={{ display: 'flex', gap: 10, fontSize: '0.72rem', fontWeight: 700 }}>
                                        <span style={{ color: C.green }}>✅ {t.positivePercent}%</span>
                                        <span style={{ color: C.red   }}>❌ {t.negativePercent}%</span>
                                        <span style={{ color: C.sub,  fontSize: '0.65rem' }}>
                                            {t.positive}↑ {t.negative}↓
                                        </span>
                                    </div>
                                </div>

                                {/* Stacked bar */}
                                <div style={{ height: 7, borderRadius: 4, background: C.muted, overflow: 'hidden', display: 'flex' }}>
                                    <div style={{
                                        height: '100%', width: `${t.positivePercent}%`,
                                        background: `linear-gradient(90deg, ${C.green}, ${C.indigo})`,
                                        transition: 'width 0.6s ease',
                                    }} />
                                    <div style={{
                                        height: '100%', width: `${t.negativePercent}%`,
                                        background: 'rgba(239,68,68,0.55)',
                                        transition: 'width 0.6s ease',
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>

            <style>{`
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
                ::-webkit-scrollbar{width:4px}
                ::-webkit-scrollbar-track{background:transparent}
                ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
            `}</style>
        </div>
    );
};

export default AnalyticsPage;