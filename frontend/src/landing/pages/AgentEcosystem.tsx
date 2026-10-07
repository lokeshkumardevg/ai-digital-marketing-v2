import { useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Star, MessageSquareText, Send, HeartHandshake, BarChart3, MapPin,
  Users, Filter, Paintbrush, Settings, CheckCircle2, ArrowRight
} from 'lucide-react';

// @ts-ignore
import BotSVG from '../components/Bot';
// @ts-ignore
import Navbar from '../components/Navbar';
// @ts-ignore
import Footer from '../components/Footer';

const AGENTS = [
  {
    id: 'review-gen', name: 'Review Generation Agent', tag: 'Customer Feedback', icon: Star,
    color: 'from-yellow-400 to-orange-500', accent: '#f59e0b',
    role: 'Automatically tracks recent customers and sends them polite, personalized follow-ups (via WhatsApp, Email, or SMS) at the optimal time to request a review. Satisfied customers are directed to Google/Facebook, while dissatisfied customers are routed to the internal team for feedback resolution.',
    benefits: [
      'Experience up to 3x growth in positive online reviews.',
      'Protect your reputation by resolving negative feedback before it goes public.',
      'Massively boost local SEO and build trust through higher business ratings.'
    ]
  },
  
  {
    id: 'review-resp', name: 'Review Response Agent', tag: 'Reputation', icon: MessageSquareText,
    color: 'from-blue-400 to-indigo-500', accent: '#6366f1',
    role: 'Monitors platforms like Google and Facebook for new reviews, instantly analyzes the sentiment (positive, neutral, negative), and generates a human-like, professional, brand-aligned response.',
    benefits: [
      '0% Response Delay: Every customer feels heard and valued instantly.',
      'Improves brand image, customer loyalty, and boosts SEO through active engagement.'
    ]
  },
  {
    id: 'social-pub', name: 'Social Publishing Agent', tag: 'Content', icon: Send,
    color: 'from-pink-400 to-rose-500', accent: '#f43f5e',
    role: 'Automatically creates and schedules social media posts (images, text, hashtags). Analyzes trends to determine the optimal platform (Instagram, LinkedIn, Facebook, X) and the best time to post for maximum viral reach.',
    benefits: [
      'Acts as your 24/7 Digital Marketer, eliminating the need for a dedicated marketing team.',
      'Maintains active brand presence and high online visibility with zero manual effort.'
    ]
  },
  {
    id: 'social-eng', name: 'Social Engagement Agent', tag: 'Community', icon: HeartHandshake,
    color: 'from-rose-400 to-red-500', accent: '#ef4444',
    role: 'Automatically replies to social media comments, DMs, and brand mentions. Answers prospect questions interactively to nurture and convert them into warm leads.',
    benefits: [
      'Boosts audience engagement by over 200%.',
      'Never miss a potential inquiry or message, directly increasing sales opportunities.'
    ]
  },
  {
    id: 'reporting', name: 'Reporting Agent', tag: 'Analytics', icon: BarChart3,
    color: 'from-emerald-400 to-green-500', accent: '#10b981',
    role: 'Aggregates data across all platforms (Social Media, Ads, SEO, Reviews) into a centralized, easy-to-understand dashboard or PDF report. Provides deep analysis of ROI, reach, and conversion metrics.',
    benefits: [
      'Gain transparent, real-time insights into your business performance.',
      'Make confident, data-driven decisions on where to allocate campaign budgets.'
    ]
  },
  {
    id: 'listings', name: 'Listings Optimization Agent', tag: 'Local SEO', icon: MapPin,
    color: 'from-cyan-400 to-blue-500', accent: '#06b6d4',
    role: 'Ensures business details (Name, Address, Phone number) are accurate and updated across Google Business Profile, Yelp, and 50+ local directories. Automatically updates keywords and images.',
    benefits: [
      'Achieve top rankings in local searches (e.g., "Best restaurant near me").',
      'Customers always find the right information, driving higher foot traffic.'
    ]
  },
  {
    id: 'lead-gen', name: 'Lead Generation Agent', tag: 'Sales Pipeline', icon: Users,
    color: 'from-purple-400 to-fuchsia-500', accent: '#a855f7',
    role: 'Handles inbound traffic (website visitors, social media interactions) and outbound outreach (cold emails, LinkedIn). Identifies intent, qualifies prospects, and books warm leads for the sales team.',
    benefits: [
      'Fills your sales pipeline on complete auto-pilot.',
      'Drastically reduces Customer Acquisition Cost (CAC).'
    ]
  },
  {
    id: 'contact-seg', name: 'Contact Segmentation Agent', tag: 'CRM', icon: Filter,
    color: 'from-orange-400 to-amber-500', accent: '#f97316',
    role: 'Smartly divides thousands of CRM contacts based on behavior, purchase history, and demographics (e.g., "Hot Leads", "Past Customers", "Defected Customers").',
    benefits: [
      'Run highly targeted and personalized marketing campaigns.',
      'Increases conversion rates by 200% by sending the right message to the right person.'
    ]
  },
  {
    id: 'template', name: 'Template Design Agent', tag: 'Creative', icon: Paintbrush,
    color: 'from-teal-400 to-emerald-500', accent: '#14b8a6',
    role: 'Uses Generative AI to instantly create aesthetically pleasing, conversion-optimized designs and copy for emails, ads, landing pages, and social posts.',
    benefits: [
      'Saves the massive costs of hiring graphic designers and copywriters.',
      'Generates multiple variations in seconds for rapid A/B testing.'
    ]
  },
  {
    id: 'custom', name: 'Custom Agent', tag: 'Bespoke', icon: Settings,
    color: 'from-gray-400 to-slate-500', accent: '#94a3b8',
    role: 'A bespoke agent tailored to your business specific needs. Whether you require industry-specific data scraping or custom inventory integration, this agent is trained for your unique workflow.',
    benefits: [
      'Stand out from competitors by having your own proprietary AI system.',
      'Enjoy 100% flexibility and unparalleled scalability.'
    ]
  }
];

