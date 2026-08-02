import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import './Home.css';

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

const Home: React.FC = () => {
  return (
    <div className="home-page">

      {/* Hero Section */}
      <header className="hero" id="top">
        <div className="wrap hero-inner">
          <motion.div
            className="hero-copy"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUpVariant}
          >
            <div className="eyebrow">Lagos, Nigeria · Volunteer marketplace</div>
            <h1>You're not just volunteering.<br /><em>You're a Sabi Hand.</em></h1>
            <p className="hero-sub">Post a gig in minutes, or apply in a few taps. Show up, and walk away with a certificate that proves it — verified and automatic, every time.</p>
            <div className="hero-ctas">
              <Link className="btn btn-solid-purple" to="/signup?role=volunteer">Find a gig</Link>
              <Link className="btn btn-outline-teal" to="/signup?role=org">Post a gig</Link>
            </div>
            <div className="trust-bar">
              <div className="trust-item"><b>1.7M</b>grads enter the job market yearly</div>
              <div className="trust-item"><b>191,278</b>registered NGOs in Nigeria</div>
              <div className="trust-item"><b>Lagos</b>first, before anywhere else</div>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUpVariant}
          >
            <div className="orb orb-a">
              <img src="https://images.unsplash.com/photo-1616680214084-22670de1bc82?auto=format&fit=crop&w=700&q=80" alt="Young volunteers working together outdoors" />
            </div>
            <div className="orb orb-b">
              <img src="https://images.unsplash.com/photo-1563132337-f159f484226c?auto=format&fit=crop&w=700&q=80" alt="An organization representative ready to post a gig" />
            </div>
            <div className="hero-tag">
              <svg viewBox="0 0 100 100">
                <path d="M60 15 A35 35 0 1 0 60 85" fill="none" stroke="#7F77DD" strokeWidth="16" strokeLinecap="round" />
                <path d="M40 15 A35 35 0 1 1 40 85" fill="none" stroke="#1D9E75" strokeWidth="16" strokeLinecap="round" />
              </svg>
              <span>Volunteer meets org</span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Problem Section */}
      <section className="problem">
        <motion.div
          className="wrap problem-inner"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUpVariant}
        >
          <div className="eyebrow">The gap</div>
          <p className="problem-statement">"You can't get hired without experience.<br />You can't get experience without being hired."</p>
          <p className="problem-body">Every skilled young Nigerian who finishes a course or graduates hits this wall — it isn't optional, it's the next step for the entire cohort. Today, the only options are informal WhatsApp groups, flyers, or generic global directories that aren't built for Nigeria and issue no proof of work.</p>
          <div className="problem-stats">
            <div className="stat"><b>1.7M</b><span>graduates enter Nigeria's job market every year</span></div>
            <div className="stat"><b>191,278</b><span>NGOs recruiting almost entirely by word of mouth</span></div>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="how" id="how">
        <div className="wrap">
          <motion.div
            className="how-head"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUpVariant}
          >
            <div className="eyebrow">How it works</div>
            <h2>Three steps, from post to proof.</h2>
          </motion.div>

          <motion.div
            className="how-steps"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <svg className="how-connector" viewBox="0 0 800 40" preserveAspectRatio="none">
              <path d="M130 8 C 280 55, 320 -35, 400 8" fill="none" stroke="#AFA9EC" strokeWidth="2" strokeDasharray="1 10" strokeLinecap="round" />
              <path d="M400 8 C 480 55, 520 -35, 670 8" fill="none" stroke="#5DCAA5" strokeWidth="2" strokeDasharray="1 10" strokeLinecap="round" />
            </svg>
            <motion.div className="step" variants={fadeUpVariant}>
              <div className="step-badge"><span>01</span></div>
              <h3>Post</h3>
              <p>A verified NGO or company posts a gig — skilled or physical, one-off or recurring.</p>
            </motion.div>
            <motion.div className="step" variants={fadeUpVariant}>
              <div className="step-badge"><span>02</span></div>
              <h3>Match</h3>
              <p>Volunteers browse and apply. The organization picks who shows up.</p>
            </motion.div>
            <motion.div className="step" variants={fadeUpVariant}>
              <div className="step-badge"><span>03</span></div>
              <h3>Certify</h3>
              <p>On completion, SabiHands issues a verified certificate — instantly, automatically.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Audiences */}
      <section className="audiences" id="audiences">
        <div className="wrap">
          <motion.div
            className="how-head"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUpVariant}
          >
            <div className="eyebrow">Built for both sides</div>
            <h2>Whichever side you're on, you get more than a listing.</h2>
          </motion.div>

          <motion.div
            className="aud-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <motion.div className="aud-card" variants={fadeUpVariant}>
              <div className="aud-photo">
                <img src="https://images.unsplash.com/photo-1628717341663-0007b0ee2597?auto=format&fit=crop&w=800&q=80" alt="A young volunteer taking part in a community cleanup gig" />
                <span>Show up. Get sabi.</span>
              </div>
              <div className="aud-body">
                <h3>For volunteers</h3>
                <ul>
                  <li>Browse real gigs — skilled or physical</li>
                  <li>Apply in a few taps, no CV needed to start</li>
                  <li>Walk away with a verified certificate</li>
                  <li>Build a track record employers can trust</li>
                </ul>
                <Link className="btn btn-solid-purple" to="/signup/volunteer">Find a gig</Link>
              </div>
            </motion.div>

            <motion.div className="aud-card teal" variants={fadeUpVariant}>
              <div className="aud-photo">
                <img src="https://images.unsplash.com/photo-1655720357872-ce227e4164ba?auto=format&fit=crop&w=800&q=80" alt="A team from an organization planning a gig posting" />
                <span>Real hands. Real gigs. Real proof.</span>
              </div>
              <div className="aud-body">
                <h3>For NGOs &amp; companies</h3>
                <ul>
                  <li>Post a gig in minutes — skilled or physical</li>
                  <li>Reach a pool of vetted, motivated volunteers</li>
                  <li>Issue certificates automatically on completion</li>
                  <li>Skip the WhatsApp-group recruiting grind</li>
                </ul>
                <Link className="btn btn-solid-teal" to="/signup/organization">Post a gig</Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Certificate Section */}
      <section className="certificate" id="certificate">
        <div className="wrap cert-inner">
          <motion.div
            className="cert-copy"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUpVariant}
          >
            <div className="eyebrow">The proof</div>
            <h2>The certificate is the whole point.</h2>
            <p>An organization confirms you showed up. SabiHands takes it from there — no paperwork, no waiting, no chasing anyone down for a signature.</p>
            <div className="cert-mini">
              <svg viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
              <p>Issued the moment a gig is marked complete — automatically.</p>
            </div>
            <div className="cert-mini">
              <svg viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
              <p>Verifiable by anyone with the link — an employer, a school, another NGO.</p>
            </div>
            <div className="cert-mini">
              <svg viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
              <p>Every certificate adds to a track record that compounds over time.</p>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUpVariant}
          >
            <div className="cert-card">
              <div className="cert-top">
                <svg viewBox="0 0 100 100">
                  <path d="M60 15 A35 35 0 1 0 60 85" fill="none" stroke="#7F77DD" strokeWidth="16" strokeLinecap="round" />
                  <path d="M40 15 A35 35 0 1 1 40 85" fill="none" stroke="#1D9E75" strokeWidth="16" strokeLinecap="round" />
                </svg>
                <span>Certified Sabi Hand</span>
              </div>
              <div className="cert-title">Awarded to</div>
              <div className="cert-name">Ade Okonkwo</div>
              <div className="cert-detail"><b>Gig:</b> Beach Cleanup — Lagos Environmental Trust</div>
              <div className="cert-detail"><b>Completed:</b> 14 gigs · 62 volunteer hours</div>
              <div className="cert-footer">
                <div className="cert-verified">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                  Verified
                </div>
                <div className="cert-code">sabihands.ng/verify/SH-2941</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Lagos */}
      <section className="why-lagos">
        <img className="why-bg" src="https://images.unsplash.com/photo-1572727850654-f50a7ead20df?auto=format&fit=crop&w=1600&q=80" alt="Lagos, Nigeria skyline" />
        <motion.div
          className="wrap why-inner"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUpVariant}
        >
          <div className="eyebrow">Why South West & North Central Nigeria, why now</div>
          <h2>A large, informal market that no one has packaged yet.</h2>
          <p className="lede">Not Catchafire — US-only, professional-skills only. Not a global directory. Not word of mouth. Nothing today packages short-term Nigerian gigs, verification, and certification in one place.</p>
          <div className="why-stats">
            <div className="stat"><b>45M+</b><span>people living in South West & North Central Nigeria - our launch markets</span></div>
            <div className="stat"><b>191,278</b><span>NGOs registered with Nigeria's CAC</span></div>
            <div className="stat"><b>1.7M</b><span>new graduates a year, nationally</span></div>
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="final-cta" id="final-cta">
        <div className="final-cta-bg-mesh">
          <div className="mesh-blob blob-3"></div>
          <div className="mesh-blob blob-4"></div>
        </div>
        <motion.div 
          className="wrap"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <motion.h2 variants={fadeUpVariant}>
            You're not just volunteering.<br/>
            <em className="gradient-text-alt">You're a Sabi Hand.</em>
          </motion.h2>
          <motion.p variants={fadeUpVariant}>Let's build the home for showing up in South West & North Central Nigeria.</motion.p>
          <motion.div className="final-ctas" variants={fadeUpVariant}>
            <Link className="btn btn-solid-teal hover-scale" to="/signup/volunteer">Find a gig</Link>
            <Link className="btn btn-outline-white hover-scale" to="/signup/organization">Post a gig</Link>
          </motion.div>
        </motion.div>
      </section>

    </div>
  );
};

export default Home;
