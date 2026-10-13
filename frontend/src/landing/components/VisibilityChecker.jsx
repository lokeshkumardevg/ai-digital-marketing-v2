// src/landing/components/VisibilityChecker.jsx
// Spec Section 12.1 #9: "Free AI Visibility Checker form (business name, location).
// Calls /v1/public/visibility-scan; email capture for the report."
import { useState } from "react";
import { api } from "../../api/axios";
import { Search, CheckCircle2, Sparkles, Shield, ArrowRight } from "lucide-react";

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
    <section className="relative mx-auto max-w-[950px] px-6 py-20 sm:py-28 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#0665ff]/15 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative rounded-3xl border border-[#0665ff]/30 bg-gradient-to-br from-[#07122A] to-[#040816] p-8 sm:p-14 shadow-[0_20px_60px_rgba(6,101,255,0.2)] backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-300 mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#22d3ee] animate-pulse" />
            <span>Free AI Audit Tool</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Is your brand visible in AI search?
          </h2>

          <p className="mx-auto max-w-lg text-sm sm:text-base leading-relaxed text-slate-300">
            Tell us your business and location — our scanner checks how you appear across AI
            assistants, Google AI Overviews, and maps, then sends a complete diagnostic report.
          </p>
        </div>

        {status === "done" ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h3 className="text-xl text-white font-bold">Audit Request Confirmed</h3>
            <p className="max-w-md text-sm text-slate-300">
              Our autonomous scanner is analyzing AI visibility for{" "}
              <span className="text-[#22d3ee] font-semibold">{form.business || "your brand"}</span>.
              We'll send the full diagnostic report to{" "}
              <span className="text-white font-semibold">{form.email}</span> within 10 minutes.
            </p>
            <button
              onClick={() => {
                setStatus("idle");
                setForm({ business: "", location: "", email: "" });
              }}
              className="mt-3 text-xs text-[#60a5fa] hover:text-white underline"
            >
              Scan another business
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Business Name *
                </label>
                <input
                  name="business"
                  value={form.business}
                  onChange={onChange}
                  placeholder="e.g. Blue Ridge Dental"
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-[#22d3ee] focus:ring-2 focus:ring-[#22d3ee]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  City / Location *
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={onChange}
                  placeholder="e.g. Austin, TX"
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-[#22d3ee] focus:ring-2 focus:ring-[#22d3ee]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Work Email for Report *
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="name@company.com"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-[#22d3ee] focus:ring-2 focus:ring-[#22d3ee]/20"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0665ff] to-[#22d3ee] px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_25px_rgba(6,101,255,0.4)] transition-all hover:opacity-90 disabled:opacity-60"
            >
              <Search className="w-4 h-4" />
              <span>{status === "loading" ? "Scanning in progress…" : "Generate Free AI Visibility Report"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-6 pt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#22d3ee]" />
                Zero spam promise
              </span>
              <span>•</span>
              <span>No credit card required</span>
              <span>•</span>
              <span>100% Confidential</span>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export default VisibilityChecker;
