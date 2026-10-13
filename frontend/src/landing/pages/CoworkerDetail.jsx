// src/landing/pages/CoworkerDetail.jsx
// Spec Section 12.3: "Coworker pages (one per coworker) — Outcome promise, agents
// and modules, workflow example, integrations, results, CTA. Same template for
// all four." Route: /coworkers/:id (see App.tsx).
//
// Look: dark hero (matches the floating navbar + home hero) with the mascot in a
// glowing circle and its work badges orbiting; then light cream sections that use
// the same cards / blue gradient as the Coworkers section on the home page.
//
// Data here mirrors AgentEcosystem.tsx / Coworkers.jsx / Navbar.jsx — all four
// files keep their own copy of the coworker list. If you add a 5th coworker or
// rename one, update all four.
//
// "results": written as what-to-expect bullets, not invented percentages — no
// coworker here has a real customer result to quote yet. Swap these for real,
// named outcomes once you have them.
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ArrowRight, Check, BarChart3, Plug,
  Megaphone, Search, Users, Filter, Sparkles, Paintbrush, Settings,
  Star, MessageCircle, MapPin, Layers, Share2, Heart, Bot,
  Headphones, Calendar, Bell, Clock, TrendingUp, ShieldCheck, Mic,
  CheckSquare, Ticket, RefreshCw, Target, FileText,
} from "lucide-react";

const INK = "#0f1f3d";
const BLUE = "#1468e8";

// icon + short label for each module (used in the hero orbit and the module list)
const META = {
  "Ads Campaign": [Megaphone, "Ads"],
  "Deep Research": [Search, "Research"],
  "Lead Generation": [Users, "Leads"],
  "Contact Segmentation": [Filter, "Segments"],
  "AI Visibility": [Sparkles, "AI Visibility"],
  "Template Design": [Paintbrush, "Templates"],
  "Marketing Automation": [Settings, "Automation"],
  "Review Generation": [Star, "Get Reviews"],
  "Review Response": [MessageCircle, "Replies"],
  "Listings Optimization": [MapPin, "Listings"],
  "Local Pages": [Layers, "Local Pages"],
  "Social Publishing": [Share2, "Social"],
  "Social Engagement": [Heart, "Engagement"],
  "Chatbot": [Bot, "Chatbot"],
  "Front Desk": [Headphones, "Front Desk"],
  "Appointments": [Calendar, "Bookings"],
  "Reminders": [Bell, "Reminders"],
  "Waitlist & Recall": [Clock, "Waitlist"],
  "Lead Follow-up": [TrendingUp, "Follow-up"],
  "Insurance Verification": [ShieldCheck, "Insurance"],
  "Multi-Modal: Voice, Email, Text": [Mic, "Multi-Modal"],
  "Survey": [CheckSquare, "Surveys"],
  "Sentiment & Insights": [BarChart3, "Insights"],
  "Ticketing": [Ticket, "Tickets"],
  "Follow-up": [RefreshCw, "Follow-up"],
  "Competitor Analysis": [Target, "Competitors"],
  "Reporting": [FileText, "Reports"],
};
const metaOf = (name) => META[name] || [Sparkles, name];

