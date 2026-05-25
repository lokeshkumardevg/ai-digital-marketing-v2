import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import { User, Key, Bell, Shield, Save, Settings as SettingsIcon } from 'lucide-react';
import { updateUser } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import type { AppDispatch } from '../../store';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: any) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [openAiKey, setOpenAiKey] = useState(user?.openAiKey || '');
  const [geminiKey, setGeminiKey] = useState(user?.geminiKey || '');

  // API Credentials state
  const [googleClientId, setGoogleClientId] = useState(user?.googleClientId || '');
  const [googleClientSecret, setGoogleClientSecret] = useState(user?.googleClientSecret || '');
  const [googleDeveloperToken, setGoogleDeveloperToken] = useState(user?.googleDeveloperToken || '');
  const [googleCustomerId, setGoogleCustomerId] = useState(user?.googleCustomerId || '');
  const [metaAppId, setMetaAppId] = useState(user?.metaAppId || '');
  const [metaAppSecret, setMetaAppSecret] = useState(user?.metaAppSecret || '');
  
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setOpenAiKey(user.openAiKey || '');
      setGeminiKey(user.geminiKey || '');
      setGoogleClientId(user.googleClientId || '');
      setGoogleClientSecret(user.googleClientSecret || '');
      setGoogleDeveloperToken(user.googleDeveloperToken || '');
      setGoogleCustomerId(user.googleCustomerId || '');
      setMetaAppId(user.metaAppId || '');
      setMetaAppSecret(user.metaAppSecret || '');
    }
  }, [user]);

  React.useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const linkedinConnected = url.searchParams.get('linkedinConnected');
      if (linkedinConnected === 'success') {
        toast.success('LinkedIn account connected successfully!');
      } else if (linkedinConnected === 'error') {
        const reason = url.searchParams.get('reason');
        toast.error(`Failed to connect LinkedIn: ${reason || 'Unknown error'}`);
      }

      if (linkedinConnected) {
        url.searchParams.delete('linkedinConnected');
        url.searchParams.delete('reason');
        window.history.replaceState({}, '', url.toString());
      }
    } catch {}
  }, []);

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

  const handleSaveApiCredentials = async (type: 'google' | 'meta') => {
    try {
      const { api } = await import('../../api/axios');

      if (type === 'google') {
        const response = await api.post('/auth/google/credentials', {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          developerToken: googleDeveloperToken,
          customerId: googleCustomerId,
        });

        if (response.data.success) {
          toast.success('Google credentials saved successfully!');
          dispatch(addNotification({
            id: Date.now().toString(),
            title: 'Google Credentials Updated',
            message: 'Your Google Ads API credentials have been saved.',
            type: 'success',
            time: new Date().toISOString(),
            read: false
          }));
        }
      } else if (type === 'meta') {
        const response = await api.post('/auth/meta/credentials', {
          appId: metaAppId,
          appSecret: metaAppSecret,
        });

        if (response.data.success) {
          toast.success('Meta credentials saved successfully!');
          dispatch(addNotification({
            id: Date.now().toString(),
            title: 'Meta Credentials Updated',
            message: 'Your Meta Ads API credentials have been saved.',
            type: 'success',
            time: new Date().toISOString(),
            read: false
          }));
        }
      }
    } catch (error: any) {
      console.error('Error saving credentials:', error);
      toast.error(error?.response?.data?.message || 'Failed to save credentials');
      dispatch(addNotification({
        id: Date.now().toString(),
        title: 'Credential Save Failed',
        message: 'Failed to save your API credentials. Please try again.',
        type: 'error',
        time: new Date().toISOString(),
        read: false
      }));
    }
  };

  const connectGoogle = async () => {
    try {
      const { api } = await import('../../api/axios');
      const response = await api.get('/auth/google');
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to initiate Google connection');
    }
  };

  const connectMeta = async () => {
    try {
      const { api } = await import('../../api/axios');
      const response = await api.get('/auth/meta');
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to initiate Meta connection');
    }
  };

  const connectX = async () => {
    try {
      const { api } = await import('../../api/axios');
      const response = await api.get('social/auth/twitter');
      console.log('X connection response:', response);
      window.location.href = response.data.data.url;
    } catch (error) {
      toast.error('Failed to initiate X connection');
    }
  };

  const connectLinkedIn = async () => {
    try {
      const { api } = await import('../../api/axios');
      const response = await api.get('/linkedin-crm/oauth/url');
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to initiate LinkedIn connection');
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
                      background: activeTab === tab.id ? 'rgba(38, 49, 214, 0.1)' : 'transparent',
                      color: activeTab === tab.id ? 'var(--text-secondary)' : 'var(--text-secondary)',
                      border: activeTab === tab.id ? '1px solid rgba(38, 49, 214, 0.2)' : '1px solid transparent',
                      transition: 'all 0.2s', width: '100%', textAlign: 'left', fontWeight: activeTab === tab.id ? 500 : 400
                    }}
                  >
                    <tab.icon size={18} color={activeTab === tab.id ? '#0665ff' : 'currentColor'} />
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
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>Connect third-party models and ad platforms.</p>

                    {/* AI Models */}
                    <div style={{ marginBottom: '32px' }}>
                      <h4 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>AI Models</h4>
                      <div className="input-group">
                        <label>OpenAI Secret Key</label>
                        <input type="password" placeholder="sk-..." className="input-field" value={openAiKey} onChange={e => setOpenAiKey(e.target.value)} />
                      </div>
                      <div className="input-group">
                        <label>Google Gemini Key</label>
                        <input type="password" placeholder="AIza..." className="input-field" value={geminiKey} onChange={e => setGeminiKey(e.target.value)} />
                      </div>
                    </div>

                    {/* Google Ads Credentials */}
                    <div style={{ marginBottom: '32px', padding: '20px', background: 'rgba(66, 133, 244, 0.05)', borderRadius: '12px', border: '1px solid rgba(66, 133, 244, 0.2)' }}>
                      <h4 style={{ fontSize: '1rem', marginBottom: '16px', color: '#4285f4', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SettingsIcon size={16} /> Google Ads API Credentials
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        Set your own Google Ads API credentials. These will be stored securely in your account.
                      </p>

                      <div className="input-group">
                        <label>Client ID</label>
                        <input
                          type="text"
                          placeholder="123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
                          className="input-field"
                          value={googleClientId}
                          onChange={e => setGoogleClientId(e.target.value)}
                        />
                      </div>

                      <div className="input-group">
                        <label>Client Secret</label>
                        <input
                          type="password"
                          placeholder="GOCSPX-..."
                          className="input-field"
                          value={googleClientSecret}
                          onChange={e => setGoogleClientSecret(e.target.value)}
                        />
                      </div>

                      <div className="input-group">
                        <label>Developer Token</label>
                        <input
                          type="password"
                          placeholder="ABcdeFGHijklMNopqrsTUVwxyZ..."
                          className="input-field"
                          value={googleDeveloperToken}
                          onChange={e => setGoogleDeveloperToken(e.target.value)}
                        />
                      </div>

                      <div className="input-group">
                        <label>Customer ID</label>
                        <input
                          type="text"
                          placeholder="123-456-7890"
                          className="input-field"
                          value={googleCustomerId}
                          onChange={e => setGoogleCustomerId(e.target.value)}
                        />
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                          Required for live Google Ads insights. This is the Ads customer ID for your account.
                        </p>
                      </div>

                      <button
                        onClick={() => handleSaveApiCredentials('google')}
                        disabled={!googleClientId || !googleClientSecret}
                        style={{
                          marginTop: '12px',
                          padding: '10px 20px',
                          background: 'linear-gradient(135deg, #4285f4, #34a853)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: (!googleClientId || !googleClientSecret) ? 'not-allowed' : 'pointer',
                          opacity: (!googleClientId || !googleClientSecret) ? 0.6 : 1
                        }}
                      >
                        Save Google Credentials
                      </button>
                    </div>

                    {/* Meta Ads Credentials */}
                    <div style={{ marginBottom: '32px', padding: '20px', background: 'rgba(24, 119, 242, 0.05)', borderRadius: '12px', border: '1px solid rgba(24, 119, 242, 0.2)' }}>
                      <h4 style={{ fontSize: '1rem', marginBottom: '16px', color: '#1877f2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SettingsIcon size={16} /> Meta Ads API Credentials
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        Set your own Meta Ads API credentials. These will be stored securely in your account.
                      </p>

                      <div className="input-group">
                        <label>App ID</label>
                        <input
                          type="text"
                          placeholder="1234567890123456"
                          className="input-field"
                          value={metaAppId}
                          onChange={e => setMetaAppId(e.target.value)}
                        />
                      </div>

                      <div className="input-group">
                        <label>App Secret</label>
                        <input
                          type="password"
                          placeholder="abcdef123456..."
                          className="input-field"
                          value={metaAppSecret}
                          onChange={e => setMetaAppSecret(e.target.value)}
                        />
                      </div>

                      <button
                        onClick={() => handleSaveApiCredentials('meta')}
                        disabled={!metaAppId || !metaAppSecret}
                        style={{
                          marginTop: '12px',
                          padding: '10px 20px',
                          background: 'linear-gradient(135deg, #1877f2, #0e5a8a)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: (!metaAppId || !metaAppSecret) ? 'not-allowed' : 'pointer',
                          opacity: (!metaAppId || !metaAppSecret) ? 0.6 : 1
                        }}
                      >
                        Save Meta Credentials
                      </button>
                    </div>

                    {/* OAuth Connections */}
                    <div style={{ paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                      <h4 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>OAuth Connections</h4>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <button
                          onClick={connectGoogle}
                          disabled={!user?.id}
                          style={{
                            padding: '12px',
                            background: user?.googleRefreshToken ? '#d1d5db' : 'linear-gradient(135deg, #4285f4, #34a853)',
                            color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: user?.googleRefreshToken ? 'default' : 'pointer'
                          }}
                        >
                          🔗 {user?.googleRefreshToken ? 'Google Ads Connected ✓' : 'Connect Google Ads'}
                        </button>

                        <button
                          onClick={connectMeta}
                          disabled={!user?.id}
                          style={{
                            padding: '12px',
                            background: user?.metaAccessToken ? '#d1d5db' : 'linear-gradient(135deg, #1877f2, #0e5a8a)',
                            color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: user?.metaAccessToken ? 'default' : 'pointer'
                          }}
                        >
                          𝕄 {user?.metaAccessToken ? 'Meta Ads Connected ✓' : 'Connect Meta Ads'}
                        </button>

                        <button
                          onClick={connectX}
                          disabled={!user?.id}
                          style={{
                            padding: '12px',
                            background: user?.twitterAccessToken ? '#d1d5db' : 'linear-gradient(135deg, #000000, #333333)',
                            color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: user?.twitterAccessToken ? 'default' : 'pointer'
                          }}
                        >
                          𝕏 {user?.twitterAccessToken ? 'X Ads Connected ✓' : 'Connect X Ads'}
                        </button>

                        <button
                          onClick={connectLinkedIn}
                          disabled={!user?.id}
                          style={{
                            padding: '12px',
                            background: user?.linkedinAccessToken ? '#d1d5db' : 'linear-gradient(135deg, #0a66c2, #004182)',
                            color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: user?.linkedinAccessToken ? 'default' : 'pointer'
                          }}
                        >
                          💼 {user?.linkedinAccessToken ? 'LinkedIn Ads Connected ✓' : 'Connect LinkedIn'}
                        </button>
                      </div>
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
  
