// src/landing/pages/AgentEcosystem.tsx
// Route: /agent-ecosystem
//
// Layout: dark hero (matches the floating navbar) -> light cream explorer.
//   1. Pick a coworker (sliding pill tabs)
//   2. See what that coworker owns (intro card)
//   3. Pick one of its agents; details show on the right (desktop) or open
//      inline under the agent (phones / tablets)
//
// Coworkers = the orchestration layer, same pattern as Birdeye's Jay / Myna / Robin.
// Names, domains and outcome metrics come straight from the Technical Spec, Section 4
// (Product vision and coworkers) — keep in sync with Coworkers.jsx, CoworkerDetail.jsx
// and Navbar.jsx if that table changes.
import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Star, MessageSquareText, Send, HeartHandshake, BarChart3, MapPin,
  Users, Filter, Paintbrush, Settings, Check, ArrowRight,
  Bot, ShieldCheck, Mic, ChevronDown, Megaphone, Search, Sparkles,
  Layers, Headphones, Calendar, Bell, Clock, TrendingUp, CheckSquare,
  Ticket, Target, FileText, Repeat
} from 'lucide-react';

// @ts-ignore
import Navbar from '../components/Navbar';
// @ts-ignore
import Footer from '../components/Footer';

const INK = '#0f1f3d';
const BLUE = '#1468e8';

const COWORKERS = [
  {
    id: 'growth', name: 'Max', role: 'Growth Coworker', domain: 'Growth',
    mascot: '/assets/mascots/aarav_HD.png',
    outcome: 'Ads, research, leads and audiences — measured by ROAS, cost per lead and AI visibility score.',
  },
  {
    id: 'presence', name: 'Stella', role: 'Presence Coworker', domain: 'Presence',
    mascot: '/assets/mascots/meera_HD.png',
    outcome: 'Reviews, listings, social and local pages — measured by review volume, rating and listing accuracy.',
  },
  {
    id: 'operations', name: 'Atlas', role: 'Operations Coworker', domain: 'Operations',
    mascot: '/assets/mascots/rohan_HD.png',
    outcome: 'Front desk, bookings and follow-up — measured by missed-call rate, bookings and no-show rate.',
  },
  {
    id: 'experience', name: 'Echo', role: 'Experience Coworker', domain: 'Experience',
    mascot: '/assets/mascots/kavi_HD.png',
    outcome: 'Feedback, insights and reporting — measured by response time, resolution rate and CSAT.',
  },
];

