import React, { useState, useRef, useEffect } from 'react';
import { MapPin, DollarSign, Monitor, Zap, ChevronDown, ChevronRight, X, Plus, Edit2, Trash2, Save, Info, ToggleLeft, ToggleRight } from 'lucide-react';

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
  { value: 'Lead',       label: 'Lead',        desc: 'Leads → Leads within landing-page → Lead' },
  { value: 'Purchase',   label: 'Purchase',    desc: 'Drive purchases and transactions' },
  { value: 'Awareness',  label: 'Awareness',   desc: 'Maximize reach and brand visibility' },
  { value: 'Traffic',    label: 'Traffic',     desc: 'Send people to your website' },
  { value: 'Engagement', label: 'Engagement',  desc: 'Increase interaction with your content' },
];

const KPI_TYPES = ['CPA', 'ROAS', 'CPC', 'CPM', 'CTR'];

const DEFAULT_SKILLS: OptimizeSkill[] = [
  {
    id: 'cooldown',
    title: 'Post-Increase Cooldown',
    description: 'A 36-hour cooldown is enforced after any budget increase. During the cooldown window, hold the budget steady with no further adjustments. Budget decreases and hold actions do not trigger cooldown.',
    enabled: true,
  },
  {
    id: 'minor-exempt',
    title: 'Minor Adjustment Exemption',
    description: 'For campaigns with daily budget above $20, any adjustment under 5% or under $5 is automatically converted to hold. For daily budget at or below $20, adjustments under 10% are automatically converted to hold.',
    enabled: true,
  },
  {
    id: 'reserve',
    title: 'Budget Reserve for Testing',
    description: 'When overall KPI attainment is below 90%, reserve 10%-20% of total active spend for new campaign testing. When attainment reaches 90% or above, no reserve is applied.',
    enabled: true,
  },
];

const LOCATION_SUGGESTIONS = [
  'United States', 'United Kingdom', 'India', 'Canada', 'Australia',
  'Germany', 'France', 'Brazil', 'Japan', 'Singapore',
  'Global', 'North America', 'Europe', 'Asia Pacific', 'MENA',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 8);

const emptyStrategy = (): Strategy => ({
  id: uid(),
  name: 'Strategy 1',
  locations: [],
  adPlatforms: ['meta'],
  promoteObjective: [],
  dailyBudget: '1200.00',
  kpiType: 'CPA',
  kpiValue: '1200.00',
});



type OptionItem = {
  value: string;
  label: string;
};

type OptionGroup = {
  label: string;
  children: OptionItem[];
};

const OBJECTIVE_OPTIONS: OptionGroup[] = [
  {
    label: "Leads",
    children: [
      { value: "landing", label: "Leads within landing-page" },
      { value: "instant", label: "Instant form leads" },
      { value: "calls", label: "Calls" },
    ],
  },
  {
    label: "Sales",
    children: [{ value: "web", label: "In-web actions" }],
  },
  {
    label: "Awareness & Engagement",
    children: [{ value: "Post", label: "Post Engagement" },
      { value: "Conversation", label: "Conversation"},
      { value: "impression", label: "impression" }
    ],
  },
  {
    label: "Traffic",
    children: [{ value: "Link", label: "Link clicks" },
      { value: "view", label: "Page view" }
    ],
  },
];

