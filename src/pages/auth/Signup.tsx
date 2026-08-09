import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './Signup.css';

const Signup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as 'volunteer' | 'org') || 'volunteer';
  const [role, setRole] = useState<'volunteer' | 'org'>(initialRole);

  useEffect(() => {
    const urlRole = searchParams.get('role') as 'volunteer' | 'org';
    if (urlRole === 'volunteer' || urlRole === 'org') {
      setRole(urlRole);
    }
  }, [searchParams]);

  const [showPassword, setShowPassword] = useState(false);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isOrg = role === 'org';

  const content = {
    volunteer: {
      img: 'https://images.unsplash.com/photo-1628717341663-0007b0ee2597?auto=format&fit=crop&w=900&q=80',
      quote: '"Show up. Get sabi. Become a Sabi Hand."',
      sub: 'Join volunteers across South West and North Central Nigeria turning real gigs into a verified track record employers can trust.',
      formSub: "Let's get you your first gig.",
      nameLabel: 'Full name',
      namePlaceholder: 'Ade Okonkwo',
      submitLabel: 'Create volunteer account',
      route: '/onboarding/volunteer'
    },
    org: {
      img: 'https://images.unsplash.com/photo-1655720357872-ce227e4164ba?auto=format&fit=crop&w=900&q=80',
      quote: '"Real hands. Real gigs. Real proof."',
      sub: 'Post your first gig and reach a pool of vetted, motivated volunteers across South West and North Central Nigeria.',
      formSub: "Let's get your first gig posted.",
      nameLabel: 'Organization name',
      namePlaceholder: 'Lagos Environmental Trust',
      submitLabel: 'Create organization account',
      route: '/onboarding/organization'
    }
  };

  const current = content[role];

  const handleChipToggle = (chip: string) => {
    setSelectedChips(prev => 
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const orgType = isOrg ? formData.get('orgType') as string : null;
    const cac = isOrg ? formData.get('cac') as string : null;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role === 'org' ? 'organization' : 'volunteer',
            full_name: fullName,
            org_type: orgType,
            cac_number: cac,
            interests: selectedChips,
          }
        }
      });

      if (error) {
        throw error;
      }

      // Successful signup - Go straight to OTP verification
      navigate('/verify-contact', { state: { email, role } });
    } catch (err: any) {
      console.error("Full signup error:", err);
      if (err.message === 'User already registered') {
        setError('This email is already registered. Please log in instead.');
      } else {
        setError(err.message || 'An unexpected error occurred during sign up.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // Store pending role so AuthContext can apply it after redirect
      localStorage.setItem('pendingOnboardingData', JSON.stringify({ role: isOrg ? 'organization' : 'volunteer' }));

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setError(err.message || 'Failed to authenticate with Google');
      setLoading(false);
    }
  };

  return (
    <div className={`screen ${isOrg ? 'role-is-org' : 'role-is-volunteer'}`}>
      
      <div className={`visual ${isOrg ? 'role-org' : 'role-volunteer'}`}>
        <div className="visual-photo">
          <img src={current.img} alt="Background visual" />
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
            <span>Gigway</span>
          </Link>
          <div>
            <p className="visual-quote">{current.quote}</p>
            <p className="visual-sub">{current.sub}</p>
            <div className="visual-stats">
              <div><b>1.7M</b><span>grads a year</span></div>
              <div><b>191,278</b><span>NGOs, nationally</span></div>
              <div><b>South West & North Central</b><span>launch markets</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-panel">
        <div className="form-inner">
          <div className="form-top">
            <Link className="back" to="/">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg> Back to home
            </Link>
            <span className="login-hint">Have an account? <Link to="/login">Log in</Link></span>
          </div>

          <div className="auth-eyebrow">Create your account</div>
          <h1>Welcome to Gigway</h1>
          <p className="form-sub">{current.formSub}</p>

          <div className="role-toggle">
            <div className={`role-toggle-bg ${isOrg ? 'org' : ''}`}></div>
            <button 
              type="button" 
              className={!isOrg ? 'active' : ''} 
              onClick={() => setRole('volunteer')}
            >
              I'm a volunteer
            </button>
            <button 
              type="button" 
              className={isOrg ? 'active' : ''} 
              onClick={() => setRole('org')}
            >
              I'm an NGO or company
            </button>
          </div>

          {error && <div className="auth-error-popup">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="fullName">{current.nameLabel}</label>
              <input 
                id="fullName" 
                name="fullName"
                type="text" 
                placeholder={current.namePlaceholder} 
                className={isOrg ? 'org-focus' : ''}
                required 
              />
            </div>
            
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input 
                id="email" 
                name="email"
                type="email" 
                placeholder="you@email.com" 
                className={isOrg ? 'org-focus' : ''}
                required 
              />
            </div>
            
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="pw-wrap">
                <input 
                  id="password" 
                  name="password"
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="At least 8 characters" 
                  className={isOrg ? 'org-focus' : ''}
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Show password"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            {!isOrg && (
              <div className="field">
                <label>What are you most interested in?</label>
                <div className="chip-row">
                  {['Environment', 'Education', 'Health', 'Events', 'Tech'].map(chip => (
                    <button 
                      key={chip}
                      type="button" 
                      className={`chip ${selectedChips.includes(chip) ? 'selected' : ''}`}
                      onClick={() => handleChipToggle(chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isOrg && (
              <div className="extra-fields" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="field">
                  <label htmlFor="orgType">Organization type</label>
                  <select id="orgType" name="orgType" className="org-focus">
                    <option value="NGO">NGO</option>
                    <option value="Company">Company</option>
                    <option value="Government">Government agency</option>
                    <option value="Education">School or university</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="cac">CAC registration number <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional for now)</span></label>
                  <input id="cac" name="cac" type="text" placeholder="RC1234567" className="org-focus" />
                </div>
              </div>
            )}

            <label className="terms">
              <input type="checkbox" required />
              <span>I agree to Gigway' <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.</span>
            </label>

            <button type="submit" disabled={loading} className={`submit-btn ${isOrg ? 'org-btn' : ''}`} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account...' : current.submitLabel}
            </button>
          </form>

          <div className="auth-divider">or</div>
          <button type="button" className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
            <svg viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.9 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.5 0-14 4.3-17.7 10.7z"/>
              <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 35.1 26.9 36 24 36c-5.3 0-9.8-3-11.3-7.9l-6.6 5.1C9.9 39.6 16.4 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.9 3.1-3.3 5.7-6.3 7.1l6.6 5.4C39.3 37.4 44 31.5 44 24c0-1.3-.1-2.7-.4-3.5z"/>
            </svg>
            Continue with Google
          </button>

          <p className="foot-note">
            By signing up you're joining as a <span>{role === 'org' ? 'organization' : 'volunteer'}</span>. You can switch later from your settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

