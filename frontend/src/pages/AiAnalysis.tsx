import React from 'react';
import { BrainCircuit, TrendingUp, AlertTriangle, Lightbulb, CheckCircle, ArrowUpRight, ChevronRight } from 'lucide-react';

const phases = [
  {
    number: 1,
    title: 'Insights Phase',
    subtitle: 'Understand market, competitors and products',
    cards: [
      {
        icon: '📊', color: '#dbeafe', iconBg: '#bfdbfe', title: 'Market Research',
        desc: 'Market size, regional analysis, competitive landscape, market segments',
        tags: ['Market Size', 'Regional Analysis', 'Trends'],
      },
      {
        icon: '⚡', color: '#fef3c7', iconBg: '#fde68a', title: 'Competitor Analysis',
        desc: 'Competitor positioning, product comparison, marketing strategy, differentiation',
        tags: ['Brand Comparison', 'Strategy', 'Differentiation'],
      },
    ],
  },
  {
    number: 2,
    title: 'Strategy Phase',
    subtitle: 'Define target audience and campaign plan',
    cards: [
      {
        icon: '🎯', color: '#f0fdf4', iconBg: '#bbf7d0', title: 'Audience Targeting',
        desc: 'Identify ideal customer profiles, demographic targeting, interest-based segmentation',
        tags: ['Demographics', 'Interests', 'Lookalikes'],
      },
      {
        icon: '📋', color: '#fdf4ff', iconBg: '#e9d5ff', title: 'Campaign Strategy',
        desc: 'Define campaign goals, budget allocation, platform selection and timeline',
        tags: ['Goals', 'Budget', 'Timeline'],
      },
    ],
  },
  {
    number: 3,
    title: 'Creative Phase',
    subtitle: 'Generate and optimize ad creatives',
    cards: [
      {
        icon: '✏️', color: '#fff7ed', iconBg: '#fed7aa', title: 'Copy Generation',
        desc: 'AI-powered ad copy tailored to your brand voice and target audience',
        tags: ['Headlines', 'Body Copy', 'CTAs'],
      },
      {
        icon: '🖼️', color: '#f0f9ff', iconBg: '#bae6fd', title: 'Creative Testing',
        desc: 'A/B test variations, analyze performance, iterate on winning creatives',
        tags: ['A/B Testing', 'Performance', 'Iteration'],
      },
    ],
  },
];

export const AiAnalysis: React.FC = () => {
  return (
    <div style={{ minHeight: '100%', background: '#f5f6fa' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8eaf0', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '3px' }}>Analytics</div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>AI Analysis</h1>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>AI-driven analysis and recommendations</div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
          View History Records
        </button>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Brand Context */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Wheedle.ai</span>
          <span style={{ padding: '3px 10px', borderRadius: '6px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>Current brand</span>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '28px' }}>Select the function to start quickly</div>

        {/* Phase Cards */}
        {phases.map((phase) => (
          <div key={phase.number} style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', border: '2px solid #7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: '#7c3aed', flexShrink: 0 }}>
                {phase.number}
              </div>
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{phase.title}</span>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8', marginLeft: '10px' }}>{phase.subtitle}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginLeft: '40px' }}>
              {phase.cards.map((card) => (
                <div key={card.title} style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.15s', position: 'relative' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8eaf0'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '14px' }}>
                    {card.icon}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '6px' }}>{card.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, marginBottom: '14px' }}>{card.desc}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {card.tags.map(tag => (
                      <span key={tag} style={{ padding: '3px 10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.72rem', color: '#475569', fontWeight: 500 }}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
