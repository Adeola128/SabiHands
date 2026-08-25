import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';
import OnboardingChecklist from '../../components/dashboard/OnboardingChecklist';
import OrgOnboarding from '../../components/OrgOnboarding';
import { motion } from 'framer-motion';

const OrgDashboard: React.FC = () => {
  const { user } = useAuth();
  const [org, setOrg] = useState<any>(null);
  const [stats, setStats] = useState({ activeGigs: 0, pending: 0, pendingSubs: 0, volunteersEngaged: 0, certsIssued: 0, teamMembers: 0 });
  const [pendingApplicants, setPendingApplicants] = useState<any[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [activeGigs, setActiveGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) return;
      
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (!orgData) return;
      setOrg(orgData);

      // Fetch active gigs
      const { data: activeGigsData, count: activeGigsCount } = await supabase
        .from('gigs')
        .select('*', { count: 'exact' })
        .eq('organization_id', orgData.id)
        .in('status', ['published', 'active'])
        .order('created_at', { ascending: false })
        .limit(3);

      const parsedActiveGigs = (activeGigsData || []).map(g => {
        if (g.status === 'published' && g.date_end && new Date(g.date_end) < new Date()) {
          return { ...g, status: 'completed' };
        }
        return g;
      }).filter(g => g.status === 'published' || g.status === 'active');

      setActiveGigs(parsedActiveGigs);

      // Fetch pending applications count & top 5
      const { data: pendingAppsData, count: pendingAppsCount } = await supabase
        .from('applications')
        .select('*, volunteer_profiles(full_name), gigs!inner(title, organization_id)', { count: 'exact' })
        .eq('gigs.organization_id', orgData.id)
        .eq('status', 'pending')
        .order('applied_at', { ascending: false })
        .limit(5);

      setPendingApplicants(pendingAppsData || []);

      // Fetch pending submissions count & top 5
      const { data: pendingSubsData, count: pendingSubsCount } = await supabase
        .from('submissions')
        .select('*, applications(volunteer_profiles(full_name)), gigs!inner(title, organization_id)', { count: 'exact' })
        .eq('gigs.organization_id', orgData.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      setPendingSubmissions(pendingSubsData || []);

      // Fetch unique volunteers engaged (accepted applications)
      const { data: acceptedAppsData } = await supabase
        .from('applications')
        .select('volunteer_id, gigs!inner(organization_id)')
        .eq('gigs.organization_id', orgData.id)
        .eq('status', 'accepted');

      const uniqueVolunteers = new Set(acceptedAppsData?.map(a => a.volunteer_id) || []).size;

      // Fetch certs issued
      const { count: certsCount } = await supabase
        .from('certificates')
        .select('id, gigs!inner(organization_id)', { count: 'exact', head: true })
        .eq('gigs.organization_id', orgData.id);

      // Fetch team members
      const { count: teamCount } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgData.id);

      setStats({
        activeGigs: activeGigsCount || 0,
        pending: pendingAppsCount || 0,
        pendingSubs: pendingSubsCount || 0,
        volunteersEngaged: uniqueVolunteers,
        certsIssued: certsCount || 0,
        teamMembers: teamCount || 0
      });
      setLoading(false);
    };

    fetchDashboard();
  }, [user]);

  const statsItems = [
    { label: 'Active Gigs', value: stats.activeGigs, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, bg: 'var(--purple-50)', color: 'var(--purple-600)' },
    { label: 'Pending Applicants', value: stats.pending, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, bg: 'var(--teal-50)', color: 'var(--teal-600)' },
    { label: 'Pending Submissions', value: stats.pendingSubs, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>, bg: 'var(--purple-50)', color: 'var(--purple-600)' },
    { label: 'Volunteers Engaged', value: stats.volunteersEngaged, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, bg: 'var(--teal-50)', color: 'var(--teal-600)' },
  ];

  if (loading) return <LoadingScreen message="Loading dashboard..." fullScreen={true} />;

  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className="context-col">
        {/* Stats */}
        <motion.div 
          className="dash-card glass-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '15px', marginBottom: '16px' }}>Organization Overview</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {statsItems.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', backgroundColor: 'var(--paper)', borderRadius: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500, marginTop: '2px' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="dash-card glass-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '15px', marginBottom: '14px' }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/dashboard/org/gigs/new" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 16px', backgroundColor: 'var(--purple-600)', borderRadius: '8px', color: '#ffffff', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Post a New Gig
              </Link>
              <Link to="/dashboard/org/impact" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 16px', backgroundColor: 'var(--paper)', borderRadius: '8px', color: 'var(--ink)', fontWeight: 600, fontSize: '14px', textDecoration: 'none', border: '1.5px solid #E4E1F5' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Impact Dashboard
              </Link>
              <Link to="/dashboard/org/settings" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 16px', backgroundColor: 'var(--paper)', borderRadius: '8px', color: 'var(--ink)', fontWeight: 600, fontSize: '14px', textDecoration: 'none', border: '1.5px solid #E4E1F5' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Organization Settings
              </Link>
            </div>
          </div>
        </motion.div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        {/* Welcome hero */}
        <motion.div 
          className="hero-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="hero-greeting">Welcome back, {org?.name || 'Organization'}!</h1>
          <div className="hero-actions">
            <Link to="/dashboard/org/gigs/new" className="hero-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Post a gig
            </Link>
            <Link to="/dashboard/org/gigs" className="hero-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              Manage gigs
            </Link>
            <Link to="/dashboard/org/impact" className="hero-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              View impact
            </Link>
          </div>
        </motion.div>

        <OnboardingChecklist organization={org} stats={stats} />

        {/* Action Required — Pending Applicants & Submissions */}
        <motion.div 
          className="dash-card glass-card" 
          style={{ marginBottom: '32px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="dash-card-header">
            <h2 className="dash-card-title">Action Required</h2>
            <span style={{ fontSize: '13px', fontWeight: 600, backgroundColor: 'var(--purple-50)', color: 'var(--purple-600)', padding: '4px 10px', borderRadius: '99px' }}>{pendingApplicants.length + pendingSubmissions.length} pending</span>
          </div>
          {pendingApplicants.length === 0 && pendingSubmissions.length === 0 ? (
            <EmptyState 
              icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
              title="No pending actions"
              description="You're all caught up! New applicants and volunteer submissions will appear here for you to review."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {pendingApplicants.map((a, i) => {
                const name = a.volunteer_profiles?.full_name || 'Volunteer';
                const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                return (
                  <div key={`app-${i}`} className="gig-media-card" style={{ alignItems: 'center' }}>
                    {/* Avatar */}
                    <div style={{ width: '48px', minWidth: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '20px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--purple-600)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', fontFamily: 'var(--display)' }}>{initials}</div>
                    </div>
                    
                    <div className="gig-media-body" style={{ padding: '16px' }}>
                      <div className="gig-media-header" style={{ marginBottom: '6px' }}>
                        <div>
                          <h3 className="gig-media-title" style={{ fontSize: '16px', marginBottom: '2px' }}>{name}</h3>
                          <p className="gig-media-org" style={{ fontSize: '13px' }}>Applied for <strong>{a.gigs?.title}</strong></p>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--muted)', flexShrink: 0 }}>
                          {new Date(a.applied_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: '16px 20px 16px 8px', display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <Link to={`/dashboard/org/gigs/${a.gig_id}`} className="gig-action" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '13px' }}>Review</Link>
                    </div>
                  </div>
                )
              })}
              
              {pendingSubmissions.map((s, i) => {
                const name = s.applications?.volunteer_profiles?.full_name || 'Volunteer';
                const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                return (
                  <div key={`sub-${i}`} className="gig-media-card" style={{ alignItems: 'center', borderTop: i === 0 && pendingApplicants.length > 0 ? '1px solid #E4E1F5' : 'none' }}>
                    <div style={{ width: '48px', minWidth: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '20px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--teal-600)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', fontFamily: 'var(--display)' }}>{initials}</div>
                    </div>
                    
                    <div className="gig-media-body" style={{ padding: '16px' }}>
                      <div className="gig-media-header" style={{ marginBottom: '6px' }}>
                        <div>
                          <h3 className="gig-media-title" style={{ fontSize: '16px', marginBottom: '2px' }}>{name}</h3>
                          <p className="gig-media-org" style={{ fontSize: '13px' }}>Submitted work for <strong>{s.gigs?.title}</strong></p>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--muted)', flexShrink: 0 }}>
                          {new Date(s.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: '16px 20px 16px 8px', display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <Link to={`/dashboard/org/gigs/${s.gig_id}/submissions`} className="gig-action" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '13px', background: 'var(--teal-600)', color: 'white', border: 'none' }}>Review Work</Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Active Gigs Carousel */}
        <motion.div 
          className="gig-carousel-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="gig-carousel-header">
            <h2 className="gig-carousel-title">Your Gigs</h2>
            <Link to="/dashboard/org/gigs" style={{ fontSize: '14px', color: 'var(--purple-600)', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>
          <div className="gig-carousel">
            {activeGigs.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>No active gigs.</div>
            ) : activeGigs.map((g, i) => (
              <Link key={i} to={`/dashboard/org/gigs/${g.id}`} className="gig-media-card-horizontal" style={{ textDecoration: 'none' }}>
                <div className="gig-media-cover-horizontal" style={{ backgroundImage: `url(${g.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(g.title)}&background=random&size=400`})` }} />
                <div className="gig-media-body-horizontal">
                  <h3 className="gig-media-title" style={{ fontSize: '16px' }}>{g.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', flexWrap: 'wrap', gap: '8px' }}>
                    <span className="tag status" style={{ backgroundColor: g.status === 'published' ? '#D4EDDA' : '#E4E1F5', color: g.status === 'published' ? '#155724' : 'var(--body)', textTransform: 'capitalize' }}>{g.status}</span>
                  </div>
                </div>
              </Link>
            ))}
            {/* New Gig CTA */}
            <Link to="/dashboard/org/gigs/new" className="gig-media-card-horizontal" style={{ border: '2px dashed #E4E1F5', backgroundColor: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', minHeight: '200px' }}>
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-600)', margin: '0 auto 12px', border: '1.5px solid #E4E1F5' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>Create a New Gig</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Get help from skilled volunteers</div>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
      <OrgOnboarding organization={org} stats={stats} />
    </>
  );
};

export default OrgDashboard;
