import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import './Membership.css';

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 60, damping: 15, mass: 0.8 } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const Membership: React.FC = () => {
  return (
    <div className="membership-page">
      <header className="membership-hero">
        <motion.div 
          className="wrap"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUpVariant}
        >
          <div className="eyebrow" style={{ color: 'var(--teal-600)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pricing & Plans</div>
          <h1>Find the right hands. <br/><em>Verify the impact.</em></h1>
          <p className="membership-lede">Organizations pay a single membership fee to post gigs, access the vetted volunteer pool, and issue verifiable certificates automatically.</p>
        </motion.div>
      </header>

      <motion.div 
        className="pricing-grid"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <motion.div className="pricing-card" variants={fadeUpVariant}>
          <div className="plan-name">Community</div>
          <div className="plan-price">₦0 <span>/ month</span></div>
          <ul className="plan-features">
            <li>Post up to 2 gigs per month</li>
            <li>Accept up to 10 volunteers per gig</li>
            <li>Manual certificate issuance</li>
            <li>Basic organization profile</li>
          </ul>
          <Link to="/signup/organization" className="plan-btn plan-btn-outline">Get Started Free</Link>
        </motion.div>

        <motion.div className="pricing-card pro" variants={fadeUpVariant}>
          <div className="plan-name">Sabi Pro</div>
          <div className="plan-price">₦15,000 <span>/ month</span></div>
          <ul className="plan-features">
            <li>Unlimited gig postings</li>
            <li>Unlimited volunteers per gig</li>
            <li>Automatic, instantaneous certificate issuance</li>
            <li>Verified "Pro" badge on organization profile</li>
            <li>Priority gig placement on volunteer dashboard</li>
            <li>Downloadable impact reports for your board</li>
          </ul>
          <Link to="/signup/organization" className="plan-btn plan-btn-solid">Upgrade to Pro</Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Membership;
