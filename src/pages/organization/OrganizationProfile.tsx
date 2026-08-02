import React from 'react';
import { Link } from 'react-router-dom';
import './OrganizationProfile.css';

const OrganizationProfile: React.FC = () => {
  return (
    <div className="org-profile-container">
      {/* Hero Section */}
      <div className="org-hero-card">
        <div className="org-cover-image"></div>
        <div className="org-hero-content">
          <div>
            <div className="org-avatar-container">
              <img src="/images/hero_illustration.png" alt="Tech for Good" className="org-avatar" />
              <div className="org-verified-badge" title="Verified NGO">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10" stroke="white" strokeWidth="2" fill="none"></polyline></svg>
              </div>
            </div>
            
            <div className="org-hero-details">
              <h1 className="org-name">Tech for Good Nigeria</h1>
              <p className="org-headline">Empowering local communities through technology education and digital literacy.</p>
              <div className="org-meta">
                <span className="org-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  Lagos, Nigeria
                </span>
                <span className="org-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  Education NGO
                </span>
                <span className="org-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  15k+ Followers
                </span>
              </div>
            </div>
          </div>
          
          <div className="org-hero-actions">
            <button className="org-btn org-btn-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
              Follow
            </button>
            <Link to="/dashboard/messages" className="org-btn org-btn-primary" style={{ textDecoration: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Message
            </Link>
          </div>
        </div>
      </div>

      {/* Horizontal Stacked Content */}
      <div className="org-horizontal-section" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* About & Contact (Split Row) */}
        <div className="org-about-contact-split">
          
          <div className="dash-card">
            <div className="dash-card-padding">
              <h2 className="org-section-title" style={{ fontSize: '16px' }}>About Us</h2>
              <p className="org-about-text">
                Tech for Good Nigeria is a non-profit organization dedicated to bridging the digital divide in West Africa. 
                We believe that access to technology and digital literacy is a fundamental right in the 21st century. 
                Our programs focus on equipping youth in underserved communities with practical coding skills, design thinking, 
                and hardware repair knowledge.
              </p>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-padding">
              <h2 className="org-section-title" style={{ fontSize: '16px', marginBottom: '24px' }}>Contact Info</h2>
              
              <div className="info-row">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                <div className="info-content">
                  <span className="info-label">Website</span>
                  <span className="info-value"><a href="#">techforgood.ng</a></span>
                </div>
              </div>

              <div className="info-row">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <div className="info-content">
                  <span className="info-label">Email</span>
                  <span className="info-value">hello@techforgood.ng</span>
                </div>
              </div>

              <div className="info-row">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                <div className="info-content">
                  <span className="info-label">Phone</span>
                  <span className="info-value">+234 800 123 4567</span>
                </div>
              </div>

              <div className="info-row">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <div className="info-content">
                  <span className="info-label">Headquarters</span>
                  <span className="info-value">14 Innovation Drive<br/>Yaba, Lagos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Impact Section */}
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="org-section-title">Our Impact</h2>
            <div className="org-impact-showcase">
              <div className="impact-stat">
                <div className="impact-number">12k+</div>
                <div className="impact-label">Students Reached</div>
              </div>
              <div className="impact-stat">
                <div className="impact-number">85</div>
                <div className="impact-label">Active Volunteers</div>
              </div>
              <div className="impact-stat">
                <div className="impact-number">150+</div>
                <div className="impact-label">Gigs Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Jobs/Gigs Section */}
        <div className="dash-card" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 className="org-section-title" style={{ margin: 0 }}>Available Roles (2)</h2>
          </div>
          
          <div className="org-gigs-grid">
            
            <Link to="/dashboard/volunteer/apply" className="gig-media-card-horizontal">
              <div className="gig-media-cover-horizontal" style={{ backgroundImage: 'url(/images/hero_illustration.png)' }}></div>
              <div className="gig-media-body-horizontal">
                <h3 className="gig-media-title">React Developer (Volunteer)</h3>
                <div className="gig-tags" style={{ marginTop: '8px', marginBottom: '16px' }}>
                  <span className="tag skilled">Skilled</span>
                  <span className="tag category">Software Dev</span>
                  <span className="tag physical">Remote</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E4E1F5', paddingTop: '16px', marginTop: 'auto' }}>
                  <span style={{ fontSize: '13px', color: 'var(--body)' }}>Posted 2 days ago</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--purple-600)' }}>Apply &rarr;</span>
                </div>
              </div>
            </Link>

            <Link to="/dashboard/volunteer/apply" className="gig-media-card-horizontal">
              <div className="gig-media-cover-horizontal" style={{ backgroundImage: 'url(/images/diverse_gigs.png)' }}></div>
              <div className="gig-media-body-horizontal">
                <h3 className="gig-media-title">UX/UI Designer for Mobile App</h3>
                <div className="gig-tags" style={{ marginTop: '8px', marginBottom: '16px' }}>
                  <span className="tag skilled">Skilled</span>
                  <span className="tag category">Design</span>
                  <span className="tag physical">Remote</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E4E1F5', paddingTop: '16px', marginTop: 'auto' }}>
                  <span style={{ fontSize: '13px', color: 'var(--body)' }}>Posted 1 week ago</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--purple-600)' }}>Apply &rarr;</span>
                </div>
              </div>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
};

export default OrganizationProfile;
