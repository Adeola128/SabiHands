import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';

type Tab = 'all' | 'published' | 'draft' | 'completed';

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  published: { bg: '#D4EDDA', color: '#155724', label: 'Active' },
  draft:     { bg: '#E4E1F5', color: 'var(--body)', label: 'Draft' },
  completed: { bg: 'var(--teal-50)', color: 'var(--teal-900)', label: 'Completed' },
};

const ManageGigs: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGigs = async () => {
      if (!user) return;

      const { data: orgData } = await supabase
        .from('organizations')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!orgData) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('gigs')
        .select(`
          *,
          applications (id)
        `)
        .eq('organization_id', orgData.id)
        .order('date_start', { ascending: false });

      if (data) {
        setGigs(data);
      }
      setLoading(false);
    };

    fetchGigs();
  }, [user]);

  const filtered = activeTab === 'all' ? gigs : gigs.filter(g => g.status === activeTab);
  
  const counts = { 
    all: gigs.length, 
    published: gigs.filter(g => g.status === 'published').length, 
    draft: gigs.filter(g => g.status === 'draft').length, 
    completed: gigs.filter(g => g.status === 'completed').length 
  };

  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '15px', marginBottom: '16px' }}>Filter by Status</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(['all', 'published', 'draft', 'completed'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '9px 12px', borderRadius: '8px', border: 'none',
                    backgroundColor: activeTab === t ? 'var(--purple-50)' : 'transparent',
                    color: activeTab === t ? 'var(--purple-600)' : 'var(--body)',
                    fontWeight: activeTab === t ? 700 : 500, fontSize: '14px', cursor: 'pointer',
                    transition: 'all 0.15s ease', textTransform: 'capitalize',
                  }}
                >
                  <span>{t === 'all' ? 'All Gigs' : t === 'published' ? 'Active' : t.charAt(0).toUpperCase() + t.slice(1)}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, backgroundColor: activeTab === t ? 'var(--purple-200)' : 'var(--paper)', color: activeTab === t ? 'var(--purple-900)' : 'var(--muted)', padding: '2px 8px', borderRadius: '99px' }}>
                    {counts[t]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-padding">
            <Link to="/dashboard/org/gigs/new" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px 16px', backgroundColor: 'var(--purple-600)', borderRadius: '8px', color: '#ffffff', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Post a New Gig
            </Link>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '15px', marginBottom: '14px' }}>Gig Stats</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Total Posted', value: counts.all },
                { label: 'Active', value: counts.published },
                { label: 'Total Applicants', value: gigs.reduce((acc, g) => acc + (g.applications?.length || 0), 0) },
                { label: 'Certs Issued', value: '-' },
              ].map(s => (
                <div key={s.label} style={{ backgroundColor: 'var(--paper)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--display)' }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500, marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Manage Gigs</h2>
            <Link to="/dashboard/org/gigs/new" className="gig-action" style={{ textDecoration: 'none', fontSize: '13px', padding: '8px 16px' }}>+ Post Gig</Link>
          </div>

          {loading ? (
            <LoadingScreen message="Loading gigs..." fullScreen={false} />
          ) : filtered.length === 0 ? (
            <EmptyState 
              icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>}
              title={`No ${activeTab === 'all' ? '' : activeTab} gigs yet`}
              description="Post your first gig to start finding volunteers."
              actionButton={<Link to="/dashboard/org/gigs/new" style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: 'var(--purple-600)', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: 700, boxShadow: '0 4px 12px rgba(83,74,183,0.3)' }}>Post a Gig</Link>}
            />
          ) : (
            filtered.map(gig => (
              <div key={gig.id} className="gig-media-card">
                <div className="gig-media-cover" style={{ backgroundImage: `url(${gig.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=random&size=400`})`, height: 'auto', minHeight: '120px' }} />
                <div className="gig-media-body">
                  <div className="gig-media-header">
                    <div>
                      <h3 className="gig-media-title">{gig.title}</h3>
                      <div className="gig-media-org" style={{ gap: '12px', flexWrap: 'wrap' }}>
                        <span className="tag category" style={{ textTransform: 'capitalize' }}>{gig.type}</span>
                        <span style={{ fontSize: '13px', color: 'var(--body)' }}>
                          <strong style={{ color: 'var(--ink)' }}>{gig.applications?.length || 0}</strong> applicant{(gig.applications?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span className="tag status" style={{ backgroundColor: statusStyle[gig.status]?.bg || '#E4E1F5', color: statusStyle[gig.status]?.color || 'var(--body)' }}>
                        {statusStyle[gig.status]?.label || gig.status}
                      </span>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>Created {new Date(gig.date_start).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {gig.status === 'published' && (
                      <Link to={`/dashboard/org/gigs/${gig.id}/applicants`} className="gig-action" style={{ textDecoration: 'none', fontSize: '13px', padding: '8px 16px' }}>Review Applicants</Link>
                    )}
                    {gig.status === 'completed' && (
                      <Link to={`/dashboard/org/gigs/${gig.id}/certificates`} className="gig-action" style={{ textDecoration: 'none', fontSize: '13px', padding: '8px 16px' }}>Issue Certificates</Link>
                    )}
                    <Link to={`/dashboard/org/gigs/${gig.id}`} className="gig-action" style={{ background: 'none', border: '1.5px solid #E4E1F5', color: 'var(--body)', textDecoration: 'none', fontSize: '13px', padding: '8px 16px' }}>
                      {gig.status === 'draft' ? 'Continue Editing' : 'View Details'}
                    </Link>
                    {gig.status !== 'completed' && (
                      <button className="gig-action" style={{ background: 'none', border: '1.5px solid #fecaca', color: '#dc2626', fontSize: '13px', padding: '8px 16px' }}>
                        {gig.status === 'draft' ? 'Delete' : 'Close Gig'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ManageGigs;
