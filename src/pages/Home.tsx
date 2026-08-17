import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

import './Home.css';

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
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
    transition: { staggerChildren: 0.15 }
  }
};

const scaleUpVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 60, damping: 15, mass: 0.8 }
  }
};

const Home: React.FC = () => {
  useEffect(() => {
    // Parallax logic for floating elements (if not reduced motion)
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) {
      const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]')) as HTMLElement[];
      let ticking = false;
      const applyParallax = () => {
        const vh = window.innerHeight;
        parallaxEls.forEach(el => {
          const speed = parseFloat(el.dataset.parallax || '0') || 0;
          const rect = el.getBoundingClientRect();
          const centerDelta = (rect.top + rect.height / 2) - vh / 2;
          el.style.transform = `translateY(${centerDelta * speed * -1}px)`;
        });
        ticking = false;
      };
      const onScroll = () => {
        if (!ticking) { requestAnimationFrame(applyParallax); ticking = true; }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      applyParallax();
      return () => window.removeEventListener('scroll', onScroll);
    }
  }, []);

  return (
    <div className="home-page">
      <Helmet>
        <title>Ralvo &mdash; Find Volunteer Opportunities &amp; NGO Gigs in Nigeria</title>
        <meta name="description" content="Find verified volunteer opportunities and NGO gigs across Nigeria. Connect with local non-profits, build your track record, and earn verifiable certificates on Ralvo." />
        <link rel="canonical" href="https://www.ralvo.com.ng/" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Ralvo",
              "url": "https://www.ralvo.com.ng/",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.ralvo.com.ng/volunteers?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          `}
        </script>
      </Helmet>
      
      {/* HERO */}
      <header className="hero hero-premium bg-dot-scatter">
        <div className="hero-inner-premium">
          <motion.div 
            className="hero-copy-premium"
            initial="hidden" animate="visible" variants={staggerContainer}
          >
            <motion.div className="eyebrow" variants={fadeUpVariant}><span className="dot"></span> Lagos, Nigeria</motion.div>
            <motion.h1 variants={fadeUpVariant}>
              Show up. Get <em className="gradient-text">verified.</em><br/>
              Build your track record.
            </motion.h1>
            <motion.p className="sub" variants={fadeUpVariant}>
              Ralvo connects NGOs with young volunteers in Lagos. Complete real gigs, earn verified certificates, and build a portfolio employers trust.
            </motion.p>
            <motion.div className="hero-ctas" variants={fadeUpVariant}>
              <Link className="btn btn-primary btn-glow" to="/signup?role=volunteer">I'm looking to volunteer</Link>
              <Link className="btn btn-outline-light" to="/signup?role=org">I'm an NGO / company</Link>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="hero-visual-premium" 
            initial="hidden" animate="visible" variants={scaleUpVariant}
          >
            {/* The transparent character image */}
            <div className="main-character-wrap" data-parallax="0.08">
              <img src="/illustrations/hero-transparent.png" alt="Young Nigerian woman ready to volunteer" className="main-character" />
            </div>
          </motion.div>
        </div>

        <div className="wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none"><path fill="#FBFAFF" d="M0,64 C240,120 480,0 720,32 C960,64 1200,120 1440,48 L1440,120 L0,120 Z"/></svg>
        </div>
      </header>

      {/* FOR YOU */}
      <section className="panel panel-light bg-wave-layers" id="for-you">
        <div className="wrap">
          <motion.div className="kicker" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeUpVariant}>The problem</motion.div>
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeUpVariant}>You can't get hired without experience.<br/>You can't get experience without being hired.</motion.h2>
          <motion.p className="lede" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeUpVariant}>Every skilled young Nigerian hits this wall right after finishing a course or graduating - and today, the only options are informal WhatsApp groups, flyers, or global directories that aren't built for Nigeria.</motion.p>
          

        </div>
        <div className="wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none"><path fill="#FFFFFF" d="M0,32 C240,90 480,110 720,64 C960,18 1200,80 1440,40 L1440,120 L0,120 Z"/></svg>
        </div>
      </section>

      {/* THE SOLUTION */}
      <section className="panel panel-white bg-organic-blobs">
        <div className="wrap">
          <motion.div className="kicker" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeUpVariant}>The solution</motion.div>
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeUpVariant}>A marketplace where showing up counts</motion.h2>
          <motion.p className="lede" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeUpVariant}>Two sides, one path forward - verified organizations post real work, and volunteers walk away with proof they can actually use.</motion.p>

          <motion.div className="story-row" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={fadeUpVariant}>
            <div className="story-illus" data-parallax="0.04">
              <div className="illus-slot tone-purple">
                <img src="/illustrations/volunteers-illustration.png" alt="Volunteers" />
              </div>
            </div>
            <div className="story-text">
              <h3>For volunteers</h3>
              <p>Real gigs - skilled or physical - with real proof at the end of them.</p>
              <ul className="story-list">
                <li>Browse open gigs and apply in a few taps</li>
                <li>No CV needed to get started</li>
                <li>Walk away with a verified certificate</li>
                <li>Build a track record employers can trust</li>
              </ul>
            </div>
          </motion.div>

          <motion.div className="story-row reverse" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={fadeUpVariant}>
            <div className="story-illus" data-parallax="0.04">
              <div className="illus-slot tone-teal">
                <img src="/illustrations/orgs-illustration.png" alt="Organizations" />
              </div>
            </div>
            <div className="story-text">
              <h3>For NGOs & companies</h3>
              <p>Skip the WhatsApp-group recruiting grind entirely.</p>
              <ul className="story-list">
                <li>Post a gig in minutes - skilled or physical</li>
                <li>Reach a pool of vetted, motivated volunteers</li>
                <li>Issue certificates automatically on completion</li>
                <li>Build a reputation that attracts better volunteers over time</li>
              </ul>
            </div>
          </motion.div>
        </div>
        <div className="wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none"><path fill="#26215C" d="M0,48 C240,10 480,100 720,60 C960,20 1200,90 1440,32 L1440,120 L0,120 Z"/></svg>
        </div>
      </section>

      {/* HOW IT WORKS (Sticky Editorial Redesign) */}
      <section className="panel panel-dark" id="how-it-works">
        <div className="wrap editorial-layout">
          <div className="editorial-text">
            <motion.div className="kicker" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeUpVariant}>How it works</motion.div>
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeUpVariant}>Four steps, start to proof</motion.h2>

            <div className="editorial-steps">
              <motion.div className="step-block" initial={{ opacity: 0.4, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ margin: "-20% 0px -50% 0px" }}>
                <div className="step-num">01</div>
                <h3>Find a gig</h3>
                <p>Browse open roles from verified NGOs and companies near you.</p>
              </motion.div>
              
              <motion.div className="step-block" initial={{ opacity: 0.4, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ margin: "-20% 0px -50% 0px" }}>
                <div className="step-num">02</div>
                <h3>Apply &amp; match</h3>
                <p>Apply in a tap. The organization picks who shows up.</p>
              </motion.div>
              
              <motion.div className="step-block" initial={{ opacity: 0.4, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ margin: "-20% 0px -50% 0px" }}>
                <div className="step-num">03</div>
                <h3>Get certified</h3>
                <p>On completion, a verified certificate is issued instantly.</p>
              </motion.div>
              
              <motion.div className="step-block" initial={{ opacity: 0.4, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ margin: "-20% 0px -50% 0px" }}>
                <div className="step-num">04</div>
                <h3>Move forward</h3>
                <p>Show employers real, verifiable proof of what you can do.</p>
              </motion.div>
            </div>
          </div>
          
          <div className="editorial-visual">
            <div className="sticky-mobile">
              <motion.img 
                src="/illustrations/how-it-works-mobile.png" 
                alt="Mobile app illustration for Ralvo"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.3 }}
              />
            </div>
          </div>
        </div>

        <div className="wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none"><path fill="#FFFFFF" d="M0,40 C240,100 480,10 720,50 C960,90 1200,20 1440,64 L1440,120 L0,120 Z"/></svg>
        </div>
      </section>

      {/* WHY NOW (Bento Grid Redesign) */}
      <section className="panel panel-dark" id="why-now" style={{ overflow: 'hidden' }}>
        <div className="wrap">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUpVariant} style={{ textAlign: 'center', marginBottom: '100px' }}>
            <div className="kicker">Why now</div>
            <h2 style={{ maxWidth: '800px', margin: '0 auto' }}>Nigeria's volunteering market is large, informal, and untouched</h2>
          </motion.div>

          <div className="why-bento">
            {/* The central illustration */}
            <motion.div className="bento-center" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={scaleUpVariant}>
              <div className="bg-glow-teal" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'blur(100px)', opacity: 0.35 }}></div>
              <img src="/illustrations/why-now-volunteers.png" alt="Volunteers community" className="bento-image" />
            </motion.div>

            {/* Floating Stats Cards */}
            <motion.div className="bento-card card-top-left" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="stat-num">1.7M</div>
              <p>graduates enter Nigeria's job market every year, most without proof of applied skill.</p>
            </motion.div>

            <motion.div className="bento-card card-bottom-right" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
              <div className="stat-num">191k+</div>
              <p>NGOs registered in Nigeria - nearly all recruiting volunteers by word of mouth.</p>
            </motion.div>

            <motion.div className="bento-card card-bottom-left" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }}>
              <div className="stat-num">Zero</div>
              <p>Nigerian platforms that combine short gigs, verification, and certification.</p>
            </motion.div>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={fadeUpVariant} style={{ marginTop: '120px' }}>
            <blockquote className="pull-quote bento-quote">
              <p>"Every gig completed here adds a verified data point to a volunteer's track record and an NGO's reliability record - the more that accumulates, the harder it is for anyone else to catch up."</p>
              <cite>The Ralvo thesis</cite>
            </blockquote>
          </motion.div>
        </div>
        <div className="wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none"><path fill="#FBFAFF" d="M0,50 C240,0 480,100 720,60 C960,20 1200,90 1440,44 L1440,120 L0,120 Z"/></svg>
        </div>
      </section>

      {/* GET STARTED (Conversion Gateway Redesign) */}
      {/* GET STARTED (Conversion Gateway Redesign) */}
      <section className="panel panel-dark get-started-panel bg-dot-scatter" id="get-started">
        <div className="wrap" style={{ textAlign: 'center', position: 'relative' }}>
          <div className="bg-glow-teal" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, opacity: 0.3, width: '80%', height: '100%', filter: 'blur(120px)' }}></div>
          
          <motion.div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto' }} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUpVariant}>
            <div className="kicker" style={{ color: 'var(--teal-200)', borderColor: 'rgba(93, 202, 165, 0.3)' }}>Your Next Step</div>
            <h2 style={{ fontSize: 'clamp(40px, 5vw, 64px)', marginBottom: '24px' }}>Build your track record today.</h2>
            <p className="lede" style={{ color: 'var(--purple-200)', marginBottom: '48px', fontSize: '20px' }}>
              Takes under a minute to join. No CV required. Start matching with verified NGOs and earning certificates that employers actually trust.
            </p>

            <div className="cta-btn-group">
              <Link className="btn btn-primary btn-glow btn-large" to="/signup?role=volunteer">
                Start Building My Profile
              </Link>
              <Link className="btn btn-outline-light btn-large" to="/signup?role=org">
                Post a Gig as an NGO
              </Link>
            </div>
            <p style={{ marginTop: '24px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>100% free for volunteers. Join 10,000+ others in Lagos.</p>
            <p style={{ marginTop: '24px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', maxWidth: '600px', margin: '24px auto 0 auto', lineHeight: '1.6' }}>
              <strong>About Ralvo:</strong> Ralvo is an application designed to connect verified non-governmental organizations (NGOs) with volunteers across Nigeria. By using our platform, volunteers can find physical and skilled opportunities, while NGOs can easily manage and issue completion certificates. We use authentication services (like Google OAuth) solely to verify user identity securely and ensure a trustworthy community environment.
            </p>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Home;
