/**
 * AdCampaignDashboard.tsx — v3 (Updated with Publish Plan)
 * • Three white cards: Ad Setting (blue accent) | Meta Post Preview (center) | Creative Studio (purple accent)
 * • Target Audience (green accent) + Ad Copy (amber accent) in left column
 * • Creative Studio: editable heading/subheading inputs auto-filled from props, variant pills, char count
 * • Meta Post: profile logo+name from props, image creative, CTA row, reactions — no extra chrome
 * • AI image gen via DALL-E 3, upload from folder, thumbnail grid
 * • Platform gating — all sections locked when non-Meta platform is active
 * • NEW: Publish plan modal with Free, Silver, Gold options
 */

import React, { useState, useCallback, useRef } from 'react';

/* ─── TYPES ─────────────────────────────────────────────── */
export interface Platform {
  id: string;
  name: string;
  icon?: React.ReactNode;
  bg: string;
  color: string;
  active?: boolean;
}
export interface BrandInfo {
name?: string;
tagline?: string;
industry?: string;
founded?: string;
businessModel?: string;
toneOfVoice?: string;
registeredAddress?: string;
CIN?: string;
overallScore?: number;
}

export interface BrandDetails {
brandId?: string;
campaignId?: string;

brand?: BrandInfo;

brandName?: string;
industry?: string;
tagline?: string;

website?: string;

logo?: string;
logoUrl?: string;
logoPreview?: string;

coreObjective?: string;

websiteAudit?: any;
keywords?: any;
competition?: any;
analyticsDashboard?: any;
budget?: any;

avgCpc?: number;
avgCtr?: number;
conversionRate?: number;

assets?: BrandAssets;

auditData?: any;
}
export interface PromoObjectiveData {
businessType?: string;
adGoal?: string;
businessGoal?: string;

targetLocations?: string;

platform?: string;
platforms?: string[];

promotionType?: string;

dailyBudget?: number;

objective?: string;
budget?: number | string;
currency?: string;
schedule?: string;

targetLocation?: string;

event?: string;
advantagePlus?: boolean;

headlines?: string[];
primaryTexts?: string[];

callToAction?: string;
finalUrl?: string;

estimatedAudience?: string;
}
export interface PublishResult { success:boolean; campaignId?:string; message?:string; }
interface CampaignEntry { id:string; name:string; platformId:string; }

// New types for publish plan
export interface PublishPlan {
  id: string;
  name: string;
  price: string;
  priceYearly?: string;
  features: string[];
  popular?: boolean;
  color: string;
  icon?: React.ReactNode;
}

export interface AdCampaignDashboardProps {
  brandDetails?: BrandDetails; promoData?: PromoObjectiveData; campaignId?: string;
  platforms?: Platform[]; onBack?: ()=>void;
  onPublish?: (r:PublishResult, planId?: string) => void; onSaveDraft?: (r:PublishResult)=>void;
  onAddCampaign?: (pid:string)=>void; apiBase?: string; openAiKey?: string;
}

export interface BrandAssets {
logoUrl?: string;
logoPreview?: string;
favicon?: string;
websiteScreenshot?: string;
websiteImages?: string[];
brandColors?: string[];
}

/* ─── PLAN ICONS ─────────────────────────────────────────── */
const PlanIcons = {
  free: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  silver: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="4" fill="white" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  gold: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="4" fill="white" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 8L13.5 11.5L17 12L14.5 14.5L15 18L12 16L9 18L9.5 14.5L7 12L10.5 11.5L12 8Z" fill="white" stroke="currentColor" strokeWidth="1"/>
    </svg>
  )
};

/* ─── PUBLISH PLAN MODAL ──────────────────────────────────── */
function PublishPlanModal({ 
  isOpen, 
  onClose, 
  onSelectPlan,
  loading 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelectPlan: (planId: string) => void;
  loading: boolean;
}) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans: PublishPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      features: [
        '1 campaign per month',
        'Basic analytics',
        'Email support',
        'Standard publishing',
        'Limited AI image generation'
      ],
      color: '#64748b',
      icon: PlanIcons.free()
    },
    {
      id: 'silver',
      name: 'Silver',
      price: billingCycle === 'monthly' ? '$29' : '$290',
      priceYearly: billingCycle === 'yearly' ? '$290' : undefined,
      features: [
        '10 campaigns per month',
        'Advanced analytics',
        'Priority email support',
        'Scheduled publishing',
        'Unlimited AI image generation',
        'A/B testing'
      ],
      popular: true,
      color: '#94a3b8',
      icon: PlanIcons.silver()
    },
    {
      id: 'gold',
      name: 'Gold',
      price: billingCycle === 'monthly' ? '$79' : '$790',
      priceYearly: billingCycle === 'yearly' ? '$790' : undefined,
      features: [
        'Unlimited campaigns',
        'Real-time analytics',
        '24/7 priority support',
        'Advanced scheduling',
        'Unlimited AI image generation',
        'A/B testing',
        'Multi-platform publishing',
        'Custom integrations'
      ],
      color: '#fbbf24',
      icon: PlanIcons.gold()
    }
  ];

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      animation: 'fadeIn 0.2s ease'
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        maxWidth: '900px',
        width: '90%',
        maxHeight: '85vh',
        overflow: 'auto',
        padding: '24px',
        position: 'relative',
        animation: 'slideUp 0.3s ease'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
            Choose Your Publishing Plan
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Select the perfect plan for your campaign needs
          </p>
        </div>

        {/* Billing Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '32px',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '40px',
          width: 'fit-content',
          margin: '0 auto 32px'
        }}>
          <button
            onClick={() => setBillingCycle('monthly')}
            style={{
              padding: '8px 24px',
              borderRadius: '32px',
              border: 'none',
              background: billingCycle === 'monthly' ? 'white' : 'transparent',
              color: billingCycle === 'monthly' ? '#1877f2' : '#64748b',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: billingCycle === 'monthly' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            style={{
              padding: '8px 24px',
              borderRadius: '32px',
              border: 'none',
              background: billingCycle === 'yearly' ? 'white' : 'transparent',
              color: billingCycle === 'yearly' ? '#1877f2' : '#64748b',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: billingCycle === 'yearly' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
              position: 'relative'
            }}
          >
            Yearly
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-12px',
              background: '#16a34a',
              color: 'white',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '12px',
              fontWeight: 600
            }}>
              Save 20%
            </span>
          </button>
        </div>

        {/* Plans Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {plans.map(plan => (
            <div key={plan.id} style={{
              border: `2px solid ${plan.popular ? plan.color : '#e2e8f0'}`,
              borderRadius: '16px',
              padding: '24px',
              position: 'relative',
              background: 'white',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              ':hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
              }
            }} onClick={() => onSelectPlan(plan.id)}>
              
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: plan.color,
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  Most Popular
                </div>
              )}

              {/* Plan Icon */}
              <div style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 16px',
                color: plan.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {plan.icon}
              </div>

              {/* Plan Name */}
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                textAlign: 'center',
                color: '#0f172a',
                marginBottom: '8px'
              }}>
                {plan.name}
              </h3>

              {/* Price */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: plan.color }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: '14px', color: '#64748b' }}>
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
                {plan.priceYearly && billingCycle === 'yearly' && (
                  <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>
                    Save ${parseInt(plan.priceYearly) / 10 * 2} yearly
                  </div>
                )}
              </div>

              {/* Features */}
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 24px 0',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '16px'
              }}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#475569',
                    marginBottom: '12px'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8L6 11L13 4" stroke={plan.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Select Button */}
              <button
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: `2px solid ${plan.color}`,
                  background: plan.popular ? plan.color : 'white',
                  color: plan.popular ? 'white' : plan.color,
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = plan.color;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = plan.popular ? plan.color : 'white';
                  e.currentTarget.style.color = plan.popular ? 'white' : plan.color;
                }}
              >
                Select {plan.name}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          paddingTop: '16px',
          borderTop: '1px solid #e2e8f0',
          fontSize: '12px',
          color: '#94a3b8'
        }}>
          All plans include basic support. Upgrade anytime. No long-term contracts.
        </div>

        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#94a3b8',
            padding: '4px',
            borderRadius: '4px'
          }}
        >
          ✕
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

