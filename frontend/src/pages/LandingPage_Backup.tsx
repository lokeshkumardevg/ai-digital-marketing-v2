import React, { useEffect, useState } from 'react';
import { Search, Globe, ChevronDown, ChevronRight, MessageSquare, ArrowRight, LayoutDashboard, Play } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const LandingPage: React.FC = () => {
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
    <div style={{ fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif", width: '100%', overflowX: 'hidden' }}>
      
      {/* --- EXTREMELY PRECISE HEADER WRAPPER --- */}
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
      <div style={{ height: '150px', background: '#04000a' }} />

      {/* --- HERO SECTION --- */}
      <section style={{ 
         position: 'relative', 
         background: '#04000a', 
         height: '500px', 
         display: 'flex', 
         flexDirection: 'column',
         justifyContent: 'center',
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

          <div style={{ position: 'relative', zIndex: 1, padding: '0 40px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
             <div style={{ fontSize: '13px', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <span style={{ color: '#00d2ff', border: '1px solid #00d2ff', padding: '2px 8px', borderRadius: '12px' }}>PROVEN</span> Total ad spend on Wheedle AI: $1,583,463+ <ArrowRight size={12} />
             </div>
             <h1 style={{ fontSize: '56px', color: '#fff', fontWeight: 700, lineHeight: 1.15, margin: 0 }}>
                Turn $1 Into $4<br/>
                With <span style={{ color: '#ff007f' }}>AI Ads</span>
             </h1>
             <p style={{ fontSize: '20px', color: '#a0aec0', maxWidth: '600px', marginTop: '24px', lineHeight: 1.6 }}>
                 Setup in 5 minutes | Average ROI: 300%+ <br/>
                 No credit card required. Wheedle powers every stage of your ad growth loop.
             </p>
          </div>
      </section>

      {/* --- BUILT FOR YOUR BUSINESS --- */}
      <section style={{ padding: '100px 40px', background: '#ffffff' }}>
         <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
               <h2 style={{ fontSize: '42px', color: '#111', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-1px' }}>Built for Your Business</h2>
               <p style={{ fontSize: '20px', color: '#555', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
                  Powerful campaigns that actually work — helping small businesses, local stores, and online services grow faster with less effort.
               </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
               {/* Card 1 */}
               <div style={{ background: '#fff', padding: '40px 30px', borderRadius: '16px', border: '1px solid #eaeaea', boxShadow: '0 12px 30px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '48px', height: '48px', background: '#f0f5ff', color: '#0066cc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                     <Globe size={24} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>Local Store & Service</h3>
                  <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.6, flex: 1 }}>Drive foot traffic and local leads instantly with hyper-targeted geofenced campaigns.</p>
               </div>
               {/* Card 2 */}
               <div style={{ background: '#fff', padding: '40px 30px', borderRadius: '16px', border: '1px solid #eaeaea', boxShadow: '0 12px 30px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '48px', height: '48px', background: '#fff0f7', color: '#ff007f', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                     <Search size={24} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>Online Shopping</h3>
                  <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.6, flex: 1 }}>Boost catalog sales with dynamic retargeting and high-converting AI creatives.</p>
               </div>
               {/* Card 3 */}
               <div style={{ background: '#fff', padding: '40px 30px', borderRadius: '16px', border: '1px solid #eaeaea', boxShadow: '0 12px 30px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '48px', height: '48px', background: '#f0fbff', color: '#00d2ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                     <MessageSquare size={24} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>Solution & Service</h3>
                  <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.6, flex: 1 }}>Generate high-intent qualified leads using smart forms and driven audience intent signals.</p>
               </div>
               {/* Card 4 */}
               <div style={{ background: '#fff', padding: '40px 30px', borderRadius: '16px', border: '1px solid #eaeaea', boxShadow: '0 12px 30px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '48px', height: '48px', background: '#f4efff', color: '#7033f5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                     <LayoutDashboard size={24} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>Mobile Apps</h3>
                  <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.6, flex: 1 }}>Maximize app installs and user retention through automated, multi-channel app promo.</p>
               </div>
            </div>
         </div>
      </section>

      {/* --- HOW TO USE: 3 SIMPLE STEPS --- */}
      <section style={{ padding: '100px 40px', background: '#fafafa' }}>
         <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
               <h2 style={{ fontSize: '42px', color: '#111', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-1px' }}>How to Use</h2>
               <p style={{ fontSize: '20px', color: '#555', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
                  From setup to success in 3 simple steps — no marketing expertise required. 
                  Set your goal, adjust your budget, and preview real results powered by Wheedle.
               </p>
            </div>
            
            <div style={{ display: 'flex', gap: '30px', alignItems: 'stretch' }}>
               {/* Step 1 */}
               <div style={{ flex: 1, background: '#fff', border: '1px solid #eaeaea', borderRadius: '16px', padding: '40px 30px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontSize: '80px', fontWeight: 900, color: '#f5f5f5', position: 'absolute', top: '10px', right: '20px', zIndex: 0, lineHeight: 1 }}>1</div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                     <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#111', marginBottom: '16px' }}>Industry &<br/>Objective</h3>
                     <p style={{ fontSize: '16px', color: '#666', lineHeight: 1.6 }}>Tell us your industry and whether you want leads, traffic, or sales. We'll handle the complex targeting.</p>
                  </div>
               </div>
               
               {/* Arrow */}
               <div style={{ display: 'flex', alignItems: 'center', color: '#ccc' }}>
                  <ArrowRight size={32} />
               </div>

               {/* Step 2 */}
               <div style={{ flex: 1, background: '#fff', border: '1px solid #eaeaea', borderRadius: '16px', padding: '40px 30px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontSize: '80px', fontWeight: 900, color: '#f5f5f5', position: 'absolute', top: '10px', right: '20px', zIndex: 0, lineHeight: 1 }}>2</div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                     <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#111', marginBottom: '16px' }}>Set Your<br/>Budget</h3>
                     <p style={{ fontSize: '16px', color: '#666', lineHeight: 1.6 }}>Input your ad spend. The AI allocates it dynamically with top-tier efficiency.</p>
                  </div>
               </div>

               {/* Arrow */}
               <div style={{ display: 'flex', alignItems: 'center', color: '#ccc' }}>
                  <ArrowRight size={32} />
               </div>

               {/* Step 3 */}
               <div style={{ flex: 1, background: '#fff', border: '1px solid #eaeaea', borderRadius: '16px', padding: '40px 30px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontSize: '80px', fontWeight: 900, color: '#f5f5f5', position: 'absolute', top: '10px', right: '20px', zIndex: 0, lineHeight: 1 }}>3</div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                     <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#111', marginBottom: '16px' }}>Preview &<br/>Launch</h3>
                     <p style={{ fontSize: '16px', color: '#666', lineHeight: 1.6 }}>Start your campaign today to achieve real results. We automatically optimize for a 300%+ ROI.</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- WHAT OUR CLIENTS SAY --- */}
      <section style={{ padding: '100px 40px', background: '#04000a' }}>
         <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
             <h2 style={{ fontSize: '42px', color: '#fff', fontWeight: 800, textAlign: 'center', letterSpacing: '-1px', marginBottom: '60px' }}>What Our Clients Say</h2>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                <div style={{ background: '#111', padding: '40px', borderRadius: '16px', border: '1px solid #222' }}>
                   <div style={{ display: 'flex', color: '#ffb400', marginBottom: '16px' }}>★ ★ ★ ★ ★</div>
                   <p style={{ fontSize: '16px', color: '#ccc', lineHeight: 1.7, marginBottom: '24px' }}>
                      "Real feedback from businesses using Wheedle AI — boosting ROI, saving time, and running campaigns effortlessly for our local store."
                   </p>
                   <div style={{ color: '#fff', fontWeight: 600 }}>David S.</div>
                   <div style={{ color: '#666', fontSize: '14px' }}>Local Retailer</div>
                </div>
                <div style={{ background: '#111', padding: '40px', borderRadius: '16px', border: '1px solid #222' }}>
                   <div style={{ display: 'flex', color: '#ffb400', marginBottom: '16px' }}>★ ★ ★ ★ ★</div>
                   <p style={{ fontSize: '16px', color: '#ccc', lineHeight: 1.7, marginBottom: '24px' }}>
                      "E-commerce sales blew up. We just set the objective and budget, and the AI handled the rest. Outstanding results and zero learning curve."
                   </p>
                   <div style={{ color: '#fff', fontWeight: 600 }}>Sarah J.</div>
                   <div style={{ color: '#666', fontSize: '14px' }}>E-Commerce Founder</div>
                </div>
                <div style={{ background: '#111', padding: '40px', borderRadius: '16px', border: '1px solid #222' }}>
                   <div style={{ display: 'flex', color: '#ffb400', marginBottom: '16px' }}>★ ★ ★ ★ ★</div>
                   <p style={{ fontSize: '16px', color: '#ccc', lineHeight: 1.7, marginBottom: '24px' }}>
                      "Our B2B service leads tripled in just 2 weeks. The seamless app flow meant no marketing expertise was needed on our end."
                   </p>
                   <div style={{ color: '#fff', fontWeight: 600 }}>Michael T.</div>
                   <div style={{ color: '#666', fontSize: '14px' }}>Agency Director</div>
                </div>
             </div>
         </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section style={{ padding: '100px 40px', background: '#ffffff' }}>
         <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
               <h2 style={{ fontSize: '42px', color: '#111', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-1px' }}>Frequently Asked Questions</h2>
               <p style={{ fontSize: '20px', color: '#555', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
                  Join 10,000+ businesses already winning with Wheedle AI. No credit card required.
               </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
               <div style={{ background: '#fafafa', padding: '32px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>01. What is Wheedle AI and why should I use it?</h4>
                  <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.6 }}>It's your 24/7 AI Ad Expert. Setup campaigns in 5 minutes with a 300%+ average ROI.</p>
               </div>
               <div style={{ background: '#fafafa', padding: '32px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>02. How quickly can I start running ads?</h4>
                  <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.6 }}>Instantly! Connect your platforms, define your budget, and launch today without marketing expertise.</p>
               </div>
               <div style={{ background: '#fafafa', padding: '32px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>03. What's included in the free trial?</h4>
                  <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.6 }}>You get full access to AI audience builders and creative studios. No credit card required.</p>
               </div>
               <div style={{ background: '#fafafa', padding: '32px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>04. Will this work for my business?</h4>
                  <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.6 }}>Yes! We support local stores, e-commerce shopping, B2B services, and mobile apps out of the box.</p>
               </div>
               <div style={{ background: '#fafafa', padding: '32px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>05. How much control do I have over my ads?</h4>
                  <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.6 }}>You maintain 100% control over budgets, final creative approvals, and core target demographics.</p>
               </div>
               <div style={{ background: '#fafafa', padding: '32px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>06. Can I cancel anytime?</h4>
                  <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.6 }}>Yes, our transparent plans have zero long-term lock-ins. Cancel instantly at any time.</p>
               </div>
            </div>
         </div>
      </section>

      {/* --- CTA FOOTER --- */}
      <section style={{ background: '#04000a', padding: '100px 40px', textAlign: 'center' }}>
         <div style={{ maxWidth: '800px', margin: '0 auto' }}>
             <h2 style={{ fontSize: '48px', color: '#fff', fontWeight: 800, letterSpacing: '-1px', marginBottom: '24px' }}>Ready to Turn $1 Into $4?</h2>
             <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.7)', marginBottom: '40px' }}>Start your 14-day free trial today. No credit card required.</p>
             <Link to="/pricing" style={{ display: 'inline-block', textDecoration: 'none', background: '#fff', color: '#000', padding: '18px 48px', borderRadius: '50px', fontSize: '18px', fontWeight: 700, cursor: 'pointer' }}>
                Get Started Now
             </Link>
         </div>
      </section>

    </div>
  );
};
