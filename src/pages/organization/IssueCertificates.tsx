import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';

const IssueCertificates: React.FC = () => {
  const { id } = useParams();
  const [issued, setIssued] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [gig, setGig] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      const { data: gigData } = await supabase
        .from('gigs')
        .select(`
          *,
          organizations(name)
        `)
        .eq('id', id)
        .single();
      
      if (gigData) setGig(gigData);

      const { data: attendanceData } = await supabase
        .from('attendance')
        .select(`
          *,
          applications!inner(
            volunteer_id,
            volunteer_profiles(full_name)
          )
        `)
        .eq('applications.gig_id', id)
        .eq('attended', true);

      if (attendanceData) {
        setAttendees(attendanceData);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleIssue = async () => {
    if (!gig || attendees.length === 0) return;
    setIssuing(true);
    
    // Generate certificates
    const certificates = attendees.map(a => ({
      attendance_id: a.id,
      volunteer_id: a.applications.volunteer_id,
      gig_id: gig.id,
      verification_code: `SH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      issued_at: new Date().toISOString()
    }));

    const { error: certError } = await supabase
      .from('certificates')
      .insert(certificates);

    if (certError) {
      alert('Failed to issue certificates');
      setIssuing(false);
      return;
    }

    // Update gig status
    await supabase
      .from('gigs')
      .update({ status: 'completed' })
      .eq('id', gig.id);

    setIssuing(false);
    setIssued(true);
  };

  if (loading) return <LoadingScreen message="Loading..." fullScreen={true} />;
  if (!gig) return <div style={{ padding: '48px', textAlign: 'center' }}>Gig not found.</div>;


  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '15px', marginBottom: '16px' }}>Certificate Details</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '4px' }}>Gig Name</div>
                <div style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 600 }}>{gig.title}</div>
              </div>
              
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '4px' }}>Hours to award</div>
                <div style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 600 }}>{attendees.length > 0 ? attendees[0].hours : 0} hours</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '4px' }}>Recipients</div>
                <div style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 600 }}>{attendees.length} volunteers</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-padding">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>How it works</h3>
            <p style={{ fontSize: '13px', color: 'var(--body)', lineHeight: 1.5, margin: 0 }}>
              Certificates are automatically generated using the gig details and the volunteer's name. They are cryptographically signed by SabiHands and instantly added to the volunteer's profile.
            </p>
          </div>
        </div>

        <Link to={`/dashboard/org/gigs/${gig.id}/attendance`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 0' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Attendance
        </Link>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        <AnimatePresence mode="wait">
          {!issued ? (
            <motion.div key="preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="dash-card">
                <div className="dash-card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                  <h2 className="dash-card-title">Issue Certificates</h2>
                  <p style={{ fontSize: '14px', color: 'var(--body)', margin: 0 }}>Review the list of recipients and the certificate preview before issuing.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '24px', padding: '24px', flexWrap: 'wrap' }}>
                  {/* Left col: Recipients */}
                  <div style={{ flex: '1 1 250px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recipients</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {attendees.length === 0 && <div style={{ fontSize: '13px', color: 'var(--muted)' }}>No attendees marked present.</div>}
                      {attendees.map(a => {
                        const name = a.applications.volunteer_profiles?.full_name || 'Volunteer';
                        const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                        return (
                        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'var(--paper)', borderRadius: '10px', border: '1px solid #E4E1F5' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--purple-100)', color: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', fontFamily: 'var(--display)' }}>
                            {initials}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{name}</div>
                          <div style={{ marginLeft: 'auto', color: 'var(--teal-600)' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                        </div>
                      )})}
                    </div>
                  </div>

                  {/* Right col: Preview */}
                  <div style={{ flex: '2 1 400px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preview</h3>
                    
                    {/* Mini Cert Preview */}
                    <div style={{ backgroundColor: 'white', border: '1px solid #E4E1F5', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px -10px rgba(38,33,92,0.1)' }}>
                      <div style={{ height: '6px', background: 'linear-gradient(90deg, var(--teal-400), var(--purple-400))' }} />
                      <div style={{ padding: '32px', textAlign: 'center', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, var(--purple-50) 0%, transparent 70%)' }} />
                        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--muted)', marginBottom: '8px' }}>Certificate of Volunteering</div>
                        <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg, var(--teal-400), var(--purple-400))', margin: '0 auto 20px', borderRadius: '2px' }} />
                        <div style={{ fontSize: '12px', color: 'var(--body)', marginBottom: '8px' }}>This is to certify that</div>
                        <div style={{ fontFamily: 'var(--display)', fontSize: '32px', fontStyle: 'italic', fontWeight: 700, color: 'var(--purple-600)', lineHeight: 1.1, marginBottom: '24px' }}>[Volunteer Name]</div>
                        <div style={{ fontSize: '12px', color: 'var(--body)', lineHeight: 1.5 }}>
                          has successfully volunteered for<br/>
                          <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{gig.title}</span><br/>
                          organized by <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{gig.organizations?.name}</span><br/>
                          contributing <span style={{ fontWeight: 700, color: 'var(--teal-600)' }}>{attendees.length > 0 ? attendees[0].hours : 0} hours</span> of service.
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <div style={{ padding: '24px', backgroundColor: '#FAFAFC', borderTop: '1px solid #E4E1F5', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleIssue} disabled={issuing || attendees.length === 0} style={{ padding: '14px 32px', backgroundColor: 'var(--purple-600)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(83,74,183,0.3)', opacity: (issuing || attendees.length === 0) ? 0.7 : 1 }}>
                    {issuing ? 'Issuing...' : `Issue ${attendees.length} Certificates`}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="dash-card">
                <div style={{ background: 'linear-gradient(135deg, var(--purple-900) 0%, var(--purple-600) 100%)', padding: '64px 32px', textAlign: 'center', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                  <div style={{ position: 'absolute', bottom: '-50px', left: '-20px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(45,212,191,0.1)' }} />

                  <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal-400), var(--teal-600))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 12px 28px rgba(29,158,117,0.3)' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  
                  <h1 style={{ fontSize: '32px', fontFamily: 'var(--display)', color: 'white', marginBottom: '12px', position: 'relative' }}>
                    Certificates Issued! 🎉
                  </h1>
                  <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 32px', position: 'relative' }}>
                    {attendees.length} volunteers have received their verified certificates and logged their hours.
                  </p>

                  <div style={{ position: 'relative', display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <Link to="/dashboard/org/gigs" style={{ padding: '14px 28px', backgroundColor: 'white', color: 'var(--purple-900)', borderRadius: '10px', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }}>
                      Back to Gigs
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default IssueCertificates;
