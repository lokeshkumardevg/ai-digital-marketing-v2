import React, { useState, useEffect } from 'react';
import { FileEdit, Sparkles, Plus, Wand2, Copy, Trash2, ChevronDown, ToggleLeft, ToggleRight, Image, Type, Video } from 'lucide-react';

const platforms = ['All', 'Meta', 'Google', 'TikTok'];

const componentIcons: Record<string, React.ElementType> = {
  Image, Headline: Type, Copy: FileEdit, Video, CTA: Sparkles,
};

export const DraftAiRecs: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState('All');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoPublish, setAutoPublish] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('http://localhost:3000/campaigns', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => res.json())
    .then(json => {
      const mapped = json.map((c: any) => ({
        id: c._id,
        name: c.name || 'AI Campaign Concept',
        platform: c.platform || 'Meta',
        status: (c.status || 'review').toLowerCase(),
        score: Math.floor(c.aiStrategy?.performanceScore || (Math.random() * 30 + 60)),
        rec: c.aiStrategy?.marketingStrategy || 'Add urgency CTA — "Limited time only!" to boost CTR by ~18%',
        components: ['Image', 'Headline', 'Copy'],
        autoPublish: false
      }));
      setDrafts(mapped);
      setLoading(false);
      if (mapped.length > 0) setExpanded(mapped[0].id);
    })
    .catch(err => {
      console.error('Drafts fetch failed', err);
      setLoading(false);
    });
  }, []);

  const filtered = activePlatform === 'All' ? drafts : drafts.filter(d => d.platform === activePlatform);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="animate-fade-in" style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Analyzing Opportunities...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--glass-border)', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '3px' }}>AI Optimize</div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Draft & AI Recs</h1>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '8px', background: 'linear-gradient(135deg, #2631d6, #1e27a8)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
          <Plus size={14} /> New Draft
        </button>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Platform Tabs */}
        <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-elevated)', borderRadius: '8px', padding: '3px', width: 'fit-content', marginBottom: '20px' }}>
          {platforms.map(p => (
            <button key={p} onClick={() => setActivePlatform(p)} style={{
              padding: '6px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
              background: activePlatform === p ? '#fff' : 'transparent',
              color: activePlatform === p ? '#0f172a' : '#64748b',
              boxShadow: activePlatform === p ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s'
            }}>{p}</button>
          ))}
        </div>

        {/* Recommended Ads */}
        <div style={{ marginBottom: '10px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Recommended Ads <span style={{ background: '#2631d6', color: '#fff', borderRadius: '99px', padding: '1px 8px', fontSize: '0.72rem', fontWeight: 700, marginLeft: '6px' }}>{filtered.length}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((draft) => (
            <div key={draft.id} style={{ background: 'var(--bg-card)', border: `1px solid ${expanded === draft.id ? '#c4b5fd' : '#e8eaf0'}`, borderRadius: '12px', overflow: 'hidden', transition: 'all 0.2s' }}>
              {/* Card Header */}
              <div onClick={() => setExpanded(expanded === draft.id ? null : draft.id)}
                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f8f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Image size={18} color="#2631d6" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '3px' }}>{draft.name}</div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '5px', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 600 }}>{draft.platform}</span>
                    <span style={{ padding: '2px 8px', borderRadius: '5px', background: draft.status === 'approved' ? '#f0fdf4' : '#fffbeb', color: draft.status === 'approved' ? '#16a34a' : '#d97706', fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize' }}>{draft.status}</span>
                  </div>
                </div>
                {/* Auto-publish Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={e => e.stopPropagation()}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Auto-publish</span>
                  <button onClick={() => setAutoPublish(prev => ({ ...prev, [draft.id]: !prev[draft.id] }))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: autoPublish[draft.id] ? '#2631d6' : '#cbd5e1', padding: 0 }}>
                    {autoPublish[draft.id] ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                </div>
                {/* AI Score */}
                <div style={{ textAlign: 'center', minWidth: '50px' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: draft.score > 75 ? '#16a34a' : draft.score > 55 ? '#d97706' : '#dc2626', fontFamily: 'Outfit' }}>{draft.score}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600 }}>AI SCORE</div>
                </div>
                <ChevronDown size={16} color="#94a3b8" style={{ transform: expanded === draft.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
              </div>

              {/* Expanded Content */}
              {expanded === draft.id && (
                <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 20px' }}>
                  {/* Ad Components */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Ad Components</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {draft.components.map((comp: string) => {
                        const Icon = componentIcons[comp] || FileEdit;
                        return (
                          <div key={comp} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '8px', background: '#f8f4ff', border: '1px solid #ede9fe', color: '#1e27a8', fontSize: '0.78rem', fontWeight: 600 }}>
                            <Icon size={12} /> {comp}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI Recommendation */}
                  <div style={{ background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px', display: 'flex', gap: '10px' }}>
                    <Sparkles size={16} color="#2631d6" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2631d6', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Recommendation</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.5 }}>{draft.rec}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', borderRadius: '8px', background: 'linear-gradient(135deg, #2631d6, #1e27a8)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', boxShadow: '0 4px 12px rgba(124,58,237,0.25)' }}>
                      <Wand2 size={13} /> Apply AI Fix
                    </button>
                    <button style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', fontWeight: 600 }}>
                      <Copy size={13} /> Duplicate
                    </button>
                    <button style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #fee2e2', background: 'var(--bg-card)', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', fontWeight: 600 }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
