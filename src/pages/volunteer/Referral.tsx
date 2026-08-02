import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './VolunteerPages.css';

const Referral: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://sabihands.com/join/adeola-o";

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="volunteer-page-container x-narrow" style={{ margin: '40px auto' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="vol-card"
        style={{ padding: '48px 32px', textAlign: 'center' }}
      >
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--purple-50)', color: 'var(--purple-600)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--display)', color: 'var(--ink)', marginBottom: '8px' }}>Refer a Friend</h1>
        <p style={{ fontSize: '15px', color: 'var(--body)', marginBottom: '32px', lineHeight: 1.6 }}>
          Know someone who's looking to build their network or get hands-on experience? Invite them to SabiHands and help our community grow!
        </p>
        
        <div className="flex-gap-small flex-wrap" style={{ marginBottom: '24px' }}>
          <input 
            type="text" 
            readOnly 
            value={referralLink}
            style={{ flex: 1, width: '100%', padding: '16px', borderRadius: '12px', border: '1.5px solid #E4E1F5', backgroundColor: 'var(--paper)', fontSize: '15px', color: 'var(--ink)', outline: 'none' }}
          />
          <button 
            onClick={handleCopy}
            style={{ padding: '16px 24px', width: '100%', maxWidth: '200px', backgroundColor: copied ? 'var(--teal-600)' : 'var(--purple-600)', color: 'var(--white)', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s ease', margin: '0 auto' }}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        <div className="flex-gap-small action-buttons" style={{ justifyContent: 'center' }}>
          <button style={{ flex: 1, padding: '12px', backgroundColor: 'var(--paper)', color: 'var(--ink)', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
            Share on Twitter
          </button>
          <button style={{ flex: 1, padding: '12px', backgroundColor: 'var(--paper)', color: 'var(--ink)', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
            Share on WhatsApp
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Referral;
