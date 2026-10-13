// src/landing/components/TrustSecurity.jsx
// Spec Section 12.1 #10: "Only certifications and policies actually held."
// Describes the approval and audit model with direct link to /security.
import { ShieldCheck, ClipboardCheck, Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const POINTS = [
  {
    icon: ShieldCheck,
    title: "Nothing goes live without approval",
    body: "Every reply, post, or campaign draft waits in your Approvals inbox until you (or an explicit rule you set) signs off.",
    badge: "Human Sign-off Inbox",
  },
  {
    icon: ClipboardCheck,
    title: "Every action is immutably logged",
    body: "Each agent execution — what it saw, what it drafted, and which user approved it — is recorded for full retrospective visibility.",
    badge: "Complete Observability",
  },
  {
    icon: Lock,
    title: "Your data stays in your vault",
    body: "Each workspace's ad credentials, client contacts, and brand guidelines are completely isolated — zero cross-tenant training.",
    badge: "AES-256 Vault",
  },
];

function TrustSecurity() {
  return (
    <section className="relative mx-auto max-w-[1200px] px-6 py-20 sm:py-28 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#0665ff]/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="mb-12 text-center sm:mb-16 relative z-10">
        <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0665ff]/30 bg-[#0665ff]/10 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_8px_#22d3ee] animate-pulse" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#60a5fa]">
            Trust &amp; Governance
          </span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          You stay in control of what goes out
        </h2>
        <p className="mt-4 max-w-lg mx-auto text-sm sm:text-base text-slate-400">
          Autonomous execution bounded by strict human oversight, data isolation, and auditable safeguards.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 relative z-10">
        {POINTS.map(({ icon: Icon, title, body, badge }) => (
          <div
            key={title}
            className="group rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-8 hover:border-[#0665ff]/50 transition-all duration-300 hover:-translate-y-1.5 shadow-[0_10px_35px_rgba(6,101,255,0.08)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0665ff]/15 border border-[#0665ff]/30 text-[#22d3ee] group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300">
                  {badge}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Security page link CTA */}
      <div className="mt-10 text-center relative z-10">
        <Link
          to="/security"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#60a5fa] hover:text-[#22d3ee] transition-colors"
        >
          <span>Explore our complete security and compliance architecture</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

export default TrustSecurity;