const MetaMultiSelect: React.FC<{
  selected: string[];
  onChange: (val: string[]) => void;
}> = ({ selected = [], onChange }) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(["Leads"]);
  const ref = useRef<HTMLDivElement>(null);

  const safeSelected = selected || [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleItem = (val: string) => {
    onChange(
      safeSelected.includes(val)
        ? safeSelected.filter((v) => v !== val)
        : [...safeSelected, val]
    );
  };

  const toggleGroup = (group: OptionGroup) => {
    const values = group.children.map((c) => c.value);
    const allSelected = values.every((v) => safeSelected.includes(v));

    if (allSelected) {
      onChange(safeSelected.filter((v) => !values.includes(v)));
    } else {
      onChange([...new Set([...safeSelected, ...values])]);
    }
  };

  const isGroupChecked = (group: OptionGroup) =>
    group.children.every((c) => safeSelected.includes(c.value));

  const isGroupIndeterminate = (group: OptionGroup) =>
    group.children.some((c) => safeSelected.includes(c.value)) &&
    !isGroupChecked(group);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
        
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "10px",
          cursor: "pointer",
          minHeight: "44px",
          background: "#fff",
        }}
      >
        {safeSelected.length === 0 ? (
       <span style={{ color: "#7f7d7d" }}>Select events</span>
        ) : (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {safeSelected.map((val) => (
              <span
                key={val}
                style={{
                  
                  background: "#ede9fe",
                  color: "#000",
                  padding: "4px 8px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 500,
                }}
              >
                {val}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
            maxHeight: "300px",
            overflow: "auto",
            zIndex: 100,
          }}
        >
          {OBJECTIVE_OPTIONS.map((group) => (
            <div key={group.label}>
              {/* Group Header */}
              <div
                style={{
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "#f8fafc",
                }}
              >
                <input
                  type="checkbox"
                  checked={isGroupChecked(group)}
                  ref={(el) => {
                    if (el)
                      el.indeterminate = isGroupIndeterminate(group);
                  }}
                  onChange={() => toggleGroup(group)}
                />

                <span
                  onClick={() =>
                    setExpanded((prev) =>
                      prev.includes(group.label)
                        ? prev.filter((g) => g !== group.label)
                        : [...prev, group.label]
                    )
                  }
                  style={{ marginLeft: 8 }}
                >
                  {expanded.includes(group.label) ? "▼" : "▶"}{" "}
                  {group.label}
                </span>
              </div>

              {/* Children */}
              {expanded.includes(group.label) &&
                group.children.map((item) => {
                  const active = safeSelected.includes(item.value);

                  return (
                    <div
                      key={item.value}
                      onClick={() => toggleItem(item.value)}
                      style={{
                        color: "#000",
                        display: "flex",
                        alignItems: "center",
                        padding: "8px 28px",
                        cursor: "pointer",
                        background: active ? "#dddcdf" : "#fff",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = active
                          ? "#ddd6fe"
                          : "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = active
                          ? "#ede9fe"
                          : "#fff")
                      }
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        readOnly
                      />
                      <span style={{ marginLeft: 8 }}>
                        {item.label}
                      </span>
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
  const [strategies, setStrategies]         = useState<Strategy[]>([emptyStrategy()]);
  const [activeStrategyId, setActiveStrategy] = useState<string>(strategies[0].id);
  const [skills, setSkills]                 = useState<OptimizeSkill[]>(DEFAULT_SKILLS);
  const [newSkillText, setNewSkillText]     = useState('');
  const [hasChanges, setHasChanges]         = useState(false);
  const [saved, setSaved]                   = useState(false);
  const [locationQuery, setLocationQuery]   = useState('');
  const [showLocationDrop, setShowLocationDrop] = useState(false);
  const [showObjectiveDrop, setShowObjectiveDrop] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editingSkillText, setEditingSkillText] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>(() => {
    try { return JSON.parse(localStorage.getItem('connected_ad_accounts') || '[]'); } catch { return []; }
  });
  const locationRef = useRef<HTMLDivElement>(null);
  const objectiveRef = useRef<HTMLDivElement>(null);

  const activeStrategy = strategies.find(s => s.id === activeStrategyId) || strategies[0];

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) setShowLocationDrop(false);
      if (objectiveRef.current && !objectiveRef.current.contains(e.target as Node)) setShowObjectiveDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Strategy helpers ──────────────────────────────────────────────────────

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
    setLocationQuery('');
    setShowLocationDrop(false);
  };

  const removeLocation = (loc: string) =>
    updateStrategy({ locations: activeStrategy.locations.filter(l => l !== loc) });

  const togglePlatform = (pid: string) => {
    const has = activeStrategy.adPlatforms.includes(pid);
    updateStrategy({ adPlatforms: has ? activeStrategy.adPlatforms.filter(p => p !== pid) : [...activeStrategy.adPlatforms, pid] });
  };

  // ── Skills helpers ────────────────────────────────────────────────────────

  const toggleSkill = (id: string) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    setHasChanges(true);
  };

  const deleteSkill = (id: string) => {
    setSkills(prev => prev.filter(s => s.id !== id));
    setHasChanges(true);
  };

  const addSkill = () => {
    if (!newSkillText.trim()) return;
    setSkills(prev => [...prev, { id: uid(), title: newSkillText.trim(), description: '', enabled: true, editable: true }]);
    setNewSkillText('');
    setHasChanges(true);
  };

  const saveEditSkill = (id: string) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, description: editingSkillText } : s));
    setEditingSkillId(null);
    setHasChanges(true);
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = () => {
    const payload = { strategies, skills };
    localStorage.setItem('optimize_goal', JSON.stringify(payload));
    setSaved(true);
    setHasChanges(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDiscard = () => {
    const stored = localStorage.getItem('optimize_goal');
    if (stored) {
      const { strategies: s, skills: sk } = JSON.parse(stored);
      setStrategies(s);
      setSkills(sk);
    } else {
      setStrategies([emptyStrategy()]);
      setSkills(DEFAULT_SKILLS);
    }
    setHasChanges(false);
  };

  // ── Sidebar stats ─────────────────────────────────────────────────────────

  const totalBudget = strategies.reduce((sum, s) => sum + (parseFloat(s.dailyBudget) || 0), 0);
  const allPlatforms = [...new Set(strategies.flatMap(s => s.adPlatforms))];
  const allEvents    = [...new Set(strategies.map(s => s.promoteObjective))];

  const sidebarItems: SidebarItem[] = [
    { icon: <MapPin size={14}/>,    label: 'Target locations', value: String(strategies.reduce((n, s) => n + s.locations.length, 0)), sub: `${strategies.reduce((n, s) => n + s.locations.length, 0)} locations` },
    { icon: <DollarSign size={14}/>, label: 'Total Daily Budget', value: `$${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 0 })}`, sub: 'Sum of all groups' },
    { icon: <Monitor size={14}/>,   label: 'Ad Platforms', value: String(allPlatforms.length), sub: `${allPlatforms.length} ad platform${allPlatforms.length !== 1 ? 's' : ''}` },
    { icon: <Zap size={14}/>,       label: 'Conversion Events', value: allEvents[0] || 'None', sub: `${allEvents.length} event${allEvents.length !== 1 ? 's' : ''}` },
  ];

  // ── Filtered suggestions ──────────────────────────────────────────────────

  const filteredSuggestions = LOCATION_SUGGESTIONS.filter(l =>
    l.toLowerCase().includes(locationQuery.toLowerCase()) &&
    !activeStrategy.locations.includes(l)
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight:'100%', background:'#f5f6fa', display:'flex', flexDirection:'column' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }
        .skill-row:hover .skill-actions { opacity:1 !important; }
        .loc-tag:hover .loc-x { opacity:1 !important; }
        .plat-btn:hover { border-color:#c4b5fd !important; background:#faf8ff !important; }
      `}</style>

      {/* ── Top header ── */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e8eaf0', padding:'10px 24px', display:'flex', alignItems:'center' }}>
        <span style={{ fontSize:'0.85rem', fontWeight:600, color:'#0f172a' }}>Optimize Goal</span>
      </div>

      <div style={{ display:'flex', flex:1, minHeight:0 }}>

        {/* ══════════════════════════════════════
            LEFT SIDEBAR
        ══════════════════════════════════════ */}
        <div style={{ width:'168px', flexShrink:0, background:'#fff', borderRight:'1px solid #f1f5f9', padding:'18px 0', display:'flex', flexDirection:'column', gap:'0' }}>
          {/* Strategy Overview */}
          <div style={{ padding:'0 16px 14px', borderBottom:'1px solid #f1f5f9', marginBottom:'6px' }}>
            <div style={{ fontSize:'0.78rem', fontWeight:700, color:'#0f172a', marginBottom:'2px' }}>Strategy Overview</div>
            <div style={{ fontSize:'0.68rem', color:'#94a3b8' }}>{strategies.length} Strategy</div>
          </div>

          {/* Sidebar stat items */}
          {sidebarItems.map((item, i) => (
            <div key={i} style={{ padding:'10px 16px', borderBottom:'1px solid #f9fafb' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'#64748b', marginBottom:'3px' }}>
                <span style={{ color:'#94a3b8' }}>{item.icon}</span>
                <span style={{ fontSize:'0.72rem', fontWeight:600, color:'#64748b' }}>{item.label}</span>
              </div>
              <div style={{ fontSize:'0.68rem', color:'#cbd5e1', marginBottom:'1px' }}>—</div>
              <div style={{ fontSize:'0.78rem', fontWeight:700, color:'#0f172a' }}>{item.value}</div>
              <div style={{ fontSize:'0.65rem', color:'#94a3b8' }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════
            MAIN CONTENT
        ══════════════════════════════════════ */}
        <div style={{ flex:1, overflow:'auto', padding:'20px 24px', paddingBottom:'80px' }}>

          {/* ── Budget & Performance KPI ── */}
          <Section title="Budget & Performance KPI *" sub="Define the core logic and positioning to guide AI content depth.">

            {/* Strategy tabs */}
            <div style={{ display:'flex', gap:'0', borderBottom:'1px solid #f1f5f9', marginBottom:'16px' }}>
              {strategies.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStrategy(s.id)}
                  style={{
                    padding:'7px 16px', border:'none', background:'none', cursor:'pointer',
                    fontSize:'0.8rem', fontWeight:600,
                    color: activeStrategyId === s.id ? '#7c3aed' : '#64748b',
                    borderBottom: activeStrategyId === s.id ? '2px solid #7c3aed' : '2px solid transparent',
                    transition:'all .15s',
                  }}
                >{s.name}</button>
              ))}
              <button
                onClick={addStrategy}
                style={{ padding:'7px 12px', border:'none', background:'none', cursor:'pointer', color:'#94a3b8', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:'4px' }}
              ><Plus size={13}/> Add</button>
            </div>

            {/* Two-column layout: left = location, right = platform/objective/budget */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'16px' }}>

              {/* LEFT: Location input */}
              <div style={{ border:'1px solid #e8eaf0', borderRadius:'10px', overflow:'visible', minHeight:'160px' }}>
                {/* Location search bar */}
                <div ref={locationRef} style={{ position:'relative' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 12px', borderBottom:'1px solid #f1f5f9' }}>
                    <MapPin size={13} color="#94a3b8"/>
                    <input
                      value={locationQuery}
                      onChange={e => { setLocationQuery(e.target.value); setShowLocationDrop(true); }}
                      onFocus={() => setShowLocationDrop(true)}
                      placeholder="You can type in countries, states/regions, cities, and more"
                      style={{ flex:1, border:'none', outline:'none', fontSize:'0.78rem', color:'#475569', background:'transparent', fontFamily:'inherit' }}
                      onKeyDown={e => { if (e.key === 'Enter') addLocation(locationQuery); }}
                    />
                  </div>

                  {/* Suggestions dropdown */}
                  {showLocationDrop && filteredSuggestions.length > 0 && (
                    <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#fff', border:'1px solid #e8eaf0', borderRadius:'0 0 10px 10px', zIndex:50, maxHeight:'160px', overflowY:'auto', boxShadow:'0 8px 24px rgba(15,23,42,.10)' }}>
                      {filteredSuggestions.map(loc => (
                        <div
                          key={loc}
                          onClick={() => addLocation(loc)}
                          style={{ padding:'8px 14px', fontSize:'0.78rem', color:'#374151', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}
                          onMouseEnter={e => (e.currentTarget.style.background='#f8fafc')}
                          onMouseLeave={e => (e.currentTarget.style.background='transparent')}
                        >
                          <MapPin size={11} color="#94a3b8"/> {loc}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Location tags or empty state */}
                <div style={{ padding:'14px', display:'flex', flexWrap:'wrap', gap:'6px', minHeight:'110px', alignContent:'flex-start' }}>
                  {activeStrategy.locations.length === 0 ? (
                    <div style={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'90px', color:'#94a3b8' }}>
                      <MapPin size={22} color="#e2e8f0"/>
                      <div style={{ fontSize:'0.75rem', marginTop:'6px', color:'#cbd5e1' }}>No location added</div>
                    </div>
                  ) : (
                    activeStrategy.locations.map(loc => (
                      <span
                        key={loc}
                        className="loc-tag"
                        style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'4px 10px', borderRadius:'20px', background:'#f3f0ff', border:'1px solid #e9d5ff', fontSize:'0.75rem', color:'#7c3aed', fontWeight:500, position:'relative' }}
                      >
                        {loc}
                        <span
                          className="loc-x"
                          onClick={() => removeLocation(loc)}
                          style={{ cursor:'pointer', opacity:0, transition:'opacity .12s', lineHeight:1, fontSize:'0.7rem', color:'#a78bfa' }}
                        >✕</span>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* RIGHT: Platform + Objective + Budget/KPI */}
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>

                {/* Ad Platforms */}
                <div style={{ border:'1px solid #e8eaf0', borderRadius:'10px', padding:'12px 14px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                    <span style={{ fontSize:'0.78rem', fontWeight:600, color:'#374151' }}>Ad Platforms</span>
                    <ChevronDown size={13} color="#2065c7"/>
                  </div>
                  <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                    {AD_PLATFORMS.map(p => {
                      const active = activeStrategy.adPlatforms.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          className="plat-btn"
                          onClick={() => togglePlatform(p.id)}
                          style={{
                            padding:'5px 10px', borderRadius:'6px', border:`1.5px solid ${active ? p.color : '#e8eaf0'}`,
                            background: active ? `${p.color}12` : '#fff',
                            color: active ? p.color : '#64748b',
                            cursor:'pointer', fontSize:'0.75rem', fontWeight:600,
                            display:'flex', alignItems:'center', gap:'5px', transition:'all .12s',
                          }}
                        >
                          <span style={{ fontSize:'0.85rem' }}>{p.icon}</span> {p.label}
                        </button>
                      );
                    })}
                  </div>
                  {activeStrategy.adPlatforms.length > 0 && (
                    <div style={{ marginTop:'8px', fontSize:'0.68rem', color:'#94a3b8' }}>
                      {activeStrategy.adPlatforms.length} Platform{activeStrategy.adPlatforms.length > 1 ? 's' : ''} Selected
                    </div>
                  )}
                </div>

                {/* Promote Objective */}
<MetaMultiSelect
selected={activeStrategy.promoteObjective}
onChange={(vals) =>
  updateStrategy({ promoteObjective: vals })
}
/>

                {/* Daily Budget + KPI */}
                <div style={{ border:'1px solid #e8eaf0', borderRadius:'10px', padding:'12px 14px' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                    {/* Daily Budget */}
                    <div>
                      <div style={{ fontSize:'0.68rem', fontWeight:600, color:'#94a3b8', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'.05em' }}>Daily Budget</div>
                      <div style={{ position:'relative' }}>
                        <span style={{ position:'absolute', left:'9px', top:'50%', transform:'translateY(-50%)', fontSize:'0.78rem', color:'#64748b' }}>$</span>
                        <input
                          value={activeStrategy.dailyBudget}
                          onChange={e => updateStrategy({ dailyBudget: e.target.value })}
                          type="number"
                          style={{ width:'65%', padding:'7px 8px 7px 22px', borderRadius:'7px', border:'1px solid #e2e8f0', fontSize:'0.82rem', fontWeight:600, color:'#0f172a', outline:'none', background:'#f8fafc', boxSizing:'border-box', fontFamily:'inherit' }}
                          onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                          onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                        />
                      </div>
                    </div>

                    {/* Performance KPI */}
                    <div>
                      <div style={{ fontSize:'0.68rem', fontWeight:600, color:'#94a3b8', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'.05em' }}>Performance KPI</div>
                      <div style={{ display:'flex', gap:'5px', alignItems:'center' }}>
                        {/* KPI type selector */}
                        <div style={{ position:'relative', flexShrink:0 }}>
                          <select
                            value={activeStrategy.kpiType}
                            onChange={e => updateStrategy({ kpiType: e.target.value })}
                            style={{ padding:'7px 22px 7px 8px', borderRadius:'7px', border:'1px solid #e2e8f0', fontSize:'0.78rem', fontWeight:600, color:'#0f172a', outline:'none', background:'#f8fafc', appearance:'none', cursor:'pointer', fontFamily:'inherit' }}
                          >
                            {KPI_TYPES.map(k => <option key={k} value={k}>{k}</option>)}
                          </select>
                          <ChevronDown size={10} style={{ position:'absolute', right:'5px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }}/>
                        </div>
                        {/* KPI value */}
                        <div style={{ position:'relative', flex:1 }}>
                          <span style={{ position:'absolute', left:'7px', top:'50%', transform:'translateY(-50%)', fontSize:'0.78rem', color:'#10b981' }}>✦</span>
                          <input
                            value={activeStrategy.kpiValue}
                            onChange={e => updateStrategy({ kpiValue: e.target.value })}
                            type="number"
                            style={{ width:'100%', padding:'7px 6px 7px 20px', borderRadius:'7px', border:'1px solid #e2e8f0', fontSize:'0.82rem', fontWeight:600, color:'#0f172a', outline:'none', background:'#f8fafc', boxSizing:'border-box', fontFamily:'inherit' }}
                            onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                            onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* ── Ad Scope ── */}
          <Section title="Ad Scope (Assigned account)" sub="Define the core logic and positioning to guide AI content depth.">
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center', padding:'12px 0' }}>
              {AD_PLATFORMS.map(p => {
                const active = activeStrategy.adPlatforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    style={{
                      padding:'7px 16px', borderRadius:'20px',
                      border:`1.5px solid ${active ? p.color : '#e8eaf0'}`,
                      background: active ? `${p.color}18` : '#fff',
                      color: active ? p.color : '#94a3b8',
                      cursor:'pointer', fontSize:'0.8rem', fontWeight:600,
                      display:'flex', alignItems:'center', gap:'6px', transition:'all .15s',
                    }}
                  >
                    <span style={{ fontSize:'0.9rem' }}>{p.icon}</span> {p.label}
                    {active && <span style={{ fontSize:'0.65rem', opacity:.7 }}>✓</span>}
                  </button>
                );
              })}

              {/* Connect Ad Platform CTA */}
              <button
                onClick={() => setShowConnectModal(true)}
                style={{ padding:'7px 16px', borderRadius:'20px', border:'1px dashed #c4b5fd', background:'#f5f3ff', color:'#7c3aed', cursor:'pointer', fontSize:'0.8rem', fontWeight:600, display:'flex', alignItems:'center', gap:'6px' }}
              >
                <Plus size={13}/> Connect Ad Platform
              </button>
              {/* Connected account badges */}
              {connectedAccounts.map(acc => {
                const plat = AD_PLATFORMS.find(p => p.id === acc.platformId);
                return plat ? (
                  <div key={acc.platformId} style={{ display:'flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'20px', background:`${plat.color}12`, border:`1px solid ${plat.color}40`, fontSize:'0.75rem', fontWeight:600, color: plat.color }}>
                    <span>{plat.icon}</span> {acc.accountName}
                    <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#16a34a', display:'inline-block' }}/>
                  </div>
                ) : null;
              })}
            </div>
          </Section>

          {/* ── Optimize Skills ── */}
          <Section title="Optimize Skills" sub="Define the core logic and positioning to guide AI content depth.">

            {/* Active Skills label */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
              <span style={{ fontSize:'0.75rem', fontWeight:600, color:'#374151' }}>Active Skills</span>
              {/* Toggle all */}
              <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                <span style={{ fontSize:'0.68rem', color:'#94a3b8' }}>All</span>
                <div
                  onClick={() => { const allOn = skills.every(s => s.enabled); setSkills(prev => prev.map(s => ({ ...s, enabled: !allOn }))); setHasChanges(true); }}
                  style={{ width:'32px', height:'18px', borderRadius:'99px', background: skills.every(s=>s.enabled) ? '#7c3aed' : '#e2e8f0', cursor:'pointer', position:'relative', transition:'background .2s' }}
                >
                  <div style={{ position:'absolute', top:'2px', left: skills.every(s=>s.enabled) ? '14px' : '2px', width:'14px', height:'14px', borderRadius:'50%', background:'#fff', transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.2)' }}/>
                </div>
              </div>
            </div>

            {/* Skills list */}
            <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
              {skills.map(skill => (
                <div
                  key={skill.id}
                  className="skill-row"
                  style={{ border:'1px solid #f1f5f9', borderRadius:'8px', padding:'11px 14px', background:'#fafafa', transition:'border-color .12s', position:'relative' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor='#e2e8f0')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor='#f1f5f9')}
                >
                  {editingSkillId === skill.id ? (
                    /* Editing mode */
                    <div>
                      <div style={{ fontSize:'0.83rem', fontWeight:600, color:'#0f172a', marginBottom:'6px' }}>{skill.title}</div>
                      <textarea
                        value={editingSkillText}
                        onChange={e => setEditingSkillText(e.target.value)}
                        style={{ width:'100%', padding:'8px 10px', borderRadius:'7px', border:'1px solid #c4b5fd', fontSize:'0.78rem', color:'#374151', outline:'none', resize:'vertical', fontFamily:'inherit', minHeight:'60px', boxSizing:'border-box' }}
                        autoFocus
                      />
                      <div style={{ display:'flex', gap:'6px', marginTop:'6px' }}>
                        <button onClick={() => saveEditSkill(skill.id)} style={{ padding:'5px 12px', borderRadius:'6px', border:'none', background:'#7c3aed', color:'#fff', cursor:'pointer', fontSize:'0.75rem', fontWeight:600 }}>Save</button>
                        <button onClick={() => setEditingSkillId(null)} style={{ padding:'5px 12px', borderRadius:'6px', border:'1px solid #e2e8f0', background:'#fff', color:'#64748b', cursor:'pointer', fontSize:'0.75rem', fontWeight:600 }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <div style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'0.83rem', fontWeight:600, color:'#0f172a', marginBottom:'3px' }}>{skill.title}</div>
                        {skill.description && (
                          <div style={{ fontSize:'0.75rem', color:'#64748b', lineHeight:1.55 }}>{skill.description}</div>
                        )}
                      </div>
                      {/* Action buttons */}
                      <div className="skill-actions" style={{ display:'flex', gap:'4px', alignItems:'center', opacity:0, transition:'opacity .15s', flexShrink:0 }}>
                        <IconBtn icon={<Edit2 size={11}/>} onClick={() => { setEditingSkillId(skill.id); setEditingSkillText(skill.description); }} title="Edit"/>
                        <IconBtn icon={<Trash2 size={11}/>} onClick={() => deleteSkill(skill.id)} danger title="Delete"/>
                      </div>
                      {/* Toggle */}
                      <div
                        onClick={() => toggleSkill(skill.id)}
                        style={{ width:'30px', height:'17px', borderRadius:'99px', background: skill.enabled ? '#7c3aed' : '#e2e8f0', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}
                      >
                        <div style={{ position:'absolute', top:'1.5px', left: skill.enabled ? '13px' : '1.5px', width:'14px', height:'14px', borderRadius:'50%', background:'#fff', transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.2)' }}/>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Skill input */}
            <div style={{ marginTop:'12px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
                <span style={{ fontSize:'0.75rem', fontWeight:600, color:'#374151' }}>Add Skill</span>
                <Info size={12} color="#94a3b8"/>
              </div>
              <div style={{ border:`1.5px solid ${newSkillText ? '#7c3aed' : '#e8eaf0'}`, borderRadius:'10px', padding:'10px 14px', background:'#fff', display:'flex', gap:'8px', alignItems:'flex-end', transition:'border-color .15s' }}>
                <textarea
                  value={newSkillText}
                  onChange={e => setNewSkillText(e.target.value)}
                  placeholder="Add new optimization skill that you want..."
                  style={{ flex:1, border:'none', outline:'none', fontSize:'0.82rem', color:'#374151', resize:'none', fontFamily:'inherit', minHeight:'52px', lineHeight:1.5, background:'transparent' }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addSkill(); } }}
                />
                <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
                  <span style={{ fontSize:'0.68rem', color:'#94a3b8' }}>{newSkillText.length}/200</span>
                  <button
                    onClick={addSkill}
                    disabled={!newSkillText.trim()}
                    style={{ width:'28px', height:'28px', borderRadius:'50%', border:'none', background: newSkillText.trim() ? '#7c3aed' : '#f1f5f9', color: newSkillText.trim() ? '#fff' : '#94a3b8', cursor: newSkillText.trim() ? 'pointer' : 'default', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}
                  >
                    <ChevronRight size={14}/>
                  </button>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>

        {/* ══════════════════════════════════════
          CONNECT AD PLATFORM MODAL
      ══════════════════════════════════════ */}
      {showConnectModal && (
        <ConnectPlatformModal
          connectedAccounts={connectedAccounts}
          onConnect={(acc) => {
            const updated = [...connectedAccounts.filter(a => a.platformId !== acc.platformId), acc];
            setConnectedAccounts(updated);
            localStorage.setItem('connected_ad_accounts', JSON.stringify(updated));
            // Also activate this platform in active strategy
            if (!activeStrategy.adPlatforms.includes(acc.platformId)) {
              updateStrategy({ adPlatforms: [...activeStrategy.adPlatforms, acc.platformId] });
            }
          }}
          onDisconnect={(platformId) => {
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
// ─── Connect Platform Modal ───────────────────────────────────────────────────
const PLATFORM_DETAILS = {
  meta: {
    id: 'meta',
    label: 'Meta (Facebook & Instagram)',
    icon: '𝕄',
    color: '#1877f2',
    bg: '#e7f0fd',
    description: 'Connect your Meta Business account to run ads on Facebook and Instagram.',
    permissions: ['ads_read', 'ads_management', 'business_management', 'pages_read_engagement'],
    docsUrl: 'https://developers.facebook.com/docs/marketing-apis',
  },
  google: {
    id: 'google',
    label: 'Google Ads',
    icon: 'G',
    color: '#ea4335',
    bg: '#fdecea',
    description: 'Connect your Google Ads account to run Search, Display, and YouTube campaigns.',
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
const ConnectPlatformModal: React.FC<ConnectPlatformModalProps> = ({
  connectedAccounts, onConnect, onDisconnect, onClose,
}) => {
  const [step, setStep]           = useState<'list' | 'detail' | 'connecting' | 'manual'>('list');
  const [selectedPlat, setSelectedPlat] = useState<keyof typeof PLATFORM_DETAILS | null>(null);
  const [connectStatus, setConnectStatus] = useState<'idle' | 'waiting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg]   = useState('');
  const [manualId, setManualId]   = useState('');
  const [manualName, setManualName] = useState('');
  const [manualToken, setManualToken] = useState('');
  const platInfo = selectedPlat ? PLATFORM_DETAILS[selectedPlat] : null;
  const isConnected = (id: string) => connectedAccounts.some(a => a.platformId === id);
  // ── OAuth redirect ──────────────────────────────────────────────────────────
  const startOAuth = async () => {
    if (!selectedPlat) return;
    setStep('connecting');
    setConnectStatus('waiting');
    try {
      // Ask backend for the OAuth URL
      const res = await fetch(`http://localhost:3000/auth/oauth-url/${selectedPlat}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token') || ''}` },
      });
      if (!res.ok) throw new Error('Could not get OAuth URL from server');
      const { url } = await res.json();
      // Open popup
      const popup = window.open(url, `connect_${selectedPlat}`, 'width=520,height=640,scrollbars=yes,resizable=yes');
      // Poll for popup message
      const timer = setInterval(() => {
        if (popup?.closed) {
          clearInterval(timer);
          // Check if token was stored by the callback
          const stored = localStorage.getItem(`oauth_result_${selectedPlat}`);
          if (stored) {
            const result = JSON.parse(stored);
            localStorage.removeItem(`oauth_result_${selectedPlat}`);
            onConnect({ platformId: selectedPlat, accountName: result.accountName, accountId: result.accountId, connectedAt: new Date().toISOString() });
            setConnectStatus('success');
          } else {
            setConnectStatus('error');
            setErrorMsg('Connection was cancelled or failed. Try manual setup below.');
          }
        }
      }, 800);
    } catch (err: any) {
      setConnectStatus('error');
      setErrorMsg(err.message || 'Failed to start OAuth. Use manual setup instead.');
    }
  };
  // ── Manual token save ───────────────────────────────────────────────────────
  const saveManual = async () => {
    if (!selectedPlat || !manualId.trim() || !manualToken.trim()) return;
    setConnectStatus('waiting');
    try {
      const res = await fetch(`http://localhost:3000/auth/connect-platform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify({ platformId: selectedPlat, accountId: manualId.trim(), accessToken: manualToken.trim(), accountName: manualName.trim() || manualId.trim() }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      onConnect({ platformId: selectedPlat, accountName: data.accountName || manualName || manualId, accountId: manualId, connectedAt: new Date().toISOString() });
      setConnectStatus('success');
    } catch (err: any) {
      setConnectStatus('error');
      setErrorMsg(err.message);
    }
  };
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
      <div style={{ background:'#fff', borderRadius:'20px', width:'520px', maxHeight:'88vh', overflow:'auto', boxShadow:'0 24px 64px rgba(15,23,42,.2)', animation:'fadeUp .2s ease-out' }}>
        {/* ── Header ── */}
        <div style={{ padding:'20px 24px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            {step !== 'list' && (
              <button onClick={() => { setStep('list'); setSelectedPlat(null); setConnectStatus('idle'); setErrorMsg(''); }} style={{ background:'none', border:'none', cursor:'pointer', color:'#7c3aed', fontSize:'0.8rem', fontWeight:600, padding:0, marginBottom:'4px', display:'flex', alignItems:'center', gap:'4px' }}>
                ← Back
              </button>
            )}
            <div style={{ fontWeight:700, fontSize:'1rem', color:'#0f172a' }}>
              {step === 'list' ? 'Connect Ad Platform' : platInfo?.label}
            </div>
            <div style={{ fontSize:'0.72rem', color:'#94a3b8', marginTop:'2px' }}>
              {step === 'list' ? 'Choose a platform to connect your ad account' : platInfo?.description}
            </div>
          </div>
          <button onClick={onClose} style={{ width:'30px', height:'30px', borderRadius:'50%', background:'#f1f5f9', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', color:'#64748b', flexShrink:0 }}
            onMouseEnter={e=>(e.currentTarget.style.background='#e2e8f0')}
            onMouseLeave={e=>(e.currentTarget.style.background='#f1f5f9')}
          >✕</button>
        </div>
        <div style={{ padding:'16px 24px 24px' }}>
          {/* ══ STEP: LIST ══ */}
          {step === 'list' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {Object.values(PLATFORM_DETAILS).map(plat => {
                const connected = isConnected(plat.id);
                const acc = connectedAccounts.find(a => a.platformId === plat.id);
                return (
                  <div
                    key={plat.id}
                    style={{ border:`1.5px solid ${connected ? plat.color+'50' : '#f1f5f9'}`, borderRadius:'14px', padding:'16px', cursor:'pointer', transition:'all .15s', background: connected ? `${plat.color}06` : '#fafafa' }}
                    onMouseEnter={e => { if (!connected) (e.currentTarget as HTMLDivElement).style.borderColor = plat.color+'80'; }}
                    onMouseLeave={e => { if (!connected) (e.currentTarget as HTMLDivElement).style.borderColor = '#f1f5f9'; }}
                    onClick={() => { if (!connected) { setSelectedPlat(plat.id as keyof typeof PLATFORM_DETAILS); setStep('detail'); } }}
                  >
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:plat.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', fontWeight:800, color:plat.color, flexShrink:0 }}>
                        {plat.icon}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, fontSize:'0.88rem', color:'#0f172a', marginBottom:'2px' }}>{plat.label}</div>
                        {connected && acc ? (
                          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                            <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#16a34a', display:'inline-block' }}/>
                            <span style={{ fontSize:'0.72rem', color:'#16a34a', fontWeight:600 }}>Connected — {acc.accountName}</span>
                          </div>
                        ) : (
                          <div style={{ fontSize:'0.72rem', color:'#94a3b8' }}>{plat.description.slice(0, 60)}...</div>
                        )}
                      </div>
                      {connected ? (
                        <button
                          onClick={e => { e.stopPropagation(); onDisconnect(plat.id); }}
                          style={{ padding:'5px 12px', borderRadius:'20px', border:'1px solid #fecaca', background:'#fef2f2', color:'#ef4444', cursor:'pointer', fontSize:'0.72rem', fontWeight:600, flexShrink:0 }}
                        >Disconnect</button>
                      ) : (
                        <div style={{ padding:'5px 14px', borderRadius:'20px', border:`1px solid ${plat.color}`, background:plat.bg, color:plat.color, fontSize:'0.75rem', fontWeight:600, flexShrink:0 }}>Connect →</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* ══ STEP: DETAIL ══ */}
          {step === 'detail' && platInfo && (
            <div>
              {/* Platform card */}
              <div style={{ background:platInfo.bg, borderRadius:'12px', padding:'16px', marginBottom:'18px', display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', fontWeight:800, color:platInfo.color }}>
                  {platInfo.icon}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:'0.9rem', color:'#0f172a' }}>{platInfo.label}</div>
                  <a href={platInfo.docsUrl} target="_blank" rel="noreferrer" style={{ fontSize:'0.7rem', color: platInfo.color }}>View API docs ↗</a>
                </div>
              </div>
              {/* Permissions */}
              <div style={{ marginBottom:'18px' }}>
                <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'8px' }}>Permissions requested</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {platInfo.permissions.map(p => (
                    <span key={p} style={{ padding:'3px 10px', borderRadius:'20px', background:'#f1f5f9', border:'1px solid #e2e8f0', fontSize:'0.7rem', color:'#475569', fontFamily:'monospace' }}>{p}</span>
                  ))}
                </div>
              </div>
              {/* OAuth button */}
              <button
                onClick={startOAuth}
                style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'none', background:`linear-gradient(135deg, ${platInfo.color}, ${platInfo.color}cc)`, color:'#fff', cursor:'pointer', fontWeight:700, fontSize:'0.88rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'12px' }}
              >
                <span style={{ fontSize:'1rem' }}>{platInfo.icon}</span>
                Connect with {platInfo.label.split(' ')[0]}
              </button>
              <div style={{ textAlign:'center', fontSize:'0.72rem', color:'#94a3b8', marginBottom:'12px' }}>— or set up manually —</div>
              {/* Manual setup toggle */}
              <button
                onClick={() => setStep('manual')}
                style={{ width:'100%', padding:'10px', borderRadius:'10px', border:'1px solid #e2e8f0', background:'#fff', color:'#475569', cursor:'pointer', fontSize:'0.82rem', fontWeight:600 }}
              >
                Enter Access Token Manually
              </button>
            </div>
          )}
          {/* ══ STEP: MANUAL ══ */}
          {step === 'manual' && platInfo && (
            <div>
              <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'10px', padding:'10px 14px', marginBottom:'16px', fontSize:'0.78rem', color:'#92400e', lineHeight:1.5 }}>
                Get your access token from the <a href={platInfo.docsUrl} target="_blank" rel="noreferrer" style={{ color:platInfo.color, fontWeight:600 }}>{platInfo.label} developer portal</a>. Keep it secret — never share it publicly.
              </div>
              {[
                { label:'Account ID', placeholder: selectedPlat === 'meta' ? 'act_123456789' : selectedPlat === 'google' ? '123-456-7890' : 'Your account ID', value: manualId, set: setManualId },
                { label:'Account Name (optional)', placeholder: 'My Business Account', value: manualName, set: setManualName },
                { label:'Access Token', placeholder: 'Paste your access token here...', value: manualToken, set: setManualToken },
              ].map(field => (
                <div key={field.label} style={{ marginBottom:'12px' }}>
                  <label style={{ fontSize:'0.75rem', fontWeight:600, color:'#374151', display:'block', marginBottom:'5px' }}>{field.label}</label>
                  <input
                    value={field.value}
                    onChange={e => field.set(e.target.value)}
                    placeholder={field.placeholder}
                    type={field.label.includes('Token') ? 'password' : 'text'}
                    style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid #e2e8f0', fontSize:'0.82rem', color:'#0f172a', outline:'none', background:'#f8fafc', boxSizing:'border-box', fontFamily:'monospace' }}
                    onFocus={e => (e.target.style.borderColor = platInfo.color)}
                    onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </div>
              ))}
              {connectStatus === 'error' && (
                <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'8px', padding:'10px 12px', marginBottom:'12px', fontSize:'0.75rem', color:'#dc2626' }}>{errorMsg}</div>
              )}
              <button
                onClick={saveManual}
                disabled={!manualId.trim() || !manualToken.trim() || connectStatus === 'waiting'}
                style={{ width:'100%', padding:'11px', borderRadius:'10px', border:'none', background: (!manualId.trim() || !manualToken.trim()) ? '#f1f5f9' : `linear-gradient(135deg,#7c3aed,#6d28d9)`, color: (!manualId.trim() || !manualToken.trim()) ? '#94a3b8' : '#fff', cursor: (!manualId.trim() || !manualToken.trim()) ? 'not-allowed' : 'pointer', fontWeight:700, fontSize:'0.88rem' }}
              >
                {connectStatus === 'waiting' ? 'Saving...' : 'Save Connection'}
              </button>
            </div>
          )}
          {/* ══ STEP: CONNECTING ══ */}
          {step === 'connecting' && platInfo && (
            <div style={{ textAlign:'center', padding:'24px 0' }}>
              {connectStatus === 'waiting' && (
                <>
                  <div style={{ width:'48px', height:'48px', border:`4px solid ${platInfo.bg}`, borderTopColor:platInfo.color, borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 16px' }}/>
                  <div style={{ fontWeight:600, fontSize:'0.9rem', color:'#0f172a', marginBottom:'6px' }}>Waiting for authorization...</div>
                  <div style={{ fontSize:'0.78rem', color:'#64748b', marginBottom:'16px' }}>Complete the sign-in in the popup window. Don't close it.</div>
                  <button onClick={() => setStep('manual')} style={{ fontSize:'0.75rem', color:'#94a3b8', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>
                    No popup? Enter token manually
                  </button>
                </>
              )}
              {connectStatus === 'success' && (
                <>
                  <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:'1.4rem' }}>✓</div>
                  <div style={{ fontWeight:700, fontSize:'0.95rem', color:'#16a34a', marginBottom:'6px' }}>Connected successfully!</div>
                  <div style={{ fontSize:'0.78rem', color:'#64748b', marginBottom:'20px' }}>{platInfo.label} is now connected to your account.</div>
                  <button onClick={onClose} style={{ padding:'10px 28px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:'0.85rem' }}>Done</button>
                </>
              )}
              {connectStatus === 'error' && (
                <>
                  <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:'1.4rem' }}>✕</div>
                  <div style={{ fontWeight:700, fontSize:'0.95rem', color:'#dc2626', marginBottom:'6px' }}>Connection failed</div>
                  <div style={{ fontSize:'0.78rem', color:'#64748b', marginBottom:'16px' }}>{errorMsg}</div>
                  <div style={{ display:'flex', gap:'8px', justifyContent:'center' }}>
                    <button onClick={() => { setStep('detail'); setConnectStatus('idle'); }} style={{ padding:'9px 20px', borderRadius:'8px', border:'1px solid #e2e8f0', background:'#fff', color:'#475569', cursor:'pointer', fontWeight:600, fontSize:'0.82rem' }}>Try Again</button>
                    <button onClick={() => { setStep('manual'); setConnectStatus('idle'); }} style={{ padding:'9px 20px', borderRadius:'8px', border:'none', background:'#7c3aed', color:'#fff', cursor:'pointer', fontWeight:600, fontSize:'0.82rem' }}>Manual Setup</button>
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

// ─── Section wrapper ──────────────────────────────────────────────────────────

const Section: React.FC<{ title: string; sub: string; children: React.ReactNode }> = ({ title, sub, children }) => (
  <div style={{ marginBottom:'20px' }}>
    <div style={{ marginBottom:'12px' }}>
      <div style={{ fontSize:'0.9rem', fontWeight:700, color:'#0f172a', marginBottom:'2px' }}>{title}</div>
      <div style={{ fontSize:'0.75rem', color:'#94a3b8' }}>{sub}</div>
    </div>
    <div style={{ background:'#fff', border:'1px solid #e8eaf0', borderRadius:'12px', padding:'18px 20px' }}>
      {children}
    </div>
  </div>
);

// ─── Icon button ──────────────────────────────────────────────────────────────

const IconBtn: React.FC<{ icon: React.ReactNode; onClick: () => void; danger?: boolean; title?: string }> = ({ icon, onClick, danger, title }) => (
  <button
    onClick={onClick}
    title={title}
    style={{ width:'24px', height:'24px', borderRadius:'5px', border:`1px solid ${danger ? '#fecaca' : '#e2e8f0'}`, background: danger ? '#fef2f2' : '#f8fafc', color: danger ? '#ef4444' : '#64748b', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .12s' }}
    onMouseEnter={e => (e.currentTarget.style.background = danger ? '#fee2e2' : '#f1f5f9')}
    onMouseLeave={e => (e.currentTarget.style.background = danger ? '#fef2f2' : '#f8fafc')}
  >{icon}</button>
);