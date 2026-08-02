import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../../components/LoadingScreen';
import './VolunteerPages.css';

const EditProfile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form State
  const [profile, setProfile] = useState({
    full_name: '',
    headline: '',
    location: '',
    phone: '',
    bio: '',
    skills: '', // We'll keep this as a comma-separated string for editing
    interests: '', // We'll keep this as a comma-separated string for editing
    linkedin_url: '',
    portfolio_url: '',
    avatar_url: ''
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
          skills: data.skills ? data.skills.join(', ') : '',
          interests: data.interests ? data.interests.join(', ') : '',
          linkedin_url: data.linkedin_url || '',
          portfolio_url: data.portfolio_url || '',
          avatar_url: data.avatar_url || ''
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage('');

    const formattedData = {
      full_name: profile.full_name,
      headline: profile.headline,
      location: profile.location,
      phone: profile.phone,
      bio: profile.bio,
      skills: profile.skills.split(',').map(s => s.trim()).filter(Boolean),
      interests: profile.interests.split(',').map(s => s.trim()).filter(Boolean),
      linkedin_url: profile.linkedin_url,
      portfolio_url: profile.portfolio_url,
      avatar_url: profile.avatar_url,
    };

    const { error } = await supabase
      .from('volunteer_profiles')
      .update(formattedData)
      .eq('user_id', user.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Profile updated successfully!');
    }
    setSaving(false);
  };

  if (loading) return <LoadingScreen message="Loading profile settings..." fullScreen={false} />;

  return (
    <div className="volunteer-page-container">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--display)', color: 'var(--ink)', marginBottom: '8px' }}>Account Settings</h1>
        <p style={{ color: 'var(--body)' }}>Manage your personal details, preferences, and security settings.</p>
      </div>
      
      <div className="settings-layout">
        
        {/* Sidebar Nav */}
        <div className="vol-card" style={{ flex: '0 0 250px', padding: '16px 8px' }}>
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
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {activeTab === 'profile' && (
            <div className="vol-card">
              <h2 style={{ fontSize: '20px', color: 'var(--ink)', marginBottom: '8px', fontFamily: 'var(--display)' }}>Public Profile</h2>
              <p style={{ color: 'var(--body)', marginBottom: '32px', fontSize: '15px' }}>This is how you will appear to organizations on the platform.</p>
              
              {message && (
                <div style={{ padding: '12px', backgroundColor: message.includes('Error') ? 'var(--pink-50)' : 'var(--teal-50)', color: message.includes('Error') ? 'var(--pink-700)' : 'var(--teal-700)', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 600 }}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
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

                <div className="grid-2col" style={{ gap: '24px', marginBottom: '24px' }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Phone Number</label>
                    <input type="tel" name="phone" className="premium-input" value={profile.phone} onChange={handleChange} placeholder="+234..." />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Location (City, State)</label>
                    <input type="text" name="location" className="premium-input" value={profile.location} onChange={handleChange} placeholder="e.g. Yaba, Lagos" />
                  </div>
                </div>

                <div className="premium-form-group" style={{ marginBottom: '24px' }}>
                  <label className="premium-label">About Me (Bio)</label>
                  <textarea name="bio" className="premium-input" value={profile.bio} onChange={handleChange} rows={5} placeholder="Tell organizations a bit about yourself and what you are passionate about..."></textarea>
                </div>

                <div className="grid-2col" style={{ gap: '24px', marginBottom: '24px' }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Skills (comma separated)</label>
                    <input type="text" name="skills" className="premium-input" value={profile.skills} onChange={handleChange} placeholder="e.g. Photography, Logistics, Web Design" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Causes I Care About (comma separated)</label>
                    <input type="text" name="interests" className="premium-input" value={profile.interests} onChange={handleChange} placeholder="e.g. Education, Environment, Health" />
                  </div>
                </div>

                <div className="grid-2col" style={{ gap: '24px', marginBottom: '40px' }}>
                  <div className="premium-form-group">
                    <label className="premium-label">LinkedIn URL</label>
                    <input type="url" name="linkedin_url" className="premium-input" value={profile.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/yourprofile" />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Portfolio / Website URL</label>
                    <input type="url" name="portfolio_url" className="premium-input" value={profile.portfolio_url} onChange={handleChange} placeholder="https://yourwebsite.com" />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="vol-card">
              <h2 style={{ fontSize: '20px', color: 'var(--ink)', marginBottom: '32px', fontFamily: 'var(--display)' }}>Preferences</h2>
              <p style={{ color: 'var(--body)' }}>Notification and matching preferences coming soon.</p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="vol-card">
              <h2 style={{ fontSize: '20px', color: 'var(--ink)', marginBottom: '32px', fontFamily: 'var(--display)' }}>Security</h2>
              <p style={{ color: 'var(--body)' }}>Password and security settings coming soon.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EditProfile;
