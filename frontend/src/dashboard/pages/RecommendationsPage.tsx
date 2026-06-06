// ─── RecommendationsPage.tsx ─────────────────────────────────
// Route: /reviews/recommendations
//
// AI-powered action cards with expandable suggested steps.

import React, { useState } from 'react';
import { Lightbulb, AlertCircle, TrendingUp, ChevronRight, ArrowUpRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

// ─── Data ─────────────────────────────────────────────────────
const recommendations = [
  {
    id: 'r1',
    priority: 'High',
    priorityColor: '#ef4444',
    priorityBg: 'rgba(239,68,68,0.1)',
    icon: '🚚',
    title: 'Address Shipping Complaints',
    description: 'Shipping-related negative mentions have risen 24% this month. Proactively reach out to affected customers with apologies and compensation offers to turn detractors into promoters.',
    impact: 'High Impact',
    impactColor: '#ef4444',
    effort: 'Medium Effort',
    effortColor: '#f59e0b',
    actions: [
      'Send apology emails to 1-star reviewers mentioning shipping',
      'Update shipping policy page',
      'Create automated delay notification',
    ],
    metric: '+12% satisfaction est.',
  },
  {
    id: 'r2',
    priority: 'High',
    priorityColor: '#10b981',
    priorityBg: 'rgba(16,185,129,0.1)',
    icon: '⭐',
    title: 'Launch Review Request Campaign',
    description: "Your review conversion rate is 32% — above industry average. Capitalize on this by sending a targeted review request to the 180 customers who haven't been contacted yet.",
    impact: 'High Impact',
    impactColor: '#10b981',
    effort: 'Low Effort',
    effortColor: '#10b981',
    actions: [
      'Send bulk review request to pending customers',
      'Set up automated post-purchase email',
      'A/B test subject lines',
    ],
    metric: '+45 reviews est.',
  },
  {
    id: 'r3',
    priority: 'Medium',
    priorityColor: '#f59e0b',
    priorityBg: 'rgba(245,158,11,0.1)',
    icon: '💬',
    title: 'Improve Response Rate on Facebook',
    description: 'Your Facebook review response rate (41%) lags behind Google (89%). Responding to all reviews signals engagement and is proven to improve ratings over time.',
    impact: 'Medium Impact',
    impactColor: '#6366f1',
    effort: 'Low Effort',
    effortColor: '#10b981',
    actions: [
      'Enable AI auto-reply for Facebook',
      'Respond to all unanswered Facebook reviews',
      'Create Facebook-specific reply templates',
    ],
    metric: '+0.3 avg rating est.',
  },
  {
    id: 'r4',
    priority: 'Medium',
    priorityColor: '#7033f5',
    priorityBg: 'rgba(112,51,245,0.1)',
    icon: '🎯',
    title: 'Leverage Product Quality Praise',
    description: 'Product quality is your #1 praised attribute (88% positive). Feature these reviews prominently on your website and use them in marketing materials to drive conversion.',
    impact: 'Medium Impact',
    impactColor: '#6366f1',
    effort: 'Low Effort',
    effortColor: '#10b981',
    actions: [
      'Add review widget to product pages',
      'Create social proof graphics from top reviews',
      'Request permission to feature reviews in ads',
    ],
    metric: '+8% conversion est.',
  },
];

// ─── Component ────────────────────────────────────────────────
const RecommendationsPage: React.FC = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const highPriorityCount = recommendations.filter(r => r.priority === 'High').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: 'clamp(14px, 2.5vw, 24px)'}}>

      {/* ── Summary KPI row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Actions Available', value: recommendations.length, icon: Lightbulb,    color: '#7033f5', bg: 'rgba(112,51,245,0.12)' },
          { label: 'High Priority',     value: highPriorityCount,       icon: AlertCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
          { label: 'Est. Reviews Gain', value: '+45',                   icon: TrendingUp,  color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <GlassCard key={card.label} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{card.label}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{card.value}</div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* ── Recommendation cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {recommendations.map(rec => (
          <GlassCard
            key={rec.id}
            style={{
              padding: '24px', cursor: 'pointer',
              border: activeCard === rec.id ? '1px solid rgba(112,51,245,0.4)' : '1px solid rgba(255,255,255,0.06)',
            }}
            onClick={() => setActiveCard(activeCard === rec.id ? null : rec.id)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ fontSize: '28px', flexShrink: 0 }}>{rec.icon}</div>

              <div style={{ flex: 1 }}>
                {/* Title + badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{rec.title}</h3>
                  <span style={{ background: rec.priorityBg, color: rec.priorityColor, padding: '2px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
                    {rec.priority} Priority
                  </span>
                  <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '2px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600 }}>
                    {rec.metric}
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {rec.description}
                </p>

                {/* Expanded actions */}
                {activeCard === rec.id && (
                  <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Suggested Actions
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {rec.actions.map((action, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(112,51,245,0.15)', color: '#7033f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <span style={{ fontSize: '0.82rem', color: '#e5e7eb' }}>{action}</span>
                          <button
                            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                            onClick={e => e.stopPropagation()}
                          >
                            Do it <ArrowUpRight size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right-side labels + chevron */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0, alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.72rem', color: rec.impactColor, background: `${rec.impactColor}18`, padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>{rec.impact}</span>
                <span style={{ fontSize: '0.72rem', color: rec.effortColor, background: `${rec.effortColor}18`, padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>{rec.effort}</span>
                <ChevronRight size={16} color="#4b5563" style={{ transform: activeCard === rec.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsPage;