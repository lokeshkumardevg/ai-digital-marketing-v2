import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import ContactForm from '../components/ContactForm';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';
import FAQ from '../components/FAQ';
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020817]">
      
      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 w-[900px] h-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0B5FFF]/15 blur-[180px]" />
      </div>

      {/* Concentric Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-[1200px] h-[1200px] rounded-full border border-white/[0.03]" />
        <div className="absolute w-[950px] h-[950px] rounded-full border border-white/[0.04]" />
        <div className="absolute w-[700px] h-[700px] rounded-full border border-white/[0.05]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#0665ff] to-[#28b7ff] mb-10">
          <span className="bg-white text-[#0665ff] text-[10px] font-bold px-2 py-0.5 rounded-full">
            NEW
          </span>

          <span className="text-white text-sm font-medium">
            Latest integration just arrived
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-white font-bold leading-none tracking-tight">
          <span className="block text-[56px] md:text-[72px]">
            Plan High-Performing Campaigns
          </span>

          <span className="block mt-3 text-[50px] md:text-[66px] font-medium text-[#a9b8ff]">
            With AI-Driven Advertising Strategy
          </span>
        </h1>

        {/* Bottom Card */}
        <div className="mt-16 border border-white/10 rounded-3xl bg-white/[0.02] backdrop-blur-xl overflow-hidden">
          <div className="grid md:grid-cols-3">

            <div className="p-10 border-b md:border-b-0 md:border-r border-white/10">
              <h3 className="text-white text-2xl font-semibold mb-5">
                The Challenge
              </h3>

              <p className="text-[#a5b4cf] text-sm leading-relaxed">
                Planning campaigns means juggling audience research,
                competitor analysis, budgeting and performance projections.
              </p>
            </div>

            <div className="p-10 border-b md:border-b-0 md:border-r border-white/10">
              <h3 className="text-white text-2xl font-semibold mb-5">
                The Solution
              </h3>

              <p className="text-[#a5b4cf] text-sm leading-relaxed">
                Get a comprehensive, AI-generated advertising strategy
                in minutes with market analysis and audience insights.
              </p>
            </div>

            <div className="p-10">
              <h3 className="text-white text-2xl font-semibold mb-5">
                The Result
              </h3>

              <p className="text-[#a5b4cf] text-sm leading-relaxed">
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
   <section
  className="relative px-16 lg:px-20 xl:px-30 py-10 rounded-2xl"
  style={{
    background:
      "linear-gradient(135deg,#060818 0%,#0a0e24 50%,#060e1a 100%)"
  }}
>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className="relative flex flex-col items-center text-center px-6 pt-7 pb-6 rounded-[22px] overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(180deg,#07091B 0%,#090C22 100%)",
              border: card.active
                ? "2px solid #0EA5FF"
                : "1px solid rgba(96,112,255,.38)",
              boxShadow: card.active
                ? "0 0 28px rgba(14,165,255,.22)"
                : "none",
            }}
          >
            {/* top radial glow */}
            <div
              className="absolute inset-0 rounded-[22px] pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 0%,rgba(45,80,255,.10),transparent 65%)",
              }}
            />

            <div className="relative z-10 w-full">
              {/* icon */}
              <div className="text-[42px] leading-none mb-[18px]">
                {card.icon}
              </div>

              {/* title */}
              <h3
                className="text-[18px] font-bold mb-[14px] tracking-wide"
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
              <ul className="flex flex-col gap-[6px]">
                {card.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-[6px] text-[13px] text-[#9BA3C0]"
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
  const reviews = [
    {
      name: "Reviewer name",
      time: "1 month ago",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      review:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      name: "Reviewer name",
      time: "1 month ago",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
      review:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      name: "Reviewer name",
      time: "1 month ago",
      image:
        "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&q=80",
      review:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-black">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#0f3cff30,transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Heading */}
<h2
  className="
    text-center
    text-[48px]
    md:text-[64px]
    font-medium
    mb-16
    bg-gradient-to-r
    from-white
    via-[#d7d8ff]
    to-[#7b8cff]
    bg-clip-text
    text-transparent
  "
>
  Real results from Real marketers
</h2>

        {/* Cards */}
        <div className="flex flex-wrap justify-center gap-9">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="w-[350px] bg-white rounded-xl p-5 shadow-lg"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover"
                />

                <div>
                  <h4 className="text-sm font-semibold text-gray-700">
                    {review.name}
                  </h4>
                  <p className="text-xs text-gray-400">{review.time}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                <span className="text-xs text-gray-700 font-medium">5.0</span>

                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    width="12"
                    height="12"
                    fill="#FBBF24"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.951-.69l1.068-3.292z" />
                  </svg>
                ))}

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="#4285F4"
                >
                  <path d="M21.35 11.1H12v2.98h5.4c-.23 1.48-1.72 4.35-5.4 4.35-3.25 0-5.9-2.69-5.9-6s2.65-6 5.9-6c1.85 0 3.1.79 3.81 1.46l2.6-2.52C16.77 3.84 14.61 3 12 3 7.03 3 3 7.03 3 12s4.03 9 9 9c5.2 0 8.64-3.65 8.64-8.79 0-.59-.06-1.04-.14-1.11z" />
                </svg>
              </div>

              {/* Review */}
              <p className="text-[13px] leading-relaxed text-gray-700">
                "{review.review}"
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