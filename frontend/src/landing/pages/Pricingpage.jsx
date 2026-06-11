import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';
import Button from '../components/Button';

// ─── Pricing-specific FAQ ─────────────────────────────────────────────────────
const PRICING_FAQS = [
  {
    q: 'Is there a free trial? Do I need a credit card?',
    a: 'Yes — every plan comes with a 3-day free trial and no credit card is required to start. You only enter payment details when you decide to continue after the trial period.',
  },
  {
    q: 'What happens if I exceed my ad spend limit?',
    a: 'Your campaigns will pause automatically before crossing the limit and you will receive an email notification. You can upgrade your plan at any time or contact support to request a temporary increase.',
  },
  {
    q: 'Can I switch plans mid-cycle?',
    a: 'Absolutely. Upgrades take effect immediately and you are billed only for the prorated difference. Downgrades take effect at the start of your next billing cycle so you keep full access until then.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept all major credit and debit cards, UPI, net banking, and corporate bank transfers for annual plans. All transactions are secured and GST invoices are issued automatically.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'Monthly plans are non-refundable once the billing cycle starts, but we offer a full refund within 7 days of your first paid charge if you are not satisfied — no questions asked. Annual plan refunds are prorated.',
  },
];

// ─── Hero ─────────────────────────────────────────────────────────────────────
function PricingHero() {
  return (
    <section className="relative pt-32 pb-4 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(6,101,255,0.13) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(6,101,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(6,101,255,0.8) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, black 0%, transparent 100%)',
        }}
      />

      <div className="section-shell text-center relative z-10">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0665ff]/30 bg-[#0665ff]/10 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_8px_#22d3ee] animate-pulse" />
          <span className="text-[11px] font-semibold tracking-[0.12em] text-[#60a5fa] uppercase">
            Transparent Pricing
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
          Smart Advertising,{' '}
          <span
            className="bg-gradient-to-r from-[#0665ff] via-[#22d3ee] to-[#818cf8] bg-clip-text text-transparent"
          >
            Simple Pricing
          </span>
        </h1>

        <p className="max-w-xl mx-auto text-base sm:text-lg text-white/50 leading-relaxed mb-8">
          No matter where you are in your marketing journey, we have transparent, subscription
          options that align with your goals and budget.
        </p>

        {/* Trust pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {[
            { icon: '✓', label: '3-day free trial' },
            { icon: '✓', label: 'No credit card required' },
            { icon: '✓', label: 'Cancel anytime' },
            { icon: '✓', label: 'GST invoices included' },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-xs text-white/50"
            >
              <span className="text-[#22d3ee] font-bold">{icon}</span>
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── "Powered by AI" Banner ───────────────────────────────────────────────────
function PoweredByAI() {
  return (
    <section className="section-shell py-20">
      <div
        className="relative rounded-3xl overflow-hidden text-center py-16 px-6"
        style={{
          background:
            'linear-gradient(135deg, rgba(6,101,255,0.18) 0%, rgba(7,11,30,0.95) 50%, rgba(34,211,238,0.12) 100%)',
          border: '1px solid rgba(6,101,255,0.25)',
        }}
      >
        {/* Glow */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-96 h-40 bg-[#0665ff]/20 blur-[80px] pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-64 h-40 bg-[#22d3ee]/10 blur-[60px] pointer-events-none" />

        <div className="relative z-10">
          <p className="text-sm text-white/40 uppercase tracking-widest font-semibold mb-3">
            From Ad Spend to Business Growth
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Powered by AI.
          </h2>
          <p className="max-w-lg mx-auto text-white/50 text-sm leading-relaxed mb-8">
            Wheedle.ai's autonomous agents handle everything from audience research to campaign
            management on Meta, Google, and LinkedIn — delivering better, smarter daily results on
            Meta and Google — faster than ever.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
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
                Watch Resources
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function WhatClientsSay() {
  const testimonials = [
    {
      quote:
        'Switched from a ₹60,000/month agency to Wheedle Growth plan. ROAS went from 1.8x to 4.2x in 45 days. I wish I had done this sooner.',
      name: 'Reviewer name',
      time: '1 month ago',
      avatar: 'https://i.pravatar.cc/40?img=47',
      stars: 5,
    },
    {
      quote:
        'The Starter plan alone replaced two tools we were paying for separately. The AI copy generation is frighteningly good for our niche.',
      name: 'Reviewer name',
      time: '1 month ago',
      avatar: 'https://i.pravatar.cc/40?img=47',
      stars: 5,
    },
    {
      quote:
        'We manage 8 brands on the Enterprise plan. The workspace isolation and approval flows are exactly what an agency needs. Brilliant product.',
      name: 'Reviewer name',
      time: '1 month ago',
      avatar: 'https://i.pravatar.cc/40?img=47',
      stars: 5,
    },
  ];
 
  return (
    <section className="section-shell py-16">
      {/* Heading */}
      <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-10">
        What our clients say
      </h2>
 
      {/* Cards */}
      <div className="grid sm:grid-cols-3 gap-5">
        {testimonials.map(({ quote, name, time, avatar, stars }, i) => (
          <div
            key={i}
            className="rounded-2xl !bg-white p-5 flex flex-col gap-3"
          >
            {/* Reviewer row */}
            <div className="flex items-center gap-3">
              <img
                src={avatar}
                alt={name}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">{name}</p>
                <p className="text-xs text-gray-400">{time}</p>
              </div>
            </div>
 
            {/* Stars + verified */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-800">5.0</span>
              <div className="flex gap-0.5">
                {Array.from({ length: stars }).map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 20 20" fill="#f59e0b">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              {/* Verified checkmark */}
              <svg width="16" height="16" viewBox="0 0 20 20" fill="#1a73e8" className="ml-0.5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
 
            {/* Quote */}
            <p className="text-sm text-gray-700 leading-relaxed">
              "{quote}"
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
 

// ─── Page ─────────────────────────────────────────────────────────────────────
function PricingPage() {
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
        <PricingHero />
      </div>

      {/* Pricing cards — reused component */}
      <div className="scroll-reveal opacity-0" data-animation="animate-fade-up">
        <Pricing />
      </div>

      {/* Powered by AI banner */}
      <div className="scroll-reveal opacity-0" data-animation="animate-fade-up">
        <PoweredByAI />
      </div>

      {/* Testimonials */}
      <div className="scroll-reveal opacity-0" data-animation="animate-fade-up">
        <WhatClientsSay />
      </div>

      {/* FAQ — reused component with pricing-specific questions */}
      <div className="scroll-reveal opacity-0" data-animation="animate-fade-up">
        <FAQ
          faqs={PRICING_FAQS}
          title="Frequently asked questions"
          subtitle="Everything you need to know about plans and billing"
        />
      </div>

      {/* Newsletter — reused */}
      <div className="scroll-reveal opacity-0" data-animation="animate-fade-right">
        <Newsletter />
      </div>

      {/* Footer — reused */}
      <div className="scroll-reveal opacity-0" data-animation="animate-fade-up">
        <Footer />
      </div>
    </div>
  );
}

export default PricingPage;