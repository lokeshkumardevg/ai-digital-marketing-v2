import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import {
  Search,
  BookOpen,
  Sparkles,
  Settings,
  Plug,
  ShieldCheck,
  HelpCircle,
  MessageSquare,
  Mail,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  LifeBuoy,
  FileText,
  Activity,
} from "lucide-react";

const HELP_CATEGORIES = [
  {
    icon: BookOpen,
    title: "Getting Started",
    desc: "Platform overview, workspace setup, connecting Meta and Google ad accounts.",
    articles: [
      "Connecting your Meta Business Manager",
      "Authorizing Google Ads via OAuth",
      "Setting your workspace time zone and currency",
      "Inviting team members and setting roles",
    ],
    count: 8,
  },
  {
    icon: Sparkles,
    title: "AI Coworkers & Agents",
    desc: "Configuring Max, Stella, Atlas, and Echo for autonomous operations.",
    articles: [
      "How Max structures multi-channel campaigns",
      "Setting approval rules for social posts",
      "Configuring Stella's review reply tone",
      "Connecting Atlas to your booking calendar",
    ],
    count: 12,
  },
  {
    icon: Settings,
    title: "Billing & Subscriptions",
    desc: "Plans, payments, GST invoices, upgrading, and subscription changes.",
    articles: [
      "Upgrading or switching your active plan",
      "Downloading GST-compliant tax invoices",
      "Accepted payment methods (Cards, UPI, NetBanking)",
      "How the 3-day free trial works",
    ],
    count: 6,
  },
  {
    icon: Plug,
    title: "Integrations & APIs",
    desc: "Syncing Shopify, CRMs, WhatsApp Cloud API, and webhooks.",
    articles: [
      "Shopify product catalog synchronization",
      "HubSpot and Salesforce CRM lead routing",
      "WhatsApp Business API template guidelines",
      "Configuring outbound webhook payloads",
    ],
    count: 10,
  },
  {
    icon: ShieldCheck,
    title: "Security & Approvals",
    desc: "Data governance, token vaults, audit logs, and compliance.",
    articles: [
      "Approvals inbox: signing off on drafts",
      "Audit trail: inspecting past agent actions",
      "Data isolation across brand workspaces",
      "Compliance with India DPDP Act 2023",
    ],
    count: 7,
  },
  {
    icon: HelpCircle,
    title: "Troubleshooting",
    desc: "Quick fixes for common errors, token re-auth, and delivery hiccups.",
    articles: [
      "Ad account disconnected or token expired",
      "Meta Ads creative format rejection",
      "Review request message delivery failed",
      "Webhook signature verification errors",
    ],
    count: 9,
  },
];

