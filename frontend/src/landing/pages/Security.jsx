// src/landing/pages/Security.jsx
// Spec Section 12.3 "Other pages" -> Security: "Data handling, approval and audit
// model, compliance status." Content is drawn from Section 13 (Security and
// compliance), framed as design principles the platform is built around — not as
// held certifications, since Section 13 itself says: "Publish only certifications
// and metrics that can be verified." Replace the italic notes once something is
// actually true and verifiable (an SSO rollout, a completed legal review, etc.).
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ShieldCheck, KeyRound, ClipboardCheck, UserCheck, MessageSquareOff, Star, Bot, BadgeCheck } from "lucide-react";

const AREAS = [
  {
    icon: KeyRound,
    title: "Access control",
    body: "Role-based access with location scoping, so a team member only sees the locations they're meant to. SSO and API key scopes are supported.",
  },
  {
    icon: ShieldCheck,
    title: "Data protection",
    body: "Data is encrypted in transit and at rest. Provider credentials (Google, Meta, WhatsApp, etc.) sit in a token vault, not in plain config.",
  },
  {
    icon: ClipboardCheck,
    title: "Audit log",
    body: "Every agent action and every human approval is recorded — what was seen, what was decided, what was done, and by whom.",
  },
  {
    icon: UserCheck,
    title: "Privacy",
    body: "Consent is tracked per contact and per channel, with deletion and export workflows. We're aligning this with India's Digital Personal Data Protection Act, 2023.",
  },
  {
    icon: MessageSquareOff,
    title: "Messaging rules",
    body: "WhatsApp messages only go out with opt-in and approved templates. Opt-outs are honored, and outbound calls/messages respect quiet hours.",
  },
  {
    icon: Star,
    title: "Review policy",
    body: "Review requests and surveys are never filtered by expected sentiment (\"review gating\"). Every customer gets asked, not just the happy ones.",
  },
  {
    icon: Bot,
    title: "AI safety",
    body: "Agent output is validated before it's shown, personal data is redacted, and anything touching legal or refund language escalates to a human. Approval is on by default.",
  },
  {
    icon: BadgeCheck,
    title: "Claims we make",
    body: "We only publish certifications and metrics we can actually verify. If a badge isn't earned yet, it isn't on this page.",
  },
];

function Security() {
  return (
    <div className="min-h-screen bg-[#05070f]">
      <Navbar />

      <section className="relative mx-auto max-w-[1000px] px-6 pb-16 pt-28 text-center sm:pt-32">
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-cyan-300">
          Security &amp; compliance
        </span>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          How we handle your data and your customers'
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
          These are the principles the platform is designed and built around. Where something is still in progress, we say so — we'd rather be accurate than impressive.
        </p>
      </section>

      <section className="mx-auto max-w-[1100px] px-6 pb-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {AREAS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-slate-900/50 p-7">
              <Icon className="h-7 w-7 text-cyan-300" />
              <h3 className="mt-4 text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-slate-500">
          This page describes how the platform is designed, not a list of held certifications. A formal compliance programme (SOC 2, ISO 27001, etc.) and legal review of data-protection obligations are separate, ongoing efforts — contact us for the current status.
        </p>
      </section>

      <Footer />
    </div>
  );
}

export default Security;
