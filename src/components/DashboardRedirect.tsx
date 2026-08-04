import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const DashboardRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user || loading) {
      if (!loading && !user) setChecking(false);
      return;
    }

    const checkUserRole = async () => {
      try {
        // 1. Check user metadata first
        const metadataRole = user.user_metadata?.role;
        const onboardingComplete = user.user_metadata?.onboarding_complete;
        
        if (!onboardingComplete) {
          // If onboarding is not complete, route them to onboarding based on role (default to volunteer)
          if (metadataRole === 'organization') {
            navigate('/onboarding/organization', { replace: true });
          } else {
            // Default to volunteer if totally new (Google OAuth first time without pending data)
            if (!metadataRole) {
              await supabase.auth.updateUser({ data: { role: 'volunteer' } });
            }
            navigate('/onboarding/volunteer', { replace: true });
          }
          return;
        }

        if (metadataRole === 'organization') {
          navigate('/dashboard/org', { replace: true });
          return;
        } else if (metadataRole === 'admin') {
          navigate('/admin', { replace: true });
          return;
        } else if (metadataRole === 'volunteer') {
          navigate('/dashboard/volunteer', { replace: true });
          return;
        }

        // 2. Fallback check DB if metadata is missing (e.g. Google Auth signup)
        const { data: orgData } = await supabase
          .from('organizations')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (orgData) {
          await supabase.auth.updateUser({ data: { role: 'organization' } });
          navigate('/dashboard/org', { replace: true });
          return;
        }

        const { data: volData } = await supabase
          .from('volunteer_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (volData) {
          await supabase.auth.updateUser({ data: { role: 'volunteer' } });
          navigate('/dashboard/volunteer', { replace: true });
          return;
        }

        // 3. Default to volunteer if totally new (Google OAuth first time)
        await supabase.auth.updateUser({ data: { role: 'volunteer' } });
        navigate('/onboarding/volunteer', { replace: true });
        
      } catch (err) {
        console.error('Error checking role in redirect:', err);
        navigate('/onboarding/volunteer', { replace: true });
      } finally {
        setChecking(false);
      }
    };

    checkUserRole();
  }, [user, loading, navigate]);

  if (loading || checking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'var(--display)' }}>
        Loading your dashboard...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return null;
};

export default DashboardRedirect;
