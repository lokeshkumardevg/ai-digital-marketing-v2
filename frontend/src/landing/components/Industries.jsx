// src/landing/components/Industries.jsx
// Spec Section 12.1 #7: "Tabs for local business, ecommerce, SaaS, clinics, real
// estate, restaurants."
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  ShoppingBag,
  Cloud,
  Stethoscope,
  Building,
  Utensils,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const INDUSTRIES = [
  {
    id: "local",
    label: "Local Business",
    icon: Store,
    coworkers: "Stella (Presence) + Max (Growth)",
    headline: "Show up first when someone searches nearby",
    body: "Stella keeps your listings accurate across every directory and answers reviews fast, while Max runs local search ads for the service radius you actually serve.",
    benefit: "Higher Google Maps visibility and zero missed neighborhood leads.",
    connects: ["Google Business Profile", "Google Ads", "WhatsApp Cloud API"],
  },
  {
    id: "ecommerce",
    label: "Ecommerce",
    icon: ShoppingBag,
    coworkers: "Max (Growth) + Stella (Presence)",
    headline: "Turn catalog data into ads, automatically",
    body: "Max syncs your product catalog and builds dynamic campaigns around what's actually in stock, while Stella handles post-purchase review generation and Instagram publishing.",
    benefit: "Higher ROAS on winning SKUs without manual creative rebuilding.",
    connects: ["Shopify", "Meta Ads", "Google Shopping", "Klaviyo"],
  },
  {
    id: "saas",
    label: "SaaS & B2B",
    icon: Cloud,
    coworkers: "Max (Growth) + Echo (Experience)",
    headline: "Keep the pipeline full without a bloated growth team",
    body: "Max runs lead qualification and contact segmentation off your CRM data, while Echo turns trial drop-offs and sentiment signals into an actionable executive report.",
    benefit: "Consistent qualified SQLs and real-time competitor intelligence.",
    connects: ["HubSpot", "Salesforce", "Google Search Ads", "Slack"],
  },
  {
    id: "clinics",
    label: "Clinics & Wellness",
    icon: Stethoscope,
    coworkers: "Atlas (Operations) + Stella (Presence)",
    headline: "Never miss a patient call, never lose a slot",
    body: "Atlas answers phone inquiries and WhatsApp messages 24/7, books appointments against your real clinic calendar, and refills cancellations from the waitlist automatically.",
    benefit: "Zero missed appointments and effortless patient recall reminders.",
    connects: ["Calendar APIs", "WhatsApp Cloud API", "Telephony VoIP"],
  },
  {
    id: "real-estate",
    label: "Real Estate",
    icon: Building,
    coworkers: "Max (Growth) + Atlas (Operations)",
    headline: "Follow up on every property inquiry before it goes cold",
    body: "Max qualifies and routes new buyer leads the moment Meta forms submit, and Atlas initiates instant WhatsApp or phone follow-up so no buyer sits unattended.",
    benefit: "< 60s lead response time and automated site visit scheduling.",
    connects: ["Meta Lead Ads", "WhatsApp Cloud API", "Proptech CRM"],
  },
  {
    id: "restaurants",
    label: "Restaurants & Hospitality",
    icon: Utensils,
    coworkers: "Stella (Presence) + Echo (Experience)",
    headline: "Turn great evenings into 5-star Google reviews",
    body: "Stella politely invites diners to share their experience and replies to reviews within minutes, while Echo alerts managers early if sentiment detects service hiccups.",
    benefit: "Rapidly growing review rating and automated reputation protection.",
    connects: ["Google Business Profile", "WhatsApp", "Instagram"],
  },
];

function Industries() {
  const [active, setActive] = useState(0);
  const ind = INDUSTRIES[active];
  const ActiveIcon = ind.icon;

  return (
    <section className="relative mx-auto max-w-[1200px] px-6 py-20 sm:py-28 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-[#1468e8]/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="mb-12 text-center sm:mb-16 relative z-10">
        <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0665ff]/30 bg-[#0665ff]/10 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_8px_#22d3ee] animate-pulse" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#60a5fa]">
            Tailored Solutions
          </span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Built for your kind of business
        </h2>
        <p className="mt-4 max-w-lg mx-auto text-sm sm:text-base text-slate-400">
          Select your industry to see how AI coworkers adapt to your specific workflow and customer journey.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-2.5 relative z-10">
        {INDUSTRIES.map((i, idx) => {
          const Icon = i.icon;
          const isActive = idx === active;
          return (
            <button
              key={i.id}
              type="button"
              onClick={() => setActive(idx)}
              aria-pressed={isActive}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-[#1468e8] to-[#1abfdf] text-white shadow-[0_0_24px_rgba(20,104,232,0.45)] border border-[#22d3ee]"
                  : "bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white hover:border-[#1468e8]/40"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{i.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Showcase Card */}
      <div className="relative z-10 mx-auto max-w-3xl rounded-3xl border border-white/10 bg-gradient-to-b from-[#07122A] to-[#040816] p-8 sm:p-12 shadow-[0_15px_50px_rgba(6,101,255,0.15)] backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1468e8]/20 border border-[#1468e8]/40 text-[#22d3ee]">
              <ActiveIcon className="w-6 h-6" />
            </span>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Industry Track
              </span>
              <h3 className="text-xl font-bold text-white">{ind.label}</h3>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1468e8]/10 border border-[#1468e8]/30 text-xs text-[#60a5fa] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#22d3ee]" />
            <span>{ind.coworkers}</span>
          </div>
        </div>

        <h4 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-snug">
          {ind.headline}
        </h4>

        <p className="text-base text-slate-300 leading-relaxed mb-6">
          {ind.body}
        </p>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-8">
          <span className="text-xs font-semibold text-[#22d3ee] uppercase tracking-wide block mb-1">
            Proven Outcome
          </span>
          <p className="text-sm font-medium text-white">{ind.benefit}</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-1">
              Connects to:
            </span>
            {ind.connects.map((c) => (
              <span
                key={c}
                className="rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-300 font-medium"
              >
                {c}
              </span>
            ))}
          </div>

          <Link
            to="/agent-ecosystem"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#60a5fa] hover:text-[#22d3ee] transition-colors"
          >
            <span>See relevant agents</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Industries;