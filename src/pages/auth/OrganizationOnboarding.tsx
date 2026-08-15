import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { generateSlug } from '../../utils/slug';
import './Signup.css';

const OrganizationOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [orgData, setOrgData] = useState({
    name: user?.user_metadata?.full_name || '',
    location: '',
    focus: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setOrgData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = () => {
    if (step < 3) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
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
          location: orgData.location,
          focus_area: orgData.focus || null
        }, { onConflict: 'user_id' });

      if (updateError) throw updateError;

      await supabase.auth.updateUser({ data: { onboarding_complete: true } });

      navigate('/dashboard/org', { replace: true });
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(err.message || "Failed to save profile.");
      setLoading(false);
    }
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0 })
  };

  // ----------------------------------------------------
  // RENDER HELPERS
  // ----------------------------------------------------

  const renderStep1 = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '28px', color: 'var(--ink)', marginBottom: '12px', fontFamily: 'var(--display)' }}>Let's set up your HQ</h2>
      <p style={{ color: 'var(--body)', marginBottom: '32px' }}>We just need a couple of details to get you started.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--ink)' }}>Organization Name</label>
          <input 
            type="text" 
            name="name"
            value={orgData.name} 
            onChange={handleChange} 
            placeholder="e.g. SabiHands Initiative"
            style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #E2E8F0', fontSize: '16px', outline: 'none' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--ink)' }}>City / Location</label>
          <input 
            type="text" 
            name="location"
            value={orgData.location} 
            onChange={handleChange} 
            placeholder="e.g. Lagos, Nigeria"
            style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #E2E8F0', fontSize: '16px', outline: 'none' }}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '28px', color: 'var(--ink)', marginBottom: '12px', fontFamily: 'var(--display)' }}>What's your main focus right now?</h2>
      <p style={{ color: 'var(--body)', marginBottom: '32px' }}>We'll customize your dashboard checklist based on this.</p>
      
      <div style={{ display: 'grid', gap: '12px', textAlign: 'left' }}>
        {["Finding skilled volunteers", "Tracking volunteer impact hours", "Managing event registrations", "Building a community"].map(focus => (
          <label key={focus} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', backgroundColor: orgData.focus === focus ? 'var(--purple-50)' : 'white', border: `2px solid ${orgData.focus === focus ? 'var(--purple-600)' : '#E2E8F0'}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <input 
              type="radio" 
              name="focus" 
              value={focus} 
              checked={orgData.focus === focus} 
              onChange={handleChange} 
              style={{ width: '20px', height: '20px', accentColor: 'var(--purple-600)' }} 
            />
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)' }}>{focus}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', backgroundColor: '#E0E7FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#4F46E5' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <h2 style={{ fontSize: '32px', color: 'var(--ink)', fontFamily: 'var(--display)', marginBottom: '16px' }}>You're all set!</h2>
      <p style={{ color: 'var(--body)', fontSize: '16px', marginBottom: '40px', lineHeight: 1.6 }}>
        Your organization workspace is ready. You can finish setting up your profile, get verified, and post your first gig from your dashboard.
      </p>
      
      <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: 'var(--ink)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '16px', cursor: 'pointer', transition: 'background-color 0.2s', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Setting up workspace...' : 'Go to my Dashboard \u2192'}
      </button>
      
      {error && <p style={{ color: 'var(--red-600)', marginTop: '16px', fontSize: '14px' }}>{error}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#F1EFFB' }}>
      
      {/* Left Side - Image/Branding */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px', position: 'relative', overflow: 'hidden' }} className="hide-on-mobile">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <img src="https://res.cloudinary.com/dohuj4mx9/image/upload/v1786580446/Ralvo_Horizontal_Lockup_1_ljgzj1.png" alt="Ralvo" width="120" />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          {/* Using mix-blend-mode to remove the white background from the generated image */}
          <img src="/images/onboarding-org.jpg" alt="Organization Illustration" style={{ width: '90%', maxWidth: '550px', mixBlendMode: 'multiply' }} />
        </div>
      </div>

      {/* Right Side - Interactive Flow */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderTopLeftRadius: '32px', borderBottomLeftRadius: '32px', boxShadow: '-10px 0 40px rgba(0,0,0,0.05)', position: 'relative' }}>
        
        {/* Progress Bar */}
        {step <= 2 && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', backgroundColor: '#F1F5F9', borderTopLeftRadius: '32px' }}>
            <div style={{ height: '100%', backgroundColor: 'var(--purple-600)', width: `${(step / 2) * 100}%`, transition: 'width 0.3s ease', borderTopLeftRadius: '32px' }} />
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ width: '100%', maxWidth: '480px' }}>
            
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              >
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
              </motion.div>
            </AnimatePresence>

            {/* Bottom Controls */}
            {step <= 2 && (
              <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {step > 1 ? (
                  <button onClick={handlePrev} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontWeight: 600, cursor: 'pointer', padding: '8px 0' }}>&larr; Back</button>
                ) : <div/>}
                
                <button onClick={handleNext} disabled={!orgData.name && step === 1} style={{ padding: '12px 32px', backgroundColor: 'var(--purple-600)', color: 'white', border: 'none', borderRadius: '99px', fontWeight: 600, fontSize: '15px', cursor: 'pointer', opacity: (!orgData.name && step === 1) ? 0.5 : 1 }}>
                  Continue
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationOnboarding;
