import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../lib/uploadImage';
import { NIGERIA_STATES } from '../../utils/constants';
import LoadingScreen from '../../components/LoadingScreen';

const OrgSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'contact' | 'verification' | 'notifications'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [message, setMessage] = useState('');

  // Form State
  const [org, setOrg] = useState({
    name: '',
    bio: '',
    org_type: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    location: '',
    logo_url: '',
    cover_url: '',
    cac_number: '',
    verification_status: 'pending'
  });

  useEffect(() => {
    if (!user) return;
    
    const fetchOrg = async () => {
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (data) {
        setOrg({
          name: data.name || '',
          bio: data.bio || '',
          org_type: data.org_type || '',
          website: data.website || '',
          contact_email: data.contact_email || user.email || '',
          contact_phone: data.contact_phone || '',
          location: data.location || '',
          logo_url: data.logo_url || '',
          cover_url: data.cover_url || '',
          cac_number: data.cac_number || '',
          verification_status: data.verification_status || 'pending'
        });
      } else {
        // Create if missing from metadata
        const metadata = user.user_metadata || {};
        const newOrg = {
          user_id: user.id,
          name: metadata.full_name || '',
          org_type: metadata.org_type || '',
        };
        await supabase.from('organizations').insert(newOrg);
        setOrg(prev => ({ ...prev, ...newOrg }));
      }
      setLoading(false);
    };

    fetchOrg();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setOrg(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage('');

    const formattedData = {
      name: org.name,
      bio: org.bio,
      org_type: org.org_type,
      website: org.website,
      contact_email: org.contact_email,
      contact_phone: org.contact_phone,
      location: org.location,
      logo_url: org.logo_url,
      cover_url: org.cover_url,
      cac_number: org.cac_number,
    };

    const { error } = await supabase
      .from('organizations')
      .update(formattedData)
      .eq('user_id', user.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Organization profile updated successfully!');
    }
    setSaving(false);
  };


  if (loading) return <LoadingScreen message="Loading settings..." fullScreen={false} />;

  return (
    <>
      {/* â”€â”€ SIDEBAR â”€â”€ */}
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

      {/* â”€â”€ MAIN CONTENT â”€â”€ */}
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
            {message && (
              <div style={{ padding: '12px', backgroundColor: message.includes('Error') ? 'var(--pink-50)' : 'var(--teal-50)', color: message.includes('Error') ? 'var(--pink-700)' : 'var(--teal-700)', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 600 }}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {activeTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid #E4E1F5' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--purple-100)', color: 'var(--purple-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '24px', fontFamily: 'var(--display)', overflow: 'hidden' }}>
                      {org.logo_url ? (
                        <img src={org.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        org.name ? org.name.substring(0, 2).toUpperCase() : 'ORG'
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: 'var(--white)', border: '1.5px solid #E4E1F5', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', color: 'var(--ink)' }}>
                        {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            setUploadingLogo(true);
                            try {
                              const url = await uploadImage(e.target.files[0], 'org-logos');
                              setOrg(prev => ({ ...prev, logo_url: url }));
                            } catch (err: any) {
                              setMessage(err.message);
                            } finally {
                              setUploadingLogo(false);
                            }
                          }
                        }} disabled={uploadingLogo} />
                      </label>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>JPG, PNG or GIF. Max size 2MB.</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid #E4E1F5' }}>
                    <div style={{ flex: 1 }}>
                      <label className="premium-label" style={{ marginBottom: '8px', display: 'block' }}>Cover Image</label>
                      {org.cover_url ? (
                        <div style={{ width: '100%', height: '120px', borderRadius: '12px', backgroundImage: `url(${org.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '12px' }} />
                      ) : (
                        <div style={{ width: '100%', height: '120px', borderRadius: '12px', backgroundColor: '#FAFAFC', border: '1.5px dashed #D1CEDF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: 'var(--muted)', fontSize: '13px' }}>No cover image uploaded</div>
                      )}
                      <label style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: 'var(--white)', border: '1.5px solid #E4E1F5', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', color: 'var(--ink)' }}>
                        {uploadingCover ? 'Uploading...' : 'Upload Cover Image'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            setUploadingCover(true);
                            try {
                              const url = await uploadImage(e.target.files[0], 'org-covers');
                              setOrg(prev => ({ ...prev, cover_url: url }));
                            } catch (err: any) {
                              setMessage(err.message);
                            } finally {
                              setUploadingCover(false);
                            }
                          }
                        }} disabled={uploadingCover} />
                      </label>
                    </div>
                  </div>

                  <div className="premium-form-group">
                    <label className="premium-label">Organization Name</label>
                    <input name="name" className="premium-input" value={org.name} onChange={handleChange} required />
                  </div>

                  <div className="premium-form-group">
                    <label className="premium-label">Organization Type</label>
                    <select name="org_type" className="premium-input" value={org.org_type} onChange={handleChange}>
                      <option value="">Select Type...</option>
                      <option value="NGO">Non-Governmental Organization (NGO)</option>
                      <option value="Non-Profit">Non-Profit</option>
                      <option value="Community Initiative">Community Initiative</option>
                      <option value="Social Enterprise">Social Enterprise</option>
                    </select>
                  </div>

                  <div className="premium-form-group">
                    <label className="premium-label">About the Organization (Bio)</label>
                    <textarea name="bio" className="premium-input" value={org.bio} onChange={handleChange} placeholder="Describe your organization's mission and impact..." />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="grid-2col" style={{ gap: '24px' }}>
                    <div className="premium-form-group">
                      <label className="premium-label">Contact Email</label>
                      <input type="email" name="contact_email" className="premium-input" value={org.contact_email} onChange={handleChange} placeholder="hello@yourorg.org" />
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Contact Phone</label>
                      <input type="tel" name="contact_phone" className="premium-input" value={org.contact_phone} onChange={handleChange} placeholder="+234..." />
                    </div>
                  </div>

                  <div className="premium-form-group">
                    <label className="premium-label">Website URL</label>
                    <input type="url" name="website" className="premium-input" value={org.website} onChange={handleChange} placeholder="https://www.yourorg.org" />
                  </div>

                  <div className="premium-form-group">
                    <label className="premium-label">Physical Location (State)</label>
                    <select name="location" className="premium-input" value={org.location} onChange={handleChange} required>
                      <option value="">Select a state...</option>
                      {NIGERIA_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Contact Info'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'verification' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {org.verification_status === 'verified' ? (
                    <div style={{ padding: '16px', backgroundColor: 'var(--teal-50)', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '16px', border: '1px solid var(--teal-200)' }}>
                      <div style={{ color: 'var(--teal-600)', marginTop: '2px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--teal-900)', margin: '0 0 4px' }}>Your Organization is Verified</h3>
                        <p style={{ fontSize: '13px', color: 'var(--teal-900)', margin: 0, opacity: 0.8 }}>Ralvo has verified your registration details. Volunteers trust verified organizations more.</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '16px', backgroundColor: '#FFF8E7', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '16px', border: '1px solid #F6E0A6' }}>
                      <div style={{ color: '#D97706', marginTop: '2px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#92400E', margin: '0 0 4px' }}>Verification Pending or Not Started</h3>
                        <p style={{ fontSize: '13px', color: '#92400E', margin: 0, opacity: 0.8 }}>Provide your CAC details to get verified. Verified NGOs get 3x more applications.</p>
                      </div>
                    </div>
                  )}

                  <div className="premium-form-group">
                    <label className="premium-label">CAC Registration Number</label>
                    <input name="cac_number" className="premium-input" value={org.cac_number} onChange={handleChange} placeholder="e.g. RC 1234567" />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {saving ? 'Saving...' : 'Save & Request Verification'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <p style={{ color: 'var(--body)', fontSize: '15px' }}>Email and SMS notification preferences coming soon.</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrgSettings;

