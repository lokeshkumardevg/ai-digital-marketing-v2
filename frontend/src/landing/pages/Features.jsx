import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import ContactForm from '../components/ContactForm';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';
import FAQ from '../components/Faq';
import '../styles/animations.css';
import Button  from '../components/Button';
import { Link } from "react-router-dom";
import LaunchCTA from '../components/LaunchCTA';

// ─── Feature data ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    tag: 'Campaign Intelligence',
    title: 'Campaign Manager',
    subtitle: 'Launch multi-channel campaigns in under 60 seconds',
    description:
      'Wheedle.ai orchestrates your entire campaign lifecycle — from audience research and creative generation to bid management and scaling. Set a goal once, and our AI executes across Meta and Google autonomously.',
    bullets: [
      'AI-generated copy & creatives for every format',
      'Smart budget allocation across channels',
      'Real-time performance monitoring',
      'One-click campaign duplication & A/B testing',
    ],
    accent: '#0665ff',
    accentDim: 'rgba(6,101,255,0.12)',
    accentBorder: 'rgba(6,101,255,0.25)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    visual: 'campaign',
    reverse: false,
  },
  {
    tag: 'Creative Engine',
    title: 'AI Studio',
    subtitle: 'Generate on-brand visuals and copy in seconds',
    description:
      'Train a brand model on your guidelines, tone, and past assets. Then generate unlimited ad creatives, social posts, product banners, and video scripts that feel unmistakably yours — no designer required.',
    bullets: [
      'Brand voice training with your own content',
      'Multi-format output: static, carousel, video script',
      'Iterative refinement with natural language prompts',
      'Direct export to ad platforms',
    ],
    accent: '#818cf8',
    accentDim: 'rgba(129,140,248,0.12)',
    accentBorder: 'rgba(129,140,248,0.25)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 8v4l3 3" />
        <circle cx="18" cy="6" r="3" />
      </svg>
    ),
    visual: 'studio',
    reverse: true,
  },
  {
    tag: 'Analytics & Insights',
    title: 'Analytics & Reports',
    subtitle: 'See the numbers that actually move revenue',
    description:
      'Move beyond vanity metrics. Wheedle.ai surfaces attribution-level ROI, cohort analysis, and predictive forecasts — giving your team the context to make confident, data-backed decisions.',
    bullets: [
      'Multi-touch attribution across all channels',
      'Automated weekly performance digests',
      'Predictive ROAS and spend forecasting',
      'Custom dashboards with drag-and-drop widgets',
    ],
    accent: '#22d3ee',
    accentDim: 'rgba(34,211,238,0.12)',
    accentBorder: 'rgba(34,211,238,0.25)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
    visual: 'analytics',
    reverse: false,
  },
  {
    tag: 'Revenue Operations',
    title: 'Growth Tools',
    subtitle: 'Scale intelligently without scaling your team',
    description:
      'From automated retargeting sequences to competitive intelligence and landing page audits — Growth Tools packages the best-practice playbooks of top performance marketers into a single always-on system.',
    bullets: [
      'Automated retargeting & lookalike expansion',
      'Competitor ad tracking & creative spying',
      'Landing page health audit with AI recommendations',
      'Workflow builder for custom automation rules',
    ],
    accent: '#34d399',
    accentDim: 'rgba(52,211,153,0.12)',
    accentBorder: 'rgba(52,211,153,0.25)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    visual: 'growth',
    reverse: true,
  },
  {
    tag: 'Team & Collaboration',
    title: 'Workspace & Admin',
    subtitle: 'Built for teams that move fast',
    description:
      'Role-based access, multi-brand management, live activity feeds, and approval workflows — everything your marketing ops team needs to stay aligned across brands, regions, and channels.',
    bullets: [
      'Granular RBAC with custom permission sets',
      'Unlimited brand profiles per workspace',
      'Approval queues for creative sign-off',
      'Audit logs and change history',
    ],
    accent: '#f59e0b',
    accentDim: 'rgba(245,158,11,0.12)',
    accentBorder: 'rgba(245,158,11,0.25)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    visual: 'workspace',
    reverse: false,
  },
  {
    tag: 'Customer Intelligence',
    title: 'Dashboard & CRM',
    subtitle: 'One source of truth for every customer interaction',
    description:
      'Track leads from first ad click to closed deal. The integrated CRM syncs with your campaigns in real time, showing you exactly which creatives and audiences are driving pipeline — not just impressions.',
    bullets: [
      'Lead capture from ads directly into CRM',
      'Pipeline view with deal stage automation',
      'AI-generated follow-up scripts per lead',
      'LinkedIn CRM for B2B outreach',
    ],
    accent: '#e879f9',
    accentDim: 'rgba(232,121,249,0.12)',
    accentBorder: 'rgba(232,121,249,0.25)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
    visual: 'crm',
    reverse: true,
  },
];

