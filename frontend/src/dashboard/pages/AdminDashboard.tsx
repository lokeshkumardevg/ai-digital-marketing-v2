import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { useAppDispatch } from '../../store/hooks';
import { setActiveWebsite, upsertBrandLocally } from '../../store/slices/workspaceSlice';
import { impersonateUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import {
  Users,
  Megaphone,
  Globe,
  Wallet,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Loader
} from 'lucide-react';

const D = {
  bg: '#0a0f1e',
  surface: '#0f1629',
  surfaceAlt: '#141d35',
  border: 'rgba(99,102,241,0.18)',
  borderGlow: 'rgba(112,51,245,0.35)',
  purple: '#0665ff',
  purpleSoft: 'rgba(124,58,237,0.15)',
  purpleText: '#a78bfa',
  green: '#10b981',
  greenSoft: 'rgba(16,185,129,0.15)',
  greenText: '#34d399',
  red: '#ef4444',
  textPrimary: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await api.get('/users/admin/dashboard-stats');
      setData(response.data);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Failed to load Admin stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStats();
  }, []);

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    setUpdatingUserId(userId);
    try {
      await api.patch(`/users/${userId}`, { isActive: !currentStatus });
      toast.success('User status updated successfully.');
      await fetchStats();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    try {
      await api.patch(`/users/${userId}`, { role: newRole });
      toast.success(`User role updated to ${newRole}.`);
      await fetchStats();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update role.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleViewClientDashboard = (client: any) => {
    if (client.brands && client.brands.length > 0) {
      const brand = client.brands[0];
      
      // 1. Impersonate the client user in store/localStorage
      dispatch(impersonateUser(client));

      // 2. Upsert brand configuration locally into state
      dispatch(upsertBrandLocally({
        id: brand.id,
        name: brand.name,
        url: brand.url,
        userId: client._id,
        status: 'active',
        overallScore: 0,
      }));

      // 3. Switch active website selection to this brand
      dispatch(setActiveWebsite(brand.id));
      toast.success(`Switched active context to: ${brand.name}`);
      navigate('/campaigns');
    } else {
      toast.error('This client does not have any active brand/website profiles.');
    }
  };

  if (loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: D.textPrimary }}>
        <Loader className="animate-spin" size={36} color="var(--accent-primary)" />
        <span style={{ marginTop: 12, fontSize: '0.9rem', color: D.textMuted }}>Loading aggregated marketing data...</span>
      </div>
    );
  }

  const stats = data?.stats || {};
  const statusBreakdown = data?.statusBreakdown || {};
  const platformBreakdown = data?.platformBreakdown || {};
  const clients = data?.clients || [];

  // Filter clients list
  const filteredClients = clients.filter((c: any) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || c.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? c.isActive : !c.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div style={{ padding: '24px', background: D.bg, minHeight: '100vh', color: D.textPrimary, fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', fontFamily: 'Outfit' }}>Admin Portal</h1>
          <p style={{ color: D.textMuted, fontSize: '0.85rem', marginTop: '4px' }}>System-wide client statistics, active campaigns, and tenant management.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => void fetchStats()} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${D.border}`, borderRadius: '10px', padding: '8px 16px', color: D.textPrimary, cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', transition: '0.2s' }}>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '32px' }}>
        
        {/* Total Users */}
        <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(6, 101, 255, 0.1)', color: D.purple }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: D.textMuted, fontWeight: 500 }}>Total Clients</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '2px' }}>{stats.totalUsers || 0}</div>
          </div>
        </div>

        {/* Active Users */}
        <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: `${D.greenSoft}`, color: D.greenText }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: D.textMuted, fontWeight: 500 }}>Active Accounts</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '2px', color: D.greenText }}>{stats.activeUsers || 0}</div>
          </div>
        </div>

        {/* Total Campaigns */}
        <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(167, 139, 250, 0.1)', color: D.purpleText }}>
            <Megaphone size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: D.textMuted, fontWeight: 500 }}>Total Campaigns</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '2px' }}>{stats.totalCampaigns || 0}</div>
          </div>
        </div>

        {/* Total Brands */}
        <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(34, 194, 238, 0.1)', color: '#22c2ee' }}>
            <Globe size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: D.textMuted, fontWeight: 500 }}>Active Brands</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '2px' }}>{stats.totalBrands || 0}</div>
          </div>
        </div>

        {/* Combined Wallet */}
        <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Wallet size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: D.textMuted, fontWeight: 500 }}>Combined Wallet</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '2px', color: '#f59e0b' }}>
              ₹{stats.combinedWalletBalance?.toLocaleString() || '0.00'}
            </div>
          </div>
        </div>

      </div>

      {/* Breakdown Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Campaign Platform Distribution */}
        <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px 0', fontFamily: 'Outfit' }}>Campaigns by Platform</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(platformBreakdown).map(([platform, count]: [string, any]) => {
              const percentage = stats.totalCampaigns ? Math.round((count / stats.totalCampaigns) * 100) : 0;
              return (
                <div key={platform}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{platform}</span>
                    <span style={{ color: D.textMuted }}>{count} ({percentage}%)</span>
                  </div>
                  <div style={{ height: '8px', background: D.surfaceAlt, borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: platform === 'Meta' ? '#1877f2' : platform === 'Google' ? '#ea4335' : platform === 'X' ? '#1da1f2' : '#0077b5', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Campaign Status Breakdown */}
        <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px 0', fontFamily: 'Outfit' }}>Campaign Status Metrics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {Object.entries(statusBreakdown).map(([status, count]: [string, any]) => (
              <div key={status} style={{ background: D.surfaceAlt, border: `1px solid ${D.border}`, borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '0.72rem', color: D.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{status}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', color: status === 'ACTIVE' ? D.greenText : status === 'FAILED' ? D.red : D.textPrimary }}>
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Clients Overview Section */}
      <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: '20px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit' }}>Client Directory</h2>
          
          {/* Filters Group */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* Search Box */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: D.textMuted }}><Search size={15} /></span>
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ background: D.surfaceAlt, border: `1px solid ${D.border}`, borderRadius: '10px', padding: '8px 12px 8px 34px', color: D.textPrimary, fontSize: '0.82rem', outline: 'none', width: '220px', transition: '0.2s' }}
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              style={{ background: D.surfaceAlt, border: `1px solid ${D.border}`, borderRadius: '10px', padding: '8px 12px', color: D.textPrimary, fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">All Roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="client">Client</option>
              <option value="agency">Agency</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ background: D.surfaceAlt, border: `1px solid ${D.border}`, borderRadius: '10px', padding: '8px 12px', color: D.textPrimary, fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Suspended Only</option>
            </select>

          </div>
        </div>

        {/* Client Directory Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${D.border}`, color: D.textMuted }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Client Profile</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Account Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Wallet Balance</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Brands & Campaigns</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: D.textMuted }}>
                    No clients found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client: any) => (
                  <tr key={client._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    
                    {/* Profile */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, color: D.textPrimary }}>{client.name}</div>
                      <div style={{ color: D.textMuted, fontSize: '0.78rem', marginTop: '2px' }}>{client.email}</div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => handleToggleActive(client._id, client.isActive)}
                        disabled={updatingUserId !== null}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: updatingUserId ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: client.isActive ? D.greenText : D.textMuted,
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        {client.isActive ? <CheckCircle size={15} color={D.greenText} /> : <XCircle size={15} color={D.textMuted} />}
                        {client.isActive ? 'Active' : 'Suspended'}
                      </button>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '16px' }}>
                      <select
                        value={client.role}
                        onChange={e => handleRoleChange(client._id, e.target.value)}
                        disabled={updatingUserId !== null}
                        style={{
                          background: D.surfaceAlt,
                          border: `1px solid ${D.border}`,
                          borderRadius: '8px',
                          padding: '4px 8px',
                          color: D.textPrimary,
                          fontSize: '0.78rem',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="superadmin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="client">Client</option>
                        <option value="agency">Agency</option>
                      </select>
                    </td>

                    {/* Wallet Balance */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 700 }}>
                        {client.currency === 'INR' ? '₹' : '$'}{client.walletBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ color: D.textDim, fontSize: '0.72rem', textTransform: 'uppercase', marginTop: '1px' }}>{client.subscriptionTier || 'Free'} tier</div>
                    </td>

                    {/* Brands & Campaigns */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ background: 'rgba(6, 101, 255, 0.1)', color: D.purpleText, padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}>
                          {client.brandsCount || 0} Brands
                        </span>
                        <span style={{ background: 'rgba(167, 139, 250, 0.1)', color: D.purpleText, padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}>
                          {client.campaignsCount || 0} Campaigns
                        </span>
                      </div>
                      {client.brands && client.brands.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                          {client.brands.map((b: any) => (
                            <span key={b.id} style={{ fontSize: '0.7rem', color: D.textMuted, background: 'rgba(255,255,255,0.03)', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }} title={b.url}>
                              {b.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleViewClientDashboard(client)}
                        disabled={!client.brands || client.brands.length === 0}
                        style={{
                          background: client.brands && client.brands.length > 0 ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.03)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          color: client.brands && client.brands.length > 0 ? '#fff' : D.textDim,
                          cursor: client.brands && client.brands.length > 0 ? 'pointer' : 'not-allowed',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: client.brands && client.brands.length > 0 ? '0 4px 10px rgba(112,51,245,0.18)' : 'none',
                          transition: '0.2s'
                        }}
                      >
                        <Eye size={13} />
                        View Workspace
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
