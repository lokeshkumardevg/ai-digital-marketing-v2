import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Play,
  Pause,
  Send,
  Zap,
  Check,
  Star,
  ThumbsUp,
  Activity,
  Bot,
  UserCheck,
} from "lucide-react";

const STEPS = [
  {
    step: "01",
    coworker: "Echo",
    character: "Kavi",
    domain: "Experience",
    role: "Sentiment & Ticketing",
    tag: "INCIDENT DETECTED",
    mascot: "/assets/mascots/kavi_HD.png",
    accent: "#ef4444",
    glowColor: "rgba(239, 68, 68, 0.35)",
    agentName: "Echo Sentiment & NLP Agent",
    title: "A 2-Star Review Lands on Google",
    thought:
      "Negative customer sentiment detected on Google Business Profile. Sentiment score is critical (-0.82). Creating priority incident #TK-8402 and alerting Stella & Atlas.",
    summary:
      "Within 1.8 seconds of the customer posting a review, Echo parses the text, calculates CSAT drop impact, tags root emotion, and initializes the incident ticket.",
    checks: [
      "Real-time NLP sentiment analysis: -0.82 (Critical Alert)",
      "Automated priority ticket #TK-8402 generated",
      "Autonomous payload dispatched to Stella (Presence) & Atlas (Operations)",
    ],
    metric: "Detection Time: 1.8s",
    mockType: "review",
    mockData: {
      author: "Sarah Jenkins",
      avatarBg: "#ef4444",
      time: "Just now · Google Review",
      rating: 2,
      text: "Waited 40 minutes past my appointment time, and staff seemed completely unaware of my booking. Very frustrating experience after driving 30 mins to get here.",
      statusText: "Negative Sentiment Detected",
      statusColor: "#ef4444",
      sentimentScore: "-0.82 Critical",
    },
  },
  {
    step: "02",
    coworker: "Stella",
    character: "Meera",
    domain: "Presence",
    role: "Reputation & Brand Voice",
    tag: "BRAND REPUTATION RESPONSE",
    mascot: "/assets/mascots/meera_HD.png",
    accent: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.35)",
    agentName: "Stella Review Response Agent",
    title: "Empathetic Response Drafted Instantly",
    thought:
      "Reading Brand Center voice guidelines. Crafting a de-escalating, empathetic public apology that addresses Sarah's wait time and offers direct director contact.",
    summary:
      "Stella analyzes the customer's complaint, applies strict brand policy guidelines, drafts a respectful public response, and stages it for one-click approval.",
    checks: [
      "Custom brand voice & empathy guidelines applied",
      "Public response screened against banned terms & legal compliance",
      "Prepares private follow-up resolution hotline link",
    ],
    metric: "Draft Latency: 3.2s · 99.4% Match",
    mockType: "draft",
    mockData: {
      author: "Stella AI (Draft for Manager)",
      avatarBg: "#f59e0b",
      time: "Generated in 3.2s",
      text: "Hi Sarah, we sincerely apologize for the delay. Punctuality is core to our service standard, and we clearly fell short today. Our director is personally reviewing clinic check-in logs, and we want to make this right immediately.",
      statusText: "Awaiting 1-Click Approval",
      statusColor: "#f59e0b",
      approvedText: "Approved & Published to Google",
    },
  },
  {
    step: "03",
    coworker: "Atlas",
    character: "Rohan",
    domain: "Operations",
    role: "Front Desk & Scheduling",
    tag: "OPERATIONAL ROOT CAUSE",
    mascot: "/assets/mascots/rohan_HD.png",
    accent: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.35)",
    agentName: "Atlas Appointments & Audit Agent",
    title: "Atlas Diagnoses the Booking Overrun",
    thought:
      "Auditing calendar logs for appointment #BK-9182. Identified a 35-minute doctor schedule overrun caused by an earlier emergency. Triggering VIP reschedule compensation.",
    summary:
      "Atlas inspects booking timestamps, pinpoints the operational bottleneck that caused the delay, logs the staff shift notes, and generates an automated VIP priority pass.",
    checks: [
      "Cross-referenced booking timestamp with doctor check-in logs",
      "Identified root cause: 35-minute overrun from prior emergency surgery",
      "Auto-generated VIP priority reschedule pass with waived consultation fee",
    ],
    metric: "Audit Duration: 2.1s · Cause Identified",
    mockType: "audit",
    mockData: {
      author: "Atlas Operations Engine",
      avatarBg: "#10b981",
      time: "Calendar Audit Verified",
      text: "Root Cause: Room 4 emergency patient overrun pushed queue back 38 minutes. Front-desk notification was delayed by 12 minutes. System auto-issued VIP priority slot #VIP-771.",
      statusText: "Root Cause Solved",
      statusColor: "#10b981",
    },
  },
  {
    step: "04",
    coworker: "Max",
    character: "Aarav",
    domain: "Growth",
    role: "Customer Retention & Loyalty",
    tag: "RETENTION & RECONCILIATION",
    mascot: "/assets/mascots/aarav_HD.png",
    accent: "#0665ff",
    glowColor: "rgba(6, 101, 255, 0.35)",
    agentName: "Max Retention & Campaign Agent",
    title: "Customer Retained · Review Updated to 5★",
    thought:
      "Excluded Sarah from promo ad spend, sent a personalized courtesy care pack with Atlas's VIP pass, and verified Sarah updated her review to 5 stars!",
    summary:
      "Max automates the proactive win-back workflow. The customer accepts the resolution, updates their review to 5 stars, and the entire multi-coworker audit trail is recorded.",
    checks: [
      "Proactive SMS apology delivered with VIP priority booking code",
      "Customer updates Google review rating from 2★ to 5★",
      "Zero customer churn · Multi-coworker audit trail archived",
    ],
    metric: "Retention Rate: 100% · Rating: 5.0★",
    mockType: "resolved",
    mockData: {
      author: "Sarah Jenkins (Updated Review)",
      avatarBg: "#22d3ee",
      time: "Today · Verified Google Review",
      rating: 5,
      text: "Update: The clinic director and management reached out within minutes, explained the emergency situation respectfully, and took complete care of my reschedule. Truly outstanding customer service! ⭐⭐⭐⭐⭐",
      statusText: "Customer Retained · 5.0★",
      statusColor: "#22d3ee",
    },
  },
];

