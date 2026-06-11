import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';
import Button from '../components/Button';
import '../styles/animations.css';
 
// ── swap these with your real asset paths ──────────────────────────────────
import personImage from '../assets/images/personimg.png';   // person with VR headset
import handImage   from '../assets/images/aihand.png'; 
import heroDashboard from '../assets/images/futuristic-ai-dashboard.png'       // robot hand image
 
// ─── 1. Hero ──────────────────────────────────────────────────────────────────
function ResourcesHero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden text-center">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(6,101,255,0.14) 0%, transparent 70%)',
        }}
      />
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.055] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(6,101,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(6,101,255,0.8) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, black 0%, transparent 100%)',
        }}
      />
 
      <div className="section-shell relative z-10">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0665ff]/30 bg-[#0665ff]/10 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0665ff] shadow-[0_0_8px_#0665ff] animate-pulse" />
          <span className="text-[11px] font-semibold tracking-[0.12em] text-[#60a5fa] uppercase">Resources</span>
        </div>
 
        <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-bold text-white leading-tight tracking-tight mb-5">
          AI-Driven Growth, Right at{' '}
          <span className="bg-gradient-to-r from-[#0665ff] via-[#22d3ee] to-[#818cf8] bg-clip-text text-transparent">
            Your Fingertips
          </span>
        </h1>
 
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-white/50 leading-relaxed mb-10">
          Wheedle.ai empowers businesses with autonomous advertising and marketing automation. Our
          AI-driven platform manages campaigns end-to-end, delivering smarter, faster and more
          efficient growth for brands around the globe.
        </p>
 
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
          <Link to="/register">
            <Button
              variant="primary"
              className="!h-[46px] !px-8 !text-[13px] !rounded-xl !bg-gradient-to-r !from-[#0665ff] !to-[#1abfdf] hover:!opacity-90 !shadow-[0_0_24px_rgba(6,101,255,0.4)] !normal-case !tracking-normal whitespace-nowrap"
            >
              Start 3-days trial for free
            </Button>
          </Link>
          <Link to="/demo">
            <Button
              variant="secondary"
              className="!h-[46px] !px-8 !text-[13px] !rounded-xl !border-[#0665ff]/50 !bg-[#0665ff]/10 hover:!bg-[#0665ff]/20 !text-[#60a5fa] !normal-case !tracking-normal whitespace-nowrap"
            >
              Watch live demo
            </Button>
          </Link>
        </div>
 
        {/* Hero visual — dark card with AI dashboard mock */}
<div className="relative mx-auto max-w-6xl group">
  <div className="absolute -inset-2 bg-gradient-to-r from-[#0665ff] via-[#22d3ee] to-[#818cf8] rounded-3xl opacity-20 blur-2xl group-hover:opacity-30 transition-all duration-500" />

  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#050b18]">
    <img
      src={heroDashboard}
      alt="AI Marketing Dashboard"
      className="w-full h-auto object-cover"
    />
  </div>
</div>
      </div>
    </section>
  );
}
 
