import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Target, TrendingUp, ArrowRight, ShieldCheck, Rocket, MessageSquare, Globe, Search, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Navbar = () => {
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  return (
    <nav style={{
      position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
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
        <Link to={isAuthenticated ? "/crm" : "/signup"} style={{ 
          padding: '12px 28px', background: '#0f172a', color: '#fff', borderRadius: '99px', 
          fontSize: '1rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 10px 20px rgba(15,23,42,0.2)',
          transition: 'transform 0.2s'
        }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          {isAuthenticated ? "Open App" : "Free Trial"}
        </Link>
      </div>
    </nav>
  );
};

const Hero = () => {
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  return (
    <section style={{ padding: '220px 24px 120px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Dynamic Background Elements */}
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
          Stop Spending. <br/> Start <span style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Scaling</span> with AI.
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
          <button style={{ 
            padding: '20px 40px', background: '#fff', border: '2px solid #e2e8f0', color: '#0f172a', 
            borderRadius: '99px', fontSize: '1.2rem', fontWeight: 700, transition: 'all 0.3s' 
          }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            Watch Live Demo
          </button>
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

const SectionHeading = ({ badge, title, sub, center = true }: any) => (
  <div style={{ textAlign: center ? 'center' : 'left', marginBottom: '60px' }}>
    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#7c3aed', background: 'rgba(124,58,237,0.08)', padding: '6px 16px', borderRadius: '99px', display: 'inline-block', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{badge}</div>
    <h2 style={{ fontSize: '3.2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-1.5px', marginBottom: '20px', fontFamily: 'Outfit' }}>{title}</h2>
    <p style={{ fontSize: '1.15rem', color: '#64748b', maxWidth: '650px', margin: center ? '0 auto' : '0' }}>{sub}</p>
  </div>
);

const Features = () => (
  <section id="features" style={{ padding: '120px 24px', background: '#fff' }}>
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
                <div><div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Spend</div><div style={{ fontSize: '1.2rem', fontWeight: 800 }}>$1,240</div></div>
                <div><div style={{ fontSize: '0.8rem', opacity: 0.6 }}>ROAS</div><div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>4.8x</div></div>
                <div><div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Sales</div><div style={{ fontSize: '1.2rem', fontWeight: 800 }}>$5,950</div></div>
              </div>
            </div>
         </div>
      </div>
    </div>
  </section>
);

const Tutorials = () => (
  <section id="tutorial" style={{ padding: '120px 24px', background: '#f8fafc' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <SectionHeading badge="Tutorial" title="Master Wheedle in 3 Steps" sub="No expertise required. Our AI agents handle the heavy lifting while you focus on your business." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '100px' }}>
        {[
          { 
            step: '1', 
            title: 'Analyze Your Brand', 
            desc: 'Paste your product URL. Our AI performs deep competitive research, identifies your USP, and builds a winning marketing persona instantly.', 
            badge: 'Deep Research', 
            bg: 'linear-gradient(135deg, #7c3aed08, #6d28d908)',
            icon: Search,
            color: '#7c3aed'
          },
          { 
            step: '2', 
            title: 'Generate & Launch Ads', 
            desc: 'AI writes high-converting copy and designs stunning creatives for Meta and Google. Review, hit launch, and you’re live in 60 seconds.', 
            badge: 'AI Creative Lab', 
            bg: 'linear-gradient(135deg, #10b98108, #05966908)',
            icon: Rocket,
            color: '#10b981',
            reverse: true
          },
          { 
            step: '3', 
            title: 'Auto-Scaling Results', 
            desc: 'Our autonomous agents manage your budget 24/7, killing losing ads and scaling winners to ensure you get the highest ROAS possible.', 
            badge: 'Automated Optimization', 
            bg: 'linear-gradient(135deg, #3b82f608, #2563eb08)',
            icon: TrendingUp,
            color: '#3b82f6'
          }
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

const Pricing = () => (
  <section id="pricing" style={{ padding: '140px 24px', background: '#fff' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <SectionHeading badge="Plans" title="Choose Your Growth Pace" sub="Transparent pricing designed to scale with your business success." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {[
          { name: 'Starter', price: '$0', spend: '10%', features: ['1 Platform (Meta or Google)', 'AI Ad Copy Generation', 'Daily Performance Email', 'Up to $1k Ad Spend'], cta: 'Start Free Trial' },
          { name: 'Growth', price: '$49', spend: '5%', features: ['Multi-Channel (All Platforms)', 'Full AI Image Lab', 'Real-time Dashboards', 'Up to $10k Ad Spend'], popular: true, cta: 'Get Started' },
          { name: 'Professional', price: '$199', spend: '2%', features: ['Infinite Accounts', '24/7 Human Account Manager', 'Custom API Access', 'Unlimited Ad Spend'], cta: 'Contact Sales' },
        ].map(plan => (
          <div key={plan.name} style={{
            padding: '56px 48px', borderRadius: '48px', background: plan.popular ? '#0f172a' : '#fff',
            color: plan.popular ? '#fff' : '#0f172a', border: '1.5px solid #f1f5f9',
            boxShadow: plan.popular ? '0 40px 80px rgba(124,58,237,0.15)' : '0 10px 30px rgba(0,0,0,0.02)',
            transform: plan.popular ? 'scale(1.05)' : 'none', zIndex: plan.popular ? 2 : 1,
            position: 'relative'
          }}>
            {plan.popular && <div style={{ position: 'absolute', top: '24px', right: '48px', fontSize: '0.8rem', fontWeight: 800, background: '#7c3aed', color: '#fff', padding: '8px 16px', borderRadius: '99px' }}>MOST POPULAR</div>}
            <div style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '16px' }}>{plan.name}</div>
            <div style={{ fontSize: '3.8rem', fontWeight: 900, marginBottom: '8px', fontFamily: 'Outfit' }}>{plan.price}<span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#94a3b8' }}>/mo</span></div>
            <div style={{ fontSize: '0.95rem', color: '#94a3b8', fontWeight: 700, marginBottom: '40px' }}>+ {plan.spend} of Monthly Ad Spend</div>
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', borderColor: plan.popular ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', paddingTop: '32px', marginBottom: '48px' }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', fontSize: '1rem', fontWeight: 500 }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: plan.popular ? '#7c3aed' : '#f0fdf4', color: plan.popular ? '#fff' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <ShieldCheck size={14} />
                  </div>
                  {f}
                </div>
              ))}
            </div>
            <Link to="/signup" style={{
              display: 'block', width: '100%', padding: '20px', borderRadius: '99px',
              background: plan.popular ? '#7c3aed' : '#0f172a',
              color: '#fff', fontWeight: 800, textDecoration: 'none', textAlign: 'center',
              boxShadow: plan.popular ? '0 15px 30px rgba(124,58,237,0.3)' : 'none'
            }}>{plan.cta}</Link>
          </div>
        ))}
      </div>
    </div>
  </section>
);

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
        </div>
        {[
          { title: 'Product', links: ['AI Ads', 'Deep Scan', 'Analytics', 'Workflows', 'API'] },
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
        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>© 2026 Wheedle Technologies Inc. All rights reserved. Built with ❤️ for scaling brands.</div>
        <div style={{ display: 'flex', gap: '24px' }}>
           {['Terms', 'Privacy', 'Cookies'].map(i => <a key={i} href="#" style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none' }}>{i}</a>)}
        </div>
      </div>
    </div>
  </footer>
);

export const LandingPage: React.FC = () => {
  return (
    <div style={{ background: '#fff', overflowX: 'hidden' }}>
      <Navbar />
      <Hero />
      <Features />
      <IndustryVerticals />
      <Tutorials />
      <Pricing />
      <Footer />
      
      {/* Floating Chat Button (Mock) */}
      <div style={{ position: 'fixed', bottom: '40px', right: '40px', width: '60px', height: '60px', borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 100 }}>
        <MessageSquare size={24} />
      </div>
    </div>
  );
};
