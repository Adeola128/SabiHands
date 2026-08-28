import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../lib/uploadImage';
import { NIGERIA_STATES } from '../../utils/constants';
import LoadingScreen from '../../components/LoadingScreen';
import { toast } from 'react-hot-toast';
import './VolunteerPages.css';

const EditProfile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  // Form State
  const [profile, setProfile] = useState({
    full_name: '',
    headline: '',
    location: '',
    phone: '',
    bio: '',
    motivation: '',
    education: '',
    resume_url: '',
    skills: [] as string[],
    interests: '',
    linkedin_url: '',
    portfolio_url: '',
    avatar_url: '',
    cover_url: '',
    pref_causes: '',
    pref_gig_type: 'any',
    pref_work_mode: 'any',
    pref_availability: 'any',
    slug: ''
  });

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('volunteer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          headline: data.headline || '',
          location: data.location || '',
          phone: data.phone || '',
          bio: data.bio || '',
          motivation: data.motivation || '',
          education: data.education || '',
          resume_url: data.resume_url || '',
          skills: Array.isArray(data.skills) ? data.skills : (typeof data.skills === 'string' ? data.skills.replace(/^\{|\}$/g, '').split(',').map((s: string) => s.trim().replace(/^"|"$/g, '')).filter(Boolean) : []),
          interests: Array.isArray(data.interests) ? data.interests.join(', ') : (data.interests || ''),
          linkedin_url: data.linkedin_url || '',
          portfolio_url: data.portfolio_url || '',
          avatar_url: data.avatar_url || '',
          cover_url: data.cover_url || '',
          pref_causes: Array.isArray(data.pref_causes) ? data.pref_causes.join(', ') : (data.pref_causes || ''),
          pref_gig_type: data.pref_gig_type || 'any',
          pref_work_mode: data.pref_work_mode || 'any',
          pref_availability: data.pref_availability || 'any',
          slug: data.slug || ''
        });
      } else {
        // If no profile exists, create one from user metadata (onboarding data)
        const metadata = user.user_metadata || {};
        const newProfile = {
          user_id: user.id,
          full_name: metadata.full_name || '',
          phone: metadata.phone || '',
          location: metadata.location || '',
        };
        await supabase.from('volunteer_profiles').insert(newProfile);
        setProfile(prev => ({ ...prev, ...newProfile }));
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    let finalSkills = [...profile.skills];
    if (skillInput.trim() && !finalSkills.includes(skillInput.trim())) {
      finalSkills.push(skillInput.trim());
      setProfile(prev => ({ ...prev, skills: finalSkills }));
      setSkillInput('');
    }

    const formattedData = {
      full_name: profile.full_name,
      headline: profile.headline,
      location: profile.location,
      phone: profile.phone,
      bio: profile.bio,
      motivation: profile.motivation,
      education: profile.education,
      resume_url: profile.resume_url,
      skills: finalSkills,
      interests: typeof profile.interests === 'string' ? profile.interests.split(',').map(s => s.trim()).filter(Boolean) : profile.interests,
      linkedin_url: profile.linkedin_url,
      portfolio_url: profile.portfolio_url,
      avatar_url: profile.avatar_url,
      cover_url: profile.cover_url,
      pref_causes: typeof profile.pref_causes === 'string' ? profile.pref_causes.split(',').map(s => s.trim()).filter(Boolean) : profile.pref_causes,
      pref_gig_type: profile.pref_gig_type,
      pref_work_mode: profile.pref_work_mode,
      pref_availability: profile.pref_availability,
      slug: profile.slug.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-') || null,
    };

    const { error } = await supabase
      .from('volunteer_profiles')
      .update(formattedData)
      .eq('user_id', user.id);

    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success('Profile updated successfully!');
    }
    setSaving(false);
  };

  if (loading) return <LoadingScreen message="Loading profile settings..." fullScreen={false} />;

  return (
    <div style={{ width: '100%', backgroundColor: 'transparent', paddingBottom: '80px', paddingTop: '24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontFamily: 'var(--display)', color: 'rgba(0,0,0,0.9)', marginBottom: '4px' }}>Settings & Privacy</h1>
        <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: '14px', margin: 0 }}>Manage your personal details, preferences, and security settings.</p>
      </div>
      
      <div className="linkedin-settings-grid">
        
        {/* Sidebar Nav */}
        <div className="linkedin-card" style={{ padding: '16px 8px' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('profile')}
              style={{ 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: 'none', 
                background: activeTab === 'profile' ? 'var(--purple-50)' : 'transparent', 
                color: activeTab === 'profile' ? 'var(--purple-600)' : 'var(--body)', 
                fontWeight: activeTab === 'profile' ? 700 : 500, 
                textAlign: 'left', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Public Profile
            </button>
            <button 
              onClick={() => setActiveTab('preferences')}
              style={{ 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: 'none', 
                background: activeTab === 'preferences' ? 'var(--purple-50)' : 'transparent', 
                color: activeTab === 'preferences' ? 'var(--purple-600)' : 'var(--body)', 
                fontWeight: activeTab === 'preferences' ? 700 : 500, 
                textAlign: 'left', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Preferences
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              style={{ 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: 'none', 
                background: activeTab === 'security' ? 'var(--purple-50)' : 'transparent', 
                color: activeTab === 'security' ? 'var(--purple-600)' : 'var(--body)', 
                fontWeight: activeTab === 'security' ? 700 : 500, 
                textAlign: 'left', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Security
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '80px' }}>
              <div className="linkedin-card">
                <h2 className="linkedin-card-title">Basic Information</h2>
                <p style={{ color: 'rgba(0,0,0,0.6)', marginBottom: '32px', fontSize: '14px' }}>This is how you will appear to organizations on the platform.</p>
                
                {/* Cover and Avatar Section (Premium LinkedIn Style) */}
                <div style={{ position: 'relative', marginBottom: '60px' }}>
                  {/* Cover */}
                  <div style={{ position: 'relative', width: '100%', height: '160px', backgroundImage: profile.cover_url ? `url(${profile.cover_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#D1CEDF', borderRadius: '12px', overflow: 'hidden', border: '1px solid #EBEBEB' }}>
                    <label style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: 'rgba(0,0,0,0.9)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      {uploadingCover ? 'Uploading...' : 'Change Cover'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadingCover(true);
                          try {
                            const url = await uploadImage(e.target.files[0], 'volunteer-covers');
                            setProfile(prev => ({ ...prev, cover_url: url }));
                          } catch (err: any) { toast.error(err.message); } finally { setUploadingCover(false); }
                        }
                      }} disabled={uploadingCover} />
                    </label>
                  </div>
                  
                  {/* Avatar Overlay */}
                  <div style={{ position: 'absolute', bottom: '-40px', left: '24px', width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #FFF', backgroundColor: 'var(--purple-100)', color: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '32px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'ME'
                    )}
                    <label style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                      {uploadingAvatar ? '...' : 'Edit'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadingAvatar(true);
                          try {
                            const url = await uploadImage(e.target.files[0], 'volunteer-avatars');
                            setProfile(prev => ({ ...prev, avatar_url: url }));
                          } catch (err: any) { toast.error(err.message); } finally { setUploadingAvatar(false); }
                        }
                      }} disabled={uploadingAvatar} />
                    </label>
                  </div>
                </div>

                <div className="grid-2col" style={{ gap: '24px', marginBottom: '24px' }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Full Name</label>
                    <input type="text" name="full_name" className="premium-input" value={profile.full_name} onChange={handleChange} required />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Headline (e.g. Digital Marketer)</label>
                    <input type="text" name="headline" className="premium-input" value={profile.headline} onChange={handleChange} placeholder="What do you do best?" />
                  </div>
                </div>
                
                <div className="premium-form-group" style={{ marginBottom: '24px' }}>
                  <label className="premium-label">Public Profile URL</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ padding: '12px', backgroundColor: '#F3F2EF', border: '1px solid #D1CEDF', borderRight: 'none', borderRadius: '8px 0 0 8px', color: 'rgba(0,0,0,0.6)', fontSize: '14px' }}>
                      {window.location.origin}/volunteer/
                    </span>
                    <input type="text" name="slug" className="premium-input" style={{ borderRadius: '0 8px 8px 0' }} value={profile.slug} onChange={handleChange} placeholder="your-custom-url" />
                  </div>
                  <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)', marginTop: '4px' }}>Customize your public profile URL for better SEO and easier sharing.</p>
                </div>

                <div className="grid-2col" style={{ gap: '24px', marginBottom: '24px' }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Phone Number</label>
                    <input type="tel" name="phone" className="premium-input" value={profile.phone} onChange={handleChange} placeholder="+234..." />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Location (State)</label>
                    <select name="location" className="premium-input" value={profile.location} onChange={handleChange} required>
                      <option value="">Select a state...</option>
                      {NIGERIA_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>


              <div className="linkedin-card">
                <h2 className="linkedin-card-title" style={{ marginBottom: '32px' }}>Professional Background</h2>
                
                <div className="premium-form-group" style={{ marginBottom: '24px' }}>
                  <label className="premium-label">Professional Summary</label>
                  <textarea name="bio" className="premium-input" value={profile.bio} onChange={handleChange} rows={4} placeholder="Describe your career history, expertise, and what you do best..."></textarea>
                </div>

                <div className="grid-2col" style={{ gap: '24px', marginBottom: '24px' }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Why I Volunteer (Motivation)</label>
                    <textarea name="motivation" className="premium-input" value={profile.motivation} onChange={handleChange} rows={3} placeholder="What drives you to give back?"></textarea>
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Education / Qualifications</label>
                    <textarea name="education" className="premium-input" value={profile.education} onChange={handleChange} rows={3} placeholder="Your relevant degrees, certifications, or training..."></textarea>
                  </div>
                </div>

                <div className="grid-2col" style={{ gap: '24px', marginBottom: '24px' }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Skills</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      {profile.skills.map((skill: string) => (
                        <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: 'var(--purple-100)', color: 'var(--purple-700)', borderRadius: '99px', fontSize: '13px', fontWeight: 600 }}>
                          {skill}
                          <button type="button" onClick={() => setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))} style={{ background: 'none', border: 'none', color: 'var(--purple-500)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </span>
                      ))}
                    </div>
                    <input type="text" className="premium-input" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={(e) => {
                      if (e.key === 'Enter' && skillInput.trim()) {
                        e.preventDefault();
                        if (!profile.skills.includes(skillInput.trim())) setProfile(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
                        setSkillInput('');
                      }
                    }} placeholder="Type a skill and press Enter..." />
                  </div>
                  
                  <div className="premium-form-group">
                    <label className="premium-label">Resume Upload (PDF/DOC)</label>
                    {profile.resume_url ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #E4E1F5', borderRadius: '8px', backgroundColor: 'var(--white)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--purple-600)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        <a href={profile.resume_url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--purple-600)', textDecoration: 'none', flex: 1 }}>View Uploaded Resume</a>
                        <button type="button" onClick={() => setProfile(prev => ({ ...prev, resume_url: '' }))} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }}>Remove</button>
                      </div>
                    ) : (
                      <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px 16px', backgroundColor: 'var(--white)', border: '1.5px dashed #D1CEDF', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', color: 'var(--ink)' }}>
                        {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                        <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            setUploadingResume(true);
                            try {
                              const url = await uploadImage(e.target.files[0], 'volunteer-resumes');
                              setProfile(prev => ({ ...prev, resume_url: url }));
                            } catch (err: any) { toast.error(err.message); } finally { setUploadingResume(false); }
                          }
                        }} disabled={uploadingResume} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="linkedin-card">
                <h2 className="linkedin-card-title" style={{ marginBottom: '32px' }}>Links & Interests</h2>
                
                <div className="premium-form-group" style={{ marginBottom: '24px' }}>
                  <label className="premium-label">Causes I Care About (comma separated)</label>
                  <input type="text" name="interests" className="premium-input" value={profile.interests} onChange={handleChange} placeholder="e.g. Education, Environment, Health" />
                </div>

                <div className="grid-2col" style={{ gap: '24px', marginBottom: '24px' }}>
                  <div className="premium-form-group">
                    <label className="premium-label">LinkedIn URL</label>
                    <input type="url" name="linkedin_url" className="premium-input" value={profile.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/yourprofile" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Portfolio / Website URL</label>
                    <input type="url" name="portfolio_url" className="premium-input" value={profile.portfolio_url} onChange={handleChange} placeholder="https://yourwebsite.com" />
                  </div>
                </div>
              </div>


              <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 10 }}>
                <button type="submit" style={{ padding: '12px 24px', backgroundColor: 'var(--blue-600)', color: 'white', borderRadius: '100px', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'preferences' && (
            <div className="linkedin-card">
              <h2 className="linkedin-card-title">Matching Preferences</h2>
              <p style={{ color: 'var(--body)', marginBottom: '32px', fontSize: '15px' }}>Help us recommend the best opportunities for you.</p>
              
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                  <div className="field">
                    <label className="premium-label">Causes you care about (comma separated)</label>
                    <input type="text" name="pref_causes" className="premium-input" value={profile.pref_causes} onChange={handleChange} placeholder="e.g. Education, Health, Environment" />
                  </div>
                  
                  <div className="field">
                    <label className="premium-label">Preferred Gig Type</label>
                    <select name="pref_gig_type" className="premium-input" value={profile.pref_gig_type} onChange={handleChange}>
                      <option value="any">Open to anything</option>
                      <option value="skilled">Skilled roles only</option>
                      <option value="physical">Physical/Event roles only</option>
                    </select>
                  </div>
                  
                  <div className="field">
                    <label className="premium-label">Preferred Work Mode</label>
                    <select name="pref_work_mode" className="premium-input" value={profile.pref_work_mode} onChange={handleChange}>
                      <option value="any">Any (Remote or On-site)</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="in_person">On-site</option>
                    </select>
                  </div>
                  
                  <div className="field">
                    <label className="premium-label">Availability</label>
                    <select name="pref_availability" className="premium-input" value={profile.pref_availability} onChange={handleChange}>
                      <option value="any">Flexible</option>
                      <option value="weekdays">Weekdays</option>
                      <option value="weekends">Weekends</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" style={{ padding: '12px 24px', backgroundColor: 'var(--blue-600)', color: 'white', borderRadius: '100px', fontWeight: 600, border: 'none', cursor: 'pointer' }} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="linkedin-card">
              <h2 className="linkedin-card-title" style={{ marginBottom: '32px' }}>Security</h2>
              <p style={{ color: 'rgba(0,0,0,0.6)' }}>Password and security settings coming soon.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EditProfile;
