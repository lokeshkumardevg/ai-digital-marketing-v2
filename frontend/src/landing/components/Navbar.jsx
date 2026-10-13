import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "./Button";
import { ChevronDown, ChevronRight, X, Menu, ArrowRight } from "lucide-react";

const logo = "/fevicon.png";
const navItems = ["Coworkers", "Features", "Tutorial", "Pricing", "Resources", "Docs", "Help", "Contact"];

const COWORKER_NAV = [
  { 
    id: "growth", 
    name: "Max", 
    role: "Growth Coworker", 
    accent: "#a855f7", 
    mascot: "/assets/mascots/aarav_HD.png", 
    agents: ["Ads Campaign", "Deep Research", "Lead Generation", "Contact Segmentation", "AI Visibility", "Template Design", "Marketing Automation"] 
  },
  { 
    id: "presence", 
    name: "Stella", 
    role: "Presence Coworker", 
    accent: "#f59e0b", 
    mascot: "/assets/mascots/meera_HD.png", 
    agents: ["Review Generation", "Review Response", "Listings Optimization", "Local Pages", "Social Publishing", "Social Engagement", "Chatbot"] 
  },
  { 
    id: "operations", 
    name: "Atlas", 
    role: "Operations Coworker", 
    accent: "#2f8f5b", 
    mascot: "/assets/mascots/rohan_HD.png", 
    agents: ["Front Desk", "Appointments", "Reminders", "Waitlist & Recall", "Lead Follow-up", "Insurance Verification", "Multi-Modal: Voice, Email, Text"] 
  },
  { 
    id: "experience", 
    name: "Echo", 
    role: "Experience Coworker", 
    accent: "#e23b3b", 
    mascot: "/assets/mascots/kavi_HD.png", 
    agents: ["Survey", "Sentiment & Insights", "Ticketing", "Follow-up", "Competitor Analysis", "Reporting"] 
  },
];

