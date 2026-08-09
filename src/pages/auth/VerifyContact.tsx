import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './Login.css';

const VerifyContact: React.FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const role = location.state?.role || 'volunteer';



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("No email found. Please sign up again.");
      return;
    }

    if (!code.trim()) {
      setError("Please enter the verification code");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type: 'signup'
      });

      if (verifyError) throw verifyError;

      // Navigate based on role
      if (role === 'org' || role === 'organization') {
        navigate('/onboarding/organization');
      } else {
        navigate('/onboarding/volunteer');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      <div className="visual">
        <div className="visual-photo">
          <img src="https://images.unsplash.com/photo-1628717341663-0007b0ee2597?auto=format&fit=crop&w=900&q=80" alt="Checking phone" />
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
            <p className="visual-quote">"Trust is everything."</p>
            <p className="visual-sub">We verify every account so you know you're dealing with real people and real organizations.</p>
          </div>
        </div>
      </div>

      <div className="form-panel">
        <div className="form-inner">
          <div className="form-top">
            <span className="login-hint">Step 1 of 2</span>
          </div>

          <div className="auth-eyebrow">Verification</div>
          <h1>Check your email</h1>
          <p className="form-sub">
            We've sent a 6-digit code to <strong>{email || 'your email'}</strong>. Enter it below to confirm your account.
          </p>
          
          {error && <div className="auth-error-popup">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <div className="field-header">
                <label>Verification Code</label>
              </div>
              <div style={{ marginTop: '4px' }}>
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter code here"
                  style={{ width: '100%', textAlign: 'center', fontSize: '24px', letterSpacing: '8px', padding: '14px 0', borderRadius: '8px', border: '1px solid #D8D5F3' }}
                  required 
                />
              </div>
            </div>
            
            <button type="submit" disabled={loading} className="submit-btn" style={{ marginTop: '24px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            <div className="foot-note" style={{ marginTop: '16px' }}>
              Didn't receive the code? <button type="button" onClick={() => navigate('/signup')} style={{ background: 'none', border: 'none', color: 'var(--purple-600)', fontWeight: 600, cursor: 'pointer' }}>Go back to Sign Up</button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default VerifyContact;

