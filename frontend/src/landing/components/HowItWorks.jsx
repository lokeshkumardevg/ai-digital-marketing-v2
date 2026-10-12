// src/landing/components/HowItWorks.jsx
// Spec Section 12.1 #5: "Consolidate, Reason, Act with a diagram from data sources
// to actions, plus the approval step." Platform-level flow — sits above the
// ads-specific 4-step flow in ResultsGrid, which stays as Max's own detail.
const STEPS = [
  {
    n: "01",
    title: "Consolidate",
    body: "Reviews, listings, messages, calls and campaigns from every platform land in one unified store — nothing scattered across ten logins.",
    accent: "#1abfdf",
  },
  {
    n: "02",
    title: "Reason",
    body: "Each coworker reads your brand voice, location context and past history before deciding what to do next — not a generic reply.",
    accent: "#1468e8",
  },
  {
    n: "03",
    title: "Act — with approval",
    body: "Agents draft the action. Nothing publishes, sends or spends until it's approved — by you, or automatically once you trust it.",
    accent: "#8b5cf6",
  },
];

function HowItWorks() {
  return (
    <section className="relative mx-auto max-w-[1200px] px-6 py-20 sm:py-28">
      <div className="mb-14 text-center sm:mb-16">
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-slate-500 sm:w-16" />
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">How it works</span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-slate-500 sm:w-16" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Consolidate. Reason. <span className="bg-gradient-to-r from-[#1468e8] to-[#1abfdf] bg-clip-text text-transparent">Act.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.n} className="relative rounded-2xl border border-white/10 bg-slate-900/50 p-7">
            <span className="text-5xl font-black" style={{ color: s.accent, opacity: 0.35 }}>
              {s.n}
            </span>
            <h3 className="mt-3 text-xl font-bold text-white">{s.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{s.body}</p>
            {i < STEPS.length - 1 && (
              <span className="absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-gradient-to-r from-white/30 to-transparent sm:block" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;