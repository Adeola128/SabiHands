import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';
import { MapPin, UploadCloud, Clock, AlertCircle, Award, Star } from 'lucide-react';
import ReviewModal from '../../components/ReviewModal';

type Tab = 'upcoming' | 'completed';

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  active:    { bg: '#D4EDDA', color: '#155724', label: 'Check-In Open' },
  upcoming:  { bg: '#FFF3CD', color: '#856404', label: 'Pending / Confirmed' },
  completed: { bg: '#D4EDDA', color: '#155724', label: 'Completed' },
  past:      { bg: '#F8FAFC', color: '#64748B', label: 'Closed' },
};

const MyGigs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [upcomingGigs, setUpcomingGigs] = useState<any[]>([]);
  const [completedGigs, setCompletedGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { user } = useAuth();
  const [reviewingGig, setReviewingGig] = useState<any | null>(null);

  useEffect(() => {
    const fetchGigs = async () => {
      if (!user) return;
      let { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          gigs (
            id,
            title,
            description,
            location,
            date_start,
            date_end,
            type,
            image_url,
            organizations (
              name,
              user_id
            )
          ),
          attendance(
            certificates(id, verification_code)
          ),
          submissions(id, status)
        `)
        .eq('volunteer_id', user.id);

      if (error) {
        console.warn("Error fetching with submissions (did you run the SQL migration?):", error);
        
        // Fallback query without submissions
        const fallback = await supabase
          .from('applications')
          .select(`
            id,
            status,
            gigs (
              id,
              title,
              description,
              location,
              date_start,
              date_end,
              type,
              image_url,
              organizations (
                name,
                user_id
              )
            ),
            attendance(
              certificates(id, verification_code)
            )
          `)
          .eq('volunteer_id', user.id);
          
        if (fallback.error) {
          setErrorMsg(fallback.error.message || JSON.stringify(fallback.error));
        }
        data = fallback.data as any;
      }

      if (data) {
        const upcoming: any[] = [];
        const completed: any[] = [];

        data.forEach((app: any) => {
          if (!app.gigs) return;
          const gigDate = app.gigs.date_start ? new Date(app.gigs.date_start) : new Date();
          
          // Check if there is a certificate via attendance
          let hasCert = false;
          let certId = null;
          let certCode = null;
          if (app.attendance && app.attendance.length > 0) {
            const att = app.attendance[0];
            if (att.certificates && att.certificates.length > 0) {
              hasCert = true;
              certId = att.certificates[0].id;
              certCode = att.certificates[0].verification_code;
            }
          }
          let isPast = false;
          if (app.gigs.date_end) {
            isPast = new Date(app.gigs.date_end) < new Date();
          } else if (app.gigs.date_start) {
            // Assume end of day if end date missing
            const end = new Date(app.gigs.date_start);
            end.setHours(23, 59, 59, 999);
            isPast = end < new Date();
          }

          let currentStatus = 'upcoming';
          if (hasCert) {
            currentStatus = 'completed';
          } else if (app.status === 'accepted') {
            currentStatus = isPast ? 'past' : 'active';
          } else if (app.status === 'completed') {
            currentStatus = 'completed';
          }

          const mappedGig = {
            id: app.gigs.id,
            app_id: app.id,
            title: app.gigs.title,
            org: app.gigs.organizations?.name || 'Organization',
            org_id: app.gigs.organizations?.user_id,
            location: app.gigs.location,
            date: app.gigs.date_start ? gigDate.toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' }) : 'TBD',
            time: app.gigs.date_start ? gigDate.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' }) : '',
            status: currentStatus,
            coverImg: app.gigs.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.gigs.title)}&background=random&size=400`,
            orgImg: `https://ui-avatars.com/api/?name=${encodeURIComponent(app.gigs.organizations?.name || 'Org')}&background=random`,
            description: app.gigs.description,
            type: app.gigs.type,
            submission: app.submissions && app.submissions.length > 0 ? app.submissions[0] : null,
            certId: certId,
            certCode: certCode
          };

          if (hasCert || app.status === 'completed' || currentStatus === 'past') {
            completed.push(mappedGig);
          } else {
            // ONLY show accepted in My Gigs (pending goes to My Applications)
            if (app.status === 'accepted') {
               upcoming.push(mappedGig);
            }
          }
        });
        
        setUpcomingGigs(upcoming);
        setCompletedGigs(completed);
      }
      setLoading(false);
    };

    fetchGigs();
  }, [user]);

  if (loading) {
    return <LoadingScreen message="Loading your gigs..." fullScreen={false} />;
  }

  if (errorMsg) {
    return <div style={{ padding: '48px', textAlign: 'center', color: 'red' }}>Error loading gigs: {errorMsg}. Please ensure you have run the latest SQL migrations.</div>;
  }

  return (
    <>
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '16px', marginBottom: '20px' }}>Filter by Status</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'All Gigs', count: upcomingGigs.length + completedGigs.length },
                { label: 'Upcoming & Active', count: upcomingGigs.length },
                { label: 'Completed', count: completedGigs.length },
              ].map(f => (
                <label key={f.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', cursor: 'pointer', padding: '6px 0' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" defaultChecked={f.label === 'All Gigs'} style={{ width: '16px', height: '16px', accentColor: 'var(--purple-600)' }} />
                    {f.label}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', backgroundColor: 'var(--paper)', padding: '2px 8px', borderRadius: '99px' }}>{f.count}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '16px', marginBottom: '16px' }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/dashboard/volunteer/gigs" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '10px 16px', backgroundColor: 'var(--purple-600)', border: 'none', borderRadius: '8px', color: 'var(--white)', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                Browse New Gigs
              </Link>
              <Link to="/dashboard/volunteer/check-in" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '10px 16px', backgroundColor: 'var(--white)', border: '1.5px solid #E4E1F5', borderRadius: '8px', color: 'var(--ink)', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                Check In Now
              </Link>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-padding" style={{ textAlign: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
              <div style={{ padding: '16px 8px', backgroundColor: 'var(--paper)', borderRadius: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--display)' }}>{upcomingGigs.length + completedGigs.length}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>Total</div>
              </div>
              <div style={{ padding: '16px 8px', backgroundColor: 'var(--paper)', borderRadius: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--teal-600)', fontFamily: 'var(--display)' }}>{completedGigs.length}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>Completed</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <div className="dash-card">
          <div className="dash-card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0', padding: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0', width: '100%' }}>
              <h2 className="dash-card-title">My Gigs</h2>
              <Link to="/dashboard/volunteer/gigs" className="gig-action" style={{ textDecoration: 'none', fontSize: '13px', padding: '8px 16px' }}>
                + Find Gigs
              </Link>
            </div>
            <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #E4E1F5', padding: '0 24px', width: '100%', marginTop: '16px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
              {(['upcoming', 'completed'] as Tab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: 'none', border: 'none', padding: '10px 20px 12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                    color: activeTab === tab ? 'var(--purple-600)' : 'var(--muted)',
                    borderBottom: `2px solid ${activeTab === tab ? 'var(--purple-600)' : 'transparent'}`,
                    marginBottom: '-1px', transition: 'all 0.15s ease',
                  }}
                >
                  {tab === 'upcoming' ? `Upcoming & Active (${upcomingGigs.length})` : `Completed (${completedGigs.length})`}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'upcoming' ? (
            upcomingGigs.length > 0 ? (
              upcomingGigs.map(gig => (
                <div key={gig.id} className="gig-media-card">
                  <div className="gig-media-cover" style={{ backgroundImage: `url(${gig.coverImg})` }} />
                  <div className="gig-media-body">
                    <div className="gig-media-header">
                      <div>
                        <h3 className="gig-media-title">{gig.title}</h3>
                        <Link to={`/organization/${gig.org_id}`} className="gig-media-org" style={{ textDecoration: 'none' }}>
                          <img src={gig.orgImg} alt={gig.org} />
                          <strong>{gig.org}</strong>
                          <span style={{ color: '#D1CEDF', margin: '0 4px' }}>•</span>
                          <span style={{ color: 'var(--body)' }}>{gig.location}</span>
                        </Link>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span className="tag status" style={{ backgroundColor: statusStyles[gig.status]?.bg || '#EEE', color: statusStyles[gig.status]?.color || '#333' }}>
                          {statusStyles[gig.status]?.label || gig.status}
                        </span>
                        <div style={{ fontSize: '12px', color: 'var(--body)', marginTop: '6px' }}>{gig.date} • {gig.time}</div>
                      </div>
                    </div>
                    <p style={{ color: 'var(--body)', fontSize: '14px', margin: '0 0 16px 0', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'pre-wrap' }}>{gig.description}</p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {gig.status === 'active' && gig.type !== 'skilled' && (
                        <Link to="/dashboard/volunteer/check-in" className="gig-action" style={{ background: 'var(--purple-600)', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(124,58,237,0.25)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={16} /> Check In Now
                        </Link>
                      )}
                      {gig.status === 'active' && gig.type === 'skilled' && !gig.submission && (
                        <Link to={`/dashboard/volunteer/gigs/${gig.app_id}/submit`} className="gig-action" style={{ background: 'var(--purple-600)', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(124,58,237,0.25)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <UploadCloud size={16} /> Submit Work
                        </Link>
                      )}
                      {gig.status === 'active' && gig.submission?.status === 'pending' && (
                        <span className="gig-action" style={{ background: '#f8f9fa', color: '#6c757d', border: '1.5px solid #dee2e6', cursor: 'default', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={16} /> Review Pending
                        </span>
                      )}
                      {gig.status === 'active' && gig.submission?.status === 'rejected' && (
                        <Link to={`/dashboard/volunteer/gigs/${gig.app_id}/submit`} className="gig-action" style={{ background: '#F8D7DA', color: '#721C24', border: '1.5px solid #F5C6CB', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertCircle size={16} /> Fix & Resubmit
                        </Link>
                      )}
                      <Link to={`/dashboard/volunteer/gigs/${gig.id}`} className="gig-action" style={{ background: 'none', border: '1.5px solid #E4E1F5', color: 'var(--purple-600)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>View Details</Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '60px 24px', textAlign: 'center', backgroundColor: 'var(--white)', borderRadius: '16px', border: '1px solid #E4E1F5', margin: '24px 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--purple-50)', color: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <h3 style={{ fontSize: '24px', color: 'var(--ink)', fontFamily: 'var(--display)', marginBottom: '12px', fontWeight: 800 }}>Ready to Make an Impact?</h3>
                <p style={{ color: 'var(--body)', fontSize: '16px', maxWidth: '480px', margin: '0 auto 40px', lineHeight: 1.6 }}>You don't have any active gigs yet. Here is how your volunteering journey will unfold:</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', textAlign: 'left', maxWidth: '800px', margin: '0 auto 48px' }}>
                  <div style={{ padding: '24px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--purple-600)', marginBottom: '8px' }}>Step 1</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>Apply</div>
                    <div style={{ fontSize: '14px', color: 'var(--body)', lineHeight: 1.5 }}>Browse our gig board and apply to opportunities that match your skills.</div>
                  </div>
                  <div style={{ padding: '24px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--teal-600)', marginBottom: '8px' }}>Step 2</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>Get Accepted</div>
                    <div style={{ fontSize: '14px', color: 'var(--body)', lineHeight: 1.5 }}>Organizations will review your profile and accept your application.</div>
                  </div>
                  <div style={{ padding: '24px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#EA580C', marginBottom: '8px' }}>Step 3</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>Check-in & Submit</div>
                    <div style={{ fontSize: '14px', color: 'var(--body)', lineHeight: 1.5 }}>Check-in to physical gigs or submit your work for remote roles.</div>
                  </div>
                  <div style={{ padding: '24px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#F59E0B', marginBottom: '8px' }}>Step 4</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>Earn Certificates</div>
                    <div style={{ fontSize: '14px', color: 'var(--body)', lineHeight: 1.5 }}>Get recognized for your impact and build your volunteer resume.</div>
                  </div>
                </div>

                <Link to="/dashboard/volunteer/gigs" className="btn-primary" style={{ display: 'inline-flex', padding: '12px 32px', fontSize: '16px' }}>
                  Find Gigs Now
                </Link>
              </div>
            )
          ) : (
            completedGigs.length > 0 ? (
              completedGigs.map(gig => (
                <div key={gig.id} className="gig-media-card">
                  <div className="gig-media-cover" style={{ backgroundImage: `url(${gig.coverImg})` }} />
                  <div className="gig-media-body">
                    <div className="gig-media-header">
                      <div>
                        <h3 className="gig-media-title">{gig.title}</h3>
                        <Link to={`/organization/${gig.org_id}`} className="gig-media-org" style={{ textDecoration: 'none' }}>
                          <img src={gig.orgImg} alt={gig.org} />
                          <strong>{gig.org}</strong>
                        </Link>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span className="tag status" style={{ backgroundColor: '#D4EDDA', color: '#155724' }}>Completed</span>
                        <div style={{ fontSize: '12px', color: 'var(--body)', marginTop: '6px' }}>{gig.date}</div>
                      </div>
                    </div>
                    <p style={{ color: 'var(--body)', fontSize: '14px', margin: '0 0 16px 0', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'pre-wrap' }}>{gig.description}</p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {gig.certCode && (
                        <Link to={`/dashboard/volunteer/certificates/${gig.certCode}`} className="gig-action" style={{ background: 'var(--purple-600)', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(124,58,237,0.25)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Award size={16} /> View Certificate
                        </Link>
                      )}
                      <button onClick={() => setReviewingGig(gig)} className="gig-action" style={{ background: '#FFFBEB', color: '#B45309', border: '1.5px solid #FDE68A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <Star size={16} fill="currentColor" /> Rate Org
                      </button>
                      <Link to={`/dashboard/volunteer/gigs/${gig.id}`} className="gig-action" style={{ background: 'none', border: '1.5px solid #E4E1F5', color: 'var(--purple-600)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>View Details</Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState 
                icon={<Award size={48} color="var(--purple-500)" />}
                title="No Completed Gigs"
                description="You haven't completed any gigs yet. Once you check in and finish a gig, it will appear here along with your certificate."
                actionButton={<Link to="/dashboard/volunteer/gigs" style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: 'var(--purple-600)', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: 700, boxShadow: '0 4px 12px rgba(83,74,183,0.3)' }}>Explore Gigs</Link>}
              />
            )
          )}
        </div>
      </div>
      
      {reviewingGig && user && (
        <ReviewModal
          isOpen={!!reviewingGig}
          onClose={() => setReviewingGig(null)}
          gigId={reviewingGig.id}
          reviewerId={user.id}
          revieweeId={reviewingGig.org_id || reviewingGig.app_id} /* Need actual org user id, wait... I mapped org name, not org user_id */
          orgName={reviewingGig.org}
          onSuccess={() => setReviewingGig(null)}
        />
      )}
    </>
  );
};

export default MyGigs;
