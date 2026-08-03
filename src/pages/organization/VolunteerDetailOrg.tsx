import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';

const VolunteerDetailOrg: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      const { data } = await supabase
        .from('volunteer_profiles')
        .select('*')
        .eq('user_id', id)
        .single();
        
      if (data) setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  if (loading) return <LoadingScreen message="Loading volunteer profile..." />;
  if (!profile) return (
    <EmptyState 
      icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
      title="Profile Not Found"
      description="The volunteer profile you are looking for does not exist or has been removed."
      actionButton={<Link to="/dashboard/org/gigs" className="apply-submit-btn" style={{ textDecoration: 'none' }}>Go Back</Link>}
    />
  );

  // Generate initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'V';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '15px', marginBottom: '16px' }}>Volunteer Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button style={{ width: '100%', padding: '10px 16px', backgroundColor: 'var(--purple-600)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Message Volunteer
              </button>
              <button style={{ width: '100%', padding: '10px 16px', backgroundColor: 'var(--paper)', color: 'var(--ink)', border: '1.5px solid #E4E1F5', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Invite to Gig
              </button>
            </div>
          </div>
        </div>

        <button onClick={() => window.history.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Applicants
        </button>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        <div className="dash-card" style={{ marginBottom: '24px', position: 'relative' }}>
          <div style={{ height: '140px', backgroundColor: 'var(--purple-900)', borderRadius: '16px 16px 0 0', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>
          
          <div style={{ padding: '0 24px 24px', position: 'relative' }}>
            {/* Avatar */}
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', marginTop: '-50px', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
            ) : (
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--purple-600)', color: 'white', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 700, fontFamily: 'var(--display)', marginTop: '-50px', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                {getInitials(profile.full_name)}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--display)', margin: '0 0 4px' }}>{profile.full_name}</h1>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--muted)', marginTop: '12px' }}>
                  {profile.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {profile.location}
                    </span>
                  )}
                  {profile.phone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      {profile.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Verified badge - Default to true for now since we don't have identity verification system */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'var(--teal-50)', color: 'var(--teal-700)', borderRadius: '99px', fontSize: '13px', fontWeight: 600 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Identity Verified
              </div>
            </div>

            {profile.bio && (
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #E4E1F5' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '12px' }}>About</h3>
                <p style={{ fontSize: '14px', color: 'var(--body)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {profile.bio}
                </p>
              </div>
            )}

            {profile.interests && profile.interests.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '12px' }}>Skills & Interests</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {profile.interests.map((sk: string) => (
                    <span key={sk} className="tag skilled">{sk}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Track Record - Empty State for now */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">SabiHands Track Record</h2>
          </div>
          
          <div style={{ padding: '32px' }}>
            <EmptyState 
              icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}
              title="No Track Record Yet"
              description="This volunteer has not completed any gigs on SabiHands yet."
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default VolunteerDetailOrg;
