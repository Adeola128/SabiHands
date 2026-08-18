import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css'; // Uses the same layout classes as Login

const ForgotPassword: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="screen">
      <div className="visual">
        <div className="visual-photo">
          <img src="https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=900&q=80" alt="Volunteers talking" />
        </div>
        <svg className="seam" viewBox="0 0 64 100" preserveAspectRatio="none">
          <path d="M32,0 C 8,16 54,28 32,42 C 8,56 54,68 32,82 C 14,92 40,96 30,100 L64,100 L64,0 Z" />
        </svg>
        <div className="visual-content">
          <Link to="/" className="visual-brand">
            <img src="/logo.png" alt="Ralvo Logo" style={{ height: '32px', width: 'auto' }} />
            <span>Ralvo</span>
          </Link>
          <div>
            <p className="visual-quote">"It happens to the best of us."</p>
            <p className="visual-sub">We'll get you back into your account in no time.</p>
          </div>
        </div>
      </div>

      <div className="form-panel">
        <div className="form-inner">
          <div className="form-top">
            <Link className="back" to="/login">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg> Back to login
            </Link>
          </div>

          <div className="auth-eyebrow">Account Recovery</div>
          <h1>Reset your password</h1>
          
          {!submitted ? (
            <>
              <p className="form-sub">Enter your email address and we'll send you a link to reset your password.</p>
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="field">
                  <div className="field-header">
                    <label htmlFor="email">Email address</label>
                  </div>
                  <input 
                    id="email" 
                    type="email" 
                    placeholder="you@email.com" 
                    required 
                  />
                </div>
                
                <button type="submit" className="submit-btn" style={{ marginTop: '16px' }}>
                  Send reset link
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="form-sub" style={{ color: 'var(--teal-600)' }}>Check your email! We've sent a recovery link to your inbox.</p>
              <Link to="/login" className="submit-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '32px' }}>
                Return to Login
              </Link>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

