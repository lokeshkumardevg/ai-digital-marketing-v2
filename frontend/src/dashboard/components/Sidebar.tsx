import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../../assets/fevicon.png';
import {
  LayoutDashboard,
  Megaphone,
  Images,
  BarChart3,
  Gem,
  Settings,
  ChevronRight,
  BrainCircuit,
  GitBranch,
  CreditCard,
  ShieldAlert,
  Search,
  Bell,
  Presentation as PresentationIcon,
  UserPlus,
  Briefcase,
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
  badge?: number | null;
}

const BASE_MENU_ITEMS: MenuItem[] = [
  { path: '/crm', label: 'Home', icon: LayoutDashboard, permission: 'dashboard' },
  { path: '/campaigns', label: 'New Campaign', icon: Megaphone, permission: 'ads' },
  { path: '/presentation', label: 'Client Presentation', icon: PresentationIcon, permission: 'dashboard' },
  // { path: '/templates', label: 'AI Templates', icon: LayoutTemplate, permission: 'ads' },
  {
    label: 'AI Optimize',
    icon: BrainCircuit,
    permission: 'ads',
    subItems: [
      { path: '/ai/ads-manager', label: 'Ads Manager' },
      { path: '/ai/draft-recs', label: 'Draft & AI Recs' },
    ],
  },
  { path: '/content', label: 'Creative Hub', icon: Images, permission: 'content' },
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
      // { path: '/brand/products', label: 'Products' },
    ],
  },
  {
    label: 'SEO Intelligence',
    icon: Search,
    permission: 'automation',
    subItems: [
      { path: '/seo', label: 'Dashboard' },
      { path: '/seo/audit', label: 'Site Audit' },
      { path: '/seo/tracking', label: 'Position Tracking' },
      { path: '/seo/keywords', label: 'Organic Research' },
      { path: '/seo/backlinks', label: 'Backlink Audit' },
      { path: '/seo/link-building', label: 'Link Building' },
    ],
  },
  {
    label: 'More Tools',
    icon: GitBranch,
    permission: 'automation',
    subItems: [
      { path: '/social', label: 'Social Hub' },
      { path: '/chatbot', label: 'AI Chatbot' },
      // { path: '/crm', label: 'CRM & Audiences' },
      { path: '/messaging', label: 'Messaging' },
      { path: '/ai-agents', label: 'AI Agents' },
    ],
  },
  { path: '/billing', label: 'Billing', icon: CreditCard, permission: 'billing' },
  { path: '/linkedin-crm', label: 'LinkedIn CRM', icon: Briefcase, permission: 'dashboard' },
  { path: '/users', label: 'Users', icon: UserPlus, permission: 'view_users' },
  { path: '/roles', label: 'Roles & Access', icon: ShieldAlert, permission: 'superadmin' },
  { path: '/settings', label: 'Settings', icon: Settings, permission: 'settings' },
];

export const Sidebar: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);
  const { unreadCount } = useSelector((state: any) => state.notifications);
  const location = useLocation();

  const settingsIndex = BASE_MENU_ITEMS.findIndex((i) => i.path === '/settings');

  const MENU_ITEMS: MenuItem[] = [
  ...BASE_MENU_ITEMS.slice(0, settingsIndex),
  {
    icon: Bell,
    label: 'Notifications',
    path: '/notifications',
    permission: 'dashboard',
    badge: unreadCount > 0 ? unreadCount : null,
  },
  ...BASE_MENU_ITEMS.slice(settingsIndex),
];

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
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
    if (user.permissions?.includes('*') || user.role === 'superadmin') return true;
    if (module === 'dashboard') return true;
    if (module === 'view_users' && user.permissions?.includes('manage_users')) return true;
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
        background: '#0a0f1e',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 12px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflowY: 'auto',
        color: '#e5e5e5',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 8px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '3px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          // background: 'var(--accent-gradient)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#fff',
          // boxShadow: '0 8px 16px rgba(112,51,245,0.25)', flexShrink: 0,
        }}>
          <div style={{
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  flexShrink: 0,
}}>
  {<img
    src={logo}
    alt="logo"
    style={{
      width: '100%',
      height: '120%',
      objectFit: 'contain',
    }}
  /> }
</div>
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, letterSpacing: '-0.8px', color: '#f5f5f5', fontFamily: 'Outfit', whiteSpace: 'nowrap' }}>
          heedle.Ai
        </h2>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isAllowed = hasAccess(item.permission);

          if (!item.subItems) {
            return (
              <NavLink
                key={item.path}
                to={item.path!}
                end={item.path === '/crm'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  color: isActive ? '#fff' : isAllowed ? '#a1a1aa' : 'rgba(161,161,170,0.45)',
                  background: isActive ? 'var(--accent-gradient)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.18s ease',
                  boxShadow: isActive ? '0 6px 16px rgba(112,51,245,0.18)' : 'none',
                  textDecoration: 'none',
                  marginBottom: '2px',
                  opacity: isAllowed ? 1 : 0.55,
                })}
              >
                <Icon size={17} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    background: 'var(--error)',
                    color: '#fff',
                    borderRadius: 999,
                    padding: '1px 7px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    lineHeight: 1.3,
                  }}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </NavLink>
            );
          }

          const isOpen = openMenus[item.label];
          const isActive = isSubActive(item.subItems);

          return (
            <div key={item.label}>
              <button
                onClick={() => toggleMenu(item.label)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  color: isActive ? 'var(--accent-primary)' : isAllowed ? '#a1a1aa' : 'rgba(161,161,170,0.55)',
                  background: isActive && !isOpen ? 'rgba(112,51,245,0.07)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.18s ease',
                  marginBottom: '2px',
                  textAlign: 'left',
                  opacity: isAllowed ? 1 : 0.55,
                }}
              >
                <Icon size={17} />
                <span style={{ flex: 1 }}>{item.label}</span>
                <ChevronRight
                  size={14}
                  style={{
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    color: '#6b7280',
                  }}
                />
              </button>

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
                      color: isActive ? 'var(--accent-primary)' : '#9ca3af',
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

      {/* Bottom */}
      <div style={{
        marginTop: '16px',
        padding: '16px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '0.65rem', color: '#a1a1aa', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Powered by
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
          <img
  src={logo}
  alt="logo"
  style={{
    width: '20%',
    height: '20%',
    objectFit: 'contain',
  }}
/>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f5f5f5', fontFamily: 'Outfit' }}>
            heedle Technologies
          </span>
        </div>
      </div>
    </div>
  );
};