import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import { uploadImage } from '../lib/uploadImage';
import './Messages.css';

type Profile = {
  id: string;
  name: string;
  type: 'volunteer' | 'organization';
};

type Conversation = {
  id: string;
  otherUser: Profile;
  gig?: { title: string } | null;
  lastMessage?: {
    content: string;
    image_url?: string;
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
  image_url?: string;
  created_at: string;
  is_read: boolean;
};

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // UI states for blocking & reporting
  const [showOptions, setShowOptions] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportingMsgId, setReportingMsgId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
                  image_url: newMsg.image_url,
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
          gig_id,
          gigs ( title ),
          messages (
            content,
            image_url,
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
            gig: conv.gigs,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Only images are supported');
      return;
    }
    setAttachment(file);
    setAttachmentPreview(URL.createObjectURL(file));
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !activeConversationId || !user) return;

    setIsUploading(true);
    let uploadedImageUrl = null;
    if (attachment) {
      try {
        uploadedImageUrl = await uploadImage(attachment, 'messages');
      } catch (error) {
        toast.error("Failed to upload image");
        setIsUploading(false);
        return;
      }
    }

    const content = newMessage.trim() || '[Image attachment]';
    setNewMessage('');
    removeAttachment();

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversationId,
          sender_id: user.id,
          content: content,
          image_url: uploadedImageUrl
        });

      if (error) throw error;
      
      // Update the conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeConversationId);
        
    } catch (err: any) {
      if (err.message && err.message.includes('blocked')) {
        toast.error("Cannot send message. You have been blocked by this user.");
      } else if (err.message && err.message.includes('Rate limit')) {
        toast.error("You have reached your messaging limit for today.");
      } else {
        toast.error("Failed to send message.");
      }
      console.error("Error sending message:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!user || !activeConv) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: user.id,
          blocked_id: activeConv.otherUser.id
        });
        
      if (error && error.code !== '23505') throw error; // Ignore duplicate blocks
      
      toast.success(`You have blocked ${activeConv.otherUser.name}.`);
      setConversations(prev => prev.filter(c => c.id !== activeConv.id));
      setActiveConversationId(null);
      setShowBlockModal(false);
      setShowOptions(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to block user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReportMessage = async () => {
    if (!user || !reportingMsgId || !reportReason.trim()) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('message_reports')
        .insert({
          message_id: reportingMsgId,
          reporter_id: user.id,
          reason: reportReason.trim()
        });
        
      if (error) throw error;
      
      toast.success("Message reported. Our moderation team will review it.");
      setShowReportModal(false);
      setReportReason('');
      setReportingMsgId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to report message');
    } finally {
      setIsProcessing(false);
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
      <aside className={`messages-sidebar ${activeConversationId ? 'mobile-hidden' : ''}`}>
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
                      <span className="contact-name">
                        {conv.otherUser.name}
                        <span style={{ fontSize: '11px', backgroundColor: 'var(--paper)', padding: '2px 6px', borderRadius: '4px', color: 'var(--muted)', marginLeft: '6px', fontWeight: 600, verticalAlign: 'middle' }}>
                          {conv.otherUser.type === 'organization' ? 'Org' : 'Vol'}
                        </span>
                      </span>
                      {conv.lastMessage && (
                        <span className="contact-time">{formatTime(conv.lastMessage.created_at)}</span>
                      )}
                    </div>
                    {conv.gig && (
                      <div style={{ fontSize: '12px', color: 'var(--purple-600)', fontWeight: 600, marginBottom: '4px' }}>
                        Regarding: {conv.gig.title}
                      </div>
                    )}
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
        <main className={`chat-window ${!activeConversationId ? 'mobile-hidden' : ''}`}>
          {/* Chat Header */}
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <button className="mobile-back-btn" onClick={() => setActiveConversationId(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <img 
                src={activeConv.otherUser.type === 'organization' ? '/images/diverse_gigs.png' : '/images/hero_illustration.png'} 
                alt={activeConv.otherUser.name} 
                className="contact-avatar" 
                style={{ width: '40px', height: '40px' }} 
              />
              <div className="chat-status">
                <span className="chat-status-name">{activeConv.otherUser.name}</span>
                <span className="chat-status-text">
                  {activeConv.otherUser.type === 'organization' ? 'Organization' : 'Volunteer'}
                  {activeConv.gig && <span style={{ color: 'var(--purple-600)', fontWeight: 600 }}> • Regarding: {activeConv.gig.title}</span>}
                </span>
              </div>
            </div>
            <div className="chat-header-actions" style={{ display: 'flex', gap: '12px', position: 'relative' }}>
              <button 
                className="chat-header-btn" 
                title="Options"
                onClick={() => setShowOptions(!showOptions)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              </button>
              {showOptions && (
                <div style={{ position: 'absolute', top: '40px', right: '0', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '8px 0', zIndex: 10, minWidth: '150px', border: '1px solid var(--border)' }}>
                  <button 
                    onClick={() => { setShowBlockModal(true); setShowOptions(false); }}
                    style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--red)', fontWeight: 500, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                    Block User
                  </button>
                </div>
              )}
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
                      {msg.image_url && (
                        <img src={msg.image_url} alt="Attachment" className="chat-image" />
                      )}
                      <div className={`chat-bubble ${isMine ? 'sent' : 'received'}`}>
                        {msg.content}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span className="chat-time">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {!isMine && (
                          <button 
                            onClick={() => { setReportingMsgId(msg.id); setShowReportModal(true); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--muted)', display: 'flex', alignItems: 'center' }} 
                            title="Report Message"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {attachmentPreview && (
            <div className="chat-image-preview-container">
              <img src={attachmentPreview} alt="Preview" className="chat-image-preview" />
              <button type="button" className="chat-image-remove" onClick={removeAttachment}>&times;</button>
            </div>
          )}
          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <div className="chat-input-wrapper">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
              />
              <button 
                type="button" 
                className="chat-attach-btn" 
                title="Attach Image"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
              </button>
              <input 
                type="text" 
                className="chat-input" 
                placeholder="Type your message here..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isUploading}
              />
              <button type="submit" className="chat-send-btn" title="Send" disabled={(isUploading) || (!newMessage.trim() && !attachment)}>
                {isUploading ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spinning"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                )}
              </button>
            </div>
          </form>
        </main>
      ) : (
        <main className={`chat-window ${!activeConversationId ? 'mobile-hidden' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
            <svg style={{ width: '48px', height: '48px', marginBottom: '16px', opacity: 0.5 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <h3>No conversation selected</h3>
            <p>Select a contact from the sidebar to start messaging.</p>
          </div>
        </main>
      )}
      
      {/* Modals */}
      <ConfirmModal 
        isOpen={showBlockModal}
        title="Block User"
        message={`Are you sure you want to block ${activeConv?.otherUser.name}? You will no longer receive messages from them.`}
        confirmText="Block User"
        onConfirm={handleBlockUser}
        onCancel={() => setShowBlockModal(false)}
        isProcessing={isProcessing}
      />
      
      {showReportModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>Report Message</h3>
            <p style={{ color: 'var(--body)', fontSize: '14px', marginBottom: '16px' }}>Please tell us why you are reporting this message. This helps our moderation team take appropriate action.</p>
            <textarea 
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="E.g., Spam, harassment, inappropriate content..."
              style={{ width: '100%', minHeight: '100px', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '24px', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => { setShowReportModal(false); setReportReason(''); setReportingMsgId(null); }}
                style={{ padding: '10px 20px', border: '1px solid var(--border)', background: 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button 
                onClick={handleReportMessage}
                disabled={isProcessing || !reportReason.trim()}
                style={{ padding: '10px 20px', border: 'none', background: 'var(--red)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, opacity: (!reportReason.trim() || isProcessing) ? 0.5 : 1 }}
              >
                {isProcessing ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
