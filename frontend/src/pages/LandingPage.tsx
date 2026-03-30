import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Target, TrendingUp, ArrowRight, ShieldCheck, Rocket, MessageSquare, Globe, Search, ShoppingBag, Bot, BrainCircuit, BarChart3, Phone, Mail, Building2, CheckCircle, Timer, Star, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

// ── Countdown Timer ──────────────────────────────────────────────────────────
const LaunchCountdown = () => {
  const launchDate = new Date('2026-04-10T00:00:00+05:30');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = launchDate.getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
      padding: '14px 32px', textAlign: 'center', color: '#fff', position: 'relative',
      fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.2px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Timer size={16} />
        🚀 Full Launch: <strong style={{ color: '#fde68a' }}>10 April 2026</strong>
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        {[
          { val: timeLeft.days, label: 'Days' },
          { val: timeLeft.hours, label: 'Hrs' },
          { val: timeLeft.minutes, label: 'Min' },
          { val: timeLeft.seconds, label: 'Sec' },
        ].map(({ val, label }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '4px 12px', minWidth: '52px' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, lineHeight: 1 }}>{String(val).padStart(2, '0')}</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.8, textTransform: 'uppercase' }}>{label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '99px', cursor: 'pointer' }}>
        <Star size={13} fill="#fde68a" color="#fde68a" /> Early Access — Book Now
      </div>
    </div>
  );
};

// ── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = () => {
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  return (
    <nav style={{
      position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)',
      width: '94%', maxWidth: '1200px', padding: '12px 32px',
      background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(30px)',
      borderRadius: '99px', border: '1px solid rgba(255, 255, 255, 0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      zIndex: 1000, boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
          <Sparkles size={20} />
        </div>
        <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.8px', fontFamily: 'Outfit' }}>Wheedle.ai</span>
      </div>
      <div style={{ display: 'flex', gap: '40px' }}>
        {['Features', 'Tutorial', 'Pricing', 'Resources', 'Careers'].map(item => (
          <a key={item} href={`#${item.toLowerCase()}`} style={{ fontSize: '1rem', fontWeight: 600, color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#7c3aed'} onMouseLeave={e => e.currentTarget.style.color = '#475569'}>{item}</a>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <Link to={isAuthenticated ? "/crm" : "/login"} style={{ padding: '10px 24px', fontSize: '1rem', fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>
          {isAuthenticated ? "Go to Dashboard" : "Login"}
        </Link>
        <a href="#demo-form" style={{
          padding: '12px 28px', background: '#0f172a', color: '#fff', borderRadius: '99px',
          fontSize: '1rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 10px 20px rgba(15,23,42,0.2)',
          transition: 'transform 0.2s'
        }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          Book a Demo
        </a>
      </div>
    </nav>
  );
};

// ── Hero ─────────────────────────────────────────────────────────────────────
const Hero = () => {
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  return (
    <section style={{ padding: '240px 24px 120px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '5%', left: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: -1 }} />
      <div style={{ position: 'absolute', bottom: '0', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: -1 }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 20px',
          borderRadius: '99px', background: 'rgba(124, 58, 237, 0.05)', color: '#7c3aed',
          fontSize: '0.9rem', fontWeight: 800, marginBottom: '32px', border: '1px solid rgba(124, 58, 237, 0.1)'
        }}>
          <div style={{ display: 'flex', gap: '-4px' }}>
            {['👩🏻', '👨🏼', '👩🏽'].map((e, i) => <span key={i} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fff', border: '2px solid #fff', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: i === 0 ? 0 : '-8px' }}>{e}</span>)}
          </div>
          Join 8,400+ advertisers winning today
        </div>

        <h1 style={{ fontSize: 'clamp(2.8rem, 7vw, 4.8rem)', fontWeight: 900, color: '#0f172a', lineHeight: 1, maxWidth: '1100px', margin: '0 auto 28px', letterSpacing: '-2.5px', fontFamily: 'Outfit' }}>
          Stop Spending. <br /> Start <span style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Scaling</span> with AI.
        </h1>

        <p style={{ fontSize: '1.3rem', color: '#64748b', maxWidth: '750px', margin: '0 auto 48px', lineHeight: 1.6, fontWeight: 500 }}>
          Wheedle.ai is your autonomous marketing department. Our AI agents research, design, and manage your Meta & Google ads—guaranteeing better ROAS in 5 minutes.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <Link to={isAuthenticated ? "/crm" : "/signup"} style={{
            padding: '20px 48px', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            color: '#fff', borderRadius: '99px', fontSize: '1.2rem', fontWeight: 800, textDecoration: 'none',
            boxShadow: '0 25px 50px rgba(124, 58, 237, 0.4)', display: 'flex', alignItems: 'center', gap: '12px',
            transition: 'all 0.3s'
          }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            {isAuthenticated ? "Return to Dashboard" : "Try for free 3 days"} <ArrowRight size={24} />
          </Link>
          <a href="#demo-form" style={{
            padding: '20px 40px', background: '#fff', border: '2px solid #e2e8f0', color: '#0f172a',
            borderRadius: '99px', fontSize: '1.2rem', fontWeight: 700, transition: 'all 0.3s',
            display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none'
          }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}>
            <Play size={18} fill="#0f172a" /> Watch Live Demo
          </a>
        </div>
        <p style={{ marginTop: '24px', fontSize: '0.95rem', color: '#94a3b8', fontWeight: 600 }}>No technical skills or credit card needed.</p>
      </motion.div>

      {/* Featured Brands */}
      <div style={{ marginTop: '100px', padding: '40px 0', opacity: 0.7 }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '40px' }}>Powered by industry leaders</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '80px', flexWrap: 'wrap', alignItems: 'center' }}>
          {['Meta', 'Google Cloud', 'OpenAI', 'TikTok', 'Shopify'].map(brand => (
            <div key={brand} style={{ fontSize: '1.6rem', fontWeight: 900, color: '#334155', fontFamily: 'Outfit' }}>{brand}</div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Section Heading ───────────────────────────────────────────────────────────
const SectionHeading = ({ badge, title, sub, center = true }: any) => (
  <div style={{ textAlign: center ? 'center' : 'left', marginBottom: '60px' }}>
    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#7c3aed', background: 'rgba(124,58,237,0.08)', padding: '6px 16px', borderRadius: '99px', display: 'inline-block', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{badge}</div>
    <h2 style={{ fontSize: '3.2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-1.5px', marginBottom: '20px', fontFamily: 'Outfit' }}>{title}</h2>
    <p style={{ fontSize: '1.15rem', color: '#64748b', maxWidth: '650px', margin: center ? '0 auto' : '0' }}>{sub}</p>
  </div>
);

// ── Service Flow ──────────────────────────────────────────────────────────────
const ServiceFlow = () => {
  const steps = [
    { icon: Play, label: 'Demo', desc: 'Live walkthrough of the platform', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
    { icon: BrainCircuit, label: 'AI Automate', desc: 'Fully automated AI campaigns', color: '#4f46e5', bg: 'rgba(79,70,229,0.08)' },
    { icon: Bot, label: 'AI Sale Bot', desc: 'Smart sales chatbot integration', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
    { icon: BarChart3, label: 'DigiMarketer', desc: 'AI-powered digital marketing', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    { icon: Globe, label: 'AI Website', desc: 'Auto-generated landing pages', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  ];

  return (
    <section id="features" style={{ padding: '100px 24px', background: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <SectionHeading badge="How It Works" title="Complete AI Marketing Flow" sub="From demo to full automation — your complete AI-powered marketing journey in one platform." />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', flexWrap: 'wrap', position: 'relative' }}>
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.04 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                  padding: '36px 28px', borderRadius: '28px', background: '#fff',
                  border: '1.5px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                  cursor: 'pointer', transition: 'all 0.3s', width: '185px', minHeight: '190px',
                  justifyContent: 'center'
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = step.color; (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 48px ${step.color}20`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)'; }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: step.bg, color: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <step.icon size={30} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', marginBottom: '6px' }}>{step.label}</div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4 }}>{step.desc}</div>
                </div>
                <div style={{ width: '32px', height: '4px', borderRadius: '99px', background: step.color, opacity: 0.5 }} />
              </motion.div>

              {i < steps.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                  <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg, #e2e8f0, #7c3aed40)' }} />
                  <ArrowRight size={18} color="#7c3aed" style={{ opacity: 0.5 }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Both Labels */}
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <div style={{ display: 'inline-flex', gap: '16px', background: '#f8fafc', borderRadius: '99px', padding: '12px 32px', border: '1px solid #e2e8f0' }}>
            {['DigiMarketer', 'AI Websites'].map((tag) => (
              <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: '#7c3aed' }}>
                <CheckCircle size={16} fill="#7c3aed" color="#fff" />
                {tag} — Both Available
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ── Features ──────────────────────────────────────────────────────────────────
const Features = () => (
  <section style={{ padding: '80px 24px 120px', background: '#f8fafc' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <SectionHeading badge="The Loop" title="Results That Never Stop" sub="Wheedle powers every stage of your advertising growth loop with precision AI." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {[
          { icon: Search, title: 'Deep Research', desc: 'Our AI analyzes your site and competitors to find high-intent audiences and winning angles.', color: '#7c3aed' },
          { icon: Target, title: 'Strategic Targeting', desc: 'Stop wasting budget on wrong clicks. Reach the exact humans who are ready to buy.', color: '#10b981' },
          { icon: Rocket, title: 'Instant Launch', desc: 'Deploy multi-channel campaigns across Meta and Google in less than 60 seconds.', color: '#3b82f6' },
          { icon: TrendingUp, title: 'Auto Optimization', desc: 'Our agents adjust bids, kill losing ads, and scale winners 24/7 while you sleep.', color: '#f59e0b' },
        ].map((feat, i) => (
          <motion.div key={i} whileHover={{ y: -5 }} style={{ padding: '48px', borderRadius: '40px', border: '1px solid #f1f5f9', background: '#fcfcfc', transition: 'box-shadow 0.3s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.03)'}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: `${feat.color}10`, color: feat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
              <feat.icon size={32} />
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>{feat.title}</h3>
            <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.7 }}>{feat.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ── Industry Verticals ────────────────────────────────────────────────────────
const IndustryVerticals = () => (
  <section style={{ padding: '120px 24px', background: '#0f172a', color: '#fff', borderRadius: '60px', margin: '0 24px' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '80px', alignItems: 'center' }}>
      <div>
        <SectionHeading center={false} badge="Verticals" title="Built for Your Business" sub="Whether you're a local store or a global brand, we have a specialized AI agent for you." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { tag: 'Shopify Store', desc: 'Sync your catalog and let AI generate high-converting Meta product ads instantly.', icon: ShoppingBag },
            { tag: 'Local Service', desc: 'Rank higher locally and capture leads with AI-optimized Google Search Ads.', icon: Globe },
            { tag: 'SaaS & Tech', desc: 'Build scalable growth loops for your recurring revenue with precision targeting.', icon: Zap }
          ].map(v => (
            <div key={v.tag} style={{ padding: '24px', borderRadius: '24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <v.icon size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '6px' }}>{v.tag}</div>
                <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{v.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', width: '100%', height: '500px', borderRadius: '40px', boxShadow: '0 40px 100px rgba(0,0,0,0.5)', overflow: 'hidden', border: '12px solid rgba(255,255,255,0.05)' }}>
          <div style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>Campaign Performance</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Last 24h</div>
            </div>
            <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
              {[60, 45, 90, 70, 100, 80, 110].map((h, i) => (
                <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} style={{ flex: 1, background: '#fff', borderRadius: '8px 8px 0 0', opacity: 0.2 + (i * 0.1) }} />
              ))}
            </div>
            <div style={{ marginTop: '30px', background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between' }}>
              <div><div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Spend</div><div style={{ fontSize: '1.2rem', fontWeight: 800 }}>₹1,20,000</div></div>
              <div><div style={{ fontSize: '0.8rem', opacity: 0.6 }}>ROAS</div><div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>4.8x</div></div>
              <div><div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Sales</div><div style={{ fontSize: '1.2rem', fontWeight: 800 }}>₹5,76,000</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ── Tutorial ──────────────────────────────────────────────────────────────────
const Tutorials = () => (
  <section id="tutorial" style={{ padding: '120px 24px', background: '#f8fafc' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <SectionHeading badge="Tutorial" title="Master Wheedle in 3 Steps" sub="No expertise required. Our AI agents handle the heavy lifting while you focus on your business." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '100px' }}>
        {[
          { step: '1', title: 'Analyze Your Brand', desc: 'Paste your product URL. Our AI performs deep competitive research, identifies your USP, and builds a winning marketing persona instantly.', badge: 'Deep Research', bg: 'linear-gradient(135deg, #7c3aed08, #6d28d908)', icon: Search, color: '#7c3aed' },
          { step: '2', title: 'Generate & Launch Ads', desc: 'AI writes high-converting copy and designs stunning creatives for Meta and Google. Review, hit launch, and you\'re live in 60 seconds.', badge: 'AI Creative Lab', bg: 'linear-gradient(135deg, #10b98108, #05966908)', icon: Rocket, color: '#10b981', reverse: true },
          { step: '3', title: 'Auto-Scaling Results', desc: 'Our autonomous agents manage your budget 24/7, killing losing ads and scaling winners to ensure you get the highest ROAS possible.', badge: 'Automated Optimization', bg: 'linear-gradient(135deg, #3b82f608, #2563eb08)', icon: TrendingUp, color: '#3b82f6' }
        ].map((tut, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '80px', alignItems: 'center' }}>
            {tut.reverse && <div style={{ background: tut.bg, borderRadius: '40px', padding: '40px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '340px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `${tut.color}20`, color: tut.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><tut.icon size={40} /></div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>AI {tut.badge} Visualization</div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '10px' }}>Simulated UI Mockup</div>
              </div>
            </div>}
            <div style={{ order: tut.reverse ? 2 : 1 }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: tut.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, marginBottom: '24px', fontSize: '1.1rem', boxShadow: `0 10px 20px ${tut.color}30` }}>{tut.step}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: tut.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>{tut.badge}</div>
              <h3 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '24px', fontFamily: 'Outfit' }}>{tut.title}</h3>
              <p style={{ fontSize: '1.15rem', color: '#475569', lineHeight: 1.7, marginBottom: '32px' }}>{tut.desc}</p>
              <button style={{ padding: '12px 28px', borderRadius: '99px', border: `1.5px solid ${tut.color}`, color: tut.color, background: 'transparent', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>Learn More</button>
            </div>
            {!tut.reverse && <div style={{ background: tut.bg, borderRadius: '40px', padding: '40px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '340px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `${tut.color}20`, color: tut.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><tut.icon size={40} /></div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>AI {tut.badge} Visualization</div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '10px' }}>Simulated UI Mockup</div>
              </div>
            </div>}
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── Indian Pricing ────────────────────────────────────────────────────────────
const Pricing = () => (
  <section id="pricing" style={{ padding: '140px 24px', background: '#fff' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <SectionHeading badge="Plans — India Pricing" title="Sirf Apke Business Ke Liye" sub="Transparent Indian pricing — simple, affordable, and built to scale your brand with AI." />

      {/* Launch Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        style={{
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: '24px',
          padding: '20px 40px', marginBottom: '48px', border: '1.5px solid #f59e0b40',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap'
        }}
      >
        <Timer size={20} color="#d97706" />
        <span style={{ fontWeight: 800, color: '#92400e', fontSize: '1rem' }}>
          🚀 Full Product Launch: <strong>10 April 2026</strong> — Early bird discounts active now!
        </span>
        <a href="#demo-form" style={{ padding: '8px 20px', background: '#d97706', color: '#fff', borderRadius: '99px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>Book Early Access</a>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        {[
          {
            name: 'Starter',
            price: '₹1,599',
            per: '/mo',
            tagline: 'Perfect to get started',
            features: ['1 Platform (Meta or Google)', 'AI Ad Copy Generation', 'Daily Performance Report', 'Up to ₹50K Ad Spend', 'DigiMarketer Access'],
            cta: 'Start Free Trial',
            color: '#7c3aed',
            free: true
          },
          {
            name: 'Growth',
            price: '₹2,999',
            per: '/mo',
            tagline: 'Most popular for scale',
            features: ['Multi-Channel (All Platforms)', 'AI Image & Creative Lab', 'Real-time Dashboards', 'AI Sale Bot Integration', 'Up to ₹2L Ad Spend', 'DigiMarketer + AI Website'],
            cta: 'Get Started Now',
            color: '#7c3aed',
            popular: true
          },
          {
            name: 'Enterprise',
            price: '₹5,999',
            per: '/mo',
            tagline: 'Full power — unlimited',
            features: ['Unlimited Accounts & Platforms', '24/7 Dedicated Support', 'Custom AI Workflows', 'AI Sale Bot + AI Website', 'Unlimited Ad Spend', 'Full DigiMarketer Suite', 'Priority Onboarding'],
            cta: 'Contact Sales',
            color: '#7c3aed'
          },
        ].map((plan, idx) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            style={{
              padding: '52px 44px', borderRadius: '48px',
              background: plan.popular ? '#0f172a' : '#fff',
              color: plan.popular ? '#fff' : '#0f172a',
              border: plan.popular ? '2px solid #7c3aed' : '1.5px solid #f1f5f9',
              boxShadow: plan.popular ? '0 40px 80px rgba(124,58,237,0.2)' : '0 10px 30px rgba(0,0,0,0.02)',
              transform: plan.popular ? 'scale(1.05)' : 'none',
              zIndex: plan.popular ? 2 : 1, position: 'relative'
            }}
          >
            {plan.popular && <div style={{ position: 'absolute', top: '24px', right: '44px', fontSize: '0.78rem', fontWeight: 800, background: '#7c3aed', color: '#fff', padding: '7px 16px', borderRadius: '99px' }}>MOST POPULAR</div>}
            {plan.free && <div style={{ position: 'absolute', top: '24px', right: '44px', fontSize: '0.78rem', fontWeight: 800, background: '#10b981', color: '#fff', padding: '7px 16px', borderRadius: '99px' }}>FREE TRIAL</div>}

            <div style={{ fontSize: '1rem', fontWeight: 700, color: plan.popular ? 'rgba(255,255,255,0.5)' : '#94a3b8', marginBottom: '6px' }}>{plan.tagline}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '10px' }}>{plan.name}</div>
            <div style={{ fontSize: '3.4rem', fontWeight: 900, fontFamily: 'Outfit', lineHeight: 1, marginBottom: '6px' }}>
              {plan.price}<span style={{ fontSize: '1rem', fontWeight: 600, color: plan.popular ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>{plan.per}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: plan.popular ? 'rgba(255,255,255,0.4)' : '#94a3b8', marginBottom: '36px' }}>+ GST applicable</div>

            <div style={{ borderTop: `1px solid ${plan.popular ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}`, paddingTop: '28px', marginBottom: '40px' }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontSize: '0.98rem', fontWeight: 500 }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: plan.popular ? '#7c3aed' : '#f0fdf4', color: plan.popular ? '#fff' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={13} />
                  </div>
                  {f}
                </div>
              ))}
            </div>
            <a href="#demo-form" style={{
              display: 'block', width: '100%', padding: '18px', borderRadius: '99px',
              background: plan.popular ? '#7c3aed' : plan.name === 'Enterprise' ? '#0f172a' : 'transparent',
              border: plan.popular || plan.name === 'Enterprise' ? 'none' : '2px solid #7c3aed',
              color: plan.popular || plan.name === 'Enterprise' ? '#fff' : '#7c3aed',
              fontWeight: 800, textDecoration: 'none', textAlign: 'center',
              boxShadow: plan.popular ? '0 12px 28px rgba(124,58,237,0.35)' : 'none',
              fontSize: '1.02rem'
            }}>{plan.cta}</a>
          </motion.div>
        ))}
      </div>

      <p style={{ textAlign: 'center', marginTop: '40px', color: '#94a3b8', fontSize: '0.95rem' }}>
        💡 Sab plans mein 7-day free demo available hai. Koi hidden charge nahi.
      </p>
    </div>
  </section>
);

// ── Lead Capture Form ─────────────────────────────────────────────────────────
const DemoForm = () => {
  const [form, setForm] = useState({ company: '', contact: '', email: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <section id="demo-form" style={{ padding: '120px 24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '6px 16px', borderRadius: '99px', display: 'inline-block', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Free Demo</div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', marginBottom: '16px', fontFamily: 'Outfit' }}>Apna Demo Book Karein</h2>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
              Hamare AI marketing platform ka live demo dekhen. Bilkul free — koi commitment nahi.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { name: 'company', label: 'Company Name / Business Name', icon: Building2, placeholder: 'e.g. Wheedle Technologies', type: 'text' },
                { name: 'contact', label: 'Contact Person Name', icon: Building2, placeholder: 'Aapka naam', type: 'text' },
                { name: 'email', label: 'Email Address', icon: Mail, placeholder: 'example@company.com', type: 'email' },
                { name: 'phone', label: 'Contact Number (WhatsApp)', icon: Phone, placeholder: '+91 98765 43210', type: 'tel' },
              ].map(field => (
                <div key={field.name}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '10px' }}>
                    {field.label}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <field.icon size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                    <input
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={(form as any)[field.name]}
                      onChange={handle}
                      required
                      style={{
                        width: '100%', padding: '18px 18px 18px 52px',
                        borderRadius: '16px', border: '1.5px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)', color: '#fff',
                        fontSize: '1rem', outline: 'none', boxSizing: 'border-box',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={e => e.target.style.borderColor = '#7c3aed'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                </div>
              ))}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '20px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  color: '#fff', fontWeight: 800, fontSize: '1.1rem',
                  boxShadow: '0 20px 40px rgba(124,58,237,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  marginTop: '8px', opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? '⏳ Submitting...' : <><Rocket size={20} /> Free Demo Book Karein — ₹0 Cost</>}
              </motion.button>

              <p style={{ textAlign: 'center', fontSize: '0.87rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
                🔒 Aapki information 100% safe hai. Koi spam nahi.
              </p>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '60px 40px', background: 'rgba(255,255,255,0.05)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
              <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '16px' }}>Demo Confirm Ho Gayi!</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                Humari team aapko 24 ghante mein contact karegi.<br />
                WhatsApp par bhi message kar sakte hain.
              </p>
              <div style={{ marginTop: '32px', padding: '20px 32px', background: 'rgba(16,185,129,0.15)', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.3)', display: 'inline-block' }}>
                <CheckCircle size={20} color="#10b981" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                <span style={{ color: '#10b981', fontWeight: 700 }}>Submission Successful</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

// ── Footer ────────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer style={{ padding: '100px 24px 60px', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '60px', marginBottom: '80px' }}>
        <div style={{ gridColumn: 'span 1.5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Sparkles size={20} />
            </div>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.8px', fontFamily: 'Outfit' }}>Wheedle.ai</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '400px' }}>
            We're building the future of automated commerce. Wheedle.ai uses state-of-the-art Generative AI to manage world-class marketing for brands of all sizes.
          </p>
          <div style={{ marginTop: '24px', fontSize: '0.95rem', color: '#475569', fontWeight: 600 }}>
            📅 Full Launch: <strong style={{ color: '#7c3aed' }}>10 April 2026</strong>
          </div>
        </div>
        {[
          { title: 'Product', links: ['AI Ads', 'DigiMarketer', 'AI Sale Bot', 'AI Website', 'Analytics', 'Workflows'] },
          { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Contact', 'Security'] },
          { title: 'Community', links: ['Twitter', 'LinkedIn', 'Discord', 'Tutorials', 'Service Status'] },
        ].map(col => (
          <div key={col.title}>
            <h4 style={{ fontWeight: 800, marginBottom: '28px', color: '#0f172a' }}>{col.title}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {col.links.map(l => <a key={l} href="#" style={{ textDecoration: 'none', color: '#64748b', fontSize: '1rem', transition: 'color 0.2s' }}>{l}</a>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>© 2026 Wheedle Technologies Inc. All rights reserved. Built with ❤️ for Indian brands.</div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Terms', 'Privacy', 'Cookies'].map(i => <a key={i} href="#" style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none' }}>{i}</a>)}
        </div>
      </div>
    </div>
  </footer>
);

// ── Main Export ───────────────────────────────────────────────────────────────
export const LandingPage: React.FC = () => {
  return (
    <div style={{ background: '#fff', overflowX: 'hidden' }}>
      <LaunchCountdown />
      <Navbar />
      <Hero />
      <ServiceFlow />
      <Features />
      <IndustryVerticals />
      <Tutorials />
      <Pricing />
      <DemoForm />
      <Footer />

      {/* Floating Chat Button */}
      <a href="#demo-form" style={{ position: 'fixed', bottom: '40px', right: '40px', width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 30px rgba(124,58,237,0.4)', zIndex: 100, textDecoration: 'none' }}>
        <MessageSquare size={24} />
      </a>
    </div>
  );
};
