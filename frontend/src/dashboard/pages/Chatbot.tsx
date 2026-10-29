import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import { api } from '../../api/axios';
import {
  Bot, Settings, Palette, Play, PlusCircle, Save, Send, Code, Activity, Sparkles,
  Phone, Copy, ExternalLink, Globe, Check, Zap, MessageCircle, X, ChevronRight,
  Star, Shield, Cpu, Eye, BarChart2, RefreshCw, AlertTriangle, CheckCircle2,
  Layers, Smartphone, Laptop, HelpCircle, Info, Sliders, Lightbulb, ArrowUpRight,
  FileCode, CheckCheck, Terminal, BookOpen, Trash2, RotateCcw
} from 'lucide-react';
import { fetchBots, createBot, deleteBot } from '../../store/slices/chatbotSlice';
import type { AppDispatch } from '../../store';
import toast from 'react-hot-toast';
import { SectionLoader } from '../components/Loader';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

/* ─── Types ─────────────────────────────────────────────────── */
type Mode = 'web' | 'whatsapp';
type ChatMsg = { role: 'user' | 'bot'; text: string };
type PlatformTab = 'html' | 'nextjs' | 'wordpress' | 'shopify' | 'wix';

export interface SavedWaWidget {
  id: string;
  name: string;
  phone: string;
  title: string;
  subtitle: string;
  greeting: string;
  position: 'right' | 'left';
  color: string;
  createdAt: string;
}

export const DEFAULT_SAVED_WA_WIDGETS: SavedWaWidget[] = [
  {
    id: 'wa-leadgen-1',
    name: '🚀 Inbound Lead Generator',
    phone: '+919876543210',
    title: 'AI Sales Consultant',
    subtitle: 'Online | Instant Quote',
    greeting: 'Hi! 👋 I want to know more about your marketing services and get a tailored quotation.',
    position: 'right',
    color: '#25D366',
    createdAt: 'Default',
  },
  {
    id: 'wa-support-2',
    name: '🛠️ Customer Support Desk',
    phone: '+919876543210',
    title: 'Wheedle Support Desk',
    subtitle: 'Active | Typical reply <2m',
    greeting: 'Hello! I need quick assistance with my campaign or account configuration.',
    position: 'right',
    color: '#128C7E',
    createdAt: 'Default',
  },
];

/* ─── Presets & Suggestion Constants ────────────────────────── */
const WA_PRESETS = [
  {
    id: 'leadgen',
    badge: 'High Conversion',
    label: '🚀 Lead Capture',
    title: 'AI Sales Consultant',
    subtitle: 'Online | Instant Quote',
    greeting: 'Hi! 👋 I want to know more about your marketing services and get a tailored quotation.',
    color: '#25D366',
    desc: 'Best for agency & service websites looking to generate inbound leads.',
  },
  {
    id: 'support',
    badge: 'Fast Reply',
    label: '🛠️ Customer Support',
    title: 'Wheedle Support Desk',
    subtitle: 'Active | Typical reply <2m',
    greeting: 'Hello! I need quick assistance with my campaign or account configuration.',
    color: '#128C7E',
    desc: 'Reduces ticket response times with automated conversational routing.',
  },
  {
    id: 'demo',
    badge: 'Strategy Call',
    label: '📅 Book a Demo',
    title: 'VIP Booking Concierge',
    subtitle: 'Available Now | 24/7 AI',
    greeting: 'Hi there! I would like to schedule a 15-minute live platform walkthrough.',
    color: '#0665ff',
    desc: 'Directs prospects into qualifying calls and consultation bookings.',
  },
  {
    id: 'ecommerce',
    badge: 'Sales Assist',
    label: '🛍️ Offers & Orders',
    title: 'VIP Shopping Assistant',
    subtitle: 'Live Deals & Order Tracking',
    greeting: 'Hey! Are there any active discount codes or order status updates for me?',
    color: '#8b5cf6',
    desc: 'Engages store shoppers with discount codes and order support.',
  },
];

const TITLE_SUGGESTIONS = [
  'AI Sales Consultant',
  'Wheedle Support Desk',
  'Growth Marketing Specialist',
  'VIP Booking Assistant',
];

const SUBTITLE_SUGGESTIONS = [
  'Online | Replies instantly',
  'Typical reply: <2 mins',
  'Available 24/7',
  'AI Concierge Desk',
];

const GREETING_SUGGESTIONS = [
  'Hi! 👋 I would like to know more about your marketing packages and pricing.',
  'Hello! Can someone help me with a custom marketing audit?',
  'Hi there! I want to book a free 1-on-1 strategy consultation.',
  'Hey! I have a quick question regarding lead generation automation.',
];

const COLOR_SWATCHES = [
  { name: 'WhatsApp Green', color: '#25D366' },
  { name: 'Teal Pro', color: '#128C7E' },
  { name: 'Wheedle Blue', color: '#0665ff' },
  { name: 'Cyber Violet', color: '#8b5cf6' },
  { name: 'Midnight Navy', color: '#0f172a' },
];

const WEB_BOT_PRESETS = [
  {
    id: 'sales',
    badge: 'High Conversion',
    label: '🚀 Sales Closer',
    name: 'Wheedle Sales Specialist',
    systemPrompt: 'You are an elite AI sales consultant for Wheedle AI. Your primary mission is to understand user business objectives, highlight key features (multi-channel ad manager, CRM, automated agents), quote packages persuasively, and invite them to book a free demo or start a trial.\nAlways maintain a confident, helpful, and professional tone.',
    welcomeMessage: 'Hi there! 👋 Looking to boost your marketing ROI or see our plans?',
    themeColor: '#0665ff',
    desc: 'Qualifies leads & closes trial conversions',
  },
  {
    id: 'support',
    badge: 'Customer Care',
    label: '🛠️ Support Helpdesk',
    name: 'Customer Support Desk',
    systemPrompt: 'You are a warm, empathetic, and expert technical support specialist. Guide users through campaign setup, pixel tracking, billing, and account management with clear step-by-step instructions. Escalate complex engineering issues gracefully.',
    welcomeMessage: 'Hello! I am your 24/7 support assistant. How can I help resolve your query today?',
    themeColor: '#10b981',
    desc: 'Instant troubleshooting & customer guidance',
  },
  {
    id: 'growth',
    badge: 'Strategy Pro',
    label: '📈 Growth & Ads Advisor',
    name: 'Growth Strategy Advisor',
    systemPrompt: 'You are a senior growth marketing architect. Analyze user advertising goals across Google Ads, Meta Ads, and SEO. Provide tactical advice on budget allocation, ad copy optimization, and conversion funnels.',
    welcomeMessage: 'Welcome! Looking to scale your campaigns or audit your marketing performance?',
    themeColor: '#8b5cf6',
    desc: 'Strategic recommendations for ad campaigns & SEO',
  },
  {
    id: 'ecommerce',
    badge: 'E-Commerce',
    label: '🛍️ Shopping Concierge',
    name: 'VIP Shopping Concierge',
    systemPrompt: 'You are a lively, attentive e-commerce shopping consultant. Help visitors discover top products, recommend personalized bundles, check active discount coupons, and answer shipping/returns queries smoothly.',
    welcomeMessage: 'Hey! Looking for special offers or product recommendations today?',
    themeColor: '#f59e0b',
    desc: 'Recommends products & answers order queries',
  },
];

