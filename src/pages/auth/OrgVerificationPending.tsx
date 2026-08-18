import React from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const OrgVerificationPending: React.FC = () => {
  return (
    <div className="screen" style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--paper)' }}>
      <div style={{ maxWidth: '480px', width: '100%', padding: '48px', backgroundColor: 'var(--white)', borderRadius: '24px', boxShadow: '0 16px 40px -16px rgba(38,33,92,0.15)', textAlign: 'center' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--teal-600)', fontWeight: 700, fontFamily: 'var(--display)', fontSize: '24px', marginBottom: '32px' }}>
          <img src="/logo.png" alt="Ralvo Logo" style={{ height: '32px', width: 'auto' }} />
          Ralvo
        </Link>
        
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '40px', height: '40px' }}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        <h1 style={{ fontFamily: 'var(--display)', fontSize: '28px', color: 'var(--ink)', marginBottom: '16px' }}>Verification Pending</h1>
        <p style={{ fontSize: '15px', color: 'var(--body)', lineHeight: 1.6, marginBottom: '32px' }}>
          We've received your organization profile! Our team is currently reviewing your details. This process usually takes 24-48 hours. We'll send an email as soon as you're approved to start posting gigs.
        </p>

        <Link to="/login" className="submit-btn" style={{ textDecoration: 'none', display: 'block', backgroundColor: 'var(--teal-600)' }}>
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default OrgVerificationPending;

