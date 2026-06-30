// @ts-nocheck
// ─── CustomersPage.tsx ───────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import { Search, Upload, Users, Send, Trash2, CheckCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { GlassCard } from '../components/GlassCard';
import { type Customer, SOURCE_META } from '../components/Reviewhelpers';
import {
  fetchCustomers,
  createLeadsBulk,
  sendReviewRequest,
  deleteCustomer,
} from '../../store/slices/Reputationslice';
import type { AppDispatch, RootState } from '../../store';

// ─────────────────────────────────────────────────────────────
// 1.  Column-name aliases  (case-insensitive, trims spaces)
// ─────────────────────────────────────────────────────────────
const COL_ALIAS: Record<string, string> = {
  name:            'name',
  firstname:       '__fname__',
  first_name:      '__fname__',
  'first name':    '__fname__',
  lastname:        '__lname__',
  last_name:       '__lname__',
  'last name':     '__lname__',
  email:           'email',
  'email address': 'email',
  phone:           'phone',
  'phone number':  'phone',
  mobile:          'phone',
  telephone:       'phone',
  source:          'source',
  brandid:         'brandId',
  brand_id:        'brandId',
  brand:           'brandId',
};

interface ParsedRow {
  name:    string;
  email:   string;
  phone:   string;
  brandId: string;
  source:  string;
  _error?: string;
}

function normalise(h: string): string {
  return COL_ALIAS[h.toLowerCase().trim()] ?? h.toLowerCase().trim();
}

