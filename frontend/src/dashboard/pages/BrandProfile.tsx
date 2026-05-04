import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BrandData {
  name: string;
  url: string;
  logo?: string;
  tagline?: string;
  description?: string;
  lifecycle?: string;
  companySize?: string;
  targetMarket?: string;
  location?: string;
  businessModel?: string;
  tags?: string[];
  brandDna?: {
    brandTone?: string;
    marketKeywords?: string[];
  };
  coreAdvantages?: {
    valueProposition?: string;
    differentiators?: string[];
  };
  features?: Array<{ title: string; description: string; icon?: string }>;
  targetAudience?: Array<{
    segment: string;
    description: string;
    tags?: string[];
  }>;
  competitors?: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  reachAndEcosystem?: {
    marketingChannels?: string[];
    customerHangouts?: string[];
  };
  impactAnalysis?: {
    revenue?: string[];
    cost?: string[];
    policy?: string[];
    technology?: string[];
  };
}

// ─── Generation step type ─────────────────────────────────────────────────────

interface GenStep {
  id: string;
  label: string;
  sublabel: string;
  status: 'pending' | 'active' | 'done';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const initials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─── Main Component ───────────────────────────────────────────────────────────

export const BrandProfile: React.FC = () => {
  const websites = useSelector((s: RootState) => s.workspace.websites);
  const activeId = useSelector((s: RootState) => s.workspace.activeWebsiteId);
  const activeBrand = websites.find(w => w.id === activeId);

  const [phase, setPhase] = useState<'idle' | 'generating' | 'result'>('idle');
  const [steps, setSteps] = useState<GenStep[]>([]);
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeAudienceIdx, setActiveAudienceIdx] = useState(0);

  // Load cached result from localStorage on mount
  useEffect(() => {
    if (!activeBrand) return;
    const cached = localStorage.getItem(`brand_profile_${activeBrand.id}`);
    if (cached) {
      try { setBrandData(JSON.parse(cached)); setPhase('result'); } catch { }
    } else {
      setPhase('idle');
      setBrandData(null);
    }
  }, [activeBrand?.id]);

  // ── Start analysis ──────────────────────────────────────────────────────────

