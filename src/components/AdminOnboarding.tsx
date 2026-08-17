import React, { useState, useEffect } from 'react';

const AdminOnboarding: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Review pending organizations', completed: false },
    { id: 2, text: 'Check recent gigs', completed: false },
    { id: 3, text: 'Invite team members', completed: false }
  ]);

  useEffect(() => {
    // Only show if they haven't dismissed it before (mock implementation)
    const hasSeenOnboarding = localStorage.getItem('ralvo_admin_onboarding_dismissed');
    if (!hasSeenOnboarding) {
      // Slight delay for smoother UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem('ralvo_admin_onboarding_dismissed', 'true');
  };

  if (!isVisible) return null;

  const completedCount = tasks.filter(t => t.completed).length;
  const allDone = completedCount === tasks.length;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '320px',
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      border: '1px solid #E2E8F0',
      zIndex: 100,
      overflow: 'hidden',
      transition: 'transform 0.3s ease-in-out',
      transform: isVisible ? 'translateY(0)' : 'translateY(120%)'
    }}>
      {/* Header */}
      <div 
        onClick={() => setIsMinimized(!isMinimized)}
        style={{ 
          padding: '16px', 
          backgroundColor: '#3B82F6', 
          color: 'white', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        <div style={{ fontWeight: 600, fontSize: '14px' }}>
          Getting Started {completedCount}/{tasks.length}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isMinimized ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); dismiss(); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <div style={{ padding: '16px' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748B' }}>
            Welcome to the new admin dashboard. Here are a few things to check out first.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasks.map(task => (
              <label key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <div 
                  onClick={() => toggleTask(task.id)}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '6px',
                    border: `2px solid ${task.completed ? '#10B981' : '#CBD5E1'}`,
                    backgroundColor: task.completed ? '#10B981' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s'
                  }}
                >
                  {task.completed && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  )}
                </div>
                <span style={{ 
                  fontSize: '14px', 
                  color: task.completed ? '#94A3B8' : '#0F172A',
                  textDecoration: task.completed ? 'line-through' : 'none',
                  transition: 'all 0.2s'
                }}>
                  {task.text}
                </span>
              </label>
            ))}
          </div>

          {allDone && (
            <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', color: '#166534', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
              You're all set! 🎉
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOnboarding;
