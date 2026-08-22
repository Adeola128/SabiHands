import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';

const NIGERIA_STATES = [
  'Remote', 'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti',
  'Enugu', 'FCT (Abuja)', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
  'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
  'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara',
];

const BrowseGigs: React.FC = () => {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string[]>(['skilled', 'physical']);
  const [locationFilter, setLocationFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const hasActiveFilters = locationFilter !== '' || dateFrom !== '' || dateTo !== '' || typeFilter.length < 2;

  const clearFilters = () => {
    setSearch('');
    setTypeFilter(['skilled', 'physical']);
    setLocationFilter('');
    setDateFrom('');
    setDateTo('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const filtered = gigs
    .filter(g => typeFilter.includes(g.type))
    .filter(g =>
      !locationFilter ||
      g.location?.toLowerCase().includes(locationFilter.toLowerCase())
    )
    .filter(g => {
      if (!dateFrom && !dateTo) return true;
      const gigDate = g.date_start ? new Date(g.date_start) : null;
      if (!gigDate) return false;
      if (dateFrom && gigDate < new Date(dateFrom)) return false;
      if (dateTo && gigDate > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    })
    .filter(g =>
      !search ||
      g.title?.toLowerCase().includes(search.toLowerCase()) ||
      g.description?.toLowerCase().includes(search.toLowerCase()) ||
      g.organizations?.name?.toLowerCase().includes(search.toLowerCase())
    );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'closing') return new Date(a.date_start || '9999').getTime() - new Date(b.date_start || '9999').getTime();
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginatedGigs = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, locationFilter, dateFrom, dateTo, sortBy]);

  const toggleType = (t: string) => setTypeFilter(prev =>
    prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
  );

  useEffect(() => {
    const fetchGigs = async () => {
      const { data } = await supabase
        .from('gigs')
        .select(`*, organizations(name, slug)`)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (data) setGigs(data);
      setLoading(false);
    };
    fetchGigs();
  }, []);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1.5px solid #E4E1F5', fontSize: '14px', color: 'var(--ink)',
    outline: 'none', fontFamily: 'var(--sans)', backgroundColor: 'var(--white)',
    transition: 'border-color 0.2s',
  };

  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">

            {/* Header + clear */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 className="dash-card-title" style={{ fontSize: '16px', margin: 0 }}>Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  style={{ fontSize: '13px', fontWeight: 600, color: 'var(--purple-600)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', transition: 'background 0.15s' }}
                  onMouseOver={e => (e.currentTarget.style.background = 'var(--purple-50)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'none')}
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Active filter badges */}
            {hasActiveFilters && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                {typeFilter.length < 2 && typeFilter.map(t => (
                  <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: 'var(--purple-50)', color: 'var(--purple-700)', borderRadius: '99px', fontSize: '12px', fontWeight: 600 }}>
                    {t === 'skilled' ? 'Skilled' : 'Physical'}
                    <button onClick={() => toggleType(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--purple-500)', lineHeight: 1, padding: 0 }}>×</button>
                  </span>
                ))}
                {locationFilter && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: 'var(--teal-50)', color: 'var(--teal-700)', borderRadius: '99px', fontSize: '12px', fontWeight: 600 }}>
                    📍 {locationFilter}
                    <button onClick={() => setLocationFilter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--teal-500)', lineHeight: 1, padding: 0 }}>×</button>
                  </span>
                )}
                {(dateFrom || dateTo) && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: '#FFF8E7', color: '#92640A', borderRadius: '99px', fontSize: '12px', fontWeight: 600 }}>
                    📅 {dateFrom || '…'} → {dateTo || '…'}
                    <button onClick={() => { setDateFrom(''); setDateTo(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B7791F', lineHeight: 1, padding: 0 }}>×</button>
                  </span>
                )}
              </div>
            )}

            {/* Gig Type */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '13px', color: 'var(--ink)', marginBottom: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gig Type</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={typeFilter.includes('skilled')} onChange={() => toggleType('skilled')} style={{ width: '16px', height: '16px', accentColor: 'var(--purple-600)' }} /> Skilled Volunteer
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" checked={typeFilter.includes('physical')} onChange={() => toggleType('physical')} style={{ width: '16px', height: '16px', accentColor: 'var(--purple-600)' }} /> Physical / Event
              </label>
            </div>

            {/* Location — All of Nigeria */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '13px', color: 'var(--ink)', marginBottom: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</h3>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#A5A0C3', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <select
                  value={locationFilter}
                  onChange={e => setLocationFilter(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '34px', appearance: 'none', cursor: 'pointer', color: locationFilter ? 'var(--ink)' : 'var(--muted)' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--purple-400)')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#E4E1F5')}
                >
                  <option value="">All of Nigeria</option>
                  {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Date Range */}
            <div style={{ marginBottom: '8px' }}>
              <h3 style={{ fontSize: '13px', color: 'var(--ink)', marginBottom: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Range</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--purple-400)')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#E4E1F5')}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>To</label>
                  <input
                    type="date"
                    value={dateTo}
                    min={dateFrom}
                    onChange={e => setDateTo(e.target.value)}
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--purple-400)')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#E4E1F5')}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px 0' }}>Explore Opportunities</h1>
            <p style={{ fontSize: '14px', color: 'var(--body)', margin: 0 }}>
              {loading ? 'Loading...' : `${sorted.length} open gig${sorted.length !== 1 ? 's' : ''} across Nigeria`}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: 'var(--body)' }}>Sort by:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1CEDF', background: 'var(--white)', fontSize: '14px', color: 'var(--ink)', outline: 'none', cursor: 'pointer' }}>
              <option value="newest">Newest First</option>
              <option value="closing">Closing Soon</option>
            </select>
          </div>
        </div>

        <div className="dash-card">
          {/* Search bar */}
          <div className="dash-card-padding" style={{ borderBottom: '1px solid #E4E1F5', backgroundColor: '#FAFAFC', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#A5A0C3' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, skill, or organization..."
                style={{ width: '100%', padding: '14px 20px 14px 48px', border: '1px solid #D1CEDF', borderRadius: '8px', fontSize: '15px', background: 'var(--white)', outline: 'none' }}
              />
            </div>
            {search && (
              <button onClick={() => setSearch('')} style={{ padding: '14px 16px', background: '#F3F2F9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'var(--body)', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}>
                Clear
              </button>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <LoadingScreen message="Loading gigs across Nigeria..." fullScreen={false} />
          ) : sorted.length === 0 ? (
            <EmptyState
              icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>}
              title="No Gigs Found"
              description={
                hasActiveFilters || search
                  ? "No gigs match your current filters. Try clearing some filters or broadening your search."
                  : "There are no open gigs at the moment. Check back soon!"
              }
              actionButton={
                hasActiveFilters || search ? (
                  <button onClick={clearFilters} style={{ padding: '12px 24px', backgroundColor: 'var(--purple-600)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(83,74,183,0.3)' }}>
                    Clear All Filters
                  </button>
                ) : undefined
              }
            />
          ) : (
            <>
              {paginatedGigs.map(gig => (
                <div key={gig.id} className="gig-media-card">
                <div className="gig-media-cover" style={{ backgroundImage: `url(${gig.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=random&size=400`})` }} />
                <div className="gig-media-body">
                  <div className="gig-media-header">
                    <div>
                      <h3 className="gig-media-title">{gig.title}</h3>
                      <Link to={`/organization/${gig.organizations?.slug || gig.organization_id}`} className="gig-media-org" style={{ textDecoration: 'none' }}>
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(gig.organizations?.name || 'Org')}&background=random`} alt={gig.organizations?.name} />
                        <strong>{gig.organizations?.name || 'Organization'}</strong>
                        <span style={{ color: '#D1CEDF', margin: '0 4px' }}>•</span>
                        <span style={{ color: 'var(--body)' }}>
                          {gig.location === 'Remote' ? '🌐 Remote' : `📍 ${gig.location || 'Nigeria'}`}
                        </span>
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
                      {gig.location === 'Remote' && <span className="tag physical">Remote</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--body)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {gig.date_start ? new Date(gig.date_start).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBD'}
                    </div>
                  </div>
                </div>
                </div>
              ))}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid #E4E1F5', backgroundColor: '#FAFAFC', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sorted.length)} of {sorted.length} gigs
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{ padding: '8px 12px', border: '1px solid #D1CEDF', background: 'var(--white)', borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, color: 'var(--ink)' }}
                    >
                      Previous
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          style={{ width: '32px', height: '32px', border: 'none', background: currentPage === page ? 'var(--purple-600)' : 'transparent', color: currentPage === page ? 'white' : 'var(--ink)', borderRadius: '8px', cursor: 'pointer', fontWeight: currentPage === page ? 600 : 400 }}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{ padding: '8px 12px', border: '1px solid #D1CEDF', background: 'var(--white)', borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, color: 'var(--ink)' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BrowseGigs;
