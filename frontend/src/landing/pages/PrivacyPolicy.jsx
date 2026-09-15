// import React, { useEffect, useState } from 'react';
// import Navbar from '../components/Navbar';
// import Footer from '../components/Footer';

// const SECTIONS = [
//   { id: 'overview', label: 'Overview' },
//   { id: 'data-collected', label: 'Data We Collect' },
//   { id: 'facebook-login', label: 'Facebook / Meta Login' },
//   { id: 'how-we-use', label: 'How We Use Data' },
//   { id: 'third-parties', label: 'Third-Party Services' },
//   { id: 'data-security', label: 'Data Security' },
//   { id: 'data-retention', label: 'Data Retention' },
//   { id: 'data-deletion', label: 'Data Deletion' },
//   { id: 'your-rights', label: 'Your Privacy Rights' },
//   { id: 'contact', label: 'Contact Us' },
// ];

// const Section = ({ id, title, children }) => (
//   <section id={id} className="mb-14 scroll-mt-28">
//     <div className="flex items-center gap-3 mb-5">
//       <div className="h-px flex-1 bg-gradient-to-r from-[#0665ff]/40 to-transparent" />
//       <h2 className="text-xl font-bold text-white whitespace-nowrap">{title}</h2>
//       <div className="h-px flex-1 bg-gradient-to-l from-[#0665ff]/40 to-transparent" />
//     </div>
//     <div className="space-y-4 text-white/70 leading-relaxed text-sm sm:text-base">
//       {children}
//     </div>
//   </section>
// );

// const InfoBox = ({ icon, title, children, color = '#0665ff' }) => (
//   <div
//     className="rounded-2xl border p-5"
//     style={{
//       background: `linear-gradient(135deg, ${color}08, transparent)`,
//       borderColor: `${color}30`,
//     }}
//   >
//     <div className="flex items-start gap-3">
//       <span className="text-2xl flex-shrink-0">{icon}</span>
//       <div>
//         <p className="font-semibold text-white mb-1">{title}</p>
//         <p className="text-white/60 text-sm leading-relaxed">{children}</p>
//       </div>
//     </div>
//   </div>
// );

// const BulletList = ({ items }) => (
//   <ul className="space-y-2 mt-3">
//     {items.map((item, i) => (
//       <li key={i} className="flex items-start gap-3">
//         <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#0665ff] flex-shrink-0" />
//         <span>{item}</span>
//       </li>
//     ))}
//   </ul>
// );

// const PrivacyPolicy = () => {
//   const [activeSection, setActiveSection] = useState('overview');

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setActiveSection(entry.target.id);
//           }
//         });
//       },
//       { rootMargin: '-20% 0px -70% 0px' }
//     );
//     SECTIONS.forEach(({ id }) => {
//       const el = document.getElementById(id);
//       if (el) observer.observe(el);
//     });
//     return () => observer.disconnect();
//   }, []);

//   const scrollTo = (id) => {
//     const el = document.getElementById(id);
//     if (el) el.scrollIntoView({ behavior: 'smooth' });
//   };

//   const EFFECTIVE_DATE = 'September 1, 2026';

//   return (
//     <div className="bg-[#030514] text-white min-h-screen flex flex-col font-sans">
//       <Navbar />

//       {/* Hero */}
//       <div className="relative pt-32 pb-16 px-6 overflow-hidden">
//         <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-[#0665ff]/10 blur-[160px]" />
//         <div className="pointer-events-none absolute right-0 top-20 h-[300px] w-[300px] rounded-full bg-[#22d3ee]/5 blur-[120px]" />

