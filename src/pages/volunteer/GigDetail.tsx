import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';

const GigDetail: React.FC = () => {
  const { id } = useParams();
  const [gig, setGig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGig = async () => {
      if (!id) return;
      
      const { data } = await supabase
        .from('gigs')
        .select(`
          *,
          organizations (
            name,
            org_type
          )
        `)
        .eq('id', id)
        .single();
        
      if (data) setGig(data);
      setLoading(false);
    };

    fetchGig();
  }, [id]);

  if (loading) return <LoadingScreen message="Loading gig details..." fullScreen={true} />;
  if (!gig) return <div style={{ padding: '48px', textAlign: 'center' }}>Gig not found</div>;

  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className="context-col">
        {/* Apply CTA */}
        <div className="dash-card">
          <div className="dash-card-padding" style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--teal-50), var(--teal-100))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 style={{ fontSize: '18px', color: 'var(--ink)', fontWeight: 700, marginBottom: '6px', fontFamily: 'var(--display)' }}>Ready to help?</h3>
            <p style={{ fontSize: '14px', color: 'var(--body)', marginBottom: '20px', lineHeight: 1.5 }}>12 of 20 volunteer spots filled. Secure yours today.</p>

            {/* Spots progress */}
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px' }}>
                <span>Spots filled</span>
                <span style={{ color: 'var(--ink)' }}>0 / {gig.type === 'skilled' ? '1' : 'Unlimited'}</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#E4E1F5', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, var(--teal-400), var(--teal-600))', borderRadius: '3px' }} />
              </div>
            </div>

            <Link
              to={`/dashboard/volunteer/gigs/${gig.id}/apply`}
              style={{ display: 'block', width: '100%', padding: '14px', backgroundColor: 'var(--purple-600)', color: 'var(--white)', textAlign: 'center', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '15px', boxShadow: '0 4px 12px rgba(38,33,92,0.2)', transition: 'all 0.2s ease' }}
            >
              Apply for this Gig
            </Link>
          </div>
        </div>

        {/* Date & Time */}
        <div className="dash-card">
          <div className="dash-card-padding">
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', marginBottom: '16px' }}>When &amp; Where</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: 'Date', value: gig.date_start ? new Date(gig.date_start).toLocaleDateString() : 'TBD' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, label: 'Location', value: gig.location || 'Remote' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-600)', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '2px' }}>{item.label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink)' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Organizer */}
        <div className="dash-card">
          <div className="dash-card-padding">
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', marginBottom: '16px' }}>Organizer</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" strokeWidth="2"><rect x="3" y="9" width="18" height="13" rx="2"/><path d="M8 9V5a2 2 0 0 1 4 0v4"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '15px' }}>{gig.organizations?.name || 'Organization'}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{gig.organizations?.org_type || 'NGO'}</div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--body)', lineHeight: 1.6, marginBottom: '12px' }}>
              An NGO dedicated to environmental sustainability and waste management across Lagos State.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--teal-600)', fontWeight: 600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              Verified Organization
            </div>
          </div>
        </div>

        <Link to="/dashboard/volunteer/gigs" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 0' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Browse Gigs
        </Link>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 60 }}
        >
          {/* Hero cover */}
          <div className="dash-card" style={{ marginBottom: '24px', overflow: 'hidden', padding: 0 }}>
            <div style={{ height: '240px', backgroundImage: 'url(/images/diverse_gigs.png)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(15,12,41,0.7) 100%)' }} />
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px' }}>
                <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', borderRadius: '99px', fontSize: '12px', fontWeight: 700, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.3)' }}>
                  {gig.type === 'skilled' ? 'Skilled Role' : 'Physical Event Support'}
                </div>
                <h1 style={{ fontSize: '28px', fontFamily: 'var(--display)', color: 'var(--white)', margin: 0, lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  {gig.title}
                </h1>
              </div>
            </div>

            {/* Tags row */}
            <div style={{ padding: '16px 24px', display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid #E4E1F5' }}>
              <span className={`tag ${gig.type === 'skilled' ? 'skilled' : 'physical'}`}>{gig.type === 'skilled' ? 'Skilled' : 'Physical'}</span>
              <span className="tag category">Environment</span>
              <span className="tag skilled" style={{ backgroundColor: '#D4EDDA', color: '#155724' }}>Open to all</span>
            </div>
          </div>

          {/* Main body card */}
          <div className="dash-card">
            <div className="dash-card-padding">
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', marginBottom: '16px' }}>About this Gig</h2>
              <p style={{ color: 'var(--body)', lineHeight: 1.7, marginBottom: '16px', fontSize: '15px' }}>
                {gig.description}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default GigDetail;
