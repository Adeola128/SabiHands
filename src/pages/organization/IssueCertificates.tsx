import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { uploadImage } from '../../lib/uploadImage';
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
  const [allIssued, setAllIssued] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState<string | null>(null);
  
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      const { data: gigData } = await supabase
        .from('gigs')
        .select(`
          *,
          organizations(id, name, logo_url)
        `)
        .eq('id', id)
        .single();
      
      if (gigData) setGig(gigData);

      // Fetch existing certificates to prevent re-issuing
      const { data: existingCerts } = await supabase
        .from('certificates')
        .select('volunteer_id')
        .eq('gig_id', id);
        
      const issuedVolunteerIds = new Set(existingCerts?.map(c => c.volunteer_id) || []);

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
        // Filter out those who already have a certificate
        const eligibleAttendees = attendanceData.filter(a => !issuedVolunteerIds.has(a.applications.volunteer_id));
        
        setAttendees(eligibleAttendees);
        
        if (attendanceData.length > 0 && eligibleAttendees.length === 0) {
           setAllIssued(true);
        }

        const initialNames: Record<string, string> = {};
        eligibleAttendees.forEach((a: any) => {
          initialNames[a.applications.volunteer_id] = a.applications.volunteer_profiles?.full_name || 'Volunteer';
        });
        setNames(initialNames);
        if (eligibleAttendees.length > 0) {
          setPreviewId(eligibleAttendees[0].applications.volunteer_id);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!gig || !gig.organizations || !e.target.files || !e.target.files[0]) return;
    setUploadingLogo(true);
    try {
      const url = await uploadImage(e.target.files[0], 'org-logos');
      
      // Update organization record
      await supabase
        .from('organizations')
        .update({ logo_url: url })
        .eq('id', gig.organizations.id);
        
      // Update local state
      setGig((prev: any) => ({
        ...prev,
        organizations: { ...prev.organizations, logo_url: url }
      }));
    } catch (err: any) {
      alert(`Failed to upload logo: ${err.message}`);
    } finally {
      setUploadingLogo(false);
    }
  };

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
    if (user && gig.organizations?.id) {
      const ratingRecords = attendees
        .filter(a => ratings[a.applications.volunteer_id])
        .map(a => ({
          rater_id: gig.organizations.id,
          ratee_id: a.applications.volunteer_id,
          gig_id: gig.id,
          score: ratings[a.applications.volunteer_id],
          review: ''
        }));

      if (ratingRecords.length > 0) {
        await supabase.from('ratings').insert(ratingRecords);
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
      {/* â”€â”€ SIDEBAR â”€â”€ */}
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
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '12px' }}>Organization Logo</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'var(--purple-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #E4E1F5' }}>
                {gig.organizations?.logo_url ? (
                  <img src={gig.organizations.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontWeight: 700, color: 'var(--purple-600)', fontSize: '16px' }}>{gig.organizations?.name?.substring(0,2).toUpperCase()}</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: 'var(--white)', border: '1.5px solid #E4E1F5', borderRadius: '6px', fontWeight: 600, fontSize: '12px', cursor: 'pointer', color: 'var(--ink)' }}>
                  {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} disabled={uploadingLogo} />
                </label>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>This logo will appear on all certificates issued by your organization.</p>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-padding">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>How it works</h3>
            <p style={{ fontSize: '13px', color: 'var(--body)', lineHeight: 1.5, margin: 0 }}>
              Certificates are automatically generated and cryptographically signed by Gigway, making them verifiable and secure.
            </p>
          </div>
        </div>

        <Link to={`/dashboard/org/gigs/${gig.id}/attendance`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 0' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Attendance
        </Link>
      </aside>

      {/* â”€â”€ MAIN CONTENT â”€â”€ */}
      <div className="main-content">
        <AnimatePresence mode="wait">
          {!issued ? (
            <motion.div key="preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="dash-card">
                <div className="dash-card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                  <h2 className="dash-card-title">Issue Certificates</h2>
                  <p style={{ fontSize: '14px', color: 'var(--body)', margin: 0 }}>Review the list of recipients and the certificate preview before issuing.</p>
                </div>
                
                {allIssued && attendees.length === 0 ? (
                   <div style={{ padding: '48px', textAlign: 'center' }}>
                     <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', marginBottom: '16px' }}>
                       <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                     </div>
                     <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>All Certificates Issued!</h3>
                     <p style={{ fontSize: '14px', color: 'var(--body)' }}>All attendees for this gig have already been issued their certificates.</p>
                   </div>
                ) : (
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
                      
                      {/* Mini Cert Preview (Premium redesign) */}
                      <div style={{ backgroundColor: '#ffffff', position: 'relative', border: '1px solid #E4E1F5', borderRadius: '4px', boxShadow: '0 20px 40px -10px rgba(83,74,183,0.15)', overflow: 'hidden', aspectRatio: '1.414 / 1', display: 'flex', flexDirection: 'column', fontSize: '0.6rem' }}>
                        
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             {gig.organizations?.logo_url ? (
                               <img src={gig.organizations.logo_url} alt="Org Logo" style={{ maxWidth: '30px', maxHeight: '30px', objectFit: 'contain' }} />
                             ) : (
                               <div style={{ width: '30px', height: '30px', backgroundColor: 'var(--purple-50)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-700)', fontWeight: 700, fontSize: '8px' }}>
                                 {gig.organizations?.name?.substring(0,2).toUpperCase()}
                               </div>
                             )}
                             <span style={{ fontSize: '0.55rem', fontWeight: 600, color: 'var(--ink)' }}>{gig.organizations?.name || 'Organization Name'}</span>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                             <img src="https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=https://Gigway.com/verify/preview" alt="QR Code" style={{ width: '40px', height: '40px' }} />
                          </div>
                        </div>

                        {/* Title Section */}
                        <div style={{ padding: '0 5% 0 22%', zIndex: 1, position: 'relative' }}>
                          <h1 style={{ fontFamily: 'var(--display)', fontSize: '0.9rem', color: 'var(--purple-900)', margin: '0 0 4px', letterSpacing: '0.05em', fontWeight: 600, textTransform: 'uppercase' }}>CERTIFICATE OF VOLUNTEER SERVICE</h1>
                        </div>

                        {/* Body Content */}
                        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', padding: '2% 5% 2% 22%', position: 'relative' }}>
                          <p style={{ color: 'var(--muted)', fontSize: '0.55rem', margin: '0 0 4px', fontWeight: 500 }}>This is to acknowledge</p>
                          
                          <div style={{ fontFamily: 'var(--display)', fontSize: '1.6rem', color: 'var(--ink)', fontWeight: 600, paddingBottom: '4px', marginBottom: '8px', borderBottom: '1px solid #E4E1F5', textAlign: 'left' }}>
                            {previewId ? (names[previewId] || '[Volunteer Name]') : '[Volunteer Name]'}
                          </div>
                          
                          <p style={{ color: 'var(--muted)', fontSize: '0.55rem', margin: '0 0 2px', fontWeight: 500 }}>has successfully completed</p>
                          <div style={{ fontSize: '0.75rem', color: 'var(--ink)', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase' }}>{gig.title}</div>
                          <p style={{ color: 'var(--muted)', fontSize: '0.45rem', margin: '0 0 8px', fontWeight: 500 }}>by completing all required volunteer service hours with {gig.organizations?.name}.</p>
                          
                          <div style={{ borderBottom: '1px solid #E4E1F5', paddingBottom: '4px', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                             <span style={{ fontSize: '0.45rem', fontWeight: 600, color: 'var(--ink)' }}>SERVICE HOURS: {attendees.length > 0 ? attendees[0].hours : 0} HOURS.</span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 1, padding: '0 5% 5% 22%', marginTop: 'auto', position: 'relative' }}>
                          <div style={{ flex: 1, textAlign: 'left' }}>
                            <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--ink)' }}>Authorized by Gigway</div>
                            <div style={{ fontSize: '0.45rem', color: 'var(--muted)' }}>Verification Partner</div>
                          </div>
                          
                          <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--ink)' }}>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}</div>
                            <div style={{ fontSize: '0.45rem', color: 'var(--muted)' }}>Issue Date</div>
                          </div>
                          
                          <div style={{ flex: 1, textAlign: 'right' }}>
                            <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--ink)' }}>PREVIEW-ID</div>
                            <div style={{ fontSize: '0.45rem', color: 'var(--muted)' }}>Certificate ID</div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

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
                    Certificates Issued! ðŸŽ‰
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

