import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ErrorPage.css';

const ErrorPage: React.FC = () => {
  const error = useRouteError() as any;

  return (
    <div className="error-page">
      <motion.div 
        className="error-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 60 }}
      >
        <div className="error-code">Oops</div>
        <h1>Something went wrong</h1>
        <p>We hit a snag trying to load this page. {error?.statusText || error?.message}</p>
        <Link to="/" className="btn">Back to Home</Link>
      </motion.div>
    </div>
  );
};

export default ErrorPage;
