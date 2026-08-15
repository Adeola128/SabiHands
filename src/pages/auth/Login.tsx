import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './Login.css';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Check for pending invite
      const pendingToken = localStorage.getItem('pending_team_invite_token');
      if (pendingToken) {
        navigate(`/join-team?token=${pendingToken}`);
        return;
      }

      // Check role to determine redirect
      const role = data.user?.user_metadata?.role;
      if (role === 'organization') {
        navigate('/dashboard/org');
      } else if (role === 'admin') {
        navigate('/hq');
      } else {
        navigate('/dashboard/volunteer');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setError(err.message || 'Failed to authenticate with Google');
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      
      <div className="visual">
        <div className="visual-photo">
          <img src="https://images.unsplash.com/photo-1628717341663-0007b0ee2597?auto=format&fit=crop&w=900&q=80" alt="A young volunteer at a community gig in Lagos" />
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
            <span>Ralvo</span>
          </Link>
          <div>
            <p className="visual-quote">"Show up. Get sabi. Become a Sabi Hand."</p>
            <p className="visual-sub">Welcome back. Your next opportunity is waiting.</p>
            <div className="visual-stats">
              <div><b>1.7M</b><span>grads a year</span></div>
              <div><b>191,278</b><span>NGOs, nationally</span></div>
              <div><b>South West & North Central</b><span>launch markets</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-panel">
        <div className="form-inner">
          <div className="form-top">
            <Link className="back" to="/">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg> Back to home
            </Link>
            <span className="login-hint">New to Ralvo? <Link to="/signup">Sign up</Link></span>
          </div>

          <div className="auth-eyebrow">Log in to your account</div>
          <h1>Welcome back</h1>
          <p className="form-sub">Enter your details to continue.</p>

          {error && <div className="auth-error-popup">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <div className="field-header">
                <label htmlFor="email">Email address</label>
              </div>
              <input 
                id="email" 
                name="email"
                type="email" 
                placeholder="you@email.com" 
                required 
              />
            </div>
            
            <div className="field">
              <div className="field-header">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
              </div>
              <div className="pw-wrap">
                <input 
                  id="password" 
                  name="password"
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Enter your password" 
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

            <button type="submit" disabled={loading} className="submit-btn" style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div className="auth-divider">or</div>
          <button type="button" className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
            <svg viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.9 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.5 0-14 4.3-17.7 10.7z"/>
              <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 35.1 26.9 36 24 36c-5.3 0-9.8-3-11.3-7.9l-6.6 5.1C9.9 39.6 16.4 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.9 3.1-3.3 5.7-6.3 7.1l6.6 5.4C39.3 37.4 44 31.5 44 24c0-1.3-.1-2.7-.4-3.5z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

