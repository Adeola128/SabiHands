import React, { useState } from 'react';
import { Link } from 'react-router-dom';

type Filter = 'pending' | 'accepted' | 'declined';

const applicants = [
  { id: 'v1', name: 'Kemi Adeyemi', avatar: 'KA', skills: ['Writing', 'SEO', 'Copyediting'], bio: 'Freelance content writer with 3 years of NGO communications experience. I have previously worked with HealthFirst and Lagos Green Initiative.', status: 'pending' as const, time: '2 days ago', rating: 4.8, gigsCompleted: 12 },
  { id: 'v2', name: 'Emeka Nwosu', avatar: 'EN', skills: ['React', 'Node.js', 'TypeScript'], bio: 'Full-stack developer passionate about tech for social good. Looking to contribute my skills to impactful projects.', status: 'pending' as const, time: '3 days ago', rating: 5.0, gigsCompleted: 3 },
  { id: 'v3', name: 'Amaka Obi', avatar: 'AO', skills: ['Instagram', 'Canva', 'Content'], bio: 'Digital marketer with experience running social campaigns for nonprofits. Active volunteer in the Yaba community.', status: 'accepted' as const, time: '4 days ago', rating: 4.5, gigsCompleted: 7 },
  { id: 'v4', name: 'Chinedu Eze', avatar: 'CE', skills: ['Data Entry', 'Research'], bio: 'Student at UNILAG, eager to learn and help out wherever needed. Fast typist.', status: 'declined' as const, time: '1 week ago', rating: 4.0, gigsCompleted: 1 },
];

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  accepted: { bg: '#D4EDDA', color: '#155724', label: 'Accepted' },
  pending:  { bg: 'var(--paper)', color: 'var(--body)', label: 'Pending' },
  declined: { bg: '#fef2f2', color: '#dc2626', label: 'Declined' },
};

const ReviewApplicants: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<Filter>('pending');
  
  const filtered = applicants.filter(a => a.status === activeFilter);
  
  const counts = {
    pending: applicants.filter(a => a.status === 'pending').length,
    accepted: applicants.filter(a => a.status === 'accepted').length,
    declined: applicants.filter(a => a.status === 'declined').length,
  };

  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className="context-col">
        {/* Gig summary */}
        <div className="dash-card">
          <div className="dash-card-padding">
            <span className="tag status" style={{ backgroundColor: '#D4EDDA', color: '#155724', marginBottom: '14px', display: 'inline-block' }}>Active</span>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--display)', marginBottom: '4px' }}>Content Writer for Newsletter</h2>
            <p style={{ fontSize: '13px', color: 'var(--body)', marginBottom: '20px' }}>Slum2School Africa</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Spots Filled', value: `${counts.accepted} / 5` },
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

        <Link to="/dashboard/org/gigs/1" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 0' }}>
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
            filtered.map(a => (
              <div key={a.id} className="gig-media-card" style={{ alignItems: 'flex-start' }}>
                <div style={{ width: '64px', minWidth: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '20px', paddingTop: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--purple-600)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', fontFamily: 'var(--display)' }}>{a.avatar}</div>
                </div>
                <div className="gig-media-body" style={{ padding: '20px 20px 16px 16px' }}>
                  <div className="gig-media-header" style={{ marginBottom: '10px' }}>
                    <div>
                      <h3 className="gig-media-title" style={{ fontSize: '16px', marginBottom: '4px' }}>
                        <Link to={`/dashboard/org/volunteers/${a.id}`} style={{ color: 'var(--ink)', textDecoration: 'none' }}>{a.name}</Link>
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--body)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          {a.rating}
                        </span>
                        <span>•</span>
                        <span>{a.gigsCompleted} gigs completed</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>{a.time}</span>
                      <span className="tag status" style={{ backgroundColor: statusStyle[a.status].bg, color: statusStyle[a.status].color }}>{statusStyle[a.status].label}</span>
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '14px', color: 'var(--body)', lineHeight: 1.6, marginBottom: '12px' }}>{a.bio}</p>
                  
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {a.skills.map(sk => <span key={sk} className="tag skilled">{sk}</span>)}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px dashed #E4E1F5' }}>
                    {a.status === 'pending' && (
                      <>
                        <button className="gig-action" style={{ backgroundColor: 'var(--teal-600)', color: 'white', border: 'none', padding: '8px 20px', fontSize: '13px' }}>Accept Applicant</button>
                        <button className="gig-action" style={{ background: 'none', border: '1.5px solid #E4E1F5', color: 'var(--body)', padding: '8px 20px', fontSize: '13px' }}>Decline</button>
                      </>
                    )}
                    {a.status === 'accepted' && (
                      <button className="gig-action" style={{ background: 'none', border: '1.5px solid #E4E1F5', color: 'var(--body)', padding: '8px 20px', fontSize: '13px' }}>Message Volunteer</button>
                    )}
                    <Link to={`/dashboard/org/volunteers/${a.id}`} className="gig-action" style={{ background: 'none', border: 'none', color: 'var(--purple-600)', padding: '8px 12px', fontSize: '13px' }}>View Full Profile →</Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ReviewApplicants;
