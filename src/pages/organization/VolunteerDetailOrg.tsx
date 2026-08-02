import React from 'react';
import { Link } from 'react-router-dom';

const VolunteerDetailOrg: React.FC = () => {
  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '15px', marginBottom: '16px' }}>Volunteer Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button style={{ width: '100%', padding: '10px 16px', backgroundColor: 'var(--purple-600)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Message Volunteer
              </button>
              <button style={{ width: '100%', padding: '10px 16px', backgroundColor: 'var(--paper)', color: 'var(--ink)', border: '1.5px solid #E4E1F5', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Invite to Gig
              </button>
            </div>
          </div>
        </div>

        <Link to="/dashboard/org/gigs/1/applicants" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 0' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Applicants
        </Link>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        <div className="dash-card" style={{ marginBottom: '24px', position: 'relative' }}>
          <div style={{ height: '140px', backgroundColor: 'var(--purple-900)', borderRadius: '16px 16px 0 0', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>
          
          <div style={{ padding: '0 24px 24px', position: 'relative' }}>
            {/* Avatar */}
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--purple-600)', color: 'white', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 700, fontFamily: 'var(--display)', marginTop: '-50px', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              KA
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--display)', margin: '0 0 4px' }}>Kemi Adeyemi</h1>
                <p style={{ fontSize: '15px', color: 'var(--body)', margin: '0 0 12px' }}>Content Writer & Digital Marketer</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    Lagos, Nigeria
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    4.8 (12 gigs)
                  </span>
                </div>
              </div>

              {/* Verified badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'var(--teal-50)', color: 'var(--teal-700)', borderRadius: '99px', fontSize: '13px', fontWeight: 600 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Identity Verified
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #E4E1F5' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '12px' }}>About</h3>
              <p style={{ fontSize: '14px', color: 'var(--body)', lineHeight: 1.6, margin: 0 }}>
                Freelance content writer with 3 years of NGO communications experience. I have previously worked with HealthFirst and Lagos Green Initiative to help them structure their monthly newsletters and social media copy. I'm passionate about education and health causes.
              </p>
            </div>

            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '12px' }}>Skills</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Writing', 'SEO', 'Copyediting', 'Social Media', 'Canva'].map(sk => (
                  <span key={sk} className="tag skilled">{sk}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Track Record */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">SabiHands Track Record</h2>
          </div>
          
          <div style={{ padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px 0', borderBottom: '1px solid #E4E1F5' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 4px' }}>Medical Outreach Support</h4>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>HealthFirst Initiative • Completed 2 months ago</div>
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#F59E0B' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span style={{ color: 'var(--ink)', marginLeft: '4px', fontWeight: 500 }}>"Excellent communication and very prompt."</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px 0' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 4px' }}>Beach Cleanup Drive</h4>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Lagos Green Initiative • Completed 4 months ago</div>
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#F59E0B' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span style={{ color: 'var(--ink)', marginLeft: '4px', fontWeight: 500 }}>"Very dedicated volunteer."</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VolunteerDetailOrg;
