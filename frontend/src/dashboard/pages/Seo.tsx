import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import { 
  AlertCircle, AlertTriangle, Zap, Activity, 
  Globe, Clock, FileText, Image as ImageIcon, Link as LinkIcon, 
  RefreshCw, FileCode, Check, Layout, Smartphone, ShieldCheck, Info
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import toast from 'react-hot-toast';
import { addNotification } from '../../store/slices/notificationSlice';

export const Seo: React.FC = () => {
  const dispatch = useDispatch();
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleScan = async () => {
    if (!url) return toast.error('URL cannot be empty');
    let target = url.trim();
    if (!target.startsWith('http')) target = 'https://' + target;
    setUrl(target);
    
    setScanning(true);
    setResult(null);
    toast.loading('AI Agents crawling ' + target + '...', { id: 'seo' });

    try {
      const { api } = await import('../../api/axios');
      const response = await api.post('/ai/seo-audit', { url: target });
      if (response.data.success) {
        setResult(response.data.data);
        toast.success('Analysis Synchronized!', { id: 'seo' });
        dispatch(addNotification({ 
          id: Date.now().toString(), 
          title: 'SEO Audit Ready', 
          message: `Technical analysis for ${target} complete.`, 
          type: 'success', 
          time: new Date().toISOString(), 
          read: false 
        }));
      } else throw new Error(response.data.error || 'Audit failure');
    } catch (e: any) {
      toast.error(e.message, { id: 'seo' });
    } finally {
      setScanning(false);
    }
  };

  const getHealthData = (score: number) => [
    { value: score, color: score > 80 ? '#10b981' : score > 50 ? '#f59e0b' : '#ef4444' },
    { value: 100 - score, color: 'rgba(0,0,0,0.03)' }
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '32px', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header Bar */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', margin: 0 }}>
          Site <span className="text-gradient">Audit Core</span>
        </h1>
        <div style={{ display: 'flex', gap: '10px', flex: 1, maxWidth: '520px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
             <input 
               className="input-field" placeholder="Target domain url..." value={url} 
               onChange={e => setUrl(e.target.value)}
               style={{ height: '38px', fontSize: '0.85rem', paddingLeft: '34px', borderRadius: '6px', background: '#fff', border: '1px solid rgba(112, 51, 245, 0.15)' }}
             />
             <Globe size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6, color: 'var(--accent-primary)' }} />
          </div>
          <button 
            className="btn btn-primary" onClick={handleScan} disabled={scanning}
            style={{ width: '100px', height: '38px', fontSize: '0.8rem', borderRadius: '6px', fontWeight: 700 }}
          >
            {scanning ? <RefreshCw size={12} className="animate-spin" /> : 'Run Audit'}
          </button>
        </div>
      </div>

      {!result && !scanning && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
           {[
             { title: 'Semantic SEO', desc: 'Heading structure & Tag analysis.', icon: FileCode, color: '#3b82f6' },
             { title: 'Technical Core', desc: 'HTTPS, Security & Vitals checks.', icon: ShieldCheck, color: '#10b981' },
             { title: 'Asset Profiler', desc: 'Image alt texts & Outbound link mapping.', icon: LinkIcon, color: '#f59e0b' }
           ].map((card, i) => (
             <GlassCard key={i} style={{ padding: '16px' }}>
               <card.icon size={18} color={card.color} style={{ marginBottom: '10px' }} />
               <h3 style={{ fontSize: '0.95rem', marginBottom: '4px', fontWeight: 700 }}>{card.title}</h3>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: 1.4 }}>{card.desc}</p>
             </GlassCard>
           ))}
        </div>
      )}

      {scanning && (
        <div style={{ padding: '32px 0', textAlign: 'center' }}>
          <Activity size={40} className="text-gradient animate-pulse" style={{ margin: '0 auto' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '12px' }}>AI Bot analyzing DOM architecture and protocols...</p>
        </div>
      )}

      {result && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Top Level KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <GlassCard style={{ padding: '12px 16px', borderLeft: '4px solid var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={getHealthData(result.score)} innerRadius={18} outerRadius={24} startAngle={225} endAngle={-45} paddingAngle={0} dataKey="value" stroke="none">
                        {getHealthData(result.score).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        <Label value={result.score} position="center" style={{ fontSize: '10px', fontWeight: 800, fill: '#000' }} />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                   <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Site Health</div>
                   <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{result.score}% Score</div>
                </div>
            </GlassCard>
            <GlassCard style={{ borderLeft: '4px solid #ef4444', padding: '12px 16px' }}>
                 <div style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>Critical Errors</div>
                 <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#141414' }}>{result.stats?.totalErrors || 0}</div>
            </GlassCard>
            <GlassCard style={{ borderLeft: '4px solid #f59e0b', padding: '12px 16px' }}>
                 <div style={{ fontSize: '0.6rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>Score Warnings</div>
                 <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#141414' }}>{result.stats?.totalWarnings || 0}</div>
            </GlassCard>
            <GlassCard style={{ borderLeft: '4px solid #3b82f6', padding: '12px 16px' }}>
                 <div style={{ fontSize: '0.6rem', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase' }}>Notices</div>
                 <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#141414' }}>{result.stats?.totalNotices || 0}</div>
            </GlassCard>
          </div>

          {/* Main Content Sections */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }}>
            
            {/* Left Side: Audit Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Metadata Section - Clear Vertical Stack */}
              <GlassCard style={{ padding: '20px' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '0.9rem', fontWeight: 700, color: '#000' }}>
                   <FileText size={16} color="var(--accent-primary)" /> Global Metadata Extraction
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ borderLeft: '2px solid rgba(112,51,245,0.1)', paddingLeft: '12px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '2px' }}>PAGE TITLE TAG</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#141414', marginBottom: '4px', lineHeight: 1.4 }}>{result.meta?.title || 'No Title Found'}</div>
                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: result.details?.titleStatus === 'optimal' ? '#dcfce7' : '#fef3c7', color: result.details?.titleStatus === 'optimal' ? '#10b981' : '#f59e0b', fontWeight: 800 }}>
                       {result.details?.titleLength} CHARS • {result.details?.titleStatus?.toUpperCase() || 'MISSING'}
                    </span>
                  </div>
                  <div style={{ borderLeft: '2px solid rgba(112,51,245,0.1)', paddingLeft: '12px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '2px' }}>META DESCRIPTION</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#444', lineHeight: 1.5 }}>{result.meta?.description || 'No meta description found for this route.'}</div>
                  </div>
                </div>
              </GlassCard>

              {/* Actionable Issues Table */}
              <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
                 <div style={{ padding: '16px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#000', borderBottom: '1px solid var(--glass-border)' }}>
                    <Layout size={16} color="var(--accent-primary)" /> Recommendations List
                 </div>
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0,0,0,0.02)', textAlign: 'left' }}>
                        <th style={{ padding: '12px 16px', color: '#666', fontSize: '0.65rem', fontWeight: 700 }}>SEVERITY</th>
                        <th style={{ padding: '12px 16px', color: '#666', fontSize: '0.65rem', fontWeight: 700 }}>ISSUE DESCRIPTION</th>
                        <th style={{ padding: '12px 16px', color: '#666', fontSize: '0.65rem', fontWeight: 700 }}>FIX</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(result.issues || []).map((issue: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)', fontSize: '0.8rem' }}>
                          <td style={{ padding: '12px 16px' }}>
                             {issue.type === 'error' ? <span style={{ color: '#ef4444', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} /> CRITICAL</span> :
                              issue.type === 'warning' ? <span style={{ color: '#f59e0b', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12} /> WARNING</span> :
                              <span style={{ color: '#3b82f6', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}><Info size={12} /> NOTICE</span>}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#141414', fontWeight: 500 }}>{issue.text}</td>
                          <td style={{ padding: '12px 16px' }}>
                             <button style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                               Apply <Check size={10} />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </GlassCard>

            </div>

            {/* Right Side: Structural Metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Heading Structure - Vertical List Style */}
              <GlassCard style={{ padding: '16px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '16px', color: '#000', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileCode size={14} color="var(--accent-primary)" /> Header DOM Tree
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(112,51,245,0.05)', borderRadius: '6px', border: '1px solid rgba(112,51,245,0.1)' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, background: 'var(--accent-primary)', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>H1</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                           {result.meta?.h1 || 'Missing Heading'}
                        </span>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.5)', borderRadius: '6px', marginLeft: '12px', border: '1px solid var(--glass-border)' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, background: '#64748b', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>H2</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Detected Nodes: {result.meta?.h2Count}</span>
                     </div>
                  </div>
              </GlassCard>

              {/* Quick Tech Metrics */}
              <GlassCard style={{ padding: '16px' }}>
                  <h4 style={{ marginBottom: '12px', fontSize: '0.8rem', fontWeight: 800, color: '#000' }}>Protocol Validation</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { label: 'SSL Protocol', ok: result.details?.hasSsl, icon: ShieldCheck, val: 'ACTIVE' },
                      { label: 'UX Engine', ok: result.details?.mobileFriendly, icon: Smartphone, val: 'MOBILE' },
                      { label: 'Latency Node', ok: parseFloat(result.loadTime) < 2, icon: Clock, val: result.loadTime }
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f8f9ff', borderRadius: '4px', fontSize: '0.75rem' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontWeight: 600 }}>
                           <item.icon size={12} /> {item.label}
                         </div>
                         <span style={{ fontWeight: 800, color: item.ok ? '#10b981' : '#f59e0b' }}>{item.val || 'OFF'}</span>
                      </div>
                    ))}
                  </div>
              </GlassCard>

              {/* Counts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <GlassCard style={{ padding: '12px', textAlign: 'center' }}>
                   <ImageIcon size={14} color="#10b981" style={{ margin: '0 auto 6px' }} />
                   <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#000' }}>{result.meta?.images}</div>
                   <div style={{ fontSize: '0.6rem', color: '#666', fontWeight: 700 }}>IMAGES</div>
                </GlassCard>
                <GlassCard style={{ padding: '12px', textAlign: 'center' }}>
                   <LinkIcon size={14} color="#3b82f6" style={{ margin: '0 auto 6px' }} />
                   <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#000' }}>{result.meta?.links}</div>
                   <div style={{ fontSize: '0.6rem', color: '#666', fontWeight: 700 }}>NODES</div>
                </GlassCard>
              </div>

              {/* Bot Action */}
              <div style={{ background: '#000', borderRadius: '8px', padding: '16px', color: '#fff' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                   <Zap size={16} color="var(--accent-primary)" />
                   <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>INSTANT PATCH</span>
                 </div>
                 <p style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '12px', lineHeight: 1.4 }}>Synchronize AI Agents to re-configure DOM structure.</p>
                 <button style={{ width: '100%', height: '30px', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>APPLY AUTO-FIX</button>
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
};
