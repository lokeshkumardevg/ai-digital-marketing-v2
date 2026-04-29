import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GlassCard } from '../components/GlassCard';
import {
  MessageCircle, Mail, Send, CheckCircle, Users, Smartphone, Sparkles,
  Upload, X, Clock, AlertCircle, Zap, FileSpreadsheet,
  RefreshCw, Radio, AtSign, Phone, User, Layers, History,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { messageLogApi, type MessageLog } from '../../services/messageLogApi';

interface UserRow {
  name: string;
  phone?: string;
  email?: string;
}

type CampaignType = 'whatsapp' | 'email' | 'both';
type LogFilter = '5days' | '15days' | '30days' | 'all';

const LOG_STATUS_COLOR: Record<string, string> = {
  success: 'var(--success)',
  partial: '#f59e0b',
  failed: '#ef4444',
  pending: 'var(--text-secondary)',
};

const LOG_STATUS_BG: Record<string, string> = {
  success: 'rgba(16,185,129,0.10)',
  partial: 'rgba(245,158,11,0.10)',
  failed: 'rgba(239,68,68,0.10)',
  pending: 'rgba(148,163,184,0.10)',
};

const AI_TEMPLATES: Record<CampaignType, string[]> = {
  whatsapp: [
    "Hi {{name}}! Your exclusive offer is live — grab 20% off before midnight. Shop now!",
    "Hey {{name}}, your order has been shipped. Track it here: [link]. Questions? Reply anytime.",
    "{{name}}, we miss you! Come back — your wishlist items are back in stock.",
  ],
  email: [
    "Hi {{name}},\n\nWe have exciting news tailored just for you. Check out our latest campaign.\n\nBest,\nThe Wheedle Team",
    "Hello {{name}},\n\nYour subscription has been renewed. Here is a summary of your account activity.\n\nThank you!",
    "Dear {{name}},\n\nWe noticed you have not visited in a while. Log in today and see what is new!\n\nWarm regards,\nThe Team",
  ],
  both: [
    "Hi {{name}}! You have a special message waiting. Check your email for full details.",
    "Hey {{name}} — Big news! We just launched something incredible for you. Details in your inbox!",
  ],
};

const StatBadge = ({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '14px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
    <div style={{ width: 38, height: 38, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
};

export const Messaging: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CampaignType>('whatsapp');
  const [message, setMessage] = useState('');
  const [audiences, setAudiences] = useState<any[]>([]);
  const [selectedAudience, setSelectedAudience] = useState('');
  const [inputMode, setInputMode] = useState<'audience' | 'csv' | 'manual'>('csv');
  const [csvUsers, setCsvUsers] = useState<UserRow[]>([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [manualUsers, setManualUsers] = useState<UserRow[]>([{ name: '', phone: '', email: '' }]);
  const [sending, setSending] = useState(false);
  const [queuedCount, setQueuedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [logFilter, setLogFilter] = useState<LogFilter>('all');
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    import('../../api/axios').then(({ api }) => {
      api.get('/crm/audiences').then(res => {
        setAudiences(res.data || []);
        if (res.data?.length) setSelectedAudience(res.data[0]._id);
      }).catch(() => {});
    });
  }, []);

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

  useEffect(() => {
    fetchLogs(logFilter);
  }, [logFilter, fetchLogs]);

  const buildUsers = useCallback((): UserRow[] => {
    if (inputMode === 'csv') return csvUsers;
    if (inputMode === 'manual') return manualUsers.filter(u => u.name);
    return [{ name: 'Audience Segment', phone: '', email: '' }];
  }, [inputMode, csvUsers, manualUsers]);

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

  const updateManualRow = (idx: number, field: keyof UserRow, val: string) =>
    setManualUsers(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r));
  const addManualRow = () => setManualUsers(prev => [...prev, { name: '', phone: '', email: '' }]);
  const removeManualRow = (idx: number) => setManualUsers(prev => prev.filter((_, i) => i !== idx));

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

  const filteredLogs = logs.filter(m => activeTab === 'both' ? true : m.channel === activeTab);
  const totalUsers = inputMode === 'csv' ? csvUsers.length
    : inputMode === 'manual' ? manualUsers.filter(u => u.name).length
    : audiences.find(a => a._id === selectedAudience)?.estimatedSize || 0;

  const iconFields = [
    { field: 'name' as const, ph: 'Name', Icon: User },
    { field: 'phone' as const, ph: 'Phone', Icon: Phone },
    { field: 'email' as const, ph: 'Email', Icon: AtSign }
  ];

  const filterButtons: { key: LogFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: '5days', label: 'Last 5 Days' },
    { key: '15days', label: 'Last 15 Days' },
    { key: '30days', label: 'Last 30 Days' },
  ];

  return (
    <div style={{ paddingBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 700, marginBottom: 6 }}>
            Omni-Channel <span style={{ background: 'linear-gradient(135deg, var(--accent-primary), #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Messaging Hub</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Bulk broadcast via WhatsApp and Email - powered by Twilio and AI personalization
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <StatBadge icon={<Zap size={16} style={{ color: '#7C3AED' }} />} label="Queued" value={queuedCount} color="rgba(124,58,237,0.12)" />
          <StatBadge icon={<Users size={16} style={{ color: '#059669' }} />} label="Reached" value={queuedCount} color="rgba(5,150,105,0.12)" />
          <StatBadge icon={<AlertCircle size={16} style={{ color: '#f59e0b' }} />} label="Skipped" value={skippedCount} color="rgba(245,158,11,0.12)" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 380px) 1fr', gap: 24, alignItems: 'start' }}>

        <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: 4, borderRadius: 12, gap: 4 }}>
            {(['whatsapp', 'email', 'both'] as CampaignType[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 4px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s', background: activeTab === tab ? 'var(--accent-primary)' : 'transparent', color: activeTab === tab ? '#fff' : 'var(--text-secondary)' }}>
                {tab === 'whatsapp' && <Smartphone size={13} />}
                {tab === 'email' && <Mail size={13} />}
                {tab === 'both' && <Layers size={13} />}
                {tab === 'both' ? 'Both' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Recipients Source</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['csv', 'manual'] as const).map(mode => (
                <button key={mode} onClick={() => setInputMode(mode)} style={{ flex: 1, padding: '8px 4px', borderRadius: 8, cursor: 'pointer', border: `1.5px solid ${inputMode === mode ? 'var(--accent-primary)' : 'var(--glass-border)'}`, background: inputMode === mode ? 'rgba(124,58,237,0.07)' : '#fff', color: inputMode === mode ? 'var(--accent-primary)' : 'var(--text-secondary)', fontSize: '0.73rem', fontWeight: 600, transition: 'all 0.15s' }}>
                  {mode === 'csv' ? 'CSV' : 'Manual'}
                </button>
              ))}
            </div>
          </div>

          {inputMode === 'csv' && (
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
                Upload CSV / Excel
              </label>
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />
              {csvUsers.length === 0 ? (
                <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed var(--glass-border)', borderRadius: 12, padding: '28px 16px', textAlign: 'center', cursor: 'pointer', background: 'rgba(124,58,237,0.02)' }}>
                  <Upload size={28} style={{ color: 'var(--accent-primary)', marginBottom: 8 }} />
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>Click to upload CSV or Excel</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Columns required: name, phone, email</div>
                </div>
              ) : (
                <div style={{ background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileSpreadsheet size={20} style={{ color: '#059669' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{csvFileName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#059669' }}>{csvUsers.length} users loaded</div>
                    </div>
                  </div>
                  <button onClick={() => { setCsvUsers([]); setCsvFileName(''); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {inputMode === 'manual' && (
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
                Enter Recipients Manually
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                {manualUsers.map((u, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 6 }}>
                    {iconFields.map(({ field, ph, Icon: IconComp }) => (
                      <div key={field} style={{ position: 'relative' }}>
                        <IconComp size={11} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                          placeholder={ph}
                          value={(u as any)[field] || ''}
                          onChange={e => updateManualRow(idx, field, e.target.value)}
                          className="input-field"
                          style={{ padding: '8px 8px 8px 24px', fontSize: '0.76rem' }}
                        />
                      </div>
                    ))}
                    <button onClick={() => removeManualRow(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0 4px' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addManualRow} style={{ marginTop: 8, width: '100%', padding: 8, borderRadius: 8, border: '1.5px dashed var(--glass-border)', background: 'transparent', color: 'var(--accent-primary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                + Add Row
              </button>
            </div>
          )}

          <div className="input-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Message Content</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                Use {'{{name}}'} to personalize
              </span>
            </label>
            <textarea
              className="input-field"
              rows={activeTab === 'email' ? 7 : 5}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={activeTab === 'whatsapp' ? 'Hi {{name}}, your exclusive offer is ready...' : activeTab === 'email' ? 'Dear {{name}},\n\nWe have something special for you...' : 'Hi {{name}}, check your email for full details!'}
              style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
            />
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'right', marginTop: 4 }}>
              {message.length} chars
            </div>
          </div>

          {showTemplates && (
            <div style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 2 }}>AI Templates</div>
              {AI_TEMPLATES[activeTab].map((t, i) => (
                <button key={i} onClick={() => { setMessage(t); setShowTemplates(false); toast.success('Template applied!'); }} style={{ textAlign: 'left', background: '#fff', border: '1px solid var(--glass-border)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: '0.77rem', color: '#374151', lineHeight: 1.5 }}>
                  {t.slice(0, 80)}...
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }} onClick={() => setShowTemplates(s => !s)}>
              <Sparkles size={15} style={{ color: 'var(--warning)' }} /> AI Write
            </button>
            <button className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: sending ? 0.7 : 1 }} onClick={handleSend} disabled={sending}>
              {sending ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
              {sending ? 'Queueing...' : `Send to ${totalUsers > 0 ? totalUsers.toLocaleString() + ' users' : 'Recipients'}`}
            </button>
          </div>

          {totalUsers > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(124,58,237,0.05)', borderRadius: 10, border: '1px solid rgba(124,58,237,0.12)' }}>
              <Radio size={14} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                {totalUsers.toLocaleString()} recipients · {activeTab === 'both' ? 'WhatsApp + Email' : activeTab} broadcast
              </span>
            </div>
          )}
        </GlassCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <History size={18} style={{ color: 'var(--accent-primary)' }} />
              Broadcast History
              <span style={{ fontSize: '0.72rem', background: 'rgba(124,58,237,0.1)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{filteredLogs.length}</span>
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {filterButtons.map(btn => (
                <button
                  key={btn.key}
                  onClick={() => setLogFilter(btn.key)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 8,
                    border: '1px solid var(--glass-border)',
                    background: logFilter === btn.key ? 'rgba(124,58,237,0.08)' : '#fff',
                    color: logFilter === btn.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {btn.label}
                </button>
              ))}
              <button
                onClick={() => fetchLogs(logFilter)}
                disabled={loadingLogs}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  opacity: loadingLogs ? 0.6 : 1,
                }}
              >
                <RefreshCw size={12} style={{ animation: loadingLogs ? 'spin 1s linear infinite' : 'none' }} /> Refresh
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loadingLogs && logs.length === 0 ? (
              <GlassCard style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
                <RefreshCw size={36} style={{ opacity: 0.3, marginBottom: 12, animation: 'spin 1s linear infinite' }} />
                <div style={{ fontWeight: 600 }}>Loading broadcast history...</div>
              </GlassCard>
            ) : filteredLogs.length === 0 ? (
              <GlassCard style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
                <MessageCircle size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                <div style={{ fontWeight: 600 }}>No broadcasts yet</div>
                <div style={{ fontSize: '0.82rem', marginTop: 4 }}>Send your first campaign to see delivery status here</div>
              </GlassCard>
            ) : filteredLogs.map(log => (
              <GlassCard key={log._id} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: log.channel === 'whatsapp' ? 'rgba(5,150,105,0.1)' : log.channel === 'email' ? 'rgba(124,58,237,0.1)' : 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {log.channel === 'whatsapp' ? <Smartphone size={16} style={{ color: '#059669' }} /> : log.channel === 'email' ? <Mail size={16} style={{ color: '#7C3AED' }} /> : <Layers size={16} style={{ color: '#f59e0b' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#111' }}>{log.channel === 'both' ? 'WhatsApp + Email' : log.channel.charAt(0).toUpperCase() + log.channel.slice(1)}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={10} /> {formatDate(log.createdAt)}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.messageContent}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, background: LOG_STATUS_BG[log.status] || 'rgba(148,163,184,0.1)', padding: '4px 12px', borderRadius: 20 }}>
                    {log.status === 'failed' ? <AlertCircle size={13} style={{ color: LOG_STATUS_COLOR[log.status] }} /> : <CheckCircle size={13} style={{ color: LOG_STATUS_COLOR[log.status] }} />}
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize', color: LOG_STATUS_COLOR[log.status] }}>{log.status}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16, paddingTop: 4, borderTop: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={12} style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{log.totalRecipients} recipients</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle size={12} style={{ color: '#059669' }} />
                    <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>{log.successCount} success</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} style={{ color: '#ef4444' }} />
                    <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 600 }}>{log.failedCount} failed</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{log.processedCount}/{log.totalRecipients} processed</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          <GlassCard style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.04) 0%, rgba(5,150,105,0.04) 100%)', border: '1px solid rgba(124,58,237,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <FileSpreadsheet size={22} style={{ color: 'var(--accent-primary)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>CSV Upload Format</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', background: 'rgba(124,58,237,0.06)', padding: '8px 12px', borderRadius: 8, color: '#374151', lineHeight: 1.8 }}>
                  name,phone,email<br />
                  Aditya,919999999999,aditya@gmail.com<br />
                  Sara,918888888888,sara@gmail.com
                </div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                  phone required for WhatsApp · email required for Email
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

