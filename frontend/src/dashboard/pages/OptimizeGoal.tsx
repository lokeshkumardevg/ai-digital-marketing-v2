import React, { useState, useRef, useEffect } from 'react';
import { MapPin, DollarSign, Monitor, Zap, ChevronDown, ChevronRight, X, Plus, Edit2, Trash2, Save, Info, ToggleLeft, ToggleRight } from 'lucide-react';

// ─── Dark Theme Tokens ────────────────────────────────────────────────────────
const D = {
  bg:          '#080d1a',
  surface:     '#0f1629',
  surfaceAlt:  '#141d35',
  surfaceHover:'rgba(255,255,255,0.04)',
  border:      'rgba(99,102,241,0.18)',
  borderFocus: '#2631d6',
  borderGlow:  'rgba(124,58,237,0.35)',
  purple:      '#2631d6',
  purpleSoft:  'rgba(124,58,237,0.15)',
  purpleText:  '#a78bfa',
  green:       '#10b981',
  greenSoft:   'rgba(16,185,129,0.12)',
  greenText:   '#34d399',
  red:         '#ef4444',
  redSoft:     'rgba(239,68,68,0.12)',
  yellow:      '#f59e0b',
  yellowSoft:  'rgba(245,158,11,0.12)',
  textPrimary: '#f1f5f9',
  textMuted:   '#94a3b8',
  textDim:     '#475569',
  inputBg:     'rgba(255,255,255,0.04)',
  tagBg:       'rgba(124,58,237,0.18)',
  tagBorder:   'rgba(124,58,237,0.35)',
  white004:    'rgba(255,255,255,0.04)',
  white008:    'rgba(255,255,255,0.08)',
  white012:    'rgba(255,255,255,0.12)',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Strategy {
  id: string;
  name: string;
  locations: string[];
  adPlatforms: string[];
  promoteObjective: string[];
  dailyBudget: string;
  kpiType: string;
  kpiValue: string;
}
interface OptimizeSkill {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  editable?: boolean;
}
interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}
interface ConnectedAccount {
  platformId: string;
  accountName: string;
  accountId: string;
  connectedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const AD_PLATFORMS = [
  { id: 'meta',   label: 'Meta',   icon: '𝕄', color: '#1877f2' },
  { id: 'google', label: 'Google', icon: 'G',  color: '#ea4335' },
];
const PROMOTE_OBJECTIVES = [
  { value: 'Lead',       label: 'Lead' },
  { value: 'Purchase',   label: 'Purchase' },
  { value: 'Awareness',  label: 'Awareness' },
  { value: 'Traffic',    label: 'Traffic' },
  { value: 'Engagement', label: 'Engagement' },
];
const KPI_TYPES = ['CPA', 'ROAS', 'CPC', 'CPM', 'CTR'];
const DEFAULT_SKILLS: OptimizeSkill[] = [
  { id: 'cooldown',     title: 'Post-Increase Cooldown',       description: 'A 36-hour cooldown is enforced after any budget increase. During the cooldown window, hold the budget steady with no further adjustments. Budget decreases and hold actions do not trigger cooldown.', enabled: true },
  { id: 'minor-exempt', title: 'Minor Adjustment Exemption',   description: 'For campaigns with daily budget above $20, any adjustment under 5% or under $5 is automatically converted to hold. For daily budget at or below $20, adjustments under 10% are automatically converted to hold.', enabled: true },
  { id: 'reserve',      title: 'Budget Reserve for Testing',   description: 'When overall KPI attainment is below 90%, reserve 10%-20% of total active spend for new campaign testing. When attainment reaches 90% or above, no reserve is applied.', enabled: true },
];
const LOCATION_SUGGESTIONS = [
  'United States','United Kingdom','India','Canada','Australia',
  'Germany','France','Brazil','Japan','Singapore',
  'Global','North America','Europe','Asia Pacific','MENA',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 8);
const emptyStrategy = (): Strategy => ({
  id: uid(), name: 'Strategy 1', locations: [], adPlatforms: ['meta'],
  promoteObjective: [], dailyBudget: '1200.00', kpiType: 'CPA', kpiValue: '1200.00',
});

// ─── Objective Multi-Select ───────────────────────────────────────────────────
type OptionItem  = { value: string; label: string };
type OptionGroup = { label: string; children: OptionItem[] };

const OBJECTIVE_OPTIONS: OptionGroup[] = [
  { label: 'Leads',   children: [{ value: 'landing', label: 'Leads within landing-page' }, { value: 'instant', label: 'Instant form leads' }, { value: 'calls', label: 'Calls' }] },
  { label: 'Sales',   children: [{ value: 'web', label: 'In-web actions' }] },
  { label: 'Awareness & Engagement', children: [{ value: 'Post', label: 'Post Engagement' }, { value: 'Conversation', label: 'Conversation' }, { value: 'impression', label: 'Impression' }] },
  { label: 'Traffic', children: [{ value: 'Link', label: 'Link clicks' }, { value: 'view', label: 'Page view' }] },
];

const MetaMultiSelect: React.FC<{ selected: string[]; onChange: (val: string[]) => void }> = ({ selected = [], onChange }) => {
  const [open, setOpen]         = useState(false);
  const [expanded, setExpanded] = useState<string[]>(['Leads']);
  const ref = useRef<HTMLDivElement>(null);
  const safe = selected || [];

  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggleItem  = (val: string) => onChange(safe.includes(val) ? safe.filter(v => v !== val) : [...safe, val]);
  const toggleGroup = (g: OptionGroup) => {
    const vals = g.children.map(c => c.value);
    const all  = vals.every(v => safe.includes(v));
    onChange(all ? safe.filter(v => !vals.includes(v)) : [...new Set([...safe, ...vals])]);
  };
  const isGroupChecked       = (g: OptionGroup) => g.children.every(c => safe.includes(c.value));
  const isGroupIndeterminate = (g: OptionGroup) => g.children.some(c => safe.includes(c.value)) && !isGroupChecked(g);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          border: `1px solid ${open ? D.borderFocus : D.border}`,
          borderRadius: 10, padding: 10, cursor: 'pointer',
          minHeight: 44, background: D.inputBg, transition: 'border-color 0.2s',
        }}
      >
        {safe.length === 0 ? (
          <span style={{ color: D.textDim, fontSize: '0.82rem' }}>Select events</span>
        ) : (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {safe.map(val => (
              <span key={val} style={{ background: D.tagBg, border: `1px solid ${D.tagBorder}`, color: D.purpleText, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                {val}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, right: 0,
          background: D.surface, border: `1px solid ${D.border}`,
          borderRadius: 10, boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          maxHeight: 300, overflow: 'auto', zIndex: 100,
        }}>
          {OBJECTIVE_OPTIONS.map(group => (
            <div key={group.label}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', fontWeight: 600, cursor: 'pointer', background: D.white004, borderBottom: `1px solid ${D.border}` }}>
                <input
                  type="checkbox" checked={isGroupChecked(group)}
                  ref={el => { if (el) el.indeterminate = isGroupIndeterminate(group); }}
                  onChange={() => toggleGroup(group)}
                  style={{ accentColor: D.purple }}
                />
                <span
                  onClick={() => setExpanded(prev => prev.includes(group.label) ? prev.filter(g => g !== group.label) : [...prev, group.label])}
                  style={{ marginLeft: 8, fontSize: '0.8rem', color: D.textMuted, userSelect: 'none' }}
                >
                  {expanded.includes(group.label) ? '▼' : '▶'} {group.label}
                </span>
              </div>
              {expanded.includes(group.label) && group.children.map(item => {
                const active = safe.includes(item.value);
                return (
                  <div
                    key={item.value}
                    onClick={() => toggleItem(item.value)}
                    style={{ display: 'flex', alignItems: 'center', padding: '8px 28px', cursor: 'pointer', background: active ? D.purpleSoft : 'transparent', transition: 'all 0.15s', borderBottom: `1px solid ${D.border}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = active ? 'rgba(124,58,237,0.22)' : D.white004)}
                    onMouseLeave={e => (e.currentTarget.style.background = active ? D.purpleSoft : 'transparent')}
                  >
                    <input type="checkbox" checked={active} readOnly style={{ accentColor: D.purple }} />
                    <span style={{ marginLeft: 8, fontSize: '0.8rem', color: active ? D.purpleText : D.textMuted }}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const OptimizeGoal: React.FC = () => {
  const [strategies, setStrategies]               = useState<Strategy[]>([emptyStrategy()]);
  const [activeStrategyId, setActiveStrategy]     = useState<string>(strategies[0].id);
  const [skills, setSkills]                       = useState<OptimizeSkill[]>(DEFAULT_SKILLS);
  const [newSkillText, setNewSkillText]           = useState('');
  const [hasChanges, setHasChanges]               = useState(false);
  const [saved, setSaved]                         = useState(false);
  const [locationQuery, setLocationQuery]         = useState('');
  const [showLocationDrop, setShowLocationDrop]   = useState(false);
  const [editingSkillId, setEditingSkillId]       = useState<string | null>(null);
  const [editingSkillText, setEditingSkillText]   = useState('');
  const [showConnectModal, setShowConnectModal]   = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>(() => {
    try { return JSON.parse(localStorage.getItem('connected_ad_accounts') || '[]'); } catch { return []; }
  });
  const locationRef  = useRef<HTMLDivElement>(null);
  const activeStrategy = strategies.find(s => s.id === activeStrategyId) || strategies[0];

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) setShowLocationDrop(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const updateStrategy = (patch: Partial<Strategy>) => {
    setStrategies(prev => prev.map(s => s.id === activeStrategyId ? { ...s, ...patch } : s));
    setHasChanges(true);
  };
  const addStrategy = () => {
    const s = emptyStrategy();
    s.name = `Strategy ${strategies.length + 1}`;
    setStrategies(prev => [...prev, s]);
    setActiveStrategy(s.id);
    setHasChanges(true);
  };
  const addLocation = (loc: string) => {
    if (!loc.trim() || activeStrategy.locations.includes(loc.trim())) return;
    updateStrategy({ locations: [...activeStrategy.locations, loc.trim()] });
    setLocationQuery(''); setShowLocationDrop(false);
  };
  const removeLocation = (loc: string) =>
    updateStrategy({ locations: activeStrategy.locations.filter(l => l !== loc) });
  const togglePlatform = (pid: string) => {
    const has = activeStrategy.adPlatforms.includes(pid);
    updateStrategy({ adPlatforms: has ? activeStrategy.adPlatforms.filter(p => p !== pid) : [...activeStrategy.adPlatforms, pid] });
  };
  const toggleSkill = (id: string) => { setSkills(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)); setHasChanges(true); };
  const deleteSkill = (id: string) => { setSkills(prev => prev.filter(s => s.id !== id)); setHasChanges(true); };
  const addSkill = () => {
    if (!newSkillText.trim()) return;
    setSkills(prev => [...prev, { id: uid(), title: newSkillText.trim(), description: '', enabled: true, editable: true }]);
    setNewSkillText(''); setHasChanges(true);
  };
  const saveEditSkill = (id: string) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, description: editingSkillText } : s));
    setEditingSkillId(null); setHasChanges(true);
  };
  const handleSave = () => {
    localStorage.setItem('optimize_goal', JSON.stringify({ strategies, skills }));
    setSaved(true); setHasChanges(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const totalBudget  = strategies.reduce((sum, s) => sum + (parseFloat(s.dailyBudget) || 0), 0);
  const allPlatforms = [...new Set(strategies.flatMap(s => s.adPlatforms))];
  const allEvents    = [...new Set(strategies.map(s => s.promoteObjective))];
  const sidebarItems: SidebarItem[] = [
    { icon: <MapPin size={14}/>,     label: 'Target locations',  value: String(strategies.reduce((n,s) => n+s.locations.length,0)), sub: `${strategies.reduce((n,s)=>n+s.locations.length,0)} locations` },
    { icon: <DollarSign size={14}/>, label: 'Total Daily Budget', value: `$${totalBudget.toLocaleString('en-US',{minimumFractionDigits:0})}`, sub: 'Sum of all groups' },
    { icon: <Monitor size={14}/>,    label: 'Ad Platforms',       value: String(allPlatforms.length), sub: `${allPlatforms.length} platform${allPlatforms.length!==1?'s':''}` },
    { icon: <Zap size={14}/>,        label: 'Conversion Events',  value: allEvents[0] || 'None', sub: `${allEvents.length} event${allEvents.length!==1?'s':''}` },
  ];
  const filteredSuggestions = LOCATION_SUGGESTIONS.filter(l =>
    l.toLowerCase().includes(locationQuery.toLowerCase()) && !activeStrategy.locations.includes(l)
  );

  return (
    <div style={{ minHeight: '100%', background: D.bg, display: 'flex', flexDirection: 'column', color: D.textPrimary }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        .skill-row:hover .skill-actions { opacity:1 !important; }
        .loc-tag:hover .loc-x           { opacity:1 !important; }
        .plat-btn:hover { border-color:rgba(124,58,237,0.6) !important; background:rgba(124,58,237,0.1) !important; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track  { background:transparent; }
        ::-webkit-scrollbar-thumb  { background:rgba(124,58,237,0.3); border-radius:3px; }
        ::-webkit-scrollbar-thumb:hover { background:rgba(124,58,237,0.5); }
      `}</style>

      {/* ── Top header ── */}
      <div style={{ background: D.surface, borderBottom: `1px solid ${D.border}`, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: D.textPrimary }}>Optimize Goal</span>
          <div style={{ padding: '3px 10px', background: D.purpleSoft, border: `1px solid ${D.tagBorder}`, borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, color: D.purpleText }}>
            ● Live
          </div>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            style={{ padding: '7px 18px', borderRadius: 8, border: 'none', background: D.purple, color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'opacity 0.2s' }}
          >
            <Save size={13}/> {saved ? 'Saved ✓' : 'Save Changes'}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* ══ LEFT SIDEBAR ══ */}
        <div style={{ width: 168, flexShrink: 0, background: D.surface, borderRight: `1px solid ${D.border}`, padding: '18px 0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0 16px 14px', borderBottom: `1px solid ${D.border}`, marginBottom: 6 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: D.textPrimary, marginBottom: 2 }}>Strategy Overview</div>
            <div style={{ fontSize: '0.68rem', color: D.textDim }}>{strategies.length} Strategy</div>
          </div>
          {sidebarItems.map((item, i) => (
            <div key={i} style={{ padding: '10px 16px', borderBottom: `1px solid ${D.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{ color: D.textDim }}>{item.icon}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: D.textDim }}>{item.label}</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: D.textDim, marginBottom: 1 }}>—</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: D.textPrimary }}>{item.value}</div>
              <div style={{ fontSize: '0.65rem', color: D.textDim }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* ══ MAIN CONTENT ══ */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', paddingBottom: 80 }}>

          {/* ── Budget & Performance KPI ── */}
          <DarkSection title="Budget & Performance KPI *" sub="Define the core logic and positioning to guide AI content depth.">

            {/* Strategy tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${D.border}`, marginBottom: 16 }}>
              {strategies.map(s => (
                <button key={s.id} onClick={() => setActiveStrategy(s.id)} style={{
                  padding: '7px 16px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 600, transition: 'all .15s',
                  color: activeStrategyId === s.id ? D.purpleText : D.textDim,
                  borderBottom: activeStrategyId === s.id ? `2px solid ${D.purple}` : '2px solid transparent',
                }}>
                  {s.name}
                </button>
              ))}
              <button onClick={addStrategy} style={{ padding: '7px 12px', border: 'none', background: 'none', cursor: 'pointer', color: D.textDim, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Plus size={13}/> Add
              </button>
            </div>

            {/* Two-column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>

              {/* LEFT: Location */}
              <div style={{ border: `1px solid ${D.border}`, borderRadius: 10, overflow: 'visible', minHeight: 160, background: D.surface }}>
                <div ref={locationRef} style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: `1px solid ${D.border}` }}>
                    <MapPin size={13} color={D.textDim}/>
                    <input
                      value={locationQuery}
                      onChange={e => { setLocationQuery(e.target.value); setShowLocationDrop(true); }}
                      onFocus={() => setShowLocationDrop(true)}
                      placeholder="Type countries, states, cities..."
                      style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.78rem', color: D.textMuted, background: 'transparent', fontFamily: 'inherit' }}
                      onKeyDown={e => { if (e.key === 'Enter') addLocation(locationQuery); }}
                    />
                  </div>
                  {showLocationDrop && filteredSuggestions.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: D.surface, border: `1px solid ${D.border}`, borderRadius: '0 0 10px 10px', zIndex: 50, maxHeight: 160, overflowY: 'auto', boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}>
                      {filteredSuggestions.map(loc => (
                        <div key={loc} onClick={() => addLocation(loc)}
                          style={{ padding: '8px 14px', fontSize: '0.78rem', color: D.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                          onMouseEnter={e => (e.currentTarget.style.background = D.white004)}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <MapPin size={11} color={D.textDim}/> {loc}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ padding: 14, display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 110, alignContent: 'flex-start' }}>
                  {activeStrategy.locations.length === 0 ? (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 90, color: D.textDim }}>
                      <MapPin size={22} color={D.textDim}/>
                      <div style={{ fontSize: '0.75rem', marginTop: 6, color: D.textDim }}>No location added</div>
                    </div>
                  ) : activeStrategy.locations.map(loc => (
                    <span key={loc} className="loc-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: D.tagBg, border: `1px solid ${D.tagBorder}`, fontSize: '0.75rem', color: D.purpleText, fontWeight: 500, position: 'relative' }}>
                      {loc}
                      <span className="loc-x" onClick={() => removeLocation(loc)} style={{ cursor: 'pointer', opacity: 0, transition: 'opacity .12s', lineHeight: 1, fontSize: '0.7rem', color: D.purpleText }}>✕</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* RIGHT: Platform + Objective + Budget */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Ad Platforms */}
                <div style={{ border: `1px solid ${D.border}`, borderRadius: 10, padding: '12px 14px', background: D.surface }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: D.textMuted }}>Ad Platforms</span>
                    <ChevronDown size={13} color={D.textDim}/>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {AD_PLATFORMS.map(p => {
                      const active = activeStrategy.adPlatforms.includes(p.id);
                      return (
                        <button key={p.id} className="plat-btn" onClick={() => togglePlatform(p.id)} style={{
                          padding: '5px 10px', borderRadius: 6,
                          border: `1.5px solid ${active ? p.color : D.border}`,
                          background: active ? `${p.color}18` : D.white004,
                          color: active ? p.color : D.textDim,
                          cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 5, transition: 'all .12s',
                        }}>
                          <span style={{ fontSize: '0.85rem' }}>{p.icon}</span> {p.label}
                        </button>
                      );
                    })}
                  </div>
                  {activeStrategy.adPlatforms.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: '0.68rem', color: D.textDim }}>
                      {activeStrategy.adPlatforms.length} Platform{activeStrategy.adPlatforms.length > 1 ? 's' : ''} Selected
                    </div>
                  )}
                </div>

                {/* Objective multi-select */}
                <MetaMultiSelect
                  selected={activeStrategy.promoteObjective}
                  onChange={vals => updateStrategy({ promoteObjective: vals })}
                />

                {/* Daily Budget + KPI */}
                <div style={{ border: `1px solid ${D.border}`, borderRadius: 10, padding: '12px 14px', background: D.surface }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {/* Daily Budget */}
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: D.textDim, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>Daily Budget</div>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: '0.78rem', color: D.textDim }}>$</span>
                        <input
                          value={activeStrategy.dailyBudget}
                          onChange={e => updateStrategy({ dailyBudget: e.target.value })}
                          type="number"
                          style={{ width: '65%', padding: '7px 8px 7px 22px', borderRadius: 7, border: `1px solid ${D.border}`, fontSize: '0.82rem', fontWeight: 600, color: D.textPrimary, outline: 'none', background: D.inputBg, boxSizing: 'border-box' as const, fontFamily: 'inherit' }}
                          onFocus={e => (e.target.style.borderColor = D.purple)}
                          onBlur={e => (e.target.style.borderColor = D.border)}
                        />
                      </div>
                    </div>
                    {/* Performance KPI */}
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: D.textDim, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>Performance KPI</div>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <select
                            value={activeStrategy.kpiType}
                            onChange={e => updateStrategy({ kpiType: e.target.value })}
                            style={{ padding: '7px 22px 7px 8px', borderRadius: 7, border: `1px solid ${D.border}`, fontSize: '0.78rem', fontWeight: 600, color: D.textPrimary, outline: 'none', background: D.inputBg, appearance: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            {KPI_TYPES.map(k => <option key={k} value={k} style={{ background: '#0f1629' }}>{k}</option>)}
                          </select>
                          <ChevronDown size={10} style={{ position: 'absolute', right: 5, top: '50%', transform: 'translateY(-50%)', color: D.textDim, pointerEvents: 'none' }}/>
                        </div>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <span style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', fontSize: '0.78rem', color: D.green }}>✦</span>
                          <input
                            value={activeStrategy.kpiValue}
                            onChange={e => updateStrategy({ kpiValue: e.target.value })}
                            type="number"
                            style={{ width: '100%', padding: '7px 6px 7px 20px', borderRadius: 7, border: `1px solid ${D.border}`, fontSize: '0.82rem', fontWeight: 600, color: D.textPrimary, outline: 'none', background: D.inputBg, boxSizing: 'border-box' as const, fontFamily: 'inherit' }}
                            onFocus={e => (e.target.style.borderColor = D.purple)}
                            onBlur={e => (e.target.style.borderColor = D.border)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DarkSection>

          {/* ── Ad Scope ── */}
          <DarkSection title="Ad Scope (Assigned account)" sub="Define the core logic and positioning to guide AI content depth.">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', padding: '12px 0' }}>
              {AD_PLATFORMS.map(p => {
                const active = activeStrategy.adPlatforms.includes(p.id);
                return (
                  <button key={p.id} onClick={() => togglePlatform(p.id)} style={{
                    padding: '7px 16px', borderRadius: 20,
                    border: `1.5px solid ${active ? p.color : D.border}`,
                    background: active ? `${p.color}18` : D.white004,
                    color: active ? p.color : D.textDim,
                    cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s',
                  }}>
                    <span style={{ fontSize: '0.9rem' }}>{p.icon}</span> {p.label}
                    {active && <span style={{ fontSize: '0.65rem', opacity: .7 }}>✓</span>}
                  </button>
                );
              })}
              <button
                onClick={() => setShowConnectModal(true)}
                style={{ padding: '7px 16px', borderRadius: 20, border: `1px dashed ${D.tagBorder}`, background: D.purpleSoft, color: D.purpleText, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={13}/> Connect Ad Platform
              </button>
              {connectedAccounts.map(acc => {
                const plat = AD_PLATFORMS.find(p => p.id === acc.platformId);
                return plat ? (
                  <div key={acc.platformId} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 20, background: `${plat.color}18`, border: `1px solid ${plat.color}40`, fontSize: '0.75rem', fontWeight: 600, color: plat.color }}>
                    <span>{plat.icon}</span> {acc.accountName}
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: D.green, display: 'inline-block' }}/>
                  </div>
                ) : null;
              })}
            </div>
          </DarkSection>

          {/* ── Optimize Skills ── */}
          <DarkSection title="Optimize Skills" sub="Define the core logic and positioning to guide AI content depth.">
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: D.textMuted }}>Active Skills</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.68rem', color: D.textDim }}>All</span>
                <div
                  onClick={() => { const allOn = skills.every(s => s.enabled); setSkills(prev => prev.map(s => ({ ...s, enabled: !allOn }))); setHasChanges(true); }}
                  style={{ width: 32, height: 18, borderRadius: 99, background: skills.every(s => s.enabled) ? D.purple : D.white012, cursor: 'pointer', position: 'relative', transition: 'background .2s' }}
                >
                  <div style={{ position: 'absolute', top: 2, left: skills.every(s => s.enabled) ? 14 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.4)' }}/>
                </div>
              </div>
            </div>

            {/* Skills list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {skills.map(skill => (
                <div
                  key={skill.id}
                  className="skill-row"
                  style={{ border: `1px solid ${D.border}`, borderRadius: 8, padding: '11px 14px', background: D.white004, transition: 'border-color .12s, background .12s', position: 'relative' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = D.borderGlow; e.currentTarget.style.background = D.white008; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = D.border; e.currentTarget.style.background = D.white004; }}
                >
                  {editingSkillId === skill.id ? (
                    <div>
                      <div style={{ fontSize: '0.83rem', fontWeight: 600, color: D.textPrimary, marginBottom: 6 }}>{skill.title}</div>
                      <textarea
                        value={editingSkillText}
                        onChange={e => setEditingSkillText(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: `1px solid ${D.purple}`, fontSize: '0.78rem', color: D.textMuted, outline: 'none', resize: 'vertical', fontFamily: 'inherit', minHeight: 60, boxSizing: 'border-box' as const, background: D.inputBg }}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        <button onClick={() => saveEditSkill(skill.id)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: D.purple, color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Save</button>
                        <button onClick={() => setEditingSkillId(null)} style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${D.border}`, background: D.white004, color: D.textMuted, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.83rem', fontWeight: 600, color: D.textPrimary, marginBottom: 3 }}>{skill.title}</div>
                        {skill.description && <div style={{ fontSize: '0.75rem', color: D.textDim, lineHeight: 1.55 }}>{skill.description}</div>}
                      </div>
                      <div className="skill-actions" style={{ display: 'flex', gap: 4, alignItems: 'center', opacity: 0, transition: 'opacity .15s', flexShrink: 0 }}>
                        <DarkIconBtn icon={<Edit2 size={11}/>}  onClick={() => { setEditingSkillId(skill.id); setEditingSkillText(skill.description); }} title="Edit"/>
                        <DarkIconBtn icon={<Trash2 size={11}/>} onClick={() => deleteSkill(skill.id)} danger title="Delete"/>
                      </div>
                      <div
                        onClick={() => toggleSkill(skill.id)}
                        style={{ width: 30, height: 17, borderRadius: 99, background: skill.enabled ? D.purple : D.white012, cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}
                      >
                        <div style={{ position: 'absolute', top: 1.5, left: skill.enabled ? 13 : 1.5, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.4)' }}/>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Skill */}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: D.textMuted }}>Add Skill</span>
                <Info size={12} color={D.textDim}/>
              </div>
              <div style={{ border: `1.5px solid ${newSkillText ? D.purple : D.border}`, borderRadius: 10, padding: '10px 14px', background: D.white004, display: 'flex', gap: 8, alignItems: 'flex-end', transition: 'border-color .15s' }}>
                <textarea
                  value={newSkillText}
                  onChange={e => setNewSkillText(e.target.value)}
                  placeholder="Add new optimization skill..."
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.82rem', color: D.textMuted, resize: 'none', fontFamily: 'inherit', minHeight: 52, lineHeight: 1.5, background: 'transparent' }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addSkill(); } }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: '0.68rem', color: D.textDim }}>{newSkillText.length}/200</span>
                  <button
                    onClick={addSkill}
                    disabled={!newSkillText.trim()}
                    style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: newSkillText.trim() ? D.purple : D.white008, color: newSkillText.trim() ? '#fff' : D.textDim, cursor: newSkillText.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}
                  >
                    <ChevronRight size={14}/>
                  </button>
                </div>
              </div>
            </div>
          </DarkSection>
        </div>
      </div>

      {/* ══ CONNECT MODAL ══ */}
      {showConnectModal && (
        <ConnectPlatformModal
          connectedAccounts={connectedAccounts}
          onConnect={acc => {
            const updated = [...connectedAccounts.filter(a => a.platformId !== acc.platformId), acc];
            setConnectedAccounts(updated);
            localStorage.setItem('connected_ad_accounts', JSON.stringify(updated));
            if (!activeStrategy.adPlatforms.includes(acc.platformId)) {
              updateStrategy({ adPlatforms: [...activeStrategy.adPlatforms, acc.platformId] });
            }
          }}
          onDisconnect={platformId => {
            const updated = connectedAccounts.filter(a => a.platformId !== platformId);
            setConnectedAccounts(updated);
            localStorage.setItem('connected_ad_accounts', JSON.stringify(updated));
          }}
          onClose={() => setShowConnectModal(false)}
        />
      )}
    </div>
  );
};

// ─── Dark Section wrapper ─────────────────────────────────────────────────────
const DarkSection: React.FC<{ title: string; sub: string; children: React.ReactNode }> = ({ title, sub, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: '0.75rem', color: '#475569' }}>{sub}</div>
    </div>
    <div style={{ background: '#0f1629', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 12, padding: '18px 20px' }}>
      {children}
    </div>
  </div>
);

// ─── Dark Icon Button ─────────────────────────────────────────────────────────
const DarkIconBtn: React.FC<{ icon: React.ReactNode; onClick: () => void; danger?: boolean; title?: string }> = ({ icon, onClick, danger, title }) => (
  <button
    onClick={onClick} title={title}
    style={{
      width: 24, height: 24, borderRadius: 5,
      border: `1px solid ${danger ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.18)'}`,
      background: danger ? 'rgba(239,68,68,0.10)' : 'rgba(255,255,255,0.04)',
      color: danger ? '#ef4444' : '#94a3b8',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .12s',
    }}
    onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.20)' : 'rgba(255,255,255,0.08)')}
    onMouseLeave={e => (e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.10)' : 'rgba(255,255,255,0.04)')}
  >{icon}</button>
);

// ─── Connect Platform Modal ───────────────────────────────────────────────────
const PLATFORM_DETAILS = {
  meta: {
    id: 'meta', label: 'Meta (Facebook & Instagram)', icon: '𝕄', color: '#1877f2',
    bg: 'rgba(24,119,242,0.12)', description: 'Connect your Meta Business account to run ads on Facebook and Instagram.',
    permissions: ['ads_read','ads_management','business_management','pages_read_engagement'],
    docsUrl: 'https://developers.facebook.com/docs/marketing-apis',
  },
  google: {
    id: 'google', label: 'Google Ads', icon: 'G', color: '#ea4335',
    bg: 'rgba(234,67,53,0.12)', description: 'Connect your Google Ads account to run Search, Display, and YouTube campaigns.',
    permissions: ['https://www.googleapis.com/auth/adwords'],
    docsUrl: 'https://developers.google.com/google-ads/api/docs',
  },
};

interface ConnectPlatformModalProps {
  connectedAccounts: ConnectedAccount[];
  onConnect: (acc: ConnectedAccount) => void;
  onDisconnect: (platformId: string) => void;
  onClose: () => void;
}

const ConnectPlatformModal: React.FC<ConnectPlatformModalProps> = ({ connectedAccounts, onConnect, onDisconnect, onClose }) => {
  const [step, setStep]                     = useState<'list'|'detail'|'connecting'|'manual'>('list');
  const [selectedPlat, setSelectedPlat]     = useState<keyof typeof PLATFORM_DETAILS | null>(null);
  const [connectStatus, setConnectStatus]   = useState<'idle'|'waiting'|'success'|'error'>('idle');
  const [errorMsg, setErrorMsg]             = useState('');
  const [manualId, setManualId]             = useState('');
  const [manualName, setManualName]         = useState('');
  const [manualToken, setManualToken]       = useState('');
  const platInfo    = selectedPlat ? PLATFORM_DETAILS[selectedPlat] : null;
  const isConnected = (id: string) => connectedAccounts.some(a => a.platformId === id);

  const startOAuth = async () => {
    if (!selectedPlat) return;
    setStep('connecting'); setConnectStatus('waiting');
    try {
      const res = await fetch(`http://localhost:3000/auth/oauth-url/${selectedPlat}`, { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')||''}` } });
      if (!res.ok) throw new Error('Could not get OAuth URL from server');
      const { url } = await res.json();
      const popup = window.open(url, `connect_${selectedPlat}`, 'width=520,height=640,scrollbars=yes,resizable=yes');
      const timer = setInterval(() => {
        if (popup?.closed) {
          clearInterval(timer);
          const stored = localStorage.getItem(`oauth_result_${selectedPlat}`);
          if (stored) {
            const result = JSON.parse(stored);
            localStorage.removeItem(`oauth_result_${selectedPlat}`);
            onConnect({ platformId: selectedPlat, accountName: result.accountName, accountId: result.accountId, connectedAt: new Date().toISOString() });
            setConnectStatus('success');
          } else { setConnectStatus('error'); setErrorMsg('Connection was cancelled or failed. Try manual setup below.'); }
        }
      }, 800);
    } catch (err: any) { setConnectStatus('error'); setErrorMsg(err.message || 'Failed to start OAuth.'); }
  };

  const saveManual = async () => {
    if (!selectedPlat || !manualId.trim() || !manualToken.trim()) return;
    setConnectStatus('waiting');
    try {
      const res = await fetch('http://localhost:3000/auth/connect-platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('access_token')||''}` },
        body: JSON.stringify({ platformId: selectedPlat, accountId: manualId.trim(), accessToken: manualToken.trim(), accountName: manualName.trim()||manualId.trim() }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      onConnect({ platformId: selectedPlat, accountName: data.accountName||manualName||manualId, accountId: manualId, connectedAt: new Date().toISOString() });
      setConnectStatus('success');
    } catch (err: any) { setConnectStatus('error'); setErrorMsg(err.message); }
  };

  // ── Modal backdrop + card ──
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#0f1629', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, width: 520, maxHeight: '88vh', overflow: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', animation: 'fadeUp .2s ease-out' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            {step !== 'list' && (
              <button onClick={() => { setStep('list'); setSelectedPlat(null); setConnectStatus('idle'); setErrorMsg(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600, padding: 0, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                ← Back
              </button>
            )}
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9' }}>
              {step === 'list' ? 'Connect Ad Platform' : platInfo?.label}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>
              {step === 'list' ? 'Choose a platform to connect your ad account' : platInfo?.description}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(99,102,241,0.18)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: '#94a3b8', flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >✕</button>
        </div>

        <div style={{ padding: '16px 24px 24px' }}>

          {/* ── LIST ── */}
          {step === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.values(PLATFORM_DETAILS).map(plat => {
                const connected = isConnected(plat.id);
                const acc = connectedAccounts.find(a => a.platformId === plat.id);
                return (
                  <div key={plat.id}
                    style={{ border: `1.5px solid ${connected ? plat.color+'50' : 'rgba(99,102,241,0.18)'}`, borderRadius: 14, padding: 16, cursor: connected ? 'default' : 'pointer', transition: 'all .15s', background: connected ? `${plat.color}08` : 'rgba(255,255,255,0.02)' }}
                    onMouseEnter={e => { if (!connected) (e.currentTarget as HTMLDivElement).style.borderColor = plat.color+'80'; }}
                    onMouseLeave={e => { if (!connected) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.18)'; }}
                    onClick={() => { if (!connected) { setSelectedPlat(plat.id as keyof typeof PLATFORM_DETAILS); setStep('detail'); } }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: plat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: plat.color, flexShrink: 0 }}>
                        {plat.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f1f5f9', marginBottom: 2 }}>{plat.label}</div>
                        {connected && acc ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}/>
                            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Connected — {acc.accountName}</span>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.72rem', color: '#475569' }}>{plat.description.slice(0, 60)}...</div>
                        )}
                      </div>
                      {connected ? (
                        <button onClick={e => { e.stopPropagation(); onDisconnect(plat.id); }}
                          style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.10)', color: '#ef4444', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, flexShrink: 0 }}>
                          Disconnect
                        </button>
                      ) : (
                        <div style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${plat.color}`, background: plat.bg, color: plat.color, fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>
                          Connect →
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── DETAIL ── */}
          {step === 'detail' && platInfo && (
            <div>
              <div style={{ background: platInfo.bg, border: `1px solid ${platInfo.color}30`, borderRadius: 12, padding: 16, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 800, color: platInfo.color }}>
                  {platInfo.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>{platInfo.label}</div>
                  <a href={platInfo.docsUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', color: platInfo.color }}>View API docs ↗</a>
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Permissions requested</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {platInfo.permissions.map(p => (
                    <span key={p} style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.18)', fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>{p}</span>
                  ))}
                </div>
              </div>
              <button onClick={startOAuth} style={{ width: '100%', padding: 12, borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${platInfo.color}, ${platInfo.color}cc)`, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: '1rem' }}>{platInfo.icon}</span> Connect with {platInfo.label.split(' ')[0]}
              </button>
              <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#475569', marginBottom: 12 }}>— or set up manually —</div>
              <button onClick={() => setStep('manual')} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid rgba(99,102,241,0.18)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                Enter Access Token Manually
              </button>
            </div>
          )}

          {/* ── MANUAL ── */}
          {step === 'manual' && platInfo && (
            <div>
              <div style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: '0.78rem', color: '#fbbf24', lineHeight: 1.5 }}>
                Get your access token from the <a href={platInfo.docsUrl} target="_blank" rel="noreferrer" style={{ color: platInfo.color, fontWeight: 600 }}>{platInfo.label} developer portal</a>. Keep it secret — never share it publicly.
              </div>
              {[
                { label: 'Account ID', placeholder: selectedPlat === 'meta' ? 'act_123456789' : '123-456-7890', value: manualId, set: setManualId },
                { label: 'Account Name (optional)', placeholder: 'My Business Account', value: manualName, set: setManualName },
                { label: 'Access Token', placeholder: 'Paste your access token here...', value: manualToken, set: setManualToken },
              ].map(field => (
                <div key={field.label} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>{field.label}</label>
                  <input
                    value={field.value}
                    onChange={e => field.set(e.target.value)}
                    placeholder={field.placeholder}
                    type={field.label.includes('Token') ? 'password' : 'text'}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.18)', fontSize: '0.82rem', color: '#f1f5f9', outline: 'none', background: 'rgba(255,255,255,0.04)', boxSizing: 'border-box' as const, fontFamily: 'monospace' }}
                    onFocus={e => (e.target.style.borderColor = platInfo.color)}
                    onBlur={e => (e.target.style.borderColor = 'rgba(99,102,241,0.18)')}
                  />
                </div>
              ))}
              {connectStatus === 'error' && (
                <div style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: '0.75rem', color: '#f87171' }}>{errorMsg}</div>
              )}
              <button
                onClick={saveManual}
                disabled={!manualId.trim() || !manualToken.trim() || connectStatus === 'waiting'}
                style={{ width: '100%', padding: 11, borderRadius: 10, border: 'none', background: (!manualId.trim() || !manualToken.trim()) ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#2631d6,#1e27a8)', color: (!manualId.trim() || !manualToken.trim()) ? '#475569' : '#fff', cursor: (!manualId.trim() || !manualToken.trim()) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.88rem' }}
              >
                {connectStatus === 'waiting' ? 'Saving...' : 'Save Connection'}
              </button>
            </div>
          )}

          {/* ── CONNECTING ── */}
          {step === 'connecting' && platInfo && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              {connectStatus === 'waiting' && (
                <>
                  <div style={{ width: 48, height: 48, border: `4px solid rgba(255,255,255,0.08)`, borderTopColor: platInfo.color, borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 16px' }}/>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f1f5f9', marginBottom: 6 }}>Waiting for authorization...</div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: 16 }}>Complete the sign-in in the popup window.</div>
                  <button onClick={() => setStep('manual')} style={{ fontSize: '0.75rem', color: '#2631d6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>No popup? Enter token manually</button>
                </>
              )}
              {connectStatus === 'success' && (
                <>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '1.4rem' }}>✓</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#10b981', marginBottom: 6 }}>Connected successfully!</div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: 20 }}>{platInfo.label} is now connected.</div>
                  <button onClick={onClose} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2631d6,#1e27a8)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>Done</button>
                </>
              )}
              {connectStatus === 'error' && (
                <>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '1.4rem' }}>✕</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ef4444', marginBottom: 6 }}>Connection failed</div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: 16 }}>{errorMsg}</div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button onClick={() => { setStep('detail'); setConnectStatus('idle'); }} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.18)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>Try Again</button>
                    <button onClick={() => { setStep('manual'); setConnectStatus('idle'); }} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#2631d6', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>Manual Setup</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};