import React from 'react';
import { Link } from 'react-router-dom';
import './RolePages.css'; // Shared CSS for role landing pages

const ForVolunteers: React.FC = () => {
  return (
    <div className="role-page">
      <header className="hero hero-volunteer">
        <div className="wrap hero-content text-center">
          <div className="eyebrow" style={{ color: 'var(--teal-200)' }}>For Volunteers</div>
          <h1 className="text-display">Show up. Get sabi. Become a Sabi Hand.</h1>
          <p className="hero-sub mx-auto">
            You don't need a 5-year degree to prove you can do the work. SabiHands connects you with real NGOs and companies in Lagos. Complete a gig, get a verified certificate, and build a track record they can't ignore.
          </p>
          <div className="hero-actions center-actions mt-32">
            <Link to="/signup/volunteer" className="btn-primary btn-large">Create your profile</Link>
          </div>
        </div>
      </header>

      <section className="block">
        <div className="wrap">
          <h2 className="section-title text-center">Why volunteer with us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <img src="/images/real_world_proof.png" alt="Real-world proof" className="feature-img" />
              <h3>Real-world proof</h3>
              <p>Every completed gig turns into a SabiHands certificate you can share on LinkedIn or add to your CV.</p>
            </div>
            <div className="feature-card">
              <img src="/images/direct_connections.png" alt="Direct connections" className="feature-img" />
              <h3>Direct connections</h3>
              <p>Work directly with founders and teams at Lagos NGOs and startups. Build your network by doing.</p>
            </div>
            <div className="feature-card">
              <img src="/images/diverse_gigs.png" alt="Diverse gigs" className="feature-img" />
              <h3>Diverse gigs</h3>
              <p>From social media design and coding a landing page, to distributing relief materials on a Saturday.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForVolunteers;
