import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCircle, AlertCircle, Info, AlertTriangle,
  Trash2, CheckCheck, Filter, RefreshCw, ExternalLink,
  Megaphone, Share2, Bot, CreditCard, Settings, MessageCircle,
  BarChart2, Layers, X,
} from 'lucide-react';
import {
  fetchNotifications, markAllReadAsync, markOneReadAsync,
  deleteOneAsync, clearReadAsync,
} from '../../store/slices/notificationSlice';
import type { AppNotification } from '../../store/slices/notificationSlice';
import type { AppDispatch } from '../../store';
import toast from 'react-hot-toast';

const D = {
  bg: '#080d1a',
  surface: '#0f1629',
  surfaceAlt: '#141d35',
  border: 'rgba(99,102,241,0.18)',
  borderGlow: 'rgba(124,58,237,0.35)',
  purple: '#2631d6',
  purpleSoft: 'rgba(124,58,237,0.12)',
  purpleText: '#a78bfa',
  green: '#10b981',
  greenSoft: 'rgba(16,185,129,0.12)',
  red: '#ef4444',
  redSoft: 'rgba(239,68,68,0.12)',
  yellow: '#f59e0b',
  yellowSoft: 'rgba(245,158,11,0.12)',
  blue: '#3b82f6',
  blueSoft: 'rgba(59,130,246,0.12)',
  textPrimary: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#475569',
  inputBg: 'rgba(255,255,255,0.04)',
  white004: 'rgba(255,255,255,0.04)',
  white008: 'rgba(255,255,255,0.08)',
};

const TYPE_CONFIG: Record<string, { color: string; bg: string; Icon: any }> = {
  success: { color: D.green, bg: D.greenSoft, Icon: CheckCircle },
  error: { color: D.red, bg: D.redSoft, Icon: AlertCircle },
  warning: { color: D.yellow, bg: D.yellowSoft, Icon: AlertTriangle },
  info: { color: D.purple, bg: D.purpleSoft, Icon: Info },
};

