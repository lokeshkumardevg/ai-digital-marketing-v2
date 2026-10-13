// src/landing/components/HowItWorks.jsx
// Spec Section 12.1 #5: "Consolidate, Reason, Act with a diagram from data sources
// to actions, plus the approval step." Platform-level flow.
import { Database, BrainCircuit, ShieldCheck, ArrowRight } from "lucide-react";

const STEPS = [
  {
    n: "01",
    title: "Consolidate",
    icon: Database,
    badge: "Unified Ingestion",
    body: "Reviews, listings, messages, calls, ad accounts, and analytics land in one synchronized store — zero fragmented logins across ten portals.",
    accent: "#1abfdf",
    gradient: "from-[#1abfdf]/20 to-transparent",
  },
  {
    n: "02",
    title: "Reason",
    icon: BrainCircuit,
    badge: "Context Calibration",
    body: "Each coworker digests your brand voice, location context, past performance, and competitor signals before generating targeted actions.",
    accent: "#1468e8",
    gradient: "from-[#1468e8]/20 to-transparent",
  },
  {
    n: "03",
    title: "Act — with approval",
    icon: ShieldCheck,
    badge: "Supervised Execution",
    body: "Coworkers draft the action. Nothing publishes, sends, or spends until it's approved by you — or automated once you set threshold trust rules.",
    accent: "#8b5cf6",
    gradient: "from-[#8b5cf6]/20 to-transparent",
  },
];

function HowItWorks() {
  return (
    <section className="relative mx-auto max-w-[1200px] px-6 py-20 sm:py-28 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#1468e8]/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="mb-14 text-center sm:mb-16 relative z-10">
        <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0665ff]/30 bg-[#0665ff]/10 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_8px_#22d3ee] animate-pulse" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#60a5fa]">
            Architecture &amp; Flow
          </span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Consolidate. Reason.{" "}
          <span className="bg-gradient-to-r from-[#1468e8] to-[#1abfdf] bg-clip-text text-transparent">
            Act.
          </span>
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-slate-400">
          How our AI coworkers transform raw multichannel data into high-converting, brand-governed executions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 relative z-10">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.n}
              className="group relative rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-8 hover:border-[#1468e8]/50 transition-all duration-300 hover:-translate-y-1.5 shadow-[0_10px_35px_rgba(6,101,255,0.08)] flex flex-col justify-between"
            >
              {/* Top Accent Line */}
              <div
                className="absolute top-0 left-8 right-8 h-[2px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(90deg, transparent, ${s.accent}, transparent)`,
                }}
              />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border"
                    style={{
                      background: `radial-gradient(circle, ${s.accent}20, transparent)`,
                      borderColor: `${s.accent}40`,
                      color: s.accent,
                    }}
                  >
                    <Icon className="h-6 w-6" />
                  </span>

                  <span
                    className="text-4xl font-black tracking-tight"
                    style={{ color: s.accent, opacity: 0.4 }}
                  >
                    {s.n}
                  </span>
                </div>

                <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300 mb-3">
                  {s.badge}
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{s.body}</p>
              </div>

              {i < STEPS.length - 1 && (
                <div className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900 border border-white/10 items-center justify-center text-[#22d3ee] shadow-lg">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default HowItWorks;