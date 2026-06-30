import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { TrendingUp, RefreshCw, Sparkles, AlertCircle, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { GlassCard } from '../components/GlassCard';
import type { RootState } from '../../store';

const REVIEW_AGENT_API_URL =
  (import.meta as any).env?.VITE_REVIEW_AGENT_API_URL || 'http://localhost:3000';

// ── Updated shape — ab ek combined record aata hai ──
interface RecommendationRecord {
  id: string;
  reviewIds: string[];   // array of review IDs
  brandId: string;
  userId: string;
  sentiment: string;
  issues: string[];
  recommendations: string[];
  month: string;
  createdAt: string;
}

const sentimentStyle = (s: string) => {
  switch (s?.toLowerCase()) {
    case 'positive': return { badge: { background: '#d1fae5', color: '#065f46' } };
    case 'negative': return { badge: { background: '#fee2e2', color: '#991b1b' } };
    case 'mixed': return { badge: { background: '#fef3c7', color: '#92400e' } };
    default: return { badge: { background: '#f3f4f6', color: '#374151' } };
  }
};

// ── Skeleton ──────────────────────────────────────────────────
const Skeleton: React.FC = () => (
  <GlassCard style={{ padding: '24px' }}>
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
      <div
        style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: 'var(--bg-card)',
          animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ height: '16px', width: '55%', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '12px', width: '90%', borderRadius: '6px', background: 'var(--bg-card)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '12px', width: '70%', borderRadius: '6px', background: 'var(--bg-card)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    </div>
    {[55, 90, 70].map((w, i) => (
      <div key={i} style={{ height: i === 0 ? 16 : 12, width: `${w}%`, borderRadius: 6, background: 'rgba(255,255,255,0.06)', marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />
    ))}
  </GlassCard>
);

// ── Combined insight card ─────────────────────────────────────
const InsightCard: React.FC<{ record: RecommendationRecord }> = ({ record }) => {
  const { badge } = sentimentStyle(record.sentiment);

  const monthLabel = record.month
    ? new Date(record.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : record.createdAt
      ? new Date(record.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      : '';

  return (
    <GlassCard style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>

      {/* ── Header ── */}
      <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ ...badge, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '3px 10px', borderRadius: 20 }}>
          {record.sentiment || 'Unknown'}
        </span>

        {record.reviewIds?.length > 0 && (
          <span style={{ fontSize: '0.72rem', padding: '2px 9px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-secondary)' }}>
            {record.reviewIds.length} review{record.reviewIds.length !== 1 ? 's' : ''} analyzed
          </span>
        )}

        {monthLabel && (
          <span style={{ fontSize: '0.72rem', padding: '2px 9px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-secondary)' }}>
            {monthLabel}
          </span>
        )}

        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          Generated {record.createdAt ? new Date(record.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : ''}
        </span>
      </div>

      {/* ── Two-column body ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

        {/* Issues */}
        <div style={{ padding: '20px 24px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ef4444' }}>
            <AlertCircle size={13} /> Issues identified
          </div>

          {record.issues?.length ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {record.issues.map((issue, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 0', borderBottom: i < record.issues.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', marginTop: 7, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.84rem', lineHeight: 1.55, color: 'var(--text-primary)' }}>{issue}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>No issues flagged</p>
          )}
        </div>

        {/* Recommendations */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7033f5' }}>
            <Lightbulb size={13} /> Recommendations
          </div>

      {/* Expanded content */}
      {isOpen && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
          {section.isList && Array.isArray(value) ? (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {value.map((post, i) => (
                <li
                  key={i}
                  style={{
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    color: 'var(--text-primary)',
                  }}
                >
                  {post}
          {record.recommendations?.length ? (
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {record.recommendations.map((rec, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#7033f5', color: '#fff', fontSize: '0.68rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: '0.84rem', lineHeight: 1.55, color: 'var(--text-primary)' }}>{rec}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>No recommendations yet</p>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

// ── Main page ─────────────────────────────────────────────────
const RecommendationsPage: React.FC = () => {
  const { user } = useSelector((s: RootState) => (s as any).auth);
  const { activeBrandId } = useSelector((s: any) => s.workspace);

  const brandId = activeBrandId || user?.id || 'demo';
  const userId = user?.id || 'demo';

  const [records, setRecords] = useState<RecommendationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `${REVIEW_AGENT_API_URL}/recommendations?brandId=${encodeURIComponent(brandId)}&userId=${encodeURIComponent(userId)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setRecords(data.recommendations ?? []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [brandId, userId]);

  useEffect(() => { loadRecommendations(); }, [loadRecommendations]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${REVIEW_AGENT_API_URL}/analyze-comments`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      if (data.already_analyzed) {
        toast(data.message, { icon: 'ℹ️' });  // info toast
      } else {
        toast.success(data.message);
      }
      // toast.success(`Analyzed ${data.processed_records} review(s)`);
      await loadRecommendations();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate insights');
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Derived stats ──
  const totalReviews = records.reduce((s, r) => s + (r.reviewIds?.length || 0), 0);
  const totalIssues = records.reduce((s, r) => s + (r.issues?.length || 0), 0);
  const lastDate = records[0]?.createdAt
    ? new Date(records[0].createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
    : null;

  const kpis = [
    { label: 'Reviews analyzed', value: isLoading ? '—' : totalReviews, Icon: TrendingUp, accent: '#7033f5', bg: 'rgba(112,51,245,0.12)' },
    { label: 'Issues flagged', value: isLoading ? '—' : totalIssues, Icon: AlertCircle, accent: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    { label: 'Last generated', value: isLoading ? '—' : lastDate ?? 'Never', Icon: Lightbulb, accent: '#10b981', bg: 'rgba(16,185,129,0.12)', small: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 'clamp(14px,2.5vw,24px)' }}>

      {/* Error banner */}
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚠</span><span>{error}</span>
          <button onClick={loadRecommendations} style={{ marginLeft: 'auto', background: 'none', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', padding: '3px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>
            Retry
          </button>
        </div>
      )}

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {kpis.map(({ label, value, Icon, accent, bg, small }) => (
          <GlassCard key={label} style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: bg, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: small ? '0.9rem' : '1.75rem', fontWeight: 600, lineHeight: 1 }}>{value}</div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Generate button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: '0.82rem', fontWeight: 600, cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.7 : 1 }}
        >
          {isGenerating ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
          {isGenerating ? 'Generating…' : 'Generate AI Insights'}
        </button>
      </div>

      {/* Insight cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} />)
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <Lightbulb size={40} style={{ marginBottom: 12, opacity: 0.2 }} />
            <p style={{ fontSize: '0.85rem', marginBottom: 16 }}>No insights yet — generate your first AI analysis</p>
            <button onClick={handleGenerate} disabled={isGenerating} style={{ background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              Generate with AI
            </button>
          </div>
        ) : (
          records.map(record => <InsightCard key={record.id} record={record} />)
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
        @keyframes spin  { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
};

export default RecommendationsPage;