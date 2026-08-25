import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Globe } from 'lucide-react';

interface GigCardProps {
  gig: any;
  userRole?: 'volunteer' | 'organization'; // Default to volunteer context
  layout?: 'list' | 'grid'; // list = image on left (BrowseGigs), grid = image on top (Dashboard)
}

const GigCard: React.FC<GigCardProps> = ({ gig, userRole = 'volunteer', layout = 'list' }) => {
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.title)}&background=random&size=400`;
  const isGrid = layout === 'grid';
  
  const cardClass = isGrid ? "gig-media-card-horizontal" : "gig-media-card";
  const coverClass = isGrid ? "gig-media-cover-horizontal" : "gig-media-cover";
  const bodyClass = isGrid ? "gig-media-body-horizontal" : "gig-media-body";
  
  return (
    <div className={cardClass}>
      <div 
        className={coverClass} 
        style={{ 
          backgroundImage: `url(${gig.image_url || fallbackUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#F3F2F9'
        }} 
      />
      
      <div className={bodyClass} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="gig-media-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <h3 className="gig-media-title" style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--ink)' }}>
              {gig.title}
            </h3>
            
            {userRole === 'volunteer' && (
              <Link to={`/organization/${gig.organizations?.slug || gig.organization_id}`} className="gig-media-org" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(gig.organizations?.name || 'Org')}&background=random`} 
                  alt={gig.organizations?.name} 
                  style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                />
                <strong style={{ color: 'var(--purple-600)' }}>{gig.organizations?.name || 'Organization'}</strong>
                <span style={{ color: '#D1CEDF' }}>•</span>
                <span style={{ color: 'var(--body)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {gig.location === 'Remote' ? <><Globe size={14} /> Remote</> : <><MapPin size={14} /> {gig.location || 'Nigeria'}</>}
                </span>
              </Link>
            )}
          </div>
          
          {userRole === 'volunteer' && !isGrid && (
            <Link to={`/dashboard/volunteer/gigs/${gig.id}/apply`} className="gig-action">
              Apply Now
            </Link>
          )}
        </div>
        
        <p style={{ fontSize: '14px', color: 'var(--body)', margin: '0 0 20px 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'pre-wrap' }}>
          {gig.description}
        </p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
          <span className={`tag ${gig.type === 'skilled' ? 'skilled' : 'physical'}`}>
            {gig.type === 'skilled' ? 'Skilled' : 'Physical'}
          </span>
          {gig.location === 'Remote' && (
            <span className="tag physical">Remote</span>
          )}
          <span className="tag" style={{ backgroundColor: '#F3F2F9', color: 'var(--body)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {gig.date_start ? new Date(gig.date_start).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos", day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBD'}
          </span>
        </div>

        {gig.matchScore !== undefined && (
          <div style={{ marginTop: 'auto', marginBottom: '20px', padding: '16px', borderRadius: '12px', background: 'linear-gradient(145deg, var(--purple-50) 0%, rgba(255,255,255,0) 100%)', border: '1px solid #E4E1F5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--purple-100)', color: 'var(--purple-700)', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--purple-900)' }}>Top Match: {gig.matchScore}%</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {gig.locationFit && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--body)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" strokeWidth="3" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
                  Matches your location
                </div>
              )}
              {gig.openToAllSkills ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--body)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" strokeWidth="3" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
                  Open to all skill levels
                </div>
              ) : gig.matchedSkills && gig.matchedSkills.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--body)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" strokeWidth="3" style={{ marginTop: '2px', flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Matches your skills: <strong style={{ color: 'var(--ink)' }}>{gig.matchedSkills.join(', ')}</strong></span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--body)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" strokeWidth="3" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
                  Great for broad impact
                </div>
              )}
            </div>
          </div>
        )}
        
        {userRole === 'volunteer' && isGrid && (
          <div style={{ marginTop: 'auto', display: 'flex' }}>
            <Link 
              to={`/dashboard/volunteer/gigs/${gig.id}/apply`} 
              className="gig-action" 
              style={{ width: '100%' }}
            >
              Apply Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default GigCard;
