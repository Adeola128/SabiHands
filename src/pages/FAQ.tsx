import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import './FAQ.css';

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 60, damping: 15 } 
  }
};

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
      <button className="faq-question" onClick={() => setIsOpen(!isOpen)}>
        {question}
        <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: 'hidden' }}
          >
            <div className="faq-answer">
              <p>{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ: React.FC = () => {
  return (
    <div className="faq-page">
      <header className="faq-hero">
        <motion.div 
          className="wrap"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariant}
        >
          <h1>Frequently Asked Questions</h1>
        </motion.div>
      </header>

      <div className="faq-container">
        <motion.div 
          className="faq-group"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariant}
        >
          <h2>For Volunteers</h2>
          <FAQItem 
            question="Do I need a CV to apply for gigs?" 
            answer="No! Ralvo is built so you can start without a CV. Organizations select you based on your profile and availability. Once you complete gigs, your verifiable Ralvo certificates become your track record." 
          />
          <FAQItem 
            question="Are the gigs paid?" 
            answer="Ralvo is a volunteering marketplace. Most gigs are unpaid, designed to give you real-world experience, networking opportunities, and verifiable proof of your skills. However, some organizations may offer a stipend for transport or lunch, which will be stated in the gig description." 
          />
          <FAQItem 
            question="How do I get my certificate?" 
            answer="Once you complete a gig, the organization confirms your attendance through their dashboard. As soon as they confirm, Ralvo automatically generates a verifiable digital certificate for you, which appears in your profile." 
          />
        </motion.div>

        <motion.div 
          className="faq-group"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariant}
        >
          <h2>For Organizations</h2>
          <FAQItem 
            question="How much does it cost to post a gig?" 
            answer="Our Community plan allows you to post up to 2 gigs per month completely free! If you need unlimited gig postings and automatic certificates, you can upgrade to Sabi Pro for â‚¦15,000/month." 
          />
          <FAQItem 
            question="How do you verify volunteers?" 
            answer="Volunteers build their reputation on the platform. Every time they successfully complete a gig, they earn a certificate. You can view their profile to see their past completed gigs and reliability rating before accepting them." 
          />
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;

