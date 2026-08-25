import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer-calm">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand-col">
            <Link className="brand" to="/">
              <img src="/logo.png" alt="Ralvo Logo" style={{ height: '32px', width: 'auto' }} />
              <span style={{ color: 'var(--purple-900)' }}>Ralvo</span>
            </Link>
            <p className="footer-tagline">A Lagos-first marketplace for real gigs and real proof.</p>
          </div>
          <div className="footer-nav">
            <h4 style={{ color: 'var(--purple-900)', fontSize: '14px', marginBottom: '12px' }}>Platform</h4>
            <Link to="/volunteers">For volunteers</Link>
            <Link to="/organizations">For NGOs &amp; companies</Link>
            <Link to="/verify">Verify certificate</Link>
          </div>
          
          <div className="footer-nav">
            <h4 style={{ color: 'var(--purple-900)', fontSize: '14px', marginBottom: '12px' }}>Opportunities</h4>
            <Link to="/volunteer-opportunities/nigeria">Volunteer in Nigeria</Link>
            <Link to="/volunteer-opportunities/remote">Remote Volunteering</Link>
            <Link to="/nysc-volunteer-opportunities">NYSC / Graduate</Link>
            <Link to="/volunteer-opportunities/ngo/nigeria">NGO Roles</Link>
          </div>

          <div className="footer-nav">
            <h4 style={{ color: 'var(--purple-900)', fontSize: '14px', marginBottom: '12px' }}>Resources</h4>
            <Link to="/guides">Practical Guides</Link>
            <Link to="/guides/volunteer-in-nigeria-with-no-experience">Volunteer with no experience</Link>
            <Link to="/guides/verify-ngo">How to verify NGOs</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-trust">
            <span className="trust-badge">Verified by Lagos NGOs</span>
            <span className="trust-badge">100% Free for Volunteers</span>
          </div>
          
          <div className="footer-legal">
            <span>© 2026 Ralvo.</span>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
