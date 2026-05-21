import ringImage from "../assets/images/Visual.png";
import dashboardImage from "../assets/images/Visualreports1.png";
import graphImage1 from "../assets/images/Visualreports3.png";

const bars = [40, 60, 45, 80, 65, 95, 75];

function Verticals() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "7rem 1.5rem",
        background: "#00040f",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      }}
    >
      {/* ── Background grid ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(30,64,175,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(30,64,175,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 100%)",
      }}/>

      {/* ── Ambient blobs ── */}
      <div style={{
        position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
        width: 700, height: 400,
        background: "radial-gradient(ellipse, rgba(29,64,220,0.2) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }}/>
      <div style={{
        position: "absolute", bottom: 0, right: "10%",
        width: 340, height: 340,
        background: "radial-gradient(circle, rgba(79,70,229,0.14) 0%, transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none",
      }}/>

      <div style={{ position: "relative", zIndex: 10, maxWidth: 1180, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          {/* Eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 14px", borderRadius: 999, marginBottom: "1.25rem",
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.18)",
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "#3b82f6", boxShadow: "0 0 7px #3b82f6",
            }}/>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.13em",
              color: "#60a5fa", textTransform: "uppercase",
            }}>Industry Solutions</span>
          </div>

          <h2 style={{
            fontSize: "clamp(2.2rem,5vw,3.1rem)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.07,
            color: "#f1f5f9",
            margin: 0,
          }}>
            Verticals
          </h2>

          <p style={{
            marginTop: "1.1rem",
            fontSize: "clamp(1rem,2.2vw,1.35rem)",
            lineHeight: 1.45,
            color: "rgba(148,163,184,0.7)",
            maxWidth: 660,
            marginLeft: "auto", marginRight: "auto",
          }}>
            Whether you're a local store or a global brand, we have a
            specialised AI agent for every business.
          </p>
        </div>

        {/* ── Grid top ── */}
        <div style={{
          marginTop: "3.5rem",
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "0.9fr 1.6fr",
        }}
          className="vt-top-grid"
        >

          {/* Left — Shopify */}
          <div className="vt-card vt-shopify">
            {/* Inner glow */}
            <div className="vt-inner-glow" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(59,130,246,0.12) 0%, transparent 70%)" }}/>

            {/* Corner accent line */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0,
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)",
            }}/>

            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 380, padding: "1.5rem" }}>
              {/* Image */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <div className="vt-ring-glow"/>
                <img
                  src={ringImage}
                  alt="Shopify Store"
                  className="vt-ring-img"
                  style={{ width: "75%", maxWidth: 200, objectFit: "contain" }}
                />
              </div>

              {/* Text */}
              <div style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                    textTransform: "uppercase", color: "#3b82f6",
                  }}>Shopify Store</span>
                  <span style={{
                    padding: "2px 8px", borderRadius: 999,
                    background: "rgba(59,130,246,0.12)",
                    border: "1px solid rgba(59,130,246,0.2)",
                    fontSize: 9, color: "#60a5fa", fontWeight: 600,
                  }}>eCommerce</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#e2e8f0", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                  Sync, Target & Sell
                </h3>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(148,163,184,0.6)", maxWidth: 230, margin: 0 }}>
                  Sync your catalog and let AI generate high-converting Meta product ads instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Right — Local Service */}
          <div className="vt-card" style={{ position: "relative", overflow: "hidden", borderRadius: 14 }}>
            <img
              src={dashboardImage}
              alt="Local Service dashboard"
              style={{ width: "100%", minHeight: 405, objectFit: "cover", display: "block" }}
            />
            {/* Gradient overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, #00040f 0%, rgba(0,4,15,0.8) 35%, rgba(0,4,15,0.1) 65%, transparent 100%)",
            }}/>
            {/* Top edge */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)",
            }}/>

            <div style={{ position: "absolute", bottom: "1.75rem", left: "1.75rem", zIndex: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "#818cf8",
                }}>Local Service</span>
                <span style={{
                  padding: "2px 8px", borderRadius: 999,
                  background: "rgba(129,140,248,0.12)",
                  border: "1px solid rgba(129,140,248,0.22)",
                  fontSize: 9, color: "#a5b4fc", fontWeight: 600,
                }}>Search Ads</span>
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 700, color: "#e2e8f0", margin: "0 0 8px", letterSpacing: "-0.025em" }}>
                Dominate Local Search
              </h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "rgba(148,163,184,0.65)", maxWidth: 420, margin: 0 }}>
                Rank higher locally and capture leads with AI-optimized Google Search Ads.
              </p>
            </div>
          </div>
        </div>

        {/* ── Bottom — SaaS ── */}
        <div style={{ maxWidth: "65%", margin: "1rem auto 0" }} className="vt-bottom-wrap">
          <div className="vt-card vt-saas">
            <div className="vt-inner-glow" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(34,211,238,0.08) 0%, transparent 65%)" }}/>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.45), transparent)",
            }}/>

            <div style={{ position: "relative", zIndex: 10, padding: "1.5rem" }}>

              {/* Chart */}
              <div style={{ position: "relative", height: 160, display: "flex", alignItems: "flex-end", gap: 5 }}>
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="vt-bar"
                    style={{
                      flex: 1,
                      height: `${h}%`,
                      borderRadius: "4px 4px 2px 2px",
                      background: "linear-gradient(to top, #1d4ed8, #38bdf8)",
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                ))}

                {/* Trend line */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  <svg style={{ width: "100%", height: "100%", overflow: "visible" }}>
                    <defs>
                      <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#818cf8"/>
                        <stop offset="100%" stopColor="#22d3ee"/>
                      </linearGradient>
                    </defs>
                    <polyline
                      fill="none"
                      stroke="url(#lineGrad)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points="0,140 60,100 120,120 180,70 240,95 300,40 360,80"
                    />
                    {/* Dots */}
                    {[[0,140],[60,100],[120,120],[180,70],[240,95],[300,40],[360,80]].map(([x,y],i) => (
                      <circle key={i} cx={x} cy={y} r="3" fill="#818cf8" opacity="0.9"/>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Stats row */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                margin: "1.25rem 0 1.1rem",
                padding: "1rem 1.25rem",
                borderRadius: 12,
                background: "rgba(15,23,60,0.55)",
                border: "1px solid rgba(59,130,246,0.12)",
              }}>
                {[
                  { val: "+240%", label: "Growth", color: "#3b82f6" },
                  { val: "3.2x",  label: "ROI",    color: "#818cf8" },
                  { val: "89%",   label: "Conversion", color: "#22d3ee" },
                ].map(({ val, label, color }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 20, fontWeight: 700, color, letterSpacing: "-0.03em", margin: 0 }}>{val}</p>
                    <p style={{ fontSize: 10, color: "rgba(148,163,184,0.5)", margin: "3px 0 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Text */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                    textTransform: "uppercase", color: "#22d3ee",
                  }}>SaaS &amp; Tech</span>
                  <span style={{
                    padding: "2px 8px", borderRadius: 999,
                    background: "rgba(34,211,238,0.1)",
                    border: "1px solid rgba(34,211,238,0.2)",
                    fontSize: 9, color: "#67e8f9", fontWeight: 600,
                  }}>Growth Loop</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#e2e8f0", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                  Scale Recurring Revenue
                </h3>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(148,163,184,0.6)", maxWidth: 320, margin: 0 }}>
                  Build scalable growth loops for your recurring revenue with precision targeting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .vt-card {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(59,130,246,0.1);
          background: linear-gradient(135deg, rgba(15,23,60,0.72) 0%, rgba(7,11,30,0.88) 100%);
          backdrop-filter: blur(16px);
          transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
        }
        .vt-card:hover {
          transform: translateY(-4px);
          border-color: rgba(59,130,246,0.28);
          box-shadow: 0 20px 55px rgba(0,0,0,0.55), 0 0 0 1px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .vt-inner-glow {
          position: absolute; inset: 0;
          pointer-events: none;
          opacity: 0; transition: opacity 0.4s ease;
        }
        .vt-card:hover .vt-inner-glow { opacity: 1; }

        .vt-ring-glow {
          position: absolute;
          width: 160px; height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%);
          filter: blur(30px);
          opacity: 0; transition: opacity 0.5s ease;
        }
        .vt-card:hover .vt-ring-glow { opacity: 1; }

        .vt-ring-img {
          transition: transform 0.7s cubic-bezier(0.34,1.56,0.64,1), filter 0.5s ease;
          filter: drop-shadow(0 0 0px #3b82f6);
        }
        .vt-card:hover .vt-ring-img {
          transform: rotate(18deg) scale(1.1);
          filter: drop-shadow(0 0 18px rgba(59,130,246,0.5));
        }

        @keyframes growBar {
          from { transform: scaleY(0); transform-origin: bottom; }
          to   { transform: scaleY(1); transform-origin: bottom; }
        }
        .vt-bar {
          animation: growBar 0.7s ease forwards;
          transform: scaleY(0);
          transform-origin: bottom;
          transition: filter 0.3s ease;
        }
        .vt-card:hover .vt-bar {
          filter: brightness(1.25) saturate(1.2);
        }

        @media (max-width: 900px) {
          .vt-top-grid { grid-template-columns: 1fr !important; }
          .vt-bottom-wrap { max-width: 100% !important; }
        }
      `}</style>
    </section>
  );
}

export default Verticals;