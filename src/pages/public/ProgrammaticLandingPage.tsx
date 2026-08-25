import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';

type LandingType = 'nigeria' | 'ngo' | 'remote' | 'graduate' | 'location' | 'skill';

interface ProgrammaticLandingPageProps {
  type: LandingType;
}

const ProgrammaticLandingPage: React.FC<ProgrammaticLandingPageProps> = ({ type }) => {
  const { location, skill } = useParams<{ location?: string; skill?: string }>();
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Format params for display and query
  const formatParam = (p?: string) => (p ? p.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '');
  const formattedLocation = formatParam(location);
  const formattedSkill = formatParam(skill);

  // Generate page metadata based on type
  let pageTitle = 'Volunteer Opportunities in Nigeria';
  let pageDescription = 'Find the best volunteer opportunities and NGO gigs in Nigeria on Ralvo.';
  let pageH1 = 'Volunteer Opportunities in Nigeria';
  let pageIntro = 'Explore active volunteer roles across Nigeria to gain experience and make an impact.';
  
  switch (type) {
    case 'ngo':
      pageTitle = 'NGO Volunteer Jobs in Nigeria';
      pageDescription = 'Discover verified NGO volunteer jobs in Nigeria. Contribute to causes you care about.';
      pageH1 = 'NGO Volunteer Jobs in Nigeria';
      pageIntro = 'Join trusted Non-Governmental Organizations across Nigeria looking for passionate volunteers.';
      break;
    case 'remote':
      pageTitle = 'Remote Volunteer Opportunities in Nigeria';
      pageDescription = 'Find virtual and remote volunteering opportunities in Nigeria. Build skills from anywhere.';
      pageH1 = 'Remote Volunteer Opportunities';
      pageIntro = 'Make an impact from anywhere. Browse active virtual and remote volunteer roles available for Nigerians.';
      break;
    case 'graduate':
      pageTitle = 'NYSC & Graduate Volunteer Opportunities';
      pageDescription = 'Volunteer jobs for NYSC members and fresh graduates in Nigeria. Gain practical experience.';
      pageH1 = 'NYSC & Graduate Volunteer Opportunities';
      pageIntro = 'Build your CV and gain practical skills with volunteer opportunities tailored for graduates and NYSC members.';
      break;
    case 'location':
      pageTitle = `Volunteer Opportunities in ${formattedLocation}, Nigeria`;
      pageDescription = `Find the best volunteer jobs and NGO opportunities in ${formattedLocation}.`;
      pageH1 = `Volunteer Opportunities in ${formattedLocation}`;
      pageIntro = `Browse active volunteer roles located in ${formattedLocation}. Connect with organizations in your city.`;
      break;
    case 'skill':
      pageTitle = `${formattedSkill} Volunteer Opportunities in Nigeria`;
      pageDescription = `Find volunteer roles requiring ${formattedSkill} skills in Nigeria.`;
      pageH1 = `${formattedSkill} Volunteer Opportunities`;
      pageIntro = `Looking to use your ${formattedSkill} skills? Discover organizations seeking your expertise.`;
      break;
  }

  useEffect(() => {
    const fetchGigs = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('gigs')
          .select(`*, organizations(name, logo_url, slug, user_id, verification_status, org_type)`)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        // Apply filters based on landing type
        if (type === 'remote') {
          query = query.eq('location_type', 'remote');
        } else if (type === 'ngo') {
          // This requires organizations to have org_type 'NGO' or similar.
          // Since we can't easily filter by nested table in supabase, we'll fetch all and filter in JS if needed.
          // However, supabase supports inner joins via the select string if configured, 
          // e.g., '*, organizations!inner(*)' where org_type.eq.NGO. 
          // For now, we'll just fetch all published and filter client-side if it's NGO.
        } else if (type === 'location' && formattedLocation) {
          query = query.ilike('location', `%${formattedLocation}%`);
        } else if (type === 'skill' && formattedSkill) {
          // Use Postgres contains or simply fetch and filter.
          // Postgres JSONB or Array contains operator is not natively easy via basic JS client for complex strings without exact matches.
          // For simplicity, fetch all published and filter in JS.
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        let filteredGigs = data || [];
        
        if (type === 'ngo') {
          filteredGigs = filteredGigs.filter(g => g.organizations?.org_type?.toLowerCase().includes('ngo'));
        } else if (type === 'skill' && formattedSkill) {
          filteredGigs = filteredGigs.filter(g => {
             const skills = g.skills_required || [];
             return skills.some((s: string) => s.toLowerCase().includes(formattedSkill.toLowerCase()));
          });
        }
        
        // Filter out gigs that are past their date_end if applicable
        const now = new Date().toISOString();
        filteredGigs = filteredGigs.filter(g => !g.date_end || g.date_end > now);

        setGigs(filteredGigs);
      } catch (err) {
        console.error("Error fetching programmatic gigs:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGigs();
  }, [type, location, skill, formattedLocation, formattedSkill]);

  if (loading) {
    return <LoadingScreen message={`Loading ${pageH1.toLowerCase()}...`} fullScreen={true} />;
  }

  const noInventory = gigs.length === 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', paddingBottom: '80px' }}>
      <Helmet>
        <title>{pageTitle} &mdash; Ralvo</title>
        <meta name="description" content={pageDescription} />
        {/* Inject noindex if zero active inventory */}
        {noInventory && <meta name="robots" content="noindex" />}
        {!noInventory && (
          <script type="application/ld+json">
            {`
              {
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                "name": "${pageTitle}",
                "description": "${pageDescription}",
                "mainEntity": {
                  "@type": "ItemList",
                  "itemListElement": [
                    ${gigs.map((g, i) => `{
                      "@type": "ListItem",
                      "position": ${i + 1},
                      "url": "https://www.ralvo.com.ng/gig/${g.slug || g.id}"
                    }`).join(',\n                    ')}
                  ]
                }
              }
            `}
          </script>
        )}
      </Helmet>
      
      {/* ── BREADCRUMBS ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 24px 0 24px' }}>
        <nav aria-label="breadcrumb" style={{ fontSize: '14px', color: 'var(--muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--purple-600)', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          <Link to="/opportunities" style={{ color: 'var(--purple-600)', textDecoration: 'none', fontWeight: 600 }}>Opportunities</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          <span style={{ color: 'var(--ink)' }}>{pageH1}</span>
        </nav>
      </div>

      <div style={{ maxWidth: '1200px', margin: '32px auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: '36px', fontFamily: 'var(--display)', fontWeight: 800, color: 'var(--ink)', marginBottom: '16px' }}>
          {pageH1}
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--body)', maxWidth: '800px', lineHeight: 1.6, marginBottom: '48px' }}>
          {pageIntro}
        </p>

        {noInventory ? (
          <div style={{ backgroundColor: 'white', padding: '64px', borderRadius: '24px', textAlign: 'center', border: '1px solid #E4E1F5' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--purple-50)', color: 'var(--purple-600)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <h2 style={{ fontSize: '24px', fontFamily: 'var(--display)', color: 'var(--ink)', marginBottom: '16px' }}>No active opportunities right now</h2>
            <p style={{ fontSize: '16px', color: 'var(--body)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px auto' }}>
              We don't currently have any active opportunities matching this category. Check back later or explore other roles available across Nigeria.
            </p>
            <Link to="/opportunities" style={{ display: 'inline-flex', padding: '12px 24px', backgroundColor: 'var(--purple-600)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600 }}>
              Browse All Opportunities
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {gigs.map(gig => (
              <Link key={gig.id} to={`/gig/${gig.slug || gig.id}`} style={{ 
                display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: '20px', 
                border: '1px solid #E4E1F5', overflow: 'hidden', textDecoration: 'none', transition: 'all 0.3s' 
              }}>
                <div style={{ height: '160px', backgroundColor: '#f3f4f6', backgroundImage: `url(${gig.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=random&size=400`})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '100px', backgroundColor: gig.type === 'skilled' ? 'var(--purple-50)' : 'var(--teal-50)', color: gig.type === 'skilled' ? 'var(--purple-700)' : 'var(--teal-700)' }}>
                      {gig.type === 'skilled' ? 'Skilled' : 'Physical'}
                    </span>
                    {gig.location_type === 'remote' && (
                      <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '100px', backgroundColor: 'var(--teal-50)', color: 'var(--teal-700)' }}>Remote</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 8px 0', lineHeight: 1.4 }}>{gig.title}</h3>
                  <div style={{ fontSize: '14px', color: 'var(--body)', marginBottom: '16px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="9" width="18" height="13" rx="2"/><path d="M8 9V5a2 2 0 0 1 4 0v4"/></svg>
                      {gig.organizations?.name || 'Organization'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {gig.location || 'Remote'}
                    </div>
                  </div>
                  <div style={{ paddingTop: '16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
                      {gig.hours_required ? `${gig.hours_required} hrs` : 'Flexible'}
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--purple-600)', fontWeight: 600 }}>Apply &rarr;</span>
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

export default ProgrammaticLandingPage;
