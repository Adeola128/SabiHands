import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import './Signup.css';

const CAUSES = [
  "Education & Mentorship",
  "Tech Empowerment",
  "Environment & Climate",
  "Health & Wellness",
  "Poverty Alleviation",
  "Arts & Culture"
];

const SKILLS = [
  "Web/App Development",
  "Design & UI/UX",
  "Social Media & Marketing",
  "Physical Event Support",
  "Writing & Content",
  "Data Entry & Admin",
  "Project Management"
];

const VolunteerOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  
  // Quiz State
  const [primaryGoal, setPrimaryGoal] = useState<string[]>([]);
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  
  // Fake Loading State
  const [loadingText, setLoadingText] = useState('Analyzing your profile...');
  const [feedReady, setFeedReady] = useState(false);

  const toggleArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleNext = () => {
    if (step < 4) {
      setDirection(1);
      setStep(prev => prev + 1);
    } else if (step === 4) {
      startFeedGeneration();
    }
  };

  const startFeedGeneration = () => {
    setStep(5); // Loading Step

    // Simulate analyzing phases
    setTimeout(() => setLoadingText('Matching your skills with local NGOs...'), 1500);
    setTimeout(() => setLoadingText('Building your personalized feed...'), 3000);
    setTimeout(() => {
      setFeedReady(true);
    }, 4500);
  };

  const handleComplete = async () => {
    if (!user) return;
    
    try {
      await supabase.from('volunteer_profiles').upsert({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || 'Volunteer',
        location: location || null,
        primary_goals: primaryGoal,
        interests: selectedCauses,
        skills: selectedSkills,
      }, { onConflict: 'user_id' });

      await supabase.auth.updateUser({ data: { onboarding_complete: true } });
      
      const pendingGigId = localStorage.getItem('pendingGigApply');
      if (pendingGigId) {
        localStorage.removeItem('pendingGigApply');
        navigate(`/dashboard/volunteer/gigs/${pendingGigId}/apply`, { replace: true });
      } else {
        navigate('/dashboard/volunteer', { replace: true });
      }
    } catch (error) {
      console.error("Failed to save profile", error);
      const pendingGigId = localStorage.getItem('pendingGigApply');
      if (pendingGigId) {
        localStorage.removeItem('pendingGigApply');
        navigate(`/dashboard/volunteer/gigs/${pendingGigId}/apply`, { replace: true });
      } else {
        navigate('/dashboard/volunteer', { replace: true });
      }
    }
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 50 : -50,
      opacity: 0
    })
  };

  // ----------------------------------------------------
  // RENDER HELPERS
  // ----------------------------------------------------

  const renderStep1 = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '28px', color: 'var(--ink)', marginBottom: '12px', fontFamily: 'var(--display)' }}>What brings you to Ralvo?</h2>
      <p style={{ color: 'var(--body)', marginBottom: '32px' }}>Select all that apply.</p>
      
      <div style={{ display: 'grid', gap: '12px', textAlign: 'left' }}>
        {["Gain practical experience", "Help my local community", "Meet like-minded people", "Build my professional portfolio"].map(goal => (
          <label key={goal} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', backgroundColor: primaryGoal.includes(goal) ? 'var(--purple-50)' : 'white', border: `2px solid ${primaryGoal.includes(goal) ? 'var(--purple-600)' : '#E2E8F0'}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <input type="checkbox" checked={primaryGoal.includes(goal)} onChange={() => toggleArrayItem(setPrimaryGoal, goal)} style={{ width: '20px', height: '20px', accentColor: 'var(--purple-600)' }} />
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)' }}>{goal}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '28px', color: 'var(--ink)', marginBottom: '12px', fontFamily: 'var(--display)' }}>What causes keep you awake at night?</h2>
      <p style={{ color: 'var(--body)', marginBottom: '32px' }}>We'll prioritize gigs related to these areas.</p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
        {CAUSES.map(cause => (
          <button key={cause} onClick={() => toggleArrayItem(setSelectedCauses, cause)} style={{ padding: '12px 24px', borderRadius: '99px', border: `2px solid ${selectedCauses.includes(cause) ? 'var(--purple-600)' : '#E2E8F0'}`, backgroundColor: selectedCauses.includes(cause) ? 'var(--purple-600)' : 'white', color: selectedCauses.includes(cause) ? 'white' : 'var(--ink)', fontWeight: 600, fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' }}>
            {cause}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '28px', color: 'var(--ink)', marginBottom: '12px', fontFamily: 'var(--display)' }}>What superpowers can you offer?</h2>
      <p style={{ color: 'var(--body)', marginBottom: '32px' }}>Select skills you want to use or improve.</p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
        {SKILLS.map(skill => (
          <button key={skill} onClick={() => toggleArrayItem(setSelectedSkills, skill)} style={{ padding: '12px 24px', borderRadius: '99px', border: `2px solid ${selectedSkills.includes(skill) ? 'var(--teal-600)' : '#E2E8F0'}`, backgroundColor: selectedSkills.includes(skill) ? 'var(--teal-600)' : 'white', color: selectedSkills.includes(skill) ? 'white' : 'var(--ink)', fontWeight: 600, fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' }}>
            {skill}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '28px', color: 'var(--ink)', marginBottom: '12px', fontFamily: 'var(--display)' }}>Where are you located?</h2>
      <p style={{ color: 'var(--body)', marginBottom: '32px' }}>This helps us match you with physical events in your city.</p>
      
      <input 
        type="text" 
        value={location} 
        onChange={e => setLocation(e.target.value)} 
        placeholder="e.g. Lagos, Abuja, Remote"
        style={{ width: '100%', maxWidth: '400px', padding: '16px', borderRadius: '12px', border: '2px solid #E2E8F0', fontSize: '16px', outline: 'none' }}
      />
    </div>
  );

  const renderLoading = () => (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <div style={{ margin: '0 auto 32px', width: '64px', height: '64px', border: '4px solid #E0E7FF', borderTopColor: 'var(--purple-600)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <h2 style={{ fontSize: '24px', color: 'var(--ink)', fontFamily: 'var(--display)', marginBottom: '12px' }}>{loadingText}</h2>
      <p style={{ color: 'var(--body)' }}>Please wait a moment...</p>
    </div>
  );

  const renderSuccess = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', backgroundColor: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#10B981' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <h2 style={{ fontSize: '32px', color: 'var(--ink)', fontFamily: 'var(--display)', marginBottom: '16px' }}>Your feed is ready.</h2>
      <p style={{ color: 'var(--body)', fontSize: '16px', marginBottom: '40px', lineHeight: 1.6 }}>
        We found <strong>several active gigs</strong> that need your exact skills. <br/>
        It's time to build your portfolio and make a difference.
      </p>
      
      <div style={{ backgroundColor: '#F8FAFC', padding: '32px', borderRadius: '16px', marginBottom: '40px', textAlign: 'left', border: '1px solid #E2E8F0' }}>
        <p style={{ fontStyle: 'italic', color: 'var(--ink)', fontSize: '16px', lineHeight: 1.6, marginBottom: '24px' }}>
          "Welcome to the movement. We built Ralvo to connect passionate people like you with organizations driving real impact. Let's get to work!"
        </p>
        <div style={{ fontFamily: '"Brush Script MT", cursive', fontSize: '24px', color: 'var(--purple-600)' }}>
          - Adeola
        </div>
      </div>
      
      <button onClick={handleComplete} style={{ width: '100%', padding: '16px', backgroundColor: 'var(--purple-600)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '16px', cursor: 'pointer', transition: 'background-color 0.2s' }}>
        Take me to my gigs &rarr;
      </button>
    </div>
  );

  return (
    <div className="onboarding-page-container" style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#FFFFFF' }}>
      
      {/* Left Side - Image/Branding */}
      <div className="hide-on-mobile onboarding-left-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px', position: 'relative', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <img src="https://res.cloudinary.com/dohuj4mx9/image/upload/v1786580446/Ralvo_Horizontal_Lockup_1_ljgzj1.png" alt="Ralvo" width="120" />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          {/* Removed mix-blend-mode since background is now white */}
          <img src="/images/onboarding-volunteer.jpg" alt="Volunteer Illustration" style={{ width: '100%', maxWidth: '600px' }} />
        </div>
      </div>

      {/* Right Side - Interactive Quiz */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderTopLeftRadius: '32px', borderBottomLeftRadius: '32px', boxShadow: '-10px 0 40px rgba(0,0,0,0.05)', position: 'relative' }}>
        
        {/* Progress Bar */}
        {step <= 4 && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', backgroundColor: '#F1F5F9', borderTopLeftRadius: '32px' }}>
            <div style={{ height: '100%', backgroundColor: 'var(--purple-600)', width: `${(step / 4) * 100}%`, transition: 'width 0.3s ease', borderTopLeftRadius: '32px' }} />
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
                {step === 4 && renderStep4()}
                {step === 5 && !feedReady && renderLoading()}
                {step === 5 && feedReady && renderSuccess()}
              </motion.div>
            </AnimatePresence>

            {/* Bottom Controls */}
            {step <= 4 && (
              <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {step > 1 ? (
                  <button onClick={() => { setDirection(-1); setStep(s => s - 1); }} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontWeight: 600, cursor: 'pointer', padding: '8px 0' }}>&larr; Back</button>
                ) : <div/>}
                
                <button onClick={handleNext} style={{ padding: '12px 32px', backgroundColor: 'var(--ink)', color: 'white', border: 'none', borderRadius: '99px', fontWeight: 600, fontSize: '15px', cursor: 'pointer' }}>
                  {step === 4 ? 'Build My Feed' : 'Continue'}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerOnboarding;
