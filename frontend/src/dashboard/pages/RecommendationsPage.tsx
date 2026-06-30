// ─── RecommendationsPage.tsx ─────────────────────────────────
// Route: /reviews/recommendations
//
// Displays AI-generated reputation insights from the backend.
// Backend shape: { mostCommonComplaint, mostLovedFeature,
//   reviewGrowthOpportunity, suggestedCampaign,
//   suggestedSocialPosts[], suggestedEmailCampaign, createdAt }

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Lightbulb, TrendingUp, RefreshCw, Sparkles,
  Heart, AlertCircle, Mail, Share2, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { GlassCard } from '../components/GlassCard';
import {
  fetchRecommendations,
  generateRecommendations,
  type ReputationInsight,          // ← rename/update your type export
} from '../../store/slices/Reputationslice';
import type { AppDispatch, RootState } from '../../store';

// ─── Section config ───────────────────────────────────────────
interface InsightSection {
  key: keyof ReputationInsight;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  isList?: boolean;
}

const SECTIONS: InsightSection[] = [
  {
    key: 'mostLovedFeature',
    label: 'Most Loved Feature',
    icon: Heart,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
  },
  {
    key: 'mostCommonComplaint',
    label: 'Most Common Complaint',
    icon: AlertCircle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
  },
  {
    key: 'reviewGrowthOpportunity',
    label: 'Review Growth Opportunity',
    icon: TrendingUp,
    color: '#7033f5',
    bg: 'rgba(112,51,245,0.1)',
  },
  {
    key: 'suggestedCampaign',
    label: 'Suggested Campaign',
    icon: Lightbulb,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
  },
  {
    key: 'suggestedSocialPosts',
    label: 'Suggested Social Posts',
    icon: Share2,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    isList: true,
  },
  {
    key: 'suggestedEmailCampaign',
    label: 'Suggested Email Campaign',
    icon: Mail,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.1)',
  },
];

// ─── Skeleton ─────────────────────────────────────────────────
const RecSkeleton: React.FC = () => (
  <GlassCard style={{ padding: '24px' }}>
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
      <div
        style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.05)',
          animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ height: '16px', width: '55%', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '12px', width: '90%', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '12px', width: '70%', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  </GlassCard>
);

// ─── Expandable insight card ──────────────────────────────────
interface InsightCardProps {
  section: InsightSection;
  value: string | string[];
  isOpen: boolean;
  onToggle: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ section, value, isOpen, onToggle }) => {
  const Icon = section.icon;
  const preview = Array.isArray(value) ? `${value.length} posts ready` : value;

  return (
    <GlassCard
      style={{
        padding: '20px 24px',
        cursor: 'pointer',
        border: isOpen
          ? '1px solid rgba(112,51,245,0.4)'
          : '1px solid rgba(255,255,255,0.06)',
        transition: 'border 0.2s',
      }}
      onClick={onToggle}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: section.bg, color: section.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={18} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '3px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {section.label}
          </div>
          {!isOpen && (
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {preview}
            </p>
          )}
        </div>

        <ChevronDown
          size={16}
          color="#4b5563"
          style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </div>

      {/* Expanded content */}
      {isOpen && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {section.isList && Array.isArray(value) ? (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {value.map((post, i) => (
                <li
                  key={i}
                  style={{
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    color: 'var(--text-primary)',
                  }}
                >
                  {post}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
              {value as string}
            </p>
          )}
        </div>
      )}
    </GlassCard>
  );
};

// ─── Main page ────────────────────────────────────────────────
const RecommendationsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const insight        = useSelector((s: RootState) => s.reputation.insight);           // single object or null
  const recLoad        = useSelector((s: RootState) => s.reputation.recommendationsLoad);
  const generateLoad   = useSelector((s: RootState) => s.reputation.generateRecsLoad);
  const { user }       = useSelector((s: RootState) => (s as any).auth);
  const { activeBrandId } = useSelector((s: any) => s.workspace);

  const brandId  = activeBrandId || user?.id || 'demo';
  const isLoading    = recLoad.status === 'loading' || recLoad.status === 'idle';
  const isGenerating = generateLoad.status === 'loading';

  const [openCard, setOpenCard] = useState<keyof ReputationInsight | null>(null);

  // Fetch on mount
  useEffect(() => {
    dispatch(fetchRecommendations({ brandId }));
  }, [dispatch, brandId]);

  const handleGenerate = async () => {
    const result = await dispatch(generateRecommendations({ brandId }));
    if (generateRecommendations.fulfilled.match(result)) {
      toast.success('New insights generated!');
    } else {
      toast.error((result.payload as string) || 'Failed to generate insights');
    }
  };

  const toggleCard = (key: keyof ReputationInsight) =>
    setOpenCard(prev => (prev === key ? null : key));

  // Derived
  const hasInsight = !!insight;
  const generatedAt = insight?.createdAt
    ? new Date(insight.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: 'clamp(14px, 2.5vw, 24px)' }}>

      {/* Error banner */}
      {recLoad.error && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠</span>
          <span>{recLoad.error}</span>
          <button
            onClick={() => dispatch(fetchRecommendations({ brandId }))}
            style={{ marginLeft: 'auto', background: 'none', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', padding: '3px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Insights Available', value: isLoading ? '—' : hasInsight ? SECTIONS.length : 0, icon: Lightbulb, color: '#7033f5', bg: 'rgba(112,51,245,0.12)' },
          { label: 'Social Posts Ready', value: isLoading ? '—' : insight?.suggestedSocialPosts?.length ?? 0, icon: Share2, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
          { label: 'Last Generated', value: isLoading ? '—' : generatedAt ?? 'Never', icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <GlassCard key={card.label} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{card.label}</div>
                <div style={{ fontSize: card.label === 'Last Generated' ? '0.95rem' : '1.8rem', fontWeight: 700 }}>{card.value}</div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Generate button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '0.82rem', fontWeight: 600, cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.7 : 1 }}
        >
          {isGenerating
            ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
            : <Sparkles size={14} />}
          {isGenerating ? 'Generating...' : 'Generate AI Insights'}
        </button>
      </div>

      {/* Insight cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <RecSkeleton key={i} />)
        ) : !hasInsight ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <Lightbulb size={40} style={{ marginBottom: '12px', opacity: 0.2 }} />
            <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>No insights yet — generate your first AI analysis</p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{ background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Generate with AI
            </button>
          </div>
        ) : (
          SECTIONS.map(section => {
            const value = insight[section.key];
            if (!value) return null;
            return (
              <InsightCard
                key={section.key}
                section={section}
                value={value as string | string[]}
                isOpen={openCard === section.key}
                onToggle={() => toggleCard(section.key)}
              />
            );
          })
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default RecommendationsPage;