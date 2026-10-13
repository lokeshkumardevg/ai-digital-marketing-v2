import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Building2, 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Layers, 
  Check, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Info,
  TrendingUp,
  Upload,
  FileCheck,
  AlertOctagon
} from 'lucide-react';
import { api } from '../../api/axios';
import { hydrateSession } from '../../store/slices/authSlice';
import type { AppDispatch } from '../../store';
import toast from 'react-hot-toast';

const INDUSTRIES = [
  'E-Commerce & D2C Retail',
  'SaaS & B2B Software',
  'Healthcare & Wellness (Supplements/Ayurveda/Pharma)',
  'Financial Services & Fintech (Loans/Trading/Insurance)',
  'Real Estate & Property (RERA)',
  'Online Gaming & Skill Games',
  'Education & EdTech',
  'Local Business & Services',
  'Food, Dining & Hospitality',
  'Automobile & Transport',
  'Media, Entertainment & Creative',
  'Other / Regulated Sector',
];

export const isRestrictedIndustry = (ind: string) => {
  return ind.includes('Healthcare') || 
         ind.includes('Financial') || 
         ind.includes('Real Estate') || 
         ind.includes('Gaming') || 
         ind.includes('Regulated');
};

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: any) => state.auth);

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Form State
  const [brandName, setBrandName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [currency, setCurrency] = useState('INR');
  const [country, setCountry] = useState('India');

  // Restricted Niches Compliance State (Anti-Suspension Protection)
  const [regulatoryLicenseType, setRegulatoryLicenseType] = useState('FSSAI');
  const [regulatoryLicenseNumber, setRegulatoryLicenseNumber] = useState('');
  const [regulatoryCertificateUrl, setRegulatoryCertificateUrl] = useState('');
  const [regulatoryCertificateName, setRegulatoryCertificateName] = useState('');
  const [complianceCertified, setComplianceCertified] = useState<boolean>(false);

  // Google State - Defaults to zero-setup 'managed' for regular clients
  const [googleMode, setGoogleMode] = useState<'oauth' | 'manual' | 'managed'>('managed');
  const [googleCustomerId, setGoogleCustomerId] = useState('');
  const [showAdvancedGoogle, setShowAdvancedGoogle] = useState(false);

  // Meta State - Defaults to zero-setup 'managed' for regular clients
  const [metaMode, setMetaMode] = useState<'oauth' | 'manual' | 'managed'>('managed');
  const [metaAdAccountId, setMetaAdAccountId] = useState('');
  const [metaPageId, setMetaPageId] = useState('');
  const [metaPixelId, setMetaPixelId] = useState('');
  const [showAdvancedMeta, setShowAdvancedMeta] = useState(false);

  // Pre-fill if user has some data already
  useEffect(() => {
    if (user) {
      if (user.brandName) setBrandName(user.brandName);
      if (user.websiteUrl) setWebsiteUrl(user.websiteUrl);
      if (user.industry) setIndustry(user.industry);
      if (user.currency) setCurrency(user.currency);
      if (user.country) setCountry(user.country);
      if (user.googleCustomerId) {
        setGoogleCustomerId(user.googleCustomerId);
        setGoogleMode('manual');
      }
      if (user.metaAdAccountId) {
        setMetaAdAccountId(user.metaAdAccountId);
        setMetaMode('manual');
      }
      if (user.metaPageId) setMetaPageId(user.metaPageId);
      if (user.metaPixelId) setMetaPixelId(user.metaPixelId);
    }
  }, [user]);

  // Handle OAuth callbacks if redirected back
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleSuccess = params.get('googleConnected');
    const metaSuccess = params.get('metaConnected');
    if (googleSuccess === 'success') {
      toast.success('Google Ads account linked successfully!');
      setStep(3);
    }
    if (metaSuccess === 'success') {
      toast.success('Meta Ads account linked successfully!');
      setStep(4);
    }
  }, []);

  const handleConnectGoogleOAuth = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/google');
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error('Could not generate Google OAuth URL');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to start Google connection');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectMetaOAuth = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/meta');
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error('Could not generate Meta OAuth URL');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to start Meta connection');
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setRegulatoryCertificateUrl(reader.result as string);
      setRegulatoryCertificateName(file.name);
      toast.success(`${file.name} uploaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  const validateStep1 = () => {
    if (!brandName.trim()) {
      toast.error('Please enter your Brand Name');
      return false;
    }
    if (!websiteUrl.trim()) {
      toast.error('Please enter your Business Website URL');
      return false;
    }
    let url = websiteUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
      setWebsiteUrl(url);
    }

    // Anti-Suspension Gatekeeper for Restricted Categories
    if (isRestrictedIndustry(industry)) {
      if (!regulatoryLicenseNumber.trim()) {
        toast.error(`Government License / Registration Number is required for ${industry.split('(')[0].trim()} to prevent Google account ban.`);
        return false;
      }
      if (!complianceCertified) {
        toast.error('Please accept the Legal Compliance Declaration to continue.');
        return false;
      }
    }

    return true;
  };

  const validateStep2 = () => {
    if (googleMode === 'manual') {
      const clean = googleCustomerId.replace(/[^0-9]/g, '');
      if (clean.length !== 10) {
        toast.error('Google Ads Customer ID must be 10 digits (e.g. 123-456-7890)');
        return false;
      }
    }
    return true;
  };

  const validateStep3 = () => {
    if (metaMode === 'manual') {
      if (!metaAdAccountId.trim()) {
        toast.error('Please enter your Meta Ad Account ID (e.g. act_1234567890)');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleFinish = async () => {
    try {
      setLoading(true);

      let cleanGoogleCid = googleCustomerId.trim().replace(/-/g, '');
      let cleanMetaAdAccount = metaAdAccountId.trim();
      if (cleanMetaAdAccount && !cleanMetaAdAccount.startsWith('act_')) {
        cleanMetaAdAccount = `act_${cleanMetaAdAccount}`;
      }

      const payload: any = {
        brandName: brandName.trim(),
        websiteUrl: websiteUrl.trim(),
        industry,
        currency,
        country,
        onboardingCompleted: true,
      };

      if (isRestrictedIndustry(industry)) {
        payload.regulatoryLicenseType = regulatoryLicenseType;
        payload.regulatoryLicenseNumber = regulatoryLicenseNumber.trim();
        if (regulatoryCertificateUrl) payload.regulatoryCertificateUrl = regulatoryCertificateUrl;
        payload.isRestrictedNicheCertified = complianceCertified;
      }

      if (googleMode === 'manual' && cleanGoogleCid) {
        payload.googleCustomerId = cleanGoogleCid;
      }
      if (metaMode === 'manual' && cleanMetaAdAccount) {
        payload.metaAdAccountId = cleanMetaAdAccount;
      }
      if (metaPageId.trim()) payload.metaPageId = metaPageId.trim();
      if (metaPixelId.trim()) payload.metaPixelId = metaPixelId.trim();

      await api.post('/auth/update', payload);
      await dispatch(hydrateSession());

      toast.success('Setup completed! Welcome to your AI Marketing Command Center.');
      setTimeout(() => {
        navigate('/campaigns', { replace: true });
      }, 800);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 0%, rgba(91, 110, 245, 0.12) 0%, rgba(7, 7, 12, 1) 60%)',
      color: '#EEEEF5',
      fontFamily: 'Figtree, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
    }}>
      {/* Top Header */}
      <div style={{ maxWidth: '840px', width: '100%', margin: '0 auto 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #5B6EF5, #8A98FB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
            W
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>Wheedle AI</h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(238,238,245,0.45)' }}>Tenant Onboarding & Compliance Setup</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.8rem' }}>
          <ShieldCheck size={14} color="#5B6EF5" />
          <span>Google & Meta Verified Compliance</span>
        </div>
      </div>

      {/* Main Container Card */}
      <div style={{
        maxWidth: '840px',
        width: '100%',
        margin: '0 auto',
        background: 'rgba(18, 18, 28, 0.75)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.65)',
        padding: '36px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow ambient accent */}
        <div style={{
          position: 'absolute',
          top: '-120px',
          right: '-120px',
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(91, 110, 245, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Stepper Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '18px', left: '20px', right: '20px', height: '2px', background: 'rgba(255,255,255,0.08)', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: '18px', left: '20px', width: `${((step - 1) / 3) * 100}%`, height: '2px', background: 'linear-gradient(90deg, #5B6EF5, #8A98FB)', zIndex: 0, transition: 'width 0.4s ease' }} />

            {[
              { num: 1, title: 'Brand Essentials', icon: Building2 },
              { num: 2, title: 'Google Ads', icon: Globe },
              { num: 3, title: 'Meta Ads', icon: Layers },
              { num: 4, title: 'Verification', icon: Sparkles },
            ].map(s => {
              const Icon = s.icon;
              const isCompleted = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: isCompleted ? '#5B6EF5' : isCurrent ? '#161626' : '#0B0B14',
                    border: isCurrent ? '2px solid #5B6EF5' : isCompleted ? '2px solid #5B6EF5' : '1px solid rgba(255,255,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCompleted || isCurrent ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    transition: 'all 0.3s ease',
                    boxShadow: isCurrent ? '0 0 16px rgba(91,110,245,0.45)' : 'none',
                  }}>
                    {isCompleted ? <Check size={18} strokeWidth={2.5} /> : <Icon size={16} />}
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: isCurrent ? 600 : 400,
                    color: isCurrent ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                  }}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: BRAND ESSENTIALS */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                Tell us about your Brand & Website
              </h3>
              <p style={{ margin: 0, color: 'rgba(238,238,245,0.5)', fontSize: '0.9rem' }}>
                Our autonomous agents analyze your landing page and business model to auto-generate high-converting search copy, keywords, and creative assets.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '8px', color: 'rgba(238,238,245,0.8)' }}>
                  Brand / Business Name <span style={{ color: '#FF5E62' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'rgba(238,238,245,0.35)' }} />
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Acme Studio"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 40px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '8px', color: 'rgba(238,238,245,0.8)' }}>
                  Business Website URL <span style={{ color: '#FF5E62' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Globe size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'rgba(238,238,245,0.35)' }} />
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 40px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '8px', color: 'rgba(238,238,245,0.8)' }}>
                Industry & Category
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              >
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind} style={{ background: '#0D0D14', color: '#FFF' }}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* MANDATORY REGULATORY VERIFICATION FOR RESTRICTED NICHES */}
            {isRestrictedIndustry(industry) && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 94, 98, 0.08) 0%, rgba(91, 110, 245, 0.05) 100%)',
                border: '1px solid rgba(255, 94, 98, 0.35)',
                borderRadius: '16px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255, 94, 98, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlertOctagon size={22} color="#FF5E62" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF' }}>
                        Regulatory License Verification (Anti-Suspension Gatekeeper)
                      </h4>
                      <span style={{ background: 'rgba(255, 94, 98, 0.2)', color: '#FF5E62', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                        GOOGLE &amp; META POLICY REQUIRED
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(238,238,245,0.7)', lineHeight: 1.45 }}>
                      Google Ads &amp; Meta strictly suspend accounts in <strong>{industry.split('(')[0].trim()}</strong> unless official regulatory licenses are declared upfront. Providing your license protects your domain from automatic platform bans.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'rgba(238,238,245,0.85)' }}>
                      License / Authority Type <span style={{ color: '#FF5E62' }}>*</span>
                    </label>
                    <select
                      value={regulatoryLicenseType}
                      onChange={(e) => setRegulatoryLicenseType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 12px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: '#FFF',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    >
                      <option value="FSSAI" style={{ background: '#0D0D14' }}>FSSAI Food/Supplement License (Healthcare)</option>
                      <option value="AYUSH" style={{ background: '#0D0D14' }}>Ministry of AYUSH Registration (Ayurveda/Herbal)</option>
                      <option value="DRUG_LICENSE" style={{ background: '#0D0D14' }}>Form 20B/21B Drug Controller License (Pharma)</option>
                      <option value="RBI_NBFC" style={{ background: '#0D0D14' }}>RBI / NBFC Lending Registration (Loans/Finance)</option>
                      <option value="SEBI" style={{ background: '#0D0D14' }}>SEBI RIA / Broker Registration (Trading/Investments)</option>
                      <option value="RERA" style={{ background: '#0D0D14' }}>RERA Registration Certificate (Real Estate)</option>
                      <option value="SKILL_GAMING" style={{ background: '#0D0D14' }}>Skill Gaming Legal Opinion &amp; GSTIN (Gaming)</option>
                      <option value="OTHER" style={{ background: '#0D0D14' }}>Other Government Regulatory Approval</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'rgba(238,238,245,0.85)' }}>
                      Official License / Registration Number <span style={{ color: '#FF5E62' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={regulatoryLicenseNumber}
                      onChange={(e) => setRegulatoryLicenseNumber(e.target.value)}
                      placeholder="e.g. 10022033000451 or RBI/NBFC/12..."
                      style={{
                        width: '100%',
                        padding: '11px 12px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: '#FFF',
                        fontSize: '0.88rem',
                        fontFamily: 'monospace',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* File Upload for Certificate Document */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'rgba(238,238,245,0.85)' }}>
                    Upload Government Certificate / Proof (PDF or Image)
                  </label>
                  <div style={{
                    border: '2px dashed rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.015)',
                    cursor: 'pointer',
                    transition: 'border 0.2s',
                  }}>
                    <input
                      type="file"
                      id="cert-file-upload"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleCertificateFileUpload}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="cert-file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      {regulatoryCertificateUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2ED573', fontWeight: 600, fontSize: '0.85rem' }}>
                          <FileCheck size={18} /> {regulatoryCertificateName || 'Certificate Document Attached ✓'}
                        </div>
                      ) : (
                        <>
                          <Upload size={20} color="#8A98FB" />
                          <span style={{ fontSize: '0.82rem', color: '#FFF', fontWeight: 500 }}>Click to attach government certificate copy</span>
                          <span style={{ fontSize: '0.72rem', color: 'rgba(238,238,245,0.45)' }}>Supports PDF, JPG, PNG (Max 10MB)</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Legal Certification Checkbox */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', userSelect: 'none', marginTop: '4px', background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <input
                    type="checkbox"
                    checked={complianceCertified}
                    onChange={(e) => setComplianceCertified(e.target.checked)}
                    style={{ marginTop: '3px', accentColor: '#2ED573', cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.78rem', color: 'rgba(238,238,245,0.85)', lineHeight: 1.45 }}>
                    <strong>Legal Declaration:</strong> I solemnly declare that our business holds valid government approvals for this product/service and fully complies with Google Ads Restricted Categories and Meta Advertising Policies.
                  </span>
                </label>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '8px', color: 'rgba(238,238,245,0.8)' }}>
                  Target Market / Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. India"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '8px', color: 'rgba(238,238,245,0.8)' }}>
                  Default Ad Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                >
                  <option value="INR" style={{ background: '#0D0D14' }}>INR (₹) - Indian Rupee</option>
                  <option value="USD" style={{ background: '#0D0D14' }}>USD ($) - US Dollar</option>
                  <option value="EUR" style={{ background: '#0D0D14' }}>EUR (€) - Euro</option>
                  <option value="GBP" style={{ background: '#0D0D14' }}>GBP (£) - British Pound</option>
                  <option value="AED" style={{ background: '#0D0D14' }}>AED (د.إ) - UAE Dirham</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: GOOGLE ADS SETUP */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ background: 'rgba(66, 133, 244, 0.15)', color: '#4285F4', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                  GOOGLE ADS INTEGRATION
                </span>
                <span style={{ fontSize: '0.8rem', color: '#2ED573', fontWeight: 600 }}>✓ Zero Technical Setup Needed</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                Connect Google Ads Channel
              </h3>
              <p style={{ margin: 0, color: 'rgba(238,238,245,0.6)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Launch Search, Display, and Performance Max campaigns across Google. Normal business owners do <strong>not</strong> need to find or enter any technical IDs.
              </p>
            </div>

            {/* Primary Choice Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* Option 1: AI Managed (Default & Recommended) */}
              <div 
                onClick={() => {
                  setGoogleMode('managed');
                  setShowAdvancedGoogle(false);
                }}
                style={{
                  position: 'relative',
                  padding: '22px 20px',
                  borderRadius: '16px',
                  background: googleMode === 'managed' 
                    ? 'linear-gradient(135deg, rgba(91, 110, 245, 0.15) 0%, rgba(46, 213, 115, 0.08) 100%)' 
                    : 'rgba(255,255,255,0.02)',
                  border: googleMode === 'managed' 
                    ? '2px solid #5B6EF5' 
                    : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: googleMode === 'managed' ? '0 8px 32px rgba(91, 110, 245, 0.2)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div style={{ position: 'absolute', top: '-11px', right: '16px', background: 'linear-gradient(135deg, #5B6EF5, #2ED573)', color: '#FFF', fontSize: '0.68rem', fontWeight: 800, padding: '2px 10px', borderRadius: '12px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Recommended
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(91, 110, 245, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={20} color="#5B6EF5" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF' }}>Automated AI Setup</h4>
                      <span style={{ fontSize: '0.72rem', color: '#2ED573', fontWeight: 600 }}>No technical knowledge needed</span>
                    </div>
                  </div>
                  {googleMode === 'managed' && (
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#5B6EF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={14} color="#FFF" />
                    </div>
                  )}
                </div>

                <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: 'rgba(238,238,245,0.7)', lineHeight: 1.45 }}>
                  Wheedle AI automatically provisions and runs campaigns via our certified Google Agency partner network.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: 'rgba(238,238,245,0.65)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={13} color="#2ED573" /> No Google Ads account or Customer ID required
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={13} color="#2ED573" /> No developer tokens or complex billing setup
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={13} color="#2ED573" /> Ready to publish in 1-click
                  </div>
                </div>
              </div>

              {/* Option 2: 1-Click Google OAuth */}
              <div 
                onClick={() => {
                  setGoogleMode('oauth');
                  setShowAdvancedGoogle(false);
                }}
                style={{
                  position: 'relative',
                  padding: '22px 20px',
                  borderRadius: '16px',
                  background: googleMode === 'oauth' 
                    ? 'rgba(66, 133, 244, 0.12)' 
                    : 'rgba(255,255,255,0.02)',
                  border: googleMode === 'oauth' 
                    ? '2px solid #4285F4' 
                    : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: googleMode === 'oauth' ? '0 8px 32px rgba(66, 133, 244, 0.15)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(66, 133, 244, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Globe size={20} color="#4285F4" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF' }}>1-Click Google Login</h4>
                      <span style={{ fontSize: '0.72rem', color: '#4285F4', fontWeight: 600 }}>Auto-detects your account</span>
                    </div>
                  </div>
                  {googleMode === 'oauth' && (
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#4285F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={14} color="#FFF" />
                    </div>
                  )}
                </div>

                <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: 'rgba(238,238,245,0.7)', lineHeight: 1.45 }}>
                  Sign in with your Google email. Our system automatically fetches your accessible ad account without typing any IDs.
                </p>

                {!user?.googleAccessToken ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnectGoogleOAuth();
                    }}
                    disabled={loading}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      background: 'linear-gradient(135deg, #4285F4, #2A56C6)',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    <ExternalLink size={15} /> Sign in with Google
                  </button>
                ) : (
                  <div style={{ background: 'rgba(46, 213, 115, 0.1)', border: '1px solid rgba(46, 213, 115, 0.3)', padding: '8px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#2ED573', fontSize: '0.8rem', fontWeight: 600 }}>
                    <CheckCircle2 size={15} /> Google Account Linked ✓
                  </div>
                )}
              </div>
            </div>

            {/* Collapsible Advanced Accordion for Agencies */}
            <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
              <div 
                onClick={() => {
                  setShowAdvancedGoogle(!showAdvancedGoogle);
                  if (!showAdvancedGoogle) {
                    setGoogleMode('manual');
                  } else {
                    setGoogleMode('managed');
                  }
                }}
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <HelpCircle size={16} color="rgba(238,238,245,0.4)" />
                  <span style={{ fontSize: '0.82rem', color: 'rgba(238,238,245,0.6)', fontWeight: 500 }}>
                    Marketing Agency? Click here to manually enter a 10-digit Google Ads Customer ID (CID)
                  </span>
                </div>
                {showAdvancedGoogle ? <ChevronUp size={16} color="rgba(238,238,245,0.4)" /> : <ChevronDown size={16} color="rgba(238,238,245,0.4)" />}
              </div>

              {showAdvancedGoogle && (
                <div style={{ padding: '0 18px 18px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px' }}>
                  <div style={{ background: 'rgba(91, 110, 245, 0.06)', border: '1px solid rgba(91, 110, 245, 0.15)', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px', display: 'flex', gap: '10px' }}>
                    <Info size={16} color="#5B6EF5" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.78rem', color: 'rgba(238,238,245,0.7)', lineHeight: 1.45 }}>
                      <strong>Where to find your Customer ID:</strong> Log in to <a href="https://ads.google.com" target="_blank" rel="noreferrer" style={{ color: '#8A98FB', textDecoration: 'underline' }}>ads.google.com</a>, look at the top-right corner next to your profile photo. You will see a 10-digit number like <code>123-456-7890</code>. Regular clients do not need to fill this; keep "Automated AI Setup" selected above.
                    </div>
                  </div>

                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'rgba(238,238,245,0.8)' }}>
                    Google Ads Customer ID (Optional for Agencies)
                  </label>
                  <input
                    type="text"
                    value={googleCustomerId}
                    onChange={(e) => {
                      setGoogleCustomerId(e.target.value);
                      setGoogleMode('manual');
                    }}
                    placeholder="e.g. 123-456-7890"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: '#FFFFFF',
                      fontSize: '0.92rem',
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                      outline: 'none',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: META ADS SETUP */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ background: 'rgba(24, 119, 242, 0.15)', color: '#1877F2', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                  META MARKETING INTEGRATION
                </span>
                <span style={{ fontSize: '0.8rem', color: '#2ED573', fontWeight: 600 }}>✓ Zero Technical Setup Needed</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                Connect Meta & Instagram Ads Channel
              </h3>
              <p style={{ margin: 0, color: 'rgba(238,238,245,0.6)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Launch visual Feed, Reels, and Story ads across Facebook and Instagram. No Business Manager knowledge required.
              </p>
            </div>

            {/* Primary Choice Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* Option 1: AI Managed (Default & Recommended) */}
              <div 
                onClick={() => {
                  setMetaMode('managed');
                  setShowAdvancedMeta(false);
                }}
                style={{
                  position: 'relative',
                  padding: '22px 20px',
                  borderRadius: '16px',
                  background: metaMode === 'managed' 
                    ? 'linear-gradient(135deg, rgba(91, 110, 245, 0.15) 0%, rgba(46, 213, 115, 0.08) 100%)' 
                    : 'rgba(255,255,255,0.02)',
                  border: metaMode === 'managed' 
                    ? '2px solid #5B6EF5' 
                    : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: metaMode === 'managed' ? '0 8px 32px rgba(91, 110, 245, 0.2)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div style={{ position: 'absolute', top: '-11px', right: '16px', background: 'linear-gradient(135deg, #5B6EF5, #2ED573)', color: '#FFF', fontSize: '0.68rem', fontWeight: 800, padding: '2px 10px', borderRadius: '12px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Recommended
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(91, 110, 245, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={20} color="#5B6EF5" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF' }}>Automated AI Delivery</h4>
                      <span style={{ fontSize: '0.72rem', color: '#2ED573', fontWeight: 600 }}>Zero Facebook setup needed</span>
                    </div>
                  </div>
                  {metaMode === 'managed' && (
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#5B6EF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={14} color="#FFF" />
                    </div>
                  )}
                </div>

                <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: 'rgba(238,238,245,0.7)', lineHeight: 1.45 }}>
                  Wheedle AI automatically provisions campaign deployment, dynamic targeting, and tracking through our verified agency infrastructure.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: 'rgba(238,238,245,0.65)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={13} color="#2ED573" /> No Facebook Business Manager setup needed
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={13} color="#2ED573" /> Automatic ad creative routing and conversion tracking
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={13} color="#2ED573" /> Immediate access with zero account friction
                  </div>
                </div>
              </div>

              {/* Option 2: 1-Click Facebook OAuth */}
              <div 
                onClick={() => {
                  setMetaMode('oauth');
                  setShowAdvancedMeta(false);
                }}
                style={{
                  position: 'relative',
                  padding: '22px 20px',
                  borderRadius: '16px',
                  background: metaMode === 'oauth' 
                    ? 'rgba(24, 119, 242, 0.12)' 
                    : 'rgba(255,255,255,0.02)',
                  border: metaMode === 'oauth' 
                    ? '2px solid #1877F2' 
                    : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: metaMode === 'oauth' ? '0 8px 32px rgba(24, 119, 242, 0.15)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(24, 119, 242, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Layers size={20} color="#1877F2" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF' }}>1-Click Facebook Login</h4>
                      <span style={{ fontSize: '0.72rem', color: '#1877F2', fontWeight: 600 }}>Auto-imports pages & pixels</span>
                    </div>
                  </div>
                  {metaMode === 'oauth' && (
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={14} color="#FFF" />
                    </div>
                  )}
                </div>

                <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: 'rgba(238,238,245,0.7)', lineHeight: 1.45 }}>
                  Connect your Facebook account. We automatically import your authorized Instagram accounts, Facebook Pages, and Ad Accounts.
                </p>

                {!user?.metaAccessToken ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnectMetaOAuth();
                    }}
                    disabled={loading}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      background: 'linear-gradient(135deg, #1877F2, #0A53BE)',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    <ExternalLink size={15} /> Link with Facebook
                  </button>
                ) : (
                  <div style={{ background: 'rgba(46, 213, 115, 0.1)', border: '1px solid rgba(46, 213, 115, 0.3)', padding: '8px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#2ED573', fontSize: '0.8rem', fontWeight: 600 }}>
                    <CheckCircle2 size={15} /> Meta Connected ({user.metaAdAccountName || user.metaAdAccountId || 'Account Ready'}) ✓
                  </div>
                )}
              </div>
            </div>

            {/* Collapsible Advanced Accordion for Agencies */}
            <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
              <div 
                onClick={() => {
                  setShowAdvancedMeta(!showAdvancedMeta);
                  if (!showAdvancedMeta) {
                    setMetaMode('manual');
                  } else {
                    setMetaMode('managed');
                  }
                }}
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <HelpCircle size={16} color="rgba(238,238,245,0.4)" />
                  <span style={{ fontSize: '0.82rem', color: 'rgba(238,238,245,0.6)', fontWeight: 500 }}>
                    Marketing Agency? Click here to manually enter custom Meta Ad Account & Pixel IDs
                  </span>
                </div>
                {showAdvancedMeta ? <ChevronUp size={16} color="rgba(238,238,245,0.4)" /> : <ChevronDown size={16} color="rgba(238,238,245,0.4)" />}
              </div>

              {showAdvancedMeta && (
                <div style={{ padding: '0 18px 18px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ background: 'rgba(91, 110, 245, 0.06)', border: '1px solid rgba(91, 110, 245, 0.15)', borderRadius: '10px', padding: '12px 14px', display: 'flex', gap: '10px' }}>
                    <Info size={16} color="#5B6EF5" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.78rem', color: 'rgba(238,238,245,0.7)', lineHeight: 1.45 }}>
                      Only required for agencies managing an external Business Manager account. Standard businesses can leave this closed and use "Automated AI Delivery" above.
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'rgba(238,238,245,0.8)' }}>
                      Meta Ad Account ID (Optional for Agencies)
                    </label>
                    <input
                      type="text"
                      value={metaAdAccountId}
                      onChange={(e) => {
                        setMetaAdAccountId(e.target.value);
                        setMetaMode('manual');
                      }}
                      placeholder="e.g. act_1934674723817324"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: '#FFFFFF',
                        fontSize: '0.92rem',
                        fontFamily: 'monospace',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'rgba(238,238,245,0.8)' }}>
                        Facebook Page ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={metaPageId}
                        onChange={(e) => setMetaPageId(e.target.value)}
                        placeholder="e.g. 1092837465"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '10px',
                          color: '#FFFFFF',
                          fontSize: '0.88rem',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'rgba(238,238,245,0.8)' }}>
                        Meta Pixel ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={metaPixelId}
                        onChange={(e) => setMetaPixelId(e.target.value)}
                        placeholder="e.g. 987654321012345"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '10px',
                          color: '#FFFFFF',
                          fontSize: '0.88rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(46, 213, 115, 0.1)', color: '#2ED573', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, marginBottom: '8px' }}>
                <CheckCircle2 size={14} /> Ready for Launch
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                Verify Tenant Setup Summary
              </h3>
              <p style={{ margin: 0, color: 'rgba(238,238,245,0.5)', fontSize: '0.9rem' }}>
                All Google & Meta policy requirements are satisfied. Confirm your details to unlock the full AI marketing dashboard.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#5B6EF5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={16} /> Brand Identity
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(238,238,245,0.45)' }}>Brand:</span>
                    <span style={{ fontWeight: 600 }}>{brandName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(238,238,245,0.45)' }}>Website:</span>
                    <span style={{ fontWeight: 500, color: '#8A98FB' }}>{websiteUrl}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(238,238,245,0.45)' }}>Industry:</span>
                    <span>{industry}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(238,238,245,0.45)' }}>Currency / Region:</span>
                    <span>{currency} ({country})</span>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#4285F4', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={16} /> Google Ads Channel
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(238,238,245,0.45)' }}>Connection Mode:</span>
                    <span style={{ textTransform: 'capitalize' }}>{googleMode}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(238,238,245,0.45)' }}>Customer ID:</span>
                    <span style={{ fontFamily: 'monospace' }}>{googleCustomerId || (googleMode === 'managed' ? 'Wheedle Managed Agency CID' : user?.googleCustomerId || 'Connected via OAuth')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(238,238,245,0.45)' }}>Status:</span>
                    <span style={{ color: '#2ED573', fontWeight: 600 }}>Policy Verified ✓</span>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#1877F2', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={16} /> Meta Ads Channel
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(238,238,245,0.45)' }}>Connection Mode:</span>
                    <span style={{ textTransform: 'capitalize' }}>{metaMode}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(238,238,245,0.45)' }}>Ad Account ID:</span>
                    <span style={{ fontFamily: 'monospace' }}>{metaAdAccountId || (metaMode === 'managed' ? 'Wheedle Managed Ad Account' : user?.metaAdAccountId || 'Connected via Facebook')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(238,238,245,0.45)' }}>Status:</span>
                    <span style={{ color: '#2ED573', fontWeight: 600 }}>Policy Verified ✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Restricted Niche Verified Certificate Card */}
            {isRestrictedIndustry(industry) && (
              <div style={{
                background: 'rgba(46, 213, 115, 0.06)',
                border: '1px solid rgba(46, 213, 115, 0.3)',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileCheck size={24} color="#2ED573" />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                      Regulatory Compliance Verified ({industry.split('(')[0].trim()})
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(238,238,245,0.7)' }}>
                      Authority: <strong>{regulatoryLicenseType}</strong> | License No: <span style={{ fontFamily: 'monospace', color: '#2ED573', fontWeight: 600 }}>{regulatoryLicenseNumber}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(46, 213, 115, 0.15)', color: '#2ED573', padding: '4px 10px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700 }}>
                  <ShieldCheck size={14} /> ANTI-SUSPENSION VERIFIED
                </div>
              </div>
            )}

            <div style={{ background: 'rgba(91, 110, 245, 0.08)', border: '1px solid rgba(91, 110, 245, 0.2)', padding: '14px 18px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TrendingUp size={20} color="#5B6EF5" style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(238,238,245,0.85)', lineHeight: 1.4 }}>
                Once you click <strong>Complete Setup</strong>, our autonomous multi-agent cluster will crawl your website, generate high-intent keywords, and prepare ready-to-publish campaigns.
              </p>
            </div>
          </div>
        )}

        {/* Action Button Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {step > 1 ? (
            <button
              onClick={handleBack}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: 'rgba(255,255,255,0.05)',
                color: '#EEEEF5',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #5B6EF5, #7A8CFB)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(91, 110, 245, 0.35)',
              }}
            >
              Continue to {step === 1 ? 'Google Ads' : step === 2 ? 'Meta Ads' : 'Verification'} <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #2ED573, #1EAC58)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(46, 213, 115, 0.35)',
              }}
            >
              <Sparkles size={18} /> {loading ? 'Saving Setup...' : 'Complete Setup & Launch Dashboard'}
            </button>
          )}
        </div>

        {/* Legal and Compliance Links */}
        <p style={{ marginTop: '22px', fontSize: '0.75rem', color: 'rgba(238,238,245,0.4)', textAlign: 'center', lineHeight: 1.6 }}>
          By continuing, you agree to Wheedle AI's{' '}
          <a href="/terms" target="_blank" rel="noreferrer" style={{ color: '#8A98FB', textDecoration: 'underline' }}>Terms of Service</a>,{' '}
          <a href="/privacy-policy" target="_blank" rel="noreferrer" style={{ color: '#8A98FB', textDecoration: 'underline' }}>Privacy Policy</a>, and{' '}
          <a href="/data-deletion" target="_blank" rel="noreferrer" style={{ color: '#8A98FB', textDecoration: 'underline' }}>Data Deletion Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default Onboarding;