//         <div className="max-w-5xl mx-auto text-center relative z-10">
//           <span className="inline-block text-sm font-mono tracking-wider bg-gradient-to-r from-[#0665ff] to-[#22d3ee] bg-clip-text text-transparent border-l-2 border-[#0665ff] pl-3 mb-4">
//             LEGAL &amp; COMPLIANCE
//           </span>
//           <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent mb-6">
//             Privacy Policy
//           </h1>
//           <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
//             Wheedle Technologies is committed to protecting your privacy and handling your data with transparency and care.
//           </p>
//           <div className="inline-flex items-center gap-2 rounded-full border border-[#0665ff]/30 bg-[#0665ff]/10 px-5 py-2 text-sm text-[#22d3ee]">
//             <span className="h-2 w-2 rounded-full bg-[#22d3ee] animate-pulse" />
//             Effective Date: {EFFECTIVE_DATE} &nbsp;|&nbsp; Last Updated: {EFFECTIVE_DATE}
//           </div>
//         </div>
//       </div>

//       {/* Main content */}
//       <main className="flex-grow pb-24 px-6">
//         <div className="max-w-6xl mx-auto flex gap-10 items-start">

//           {/* Sticky sidebar TOC */}
//           <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-28 self-start">
//             <p className="text-xs font-mono tracking-widest text-white/30 uppercase mb-4">On this page</p>
//             <nav className="space-y-1">
//               {SECTIONS.map(({ id, label }) => (
//                 <button
//                   key={id}
//                   onClick={() => scrollTo(id)}
//                   className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${activeSection === id
//                     ? 'bg-[#0665ff]/20 text-[#22d3ee] border-l-2 border-[#22d3ee]'
//                     : 'text-white/40 hover:text-white/70 hover:bg-white/5'
//                     }`}
//                 >
//                   {label}
//                 </button>
//               ))}
//             </nav>
//           </aside>

//           {/* Policy content */}
//           <article className="flex-1 min-w-0 max-w-3xl">
//             <div className="relative rounded-[28px] border border-[#0665ff]/20 bg-gradient-to-br from-[#07122A]/80 to-[#000000]/80 p-8 sm:p-12 backdrop-blur-sm shadow-[0_25px_80px_-15px_rgba(0,0,0,0.8)]">
//               <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#0665ff]/5 blur-[100px]" />

//               {/* 1. Overview */}
//               <Section id="overview" title="1. Overview">
//                 <p>
//                   This Privacy Policy explains how <strong className="text-white">Wheedle Technologies Pvt. Ltd.</strong> ("Wheedle Technologies", "we", "us", or "our") collects, uses, stores, and protects personal information when you use our AI-powered digital marketing platform — including our website, web application, and all associated services (collectively, the "Platform").
//                 </p>
//                 <p>
//                   By accessing or using the Platform, you agree to the practices described in this Privacy Policy. If you do not agree, please discontinue use immediately.
//                 </p>
//                 <InfoBox icon="🏢" title="Company Information" color="#0665ff">
//                   Wheedle Technologies Pvt. Ltd. is registered in India. Our Platform is an AI-powered digital marketing suite that enables businesses to manage advertising campaigns, CRM, content creation, analytics, and social media marketing — including integration with Meta (Facebook &amp; Instagram) APIs.
//                 </InfoBox>
//               </Section>

//               {/* 2. Data We Collect */}
//               <Section id="data-collected" title="2. Data We Collect">
//                 <p>We collect the following categories of information:</p>
//                 <div className="mt-4 space-y-3">
//                   <InfoBox icon="👤" title="Account & Profile Data" color="#0665ff">
//                     Full name, email address, phone number, company name, and profile picture — collected during registration or profile setup.
//                   </InfoBox>
//                   <InfoBox icon="🔑" title="Authentication Data" color="#22d3ee">
//                     Login credentials, session tokens, OAuth access tokens (from Meta/Facebook, Google), and refresh tokens used to access third-party APIs on your behalf.
//                   </InfoBox>
//                   <InfoBox icon="📊" title="Business & Marketing Data" color="#8b5cf6">
//                     Ad campaign data, performance metrics, audience targeting parameters, creative assets, and connected ad account information you provide or we fetch via Meta APIs.
//                   </InfoBox>
//                   <InfoBox icon="🖥️" title="Usage & Technical Data" color="#f59e0b">
//                     IP address, browser type, device type, operating system, pages visited, feature usage patterns, session duration, and error logs for platform improvement.
//                   </InfoBox>
//                   <InfoBox icon="💬" title="Communications Data" color="#10b981">
//                     Messages sent to our support team, chat logs (if using our Chatbot Builder), and feedback/survey responses.
//                   </InfoBox>
//                 </div>
//               </Section>

