import React, { useState, useEffect, useRef } from 'react';

interface SupportMessage {
  id: string;
  sender: 'user' | 'support';
  text: string;
  timestamp: string;
}

const SupportDisputes: React.FC = () => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sabihands_support_chat');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      const initMsg: SupportMessage = {
        id: Date.now().toString(),
        sender: 'support',
        text: 'Hi there! How can we help you today?',
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
    
    // Custom event to catch same-window updates
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: SupportMessage = {
      id: Date.now().toString(),
      sender: 'support',
      text: inputText.trim(),
      timestamp: new Date().toISOString()
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    setInputText('');
    
    localStorage.setItem('sabihands_support_chat', JSON.stringify(updated));
    window.dispatchEvent(new Event('sabihands_chat_update'));
  };

  const oldTickets = [
    { id: 'TKT-1029', user: 'Chidi Okeke', type: 'Dispute', subject: 'Organization did not mark my attendance', status: 'Open', priority: 'High', date: '2 hrs ago' },
    { id: 'TKT-1028', user: 'Tech for Good Nigeria', type: 'Support', subject: 'How to change billing card?', status: 'Resolved', priority: 'Low', date: '1 day ago' },
    { id: 'TKT-1027', user: 'Adeola Okonkwo', type: 'Support', subject: 'Bug on profile page', status: 'In Progress', priority: 'Medium', date: '2 days ago' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0', fontFamily: 'var(--display)' }}>Support & Disputes</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Handle live chat and legacy tickets.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
        {/* Left Side: Tickets & Active Chats */}
        <div className="admin-card" style={{ flex: '1', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Active Chats</h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* Mock Active Chat */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#EFF6FF', borderLeft: '4px solid #3B82F6', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: '15px', color: '#0F172A' }}>Website Visitor (Live)</span>
                <span style={{ fontSize: '12px', color: '#3B82F6', fontWeight: 600 }}>Just now</span>
              </div>
              <div style={{ fontSize: '14px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {messages[messages.length - 1]?.text || 'No messages yet'}
              </div>
            </div>

            {/* Legacy Tickets */}
            <div style={{ padding: '20px', borderBottom: '1px solid #E2E8F0', borderTop: '4px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legacy Tickets</h3>
            </div>
            {oldTickets.map(t => (
              <div key={t.id} style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '15px', color: '#0F172A' }}>{t.subject}</span>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>{t.date}</span>
                </div>
                <div style={{ fontSize: '14px', color: '#64748B' }}>{t.user} &middot; {t.id}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Chat Window */}
        <div className="admin-card" style={{ flex: '2', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Live Support</h3>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%', display: 'inline-block' }}></span>
                Visitor is online
              </div>
            </div>
            <button style={{ padding: '6px 12px', backgroundColor: '#F1F5F9', color: '#334155', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Resolve Chat</button>
          </div>
          
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map(msg => {
              const isSupport = msg.sender === 'support';
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isSupport ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: isSupport ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    backgroundColor: isSupport ? '#3B82F6' : 'white',
                    color: isSupport ? 'white' : '#0F172A',
                    boxShadow: isSupport ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    border: isSupport ? 'none' : '1px solid #E2E8F0'
                  }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px', margin: isSupport ? '0 4px 0 0' : '0 0 0 4px' }}>
                    {new Date(msg.timestamp).toLocaleTimeString("en-NG", { hour: '2-digit', minute: '2-digit' })} &middot; {isSupport ? 'You' : 'Visitor'}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '20px', borderTop: '1px solid #E2E8F0', backgroundColor: 'white' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '16px' }}>
              <input 
                type="text" 
                placeholder="Type your reply to the visitor..." 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                style={{ flex: 1, padding: '14px 20px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }}
              />
              <button 
                type="submit" 
                disabled={!inputText.trim()}
                style={{ padding: '0 24px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: inputText.trim() ? 'pointer' : 'not-allowed', opacity: inputText.trim() ? 1 : 0.6 }}
              >
                Send Reply
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportDisputes;