import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './MinimalProfileLayout.css';

const MinimalProfileLayout: React.FC = () => {
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
        <Outlet />
      </main>
    </div>
  );
};

export default MinimalProfileLayout;
