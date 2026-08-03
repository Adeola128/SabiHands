import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
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
  const [activeFilter, setActiveFilter] = useState<Filter>('pending');
  const [gig, setGig] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      const { data: gigData } = await supabase
        .from('gigs')
        .select('*, organizations(name)')
        .eq('id', id)
        .single();
        
      if (gigData) setGig(gigData);

      const { data: appsData } = await supabase
        .from('applications')
        .select('*, volunteer_profiles(full_name, interests)')
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
        .update({ status: newStatus, decided_at: new Date().toISOString() })
        .eq('id', appId);
        
      if (error) throw error;
      
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      toast.success(`Applicant ${newStatus}!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
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
                    <div className="gig-media-header" style={{ marginBottom: '10px' }}>
                      <div>
                        <h3 className="gig-media-title" style={{ fontSize: '16px', marginBottom: '4px' }}>
                          <Link to={`/dashboard/org/volunteers/${a.volunteer_id}`} style={{ color: 'var(--ink)', textDecoration: 'none' }}>{name}</Link>
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--body)' }}>
                          <span>Applied on {new Date(a.applied_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span className="tag status" style={{ backgroundColor: statusStyle[a.status]?.bg || '#eee', color: statusStyle[a.status]?.color || '#333' }}>{statusStyle[a.status]?.label || a.status}</span>
                      </div>
                    </div>
                    
                    {a.pitch ? (
                      <div style={{ padding: '16px', backgroundColor: '#FAFAFC', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E4E1F5' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Their Pitch</h4>
                        <p style={{ fontSize: '14px', color: 'var(--ink)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>{a.pitch}</p>
                      </div>
                    ) : (
                      <p style={{ fontSize: '14px', color: 'var(--muted)', fontStyle: 'italic', marginBottom: '16px' }}>No pitch provided.</p>
                    )}

                    {(a.cv_url || a.linkedin_url || a.portfolio_url) && (
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {a.cv_url && (
                          <a href={a.cv_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--purple-600)', backgroundColor: 'var(--purple-50)', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            View Resume/CV
                          </a>
                        )}
                        {a.linkedin_url && (
                          <a href={a.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#0A66C2', backgroundColor: '#F0F6FC', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none' }}>
                            LinkedIn
                          </a>
                        )}
                        {a.portfolio_url && (
                          <a href={a.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--teal-700)', backgroundColor: 'var(--teal-50)', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none' }}>
                            Portfolio
                          </a>
                        )}
                      </div>
                    )}
                    
                    {profile.interests && profile.interests.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        {profile.interests.map((sk: string) => <span key={sk} className="tag skilled">{sk}</span>)}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px dashed #E4E1F5' }}>
                      {a.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatusUpdate(a.id, 'accepted')} className="gig-action" style={{ backgroundColor: 'var(--teal-600)', color: 'white', border: 'none', padding: '8px 20px', fontSize: '13px', cursor: 'pointer' }}>Accept Applicant</button>
                          <button onClick={() => handleStatusUpdate(a.id, 'declined')} className="gig-action" style={{ background: 'none', border: '1.5px solid #E4E1F5', color: 'var(--body)', padding: '8px 20px', fontSize: '13px', cursor: 'pointer' }}>Decline</button>
                        </>
                      )}
                      {a.status === 'accepted' && (
                        <button className="gig-action" style={{ background: 'none', border: '1.5px solid #E4E1F5', color: 'var(--body)', padding: '8px 20px', fontSize: '13px', cursor: 'pointer' }}>Message Volunteer</button>
                      )}
                      <Link to={`/dashboard/org/volunteers/${a.volunteer_id}`} className="gig-action" style={{ background: 'none', border: 'none', color: 'var(--purple-600)', padding: '8px 12px', fontSize: '13px', marginLeft: 'auto', textDecoration: 'none', fontWeight: 600 }}>View Full Profile →</Link>
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
