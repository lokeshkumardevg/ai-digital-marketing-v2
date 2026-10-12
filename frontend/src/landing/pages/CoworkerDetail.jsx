// src/landing/pages/CoworkerDetail.jsx
// Spec Section 12.3: "Coworker pages (one per coworker) — Outcome promise, agents
// and modules, workflow example, integrations, results, CTA. Same template for
// all four." Route: /coworkers/:id (see App.tsx).
//
// Data here mirrors AgentEcosystem.tsx / Coworkers.jsx / Navbar.jsx — all four
// files currently keep their own copy of the coworker list (same pattern the
// codebase already used before this page existed). If you add a 5th coworker or
// rename one, update all four.
//
// "results": written as what-to-expect bullets, not invented percentages — no
// coworker here has a real customer result to quote yet. Swap these for real,
// named outcomes once you have them.
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const DATA = {
  growth: {
    name: "Max",
    role: "Growth Coworker",
    accent: "#a855f7",
    mascot: "/assets/mascots/aarav.png",
    domain: "Ads, research, leads and audiences",
    outcome: "Max plans, launches and tunes your ad spend, finds new leads, and keeps your audiences fresh — so your pipeline doesn't depend on one person remembering to check it.",
    metric: "Measured by ROAS, cost per lead, and AI visibility score.",
    modules: [
      { name: "Ads Campaign", body: "Drafts, launches and optimizes Meta & Google Ads campaigns against your budget." },
      { name: "Deep Research", body: "Reads your site, competitors and audience data to find winning angles." },
      { name: "Lead Generation", body: "Qualifies and routes new leads from forms and ad campaigns." },
      { name: "Contact Segmentation", body: "Builds and refreshes audiences from customer behavior." },
      { name: "AI Visibility", body: "Checks how you show up in AI search & assistants, and recommends fixes." },
    ],
    workflow: [
      "A campaign brief comes in (or a schedule triggers a refresh).",
      "Max pulls brand profile, budget and past performance.",
      "A draft campaign — audience, budget, creative — is prepared.",
      "You approve launch and budget changes before anything spends.",
      "Performance is monitored and bids are adjusted automatically within approved limits.",
    ],
    integrations: ["Meta Marketing API", "Google Ads API", "CRM", "Web & search APIs"],
    results: [
      "One place to see every campaign across platforms, instead of logging into each ad manager separately.",
      "Nothing launches or changes budget without your sign-off.",
      "A standing view of how AI search tools describe your business.",
    ],
  },
  presence: {
    name: "Stella",
    role: "Presence Coworker",
    accent: "#f59e0b",
    mascot: "/assets/mascots/meera.png",
    domain: "Reviews, listings, social and local pages",
    outcome: "Stella keeps every review answered, every listing accurate, and every post on-brand — across as many locations as you have.",
    metric: "Measured by review volume and rating, listing accuracy, and engagement.",
    modules: [
      { name: "Review Generation", body: "Asks every customer for a review — no sentiment filtering, no gating." },
      { name: "Review Response", body: "Drafts a reply in your brand voice and publishes once approved." },
      { name: "Listings Optimization", body: "Keeps name, address, phone and hours consistent across directories." },
      { name: "Local Pages", body: "Generates and publishes a local SEO page for each new location." },
      { name: "Social Publishing & Engagement", body: "Schedules posts per location and replies to comments and mentions." },
    ],
    workflow: [
      "A new review comes in from Google or another platform.",
      "Stella drafts a reply using your brand voice and the review's content.",
      "The draft waits in your Approvals inbox.",
      "Once approved, it publishes — and the run is logged.",
    ],
    integrations: ["Google Business Profile API", "Meta Graph API", "LinkedIn", "Directory APIs"],
    results: [
      "No review sits unanswered because no one remembered to check.",
      "Listing details stay consistent even as locations change hours or contact info.",
      "Every reply reads like your brand, not a generic bot.",
    ],
  },
  operations: {
    name: "Atlas",
    role: "Operations Coworker",
    accent: "#2f8f5b",
    mascot: "/assets/mascots/rohan.png",
    domain: "Front desk, bookings and follow-up",
    outcome: "Atlas answers calls and messages, books appointments, and follows up with leads — so a missed call doesn't mean a missed customer.",
    metric: "Measured by missed-call rate, bookings, and no-show rate.",
    modules: [
      { name: "Front Desk", body: "Answers calls, WhatsApp and chat, understands intent, hands off when needed." },
      { name: "Appointments", body: "Checks availability and books, confirming with the customer." },
      { name: "Reminders", body: "Sends reminders ahead of a visit, and handles reschedule replies." },
      { name: "Waitlist & Recall", body: "Fills a cancelled slot, and reminds past customers to come back." },
      { name: "Lead Follow-up", body: "Calls or messages a new lead and books them in, or updates the CRM." },
    ],
    workflow: [
      "A call, WhatsApp message or chat comes in.",
      "Atlas understands intent — booking, question, or complaint — and responds.",
      "For a booking, it checks the calendar and reserves the slot.",
      "A confirmation goes out, with a reminder scheduled ahead of the visit.",
    ],
    integrations: ["WhatsApp Cloud API", "Telephony & STT/TTS", "Calendar APIs", "CRM"],
    results: [
      "Calls and messages get a response outside business hours too.",
      "Fewer no-shows, because reminders go out automatically.",
      "A cancelled slot doesn't just sit empty.",
    ],
    note: "Atlas's agents are on the roadmap — none are live yet. This page describes what they're built to do once shipped.",
  },
  experience: {
    name: "Echo",
    role: "Experience Coworker",
    accent: "#e23b3b",
    mascot: "/assets/mascots/kavi.png",
    domain: "Feedback, insights and reporting",
    outcome: "Echo closes the loop on feedback — surveys go out, sentiment gets scored, and anything that needs attention becomes a ticket, not a lost thread.",
    metric: "Measured by response time, resolution rate, and CSAT.",
    modules: [
      { name: "Survey", body: "Sends a survey after service, and collects responses without gating by sentiment." },
      { name: "Sentiment & Insights", body: "Scores feedback and reviews, and surfaces recurring themes." },
      { name: "Ticketing", body: "Opens an internal task for negative feedback and notifies the right owner." },
      { name: "Follow-up", body: "Messages the customer once their issue is resolved." },
      { name: "Competitor Analysis", body: "Benchmarks your public reviews and listings against competitors." },
      { name: "Reporting", body: "Turns all of the above into a dashboard and a weekly summary." },
    ],
    workflow: [
      "New feedback or a review comes in.",
      "Echo scores sentiment and checks it against your rules.",
      "If it's negative, a ticket opens and the owner is notified.",
      "Once resolved, Echo follows up with the customer and closes the loop.",
    ],
    integrations: ["Slack / Jira / CRM", "Messaging & forms", "Web & Google (for competitor data)"],
    results: [
      "Negative feedback becomes a tracked task instead of an unread message.",
      "One weekly summary instead of piecing together data from five tools.",
      "A standing view of how you compare to competitors' public reviews.",
    ],
    note: "Reporting is already live today (see Agents); the rest of Echo's agents are on the roadmap.",
  },
};

