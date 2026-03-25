import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search as SearchIcon, Mic, LogOut, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Globe, PlusCircle, ChevronDown } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { setActiveWebsite, addWebsite } from '../store/slices/workspaceSlice';
import { markAllAsRead } from '../store/slices/notificationSlice';
import toast from 'react-hot-toast';

export const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const { websites, activeWebsiteId } = useSelector((state: any) => state.workspace);
  const { items, unreadCount } = useSelector((state: any) => state.notifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddWebsite, setShowAddWebsite] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeSite = websites.find((s: any) => s.id === activeWebsiteId);

  const handleAddWebsite = () => {
    if (!newSiteName || !newSiteUrl) {
      toast.error('Both Name and URL are required!');
      return;
    }
    dispatch(addWebsite({ name: newSiteName, url: newSiteUrl }));
    toast.success('Website added system-wide!');
    setShowAddWebsite(false);
    setNewSiteName('');
    setNewSiteUrl('');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      padding: '0 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#ffffff',
      borderBottom: '1px solid var(--glass-border)',
      position: 'sticky',
      top: 0,
      zIndex: 90,
      boxShadow: '0 4px 20px rgba(112, 51, 245, 0.03)'
    }}>
      <div style={{ position: 'relative', width: '400px' }}>
        <SearchIcon 
          size={18} 
          color="#94a3b8" 
          style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} 
        />
        <input 
          type="text" 
          className="input-field"
          placeholder="Search campaigns, settings, analytics..." 
          style={{
            paddingLeft: '48px',
            background: 'rgba(112, 51, 245, 0.03)',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.9rem',
            border: '1px solid transparent'
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        
        {/* Workspace / Website Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(112, 51, 245, 0.04)', border: '1px solid rgba(112, 51, 245, 0.1)', padding: '6px 16px', borderRadius: 'var(--radius-pill)' }}>
          <Globe size={16} color="var(--accent-primary)" />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select 
              value={activeWebsiteId || ''} 
              onChange={(e) => dispatch(setActiveWebsite(e.target.value))}
              style={{ 
                background: 'transparent', border: 'none', color: '#141414', 
                outline: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, WebkitAppearance: 'none',
                minWidth: '150px', paddingRight: '20px'
              }}
            >
              {websites.map((site: any) => (
                <option key={site.id} value={site.id} style={{ background: '#fff' }}>
                  {site.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 0, pointerEvents: 'none' }} />
          </div>
          <div style={{ width: '1px', height: '16px', background: 'rgba(112, 51, 245, 0.2)', margin: '0 8px' }} />
          <button style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowAddWebsite(true)} title="Add New Domain">
            <PlusCircle size={16} />
          </button>
        </div>

        <button 
          className="btn-secondary" 
          style={{ 
            borderRadius: 'var(--radius-pill)', padding: '10px 16px', 
            display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem',
            background: 'var(--accent-gradient)', color: '#fff', border: 'none',
            boxShadow: '0 8px 16px rgba(112, 51, 245, 0.15)'
          }}
        >
          <Sparkles size={16} />
          <span style={{ fontWeight: 600 }}>Ask AI</span>
        </button>
        
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div onClick={() => { setShowNotifications(!showNotifications); if(unreadCount > 0) dispatch(markAllAsRead()); }} style={{ cursor: 'pointer', padding: '8px', borderRadius: '50%', background: 'rgba(112, 51, 245, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={20} color="var(--accent-primary)" />
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute', top: '0', right: '0',
                  minWidth: '16px', height: '16px', background: 'var(--error)',
                  borderRadius: '10px', border: '2px solid #fff',
                  color: 'white', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                }}>
                  {unreadCount}
                </div>
              )}
            </div>

            {showNotifications && (
              <div className="glass-panel animate-fade-in" style={{
                position: 'absolute', top: '50px', right: '-10px', width: '360px', padding: '24px', zIndex: 200, display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff', border: '1px solid var(--glass-border)', boxShadow: '0 20px 60px rgba(112, 51, 245, 0.12)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(112, 51, 245, 0.1)', paddingBottom: '16px' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'Outfit' }}>Notifications</span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => dispatch(markAllAsRead())}>Mark all read</span>
                    <X size={18} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setShowNotifications(false)} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                  {items.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0', fontSize: '0.95rem' }}>No new updates</div>
                  ) : (
                    items.map((notif: any) => (
                      <div key={notif.id} style={{ display: 'flex', gap: '16px', padding: '16px', background: 'rgba(112, 51, 245, 0.03)', borderRadius: '16px', opacity: notif.read ? 0.6 : 1, border: '1px solid transparent', transition: '0.2s' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                          {notif.type === 'success' ? <CheckCircle2 size={16} color="var(--success)" /> : <AlertCircle size={16} color="var(--info)" />}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{notif.title}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{notif.message}</span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{new Date(notif.time).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '24px', borderLeft: '1px solid rgba(112, 51, 245, 0.1)' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#141414', fontFamily: 'Outfit' }}>{user?.name || 'Administrator'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.subscriptionTier || 'Pro Tier'}</div>
            </div>
            <div style={{
              width: '44px', height: '44px', borderRadius: 'var(--radius-pill)', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: '#fff',
              boxShadow: '0 8px 16px rgba(112, 51, 245, 0.2)'
            }}>
              {user?.name?.charAt(0) || 'A'}
            </div>

            <button 
              onClick={handleLogout}
              style={{ marginLeft: '12px', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.05)', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', border: '1px solid rgba(239, 68, 68, 0.1)' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
              title="Log Out"
            >
              <LogOut size={16} /> 
            </button>
          </div>
        </div>
      </div>

      {showAddWebsite && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(20, 10, 40, 0.4)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '450px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Outfit' }}>Sync <span className="text-gradient">Website</span></h2>
              <button style={{ padding: '8px', borderRadius: '50%', background: 'rgba(0,0,0,0.03)' }} onClick={() => setShowAddWebsite(false)}>
                <X size={20} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
            
            <div className="input-group">
              <label>Project Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Acme Global Store" 
                value={newSiteName}
                onChange={e => setNewSiteName(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="input-group">
              <label>Project URL</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="https://acme-store.com" 
                value={newSiteUrl}
                onChange={e => setNewSiteUrl(e.target.value)}
              />
            </div>

            <button className="btn btn-primary" onClick={handleAddWebsite} style={{ marginTop: '12px', height: '56px' }}>
               Start AI Inception
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
