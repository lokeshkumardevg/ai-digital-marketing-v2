// ─── MessagingInbox.tsx ───────────────────────────────────────
// The "Conversations" tab of the Messaging page (/messaging).
// One place for Facebook + Instagram DMs, Google reviews, WhatsApp and Email.
// Left: conversations (filter by channel / unread / resolved, search). Right: thread + reply box.
// New customer messages arrive live over the existing socket ('inbox:update') and by a 60s sync fallback.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, RefreshCw, Send, Plus, X, ArrowLeft, Inbox as InboxIcon, Star, Mail, Check, Clock, Link2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import {
  inboxApi, apiError,
  type ChannelsResponse, type Conversation, type InboxChannel, type InboxMessage, type SyncError,
} from '../../services/inboxApi';

// ─── Channel look ────────────────────────────────────────────
const CH: Record<InboxChannel, { label: string; color: string; letter?: string }> = {
  facebook:  { label: 'Facebook',  color: '#1877f2', letter: 'f' },
  instagram: { label: 'Instagram', color: '#e1306c', letter: 'ig' },
  google:    { label: 'Google',    color: '#ea4335', letter: 'G' },
  whatsapp:  { label: 'WhatsApp',  color: '#25d366', letter: 'W' },
  email:     { label: 'Email',     color: '#8b5cf6' },
};
const CHANNEL_ORDER: InboxChannel[] = ['facebook', 'instagram', 'google', 'whatsapp', 'email'];

const MAX_LEN: Record<InboxChannel, number> = { facebook: 2000, instagram: 1000, google: 4000, whatsapp: 2000, email: 2000 };

// ─── Small helpers ───────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric' });
}

const clock = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

function windowLeft(replyBy: string | null, now: number): string | null {
  if (!replyBy) return null;
  const ms = new Date(replyBy).getTime() - now;
  if (ms <= 0) return null;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function useNow(everyMs: number): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(t);
  }, [everyMs]);
  return now;
}

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

// ─── Visual pieces ───────────────────────────────────────────
const ChannelBadge: React.FC<{ channel: InboxChannel; size?: number }> = ({ channel, size = 18 }) => {
  const c = CH[channel];
  return (
    <span
      aria-label={c.label}
      title={c.label}
      style={{
        width: size, height: size, borderRadius: size / 3.2, background: c.color, color: '#fff', flex: 'none',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.5, fontWeight: 800, lineHeight: 1,
      }}
    >
      {channel === 'email' ? <Mail size={size * 0.62} /> : c.letter}
    </span>
  );
};

const Avatar: React.FC<{ conv: Pick<Conversation, 'participantName' | 'participantAvatar' | 'channel'>; size?: number }> = ({ conv, size = 44 }) => {
  const [broken, setBroken] = useState(false);
  const initial = (conv.participantName || '?').trim().charAt(0).toUpperCase();
  return (
    <span style={{ position: 'relative', flex: 'none', width: size, height: size }}>
      {conv.participantAvatar && !broken ? (
        <img src={conv.participantAvatar} alt="" onError={() => setBroken(true)} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
      ) : (
        <span style={{ width: size, height: size, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.4 }}>
          {initial}
        </span>
      )}
      <span style={{ position: 'absolute', right: -3, bottom: -3, borderRadius: 6, boxShadow: '0 0 0 2px var(--bg-primary)' }}>
        <ChannelBadge channel={conv.channel} size={16} />
      </span>
    </span>
  );
};

const Stars: React.FC<{ n: number }> = ({ n }) => (
  <span aria-label={`${n} out of 5 stars`} style={{ display: 'inline-flex', gap: 1 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={13} fill={i <= n ? '#f59e0b' : 'none'} color={i <= n ? '#f59e0b' : 'var(--text-dim)'} />
    ))}
  </span>
);

