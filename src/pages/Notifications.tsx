import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Notifications.css';

type Tab = 'all' | 'unread' | 'applications' | 'system';

interface Notification {
  id: string;
  type: 'application' | 'badge' | 'system' | 'reminder';
  title: string;
  body: string;
  time: string;
  unread: boolean;
  tab: 'applications' | 'system';
}

const iconConfig = {
  application: { bg: 'var(--teal-50)', color: 'var(--teal-600)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  badge:       { bg: 'var(--purple-50)', color: 'var(--purple-600)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"/></svg> },
  reminder:    { bg: '#FFF7ED', color: '#C2410C', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  system:      { bg: 'var(--purple-50)', color: 'var(--purple-600)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> },
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" }) + ' ' + date.toLocaleTimeString("en-NG", { hour: '2-digit', minute: '2-digit' });
};

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        const formatted = data.map((n: any): Notification => {
          let title = 'Notification';
          let body = 'You have a new notification';
          let type: 'application' | 'badge' | 'system' | 'reminder' = 'system';
          let tab: 'applications' | 'system' = 'system';

          if (n.type === 'application_accepted') {
            title = 'Application Approved';
            body = 'Your gig application has been approved.';
            type = 'application';
            tab = 'applications';
          } else if (n.type === 'application_declined') {
            title = 'Application Declined';
            body = 'Your gig application was declined.';
            type = 'application';
            tab = 'applications';
          } else if (n.type === 'new_message') {
            title = 'New Message';
            body = 'You received a new message.';
            type = 'system';
            tab = 'system';
          } else if (n.type && n.type.includes('application')) {
            title = 'Application Update';
            body = 'There is an update to your application.';
            type = 'application';
            tab = 'applications';
          }

          return {
            id: n.id,
            type,
            title,
            body,
            time: formatTime(n.created_at),
            unread: !n.is_read,
            tab
          };
        });
        setNotifications(formatted);
      }
    };
    fetchNotifications();
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
  };

  const dismissNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const tabCounts = {
    all: notifications.length,
    unread: notifications.filter(n => n.unread).length,
    applications: notifications.filter(n => n.tab === 'applications').length,
    system: notifications.filter(n => n.tab === 'system').length,
  };

  const filtered = notifications.filter(n => {
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
            onClick={markAllRead}
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
                const icon = iconConfig[n.type] || iconConfig['system'];
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
                      onClick={() => dismissNotification(n.id)}
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
