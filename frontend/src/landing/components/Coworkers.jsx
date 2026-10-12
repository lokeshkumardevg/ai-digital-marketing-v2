// src/landing/components/Coworkers.jsx
// Tabbed "meet your AI coworkers" section.
//  - Top: pill switcher (avatar + name + domain) for Max / Stella / Atlas / Echo
//  - Below: one big hero card for the selected coworker (headline, blurb,
//    "Meet X" pill, mascot with halo, and a row of module cards)
//
// Mascot images live at /public/assets/mascots/<id>.png (same as before).
// Names, domains and modules follow Technical Spec §4 / §6 — keep in sync with
// AgentEcosystem.tsx, CoworkerDetail.jsx and Navbar.jsx.
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Megaphone, Search, Users, Sparkles, Settings,
  Star, MessageCircle, MapPin, Layers, Share2,
  Headphones, Calendar, Bell, Clock, TrendingUp,
  CheckSquare, BarChart3, Ticket, Target,
} from "lucide-react";

const COWORKERS = [
  {
    id: "growth",
    name: "Max",
    domain: "Growth",
    headline: "Max helps every brand",
    accent: "grow",
    blurb: "An AI coworker that orchestrates campaigns, research, lead generation and more.",
    mascot: "/assets/mascots/aarav.png",
    modules: [
      { label: "Ads Campaign", icon: Megaphone },
      { label: "Deep Research", icon: Search },
      { label: "Lead Generation", icon: Users },
      { label: "AI Visibility", icon: Sparkles },
      { label: "Marketing Automation", icon: Settings },
    ],
  },
  {
    id: "presence",
    name: "Stella",
    domain: "Presence",
    headline: "Stella puts every brand",
    accent: "on the map",
    blurb: "An AI coworker that earns reviews, answers them, and keeps every listing and social channel current.",
    mascot: "/assets/mascots/meera.png",
    modules: [
      { label: "Review Generation", icon: Star },
      { label: "Review Response", icon: MessageCircle },
      { label: "Listings Optimization", icon: MapPin },
      { label: "Local Pages", icon: Layers },
      { label: "Social Publishing", icon: Share2 },
    ],
  },
  {
    id: "operations",
    name: "Atlas",
    domain: "Operations",
    headline: "Atlas keeps every business",
    accent: "running",
    blurb: "An AI coworker that handles the front desk, bookings and follow-ups so no customer slips through.",
    mascot: "/assets/mascots/rohan.png",
    modules: [
      { label: "Front Desk", icon: Headphones },
      { label: "Appointments", icon: Calendar },
      { label: "Reminders", icon: Bell },
      { label: "Waitlist & Recall", icon: Clock },
      { label: "Lead Follow-up", icon: TrendingUp },
    ],
  },
  {
    id: "experience",
    name: "Echo",
    domain: "Experience",
    headline: "Echo makes every customer feel",
    accent: "heard",
    blurb: "An AI coworker that listens through surveys and sentiment, then turns feedback into action.",
    mascot: "/assets/mascots/kavi.png",
    modules: [
      { label: "Survey", icon: CheckSquare },
      { label: "Sentiment & Insights", icon: BarChart3 },
      { label: "Ticketing", icon: Ticket },
      { label: "Competitor Analysis", icon: Target },
      { label: "Reporting", icon: BarChart3 },
    ],
  },
];

const INK = "#0f1f3d";
const BLUE = "#1468e8";

function Avatar({ cw, size }) {
  return (
    <span
      className="flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-b from-[#e8f1fb] to-[#cfe0f3]"
      style={{ width: size, height: size }}
    >
      <img
        src={cw.mascot}
        alt=""
        className="h-full w-full object-cover object-top"
        draggable={false}
      />
    </span>
  );
}