type Agent = (typeof AGENTS)[number];

function AgentPill({ agent, active, onSelect }: { agent: Agent; active: boolean; onSelect: () => void }) {
  const Icon = agent.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className="group flex w-full min-w-0 items-center gap-3 rounded-full border px-3 py-2.5 text-left transition-all duration-300 hover:-translate-y-0.5 sm:gap-4 sm:px-4 sm:py-3"
      style={
        active
          ? {
              borderColor: agent.accent,
              background: `linear-gradient(90deg, ${agent.accent}26, rgba(10,14,28,0.9) 70%)`,
              boxShadow: `0 0 32px -6px ${agent.accent}99`
            }
          : { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(15,20,36,0.7)' }
      }
    >
      <span
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${
          active ? `bg-gradient-to-br ${agent.color} shadow-lg` : 'bg-slate-700/60'
        }`}
      >
        <Icon size={19} className={active ? 'text-white' : 'text-slate-200'} />
      </span>
      <span className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-slate-100 sm:text-sm">{agent.name}</span>
      <ArrowRight
        size={18}
        className={`flex-shrink-0 transition-all ${active ? 'text-white' : 'text-slate-400 group-hover:translate-x-1 group-hover:text-white'}`}
      />
    </button>
  );
}

export default function AgentEcosystem() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const active = AGENTS.find(a => a.id === activeId) || null;
    const accent = active ? active.accent : '#3b82f6';
    const left = AGENTS.slice(0, 6);
  const right = AGENTS.slice(6);

  const select = (id: string) => {
    setActiveId(id);
    // below xl the hub sits above the pills, so bring it into view after a tap
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      hubRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050810] font-sans text-white selection:bg-blue-500/30">
      <Navbar />

      <main className="relative mx-auto max-w-[1400px] overflow-hidden px-6 pb-28 pt-[140px] lg:pt-[160px] ">
        <div
          className="pointer-events-none absolute left-1/2 top-[38%] h-[300px] w-[300px] -translate-x-1/2 rounded-full opacity-20 blur-[100px] transition-colors duration-700 sm:h-[520px] sm:w-[520px] sm:blur-[120px]"
          style={{ background: accent }}
        />

        {/* Hero */}
        <div className="relative mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-gradient-to-br from-white to-slate-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl md:text-6xl"
          >
            The Ultimate Agent Ecosystem
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base leading-relaxed text-slate-400 sm:text-lg"
          >
            A connected team of AI agents that automates and optimizes your business&apos;s digital presence and marketing. Every agent has a specific role, and together they grow your sales, engagement, and brand value.
          </motion.p>
        </div>

        {/* Section label */}
        <div className="relative mb-8 flex items-center justify-center gap-3 sm:mb-10 sm:gap-4">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-slate-500 sm:w-28" />
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:text-xs sm:tracking-[0.3em]">Meet Your AI Agents</h2>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-slate-500 sm:w-28" />
        </div>

        {/* xl: pills | hub | pills.  Below xl: hub on top, pills in a 1-2 column grid */}
        <div className="relative grid items-start gap-6 sm:gap-8 xl:grid-cols-[1fr_420px_1fr] xl:gap-6">
          {/* Hub */}
          <div ref={hubRef} className="relative order-first mx-auto w-full max-w-[460px] scroll-mt-24 xl:order-none xl:-mt-8 xl:max-w-[420px] xl:col-start-2 xl:row-start-1">
            {/* orbit ring, like the reference */}
            <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto aspect-square w-full max-w-[440px] xl:max-w-[400px]">
              {/* <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                <defs>
                  <linearGradient id="ringGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffffff" stopOpacity="0.12" />
                    <stop offset="0.6" stopColor={accent} stopOpacity="0.35" />
                    <stop offset="1" stopColor={accent} stopOpacity="0.95" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="49.5" fill="none" stroke="url(#ringGrad)" strokeWidth="0.35" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="0.3" />
              </svg> */}
              <motion.div
                className="absolute inset-0"
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              >
                <span className="absolute left-0 top-[55%] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: accent, boxShadow: `0 0 14px ${accent}` }} />
                <span className="absolute right-0 top-[55%] h-2.5 w-2.5 translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: accent, boxShadow: `0 0 14px ${accent}` }} />
                <span className="absolute left-[11%] top-[24%] h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_12px_#38bdf8]" />
                <span className="absolute right-[11%] top-[24%] h-1.5 w-1.5 rounded-full bg-amber-200 shadow-[0_0_10px_#fde68a]" />
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active ? active.id : 'idle'}
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10 }}
                transition={{ duration: 0.3 }}
                className="relative flex flex-col items-center px-3 pt-[15%] text-center sm:px-8 xl:px-4 xl:pt-[11%]"
              >
                {/* tile with halo rings */}
                <motion.div
                  animate={!active && !reduceMotion ? { y: [0, -8, 0] } : undefined}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative flex items-center justify-center"
                >
                  <span className="absolute h-[210%] w-[210%] rounded-full border border-white/[0.05]" />
                  <span className="absolute h-[160%] w-[160%] rounded-full border border-white/10" style={{ background: `radial-gradient(circle, ${accent}22, transparent 70%)` }} />
                  {active ? (
                    <div
                      className={`relative flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br ring-1 ring-white/25 sm:h-28 sm:w-28 sm:rounded-[32px] ${active.color}`}
                      style={{ boxShadow: `0 20px 60px -10px ${accent}aa, inset 0 2px 0 rgba(255,255,255,0.35)` }}
                    >
                      <active.icon size={52} className="text-white drop-shadow" strokeWidth={1.75} />
                    </div>
                  ) : (
                    <div className="relative h-32 w-32 sm:h-66 sm:w-66 [&>svg]:h-full [&>svg]:w-full">
                      <BotSVG />
                    </div>
                  )}
                </motion.div>

                {active ? (
                  <>
                    <h3 className="mt-10 text-2xl font-extrabold leading-tight tracking-tight sm:mt-12 sm:text-3xl xl:mt-9 xl:text-3xl">{active.name}</h3>
                    <span className="mt-4 rounded-full border border-white/10 bg-slate-800/70 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 sm:text-[11px]">
                      {active.tag}
                    </span>
                    <p className="mt-5 text-sm leading-relaxed text-slate-300 sm:text-[15px] xl:mt-4 xl:text-sm">{active.role}</p>
                    <div
                      className="mt-6 w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left backdrop-blur sm:p-5 xl:mt-5"
                      style={{ boxShadow: `0 0 50px -28px ${accent}` }}
                    >
                      <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Customer Benefits</h4>
                      <ul className="space-y-3 xl:space-y-2.5">
                        {active.benefits.map((b, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12 * i }}
                            className="flex items-start gap-3"
                          >
                            <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${active.color}`}>
                              <CheckCircle2 size={12} className="text-white" />
                            </span>
                            <span className="text-[13px] leading-relaxed text-slate-300 sm:text-sm">{b}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className="mt-10 pb-4 text-sm font-medium text-slate-400 sm:mt-12">Select an agent to see its details</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Left pills */}
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:col-start-1 xl:row-start-1 xl:grid-cols-1">
            {left.map(a => (
              <AgentPill key={a.id} agent={a} active={a.id === activeId} onSelect={() => select(a.id)} />
            ))}
          </div>

          {/* Right pills */}
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:col-start-3 xl:row-start-1 xl:mt-14 xl:grid-cols-1">
            {right.map(a => (
              <AgentPill key={a.id} agent={a} active={a.id === activeId} onSelect={() => select(a.id)} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}