function parseWorkbook(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload  = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb   = XLSX.read(data, { type: 'array' });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const raw: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        const rows: ParsedRow[] = raw.map((row) => {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(row)) {
            mapped[normalise(k)] = String(v).trim();
          }

          // merge first+last into name if no dedicated name column
          const name = mapped['name']
            || `${mapped['__fname__'] || ''} ${mapped['__lname__'] || ''}`.trim()
            || '';

          const parsed: ParsedRow = {
            name,
            email:   mapped['email']   || '',
            phone:   mapped['phone']   || '',
            source:  mapped['source']  || 'csv',
            brandId: mapped['brandId'] || '',
          };

          // inline validation
          if (!parsed.name)                                           parsed._error = 'Missing name';
          else if (!parsed.email)                                     parsed._error = 'Missing email';
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.email)) parsed._error = 'Invalid email';

          return parsed;
        });

        resolve(rows);
      } catch (err) {
        reject(new Error('Failed to parse file – check it is a valid CSV / XLS / XLSX'));
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const CustomersPage: React.FC = () => {
  const dispatch     = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const customers = useSelector((s: RootState) => {
    const val = s.reputation.customers;
    return Array.isArray(val) ? val : [];
  });
  const customersLoad     = useSelector((s: RootState) => s.reputation.customersLoad);
  const sendRequestStatus = useSelector((s: RootState) => s.reputation.sendRequestStatus);

  const { activeBrandId } = useSelector((s: any) => s.workspace);

  const loadingList = customersLoad.status === 'loading' || customersLoad.status === 'idle';
  const listError   = customersLoad.error;

  // ── Import modal state ──────────────────────────────────────
  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
  const [previewFile, setPreviewFile] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [importing,   setImporting]   = useState(false);
  const [importDone,  setImportDone]  = useState<{ ok: number; fail: number } | null>(null);

  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchCustomers({ brandId: activeBrandId }));
  }, [dispatch, activeBrandId]);

  const filtered = customers.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const requestedCount = customers.filter((c: any) =>
    c.reviewStatus === 'sent' || c.reviewStatus === 'completed'
  ).length;
  const pendingCount = customers.filter((c: any) =>
    c.reviewStatus === 'pending'
  ).length;

  // ── Handlers ────────────────────────────────────────────────
  const handleSendRequest = async (id: string) => {
    const result = await dispatch(sendReviewRequest(id));
    if (sendReviewRequest.fulfilled.match(result)) {
      toast.success('Review request sent!');
    } else {
      toast.error((result.payload as string) || 'Failed to send request');
    }
  };

  // ✅ passes both id and brandId so DELETE /reputation/customers/:id?brandId=xxx works
  const handleDelete = async (id: string) => {
    if (!id) { toast.error('Invalid customer'); return; }
    const result = await dispatch(deleteCustomer({ id, brandId: activeBrandId }));
    if (deleteCustomer.fulfilled.match(result)) {
      toast.success('Customer deleted!');
      dispatch(fetchCustomers({ brandId: activeBrandId }));
    } else {
      toast.error((result.payload as string) || 'Failed to delete customer');
    }
  };

  // Step 1 – parse file → show preview modal
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file) return;

    try {
      const rows = await parseWorkbook(file);
      if (rows.length === 0) { toast.error('No rows found in file'); return; }
      setPreviewRows(rows);
      setPreviewFile(file.name);
      setImportDone(null);
      setShowPreview(true);
    } catch (err: any) {
      toast.error(err.message ?? 'Could not parse file');
    }
  };

  // Step 2 – send ALL valid rows in one API call via bulk endpoint
  const handleConfirmImport = async () => {
    const valid = previewRows.filter(r => !r._error);
    if (!valid.length) { toast.error('No valid rows to import'); return; }

    setImporting(true);

    const leads = valid.map(row => ({
      brandId: row.brandId || activeBrandId,
      name:    row.name,
      email:   row.email,
      phone:   row.phone  || undefined,
      source:  row.source || 'csv',
    }));

    const result = await dispatch(createLeadsBulk(leads as any));

    setImporting(false);

    if (createLeadsBulk.fulfilled.match(result)) {
      const ok   = result.payload.inserted ?? valid.length;
      const fail = valid.length - ok;
      setImportDone({ ok, fail });
      dispatch(fetchCustomers({ brandId: activeBrandId }));
      if (ok)   toast.success(`${ok} customer${ok !== 1 ? 's' : ''} imported!`);
      if (fail) toast.error(`${fail} row${fail !== 1 ? 's' : ''} failed`);
    } else {
      const msg = (result.payload as string) || 'Bulk import failed';
      setImportDone({ ok: 0, fail: valid.length });
      toast.error(msg);
    }
  };

  const closePreview = () => { setShowPreview(false); setPreviewRows([]); setImportDone(null); };

  const validCount   = previewRows.filter(r => !r._error).length;
  const invalidCount = previewRows.length - validCount;

  const handleRetry = () => dispatch(fetchCustomers({ brandId: activeBrandId }));

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: 'clamp(14px, 2.5vw, 24px)' }}>

      {/* ── Error banner ── */}
      {listError && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠</span><span>{listError}</span>
          <button onClick={handleRetry} style={{ marginLeft: 'auto', background: 'none', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', padding: '3px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Retry</button>
        </div>
      )}

      {/* ── Header row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: loadingList ? '— Total'     : `${customers.length} Total`,   color: '#7033f5', bg: 'rgba(112,51,245,0.1)' },
            { label: loadingList ? '— Requested' : `${requestedCount} Requested`, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { label: loadingList ? '— Pending'   : `${pendingCount} Pending`,     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, color: s.color, padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>{s.label}</div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {/* hidden file input */}
          <input ref={fileInputRef} type="file" accept=".csv,.xls,.xlsx" style={{ display: 'none' }} onChange={handleFileChange} />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '9px 16px', fontSize: '0.82rem', cursor: 'pointer' }}
          >
            <Upload size={14} />
            Import CSV / XLS
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div style={{ position: 'relative', maxWidth: '360px' }}>
        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
        <input
          placeholder="Search customers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '36px', paddingRight: '12px', height: '40px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: '#e5e7eb', fontSize: '0.82rem', outline: 'none' }}
        />
      </div>

      {/* ── Table ── */}
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              {['Name', 'Email', 'Phone', 'Source', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loadingList
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} style={{ padding: '14px 20px' }}>
                        <div style={{ height: '16px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite', width: j === 0 ? '120px' : j === 5 ? '80px' : '90px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              : filtered.map((customer: any, idx: number) => {
                  const isSending = sendRequestStatus[customer._id] === 'loading';
                  return (
                    <tr
                      key={customer._id}
                      style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s ease' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 500 }}>{customer.name}</td>
                      <td style={{ padding: '14px 20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{customer.email}</td>
                      <td style={{ padding: '14px 20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{customer.phone}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ display: 'inline-block', background: SOURCE_META[customer.source]?.bg || 'rgba(107,114,128,0.12)', color: SOURCE_META[customer.source]?.color || '#6b7280', padding: '3px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                          {customer.source}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          background: customer.reviewStatus !== 'pending' ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.1)',
                          color:      customer.reviewStatus !== 'pending' ? '#10b981' : '#9ca3af',
                          padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                        }}>
                          {customer.reviewStatus !== 'pending' && <CheckCircle size={11} />}
                          {customer.reviewStatus === 'sent'
                            ? 'Requested'
                            : customer.reviewStatus === 'completed'
                            ? 'Completed'
                            : 'Not sent'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {customer.reviewStatus === 'pending' && (
                            <button
                              onClick={() => handleSendRequest(customer._id)}
                              disabled={isSending}
                              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: isSending ? '#818cf8' : '#6366f1', fontSize: '0.82rem', fontWeight: 600, cursor: isSending ? 'not-allowed' : 'pointer', padding: 0 }}
                            >
                              {isSending ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
                              {isSending ? 'Sending…' : 'Send Request'}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(customer._id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#ef4444', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                          >
                            <Trash2 size={13} />Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>

        {!loadingList && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-secondary)' }}>
            <Users size={40} style={{ marginBottom: '12px', opacity: 0.2 }} />
            <p style={{ fontSize: '0.85rem' }}>{search ? 'No customers match your search' : 'No customers yet'}</p>
          </div>
        )}
      </GlassCard>

      {/* ══════════════════════════════════════════════════════
          Import Preview Modal
      ══════════════════════════════════════════════════════ */}
      {showPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#13111e', border: '1px solid var(--glass-border)', borderRadius: '16px', width: '100%', maxWidth: '780px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Modal header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f3f4f6' }}>Import Preview</h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#6b7280' }}>{previewFile}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>✓ {validCount} valid</span>
                {invalidCount > 0 && <span style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>✗ {invalidCount} invalid</span>}
                <button onClick={closePreview} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '1.2rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
              </div>
            </div>

            {/* Table scroll area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#13111e', zIndex: 1 }}>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    {['#', 'Name', 'Email', 'Phone', 'Source', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: row._error ? 'rgba(239,68,68,0.05)' : 'transparent' }}>
                      <td style={{ padding: '9px 14px', color: '#6b7280' }}>{i + 1}</td>
                      <td style={{ padding: '9px 14px', color: row.name ? '#e5e7eb' : '#ef4444' }}>
                        {row.name || <em style={{ opacity: 0.5 }}>—</em>}
                      </td>
                      <td style={{ padding: '9px 14px', color: row.email ? '#e5e7eb' : '#ef4444' }}>
                        {row.email || <em style={{ opacity: 0.5 }}>—</em>}
                      </td>
                      <td style={{ padding: '9px 14px', color: '#9ca3af' }}>{row.phone  || '—'}</td>
                      <td style={{ padding: '9px 14px', color: '#9ca3af' }}>{row.source || '—'}</td>
                      <td style={{ padding: '9px 14px' }}>
                        {row._error
                          ? <span style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>✗ {row._error}</span>
                          : <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>✓ Ready</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {importDone
                ? <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>✓ Done — {importDone.ok} saved{importDone.fail ? `, ${importDone.fail} failed` : ''}</span>
                : <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>{invalidCount > 0 ? `${invalidCount} row${invalidCount !== 1 ? 's' : ''} will be skipped` : 'All rows are valid'}</span>
              }
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={closePreview} style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', color: '#9ca3af', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem' }}>
                  {importDone ? 'Close' : 'Cancel'}
                </button>
                {!importDone && (
                  <button
                    onClick={handleConfirmImport}
                    disabled={importing || validCount === 0}
                    style={{ background: importing || validCount === 0 ? 'rgba(99,102,241,0.4)' : '#0062ff', color: 'var(--text-primary)', border: 'none', padding: '9px 20px', borderRadius: '8px', cursor: importing || validCount === 0 ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {importing
                      ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Importing…</>
                      : `Import ${validCount} Lead${validCount !== 1 ? 's' : ''}`
                    }
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default CustomersPage;