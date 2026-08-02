import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Notifications.css';

type Tab = 'all' | 'unread' | 'applications' | 'system';

interface Notification {
  id: number;
  type: 'application' | 'badge' | 'system' | 'reminder';
  title: string;
  body: string;
  time: string;
  unread: boolean;
  tab: 'applications' | 'system';
}

const notifications: Notification[] = [
  { id: 1, type: 'application', title: 'Application Approved', body: 'Tech for Good Nigeria has approved your application for the "React Developer" gig. You\'re in!', time: '2 hours ago', unread: true, tab: 'applications' },
  { id: 2, type: 'badge', title: 'Badge Unlocked: Community Champion 🏅', body: "Congratulations! You've completed 5 gigs this month and unlocked the Community Champion badge.", time: '5 hours ago', unread: true, tab: 'system' },
  { id: 3, type: 'reminder', title: 'Check-In Reminder', body: 'Your gig "Beach Cleanup & Awareness Drive" starts tomorrow at 8:00 AM. Don\'t forget to check in!', time: 'Yesterday', unread: false, tab: 'applications' },
  { id: 4, type: 'system', title: 'New Gig Recommendation', body: 'Based on your React and Node.js skills, we found 3 new gigs that might be a perfect fit for you.', time: '2 days ago', unread: false, tab: 'system' },
  { id: 5, type: 'application', title: 'Application Declined', body: 'HealthFirst Initiative was unable to accept your application for "Medical Outreach Support" at this time.', time: '3 days ago', unread: false, tab: 'applications' },
  { id: 6, type: 'system', title: 'Certificate Issued', body: 'Your certificate for "Food Drive Packaging" with Lagos Food Bank has been issued and is ready to share.', time: '5 days ago', unread: false, tab: 'system' },
];

const iconConfig = {
  application: { bg: 'var(--teal-50)', color: 'var(--teal-600)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  badge:       { bg: 'var(--purple-50)', color: 'var(--purple-600)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"/></svg> },
  reminder:    { bg: '#FFF7ED', color: '#C2410C', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  system:      { bg: 'var(--purple-50)', color: 'var(--purple-600)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> },
};

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [dismissed, setDismissed] = useState<number[]>([]);

  const tabCounts = {
    all: notifications.filter(n => !dismissed.includes(n.id)).length,
    unread: notifications.filter(n => n.unread && !dismissed.includes(n.id)).length,
    applications: notifications.filter(n => n.tab === 'applications' && !dismissed.includes(n.id)).length,
    system: notifications.filter(n => n.tab === 'system' && !dismissed.includes(n.id)).length,
  };

  const filtered = notifications.filter(n => {
    if (dismissed.includes(n.id)) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return n.unread;
    return n.tab === activeTab;
  });

  return (
    <div className="notifications-container">
      <div className="dash-card" style={{ padding: 0 }}>
        {/* Header */}
        <div className="notifications-header">
          <div className="notifications-title-area">
            <h2 className="notifications-title">Notifications</h2>
            {tabCounts.unread > 0 && (
              <span className="notifications-subtitle">You have {tabCounts.unread} unread notifications</span>
            )}
          </div>
          <button
            onClick={() => setDismissed(notifications.map(n => n.id))}
            className="notifications-mark-read"
          >
            Mark all read
          </button>
        </div>

        {/* Tab bar */}
        <div className="notifications-tabs">
          {(['all', 'unread', 'applications', 'system'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`notification-tab ${activeTab === tab ? 'active' : ''}`}
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tabCounts[tab] > 0 && (
                <span className="notification-badge">
                  {tabCounts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        <div className="notifications-list">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="notifications-empty">
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>All caught up!</div>
                <div style={{ fontSize: '15px', color: 'var(--muted)' }}>No {activeTab !== 'all' ? activeTab + ' ' : ''}notifications right now.</div>
              </motion.div>
            ) : (
              filtered.map((n, i) => {
                const icon = iconConfig[n.type];
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className={`notification-item ${n.unread ? 'unread' : ''}`}
                  >
                    {/* Icon */}
                    <div className="notification-icon" style={{ backgroundColor: icon.bg, color: icon.color }}>
                      {icon.icon}
                    </div>

                    {/* Body */}
                    <div className="notification-body">
                      <div className="notification-header">
                        <h4 className="notification-item-title">
                          {n.unread && <span className="unread-dot" />}
                          {n.title}
                        </h4>
                        <span className="notification-time">{n.time}</span>
                      </div>
                      <p className="notification-text">{n.body}</p>
                    </div>

                    {/* Dismiss */}
                    <button
                      onClick={() => setDismissed(prev => [...prev, n.id])}
                      title="Dismiss"
                      className="notification-dismiss"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
