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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchOrg = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('organizations')
          .select('*')
          .eq('user_id', id)
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
      <div className="volunteer-page-container">
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--paper)', borderRadius: '12px' }}>
          <h2 style={{ color: 'var(--ink)' }}>{error || 'Organization not found'}</h2>
          <Link to="/" style={{ color: 'var(--purple-600)', fontWeight: 600, textDecoration: 'none', marginTop: '16px', display: 'inline-block' }}>Return Home</Link>
        </div>
      </div>
    );
  }

  const initials = org?.name?.substring(0, 2).toUpperCase() || 'ORG';

  return (
    <div className="org-profile-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
      <Helmet>
        <title>{org?.name || 'Organization'} &mdash; Gigway</title>
        <meta name="description" content={`Check out volunteer opportunities with ${org?.name || 'this organization'} on Gigway.`} />
        <meta property="og:title" content={`${org?.name || 'Organization'} &mdash; Gigway`} />
        <meta property="og:description" content={`Check out volunteer opportunities with ${org?.name || 'this organization'} on Gigway.`} />
        <meta property="og:image" content={org?.cover_url || org?.logo_url || "https://Gigway.vercel.app/og-image.png"} />
        <meta name="twitter:title" content={`${org?.name || 'Organization'} &mdash; Gigway`} />
        <meta name="twitter:description" content={`Check out volunteer opportunities with ${org?.name || 'this organization'} on Gigway.`} />
        <meta name="twitter:image" content={org?.cover_url || org?.logo_url || "https://Gigway.vercel.app/og-image.png"} />
      </Helmet>
      
      {/* ── HERO SECTION ── */}
      <div className="org-profile-hero">
        <div className="org-profile-cover" style={{ backgroundImage: org?.cover_url ? `url(${org.cover_url})` : undefined }} />
        
        <div className="org-profile-header-content">
          <div>
            <div className="org-profile-avatar-wrapper">
              {org?.logo_url ? (
                <img src={org.logo_url} alt="Logo" className="org-profile-avatar" style={{ objectFit: 'cover' }} />
              ) : (
                <div className="org-profile-avatar">{initials}</div>
              )}
              {org?.verification_status === 'verified' && (
                <div className="org-verified-badge" title="Verified Organization">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
            </div>
            
            <div className="org-profile-info">
              <h1 className="org-profile-name">
                {org?.name || 'Unknown Organization'}
              </h1>
              <div className="org-profile-headline">
                <span>{org?.org_type || 'Organization'}</span>
                <span style={{ color: '#D1CEDF' }}>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {org?.location || 'Location Not Set'}
                </span>
              </div>
              
              <div className="org-profile-stats-bar">
                <div className="org-stat-item">
                  <span className="org-stat-value">{gigs.length}</span>
                  <span className="org-stat-label">Active Gigs</span>
                </div>
              </div>

              {/* Social/Web Links */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                {org?.website && (
                  <a href={org.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--purple-600)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    Website
                  </a>
                )}
                {org?.contact_email && (
                  <a href={`mailto:${org.contact_email}`} style={{ color: 'var(--purple-600)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    Email Us
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="org-profile-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '32px' }}>
        {/* ── LEFT COLUMN ── */}
        <div>
          <div className="dash-card">
            <h2 className="dash-card-title">About Our Mission</h2>
            <p style={{ fontSize: '15px', color: 'var(--body)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
              {org?.bio || 'This organization hasn\'t added a description yet.'}
            </p>
          </div>

          <div className="dash-card" style={{ marginTop: '24px' }}>
            <h2 className="dash-card-title">Open Opportunities</h2>
            {gigs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {gigs.map(gig => (
                  <Link to={`/gig/${gig.id}`} key={gig.id} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ padding: '16px', border: '1px solid #E4E1F5', borderRadius: '12px', transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--ink)' }}>{gig.title}</h3>
                        <ShareGigButton gigId={gig.id} title={gig.title} variant="icon" />
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', color: 'var(--body)' }}>{gig.description?.substring(0, 100)}...</p>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {gig.location_type === 'remote' ? 'Remote' : gig.location}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {gig.hours_required} hrs
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>No active opportunities at the moment.</p>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div>
          <div className="dash-card">
            <h2 className="dash-card-title">Contact Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {org?.location && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'var(--purple-50)', color: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Location</div>
                    <div style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 500 }}>{org.location}</div>
                  </div>
                </div>
              )}
              {org?.contact_phone && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'var(--purple-50)', color: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Phone</div>
                    <div style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 500 }}>{org.contact_phone}</div>
                  </div>
                </div>
              )}
              {org?.contact_email && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'var(--purple-50)', color: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Email</div>
                    <div style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 500 }}>{org.contact_email}</div>
                  </div>
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
