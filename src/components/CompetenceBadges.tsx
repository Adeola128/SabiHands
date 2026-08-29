import React from 'react';
import { Shield, Clock, Star, Users } from 'lucide-react';
import './CompetenceBadges.css';

export interface BadgeData {
  id: string;
  title: string;
  description: string;
  iconType: 'hours' | 'rating' | 'gigs' | 'referrals';
  earnedAt?: string;
  isEarned: boolean;
  progressValue: number;
  targetValue: number;
}

interface CompetenceBadgesProps {
  badges: BadgeData[];
}

export const CompetenceBadges: React.FC<CompetenceBadgesProps> = ({ badges }) => {
  const renderIcon = (type: string, isEarned: boolean) => {
    const color = isEarned ? "#4a90e2" : "#ccc";
    switch (type) {
      case 'hours': return <Clock size={28} color={color} />;
      case 'rating': return <Star size={28} color={color} />;
      case 'gigs': return <Shield size={28} color={color} />;
      case 'referrals': return <Users size={28} color={color} />;
      default: return <Shield size={28} color={color} />;
    }
  };

  return (
    <div className="competence-badges-section">
      <h3>Verified Competence</h3>
      <p className="subtitle">Badges earned through proven impact, not just participation.</p>

      <div className="badges-grid">
        {badges.map((badge) => (
          <div key={badge.id} className={`badge-card ${badge.isEarned ? 'earned' : 'locked'}`}>
            <div className="badge-icon-wrapper">
              {renderIcon(badge.iconType, badge.isEarned)}
            </div>
            
            <div className="badge-info">
              <h4>{badge.title}</h4>
              <p>{badge.description}</p>
              
              {!badge.isEarned && (
                <div className="badge-progress">
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${Math.min((badge.progressValue / badge.targetValue) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="progress-text">{badge.progressValue} / {badge.targetValue}</span>
                </div>
              )}
              {badge.isEarned && badge.earnedAt && (
                <span className="earned-date">Earned {new Date(badge.earnedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
