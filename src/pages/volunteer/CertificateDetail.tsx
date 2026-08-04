import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';
import './VolunteerPages.css';

const CertificateDetail: React.FC = () => {
  const { id } = useParams(); // This is the verification_code
  const certIdDisplay = id ? id.toUpperCase() : '';
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://sabihands.com/verify/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchCert = async () => {
      if (!id) return;
      const { data } = await supabase
        .from('certificates')
        .select(`
          *,
          gigs(title, type, organizations(name)),
          users(volunteer_profiles(full_name)),
          attendance(hours)
        `)
        .eq('verification_code', id)
        .single();
      
      if (data) {
        setCert({
          name: data.recipient_name || (data.users?.volunteer_profiles && data.users.volunteer_profiles.length > 0 ? data.users.volunteer_profiles[0].full_name : 'Volunteer'),
          gig: data.gigs?.title,
          org: data.gigs?.organizations?.name,
          date: new Date(data.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          type: data.gigs?.type,
          hours: data.attendance?.hours || 0,
        });
      }
      setLoading(false);
    };
    fetchCert();
  }, [id]);

  if (loading) return <LoadingScreen message="Loading certificate details..." fullScreen={true} />;
  if (!cert) return <div style={{ padding: '48px', textAlign: 'center' }}>Certificate not found.</div>;

  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '16px', marginBottom: '16px' }}>Certificate Info</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Certificate ID', value: certIdDisplay, mono: true },
                { label: 'Issued to', value: cert.name },
                { label: 'Organization', value: cert.org },
                { label: 'Issue Date', value: cert.date },
                { label: 'Hours Logged', value: `${cert.hours} hours` },
              ].map(row => (
                <div key={row.label}>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '4px' }}>{row.label}</div>
                  <div style={{ fontSize: '15px', color: 'var(--ink)', fontWeight: 500, fontFamily: row.mono ? 'monospace' : 'inherit' }}>{row.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-padding">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#E6FAF4', color: 'var(--teal-700)', padding: '6px 12px', borderRadius: '99px', fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              Verified
            </div>
            <p style={{ fontSize: '13px', color: 'var(--body)', lineHeight: 1.6, marginBottom: '0' }}>
              This certificate is cryptographically signed and publicly verifiable on the SabiHands platform.
            </p>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '16px', marginBottom: '16px' }}>Share</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', backgroundColor: '#0A66C2', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', width: '100%' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                Add to LinkedIn
              </button>
              <button
                onClick={handleCopy}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', backgroundColor: copied ? '#E6FAF4' : 'var(--paper)', color: copied ? 'var(--teal-700)' : 'var(--ink)', border: '1.5px solid #E4E1F5', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', width: '100%', transition: 'all 0.2s ease' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                {copied ? 'Copied!' : 'Copy Verify Link'}
              </button>
              <button
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', backgroundColor: 'var(--paper)', color: 'var(--ink)', border: '1.5px solid #E4E1F5', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', width: '100%' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>

        <Link to="/dashboard/volunteer/certificates" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 0' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Certificates
        </Link>
      </aside>

      {/* ── MAIN CONTENT: The Certificate ── */}
      <div className="main-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 50 }}
        >
          {/* Outer certificate frame */}
          <div style={{ backgroundColor: '#F8F9FB', position: 'relative', border: '1px solid #E4E1F5', boxShadow: '0 24px 64px -24px rgba(38,33,92,0.15)', overflow: 'hidden', aspectRatio: '1.414 / 1', display: 'flex' }}>
            
            {/* Top Left Big Blue Block */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '60%', height: '35%', backgroundColor: '#2E358A', zIndex: 1, padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
               <div style={{ color: 'white', fontSize: 'clamp(24px, 4vw, 56px)', fontWeight: 800, fontFamily: 'var(--display)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                 Certificate of <br/><span style={{ color: '#4CC5DE' }}>Completion</span>
               </div>
            </div>

            {/* Top Left Abstract Circles inside the Blue Block */}
            <div style={{ position: 'absolute', top: '-15%', left: '10%', width: '40%', height: '40%', borderRadius: '50%', border: '25px solid #4CC5DE', zIndex: 2, opacity: 0.9 }}></div>
            <div style={{ position: 'absolute', top: '-5%', left: '20%', width: '20%', height: '20%', borderRadius: '50%', border: '15px solid rgba(255,255,255,0.2)', zIndex: 2 }}></div>

            {/* Top Right Date */}
            <div style={{ position: 'absolute', top: '40px', right: '40px', zIndex: 3, fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
              Issued on : {cert.date}
            </div>

            {/* Top Right Lines */}
            <div style={{ position: 'absolute', top: '25%', right: '-20px', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '8px', transform: 'rotate(-45deg)' }}>
               {[...Array(6)].map((_, i) => (
                 <div key={i} style={{ width: '80px', height: '3px', backgroundColor: '#4CC5DE' }}></div>
               ))}
            </div>

            {/* Bottom Left Lines */}
            <div style={{ position: 'absolute', bottom: '15%', left: '-30px', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '8px', transform: 'rotate(-45deg)' }}>
               {[...Array(6)].map((_, i) => (
                 <div key={i} style={{ width: '80px', height: '3px', backgroundColor: '#4CC5DE' }}></div>
               ))}
            </div>

            {/* Bottom Right Abstract Shape ('t' looking object) */}
            <div style={{ position: 'absolute', bottom: '-5%', right: '5%', zIndex: 2, color: '#2E358A', fontSize: '300px', fontWeight: 900, fontFamily: 'var(--display)', lineHeight: 0.8 }}>
              t
            </div>

            {/* Inner Content Wrapper */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%', zIndex: 5, marginTop: '15%' }}>
              
              <div style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink)', marginBottom: '16px' }}>
                THIS CERTIFICATE IS PRESENTED TO
              </div>

              <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', borderBottom: '4px solid #4CC5DE', paddingBottom: '16px', display: 'inline-block', width: 'fit-content', paddingRight: '20px' }}>
                {cert.name}
              </div>

              <div style={{ marginTop: '24px', fontSize: '16px', fontWeight: 600, color: 'var(--ink)', maxWidth: '60%', lineHeight: 1.5 }}>
                For Completing The {cert.gig} in {cert.org}
              </div>

              {/* Signatures */}
              <div style={{ display: 'flex', gap: '64px', marginTop: '48px' }}>
                <div>
                   <div style={{ width: '120px', borderBottom: '1.5px solid var(--ink)', paddingBottom: '8px', marginBottom: '8px' }}>
                     <svg viewBox="0 0 100 40" style={{ width: '100%', height: '40px' }}>
                       <path d="M10 30 Q25 10 40 30 T70 20 T90 35" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
                     </svg>
                   </div>
                   <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>Pablo Walker</div>
                   <div style={{ fontSize: '12px', color: 'var(--ink)', fontWeight: 500 }}>Master of Content Writing</div>
                </div>

                <div>
                   <div style={{ width: '120px', borderBottom: '1.5px solid var(--ink)', paddingBottom: '8px', marginBottom: '8px' }}>
                     <svg viewBox="0 0 100 40" style={{ width: '100%', height: '40px' }}>
                       <path d="M20 30 Q30 5 40 30 T60 15 Q75 10 70 35" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
                     </svg>
                   </div>
                   <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>Leira Swan</div>
                   <div style={{ fontSize: '12px', color: 'var(--ink)', fontWeight: 500 }}>Senior of Content Writing</div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default CertificateDetail;
