import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import './Signup.css';

const OrganizationOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to complete onboarding.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const orgType = formData.get('org_type') as string;
    const cacNumber = formData.get('cac_number') as string;
    
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('organizations')
        .upsert({
          user_id: user.id,
          name: user.user_metadata?.full_name || 'Organization',
          org_type: orgType,
          cac_number: cacNumber
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
            <span>SabiHands</span>
          </Link>
          <div>
            <p className="visual-quote">"Real hands. Real impact."</p>
            <p className="visual-sub">Help us verify your organization so you can start posting gigs.</p>
          </div>
        </div>
      </div>

      <div className="form-panel">
        <div className="form-inner">
          <div className="form-top">
            <span className="login-hint">Step 2 of 2</span>
          </div>

          <div className="auth-eyebrow">Organization Setup</div>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1>Complete your profile</h1>
            <p className="form-sub">Tell us a bit more about your organization.</p>

            {error && <div className="auth-error-popup">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              
              <div className="field">
                <div className="field-header">
                  <label htmlFor="org_type">Organization Type</label>
                </div>
                <select id="org_type" name="org_type" className="org-focus" required style={{ width: '100%', padding: '16px', borderRadius: '10px', border: '1.5px solid #E4E1F5', outline: 'none', fontFamily: 'var(--sans)' }}>
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
                <input id="cac_number" name="cac_number" type="text" placeholder="e.g. RC 123456" className="org-focus" />
              </div>

              <button type="submit" disabled={loading} className="submit-btn org-btn" style={{ marginTop: '32px', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationOnboarding;
