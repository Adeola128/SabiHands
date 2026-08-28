import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';
import ShareGigButton from '../../components/ShareGigButton';
import './PublicOrganizationProfile.css';
import { useAuth } from '../../contexts/AuthContext';

const PublicOrganizationProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [org, setOrg] = useState<any>(null);
  const [gigs, setGigs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followLoading, setFollowLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'opportunities' | 'reviews'>('home');

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

        // Fetch followers
        const { count } = await supabase.from('organization_followers').select('*', { count: 'exact', head: true }).eq('organization_id', data.id);
        setFollowerCount(count || 0);

        if (user) {
          const { data: followData } = await supabase.from('organization_followers').select('id').eq('organization_id', data.id).eq('volunteer_id', user.id).maybeSingle();
          if (followData) setIsFollowing(true);
        }

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
        console.error('Error fetching organization profile:', err);
        if (err?.code === 'PGRST116') {
          setError('Organization profile not found.');
        } else {
          setError(err.message || 'Failed to load profile');
        }
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

  // Redirect to slug URL if accessed via UUID and slug exists
  if (org.slug && id !== org.slug) {
    return <Navigate to={`/org/${org.slug}`} replace />;
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
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://www.ralvo.com.ng/organization/${org?.slug || org?.user_id}",
                  "name": ${JSON.stringify(org?.name || 'Organization')},
                  "url": "https://www.ralvo.com.ng/organization/${org?.slug || org?.user_id}",
                  "logo": ${JSON.stringify(org?.logo_url || '')},
                  "description": ${JSON.stringify(org?.bio || '')},
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": ${JSON.stringify(org?.location || '')},
                    "addressCountry": "NG"
                  }
                  ${org?.website ? `,"sameAs": "${org.website}"` : ''}
                },
                {
                  "@type": "ItemList",
                  "itemListElement": [
                    ${gigs.map((g, i) => `{
                      "@type": "ListItem",
                      "position": ${i + 1},
                      "url": "https://www.ralvo.com.ng/gig/${g.slug || g.id}"
                    }`).join(',\n                    ')}
                  ]
                }
              ]
            }
          `}
        </script>
      </Helmet>
      
      {/* ── BREADCRUMBS ── */}
      <nav aria-label="breadcrumb" className="public-breadcrumbs" style={{ padding: '0 0 16px 0', fontSize: '14px', color: 'rgba(0,0,0,0.6)', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#0a66c2', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        <Link to="/organizations" style={{ color: '#0a66c2', textDecoration: 'none', fontWeight: 600 }}>Organizations</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        <span style={{ color: 'rgba(0,0,0,0.9)' }}>{org?.name}</span>
      </nav>

      {/* ── HERO SECTION ── */}
      <div className="public-hero-card">
        {/* Cover Photo */}
        <div className="public-cover-area" style={{ backgroundImage: org?.cover_url ? `url(${org.cover_url})` : undefined }}>
        </div>
        
        {/* Body Content */}
        <div className="public-hero-body">
          <div className="public-avatar-wrapper">
            {org?.logo_url ? (
              <img src={org.logo_url} alt={org.name} className="public-avatar-img" />
            ) : (
              <div className="public-avatar-placeholder">{initials}</div>
            )}
            
            {org?.verification_status === 'verified' && (
              <div className="profile-verified-badge" title="Verified NGO" style={{ position: 'absolute', bottom: '8px', right: '8px', width: '28px', height: '28px', backgroundColor: 'var(--teal-500)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white', zIndex: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10" stroke="white" strokeWidth="2" fill="none"></polyline></svg>
              </div>
            )}
          </div>
          
          <div className="public-header-details">
            <div>
              <h1 className="public-org-name">
                {org?.name || 'Unnamed Organization'}
              </h1>
              <div className="public-org-headline">
                {org?.bio ? org.bio.substring(0, 150) + (org.bio.length > 150 ? '...' : '') : 'Non-profit organization making an impact.'}
              </div>
              
              <div className="public-org-meta">
                {org?.org_type && <span>{org.org_type}</span>}
                {org?.location && (
                  <>
                    <span className="public-meta-dot">•</span>
                    <span>{org.location}, NG</span>
                  </>
                )}
                <span className="public-meta-dot">•</span>
                <span style={{ fontWeight: 600, color: 'rgba(0,0,0,0.9)' }}>{followerCount} followers</span>
              </div>

              <div className="public-hero-actions">
                <button 
                  className={isFollowing ? "btn-li-secondary" : "btn-li-primary"} 
                  onClick={async () => {
                    if (!user) {
                      alert('Please log in to follow organizations.');
                      return;
                    }
                    setFollowLoading(true);
                    if (isFollowing) {
                      const { error } = await supabase.from('organization_followers').delete().eq('organization_id', org.id).eq('volunteer_id', user.id);
                      if (!error) {
                        setIsFollowing(false);
                        setFollowerCount(prev => prev - 1);
                      }
                    } else {
                      const { error } = await supabase.from('organization_followers').insert({ organization_id: org.id, volunteer_id: user.id });
                      if (!error) {
                        setIsFollowing(true);
                        setFollowerCount(prev => prev + 1);
                      }
                    }
                    setFollowLoading(false);
                  }}
                  disabled={followLoading}
                >
                  {isFollowing ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}><path d="M20 6L9 17l-5-5"></path></svg>
                      Following
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}><path d="M12 5v14M5 12h14"></path></svg>
                      Follow
                    </>
                  )}
                </button>
                {org?.website ? (
                  <a href={org.website.startsWith('http') ? org.website : `https://${org.website}`} target="_blank" rel="noopener noreferrer" className="btn-li-secondary">
                    Visit website <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px' }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </a>
                ) : (
                  <a href={`mailto:${org?.contact_email}`} className="btn-li-secondary">
                    Contact Us
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="public-tabs-nav">
          <button className={`public-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>Home</button>
          <button className={`public-tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>About</button>
          <button className={`public-tab ${activeTab === 'opportunities' ? 'active' : ''}`} onClick={() => setActiveTab('opportunities')}>Opportunities</button>
          <button className={`public-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews</button>
        </div>
      </div>

      {/* ── CONTENT GRID ── */}
      <div className="public-layout-grid">
        
        {/* LEFT COLUMN: Main Content */}
        <div>
          {/* If Home or Opportunities tab is active, show the feed */}
          {(activeTab === 'home' || activeTab === 'opportunities') && (
            <div>
              <div className="li-card">
                <h3>Recent Opportunities</h3>
                {gigs.length === 0 && <p className="bento-about-text">No active opportunities posted right now.</p>}
              </div>

              {gigs.map(gig => (
                <div key={gig.id} className="li-post-card">
                  <div className="li-post-header">
                    <img src={org?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(org?.name || 'O')}`} alt={org?.name} className="li-post-logo" />
                    <div className="li-post-meta">
                      <strong>{org?.name}</strong>
                      <span>{org?.location || 'Nigeria'} • {followerCount} followers</span>
                      <span>{new Date(gig.created_at).toLocaleDateString()} • 🌍</span>
                    </div>
                  </div>
                  
                  <div className="li-post-body">
                    <p style={{ marginBottom: '8px' }}>We are looking for volunteers for: <strong>{gig.title}</strong></p>
                    <p>{gig.description ? gig.description.substring(0, 250) + '...' : 'Join us in making an impact.'}</p>
                    {gig.skills_required && gig.skills_required.length > 0 && (
                      <p style={{ marginTop: '8px', color: '#0a66c2' }}>#{gig.skills_required.join(' #').replace(/\{|\}/g, '')}</p>
                    )}
                  </div>
                  
                  {gig.image_url ? (
                    <img src={gig.image_url} alt={gig.title} className="li-post-image" />
                  ) : (
                    <div className="li-post-image" style={{ backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.4)', fontSize: '24px', fontWeight: 600 }}>
                      <span style={{ padding: '24px', textAlign: 'center' }}>{gig.title}</span>
                    </div>
                  )}

                  <div className="li-post-footer">
                    <Link to={`/gig/${gig.slug || gig.id}`} className="li-post-action-btn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                      View Role
                    </Link>
                    <ShareGigButton gigId={gig.slug || gig.id} title={gig.title} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="li-card">
              <h3>Overview</h3>
              <p className="bento-about-text">{org?.bio || 'This organization has not added a detailed bio yet.'}</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="li-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Reviews <span style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(0,0,0,0.6)' }}>({rating} ★ average)</span>
              </h3>
              {reviews.length === 0 ? (
                <p className="bento-about-text">No reviews available yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reviews.map(review => (
                    <div key={review.id} style={{ paddingBottom: '16px', borderBottom: '1px solid #EBEBEB' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                        {[1,2,3,4,5].map(star => (
                          <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill={star <= review.rating ? "#F59E0B" : "none"} stroke={star <= review.rating ? "#F59E0B" : "#D1D5DB"} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        ))}
                        <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)', marginLeft: '8px' }}>{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', color: 'rgba(0,0,0,0.9)' }}>{review.comment}</p>
                      {review.gigs && (
                        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'rgba(0,0,0,0.6)' }}>Role: {review.gigs.title}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sidebar (About) */}
        <div>
          <div className="li-card" style={{ position: 'sticky', top: '24px' }}>
            <h3>About</h3>
            <p className="bento-about-text" style={{ marginBottom: '16px' }}>
              {org?.bio ? org.bio.substring(0, 120) + '...' : 'Learn more about this organization.'}
            </p>
            <div className="li-sidebar-list">
              {org?.website && (
                <div className="li-sidebar-item">
                  <span className="li-sidebar-label">Website</span>
                  <a href={org.website.startsWith('http') ? org.website : `https://${org.website}`} target="_blank" rel="noopener noreferrer" className="li-sidebar-link">{org.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>
                </div>
              )}
              {org?.org_type && (
                <div className="li-sidebar-item">
                  <span className="li-sidebar-label">Industry</span>
                  <span className="li-sidebar-value">{org.org_type}</span>
                </div>
              )}
              <div className="li-sidebar-item">
                <span className="li-sidebar-label">Company size</span>
                <span className="li-sidebar-value">{followerCount} active followers</span>
              </div>
              {org?.location && (
                <div className="li-sidebar-item">
                  <span className="li-sidebar-label">Headquarters</span>
                  <span className="li-sidebar-value">{org.location}, NG</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default PublicOrganizationProfile;
