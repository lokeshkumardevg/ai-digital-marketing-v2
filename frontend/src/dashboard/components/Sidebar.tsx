import React, { useState, useRef, useEffect } from 'react';
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
  Star,
  Sparkles,
  ThumbsUp,
  BarChart2,
  Users,
  TrendingUp,
  Lightbulb,
  ChevronsDown,
} from 'lucide-react';
import { useSelector } from 'react-redux';

interface SubItem {
  path: string;
  label: string;
  badge?: 'new' | 'beta' | 'hot';
  notifBadge?: number;
  icon?: React.ElementType;
}

interface MenuItem {
  path?: string;
  label: string;
  icon: React.ElementType;
  permission: string;
  subItems?: SubItem[];
  badge?: number | null;
  highlight?: boolean;
}

const BASE_MENU_ITEMS: MenuItem[] = [
  { path: '/crm', label: 'Home', icon: LayoutDashboard, permission: 'dashboard' },
  { path: '/campaigns', label: 'New Campaign', icon: Megaphone, permission: 'ads', highlight: true },
  { path: '/presentation', label: 'Client Presentation', icon: PresentationIcon, permission: 'dashboard' },
  {
    label: 'AI Optimize',
    icon: BrainCircuit,
    permission: 'ads',
    subItems: [
      { path: '/ai/ads-manager', label: 'Ads Manager', badge: 'hot' },
      { path: '/ai/draft-recs', label: 'Draft & AI Recs', badge: 'beta' },
    ],
  },
  { path: '/content', label: 'Creative Hub', icon: Images, permission: 'content' },
  {
    label: 'Analytics',
    icon: BarChart3,
    permission: 'analytics',
    subItems: [
      { path: '/analytics/insights', label: 'Ad Insights' },
      { path: '/analytics/ai-analysis', label: 'AI Analysis', badge: 'new' },
    ],
  },
  {
    label: 'Brand Center',
    icon: Gem,
    permission: 'settings',
    subItems: [
      { path: '/brand/goal', label: 'Optimize Goal' },
      { path: '/brand/profile', label: 'Brand Profile' },
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
  label: 'ReputationIQ',
  icon: ThumbsUp,
  permission: 'automation',
  subItems: [
    { path: '/reputation/dashboard', label: 'Dashboard', icon: BarChart2 },
    { path: '/reputation/inbox', label: 'Profile reviews', icon: Star },
    { path: '/reputation/posts', label: 'Post & ad reviews', icon: Megaphone },
    { path: '/reputation/customers', label: 'Customers', icon: Users },
    { path: '/reputation/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/reputation/recommendations', label: 'Recommendations', icon: Lightbulb, notifBadge: 3 },
  ],
},
  {
    label: 'More Tools',
    icon: GitBranch,
    permission: 'automation',
    subItems: [
      { path: '/social', label: 'Social Hub' },
      { path: '/chatbot', label: 'AI Chatbot', badge: 'beta' },
      { path: '/messaging', label: 'Messaging' },
      { path: '/ai-agents', label: 'AI Agents', badge: 'new' },
      { path: '/calling-agent', label: 'Voice Calling', badge: 'beta' },
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

  // FIX: Single open menu at a time — find initially active submenu
  const getInitialOpenMenu = (): string | null => {
    for (const item of MENU_ITEMS) {
      if (item.subItems && item.subItems.length > 0) {
        const isChildActive = item.subItems.some((sub) =>
          location.pathname.startsWith(sub.path)
        );
        if (isChildActive) return item.label;
      }
    }
    return null;
  };

  const [openMenu, setOpenMenu] = useState<string | null>(getInitialOpenMenu);
  const [scrolled, setScrolled] = useState(false);
  const [canScrollMore, setCanScrollMore] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    const handleScroll = () => {
      setScrolled(el.scrollTop > 10);
      setCanScrollMore(el.scrollTop + el.clientHeight < el.scrollHeight - 10);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const hasAccess = (module: string) => {
    if (!user) return false;
    if (user.permissions?.includes('*') || user.role === 'superadmin') return true;
    if (module === 'dashboard') return true;
    if (module === 'view_users' && user.permissions?.includes('manage_users')) return true;
    return user.permissions?.includes(module);
  };

  // FIX: Toggle — if same menu clicked, close it; otherwise open new one (closes previous)
  const toggleMenu = (label: string) => {
    setOpenMenu((prev) => (prev === label ? null : label));
  };

  const isSubActive = (subItems: SubItem[]) =>
    subItems.some((sub) => location.pathname.startsWith(sub.path));

  const getBadgeStyle = (badge?: 'new' | 'beta' | 'hot') => {
    const styles = {
      new: { background: '#10b981', color: '#fff', boxShadow: '0 2px 4px rgba(16,185,129,0.3)' },
      beta: { background: '#8b5cf6', color: '#fff', boxShadow: '0 2px 4px rgba(139,92,246,0.3)' },
      hot: { background: '#f59e0b', color: '#000', boxShadow: '0 2px 4px rgba(245,158,11,0.3)' },
    };
    return badge ? styles[badge] : {};
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.3); }
        }
 
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
 
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
 
        @keyframes sparkle {
          0%, 100% { opacity: 0.8; transform: scale(1) rotate(0deg); }
          25%       { opacity: 1;   transform: scale(1.2) rotate(15deg); }
          50%       { opacity: 0.5; transform: scale(0.9) rotate(-10deg); }
          75%       { opacity: 1;   transform: scale(1.1) rotate(5deg); }
        }
 
        .sidebar-nav-link,
        .sidebar-parent-btn,
        .sidebar-sub-link {
          transform-origin: left center;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                      background 0.18s ease,
                      color 0.18s ease,
                      box-shadow 0.18s ease !important;
        }
 
        .sidebar-nav-link:hover {
          color: #fff !important;
          transform: scale(1.04) translateX(3px) !important;
        }
 
        .sidebar-parent-btn:hover {
          color: #e5e5e5 !important;
          transform: scale(1.04) translateX(3px) !important;
        }
 
        .sidebar-sub-link:hover {
          transform: scale(1.04) translateX(3px) !important;
        }
 
        /* FIX: Smooth submenu transition */
        .submenu-wrapper {
          overflow: hidden;
          transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.25s ease;
        }
 
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50%       { transform: translateY(4px); opacity: 1; }
        }
 
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
 
        .scroll-indicator {
          animation: fadeSlideIn 0.3s ease both;
        }
 
        .scroll-chevron {
          animation: scrollBounce 1.4s ease-in-out infinite;
        }

          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          border-radius: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
        }
      `}</style>

      <div
        ref={sidebarRef}
        className="sidebar-scroll"
        style={{
          width: 'var(--sidebar-width)',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          background: '#0a0f1e',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          overflowY: 'auto',
          overflowX: 'hidden',
          color: '#e5e5e5',
        }}
      >
        {/* FIX: Logo — sticky, correct positioning, no padding duplication */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            background: '#0a0f1e',
            padding: '18px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            zIndex: 10,
            flexShrink: 0,
            transition: 'box-shadow 0.2s ease',
            ...(scrolled ? { boxShadow: '0 1px 14px #228bee36' } : {}),
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <img
              src={logo}
              alt="logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                margin: 0,
                letterSpacing: '-0.8px',
                background: 'linear-gradient(135deg, #fff 0%, #fafafa 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontFamily: 'Outfit, sans-serif',
                whiteSpace: 'nowrap',
                animation: 'fadeInRight 0.5s ease both',
              }}
            >
              heedleTechnologies.Ai
            </h2>
            <Sparkles
              size={13}
              style={{
                color: '#22c2ee86',
                opacity: 0.8,
                animation: 'sparkle 2s infinite',
                flexShrink: 0,
              }}
            />
          </div>
        </div>

        {/* Scroll indicator — gradient fade + bouncing chevron shown when content is below */}
        <div
          style={{
            position: 'sticky',
            top: '73px', // just below the logo header height
            zIndex: 9,
            pointerEvents: 'none',
            height: canScrollMore ? '48px' : '0px',
            overflow: 'hidden',
            transition: 'height 0.3s ease, opacity 0.3s ease',
            opacity: canScrollMore ? 1 : 0,
          }}
        >
          {/* Gradient fade */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '48px',
              background: 'linear-gradient(to bottom, #0a0f1e 0%, rgba(10,15,30,0.7) 50%, transparent 100%)',
            }}
          />
          {/* Bouncing chevron */}
          <div
            className="scroll-chevron"
            style={{
              position: 'absolute',
              bottom: '4px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'rgba(112,51,245,0.15)',
              border: '1px solid rgba(112,51,245,0.25)',
            }}
          >
            <ChevronsDown size={12} color="rgba(33, 170, 255, 0.7)" />
          </div>
        </div>

        {/* Navigation */}
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            flex: 1,
            padding: '12px',
          }}
        >
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isAllowed = hasAccess(item.permission);

            // Leaf nav item (no subItems)
            if (!item.subItems) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path!}
                  end={item.path === '/crm'}
                  className="sidebar-nav-link"
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 14px',
                    borderRadius: '12px',
                    color: isActive ? '#fff' : isAllowed ? '#a1a1aa' : 'rgba(161,161,170,0.45)',
                    background: isActive ? 'var(--accent-gradient)' : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem',
                    transition: 'background 0.18s ease, color 0.18s ease',
                    boxShadow: isActive ? '0 6px 16px rgba(112,51,245,0.18)' : 'none',
                    textDecoration: 'none',
                    marginBottom: '1px',
                    opacity: isAllowed ? 1 : 0.55,
                    position: 'relative',
                  })}
                >
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <Icon size={17} />
                    {item.highlight && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-3px',
                          right: '-4px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#f59e0b',
                          boxShadow: '0 0 6px rgba(245,158,11,0.6)',
                          animation: 'pulse 2s infinite',
                        }}
                      />
                    )}
                  </div>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span
                      style={{
                        background: 'var(--error)',
                        color: '#fff',
                        borderRadius: 999,
                        padding: '1px 7px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        lineHeight: 1.3,
                        boxShadow: '0 2px 4px rgba(239,68,68,0.3)',
                        flexShrink: 0,
                      }}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </NavLink>
              );
            }

            // FIX: Use single openMenu state
            const isOpen = openMenu === item.label;
            const isActive = item.subItems.length > 0 && isSubActive(item.subItems);

            return (
              <div key={item.label}>
                <button
                  onClick={() => item.subItems!.length > 0 && toggleMenu(item.label)}
                  className="sidebar-parent-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '9px 14px',
                    borderRadius: '12px',
                    color: isActive ? 'var(--accent-primary)' : isAllowed ? '#a1a1aa' : 'rgba(161,161,170,0.55)',
                    background: isActive && !isOpen ? 'rgba(112,51,245,0.07)' : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem',
                    cursor: item.subItems!.length > 0 ? 'pointer' : 'default',
                    border: 'none',
                    transition: 'background 0.18s ease, color 0.18s ease',
                    marginBottom: '1px',
                    textAlign: 'left',
                    opacity: isAllowed ? 1 : 0.55,
                    position: 'relative',
                  }}
                >
                  <Icon size={17} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.subItems.length > 0 && (
                    <ChevronRight
                      size={14}
                      style={{
                        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        color: isActive ? 'var(--accent-primary)' : '#6b7280',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {/* Active indicator strip when collapsed */}
                  {isActive && !isOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '-2px',
                        width: '3px',
                        height: '20px',
                        background: 'var(--accent-primary)',
                        borderRadius: '2px',
                        opacity: 0.6,
                      }}
                    />
                  )}
                </button>

                {/* FIX: Smooth open/close with proper max-height calculation */}
                <div
                  className="submenu-wrapper"
                  style={{
                    maxHeight: isOpen ? `${item.subItems.length * 44}px` : '0px',
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  {item.subItems.map((sub, idx) => {
                    const SubIcon = sub.icon;
                    return (
                      <NavLink
                        key={sub.path}
                        to={sub.path}
                        className="sidebar-sub-link"
                        style={({ isActive: subActive }) => ({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 14px 9px 16px',
                          borderRadius: '10px',
                          color: subActive ? 'var(--accent-primary)' : '#9ca3af',
                          background: subActive
                            ? `
                              linear-gradient(to bottom, #0665ff 50%, #22d3ee 100%) left / 4px 100% no-repeat,
                              rgba(112,51,245,0.08)
                            `
                            : 'transparent',
                          fontWeight: subActive ? 600 : 400,
                          fontSize: '0.85rem',
                          transition: 'background 0.15s ease, color 0.15s ease',
                          textDecoration: 'none',
                          marginLeft: '12px',
                          marginBottom: '1px',
                          animation: isOpen ? `slideIn 0.22s ease ${idx * 0.04}s both` : 'none',
                        })}
                      >
                        {SubIcon && (
                          <SubIcon size={15} style={{ flexShrink: 0, opacity: 0.75 }} />
                        )}
                        {!SubIcon && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', opacity: 0.4, flexShrink: 0 }} />}
                        <span style={{ flex: 1 }}>{sub.label}</span>
                        {sub.notifBadge != null && (
                          <span
                            style={{
                              background: '#3b82f6',
                              color: '#fff',
                              borderRadius: '999px',
                              padding: '1px 7px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              lineHeight: 1.4,
                              flexShrink: 0,
                              boxShadow: '0 2px 6px rgba(59,130,246,0.4)',
                            }}
                          >
                            {sub.notifBadge}
                          </span>
                        )}
                        {sub.badge && (
                          <span
                            style={{
                              padding: '1px 6px',
                              borderRadius: '8px',
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              flexShrink: 0,
                              ...getBadgeStyle(sub.badge),
                            }}
                          >
                            {sub.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom branding */}
        {/* <div
          style={{
            margin: '12px',
            marginTop: '16px',
            padding: '14px 16px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: '0.62rem',
              color: '#71717a',
              marginBottom: '8px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Powered by
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <img
                src={logo}
                alt="logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <span
              style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                color: '#f5f5f5',
                fontFamily: 'Outfit, sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              Wheedle Technologies
            </span>
          </div>
        </div> */}
      </div>
    </>
  );
};