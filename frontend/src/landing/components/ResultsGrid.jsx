import researchImage from "../assets/images/research.png";
import targetingImage from "../assets/images/targeting.png";
import launchImage from "../assets/images/launch.png";
import analyticsImage from "../assets/images/analytics.png";

const steps = [
  {
    num: "01",
    label: "Deep Research",
    desc: "Our AI analyzes your site and competitors to find high-intent audiences and winning angles.",
    img: researchImage,
    color: "#3b82f6",
    colorDim: "rgba(59,130,246,0.12)",
    colorBorder: "rgba(59,130,246,0.25)",
    colorGlow: "rgba(59,130,246,0.07)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
        <path d="M11 8v6M8 11h6"/>
      </svg>
    ),
    reverse: false,
  },
  {
    num: "02",
    label: "Strategic Targeting",
    desc: "Stop wasting budget on wrong clicks. Reach the exact humans who are ready to buy.",
    img: targetingImage,
    color: "#818cf8",
    colorDim: "rgba(129,140,248,0.12)",
    colorBorder: "rgba(129,140,248,0.25)",
    colorGlow: "rgba(129,140,248,0.07)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    reverse: true,
  },
  {
    num: "03",
    label: "Instant Launch",
    desc: "Deploy multi-channel campaigns across Meta and Google in less than 60 seconds.",
    img: launchImage,
    color: "#22d3ee",
    colorDim: "rgba(34,211,238,0.12)",
    colorBorder: "rgba(34,211,238,0.25)",
    colorGlow: "rgba(34,211,238,0.07)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    reverse: false,
  },
  {
    num: "04",
    label: "Revenue Growth Engine",
    desc: "Turn your marketing into a predictable growth system with autonomous optimization & scaling.",
    img: analyticsImage,
    color: "#34d399",
    colorDim: "rgba(52,211,153,0.12)",
    colorBorder: "rgba(52,211,153,0.25)",
    colorGlow: "rgba(52,211,153,0.07)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/>
        <path d="m19 9-5 5-4-4-3 3"/>
      </svg>
    ),
    reverse: true,
  },
];