function Tabs({ activeId, onSelect }) {
  const refs = useRef({});

  // Arrow-key navigation between tabs (WAI-ARIA tabs pattern)
  const onKeyDown = (e, i) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + COWORKERS.length) % COWORKERS.length;
    onSelect(COWORKERS[next].id);
    refs.current[COWORKERS[next].id]?.focus();
  };

  return (
    <div className="mb-6 flex justify-start overflow-x-auto pb-1 sm:mb-8 sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div
        role="tablist"
        aria-label="AI coworkers"
        className="flex items-center gap-1 rounded-full bg-[#f1efeb] p-1.5"
      >
        {COWORKERS.map((cw, i) => {
          const active = cw.id === activeId;
          return (
            <button
              key={cw.id}
              ref={(el) => (refs.current[cw.id] = el)}
              role="tab"
              id={`cw-tab-${cw.id}`}
              aria-selected={active}
              aria-controls="cw-panel"
              tabIndex={active ? 0 : -1}
              onClick={() => onSelect(cw.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`flex items-center gap-3 rounded-full py-2 pl-2 pr-5 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1468e8] sm:pr-8 ${
                active ? "bg-white shadow-[0_6px_20px_rgba(15,31,61,0.10)]" : "hover:bg-white/50"
              }`}
            >
              <Avatar cw={cw} size={52} />
              <span className="flex flex-col leading-tight">
                <span className="text-[15px] font-medium" style={{ color: INK }}>{cw.name}</span>
                <span className="text-[13px] text-slate-500">{cw.domain}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CoworkerPanel({ cw }) {
  return (
    <div
      id="cw-panel"
      role="tabpanel"
      aria-labelledby={`cw-tab-${cw.id}`}
      className="cw-panel relative rounded-[28px] bg-[#f6f4f1] px-6 pb-6 pt-10 sm:rounded-[40px] sm:px-10 lg:min-h-[560px] lg:px-14 lg:pt-14"
    >
      {/* Halo behind mascot */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[3%] top-[6%] hidden aspect-square w-[44%] max-w-[460px] rounded-full lg:block"
        style={{ background: "radial-gradient(circle at 50% 50%, #e3effb 0%, #eaf3fc 55%, rgba(234,243,252,0) 72%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[9%] top-[22%] hidden aspect-square w-[32%] max-w-[330px] rounded-full bg-[#dfecfa]/60 lg:block"
      />

      {/* Mascot — top pokes slightly above the card, bottom hides behind the module cards */}
      <img
        src={cw.mascot}
        alt={`${cw.name}, the ${cw.domain.toLowerCase()} coworker`}
        draggable={false}
        className="pointer-events-none relative z-0 mx-auto mb-[-60px] block h-[300px] w-auto object-contain object-top sm:h-[360px] lg:absolute lg:-top-5 lg:right-[7%] lg:mx-0 lg:mb-0 lg:h-[500px]"
      />

      {/* Copy */}
      <div className="relative z-10 mt-0 max-w-[620px] lg:mt-6">
        <h2
          className="text-[34px] font-extrabold leading-[1.08] tracking-[-0.025em] sm:text-[46px] lg:text-[60px]"
          style={{ color: INK }}
        >
          {cw.headline}{" "}
          <span className="bg-gradient-to-r from-[#1468e8] to-[#12b4f0] bg-clip-text text-transparent">
            {cw.accent}
          </span>
        </h2>
        <p className="mt-5 max-w-[470px] text-[17px] leading-relaxed text-slate-500 sm:text-[19px]">
          {cw.blurb}
        </p>
        <Link
          to={`/coworkers/${cw.id}`}
          className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-[15px] font-medium shadow-[0_4px_16px_rgba(15,31,61,0.07)] transition-shadow hover:shadow-[0_6px_22px_rgba(20,104,232,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1468e8]"
          style={{ color: INK }}
        >
          Meet {cw.name}
          <ArrowRight size={18} style={{ color: BLUE }} />
        </Link>
      </div>

      {/* Module cards */}
      <ul className="relative z-10 mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-14 lg:grid-cols-5">
        {cw.modules.map(({ label, icon: Icon }) => (
          <li
            key={label}
            className="flex min-h-[130px] flex-col justify-between rounded-[22px] bg-white/85 p-5 shadow-[0_2px_14px_rgba(15,31,61,0.05)] backdrop-blur-[2px] sm:min-h-[150px] sm:p-6 last:odd:col-span-2 sm:last:odd:col-span-1"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e4effd] sm:h-14 sm:w-14">
              <Icon size={26} strokeWidth={1.8} style={{ color: BLUE }} />
            </span>
            <span className="mt-4 text-[16px] font-medium leading-tight sm:text-[18px]" style={{ color: INK }}>
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Coworkers() {
  const [activeId, setActiveId] = useState(COWORKERS[0].id);
  const active = COWORKERS.find((c) => c.id === activeId);

  return (
    <section className="bg-[#fcfbf8] py-16 sm:py-24">
      <style>{`
        @keyframes cwSwap { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .cw-panel { animation: cwSwap .45s ease both; }
        @media (prefers-reduced-motion: reduce) { .cw-panel { animation: none; } }
      `}</style>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <Tabs activeId={activeId} onSelect={setActiveId} />
        {/* key remounts the panel so the swap animation replays on tab change */}
        <CoworkerPanel key={active.id} cw={active} />
      </div>
    </section>
  );
}

export default Coworkers;