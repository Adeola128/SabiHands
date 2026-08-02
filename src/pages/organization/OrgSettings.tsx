import React, { useState } from 'react';

const OrgSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'contact' | 'verification' | 'notifications'>('profile');

  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className="context-col">
        <div className="dash-card">
          <div className="dash-card-padding">
            <h2 className="dash-card-title" style={{ fontSize: '15px', marginBottom: '16px' }}>Settings</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { id: 'profile', label: 'Organization Profile', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                { id: 'contact', label: 'Contact Details', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
                { id: 'verification', label: 'Verification (CAC)', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
                { id: 'notifications', label: 'Notifications', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none',
                    backgroundColor: activeTab === t.id ? 'var(--purple-50)' : 'transparent',
                    color: activeTab === t.id ? 'var(--purple-600)' : 'var(--body)',
                    fontWeight: activeTab === t.id ? 700 : 500, fontSize: '14px', cursor: 'pointer',
                    transition: 'all 0.15s ease', textAlign: 'left',
                  }}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">
              {activeTab === 'profile' && 'Organization Profile'}
              {activeTab === 'contact' && 'Contact Details'}
              {activeTab === 'verification' && 'Verification & Trust'}
              {activeTab === 'notifications' && 'Notification Preferences'}
            </h2>
          </div>

          <div style={{ padding: '24px' }}>
            {activeTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid #E4E1F5' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--purple-100)', color: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '24px', fontFamily: 'var(--display)' }}>
                    S2S
                  </div>
                  <div>
                    <button style={{ padding: '8px 16px', backgroundColor: 'var(--white)', border: '1.5px solid #E4E1F5', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', color: 'var(--ink)' }}>
                      Upload Logo
                    </button>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>JPG, PNG or GIF. Max size 2MB.</div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Organization Name</label>
                  <input defaultValue="Slum2School Africa" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', fontSize: '15px', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)', backgroundColor: 'var(--white)' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mission Statement / Tagline</label>
                  <input defaultValue="Empowering children in slums to realize their full potential." style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', fontSize: '15px', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)', backgroundColor: 'var(--white)' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>About the Organization</label>
                  <textarea rows={5} defaultValue="We are a volunteer-driven development organization providing educational scholarships, medical support, and community development across slums in Nigeria." style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', fontSize: '15px', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)', resize: 'vertical', lineHeight: 1.6, backgroundColor: 'var(--white)' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Focus Areas</label>
                  <input defaultValue="Education, Health, Community Development" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', fontSize: '15px', color: 'var(--ink)', outline: 'none', fontFamily: 'var(--sans)', backgroundColor: 'var(--white)' }} />
                </div>
              </div>
            )}

            {activeTab === 'verification' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '16px', backgroundColor: 'var(--teal-50)', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '16px', border: '1px solid var(--teal-200)' }}>
                  <div style={{ color: 'var(--teal-600)', marginTop: '2px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--teal-900)', margin: '0 0 4px' }}>Your Organization is Verified</h3>
                    <p style={{ fontSize: '13px', color: 'var(--teal-900)', margin: 0, opacity: 0.8 }}>SabiHands has verified your registration details. Volunteers trust verified organizations more.</p>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>CAC Registration Number</label>
                  <input defaultValue="RC1234567" disabled style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E4E1F5', fontSize: '15px', color: 'var(--muted)', outline: 'none', fontFamily: 'var(--sans)', backgroundColor: '#FAFAFC' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Registration Document (CAC Certificate)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E4E1F5', backgroundColor: '#FAFAFC' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <span style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 500, flex: 1 }}>CAC_Certificate_Slum2School.pdf</span>
                    <span style={{ fontSize: '13px', color: 'var(--teal-600)', fontWeight: 600 }}>Verified</span>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs would go here, omitting for brevity to keep file size down */}
            {(activeTab === 'contact' || activeTab === 'notifications') && (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
                Settings for {activeTab} go here...
              </div>
            )}

          </div>

          <div style={{ padding: '20px 24px', backgroundColor: '#FAFAFC', borderTop: '1px solid #E4E1F5', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{ padding: '10px 24px', backgroundColor: 'var(--purple-600)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrgSettings;
