import React, { useState, useEffect } from 'react';
import PptxGenJS from 'pptxgenjs';
import {
  ChevronLeft, ChevronRight, BarChart3, Bot, Globe, Target, Cpu, Zap,
  Layout, Sparkles, Shield, Rocket, Search, Gem,
  BrainCircuit, LayoutTemplate, Images, GitBranch, Users, MessageSquare,
  CheckCircle2, TrendingUp
} from 'lucide-react';
import './Presentation.css';

const slides = [
  {
    type: 'hero',
    title: 'Autonomous <span class="text-gradient">AI Marketing</span>',
    subtitle: 'Wheedle Technologies - AI Services Company, helping businesses deploy Artificial Intelligence',
    bgImage: '/assets/presentation/hero.png'
  },
  {
    type: 'problem',
    title: 'Improvement in <span class="text-gradient">Organic Reach</span>',
    content: 'Scaling your business through organic growth, driven by AI-optimized visibility and reach.',
    points: [
      { icon: <Target size={28} />, title: 'Enhanced Discoverability', desc: 'AI-driven content strategies that put your brand in front of the right audience organically.' },
      { icon: <Zap size={28} />, title: 'Accelerated Momentum', desc: 'Build lasting organic traffic that compounds over time without exponential effort.' },
      { icon: <BarChart3 size={28} />, title: 'Actionable Insights', desc: 'Turn organic interaction data into powerful strategies for sustainable growth.' }
    ],
    bgImage: '/assets/presentation/solution.png' // Using solution as backdrop for paradox
  },
  {
    type: 'solution',
    title: 'The <span class="text-gradient">AI Orchestrator</span>',
    content: 'Wheedle AI is an all-in-one autonomous ecosystem. We replace multiple disconnected tools with a single unified AI workforce.',
    features: [
      { icon: <Cpu size={28} />, title: 'Centralized Intelligence', desc: 'One brain managing SEO, Social, Ads, and CRM in perfect sync.' },
      { icon: <Shield size={28} />, title: 'Brand Consistency', desc: 'AI maintains your unique voice and visual identity across every channel.' },
      { icon: <Rocket size={28} />, title: 'Hyper-Scale', desc: 'Execute complex workflows that would normally require a 50-person team.' }
    ],
    bgImage: '/assets/presentation/solution.png'
  },
  {
    type: 'module',
    title: 'AI <span class="text-gradient">Optimize</span>',
    content: 'Our autonomous campaign engine leverages multi-channel data to orchestrate high-performance strategies without manual intervention.',
    points: [
      { icon: <Target size={24} />, title: 'Multi-Channel Optimization', desc: 'Real-time optimization across Meta, Google, and TikTok. Our AI analyzes global data to maximize high-intent conversions.' },
      { icon: <Zap size={24} />, title: 'Predictive Allocation', desc: 'Autonomous strategy shifting that dynamically moves focus to winning creatives and audiences, ensuring maximum impact.' },
      { icon: <Shield size={24} />, title: 'Fraud & Safety Guard', desc: 'Continuous monitoring of traffic quality to ensure your brand is always displayed in brand-safe, high-converting environments.' }
    ],
    bgImage: '/assets/presentation/hero.png'
  },
  {
    type: 'module',
    title: 'Creative <span class="text-gradient">Hub</span>',
    content: 'Unlock infinite creative possibilities with vision-based AI that generates, tests, and refines your brand assets in real-time.',
    points: [
      { icon: <Images size={24} />, title: 'Generative Excellence', desc: 'Instantly generate high-resolution product photography and lifestyle backgrounds that are pixel-perfect and tailored to your specific brand aesthetic.' },
      { icon: <LayoutTemplate size={24} />, title: 'Automated Branding', desc: 'Our AI understands your brand DNA. It automatically applies consistent color palettes, typography, and logos across all generated assets for a unified brand voice.' },
      { icon: <Cpu size={24} />, title: 'Iterative Learning', desc: 'The hub learns which visual elements resonate most with your audience, autonomously refining future designs to improve engagement and click-through rates.' }
    ],
    bgImage: '/assets/presentation/social.png'
  },
  {
    type: 'module',
    title: 'SEO <span class="text-gradient">Intelligence</span>',
    content: 'Dominate search and chat engine results. We optimize your brand not just for traditional search, but for the new wave of AI platforms.',
    points: [
      { icon: <Search size={24} />, title: 'Chat Engine Visibility', desc: 'Improved visibility through chat engines (ChatGPT, Claude, Gemini) by compiling and structuring data specifically for AI platforms.' },
      { icon: <Globe size={24} />, title: 'Contextual Research', desc: 'AI-powered keyword discovery that identifies high-converting, untapped opportunities before your competitors. We map user intent to your content strategy perfectly.' },
      { icon: <BarChart3 size={24} />, title: 'Authority Builder', desc: 'Scale your domain authority with AI-assisted backlink analysis and outreach. We identify high-trust sources to boost your site\'s credibility in the eyes of search engines.' }
    ],
    bgImage: '/assets/presentation/seo.png'
  },
  {
    type: 'module',
    title: 'CRM & <span class="text-gradient">Audiences</span>',
    content: 'Personalization at scale. Know your customers better than they know themselves.',
    points: [
      { icon: <Users size={24} />, title: 'Smart Segmentation', desc: 'Automatically group customers by behavior, intent, and lifecycle stage.' },
      { icon: <Target size={24} />, title: 'Lead Scoring', desc: 'Predictive analysis to identify high-value leads before they convert.' },
      { icon: <MessageSquare size={24} />, title: 'Unified Inbox', desc: 'Manage every interaction across WhatsApp, Email, and Social DMs in one place.' }
    ],
    bgImage: '/assets/presentation/hero.png'
  },
  {
    type: 'module',
    title: 'Brand <span class="text-gradient">Center</span>',
    content: 'Define and preserve your unique brand identity. Our AI ensures your core values and visual voice are perfectly synchronized across every customer touchpoint.',
    points: [
      { icon: <Gem size={24} />, title: 'Persona Synthesis', desc: 'AI-driven persona building that deep-dives into your brand DNA. We generate a comprehensive digital tone-of-voice that guides every piece of content generated.' },
      { icon: <Target size={24} />, title: 'Goal Orchestration', desc: 'Set your North Star metrics—be it ROAS, Lead Volume, or Brand Awareness. The AI autonomously aligns every agent\'s output to achieve these specific objectives.' },
      { icon: <Layout size={24} />, title: 'Intelligent Catalog', desc: 'Smart product ingestion and management. The AI understands the unique value propositions of your entire inventory for hyper-targeted ad distribution.' }
    ],
    bgImage: '/assets/presentation/solution.png'
  },
  {
    type: 'module',
    title: 'Analytics & <span class="text-gradient">Insights</span>',
    content: 'Extract actionable intelligence from complex datasets. We turn raw marketing metrics into executive-level growth strategies.',
    points: [
      { icon: <BarChart3 size={24} />, title: 'Attribution Modeling', desc: 'Multi-touch attribution that shows exactly which channel and creative triggered the conversion. Understand the true ROI of every marketing dollar spent.' },
      { icon: <BrainCircuit size={24} />, title: 'Synthesized Reports', desc: 'No more complex dashboards. Our AI generates plain-English executive summaries that explain campaign performance and suggest next steps for growth.' },
      { icon: <Zap size={24} />, title: 'Live Growth Matrix', desc: 'Real-time data synchronization across all modules. View a unified stream of customer interactions, intent signals, and market trends as they happen.' }
    ],
    bgImage: '/assets/presentation/hero.png'
  },
  {
    type: 'feature',
    title: 'Social & <span class="text-gradient">Messaging</span>',
    content: 'Unify your multi-channel digital presence. Our AI orchestrates content and community engagement across every platform simultaneously.',
    points: [
      { icon: <Globe size={24} />, title: 'Platform Orchestration', desc: 'Centralized management of Instagram, Twitter, LinkedIn, and Facebook. AI-driven scheduling that identifies peak engagement windows for your specific audience.' },
      { icon: <MessageSquare size={24} />, title: 'Smart Inbox', desc: 'A unified workspace for WhatsApp, Email, and Social DMs. AI agents categorize and prioritize messages, ensuring high-value inquiries are addressed instantly.' },
      { icon: <Sparkles size={24} />, title: 'Community AI', desc: 'Autonomous response generation and sentiment monitoring. Maintain a 100% response rate and positive brand sentiment without 24/7 human moderation.' }
    ],
    bgImage: '/assets/presentation/social.png'
  },
  {
    type: 'module',
    title: 'Lead <span class="text-gradient">Convertability With AI</span>',
    content: 'Turn passive web traffic into qualified leads. Our dynamic chatbot ecosystem engages, qualifies, and schedules sales meetings on autopilot.',
    points: [
      { icon: <Bot size={24} />, title: 'Intent Intelligence', desc: 'Advanced NLP that understands complex user queries and intent. Provide personalized, high-value assistance to every visitor based on their unique journey.' },
      { icon: <Target size={24} />, title: 'Real-Time Scoring', desc: 'Instantly identify and prioritize high-intent visitors. The AI scores every interaction, ensuring your sales team focuses only on the hottest opportunities.' },
      { icon: <Shield size={24} />, title: 'Secure Integration', desc: 'Seamlessly connects with your existing CRM and data pipelines. All interactions are logged and synced, providing a 360-degree view of your lead funnel.' }
    ],
    bgImage: '/assets/presentation/social.png'
  },
  {
    type: 'module',
    title: 'Why <span class="text-gradient">Choose Us?</span>',
    content: 'We don\'t just provide software; we provide a scalable, autonomous workforce that evolves with your business goals.',
    points: [
      { icon: <TrendingUp size={24} />, title: 'Revolutionary ROI', desc: 'Reduce marketing operational costs by up to 70% while significantly increasing your conversion rates through 24/7 AI-driven campaign optimization.' },
      { icon: <Zap size={24} />, title: 'Hyper-Scale Growth', desc: 'Launch hundreds of variations across multiple channels simultaneously. Our AI executes in seconds what would take a human team weeks to coordinate.' },
      { icon: <CheckCircle2 size={24} />, title: 'Data-First Precision', desc: 'Eliminate guesswork. Every decision made by our orchestrator is backed by billions of data points, ensuring your budget is always allocated to the highest winning creative.' }
    ],
    bgImage: '/assets/presentation/solution.png'
  },
  {
    type: 'orchestration',
    title: 'Autonomous <span class="text-gradient">Agents</span>',
    content: 'The next generation of workers. Specialized agents for specialized tasks.',
    features: [
      { icon: <GitBranch size={24} />, title: 'Intelligent Workflows', desc: 'Chain multiple agents together for complex, end-to-end business automations.' },
      { icon: <Cpu size={24} />, title: 'One-Click Deployment', desc: 'Instantly launch SEO Architects, Social Managers, and Sales Bots specialized for your niche.' },
      { icon: <Shield size={24} />, title: 'Role-Based Access', desc: 'Fine-grained permission management for both your AI agents and human team members.' }
    ],
    bgImage: '/assets/presentation/solution.png'
  },
  {
    type: 'module',
    title: 'Customer-Driven <span class="text-gradient">Success</span>',
    content: 'Real examples of how our AI services are driving unprecedented growth for our clients.',
    points: [
      { icon: <TrendingUp size={24} />, title: 'E-commerce Growth', desc: 'A leading retail brand saw a 150% increase in organic reach and a 3x boost in lead convertability within 3 months.' },
      { icon: <BarChart3 size={24} />, title: 'B2B Lead Generation', desc: 'A SaaS company compiled data for AI platforms, resulting in a 200% increase in visibility through chat engines.' },
      { icon: <Users size={24} />, title: 'Customer Retention', desc: 'By utilizing our unified AI workforce, a healthcare provider improved patient engagement by 85%.' }
    ],
    stats: '300%',
    statLabel: 'Average Growth Rate',
    bgImage: '/assets/presentation/solution.png'
  },
  {
    type: 'cta',
    title: 'Begin the <span class="text-gradient">Evolution</span>',
    subtitle: 'Join the top 1% of businesses using autonomous growth strategies.',
    button: 'Scale Your Brand Now',
    bgImage: '/assets/presentation/solution.png'
  },
  {
    type: 'cta',
    title: 'Thank <span class="text-gradient">You</span>',
    subtitle: 'The future of marketing is autonomous. Let\'s build it together.',
    button: 'Get Started with Wheedle',
    bgImage: '/assets/presentation/hero.png'
  }
];

