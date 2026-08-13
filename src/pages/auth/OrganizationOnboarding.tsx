import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { NIGERIA_STATES } from '../../utils/constants';
import { uploadImage } from '../../lib/uploadImage';
import { generateSlug } from '../../utils/slug';
import './Signup.css';

const OrganizationOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [orgData, setOrgData] = useState({
    name: user?.user_metadata?.full_name || '',
    org_type: '',
    cac_number: '',
    logo_url: '',
    location: '',
    website: '',
    contact_phone: '',
    bio: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setOrgData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingLogo(true);
      setError(null);
      try {
        const url = await uploadImage(e.target.files[0], 'organization-logos');
        setOrgData(prev => ({ ...prev, logo_url: url }));
      } catch (err: any) {
        setError(err.message || 'Failed to upload logo.');
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      setError("You must be logged in to complete onboarding.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let baseSlug = generateSlug(orgData.name || 'Organization');
      let slug = baseSlug;
      let counter = 1;
      let isUnique = false;
  
      while (!isUnique) {
        const { data: existing } = await supabase.from('organizations').select('user_id').eq('slug', slug).maybeSingle();
        if (!existing || existing.user_id === user.id) {
          isUnique = true;
        } else {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }

      const { error: updateError } = await supabase
        .from('organizations')
        .upsert({
          user_id: user.id,
          name: orgData.name || 'Organization',
          slug: slug,
          org_type: orgData.org_type,
          cac_number: orgData.cac_number,
          logo_url: orgData.logo_url,
          location: orgData.location,
          website: orgData.website,
          contact_phone: orgData.contact_phone,
          bio: orgData.bio
        }, { onConflict: 'user_id' });

      if (updateError) throw updateError;

      await supabase.auth.updateUser({ data: { onboarding_complete: true } });

      navigate('/dashboard/org', { replace: true });
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(err.message || "Failed to save organization profile.");
      setLoading(false);
    }
  };

  return (
    <div className="screen role-is-org">
      <div className="visual role-org">
        <div className="visual-photo">
          <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80" alt="Volunteers working together" />
        </div>
        <svg className="seam" viewBox="0 0 64 100" preserveAspectRatio="none">
          <path d="M32,0 C 8,16 54,28 32,42 C 8,56 54,68 32,82 C 14,92 40,96 30,100 L64,100 L64,0 Z" />
        </svg>
        <div className="visual-content">
          <Link to="/" className="visual-brand">
            <svg viewBox="0 0 100 100">
              <path d="M60 15 A35 35 0 1 0 60 85" fill="none" stroke="#AFA9EC" strokeWidth="16" strokeLinecap="round" />
              <path d="M40 15 A35 35 0 1 1 40 85" fill="none" stroke="#5DCAA5" strokeWidth="16" strokeLinecap="round" />
            </svg>
            <span>Ralvo</span>
          </Link>
          <div>
            <p className="visual-quote">"Real hands. Real impact."</p>
            <p className="visual-sub">Help us verify your organization so you can start posting gigs and recruiting volunteers.</p>
          </div>
        </div>
      </div>

      <div className="form-panel">
        <div className="form-inner">
          <div className="form-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="login-hint">Step {step} of 3</span>
            <button 
              type="button"
              onClick={() => handleSubmit()}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              Skip for now
            </button>
          </div>

          <div className="auth-eyebrow">Organization Setup</div>
          
          {error && <div className="auth-error-popup">{error}</div>}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1>Basic Details</h1>
                <p className="form-sub">Tell us a bit more about your organization.</p>

                <div className="field" style={{ marginBottom: '20px' }}>
                  <div className="field-header">
                    <label>Organization Logo</label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '12px', backgroundColor: 'var(--purple-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1.5px dashed var(--purple-200)' }}>
                      {orgData.logo_url ? (
                        <img src={orgData.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--purple-600)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      )}
                    </div>
                    <label style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: 'white', border: '1px solid #E4E1F5', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: 'var(--ink)' }}>
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} disabled={uploadingLogo} />
                    </label>
                  </div>
                </div>

                <div className="field">
                  <div className="field-header">
                    <label htmlFor="name">Organization Name</label>
                  </div>
                  <input id="name" name="name" type="text" value={orgData.name} onChange={handleChange} className="org-focus" required />
                </div>

                <div className="field" style={{ marginTop: '24px' }}>
                  <div className="field-header">
                    <label htmlFor="org_type">Organization Type</label>
                  </div>
                  <select id="org_type" name="org_type" value={orgData.org_type} onChange={handleChange} className="org-focus" required style={{ width: '100%', padding: '16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', outline: 'none', fontFamily: 'var(--sans)', fontSize: '16px' }}>
                    <option value="">Select type...</option>
                    <option value="Non-Profit (NGO)">Non-Profit (NGO)</option>
                    <option value="Community Group">Community Group</option>
                    <option value="Corporate/Business">Corporate/Business</option>
                    <option value="Government">Government Agency</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="field" style={{ marginTop: '24px' }}>
                  <div className="field-header">
                    <label htmlFor="cac_number">CAC Registration Number (Optional)</label>
                  </div>
                  <input id="cac_number" name="cac_number" type="text" value={orgData.cac_number} onChange={handleChange} placeholder="e.g. RC 123456" className="org-focus" />
                </div>

                <button 
                  type="button" 
                  onClick={handleNext} 
                  disabled={!orgData.name || !orgData.org_type} 
                  className="submit-btn org-btn" 
                  style={{ marginTop: '32px' }}
                >
                  Continue
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1>Contact Information</h1>
                <p className="form-sub">Where are you located and how can people reach you?</p>

                <div className="field">
                  <div className="field-header">
                    <label htmlFor="location">Location (State)</label>
                  </div>
                  <select id="location" name="location" value={orgData.location} onChange={handleChange} className="org-focus" required style={{ width: '100%', padding: '16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', outline: 'none', fontFamily: 'var(--sans)', fontSize: '16px' }}>
                    <option value="">Select a state...</option>
                    {NIGERIA_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div className="field" style={{ marginTop: '24px' }}>
                  <div className="field-header">
                    <label htmlFor="contact_phone">Contact Phone Number</label>
                  </div>
                  <input id="contact_phone" name="contact_phone" type="tel" value={orgData.contact_phone} onChange={handleChange} placeholder="+234..." className="org-focus" required />
                </div>

                <div className="field" style={{ marginTop: '24px' }}>
                  <div className="field-header">
                    <label htmlFor="website">Website (Optional)</label>
                  </div>
                  <input id="website" name="website" type="url" value={orgData.website} onChange={handleChange} placeholder="https://..." className="org-focus" />
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                  <button type="button" onClick={handlePrev} className="submit-btn" style={{ background: 'var(--paper)', color: 'var(--ink)', border: '1px solid #E4E1F5', flex: 1 }}>
                    Back
                  </button>
                  <button type="button" onClick={handleNext} disabled={!orgData.location || !orgData.contact_phone} className="submit-btn org-btn" style={{ flex: 2 }}>
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1>Mission & About</h1>
                <p className="form-sub">Tell volunteers what your organization stands for.</p>

                <div className="field">
                  <div className="field-header">
                    <label htmlFor="bio">About / Mission Statement</label>
                  </div>
                  <textarea 
                    id="bio" 
                    name="bio" 
                    value={orgData.bio} 
                    onChange={handleChange} 
                    placeholder="Describe your organization's mission and what you do..." 
                    className="org-focus" 
                    style={{ width: '100%', padding: '16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', outline: 'none', fontFamily: 'var(--sans)', minHeight: '150px', resize: 'vertical' }}
                    required
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                  <button type="button" onClick={handlePrev} className="submit-btn" style={{ background: 'var(--paper)', color: 'var(--ink)', border: '1px solid #E4E1F5', flex: 1 }}>
                    Back
                  </button>
                  <button type="button" onClick={() => handleSubmit()} disabled={loading || !orgData.bio} className="submit-btn org-btn" style={{ flex: 2, opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Saving...' : 'Complete Setup'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OrganizationOnboarding;

