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

            <Link to="/volunteers">For volunteers</Link>
            <Link to="/organizations">For NGOs &amp; companies</Link>
            <Link to="/verify">Verify certificate</Link>
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
