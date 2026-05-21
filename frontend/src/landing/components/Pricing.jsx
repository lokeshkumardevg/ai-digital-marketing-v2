import { Link } from "react-router-dom";
import { useState } from "react";

const tiers = [
  {
    name: "Starter",
    monthlyPrice: "1,599",
    annualPrice: "1,279",
    description: "Perfect for getting started with AI-powered marketing",
    features: [
      "1 Platform (Meta or Google)",
      "AI Ad Copy Generation",
      "Daily Performance Report",
      "Up to $50K Ad Spend",
      "DigiMarketer Access",
    ],
    button: "Start Free Trial",
    badge: null,
  },
  {
    name: "Growth",
    monthlyPrice: "2,999",
    annualPrice: "2,399",
    description: "For growing businesses ready to scale across channels",
    features: [
      "Multi-Channel (All Platforms)",
      "AI Image & Creative Lab",
      "Real-time Dashboards",
      "AI Sale Bot Integration",
      "Up to $2L Ad Spend",
      "DigiMarketer + AI Website",
    ],
    button: "Get Started Now",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    monthlyPrice: "5,999",
    annualPrice: "4,799",
    description: "Advanced AI suite for large-scale operations",
    features: [
      "Unlimited Accounts & Platforms",
      "24/7 Dedicated Support",
      "Custom AI Workflows",
      "AI Sale Bot + AI Website",
      "Unlimited Ad Spend",
      "Full DigiMarketer Suite",
      "Priority Onboarding",
    ],
    button: "Contact Sales",
    badge: null,
  },
];

