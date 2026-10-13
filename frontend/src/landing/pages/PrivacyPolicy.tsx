import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// @ts-ignore
import Navbar from '../components/Navbar';
// @ts-ignore
import Footer from '../components/Footer';
import { Shield, ArrowRight, Trash2 } from 'lucide-react';

const SECTIONS = [
  { id: 'overview', label: '1. Overview & Scope' },
  { id: 'data-collected', label: '2. Data We Collect' },
  { id: 'google-compliance', label: '3. Google API & Limited Use' },
  { id: 'meta-compliance', label: '4. Meta (Facebook) Platform Data' },
  { id: 'how-we-use', label: '5. Purpose of Processing' },
  { id: 'ai-training', label: '6. AI Models & Data Governance' },
  { id: 'security-retention', label: '7. Data Security & Retention' },
  { id: 'data-deletion', label: '8. Data Deletion & Rights' },
  { id: 'contact', label: '9. Contact & DPO' },
];

export const PrivacyPolicy: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');

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
            <Shield size={14} />
            GOOGLE &amp; META POLICY COMPLIANCE
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent mb-6">
            Privacy Policy
          </h1>
          <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
            Transparent data governance for AI digital marketing, complying strictly with Google API Services User Data Policy and Meta Platform Terms.
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
              <p className="text-xs font-semibold text-white mb-1">Looking to delete data?</p>
              <p className="text-xs text-white/50 mb-3 leading-relaxed">
                You can revoke platform permissions or request erasure anytime.
              </p>
              <Link
                to="/data-deletion"
                className="inline-flex items-center gap-1.5 text-xs text-[#5B6EF5] font-semibold hover:underline"
              >
                <Trash2 size={13} /> Deletion Instructions <ArrowRight size={12} />
              </Link>
            </div>
          </aside>

          {/* Policy Body */}
          <article className="flex-1 min-w-0 max-w-3xl space-y-12">
            <div className="relative rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0B0F19]/90 to-[#04060C]/90 p-8 sm:p-12 backdrop-blur-xl shadow-2xl space-y-10">

              {/* 1. Overview */}
              <section id="overview" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">
                  1. Overview &amp; Scope
                </h2>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  This Privacy Policy describes how <strong className="text-white">Wheedle Technologies Inc.</strong> ("Wheedle AI", "we", "us", or "our") collects, uses, protects, and handles your information when you access or interact with our multi-agent AI digital marketing platform (the "Platform").
                </p>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  Wheedle AI enables businesses to research market trends, generate ad copy and creatives, and publish and manage advertising campaigns across third-party marketing networks including <strong>Google Ads</strong> and <strong>Meta Ads (Facebook &amp; Instagram)</strong>.
                </p>
                <div className="p-4 rounded-xl border border-[#5B6EF5]/30 bg-[#5B6EF5]/10 text-sm text-white/80 leading-relaxed">
                  <strong>Strict Tenant Isolation:</strong> Wheedle AI is built on a zero-trust multi-tenant architecture. Your brand assets, connected advertising credentials, and operational logs are strictly isolated to your verified tenant account.
                </div>
              </section>

              {/* 2. Data We Collect */}
              <section id="data-collected" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">
                  2. Categories of Data We Collect
                </h2>
                <ul className="space-y-3 text-sm sm:text-base text-white/70">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#5B6EF5] flex-shrink-0" />
                    <span><strong>Account Information:</strong> Name, business email, brand name, website URL, industry sector, and localized currency.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#5B6EF5] flex-shrink-0" />
                    <span><strong>OAuth Tokens &amp; Credentials:</strong> Securely encrypted OAuth 2.0 access and refresh tokens for Google Ads and Meta Marketing APIs, enabling programmatic campaign operations authorized by you.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#5B6EF5] flex-shrink-0" />
                    <span><strong>Campaign Telemetry &amp; Performance:</strong> Ad account IDs, campaign names, impressions, clicks, conversions, and ad spend statistics fetched directly via official APIs.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#5B6EF5] flex-shrink-0" />
                    <span><strong>Creative Inputs &amp; Assets:</strong> Product descriptions, brand tone guidelines, logos, and generated headlines created inside the workspace.</span>
                  </li>
                </ul>
              </section>

              {/* 3. Google API & Limited Use Disclosure */}
              <section id="google-compliance" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                  <span className="text-[#4285F4]">3. Google API Services User Data Policy Compliance</span>
                </h2>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  Wheedle AI integrates with Google APIs, including Google Sign-In and Google Ads API. When you link your Google account:
                </p>

                {/* LIMITED USE MANDATORY CLAUSE */}
                <div className="p-5 rounded-2xl border border-[#4285F4]/40 bg-[#4285F4]/10 space-y-3">
                  <div className="flex items-center gap-2 text-[#4285F4] font-bold text-sm tracking-wide uppercase">
                    <Shield size={16} /> Google Limited Use Disclosure
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium leading-relaxed">
                    Wheedle AI's use and transfer to any other app of information received from Google APIs will adhere to the{' '}
                    <a 
                      href="https://developers.google.com/terms/api-services-user-data-policy" 
                      target="_blank" 
                      rel="noreferrer"
                      className="underline text-[#8A98FB] hover:text-white"
                    >
                      Google API Services User Data Policy
                    </a>, including the Limited Use requirements.
                  </p>
                </div>

                <div className="space-y-3 text-sm text-white/70 leading-relaxed">
                  <p><strong>Specifically, in compliance with Google Developer Policies:</strong></p>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>We only access Google Ads data necessary to configure, launch, and monitor ad campaigns authorized by you.</li>
                    <li>We <strong>do NOT</strong> sell your Google user data to data brokers or third parties.</li>
                    <li>We <strong>do NOT</strong> use Google user data for serving personalized third-party ads or retargeting.</li>
                    <li>We <strong>do NOT</strong> use Google user data to train, retrain, or improve generalized or non-personalized machine learning or AI models.</li>
                    <li>Human employees do not view your raw Google Ads data unless you provide explicit consent for technical troubleshooting, or when required by applicable law.</li>
                  </ul>
                </div>
              </section>

              {/* 4. Meta (Facebook) Platform Data */}
              <section id="meta-compliance" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                  <span className="text-[#1877F2]">4. Meta (Facebook) Platform Terms &amp; Compliance</span>
                </h2>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  Wheedle AI adheres strictly to the Meta Platform Terms and Developer Policies. When connecting your Facebook account or Meta Ad Account:
                </p>
                <div className="p-5 rounded-2xl border border-[#1877F2]/30 bg-[#1877F2]/10 space-y-3 text-sm text-white/80 leading-relaxed">
                  <p><strong>Meta Scopes &amp; Usage:</strong></p>
                  <ul className="space-y-2 list-disc pl-5">
                    <li><code>ads_management</code> &amp; <code>ads_read</code>: Used solely to draft, schedule, publish, and measure ad campaigns in your designated ad accounts.</li>
                    <li><code>pages_read_engagement</code> &amp; <code>pages_manage_ads</code>: Used to link your verified Facebook Page as the sponsor identity for ad creatives.</li>
                    <li>All Meta access tokens are encrypted using AES-256 and never shared with unauthorized tenants.</li>
                  </ul>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  Per Meta Platform Term 4.a, you can revoke access at any time through Facebook App Settings or trigger immediate data erasure via our{' '}
                  <Link to="/data-deletion" className="text-[#8A98FB] underline hover:text-white">
                    Data Deletion Instructions
                  </Link>.
                </p>
              </section>

              {/* 5. Purpose of Processing */}
              <section id="how-we-use" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">
                  5. How We Use Collected Data
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                    <h3 className="font-semibold text-white mb-1">Campaign Orchestration</h3>
                    <p className="text-white/60">Generate headlines, keyword structures, and creative copy tailored to your brand.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                    <h3 className="font-semibold text-white mb-1">API Dispatch</h3>
                    <p className="text-white/60">Push campaigns directly to Google Ads and Meta Ads on your explicit confirmation.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                    <h3 className="font-semibold text-white mb-1">Telemetry &amp; Reporting</h3>
                    <p className="text-white/60">Compute ROAS, CTR, and conversion metrics in real-time dashboards.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                    <h3 className="font-semibold text-white mb-1">Security &amp; Fraud Defense</h3>
                    <p className="text-white/60">Verify tenant authorization and prevent malicious API exploitation.</p>
                  </div>
                </div>
              </section>

              {/* 6. AI Models & Data Governance */}
              <section id="ai-training" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">
                  6. AI Governance &amp; Model Privacy
                </h2>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  We leverage advanced AI models (such as Gemini and proprietary agents) exclusively for in-session inference to generate marketing strategy, keywords, and copy for your business.
                </p>
                <div className="p-4 rounded-xl border border-[#2ED573]/30 bg-[#2ED573]/10 text-sm text-white/90">
                  <strong className="text-[#2ED573]">No Generalized Model Training:</strong> Your private customer records, conversion data, and proprietary brand guidelines are never used to train public or shared generative models.
                </div>
              </section>

              {/* 7. Security & Retention */}
              <section id="security-retention" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">
                  7. Data Security &amp; Retention
                </h2>
                <div className="space-y-3 text-sm sm:text-base text-white/70 leading-relaxed">
                  <p>
                    We implement defense-in-depth security standards:
                  </p>
                  <ul className="space-y-2 list-disc pl-5">
                    <li><strong>Encryption:</strong> Data in transit is protected using TLS 1.3; sensitive credentials and tokens are encrypted at rest with AES-256.</li>
                    <li><strong>Multi-Factor Authentication &amp; JWT:</strong> Token authentication with cryptographically signed JSON Web Tokens.</li>
                    <li><strong>Retention:</strong> Tokens and campaign data are retained only as long as your workspace account remains active. Upon deactivation or disconnection, advertising tokens are purged immediately.</li>
                  </ul>
                </div>
              </section>

              {/* 8. Data Deletion & Rights */}
              <section id="data-deletion" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">
                  8. Your Rights &amp; Data Deletion
                </h2>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  Under applicable privacy frameworks (including GDPR, CCPA, and Indian DPDP Act), you have the right to access, rectify, export, and delete your data.
                </p>
                <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] space-y-4">
                  <h3 className="font-semibold text-white">How to Delete Your Data:</h3>
                  <div className="space-y-2 text-sm text-white/70">
                    <p>1. <strong>Self-Service:</strong> Go to Workspace Settings &gt; Connected Accounts &gt; click "Disconnect" to instantly revoke Google or Meta tokens.</p>
                    <p>2. <strong>Automated Deletion Page:</strong> Visit our dedicated <Link to="/data-deletion" className="text-[#8A98FB] underline">Data Deletion Instructions</Link> page to request total tenant erasure.</p>
                    <p>3. <strong>Provider Settings:</strong> Revoke permissions directly in your Google Account Security Settings or Facebook Apps &amp; Websites Settings.</p>
                  </div>
                </div>
              </section>

              {/* 9. Contact */}
              <section id="contact" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">
                  9. Contact Us &amp; Data Protection Officer
                </h2>
                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  For privacy inquiries, regulatory notices, or data erasure verification:
                </p>
                <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02] text-sm space-y-2 text-white/80">
                  <p><strong>Legal &amp; Privacy Office:</strong> Wheedle Technologies Inc.</p>
                  <p><strong>Email:</strong> <a href="mailto:privacy@wheedle.ai" className="text-[#8A98FB]">privacy@wheedle.ai</a></p>
                  <p><strong>Support &amp; Security:</strong> <a href="mailto:support@wheedle.ai" className="text-[#8A98FB]">support@wheedle.ai</a></p>
                  <p><strong>Address:</strong> Bangalore, Karnataka, India / Delaware, USA</p>
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

export default PrivacyPolicy;