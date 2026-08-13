import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';
import ShareGigButton from '../../components/ShareGigButton';
import '../organization/OrganizationProfile.css';

const PublicOrganizationProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [org, setOrg] = useState<any>(null);
  const [gigs, setGigs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Temporary placeholders
  const stats = { volunteers: gigs.length > 0 ? Math.floor(gigs.length * 2.5) : 0, gigs: gigs.length || 0 };

  useEffect(() => {
    if (!id) return;
    
    const fetchOrg = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('organizations')
          .select('*')
          .or(`id.eq.${id},user_id.eq.${id},slug.eq.${id}`)
          .single();
          
        if (fetchError || !data) {
          setError("Organization not found.");
          setLoading(false);
          return;
        }
        
        setOrg(data);

        // Fetch active gigs for this org
        const { data: gigsData } = await supabase
          .from('gigs')
          .select('*')
          .eq('organization_id', data.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false });
          
        setGigs(gigsData || []);
        
        // Fetch reviews
        if (data.user_id) {
          const { data: reviewsData } = await supabase
            .from('reviews')
            .select(`
              id, rating, comment, created_at,
              gigs(title)
            `)
            .eq('reviewee_id', data.user_id)
            .order('created_at', { ascending: false });
            
          if (reviewsData) {
            setReviews(reviewsData);
            if (reviewsData.length > 0) {
              const avg = reviewsData.reduce((acc, r) => acc + r.rating, 0) / reviewsData.length;
              setRating(Number(avg.toFixed(1)));
            }
          }
        }

      } catch (err: any) {
        console.error(err);
        setError("An error occurred while fetching the organization.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrg();
  }, [id]);

  if (loading) return <LoadingScreen message="Loading organization profile..." fullScreen={false} />;

  if (error || !org) {
    return (
      <div className="modern-profile-container">
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--white)', borderRadius: '12px', border: '1px solid #E4E1F5' }}>
          <h2 style={{ color: 'var(--ink)' }}>{error || 'Organization not found'}</h2>
          <Link to="/" style={{ color: 'var(--purple-600)', fontWeight: 600, textDecoration: 'none', marginTop: '16px', display: 'inline-block' }}>Return Home</Link>
        </div>
      </div>
    );
  }

  const initials = org?.name?.substring(0, 2).toUpperCase() || 'OG';

  return (
    <div className="modern-profile-container">
      <Helmet>
        <title>{org?.name || 'Organization'} &mdash; Ralvo</title>
        <meta name="description" content={`Check out volunteer opportunities with ${org?.name || 'this organization'} on Ralvo.`} />
        <meta property="og:title" content={`${org?.name || 'Organization'} &mdash; Ralvo`} />
        <meta property="og:description" content={`Check out volunteer opportunities with ${org?.name || 'this organization'} on Ralvo.`} />
        <meta property="og:image" content={org?.cover_url || org?.logo_url || "https://www.ralvo.com.ng/og-image.png"} />
      </Helmet>
      
      {/* ── HERO SECTION ── */}
      <div className="profile-hero-card">
        {/* Cover Photo Area */}
        <div className="profile-cover-area" style={{ backgroundImage: org?.cover_url ? `url(${org.cover_url})` : undefined }}>
        </div>
        
        {/* Profile Info Area */}
        <div className="profile-hero-info">
          <div className="profile-avatar-container">
            {org?.logo_url ? (
              <img src={org.logo_url} alt={org.name} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">{initials}</div>
            )}
            
            {org?.verification_status === 'verified' && (
              <div className="profile-verified-badge" title="Verified NGO">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10" stroke="white" strokeWidth="2" fill="none"></polyline></svg>
              </div>
            )}
          </div>
          
          <div className="profile-header-details">
            <div className="profile-title-block">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h1 className="profile-name">{org?.name || 'Unnamed Organization'}</h1>
                {rating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#FFFBEB', color: '#B45309', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFC107" stroke="#FFC107" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    {rating} ({reviews.length} reviews)
                  </div>
                )}
              </div>
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
            </div>
            
            {gigs.length === 0 ? (
              <div className="profile-empty-state">
                <p style={{ margin: '0' }}>No active opportunities at the moment.</p>
              </div>
            ) : (
              <div className="org-gigs-grid">
                {gigs.map(gig => (
                  <Link key={gig.id} to={`/gig/${gig.slug || gig.id}`} className="gig-media-card-horizontal">
                    <div className="gig-media-cover-horizontal" style={{ backgroundImage: `url(${gig.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=random&size=400`})` }}></div>
                    <div className="gig-media-body-horizontal">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 className="gig-media-title">{gig.title}</h3>
                        <ShareGigButton gigId={gig.id} slug={gig.slug} title={gig.title} variant="icon" />
                      </div>
                      <div className="gig-tags" style={{ marginTop: '8px', marginBottom: '16px' }}>
                        <span className={`tag ${gig.type === 'skilled' ? 'skilled' : 'physical'}`}>
                          {gig.type === 'skilled' ? 'Skilled' : 'Physical'}
                        </span>
                        {gig.location_type === 'remote' && <span className="tag physical">Remote</span>}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E4E1F5', paddingTop: '16px', marginTop: 'auto' }}>
                        <span style={{ fontSize: '13px', color: 'var(--body)' }}>
                          {gig.hours_required} hrs
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--purple-600)' }}>Apply &rarr;</span>
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
                  {org?.website ? <a href={org.website.startsWith('http') ? org.website : `https://${org.website}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--purple-600)' }}>{org.website}</a> : <span style={{ color: 'var(--muted)', fontWeight: 500 }}>Not provided</span>}
                </span>
              </div>

              {/* Email */}
              <div className="profile-social-link" style={{ background: 'transparent', padding: '0', cursor: 'default' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <span style={{ color: 'var(--ink)' }}>{org?.contact_email ? <a href={`mailto:${org.contact_email}`} style={{ color: 'var(--purple-600)', textDecoration: 'none' }}>{org.contact_email}</a> : <span style={{ color: 'var(--muted)', fontWeight: 500 }}>Not provided</span>}</span>
              </div>

              {/* Phone */}
              <div className="profile-social-link" style={{ background: 'transparent', padding: '0', cursor: 'default' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                <span style={{ color: 'var(--ink)' }}>{org?.contact_phone || <span style={{ color: 'var(--muted)', fontWeight: 500 }}>Not provided</span>}</span>
              </div>

            </div>
          </div>
          
          {/* Reviews List */}
          <div className="profile-content-card">
            <h2 className="profile-section-title">Volunteer Reviews</h2>
            {reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.map((rev) => (
                  <div key={rev.id} style={{ paddingBottom: '16px', borderBottom: '1px solid #E4E1F5' }}>
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill={star <= rev.rating ? "#FFC107" : "none"} stroke={star <= rev.rating ? "#FFC107" : "var(--muted)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      ))}
                    </div>
                    {rev.comment && <p style={{ fontSize: '13px', color: 'var(--body)', margin: '0 0 8px 0', lineHeight: 1.5 }}>"{rev.comment}"</p>}
                    <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Volunteer • {rev.gigs?.title}</span>
                      <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                No reviews yet.
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default PublicOrganizationProfile;
