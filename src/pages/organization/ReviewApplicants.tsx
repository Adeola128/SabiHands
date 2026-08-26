import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import LoadingScreen from '../../components/LoadingScreen';

type Filter = 'pending' | 'accepted' | 'declined';

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  accepted: { bg: '#D4EDDA', color: '#155724', label: 'Accepted' },
  pending:  { bg: 'var(--paper)', color: 'var(--body)', label: 'Pending' },
  declined: { bg: '#fef2f2', color: '#dc2626', label: 'Declined' },
};

const ReviewApplicants: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<Filter>('pending');
  const [gig, setGig] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMessaging, setIsMessaging] = useState<string | null>(null);
  const [gigQuestions, setGigQuestions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      const { data: gigData } = await supabase
        .from('gigs')
        .select('*, organizations(name)')
        .eq('id', id)
        .single();
        
      if (gigData) setGig(gigData);

      const { data: questionsData } = await supabase
        .from('gig_questions')
        .select('*')
        .eq('gig_id', id);
        
      if (questionsData) setGigQuestions(questionsData);

      const { data: appsData } = await supabase
        .from('applications')
        .select('*, volunteer_profiles(full_name, interests), application_answers(question_id, answer_text)')
        .eq('gig_id', id)
        .order('applied_at', { ascending: false });

      if (appsData) {
        setApplicants(appsData);
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleStatusUpdate = async (appId: string, newStatus: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', appId);
        
      if (error) throw error;
      
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      toast.success(`Applicant ${newStatus}!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleMessageVolunteer = async (volunteerId: string) => {
    if (!user) return;
    setIsMessaging(volunteerId);
    try {
      // Check if conversation already exists for this gig
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('gig_id', id)
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${volunteerId}),and(user1_id.eq.${volunteerId},user2_id.eq.${user.id})`)
        .limit(1);

      if (existing && existing.length > 0) {
        navigate('/dashboard/messages');
      } else {
        // Create new conversation
        const { error } = await supabase
          .from('conversations')
          .insert({
            user1_id: user.id,
            user2_id: volunteerId,
            gig_id: id
          });
        
        if (error) throw error;
        navigate('/dashboard/messages');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Rate limit')) {
        toast.error("You have reached your daily limit for new conversations.");
      } else {
        toast.error("Failed to start conversation.");
      }
    } finally {
      setIsMessaging(null);
    }
  };
  
  const filtered = applicants.filter(a => a.status === activeFilter);
  
  const counts = {
    pending: applicants.filter(a => a.status === 'pending').length,
    accepted: applicants.filter(a => a.status === 'accepted').length,
    declined: applicants.filter(a => a.status === 'declined').length,
  };

  if (loading) return <LoadingScreen message="Loading applicants..." fullScreen={false} />;

  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className="context-col">
        {/* Gig summary */}
        <div className="dash-card">
          <div className="dash-card-padding">
            <span className="tag status" style={{ backgroundColor: '#D4EDDA', color: '#155724', marginBottom: '14px', display: 'inline-block' }}>Active</span>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--display)', marginBottom: '4px' }}>{gig?.title || 'Gig Details'}</h2>
            <p style={{ fontSize: '13px', color: 'var(--body)', marginBottom: '20px' }}>{gig?.organizations?.name}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Total Applicants', value: `${applicants.length}` },
                { label: 'Accepted', value: `${counts.accepted}` },
                { label: 'Pending Review', value: `${counts.pending}` },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{r.label}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '15px', marginBottom: '16px' }}>Filter Applicants</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(['pending', 'accepted', 'declined'] as Filter[]).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveFilter(t)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '9px 12px', borderRadius: '8px', border: 'none',
                    backgroundColor: activeFilter === t ? 'var(--purple-50)' : 'transparent',
                    color: activeFilter === t ? 'var(--purple-600)' : 'var(--body)',
                    fontWeight: activeFilter === t ? 700 : 500, fontSize: '14px', cursor: 'pointer',
                    transition: 'all 0.15s ease', textTransform: 'capitalize',
                  }}
                >
                  <span>{t} Review</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, backgroundColor: activeFilter === t ? 'var(--purple-200)' : 'var(--paper)', color: activeFilter === t ? 'var(--purple-900)' : 'var(--muted)', padding: '2px 8px', borderRadius: '99px' }}>
                    {counts[t]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <Link to={`/dashboard/org/gigs/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 0' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Gig Details
        </Link>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Review Applicants</h2>
            <span style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 500 }}>{filtered.length} {activeFilter}</span>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>No {activeFilter} applicants</div>
            </div>
          ) : (
            filtered.map(a => {
              const profile = a.volunteer_profiles || {};
              const name = profile.full_name || 'Unknown Volunteer';
              const avatarInitials = name.substring(0, 2).toUpperCase();
              
              return (
                <div key={a.id} className="gig-media-card" style={{ alignItems: 'flex-start' }}>
                  <div style={{ width: '64px', minWidth: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '20px', paddingTop: '20px' }}>
                    {profile.avatar_url ? (
                       <img src={profile.avatar_url} alt={name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                       <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--purple-600)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', fontFamily: 'var(--display)' }}>{avatarInitials}</div>
                    )}
                  </div>
                  <div className="gig-media-body" style={{ padding: '20px 20px 16px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <h3 className="gig-media-title" style={{ fontSize: '18px', marginBottom: '4px' }}>
                          <Link to={`/dashboard/org/volunteers/${a.volunteer_id}`} style={{ color: 'var(--ink)', textDecoration: 'none' }}>{name}</Link>
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--body)' }}>
                          <span>Applied {new Date(a.applied_at).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" })}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="tag status" style={{ backgroundColor: statusStyle[a.status]?.bg || '#eee', color: statusStyle[a.status]?.color || '#333', fontSize: '13px', padding: '6px 12px' }}>{statusStyle[a.status]?.label || a.status}</span>
                        <Link to={`/dashboard/org/volunteers/${a.volunteer_id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: 'var(--purple-50)', color: 'var(--purple-700)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', border: '1px solid var(--purple-200)', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--purple-100)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--purple-50)'}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                          Open Profile
                        </Link>
                      </div>
                    </div>
                    
                    <div style={{ border: '1px solid #E4E1F5', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                      <div style={{ backgroundColor: '#FAFAFC', padding: '12px 16px', borderBottom: '1px solid #E4E1F5', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Candidate Evidence
                      </div>
                      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {a.pitch && (
                          <div>
                            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>Cover Letter / Pitch</h4>
                            <p style={{ fontSize: '14px', color: 'var(--body)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>{a.pitch}</p>
                          </div>
                        )}

                        {a.application_answers && a.application_answers.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: a.pitch ? '16px' : '0', borderTop: a.pitch ? '1px dashed #E4E1F5' : 'none' }}>
                            {a.application_answers.map((ans: any) => {
                              const q = gigQuestions.find(q => q.id === ans.question_id);
                              if (!q) return null;
                              return (
                                <div key={ans.question_id}>
                                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>{q.question_text}</h4>
                                  <p style={{ fontSize: '14px', color: 'var(--body)', margin: 0 }}>{ans.answer_text || <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No answer</span>}</p>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {(a.cv_url || a.resume_url || a.linkedin_url || a.portfolio_url) && (
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: (a.pitch || (a.application_answers && a.application_answers.length > 0)) ? '16px' : '0', borderTop: (a.pitch || (a.application_answers && a.application_answers.length > 0)) ? '1px dashed #E4E1F5' : 'none' }}>
                            {(a.cv_url || a.resume_url) && (
                              <a href={a.cv_url || a.resume_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--purple-700)', backgroundColor: 'var(--purple-50)', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', border: '1px solid var(--purple-200)' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                Resume/CV
                              </a>
                            )}
                            {a.linkedin_url && (
                              <a href={a.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#0A66C2', backgroundColor: '#F0F6FC', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', border: '1px solid #D5E4F2' }}>
                                LinkedIn
                              </a>
                            )}
                            {a.portfolio_url && (
                              <a href={a.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--teal-800)', backgroundColor: 'var(--teal-50)', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', border: '1px solid var(--teal-200)' }}>
                                Portfolio
                              </a>
                            )}
                          </div>
                        )}
                        {!a.pitch && !(a.application_answers && a.application_answers.length > 0) && !(a.cv_url || a.resume_url || a.linkedin_url || a.portfolio_url) && (
                          <div style={{ fontSize: '13px', color: 'var(--muted)', fontStyle: 'italic' }}>No additional evidence provided.</div>
                        )}
                      </div>
                    </div>
                    
                    {profile.interests && profile.interests.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        {profile.interests.map((sk: string) => <span key={sk} className="tag skilled">{sk}</span>)}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px dashed #E4E1F5' }}>
                      {a.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatusUpdate(a.id, 'accepted')} style={{ backgroundColor: 'var(--teal-600)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--teal-700)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--teal-600)'}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            Accept Applicant
                          </button>
                          <button onClick={() => handleStatusUpdate(a.id, 'declined')} style={{ background: 'var(--white)', border: '1.5px solid #E4E1F5', color: 'var(--ink)', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#FAFAFC'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--white)'}>Decline</button>
                        </>
                      )}
                      {a.status === 'accepted' && (
                        <button 
                          onClick={() => handleMessageVolunteer(a.volunteer_id)}
                          disabled={isMessaging === a.volunteer_id}
                          style={{ background: 'var(--purple-600)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: isMessaging === a.volunteer_id ? 0.7 : 1, transition: 'all 0.2s' }} onMouseOver={e => { if (isMessaging !== a.volunteer_id) e.currentTarget.style.backgroundColor = 'var(--purple-700)' }} onMouseOut={e => { if (isMessaging !== a.volunteer_id) e.currentTarget.style.backgroundColor = 'var(--purple-600)' }}
                        >
                          {isMessaging === a.volunteer_id ? 'Starting...' : 'Message Volunteer'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default ReviewApplicants;
