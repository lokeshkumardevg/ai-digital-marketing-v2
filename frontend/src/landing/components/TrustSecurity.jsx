// src/landing/components/TrustSecurity.jsx
// Spec Section 12.1 #10: "Only certifications and policies actually held."
// We don't claim SOC 2 / ISO / HIPAA here because nothing in this codebase proves
// those are actually held — claiming them falsely is the same mistake that was
// just fixed on TrustedBy.jsx. This describes the approval/audit MODEL instead,
// which is real and already designed (Section 7 of the spec), and links out to
// a dedicated /security page once one exists.
import { ShieldCheck, ClipboardCheck, Lock } from "lucide-react";

const POINTS = [
  {
    icon: ShieldCheck,
    title: "Nothing goes live without approval",
    body: "Every reply, post or message an agent drafts waits in your Approvals inbox until you (or a rule you set) approves it.",
  },
  {
    icon: ClipboardCheck,
    title: "Every action is logged",
    body: "Each agent run — what it saw, what it decided, what it did — is recorded, so you can see exactly what happened and when.",
  },
  {
    icon: Lock,
    title: "Your data stays in your workspace",
    body: "Each account's data, integrations and brand profile are isolated — nothing is shared across customers.",
  },
];

function TrustSecurity() {
  return (
    <section className="relative mx-auto max-w-[1100px] px-6 py-20 sm:py-28">
      <div className="mb-12 text-center sm:mb-14">
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-slate-500 sm:w-16" />
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Trust & security</span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-slate-500 sm:w-16" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          You stay in control of what goes out
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {POINTS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-slate-900/50 p-7">
            <Icon className="h-7 w-7 text-cyan-300" />
            <h3 className="mt-4 text-lg font-bold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrustSecurity;
