import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { SmartTable } from '../components/SmartTable';
import { Users, RefreshCw, Database } from 'lucide-react';

const dateRanges = ['Last 7 days', 'Last 14 days', 'Last 30 days', 'Last 90 days', 'Today'];

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
          <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

// ── Dark token palette (matches landing page) ──────────────────
const D = {
  bg:         '#0a0f1e',          // deepest background
  surface:    '#0f1629',          // card surfaces
  surfaceAlt: '#141d35',          // slightly lighter card
  border:     'rgba(99,102,241,0.18)',
  borderGlow: 'rgba(112,51,245,0.35)',
  purple:     '#0665ff',
  purpleSoft: 'rgba(124,58,237,0.15)',
  purpleText: '#a78bfa',
  green:      '#10b981',
  greenSoft:  'rgba(16,185,129,0.15)',
  greenText:  '#34d399',
  textPrimary:'#f1f5f9',
  textMuted:  '#94a3b8',
  textDim:    '#64748b',
  white005:   'rgba(255,255,255,0.05)',
  white010:   'rgba(255,255,255,0.08)',
  inputBg:    'rgba(255,255,255,0.04)',
};

export const Crm: React.FC = () => {
  const [activeRange, setActiveRange]   = useState('Last 7 days');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [audiences, setAudiences]       = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  // const [rechargeAmount, setRechargeAmount] = useState(500);
  // const [walletBalance, setWalletBalance] = useState(0);
  const { user } = useSelector((state: any) => state.auth);
  const [kpis, setKpis] = useState([
    { label: 'Spend',          value: '$0.00', color: D.purple,  checked: true,  key: 'spend' },
    { label: 'CPM',            value: '$0.00', color: D.textDim,  checked: false, key: 'cpm' },
    { label: 'CPC',            value: '$0.00', color: D.textDim,  checked: false, key: 'cpc' },
    { label: 'CTR',            value: '0.00%', color: D.textDim,  checked: false, key: 'ctr' },
    { label: 'ROAS',           value: '0.00',  color: D.green,   checked: true,  key: 'roas' },
    { label: 'Purchase Value', value: '$0.00', color: D.textDim,  checked: false, key: 'purchaseValue' },
  ]);

  const fetchData = useCallback(async () => {
    try {
      const { api } = await import('../../api/axios');
      const [resAnal, resAud] = await Promise.all([
        api.get(`/analytics/dashboard?dateRange=${encodeURIComponent(activeRange)}`),
        api.get('/crm/audiences'),
      ]);
      setAnalyticsData(resAnal.data);
      setAudiences(resAud.data);
      const summary = resAnal.data.summary;
      setKpis(prev => prev.map(k => {
        const rawValue = summary?.[k.key];
        if (rawValue === undefined || rawValue === null)
          return { ...k, value: k.key === 'ctr' ? '0%' : k.key === 'roas' ? '0.00' : '$0.00' };
        const formattedValue = (k.key === 'ctr' || k.key === 'roas')
          ? (typeof rawValue === 'string' ? rawValue : Number(rawValue).toFixed(2)) + (k.key === 'ctr' ? '%' : '')
          : `$${parseFloat(String(rawValue)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        return { ...k, value: formattedValue };
      }));
      setLoading(false);
    } catch (error) {
      console.error('CRM Fetch Failed', error);
      setLoading(false);
    }
  }, [activeRange]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const googleConnected = url.searchParams.get('googleConnected');
      const metaConnected = url.searchParams.get('metaConnected');
      const xConnected = url.searchParams.get('xConnected');
      const linkedinConnected = url.searchParams.get('linkedinConnected');

      if (googleConnected === 'success') toast.success('Google Ads connected successfully');
      if (googleConnected === 'error') toast.error('Failed to connect Google Ads');
      if (metaConnected === 'success') toast.success('Meta Ads connected successfully');
      if (metaConnected === 'error') toast.error('Failed to connect Meta Ads');
      if (xConnected === 'success') toast.success('X Ads connected successfully');
      if (xConnected === 'error') toast.error('Failed to connect X Ads');
      if (linkedinConnected === 'success') toast.success('LinkedIn account connected successfully');
      if (linkedinConnected === 'error') toast.error('Failed to connect LinkedIn');

      let changed = false;
      if (googleConnected) { url.searchParams.delete('googleConnected'); changed = true; }
      if (metaConnected) { url.searchParams.delete('metaConnected'); changed = true; }
      if (xConnected) { url.searchParams.delete('xConnected'); changed = true; }
      if (linkedinConnected) { url.searchParams.delete('linkedinConnected'); changed = true; }

      if (changed) {
        window.history.replaceState({}, '', url.toString());
      }
    } catch {}

    // import('../../api/axios').then(({ api }) => {
    //   api.get('/billing/wallet').then(res => {
    //     setWalletBalance(res.data?.balance ?? 0);
    //   }).catch(() => {});
    // });
  }, []);


  // const handleRazorpayRecharge = async () => {
  //   try {
  //     const { api } = await import('../../api/axios');
  //     const orderRes = await api.post('/billing/razorpay/create-order', {
  //       amount: rechargeAmount,
  //       tenantId: 'default_tenant',
  //     });
  //     const order = orderRes.data.order;
  // 
  //     const options = {
  //       key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  //       amount: order.amount,
  //       currency: 'INR',
  //       name: 'Wheedle.ai',
  //       description: 'Wallet Recharge',
  //       order_id: order.id,
  //       handler: async (response: any) => {
  //         try {
  //           await api.post('/billing/razorpay/verify', {
  //             tenantId: 'default_tenant',
  //             amount: rechargeAmount,
  //             razorpay_order_id: response.razorpay_order_id,
  //             razorpay_payment_id: response.razorpay_payment_id,
  //             razorpay_signature: response.razorpay_signature,
  //           });
  //           toast.success(`$${rechargeAmount} added to wallet!`);
  //           setWalletBalance(prev => prev + rechargeAmount);
  //         } catch {
  //           toast.error('Payment verification failed');
  //         }
  //       },
  //       prefill: { name: 'Wheedle User', email: 'user@wheedle.ai' },
  //      theme: { color: '#0665ff' },
  //     };
  // 
  //     if (!(window as unknown as { Razorpay?: unknown }).Razorpay) {
  //       await new Promise<void>((resolve, reject) => {
  //         const script = document.createElement('script');
  //         script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  //         script.onload = () => resolve();
  //         script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
  //         document.body.appendChild(script);
  //       });
  //     }
  // 
  //     const Rzp = (window as unknown as { Razorpay: new (opts: typeof options) => { open: () => void } }).Razorpay;
  //     const rzp = new Rzp(options);
  //     rzp.open();
  //   } catch (err: unknown) {
  //     const ax = err as { response?: { data?: { message?: string } } };
  //     toast.error(ax?.response?.data?.message || 'Failed to initiate payment');
  //   }
  // };

  const toggleKpi = (i: number) => {
    const newKpis = [...kpis];
    newKpis[i].checked = !newKpis[i].checked;
    setKpis(newKpis);
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: D.bg }}>
      <div style={{ textAlign: 'center' }}>
        <RefreshCw className="animate-spin" size={32} color={D.purpleText} />
        <p style={{ marginTop: 16, color: D.textMuted, fontWeight: 600 }}>Syncing AI Nodes...</p>
      </div>
    </div>
  );

  const activeDates = analyticsData?.daily?.map((d: any) => d.date) || [];
  const activeSpend = analyticsData?.daily?.map((d: any) => d.spend) || [];
  const activeRoas  = analyticsData?.daily?.map((d: any) => d.roas)  || [];

  return (
    <div style={{ minHeight: '100%', background: D.bg, color: D.textPrimary }}>

      {/* ── Top Header ── */}
      <div style={{
        background: D.surface,
        borderBottom: `1px solid ${D.border}`,
        padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: D.textPrimary, fontFamily: 'Outfit' }}>
            Intelligence <span className="text-gradient">Matrix</span>
          </span>
          <div style={{ padding: '4px 12px', background: D.purpleSoft, border: `1px solid ${D.borderGlow}`, borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, color: D.purpleText }}>
            ● Live Node
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={async () => {
              const t = toast.loading('Syncing Meta Ads data...');
              try {
                const { api } = await import('../../api/axios');
                await api.post('/analytics/sync/meta');
                toast.dismiss(t);
                toast.success('Meta data synced!');
                void fetchData();
              } catch (e: unknown) {
                toast.dismiss(t);
                const ax = e as { response?: { data?: { message?: string } } };
                toast.error(ax?.response?.data?.message || 'Sync failed — check Meta token');
              }
            }}
            disabled={!user?.metaAccessToken}
            style={{
              fontSize: '0.8rem', fontWeight: 600, color: user?.metaAccessToken ? D.purpleText : D.textDim,
              display: 'flex', alignItems: 'center', gap: 6,
              background: user?.metaAccessToken ? D.purpleSoft : D.white005,
              border: `1px solid ${D.borderGlow}`,
              borderRadius: 8, padding: '6px 14px', cursor: user?.metaAccessToken ? 'pointer' : 'not-allowed',
            }}
          >
            <Database size={14} /> Sync Meta Ads
          </button>
          <button
            type="button"
            onClick={async () => {
              const t = toast.loading('Syncing Google Ads data...');
              try {
                const { api } = await import('../../api/axios');
                await api.post('/analytics/sync/google');
                toast.dismiss(t);
                toast.success('Google Ads data synced!');
                void fetchData();
              } catch (e: unknown) {
                toast.dismiss(t);
                const ax = e as { response?: { data?: { message?: string } } };
                toast.error(ax?.response?.data?.message || 'Sync failed — check Google connection');
              }
            }}
            disabled={!user?.googleRefreshToken}
            style={{
              fontSize: '0.8rem', fontWeight: 600, color: user?.googleRefreshToken ? D.purpleText : D.textDim,
              display: 'flex', alignItems: 'center', gap: 6,
              background: user?.googleRefreshToken ? D.purpleSoft : D.white005,
              border: `1px solid ${D.borderGlow}`,
              borderRadius: 8, padding: '6px 14px', cursor: user?.googleRefreshToken ? 'pointer' : 'not-allowed',
            }}
          >
            <Database size={14} /> Sync Google Ads
          </button>
          <button
            type="button"
            onClick={async () => {
              const t = toast.loading('Syncing X Ads data...');
              try {
                const { api } = await import('../../api/axios');
                await api.post('/analytics/sync/x');
                toast.dismiss(t);
                toast.success('X Ads data synced!');
                void fetchData();
              } catch (e: unknown) {
                toast.dismiss(t);
                const ax = e as { response?: { data?: { message?: string } } };
                toast.error(ax?.response?.data?.message || 'Sync failed — check X connection');
              }
            }}
            disabled={!user?.twitterAccessToken}
            style={{
              fontSize: '0.8rem', fontWeight: 600, color: user?.twitterAccessToken ? D.purpleText : D.textDim,
              display: 'flex', alignItems: 'center', gap: 6,
              background: user?.twitterAccessToken ? D.purpleSoft : D.white005,
              border: `1px solid ${D.borderGlow}`,
              borderRadius: 8, padding: '6px 14px', cursor: user?.twitterAccessToken ? 'pointer' : 'not-allowed',
            }}
          >
            <Database size={14} /> Sync X Ads
          </button>
          <button
            type="button"
            onClick={async () => {
              const t = toast.loading('Syncing LinkedIn Ads data...');
              try {
                const { api } = await import('../../api/axios');
                await api.post('/analytics/sync/linkedin');
                toast.dismiss(t);
                toast.success('LinkedIn Ads data synced!');
                void fetchData();
              } catch (e: unknown) {
                toast.dismiss(t);
                const ax = e as { response?: { data?: { message?: string } } };
                toast.error(ax?.response?.data?.message || 'Sync failed — check LinkedIn connection');
              }
            }}
            disabled={!user?.linkedinAccessToken}
            style={{
              fontSize: '0.8rem', fontWeight: 600, color: user?.linkedinAccessToken ? D.purpleText : D.textDim,
              display: 'flex', alignItems: 'center', gap: 6,
              background: user?.linkedinAccessToken ? D.purpleSoft : D.white005,
              border: `1px solid ${D.borderGlow}`,
              borderRadius: 8, padding: '6px 14px', cursor: user?.linkedinAccessToken ? 'pointer' : 'not-allowed',
            }}
          >
            <Database size={14} /> Sync LinkedIn Ads
          </button>
          <button
            type="button"
            onClick={() => void fetchData()}
            style={{ fontSize: '0.8rem', fontWeight: 600, color: D.textMuted, display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = D.purpleText; }}
            onMouseLeave={e => { e.currentTarget.style.color = D.textMuted; }}
          >
            <RefreshCw size={14} /> Refresh Terminal
          </button>
          <div style={{ fontSize: '0.8rem', color: D.textDim }}>Sync: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          {[ 
            { label: 'Meta', connected: !!user?.metaAccessToken, disconnectable: true },
            { label: 'Google', connected: !!(user?.googleRefreshToken || user?.googleAccessToken), disconnectable: true },
            { label: 'X', connected: !!user?.twitterAccessToken, disconnectable: true },
            { label: 'LinkedIn', connected: !!user?.linkedinAccessToken, disconnectable: true },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 999,
                border: `1px solid ${D.border}`,
                background: item.connected ? D.surfaceAlt : D.white005,
                color: item.connected ? D.textPrimary : D.textDim,
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.connected ? D.greenText : D.textDim }} />
              {item.label} {item.connected ? 'Connected' : 'Not connected'}

              {item.disconnectable && item.connected && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const { api } = await import('../../api/axios');
                      let endpoint = '/analytics/disconnect/meta';
                      if (item.label === 'Google') endpoint = '/analytics/disconnect/google';
                      else if (item.label === 'X') endpoint = '/analytics/disconnect/x';
                      else if (item.label === 'LinkedIn') endpoint = '/analytics/disconnect/linkedin';
                      
                      await api.post(endpoint);
                      toast.success(`${item.label} disconnected.`);
                      void fetchData();
                    } catch (e: unknown) {
                      const ax = e as { response?: { data?: { message?: string } } };
                      toast.error(ax?.response?.data?.message || `Failed to disconnect ${item.label}`);
                    }
                  }}
                  style={{
                    marginLeft: 6,
                    padding: '4px 10px',
                    borderRadius: 999,
                    border: `1px solid rgba(239,68,68,0.3)`,
                    background: 'rgba(239,68,68,0.10)',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                  title="Disconnect"
                >
                  Disconnect
                </button>
              )}
            </div>
          ))}

        </div>
        {audiences.length === 0 && (
          <div style={{ marginBottom: 18, padding: 16, borderRadius: 16, background: D.surfaceAlt, border: `1px solid ${D.border}`, color: D.textMuted }}>
            No audience segments are available yet. Sync your connected ad accounts to populate CRM audiences and performance segments.
          </div>
        )}

        {/* ── Date Range Filters ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {dateRanges.map(r => (
            <button key={r} onClick={() => setActiveRange(r)} style={{
              padding: '8px 20px', borderRadius: 99, cursor: 'pointer', transition: '0.2s',
              border: activeRange === r ? `1px solid ${D.purple}` : `1px solid ${D.border}`,
              background: activeRange === r ? D.purple : D.white005,
              color: activeRange === r ? '#fff' : D.textMuted,
              fontSize: '0.85rem', fontWeight: 700,
            }}>
              {r}
            </button>
          ))}
          <div style={{ padding: '8px 20px', borderRadius: 99, border: `1px solid ${D.border}`, background: D.white005, fontSize: '0.8rem', color: D.textDim, display: 'flex', alignItems: 'center', gap: 8 }}>
            📅 {activeDates[0] ?? '—'} → {activeDates[activeDates.length - 1] ?? '—'}
          </div>
        </div>

         

        {/* ── KPI Grid ── */}
        <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 20, padding: 24, marginBottom: 24, boxShadow: '0 4px 30px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {kpis.map((kpi, i) => (
              <div
                key={kpi.label}
                onClick={() => toggleKpi(i)}
                style={{
                  padding: 20, borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
                  border: `2px solid ${kpi.checked ? kpi.color + '50' : D.border}`,
                  background: kpi.checked ? kpi.color + '10' : D.white005,
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                }}
                onMouseEnter={e => e.currentTarget.style.background = kpi.checked ? kpi.color + '18' : D.white010}
                onMouseLeave={e => e.currentTarget.style.background = kpi.checked ? kpi.color + '10' : D.white005}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 14, height: 4, borderRadius: 2, background: kpi.checked ? kpi.color : D.textDim }} />
                    <span style={{ fontSize: '0.82rem', color: D.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</span>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: kpi.checked ? D.textPrimary : D.textDim, fontFamily: 'Outfit' }}>
                    {kpi.value}
                  </div>
                </div>
                <input type="checkbox" checked={kpi.checked} readOnly style={{ accentColor: D.purple, width: 16, height: 16, cursor: 'pointer', marginTop: 4 }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Performance Chart ── */}
        <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 20, padding: 32, marginBottom: 24, boxShadow: '0 4px 30px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: D.textPrimary }}>Node Performance History</h3>
            <div style={{ display: 'flex', gap: 24 }}>
              {[['#0665ff', 'Spend'], ['#10b981', 'ROAS']].map(([color, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: D.textMuted }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', height: 220, width: '100%' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <ChartLine data={activeSpend} color="#0665ff" height={220} width={1200} />
            </div>
            <div style={{ position: 'absolute', inset: 0 }}>
              <ChartLine data={activeRoas.map((v: number) => v * 10)} color="#10b981" height={220} width={1200} />
            </div>
            {/* Subtle grid lines */}
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${(i / 3) * 85 + 5}%`, borderTop: `1px solid ${D.border}`, pointerEvents: 'none' }} />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, borderTop: `1px solid ${D.border}`, paddingTop: 12 }}>
            {activeDates.map((d: string) => (
              <span key={d} style={{ fontSize: '0.72rem', color: D.textDim, fontWeight: 600 }}>
                {d.split('-').slice(1).join('/')}
              </span>
            ))}
          </div>
        </div>

        {/* ── Audience Segments ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Users size={16} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: D.textPrimary }}>Intelligence Audience Segments</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {audiences.slice(0, 3).map((aud, i) => (
              <div key={i} style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 16, padding: 20, transition: 'all 0.2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${D.borderGlow}`; e.currentTarget.style.background = D.surfaceAlt; }}
                onMouseLeave={e => { e.currentTarget.style.border = `1px solid ${D.border}`; e.currentTarget.style.background = D.surface; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: D.textPrimary }}>{aud.name}</span>
                  <span style={{ background: D.greenSoft, color: D.greenText, padding: '2px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {((aud.estimatedSize || 0) / 1000).toFixed(1)}k Reach
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: D.textDim, lineHeight: 1.6 }}>{aud.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Analytics Table ── */}
        <div style={{ marginTop: 32 }}>
          <SmartTable
            title="Daily Performance Analytics"
            columns={[
              { key: 'date',  label: 'Node Date',   sortable: true, render: (row) => <span style={{ fontWeight: 700, color: D.textPrimary }}>{row.date}</span> },
              { key: 'spend', label: 'Daily Spend',  sortable: true, render: (row) => <span style={{ fontWeight: 800, color: D.purpleText }}>${row.spend?.toFixed(2) ?? '0.00'}</span> },
              { key: 'cpm',   label: 'CPM',          sortable: true, render: (r)   => <span style={{ color: D.textMuted }}>${r.cpm?.toFixed(2) ?? '0.00'}</span> },
              { key: 'cpc',   label: 'CPC',          sortable: true, render: (r)   => <span style={{ color: D.textMuted }}>${r.cpc?.toFixed(2) ?? '0.00'}</span> },
              { key: 'ctr',   label: 'CTR Matrix',   sortable: true, render: (r)   => <span style={{ fontWeight: 600, color: D.textPrimary }}>{r.ctr?.toFixed(2) ?? '0.00'}%</span> },
              { key: 'roas',  label: 'ROAS Factor',  sortable: true, render: (r)   => <span style={{ fontWeight: 800, color: D.greenText }}>{r.roas?.toFixed(2) ?? '0.00'}x</span> },
            ]}
            data={analyticsData?.daily?.slice().reverse() ?? []}
            dark={true}
          />
        </div>

      </div>
    </div>
  );
};
