import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { NIGERIA_STATES } from '../../utils/constants';
import './Signup.css';

const interestsList = [
  "Web/App Development",
  "Design & Creative",
  "Social Media & Marketing",
  "Physical Event Support",
  "Writing & Content",
  "Data Entry & Admin",
];

const VolunteerOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  
  // Form State
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [skills, setSkills] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const saveProfile = async (complete: boolean = false) => {
    if (!user) {
      setError("You must be logged in to complete onboarding.");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Clean up skills array
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);

      const { error: updateError } = await supabase
        .from('volunteer_profiles')
        .upsert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || 'Volunteer',
          location: location || null,
          avatar_url: avatarUrl || null,
          interests: selectedInterests.length > 0 ? selectedInterests : null,
          skills: skillsArray.length > 0 ? skillsArray : null,
          bio: availability ? `Available for ${availability}` : null
        }, { onConflict: 'user_id' });

      if (updateError) throw updateError;

      if (complete) {
        await supabase.auth.updateUser({ data: { onboarding_complete: true } });
      }
      return true;
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(err.message || "Failed to save profile.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      const success = await saveProfile(true);
      if (success) navigate('/dashboard/volunteer', { replace: true });
    }
  };

  const handleSkip = async () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      const success = await saveProfile(true);
      if (success) navigate('/dashboard/volunteer', { replace: true });
    }
  };

  const handleSkipAll = async () => {
    const success = await saveProfile(true);
    if (success) navigate('/dashboard/volunteer', { replace: true });
  };

  return (
    <div className="screen role-is-volunteer">
      <div className="visual">
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
            <span>SabiHands</span>
          </Link>
          <div>
            <p className="visual-quote">"Your skills are needed. We'll show you where."</p>
            <p className="visual-sub">Let us know what you're good at, so we can match you perfectly.</p>
          </div>
        </div>
      </div>

      <div className="form-panel">
        <div className="form-inner">
          <div className="form-top" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="login-hint">Step {step} of 3</span>
            <button type="button" onClick={handleSkipAll} className="btn-link" style={{ fontSize: '14px', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Skip all</button>
          </div>

          <div className="auth-eyebrow">Profile Setup</div>
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={step}
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {error && <div className="auth-error-popup">{error}</div>}

              <form className="auth-form" onSubmit={handleNext}>
                
                {step === 1 && (
                  <>
                    <h1>Basic Details</h1>
                    <p className="form-sub">Tell us where you are based and how you look.</p>
                    
                    <div className="field">
                      <div className="field-header">
                        <label htmlFor="location">Where are you based in Nigeria?</label>
                      </div>
                      <select id="location" value={location} onChange={e => setLocation(e.target.value)} required style={{ width: '100%', padding: '16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', outline: 'none', fontFamily: 'var(--sans)', fontSize: '16px' }}>
                        <option value="">Select your area...</option>
                        {NIGERIA_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    <div className="field" style={{ marginTop: '24px' }}>
                      <div className="field-header">
                        <label htmlFor="avatarUrl">Avatar URL (Optional)</label>
                      </div>
                      <input 
                        type="url" 
                        id="avatarUrl" 
                        value={avatarUrl} 
                        onChange={e => setAvatarUrl(e.target.value)} 
                        placeholder="https://example.com/photo.jpg" 
                      />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h1>Your Interests</h1>
                    <p className="form-sub">What causes or roles are you most passionate about?</p>
                    
                    <div className="field">
                      <div className="chip-row">
                        {interestsList.map(interest => (
                          <div 
                            key={interest}
                            className={`chip ${selectedInterests.includes(interest) ? 'selected' : ''}`}
                            onClick={() => toggleInterest(interest)}
                            style={{ cursor: 'pointer' }}
                          >
                            {interest}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <h1>Availability & Skills</h1>
                    <p className="form-sub">Let us know when you can help and what you bring to the table.</p>
                    
                    <div className="field">
                      <div className="field-header">
                        <label>Current Availability</label>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {['weekends', 'part-time', 'full-time', 'remote-only'].map(val => (
                          <label key={val} style={{ display: 'flex', flexDirection: 'column', padding: '16px', border: availability === val ? '1.5px solid var(--purple-500)' : '1.5px solid #E4E1F5', borderRadius: '12px', cursor: 'pointer', backgroundColor: 'var(--white)' }} className="radio-card">
                            <input type="radio" name="availability" value={val} checked={availability === val} onChange={e => setAvailability(e.target.value)} required style={{ marginBottom: '12px', accentColor: 'var(--purple-500)' }} />
                            <span style={{ fontWeight: 600, color: 'var(--ink)', textTransform: 'capitalize' }}>{val.replace('-', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="field" style={{ marginTop: '24px' }}>
                      <div className="field-header">
                        <label htmlFor="skills">Specific Skills (comma separated)</label>
                      </div>
                      <input 
                        type="text" 
                        id="skills" 
                        value={skills} 
                        onChange={e => setSkills(e.target.value)} 
                        placeholder="e.g. React, Graphic Design, Copywriting" 
                      />
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                  <button type="button" onClick={handleSkip} disabled={loading} className="submit-btn" style={{ background: 'transparent', color: 'var(--ink)', border: '1px solid #E4E1F5', opacity: loading ? 0.7 : 1 }}>
                    Skip
                  </button>
                  <button type="submit" disabled={loading} className="submit-btn" style={{ opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Saving...' : step === 3 ? 'Complete Profile' : 'Next Step'}
                  </button>
                </div>
                
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default VolunteerOnboarding;
