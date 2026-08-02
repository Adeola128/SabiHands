import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
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
  
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to complete onboarding.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const locationValue = formData.get('location') as string;
    
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('volunteer_profiles')
        .upsert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || 'Volunteer',
          location: locationValue,
          interests: selectedInterests,
          bio: `Available for ${formData.get('availability')}`
        }, { onConflict: 'user_id' });

      if (updateError) throw updateError;

      navigate('/dashboard/volunteer', { replace: true });
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(err.message || "Failed to save profile.");
      setLoading(false);
    }
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
          <div className="form-top">
            <span className="login-hint">Step 2 of 2</span>
          </div>

          <div className="auth-eyebrow">Profile Setup</div>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1>Complete your profile</h1>
            <p className="form-sub">Tell us where you are and what you can do.</p>
            
            {error && <div className="auth-error-popup">{error}</div>}

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="field">
                  <div className="field-header">
                    <label htmlFor="location">Where are you based in Nigeria?</label>
                  </div>
                  <select id="location" name="location" required>
                    <option value="">Select your area...</option>
                    <option value="ikeja">Ikeja</option>
                    <option value="yaba">Yaba</option>
                    <option value="lekki">Lekki</option>
                    <option value="surulere">Surulere</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="field" style={{ marginTop: '24px' }}>
                  <div className="field-header">
                    <label>What are you most interested in?</label>
                  </div>
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

                <div className="field" style={{ marginTop: '24px' }}>
                  <div className="field-header">
                    <label>Current Availability</label>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', padding: '16px', border: '1.5px solid #E4E1F5', borderRadius: '12px', cursor: 'pointer', backgroundColor: 'var(--white)' }} className="radio-card">
                      <input type="radio" name="availability" value="weekends" required style={{ marginBottom: '12px', accentColor: 'var(--purple-500)' }} />
                      <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Weekends only</span>
                      <span style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Saturday & Sunday</span>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', padding: '16px', border: '1.5px solid #E4E1F5', borderRadius: '12px', cursor: 'pointer', backgroundColor: 'var(--white)' }} className="radio-card">
                      <input type="radio" name="availability" value="part-time" required style={{ marginBottom: '12px', accentColor: 'var(--purple-500)' }} />
                      <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Part-time</span>
                      <span style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>10-20 hrs/week</span>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', padding: '16px', border: '1.5px solid #E4E1F5', borderRadius: '12px', cursor: 'pointer', backgroundColor: 'var(--white)' }} className="radio-card">
                      <input type="radio" name="availability" value="full-time" required style={{ marginBottom: '12px', accentColor: 'var(--purple-500)' }} />
                      <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Full-time</span>
                      <span style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Ready to go</span>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', padding: '16px', border: '1.5px solid #E4E1F5', borderRadius: '12px', cursor: 'pointer', backgroundColor: 'var(--white)' }} className="radio-card">
                      <input type="radio" name="availability" value="remote-only" required style={{ marginBottom: '12px', accentColor: 'var(--purple-500)' }} />
                      <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Remote only</span>
                      <span style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Digital tasks</span>
                    </label>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="submit-btn" style={{ marginTop: '32px', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Saving...' : 'Complete Profile'}
                </button>
              </form>
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerOnboarding;
