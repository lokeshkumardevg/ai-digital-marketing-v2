// ─── CustomersPage.tsx ───────────────────────────────────────
// Route: /reviews/customers
//
// Manage customers, send review requests, import CSV, add manually.

import React, { useState } from 'react';
import { Search, Upload, UserPlus, Users, Mail, Phone, Send, Trash2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { GlassCard } from '../components/GlassCard';
import { type Customer, SOURCE_META } from '../components/Reviewhelpers';

// ─── Sample seed data ─────────────────────────────────────────
const SAMPLE_CUSTOMERS: Customer[] = [
  { id: '1', name: 'John Smith',    email: 'john.smith@example.com',    phone: '+1 555-123-4567', source: 'Csv',     status: 'Requested', createdAt: new Date().toISOString() },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@example.com', phone: '+1 555-987-6543', source: 'Manual',  status: 'Not sent',  createdAt: new Date().toISOString() },
  { id: '3', name: 'Michael Brown', email: 'michael.brown@example.com', phone: '+1 555-456-7890', source: 'Shopify', status: 'Requested', createdAt: new Date().toISOString() },
  { id: '4', name: 'Emily Davis',   email: 'emily.davis@example.com',   phone: '+1 555-321-9876', source: 'Csv',     status: 'Not sent',  createdAt: new Date().toISOString() },
  { id: '5', name: 'David Wilson',  email: 'david.wilson@example.com',  phone: '+1 555-741-8520', source: 'Manual',  status: 'Requested', createdAt: new Date().toISOString() },
];

// ─── Component ────────────────────────────────────────────────
const CustomersPage: React.FC = () => {
  const [customers, setCustomers]     = useState<Customer[]>(SAMPLE_CUSTOMERS);
  const [search, setSearch]           = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '', email: '', phone: '', source: 'Manual' as Customer['source'],
  });

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newCustomer.email) { toast.error('Email is required'); return; }
    setCustomers(prev => [...prev, {
      id: Date.now().toString(),
      ...newCustomer,
      status: 'Not sent',
      createdAt: new Date().toISOString(),
    }]);
    setNewCustomer({ name: '', email: '', phone: '', source: 'Manual' });
    setShowAddForm(false);
    toast.success('Customer added!');
  };

  const handleDelete = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    toast.success('Customer removed');
  };

  const handleSendRequest = (id: string) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: 'Requested' } : c));
    toast.success('Review request sent!');
  };

  const requestedCount = customers.filter(c => c.status === 'Requested').length;
  const pendingCount   = customers.filter(c => c.status === 'Not sent').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px',padding: 'clamp(14px, 2.5vw, 24px)' }}>

      {/* ── Header row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { label: `${customers.length} Total`,   color: '#7033f5', bg: 'rgba(112,51,245,0.1)' },
            { label: `${requestedCount} Requested`, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { label: `${pendingCount} Pending`,     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, color: s.color, padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
              {s.label}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 16px', fontSize: '0.82rem', cursor: 'pointer' }}>
            <Upload size={14} /> Import CSV
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
              onClick={() => setShowAddForm(false)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-secondary)', padding: '8px 18px', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              style={{ background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Add Customer
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
            {filtered.map((customer, idx) => (
              <tr
                key={customer.id}
                style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s ease' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>
                      {customer.name.charAt(0)}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{customer.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{customer.email}</td>
                <td style={{ padding: '14px 20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{customer.phone}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ display: 'inline-block', background: SOURCE_META[customer.source]?.bg || 'rgba(107,114,128,0.12)', color: SOURCE_META[customer.source]?.color || '#6b7280', padding: '3px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {customer.source}
                  </span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: customer.status === 'Requested' ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.1)', color: customer.status === 'Requested' ? '#10b981' : '#9ca3af', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {customer.status === 'Requested' && <CheckCircle size={11} />}
                    {customer.status}
                  </span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {customer.status === 'Not sent' && (
                      <button
                        onClick={() => handleSendRequest(customer.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#6366f1', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                      >
                        <Send size={13} /> Send Request
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(customer.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#ef4444', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-secondary)' }}>
            <Users size={40} style={{ marginBottom: '12px', opacity: 0.2 }} />
            <p style={{ fontSize: '0.85rem' }}>No customers found</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default CustomersPage;