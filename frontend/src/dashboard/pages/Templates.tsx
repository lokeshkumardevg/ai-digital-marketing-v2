import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Search, ShoppingBag, Globe, Home, Utensils,
  GraduationCap, Heart, Car, Zap, CheckCircle, LayoutTemplate,
  Target, DollarSign, Users, TrendingUp, RefreshCw, ChevronRight
} from 'lucide-react';

// ── Template Data ─────────────────────────────────────────────────────────────
interface CampaignTemplate {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  description: string;
  tags: string[];
  platforms: string[];
  goal: string;
  dailyBudget: string;
  audience: string;
  adCopy: { headline: string; description: string };
  keywords: string[];
  matchScore?: number;
}

const ALL_TEMPLATES: CampaignTemplate[] = [
  {
    id: 'ecom-sales',
    name: 'E-Commerce Sales Boost',
    category: 'E-Commerce',
    icon: ShoppingBag,
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    description: 'High-converting product ads for online stores. Designed to drive purchases with urgency and social proof.',
    tags: ['shopify', 'online store', 'products', 'shop', 'buy', 'ecommerce', 'woocommerce', 'cart'],
    platforms: ['Meta Ads', 'Google Shopping', 'Instagram'],
    goal: 'Drive Sales',
    dailyBudget: '₹1,500/day',
    audience: 'Shoppers 18–45, purchase intent',
    adCopy: {
      headline: '🔥 Limited Offer — Shop Now & Save 30%',
      description: 'Premium quality products delivered to your door. Trusted by 10,000+ customers. Free shipping on orders above ₹499.',
    },
    keywords: ['buy online', 'best price', 'free delivery', 'discount'],
  },
  {
    id: 'local-leads',
    name: 'Local Business Lead Gen',
    category: 'Local Business',
    icon: Home,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    description: 'Capture high-quality local leads for service businesses. Perfect for salons, clinics, gyms & contractors.',
    tags: ['local', 'service', 'near me', 'salon', 'clinic', 'gym', 'repair', 'plumber', 'electrician', 'contractor'],
    platforms: ['Google Search', 'Meta Ads'],
    goal: 'Generate Leads',
    dailyBudget: '₹800/day',
    audience: 'Local area, 5–20km radius, all ages',
    adCopy: {
      headline: 'Book Your Free Consultation Today',
      description: 'Top-rated local service in your area. 500+ happy customers. Call now for a same-day appointment.',
    },
    keywords: ['near me', 'book appointment', 'free quote', 'local service'],
  },
  {
    id: 'saas-trial',
    name: 'SaaS Free Trial Funnel',
    category: 'SaaS / Tech',
    icon: Zap,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    description: 'Drive free trial signups for software products. Optimized for tech-savvy decision makers.',
    tags: ['software', 'saas', 'app', 'tool', 'platform', 'dashboard', 'tech', 'startup', 'api', 'automation'],
    platforms: ['Google Search', 'LinkedIn', 'Meta Ads'],
    goal: 'Generate Leads',
    dailyBudget: '₹2,000/day',
    audience: 'Business owners, managers, 25–50',
    adCopy: {
      headline: 'Try Free for 14 Days — No Credit Card Needed',
      description: 'Join 50,000+ businesses automating their workflow. Setup in 5 minutes. Cancel anytime.',
    },
    keywords: ['free trial', 'software demo', 'automation tool', 'best software'],
  },
  {
    id: 'restaurant-orders',
    name: 'Restaurant & Food Orders',
    category: 'Food & Dining',
    icon: Utensils,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    description: 'Increase online orders and footfall for restaurants, cafes, and cloud kitchens.',
    tags: ['restaurant', 'food', 'cafe', 'kitchen', 'dining', 'menu', 'delivery', 'order', 'catering', 'chef'],
    platforms: ['Instagram', 'Meta Ads', 'Google Maps'],
    goal: 'Drive Sales',
    dailyBudget: '₹600/day',
    audience: 'Food lovers, 18–40, local area',
    adCopy: {
      headline: '🍕 Order Now — 30 Min Delivery Guaranteed',
      description: 'Fresh, hot food delivered to your door. Use code FIRST10 for 10% off your first order.',
    },
    keywords: ['food delivery', 'order online', 'best restaurant', 'near me'],
  },
  {
    id: 'education-enroll',
    name: 'Education & Course Enrollment',
    category: 'Education',
    icon: GraduationCap,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    description: 'Fill your courses, coaching programs, or training sessions with qualified students.',
    tags: ['course', 'education', 'training', 'coaching', 'learn', 'class', 'institute', 'tutor', 'skill'],
    platforms: ['Meta Ads', 'Google Search', 'YouTube'],
    goal: 'Generate Leads',
    dailyBudget: '₹1,200/day',
    audience: 'Students, professionals, 16–35',
    adCopy: {
      headline: 'Enroll Now — Limited Seats Available',
      description: 'Learn from industry experts. Get certified in 30 days. 95% placement rate. Join 5,000+ students.',
    },
    keywords: ['online course', 'learn', 'certification', 'enroll now'],
  },
  {
    id: 'real-estate',
    name: 'Real Estate Lead Capture',
    category: 'Real Estate',
    icon: Home,
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    description: 'Generate qualified buyer and renter leads for property listings.',
    tags: ['real estate', 'property', 'flat', 'apartment', 'plot', 'house', 'rent', 'buy', 'builder', 'villa'],
    platforms: ['Meta Ads', 'Google Search'],
    goal: 'Generate Leads',
    dailyBudget: '₹2,500/day',
    audience: 'Property buyers, 28–55, HNI segment',
    adCopy: {
      headline: '🏠 Your Dream Home Awaits — Book a Free Site Visit',
      description: 'Premium 2BHK & 3BHK flats starting ₹45L. Prime location, easy EMI options. Limited units left!',
    },
    keywords: ['property for sale', 'flat for rent', 'new project', 'site visit'],
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness Clinic',
    category: 'Healthcare',
    icon: Heart,
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    description: 'Get more patients booked for clinics, hospitals, wellness centers, and health apps.',
    tags: ['doctor', 'clinic', 'hospital', 'health', 'wellness', 'fitness', 'yoga', 'ayurveda', 'diet', 'medicine'],
    platforms: ['Google Search', 'Meta Ads'],
    goal: 'Generate Leads',
    dailyBudget: '₹1,000/day',
    audience: 'Health-conscious adults, all ages, local',
    adCopy: {
      headline: 'Book Your Free Health Consultation',
      description: 'Expert doctors available today. Trusted by 10,000+ patients. Book your slot in 60 seconds.',
    },
    keywords: ['doctor near me', 'book appointment', 'health check', 'clinic'],
  },
  {
    id: 'auto-dealer',
    name: 'Automobile & Auto Dealer',
    category: 'Automobile',
    icon: Car,
    color: '#64748b',
    gradient: 'linear-gradient(135deg, #64748b, #475569)',
    description: 'Drive test drive bookings and inquiries for car dealerships and auto accessory shops.',
    tags: ['car', 'automobile', 'vehicle', 'bike', 'showroom', 'dealer', 'auto', 'service center', 'garage'],
    platforms: ['Google Search', 'Meta Ads', 'YouTube'],
    goal: 'Generate Leads',
    dailyBudget: '₹1,800/day',
    audience: 'Car buyers, 25–55, middle to upper income',
    adCopy: {
      headline: 'Book a Free Test Drive Today 🚗',
      description: 'Latest models. Best exchange value. Easy finance at 0% interest. Visit our showroom this weekend.',
    },
    keywords: ['car dealer', 'test drive', 'new car', 'auto showroom'],
  },
  {
    id: 'brand-awareness',
    name: 'Brand Awareness & Reach',
    category: 'Branding',
    icon: Globe,
    color: '#14b8a6',
    gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)',
    description: 'Build brand recognition and reach a large audience across all major social platforms.',
    tags: ['brand', 'awareness', 'reach', 'visibility', 'launch', 'new brand', 'startup', 'recognition'],
    platforms: ['Instagram', 'Meta Ads', 'YouTube', 'TikTok'],
    goal: 'Brand Awareness',
    dailyBudget: '₹2,000/day',
    audience: 'Broad audience, 18–45, interest-based',
    adCopy: {
      headline: 'Meet the Brand Changing the Game',
      description: 'Discover why thousands are switching. Premium quality. Unbeatable value. See the difference today.',
    },
    keywords: ['brand name', 'about us', 'new launch', 'discover'],
  },
];

