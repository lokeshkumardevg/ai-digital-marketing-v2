import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import { User, Key, Bell, Shield, Save } from 'lucide-react';
import { updateUser } from '../store/slices/authSlice';
import { addNotification } from '../store/slices/notificationSlice';
import type { AppDispatch } from '../store';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: any) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [openAiKey, setOpenAiKey] = useState(user?.openAiKey || '');
  const [geminiKey, setGeminiKey] = useState(user?.geminiKey || '');

  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setOpenAiKey(user.openAiKey || '');
      setGeminiKey(user.geminiKey || '');
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const promise = dispatch(updateUser({ 
        name, 
        openAiKey, 
        geminiKey 
      })).unwrap();

      toast.promise(promise, {
        loading: 'Syncing profile to cloud...',
        success: 'Settings updated successfully!',
        error: 'Failed to update settings.'
      });

      await promise;
      dispatch(addNotification({ 
        id: Date.now().toString(), 
        title: 'Profile Synchronized', 
        message: 'Your account preferences and API integrations are now live.', 
        type: 'success', 
        time: new Date().toISOString(), 
        read: false 
      }));
    } catch (err) {
      console.error(err);
      dispatch(addNotification({ 
        id: Date.now().toString(), 
        title: 'Sync Error', 
        message: 'Failed to reach authentication node.', 
        type: 'error', 
        time: new Date().toISOString(), 
        read: false 
      }));
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
          Account <span className="text-gradient">Settings</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your profile, API keys, and notification preferences.</p>
      </div>

      <div style={{ display: 'flex', gap: '32px' }}>
        <GlassCard style={{ width: '250px', height: 'fit-content', padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: 'profile', icon: User, label: 'Profile Settings' },
              { id: 'api', icon: Key, label: 'API Keys Integrations' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'security', icon: Shield, label: 'Security & Auth' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                  borderRadius: '8px', cursor: 'pointer',
                  background: activeTab === tab.id ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: activeTab === tab.id ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid transparent',
                  transition: 'all 0.2s', width: '100%', textAlign: 'left', fontWeight: activeTab === tab.id ? 500 : 400
                }}
              >
                <tab.icon size={18} color={activeTab === tab.id ? 'var(--accent-primary)' : 'currentColor'} />
                {tab.label}
              </button>
            ))}
          </div>
        </GlassCard>

        <div style={{ flex: 1 }}>
          <GlassCard style={{ padding: '32px' }}>
            {activeTab === 'profile' && (
              <div className="animate-fade-in">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Profile Information</h3>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '16px',
                    background: 'var(--accent-gradient)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold'
                  }}>
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="input-group">
                      <label>Full Name</label>
                      <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label>Email Address</label>
                      <input type="email" className="input-field" value={user?.email || 'admin@example.com'} disabled />
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Email address cannot be changed from the dashboard.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="animate-fade-in">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>API Integrations</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>Connect third-party models to bypass SaaS token limits.</p>
                
                <div className="input-group">
                  <label>OpenAI Secret Key</label>
                  <input type="password" placeholder="sk-..." className="input-field" value={openAiKey} onChange={e => setOpenAiKey(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Google Gemini Key</label>
                  <input type="password" placeholder="AIza..." className="input-field" value={geminiKey} onChange={e => setGeminiKey(e.target.value)} />
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="animate-fade-in">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Notification Preferences</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label className="checkbox-wrapper">
                    <input type="checkbox" defaultChecked /> Receive email alerts when campaigns complete
                  </label>
                  <label className="checkbox-wrapper">
                    <input type="checkbox" defaultChecked /> Weekly AI performance summaries
                  </label>
                  <label className="checkbox-wrapper">
                    <input type="checkbox" /> Marketing tip emails
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="animate-fade-in">
                 <h3 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Security & Auth</h3>
                 <div className="input-group">
                  <label>Current Password</label>
                  <input type="password" placeholder="••••••••" className="input-field" />
                 </div>
                 <div className="input-group">
                  <label>New Password</label>
                  <input type="password" placeholder="••••••••" className="input-field" />
                 </div>
              </div>
            )}

            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Save size={18} /> Save Changes
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
