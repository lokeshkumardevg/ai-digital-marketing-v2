import React, { useState, useEffect } from 'react';

// AdsGo-style Home = KPI Dashboard with date filters + line chart + metrics
const dateRanges = ['Last 7 days', 'Last 14 days', 'Last 30 days', 'Last 90 days', 'Today'];

// Mock spark data for mini line chart simulation
const spendData = [44, 55, 78, 90, 80, 72, 100, 95, 88, 85, 60, 20, 10, 5];
const roasData = [1.1, 1.2, 1.5, 2.0, 1.8, 1.6, 2.5, 2.3, 2.1, 2.0, 1.5, 0.8, 0.5, 0.2];

const dates = ['2025-08-19', '2025-08-20', '2025-08-21', '2025-08-22', '2025-08-23', '2025-08-24', '2025-08-25'];

const kpis = [
  { label: 'Spend', value: '$425.05', color: '#7c3aed', checked: true },
  { label: 'CPM', value: '$5.55', color: '#94a3b8', checked: false },
  { label: 'CPC', value: '$0.07', color: '#94a3b8', checked: false },
  { label: 'CTR', value: '7.45%', color: '#94a3b8', checked: false },
  { label: 'ROAS', value: '1.83', color: '#16a34a', checked: true },
  { label: 'Purchase Value', value: '$0', color: '#94a3b8', checked: false },
];

const dailyRows = [
  { date: '2025-08-25', spend: '$5.38', cpm: '$5.38', cpc: '$1.00', ctr: '0.54%', roas: '0.00', purchase: '$0' },
  { date: '2025-08-24', spend: '$80.56', cpm: '$5.20', cpc: '$0.06', ctr: '8.43%', roas: '0.00', purchase: '$0' },
  { date: '2025-08-23', spend: '$88.25', cpm: '$5.43', cpc: '$0.06', ctr: '8.58%', roas: '4.56', purchase: '$402.5' },
  { date: '2025-08-22', spend: '$100.78', cpm: '$6.00', cpc: '$0.07', ctr: '9.20%', roas: '5.11', purchase: '$515' },
  { date: '2025-08-21', spend: '$78.34', cpm: '$5.10', cpc: '$0.05', ctr: '7.90%', roas: '3.21', purchase: '$251' },
  { date: '2025-08-20', spend: '$55.22', cpm: '$4.80', cpc: '$0.05', ctr: '7.10%', roas: '2.50', purchase: '$138' },
  { date: '2025-08-19', spend: '$44.10', cpm: '$4.60', cpc: '$0.04', ctr: '6.80%', roas: '2.10', purchase: '$93' },
];

// Simple SVG polyline chart
const ChartLine: React.FC<{ data: number[]; color: string; height: number; width: number }> = ({ data, color, height, width }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 10) - 5;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

export const Crm: React.FC = () => {
  const [activeRange, setActiveRange] = useState('Last 7 days');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [kpis, setKpis] = useState([
    { label: 'Spend', value: '$0.00', color: '#7c3aed', checked: true, key: 'spend' },
    { label: 'CPM', value: '$0.00', color: '#94a3b8', checked: false, key: 'cpm' },
    { label: 'CPC', value: '$0.00', color: '#94a3b8', checked: false, key: 'cpc' },
    { label: 'CTR', value: '0.00%', color: '#94a3b8', checked: false, key: 'ctr' },
    { label: 'ROAS', value: '0.00', color: '#16a34a', checked: true, key: 'roas' },
    { label: 'Purchase Value', value: '$0', color: '#94a3b8', checked: false, key: 'purchaseValue' },
  ]);

  useEffect(() => {
    fetch('http://localhost:3000/analytics/dashboard', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
      .then(res => res.json())
      .then(json => {
        setData(json);
        setKpis(prev => prev.map(k => ({
          ...k,
          value: k.key === 'ctr' || k.key === 'roas' ? json.summary[k.key] : `$${json.summary[k.key]}`
        })));
        setLoading(false);
      })
      .catch(err => {
        console.error('Analytics fetch failed', err);
        setLoading(false);
      });
  }, []);

  const toggleKpi = (i: number) => {
    const newKpis = [...kpis];
    newKpis[i].checked = !newKpis[i].checked;
    setKpis(newKpis);
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="animate-fade-in" style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}>Quantum Analytics Loading...</div>
      </div>
    </div>
  );

  const activeDates = data.daily.map((d: any) => d.date);
  const activeSpend = data.daily.map((d: any) => d.spend);
  const activeRoas = data.daily.map((d: any) => d.roas);

  return (
    <div style={{ minHeight: '100%', background: '#f5f6fa' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8eaf0', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Home</span>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: '#7c3aed', textDecoration: 'none', fontWeight: 500 }}>
            📖 How to use?
          </a>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>🌐 Time Zone: UTC+5:5</div>
      </div>

      <div style={{ padding: '20px 32px' }}>
        {/* Date Range Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {dateRanges.map(r => (
            <button key={r} onClick={() => setActiveRange(r)} style={{
              padding: '6px 16px', borderRadius: '99px', border: activeRange === r ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
              background: activeRange === r ? '#7c3aed' : '#fff', color: activeRange === r ? '#fff' : '#475569',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
            }}>{r}</button>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '99px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.8rem', color: '#475569', cursor: 'pointer', marginLeft: '4px' }}>
            📅 {activeDates[0]} → {activeDates[6]}
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {kpis.map((kpi, i) => (
              <div key={kpi.label} onClick={() => toggleKpi(i)} style={{ padding: '14px 16px', borderRadius: '10px', border: `1.5px solid ${kpi.checked ? kpi.color + '50' : '#f1f5f9'}`, background: kpi.checked ? kpi.color + '05' : '#fafafa', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', transition: 'all 0.15s' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <div style={{ width: '12px', height: '3px', borderRadius: '2px', background: kpi.checked ? kpi.color : '#e2e8f0' }} />
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>{kpi.label}</span>
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: kpi.checked ? kpi.color : '#94a3b8', fontFamily: 'Outfit' }}>{kpi.value}</div>
                </div>
                <input type="checkbox" checked={kpi.checked} readOnly style={{ accentColor: '#7c3aed', width: '16px', height: '16px', cursor: 'pointer', marginTop: '2px' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Line Chart */}
        <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Spend($)</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>ROAS</div>
          </div>
          <div style={{ position: 'relative', height: '160px' }}>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(pct => (
              <div key={pct} style={{ position: 'absolute', top: `${100 - pct}%`, left: 0, right: 0, height: '1px', background: '#f1f5f9' }} />
            ))}
            {/* Chart Lines overlaid */}
            <div style={{ position: 'absolute', inset: 0 }}>
              <ChartLine data={activeSpend} color="#7c3aed" height={160} width={900} />
            </div>
            <div style={{ position: 'absolute', inset: 0 }}>
              <ChartLine data={activeRoas.map((v: number) => v * 40)} color="#16a34a" height={160} width={900} />
            </div>
          </div>
          {/* X-axis dates */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            {activeDates.map((d: string) => <span key={d} style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{d}</span>)}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '16px', height: '3px', background: '#7c3aed', borderRadius: '2px' }} />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Spend</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '16px', height: '3px', background: '#16a34a', borderRadius: '2px' }} />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ROAS</span>
            </div>
          </div>
        </div>

        {/* Daily Performance Table */}
        <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
            Daily Performance
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                {['Date', 'Spend', 'CPM', 'CPC', 'CTR', 'ROAS', 'Purchase Value'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.daily.slice().reverse().map((row: any, i: number) => (
                <tr key={i} style={{ borderBottom: i < data.daily.length - 1 ? '1px solid #f8fafc' : 'none', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>{row.date}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#7c3aed', fontWeight: 700 }}>${row.spend.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#475569' }}>${row.cpm.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#475569' }}>${row.cpc.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#475569' }}>{row.ctr.toFixed(2)}%</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#16a34a', fontWeight: 700 }}>{row.roas.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#475569' }}>${row.purchaseValue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

