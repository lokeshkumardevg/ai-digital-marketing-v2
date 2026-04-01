import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Target, Globe, Search, DollarSign, Image as ImageIcon, CheckCircle2, ArrowRight, LayoutTemplate, BriefcaseBusiness, Zap, Activity, ShieldCheck } from 'lucide-react';
import './Campaigns.css'; // Premium CSS

// Inline brand icons
const FacebookIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;
const InstagramIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;

type Message = {
  role: 'user' | 'bot';
  type: 'text' | 'form' | 'research' | 'platforms' | 'creatives' | 'review';
  content: any;
};

export const Campaigns: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isChatMode, setIsChatMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Campaign State
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [budget, setBudget] = useState<number>(100);
  const [campaignData, setCampaignData] = useState<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleDeepResearch = async () => {
    if (!url.trim()) return;
    setIsChatMode(true);
    setMessages([{ role: 'user', type: 'text', content: url }]);
    setLoading(true);

    // Initial terminal lines display
    setMessages(prev => [
      ...prev,
      {
        role: 'bot',
        type: 'text',
        content: 'Initializing Neural Engine... Fetching real-time market telemetry via backend AI layer:'
      },
      {
        role: 'bot',
        type: 'research',
        content: {}
      }
    ]);

    try {
      const response = await fetch('http://localhost:3000/campaigns/deep-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error('Backend AI request failed');
      }

      const data = await response.json();
      setCampaignData(data);
      if (data.recommendedBudget) {
        setBudget(data.recommendedBudget);
      }

      setLoading(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          type: 'text',
          content: `Real-time Analysis Complete.\n\nProduct Synopsis: ${data.productSummary}\nIdentified Market: ${data.audience}\n\nTo calibrate the autonomous agent, please specify the primary optimization metric:`
        },
        {
          role: 'bot',
          type: 'form',
          content: { step: 'goal', options: ['Maximized Conversions', 'Lead Generation & B2B', 'Omnichannel Awareness', 'Direct ROI Scaling'] }
        }
      ]);
    } catch (e) {
      console.error(e);
      setLoading(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          type: 'text',
          content: 'Error: Connection to Neural Engine failed. Ensure backend server is running and API keys are valid.'
        }
      ]);
    }
  };

  const handleGoalSelection = (goal: string) => {
    setSelectedGoal(goal);
    setMessages(prev => [...prev, { role: 'user', type: 'text', content: goal }]);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          type: 'text',
          content: `Parameter locked: "${goal}". Activating cross-channel matrix. Please select target networks for deployment:`
        },
        {
          role: 'bot',
          type: 'platforms',
          content: {}
        }
      ]);
    }, 1500);
  };

  const handlePlatformConfirm = (platforms: string[]) => {
    if (platforms.length === 0) return;
    setSelectedPlatforms(platforms);
    setMessages(prev => [...prev, { role: 'user', type: 'text', content: `Activated: ${platforms.join(', ')}` }]);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          type: 'text',
          content: 'Synthesizing generative hyper-creatives dynamically matched to your brand tone. Review proposed assets:'
        },
        {
          role: 'bot',
          type: 'creatives',
          content: {}
        }
      ]);
    }, 2000);
  };

  const handleCreativesConfirm = () => {
    setMessages(prev => [...prev, { role: 'user', type: 'text', content: 'Creatives approved.' }]);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          type: 'text',
          content: 'System ready. Finalize your daily allocation strategy to initiate orbital launch.'
        },
        {
          role: 'bot',
          type: 'review',
          content: {}
        }
      ]);
    }, 1500);
  };

  const handleExecuteDeployment = async () => {
    setMessages(prev => [...prev, { role: 'user', type: 'text', content: 'Execute operations.' }]);
    setLoading(true);

    try {
      // Step 1: Auto-generate campaign record in backend database via AI Orchestrator
      const genRes = await fetch('http://localhost:3000/campaigns/auto-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: `NEXUS Dynamic Setup - ${new URL(url || 'https://example.com').hostname}`, 
          audienceId: campaignData?.audience || 'General Market', 
          platform: selectedPlatforms.join(', '), 
          productUrl: url, 
          baseBudget: budget 
        })
      });
      
      if (!genRes.ok) throw new Error('Failed to generate campaign structure');
      const generatedData = await genRes.json();
      
      // Step 2: Trigger the launch sequencer (Pushes to Google/Meta integration points)
      await fetch(`http://localhost:3000/campaigns/${generatedData._id}/launch`, { 
        method: 'PATCH' 
      });

      setLoading(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          type: 'text',
          content: `🚀 Deployment sequence complete. Campaign '${generatedData.name}' has been successfully provisioned in the database and active across ${selectedPlatforms.join(' and ')}.`
        }
      ]);
    } catch (err) {
      console.error('Deployment error:', err);
      setLoading(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          type: 'text',
          content: '⚠️ Node connection failure during deployment sequence. Please check backend integration logs.'
        }
      ]);
    }
  };

  const TopHeader = () => (
    <motion.div initial={{ y: -50 }} animate={{ y: 0 }} style={{ position: 'sticky', top: 0, padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(20px)', zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}>
          <Zap size={20} />
        </div>
        <div>
          <span style={{ display: 'block', fontWeight: 800, fontSize: '1.2rem', color: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>NEXUS AI</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: '#38bdf8', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Active Session</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.85rem' }}>
          <Activity size={14} color="#10b981" /> Target: <span style={{color: '#f8fafc', fontWeight: 600}}>{url}</span>
        </div>
        <button
          className="glow-button"
          onClick={() => { setIsChatMode(false); setUrl(''); setMessages([]); }}
          style={{ padding: '8px 20px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#f8fafc', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
        >
          Terminate & Restart
        </button>
      </div>
    </motion.div>
  );

  return (
    <>
      <div className="bg-effects"></div>
      <div className="bg-grid"></div>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isChatMode ? 'flex-start' : 'center',
        position: 'relative',
        zIndex: 1,
        paddingBottom: '80px'
      }}>

        {!isChatMode && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ textAlign: 'center', maxWidth: '850px', padding: '0 24px', width: '100%', position: 'relative', zIndex: 10 }}>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '99px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              <Sparkles size={14} /> Next-Gen Enterprise Automation
            </motion.div>

            <h1 style={{ fontSize: '4.5rem', fontWeight: 900, marginBottom: '24px', lineHeight: 1.1, letterSpacing: '-0.02em', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              Initialize <span className="ai-gradient-text">Autonomous</span> Growth
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '56px', lineHeight: 1.6, maxWidth: '650px', margin: '0 auto 56px auto', fontWeight: 400 }}>
              Deploy enterprise-grade neural networks to scan your brand, structure complex conversion funnels, and launch self-optimizing campaigns instantly.
            </p>

            <div style={{ position: 'relative', maxWidth: '750px', margin: '0 auto', display: 'flex' }}>
              <div style={{ position: 'absolute', inset: '-2px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)', borderRadius: '99px', filter: 'blur(10px)', opacity: 0.5, zIndex: -1, animation: 'pulse 3s infinite alternate' }} />
              <div style={{ display: 'flex', gap: '12px', width: '100%', background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(20px)', padding: '8px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleDeepResearch()}
                  placeholder="https://your-enterprise-domain.com"
                  disabled={loading}
                  style={{
                    flex: 1, padding: '20px 32px', borderRadius: '99px', border: 'none',
                    fontSize: '1.1rem', color: '#f8fafc', outline: 'none', background: 'transparent',
                    fontFamily: "'Inter', sans-serif"
                  }}
                />
                <button
                  className="glow-button"
                  onClick={handleDeepResearch}
                  disabled={loading || !url}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 48px',
                    borderRadius: '99px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem',
                    whiteSpace: 'nowrap', opacity: (loading || !url) ? 0.6 : 1,
                    boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)'
                  }}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Target size={20} />}
                  Commence Analysis
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '64px', opacity: 0.6 }}>
               {/* Decorative trust indicators */}
               {['SOC2 Certified', 'Enterprise Grade', '99.99% Uptime'].map(text => (
                 <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>
                   <ShieldCheck size={16} /> {text}
                 </div>
               ))}
            </div>

          </motion.div>
        )}

        {isChatMode && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <TopHeader />
            <div style={{ width: '100%', maxWidth: '900px', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '40px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, type: 'spring', damping: 20 }}
                    style={{
                      display: 'flex',
                      flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                      width: '100%',
                      alignItems: 'flex-start'
                    }}
                  >
                    {/* Avatars */}
                    {msg.role === 'bot' && (
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', flexShrink: 0, marginRight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)', marginTop: '4px' }}>
                        <Zap size={20} />
                      </div>
                    )}
                    {msg.role === 'user' && (
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0, marginLeft: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f8fafc', marginTop: '4px' }}>
                        <div style={{ width: '16px', height: '16px', background: '#38bdf8', borderRadius: '50%', boxShadow: '0 0 10px #38bdf8' }} />
                      </div>
                    )}

                    <div style={{ width: msg.role === 'user' ? 'auto' : 'calc(100% - 60px)' }}>
                      {msg.type === 'text' && (
                        <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'} style={{
                          padding: '20px 28px',
                          borderRadius: msg.role === 'user' ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
                          display: 'inline-block',
                          fontSize: '1.05rem',
                          lineHeight: 1.6,
                          color: '#f8fafc',
                          fontWeight: 400,
                          backdropFilter: 'blur(10px)'
                        }}>
                          {msg.content}
                        </div>
                      )}

                      {msg.type === 'research' && <ResearchTerminal url={url} />}
                      {msg.type === 'form' && msg.content.step === 'goal' && <GoalSelector options={msg.content.options} onSelect={handleGoalSelection} />}
                      {msg.type === 'platforms' && <PlatformSelector onConfirm={handlePlatformConfirm} />}
                      {msg.type === 'creatives' && <CreativeGallery onConfirm={handleCreativesConfirm} url={url} ads={campaignData?.ads} />}
                      {msg.type === 'review' && <FinalReview goal={selectedGoal} platforms={selectedPlatforms} budget={budget} setBudget={setBudget} url={url} onExecute={handleExecuteDeployment} />}
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', marginTop: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'transparent', flexShrink: 0, marginRight: '20px' }}></div>
                    <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      <Loader2 className="animate-spin" size={16} /> Processing Neural Link...
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} style={{ height: '40px' }} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// --- Custom Subcomponents for Premium UI ---

