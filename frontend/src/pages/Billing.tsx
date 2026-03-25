import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { api } from '../api/axios';
import { 
  CreditCard, CheckCircle2, Crown, Activity
} from 'lucide-react';

export const Billing: React.FC = () => {
  const [sub, setSub] = useState<any>(null);
  const [plans, setPlans] = useState<any>({});
  const [loadingCheckout, setLoadingCheckout] = useState('');

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const [subRes, plansRes] = await Promise.all([
        api.get('/billing/subscription'),
        api.get('/billing/plans')
      ]);
      setSub(subRes.data);
      setPlans(plansRes.data);
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

  if (!sub || !plans.pro) return <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Loading SaaS Limits...</div>;

  const usagePercent = Math.min((sub.aiTokensUsedCurrentBillingCycle / sub.aiTokenLimit) * 100, 100);
  const isDanger = usagePercent > 90;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            SaaS <span className="text-gradient">Subscriptions & Limits</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your workspace usage and upgrade limits via Stripe.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1.2fr) 2fr', gap: '24px', marginBottom: '40px' }}>
        
        {/* Left Column: Current Plan & Usage Meter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <GlassCard style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ background: 'var(--accent-primary)', padding: '24px', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Crown size={20} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Plan</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {sub.status.toUpperCase()}
                </div>
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0 0 4px 0' }}>{plans[sub.plan].name}</h2>
              <div style={{ opacity: 0.9, fontSize: '0.9rem' }}>
                Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <Activity size={18} color="var(--info)" /> AI Model Token Usage
                </div>
                <div style={{ fontSize: '0.85rem', color: isDanger ? 'var(--fail)' : 'var(--text-secondary)' }}>
                  {sub.aiTokensUsedCurrentBillingCycle.toLocaleString()} / {sub.aiTokenLimit.toLocaleString()} Used
                </div>
              </div>
              
              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${usagePercent}%`, 
                  background: isDanger ? 'var(--fail)' : 'var(--info)',
                  transition: 'width 1s ease-in-out',
                  borderRadius: '4px'
                }}></div>
              </div>

              {isDanger && (
                <div style={{ fontSize: '0.8rem', color: 'var(--fail)', marginTop: '8px', fontWeight: 600 }}>
                  Approaching Monthly Soft-Limit! Features will be restricted soon.
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} /> Payment Methods
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '24px', background: '#333', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600 }}>
                  Visa
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>•••• •••• •••• 4242</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Expires 12/28</div>
                </div>
              </div>
              <button className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--glass-border)' }}>Update</button>
            </div>
          </GlassCard>

        </div>

        {/* Right Column: Pricing Matrix & Checkout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Upgrade Workflow via Stripe</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
             {/* Pro Plan Card */}
             <GlassCard style={{ border: sub.plan === 'pro' ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
               <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Most Popular</div>
               <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{plans.pro.name}</h3>
               <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)' }}>
                 ${plans.pro.price}<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/mo</span>
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', flex: 1 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                   <CheckCircle2 size={16} color="var(--success)" /> 250,000 AI Tokens
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                   <CheckCircle2 size={16} color="var(--success)" /> Meta & Google Ads APIs
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                   <CheckCircle2 size={16} color="var(--success)" /> Priority Bot Support
                 </div>
               </div>
               
               {sub.plan === 'pro' ? (
                 <button className="btn btn-secondary" disabled style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }}>Current Active Plan</button>
               ) : (
                 <button 
                  className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleUpgrade('pro')}
                  disabled={loadingCheckout !== ''}
                 >
                   {loadingCheckout === 'pro' ? 'Initializing Stripe...' : 'Upgrade Now'}
                 </button>
               )}
             </GlassCard>

             {/* Enterprise Plan Card */}
             <GlassCard style={{ border: sub.plan === 'enterprise' ? '2px solid var(--warning)' : '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
               <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--warning)', marginBottom: '8px', fontWeight: 600 }}>Dedicated Scaling</div>
               <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{plans.enterprise.name}</h3>
               <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)' }}>
                 ${plans.enterprise.price}<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/mo</span>
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', flex: 1 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                   <CheckCircle2 size={16} color="var(--warning)" /> 2,000,000 AI Tokens
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                   <CheckCircle2 size={16} color="var(--warning)" /> Custom LLM Fine-Tuning
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                   <CheckCircle2 size={16} color="var(--warning)" /> White-Label Reports
                 </div>
               </div>
               
               {sub.plan === 'enterprise' ? (
                 <button className="btn btn-secondary" disabled style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }}>Current Active Plan</button>
               ) : (
                 <button 
                  className="btn" 
                  style={{ width: '100%', background: 'transparent', border: '1px solid var(--warning)', color: 'var(--warning)' }} 
                  onClick={() => handleUpgrade('enterprise')}
                  disabled={loadingCheckout !== ''}
                 >
                   {loadingCheckout === 'enterprise' ? 'Processing...' : 'Contact Sales (Upgrade)'}
                 </button>
               )}
             </GlassCard>
          </div>
        </div>

      </div>
    </div>
  );
};
