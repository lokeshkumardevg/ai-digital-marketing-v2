import React, { useState, useEffect } from 'react';

const platforms = ['Meta', 'Google', 'TikTok', 'Bing'];

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
      <circle cx={cx} cy={cy} r={r * 0.55} fill="#fff" />
    </svg>
  );
};

const audienceData = [
  { label: 'Local Diners', value: 40, color: '#7c3aed' },
  { label: 'Fast Food Lovers', value: 25, color: '#84cc16' },
  { label: 'Latino Community', value: 20, color: '#f97316' },
  { label: 'Others', value: 15, color: '#e2e8f0' },
];

const pageData = [
  { label: 'goodkarmasj.com/main', value: 60, color: '#3b82f6' },
  { label: 'goodkarmasj.com/menu', value: 40, color: '#22d3ee' },
];

const topAudiences = [
  { name: 'Local Diners', tags: ['Neighborhood restaurants', 'Classic diners', 'Local comfort food'], cpa: '2.8 CPA', spend: '$455 spend · 11 campaigns' },
  { name: 'Fast Food Lovers', tags: ['Burgers', 'Quick service', 'Deals'], cpa: '4.1 CPA', spend: '$280 spend · 7 campaigns' },
  { name: 'Latino Community', tags: ['Spanish content', 'Cultural events'], cpa: '3.2 CPA', spend: '$175 spend · 4 campaigns' },
];

const topPages = [
  { url: 'https://www.goodkarmasj.com/', cvr: '1.88% CVR', spend: '$325 spend · 3 campaigns' },
  { url: 'https://www.goodkarmasj.com/menu', cvr: '0.92% CVR', spend: '$130 spend · 2 campaigns' },
];

// Creative Scatter Chart (simplified as bubble-like items)
const creatives = [
  { name: 'Summer Banner', cpa: 2.1, ctr: 8.5, spend: 420, color: '#7c3aed' },
  { name: 'Product Shot', cpa: 3.8, ctr: 5.2, spend: 280, color: '#f97316' },
  { name: 'Story Reel', cpa: 1.6, ctr: 12.1, spend: 580, color: '#16a34a' },
  { name: 'Carousel Ad', cpa: 4.5, ctr: 4.0, spend: 190, color: '#3b82f6' },
];

export const AdInsights: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState('Meta');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    // Simulating platform-specific fetch
    setTimeout(() => {
      const multiplier = activePlatform === 'Meta' ? 1.2 : activePlatform === 'Google' ? 0.8 : 0.5;
      setData({
        audiences: audienceData.map(d => ({ ...d, value: Math.floor(d.value * multiplier) })),
        pages: pageData.map(d => ({ ...d, value: Math.floor(d.value * multiplier) })),
        creatives: creatives.map(c => ({ ...c, cpa: (c.cpa * multiplier).toFixed(1), ctr: (c.ctr / multiplier).toFixed(1) }))
      });
      setLoading(false);
    }, 600);
  }, [activePlatform]);

  if (loading || !data) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
      <div className="animate-fade-in" style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}>Analyzing {activePlatform} Performance...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100%', background: '#f5f6fa' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8eaf0', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Ad Insights</span>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>March 27, 2026</span>
          <span style={{ fontSize: '0.78rem', color: '#e57c00', background: '#fff8ee', border: '1px solid #fed7aa', padding: '2px 8px', borderRadius: '5px', fontWeight: 600 }}>
            Demo data. Real data will appear 3-4 days after first publish
          </span>
          <a href="#" style={{ fontSize: '0.78rem', color: '#7c3aed', textDecoration: 'none', fontWeight: 500 }}>📖 How to use?</a>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>🌐 Time Zone: UTC+5:5</div>
      </div>

      <div style={{ padding: '0' }}>
        {/* Platform Tabs */}
        <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '0 32px', display: 'flex', gap: '0' }}>
          {platforms.map(p => (
            <button key={p} onClick={() => setActivePlatform(p)} style={{
              padding: '14px 24px', border: 'none', background: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 600,
              color: activePlatform === p ? '#0f172a' : '#94a3b8',
              borderBottom: activePlatform === p ? '2px solid #7c3aed' : '2px solid transparent',
            }}>
              <span style={{ fontSize: '1rem' }}>{p === 'Meta' ? '𝕄' : p === 'Google' ? 'G' : p === 'TikTok' ? '♪' : 'Ꞵ'}</span>
              {p}
            </button>
          ))}
        </div>

        <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Left: Audience Insight */}
          <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '3px', height: '18px', background: '#7c3aed', borderRadius: '2px' }} />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Audience Insight</span>
            </div>

            {/* Spend Distribution Donut */}
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', marginBottom: '14px' }}>Spend Distribution</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <DonutChart data={data.audiences} size={130} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {data.audiences.map((d: any) => (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.78rem', color: '#374151' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.color, flexShrink: 0 }} />
                    {d.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Top Audiences */}
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', marginBottom: '10px' }}>Top Audiences</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {topAudiences.map((aud, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: i < topAudiences.length - 1 ? '1px dashed #f1f5f9' : 'none' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', marginBottom: '6px' }}>{aud.name}</div>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '5px' }}>
                    {aud.tags.map(tag => <span key={tag} style={{ padding: '2px 8px', borderRadius: '5px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.72rem', color: '#475569' }}>{tag}</span>)}
                  </div>
                  <div style={{ fontSize: '0.75rem', display: 'flex', gap: '12px' }}>
                    <span style={{ color: '#7c3aed', fontWeight: 700 }}>{aud.cpa}</span>
                    <span style={{ color: '#94a3b8' }}>{aud.spend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Page Insights */}
          <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '3px', height: '18px', background: '#3b82f6', borderRadius: '2px' }} />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Page Insights</span>
            </div>

            {/* Spend Distribution Donut */}
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', marginBottom: '14px' }}>Spend Distribution</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <DonutChart data={data.pages} size={130} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {data.pages.map((d: any) => (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.78rem', color: '#374151' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.72rem', wordBreak: 'break-all' }}>{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Pages */}
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', marginBottom: '10px' }}>Top Pages</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {topPages.map((page, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: i < topPages.length - 1 ? '1px dashed #f1f5f9' : 'none' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a', marginBottom: '4px', wordBreak: 'break-all' }}>{page.url}</div>
                  <div style={{ fontSize: '0.75rem', display: 'flex', gap: '12px' }}>
                    <span style={{ color: '#7c3aed', fontWeight: 700 }}>{page.cvr}</span>
                    <span style={{ color: '#94a3b8' }}>{page.spend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Creative Insight Section */}
        <div style={{ padding: '0 32px 24px' }}>
          <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '3px', height: '18px', background: '#f97316', borderRadius: '2px' }} />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Creative Insight</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', marginBottom: '14px' }}>Creative Performance (CPA vs CTR)</div>

            {/* Simple creative performance visualization */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {data.creatives.map((c: any, i: number) => (
                <div key={i} style={{ padding: '14px', borderRadius: '10px', border: '1px solid #e8eaf0', background: '#fafafa' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>{c.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>CPA</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit' }}>${c.cpa}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>CTR</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: c.color, fontFamily: 'Outfit' }}>{c.ctr}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Spend</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#475569', fontFamily: 'Outfit' }}>${c.spend}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
