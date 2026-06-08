// ─── CustomersPage.tsx ───────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Upload, UserPlus, Users, Mail, Phone, Send, Trash2, CheckCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { GlassCard } from '../components/GlassCard';
import { type Customer, SOURCE_META } from '../components/Reviewhelpers';
import {
  fetchCustomers,
  addCustomer,
  importCustomersCSV,
  sendReviewRequest,
  deleteCustomer,
} from '../../store/slices/Reputationslice';
import type { AppDispatch, RootState } from '../../store';

const CustomersPage: React.FC = () => {
  const dispatch     = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const customers = useSelector((s: RootState) => {
    const val = s.reputation.customers;
    return Array.isArray(val) ? val : [];
  });
  const customersLoad     = useSelector((s: RootState) => s.reputation.customersLoad);
  const addCustomerLoad   = useSelector((s: RootState) => s.reputation.addCustomerLoad);
  const importLoad        = useSelector((s: RootState) => s.reputation.importCustomersLoad);
  const sendRequestStatus = useSelector((s: RootState) => s.reputation.sendRequestStatus);

  const loadingList = customersLoad.status === 'loading' || customersLoad.status === 'idle';
  const listError   = customersLoad.error;
  const submitting  = addCustomerLoad.status === 'loading';
  const importing   = importLoad.status === 'loading';

  const [search, setSearch]           = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '', email: '', phone: '', source: 'Manual' as Customer['source'],
  });

  useEffect(() => { dispatch(fetchCustomers()); }, [dispatch]);

  useEffect(() => {
    if (addCustomerLoad.status === 'succeeded') {
      setShowAddForm(false);
      setNewCustomer({ name: '', email: '', phone: '', source: 'Manual' });
    }
  }, [addCustomerLoad.status]);

  const filtered = customers.filter((c: Customer) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const requestedCount = customers.filter((c: Customer) => c.status === 'Requested').length;
  const pendingCount   = customers.filter((c: Customer) => c.status === 'Not sent').length;

  const handleAdd = async () => {
    if (!newCustomer.email) { toast.error('Email is required'); return; }
    const result = await dispatch(addCustomer({ ...newCustomer, status: 'Not sent' }));
    if (addCustomer.fulfilled.match(result)) {
      toast.success('Customer added!');
    } else {
      toast.error((result.payload as string) || 'Failed to add customer');
    }
  };

  const handleSendRequest = async (id: string) => {
    const result = await dispatch(sendReviewRequest(id));
    if (sendReviewRequest.fulfilled.match(result)) {
      toast.success('Review request sent!');
    } else {
      toast.error((result.payload as string) || 'Failed to send request');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await dispatch(deleteCustomer(id));
    if (deleteCustomer.fulfilled.match(result)) {
      toast.success('Customer deleted!');
    } else {
      toast.error((result.payload as string) || 'Failed to delete customer');
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = '';
    const formData = new FormData();
    formData.append('file', file);
    const result = await dispatch(importCustomersCSV(formData));
    if (importCustomersCSV.fulfilled.match(result)) {
      dispatch(fetchCustomers());
      const imported = (result.payload as any)?.imported ?? '?';
      toast.success(`Imported ${imported} customer${imported !== 1 ? 's' : ''}!`);
    } else {
      toast.error((result.payload as string) || 'CSV import failed');
    }
  };

  const handleRetry = () => dispatch(fetchCustomers());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: 'clamp(14px, 2.5vw, 24px)' }}>

      {/* ── Error banner ── */}
      {listError && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠</span>
          <span>{listError}</span>
          <button onClick={handleRetry} style={{ marginLeft: 'auto', background: 'none', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', padding: '3px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
            Retry
          </button>
        </div>
      )}

      {/* ── Header row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { label: loadingList ? '— Total'     : `${customers.length} Total`,   color: '#7033f5', bg: 'rgba(112,51,245,0.1)' },
            { label: loadingList ? '— Requested' : `${requestedCount} Requested`, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { label: loadingList ? '— Pending'   : `${pendingCount} Pending`,     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, color: s.color, padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
              {s.label}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImportCSV} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 16px', fontSize: '0.82rem', cursor: importing ? 'not-allowed' : 'pointer', opacity: importing ? 0.7 : 1 }}
          >
            {importing ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={14} />}
            {importing ? 'Importing…' : 'Import CSV'}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: '10px', padding: '9px 18px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <UserPlus size={14} /> Add Customer
          </button>
        </div>
      </div>

      {/* ── Add Customer Form ── */}
      {showAddForm && (
        <GlassCard style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 600 }}>Add New Customer</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
            {[
              { key: 'name',  placeholder: 'Full Name',     icon: Users },
              { key: 'email', placeholder: 'Email Address', icon: Mail },
              { key: 'phone', placeholder: 'Phone Number',  icon: Phone },
            ].map(f => {
              const Icon = f.icon;
              return (
                <div key={f.key} style={{ position: 'relative' }}>
                  <Icon size={13} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                  <input
                    placeholder={f.placeholder}
                    value={(newCustomer as any)[f.key]}
                    onChange={e => setNewCustomer(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '32px', paddingRight: '12px', height: '38px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e5e7eb', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>
              );
            })}
            <select
              value={newCustomer.source}
              onChange={e => setNewCustomer(prev => ({ ...prev, source: e.target.value as Customer['source'] }))}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e5e7eb', padding: '0 12px', height: '38px', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="Manual"  style={{ background: '#0f172a' }}>Manual</option>
              <option value="Csv"     style={{ background: '#0f172a' }}>CSV Import</option>
              <option value="Shopify" style={{ background: '#0f172a' }}>Shopify</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setShowAddForm(false); setNewCustomer({ name: '', email: '', phone: '', source: 'Manual' }); }}
              disabled={submitting}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-secondary)', padding: '8px 18px', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={submitting}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '0.82rem', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting && <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />}
              {submitting ? 'Adding…' : 'Add Customer'}
            </button>
          </div>
        </GlassCard>
      )}

      {/* ── Search ── */}
      <div style={{ position: 'relative', maxWidth: '360px' }}>
        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
        <input
          placeholder="Search customers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '36px', paddingRight: '12px', height: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#e5e7eb', fontSize: '0.82rem', outline: 'none' }}
        />
      </div>

      {/* ── Table ── */}
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
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
              : filtered.map((customer: Customer, idx: number) => {
                  const isSending = sendRequestStatus[customer._id] === 'loading';
                  return (
                    <tr
                      key={customer._id}
                      style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s ease' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 500 }}>
                        {customer.name}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{customer.email}</td>
                      <td style={{ padding: '14px 20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{customer.phone}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ display: 'inline-block', background: SOURCE_META[customer.source]?.bg || 'rgba(107,114,128,0.12)', color: SOURCE_META[customer.source]?.color || '#6b7280', padding: '3px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                          {customer.source}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: customer.requestSent ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.1)', color: customer.requestSent ? '#10b981' : '#9ca3af', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                          {customer.requestSent && <CheckCircle size={11} />}
                          {customer.requestSent ? 'Requested' : 'Not sent'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {!customer.requestSent && (
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
                            <Trash2 size={13} />
                            Delete
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

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default CustomersPage;