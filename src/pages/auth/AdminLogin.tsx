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
      </div>
    </div>
  );
};

export default AdminLogin;
