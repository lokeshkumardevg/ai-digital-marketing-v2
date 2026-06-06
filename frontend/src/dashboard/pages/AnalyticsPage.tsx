// ─── AnalyticsPage.tsx ───────────────────────────────────────
// Route: /reviews/analytics
//
// Deep performance charts: volume, rating, sentiment trend,
// brand health radar, and topics analysis.

import React from 'react';
import { Clock, Target, Award, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, LineChart, Line,
} from 'recharts';
import { GlassCard } from '../components/GlassCard';

// ─── Static chart data ────────────────────────────────────────
const monthlyData = [
  { month: 'Jan', reviews: 42,  rating: 4.1, responses: 35 },
  { month: 'Feb', reviews: 58,  rating: 4.3, responses: 49 },
  { month: 'Mar', reviews: 71,  rating: 4.0, responses: 60 },
  { month: 'Apr', reviews: 65,  rating: 4.4, responses: 58 },
  { month: 'May', reviews: 89,  rating: 4.5, responses: 80 },
  { month: 'Jun', reviews: 102, rating: 4.6, responses: 95 },
];

const sentimentTrend = [
  { month: 'Jan', positive: 62, neutral: 22, negative: 16 },
  { month: 'Feb', positive: 68, neutral: 20, negative: 12 },
  { month: 'Mar', positive: 60, neutral: 25, negative: 15 },
  { month: 'Apr', positive: 72, neutral: 18, negative: 10 },
  { month: 'May', positive: 75, neutral: 17, negative: 8  },
  { month: 'Jun', positive: 78, neutral: 15, negative: 7  },
];

const topicData = [
  { topic: 'Product Quality',  positive: 88, negative: 12 },
  { topic: 'Shipping',         positive: 52, negative: 48 },
  { topic: 'Customer Service', positive: 76, negative: 24 },
  { topic: 'Pricing',          positive: 65, negative: 35 },
  { topic: 'Packaging',        positive: 82, negative: 18 },
];

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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px',padding: 'clamp(14px, 2.5vw, 24px)' }}>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Avg. Response Time', value: '2.4h', icon: Clock,      color: '#7033f5', bg: 'rgba(112,51,245,0.12)', trend: '-18% faster' },
          { label: 'Conversion Rate',    value: '32%',  icon: Target,     color: '#10b981', bg: 'rgba(16,185,129,0.12)', trend: '+5% this month' },
          { label: 'NPS Score',          value: '68',   icon: Award,      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', trend: '+4 pts vs last' },
          { label: 'Review Velocity',    value: '+24%', icon: TrendingUp, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  trend: 'vs last quarter' },
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
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#4b5563" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left"  stroke="#4b5563" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 5]} stroke="#4b5563" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
              <Bar yAxisId="left" dataKey="reviews" fill="#7033f5" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
              <Line yAxisId="right" type="monotone" dataKey="rating" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

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
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sentimentTrend}>
              <defs>
                <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
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
        </GlassCard>

        <GlassCard>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Topics Analysis</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topicData.map(t => (
              <div key={t.topic}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{t.topic}</span>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>{t.positive}% positive</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${t.positive}%`, background: 'linear-gradient(90deg, #10b981, #6366f1)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AnalyticsPage;