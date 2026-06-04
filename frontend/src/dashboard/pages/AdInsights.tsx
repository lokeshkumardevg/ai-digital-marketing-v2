import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { useSelector } from 'react-redux';

const platforms = ['Meta', 'Google', 'X', 'LinkedIn'];

// Donut chart SVG helper
const DonutChart: React.FC<{
  data: { label: string; value: number; color: string }[];
  size?: number;
}> = ({ data, size = 140 }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = 46; const cx = size / 2; const cy = size / 2;
  let offset = -Math.PI / 2;
  const slices = data.map(d => {
    const angle = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(offset);
    const y1 = cy + r * Math.sin(offset);
    offset += angle;
    const x2 = cx + r * Math.cos(offset);
    const y2 = cy + r * Math.sin(offset);
    const la = angle > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2} Z`;
    return { path, color: d.color };
  });
  return (
    <svg width={size} height={size}>
      {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} />)}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="var(--bg-card)" />
    </svg>
  );
};

const topAudiencesMock = [
  { name: 'Local Diners', tags: ['Neighborhood restaurants', 'Classic diners', 'Local comfort food'], cpa: '2.8 CPA', spend: '$455 spend · 11 campaigns' },
  { name: 'Fast Food Lovers', tags: ['Burgers', 'Quick service', 'Deals'], cpa: '4.1 CPA', spend: '$280 spend · 7 campaigns' },
  { name: 'Latino Community', tags: ['Spanish content', 'Cultural events'], cpa: '3.2 CPA', spend: '$175 spend · 4 campaigns' },
];

const topPagesMock = [
  { url: 'https://www.goodkarmasj.com/', cvr: '1.88% CVR', spend: '$325 spend · 3 campaigns' },
  { url: 'https://www.goodkarmasj.com/menu', cvr: '0.92% CVR', spend: '$130 spend · 2 campaigns' },
];

export const AdInsights: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState('Meta');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: any) => state.auth);

  const platformMap: { [key: string]: string } = {
    'Meta': 'meta',
    'Google': 'google',
    'X': 'twitter',
    'LinkedIn': 'linkedin',
  };

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const platform = platformMap[activePlatform] || 'meta';
      const customerId = user?.googleCustomerId || '';

      setError(null);
      try {
        const customerIdParam = customerId ? `&customerId=${encodeURIComponent(customerId)}` : '';
        const url = `/analytics/insights?platform=${platform}${customerIdParam}${refreshKey ? '&bypassCache=true' : ''}`;
        const res = await api.get(url);
        setData(res.data);
      } catch (err: any) {
        console.error('Failed to fetch ad insights', err);
        const status = err?.response?.status;
        if (status === 428) {
          setError('Google Ads customer ID or credentials are missing. Check your backend .env values or connect your Google account.');
        } else {
          setError('Unable to fetch ad insights. Please refresh or check your integration settings.');
        }
        setData({ audiences: [], pages: [], creatives: [] });
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [activePlatform, refreshKey, user]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading || !data) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="animate-fade-in" style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Analyzing {activePlatform} Performance...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--glass-border)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Ad Insights</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Live Data from {activePlatform}</span>
          <button 
            onClick={handleRefresh}
            style={{ fontSize: '0.78rem', color: '#0665ff', background: 'none', border: '1px solid #c4b5fd', padding: '4px 12px', borderRadius: '5px', fontWeight: 500, cursor: 'pointer' }}
          >
            🔄 Refresh
          </button>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Data cached 30min • Redis powered</div>
      </div>
      {error && (
        <div style={{ margin: '16px 32px 0', padding: '14px 18px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
          {error}
        </div>
      )}

      <div style={{ padding: '0' }}>
        {/* Platform Tabs */}
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid #f1f5f9', padding: '0 32px', display: 'flex', gap: '0' }}>
          {platforms.map(p => (
            <button key={p} onClick={() => setActivePlatform(p)} style={{
              padding: '14px 24px', border: 'none', background: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 600,
              color: activePlatform === p ? '#eaecf3' : '#94a3b8',
              borderBottom: activePlatform === p ? '2px solid #0665ff' : '2px solid transparent',
            }}>
              <span style={{ fontSize: '1rem' }}>
                {p === 'Meta' ? '𝕄' : p === 'Google' ? 'G' : p === 'X' ? '𝕏' : p === 'LinkedIn' ? '💼' : 'Ꞵ'}
              </span>
              {p}
            </button>
          ))}
        </div>

        <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Left: Audience Insight */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '3px', height: '18px', background: '#0665ff', borderRadius: '2px' }} />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Audience Insight</span>
            </div>

            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '14px' }}>Spend Distribution</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <DonutChart data={data.audiences || []} size={130} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {data.audiences?.map((d: any) => (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.color, flexShrink: 0 }} />
                    {d.label}
                  </div>
                )) || <div>No audience data</div>}
              </div>
            </div>

            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '10px' }}>Top Audiences</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {topAudiencesMock.map((aud, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: i < topAudiencesMock.length - 1 ? '1px dashed #f1f5f9' : 'none' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px' }}>{aud.name}</div>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '5px' }}>
                    {aud.tags.map(tag => <span key={tag} style={{ padding: '2px 8px', borderRadius: '5px', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{tag}</span>)}
                  </div>
                  <div style={{ fontSize: '0.75rem', display: 'flex', gap: '12px' }}>
                    <span style={{ color: '#0665ff', fontWeight: 700 }}>{aud.cpa}</span>
                    <span style={{ color: 'var(--text-dim)' }}>{aud.spend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Page Insights */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '3px', height: '18px', background: '#3b82f6', borderRadius: '2px' }} />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Page Insights</span>
            </div>

            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '14px' }}>Spend Distribution</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <DonutChart data={data.pages || []} size={130} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {data.pages?.map((d: any) => (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.72rem', wordBreak: 'break-all' }}>{d.label}</span>
                  </div>
                )) || <div>No page data</div>}
              </div>
            </div>

            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '10px' }}>Top Pages</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {topPagesMock.map((page, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: i < topPagesMock.length - 1 ? '1px dashed #f1f5f9' : 'none' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: '4px', wordBreak: 'break-all' }}>{page.url}</div>
                  <div style={{ fontSize: '0.75rem', display: 'flex', gap: '12px' }}>
                    <span style={{ color: '#0665ff', fontWeight: 700 }}>{page.cvr}</span>
                    <span style={{ color: 'var(--text-dim)' }}>{page.spend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Creative Insight Section */}
        <div style={{ padding: '0 32px 24px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '3px', height: '18px', background: '#f97316', borderRadius: '2px' }} />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Creative Insight</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '14px' }}>Creative Performance (CPA vs CTR)</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {data.creatives?.map((c: any, i: number) => (
                <div key={i} style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--bg-elevated)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>CPA</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit' }}>${c.cpa}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>CTR</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: c.color, fontFamily: 'Outfit' }}>{c.ctr}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Spend</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)', fontFamily: 'Outfit' }}>${c.spend}</div>
                    </div>
                  </div>
                </div>
              )) || <div>No creative data available</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

