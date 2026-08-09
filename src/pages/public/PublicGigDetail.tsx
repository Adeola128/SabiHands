import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';
import ShareGigButton from '../../components/ShareGigButton';
import '../volunteer/VolunteerPages.css';

const PublicGigDetail: React.FC = () => {
  const { id } = useParams();
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
              verification_status
            )
          `)
          .eq('id', id)
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
      <div style={{ padding: '64px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)', marginBottom: '16px' }}>Gig not found</h2>
        <p style={{ color: 'var(--body)', marginBottom: '24px' }}>This opportunity may have been closed or removed by the organization.</p>
        <Link to="/" style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: 'var(--purple-600)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>Return Home</Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', padding: '40px 24px', fontFamily: 'var(--sans)' }}>
      <Helmet>
        <title>{gig.title} &mdash; Ralvo</title>
        <meta name="description" content={`Apply for ${gig.title} with ${gig.organizations?.name || 'an NGO'} on Ralvo.`} />
        <meta property="og:title" content={`${gig.title} &mdash; Ralvo`} />
        <meta property="og:description" content={`Apply for ${gig.title} with ${gig.organizations?.name || 'an NGO'} on Ralvo.`} />
        <meta property="og:image" content={gig.image_url || "https://www.ralvo.com.ng/og-image.png"} />
        <meta name="twitter:title" content={`${gig.title} &mdash; Ralvo`} />
        <meta name="twitter:description" content={`Apply for ${gig.title} with ${gig.organizations?.name || 'an NGO'} on Ralvo.`} />
        <meta name="twitter:image" content={gig.image_url || "https://www.ralvo.com.ng/og-image.png"} />
      </Helmet>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
        
        {/* â”€â”€ MAIN CONTENT â”€â”€ */}
        <div className="main-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 60 }}
          >
            {/* Hero cover */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E4E1F5', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ height: '300px', backgroundImage: `url(${gig.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=random&size=800`})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(15,12,41,0.8) 100%)' }} />
                <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px' }}>
                  <div style={{ display: 'inline-block', padding: '6px 14px', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', borderRadius: '99px', fontSize: '12px', fontWeight: 700, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.3)' }}>
                    {gig.type === 'skilled' ? 'Skilled Role' : 'Physical Event Support'}
                  </div>
                  <h1 style={{ fontSize: '32px', fontFamily: 'var(--display)', color: 'var(--white)', margin: 0, lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                    {gig.title}
                  </h1>
                </div>
              </div>

              {/* Tags row */}
              <div style={{ padding: '20px 24px', display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid #E4E1F5' }}>
                <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, backgroundColor: 'var(--purple-50)', color: 'var(--purple-700)' }}>
                  {gig.type === 'skilled' ? 'Skilled' : 'Physical'}
                </span>
                {gig.location === 'Remote' && (
                  <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, backgroundColor: 'var(--teal-50)', color: 'var(--teal-700)' }}>
                    Remote
                  </span>
                )}
              </div>
            </div>

            {/* Main body card */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E4E1F5', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink)', marginBottom: '20px' }}>About this Opportunity</h2>
              <p style={{ color: 'var(--body)', lineHeight: 1.8, marginBottom: '24px', fontSize: '16px', whiteSpace: 'pre-line' }}>
                {gig.description}
              </p>
            </div>
          </motion.div>
        </div>
        
        {/* â”€â”€ SIDEBAR â”€â”€ */}
        <aside className="context-col">
          {/* Apply CTA */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E4E1F5', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--teal-50), var(--teal-100))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 style={{ fontSize: '20px', color: 'var(--ink)', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--display)' }}>Ready to make an impact?</h3>
            <p style={{ fontSize: '14px', color: 'var(--body)', marginBottom: '24px', lineHeight: 1.5 }}>Join Ralvo to apply for this gig and start building your volunteer portfolio.</p>

            <Link
              to="/signup"
              style={{ display: 'block', width: '100%', padding: '16px', backgroundColor: 'var(--purple-600)', color: 'var(--white)', textAlign: 'center', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', fontSize: '16px', boxShadow: '0 4px 12px rgba(38,33,92,0.2)', transition: 'all 0.2s ease', marginBottom: '12px' }}
            >
              Sign Up to Apply
            </Link>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--purple-600)', fontWeight: 600, textDecoration: 'none' }}>Log In</Link>
            </p>
          </div>

          <ShareGigButton gigId={gig.id} title={gig.title} text={`Check out this volunteering opportunity on Ralvo: ${gig.title}`} />

          {/* Date & Time */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E4E1F5', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)', marginBottom: '20px' }}>When &amp; Where</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: 'Date', value: gig.date_start ? new Date(gig.date_start).toLocaleDateString() : 'Flexible / Ongoing' },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, label: 'Location', value: gig.location || 'Remote' },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: 'Commitment', value: `${gig.hours_required || 0} Hours` },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-600)', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '2px' }}>{item.label}</div>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--ink)' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Organizer */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E4E1F5', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)', marginBottom: '16px' }}>Organizer</h3>
            <Link to={`/organization/${gig.organizations?.user_id}`} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', textDecoration: 'none' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                {gig.organizations?.logo_url ? (
                  <img src={gig.organizations.logo_url} alt={gig.organizations.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" strokeWidth="2"><rect x="3" y="9" width="18" height="13" rx="2"/><path d="M8 9V5a2 2 0 0 1 4 0v4"/></svg>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '16px', marginBottom: '4px' }}>{gig.organizations?.name || 'Organization'}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{gig.organizations?.org_type || 'NGO'}</div>
              </div>
            </Link>
            
            {gig.organizations?.verification_status === 'verified' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--teal-600)', fontWeight: 600, padding: '12px', backgroundColor: 'var(--teal-50)', borderRadius: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                Verified Organization
              </div>
            )}
          </div>
          
        </aside>
      </div>
    </div>
  );
};

export default PublicGigDetail;

