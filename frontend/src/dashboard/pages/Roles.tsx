import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import { ShieldAlert, Plus, Trash2, Edit2, Users, CheckSquare, Square, X } from 'lucide-react';
import { fetchRoles, createRole, updateRole, deleteRole } from '../../store/slices/rolesSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import { SmartTable } from '../components/SmartTable';
import type { AppDispatch } from '../../store';
import { api } from '../../api/axios';
import toast from 'react-hot-toast';

const MODULES = [
  { id: 'dashboard', label: 'Home Dashboard' },
  { id: 'ads', label: 'Campaigns & Ads' },
  { id: 'content', label: 'Creative Hub' },
  { id: 'analytics', label: 'Analytics Reports' },
  { id: 'automation', label: 'SEO & Reputation Automation' },
  { id: 'billing', label: 'Billing Manager' },
];

// Helper Modal Component
const ModalOverlay = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
       <GlassCard className="animate-fade-in" style={{ width: '400px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{title}</h3>
            <X size={20} color="var(--text-secondary)" style={{ cursor: 'pointer' }} onClick={onClose} />
          </div>
          {children}
       </GlassCard>
    </div>
  )
};

export const Roles: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { roles } = useSelector((state: any) => state.roles);
  const currentUser = useSelector((state: any) => state.auth.user);
  const { activeWebsiteId } = useSelector((state: any) => state.workspace);
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');
  const [selectedRole, setSelectedRole] = useState<any>(null);

  // Dynamic Users State
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load team members.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    dispatch(fetchRoles(activeWebsiteId));
  }, [dispatch, activeWebsiteId]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole]);

  // Modal States
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const [showChangeRoleModal, setShowChangeRoleModal] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const handleTogglePermission = async (module: string) => {
    if (selectedRole.isSystem) {
      return toast.error("Cannot modify locked system roles.");
    }
    const hasPerm = selectedRole.permissions.includes(module);
    const newPerms = hasPerm ? selectedRole.permissions.filter((p: string) => p !== module) : [...selectedRole.permissions, module];
    const updateDto = { permissions: newPerms };
    
    try {
      await dispatch(updateRole({ id: selectedRole._id || selectedRole.id, dto: updateDto })).unwrap();
      setSelectedRole({ ...selectedRole, permissions: newPerms });
      toast.success(`Permissions updated for ${selectedRole.name}`);
    } catch (err) {
      toast.error("Failed to update permissions.");
    }
  };

  const handleDeleteRole = async (id: string, isSystem: boolean) => {
    if (isSystem) return toast.error("System roles cannot be deleted.");
    if (users.find(u => u.role === id || u.permissions?.includes(id))) return toast.error("Cannot delete role assigned to active users.");
    try {
       await dispatch(deleteRole(id)).unwrap();
       if (selectedRole?.id === id || selectedRole?._id === id) setSelectedRole(roles[0]);
       toast.success("Role deleted successfully.");
    } catch (err) {
       toast.error("Failed to delete role.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?._id || id === currentUser?.id) return toast.error("Cannot delete your own account.");
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted successfully.");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user.");
    }
  };

  const submitAddRole = async () => {
    if (!newRoleName.trim()) return toast.error('Role name is required.');
    try {
      const role = await dispatch(createRole({ 
        name: newRoleName, 
        permissions: [], 
        workspaceId: activeWebsiteId 
      })).unwrap();
      setSelectedRole(role);
      setShowAddRoleModal(false);
      setNewRoleName('');
      toast.success(`Role ${newRoleName} created.`);
      dispatch(addNotification({ 
        id: Date.now().toString(), title: 'RBAC Policy Created', 
        message: `New security role "${newRoleName}" initialized.`, 
        type: 'info', time: new Date().toISOString(), read: false 
      }));
    } catch (err) {
      toast.error("Failed to create role.");
    }
  };

  const submitInviteUser = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) return toast.error('Valid email is required.');
    try {
      const payload = {
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        password: Math.random().toString(36).slice(-8), // temporary password
        role: 'client',
        permissions: ['dashboard', 'ads', 'content']
      };
      await api.post('/users', payload);
      toast.success("Member invited successfully!");
      setShowInviteModal(false);
      setInviteEmail('');
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to invite member.");
    }
  };

  const submitChangeRole = async () => {
    if (!selectedRoleId || !showChangeRoleModal) return;
    try {
      // Find permissions mapped to this custom role or default permissions
      const matchedRole = roles.find((r: any) => r.name === selectedRoleId);
      let permissions = ['dashboard', 'ads', 'content'];
      let targetRole = 'client';

      if (selectedRoleId === 'superadmin') {
        targetRole = 'superadmin';
        permissions = ['*'];
      } else if (selectedRoleId === 'admin') {
        targetRole = 'admin';
        permissions = ['*'];
      } else if (selectedRoleId === 'agency') {
        targetRole = 'agency';
        permissions = ['dashboard', 'ads', 'content', 'analytics', 'automation'];
      } else if (matchedRole) {
        targetRole = matchedRole.name;
        permissions = matchedRole.permissions;
      }

      const payload = {
        role: targetRole,
        permissions: permissions
      };

      await api.patch(`/users/${showChangeRoleModal}`, payload);
      toast.success("User role and permissions updated successfully!");
      setShowChangeRoleModal(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user role.");
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            Roles & Permissions<span className="text-gradient"></span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Module-wise access control and workspace team management.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button className={`btn ${activeTab === 'roles' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('roles')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: activeTab === 'roles' ? '#0665ff' : 'transparent', color: activeTab === 'roles' ? '#fff' : '#999', border: activeTab === 'roles' ? 'none' : '1px solid #0665ff' }}>
          <ShieldAlert size={16} /> Manage Roles
        </button>
        <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('users')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: activeTab === 'users' ? '#0665ff' : 'transparent', color: activeTab === 'users' ? '#fff' : '#999', border: activeTab === 'users' ? 'none' : '1px solid #0665ff' }}>
          <Users size={16} /> Team Members
        </button>
      </div>

      {activeTab === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '24px' }}>
          <GlassCard style={{ padding: '0', overflow: 'hidden', height: 'fit-content' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-primary)' }}>
               <h3 style={{ fontSize: '1rem' }}>Access Roles</h3>
               <button className="btn-secondary" style={{ padding: '4px 8px', background: '#0665ff', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={() => setShowAddRoleModal(true)}><Plus size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {roles.map((role: any) => (
                <div key={role._id || role.id} onClick={() => setSelectedRole(role)} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: selectedRole?.id === (role.id || role._id) || selectedRole?._id === (role._id || role.id) ? 'rgba(38, 49, 214, 0.1)' : 'transparent', borderLeft: (selectedRole?.id === (role.id || role._id) || selectedRole?._id === (role._id || role.id)) ? '3px solid #0665ff' : '3px solid transparent', transition: 'all 0.2s' }}>
                  <span style={{ fontWeight: (selectedRole?.id === (role.id || role._id) || selectedRole?._id === (role._id || role.id)) ? 600 : 400, color: 'var(--text-primary)' }}>{role.name}</span>
                  {!role.isSystem && (
                    <Trash2 size={16} color="var(--error)" style={{ opacity: 0.6 }} onClick={(e) => { e.stopPropagation(); handleDeleteRole(role._id || role.id, role.isSystem); }} />
                  )}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-primary)' }}>
             {!selectedRole ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                   Select a role to manage permissions.
                </div>
             ) : (
                <>
                  <div>
                     <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Module Permissions for "{selectedRole.name}"</h3>
                     <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedRole.isSystem ? 'This is a system role. Permissions cannot be altered.' : 'Assign module-wise access for this specific role.'}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                     {MODULES.map(module => {
                       const hasAccess = selectedRole.permissions.includes('*') || selectedRole.permissions.includes(module.id);
                       return (
                         <div key={module.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                           <div>
                             <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>{module.label}</div>
                             <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Allows viewing and modifying `{module.id}` module data.</div>
                           </div>
                           <div onClick={() => handleTogglePermission(module.id)} style={{ cursor: selectedRole.isSystem ? 'not-allowed' : 'pointer', opacity: selectedRole.isSystem ? 0.5 : 1 }}>
                              {hasAccess ? <CheckSquare size={24} color="#0665ff" /> : <Square size={24} color="var(--text-secondary)" />}
                           </div>
                         </div>
                       );
                     })}
                  </div>
                </>
             )}
          </GlassCard>
        </div>
      )}

      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
             <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0665ff', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={() => setShowInviteModal(true)}>
               <Plus size={16} /> Invite Member
             </button>
          </div>
          {loadingUsers ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading team members...</div>
          ) : (
            <SmartTable 
              title="Workspace Members"
              searchPlaceholder="Search teammates..."
              columns={[
                { 
                  key: 'name', 
                  label: 'Name', 
                  sortable: true,
                  render: (row) => <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
                },
                { 
                  key: 'email', 
                  label: 'Email', 
                  sortable: true,
                  render: (row) => <div style={{ color: 'var(--text-secondary)' }}>{row.email}</div>
                },
                {
                  key: 'role',
                  label: 'System Role',
                  render: (row) => (
                    <span style={{ 
                      background: 'rgba(38, 49, 214, 0.15)', 
                      color: '#0665ff', 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      textTransform: 'capitalize'
                    }}>
                      {row.role || 'client'}
                    </span>
                  )
                },
                {
                  key: 'permissions',
                  label: 'Permissions Count',
                  render: (row) => (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {row.permissions?.includes('*') ? 'All Modules' : `${row.permissions?.length || 0} modules allowed`}
                    </span>
                  )
                }
              ]}
              data={users}
              actions={(row) => (
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button 
                    style={{ color: '#0665ff', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    onClick={() => { setSelectedRoleId(row.role || 'client'); setShowChangeRoleModal(row._id || row.id); }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    style={{ color: 'var(--error)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    onClick={() => handleDeleteUser(row._id || row.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            />
          )}
        </div>
      )}

      {/* MODALS */}
      <ModalOverlay isOpen={showAddRoleModal} onClose={() => setShowAddRoleModal(false)} title="Create New Role">
        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Role Name</label>
        <input className="input-field" autoFocus value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="e.g. SEO Specialist" style={{ marginTop: '8px', marginBottom: '20px' }} />
        <button className="btn btn-primary" style={{ width: '100%', background: '#0665ff', color: '#fff', border: 'none' }} onClick={submitAddRole}>Create Role</button>
      </ModalOverlay>

      <ModalOverlay isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite Team Member">
        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email Address</label>
        <input className="input-field" type="email" autoFocus value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@example.com" style={{ marginTop: '8px', marginBottom: '20px' }} />
        <button className="btn btn-primary" style={{ width: '100%', background: '#0665ff', color: '#fff', border: 'none' }} onClick={submitInviteUser}>Send Invite</button>
      </ModalOverlay>

      <ModalOverlay isOpen={!!showChangeRoleModal} onClose={() => setShowChangeRoleModal(null)} title="Change User Role">
        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Assign Role or Custom Policy</label>
        <select className="input-field" value={selectedRoleId} onChange={e => setSelectedRoleId(e.target.value)} style={{ marginTop: '8px', marginBottom: '20px' }}>
            <option value="client">Client (Default)</option>
            <option value="agency">Agency (Pre-configured)</option>
            <option value="admin">System Admin</option>
            <option value="superadmin">Super Admin</option>
            {roles.map((r: any) => <option key={r._id || r.id} value={r.name}>{r.name} (Custom Workspace Policy)</option>)}
        </select>
        <button className="btn btn-primary" style={{ width: '100%', background: '#0665ff', color: '#fff', border: 'none' }} onClick={submitChangeRole}>Update Role</button>
      </ModalOverlay>

    </div>
  );
};
