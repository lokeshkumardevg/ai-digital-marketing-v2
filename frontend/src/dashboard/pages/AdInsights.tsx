import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { useSelector } from 'react-redux';
import { Activity, BarChart2, DollarSign, MousePointerClick, Target, TrendingUp, Users } from 'lucide-react';

const platforms = ['Meta', 'Google', 'X', 'LinkedIn'];

const getCurrencySymbol = (currency: string) => {
  switch (currency?.toUpperCase()) {
    case 'INR': return '₹';
    case 'USD': return '$';
    case 'GBP': return '£';
    case 'EUR': return '€';
    case 'CAD': return '$';
    case 'AUD': return '$';
    case 'AED': return 'د.إ';
    default: return '₹';
  }
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(Math.floor(num));
};

export const AdInsights: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState('Meta');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: any) => state.auth);
  const cur = getCurrencySymbol(user?.currency || 'INR');

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
        setData({ kpis: { spend: 0, impressions: 0, clicks: 0, conversions: 0, ctr: 0, cpc: 0, cpa: 0 }, campaigns: [] });
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [activePlatform, refreshKey, user]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getPlatformColor = (platform: string) => {
    switch(platform) {
      case 'Meta': return '#1877f2';
      case 'Google': return '#34a853';
      case 'X': return '#0F1733';
      case 'LinkedIn': return '#0a66c2';
      default: return '#1877f2';
    }
  };

  const pColor = getPlatformColor(activePlatform);

  if (loading || !data) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: `3px solid ${pColor}40`, borderTopColor: pColor, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Fetching live data from {activePlatform}...</div>
      </div>
    </div>
  );

  const { kpis, campaigns } = data;

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--glass-border)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.2rem', margin: '0 0 4px 0' }}>Ads Manager</h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Native real-time analytics from connected ad accounts</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Last updated: Just now</div>
          <button 
            onClick={handleRefresh}
            style={{ fontSize: '0.85rem', color: '#fff', background: pColor, border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'opacity 0.2s' }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            <Activity size={14} /> Refresh Data
          </button>
        </div>
      </div>
      
      {error && (
        <div style={{ margin: '16px 32px 0', padding: '14px 18px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
          {error}
        </div>
      )}

      {/* Platform Tabs */}
      <div style={{ padding: '24px 32px 0', display: 'flex', gap: '8px' }}>
        {platforms.map(p => {
          const isActive = activePlatform === p;
          const color = getPlatformColor(p);
          return (
            <button key={p} onClick={() => setActivePlatform(p)} style={{
              padding: '12px 24px', border: isActive ? `1px solid ${color}40` : '1px solid transparent', 
              background: isActive ? `${color}10` : 'transparent', 
              borderRadius: '12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 600,
              color: isActive ? color : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
            }}>
              <span style={{ fontSize: '1.1rem' }}>
                {p === 'Meta' ? '𝕄' : p === 'Google' ? 'G' : p === 'X' ? '𝕏' : p === 'LinkedIn' ? '💼' : 'Ꞵ'}
              </span>
              {p}
            </button>
          )
        })}
      </div>

      <div style={{ padding: '24px 32px' }}>
        
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              <DollarSign size={16} color={pColor} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Amount Spent</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>{cur}{formatNumber(kpis?.spend || 0)}</div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              <Users size={16} color={pColor} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Impressions</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatNumber(kpis?.impressions || 0)}</div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              <MousePointerClick size={16} color={pColor} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Clicks</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatNumber(kpis?.clicks || 0)}</div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              <Target size={16} color={pColor} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Results</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatNumber(kpis?.conversions || 0)}</div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              <TrendingUp size={16} color={pColor} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cost per Result</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>{cur}{(kpis?.cpa || 0).toFixed(2)}</div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              <BarChart2 size={16} color={pColor} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Avg. CTR</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>{(kpis?.ctr || 0).toFixed(2)}%</div>
          </div>

        </div>

        {/* Data Table */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-elevated)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Campaigns</h3>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '14px 20px', borderBottom: '1px solid var(--glass-border)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Campaign Name</th>
                  <th style={{ padding: '14px 20px', borderBottom: '1px solid var(--glass-border)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ padding: '14px 20px', borderBottom: '1px solid var(--glass-border)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right', whiteSpace: 'nowrap' }}>Amount Spent</th>
                  <th style={{ padding: '14px 20px', borderBottom: '1px solid var(--glass-border)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right', whiteSpace: 'nowrap' }}>Impressions</th>
                  <th style={{ padding: '14px 20px', borderBottom: '1px solid var(--glass-border)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right', whiteSpace: 'nowrap' }}>Clicks</th>
                  <th style={{ padding: '14px 20px', borderBottom: '1px solid var(--glass-border)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right', whiteSpace: 'nowrap' }}>Results</th>
                  <th style={{ padding: '14px 20px', borderBottom: '1px solid var(--glass-border)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right', whiteSpace: 'nowrap' }}>Cost / Result</th>
                  <th style={{ padding: '14px 20px', borderBottom: '1px solid var(--glass-border)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right', whiteSpace: 'nowrap' }}>CTR</th>
                  <th style={{ padding: '14px 20px', borderBottom: '1px solid var(--glass-border)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right', whiteSpace: 'nowrap' }}>CPC</th>
                </tr>
              </thead>
              <tbody>
                {campaigns?.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      No active campaigns found for {activePlatform}.
                    </td>
                  </tr>
                ) : (
                  campaigns?.map((campaign: any, i: number) => (
                    <tr key={campaign.id || i} style={{ borderBottom: '1px solid var(--glass-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{campaign.name}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, padding: '4px 8px', borderRadius: '4px', background: campaign.status?.toUpperCase() === 'ACTIVE' || campaign.status?.toUpperCase() === 'ENABLED' ? '#10b98120' : 'var(--bg-elevated)', color: campaign.status?.toUpperCase() === 'ACTIVE' || campaign.status?.toUpperCase() === 'ENABLED' ? '#10b981' : 'var(--text-secondary)' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: campaign.status?.toUpperCase() === 'ACTIVE' || campaign.status?.toUpperCase() === 'ENABLED' ? '#10b981' : 'var(--text-dim)' }} />
                          {campaign.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: 'var(--text-primary)', textAlign: 'right' }}>{cur}{(campaign.spend || 0).toFixed(2)}</td>
                      <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: 'var(--text-primary)', textAlign: 'right' }}>{formatNumber(campaign.impressions || 0)}</td>
                      <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: 'var(--text-primary)', textAlign: 'right' }}>{formatNumber(campaign.clicks || 0)}</td>
                      <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: 'var(--text-primary)', textAlign: 'right' }}>{formatNumber(campaign.conversions || 0)}</td>
                      <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: 'var(--text-primary)', textAlign: 'right' }}>{cur}{(campaign.cpa || 0).toFixed(2)}</td>
                      <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: 'var(--text-primary)', textAlign: 'right' }}>{(campaign.ctr || 0).toFixed(2)}%</td>
                      <td style={{ padding: '14px 20px', fontSize: '0.9rem', color: 'var(--text-primary)', textAlign: 'right' }}>{cur}{(campaign.cpc || 0).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
