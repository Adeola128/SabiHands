import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './MainLayout.css';
import { Link } from 'react-router-dom';
import './MinimalProfileLayout.css';
import Community from '../pages/Community';

const CommunityLayoutWrapper: React.FC = () => {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="layout-root">
        <Header />
        <main className="layout-main">
          <Community />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="minimal-layout-root">
      <nav className="minimal-nav">
        <div className="minimal-nav-inner">
          <Link className="minimal-brand" to="/">
            <img src="/logo.png" alt="Ralvo Logo" style={{ height: '24px', width: 'auto' }} />
            <span>Ralvo</span>
          </Link>
          
          <div className="minimal-actions">
            <Link to="/login" className="minimal-login-btn">
              Log in
            </Link>
            <Link to="/signup?role=volunteer" className="minimal-signup-btn">
              Join Ralvo
            </Link>
          </div>
        </div>
      </nav>
      
      <main className="minimal-main">
        <Community />
      </main>
    </div>
  );
};

export default CommunityLayoutWrapper;
