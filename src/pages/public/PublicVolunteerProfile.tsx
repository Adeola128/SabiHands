import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';
import { extractIdFromSeoUrl } from '../../utils/url';
import '../volunteer/VolunteerProfile.css';

const PublicVolunteerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({ hours: 0, completed: 0, rating: 0.0 });
  const [certificates, setCertificates] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    
    // Parse SEO URL to get the actual UUID
    const actualId = extractIdFromSeoUrl(id);
    
    if (!actualId) {
      setError("Invalid profile URL.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(actualId);
        if (!isUUID) {
          setError("Invalid profile URL.");
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('volunteer_profiles')
          .select('*')
          .or(`id.eq.${actualId},user_id.eq.${actualId}`)
          .single();
          
        if (fetchError || !data) {
          setError("Volunteer not found or profile is incomplete.");
          setLoading(false);
          return;
        }
        
        setProfile(data);
        
        // Fetch reviews
        const { data: ratingData } = await supabase
          .from('reviews')
          .select(`
            id,
            rating,
            comment,
            created_at,
            gigs(
              title,
              organizations(name, logo_url)
            )
          `)
          .eq('reviewee_id', actualId)
          .order('created_at', { ascending: false });
          
        let avgRating = 0;
        if (ratingData && ratingData.length > 0) {
          avgRating = ratingData.reduce((acc, curr) => acc + curr.rating, 0) / ratingData.length;
          setReviews(ratingData);
        }

        // Fetch completed gigs
        const { data: applications } = await supabase
          .from('gig_applications')
          .select('id, status, gigs(duration_hours)')
          .eq('volunteer_id', actualId)
          .in('status', ['accepted', 'completed', 'certified']);

        let totalHours = 0;
        let completed = 0;
        if (applications) {
          completed = applications.length;
          totalHours = applications.reduce((acc, curr: any) => acc + (curr.gigs?.duration_hours || 0), 0);
        }

        setStats({ hours: totalHours, completed, rating: avgRating });

        // Fetch certificates
        const { data: certs } = await supabase
          .from('certificates')
          .select('*')
          .eq('volunteer_id', actualId)
          .order('issued_at', { ascending: false });
          
        if (certs) setCertificates(certs);

      } catch (err) {
        console.error("Error fetching volunteer profile:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) return <LoadingScreen />;

  if (error || !profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1EFFB' }}>
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: 'var(--ink)' }}>{error || 'Profile not found'}</h2>
          <Link to="/" style={{ color: 'var(--purple-600)', fontWeight: 600, textDecoration: 'none', marginTop: '16px', display: 'inline-block' }}>Return Home</Link>
        </div>
      </div>
    );
  }

  const initials = profile?.full_name?.substring(0, 2).toUpperCase() || 'VO';
  const hasSkills = profile?.skills && profile.skills.length > 0;

  // Gamification: Impact Rings (Apple style rings logic)
  const hoursRing = Math.min((stats.hours / 50) * 100, 100);
  const gigsRing = Math.min((stats.completed / 10) * 100, 100);
  const certsRing = Math.min((certificates.length / 5) * 100, 100);

  const getTier = (completed: number) => {
    if (completed >= 25) return 'Super Volunteer';
    if (completed >= 10) return 'Local Hero';
    if (completed >= 5) return 'Community Champion';
    return 'Rising Star';
  };

  return (
    <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh', paddingBottom: '80px' }}>
      <Helmet>
        <title>{profile?.full_name || 'Volunteer'} &mdash; Ralvo</title>
        <meta name="description" content={`View the volunteer profile and impact of ${profile?.full_name || 'this volunteer'} on Ralvo.`} />
      </Helmet>
      
      {/* ── PREMIUM HEADER ── */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '60px 24px 32px 24px' }}>
        <div className="desktop-header-layout" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '32px' }}>
          
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flex: '1 1 auto' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--purple-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 700, color: 'var(--purple-600)', backgroundImage: profile?.avatar_url ? `url(${profile.avatar_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', border: '4px solid #FFFFFF', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', position: 'relative', flexShrink: 0 }}>
              {!profile?.avatar_url && initials}
              <div style={{ position: 'absolute', bottom: '0', right: '0', backgroundColor: 'var(--teal-500)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', border: '3px solid #FFF' }} title="Verified Diamond Volunteer">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>

            <div style={{ paddingTop: '8px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px 0', fontFamily: 'var(--display)', letterSpacing: '-0.02em' }}>
                {profile?.full_name}
              </h1>
              <div style={{ fontSize: '16px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>{profile?.location || 'Location Not Set'}</span>
                &bull;
                <span style={{ color: 'var(--teal-600)', fontWeight: 600 }}>{getTier(stats.completed)}</span>
              </div>
            </div>
          </div>
          
          {/* IMPACT RINGS */}
          <div className="impact-rings-container" style={{ display: 'flex', gap: '32px', flexShrink: 0 }}>
            <div className="impact-ring-card">
              <div className="ring-container" style={{ background: `conic-gradient(var(--purple-500) ${hoursRing}%, #F1EFFB 0)` }}>
                <div className="ring-inner">
                  <span className="ring-value">{stats.hours}</span>
                  <span className="ring-label">Hours</span>
                </div>
              </div>
            </div>
            <div className="impact-ring-card">
              <div className="ring-container" style={{ background: `conic-gradient(var(--teal-500) ${gigsRing}%, #E6F8F5 0)` }}>
                <div className="ring-inner">
                  <span className="ring-value">{stats.completed}</span>
                  <span className="ring-label">Gigs</span>
                </div>
              </div>
            </div>
            <div className="impact-ring-card">
              <div className="ring-container" style={{ background: `conic-gradient(#F59E0B ${certsRing}%, #FEF3C7 0)` }}>
                <div className="ring-inner">
                  <span className="ring-value">{certificates.length}</span>
                  <span className="ring-label">Certs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '40px auto 0', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', padding: '0 24px', alignItems: 'start' }} className="responsive-grid">
        
        {/* ── MAIN CONTENT (LEFT) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="premium-card">
            <h2 className="premium-card-title">About</h2>
            <p style={{ fontSize: '16px', color: 'var(--body)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
              {profile?.bio || 'This volunteer is busy making an impact and hasn\'t added a bio yet.'}
            </p>
          </div>

          <div className="premium-card">
            <h2 className="premium-card-title">Reviews & Feedback</h2>
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev.id} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--purple-50)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--purple-600)' }}>
                    {rev.gigs?.organizations?.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{rev.gigs?.organizations?.name}</span>
                      <div style={{ display: 'flex' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill={star <= rev.rating ? "#F59E0B" : "none"} stroke={star <= rev.rating ? "#F59E0B" : "#CBD5E1"} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '8px' }}>For "{rev.gigs?.title}"</div>
                    {rev.comment && <p style={{ fontSize: '15px', color: 'var(--body)', margin: 0, lineHeight: 1.6 }}>"{rev.comment}"</p>}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--muted)', margin: 0 }}>No reviews yet.</p>
            )}
          </div>
        </div>

        {/* ── SIDEBAR (RIGHT) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="premium-card">
             <h2 className="premium-card-title">Skills</h2>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
               {hasSkills ? profile.skills.map((s: string) => (
                 <span key={s} style={{ padding: '6px 12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '20px', fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>{s}</span>
               )) : <span style={{ color: 'var(--muted)' }}>No skills listed.</span>}
             </div>
          </div>

          <div className="premium-card">
             <h2 className="premium-card-title">Impact Areas</h2>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
               {profile?.primary_goals ? profile.primary_goals.map((g: string) => (
                 <span key={g} style={{ padding: '6px 12px', backgroundColor: 'var(--teal-50)', color: 'var(--teal-700)', borderRadius: '20px', fontSize: '14px', fontWeight: 600 }}>{g}</span>
               )) : <span style={{ color: 'var(--muted)' }}>No impact areas selected.</span>}
             </div>
          </div>

          <div className="premium-card">
            <h2 className="premium-card-title">Certificates</h2>
            {certificates.length > 0 ? certificates.map((cert) => (
              <div key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--teal-400), var(--purple-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Completion Badge</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Issued: {new Date(cert.issued_at || cert.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            )) : <p style={{ color: 'var(--muted)', margin: 0 }}>No certificates yet.</p>}
          </div>

        </div>
      </div>
      
      <style>{`
        .impact-ring-card {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .ring-container {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ring-inner {
          width: 74px;
          height: 74px;
          background-color: #FFFFFF;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        }
        .ring-value {
          font-size: 20px;
          font-weight: 800;
          color: var(--ink);
          line-height: 1;
        }
        .ring-label {
          font-size: 11px;
          color: var(--muted);
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 4px;
        }
        .premium-card {
          background-color: #FFFFFF;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.02);
        }
        .premium-card-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--ink);
          margin: 0 0 20px 0;
          letter-spacing: -0.01em;
        }
        @media (max-width: 900px) {
          .responsive-grid {
            grid-template-columns: 1fr !important;
          }
          .desktop-header-layout {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center;
          }
          .desktop-header-layout > div:first-child {
            flex-direction: column !important;
            align-items: center !important;
          }
          .impact-rings-container {
            justify-content: center;
            margin-top: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default PublicVolunteerProfile;
