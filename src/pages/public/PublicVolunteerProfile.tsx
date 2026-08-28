import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';
import { useAuth } from '../../contexts/AuthContext';
import InviteToGigModal from '../../components/InviteToGigModal';

const PublicVolunteerProfile: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({ hours: 0, completed: 0, rating: 0.0 });
  const [certificates, setCertificates] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
  const [showAllExperiences, setShowAllExperiences] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Find profile by slug or UUID (fallback for old URLs)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
        
        let query = supabase.from('volunteer_profiles').select('*');
        
        if (isUUID) {
           query = query.eq('user_id', slug);
        } else {
           query = query.eq('slug', slug);
        }
        
        const { data: profileData, error: profileError } = await query.single();

        if (profileError || !profileData) {
          throw new Error(profileError?.message || 'Profile not found');
        }

        setProfile(profileData);
        const actualId = profileData.user_id;

        // Fetch reviews
        const { data: ratingData } = await supabase
          .from('reviews')
          .select(`
            id,
            rating,
            comment,
            created_at,
            gigs(
              title,
              organizations(name, logo_url)
            )
          `)
          .eq('reviewee_id', actualId)
          .order('created_at', { ascending: false });
          
        let avgRating = 0;
        if (ratingData && ratingData.length > 0) {
          avgRating = ratingData.reduce((acc, curr) => acc + curr.rating, 0) / ratingData.length;
          setReviews(ratingData);
        }

        // Fetch completed gigs for experience
        const { data: applications } = await supabase
          .from('applications')
          .select(`
            id, 
            status, 
            created_at,
            gigs(
              id,
              title, 
              hours_required, 
              organizations(name, logo_url)
            )
          `)
          .eq('volunteer_id', actualId)
          .in('status', ['accepted', 'completed', 'certified'])
          .order('created_at', { ascending: false });

        let completed = 0;
        if (applications) {
          completed = applications.length;
          setExperiences(applications);
        }

        const { data: certs } = await supabase
          .from('certificates')
          .select('*, attendance(hours)')
          .eq('volunteer_id', actualId)
          .order('issued_at', { ascending: false });
          
        let totalHours = 0;
        if (certs) {
          setCertificates(certs);
          totalHours = certs.reduce((acc, curr: any) => acc + (curr.attendance?.hours || 0), 0);
        }
        
        setStats({ hours: totalHours, completed, rating: avgRating });

      } catch (err: any) {
        console.error('Error fetching profile:', err);
        if (err?.code === 'PGRST116') {
          setError('Volunteer profile not found.');
        } else {
          setError(err.message || 'Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [slug]);

  if (loading) return <LoadingScreen />;

  if (error || !profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1EFFB' }}>
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: 'var(--ink)' }}>{error || 'Profile not found'}</h2>
          <Link to="/" style={{ color: 'var(--purple-600)', fontWeight: 600, textDecoration: 'none', marginTop: '16px', display: 'inline-block' }}>Return Home</Link>
        </div>
      </div>
    );
  }

  const initials = profile?.full_name?.substring(0, 2).toUpperCase() || 'VO';
  
  let parsedSkills: string[] = [];
  if (Array.isArray(profile?.skills)) {
    parsedSkills = profile.skills;
  } else if (typeof profile?.skills === 'string') {
    if (profile.skills.trim().startsWith('[')) {
      try { parsedSkills = JSON.parse(profile.skills); } catch (e) { parsedSkills = profile.skills.replace(/^\{|\}$/g, '').split(',').map((s:string) => s.trim().replace(/^"|"$/g, '')).filter(Boolean); }
    } else {
      parsedSkills = profile.skills.replace(/^\{|\}$/g, '').split(',').map((s:string) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
    }
  }
  const hasSkills = parsedSkills.length > 0;
  
  const displayedExperiences = showAllExperiences ? experiences : experiences.slice(0, 3);
  const hiddenSections = profile.hidden_sections || [];
  const isVisible = (sectionId: string) => !hiddenSections.includes(sectionId);

  const renderContactModal = () => {
    if (!isContactModalOpen) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setIsContactModalOpen(false)}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '500px', margin: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #EBEBEB', paddingBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'var(--ink)' }}>{profile?.full_name}</h2>
            <button onClick={() => setIsContactModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {profile.users?.email && (
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purple-600)" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  Email
                </h3>
                <a href={`mailto:${profile.users.email}`} style={{ color: '#0a66c2', textDecoration: 'none', fontSize: '14px' }}>{profile.users.email}</a>
              </div>
            )}
            
            {profile?.phone_number && (
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purple-600)" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                  Phone
                </h3>
                <a href={`tel:${profile.phone_number}`} style={{ color: '#0a66c2', textDecoration: 'none', fontSize: '14px' }}>{profile.phone_number}</a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderConversionModal = () => {
    if (!isConversionModalOpen) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setIsConversionModalOpen(false)}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '420px', margin: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
          <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--purple-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', color: 'var(--purple-600)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
          </div>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>Ready to recruit top talent?</h2>
          <p style={{ color: 'var(--body)', margin: '0 0 24px 0', fontSize: '15px', lineHeight: 1.5 }}>You need to be registered as an organization to invite volunteers to your gigs.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => navigate('/signup?type=organization')} style={{ padding: '12px', backgroundColor: 'var(--blue-600)', color: 'white', borderRadius: '100px', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '15px' }}>
              Sign up as Organization
            </button>
            <button onClick={() => navigate('/login')} style={{ padding: '12px', backgroundColor: 'transparent', color: 'var(--blue-600)', borderRadius: '100px', fontWeight: 600, border: '1px solid var(--blue-600)', cursor: 'pointer', fontSize: '15px' }}>
              Log in to existing account
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleInviteClick = () => {
    if (!user) {
      setIsConversionModalOpen(true);
    } else if (user.user_metadata?.role === 'organization') {
      setIsInviteModalOpen(true);
    } else {
      setIsConversionModalOpen(true);
    }
  };

  return (
    <div style={{ backgroundColor: '#F3F2EF', minHeight: '100vh', paddingBottom: '80px', paddingTop: '24px' }}>
      <Helmet>
        <title>{profile?.full_name || 'Volunteer'} &mdash; Ralvo</title>
        <meta name="description" content={`View the volunteer profile and impact of ${profile?.full_name || 'this volunteer'} on Ralvo.`} />
      </Helmet>
      
      {renderContactModal()}
      {renderConversionModal()}
      <InviteToGigModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        volunteerId={profile?.user_id} 
        volunteerName={profile?.full_name} 
      />

      <div className="linkedin-layout-grid">
        
        {/* ── MAIN CONTENT (LEFT COLUMN) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* 1. TOP PROFILE CARD */}
          <div className="linkedin-card" style={{ padding: 0 }}>
            <div style={{ 
              height: '200px', 
              width: '100%', 
              backgroundColor: '#A0B4B7',
              backgroundImage: profile?.cover_url ? `url(${profile.cover_url})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '12px 12px 0 0',
              overflow: 'hidden'
            }}></div>
            
            <div style={{ padding: '0 24px 24px 24px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '152px', 
                  height: '152px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--purple-100)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '48px', 
                  fontWeight: 700, 
                  color: 'var(--purple-600)', 
                  backgroundImage: profile?.avatar_url ? `url(${profile.avatar_url})` : 'none', 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center', 
                  border: '4px solid #FFFFFF', 
                  marginTop: '-112px',
                  position: 'relative',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.08)'
                }}>
                  {!profile?.avatar_url && initials}
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'var(--teal-500)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', border: '2px solid #FFF', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} title="Verified Diamond Volunteer">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', gap: '24px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'rgba(0,0,0,0.9)', margin: '0 0 4px 0', lineHeight: 1.25 }}>
                    {profile?.full_name}
                  </h1>
                  <div style={{ fontSize: '16px', color: 'rgba(0,0,0,0.9)', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                    {profile?.headline || 'Dedicated Volunteer'}
                  </div>
                  <div style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span>{profile?.location || 'Location Not Set'}</span>
                    &bull;
                    <span style={{ color: '#0a66c2', fontWeight: 600, cursor: 'pointer' }} onClick={() => setIsContactModalOpen(true)}>Contact info</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button className="li-btn-primary" onClick={handleInviteClick}>
                      Invite to Gig
                    </button>
                    {profile?.resume_url && (
                      <a href={profile.resume_url} target="_blank" rel="noreferrer" className="li-btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', padding: '6px 16px' }}>
                        View Resume
                      </a>
                    )}
                    <button className="li-btn-tertiary">
                      More
                    </button>
                  </div>
                </div>
                {/* Current Role / Education side links removed from here to become a full section below */}
              </div>
            </div>
          </div>

          {/* 2. ABOUT SECTION */}
          {isVisible('about') && profile?.bio && (
            <div className="linkedin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 className="linkedin-card-title">About</h2>
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.9)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' }}>
                {profile.bio}
              </p>
            </div>
          )}

          {/* 2b. MOTIVATION SECTION */}
          {isVisible('motivation') && profile?.motivation && (
            <div className="linkedin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 className="linkedin-card-title">Why I Volunteer</h2>
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.9)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' }}>
                {profile.motivation}
              </p>
            </div>
          )}

          {/* 3. EXPERIENCE SECTION */}
          {isVisible('experience') && experiences.length > 0 && (
            <div className="linkedin-card" style={{ paddingBottom: displayedExperiences.length > 0 && experiences.length > 3 ? 0 : '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="linkedin-card-title">Volunteer Experience</h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {displayedExperiences.map((exp, index) => (
                  <div key={exp.id} style={{ display: 'flex', gap: '16px', position: 'relative', paddingBottom: index !== displayedExperiences.length - 1 ? '24px' : '0' }}>
                    {index !== displayedExperiences.length - 1 && (
                      <div style={{ position: 'absolute', left: '24px', top: '56px', bottom: '0', width: '2px', backgroundColor: '#EBEBEB' }}></div>
                    )}
                    
                    <div style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                      {exp.gigs?.organizations?.logo_url ? (
                        <img src={exp.gigs.organizations.logo_url} alt="Org Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', backgroundColor: '#F3F2EF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '20px', fontWeight: 600 }}>
                          {exp.gigs?.organizations?.name?.substring(0, 1)}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ flex: 1, paddingBottom: index !== displayedExperiences.length - 1 ? '24px' : '0', borderBottom: index !== displayedExperiences.length - 1 ? '1px solid #EBEBEB' : 'none', marginBottom: index !== displayedExperiences.length - 1 ? 0 : '16px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(0,0,0,0.9)', margin: '0 0 2px 0' }}>{exp.gigs?.title}</h3>
                      <div style={{ fontSize: '14px', color: 'rgba(0,0,0,0.9)', margin: '0 0 4px 0' }}>{exp.gigs?.organizations?.name} &bull; Volunteer</div>
                      <div style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)', margin: '0 0 8px 0' }}>
                        {new Date(exp.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} &bull; {exp.gigs?.hours_required || 0} hrs
                      </div>
                      {exp.status === 'certified' && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#057642', backgroundColor: '#E5F1EB', padding: '4px 8px', borderRadius: '4px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                          Certified
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {experiences.length > 3 && (
                <div style={{ borderTop: '1px solid #EBEBEB', margin: '0 -24px', padding: '0', display: 'flex' }}>
                  <button 
                    onClick={() => setShowAllExperiences(!showAllExperiences)}
                    style={{ width: '100%', background: 'transparent', border: 'none', padding: '16px', fontSize: '16px', fontWeight: 600, color: 'rgba(0,0,0,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', transition: 'background-color 0.2s', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}
                    className="hover-gray"
                  >
                    {showAllExperiences ? 'Show less' : `Show all ${experiences.length} experiences`}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showAllExperiences ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3b. EDUCATION SECTION */}
          {isVisible('education') && profile?.education && (
            <div className="linkedin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="linkedin-card-title">Education & Qualifications</h2>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', flexShrink: 0, backgroundColor: '#F3F2EF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '15px', color: 'rgba(0,0,0,0.9)', margin: 0, whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                    {profile.education}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. SKILLS SECTION */}
          {isVisible('skills') && hasSkills && (
            <div className="linkedin-card" id="skills-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="linkedin-card-title">Skills</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {parsedSkills.map((s: string, index: number) => (
                  <div key={s} style={{ padding: '12px 0', borderBottom: index !== parsedSkills.length - 1 ? '1px solid #EBEBEB' : 'none' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>{s}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4b. INTERESTS SECTION */}
          {isVisible('interests') && profile?.interests && (
            <div className="linkedin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 className="linkedin-card-title">Causes I Care About</h2>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(typeof profile.interests === 'string' ? profile.interests.split(',') : profile.interests).map((interest: string, index: number) => (
                  <span key={index} style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 16px', backgroundColor: '#F3F2EF', color: 'rgba(0,0,0,0.9)', borderRadius: '100px', fontSize: '14px', fontWeight: 600 }}>
                    {interest.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 5. CERTIFICATES SECTION */}
          {isVisible('certificates') && certificates.length > 0 && (
            <div className="linkedin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="linkedin-card-title">Licenses & certifications</h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {certificates.map((cert, index) => (
                  <div key={cert.id} style={{ display: 'flex', gap: '16px', paddingBottom: index !== certificates.length - 1 ? '16px' : '0', borderBottom: index !== certificates.length - 1 ? '1px solid #EBEBEB' : 'none', marginBottom: index !== certificates.length - 1 ? '16px' : '0' }}>
                    <div style={{ width: '48px', height: '48px', flexShrink: 0, backgroundColor: '#F3F2EF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"/></svg>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(0,0,0,0.9)', margin: '0 0 2px 0' }}>Ralvo Certificate of Completion</h3>
                      <div style={{ fontSize: '14px', color: 'rgba(0,0,0,0.9)', margin: '0 0 4px 0' }}>Ralvo Platform</div>
                      <div style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)', margin: '0 0 4px 0' }}>Issued {new Date(cert.issued_at || cert.created_at).toLocaleDateString("en-US", { month: 'short', year: 'numeric' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. REVIEWS SECTION */}
          {isVisible('reviews') && reviews.length > 0 && (
            <div className="linkedin-card">
              <h2 className="linkedin-card-title" style={{ marginBottom: '24px' }}>Recommendations</h2>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {reviews.map((rev, index) => (
                  <div key={rev.id} style={{ display: 'flex', gap: '16px', paddingBottom: index !== reviews.length - 1 ? '24px' : '0', borderBottom: index !== reviews.length - 1 ? '1px solid #EBEBEB' : 'none', marginBottom: index !== reviews.length - 1 ? '24px' : '0' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0, backgroundColor: 'var(--purple-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--purple-600)', overflow: 'hidden' }}>
                      {rev.gigs?.organizations?.logo_url ? (
                        <img src={rev.gigs.organizations.logo_url} alt="Org Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        rev.gigs?.organizations?.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 600, color: 'rgba(0,0,0,0.9)', fontSize: '16px' }}>{rev.gigs?.organizations?.name}</span>
                        <div style={{ display: 'flex' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill={star <= rev.rating ? "#F59E0B" : "none"} stroke={star <= rev.rating ? "#F59E0B" : "#CBD5E1"} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                          ))}
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)', marginBottom: '8px' }}>For gig: {rev.gigs?.title}</div>
                      {rev.comment && <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.9)', margin: 0, lineHeight: 1.5 }}>"{rev.comment}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── SIDEBAR (RIGHT COLUMN) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          <div className="linkedin-card">
            <h2 className="linkedin-card-title" style={{ fontSize: '16px' }}>Profile language</h2>
            <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)', margin: '4px 0 0 0' }}>English</p>
          </div>

          <div className="linkedin-card">
            <h2 className="linkedin-card-title" style={{ fontSize: '16px', marginBottom: '16px' }}>Impact Metrics</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #EBEBEB' }}>
              <span style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)' }}>Volunteer Hours</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(0,0,0,0.9)' }}>{stats.hours}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #EBEBEB' }}>
              <span style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)' }}>Completed Gigs</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(0,0,0,0.9)' }}>{stats.completed}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px' }}>
              <span style={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)' }}>Average Rating</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {stats.rating.toFixed(1)}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </span>
            </div>
          </div>

          {(profile?.linkedin_url || profile?.portfolio_url || profile?.resume_url) && (
            <div className="linkedin-card">
              <h2 className="linkedin-card-title" style={{ fontSize: '16px', marginBottom: '16px' }}>External Links</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {profile?.resume_url && (
                  <a href={profile.resume_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0a66c2', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Resume / CV
                  </a>
                )}
                {profile?.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0a66c2', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    LinkedIn Profile
                  </a>
                )}
                {profile?.portfolio_url && (
                  <a href={profile.portfolio_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0a66c2', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    Portfolio / Website
                  </a>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
      
      <style>{`
        .linkedin-layout-grid {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          padding: 0 24px;
        }
        .linkedin-card {
          background-color: #FFFFFF;
          border-radius: 8px;
          padding: 24px;
          border: 1px solid #EBEBEB;
        }
        .linkedin-card-title {
          font-size: 20px;
          font-weight: 600;
          color: rgba(0,0,0,0.9);
          margin: 0;
        }
        .hover-gray:hover {
          background-color: rgba(0,0,0,0.08);
        }
        .li-btn-primary {
          background-color: #0a66c2;
          color: #fff;
          font-weight: 600;
          font-size: 16px;
          padding: 6px 16px;
          border-radius: 100px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
          transition: background-color 0.2s;
          cursor: pointer;
        }
        .li-btn-primary:hover {
          background-color: #004182;
        }
        .li-btn-secondary {
          background-color: transparent;
          color: #0a66c2;
          font-weight: 600;
          font-size: 16px;
          padding: 6px 16px;
          border-radius: 100px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #0a66c2;
          transition: background-color 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .li-btn-secondary:hover {
          background-color: rgba(10, 102, 194, 0.08);
          box-shadow: inset 0 0 0 1px #0a66c2;
        }
        .li-btn-tertiary {
          background-color: transparent;
          color: rgba(0,0,0,0.6);
          font-weight: 600;
          font-size: 16px;
          padding: 6px 16px;
          border-radius: 100px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(0,0,0,0.6);
          transition: background-color 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .li-btn-tertiary:hover {
          background-color: rgba(0,0,0,0.08);
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.6);
          color: rgba(0,0,0,0.9);
        }
        @media (max-width: 900px) {
          .linkedin-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PublicVolunteerProfile;
