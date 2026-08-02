import React, { useState } from 'react';
import './VolunteerPages.css';

const EditProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');

  return (
    <div className="volunteer-page-container narrow">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--display)', color: 'var(--ink)', marginBottom: '8px' }}>Account Settings</h1>
        <p style={{ color: 'var(--body)' }}>Manage your personal details, preferences, and security settings.</p>
      </div>
      
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }} className="settings-layout">
        
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
              
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '40px', paddingBottom: '32px', borderBottom: '1px solid #E4E1F5' }}>
                <div style={{ width: '88px', height: '88px', borderRadius: '50%', backgroundColor: 'var(--purple-100)', overflow: 'hidden', border: '4px solid var(--white)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  <img src="https://i.pravatar.cc/150?img=47" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                    <button type="button" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>Change Photo</button>
                    <button type="button" style={{ padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid #E4E1F5', borderRadius: '12px', color: 'var(--ink)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Remove</button>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--muted)' }}>JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="responsive-grid grid-2col">
                  <div className="field">
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>First Name</label>
                    <input type="text" defaultValue="Adeola" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', outline: 'none' }} />
                  </div>
                  <div className="field">
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>Last Name</label>
                    <input type="text" defaultValue="Okonkwo" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', outline: 'none' }} />
                  </div>
                </div>
                
                <div className="field">
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>Professional Title</label>
                  <input type="text" defaultValue="Digital Marketer & Community Builder" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', outline: 'none' }} />
                </div>

                <div className="field">
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>Location</label>
                  <input type="text" defaultValue="Lagos, Nigeria" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', outline: 'none' }} />
                </div>

                <div className="field">
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Short Bio</span>
                    <span style={{ color: 'var(--muted)', fontWeight: 400 }}>0/300</span>
                  </label>
                  <textarea defaultValue="Passionate about leveraging digital tools to foster community growth. I've spent the last 3 years helping local NGOs expand their reach through targeted social media campaigns." style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', minHeight: '120px', resize: 'vertical', outline: 'none', lineHeight: 1.5, fontFamily: 'var(--sans)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="button" className="btn-primary" style={{ padding: '14px 32px' }}>
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="vol-card">
              <h2 style={{ fontSize: '20px', color: 'var(--ink)', marginBottom: '8px', fontFamily: 'var(--display)' }}>Preferences</h2>
              <p style={{ color: 'var(--body)', marginBottom: '32px', fontSize: '15px' }}>Manage how SabiHands communicates with you and what gigs you see.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '16px' }}>Email Notifications</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: 'var(--purple-500)' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '15px', marginBottom: '2px' }}>Gig Updates</div>
                        <div style={{ fontSize: '14px', color: 'var(--body)' }}>Receive emails when your application status changes.</div>
                      </div>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: 'var(--purple-500)' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '15px', marginBottom: '2px' }}>New Gig Alerts</div>
                        <div style={{ fontSize: '14px', color: 'var(--body)' }}>Weekly digest of new gigs matching your skills.</div>
                      </div>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: 'var(--purple-500)' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '15px', marginBottom: '2px' }}>Marketing & Promo</div>
                        <div style={{ fontSize: '14px', color: 'var(--body)' }}>Receive occasional news and updates from SabiHands.</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #E4E1F5', paddingTop: '32px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '16px' }}>Gig Availability</h3>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px 16px', border: '1.5px solid var(--purple-500)', borderRadius: '10px', backgroundColor: 'var(--purple-50)', color: 'var(--purple-700)', fontWeight: 600, fontSize: '14px' }}>
                      <input type="radio" name="availability" defaultChecked style={{ accentColor: 'var(--purple-500)' }} /> Actively looking
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px 16px', border: '1.5px solid #E4E1F5', borderRadius: '10px', color: 'var(--body)', fontWeight: 600, fontSize: '14px' }}>
                      <input type="radio" name="availability" style={{ accentColor: 'var(--purple-500)' }} /> Not looking
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="button" className="btn-primary" style={{ padding: '14px 32px' }}>
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="vol-card">
              <h2 style={{ fontSize: '20px', color: 'var(--ink)', marginBottom: '8px', fontFamily: 'var(--display)' }}>Security</h2>
              <p style={{ color: 'var(--body)', marginBottom: '32px', fontSize: '15px' }}>Keep your account secure by updating your login methods.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="field">
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>Email Address</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input type="email" defaultValue="adeola@example.com" disabled style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', backgroundColor: 'var(--paper)', color: 'var(--muted)' }} />
                    <button style={{ padding: '12px 20px', backgroundColor: 'transparent', border: '1px solid #E4E1F5', borderRadius: '10px', color: 'var(--ink)', fontWeight: 600, cursor: 'pointer' }}>Change</button>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #E4E1F5', paddingTop: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '16px' }}>Change Password</h3>
                  <div className="field" style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>Current Password</label>
                    <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', outline: 'none' }} />
                  </div>
                  <div className="field" style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>New Password</label>
                    <input type="password" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', outline: 'none' }} />
                  </div>
                  <div className="field" style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>Confirm New Password</label>
                    <input type="password" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', outline: 'none' }} />
                  </div>
                  <button type="button" className="btn-primary" style={{ padding: '12px 24px', backgroundColor: 'var(--ink)' }}>
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
