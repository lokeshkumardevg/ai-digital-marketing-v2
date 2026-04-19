import React, { useState } from 'react';
import { Target, MapPin, Globe, DollarSign, TrendingUp, Users, Save, ChevronDown, Search } from 'lucide-react';

const goals = [
  { value: 'roas', label: 'Maximize ROAS', desc: 'Get highest return on ad spend' },
  { value: 'conversions', label: 'Maximize Conversions', desc: 'Get most conversions within budget' },
  { value: 'cpa', label: 'Minimize CPA', desc: 'Reduce cost per acquisition' },
  { value: 'awareness', label: 'Brand Awareness', desc: 'Maximize reach and impressions' },
  { value: 'leads', label: 'Lead Generation', desc: 'Capture qualified leads' },
];

export const OptimizeGoal: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState('roas');
  const [budget, setBudget] = useState('5000');
  const [location, setLocation] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ minHeight: '100%', background: '#f5f6fa' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8eaf0', padding: '18px 32px' }}>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '3px' }}>Brand Center</div>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Optimize Goal</h1>
        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Set AI optimization targets for your campaigns</div>
      </div>

      <div style={{ padding: '24px 32px', maxWidth: '800px' }}>
        {/* Strategy Overview */}
        <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Strategy Overview</h2>
          <p style={{ margin: '0 0 20px', fontSize: '0.82rem', color: '#64748b' }}>Define your primary campaign objective</p>

          <div style={{ display: 'grid', gap: '8px' }}>
            {goals.map(goal => (
              <label key={goal.value} onClick={() => setSelectedGoal(goal.value)}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '10px', border: `1.5px solid ${selectedGoal === goal.value ? '#7c3aed' : '#e8eaf0'}`, cursor: 'pointer', background: selectedGoal === goal.value ? '#faf5ff' : '#fff', transition: 'all 0.15s' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: selectedGoal === goal.value ? '5px solid #7c3aed' : '2px solid #cbd5e1', transition: 'all 0.15s', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: selectedGoal === goal.value ? '#5b21b6' : '#0f172a' }}>{goal.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{goal.desc}</div>
                </div>
                {selectedGoal === goal.value && <TrendingUp size={15} color="#7c3aed" />}
              </label>
            ))}
          </div>
        </div>

        {/* Budget & KPI */}
        <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Budget & KPI</h2>
          <p style={{ margin: '0 0 20px', fontSize: '0.82rem', color: '#64748b' }}>Set your monthly budget and key metrics</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }}>Monthly Budget</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.9rem' }}>$</span>
                <input value={budget} onChange={e => setBudget(e.target.value)} type="number"
                  style={{ width: '100%', padding: '10px 14px 10px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#0f172a', outline: 'none', background: '#fafafa', boxSizing: 'border-box', fontFamily: 'inherit', fontWeight: 600 }}
                  onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                  onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }}>Currency</label>
              <div style={{ position: 'relative' }}>
                <select value={currency} onChange={e => setCurrency(e.target.value)}
                  style={{ width: '100%', padding: '10px 32px 10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#0f172a', outline: 'none', background: '#fafafa', appearance: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="INR">INR — Indian Rupee</option>
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Target Location</h2>
          <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#64748b' }}>Where do you want to run your ads?</p>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Search location..."
              style={{ width: '100%', padding: '10px 14px 10px 34px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#0f172a', outline: 'none', background: '#fafafa', boxSizing: 'border-box', fontFamily: 'inherit' }}
              onFocus={e => (e.target.style.borderColor = '#7c3aed')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
          </div>
        </div>

        <button onClick={handleSave} style={{ width: '100%', padding: '13px', borderRadius: '10px', background: saved ? '#16a34a' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 6px 16px rgba(124,58,237,0.3)', transition: 'all 0.2s' }}>
          <Save size={16} /> {saved ? 'Saved Successfully!' : 'Save Optimization Goal'}
        </button>
      </div>
    </div>
  );
};
