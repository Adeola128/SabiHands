import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';

const CertificateRegistry: React.FC = () => {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const [certsRes, profilesRes, gigsRes, orgsRes] = await Promise.all([
        supabase.from('certificates').select('*').order('created_at', { ascending: false }),
        supabase.from('volunteer_profiles').select('user_id, full_name'),
        supabase.from('gigs').select('id, title, organization_id'),
        supabase.from('organizations').select('id, name')
      ]);

      if (certsRes.error) throw certsRes.error;

      if (certsRes.data) {
        const mergedData = certsRes.data.map(cert => {
          const profile = (profilesRes.data || []).find(p => p.user_id === cert.volunteer_id);
          const gig = (gigsRes.data || []).find(g => g.id === cert.gig_id);
          const org = (orgsRes.data || []).find(o => o.id === gig?.organization_id);

          return {
            ...cert,
            users: { volunteer_profiles: [profile] },
            gigs: { title: gig?.title, organizations: { name: org?.name } }
          };
        });
        setCertificates(mergedData);
      }
    } catch (err: any) {
      console.error("Error fetching certificates:", err);
      setError(err.message || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading certificates..." />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0', fontFamily: 'var(--display)' }}>Certificate Registry & Audit Log</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Immutable ledger of all verified certificates issued on Ralvo.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="admin-topbar-search" style={{ width: '280px', backgroundColor: 'white', border: '1px solid #E2E8F0' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search by Cert ID..." />
          </div>
          <button style={{ padding: '8px 16px', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Export CSV</button>
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
                <th>Certificate ID</th>
                <th>Volunteer</th>
                <th>Organization / Gig</th>
                <th>Hours</th>
                <th>Date Issued</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map(cert => {
                const volName = cert.users?.volunteer_profiles?.[0]?.full_name || 'Unknown Volunteer';
                const orgName = cert.gigs?.organizations?.name || 'Unknown Organization';
                const gigTitle = cert.gigs?.title || 'Unknown Gig';
                const date = new Date(cert.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

                return (
                  <tr key={cert.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#3B82F6', fontSize: '14px', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                        {cert.verification_code}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '14px' }}>{volName}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#334155', fontSize: '14px' }}>{orgName}</div>
                      <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{gigTitle}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: '#10B981' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        -- hrs
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '14px', color: '#64748B' }}>{date}</div>
                    </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button style={{ background: 'none', border: 'none', color: '#3B82F6', fontWeight: 600, cursor: 'pointer' }}>View Ledger</button>
                    </div>
                  </td>
                  </tr>
                );
              })}
              {certificates.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>
                    No certificates have been issued yet.
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

export default CertificateRegistry;
