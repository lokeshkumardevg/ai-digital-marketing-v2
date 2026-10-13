// src/landing/components/Coworkers.jsx
// Tabbed "meet your AI coworkers" section — fully responsive.
//  - Top: pill switcher (avatar + name + domain) with a sliding active pill
//  - Below: one big hero card for the selected coworker (headline, blurb,
//    "Meet X" pill, mascot in a halo with orbiting work badges, module cards)
//
// Responsive plan
//   < 640px   : stacked + centered. Tabs fit on one row (inactive tabs = avatar only).
//               Mascot circle ~250px with small icon-only orbit badges. Module cards 2-up.
//   640–1023  : stacked + centered. Bigger circle, orbit badges get labels. Module cards 3-up.
//   1024–1279 : two-column hero (text left, circle right, 400px). Module cards 5-up.
//   >= 1280   : two-column hero, 540px circle, 60px headline.
//
// Mascot images live at /public/assets/mascots/.
// Names, domains and modules follow Technical Spec §4 / §6 — keep in sync with
// AgentEcosystem.tsx, CoworkerDetail.jsx and Navbar.jsx.
import { useState, useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Megaphone, Search, Users, Sparkles, Settings,
  Star, MessageCircle, MapPin, Layers, Share2,
  Headphones, Calendar, Bell, Clock, TrendingUp,
  CheckSquare, BarChart3, Ticket, Target, FileText,
} from "lucide-react";

const COWORKERS = [
  {
    id: "growth",
    name: "Max",
    domain: "Growth",
    headline: " helps every brand",
    accent: "grow",
    blurb: "An AI coworker that orchestrates campaigns, research, lead generation and more.",
    mascot: "/assets/mascots/aarav_HD.png",
    modules: [
      { label: "Ads Campaign", short: "Ads", icon: Megaphone },
      { label: "Deep Research", short: "Research", icon: Search },
      { label: "Lead Generation", short: "Leads", icon: Users },
      { label: "AI Visibility", short: "AI Visibility", icon: Sparkles },
      { label: "Marketing Automation", short: "Automation", icon: Settings },
    ],
  },
  {
    id: "presence",
    name: "Stella",
    domain: "Presence",
    headline: " puts every brand",
    accent: "on the map",
    blurb: "An AI coworker that earns reviews, answers them, and keeps every listing and social channel current.",
    mascot: "/assets/mascots/meera_HD.png",
    modules: [
      { label: "Review Generation", short: "Get Reviews", icon: Star },
      { label: "Review Response", short: "Replies", icon: MessageCircle },
      { label: "Listings Optimization", short: "Listings", icon: MapPin },
      { label: "Local Pages", short: "Local Pages", icon: Layers },
      { label: "Social Publishing", short: "Social", icon: Share2 },
    ],
  },
  {
    id: "operations",
    name: "Atlas",
    domain: "Operations",
    headline: " keeps every business",
    accent: "running",
    blurb: "An AI coworker that handles the front desk, bookings and follow-ups so no customer slips through.",
    mascot: "/assets/mascots/rohan_HD.png",
    modules: [
      { label: "Front Desk", short: "Front Desk", icon: Headphones },
      { label: "Appointments", short: "Bookings", icon: Calendar },
      { label: "Reminders", short: "Reminders", icon: Bell },
      { label: "Waitlist & Recall", short: "Waitlist", icon: Clock },
      { label: "Lead Follow-up", short: "Follow-up", icon: TrendingUp },
    ],
  },
  {
    id: "experience",
    name: "Echo",
    domain: "Experience",
    headline: " makes every customer feel",
    accent: "heard",
    blurb: "An AI coworker that listens through surveys and sentiment, then turns feedback into action.",
    mascot: "/assets/mascots/kavi_HD.png",
    modules: [
      { label: "Survey", short: "Surveys", icon: CheckSquare },
      { label: "Sentiment & Insights", short: "Insights", icon: BarChart3 },
      { label: "Ticketing", short: "Tickets", icon: Ticket },
      { label: "Competitor Analysis", short: "Competitors", icon: Target },
      { label: "Reporting", short: "Reports", icon: FileText },
    ],
  },
];

