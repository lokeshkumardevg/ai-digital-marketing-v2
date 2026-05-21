import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Button from "./Button";

function Hero() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [typedText, setTypedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [particles, setParticles] = useState([]);
  const heroRef = useRef(null);
  
  const fullText = "Start scaling with AI.";

  // Typing animation effect
  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
      }
    }, 80);
    return () => clearInterval(typingInterval);
  }, []);

  // Mouse move parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Generate particles on mount
  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, () => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleDemoClick = () => {
    // Add demo video modal or redirect logic here
    console.log("Play demo");
  };

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden px-6 pb-28 pt-[140px] lg:pt-[160px] h-screen "
    >
      {/* Animated particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-blue-400/20 pointer-events-none animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Custom cursor */}
      {/* <div
        className="fixed pointer-events-none z-50 rounded-full mix-blend-screen"
        style={{
          left: mousePosition.x * 50 + window.innerWidth / 2,
          top: mousePosition.y * 50 + window.innerHeight / 2,
          transform: "translate(-50%, -50%)",
          width: "40px",
          height: "40px",
          background: "radial-gradient(circle, rgba(59,91,255,0.4) 0%, rgba(59,91,255,0) 70%)",
          transition: "all 0.1s ease-out",
        }}
      /> */}
      <div
        className="fixed pointer-events-none z-50 rounded-full bg-blue-500/20"
        style={{
          left: mousePosition.x * 50 + window.innerWidth / 2,
          top: mousePosition.y * 50 + window.innerHeight / 2,
          transform: "translate(-50%, -50%)",
          width: "8px",
          height: "8px",
          transition: "all 0.05s ease-out",
        }}
      />

      {/* Grid overlay with animation */}
      <div
        className="pointer-events-none absolute inset-0 animate-slow-pulse"
        style={{
          backgroundImage:
            "linear-gradient(rgba(80,120,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(80,120,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 70%)",
          marginTop: "70px",
        }}
      />

      {/* Main glow with mouse follow */}
      <div
        className="pointer-events-none absolute left-1/2 transition-transform duration-500 ease-out"
        style={{
          transform: `translate(calc(-50% + ${mousePosition.x * 20}px), ${mousePosition.y * 20}px)`,
          width: 860,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(41,82,255,0.35) 0%, rgba(41,82,255,0.08) 50%, transparent 70%)",
          filter: "blur(0px)",
        }}
      />

      {/* Side accent glow with mouse follow */}
      <div
        className="pointer-events-none absolute bottom-0 left-[30%] transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -20}px)`,
          width: 320,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(120,80,255,0.14) 0%, transparent 70%)",
        }}
      />

      {/* Interactive concentric rings */}
      {[
        { top: 40, w: 580, h: 290, scale: 1 },
        { top: 75, w: 440, h: 220, scale: 0.8 },
        { top: 110, w: 300, h: 150, scale: 0.6 },
      ].map((r, i) => (
        <div
          key={i}
          className="pointer-events-none absolute left-1/2 rounded-full transition-all duration-500 ease-out animate-pulse-ring"
          style={{
            transform: `translate(calc(-50% + ${mousePosition.x * 10 * (i + 1)}px), ${mousePosition.y * 10 * (i + 1)}px) scale(${1 + mousePosition.x * 0.05})`,
            top: r.top,
            width: r.w,
            height: r.h,
            border: "1px solid rgba(80,120,255,0.15)",
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}

      <div className="relative mx-auto flex max-w-[820px] flex-col items-center text-center animate-fade-in-up">
        {/* Badge with hover effect */}
        <div
          className="mb-7 inline-flex items-center gap-2 rounded-full border px-3 py-[5px] transition-all duration-300 hover:scale-105 hover:border-blue-400/50 cursor-pointer group"
          style={{
            background: "rgba(30,55,200,0.22)",
            borderColor: "rgba(80,120,255,0.32)",
          }}
        >
          <span
            className="rounded-full px-[10px] py-[2px] text-[10px] font-semibold uppercase tracking-[0.07em] text-white transition-all group-hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #3B5BFF 50%, #22d3ee 100%)",
            }}
          >
            New
          </span>
          <span className="text-[12px] text-[rgba(180,200,255,0.9)] group-hover:text-white transition-colors">
            Latest integration just arrived
          </span>
        </div>

        {/* Heading with animation */}
        <h1 className="mb-5">
          <span
            className="block text-[44px] font-light leading-none tracking-[-0.045em] text-white/90 sm:text-[64px] lg:text-[72px] animate-slide-in-left"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Stop Spending
          </span>
          <span
            className="block text-[50px] italic leading-[1.1] tracking-[-0.03em] sm:text-[72px] lg:text-[82px] relative"
            style={{
              fontFamily: "'Instrument Serif', serif",
              background:
                "linear-gradient(160deg, #fff 0%, #c0cfff 40%, #8ca0ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {typedText}
            {!isTypingComplete && (
              <span className="absolute top-0 right-0 w-[3px] h-full bg-blue-400 animate-blink ml-1" />
            )}
          </span>
        </h1>

        {/* Description with hover highlight */}
        <p className="mb-9 max-w-[540px] text-[14px] font-light leading-[1.8] text-[rgba(160,185,255,0.7)] sm:text-[15px] animate-fade-in-up animation-delay-200">
          Wheedle.ai is your{" "}
          <span className="relative group/cursor inline-block">
            <span className="font-medium text-[rgba(200,220,255,0.85)] transition-all cursor-pointer hover:text-blue-300">
              autonomous marketing department
            </span>
            <span className="absolute bottom-0 left-0 w-full h-px bg-blue-400/50 scale-x-0 group-hover/cursor:scale-x-100 transition-transform origin-left" />
          </span>
          . Our AI agents research, design, and manage your Meta &amp; Google
          ads — guaranteeing better ROAS in 5 minutes.
        </p>

        {/* CTAs with enhanced interactions */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4 animate-fade-in-up animation-delay-400">
<button
  onClick={handleRegisterClick}
  className="group relative flex items-center gap-2 rounded-[10px] border px-[22px] py-[11px] text-[14px] font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
  style={{
    background: "linear-gradient(140deg, #0665ff 75%, #22d3ee 100%)",
    borderColor: "rgba(6,101,255,0.4)",
    boxShadow: "0 4px 24px rgba(6,101,255,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
  }}
>
  <span className="relative z-10">Start 3-day free trial</span>
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className="relative z-10 transition-transform group-hover:translate-x-1"
  >
    <path
      d="M3 7h8M8 4l3 3-3 3"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
</button>

          <button
            onClick={handleDemoClick}
            className="group flex items-center gap-2 rounded-[10px] border px-[22px] py-[11px] text-[14px] text-[rgba(200,220,255,0.8)] transition-all duration-300 hover:bg-white/[0.12] hover:-translate-y-1 hover:border-white/20"
            style={{
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <span
              className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <svg width="7" height="8" viewBox="0 0 7 8" fill="none">
                <path
                  d="M1 1l5 3-5 3V1z"
                  fill="rgba(200,220,255,0.85)"
                />
              </svg>
            </span>
            Watch live demo
          </button>
        </div>

        {/* Social proof with hover animations */}
        <div className="mt-11 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 animate-fade-in-up animation-delay-600">
          {/* Avatars */}
          <div className="flex items-center">
            {["JK", "MR", "AS", "+"].map((initials, i) => (
              <div
                key={i}
                className="flex h-[28px] w-[28px] items-center justify-center rounded-full border-2 border-[#050918] text-[10px] font-semibold text-white transition-all duration-300 hover:scale-110 hover:z-10 cursor-pointer"
                style={{
                  marginLeft: i === 0 ? 0 : -8,
                  background:
                    i === 0
                      ? "linear-gradient(135deg,#3B5BFF,#8B5CF6)"
                      : i === 1
                      ? "linear-gradient(135deg,#06b6d4,#3B82F6)"
                      : i === 2
                      ? "linear-gradient(135deg,#8B5CF6,#EC4899)"
                      : "linear-gradient(135deg,#F59E0B,#EF4444)",
                }}
              >
                {initials}
              </div>
            ))}
          </div>
          <span className="text-[12.5px] text-[rgba(140,165,255,0.65)]">
            <span className="font-medium text-[rgba(190,210,255,0.85)] hover:text-white transition-colors">
              2,400+
            </span>{" "}
            marketers trust Wheedle
          </span>

          <div className="h-6 w-px bg-white/[0.08]" />

          <div className="text-center group/stats cursor-pointer">
            <div className="text-[14px] font-semibold text-[rgba(200,220,255,0.9)] group-hover/stats:text-white transition-all group-hover/stats:scale-110 inline-block">
              4.8×
            </div>
            <div className="text-[11px] text-[rgba(120,150,255,0.55)] group-hover/stats:text-blue-300 transition-colors">
              avg ROAS lift
            </div>
          </div>

          <div className="h-6 w-px bg-white/[0.08]" />

          <div className="text-center group/stats cursor-pointer">
            <div className="text-[14px] font-semibold text-[rgba(200,220,255,0.9)] group-hover/stats:text-white transition-all group-hover/stats:scale-110 inline-block">
              &lt; 5 min
            </div>
            <div className="text-[11px] text-[rgba(120,150,255,0.55)] group-hover/stats:text-blue-300 transition-colors">
              to first result
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          75% { transform: translateY(10px) translateX(-5px); }
        }
        
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slowPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        .animate-float {
          animation: float infinite ease-in-out;
        }
        
        .animate-pulse-ring {
          animation: pulse-ring 3s ease-in-out infinite;
        }
        
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-slide-in-left {
          animation: slideInLeft 0.6s ease-out forwards;
        }
        
        .animate-slow-pulse {
          animation: slowPulse 4s ease-in-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}

export default Hero;