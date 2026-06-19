import logo from "../../assets/fevicon.png";
import { Link } from "react-router-dom";

const footerGroups = {
  Product: ['AI Agents', 'Deep Research', 'AI Setup Bot', 'AI Studio', 'Workflows'],
  Company: ['About us', 'Careers', 'Blog', 'Contact'],
  Community: ['X/Twitter', 'LinkedIn', 'Discord', 'Documentation'],
};

function SocialIcon({ children, platform }) {
  const getPlatformColor = () => {
    switch(platform) {
      case 'linkedin': return 'hover:border-[#0A66C2]';
      case 'twitter': return 'hover:border-[#1DA1F2]';
      case 'facebook': return 'hover:border-[#1877F2]';
      case 'youtube': return 'hover:border-[#FF0000]';
      default: return 'hover:border-primary/40';
    }
  };

  return (
    <a
      href="/"
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-gradient-to-br from-white/[0.03] to-transparent text-white transition-all duration-300 hover:scale-110 hover:border-primary/50 hover:bg-white/[0.08] hover:shadow-lg ${getPlatformColor()}`}
      onClick={(e) => e.preventDefault()}
    >
      {children}
    </a>
  );
}

function FooterLink({ href, children, isExternal }) {
  return (
    <a
      href={href}
      onClick={(e) => e.preventDefault()}
      className="group relative inline-block text-white/70 transition-all duration-300 hover:text-white"
    >
      {children}
      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-primary to-primary/50 transition-all duration-300 group-hover:w-full"></span>
    </a>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-gradient-to-b from-[#0B1120] via-[#0A0F1A] to-[#06080F] pb-8 pt-16">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-600/5 blur-3xl"></div>
      </div>
      
      <div className="section-shell relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Left Column - Brand Section */}
          <div>
            <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center relative z-10 shrink-0">
              <div style={{ display: "flex", alignItems: "center"}}>
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
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: "-0.3px",
                  background: "linear-gradient(90deg, #fff, rgba(255,255,255,0.7))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  transition: "font-size 0.5s ease",
                }}>
                  heedle Technologies.ai
                </span>
              </div>
            </Link>
            </div>
            <p className="mt-5 max-w-[360px] text-sm leading-relaxed text-white/70">
              We're building the future of automated commerce. Wheedle.ai uses state-of-the-art Generative AI to manage world-class marketing for brands of all sizes.
            </p>

            {/* Email Subscription */}
            <div className="mt-6">
              <div className="flex max-w-[360px] gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 rounded-xl border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <button className="rounded-xl bg-gradient-to-r from-[#0665ff] via-[#0665ff] to-[#22d3ee] px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  Subscribe
                </button>
              </div>
              <p className="mt-2 text-xs text-white/40">Get updates on new features and releases</p>
            </div>

            <div className="mt-6 flex gap-3">
              <SocialIcon platform="linkedin">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.222 0 22.225 0z"/>
                </svg>
              </SocialIcon>
              <SocialIcon platform="twitter">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </SocialIcon>
              <SocialIcon platform="facebook">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </SocialIcon>
              <SocialIcon platform="youtube">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* Right Column - Links Section */}
          <div className="grid gap-8 sm:grid-cols-3">
            {Object.entries(footerGroups).map(([title, links]) => (
              <div key={title}>
                <p className="text-sm font-semibold tracking-wide text-white/90">{title}</p>
                <ul className="mt-4 space-y-3 text-sm">
                  {links.map((link) => (
                    <li key={link}>
                      <FooterLink href="/">{link}</FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1">
            © 2026 Wheedle Technologies Inc. All rights reserved. 
            <span className="hidden sm:inline">Built with</span>
            <span className="inline sm:hidden">❤️</span>
            <span className="hidden sm:inline">❤️</span>
            <span className="hidden sm:inline"> for Indian brands.</span>
          </p>
          <div className="flex gap-6">
            <a href="/" onClick={(e) => e.preventDefault()} className="transition-colors duration-300 hover:text-white/80">Terms</a>
            <a href="/" onClick={(e) => e.preventDefault()} className="transition-colors duration-300 hover:text-white/80">Privacy</a>
            <a href="/" onClick={(e) => e.preventDefault()} className="transition-colors duration-300 hover:text-white/80">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;