//               {/* 3. Facebook / Meta Login */}
//               <Section id="facebook-login" title="3. Facebook / Meta Login & Data">
//                 <p>
//                   Our Platform integrates with <strong className="text-white">Meta Platforms, Inc.</strong> (including Facebook and Instagram) through the official Meta Marketing API and Facebook Login. By connecting your Facebook account, you explicitly authorize us to access the following:
//                 </p>

//                 <div className="mt-5 rounded-xl border border-[#1877F2]/30 bg-[#1877F2]/5 p-5">
//                   <div className="flex items-center gap-3 mb-4">
//                     <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
//                     <p className="font-semibold text-white">Data Accessed via Facebook Login</p>
//                   </div>
//                   <BulletList items={[
//                     'Public profile: Name, profile picture, and Facebook User ID',
//                     'Email address associated with your Facebook account',
//                     'Access to Facebook Pages you manage (page name, ID, category)',
//                     'Instagram Business Accounts linked to your Facebook Page',
//                     'Ad Accounts: Access to create, edit, and monitor paid ad campaigns',
//                     'Ad performance metrics, impressions, clicks, spend, and conversions',
//                     'Audience insights and demographic data (aggregated, not individual)',
//                     'Page insights and post engagement statistics',
//                   ]} />
//                 </div>

//                 <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
//                   <p className="text-amber-300/80 text-sm">
//                     <strong className="text-amber-300">Warning:</strong> We only request permissions that are strictly necessary for the features you choose to use. We will never access your personal Facebook friends list, private messages, or any data outside the scopes you authorize.
//                   </p>
//                 </div>

//                 <p className="mt-4">
//                   The Facebook Login flow is powered by Meta's official OAuth 2.0 framework. Your Facebook credentials are <strong className="text-white">never stored</strong> on our servers. We only store the OAuth access token provided by Meta, which you can revoke at any time from your{' '}
//                   <a href="https://www.facebook.com/settings?tab=business_tools" target="_blank" rel="noopener noreferrer" className="text-[#22d3ee] hover:underline">
//                     Facebook Security Settings
//                   </a>.
//                 </p>
//               </Section>

//               {/* 4. How We Use Data */}
//               <Section id="how-we-use" title="4. How We Use Your Data">
//                 <p>We use collected data for the following purposes:</p>
//                 <BulletList items={[
//                   'To provide, operate, and improve the Platform and its AI-powered features',
//                   'To authenticate your identity and manage your account securely',
//                   'To fetch, display, and analyze your Meta/Facebook ad performance data',
//                   'To create, launch, and optimize advertising campaigns on your behalf via Meta APIs',
//                   'To generate AI-powered recommendations, reports, and marketing insights',
//                   'To send transactional emails (e.g., login alerts, billing receipts, campaign reports)',
//                   'To respond to customer support inquiries',
//                   'To detect and prevent fraud, abuse, or unauthorized access',
//                   'To comply with applicable laws and legal obligations',
//                   'To send product updates or feature announcements (you may opt out at any time)',
//                 ]} />
//                 <div className="mt-4 p-4 rounded-xl border border-green-500/30 bg-green-500/5">
//                   <p className="text-green-300/80 text-sm">
//                     <strong className="text-green-300">We do NOT sell your data.</strong> Your personal information is never sold, rented, or traded to any third party for their marketing or advertising purposes.
//                   </p>
//                 </div>
//               </Section>

//               {/* 5. Third Parties */}
//               <Section id="third-parties" title="5. Third-Party Services & Meta API Processing">
//                 <p>
//                   To deliver our services, we work with the following categories of trusted third parties. All third parties are contractually required to protect your data and may only use it for the purposes we specify.
//                 </p>

