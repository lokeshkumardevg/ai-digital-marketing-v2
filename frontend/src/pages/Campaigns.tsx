import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Campaigns: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isChatMode, setIsChatMode] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', type: 'text' | 'form', content: any}[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [formInput, setFormInput] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleDeepResearch = () => {
    if (!url.trim()) return;
    setIsChatMode(true);
    setMessages([{ role: 'user', type: 'text', content: url }]);
    setLoading(true);

    // Simulate AI typing and responding with the first step
    setTimeout(() => {
      setLoading(false);
      setMessages(prev => [
        ...prev,
        { 
          role: 'bot', 
          type: 'text', 
          content: 'Hi there! 👋 I am your autonomous AI media buyer. I just analyzed your page. To get started, what is the primary goal of this campaign?' 
        },
        {
          role: 'bot',
          type: 'form',
          content: {
            step: 'goal',
            options: ['Drive Sales', 'Generate Leads', 'Brand Awareness', 'Website Traffic']
          }
        }
      ]);
    }, 1500);
  };

  const handleGoalSelection = (goal: string) => {
    setMessages(prev => [...prev, { role: 'user', type: 'text', content: goal }]);
    setLoading(true);
    
    // Simulate Next Step -> Audience & Strategy
    setTimeout(() => {
      setLoading(false);
      setMessages(prev => [
        ...prev,
        { 
          role: 'bot', 
          type: 'text', 
          content: `Great choice! Targeting "${goal}" allows me to optimize for high-intent actions. Here is the recommended target audience based on your page content:` 
        },
        {
          role: 'bot',
          type: 'form',
          content: {
            step: 'audience',
            data: {
              locations: 'United States, Canada',
              age: '18 - 45',
              interests: 'Technology, Software, Business'
            }
          }
        }
      ]);
    }, 1500);
  };

  const handleAudienceConfirm = () => {
    setMessages(prev => [...prev, { role: 'user', type: 'text', content: 'Looks Good, Proceed' }]);
    setLoading(true);

    // Simulate Next Step -> Budget & Launch
    setTimeout(() => {
      setLoading(false);
      setMessages(prev => [
        ...prev,
        { 
          role: 'bot', 
          type: 'text', 
          content: 'Perfect. Finally, what is your daily budget for this campaign?' 
        },
        {
          role: 'bot',
          type: 'form',
          content: {
            step: 'budget'
          }
        }
      ]);
    }, 1500);
  };

  const TopHeader = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', zIndex: 50, borderBottom: '1px solid #f1f5f9' }}>
      <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#7c3aed', textDecoration: 'none', fontWeight: 600 }}>
        📖 How to use?
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input 
          disabled 
          value={url} 
          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: '0.85rem', width: '300px' }}
        />
        <button 
          onClick={() => { setIsChatMode(false); setUrl(''); setMessages([]); }}
          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}
        >
          Resubmit URL
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: isChatMode ? '#f8fafc' : 'linear-gradient(135deg, #f0f0ff 0%, #e8e8ff 40%, #f5f0ff 100%)', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: isChatMode ? 'flex-start' : 'center', 
      position: 'relative', 
      paddingTop: isChatMode ? '80px' : '0' 
    }}>
      
      {!isChatMode && (
        <>
          <div style={{ position: 'absolute', top: '20px', left: '24px' }}>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#7c3aed', textDecoration: 'none', fontWeight: 500 }}>
              📖 How to use?
            </a>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', maxWidth: '800px', padding: '0 24px', width: '100%' }}>
            {/* Avatar Row */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '-8px', marginBottom: '28px' }}>
              {['🤖', '👩🏻', '👨🏼', '👩🏽', '👨🏾', '👩🏿'].map((emoji, i) => (
                <div key={i} style={{
                  width: '52px', height: '52px', borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : `hsl(${i * 45}, 60%, 85%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i === 0 ? '1.4rem' : '1.2rem',
                  marginLeft: i === 0 ? 0 : '-10px', border: '2.5px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  position: 'relative', zIndex: 10 - i, transition: 'transform 0.2s',
                }}>{emoji}</div>
              ))}
            </div>

            {/* Heading */}
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1e1b4b', marginBottom: '14px', lineHeight: 1.2, fontFamily: 'Outfit' }}>
              <span style={{ color: '#7c3aed' }}>Which page</span> would you like to promote?
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#64748b', marginBottom: '40px', lineHeight: 1.6 }}>
              No landing page? No problem — you can use a social media page or any page that<br />
              shows your product. Paste your link below to get started.
            </p>

            {/* URL Input + Button */}
            <div style={{ display: 'flex', gap: '12px', maxWidth: '650px', margin: '0 auto' }}>
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleDeepResearch()}
                placeholder="Please enter page url"
                disabled={loading}
                style={{
                  flex: 1, padding: '16px 24px', borderRadius: '99px', border: '1.5px solid #cbd5e1',
                  fontSize: '1rem', color: '#374151', outline: 'none', background: '#f8fafc',
                  transition: 'border-color 0.3s'
                }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#cbd5e1'}
              />
              <button
                onClick={handleDeepResearch}
                disabled={loading || !url}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 36px',
                  borderRadius: '99px', background: 'linear-gradient(135deg, #1e1b4b 0%, #3b0764 100%)',
                  color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
                  whiteSpace: 'nowrap', boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                }}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                Deep Research
              </button>
            </div>
          </motion.div>
        </>
      )}

      {isChatMode && (
        <>
          <TopHeader />
          <div style={{ width: '100%', maxWidth: '800px', padding: '24px', paddingBottom: '120px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ 
                    display: 'flex', 
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    width: '100%'
                  }}
                >
                  {msg.type === 'text' && (
                    <div style={{ 
                      background: msg.role === 'user' ? '#d8b4fe' : '#fff',
                      color: msg.role === 'user' ? '#4c1d95' : '#1e293b',
                      padding: '16px 20px',
                      borderRadius: msg.role === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                      maxWidth: '75%',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      border: msg.role === 'bot' ? '1px solid #f1f5f9' : 'none',
                      fontSize: '0.95rem',
                      lineHeight: 1.6
                    }}>
                      {msg.content}
                    </div>
                  )}

                  {msg.type === 'form' && msg.content.step === 'goal' && (
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '24px 24px 24px 4px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', width: '100%', maxWidth: '400px' }}>
                      <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: '#1e293b' }}>Select Campaign Goal</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {msg.content.options.map((opt: string) => (
                          <button 
                            key={opt}
                            onClick={() => handleGoalSelection(opt)}
                            style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#334155', fontWeight: 600, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = '#f3e8ff'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.type === 'form' && msg.content.step === 'audience' && (
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '24px 24px 24px 4px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', width: '100%', maxWidth: '450px' }}>
                      <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: '#1e293b' }}>Targeting Summary</h4>
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                        <div><div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Locations</div><div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}>{msg.content.data.locations}</div></div>
                        <div><div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Demographics</div><div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}>Age: {msg.content.data.age}</div></div>
                        <div><div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Interests</div><div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}>{msg.content.data.interests}</div></div>
                      </div>
                      <button onClick={handleAudienceConfirm} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1e293b', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                        Confirm Targeting
                      </button>
                    </div>
                  )}

                  {msg.type === 'form' && msg.content.step === 'budget' && (
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '24px 24px 24px 4px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', width: '100%', maxWidth: '350px' }}>
                      <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: '#1e293b' }}>Daily Budget</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>$</span>
                        <input type="number" defaultValue={50} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', fontSize: '1rem', fontWeight: 600, outline: 'none' }} />
                      </div>
                      <button style={{ width: '100%', padding: '14px', borderRadius: '8px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Sparkles size={16} /> Launch AI Campaign
                      </button>
                    </div>
                  )}

                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                  <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '24px 24px 24px 4px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#cbd5e1', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                    <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#cbd5e1', borderRadius: '50%', animation: 'pulse 1s infinite 0.2s' }} />
                    <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#cbd5e1', borderRadius: '50%', animation: 'pulse 1s infinite 0.4s' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Fixed Input at bottom (Visual only, as flow is guided by buttons) */}
          <div style={{ position: 'fixed', bottom: 0, left: 250, right: 0, padding: '24px', background: 'linear-gradient(to top, #f8fafc 80%, transparent)', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: '100%', maxWidth: '800px', display: 'flex', gap: '12px', pointerEvents: 'auto' }}>
              <input 
                disabled
                placeholder="Select an option above to proceed..."
                style={{ flex: 1, padding: '16px 24px', borderRadius: '99px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.95rem', color: '#94a3b8', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
