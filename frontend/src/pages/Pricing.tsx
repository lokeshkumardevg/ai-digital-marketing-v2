import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Globe, ChevronDown, LayoutDashboard, Search, ArrowRight, ChevronRight, MessageSquare } from 'lucide-react';

export const Pricing: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showCampaignNav, setShowCampaignNav] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif", width: '100%', minHeight: '100vh', background: '#f8f9ff', overflowX: 'hidden' }}>
      
      {/* --- EXTREMELY PRECISE HEADER WRAPPER (Copied natively from Landing) --- */}
      <div style={{ 
         position: 'fixed', 
         top: 0, 
         left: 0, 
         width: '100%', 
         zIndex: 1000, 
         transition: 'all 0.3s ease',
         padding: scrolled ? '0' : '16px 24px 0',
         pointerEvents: 'none'
      }}>
        
        {/* The White Navbar */}
        <nav style={{ 
            background: '#ffffff', 
            height: scrolled ? '72px' : '76px', 
            display: 'flex', 
            justifyContent: 'center',
            borderBottom: '1px solid #e5e5e5',
            boxShadow: scrolled ? '0 4px 10px rgba(0,0,0,0.06)' : 'none',
            borderRadius: scrolled ? '0' : '8px',
            maxWidth: scrolled ? '100%' : '1440px',
            margin: '0 auto',
            transition: 'all 0.3s ease',
            pointerEvents: 'auto'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1440px', padding: '0 40px' }}>
                
                {/* Logo Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '26px', fontWeight: 900, color: '#0066cc', letterSpacing: '-0.5px' }}>
                           Wheedle<span style={{ fontWeight: 400 }}>.ai</span>
                        </div>
                        <div style={{ width: '1px', height: '36px', background: '#ccc' }} />
                        <div style={{ fontSize: '11px', color: '#0066cc', lineHeight: 1.2, fontWeight: 500 }}>
                           Autonomous<br/>Marketing<span style={{ fontSize: '8px', verticalAlign: 'top' }}>™</span>
                        </div>
                    </div>
                    
                    {/* Main Nav Links */}
                    <div style={{ display: 'flex', gap: '22px', fontSize: '15px', fontWeight: 500, color: '#2a2a2a' }}>
                        <Link to="/" style={{ textDecoration: 'none', color: currentPath === '/' ? '#0066cc' : 'inherit', display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: currentPath === '/' ? 700 : 500 }}>Home</Link>
                        <Link to="/pricing" style={{ textDecoration: 'none', color: currentPath === '/pricing' ? '#0066cc' : 'inherit', display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: currentPath === '/pricing' ? 700 : 500 }}>Pricing</Link>
                        
                        <div 
                          onMouseEnter={() => setShowCampaignNav(true)}
                          onMouseLeave={() => setShowCampaignNav(false)}
                          style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                        >
                           <Link to="/campaigns" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '10px 0' }}>
                             Campaigns <ChevronDown size={14} style={{ transform: showCampaignNav ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                           </Link>

                           {/* Campaigns Sub-Menu dropdown */}
                           {showCampaignNav && (
                             <div style={{ position: 'absolute', top: '100%', left: '-20px', background: '#fff', border: '1px solid #eee', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', borderRadius: '8px', padding: '8px 0', minWidth: '220px', zIndex: 50 }}>
                                <Link to="/campaigns" style={{ display: 'block', padding: '12px 24px', textDecoration: 'none', color: '#333', fontSize: '14px', fontWeight: 600 }}>Create Campaign</Link>
                                <Link to="/ai/ads-manager" style={{ display: 'block', padding: '12px 24px', textDecoration: 'none', color: '#555', fontSize: '14px' }}>AI Ads Manager</Link>
                                <Link to="/templates" style={{ display: 'block', padding: '12px 24px', textDecoration: 'none', color: '#555', fontSize: '14px' }}>Ad Templates</Link>
                                <Link to="/analytics/insights" style={{ display: 'block', padding: '12px 24px', textDecoration: 'none', color: '#555', fontSize: '14px' }}>Campaign Analytics</Link>
                             </div>
                           )}
                        </div>
                    </div>
                </div>

                {/* Right Side Icons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#444' }}>
                    {/* Contrast Icon */}
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #555', borderTopColor: 'transparent', transform: 'rotate(45deg)', cursor: 'pointer' }} /> 
                    {/* Language Dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                        <Globe size={18} /> En <ChevronDown size={14} />
                    </div>
                    {/* Enter App Button */}
                    <Link to="/crm" style={{ textDecoration: 'none', border: '1px solid #ccc', borderRadius: '4px', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '8px', color: '#333' }}>
                       <span style={{ fontSize: '14px', fontWeight: 600 }}>Dashboard</span>
                       <LayoutDashboard size={16} />
                    </Link>
                </div>
            </div>
        </nav>

        {/* Secondary Grey Sticky Nav */}
        <div style={{ 
            background: '#f5f5f5', 
            display: 'flex', 
            justifyContent: 'center', 
            borderBottom: '1px solid #d1d1d1',
            borderRadius: scrolled ? '0' : '0 0 8px 8px',
            maxWidth: scrolled ? '100%' : '1440px',
            margin: '0 auto',
            transition: 'all 0.3s ease',
            pointerEvents: 'auto',
            boxShadow: scrolled ? '0 4px 6px rgba(0,0,0,0.05)' : 'none'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', maxWidth: '1440px', width: '100%', padding: '0 40px', gap: '0' }}>
                <Link to="/crm" style={{ textDecoration: 'none', padding: '20px 48px', fontSize: '13px', color: '#555', fontWeight: 600, cursor: 'pointer' }}>
                   AI CRM
                </Link>
                <Link to="/campaigns" style={{ textDecoration: 'none', padding: '20px 48px', fontSize: '13px', color: '#555', fontWeight: 600, cursor: 'pointer' }}>
                   Ad Manager
                </Link>
                {/* Active Purple Tab from Screenshot 1 */}
                <Link to="/social" style={{ textDecoration: 'none', background: '#d4cae5', padding: '20px 52px', fontSize: '13px', color: '#333', fontWeight: 700, cursor: 'pointer' }}>
                   Social Intelligence
                </Link>
                <div style={{ padding: '20px 48px', fontSize: '13px', color: '#555', fontWeight: 600, cursor: 'pointer' }}>
                   Marketing Outcomes
                </div>
                <div style={{ padding: '20px 48px', fontSize: '13px', color: '#555', fontWeight: 600, cursor: 'pointer' }}>
                   Client Success
                </div>
                <div style={{ padding: '20px 48px', fontSize: '13px', color: '#555', fontWeight: 600, cursor: 'pointer' }}>
                   Industry News
                </div>
            </div>
        </div>
      </div>
      
      {/* spacer to prevent content jumping under fixed header */}
      <div style={{ height: '160px' }} />

      {/* --- HERO SECTION --- */}
      <section style={{ 
         position: 'relative', 
         background: '#04000a', 
         padding: '120px 40px 80px', 
         textAlign: 'center',
         overflow: 'hidden' 
      }}>
          {/* Neon abstract visual mimicking the screenshot */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
             <div style={{ position: 'absolute', top: '50%', left: '0', width: '100%', height: '140px', background: 'radial-gradient(ellipse at center, rgba(230, 0, 130, 0.4) 0%, transparent 70%)', transform: 'scale(1.5, 0.3)' }} />
             <div style={{ position: 'absolute', top: '50%', left: '-10%', width: '120%', height: '2px', background: '#ffffff', boxShadow: '0 0 20px #ff007f, 0 0 40px #ff007f' }} />
             <div style={{ position: 'absolute', top: '45%', left: '-10%', width: '120%', height: '3px', background: '#00d2ff', transform: 'rotate(2deg)', boxShadow: '0 0 10px #00d2ff' }} />
             <div style={{ position: 'absolute', top: '20%', left: '-2%', width: '4px', height: '60%', background: '#ff007f', transform: 'rotate(30deg)', opacity: 0.8 }} />
             <div style={{ position: 'absolute', top: '20%', left: '5%', width: '3px', height: '60%', background: '#00d2ff', transform: 'rotate(25deg)', opacity: 0.8 }} />
          </div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '48px', color: '#fff', fontWeight: 700, marginBottom: '16px' }}>Simple, Transparent Pricing</h1>
            <p style={{ fontSize: '20px', color: '#a0aec0', maxWidth: '600px', margin: '0 auto' }}>Deploy autonomous marketing teams and scale your ad spend efficiently. No hidden fees.</p>
          </div>
      </section>

      {/* Pricing Grids */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' }}>
          
          {/* Pro Plan */}
          <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', border: '2px solid transparent', position: 'relative' }}>
             <h3 style={{ fontSize: '24px', color: '#111', fontWeight: 700, marginBottom: '8px' }}>Growth Pro</h3>
             <p style={{ color: '#666', marginBottom: '24px' }}>Perfect for agencies and scaling teams.</p>
             <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '32px' }}>
                <span style={{ fontSize: '48px', fontWeight: 800, color: '#111' }}>$99</span>
                <span style={{ color: '#666', fontSize: '16px' }}>/mo</span>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#444' }}><CheckCircle2 size={20} color="#10b981" /> 250,000 AI Model Tokens</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#444' }}><CheckCircle2 size={20} color="#10b981" /> Meta & Google Ads Integration</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#444' }}><CheckCircle2 size={20} color="#10b981" /> Standard ROI Analytics</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#444' }}><CheckCircle2 size={20} color="#d1d5db" /> Standard Email Support</div>
             </div>

             <Link to="/signup" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '16px', background: '#0066cc', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '16px' }}>
                Get Started
             </Link>
          </div>

          {/* Enterprise Plan */}
          <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '2px solid #0066cc', position: 'relative' }}>
             <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', background: '#0066cc', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Most Popular
             </div>
             <h3 style={{ fontSize: '24px', color: '#111', fontWeight: 700, marginBottom: '8px' }}>Enterprise Matrix</h3>
             <p style={{ color: '#666', marginBottom: '24px' }}>For large enterprises demanding scale.</p>
             <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '32px' }}>
                <span style={{ fontSize: '48px', fontWeight: 800, color: '#111' }}>$499</span>
                <span style={{ color: '#666', fontSize: '16px' }}>/mo</span>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#444' }}><CheckCircle2 size={20} color="#0066cc" /> 2,000,000 AI Model Tokens</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#444' }}><CheckCircle2 size={20} color="#0066cc" /> Custom LLM Fine-Tuning</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#444' }}><CheckCircle2 size={20} color="#0066cc" /> White-Label Client Reports</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#444' }}><CheckCircle2 size={20} color="#0066cc" /> 24/7 Priority Support</div>
             </div>

             <Link to="/signup" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '16px', background: '#fff', color: '#0066cc', border: '2px solid #0066cc', textDecoration: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '16px' }}>
                Contact Sales
             </Link>
          </div>

      </section>

    </div>
  );
};
