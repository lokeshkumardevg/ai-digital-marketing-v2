import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import logo from "../../assets/fevicon.png";
import { Menu, X } from "lucide-react";

const navItems = ["Features", "Tutorial", "Pricing", "Resources", "Docs", "Help", "Contact"];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // lock body scroll when sidebar open
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

  const navLinkClass = isScrolled
    ? "font-medium text-white/60 hover:text-white transition duration-300 relative group text-[13px]"
    : "font-medium text-white/60 hover:text-white transition duration-300 relative group text-[15px]";

  const btnClass = isScrolled
    ? "group relative flex items-center justify-center overflow-hidden rounded-full font-medium text-white shadow-[0_0_0_3px_rgba(7,10,24,0.9)] active:scale-95 h-[34px] w-[110px] text-[12px] bg-gradient-to-r from-[#0665ff] via-[#1468e8] to-[#1abfdf]"
    : "group relative flex items-center justify-center overflow-hidden rounded-full font-medium text-white shadow-[0_0_0_3px_rgba(7,10,24,0.9)] active:scale-95 h-[40px] w-[125px] text-[14px] bg-gradient-to-r from-[#0665ff] via-[#1468e8] to-[#1abfdf]";
  const capsuleClass =
    "relative flex items-center rounded-[60px] border w-full justify-between bg-black/30 backdrop-blur-xl border-white/10 mx-auto";

  const capsuleStyle = {
    transition: "max-width 0.5s ease, height 0.5s ease, padding 0.5s ease, box-shadow 0.5s ease",
    maxWidth: isScrolled ? "1024px" : "1200px",
    height: isScrolled ? "48px" : "62px",
    paddingLeft: isScrolled ? "16px" : "28px",
    paddingRight: isScrolled ? "16px" : "28px",
    boxShadow: isScrolled
      ? "0 8px 30px rgba(0,0,0,0.8)"
      : "0 0 40px rgba(0,0,0,0.7)",
  };

  const headerClass = isScrolled
    ? "fixed left-0 z-50 w-full flex justify-center px-4 transition-all duration-300 top-2"
    : "fixed left-0 z-50 w-full flex justify-center px-4 transition-all duration-300 top-4";

  return (
    <>
      <header className={headerClass}>
        <div className="flex items-center justify-center w-full px-4">
          <div className={capsuleClass} style={capsuleStyle}>

            {/* Logo */}
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

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6 relative z-10 whitespace-nowrap">
              {navItems.map((item) => {
                const href = hrefFor(item);
                const cls = navLinkClass;
                const underline = <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-blue-500 transition-all duration-300 group-hover:w-full" />;

                if (item === "Docs") {
                  return (
                    <div key={item} className="relative group">
                      <button className={`${cls} flex items-center gap-1 cursor-default pb-1`}>
                        {item}
                        <svg className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        {underline}
                      </button>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
                        <div className="bg-[#0a0f1e]/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 w-48 shadow-2xl flex flex-col gap-1">
                          <div className="px-3 py-1 text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">API References</div>
                          <Link to="/api-docs/google" className="px-3 py-2 text-[14px] text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">Google Ads API</Link>
                          <Link to="/api-docs/linkedin" className="px-3 py-2 text-[14px] text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">LinkedIn Ads API</Link>
                          <Link to="/api-docs/meta" className="px-3 py-2 text-[14px] text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">Meta Ads API</Link>
                          <div className="h-[1px] bg-white/10 my-1 mx-2" />
                          <div className="px-3 py-1 text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Ecosystem</div>
                          <Link to="/agent-ecosystem" className="px-3 py-2 text-[14px] text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">Agent Ecosystem</Link>
                        </div>
                      </div>
                    </div>
                  );
                }

                return isRoute(item) ? (
                  <Link key={item} to={href} className={cls}>
                    {item}{underline}
                  </Link>
                ) : (
                  <a key={item} href={href} className={cls}>
                    {item}{underline}
                  </a>
                );
              })}
            </nav>

            {/* Desktop CTA Button */}
            <div className="hidden lg:flex items-center shrink-0 z-10">
              <Link to="/login" className={btnClass}>
                <span>Login / Register</span>
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsOpen(true)}
              className="lg:hidden relative z-10 p-2 text-white/80 hover:text-white"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="8" x2="20" y2="8" />
                <line x1="4" y1="16" x2="20" y2="16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", animation: "fadeIn 0.3s ease forwards" }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 320,
          maxWidth: "85vw",
          background: "rgba(10, 15, 30, 0.95)",
          backdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          zIndex: 10000,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ color: "#fff", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>Menu</span>
          <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: 4 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column" }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 12 }}>
            Menu
          </p>
          {navItems.map((item, i) => {
            const href = hrefFor(item);
            const linkStyle = {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "13px 0",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.75)",
              fontSize: 15,
              fontWeight: 500,
              textDecoration: "none",
              transition: "color 0.2s ease",
            };
            const inner = <>{item}<span style={{ color: "rgba(255,255,255,0.25)", fontSize: 18 }}>›</span></>;
            const hoverIn = (e) => { e.currentTarget.style.color = "#fff"; };
            const hoverOut = (e) => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; };

            if (item === "Docs") {
              return (
                <div key={item} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "13px", paddingTop: "13px" }}>
                  <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, fontWeight: 500, marginBottom: "12px" }}>
                    Docs
                  </div>
                  <div className="flex flex-col pl-4 gap-3 border-l border-white/10 ml-2">
                    <Link to="/api-docs/google" onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white text-[14px] transition-colors">Google Ads API</Link>
                    <Link to="/api-docs/linkedin" onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white text-[14px] transition-colors">LinkedIn Ads API</Link>
                    <Link to="/api-docs/meta" onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white text-[14px] transition-colors">Meta Ads API</Link>
                    <Link to="/agent-ecosystem" onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white text-[14px] transition-colors">Agent Ecosystem</Link>
                  </div>
                </div>
              );
            }

            return isRoute(item) ? (
              <Link key={item} to={href} onClick={() => setIsOpen(false)} style={linkStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                {inner}
              </Link>
            ) : (
              <a key={item} href={href} onClick={() => setIsOpen(false)} style={linkStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                {inner}
              </a>
            );
          })}
        </nav>

        {/* Sidebar Buttons */}
        <div style={{ padding: "28px 24px", marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: 46, borderRadius: 12,
              background: "#1630b7",
              color: "#fff", fontWeight: 600, fontSize: 15,
              textDecoration: "none",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#1c39d3"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#1630b7"; }}
          >
            Free Trial
          </Link>
        </div>

      </div>
    </>
  );
}

export default Navbar;