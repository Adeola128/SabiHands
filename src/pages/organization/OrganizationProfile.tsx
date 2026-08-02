import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useProfileCompleteness } from '../../hooks/useProfileCompleteness';
import ProfileCompletenessPrompt from '../../components/ProfileCompletenessPrompt';
import LoadingScreen from '../../components/LoadingScreen';
import './OrganizationProfile.css';

const OrganizationProfile: React.FC = () => {
  const { user } = useAuth();
  const [org, setOrg] = useState<any>(null);
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats (placeholder data for now until we have real tables for this)
  const stats = { volunteers: 85, gigs: gigs.length || 0 };

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
        
        // Fetch gigs for this organization
        const { data: gigsData } = await supabase
          .from('gigs')
          .select('*')
          .eq('organization_id', data.id)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (gigsData) setGigs(gigsData);
      } else {
        // Handle new organizations
        setOrg({
          name: user.user_metadata?.full_name || 'New Organization',
        });
      }
      setLoading(false);
    };

    fetchOrg();
  }, [user]);

  const completeness = useProfileCompleteness(org, 'organization');

  if (loading) return <LoadingScreen message="Loading profile..." fullScreen={false} />;

  const initials = org?.name?.substring(0, 2).toUpperCase() || 'OG';

  return (
    <div className="org-profile-container">
      
      {/* ── PROFILE COMPLETENESS PROMPT ── */}
      <ProfileCompletenessPrompt 
        score={completeness.score} 
        nextStep={completeness.nextStep} 
        editLink="/dashboard/org/settings" 
      />

      {/* Hero Section */}
      <div className="org-hero-card">
        <div className="org-cover-image" style={{ backgroundImage: org?.cover_url ? `url(${org.cover_url})` : undefined }}></div>
        <div className="org-hero-content">
          <div>
            <div className="org-avatar-container">
              {org?.logo_url ? (
                <img src={org.logo_url} alt={org.name} className="org-avatar" style={{ objectFit: 'cover' }} />
              ) : (
                <div className="org-avatar" style={{ backgroundColor: 'var(--purple-100)', color: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, fontFamily: 'var(--display)' }}>
                  {initials}
                </div>
              )}
              {org?.verification_status === 'verified' && (
                <div className="org-verified-badge" title="Verified NGO">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10" stroke="white" strokeWidth="2" fill="none"></polyline></svg>
                </div>
              )}
            </div>
            
            <div className="org-hero-details">
              <h1 className="org-name">{org?.name || 'Unnamed Organization'}</h1>
              <p className="org-headline">{org?.bio ? (org.bio.length > 80 ? org.bio.substring(0, 80) + '...' : org.bio) : 'Organization bio not provided.'}</p>
              <div className="org-meta">
                {org?.location && (
                  <span className="org-meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {org.location}
                  </span>
                )}
                {org?.org_type && (
                  <span className="org-meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                    {org.org_type}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="org-hero-actions">
            <Link to="/dashboard/org/settings" className="org-btn org-btn-secondary" style={{ textDecoration: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Horizontal Stacked Content */}
      <div className="org-horizontal-section" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* About & Contact (Split Row) */}
        <div className="org-about-contact-split">
          
          <div className="dash-card">
            <div className="dash-card-padding">
              <h2 className="org-section-title" style={{ fontSize: '16px' }}>About Us</h2>
              <p className="org-about-text" style={{ whiteSpace: 'pre-line' }}>
                {org?.bio || 'This organization has not added a detailed bio yet.'}
              </p>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-padding">
              <h2 className="org-section-title" style={{ fontSize: '16px', marginBottom: '24px' }}>Contact Info</h2>
              
              <div className="info-row">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                <div className="info-content">
                  <span className="info-label">Website</span>
                  <span className="info-value">
                    {org?.website ? <a href={org.website.startsWith('http') ? org.website : `https://${org.website}`} target="_blank" rel="noopener noreferrer">{org.website}</a> : 'Not provided'}
                  </span>
                </div>
              </div>

              <div className="info-row">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <div className="info-content">
                  <span className="info-label">Email</span>
                  <span className="info-value">{org?.contact_email || 'Not provided'}</span>
                </div>
              </div>

              <div className="info-row">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                <div className="info-content">
                  <span className="info-label">Phone</span>
                  <span className="info-value">{org?.contact_phone || 'Not provided'}</span>
                </div>
              </div>

              <div className="info-row">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <div className="info-content">
                  <span className="info-label">Headquarters</span>
                  <span className="info-value">{org?.location || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Impact Section */}
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="org-section-title">Our Impact</h2>
            <div className="org-impact-showcase">
              <div className="impact-stat">
                <div className="impact-number">{stats.volunteers}</div>
                <div className="impact-label">Active Volunteers</div>
              </div>
              <div className="impact-stat">
                <div className="impact-number">{stats.gigs}</div>
                <div className="impact-label">Gigs Posted</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Full-width Jobs/Gigs Section */}
      <div className="dash-card" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="org-section-title" style={{ margin: 0 }}>Available Roles ({gigs.length})</h2>
          {gigs.length > 0 && (
            <Link to="/dashboard/org/gigs" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--purple-600)', textDecoration: 'none' }}>
              View all &rarr;
            </Link>
          )}
        </div>
        
        {gigs.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--white)', borderRadius: '16px', border: '1px solid #E4E1F5' }}>
            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '0 0 16px' }}>No active gigs posted yet.</p>
            <Link to="/dashboard/org/gigs/new" className="org-btn org-btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
              Post a Gig
            </Link>
          </div>
        ) : (
          <div className="org-gigs-grid">
            {gigs.map(gig => (
              <Link key={gig.id} to={`/dashboard/org/gigs/${gig.id}`} className="gig-media-card-horizontal">
                <div className="gig-media-cover-horizontal" style={{ backgroundImage: 'url(/images/hero_illustration.png)' }}></div>
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
                      {new Date(gig.created_at).toLocaleDateString()}
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
  );
};

export default OrganizationProfile;
