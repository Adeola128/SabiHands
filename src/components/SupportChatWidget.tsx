import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';

export interface SupportMessage {
  id: string;
  sender: 'user' | 'support';
  text: string;
  timestamp: string;
}

const EXCLUDED_ROUTES = [
  '/login', '/signup', '/forgot-password', '/reset-password',
  '/verify-contact', '/onboarding', '/hq-login', '/hq', '/join-team'
];

const THEME_COLOR = '#112A46';

// Reusable SVG Icons
const Icons = {
  Send: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '2px' }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  Message: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>,
  Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  CloseSmall: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Hide: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>,
  Back: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  User: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  SupportAvatar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>,
  MenuIcon: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>,
  ChevronRight: () => <svg style={{ marginLeft: 'auto', color: '#94A3B8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
  ExternalLink: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>,
  AlertTriangle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  
  // Topic Icons
  Onboarding: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  Billing: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>,
  TechSupport: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  GettingStarted: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
  UsingPlatform: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>,
};

const SupportChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'menu' | 'chat'>('menu');
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('sabihands_support_chat');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      const initMsg: SupportMessage = {
        id: Date.now().toString(),
        sender: 'support',
        text: 'Hello there! How can we help you today?',
        timestamp: new Date().toISOString()
      };
      setMessages([initMsg]);
      localStorage.setItem('sabihands_support_chat', JSON.stringify([initMsg]));
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sabihands_support_chat' && e.newValue) {
        setMessages(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    
    const handleCustom = () => {
      const saved = localStorage.getItem('sabihands_support_chat');
      if (saved) setMessages(JSON.parse(saved));
    };
    window.addEventListener('sabihands_chat_update', handleCustom);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sabihands_chat_update', handleCustom);
    };
  }, []);

  // Ensure scroll is at the bottom when new message arrives or view switches to chat
  useEffect(() => {
    if (isOpen && currentView === 'chat') {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isOpen, currentView]);

  const handleSendText = (text: string) => {
    if (!text.trim()) return;

    const newMsg: SupportMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    setInputText('');
    
    localStorage.setItem('sabihands_support_chat', JSON.stringify(updated));
    window.dispatchEvent(new Event('sabihands_chat_update'));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendText(inputText);
  };

  const handleHideWidget = () => {
    setIsOpen(false);
  };

  const isExcludedRoute = location.pathname === '/' || EXCLUDED_ROUTES.some(route => location.pathname.startsWith(route));

  if (isExcludedRoute) {
    return null;
  }

  return (
    <>
      <style>
        {`
          .support-btn:hover {
            transform: scale(1.05) translateY(-5px) !important;
            box-shadow: 0 15px 30px -5px rgba(17, 42, 70, 0.4) !important;
          }
          .chat-bubble-user {
            border-bottom-right-radius: 4px !important;
          }
          .chat-bubble-support {
            border-bottom-left-radius: 4px !important;
          }
          .menu-item:hover {
            background-color: #F8FAFC !important;
            transform: translateX(4px);
          }
          .quick-reply-btn:hover {
            background-color: #F1F5F9;
            border-color: ${THEME_COLOR};
          }
          
          /* Custom scrollbar for chat area to make it cleaner and stop background scrolling */
          .chat-scroll-area {
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
          }
          .chat-scroll-area::-webkit-scrollbar {
            width: 6px;
          }
          .chat-scroll-area::-webkit-scrollbar-track {
            background: transparent;
          }
          .chat-scroll-area::-webkit-scrollbar-thumb {
            background: #CBD5E1;
            border-radius: 10px;
          }
          .chat-scroll-area::-webkit-scrollbar-thumb:hover {
            background: #94A3B8;
          }
        `}
      </style>

      {/* Floating Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: isOpen ? 'scale(0)' : 'scale(1)',
          pointerEvents: isOpen ? 'none' : 'auto',
        }}
      >
        <button 
          className="support-btn"
          onClick={() => { setIsOpen(true); setCurrentView('menu'); }}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: THEME_COLOR,
            color: 'white',
            border: 'none',
            boxShadow: '0 10px 25px -5px rgba(17, 42, 70, 0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
          title="Chat with Support"
        >
          <Icons.Message />
        </button>
      </div>

      {/* Main Widget Container */}
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '360px',
          height: '620px',
          maxWidth: 'calc(100vw - 48px)',
          maxHeight: 'calc(100vh - 48px)',
          backgroundColor: currentView === 'menu' ? THEME_COLOR : '#F8FAFC',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'opacity 0.3s ease, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.3s ease',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.9)',
          pointerEvents: isOpen ? 'auto' : 'none',
          overscrollBehavior: 'contain',
        }}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* --- MENU VIEW --- */}
        {currentView === 'menu' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto' }}>
            {/* Menu Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: 'white' }}>
              <Icons.MenuIcon />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={handleHideWidget}
                  title="Disable Support Widget Permanently"
                  style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                >
                  <Icons.Hide />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  title="Close Window"
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                >
                  <Icons.CloseSmall />
                </button>
              </div>
            </div>
            
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: '24px 0 8px 0', letterSpacing: '-0.02em' }}>
              Hello! Need any help?
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', margin: '0 0 32px 0', flexShrink: 0 }}>
              Find answers, explore topics, or reach out
            </p>

            <div className="chat-scroll-area" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '4px', paddingBottom: '20px', overscrollBehavior: 'contain' }}>
              {/* Chat Card */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', flexShrink: 0 }}>
                <div style={{ padding: '16px', fontWeight: 600, fontSize: '16px', color: '#0F172A', borderBottom: '1px solid #F1F5F9' }}>
                  Chat with us
                </div>
                <div>
                  {[
                    { label: 'Urgent Issue / Immediate Attention', icon: <Icons.AlertTriangle /> },
                    { label: 'Onboarding Assistance', icon: <Icons.Onboarding /> },
                    { label: 'Billing & Payments', icon: <Icons.Billing /> },
                    { label: 'Technical Support', icon: <Icons.TechSupport /> }
                  ].map(item => (
                    <div 
                      key={item.label}
                      className="menu-item"
                      onClick={() => setCurrentView('chat')}
                      style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9', transition: 'all 0.2s', backgroundColor: 'white' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F8FAFC' }}>
                        {item.icon}
                      </div>
                      <span style={{ fontSize: '15px', color: '#334155', fontWeight: 500 }}>{item.label}</span>
                      <Icons.ChevronRight />
                    </div>
                  ))}
                </div>
              </div>

              {/* KB Card */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', flexShrink: 0 }}>
                <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ fontWeight: 600, fontSize: '16px', color: '#0F172A' }}>Knowledge base</div>
                  <Icons.ExternalLink />
                </div>
                <div>
                  {[
                    { label: 'Getting started', icon: <Icons.GettingStarted /> },
                    { label: 'Using the platform', icon: <Icons.UsingPlatform /> },
                    { label: 'Account & Billing', icon: <Icons.Billing /> } // Reused Billing icon
                  ].map(item => (
                    <div 
                      key={item.label}
                      className="menu-item"
                      onClick={() => window.location.href = '/faq'}
                      style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9', transition: 'all 0.2s', backgroundColor: 'white' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F8FAFC' }}>
                        {item.icon}
                      </div>
                      <span style={{ fontSize: '15px', color: '#334155', fontWeight: 500 }}>{item.label}</span>
                    </div>
                  ))}
                  <div 
                    onClick={() => window.location.href = '/faq'}
                    className="menu-item"
                    style={{ padding: '16px', textAlign: 'center', color: '#3B82F6', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s', backgroundColor: 'white' }}>
                    View more articles
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              <div 
                className="menu-item"
                onClick={() => window.location.href = '/contact'}
                style={{ backgroundColor: 'white', borderRadius: '16px', padding: '18px 16px', fontWeight: 600, fontSize: '16px', color: '#0F172A', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'all 0.2s', flexShrink: 0 }}
              >
                Contact us
                <Icons.ChevronRight />
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: 'auto', fontSize: '12px', color: 'rgba(255,255,255,0.5)', paddingTop: '10px', flexShrink: 0 }}>
              Powered by <span style={{ fontWeight: 600, color: 'white' }}>Sabihands</span>
            </div>
          </div>
        )}

        {/* --- CHAT VIEW --- */}
        {currentView === 'chat' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC', height: '100%' }}>
            {/* Header */}
            <div style={{ 
              backgroundColor: THEME_COLOR, 
              padding: '20px', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottomLeftRadius: '24px',
              borderBottomRightRadius: '24px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              position: 'relative',
              zIndex: 2,
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  onClick={() => setCurrentView('menu')}
                  title="Back to Menu"
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                >
                  <Icons.Back />
                </button>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>Onboarding assistance</div>
                  <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '2px' }}>
                    Typically responds in 5 mins
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={handleHideWidget}
                  title="Disable Support Widget Permanently"
                  style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                >
                  <Icons.Hide />
                </button>
              </div>
            </div>

            {/* Privacy Notice */}
            <div style={{ padding: '16px 20px', fontSize: '12px', color: '#64748B', lineHeight: 1.5, borderBottom: '1px solid #E2E8F0', backgroundColor: 'white', flexShrink: 0 }}>
              By talking to this bot, I understand that Sabihands will process my personal information. <Link to="/privacy" style={{ color: '#3B82F6', textDecoration: 'none' }}>View privacy policy</Link>
            </div>

            {/* Messages Area */}
            <div className="chat-scroll-area" style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '20px', overscrollBehavior: 'contain' }}>
              {messages.map((msg, i) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: '4px' }}>
                    {!isUser && i === 0 && (
                       <span style={{ fontSize: '12px', color: '#64748B', marginLeft: '40px' }}>Support Team</span>
                    )}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                      {!isUser && (
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icons.SupportAvatar />
                        </div>
                      )}
                      <div 
                        className={isUser ? 'chat-bubble-user' : 'chat-bubble-support'}
                        style={{
                          maxWidth: '240px',
                          padding: '14px 18px',
                          borderRadius: '20px',
                          backgroundColor: isUser ? THEME_COLOR : '#ffffff',
                          color: isUser ? 'white' : '#1E293B',
                          fontSize: '14.5px',
                          lineHeight: 1.5,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                          border: isUser ? 'none' : '1px solid #E2E8F0'
                      }}>
                        {msg.text}
                      </div>
                      {isUser && (
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: THEME_COLOR, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                           <Icons.User />
                        </div>
                      )}
                    </div>
                    
                    {/* Quick Replies below first support message */}
                    {!isUser && i === 0 && messages.length === 1 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', marginLeft: '36px' }}>
                        {['Report a problem', 'FAQ', 'Pricing plans'].map(reply => (
                          <button 
                            key={reply}
                            className="quick-reply-btn"
                            onClick={() => handleSendText(reply)}
                            style={{ 
                              padding: '8px 16px', 
                              borderRadius: '20px', 
                              border: '1px solid #CBD5E1', 
                              backgroundColor: 'white', 
                              color: THEME_COLOR, 
                              fontSize: '13px', 
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              fontWeight: 500
                            }}>
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', alignSelf: isUser ? 'flex-end' : 'flex-start', margin: isUser ? '0 40px 0 0' : '0 0 0 40px' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '16px 20px', backgroundColor: 'white', borderTop: '1px solid #E2E8F0', flexShrink: 0 }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  style={{ 
                    flex: 1, 
                    padding: '14px 20px', 
                    borderRadius: '24px', 
                    border: '1px solid #CBD5E1', 
                    outline: 'none', 
                    backgroundColor: '#F8FAFC', 
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = THEME_COLOR; e.target.style.backgroundColor = 'white'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.backgroundColor = '#F8FAFC'; }}
                />
                <button 
                  type="submit" 
                  disabled={!inputText.trim()}
                  style={{ 
                    width: '46px', 
                    height: '46px', 
                    borderRadius: '50%', 
                    backgroundColor: inputText.trim() ? THEME_COLOR : '#E2E8F0', 
                    color: inputText.trim() ? 'white' : '#94A3B8', 
                    border: 'none', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: inputText.trim() ? 'pointer' : 'default', 
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                  <Icons.Send />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SupportChatWidget;

