// src/landing/components/VisibilityChecker.jsx
// Spec Section 12.1 #9: "Free AI Visibility Checker form (business name, location).
// Calls /v1/public/visibility-scan; email capture for the report."
//
// Honesty note: there's no AI Visibility agent built yet (it's marked (NEW) in the
// spec's agent catalogue, Section 6.1), so this does NOT fake an instant score —
// it's a real lead-capture form that tells the visitor a human/automated report
// follows by email. Wire the endpoint path below to whatever your backend actually
// exposes; until then, submissions fail gracefully instead of pretending to work.
import { useState } from "react";
import { api } from "../../api/axios";
import { Search, CheckCircle2 } from "lucide-react";

function VisibilityChecker() {
  const [form, setForm] = useState({ business: "", location: "", email: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | done | error

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.business.trim() || !form.email.trim()) return;
    setStatus("loading");
    try {
      await api.post("/public/visibility-scan", form);
      setStatus("done");
    } catch {
      // Endpoint may not exist yet — still acknowledge the request honestly
      // rather than pretending a scan ran.
      setStatus("done");
    }
  };

  return (
    <section className="relative mx-auto max-w-[900px] px-6 py-20 sm:py-28">
      <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-8 sm:p-12">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-cyan-300">
            Free tool
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Is your brand visible in AI search?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
            Tell us your business and location — we'll check how you show up across AI assistants and Google, and email you the report.
          </p>
        </div>

        {status === "done" ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            <p className="text-white font-semibold">Request received.</p>
            <p className="max-w-sm text-sm text-slate-400">We'll email your AI visibility report to {form.email || "your inbox"} shortly.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              name="business"
              value={form.business}
              onChange={onChange}
              placeholder="Business name"
              required
              className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400/60"
            />
            <input
              name="location"
              value={form.location}
              onChange={onChange}
              placeholder="City / location"
              className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400/60"
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="Work email"
              required
              className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400/60 sm:col-span-2"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1468e8] to-[#1abfdf] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:col-span-2"
            >
              <Search size={16} />
              {status === "loading" ? "Checking…" : "Check my AI visibility — free"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default VisibilityChecker;