// ── Keyword Matcher ────────────────────────────────────────────────────────────
const getMatchedTemplates = (input: string): CampaignTemplate[] => {
  const lower = input.toLowerCase();
  const scored = ALL_TEMPLATES.map(t => {
    let score = 0;
    t.tags.forEach(tag => {
      if (lower.includes(tag)) score += 3;
    });
    if (lower.includes(t.category.toLowerCase())) score += 5;
    // Partial word match
    t.tags.forEach(tag => {
      tag.split(' ').forEach(word => {
        if (word.length > 3 && lower.includes(word)) score += 1;
      });
    });
    return { ...t, matchScore: score };
  });

  const matched = scored.filter(t => t.matchScore! > 0).sort((a, b) => b.matchScore! - a.matchScore!);
  // If nothing matched, return top 3 popular ones
  return matched.length > 0 ? matched.slice(0, 4) : ALL_TEMPLATES.slice(0, 3);
};

// ── Template Card ─────────────────────────────────────────────────────────────
const TemplateCard: React.FC<{ template: CampaignTemplate; isMatch: boolean; onSelect: () => void }> = ({ template, isMatch, onSelect }) => {
  const Icon = template.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, boxShadow: `0 24px 48px ${template.color}22` }}
      onClick={onSelect}
      style={{
        background: '#fff', borderRadius: '24px', overflow: 'hidden',
        border: isMatch ? `2px solid ${template.color}` : '1.5px solid #f1f5f9',
        cursor: 'pointer', transition: 'all 0.25s', position: 'relative'
      }}
    >
      {isMatch && (
        <div style={{
          position: 'absolute', top: 14, right: 14, background: template.color,
          color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px',
          borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2
        }}>
          <Sparkles size={11} /> AI Match
        </div>
      )}

      {/* Top gradient banner */}
      <div style={{ background: template.gradient, padding: '28px 28px 24px', position: 'relative' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <Icon size={26} color="#fff" />
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{template.category}</div>
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{template.name}</h3>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 24px 24px' }}>
        <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>{template.description}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {[
            { icon: Target, label: 'Goal', val: template.goal },
            { icon: DollarSign, label: 'Budget', val: template.dailyBudget },
            { icon: Users, label: 'Audience', val: template.audience },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <item.icon size={14} color={template.color} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: '0.82rem', color: '#475569' }}><strong style={{ color: '#0f172a' }}>{item.label}:</strong> {item.val}</span>
            </div>
          ))}
        </div>

        {/* Platforms */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {template.platforms.map(p => (
            <span key={p} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '99px', background: `${template.color}12`, color: template.color }}>
              {p}
            </span>
          ))}
        </div>

        <button
          onClick={e => { e.stopPropagation(); onSelect(); }}
          style={{
            width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
            background: template.gradient, color: '#fff', fontWeight: 700,
            fontSize: '0.92rem', cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Use This Template <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

// ── Selected Template Detail Modal ────────────────────────────────────────────
const TemplateDetail: React.FC<{ template: CampaignTemplate; onBack: () => void }> = ({ template, onBack }) => {
  const Icon = template.icon;
  const [launched, setLaunched] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#7c3aed', fontWeight: 600, cursor: 'pointer', marginBottom: '28px', fontSize: '0.95rem' }}>
        ← Back to Templates
      </button>

      <div style={{ background: template.gradient, borderRadius: '28px', padding: '40px', marginBottom: '28px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={32} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{template.category}</div>
            <h2 style={{ margin: 0, fontFamily: 'Outfit', fontSize: '1.6rem', fontWeight: 900 }}>{template.name}</h2>
          </div>
        </div>
        <p style={{ opacity: 0.85, fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>{template.description}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Ad Copy Preview */}
        <div style={{ gridColumn: '1 / -1', background: '#f8fafc', borderRadius: '20px', padding: '24px', border: '1.5px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} /> AI-Generated Ad Copy
          </div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', marginBottom: '8px' }}>{template.adCopy.headline}</div>
          <div style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6 }}>{template.adCopy.description}</div>
        </div>

        {[
          { label: 'Campaign Goal', icon: Target, val: template.goal, color: '#7c3aed' },
          { label: 'Recommended Budget', icon: DollarSign, val: template.dailyBudget, color: '#10b981' },
          { label: 'Target Audience', icon: Users, val: template.audience, color: '#3b82f6' },
          { label: 'Expected ROAS', icon: TrendingUp, val: '3.5x – 6x', color: '#f59e0b' },
        ].map(item => (
          <div key={item.label} style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1.5px solid #f1f5f9' }}>
            <item.icon size={18} color={item.color} style={{ marginBottom: '10px' }} />
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{item.label}</div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{item.val}</div>
          </div>
        ))}
      </div>

      {/* Keywords */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1.5px solid #f1f5f9', marginBottom: '24px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Target Keywords</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {template.keywords.map(k => (
            <span key={k} style={{ padding: '6px 14px', borderRadius: '99px', background: '#f1f5f9', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{k}</span>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1.5px solid #f1f5f9', marginBottom: '28px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Ad Platforms</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {template.platforms.map(p => (
            <div key={p} style={{ padding: '8px 18px', borderRadius: '99px', background: `${template.color}10`, color: template.color, fontWeight: 700, fontSize: '0.88rem' }}>{p}</div>
          ))}
        </div>
      </div>

      {!launched ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setLaunched(true)}
          style={{
            width: '100%', padding: '20px', borderRadius: '18px', border: 'none',
            background: template.gradient, color: '#fff', fontWeight: 800, fontSize: '1.1rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '10px', boxShadow: `0 16px 40px ${template.color}40`
          }}
        >
          <Zap size={22} /> Launch This Campaign Template
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', borderRadius: '18px', padding: '32px', textAlign: 'center', border: '1.5px solid #10b98140' }}
        >
          <CheckCircle size={48} color="#10b981" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.4rem', color: '#064e3b', marginBottom: '8px' }}>Campaign Template Applied!</h3>
          <p style={{ color: '#047857', fontSize: '0.95rem' }}>Your campaign is being set up. Head to the Campaigns section to review and launch.</p>
        </motion.div>
      )}
    </motion.div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export const Templates: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<CampaignTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setSelectedTemplate(null);
    setTimeout(() => {
      setResults(getMatchedTemplates(query));
      setSearched(true);
      setLoading(false);
    }, 1200);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>

      {/* Page Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LayoutTemplate size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.6rem', color: '#0f172a', letterSpacing: '-0.8px' }}>AI Campaign Templates</h1>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>Apni business requirements likhein — AI best template suggest karega</p>
          </div>
        </div>
      </div>

      {!selectedTemplate ? (
        <>
          {/* Search Box */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', border: '1.5px solid #e2e8f0', boxShadow: '0 8px 40px rgba(124,58,237,0.06)', marginBottom: '36px' }}>
            <label style={{ display: 'block', fontWeight: 700, color: '#0f172a', marginBottom: '10px', fontSize: '0.95rem' }}>
              🤖 Apni business / requirement describe karein
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder='e.g. "mera online clothing store hai", "local restaurant Delhi", "SaaS software startup"...'
                  style={{
                    width: '100%', padding: '16px 16px 16px 48px',
                    borderRadius: '14px', border: '1.5px solid #e2e8f0',
                    fontSize: '0.98rem', color: '#0f172a', outline: 'none',
                    background: '#f8fafc', boxSizing: 'border-box', transition: 'border-color 0.2s'
                  }}
                  onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                  onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                style={{
                  padding: '16px 32px', borderRadius: '14px', border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  color: '#fff', fontWeight: 700, fontSize: '0.98rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  opacity: loading || !query.trim() ? 0.65 : 1, whiteSpace: 'nowrap',
                  boxShadow: '0 8px 20px rgba(124,58,237,0.3)'
                }}
              >
                {loading ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {loading ? 'Finding...' : 'Find Template'}
              </motion.button>
            </div>

            {/* Quick tags */}
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Quick try:</span>
              {['Online Store', 'Restaurant Delhi', 'Doctor Clinic', 'SaaS Software', 'Real Estate', 'Car Dealer'].map(tag => (
                <button
                  key={tag}
                  onClick={() => { setQuery(tag); }}
                  style={{ padding: '5px 12px', borderRadius: '99px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.8rem', fontWeight: 600, color: '#475569', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed'; (e.currentTarget as HTMLElement).style.color = '#7c3aed'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'inline-block', marginBottom: '16px' }}>
                <Sparkles size={36} color="#7c3aed" />
              </motion.div>
              <p style={{ color: '#64748b', fontWeight: 600 }}>AI aapki requirements analyze kar raha hai...</p>
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {searched && !loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                  <CheckCircle size={18} color="#10b981" />
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                    {results.length} matching templates found for: <em style={{ color: '#7c3aed' }}>"{query}"</em>
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                  {results.map((t) => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      isMatch={(t.matchScore ?? 0) > 2}
                      onSelect={() => setSelectedTemplate(t)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Browse All (initial state) */}
          {!searched && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p style={{ fontWeight: 700, color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
                — Ya sabhi templates dekhen —
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {ALL_TEMPLATES.map(t => (
                  <TemplateCard key={t.id} template={t} isMatch={false} onSelect={() => setSelectedTemplate(t)} />
                ))}
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <TemplateDetail template={selectedTemplate} onBack={() => setSelectedTemplate(null)} />
      )}
    </div>
  );
};
