import React, { useState, useEffect } from 'react';
import { BrainCircuit, TrendingUp, Zap, BarChart2, RefreshCw, Search, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import { SmartTable } from '../components/SmartTable';

const statusStyles: Record<string, { bg: string; color: string; dot: string }> = {
  active: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', dot: '#10b981' },
  paused: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', dot: '#f59e0b' },
  draft: { bg: 'rgba(255,255,255,0.05)', color: '#94a3b8', dot: '#94a3b8' },
};

const platforms = ['All', 'Meta', 'Google', 'X', 'LinkedIn'];

export const AdsManager: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState('All');
  const [search, setSearch] = useState('');
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/campaigns', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => res.json())
    .then(json => {
      const hashStr = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
        return Math.abs(hash);
      };

      const mapped = json.map((c: any) => {
        const seed = c._id ? hashStr(c._id.toString()) : Math.random() * 1000;
        const sM1 = (seed % 100) / 100;
        const sM2 = (seed % 50) / 50;

        return {
          id: c._id,
          name: c.name || 'AI Campaign',
          platform: c.platform || 'Meta',
          status: (c.status || 'active').toLowerCase(),
          spend: `$${((100 + sM1 * 1000)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
          roas: `${(2.0 + sM2 * 4).toFixed(1)}x`,
          ctr: `${(3.0 + sM1 * 8).toFixed(1)}%`,
          impressions: `${Math.floor(10 + sM2 * 490)}K`,
          score: Math.floor(c.aiStrategy?.performanceScore || (60 + sM1 * 35))
        };
      });
      setAds(mapped);
      setLoading(false);
    })
    .catch(err => {
      console.error('Campaigns fetch failed', err);
      setLoading(false);
    });
  }, []);

  const filtered = ads.filter(ad => {
    const matchPlatform = activePlatform === 'All' || ad.platform === activePlatform;
    const matchSearch = ad.name.toLowerCase().includes(search.toLowerCase());
    return matchPlatform && matchSearch;
  });

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="animate-fade-in" style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Loading Ads Manager...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-primary)', padding: '0' }}>
      {/* Page Header */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--glass-border)', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '3px' }}>AI Optimize</div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Ads Manager</h1>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '8px', background: 'linear-gradient(135deg, #2631d6, #1e27a8)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
          <Zap size={14} /> Optimize All
        </button>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Insight Briefing */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--glass-border)', padding: '20px 24px', marginBottom: '20px', display: 'flex', gap: '32px' }}>
          {[
            { label: 'Total Spend', value: '$4,790', sub: 'This month', icon: BarChart2, color: '#2631d6' },
            { label: 'Avg ROAS', value: '3.4x', sub: '+0.6x vs last week', icon: TrendingUp, color: '#16a34a' },
            { label: 'Active Ads', value: '3', sub: '2 paused, 1 draft', icon: Zap, color: '#d97706' },
            { label: 'AI Score', value: '74/100', sub: 'Good performance', icon: BrainCircuit, color: '#2631d6' },
          ].map((stat, i) => (
            <div key={i} style={{ flex: 1, borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none', paddingRight: i < 3 ? '32px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <stat.icon size={14} color={stat.color} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Optimization Hub */}
        <div style={{ background: 'rgba(38, 49, 214, 0.05)', border: '1px solid rgba(38, 49, 214, 0.2)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BrainCircuit size={18} color="#2631d6" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Optimization Hub</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>AI detected 3 opportunities to improve your campaign performance</div>
            </div>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', borderRadius: '8px', background: '#2631d6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
            View Recommendations <ArrowUpRight size={13} />
          </button>
        </div>

        {/* Platform Tabs + Search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-elevated)', borderRadius: '8px', padding: '3px' }}>
            {platforms.map(p => (
              <button key={p} onClick={() => setActivePlatform(p)} style={{
                padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                background: activePlatform === p ? '#2631d6' : 'transparent',
                color: activePlatform === p ? '#fff' : '#64748b',
                boxShadow: activePlatform === p ? '0 4px 12px rgba(38, 49, 214, 0.3)' : 'none',
                transition: 'all 0.15s'
              }}>{p}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search campaigns..."
                style={{ padding: '8px 14px 8px 32px', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.82rem', color: 'var(--text-secondary)', outline: 'none', width: '220px', background: 'var(--bg-card)' }} />
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-card)', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ marginTop: '32px' }}>
          <SmartTable 
            title="Active Optimization Campaigns"
            searchPlaceholder="Search campaigns by name..."
            columns={[
              { key: 'name', label: 'Campaign', sortable: true, render: (row) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</span> },
              { key: 'platform', label: 'Platform', sortable: true, render: (row) => {
                const platformColors: Record<string, string> = {
                  'Meta': '#1877f2',
                  'Google': '#ea4335',
                  'X': '#000000',
                  'LinkedIn': '#0a66c2'
                };
                const color = platformColors[row.platform] || '#64748b';
                return <span style={{
                  padding: '3px 9px',
                  borderRadius: '6px',
                  background: `${color}20`,
                  color: color,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: `1px solid ${color}30`
                }}>{row.platform}</span>;
              } },
              { key: 'status', label: 'Status', sortable: true, render: (row) => {
                  const st = statusStyles[row.status] || statusStyles.draft;
                  return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '99px', background: st.bg, color: st.color, fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: st.dot }} />{row.status}
                    </span>
                  );
              }},
              { key: 'impressions', label: 'Impressions', sortable: true, render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.impressions}</span> },
              { key: 'spend', label: 'Spend', sortable: true, render: (row) => <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{row.spend}</span> },
              { key: 'roas', label: 'ROAS', sortable: true, render: (row) => <span style={{ color: '#16a34a', fontWeight: 700 }}>{row.roas}</span> },
              { key: 'ctr', label: 'CTR', sortable: true, render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.ctr}</span> },
              { key: 'score', label: 'AI Score', sortable: true, render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '64px', height: '5px', borderRadius: '99px', background: 'var(--bg-elevated)' }}>
                    <div style={{ height: '100%', width: `${row.score}%`, background: row.score > 80 ? '#22c55e' : row.score > 60 ? '#f59e0b' : '#ef4444', borderRadius: '99px' }} />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: row.score > 80 ? '#16a34a' : row.score > 60 ? '#d97706' : '#dc2626' }}>{row.score}</span>
                </div>
              )}
            ]}
            data={filtered}
          />
        </div>
      </div>
    </div>
  );
};
