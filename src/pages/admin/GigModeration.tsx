import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';

const GigModeration: React.FC = () => {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      const { data, error } = await supabase
        .from('gigs')
        .select(`
          id, title, status, created_at,
          organizations(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setGigs(data);
      }
    } catch (err: any) {
      console.error("Error fetching gigs:", err);
      setError(err.message || 'Failed to load gigs');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeDown = async (gigId: string) => {
    try {
      const { error } = await supabase
        .from('gigs')
        .update({ status: 'rejected' })
        .eq('id', gigId);
      
      if (error) throw error;
      
      // Update local state
      setGigs(gigs.map(g => g.id === gigId ? { ...g, status: 'rejected' } : g));
    } catch (err: any) {
      console.error("Error updating gig:", err);
      alert("Failed to take down gig: " + err.message);
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

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
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
              {gigs.map(gig => (
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
                        <button onClick={() => handleTakeDown(gig.id)} style={{ padding: '8px 16px', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Take Down</button>
                      )}
                      {gig.status !== 'published' && (
                        <button onClick={() => handleApprove(gig.id)} style={{ padding: '8px 16px', backgroundColor: '#ECFCCB', color: '#4D7C0F', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Approve</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {gigs.length === 0 && (
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