  const startAnalysis = async () => {
    if (!activeBrand) return;
    setPhase('generating');
    setError(null);

    const genSteps: GenStep[] = [
      { id: 'recog', label: 'Brand Recognition', sublabel: 'Visit homepage, extract brand info and industry classification', status: 'active' },
      { id: 'scrape', label: 'Page Scraping', sublabel: 'Discover and visit important pages, extract structured data', status: 'pending' },
      { id: 'compete', label: 'Competitor Analysis', sublabel: 'Search for industry competitors, analyze competitor features', status: 'pending' },
      { id: 'ai', label: 'AI Comprehensive Analysis', sublabel: 'LLM deep analysis, generate complete brand profile', status: 'pending' },
    ];
    setSteps(genSteps);

    const advance = (doneIdx: number) =>
      setSteps(prev => prev.map((s, i) =>
        i === doneIdx ? { ...s, status: 'done' } :
          i === doneIdx + 1 ? { ...s, status: 'active' } : s
      ));

    try {
      await delay(1200); advance(0);
      await delay(1000); advance(1);
      await delay(1100); advance(2);

      // ── Real API call ──
      const res = await fetch('http://localhost:3000/ai/brand-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify({ url: activeBrand.url, brandName: activeBrand.name }),
      });

      if (!res.ok) {
        throw new Error(`Server error ${res.status}`);
      }

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || 'Brand profile generation failed');
      }

      // Extract profile data correctly (handles nesting)
      // const profileData = json.data?.brand || json.data || {};
      const raw = json.data?.data?.brand || {};
      
      advance(3);
      await delay(500);

      // Merge with workspace brand info
      const transformed: BrandData = {
  name: raw.name,
  url: raw.website,
  description: raw.description,
  lifecycle: raw.lifecycle,
  companySize: raw.company_size,
  businessModel: raw.business_model,
  targetMarket: raw.target_market,

  tags: raw.brand_tone,

  brandDna: {
    brandTone: raw.brand_tone?.join(', '),
    marketKeywords: raw.market_keywords,
  },

  coreAdvantages: {
    valueProposition: raw.value_proposition,
    differentiators: raw.differentiators,
  },

  features: raw.features,
  targetAudience: raw.target_audience,
  competitors: raw.competitors,

  reachAndEcosystem: {
    marketingChannels: raw.marketing_channels,
    customerHangouts: raw.customer_hangouts,
  },

  impactAnalysis: raw.impact_analysis,
};
setBrandData(transformed);
localStorage.setItem(`brand_profile_${activeBrand.id}`, JSON.stringify(transformed));
      setPhase('result');

    } catch (err: any) {
      setError(err.message || 'Analysis failed');
      setSteps(prev => prev.map(s => s.status === 'active' ? { ...s, status: 'done', sublabel: 'Failed — ' + (err.message || 'unknown error') } : s));
    }
  };

  const resetAnalysis = () => {
    if (!activeBrand) return;
    localStorage.removeItem(`brand_profile_${activeBrand.id}`);
    setBrandData(null);
    setPhase('idle');
    setError(null);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-primary)' }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100%{opacity:.6} 50%{opacity:1} }
        .brand-card:hover  { border-color:#c4b5fd !important; box-shadow:0 4px 20px rgba(124,58,237,.08) !important; }
        .feat-card:hover   { border-color:#a78bfa !important; background:var(--bg-elevated) !important; }
        .comp-card:hover   { border-color:#c4b5fd !important; }
      `}</style>

      {/* ── Page Header ── */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--glass-border)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '2px' }}>Brand Center</div>
          <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Brand Profile</h1>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>AI-powered brand analysis and insights</div>
        </div>
        {phase === 'result' && (
          <button
            onClick={resetAnalysis}
            style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
          >
            Re-analyse
          </button>
        )}
      </div>

      {/* ════════════════════════════════════════
          IDLE — prompt to start
      ════════════════════════════════════════ */}
      {phase === 'idle' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '40px 44px', width: '420px', boxShadow: '0 8px 40px rgba(0,0,0,0.5)', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg,#2631d6,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', margin: '0 auto 18px' }}>✦</div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Create Brand Profile</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 20px' }}>
              AI will analyse <strong style={{ color: 'var(--text-primary)' }}>{activeBrand?.name || 'your brand'}</strong> at{' '}
              <span style={{ color: '#2631d6', wordBreak: 'break-all' }}>{activeBrand?.url}</span> and generate a complete brand profile.
            </p>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '10px 14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem' }}>⏱</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>2-3 min for AI to complete brand profile analysis</span>
            </div>
            <button
              onClick={startAnalysis}
              style={{ width: '100%', padding: '13px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#2631d6,#1e27a8)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <span>✦</span> Start Analysis
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          GENERATING — progress panel
      ════════════════════════════════════════ */}
      {phase === 'generating' && (
        <div style={{ display: 'flex', gap: '20px', padding: '24px 32px', maxWidth: '960px' }}>

          {/* Left: steps */}
          <div style={{ width: '340px', flexShrink: 0 }}>
            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--glass-border)', padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '6px' }}>Generation Progress</div>

              {/* Progress bar */}
              <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '99px', marginBottom: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '99px',
                  background: 'linear-gradient(90deg,#2631d6,#a855f7)',
                  width: `${Math.round((steps.filter(s => s.status === 'done').length / Math.max(steps.length, 1)) * 100)}%`,
                  transition: 'width .6s ease',
                }} />
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#2631d6', fontWeight: 700, marginBottom: '20px' }}>
                {Math.round((steps.filter(s => s.status === 'done').length / Math.max(steps.length, 1)) * 100)}%
              </div>

              {/* Steps */}
              {steps.map((step, i) => {
                const isDone = step.status === 'done';
                const isActive = step.status === 'active';
                const isLast = i === steps.length - 1;
                return (
                  <div key={step.id} style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '28px', flexShrink: 0 }}>
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: '6px',
                        background: isDone ? '#dcfce7' : isActive ? '#ede9fe' : '#f1f5f9',
                        border: `1.5px solid ${isDone ? '#86efac' : isActive ? '#c4b5fd' : '#e2e8f0'}`,
                        transition: 'all .3s',
                      }}>
                        {isDone && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {isActive && (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1.5px solid transparent', borderTopColor: '#2631d6', borderRightColor: '#2631d6', animation: 'spin .7s linear infinite' }} />
                        )}
                        {step.status === 'pending' && (
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e1' }} />
                        )}
                      </div>
                      {!isLast && (
                        <div style={{ width: '2px', flex: 1, minHeight: '14px', marginTop: '3px', background: isDone ? '#86efac' : '#f1f5f9', transition: 'background .4s' }} />
                      )}
                    </div>

                    <div style={{ flex: 1, paddingLeft: '12px', paddingBottom: isLast ? '0' : '16px', paddingTop: '4px', opacity: step.status === 'pending' ? .4 : 1, transition: 'opacity .3s' }}>
                      <div style={{ fontSize: '0.83rem', fontWeight: isActive ? 600 : 500, color: 'var(--text-primary)', marginBottom: '2px' }}>{step.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{step.sublabel}</div>
                      {isDone && (
                        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {step.id === 'recog' && ['Extract Brand Information', 'Identify Industry Category'].map(t => <TaskDone key={t} label={t} />)}
                          {step.id === 'scrape' && ['Discover Key Pages', 'Batch Visit Pages', 'Extract Structured Data'].map(t => <TaskDone key={t} label={t} />)}
                          {step.id === 'compete' && ['Search Industry Keywords', 'Find Industry Competitors'].map(t => <TaskDone key={t} label={t} />)}
                          {step.id === 'ai' && ['LLM Deep Analysis', 'Generate Brand Profile'].map(t => <TaskDone key={t} label={t} />)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', marginTop: '12px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#dc2626', marginBottom: '4px' }}>Analysis failed</div>
                  <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>{error}</div>
                  <button onClick={resetAnalysis} style={{ marginTop: '10px', padding: '6px 14px', borderRadius: '6px', border: '1px solid #fecaca', background: 'var(--bg-card)', color: '#dc2626', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Retry</button>
                </div>
              )}
            </div>
          </div>

          {/* Right: live browser preview placeholder */}
          <div style={{ flex: 1, background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '.07em', textTransform: 'uppercase' }}>
              Live Browser Preview
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-dim)', fontSize: '0.82rem', flexDirection: 'column', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #e9d5ff', borderTopColor: '#2631d6', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
              <div>Waiting for browser to start...</div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          RESULT — full brand profile
      ════════════════════════════════════════ */}
      {phase === 'result' && brandData && (
        <div style={{ padding: '24px 32px', maxWidth: '1100px', animation: 'fadeUp .3s ease-out' }}>
          {/* Debug log */}
          {console.log('Brand data:', brandData)}

          {/* ── Brand Header Card ── */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--glass-border)', padding: '24px 28px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
              {/* Logo + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg,#2631d620,#a855f720)', border: '1.5px solid #e9d5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 800, color: '#2631d6', flexShrink: 0 }}>
                  {initials(brandData.name)}
                </div>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>{brandData.name}</h2>
                  <a href={brandData.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#2631d6', textDecoration: 'none' }}>🌐 {brandData.url}</a>
                  {brandData.tags?.length ? (
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {brandData.tags.map(t => <Pill key={t} label={t} />)}
                    </div>
                  ) : null}
                </div>
              </div>
              {/* Meta chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end', maxWidth: '420px' }}>
                {[
                  { label: 'LIFECYCLE', value: brandData.lifecycle },
                  { label: 'COMPANY SIZE', value: brandData.companySize },
                  { label: 'TARGET MARKET', value: brandData.targetMarket },
                  { label: 'LOCATION', value: brandData.location },
                  { label: 'BUSINESS MODEL', value: brandData.businessModel },
                ].filter(m => m.value).map(m => (
                  <div key={m.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: '2px' }}>{m.label}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '4px 10px' }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {brandData.description && (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '800px' }}>{brandData.description}</p>
            )}
          </div>

          {/* ── Two columns: Brand DNA + Core Advantages ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>

            {/* Brand DNA */}
            <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--glass-border)', padding: '20px' }}>
              <SectionTitle color="#2631d6" label="Brand DNA" />
              {brandData.brandDna?.brandTone && (
                <>
                  <FieldLabel label="Brand Tone" />
                  <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{brandData.brandDna.brandTone}</p>
                </>
              )}
              {brandData.brandDna?.marketKeywords?.length ? (
                <>
                  <FieldLabel label="Market Keywords" />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {brandData.brandDna.marketKeywords.map(k => <KeywordPill key={k} label={k} />)}
                  </div>
                </>
              ) : null}
            </div>

            {/* Core Advantages */}
            <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--glass-border)', padding: '20px' }}>
              <SectionTitle color="#f59e0b" label="Core Advantages" />
              {brandData.coreAdvantages?.valueProposition && (
                <>
                  <FieldLabel label="Value Proposition" />
                  <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{brandData.coreAdvantages.valueProposition}</p>
                </>
              )}
              {brandData.coreAdvantages?.differentiators?.length ? (
                <>
                  <FieldLabel label="Differentiation" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {brandData.coreAdvantages.differentiators.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span style={{ color: '#2631d6', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span> {d}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* ── Brand Features ── */}
          {brandData.features?.length ? (
            <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--glass-border)', padding: '20px', marginBottom: '20px' }}>
              <SectionTitle color="#3b82f6" label="Brand Features" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginTop: '14px' }}>
                {brandData.features.map((f, i) => (
                  <div key={i} className="feat-card" style={{ borderRadius: '12px', border: '1px solid #f1f5f9', padding: '16px', cursor: 'default', transition: 'all .15s', background: 'var(--bg-elevated)' }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{f.icon || '✦'}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px' }}>{f.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.description}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* ── Target Audience ── */}
          {brandData.targetAudience?.length ? (
            <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--glass-border)', padding: '20px', marginBottom: '20px' }}>
              <SectionTitle color="#10b981" label="Target Audience" />
              <div style={{ position: 'relative', overflow: 'hidden', marginTop: '14px' }}>
                {brandData.targetAudience.map((aud, i) => (
                  <div key={i} style={{ display: i === activeAudienceIdx ? 'flex' : 'none', gap: '24px', alignItems: 'center', animation: 'fadeUp .2s ease-out' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: '6px' }}>TARGET AUDIENCE OF</div>
                      <h3 style={{ margin: '0 0 12px', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{aud.segment}</h3>
                      <p style={{ margin: '0 0 14px', fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{aud.description}</p>
                      {aud.tags?.length && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {aud.tags.map(t => <Pill key={t} label={t} outline />)}
                        </div>
                      )}
                    </div>
                    {/* Avatar placeholder */}
                    <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'linear-gradient(135deg,#2631d620,#a855f730)', border: '2px solid #e9d5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', flexShrink: 0 }}>👤</div>
                  </div>
                ))}

                {/* Dots nav */}
                {brandData.targetAudience.length > 1 && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '16px' }}>
                    {brandData.targetAudience.map((_, i) => (
                      <div key={i} onClick={() => setActiveAudienceIdx(i)} style={{ width: i === activeAudienceIdx ? '20px' : '7px', height: '7px', borderRadius: '99px', background: i === activeAudienceIdx ? '#2631d6' : '#e2e8f0', cursor: 'pointer', transition: 'all .2s' }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* ── Competitors + Reach ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>

            {/* Competitors */}
            {brandData.competitors?.length ? (
              <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--glass-border)', padding: '20px' }}>
                <SectionTitle color="#f59e0b" label="Competitors" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  {brandData.competitors.map((c, i) => (
                    <div key={i} className="comp-card" style={{ borderRadius: '10px', border: '1px solid #f1f5f9', padding: '12px 14px', transition: 'all .12s', cursor: 'default' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#f3f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#2631d6', flexShrink: 0 }}>
                          {initials(c.name)}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-primary)' }}>{c.name}</div>
                        <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--text-dim)', background: 'var(--bg-elevated)', border: '1px solid #f1f5f9', borderRadius: '4px', padding: '1px 6px' }}>{c.type}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Reach & Ecosystem */}
            {brandData.reachAndEcosystem && (
              <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--glass-border)', padding: '20px' }}>
                <SectionTitle color="#3b82f6" label="Reach & Ecosystem" />
                {brandData.reachAndEcosystem.marketingChannels?.length ? (
                  <>
                    <FieldLabel label="Marketing Channels" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
                      {brandData.reachAndEcosystem.marketingChannels.map((ch, i) => (
                        <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <span style={{ color: '#2631d6', marginTop: '1px' }}>›</span>{ch}
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
                {brandData.reachAndEcosystem.customerHangouts?.length ? (
                  <>
                    <FieldLabel label="Customer Hangouts" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {brandData.reachAndEcosystem.customerHangouts.map((ch, i) => (
                        <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <span style={{ color: '#10b981', marginTop: '1px' }}>›</span>{ch}
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>

          {/* ── Impact Analysis ── */}
          {brandData.impactAnalysis && (
            <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--glass-border)', padding: '20px', marginBottom: '20px' }}>
              <SectionTitle color="#ef4444" label="Impact Analysis" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginTop: '14px' }}>
                {[
                  { key: 'revenue', label: 'Revenue', color: '#2631d6', items: brandData.impactAnalysis.revenue },
                  { key: 'cost', label: 'Cost', color: '#f59e0b', items: brandData.impactAnalysis.cost },
                  { key: 'policy', label: 'Policy', color: '#3b82f6', items: brandData.impactAnalysis.policy },
                  { key: 'technology', label: 'Technology', color: '#10b981', items: brandData.impactAnalysis.technology },
                ].map(col => col.items?.length ? (
                  <div key={col.key}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{col.label}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {col.items.map((item, i) => (
                        <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '5px', lineHeight: 1.4 }}>
                          <span style={{ color: col.color, flexShrink: 0, marginTop: '1px' }}>·</span>{item}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null)}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

// ─── Small reusable sub-components ───────────────────────────────────────────

const TaskDone: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#16a34a' }}>
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    {label}
  </div>
);

const SectionTitle: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
    <div style={{ width: '3px', height: '16px', background: color, borderRadius: '2px' }} />
    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{label}</span>
  </div>
);

const FieldLabel: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '.07em', textTransform: 'uppercase', margin: '10px 0 5px' }}>{label}</div>
);

const Pill: React.FC<{ label: string; outline?: boolean }> = ({ label, outline }) => (
  <span style={{
    padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 500,
    background: outline ? 'transparent' : '#f3f0ff',
    border: `1px solid ${outline ? '#c4b5fd' : '#e9d5ff'}`,
    color: '#2631d6',
  }}>{label}</span>
);

const KeywordPill: React.FC<{ label: string }> = ({ label }) => (
  <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 500, background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>{label}</span>
);