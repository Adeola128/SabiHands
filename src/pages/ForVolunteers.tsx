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

const ForVolunteers: React.FC = () => {
  return (
    <div className="role-page-redesign vol-theme">
      <Helmet>
        <title>For Volunteers &mdash; Build Your Track Record in Nigeria | Ralvo</title>
        <meta name="description" content="Find verified volunteer opportunities and NGO gigs across Nigeria. Complete gigs, get verified certificates, and build a track record employers can't ignore." />
        <link rel="canonical" href="https://www.ralvo.com.ng/volunteers" />
      </Helmet>
      
      <header className="redesign-hero vol-theme">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
        >
          <div className="masonry-tag purple" style={{ marginBottom: '24px' }}>For Volunteers</div>
          <h1>Show up. Get sabi. <br/><em>Become a Sabi Hand.</em></h1>
          <p>You don't need a 5-year degree to prove you can do the work. Ralvo connects you with real NGOs and companies in Lagos. Complete a gig, get a verified certificate, and build a track record they can't ignore.</p>
          <div className="redesign-cta">
            <Link to="/signup/volunteer" className="btn btn-solid">Create your profile</Link>
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
            <img src="/images/vol_real_world_proof.jpg" alt="Real-world proof" />
            <div className="masonry-content">
              <span className="masonry-tag purple">Proof</span>
              <h3>Real-world proof</h3>
              <p>Every completed gig turns into a verifiable Ralvo certificate you can share directly on LinkedIn or add to your CV.</p>
            </div>
          </motion.div>
          
          <motion.div className="masonry-card" variants={fadeUpVariant}>
            <img src="/images/vol_direct_connections.jpg" alt="Direct connections" />
            <div className="masonry-content">
              <span className="masonry-tag teal">Network</span>
              <h3>Direct connections</h3>
              <p>Work directly with founders and teams at Lagos NGOs and startups. Build your professional network by doing real work.</p>
            </div>
          </motion.div>
          
          <motion.div className="masonry-card" variants={fadeUpVariant}>
            <img src="/images/vol_diverse_gigs.jpg" alt="Diverse gigs" />
            <div className="masonry-content">
              <span className="masonry-tag orange">Skills</span>
              <h3>Diverse gigs</h3>
              <p>From social media design and coding a landing page, to distributing relief materials on a Saturday—there's a gig for you.</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section style={{ padding: '0 20px' }}>
        <div className="cta-banner">
          <h2>Ready to build your portfolio?</h2>
          <p>Join thousands of young professionals building trust through verified work.</p>
          <Link to="/signup/volunteer" className="btn btn-solid" style={{ display: 'inline-block', padding: '16px 32px', borderRadius: '100px', fontSize: '18px', fontWeight: 'bold' }}>
            Start Volunteering
          </Link>
        </div>
      </section>

    </div>
  );
};

export default ForVolunteers;
