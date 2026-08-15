import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AdminLogin: React.FC = () => {
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

      const role = data.user?.user_metadata?.role;
      if (role === 'admin') {
        navigate('/hq');
      } else {
        // If they successfully logged in but aren't an admin, kick them out and show an error
        await supabase.auth.signOut();
        setError('Access denied. Administrator privileges required.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // Temporarily store the intended role so AuthContext can apply it upon return
      localStorage.setItem('pendingOnboardingData', JSON.stringify({ role: 'admin' }));
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/hq`,
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: '#1E293B', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
          <svg viewBox="0 0 100 100" style={{ width: '40px', height: '40px', marginRight: '12px' }}>
            <path d="M60 15 A35 35 0 1 0 60 85" fill="none" stroke="#AFA9EC" strokeWidth="16" strokeLinecap="round" />
            <path d="M40 15 A35 35 0 1 1 40 85" fill="none" stroke="#5DCAA5" strokeWidth="16" strokeLinecap="round" />
          </svg>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Ralvo HQ</h1>
        </div>

        <p style={{ textAlign: 'center', color: '#94A3B8', marginBottom: '32px', fontSize: '14px' }}>Restricted Access. Authorized personnel only.</p>

        {error && (
          <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#F87171', borderRadius: '6px', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#CBD5E1' }}>Secure Email</label>
            <input 
              id="email" 
              name="email"
              type="email" 
              required 
              style={{ width: '100%', padding: '12px 16px', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: 'white', fontSize: '15px', outline: 'none' }}
            />
          </div>
          
          <div>
            <label htmlFor="password" style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#CBD5E1' }}>Access Key</label>
            <div style={{ position: 'relative' }}>
              <input 
                id="password" 
                name="password"
                type={showPassword ? 'text' : 'password'} 
                required 
                style={{ width: '100%', padding: '12px 16px', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: 'white', fontSize: '15px', outline: 'none' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '8px', width: '100%', padding: '12px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'background-color 0.2s' }}
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <div style={{ marginTop: '24px', position: 'relative', textAlign: 'center' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#334155', zIndex: 1 }}></div>
          <span style={{ position: 'relative', zIndex: 2, backgroundColor: '#1E293B', padding: '0 12px', color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>or</span>
        </div>

        <button 
          type="button" 
          onClick={handleGoogleLogin} 
          disabled={loading}
          style={{ marginTop: '24px', width: '100%', padding: '12px', backgroundColor: 'transparent', color: 'white', border: '1px solid #334155', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
        >
          <svg viewBox="0 0 48 48" style={{ width: '20px', height: '20px' }}>
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.9 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.5 0-14 4.3-17.7 10.7z"/>
            <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 35.1 26.9 36 24 36c-5.3 0-9.8-3-11.3-7.9l-6.6 5.1C9.9 39.6 16.4 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.9 3.1-3.3 5.7-6.3 7.1l6.6 5.4C39.3 37.4 44 31.5 44 24c0-1.3-.1-2.7-.4-3.5z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
