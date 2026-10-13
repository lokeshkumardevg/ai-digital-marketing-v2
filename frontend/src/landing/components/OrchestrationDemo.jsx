import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Play,
  Pause,
  MessageSquare,
  ShieldAlert,
  Calendar,
  Send,
  Zap,
  Check,
  RotateCcw,
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

  const step = STEPS[active];

  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 overflow-hidden">
      {/* Background radial atmosphere glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[160px] opacity-20 transition-all duration-700"
          style={{ background: step.accent }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_35%,rgba(6,101,255,0.07)_0%,transparent_75%)]" />
      </div>

      {/* Header section */}
      <div className="relative z-10 text-center mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#0665ff]/30 bg-[#0665ff]/10 mb-3.5 backdrop-blur-md">
          <Zap className="w-3.5 h-3.5 text-[#22d3ee] animate-pulse" />
          <span className="text-[11px] font-semibold tracking-[0.14em] text-[#60a5fa] uppercase">
            Autonomous Collaboration
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
          One Incident.{" "}
          <span className="bg-gradient-to-r from-[#22d3ee] via-[#0665ff] to-[#a855f7] bg-clip-text text-transparent">
            Four AI Coworkers in Total Sync.
          </span>
        </h2>

        <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-400 leading-relaxed">
          Watch how Wheedle.ai&apos;s autonomous coworkers detect, respond, diagnose, and retain
          customers in real time — with zero manual coordination between teams.
        </p>
      </div>

      {/* ── Top Coworker Squad Mesh / Interactive Pipeline Selector ── */}
      <div className="relative z-10 mb-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                className={`group relative flex flex-col items-start p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-b from-[#0d1d3d] to-[#07122a] border-white/30 shadow-[0_8px_30px_rgba(6,101,255,0.3)] scale-[1.02] ring-1"
                    : "bg-[#050c1e]/70 border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
                }`}
                style={{
                  borderColor: isActive ? s.accent : undefined,
                  ringColor: isActive ? `${s.accent}40` : undefined,
                }}
              >
                {/* Active Neon Bar indicator at top */}
                {isActive && (
                  <div
                    className="absolute top-0 left-3 right-3 h-[2px] rounded-full shadow-[0_0_12px_currentColor]"
                    style={{ background: s.accent, color: s.accent }}
                  />
                )}

                <div className="flex items-center gap-3 w-full mb-2">
                  {/* Coworker Mascot Avatar */}
                  <div
                    className="relative flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-xl overflow-hidden shrink-0 border transition-transform duration-300 group-hover:scale-105"
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
                        className="absolute inset-0 rounded-xl animate-pulse opacity-25"
                        style={{ background: s.accent }}
                      />
                    )}
                  </div>

                  {/* Coworker Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-mono font-bold"
                        style={{ color: isActive ? s.accent : "rgba(255,255,255,0.5)" }}
                      >
                        STEP {s.step}
                      </span>
                      {isActive && (
                        <span className="flex h-2 w-2 relative">
                          <span
                            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                            style={{ background: s.accent }}
                          />
                          <span
                            className="relative inline-flex rounded-full h-2 w-2"
                            style={{ background: s.accent }}
                          />
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                      <span>{s.coworker}</span>
                      <span className="text-[11px] font-normal text-slate-400">({s.character})</span>
                    </div>
                    <span className="block text-[11px] text-slate-400 truncate">
                      {s.domain}
                    </span>
                  </div>
                </div>

                {/* Subtag / action description */}
                <div className="w-full pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span
                    className="font-medium truncate"
                    style={{ color: isActive ? s.accent : "rgba(148, 163, 184, 0.8)" }}
                  >
                    {s.role}
                  </span>
                  <ArrowRight
                    className={`w-3 h-3 transition-transform duration-300 shrink-0 ${
                      isActive ? "translate-x-0.5 text-white" : "text-white/20 group-hover:translate-x-0.5"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Play / Pause toggle bar & Progress */}
        <div className="mt-3 flex items-center justify-between text-xs px-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Activity className="w-3.5 h-3.5 text-[#22d3ee]" />
            <span>Multi-Agent Live Pipeline · Step {active + 1} of 4</span>
          </div>
          <button
            type="button"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 transition-colors"
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3 h-3 text-[#22d3ee]" />
                <span>Auto-playing flow (click to pause)</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-[#60a5fa]" />
                <span>Play automated demo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Main Interactive Stage Card ── */}
      <div className="relative z-10 rounded-2xl border border-[#0665ff]/30 bg-gradient-to-br from-[#07122A] via-[#050c1f] to-[#020510] p-5 sm:p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)] max-w-5xl mx-auto overflow-hidden">
        
        {/* Glow corners */}
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[120px] pointer-events-none transition-colors duration-700"
          style={{ background: step.glowColor }}
        />

        <div className="grid gap-6 lg:grid-cols-12 items-stretch">
          
          {/* LEFT: Prominent Coworker Mascot Spotlight Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-white/10 bg-[#040915]/80 p-5 sm:p-6 backdrop-blur-md relative overflow-hidden">
            
            {/* Top Mascot Hero Display */}
            <div className="relative text-center mb-4">
              {/* Status beacon badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold tracking-wider uppercase mb-3"
                style={{
                  borderColor: `${step.accent}50`,
                  background: `${step.accent}15`,
                  color: step.accent,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: step.accent }} />
                <span>COWORKER ON DUTY · {step.domain}</span>
              </div>

              {/* Large Mascot Character Portrait */}
              <div className="relative mx-auto w-36 h-36 sm:w-44 sm:h-44 rounded-2xl p-1 shadow-2xl transition-all duration-500"
                style={{
                  background: `linear-gradient(135deg, ${step.accent}50, rgba(255,255,255,0.05))`,
                }}
              >
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#030712] relative">
                  <img
                    src={step.mascot}
                    alt={`${step.coworker} Mascot`}
                    className="w-full h-full object-cover object-top filter brightness-105 contrast-105"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-60"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-left">
                    <div>
                      <h4 className="text-xs font-extrabold text-white leading-tight">
                        {step.coworker}
                      </h4>
                      <p className="text-[10px] text-slate-300 font-mono">
                        {step.character} · {step.role.split("&")[0]}
                      </p>
                    </div>
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold text-white shadow"
                      style={{ background: step.accent }}
                    >
                      {step.step}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coworker Autonomous Thought Bubble */}
            <div className="relative rounded-xl border border-white/10 bg-black/40 p-3.5 mb-4 shadow-inner">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider mb-1"
                style={{ color: step.accent }}
              >
                <Bot className="w-3 h-3" />
                <span>Autonomous Agent Directive</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                &ldquo;{step.thought}&rdquo;
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-2 mb-5">
              {step.checks.map((check, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2
                    className="w-3.5 h-3.5 shrink-0 mt-0.5"
                    style={{ color: step.accent }}
                  />
                  <span className="leading-snug">{check}</span>
                </div>
              ))}
            </div>

            {/* Stepper controls */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
              <button
                type="button"
                onClick={() => {
                  setActive((a) => Math.max(0, a - 1));
                  setIsAutoPlaying(false);
                }}
                disabled={active === 0}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-white/70 hover:bg-white/5 hover:text-white disabled:opacity-30 transition-all"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => {
                  setActive((a) => (a + 1) % STEPS.length);
                  setIsAutoPlaying(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-md transition-all hover:opacity-90"
                style={{
                  background: `linear-gradient(135deg, ${step.accent}, #0665ff)`,
                }}
              >
                <span>{active === STEPS.length - 1 ? "Restart Flow" : "Next Milestone"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* RIGHT: Live Simulation Terminal & Telemetry (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-white/10 bg-[#030712]/90 p-5 sm:p-6 backdrop-blur-xl shadow-2xl relative">
            
            {/* Terminal Window Chrome */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-mono text-slate-400 pl-2">
                  wheedle://orchestration/step-{step.step}
                </span>
              </div>

              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1"
                style={{
                  background: `${step.mockData.statusColor}20`,
                  color: step.mockData.statusColor,
                  border: `1px solid ${step.mockData.statusColor}40`,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: step.mockData.statusColor }} />
                {step.mockData.statusText}
              </span>
            </div>

            {/* Autonomous Multi-Coworker Handshake Pipeline */}
            <div className="mb-4 p-2.5 rounded-lg bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
                {STEPS.map((s, idx) => (
                  <React.Fragment key={s.coworker}>
                    <div
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-md shrink-0 transition-all ${
                        idx === active
                          ? "bg-white/15 text-white font-bold ring-1"
                          : "text-slate-400 font-normal"
                      }`}
                      style={{
                        ringColor: idx === active ? s.accent : "transparent",
                      }}
                    >
                      <img
                        src={s.mascot}
                        alt=""
                        className="w-4 h-4 rounded-full object-cover shrink-0"
                      />
                      <span>{s.coworker}</span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <span className="text-slate-600 font-mono text-[10px] shrink-0">➔</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <span className="text-[10px] font-mono text-slate-300 shrink-0 self-end sm:self-auto px-1.5 py-0.5 rounded bg-white/5">
                {step.metric}
              </span>
            </div>

            {/* Dynamic Interactive Mock Simulator Box */}
            <div className="flex-1 flex flex-col justify-center rounded-xl bg-slate-950/90 border border-white/5 p-4 sm:p-5 mb-4 shadow-inner">
              
              {/* Header inside mock */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow shrink-0"
                    style={{ background: step.mockData.avatarBg }}
                  >
                    {step.mockData.author.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      {step.mockData.author}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {step.mockData.time}
                    </p>
                  </div>
                </div>

                {/* Rating stars */}
                {step.mockData.rating && (
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
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
              <div className="text-xs sm:text-[13px] text-slate-200 leading-relaxed mb-4">
                &ldquo;{step.mockData.text}&rdquo;
              </div>

              {/* Step Specific Interactive Controls & Feedback */}
              {step.mockType === "review" && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Auto-escalation: Ticket #TK-8402 opened with High CSAT Risk</span>
                  </div>
                  <span className="font-mono text-[11px] text-red-400 font-bold hidden sm:inline">
                    Score: -0.82
                  </span>
                </div>
              )}

              {step.mockType === "draft" && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/5">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Trained on clinic guidelines & tone</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsApproved(!isApproved)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md"
                    style={{
                      background: isApproved ? "#10b981" : "#f59e0b",
                      color: "#fff",
                    }}
                  >
                    {isApproved ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Approved & Published!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>1-Click Approve Reply</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {step.mockType === "audit" && (
                <div className="space-y-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-300">
                  <div className="flex items-center justify-between font-mono text-[11px] font-bold text-emerald-400 pb-1 border-b border-emerald-500/20">
                    <span>TIMELINE AUDIT LOG</span>
                    <span>ROOM 4 DR. OVERRUN</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>10:15 AM: Patient Check-in ➔ 10:50 AM: 35-min emergency overrun identified</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Auto-action: Priority VIP voucher code #VIP-771 sent via SMS</span>
                  </div>
                </div>
              )}

              {step.mockType === "resolved" && (
                <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-cyan-300">
                    <ThumbsUp className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Reconciliation complete · Review revised from 2★ to 5★</span>
                  </div>
                  <span className="font-mono text-[11px] text-cyan-400 font-bold hidden sm:inline">
                    100% Retained
                  </span>
                </div>
              )}

            </div>

            {/* Bottom Telemetry Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/5">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Multi-Coworker Handshake Synced
              </span>
              <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400">
                <span>Zero Human Delay</span>
                <span className="text-white/40">|</span>
                <span className="text-cyan-400 font-semibold">Wheedle Core v2.4</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default OrchestrationDemo;