//                 <div className="mt-4 overflow-x-auto rounded-xl border border-[#0665ff]/20">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="bg-[#0665ff]/10 border-b border-[#0665ff]/20">
//                         <th className="text-left px-4 py-3 text-white/80 font-semibold">Service</th>
//                         <th className="text-left px-4 py-3 text-white/80 font-semibold">Purpose</th>
//                         <th className="text-left px-4 py-3 text-white/80 font-semibold">Data Shared</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-[#0665ff]/10">
//                       {[
//                         ['Meta / Facebook API', 'Ad campaign management, page insights, Facebook Login', 'OAuth tokens, ad account IDs, campaign configs'],
//                         ['Google Cloud / Firebase', 'Cloud hosting, authentication, database', 'Account data, usage logs'],
//                         ['Stripe / Razorpay', 'Payment processing and billing', 'Payment card details (never stored by us)'],
//                         ['SendGrid / SMTP', 'Transactional email delivery', 'Email address, name'],
//                         ['OpenAI / Gemini AI', 'AI content generation and recommendations', 'Campaign briefs, content prompts (anonymized)'],
//                         ['Sentry / Datadog', 'Error monitoring and performance analytics', 'Error logs, IP address (anonymized)'],
//                       ].map(([svc, purpose, data]) => (
//                         <tr key={svc} className="hover:bg-white/2 transition-colors">
//                           <td className="px-4 py-3 text-[#22d3ee] font-medium">{svc}</td>
//                           <td className="px-4 py-3 text-white/60">{purpose}</td>
//                           <td className="px-4 py-3 text-white/50 text-xs">{data}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 <p className="mt-4">
//                   <strong className="text-white">Meta API Data Processing:</strong> When you connect your Meta account, we act as a data processor on your behalf. Data retrieved from Meta's APIs is used solely to power the features you activate on our Platform. We comply fully with{' '}
//                   <a href="https://developers.facebook.com/terms/" target="_blank" rel="noopener noreferrer" className="text-[#22d3ee] hover:underline">Meta's Platform Terms</a>{' '}
//                   and{' '}
//                   <a href="https://developers.facebook.com/devpolicy/" target="_blank" rel="noopener noreferrer" className="text-[#22d3ee] hover:underline">Developer Policies</a>.
//                 </p>
//               </Section>

//               {/* 6. Data Security */}
//               <Section id="data-security" title="6. Data Security">
//                 <p>
//                   We implement industry-standard technical and organizational measures to protect your personal data against unauthorized access, loss, alteration, or disclosure:
//                 </p>
//                 <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
//                   {[
//                     ['🔒', 'TLS/SSL Encryption', 'All data in transit is encrypted using TLS 1.2+ protocols.'],
//                     ['🗄️', 'AES-256 at Rest', 'Sensitive data is encrypted at rest using AES-256 encryption.'],
//                     ['🔐', 'OAuth 2.0', "We use Meta's OAuth 2.0 — we never store your Facebook password."],
//                     ['🛡️', 'Access Controls', 'Role-based access controls (RBAC) limit internal data access.'],
//                     ['🔍', 'Security Audits', 'Regular security reviews and penetration testing are conducted.'],
//                     ['📋', 'Compliance', "We adhere to Meta's Platform Terms and applicable data protection laws."],
//                   ].map(([icon, title, desc]) => (
//                     <div key={title} className="rounded-xl border border-[#0665ff]/20 bg-[#0665ff]/5 p-4">
//                       <p className="font-semibold text-white text-sm mb-1">{icon} {title}</p>
//                       <p className="text-white/50 text-xs">{desc}</p>
//                     </div>
//                   ))}
//                 </div>
//                 <p className="mt-4 text-white/50 text-sm">
//                   Despite our best efforts, no method of internet transmission or electronic storage is 100% secure. We encourage you to use a strong, unique password and enable two-factor authentication on your account.
//                 </p>
//               </Section>

//               {/* 7. Data Retention */}
//               <Section id="data-retention" title="7. Data Retention">
//                 <p>We retain your personal data only as long as necessary for the purposes described in this Policy:</p>
//                 <BulletList items={[
//                   'Account data is retained for the duration of your active account plus 90 days after account closure.',
//                   'Ad campaign data and analytics are retained for up to 24 months from creation.',
//                   'OAuth access tokens from Meta are retained only while your integration is active and deleted upon disconnection.',
//                   'Payment records are retained for 7 years to comply with financial regulations.',
//                   'Support communications are retained for 3 years.',
//                   'System logs and error reports are retained for 90 days for debugging purposes.',
//                 ]} />
//                 <p className="mt-4">
//                   After the applicable retention period, data is securely deleted or anonymized. You may request early deletion at any time — see the Data Deletion section below.
//                 </p>
//               </Section>

//               {/* 8. Data Deletion */}
//               <Section id="data-deletion" title="8. Data Deletion Instructions">
//                 <p>
//                   You have the right to request deletion of your personal data at any time. Here is how:
//                 </p>

//                 <div className="mt-4 space-y-3">
//                   <div className="rounded-xl border border-[#0665ff]/30 bg-[#0665ff]/5 p-5">
//                     <p className="font-semibold text-white mb-2">Option 1 — Delete from Platform</p>
//                     <ol className="space-y-2 text-sm text-white/60 list-decimal list-inside">
//                       <li>Log in to your Wheedle account</li>
//                       <li>Go to <strong className="text-white/80">Settings → Account</strong></li>
//                       <li>Click <strong className="text-white/80">"Delete My Account"</strong></li>
//                       <li>Confirm deletion — this will permanently remove your account and associated data within 30 days</li>
//                     </ol>
//                   </div>

//                   <div className="rounded-xl border border-[#22d3ee]/30 bg-[#22d3ee]/5 p-5">
//                     <p className="font-semibold text-white mb-2">Option 2 — Email Request</p>
//                     <p className="text-sm text-white/60">
//                       Send a data deletion request to{' '}
//                       <a href="mailto:privacy@wheedle.in" className="text-[#22d3ee] hover:underline">privacy@wheedle.in</a>{' '}
//                       with the subject line <strong className="text-white/80">"Data Deletion Request"</strong> and include your registered email address. We will process your request within 30 days and confirm completion.
//                     </p>
//                   </div>

//                   <div className="rounded-xl border border-[#1877F2]/30 bg-[#1877F2]/5 p-5">
//                     <p className="font-semibold text-white mb-2">Option 3 — Revoke Facebook Access</p>
//                     <p className="text-sm text-white/60">To remove Wheedle's access to your Facebook/Meta data specifically:</p>
//                     <ol className="mt-2 space-y-1 text-sm text-white/60 list-decimal list-inside">
//                       <li>Go to <a href="https://www.facebook.com/settings?tab=business_tools" target="_blank" rel="noopener noreferrer" className="text-[#22d3ee] hover:underline">Facebook Settings → Business Integrations</a></li>
//                       <li>Find <strong className="text-white/80">"Wheedle"</strong> and click <strong className="text-white/80">"Remove"</strong></li>
//                       <li>This will immediately revoke all OAuth tokens and stop any Meta data access</li>
//                     </ol>
//                     <p className="mt-2 text-xs text-white/40">
//                       Note: Revoking Facebook access does not delete your Wheedle account. Follow Option 1 or 2 to delete your full account.
//                     </p>
//                   </div>
//                 </div>
//               </Section>

