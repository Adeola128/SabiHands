import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';

const GigModeration: React.FC = () => {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'rejected'>('pending');
  
  // Rejection Modal State
  const [rejectGig, setRejectGig] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      const [gigsRes, orgsRes] = await Promise.all([
        supabase.from('gigs').select('id, title, status, created_at, organization_id').order('created_at', { ascending: false }),
        supabase.from('organizations').select('id, name')
      ]);

      if (gigsRes.error) throw gigsRes.error;

      if (gigsRes.data) {
        const mergedData = gigsRes.data.map(gig => {
          const org = (orgsRes.data || []).find(o => o.id === gig.organization_id);
          return {
            ...gig,
            organizations: { name: org?.name }
          };
        });
        setGigs(mergedData);
      }
    } catch (err: any) {
      console.error("Error fetching gigs:", err);
      setError(err.message || 'Failed to load gigs');
    } finally {
      setLoading(false);
    }
  };

  const openRejectModal = (gig: any) => {
    setRejectGig(gig);
    setRejectionReason('');
  };

  const handleTakeDown = async () => {
    if (!rejectGig) return;
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for taking down this gig.");
      return;
    }
    
    setIsRejecting(true);
    try {
      const { error } = await supabase
        .from('gigs')
        .update({ status: 'rejected', rejection_reason: rejectionReason }) // assuming we want to store it, but even if it doesn't exist on schema we can just pass status
        .eq('id', rejectGig.id);
      
      if (error) throw error;
      
      // Update local state
      setGigs(gigs.map(g => g.id === rejectGig.id ? { ...g, status: 'rejected' } : g));
      setRejectGig(null);
    } catch (err: any) {
      console.error("Error updating gig:", err);
      alert("Failed to take down gig: " + err.message);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleApprove = async (gigId: string) => {
    try {
      const { error } = await supabase
        .from('gigs')
        .update({ status: 'published' })
        .eq('id', gigId);
      
      if (error) throw error;
      
      // Update local state
      setGigs(gigs.map(g => g.id === gigId ? { ...g, status: 'published' } : g));
    } catch (err: any) {
      console.error("Error updating gig:", err);
      alert("Failed to approve gig: " + err.message);
    }
  };

  if (loading) return <LoadingScreen message="Loading gigs..." />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0', fontFamily: 'var(--display)' }}>Gig Moderation</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Review all gigs and take action to ensure platform safety.</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#FEE2E2', border: '1px solid #DC2626', color: '#DC2626', borderRadius: '8px', marginBottom: '24px', fontWeight: 500 }}>
          Error: {error}
        </div>
      )}

      {/* Reject Modal */}
      {rejectGig && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#0F172A' }}>Reject Gig</h2>
              <button onClick={() => setRejectGig(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '16px' }}>
              You are about to reject/take down <strong>{rejectGig.title}</strong> by {rejectGig.organizations?.name}. Please provide a reason to the organization.
            </p>

            <textarea 
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g. This gig violates our community guidelines by..."
              style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', minHeight: '120px', marginBottom: '24px', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setRejectGig(null)} style={{ flex: 1, padding: '12px', backgroundColor: '#F1F5F9', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleTakeDown} disabled={isRejecting || !rejectionReason.trim()} style={{ flex: 1, padding: '12px', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: isRejecting || !rejectionReason.trim() ? 'not-allowed' : 'pointer', opacity: isRejecting || !rejectionReason.trim() ? 0.5 : 1 }}>
                {isRejecting ? 'Rejecting...' : 'Reject Gig'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0' }}>
          <button 
            onClick={() => setActiveTab('pending')}
            style={{ padding: '16px 24px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === 'pending' ? '#3B82F6' : 'transparent'}`, color: activeTab === 'pending' ? '#3B82F6' : '#64748B', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
          >
            Pending Review
          </button>
          <button 
            onClick={() => setActiveTab('published')}
            style={{ padding: '16px 24px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === 'published' ? '#3B82F6' : 'transparent'}`, color: activeTab === 'published' ? '#3B82F6' : '#64748B', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
          >
            Published
          </button>
          <button 
            onClick={() => setActiveTab('rejected')}
            style={{ padding: '16px 24px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === 'rejected' ? '#3B82F6' : 'transparent'}`, color: activeTab === 'rejected' ? '#3B82F6' : '#64748B', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
          >
            Rejected
          </button>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Gig Title / Organization</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {gigs.filter(g => g.status === activeTab || (activeTab === 'pending' && !['published', 'rejected'].includes(g.status))).map(gig => (
                <tr key={gig.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '15px' }}>{gig.title}</div>
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{gig.organizations?.name || 'Unknown Org'}</div>
                  </td>
                  <td>
                    <span className={`admin-status-badge ${gig.status === 'rejected' ? 'admin-status-rejected' : gig.status === 'published' ? 'admin-status-approved' : 'admin-status-pending'}`}>
                      {gig.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {gig.status !== 'rejected' && (
                        <button onClick={() => openRejectModal(gig)} style={{ padding: '8px 16px', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#FECACA'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#FEE2E2'}>Take Down</button>
                      )}
                      {gig.status !== 'published' && (
                        <button onClick={() => handleApprove(gig.id)} style={{ padding: '8px 16px', backgroundColor: '#ECFCCB', color: '#4D7C0F', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#D9F99D'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#ECFCCB'}>Approve</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {gigs.filter(g => g.status === activeTab || (activeTab === 'pending' && !['published', 'rejected'].includes(g.status))).length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>
                    No gigs found on the platform.
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

export default GigModeration;