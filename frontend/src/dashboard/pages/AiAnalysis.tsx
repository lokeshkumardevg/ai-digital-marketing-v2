import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PhaseCard {
  icon: string;
  iconBg: string;
  title: string;
  desc: string;
  tags: string[];
  apiType: string;
  estimatedTime: string;
}

interface Phase {
  number: number;
  title: string;
  subtitle: string;
  cards: PhaseCard[];
}

interface OrchestratorStep {
  id: string;
  role: string;
  label: string;
  status: 'pending' | 'active' | 'done';
}

interface HistoryItem {
  id: number;
  type: string;
  brand: string;
  date: string;
  result: any;
}

// ─── Phase Data ───────────────────────────────────────────────────────────────

const phases: Phase[] = [
  {
    number: 1,
    title: 'Insights Phase',
    subtitle: 'Understand market, competitors and products',
    cards: [
      {
        icon: '📊', iconBg: '#bfdbfe', title: 'Market Research',
        desc: 'Market size, regional analysis, competitive landscape, market segments',
        tags: ['Market Size', 'Regional Analysis', 'Trends'],
        apiType: 'market-research', estimatedTime: '2-5 min',
      },
      {
        icon: '⚡', iconBg: '#fde68a', title: 'Competitor Analysis',
        desc: 'Competitor positioning, product comparison, marketing strategy, differentiation',
        tags: ['Brand Comparison', 'Strategy', 'Differentiation'],
        apiType: 'competitor-analysis', estimatedTime: '2-4 min',
      },
    ],
  },
  {
    number: 2,
    title: 'Strategy Phase',
    subtitle: 'Define target audience and campaign plan',
    cards: [
      {
        icon: '🎯', iconBg: '#bbf7d0', title: 'Audience Insights',
        desc: 'Target audience characteristics & media preferences',
        tags: ['Persona', 'FB Targeting', 'Google Keywords'],
        apiType: 'audience-insights', estimatedTime: '2-3 min',
      },
      {
        icon: '📋', iconBg: '#e9d5ff', title: 'Campaign Strategy',
        desc: 'Define campaign goals, budget allocation, platform selection and timeline',
        tags: ['Goals', 'Budget', 'Timeline'],
        apiType: 'campaign-strategy', estimatedTime: '1-3 min',
      },
    ],
  },
  {
    number: 3,
    title: 'Creative Phase',
    subtitle: 'Generate and optimize ad creatives',
    cards: [
      {
        icon: '✏️', iconBg: '#fed7aa', title: 'Copy Generation',
        desc: 'AI-powered ad copy tailored to your brand voice and target audience',
        tags: ['Headlines', 'Body Copy', 'CTAs'],
        apiType: 'copy-generation', estimatedTime: '1-2 min',
      },
      {
        icon: '🖼️', iconBg: '#bae6fd', title: 'Creative Testing',
        desc: 'A/B test variations, analyze performance, iterate on winning creatives',
        tags: ['A/B Testing', 'Performance', 'Iteration'],
        apiType: 'creative-testing', estimatedTime: '2-3 min',
      },
    ],
  },
];

// ─── Spinner Component ────────────────────────────────────────────────────────

