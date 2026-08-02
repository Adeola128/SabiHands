import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import './Legal.css';

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 60, damping: 15 } 
  }
};

interface LegalProps {
  type: 'terms' | 'privacy';
}

const Legal: React.FC<LegalProps> = ({ type }) => {
  const isTerms = type === 'terms';
  const title = isTerms ? "Terms of Service" : "Privacy Policy";
  const date = "August 1, 2026";

  return (
    <div className="legal-page">
      <header className="legal-hero">
        <motion.div 
          className="wrap"
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
        >
          <h1>{title}</h1>
          <p>Last Updated: {date}</p>
        </motion.div>
      </header>

      <div className="legal-content">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
        >
          {isTerms ? (
            <>
              <p>Welcome to SabiHands. These Terms of Service govern your use of the SabiHands platform, including both the volunteer application and the organization dashboard.</p>
              
              <h2>1. Acceptance of Terms</h2>
              <p>By creating an account, whether as a Volunteer or an Organization, you agree to these terms. If you do not agree, do not use the platform.</p>
              
              <h2>2. Volunteer Obligations</h2>
              <p>As a volunteer, you agree to:</p>
              <ul>
                <li>Provide accurate information on your profile.</li>
                <li>Only apply to gigs you fully intend to attend.</li>
                <li>Show up on time and conduct yourself professionally.</li>
              </ul>

              <h2>3. Organization Obligations</h2>
              <p>As an organization, you agree to:</p>
              <ul>
                <li>Accurately describe the scope and location of your gigs.</li>
                <li>Provide a safe working environment for volunteers.</li>
                <li>Promptly confirm attendance so certificates can be issued.</li>
              </ul>
            </>
          ) : (
            <>
              <p>Your privacy is important to us. This Privacy Policy explains how SabiHands collects, uses, and shares your personal information.</p>
              
              <h2>1. Information We Collect</h2>
              <p>We collect information you provide directly to us when you create an account, apply for a gig, or issue a certificate.</p>
              <ul>
                <li><strong>Volunteers:</strong> Name, email, skills, and gig history.</li>
                <li><strong>Organizations:</strong> Organization name, CAC number, contact details, and payment information.</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use the information to facilitate matches between volunteers and organizations, generate verifiable certificates, and communicate important updates.</p>
              
              <h2>3. Public Certificates</h2>
              <p>Please note that any certificate you earn is meant to be public proof of your work. As such, the specific details on the certificate (your name, the organization, and the date) can be verified by anyone with the unique link.</p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Legal;