// All 27 agents matching the exact modules and Navbar lists
const AGENTS = [
  // ─── Max (Growth Coworker) ───
  {
    id: 'ads-campaign', coworker: 'growth', name: 'Ads Campaign Agent', tag: 'Paid Acquisition', icon: Megaphone,
    color: 'from-blue-500 to-indigo-600', accent: '#3b82f6',
    role: 'Autonomously builds, launches, and optimizes ad campaigns across Meta and Google Ads. Continuously tests creative angles, headlines, and bid targets to maximize ROAS.',
    benefits: [
      'Automated multi-channel ad creation in under 60 seconds.',
      'Algorithmic bid adjustments to prevent ad spend waste.',
      'Continuous A/B testing of visuals and sales copy.'
    ]
  },
  {
    id: 'deep-research', coworker: 'growth', name: 'Deep Research Agent', tag: 'Market Intelligence', icon: Search,
    color: 'from-cyan-500 to-blue-600', accent: '#06b6d4',
    role: 'Analyzes competitor ad campaigns, trending keywords, and customer search intent to identify untapped marketing opportunities and high-converting hooks.',
    benefits: [
      'Real-time competitor creative and spend intelligence.',
      'Keyword gap identification for search and paid acquisition.',
      'Actionable recommendations before deploying budget.'
    ]
  },
  {
    id: 'lead-gen', coworker: 'growth', name: 'Lead Generation Agent', tag: 'Sales Pipeline', icon: Users,
    color: 'from-purple-400 to-fuchsia-500', accent: '#a855f7',
    role: 'Handles inbound traffic (website visitors, social media interactions) and outbound outreach (cold emails, LinkedIn). Identifies intent, qualifies prospects, and books warm leads for the sales team.',
    benefits: [
      'Fills your sales pipeline on complete auto-pilot.',
      'Drastically reduces Customer Acquisition Cost (CAC).'
    ]
  },
  {
    id: 'contact-seg', coworker: 'growth', name: 'Contact Segmentation Agent', tag: 'CRM Intelligence', icon: Filter,
    color: 'from-orange-400 to-amber-500', accent: '#f97316',
    role: 'Smartly divides thousands of CRM contacts based on behavior, purchase history, and demographics (e.g., "Hot Leads", "Past Customers", "Defected Customers").',
    benefits: [
      'Run highly targeted and personalized marketing campaigns.',
      'Increases conversion rates by 200% by sending the right message to the right person.'
    ]
  },
  {
    id: 'ai-visibility', coworker: 'growth', name: 'AI Visibility Agent', tag: 'GEO & Search', icon: Sparkles,
    color: 'from-amber-400 to-yellow-500', accent: '#eab308',
    role: 'Audits and elevates how your brand appears across conversational AI engines like ChatGPT, Gemini, Perplexity, and Apple Intelligence.',
    benefits: [
      'Increases brand citation frequency in AI answer engines.',
      'Monitors sentiment and brand accuracy across LLM search results.',
      'Keeps your brand top of mind in the AI-search era.'
    ]
  },
  {
    id: 'template', coworker: 'growth', name: 'Template Design Agent', tag: 'Creative Lab', icon: Paintbrush,
    color: 'from-teal-400 to-emerald-500', accent: '#14b8a6',
    role: 'Uses Generative AI to instantly create aesthetically pleasing, conversion-optimized designs and copy for emails, ads, landing pages, and social posts.',
    benefits: [
      'Saves the massive costs of hiring graphic designers and copywriters.',
      'Generates multiple variations in seconds for rapid A/B testing.'
    ]
  },
  {
    id: 'mkt-automation', coworker: 'growth', name: 'Marketing Automation Agent', tag: 'Lifecycle Journeys', icon: Settings,
    color: 'from-sky-400 to-blue-500', accent: '#0ea5e9',
    role: 'Runs follow-up journeys across email, WhatsApp and SMS, triggered by what each contact does: signs up, abandons a visit, buys, or goes quiet.',
    benefits: [
      'Keeps every lead and customer in touch without anyone remembering to send the next message.',
      'Frees your team from repetitive campaign set-up.'
    ]
  },

  // ─── Stella (Presence Coworker) ───
  {
    id: 'review-gen', coworker: 'presence', name: 'Review Generation Agent', tag: 'Customer Feedback', icon: Star,
    color: 'from-yellow-400 to-orange-500', accent: '#f59e0b',
    role: 'Automatically tracks recent customers and sends them polite, personalized follow-ups (via WhatsApp, Email, or SMS) at the optimal time to request a review. Satisfied customers are directed to Google/Facebook, while dissatisfied customers are routed to the internal team for feedback resolution.',
    benefits: [
      'Experience up to 3x growth in positive online reviews.',
      'Protect your reputation by resolving negative feedback before it goes public.',
      'Massively boost local SEO and build trust through higher business ratings.'
    ]
  },
  {
    id: 'review-resp', coworker: 'presence', name: 'Review Response Agent', tag: 'Reputation', icon: MessageSquareText,
    color: 'from-blue-400 to-indigo-500', accent: '#6366f1',
    role: 'Monitors platforms like Google and Facebook for new reviews, instantly analyzes the sentiment (positive, neutral, negative), and generates a human-like, professional, brand-aligned response.',
    benefits: [
      '0% Response Delay: Every customer feels heard and valued instantly.',
      'Improves brand image, customer loyalty, and boosts SEO through active engagement.'
    ]
  },
  {
    id: 'listings', coworker: 'presence', name: 'Listings Optimization Agent', tag: 'Local SEO', icon: MapPin,
    color: 'from-cyan-400 to-blue-500', accent: '#06b6d4',
    role: 'Ensures business details (Name, Address, Phone number) are accurate and updated across Google Business Profile, Yelp, and 50+ local directories. Automatically updates keywords and images.',
    benefits: [
      'Achieve top rankings in local searches (e.g., "Best restaurant near me").',
      'Customers always find the right information, driving higher foot traffic.'
    ]
  },
  {
    id: 'local-pages', coworker: 'presence', name: 'Local Pages Agent', tag: 'Multi-Location SEO', icon: Layers,
    color: 'from-emerald-400 to-teal-500', accent: '#10b981',
    role: 'Generates and updates dedicated, high-converting location landing pages for every branch, clinic, or store with local schema markup and customer reviews.',
    benefits: [
      'Dominates hyper-local search queries for multi-location brands.',
      'Dynamically displays live reviews, directions, and branch hours.',
      'Zero manual web development needed per location.'
    ]
  },
  {
    id: 'social-pub', coworker: 'presence', name: 'Social Publishing Agent', tag: 'Content', icon: Send,
    color: 'from-pink-400 to-rose-500', accent: '#f43f5e',
    role: 'Automatically creates and schedules social media posts (images, text, hashtags). Analyzes trends to determine the optimal platform (Instagram, LinkedIn, Facebook, X) and the best time to post for maximum viral reach.',
    benefits: [
      'Acts as your 24/7 Digital Marketer, eliminating the need for a dedicated marketing team.',
      'Maintains active brand presence and high online visibility with zero manual effort.'
    ]
  },
  {
    id: 'social-eng', coworker: 'presence', name: 'Social Engagement Agent', tag: 'Community', icon: HeartHandshake,
    color: 'from-rose-400 to-red-500', accent: '#ef4444',
    role: 'Automatically replies to social media comments, DMs, and brand mentions. Answers prospect questions interactively to nurture and convert them into warm leads.',
    benefits: [
      'Boosts audience engagement by over 200%.',
      'Never miss a potential inquiry or message, directly increasing sales opportunities.'
    ]
  },
  {
    id: 'chatbot', coworker: 'presence', name: 'Chatbot Agent', tag: 'Conversations', icon: Bot,
    color: 'from-indigo-400 to-violet-500', accent: '#8b5cf6',
    role: 'Answers visitor questions on your website and listings, captures contact details, and hands the conversation to your team when a person is needed.',
    benefits: [
      'Visitors get an answer straight away, including outside business hours.',
      'Turns anonymous visits into leads your team can follow up.'
    ]
  },

  // ─── Atlas (Operations Coworker) ───
  {
    id: 'front-desk', coworker: 'operations', name: 'Front Desk Agent', tag: 'Virtual Reception', icon: Headphones,
    color: 'from-emerald-500 to-teal-600', accent: '#059669',
    role: 'Operates as an always-on 24/7 digital front desk. Greets incoming callers, answers common queries, routes high-priority calls, and captures inquiry details.',
    benefits: [
      'Zero missed incoming calls or client inquiries during rush hours.',
      'Collects intake information before human staff steps in.',
      'Operates seamlessly outside standard office hours.'
    ]
  },
  {
    id: 'appointments', coworker: 'operations', name: 'Appointments Agent', tag: 'Smart Scheduling', icon: Calendar,
    color: 'from-green-500 to-emerald-600', accent: '#10b981',
    role: 'Syncs with Google Calendar, Outlook, and CRM schedules to book, adjust, and confirm appointments with clients over chat, voice, or web widgets.',
    benefits: [
      'Self-service 2-way scheduling without email ping-pong.',
      'Auto-prevents double bookings and enforces custom buffer times.',
      'Syncs directly into your core business calendar.'
    ]
  },
  {
    id: 'reminders', coworker: 'operations', name: 'Reminders Agent', tag: 'Attendance Guard', icon: Bell,
    color: 'from-teal-500 to-cyan-600', accent: '#14b8a6',
    role: 'Dispatches automated, timely reminders via WhatsApp, SMS, and email before scheduled appointments to dramatically cut down on no-shows.',
    benefits: [
      'Reduces costly client no-show rates by up to 45%.',
      'Offers instant 1-click confirmation or reschedule links.',
      'Customizable message templates tailored to your brand voice.'
    ]
  },
  {
    id: 'waitlist-recall', coworker: 'operations', name: 'Waitlist & Recall Agent', tag: 'Capacity Filler', icon: Clock,
    color: 'from-cyan-500 to-blue-600', accent: '#06b6d4',
    role: 'Monitors canceled slots and immediately reaches out to waitlisted customers to fill empty calendar spots, protecting daily business revenue.',
    benefits: [
      'Instantly rescues lost revenue from last-minute cancellations.',
      'Recalls overdue patients or clients who haven\'t booked recently.',
      'Fills calendar gaps without front desk staff having to call manually.'
    ]
  },
  {
    id: 'lead-followup', coworker: 'operations', name: 'Lead Follow-up Agent', tag: 'Speed-to-Lead', icon: TrendingUp,
    color: 'from-blue-500 to-indigo-600', accent: '#3b82f6',
    role: 'Contacts every new lead within 60 seconds of submission across phone call, text, or WhatsApp to qualify their requirements and lock in next steps.',
    benefits: [
      'Achieves industry-leading sub-minute response times.',
      'Converts cold web submissions into verified warm consultations.',
      'Transfers high-intent prospects straight to available agents.'
    ]
  },
  {
    id: 'insurance', coworker: 'operations', name: 'Insurance Verification Agent', tag: 'Eligibility Check', icon: ShieldCheck,
    color: 'from-emerald-400 to-teal-500', accent: '#10b981',
    role: 'Checks a customer\'s insurance details before their visit and flags anything that is missing or needs correcting, so the front desk is not left chasing it at check-in.',
    benefits: [
      'Fewer surprises at the front desk on the day of the visit.',
      'Frees your staff from manual eligibility checks.'
    ]
  },
  {
    id: 'multi-modal', coworker: 'operations', name: 'Multi-Modal Agent', tag: 'Voice, Email, Text', icon: Mic,
    color: 'from-green-400 to-emerald-600', accent: '#16a34a',
    role: 'Keeps one conversation going across voice calls, email and text. The context follows the customer when they switch channel, so nobody has to repeat themselves.',
    benefits: [
      'Customers can reach you in the way that suits them.',
      'Your team sees the whole conversation in one place.'
    ]
  },

  // ─── Echo (Experience Coworker) ───
  {
    id: 'survey', coworker: 'experience', name: 'Survey Agent', tag: 'Customer Voice', icon: CheckSquare,
    color: 'from-rose-500 to-pink-600', accent: '#f43f5e',
    role: 'Deploys micro-surveys (CSAT, NPS, CES) at critical customer journey touchpoints via WhatsApp, SMS, or post-purchase web prompts.',
    benefits: [
      'Achieves up to 4x higher response rates with conversational format.',
      'Instant alert triggers when an unhappy score is registered.',
      'Benchmarks customer satisfaction metrics across branches over time.'
    ]
  },
  {
    id: 'sentiment-insights', coworker: 'experience', name: 'Sentiment & Insights Agent', tag: 'Text Analytics', icon: BarChart3,
    color: 'from-red-500 to-rose-600', accent: '#e11d48',
    role: 'Reads thousands of customer reviews, survey answers, and social mentions to identify root causes of satisfaction or complaints.',
    benefits: [
      'Pinpoints specific operational bottlenecks (e.g. wait times, product issues).',
      'Categorizes sentiment trends by product, location, or staff member.',
      'Translates raw feedback into executive priority actions.'
    ]
  },
  {
    id: 'ticketing', coworker: 'experience', name: 'Ticketing Agent', tag: 'Issue Escalation', icon: Ticket,
    color: 'from-orange-500 to-amber-600', accent: '#ea580c',
    role: 'Converts negative sentiment, failed deliveries, or urgent complaints into prioritized support tickets and notifies the designated team manager.',
    benefits: [
      'Guarantees zero unresolved negative customer incidents.',
      'Routes high-priority tickets directly to Slack, CRM, or WhatsApp.',
      'Tracks resolution SLA times from incident to customer reconciliation.'
    ]
  },
  {
    id: 'exp-followup', coworker: 'experience', name: 'Experience Follow-up Agent', tag: 'Customer Retention', icon: Repeat,
    color: 'from-pink-500 to-rose-600', accent: '#ec4899',
    role: 'Reaches back out to dissatisfied or churn-risk customers after an issue has been resolved to rebuild trust and prevent negative word-of-mouth.',
    benefits: [
      'Turns unhappy customers into loyal brand advocates.',
      'Recovers lost business and decreases customer churn rate.',
      'Closes the feedback loop with personalized management messages.'
    ]
  },
  {
    id: 'competitor-analysis', coworker: 'experience', name: 'Competitor Analysis Agent', tag: 'Market Benchmarking', icon: Target,
    color: 'from-purple-500 to-indigo-600', accent: '#9333ea',
    role: 'Tracks competitor ratings, review velocity, and customer sentiment to benchmark your brand experience against local and national rivals.',
    benefits: [
      'Uncovers competitors\' top weaknesses to exploit in marketing.',
      'Compares your NPS and star ratings against direct rivals.',
      'Delivers automated monthly market positioning briefs.'
    ]
  },
  {
    id: 'reporting', coworker: 'experience', name: 'Reporting Agent', tag: 'Executive Intelligence', icon: FileText,
    color: 'from-emerald-400 to-green-500', accent: '#10b981',
    role: 'Aggregates data across all platforms (Social Media, Ads, SEO, Reviews) into a centralized, easy-to-understand dashboard or PDF report. Provides deep analysis of ROI, reach, and conversion metrics.',
    benefits: [
      'Gain transparent, real-time insights into your business performance.',
      'Make confident, data-driven decisions on where to allocate campaign budgets.'
    ]
  }
];