const Spinner: React.FC = () => (
  <span style={{
    display: 'inline-block', width: '14px', height: '14px',
    border: '2px solid #e9d5ff', borderTopColor: '#0665ff',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  }} />
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const AiAnalysis: React.FC = () => {
  // Redux — active brand from workspace slice
  const websites = useSelector((s: RootState) => s.workspace.websites);
  const activeWebsiteId = useSelector((s: RootState) => s.workspace.activeWebsiteId);
  const activeBrand = websites.find(w => w.id === activeWebsiteId);

  // Modal state
  const [selectedCard, setSelectedCard] = useState<PhaseCard | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState<OrchestratorStep[]>([]);
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // History state
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('ai_analysis_history');
    if (stored) {
      try { setHistory(JSON.parse(stored)); } catch {}
    }
  }, []);

  // Save to localStorage helper
  const saveToHistory = (type: string, resultData: any) => {
    const newItem: HistoryItem = {
      id: Date.now(),
      type,
      brand: activeBrand?.name || 'Unknown Brand',
      date: new Date().toISOString(),
      result: resultData,
    };
    const updated = [newItem, ...history].slice(0, 30);
    setHistory(updated);
    localStorage.setItem('ai_analysis_history', JSON.stringify(updated));
  };

  // Open confirm modal
  const handleCardClick = (card: PhaseCard) => {
    setSelectedCard(card);
    setShowConfirmModal(true);
    setResult(null);
    setError(null);
  };

  // Start generation
  const handleStartGenerating = async () => {
    if (!selectedCard) return;
    setShowConfirmModal(false);
    setGenerating(true);
    setShowResult(false);
    setError(null);

    // Build orchestrator steps
    const orchestratorSteps: OrchestratorStep[] = [
      { id: 'submit', role: 'ORCHESTRATOR', label: 'Submitting task...', status: 'active' },
      { id: 'accept', role: 'ORCHESTRATOR', label: 'Task accepted', status: 'pending' },
      { id: 'run', role: selectedCard.title.toUpperCase().replace(/ /g, '_'), label: `Generating ${selectedCard.title}...`, status: 'pending' },
    ];
    setSteps(orchestratorSteps);

    // Animate step 1 → done, step 2 → active
    await delay(900);
    setSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'done' } : i === 1 ? { ...s, status: 'active' } : s));

    await delay(700);
    setSteps(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'done' } : i === 2 ? { ...s, status: 'active' } : s));

    try {
      // Call the backend API
      const response = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000'}/ai/${selectedCard.apiType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify({
          url: activeBrand?.url || '',
          brandName: activeBrand?.name || '',
        }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();

      // Mark last step done
      setSteps(prev => prev.map((s, i) => i === 2 ? { ...s, status: 'done' } : s));
      await delay(500);

      const resultData = data.data || data;
      setResult(resultData);
      saveToHistory(selectedCard.title, resultData);
      setGenerating(false);
      setShowResult(true);

    } catch (err: any) {
      setSteps(prev => prev.map((s, i) => i === 2 ? { ...s, status: 'done', label: 'Generation failed' } : s));
      setError(err.message || 'Unknown error');
      setGenerating(false);
    }
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const closeAll = () => {
    setShowConfirmModal(false);
    setGenerating(false);
    setShowResult(false);
    setSelectedCard(null);
    setError(null);
    setSteps([]);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-primary)', position: 'relative' }}>

      {/* CSS for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Header ── */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--glass-border)', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '3px' }}>Analytics</div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>AI Analysis</h1>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>AI-driven analysis and recommendations</div>
        </div>
        <button
          onClick={() => { setShowHistory(true); setSelectedHistory(null); }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
        >
          📋 View History Records
        </button>
      </div>

      <div style={{ padding: '24px 32px' }}>

        {/* ── Active Brand ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{activeBrand?.name || 'Your Brand'}</span>
          <span style={{ padding: '3px 10px', borderRadius: '6px', background: 'linear-gradient(135deg, #0665ff, #1e27a8)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>Current brand</span>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '28px' }}>Select the function to start quickly</div>

        {/* ── Phase Cards ── */}
        {phases.map((phase) => (
          <div key={phase.number} style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', border: '2px solid #0665ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: '#0665ff', flexShrink: 0 }}>
                {phase.number}
              </div>
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{phase.title}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginLeft: '10px' }}>{phase.subtitle}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginLeft: '40px' }}>
              {phase.cards.map((card) => (
                <div
                  key={card.title}
                  onClick={() => handleCardClick(card)}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#c4b5fd'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(124,58,237,0.08)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e8eaf0'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '14px' }}>
                    {card.icon}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '6px' }}>{card.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>{card.desc}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {card.tags.map(tag => (
                      <span key={tag} style={{ padding: '3px 10px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          MODAL OVERLAY — used for confirm, progress, result
      ══════════════════════════════════════════════ */}
      {(showConfirmModal || generating || showResult) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>

          {/* ── Confirm Modal ── */}
          {showConfirmModal && selectedCard && (
            <div style={{
              background: 'var(--bg-card)', borderRadius: '20px', width: '460px',
              boxShadow: '0 24px 64px rgba(15,23,42,0.20)',
              overflow: 'hidden', position: 'relative',
            }}>
              {/* Close button — top right */}
              <button
                onClick={closeAll}
                style={{
                  position: 'absolute', top: '14px', right: '14px',
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'var(--bg-elevated)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1,
                  zIndex: 2,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
                onMouseLeave={e => (e.currentTarget.style.background = '#f1f5f9')}
              >✕</button>

              {/* Top purple accent strip */}
              <div style={{ height: '4px', background: 'linear-gradient(90deg, #0665ff, #a855f7)' }} />

              {/* Body */}
              <div style={{ padding: '28px 28px 24px' }}>

                {/* Icon + title row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: selectedCard.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem', flexShrink: 0,
                  }}>
                    {selectedCard.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '3px' }}>
                      {selectedCard.title} Report
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      AI-powered analysis
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px', margin: '0 0 20px' }}>
                  Integrate data from World Bank, Google Trends, Reddit and more to generate a comprehensive {selectedCard.title.toLowerCase()} report covering market size, growth trends, and actionable insights.
                </p>

                {/* Info row — brand + time */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: 'var(--bg-elevated)',
                  borderRadius: '10px', border: '1px solid #f1f5f9',
                  marginBottom: '22px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.82rem' }}>🌐</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {activeBrand?.name || 'Your Brand'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.82rem' }}>⏱</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      {selectedCard.estimatedTime}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  {selectedCard.tags.map(tag => (
                    <span key={tag} style={{
                      padding: '3px 10px', borderRadius: '20px',
                      background: '#f3f0ff', border: '1px solid #e9d5ff',
                      fontSize: '0.72rem', color: '#0665ff', fontWeight: 500,
                    }}>{tag}</span>
                  ))}
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={closeAll}
                    style={{
                      flex: 1, padding: '11px', borderRadius: '10px',
                      border: '1px solid var(--glass-border)', background: 'var(--bg-card)',
                      color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600,
                      fontSize: '0.875rem', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartGenerating}
                    style={{
                      flex: 2, padding: '11px', borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #0665ff 0%, #1e27a8 100%)',
                      color: '#fff', cursor: 'pointer', fontWeight: 700,
                      fontSize: '0.875rem', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      gap: '7px', transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.92')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <span style={{ fontSize: '0.9rem' }}>✦</span> Start Generating
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ── Progress Panel ── */}
          {generating && (
            <div style={{
              background: 'var(--bg-card)', borderRadius: '20px', width: '580px',
              maxHeight: '82vh', overflow: 'auto',
              boxShadow: '0 24px 64px rgba(15,23,42,0.20)',
              display: 'flex', flexDirection: 'column',
            }}>

              {/* ── Panel Header ── */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
                flexShrink: 0,
              }}>
                {/* Icon */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: selectedCard?.iconBg || '#f3f0ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', flexShrink: 0,
                }}>
                  {selectedCard?.icon}
                </div>

                {/* Title + brand */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedCard?.title} Report
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '1px' }}>
                    {activeBrand?.name}
                  </div>
                </div>

                {/* Minimize + Close */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={closeAll}
                    style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: 'var(--bg-elevated)', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.82rem', color: 'var(--text-secondary)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#f1f5f9')}
                  >✕</button>
                </div>
              </div>

              {/* ── Animated Progress Bar ── */}
              <div style={{ height: '3px', background: 'var(--bg-elevated)', flexShrink: 0, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #0665ff, #a855f7, #0665ff)',
                  backgroundSize: '200% 100%',
                  animation: 'progressShimmer 1.8s linear infinite',
                  width: `${Math.round((steps.filter(s => s.status === 'done').length / Math.max(steps.length, 1)) * 100)}%`,
                  transition: 'width 0.6s ease',
                }} />
              </div>

              {/* ── Status Banner ── */}
              <div style={{
                margin: '16px 20px 0',
                background: '#fefce8',
                border: '1px solid #fef08a',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                {/* Pulsing dot */}
                <div style={{ position: 'relative', width: '10px', height: '10px', flexShrink: 0 }}>
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: '#f59e0b',
                    animation: 'pulse 1.4s ease-in-out infinite',
                  }} />
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: '#f59e0b', opacity: 0.4,
                    animation: 'pulseRing 1.4s ease-in-out infinite',
                    transform: 'scale(1)',
                  }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#854d0e' }}>
                    Generating {selectedCard?.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#a16207', marginTop: '2px' }}>
                    {steps.find(s => s.status === 'active')?.label || 'Processing...'}
                  </div>
                </div>
                {/* Step counter */}
                <div style={{
                  fontSize: '0.72rem', fontWeight: 600, color: '#a16207',
                  background: '#fef9c3', padding: '3px 8px', borderRadius: '20px',
                  border: '1px solid #fef08a', flexShrink: 0,
                }}>
                  {steps.filter(s => s.status === 'done').length}/{steps.length} steps
                </div>
              </div>

              {/* ── Orchestrator Steps Timeline ── */}
              <div style={{ padding: '16px 20px 20px', flex: 1 }}>
                {steps.map((step, index) => {
                  const isLast = index === steps.length - 1;
                  const isDone = step.status === 'done';
                  const isActive = step.status === 'active';
                  const isPending = step.status === 'pending';

                  // Role badge color
                  const roleBg = isDone ? '#f0fdf4' : isActive ? '#fffbeb' : '#f8fafc';
                  const roleColor = isDone ? '#15803d' : isActive ? '#d97706' : '#94a3b8';
                  const roleBorder = isDone ? '#bbf7d0' : isActive ? '#fde68a' : '#f1f5f9';

                  return (
                    <div key={step.id} style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>

                      {/* Left: icon column with vertical line */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '32px', flexShrink: 0 }}>
                        {/* Status icon */}
                        <div style={{
                          width: '22px', height: '22px', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, marginTop: '10px',
                          background: isDone ? '#dcfce7' : isActive ? '#fef9c3' : '#f1f5f9',
                          border: `1.5px solid ${isDone ? '#86efac' : isActive ? '#fde68a' : '#e2e8f0'}`,
                          transition: 'all 0.3s',
                        }}>
                          {isDone && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                          {isActive && (
                            <div style={{
                              width: '8px', height: '8px', borderRadius: '50%',
                              border: '1.5px solid transparent',
                              borderTopColor: '#f59e0b',
                              borderRightColor: '#f59e0b',
                              animation: 'spin 0.7s linear infinite',
                            }} />
                          )}
                          {isPending && (
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1' }} />
                          )}
                        </div>

                        {/* Connector line */}
                        {!isLast && (
                          <div style={{
                            width: '2px', flex: 1, minHeight: '18px', marginTop: '3px',
                            background: isDone
                              ? 'linear-gradient(to bottom, #86efac, #bbf7d0)'
                              : '#f1f5f9',
                            transition: 'background 0.4s',
                          }} />
                        )}
                      </div>

                      {/* Right: content */}
                      <div style={{
                        flex: 1, paddingLeft: '12px',
                        paddingBottom: isLast ? '0' : '16px',
                        paddingTop: '8px',
                        opacity: isPending ? 0.45 : 1,
                        transition: 'opacity 0.3s',
                      }}>
                        {/* Role badge */}
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '2px 8px', borderRadius: '20px',
                          background: roleBg, border: `1px solid ${roleBorder}`,
                          marginBottom: '4px',
                        }}>
                          {isActive && (
                            <div style={{
                              width: '5px', height: '5px', borderRadius: '50%',
                              background: '#f59e0b',
                              animation: 'pulse 1s ease-in-out infinite',
                            }} />
                          )}
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 700,
                            color: roleColor, letterSpacing: '0.07em',
                            textTransform: 'uppercase',
                          }}>
                            {step.role}
                          </span>
                        </div>

                        {/* Step label */}
                        <div style={{
                          fontSize: '0.83rem',
                          color: isPending ? '#94a3b8' : '#0f172a',
                          fontWeight: isActive ? 500 : 400,
                          lineHeight: 1.4,
                        }}>
                          {step.label}
                        </div>

                        {/* Active: typing dots animation */}
                        {isActive && (
                          <div style={{ display: 'flex', gap: '3px', marginTop: '5px', alignItems: 'center' }}>
                            {[0, 1, 2].map(i => (
                              <div key={i} style={{
                                width: '4px', height: '4px', borderRadius: '50%',
                                background: '#f59e0b',
                                animation: `typingDot 1.2s ease-in-out infinite`,
                                animationDelay: `${i * 0.2}s`,
                              }} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* ── Error state ── */}
                {error && (
                  <div style={{
                    background: '#fef2f2', border: '1px solid #fecaca',
                    borderRadius: '10px', padding: '14px 16px', marginTop: '12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '1rem' }}>⚠️</span>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#dc2626' }}>Generation failed</div>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#ef4444', lineHeight: 1.5 }}>{error}</div>
                    <button
                      onClick={closeAll}
                      style={{
                        marginTop: '12px', padding: '7px 16px', borderRadius: '8px',
                        border: '1px solid #fecaca', background: 'var(--bg-card)',
                        color: '#dc2626', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                      }}
                    >Close</button>
                  </div>
                )}
              </div>

              {/* ── Keyframes injected inline ── */}
              <style>{`
                @keyframes progressShimmer {
                  0% { background-position: 0% 0%; }
                  100% { background-position: 200% 0%; }
                }
                @keyframes pulse {
                  0%, 100% { transform: scale(1); opacity: 1; }
                  50% { transform: scale(1.25); opacity: 0.7; }
                }
                @keyframes pulseRing {
                  0% { transform: scale(1); opacity: 0.5; }
                  100% { transform: scale(2.2); opacity: 0; }
                }
                @keyframes typingDot {
                  0%, 80%, 100% { transform: scale(1); opacity: 0.4; }
                  40% { transform: scale(1.4); opacity: 1; }
                }
              `}</style>
            </div>
          )}

          {/* ── Result Panel ── */}
          {showResult && result && (
            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', width: '660px', maxHeight: '82vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '18px 24px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 10 }}>
                <span style={{ fontSize: '1rem' }}>{selectedCard?.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{selectedCard?.title} — Complete</div>
                  <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>✅ Analysis done · {activeBrand?.name}</div>
                </div>
                <button onClick={closeAll} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-dim)' }}>✕</button>
              </div>

              {/* Result content */}
              <div style={{ padding: '20px 24px' }}>
                <ResultRenderer result={result} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          HISTORY DRAWER
      ══════════════════════════════════════════════ */}
      <HistoryDrawer
        show={showHistory}
        history={history}
        selectedHistory={selectedHistory}
        onClose={() => { setShowHistory(false); setSelectedHistory(null); }}
        onSelect={setSelectedHistory}
        onBack={() => setSelectedHistory(null)}
        onDelete={(id) => {
          const updated = history.filter(h => h.id !== id);
          setHistory(updated);
          localStorage.setItem('ai_analysis_history', JSON.stringify(updated));
        }}
        onClearAll={() => {
          setHistory([]);
          setSelectedHistory(null);
          localStorage.removeItem('ai_analysis_history');
        }}
      />
    </div>
  );
};

// ─── Type icon map ────────────────────────────────────────────────────────────

const TYPE_ICON: Record<string, { icon: string; bg: string; color: string }> = {
  'Market Research':    { icon: '📊', bg: '#dbeafe', color: '#1d4ed8' },
  'Competitor Analysis':{ icon: '⚡', bg: '#fef9c3', color: '#a16207' },
  'Audience Insights':  { icon: '🎯', bg: '#dcfce7', color: '#15803d' },
  'Campaign Strategy':  { icon: '📋', bg: '#f3e8ff', color: '#0665ff' },
  'Copy Generation':    { icon: '✏️', bg: '#ffedd5', color: '#c2410c' },
  'Creative Testing':   { icon: '🖼️', bg: '#e0f2fe', color: '#0369a1' },
};

const getTypeMeta = (type: string) =>
  TYPE_ICON[type] || { icon: '📄', bg: '#f1f5f9', color: 'var(--text-secondary)' };

// ─── Group history items by date label ───────────────────────────────────────

const groupByDate = (items: HistoryItem[]) => {
  const groups: Record<string, HistoryItem[]> = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  items.forEach(item => {
    const d = new Date(item.date);
    let label: string;
    if (d.toDateString() === today.toDateString()) label = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  });

  return groups;
};

// ─── History Drawer ───────────────────────────────────────────────────────────

interface HistoryDrawerProps {
  show: boolean;
  history: HistoryItem[];
  selectedHistory: HistoryItem | null;
  onClose: () => void;
  onSelect: (item: HistoryItem) => void;
  onBack: () => void;
  onDelete: (id: number) => void;
  onClearAll: () => void;
}

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  show, history, selectedHistory,
  onClose, onSelect, onBack, onDelete, onClearAll,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [confirmClear, setConfirmClear] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  if (!show) return null;

  // Unique types for filter pills
  const allTypes = ['All', ...Array.from(new Set(history.map(h => h.type)))];

  // Filtered + searched list
  const filtered = history.filter(item => {
    const matchesSearch =
      item.type.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const grouped = groupByDate(filtered);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)' }}
      />

      {/* Drawer panel */}
      <div style={{
        position: 'relative', width: '440px', background: 'var(--bg-card)',
        height: '100%', display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 48px rgba(15,23,42,0.15)',
        animation: 'slideInRight 0.22s ease-out',
      }}>
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(40px); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* ── Drawer Header ── */}
        <div style={{
          padding: '18px 20px 0', flexShrink: 0,
          borderBottom: '1px solid #f1f5f9',
        }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {selectedHistory ? 'Analysis Detail' : 'History Records'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                {selectedHistory
                  ? `${selectedHistory.type} · ${selectedHistory.brand}`
                  : `${history.length} records saved`}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {/* Clear all — only in list view */}
              {!selectedHistory && history.length > 0 && (
                confirmClear ? (
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Sure?</span>
                    <button
                      onClick={() => { onClearAll(); setConfirmClear(false); }}
                      style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer' }}
                    >Yes, clear</button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer' }}
                    >Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClear(true)}
                    style={{ fontSize: '0.72rem', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px' }}
                    onMouseEnter={e => { (e.currentTarget.style.color = '#ef4444'); (e.currentTarget.style.background = '#fef2f2'); }}
                    onMouseLeave={e => { (e.currentTarget.style.color = '#94a3b8'); (e.currentTarget.style.background = 'none'); }}
                  >Clear all</button>
                )
              )}

              {/* Close */}
              <button
                onClick={onClose}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'var(--bg-elevated)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', color: 'var(--text-secondary)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
                onMouseLeave={e => (e.currentTarget.style.background = '#f1f5f9')}
              >✕</button>
            </div>
          </div>

          {/* Search bar — only in list view */}
          {!selectedHistory && (
            <>
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <span style={{
                  position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '0.82rem', color: 'var(--text-dim)', pointerEvents: 'none',
                }}>🔍</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by type or brand..."
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '9px 12px 9px 32px', borderRadius: '10px',
                    border: '1px solid var(--glass-border)', background: 'var(--bg-elevated)',
                    fontSize: '0.82rem', color: 'var(--text-primary)', outline: 'none',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#c4b5fd')}
                  onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    style={{
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '0.78rem', color: 'var(--text-dim)', padding: 0,
                    }}
                  >✕</button>
                )}
              </div>

              {/* Type filter pills */}
              {allTypes.length > 1 && (
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
                  {allTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      style={{
                        padding: '4px 12px', borderRadius: '20px', border: 'none',
                        fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                        whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.12s',
                        background: filterType === type ? '#0665ff' : '#f1f5f9',
                        color: filterType === type ? '#fff' : '#64748b',
                      }}
                    >{type}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Drawer Body ── */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>

          {/* ── Detail View ── */}
          {selectedHistory ? (
            <div style={{ padding: '16px 20px', animation: 'fadeIn 0.18s ease-out' }}>
              {/* Back button */}
              <button
                onClick={onBack}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#0665ff', fontWeight: 600, fontSize: '0.82rem',
                  marginBottom: '16px', padding: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >← Back to list</button>

              {/* Meta card */}
              <div style={{
                background: 'var(--bg-elevated)', borderRadius: '12px', padding: '14px 16px',
                marginBottom: '20px', border: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: getTypeMeta(selectedHistory.type).bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', flexShrink: 0,
                }}>
                  {getTypeMeta(selectedHistory.type).icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {selectedHistory.type}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {selectedHistory.brand}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '1px' }}>
                    {new Date(selectedHistory.date).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>

              {/* Result */}
              <ResultRenderer result={selectedHistory.result} />
            </div>

          ) : filtered.length === 0 ? (
            /* ── Empty state ── */
            <div style={{ textAlign: 'center', padding: '56px 24px', animation: 'fadeIn 0.2s ease-out' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: '12px' }}>
                {search || filterType !== 'All' ? '🔍' : '📂'}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {search || filterType !== 'All' ? 'No matches found' : 'No analyses yet'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                {search || filterType !== 'All'
                  ? 'Try a different search term or filter'
                  : 'Run your first analysis to see history here'}
              </div>
              {(search || filterType !== 'All') && (
                <button
                  onClick={() => { setSearch(''); setFilterType('All'); }}
                  style={{ marginTop: '14px', padding: '7px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                >Clear filters</button>
              )}
            </div>

          ) : (
            /* ── Grouped list ── */
            Object.entries(grouped).map(([dateLabel, items]) => (
              <div key={dateLabel} style={{ marginBottom: '4px' }}>
                {/* Date group label */}
                <div style={{
                  padding: '8px 20px 4px',
                  fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)',
                  letterSpacing: '0.07em', textTransform: 'uppercase',
                }}>
                  {dateLabel}
                </div>

                {/* Items */}
                {items.map(item => {
                  const meta = getTypeMeta(item.type);
                  const isHovered = hoveredId === item.id;

                  return (
                    <div
                      key={item.id}
                      style={{
                        margin: '2px 10px', borderRadius: '12px',
                        border: `1px solid ${isHovered ? '#c4b5fd' : '#f1f5f9'}`,
                        background: isHovered ? '#faf8ff' : '#fff',
                        cursor: 'pointer', transition: 'all 0.12s',
                        animation: 'fadeIn 0.15s ease-out',
                        position: 'relative', overflow: 'hidden',
                      }}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {/* Left accent bar on hover */}
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: '3px', background: '#0665ff',
                        borderRadius: '12px 0 0 12px',
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.12s',
                      }} />

                      <div
                        onClick={() => onSelect(item)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px' }}
                      >
                        {/* Type icon */}
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '9px',
                          background: meta.bg, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '1rem', flexShrink: 0,
                        }}>
                          {meta.icon}
                        </div>

                        {/* Text */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.type}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.brand}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                            {new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        {/* View arrow + delete */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          {isHovered && (
                            <button
                              onClick={e => { e.stopPropagation(); onDelete(item.id); }}
                              style={{
                                width: '26px', height: '26px', borderRadius: '6px',
                                background: '#fef2f2', border: '1px solid #fecaca',
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '0.7rem', color: '#ef4444',
                              }}
                              title="Delete this record"
                            >🗑</button>
                          )}
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '6px',
                            background: isHovered ? '#f3f0ff' : '#f8fafc',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', color: isHovered ? '#0665ff' : '#94a3b8',
                            transition: 'all 0.12s',
                          }}>›</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* ── Drawer Footer ── */}
        {!selectedHistory && history.length > 0 && (
          <div style={{
            padding: '12px 20px', borderTop: '1px solid #f1f5f9', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg-elevated)',
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Showing {filtered.length} of {history.length} records
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Stored locally on this device
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Result Renderer ──────────────────────────────────────────────────────────
// Renders any JSON result returned by the AI API in a clean card format

const ResultRenderer: React.FC<{ result: any }> = ({ result }) => {
  if (!result) return null;

  const renderValue = (key: string, value: any, depth = 0): React.ReactNode => {
    if (value === null || value === undefined) return null;

    if (Array.isArray(value)) {
      return (
        <div style={{ marginBottom: '12px' }} key={key}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0665ff', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{formatKey(key)}</div>
          {value.map((item, i) => (
            <div key={i} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '10px 12px', marginBottom: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {typeof item === 'object' ? Object.entries(item).map(([k, v]) => (
                <div key={k} style={{ marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{formatKey(k)}: </span>
                  <span>{String(v)}</span>
                </div>
              )) : String(item)}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'object') {
      return (
        <div style={{ marginBottom: '14px', background: 'var(--bg-elevated)', borderRadius: '10px', padding: '12px', border: '1px solid #f1f5f9' }} key={key}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0665ff', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{formatKey(key)}</div>
          {Object.entries(value).map(([k, v]) => renderValue(k, v, depth + 1))}
        </div>
      );
    }

    return (
      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }} key={key}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '130px', paddingTop: '1px', flexShrink: 0 }}>{formatKey(key)}</span>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{String(value)}</span>
      </div>
    );
  };

  const formatKey = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();

  return (
    <div>
      {Object.entries(result).map(([key, value]) => renderValue(key, value))}
    </div>
  );
};