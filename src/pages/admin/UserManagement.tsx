import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import LoadingScreen from '../../components/LoadingScreen';

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'volunteers' | 'organizations' | 'admins'>('volunteers');
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('users')
          .select(`
            id, email, role, created_at,
            volunteer_profiles(full_name),
            organizations(name, verification_status)
          `)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (data) {
          setVolunteers(data.filter(u => u.role === 'volunteer'));
          setOrganizations(data.filter(u => u.role === 'organization'));
          setAdmins(data.filter(u => u.role === 'admin'));
        }
      } catch (err: any) {
        console.error("Error fetching users:", err);
        setError(err.message || 'Failed to load users. Ensure you have admin privileges and RLS policies allow access.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <LoadingScreen message="Loading users..." />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0', fontFamily: 'var(--display)' }}>User Management</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Search and manage accounts across the platform.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="admin-topbar-search" style={{ width: '280px', backgroundColor: 'white', border: '1px solid #E2E8F0' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search by name or email..." />
          </div>
          <button style={{ padding: '8px 16px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>+ Add User</button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#FEE2E2', border: '1px solid #DC2626', color: '#DC2626', borderRadius: '8px', marginBottom: '24px', fontWeight: 500 }}>
          Error: {error}
        </div>
      )}

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0' }}>
          <button 
            onClick={() => setActiveTab('volunteers')}
            style={{ padding: '16px 24px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === 'volunteers' ? '#3B82F6' : 'transparent'}`, color: activeTab === 'volunteers' ? '#3B82F6' : '#64748B', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
          >
            Volunteers ({volunteers.length})
          </button>
          <button 
            onClick={() => setActiveTab('organizations')}
            style={{ padding: '16px 24px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === 'organizations' ? '#3B82F6' : 'transparent'}`, color: activeTab === 'organizations' ? '#3B82F6' : '#64748B', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
          >
            Organizations ({organizations.length})
          </button>
          <button 
            onClick={() => setActiveTab('admins')}
            style={{ padding: '16px 24px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === 'admins' ? '#3B82F6' : 'transparent'}`, color: activeTab === 'admins' ? '#3B82F6' : '#64748B', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
          >
            Internal Team ({admins.length})
          </button>
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name / Email</th>
                {activeTab !== 'admins' && <th>Gigs</th>}
                {activeTab === 'admins' && <th>Role</th>}
                {activeTab !== 'admins' && <th>Joined</th>}
                {activeTab !== 'admins' && <th>Status</th>}
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'volunteers' && volunteers.map(user => {
                const name = user.volunteer_profiles?.[0]?.full_name || 'Unknown Volunteer';
                return (
                  <tr key={user.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '15px' }}>{name}</div>
                      <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{user.email}</div>
                    </td>
                    <td>0 completed</td>
                    <td>{formatDistanceToNow(new Date(user.created_at))} ago</td>
                    <td><span className="admin-status-badge admin-status-approved">Active</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button style={{ background: 'none', border: 'none', color: '#3B82F6', fontWeight: 600, cursor: 'pointer' }}>View</button>
                    </td>
                  </tr>
                );
              })}
              {activeTab === 'organizations' && organizations.map(org => {
                const name = org.organizations?.[0]?.name || 'Unknown Organization';
                const status = org.organizations?.[0]?.verification_status || 'pending';
                return (
                  <tr key={org.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '15px' }}>{name}</div>
                      <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{org.email}</div>
                    </td>
                    <td>0 posted</td>
                    <td>{formatDistanceToNow(new Date(org.created_at))} ago</td>
                    <td>
                      <span className={`admin-status-badge ${status === 'pending' ? 'admin-status-pending' : status === 'rejected' ? 'admin-status-rejected' : 'admin-status-approved'}`}>
                        {status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button style={{ background: 'none', border: 'none', color: '#3B82F6', fontWeight: 600, cursor: 'pointer' }}>View</button>
                    </td>
                  </tr>
                );
              })}
              {activeTab === 'admins' && admins.map(admin => {
                const name = admin.volunteer_profiles?.[0]?.full_name || 'Admin User';
                return (
                  <tr key={admin.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '15px' }}>{name}</div>
                      <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{admin.email}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{admin.role}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button style={{ background: 'none', border: 'none', color: '#3B82F6', fontWeight: 600, cursor: 'pointer' }}>Manage</button>
                    </td>
                  </tr>
                );
              })}
              {((activeTab === 'volunteers' && volunteers.length === 0) || 
                (activeTab === 'organizations' && organizations.length === 0) ||
                (activeTab === 'admins' && admins.length === 0)) && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>
                    No records found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;