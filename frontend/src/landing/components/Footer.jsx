import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Activity, Lock } from "lucide-react";

const logo = "/fevicon.png";

const footerNavigation = [
  {
    title: "AI Coworkers",
    links: [
      { label: "Max — Growth & Ads", href: "/coworkers/growth" },
      { label: "Stella — Reputation & Reviews", href: "/coworkers/presence" },
      { label: "Atlas — Operations & Front Desk", href: "/coworkers/operations" },
      { label: "Echo — Experience & Insights", href: "/coworkers/experience" },
      { label: "All 27 Agents Ecosystem", href: "/agent-ecosystem", badge: "Live" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Features Suite", href: "/features" },
      { label: "Video Masterclass", href: "/tutorial" },
      { label: "Transparent Pricing", href: "/pricing" },
      { label: "Growth Resources", href: "/resources" },
      { label: "Enterprise Security", href: "/security" },
    ],
  },
  {
    title: "APIs & Developers",
    links: [
      { label: "Google Ads API", href: "/api-docs/google" },
      { label: "Meta Ads API", href: "/api-docs/meta" },
      { label: "LinkedIn Ads API", href: "/api-docs/linkedin" },
      { label: "Webhooks & Automation", href: "/help" },
      { label: "API Documentation", href: "/help" },
    ],
  },
  {
    title: "Support & Company",
    links: [
      { label: "Help & Knowledge Base", href: "/help" },
      { label: "Schedule Live Demo", href: "/contact" },
      { label: "Contact Sales", href: "/contact" },
      { label: "Sign In to Dashboard", href: "/login" },
      { label: "Start 3-Day Free Trial", href: "/register", highlight: true },
    ],
  },
];

// `icon` is the key used to pick the SVG, `color` is the brand colour used on hover
const socialLinks = [
  { platform: "LinkedIn", href: "https://linkedin.com/company/wheedle-ai", icon: "linkedin", color: "#0A66C2" },
  { platform: "X / Twitter", href: "https://twitter.com/wheedleai", icon: "twitter", color: "#3f3f46" },
  { platform: "Facebook", href: "https://facebook.com/wheedleai", icon: "facebook", color: "#1877F2" },
  { platform: "YouTube", href: "https://youtube.com/@wheedleai", icon: "youtube", color: "#FF0000" },
];

const SOCIAL_SVGS = {
  linkedin: (
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.222 0 22.225 0z" />
  ),
  twitter: (
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  ),
  facebook: (
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  ),
  youtube: (
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  ),
};

function SocialIcon({ platform, href, color, icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={platform}
      style={{ "--brand": color }}
      className="group relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] text-white/80 backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:scale-110 hover:border-transparent hover:bg-[var(--brand)] hover:text-white hover:shadow-[0_12px_30px_-6px_var(--brand)]"
    >
      <svg className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
        {SOCIAL_SVGS[icon]}
      </svg>

      {/* Tooltip */}
      <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg border border-white/10 bg-[#0b1226] px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
        {platform}
      </span>
    </a>
  );
}

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
    }, 2000);
  };

  return (
    <footer className="relative border-t border-white/10 bg-[#020510] text-white overflow-hidden pt-16 pb-8">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 right-1/4 w-96 h-96 rounded-full bg-[#0665ff]/10 blur-[140px]" />
        <div className="absolute -bottom-40 left-10 w-96 h-96 rounded-full bg-[#22d3ee]/8 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(6,101,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(6,101,255,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section: Brand + Links Grid */}
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1.9fr] pb-14 border-b border-white/10">
          {/* Brand Info & Newsletter */}
          <div className="flex flex-col">
            <Link to="/" className="flex items-center relative z-10 shrink-0">
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: 44,
                    height: 36,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={logo}
                    alt="Wheedle logo"
                    style={{ width: "100%", height: "150%", objectFit: "contain" }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: "'Figtree', sans-serif",
                    fontSize: 20,
                    fontWeight: 800,
                    letterSpacing: "-0.3px",
                    background: "linear-gradient(90deg, #fff, rgba(255,255,255,0.7))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    transition: "font-size 0.5s ease",
                  }}
                >
                  heedle Technologies.ai
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
              The autonomous AI coworker ecosystem for modern growth. Orchestrate cross-channel ads,
              earn 5-star customer reviews, manage front-desk bookings, and retain customers on autopilot.
            </p>

            {/* Newsletter Subscription */}
            <div className="mb-6 max-w-sm">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Stay Ahead in AI Marketing
              </span>

              {subscribed ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Thank you! You are now subscribed to our product updates.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your work email"
                    className="flex-1 min-w-0 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-[#22d3ee] focus:ring-1 focus:ring-[#22d3ee]/30 transition-all"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-[#0665ff] to-[#22d3ee] px-4 py-2 text-xs font-bold text-white shrink-0 shadow-[0_0_15px_rgba(6,101,255,0.3)] hover:opacity-90 transition-opacity"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>

            {/* Social Showcase */}
            <div className="mb-6">
              <span className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-[#22d3ee]" />
                Follow us
                <span className="h-px w-16 bg-gradient-to-r from-white/20 to-transparent" />
              </span>
              <div className="flex flex-wrap gap-3.5">
                {socialLinks.map((s) => (
                  <SocialIcon key={s.platform} {...s} />
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22d3ee]" />
                SOC-2 Certified
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03]">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                99.98% Uptime
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03]">
                <Lock className="w-3.5 h-3.5 text-[#818cf8]" />
                DPDP 2023 Compliant
              </span>
            </div>
          </div>

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {footerNavigation.map((group) => (
              <div key={group.title} className="flex flex-col">
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase mb-3.5">
                  {group.title}
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className={`inline-flex items-center gap-1.5 transition-colors ${
                          link.highlight
                            ? "text-[#22d3ee] font-semibold hover:text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <span>{link.label}</span>
                        {link.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0665ff]/20 text-[#22d3ee] border border-[#0665ff]/30">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} Wheedle Technologies Inc. All rights reserved. Built for high-growth brands.
          </p>

          <div className="flex items-center gap-4">
            <Link to="/terms" className="transition-colors duration-300 hover:text-white/80">
              Terms of Service
            </Link>
            <Link to="/privacy-policy" className="transition-colors duration-300 hover:text-white/80">
              Privacy Policy
            </Link>
            <Link to="/data-deletion" className="transition-colors duration-300 hover:text-white/80">
              Data Deletion
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;