export const downloadPPT = () => {
    try {
      console.log("Starting PPT generation...");
      const pptx = new PptxGenJS();

      pptx.layout = 'LAYOUT_WIDE';
      pptx.defineLayout({ name: 'WHEEDLE_LAYOUT', width: 13.3, height: 7.5 });
      pptx.layout = 'WHEEDLE_LAYOUT';

      slides.forEach((slide) => {
        const pptSlide = pptx.addSlide();

        // Background - Deep Brand Blue
        pptSlide.background = { color: '050a18' };

        // 1. Add Logo to every slide
        try {
          pptSlide.addImage({
            path: window.location.origin + '/assets/logo_full_v2.png?v=' + Date.now(),
            x: 0.3, y: 0.2, w: 1.8, h: 0.6,
            sizing: { type: 'contain', w: 1.8, h: 0.6 }
          });
        } catch (e) {
          console.warn("Logo failed to load for PPT", e);
        }

        // 2. Slide Title
        const cleanTitle = slide.title.replace(/<[^>]*>/g, '');
        pptSlide.addText(cleanTitle, {
          x: 0.5,
          y: 1.0,
          w: '90%',
          fontSize: 36,
          bold: true,
          color: 'ffffff',
          fontFace: 'Arial'
        });

        // 3. Divider Line
        pptSlide.addShape(pptx.ShapeType.line, {
          x: 0.5, y: 1.6, w: 12.3, h: 0,
          line: { color: '2836ff', width: 2 }
        });

        // 4. Subtitle/Content
        if (slide.subtitle || slide.content) {
          pptSlide.addText(slide.subtitle || slide.content || '', {
            x: 0.5,
            y: 1.8,
            w: '90%',
            fontSize: 18,
            color: '94a3b8',
            italic: true,
            fontFace: 'Arial'
          });
        }

        // 5. Grid Content (Points/Features)
        if (slide.points || slide.features) {
          const items = slide.points || slide.features;
          items.forEach((item: any, i: number) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const startY = 2.8;

            // Item Title
            pptSlide.addText(item.title, {
              x: 0.5 + col * 4.3,
              y: startY + row * 2,
              w: 4.0,
              fontSize: 20,
              bold: true,
              color: '2836ff',
              fontFace: 'Arial'
            });

            // Item Description
            pptSlide.addText(item.desc, {
              x: 0.5 + col * 4.3,
              y: startY + 0.5 + row * 2,
              w: 4.0,
              fontSize: 12,
              color: 'ffffff',
              fontFace: 'Arial'
            });
          });
        }

        // 6. Stats
        if (slide.stats) {
          pptSlide.addText(slide.stats, {
            x: 0.5,
            y: 6.0,
            w: 4,
            fontSize: 54,
            bold: true,
            color: '2836ff',
            fontFace: 'Arial'
          });
          pptSlide.addText(slide.statLabel, {
            x: 4.5,
            y: 6.3,
            w: 8,
            fontSize: 20,
            color: '94a3b8',
            fontFace: 'Arial'
          });
        }

        // 7. Footer Branding
        pptSlide.addText('© 2026 Wheedle Technologies | Confidential Business Presentation', {
          x: 0.5,
          y: 7.1,
          w: 12.3,
          fontSize: 9,
          color: '334155',
          align: 'center'
        });
      });

      console.log("Saving PPT file...");
      pptx.writeFile({ fileName: 'Wheedle_Technologies_AI_Deck.pptx' })
        .then(() => {
          console.log("Download complete!");
        })
        .catch(err => {
          console.error("Write error:", err);
          alert("Download failed. Please check console.");
        });
    } catch (error) {
      console.error("PPT Generation Error:", error);
      alert("Error generating PPT: " + error);
    }
};

