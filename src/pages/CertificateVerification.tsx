import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import LoadingScreen from '../components/LoadingScreen';
import type { Variants } from 'framer-motion';
import './Verify.css';

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 60, damping: 15 } 
  }
};

const CertificateVerification: React.FC = () => {
  const [code, setCode] = useState('');
  const [cert, setCert] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      setLoading(true);
      setError(null);
      setCert(null);
      
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          gigs(title, type, organizations(name)),
          users(volunteer_profiles(full_name))
        `)
        .eq('verification_code', code.trim().toUpperCase())
        .maybeSingle();

      if (error || !data) {
        setError('Invalid or unrecognized certificate code.');
      } else {
        setCert({
          name: data.users?.volunteer_profiles[0]?.full_name || 'Volunteer',
          gig: data.gigs?.title,
          org: data.gigs?.organizations?.name,
          date: new Date(data.issued_at).toLocaleDateString(),
          code: data.verification_code
        });
      }
      setLoading(false);
    }
  };

  return (
    <div className="verify-page">
      <header className="verify-hero">
        <motion.div 
          className="wrap"
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
        >
          <h1>Verify a Certificate</h1>
          <p>Enter the unique certificate code below to verify its authenticity on the Gigway registry.</p>
        </motion.div>
      </header>

      <div className="verify-container">
        <motion.form 
          className="verify-search"
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
          onSubmit={handleVerify}
        >
          <input 
            type="text" 
            placeholder="e.g. SH-2941-XYZ" 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify'}</button>
        </motion.form>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            style={{ color: 'red', textAlign: 'center', marginTop: '16px' }}
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <LoadingScreen message="Verifying..." fullScreen={false} />
        ) : cert && (
          <motion.div 
            className="verify-result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 60 }}
          >
            <div className="certificate-mock">
              <div className="cert-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Verified Certificate
              </div>
              <div className="cert-title">Certificate of Volunteering</div>
              <div className="cert-name">{cert.name}</div>
              <div className="cert-details">
                Successfully completed <strong>{cert.gig}</strong><br/>
                organized by <strong>{cert.org}</strong>
              </div>
              <div className="cert-footer">
                <span>Issued: {cert.date}</span>
                <span>ID: {cert.code}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CertificateVerification;

