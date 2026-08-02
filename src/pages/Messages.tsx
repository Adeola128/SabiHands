import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Messages.css';

type Profile = {
  id: string;
  name: string;
  type: 'volunteer' | 'organization';
};

type Conversation = {
  id: string;
  otherUser: Profile;
  lastMessage?: {
    content: string;
    created_at: string;
    is_read: boolean;
    sender_id: string;
  };
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
};

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
      markAsRead(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message;
          
          // If the message belongs to the active conversation, append it
          if (newMsg.conversation_id === activeConversationId) {
            setMessages(prev => [...prev, newMsg]);
            if (newMsg.sender_id !== user.id) {
              markAsRead(activeConversationId);
            }
          }

          // Update the conversation list's last message
          setConversations(prev => prev.map(conv => {
            if (conv.id === newMsg.conversation_id) {
              return {
                ...conv,
                lastMessage: {
                  content: newMsg.content,
                  created_at: newMsg.created_at,
                  is_read: newMsg.is_read,
                  sender_id: newMsg.sender_id
                }
              };
            }
            return conv;
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeConversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!user) return;
    try {
      // Fetch all conversations where user is participant
      const { data: convs, error } = await supabase
        .from('conversations')
        .select(`
          id,
          user1_id,
          user2_id,
          messages (
            content,
            created_at,
            is_read,
            sender_id
          )
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (convs) {
        // We need to fetch the profiles for the "other" user in each conversation
        const formattedConvs: Conversation[] = await Promise.all(convs.map(async (conv: any) => {
          const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
          
          // Try fetching from volunteer profiles
          let { data: volProfile } = await supabase
            .from('volunteer_profiles')
            .select('full_name')
            .eq('user_id', otherUserId)
            .single();
            
          let otherUser: Profile = { id: otherUserId, name: 'Unknown User', type: 'volunteer' };
          
          if (volProfile) {
            otherUser = { id: otherUserId, name: volProfile.full_name, type: 'volunteer' };
          } else {
            // Try organizations
            let { data: orgProfile } = await supabase
              .from('organizations')
              .select('name')
              .eq('user_id', otherUserId)
              .single();
              
            if (orgProfile) {
              otherUser = { id: otherUserId, name: orgProfile.name, type: 'organization' };
            }
          }

          // Sort messages to get the latest one
          const sortedMessages = conv.messages ? conv.messages.sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ) : [];

          return {
            id: conv.id,
            otherUser,
            lastMessage: sortedMessages.length > 0 ? sortedMessages[0] : undefined
          };
        }));

        setConversations(formattedConvs);
        if (formattedConvs.length > 0 && !activeConversationId) {
          setActiveConversationId(formattedConvs[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) setMessages(data as Message[]);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (!user) return;
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId || !user) return;

    const content = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversationId,
          sender_id: user.id,
          content: content
        });

      if (error) throw error;
      
      // Update the conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeConversationId);
        
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const activeConv = conversations.find(c => c.id === activeConversationId);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>Loading messages...</div>;
  }

  return (
    <div className="messages-container">
      {/* Sidebar: Contacts/Conversations List */}
      <aside className="messages-sidebar">
        <div className="messages-sidebar-header" style={{ padding: '24px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>Messages</h2>
          <button style={{ background: 'var(--purple-50)', color: 'var(--purple-600)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
        
        <div className="messages-search">
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A5A0C3' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              className="messages-search-input" 
              placeholder="Search messages..." 
            />
          </div>
        </div>

        <div className="messages-list">
          {conversations.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>
              No conversations yet. Apply to a gig to start chatting!
            </div>
          ) : (
            conversations.map((conv) => {
              const unread = conv.lastMessage && !conv.lastMessage.is_read && conv.lastMessage.sender_id !== user?.id;
              
              return (
                <div 
                  key={conv.id} 
                  className={`message-contact ${activeConversationId === conv.id ? 'active' : ''}`}
                  onClick={() => setActiveConversationId(conv.id)}
                >
                  <img 
                    src={conv.otherUser.type === 'organization' ? '/images/diverse_gigs.png' : '/images/hero_illustration.png'} 
                    alt={conv.otherUser.name} 
                    className="contact-avatar" 
                  />
                  <div className="contact-info">
                    <div className="contact-header">
                      <span className="contact-name">{conv.otherUser.name}</span>
                      {conv.lastMessage && (
                        <span className="contact-time">{formatTime(conv.lastMessage.created_at)}</span>
                      )}
                    </div>
                    <div className={`contact-preview ${unread ? 'unread' : ''}`}>
                      {conv.lastMessage ? conv.lastMessage.content : 'No messages yet...'}
                    </div>
                  </div>
                  {unread && <span className="unread-badge">•</span>}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Window */}
      {activeConv ? (
        <main className="chat-window">
          {/* Chat Header */}
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
              <img 
                src={activeConv.otherUser.type === 'organization' ? '/images/diverse_gigs.png' : '/images/hero_illustration.png'} 
                alt={activeConv.otherUser.name} 
                className="contact-avatar" 
                style={{ width: '40px', height: '40px' }} 
              />
              <div className="chat-status">
                <span className="chat-status-name">{activeConv.otherUser.name}</span>
                <span className="chat-status-text">{activeConv.otherUser.type === 'organization' ? 'Organization' : 'Volunteer'}</span>
              </div>
            </div>
            <div className="chat-header-actions" style={{ display: 'flex', gap: '12px' }}>
              <button className="chat-header-btn" title="More info">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </button>
            </div>
          </div>

          {/* Chat Feed */}
          <div className="chat-feed">
            {messages.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--muted)' }}>
                Send a message to start the conversation!
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMine = msg.sender_id === user?.id;
                
                // Add date dividers
                let showDivider = false;
                if (index === 0) {
                  showDivider = true;
                } else {
                  const prevDate = new Date(messages[index - 1].created_at).toDateString();
                  const currDate = new Date(msg.created_at).toDateString();
                  if (prevDate !== currDate) showDivider = true;
                }

                return (
                  <React.Fragment key={msg.id}>
                    {showDivider && (
                      <div className="chat-divider">
                        <span>{new Date(msg.created_at).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                      </div>
                    )}
                    <div className={`chat-bubble-wrapper ${isMine ? 'sent' : 'received'}`}>
                      <div className={`chat-bubble ${isMine ? 'sent' : 'received'}`}>
                        {msg.content}
                      </div>
                      <span className="chat-time">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </React.Fragment>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <div className="chat-input-wrapper">
              <input 
                type="text" 
                className="chat-input" 
                placeholder="Type your message here..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="chat-send-btn" title="Send" disabled={!newMessage.trim()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </form>
        </main>
      ) : (
        <main className="chat-window" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
            <svg style={{ width: '48px', height: '48px', marginBottom: '16px', opacity: 0.5 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <h3>No conversation selected</h3>
            <p>Select a contact from the sidebar to start messaging.</p>
          </div>
        </main>
      )}
    </div>
  );
};

export default Messages;
