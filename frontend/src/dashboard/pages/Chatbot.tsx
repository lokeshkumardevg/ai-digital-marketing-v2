import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import { api } from '../../api/axios';
import {
  Bot, Settings, Palette, Play, PlusCircle, Save, Send, Code, Activity, Sparkles,
  Phone, Copy, ExternalLink, Globe, Check, Zap, MessageCircle, X, ChevronRight,
  Star, Shield, Cpu, Eye, BarChart2, RefreshCw
} from 'lucide-react';
import { fetchBots, createBot } from '../../store/slices/chatbotSlice';
import type { AppDispatch } from '../../store';
import toast from 'react-hot-toast';
import { SectionLoader } from '../components/Loader';

/* ─── Types ─────────────────────────────────────────────────── */
type Mode = 'web' | 'whatsapp';
type ChatMsg = { role: 'user' | 'bot'; text: string };

/* ─── Main Component ────────────────────────────────────────── */
export const ChatbotBuilder: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bots, status, saving } = useSelector((state: any) => state.chatbot);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [activeMode, setActiveMode] = useState<Mode>('web');

  const defaultGlobalBot = {
    _id: 'global',
    name: 'W-AI Assistant',
    systemPrompt: 'You are W-AI, the advanced Wheedle.ai platform assistant.',
    welcomeMessage: 'Hello! I am W-AI, your advanced digital marketing agent. Ask me about your campaigns, brand profile, competitor analysis, or customer reviews!',
    themeColor: '#0665ff',
  };

  const [activeBot, setActiveBot] = useState<any>(defaultGlobalBot);
  const [name, setName] = useState(defaultGlobalBot.name);
  const [systemPrompt, setSystemPrompt] = useState(defaultGlobalBot.systemPrompt);
  const [welcomeMessage, setWelcomeMessage] = useState(defaultGlobalBot.welcomeMessage);
  const [themeColor, setThemeColor] = useState(defaultGlobalBot.themeColor);
  const [isCreating, setIsCreating] = useState(false);

  // WhatsApp State
  const [waPhone, setWaPhone] = useState('+919876543210');
  const [waTitle, setWaTitle] = useState('AI WhatsApp Assistant');
  const [waSubtitle, setWaSubtitle] = useState('Online | Replies instantly');
  const [waGreeting, setWaGreeting] = useState('Hi there! 👋 How can our AI assistant help your business today?');
  const [waPosition, setWaPosition] = useState<'right' | 'left'>('right');
  const [waColor, setWaColor] = useState('#25D366');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [waPreviewOpen, setWaPreviewOpen] = useState(true);

  // Sandbox Chat State
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchBots());
  }, [status, dispatch]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const selectBot = (bot: any) => {
    setActiveBot(bot);
    setName(bot.name);
    setSystemPrompt(bot.systemPrompt);
    setWelcomeMessage(bot.welcomeMessage || 'How can I help you?');
    setThemeColor(bot.themeColor || '#0665ff');
    setMessages([]);
    setIsCreating(false);
  };

  const startCreateNew = () => {
    setActiveBot(null);
    setIsCreating(true);
    setName('New Sales Agent');
    setSystemPrompt('You are a helpful SaaS sales assistant aiming to convert visitors into free trials.\nAlways speak in a professional tone.');
    setWelcomeMessage('Hi! How can I help you find the right marketing plan today?');
    setThemeColor('#0665ff');
    setMessages([]);
  };

  const handleSaveBot = async () => {
    if (!name || !systemPrompt) {
      toast.error('Agent Name and Core Persona are required!');
      return;
    }
    try {
      const dto = { name, systemPrompt, welcomeMessage, themeColor };
      const newBot = await dispatch(createBot(dto)).unwrap();
      toast.success('Chatbot saved successfully!');
      setActiveBot(newBot);
      setIsCreating(false);
    } catch {
      toast.error('Failed to save chatbot.');
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const botId = activeBot?._id || 'global';
    const persona = activeBot?.systemPrompt || 'You are a general marketing AI assistant.';
    setMessages(prev => [...prev, { role: 'user', text: inputText }]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);
    try {
      const res = await api.post(`/chatbot/${botId}/chat`, {
        message: currentInput,
        history: messages.map(m => ({ role: m.role, content: m.text })),
        persona: botId === 'global' ? undefined : persona,
      });
      setMessages(prev => [...prev, { role: 'bot', text: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: "I'm having trouble right now. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const cleanPhone = waPhone.replace(/[^0-9]/g, '');
  const waEmbedSnippet = `<script src="${window.location.origin}/whatsapp-widget.js"\n  data-phone="${cleanPhone}"\n  data-title="${waTitle}"\n  data-subtitle="${waSubtitle}"\n  data-greeting="${waGreeting}"\n  data-position="${waPosition}"\n  data-color="${waColor}">\n</script>`;
  const waDirectUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waGreeting)}`;

  const copyWaEmbed = () => { navigator.clipboard.writeText(waEmbedSnippet); setCopiedSnippet(true); toast.success('Embed code copied!'); setTimeout(() => setCopiedSnippet(false), 2500); };
  const copyWaLink = () => { navigator.clipboard.writeText(waDirectUrl); setCopiedLink(true); toast.success('Direct link copied!'); setTimeout(() => setCopiedLink(false), 2500); };

  /* ── Shared active bot name for sandbox header ── */
  const activeName = isCreating ? name : (activeBot?.name || name);
  const activeColor = isCreating ? themeColor : (activeBot?.themeColor || themeColor);
  const activeWelcome = isCreating ? welcomeMessage : (activeBot?.welcomeMessage || welcomeMessage);

  return (
    <div style={{ paddingBottom: '48px' }}>

      {/* ── Hero Header ─────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6,101,255,0.12) 0%, rgba(34,211,238,0.06) 50%, transparent 100%)',
        border: '1px solid var(--glass-border)',
        borderRadius: '20px',
        padding: '28px 32px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* bg glow */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,101,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #0665ff, #22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(6,101,255,0.4)' }}>
                <Bot size={22} color="#fff" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  AI Chatbot &amp; <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>WhatsApp Widget</span>
                </h1>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Build AI-powered chat agents & deploy floating WhatsApp widgets to capture leads 24/7</p>
              </div>
            </div>
            {/* Stats row */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
              {[
                { icon: <Bot size={13} />, label: `${bots.length + 1} Active Agents` },
                { icon: <MessageCircle size={13} />, label: 'Live Chat Sandbox' },
                { icon: <Zap size={13} />, label: 'WhatsApp Ready' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ color: '#0665ff' }}>{s.icon}</span>{s.label}
                </div>
              ))}
            </div>
          </div>

          {/* Mode Tabs */}
          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-elevated)', padding: '5px', borderRadius: '12px', border: '1px solid var(--glass-border)', alignSelf: 'flex-start' }}>
            {[
              { mode: 'web' as Mode, icon: <Globe size={14} />, label: 'Web Chatbot', color: '#0665ff' },
              { mode: 'whatsapp' as Mode, icon: <Phone size={14} />, label: 'WhatsApp Widget', color: '#25D366', badge: 'LIVE' },
            ].map(tab => (
              <button key={tab.mode} onClick={() => setActiveMode(tab.mode)} style={{
                display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '9px',
                border: activeMode === tab.mode ? `1px solid ${tab.color}40` : '1px solid transparent',
                background: activeMode === tab.mode ? `${tab.color}22` : 'transparent',
                color: activeMode === tab.mode ? tab.color : 'var(--text-secondary)',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}>
                {tab.icon} {tab.label}
                {tab.badge && <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '8px', background: tab.color, color: '#000', fontWeight: 800 }}>{tab.badge}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          MODE 1: WEB CHATBOT BUILDER
      ───────────────────────────────────────────────────── */}
      {activeMode === 'web' && (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 360px', gap: '20px', alignItems: 'start' }}>

          {/* Column 1: Bot List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Create New Button */}
            <button onClick={startCreateNew} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '11px 16px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #0665ff, #0284c7)',
              color: '#fff', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700,
              boxShadow: '0 4px 16px rgba(6,101,255,0.35)',
              transition: 'all 0.2s',
            }}>
              <PlusCircle size={16} /> Create New Chatbot
            </button>

            {/* Loading state */}
            {status === 'loading' && <SectionLoader message="Loading chatbots..." />}

            {/* W-AI Platform Assistant (pinned) */}
            <div
              onClick={() => selectBot(defaultGlobalBot)}
              style={{
                padding: '14px', borderRadius: '14px',
                background: activeBot?._id === 'global' && !isCreating ? 'rgba(6,101,255,0.12)' : 'var(--bg-card)',
                border: activeBot?._id === 'global' && !isCreating ? '1px solid rgba(6,101,255,0.4)' : '1px solid var(--glass-border)',
                borderLeft: '3px solid #0665ff',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, rgba(6,101,255,0.2), rgba(34,211,238,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={16} color="#0665ff" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>W-AI Platform Agent</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Global assistant</div>
                </div>
                {activeBot?._id === 'global' && !isCreating && <ChevronRight size={14} style={{ marginLeft: 'auto', color: '#0665ff', flexShrink: 0 }} />}
              </div>
            </div>

            {/* Divider */}
            {bots.length > 0 && (
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', color: 'var(--text-dim)', textTransform: 'uppercase', padding: '4px 4px 0' }}>Your Agents</div>
            )}

            {/* Saved Bots */}
            {bots.map((bot: any) => (
              <div
                key={bot._id}
                onClick={() => selectBot(bot)}
                style={{
                  padding: '14px', borderRadius: '14px',
                  background: activeBot?._id === bot._id && !isCreating ? 'rgba(255,255,255,0.05)' : 'var(--bg-card)',
                  border: activeBot?._id === bot._id && !isCreating ? `1px solid ${bot.themeColor}55` : '1px solid var(--glass-border)',
                  borderLeft: `3px solid ${bot.themeColor || '#0665ff'}`,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: `${bot.themeColor || '#0665ff'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={16} color={bot.themeColor || '#0665ff'} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bot.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{bot.conversationsHandled || 0} conversations</div>
                  </div>
                  {activeBot?._id === bot._id && !isCreating && <ChevronRight size={14} style={{ marginLeft: 'auto', color: bot.themeColor, flexShrink: 0 }} />}
                </div>
              </div>
            ))}
          </div>

          {/* Column 2: Configuration Panel */}
          <div>
            {/* Global Bot Info Panel */}
            {activeBot?._id === 'global' && !isCreating && (
              <GlassCard style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'linear-gradient(135deg, rgba(6,101,255,0.2), rgba(34,211,238,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={22} color="#0665ff" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>W-AI Platform Assistant</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Always-on · Globally synced</div>
                  </div>
                </div>

                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '20px' }}>
                  W-AI is your central digital marketing advisor — automatically synchronized with your active brand profile, campaign metrics, SEO auditing, and reputation reviews.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  {[
                    { icon: <Shield size={14} />, title: 'Brand Context', desc: 'Active brand info & website data' },
                    { icon: <BarChart2 size={14} />, title: 'Campaign Sync', desc: 'Live & draft campaign metrics' },
                    { icon: <Star size={14} />, title: 'Reputation Intel', desc: 'Customer feedback & reviews' },
                    { icon: <Cpu size={14} />, title: 'AI Recommendations', desc: 'Real-time marketing insights' },
                  ].map((f, i) => (
                    <div key={i} style={{ padding: '14px', borderRadius: '12px', background: 'rgba(6,101,255,0.06)', border: '1px solid rgba(6,101,255,0.12)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0665ff', marginBottom: '6px', fontWeight: 700, fontSize: '12px' }}>
                        {f.icon} {f.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{f.desc}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  ℹ️ W-AI configuration is globally managed and cannot be modified from this panel.
                </div>
              </GlassCard>
            )}

            {/* Create / Edit Bot Panel */}
            {(isCreating || (activeBot && activeBot._id !== 'global')) && (
              <GlassCard style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${themeColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${themeColor}44` }}>
                    <Settings size={20} color={themeColor} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>{isCreating ? 'Create New Chatbot Agent' : 'Edit Agent Configuration'}</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Configure persona, instructions & branding</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Agent Name *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Sales Assistant, Support Bot..."
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* System Prompt */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      AI Persona & Instructions *
                    </label>
                    <textarea
                      rows={6}
                      className="input-field"
                      value={systemPrompt}
                      onChange={e => setSystemPrompt(e.target.value)}
                      placeholder="Describe how the chatbot should behave, what topics to focus on, tone of voice..."
                      style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.6 }}
                    />
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '5px' }}>
                      Be specific about tone, use cases, and what the bot should or shouldn't discuss.
                    </div>
                  </div>

                  {/* Welcome Message */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Welcome Message
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={welcomeMessage}
                      onChange={e => setWelcomeMessage(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Theme Color */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <Palette size={12} style={{ display: 'inline', marginRight: '4px' }} /> Brand Accent Color
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="color"
                        value={themeColor}
                        onChange={e => setThemeColor(e.target.value)}
                        style={{ width: '52px', height: '44px', padding: '4px', borderRadius: '8px', border: '1px solid var(--glass-border)', cursor: 'pointer', background: 'var(--bg-card)' }}
                      />
                      <div style={{ padding: '8px 16px', borderRadius: '8px', background: themeColor, color: '#fff', fontSize: '12px', fontWeight: 700 }}>
                        Preview
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{themeColor}</div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveBot}
                  disabled={saving}
                  style={{
                    marginTop: '24px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '13px', borderRadius: '12px',
                    background: saving ? 'rgba(6,101,255,0.5)' : 'linear-gradient(135deg, #0665ff, #0284c7)',
                    color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: '14px', fontWeight: 700,
                    boxShadow: '0 4px 16px rgba(6,101,255,0.35)',
                    transition: 'all 0.2s',
                  }}
                >
                  {saving ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={16} /> Save Agent</>}
                </button>

                {/* Embed Code (after save) */}
                {activeBot && activeBot._id !== 'global' && !isCreating && (
                  <div style={{ marginTop: '24px', padding: '20px', borderRadius: '14px', background: 'rgba(6,101,255,0.05)', border: '1px solid rgba(6,101,255,0.15)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                        <Code size={16} color="#0665ff" /> Deployment Embed Code
                      </div>
                      <button
                        onClick={() => { navigator.clipboard.writeText(`<script src="${window.location.origin}/embed.js" data-agent-id="${activeBot._id}"></script>`); toast.success('Code copied!'); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(6,101,255,0.15)', border: '1px solid rgba(6,101,255,0.3)', color: '#0665ff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <Copy size={13} /> Copy
                      </button>
                    </div>
                    <code style={{ display: 'block', fontSize: '11.5px', color: '#22d3ee', background: 'rgba(0,0,0,0.35)', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {`<script src="${window.location.origin}/embed.js" data-agent-id="${activeBot._id}"></script>`}
                    </code>
                    <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                      <a
                        href={`/chatbot-embed/${activeBot._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
                      >
                        <Eye size={14} /> Preview Bot
                      </a>
                      <div style={{ flex: 1.5, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#22c55e' }}>
                        <Activity size={13} /> Ready for production
                      </div>
                    </div>
                  </div>
                )}
              </GlassCard>
            )}
          </div>

          {/* Column 3: Live Chat Sandbox */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Play size={12} color="#22d3ee" /> Live Test Sandbox
            </div>

            <div style={{ borderRadius: '18px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', height: '620px' }}>

              {/* Chat Header */}
              <div style={{ padding: '14px 18px', background: `linear-gradient(135deg, ${activeColor}22, ${activeColor}0a)`, borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${activeColor}30`, border: `2px solid ${activeColor}66`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={18} color={activeColor} />
                  </div>
                  <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, background: '#22c55e', borderRadius: '50%', border: '2px solid var(--bg-card)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{activeName}</div>
                  <div style={{ fontSize: '11px', color: '#22c55e' }}>● Online · AI Powered</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', background: 'var(--bg-primary)' }}>

                {/* Welcome bubble */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${activeColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={14} color={activeColor} />
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: '16px', borderBottomLeftRadius: '4px', maxWidth: '80%', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, border: '1px solid var(--glass-border)' }}>
                    {activeWelcome}
                  </div>
                </div>

                {messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                    {m.role === 'bot' && (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${activeColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Bot size={14} color={activeColor} />
                      </div>
                    )}
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: '16px',
                      borderBottomRightRadius: m.role === 'user' ? '4px' : '16px',
                      borderBottomLeftRadius: m.role === 'bot' ? '4px' : '16px',
                      maxWidth: '80%',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      background: m.role === 'user' ? activeColor : 'var(--bg-card)',
                      color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                      border: m.role === 'bot' ? '1px solid var(--glass-border)' : 'none',
                    }}>
                      {m.text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${activeColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bot size={14} color={activeColor} />
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: '4px', border: '1px solid var(--glass-border)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {[0, 1, 2].map(d => (
                        <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: activeColor, opacity: 0.7, animation: `pulse 1.2s ease-in-out ${d * 0.2}s infinite` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Bar */}
              <div style={{ padding: '12px', borderTop: '1px solid var(--glass-border)', background: 'var(--bg-card)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Type a test message..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !isTyping && handleSendMessage()}
                  style={{ flex: 1, padding: '10px 14px', fontSize: '13px', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isTyping || !inputText.trim()}
                  style={{
                    width: 40, height: 40, borderRadius: '10px', border: 'none', cursor: isTyping || !inputText.trim() ? 'not-allowed' : 'pointer',
                    background: isTyping || !inputText.trim() ? 'rgba(6,101,255,0.3)' : activeColor,
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s', flexShrink: 0,
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>

            {/* Hint */}
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.5 }}>
              💡 Test messages are sent to the real AI backend. Select different bots from the list to compare responses.
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
          MODE 2: WHATSAPP AI WIDGET BUILDER
      ───────────────────────────────────────────────────── */}
      {activeMode === 'whatsapp' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.85fr)', gap: '24px', alignItems: 'start' }}>

          {/* Left: Configuration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <GlassCard style={{ padding: '28px' }}>
              {/* Section Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ width: 46, height: 46, borderRadius: '12px', background: 'rgba(37,211,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(37,211,102,0.3)' }}>
                  <Phone size={22} color="#25D366" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>WhatsApp AI Widget Generator</h3>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Deploy an AI-powered floating WhatsApp button to capture leads 24/7</p>
                </div>
              </div>

              {/* Fields Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>WhatsApp Number *</label>
                  <input type="text" className="input-field" placeholder="+91 98765 43210" value={waPhone} onChange={e => setWaPhone(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Widget Header Title</label>
                  <input type="text" className="input-field" placeholder="AI WhatsApp Assistant" value={waTitle} onChange={e => setWaTitle(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Online Subtitle</label>
                  <input type="text" className="input-field" placeholder="Online | Replies instantly" value={waSubtitle} onChange={e => setWaSubtitle(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Widget Position</label>
                  <select className="input-field" value={waPosition} onChange={(e: any) => setWaPosition(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }}>
                    <option value="right">Bottom Right (Recommended)</option>
                    <option value="left">Bottom Left</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pre-filled Greeting Message</label>
                <textarea rows={3} className="input-field" placeholder="Hi there! 👋 I would like to know more about your AI marketing services." value={waGreeting} onChange={e => setWaGreeting(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>

              {/* Color Picker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '14px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Button Color</label>
                  <input type="color" value={waColor} onChange={e => setWaColor(e.target.value)} style={{ width: '52px', height: '40px', padding: '4px', borderRadius: '8px', border: '1px solid var(--glass-border)', cursor: 'pointer', background: 'none' }} />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Tip:</strong> Use <code style={{ background: 'rgba(37,211,102,0.15)', padding: '2px 6px', borderRadius: '4px', color: '#25D366' }}>#25D366</code> for authentic WhatsApp look that customers recognise and trust most.
                </div>
              </div>

              {/* Embed Code */}
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: '14px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#25D366', display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Code size={16} /> 1-Click Embed Snippet
                  </div>
                  <button onClick={copyWaEmbed} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '8px', background: 'rgba(37,211,102,0.2)', border: '1px solid rgba(37,211,102,0.4)', color: '#25D366', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    {copiedSnippet ? <Check size={14} /> : <Copy size={14} />} {copiedSnippet ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <pre style={{ margin: 0, padding: '14px', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', color: '#22d3ee', fontSize: '11.5px', overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontFamily: 'monospace' }}>
                  {waEmbedSnippet}
                </pre>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '10px', lineHeight: 1.5 }}>
                  Paste right before the closing <code>&lt;/body&gt;</code> tag — works on WordPress, Shopify, Next.js, HTML, Wix, and any platform.
                </div>
              </div>

              {/* Links */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button onClick={copyWaLink} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  <Copy size={14} /> {copiedLink ? 'Copied!' : 'Copy wa.me Link'}
                </button>
                <a href={waDirectUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', borderRadius: '10px', background: '#25D366', color: '#000', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                  <ExternalLink size={14} /> Test in WhatsApp
                </a>
              </div>
            </GlassCard>
          </div>

          {/* Right: Live Preview */}
          <div>
            <GlassCard style={{ padding: '20px', position: 'sticky', top: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Eye size={16} color="#25D366" /> Live Widget Preview
                <span style={{ marginLeft: 'auto', fontSize: '10px', padding: '3px 8px', borderRadius: '8px', background: 'rgba(37,211,102,0.2)', color: '#25D366', fontWeight: 800 }}>REAL-TIME</span>
              </div>

              {/* Mock Browser Window */}
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: '14px', height: '500px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Browser Chrome */}
                <div style={{ background: 'var(--bg-card)', padding: '10px 14px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {['#ef4444', '#f59e0b', '#22c55e'].map((c, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
                  </div>
                  <div style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: '6px', padding: '4px 10px', fontSize: '10px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Globe size={9} /> yourwebsite.com
                  </div>
                </div>

                {/* Page Content Simulation */}
                <div style={{ flex: 1, padding: '20px', position: 'relative' }}>
                  <div style={{ opacity: 0.3 }}>
                    <div style={{ width: '55%', height: 12, background: 'var(--text-dim)', borderRadius: '4px', marginBottom: '10px' }} />
                    <div style={{ width: '80%', height: 8, background: 'var(--text-dim)', borderRadius: '4px', marginBottom: '8px' }} />
                    <div style={{ width: '65%', height: 8, background: 'var(--text-dim)', borderRadius: '4px', marginBottom: '8px' }} />
                    <div style={{ width: '45%', height: 8, background: 'var(--text-dim)', borderRadius: '4px', marginBottom: '20px' }} />
                    <div style={{ width: '100%', height: 80, background: 'var(--text-dim)', borderRadius: '8px', marginBottom: '16px', opacity: 0.5 }} />
                    <div style={{ width: '70%', height: 8, background: 'var(--text-dim)', borderRadius: '4px', marginBottom: '6px' }} />
                    <div style={{ width: '55%', height: 8, background: 'var(--text-dim)', borderRadius: '4px' }} />
                  </div>

                  {/* Widget positioned */}
                  <div style={{ position: 'absolute', bottom: 16, [waPosition]: 16, display: 'flex', flexDirection: 'column', alignItems: waPosition === 'left' ? 'flex-start' : 'flex-end', gap: '10px' }}>

                    {/* Popup Window */}
                    {waPreviewOpen && (
                      <div style={{ width: '250px', background: '#ffffff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.35)', animation: 'fadeIn 0.3s ease' }}>
                        {/* WA Header */}
                        <div style={{ background: waColor, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🤖</div>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{waTitle || 'AI Assistant'}</div>
                              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>{waSubtitle || 'Online'}</div>
                            </div>
                          </div>
                          <button onClick={() => setWaPreviewOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '16px', cursor: 'pointer', lineHeight: 1, padding: '2px' }}>✕</button>
                        </div>
                        {/* Chat area */}
                        <div style={{ background: '#e5ddd5', padding: '12px' }}>
                          <div style={{ background: '#fff', padding: '9px 12px', borderRadius: '10px', fontSize: '11px', color: '#111', lineHeight: 1.5, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                            {waGreeting || 'Hi there! How can we help?'}
                          </div>
                        </div>
                        {/* Input bar */}
                        <div style={{ padding: '8px 10px', background: '#f0f2f5', display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input readOnly placeholder="Type a message..." style={{ flex: 1, padding: '6px 10px', borderRadius: '14px', border: '1px solid #d1d5db', fontSize: '11px', background: '#fff', outline: 'none' }} />
                          <a href={waDirectUrl} target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28, borderRadius: '50%', background: waColor, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                            <Send size={12} color="#fff" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Floating Bubble */}
                    <div onClick={() => setWaPreviewOpen(!waPreviewOpen)} style={{ width: 50, height: 50, borderRadius: '50%', background: waColor, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 20px ${waColor}66`, cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }}>
                      <Phone size={22} color="#fff" />
                      {/* Pulse ring */}
                      <div style={{ position: 'absolute', inset: -5, borderRadius: '50%', border: `2px solid ${waColor}66`, animation: 'pulse 2s ease-in-out infinite' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '12px', background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.15)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <strong style={{ color: '#25D366' }}>💡 How it works:</strong> Visitors click the floating button to chat via WhatsApp. If Twilio or WhatsApp Business is configured in <strong>Messaging</strong>, automated AI replies handle queries 24/7.
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotBuilder;