//               {/* 9. Your Rights */}
//               <Section id="your-rights" title="9. Your Privacy Rights">
//                 <p>
//                   Depending on your location, you may have the following rights regarding your personal data:
//                 </p>
//                 <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
//                   {[
//                     ['📋', 'Right to Access', 'Request a copy of all personal data we hold about you.'],
//                     ['✏️', 'Right to Rectification', 'Correct inaccurate or incomplete personal data.'],
//                     ['🗑️', 'Right to Erasure', 'Request deletion of your personal data ("Right to be Forgotten").'],
//                     ['📦', 'Right to Portability', 'Receive your data in a structured, machine-readable format.'],
//                     ['🚫', 'Right to Object', 'Object to processing of your data for marketing purposes.'],
//                     ['⏸️', 'Right to Restrict', 'Request restriction of processing in certain circumstances.'],
//                     ['🔕', 'Opt-Out of Marketing', 'Unsubscribe from non-essential marketing communications anytime.'],
//                     ['⚖️', 'Right to Complain', 'Lodge a complaint with your local data protection authority.'],
//                   ].map(([icon, title, desc]) => (
//                     <div key={title} className="rounded-xl border border-white/10 bg-white/3 p-4">
//                       <p className="font-semibold text-white text-sm mb-1">{icon} {title}</p>
//                       <p className="text-white/50 text-xs">{desc}</p>
//                     </div>
//                   ))}
//                 </div>
//                 <p className="mt-4">
//                   To exercise any of these rights, contact us at{' '}
//                   <a href="mailto:support@wheedletechnologies.ai" className="text-[#22d3ee] hover:underline">support@wheedletechnologies.ai</a>.
//                   We will respond within 30 days (or as required by applicable law).
//                 </p>
//                 <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/3">
//                   <p className="text-sm text-white/60">
//                     <strong className="text-white">Cookies:</strong> We use essential cookies for authentication and performance cookies for analytics. You may disable non-essential cookies through your browser settings. A full Cookie Policy is available upon request.
//                   </p>
//                 </div>
//               </Section>

//               {/* 10. Contact */}
//               <Section id="contact" title="10. Contact Us">
//                 <p>
//                   If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please reach out to us:
//                 </p>

//                 <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div className="rounded-2xl border border-[#0665ff]/30 bg-gradient-to-br from-[#0665ff]/10 to-transparent p-5">
//                     <p className="text-xs font-mono tracking-widest text-[#22d3ee] uppercase mb-3">Company</p>
//                     <p className="font-bold text-white text-lg">Wheedle Technologies Pvt. Ltd.</p>
//                     <p className="text-white/50 text-sm mt-1">India</p>
//                   </div>

//                   <div className="rounded-2xl border border-[#22d3ee]/30 bg-gradient-to-br from-[#22d3ee]/5 to-transparent p-5 space-y-3">
//                     <p className="text-xs font-mono tracking-widest text-[#22d3ee] uppercase mb-3">Get in Touch</p>
//                     <a href="mailto:privacy@wheedle.in" className="flex items-center gap-2 text-white/70 hover:text-[#22d3ee] transition-colors text-sm">
//                       <span>📧</span> info@wheedletechnologies.ai
//                     </a>
//                     <a href="mailto:support@wheedle.in" className="flex items-center gap-2 text-white/70 hover:text-[#22d3ee] transition-colors text-sm">
//                       <span>🛟</span> support@wheedletechnologies.ai
//                     </a>
//                     <a href="/contact" className="flex items-center gap-2 text-white/70 hover:text-[#22d3ee] transition-colors text-sm">
//                       <span>💬</span> Contact Form
//                     </a>
//                   </div>
//                 </div>

//                 <p className="mt-6 text-white/40 text-sm">
//                   This Privacy Policy was last updated on <strong className="text-white/60">{EFFECTIVE_DATE}</strong>. We reserve the right to update this policy periodically. Material changes will be communicated via email or a prominent notice on our Platform at least 7 days before taking effect.
//                 </p>

//                 <div className="mt-4 flex flex-wrap gap-3">
//                   <a href="/contact" className="text-sm text-[#22d3ee] hover:underline">Contact Us</a>
//                   <span className="text-white/20">|</span>
//                   <a href="/help" className="text-sm text-[#22d3ee] hover:underline">Help Center</a>
//                   <span className="text-white/20">|</span>
//                   <a href="https://www.facebook.com/settings?tab=business_tools" target="_blank" rel="noopener noreferrer" className="text-sm text-[#22d3ee] hover:underline">
//                     Revoke Facebook Access
//                   </a>
//                 </div>
//               </Section>

//             </div>
//           </article>
//         </div>
//       </main>

//       <Footer />
//     </div>
//   );
// };

// export default PrivacyPolicy;
