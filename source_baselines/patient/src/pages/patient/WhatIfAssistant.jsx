import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Send, HelpCircle, AlertCircle } from 'lucide-react';

const WhatIfAssistant = () => {
  const { token, API_HOST } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(`${API_HOST}/api/whatif/history/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && data.messages) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error('Error loading chat history:', err);
      }
    };
    if (token) loadHistory();
  }, [token, API_HOST, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');
    setLoading(true);

    const userMsg = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch(`${API_HOST}/api/whatif/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId, question: text })
      });

      const data = await response.json();
      if (response.ok && data.message) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message, timestamp: new Date() }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Simulation engine error. Please try again.', timestamp: new Date() }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection error communicating with AI assistant.', timestamp: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const templates = [
    'What if I walk 30 minutes every morning?',
    'What dietary changes will help reduce my fasting glucose?',
    'What should I eat if my hemoglobin is low?',
    'How do hydration and sleep impact creatinine levels?'
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-strong)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={26} color="var(--accent-1)" />
          What-If Health Simulator
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Conversational simulation engine powered by Google Gemini and your personal biomarker records
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px' }}>
        {/* Chat Stream */}
        <div className="chat-container">
          <div className="chat-history">
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', margin: 'auto', padding: '40px', color: 'var(--text-muted)' }}>
                <Sparkles size={36} color="var(--accent-1)" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 600, color: 'var(--text-strong)', marginBottom: '4px' }}>
                  Ask any physiological lifestyle question
                </p>
                <p style={{ fontSize: '0.85rem' }}>
                  The assistant simulates how behavioral choices might influence your recorded lab values.
                </p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`chat-message ${m.role}`}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                </div>
              ))
            )}
            {loading && (
              <div className="chat-message assistant" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                Running physiological projection...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              className="form-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="e.g. What if I stop eating sugar for 30 days?"
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              className="btn btn-primary"
              disabled={loading || !input.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Side Panel: Suggestions & Disclaimer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--text-strong)' }}>
              <HelpCircle size={18} color="var(--accent-1)" />
              Sample Scenarios
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {templates.map((temp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(temp)}
                  disabled={loading}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--surface-border)',
                    backgroundColor: 'var(--surface-2)',
                    textAlign: 'left',
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    color: 'var(--text-strong)',
                    fontWeight: 600,
                    transition: 'var(--transition)'
                  }}
                >
                  {temp}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ backgroundColor: 'var(--flag-warning-light)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', gap: '12px' }}>
            <AlertCircle size={22} color="var(--flag-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--flag-warning)' }}>Clinical Disclaimer</h4>
              <p style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '4px', lineHeight: 1.4 }}>
                This assistant simulates physiological relationships using predictive rules. It is an educational tool and does not provide formal medical diagnoses or prescriptions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIfAssistant;
