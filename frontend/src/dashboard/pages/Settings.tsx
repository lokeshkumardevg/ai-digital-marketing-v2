import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import { User, Key, Shield, Settings as SettingsIcon, CheckCircle2, ChevronRight, Edit2 } from 'lucide-react';
import { updateUser, hydrateSession } from '../../store/slices/authSlice';
import type { AppDispatch } from '../../store';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: any) => state.auth);
  
  const [activeTab, setActiveTab] = useState('profile');
  
  // Edit Modes
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingAI, setIsEditingAI] = useState(false);
  const [isEditingGoogle, setIsEditingGoogle] = useState(false);
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [isEditingX, setIsEditingX] = useState(false);

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
  const [xAccessToken, setXAccessToken] = useState(user?.twitterAccessToken || '');
  const [xTokenSecret, setXTokenSecret] = useState(user?.twitterRefreshToken || '');

  const [metaAdAccounts, setMetaAdAccounts] = useState<any[]>([]);
  const [selectedMetaAdAccount, setSelectedMetaAdAccount] = useState('');

  const [metaBusinesses, setMetaBusinesses] = useState<any[]>([]);
  const [selectedMetaBusiness, setSelectedMetaBusiness] = useState('');

  const [xAdAccounts, setXAdAccounts] = useState<any[]>([]);
  const [selectedXAdAccount, setSelectedXAdAccount] = useState('');

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
      setXAccessToken(user.twitterAccessToken || '');
      setXTokenSecret(user.twitterRefreshToken || '');

      if (user.metaAccessToken) {
        setSelectedMetaAdAccount(user.metaAdAccountId || '');
        setSelectedMetaBusiness(user.metaBusinessId || '');
        import('../../api/axios').then(({ api }) => {
          api.get('/auth/meta/adaccounts').then(res => {
            if (res.data && res.data.data) {
              setMetaAdAccounts(res.data.data);
            }
          }).catch(console.error);

          api.get('/auth/meta/businesses').then(res => {
            if (res.data && res.data.data) {
              setMetaBusinesses(res.data.data);
            }
          }).catch(console.error);
        });
      }

      if (user.twitterAccessToken) {
        setSelectedXAdAccount(user.twitterAdAccountId || '');
        import('../../api/axios').then(({ api }) => {
          api.get('/auth/x/adaccounts').then(res => {
            if (res.data && res.data.data) {
              setXAdAccounts(res.data.data);
            }
          }).catch(console.error);
        });
      }
    }
  }, [user]);

  React.useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const linkedinConnected = url.searchParams.get('linkedinConnected');
      const metaConnected = url.searchParams.get('metaConnected');
      const xConnected = url.searchParams.get('xConnected');
      const googleConnected = url.searchParams.get('googleConnected');
      const gscConnected = url.searchParams.get('gscConnected');

      if (linkedinConnected === 'success') toast.success('LinkedIn account connected successfully!');
      if (metaConnected === 'success') toast.success('Meta Ads account connected successfully!');
      if (xConnected === 'success') toast.success('X Ads account connected successfully!');
      if (googleConnected === 'success') toast.success('Google Ads account connected successfully!');
      if (gscConnected === 'success') toast.success('Google Search Console connected successfully!');

      let changed = false;
      if (linkedinConnected) { url.searchParams.delete('linkedinConnected'); changed = true; }
      if (metaConnected) { url.searchParams.delete('metaConnected'); changed = true; }
      if (xConnected) { url.searchParams.delete('xConnected'); changed = true; }
      if (googleConnected) { url.searchParams.delete('googleConnected'); changed = true; }
      if (gscConnected) { url.searchParams.delete('gscConnected'); changed = true; }

      if (changed) {
        url.searchParams.delete('reason');
        window.history.replaceState({}, '', url.toString());
      }
    } catch { }
  }, []);

  const handleSave = async (section: 'profile' | 'ai') => {
    try {
      const promise = dispatch(updateUser({ name, openAiKey, geminiKey })).unwrap();
      toast.promise(promise, { loading: 'Saving...', success: 'Updated successfully!', error: 'Update failed.' });
      await promise;
      if (section === 'profile') setIsEditingProfile(false);
      if (section === 'ai') setIsEditingAI(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveApiCredentials = async (type: 'google' | 'meta' | 'x') => {
    try {
      const { api } = await import('../../api/axios');

      if (type === 'google') {
        const response = await api.post('/auth/google/credentials', {
          clientId: googleClientId, clientSecret: googleClientSecret,
          developerToken: googleDeveloperToken, customerId: googleCustomerId,
        });
        if (response.data.success) {
          toast.success('Google credentials saved!');
          dispatch(hydrateSession());
          setIsEditingGoogle(false);
        }
      } else if (type === 'meta') {
        const response = await api.post('/auth/meta/credentials', { appId: metaAppId, appSecret: metaAppSecret });
        if (response.data.success) {
          toast.success('Meta credentials saved!');
          dispatch(hydrateSession());
          setIsEditingMeta(false);
        }
      } else if (type === 'x') {
        const response = await api.post('/auth/x/credentials', { accessToken: xAccessToken, tokenSecret: xTokenSecret });
        if (response.data.success) {
          toast.success('X credentials saved!');
          dispatch(hydrateSession());
          setIsEditingX(false);
        }
      }
    } catch (error: any) {
      toast.error('Failed to save credentials');
    }
  };

  const connectGoogle = async () => {
    try { const { api } = await import('../../api/axios'); const response = await api.get('/auth/google'); window.location.href = response.data.url; } catch (error) { toast.error('Failed to initiate connection'); }
  };
  const connectSearchConsole = async () => {
    try { const { api } = await import('../../api/axios'); const response = await api.get('/auth/google/gsc'); window.location.href = response.data.url; } catch (error) { toast.error('Failed to initiate connection'); }
  };
  const connectMeta = async () => {
    try { const { api } = await import('../../api/axios'); const response = await api.get('/auth/meta'); window.location.href = response.data.url; } catch (error) { toast.error('Failed to initiate connection'); }
  };
  const connectX = async () => {
    try { const { api } = await import('../../api/axios'); const response = await api.get('/auth/x'); window.location.href = response.data.url; } catch (error) { toast.error('Failed to initiate connection'); }
  };
  const connectLinkedIn = async () => {
    try { const { api } = await import('../../api/axios'); const response = await api.get('/linkedin-crm/oauth/url'); window.location.href = response.data.url; } catch (error) { toast.error('Failed to initiate connection'); }
  };

  const maskString = (str: string) => {
    if (!str || str.length < 6) return str ? '•'.repeat(str.length) : 'Not configured';
    return str.substring(0, 3) + '•'.repeat(8) + str.substring(str.length - 3);
  };

  const renderListItem = (label: string, value: string) => (
    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
      <div style={{ color: 'var(--text-secondary)' }}>{label}</div>
      <div style={{ color: value === 'Not configured' ? 'var(--text-secondary)' : 'white' }}>{value}</div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
        <h1 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <SettingsIcon size={20} className="text-gradient" /> Settings
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <div style={{ width: '180px', flexShrink: 0, position: 'sticky', top: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'profile', icon: User, label: 'Profile' },
              { id: 'oauth', icon: Shield, label: 'Integrations' },
              { id: 'api', icon: Key, label: 'Developer APIs' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
                  borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
                  background: activeTab === tab.id ? 'rgba(6, 101, 255, 0.1)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  border: activeTab === tab.id ? '1px solid rgba(6, 101, 255, 0.2)' : '1px solid transparent',
                  transition: 'all 0.2s', textAlign: 'left', fontWeight: activeTab === tab.id ? 600 : 400
                }}
              >
                <tab.icon size={14} />
                <span style={{ flex: 1 }}>{tab.label}</span>
                {activeTab === tab.id && <ChevronRight size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <GlassCard style={{ padding: '24px' }}>
            
            {/* ---------------- Profile Tab ---------------- */}
            {activeTab === 'profile' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Personal Information</h3>
                  {!isEditingProfile && (
                    <button onClick={() => setIsEditingProfile(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                      <Edit2 size={12} /> Edit Profile
                    </button>
                  )}
                </div>

                {!isEditingProfile ? (
                  <div>
                    {renderListItem('Full Name', user?.name || 'Not configured')}
                    {renderListItem('Email Address', user?.email || 'Not configured')}
                  </div>
                ) : (
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <div className="input-group" style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '0.8rem' }}>Full Name</label>
                      <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem' }} />
                    </div>
                    <div className="input-group" style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.8rem' }}>Email Address</label>
                      <input type="email" className="input-field" value={user?.email || ''} disabled style={{ padding: '8px', opacity: 0.6, fontSize: '0.85rem' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-primary" onClick={() => handleSave('profile')} style={{ padding: '6px 16px', fontSize: '0.85rem' }}>Save Changes</button>
                      <button onClick={() => setIsEditingProfile(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------------- Integrations Tab ---------------- */}
            {activeTab === 'oauth' && (
              <div className="animate-fade-in">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Social & Ad Integrations</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  
                  {/* Meta Card */}
                  <div style={{ padding: '24px', border: user?.metaAccessToken ? '1px solid rgba(24, 119, 242, 0.4)' : '1px solid var(--glass-border)', borderRadius: '12px', background: user?.metaAccessToken ? 'rgba(24, 119, 242, 0.03)' : 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>M</div>
                        <div>
                          <h4 style={{ fontSize: '1.05rem', margin: 0 }}>Meta Ads</h4>
                          <span style={{ fontSize: '0.8rem', color: user?.metaAccessToken ? '#1877f2' : 'var(--text-secondary)' }}>
                            {user?.metaAccessToken ? 'Connected' : 'Not Connected'}
                          </span>
                        </div>
                      </div>
                      {user?.metaAccessToken && <CheckCircle2 size={18} color="#1877f2" />}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px', flex: 1 }}>Auto-publish campaigns and track Facebook/Instagram ad performance.</p>
                    
                    {!user?.metaAccessToken ? (
                      <button onClick={connectMeta} disabled={!user?.id} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #1877f2, #0e5a8a)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>Connect Meta Account</button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Ad Account</label>
                          <select value={selectedMetaAdAccount} onChange={(e) => setSelectedMetaAdAccount(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'white', fontSize: '0.85rem' }}>
                            <option value="">Select Ad Account...</option>
                            {metaAdAccounts.map(acc => {
                              const actId = acc.account_id.startsWith('act_') ? acc.account_id : `act_${acc.account_id}`;
                              return <option key={actId} value={actId}>{acc.name}</option>;
                            })}
                          </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Business Asset</label>
                          <select value={selectedMetaBusiness} onChange={(e) => setSelectedMetaBusiness(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'white', fontSize: '0.85rem' }}>
                            <option value="">Select Business...</option>
                            {metaBusinesses.map(biz => <option key={biz.id} value={biz.id}>{biz.name}</option>)}
                          </select>
                        </div>
                        <button onClick={async () => {
                            if (selectedMetaAdAccount) {
                              const acc = metaAdAccounts.find(a => (a.account_id.startsWith('act_') ? a.account_id : `act_${a.account_id}`) === selectedMetaAdAccount);
                              const { api } = await import('../../api/axios');
                              await api.post('/auth/meta/adaccount', { adAccountId: selectedMetaAdAccount, adAccountName: acc?.name || 'Account' });
                            }
                            if (selectedMetaBusiness) {
                              const biz = metaBusinesses.find(b => b.id === selectedMetaBusiness);
                              const { api } = await import('../../api/axios');
                              await api.post('/auth/meta/business', { businessId: selectedMetaBusiness, businessName: biz?.name || 'Business' });
                            }
                            dispatch(hydrateSession()); toast.success('Saved Meta Preferences');
                          }} style={{ width: '100%', marginTop: '4px', padding: '8px', background: 'rgba(24, 119, 242, 0.1)', color: '#1877f2', border: '1px solid rgba(24, 119, 242, 0.3)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Save Selections</button>
                      </div>
                    )}
                  </div>

                  {/* X Card */}
                  <div style={{ padding: '24px', border: user?.twitterAccessToken ? '1px solid rgba(255,255,255,0.3)' : '1px solid var(--glass-border)', borderRadius: '12px', background: user?.twitterAccessToken ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>𝕏</div>
                        <div>
                          <h4 style={{ fontSize: '1.05rem', margin: 0 }}>X (Twitter) Ads</h4>
                          <span style={{ fontSize: '0.8rem', color: user?.twitterAccessToken ? 'white' : 'var(--text-secondary)' }}>
                            {user?.twitterAccessToken ? 'Connected' : 'Not Connected'}
                          </span>
                        </div>
                      </div>
                      {user?.twitterAccessToken && <CheckCircle2 size={18} color="white" />}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px', flex: 1 }}>Link your X account for autonomous tweet generation and promoted campaigns.</p>
                    
                    {!user?.twitterAccessToken ? (
                      <button onClick={connectX} disabled={!user?.id} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #333333, #000000)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>Connect X Account</button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Ad Account</label>
                          <select value={selectedXAdAccount} onChange={(e) => setSelectedXAdAccount(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'white', fontSize: '0.85rem' }}>
                            <option value="">Select Ad Account...</option>
                            {xAdAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                          </select>
                        </div>
                        <button onClick={async () => {
                            if (selectedXAdAccount) {
                              const acc = xAdAccounts.find(a => a.id === selectedXAdAccount);
                              const { api } = await import('../../api/axios');
                              await api.post('/auth/x/adaccount', { adAccountId: selectedXAdAccount, adAccountName: acc?.name || 'Account' });
                              dispatch(hydrateSession()); toast.success('Saved X Preferences');
                            }
                          }} style={{ width: '100%', marginTop: '4px', padding: '8px', background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Save Selection</button>
                      </div>
                    )}
                  </div>

                  {/* LinkedIn Card */}
                  <div style={{ padding: '24px', border: user?.linkedinAccessToken ? '1px solid rgba(10, 102, 194, 0.4)' : '1px solid var(--glass-border)', borderRadius: '12px', background: user?.linkedinAccessToken ? 'rgba(10, 102, 194, 0.03)' : 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#0a66c2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>in</div>
                        <div>
                          <h4 style={{ fontSize: '1.05rem', margin: 0 }}>LinkedIn</h4>
                          <span style={{ fontSize: '0.8rem', color: user?.linkedinAccessToken ? '#0a66c2' : 'var(--text-secondary)' }}>
                            {user?.linkedinAccessToken ? 'Connected' : 'Not Connected'}
                          </span>
                        </div>
                      </div>
                      {user?.linkedinAccessToken && <CheckCircle2 size={18} color="#0a66c2" />}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px', flex: 1 }}>Automate B2B lead generation, post publishing, and CRM synchronization.</p>
                    
                    {!user?.linkedinAccessToken ? (
                      <button onClick={connectLinkedIn} disabled={!user?.id} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #0a66c2, #004182)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>Connect LinkedIn</button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10, 102, 194, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(10, 102, 194, 0.2)' }}>
                        <span style={{ color: '#0a66c2', fontSize: '0.9rem', fontWeight: 500 }}>Sync is Active</span>
                      </div>
                    )}
                  </div>

                  {/* Google Ads Card */}
                  <div style={{ padding: '24px', border: user?.googleAccessToken ? '1px solid rgba(66, 133, 244, 0.4)' : '1px solid var(--glass-border)', borderRadius: '12px', background: user?.googleAccessToken ? 'rgba(66, 133, 244, 0.03)' : 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#4285f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>G</div>
                        <div>
                          <h4 style={{ fontSize: '1.05rem', margin: 0 }}>Google Ads</h4>
                          <span style={{ fontSize: '0.8rem', color: user?.googleAccessToken ? '#4285f4' : 'var(--text-secondary)' }}>
                            {user?.googleAccessToken ? 'Connected' : 'Not Connected'}
                          </span>
                        </div>
                      </div>
                      {user?.googleAccessToken && <CheckCircle2 size={18} color="#4285f4" />}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px', flex: 1 }}>Automate, launch, and monitor your Google search campaigns and ad metrics.</p>
                    
                    {!user?.googleAccessToken ? (
                      <button onClick={connectGoogle} disabled={!user?.id} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #4285f4, #2a56c6)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>Connect Google Ads</button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(66, 133, 244, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(66, 133, 244, 0.2)' }}>
                        <span style={{ color: '#4285f4', fontSize: '0.9rem', fontWeight: 500 }}>Sync is Active</span>
                      </div>
                    )}
                  </div>

                  {/* Google Search Console Card */}
                  <div style={{ padding: '24px', border: user?.googleSearchConsoleConnected ? '1px solid rgba(244, 180, 0, 0.4)' : '1px solid var(--glass-border)', borderRadius: '12px', background: user?.googleSearchConsoleConnected ? 'rgba(244, 180, 0, 0.03)' : 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f4b400', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>GSC</div>
                        <div>
                          <h4 style={{ fontSize: '1.05rem', margin: 0 }}>Search Console</h4>
                          <span style={{ fontSize: '0.8rem', color: user?.googleSearchConsoleConnected ? '#f4b400' : 'var(--text-secondary)' }}>
                            {user?.googleSearchConsoleConnected ? 'Connected' : 'Not Connected'}
                          </span>
                        </div>
                      </div>
                      {user?.googleSearchConsoleConnected && <CheckCircle2 size={18} color="#f4b400" />}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px', flex: 1 }}>Access Search Console live telemetry, keyword clicks, CTR and indexing data.</p>
                    
                    {!user?.googleSearchConsoleConnected ? (
                      <button onClick={connectSearchConsole} disabled={!user?.id} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #f4b400, #c68a00)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>Connect Search Console</button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(244, 180, 0, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(244, 180, 0, 0.2)' }}>
                        <span style={{ color: '#f4b400', fontSize: '0.9rem', fontWeight: 500 }}>Sync is Active</span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* ---------------- Developer APIs Tab ---------------- */}
            {activeTab === 'api' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* AI Keys */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '1rem', margin: 0 }}>AI Models</h4>
                    {!isEditingAI && (
                      <button onClick={() => setIsEditingAI(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.8rem' }}><Edit2 size={12} /> Edit</button>
                    )}
                  </div>
                  {!isEditingAI ? (
                    <div>
                      {renderListItem('OpenAI Secret Key', maskString(user?.openAiKey))}
                      {renderListItem('Google Gemini Key', maskString(user?.geminiKey))}
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                      <div className="input-group" style={{ marginBottom: '12px' }}><label style={{ fontSize: '0.8rem' }}>OpenAI Secret Key</label><input type="password" placeholder="sk-..." className="input-field" value={openAiKey} onChange={e => setOpenAiKey(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem' }} /></div>
                      <div className="input-group" style={{ marginBottom: '16px' }}><label style={{ fontSize: '0.8rem' }}>Gemini Key</label><input type="password" placeholder="AIza..." className="input-field" value={geminiKey} onChange={e => setGeminiKey(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem' }} /></div>
                      <div style={{ display: 'flex', gap: '8px' }}><button className="btn btn-primary" onClick={() => handleSave('ai')} style={{ padding: '6px 16px', fontSize: '0.85rem' }}>Save</button><button onClick={() => setIsEditingAI(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button></div>
                    </div>
                  )}
                </div>

                {/* Google Ads */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '1rem', margin: 0, color: '#4285f4' }}>Google Ads Manual Credentials</h4>
                    {!isEditingGoogle && (
                      <button onClick={() => setIsEditingGoogle(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: '#4285f4', cursor: 'pointer', fontSize: '0.8rem' }}><Edit2 size={12} /> Edit</button>
                    )}
                  </div>
                  {!isEditingGoogle ? (
                    <div>
                      {renderListItem('Client ID', maskString(user?.googleClientId))}
                      {renderListItem('Client Secret', maskString(user?.googleClientSecret))}
                      {renderListItem('Developer Token', maskString(user?.googleDeveloperToken))}
                      {renderListItem('Customer ID', user?.googleCustomerId || 'Not configured')}
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(66, 133, 244, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(66, 133, 244, 0.2)' }}>
                      <div className="input-group" style={{ marginBottom: '12px' }}><label style={{ fontSize: '0.8rem' }}>Client ID</label><input type="text" className="input-field" value={googleClientId} onChange={e => setGoogleClientId(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem' }} /></div>
                      <div className="input-group" style={{ marginBottom: '12px' }}><label style={{ fontSize: '0.8rem' }}>Client Secret</label><input type="password" className="input-field" value={googleClientSecret} onChange={e => setGoogleClientSecret(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem' }} /></div>
                      <div className="input-group" style={{ marginBottom: '12px' }}><label style={{ fontSize: '0.8rem' }}>Developer Token</label><input type="password" className="input-field" value={googleDeveloperToken} onChange={e => setGoogleDeveloperToken(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem' }} /></div>
                      <div className="input-group" style={{ marginBottom: '16px' }}><label style={{ fontSize: '0.8rem' }}>Customer ID</label><input type="text" className="input-field" value={googleCustomerId} onChange={e => setGoogleCustomerId(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem' }} /></div>
                      <div style={{ display: 'flex', gap: '8px' }}><button onClick={() => handleSaveApiCredentials('google')} style={{ padding: '6px 16px', fontSize: '0.85rem', background: 'rgba(66, 133, 244, 0.2)', color: '#4285f4', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Google Keys</button><button onClick={() => setIsEditingGoogle(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button></div>
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '1rem', margin: 0, color: '#1877f2' }}>Meta Developer Setup</h4>
                    {!isEditingMeta && (
                      <button onClick={() => setIsEditingMeta(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: '#1877f2', cursor: 'pointer', fontSize: '0.8rem' }}><Edit2 size={12} /> Edit</button>
                    )}
                  </div>
                  {!isEditingMeta ? (
                    <div>
                      {renderListItem('App ID', maskString(user?.metaAppId))}
                      {renderListItem('App Secret', maskString(user?.metaAppSecret))}
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(24, 119, 242, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(24, 119, 242, 0.2)' }}>
                      <div className="input-group" style={{ marginBottom: '12px' }}><label style={{ fontSize: '0.8rem' }}>App ID</label><input type="text" className="input-field" value={metaAppId} onChange={e => setMetaAppId(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem' }} /></div>
                      <div className="input-group" style={{ marginBottom: '16px' }}><label style={{ fontSize: '0.8rem' }}>App Secret</label><input type="password" className="input-field" value={metaAppSecret} onChange={e => setMetaAppSecret(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem' }} /></div>
                      <div style={{ display: 'flex', gap: '8px' }}><button onClick={() => handleSaveApiCredentials('meta')} style={{ padding: '6px 16px', fontSize: '0.85rem', background: 'rgba(24, 119, 242, 0.2)', color: '#1877f2', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Meta Keys</button><button onClick={() => setIsEditingMeta(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button></div>
                    </div>
                  )}
                </div>

                {/* X */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '1rem', margin: 0, color: 'white' }}>X (Twitter) Developer Setup</h4>
                    {!isEditingX && (
                      <button onClick={() => setIsEditingX(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}><Edit2 size={12} /> Edit</button>
                    )}
                  </div>
                  {!isEditingX ? (
                    <div>
                      {renderListItem('Access Token', maskString(user?.twitterAccessToken))}
                      {renderListItem('Token Secret', maskString(user?.twitterRefreshToken))}
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <div className="input-group" style={{ marginBottom: '12px' }}><label style={{ fontSize: '0.8rem' }}>Access Token</label><input type="text" className="input-field" value={xAccessToken} onChange={e => setXAccessToken(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem' }} /></div>
                      <div className="input-group" style={{ marginBottom: '16px' }}><label style={{ fontSize: '0.8rem' }}>Token Secret</label><input type="password" className="input-field" value={xTokenSecret} onChange={e => setXTokenSecret(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem' }} /></div>
                      <div style={{ display: 'flex', gap: '8px' }}><button onClick={() => handleSaveApiCredentials('x')} style={{ padding: '6px 16px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save X Keys</button><button onClick={() => setIsEditingX(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button></div>
                    </div>
                  )}
                </div>

              </div>
            )}

          </GlassCard>
        </div>
      </div>
    </div>
  );
};
