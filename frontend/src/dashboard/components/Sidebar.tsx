import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  Sparkles,
  Images,
  BarChart3,
  Gem,
  Settings,
  ChevronRight,
  BrainCircuit,
  GitBranch,
  CreditCard,
  ShieldAlert,
  LayoutTemplate
} from 'lucide-react';
import { useSelector } from 'react-redux';

interface SubItem {
  path: string;
  label: string;
}

interface MenuItem {
  path?: string;
  label: string;
  icon: React.ElementType;
  permission: string;
  subItems?: SubItem[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    path: '/',
    label: 'Home',
    icon: LayoutDashboard,
    permission: 'dashboard',
  },
  {
    path: '/campaigns',
    label: 'New Campaign',
    icon: Megaphone,
    permission: 'ads',
  },
  {
    path: '/templates',
    label: 'AI Templates',
    icon: LayoutTemplate,
    permission: 'ads',
  },
  {
    label: 'AI Optimize',
    icon: BrainCircuit,
    permission: 'ads',
    subItems: [
      { path: '/ai/ads-manager', label: 'Ads Manager' },
      { path: '/ai/draft-recs', label: 'Draft & AI Recs' },
    ],
  },
  {
    path: '/content',
    label: 'Creative Hub',
    icon: Images,
    permission: 'content',
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    permission: 'analytics',
    subItems: [
      { path: '/analytics/insights', label: 'Ad Insights' },
      { path: '/analytics/ai-analysis', label: 'AI Analysis' },
    ],
  },
  {
    label: 'Brand Center',
    icon: Gem,
    permission: 'settings',
    subItems: [
      { path: '/brand/goal', label: 'Optimize Goal' },
      { path: '/brand/profile', label: 'Brand Profile' },
      { path: '/brand/products', label: 'Products' },
    ],
  },
  {
    label: 'More Tools',
    icon: GitBranch,
    permission: 'automation',
    subItems: [
      { path: '/workflows', label: 'Omni Flows' },
      { path: '/social', label: 'Social Hub' },
      { path: '/chatbot', label: 'AI Chatbot' },
      { path: '/crm', label: 'CRM & Audiences' },
      { path: '/messaging', label: 'Messaging' },
      { path: '/seo', label: 'SEO Tools' },
      { path: '/ai-agents', label: 'AI Agents' },
    ],
  },
  {
    path: '/billing',
    label: 'Billing',
    icon: CreditCard,
    permission: 'billing',
  },
  {
    path: '/roles',
    label: 'Roles & Access',
    icon: ShieldAlert,
    permission: 'settings',
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    permission: 'settings',
  },
];

export const Sidebar: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    // Auto-open parent menu if current path matches a child
    const initial: Record<string, boolean> = {};
    MENU_ITEMS.forEach((item) => {
      if (item.subItems) {
        const isChildActive = item.subItems.some((sub) =>
          location.pathname.startsWith(sub.path)
        );
        if (isChildActive) initial[item.label] = true;
      }
    });
    return initial;
  });

  const hasAccess = (module: string) => {
    if (!user) return false;
    if (user.permissions?.includes('*')) return true;
    return user.permissions?.includes(module);
  };

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isSubActive = (subItems: SubItem[]) =>
    subItems.some((sub) => location.pathname.startsWith(sub.path));

  return (
    <div
      style={{
        width: 'var(--sidebar-width)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: '#ffffff',
        borderRight: '1px solid var(--glass-border)',
        padding: '24px 12px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 8px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'var(--accent-gradient)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#fff',
          boxShadow: '0 8px 16px rgba(112,51,245,0.25)', flexShrink: 0,
        }}>
          <Sparkles size={18} />
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, letterSpacing: '-0.8px', color: '#141414', fontFamily: 'Outfit', whiteSpace: 'nowrap' }}>
          Wheedle.ai
        </h2>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        {MENU_ITEMS.map((item) => {
          if (!hasAccess(item.permission)) return null;
          const Icon = item.icon;

          // ---- Simple item (no sub-menu) ----
          if (!item.subItems) {
            return (
              <NavLink
                key={item.path}
                to={item.path!}
                end={item.path === '/'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  color: isActive ? '#fff' : '#555',
                  background: isActive ? 'var(--accent-gradient)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.18s ease',
                  boxShadow: isActive ? '0 6px 16px rgba(112,51,245,0.18)' : 'none',
                  textDecoration: 'none',
                  marginBottom: '2px',
                })}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </NavLink>
            );
          }

          // ---- Item with sub-menu ----
          const isOpen = openMenus[item.label];
          const isActive = isSubActive(item.subItems);

          return (
            <div key={item.label}>
              {/* Parent toggle button */}
              <button
                onClick={() => toggleMenu(item.label)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  color: isActive ? 'var(--accent-primary)' : '#555',
                  background: isActive && !isOpen ? 'rgba(112,51,245,0.07)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.18s ease',
                  marginBottom: '2px',
                  textAlign: 'left',
                }}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                <ChevronRight
                  size={14}
                  style={{
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    color: '#aaa',
                  }}
                />
              </button>

              {/* Sub-menu items */}
              <div
                style={{
                  overflow: 'hidden',
                  maxHeight: isOpen ? `${item.subItems.length * 44}px` : '0px',
                  transition: 'max-height 0.25s ease',
                }}
              >
                {item.subItems.map((sub) => (
                  <NavLink
                    key={sub.path}
                    to={sub.path}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 14px 9px 40px',
                      borderRadius: '10px',
                      color: isActive ? 'var(--accent-primary)' : '#777',
                      background: isActive ? 'rgba(112,51,245,0.08)' : 'transparent',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '0.825rem',
                      transition: 'all 0.15s ease',
                      textDecoration: 'none',
                      borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                      marginLeft: '12px',
                      marginBottom: '2px',
                    })}
                  >
                    <span>{sub.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom brand badge */}
      <div style={{
        marginTop: '16px',
        padding: '16px',
        background: 'rgba(112,51,245,0.04)',
        borderRadius: '16px',
        border: '1px solid rgba(112,51,245,0.1)',
        textAlign: 'center',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Optimized by
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Sparkles size={14} color="var(--accent-primary)" />
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#141414', fontFamily: 'Outfit' }}>Quantum AI</span>
        </div>
      </div>
    </div>
  );
};