function CoworkerDetail() {
  const { id } = useParams();
  const cw = DATA[id];

  if (!cw) {
    return (
      <div className="min-h-screen bg-[#05070f] text-white">
        <Navbar />
        <div className="mx-auto max-w-xl px-6 py-32 text-center">
          <h1 className="text-2xl font-bold">We couldn't find that coworker.</h1>
          <Link to="/agent-ecosystem" className="mt-4 inline-block text-cyan-300 hover:underline">
            See all coworkers &amp; agents →
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070f]">
      <Navbar />

      {/* Hero */}
      <section className="relative mx-auto max-w-[900px] px-6 pb-14 pt-28 text-center sm:pt-32">
        <img
          src={cw.mascot}
          alt={`${cw.name}, the ${cw.role}`}
          className="mx-auto h-36 w-auto object-contain"
        />
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{cw.name}</h1>
        <p className="mt-1 text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">{cw.role} · {cw.domain}</p>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300">{cw.outcome}</p>
        <p className="mt-3 text-xs font-medium text-slate-500">{cw.metric}</p>
        {cw.note && (
          <p className="mx-auto mt-4 max-w-md rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-medium text-amber-300">
            {cw.note}
          </p>
        )}
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link to="/register" className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1468e8] to-[#1abfdf] px-6 py-3 text-sm font-semibold text-white hover:opacity-90">
            Start free trial <ArrowRight size={15} />
          </Link>
          <Link to="/agent-ecosystem" className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/5">
            See all agents
          </Link>
        </div>
      </section>

      {/* Modules */}
      <section className="mx-auto max-w-[1000px] px-6 py-12">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">What {cw.name} does</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cw.modules.map((m) => (
            <div key={m.name} className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
              <h3 className="text-base font-bold text-white">{m.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow example */}
      <section className="mx-auto max-w-[800px] px-6 py-12">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">A typical run</h2>
        <ol className="flex flex-col gap-4">
          {cw.workflow.map((step, i) => (
            <li key={i} className="flex items-start gap-4 rounded-xl border border-white/10 bg-slate-900/40 p-4">
              <span
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: cw.accent }}
              >
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-slate-300">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Integrations */}
      <section className="mx-auto max-w-[800px] px-6 py-12 text-center">
        <h2 className="mb-6 text-2xl font-bold text-white">Works with</h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {cw.integrations.map((i) => (
            <span key={i} className="rounded-full border border-white/10 bg-slate-900/50 px-4 py-2 text-xs font-medium text-slate-300">
              {i}
            </span>
          ))}
        </div>
      </section>

      {/* Results / what to expect */}
      <section className="mx-auto max-w-[800px] px-6 py-12">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">What to expect</h2>
        <ul className="flex flex-col gap-3">
          {cw.results.map((r) => (
            <li key={r} className="flex items-start gap-3 text-sm leading-relaxed text-slate-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
              {r}
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[700px] px-6 pb-24 pt-8 text-center">
        <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1468e8] to-[#1abfdf] px-7 py-3.5 text-sm font-semibold text-white hover:opacity-90">
          Try {cw.name} free for 3 days <ArrowRight size={15} />
        </Link>
      </section>

      <Footer />
    </div>
  );
}

export default CoworkerDetail;