const ResearchTerminal: React.FC<{url: string}> = ({url}) => {
  const [logs, setLogs] = useState<string[]>([`> Establishing secure connection to [${url}]...`]);

  useEffect(() => {
    const lines = [
      '> Extracting DOM structure and semantic payload...',
      '> Analyzing color contrast and typographic hierarchy...',
      '[SUCCESS] Brand palette identified.',
      '> Querying competitor matrices...',
      '> Running NLP on product descriptions...',
      '[SUCCESS] Core value propositions extracted.',
      '> Generating multi-variate ad angles for high CTR...',
      '> Compiling final telemetry packet...'
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setLogs(prev => [...prev, lines[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', borderTop: '4px solid #3b82f6', width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'monospace', fontSize: '0.9rem', marginTop: '16px', background: '#020617' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
        </div>
        <span style={{ color: '#64748b' }}>nexus_ai_engine.exe</span>
      </div>
      {logs.map((log, idx) => (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={idx} style={{ color: log?.startsWith('[SUCCESS]') ? '#10b981' : '#38bdf8', marginBottom: '4px' }}>
          {log}
        </motion.div>
      ))}
      <div style={{ color: '#f8fafc' }}>
        <span className="terminal-cursor"></span>
      </div>
    </div>
  );
};

const GoalSelector: React.FC<{ options: string[], onSelect: (g: string) => void }> = ({ options, onSelect }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', width: '100%', maxWidth: '800px', marginTop: '16px' }}>
    {options.map((opt) => (
      <button
        key={opt}
        className="card-hover glow-button"
        onClick={() => onSelect(opt)}
        style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.8)', color: '#f8fafc', fontWeight: 600, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(10px)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '10px', borderRadius: '12px' }}><Target size={20} color="#38bdf8" /></div>
          <span style={{ fontSize: '1.05rem' }}>{opt}</span>
        </div>
        <ArrowRight size={20} color="#64748b" />
      </button>
    ))}
  </div>
);

const PlatformSelector: React.FC<{ onConfirm: (p: string[]) => void }> = ({ onConfirm }) => {
  const [selected, setSelected] = useState<string[]>(['Google', 'LinkedIn']);
  const platforms = [
    { name: 'Google', icon: <Search size={28} color="#38bdf8" /> },
    { name: 'LinkedIn', icon: <BriefcaseBusiness size={28} color="#8b5cf6" /> },
    { name: 'Facebook', icon: <FacebookIcon /> },
    { name: 'Instagram', icon: <InstagramIcon /> },
  ];

  const toggle = (name: string) => {
    if (selected.includes(name)) setSelected(selected.filter(x => x !== name));
    else setSelected([...selected, name]);
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '750px', marginTop: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {platforms.map(p => {
          const isSelected = selected.includes(p.name);
          return (
            <div
              key={p.name}
              className="card-hover"
              onClick={() => toggle(p.name)}
              style={{
                padding: '28px 20px', borderRadius: '20px',
                border: `2px solid ${isSelected ? '#3b82f6' : 'rgba(255,255,255,0.05)'}`,
                background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(15, 23, 42, 0.5)',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', position: 'relative'
              }}
            >
              {isSelected && <div style={{ position: 'absolute', top: 12, right: 12 }}><CheckCircle2 size={20} color="#3b82f6" fill="rgba(59, 130, 246, 0.2)" /></div>}
              {p.icon}
              <span style={{ fontWeight: 600, fontSize: '1rem', color: isSelected ? '#fff' : '#94a3b8' }}>{p.name}</span>
            </div>
          )
        })}
      </div>
      <button
        className="glow-button"
        onClick={() => onConfirm(selected)}
        disabled={selected.length === 0}
        style={{ width: '100%', padding: '20px', borderRadius: '16px', background: selected.length > 0 ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(255,255,255,0.05)', color: selected.length > 0 ? '#fff' : '#64748b', fontWeight: 700, fontSize: '1.1rem', border: 'none', cursor: selected.length > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.3s' }}
      >
        Compile Network Matrix
      </button>
    </div>
  );
};

const CreativeGallery: React.FC<{ onConfirm: () => void, url: string, ads: any[] }> = ({ onConfirm, url, ads }) => {
  const domain = new URL(url || 'https://example.com').hostname.replace('www.', '');
  const ad1 = ads?.[0] || { headline: 'Amplify Your Digital Sovereignty', text: 'Deploy scalable neural architectures designed specifically for next-gen market leaders. Experience absolute operational clarity.' };
  const ad2 = ads?.[1] || { headline: 'AI-Driven Protocol Optimization', text: 'Automate redundant pathways and unlock exponential growth using our proprietary multi-agent platform technology.' };

  return (
    <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '850px', marginTop: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {/* Ad 1 */}
        <div className="card-hover" style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden', background: 'rgba(15, 23, 42, 0.4)' }}>
          <div style={{ height: '180px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'url(https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80) center/cover', opacity: 0.5 }}></div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 1), transparent)' }}></div>
            <ImageIcon size={40} color="rgba(255,255,255,0.5)" style={{ zIndex: 1 }} />
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Globe size={14} /> Sponsored • {domain}
            </div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#f8fafc', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{ad1.headline}</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>{ad1.text}</p>
          </div>
        </div>
        {/* Ad 2 */}
        <div className="card-hover" style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden', background: 'rgba(15, 23, 42, 0.4)' }}>
          <div style={{ height: '180px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80) center/cover', opacity: 0.5 }}></div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 1), transparent)' }}></div>
            <LayoutTemplate size={40} color="rgba(255,255,255,0.5)" style={{ zIndex: 1 }} />
          </div>
          <div style={{ padding: '24px' }}>
             <div style={{ fontSize: '0.8rem', color: '#8b5cf6', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Globe size={14} /> Sponsored • {domain}
            </div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#f8fafc', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{ad2.headline}</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>{ad2.text}</p>
          </div>
        </div>
      </div>
      <button
        className="glow-button"
        onClick={onConfirm}
        style={{ width: '100%', padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', fontWeight: 700, fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}
      >
        Sign & Authorize Creatives
      </button>
    </div>
  );
}

const FinalReview: React.FC<{ goal: string, platforms: string[], budget: number, setBudget: (v: number) => void, url: string, onExecute: () => void }> = ({ goal, platforms, budget, setBudget, url, onExecute }) => {
  return (
    <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '750px', marginTop: '16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', zIndex: 0 }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', color: '#f8fafc', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>Deployment Overview</h3>
        <p style={{ margin: '0 0 32px 0', color: '#94a3b8' }}>System is primed. Review telemetry before final orbital launch.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#94a3b8', fontWeight: 500 }}>Target Root Node</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>{new URL(url || 'https://example.com').hostname}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#94a3b8', fontWeight: 500 }}>Optimization Vector</span>
            <span style={{ color: '#f8fafc', fontWeight: 600 }}>{goal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontWeight: 500 }}>Active Nodes</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {platforms.map(p => <span key={p} style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8' }}>{p}</span>)}
            </div>
          </div>

          <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginBottom: '16px' }}>Compute Allocation (USD/day)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px' }}>
                <DollarSign size={24} color="#10b981" />
              </div>
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', outline: 'none', fontFamily: "'Outfit', sans-serif" }}
              />
            </div>
          </div>
        </div>

        <button onClick={onExecute} className="glow-button" style={{ width: '100%', padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: 800, fontSize: '1.2rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 8px 30px rgba(16, 185, 129, 0.3)' }}>
          <Zap size={24} /> Execute Deployment
        </button>
      </div>
    </div>
  );
};
