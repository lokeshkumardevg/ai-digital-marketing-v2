import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Target, Globe, Search, MapPin, DollarSign, Image as ImageIcon, CheckCircle2, ArrowRight, LayoutTemplate, BriefcaseBusiness } from 'lucide-react';

// Inline brand icons (lucide-react does not export Facebook/Instagram)
const FacebookIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877f2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;
const InstagramIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e1306c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;

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
  const [budget, setBudget] = useState<number>(50);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleDeepResearch = () => {
    if (!url.trim()) return;
    setIsChatMode(true);
    setMessages([{ role: 'user', type: 'text', content: url }]);
    setLoading(true);

    // AI Deep Research Terminal Animation
    setTimeout(() => {
      setLoading(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          type: 'text',
          content: 'I have started deep-researching your URL to understand your brand, audience, and competitors. Here is the live progress:'
        },
        {
          role: 'bot',
          type: 'research',
          content: {}
        }
      ]);

      // Complete research after 4s
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            role: 'bot',
            type: 'text',
            content: 'Research complete! 🚀 I found some high-converting angles. First, what is the primary business goal for this campaign?'
          },
          {
            role: 'bot',
            type: 'form',
            content: { step: 'goal', options: ['Drive Sales', 'Generate Leads', 'Increase Traffic', 'Brand Awareness'] }
          }
        ]);
        scrollToBottom();
      }, 4500);
    }, 1000);
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
          content: `Excellent. To achieve "${goal}", I recommend a multi-channel approach. Which platforms would you like to run ads on?`
        },
        {
          role: 'bot',
          type: 'platforms',
          content: {}
        }
      ]);
    }, 1200);
  };

  const handlePlatformConfirm = (platforms: string[]) => {
    if (platforms.length === 0) return;
    setSelectedPlatforms(platforms);
    setMessages(prev => [...prev, { role: 'user', type: 'text', content: `Selected: ${platforms.join(', ')}` }]);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          type: 'text',
          content: 'Great choice! I have used your website data to generate some highly targeted ad creatives. Please review them below:'
        },
        {
          role: 'bot',
          type: 'creatives',
          content: {}
        }
      ]);
    }, 1500);
  };

  const handleCreativesConfirm = () => {
    setMessages(prev => [...prev, { role: 'user', type: 'text', content: 'Creatives look good. Proceed.' }]);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          type: 'text',
          content: 'Almost ready to launch! Let\'s finalize your daily budget and review the campaign summary.'
        },
        {
          role: 'bot',
          type: 'review',
          content: {}
        }
      ]);
    }, 1200);
  };

  const TopHeader = () => (
    <motion.div initial={{ y: -50 }} animate={{ y: 0 }} style={{ position: 'fixed', top: 0, left: 250, right: 0, padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', zIndex: 100, borderBottom: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Sparkles size={16} />
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e293b' }}>AI Campaign Builder</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <input
          disabled
          value={url}
          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: '0.85rem', width: '280px', textOverflow: 'ellipsis' }}
        />
        <button
          onClick={() => { setIsChatMode(false); setUrl(''); setMessages([]); }}
          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#cbd5e1'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          New Deep Research
        </button>
      </div>
    </motion.div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: isChatMode ? '#f8fafc' : 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 50%, #f0f4ff 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: isChatMode ? 'flex-start' : 'center',
      position: 'relative',
      paddingTop: isChatMode ? '80px' : '0'
    }}>

      {!isChatMode && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', maxWidth: '800px', padding: '0 24px', width: '100%' }}>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '-8px', marginBottom: '28px' }}>
            {['🤖', '👩🏻', '👨🏼', '👩🏽', '👨🏾', '👩🏿'].map((emoji, i) => (
              <div key={i} style={{
                width: '56px', height: '56px', borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : `hsl(${i * 45}, 60%, 90%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i === 0 ? '1.5rem' : '1.3rem',
                marginLeft: i === 0 ? 0 : '-12px', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                position: 'relative', zIndex: 10 - i, transition: 'transform 0.2s',
              }}>{emoji}</div>
            ))}
          </div>

          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '16px', lineHeight: 1.1, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
            <span style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Which page</span> would you like to promote?
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '48px', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 48px auto' }}>
            Paste any landing page, product page, or social profile. Our AI will instantly analyze your brand and build a full campaign.
          </p>

          <div style={{ display: 'flex', gap: '12px', maxWidth: '680px', margin: '0 auto', background: '#fff', padding: '8px', borderRadius: '99px', boxShadow: '0 10px 40px rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDeepResearch()}
              placeholder="e.g. https://wheedletechnologies.ai"
              disabled={loading}
              style={{
                flex: 1, padding: '16px 24px', borderRadius: '99px', border: 'none',
                fontSize: '1.05rem', color: '#1e293b', outline: 'none', background: 'transparent',
              }}
            />
            <button
              onClick={handleDeepResearch}
              disabled={loading || !url}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 40px',
                borderRadius: '99px', background: 'linear-gradient(135deg, #1e1b4b 0%, #3b0764 100%)',
                color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1.05rem',
                whiteSpace: 'nowrap', transition: 'all 0.2s', opacity: (loading || !url) ? 0.7 : 1
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              Deep Research
            </button>
          </div>
        </motion.div>
      )}

      {isChatMode && (
        <>
          <TopHeader />
          <div style={{ width: '100%', maxWidth: '850px', padding: '40px 24px 140px 24px', display: 'flex', flexDirection: 'column', gap: '32px', margin: '0 auto' }}>
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, type: 'spring' }}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    width: '100%'
                  }}
                >
                  {/* Avatar for Bot */}
                  {msg.role === 'bot' && (
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', flexShrink: 0, marginRight: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginTop: '4px', boxShadow: '0 4px 10px rgba(124, 58, 237, 0.2)' }}>
                      <Sparkles size={18} />
                    </div>
                  )}

                  <div style={{ width: msg.role === 'user' ? 'auto' : 'calc(100% - 52px)' }}>
                    {msg.type === 'text' && (
                      <div style={{
                        background: msg.role === 'user' ? 'linear-gradient(135deg, #f3e8ff, #e0e7ff)' : '#fff',
                        color: msg.role === 'user' ? '#4c1d95' : '#334155',
                        padding: '16px 24px',
                        borderRadius: msg.role === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                        display: 'inline-block',
                        boxShadow: msg.role === 'user' ? 'none' : '0 4px 20px rgba(0,0,0,0.03)',
                        border: msg.role === 'bot' ? '1px solid #f1f5f9' : '1px solid rgba(124,58,237,0.1)',
                        fontSize: '1rem',
                        lineHeight: 1.6,
                        fontWeight: msg.role === 'user' ? 600 : 400
                      }}>
                        {msg.content}
                      </div>
                    )}

                    {msg.type === 'research' && <ResearchTerminal />}

                    {msg.type === 'form' && msg.content.step === 'goal' && (
                      <GoalSelector options={msg.content.options} onSelect={handleGoalSelection} />
                    )}

                    {msg.type === 'platforms' && (
                      <PlatformSelector onConfirm={handlePlatformConfirm} />
                    )}

                    {msg.type === 'creatives' && (
                      <CreativeGallery onConfirm={handleCreativesConfirm} url={url} />
                    )}

                    {msg.type === 'review' && (
                      <FinalReview
                        goal={selectedGoal}
                        platforms={selectedPlatforms}
                        budget={budget}
                        setBudget={setBudget}
                        url={url}
                      />
                    )}

                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', flexShrink: 0, marginRight: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(124, 58, 237, 0.2)' }}>
                    <Sparkles size={18} />
                  </div>
                  <div style={{ background: '#fff', padding: '16px 24px', borderRadius: '24px 24px 24px 4px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', width: 'fit-content' }}>
                    <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'pulse 1.4s infinite' }} />
                    <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'pulse 1.4s infinite 0.2s' }} />
                    <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'pulse 1.4s infinite 0.4s' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </>
      )}
    </div>
  );
};

// --- Custom Subcomponents for UI Fidelity ---

const ResearchTerminal: React.FC = () => {
  const [steps, setSteps] = useState(0);

  useEffect(() => {
    const intervals = [800, 1800, 2800, 3800];
    intervals.forEach((time, index) => setTimeout(() => setSteps(index + 1), time));
  }, []);

  const items = [
    { label: 'Scraping landing page text & context', icon: <Globe size={16} /> },
    { label: 'Analyzing target audience demographics', icon: <Target size={16} /> },
    { label: 'Extracting product images & assets', icon: <ImageIcon size={16} /> },
    { label: 'Generating winning ad angles', icon: <BriefcaseBusiness size={16} /> },
  ];

  return (
    <div style={{ background: '#0f172a', padding: '24px', borderRadius: '16px', border: '1px solid #1e293b', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
        <span style={{ marginLeft: '12px', fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>AI_Research_Process.sh</span>
      </div>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: steps > idx ? 1 : 0.3, transition: 'opacity 0.3s' }}>
          {steps > idx ? <CheckCircle2 size={18} color="#10b981" /> : <Loader2 className="animate-spin" size={18} color="#94a3b8" />}
          <span style={{ color: steps > idx ? '#e2e8f0' : '#94a3b8', fontSize: '0.9rem', fontFamily: 'monospace' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const GoalSelector: React.FC<{ options: string[], onSelect: (g: string) => void }> = ({ options, onSelect }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', width: '100%', maxWidth: '600px' }}>
    {options.map((opt) => (
      <button
        key={opt}
        onClick={() => onSelect(opt)}
        style={{ padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontWeight: 600, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <span>{opt}</span>
        <ArrowRight size={18} color="#cbd5e1" />
      </button>
    ))}
  </div>
);

const PlatformSelector: React.FC<{ onConfirm: (p: string[]) => void }> = ({ onConfirm }) => {
  const [selected, setSelected] = useState<string[]>(['Google Search', 'Facebook']);
  const platforms = [
    { name: 'Google Search', icon: <Search size={24} color="#ea4335" /> },
    { name: 'Facebook', icon: <FacebookIcon /> },
    { name: 'Instagram', icon: <InstagramIcon /> },
    { name: 'TikTok', icon: <Target size={24} color="#000000" /> },
  ];

  const toggle = (name: string) => {
    if (selected.includes(name)) setSelected(selected.filter(x => x !== name));
    else setSelected([...selected, name]);
  };

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', width: '100%', maxWidth: '600px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {platforms.map(p => (
          <div
            key={p.name}
            onClick={() => toggle(p.name)}
            style={{ padding: '20px', borderRadius: '16px', border: `2px solid ${selected.includes(p.name) ? '#7c3aed' : '#e2e8f0'}`, background: selected.includes(p.name) ? '#faf5ff' : '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', transition: 'all 0.2s', position: 'relative' }}
          >
            {selected.includes(p.name) && <div style={{ position: 'absolute', top: 8, right: 8 }}><CheckCircle2 size={16} color="#7c3aed" /></div>}
            {p.icon}
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#334155' }}>{p.name}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => onConfirm(selected)}
        disabled={selected.length === 0}
        style={{ width: '100%', padding: '16px', borderRadius: '12px', background: selected.length > 0 ? '#1e293b' : '#94a3b8', color: '#fff', fontWeight: 600, border: 'none', cursor: selected.length > 0 ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}
      >
        Confirm Platforms
      </button>
    </div>
  );
};

const CreativeGallery: React.FC<{ onConfirm: () => void, url: string }> = ({ onConfirm, url }) => {
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', width: '100%', maxWidth: '700px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Ad 1 */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ height: '140px', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ImageIcon size={32} color="#94a3b8" />
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>Sponsored · {new URL(url || 'https://example.com').hostname.replace('www.', '')}</div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#1e293b', fontWeight: 700 }}>Unlock Your Digital Potential Today</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Join thousands scaling their businesses with our AI-driven automation tools. Book your demo now.</p>
          </div>
        </div>
        {/* Ad 2 */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ height: '140px', background: 'linear-gradient(135deg, #f8fafc, #cbd5e1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LayoutTemplate size={32} color="#64748b" />
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>Sponsored · {new URL(url || 'https://example.com').hostname.replace('www.', '')}</div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#1e293b', fontWeight: 700 }}>The Future of Automation is Here</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Stop wasting time on manual tasks. See how our platform automates your workflow instantly.</p>
          </div>
        </div>
      </div>
      <button
        onClick={onConfirm}
        style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#1e293b', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}
      >
        Approve Creatives & Continue
      </button>
    </div>
  );
}

const FinalReview: React.FC<{ goal: string, platforms: string[], budget: number, setBudget: (v: number) => void, url: string }> = ({ goal, platforms, budget, setBudget, url }) => {
  return (
    <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', width: '100%', maxWidth: '600px' }}>
      <h3 style={{ margin: '0 0 24px 0', fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>Campaign Ready for Launch 🚀</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ color: '#64748b', fontWeight: 500 }}>Target URL</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{new URL(url || 'https://example.com').hostname}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ color: '#64748b', fontWeight: 500 }}>Objective</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{goal}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ color: '#64748b', fontWeight: 500 }}>Networks</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {platforms.map(p => <span key={p} style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>{p}</span>)}
          </div>
        </div>

        <div style={{ marginTop: '8px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '12px' }}>Daily Budget (USD)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0' }}>
            <DollarSign size={20} color="#64748b" />
            <input
              type="number"
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      <button style={{ width: '100%', padding: '18px', borderRadius: '16px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', fontWeight: 800, fontSize: '1.1rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 20px rgba(124,58,237,0.3)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
        <Sparkles size={20} /> Publish Campaign
      </button>
    </div>
  );
};
