import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PermissionDenied: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FAFAFC',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: 'var(--white)',
        borderRadius: '24px',
        padding: '48px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(38, 33, 92, 0.06)'
      }}>
        <div style={{
          width: '88px',
          height: '88px',
          borderRadius: '50%',
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 16px 0', fontFamily: 'var(--display)' }}>
          Access Denied
        </h1>
        
        <p style={{ fontSize: '16px', color: 'var(--body)', margin: '0 0 32px 0', lineHeight: 1.6 }}>
          You do not have the necessary permissions to view this page. If you believe this is an error, please contact Ralvo support.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ width: '100%', padding: '16px', backgroundColor: 'var(--ink)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', fontFamily: 'var(--sans)' }}
          >
            Go Back
          </button>
          <Link to="/" style={{ color: 'var(--body)', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PermissionDenied;

