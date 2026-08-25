import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useProfileCompleteness } from '../../hooks/useProfileCompleteness';
import { uploadImage } from '../../lib/uploadImage';
import ProfileCompletenessPrompt from '../../components/ProfileCompletenessPrompt';
import LoadingScreen from '../../components/LoadingScreen';
import './OrganizationProfile.css';

const OrganizationProfile: React.FC = () => {
  const { user } = useAuth();
  const [org, setOrg] = useState<any>(null);
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ volunteers: 0, gigs: 0 });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchOrg = async () => {
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (data) {
        setOrg(data);
        
        // Fetch all gigs to get total count
        const { count: totalGigs } = await supabase
          .from('gigs')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', data.id);
          
        let volunteersCount = 0;
        
        if (totalGigs && totalGigs > 0) {
          const { data: appsData } = await supabase
            .from('applications')
            .select('volunteer_id, gigs!inner(organization_id)')
            .eq('gigs.organization_id', data.id)
            .in('status', ['accepted', 'completed', 'certified']);
            
          if (appsData) {
            volunteersCount = new Set(appsData.map(a => a.volunteer_id)).size;
          }
        }
        
        setStats({ volunteers: volunteersCount, gigs: totalGigs || 0 });
        
        const { data: gigsData } = await supabase
          .from('gigs')
          .select('*')
          .eq('organization_id', data.id)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (gigsData) setGigs(gigsData);
      } else {
        setOrg({
          name: user.user_metadata?.full_name || 'New Organization',
        });
      }
      setLoading(false);
    };

    fetchOrg();
  }, [user]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    setUploadingLogo(true);
    try {
      const url = await uploadImage(e.target.files[0], 'org-logos');
      const { error } = await supabase.from('organizations').update({ logo_url: url }).eq('user_id', user.id);
      if (!error) setOrg((prev: any) => ({ ...prev, logo_url: url }));
    } catch (err: any) {
      console.error(err);
      alert('Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    setUploadingCover(true);
    try {
      const url = await uploadImage(e.target.files[0], 'org-covers');
      const { error } = await supabase.from('organizations').update({ cover_url: url }).eq('user_id', user.id);
      if (!error) setOrg((prev: any) => ({ ...prev, cover_url: url }));
    } catch (err: any) {
      console.error(err);
      alert('Failed to upload cover picture.');
    } finally {
      setUploadingCover(false);
    }
  };

  const completeness = useProfileCompleteness(org, 'organization');

  if (loading) return <LoadingScreen message="Loading profile..." fullScreen={false} />;

  const initials = org?.name?.substring(0, 2).toUpperCase() || 'OG';

  return (
    <div className="modern-profile-container">
      
      {/* ── PROFILE COMPLETENESS PROMPT ── */}
      <ProfileCompletenessPrompt 
        score={completeness.score} 
        nextStep={completeness.nextStep || null} 
        editLink="/dashboard/org/settings" 
      />

      {/* ── HERO SECTION ── */}
      <div className="profile-hero-card">
        {/* Cover Photo Area */}
        <div className="profile-cover-area" style={{ backgroundImage: org?.cover_url ? `url(${org.cover_url})` : undefined }}>
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
            {org?.logo_url ? (
              <img src={org.logo_url} alt={org.name} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">{initials}</div>
            )}
            
            <label className="avatar-edit-overlay">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} hidden />
            </label>

            {org?.verification_status === 'verified' && (
              <div className="profile-verified-badge" title="Verified NGO">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10" stroke="white" strokeWidth="2" fill="none"></polyline></svg>
              </div>
            )}
          </div>
          
          <div className="profile-header-details">
            <div className="profile-title-block">
              <h1 className="profile-name">{org?.name || 'Unnamed Organization'}</h1>
              <div className="profile-headline">
                {org?.bio ? (org.bio.length > 80 ? org.bio.substring(0, 80) + '...' : org.bio) : 'Organization bio not provided.'}
              </div>
              <div className="profile-location">
                {org?.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {org.location}
                  </span>
                )}
                {org?.org_type && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                    {org.org_type}
                  </span>
                )}
              </div>
            </div>
            
            <div className="profile-actions">
              <Link to="/dashboard/org/settings" className="profile-btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="modern-profile-grid">
        
        {/* ── MAIN CONTENT (LEFT) ── */}
        <div className="profile-main-col">
          
          {/* About Us */}
          <div className="profile-content-card">
            <h2 className="profile-section-title">About Us</h2>
            <p className="profile-bio-text">
              {org?.bio || 'This organization has not added a detailed bio yet.'}
            </p>
          </div>

          {/* Gigs / Available Roles */}
          <div className="profile-content-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="profile-section-title" style={{ margin: 0 }}>Available Roles ({gigs.length})</h2>
              {gigs.length > 0 && (
                <Link to="/dashboard/org/gigs" className="profile-link-viewall">
                  View all
                </Link>
              )}
            </div>
            
            {gigs.length === 0 ? (
              <div className="profile-empty-state">
                <p style={{ margin: '0 0 16px' }}>No active gigs posted yet.</p>
                <Link to="/dashboard/org/gigs/new" className="profile-btn-secondary" style={{ display: 'inline-flex', justifyContent: 'center' }}>
                  Post a Gig
                </Link>
              </div>
            ) : (
              <div className="org-gigs-grid">
                {gigs.map(gig => (
                  <Link key={gig.id} to={`/dashboard/org/gigs/${gig.id}`} className="gig-media-card-horizontal">
                    <div className="gig-media-cover-horizontal" style={{ backgroundImage: `url(${gig.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=random&size=400`})` }}></div>
                    <div className="gig-media-body-horizontal">
                      <h3 className="gig-media-title">{gig.title}</h3>
                      <div className="gig-tags" style={{ marginTop: '8px', marginBottom: '16px' }}>
                        <span className={`tag ${gig.type === 'skilled' ? 'skilled' : 'physical'}`}>
                          {gig.type === 'skilled' ? 'Skilled' : 'Physical'}
                        </span>
                        {gig.location === 'Remote' && <span className="tag physical">Remote</span>}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E4E1F5', paddingTop: '16px', marginTop: 'auto' }}>
                        <span style={{ fontSize: '13px', color: 'var(--body)' }}>
                          {new Date(gig.created_at).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" })}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--purple-600)' }}>Manage &rarr;</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── SIDEBAR (RIGHT) ── */}
        <div className="profile-sidebar-col">
          
          {/* Impact Stats Box */}
          <div className="profile-content-card stats-card">
            <h2 className="profile-section-title">Our Impact</h2>
            <div className="profile-stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className="stat-box">
                <span className="stat-number">{stats.volunteers}</span>
                <span className="stat-label">Volunteers</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{stats.gigs}</span>
                <span className="stat-label">Gigs Posted</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="profile-content-card">
            <h2 className="profile-section-title">Contact Info</h2>
            <div className="profile-links-list">
              
              {/* Website */}
              <div className="profile-social-link" style={{ background: 'transparent', padding: '0', cursor: 'default' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                <span style={{ color: 'var(--ink)' }}>
                  {org?.website ? <a href={org.website.startsWith('http') ? org.website : `https://${org.website}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--purple-600)' }}>{org.website}</a> : 'Not provided'}
                </span>
              </div>

              {/* Email */}
              <div className="profile-social-link" style={{ background: 'transparent', padding: '0', cursor: 'default' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <span style={{ color: 'var(--ink)' }}>{org?.contact_email || 'Not provided'}</span>
              </div>

              {/* Phone */}
              <div className="profile-social-link" style={{ background: 'transparent', padding: '0', cursor: 'default' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                <span style={{ color: 'var(--ink)' }}>{org?.contact_phone || 'Not provided'}</span>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default OrganizationProfile;
