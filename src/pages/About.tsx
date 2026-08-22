import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import './About.css';

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 60, damping: 15, mass: 0.8 } 
  }
};

const About: React.FC = () => {
  return (
    <div className="about-page">
      <Helmet>
        <title>About Us &mdash; Built for the Nigerian Hustle | Ralvo</title>
        <meta name="description" content="Ralvo is Nigeria's premier volunteer matching and verification platform. We turn real gigs into verifiable proof to help young Nigerians build a track record employers trust." />
        <link rel="canonical" href="https://www.ralvo.com.ng/about" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "AboutPage",
              "name": "About Ralvo",
              "description": "Ralvo is Nigeria's premier volunteer matching and verification platform.",
              "url": "https://www.ralvo.com.ng/about"
            }
          `}
        </script>
      </Helmet>
      <header className="about-hero">
        <motion.div 
          className="wrap"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUpVariant}
        >
          <div className="eyebrow" style={{ color: 'var(--teal-600)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Our Story</div>
          <h1>Built for the <em>Nigerian</em> hustle.</h1>
          <p className="about-lede">We believe that showing up should count for something. Ralvo was built to turn real gigs into real proof.</p>
        </motion.div>
      </header>

      <div className="about-content">
        <motion.section 
          className="about-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUpVariant}
        >
          <h2>The Mission</h2>
          <p>Every year, over 1.7 million graduates enter the Nigerian job market. Almost all of them hit the exact same wall: "You can't get hired without experience, and you can't get experience without being hired."</p>
          <p>At the same time, there are hundreds of thousands of NGOs, community projects, and fast-moving companies that desperately need sharp, motivated hands for short-term gigs â€” but they rely entirely on messy WhatsApp groups to find them.</p>
          <blockquote>"We aren't just connecting people to gigs. We are building the verifiable track record for a generation of young Nigerians."</blockquote>
          <p>Ralvo bridges this gap. We've built a marketplace where organizations can post gigs in minutes, and volunteers can show up, get the job done, and walk away with a verifiable certificate that proves they actually did the work. No CV needed to start, and no chasing anyone down for a signature afterward.</p>
        </motion.section>

        <motion.section 
          className="about-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUpVariant}
        >
          <h2>Built for Nigeria</h2>
          <p>Nigeria isn't just a country; it's a completely unique operating environment. Global platforms like Catchafire are built for US-only, professional-skills volunteering. Generic directories don't offer verification. We knew that to make this work, it had to be built specifically for the Nigerian ecosystem â€” handling both skilled (digital) and physical (on-ground) gigs, right from day one.</p>
          <p>If we can make Ralvo the definitive home for showing up in Nigeria, the rest of the continent will follow.</p>
        </motion.section>


      </div>
    </div>
  );
};

export default About;