const DATA = {
  growth: {
    name: "Max",
    headline: "Max helps every brand",
    headAccent: "grow",
    role: "Growth Coworker",
    accent: "#a855f7",
    mascot: "/assets/mascots/aarav_HD.png",
    domain: "Ads, research, leads and audiences",
    outcome: "Max plans, launches and tunes your ad spend, finds new leads, and keeps your audiences fresh — so your pipeline doesn't depend on one person remembering to check it.",
    metric: "Measured by ROAS, cost per lead, and AI visibility score.",
    modules: [
      { name: "Ads Campaign", body: "Drafts, launches and optimizes Meta & Google Ads campaigns against your budget." },
      { name: "Deep Research", body: "Reads your site, competitors and audience data to find winning angles." },
      { name: "Lead Generation", body: "Qualifies and routes new leads from forms and ad campaigns." },
      { name: "Contact Segmentation", body: "Builds and refreshes audiences from customer behavior." },
      { name: "AI Visibility", body: "Checks how you show up in AI search & assistants, and recommends fixes." },
      { name: "Template Design", body: "Designs ad, email and landing-page templates in your brand style." },
      { name: "Marketing Automation", body: "Runs follow-up journeys across email, WhatsApp and SMS, triggered by customer behavior." },
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
    headline: "Stella puts every brand",
    headAccent: "on the map",
    role: "Presence Coworker",
    accent: "#f59e0b",
    mascot: "/assets/mascots/meera_HD.png",
    domain: "Reviews, listings, social and local pages",
    outcome: "Stella keeps every review answered, every listing accurate, and every post on-brand — across as many locations as you have.",
    metric: "Measured by review volume and rating, listing accuracy, and engagement.",
    modules: [
      { name: "Review Generation", body: "Asks every customer for a review — no sentiment filtering, no gating." },
      { name: "Review Response", body: "Drafts a reply in your brand voice and publishes once approved." },
      { name: "Listings Optimization", body: "Keeps name, address, phone and hours consistent across directories." },
      { name: "Local Pages", body: "Generates and publishes a local SEO page for each new location." },
      { name: "Social Publishing", body: "Creates and schedules posts per location, on the platforms and times that fit." },
      { name: "Social Engagement", body: "Replies to comments, DMs and mentions, and passes warm leads to your team." },
      { name: "Chatbot", body: "Answers visitor questions on your site and listings, captures leads, and hands off to a person when needed." },
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
    headline: "Atlas keeps every business",
    headAccent: "running",
    role: "Operations Coworker",
    accent: "#2f8f5b",
    mascot: "/assets/mascots/rohan_HD.png",
    domain: "Front desk, bookings and follow-up",
    outcome: "Atlas answers calls and messages, books appointments, and follows up with leads — so a missed call doesn't mean a missed customer.",
    metric: "Measured by missed-call rate, bookings, and no-show rate.",
    modules: [
      { name: "Front Desk", body: "Answers calls, WhatsApp and chat, understands intent, hands off when needed." },
      { name: "Appointments", body: "Checks availability and books, confirming with the customer." },
      { name: "Reminders", body: "Sends reminders ahead of a visit, and handles reschedule replies." },
      { name: "Waitlist & Recall", body: "Fills a cancelled slot, and reminds past customers to come back." },
      { name: "Lead Follow-up", body: "Calls or messages a new lead and books them in, or updates the CRM." },
      { name: "Insurance Verification", body: "Checks a customer's insurance details before the visit and flags anything that needs fixing." },
      { name: "Multi-Modal: Voice, Email, Text", body: "Keeps one conversation going across calls, email and text, so a customer never has to repeat themselves." },
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
    headline: "Echo makes every customer feel",
    headAccent: "heard",
    role: "Experience Coworker",
    accent: "#e23b3b",
    mascot: "/assets/mascots/kavi_HD.png",
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


// Mascot in a glowing circle, work badges orbiting it (same idea as the home section).
function HeroStage({ cw }) {
  const orbit = cw.modules.slice(0, 5);
  const n = orbit.length;
  return (
    <div className="cwd-stage relative z-0 mx-auto flex-shrink-0">
      <div
        aria-hidden="true"
        className="absolute inset-[6%] rounded-full ring-1 ring-white/10"
        style={{ background: "radial-gradient(circle at 50% 40%, rgba(90,160,255,0.38) 0%, rgba(20,104,232,0.16) 55%, rgba(20,104,232,0.04) 100%)" }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2]">
        <div className="cwd-ring-a absolute inset-[-3%] rounded-full border border-dashed border-white/20" />
        <div className="cwd-ring-b absolute inset-[-14%] rounded-full border border-dotted border-white/10" />
        <div className="cwd-spin absolute inset-0">
          {orbit.map((m, i) => {
            const [Icon, short] = metaOf(m.name);
            const a = (360 / n) * i - 90;
            return (
              <div key={m.name} className="absolute left-1/2 top-1/2" style={{ transform: `rotate(${a}deg) translateX(var(--r))` }}>
                <div style={{ transform: `rotate(${-a}deg)` }}>
                  <div
                    className="cwd-counter flex flex-col items-center justify-center gap-1 rounded-[14px] bg-white shadow-[0_10px_28px_rgba(0,0,0,0.35)] sm:rounded-[18px]"
                    style={{ width: "var(--b)", height: "var(--b)", marginLeft: "calc(var(--b) / -2)", marginTop: "calc(var(--b) / -2)" }}
                  >
                    <Icon className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]" strokeWidth={1.9} style={{ color: BLUE }} />
                    <span className="hidden px-0.5 text-center text-[9.5px] font-medium leading-none sm:block" style={{ color: INK }}>{short}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <span className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-[#4da3ff]" style={{ transform: "rotate(-30deg) translateX(calc(var(--r) * 0.62))" }} />
          <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-white/60" style={{ transform: "rotate(150deg) translateX(calc(var(--r) * 1.12))" }} />
        </div>
      </div>
      <img
        src={cw.mascot}
        alt={`${cw.name}, the ${cw.role}`}
        draggable={false}
        className="pointer-events-none absolute bottom-[9%] left-1/2 z-[3] h-[80%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
      />
    </div>
  );
}

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

  const others = Object.entries(DATA).filter(([key]) => key !== id);

  return (
    <div className="min-h-screen bg-[#fcfbf8]" style={{ overflowX: "clip" }}>
      <style>{`
        @keyframes cwdSpin { to { transform: rotate(360deg); } }
        @keyframes cwdSpinRev { to { transform: rotate(-360deg); } }
        .cwd-stage { --m: clamp(220px, 66vw, 280px); --r: calc(var(--m) * 0.47); --b: 38px; width: var(--m); height: var(--m); }
        @media (min-width: 640px)  { .cwd-stage { --m: 340px; --r: 160px; --b: 62px; } }
        @media (min-width: 1024px) { .cwd-stage { --m: 400px; --r: 190px; --b: 70px; } }
        @media (min-width: 1280px) { .cwd-stage { --m: 460px; --r: 220px; --b: 76px; } }
        @media (min-width: 1024px) { .cwd-steps { grid-template-columns: repeat(var(--n), minmax(0, 1fr)); } }
        .cwd-spin { animation: cwdSpin 48s linear infinite; }
        .cwd-counter { animation: cwdSpinRev 48s linear infinite; }
        .cwd-ring-a { animation: cwdSpinRev 90s linear infinite; }
        .cwd-ring-b { animation: cwdSpin 120s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .cwd-spin, .cwd-counter, .cwd-ring-a, .cwd-ring-b { animation: none; } }
      `}</style>

      <Navbar />

      {/* ───────── Hero (dark, matches navbar) ───────── */}
      <section className="relative overflow-hidden rounded-b-[36px] bg-[#060a16] sm:rounded-b-[56px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 70% at 78% 45%, rgba(20,104,232,0.28) 0%, rgba(6,10,22,0) 70%), radial-gradient(40% 50% at 8% 90%, rgba(26,191,223,0.12) 0%, rgba(6,10,22,0) 70%)" }} />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-8 px-4 pb-14 pt-28 sm:px-6 sm:pb-20 sm:pt-36 lg:grid-cols-[1fr_auto] lg:gap-12">
          <div className="order-last text-center lg:order-first lg:text-left">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-medium text-white/80 ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4da3ff]" />
              {cw.role} · {cw.domain}
            </p>
            <h1 className="mt-5 text-[34px] font-extrabold leading-[1.08] tracking-[-0.025em] text-white sm:text-[48px] xl:text-[60px]">
              {cw.headline}{" "}
              <span className="bg-gradient-to-r from-[#4da3ff] to-[#1abfdf] bg-clip-text text-transparent">{cw.headAccent}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-relaxed text-slate-300 sm:text-[18px] lg:mx-0">{cw.outcome}</p>

            <p className="mx-auto mt-5 inline-flex max-w-full items-start gap-2 rounded-2xl bg-white/5 px-4 py-2.5 text-left text-[13px] leading-snug text-slate-300 ring-1 ring-white/10 lg:mx-0">
              <BarChart3 size={16} className="mt-px flex-shrink-0 text-[#4da3ff]" />
              {cw.metric}
            </p>
            {cw.note && (
              <p className="mx-auto mt-3 max-w-[560px] rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-left text-[12.5px] leading-snug text-amber-200 lg:mx-0">
                {cw.note}
              </p>
            )}

            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1468e8] to-[#1abfdf] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_28px_rgba(20,104,232,0.4)] transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                Start free trial <ArrowRight size={17} />
              </Link>
              <Link to="/agent-ecosystem" className="inline-flex items-center justify-center rounded-full bg-white/10 px-7 py-3.5 text-[15px] font-medium text-white ring-1 ring-white/15 transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                See all agents
              </Link>
            </div>
          </div>

          <HeroStage cw={cw} />
        </div>
      </section>

      {/* ───────── What X does ───────── */}
      <section className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 sm:py-24">
        <div className="grid gap-6 lg:grid-cols-[340px_1fr] lg:gap-8">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1468e8] to-[#1abfdf] p-7 text-white sm:p-8">
              <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10" />
              <span className="relative block h-16 w-16 overflow-hidden rounded-full bg-white/20 ring-2 ring-white/60">
                <img src={cw.mascot} alt="" draggable={false} className="h-full w-full object-cover object-top" />
              </span>
              <h2 className="relative mt-5 text-[28px] font-extrabold leading-tight tracking-tight sm:text-[32px]">What {cw.name} does</h2>
              <p className="relative mt-3 text-[15px] leading-relaxed text-white/85">{cw.domain}.</p>
              <Link to="/register" className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold transition-shadow hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80" style={{ color: INK }}>
                Try {cw.name} <ArrowRight size={16} style={{ color: BLUE }} />
              </Link>
            </div>
          </aside>

          <ul className="overflow-hidden rounded-[32px] bg-white shadow-[0_2px_24px_rgba(15,31,61,0.06)] ring-1 ring-black/5">
            {cw.modules.map((m) => {
              const [Icon] = metaOf(m.name);
              return (
                <li key={m.name} className="flex items-start gap-4 border-b border-slate-100 p-5 transition-colors last:border-b-0 hover:bg-[#f6f9ff] sm:gap-5 sm:p-7">
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#e4effd] sm:h-14 sm:w-14">
                    <Icon className="h-[22px] w-[22px] sm:h-[26px] sm:w-[26px]" strokeWidth={1.8} style={{ color: BLUE }} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[17px] font-semibold leading-snug sm:text-[19px]" style={{ color: INK }}>{m.name}</h3>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-slate-500 sm:text-[15.5px]">{m.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ───────── A typical run ───────── */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="rounded-[32px] bg-[#f6f4f1] px-5 py-10 sm:rounded-[40px] sm:px-10 sm:py-14">
          <h2 className="text-center text-[28px] font-extrabold tracking-tight sm:text-[36px]" style={{ color: INK }}>A typical run</h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[15px] text-slate-500 sm:text-[17px]">
            How {cw.name} takes a job from trigger to done.
          </p>

          <div className="relative mt-10 sm:mt-12">
            {/* connector line (desktop) */}
            <div
              aria-hidden="true"
              className="absolute top-[27px] hidden border-t border-dashed border-[#9cc3f2] lg:block"
              style={{ left: `${50 / cw.workflow.length}%`, right: `${50 / cw.workflow.length}%` }}
            />
            <ol className="cwd-steps relative grid gap-6 lg:gap-5" style={{ "--n": cw.workflow.length }}>
              {cw.workflow.map((step, i) => (
                <li
                  key={i}
                  className="relative flex gap-4 after:absolute after:bottom-[-24px] after:left-[26px] after:top-[54px] after:w-px after:bg-[#bcd6f5] last:after:hidden lg:flex-col lg:gap-5 lg:text-center lg:after:hidden"
                >
                  <span className="relative z-10 flex h-[54px] w-[54px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1468e8] to-[#1abfdf] text-[18px] font-bold text-white shadow-[0_8px_20px_rgba(20,104,232,0.3)] lg:mx-auto">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-[15px] leading-relaxed text-slate-600 sm:text-[16px] lg:pt-0">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ───────── Works with ───────── */}
      <section className="mx-auto max-w-[1000px] px-4 py-14 text-center sm:px-6 sm:py-20">
        <h2 className="text-[26px] font-extrabold tracking-tight sm:text-[32px]" style={{ color: INK }}>Works with the tools you already use</h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {cw.integrations.map((name) => (
            <span key={name} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13.5px] font-medium shadow-[0_2px_14px_rgba(15,31,61,0.06)] ring-1 ring-black/5 sm:px-5 sm:text-sm" style={{ color: INK }}>
              <Plug size={15} style={{ color: BLUE }} />
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ───────── What to expect ───────── */}
      <section className="mx-auto max-w-[1200px] px-4 pb-14 sm:px-6 sm:pb-24">
        <h2 className="text-center text-[28px] font-extrabold tracking-tight sm:text-[36px]" style={{ color: INK }}>What to expect</h2>
        <ul className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-3 md:gap-5">
          {cw.results.map((r) => (
            <li key={r} className="rounded-[28px] bg-white p-6 shadow-[0_2px_24px_rgba(15,31,61,0.06)] ring-1 ring-black/5 sm:p-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e4effd]">
                <Check size={20} strokeWidth={2.4} style={{ color: BLUE }} />
              </span>
              <p className="mt-4 text-[15.5px] leading-relaxed text-slate-600 sm:text-[16.5px]">{r}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────── Rest of the team ───────── */}
      <section className="mx-auto max-w-[1200px] px-4 pb-14 sm:px-6 sm:pb-20">
        <h2 className="text-center text-[24px] font-extrabold tracking-tight sm:text-[30px]" style={{ color: INK }}>Meet the rest of the team</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
          {others.map(([key, o]) => (
            <Link
              key={key}
              to={`/coworkers/${key}`}
              className="group flex items-center gap-4 rounded-[24px] bg-white p-4 shadow-[0_2px_18px_rgba(15,31,61,0.06)] ring-1 ring-black/5 transition-shadow hover:shadow-[0_8px_30px_rgba(20,104,232,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1468e8]"
            >
              <span className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-b from-[#e8f1fb] to-[#cfe0f3]">
                <img src={o.mascot} alt="" draggable={false} className="h-full w-full object-cover object-top" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] font-semibold" style={{ color: INK }}>{o.name}</span>
                <span className="block truncate text-[13.5px] text-slate-500">{o.domain}</span>
              </span>
              <ArrowRight size={18} className="flex-shrink-0 transition-transform group-hover:translate-x-1" style={{ color: BLUE }} />
            </Link>
          ))}
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1468e8] to-[#1abfdf] px-6 py-12 text-center sm:rounded-[40px] sm:px-14 sm:py-16 md:text-left">
          <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-white/10" />
          <img
            src={cw.mascot}
            alt=""
            draggable={false}
            className="pointer-events-none absolute -bottom-6 right-6 hidden h-[115%] w-auto max-w-none object-contain object-bottom md:block lg:right-14"
          />
          <div className="relative max-w-[560px]">
            <h2 className="text-[28px] font-extrabold leading-tight tracking-tight text-white sm:text-[38px]">
              Try {cw.name} free for 3 days
            </h2>
            <p className="mt-3 text-[16px] leading-relaxed text-white/85">{cw.outcome}</p>
            <Link to="/register" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-shadow hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80" style={{ color: INK }}>
              Start free trial <ArrowRight size={17} style={{ color: BLUE }} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default CoworkerDetail;