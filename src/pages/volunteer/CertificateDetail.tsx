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
          name: data.users?.volunteer_profiles[0]?.full_name || 'Volunteer',
          gig: data.gigs?.title,
          org: data.gigs?.organizations?.name,
          date: new Date(data.issued_at).toLocaleDateString(),
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
          <div style={{ backgroundColor: 'var(--white)', borderRadius: '24px', border: '1px solid #E4E1F5', boxShadow: '0 24px 64px -24px rgba(38,33,92,0.15)', overflow: 'hidden' }}>

            {/* Top gradient bar */}
            <div style={{ height: '10px', background: 'linear-gradient(90deg, var(--teal-400) 0%, var(--purple-400) 50%, var(--teal-400) 100%)', backgroundSize: '200% 100%' }} />

            {/* Inner padding */}
            <div style={{ padding: '56px 64px' }}>

              {/* Watermark decoration */}
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-24px', right: '-24px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, var(--purple-50) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, var(--teal-50) 0%, transparent 70%)', pointerEvents: 'none' }} />

                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg viewBox="0 0 100 100" style={{ width: '36px', height: '36px' }}>
                      <path d="M60 15 A35 35 0 1 0 60 85" fill="none" stroke="#AFA9EC" strokeWidth="16" strokeLinecap="round" />
                      <path d="M40 15 A35 35 0 1 1 40 85" fill="none" stroke="#5DCAA5" strokeWidth="16" strokeLinecap="round" />
                    </svg>
                    <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '18px', color: 'var(--ink)', letterSpacing: '-0.02em' }}>SabiHands</span>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#E6FAF4', color: 'var(--teal-700)', padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                    Verified Certificate
                  </div>
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: '12px' }}>Certificate of Volunteering</div>
                  <div style={{ width: '60px', height: '3px', background: 'linear-gradient(90deg, var(--teal-400), var(--purple-400))', margin: '0 auto 32px', borderRadius: '2px' }} />
                  <div style={{ fontSize: '16px', color: 'var(--body)', marginBottom: '12px' }}>This is to certify that</div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: '52px', fontStyle: 'italic', fontWeight: 700, color: 'var(--purple-600)', lineHeight: 1.1, marginBottom: '8px', letterSpacing: '-0.02em' }}>{cert.name}</div>
                </div>

                {/* Body text */}
                <div style={{ textAlign: 'center', fontSize: '17px', color: 'var(--body)', lineHeight: 1.7, marginBottom: '48px' }}>
                  has successfully volunteered for<br/>
                  <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '19px' }}>{cert.gig}</span><br/>
                  organized by <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{cert.org}</span><br/>
                  on <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{cert.date}</span>, contributing <span style={{ fontWeight: 700, color: 'var(--teal-600)' }}>{cert.hours} hours</span> of service.
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '48px' }}>
                  {[
                    { label: 'Type', value: cert.type },
                    { label: 'Hours', value: `${cert.hours}h` },
                    { label: 'Status', value: 'Verified ✓' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '20px 16px', backgroundColor: 'var(--paper)', borderRadius: '14px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '8px' }}>{s.label}</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--display)' }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '32px', borderTop: '1px dashed #D1CEDF' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '4px' }}>Certificate ID</div>
                    <div style={{ fontSize: '15px', fontFamily: 'monospace', color: 'var(--ink)', fontWeight: 500 }}>{certIdDisplay}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '4px' }}>Verify at</div>
                    <div style={{ fontSize: '13px', color: 'var(--purple-600)', fontWeight: 600 }}>sabihands.com/verify/{id}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--purple-400) 0%, var(--teal-400) 100%)' }} />
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default CertificateDetail;
