import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/LoadingScreen';
import ShareGigButton from '../../components/ShareGigButton';
import './PublicGigDetail.css';

const PublicGigDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [gig, setGig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGig = async () => {
      if (!id) return;
      
      try {
        const { data } = await supabase
          .from('gigs')
          .select(`
            *,
            organizations (
              user_id,
              name,
              org_type,
              logo_url,
              verification_status,
              slug
            )
          `)
          .or(`id.eq.${id},slug.eq.${id}`)
          .eq('status', 'published')
          .single();
          
        if (data) setGig(data);
      } catch (error) {
        console.error("Error fetching public gig:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGig();
  }, [id]);

  if (loading) return <LoadingScreen message="Loading gig details..." fullScreen={true} />;
  
  if (!gig) {
    return (
      <div className="gig-detail-wrapper">
        <div style={{ padding: '64px', textAlign: 'center', backgroundColor: 'var(--white)', borderRadius: '32px', border: '1px solid #E4E1F5', boxShadow: '0 12px 48px -12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '32px', fontFamily: 'var(--display)', fontWeight: 800, color: 'var(--ink)', marginBottom: '16px' }}>Opportunity not found</h2>
          <p style={{ color: 'var(--body)', marginBottom: '32px', fontSize: '18px' }}>This gig may have been closed or removed by the organization.</p>
          <Link to="/" style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'var(--purple-600)', color: 'white', borderRadius: '16px', textDecoration: 'none', fontWeight: 700, fontSize: '18px' }}>Browse Other Roles</Link>
        </div>
      </div>
    );
  }

  // Redirect to slug URL if accessed via UUID and slug exists
  if (gig.slug && id !== gig.slug) {
    return <Navigate to={`/gig/${gig.slug}`} replace />;
  }

  const gigImageUrl = gig.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=random&size=800`;
  const urlSlug = gig.slug || gig.id;
  const canonicalUrl = `${window.location.origin}/gig/${urlSlug}`;

  return (
    <div className="gig-detail-wrapper">
      <Helmet>
        <title>{gig.title} | {gig.organizations?.name} &mdash; Ralvo</title>
        <meta name="description" content={`Apply for ${gig.title} with ${gig.organizations?.name || 'an NGO'} on Ralvo. Join to volunteer and make an impact.`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${gig.title} | ${gig.organizations?.name} &mdash; Ralvo`} />
        <meta property="og:description" content={`Apply for ${gig.title} with ${gig.organizations?.name || 'an NGO'} on Ralvo.`} />
        <meta property="og:image" content={gigImageUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${gig.title} &mdash; Ralvo`} />
        <meta name="twitter:description" content={`Apply for ${gig.title} with ${gig.organizations?.name || 'an NGO'} on Ralvo.`} />
        <meta name="twitter:image" content={gigImageUrl} />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org/",
              "@type": "JobPosting",
              "title": ${JSON.stringify(gig.title)},
              "description": ${JSON.stringify(gig.description ? gig.description.replace(/\n/g, '<br>') : '')},
              "identifier": {
                "@type": "PropertyValue",
                "name": ${JSON.stringify(gig.organizations?.name || 'Ralvo')},
                "value": "${gig.id}"
              },
              "datePosted": "${gig.created_at || new Date().toISOString()}",
              "employmentType": "VOLUNTEER",
              "hiringOrganization": {
                "@type": "Organization",
                "name": ${JSON.stringify(gig.organizations?.name || 'NGO')},
                "sameAs": "https://www.ralvo.com.ng/organization/${gig.organizations?.slug || gig.organizations?.user_id || ''}",
                "logo": "${gig.organizations?.logo_url || 'https://www.ralvo.com.ng/logo.png'}"
              },
              "jobLocation": {
                "@type": "Place",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": ${JSON.stringify(gig.location === 'Remote' ? '' : (gig.location || 'Lagos'))},
                  "addressCountry": "NG"
                }
              },
              "applicantLocationRequirements": {
                "@type": "Country",
                "name": "Nigeria"
              }
              ${gig.location === 'Remote' ? ',"jobLocationType": "TELECOMMUTE"' : ''}
              ${gig.skills_required && gig.skills_required.length > 0 ? `,"skills": ${JSON.stringify(gig.skills_required.join(', '))}` : ''}
              ${gig.volunteers_needed ? `,"totalJobOpenings": ${gig.volunteers_needed}` : ''}
              ${gig.date_end ? `,"validThrough": "${gig.date_end}"` : ''}
            }
          `}
        </script>
      </Helmet>
      
      {/* ── BREADCRUMBS ── */}
      <nav aria-label="breadcrumb" className="gig-breadcrumbs" style={{ padding: '24px 0 0 24px', fontSize: '14px', color: 'var(--muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'var(--purple-600)', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        <Link to="/opportunities" style={{ color: 'var(--purple-600)', textDecoration: 'none', fontWeight: 600 }}>Opportunities</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        <span style={{ color: 'var(--ink)' }}>{gig.title}</span>
      </nav>

      {/* ── HERO SECTION ── */}
      <motion.div 
        className="gig-hero-card"
        style={{ marginTop: '16px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="gig-hero-cover" style={{ backgroundImage: `url(${gigImageUrl})` }}></div>
        <div className="gig-hero-content">
          <div className="gig-hero-tag">
            {gig.type === 'skilled' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                Skilled Role
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Physical Event Support
              </span>
            )}
          </div>
          <h1 className="gig-hero-title">
            {gig.title} Volunteer Opportunity {gig.location === 'Remote' ? 'Remote' : `in ${gig.location || 'Nigeria'}`}
          </h1>
          <div className="gig-hero-meta">
            <div className="gig-hero-meta-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="9" width="18" height="13" rx="2"/><path d="M8 9V5a2 2 0 0 1 4 0v4"/></svg>
              {gig.organizations?.name || 'Organization'}
            </div>
            <div className="gig-hero-meta-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {gig.location || 'Remote'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── LAYOUT GRID ── */}
      <div className="gig-bento-grid">
        
        {/* ── MAIN CONTENT (LEFT) ── */}
        <div className="gig-main-col">
          
          <div className="gig-content-card">
            <h2 className="gig-section-title">About this Opportunity</h2>
            <div className="gig-description-text">
              {gig.description}
            </div>
          </div>

          <div className="gig-content-card">
            <h2 className="gig-section-title">Requirements &amp; Details</h2>
            <ul className="gig-req-list">
              {gig.resume_requirement !== 'not_required' && (
                <li className="gig-req-item">
                  <svg className="gig-req-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  <span><strong>Resume/CV</strong> is {gig.resume_requirement} for this role.</span>
                </li>
              )}
              {gig.linkedin_requirement !== 'not_required' && (
                <li className="gig-req-item">
                  <svg className="gig-req-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                  <span><strong>LinkedIn Profile</strong> is {gig.linkedin_requirement}.</span>
                </li>
              )}
              {gig.portfolio_requirement !== 'not_required' && (
                <li className="gig-req-item">
                  <svg className="gig-req-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  <span><strong>Portfolio</strong> is {gig.portfolio_requirement}.</span>
                </li>
              )}
              <li className="gig-req-item">
                <svg className="gig-req-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>Upon completion, volunteers will receive a verified <strong>Certificate of Completion</strong>.</span>
              </li>
              {gig.skills_required && gig.skills_required.length > 0 && (
                <li className="gig-req-item">
                  <svg className="gig-req-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span><strong>Skills Required:</strong> {gig.skills_required.join(', ')}</span>
                </li>
              )}
              {gig.volunteers_needed && (
                <li className="gig-req-item">
                  <svg className="gig-req-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span><strong>Capacity:</strong> Looking for {gig.volunteers_needed} volunteer(s).</span>
                </li>
              )}
            </ul>
          </div>

        </div>
        
        {/* ── SIDEBAR (RIGHT) ── */}
        <div className="gig-sidebar-col">
          
          {/* Quick Apply Card */}
          <div className="gig-summary-card">
            <div className="gig-summary-grid">
              <div className="gig-summary-item">
                <span className="gig-summary-label">Commitment</span>
                <span className="gig-summary-value">{gig.hours_required ? `${gig.hours_required} Hours` : 'Flexible'}</span>
              </div>
              <div className="gig-summary-item">
                <span className="gig-summary-label">Date</span>
                <span className="gig-summary-value">{gig.date_start ? new Date(gig.date_start).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" }) : 'Ongoing'}</span>
              </div>
              <div className="gig-summary-item">
                <span className="gig-summary-label">Format</span>
                <span className="gig-summary-value">{gig.type === 'skilled' ? 'Skilled' : 'Physical'}</span>
              </div>
              <div className="gig-summary-item">
                <span className="gig-summary-label">Location</span>
                <span className="gig-summary-value">{gig.location === 'Remote' ? 'Remote' : 'On-Site'}</span>
              </div>
            </div>

            <Link to={user ? `/dashboard/volunteer/gigs/${gig.id}/apply` : `/signup?gig=${gig.id}`} className="gig-apply-btn">
              Apply Now
            </Link>
            
            <div style={{ marginTop: '16px' }}>
              <ShareGigButton gigId={gig.id} slug={gig.slug} title={gig.title} variant="outline" text={`Check out this volunteering opportunity on Ralvo: ${gig.title}`} />
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              Already have an account? <Link to={`/login?gig=${gig.id}`} style={{ color: 'white', fontWeight: 600, textDecoration: 'underline' }}>Log In</Link>
            </div>
          </div>

          {/* Organizer Card */}
          <Link to={`/organization/${gig.organizations?.slug || gig.organizations?.user_id}`} className="gig-org-card">
            {gig.organizations?.logo_url ? (
              <img src={gig.organizations.logo_url} alt={gig.organizations.name} className="gig-org-logo" />
            ) : (
              <div className="gig-org-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--purple-600)" strokeWidth="2"><rect x="3" y="9" width="18" height="13" rx="2"/><path d="M8 9V5a2 2 0 0 1 4 0v4"/></svg>
              </div>
            )}
            <div className="gig-org-info">
              <h3 className="gig-org-name">{gig.organizations?.name || 'Organization'}</h3>
              <div className="gig-org-type">{gig.organizations?.org_type || 'NGO'}</div>
              {gig.organizations?.verification_status === 'verified' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--teal-600)', fontWeight: 700, marginTop: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10" stroke="white" strokeWidth="2" fill="none"></polyline></svg>
                  Verified
                </div>
              )}
            </div>
          </Link>
          
        </div>
      </div>
    </div>
  );
};

export default PublicGigDetail;
