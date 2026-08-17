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
          supabase.from('organizations').select('user_id, name, verification_status, rejection_reason'),
          supabase.from('users').select('id, email, created_at')
        ]);

        if (orgsRes.error) throw orgsRes.error;
        if (usersRes.error) throw usersRes.error;

        if (orgsRes.data) {
          const merged = orgsRes.data.map((o: any) => {
            const user = (usersRes.data || []).find((u: any) => u.id === o.user_id);
            return {
              id: o.user_id,
              name: o.name || 'Unknown Organization',
              email: user?.email || 'No email',
              verification_status: o.verification_status || 'pending',
              rejection_reason: o.rejection_reason,
              created_at: user?.created_at || new Date().toISOString()
            };
          });
          
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

  const pendingOrgs = organizations.filter(o => o.verification_status === 'pending' || !o.verification_status);
  const reviewedOrgs = organizations.filter(o => o.verification_status !== 'pending' && o.verification_status);

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
          return {
            ...org,
            verification_status: newStatus,
            rejection_reason: reason || org.rejection_reason
          };
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
                return (
                  <tr key={org.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '15px' }}>{org.name}</div>
                      <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{org.email}</div>
                    </td>
                    <td>
                      <span className={`chip chip-${org.verification_status === 'pending' ? 'warning' : org.verification_status === 'rejected' ? 'danger' : 'success'}`}>
                        {org.verification_status.charAt(0).toUpperCase() + org.verification_status.slice(1)}
                      </span>
                    </td>
                    <td>{formatDistanceToNow(new Date(org.created_at))} ago</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="row-actions">
                        <button onClick={() => openReviewModal(org)} style={{ padding: '6px 12px', backgroundColor: '#F1F5F9', color: '#334155', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                          Review Documents
                        </button>
                      </div>
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
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0F172A' }}>Review Organization</h2>
                <div style={{ color: '#64748B', fontSize: '14px' }}>{reviewOrg.name} ({reviewOrg.email})</div>
              </div>
              <button onClick={() => setReviewOrg(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Verification Documents</h3>
              {loadingDocs ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>Loading files...</div>
              ) : orgDocs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {orgDocs.map(doc => {
                    const fileUrl = supabase.storage.from('verification_documents').getPublicUrl(`${reviewOrg.id}/${doc.name}`).data.publicUrl;
                    const isVideo = doc.name.endsWith('.mp4') || doc.name.endsWith('.webm') || doc.name.endsWith('.mov');
                    return (
                      <div key={doc.name} style={{ border: '1px solid #E2E8F0', padding: '16px', borderRadius: '12px', backgroundColor: '#F8FAFC' }}>
                        <div style={{ fontWeight: 600, marginBottom: isVideo ? '12px' : '4px', fontSize: '14px', color: '#1E293B' }}>{doc.name}</div>
                        {isVideo ? (
                          <video controls style={{ width: '100%', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <source src={fileUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <a href={fileUrl} target="_blank" rel="noreferrer" style={{ color: '#3B82F6', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>View Document &rarr;</a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', border: '2px dashed #E2E8F0', borderRadius: '12px', color: '#94A3B8' }}>
                  No documents uploaded yet.
                </div>
              )}
            </div>

            {(reviewOrg.verification_status === 'pending') && (
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
                {!showRejectForm ? (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setShowRejectForm(true)} style={{ flex: 1, padding: '12px', backgroundColor: '#FEF2F2', color: '#EF4444', border: '1px solid #FCA5A5', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Reject Organization</button>
                    <button onClick={() => handleVerification(reviewOrg.id, 'verified')} style={{ flex: 1, padding: '12px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgb(16 185 129 / 0.2)' }}>Approve Organization</button>
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#FEF2F2', padding: '16px', borderRadius: '12px', border: '1px solid #FEE2E2' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#991B1B' }}>Reason for Rejection</label>
                    <p style={{ fontSize: '13px', color: '#B91C1C', margin: '0 0 12px 0' }}>This will be shown to the organization so they can correct their submission.</p>
                    <textarea 
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      placeholder="Please upload a clearer video explaining your mission..."
                      style={{ width: '100%', padding: '12px', border: '1px solid #FCA5A5', borderRadius: '8px', minHeight: '100px', marginBottom: '16px', boxSizing: 'border-box', outline: 'none' }}
                    />
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => setShowRejectForm(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'white', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
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
