import React, { useState, useEffect } from 'react';
import { SmartTable } from '../components/SmartTable';
import { GlassCard } from '../components/GlassCard';
import { 
  Users, Target, Sparkles, RefreshCw, Zap, TrendingUp, 
  Target as TargetIcon, Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const dateRanges = ['Last 7 days', 'Last 14 days', 'Last 30 days', 'Last 90 days', 'Today'];

// Re-using the SVG polyline chart the user liked
const ChartLine: React.FC<{ data: number[]; color: string; height: number; width: number }> = ({ data, color, height, width }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data) || 1;
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 20) - 10;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

export const Crm: React.FC = () => {
  const [activeRange, setActiveRange] = useState('Last 7 days');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [audiences, setAudiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState([
    { label: 'Spend', value: '$0.00', color: '#7c3aed', checked: true, key: 'spend' },
    { label: 'CPM', value: '$0.00', color: '#94a3b8', checked: false, key: 'cpm' },
    { label: 'CPC', value: '$0.00', color: '#94a3b8', checked: false, key: 'cpc' },
    { label: 'CTR', value: '0.00%', color: '#94a3b8', checked: false, key: 'ctr' },
    { label: 'ROAS', value: '0.00', color: '#16a34a', checked: true, key: 'roas' },
    { label: 'Purchase Value', value: '$0.00', color: '#94a3b8', checked: false, key: 'purchaseValue' },
  ]);

  const fetchData = async () => {
    try {
      const { api } = await import('../api/axios');
      const [resAnal, resAud] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/crm/audiences')
      ]);
      
      setAnalyticsData(resAnal.data);
      setAudiences(resAud.data);
      
      const summary = resAnal.data.summary;
   setKpis(prev => prev.map(k => {
  const rawValue = summary?.[k.key]; // safe access with ?
  
  if (rawValue === undefined || rawValue === null) {
    return { ...k, value: k.key === 'ctr' ? '0%' : '$0' };
  }

  const formattedValue = (k.key === 'ctr' || k.key === 'roas')
    ? (typeof rawValue === 'string' ? rawValue : rawValue.toFixed(2)) + (k.key === 'ctr' ? '%' : '')
    : `$${parseFloat(rawValue).toLocaleString()}`;

  return { ...k, value: formattedValue };
}));
      setLoading(false);
    } catch (error) {
      console.error('CRM Fetch Failed', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleKpi = (i: number) => {
    const newKpis = [...kpis];
    newKpis[i].checked = !newKpis[i].checked;
    setKpis(newKpis);
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
      <div style={{ textAlign: 'center' }}>
        <RefreshCw className="animate-spin" size={32} color="var(--accent-primary)" />
        <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 600 }}>Syncing AI Nodes...</p>
      </div>
    </div>
  );

  const activeDates = analyticsData?.daily?.map((d: any) => d.date) || [];
  const activeSpend = analyticsData?.daily?.map((d: any) => d.spend) || [];
  const activeRoas = analyticsData?.daily?.map((d: any) => d.roas) || [];

  return (
    <div style={{ minHeight: '100%', background: '#fafbff' }}>
      
      {/* RESTORED Original Top Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eef0f5', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1a202c', fontFamily: 'Outfit' }}>Intelligence <span className="text-gradient">Matrix</span></span>
          <div style={{ padding: '4px 12px', background: 'rgba(112,51,245,0.05)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Live Node</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
           <button onClick={fetchData} style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} /> Refresh Terminal
           </button>
           <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Sync: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        
        {/* RESTORED Original Date Range Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
           {dateRanges.map(r => (
             <button key={r} onClick={() => setActiveRange(r)} style={{
               padding: '8px 20px', borderRadius: '99px', border: activeRange === r ? '1px solid var(--accent-primary)' : '1px solid #e2e8f0',
               background: activeRange === r ? 'var(--accent-primary)' : '#fff', color: activeRange === r ? '#fff' : '#64748b',
               fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: '0.2s'
             }}>{r}</button>
           ))}
           <div style={{ padding: '8px 20px', borderRadius: '99px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
             📅 {activeDates[0]} → {activeDates[activeDates.length-1]}
           </div>
        </div>

        {/* RESTORED Original KPI Grid */}
        <div style={{ background: '#fff', border: '1px solid #eef0f5', borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {kpis.map((kpi, i) => (
              <div key={kpi.label} onClick={() => toggleKpi(i)} style={{ 
                padding: '20px', borderRadius: '16px', border: `2px solid ${kpi.checked ? kpi.color + '40' : '#f8fafc'}`, 
                background: kpi.checked ? kpi.color + '05' : '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', 
                justifyContent: 'space-between', transition: 'all 0.2s' 
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ width: '14px', height: '4px', borderRadius: '2px', background: kpi.checked ? kpi.color : '#e2e8f0' }} />
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{kpi.label}</span>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: kpi.checked ? '#000' : '#cbd5e1', fontFamily: 'Outfit' }}>{kpi.value}</div>
                </div>
                <input type="checkbox" checked={kpi.checked} readOnly style={{ accentColor: 'var(--accent-primary)', width: '18px', height: '18px', cursor: 'pointer' }} />
              </div>
            ))}
          </div>
        </div>

        {/* RESTORED Original Line Chart Section */}
        <div style={{ background: '#fff', border: '1px solid #eef0f5', borderRadius: '20px', padding: '32px', marginBottom: '24px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
             <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Node Performance History</h3>
             <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#7c3aed' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Spend</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#16a34a' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>ROAS</span>
                </div>
             </div>
          </div>
          <div style={{ position: 'relative', height: '220px', width: '100%' }}>
            {/* Dynamic Svg Chart Overlay */}
            <div style={{ position: 'absolute', inset: 0 }}>
               <ChartLine data={activeSpend} color="#7c3aed" height={220} width={1200} />
            </div>
            <div style={{ position: 'absolute', inset: 0 }}>
               <ChartLine data={activeRoas.map((v: number) => v * 10)} color="#16a34a" height={220} width={1200} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', borderTop: '1px solid #f8fafc', paddingTop: '12px' }}>
            {activeDates.map((d: string) => <span key={d} style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{d.split('-').slice(1).join('/')}</span>)}
          </div>
        </div>

        {/* Audience Section Added Subtly as requested in CRM & Audience scope */}
        <div style={{ marginBottom: '32px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                 <Users size={16} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Intelligence Audience Segments</h3>
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {audiences.slice(0, 3).map((aud, i) => (
                <GlassCard key={i} style={{ padding: '20px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{aud.name}</span>
                      <span style={{ background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>{((aud.estimatedSize || 0)/1000).toFixed(1)}k Reach</span>
                   </div>
                   <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>{aud.description}</p>
                </GlassCard>
              ))}
           </div>
        </div>

        {/* RESTORED Original Table Section */}
<div style={{ marginTop: '32px' }}>
  <SmartTable 
    title="Daily Performance Analytics"
    columns={[
      { key: 'date', label: 'Node Date', sortable: true, render: (row) => <span style={{ fontWeight: 700, color: '#1a202c' }}>{row.date}</span> },
      { key: 'spend', label: 'Daily Spend', sortable: true, render: (row) => <span style={{ fontWeight: 800, color: '#7c3aed' }}>${row.spend?.toFixed(2) ?? '0.00'}</span> },
      { key: 'cpm', label: 'CPM', sortable: true, render: (r) => `$${r.cpm?.toFixed(2) ?? '0.00'}` },
      { key: 'cpc', label: 'CPC', sortable: true, render: (r) => `$${r.cpc?.toFixed(2) ?? '0.00'}` },
      { key: 'ctr', label: 'CTR Matrix', sortable: true, render: (r) => <span style={{ fontWeight: 600 }}>{r.ctr?.toFixed(2) ?? '0.00'}%</span> },
      { key: 'roas', label: 'ROAS Factor', sortable: true, render: (r) => <span style={{ fontWeight: 800, color: '#16a34a' }}>{r.roas?.toFixed(2) ?? '0.00'}x</span> }
    ]}
    data={analyticsData?.daily?.slice().reverse() ?? []}
  />
</div>

      </div>
    </div>
  );
};
