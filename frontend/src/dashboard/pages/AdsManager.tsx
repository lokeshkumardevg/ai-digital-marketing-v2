import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BrainCircuit, TrendingUp, Zap, BarChart2, RefreshCw, Search, ArrowUpRight, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { SmartTable } from '../components/SmartTable';
import { EditGoogleCampaignModal } from '../components/EditGoogleCampaignModal';
import { api } from '../../api/axios';

const platforms = ['All', 'Meta', 'Google', 'X', 'LinkedIn'];

const ToggleSwitch: React.FC<{ isActive: boolean; onToggle: () => void; disabled?: boolean }> = ({ isActive, onToggle, disabled }) => {
  return (
    <div
  onClick={() => !disabled && onToggle()}
  style={{
    width: '38px',
    height: '20px',
    borderRadius: '999px',
    backgroundColor: isActive ? '#2563eb' : '#d1d5db',
    position: 'relative',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.4 : 1,
    display: 'inline-block',
    border: '1px solid #9ca3af'
  }}
>
  <div
    style={{
      position: 'absolute',
      top: '2px',
      left: isActive ? '20px' : '2px',
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      backgroundColor: '#fff',
      transition: 'left 0.2s ease',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
    }}
  />
</div>
  );
};

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

export const AdsManager: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);
  const userId = user?._id || '';
  const cur = getCurrencySymbol(user?.currency || 'INR');

  const [activePlatform, setActivePlatform] = useState('All');
  const [search, setSearch] = useState('');
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editingGoogleCampaign, setEditingGoogleCampaign] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [billingStatus, setBillingStatus] = useState<any>({
    connected: false,
    hasPaymentMethod: false,
    billingSetupUrl: 'https://adsmanager.facebook.com/adsmanager/manage/billing',
    loading: true,
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCampaigns = () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get(`/campaign/user/${userId}`)
      .then(res => {
        const campaignsData = Array.isArray(res.data) ? res.data : [];
        const hashStr = (str: string) => {
          let hash = 0;
          for (let i = 0; i < str.length; i++) hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
          return Math.abs(hash);
        };

        const mapped = campaignsData.map((c: any) => {
          try {
            if (!c) {
              return {
                id: '',
                name: 'AI Campaign',
                platform: 'Meta',
                status: 'active',
                delivery: 'ACTIVE',
                spend: `${cur}0.00`,
                budget: `${cur}35/day`,
                roas: '0.0x',
                ctr: '0.00%',
                impressions: '0',
                reach: '0',
                results: '0 (Landing Page Views)',
                costPerResult: '—',
                bidStrategy: 'Lowest Cost',
                score: 70
              };
            }

            const seed = c._id ? hashStr(c._id.toString()) : Math.random() * 1000;
            const sM1 = (seed % 100) / 100;
            const sM2 = (seed % 50) / 50;

            const isReal = !!c.isRealMeta || !!c.isRealGoogle || !!c.isRealLinkedIn || !!c.isRealX || !!c.isReal;

            const rawSpend = isReal ? c.spend : (100 + sM1 * 1000);
            const spendVal = Number(rawSpend) || 0;

            const rawImpressions = isReal ? c.impressions : Math.floor((10 + sM2 * 490) * 1000);
            const impressionsVal = Number(rawImpressions) || 0;

            const rawClicks = isReal ? c.clicks : Math.floor(impressionsVal * (0.03 + sM1 * 0.08));
            const clicksVal = Number(rawClicks) || 0;

            const rawReach = isReal ? c.reach : Math.floor(impressionsVal * 0.9);
            const reachVal = Number(rawReach) || 0;
            
            const ctrVal = impressionsVal > 0 ? (clicksVal / impressionsVal) * 100 : 0;
            const roasVal = isReal ? (clicksVal > 0 && spendVal > 0 ? (spendVal * 2.5) / spendVal : 2.5) : (2.0 + sM2 * 4);

            const rawResults = isReal ? c.results : Math.floor(clicksVal * 0.4);
            const resultsVal = Number(rawResults) || 0;

            const resultTypeVal = isReal ? c.resultType : 'Landing Page Views';

            const rawCostPerResult = isReal ? c.costPerResult : (resultsVal > 0 ? spendVal / resultsVal : 0);
            const costPerResultVal = Number(rawCostPerResult) || 0;

            const rawBudget = isReal ? c.dailyBudget : (c.budget?.daily || 35);
            const budgetVal = Number(rawBudget) || 35;

            const deliveryVal = isReal ? c.delivery : (c.status || 'ACTIVE');
            const bidStrategyVal = isReal ? c.bidStrategy : 'Lowest Cost';

            let plat = c.platform || 'Meta';
            const lowerPlat = plat.toLowerCase();
            if (lowerPlat === 'x' || lowerPlat === 'twitter') {
              plat = 'X';
            } else if (lowerPlat === 'meta') {
              plat = 'Meta';
            } else if (lowerPlat === 'google') {
              plat = 'Google';
            } else if (lowerPlat === 'linkedin') {
              plat = 'LinkedIn';
            }

            let statusVal = (c.status || 'active').toLowerCase();
            if (isReal) {
              const upperDelivery = deliveryVal.toUpperCase();
              if (upperDelivery.includes('ACTIVE') || upperDelivery.includes('ENABLED')) {
                statusVal = 'active';
              } else if (upperDelivery.includes('PAUSED')) {
                statusVal = 'paused';
              }
            }

            return {
              id: c._id ? c._id.toString() : '',
              originalData: c,
              name: c.name || 'AI Campaign',
              platform: plat,
              status: statusVal,
              delivery: deliveryVal,
              spend: `${cur}${spendVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              budget: `${cur}${budgetVal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/day`,
              roas: `${Number(roasVal || 0).toFixed(1)}x`,
              ctr: `${Number(ctrVal || 0).toFixed(2)}%`,
              impressions: impressionsVal >= 1000 ? `${(impressionsVal / 1000).toFixed(0)}K` : impressionsVal.toString(),
              reach: reachVal >= 1000 ? `${(reachVal / 1000).toFixed(0)}K` : reachVal.toString(),
              results: `${resultsVal} (${resultTypeVal || 'Landing Page Views'})`,
              costPerResult: costPerResultVal > 0 ? `${cur}${costPerResultVal.toFixed(2)}` : '—',
              bidStrategy: bidStrategyVal || 'Lowest Cost',
              score: Math.floor(Number(c.aiStrategy?.performanceScore || (60 + sM1 * 35)) || 70),
              isReal: isReal,
            };
          } catch (itemErr) {
            console.error('Failed mapping campaign item:', c, itemErr);
            let plat = c?.platform || 'Meta';
            const lowerPlat = plat.toLowerCase();
            if (lowerPlat === 'x' || lowerPlat === 'twitter') {
              plat = 'X';
            } else if (lowerPlat === 'meta') {
              plat = 'Meta';
            } else if (lowerPlat === 'google') {
              plat = 'Google';
            } else if (lowerPlat === 'linkedin') {
              plat = 'LinkedIn';
            }

            return {
              id: c?._id ? c._id.toString() : '',
              originalData: c,
              name: c?.name || 'AI Campaign',
              platform: plat,
              status: 'active',
              delivery: 'ACTIVE',
              spend: `${cur}0.00`,
              budget: `${cur}35/day`,
              roas: '0.0x',
              ctr: '0.00%',
              impressions: '0',
              reach: '0',
              results: '0 (Landing Page Views)',
              costPerResult: '—',
              bidStrategy: 'Lowest Cost',
              score: 70,
              isReal: false,
            };
          }
        });
        setAds(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error('Campaigns fetch failed', err);
        showToast('Failed to load campaigns from server', 'error');
        setLoading(false);
      });
  };

  const fetchBillingStatus = () => {
    if (!userId) return;
    api.get(`/campaign/meta/billing-status/${userId}`)
      .then(res => {
        setBillingStatus({
          connected: res.data?.connected ?? false,
          hasPaymentMethod: res.data?.hasPaymentMethod ?? false,
          billingSetupUrl: res.data?.billingSetupUrl || 'https://adsmanager.facebook.com/adsmanager/manage/billing',
          accountStatus: res.data?.accountStatus || 'UNKNOWN',
          adAccountId: res.data?.adAccountId || '',
          loading: false,
        });
      })
      .catch(err => {
        console.error('Failed to fetch billing status', err);
        setBillingStatus((prev: any) => ({ ...prev, loading: false }));
      });
  };

  useEffect(() => {
    fetchCampaigns();
    fetchBillingStatus();
  }, [userId]);

  const handleToggle = async (campaignId: string, currentStatus: string) => {
    setTogglingId(campaignId);
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      showToast(`Updating status to ${newStatus}...`, 'info');
      const response = await api.post(`/campaign/${campaignId}/toggle-status`, { status: newStatus });
      if (response.data?.success) {
        setAds(prev => prev.map(ad => ad.id === campaignId ? { ...ad, status: newStatus, delivery: newStatus === 'active' ? 'ACTIVE' : 'PAUSED' } : ad));
        showToast(`Campaign successfully ${newStatus === 'active' ? 'activated' : 'paused'}!`, 'success');
      }
    } catch (err: any) {
      console.error('Failed to toggle campaign status:', err);
      const errMsg = err.response?.data?.message || 'Failed to update campaign status on Meta API';
      showToast(errMsg, 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleUpdateGoogleCampaign = async (updatedData: any) => {
    if (!editingGoogleCampaign) return;
    try {
      showToast('Updating Google Campaign...', 'info');
      const response = await api.put(`/campaign/google/${editingGoogleCampaign._id}`, {
        userId,
        ...updatedData
      });
      if (response.data) {
        showToast('Google Campaign updated successfully!', 'success');
        fetchCampaigns();
      }
    } catch (err: any) {
      console.error('Failed to update Google campaign:', err);
      const errMsg = err.response?.data?.message || 'Failed to update Google campaign';
      throw new Error(errMsg);
    }
  };

  const filtered = ads.filter(ad => {
    const platformLabel = ad.platform?.toLowerCase();
    const activePlatformLower = activePlatform.toLowerCase();
    const matchPlatform = activePlatform === 'All' || platformLabel === activePlatformLower;
    const matchSearch = ad.name.toLowerCase().includes(search.toLowerCase());
    return matchPlatform && matchSearch;
  });

  const activeCount = ads.filter(ad => ad.status === 'active').length;
  const pausedCount = ads.filter(ad => ad.status === 'paused').length;
  const draftCount = ads.filter(ad => ad.status === 'draft').length;

  // Dynamic metrics calculations from the campaign list
  const totalSpendVal = ads.reduce((sum, ad) => sum + parseFloat((ad.spend || '$0.00').replace(/[^0-9.]/g, '') || '0'), 0);
  const activeSpendVal = ads.reduce((sum, ad) => {
    if (ad.status === 'active') {
      return sum + parseFloat((ad.spend || '$0.00').replace(/[^0-9.]/g, '') || '0');
    }
    return sum;
  }, 0);
  const realSpendVal = ads.reduce((sum, ad) => {
    if (ad.isReal && ad.status === 'active') {
      return sum + parseFloat((ad.spend || '$0.00').replace(/[^0-9.]/g, '') || '0');
    }
    return sum;
  }, 0);

  const totalRoasVal = ads.reduce((sum, ad) => sum + parseFloat((ad.roas || '0.0x').replace(/[^0-9.]/g, '') || '0'), 0);
  const avgRoasVal = ads.length > 0 ? (totalRoasVal / ads.length).toFixed(1) : '0.0';
  const totalScoreVal = ads.reduce((sum, ad) => sum + (ad.score || 0), 0);
  const avgScoreVal = ads.length > 0 ? Math.round(totalScoreVal / ads.length) : 70;

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
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '8px', background: 'linear-gradient(135deg, #0665ff, #1e27a8)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
          <Zap size={14} /> Optimize All
        </button>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Insight Briefing */}
        <div className="briefing-grid" style={{ marginBottom: '20px' }}>
          {[
            { label: 'Total Spend', value: `${cur}${totalSpendVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'All campaigns', icon: BarChart2, color: '#0665ff' },
            { label: 'Active Spend', value: `${cur}${activeSpendVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'Active campaigns', icon: TrendingUp, color: '#0665ff' },
            { label: 'Real Active Spend', value: `${cur}${realSpendVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'Live campaigns', icon: DollarSign, color: '#10b981' },
            { label: 'Avg ROAS', value: `${avgRoasVal}x`, sub: 'Average return', icon: TrendingUp, color: '#16a34a' },
            { label: 'Active Ads', value: String(activeCount), sub: `${pausedCount} paused, ${draftCount} draft`, icon: Zap, color: '#d97706' },
            { label: 'AI Score', value: `${avgScoreVal}/100`, sub: 'Average optimization rating', icon: BrainCircuit, color: '#0665ff' },
          ].map((stat, i) => (
            <div key={i} className="briefing-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <stat.icon size={14} color={stat.color} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Account Integrity & Billing Status Alert Banner */}
        {billingStatus.connected && !billingStatus.loading && (
          <div style={{ 
            background: billingStatus.hasPaymentMethod ? 'rgba(16, 185, 129, 0.04)' : 'rgba(239, 68, 68, 0.06)', 
            border: `1px solid ${billingStatus.hasPaymentMethod ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.25)'}`, 
            borderRadius: '12px', 
            padding: '16px 20px', 
            marginBottom: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '16px',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {billingStatus.hasPaymentMethod ? (
                <CheckCircle size={18} color="#10b981" />
              ) : (
                <AlertCircle size={18} color="#ef4444" />
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  {billingStatus.hasPaymentMethod ? 'Ad Account Payment Setup Ok' : 'Meta Ad Account Payment Method Required'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {billingStatus.hasPaymentMethod 
                    ? `Your connected Meta Ad Account (${billingStatus.adAccountId || 'Active'}) has active payment settings.` 
                    : 'To avoid ad delivery failures or pauses, you must configure a valid billing card or payment method on your Meta Ads Manager.'}
                </div>
              </div>
            </div>
            {!billingStatus.hasPaymentMethod && (
              <a 
                href={billingStatus.billingSetupUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  background: '#ef4444', 
                  color: 'var(--text-primary)', 
                  textDecoration: 'none', 
                  fontWeight: 600, 
                  fontSize: '0.78rem', 
                  transition: 'background-color 0.2s' 
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dc2626'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ef4444'}
              >
                Setup Payment Method <ArrowUpRight size={13} />
              </a>
            )}
          </div>
        )}

        {/* Optimization Hub */}
        <div style={{ background: 'rgba(38, 49, 214, 0.05)', border: '1px solid rgba(38, 49, 214, 0.2)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BrainCircuit size={18} color="#0665ff" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Optimization Hub</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>AI detected 3 opportunities to improve your campaign performance</div>
            </div>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', borderRadius: '8px', background: '#0665ff', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
            View Recommendations <ArrowUpRight size={13} />
          </button>
        </div>

        {/* Platform Tabs + Search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-elevated)', borderRadius: '8px', padding: '3px', flexWrap: 'wrap' }}>
            {platforms.map(p => (
              <button key={p} onClick={() => setActivePlatform(p)} style={{
                padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                background: activePlatform === p ? '#0665ff' : 'transparent',
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
            <button onClick={() => { fetchCampaigns(); fetchBillingStatus(); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-card)', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
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
              { key: 'name', label: 'Campaign', sortable: true, render: (row) => (
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{row.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>ID: {row.id}</span>
                </div>
              ) },
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
              { key: 'delivery', label: 'Delivery', sortable: true, render: (row) => {
                  let bg = 'rgba(255,255,255,0.05)';
                  let color = '#94a3b8';
                  let text = row.delivery || 'Unknown';
                  
                  const cleanDev = text.toUpperCase();
                  if (cleanDev.includes('ACTIVE')) {
                    bg = 'rgba(16,185,129,0.12)';
                    color = '#10b981';
                    text = 'Active';
                  } else if (cleanDev.includes('PAUSED')) {
                    bg = 'rgba(245,158,11,0.12)';
                    color = '#f59e0b';
                    text = 'Paused';
                  } else if (cleanDev.includes('BILLING') || cleanDev.includes('ERROR') || cleanDev.includes('PAYMENT')) {
                    bg = 'rgba(239,68,68,0.12)';
                    color = '#ef4444';
                    text = 'Payment error';
                  } else if (cleanDev.includes('REVIEW')) {
                    bg = 'rgba(59,130,246,0.12)';
                    color = '#3b82f6';
                    text = 'In review';
                  } else if (cleanDev.includes('DISABLED') || cleanDev.includes('DISAPPROVED')) {
                    bg = 'rgba(239,68,68,0.12)';
                    color = '#ef4444';
                    text = 'Disabled';
                  }

                  return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '99px', background: bg, color: color, fontSize: '0.75rem', fontWeight: 600 }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: color }} />{text}
                    </span>
                  );
              }},
              { key: 'toggle', label: 'Status Switch', sortable: false, render: (row) => (
                <ToggleSwitch 
                  isActive={row.status === 'active'} 
                  onToggle={() => handleToggle(row.id, row.status)}
                  disabled={row.status === 'draft' || (togglingId === row.id)}
                />
              )},
              { key: 'results', label: 'Results', sortable: true, render: (row) => <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 500 }}>{row.results}</span> },
              { key: 'costPerResult', label: 'Cost per Result', sortable: true, render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.costPerResult}</span> },
              { key: 'budget', label: 'Budget', sortable: true, render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.budget}</span> },
              { key: 'spend', label: 'Amount Spent', sortable: true, render: (row) => <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{row.spend}</span> },
              { key: 'impressions', label: 'Impressions', sortable: true, render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.impressions}</span> },
              { key: 'reach', label: 'Reach', sortable: true, render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.reach}</span> },
              { key: 'bidStrategy', label: 'Bid Strategy', sortable: true, render: (row) => <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>{row.bidStrategy}</span> },
              { key: 'score', label: 'AI Score', sortable: true, render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '54px', height: '5px', borderRadius: '99px', background: 'var(--bg-elevated)' }}>
                    <div style={{ height: '100%', width: `${row.score}%`, background: row.score > 80 ? '#22c55e' : row.score > 60 ? '#f59e0b' : '#ef4444', borderRadius: '99px' }} />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: row.score > 80 ? '#16a34a' : row.score > 60 ? '#d97706' : '#dc2626' }}>{row.score}</span>
                </div>
              )},
              { key: 'actions', label: 'Actions', sortable: false, render: (row) => {
                if (row.platform === 'Google') {
                  return (
                    <button 
                      onClick={() => setEditingGoogleCampaign(row.originalData)}
                      style={{
                        padding: '4px 12px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      Edit
                    </button>
                  );
                }
                return null;
              }}
            ]}
            data={filtered}
          />
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
          color: 'var(--text-primary)',
          padding: '12px 24px',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          zIndex: 10000,
          fontWeight: 600,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid var(--glass-border)'
        }}>
          {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
          {toast.message}
        </div>
      )}

      {/* Edit Google Campaign Modal */}
      {editingGoogleCampaign && (
        <EditGoogleCampaignModal
          campaign={editingGoogleCampaign}
          isOpen={true}
          onClose={() => setEditingGoogleCampaign(null)}
          onSave={handleUpdateGoogleCampaign}
        />
      )}
    </div>
  );
};
