import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';
import './VolunteerPages.css';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const CertificateDetail: React.FC = () => {
  const { id } = useParams(); // This is the verification_code
  const certIdDisplay = id ? id.toUpperCase() : '';
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleCopy = () => {
    if (cert && cert.code) {
      navigator.clipboard.writeText(`https://Ralvo.com/verify/${cert.code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('certificate-node');
    if (!element) return;
    const opt = {
      margin:       0,
      filename:     `Certificate-${cert.name.replace(/\s+/g, '-')}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in' as const, format: 'letter' as const, orientation: 'landscape' as const }
    };
    html2pdf().set(opt).from(element).save();
  };

  useEffect(() => {
    const fetchCert = async () => {
      if (!id) return;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      let query = supabase
        .from('certificates')
        .select(`
          *,
          gigs(title, type, organizations(name, logo_url)),
          attendance(hours)
        `);
        
      if (isUuid) {
        query = query.eq('id', id);
      } else {
        query = query.eq('verification_code', id);
      }
      
      const { data, error } = await query.single();
      
      if (error) {
         console.error("Certificate fetch error:", error);
         setFetchError(error.message || JSON.stringify(error));
      }

      if (data) {
        let certName = data.recipient_name;
        if (!certName && data.volunteer_id) {
           const { data: vp } = await supabase.from('volunteer_profiles').select('full_name').eq('user_id', data.volunteer_id).maybeSingle();
           if (vp?.full_name) certName = vp.full_name;
        }
        
        const gig = Array.isArray(data.gigs) ? data.gigs[0] : data.gigs;
        const org = gig?.organizations ? (Array.isArray(gig.organizations) ? gig.organizations[0] : gig.organizations) : null;
        const attendance = Array.isArray(data.attendance) ? data.attendance[0] : data.attendance;

        setCert({
          name: certName || 'Volunteer',
          gig: gig?.title,
          org: org?.name,
          org_logo: org?.logo_url,
          date: new Date(data.issued_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase(),
          type: gig?.type,
          hours: attendance?.hours || 0,
          code: data.verification_code
        });
      }
      setLoading(false);
    };
    fetchCert();
  }, [id]);

  if (loading) return <LoadingScreen message="Loading certificate details..." fullScreen={true} />;
  if (fetchError) return <div style={{ padding: '48px', textAlign: 'center', color: 'red' }}>Error fetching certificate: {fetchError}</div>;
  if (!cert) return <div style={{ padding: '48px', textAlign: 'center' }}>Certificate not found.</div>;

  return (
    <>
      {/* â”€â”€ SIDEBAR â”€â”€ */}
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
              This certificate is cryptographically signed and publicly verifiable on the Ralvo platform.
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
                onClick={handleDownloadPDF}
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
          <div id="certificate-node" style={{ backgroundColor: '#ffffff', position: 'relative', border: '1px solid #E4E1F5', borderRadius: '8px', boxShadow: '0 30px 60px -15px rgba(83,74,183,0.15)', overflow: 'hidden', aspectRatio: '1.414 / 1', display: 'flex', flexDirection: 'column' }}>
            
            {/* Top-left Geometric Banner */}
            <div style={{ position: 'absolute', top: 0, left: '5%', width: '15%', height: '45%', zIndex: 0 }}>
               <svg viewBox="0 0 100 200" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                 <polygon points="0,0 100,0 100,160 50,200 0,160" fill="var(--purple-900)" />
                 <polygon points="100,140 100,180 80,160" fill="var(--teal-500)" />
               </svg>
            </div>
            {/* Bottom-right Geometric Shape */}
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '20%', height: '25%', zIndex: 0 }}>
               <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                 <polygon points="100,0 100,100 0,100" fill="var(--purple-900)" />
               </svg>
            </div>
            
            {/* Header: Logos */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1, padding: '5% 5% 2% 22%', marginBottom: 'auto', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                 {cert.org_logo ? (
                   <img src={cert.org_logo} alt="Org Logo" style={{ maxWidth: '60px', maxHeight: '60px', objectFit: 'contain' }} />
                 ) : (
                   <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--purple-50)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-700)', fontWeight: 700, fontSize: '18px' }}>
                     {cert.org?.substring(0,2).toUpperCase()}
                   </div>
                 )}
                 <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)' }}>{cert.org || 'Organization Name'}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://Ralvo.com/verify/${cert.code}`} alt="QR Code" style={{ width: '80px', height: '80px' }} />
              </div>
            </div>

            {/* Title Section */}
            <div style={{ padding: '0 5% 0 22%', zIndex: 1, position: 'relative' }}>
              <h1 style={{ fontFamily: 'var(--display)', fontSize: '1.8rem', color: 'var(--purple-900)', margin: '0 0 8px', letterSpacing: '0.05em', fontWeight: 600, textTransform: 'uppercase' }}>CERTIFICATE OF VOLUNTEER SERVICE</h1>
            </div>

            {/* Body Content */}
            <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', padding: '2% 5% 2% 22%', position: 'relative' }}>
              <p style={{ color: 'var(--muted)', fontSize: '1.1rem', margin: '0 0 8px', fontWeight: 500 }}>This is to acknowledge</p>
              
              <div style={{ fontFamily: 'var(--display)', fontSize: '3.2rem', color: 'var(--ink)', fontWeight: 600, paddingBottom: '8px', marginBottom: '16px', borderBottom: '2px solid #E4E1F5', textAlign: 'left' }}>
                {cert.name}
              </div>
              
              <p style={{ color: 'var(--muted)', fontSize: '1.1rem', margin: '0 0 4px', fontWeight: 500 }}>has successfully completed</p>
              <div style={{ fontSize: '1.5rem', color: 'var(--ink)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>{cert.gig}</div>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 16px', fontWeight: 500 }}>by completing all required volunteer service hours with {cert.org}.</p>
              
              <div style={{ borderBottom: '2px solid #E4E1F5', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                 <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)' }}>SERVICE HOURS: {cert.hours} HOURS.</span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 1, padding: '0 5% 5% 22%', marginTop: 'auto', position: 'relative' }}>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)' }}>Authorized by Ralvo</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Verification Partner</div>
              </div>
              
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)' }}>{cert.date}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Issue Date</div>
              </div>
              
              <div style={{ flex: 1, textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)' }}>{certIdDisplay}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Certificate ID</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default CertificateDetail;

