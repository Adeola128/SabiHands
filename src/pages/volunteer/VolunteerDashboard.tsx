import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/LoadingScreen';

const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ gigsDone: 0, certs: 0 });
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('volunteer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileData) setProfile(profileData);

      // Fetch stats
      const { count: gigsDone } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('volunteer_id', user.id)
        .eq('status', 'accepted');

      const { count: certs } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('volunteer_id', user.id);

      setStats({
        gigsDone: gigsDone || 0,
        certs: certs || 0
      });

      // Fetch recommended gigs
      const { data: gigsData } = await supabase
        .from('gigs')
        .select('*, organizations(name)')
        .eq('status', 'published')
        .limit(3);

      if (gigsData) setRecommended(gigsData);
      setLoading(false);
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return <LoadingScreen message="Loading dashboard..." fullScreen={true} />;
  }

  const getMilestone = (completed: number) => {
    if (completed < 5) return { title: 'First 5 Gigs', target: 5, current: completed, text: `You're making a huge impact! Complete just ${5 - completed} more gigs to unlock this prestigious badge and exclusive perks.` };
    if (completed < 10) return { title: 'Community Champion', target: 10, current: completed, text: `You're making a huge impact! Complete just ${10 - completed} more gigs to unlock this prestigious badge and exclusive perks.` };
    if (completed < 25) return { title: 'Local Hero', target: 25, current: completed, text: `You're making a huge impact! Complete just ${25 - completed} more gigs to unlock this prestigious badge and exclusive perks.` };
    return { title: 'Super Volunteer', target: completed, current: completed, text: 'You have reached the highest tier! Keep up the great work!' };
  };

  const milestone = getMilestone(stats.gigsDone);
  const progressPercent = milestone.target > milestone.current ? (milestone.current / milestone.target) * 100 : 100;

  return (
    <>
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--teal-600)' }}></div>
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>Ready to volunteer</span>
            </div>
            
            <h2 className="dash-card-title" style={{ fontSize: '16px', marginBottom: '16px' }}>Your Impact</h2>
            
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--display)', color: 'var(--ink)', margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>$0</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#FAFAFC', borderRadius: '12px' }}>
                  <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--purple-100)', borderRadius: '8px', color: 'var(--purple-700)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)' }}>$0</div>
                    <div style={{ fontSize: '13px', color: 'var(--body)' }}>from volunteering</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#FAFAFC', borderRadius: '12px' }}>
                  <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--teal-100)', borderRadius: '8px', color: 'var(--teal-700)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)' }}>$0</div>
                    <div style={{ fontSize: '13px', color: 'var(--body)' }}>from giving</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'center' }}>
              <div style={{ padding: '16px 8px', backgroundColor: '#FAFAFC', borderRadius: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>{stats.gigsDone}</div>
                <div style={{ fontSize: '12px', color: 'var(--body)', fontWeight: 500 }}>Gigs Done</div>
              </div>
              <div style={{ padding: '16px 8px', backgroundColor: '#FAFAFC', borderRadius: '12px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>{stats.certs}</div>
                <div style={{ fontSize: '12px', color: 'var(--body)', fontWeight: 500 }}>Certificates</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '15px', marginBottom: '12px', color: 'var(--ink)' }}>Show all your impact: Track your volunteering outside of Gigway</h2>
            <button style={{ width: '100%', padding: '10px 16px', backgroundColor: 'var(--white)', border: '1.5px solid #E4E1F5', borderRadius: '8px', color: 'var(--ink)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              Submit hours
            </button>
          </div>
        </div>
      </aside>

      <div className="main-content">
        
        <div className="hero-section">
          <h1 className="hero-greeting">Let's make a difference, {profile?.full_name ? profile.full_name.split(' ')[0] : 'Volunteer'}!</h1>
          <div className="hero-actions">
            <Link to="/dashboard/volunteer/gigs?type=physical" className="hero-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Volunteer in-person
            </Link>
            <Link to="/dashboard/volunteer/gigs?type=virtual" className="hero-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              Volunteer virtually
            </Link>
            <button className="hero-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              Donate
            </button>
          </div>
        </div>

        <div className="dash-card" style={{ marginBottom: '40px', background: 'linear-gradient(135deg, #1E1B4B 0%, #4C1D95 100%)', border: 'none', color: 'var(--white)', overflow: 'hidden', position: 'relative' }}>
          {/* Decorative Background Elements */}
          <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0) 70%)', borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', bottom: '-20%', left: '10%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(45, 212, 191, 0.3) 0%, rgba(45, 212, 191, 0) 70%)', borderRadius: '50%' }}></div>
          
          <div className="dash-card-padding" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 24px', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Next Milestone</span>
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0', fontFamily: 'var(--display)', letterSpacing: '-0.01em', wordBreak: 'break-word' }}>{milestone.title}</h2>
              <p style={{ fontSize: '15px', margin: '0 0 24px 0', opacity: 0.9, lineHeight: 1.5, maxWidth: '100%' }}>
                {milestone.text}
              </p>
              
              <div style={{ maxWidth: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  <span>Progress</span>
                  <span>{milestone.current} / {milestone.target} Gigs</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#2DD4BF', borderRadius: '4px', boxShadow: '0 0 10px rgba(45, 212, 191, 0.5)' }}></div>
                </div>
              </div>
            </div>
            
            <div style={{ width: '100px', height: '100px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px dashed rgba(255, 255, 255, 0.3)' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--white)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"></path></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="gig-carousel-wrapper">
          <div className="gig-carousel-header">
            <h2 className="gig-carousel-title">Recommended for You</h2>
          </div>
          
          <div className="gig-carousel">
            {recommended.length > 0 ? recommended.map(gig => (
              <div key={gig.id} className="gig-media-card-horizontal">
                <div className="gig-media-cover-horizontal" style={{ backgroundImage: `url(${gig.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=random&size=400`})` }}></div>
                <div className="gig-media-body-horizontal">
                  <Link to={`/dashboard/volunteer/gigs/${gig.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="gig-media-title">{gig.title}</h3>
                  </Link>
                  <Link to="/dashboard/organization/profile" className="gig-media-org" style={{ textDecoration: 'none' }}>
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(gig.organizations?.name || 'Org')}&background=random`} alt={gig.organizations?.name} />
                    <strong>{gig.organizations?.name || 'Organization'}</strong>
                  </Link>
                  <div className="gig-tags">
                    <span className={`tag ${gig.type === 'skilled' ? 'skilled' : 'physical'}`}>
                      {gig.type === 'skilled' ? 'Skilled' : 'Physical'}
                    </span>
                    <span className="tag physical">{gig.location}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '24px', color: 'var(--muted)', textAlign: 'center', width: '100%' }}>No gigs available at the moment.</div>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default VolunteerDashboard;

