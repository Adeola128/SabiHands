import React from 'react';
import { Link } from 'react-router-dom';
import './VolunteerProfile.css';

const VolunteerProfile: React.FC = () => {
  return (
    <div className="vol-profile-container">
      
      {/* ── HERO SECTION ── */}
      <div className="vol-profile-hero">
        <div className="vol-profile-cover" />
        
        <div className="vol-profile-header-content">
          <div>
            <div className="vol-profile-avatar-wrapper">
              <div className="vol-profile-avatar">AO</div>
              <div className="vol-verified-badge" title="Verified Volunteer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            
            <div className="vol-profile-info">
              <h1 className="vol-profile-name">
                Adeola Okonkwo
              </h1>
              <div className="vol-profile-headline">
                <span>Digital Marketer & Community Builder</span>
                <span style={{ color: '#D1CEDF' }}>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Lagos, Nigeria
                </span>
              </div>
              
              <div className="vol-profile-stats-bar">
                <div className="vol-stat-item">
                  <span className="vol-stat-value">124</span>
                  <span className="vol-stat-label">Hours Volunteered</span>
                </div>
                <div className="vol-stat-item">
                  <span className="vol-stat-value">8</span>
                  <span className="vol-stat-label">Gigs Completed</span>
                </div>
                <div className="vol-stat-item">
                  <span className="vol-stat-value">5.0</span>
                  <span className="vol-stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal-500)" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Rating
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="vol-edit-btn" style={{ display: 'flex', gap: '12px' }}>
            <Link to="/dashboard/volunteer/settings" style={{ padding: '12px 24px', backgroundColor: 'var(--paper)', color: 'var(--ink)', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', border: '1px solid #E4E1F5', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Edit Profile
            </Link>
            <Link to="/login" style={{ padding: '12px 24px', backgroundColor: 'transparent', color: 'var(--pink-600)', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', border: '1px solid var(--pink-200)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--pink-50)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </Link>
          </div>
        </div>
      </div>

      <div className="vol-profile-grid">
        {/* ── LEFT COLUMN ── */}
        <div>
          {/* About */}
          <div className="vol-card">
            <h2 className="vol-card-title">About Me</h2>
            <p style={{ fontSize: '15px', color: 'var(--body)', lineHeight: 1.6, margin: 0 }}>
              Passionate community builder with over 5 years of experience in digital marketing and event management. I volunteer my time to help NGOs amplify their message and organize impactful physical events. Always eager to lend a hand and learn from diverse communities.
            </p>
          </div>

          {/* Skills */}
          <div className="vol-card">
            <h2 className="vol-card-title">Skills & Expertise</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span className="vol-skill-tag" style={{ backgroundColor: 'var(--purple-50)', color: 'var(--purple-700)', borderColor: 'var(--purple-200)' }}>Social Media Management</span>
              <span className="vol-skill-tag">Content Writing</span>
              <span className="vol-skill-tag">Event Logistics</span>
              <span className="vol-skill-tag">Photography</span>
              <span className="vol-skill-tag">Public Speaking</span>
            </div>
          </div>

          {/* Causes */}
          <div className="vol-card">
            <h2 className="vol-card-title">Causes I Care About</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <div className="vol-cause-tag">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg> Environment
              </div>
              <div className="vol-cause-tag" style={{ backgroundColor: '#FFF7ED', color: '#C2410C' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg> Education
              </div>
              <div className="vol-cause-tag" style={{ backgroundColor: 'var(--purple-50)', color: 'var(--purple-700)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> Health & Wellness
              </div>
            </div>
          </div>

          {/* Verifications */}
          <div className="vol-card">
            <h2 className="vol-card-title">Verifications</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ fontSize: '15px', color: 'var(--ink)', fontWeight: 500 }}>Email Address Verified</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ fontSize: '15px', color: 'var(--ink)', fontWeight: 500 }}>Phone Number Verified</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ fontSize: '15px', color: 'var(--ink)', fontWeight: 500 }}>Government ID Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div>
          {/* Certificates & Badges */}
          <div className="vol-card">
            <h2 className="vol-card-title">
              Certificates & Badges
              <Link to="/dashboard/volunteer/certificates" style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--purple-600)', textDecoration: 'none', fontWeight: 600 }}>View All</Link>
            </h2>
            
            <div className="vol-cert-mini">
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--teal-400), var(--purple-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Beach Cleanup & Awareness</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>Issued by Slum2School Africa</div>
              </div>
            </div>

            <div className="vol-cert-mini">
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Community Champion Badge</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>Unlocked on Aug 10, 2026</div>
              </div>
            </div>
          </div>

          {/* Gig History */}
          <div className="vol-card">
            <h2 className="vol-card-title">Recent Gigs</h2>
            
            <div className="vol-timeline-item">
              <div className="vol-timeline-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div style={{ paddingTop: '8px' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3 }}>Beach Cleanup & Awareness Drive</div>
                <div style={{ fontSize: '13px', color: 'var(--purple-600)', fontWeight: 600, marginTop: '4px' }}>Slum2School Africa</div>
                <div style={{ fontSize: '13px', color: 'var(--body)', marginTop: '8px', lineHeight: 1.5 }}>Helped organize the registration desk and coordinated volunteers during the 4-hour cleanup session.</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  August 2026 • 6 hours
                </div>
              </div>
            </div>

            <div className="vol-timeline-item">
              <div className="vol-timeline-icon" style={{ backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div style={{ paddingTop: '8px' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3 }}>Social Media Strategy for Campaign</div>
                <div style={{ fontSize: '13px', color: 'var(--purple-600)', fontWeight: 600, marginTop: '4px' }}>Tech for Good Nigeria</div>
                <div style={{ fontSize: '13px', color: 'var(--body)', marginTop: '8px', lineHeight: 1.5 }}>Created a comprehensive 2-week social media content calendar to drive awareness for their new literacy app.</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  July 2026 • 15 hours
                </div>
              </div>
            </div>

            <Link to="/dashboard/volunteer/my-gigs" style={{ display: 'inline-block', marginTop: '16px', fontSize: '14px', fontWeight: 600, color: 'var(--purple-600)', textDecoration: 'none' }}>
              View full gig history →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerProfile;
