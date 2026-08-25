import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/LoadingScreen';

const MarkAttendance: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [gig, setGig] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;

      const { data: gigData } = await supabase
        .from('gigs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (gigData) setGig(gigData);

      const { data: appsData } = await supabase
        .from('applications')
        .select(`
          *,
          volunteer_profiles(full_name),
          attendance(id, attended)
        `)
        .eq('gig_id', id)
        .eq('status', 'accepted');

      if (appsData) {
        // Initialize attendance state (true if already attended)
        const initialAttendance: Record<string, boolean> = {};
        for (const app of appsData) {
          // Resolve name with fallback
          const profiles = app.volunteer_profiles;
          const profile = Array.isArray(profiles) ? profiles[0] : profiles;
          let name = profile?.full_name;
          if (!name && app.volunteer_id) {
             const { data: vp } = await supabase.from('volunteer_profiles').select('full_name').eq('user_id', app.volunteer_id).maybeSingle();
             if (vp?.full_name) name = vp.full_name;
          }
          app.resolved_name = name || 'Volunteer';
          
          initialAttendance[app.id] = app.attendance && app.attendance.length > 0 ? app.attendance[0].attended : true; // Default to true if no record yet
        }
        setAttendance(initialAttendance);
        setApplications(appsData);
      }
      setLoading(false);
    };
    fetchData();
  }, [id, user]);

  const toggleAttendance = (appId: string) => {
    setAttendance(prev => ({ ...prev, [appId]: !prev[appId] }));
  };

  const handleSave = async () => {
    if (!gig || !user) return;
    setSaving(true);
    
    // Get org id to confirm attendance
    const { data: orgData } = await supabase.from('organizations').select('id').eq('user_id', user.id).single();
    if (!orgData) {
      setSaving(false);
      return;
    }

    const attendanceRecords = applications.map(app => {
      const existingAttendance = app.attendance && app.attendance.length > 0 ? app.attendance[0] : null;
      return {
        ...(existingAttendance ? { id: existingAttendance.id } : {}),
        application_id: app.id,
        confirmed_by: user.id,
        attended: attendance[app.id] || false,
        hours: 6, // Defaulting to 6 hours for MVP
        confirmed_at: new Date().toISOString()
      };
    });

    // Upsert attendance
    const { error } = await supabase
      .from('attendance')
      .upsert(attendanceRecords);

    setSaving(false);
    if (!error) {
      navigate(`/dashboard/org/gigs/${id}/certificates`);
    } else {
      alert('Failed to save attendance: ' + error.message);
    }
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;

  if (loading) return <LoadingScreen message="Loading..." fullScreen={true} />;
  if (!gig) return <div style={{ padding: '48px', textAlign: 'center' }}>Gig not found.</div>;

  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '15px', marginBottom: '16px' }}>Event Summary</h2>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--display)', marginBottom: '8px' }}>{gig.title}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--body)' }}>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                 <span>{gig.date_start ? new Date(gig.date_start).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" }) : 'TBD'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--body)' }}>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                 <span>{gig.location || 'Remote'}</span>
              </div>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--teal-50)', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--teal-700)', fontFamily: 'var(--display)' }}>{presentCount} / {applications.length}</div>
              <div style={{ fontSize: '12px', color: 'var(--teal-900)', fontWeight: 600 }}>Marked Present</div>
            </div>
          </div>
        </div>

        <Link to={`/dashboard/org/gigs/${gig.id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 0' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Gig Details
        </Link>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        <div className="dash-card">
          <div className="dash-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="dash-card-title">Mark Attendance</h2>
              <p style={{ fontSize: '13px', color: 'var(--body)', margin: '4px 0 0' }}>Confirm which volunteers showed up to the event.</p>
            </div>
            <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', backgroundColor: 'var(--purple-600)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>

          <div style={{ padding: '0 24px' }}>
            {applications.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>No accepted volunteers found.</div>
            )}
            {applications.map((app, i) => {
              const name = app.resolved_name || 'Volunteer';
              const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
              return (
              <div key={app.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: i < applications.length - 1 ? '1px solid #E4E1F5' : 'none' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--purple-100)', color: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', fontFamily: 'var(--display)' }}>
                    {initials}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 2px' }}>{name}</h3>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', backgroundColor: attendance[app.id] ? 'var(--teal-50)' : 'var(--paper)', border: `1.5px solid ${attendance[app.id] ? 'var(--teal-400)' : '#E4E1F5'}`, transition: 'all 0.2s' }}>
                    <input 
                      type="checkbox" 
                      checked={attendance[app.id]} 
                      onChange={() => toggleAttendance(app.id)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--teal-600)', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: attendance[app.id] ? 'var(--teal-900)' : 'var(--body)' }}>Present</span>
                  </label>
                </div>

              </div>
            )})}
          </div>

          <div style={{ padding: '24px', backgroundColor: '#FAFAFC', borderTop: '1px solid #E4E1F5', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'var(--body)', margin: '0 0 16px' }}>Once attendance is saved, you can issue certificates to present volunteers.</p>
            <Link to={`/dashboard/org/gigs/${gig.id}/certificates`} className="gig-action" style={{ display: 'inline-flex', padding: '10px 24px', backgroundColor: 'var(--teal-600)', color: 'white', border: 'none', textDecoration: 'none' }}>
              Proceed to Certificates →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default MarkAttendance;