// ─── 2. Trusted Global Partner ────────────────────────────────────────────────
function TrustedGlobal() {
  return (
    <section className="section-shell py-16">
      <div
        className="relative rounded-3xl overflow-hidden border border-white/10 p-8 sm:p-12"
        style={{
          background: 'linear-gradient(135deg, #0d1a3a 0%, #07111f 100%)',
        }}
      >
        {/* Glow */}
        <div className="absolute top-0 left-0 w-80 h-60 bg-[#0665ff]/10 blur-[80px] pointer-events-none" />
 
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
          {/* Person image */}
          <div className="shrink-0 w-56 sm:w-92 lg:w-[400px]">
            <img
              src={personImage}
              alt="Person with VR headset"
              className="w-full object-contain drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 0 30px rgba(6,101,255,0.3))' }}
            />
          </div>
 
          {/* Text */}
          <div className="flex flex-col gap-4 max-w-xl">
            <div className="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full border border-[#0665ff]/30 bg-[#0665ff]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0665ff]" />
              <span className="text-[10px] font-semibold tracking-widest text-[#60a5fa] uppercase">About Us</span>
            </div>
 
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              A Trusted Global Digital{' '}
              <span className="bg-gradient-to-r from-[#0665ff] to-[#22d3ee] bg-clip-text text-transparent">
                Growth Partner
              </span>
            </h2>
 
            <p className="text-sm sm:text-base text-white/55 leading-relaxed">
              WheedalAI is redefining digital advertising with autonomous AI agents that manage
              marketing campaigns from strategy to optimization. By combining advanced AI technology
              with performance-driven insights, we help businesses reach broader audience, maximize
              ROI, and scale growth worldwide.
            </p>
 
            {/* Stats row */}
            <div className="flex flex-wrap gap-6 pt-2">
              {[
                { value: '1,200+', label: 'Active Brands' },
                { value: '3.4×', label: 'Avg. ROAS Lift' },
                { value: '6+', label: 'Ad Platforms' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-xl font-bold text-white">{value}</p>
                  <p className="text-xs text-white/40">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
 
// ─── 3. Achieve Professional Results ─────────────────────────────────────────
function AchieveProfessional() {
  const points = [
    'No Barriers to Getting Started',
    'Effortless Campaign Management',
    'Higher Returns, Smarter Spending',
    'Minimized Risk, Maximized Results',
  ];
 
  return (
    <section className="section-shell py-8">
      <div
        className="relative rounded-3xl overflow-hidden border border-white/10 p-8 sm:p-12"
        style={{
          background: 'linear-gradient(135deg, #070f24 0%, #030812 100%)',
        }}
      >
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#22d3ee]/8 blur-[80px] pointer-events-none" />
 
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
          {/* Text side */}
          <div className="flex-1 flex flex-col gap-5">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              Achieve Professional Marketing Results
              <span className="text-white/40"> — Without Hiring a Full Team.</span>
            </h2>
 
            <p className="text-sm text-white/55 leading-relaxed max-w-lg">
              Wheedle.ai makes business growth simple. Our fully automated AI marketing platform handles
              the complexity of digital advertising, enabling growing businesses to attract, convert,
              and retain customers more efficiently.
            </p>
 
            {/* Numbered list */}
            <ol className="flex flex-col gap-3 mt-1">
              {points.map((point, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #0665ff, #22d3ee)' }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm text-white/70">{point}</span>
                </li>
              ))}
            </ol>
 
            <div className="pt-2">
              <Link to="/register">
                <Button
                  variant="primary"
                  className="!h-[44px] !px-7 !text-[13px] !rounded-xl !bg-gradient-to-r !from-[#0665ff] !to-[#1abfdf] hover:!opacity-90 !normal-case !tracking-normal"
                >
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
 
          {/* Hand / robot image */}
          <div className="shrink-0 w-56 sm:w-92 lg:w-[400px]">
            <img
              src={handImage}
              alt="AI robot hand"
              className="w-full object-contain"
              style={{ filter: 'drop-shadow(0 0 40px rgba(34,211,238,0.25))' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
 
// ─── 4. Where Curiosity Meets Genius ─────────────────────────────────────────
const RESOURCE_CARDS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    title: 'Getting Started',
    subtitle: 'Beginner-friendly guides',
    articles: ['Quick Setup Guide', 'Connect Your Ad Account', 'Launch Your First Campaign', 'Understanding the Dashboard'],
    color: '#0665ff',
    colorDim: 'rgba(6,101,255,0.12)',
    colorBorder: 'rgba(6,101,255,0.25)',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10" />
        <circle cx="18" cy="6" r="3" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: 'AI Creatives',
    subtitle: 'Build better ad content',
    articles: ['AI Studio Overview', 'Brand Voice Training', 'Generate Ad Creatives', 'Multi-format Exports'],
    color: '#818cf8',
    colorDim: 'rgba(129,140,248,0.12)',
    colorBorder: 'rgba(129,140,248,0.25)',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
    title: 'Support',
    subtitle: 'Troubleshoot & get help',
    articles: ['Contact Support Team', 'Common Error Fixes', 'Billing & Payments', 'Account Settings'],
    color: '#22d3ee',
    colorDim: 'rgba(34,211,238,0.12)',
    colorBorder: 'rgba(34,211,238,0.25)',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
    title: 'Help Articles',
    subtitle: 'Comprehensive how-tos',
    articles: ['Campaign Best Practices', 'Audience Targeting Guide', 'Analytics & Reporting', 'API Documentation'],
    color: '#34d399',
    colorDim: 'rgba(52,211,153,0.12)',
    colorBorder: 'rgba(52,211,153,0.25)',
  },
];
 
function CuriositySection() {
  return (
    <section className="section-shell py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0665ff]/30 bg-[#0665ff]/10 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0665ff] shadow-[0_0_8px_#0665ff]" />
          <span className="text-[11px] font-semibold tracking-[0.12em] text-[#60a5fa] uppercase">Knowledge Base</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
          Where Curiosity Meets Genius:{' '}
          <span className="bg-gradient-to-r from-[#0665ff] to-[#22d3ee] bg-clip-text text-transparent">
            The Wheedle.ai Edition
          </span>
        </h2>
      </div>
 
      {/* 4-column cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {RESOURCE_CARDS.map(({ icon, title, subtitle, articles, color, colorDim, colorBorder }) => (
          <div
            key={title}
            className="group rounded-2xl border p-5 flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            style={{
              borderColor: colorBorder,
              background: `linear-gradient(135deg, ${colorDim} 0%, rgba(7,11,30,0.9) 100%)`,
            }}
          >
            {/* Icon */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center border shrink-0"
              style={{ background: colorDim, borderColor: colorBorder, color }}
            >
              {icon}
            </div>
 
            {/* Title */}
            <div>
              <h3 className="text-sm font-bold text-white mb-0.5">{title}</h3>
              <p className="text-xs text-white/40">{subtitle}</p>
            </div>
 
            {/* Article links */}
            <ul className="flex flex-col gap-2 flex-1">
              {articles.map((a) => (
                <li key={a}>
                  <a
                    href="#"
                    className="flex items-center gap-2 text-xs text-white/55 hover:text-white transition-colors duration-200 group/link"
                  >
                    <span
                      className="w-1 h-1 rounded-full shrink-0 group-hover/link:scale-150 transition-transform"
                      style={{ background: color }}
                    />
                    {a}
                  </a>
                </li>
              ))}
            </ul>
 
            {/* Bottom CTA */}
            <a
              href="#"
              className="flex items-center gap-1.5 text-xs font-semibold transition-colors duration-200 mt-1"
              style={{ color }}
            >
              View all
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
 
// ─── Page ─────────────────────────────────────────────────────────────────────
function Resources() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(entry.target.dataset.animation);
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
 
      <div className="scroll-reveal opacity-0" data-animation="animate-zoom">
        <ResourcesHero />
      </div>
 
      <div className="scroll-reveal opacity-0" data-animation="animate-fade-left">
        <TrustedGlobal />
      </div>
 
      <div className="scroll-reveal opacity-0" data-animation="animate-fade-right">
        <AchieveProfessional />
      </div>
 
      <div className="scroll-reveal opacity-0" data-animation="animate-fade-up">
        <CuriositySection />
      </div>
 
      <div className="scroll-reveal opacity-0" data-animation="animate-fade-up">
        <Newsletter />
      </div>
 
      <div className="scroll-reveal opacity-0" data-animation="animate-fade-up">
        <Footer />
      </div>
    </div>
  );
}
 
export default Resources;