export const Presentation: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const nextSlide = () => setCurrentSlide(prev => (prev === slides.length - 1 ? prev : prev + 1));
  const prevSlide = () => setCurrentSlide(prev => (prev === 0 ? prev : prev - 1));

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="presentation-root">
      <div
        className="mesh-bg"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      />

      {/* Cinematic Floating Orbs */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            width: Math.random() * 300 + 100 + 'px',
            height: Math.random() * 300 + 100 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            background: i % 2 === 0 ? 'var(--primary-gradient)' : '#0665ff',
            filter: 'blur(100px)',
            opacity: 0.05,
            animation: `float ${Math.random() * 20 + 20}s infinite alternate ease-in-out`
          }}
        />
      ))}

      <div className="slide-container">
        {slides.map((slide, index) => {
          const classes = `slide ${index === currentSlide ? 'active' : ''}`;
          return (
            <div key={index} className={classes}>
              <div className="slide-content">
                {slide.bgImage && <div className="slide-bg-overlay" style={{ backgroundImage: `url(${slide.bgImage})` }} />}

                <div className="animate-up stagger-1">
                  <h1 className="slide-title" style={{ fontSize: slide.title.length > 25 ? '4rem' : '5rem' }}>
                    {slide.title.replace(/<[^>]*>/g, '').split(' ').map((word, i) => (
                      <span key={i} style={{ animationDelay: `${i * 0.1}s`, marginRight: '15px' }}>
                        {word === 'Marketing' || word === 'Paradox' || word === 'Optimize' || word === 'Hub' || word === 'Intelligence' || word === 'Audiences' || word === 'Center' || word === 'Insights' || word === 'Messaging' || word === 'Conversion' || word === 'Agents' || word === 'Growth' ? (
                          <span className="text-gradient">{word}</span>
                        ) : word}
                      </span>
                    ))}
                  </h1>

                  {slide.type === 'hero' && (
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div className="logo-glow-ring" />

                      {/* Orbiting Tech Icons */}
                      <div className="orbit-container">
                        <div className="orbit-icon" style={{ animationDelay: '0s' }}><Cpu size={40} /></div>
                        <div className="orbit-icon" style={{ animationDelay: '-5s' }}><Zap size={40} /></div>
                        <div className="orbit-icon" style={{ animationDelay: '-10s' }}><Bot size={40} /></div>
                        <div className="orbit-icon" style={{ animationDelay: '-15s' }}><Sparkles size={40} /></div>
                      </div>

                      <div className="hero-logo-large" style={{ position: 'relative', overflow: 'hidden', borderRadius: '20px' }}>
                        <img
                          src="/assets/logo_full_v2.png"
                          alt="Wheedle"
                          style={{
                            height: '180px',
                            objectFit: 'contain',
                            mixBlendMode: 'screen',
                            filter: 'brightness(1.5) drop-shadow(0 0 50px rgba(40, 54, 255, 0.6))'
                          }}
                        />
                      </div>
                      <p className="slide-subtitle animate-up stagger-2" style={{ textAlign: 'left', margin: 0, fontSize: '2rem', fontWeight: 300, color: '#94a3b8' }}>
                        {slide.subtitle}
                      </p>
                    </div>
                  )}

                  {slide.content && (
                    <p className="slide-subtitle animate-up stagger-2" style={{ textAlign: 'left', margin: '0 0 20px 0', fontSize: '1.6rem', color: '#cbd5e1', maxWidth: '1000px' }}>
                      {slide.content}
                    </p>
                  )}
                </div>

                {(slide.points || slide.features) && (
                  <div className="feature-grid" style={{ gridTemplateColumns: (slide.points?.length || slide.features?.length || 3) > 3 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)' }}>
                    {(slide.points || slide.features)?.map((p: any, i: number) => (
                      <div
                        key={i}
                        className={`feature-card animate-up stagger-${i + 3}`}
                        style={{ padding: '30px' }}
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                          const y = ((e.clientY - rect.top) / rect.height) * 100;
                          e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                          e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
                        }}
                      >
                        <div className="feature-icon" style={{ width: '60px', height: '60px', marginBottom: '20px' }}>{p.icon}</div>
                        <h4 style={{ fontSize: '1.4rem', marginBottom: '12px', fontWeight: 700 }}>{p.title}</h4>
                        <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.5 }}>{p.desc}</p>
                      </div>
                    ))}
                  </div>
                )}

                {slide.stats && (
                  <div className="animate-up stagger-3" style={{
                    marginTop: 'auto',
                    padding: '48px',
                    background: 'rgba(99, 102, 241, 0.05)',
                    borderRadius: '32px',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '40px'
                  }}>
                    <div style={{ fontSize: '5rem', fontWeight: 900, color: '#818cf8', letterSpacing: '-2px' }}>{slide.stats}</div>
                    <div>
                      <div style={{ fontSize: '1.2rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 600 }}>{slide.statLabel}</div>
                      <div style={{ color: '#6366f1', marginTop: '4px', fontWeight: 600 }}>Verified by Orchestrator Engine</div>
                    </div>
                  </div>
                )}

                {slide.type === 'cta' && (
                  <div className="animate-up stagger-3" style={{ textAlign: 'center', marginTop: 'auto' }}>
                    <p className="slide-subtitle" style={{ marginBottom: '48px' }}>{slide.subtitle}</p>
                    <button className="btn btn-primary" style={{ padding: '24px 80px', fontSize: '1.5rem', borderRadius: '100px', boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)' }}>
                      {slide.button}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="nav-controls">
        {/* <button className="nav-btn" onClick={() => window.print()} title="Download as PDF">
          <Printer size={20} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>DOWNLOAD PDF</span>
        </button>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }} />

        <button className="nav-btn" onClick={downloadPPT} title="Download as PPTX">
          <Download size={20} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>DOWNLOAD PPTX</span>
        </button> */}

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }} />

        <button className="nav-btn" onClick={prevSlide} disabled={currentSlide === 0}>
          <ChevronLeft size={24} />
        </button>

        <div className="progress-dots">
          {slides.map((_, i) => (
            <div key={i} className={`dot ${i === currentSlide ? 'active' : ''}`} />
          ))}
        </div>

        <button className="nav-btn" onClick={nextSlide} disabled={currentSlide === slides.length - 1}>
          <ChevronRight size={24} />
        </button>
      </div>

      <div style={{ position: 'fixed', top: '40px', left: '60px', zIndex: 100 }}>
        <div style={{
          height: '70px',
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(30px)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 30px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255,255,255,0.05)',
          gap: '20px'
        }}>
          <div style={{
            background: 'var(--primary-gradient)',
            padding: '5px 14px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 900,
            color: 'white',
            letterSpacing: '1px',
            boxShadow: '0 0 20px rgba(40, 54, 255, 0.4)'
          }}>
            AI
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }} />
          <img
            src="/assets/logo_full_v2.png"
            alt="Wheedle Technologies"
            style={{
              height: '38px',
              objectFit: 'contain',
              mixBlendMode: 'screen',
              filter: 'brightness(1.8) contrast(1.1)'
            }}
          />
        </div>
      </div>
    </div>
  );
};
