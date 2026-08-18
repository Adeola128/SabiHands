import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import './RolePagesRedesign.css';

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 50, damping: 20 } 
  }
};

const ForOrganizations: React.FC = () => {
  return (
    <div className="role-page-redesign org-theme">
      <Helmet>
        <title>For NGOs &amp; Companies &mdash; Find Verified Volunteers in Nigeria | Ralvo</title>
        <meta name="description" content="Post a gig and find verified local talent instantly. Stop managing volunteers through messy WhatsApp groups. Let Ralvo handle the certificates automatically." />
        <link rel="canonical" href="https://www.ralvo.com.ng/organizations" />
      </Helmet>
      
      <header className="redesign-hero">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
        >
          <div className="masonry-tag teal" style={{ marginBottom: '24px' }}>For NGOs & Companies</div>
          <h1>Find the hands you need. <br/><em>Instantly.</em></h1>
          <p>Stop managing volunteers through messy WhatsApp groups. Post a gig, find verified local talent, and let Ralvo handle the certificates automatically.</p>
          <div className="redesign-cta">
            <Link to="/signup/organization" className="btn btn-solid">Post a Gig</Link>
            <Link to="/membership" className="btn btn-outline">View Pricing</Link>
          </div>
        </motion.div>
      </header>

      <section className="masonry-section">
        <motion.div 
          className="masonry-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            visible: { transition: { staggerChildren: 0.15 } }
          }}
        >
          <motion.div className="masonry-card" variants={fadeUpVariant}>
            <img src="/images/org_post_gig.jpg" alt="Post a Gig" />
            <div className="masonry-content">
              <span className="masonry-tag teal">Step 1</span>
              <h3>Post a Gig</h3>
              <p>Whether you need skilled digital help or on-the-ground physical hands, create a detailed gig in minutes.</p>
            </div>
          </motion.div>
          
          <motion.div className="masonry-card" variants={fadeUpVariant}>
            <img src="/images/org_verified_hands.jpg" alt="Verified Hands" />
            <div className="masonry-content">
              <span className="masonry-tag purple">Step 2</span>
              <h3>Select Verified Hands</h3>
              <p>Review applicants based on their real Ralvo track record, identity verification, and past completed certificates.</p>
            </div>
          </motion.div>
          
          <motion.div className="masonry-card" variants={fadeUpVariant}>
            <img src="/images/org_auto_certify.jpg" alt="Auto-Certify" />
            <div className="masonry-content">
              <span className="masonry-tag orange">Step 3</span>
              <h3>Auto-Certify</h3>
              <p>Mark attendance with one click, and we automatically generate and issue verifiable, blockchain-backed certificates to everyone.</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section style={{ padding: '0 20px' }}>
        <div className="cta-banner teal-theme">
          <h2>Ready to scale your impact?</h2>
          <p>Join hundreds of NGOs in Lagos building a verified volunteer workforce.</p>
          <Link to="/signup/organization" className="btn btn-outline" style={{ display: 'inline-block', padding: '16px 32px', borderRadius: '100px', fontSize: '18px', fontWeight: 'bold' }}>
            Get Started Now
          </Link>
        </div>
      </section>

    </div>
  );
};

export default ForOrganizations;
