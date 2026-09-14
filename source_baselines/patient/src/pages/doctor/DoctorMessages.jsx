import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, User } from 'lucide-react';

const DoctorMessages = () => {
  const { user, token, API_HOST } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_HOST}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setConversations(data);
        if (!activeConvo && data.length > 0) {
          setActiveConvo(data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchThread = async (convoId) => {
    try {
      const res = await fetch(`${API_HOST}/api/messages/${convoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMessages(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) fetchConversations();
  }, [token, API_HOST]);

  useEffect(() => {
    if (activeConvo) fetchThread(activeConvo.conversationId);
  }, [activeConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConvo) return;

    const receiverId = activeConvo.otherParty?._id;
    const content = input;
    setInput('');

    try {
      const res = await fetch(`${API_HOST}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId, content })
      });

      if (res.ok) {
        fetchThread(activeConvo.conversationId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-strong)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare size={28} color="var(--accent-1)" />
          Clinical Messaging Console
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Encrypted practitioner-patient follow-ups and inter-departmental physician correspondence
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', height: '620px' }}>
        {/* Conversations List */}
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Active Conversations
          </h3>

          {conversations.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No messages yet.</p>
          ) : (
            conversations.map((c) => (
              <div
                key={c.conversationId}
                onClick={() => setActiveConvo(c)}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: activeConvo?.conversationId === c.conversationId ? 'var(--surface-2)' : '#ffffff',
                  border: '1px solid var(--surface-border)',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-strong)' }}>
                  {c.otherParty?.name || 'Contact'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '2px' }}>
                  {c.lastMessage}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Thread */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeConvo ? (
            <>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--surface-border)', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-1)' }}>
                  <User size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{activeConvo.otherParty?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeConvo.otherParty?.email}</div>
                </div>
              </div>

              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map((m) => {
                  const isMe = m.senderId?._id === user?.id || m.senderId === user?.id;
                  return (
                    <div
                      key={m._id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: isMe ? 'var(--accent-1)' : 'var(--surface-2)',
                        color: isMe ? '#ffffff' : 'var(--text-strong)',
                        fontSize: '0.9rem',
                        lineHeight: 1.5
                      }}
                    >
                      {m.content}
                      <div style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '4px', textAlign: 'right' }}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} style={{ display: 'flex', padding: '16px', borderTop: '1px solid var(--surface-border)', gap: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type your clinical response..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" disabled={!input.trim()}>
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select a conversation to begin messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorMessages;
