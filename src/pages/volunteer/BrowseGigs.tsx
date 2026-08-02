import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';

const BrowseGigs: React.FC = () => {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGigs = async () => {
      const { data } = await supabase
        .from('gigs')
        .select(`
          *,
          organizations (
            name
          )
        `)
        .eq('status', 'published')
        .order('date_start', { ascending: false });
        
      if (data) setGigs(data);
      setLoading(false);
    };

    fetchGigs();
  }, []);
  return (
    <>
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '16px', marginBottom: '24px' }}>Filters</h2>
            
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', color: 'var(--ink)', marginBottom: '12px', fontWeight: 600 }}>Gig Type</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '12px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', accentColor: 'var(--purple-600)' }} /> Skilled
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', accentColor: 'var(--purple-600)' }} /> Physical / Event
              </label>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', color: 'var(--ink)', marginBottom: '12px', fontWeight: 600 }}>Location</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '12px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--purple-600)' }} /> Remote
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '12px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--purple-600)' }} /> Ikeja
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--purple-600)' }} /> Victoria Island
              </label>
            </div>
            
            <div>
              <h3 style={{ fontSize: '14px', color: 'var(--ink)', marginBottom: '12px', fontWeight: 600 }}>Duration</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '12px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--purple-600)' }} /> 1 - 5 hours
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '12px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--purple-600)' }} /> 1 week+
              </label>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px 0' }}>Explore Opportunities</h1>
            <p style={{ fontSize: '14px', color: 'var(--body)', margin: 0 }}>Discover 34 open gigs that match your skills.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: 'var(--body)' }}>Sort by:</span>
            <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1CEDF', background: 'var(--white)', fontSize: '14px', color: 'var(--ink)', outline: 'none' }}>
              <option>Most Relevant</option>
              <option>Newest First</option>
              <option>Closing Soon</option>
            </select>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-padding" style={{ borderBottom: '1px solid #E4E1F5', backgroundColor: '#FAFAFC', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#A5A0C3' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input 
                type="text" 
                placeholder="Search gigs by title, skill, or organization..." 
                style={{ width: '100%', padding: '16px 20px 16px 48px', border: '1px solid #D1CEDF', borderRadius: '8px', fontSize: '15px', background: 'var(--white)', outline: 'none', boxShadow: '0 2px 4px rgba(38,33,92,0.02)' }} 
              />
            </div>
            <button style={{ padding: '16px 24px', backgroundColor: 'var(--purple-600)', color: 'var(--white)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Search
            </button>
          </div>

          {loading ? (
            <LoadingScreen message="Loading gigs..." fullScreen={false} />
          ) : gigs.length === 0 ? (
            <EmptyState 
              icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>}
              title="No Gigs Found"
              description="There are currently no open gigs that match your criteria. Please check back later or adjust your filters."
            />
          ) : (
            gigs.map(gig => (
              <div key={gig.id} className="gig-media-card">
                <div className="gig-media-cover" style={{ backgroundImage: 'url(/images/hero_illustration.png)' }}></div>
                <div className="gig-media-body">
                  <div className="gig-media-header">
                    <div>
                      <h3 className="gig-media-title">{gig.title}</h3>
                      <Link to="/dashboard/organization/profile" className="gig-media-org" style={{ textDecoration: 'none' }}>
                        <img src="/images/diverse_gigs.png" alt={gig.organizations?.name} />
                        <strong>{gig.organizations?.name || 'Organization'}</strong>
                        <span style={{ color: '#D1CEDF', margin: '0 4px' }}>•</span>
                        <span style={{ color: 'var(--body)' }}>{gig.location}</span>
                      </Link>
                    </div>
                    <Link to={`/dashboard/volunteer/gigs/${gig.id}/apply`} className="gig-action">Apply Now</Link>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--body)', margin: '0 0 16px 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {gig.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <div className="gig-tags" style={{ margin: 0 }}>
                      <span className={`tag ${gig.type === 'skilled' ? 'skilled' : 'physical'}`}>
                        {gig.type === 'skilled' ? 'Skilled' : 'Physical'}
                      </span>
                      {gig.type === 'physical' && <span className="tag physical">Event</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--body)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {gig.date_start ? new Date(gig.date_start).toLocaleDateString() : 'TBD'}
                    </div>
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

export default BrowseGigs;