const WEB_TONE_MODIFIERS = [
  { label: '💼 Professional', text: '\nTone: Professional, consultative, and executive-level.' },
  { label: '🤝 Friendly', text: '\nTone: Friendly, approachable, empathetic, with natural conversational phrasing.' },
  { label: '🎯 Sales-Driven', text: '\nTone: Persuasive, action-oriented, with clear call-to-actions to convert now.' },
  { label: '🔍 Technical', text: '\nTone: Clear, technical, structured with bullet points and precise explanations.' },
];

const BOT_NAME_SUGGESTIONS = [
  'Sales Conversion Specialist',
  'Wheedle Support Helpdesk',
  'Inbound Lead Assistant',
  'Growth Marketing Advisor',
];

const WELCOME_SUGGESTIONS = [
  'Hi there! 👋 How can I help you accelerate your marketing growth today?',
  'Hello! Welcome. Are you looking for product pricing, live demos, or support?',
  'Hey! I am your 24/7 AI agent. What questions can I answer for you?',
];

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

  // Web Chatbot State
  const [webPlatformTab, setWebPlatformTab] = useState<PlatformTab>('html');
  const [copiedWebSnippet, setCopiedWebSnippet] = useState(false);
  const [copiedWebLink, setCopiedWebLink] = useState(false);

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

  // Enhanced WhatsApp State: Platform tab & Preview device
  const [waPlatformTab, setWaPlatformTab] = useState<PlatformTab>('html');
  const [waPreviewDevice, setWaPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedPlatformSnippet, setCopiedPlatformSnippet] = useState(false);

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

  const [deletingBotId, setDeletingBotId] = useState<string | null>(null);

  // Saved WhatsApp Widgets State
  const [savedWaWidgets, setSavedWaWidgets] = useState<SavedWaWidget[]>(() => {
    try {
      const raw = localStorage.getItem('wheedle_saved_wa_widgets');
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_SAVED_WA_WIDGETS;
  });
  const [activeWaWidgetId, setActiveWaWidgetId] = useState<string>('wa-leadgen-1');

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
    setName('AI Sales Consultant');
    setSystemPrompt('You are an elite AI sales consultant for Wheedle AI. Your primary mission is to understand user business objectives, highlight key features (multi-channel ad manager, CRM, automated agents), quote packages persuasively, and invite them to book a free demo or start a trial.\nAlways speak in a professional, consultative tone.');
    setWelcomeMessage('Hi! 👋 How can I help you accelerate your marketing growth today?');
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
      toast.success('Chatbot saved! Embed snippet is available below.');
      setActiveBot(newBot);
      setIsCreating(false);
    } catch {
      toast.error('Failed to save chatbot.');
    }
  };

  const handleDeleteBot = async (botId: string, botName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (botId === 'global') {
      Swal.fire({
        title: 'Protected Agent',
        text: 'The W-AI Platform Agent is a core system assistant and cannot be deleted.',
        icon: 'info',
        confirmButtonText: 'Understood',
        customClass: {
          popup: 'swal-custom-dark',
          confirmButton: 'swal2-confirm swal-btn-success',
        },
        buttonsStyling: false,
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Delete Chatbot?',
      text: `Are you sure you want to delete "${botName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-custom-dark',
        confirmButton: 'swal2-confirm swal-btn-danger',
        cancelButton: 'swal2-cancel swal-btn-cancel',
      },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) return;

    setDeletingBotId(botId);
    try {
      await dispatch(deleteBot(botId)).unwrap();
      toast.success(`Chatbot "${botName}" deleted successfully`);
      if (activeBot?._id === botId) {
        setActiveBot(defaultGlobalBot);
        setName(defaultGlobalBot.name);
        setSystemPrompt(defaultGlobalBot.systemPrompt);
        setWelcomeMessage(defaultGlobalBot.welcomeMessage);
        setThemeColor(defaultGlobalBot.themeColor);
        setMessages([]);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete chatbot.');
    } finally {
      setDeletingBotId(null);
    }
  };

  const selectWaWidget = (w: SavedWaWidget) => {
    setActiveWaWidgetId(w.id);
    setWaPhone(w.phone);
    setWaTitle(w.title);
    setWaSubtitle(w.subtitle);
    setWaGreeting(w.greeting);
    setWaPosition(w.position);
    setWaColor(w.color);
    toast.success(`Loaded widget: ${w.name}`);
  };

  const handleSaveWaWidget = async () => {
    const rawDigits = waPhone.replace(/\D/g, '');
    if (!rawDigits || rawDigits.length < 8) {
      toast.error('Please enter a valid WhatsApp phone number.');
      return;
    }
    const existingIdx = savedWaWidgets.findIndex(w => w.id === activeWaWidgetId);
    const defaultName = existingIdx >= 0 ? savedWaWidgets[existingIdx].name : (waTitle || 'My WhatsApp Widget');
    
    const { value: widgetName } = await Swal.fire({
      title: 'Save WhatsApp Widget',
      text: 'Enter a name for this widget configuration:',
      input: 'text',
      inputValue: defaultName,
      showCancelButton: true,
      confirmButtonText: 'Save Widget',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-custom-dark',
        confirmButton: 'swal2-confirm swal-btn-success',
        cancelButton: 'swal2-cancel swal-btn-cancel',
      },
      buttonsStyling: false,
      inputValidator: (val) => {
        if (!val || !val.trim()) {
          return 'Widget name cannot be empty!';
        }
      },
    });
    if (!widgetName || !widgetName.trim()) return;

    const newWidget: SavedWaWidget = {
      id: existingIdx >= 0 ? activeWaWidgetId : `wa-${Date.now()}`,
      name: widgetName.trim(),
      phone: waPhone,
      title: waTitle,
      subtitle: waSubtitle,
      greeting: waGreeting,
      position: waPosition,
      color: waColor,
      createdAt: new Date().toLocaleDateString(),
    };

    let updatedList: SavedWaWidget[];
    if (existingIdx >= 0) {
      updatedList = [...savedWaWidgets];
      updatedList[existingIdx] = newWidget;
    } else {
      updatedList = [...savedWaWidgets, newWidget];
    }
    setSavedWaWidgets(updatedList);
    setActiveWaWidgetId(newWidget.id);
    try {
      localStorage.setItem('wheedle_saved_wa_widgets', JSON.stringify(updatedList));
    } catch {}
    toast.success(`WhatsApp Widget "${newWidget.name}" saved!`);
  };

  const handleDeleteWaWidget = async (id: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const result = await Swal.fire({
      title: 'Delete WhatsApp Widget?',
      text: `Are you sure you want to delete "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-custom-dark',
        confirmButton: 'swal2-confirm swal-btn-danger',
        cancelButton: 'swal2-cancel swal-btn-cancel',
      },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) return;

    const filtered = savedWaWidgets.filter(w => w.id !== id);
    setSavedWaWidgets(filtered);
    try {
      localStorage.setItem('wheedle_saved_wa_widgets', JSON.stringify(filtered));
    } catch {}
    toast.success(`WhatsApp Widget "${name}" deleted.`);

    if (activeWaWidgetId === id) {
      if (filtered.length > 0) {
        selectWaWidget(filtered[0]);
      } else {
        setActiveWaWidgetId('');
        setWaPhone('+919876543210');
        setWaTitle('AI WhatsApp Assistant');
        setWaSubtitle('Online | Replies instantly');
        setWaGreeting('Hi there! 👋 How can our AI assistant help your business today?');
        setWaPosition('right');
        setWaColor('#25D366');
      }
    }
  };

  const handleResetWaWidget = () => {
    setActiveWaWidgetId('');
    setWaPhone('+919876543210');
    setWaTitle('AI WhatsApp Assistant');
    setWaSubtitle('Online | Replies instantly');
    setWaGreeting('Hi there! 👋 How can our AI assistant help your business today?');
    setWaPosition('right');
    setWaColor('#25D366');
    toast.success('Widget form reset to defaults.');
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

  /* ── Web Chatbot Helpers ── */
  const webBotId = isCreating ? (bots[0]?._id || 'global') : (activeBot?._id || 'global');
  const webBotColor = isCreating ? themeColor : (activeBot?.themeColor || themeColor || '#0665ff');
  const webEmbedScriptUrl = window.location.origin.includes('localhost')
    ? 'https://wheedletechnologies.tech/embed.js'
    : `${window.location.origin}/embed.js`;

  const webStandaloneUrl = `${window.location.origin.includes('localhost') ? 'https://wheedletechnologies.tech' : window.location.origin}/chatbot-embed/${webBotId}`;
  const webEmbedSnippet = `<script \n  src="${webEmbedScriptUrl}" \n  data-agent-id="${webBotId}" \n  data-color="${webBotColor}"\n  data-position="right">\n</script>`;

  const copyWebEmbed = () => {
    navigator.clipboard.writeText(webEmbedSnippet);
    setCopiedWebSnippet(true);
    toast.success('Embed script copied!');
    setTimeout(() => setCopiedWebSnippet(false), 2500);
  };

  const copyWebLink = () => {
    navigator.clipboard.writeText(webStandaloneUrl);
    setCopiedWebLink(true);
    toast.success('Direct chat link copied!');
    setTimeout(() => setCopiedWebLink(false), 2500);
  };

  const copyWebPlatformCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedWebSnippet(true);
    toast.success('Platform snippet copied!');
    setTimeout(() => setCopiedWebSnippet(false), 2500);
  };

  const getWebPlatformSnippet = (tab: PlatformTab) => {
    switch (tab) {
      case 'html':
        return `<!-- Paste right before the closing </body> tag of your website -->\n${webEmbedSnippet}`;
      case 'nextjs':
        return `// In app/layout.tsx (Next.js App Router) or pages/_app.tsx (Pages Router)\nimport Script from 'next/script';\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body>\n        {children}\n        <Script\n          src="${webEmbedScriptUrl}"\n          strategy="lazyOnload"\n          data-agent-id="${webBotId}"\n          data-color="${webBotColor}"\n          data-position="right"\n        />\n      </body>\n    </html>\n  );\n}`;
      case 'wordpress':
        return `<!-- Option A: WPCode / Header and Footer Scripts Plugin -->\n<!-- 1. In WordPress Admin, go to Plugins -> Add New -> Install 'WPCode' -->\n<!-- 2. Navigate to Code Snippets -> Header & Footer -->\n<!-- 3. Paste the code below into the 'Footer' textarea and click Save Changes -->\n\n${webEmbedSnippet}\n\n<!-- Option B: Elementor Pro -->\n<!-- Elementor -> Custom Code -> Add New -> Location: 'End </body>' -> Paste & Publish to Entire Site -->`;
      case 'shopify':
        return `<!-- Shopify theme.liquid Integration -->\n<!-- 1. From Shopify Admin, go to Online Store -> Themes -->\n<!-- 2. Click '...' next to your active theme and select 'Edit code' -->\n<!-- 3. Under Layout, click 'theme.liquid' -->\n<!-- 4. Scroll to bottom and paste directly before the closing </body> tag -->\n\n${webEmbedSnippet}`;
      case 'wix':
        return `<!-- Wix / Webflow / Squarespace Integration -->\n<!-- WIX: Settings -> Custom Code -> Add Custom Code -> Paste snippet -> Place in: 'Body - end' -> Apply -->\n<!-- WEBFLOW: Project Settings -> Custom Code -> Footer Code (before </body>) -> Save & Publish -->\n<!-- SQUARESPACE: Settings -> Developer Tools -> Code Injection -> Footer -> Paste & Save -->\n\n${webEmbedSnippet}`;
      default:
        return webEmbedSnippet;
    }
  };

  const applyWebPreset = (preset: typeof WEB_BOT_PRESETS[0]) => {
    setName(preset.name);
    setSystemPrompt(preset.systemPrompt);
    setWelcomeMessage(preset.welcomeMessage);
    setThemeColor(preset.themeColor);
    toast.success(`Applied ${preset.label} template!`);
  };

  const appendToneToPrompt = (toneText: string) => {
    if (!systemPrompt.includes(toneText.trim())) {
      setSystemPrompt(prev => `${prev.trim()}${toneText}`);
      toast.success('Tone instruction added to persona!');
    }
  };

  /* ── WhatsApp Validation & Helpers ── */
  const cleanDigits = useMemo(() => waPhone.replace(/[^0-9]/g, ''), [waPhone]);
  const hasPlus = waPhone.trim().startsWith('+');

  const phoneValidation = useMemo(() => {
    if (!cleanDigits) {
      return { status: 'error' as const, message: 'WhatsApp number is required.' };
    }
    if (cleanDigits.length < 10) {
      return { status: 'error' as const, message: `Number is too short (${cleanDigits.length} digits) — minimum 10 digits required.` };
    }
    if (cleanDigits.length > 15) {
      return { status: 'error' as const, message: `Number is too long (${cleanDigits.length} digits) — max 15 digits in E.164 international standard.` };
    }
    if (!hasPlus && cleanDigits.length === 10) {
      return { status: 'warning' as const, message: 'Missing country code. WhatsApp requires international code (e.g., +91 for India, +1 for US/CA).' };
    }
    if (!hasPlus) {
      return { status: 'warning' as const, message: 'Please include country code with "+" prefix (e.g., +91, +1, +44).' };
    }
    return { status: 'valid' as const, message: `Valid international WhatsApp number (+${cleanDigits})` };
  }, [cleanDigits, hasPlus]);

  const titleValidation = useMemo(() => {
    if (!waTitle.trim()) return { status: 'error' as const, message: 'Widget title is required.' };
    if (waTitle.length > 30) return { status: 'warning' as const, message: 'Title is getting long — recommended under 25 chars for mobile screens.' };
    return { status: 'valid' as const, message: 'Title looks great' };
  }, [waTitle]);

  const greetingValidation = useMemo(() => {
    if (!waGreeting.trim()) return { status: 'error' as const, message: 'Pre-filled greeting cannot be empty.' };
    if (waGreeting.length < 10) return { status: 'warning' as const, message: 'Greeting is very brief. Make it friendly to encourage replies.' };
    return { status: 'valid' as const, message: 'Greeting looks engaging' };
  }, [waGreeting]);

  const isAllValid = phoneValidation.status === 'valid' && titleValidation.status === 'valid' && greetingValidation.status === 'valid';

  const applyPreset = (preset: typeof WA_PRESETS[0]) => {
    setWaTitle(preset.title);
    setWaSubtitle(preset.subtitle);
    setWaGreeting(preset.greeting);
    setWaColor(preset.color);
    toast.success(`Applied ${preset.label} preset!`);
  };

  const autoFixCountryCode = (code: string) => {
    let baseDigits = cleanDigits;
    const codeNum = code.replace('+', '');
    if (baseDigits.startsWith(codeNum)) {
      baseDigits = baseDigits.slice(codeNum.length);
    }
    setWaPhone(`${code}${baseDigits}`);
    toast.success(`Formatted with ${code}`);
  };

  const widgetScriptUrl = window.location.origin.includes('localhost')
    ? 'https://wheedletechnologies.tech/whatsapp-widget.js'
    : `${window.location.origin}/whatsapp-widget.js`;

  const waEmbedSnippet = `<script src="${widgetScriptUrl}"\n  data-phone="${cleanDigits}"\n  data-title="${waTitle}"\n  data-subtitle="${waSubtitle}"\n  data-greeting="${waGreeting}"\n  data-position="${waPosition}"\n  data-color="${waColor}">\n</script>`;
  const waDirectUrl = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(waGreeting)}`;

  const copyWaEmbed = () => {
    navigator.clipboard.writeText(waEmbedSnippet);
    setCopiedSnippet(true);
    toast.success('Embed code copied!');
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  const copyWaLink = () => {
    navigator.clipboard.writeText(waDirectUrl);
    setCopiedLink(true);
    toast.success('Direct link copied!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const copyPlatformCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPlatformSnippet(true);
    toast.success('Platform snippet copied!');
    setTimeout(() => setCopiedPlatformSnippet(false), 2500);
  };

  const getPlatformSnippet = (tab: PlatformTab) => {
    switch (tab) {
      case 'html':
        return `<!-- Paste right before the closing </body> tag of your website -->\n${waEmbedSnippet}`;
      case 'nextjs':
        return `// In app/layout.tsx (Next.js App Router) or pages/_app.tsx (Pages Router)\nimport Script from 'next/script';\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body>\n        {children}\n        <Script\n          src="${widgetScriptUrl}"\n          strategy="lazyOnload"\n          data-phone="${cleanDigits}"\n          data-title="${waTitle}"\n          data-subtitle="${waSubtitle}"\n          data-greeting="${waGreeting}"\n          data-position="${waPosition}"\n          data-color="${waColor}"\n        />\n      </body>\n    </html>\n  );\n}`;
      case 'wordpress':
        return `<!-- Option A: WPCode / Insert Headers & Footers Plugin -->\n<!-- 1. In WordPress Admin, go to Plugins -> Add New -> Install 'WPCode' or 'Header and Footer Scripts' -->\n<!-- 2. Navigate to Code Snippets -> Header & Footer -->\n<!-- 3. Paste the code below in the 'Footer' textarea and click Save Changes -->\n\n${waEmbedSnippet}\n\n<!-- Option B: Elementor Pro -->\n<!-- Go to Elementor -> Custom Code -> Add New -> Location: 'End </body>' -> Paste & Publish to Entire Site -->`;
      case 'shopify':
        return `<!-- Shopify theme.liquid integration -->\n<!-- 1. In Shopify Admin, navigate to Online Store -> Themes -->\n<!-- 2. Click '...' next to your active theme and select 'Edit code' -->\n<!-- 3. Under Layout, click 'theme.liquid' -->\n<!-- 4. Scroll to bottom and paste this snippet right before the </body> tag -->\n\n${waEmbedSnippet}`;
      case 'wix':
        return `<!-- Wix / Webflow / Squarespace Integration -->\n<!-- WIX: Settings -> Custom Code -> Add Custom Code -> Paste code -> Place Code in: 'Body - end' -> Apply -->\n<!-- WEBFLOW: Project Settings -> Custom Code -> Footer Code (before </body>) -> Save & Publish -->\n<!-- SQUARESPACE: Settings -> Developer Tools -> Code Injection -> Footer -> Paste & Save -->\n\n${waEmbedSnippet}`;
      default:
        return waEmbedSnippet;
    }
  };

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
      {/* ─────────────────────────────────────────────────────
          MODE 1: WEB CHATBOT BUILDER
      ───────────────────────────────────────────────────── */}
      {activeMode === 'web' && (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 380px', gap: '20px', alignItems: 'start' }}>

          {/* Column 1: Bot List (Sticky) */}
          <div style={{ position: 'sticky', top: '88px', alignSelf: 'start', maxHeight: 'calc(100vh - 110px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '2px' }}>

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
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>W-AI Platform Agent</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Global assistant</div>
                </div>
                {activeBot?._id === 'global' && !isCreating && <ChevronRight size={14} style={{ color: '#0665ff', flexShrink: 0 }} />}
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
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bot.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{bot.conversationsHandled || 0} conversations</div>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteBot(bot._id, bot.name, e)}
                    disabled={deletingBotId === bot._id}
                    title={`Delete "${bot.name}"`}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '8px',
                      border: '1px solid transparent',
                      background: 'transparent',
                      color: 'var(--text-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: deletingBotId === bot._id ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.14)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-dim)';
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    {deletingBotId === bot._id ? (
                      <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite', color: '#ef4444' }} />
                    ) : (
                      <Trash2 size={13} />
                    )}
                  </button>

                  {activeBot?._id === bot._id && !isCreating && <ChevronRight size={14} style={{ color: bot.themeColor, flexShrink: 0 }} />}
                </div>
              </div>
            ))}
          </div>

          {/* Column 2: Configuration & Direct Implementation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
            {/* Global Bot Info Card */}
            {activeBot?._id === 'global' && !isCreating && (
              <GlassCard style={{ padding: '26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                  <div style={{ width: 46, height: 46, borderRadius: '14px', background: 'linear-gradient(135deg, rgba(6,101,255,0.2), rgba(34,211,238,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={22} color="#0665ff" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>W-AI Platform Assistant</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Pre-trained core agent · Automatically synchronized with brand profile</div>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                  W-AI is your central digital marketing advisor — seamlessly integrated with your active brand profile, campaign metrics, SEO audit data, and reputation reviews.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                  {[
                    { icon: <Shield size={14} />, title: 'Brand Context', desc: 'Syncs website, mission, and products' },
                    { icon: <BarChart2 size={14} />, title: 'Campaign Sync', desc: 'Real-time Google & Meta metrics' },
                    { icon: <Star size={14} />, title: 'Review Intelligence', desc: 'Understands customer sentiments' },
                    { icon: <Cpu size={14} />, title: 'Tactical Recommendations', desc: 'Actionable ad spend insights' },
                  ].map((f, i) => (
                    <div key={i} style={{ padding: '12px', borderRadius: '12px', background: 'rgba(6,101,255,0.06)', border: '1px solid rgba(6,101,255,0.12)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0665ff', marginBottom: '4px', fontWeight: 700, fontSize: '12px' }}>
                        {f.icon} {f.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{f.desc}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={startCreateNew}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0665ff, #0284c7)',
                      color: '#fff',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(6,101,255,0.35)',
                    }}
                  >
                    <PlusCircle size={15} /> Create Custom AI Chatbot
                  </button>
                </div>
              </GlassCard>
            )}

            {/* Create / Edit Custom Bot Panel */}
            {(isCreating || (activeBot && activeBot._id !== 'global')) && (
              <GlassCard style={{ padding: '26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${themeColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${themeColor}44` }}>
                    <Settings size={20} color={themeColor} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {isCreating ? 'Create New AI Chatbot' : `Configure: ${name || 'Agent'}`}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Select a high-converting template or customize instructions &amp; appearance
                    </div>
                  </div>
                </div>

                {/* Quick Persona Templates */}
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    <Lightbulb size={14} color="#f59e0b" /> 1-Click Persona Templates:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                    {WEB_BOT_PRESETS.map(preset => (
                      <div
                        key={preset.id}
                        onClick={() => applyWebPreset(preset)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--glass-border)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = `${preset.themeColor}88`;
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--glass-border)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)' }}>{preset.label}</span>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: preset.themeColor }} />
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', lineHeight: 1.3 }}>{preset.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Name with Suggestions */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Agent Name *
                      </label>
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{name.length}/30</span>
                    </div>
                    <input
                      type="text"
                      className="input-field"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Sales Conversion Specialist..."
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                    {/* Suggestions */}
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {BOT_NAME_SUGGESTIONS.map((s, idx) => (
                        <span
                          key={idx}
                          onClick={() => setName(s)}
                          style={{
                            fontSize: '10px',
                            padding: '2px 7px',
                            borderRadius: '5px',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                          }}
                        >
                          + {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* System Prompt with Tone Modifiers */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        AI Persona &amp; Core Instructions *
                      </label>
                      <span style={{ fontSize: '10.5px', color: '#0665ff', fontWeight: 600 }}>Wheedle LLM Engine</span>
                    </div>
                    <textarea
                      rows={6}
                      className="input-field"
                      value={systemPrompt}
                      onChange={e => setSystemPrompt(e.target.value)}
                      placeholder="Define your agent's personality, conversation goals, boundaries, and tone of voice..."
                      style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.55 }}
                    />
                    {/* Tone Modifiers */}
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', marginBottom: '5px' }}>Add Tone &amp; Style Directive:</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {WEB_TONE_MODIFIERS.map((tone, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => appendToneToPrompt(tone.text)}
                            style={{
                              fontSize: '10.5px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: 'var(--bg-elevated)',
                              border: '1px solid var(--glass-border)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                            }}
                          >
                            + {tone.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Welcome Message with Suggestions */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Initial Welcome Message
                      </label>
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{welcomeMessage.length} chars</span>
                    </div>
                    <input
                      type="text"
                      className="input-field"
                      value={welcomeMessage}
                      onChange={e => setWelcomeMessage(e.target.value)}
                      placeholder="e.g. Hi there! How can I assist your business today?"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                      {WELCOME_SUGGESTIONS.map((w, idx) => (
                        <span
                          key={idx}
                          onClick={() => setWelcomeMessage(w)}
                          style={{
                            fontSize: '10.5px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                          }}
                        >
                          "{w}"
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Theme Color Swatches */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <Palette size={12} style={{ display: 'inline', marginRight: '4px' }} /> Brand Accent Color
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="color"
                        value={themeColor}
                        onChange={e => setThemeColor(e.target.value)}
                        style={{ width: '48px', height: '38px', padding: '3px', borderRadius: '8px', border: '1px solid var(--glass-border)', cursor: 'pointer', background: 'var(--bg-card)' }}
                      />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {['#0665ff', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#0f172a'].map(c => (
                          <div
                            key={c}
                            onClick={() => setThemeColor(c)}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: c,
                              cursor: 'pointer',
                              border: themeColor === c ? '2px solid #fff' : '2px solid transparent',
                              transform: themeColor === c ? 'scale(1.2)' : 'scale(1)',
                              transition: 'all 0.15s',
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                        {themeColor}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleSaveBot}
                    disabled={saving}
                    style={{
                      flex: 1,
                      minWidth: '180px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '12px',
                      background: saving ? 'rgba(6,101,255,0.5)' : 'linear-gradient(135deg, #0665ff, #0284c7)',
                      color: '#fff',
                      border: 'none',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      boxShadow: '0 4px 16px rgba(6,101,255,0.35)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {saving ? (
                      <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                    ) : (
                      <><Save size={15} /> {isCreating ? 'Save & Deploy Chatbot' : 'Save Agent Changes'}</>
                    )}
                  </button>

                  {!isCreating && activeBot && activeBot._id !== 'global' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteBot(activeBot._id, activeBot.name)}
                      disabled={deletingBotId === activeBot._id}
                      style={{
                        padding: '12px 18px',
                        borderRadius: '12px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: deletingBotId === activeBot._id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                      }}
                    >
                      {deletingBotId === activeBot._id ? (
                        <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Deleting...</>
                      ) : (
                        <><Trash2 size={14} /> Delete Chatbot</>
                      )}
                    </button>
                  )}

                  {isCreating && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setActiveBot(defaultGlobalBot);
                      }}
                      style={{
                        padding: '12px 18px',
                        borderRadius: '12px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </GlassCard>
            )}

            {/* Embed Integration Code Card (Always visible below when viewing active bot) */}
            {activeBot && !isCreating && (
              <GlassCard style={{ padding: '26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(34,197,94,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(34,197,94,0.3)' }}>
                      <Code size={20} color="#22c55e" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Embed on Website: {activeBot?.name || name}
                      </h4>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Copy the integration code below and paste into your website
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyWebPlatformCode(getWebPlatformSnippet(webPlatformTab))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: copiedWebSnippet ? 'rgba(34,197,94,0.2)' : 'rgba(6,101,255,0.18)',
                      border: '1px solid rgba(6,101,255,0.4)',
                      color: copiedWebSnippet ? '#22c55e' : '#0665ff',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {copiedWebSnippet ? <Check size={14} /> : <Copy size={14} />}
                    {copiedWebSnippet ? 'Copied Code!' : 'Copy Integration Snippet'}
                  </button>
                </div>

                {/* 4-Step Process Bar */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  marginBottom: '18px',
                  padding: '12px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                }}>
                  {[
                    { step: '1', title: 'Persona', desc: 'Configured above' },
                    { step: '2', title: 'Select CMS', desc: 'Choose platform below' },
                    { step: '3', title: 'Paste Tag', desc: 'Place before </body>' },
                    { step: '4', title: 'Go Live', desc: '24/7 AI chat active' },
                  ].map(s => (
                    <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#0665ff', color: '#fff', fontSize: '10.5px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {s.step}
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>{s.title}</div>
                        <div style={{ fontSize: '9.5px', color: 'var(--text-dim)' }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Platform Switcher Tabs */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {[
                    { id: 'html' as PlatformTab, label: '🌐 HTML / Universal' },
                    { id: 'nextjs' as PlatformTab, label: '⚛️ Next.js / React' },
                    { id: 'wordpress' as PlatformTab, label: '📝 WordPress / Elementor' },
                    { id: 'shopify' as PlatformTab, label: '🛍️ Shopify' },
                    { id: 'wix' as PlatformTab, label: '🎨 Wix / Webflow' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setWebPlatformTab(tab.id)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s',
                        background: webPlatformTab === tab.id ? 'rgba(6,101,255,0.18)' : 'var(--bg-elevated)',
                        color: webPlatformTab === tab.id ? '#0665ff' : 'var(--text-secondary)',
                        border: webPlatformTab === tab.id ? '1px solid rgba(6,101,255,0.4)' : '1px solid var(--glass-border)',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Code Snippet Box */}
                <div style={{ position: 'relative' }}>
                  <pre style={{
                    margin: 0,
                    padding: '16px',
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)',
                    color: '#22d3ee',
                    fontSize: '11.5px',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                    fontFamily: 'monospace',
                  }}>
                    {getWebPlatformSnippet(webPlatformTab)}
                  </pre>
                </div>

                {/* Direct Shareable Link & Standalone Preview */}
                <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={copyWebLink}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Copy size={13} /> {copiedWebLink ? 'Link Copied!' : 'Copy Standalone Chat URL'}
                  </button>
                  <a
                    href={webStandaloneUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'rgba(6,101,255,0.15)',
                      border: '1px solid rgba(6,101,255,0.3)',
                      color: '#0665ff',
                      fontSize: '12px',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={13} /> Open Fullscreen Chat
                  </a>
                </div>

                {/* Attribute Details */}
                <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>💡 Customization Options:</strong> You can configure <code style={{ color: '#0665ff' }}>data-color="{webBotColor}"</code> to match your company's branding and <code style={{ color: '#0665ff' }}>data-position="right"</code> or <code style={{ color: '#0665ff' }}>"left"</code> to adjust screen placement.
                </div>
              </GlassCard>
            )}
          </div>

          {/* Column 3: Live Chat Sandbox (Sticky) */}
          <div style={{ position: 'sticky', top: '88px', alignSelf: 'start', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Play size={12} color="#22d3ee" /> Live Test Sandbox
            </div>

            <div style={{
              borderRadius: '18px',
              overflow: 'hidden',
              border: '1px solid var(--glass-border)',
              background: 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 150px)',
              minHeight: '520px',
              maxHeight: '660px',
            }}>

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
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 380px', gap: '20px', alignItems: 'start' }}>

          {/* Column 1: Saved WhatsApp Widgets List (Sticky) */}
          <div style={{ position: 'sticky', top: '88px', alignSelf: 'start', maxHeight: 'calc(100vh - 110px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '2px' }}>

            {/* Create New Widget Button */}
            <button
              onClick={handleResetWaWidget}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '11px 16px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                color: '#000', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 800,
                boxShadow: '0 4px 16px rgba(37,211,102,0.35)',
                transition: 'all 0.2s',
              }}
            >
              <PlusCircle size={16} color="#000" /> Create New Widget
            </button>

            {/* Divider */}
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', color: 'var(--text-dim)', textTransform: 'uppercase', padding: '4px 4px 0' }}>
              Your Saved Widgets ({savedWaWidgets.length})
            </div>

            {/* Saved Widgets List */}
            {savedWaWidgets.map(widget => {
              const isSelected = activeWaWidgetId === widget.id;
              return (
                <div
                  key={widget.id}
                  onClick={() => selectWaWidget(widget)}
                  style={{
                    padding: '14px', borderRadius: '14px',
                    background: isSelected ? 'rgba(37,211,102,0.1)' : 'var(--bg-card)',
                    border: isSelected ? `1px solid ${widget.color || '#25D366'}66` : '1px solid var(--glass-border)',
                    borderLeft: `3px solid ${widget.color || '#25D366'}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: `${widget.color || '#25D366'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Phone size={16} color={widget.color || '#25D366'} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {widget.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        {widget.phone}
                      </div>
                    </div>

                    {/* Delete Widget Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteWaWidget(widget.id, widget.name, e)}
                      title={`Delete "${widget.name}"`}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '8px',
                        border: '1px solid transparent',
                        background: 'transparent',
                        color: 'var(--text-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ef4444';
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.14)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-dim)';
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      <Trash2 size={13} />
                    </button>

                    {isSelected && <ChevronRight size={14} style={{ color: widget.color || '#25D366', flexShrink: 0 }} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column 2: Configuration & Step-by-Step Implementation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>

            {/* 1-Click Ready Presets Banner */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--glass-border)',
              borderRadius: '16px',
              padding: '16px 20px',
              boxShadow: 'var(--glass-shadow)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lightbulb size={16} color="#25D366" />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>1-Click High-Converting Templates</span>
                </div>
                <span style={{ fontSize: '10.5px', color: '#25D366', fontWeight: 700, background: 'rgba(37,211,102,0.12)', padding: '2px 8px', borderRadius: '10px' }}>
                  Instant Autofill
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                {WA_PRESETS.map(preset => (
                  <div
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--glass-border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = `${preset.color}88`;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--glass-border)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-primary)' }}>{preset.label}</span>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: preset.color, display: 'inline-block' }} />
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', marginBottom: '6px', lineHeight: 1.35 }}>{preset.desc}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: preset.color, fontWeight: 700 }}>
                      <Sparkles size={10} /> Use Template
                    </div>
                  </div>
                ))}
              </div>
            </div>

              {/* Form & Smart Inputs Card */}
              <GlassCard style={{ padding: '26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(37,211,102,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(37,211,102,0.3)' }}>
                    <Phone size={22} color="#25D366" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>WhatsApp AI Widget Settings</h3>
                    <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Configure phone number, prompt messages, and real-time triggers</p>
                  </div>
                </div>

                {/* WhatsApp Phone Field with Real-time Validation */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      WhatsApp Business Number * <span style={{ color: 'var(--text-dim)', textTransform: 'none', fontWeight: 400 }}>(International format with +)</span>
                    </label>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: phoneValidation.status === 'valid' ? '#22c55e' : phoneValidation.status === 'warning' ? '#f59e0b' : '#ef4444'
                    }}>
                      {phoneValidation.status === 'valid' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                      {cleanDigits.length} Digits
                    </span>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="+91 98765 43210"
                      value={waPhone}
                      onChange={e => setWaPhone(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        borderColor: phoneValidation.status === 'valid' ? 'rgba(34,197,94,0.4)' : phoneValidation.status === 'warning' ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)',
                        paddingRight: '36px'
                      }}
                    />
                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                      {phoneValidation.status === 'valid' ? (
                        <Check size={16} color="#22c55e" />
                      ) : (
                        <AlertTriangle size={16} color={phoneValidation.status === 'warning' ? '#f59e0b' : '#ef4444'} />
                      )}
                    </div>
                  </div>

                  {/* Validation Feedback Line */}
                  <div style={{
                    marginTop: '6px',
                    fontSize: '11.5px',
                    lineHeight: 1.4,
                    color: phoneValidation.status === 'valid' ? '#22c55e' : phoneValidation.status === 'warning' ? '#f59e0b' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <span>{phoneValidation.status === 'valid' ? '✓' : '⚠️'}</span> {phoneValidation.message}
                  </div>

                  {/* Country Code Quick Helpers */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Quick Format:</span>
                    {[
                      { label: '+91 (India)', code: '+91' },
                      { label: '+1 (US/CA)', code: '+1' },
                      { label: '+44 (UK)', code: '+44' },
                      { label: '+971 (UAE)', code: '+971' },
                      { label: '+61 (AUS)', code: '+61' },
                    ].map(c => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => autoFixCountryCode(c.code)}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--glass-border)',
                          color: 'var(--text-secondary)',
                          fontSize: '11px',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#25D366';
                          e.currentTarget.style.color = '#25D366';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--glass-border)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title & Subtitle Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  {/* Widget Header Title */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Widget Title *
                      </label>
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{waTitle.length}/25</span>
                    </div>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="AI WhatsApp Assistant"
                      value={waTitle}
                      onChange={e => setWaTitle(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                    {/* Suggestions */}
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {TITLE_SUGGESTIONS.map((t, idx) => (
                        <span
                          key={idx}
                          onClick={() => setWaTitle(t)}
                          style={{
                            fontSize: '10px',
                            padding: '2px 7px',
                            borderRadius: '5px',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                          }}
                        >
                          + {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Online Subtitle */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Online Subtitle
                      </label>
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{waSubtitle.length}/30</span>
                    </div>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Online | Replies instantly"
                      value={waSubtitle}
                      onChange={e => setWaSubtitle(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                    {/* Suggestions */}
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {SUBTITLE_SUGGESTIONS.map((s, idx) => (
                        <span
                          key={idx}
                          onClick={() => setWaSubtitle(s)}
                          style={{
                            fontSize: '10px',
                            padding: '2px 7px',
                            borderRadius: '5px',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                          }}
                        >
                          + {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pre-filled Greeting Message */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Pre-filled Greeting Message *
                    </label>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{waGreeting.length} chars (Formatted for WhatsApp)</span>
                  </div>
                  <textarea
                    rows={3}
                    className="input-field"
                    placeholder="Hi there! 👋 I would like to know more about your marketing packages."
                    value={waGreeting}
                    onChange={e => setWaGreeting(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.5 }}
                  />
                  {/* Suggestions Chips */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Recommended greetings for higher reply rates:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {GREETING_SUGGESTIONS.map((g, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setWaGreeting(g)}
                          style={{
                            fontSize: '10.5px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          "{g.slice(0, 48)}..."
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Position & Brand Color */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '22px' }}>
                  {/* Position */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Screen Position
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[
                        { value: 'right', label: 'Bottom Right (Recommended)' },
                        { value: 'left', label: 'Bottom Left' },
                      ].map(pos => (
                        <button
                          key={pos.value}
                          type="button"
                          onClick={() => setWaPosition(pos.value as any)}
                          style={{
                            flex: 1,
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: waPosition === pos.value ? '1px solid #25D366' : '1px solid var(--glass-border)',
                            background: waPosition === pos.value ? 'rgba(37,211,102,0.15)' : 'var(--bg-elevated)',
                            color: waPosition === pos.value ? '#25D366' : 'var(--text-secondary)',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brand Color Swatches */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Widget Bubble Color
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="color"
                        value={waColor}
                        onChange={e => setWaColor(e.target.value)}
                        style={{ width: '42px', height: '36px', padding: '3px', borderRadius: '8px', border: '1px solid var(--glass-border)', cursor: 'pointer', background: 'none' }}
                      />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {COLOR_SWATCHES.map(s => (
                          <div
                            key={s.color}
                            title={s.name}
                            onClick={() => setWaColor(s.color)}
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              background: s.color,
                              cursor: 'pointer',
                              border: waColor === s.color ? '2px solid #fff' : '2px solid transparent',
                              transform: waColor === s.color ? 'scale(1.15)' : 'scale(1)',
                              transition: 'all 0.15s',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions & Links Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                  {/* Primary Save & Delete Bar */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleSaveWaWidget}
                      style={{
                        flex: 1,
                        minWidth: '170px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '11px 18px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #25D366, #128C7E)',
                        color: '#000',
                        fontSize: '13px',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(37,211,102,0.3)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Save size={15} color="#000" /> Save WhatsApp Widget
                    </button>

                    <button
                      type="button"
                      onClick={handleResetWaWidget}
                      style={{
                        padding: '11px 16px',
                        borderRadius: '10px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-secondary)',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                      title="Reset form to defaults"
                    >
                      <RotateCcw size={14} /> Reset
                    </button>

                    {activeWaWidgetId && (
                      <button
                        type="button"
                        onClick={() => {
                          const current = savedWaWidgets.find(w => w.id === activeWaWidgetId);
                          handleDeleteWaWidget(activeWaWidgetId, current?.name || 'WhatsApp Widget');
                        }}
                        style={{
                          padding: '11px 16px',
                          borderRadius: '10px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                        }}
                        title="Delete selected WhatsApp widget"
                      >
                        <Trash2 size={14} /> Delete Widget
                      </button>
                    )}
                  </div>

                  {/* Secondary Direct Test Links */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={copyWaLink}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Copy size={13} /> {copiedLink ? 'Copied Link!' : 'Copy wa.me Direct Link'}
                    </button>
                    <a
                      href={waDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'rgba(37,211,102,0.15)',
                        border: '1px solid rgba(37,211,102,0.3)',
                        color: '#25D366',
                        fontSize: '12px',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <ExternalLink size={13} /> Test in WhatsApp App
                    </a>
                  </div>
                </div>
              </GlassCard>

              {/* ────────────────────────────────────────────────────────
                  HOW TO IMPLEMENT IN CODE — MULTI-PLATFORM GUIDE
              ──────────────────────────────────────────────────────── */}
              <GlassCard style={{ padding: '26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(6,101,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileCode size={20} color="#0665ff" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        How to Implement in Your Code &amp; Website
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Follow the easy platform-specific instructions below to embed the widget in under 2 minutes
                      </p>
                    </div>
                  </div>

                  {/* 1-Click Copy Snippet */}
                  <button
                    onClick={() => copyPlatformCode(getPlatformSnippet(waPlatformTab))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: copiedPlatformSnippet ? 'rgba(34,197,94,0.2)' : 'rgba(37,211,102,0.18)',
                      border: '1px solid rgba(37,211,102,0.4)',
                      color: '#25D366',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {copiedPlatformSnippet ? <Check size={14} /> : <Copy size={14} />}
                    {copiedPlatformSnippet ? 'Copied Code!' : 'Copy Integration Snippet'}
                  </button>
                </div>

                {/* 4-Step Visual Process Bar */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  marginBottom: '20px',
                  padding: '12px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                }}>
                  {[
                    { step: '1', title: 'Configure', desc: 'Enter phone & greeting' },
                    { step: '2', title: 'Choose Platform', desc: 'Select HTML, React, WP...' },
                    { step: '3', title: 'Paste Code', desc: 'Place before </body>' },
                    { step: '4', title: 'Launch 24/7', desc: 'Captures leads automatically' },
                  ].map(s => (
                    <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#25D366', color: '#000', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {s.step}
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>{s.title}</div>
                        <div style={{ fontSize: '9.5px', color: 'var(--text-dim)' }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Platform Switcher Tabs */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {[
                    { id: 'html' as PlatformTab, label: '🌐 HTML / Universal', icon: Globe },
                    { id: 'nextjs' as PlatformTab, label: '⚛️ Next.js / React', icon: Code },
                    { id: 'wordpress' as PlatformTab, label: '📝 WordPress / Elementor', icon: Layers },
                    { id: 'shopify' as PlatformTab, label: '🛍️ Shopify', icon: Zap },
                    { id: 'wix' as PlatformTab, label: '🎨 Wix / Webflow', icon: Laptop },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setWaPlatformTab(tab.id)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s',
                        background: waPlatformTab === tab.id ? 'rgba(6,101,255,0.18)' : 'var(--bg-elevated)',
                        color: waPlatformTab === tab.id ? '#0665ff' : 'var(--text-secondary)',
                        border: waPlatformTab === tab.id ? '1px solid rgba(6,101,255,0.4)' : '1px solid var(--glass-border)',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Code Display Area */}
                <div style={{ position: 'relative' }}>
                  <pre style={{
                    margin: 0,
                    padding: '16px',
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)',
                    color: '#22d3ee',
                    fontSize: '11.5px',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                    fontFamily: 'monospace',
                  }}>
                    {getPlatformSnippet(waPlatformTab)}
                  </pre>
                </div>

                {/* Detailed Attributes Breakdown */}
                <div style={{ marginTop: '18px', padding: '14px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Info size={14} color="#0665ff" /> How the attributes control widget behavior:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <div>
                      <code style={{ color: '#25D366' }}>data-phone</code>: Automatically sanitized international number with country code.
                    </div>
                    <div>
                      <code style={{ color: '#25D366' }}>data-greeting</code>: Pre-filled message ready to be sent on WhatsApp click.
                    </div>
                    <div>
                      <code style={{ color: '#25D366' }}>data-position</code>: Screen placement (<code style={{ color: '#22d3ee' }}>'right'</code> or <code style={{ color: '#22d3ee' }}>'left'</code>).
                    </div>
                    <div>
                      <code style={{ color: '#25D366' }}>data-color</code>: Hex color for the floating launcher and chat bubble header.
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Column 3: Sticky Live Preview Window */}
            <div style={{ position: 'sticky', top: '88px', alignSelf: 'start', height: 'fit-content' }}>
              <GlassCard style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Eye size={16} color="#25D366" /> Live Interactive Preview
                  </div>

                  {/* Device Switcher */}
                  <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', padding: '3px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <button
                      type="button"
                      onClick={() => setWaPreviewDevice('desktop')}
                      title="Desktop View"
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: waPreviewDevice === 'desktop' ? 'rgba(37,211,102,0.2)' : 'transparent',
                        color: waPreviewDevice === 'desktop' ? '#25D366' : 'var(--text-dim)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      <Laptop size={13} /> Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaPreviewDevice('mobile')}
                      title="Mobile View"
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: waPreviewDevice === 'mobile' ? 'rgba(37,211,102,0.2)' : 'transparent',
                        color: waPreviewDevice === 'mobile' ? '#25D366' : 'var(--text-dim)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      <Smartphone size={13} /> Mobile
                    </button>
                  </div>
                </div>

                {/* Validation Status Pill */}
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  marginBottom: '14px',
                  background: isAllValid ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                  border: isAllValid ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(245,158,11,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11.5px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isAllValid ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>
                    {isAllValid ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    {isAllValid ? 'Ready for Deployment' : 'Attention Needed'}
                  </div>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>
                    {isAllValid ? 'Valid phone & message' : 'Review warnings in form'}
                  </span>
                </div>

                {/* Mock Browser/Device Container */}
                <div style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: waPreviewDevice === 'mobile' ? '28px' : '14px',
                  height: '520px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  maxWidth: waPreviewDevice === 'mobile' ? '310px' : '100%',
                  margin: '0 auto',
                  boxShadow: waPreviewDevice === 'mobile' ? '0 12px 40px rgba(0,0,0,0.5)' : 'none',
                }}>
                  {/* Chrome Bar */}
                  <div style={{
                    background: 'var(--bg-card)',
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexShrink: 0,
                  }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {['#ef4444', '#f59e0b', '#22c55e'].map((c, i) => (
                        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                      ))}
                    </div>
                    <div style={{
                      flex: 1,
                      background: 'var(--bg-primary)',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '9.5px',
                      color: 'var(--text-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}>
                      <Globe size={9} /> yourbrand.com
                    </div>
                  </div>

                  {/* Simulated Webpage Skeleton */}
                  <div style={{ flex: 1, padding: '16px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ opacity: 0.25 }}>
                      <div style={{ width: '60%', height: 12, background: 'var(--text-dim)', borderRadius: '4px', marginBottom: '10px' }} />
                      <div style={{ width: '85%', height: 8, background: 'var(--text-dim)', borderRadius: '4px', marginBottom: '6px' }} />
                      <div style={{ width: '70%', height: 8, background: 'var(--text-dim)', borderRadius: '4px', marginBottom: '16px' }} />
                      <div style={{ width: '100%', height: 70, background: 'var(--text-dim)', borderRadius: '8px', marginBottom: '14px', opacity: 0.5 }} />
                      <div style={{ width: '50%', height: 8, background: 'var(--text-dim)', borderRadius: '4px', marginBottom: '6px' }} />
                      <div style={{ width: '75%', height: 8, background: 'var(--text-dim)', borderRadius: '4px' }} />
                    </div>

                    {/* Floating Widget Positioned */}
                    <div style={{
                      position: 'absolute',
                      bottom: 14,
                      [waPosition]: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: waPosition === 'left' ? 'flex-start' : 'flex-end',
                      gap: '8px',
                      zIndex: 10,
                    }}>

                      {/* Interactive Popup Window */}
                      {waPreviewOpen && (
                        <div style={{
                          width: waPreviewDevice === 'mobile' ? '240px' : '260px',
                          background: '#ffffff',
                          borderRadius: '14px',
                          overflow: 'hidden',
                          boxShadow: '0 12px 35px rgba(0,0,0,0.4)',
                          animation: 'fadeIn 0.25s ease',
                        }}>
                          {/* WhatsApp Header */}
                          <div style={{ background: waColor, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
                                🤖
                              </div>
                              <div>
                                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{waTitle || 'AI Assistant'}</div>
                                <div style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.85)' }}>{waSubtitle || 'Online'}</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setWaPreviewOpen(false)}
                              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: '15px', cursor: 'pointer', lineHeight: 1, padding: '2px' }}
                            >
                              ✕
                            </button>
                          </div>

                          {/* Chat Bubble Area */}
                          <div style={{ background: '#e5ddd5', padding: '12px' }}>
                            <div style={{
                              background: '#fff',
                              padding: '9px 12px',
                              borderRadius: '4px 10px 10px 10px',
                              fontSize: '11px',
                              color: '#111',
                              lineHeight: 1.45,
                              boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                            }}>
                              {waGreeting || 'Hi there! How can we assist you today?'}
                            </div>
                          </div>

                          {/* Chat Input Bar */}
                          <div style={{ padding: '8px 10px', background: '#f0f2f5', display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <input
                              readOnly
                              placeholder="Type a message..."
                              style={{ flex: 1, padding: '6px 10px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '10.5px', background: '#fff', outline: 'none' }}
                            />
                            <a
                              href={waDirectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Click to send message"
                              style={{ width: 28, height: 28, borderRadius: '50%', background: waColor, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                            >
                              <Send size={11} color="#fff" />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Floating WhatsApp Bubble */}
                      <div
                        onClick={() => setWaPreviewOpen(!waPreviewOpen)}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: waColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 6px 18px ${waColor}66`,
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          position: 'relative',
                        }}
                      >
                        <Phone size={20} color="#fff" />
                        <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `2px solid ${waColor}66`, animation: 'pulse 2s ease-in-out infinite' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Sandbox Interaction Hint */}
                <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-dim)' }}>
                  👆 Click the floating WhatsApp button above to toggle popup preview
                </div>
              </GlassCard>
            </div>
          </div>
      )}
    </div>
  );
};

export default ChatbotBuilder;
