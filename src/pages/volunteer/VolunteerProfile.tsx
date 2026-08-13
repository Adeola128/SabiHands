import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useProfileCompleteness } from '../../hooks/useProfileCompleteness';
import { uploadImage } from '../../lib/uploadImage';
import ProfileCompletenessPrompt from '../../components/ProfileCompletenessPrompt';
import LoadingScreen from '../../components/LoadingScreen';
import './VolunteerProfile.css';

const VolunteerProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ hours: 0, completed: 0, rating: 0.0 });
  const [certificates, setCertificates] = useState<any[]>([]);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

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
        setProfile({
          full_name: user.user_metadata?.full_name || 'New Volunteer',
          location: user.user_metadata?.location || 'Location Not Set',
        });
      }
      
      const { data: ratingData } = await supabase
        .from('ratings')
        .select('score')
        .eq('ratee_id', user.id);
        
      let avgRating = 0;
      if (ratingData && ratingData.length > 0) {
        avgRating = ratingData.reduce((acc, curr) => acc + curr.score, 0) / ratingData.length;
      }

      const { data: applications } = await supabase
        .from('applications')
        .select('id')
        .eq('volunteer_id', user.id)
        .eq('status', 'accepted');
        
      const completedCount = applications ? applications.length : 0;
      const calculatedHours = completedCount * 2;

      const { data: certs } = await supabase
        .from('certificates')
        .select('*')
        .eq('volunteer_id', user.id)
        .order('issued_at', { ascending: false });
        
      setCertificates(certs || []);

      setStats({ 
        rating: Number(avgRating.toFixed(1)),
        completed: completedCount,
        hours: calculatedHours
      });

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadImage(e.target.files[0], 'volunteer-avatars');
      const { error } = await supabase.from('volunteer_profiles').update({ avatar_url: url }).eq('user_id', user.id);
      if (!error) setProfile((prev: any) => ({ ...prev, avatar_url: url }));
    } catch (err: any) {
      console.error(err);
      alert('Failed to upload profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    setUploadingCover(true);
    try {
      const url = await uploadImage(e.target.files[0], 'volunteer-covers');
      const { error } = await supabase.from('volunteer_profiles').update({ cover_url: url }).eq('user_id', user.id);
      if (!error) setProfile((prev: any) => ({ ...prev, cover_url: url }));
    } catch (err: any) {
      console.error(err);
      alert('Failed to upload cover picture.');
    } finally {
      setUploadingCover(false);
    }
  };

  const completeness = useProfileCompleteness(profile, 'volunteer');

  if (loading) return <LoadingScreen message="Loading profile..." fullScreen={false} />;

  const initials = profile?.full_name?.substring(0, 2).toUpperCase() || 'VO';
  const hasSkills = profile?.skills && profile.skills.length > 0;
  const hasInterests = profile?.interests && profile.interests.length > 0;

  return (
    <div className="modern-profile-container">
      
      {/* ── PROFILE COMPLETENESS PROMPT ── */}
      <ProfileCompletenessPrompt 
        score={completeness.score} 
        nextStep={completeness.nextStep || null} 
        editLink="/dashboard/volunteer/settings" 
      />

      {/* ── HERO SECTION ── */}
      <div className="profile-hero-card">
        {/* Cover Photo Area */}
        <div className="profile-cover-area" style={{ backgroundImage: profile?.cover_url ? `url(${profile.cover_url})` : undefined }}>
          {uploadingCover && <div className="uploading-overlay">Uploading...</div>}
          <label className="image-edit-btn cover-edit-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            <span>Edit Cover</span>
            <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={uploadingCover} hidden />
          </label>
        </div>
        
        {/* Profile Info Area */}
        <div className="profile-hero-info">
          <div className="profile-avatar-container">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">{initials}</div>
            )}
            
            <label className="avatar-edit-overlay">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} hidden />
            </label>

            <div className="profile-verified-badge" title="Verified Volunteer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
          
          <div className="profile-header-details">
            <div className="profile-title-block">
              <h1 className="profile-name">{profile?.full_name || 'Anonymous Volunteer'}</h1>
              <div className="profile-headline">{profile?.headline || 'Volunteer at Ralvo'}</div>
              <div className="profile-location">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {profile?.location || 'Location Not Set'}
              </div>
            </div>
            
            <div className="profile-actions">
              <Link to="/dashboard/volunteer/settings" className="profile-btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Edit Details
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="modern-profile-grid">
        {/* ── MAIN CONTENT (LEFT) ── */}
        <div className="profile-main-col">
          {/* About */}
          <div className="profile-content-card">
            <h2 className="profile-section-title">About Me</h2>
            <p className="profile-bio-text">
              {profile?.bio || 'This volunteer hasn\'t added a bio yet.'}
            </p>
          </div>

          {/* Certificates */}
          <div className="profile-content-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="profile-section-title" style={{ margin: 0 }}>Certificates & Badges</h2>
              <Link to="/dashboard/volunteer/certificates" className="profile-link-viewall">View All</Link>
            </div>
            
            {certificates.length > 0 ? (
              <div className="profile-cert-list">
                {certificates.slice(0, 3).map((cert) => (
                  <div key={cert.id} className="profile-cert-item">
                    <div className="cert-icon-box">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"/></svg>
                    </div>
                    <div className="cert-details">
                      <div className="cert-title">Certificate of Completion</div>
                      <div className="cert-date">Issued: {new Date(cert.issued_at || cert.created_at || Date.now()).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="profile-empty-state">No certificates earned yet.</div>
            )}
          </div>
        </div>

        {/* ── SIDEBAR (RIGHT) ── */}
        <div className="profile-sidebar-col">
          {/* Stats Box */}
          <div className="profile-content-card stats-card">
            <h2 className="profile-section-title">Impact</h2>
            <div className="profile-stats-grid">
              <div className="stat-box">
                <span className="stat-number">{stats.hours}</span>
                <span className="stat-label">Hours</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{stats.completed}</span>
                <span className="stat-label">Gigs</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{stats.rating}</span>
                <span className="stat-label">Rating</span>
              </div>
            </div>
          </div>

          {/* Contact / Social */}
          {(profile?.linkedin_url || profile?.portfolio_url) && (
            <div className="profile-content-card">
              <h2 className="profile-section-title">Links</h2>
              <div className="profile-links-list">
                {profile?.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="profile-social-link">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    LinkedIn
                  </a>
                )}
                {profile?.portfolio_url && (
                  <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="profile-social-link">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {hasSkills && (
            <div className="profile-content-card">
              <h2 className="profile-section-title">Skills</h2>
              <div className="profile-tags-wrapper">
                {profile.skills.map((skill: string, index: number) => (
                  <span key={index} className="profile-tag skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Causes */}
          {hasInterests && (
            <div className="profile-content-card">
              <h2 className="profile-section-title">Causes I Care About</h2>
              <div className="profile-tags-wrapper">
                {profile.interests.map((interest: string, index: number) => (
                  <span key={index} className="profile-tag cause-tag">{interest}</span>
                ))}
              </div>
            </div>
          )}

          {/* Verifications */}
          <div className="profile-content-card">
            <h2 className="profile-section-title">Verifications</h2>
            <div className="verification-list">
              <div className="verification-item verified">
                <div className="ver-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>
                <span>Email Address Verified</span>
              </div>
              <div className={`verification-item ${profile?.phone ? 'verified' : 'unverified'}`}>
                <div className="ver-icon">
                  {profile?.phone ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>}
                </div>
                <span>{profile?.phone ? 'Phone Number Verified' : 'Phone Not Verified'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VolunteerProfile;