const POPULAR_FAQS = [
  {
    q: "How does the autonomous approval model work?",
    a: "By default, no ad is published, no budget is modified, and no message is sent without your explicit sign-off in the Approvals Inbox. You can gradually set autonomous threshold rules (e.g. auto-approve review replies above 4 stars, auto-scale winning campaigns up to ₹5,000/day) once you trust the AI.",
  },
  {
    q: "What ad spend limits are included with my plan?",
    a: "Starter includes up to ₹50,000 monthly ad spend management, Growth covers up to ₹2,00,000, and Enterprise includes unlimited spend. If your campaigns near your limit, you receive an automated notification with options to scale without interruption.",
  },
  {
    q: "Can I manage multiple clients or separate brands?",
    a: "Yes. Wheedle.ai features multi-brand workspace isolation. Each brand has its own connected ad accounts, brand guidelines, creative library, and team access permissions.",
  },
  {
    q: "How do I get help if something fails at 2 AM?",
    a: "All critical errors trigger automatic campaign pausing so no budget is wasted. Enterprise customers have 24/7 dedicated Slack/WhatsApp support, and all plans receive 24/7 automated monitoring with priority email response.",
  },
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  const SUGGESTIONS = [
    "Connect Meta Ads",
    "Max campaign settings",
    "GST Invoices",
    "Approvals workflow",
    "WhatsApp API",
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[#00040f] text-white">
      <Navbar />

      {/* ───────────────── HERO SECTION ───────────────── */}
      <section className="relative pt-28 pb-10 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-[#0665ff]/20 blur-[140px] rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[200px] bg-[#22d3ee]/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#0665ff]/30 bg-[#0665ff]/10 mb-4 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_8px_#22d3ee] animate-pulse" />
            <span className="text-[11px] font-semibold tracking-[0.14em] text-[#60a5fa] uppercase">
              Knowledge & Support Hub
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight mb-3">
            How can we help your business{" "}
            <span className="bg-gradient-to-r from-[#0665ff] via-[#22d3ee] to-[#818cf8] bg-clip-text text-transparent">
              grow today?
            </span>
          </h1>

          <p className="max-w-lg mx-auto text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
            Find answers, documentation, troubleshooting guides, and best practice playbooks
            for Wheedle.ai's autonomous platform.
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto mb-5">
            <div className="relative flex items-center rounded-2xl border border-[#0665ff]/40 bg-slate-900/80 backdrop-blur-xl p-1.5 shadow-[0_10px_35px_rgba(6,101,255,0.18)] focus-within:border-[#22d3ee] focus-within:ring-2 focus-within:ring-[#22d3ee]/30 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across guides, articles, and FAQs..."
                className="w-full bg-transparent px-3 py-2 text-white placeholder-slate-500 outline-none text-xs sm:text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Suggested searches */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Popular:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSearchQuery(s)}
                className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300 hover:border-[#0665ff]/50 hover:text-[#22d3ee] transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── CORE HELP CATEGORIES ───────────────── */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {HELP_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.title}
                className="group relative rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-6 hover:border-[#0665ff]/50 hover:bg-slate-900/80 transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_30px_rgba(6,101,255,0.06)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0665ff]/15 border border-[#0665ff]/30 text-[#22d3ee] group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-slate-400">
                      {cat.count} articles
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#60a5fa] transition-colors mb-1.5">
                    {cat.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {cat.desc}
                  </p>

                  <ul className="space-y-2 mb-5">
                    {cat.articles.map((art) => (
                      <li key={art}>
                        <a
                          href="#"
                          className="flex items-center gap-2 text-xs text-slate-300 hover:text-[#22d3ee] transition-colors"
                        >
                          <span className="h-1 w-1 rounded-full bg-[#0665ff]" />
                          <span className="line-clamp-1">{art}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#60a5fa]">
                  <span>Explore category</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ───────────────── POPULAR FAQS SECTION ───────────────── */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0665ff]/30 bg-[#0665ff]/10 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_8px_#22d3ee]" />
            <span className="text-[10px] font-semibold tracking-[0.12em] text-[#60a5fa] uppercase">
              Frequently Answered
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Quick Answers to Common Questions
          </h2>
        </div>

        <div className="space-y-3">
          {POPULAR_FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left text-sm sm:text-base font-semibold text-white hover:text-[#60a5fa] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[#22d3ee]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs sm:text-sm leading-relaxed text-slate-300/80 border-t border-white/5 pt-2.5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ───────────────── SUPPORT CHANNELS & STATUS ───────────────── */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="rounded-2xl border border-[#0665ff]/30 bg-gradient-to-br from-[#07122A] to-[#040816] p-6 sm:p-8 shadow-[0_15px_40px_rgba(6,101,255,0.12)]">
          <div className="text-center max-w-lg mx-auto mb-8">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 text-[10px] font-bold uppercase tracking-wider mb-2">
              Still Need Help?
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Our support engineers are ready
            </h3>
            <p className="text-xs text-slate-400">
              Pick the channel that fits your workflow. We are active across all timezones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 text-center hover:border-[#0665ff]/50 transition-all">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#0665ff]/20 text-[#22d3ee] mb-3">
                <MessageSquare className="w-5 h-5" />
              </span>
              <h4 className="text-sm font-bold text-white mb-1">Live Chat</h4>
              <p className="text-[11px] text-slate-400 mb-3">
                Chat with product specialists directly inside your dashboard.
              </p>
              <a
                href="/contact"
                className="inline-block text-xs font-semibold text-[#60a5fa] hover:text-white transition-colors"
              >
                Start conversation →
              </a>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 text-center hover:border-[#0665ff]/50 transition-all">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#0665ff]/20 text-[#22d3ee] mb-3">
                <Mail className="w-5 h-5" />
              </span>
              <h4 className="text-sm font-bold text-white mb-1">Priority Email</h4>
              <p className="text-[11px] text-slate-400 mb-3">
                Guaranteed response within 2 hours for all technical inquiries.
              </p>
              <a
                href="mailto:support@wheedle.ai"
                className="inline-block text-xs font-semibold text-[#60a5fa] hover:text-white transition-colors"
              >
                support@wheedle.ai →
              </a>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 text-center hover:border-[#0665ff]/50 transition-all">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 mb-3">
                <Activity className="w-5 h-5" />
              </span>
              <h4 className="text-sm font-bold text-white mb-1">System Status</h4>
              <p className="text-[11px] text-slate-400 mb-3">
                All platform nodes, OAuth vaults, and webhooks operating normally.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                99.98% Operational
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Reusable Platform Sections */}
      <Newsletter />
      <Footer />
    </div>
  );
}