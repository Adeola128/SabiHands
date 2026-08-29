import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import './ImpactRings.css';

interface ImpactRingsProps {
  targetGigs: number;
  completedGigs: number;
  periodStart: string;
  periodEnd: string;
}

export const ImpactRings: React.FC<ImpactRingsProps> = ({ 
  targetGigs, 
  completedGigs, 
  periodStart, 
  periodEnd 
}) => {
  const [progress, setProgress] = useState(0);
  
  // Calculate percentage (max 100)
  const percentage = Math.min(Math.round((completedGigs / Math.max(targetGigs, 1)) * 100), 100);
  
  // SVG Ring values
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    // Animate progress on mount
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, 500);
    return () => clearTimeout(timer);
  }, [percentage]);

  const isComplete = completedGigs >= targetGigs;

  return (
    <div className="impact-rings-container">
      <div className="impact-header">
        <h3>Monthly Impact Goal</h3>
        <p className="period-text">{periodStart} - {periodEnd}</p>
      </div>
      
      <div className="ring-wrapper">
        <svg
          className="progress-ring"
          width="150"
          height="150"
          viewBox="0 0 150 150"
        >
          {/* Background Ring */}
          <circle
            className="progress-ring-bg"
            stroke="#e0e0e0"
            strokeWidth="12"
            fill="transparent"
            r={radius}
            cx="75"
            cy="75"
          />
          {/* Animated Progress Ring */}
          <motion.circle
            className={`progress-ring-fill ${isComplete ? 'complete' : ''}`}
            stroke={isComplete ? '#4CAF50' : '#4a90e2'}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="75"
            cy="75"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        
        {/* Center Content */}
        <div className="ring-center-content">
          {isComplete ? (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
              className="complete-icon"
            >
              <Trophy size={32} color="#4CAF50" />
            </motion.div>
          ) : (
            <div className="progress-text">
              <span className="current">{completedGigs}</span>
              <span className="divider">/</span>
              <span className="target">{targetGigs}</span>
            </div>
          )}
        </div>
      </div>

      <div className="impact-footer">
        {isComplete ? (
          <div className="completion-message">
            <p className="success-text">Goal Reached!</p>
            <button 
              className="mega-reward-btn" 
              style={{ 
                marginTop: 12, padding: '8px 16px', background: '#f5a623', 
                color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' 
              }}
              onClick={() => alert("Trigger Mega Mystery Box (Hook this up to parent UI!)")}
            >
              Claim Mega Mystery Box
            </button>
          </div>
        ) : (
          <p className="progress-hint">Complete {targetGigs - completedGigs} more gigs to close your ring and unlock a bonus!</p>
        )}
      </div>
    </div>
  );
};
