import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import './RolePages.css';

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 60, damping: 15 } 
  }
};

const ForOrganizations: React.FC = () => {
  return (
    <div className="role-page org-theme">
      <header className="role-hero">
        <motion.div 
          className="wrap"
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
        >
          <div className="eyebrow" style={{ color: 'var(--teal-600)' }}>For NGOs & Companies</div>
          <h1>Find the hands you need. <br/><em>Instantly.</em></h1>
          <p className="role-lede">Stop managing volunteers through messy WhatsApp groups. Post a gig, find verified local talent, and let Ralvo handle the certificates automatically.</p>
          <div className="role-cta">
            <Link to="/signup/organization" className="btn btn-solid" style={{ background: 'var(--teal-600)', color: 'white', borderColor: 'var(--teal-600)' }}>Post a Gig</Link>
            <Link to="/membership" className="btn btn-outline" style={{ color: 'var(--teal-600)', borderColor: 'var(--teal-200)' }}>View Pricing</Link>
          </div>
        </motion.div>
      </header>

      <section className="role-features">
        <div className="wrap">
          <motion.div 
            className="feature-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              visible: { transition: { staggerChildren: 0.15 } }
            }}
          >
            <motion.div className="feature-card" variants={fadeUpVariant}>
              <h3>1. Post a Gig</h3>
              <p>Whether you need skilled digital help or on-the-ground physical hands, create a gig in minutes.</p>
            </motion.div>
            <motion.div className="feature-card" variants={fadeUpVariant}>
              <h3>2. Select Verified Hands</h3>
              <p>Review applicants based on their Ralvo track record and past completed certificates.</p>
            </motion.div>
            <motion.div className="feature-card" variants={fadeUpVariant}>
              <h3>3. Auto-Certify</h3>
              <p>Mark attendance with one click, and we automatically generate and issue verifiable certificates to everyone who showed up.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ForOrganizations;

