import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link className="brand" to="/">
              <svg viewBox="0 0 100 100">
                <path d="M60 15 A35 35 0 1 0 60 85" fill="none" stroke="#7F77DD" strokeWidth="16" strokeLinecap="round"/>
                <path d="M40 15 A35 35 0 1 1 40 85" fill="none" stroke="#1D9E75" strokeWidth="16" strokeLinecap="round"/>
              </svg>
              <span>SabiHands</span>
            </Link>
            <p>Show up. Get sabi. Become a Sabi Hand. A Lagos-first marketplace for real gigs and real proof.</p>
          </div>
          <div className="foot-col">
            <h4>Product</h4>
            <Link to="/how-it-works">How it works</Link>
            <Link to="/volunteers">For volunteers</Link>
            <Link to="/organizations">For NGOs &amp; companies</Link>
            <Link to="/membership">Pricing</Link>
            <Link to="/verify">Verify certificate</Link>
          </div>
          <div className="foot-col">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/faq">FAQ</Link>
          </div>
          <div className="foot-col">
            <h4>Legal</h4>
            <Link to="/terms">Terms of service</Link>
            <Link to="/privacy">Privacy policy</Link>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 SabiHands. Lagos, Nigeria.</span>
          <span>Real hands. Real gigs. Real proof.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
