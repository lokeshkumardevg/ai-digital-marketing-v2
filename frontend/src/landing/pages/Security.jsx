import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ShieldCheck,
  KeyRound,
  ClipboardCheck,
  UserCheck,
  MessageSquareOff,
  Star,
  Bot,
  BadgeCheck,
  Lock,
  Server,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const CORE_GUARDRAILS = [
  {
    icon: UserCheck,
    title: "Human-in-the-Loop Governance",
    desc: "Autonomous does not mean unsupervised. Zero campaigns spend, publish, or modify bids beyond your pre-configured limits without explicit team sign-off in the Approvals Inbox.",
    badge: "Active by Default",
  },
  {
    icon: Lock,
    title: "Isolated Tenant Vaults",
    desc: "Every workspace is completely isolated. Your ad account tokens, customer lists, CRM contacts, and proprietary creatives are encrypted using AES-256 and never shared or co-mingled.",
    badge: "Hardware-grade AES-256",
  },
  {
    icon: Server,
    title: "Zero Cross-Training on Client Data",
    desc: "Your proprietary brand voice, customer reviews, and sales metrics are strictly used to serve your workspace. Your data is never fed back into public foundational AI models.",
    badge: "Strict Privacy Guarantee",
  },
  {
    icon: ClipboardCheck,
    title: "Immutable Decision Audit Trails",
    desc: "Every action an agent considers — what it observed, what angle it formulated, which human approved it, and when it executed — is recorded with tamper-proof cryptographic logs.",
    badge: "Complete Observability",
  },
];

const SECURITY_DOMAINS = [
  {
    icon: KeyRound,
    title: "Access Control & RBAC",
    body: "Role-based access control with granular location scoping. Team members only see the clients, brands, and ad accounts they are assigned to. SSO and scoped API keys are supported.",
  },
  {
    icon: ShieldCheck,
    title: "Data Protection in Transit & Rest",
    body: "All external communications utilize TLS 1.3. Provider credentials (Google, Meta, WhatsApp Cloud API) are stored in dedicated hardware-backed token vaults, never in plaintext configuration.",
  },
  {
    icon: ClipboardCheck,
    title: "Audit Log & Observability",
    body: "Every coworker action, draft revision, budget pacing adjustment, and human sign-off is logged with full contextual metadata for internal compliance reviews.",
  },
  {
    icon: UserCheck,
    title: "Data Privacy & DPDP Alignment",
    body: "Consent is tracked on a per-contact and per-channel basis. Export and deletion workflows align with India's Digital Personal Data Protection Act, 2023 and global privacy frameworks.",
  },
  {
    icon: MessageSquareOff,
    title: "Responsible Messaging Guardrails",
    body: "WhatsApp and SMS outreach only occurs with verified opt-in and platform-approved templates. Opt-outs are instantly honored, and outreach strictly abides by local quiet hours.",
  },
  {
    icon: Star,
    title: "Anti-Gating Review Policy",
    body: "Review invitations and customer surveys are never filtered or gated by expected sentiment. Every customer is offered an authentic voice, protecting your business from platform penalties.",
  },
  {
    icon: Bot,
    title: "AI Safety & Content Redaction",
    body: "All agent outputs are validated against content filters before reaching your inbox. PII is automatically redacted, and sensitive legal or refund queries automatically escalate to human operators.",
  },
  {
    icon: BadgeCheck,
    title: "Truthful & Verifiable Metrics",
    body: "We only publish certifications, uptime statistics, and performance benchmarks that are independently verifiable. If a badge is not verified, it does not appear on our platform.",
  },
];

function Security() {
  return (
    <div className="min-h-screen bg-[#00040f] text-white overflow-hidden">
      <Navbar />

      {/* ───────────────── HERO SECTION ───────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden text-center">
        {/* Glow backdrop */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#0665ff]/20 blur-[150px] rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-[350px] h-[250px] bg-[#22d3ee]/10 blur-[120px] rounded-full" />
        </div>

        {/* Ambient Grid */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(6,101,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(6,101,255,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse 70% 50% at 50% 30%, black 0%, transparent 100%)",
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0665ff]/30 bg-[#0665ff]/10 mb-6 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_8px_#22d3ee] animate-pulse" />
            <span className="text-[11px] font-semibold tracking-[0.14em] text-[#60a5fa] uppercase">
              Trust, Security & Compliance
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Engineered for Security,{" "}
            <span className="bg-gradient-to-r from-[#0665ff] via-[#22d3ee] to-[#818cf8] bg-clip-text text-transparent">
              Built for Total Control
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed mb-8">
            How Wheedle.ai protects your customer data, isolates ad account credentials, and
            ensures you stay in full command of every autonomous action.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              "Zero Autonomous Overspending",
              "AES-256 Token Vault",
              "India DPDP Act Alignment",
              "Human Sign-off Inbox",
            ].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-xs text-slate-300"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22d3ee]" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── 4 CORE GUARDRAILS ───────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Core Architectural Safeguards
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            The foundational security principles wired into every agent execution cycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CORE_GUARDRAILS.map((g) => {
            const Icon = g.icon;
            return (
              <div
                key={g.title}
                className="relative rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-8 hover:border-[#0665ff]/50 transition-all duration-300 shadow-[0_10px_35px_rgba(6,101,255,0.08)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0665ff]/20 border border-[#0665ff]/30 text-[#22d3ee]">
                      <Icon className="w-6 h-6" />
                    </span>
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#22d3ee]/10 border border-[#22d3ee]/30 text-[#22d3ee]">
                      {g.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{g.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{g.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ───────────────── 8 DETAILED SECURITY DOMAINS ───────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0665ff]/30 bg-[#0665ff]/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_8px_#22d3ee]" />
            <span className="text-[11px] font-semibold tracking-[0.12em] text-[#60a5fa] uppercase">
              Specification Details
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Security &amp; Data Governance Model
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Honest, verifiable explanations of how each subsystem treats external credentials,
            customer interactions, and messaging protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {SECURITY_DOMAINS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-7 hover:border-[#0665ff]/40 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-cyan-300">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-bold text-white">{title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-400 pl-[52px]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────── DISCLOSURE & AUDIT NOTICE BANNER ───────────────── */}
      <section className="relative max-w-5xl mx-auto px-6 py-12">
        <div className="rounded-3xl border border-[#0665ff]/30 bg-gradient-to-r from-[#07122A] via-[#09183d] to-[#040816] p-8 sm:p-10 shadow-[0_15px_50px_rgba(6,101,255,0.15)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Have enterprise security questions or custom audit requirements?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed">
              Our security engineering team can provide our detailed Architecture Security Review,
              data flow diagrams, and discuss custom VPC or dedicated tenancy options.
            </p>
          </div>

          <a
            href="/contact"
            className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0665ff] to-[#22d3ee] px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(6,101,255,0.4)] hover:opacity-90 transition-opacity"
          >
            <span>Contact Security Team</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Security;
