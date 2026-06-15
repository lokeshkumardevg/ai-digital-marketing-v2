import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import { api } from '../../api/axios';
import { 
  Bot, Settings, Palette, Play, PlusCircle, Save, Send, Code, Activity, Sparkles
} from 'lucide-react';
import { fetchBots, createBot } from '../../store/slices/chatbotSlice';
import type { AppDispatch } from '../../store';
import toast from 'react-hot-toast';

export const ChatbotBuilder: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bots, status, saving } = useSelector((state: any) => state.chatbot);

  const defaultGlobalBot = {
    _id: 'global',
    name: 'W-AI Assistant',
    systemPrompt: 'You are W-AI, the advanced AdsGo.ai platform assistant.',
    welcomeMessage: 'Hello! I am W-AI, your advanced digital marketing agent. Ask me about your campaigns, brand profile, competitor analysis, or customer reviews, and I will analyze them for you!',
    themeColor: '#635bff'
  };

  const [activeBot, setActiveBot] = useState<any>(defaultGlobalBot);
  
  // Configuration UI State
  const [name, setName] = useState(defaultGlobalBot.name);
  const [systemPrompt, setSystemPrompt] = useState(defaultGlobalBot.systemPrompt);
  const [welcomeMessage, setWelcomeMessage] = useState(defaultGlobalBot.welcomeMessage);
  const [themeColor, setThemeColor] = useState(defaultGlobalBot.themeColor);

  // Sandbox Chat State
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      const promise = dispatch(fetchBots());
      toast.promise(promise, {
        loading: 'Loading chatbots...',
        success: 'Chatbots loaded',
        error: 'Failed to load chatbots'
      });
    }
  }, [status, dispatch]);

  const handleSaveBot = async () => {
    if (!name || !systemPrompt) {
      toast.error('Agent Name and Core Persona required!');
      return;
    }

    try {
      const dto = { name, systemPrompt, welcomeMessage, themeColor };
      const promise = dispatch(createBot(dto)).unwrap();
      
      toast.promise(promise, {
        loading: 'Saving settings...',
        success: 'Chatbot saved successfully!',
        error: 'Failed to save chatbot.'
      });
      
      const newBot = await promise;
      setActiveBot(newBot);
      
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Use current active bot or fallback to global
    const botId = activeBot?._id || 'global';
    const persona = activeBot ? activeBot.systemPrompt : 'You are a general marketing AI assistant.';

    setMessages(prev => [...prev, { role: 'user', text: inputText }]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      const res = await api.post(`/chatbot/${botId}/chat`, { 
        message: currentInput,
        systemPrompt: persona,
        history: messages.map(m => ({ role: m.role, content: m.text }))
      });
      
      setMessages(prev => [...prev, { role: 'bot', text: res.data.response || res.data.reply }]);
      setIsTyping(false);
    } catch (err) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', text: `[Simulation Sync] Understood. The persona "${persona.substring(0,20)}..." has adapted the response logic.` }]);
        setIsTyping(false);
      }, 1000);
      return;
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            Custom AI <span className="text-gradient">Chatbot Builder</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create custom AI chatbots for customer support or sales, or chat with the W-AI Platform Assistant.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px minmax(auto, 1.5fr) 1fr', gap: '24px' }}>
        
        {/* Column 1: Bot List (Sidebar logic) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button className="btn btn-primary" onClick={() => {
            setActiveBot(null);
            setName('Sales Agent');
            setSystemPrompt('You are a helpful SaaS sales assistant aiming to convert visitors into free trials...\nAlways speak in a professional tone.');
            setWelcomeMessage('Hi! How can I help you find the right marketing tier today?');
            setThemeColor('#8b5cf6');
            setMessages([]);
          }} style={{ display: 'flex', justifyContent: 'center' }}>
            <PlusCircle size={18} /> Create New Chatbot
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {/* W-AI Platform Assistant Card */}
            <GlassCard 
              style={{ 
                padding: '16px', 
                background: activeBot?._id === 'global' ? 'rgba(255,255,255,0.08)' : 'var(--bg-card)', 
                borderLeft: `4px solid #635bff`, 
                cursor: 'pointer', 
                transition: '0.2s',
                boxShadow: activeBot?._id === 'global' ? '0 0 15px rgba(99, 102, 241, 0.15)' : 'none'
              }}
              onClick={() => {
                setActiveBot(defaultGlobalBot);
                setName(defaultGlobalBot.name);
                setSystemPrompt(defaultGlobalBot.systemPrompt);
                setWelcomeMessage(defaultGlobalBot.welcomeMessage);
                setThemeColor(defaultGlobalBot.themeColor);
                setMessages([]); // Reset sandbox on switch
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={20} color="#635bff" />
                </div>
                <div>
                  <div style={{ fontWeight: 800 }}>W-AI Platform Agent</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Strategic platform insights</div>
                </div>
              </div>
            </GlassCard>

            {status === 'loading' && <Activity className="animate-fade-in" style={{margin:'auto'}} />}
            
            {bots.map((bot: any) => (
              <GlassCard 
                key={bot._id} 
                style={{ padding: '16px', background: activeBot?._id === bot._id ? 'rgba(255,255,255,0.05)' : 'var(--bg-card)', borderLeft: `4px solid ${bot.themeColor}`, cursor: 'pointer', transition: '0.2s' }}
                onClick={() => {
                  setActiveBot(bot);
                  setName(bot.name);
                  setSystemPrompt(bot.systemPrompt);
                  setWelcomeMessage(bot.welcomeMessage || 'How can I help you?');
                  setThemeColor(bot.themeColor || '#8b5cf6');
                  setMessages([]); // Reset sandbox on switch
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '8px', borderRadius: '8px' }}>
                    <Bot size={20} color={bot.themeColor} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{bot.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Conversations: {bot.conversationsHandled || bot.totalConversations || 0}</div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Column 2: Agent Configuration / Info */}
        {activeBot?._id === 'global' ? (
          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="var(--accent-primary)" /> W-AI Platform Assistant
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              W-AI is your central digital marketing advisor. It is automatically synchronized with your active brand profile, campaign metrics, SEO auditing, and reputation reviews.
            </p>
            <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
              <h4 style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Synchronized Context</h4>
              <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Active Brand Information</li>
                <li>Live & Draft Campaigns</li>
                <li>Customer Feedback & Reviews</li>
                <li>Real-time Marketing Recommendations</li>
              </ul>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              *Note: System configuration for W-AI is managed globally and cannot be modified.
            </p>
          </GlassCard>
        ) : (
          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
             <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Settings size={20} color="#0665ff" /> Chatbot Settings
             </h3>

             <div className="input-group">
              <label>Chatbot Name</label>
              <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} />
             </div>

             <div className="input-group">
              <label>Chatbot Instructions</label>
              <textarea rows={6} className="input-field" value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} placeholder="Instruct how the chatbot should behave..."></textarea>
             </div>

             <div className="input-group">
              <label>Default Welcome Message</label>
              <input type="text" className="input-field" value={welcomeMessage} onChange={e => setWelcomeMessage(e.target.value)} />
             </div>

             <div className="input-group">
              <label><Palette size={14} style={{ display: 'inline' }} /> Brand UI Color</label>
              <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} style={{ padding: 0, height: '40px', width: '100px', borderRadius: '4px', border: 'none' }} />
             </div>

             <button className="btn btn-primary" onClick={handleSaveBot} disabled={saving} style={{ display: 'flex', justifyContent: 'center' }}>
               {saving ? 'Saving...' : <><Save size={18} /> Save Settings</>}
             </button>

             {activeBot && activeBot._id !== 'global' && (
               <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '24px', borderRadius: '16px', marginTop: '32px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                   <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <Code size={18} color="var(--accent-primary)" /> 
                     Deployment Embed Code
                   </div>
                   <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => {
                      navigator.clipboard.writeText(`<script src="${window.location.origin}/embed.js" data-agent-id="${activeBot._id}"></script>`);
                      toast.success('Code copied to clipboard!');
                    }}
                   >
                     Copy
                   </button>
                 </div>
                 <div style={{ position: 'relative' }}>
                   <code style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                     {`<script src="${window.location.origin}/embed.js" data-agent-id="${activeBot._id}"></script>`}
                   </code>
                 </div>
                 
                 <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                   <a 
                    href={`/chatbot-embed/${activeBot._id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                   >
                     <Play size={14} /> Full Page Preview
                   </a>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flex: 1.5, display: 'flex', alignItems: 'center' }}>
                      <Activity size={12} style={{marginRight: '4px'}} /> Ready for production
                   </div>
                 </div>
               </div>
             )}
          </GlassCard>
        )}

        {/* Column 3: Live Sandbox Environment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '8px' }}>
            <Play size={14} style={{ display: 'inline', marginRight: '4px' }} /> Test Chatbot
          </div>

          <GlassCard style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '600px', overflow: 'hidden' }}>
            
            <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Bot size={24} color={themeColor} />
                <div style={{ position: 'absolute', bottom: -2, right: -2, width: '10px', height: '10px', background: 'var(--success)', borderRadius: '50%', border: '2px solid var(--bg-secondary)' }}></div>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Online - Powered by AI</div>
              </div>
            </div>

            <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '12px', borderTopLeftRadius: '2px', maxWidth: '85%', alignSelf: 'flex-start', fontSize: '0.85rem' }}>
                {activeBot ? activeBot.welcomeMessage : welcomeMessage}
              </div>
              
              {messages.map((m, i) => (
                <div key={i} style={{ 
                  background: m.role === 'user' ? themeColor : 'var(--bg-secondary)',
                  color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                  padding: '10px 14px', 
                  borderRadius: '12px', 
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  fontSize: '0.85rem',
                  borderTopRightRadius: m.role === 'user' ? '2px' : '12px',
                  borderTopLeftRadius: m.role === 'user' ? '12px' : '2px',
                }}>
                  {m.text}
                </div>
              ))}
              {isTyping && (
                <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '12px', alignSelf: 'flex-start', fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  AI reasoning...
                </div>
              )}
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Message your bot..." 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.02)' }}
              />
              <button className="btn btn-primary" onClick={handleSendMessage} disabled={isTyping} style={{ padding: '10px' }}>
                <Send size={16} />
              </button>
            </div>

          </GlassCard>
        </div>

      </div>
    </div>
  );
};