export default function ResultsGrid() {
  return (
    <section
      style={{
        position: "relative",
        padding: "7rem 0",
        background: "#00040f",
        overflow: "hidden",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      }}
    >
      {/* ── Deep background grid ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(30,64,175,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,64,175,0.045) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      {/* ── Ambient light blobs ── */}
      <div style={{
        position: "absolute", top: "-60px", left: "5%",
        width: 480, height: 480,
        background: "radial-gradient(circle, rgba(30,64,175,0.22) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }}/>
      <div style={{
        position: "absolute", bottom: "-80px", right: "5%",
        width: 420, height: 420,
        background: "radial-gradient(circle, rgba(79,70,229,0.18) 0%, transparent 70%)",
        filter: "blur(70px)", pointerEvents: "none",
      }}/>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 600, height: 300,
        background: "radial-gradient(ellipse, rgba(15,23,42,0) 0%, rgba(6,15,40,0.6) 100%)",
        pointerEvents: "none",
      }}/>

      {/* ── Content wrapper ── */}
      <div style={{ position: "relative", zIndex: 10, maxWidth: 940, margin: "0 auto", padding: "0 1.5rem" }}>

        {/* ── Section header ── */}
        <div style={{ textAlign: "center", marginBottom: "4.5rem" }}>
          {/* Eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            background: "rgba(59,130,246,0.1)",
            border: "1px solid rgba(59,130,246,0.2)",
            marginBottom: "1.25rem",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#3b82f6",
              boxShadow: "0 0 8px #3b82f6",
            }}/>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "#60a5fa", textTransform: "uppercase" }}>
              How it works
            </span>
          </div>

          <h2 style={{
            fontSize: "clamp(2.2rem, 5vw, 3.25rem)",
            fontWeight: 700,
            letterSpacing: "-0.035em",
            lineHeight: 1.08,
            color: "#f1f5f9",
            margin: 0,
          }}>
            Results That{" "}
            <span style={{
              position: "relative",
              display: "inline-block",
            }}>
              <span style={{
                background: "linear-gradient(135deg, #0665ff 50%, #22d3ee 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Never Stop</span>
              {/* underline decoration */}
              <span style={{
                position: "absolute",
                left: 0, bottom: -4, right: 0,
                height: 2,
                background: "linear-gradient(90deg, #3b82f6, #818cf8, #22d3ee)",
                borderRadius: 2,
                opacity: 0.5,
              }}/>
            </span>
          </h2>

          <p style={{
            marginTop: "1rem",
            color: "rgba(148,163,184,0.65)",
            fontSize: 14,
            maxWidth: 340,
            marginLeft: "auto", marginRight: "auto",
            lineHeight: 1.75,
            letterSpacing: "0.01em",
          }}>
            Wheedle.ai powers every stage of your advertising growth loop with precision AI
          </p>
        </div>

        {/* ── Step cards ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {steps.map(({ num, label, desc, img, color, colorDim, colorBorder, colorGlow, icon, reverse }) => (
            <StepCard
              key={num}
              num={num} label={label} desc={desc} img={img}
              color={color} colorDim={colorDim} colorBorder={colorBorder} colorGlow={colorGlow}
              icon={icon} reverse={reverse}
            />
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .rg-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 2rem 2rem;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(15,23,60,0.7) 0%, rgba(7,11,30,0.85) 100%);
          border: 1px solid rgba(59,130,246,0.1);
          backdrop-filter: blur(20px);
          transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
          overflow: hidden;
        }
        .rg-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: var(--card-glow);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .rg-card:hover {
          transform: translateY(-3px);
          border-color: var(--card-border);
          box-shadow: 0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px var(--card-border), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .rg-card:hover::before { opacity: 1; }
        .rg-card:hover .rg-icon-wrap { transform: scale(1.08) rotate(4deg); }
        .rg-card:hover .rg-img img { transform: scale(1.07); }
        .rg-card:hover .rg-title { letter-spacing: -0.025em; }
        .rg-sweep {
          position: absolute; inset: 0; overflow: hidden; border-radius: 20px; pointer-events: none;
        }
        .rg-sweep::after {
          content: "";
          position: absolute;
          top: 0; left: -140%;
          width: 120%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
          transform: skewX(-20deg);
          transition: left 0.9s ease;
        }
        .rg-card:hover .rg-sweep::after { left: 140%; }

        .rg-icon-wrap {
          flex-shrink: 0;
          width: 72px; height: 72px;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          background: var(--icon-bg);
          border: 1px solid var(--icon-border);
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }

        .rg-divider {
          flex-shrink: 0;
          width: 1px; height: 52px;
          background: linear-gradient(to bottom, transparent, rgba(59,130,246,0.15), transparent);
        }

        .rg-text { flex: 1; min-width: 0; }
        .rg-num {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          margin-bottom: 6px;
        }
        .rg-title {
          font-size: 1.125rem; font-weight: 700;
          color: #e2e8f0;
          letter-spacing: -0.03em;
          margin-bottom: 6px;
          transition: letter-spacing 0.3s ease;
        }
        .rg-desc {
          font-size: 13.5px;
          color: rgba(148,163,184,0.6);
          line-height: 1.75;
          max-width: 400px;
        }

        .rg-img {
          flex-shrink: 0;
          width: 190px; height: 118px;
          border-radius: 12px;
          border: 1px solid rgba(59,130,246,0.12);
          overflow: hidden;
          background: rgba(15,23,60,0.5);
        }
        .rg-img img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        /* Number badge in corner */
        .rg-badge {
          position: absolute;
          top: 1.25rem; right: 1.5rem;
          font-size: 4.5rem;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.06em;
          opacity: 0.04;
          color: #fff;
          pointer-events: none;
          user-select: none;
        }

        @media (max-width: 700px) {
          .rg-card { flex-direction: column !important; align-items: flex-start; padding: 1.5rem; }
          .rg-divider { display: none; }
          .rg-img { width: 100%; height: 140px; }
          .rg-badge { display: none; }
        }
      `}</style>
    </section>
  );
}

function StepCard({ num, label, desc, img, color, colorDim, colorBorder, colorGlow, icon, reverse }) {
  return (
    <div
      className="rg-card"
      style={{
        flexDirection: reverse ? "row-reverse" : "row",
        "--card-border": colorBorder,
        "--card-glow": `radial-gradient(ellipse at ${reverse ? "right" : "left"} center, ${colorGlow} 0%, transparent 65%)`,
        "--icon-bg": colorDim,
        "--icon-border": colorBorder,
      }}
    >
      {/* Sweep shimmer */}
      <div className="rg-sweep" />

      {/* Large ghost number */}
      <span className="rg-badge">{num}</span>

      {/* Icon */}
      <div className="rg-icon-wrap" style={{ color }}>
        {icon}
      </div>

      {/* Divider */}
      <div className="rg-divider" />

      {/* Text */}
      <div className="rg-text">
        <p className="rg-num" style={{ color }}>{`Step ${num}`}</p>
        <h3 className="rg-title">{label}</h3>
        <p className="rg-desc">{desc}</p>
      </div>

      {/* Image */}
      <div className="rg-img">
        <img src={img} alt={label} />
      </div>
    </div>
  );
}