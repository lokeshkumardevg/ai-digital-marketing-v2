import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

/* ─── SVG Icons ─────────────────────────────────────────── */
const YoutubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);

/* ─── Animated Globe ─────────────────────────────────────── */
const GlobeVisual: React.FC = () => (
  <div style={{ position: 'relative', width: '480px', height: '480px', flexShrink: 0 }}>
    <div style={{
      width: '100%', height: '100%', borderRadius: '50%',
      background: 'radial-gradient(ellipse at 38% 38%, #3730a3 0%, #1e1b4b 45%, #0d0b2a 75%)',
      boxShadow: '0 0 90px rgba(99,102,241,.5), 0 0 180px rgba(79,70,229,.2)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Globe grid */}
      <svg viewBox="0 0 480 480" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .22 }}>
        {[60,110,160,215,270,325,380,425].map(y => (
          <ellipse key={y} cx="240" cy={y} rx="220" ry="17" fill="none" stroke="#a5b4fc" strokeWidth="0.6"/>
        ))}
        {[0,23,46,69,92,115,138,161].map(a => (
          <line key={a} x1="240" y1="22" x2="240" y2="458" stroke="#a5b4fc" strokeWidth="0.5" transform={`rotate(${a} 240 240)`}/>
        ))}
      </svg>
      {/* Neon arcs */}
      <svg viewBox="0 0 480 480" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="arc1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity=".95"/>
            <stop offset="100%" stopColor="#06b6d4" stopOpacity=".95"/>
          </linearGradient>
          <linearGradient id="arc2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity=".7"/>
            <stop offset="100%" stopColor="#ec4899" stopOpacity=".7"/>
          </linearGradient>
          <linearGradient id="arc3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity=".5"/>
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity=".5"/>
          </linearGradient>
        </defs>
        {/* Main pink-cyan arc */}
        <path d="M 75 195 Q 240 55 405 285" fill="none" stroke="url(#arc1)" strokeWidth="2"/>
        {/* Secondary purple arc */}
        <path d="M 115 375 Q 345 185 420 105" fill="none" stroke="url(#arc2)" strokeWidth="1.5"/>
        {/* Tertiary cyan arc */}
        <path d="M 50 285 Q 195 130 380 195" fill="none" stroke="url(#arc3)" strokeWidth="1"/>
        {/* Glowing dots at arc endpoints */}
        {([[75,195],[405,285],[115,375],[420,105],[240,75]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="6" fill="#06b6d4" opacity=".3"/>
            <circle cx={cx} cy={cy} r="3.5" fill="#06b6d4"/>
          </g>
        ))}
      </svg>
    </div>
  </div>
);

