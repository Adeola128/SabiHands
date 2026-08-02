import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import './Contact.css';

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 60, damping: 15 } 
  }
};

const Contact: React.FC = () => {
  return (
    <div className="contact-page">
      <header className="contact-hero">
        <motion.div 
          className="wrap"
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
        >
          <h1>How can we help?</h1>
          <p>Send us a message and we'll get back to you as soon as possible.</p>
        </motion.div>
      </header>

      <div className="contact-container">
        <motion.form 
          className="contact-form"
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
          onSubmit={(e) => { e.preventDefault(); alert("Message sent!"); }}
        >
          <div className="field">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" placeholder="E.g. Adeola Okonkwo" required />
          </div>

          <div className="field">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" placeholder="you@example.com" required />
          </div>

          <div className="field">
            <label htmlFor="topic">How can we help you?</label>
            <select id="topic" required>
              <option value="">Select a topic</option>
              <option value="volunteer_support">I'm a volunteer needing help</option>
              <option value="org_support">I'm an organization needing help</option>
              <option value="billing">Billing & Membership</option>
              <option value="partnership">Partnership Inquiry</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea id="message" placeholder="Describe your issue or inquiry in detail..." required></textarea>
          </div>

          <button type="submit" className="submit-btn">Send Message</button>
        </motion.form>
      </div>
    </div>
  );
};

export default Contact;
