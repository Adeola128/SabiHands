import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/LoadingScreen';

const ImpactDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGigs: 0,
    volunteersReached: 0,
    hoursContributed: 0,
    certificatesIssued: 0,
    economicValue: 0
  });
  const [topSkills, setTopSkills] = useState<{skill: string, pct: number}[]>([]);

  useEffect(() => {
    const fetchImpactData = async () => {
      if (!user) return;

      try {
        // 1. Get organization ID
        const { data: orgData } = await supabase
          .from('organizations')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!orgData) {
          setLoading(false);
          return;
        }

        // 2. Fetch Gigs (only published or completed)
        const { data: gigs } = await supabase
          .from('gigs')
          .select('id, duration, skills_required')
          .eq('organization_id', orgData.id)
          .in('status', ['published', 'completed']);

        const gigIds = gigs?.map((g: any) => g.id) || [];
        const totalGigs = gigs?.length || 0;

        let volunteersReached = 0;
        let hoursContributed = 0;
        let certificatesIssued = 0;
        
        const skillCounts: Record<string, number> = {};

        // 3. Fetch applications for these gigs
        if (gigIds.length > 0) {
          const { data: applications } = await supabase
            .from('applications')
            .select('gig_id, volunteer_id, status')
            .in('gig_id', gigIds)
            .in('status', ['completed', 'certified']);

          if (applications) {
            // Unique volunteers that were accepted or completed
            const uniqueVolunteers = new Set(applications.map((app: any) => app.volunteer_id));
            volunteersReached = uniqueVolunteers.size;

            // Compute impact strictly from completed gigs
            const completedApps = applications.filter((app: any) => app.status === 'completed');
            
            // Assume 1 certificate per completed gig
            certificatesIssued = completedApps.length;

            completedApps.forEach((app: any) => {
              const gig = gigs?.find((g: any) => g.id === app.gig_id);
              if (gig) {
                hoursContributed += (parseInt(gig.duration) || 0);

                // Aggregate skills
                if (gig.skills_required && Array.isArray(gig.skills_required)) {
                  gig.skills_required.forEach((skill: string) => {
                    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                  });
                }
              }
            });
          }
        }

        // 4. Calculate Points Earned
        const economicValue = hoursContributed * 100;

        // 5. Process Top Skills
        const totalSkillEntries = Object.values(skillCounts).reduce((a, b) => a + b, 0);
        let skillsArray = Object.entries(skillCounts)
          .map(([skill, count]) => ({
            skill,
            pct: totalSkillEntries > 0 ? Math.round((count / totalSkillEntries) * 100) : 0
          }))
          .sort((a, b) => b.pct - a.pct)
          .slice(0, 4);

        if (skillsArray.length === 0) {
          skillsArray = [
            { skill: 'Communication', pct: 0 },
            { skill: 'Teamwork', pct: 0 },
            { skill: 'Leadership', pct: 0 },
            { skill: 'Problem Solving', pct: 0 },
          ];
        }

        setStats({
          totalGigs,
          volunteersReached,
          hoursContributed,
          certificatesIssued,
          economicValue
        });
        setTopSkills(skillsArray);
      } catch (err) {
        console.error("Error calculating impact data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImpactData();
  }, [user]);

  if (loading) return <LoadingScreen message="Calculating your impact..." />;

  // Format the points value
  const formattedValue = new Intl.NumberFormat('en-NG').format(stats.economicValue) + ' RC';

  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '15px', marginBottom: '16px' }}>Filter Data</h2>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date Range</label>
              <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', fontSize: '15px', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)', backgroundColor: 'var(--white)' }}>
                <option>All Time</option>
                <option>This Year</option>
                <option>Last Year</option>
              </select>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '15px', marginBottom: '16px' }}>Top Skills Utilized</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topSkills.map(s => (
                <div key={s.skill}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{s.skill}</span>
                    <span style={{ color: 'var(--muted)' }}>{s.pct}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--paper)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.pct}%`, backgroundColor: 'var(--teal-600)', borderRadius: '99px', transition: 'width 1s ease-out' }} />
                  </div>
                </div>
              ))}
            </div>
            {stats.certificatesIssued === 0 && (
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '16px', fontStyle: 'italic' }}>
                Complete gigs to see actual skill usage data.
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          
          <div className="dash-card">
            <div className="dash-card-padding" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'var(--purple-50)', color: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--display)', lineHeight: 1 }}>{stats.totalGigs}</div>
                <div style={{ fontSize: '14px', color: 'var(--body)', fontWeight: 500, marginTop: '4px' }}>Total Gigs Posted</div>
              </div>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-padding" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--display)', lineHeight: 1 }}>{stats.volunteersReached}</div>
                <div style={{ fontSize: '14px', color: 'var(--body)', fontWeight: 500, marginTop: '4px' }}>Volunteers Reached</div>
              </div>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-padding" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--display)', lineHeight: 1 }}>{stats.hoursContributed}</div>
                <div style={{ fontSize: '14px', color: 'var(--body)', fontWeight: 500, marginTop: '4px' }}>Hours Contributed</div>
              </div>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-padding" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'var(--purple-50)', color: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--display)', lineHeight: 1 }}>{stats.certificatesIssued}</div>
                <div style={{ fontSize: '14px', color: 'var(--body)', fontWeight: 500, marginTop: '4px' }}>Certificates Issued</div>
              </div>
            </div>
          </div>
        </div>

        {/* Value equivalency card */}
        <div className="dash-card" style={{ background: 'linear-gradient(135deg, var(--teal-900) 0%, var(--teal-600) 100%)', color: 'white', marginBottom: '24px' }}>
          <div className="dash-card-padding" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal-50)', marginBottom: '8px' }}>Total Ralvo Coins Earned</h3>
              <div style={{ fontSize: '48px', fontFamily: 'var(--display)', fontWeight: 700, lineHeight: 1 }}>{formattedValue}</div>
              <p style={{ fontSize: '14px', color: 'var(--teal-50)', marginTop: '8px', opacity: 0.9 }}>Based on a standard baseline of 100 RC per hour of volunteering.</p>
            </div>
            <div style={{ width: '120px', height: '120px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImpactDashboard;
