import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';

const typeStyles: Record<string, { bg: string; color: string }> = {
  Mentorship:  { bg: '#EDE9FF', color: 'var(--purple-700)' },
  Medical:     { bg: '#FEF0E7', color: '#C05621' },
  Logistics:   { bg: '#E6FAF4', color: 'var(--teal-700)' },
  Environment: { bg: '#E8F9EE', color: '#276749' },
};

const MyCertificates: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('certificates')
        .select(`
          *,
          gigs(title, type, description, organizations(name, logo_url)),
          attendance(hours)
        `)
        .eq('volunteer_id', user.id)
        .order('issued_at', { ascending: false });

      if (data) {
        setCertificates(data);
        const hours = data.reduce((acc, curr) => acc + (curr.attendance?.hours || 0), 0);
        setTotalHours(hours);
      }
      setLoading(false);
    };
    fetchCerts();
  }, [user]);

  if (loading) return <LoadingScreen message="Loading certificates..." fullScreen={true} />;

  return (
    <>
      {/* â”€â”€ LEFT SIDEBAR â”€â”€ */}
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '16px', marginBottom: '16px' }}>Your Impact</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '4px' }}>
              <div style={{ padding: '16px 8px', backgroundColor: 'var(--paper)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--display)' }}>{certificates.length}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>Certificates</div>
              </div>
              <div style={{ padding: '16px 8px', backgroundColor: 'var(--paper)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--teal-600)', fontFamily: 'var(--display)' }}>{totalHours}h</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>Hours</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '16px', marginBottom: '20px' }}>Filter by Type</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['All Types', 'Mentorship', 'Medical', 'Logistics', 'Environment'].map(type => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', padding: '4px 0' }}>
                  <input type="checkbox" defaultChecked={type === 'All Types'} style={{ width: '16px', height: '16px', accentColor: 'var(--purple-600)' }} />
                  {type}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '15px', marginBottom: '12px' }}>Share your achievements</h2>
            <p style={{ fontSize: '13px', color: 'var(--body)', lineHeight: 1.5, marginBottom: '16px' }}>
              All Ralvo certificates are publicly verifiable. Add them to your LinkedIn or share a link directly.
            </p>
            <Link to="/dashboard/volunteer/profile" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '10px 16px', backgroundColor: 'var(--white)', border: '1.5px solid #E4E1F5', borderRadius: '8px', color: 'var(--ink)', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
              View Public Profile
            </Link>
          </div>
        </div>
      </aside>

      {/* â”€â”€ MAIN CONTENT â”€â”€ */}
      <div className="main-content">
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">My Certificates</h2>
            <span style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 500 }}>{certificates.length} earned</span>
          </div>

          {certificates.length === 0 && (
            <EmptyState 
              icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>}
              title="No Certificates Yet"
              description="You haven't earned any certificates yet. Complete gigs and have your attendance marked to earn your verified certificates."
              actionButton={<Link to="/dashboard/volunteer/gigs" style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: 'var(--purple-600)', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: 700, boxShadow: '0 4px 12px rgba(83,74,183,0.3)' }}>Find Gigs</Link>}
            />
          )}
          {certificates.map((cert) => {
            const gigType = cert.gigs?.type || 'Mentorship';
            const orgName = cert.gigs?.organizations?.name || 'Unknown Org';
            return (
            <div key={cert.id} className="gig-media-card">
              <div className="gig-media-cover" style={{ backgroundImage: `url(/images/automated_certificates.png)` }} />
              <div className="gig-media-body">
                <div className="gig-media-header">
                  <div>
                    <h3 className="gig-media-title">{cert.gigs?.title}</h3>
                    <div className="gig-media-org">
                      {cert.gigs?.organizations?.logo_url ? (
                        <img src={cert.gigs.organizations.logo_url} alt={orgName} style={{ objectFit: 'contain' }} />
                      ) : (
                        <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: 'var(--purple-100)', color: 'var(--purple-700)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '10px', flexShrink: 0 }}>
                          {orgName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <strong>{orgName}</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span
                      className="tag status"
                      style={{
                        backgroundColor: typeStyles[gigType]?.bg ?? 'var(--paper)',
                        color: typeStyles[gigType]?.color ?? 'var(--ink)',
                      }}
                    >
                      {gigType}
                    </span>
                    <div style={{ fontSize: '12px', color: 'var(--body)', marginTop: '6px' }}>{new Date(cert.issued_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <p style={{ color: 'var(--body)', fontSize: '14px', margin: '0 0 16px 0', lineHeight: 1.6 }}>{cert.gigs?.description || 'Awarded for successful volunteering.'}</p>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Link to={`/dashboard/volunteer/certificates/${cert.verification_code}`} className="gig-action" style={{ textDecoration: 'none' }}>
                    View &amp; Share
                  </Link>
                  <button
                    className="gig-action"
                    style={{ background: 'none', border: '1.5px solid #E4E1F5', color: 'var(--body)' }}
                    onClick={() => navigator.clipboard.writeText(`https://Ralvo.com/verify/${cert.verification_code}`)}
                  >
                    Copy Link
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--teal-600)', fontWeight: 600, marginLeft: 'auto' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                    Verified on Ralvo
                  </span>
                </div>
              </div>
            </div>
          )})}
        </div>

        {/* Footer CTA */}
        <div style={{ marginTop: '24px', padding: '24px', backgroundColor: 'var(--white)', borderRadius: '16px', border: '1px dashed #D1CEDF', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '12px' }}>
            Keep volunteering to earn more certificates and build your professional portfolio.
          </p>
          <Link to="/dashboard/volunteer/gigs" className="gig-action" style={{ textDecoration: 'none' }}>
            Browse Available Gigs
          </Link>
        </div>
      </div>
    </>
  );
};

export default MyCertificates;

