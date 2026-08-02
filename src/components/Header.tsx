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
            <path d="M60 15 A35 35 0 1 0 60 85" fill="none" stroke="#7F77DD" strokeWidth="16" strokeLinecap="round"/>
            <path d="M40 15 A35 35 0 1 1 40 85" fill="none" stroke="#1D9E75" strokeWidth="16" strokeLinecap="round"/>
          </svg>
          <span>SabiHands</span>
        </Link>
        <div className={`nav-links ${isOpen ? 'open' : ''}`}>
          <a href="#how" onClick={() => setIsOpen(false)}>How it works</a>
          <a href="#audiences" onClick={() => setIsOpen(false)}>For volunteers</a>
          <a href="#audiences" onClick={() => setIsOpen(false)}>For NGOs &amp; companies</a>
          <a href="#certificate" onClick={() => setIsOpen(false)}>The certificate</a>
          <Link className="btn btn-solid-purple" to="/login" style={{ marginTop: '4px' }} onClick={() => setIsOpen(false)}>
            Get started
          </Link>
        </div>
        <button 
          className="nav-toggle" 
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
