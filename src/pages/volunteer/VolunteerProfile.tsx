import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useProfileCompleteness } from '../../hooks/useProfileCompleteness';
import ProfileCompletenessPrompt from '../../components/ProfileCompletenessPrompt';
import LoadingScreen from '../../components/LoadingScreen';
import './VolunteerProfile.css';

const VolunteerProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ hours: 0, completed: 0, rating: 0.0 });
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('volunteer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (data) {
        setProfile(data);
      } else {
        // Handle new users
        setProfile({
          full_name: user.user_metadata?.full_name || 'New Volunteer',
          location: user.user_metadata?.location || 'Location Not Set',
        });
      }
      
      // Fetch ratings for volunteer
      const { data: ratingData } = await supabase
        .from('ratings')
        .select('score')
        .eq('ratee_id', user.id);
        
      let avgRating = 0;
      if (ratingData && ratingData.length > 0) {
        avgRating = ratingData.reduce((acc, curr) => acc + curr.score, 0) / ratingData.length;
      }

      // Fetch completed gigs (applications with status 'accepted')
      const { data: applications } = await supabase
        .from('applications')
        .select('id')
        .eq('volunteer_id', user.id)
        .eq('status', 'accepted');
        
      const completedCount = applications ? applications.length : 0;
      const calculatedHours = completedCount * 2; // Fixed estimate per completed gig

      // Fetch certificates
      const { data: certs } = await supabase
        .from('certificates')
        .select('*')
        .eq('volunteer_id', user.id)
        .order('issued_at', { ascending: false });
        
      setCertificates(certs || []);

      setStats(prev => ({ 
        ...prev, 
        rating: Number(avgRating.toFixed(1)),
        completed: completedCount,
        hours: calculatedHours
      }));

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const completeness = useProfileCompleteness(profile, 'volunteer');

  if (loading) return <LoadingScreen message="Loading profile..." fullScreen={false} />;

  const initials = profile?.full_name?.substring(0, 2).toUpperCase() || 'VO';
  const hasSkills = profile?.skills && profile.skills.length > 0;
  const hasInterests = profile?.interests && profile.interests.length > 0;

  return (
    <div className="vol-profile-container">
      
      {/* â”€â”€ PROFILE COMPLETENESS PROMPT â”€â”€ */}
      <ProfileCompletenessPrompt 
        score={completeness.score} 
        nextStep={completeness.nextStep || null} 
        editLink="/dashboard/volunteer/settings" 
      />

      {/* â”€â”€ HERO SECTION â”€â”€ */}
      <div className="vol-profile-hero">
        <div className="vol-profile-cover" style={{ backgroundImage: profile?.cover_url ? `url(${profile.cover_url})` : undefined }} />
        
        <div className="vol-profile-header-content">
          <div>
            <div className="vol-profile-avatar-wrapper">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="vol-profile-avatar" style={{ objectFit: 'cover' }} />
              ) : (
                <div className="vol-profile-avatar">{initials}</div>
              )}
              <div className="vol-verified-badge" title="Verified Volunteer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            
            <div className="vol-profile-info">
              <h1 className="vol-profile-name">
                {profile?.full_name || 'Anonymous Volunteer'}
              </h1>
              <div className="vol-profile-headline">
                <span>{profile?.headline || 'Volunteer at Gigway'}</span>
                <span style={{ color: '#D1CEDF' }}>â€¢</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {profile?.location || 'Location Not Set'}
                </span>
              </div>
              
              <div className="vol-profile-stats-bar">
                <div className="vol-stat-item">
                  <span className="vol-stat-value">{stats.hours}</span>
                  <span className="vol-stat-label">Hours Volunteered</span>
                </div>
                <div className="vol-stat-item">
                  <span className="vol-stat-value">{stats.completed}</span>
                  <span className="vol-stat-label">Gigs Completed</span>
                </div>
                <div className="vol-stat-item">
                  <span className="vol-stat-value">{stats.rating}</span>
                  <span className="vol-stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal-500)" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Rating
                  </span>
                </div>
              </div>

              {/* Social Links */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                {profile?.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--purple-600)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    LinkedIn
                  </a>
                )}
                {profile?.portfolio_url && (
                  <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--purple-600)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="vol-edit-btn" style={{ display: 'flex', gap: '12px' }}>
            <Link to="/dashboard/volunteer/settings" style={{ padding: '12px 24px', backgroundColor: 'var(--paper)', color: 'var(--ink)', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', border: '1px solid #E4E1F5', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="vol-profile-grid">
        {/* â”€â”€ LEFT COLUMN â”€â”€ */}
        <div>
          {/* About */}
          <div className="vol-card">
            <h2 className="vol-card-title">About Me</h2>
            <p style={{ fontSize: '15px', color: 'var(--body)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
              {profile?.bio || 'This volunteer hasn\'t added a bio yet.'}
            </p>
          </div>

          {/* Skills */}
          {hasSkills && (
            <div className="vol-card">
              <h2 className="vol-card-title">Skills & Expertise</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.skills.map((skill: string, index: number) => (
                  <span key={index} className="vol-skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Causes */}
          {hasInterests && (
            <div className="vol-card">
              <h2 className="vol-card-title">Causes I Care About</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.interests.map((interest: string, index: number) => (
                  <div key={index} className="vol-cause-tag">
                    {interest}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verifications */}
          <div className="vol-card">
            <h2 className="vol-card-title">Verifications</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ fontSize: '15px', color: 'var(--ink)', fontWeight: 500 }}>Email Address Verified</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: profile?.phone ? 'var(--teal-50)' : '#F3F2F9', color: profile?.phone ? 'var(--teal-600)' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {profile?.phone ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>}
                </div>
                <span style={{ fontSize: '15px', color: profile?.phone ? 'var(--ink)' : 'var(--muted)', fontWeight: 500 }}>{profile?.phone ? 'Phone Number Verified' : 'Phone Not Verified'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* â”€â”€ RIGHT COLUMN â”€â”€ */}
        <div>
          {/* Certificates & Badges */}
          <div className="vol-card">
            <h2 className="vol-card-title">
              Certificates & Badges
              <Link to="/dashboard/volunteer/certificates" style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--purple-600)', textDecoration: 'none', fontWeight: 600 }}>View All</Link>
            </h2>
            
            {certificates.length > 0 ? (
              certificates.slice(0, 3).map((cert) => (
                <div key={cert.id} className="vol-cert-mini">
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--teal-400), var(--purple-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Certificate of Completion</div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>Issued: {new Date(cert.issued_at || cert.created_at || Date.now()).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
                No certificates earned yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerProfile;

