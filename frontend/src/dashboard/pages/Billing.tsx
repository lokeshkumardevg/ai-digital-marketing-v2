import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { api } from '../../api/axios';
import { SmartTable } from '../components/SmartTable';
import { 
  CreditCard, CheckCircle2, Crown, Activity
} from 'lucide-react';

export const Billing: React.FC = () => {
  const [sub, setSub] = useState<any>(null);
  const [plans, setPlans] = useState<any>({});
  const [wallet, setWallet] = useState<any>({ balance: 0, history: [] });
  const [loadingCheckout, setLoadingCheckout] = useState('');
  const [rechargeAmount, setRechargeAmount] = useState(1000);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const [subRes, plansRes, walletRes] = await Promise.all([
        api.get('/billing/subscription'),
        api.get('/billing/plans'),
        api.get('/billing/wallet').catch(() => ({ data: { balance: 0, history: [] } })) // Fallback
      ]);
      setSub(subRes.data);
      setPlans(plansRes.data);
      setWallet(walletRes.data);
    } catch (err) {
      // Setup Mock if backend is unreachable
      setPlans({
        free: { name: 'Hobbyist', price: 0, limit: 10000 },
        pro: { name: 'Growth Pro', price: 99, limit: 250000 },
        enterprise: { name: 'Enterprise Matrix', price: 499, limit: 2000000 }
      });
      setSub({
        plan: 'free', status: 'active', aiTokensUsedCurrentBillingCycle: 7650, aiTokenLimit: 10000, 
        currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1))
      });
    }
  };

  const handleUpgrade = async (planId: string) => {
    setLoadingCheckout(planId);
    try {
      const { data } = await api.post('/billing/checkout', { planId });
      // In production window.location.href = data.checkoutUrl;
      console.log('Redirecting to Stripe:', data.checkoutUrl);
      
      // MOCK: Webhook successful return simulation
      setTimeout(async () => {
        const upgradeRes = await api.post('/billing/webhook/mock-success', { planId });
        setSub(upgradeRes.data);
        setLoadingCheckout('');
      }, 2000);
      
    } catch (err) {
      console.error(err);
      setLoadingCheckout('');
    }
  };

  const handleWalletRecharge = async () => {
    try {
      await api.post('/billing/wallet/recharge', { amount: rechargeAmount });
      const walletRes = await api.get('/billing/wallet');
      setWallet(walletRes.data);
      alert(`Successfully recharged ₹${rechargeAmount} to your wallet!`);
    } catch (err) {
      console.error('Wallet Recharge Failed:', err);
    }
  };

  if (!sub || !plans.pro) return <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Loading SaaS Limits...</div>;

  const usagePercent = Math.min((sub.aiTokensUsedCurrentBillingCycle / sub.aiTokenLimit) * 100, 100);
  const isDanger = usagePercent > 90;

  const txnColumns = [
    { key: 'createdAt', label: 'Date', sortable: true, render: (row: any) => new Date(row.createdAt).toLocaleDateString() + ' ' + new Date(row.createdAt).toLocaleTimeString() },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'type', label: 'Type', sortable: true, render: (row: any) => (
       <div style={{ fontWeight: 700, background: row.type === 'CREDIT' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: row.type === 'CREDIT' ? 'var(--success)' : 'var(--error)', padding: '4px 10px', borderRadius: '50px', display: 'inline-block', fontSize: '0.75rem' }}>
          {row.type}
       </div>
    )},
    { key: 'amount', label: 'Amount', sortable: true, render: (row: any) => (
       <div style={{ fontWeight: 800 }}>{row.type === 'CREDIT' ? '+' : '-'}₹{row.amount.toLocaleString()}</div>
    )}
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '0px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-primary)' }}>Billing &</span> <span className="text-gradient">Wallet Systems</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your AI limits, recharge your balance, and control billing.</p>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Workspace Plan */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
             <Crown size={20} color="var(--warning)" />
             <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Active Plan</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
             <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{plans[sub.plan]?.name || 'Hobbyist'}</div>
             <div style={{ background: 'var(--success)', color: '#000', padding: '4px 10px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 700 }}>{sub.status.toUpperCase()}</div>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '12px' }}>
             Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}
          </div>
        </GlassCard>

        {/* AI Tokens Metric */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
             <Activity size={20} color="var(--info)" />
             <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Monthly API Tokens</div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
             {sub.aiTokensUsedCurrentBillingCycle.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/ {sub.aiTokenLimit.toLocaleString()}</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginTop: '12px' }}>
            <div style={{ height: '100%', width: `${usagePercent}%`, background: isDanger ? 'var(--fail)' : 'var(--info)' }}></div>
          </div>
        </GlassCard>

        {/* Prepared Wallet */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
             <CreditCard size={20} color="var(--success)" />
             <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Prepaid Wallet Balance</div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)' }}>
             ₹{wallet.balance.toLocaleString()}
          </div>
        </GlassCard>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '24px', marginBottom: '32px' }}>
        
        {/* Left Side: Wallet Top-Up */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <GlassCard>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Quick Recharge</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {[1000, 5000, 10000].map(amt => (
                <button 
                  key={amt} onClick={() => setRechargeAmount(amt)}
                  className="btn"
                  style={{ 
                    padding: '12px', 
                    background: rechargeAmount === amt ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
                    border: '1px solid var(--glass-border)', 
                    color: rechargeAmount === amt ? 'white' : 'var(--text-primary)', 
                    fontWeight: 600,
                  }}>
                  ₹{amt}
                </button>
              ))}
            </div>
            <button onClick={handleWalletRecharge} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
              Recharge ₹{rechargeAmount}
            </button>
            <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Secure Payment Processed via Razorpay/Stripe
            </div>
          </GlassCard>

        </div>

        {/* Right Side: Saas Plans */}
        <GlassCard>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--text-primary)' }}>SaaS Plans & Limits</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Pro Plan */}
            <div style={{ border: sub.plan === 'pro' ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)', background: 'var(--bg-card)', borderRadius: '12px', padding: '24px', color: 'var(--text-primary)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                 <div>
                   <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0 }}>Growth Pro</h3>
                   <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>$99<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/mo</span></div>
                 </div>
                 {sub.plan === 'pro' && <span style={{ background: 'var(--accent-primary)', color: '#ffffff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Active</span>}
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}><CheckCircle2 size={16} color="var(--success)"/> 250,000 Tokens</div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}><CheckCircle2 size={16} color="var(--success)"/> Meta & Google Ads Integration</div>
               </div>

               <button 
                  onClick={() => handleUpgrade('pro')} disabled={sub.plan === 'pro' || loadingCheckout !== ''}
                  className={sub.plan === 'pro' ? "btn btn-secondary" : "btn btn-primary"}
                  style={{ width: '100%', color: sub.plan === 'pro' ? '#141414' : '#ffffff', opacity: sub.plan === 'pro' ? 0.7 : 1 }}>
                  {loadingCheckout === 'pro' ? 'Redirecting...' : sub.plan === 'pro' ? 'Current Plan (Active)' : 'Upgrade to Pro'}
               </button>
            </div>

            {/* Enterprise */}
            <div style={{ border: sub.plan === 'enterprise' ? '2px solid var(--warning)' : '1px solid #e2e8f0', background: 'var(--bg-card)', borderRadius: '12px', padding: '24px', color: 'var(--text-primary)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                 <div>
                   <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0 }}>Enterprise</h3>
                   <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>$499<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/mo</span></div>
                 </div>
                 {sub.plan === 'enterprise' && <span style={{ background: 'var(--warning)', color: '#000000', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Active</span>}
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}><CheckCircle2 size={16} color="var(--warning)"/> 2,000,000 Tokens</div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}><CheckCircle2 size={16} color="var(--warning)"/> Dedicated Account Manager</div>
               </div>

               <button 
                  onClick={() => handleUpgrade('enterprise')} disabled={sub.plan === 'enterprise' || loadingCheckout !== ''}
                  className="btn btn-secondary"
                  style={{ width: '100%', color: 'var(--text-primary)', fontWeight: 700, border: '2px solid var(--warning)', opacity: sub.plan === 'enterprise' ? 0.7 : 1 }}>
                  {loadingCheckout === 'enterprise' ? 'Processing...' : sub.plan === 'enterprise' ? 'Current Plan (Active)' : 'Contact Sales'}
               </button>
            </div>
          </div>
        </GlassCard>

      </div>

      {/* Transaction History Datatable using SmartTable */}
      <GlassCard>
         <SmartTable 
            title="Wallet Transactions History"
            columns={txnColumns}
            data={wallet.history || []}
            searchPlaceholder="Search by ID or description..."
         />
      </GlassCard>

    </div>
  );
};
