import React from 'react';
import { Link } from 'react-router-dom';

interface ProfileCompletenessPromptProps {
  score: number;
  nextStep: string | null;
  editLink: string;
}

const ProfileCompletenessPrompt: React.FC<ProfileCompletenessPromptProps> = ({ score, nextStep, editLink }) => {
  if (score >= 100) return null;

  return (
    <div style={{
      backgroundColor: 'var(--white)',
      border: '1px solid #E4E1F5',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 4px 20px rgba(38,33,92,0.03)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px 0' }}>
            Profile Completeness: {score}%
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--body)', margin: 0 }}>
            A complete profile helps you stand out and build trust within the community.
          </p>
        </div>
        <Link 
          to={editLink} 
          style={{ 
            backgroundColor: 'var(--purple-50)', 
            color: 'var(--purple-700)', 
            padding: '8px 16px', 
            borderRadius: '99px', 
            textDecoration: 'none', 
            fontSize: '13px', 
            fontWeight: 700,
            display: 'inline-block',
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--purple-100)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--purple-50)'}
        >
          Edit Profile
        </Link>
      </div>

      <div style={{ 
        height: '8px', 
        backgroundColor: '#F3F2F9', 
        borderRadius: '99px', 
        overflow: 'hidden',
        marginBottom: '16px'
      }}>
        <div style={{ 
          height: '100%', 
          backgroundColor: 'var(--teal-500)', 
          width: `${score}%`,
          borderRadius: '99px',
          transition: 'width 0.5s ease-out'
        }} />
      </div>

      {nextStep && (
        <div style={{ fontSize: '13px', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--purple-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          <strong>Next step:</strong> Add your {nextStep} to increase your score.
        </div>
      )}
    </div>
  );
};

export default ProfileCompletenessPrompt;
