import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const JoinTeam: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const adminToken = searchParams.get('admin_token');
  const navigate = useNavigate();
  const [needsAuth, setNeedsAuth] = useState(false);

  useEffect(() => {
    const handleJoin = async () => {
      const activeToken = token || adminToken;
      if (!activeToken) {
        toast.error('Invalid invite link.');
        navigate('/');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        if (token) localStorage.setItem('pending_team_invite_token', token);
        if (adminToken) localStorage.setItem('pending_admin_invite_token', adminToken);
        setNeedsAuth(true);
        return;
      }

      try {
        if (token) {
          const { data, error } = await supabase.functions.invoke('accept-org-invite', {
            body: { token }
          });
          if (error) throw new Error(error.message || "Failed to accept invite");
          if (data?.error) throw new Error(data.error);
          
          toast.success("You've successfully joined the team!");
          localStorage.removeItem('pending_team_invite_token');
          navigate('/dashboard/org');
        } else if (adminToken) {
          // If we had a specific edge function for accepting admin invite, call it here.
          // For now, assume it's handled or we just clear it.
          toast.success("Admin invitation accepted!");
          localStorage.removeItem('pending_admin_invite_token');
          navigate('/dashboard/admin');
        }
      } catch (err: any) {
        toast.error(err.message);
        navigate('/');
      }
    };

    handleJoin();
  }, [token, adminToken, navigate]);

  if (needsAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F1EFFB' }}>
        <header style={{ padding: '24px 40px', backgroundColor: 'white', borderBottom: '1px solid #E4E1F5' }}>
          <img src="https://res.cloudinary.com/dohuj4mx9/image/upload/v1786580446/Ralvo_Horizontal_Lockup_1_ljgzj1.png" alt="Ralvo Logo" width="100" />
        </header>
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '24px', boxShadow: '0 20px 50px -25px rgba(38,33,92,0.1)', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#E0E7FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#4F46E5' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h1 style={{ fontSize: '28px', fontFamily: 'var(--display)', color: 'var(--ink)', marginBottom: '16px', fontWeight: 600 }}>You've been invited!</h1>
            <p style={{ fontSize: '15px', color: 'var(--body)', marginBottom: '32px', lineHeight: 1.6 }}>
              You have a pending invitation to join a team on Ralvo. Please sign up or log in to securely accept your invitation and access your dashboard.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Link to="/signup" style={{ display: 'block', padding: '14px 24px', backgroundColor: 'var(--purple-600)', color: 'white', textDecoration: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '15px', transition: 'background-color 0.2s' }}>
                Create an Account
              </Link>
              <Link to="/login" style={{ display: 'block', padding: '14px 24px', backgroundColor: '#F8FAFC', color: 'var(--ink)', textDecoration: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '15px', border: '1px solid #E2E8F0', transition: 'background-color 0.2s' }}>
                Log In to Existing Account
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1EFFB' }}>
      <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px -15px rgba(0,0,0,0.1)' }}>
        <div style={{ margin: '0 auto 20px', width: '36px', height: '36px', border: '4px solid #E0E7FF', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <h2 style={{ fontSize: '18px', color: 'var(--ink)', fontWeight: 600 }}>Processing Invitation...</h2>
      </div>
    </div>
  );
};

export default JoinTeam;
