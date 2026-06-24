import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function LaunchCTA() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  // Intersection Observer for scroll effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Mouse move parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Generate particles on mount - ONLY in center, VERY SMALL
  useEffect(() => {
    const newParticles = Array.from({ length: 100 }, () => {
      const x = 50 + (Math.random() - 0.5) * 30;
      const y = 50 + (Math.random() - 0.5) * 30;
      return {
        id: Math.random(),
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
        size: Math.random() * 0.5 + 0.1,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
        color: Math.random() > 0.1 ? '#0665ff' : '#22d3ee',
      };
    });
    setParticles(newParticles);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-32 transition-opacity duration-1000 ease-out"
      style={{
        background: 'black',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
      }}
    >
      {/* Animated tiny circles - ONLY in center */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            background: particle.color,
            opacity: isVisible ? (0.1 + Math.random() * 0.2) : 0,
            boxShadow: `0 0 2px ${particle.color}15`,
            transition: `opacity ${1.5 + Math.random() * 1}s ease-out ${Math.random() * 0.5}s`,
          }}
        />
      ))}

      {/* Super tiny dots - ONLY in center */}
      {Array.from({ length: 80 }, (_, i) => {
        const x = 50 + (Math.random() - 0.5) * 25;
        const y = 50 + (Math.random() - 0.5) * 25;
        return {
          id: `extra-${i}`,
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y)),
          size: Math.random() * 0.3 + 0.05,
          duration: Math.random() * 25 + 15,
          delay: Math.random() * 8,
        };
      }).map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            background: '#0665ff',
            opacity: isVisible ? (0.06 + Math.random() * 0.1) : 0,
            transition: `opacity ${1.8 + Math.random() * 1.2}s ease-out ${0.3 + Math.random() * 0.6}s`,
          }}
        />
      ))}

      {/* Micro dots - ONLY in very center */}
      {Array.from({ length: 60 }, (_, i) => {
        const x = 50 + (Math.random() - 0.5) * 20;
        const y = 50 + (Math.random() - 0.5) * 20;
        return {
          id: `micro-${i}`,
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y)),
          size: 0.1 + Math.random() * 0.2,
          duration: Math.random() * 30 + 20,
          delay: Math.random() * 10,
        };
      }).map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            background: '#0665ff',
            opacity: isVisible ? (0.04 + Math.random() * 0.06) : 0,
            transition: `opacity ${2 + Math.random() * 1.5}s ease-out ${0.5 + Math.random() * 0.8}s`,
          }}
        />
      ))}

      {/* Background Glow with mouse follow - Blue 75% */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-1000 ease-out"
        style={{
          transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 1.2s ease-out 0.2s, transform 0.5s ease-out',
        }}
      >
        <div 
          className="rounded-full blur-[140px]"
          style={{
            width: '550px',
            height: '550px',
            background: 'rgba(6, 101, 255, 0.75)',
          }}
        />
      </div>

      {/* Secondary Glow - Cyan 75% (subtler) */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-1000 ease-out"
        style={{
          transform: `translate(${mousePosition.x * -10}px, ${mousePosition.y * -10}px)`,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 1.4s ease-out 0.3s, transform 0.7s ease-out',
        }}
      >
        <div 
          className="rounded-full blur-[100px]"
          style={{
            width: '300px',
            height: '300px',
            background: 'rgba(34, 211, 238, 0.5)',
          }}
        />
      </div>

      {/* Side accent glow with mouse follow - merged with edges */}
      <div
        className="pointer-events-none absolute transition-all duration-1000 ease-out"
        style={{
          transform: `translate(${mousePosition.x * -25}px, ${mousePosition.y * -15}px)`,
          width: 300,
          height: 200,
          borderRadius: "50%",
          bottom: '-50px',
          left: '-50px',
          background:
            "radial-gradient(ellipse, rgba(6,101,255,0.2) 0%, transparent 70%)",
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 1.6s ease-out 0.4s, transform 0.7s ease-out',
        }}
      />
      
      <div
        className="pointer-events-none absolute transition-all duration-1000 ease-out"
        style={{
          transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * -10}px)`,
          width: 250,
          height: 250,
          borderRadius: "50%",
          top: '-50px',
          right: '-50px',
          background:
            "radial-gradient(ellipse, rgba(6,101,255,0.15) 0%, transparent 70%)",
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 1.8s ease-out 0.5s, transform 0.7s ease-out',
        }}
      />

      {/* Circular Rings with mouse interaction */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="rounded-full border transition-all duration-1000 ease-out"
          style={{
            width: "700px",
            height: "700px",
            borderColor: 'rgba(6,101,255,0.08)',
            transform: `translate(${mousePosition.x * 8}px, ${mousePosition.y * 8}px) scale(${1 + mousePosition.x * 0.02})`,
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 1s ease-out 0.1s, transform 0.5s ease-out',
          }}
        />
        <div
          className="absolute rounded-full border transition-all duration-1000 ease-out"
          style={{
            width: "500px",
            height: "500px",
            borderColor: 'rgba(6,101,255,0.06)',
            transform: `translate(${mousePosition.x * -6}px, ${mousePosition.y * -6}px) scale(${1 + mousePosition.x * 0.015})`,
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 1.2s ease-out 0.2s, transform 0.6s ease-out',
          }}
        />
        <div
          className="absolute rounded-full border transition-all duration-1000 ease-out"
          style={{
            width: "300px",
            height: "300px",
            borderColor: 'rgba(34,211,238,0.04)',
            transform: `translate(${mousePosition.x * 4}px, ${mousePosition.y * 4}px) scale(${1 + mousePosition.x * 0.01})`,
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 1.4s ease-out 0.3s, transform 0.7s ease-out',
          }}
        />
      </div>

      {/* Grid overlay with animation */}
      <div
        className="pointer-events-none absolute inset-0 animate-slow-pulse"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,101,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(6,101,255,0.02) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 50% at 50% 50%, black 0%, transparent 70%)",
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 1.5s ease-out 0.3s',
        }}
      />

      <div ref={contentRef} className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Heading */}
        <h2 className="text-[52px] md:text-[72px] font-bold leading-[1.1] tracking-[-0.04em]">
          <span 
            className="block text-white"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(-50px)',
              transition: 'opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s',
            }}
          >
            Ready to launch
          </span>

          <span
            className="block bg-[linear-gradient(180deg,#ffffff_0%,#cfd5ff_45%,#8b93ff_100%)] bg-clip-text text-transparent"
            style={{
              fontFamily: "'Instrument Serif', serif",
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
              transition: 'opacity 0.8s ease-out 0.5s, transform 0.8s ease-out 0.5s',
            }}
          >
            Smarter Campaigns?
          </span>
        </h2>

        {/* Subtitle */}
        <p 
          className="mt-8 text-lg text-white/70 max-w-2xl mx-auto"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s ease-out 0.7s, transform 0.8s ease-out 0.7s',
          }}
        >
          Generate your first AI-powered advertising strategy in minutes
        </p>

        {/* Buttons */}
        <div 
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s ease-out 0.9s, transform 0.8s ease-out 0.9s',
          }}
        >
          <Link to="/login">
            <button className="group relative flex items-center gap-2 rounded-[10px] border px-[28px] py-[14px] text-[15px] font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden">
              <span
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(140deg, #0665ff 75%, #22d3ee 100%)",
                }}
              />
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
          </Link>

          <Link to="/demo">
            <button className="group flex items-center gap-2 rounded-[10px] border px-[28px] py-[14px] text-[15px] text-[rgba(200,220,255,0.8)] transition-all duration-300 hover:bg-white/[0.12] hover:-translate-y-1 hover:border-white/20">
              <span
                className="flex h-[20px] w-[20px] flex-shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                <svg width="8" height="10" viewBox="0 0 7 8" fill="none">
                  <path
                    d="M1 1l5 3-5 3V1z"
                    fill="rgba(200,220,255,0.85)"
                  />
                </svg>
              </span>
              Watch live demo
            </button>
          </Link>
        </div>

        {/* Bottom Text with hover effects */}
        <div 
          className="mt-10"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s ease-out 1.1s, transform 0.8s ease-out 1.1s',
          }}
        >
          <p className="text-white/75 text-lg leading-relaxed">
            Join{" "}
            <span className="relative group/inline inline-block">
              <span className="font-medium text-[rgba(190,210,255,0.85)] hover:text-white transition-colors cursor-pointer">
                1,000+ businesses
              </span>
              <span className="absolute bottom-0 left-0 w-full h-px bg-blue-400/50 scale-x-0 group-hover/inline:scale-x-100 transition-transform origin-left" />
            </span>{" "}
            using Wheedle to plan, launch, and optimize winning ad campaigns
            <br />
            <span className="text-white/55 inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50 animate-pulse" />
              3 days free trial • No credit card required
            </span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          75% { transform: translateY(10px) translateX(-5px); }
        }
        
        @keyframes slowPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        
        .animate-float {
          animation: float infinite ease-in-out;
        }
        
        .animate-slow-pulse {
          animation: slowPulse 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

export default LaunchCTA;