// This section shows only each coworker's TOP 5 modules.
// The full list lives in Navbar.jsx (COWORKER_NAV) and CoworkerDetail.jsx (DATA).
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
  const listRef = useRef(null);
  // Sliding white pill: position/size of the active tab, measured from the DOM
  const [pill, setPill] = useState(null);
  const [animate, setAnimate] = useState(false); // no slide on the very first paint

  const measure = () => {
    const el = refs.current[activeId];
    if (!el) return;
    setPill({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight });
  };

  useLayoutEffect(() => {
    measure();
    // keep the active tab visible if the bar ever scrolls sideways (very narrow phones)
    if (animate) {
      refs.current[activeId]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
    setAnimate(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Re-measure on resize / font load so the pill never drifts
  useLayoutEffect(() => {
    const ro = new ResizeObserver(measure);
    if (listRef.current) ro.observe(listRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Arrow-key navigation between tabs (WAI-ARIA tabs pattern)
  const onKeyDown = (e, i) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + COWORKERS.length) % COWORKERS.length;
    onSelect(COWORKERS[next].id);
    refs.current[COWORKERS[next].id]?.focus();
  };

  return (
    // outer scrolls if it must; inner uses mx-auto so it centers when it fits and never clips when it doesn't
    <div className="mb-6 flex overflow-x-auto pb-1 sm:mb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div
        ref={listRef}
        role="tablist"
        aria-label="AI coworkers"
        className="relative mx-auto flex flex-shrink-0 items-center gap-1 rounded-full bg-[#f1efeb] p-1 sm:p-1.5"
      >
        {/* the sliding active pill */}
        {pill && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 rounded-full bg-white shadow-[0_6px_20px_rgba(15,31,61,0.10)] motion-reduce:transition-none"
            style={{
              width: pill.width,
              height: pill.height,
              transform: `translate(${pill.left}px, ${pill.top}px)`,
              transition: animate
                ? "transform 450ms cubic-bezier(0.22, 1, 0.36, 1), width 450ms cubic-bezier(0.22, 1, 0.36, 1)"
                : "none",
            }}
          />
        )}

        {COWORKERS.map((cw, i) => {
          const active = cw.id === activeId;
          return (
            <button
              key={cw.id}
              ref={(el) => (refs.current[cw.id] = el)}
              role="tab"
              id={`cw-tab-${cw.id}`}
              aria-label={`${cw.name}, ${cw.domain}`}
              aria-selected={active}
              aria-controls="cw-panel"
              tabIndex={active ? 0 : -1}
              onClick={() => onSelect(cw.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              // phones: inactive tabs collapse to just the avatar so all four fit on one row
              className={`relative z-[1] flex items-center gap-2 rounded-full py-1.5 pl-1.5 text-left transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1468e8] sm:gap-3 sm:py-2 sm:pl-2 sm:pr-8 ${
                active ? "pr-4" : "pr-1.5 hover:bg-white/50"
              }`}
            >
              <Avatar cw={cw} size={42} />
              <span className={`${active ? "flex" : "hidden sm:flex"} flex-col leading-tight`}>
                <span className="text-[14px] font-medium sm:text-[15px]" style={{ color: INK }}>{cw.name}</span>
                <span className="text-[12px] text-slate-500 sm:text-[13px]">{cw.domain}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Floating work badges that slowly orbit the mascot (all screen sizes).
// Group rotates; each badge counter-rotates so icon + label stay upright.
// Sizes come from CSS vars set per breakpoint on .cw-stage: --r (orbit radius), --b (badge size).
// On phones the badges are icon-only; labels appear from 640px up.
function Orbit({ modules }) {
  const n = modules.length;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      {/* dotted rings */}
      <div className="cw-ring-a absolute inset-[6%] rounded-full border border-dashed border-[#9cc3f2]/70" />
      <div className="cw-ring-b absolute inset-[-2%] rounded-full border border-dotted border-[#bcd6f5]" />

      {/* rotating group: badges + small dots */}
      <div className="cw-spin absolute inset-0">
        {modules.map(({ short, label, icon: Icon }, i) => {
          const a = (360 / n) * i - 90;
          return (
            <div
              key={label}
              className="absolute left-1/2 top-1/2"
              style={{ transform: `rotate(${a}deg) translateX(var(--r))` }}
            >
              <div style={{ transform: `rotate(${-a}deg)` }}>
                <div
                  className="cw-counter flex flex-col items-center justify-center gap-1 rounded-[14px] bg-white shadow-[0_8px_22px_rgba(20,104,232,0.16)] sm:rounded-[18px] xl:rounded-[20px]"
                  style={{ width: "var(--b)", height: "var(--b)", marginLeft: "calc(var(--b) / -2)", marginTop: "calc(var(--b) / -2)" }}
                >
                  <Icon className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px] xl:h-[26px] xl:w-[26px]" strokeWidth={1.9} style={{ color: BLUE }} />
                  <span className="hidden px-0.5 text-center text-[9.5px] font-medium leading-none sm:block xl:text-[10.5px]" style={{ color: INK }}>
                    {short}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <span className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-[#1468e8] sm:h-2.5 sm:w-2.5" style={{ transform: "rotate(-30deg) translateX(calc(var(--r) * 0.62)) " }} />
        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-[#7db4f5] sm:h-2 sm:w-2" style={{ transform: "rotate(150deg) translateX(calc(var(--r) * 1.12))" }} />
        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-[#1468e8]/70" style={{ transform: "rotate(75deg) translateX(calc(var(--r) * 0.7))" }} />
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
      className="cw-panel relative rounded-[28px] bg-[#f6f4f1] px-4 pb-5 pt-10 sm:rounded-[40px] sm:px-10 sm:pb-6 lg:min-h-[560px] lg:px-14 lg:pt-14"
    >
      {/* Stage: halo + orbiting work badges + mascot.
          Stacked + centered below lg; absolutely positioned on the right from lg up. */}
      <div className="cw-stage relative z-0 mx-auto mb-6 lg:absolute lg:-top-5 lg:right-[1%] lg:mb-0">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle at 50% 50%, #e3effb 0%, #eaf3fc 55%, rgba(234,243,252,0) 72%)" }}
        />
        <Orbit modules={cw.modules} />
        {/* Mascot: h-[..%] = size, bottom-[..%] = how high it sits (circle + orbit stay the same) */}
        <img
          src={cw.mascot}
          alt={`${cw.name}, the ${cw.domain.toLowerCase()} coworker`}
          draggable={false}
          className="pointer-events-none absolute bottom-[13%] left-1/2 z-[1] h-[73%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
        />
      </div>

      {/* Copy — centered under the mascot on phones/tablets, left column from lg */}
      <div className="relative z-10 mx-auto mt-0 max-w-[620px] text-center lg:mx-0 lg:mt-6 lg:max-w-[470px] lg:text-left xl:max-w-[620px]">
        <h2
          className="text-[30px] font-extrabold leading-[1.1] tracking-[-0.025em] sm:text-[42px] lg:text-[44px] xl:text-[60px] xl:leading-[1.08]"
          style={{ color: INK }}
        >
          <span className="bg-gradient-to-r from-[#1468e8] to-[#1468e8] bg-clip-text text-transparent">{cw.name}{" "}</span>{cw.headline}{" "}
          <span className="bg-gradient-to-r from-[#1468e8] to-[#12b4f0] bg-clip-text text-transparent">
            {cw.accent}
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-[470px] text-[16px] leading-relaxed text-slate-500 sm:mt-5 sm:text-[19px] lg:mx-0">
          {cw.blurb}
        </p>
        <Link
          to={`/coworkers/${cw.id}`}
          className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3 text-[15px] font-medium shadow-[0_4px_16px_rgba(15,31,61,0.07)] transition-shadow hover:shadow-[0_6px_22px_rgba(20,104,232,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1468e8] sm:mt-7 sm:px-7 sm:py-3.5"
          style={{ color: INK }}
        >
          Meet {cw.name}
          <ArrowRight size={18} style={{ color: BLUE }} />
        </Link>
      </div>

      {/* Module cards: 2-up phones, 3-up tablets, 5-up from lg */}
      <ul className={`relative z-10 mt-8 grid grid-cols-2 gap-2.5 sm:mt-10 sm:grid-cols-3 sm:gap-4 lg:mt-14 lg:grid-cols-5`}>
        {cw.modules.map(({ label, icon: Icon }) => (
          <li
            key={label}
            className="flex min-h-[116px] flex-col justify-between rounded-[18px] bg-white/15 p-4 shadow-[0_2px_14px_rgba(15,31,61,0.05)] backdrop-blur-[20px] sm:min-h-[150px] sm:rounded-[22px] sm:p-6 last:odd:col-span-2 sm:last:odd:col-span-1"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e4effd] sm:h-14 sm:w-14">
              <Icon className="h-[22px] w-[22px] sm:h-[26px] sm:w-[26px]" strokeWidth={1.8} style={{ color: BLUE }} />
            </span>
            <span className="mt-3 text-[15px] font-medium leading-tight sm:mt-4 sm:text-[18px]" style={{ color: INK }}>
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
    // overflowX: clip stops the orbit badges from ever causing sideways page scroll on small phones
    <section className="bg-[#fcfbf8] py-12 sm:py-24" style={{ overflowX: "clip" }}>
      <style>{`
        @keyframes cwSwap { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes cwSpin { to { transform: rotate(360deg); } }
        @keyframes cwSpinRev { to { transform: rotate(-360deg); } }
        .cw-panel { animation: cwSwap .45s ease both; }

        /* Stage size (--m), orbit radius (--r) and badge size (--b) per breakpoint */
        .cw-stage { --m: clamp(200px, 62vw, 250px); --r: calc(var(--m) * 0.47); --b: 38px; width: var(--m); height: var(--m); }
        @media (min-width: 640px)  { .cw-stage { --m: 320px; --r: 150px; --b: 64px; } }
        @media (min-width: 768px)  { .cw-stage { --m: 360px; --r: 168px; --b: 68px; } }
        @media (min-width: 1024px) { .cw-stage { --m: 400px; --r: 176px; --b: 72px; } }
        @media (min-width: 1280px) { .cw-stage { --m: 540px; --r: 235px; --b: 80px; } }

        .cw-spin { animation: cwSpin 48s linear infinite; }
        .cw-counter { animation: cwSpinRev 48s linear infinite; }
        .cw-ring-a { animation: cwSpinRev 90s linear infinite; }
        .cw-ring-b { animation: cwSpin 120s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .cw-panel, .cw-spin, .cw-counter, .cw-ring-a, .cw-ring-b { animation: none; }
        }
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