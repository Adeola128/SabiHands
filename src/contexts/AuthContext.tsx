import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: 'volunteer' | 'organization' | 'admin' | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<'volunteer' | 'organization' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSession = async (session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Sync any pending onboarding data
        let currentMetadata = session.user.user_metadata;
        const pendingData = localStorage.getItem('pendingOnboardingData');
        if (pendingData) {
          try {
            const parsedData = JSON.parse(pendingData);
            // Update auth metadata
            const { data: updatedUser } = await supabase.auth.updateUser({
              data: parsedData
            });
            if (updatedUser.user) {
              currentMetadata = updatedUser.user.user_metadata;
            }
            localStorage.removeItem('pendingOnboardingData');
          } catch (e) {
            console.error('Failed to sync onboarding data', e);
          }
        }
        
        const role = currentMetadata?.role;

        if (role) {
          setRole(role);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
