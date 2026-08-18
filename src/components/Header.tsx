import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link className="brand" to="/">
          <img src="/logo.png" alt="Ralvo Logo" style={{ height: '24px', width: 'auto' }} />
          <span>Ralvo</span>
        </Link>
        <div className={`nav-links ${isOpen ? 'open' : ''}`}>
          <a href="#how" onClick={() => setIsOpen(false)}>How it works</a>
          <a href="#audiences" onClick={() => setIsOpen(false)}>For volunteers</a>
          <a href="#audiences" onClick={() => setIsOpen(false)}>For NGOs &amp; companies</a>
          <a href="#certificate" onClick={() => setIsOpen(false)}>The certificate</a>
          <Link className="btn btn-primary" to="/signup?role=volunteer" onClick={() => setIsOpen(false)}>
            Get started
          </Link>
        </div>
        <button 
          className={`nav-toggle ${isOpen ? 'open' : ''}`} 
          aria-label="Open menu"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
};

export default Header;
