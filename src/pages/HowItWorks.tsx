import React from 'react';
import { Link } from 'react-router-dom';
import './HowItWorks.css';

const HowItWorks: React.FC = () => {
  return (
    <div className="how-it-works">
      <header className="page-header">
        <div className="wrap">
          <h1 className="text-display">How Gigway Works</h1>
          <p className="page-lede">Three simple steps. No endless WhatsApp messages. No fake certificates.</p>
        </div>
      </header>

      <section className="block">
        <div className="wrap">
          <div className="hiw-step">
            <div className="hiw-text">
              <div className="step-badge">1</div>
              <h2>Organizations Post a Gig</h2>
              <p>NGOs and verified companies post what they need. It could be an afternoon distributing food, a weekend of data entry, or a month of social media design.</p>
              <ul>
                <li>Specify required skills or physical effort</li>
                <li>Set clear time commitments</li>
                <li>Preview the certificate that will be issued</li>
              </ul>
            </div>
            <div className="hiw-visual purple-bg" style={{ padding: 0, overflow: 'hidden' }}>
              <img src="/images/org_posting_gig.png" alt="Organization posting a gig" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

          <div className="hiw-step reverse">
            <div className="hiw-text">
              <div className="step-badge">2</div>
              <h2>Volunteers Apply & Match</h2>
              <p>Young Nigerians browse gigs that fit their skills and schedule. Organizations review applications and select the best fit, completely replacing the chaos of open WhatsApp groups.</p>
              <ul>
                <li>Build a profile of verified experience</li>
                <li>Direct messaging between org and volunteer</li>
                <li>Clear expectations set before day one</li>
              </ul>
            </div>
            <div className="hiw-visual teal-bg" style={{ padding: 0, overflow: 'hidden' }}>
              <img src="/images/volunteers_applying.png" alt="Volunteers applying" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

          <div className="hiw-step">
            <div className="hiw-text">
              <div className="step-badge">3</div>
              <h2>Confirm & Certify</h2>
              <p>The work happens. Once the organization marks the gig as complete and confirms attendance, a verifiable Gigway certificate is automatically generated.</p>
              <ul>
                <li>No manual certificate creation</li>
                <li>Shareable link for resumes and LinkedIn</li>
                <li>Proof of real-world impact</li>
              </ul>
            </div>
            <div className="hiw-visual purple-light-bg" style={{ padding: 0, overflow: 'hidden' }}>
              <img src="/images/automated_certificates.png" alt="Certificate generated" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="block alt cta-section">
        <div className="wrap text-center">
          <h2>Ready to get started?</h2>
          <div className="cta-actions">
            <Link to="/signup/volunteer" className="btn-primary btn-large">Join as a Volunteer</Link>
            <Link to="/signup/organization" className="btn-secondary btn-large" style={{color: 'var(--purple-900)', border: '1px solid var(--purple-200)'}}>Post a Gig</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;

