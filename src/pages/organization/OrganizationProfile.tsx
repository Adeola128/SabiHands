import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useProfileCompleteness } from '../../hooks/useProfileCompleteness';
import { uploadImage } from '../../lib/uploadImage';
import ProfileCompletenessPrompt from '../../components/ProfileCompletenessPrompt';
import LoadingScreen from '../../components/LoadingScreen';
import './OrganizationProfile.css';

const OrganizationProfile: React.FC = () => {
  const { user } = useAuth();
  const [org, setOrg] = useState<any>(null);
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ volunteers: 0, gigs: 0, followers: 0 });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchOrg = async () => {
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (data) {
        setOrg(data);
        
        // Fetch all gigs to get total count
        const { count: totalGigs } = await supabase
          .from('gigs')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', data.id);
          
        let volunteersCount = 0;
        
        if (totalGigs && totalGigs > 0) {
          const { data: appsData } = await supabase
            .from('applications')
            .select('volunteer_id, gigs!inner(organization_id)')
            .eq('gigs.organization_id', data.id)
            .in('status', ['accepted', 'completed', 'certified']);
            
          if (appsData) {
            volunteersCount = new Set(appsData.map(a => a.volunteer_id)).size;
          }
        }
        
        const { count: followersCount } = await supabase
          .from('organization_followers')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', data.id);
        
        setStats({ volunteers: volunteersCount, gigs: totalGigs || 0, followers: followersCount || 0 });
        
        const { data: gigsData } = await supabase
          .from('gigs')
          .select('*')
          .eq('organization_id', data.id)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (gigsData) setGigs(gigsData);
      } else {
        setOrg({
          name: user.user_metadata?.full_name || 'New Organization',
        });
      }
      setLoading(false);
    };

    fetchOrg();
  }, [user]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    setUploadingLogo(true);
    try {
      const url = await uploadImage(e.target.files[0], 'org-logos');
      const { error } = await supabase.from('organizations').update({ logo_url: url }).eq('user_id', user.id);
      if (!error) setOrg((prev: any) => ({ ...prev, logo_url: url }));
    } catch (err: any) {
      console.error(err);
      alert('Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    setUploadingCover(true);
    try {
      const url = await uploadImage(e.target.files[0], 'org-covers');
      const { error } = await supabase.from('organizations').update({ cover_url: url }).eq('user_id', user.id);
      if (!error) setOrg((prev: any) => ({ ...prev, cover_url: url }));
    } catch (err: any) {
      console.error(err);
      alert('Failed to upload cover picture.');
    } finally {
      setUploadingCover(false);
    }
  };

  const completeness = useProfileCompleteness(org, 'organization');
  const [activeTab, setActiveTab] = useState<'home' | 'roles' | 'analytics'>('home');

  if (loading) return <LoadingScreen message="Loading profile..." fullScreen={false} />;

  const initials = org?.name?.substring(0, 2).toUpperCase() || 'OG';

  return (
    <div className="modern-profile-container">
      
      {/* ── PROFILE COMPLETENESS PROMPT ── */}
      <ProfileCompletenessPrompt 
        score={completeness.score} 
        nextStep={completeness.nextStep || null} 
        editLink="/dashboard/org/settings" 
      />

      {/* ── HERO SECTION ── */}
      <div className="public-hero-card">
        {/* Cover Photo Area */}
        <div className="public-cover-area" style={{ backgroundImage: org?.cover_url ? `url(${org.cover_url})` : undefined }}>
          {uploadingCover && <div className="uploading-overlay">Uploading...</div>}
          <label className="image-edit-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            <span>Edit Cover</span>
            <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={uploadingCover} hidden />
          </label>
        </div>
        
        {/* Body Content */}
        <div className="public-hero-body">
          <div className="public-avatar-wrapper">
            {org?.logo_url ? (
              <img src={org.logo_url} alt={org.name} className="public-avatar-img" />
            ) : (
              <div className="public-avatar-placeholder">{initials}</div>
            )}
            
            {org?.verification_status === 'verified' && (
              <div className="profile-verified-badge" title="Verified NGO" style={{ position: 'absolute', bottom: '8px', right: '8px', width: '28px', height: '28px', backgroundColor: 'var(--teal-500)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white', zIndex: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10" stroke="white" strokeWidth="2" fill="none"></polyline></svg>
              </div>
            )}
            
            <label className="avatar-edit-overlay">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ marginBottom: '4px' }}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              <span>{uploadingLogo ? '...' : 'Upload Logo'}</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} hidden />
            </label>
          </div>
          
          <div className="public-header-details">
            <div>
              <h1 className="public-org-name">
                {org?.name || 'Unnamed Organization'}
              </h1>
              <div className="public-org-headline">
                {org?.bio ? org.bio.substring(0, 150) + (org.bio.length > 150 ? '...' : '') : 'Add a brief bio about your organization.'}
              </div>
              
              <div className="public-org-meta">
                {org?.org_type && <span>{org.org_type}</span>}
                {org?.location && (
                  <>
                    <span className="public-meta-dot">•</span>
                    <span>{org.location}, NG</span>
                  </>
                )}
                <span className="public-meta-dot">•</span>
                <span style={{ fontWeight: 600, color: 'rgba(0,0,0,0.9)' }}>{(stats as any).followers || 0} followers</span>
              </div>

              <div className="public-hero-actions">
                <Link to="/dashboard/org/settings" className="btn-li-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  Edit Page Details
                </Link>
                {org?.slug && (
                  <Link to={`/org/${org.slug}`} className="btn-li-secondary">
                    View Public Profile
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="public-tabs-nav">
          <button className={`public-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>Overview</button>
          <button className={`public-tab ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveTab('roles')}>Manage Roles</button>
          <button className={`public-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</button>
        </div>
      </div>

      {/* ── CONTENT GRID ── */}
      <div className="public-layout-grid">
        
        {/* LEFT COLUMN: Main Content */}
        <div>
          {/* Dashboard Overview */}
          {activeTab === 'home' && (
            <div className="li-card">
              <h3>Dashboard Overview</h3>
              <p className="bento-about-text" style={{ marginBottom: '24px' }}>Welcome back. Manage your opportunities and review applications below.</p>
              
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <Link to="/dashboard/org/gigs/new" className="btn-li-primary">Post a new Role</Link>
                <button className="btn-li-secondary" onClick={() => setActiveTab('roles')}>Manage Existing</button>
              </div>
            </div>
          )}

          {/* Manage Roles (Feed Style) */}
          {(activeTab === 'home' || activeTab === 'roles') && (
            <div>
              {gigs.length === 0 ? (
                <div className="li-card">
                  <p className="bento-about-text">You haven't posted any roles yet.</p>
                </div>
              ) : (
                gigs.map(gig => (
                  <div key={gig.id} className="li-post-card">
                    <div className="li-post-header">
                      <img src={org?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(org?.name || 'O')}`} alt={org?.name} className="li-post-logo" />
                      <div className="li-post-meta">
                        <strong>{org?.name}</strong>
                        <span>{org?.location || 'Nigeria'}</span>
                        <span>Posted {new Date(gig.created_at).toLocaleDateString()}</span>
                      </div>
                      <div style={{ marginLeft: 'auto' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 8px', borderRadius: '4px', backgroundColor: gig.status === 'published' ? '#E6F4EA' : '#FCE8E6', color: gig.status === 'published' ? '#137333' : '#C5221F' }}>
                          {gig.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="li-post-body">
                      <p style={{ marginBottom: '8px' }}>We are looking for volunteers for: <strong>{gig.title}</strong></p>
                      <p>{gig.description ? gig.description.substring(0, 200) + '...' : 'Manage applicants for this role.'}</p>
                    </div>
                    
                    {gig.image_url ? (
                      <img src={gig.image_url} alt={gig.title} className="li-post-image" />
                    ) : (
                      <div className="li-post-image" style={{ backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.4)', fontSize: '24px', fontWeight: 600 }}>
                        <span style={{ padding: '24px', textAlign: 'center' }}>{gig.title}</span>
                      </div>
                    )}

                    <div className="li-post-footer">
                      <Link to={`/dashboard/org/gigs/${gig.id}`} className="li-post-action-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        Applicants
                      </Link>
                      <Link to={`/dashboard/org/gigs/${gig.id}/edit`} className="li-post-action-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Edit
                      </Link>
                      {gig.slug && (
                        <a href={`/gig/${gig.slug}`} target="_blank" rel="noopener noreferrer" className="li-post-action-btn">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                          Share
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="li-card">
              <h3>Page Analytics</h3>
              <p className="bento-about-text">Monitor your organization's impact and reach on Ralvo.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '24px' }}>
                <div style={{ padding: '24px', border: '1px solid #EBEBEB', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#0a66c2' }}>{stats.gigs}</div>
                  <div style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)' }}>Total Roles Posted</div>
                </div>
                <div style={{ padding: '24px', border: '1px solid #EBEBEB', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#01754f' }}>{stats.volunteers}</div>
                  <div style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)' }}>Total Volunteers Reached</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sidebar (Admin Widgets) */}
        <div>
          <div className="li-card" style={{ position: 'sticky', top: '24px' }}>
            <h3>Admin Tools</h3>
            
            <div className="li-sidebar-list">
              <div className="li-sidebar-item">
                <span className="li-sidebar-label">Profile Settings</span>
                <span className="li-sidebar-value">
                  <Link to="/dashboard/org/settings" className="li-sidebar-link">Update your organization info</Link>
                </span>
              </div>
              
              <div className="li-sidebar-item">
                <span className="li-sidebar-label">Team Members</span>
                <span className="li-sidebar-value">
                  <Link to="/dashboard/org/settings#team" className="li-sidebar-link">Manage access</Link>
                </span>
              </div>

              <div className="li-sidebar-item" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #EBEBEB' }}>
                <span className="li-sidebar-label">Need Help?</span>
                <span className="li-sidebar-value">
                  Contact support for assistance with managing your roles or volunteers.
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrganizationProfile;
