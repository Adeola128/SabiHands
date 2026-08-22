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
        let metadataRole = user.user_metadata?.role;
        let onboardingComplete = user.user_metadata?.onboarding_complete;
        
        // Check for pending invite
        const pendingToken = localStorage.getItem('pending_team_invite_token');
        if (pendingToken) {
          navigate(`/join-team?token=${pendingToken}`, { replace: true });
          return;
        }

        // 1. If onboarding is not marked complete, check DB to see if they already have a profile
        if (!onboardingComplete) {
          const { data: orgData } = await supabase
            .from('organizations')
            .select('id')
            .eq('user_id', user.id)
            .single();
            
          if (orgData) {
            await supabase.auth.updateUser({ data: { role: 'organization', onboarding_complete: true } });
            metadataRole = 'organization';
            onboardingComplete = true;
          } else {
            const { data: volData } = await supabase
              .from('volunteer_profiles')
              .select('id')
              .eq('user_id', user.id)
              .single();

            if (volData) {
              await supabase.auth.updateUser({ data: { role: 'volunteer', onboarding_complete: true } });
              metadataRole = 'volunteer';
              onboardingComplete = true;
            }
          }
        }

        // 2. If STILL not complete, route to onboarding
        if (!onboardingComplete) {
          if (metadataRole === 'organization') {
            navigate('/onboarding/organization', { replace: true });
          } else {
            if (!metadataRole) {
              await supabase.auth.updateUser({ data: { role: 'volunteer' } });
            }
            navigate('/onboarding/volunteer', { replace: true });
          }
          return;
        }

        // 3. Route to proper dashboard based on role
        if (metadataRole === 'organization') {
          navigate('/dashboard/org', { replace: true });
        } else if (metadataRole === 'admin') {
          navigate('/hq', { replace: true });
        } else {
          // Default to volunteer if it's somehow missing but onboarding is true
          if (!metadataRole) {
              await supabase.auth.updateUser({ data: { role: 'volunteer' } });
          }
          navigate('/dashboard/volunteer', { replace: true });
        }
        
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
