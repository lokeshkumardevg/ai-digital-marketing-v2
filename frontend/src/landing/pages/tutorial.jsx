import React, { useState } from "react";
import Navbar from "../components/Navbar";
import LaunchCTA from "../components/LaunchCTA";
import FAQ from "../components/Faq";
import ContactForm from "../components/ContactForm";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import {
  Play,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Layers,
  ArrowRight,
  TrendingUp,
  Shield,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

const TUTORIAL_CATEGORIES = [
  { id: "all", label: "All Tutorials" },
  { id: "getting-started", label: "Getting Started" },
  { id: "campaigns", label: "Campaigns (Max)" },
  { id: "reputation", label: "Reputation (Stella)" },
  { id: "operations", label: "Operations (Atlas)" },
  { id: "analytics", label: "Analytics (Echo)" },
];

const TUTORIAL_VIDEOS = [
  {
    id: "v1",
    category: "getting-started",
    title: "Platform Tour & Connecting Ad Accounts",
    duration: "4:30 min",
    level: "Beginner",
    summary:
      "A complete walkthrough on connecting your Meta Business Suite, Google Ads, and CRM in under 2 minutes with zero API headaches.",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800",
    chapters: ["0:00 Introduction", "1:15 OAuth Connection", "3:10 Verification"],
  },
  {
    id: "v2",
    category: "getting-started",
    title: "Brand Center: Calibrating Voice & Do's/Don'ts",
    duration: "6:15 min",
    level: "Beginner",
    summary:
      "Train the AI on your exact brand tone, color palette, forbidden phrases, and audience personas to guarantee every creative feels authentic.",
    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800",
    chapters: ["0:00 Voice Guidelines", "2:20 Uploading Assets", "4:45 Persona Testing"],
  },
  {
    id: "v3",
    category: "campaigns",
    title: "Launching a Multi-Channel Campaign in 60s",
    duration: "7:45 min",
    level: "Intermediate",
    summary:
      "Watch Max research competitors, generate 12 ad variations, establish budgets, and prepare ready-to-launch campaigns across Meta and Google.",
    thumbnail:
      "https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=800",
    chapters: ["0:00 Brief Creation", "2:30 Creative Generation", "5:10 Live Launch"],
  },
  {
    id: "v4",
    category: "campaigns",
    title: "Setting Up Autonomous Budget Scaling & ROAS Guard",
    duration: "8:20 min",
    level: "Advanced",
    summary:
      "How to set strict spending thresholds, automated bid adjustments, and kill rules so winning ads scale and losers pause automatically.",
    thumbnail:
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=800",
    chapters: ["0:00 Rules Setup", "3:40 Risk Limits", "6:50 Live Log Auditing"],
  },
  {
    id: "v5",
    category: "reputation",
    title: "Stella: Automated Review Requests & AI Replies",
    duration: "5:10 min",
    level: "Beginner",
    summary:
      "Automate polite WhatsApp/SMS review invitations post-purchase, and deploy instant, human-like replies on Google Business and Facebook.",
    thumbnail:
      "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=800",
    chapters: ["0:00 Trigger Setup", "2:00 Sentiment Routing", "3:50 Approvals Flow"],
  },
  {
    id: "v6",
    category: "operations",
    title: "Atlas: Front Desk Booking & Instant Follow-ups",
    duration: "9:05 min",
    level: "Intermediate",
    summary:
      "Connect your calendar and let Atlas answer patient/client inquiries, schedule appointments, and rescue canceled slots automatically.",
    thumbnail:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800",
    chapters: ["0:00 Calendar Sync", "3:15 WhatsApp Bot", "6:40 Rescheduling Flow"],
  },
  {
    id: "v7",
    category: "analytics",
    title: "Echo: Multi-Touch Attribution & Weekly Digests",
    duration: "6:40 min",
    level: "Intermediate",
    summary:
      "Understand where every conversion originated, see true ROAS without platform bias, and receive automated executive summaries on Slack.",
    thumbnail:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800",
    chapters: ["0:00 Attribution Setup", "2:45 Cohort Breakdown", "5:00 Exporting Reports"],
  },
];

const LEARNING_PATHS = [
  {
    step: "01",
    title: "Setup & Calibration",
    desc: "Connect your ad accounts, input brand guidelines, and invite team members with granular permission roles.",
    badge: "Day 1",
  },
  {
    step: "02",
    title: "Deploy Your First Coworker",
    desc: "Start with Max for ads or Stella for reviews. Review and approve the first batch of generated drafts.",
    badge: "Day 2",
  },
  {
    step: "03",
    title: "Activate Autonomous Rules",
    desc: "Turn on automated budget scaling, negative feedback escalations, and weekly performance digests.",
    badge: "Week 1",
  },
  {
    step: "04",
    title: "Full Ecosystem Scaling",
    desc: "Orchestrate all four AI coworkers simultaneously for unified pipeline growth and effortless operations.",
    badge: "Scale",
  },
];

export default function Tutorial() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState(TUTORIAL_VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const filteredVideos =
    activeCategory === "all"
      ? TUTORIAL_VIDEOS
      : TUTORIAL_VIDEOS.filter((v) => v.category === activeCategory);

  return (
    <div className="bg-[#00040f] text-white min-h-screen overflow-hidden">
      <Navbar />

      {/* ───────────────── HERO SECTION ───────────────── */}
      <section className="relative pt-28 pb-10 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-[#0665ff]/20 blur-[140px] rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[200px] bg-[#22d3ee]/10 blur-[120px] rounded-full" />
        </div>

        {/* Ambient Grid */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(6,101,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(6,101,255,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse 70% 50% at 50% 30%, black 0%, transparent 100%)",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#0665ff]/30 bg-[#0665ff]/10 mb-4 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_8px_#22d3ee] animate-pulse" />
            <span className="text-[11px] font-semibold tracking-[0.14em] text-[#60a5fa] uppercase">
              Video Masterclass & Academy
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight mb-3">
            Master Autonomous Marketing,{" "}
            <span className="bg-gradient-to-r from-[#0665ff] via-[#22d3ee] to-[#818cf8] bg-clip-text text-transparent">
              Step by Step
            </span>
          </h1>

          <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-400 leading-relaxed mb-8">
            Short, focused video walkthroughs showing exactly how to calibrate your brand,
            unleash autonomous coworkers, and scale revenue on autopilot.
          </p>

          {/* ───────────────── FEATURED MASTERCLASS PLAYER ───────────────── */}
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-2xl border border-[#0665ff]/40 bg-gradient-to-b from-[#07122A] to-[#040816] p-3 sm:p-5 shadow-[0_15px_50px_rgba(6,101,255,0.2)]">
              <div className="relative rounded-xl overflow-hidden aspect-video bg-black/80 group">
                <img
                  src={selectedVideo.thumbnail}
                  alt={selectedVideo.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-85"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                {/* Play Button Trigger */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label="Play Tutorial Video"
                  className="absolute inset-0 flex items-center justify-center group/btn"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#0665ff] to-[#22d3ee] p-[2px] shadow-[0_0_30px_rgba(6,101,255,0.6)] transition-transform duration-300 group-hover/btn:scale-110">
                    <div className="w-full h-full rounded-full bg-black/80 backdrop-blur-md flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-0.5 fill-white" />
                    </div>
                  </div>
                </button>

                {/* Video Info Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div className="text-left">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#0665ff]/40 border border-[#0665ff]/50 text-cyan-300 mb-1.5">
                      {selectedVideo.level} · {selectedVideo.duration}
                    </span>
                    <h3 className="text-base sm:text-xl font-bold text-white leading-tight">
                      {selectedVideo.title}
                    </h3>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-[#22d3ee]" />
                    <span>HD Walkthrough</span>
                  </div>
                </div>
              </div>

              {/* Video Chapters Strip */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1 text-left">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Chapters:
                  </span>
                  {selectedVideo.chapters.map((ch, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/5 border border-white/10 text-slate-300"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-slate-400 line-clamp-1 max-w-sm">
                  {selectedVideo.summary}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── CATEGORY TABS & VIDEO GRID ───────────────── */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {TUTORIAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-gradient-to-r from-[#0665ff] to-[#22d3ee] text-white shadow-[0_0_16px_rgba(6,101,255,0.35)]"
                  : "bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white hover:border-[#0665ff]/30"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => {
                setSelectedVideo(video);
                window.scrollTo({ top: 400, behavior: "smooth" });
              }}
              className={`group relative rounded-2xl border p-4 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                selectedVideo.id === video.id
                  ? "border-[#22d3ee] bg-[#07122A] shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                  : "border-white/10 bg-slate-900/50 hover:border-[#0665ff]/40 hover:bg-slate-900/80 hover:-translate-y-1"
              }`}
            >
              <div>
                {/* Thumbnail */}
                <div className="relative rounded-xl overflow-hidden aspect-video mb-4 bg-black/60">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />

                  {/* Play badge */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 text-white ml-0.5 fill-white" />
                    </div>
                  </div>

                  {/* Duration Pill */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-semibold text-white/90">
                    {video.duration}
                  </div>
                </div>

                {/* Level Tag */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#22d3ee]">
                    {video.level}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    {video.duration}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white group-hover:text-[#60a5fa] transition-colors leading-snug mb-2">
                  {video.title}
                </h4>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {video.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#60a5fa] font-semibold">
                <span>Watch video</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────── STEP-BY-STEP LEARNING ROADMAP ───────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0665ff]/30 bg-[#0665ff]/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_8px_#22d3ee]" />
            <span className="text-[11px] font-semibold tracking-[0.12em] text-[#60a5fa] uppercase">
              Curriculum Path
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Recommended Onboarding Flow
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            From first account sync to full autopilot optimization in four structured milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {LEARNING_PATHS.map((item, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-6 flex flex-col justify-between hover:border-[#0665ff]/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black bg-gradient-to-r from-[#0665ff] to-[#22d3ee] bg-clip-text text-transparent">
                    {item.step}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#0665ff]/15 border border-[#0665ff]/30 text-[#60a5fa]">
                    {item.badge}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-2">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Milestone</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────── 1-ON-1 GUIDED ONBOARDING CARD ───────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 py-12">
        <div className="relative rounded-3xl border border-[#0665ff]/30 bg-gradient-to-r from-[#07122A] via-[#09183d] to-[#040816] p-8 sm:p-12 overflow-hidden shadow-[0_15px_50px_rgba(6,101,255,0.15)] flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3">
              Personalized Guidance
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Prefer a live walkthrough with our team?
            </h3>
            <p className="text-sm text-slate-300/80 leading-relaxed">
              Book a 15-minute onboarding session. Our product specialists will review your marketing
              goals, configure your brand persona, and launch your first campaign live with you.
            </p>
          </div>

          <a
            href="/contact"
            className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0665ff] to-[#22d3ee] px-7 py-3.5 text-sm font-bold text-white shadow-[0_0_25px_rgba(6,101,255,0.4)] hover:opacity-90 transition-opacity"
          >
            <span>Schedule 1-on-1 Walkthrough</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Reusable Platform Sections */}
      <LaunchCTA />
      <FAQ />
      <ContactForm />
      <Newsletter />
      <Footer />
    </div>
  );
}