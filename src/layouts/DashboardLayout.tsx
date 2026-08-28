import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  role?: 'volunteer' | 'organization';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role = 'volunteer' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  const { user, loading, signOut } = useAuth();

  const actualRole = user?.user_metadata?.role || role;
  const isVolunteer = actualRole === 'volunteer';

  useEffect(() => {
    if (!user) {
      setCheckingProfile(false);
      return;
    }

    const checkProfile = async () => {
      try {
        if (actualRole === 'volunteer') {
          const { data } = await supabase
            .from('volunteer_profiles')
            .select('interests, primary_goals, bio, avatar_url, skills')
            .eq('user_id', user.id)
            .single();
          
          // If no data, or if both interests and primary_goals are empty, redirect to onboarding
          if (!data || ((!data.interests || data.interests.length === 0) && (!data.primary_goals || data.primary_goals.length === 0))) {
            navigate('/onboarding/volunteer', { replace: true });
            return;
          }

          // Check for incomplete profile
          if (!data.bio || !data.avatar_url || !data.skills || data.skills.length === 0) {
            setIsProfileIncomplete(true);
          } else {
            setIsProfileIncomplete(false);
          }
        } else if (actualRole === 'organization') {
          const { data } = await supabase
            .from('organizations')
            .select('location, focus_area')
            .eq('user_id', user.id)
            .single();
            
          if (!data || (!data.location && !data.focus_area)) {
            navigate('/onboarding/organization', { replace: true });
            return;
          }
        }
      } catch (err) {
        console.error("Error checking profile:", err);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfile();
  }, [user, role, navigate]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  if (loading || checkingProfile) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'var(--display)' }}>Loading Ralvo...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isFullWidthRoute = location.pathname.includes('/dashboard/messages') || 
    location.pathname.includes('/dashboard/organization/profile') || 
    location.pathname.endsWith('/apply') || 
    location.pathname.includes('/dashboard/org/gigs/new') || 
    location.pathname.endsWith('/edit') || 
    location.pathname.includes('/dashboard/notifications') || 
    location.pathname.includes('/dashboard/volunteer/profile') || 
    location.pathname.includes('/dashboard/volunteer/settings') ||
    location.pathname.includes('/dashboard/community/recommendations');

  const needsMaxWidth = location.pathname.includes('/dashboard/organization/profile') || 
    location.pathname.endsWith('/apply') || 
    location.pathname.includes('/dashboard/org/gigs/new') || 
    location.pathname.endsWith('/edit') || 
    location.pathname.includes('/dashboard/volunteer/profile') || 
    location.pathname.includes('/dashboard/volunteer/settings');

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <Link to="/dashboard" className="dashboard-logo">
            <img src="/logo.png" alt="Ralvo Logo" style={{ height: '24px', width: 'auto' }} />
            <span>Ralvo</span>
          </Link>
          
          <nav className="dashboard-nav">
            <Link to="/dashboard/notifications" className="nav-item" style={{ position: 'relative' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              <span style={{ position: 'absolute', top: '8px', right: '10px', width: '8px', height: '8px', backgroundColor: 'var(--pink-500)', borderRadius: '50%', border: '2px solid var(--white)' }}></span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link to={isVolunteer ? "/dashboard/volunteer/profile" : "/dashboard/organization/profile"} className="dashboard-profile-btn" style={{ textDecoration: 'none' }}>
                <div className="profile-text">
                  {user?.user_metadata?.full_name || 'My Profile'} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </Link>
              <button 
                onClick={signOut}
                style={{ background: 'transparent', border: '1px solid #E4E1F5', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}
              >
                Log Out
              </button>
            </div>
          </nav>

          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>
        </div>
      </header>

      {isVolunteer && isProfileIncomplete && !isBannerDismissed && (
        <div className="profile-incomplete-wrapper">
          <div className="profile-incomplete-banner">
            <button onClick={() => setIsBannerDismissed(true)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'var(--amber-500)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--amber-100)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="profile-incomplete-content">
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--amber-100)', color: 'var(--amber-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--amber-900)', margin: '0 0 4px 0' }}>Your profile is incomplete!</h4>
                <p style={{ fontSize: '14px', color: 'var(--amber-800)', margin: 0 }}>Add a bio, skills, and an avatar to stand out.</p>
              </div>
            </div>
            <Link to="/dashboard/volunteer/settings" className="profile-incomplete-btn">
              Complete Profile
            </Link>
          </div>
        </div>
      )}

      <nav className={`dashboard-secondary-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="dashboard-secondary-nav-inner">
          {isVolunteer ? (
            <>
              <Link to="/dashboard/volunteer" onClick={() => setIsMobileMenuOpen(false)} className={`secondary-nav-item ${location.pathname === '/dashboard/volunteer' ? 'active' : ''}`}>
                Home
              </Link>
              <Link to="/dashboard/volunteer/gigs" onClick={() => setIsMobileMenuOpen(false)} className={`secondary-nav-item ${location.pathname === '/dashboard/volunteer/gigs' ? 'active' : ''}`}>
                Browse Gigs
              </Link>
              <Link to="/dashboard/volunteer/applications" onClick={() => setIsMobileMenuOpen(false)} className={`secondary-nav-item ${location.pathname === '/dashboard/volunteer/applications' ? 'active' : ''}`}>
                Applications
              </Link>
              <Link to="/dashboard/volunteer/my-gigs" onClick={() => setIsMobileMenuOpen(false)} className={`secondary-nav-item ${location.pathname === '/dashboard/volunteer/my-gigs' ? 'active' : ''}`}>
                My Gigs
              </Link>
              <Link to="/dashboard/volunteer/certificates" onClick={() => setIsMobileMenuOpen(false)} className={`secondary-nav-item ${location.pathname === '/dashboard/volunteer/certificates' ? 'active' : ''}`}>
                Certificates
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard/org" onClick={() => setIsMobileMenuOpen(false)} className={`secondary-nav-item ${location.pathname === '/dashboard/org' ? 'active' : ''}`}>
                Overview
              </Link>
              <Link to="/dashboard/org/gigs" onClick={() => setIsMobileMenuOpen(false)} className={`secondary-nav-item ${location.pathname.includes('/dashboard/org/gigs') ? 'active' : ''}`}>
                Manage Gigs
              </Link>
              <Link to="/dashboard/org/impact" onClick={() => setIsMobileMenuOpen(false)} className={`secondary-nav-item ${location.pathname === '/dashboard/org/impact' ? 'active' : ''}`}>
                Impact
              </Link>
              <Link to="/dashboard/org/team" onClick={() => setIsMobileMenuOpen(false)} className={`secondary-nav-item ${location.pathname === '/dashboard/org/team' ? 'active' : ''}`}>
                Team
              </Link>
              <Link to="/dashboard/org/settings" onClick={() => setIsMobileMenuOpen(false)} className={`secondary-nav-item ${location.pathname === '/dashboard/org/settings' ? 'active' : ''}`}>
                Settings
              </Link>
            </>
          )}
          <Link to="/dashboard/messages" onClick={() => setIsMobileMenuOpen(false)} className={`secondary-nav-item ${location.pathname === '/dashboard/messages' ? 'active' : ''}`}>
            Messages
          </Link>
          <Link to="/dashboard/community" onClick={() => setIsMobileMenuOpen(false)} className={`secondary-nav-item ${location.pathname === '/dashboard/community' ? 'active' : ''}`}>
            Community
          </Link>
          
          {/* Mobile Only: Profile and Notifications */}
          <div className="mobile-only-nav-items" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E4E1F5', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/dashboard/notifications" onClick={() => setIsMobileMenuOpen(false)} className={`secondary-nav-item ${location.pathname === '/dashboard/notifications' ? 'active' : ''}`}>
              Notifications
            </Link>
            <Link to="/dashboard/volunteer/profile" onClick={() => setIsMobileMenuOpen(false)} className={`secondary-nav-item ${location.pathname === '/dashboard/volunteer/profile' ? 'active' : ''}`}>
              Profile
            </Link>
          </div>
        </div>
      </nav>

      <main className={`dashboard-main ${location.pathname.includes('/dashboard/messages') ? 'messages-main' : ''} ${location.pathname.includes('/dashboard/community') ? 'community-main' : ''}`}>
        {isFullWidthRoute ? (
          <div style={{ width: '100%', maxWidth: needsMaxWidth ? '1440px' : 'none', display: 'flex', justifyContent: 'center' }}>
            <Outlet />
          </div>
        ) : (
          <div className={location.pathname.includes('/dashboard/community') ? "dashboard-grid-community" : "dashboard-grid-immersive"}>
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardLayout;

