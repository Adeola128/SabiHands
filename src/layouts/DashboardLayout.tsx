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

  const { user, loading, signOut } = useAuth();

  const isVolunteer = role === 'volunteer';

  useEffect(() => {
    if (!user) {
      setCheckingProfile(false);
      return;
    }

    const checkProfile = async () => {
      try {
        if (role === 'volunteer') {
          const { data } = await supabase
            .from('volunteer_profiles')
            .select('bio, interests')
            .eq('user_id', user.id)
            .single();
          
          // If no data, or if bio/interests are empty, profile is incomplete
          if (!data || !data.bio || !data.interests || data.interests.length === 0) {
            navigate('/onboarding/volunteer', { replace: true });
            return;
          }
        } else if (role === 'organization') {
          const { data } = await supabase
            .from('organizations')
            .select('org_type')
            .eq('user_id', user.id)
            .single();
            
          if (!data || !data.org_type) {
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
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'var(--display)' }}>Loading SabiHands...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <Link to="/" className="dashboard-logo">
            <svg viewBox="0 0 100 100">
              <path d="M60 15 A35 35 0 1 0 60 85" fill="none" stroke="#7F77DD" strokeWidth="16" strokeLinecap="round"/>
              <path d="M40 15 A35 35 0 1 1 40 85" fill="none" stroke="#1D9E75" strokeWidth="16" strokeLinecap="round"/>
            </svg>
            <span>SabiHands</span>
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

      <nav className={`dashboard-secondary-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="dashboard-secondary-nav-inner">
          {isVolunteer ? (
            <>
              <Link to="/dashboard/volunteer" className={`secondary-nav-item ${location.pathname === '/dashboard/volunteer' ? 'active' : ''}`}>
                Home
              </Link>
              <Link to="/dashboard/volunteer/gigs" className={`secondary-nav-item ${location.pathname === '/dashboard/volunteer/gigs' ? 'active' : ''}`}>
                Browse Gigs
              </Link>
              <Link to="/dashboard/volunteer/applications" className={`secondary-nav-item ${location.pathname === '/dashboard/volunteer/applications' ? 'active' : ''}`}>
                Applications
              </Link>
              <Link to="/dashboard/volunteer/my-gigs" className={`secondary-nav-item ${location.pathname === '/dashboard/volunteer/my-gigs' ? 'active' : ''}`}>
                My Gigs
              </Link>
              <Link to="/dashboard/volunteer/certificates" className={`secondary-nav-item ${location.pathname === '/dashboard/volunteer/certificates' ? 'active' : ''}`}>
                Certificates
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard/org" className={`secondary-nav-item ${location.pathname === '/dashboard/org' ? 'active' : ''}`}>
                Overview
              </Link>
              <Link to="/dashboard/org/gigs" className={`secondary-nav-item ${location.pathname.includes('/dashboard/org/gigs') ? 'active' : ''}`}>
                Manage Gigs
              </Link>
              <Link to="/dashboard/org/impact" className={`secondary-nav-item ${location.pathname === '/dashboard/org/impact' ? 'active' : ''}`}>
                Impact
              </Link>
              <Link to="/dashboard/org/team" className={`secondary-nav-item ${location.pathname === '/dashboard/org/team' ? 'active' : ''}`}>
                Team
              </Link>
              <Link to="/dashboard/org/settings" className={`secondary-nav-item ${location.pathname === '/dashboard/org/settings' ? 'active' : ''}`}>
                Settings
              </Link>
              <Link to="/dashboard/org/billing" className={`secondary-nav-item ${location.pathname === '/dashboard/org/billing' ? 'active' : ''}`}>
                Billing
              </Link>
            </>
          )}
          <Link to="/dashboard/messages" className={`secondary-nav-item ${location.pathname === '/dashboard/messages' ? 'active' : ''}`}>
            Messages
          </Link>
          <Link to="/dashboard/community" className={`secondary-nav-item ${location.pathname === '/dashboard/community' ? 'active' : ''}`}>
            Community
          </Link>
          
          {/* Mobile Only: Profile and Notifications */}
          <div className="mobile-only-nav-items" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E4E1F5', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/dashboard/notifications" className={`secondary-nav-item ${location.pathname === '/dashboard/notifications' ? 'active' : ''}`}>
              Notifications
            </Link>
            <Link to="/dashboard/volunteer/profile" className={`secondary-nav-item ${location.pathname === '/dashboard/volunteer/profile' ? 'active' : ''}`}>
              Profile
            </Link>
          </div>
        </div>
      </nav>

      <main className={`dashboard-main ${location.pathname.includes('/dashboard/messages') ? 'messages-main' : ''}`}>
        {location.pathname.includes('/dashboard/messages') || location.pathname.includes('/dashboard/organization/profile') || location.pathname.includes('/dashboard/volunteer/apply') || location.pathname.includes('/dashboard/org/gigs/new') || location.pathname.includes('/dashboard/notifications') || location.pathname.includes('/dashboard/volunteer/profile') || location.pathname.includes('/dashboard/volunteer/settings') ? (
          <div style={{ width: '100%', maxWidth: (location.pathname.includes('/dashboard/organization/profile') || location.pathname.includes('/dashboard/volunteer/apply') || location.pathname.includes('/dashboard/org/gigs/new') || location.pathname.includes('/dashboard/volunteer/profile') || location.pathname.includes('/dashboard/volunteer/settings')) ? '1440px' : 'none', display: 'flex', justifyContent: 'center' }}>
            <Outlet />
          </div>
        ) : (
          <div className="dashboard-grid-immersive">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardLayout;