const CATEGORY_CONFIG: Record<string, { label: string; color: string; Icon: any }> = {
  all: { label: 'All', color: D.textMuted, Icon: Layers },
  campaign: { label: 'Campaigns', color: '#a78bfa', Icon: Megaphone },
  social: { label: 'Social', color: '#1da1f2', Icon: Share2 },
  ai: { label: 'AI Agents', color: D.green, Icon: Bot },
  billing: { label: 'Billing', color: D.yellow, Icon: CreditCard },
  system: { label: 'System', color: '#6366f1', Icon: Settings },
  messaging: { label: 'Messaging', color: '#059669', Icon: MessageCircle },
  analytics: { label: 'Analytics', color: '#e1306c', Icon: BarChart2 },
  general: { label: 'General', color: D.textMuted, Icon: Bell },
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const NotifCard: React.FC<{
  notif: AppNotification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction: (url: string) => void;
}> = ({ notif, onRead, onDelete, onAction }) => {
  const tc = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
  const cc = CATEGORY_CONFIG[notif.category || 'general'] || CATEGORY_CONFIG.general;
  const TypeIcon = tc.Icon;
  const CatIcon = cc.Icon;

  return (
    <div
      style={{
        display: 'flex', gap: 14, padding: '16px 20px',
        background: notif.read ? D.white004 : 'rgba(124,58,237,0.06)',
        border: `1px solid ${notif.read ? D.border : D.borderGlow}`,
        borderRadius: 14, transition: 'all 0.2s', cursor: 'pointer',
        opacity: notif.read ? 0.75 : 1,
        position: 'relative',
      }}
      onClick={() => { if (!notif.read) onRead(notif.id); if (notif.actionUrl) onAction(notif.actionUrl); }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = D.borderGlow; e.currentTarget.style.background = 'rgba(124,58,237,0.09)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = notif.read ? D.border : D.borderGlow; e.currentTarget.style.background = notif.read ? D.white004 : 'rgba(124,58,237,0.06)'; }}
    >
      {!notif.read && (
        <div style={{ position: 'absolute', top: 16, left: -4, width: 8, height: 8, borderRadius: '50%', background: tc.color, boxShadow: `0 0 8px ${tc.color}` }} />
      )}

      <div style={{ width: 40, height: 40, borderRadius: 10, background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        <TypeIcon size={18} color={tc.color} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: D.textPrimary, lineHeight: 1.3 }}>{notif.title}</span>
          <span style={{ fontSize: '0.7rem', color: D.textDim, whiteSpace: 'nowrap', flexShrink: 0 }}>{formatTime(notif.time)}</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: D.textMuted, lineHeight: 1.6, margin: 0, marginBottom: 8 }}>{notif.message}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${cc.color}18`, color: cc.color, padding: '2px 8px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 700 }}>
            <CatIcon size={10} /> {cc.label}
          </div>
          <div style={{ background: tc.bg, color: tc.color, padding: '2px 8px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 700, textTransform: 'capitalize' }}>
            {notif.type}
          </div>
          {notif.actionLabel && notif.actionUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: D.purpleText, fontSize: '0.72rem', fontWeight: 600 }}
              onClick={(e) => { e.stopPropagation(); onAction(notif.actionUrl!); }}
            >
              <ExternalLink size={11} /> {notif.actionLabel}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: D.textDim, padding: '4px', flexShrink: 0, borderRadius: 6, transition: '0.15s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = D.redSoft; e.currentTarget.style.color = D.red; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = D.textDim; }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export const Notifications: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, unreadCount, total, loading } = useSelector((state: any) => state.notifications);

  const [activeCategory, setActiveCategory] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(() => {
    dispatch(fetchNotifications({ category: activeCategory, unreadOnly: showUnreadOnly, limit: 100 }));
  }, [dispatch, activeCategory, showUnreadOnly]);

  useEffect(() => { load(); }, [load]);

  const handleRead = (id: string) => dispatch(markOneReadAsync(id));
  const handleDelete = (id: string) => { dispatch(deleteOneAsync(id)); toast.success('Notification removed'); };
  const handleAction = (url: string) => navigate(url);

  const handleMarkAllRead = async () => {
    await dispatch(markAllReadAsync());
    toast.success('All notifications marked as read');
  };

  const handleClearRead = async () => {
    await dispatch(clearReadAsync());
    toast.success('Read notifications cleared');
  };

  const filtered = items.filter((n: AppNotification) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
  });

  const groupByDate = (list: AppNotification[]) => {
    const groups: Record<string, AppNotification[]> = {};
    list.forEach((n) => {
      const d = new Date(n.time);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const key = diff < 86400000 ? 'Today'
        : diff < 172800000 ? 'Yesterday'
          : diff < 604800000 ? 'This Week'
            : 'Older';
      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });
    return groups;
  };

  const grouped = groupByDate(filtered);
  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Older'];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 48, background: D.bg }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 3px; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 6, color: D.textPrimary }}>
            Notification <span style={{ background: 'linear-gradient(135deg,#a78bfa,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Center</span>
          </h1>
          <p style={{ color: D.textMuted, fontSize: '0.9rem' }}>
            Real-time alerts from campaigns, AI agents, billing, social and more.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'Unread', value: unreadCount, color: D.purple, bg: D.purpleSoft },
              { label: 'Total', value: total, color: D.textMuted, bg: D.white004 },
            ].map((s) => (
              <div key={s.label} style={{ background: s.bg, border: `1px solid ${D.border}`, borderRadius: 10, padding: '8px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.68rem', color: D.textDim, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px solid ${D.border}`, background: D.white004, color: D.textMuted, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(124,58,237,0.3)', background: D.purpleSoft, color: D.purpleText, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
          <button onClick={handleClearRead} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px solid ${D.redSoft}`, background: D.redSoft, color: D.red, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
            <Trash2 size={13} /> Clear read
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: D.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 8px', marginBottom: 6 }}>Categories</div>
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.Icon;
            const isActive = activeCategory === key;
            const count = key === 'all' ? items.length : items.filter((n: AppNotification) => n.category === key).length;
            return (
              <button key={key} onClick={() => setActiveCategory(key)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: isActive ? D.purpleSoft : 'transparent',
                color: isActive ? D.purpleText : D.textMuted,
                fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, transition: 'all 0.15s', width: '100%',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={15} color={isActive ? cfg.color : D.textDim} />
                  {cfg.label}
                </div>
                {count > 0 && (
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, background: isActive ? 'rgba(124,58,237,0.2)' : D.white008, color: isActive ? D.purpleText : D.textDim, padding: '1px 7px', borderRadius: 99 }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${D.border}` }}>
            <button
              onClick={() => setShowUnreadOnly((v) => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', width: '100%',
                background: showUnreadOnly ? D.yellowSoft : 'transparent',
                color: showUnreadOnly ? D.yellow : D.textMuted,
                fontSize: '0.82rem', fontWeight: showUnreadOnly ? 700 : 500, transition: '0.15s',
              }}
            >
              <Bell size={15} color={showUnreadOnly ? D.yellow : D.textDim} />
              Unread only
              <div style={{ marginLeft: 'auto', width: 28, height: 16, borderRadius: 99, background: showUnreadOnly ? D.yellow : D.white008, position: 'relative', transition: '0.2s' }}>
                <div style={{ position: 'absolute', top: 2, left: showUnreadOnly ? 12 : 2, width: 12, height: 12, borderRadius: '50%', background: '#fff', transition: '0.2s' }} />
              </div>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <Filter size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: D.textDim, pointerEvents: 'none' }} />
            <input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px 10px 38px', borderRadius: 10, border: `1px solid ${D.border}`, background: D.inputBg, color: D.textPrimary, fontSize: '0.85rem', outline: 'none' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = D.purple)}
              onBlur={(e) => (e.currentTarget.style.borderColor = D.border)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: D.textDim }}>
                <X size={14} />
              </button>
            )}
          </div>

          {loading && items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: D.surface, border: `1px solid ${D.border}`, borderRadius: 16, color: D.textMuted }}>
              <RefreshCw size={28} style={{ opacity: 0.3, marginBottom: 12, animation: 'spin 1s linear infinite' }} />
              <div style={{ fontWeight: 600 }}>Loading notifications...</div>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: D.surface, border: `1px solid ${D.border}`, borderRadius: 16, color: D.textMuted }}>
              <Bell size={40} style={{ opacity: 0.2, marginBottom: 14 }} />
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6, color: D.textPrimary }}>No notifications</div>
              <div style={{ fontSize: '0.82rem' }}>
                {searchQuery ? 'No results match your search.' : showUnreadOnly ? 'All caught up! No unread notifications.' : 'Notifications from campaigns, AI, billing and more will appear here.'}
              </div>
            </div>
          )}

          {groupOrder.map((groupKey) => {
            const group = grouped[groupKey];
            if (!group || group.length === 0) return null;
            return (
              <div key={groupKey}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: D.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, paddingLeft: 4 }}>
                  {groupKey}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {group.map((notif) => (
                    <NotifCard
                      key={notif.id}
                      notif={notif}
                      onRead={handleRead}
                      onDelete={handleDelete}
                      onAction={handleAction}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
