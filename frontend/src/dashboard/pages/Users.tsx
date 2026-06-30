import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../api/axios';
import { SmartTable } from '../components/SmartTable';
import { Plus, Trash2, Edit2, CheckSquare, Square, X, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const PERMISSIONS = [
  { id: 'view_users', label: 'View Users' },
  { id: 'manage_users', label: 'Manage Users' },
];

const AVAILABLE_ROLES = [
  { id: 'superadmin', label: 'Super Admin' },
  { id: 'admin', label: 'Admin' },
  { id: 'client', label: 'Client' },
  { id: 'agency', label: 'Agency' },
];

const formatDate = (value: string) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

const sanitizePermissions = (permissions: string[] | undefined) => Array.isArray(permissions) ? permissions : [];

export const Users: React.FC = () => {
  const user = useSelector((state: any) => state.auth.user);
  const canManage = user?.permissions?.includes('*') || user?.permissions?.includes('manage_users') || user?.role === 'superadmin';
  const canView = user?.permissions?.includes('*') || user?.permissions?.includes('view_users') || user?.permissions?.includes('manage_users') || user?.role === 'superadmin';
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
    isActive: true,
    permissions: ['view_users'],
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get<any[]>('/users');
      setUsers(response.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canView) {
      loadUsers();
    }
  }, [canView]);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '', role: 'client', isActive: true, permissions: ['view_users'] });
    setShowModal(true);
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'client',
      isActive: user.isActive !== false,
      permissions: sanitizePermissions(user.permissions),
    });
    setShowModal(true);
  };

  const handleFormChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const togglePermission = (permission: string) => {
    setForm((prev) => {
      const has = prev.permissions.includes(permission);
      return {
        ...prev,
        permissions: has ? prev.permissions.filter((item) => item !== permission) : [...prev.permissions, permission],
      };
    });
  };

  const submitUser = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      return toast.error('Name and email are required.');
    }

    if (!editingUser && form.password.trim().length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }

    setSaving(true);
    try {
      if (editingUser) {
        const payload: any = {
          name: form.name,
          email: form.email,
          role: form.role,
          isActive: form.isActive,
          permissions: form.permissions,
        };
        if (form.password.trim()) {
          payload.password = form.password.trim();
        }
        await api.patch(`/users/${editingUser._id || editingUser.id}`, payload);
        toast.success('User updated successfully.');
      } else {
        await api.post('/users', {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          isActive: form.isActive,
          permissions: form.permissions,
        });
        toast.success('New user created successfully.');
      }
      setShowModal(false);
      loadUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to save user.');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((user) => user._id !== id && user.id !== id));
      toast.success('User removed.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to delete user.');
    }
  };

  const toggleActive = async (user: any) => {
    try {
      const payload = { isActive: !user.isActive };
      await api.patch(`/users/${user._id || user.id}`, payload);
      setUsers((prev) => prev.map((item) => item._id === user._id || item.id === user.id ? { ...item, isActive: !item.isActive } : item));
      toast.success(`User ${user.isActive ? 'deactivated' : 'reactivated'}.`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to update user status.');
    }
  };

  if (!canView) {
    return (
      <div className="animate-fade-in" style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', background: 'rgba(15,23,42,0.95)', borderRadius: 24, border: '1px solid var(--glass-border)', padding: 32 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 12 }}>User Management</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            Your account does not have permission to view the Users section. Contact an administrator if you believe this is incorrect.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ padding: '10px 14px', borderRadius: 999, background: 'var(--bg-card)', color: '#cbd5e1' }}>Required permission: view_users</span>
            <span style={{ padding: '10px 14px', borderRadius: 999, background: 'rgba(59,130,246,0.12)', color: '#bfdbfe' }}>Manage users if granted: manage_users</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '18px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>User Management</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '640px' }}>
            Manage registered users, control who can view the Users section, and keep access locked down to SuperAdmin and approved managers.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: canManage ? '#0665ff' : 'rgba(148,163,184,0.15)', color: canManage ? '#fff' : '#94a3b8', border: 'none', padding: '12px 18px', borderRadius: 12, cursor: canManage ? 'pointer' : 'not-allowed' }}
          disabled={!canManage}
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      <SmartTable
        title="Registered Users"
        searchPlaceholder="Search users by name, email, or role..."
        data={users}
        columns={[
          {
            key: 'name',
            label: 'Name',
            sortable: true,
            render: (row) => <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>,
          },
          {
            key: 'email',
            label: 'Email',
            sortable: true,
            render: (row) => <div style={{ color: 'var(--text-secondary)' }}>{row.email}</div>,
          },
          {
            key: 'role',
            label: 'Role',
            render: (row) => (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                <ShieldAlert size={12} /> {row.role || 'client'}
              </span>
            ),
          },
          {
            key: 'isActive',
            label: 'Status',
            sortable: true,
            render: (row) => (
              <span style={{ padding: '6px 10px', borderRadius: 999, background: row.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(248,113,113,0.12)', color: row.isActive ? '#22c55e' : '#f87171', fontWeight: 600, fontSize: '0.8rem' }}>
                {row.isActive ? 'Active' : 'Inactive'}
              </span>
            ),
          },
          {
            key: 'createdAt',
            label: 'Created',
            sortable: true,
            render: (row) => <span style={{ color: 'var(--text-secondary)' }}>{formatDate(row.createdAt || row.createdAt)}</span>,
          },
          {
            key: 'permissions',
            label: 'Permissions',
            render: (row) => (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {sanitizePermissions(row.permissions).map((perm) => (
                  <span key={perm} style={{ padding: '4px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: '#d1d5db', fontSize: '0.75rem' }}>
                    {perm}
                  </span>
                ))}
                {sanitizePermissions(row.permissions).length === 0 && <span style={{ color: 'var(--text-dim)' }}>No special access</span>}
              </div>
            ),
          },
        ]}
        actions={(row) => (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              onClick={() => openEdit(row)}
              style={{ border: 'none', background: 'transparent', color: canManage ? '#94a3b8' : '#6b7280', cursor: canManage ? 'pointer' : 'not-allowed' }}
              disabled={!canManage}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => toggleActive(row)}
              style={{ border: 'none', background: 'transparent', color: row.isActive ? '#f87171' : '#22c55e', cursor: canManage ? 'pointer' : 'not-allowed' }}
              disabled={!canManage}
            >
              {/* {row.isActive ? 'Deactivate' : 'Activate'} */}
            </button>
            <button
              onClick={() => deleteUser(row._id || row.id)}
              style={{ border: 'none', background: 'transparent', color: '#f87171', cursor: canManage ? 'pointer' : 'not-allowed' }}
              disabled={!canManage}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      />

      {!canManage && (
        <div style={{ marginTop: 20, padding: '16px 20px', borderRadius: 16, background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
          <strong>Read-only access:</strong> Your account can view the Users section, but only SuperAdmin or users with the <code>manage_users</code> permission can add, edit, or delete user records.
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: 'min(760px,100%)', background: '#07101f', borderRadius: 24, padding: 28, boxShadow: '0 32px 70px rgba(0,0,0,0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.45rem' }}>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>{editingUser ? 'Update user role, status, and permissions.' : 'Create a new account and assign access immediately.'}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#cbd5e1' }}>
                  Name
                  <input value={form.name} onChange={(e) => handleFormChange('name', e.target.value)} className="input-field" placeholder="Full name" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#cbd5e1' }}>
                  Email
                  <input value={form.email} onChange={(e) => handleFormChange('email', e.target.value)} className="input-field" placeholder="email@example.com" />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#cbd5e1' }}>
                  Password
                  <input type="password" value={form.password} onChange={(e) => handleFormChange('password', e.target.value)} className="input-field" placeholder={editingUser ? 'Leave blank to keep existing password' : 'Enter password'} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#cbd5e1' }}>
                  Role
                  <select value={form.role} onChange={(e) => handleFormChange('role', e.target.value)} className="input-field">
                    {AVAILABLE_ROLES.map((role) => (
                      <option key={role.id} value={role.id}>{role.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#cbd5e1' }}>
                  Status
                  <select value={form.isActive ? 'active' : 'inactive'} onChange={(e) => handleFormChange('isActive', e.target.value === 'active')} className="input-field">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Permissions</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {PERMISSIONS.map((permission) => {
                      const selected = form.permissions.includes(permission.id);
                      return (
                        <button
                          key={permission.id}
                          onClick={() => togglePermission(permission.id)}
                          type="button"
                          style={{
                            border: selected ? '1px solid #3b82f6' : '1px solid rgba(148,163,184,.3)',
                            background: selected ? 'rgba(59,130,246,0.12)' : 'transparent',
                            color: selected ? '#eff6ff' : '#cbd5e1',
                            borderRadius: 999,
                            padding: '10px 14px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          {selected ? <CheckSquare size={14} /> : <Square size={14} />}
                          {permission.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 4 }}>
                <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ border: '1px solid rgba(148,163,184,0.25)', color: '#cbd5e1', background: 'transparent' }}>
                  Cancel
                </button>
                <button onClick={submitUser} className="btn btn-primary" style={{ background: '#0665ff', border: 'none', color: '#fff' }} disabled={saving}>
                  {saving ? 'Saving...' : editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <div style={{ marginTop: 14, color: 'var(--text-secondary)' }}>Loading users…</div>}
    </div>
  );
};
