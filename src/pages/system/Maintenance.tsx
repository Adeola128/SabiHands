import React from 'react';

const Maintenance: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FAFAFC',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: 'var(--white)',
        borderRadius: '24px',
        padding: '48px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(38, 33, 92, 0.06)'
      }}>
        <div style={{
          width: '88px',
          height: '88px',
          borderRadius: '50%',
          backgroundColor: '#DBEAFE',
          color: '#2563EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        </div>
        
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 16px 0', fontFamily: 'var(--display)' }}>
          We'll be back soon!
        </h1>
        
        <p style={{ fontSize: '16px', color: 'var(--body)', margin: '0 0 32px 0', lineHeight: 1.6 }}>
          Gigway is currently undergoing scheduled maintenance to improve our platform. We expect to be back online shortly. Thank you for your patience!
        </p>

        <div style={{ padding: '16px', backgroundColor: '#F1F5F9', borderRadius: '12px', color: '#475569', fontSize: '14px', fontWeight: 600 }}>
          Estimated downtime: 2 hours
        </div>
      </div>
    </div>
  );
};

export default Maintenance;