type Agent = (typeof AGENTS)[number];
type Coworker = (typeof COWORKERS)[number];

/* ── Coworker tabs with a sliding active pill ───────────────────────────── */
function CoworkerTabs({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const listRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [animate, setAnimate] = useState(false);

  const measure = () => {
    const el = refs.current[activeId];
    if (!el) return;
    setPill({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight });
  };

  useLayoutEffect(() => {
    measure();
    if (animate) refs.current[activeId]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    setAnimate(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useLayoutEffect(() => {
    const ro = new ResizeObserver(measure);
    if (listRef.current) ro.observe(listRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + COWORKERS.length) % COWORKERS.length;
    onSelect(COWORKERS[next].id);
    refs.current[COWORKERS[next].id]?.focus();
  };

  return (
    <div className="flex overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div ref={listRef} role="tablist" aria-label="AI coworkers" className="relative mx-auto flex flex-shrink-0 items-center gap-1 rounded-full bg-[#f1efeb] p-1 sm:p-1.5">
        {pill && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 rounded-full bg-white shadow-[0_6px_20px_rgba(15,31,61,0.10)] motion-reduce:transition-none"
            style={{
              width: pill.width,
              height: pill.height,
              transform: `translate(${pill.left}px, ${pill.top}px)`,
              transition: animate ? 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1), width 450ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none'
            }}
          />
        )}
        {COWORKERS.map((cw, i) => {
          const active = cw.id === activeId;
          return (
            <button
              key={cw.id}
              ref={el => { refs.current[cw.id] = el; }}
              role="tab"
              type="button"
              aria-label={`${cw.name}, ${cw.domain}`}
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onSelect(cw.id)}
              onKeyDown={e => onKeyDown(e, i)}
              className={`relative z-[1] flex items-center gap-2 rounded-full py-1.5 pl-1.5 text-left transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1468e8] sm:gap-3 sm:py-2 sm:pl-2 sm:pr-8 ${active ? 'pr-4' : 'pr-1.5 hover:bg-white/50'}`}
            >
              <span className="h-[42px] w-[42px] flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-b from-[#e8f1fb] to-[#cfe0f3]">
                <img src={cw.mascot} alt="" draggable={false} className="h-full w-full object-cover object-top" />
              </span>
              <span className={`${active ? 'flex' : 'hidden sm:flex'} flex-col leading-tight`}>
                <span className="text-[14px] font-medium sm:text-[15px]" style={{ color: INK }}>{cw.name}</span>
                <span className="text-[12px] text-slate-500 sm:text-[13px]">{cw.domain}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Details of one agent (used in the right panel and inline on small screens) ── */
function AgentDetail({ agent, coworker }: { agent: Agent; coworker: Coworker }) {
  const Icon = agent.icon;
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-[0_2px_28px_rgba(15,31,61,0.07)] ring-1 ring-black/5 sm:rounded-[32px] sm:p-8">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1468e8] to-[#1abfdf] shadow-[0_10px_24px_rgba(20,104,232,0.28)] sm:h-16 sm:w-16">
          <Icon className="h-7 w-7 text-white sm:h-8 sm:w-8" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <h3 className="text-[21px] font-extrabold leading-tight tracking-tight sm:text-[26px]" style={{ color: INK }}>{agent.name}</h3>
          <span className="mt-1.5 inline-block rounded-full bg-[#e4effd] px-3 py-1 text-[12px] font-medium" style={{ color: BLUE }}>{agent.tag}</span>
        </div>
      </div>

      <p className="mt-5 text-[15px] leading-relaxed text-slate-600 sm:text-[16px]">{agent.role}</p>

      <div className="mt-6 rounded-2xl bg-[#f4f8ff] p-5 sm:p-6">
        <h4 className="text-[15px] font-semibold" style={{ color: INK }}>What you get</h4>
        <ul className="mt-3 space-y-3">
          {agent.benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1468e8] to-[#1abfdf]">
                <Check size={12} strokeWidth={3} className="text-white" />
              </span>
              <span className="text-[14.5px] leading-relaxed text-slate-600">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1468e8] to-[#1abfdf] px-6 py-3 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(20,104,232,0.3)] transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1468e8]">
          Start free trial <ArrowRight size={16} />
        </Link>
        <Link to={`/coworkers/${coworker.id}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f1efeb] px-6 py-3 text-[15px] font-medium transition-colors hover:bg-[#e9e6e1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1468e8]" style={{ color: INK }}>
          Meet {coworker.name}
        </Link>
      </div>
    </div>
  );
}

/* ── One agent in the list ── */
function AgentRow({ agent, active, onSelect }: { agent: Agent; active: boolean; onSelect: () => void }) {
  const Icon = agent.icon;
  return (
    <button
      id={agent.id}
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-expanded={active}
      className={`group flex w-full min-w-0 items-center gap-4 rounded-[22px] p-3.5 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1468e8] sm:p-4 ${
        active
          ? 'bg-white shadow-[0_8px_30px_rgba(20,104,232,0.16)] ring-2 ring-[#1468e8]/50'
          : 'bg-white/70 ring-1 ring-black/5 hover:bg-white hover:shadow-[0_6px_22px_rgba(15,31,61,0.08)]'
      }`}
    >
      <span className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-colors duration-300 ${active ? 'bg-gradient-to-br from-[#1468e8] to-[#1abfdf]' : 'bg-[#e4effd]'}`}>
        <Icon size={22} strokeWidth={1.8} style={{ color: active ? '#fff' : BLUE }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15.5px] font-semibold leading-snug sm:text-[16.5px]" style={{ color: INK }}>{agent.name}</span>
        <span className="mt-0.5 block text-[13px] text-slate-500">{agent.tag}</span>
      </span>
      <ChevronDown size={18} className={`flex-shrink-0 transition-transform duration-300 lg:hidden ${active ? 'rotate-180' : ''}`} style={{ color: BLUE }} />
      <ArrowRight size={18} className={`hidden flex-shrink-0 transition-all lg:block ${active ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} style={{ color: BLUE }} />
    </button>
  );
}

export default function AgentEcosystem() {
  const location = useLocation();
  const [coworkerId, setCoworkerId] = useState<string>(COWORKERS[0].id);
  const [agentId, setAgentId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  // Synchronize URL params / hash to coworker and agent
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qCoworker = params.get('coworker');
    const qAgent = params.get('agent');
    const rawHash = location.hash ? location.hash.replace('#', '') : '';

    const targetAgentId = qAgent || rawHash;
    const targetAgent = AGENTS.find(a => a.id === targetAgentId);

    if (targetAgent) {
      setCoworkerId(targetAgent.coworker);
      setAgentId(targetAgent.id);
      setTimeout(() => {
        const el = document.getElementById(targetAgent.id) || document.getElementById('explorer-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return;
    }

    const targetCoworkerId = qCoworker || rawHash;
    const targetCoworker = COWORKERS.find(c => c.id === targetCoworkerId);

    if (targetCoworker) {
      setCoworkerId(targetCoworker.id);
      const firstAgent = AGENTS.find(a => a.coworker === targetCoworker.id);
      if (firstAgent) setAgentId(firstAgent.id);
      setTimeout(() => {
        const el = document.getElementById('explorer-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }
  }, [location.search, location.hash]);

  const coworker = COWORKERS.find(c => c.id === coworkerId) || COWORKERS[0];
  const agents = AGENTS.filter(a => a.coworker === coworkerId);
  // always show one agent: the picked one, or the coworker's first
  const selected = agents.find(a => a.id === agentId) || agents[0] || null;

  const fade = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.25 } };

  return (
    <div className="min-h-screen bg-[#fcfbf8] font-sans" style={{ overflowX: 'clip' }}>
      <Navbar />

      {/* ───────── Hero (dark, matches navbar) ───────── */}
      <section className="relative overflow-hidden rounded-b-[36px] bg-[#060a16] sm:rounded-b-[56px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(55% 80% at 50% 0%, rgba(20,104,232,0.32) 0%, rgba(6,10,22,0) 70%), radial-gradient(35% 50% at 90% 100%, rgba(26,191,223,0.12) 0%, rgba(6,10,22,0) 70%)' }}
        />
        <div className="relative mx-auto max-w-[900px] px-4 pb-14 pt-28 text-center sm:px-6 sm:pb-20 sm:pt-36">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/10 py-1.5 pl-2 pr-4 ring-1 ring-white/10">
            <span aria-hidden="true" className="flex items-center">
              {COWORKERS.map((c, i) => (
                <span key={c.id} className={`h-7 w-7 overflow-hidden rounded-full bg-gradient-to-b from-[#e8f1fb] to-[#cfe0f3] ring-2 ring-[#0c1224] ${i > 0 ? '-ml-2' : ''}`} style={{ zIndex: COWORKERS.length - i }}>
                  <img src={c.mascot} alt="" draggable={false} className="h-full w-full object-cover object-top" />
                </span>
              ))}
            </span>
            <span className="text-[13px] font-medium text-white/80">{COWORKERS.length} coworkers · {AGENTS.length} agents</span>
          </div>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-[34px] font-extrabold leading-[1.08] tracking-[-0.025em] text-white sm:text-[48px] md:text-[60px]"
          >
            The Ultimate Agent{' '}
            <span className="bg-gradient-to-r from-[#4da3ff] to-[#1abfdf] bg-clip-text text-transparent">Ecosystem</span>
          </motion.h1>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mx-auto mt-5 max-w-[680px] text-[16px] leading-relaxed text-slate-300 sm:text-[18px]"
          >
            A connected team of AI agents that automates and optimizes your business&apos;s digital presence and marketing. Every agent has a specific role, and together they grow your sales, engagement, and brand value.
          </motion.p>
        </div>
      </section>

      {/* ───────── Explorer ───────── */}
      <main id="explorer-section" className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-20">
        <div className="text-center">
          <h2 className="text-[26px] font-extrabold tracking-tight sm:text-[34px]" style={{ color: INK }}>Meet your AI agents</h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-slate-500 sm:text-[17px]">
            Coworkers own the outcome. Agents are how they get it done. Pick a coworker, then an agent.
          </p>
        </div>

        <div className="mt-8 sm:mt-10">
          <CoworkerTabs activeId={coworkerId} onSelect={id => { setCoworkerId(id); setAgentId(null); }} />
        </div>

        {/* Coworker intro */}
        <AnimatePresence mode="wait">
          <motion.div
            key={coworker.id}
            {...fade}
            className="mt-6 flex flex-col items-center gap-5 rounded-[28px] bg-[#f6f4f1] p-6 text-center sm:mt-8 sm:flex-row sm:gap-8 sm:rounded-[36px] sm:p-8 sm:text-left"
          >
            <span className="relative h-[104px] w-[104px] flex-shrink-0 sm:h-[120px] sm:w-[120px]">
              <span aria-hidden="true" className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 50% 40%, #f3f9ff 0%, #e0edfb 60%, #d3e5f8 100%)' }} />
              <img src={coworker.mascot} alt={`${coworker.name}, the ${coworker.role.toLowerCase()}`} draggable={false} className="absolute bottom-0 left-1/2 h-[112%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                <h3 className="text-[26px] font-extrabold tracking-tight sm:text-[30px]" style={{ color: INK }}>{coworker.name}</h3>
                <span className="rounded-full bg-white px-3 py-1 text-[12.5px] font-medium text-slate-600 ring-1 ring-black/5">{coworker.role}</span>
              </div>
              <p className="mt-2 max-w-[640px] text-[15px] leading-relaxed text-slate-600 sm:text-[16.5px]">{coworker.outcome}</p>
            </div>
            <Link to={`/coworkers/${coworker.id}`} className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-medium shadow-[0_4px_16px_rgba(15,31,61,0.07)] transition-shadow hover:shadow-[0_6px_22px_rgba(20,104,232,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1468e8]" style={{ color: INK }}>
              Meet {coworker.name} <ArrowRight size={17} style={{ color: BLUE }} />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Agents */}
        {agents.length === 0 ? (
          <p className="mt-8 rounded-[28px] bg-white p-8 text-center text-[15px] text-slate-500 ring-1 ring-black/5">
            {coworker.name}&apos;s agents are on the roadmap — launching soon.
          </p>
        ) : (
          <div className="mt-6 grid items-start gap-6 sm:mt-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
            {/* list (phones/tablets: the selected agent opens inline underneath it) */}
            <div className="flex flex-col gap-3">
              {agents.map(a => {
                const isActive = selected?.id === a.id;
                return (
                  <div key={a.id}>
                    <AgentRow agent={a} active={isActive} onSelect={() => setAgentId(a.id)} />
                    {isActive && (
                      <motion.div
                        key={`inline-${a.id}`}
                        initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 lg:hidden"
                      >
                        <AgentDetail agent={a} coworker={coworker} />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* desktop detail panel */}
            <div className="hidden lg:sticky lg:top-28 lg:block">
              <AnimatePresence mode="wait">
                {selected && (
                  <motion.div key={selected.id} {...fade}>
                    <AgentDetail agent={selected} coworker={coworker} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}