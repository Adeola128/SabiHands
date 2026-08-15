import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/LoadingScreen';
import ShareGigButton from '../../components/ShareGigButton';

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  accepted: { bg: '#D4EDDA', color: '#155724', label: 'Accepted' },
  pending:  { bg: 'var(--paper)', color: 'var(--body)', label: 'Pending' },
  declined: { bg: '#fef2f2', color: '#dc2626', label: 'Declined' },
};

const OrgGigDetail: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [gig, setGig] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleCloseGig = async () => {
    if (!window.confirm("Are you sure you want to close this gig? It will no longer accept applications.")) return;
    setLoading(true);
    const { error } = await supabase
      .from('gigs')
      .update({ status: 'closed' })
      .eq('id', gig.id);
      
    if (error) {
      console.error(error);
      alert("Failed to close gig.");
    } else {
      setGig({ ...gig, status: 'closed' });
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchGigDetails = async () => {
      if (!id || !user) return;

      const { data: gigData } = await supabase
        .from('gigs')
        .select(`
          *,
          organizations (name)
        `)
        .eq('id', id)
        .single();
        
      if (gigData) setGig(gigData);

      const { data: appsData } = await supabase
        .from('applications')
        .select(`
          *,
          volunteer_profiles(full_name, bio, interests)
        `)
        .eq('gig_id', id);

      if (appsData) setApplicants(appsData);
      
      setLoading(false);
    };

    fetchGigDetails();
  }, [id, user]);

  if (loading) return <LoadingScreen message="Loading gig details..." fullScreen={true} />;
  if (!gig) return <div style={{ padding: '48px', textAlign: 'center' }}>Gig not found.</div>;

  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <span className="tag status" style={{ backgroundColor: gig.status === 'published' ? '#D4EDDA' : '#E4E1F5', color: gig.status === 'published' ? '#155724' : 'var(--body)', marginBottom: '14px', display: 'inline-block', textTransform: 'capitalize' }}>{gig.status}</span>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--display)', marginBottom: '4px' }}>{gig.title}</h2>
            <p style={{ fontSize: '13px', color: 'var(--body)', marginBottom: '20px' }}>{gig.organizations?.name}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Applicants', value: `${applicants.length}` },
                { label: 'Spots', value: gig.type === 'skilled' ? '1 filled' : 'Unlimited' },
                { label: 'Date', value: gig.date_start ? new Date(gig.date_start).toLocaleDateString() : 'TBD' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{r.label}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-padding" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to={`/dashboard/org/gigs/${gig.id}/applicants`} className="gig-action" style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}>Review Applicants</Link>
            
            {applicants.some(a => a.status === 'accepted') && (
              gig.type === 'skilled' ? (
                <Link to={`/dashboard/org/gigs/${gig.id}/submissions`} className="gig-action" style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--teal-600)', color: 'white', border: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  Review Submissions
                </Link>
              ) : (
                <Link to={`/dashboard/org/gigs/${gig.id}/attendance`} className="gig-action" style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--teal-600)', color: 'white', border: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Mark Attendance
                </Link>
              )
            )}

            <Link to={`/dashboard/org/gigs/${gig.id}/edit`} className="gig-action" style={{ textDecoration: 'none', textAlign: 'center', display: 'block', background: 'none', border: '1.5px solid #E4E1F5', color: 'var(--body)' }}>Edit Gig</Link>
            
            <div style={{ marginTop: '4px' }}>
              <ShareGigButton gigId={gig.id} title={gig.title} buttonText="Share Public Link" />
            </div>

            {gig.status !== 'closed' && gig.status !== 'completed' && (
              <button onClick={handleCloseGig} className="gig-action" style={{ background: 'none', border: '1.5px solid #fecaca', color: '#dc2626', width: '100%', marginTop: '4px', cursor: 'pointer' }}>Close Gig</button>
            )}
          </div>
        </div>

        <Link to="/dashboard/org/gigs" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 0' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Manage Gigs
        </Link>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        {/* Cover hero */}
        <div className="dash-card" style={{ marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{ height: '220px', backgroundImage: `url(${gig.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=random&size=800`})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(15,12,41,0.7) 100%)' }} />
            <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <span className={`tag ${gig.type === 'skilled' ? 'skilled' : 'physical'}`}>{gig.type === 'skilled' ? 'Skilled' : 'Physical'}</span>
              </div>
              <h1 style={{ fontSize: '26px', fontFamily: 'var(--display)', color: '#ffffff', margin: 0, lineHeight: 1.2 }}>{gig.title}</h1>
            </div>
          </div>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #E4E1F5', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, text: gig.date_start ? new Date(gig.date_start).toLocaleDateString() : 'TBD' },
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, text: gig.location || 'Remote' },
            ].map((m, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--body)', fontWeight: 500 }}>{m.icon}{m.text}</span>
            ))}
          </div>
        </div>

        {/* Gig body */}
        <div className="dash-card" style={{ marginBottom: '24px' }}>
          <div className="dash-card-padding">
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginBottom: '14px' }}>About this Gig</h2>
            <p style={{ fontSize: '15px', color: 'var(--body)', lineHeight: 1.7, marginBottom: '16px' }}>{gig.description}</p>
          </div>
        </div>

        {/* Accepted applicants */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Applicants</h2>
            <Link to={`/dashboard/org/gigs/${gig.id}/applicants`} className="gig-action" style={{ textDecoration: 'none', fontSize: '13px', padding: '8px 16px' }}>Review All</Link>
          </div>
          {applicants.length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--purple-50)', color: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>No Applicants Yet</h3>
              <p style={{ fontSize: '14px', color: 'var(--body)', marginBottom: '24px' }}>Share your gig to reach more volunteers and get your first applicant.</p>
              <div style={{ display: 'inline-block' }}>
                <ShareGigButton gigId={gig.id} title={gig.title} buttonText="Share Gig" />
              </div>
            </div>
          ) : applicants.map((a) => {
            const name = a.volunteer_profiles?.full_name || 'Volunteer';
            const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
            return (
              <div key={a.id} className="gig-media-card" style={{ alignItems: 'center' }}>
                <div style={{ width: '48px', minWidth: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '20px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--purple-600)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', fontFamily: 'var(--display)' }}>{initials}</div>
                </div>
                <div className="gig-media-body" style={{ padding: '14px 16px' }}>
                  <div className="gig-media-header" style={{ marginBottom: '6px' }}>
                    <div>
                      <h3 className="gig-media-title" style={{ fontSize: '15px', marginBottom: '2px' }}>{name}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--body)', margin: 0 }}>{a.volunteer_profiles?.bio || 'No bio provided.'}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span className="tag status" style={{ backgroundColor: statusStyle[a.status]?.bg || '#E4E1F5', color: statusStyle[a.status]?.color || 'var(--body)', textTransform: 'capitalize' }}>{a.status}</span>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{new Date(a.applied_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {a.volunteer_profiles?.interests?.map((sk: string) => <span key={sk} className="tag skilled">{sk}</span>)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  );
};

export default OrgGigDetail;
