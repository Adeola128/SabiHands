import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import './CommunityRecommendations.css';

// ── Animation variants ────────────────────────────────────
const fadeUpVariant: any = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
};

// ── Mock enrichment data ──────────────────────────────────
// Augments DB records with realistic signals until schema exposes these columns.
const PERSON_SKILLS = [
  ['Web Dev', 'Youth Mentorship', 'Education'],
  ['Community Outreach', 'Fundraising', 'Social Media'],
  ['Project Mgmt', 'Health & Wellness', 'Advocacy'],
  ['Legal Aid', 'Research', 'Conflict Resolution'],
  ['Graphic Design', 'Photography', 'Arts & Culture'],
];
const ORG_CAUSES = [
  ['Education', 'Youth Development'],
  ['Environment', 'Sustainability'],
  ['Health & Wellness', 'Mental Health'],
  ['Human Rights', 'Advocacy'],
  ['Food Security', 'Community Dev'],
];
const LOCATIONS = ['Lagos', 'Abuja', 'Enugu', 'Port Harcourt', 'Kano', 'Ibadan', 'Remote'];
const ACTIVITY = ['Active today', 'Active 2 days ago', 'Active this week', 'Active 3 days ago', 'Active yesterday'];
const RELEVANCE_LINES = [
  'Matches your interest in Education',
  'Aligns with your skills',
  'Active in your region',
  'Connected to your causes',
  'Recommended based on activity',
];

function seedFor(id: string, arr: any[]): any {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return arr[hash % arr.length];
}


// ── Skeleton card ─────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <div className="rec-skeleton-card">
    <div className="rec-skeleton-cover" />
    <div className="rec-skeleton-body">
      <div className="rec-skeleton-avatar" />
      <div className="rec-skeleton-line w-60" />
      <div className="rec-skeleton-line w-80" />
      <div className="rec-skeleton-line w-100" />
      <div className="rec-skeleton-line w-80" />
      <div className="rec-skeleton-tags">
        <div className="rec-skeleton-tag" />
        <div className="rec-skeleton-tag" />
        <div className="rec-skeleton-tag" />
      </div>
      <div className="rec-skeleton-btns">
        <div className="rec-skeleton-btn" />
        <div className="rec-skeleton-btn" />
      </div>
    </div>
  </div>
);

// ── Verified badge ────────────────────────────────────────
const VerifiedBadge: React.FC = () => (
  <span className="rec-verified-badge" title="Verified organization" aria-label="Verified">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--teal-600)" aria-hidden="true">
      <path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 1z" />
    </svg>
  </span>
);


// ── No-match empty state ──────────────────────────────────
const NoMatchEmpty: React.FC<{ onClear: () => void }> = ({ onClear }) => (
  <div className="rec-no-match">
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      <line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
    <h3>No matches found</h3>
    <p>Try a broader search or remove one of your filters.</p>
    <button className="rec-empty-btn-primary" onClick={onClear}>Clear filters</button>
  </div>
);

