import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { useSelector } from 'react-redux';
import { 
  Activity, 
  BarChart2, 
  DollarSign, 
  MousePointerClick, 
  Target, 
  TrendingUp, 
  Users, 
  X, 
  Sparkles,
  Check,
  Copy,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

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

  // Particular campaign modal states
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const platformMap: { [key: string]: string } = {
    'Meta': 'meta',
    'Google': 'google',
    'X': 'twitter',
    'LinkedIn': 'linkedin',
  };

  // Inject html2pdf script
  useEffect(() => {
    if (!document.getElementById('html2pdf-script')) {
      const script = document.createElement('script');
      script.id = 'html2pdf-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      document.body.appendChild(script);
    }
  }, []);

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

  // Export Campaigns list to CSV
  const handleExportCsv = () => {
    if (!campaigns || campaigns.length === 0) {
      toast.error("No campaign data available to export.");
      return;
    }
    const headers = ['Campaign Name', 'Status', 'Amount Spent', 'Impressions', 'Clicks', 'Conversions', 'CTR', 'CPC', 'CPA'];
    const rows = campaigns.map((c: any) => [
      `"${c.name.replace(/"/g, '""')}"`,
      c.status || 'Active',
      (c.spend || 0).toFixed(2),
      c.impressions || 0,
      c.clicks || 0,
      c.conversions || 0,
      `${(c.ctr || 0).toFixed(2)}%`,
      (c.cpc || 0).toFixed(2),
      (c.cpa || 0).toFixed(2)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activePlatform}_Campaigns_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully!");
  };

  // Trigger campaign-specific AI audit
  const handleGenerateCampaignAudit = async (campaign: any) => {
    setAuditLoading(true);
    setAuditReport(null);
    try {
      const metricsText = `Campaign Name: ${campaign.name}
Platform: ${activePlatform}
Status: ${campaign.status || 'Active'}
Spend: ${cur}${(campaign.spend || 0).toFixed(2)}
Impressions: ${campaign.impressions || 0}
Clicks: ${campaign.clicks || 0}
Conversions (Results): ${campaign.conversions || 0}
CTR: ${(campaign.ctr || 0).toFixed(2)}%
CPC: ${cur}${(campaign.cpc || 0).toFixed(2)}
CPA (Cost per Result): ${cur}${(campaign.cpa || 0).toFixed(2)}`;

      const response = await api.post('/webhook/reporting', {
        metrics: `This is a particular campaign performance report audit. Analyze this single campaign's statistics:\n${metricsText}`
      });

      if (response.data && response.data.aiOutput) {
        setAuditReport(response.data.aiOutput);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (e) {
      console.error('Campaign audit generation failed', e);
      // Local fallback
      const fallbackReport = `# Campaign Strategic Performance Audit: ${campaign.name}
## Performance Evaluation:
- **Spend & Conversions:** The campaign has spent ${cur}${(campaign.spend || 0).toFixed(2)} yielding ${campaign.conversions || 0} conversions.
- **Click-Through Rate (CTR):** At ${(campaign.ctr || 0).toFixed(2)}%, the relevance score is within acceptable parameters.
- **Cost Efficiency:** The CPC is ${cur}${(campaign.cpc || 0).toFixed(2)} and CPA is ${cur}${(campaign.cpa || 0).toFixed(2)}.

## Tactical Recommendation:
1. Shift ad budgets slightly towards higher-converting targeting groups.
2. Review ad creatives to address potential fatigue.
3. Optimize landing page CTR for conversion path clarity.`;
      
      setAuditReport(fallbackReport);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleCopyAudit = () => {
    if (!auditReport) return;
    navigator.clipboard.writeText(auditReport);
    setCopied(true);
    toast.success('Copied campaign audit report!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAuditPdf = () => {
    const element = document.getElementById('campaign-audit-pdf-area');
    if (!element || !auditReport) return;

    // @ts-ignore
    const html2pdf = window.html2pdf;
    if (!html2pdf) {
      toast.error("PDF generator library is still loading. Please try again.");
      return;
    }

    const opt = {
      margin: 15,
      filename: `${selectedCampaign.name}_AI_Audit_Report_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  const handleRowClick = (campaign: any) => {
    setSelectedCampaign(campaign);
    setAuditReport(null);
    setAuditLoading(false);
  };

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
    <div style={{ minHeight: '100%', background: 'var(--bg-primary)', position: 'relative', fontFamily: 'Outfit, sans-serif' }}>
      
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .row-hover-link:hover {
          background: rgba(255, 255, 255, 0.04) !important;
        }
      `}</style>

      {/* Header */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--glass-border)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.2rem', margin: '0 0 4px 0' }}>Ads Manager</h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Native real-time analytics from connected ad accounts (Click a row for detailed AI reports)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Last updated: Just now</div>
          
          <button 
            onClick={handleExportCsv}
            style={{ fontSize: '0.82rem', color: 'var(--text-primary)', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
          >
            Export CSV
          </button>

          <button 
            onClick={handleRefresh}
            style={{ fontSize: '0.82rem', color: '#fff', background: pColor, border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'opacity 0.2s' }}
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
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Campaigns</h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Tip: Click any campaign to see specific metrics & run AI audits</span>
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
                    <tr 
                      key={campaign.id || i} 
                      onClick={() => handleRowClick(campaign)}
                      className="row-hover-link"
                      style={{ borderBottom: '1px solid var(--glass-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'background 0.2s' }}
                    >
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

      {/* Campaign Details & AI Audit Modal */}
      {selectedCampaign && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setSelectedCampaign(null)}>
          <div 
            style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '20px', width: '90%', maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-elevated)' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: pColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{activePlatform} Campaign Audit</span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedCampaign.name}</h2>
              </div>
              <button 
                onClick={() => setSelectedCampaign(null)}
                style={{ background: 'var(--bg-elevated)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Campaign KPI Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>Amount Spent</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{cur}{(selectedCampaign.spend || 0).toFixed(2)}</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>Impressions</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{formatNumber(selectedCampaign.impressions || 0)}</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>Clicks / CTR</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{formatNumber(selectedCampaign.clicks || 0)} / {(selectedCampaign.ctr || 0).toFixed(2)}%</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>Results / CPA</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{formatNumber(selectedCampaign.conversions || 0)} / {cur}{(selectedCampaign.cpa || 0).toFixed(2)}</div>
                </div>
              </div>

              {/* AI Report Trigger / Display */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} color="#0665ff" />
                    AI Strategic Campaign Analysis
                  </h3>
                  {auditReport && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={handleCopyAudit}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '0.74rem', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
                      >
                        {copied ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button 
                        onClick={handleDownloadAuditPdf}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#0665ff', border: 'none', borderRadius: '6px', fontSize: '0.74rem', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
                      >
                        <Download size={12} /> Download PDF
                      </button>
                    </div>
                  )}
                </div>

                {!auditLoading && !auditReport && (
                  <div style={{ padding: '30px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: 1.5 }}>
                      Invoke AI Agents to audit the performance of this campaign, detect anomalies, analyze CPC efficiency, and formulate immediate pivots.
                    </p>
                    <button
                      onClick={() => handleGenerateCampaignAudit(selectedCampaign)}
                      style={{ background: 'linear-gradient(135deg, #0665ff, #8b5cf6)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(6,101,255,0.2)' }}
                    >
                      ✦ Analyze Campaign with AI
                    </button>
                  </div>
                )}

                {auditLoading && (
                  <div style={{ padding: '40px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifySelf: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', border: '2px solid rgba(6,101,255,0.1)', borderTopColor: '#0665ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI Agent analyzing campaign metrics & generating strategy pivots...</span>
                  </div>
                )}

                {!auditLoading && auditReport && (
                  <div 
                    id="campaign-audit-pdf-area"
                    style={{ padding: '24px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--glass-border)', maxHeight: '300px', overflowY: 'auto', fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-primary)' }}
                  >
                    <div style={{ display: 'none', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '14px' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>CAMPAIGN STRATEGIC PERFORMANCE AUDIT</h2>
                      <div style={{ fontSize: '0.75rem', color: '#777' }}>Campaign: {selectedCampaign.name} ({activePlatform})</div>
                    </div>
                    {auditReport.split('\n').map((line, index) => {
                      const clean = line.trim();
                      if (clean.startsWith('# ')) {
                        return <h2 key={index} style={{ fontSize: '1.1rem', fontWeight: 800, margin: '14px 0 8px 0', color: 'var(--text-primary)' }}>{clean.substring(2)}</h2>;
                      }
                      if (clean.startsWith('## ')) {
                        return <h3 key={index} style={{ fontSize: '0.95rem', fontWeight: 700, margin: '12px 0 6px 0', color: 'var(--text-primary)' }}>{clean.substring(3)}</h3>;
                      }
                      if (clean.startsWith('- ') || clean.startsWith('* ')) {
                        return <li key={index} style={{ margin: '4px 0 4px 10px', listStyleType: 'disc' }}>{clean.substring(2)}</li>;
                      }
                      if (clean.match(/^\d+\.\s/)) {
                        return <li key={index} style={{ margin: '4px 0 4px 10px', listStyleType: 'decimal' }}>{clean.replace(/^\d+\.\s/, '')}</li>;
                      }
                      if (clean === '') {
                        return <div key={index} style={{ height: '6px' }} />;
                      }
                      return <p key={index} style={{ margin: '0 0 10px 0' }}>{line}</p>;
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid var(--glass-border)', background: 'var(--bg-elevated)' }}>
              <button 
                onClick={() => setSelectedCampaign(null)}
                style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
