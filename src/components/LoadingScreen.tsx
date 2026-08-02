import React from 'react';
import { motion } from 'framer-motion';
import './LoadingScreen.css';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...', fullScreen = false }) => {
  return (
    <div className={`loading-screen-container ${fullScreen ? 'fullscreen' : 'inline'}`}>
      <div className="loading-screen-content">
        <div className="spinner-wrapper">
          <motion.div 
            className="spinner-circle primary"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
          <motion.div 
            className="spinner-circle secondary"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
          <motion.div 
            className="spinner-dot"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
        </div>
        
        <motion.p 
          className="loading-message"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingScreen;