/* ─── PLATFORM ICONS ───────────────────────────────────── */
const PlatformIcons = {
meta: (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    style={{ flex: 'none', lineHeight: 1 }}
  >
    <title>Meta</title>

    <path
      d="M6.897 4h-.024l-.031 2.615h.022c1.715 0 3.046 1.357 5.94 6.246l.175.297.012.02 1.62-2.438-.012-.019a48.763 48.763 0 0 0-1.098-1.716 28.01 28.01 0 0 0-1.175-1.629C10.413 4.932 8.812 4 6.896 4z"
      fill="url(#meta-0)"
    />
    <path
      d="M6.873 4C4.95 4.01 3.247 5.258 2.02 7.17a4.352 4.352 0 0 0-.01.017l2.254 1.231.011-.017c.718-1.083 1.61-1.774 2.568-1.785h.021L6.896 4h-.023z"
      fill="url(#meta-1)"
    />
    <path
      d="M2.019 7.17l-.011.017C1.2 8.447.598 9.995.274 11.664l-.005.022 2.534.6.004-.022c.27-1.467.786-2.828 1.456-3.845l.011-.017L2.02 7.17z"
      fill="url(#meta-2)"
    />
    <path
      d="M2.807 12.264l-2.533-.6-.005.022c-.177.918-.267 1.851-.269 2.786v.023l2.598.233v-.023a12.591 12.591 0 0 1 .21-2.44z"
      fill="url(#meta-3)"
    />
    <path
      d="M2.677 15.537a5.462 5.462 0 0 1-.079-.813v-.022L0 14.468v.024a8.89 8.89 0 0 0 .146 1.652l2.535-.585a4.106 4.106 0 0 1-.004-.022z"
      fill="url(#meta-4)"
    />
    <path
      d="M3.27 16.89c-.284-.31-.484-.756-.589-1.328l-.004-.021-2.535.585.004.021c.192 1.01.568 1.85 1.106 2.487l.014.017 2.018-1.745a2.106 2.106 0 0 1-.015-.016z"
      fill="url(#meta-5)"
    />
    <path
      d="M10.78 9.654c-1.528 2.35-2.454 3.825-2.454 3.825-2.035 3.2-2.739 3.917-3.871 3.917a1.545 1.545 0 0 1-1.186-.508l-2.017 1.744.014.017C2.01 19.518 3.058 20 4.356 20c1.963 0 3.374-.928 5.884-5.33l1.766-3.13a41.283 41.283 0 0 0-1.227-1.886z"
      fill="#0082FB"
    />
    <path
      d="M13.502 5.946l-.016.016c-.4.43-.786.908-1.16 1.416.378.483.768 1.024 1.175 1.63.48-.743.928-1.345 1.367-1.807l.016-.016-1.382-1.24z"
      fill="url(#meta-6)"
    />
    <path
      d="M20.918 5.713C19.853 4.633 18.583 4 17.225 4c-1.432 0-2.637.787-3.723 1.944l-.016.016 1.382 1.24.016-.017c.715-.747 1.408-1.12 2.176-1.12.826 0 1.6.39 2.27 1.075l.015.016 1.589-1.425-.016-.016z"
      fill="#0082FB"
    />
    <path
      d="M23.998 14.125c-.06-3.467-1.27-6.566-3.064-8.396l-.016-.016-1.588 1.424.015.016c1.35 1.392 2.277 3.98 2.361 6.971v.023h2.292v-.022z"
      fill="url(#meta-7)"
    />
    <path
      d="M23.998 14.15v-.023h-2.292v.022c.004.14.006.282.006.424 0 .815-.121 1.474-.368 1.95l-.011.022 1.708 1.782.013-.02c.62-.96.946-2.293.946-3.91 0-.083 0-.165-.002-.247z"
      fill="url(#meta-8)"
    />
    <path
      d="M21.344 16.52l-.011.02c-.214.402-.519.67-.917.787l.778 2.462a3.493 3.493 0 0 0 .438-.182 3.558 3.558 0 0 0 1.366-1.218l.044-.065.012-.02-1.71-1.784z"
      fill="url(#meta-9)"
    />
    <path
      d="M19.92 17.393c-.262 0-.492-.039-.718-.14l-.798 2.522c.449.153.927.222 1.46.222.492 0 .943-.073 1.352-.215l-.78-2.462c-.167.05-.341.075-.517.073z"
      fill="url(#meta-10)"
    />
    <path
      d="M18.323 16.534l-.014-.017-1.836 1.914.016.017c.637.682 1.246 1.105 1.937 1.337l.797-2.52c-.291-.125-.573-.353-.9-.731z"
      fill="url(#meta-11)"
    />
    <path
      d="M18.309 16.515c-.55-.642-1.232-1.712-2.303-3.44l-1.396-2.336-.011-.02-1.62 2.438.012.02.989 1.668c.959 1.61 1.74 2.774 2.493 3.585l.016.016 1.834-1.914a2.353 2.353 0 0 1-.014-.017z"
      fill="url(#meta-12)"
    />

    <defs>
      <linearGradient id="meta-0" x1="75.897%" x2="26.312%" y1="89.199%" y2="12.194%">
        <stop offset=".06%" stopColor="#0867DF" />
        <stop offset="45.39%" stopColor="#0668E1" />
        <stop offset="85.91%" stopColor="#0064E0" />
      </linearGradient>

      <linearGradient id="meta-1" x1="21.67%" x2="97.068%" y1="75.874%" y2="23.985%">
        <stop offset="13.23%" stopColor="#0064DF" />
        <stop offset="99.88%" stopColor="#0064E0" />
      </linearGradient>

      <linearGradient id="meta-2" x1="38.263%" x2="60.895%" y1="89.127%" y2="16.131%">
        <stop offset="1.47%" stopColor="#0072EC" />
        <stop offset="68.81%" stopColor="#0064DF" />
      </linearGradient>

      <linearGradient id="meta-3" x1="47.032%" x2="52.15%" y1="90.19%" y2="15.745%">
        <stop offset="7.31%" stopColor="#007CF6" />
        <stop offset="99.43%" stopColor="#0072EC" />
      </linearGradient>

      <linearGradient id="meta-4" x1="52.155%" x2="47.591%" y1="58.301%" y2="37.004%">
        <stop offset="7.31%" stopColor="#007FF9" />
        <stop offset="100%" stopColor="#007CF6" />
      </linearGradient>

      <linearGradient id="meta-5" x1="37.689%" x2="61.961%" y1="12.502%" y2="63.624%">
        <stop offset="7.31%" stopColor="#007FF9" />
        <stop offset="100%" stopColor="#0082FB" />
      </linearGradient>

      <linearGradient id="meta-6" x1="34.808%" x2="62.313%" y1="68.859%" y2="23.174%">
        <stop offset="27.99%" stopColor="#007FF8" />
        <stop offset="91.41%" stopColor="#0082FB" />
      </linearGradient>

      <linearGradient id="meta-7" x1="43.762%" x2="57.602%" y1="6.235%" y2="98.514%">
        <stop offset="0%" stopColor="#0082FB" />
        <stop offset="99.95%" stopColor="#0081FA" />
      </linearGradient>

      <linearGradient id="meta-8" x1="60.055%" x2="39.88%" y1="4.661%" y2="69.077%">
        <stop offset="6.19%" stopColor="#0081FA" />
        <stop offset="100%" stopColor="#0080F9" />
      </linearGradient>

      <linearGradient id="meta-9" x1="30.282%" x2="61.081%" y1="59.32%" y2="33.244%">
        <stop offset="0%" stopColor="#027AF3" />
        <stop offset="100%" stopColor="#0080F9" />
      </linearGradient>

      <linearGradient id="meta-10" x1="20.433%" x2="82.112%" y1="50.001%" y2="50.001%">
        <stop offset="0%" stopColor="#0377EF" />
        <stop offset="99.94%" stopColor="#0279F1" />
      </linearGradient>

      <linearGradient id="meta-11" x1="40.303%" x2="72.394%" y1="35.298%" y2="57.811%">
        <stop offset=".19%" stopColor="#0471E9" />
        <stop offset="100%" stopColor="#0377EF" />
      </linearGradient>

      <linearGradient id="meta-12" x1="32.254%" x2="68.003%" y1="19.719%" y2="84.908%">
        <stop offset="27.65%" stopColor="#0867DF" />
        <stop offset="100%" stopColor="#0471E9" />
      </linearGradient>
    </defs>
  </svg>
),

  google: (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.6h12.4c-.5 2.8-2.1 5.2-4.5 6.8v5.6h7.3c4.3-3.9 6.9-9.7 6.9-16.5z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.6c-2.1 1.4-4.7 2.2-8.6 2.2-6.6 0-12.2-4.5-14.2-10.5H2.3v5.8C6.3 42.6 14.6 48 24 48z" />
    <path fill="#FBBC05" d="M9.8 28.3c-.5-1.4-.8-2.9-.8-4.3s.3-2.9.8-4.3v-5.8H2.3C.8 17.1 0 20.5 0 24s.8 6.9 2.3 10.1l7.5-5.8z" />
    <path fill="#EA4335" d="M24 9.5c3.7 0 7 1.3 9.6 3.8l7.2-7.2C36.9 2.1 31.5 0 24 0 14.6 0 6.3 5.4 2.3 13.9l7.5 5.8C11.8 14 17.4 9.5 24 9.5z" />
  </svg>
  ),

  x: (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#e7e7e7">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
  ),

  linkedin: (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0a66c2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
  ),
};

