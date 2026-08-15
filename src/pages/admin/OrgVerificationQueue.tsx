import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import LoadingScreen from '../../components/LoadingScreen';

const OrgVerificationQueue: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed'>('pending');
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewOrg, setReviewOrg] = useState<any | null>(null);
  const [orgDocs, setOrgDocs] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const [orgsRes, usersRes] = await Promise.all([
          supabase.from('organizations').select('user_id, name, verification_status, rejection_reason, created_at'),
          supabase.from('users').select('id, email, created_at')
        ]);

        if (orgsRes.error) throw orgsRes.error;
        if (usersRes.error) throw usersRes.error;

        if (orgsRes.data) {
          const merged = orgsRes.data.map((o: any) => {
            const user = usersRes.data.find(u => u.id === o.user_id);
            return {
              id: o.user_id,
              email: user?.email || 'No email',
              created_at: o.created_at || user?.created_at || new Date().toISOString(),
              organizations: [o]
            };
          });
          
          // Sort by created_at descending
          merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          setOrganizations(merged);
        }
      } catch (err: any) {
        console.error("Error fetching orgs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrgs();
  }, []);

  const pendingOrgs = organizations.filter(o => {
    const status = o.organizations?.[0]?.verification_status;
    return !status || status === 'pending';
  });
  const reviewedOrgs = organizations.filter(o => o.organizations?.[0]?.verification_status !== 'pending' && o.organizations?.[0]?.verification_status);

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

  if (loading) return <LoadingScreen message="Loading verification queue..." />;

  const displayOrgs = activeTab === 'pending' ? pendingOrgs : reviewedOrgs;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0', fontFamily: 'var(--display)' }}>Verification Queue</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Review and approve new organizations joining Ralvo.</p>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0' }}>
          <button 
            onClick={() => setActiveTab('pending')}
            style={{ padding: '16px 24px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === 'pending' ? '#3B82F6' : 'transparent'}`, color: activeTab === 'pending' ? '#3B82F6' : '#64748B', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            Pending Review
            <span style={{ background: activeTab === 'pending' ? '#DBEAFE' : '#F1F5F9', color: activeTab === 'pending' ? '#1D4ED8' : '#64748B', padding: '2px 8px', borderRadius: '99px', fontSize: '12px' }}>{pendingOrgs.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('reviewed')}
            style={{ padding: '16px 24px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === 'reviewed' ? '#3B82F6' : 'transparent'}`, color: activeTab === 'reviewed' ? '#3B82F6' : '#64748B', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            Recently Reviewed
            <span style={{ background: activeTab === 'reviewed' ? '#DBEAFE' : '#F1F5F9', color: activeTab === 'reviewed' ? '#1D4ED8' : '#64748B', padding: '2px 8px', borderRadius: '99px', fontSize: '12px' }}>{reviewedOrgs.length}</span>
          </button>
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayOrgs.map(org => {
                const name = org.organizations?.[0]?.name || 'Unknown Organization';
                const status = org.organizations?.[0]?.verification_status || 'pending';
                return (
                  <tr key={org.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '15px' }}>{name}</div>
                      <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{org.email}</div>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${status === 'pending' ? 'admin-status-pending' : status === 'rejected' ? 'admin-status-rejected' : 'admin-status-approved'}`}>
                        {status}
                      </span>
                    </td>
                    <td>{formatDistanceToNow(new Date(org.created_at))} ago</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => openReviewModal(org)} style={{ padding: '6px 12px', backgroundColor: '#F1F5F9', color: '#334155', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                        Review Documents
                      </button>
                    </td>
                  </tr>
                );
              })}
              {displayOrgs.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>
                    No organizations in this queue.
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

            {(!reviewOrg.organizations?.[0]?.verification_status || reviewOrg.organizations?.[0]?.verification_status === 'pending') && (
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

export default OrgVerificationQueue;
