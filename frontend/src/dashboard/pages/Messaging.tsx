import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle, Mail, Send, CheckCircle, Users, Smartphone, Sparkles,
  Upload, X, Clock, AlertCircle, Zap, FileSpreadsheet,
  RefreshCw, Radio, AtSign, Phone, User, Layers, History,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { messageLogApi, type MessageLog } from '../../services/messageLogApi';

// ─── Dark Theme Tokens ────────────────────────────────────────────────────────
const D = {
  bg:          '#080d1a',
  surface:     '#0f1629',
  surfaceAlt:  '#141d35',
  border:      'rgba(99,102,241,0.18)',
  borderGlow:  'rgba(124,58,237,0.35)',
  purple:      '#0665ff',
  purpleSoft:  'rgba(124,58,237,0.12)',
  purpleText:  '#a78bfa',
  green:       '#10b981',
  greenSoft:   'rgba(16,185,129,0.12)',
  greenText:   '#34d399',
  red:         '#ef4444',
  redSoft:     'rgba(239,68,68,0.12)',
  yellow:      '#f59e0b',
  yellowSoft:  'rgba(245,158,11,0.12)',
  textPrimary: '#f1f5f9',
  textMuted:   '#94a3b8',
  textDim:     '#475569',
  inputBg:     'rgba(255,255,255,0.04)',
  white004:    'rgba(255,255,255,0.04)',
  white008:    'rgba(255,255,255,0.08)',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserRow {
  name: string;
  phone?: string;
  email?: string;
}

type CampaignType = 'whatsapp' | 'email' | 'both';
type LogFilter = '5days' | '15days' | '30days' | 'all';

// ─── Status colors (dark-safe) ────────────────────────────────────────────────
const LOG_STATUS_COLOR: Record<string, string> = {
  success: '#10b981',
  partial: '#f59e0b',
  failed:  '#ef4444',
  pending: '#94a3b8',
};
const LOG_STATUS_BG: Record<string, string> = {
  success: 'rgba(16,185,129,0.12)',
  partial: 'rgba(245,158,11,0.12)',
  failed:  'rgba(239,68,68,0.12)',
  pending: 'rgba(148,163,184,0.10)',
};



// ─── Stat Badge ───────────────────────────────────────────────────────────────
const StatBadge = ({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string | number; color: string;
}) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    background: D.surface, border: `1px solid ${D.border}`,
    borderRadius: 12, padding: '14px 18px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  }}>
    <div style={{ width: 38, height: 38, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: D.textPrimary, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: D.textMuted, marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

// ─── Date formatter ───────────────────────────────────────────────────────────
const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const now = new Date();
  const diffMs   = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs  = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1)  return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs  < 24) return `${diffHrs}h ago`;
  if (diffDays < 7)  return `${diffDays}d ago`;
  return d.toLocaleDateString();
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const Messaging: React.FC = () => {
  const [activeTab, setActiveTab]               = useState<CampaignType>('whatsapp');
  const [message, setMessage]                   = useState('');
  const [audiences, setAudiences]               = useState<any[]>([]);
  const [selectedAudience, setSelectedAudience] = useState('');
  const [inputMode, setInputMode]               = useState<'audience' | 'csv' | 'manual'>('csv');
  const [csvUsers, setCsvUsers]                 = useState<UserRow[]>([]);
  const [csvFileName, setCsvFileName]           = useState('');
  const [manualUsers, setManualUsers]           = useState<UserRow[]>([{ name: '', phone: '', email: '' }]);
  const [sending, setSending]                   = useState(false);
  const [queuedCount, setQueuedCount]           = useState(0);
  const [skippedCount, setSkippedCount]         = useState(0);
  const [showTemplates, setShowTemplates]       = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [logs, setLogs]             = useState<MessageLog[]>([]);
  const [logFilter, setLogFilter]   = useState<LogFilter>('all');
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [generatedTemplates, setGeneratedTemplates] = useState<string[]>([]);
  const [generatingTemplates, setGeneratingTemplates] = useState(false);

  // ── Load audiences ──────────────────────────────────────────────────────────
  useEffect(() => {
    import('../../api/axios').then(({ api }) => {
      api.get('/crm/audiences').then(res => {
        setAudiences(res.data || []);
        if (res.data?.length) setSelectedAudience(res.data[0]._id);
      }).catch(() => {});
    });
  }, []);

  // ── Fetch broadcast logs ────────────────────────────────────────────────────
  const fetchLogs = useCallback(async (filter?: LogFilter) => {
    setLoadingLogs(true);
    try {
      const apiFilter = filter && filter !== 'all' ? filter : undefined;
      const res = await messageLogApi.getLogs(apiFilter);
      setLogs(res.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load broadcast history');
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => { fetchLogs(logFilter); }, [logFilter, fetchLogs]);

  // ── Generate AI templates ───────────────────────────────────────────────
  const handleGenerateTemplates = async () => {
    setGeneratingTemplates(true);
    try {
      const { api } = await import('../../api/axios');
      const res = await api.post('/ai/generate-templates', {
        channel: activeTab,
        businessName: 'Your Business',
        productOrService: 'Your Product/Service',
        tone: 'professional and engaging',
        context: message || 'General marketing campaign',
      });
      setGeneratedTemplates(res.data?.data || []);
      setShowTemplates(true);
      toast.success('AI templates generated!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to generate templates');
    } finally {
      setGeneratingTemplates(false);
    }
  };

  // ── Build recipients ────────────────────────────────────────────────────────
  const buildUsers = useCallback((): UserRow[] => {
    if (inputMode === 'csv')    return csvUsers;
    if (inputMode === 'manual') return manualUsers.filter(u => u.name);
    return [{ name: 'Audience Segment', phone: '', email: '' }];
  }, [inputMode, csvUsers, manualUsers]);

  // ── File upload ─────────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { api } = await import('../../api/axios');
      const res = await api.post('/messaging/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCsvUsers(res.data.users || []);
      setCsvFileName(file.name);
      toast.success(`Parsed ${res.data.count} users from ${file.name}`);
    } catch {
      toast.error('Failed to parse file. Use CSV format: name,phone,email');
    }
  };

  // ── Manual row helpers ──────────────────────────────────────────────────────
  const updateManualRow = (idx: number, field: keyof UserRow, val: string) =>
    setManualUsers(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r));
  const addManualRow    = () => setManualUsers(prev => [...prev, { name: '', phone: '', email: '' }]);
  const removeManualRow = (idx: number) => setManualUsers(prev => prev.filter((_, i) => i !== idx));

  // ── Send campaign ───────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!message.trim()) { toast.error('Please enter a message'); return; }
    const users = buildUsers();
    if (!users.length) { toast.error('No users to send to'); return; }
    setSending(true);
    try {
      const { api } = await import('../../api/axios');
      const res = await api.post('/messaging/send', { type: activeTab, message, users });
      const { queued, skipped } = res.data;
      setQueuedCount(q => q + queued);
      setSkippedCount(s => s + skipped);
      toast.success(`${queued} messages queued!${skipped > 0 ? ` (${skipped} skipped)` : ''}`);
      setMessage('');
      fetchLogs(logFilter);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  const filteredLogs = logs.filter(m => (m.status === 'success' || m.status === 'partial' || m.status === 'failed') && (activeTab === 'both' ? true : m.channel === activeTab));
  const totalUsers   = inputMode === 'csv'    ? csvUsers.length
    : inputMode === 'manual' ? manualUsers.filter(u => u.name).length
    : audiences.find(a => a._id === selectedAudience)?.estimatedSize || 0;

  const iconFields = [
    { field: 'name'  as const, ph: 'Name',  Icon: User  },
    { field: 'phone' as const, ph: 'Phone', Icon: Phone },
    { field: 'email' as const, ph: 'Email', Icon: AtSign },
  ];

  const filterButtons: { key: LogFilter; label: string }[] = [
    { key: 'all',    label: 'All' },
    { key: '5days',  label: 'Last 5 Days' },
    { key: '15days', label: 'Last 15 Days' },
    { key: '30days', label: 'Last 30 Days' },
  ];

  // ── Input / label shared dark styles ────────────────────────────────────────
  const labelStyle: React.CSSProperties = {
    fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.06em', color: D.textMuted, marginBottom: 8, display: 'block',
  };
  const darkInput: React.CSSProperties = {
    background: D.inputBg, border: `1px solid ${D.border}`,
    borderRadius: 8, color: D.textPrimary, outline: 'none',
    fontSize: '0.76rem', padding: '8px 8px 8px 24px', width: '100%',
    fontFamily: 'inherit', boxSizing: 'border-box',
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ paddingBottom: 48, background: D.bg, minHeight: '100%' }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .msg-mode-btn:hover { border-color: ${D.purple} !important; }
        .msg-template-btn:hover { background: ${D.white008} !important; }
        .msg-filter-btn:hover { border-color: ${D.purple} !important; color: ${D.purpleText} !important; }
        .msg-upload-zone:hover { border-color: ${D.purple} !important; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 3px; }
      `}</style>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 700, marginBottom: 6, color: D.textPrimary }}>
            Omni-Channel{' '}
            <span style={{ background: 'linear-gradient(135deg, #a78bfa, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Messaging Hub
            </span>
          </h1>
          <p style={{ color: D.textMuted, fontSize: '0.9rem' }}>
            Bulk broadcast via WhatsApp and Email — powered by Twilio and AI personalization
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <StatBadge icon={<Zap size={16} color={D.purpleText} />}   label="Queued"  value={queuedCount}  color={D.purpleSoft} />
          <StatBadge icon={<Users size={16} color={D.greenText} />}   label="Reached" value={queuedCount}  color={D.greenSoft} />
          <StatBadge icon={<AlertCircle size={16} color={D.yellow} />} label="Skipped" value={skippedCount} color={D.yellowSoft} />
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 380px) 1fr', gap: 24, alignItems: 'start' }}>

        {/* ════ LEFT: Compose Panel ════ */}
        <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>

          {/* Channel tabs */}
          <div style={{ display: 'flex', background: D.white004, padding: 4, borderRadius: 12, gap: 4 }}>
            {(['whatsapp', 'email', 'both'] as CampaignType[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s',
                background: activeTab === tab ? D.purple : 'transparent',
                color: activeTab === tab ? '#fff' : D.textMuted,
              }}>
                {tab === 'whatsapp' && <Smartphone size={13} />}
                {tab === 'email'    && <Mail size={13} />}
                {tab === 'both'     && <Layers size={13} />}
                {tab === 'both' ? 'Both' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Recipients source selector */}
          <div>
            <label style={labelStyle}>Recipients Source</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['csv', 'manual'] as const).map(mode => (
                <button
                  key={mode}
                  className="msg-mode-btn"
                  onClick={() => setInputMode(mode)}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: 8, cursor: 'pointer',
                    border: `1.5px solid ${inputMode === mode ? D.purple : D.border}`,
                    background: inputMode === mode ? D.purpleSoft : D.white004,
                    color: inputMode === mode ? D.purpleText : D.textMuted,
                    fontSize: '0.73rem', fontWeight: 600, transition: 'all 0.15s',
                  }}
                >
                  {mode === 'csv' ? 'CSV' : 'Manual'}
                </button>
              ))}
            </div>
          </div>

          {/* CSV upload */}
          {inputMode === 'csv' && (
            <div>
              <label style={labelStyle}>Upload CSV / Excel</label>
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />
              {csvUsers.length === 0 ? (
                <div
                  className="msg-upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ border: `2px dashed ${D.border}`, borderRadius: 12, padding: '28px 16px', textAlign: 'center', cursor: 'pointer', background: D.white004, transition: 'border-color 0.2s' }}
                >
                  <Upload size={28} color={D.purpleText} style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4, color: D.textPrimary }}>Click to upload CSV or Excel</div>
                  <div style={{ fontSize: '0.75rem', color: D.textMuted }}>Columns required: name, phone, email</div>
                </div>
              ) : (
                <div style={{ background: D.greenSoft, border: `1px solid rgba(16,185,129,0.25)`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileSpreadsheet size={20} color={D.green} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: D.textPrimary }}>{csvFileName}</div>
                      <div style={{ fontSize: '0.72rem', color: D.greenText }}>{csvUsers.length} users loaded</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setCsvUsers([]); setCsvFileName(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: D.red }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Manual entry */}
          {inputMode === 'manual' && (
            <div>
              <label style={labelStyle}>Enter Recipients Manually</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                {manualUsers.map((u, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 6 }}>
                    {iconFields.map(({ field, ph, Icon: IconComp }) => (
                      <div key={field} style={{ position: 'relative' }}>
                        <IconComp size={11} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: D.textDim }} />
                        <input
                          placeholder={ph}
                          value={(u as any)[field] || ''}
                          onChange={e => updateManualRow(idx, field, e.target.value)}
                          style={{ ...darkInput }}
                          onFocus={e => (e.currentTarget.style.borderColor = D.purple)}
                          onBlur={e => (e.currentTarget.style.borderColor = D.border)}
                        />
                      </div>
                    ))}
                    <button onClick={() => removeManualRow(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: D.red, padding: '0 4px' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addManualRow}
                style={{ marginTop: 8, width: '100%', padding: 8, borderRadius: 8, border: `1.5px dashed ${D.border}`, background: 'transparent', color: D.purpleText, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              >
                + Add Row
              </button>
            </div>
          )}

          {/* Message textarea */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Message Content</label>
              <span style={{ fontSize: '0.7rem', color: D.textDim, fontWeight: 400 }}>
                Use {'{{name}}'} to personalize
              </span>
            </div>
            <textarea
              rows={activeTab === 'email' ? 7 : 5}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={
                activeTab === 'whatsapp' ? 'Hi {{name}}, your exclusive offer is ready...'
                : activeTab === 'email'  ? 'Dear {{name}},\n\nWe have something special for you...'
                : 'Hi {{name}}, check your email for full details!'
              }
              style={{
                width: '100%', boxSizing: 'border-box' as const,
                padding: '10px 14px', borderRadius: 10,
                border: `1px solid ${D.border}`, background: D.inputBg,
                color: D.textPrimary, fontSize: '0.85rem',
                resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = D.purple)}
              onBlur={e => (e.currentTarget.style.borderColor = D.border)}
            />
            <div style={{ fontSize: '0.7rem', color: D.textDim, textAlign: 'right', marginTop: 4 }}>
              {message.length} chars
            </div>
          </div>

          {/* AI Templates dropdown */}
          {showTemplates && (
            <div style={{ background: D.purpleSoft, border: `1px solid ${D.borderGlow}`, borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: D.purpleText, marginBottom: 2 }}>✨ AI Templates</div>
              {generatingTemplates ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 12px', color: D.textMuted }}>
                  <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '0.75rem' }}>Generating templates...</span>
                </div>
              ) : generatedTemplates.length > 0 ? (
                generatedTemplates.map((t, i) => (
                  <button
                    key={i}
                    className="msg-template-btn"
                    onClick={() => { setMessage(t); setShowTemplates(false); toast.success('Template applied!'); }}
                    style={{ textAlign: 'left', background: D.white004, border: `1px solid ${D.border}`, borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: '0.77rem', color: D.textMuted, lineHeight: 1.5, transition: 'background 0.15s' }}
                  >
                    {t.slice(0, 80)}...
                  </button>
                ))
              ) : (
                <div style={{ fontSize: '0.75rem', color: D.textDim, textAlign: 'center', padding: '8px 0' }}>Click "AI Write" to generate templates</div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleGenerateTemplates}
              disabled={generatingTemplates}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 16px', borderRadius: 10, border: `1px solid ${D.border}`, background: D.white004, color: D.textMuted, fontSize: '0.82rem', fontWeight: 600, cursor: generatingTemplates ? 'not-allowed' : 'pointer', opacity: generatingTemplates ? 0.6 : 1, transition: 'all 0.2s' }}
              onMouseEnter={e => { if (!generatingTemplates) { e.currentTarget.style.borderColor = D.purple; e.currentTarget.style.color = D.purpleText; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = D.border; e.currentTarget.style.color = D.textMuted; }}
            >
              {generatingTemplates ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={15} color={D.yellow} />}
              {generatingTemplates ? 'Generating...' : 'AI Write'}
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 16px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${D.purple}, #1e27a8)`, color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1, transition: 'opacity 0.2s' }}
            >
              {sending ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
              {sending ? 'Queueing...' : `Send to ${totalUsers > 0 ? totalUsers.toLocaleString() + ' users' : 'Recipients'}`}
            </button>
          </div>

          {/* Recipients preview pill */}
          {totalUsers > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: D.purpleSoft, borderRadius: 10, border: `1px solid ${D.borderGlow}` }}>
              <Radio size={14} color={D.purpleText} />
              <span style={{ fontSize: '0.78rem', color: D.purpleText, fontWeight: 600 }}>
                {totalUsers.toLocaleString()} recipients · {activeTab === 'both' ? 'WhatsApp + Email' : activeTab} broadcast
              </span>
            </div>
          )}
        </div>

        {/* ════ RIGHT: Broadcast History ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* History header + filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: D.textPrimary }}>
              <History size={18} color={D.purpleText} />
              Broadcast History
              <span style={{ fontSize: '0.72rem', background: D.purpleSoft, color: D.purpleText, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                {filteredLogs.length}
              </span>
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {filterButtons.map(btn => (
                <button
                  key={btn.key}
                  className="msg-filter-btn"
                  onClick={() => setLogFilter(btn.key)}
                  style={{
                    padding: '5px 10px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                    border: `1px solid ${logFilter === btn.key ? D.purple : D.border}`,
                    background: logFilter === btn.key ? D.purpleSoft : D.white004,
                    color: logFilter === btn.key ? D.purpleText : D.textMuted,
                    fontSize: '0.7rem', fontWeight: 600,
                  }}
                >
                  {btn.label}
                </button>
              ))}
              <button
                onClick={() => fetchLogs(logFilter)}
                disabled={loadingLogs}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: D.white004, border: `1px solid ${D.border}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: '0.75rem', color: D.textMuted, opacity: loadingLogs ? 0.6 : 1 }}
              >
                <RefreshCw size={12} style={{ animation: loadingLogs ? 'spin 1s linear infinite' : 'none' }} /> Refresh
              </button>
            </div>
          </div>

          {/* Log cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loadingLogs && logs.length === 0 ? (
              <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 16, textAlign: 'center', padding: '48px 24px', color: D.textMuted }}>
                <RefreshCw size={36} style={{ opacity: 0.3, marginBottom: 12, animation: 'spin 1s linear infinite' }} />
                <div style={{ fontWeight: 600 }}>Loading broadcast history...</div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 16, textAlign: 'center', padding: '48px 24px', color: D.textMuted }}>
                <MessageCircle size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                <div style={{ fontWeight: 600 }}>No broadcasts yet</div>
                <div style={{ fontSize: '0.82rem', marginTop: 4 }}>Send your first campaign to see delivery status here</div>
              </div>
            ) : filteredLogs.map(log => (
              <div key={log._id} style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 16, padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10, transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = D.borderGlow)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = D.border)}
              >
                {/* Top row: channel icon + message preview + status badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: log.channel === 'whatsapp' ? D.greenSoft : log.channel === 'email' ? D.purpleSoft : D.yellowSoft,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {log.channel === 'whatsapp' ? <Smartphone size={16} color={D.green} />
                      : log.channel === 'email' ? <Mail size={16} color={D.purpleText} />
                      : <Layers size={16} color={D.yellow} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.82rem', color: D.textPrimary }}>
                        {log.channel === 'both' ? 'WhatsApp + Email' : log.channel.charAt(0).toUpperCase() + log.channel.slice(1)}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: D.textDim, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={10} /> {formatDate(log.createdAt)}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: D.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.messageContent}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                    background: LOG_STATUS_BG[log.status] || 'rgba(148,163,184,0.10)',
                    padding: '4px 12px', borderRadius: 20,
                  }}>
                    {log.status === 'failed'
                      ? <AlertCircle size={13} color={LOG_STATUS_COLOR[log.status]} />
                      : <CheckCircle size={13} color={LOG_STATUS_COLOR[log.status]} />}
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize', color: LOG_STATUS_COLOR[log.status] }}>
                      {log.status}
                    </span>
                  </div>
                </div>

                {/* Bottom row: stats */}
                <div style={{ display: 'flex', gap: 16, paddingTop: 4, borderTop: `1px solid ${D.border}`, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={12} color={D.textMuted} />
                    <span style={{ fontSize: '0.72rem', color: D.textMuted }}>{log.totalRecipients} recipients</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle size={12} color={D.green} />
                    <span style={{ fontSize: '0.72rem', color: D.greenText, fontWeight: 600 }}>{log.successCount} success</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} color={D.red} />
                    <span style={{ fontSize: '0.72rem', color: D.red, fontWeight: 600 }}>{log.failedCount} failed</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color={D.textMuted} />
                    <span style={{ fontSize: '0.72rem', color: D.textMuted }}>{log.processedCount}/{log.totalRecipients} processed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CSV format guide card */}
          <div style={{ background: `linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(16,185,129,0.06) 100%)`, border: `1px solid ${D.borderGlow}`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <FileSpreadsheet size={22} color={D.purpleText} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 6, color: D.textPrimary }}>CSV Upload Format</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', background: D.purpleSoft, padding: '8px 12px', borderRadius: 8, color: D.textMuted, lineHeight: 1.8 }}>
                  name,phone,email<br />
                  Aditya,919999999999,aditya@gmail.com<br />
                  Sara,918888888888,sara@gmail.com
                </div>
                <div style={{ fontSize: '0.73rem', color: D.textDim, marginTop: 8 }}>
                  phone required for WhatsApp · email required for Email
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};