/* ─── DEFAULTS ──────────────────────────────────────────── */
const DEFAULT_PLATFORMS: Platform[] = [
  {
    id: 'meta',
    name: 'Meta',
    icon: PlatformIcons.meta,
    bg: '#ffffff',
    color: '#1877f2',
    active: true,
  },
  {
    id: 'google',
    name: 'Google',
    icon: PlatformIcons.google,
    bg: '#ffffff',
    color: '#1a7f37',
  },
  {
    id: 'x',
    name: 'X',
    icon: PlatformIcons.x,
    bg: '#202022',
    color: '#111827',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: PlatformIcons.linkedin,
    bg: '#ffffff',
    color: '#0369a1',
  },
];

const SEED = {
  topbarFields: [
    {label:'* Meta AD Account', placeholder:'Select account'},
    {label:'* Page',            placeholder:'Select page'},
    {label:'Instagram Account', placeholder:'Select'},
    {label:'Pixel',             placeholder:'Select pixel'},
  ],
  adSetting:  {event:'Purchase', budget:'5.83 USD', schedule:'May 08, 2026', finalUrl:''},
  audience:   {location:'India', advantagePlus:true},
  preview:    {brandName:'Brand', caption:'Discover our latest campaign — built for results.', cta:'Shop Now', estimatedAudience:'394,400,000 – 464,000,000+'},
  adCopy:     {headlines:['Powerful Solutions for Every Business','Grow Your Brand Today','Results That Matter'],
               primaryTexts:['Discover our latest campaign — built for results.','Affordable and eco-friendly solutions for homes and businesses.'],
               callToAction:'Shop Now'},
};