const FEATURE_FAQS = [
  {
    q: 'How quickly can I launch my first campaign?',
    a: 'Most users launch their first AI-generated campaign within 10 minutes of connecting their ad accounts. The AI Setup Bot walks you through brand onboarding and generates your first set of creatives and targeting recommendations automatically.',
  },
  {
    q: 'Does AI Studio require design skills or assets to get started?',
    a: 'No design experience needed. You can start with just your brand name, website URL, and color palette. The AI will extract your visual identity and generate on-brand creatives. Uploading existing assets improves quality but is not required.',
  },
  {
    q: 'How does the Analytics attribution model work?',
    a: 'We use a data-driven multi-touch attribution model that weighs touchpoints based on their actual contribution to conversion, rather than assigning all credit to first or last click. You can also configure custom attribution windows per campaign.',
  },
  {
    q: 'Can I manage multiple brands or clients from one workspace?',
    a: 'Yes. Workspace & Admin supports unlimited brand profiles under one account, each with separate ad accounts, creative libraries, and team members. Agencies can white-label the interface and manage client brands with full isolation.',
  },
  {
    q: 'What integrations does Wheedle.ai support?',
    a: 'We natively integrate with Meta Business Suite, Google Ads, LinkedIn Ads, WhatsApp Business API, Shopify, WooCommerce, Zoho CRM, HubSpot, and Zapier (for custom workflows). Additional integrations are being added monthly.',
  },
];


 

// ─── Hero Section ─────────────────────────────────────────────────────────────

