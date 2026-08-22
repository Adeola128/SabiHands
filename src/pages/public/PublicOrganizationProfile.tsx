import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';
import ShareGigButton from '../../components/ShareGigButton';
import './PublicOrganizationProfile.css';

const PublicOrganizationProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [org, setOrg] = useState<any>(null);
  const [gigs, setGigs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stats = { volunteers: gigs.length > 0 ? Math.floor(gigs.length * 2.5) : 0, gigs: gigs.length || 0 };

  useEffect(() => {
    if (!id) return;
    
    const fetchOrg = async () => {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        let query = supabase.from('organizations').select('*');
        if (isUUID) {
          query = query.or(`id.eq.${id},user_id.eq.${id},slug.eq.${id}`);
        } else {
          query = query.eq('slug', id);
        }
        
        const { data, error: fetchError } = await query.single();
          
        if (fetchError || !data) {
          setError("Organization not found.");
          setLoading(false);
          return;
        }
        
        setOrg(data);

        const { data: gigsData } = await supabase
          .from('gigs')
          .select('*')
          .eq('organization_id', data.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false });
          
        setGigs(gigsData || []);
        
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
      <div className="public-profile-container">
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--white)', borderRadius: '12px', border: '1px solid #E4E1F5' }}>
          <h2 style={{ color: 'var(--ink)' }}>{error || 'Organization not found'}</h2>
          <Link to="/" style={{ color: 'var(--purple-600)', fontWeight: 600, textDecoration: 'none', marginTop: '16px', display: 'inline-block' }}>Return Home</Link>
        </div>
      </div>
    );
  }

  const initials = org?.name?.substring(0, 2).toUpperCase() || 'OG';

  return (
    <div className="public-profile-container">
      <Helmet>
        <title>{org?.name || 'Organization'} &mdash; Ralvo</title>
        <meta name="description" content={`Check out volunteer opportunities with ${org?.name || 'this organization'} on Ralvo.`} />
        <meta property="og:title" content={`${org?.name || 'Organization'} &mdash; Ralvo`} />
        <meta property="og:description" content={`Check out volunteer opportunities with ${org?.name || 'this organization'} on Ralvo.`} />
        <meta property="og:image" content={org?.cover_url || org?.logo_url || "https://www.ralvo.com.ng/og-image.png"} />
      </Helmet>
      
      {/* ── HERO SECTION ── */}
      <div className="public-hero-card">
        {/* Cover Photo */}
        <div className="public-cover-area" style={{ backgroundImage: org?.cover_url ? `url(${org.cover_url})` : undefined }}>
          {/* Glassmorphic Stats */}
          <div className="public-stats-glass">
            {org?.verification_status === 'verified' && (
              <div className="public-glass-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10" stroke="white" strokeWidth="2" fill="none"></polyline></svg>
                Verified NGO
              </div>
            )}
            {rating > 0 && (
              <div className="public-glass-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                {rating} ({reviews.length} reviews)
              </div>
            )}
          </div>
        </div>
        
        {/* Body Content */}
        <div className="public-hero-body">
          <div className="public-avatar-wrapper">
            {org?.logo_url ? (
              <img src={org.logo_url} alt={org.name} className="public-avatar-img" />
            ) : (
              <div className="public-avatar-placeholder">{initials}</div>
            )}
          </div>
          
          <div className="public-header-details">
            <h1 className="public-org-name">{org?.name || 'Unnamed Organization'}</h1>
            <div className="public-org-headline">
              {org?.bio || 'This organization has not added a detailed bio yet.'}
            </div>
            
            <div className="public-org-meta">
              {org?.location && (
                <span className="public-meta-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {org.location}
                </span>
              )}
              {org?.org_type && (
                <span className="public-meta-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  {org.org_type}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── BENTO GRID ── */}
      <div className="public-bento-grid">
        {/* About Card */}
        <div className="public-bento-card">
          <h3>About Us</h3>
          <div className="bento-about-text">
            {org?.bio || 'This organization has not added a detailed bio yet.'}
          </div>
        </div>

        {/* Impact & Contact Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="public-bento-card dark-card" style={{ padding: '32px' }}>
            <h3>Our Impact</h3>
            <div className="impact-metrics-grid">
              <div className="impact-metric">
                <h4>{stats.volunteers}</h4>
                <p>Volunteers</p>
              </div>
              <div className="impact-metric">
                <h4>{stats.gigs}</h4>
                <p>Gigs Posted</p>
              </div>
            </div>
          </div>

          <div className="public-bento-card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '16px' }}>Contact Info</h3>
            <div className="contact-list">
              <div className="contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                {org?.website ? <a href={org.website.startsWith('http') ? org.website : `https://${org.website}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--purple-600)' }}>{org.website}</a> : <span>Not provided</span>}
              </div>
              <div className="contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                {org?.contact_email ? <a href={`mailto:${org.contact_email}`} style={{ color: 'var(--purple-600)', textDecoration: 'none' }}>{org.contact_email}</a> : <span>Not provided</span>}
              </div>
              <div className="contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                {org?.contact_phone || <span>Not provided</span>}
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* ── GIGS MASONRY ── */}
      <div className="public-gigs-section">
        <h2 className="public-section-header">Available Roles</h2>
        
        {gigs.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '64px', borderRadius: '24px', textAlign: 'center', border: '1px solid #E4E1F5' }}>
            <p style={{ margin: 0, fontSize: '18px', color: 'var(--muted)', fontWeight: 500 }}>No active opportunities at the moment.</p>
          </div>
        ) : (
          <div className="public-gigs-grid">
            {gigs.map(gig => (
              <Link key={gig.id} to={`/gig/${gig.slug || gig.id}`} className="premium-gig-card" style={{ textDecoration: 'none' }}>
                <div className="gig-card-image" style={{ backgroundImage: `url(${gig.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=random&size=400`})` }}></div>
                <div className="gig-card-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 className="gig-card-title">{gig.title}</h3>
                    <div onClick={(e) => e.preventDefault()}>
                      <ShareGigButton gigId={gig.id} slug={gig.slug} title={gig.title} variant="icon" />
                    </div>
                  </div>
                  <div className="gig-card-meta">
                    <span className="gig-card-tag" style={{ backgroundColor: gig.type === 'skilled' ? 'var(--purple-50)' : 'var(--teal-50)', color: gig.type === 'skilled' ? 'var(--purple-700)' : 'var(--teal-700)' }}>
                      {gig.type === 'skilled' ? 'Skilled' : 'Physical'}
                    </span>
                    {gig.location_type === 'remote' && (
                      <span className="gig-card-tag" style={{ backgroundColor: 'var(--teal-50)', color: 'var(--teal-700)' }}>Remote</span>
                    )}
                  </div>
                  <div className="gig-card-footer">
                    <span className="gig-card-duration">
                      {gig.hours_required ? `${gig.hours_required} hrs` : 'Flexible hrs'}
                    </span>
                    <span className="gig-card-link">Apply &rarr;</span>
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

export default PublicOrganizationProfile;
