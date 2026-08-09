import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const ResetPassword: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/login');
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
            <svg viewBox="0 0 100 100">
              <path d="M60 15 A35 35 0 1 0 60 85" fill="none" stroke="#AFA9EC" strokeWidth="16" strokeLinecap="round" />
              <path d="M40 15 A35 35 0 1 1 40 85" fill="none" stroke="#5DCAA5" strokeWidth="16" strokeLinecap="round" />
            </svg>
            <span>Gigway</span>
          </Link>
          <div>
            <p className="visual-quote">"A fresh start."</p>
            <p className="visual-sub">Create a new password and get back to making an impact.</p>
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
          <h1>Set new password</h1>
          <p className="form-sub">Choose a strong password with at least 8 characters.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <div className="field-header">
                <label htmlFor="password">New Password</label>
              </div>
              <div className="pw-wrap">
                <input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Enter your new password" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Show password"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>
            
            <button type="submit" className="submit-btn" style={{ marginTop: '16px' }}>
              Reset Password
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

