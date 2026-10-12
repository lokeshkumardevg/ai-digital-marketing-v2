// src/landing/components/OrchestrationDemo.jsx
// Spec Section 12.1 #6: "Animated example: a negative review triggers Experience,
// Presence and Operations coworkers." Same example is reused on the Agents page
// per the spec (12.3) — if you build that there, copy this STEPS array over.
import { useState } from "react";

const STEPS = [
  {
    coworker: "Echo", role: "Experience", accent: "#e23b3b",
    title: "A 2-star review comes in",
    body: "Echo's Sentiment & Insights agent scores it, and Ticketing opens an internal task with the owner notified.",
  },
  {
    coworker: "Stella", role: "Presence", accent: "#f59e0b",
    title: "A reply gets drafted",
    body: "Stella's Review Response agent writes a reply in your brand voice and sends it for approval before it goes live.",
  },
  {
    coworker: "Atlas", role: "Operations", accent: "#2f8f5b",
    title: "If it was a scheduling issue",
    body: "Atlas's Appointments agent checks whether the complaint traces back to a booking problem and flags it for follow-up.",
  },
  {
    coworker: "Echo", role: "Experience", accent: "#e23b3b",
    title: "Closed, and logged",
    body: "Once the reply is approved and published, the ticket closes and the whole run shows up in your activity log.",
  },
];

function OrchestrationDemo() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <section className="relative mx-auto max-w-[1100px] px-6 py-20 sm:py-28">
      <div className="mb-12 text-center sm:mb-14">
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-slate-500 sm:w-16" />
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">One event, three coworkers</span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-slate-500 sm:w-16" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          What happens when a review goes wrong
        </h2>
      </div>

      {/* step rail */}
      <div className="mb-8 flex items-center justify-center gap-2 sm:gap-3">
        {STEPS.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className="flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-all sm:h-10 sm:w-10"
            style={
              i === active
                ? { borderColor: s.accent, background: s.accent, color: "#fff" }
                : { borderColor: "rgba(255,255,255,0.15)", background: "rgba(15,20,36,0.6)", color: "rgba(255,255,255,0.5)" }
            }
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* active step card */}
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center">
        <span
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide"
          style={{ borderColor: `${step.accent}66`, color: step.accent }}
        >
          {step.coworker} · {step.role}
        </span>
        <h3 className="mt-4 text-xl font-bold text-white sm:text-2xl">{step.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-[15px]">{step.body}</p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setActive((a) => Math.max(0, a - 1))}
            disabled={active === 0}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white/70 transition-colors hover:bg-white/5 disabled:opacity-30"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setActive((a) => Math.min(STEPS.length - 1, a + 1))}
            disabled={active === STEPS.length - 1}
            className="rounded-full bg-gradient-to-r from-[#1468e8] to-[#1abfdf] px-5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            Next step
          </button>
        </div>
      </div>
    </section>
  );
}

export default OrchestrationDemo;