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

  // Review Modal State
  const [reviewOrg, setReviewOrg] = useState<any | null>(null);
  const [orgDocs, setOrgDocs] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const openReviewModal = async (org: any) => {
    setReviewOrg(org);
    setLoadingDocs(true);
    setShowRejectForm(false);
    setRejectionReason('');
    try {
      const { data, error } = await supabase.storage
        .from('verification_documents')
        .list(org.id);
      
      if (error) throw error;
      setOrgDocs(data || []);
    } catch (err: any) {
      console.error("Error fetching docs:", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleVerification = async (orgUserId: string, newStatus: 'verified' | 'rejected', reason?: string) => {
    try {
      const updatePayload: any = { verification_status: newStatus };
      if (newStatus === 'rejected' && reason) {
        updatePayload.rejection_reason = reason;
      }

      const { error } = await supabase
        .from('organizations')
        .update(updatePayload)
        .eq('user_id', orgUserId);

      if (error) throw error;

      setOrganizations(prev => prev.map(org => {
        if (org.id === orgUserId) {
          const updatedOrgs = (org.organizations || []).map((o: any) => ({ 
            ...o, 
            verification_status: newStatus,
            rejection_reason: reason || o.rejection_reason
          }));
          return { ...org, organizations: updatedOrgs };
        }
        return org;
      }));

      if (reviewOrg && reviewOrg.id === orgUserId) {
        setReviewOrg(null);
      }
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [usersRes, profilesRes, orgsRes] = await Promise.all([
          supabase.from('users').select('id, email, role, created_at').order('created_at', { ascending: false }),
          supabase.from('volunteer_profiles').select('user_id, full_name'),
          supabase.from('organizations').select('user_id, name, verification_status')
        ]);

        if (usersRes.error) throw usersRes.error;

        if (usersRes.data) {
          const mergedData = usersRes.data.map(u => ({
            ...u,
            volunteer_profiles: (profilesRes.data || []).filter(p => p.user_id === u.id),
            organizations: (orgsRes.data || []).filter(o => o.user_id === u.id)
          }));

          setVolunteers(mergedData.filter(u => u.role === 'volunteer'));
          setOrganizations(mergedData.filter(u => u.role === 'organization'));
          setAdmins(mergedData.filter(u => u.role === 'admin'));
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
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => openReviewModal(org)} style={{ padding: '6px 12px', backgroundColor: '#F1F5F9', color: '#334155', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                          Review Documents
                        </button>
                      </div>
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

      {/* Review Modal */}
      {reviewOrg && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Review Organization</h2>
                <div style={{ color: '#64748B', fontSize: '14px' }}>{reviewOrg.organizations?.[0]?.name} ({reviewOrg.email})</div>
              </div>
              <button onClick={() => setReviewOrg(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
            </div>

            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Uploaded Documents & Video</h3>
            {loadingDocs ? (
              <p>Loading files...</p>
            ) : orgDocs.length > 0 ? (
              <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                {orgDocs.map(doc => {
                  const fileUrl = supabase.storage.from('verification_documents').getPublicUrl(`${reviewOrg.id}/${doc.name}`).data.publicUrl;
                  const isVideo = doc.name.endsWith('.mp4') || doc.name.endsWith('.webm') || doc.name.endsWith('.mov');
                  return (
                    <div key={doc.name} style={{ border: '1px solid #E2E8F0', padding: '16px', borderRadius: '8px' }}>
                      <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>{doc.name}</div>
                      {isVideo ? (
                        <video controls style={{ width: '100%', borderRadius: '4px' }}>
                          <source src={fileUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <a href={fileUrl} target="_blank" rel="noreferrer" style={{ color: '#3B82F6', fontSize: '14px', textDecoration: 'none' }}>View File &rarr;</a>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#64748B', fontStyle: 'italic', marginBottom: '24px' }}>No documents uploaded yet.</p>
            )}

            {reviewOrg.organizations?.[0]?.verification_status === 'pending' && (
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '24px', display: 'flex', gap: '12px', flexDirection: 'column' }}>
                {!showRejectForm ? (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setShowRejectForm(true)} style={{ flex: 1, padding: '12px', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Reject Organization</button>
                    <button onClick={() => handleVerification(reviewOrg.id, 'verified')} style={{ flex: 1, padding: '12px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Approve Organization</button>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Reason for Rejection</label>
                    <textarea 
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      placeholder="Please upload a clearer video explaining your mission..."
                      style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', minHeight: '100px', marginBottom: '16px', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => setShowRejectForm(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#F1F5F9', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                      <button onClick={() => handleVerification(reviewOrg.id, 'rejected', rejectionReason)} disabled={!rejectionReason.trim()} style={{ flex: 1, padding: '12px', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', opacity: !rejectionReason.trim() ? 0.5 : 1 }}>Confirm Rejection</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;