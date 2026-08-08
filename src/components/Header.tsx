import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link className="brand" to="/">
          <svg viewBox="0 0 100 100">
            <path d="M20 15 L75 50" fill="none" stroke="#7F77DD" strokeWidth="16" strokeLinecap="round"/>
            <path d="M20 85 L75 50" fill="none" stroke="#1D9E75" strokeWidth="16" strokeLinecap="round"/>
          </svg>
          <span>Gigway</span>
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
