import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionButton?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, actionButton }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 24px',
      textAlign: 'center',
      backgroundColor: 'var(--white)',
      borderRadius: '20px',
      border: '1px solid #E4E1F5',
      boxShadow: '0 4px 12px rgba(38, 33, 92, 0.02)'
    }}>
      {icon && (
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'var(--purple-50)',
          color: 'var(--purple-500)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          {icon}
        </div>
      )}
      <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 12px 0', fontFamily: 'var(--display)' }}>
        {title}
      </h3>
      <p style={{ fontSize: '15px', color: 'var(--body)', margin: '0 0 24px 0', maxWidth: '400px', lineHeight: 1.6 }}>
        {description}
      </p>
      {actionButton && (
        <div>
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
