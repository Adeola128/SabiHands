import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ErrorPage.css';

const NotFound: React.FC = () => {
  return (
    <div className="error-page">
      <motion.div 
        className="error-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 60 }}
      >
        <div className="error-code">404</div>
        <h1>Page not found</h1>
        <p>It looks like this gig doesn't exist or has been moved. Let's get you back to finding opportunities.</p>
        <Link to="/" className="btn">Back to Home</Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
