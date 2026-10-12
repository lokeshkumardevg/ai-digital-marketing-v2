// src/landing/components/Industries.jsx
// Spec Section 12.1 #7: "Tabs for local business, ecommerce, SaaS, clinics, real
// estate, restaurants. Each: quote, one big number, 'connects to' logos."
//
// Honesty note: the spec also says "Content from real customers only" — we don't
// have real customer quotes or numbers per industry yet, so instead of inventing
// them (the exact mistake fixed earlier on this site), each tab describes what
// the platform actually does for that industry. Swap in a real quote/number once
// you have one, industry by industry.
import { useState } from "react";

const INDUSTRIES = [
  {
    id: "local",
    label: "Local Business",
    headline: "Show up first when someone searches nearby",
    body: "Stella keeps your listings accurate across every directory and answers reviews fast, while Max runs local search ads for the areas you actually serve.",
    connects: ["Google Business Profile", "Google Ads", "WhatsApp"],
  },
  {
    id: "ecommerce",
    label: "Ecommerce",
    headline: "Turn catalog data into ads, automatically",
    body: "Max syncs your product catalog and builds campaigns around what's actually in stock, while Stella handles post-purchase reviews and social.",
    connects: ["Shopify", "Meta Ads", "Google Ads"],
  },
  {
    id: "saas",
    label: "SaaS",
    headline: "Keep the pipeline full without a growth team",
    body: "Max runs lead generation and segmentation off your CRM data, and Echo turns support tickets and churn signals into a weekly report.",
    connects: ["CRM (HubSpot/Salesforce)", "Google Ads", "Slack"],
  },
  {
    id: "clinics",
    label: "Clinics",
    headline: "Never miss a call, never lose a slot",
    body: "Atlas answers calls and WhatsApp, books appointments against your real calendar, and fills cancellations from the waitlist automatically.",
    connects: ["Calendar APIs", "WhatsApp Cloud API", "Telephony"],
  },
  {
    id: "real-estate",
    label: "Real Estate",
    headline: "Follow up on every lead before it goes cold",
    body: "Max qualifies and routes new leads the moment they come in, and Atlas follows up by call or WhatsApp so nothing sits for a day unattended.",
    connects: ["CRM", "WhatsApp Cloud API", "Meta Lead Ads"],
  },
  {
    id: "restaurants",
    label: "Restaurants",
    headline: "Turn good nights into good reviews",
    body: "Stella asks every diner for a review and replies fast, while Echo flags a bad night early through sentiment on incoming feedback.",
    connects: ["Google Business Profile", "WhatsApp", "Meta"],
  },
];

function Industries() {
  const [active, setActive] = useState(0);
  const ind = INDUSTRIES[active];

  return (
    <section className="relative mx-auto max-w-[1100px] px-6 py-20 sm:py-28">
      <div className="mb-10 text-center sm:mb-12">
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-slate-500 sm:w-16" />
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Industries</span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-slate-500 sm:w-16" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Built for your kind of business</h2>
      </div>

      {/* tabs */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        {INDUSTRIES.map((i, idx) => (
          <button
            key={i.id}
            type="button"
            onClick={() => setActive(idx)}
            aria-pressed={idx === active}
            className="rounded-full border px-4 py-2 text-xs font-semibold transition-all sm:text-sm"
            style={
              idx === active
                ? { borderColor: "#1abfdf", background: "rgba(26,191,223,0.12)", color: "#fff" }
                : { borderColor: "rgba(255,255,255,0.1)", background: "rgba(15,20,36,0.5)", color: "rgba(255,255,255,0.6)" }
            }
          >
            {i.label}
          </button>
        ))}
      </div>

      {/* active panel */}
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-slate-900/50 p-8 text-center sm:p-10">
        <h3 className="text-xl font-bold text-white sm:text-2xl">{ind.headline}</h3>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-[15px]">{ind.body}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Connects to</span>
          {ind.connects.map((c) => (
            <span key={c} className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs text-slate-300">
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Industries;