const AGENT_ID_MAP = {
  "Ads Campaign": "ads-campaign",
  "Deep Research": "deep-research",
  "Lead Generation": "lead-gen",
  "Contact Segmentation": "contact-seg",
  "AI Visibility": "ai-visibility",
  "Template Design": "template",
  "Marketing Automation": "mkt-automation",
  "Review Generation": "review-gen",
  "Review Response": "review-resp",
  "Listings Optimization": "listings",
  "Local Pages": "local-pages",
  "Social Publishing": "social-pub",
  "Social Engagement": "social-eng",
  "Chatbot": "chatbot",
  "Front Desk": "front-desk",
  "Appointments": "appointments",
  "Reminders": "reminders",
  "Waitlist & Recall": "waitlist-recall",
  "Lead Follow-up": "lead-followup",
  "Insurance Verification": "insurance",
  "Multi-Modal: Voice, Email, Text": "multi-modal",
  "Survey": "survey",
  "Sentiment & Insights": "sentiment-insights",
  "Ticketing": "ticketing",
  "Follow-up": "exp-followup",
  "Competitor Analysis": "competitor-analysis",
  "Reporting": "reporting",
};

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileCoworkersOpen, setMobileCoworkersOpen] = useState(false);
  const [mobileDocsOpen, setMobileDocsOpen] = useState(false);
  const [selectedMobileCoworker, setSelectedMobileCoworker] = useState("growth");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const routeMap = {
    Features: "/features",
    Pricing: "/pricing",
    Tutorial: "/tutorial",
    Resources: "/resources",
    Docs: "/docs",
    Help: "/help",
    Contact: "/contact",
  };
  const hrefFor = (item) => routeMap[item] ?? "#" + item.toLowerCase();
  const isRoute = (item) => !!routeMap[item];

  const activeCoworker = COWORKER_NAV.find(c => c.id === selectedMobileCoworker) || COWORKER_NAV[0];

  // ── Active page detection ──
  const { pathname } = useLocation();
  const matchPath = (base) => pathname === base || pathname.startsWith(base + "/");
  const isActive = (item) => {
    if (item === "Coworkers") return matchPath("/coworkers") || matchPath("/agent-ecosystem");
    if (item === "Docs") return matchPath("/docs") || matchPath("/api-docs") || matchPath("/security");
    return routeMap[item] ? matchPath(routeMap[item]) : false;
  };
  const isPathActive = (href) => matchPath(href);

  return (
    <>
      <header
        className={`fixed left-0 z-50 w-full flex justify-center px-3 sm:px-4 transition-all duration-300 ${
          isScrolled ? "top-2 sm:top-2.5" : "top-8 sm:top-10"
        }`}
      >
        {/* Width shrinks on scroll */}
        <div
          className={`flex items-center justify-center w-full transition-all duration-500 ease-out ${
            isScrolled ? "max-w-[1060px]" : "max-w-[1240px]"
          }`}
        >
          <div
            className={`relative flex items-center justify-between w-full rounded-full border border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-300 ${
              isScrolled
                ? "h-12 px-3.5 sm:px-5 shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
                : "h-14 sm:h-16 px-4 sm:px-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
            }`}
          >
            {/* ── Brand Logo ── */}
            <Link to="/" className="flex items-center relative z-10 shrink-0">
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  width: 44, height: 36, borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden", flexShrink: 0,
                }}>
                  <img
                    src={logo}
                    alt="Wheedle logo"
                    style={{ width: "100%", height: "150%", objectFit: "contain" }}
                  />
                </div>
                <span style={{
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: isScrolled ? 17 : 20,
                  fontWeight: 800,
                  letterSpacing: "-0.3px",
                  background: "linear-gradient(90deg, #fff, rgba(255,255,255,0.7))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  transition: "font-size 0.5s ease",
                }}>
                  heedleTechnologies.Ai
                </span>
              </div>
            </Link>

            {/* ── Desktop Navigation Links ── */}
            <nav className="hidden lg:flex items-center gap-2 xl:gap-4 relative z-10 whitespace-nowrap">
              {navItems.map((item) => {
                const href = hrefFor(item);
                const active = isActive(item);
                const navLinkClass = `font-medium hover:text-white transition-colors duration-200 relative group px-2 py-1 text-[13px] xl:text-[14px] ${
                  active ? "text-white" : "text-white/70"
                }`;
                const underline = (
                  <span
                    className={`absolute left-2 right-2 -bottom-0.5 h-[2px] bg-gradient-to-r from-[#0665ff] to-[#22d3ee] transition-transform duration-300 origin-left group-hover:scale-x-100 ${
                      active ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                );

                if (item === "Coworkers") {
                  return (
                    <div key={item} className="relative group">
                      <button className={`${navLinkClass} flex items-center gap-1 cursor-pointer`}>
                        <span>{item}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-white/50 transition-transform duration-300 group-hover:rotate-180 group-hover:text-white" />
                        {underline}
                      </button>

                      {/* Mega Menu Dropdown */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                        <div className="bg-[#070d1e]/95 backdrop-blur-2xl border border-[#0665ff]/25 rounded-2xl p-4 w-[820px] max-w-[92vw] shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
                          <div className="grid grid-cols-4 gap-3">
                            {COWORKER_NAV.map((cw) => (
                              <div key={cw.id} className="flex flex-col">
                                <Link
                                  to={`/coworkers/${cw.id}`}
                                  className="flex items-center gap-2 px-2.5 py-2 mb-2 rounded-xl bg-white/[0.03] hover:bg-[#0665ff]/15 border border-white/5 hover:border-[#0665ff]/30 transition-all group/cw"
                                >
                                  <span
                                    className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full flex-shrink-0"
                                    style={{ background: cw.accent }}
                                  >
                                    <img src={cw.mascot} alt="" className="h-full w-full object-cover object-top" />
                                  </span>
                                  <div className="flex flex-col leading-tight min-w-0">
                                    <span className="text-[13px] font-bold text-white group-hover/cw:text-[#22d3ee] transition-colors truncate">{cw.name}</span>
                                    <span className="text-[10px] uppercase tracking-wider text-white/40 truncate">{cw.role.replace(" Coworker", "")}</span>
                                  </div>
                                </Link>

                                <div className="flex flex-col gap-0.5">
                                  {cw.agents.map((agent) => {
                                    const agentId = AGENT_ID_MAP[agent] || agent.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                    return (
                                      <Link
                                        key={agent}
                                        to={`/agent-ecosystem?coworker=${cw.id}&agent=${agentId}#${agentId}`}
                                        className="px-2.5 py-1.5 text-[12.5px] text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors truncate"
                                      >
                                        {agent}
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between px-2 text-xs">
                            <span className="text-white/40">4 Autonomous AI Coworkers · 27 Specialized Agents</span>
                            <Link
                              to="/agent-ecosystem"
                              className="font-semibold text-[#22d3ee] hover:text-white flex items-center gap-1 transition-colors"
                            >
                              Explore full agent ecosystem <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (item === "Docs") {
                  return (
                    <div key={item} className="relative group">
                      <button className={`${navLinkClass} flex items-center gap-1 cursor-pointer`}>
                        <span>{item}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-white/50 transition-transform duration-300 group-hover:rotate-180 group-hover:text-white" />
                        {underline}
                      </button>

                      {/* Docs Dropdown */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                        <div className="bg-[#070d1e]/95 backdrop-blur-2xl border border-[#0665ff]/25 rounded-xl p-2.5 w-52 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col gap-1">
                          <div className="px-3 py-1 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                            API Documentation
                          </div>
                          <Link to="/api-docs/google" className="px-3 py-1.5 text-[13px] text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            Google Ads API
                          </Link>
                          <Link to="/api-docs/meta" className="px-3 py-1.5 text-[13px] text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            Meta Ads API
                          </Link>
                          <Link to="/api-docs/linkedin" className="px-3 py-1.5 text-[13px] text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            LinkedIn Ads API
                          </Link>
                          <div className="h-px bg-white/10 my-1" />
                          <div className="px-3 py-1 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                            Architecture
                          </div>
                          <Link to="/agent-ecosystem" className="px-3 py-1.5 text-[13px] text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            Agent Ecosystem
                          </Link>
                          <Link to="/security" className="px-3 py-1.5 text-[13px] text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            Security & Vaults
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                }

                return isRoute(item) ? (
                  <Link key={item} to={href} className={navLinkClass}>
                    {item}
                    {underline}
                  </Link>
                ) : (
                  <a key={item} href={href} className={navLinkClass}>
                    {item}
                    {underline}
                  </a>
                );
              })}
            </nav>

            {/* ── Desktop CTA: "Free Trial" rolls up, "Login | Register" rolls in from below ── */}
            <div className="hidden lg:block shrink-0 z-10 relative group w-[150px] h-9 rounded-full overflow-hidden bg-gradient-to-r from-[#0665ff] via-[#1468e8] to-[#1abfdf] shadow-[0_0_20px_rgba(6,101,255,0.35)] hover:shadow-[0_0_25px_rgba(6,101,255,0.6)] transition-shadow duration-300">
              {/* Layer 1: Free Trial (slides up and out on hover) */}
              <Link
                to="/register"
                className="absolute inset-0 flex items-center justify-center gap-1.5 text-xs xl:text-sm font-semibold text-white transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full"
              >
                Free Trial
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {/* Layer 2: Login | Register (slides up from below on hover) */}
              <div className="absolute inset-0 flex items-center translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-0">
                <Link
                  to="/login"
                  className="flex-1 h-full flex items-center justify-center gap-1 text-xs xl:text-sm font-medium text-white/90 hover:text-white hover:bg-white/15 transition-colors"
                >
                  Login / Register
                </Link>
              </div>
            </div>

            {/* ── Mobile Hamburger Button ── */}
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Open Mobile Menu"
              className="lg:hidden relative z-10 p-2 text-white/80 hover:text-white focus:outline-none"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Sidebar Overlay ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Mobile Drawer Panel ── */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[360px] sm:max-w-[400px] bg-[#070d1e]/98 backdrop-blur-2xl border-l border-white/10 z-[9999] flex flex-col transition-transform duration-300 ease-out shadow-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg  items-center justify-center">
              Menu
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close Mobile Menu"
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {/* Coworkers Accordion */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <button
              onClick={() => setMobileCoworkersOpen(!mobileCoworkersOpen)}
              className="w-full flex items-center justify-between p-3.5 text-left text-sm font-semibold text-white/90 hover:text-white transition-colors"
            >
              <span>AI Coworkers</span>
              <ChevronDown
                className={`w-4 h-4 text-white/50 transition-transform duration-300 ${
                  mobileCoworkersOpen ? "rotate-180 text-[#22d3ee]" : ""
                }`}
              />
            </button>

            {mobileCoworkersOpen && (
              <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-3">
                {/* Coworker Pills Switcher */}
                <div className="grid grid-cols-2 gap-1.5">
                  {COWORKER_NAV.map((cw) => {
                    const isSelected = selectedMobileCoworker === cw.id;
                    return (
                      <button
                        key={cw.id}
                        onClick={() => setSelectedMobileCoworker(cw.id)}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-all ${
                          isSelected
                            ? "bg-[#0665ff]/25 border border-[#0665ff]/50 text-white"
                            : "bg-white/[0.03] border border-white/5 text-white/60 hover:text-white"
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full overflow-hidden shrink-0" style={{ background: cw.accent }}>
                          <img src={cw.mascot} alt="" className="w-full h-full object-cover object-top" />
                        </span>
                        <span className="truncate">{cw.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Agents List of selected coworker */}
                <div className="rounded-lg bg-black/40 border border-white/5 p-2 space-y-1">
                  <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-white/40 uppercase tracking-wider">
                    <span>{activeCoworker.name}&apos;s Agents</span>
                    <Link
                      to={`/coworkers/${activeCoworker.id}`}
                      onClick={() => setIsOpen(false)}
                      className="text-[#22d3ee] hover:underline lowercase font-normal"
                    >
                      meet {activeCoworker.name} →
                    </Link>
                  </div>
                  {activeCoworker.agents.map((agent) => {
                    const agentId = AGENT_ID_MAP[agent] || agent.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    return (
                      <Link
                        key={agent}
                        to={`/agent-ecosystem?coworker=${activeCoworker.id}&agent=${agentId}#${agentId}`}
                        onClick={() => setIsOpen(false)}
                        className="block px-2.5 py-1.5 rounded-md text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        {agent}
                      </Link>
                    );
                  })}
                </div>

                <Link
                  to="/agent-ecosystem"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-xs font-semibold text-[#22d3ee] py-1 hover:underline"
                >
                  View full Agent Ecosystem →
                </Link>
              </div>
            )}
          </div>

          {/* Standard Page Links */}
          {[
            { label: "Features", href: "/features" },
            { label: "Tutorial", href: "/tutorial" },
            { label: "Pricing", href: "/pricing" },
            { label: "Resources", href: "/resources" },
            { label: "Help & FAQs", href: "/help" },
            { label: "Contact Us", href: "/contact" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              to={href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors border ${
                isPathActive(href)
                  ? "text-white bg-[#0665ff]/20 border-[#0665ff]/40"
                  : "text-white/75 hover:text-white hover:bg-white/5 border-transparent hover:border-white/5"
              }`}
            >
              <span>{label}</span>
              <ChevronRight className={`w-4 h-4 ${isPathActive(href) ? "text-[#22d3ee]" : "text-white/30"}`} />
            </Link>
          ))}

          {/* Docs Accordion */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <button
              onClick={() => setMobileDocsOpen(!mobileDocsOpen)}
              className="w-full flex items-center justify-between p-3.5 text-left text-sm font-semibold text-white/90 hover:text-white transition-colors"
            >
              <span>API & Docs</span>
              <ChevronDown
                className={`w-4 h-4 text-white/50 transition-transform duration-300 ${
                  mobileDocsOpen ? "rotate-180 text-[#22d3ee]" : ""
                }`}
              />
            </button>

            {mobileDocsOpen && (
              <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-1 text-xs">
                <Link to="/api-docs/google" onClick={() => setIsOpen(false)} className="block px-2.5 py-1.5 text-white/70 hover:text-white rounded hover:bg-white/5">
                  Google Ads API
                </Link>
                <Link to="/api-docs/meta" onClick={() => setIsOpen(false)} className="block px-2.5 py-1.5 text-white/70 hover:text-white rounded hover:bg-white/5">
                  Meta Ads API
                </Link>
                <Link to="/api-docs/linkedin" onClick={() => setIsOpen(false)} className="block px-2.5 py-1.5 text-white/70 hover:text-white rounded hover:bg-white/5">
                  LinkedIn Ads API
                </Link>
                <Link to="/security" onClick={() => setIsOpen(false)} className="block px-2.5 py-1.5 text-white/70 hover:text-white rounded hover:bg-white/5">
                  Enterprise Security
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer Buttons */}
        <div className="p-5 border-t border-white/10 space-y-2.5">
          <Link
            to="/register"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#0665ff] to-[#22d3ee] shadow-[0_0_20px_rgba(6,101,255,0.4)]"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center py-2.5 rounded-xl font-medium text-xs text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}

export default Navbar;