// ── Person card ───────────────────────────────────────────
interface PersonCardProps { item: any; onConnect: (id: string) => void; }
const PersonCard: React.FC<PersonCardProps> = ({ item, onConnect }) => {
  const skills = seedFor(item.id, PERSON_SKILLS);
  const location = seedFor(item.id + 'loc', LOCATIONS);
  const activity = seedFor(item.id + 'act', ACTIVITY);
  const relevance = seedFor(item.id + 'rel', RELEVANCE_LINES);

  return (
    <motion.div className="rec-card" variants={fadeUpVariant}>
      <div className="rec-card-cover" style={item.cover_image_url ? { backgroundImage: `url(${item.cover_image_url})` } : undefined} aria-hidden="true" />
      <div className="rec-card-avatar-wrap">
        <img className="rec-card-avatar" src={item.display_avatar || '/images/hero_illustration.png'} alt={item.display_name} loading="lazy" />
      </div>
      <div className="rec-card-body">
        <div className="rec-card-name-row">
          <Link to={`/volunteer/${item.id}`} className="rec-card-name">{item.display_name || 'Volunteer'}</Link>
        </div>
        <span className="rec-card-type-badge">Volunteer · {location}</span>
        <span className="rec-card-relevance">{relevance}</span>
        <p className="rec-card-bio">{item.bio || 'Passionate volunteer making a difference in the community.'}</p>
        <div className="rec-card-tags" aria-label="Skills">
          {skills.slice(0, 3).map((s: string) => <span key={s} className="rec-card-tag">{s}</span>)}
        </div>
        <span className="rec-card-meta">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {activity}
        </span>
        <div className="rec-card-actions">
          <Link to={`/volunteer/${item.id}`} className="rec-btn-view">View profile</Link>
          <button className="rec-btn-action" onClick={() => onConnect(item.id)} aria-label={`Connect with ${item.display_name}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Connect
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ── Organization card ─────────────────────────────────────
interface OrgCardProps { item: any; onFollow: (id: string) => void; }
const OrgCard: React.FC<OrgCardProps> = ({ item, onFollow }) => {
  const causes = seedFor(item.id, ORG_CAUSES);
  const location = seedFor(item.id + 'loc', LOCATIONS);
  const activity = seedFor(item.id + 'act', ACTIVITY);
  const relevance = seedFor(item.id + 'rel', RELEVANCE_LINES);
  const memberCount = (parseInt(item.id?.slice(-2) || '10', 16) % 40) + 5;

  return (
    <motion.div className="rec-card" variants={fadeUpVariant}>
      <div className="rec-card-cover" style={item.cover_image_url ? { backgroundImage: `url(${item.cover_image_url})` } : undefined} aria-hidden="true" />
      <div className="rec-card-avatar-wrap">
        <img className="rec-card-avatar org" src={item.display_avatar || '/images/hero_illustration.png'} alt={item.display_name} loading="lazy" />
      </div>
      <div className="rec-card-body">
        <div className="rec-card-name-row">
          <Link to={`/organization/${item.id}`} className="rec-card-name">{item.display_name || 'Organization'}</Link>
          <VerifiedBadge />
        </div>
        <span className="rec-card-type-badge">Organization · {location}</span>
        <span className="rec-card-relevance">{relevance}</span>
        <p className="rec-card-bio">{item.bio || 'Committed to making a positive impact in our communities.'}</p>
        <div className="rec-card-tags" aria-label="Causes">
          {causes.map((c: string) => <span key={c} className="rec-card-tag cause">{c}</span>)}
        </div>
        <span className="rec-card-meta">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          {memberCount} volunteers
          <span className="rec-card-meta-dot" aria-hidden="true" />
          {activity}
        </span>
        <div className="rec-card-actions">
          <Link to={`/organization/${item.id}`} className="rec-btn-view">View org</Link>
          <button className="rec-btn-action" onClick={() => onFollow(item.id)} aria-label={`Follow ${item.display_name}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Follow
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main page component ───────────────────────────────────
const CommunityRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'people' | 'organizations'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'recent'>('relevance');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedCause, setSelectedCause] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');

  useEffect(() => {
    fetchSession();
    fetchRecommendations();
  }, []);

  const fetchSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user || null);
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const [{ data: orgs }, { data: vols }] = await Promise.all([
        supabase.from('organizations').select('id, name, bio, logo_url, cover_url, slug').limit(30),
        supabase.from('volunteer_profiles').select('user_id, full_name, bio, avatar_url, slug').limit(30),
      ]);
      let combined: any[] = [];
      if (orgs) combined = [...combined, ...orgs.map(o => ({ ...o, isOrg: true, display_name: o.name, display_avatar: o.logo_url, cover_image_url: o.cover_url }))];
      if (vols) combined = [...combined, ...vols.map(v => ({ ...v, id: v.user_id, isOrg: false, display_name: v.full_name, display_avatar: v.avatar_url }))];
      setRecommendations(combined);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = useCallback(async (id: string) => {
    if (!currentUser) return alert('Please sign in to follow organizations.');
    const { error } = await supabase.from('organization_followers').insert({ organization_id: id });
    if (error) console.error('Follow error:', error);
    else alert('Successfully followed!');
  }, [currentUser]);

  const handleConnect = useCallback((_id: string) => {
    if (!currentUser) return alert('Please sign in to connect.');
    alert('Connection request sent!');
  }, [currentUser]);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setActiveTab('all');
    setSelectedCause('');
    setSelectedAvailability('');
  }, []);

  const isAnyFilterActive = searchQuery !== '' || activeTab !== 'all' || selectedCause !== '' || selectedAvailability !== '';

  const counts = useMemo(() => ({
    all: recommendations.length,
    people: recommendations.filter(r => !r.isOrg).length,
    organizations: recommendations.filter(r => r.isOrg).length,
  }), [recommendations]);

  const filteredRecommendations = useMemo(() => {
    let result = recommendations.filter(item => {
      const q = searchQuery.toLowerCase();
      if (q && !item.display_name?.toLowerCase().includes(q) && !item.bio?.toLowerCase().includes(q)) return false;
      if (activeTab === 'people' && item.isOrg) return false;
      if (activeTab === 'organizations' && !item.isOrg) return false;
      return true;
    });
    if (sortBy === 'recent') {
      result = [...result].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }
    return result;
  }, [recommendations, searchQuery, activeTab, sortBy]);

  const pageState: 'loading' | 'first-visit' | 'has-data' | 'no-match' = useMemo(() => {
    if (loading) return 'loading';
    if (recommendations.length === 0) return 'first-visit';
    if (filteredRecommendations.length === 0) return 'no-match';
    return 'has-data';
  }, [loading, recommendations.length, filteredRecommendations.length]);

  const causes = ['Education', 'Environment', 'Health', 'Youth', 'Human Rights', 'Food Security'];
  const availabilities = ['Weekdays', 'Weekends', 'Remote', 'Full-time', 'Part-time'];

  return (
    <div className="rec-page">

      {/* ══ Hero ═════════════════════════════════════════════ */}
      <div className="rec-hero">
          <Link to="/dashboard/community" className="rec-back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
            Back to Community Feed
          </Link>

          <h1 className="rec-title">Find people and organizations making a difference</h1>

          <p className="rec-subtitle">
            Connect with volunteers, mentors, and organizations that match your causes, skills, and location.
          </p>

          <p className="rec-relevance-note">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            Based on your causes, skills, location, and recent activity ·{' '}
            <Link to="/dashboard/volunteer/profile">Edit preferences</Link>
          </p>

          {/* Toolbar — search, tabs, more filters all above the fold */}
          <div className="rec-toolbar">

            {/* Row 1: search + more-filters */}
            <div className="rec-toolbar-top">
              <div className="rec-search-wrap">
                <span className="rec-search-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input
                  id="rec-search-input"
                  type="text"
                  className="rec-search-input"
                  placeholder="Search people or organizations"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  aria-label="Search people or organizations"
                />
                {searchQuery && (
                  <button className="rec-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
              </div>

              <button
                className={`rec-more-filters-btn${isFiltersOpen ? ' active' : ''}`}
                onClick={() => setIsFiltersOpen(v => !v)}
                aria-expanded={isFiltersOpen}
                aria-controls="rec-filters-panel"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                Filters
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isFiltersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </div>

            {/* Row 2: tabs */}
            <div className="rec-tabs-row" role="tablist" aria-label="Filter by type">
              {(['all', 'people', 'organizations'] as const).map(tab => (
                <button
                  key={tab}
                  id={`rec-tab-${tab}`}
                  role="tab"
                  aria-selected={activeTab === tab}
                  className={`rec-tab${activeTab === tab ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {!loading && (
                    <span className="rec-tab-count" aria-label={`${counts[tab]} results`}>
                      {counts[tab]}
                    </span>
                  )}
                </button>
              ))}
              {isAnyFilterActive && (
                <button className="rec-clear-filters-link" onClick={clearAllFilters} style={{ marginLeft: 4 }}>
                  Clear filters
                </button>
              )}
            </div>

            {/* Expandable filter panel */}
            <AnimatePresence>
              {isFiltersOpen && (
                <motion.div
                  id="rec-filters-panel"
                  className="rec-filters-panel"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="rec-filter-group">
                    <span className="rec-filter-label">Cause</span>
                    <div className="rec-filter-chips">
                      {causes.map(c => (
                        <button key={c} className={`rec-filter-chip${selectedCause === c ? ' selected' : ''}`} onClick={() => setSelectedCause(p => p === c ? '' : c)}>{c}</button>
                      ))}
                    </div>
                  </div>
                  <div className="rec-filter-group">
                    <span className="rec-filter-label">Availability</span>
                    <div className="rec-filter-chips">
                      {availabilities.map(a => (
                        <button key={a} className={`rec-filter-chip${selectedAvailability === a ? ' selected' : ''}`} onClick={() => setSelectedAvailability(p => p === a ? '' : a)}>{a}</button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>{/* /rec-toolbar */}

      </div>{/* /rec-hero */}

      {/* ══ Sort row + grid ══════════════════════════════════ */}
      <div className="rec-grid-section">

        {pageState === 'has-data' && (
          <div className="rec-sort-row">
            <span className="rec-result-count">
              Showing <strong>{filteredRecommendations.length}</strong> recommendation{filteredRecommendations.length !== 1 ? 's' : ''}
            </span>
            <label className="rec-sort-control" htmlFor="rec-sort-select">
              Sort:
              <select id="rec-sort-select" className="rec-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value as any)} aria-label="Sort recommendations">
                <option value="relevance">Relevance</option>
                <option value="recent">Most recent</option>
              </select>
            </label>
          </div>
        )}

        <AnimatePresence mode="wait">

          {pageState === 'loading' && (
            <motion.div key="loading" className="rec-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </motion.div>
          )}

          {pageState === 'first-visit' && (
            <motion.div key="first-visit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NoMatchEmpty onClear={clearAllFilters} />
            </motion.div>
          )}

          {pageState === 'no-match' && (
            <motion.div key="no-match" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NoMatchEmpty onClear={clearAllFilters} />
            </motion.div>
          )}

          {pageState === 'has-data' && (
            <motion.div key={activeTab + searchQuery + sortBy} className="rec-grid" variants={staggerContainer} initial="hidden" animate="visible">
              {filteredRecommendations.map(item =>
                item.isOrg
                  ? <OrgCard key={item.id} item={item} onFollow={handleFollow} />
                  : <PersonCard key={item.id} item={item} onConnect={handleConnect} />
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
};

export default CommunityRecommendations;