function FeaturesHero() {
  return (
    <section className="relative pt-28 pb-14 overflow-hidden bg-[#020817]">
      
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 w-[700px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0B5FFF]/15 blur-[160px]" />
      </div>

      {/* Concentric Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-[900px] h-[900px] rounded-full border border-white/[0.03]" />
        <div className="absolute w-[700px] h-[700px] rounded-full border border-white/[0.04]" />
        <div className="absolute w-[500px] h-[500px] rounded-full border border-white/[0.05]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#0665ff]/30 bg-[#0665ff]/10 mb-6 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_8px_#22d3ee] animate-pulse" />
          <span className="text-[11px] font-semibold tracking-[0.14em] text-[#60a5fa] uppercase">
            Campaign Intelligence Suite
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-white font-extrabold tracking-tight leading-tight mb-4">
          <span className="block text-3xl sm:text-4xl lg:text-5xl">
            Plan High-Performing Campaigns
          </span>

          <span className="block mt-2 text-2xl sm:text-3xl lg:text-[40px] font-semibold text-[#a9b8ff]">
            With AI-Driven Advertising Strategy
          </span>
        </h1>

        {/* Bottom Card */}
        <div className="mt-10 border border-white/10 rounded-2xl bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-[0_10px_35px_rgba(6,101,255,0.08)]">
          <div className="grid md:grid-cols-3">

            <div className="p-6 sm:p-7 border-b md:border-b-0 md:border-r border-white/10 text-left">
              <h3 className="text-white text-lg font-semibold mb-2">
                The Challenge
              </h3>

              <p className="text-[#a5b4cf] text-xs sm:text-sm leading-relaxed">
                Planning campaigns means juggling audience research,
                competitor analysis, budgeting and performance projections.
              </p>
            </div>

            <div className="p-6 sm:p-7 border-b md:border-b-0 md:border-r border-white/10 text-left">
              <h3 className="text-white text-lg font-semibold mb-2">
                The Solution
              </h3>

              <p className="text-[#a5b4cf] text-xs sm:text-sm leading-relaxed">
                Get a comprehensive, AI-generated advertising strategy
                in minutes with market analysis and audience insights.
              </p>
            </div>

            <div className="p-6 sm:p-7 text-left">
              <h3 className="text-white text-lg font-semibold mb-2">
                The Result
              </h3>

              <p className="text-[#a5b4cf] text-xs sm:text-sm leading-relaxed">
                Launch campaigns confidently with data-backed strategies
                that drive results, not guesswork.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

// ─── Feature Grid Overview (icon cards at top) ───────────────────────────────

function FeatureGrid() {
  const cards = [
    { icon: "🏠", title: "Dashboard", items: ["KPI Overview","Campaign Status","Alerts & Activity"] },
    { icon: "📢", title: "Campaign Manager", items: ["Campaign Creation","Audience Targeting","Multi-Platform Publishing"] },
    { icon: "🤖", title: "AI Studio", items: ["AI Templates","Content Generation","Prompt Customization"] },
    { icon: "🎨", title: "Creative Hub", active: true, items: ["AI Image Creation","Creative Library","Asset Management"] },
    { icon: "📊", title: "Analytics & Reports", items: ["Performance Tracking","ROI Insights","Report Export"] },
    { icon: "💎", title: "Brand Center", items: ["Brand Assets","Voice Settings","AI Personalization"] },
    { icon: "🛠️", title: "Growth Tools", items: ["Keyword Research","Competitor Analysis","Landing Page Review"] },
    { icon: "⚙️", title: "Workspace & Admin", items: ["Team Management","Billing & Plans","Settings & Integrations"] },
  ];

  return (
    <section className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="relative flex flex-col items-center text-center px-5 py-6 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
            style={{
              background: "linear-gradient(180deg,#07091B 0%,#090C22 100%)",
              border: card.active
                ? "2px solid #0EA5FF"
                : "1px solid rgba(96,112,255,.3)",
              boxShadow: card.active
                ? "0 0 24px rgba(14,165,255,.18)"
                : "none",
            }}
          >
            {/* top radial glow */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 0%,rgba(45,80,255,.10),transparent 65%)",
              }}
            />

            <div className="relative z-10 w-full">
              {/* icon */}
              <div className="text-3xl leading-none mb-3">
                {card.icon}
              </div>

              {/* title */}
              <h3
                className="text-base font-bold mb-3 tracking-wide"
                style={{
                  background: card.active
                    ? "linear-gradient(90deg,#38BDF8,#7DD3FC)"
                    : "linear-gradient(90deg,#7B8FFF,#A78BFA)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {card.title}
              </h3>

              {/* bullet list */}
              <ul className="flex flex-col gap-1.5">
                {card.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-1.5 text-xs text-[#9BA3C0]"
                  >
                    <span className="text-[#6070FF] flex-shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Testimonials (real results strip) ───────────────────────────────────────

function RealResults() {
  const pillars = [
    {
      title: "One coworker, not ten tools",
      body: "Teams that used to juggle separate review, listing, social and reporting tools run all of it from one centralized dashboard.",
    },
    {
      title: "Every post stays on-brand",
      body: "Brand voice, do's and don'ts are set once in Brand Center and every agent — social, reviews, creative — follows them automatically.",
    },
    {
      title: "Nothing publishes without a check",
      body: "Drafts wait for approval before anything goes live, so your team stays in control of what goes out under your name.",
    },
  ];

  return (
    <section className="relative py-16 overflow-hidden bg-[#00040f]">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,101,255,0.15),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Eyebrow */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#0665ff]/30 bg-[#0665ff]/10 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_8px_#22d3ee]" />
            <span className="text-[10px] font-semibold tracking-[0.12em] text-[#60a5fa] uppercase">Authentic Architecture</span>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-bold mb-10 bg-gradient-to-r from-white via-[#d7d8ff] to-[#7b8cff] bg-clip-text text-transparent">
          Built for marketing teams, not marketing theater
        </h2>

        {/* Cards */}
        <div className="flex flex-wrap justify-center gap-6">
          {pillars.map((pillar, index) => (
            <div
              key={index}
              className="w-full sm:w-[330px] rounded-2xl border border-white/10 bg-[#07122A]/80 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgba(6,101,255,0.08)] hover:border-[#0665ff]/50 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0665ff]/20 border border-[#0665ff]/30 text-[#22d3ee]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <h4 className="text-base font-bold text-white">
                  {pillar.title}
                </h4>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-300/80">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



// ─── Page ─────────────────────────────────────────────────────────────────────

function Features() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const animClass = entry.target.dataset.animation;
            entry.target.classList.add(animClass);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="overflow-hidden" style={{ background: '#00040f', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <div className="scroll-reveal opacity-0" data-animation="animate-zoom">
        <FeaturesHero />
      </div>

      {/* Quick overview grid */}
      <div className="scroll-reveal opacity-0" data-animation="animate-fade-up">
        <FeatureGrid />
      </div>
 
      {/* Real results */}
      <div className="scroll-reveal opacity-0" data-animation="animate-fade-up">
        <RealResults />
      </div>

      {/* campaign CTA */}
      <div className="scroll-reveal opacity-0" data-animation="animate-fade-up">
        <LaunchCTA />
      </div>

      {/* FAQ */}
      <div className="scroll-reveal opacity-0" data-animation="animate-fade-up">
        <FAQ
          faqs={FEATURE_FAQS}
          title="Frequently asked questions"
          subtitle="Everything you need to know about Wheedle.ai's features"
        />
      </div>

      {/* Contact Form */}
      <div className="scroll-reveal opacity-0" data-animation="animate-fade-left">
        <ContactForm />
      </div>

      {/* Newsletter */}
      <div className="scroll-reveal opacity-0" data-animation="animate-fade-right">
        <Newsletter />
      </div>

      {/* Footer */}
      <div className="scroll-reveal opacity-0" data-animation="animate-fade-up">
        <Footer />
      </div>
    </div>
  );
}

export default Features;