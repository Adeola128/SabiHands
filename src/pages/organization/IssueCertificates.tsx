import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/LoadingScreen';

const StarRating: React.FC<{ rating: number, onChange: (rating: number) => void }> = ({ rating, onChange }) => {
  return (
    <div style={{ display: 'flex', gap: '4px', cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <svg 
          key={star} 
          onClick={() => onChange(star)}
          width="16" height="16" viewBox="0 0 24 24" 
          fill={star <= rating ? "#FFC107" : "none"} 
          stroke={star <= rating ? "#FFC107" : "var(--muted)"} 
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      ))}
    </div>
  );
};

const IssueCertificates: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [issued, setIssued] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [gig, setGig] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState<string | null>(null);

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
        const initialNames: Record<string, string> = {};
        attendanceData.forEach((a: any) => {
          initialNames[a.applications.volunteer_id] = a.applications.volunteer_profiles?.full_name || 'Volunteer';
        });
        setNames(initialNames);
        if (attendanceData.length > 0) {
          setPreviewId(attendanceData[0].applications.volunteer_id);
        }
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
      issued_at: new Date().toISOString(),
      recipient_name: names[a.applications.volunteer_id] || 'Volunteer'
    }));

    const { error: certError } = await supabase
      .from('certificates')
      .insert(certificates);

    if (certError) {
      alert('Failed to issue certificates');
      setIssuing(false);
      return;
    }

    // Insert Ratings
    if (user) {
      const { data: orgData } = await supabase.from('organizations').select('id').eq('user_id', user.id).single();
      if (orgData) {
        const ratingRecords = attendees
          .filter(a => ratings[a.applications.volunteer_id])
          .map(a => ({
            rater_id: orgData.id,
            ratee_id: a.applications.volunteer_id,
            gig_id: gig.id,
            score: ratings[a.applications.volunteer_id],
            review: ''
          }));

        if (ratingRecords.length > 0) {
          await supabase.from('ratings').insert(ratingRecords);
        }
      }
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
                        const name = names[a.applications.volunteer_id] || 'Volunteer';
                        const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                        const isPreview = previewId === a.applications.volunteer_id;
                        return (
                        <div key={a.id} onClick={() => setPreviewId(a.applications.volunteer_id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: isPreview ? 'var(--purple-50)' : 'var(--paper)', borderRadius: '10px', border: `1px solid ${isPreview ? 'var(--purple-400)' : '#E4E1F5'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--purple-100)', color: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', fontFamily: 'var(--display)', flexShrink: 0 }}>
                            {initials}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                            <input 
                              type="text" 
                              value={names[a.applications.volunteer_id] || ''}
                              onChange={(e) => setNames(prev => ({ ...prev, [a.applications.volunteer_id]: e.target.value }))}
                              onClick={(e) => e.stopPropagation()}
                              style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', border: '1px solid transparent', borderBottom: '1px solid #D1CEDF', outline: 'none', background: 'transparent', padding: '2px 0', width: '100%' }}
                              placeholder="Certificate Name"
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Rate volunteer:</span>
                              <div onClick={(e) => e.stopPropagation()}>
                                <StarRating 
                                  rating={ratings[a.applications.volunteer_id] || 0} 
                                  onChange={(score) => setRatings(prev => ({ ...prev, [a.applications.volunteer_id]: score }))} 
                                />
                              </div>
                            </div>
                          </div>
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
                    
                    {/* Mini Cert Preview (Scaled down new design) */}
                    <div style={{ backgroundColor: '#F8F9FB', position: 'relative', border: '1px solid #E4E1F5', borderRadius: '8px', boxShadow: '0 10px 30px -10px rgba(38,33,92,0.1)', overflow: 'hidden', aspectRatio: '1.414 / 1', display: 'flex', fontSize: '0.55rem' }}>
                      
                      {/* Top Left Big Blue Block */}
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '60%', height: '35%', backgroundColor: '#2E358A', zIndex: 1, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                         <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--display)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                           Certificate of <br/><span style={{ color: '#4CC5DE' }}>Completion</span>
                         </div>
                      </div>

                      {/* Top Left Abstract Circles inside the Blue Block */}
                      <div style={{ position: 'absolute', top: '-15%', left: '10%', width: '40%', height: '40%', borderRadius: '50%', border: '10px solid #4CC5DE', zIndex: 2, opacity: 0.9 }}></div>
                      <div style={{ position: 'absolute', top: '-5%', left: '20%', width: '20%', height: '20%', borderRadius: '50%', border: '6px solid rgba(255,255,255,0.2)', zIndex: 2 }}></div>

                      {/* Top Right Date */}
                      <div style={{ position: 'absolute', top: '15px', right: '20px', zIndex: 3, fontSize: '0.6rem', fontWeight: 600, color: 'var(--ink)' }}>
                        Issued on : {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>

                      {/* Top Right Lines */}
                      <div style={{ position: 'absolute', top: '25%', right: '-10px', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '4px', transform: 'rotate(-45deg)' }}>
                         {[...Array(6)].map((_, i) => (
                           <div key={i} style={{ width: '40px', height: '2px', backgroundColor: '#4CC5DE' }}></div>
                         ))}
                      </div>

                      {/* Bottom Left Lines */}
                      <div style={{ position: 'absolute', bottom: '15%', left: '-15px', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '4px', transform: 'rotate(-45deg)' }}>
                         {[...Array(6)].map((_, i) => (
                           <div key={i} style={{ width: '40px', height: '2px', backgroundColor: '#4CC5DE' }}></div>
                         ))}
                      </div>

                      {/* Bottom Right Abstract Shape ('t' looking object) */}
                      <div style={{ position: 'absolute', bottom: '-5%', right: '5%', zIndex: 2, color: '#2E358A', fontSize: '120px', fontWeight: 900, fontFamily: 'var(--display)', lineHeight: 0.8 }}>
                        t
                      </div>

                      {/* Inner Content Wrapper */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%', zIndex: 5, marginTop: '15%' }}>
                        
                        <div style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink)', marginBottom: '8px' }}>
                          THIS CERTIFICATE IS PRESENTED TO
                        </div>

                        <div style={{ fontFamily: 'var(--display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', borderBottom: '2px solid #4CC5DE', paddingBottom: '8px', display: 'inline-block', width: 'fit-content', paddingRight: '10px' }}>
                          {previewId ? (names[previewId] || '[Volunteer Name]') : '[Volunteer Name]'}
                        </div>

                        <div style={{ marginTop: '12px', fontSize: '0.65rem', fontWeight: 600, color: 'var(--ink)', maxWidth: '65%', lineHeight: 1.5 }}>
                          For Completing The {gig.title} in {gig.organizations?.name}
                        </div>

                        {/* Signatures */}
                        <div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
                          <div>
                             <div style={{ width: '50px', borderBottom: '1px solid var(--ink)', paddingBottom: '4px', marginBottom: '4px' }}>
                               <svg viewBox="0 0 100 40" style={{ width: '100%', height: '20px' }}>
                                 <path d="M10 30 Q25 10 40 30 T70 20 T90 35" fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
                               </svg>
                             </div>
                             <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--ink)' }}>Pablo Walker</div>
                             <div style={{ fontSize: '0.45rem', color: 'var(--ink)', fontWeight: 500 }}>Master of Content Writing</div>
                          </div>

                          <div>
                             <div style={{ width: '50px', borderBottom: '1px solid var(--ink)', paddingBottom: '4px', marginBottom: '4px' }}>
                               <svg viewBox="0 0 100 40" style={{ width: '100%', height: '20px' }}>
                                 <path d="M20 30 Q30 5 40 30 T60 15 Q75 10 70 35" fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
                               </svg>
                             </div>
                             <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--ink)' }}>Leira Swan</div>
                             <div style={{ fontSize: '0.45rem', color: 'var(--ink)', fontWeight: 500 }}>Senior of Content Writing</div>
                          </div>
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