const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }> = ({ primary, style, children, ...rest }) => (
  <button
    {...rest}
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '9px 16px', borderRadius: 'var(--radius-pill, 50px)',
      border: primary ? 'none' : '1px solid var(--glass-border)', cursor: rest.disabled ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13.5,
      background: primary ? 'var(--accent-gradient)' : 'var(--bg-elevated)', color: primary ? '#fff' : 'var(--text-primary)',
      opacity: rest.disabled ? 0.55 : 1, ...style,
    }}
  >
    {children}
  </button>
);

// ─── Main page ───────────────────────────────────────────────
type Tab = 'open' | 'unread' | 'resolved';

const MessagingInbox: React.FC<{ onUnreadChange?: (n: number) => void }> = ({ onUnreadChange }) => {
  const navigate = useNavigate();
  const now = useNow(60000);

  const [channels, setChannels] = useState<ChannelsResponse | null>(null);
  const [filterChannel, setFilterChannel] = useState<'all' | InboxChannel>('all');
  const [tab, setTab] = useState<Tab>('open');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search, 350);

  const [items, setItems] = useState<Conversation[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [hasOlder, setHasOlder] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncErrors, setSyncErrors] = useState<SyncError[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [view, setView] = useState<'list' | 'thread'>('list');

  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;
  const listReq = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  // ── data loading ──
  const query = useMemo(() => ({
    channel: filterChannel === 'all' ? undefined : filterChannel,
    status: tab === 'resolved' ? ('resolved' as const) : tab === 'open' ? ('open' as const) : undefined,
    unread: tab === 'unread',
    search: debouncedSearch.trim() || undefined,
  }), [filterChannel, tab, debouncedSearch]);

  const loadList = useCallback(async (silent = false) => {
    const id = ++listReq.current;
    if (!silent) setListLoading(true);
    try {
      const r = await inboxApi.conversations(query);
      if (id !== listReq.current) return; // a newer request replaced this one
      setItems(r.items);
      setCursor(r.nextCursor);
    } catch (e) {
      if (!silent) toast.error(apiError(e, 'Conversations load nahi hue.'));
    } finally {
      if (id === listReq.current) setListLoading(false);
    }
  }, [query]);

  const loadChannels = useCallback(async () => {
    try { setChannels(await inboxApi.channels()); } catch { /* shown via empty state */ }
  }, []);

  const loadThread = useCallback(async (id: string, silent = false) => {
    if (!silent) setThreadLoading(true);
    try {
      const r = await inboxApi.messages(id);
      if (activeIdRef.current !== id) return;
      stickToBottom.current = true;
      setActive(r.conversation);
      setMessages(r.items);
      setHasOlder(r.hasMore);
    } catch (e) {
      if (!silent) toast.error(apiError(e, 'Messages load nahi hue.'));
    } finally {
      if (!silent) setThreadLoading(false);
    }
  }, []);

  const doSync = useCallback(async (force = false) => {
    setSyncing(true);
    try {
      const r = await inboxApi.sync(force);
      setSyncErrors(r.errors || []);
      if (force && !(r.errors || []).length) toast.success('Inbox updated');
    } catch (e) {
      if (force) toast.error(apiError(e, 'Sync fail ho gaya.'));
    } finally {
      setSyncing(false);
    }
    await Promise.all([loadList(true), loadChannels()]);
    if (activeIdRef.current) loadThread(activeIdRef.current, true);
  }, [loadList, loadChannels, loadThread]);

  // first open: show what we have, then pull fresh messages
  useEffect(() => { loadChannels(); doSync(false); /* eslint-disable-next-line */ }, []);
  useEffect(() => { loadList(false); }, [loadList]);

  // live updates from the backend + 60s fallback
  useEffect(() => {
    const url = (import.meta as any).env?.VITE_SOCKET_URL || (import.meta as any).env?.VITE_API_URL;
    const socket = io(url, { auth: { token: localStorage.getItem('access_token') } });
    socket.on('inbox:update', (p: { conversationId?: string }) => {
      loadList(true);
      loadChannels();
      if (p?.conversationId && p.conversationId === activeIdRef.current) loadThread(p.conversationId, true);
    });
    const t = setInterval(() => { if (document.visibilityState === 'visible') doSync(false); }, 60000);
    return () => { socket.disconnect(); clearInterval(t); };
  }, [loadList, loadChannels, loadThread, doSync]);

  // keep the thread pinned to the newest message unless the user scrolled up
  useEffect(() => {
    const el = scroller.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages, threadLoading]);

  // ── actions ──
  const openConversation = (c: Conversation) => {
    setActiveId(c.id);
    activeIdRef.current = c.id;
    setActive(c);
    setMessages([]);
    setDraft('');
    setView('thread');
    loadThread(c.id);
    if (c.unreadCount > 0) {
      setItems(prev => prev.map(x => (x.id === c.id ? { ...x, unreadCount: 0 } : x)));
      inboxApi.markRead(c.id).then(loadChannels).catch(() => undefined);
    }
  };

  const loadMore = async () => {
    if (!cursor) return;
    setMoreLoading(true);
    try {
      const r = await inboxApi.conversations({ ...query, before: cursor });
      setItems(prev => [...prev, ...r.items.filter(n => !prev.some(p => p.id === n.id))]);
      setCursor(r.nextCursor);
    } catch (e) { toast.error(apiError(e)); }
    finally { setMoreLoading(false); }
  };

  const loadOlder = async () => {
    if (!activeId || !messages.length) return;
    const el = scroller.current;
    const prevH = el?.scrollHeight || 0;
    try {
      const r = await inboxApi.messages(activeId, messages[0].sentAt);
      stickToBottom.current = false;
      setMessages(prev => [...r.items, ...prev]);
      setHasOlder(r.hasMore);
      requestAnimationFrame(() => { if (el) el.scrollTop = el.scrollHeight - prevH; });
    } catch (e) { toast.error(apiError(e)); }
  };

  const touchConversation = (id: string, text: string) => {
    const at = new Date().toISOString();
    setItems(prev => {
      const cur = prev.find(c => c.id === id);
      if (!cur) return prev;
      return [{ ...cur, lastMessageText: text.slice(0, 200), lastMessageAt: at, lastDirection: 'out', unreadCount: 0 }, ...prev.filter(c => c.id !== id)];
    });
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || !active || sending) return;
    setSending(true);
    try {
      const r = await inboxApi.reply(active.id, text);
      stickToBottom.current = true;
      setMessages(prev => [...prev, r.message]);
      setDraft('');
      touchConversation(active.id, text);
    } catch (e) {
      toast.error(apiError(e, 'Message nahi gaya.')); // draft stays so nothing is lost
    } finally { setSending(false); }
  };

  const toggleResolved = async () => {
    if (!active) return;
    const next = active.status === 'open' ? 'resolved' : 'open';
    try {
      await inboxApi.setStatus(active.id, next);
      setActive({ ...active, status: next });
      setItems(prev => (tab === 'open' && next === 'resolved') || (tab === 'resolved' && next === 'open')
        ? prev.filter(c => c.id !== active.id)
        : prev.map(c => (c.id === active.id ? { ...c, status: next } : c)));
      toast.success(next === 'resolved' ? 'Marked as resolved' : 'Re-opened');
    } catch (e) { toast.error(apiError(e)); }
  };

  const connectMeta = async () => {
    if (channels && !channels.metaLoginDone) { navigate('/settings'); return; }
    setConnecting(true);
    try {
      const r = await inboxApi.connectMeta();
      toast.success(`${r.connected} account connected`);
      r.warnings?.forEach(w => toast(w, { icon: '⚠️', duration: 6000 }));
      await doSync(true);
    } catch (e) { toast.error(apiError(e, 'Meta connect nahi ho paya.')); }
    finally { setConnecting(false); }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  useEffect(() => {
    if (!channels || !onUnreadChange) return;
    onUnreadChange(CHANNEL_ORDER.reduce((n, c) => n + (channels.channels[c].unread || 0), 0));
  }, [channels, onUnreadChange]);

  const noChannels = channels && CHANNEL_ORDER.every(c => !channels.channels[c].connected);
  const metaMissing = channels && (!channels.channels.facebook.connected || !channels.channels.instagram.connected);
  const left = active ? windowLeft(active.replyBy, now) : null;
  const limit = active ? MAX_LEN[active.channel] : 2000;

  // group messages by day
  const grouped = useMemo(() => {
    const out: { label: string; msgs: InboxMessage[] }[] = [];
    messages.forEach(m => {
      const label = dayLabel(m.sentAt);
      const last = out[out.length - 1];
      if (last && last.label === label) last.msgs.push(m); else out.push({ label, msgs: [m] });
    });
    return out;
  }, [messages]);

  // ── render ──
  return (
    <div className="ux-root" data-view={view}>
      <style>{`
        .ux-root{display:flex;height:calc(100vh - var(--header-height, 80px) - 230px);min-height:560px;max-height:920px;background:var(--bg-elevated);color:var(--text-primary);font-family:inherit;border:1px solid var(--glass-border);border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.25)}
        .ux-list{width:380px;flex:none;border-right:1px solid var(--glass-border);display:flex;flex-direction:column;min-width:0}
        .ux-thread{flex:1;min-width:0;display:flex;flex-direction:column;background:var(--bg-primary)}
        .ux-row{display:flex;gap:12px;padding:13px 16px;cursor:pointer;border:0;border-bottom:1px solid var(--glass-border);background:transparent;width:100%;text-align:left;color:inherit;font:inherit}
        .ux-row:hover{background:var(--bg-elevated)}
        .ux-row[aria-current="true"]{background:var(--bg-elevated);box-shadow:inset 3px 0 0 var(--accent-primary)}
        .ux-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border-radius:999px;border:1px solid var(--glass-border);background:transparent;color:var(--text-secondary);font-size:12.5px;font-weight:600;cursor:pointer;white-space:nowrap}
        .ux-chip[aria-pressed="true"]{background:var(--accent-primary);border-color:transparent;color:#fff}
        .ux-back{display:none}
        .ux-scroll::-webkit-scrollbar{width:8px}.ux-scroll::-webkit-scrollbar-thumb{background:var(--glass-border);border-radius:8px}
        .ux-bubble{max-width:min(75%,560px);padding:10px 14px;border-radius:18px;font-size:14.5px;line-height:1.5;white-space:pre-wrap;word-break:break-word}
        @media (max-width: 899px){
          .ux-root{height:calc(100vh - var(--header-height, 80px) - 190px);min-height:520px}
          .ux-list{width:100%;border-right:0}
          .ux-root[data-view="list"] .ux-thread{display:none}
          .ux-root[data-view="thread"] .ux-list{display:none}
          .ux-back{display:inline-flex}
          .ux-bubble{max-width:86%}
        }
      `}</style>

      {/* ───── Left: conversation list ───── */}
      <section className="ux-list" aria-label="Conversations">
        <div style={{ padding: '18px 16px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, flex: 1 }}>Conversations</h2>
          <button aria-label="Refresh inbox" title="Refresh" onClick={() => doSync(true)} disabled={syncing}
            style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={16} style={syncing ? { animation: 'ux-spin 1s linear infinite' } : undefined} />
          </button>
          <Btn primary onClick={() => setNewOpen(true)}><Plus size={16} /> New</Btn>
        </div>
        <style>{`@keyframes ux-spin{to{transform:rotate(360deg)}}`}</style>

        <div style={{ padding: '0 16px 10px', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 28, top: 11, color: 'var(--text-dim)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or message" aria-label="Search conversations"
            style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 36px', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }} />
        </div>

        {/* channel filter */}
        <div style={{ display: 'flex', gap: 6, padding: '0 16px 10px', overflowX: 'auto' }}>
          <button className="ux-chip" aria-pressed={filterChannel === 'all'} onClick={() => setFilterChannel('all')}>All</button>
          {CHANNEL_ORDER.map(c => {
            const info = channels?.channels[c];
            return (
              <button key={c} className="ux-chip" aria-pressed={filterChannel === c} onClick={() => setFilterChannel(c)} title={info?.connected ? CH[c].label : `${CH[c].label} (not connected)`} style={info && !info.connected ? { opacity: 0.55 } : undefined}>
                <ChannelBadge channel={c} size={15} /> {CH[c].label}
                {info && info.unread > 0 && <span style={{ background: filterChannel === c ? 'rgba(255,255,255,.28)' : 'var(--accent-primary)', color: '#fff', borderRadius: 999, padding: '0 6px', fontSize: 11 }}>{info.unread}</span>}
              </button>
            );
          })}
        </div>

        {/* status tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '0 16px 10px', borderBottom: '1px solid var(--glass-border)' }}>
          {(['open', 'unread', 'resolved'] as Tab[]).map(t => (
            <button key={t} className="ux-chip" aria-pressed={tab === t} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
          ))}
        </div>

        {syncErrors.length > 0 && (
          <div role="alert" style={{ margin: 12, padding: '10px 12px', borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', fontSize: 12.5, color: 'var(--text-primary)' }}>
            {syncErrors.map((er, i) => (
              <div key={i} style={{ marginTop: i ? 6 : 0 }}>
                <strong>{CH[er.channel].label}:</strong> {er.message}{' '}
                {er.needsReconnect && <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 0, color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 700, padding: 0 }}>Settings →</button>}
              </div>
            ))}
          </div>
        )}

        <div className="ux-scroll" style={{ flex: 1, overflowY: 'auto' }}>
          {listLoading && !items.length && <p style={{ padding: 24, color: 'var(--text-dim)', fontSize: 14 }}>Loading…</p>}

          {!listLoading && !items.length && noChannels && (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <InboxIcon size={34} style={{ color: 'var(--text-dim)' }} />
              <h2 style={{ fontSize: 17, margin: '10px 0 6px' }}>Connect your channels</h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 14px' }}>
                Facebook, Instagram, Google reviews, WhatsApp aur Email ke saare messages yahin ek jagah aayenge.
              </p>
              <Btn primary onClick={connectMeta} disabled={connecting}><Link2 size={15} /> {channels?.metaLoginDone ? 'Connect Facebook & Instagram' : 'Open Settings to connect Meta'}</Btn>
            </div>
          )}

          {!listLoading && !items.length && !noChannels && (
            <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
              {debouncedSearch ? 'Koi match nahi mila.' : tab === 'unread' ? 'Sab padh liya. 🎉' : 'Abhi koi conversation nahi hai.'}
            </p>
          )}

          {items.map(c => (
            <button key={c.id} className="ux-row" aria-current={c.id === activeId} onClick={() => openConversation(c)}>
              <Avatar conv={c} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ flex: 1, minWidth: 0, fontWeight: c.unreadCount ? 800 : 600, fontSize: 14.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.participantName}</span>
                  <span style={{ fontSize: 11.5, color: c.unreadCount ? 'var(--accent-primary)' : 'var(--text-dim)', flex: 'none' }}>{timeAgo(c.lastMessageAt)}</span>
                </span>
                {c.channel === 'google' && c.rating ? <span style={{ display: 'block', marginTop: 2 }}><Stars n={c.rating} /></span> : null}
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: c.unreadCount ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.lastDirection === 'out' && <Check size={12} style={{ marginRight: 4, verticalAlign: -1 }} />}{c.lastMessageText || '—'}
                  </span>
                  {c.unreadCount > 0 && <span style={{ background: 'var(--accent-primary)', color: '#fff', borderRadius: 999, minWidth: 20, textAlign: 'center', padding: '1px 6px', fontSize: 11.5, fontWeight: 700 }}>{c.unreadCount}</span>}
                </span>
              </span>
            </button>
          ))}

          {cursor && (
            <div style={{ padding: 14, textAlign: 'center' }}>
              <Btn onClick={loadMore} disabled={moreLoading}>{moreLoading ? 'Loading…' : 'Load more'}</Btn>
            </div>
          )}
          {metaMissing && !noChannels && (
            <div style={{ padding: 14, textAlign: 'center' }}>
              <Btn onClick={connectMeta} disabled={connecting}><Link2 size={15} /> Connect Facebook / Instagram</Btn>
            </div>
          )}
        </div>
      </section>

      {/* ───── Right: thread ───── */}
      <section className="ux-thread" aria-label="Conversation">
        {!active ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-dim)', padding: 24 }}>
            <InboxIcon size={44} />
            <p style={{ marginTop: 12, fontSize: 15 }}>Koi conversation chuno ya naya message shuru karo.</p>
          </div>
        ) : (
          <>
            <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-primary)' }}>
              <button className="ux-back" aria-label="Back to conversations" onClick={() => setView('list')}
                style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ArrowLeft size={17} />
              </button>
              <Avatar conv={active} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{active.participantName}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                  <span>{CH[active.channel].label}{active.participantHandle ? ` · @${active.participantHandle}` : ''}</span>
                  {active.channel === 'google' && active.rating ? <Stars n={active.rating} /> : null}
                  {active.subject && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>· {active.subject}</span>}
                </div>
              </div>
              <Btn onClick={toggleResolved}><Check size={15} /> {active.status === 'open' ? 'Resolve' : 'Re-open'}</Btn>
            </header>

            <div ref={scroller} className="ux-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}
              onScroll={e => { const el = e.currentTarget; stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }}>
              {hasOlder && <div style={{ textAlign: 'center', marginBottom: 12 }}><Btn onClick={loadOlder}>Load older messages</Btn></div>}
              {threadLoading && !messages.length && <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>Loading…</p>}
              {grouped.map(g => (
                <div key={g.label}>
                  <div style={{ textAlign: 'center', margin: '10px 0', fontSize: 11.5, color: 'var(--text-dim)', fontWeight: 600 }}>{g.label}</div>
                  {g.msgs.map(m => {
                    const mine = m.direction === 'out';
                    return (
                      <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div className="ux-bubble" style={mine
                            ? { background: 'var(--accent-gradient)', color: '#fff', borderBottomRightRadius: 6 }
                            : { background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderBottomLeftRadius: 6 }}>
                            {m.attachments?.map((a, i) => a.type === 'image'
                              ? <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"><img src={a.url} alt="attachment" loading="lazy" style={{ maxWidth: 240, width: '100%', borderRadius: 12, display: 'block', marginBottom: m.text ? 8 : 0 }} /></a>
                              : <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline', display: 'block', marginBottom: 6 }}>{a.name || 'Attachment'}</a>)}
                            {m.text}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 3, textAlign: mine ? 'right' : 'left' }}>{clock(m.sentAt)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* composer */}
            <footer style={{ padding: '10px 16px 14px', borderTop: '1px solid var(--glass-border)', background: 'var(--bg-primary)' }}>
              {active.replyBy && active.canReply && left && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={13} /> Reply window: {left} baaki (Meta customer ke last message ke 24 ghante tak allow karta hai)
                </div>
              )}
              {!active.canReply && (
                <div role="alert" style={{ fontSize: 12.5, marginBottom: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  24 ghante se zyada ho gaye, ab {CH[active.channel].label} par reply nahi ho sakta. Customer dobara message kare tab reply kar paoge.
                </div>
              )}
              {active.channel === 'google' && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Ye reply Google par review ke neeche sabko public dikhega.</div>}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={onKey} rows={Math.min(5, Math.max(1, draft.split('\n').length))}
                  disabled={!active.canReply || sending} maxLength={limit} aria-label="Type your reply"
                  placeholder={active.canReply ? (active.channel === 'google' ? 'Review par reply likho…' : 'Reply likho… (Enter = send, Shift+Enter = nayi line)') : 'Reply window band hai'}
                  style={{ flex: 1, resize: 'none', padding: '11px 14px', borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14.5, fontFamily: 'inherit', outline: 'none' }} />
                <Btn primary onClick={send} disabled={!draft.trim() || !active.canReply || sending} aria-label="Send reply" style={{ height: 44, padding: '0 18px' }}>
                  <Send size={16} /> {sending ? 'Sending…' : 'Send'}
                </Btn>
              </div>
              {draft.length > limit * 0.8 && <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 4, textAlign: 'right' }}>{draft.length}/{limit}</div>}
            </footer>
          </>
        )}
      </section>

      {newOpen && (
        <NewMessageModal
          onClose={() => setNewOpen(false)}
          onSent={async conversationId => {
            setNewOpen(false);
            setTab('open');
            setFilterChannel('all');
            await Promise.all([loadList(true), loadChannels()]);
            const r = await inboxApi.messages(conversationId).catch(() => null);
            if (r) openConversation(r.conversation);
          }}
        />
      )}
    </div>
  );
};

// ─── New message (WhatsApp / Email) ──────────────────────────
const NewMessageModal: React.FC<{ onClose: () => void; onSent: (conversationId: string) => void }> = ({ onClose, onSent }) => {
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [to, setTo] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  const submit = async () => {
    setBusy(true);
    try {
      const r = await inboxApi.start({ channel, to: to.trim(), name: name.trim() || undefined, subject: subject.trim() || undefined, text: text.trim() });
      toast.success('Message bhej diya');
      onSent(r.conversationId);
    } catch (e) { toast.error(apiError(e, 'Message nahi gaya.')); }
    finally { setBusy(false); }
  };

  const input: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'inherit' };
  const label: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', margin: '12px 0 5px' };
  const valid = to.trim().length > 3 && text.trim().length > 0;

  return (
    <div role="dialog" aria-modal="true" aria-label="New message" onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(480px, 100%)', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18, flex: 1 }}>New message</h2>
          <button aria-label="Close" onClick={onClose} style={{ background: 'none', border: 0, color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {(['whatsapp', 'email'] as const).map(c => (
            <button key={c} className="ux-chip" aria-pressed={channel === c} onClick={() => setChannel(c)}><ChannelBadge channel={c} size={15} /> {CH[c].label}</button>
          ))}
        </div>

        <label style={label} htmlFor="ux-to">{channel === 'whatsapp' ? 'Phone number' : 'Email address'}</label>
        <input id="ux-to" style={input} value={to} onChange={e => setTo(e.target.value)} placeholder={channel === 'whatsapp' ? '+91 98765 43210' : 'name@company.com'} inputMode={channel === 'whatsapp' ? 'tel' : 'email'} />

        <label style={label} htmlFor="ux-name">Name (optional)</label>
        <input id="ux-name" style={input} value={name} onChange={e => setName(e.target.value)} />

        {channel === 'email' && (<>
          <label style={label} htmlFor="ux-subj">Subject</label>
          <input id="ux-subj" style={input} value={subject} onChange={e => setSubject(e.target.value)} />
        </>)}

        <label style={label} htmlFor="ux-text">Message</label>
        <textarea id="ux-text" style={{ ...input, minHeight: 110, resize: 'vertical' }} value={text} onChange={e => setText(e.target.value)} maxLength={2000} />

        <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '10px 0 0', lineHeight: 1.5 }}>
          Facebook, Instagram aur Google par pehle customer message kare tabhi reply ho sakta hai, wahan naya message shuru nahi kiya ja sakta.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn primary onClick={submit} disabled={!valid || busy}><Send size={15} /> {busy ? 'Sending…' : 'Send'}</Btn>
        </div>
      </div>
    </div>
  );
};

export default MessagingInbox;