/* ─── Main Landing Page ──────────────────────────────────── */
export const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", background: '#04000a', color: '#fff', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #04000a; }
        a { color: inherit; }
        .nl:hover { color: #a78bfa !important; transition: color .2s; }
        .fc:hover { transform: translateY(-5px); border-color: rgba(139,92,246,.4) !important; transition: transform .3s, border-color .3s; }
        .vc:hover { background: rgba(139,92,246,.08) !important; border-color: rgba(139,92,246,.5) !important; transition: all .2s; }
        .sc:hover { transform: translateY(-5px); transition: transform .3s; }
        .pc:hover { transform: translateY(-6px); transition: transform .3s; }
        .gl { animation: gf 6s ease-in-out infinite; }
        @keyframes gf { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        input::placeholder { color: #6b7280; }
        input:focus { outline: none; border-color: rgba(99,102,241,.5) !important; }
      `}</style>

      {/* ════════════ NAVBAR ════════════ */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999, height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px',
        background: scrolled ? 'rgba(4,0,10,.94)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(139,92,246,.1)' : 'none',
        transition: 'all .3s',
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-.3px' }}>
            <span style={{ color: '#a78bfa' }}>Wheedle</span>.ai
          </span>
        </Link>

        <nav style={{ display: 'flex', gap: '26px', alignItems: 'center' }}>
          {[
            { label: 'Product',      arrow: true,  to: '#' },
            { label: 'Team',         arrow: false, to: '#' },
            { label: 'Enterprise',   arrow: false, to: '#' },
            { label: 'Explore',      arrow: true,  to: '#' },
            { label: 'Marketplace',  arrow: false, to: '#' },
            { label: 'Pricing',      arrow: true,  to: '/pricing' },
          ].map(({ label, arrow, to }) => (
            <Link key={label} to={to} className="nl" style={{
              textDecoration: 'none', fontSize: '14px', fontWeight: 500,
              color: location.pathname === to ? '#a78bfa' : '#94a3b8',
              display: 'flex', alignItems: 'center', gap: '3px',
            }}>
              {label}
              {arrow && (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" style={{ opacity: .6 }}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              )}
            </Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search box */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px',
            background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: '8px', fontSize: '13px', color: '#64748b',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span>Search <strong style={{ color: '#94a3b8' }}>Wheedle.ai</strong></span>
            <kbd style={{ background: 'rgba(255,255,255,.08)', borderRadius: '4px', padding: '1px 7px', fontSize: '11px', color: '#94a3b8' }}>/</kbd>
          </div>
          <Link to="/login" style={{ textDecoration: 'none', fontSize: '14px', fontWeight: 500, color: '#94a3b8' }} className="nl">
            Sign in
          </Link>
          <button style={{
            padding: '7px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
            background: 'transparent', border: '1px solid rgba(255,255,255,.3)',
            color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all .2s',
          }}>Sign up</button>
        </div>
      </header>

      {/* ════════════ HERO ════════════ */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '110px 80px 80px',
        background: '#04000a',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* subtle purple blur */}
        <div style={{
          position: 'absolute', top: '15%', left: '-5%',
          width: '700px', height: '700px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(79,70,229,.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>

        {/* Left */}
        <div style={{ flex: 1, maxWidth: '640px', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '62px', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px', marginBottom: '28px' }}>
            <span style={{
              background: 'linear-gradient(90deg, #c026d3 0%, #7c3aed 40%, #2563eb 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Stop Spending</span>
            <br />
            <span style={{ color: '#ffffff' }}>Start Scaling with AI</span>
          </h1>

          <p style={{ fontSize: '17px', color: '#94a3b8', lineHeight: 1.72, maxWidth: '520px', marginBottom: '16px' }}>
            Wheedle.ai is your autonomous marketing department.<br />
            Our AI agents research, design, and manage your Meta &amp;<br />
            Google ads—guaranteeing better ROAS in 5 minutes.
          </p>

          {/* Horizontal divider under subtext (visible in Figma) */}
          <div style={{ width: '280px', height: '1px', background: 'linear-gradient(90deg, rgba(139,92,246,.6), transparent)', marginBottom: '36px' }} />

          <div style={{ display: 'flex', gap: '14px' }}>
            <Link to="/signup" style={{
              textDecoration: 'none', padding: '12px 28px', borderRadius: '50px',
              background: 'transparent', border: '1.5px solid rgba(139,92,246,.7)',
              color: '#c4b5fd', fontWeight: 600, fontSize: '15px',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all .2s',
            }}>
              Try for free
            </Link>
            <button style={{
              padding: '12px 28px', borderRadius: '50px',
              background: 'transparent', border: '1.5px solid rgba(255,255,255,.2)',
              color: '#94a3b8', fontWeight: 600, fontSize: '15px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit',
            }}>
              Watch live demo
            </button>
          </div>
        </div>

        {/* Right: Globe */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div className="gl"><GlobeVisual /></div>
        </div>
      </section>

      {/* ════════════ POWERED BY + AI FLOW ════════════ */}
      <section style={{ padding: '60px 80px 100px', background: '#04000a' }}>
        {/* Partner pills */}
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <p style={{ fontSize: '13px', color: '#334155', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '22px' }}>
            Powered by industry leaders
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {['TikTok', 'Meta', 'Amazon', 'Google'].map(p => (
              <div key={p} style={{
                padding: '9px 32px', borderRadius: '100px',
                border: '1px solid rgba(139,92,246,.38)', color: '#94a3b8', fontSize: '14px', fontWeight: 600,
              }}>{p}</div>
            ))}
          </div>
        </div>

        {/* Flow card with world-map background */}
        <div style={{
          position: 'relative', borderRadius: '24px', overflow: 'hidden',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(14,18,58,.95) 0%, rgba(4,0,10,.95) 100%)',
          padding: '64px 60px 72px',
        }}>
          {/* World map lines */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .06, pointerEvents: 'none' }}
            viewBox="0 0 1280 440" preserveAspectRatio="xMidYMid slice">
            <ellipse cx="640" cy="220" rx="590" ry="200" fill="none" stroke="white" strokeWidth="1"/>
            <ellipse cx="640" cy="220" rx="440" ry="148" fill="none" stroke="white" strokeWidth="0.7"/>
            <ellipse cx="640" cy="220" rx="280" ry="94" fill="none" stroke="white" strokeWidth="0.5"/>
            <line x1="640" y1="20" x2="640" y2="420" stroke="white" strokeWidth="0.5"/>
            <line x1="40" y1="220" x2="1240" y2="220" stroke="white" strokeWidth="0.5"/>
            <line x1="200" y1="40" x2="1080" y2="400" stroke="white" strokeWidth="0.3"/>
            <line x1="1080" y1="40" x2="200" y2="400" stroke="white" strokeWidth="0.3"/>
          </svg>

          <div style={{ textAlign: 'center', marginBottom: '60px', position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '34px', fontWeight: 800, color: '#fff', letterSpacing: '-.5px', marginBottom: '14px' }}>
              Complete AI Marketing Flow
            </h2>
            <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>
              From demo to full automation — your complete AI-powered marketing journey in one platform.
            </p>
          </div>

          {/* 3D Cylinder nodes */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
            {[
              { label: 'Research',  top: '#f9a8d4', bot: '#db2777' },
              { label: 'Strategy',  top: '#d8b4fe', bot: '#9333ea' },
              { label: 'Launch',    top: '#a5b4fc', bot: '#4f46e5' },
              { label: 'Optimize',  top: '#67e8f9', bot: '#0891b2' },
            ].map((n, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Top face */}
                  <div style={{
                    width: '108px', height: '44px', borderRadius: '50%',
                    background: `linear-gradient(130deg, ${n.top} 0%, ${n.bot} 100%)`,
                    boxShadow: `0 0 36px ${n.bot}88`,
                    position: 'relative',
                  }}>
                    {/* Bottom shadow face */}
                    <div style={{
                      position: 'absolute', bottom: '-24px', left: '50%', transform: 'translateX(-50%)',
                      width: '108px', height: '24px', borderRadius: '50%',
                      background: n.bot, opacity: .32,
                    }}/>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginTop: '34px' }}>{n.label}</div>
                </div>
                {i < 3 && (
                  <div style={{
                    width: '120px', height: '3px', marginBottom: '34px', flexShrink: 0,
                    background: `linear-gradient(90deg, ${n.bot}, ${['#9333ea','#4f46e5','#0891b2'][i]})`,
                    boxShadow: `0 0 10px ${n.bot}66`,
                  }}/>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FEATURE CARDS ════════════ */}
      <section style={{ padding: '80px', background: 'linear-gradient(180deg, #040d2e 0%, #071042 50%, #040d2e 100%)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', letterSpacing: '-.5px', marginBottom: '12px' }}>
              Results That Never Stop
            </h2>
            <p style={{ fontSize: '16px', color: '#94a3b8', maxWidth: '520px', margin: '0 auto', lineHeight: 1.65 }}>
              Wheedle powers every stage of your advertising growth loop with precision AI.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}>
            {[
              { title: 'Deep Research',       desc: 'Our AI analyzes your site and competitors to find high-intent audiences and winning angles.',    img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=440&h=220&fit=crop&q=80' },
              { title: 'Strategic Targeting', desc: 'Stop wasting budget on wrong clicks. Reach the exact humans who are ready to buy.',              img: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=440&h=220&fit=crop&q=80' },
              { title: 'Instant Launch',      desc: 'Deploy multi-channel campaigns across Meta and Google in less than 60 sec.',                     img: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=440&h=220&fit=crop&q=80' },
              { title: 'Auto Optimization',   desc: 'Our agents adjust bids, kill losing ads, and scale winners 24/7 while you sleep.',               img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=440&h=220&fit=crop&q=80' },
            ].map((c, i) => (
              <div key={i} className="fc" style={{
                background: 'rgba(6,12,44,.85)', borderRadius: '14px',
                border: '1px solid rgba(99,102,241,.1)', overflow: 'hidden', cursor: 'pointer',
              }}>
                <img src={c.img} alt={c.title} style={{ width: '100%', height: '195px', objectFit: 'cover', display: 'block' }}/>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>{c.title}</h3>
                  <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.65, marginBottom: '16px' }}>{c.desc}</p>
                  <button style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                    padding: '10px', borderRadius: '8px', fontFamily: 'inherit',
                    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)',
                    color: '#94a3b8', fontSize: '13px', cursor: 'pointer',
                  }}>
                    Read More
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17L17 7M7 7h10v10"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ VERTICALS ════════════ */}
      <section style={{ padding: '100px 80px', background: '#04000a' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>Verticals</p>
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', letterSpacing: '-.5px', lineHeight: 1.2, marginBottom: '14px' }}>
              Build Your Vertical<br/>with AI
            </h2>
            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.65, marginBottom: '32px' }}>
              Whether you're a local store or a global brand,<br/>we have a solution tailored for you.
            </p>
            <div style={{ background: 'rgba(15,20,50,.55)', border: '1px solid rgba(139,92,246,.12)', borderRadius: '16px', padding: '22px' }}>
              <svg viewBox="0 0 380 170" style={{ width: '100%', height: '170px' }}>
                <defs>
                  <linearGradient id="cg" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity=".4"/>
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {[34,68,102,136].map(y => (
                  <line key={y} x1="0" y1={y} x2="380" y2={y} stroke="rgba(255,255,255,.05)" strokeWidth="1"/>
                ))}
                <path d="M0 148 L43 130 L86 110 L124 122 L162 90 L200 78 L242 96 L280 58 L323 44 L380 18 L380 170 L0 170 Z" fill="url(#cg)"/>
                <path d="M0 148 L43 130 L86 110 L124 122 L162 90 L200 78 L242 96 L280 58 L323 44 L380 18" fill="none" stroke="#06b6d4" strokeWidth="2.5"/>
                {([[0,148],[86,110],[162,90],[280,58],[380,18]] as [number,number][]).map(([x,y],i) => (
                  <circle key={i} cx={x} cy={y} r="4" fill="#06b6d4" stroke="#04000a" strokeWidth="2"/>
                ))}
              </svg>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: '🛍', title: 'E-commerce',   desc: 'Maximize sales and lifetime value with AI-generated product campaigns.' },
              { icon: '🏠', title: 'Real Estate',  desc: 'Generate high-quality buyer and seller leads at scale.' },
              { icon: '📍', title: 'Local Service',desc: 'Rank higher locally and capture leads with AI-optimized Google Search Ads.' },
              { icon: '💻', title: 'SaaS & Tech',  desc: 'Build scalable growth loops for your recurring revenue with precision targeting.' },
            ].map((v, i) => (
              <div key={i} className="vc" style={{
                display: 'flex', alignItems: 'center', gap: '18px',
                padding: '18px 20px', borderRadius: '14px', cursor: 'pointer',
                background: 'rgba(255,255,255,.02)', border: '1px solid rgba(139,92,246,.22)',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0, fontSize: '22px',
                  background: 'rgba(139,92,246,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{v.icon}</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '3px' }}>{v.title}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.55 }}>{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ 3 STEPS ════════════ */}
      <section style={{ padding: '100px 80px', background: '#04000a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '38px', fontWeight: 800, color: '#fff', letterSpacing: '-.5px', marginBottom: '12px' }}>
              Master Wheedle in 3 Steps
            </h2>
            <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '460px', margin: '0 auto', lineHeight: 1.65 }}>
              No expertise required. Our AI agents handle the heavy lifting while you focus on your business.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {[
              { num: '01', title: 'Analyze Your Brand',     color: '#ec4899', border: 'rgba(236,72,153,.4)',    desc: 'Paste your product URL. Our AI performs deep competitive research, identifies your USP, and builds a winning marketing persona instantly.' },
              { num: '02', title: 'Generate & Launch Ads',  color: '#8b5cf6', border: 'rgba(139,92,246,.4)',   desc: "AI writes high-converting copy and designs stunning creatives for Meta and Google. Review, hit launch, and you're live in 60 seconds." },
              { num: '03', title: 'Auto-Scaling Results',   color: '#06b6d4', border: 'rgba(6,182,212,.4)',    desc: 'Our autonomous agents manage your budget 24/7, killing losing ads and scaling winners to ensure you get the highest ROAS possible.' },
            ].map((s, i) => (
              <div key={i} className="sc" style={{
                background: 'rgba(8,10,30,.75)', borderRadius: '18px', padding: '32px 26px',
                border: `1px solid ${s.border}`, borderTop: `3px solid ${s.color}`,
              }}>
                <div style={{ fontSize: '50px', fontWeight: 900, color: s.color, opacity: .22, lineHeight: 1, marginBottom: '16px' }}>{s.num}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>{s.title}</h3>
                <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.7, marginBottom: '20px' }}>{s.desc}</p>
                <button style={{
                  display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px',
                  borderRadius: '8px', fontFamily: 'inherit',
                  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
                  color: '#94a3b8', fontSize: '13px', cursor: 'pointer',
                }}>
                  Read More
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M7 7h10v10"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ PRICING ════════════ */}
      <section style={{ padding: '100px 80px', background: '#04000a' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '38px', fontWeight: 800, color: '#fff', letterSpacing: '-.5px', marginBottom: '12px' }}>
              Sirf Apke Business Ke Liye
            </h2>
            <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>
              Transparent Indian pricing — simple, affordable, and built to scale your brand with AI.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', alignItems: 'stretch' }}>

            {/* STARTER */}
            <div className="pc" style={{
              background: 'rgba(8,10,34,.8)', border: '1px solid rgba(139,92,246,.3)',
              borderRadius: '20px', padding: '32px 24px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>STARTER</div>
              <div style={{ fontSize: '34px', fontWeight: 900, color: '#fff', marginBottom: '6px' }}>Free</div>
              <div style={{ fontSize: '13px', color: '#475569', marginBottom: '24px' }}>Get started, no credit card required</div>
              {['Daily Performance Report', 'Up To ₹50K Ad Spend', 'DigiMarketer Access'].map(f => (
                <div key={f} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ color: '#22c55e', flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>{f}</span>
                </div>
              ))}
              <div style={{ marginTop: '8px' }}>
                <Link to="/signup" style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none', padding: '13px',
                  borderRadius: '10px', background: 'linear-gradient(135deg,#1e1b4b,#312e81)',
                  color: '#fff', fontWeight: 700, fontSize: '15px',
                }}>Start Free Trial</Link>
              </div>
            </div>

            {/* GROWTH */}
            <div className="pc" style={{
              background: 'linear-gradient(160deg,rgba(99,102,241,.18) 0%,rgba(139,92,246,.1) 100%)',
              border: '1px solid rgba(139,92,246,.6)', borderRadius: '20px', padding: '32px 24px',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 0 48px rgba(139,92,246,.18)',
            }}>
              <div style={{
                position: 'absolute', top: '14px', right: '14px',
                background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                borderRadius: '100px', padding: '4px 12px', fontSize: '11px', fontWeight: 700, color: '#fff',
              }}>Most Popular For Scale</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>GROWTH</div>
              <div style={{ fontSize: '34px', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>
                ₹29,999<span style={{ fontSize: '15px', color: '#64748b' }}>/mo</span>
              </div>
              <div style={{ fontSize: '13px', color: '#475569', marginBottom: '24px' }}>For growing businesses</div>
              {[
                { text: 'Text Space Goes Here', ok: true  },
                { text: 'Description Space',    ok: false },
                { text: 'Sample Text Here',     ok: false },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                  {f.ok ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ color: '#22c55e', flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ color: '#ef4444', flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>{f.text}</span>
                </div>
              ))}
              <div style={{ marginTop: '8px' }}>
                <Link to="/pricing" style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none', padding: '13px',
                  borderRadius: '10px', background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)',
                  color: '#fff', fontWeight: 700, fontSize: '15px',
                  boxShadow: '0 4px 22px rgba(79,70,229,.4)',
                }}>Select</Link>
              </div>
            </div>

            {/* ENTERPRISE */}
            <div className="pc" style={{
              background: 'rgba(8,10,34,.8)', border: '1px solid rgba(139,92,246,.3)',
              borderRadius: '20px', padding: '32px 24px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>ENTERPRISE</div>
              <div style={{ fontSize: '34px', fontWeight: 900, color: '#fff', marginBottom: '6px' }}>Custom</div>
              <div style={{ fontSize: '13px', color: '#475569', marginBottom: '24px' }}>Tailored for large teams</div>
              {[
                { text: 'Text Space Goes Here', ok: true  },
                { text: 'Description Space',    ok: false },
                { text: 'Sample Text Here',     ok: true  },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                  {f.ok ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ color: '#22c55e', flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ color: '#ef4444', flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>{f.text}</span>
                </div>
              ))}
              <div style={{ marginTop: '8px' }}>
                <Link to="/pricing" style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none', padding: '13px',
                  borderRadius: '10px', background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)',
                  color: '#fff', fontWeight: 700, fontSize: '15px',
                }}>Select</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ DEMO BOOKING FORM ════════════ */}
      <section style={{ padding: '0 40px 60px' }}>
        <div style={{
          maxWidth: '100%', margin: '0 auto', padding: '64px 80px', borderRadius: '20px',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 100%)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', letterSpacing: '-.5px', marginBottom: '12px' }}>
              Apna Demo Book Karein
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,.55)', lineHeight: 1.65, maxWidth: '540px', margin: '0 auto' }}>
              Transparent Indian pricing — simple, affordable, and built to scale your brand with AI.
            </p>
          </div>
          <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              'Company Name / Business Name*',
              'Contact Person Name*',
              'Email Address*',
              'Contact Number (WhatsApp)*',
            ].map(ph => (
              <input key={ph} placeholder={ph} style={{
                width: '100%', padding: '14px 18px', borderRadius: '8px',
                background: 'rgba(248,250,252,.92)', border: '1px solid transparent',
                color: '#1e293b', fontSize: '15px', fontFamily: 'inherit',
              }}/>
            ))}
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.4)', marginTop: '4px' }}>
              * indicates a required field
            </p>
            <button style={{
              marginTop: '4px', padding: '14px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)',
              color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>Submit</button>
          </div>
        </div>
      </section>

      {/* ════════════ NEWSLETTER ════════════ */}
      <div style={{ margin: '0 40px 48px', padding: '28px 48px', borderRadius: '16px',
        background: 'linear-gradient(90deg, #38bdf8 0%, #22d3ee 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px',
      }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0c1a2e' }}>Stay Connected with Our Newsletter</div>
          <div style={{ fontSize: '14px', color: 'rgba(12,26,46,.65)', marginTop: '4px' }}>
            Subscribe to our newsletter to get more news, promo, or news services
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0', flexShrink: 0, background: '#fff', borderRadius: '50px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,.12)' }}>
          <input placeholder="Enter email address" style={{
            padding: '12px 22px', border: 'none', fontSize: '14px',
            background: 'transparent', color: '#1e293b', outline: 'none',
            minWidth: '220px', fontFamily: 'inherit',
          }}/>
          <button style={{
            padding: '12px 24px', border: 'none', borderRadius: '50px',
            background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
            color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit',
          }}>Subscribe</button>
        </div>
      </div>

      {/* ════════════ FOOTER ════════════ */}
      <footer style={{ padding: '52px 80px 28px', background: '#04000a', borderTop: '1px solid rgba(255,255,255,.04)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr', gap: '50px', marginBottom: '40px' }}>
            {/* Brand */}
            <div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff', marginBottom: '14px' }}>Wheedle.ai</div>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, maxWidth: '290px', marginBottom: '22px' }}>
                We're building the future of automated commerce. Wheedle.ai uses state-of-the-art Generative AI to manage world-class marketing for brands of all sizes.
              </p>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                {[
                  { Icon: YoutubeIcon,   color: '#ef4444' },
                  { Icon: InstagramIcon, color: '#ec4899' },
                  { Icon: FacebookIcon,  color: '#3b82f6' },
                  { Icon: TwitterIcon,   color: '#94a3b8' },
                  { Icon: MailIcon,      color: '#94a3b8' },
                ].map(({ Icon, color }, i) => (
                  <a key={i} href="#" style={{ color, opacity: .85, transition: 'opacity .2s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '.85')}>
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '18px' }}>Product</div>
              {['AI Ads', 'DigiMarketer', 'AI Sale Bot', 'AI Website', 'Analytics', 'Workflows'].map(l => (
                <a key={l} href="#" style={{ display: 'block', textDecoration: 'none', fontSize: '14px', color: '#475569', marginBottom: '11px', transition: 'color .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                  {l}
                </a>
              ))}
            </div>

            {/* Product 2 */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '18px' }}>Product</div>
              {['About us', 'Services', 'Our Blog', 'Contact', 'Contact'].map((l, i) => (
                <a key={i} href="#" style={{ display: 'block', textDecoration: 'none', fontSize: '14px', color: '#475569', marginBottom: '11px', transition: 'color .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                  {l}
                </a>
              ))}
            </div>

            {/* Product 3 */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '18px' }}>Product</div>
              {['About us', 'Services', 'Our Blog', 'Contact', 'Contact'].map((l, i) => (
                <a key={i} href="#" style={{ display: 'block', textDecoration: 'none', fontSize: '14px', color: '#475569', marginBottom: '11px', transition: 'color .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                  {l}
                </a>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: '20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ fontSize: '13px', color: '#1e293b' }}>
              © 2026 Wheedle Technologies Inc. All rights reserved. Built with ❤️ for Indian brands.
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              {['Terms', 'Privacy', 'Cookies'].map(l => (
                <a key={l} href="#" style={{ textDecoration: 'none', fontSize: '13px', color: '#1e293b' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#1e293b')}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
