import { useState, useEffect, useRef, useCallback } from "react";

const brands = [
  {
    name: "Meta",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    description: "Official Advertising Partner",
  },
  {
    name: "Google Cloud",
    logo: "https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg",
    description: "AI Infrastructure Partner",
  },
  {
    name: "OpenAI",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg",
    description: "GPT-4 Integration",
  },
  {
    name: "Shopify",
    logo: "https://cdn.worldvectorlogo.com/logos/shopify.svg",
    description: "E-commerce Partner",
  },
  {
    name: "AWS",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
    description: "Cloud Hosting Partner",
  },
  {
    name: "Salesforce",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg",
    description: "CRM Integration",
  },
  {
    name: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    description: "Azure & 365 Partner",
  },
  {
    name: "Stripe",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
    description: "Payments Partner",
  },
];

const SCROLL_ITEMS = [...brands, ...brands];
const CARD_W = 240;
const GAP = 24;

function TrustedBy() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const rafRef = useRef(null);
  const isPausedRef = useRef(false);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  // spotlightIndex: which card index is currently centered (for showing name/desc)
  const [spotlightIndex, setSpotlightIndex] = useState(null);

  const singleSetWidth = brands.length * (CARD_W + GAP);

  // ── Generate particles once ──────────────────────────────────────────────
  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, () => ({
        id: Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 15 + 8,
        delay: Math.random() * 5,
      }))
    );
  }, []);

  // ── Mouse parallax ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      setMousePosition({
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ── rAF loop: measure card positions, apply spotlight styles directly ────
  //   We bypass React state for the per-frame visual updates so there's
  //   zero re-render cost. Only spotlightIndex (for the text reveal) goes
  //   through state, throttled to change only when the card changes.
  const applySpotlight = useCallback(() => {
    if (!trackRef.current) return;
    const trackRect = trackRef.current.closest(".carousel-viewport")?.getBoundingClientRect();
    if (!trackRect) return;

    const viewportCenterX = trackRect.left + trackRect.width / 2;
    const ACTIVATE_RADIUS = 160; // px from center to start activating
    const FULL_RADIUS = 40;      // px from center = fully lit

    let closestDist = Infinity;
    let closestIdx = null;

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const dist = Math.abs(cardCenterX - viewportCenterX);

      // proximity 0 (far) → 1 (dead center)
      const proximity = Math.max(0, 1 - (dist - FULL_RADIUS) / (ACTIVATE_RADIUS - FULL_RADIUS));
      const isCenter = proximity > 0;

      // Scale: 1.0 → 1.10
      const scale = 1 + proximity * 0.10;
      // Glow opacity: 0 → 1
      const glowOpacity = proximity;
      // Logo opacity: 0.55 → 1
      const logoOpacity = 0.55 + proximity * 0.45;
      // Border brightness
      const borderAlpha = 0.08 + proximity * 0.35;

      const card = el.querySelector(".spotlight-card");
      const glow = el.querySelector(".spotlight-glow");
      const logo = el.querySelector(".spotlight-logo");
      const textEl = el.querySelector(".spotlight-text");

      if (card) {
        card.style.transform = `scale(${scale})`;
        card.style.borderColor = `rgba(120,160,255,${borderAlpha})`;
        card.style.boxShadow = isCenter
          ? `0 0 ${24 * proximity}px ${8 * proximity}px rgba(80,120,255,${0.25 * proximity}), 0 8px 32px rgba(59,91,255,${0.15 * proximity})`
          : "none";
        card.style.background = isCenter
          ? `linear-gradient(135deg, rgba(59,91,255,${0.12 * proximity}), rgba(139,92,246,${0.12 * proximity}))`
          : "rgba(255,255,255,0.04)";
      }
      if (glow) glow.style.opacity = glowOpacity;
      if (logo) {
        logo.style.opacity = logoOpacity;
        logo.style.filter = isCenter
          ? `drop-shadow(0 0 ${8 * proximity}px rgba(99,131,255,${0.8 * proximity}))`
          : "none";
        logo.style.transform = `scale(${1 + proximity * 0.1}) translateY(${isCenter ? -8 * proximity : 0}px)`;
      }
      if (textEl) {
        textEl.style.opacity = proximity > 0.6 ? (proximity - 0.6) / 0.4 : 0;
        textEl.style.transform = `translateY(${proximity > 0.6 ? 0 : 8}px)`;
      }

      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });

    // Only update React state when the spotlight card changes (cheap)
    setSpotlightIndex((prev) => (prev !== closestIdx ? closestIdx : prev));

    rafRef.current = requestAnimationFrame(applySpotlight);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(applySpotlight);
    return () => cancelAnimationFrame(rafRef.current);
  }, [applySpotlight]);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 overflow-hidden bg-gradient-to-b from-[#040816] via-[#050a1f] to-[#040816]"
    >
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-${singleSetWidth}px); }
        }
        .ticker-track {
          animation: ticker 35s linear infinite;
          will-change: transform;
        }
        .ticker-track.paused {
          animation-play-state: paused;
        }

        @keyframes floatSlow {
          0%,100% { transform: translateY(0) translateX(0); }
          25%      { transform: translateY(-20px) translateX(10px); }
          75%      { transform: translateY(20px) translateX(-10px); }
        }
        .float-slow { animation: floatSlow ease-in-out infinite; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fade-up { animation: fadeUp 0.7s ease-out forwards; opacity:0; }

        @keyframes pulseSlow {
          0%,100% { opacity:.7; }
          50%      { opacity:1; }
        }
        .pulse-slow { animation: pulseSlow 3s ease-in-out infinite; }

        /* Center spotlight beam */
        @keyframes beamPulse {
          0%,100% { opacity: 0.18; transform: scaleX(1); }
          50%      { opacity: 0.30; transform: scaleX(1.05); }
        }
        .center-beam {
          animation: beamPulse 2.5s ease-in-out infinite;
        }

        .spotlight-card {
          transition: transform 0.25s cubic-bezier(.22,1,.36,1),
                      box-shadow 0.25s ease,
                      border-color 0.25s ease,
                      background 0.25s ease;
          will-change: transform;
        }
        .spotlight-logo {
          transition: transform 0.25s cubic-bezier(.22,1,.36,1),
                      opacity 0.2s ease,
                      filter 0.2s ease;
        }
        .spotlight-text {
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .spotlight-glow {
          transition: opacity 0.25s ease;
        }
      `}</style>

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-blue-400/10 pointer-events-none float-slow"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Parallax orbs */}
      <div className="pointer-events-none absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{
          left: "25%", top: "50%",
          transform: `translate(calc(-50% + ${mousePosition.x * 30}px), calc(-50% + ${mousePosition.y * 30}px))`,
          background: "radial-gradient(circle, rgba(59,91,255,.35) 0%, transparent 70%)",
          transition: "transform .6s ease-out",
        }}
      />
      <div className="pointer-events-none absolute w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{
          right: "25%", bottom: "50%",
          transform: `translate(calc(50% + ${mousePosition.x * -40}px), calc(50% + ${mousePosition.y * -40}px))`,
          background: "radial-gradient(circle, rgba(139,92,246,.35) 0%, transparent 70%)",
          transition: "transform .6s ease-out",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        {/* Badge */}
        <div className="mb-6 inline-block">
          <p className="text-sm tracking-widest uppercase font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent pulse-slow">
            ✨ Trusted by Industry Leaders ✨
          </p>
        </div>

        <h3 className="text-2xl md:text-3xl font-bold mb-12 bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent fade-up">
          Powering the World's Most Innovative Brands
        </h3>

        {/* ── Carousel ── */}
        <div
          className="carousel-viewport relative overflow-hidden"
          onMouseEnter={() => {
            isPausedRef.current = true;
            trackRef.current?.classList.add("paused");
          }}
          onMouseLeave={() => {
            isPausedRef.current = false;
            trackRef.current?.classList.remove("paused");
          }}
        >
          {/* Fade masks */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-40 z-10"
            style={{ background: "linear-gradient(to right, #040816 0%, transparent 100%)" }} />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-40 z-10"
            style={{ background: "linear-gradient(to left, #040816 0%, transparent 100%)" }} />

          {/* ✦ Center spotlight beam — purely decorative ✦ */}
          <div
            className="center-beam pointer-events-none absolute top-0 bottom-0 z-20"
            style={{
              left: "50%",
              transform: "translateX(-50%)",
              width: CARD_W + 40,
              background: "linear-gradient(to bottom, transparent, rgba(100,140,255,0.10) 30%, rgba(100,140,255,0.18) 50%, rgba(100,140,255,0.10) 70%, transparent)",
              borderLeft: "1px solid rgba(100,160,255,0.12)",
              borderRight: "1px solid rgba(100,160,255,0.12)",
            }}
          />
          {/* Tiny center indicator dot */}
          <div
            className="pointer-events-none absolute z-20 bottom-0"
            style={{
              left: "50%",
              transform: "translateX(-50%)",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "rgba(120,180,255,0.5)",
              boxShadow: "0 0 8px 2px rgba(100,160,255,0.4)",
            }}
          />

          {/* Track */}
          <div
            ref={trackRef}
            className="ticker-track flex py-6"
            style={{ gap: GAP, width: singleSetWidth * 2 }}
          >
            {SCROLL_ITEMS.map((brand, index) => (
              <div
                key={index}
                ref={(el) => (cardRefs.current[index] = el)}
                className="relative flex-shrink-0"
                style={{ width: CARD_W }}
              >
                {/* Outer glow (driven by rAF) */}
                <div
                  className="spotlight-glow absolute inset-0 rounded-2xl blur-xl"
                  style={{
                    opacity: 0,
                    background: "linear-gradient(135deg,rgba(59,91,255,.4),rgba(139,92,246,.4))",
                  }}
                />

                {/* Card */}
                <div
                  className="spotlight-card relative h-[110px] flex flex-col items-center justify-center rounded-2xl border overflow-hidden"
                  style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  {/* Logo */}
                  <div className="spotlight-logo relative z-10" style={{ opacity: 0.55 }}>
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="h-9 object-contain"
                    />
                  </div>

                  {/* Name + description — revealed when card is centered */}
                  <div
                    className="spotlight-text absolute bottom-3 left-0 right-0 text-center z-10"
                    style={{ opacity: 0, transform: "translateY(8px)" }}
                  >
                    <p className="text-xs font-semibold text-white">{brand.name}</p>
                    <p className="text-[10px] text-blue-300">{brand.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { value: "500+", label: "Enterprise Clients", icon: "🏢" },
            { value: "99.9%", label: "Uptime Guarantee", icon: "⚡" },
            { value: "24/7", label: "Premium Support", icon: "🎧" },
          ].map((stat, i) => (
            <div
              key={i}
              className="group relative cursor-pointer fade-up"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div
                className="relative p-4 rounded-xl border border-white/10 transition-all duration-300 group-hover:border-white/25 group-hover:-translate-y-1"
                style={{ background: "rgba(255,255,255,.05)", backdropFilter: "blur(8px)" }}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-white/90 group-hover:text-white transition-colors">
                  {stat.value}
                </div>
                <div className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rating */}
        <div className="mt-12 flex items-center justify-center gap-2 text-xs">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3 h-3 text-yellow-400/80" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-white/60">Rated 4.9/5 by 2,000+ customers</span>
        </div>
      </div>
    </section>
  );
}

export default TrustedBy;