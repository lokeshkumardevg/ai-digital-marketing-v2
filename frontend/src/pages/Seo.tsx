import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { useDispatch } from 'react-redux';
import { Search, AlertTriangle, Zap, CheckCircle2, Activity, LayoutList } from 'lucide-react';
import toast from 'react-hot-toast';
import { addNotification } from '../store/slices/notificationSlice';

export const Seo: React.FC = () => {
  const dispatch = useDispatch();
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleScan = async () => {
    if (!url) return toast.error('Please enter a website URL to audit.');
    
    // Auto-format protocol natively
    let target = url;
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
      setUrl(target);
    }
    
    setScanning(true);
    setResult(null);

    toast.loading('AI Agents are actively crawling ' + target + '...', { id: 'seo-audit' });

    try {
      const { api } = await import('../api/axios');
      const response = await api.post('/ai/seo-audit', { url: target });
      
      setResult(response.data.data);
      toast.success('Website SEO Audit Complete!', { id: 'seo-audit' });
      dispatch(addNotification({ id: Date.now().toString(), title: 'SEO Audit Complete', message: `AI Crawler finished analyzing node structure for ${target}.`, type: 'info', time: new Date().toISOString(), read: false }));
    } catch (error) {
      toast.error('Failed to crawl website.', { id: 'seo-audit' });
      dispatch(addNotification({ id: Date.now().toString(), title: 'SEO Audit Failed', message: `AI Crawler could not reach ${target}.`, type: 'error', time: new Date().toISOString(), read: false }));
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
          SEO & <span className="text-gradient">Site Audits</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Instantly audit your website to uncover indexing issues and keyword opportunities.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '24px' }}>
        
        {/* Audit Form View */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
           <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Search size={20} color="var(--accent-primary)" /> Run SEO Audit
           </h3>

           <div className="input-group">
             <label>Website URL</label>
             <input type="text" className="input-field" placeholder="https://example.com" value={url} onChange={e => setUrl(e.target.value)} disabled={scanning} />
           </div>

           <button 
             className="btn btn-primary" 
             onClick={handleScan} 
             disabled={scanning}
             style={{ display: 'flex', justifyContent: 'center' }}
           >
             {scanning ? <><Activity size={18} className="animate-fade-in" style={{ animationIterationCount: 'infinite' }} /> Crawling Site...</> : 'Audit Website'}
           </button>
        </GlassCard>

        {/* Audit Results View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {!scanning && !result && (
             <GlassCard style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <LayoutList size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
               <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>No Audit Data</h3>
               <p>Enter a URL on the left to generate an AI-powered SEO report.</p>
             </GlassCard>
          )}

          {scanning && (
            <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', height: '100%' }}>
              <Activity size={48} color="var(--accent-primary)" className="animate-fade-in" style={{ animationIterationCount: 'infinite', animationDirection: 'alternate' }} />
              <p style={{ marginTop: '24px', color: 'var(--text-secondary)' }}>AI Agents are mapping DOM elements and running Lighthouse metrics.</p>
            </GlassCard>
          )}

          {result && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', gap: '24px' }}>
                <GlassCard style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Overall SEO Score</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: result.score > 80 ? 'var(--success)' : 'var(--warning)' }}>{result.score}/100</div>
                </GlassCard>
                <GlassCard style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Page Load Time</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--info)' }}>{result.loadTime}</div>
                </GlassCard>
                <GlassCard style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Indexed Status</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '48px' }}>
                    <CheckCircle2 size={36} />
                  </div>
                </GlassCard>
              </div>

              <GlassCard>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={20} color="var(--accent-primary)" /> Actionable Insights
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {result.issues.map((issue: any, i: number) => (
                    <div key={i} style={{ 
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' 
                    }}>
                      {issue.type === 'error' && <AlertTriangle size={20} color="var(--error)" />}
                      {issue.type === 'warning' && <AlertTriangle size={20} color="var(--warning)" />}
                      {issue.type === 'success' && <CheckCircle2 size={20} color="var(--success)" />}
                      
                      <span style={{ fontSize: '0.95rem' }}>{issue.text}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