const CheckIcon = ({ className = "" }) => (
  <svg
    className={`w-4 h-4 flex-shrink-0 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const SparkleIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
  </svg>
);

function PricingCard({ tier, isAnnual, isHovered, onHover }) {
  const isCenter = tier.highlighted;
  const brandBlue = "#0665ff 50%";
  const brandCyan = "#22d3ee 100%";
  const currentPrice = isAnnual ? tier.annualPrice : tier.monthlyPrice;

  return (
    <div
      className={`group relative flex flex-col rounded-2xl transition-all duration-500 ease-out cursor-pointer
        ${isCenter
          ? "z-20 scale-105 bg-gradient-to-b from-[#0F172A] to-[#0B1120] border-2 border-[#0665ff]/60 shadow-[0_0_40px_rgba(6,101,255,0.15)] hover:shadow-[0_0_60px_rgba(6,101,255,0.3)]"
          : "z-10 bg-[#0A0F1E] border border-[#1E2A4A] hover:border-[#0665ff]/50 hover:shadow-[0_20px_60px_rgba(6,101,255,0.15)]"
        }
        hover:-translate-y-2`}
      onMouseEnter={() => onHover?.(tier.name)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Animated gradient border for center card */}
      {isCenter && (
        <div 
          className="absolute -inset-[2px] rounded-2xl opacity-50 blur-sm animate-gradient-xy"
          style={{
            background: `linear-gradient(135deg, ${brandBlue}, ${brandCyan}, ${brandBlue})`
          }}
        />
      )}
      
      {/* Background patterns */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at top right, rgba(6,101,255,0.1), transparent 50%)`
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at bottom left, rgba(34,211,238,0.1), transparent 50%)`
          }}
        />
        {isCenter && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        )}
      </div>

      <div className="relative flex flex-col h-full p-8">
        {/* Badge */}
        {tier.badge && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div 
              className="text-white text-xs font-semibold px-5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5"
              style={{
                background: `linear-gradient(135deg, ${brandBlue}, ${brandCyan})`,
                boxShadow: `0 4px 15px rgba(6,101,255,0.25)`
              }}
            >
              <SparkleIcon />
              {tier.badge}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div 
              className={`w-2 h-2 rounded-full ${isCenter ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: isCenter ? brandBlue : '#6B7280' }}
            />
            <h3 className="text-white text-lg font-semibold tracking-wide uppercase">
              {tier.name}
            </h3>
          </div>
          
          {/* Price with annual savings indicator */}
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-white/60 text-lg">$</span>
            <span className={`font-bold tracking-tight text-white transition-all duration-300 ${isCenter ? "text-5xl" : "text-4xl"}`}>
              {currentPrice}
            </span>
            <span className="text-white/50 text-sm ml-1">/mo</span>
          </div>
          
          {/* Show annual savings */}
          {isAnnual && (
            <div className="mt-1">
              <span 
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ 
                  backgroundColor: 'rgba(34,211,238,0.15)', 
                  color: '#22d3ee' 
                }}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Save 20%
              </span>
            </div>
          )}

          {!isAnnual && (
            <p className="text-xs text-white/40 mt-2 font-medium">+ GST applicable</p>
          )}
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div 
              className={`w-full border-t ${isCenter ? 'opacity-30' : 'border-white/10'}`}
              style={{ borderColor: isCenter ? brandBlue : undefined }}
            />
          </div>
        </div>

        {/* Features */}
        <div className="flex-1 space-y-3.5">
          {tier.features.map((feature) => (
            <div
              key={feature}
              className="flex items-start gap-3 text-sm text-white/80 group/feature transition-all duration-300 hover:translate-x-1"
            >
              <div className="mt-0.5 p-0.5 rounded-full" style={{ color: isCenter ? brandBlue : brandCyan }}>
                <CheckIcon />
              </div>
              <span className="leading-snug">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-8">
          <button
            className={`relative w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden
              ${isCenter
                ? "text-white shadow-lg hover:scale-105"
                : "bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105"
              }
              active:scale-95`}
            style={isCenter ? {
              background: `linear-gradient(135deg, ${brandBlue}, ${brandCyan})`,
              boxShadow: `0 4px 15px rgba(6,101,255,0.25)`,
            } : undefined}
          >
            <span className="relative z-10">{tier.button}</span>
            {isCenter && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            )}
          </button>
        </div>

        {/* Annual billing note */}
        {isAnnual && (
          <div className="mt-3 text-center">
            <p className="text-xs text-white/30">
              Billed annually (${(parseInt(tier.annualPrice.replace(',', '')) * 12).toLocaleString()}/yr)
            </p>
          </div>
        )}

        {/* Trust indicator */}
        {isCenter && (
          <div className="mt-4 text-center">
            <p className="text-xs text-white/30 flex items-center justify-center gap-2">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Enterprise-grade security
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <section className="relative bg-[#020617] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-0 -left-4 w-72 h-72 rounded-full mix-blend-screen filter blur-3xl animate-pulse"
          style={{ backgroundColor: 'rgba(6,101,255,0.1)' }}
        />
        <div 
          className="absolute top-0 -right-4 w-72 h-72 rounded-full mix-blend-screen filter blur-3xl animate-pulse"
          style={{ backgroundColor: 'rgba(34,211,238,0.1)', animationDelay: '1000ms' }}
        />
        <div 
          className="absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-screen filter blur-3xl animate-pulse"
          style={{ backgroundColor: 'rgba(6,101,255,0.08)', animationDelay: '2000ms' }}
        />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:6rem_4rem]" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 mb-6">
            <span 
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: '#22d3ee' }}
            />
            Pricing Plans
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
            Made Just for{" "}
            <span 
              className="bg-clip-text text-transparent animate-gradient-x"
              style={{
                backgroundImage: 'linear-gradient(90deg, #0665ff 50%, #22d3ee 100%)'
              }}
            >
              Your Business
            </span>
          </h2>
          
          <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Transparent Indian pricing — simple, affordable, 
            <br className="hidden sm:block" />
            and built to scale your brand with AI.
          </p>

          {/* Monthly/Annual Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 bg-white/5 rounded-full p-1 border border-white/10">
            <button 
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                !isAnnual 
                  ? 'text-white shadow-lg' 
                  : 'text-white/60 hover:text-white'
              }`}
              style={!isAnnual ? {
                background: 'linear-gradient(135deg, #0665ff, #22d3ee)',
                boxShadow: '0 4px 15px rgba(6,101,255,0.25)'
              } : {}}
            >
              Monthly
            </button>
            <button 
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                isAnnual 
                  ? 'text-white shadow-lg' 
                  : 'text-white/60 hover:text-white'
              }`}
              style={isAnnual ? {
                background: 'linear-gradient(135deg, #0665ff, #22d3ee)',
                boxShadow: '0 4px 15px rgba(6,101,255,0.25)'
              } : {}}
            >
              Annual
              <span 
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={isAnnual ? 
                  { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' } : 
                  { backgroundColor: 'rgba(34,211,238,0.2)', color: '#22d3ee' }
                }
              >
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-start">
          {tiers.map((tier) => (
            <div key={tier.name} className={tier.highlighted ? "lg:-mt-4 lg:-mb-4" : "lg:mt-4"}>
              <PricingCard
                tier={tier}
                isAnnual={isAnnual}
                isHovered={hoveredCard === tier.name}
                onHover={setHoveredCard}
              />
            </div>
          ))}
        </div>

        {/* Bottom trust section */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-white/40 flex-wrap">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: '#22d3ee' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              SOC2 Compliant
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: '#22d3ee' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Bank-grade Security
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: '#22d3ee' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              All Payment Methods
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}