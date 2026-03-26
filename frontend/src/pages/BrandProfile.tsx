import React, { useState } from 'react';
import { Save, Upload } from 'lucide-react';

const tabs = ['Ad Platform Connection', 'Subscribe', 'Your Profile'];
const sections = ['Basics', 'Login and security'];

export const BrandProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Your Profile');
  const [activeSection, setActiveSection] = useState('Basics');
  const [form, setForm] = useState({ firstName: '', lastName: '', team: '', email: 'user@example.com', country: '' });
  const [saved, setSaved] = useState(false);

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ minHeight: '100%', background: '#f5f6fa' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8eaf0', padding: '0 32px' }}>
        <div style={{ padding: '16px 0 0', fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          Home <span>/</span> <span style={{ color: '#0f172a', fontWeight: 600 }}>Your profile</span>
        </div>
        <div style={{ display: 'flex', gap: '0', marginTop: '12px' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '0.88rem', fontWeight: 600,
              color: activeTab === tab ? '#7c3aed' : '#64748b',
              borderBottom: activeTab === tab ? '2px solid #7c3aed' : '2px solid transparent',
              transition: 'all 0.15s'
            }}>{tab}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 32px', display: 'flex', gap: '24px', maxWidth: '900px' }}>
        {/* Left Nav */}
        <div style={{ width: '200px', flexShrink: 0 }}>
          {sections.map((sec, i) => (
            <div key={sec} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '2px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeSection === sec ? '#7c3aed' : '#e2e8f0', border: activeSection === sec ? 'none' : '2px solid #94a3b8', flexShrink: 0, cursor: 'pointer' }} onClick={() => setActiveSection(sec)} />
                {i < sections.length - 1 && <div style={{ width: '2px', height: '40px', background: '#e2e8f0', marginTop: '2px' }} />}
              </div>
              <button onClick={() => setActiveSection(sec)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 32px', fontSize: '0.85rem', fontWeight: 600, color: activeSection === sec ? '#7c3aed' : '#475569', textAlign: 'left' }}>
                {sec}
              </button>
            </div>
          ))}
        </div>

        {/* Form Area */}
        <div style={{ flex: 1, background: '#fff', border: '1px solid #e8eaf0', borderRadius: '12px', padding: '28px' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Basics</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {[
              { key: 'firstName', label: 'First name', placeholder: 'Enter first name' },
              { key: 'lastName', label: 'Last name', placeholder: 'Enter last name' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }}>{field.label}</label>
                <input value={form[field.key as keyof typeof form]} onChange={e => update(field.key, e.target.value)} placeholder={field.placeholder}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '99px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#0f172a', outline: 'none', background: '#f8fafc', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                  onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </div>
            ))}
          </div>

          {[
            { key: 'team', label: 'Team', placeholder: 'Team ID or name' },
            { key: 'email', label: 'Email', placeholder: 'Email address' },
            { key: 'country', label: 'Country and Region', placeholder: 'Select country' },
          ].map(field => (
            <div key={field.key} style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }}>{field.label}</label>
              <input value={form[field.key as keyof typeof form]} onChange={e => update(field.key, e.target.value)} placeholder={field.placeholder}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '99px', border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#0f172a', outline: 'none', background: '#f8fafc', boxSizing: 'border-box', fontFamily: 'inherit' }}
                onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
            </div>
          ))}

          <button onClick={handleSave} style={{ marginTop: '8px', padding: '10px 24px', borderRadius: '8px', background: saved ? '#16a34a' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 4px 12px rgba(124,58,237,0.25)', transition: 'background 0.2s' }}>
            <Save size={15} /> {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