function OrchestrationDemo() {
  const [active, setActive] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  // Auto-cycle through steps if auto-play is enabled
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % STEPS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  // Step badalne par "Approved" state reset
  useEffect(() => {
    setIsApproved(false);
  }, [active]);

  const step = STEPS[active];

  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-3 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      {/* Background radial atmosphere glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[100px] transition-all duration-700 sm:h-[420px] sm:w-[560px] sm:blur-[140px] lg:h-[500px] lg:w-[700px] lg:blur-[160px]"
          style={{ background: step.accent }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_35%,rgba(6,101,255,0.07)_0%,transparent_75%)]" />
      </div>

      {/* Header section */}
      <div className="relative z-10 mb-8 text-center sm:mb-12">
        <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-[#0665ff]/30 bg-[#0665ff]/10 px-3 py-1 backdrop-blur-md sm:px-3.5">
          <Zap className="h-3.5 w-3.5 animate-pulse text-[#22d3ee]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#60a5fa] sm:text-[11px] sm:tracking-[0.14em]">
            Autonomous Collaboration
          </span>
        </div>

        <h2 className="mb-3 px-2 text-xl font-extrabold leading-tight tracking-tight text-white min-[400px]:text-2xl sm:text-3xl lg:text-4xl">
          One Incident.{" "}
          <span className="bg-gradient-to-r from-[#22d3ee] via-[#0665ff] to-[#a855f7] bg-clip-text text-transparent">
            Four AI Coworkers in Total Sync.
          </span>
        </h2>

        <p className="mx-auto max-w-2xl px-2 text-xs leading-relaxed text-slate-400 sm:text-sm">
          Watch how Wheedle.ai&apos;s autonomous coworkers detect, respond, diagnose, and retain
          customers in real time — with zero manual coordination between teams.
        </p>
      </div>

      {/* ── Top Coworker Squad Mesh / Interactive Pipeline Selector ── */}
      <div className="relative z-10 mx-auto mb-6 max-w-5xl sm:mb-8">
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          {STEPS.map((s, i) => {
            const isActive = i === active;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setActive(i);
                  setIsAutoPlaying(false);
                }}
                aria-pressed={isActive}
                className={`group relative flex min-w-0 flex-col items-start rounded-2xl border p-2.5 text-left transition-all duration-300 sm:p-3.5 ${
                  isActive
                    ? "bg-gradient-to-b from-[#0d1d3d] to-[#07122a] border-white/30 shadow-[0_8px_30px_rgba(6,101,255,0.3)] sm:scale-[1.02] ring-1"
                    : "bg-[#050c1e]/70 border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
                }`}
                style={{
                  borderColor: isActive ? s.accent : undefined,
                  "--tw-ring-color": isActive ? `${s.accent}40` : undefined,
                }}
              >
                {/* Active Neon Bar indicator at top */}
                {isActive && (
                  <div
                    className="absolute left-3 right-3 top-0 h-[2px] rounded-full shadow-[0_0_12px_currentColor]"
                    style={{ background: s.accent, color: s.accent }}
                  />
                )}

                <div className="mb-2 flex w-full items-center gap-2 sm:gap-3">
                  {/* Coworker Mascot Avatar */}
                  <div
                    className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border transition-transform duration-300 group-hover:scale-105 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
                    style={{
                      borderColor: isActive ? s.accent : "rgba(255,255,255,0.15)",
                      background: `linear-gradient(135deg, ${s.accent}30, #040915)`,
                    }}
                  >
                    <img
                      src={s.mascot}
                      alt={`${s.coworker} (${s.character})`}
                      className="h-full w-full object-cover object-top"
                    />
                    {isActive && (
                      <span
                        className="absolute inset-0 animate-pulse rounded-xl opacity-25"
                        style={{ background: s.accent }}
                      />
                    )}
                  </div>

                  {/* Coworker Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className="text-[9px] font-mono font-bold sm:text-[10px]"
                        style={{ color: isActive ? s.accent : "rgba(255,255,255,0.5)" }}
                      >
                        STEP {s.step}
                      </span>
                      {isActive && (
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span
                            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                            style={{ background: s.accent }}
                          />
                          <span
                            className="relative inline-flex h-2 w-2 rounded-full"
                            style={{ background: s.accent }}
                          />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 truncate text-[13px] font-bold text-white sm:gap-1.5 sm:text-sm">
                      <span className="truncate">{s.coworker}</span>
                      <span className="hidden text-[11px] font-normal text-slate-400 sm:inline">
                        ({s.character})
                      </span>
                    </div>
                    <span className="block truncate text-[10px] text-slate-400 sm:text-[11px]">
                      {s.domain}
                    </span>
                  </div>
                </div>

                {/* Subtag / action description */}
                <div className="flex w-full items-center justify-between gap-1 border-t border-white/5 pt-2 text-[10px]">
                  <span
                    className="truncate font-medium"
                    style={{ color: isActive ? s.accent : "rgba(148, 163, 184, 0.8)" }}
                  >
                    {s.role}
                  </span>
                  <ArrowRight
                    className={`h-3 w-3 shrink-0 transition-transform duration-300 ${
                      isActive
                        ? "translate-x-0.5 text-white"
                        : "text-white/20 group-hover:translate-x-0.5"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Play / Pause toggle bar & Progress */}
        <div className="mt-3 flex flex-col gap-2 px-1 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Activity className="h-3.5 w-3.5 shrink-0 text-[#22d3ee]" />
            <span>Multi-Agent Live Pipeline · Step {active + 1} of {STEPS.length}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="inline-flex items-center justify-center gap-1.5 self-start rounded-md bg-white/5 px-2.5 py-1.5 text-[11px] text-slate-300 transition-colors hover:bg-white/10 sm:self-auto"
          >
            {isAutoPlaying ? (
              <>
                <Pause className="h-3 w-3 text-[#22d3ee]" />
                <span>
                  Auto-playing<span className="hidden sm:inline"> flow (click to pause)</span>
                </span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 text-[#60a5fa]" />
                <span>Play automated demo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Main Interactive Stage Card ── */}
      <div className="relative z-10 mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[#0665ff]/30 bg-gradient-to-br from-[#07122A] via-[#050c1f] to-[#020510] p-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)] sm:p-6 lg:p-7">
        {/* Glow corners */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full blur-[90px] transition-colors duration-700 sm:-right-32 sm:-top-32 sm:h-80 sm:w-80 sm:blur-[120px]"
          style={{ background: step.glowColor }}
        />

        <div className="grid items-stretch gap-4 sm:gap-6 lg:grid-cols-12">
          {/* LEFT: Coworker Mascot Spotlight Card (5 cols) */}
          <div className="relative flex min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#040915]/80 p-4 backdrop-blur-md sm:p-6 lg:col-span-5">
            {/* Top Mascot Hero Display */}
            <div className="relative mb-4 text-center">
              {/* Status beacon badge */}
              <div
                className="mb-3 inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider sm:text-[10px]"
                style={{
                  borderColor: `${step.accent}50`,
                  background: `${step.accent}15`,
                  color: step.accent,
                }}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 animate-ping rounded-full"
                  style={{ background: step.accent }}
                />
                <span className="truncate">COWORKER ON DUTY · {step.domain}</span>
              </div>

              {/* Large Mascot Character Portrait */}
              <div
                className="relative mx-auto h-32 w-32 rounded-2xl p-1 shadow-2xl transition-all duration-500 min-[400px]:h-36 min-[400px]:w-36 sm:h-44 sm:w-44"
                style={{
                  background: `linear-gradient(135deg, ${step.accent}50, rgba(255,255,255,0.05))`,
                }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-[#030712]">
                  <img
                    src={step.mascot}
                    alt={`${step.coworker} Mascot`}
                    className="h-full w-full object-cover object-top brightness-105 contrast-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 text-left">
                    <div className="min-w-0">
                      <h4 className="truncate text-xs font-extrabold leading-tight text-white">
                        {step.coworker}
                      </h4>
                      <p className="truncate font-mono text-[10px] text-slate-300">
                        {step.character} · {step.role.split("&")[0]}
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold text-white shadow"
                      style={{ background: step.accent }}
                    >
                      {step.step}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coworker Autonomous Thought Bubble */}
            <div className="relative mb-4 rounded-xl border border-white/10 bg-black/40 p-3 shadow-inner sm:p-3.5">
              <div
                className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider"
                style={{ color: step.accent }}
              >
                <Bot className="h-3 w-3 shrink-0" />
                <span>Autonomous Agent Directive</span>
              </div>
              <p className="break-words text-xs italic leading-relaxed text-slate-300">
                &ldquo;{step.thought}&rdquo;
              </p>
            </div>

            {/* Checklist */}
            <div className="mb-5 space-y-2">
              {step.checks.map((check, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    style={{ color: step.accent }}
                  />
                  <span className="min-w-0 break-words leading-snug">{check}</span>
                </div>
              ))}
            </div>

            {/* Stepper controls */}
            <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => {
                  setActive((a) => Math.max(0, a - 1));
                  setIsAutoPlaying(false);
                }}
                disabled={active === 0}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 transition-all hover:bg-white/5 hover:text-white disabled:opacity-30"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => {
                  setActive((a) => (a + 1) % STEPS.length);
                  setIsAutoPlaying(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white shadow-md transition-all hover:opacity-90 sm:px-4"
                style={{
                  background: `linear-gradient(135deg, ${step.accent}, #0665ff)`,
                }}
              >
                <span>{active === STEPS.length - 1 ? "Restart Flow" : "Next Milestone"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* RIGHT: Live Simulation Terminal & Telemetry (7 cols) */}
          <div className="relative flex min-w-0 flex-col justify-between rounded-xl border border-white/10 bg-[#030712]/90 p-4 shadow-2xl backdrop-blur-xl sm:p-6 lg:col-span-7">
            {/* Terminal Window Chrome */}
            <div className="mb-4 flex flex-col gap-2 border-b border-white/10 pb-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="truncate pl-2 font-mono text-[10px] text-slate-400 sm:text-[11px]">
                  wheedle://orchestration/step-{step.step}
                </span>
              </div>

              <span
                className="inline-flex max-w-full items-center gap-1 self-start rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold sm:self-auto"
                style={{
                  background: `${step.mockData.statusColor}20`,
                  color: step.mockData.statusColor,
                  border: `1px solid ${step.mockData.statusColor}40`,
                }}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full"
                  style={{ background: step.mockData.statusColor }}
                />
                <span className="truncate">{step.mockData.statusText}</span>
              </span>
            </div>

            {/* Autonomous Multi-Coworker Handshake Pipeline */}
            <div className="mb-4 flex flex-col justify-between gap-2 rounded-lg border border-white/5 bg-black/40 p-2.5 text-[11px] sm:flex-row sm:items-center">
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden">
                {STEPS.map((s, idx) => (
                  <React.Fragment key={s.coworker}>
                    <div
                      className={`flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 transition-all ${
                        idx === active
                          ? "bg-white/15 font-bold text-white ring-1"
                          : "font-normal text-slate-400"
                      }`}
                      style={{
                        "--tw-ring-color": idx === active ? s.accent : "transparent",
                      }}
                    >
                      <img
                        src={s.mascot}
                        alt=""
                        className="h-4 w-4 shrink-0 rounded-full object-cover"
                      />
                      <span>{s.coworker}</span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <span className="shrink-0 font-mono text-[10px] text-slate-600">➔</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <span className="shrink-0 self-start rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-300 sm:self-auto">
                {step.metric}
              </span>
            </div>

            {/* Dynamic Interactive Mock Simulator Box */}
            <div className="mb-4 flex flex-1 flex-col justify-center rounded-xl border border-white/5 bg-slate-950/90 p-3.5 shadow-inner sm:p-5">
              {/* Header inside mock */}
              <div className="mb-3 flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow"
                    style={{ background: step.mockData.avatarBg }}
                  >
                    {step.mockData.author.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h5 className="truncate text-xs font-bold text-white">
                      {step.mockData.author}
                    </h5>
                    <p className="truncate font-mono text-[10px] text-slate-400">
                      {step.mockData.time}
                    </p>
                  </div>
                </div>

                {/* Rating stars */}
                {step.mockData.rating && (
                  <div className="flex shrink-0 items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                          i < step.mockData.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Mock Body content */}
              <div className="mb-4 break-words text-xs leading-relaxed text-slate-200 sm:text-[13px]">
                &ldquo;{step.mockData.text}&rdquo;
              </div>

              {/* Step Specific Interactive Controls & Feedback */}
              {step.mockType === "review" && (
                <div className="flex items-start justify-between gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs">
                  <div className="flex items-start gap-2 text-red-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <span>Auto-escalation: Ticket #TK-8402 opened with High CSAT Risk</span>
                  </div>
                  <span className="hidden shrink-0 font-mono text-[11px] font-bold text-red-400 sm:inline">
                    Score: -0.82
                  </span>
                </div>
              )}

              {step.mockType === "draft" && (
                <div className="flex flex-col items-stretch justify-between gap-3 border-t border-white/5 pt-3 sm:flex-row sm:items-center">
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <UserCheck className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                    <span>Trained on clinic guidelines & tone</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsApproved(!isApproved)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold shadow-md transition-all sm:w-auto"
                    style={{
                      background: isApproved ? "#10b981" : "#f59e0b",
                      color: "#fff",
                    }}
                  >
                    {isApproved ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Approved & Published!</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>1-Click Approve Reply</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {step.mockType === "audit" && (
                <div className="space-y-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  <div className="flex flex-col gap-0.5 border-b border-emerald-500/20 pb-1 font-mono text-[10px] font-bold text-emerald-400 sm:flex-row sm:items-center sm:justify-between sm:text-[11px]">
                    <span>TIMELINE AUDIT LOG</span>
                    <span>ROOM 4 DR. OVERRUN</span>
                  </div>
                  <div className="flex items-start gap-2 pt-1 text-[11px]">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    <span className="min-w-0 break-words">
                      10:15 AM: Patient Check-in ➔ 10:50 AM: 35-min emergency overrun identified
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px]">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    <span className="min-w-0 break-words">
                      Auto-action: Priority VIP voucher code #VIP-771 sent via SMS
                    </span>
                  </div>
                </div>
              )}

              {step.mockType === "resolved" && (
                <div className="flex items-start justify-between gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3 text-xs">
                  <div className="flex items-start gap-2 text-cyan-300">
                    <ThumbsUp className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                    <span>Reconciliation complete · Review revised from 2★ to 5★</span>
                  </div>
                  <span className="hidden shrink-0 font-mono text-[11px] font-bold text-cyan-400 sm:inline">
                    100% Retained
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Telemetry Bar */}
            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Multi-Coworker Handshake Synced
              </span>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-slate-400">
                <span>Zero Human Delay</span>
                <span className="hidden text-white/40 sm:inline">|</span>
                <span className="font-semibold text-cyan-400">Wheedle Core v2.4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OrchestrationDemo;