import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  Search, 
  Share2, 
  MessageSquare, 
  BarChart3, 
  CreditCard,
  Settings,
  ShieldAlert,
  Target,
  FileText,
  GitBranch,
  MessageCircle,
  Megaphone,
  Sparkles
} from 'lucide-react';
import { useSelector } from 'react-redux';

const MENU_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard, permission: 'dashboard' },
  { path: '/crm', icon: Target, label: 'CRM & Audiences', permission: 'crm' },
  { path: '/campaigns', label: 'AI Ad Hub', icon: Megaphone, permission: 'ads' },
  { path: '/workflows', icon: GitBranch, label: 'Omni Flows', permission: 'automation' },
  { path: '/social', icon: Share2, label: 'Social Hub', permission: 'social' },
  { path: '/content', label: 'Creative Gen', icon: FileText, permission: 'content' },
  { path: '/chatbot', label: 'AI Chatbot', icon: MessageSquare, permission: 'chatbot' },
  { path: '/analytics', icon: BarChart3, label: 'ROI Analysis', permission: 'analytics' },
  { path: '/billing', icon: CreditCard, label: 'Billing', permission: 'billing' },
  { path: '/settings', icon: Settings, label: 'Settings', permission: 'settings' }
];

export const Sidebar: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);

  const hasAccess = (module: string) => {
    if (!user) return false; 
    if (user.permissions?.includes('*')) return true;
    return user.permissions?.includes(module);
  };

  return (
    <div style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: '#ffffff',
      borderRight: '1px solid var(--glass-border)',
      padding: '32px 20px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
    }}>
      <div style={{ padding: '0 8px', marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          width: '36px', height: '36px', borderRadius: '10px', 
          background: 'var(--accent-gradient)', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', color: '#fff',
          boxShadow: '0 8px 16px rgba(112, 51, 245, 0.2)'
        }}>
          <Sparkles size={20} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '-0.8px', color: '#141414', fontFamily: 'Outfit' }}>
          Wheedle.ai
        </h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        <h4 style={{ 
          fontSize: '0.65rem', 
          textTransform: 'uppercase', 
          color: 'var(--text-secondary)',
          margin: '0 12px 16px',
          letterSpacing: '0.1em',
          fontWeight: 700
        }}>Platform Core</h4>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {MENU_ITEMS.map((item) => {
            if (!hasAccess(item.permission)) return null;
            
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-pill)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-gradient)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                  transition: 'all var(--transition-fast)',
                  boxShadow: isActive ? '0 8px 20px rgba(112, 51, 245, 0.15)' : 'none'
                })}
              >
                <Icon size={18} style={{ color: 'inherit' }} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div style={{ 
        marginTop: 'auto', 
        padding: '24px', 
        background: 'rgba(112, 51, 245, 0.04)', 
        borderRadius: '24px',
        border: '1px solid rgba(112, 51, 245, 0.1)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600 }}>OPTIMIZED BY</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#141414', fontFamily: 'Outfit' }}>Quantum AI</h2>
        </div>
      </div>
    </div>
  );
};

