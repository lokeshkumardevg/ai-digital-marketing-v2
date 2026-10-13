import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// @ts-ignore
import Navbar from '../components/Navbar';
// @ts-ignore
import Footer from '../components/Footer';
import { CreditCard, Scale, AlertOctagon, ArrowRight } from 'lucide-react';

const SECTIONS = [
  { id: 'acceptance', label: '1. Acceptance of Terms' },
  { id: 'services', label: '2. Service Description' },
  { id: 'ad-platforms', label: '3. Google & Meta Ads Integration' },
  { id: 'ad-spend', label: '4. Ad Spend & Billing Disclaimer' },
  { id: 'prohibited-content', label: '5. Prohibited Ad Content' },
  { id: 'ai-disclaimer', label: '6. AI Output & Verification' },
  { id: 'ip-rights', label: '7. Intellectual Property' },
  { id: 'termination', label: '8. Termination & Revocation' },
  { id: 'liability', label: '9. Limitation of Liability' },
  { id: 'governing-law', label: '10. Governing Law & Contact' },
];

export const TermsOfService: React.FC = () => {
  const [activeSection, setActiveSection] = useState('acceptance');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const EFFECTIVE_DATE = 'October 12, 2026';

  return (
    <div className="bg-[#030514] text-white min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Hero Header */}
      <div className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-[#5B6EF5]/15 blur-[160px]" />
        <div className="pointer-events-none absolute right-0 top-20 h-[300px] w-[300px] rounded-full bg-[#2ED573]/10 blur-[120px]" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5B6EF5]/30 bg-[#5B6EF5]/10 px-4 py-1.5 text-xs font-semibold text-[#8A98FB] mb-4">
            <Scale size={14} />
            LEGAL TERMS &amp; CONDITIONS
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent mb-6">
            Terms of Service
          </h1>
          <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
            Please read these terms carefully before accessing or using Wheedle AI's autonomous marketing platform.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-xs sm:text-sm text-white/70">
            <span className="h-2 w-2 rounded-full bg-[#2ED573] animate-pulse" />
            Effective Date: {EFFECTIVE_DATE} &nbsp;|&nbsp; Version 2.4
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="flex-grow pb-24 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Sticky TOC Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-28 self-start">
            <p className="text-xs font-mono tracking-widest text-white/30 uppercase mb-4">Table of Contents</p>
            <nav className="space-y-1">
              {SECTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-200 ${
                    activeSection === id
                      ? 'bg-[#5B6EF5]/20 text-white font-medium border-l-2 border-[#5B6EF5]'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            <div className="mt-8 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <p className="text-xs font-semibold text-white mb-1">Privacy &amp; Data Rights</p>
              <p className="text-xs text-white/50 mb-3 leading-relaxed">
                Review our comprehensive data handling policies.
              </p>
              <Link
                to="/privacy-policy"
                className="inline-flex items-center gap-1.5 text-xs text-[#5B6EF5] font-semibold hover:underline"
              >
                View Privacy Policy <ArrowRight size={12} />
              </Link>
            </div>
          </aside>

          {/* Policy Body */}
          <article className="flex-1 min-w-0 max-w-3xl space-y-12">
            <div className="relative rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0B0F19]/90 to-[#04060C]/90 p-8 sm:p-12 backdrop-blur-xl shadow-2xl space-y-10">

              {/* 1. Acceptance */}
              <section id="acceptance" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">
                  1. Acceptance of Terms
                </h2>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  These Terms of Service ("Terms") constitute a legally binding agreement between you (whether individually or on behalf of an entity, "User", "Client", or "you") and <strong className="text-white">Wheedle Technologies Inc.</strong> ("Wheedle AI", "Company", "we", "us", or "our").
                </p>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  By registering an account, connecting advertising accounts (such as Google Ads or Meta Ads), or using our multi-agent digital marketing services, you agree to be bound by these Terms and our <Link to="/privacy-policy" className="text-[#8A98FB] underline">Privacy Policy</Link>.
                </p>
              </section>

              {/* 2. Services */}
              <section id="services" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">
                  2. Description of Services
                </h2>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  Wheedle AI provides an autonomous multi-agent software platform designed to assist businesses with:
                </p>
                <ul className="space-y-2 text-sm text-white/70 list-disc pl-5">
                  <li>Competitor and keyword market research.</li>
                  <li>Generative creative production (ad copy, visual concepts, headlines).</li>
                  <li>Programmatic campaign publishing and budget optimization via Google Ads API and Meta Marketing API.</li>
                  <li>Cross-channel telemetry and predictive performance dashboards.</li>
                </ul>
              </section>

              {/* 3. Google & Meta Integration */}
              <section id="ad-platforms" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                  <span className="text-[#5B6EF5]">3. Third-Party Advertising Integrations</span>
                </h2>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  Our Platform interfaces directly with third-party advertising ecosystems. By authorizing an account connection:
                </p>
                <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3 text-sm text-white/80 leading-relaxed">
                  <p><strong>Authorization Representation:</strong> You represent and warrant that you own or have explicit administrative authority to bind the specific Google Ads Customer ID (CID) or Meta Ad Account ID linked to your Wheedle workspace.</p>
                  <p><strong>Compliance with Third-Party Terms:</strong> You agree to comply fully with the terms and conditions of each connected provider, including the <a href="https://support.google.com/adspolicy/answer/6008942" target="_blank" rel="noreferrer" className="text-[#8A98FB] underline">Google Ads Policies</a> and <a href="https://www.facebook.com/policies/ads/" target="_blank" rel="noreferrer" className="text-[#8A98FB] underline">Meta Advertising Standards</a>.</p>
                </div>
              </section>

              {/* 4. Critical Ad Spend Disclaimer */}
              <section id="ad-spend" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                  <CreditCard className="text-[#FF5E62]" size={22} />
                  <span>4. Ad Spend &amp; Media Billing Disclaimer</span>
                </h2>
                <div className="p-5 rounded-2xl border border-[#FF5E62]/40 bg-[#FF5E62]/10 space-y-3">
                  <div className="flex items-center gap-2 text-[#FF5E62] font-bold text-sm tracking-wide uppercase">
                    <AlertOctagon size={18} /> Direct Platform Billing Notice
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium leading-relaxed">
                    Wheedle AI charges subscription and software platform fees only. <strong>All media and ad spend incurred by published campaigns is billed directly by Google LLC or Meta Platforms, Inc. to your designated payment method on file with those respective platforms.</strong>
                  </p>
                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                    Wheedle AI does not collect ad spend funds and is not responsible or liable for any advertising charges, daily budget pacing fluctuations, billing disputes, or currency conversion fees charged by Google or Meta.
                  </p>
                </div>
              </section>

              {/* 5. Prohibited Ad Content */}
              <section id="prohibited-content" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">
                  5. Prohibited Advertising Content
                </h2>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  You agree never to use Wheedle AI to generate, optimize, or publish advertising campaigns involving:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-white/70">
                  <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">❌ Counterfeit or trademark-infringing goods</div>
                  <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">❌ Deceptive financial schemes or scams</div>
                  <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">❌ Malware, phishing, or spyware links</div>
                  <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">❌ Discrimination or hateful content</div>
                  <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">❌ Unapproved pharmaceuticals or drugs</div>
                  <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">❌ Predatory lending or illegal services</div>
                </div>
                <p className="text-xs text-white/50">
                  Violation of these guidelines will result in immediate termination of platform access and token revocation.
                </p>
              </section>

              {/* 6. AI Output & Verification */}
              <section id="ai-disclaimer" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">
                  6. AI Output &amp; User Verification Duty
                </h2>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  Our AI agents produce ad copies, target audiences, and bidding recommendations probabilistically. <strong>You retain sole discretion and ultimate responsibility for reviewing and approving all campaigns before they are dispatched live to Google or Meta.</strong>
                </p>
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-sm text-white/80">
                  Wheedle AI does not guarantee specific conversion volumes, return on ad spend (ROAS), or approval timelines from third-party ad review systems.
                </div>
              </section>

              {/* 7. IP Rights */}
              <section id="ip-rights" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">
                  7. Intellectual Property Rights
                </h2>
                <div className="space-y-3 text-sm text-white/70 leading-relaxed">
                  <p><strong>Your Content:</strong> You retain full ownership of your logos, brand trademarks, website assets, and generated marketing outputs.</p>
                  <p><strong>Company Platform:</strong> Wheedle AI retains all worldwide rights, title, and interest in and to our multi-agent orchestration architecture, proprietary algorithms, UI designs, and software code.</p>
                </div>
              </section>

              {/* 8. Termination & Revocation */}
              <section id="termination" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">
                  8. Termination &amp; Token Revocation
                </h2>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  You may disconnect your advertising accounts or terminate your account at any time. Upon request, all OAuth tokens are instantly revoked and your data is purged in accordance with our <Link to="/data-deletion" className="text-[#8A98FB] underline">Data Deletion Policy</Link>.
                </p>
              </section>

              {/* 9. Limitation of Liability */}
              <section id="liability" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">
                  9. Limitation of Liability
                </h2>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL WHEEDLE TECHNOLOGIES INC. BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF ADVERTISING PROFITS, ACCOUNT SUSPENSION BY THIRD-PARTY PLATFORMS, OR MEDIA BUDGET OVERRUNS).
                </p>
              </section>

              {/* 10. Governing Law */}
              <section id="governing-law" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">
                  10. Governing Law &amp; Contact
                </h2>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of Delaware, USA and the laws of the Republic of India, without regard to conflict of law principles.
                </p>
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-sm text-white/80 space-y-1">
                  <p><strong>Legal Inquiries:</strong> <a href="mailto:legal@wheedle.ai" className="text-[#8A98FB]">legal@wheedle.ai</a></p>
                  <p><strong>Support &amp; Compliance:</strong> <a href="mailto:support@wheedle.ai" className="text-[#8A98FB]">support@wheedle.ai</a></p>
                </div>
              </section>

            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;