/* ─── GLOBAL CSS ─────────────────────────────────────────── */
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  .acd-root*,.acd-root *::before,.acd-root *::after{box-sizing:border-box;margin:0;padding:0;}
  .acd-root{
    --bg:#f0f2f7;--card:#fff;--bdr:#e2e8f0;--bdr2:#cbd5e1;
    --t1:#0f172a;--t2:#475569;--t3:#94a3b8;
    --blue:#1877f2;--blue-lt:#e8f0fe;--blue-bdr:#bfdbfe;
    --green:#16a34a;--green-lt:#dcfce7;--green-bdr:#bbf7d0;
    --purple:#7c3aed;--purple-lt:#f3e8ff;--purple-bdr:#ddd6fe;
    --amber:#d97706;--amber-lt:#fef3c7;--amber-bdr:#fde68a;
    --red:#dc2626;
    --sh:0 1px 3px rgba(0,0,0,.07),0 4px 12px rgba(0,0,0,.04);
    --r:14px;
    --font:'Inter',system-ui,sans-serif;
    background:var(--bg);color:var(--t1);
    font-family:var(--font);font-size:13px;-webkit-font-smoothing:antialiased;
    display:flex;height:100vh;min-height:600px;
  }
  .acd-root ::-webkit-scrollbar{width:4px;height:4px;}
  .acd-root ::-webkit-scrollbar-track{background:#f1f5f9;}
  .acd-root ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}

  .sid-cam:hover{background:#f8fafc!important;}
  .sid-plat:hover{background:#f8fafc!important;}
  .add-btn:hover{background:#e2e8f0!important;}
  .tb-sel:hover{border-color:var(--blue)!important;}
  .btn-back:hover{background:#f1f5f9!important;}
  .btn-pub:hover:not(:disabled){background:#1558c0!important;}
  .btn-draft:hover:not(:disabled){background:#f8fafc!important;}
  .gen-btn:hover:not(:disabled){background:#6d28d9!important;}
  .gen-btn:disabled{opacity:.45;cursor:not-allowed;}
  .tag-pill{cursor:pointer;transition:all .12s;}
  .tag-pill:hover{background:#f1f5f9!important;border-color:#94a3b8!important;}
  .tag-pill.on{background:var(--blue-lt)!important;border-color:var(--blue)!important;color:var(--blue)!important;font-weight:700;}
  .img-th{cursor:pointer;transition:all .15s;}
  .img-th:hover{border-color:var(--blue)!important;transform:scale(1.04);}
  .img-th.sel{border-color:var(--blue)!important;box-shadow:0 0 0 3px #1877f230;}
  .hd-in:focus,.pt-ta:focus{outline:none;border-color:var(--blue)!important;box-shadow:0 0 0 3px #1877f218;}
  .up-btn:hover{background:#f1f5f9!important;}

  .acd-toast{position:fixed;bottom:24px;right:24px;z-index:9999;background:#fff;border:1px solid var(--bdr);
    color:var(--t1);padding:10px 18px;border-radius:12px;font-size:12px;font-weight:600;
    box-shadow:0 8px 32px #0002;animation:acd-fi .2s ease;display:flex;align-items:center;gap:8px;}
  .acd-toast.success{border-color:var(--green-bdr);color:var(--green);}
  .acd-toast.error{border-color:#fecaca;color:var(--red);}
  @keyframes acd-fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

  @keyframes spin{to{transform:rotate(360deg)}}
  .spinner{width:13px;height:13px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;}

  @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
  .shimmer{background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:800px 100%;animation:shimmer 1.4s infinite;}
`;

/* ─── HELPERS ────────────────────────────────────────────── */
const card = (ex:React.CSSProperties={}):React.CSSProperties =>
  ({background:'var(--card)',border:'1px solid var(--bdr)',borderRadius:'var(--r)',padding:16,boxShadow:'var(--sh)',position:'relative',...ex});
const secLabel=(color='var(--t2)'):React.CSSProperties =>
  ({fontSize:11,fontWeight:700,color,textTransform:'uppercase' as const,letterSpacing:'.6px',marginBottom:8,display:'flex',alignItems:'center',gap:6});
const fL:React.CSSProperties={fontSize:11,color:'var(--t3)',fontWeight:500,marginBottom:3};
const fV:React.CSSProperties={fontSize:13,fontWeight:600,color:'var(--t1)'};
const fVB:React.CSSProperties={fontSize:13,fontWeight:600,color:'var(--blue)'};
const hr:React.CSSProperties={border:'none',borderTop:'1px solid var(--bdr)',margin:'12px 0'};

/* ─── ICONS ─────────────────────────────────────────────── */
const I={
  Settings:()=><svg width="14"height="14"viewBox="0 0 16 16"fill="none"><path d="M8 10a2 2 0 100-4 2 2 0 000 4z"stroke="currentColor"strokeWidth="1.4"/><path d="M13.5 8a5.5 5.5 0 01-.1 1l1.4 1.1-1.5 2.6-1.7-.7a5.5 5.5 0 01-1.7 1l-.3 1.8h-3l-.3-1.8a5.5 5.5 0 01-1.7-1l-1.7.7L1.2 10.1 2.6 9A5.5 5.5 0 012.5 8a5.5 5.5 0 01.1-1L1.2 5.9l1.5-2.6 1.7.7a5.5 5.5 0 011.7-1L6.4 1.3h3l.3 1.7a5.5 5.5 0 011.7 1l1.7-.7 1.5 2.6-1.4 1.1a5.5 5.5 0 01.1 1z"stroke="currentColor"strokeWidth="1.3"/></svg>,
  Users:()=><svg width="14"height="14"viewBox="0 0 16 16"fill="none"><circle cx="8"cy="6"r="2.5"stroke="currentColor"strokeWidth="1.4"/><path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5"stroke="currentColor"strokeWidth="1.4"strokeLinecap="round"/></svg>,
  TextIcon:()=><svg width="14"height="14"viewBox="0 0 16 16"fill="none"><rect x="2"y="3"width="12"height="2"rx="1"fill="currentColor"/><rect x="2"y="7"width="9"height="2"rx="1"fill="currentColor"/><rect x="2"y="11"width="11"height="2"rx="1"fill="currentColor"/></svg>,
  ImgIcon:()=><svg width="14"height="14"viewBox="0 0 16 16"fill="none"><rect x="1.5"y="1.5"width="13"height="13"rx="2.5"stroke="currentColor"strokeWidth="1.4"/><path d="M1.5 10.5l4-4 3 3 2-2.5 4 4.5"stroke="currentColor"strokeWidth="1.3"strokeLinecap="round"strokeLinejoin="round"/><circle cx="5.5"cy="5.5"r="1.5"fill="currentColor"/></svg>,
  Sparkle:()=><svg width="13"height="13"viewBox="0 0 16 16"fill="none"><path d="M8 2v3M8 11v3M2 8h3M11 8h3M3.8 3.8l2 2M10.2 10.2l2 2M10.2 3.8l-2 2M5.8 10.2l-2 2"stroke="currentColor"strokeWidth="1.5"strokeLinecap="round"/></svg>,
  Upload:()=><svg width="15"height="15"viewBox="0 0 16 16"fill="none"><path d="M8 10V4M5.5 6.5L8 4l2.5 2.5"stroke="currentColor"strokeWidth="1.5"strokeLinecap="round"strokeLinejoin="round"/><rect x="2"y="12"width="12"height="1.5"rx=".75"fill="currentColor"/></svg>,
  Plus:()=><svg width="11"height="11"viewBox="0 0 12 12"fill="none"><path d="M6 1v10M1 6h10"stroke="currentColor"strokeWidth="1.6"strokeLinecap="round"/></svg>,
  ChevL:()=><svg width="14"height="14"viewBox="0 0 16 16"fill="none"><path d="M10 4L6 8l4 4"stroke="currentColor"strokeWidth="1.5"strokeLinecap="round"strokeLinejoin="round"/></svg>,
  Check:()=><svg width="10"height="10"viewBox="0 0 16 16"fill="none"><path d="M3 8l4 4 6-7"stroke="currentColor"strokeWidth="2.2"strokeLinecap="round"strokeLinejoin="round"/></svg>,
  Lock:()=><svg width="13"height="13"viewBox="0 0 16 16"fill="none"><rect x="3"y="7"width="10"height="8"rx="2"stroke="currentColor"strokeWidth="1.4"/><path d="M5 7V5.5a3 3 0 016 0V7"stroke="currentColor"strokeWidth="1.4"/></svg>,
  Arrow:()=><svg width="13"height="13"viewBox="0 0 16 16"fill="none"><path d="M2 8h12M8 2l6 6-6 6"stroke="currentColor"strokeWidth="1.5"strokeLinecap="round"strokeLinejoin="round"/></svg>,
  Like:()=><svg width="15"height="15"viewBox="0 0 24 24"fill="none"><path d="M7 22V11M2 13v7a2 2 0 002 2h11.17a2 2 0 001.97-1.67l1.5-8A2 2 0 0016.67 11H13V7a2 2 0 00-2-2 1 1 0 00-1 1v.5L8.5 10.5"stroke="currentColor"strokeWidth="1.7"strokeLinecap="round"/></svg>,
  Comment:()=><svg width="15"height="15"viewBox="0 0 24 24"fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"stroke="currentColor"strokeWidth="1.7"strokeLinecap="round"strokeLinejoin="round"/></svg>,
  Share:()=><svg width="15"height="15"viewBox="0 0 24 24"fill="none"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"stroke="currentColor"strokeWidth="1.7"strokeLinecap="round"strokeLinejoin="round"/></svg>,
  Dots:()=><svg width="16"height="16"viewBox="0 0 24 24"fill="currentColor"><circle cx="5"cy="12"r="2"/><circle cx="12"cy="12"r="2"/><circle cx="19"cy="12"r="2"/></svg>,
  X:()=><svg width="12"height="12"viewBox="0 0 16 16"fill="none"><path d="M4 4l8 8M12 4l-8 8"stroke="currentColor"strokeWidth="1.6"strokeLinecap="round"/></svg>,
  Globe:()=><svg width="10"height="10"viewBox="0 0 16 16"fill="none"><circle cx="8"cy="8"r="6"stroke="currentColor"strokeWidth="1.3"/><path d="M8 2c-2 2-2 8 0 12M8 2c2 2 2 8 0 12M2 8h12"stroke="currentColor"strokeWidth="1.2"/></svg>,
};

/* ─── TOAST ─────────────────────────────────────────────── */
function Toast({message,type}:{message:string;type:'success'|'error'|'info'}){
  const dot=type==='success'?'var(--green)':type==='error'?'var(--red)':'var(--blue)';
  return<div className={`acd-toast ${type}`}><span style={{width:7,height:7,borderRadius:'50%',background:dot,display:'inline-block',flexShrink:0}}/>{message}</div>;
}

/* ─── DISABLED OVERLAY ───────────────────────────────────── */
function DisabledOverlay(){
  return(
    <div style={{position:'absolute',inset:0,background:'rgba(255,255,255,.88)',borderRadius:'var(--r)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,zIndex:5,backdropFilter:'blur(2px)'}}>
      <span style={{color:'var(--t3)'}}><I.Lock/></span>
      <span style={{fontSize:11,color:'var(--t3)',fontWeight:500,textAlign:'center',padding:'0 16px',lineHeight:1.6}}>Switch to Meta to enable</span>
    </div>
  );
}

/* ─── SIDEBAR ────────────────────────────────────────────── */
function Sidebar({platforms,campaigns,activePlatformId,activeCampaignId,onPlatformSwitch,onSelectCampaign,onAddCampaign}:{
  platforms:Platform[];campaigns:CampaignEntry[];activePlatformId:string;activeCampaignId:string;
  onPlatformSwitch:(pid:string)=>void;onSelectCampaign:(cid:string)=>void;onAddCampaign:(pid:string)=>void;
}){
  const ap=platforms.find(p=>p.id===activePlatformId)??platforms[0];
  const others=platforms.filter(p=>p.id!==activePlatformId);
  const aCamps=campaigns.filter(c=>c.platformId===activePlatformId);
  const cntFor=(pid:string)=>campaigns.filter(c=>c.platformId===pid).length;
  return(
    <aside style={{width:210,minWidth:210,background:'#fff',borderRight:'1px solid var(--bdr)',display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{padding:'16px 14px 12px',borderBottom:'1px solid var(--bdr)',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:10}}>
          <div style={{width:52,height:52,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:31,color:ap.color,background:ap.bg,flexShrink:0}}>{ap.icon}</div>
          <span style={{fontSize:13,fontWeight:700,color:'var(--t1)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ap.name}</span>
          <span style={{fontSize:10,background:ap.bg,color:ap.color,padding:'2px 8px',borderRadius:20,fontWeight:700}}>{aCamps.length}</span>
        </div>
        <div style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:10,color:'var(--green)',background:'var(--green-lt)',padding:'4px 9px',borderRadius:20,fontWeight:600}}>
          <span style={{width:5,height:5,borderRadius:'50%',background:'var(--green)',display:'inline-block'}}/>Active Platform
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'10px 8px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 6px',marginBottom:6}}>
          <span style={{fontSize:9,color:'var(--t3)',textTransform:'uppercase',letterSpacing:1,fontWeight:600}}>Campaigns</span>
          <button className="add-btn" onClick={()=>onAddCampaign(activePlatformId)} style={{width:20,height:20,borderRadius:5,border:'1px solid var(--bdr)',background:'#f8fafc',color:'var(--t3)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',padding:0}}><I.Plus/></button>
        </div>
        {aCamps.length===0
          ?<div style={{padding:'8px 8px 12px',fontSize:11,color:'var(--t3)',textAlign:'center'}}>No campaigns. <span style={{color:'var(--blue)',cursor:'pointer'}} onClick={()=>onAddCampaign(activePlatformId)}>+ Add</span></div>
          :aCamps.map(c=>{const a=c.id===activeCampaignId;return(
            <div key={c.id} className="sid-cam" onClick={()=>onSelectCampaign(c.id)} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 8px',borderRadius:9,cursor:'pointer',marginBottom:2,background:a?'#eff6ff':'transparent',border:a?'1px solid var(--blue-bdr)':'1px solid transparent'}}>
              {a?<span style={{width:3,height:18,background:'var(--blue)',borderRadius:2,flexShrink:0}}/>:<span style={{width:7,height:7,borderRadius:'50%',border:'1.5px solid var(--bdr2)',flexShrink:0}}/>}
              <span style={{fontSize:12,color:a?'var(--blue)':'var(--t2)',fontWeight:a?600:400,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</span>
              {a&&<span style={{color:'var(--blue)'}}><I.Check/></span>}
            </div>
          );})}
        {others.length>0&&<>
          <div style={{fontSize:9,color:'var(--t3)',textTransform:'uppercase',letterSpacing:1,padding:'12px 6px 5px',fontWeight:600}}>Other Platforms</div>
          {others.map(p=>(
            <div key={p.id} className="sid-plat" style={{display:'flex',alignItems:'center',gap:8,padding:'7px 8px',borderRadius:9,marginBottom:2,border:'1px solid transparent',cursor:'default'}}>
              <div title={`Switch to ${p.name}`} onClick={()=>onPlatformSwitch(p.id)} style={{width:32,height:32,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:31,fontWeight:800,background:p.bg,color:p.color,flexShrink:0,cursor:'pointer'}}>{p.icon}</div>
              <span onClick={()=>onPlatformSwitch(p.id)} style={{fontSize:12,color:'var(--t2)',flex:1,cursor:'pointer',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</span>
              {cntFor(p.id)>0&&<span style={{fontSize:9,color:'var(--t3)',background:'#f8fafc',padding:'1px 6px',borderRadius:10,border:'1px solid var(--bdr)'}}>{cntFor(p.id)}</span>}
              <button className="add-btn" onClick={e=>{e.stopPropagation();onAddCampaign(p.id);}} style={{width:18,height:18,borderRadius:4,border:'1px solid var(--bdr)',background:'#f8fafc',color:'var(--t3)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',padding:0,flexShrink:0}}><I.Plus/></button>
            </div>
          ))}
        </>}
      </div>
    </aside>
  );
}

/* ─── TOP BAR ────────────────────────────────────────────── */
function TopBar({fields,activePlatformId}:{fields:{label:string;placeholder:string}[];activePlatformId:string}){
  const en=activePlatformId==='meta';
  return(
    <div style={{display:'flex',gap:10,padding:'12px 16px',borderBottom:'1px solid var(--bdr)',background:'#fff',alignItems:'flex-end',flexWrap:'wrap',flexShrink:0,position:'relative'}}>
      {fields.map(f=>(
        <div key={f.label} style={{display:'flex',flexDirection:'column',gap:4,flex:1,minWidth:110,opacity:en?1:.4,pointerEvents:en?'auto':'none',transition:'opacity .2s'}}>
          <span style={{fontSize:10,color:'var(--blue)',fontWeight:700,letterSpacing:'.3px'}}>{f.label}</span>
          <div className="tb-sel" style={{background:'#f8fafc',border:'1px solid var(--bdr)',borderRadius:8,padding:'7px 10px',color:'var(--t3)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',transition:'border-color .15s'}}>
            <span>{f.placeholder}</span><span style={{color:'var(--t3)',fontSize:10}}>▾</span>
          </div>
        </div>
      ))}
      {!en&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontSize:11,color:'var(--t3)',background:'rgba(255,255,255,.7)',backdropFilter:'blur(2px)',zIndex:2}}><I.Lock/> Switch to Meta to configure</div>}
    </div>
  );
}

/* ─── LEFT CARDS ─────────────────────────────────────────── */
function AdSettingCard({event,budget,schedule,finalUrl,enabled}:{event:string;budget:string;schedule:string;finalUrl:string;enabled:boolean}){
  return(
    <div style={{...card(),borderTop:'3px solid var(--blue)',position:'relative'}}>
      <div style={secLabel('var(--blue)')}><I.Settings/> Ad Setting</div>
      <div style={{display:'flex',justifyContent:'space-between',gap:8,marginBottom:12}}>
        <div><div style={fL}>Event</div><div style={fV}>{event}</div></div>
        <div style={{textAlign:'right'}}><div style={fL}>Budget</div><div style={fVB}>{budget}</div></div>
      </div>
      <div style={hr}/>
      <div style={{marginBottom:12}}><div style={fL}>Schedule</div><div style={fV}>{schedule}</div></div>
      <div><div style={fL}>Final URL</div><div style={{...fVB,fontSize:11,wordBreak:'break-all'}}>{finalUrl}</div></div>
      {!enabled&&<DisabledOverlay/>}
    </div>
  );
}

function TargetAudienceCard({location,advantagePlus,enabled}:{location:string;advantagePlus:boolean;enabled:boolean}){
  return(
    <div style={{...card(),borderTop:'3px solid var(--green)',position:'relative'}}>
      <div style={secLabel('var(--green)')}><I.Users/> Target Audience</div>
      <div style={{marginBottom:14}}><div style={fL}>Locations</div><div style={fV}>{location}</div></div>
      {advantagePlus&&(
        <div style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:11,fontWeight:700,color:'#15803d',background:'var(--green-lt)',border:'1px solid var(--green-bdr)',padding:'5px 12px',borderRadius:20}}>
          ✦ Advantage+ on
          <span style={{width:16,height:16,borderRadius:'50%',border:'1px solid #86efac',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'#15803d',cursor:'pointer'}}>i</span>
        </div>
      )}
      {!enabled&&<DisabledOverlay/>}
    </div>
  );
}

/* ─── META POST PREVIEW ──────────────────────────────────── */
function MetaPostPreview({brandName,logoUrl,caption,cta,estimatedAudience,imageUrl,activePlatformId}:{
  brandName:string;logoUrl?:string;caption:string;cta:string;estimatedAudience:string;imageUrl:string|null;activePlatformId:string;
}){
  const isMeta=activePlatformId==='meta';
  console.log('Preview data:',{brandName,logoUrl,caption,cta,estimatedAudience,imageUrl});
  return(
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {/* label row */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{width:7,height:7,borderRadius:'50%',background:isMeta?'var(--blue)':'var(--t3)',display:'inline-block'}}/>
          <span style={{fontSize:11,fontWeight:700,color:'var(--t2)',textTransform:'uppercase',letterSpacing:'.6px'}}>
            {isMeta?'Meta Feed Preview':'Ad Preview'}
          </span>
        </div>
        <span style={{fontSize:10,background:'var(--blue-lt)',color:'var(--blue)',padding:'3px 10px',borderRadius:20,fontWeight:700,border:'1px solid var(--blue-bdr)'}}>Ad 1</span>
      </div>

      {/* Facebook-style post */}
      <div style={{background:'#fff',borderRadius:10,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,.13)',border:'2px solid #c5cee0'}}>

        {/* Header */}
        <div style={{padding:'12px 14px 8px',display:'flex',alignItems:'center',gap:9}}>
          <div style={{width:40,height:40,borderRadius:'50%',overflow:'hidden',flexShrink:0,background:'var(--blue-lt)',border:'2px solid #e8f0fe',display:'flex',alignItems:'center',justifyContent:'center'}}>
            {logoUrl
              ?<img src={logoUrl} alt={brandName} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              :<span style={{fontSize:16,fontWeight:800,color:'var(--blue)'}}>{(brandName[0]??'B').toUpperCase()}</span>
            }
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:'#050505',lineHeight:1.2}}>{brandName}</div>
            <div style={{fontSize:11,color:'#65676b',display:'flex',alignItems:'center',gap:4,marginTop:1}}>Sponsored · <I.Globe/></div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10,color:'#65676b'}}><I.Dots/><I.X/></div>
        </div>

        {/* Caption */}
        <div style={{padding:'2px 14px 8px',fontSize:13,color:'#050505',lineHeight:1.65}}>{caption}</div>

        {/* Creative */}
        <div style={{width:'100%',aspectRatio:'1.91/1',background:'#f0f2f5',position:'relative',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {imageUrl
            ?<img src={imageUrl} alt="Ad creative" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            :<div style={{textAlign:'center',color:'#c0c8d0',display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
              <div style={{fontSize:40}}>🖼️</div>
              <div style={{fontSize:12,fontWeight:500}}>Upload or generate an image</div>
            </div>
          }
        </div>

        {/* CTA bar */}
        <div style={{padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#f0f2f5',borderTop:'1px solid #e4e6eb'}}>
          <div style={{fontSize:12,color:'#65676b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:180}}>{caption}</div>
          <button style={{background:'#e4e6eb',color:'#050505',border:'none',borderRadius:7,padding:'7px 18px',fontSize:13,fontWeight:700,cursor:'pointer',flexShrink:0,fontFamily:'inherit'}}>{cta}</button>
        </div>

        {/* Reactions */}
        <div style={{display:'flex',borderTop:'1px solid #e4e6eb'}}>
          {[{ic:<I.Like/>,l:'Like'},{ic:<I.Comment/>,l:'Comment'},{ic:<I.Share/>,l:'Share'}].map(({ic,l})=>(
            <button key={l} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontSize:13,color:'#65676b',fontWeight:600,cursor:'pointer',padding:'10px 4px',borderRadius:0,background:'none',border:'none',fontFamily:'inherit'}}>
              {ic}{l}
            </button>
          ))}
        </div>
      </div>

      {/* Audience bar */}
      <div style={card({padding:12})}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--blue)',marginBottom:6}}>Estimated audience: {estimatedAudience}</div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'var(--t3)',marginBottom:4,fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px'}}>
          <span>Narrow</span><span>Broad</span>
        </div>
        <div style={{background:'#f1f5f9',borderRadius:6,height:6,overflow:'hidden'}}>
          <div style={{height:'100%',borderRadius:6,background:'linear-gradient(90deg,var(--green),var(--blue))',width:'40%'}}/>
        </div>
      </div>
    </div>
  );
}

/* ─── CREATIVE STUDIO ────────────────────────────────────── */
function CreativeStudio({brandName,adCopy,activePlatformId,onHeadingChange,onSubheadingChange,onImageSelect,openAiKey}:{
  brandName:string;adCopy:{headlines:string[];primaryTexts:string[];callToAction:string};
  activePlatformId:string;onHeadingChange:(h:string)=>void;onSubheadingChange:(s:string)=>void;
  onImageSelect:(url:string)=>void;openAiKey?:string;
}){
  const[heading,setHeading]=useState(adCopy.headlines[0]??'');
  const[sub,setSub]=useState(adCopy.primaryTexts[0]??'');
  const[hIdx,setHIdx]=useState(0);
  const[sIdx,setSIdx]=useState(0);
  const[aiPrompt,setAiPrompt]=useState('');
  const[aiImgs,setAiImgs]=useState<string[]>([]);
  const[selImg,setSelImg]=useState<string|null>(null);
  const[loading,setLoading]=useState(false);
  const[aiErr,setAiErr]=useState<string|null>(null);
  const fileRef=useRef<HTMLInputElement>(null);
  const enabled=activePlatformId==='meta';

  const pickH=(h:string,i:number)=>{setHeading(h);setHIdx(i);onHeadingChange(h);};
  const pickS=(s:string,i:number)=>{setSub(s);setSIdx(i);onSubheadingChange(s);};
  const pickImg=(url:string)=>{setSelImg(url);onImageSelect(url);};

  const generate=async()=>{
    if(!aiPrompt.trim())return;
    setLoading(true);setAiErr(null);
    try{
      const key = '';
      if(!key)throw new Error('No OpenAI key — pass openAiKey prop or set window.__OPENAI_KEY');
      const r=await fetch('https://api.openai.com/v1/images/generations',{
        method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},
        body:JSON.stringify({model:'dall-e-3',prompt:aiPrompt,n:1,size:'1024x1024'}),
      });
      if(!r.ok){const e=await r.json();throw new Error(e.error?.message??`API ${r.status}`);}
      const d=await r.json();
      const url=d.data[0]?.url??'';
      if(url){setAiImgs(p=>[url,...p].slice(0,6));pickImg(url);}
    }catch(e){setAiErr(e instanceof Error?e.message:String(e));}
    finally{setLoading(false);}
  };

  const upload=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0];if(!f)return;
    const url=URL.createObjectURL(f);
    setAiImgs(p=>[url,...p].slice(0,6));pickImg(url);
  };

  return(
    <div style={{...card({padding:0}),borderTop:'3px solid var(--purple)',position:'relative',display:'flex',flexDirection:'column'}}>
      {/* Header */}
      <div style={{padding:'14px 16px 10px',borderBottom:'1px solid var(--bdr)',flexShrink:0}}>
        <div style={secLabel('var(--purple)')}><I.Sparkle/> Creative Studio</div>
        <div style={{fontSize:11,color:'var(--t3)'}}>Edit copy · Generate & select visuals</div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'14px 16px',display:'flex',flexDirection:'column',gap:16}}>

        {/* Heading */}
        <div>
          {/* <div style={{fontSize:11,fontWeight:700,color:'var(--t2)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8,display:'flex',alignItems:'center',gap:5}}>
            <span style={{color:'var(--blue)'}}><I.TextIcon/></span> Heading
          </div>
          <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:8}}>
            {adCopy.headlines.map((h,i)=>(
              <button key={i} className={`tag-pill${hIdx===i?' on':''}`} onClick={()=>pickH(h,i)}
                style={{fontSize:10,padding:'3px 11px',borderRadius:20,border:'1px solid var(--bdr)',background:'#f8fafc',color:'var(--t2)',fontFamily:'inherit'}}>
                H{i+1}
              </button>
            ))}
          </div> */}
          <input className="hd-in" value={heading}
            onChange={e=>{setHeading(e.target.value);onHeadingChange(e.target.value);}}
            style={{width:'100%',background:'#f8fafc',border:'1px solid var(--bdr)',borderRadius:8,padding:'9px 12px',color:'var(--t1)',fontSize:13,fontWeight:600,fontFamily:'inherit',transition:'all .15s'}}
            placeholder="Enter headline…"
          />
          <div style={{fontSize:10,color:'var(--t3)',marginTop:3}}>{heading.length}/125</div>
        </div>

        <div style={hr}/>

        {/* Subheading */}
        <div>
          <div style={{fontSize:11,fontWeight:700,color:'var(--t2)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8,display:'flex',alignItems:'center',gap:5}}>
            <span style={{color:'var(--green)'}}><I.TextIcon/></span> Primary Text
          </div>
          <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:8}}>
            {adCopy.primaryTexts.map((s,i)=>(
              <button key={i} className={`tag-pill${sIdx===i?' on':''}`} onClick={()=>pickS(s,i)}
                style={{fontSize:10,padding:'3px 11px',borderRadius:20,border:'1px solid var(--bdr)',background:'#f8fafc',color:'var(--t2)',fontFamily:'inherit'}}>
                P{i+1}
              </button>
            ))}
          </div>
          <textarea className="pt-ta" value={sub}
            onChange={e=>{setSub(e.target.value);onSubheadingChange(e.target.value);}}
            rows={3}
            style={{width:'100%',background:'#f8fafc',border:'1px solid var(--bdr)',borderRadius:8,padding:'9px 12px',color:'var(--t1)',fontSize:12,lineHeight:1.65,resize:'vertical',fontFamily:'inherit',transition:'all .15s'}}
            placeholder="Enter primary text…"
          />
          <div style={{fontSize:10,color:'var(--t3)',marginTop:3}}>{sub.length}/500</div>
        </div>

        <div style={hr}/>

        {/* Image */}
        <div>
          <div style={{fontSize:11,fontWeight:700,color:'var(--t2)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:10,display:'flex',alignItems:'center',gap:5}}>
            <span style={{color:'var(--purple)'}}><I.ImgIcon/></span> Ad Creative
          </div>

          {/* AI box */}
          <div style={{background:'var(--purple-lt)',border:'1px solid var(--purple-bdr)',borderRadius:10,padding:12,marginBottom:10}}>
            <div style={{fontSize:10,fontWeight:700,color:'var(--purple)',textTransform:'uppercase',letterSpacing:'.6px',marginBottom:7,display:'flex',alignItems:'center',gap:5}}>
              <I.Sparkle/> AI Image Generator
            </div>
            <textarea className="pt-ta" value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)}
              placeholder={`e.g. "Eco-friendly solar panels on a rooftop at golden hour, commercial photography"`}
              rows={3}
              style={{width:'100%',background:'#fff',border:'1px solid var(--purple-bdr)',borderRadius:7,padding:'8px 10px',color:'var(--t1)',fontSize:11,lineHeight:1.5,resize:'vertical',fontFamily:'inherit',transition:'all .15s'}}
            />
            {aiErr&&<div style={{fontSize:10,color:'var(--red)',marginTop:5,background:'#fef2f2',padding:'5px 8px',borderRadius:6,lineHeight:1.4}}>{aiErr}</div>}
            <button className="gen-btn" onClick={generate} disabled={loading||!aiPrompt.trim()}
              style={{marginTop:8,width:'100%',background:'var(--purple)',color:'#fff',border:'none',borderRadius:7,padding:'8px 0',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:6,transition:'background .15s'}}>
              {loading?<><span className="spinner"/><span>Generating…</span></>:<><I.Sparkle/><span>Generate Image</span></>}
            </button>
          </div>

          {/* Upload */}
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={upload}/>
          <button className="up-btn" onClick={()=>fileRef.current?.click()}
            style={{width:'100%',background:'#f8fafc',border:'1.5px dashed var(--bdr2)',borderRadius:9,padding:'10px 0',display:'flex',alignItems:'center',justifyContent:'center',gap:7,cursor:'pointer',color:'var(--t2)',fontSize:12,fontWeight:600,fontFamily:'inherit',marginBottom:12,transition:'background .12s'}}>
            <I.Upload/> Upload from folder
          </button>

          {/* Thumbnail grid */}
          {(aiImgs.length>0||loading)&&(
            <>
              <div style={{fontSize:10,color:'var(--t3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:7}}>Select Creative</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
                {loading&&<div className="shimmer" style={{aspectRatio:'1',borderRadius:7,border:'1px solid var(--bdr)'}}/>}
                {aiImgs.map((url,i)=>(
                  <div key={i} className={`img-th${selImg===url?' sel':''}`} onClick={()=>pickImg(url)}
                    style={{aspectRatio:'1',borderRadius:7,overflow:'hidden',border:`2px solid ${selImg===url?'var(--blue)':'var(--bdr)'}`,position:'relative',transition:'all .15s'}}>
                    <img src={url} alt={`Creative ${i+1}`} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    {selImg===url&&<div style={{position:'absolute',top:4,right:4,width:18,height:18,borderRadius:'50%',background:'var(--blue)',display:'flex',alignItems:'center',justifyContent:'center'}}><I.Check/></div>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {!enabled&&(
        <div style={{position:'absolute',inset:0,background:'rgba(255,255,255,.9)',borderRadius:'var(--r)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,zIndex:10,backdropFilter:'blur(3px)'}}>
          <I.Lock/>
          <span style={{fontSize:12,color:'var(--t3)',fontWeight:500,textAlign:'center',padding:'0 24px',lineHeight:1.7}}>Creative Studio is only available<br/>for the active platform.</span>
        </div>
      )}
    </div>
  );
}

/* ─── BOTTOM BAR ─────────────────────────────────────────── */
function BottomBar({onBack,onPublish,onSaveDraft,loading,activePlatformName}:{
  onBack:()=>void;onPublish:()=>void;onSaveDraft:()=>void;loading:'publish'|'draft'|null;activePlatformName:string;
}){
  return(
    <div style={{background:'#fff',borderTop:'1px solid var(--bdr)',padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
      <button className="btn-back" onClick={onBack} style={{background:'none',border:'1px solid var(--bdr)',color:'var(--t2)',padding:'8px 18px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:6,transition:'all .12s'}}>
        <I.ChevL/> Back to Chat
      </button>
      <div style={{fontSize:11,color:'var(--t3)'}}>Publishing to <span style={{color:'var(--blue)',fontWeight:600}}>{activePlatformName}</span></div>
      <div style={{display:'flex',gap:8}}>
        <button className="btn-pub" onClick={onPublish} disabled={!!loading}
          style={{background:'var(--blue)',color:'#fff',border:'none',padding:'8px 26px',borderRadius:8,fontSize:12,fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:'inherit',transition:'background .12s',opacity:loading?.7:1}}>
          {loading==='publish'?'Publishing…':'Publish'}
        </button>
        <button className="btn-draft" onClick={onSaveDraft} disabled={!!loading}
          style={{background:'none',border:'1px solid var(--bdr)',color:'var(--t2)',padding:'8px 16px',borderRadius:8,fontSize:12,fontWeight:600,cursor:loading?'not-allowed':'pointer',fontFamily:'inherit',transition:'background .12s',opacity:loading?.7:1}}>
          {loading==='draft'?'Saving…':'Save draft'}
        </button>
      </div>
    </div>
  );
}

/* ─── DATA BUILDER ───────────────────────────────────────── */
function buildData(
  brandDetails?: BrandDetails,
  promoData?: PromoObjectiveData
) {
  const brandName =
    brandDetails?.brand?.name ||
    brandDetails?.name ||
    'Brand';

  const website =
    brandDetails?.website ||
    promoData?.finalUrl ||
    SEED.adSetting.finalUrl;

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  return {
    campaignTitle: `${brandName}_${promoData?.objective ?? 'OUTCOME_SALES'}_Advantage+_${today}`,

    topbarFields: SEED.topbarFields,

    adSetting: {
      event:
        promoData?.event ||
        SEED.adSetting.event,

      budget:
        promoData?.budget != null
          ? `${promoData.budget} ${promoData?.currency ?? 'USD'}`
          : SEED.adSetting.budget,

      schedule:
        promoData?.schedule ||
        SEED.adSetting.schedule,

      finalUrl:
        promoData?.finalUrl ||
        website,
    },

    audience: {
      location:
        promoData?.targetLocation ||
        SEED.audience.location,

      advantagePlus:
        promoData?.advantagePlus ??
        SEED.audience.advantagePlus,
    },

    preview: {
      brandName,

      logoUrl:
        brandDetails?.logoUrl ||
        brandDetails?.brand?.logoUrl ||
        '',

      caption:
        promoData?.primaryTexts?.[0] ||
        SEED.preview.caption,

      cta:
        promoData?.callToAction ||
        SEED.preview.cta,

      estimatedAudience:
        promoData?.estimatedAudience ||
        SEED.preview.estimatedAudience,
    },

    adCopy: {
      headlines:
        promoData?.headlines?.length
          ? promoData.headlines
          : SEED.adCopy.headlines,

      primaryTexts:
        promoData?.primaryTexts?.length
          ? promoData.primaryTexts
          : SEED.adCopy.primaryTexts,

      callToAction:
        promoData?.callToAction ||
        SEED.adCopy.callToAction,
    },
  };
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════════════════════ */
export default function AdCampaignDashboard({
  brandDetails,promoData,campaignId,platforms:pp,
  onBack=()=>{},onPublish=()=>{},onSaveDraft=()=>{},onAddCampaign=()=>{},
  apiBase='',openAiKey,
}:AdCampaignDashboardProps){
  
  console.log('this is brandDetails:', brandDetails);
  const platforms=(pp&&pp.length>0)?pp:DEFAULT_PLATFORMS;
  const init=platforms.find(p=>p.active)??platforms[0];
  const brand=brandDetails?.brand?.name??SEED.preview.brandName;

  const[activePid,setActivePid]=useState<string>(init.id);
  const[loading,setLoading]=useState<'publish'|'draft'|null>(null);
  const[toast,setToast]=useState<{message:string;type:'success'|'error'|'info'}|null>(null);
  const[showPlanModal,setShowPlanModal]=useState<boolean>(false);
  const[selectedPlan,setSelectedPlan]=useState<string|null>(null);

  const sid=campaignId??'cam_01';
  const[campaigns,setCampaigns]=useState<CampaignEntry[]>([{id:sid,name:campaignId?`${brand}_Campaign`:`${brand}_Campaign_01`,platformId:init.id}]);
  const[activeCid,setActiveCid]=useState<string>(sid);

  const d=buildData(brandDetails,promoData);
  console.log('Built data for dashboard:', d);
  const[pvCaption,setPvCaption]=useState(d.preview.caption);
  const[pvImage,setPvImage]=useState<string|null>(null);

  const activePlat=platforms.find(p=>p.id===activePid)??platforms[0];
  const isMeta=activePid==='meta';

  const toast_=useCallback((msg:string,type:'success'|'error'|'info'='info')=>{
    setToast({message:msg,type});setTimeout(()=>setToast(null),3200);
  },[]);

  const switchPlat=useCallback((pid:string)=>{
    setActivePid(pid);
    const f=campaigns.find(c=>c.platformId===pid);
    if(f)setActiveCid(f.id);
  },[campaigns]);

  const addCampaign=useCallback((pid:string)=>{
    const p=platforms.find(x=>x.id===pid);
    const n=campaigns.filter(c=>c.platformId===pid).length+1;
    const id=`${pid}_${Date.now()}`;
    setCampaigns(prev=>[...prev,{id,name:`${p?.name??pid} Campaign ${String(n).padStart(2,'0')}`,platformId:pid}]);
    setActivePid(pid);setActiveCid(id);
    toast_(`Campaign added to ${p?.name??pid}`,'success');
    onAddCampaign(pid);
  },[campaigns,platforms,onAddCampaign,toast_]);

  const handlePublishClick = useCallback(() => {
    if (!isMeta) {
      toast_('Please switch to Meta platform to publish campaigns', 'error');
      return;
    }
    setShowPlanModal(true);
  }, [isMeta, toast_]);

  const handleSelectPlan = useCallback(async (planId: string) => {
    setSelectedPlan(planId);
    setShowPlanModal(false);
    setLoading('publish');
    
    try {
      const r = await fetch(`${apiBase}/campaign/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          campaignId: activeCid, 
          platformId: activePid, 
          brandDetails, 
          promoData,
          planId: planId,
          planName: planId.charAt(0).toUpperCase() + planId.slice(1)
        })
      });
      const res: PublishResult = r.ok ? await r.json() : { success: false, message: `Error ${r.status}` };
      
      toast_(res.success ? `Published with ${planId} plan!` : res.message ?? 'Failed', res.success ? 'success' : 'error');
      onPublish(res, planId);
    } catch (e) {
      toast_('Network error', 'error');
      onPublish({ success: false, message: String(e) });
    } finally {
      setLoading(null);
      setSelectedPlan(null);
    }
  }, [apiBase, activeCid, activePid, brandDetails, promoData, onPublish, toast_]);

  const saveDraft=useCallback(async()=>{
    setLoading('draft');
    try{
      const r=await fetch(`${apiBase}/campaign/draft/save`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({campaignId:activeCid,platformId:activePid,brandDetails,promoData})});
      const res:PublishResult=r.ok?await r.json():{success:false,message:`Error ${r.status}`};
      toast_(res.success?'Draft saved!':res.message??'Failed',res.success?'success':'error');
      onSaveDraft(res);
    }catch(e){toast_('Network error','error');onSaveDraft({success:false,message:String(e)});}
    finally{setLoading(null);}
  },[apiBase,activeCid,activePid,brandDetails,promoData,onSaveDraft,toast_]);

  return(
    <>
      <style>{G}</style>
      <div className="acd-root">
        <Sidebar platforms={platforms} campaigns={campaigns} activePlatformId={activePid} activeCampaignId={activeCid}
          onPlatformSwitch={switchPlat} onSelectCampaign={setActiveCid} onAddCampaign={addCampaign}/>

        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
          <TopBar fields={d.topbarFields} activePlatformId={activePid}/>

          <div style={{flex:1,overflowY:'auto',padding:'14px 16px',background:'var(--bg)'}}>
            {/* Title bar */}
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14,padding:'9px 14px',background:'#fff',border:'1px solid var(--bdr)',borderRadius:10,borderLeft:'4px solid var(--blue)',boxShadow:'var(--sh)'}}>
              <I.Arrow/>
              <span style={{fontSize:12,fontWeight:600,color:'var(--t2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.campaignTitle}</span>
              <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                <span style={{fontSize:10,background:activePlat.bg,color:activePlat.color,padding:'2px 10px',borderRadius:20,fontWeight:700}}>{activePlat.name}</span>
                <span style={{fontSize:10,color:'var(--t3)',fontFamily:'monospace'}}>ID: {activeCid}</span>
              </div>
            </div>

            {/* 3-col grid */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1.15fr 1fr',gap:14,alignItems:'start'}}>
              {/* Left */}
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <AdSettingCard      {...d.adSetting} enabled={isMeta}/>
                <TargetAudienceCard {...d.audience}  enabled={isMeta}/>
                {/* <AdCopyCard         {...d.adCopy}    enabled={isMeta}/> */}
              </div>
              {/* Center */}
              <MetaPostPreview
                brandName={brand} logoUrl={brandDetails?.assets?.favicon}
                caption={pvCaption} cta={d.preview.cta}
                estimatedAudience={d.preview.estimatedAudience}
                imageUrl={pvImage} activePlatformId={activePid}
              />
              {/* Right */}
              <CreativeStudio
                brandName={brand} adCopy={d.adCopy} activePlatformId={activePid}
                onHeadingChange={()=>{}}
                onSubheadingChange={setPvCaption}
                onImageSelect={setPvImage}
                openAiKey={openAiKey}
              />
            </div>
          </div>

          <BottomBar onBack={onBack} onPublish={handlePublishClick} onSaveDraft={saveDraft}
            loading={loading} activePlatformName={activePlat.name}/>
        </div>
      </div>
      {toast&&<Toast message={toast.message} type={toast.type}/>}
      
      {/* Publish Plan Modal */}
      <PublishPlanModal 
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onSelectPlan={handleSelectPlan}
        loading={loading === 'publish'}
      />
    </>
  );
}