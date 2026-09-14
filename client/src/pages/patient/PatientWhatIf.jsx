import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api.js';
import { Sparkles, Send, HelpCircle, AlertCircle, Bot, User, Loader2 } from 'lucide-react';

export default function PatientWhatIf() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.get(`/patient/whatif/history/${sessionId}`);
        if (res.data && Array.isArray(res.data.messages)) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        // New session, history will be empty
      }
    }
    loadHistory();
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text || !text.trim()) return;

    if (!textToSend) setInput('');
    setLoading(true);

    const userMsg = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await api.post('/patient/whatif/ask', {
        sessionId,
        question: text
      });

      if (res.data && res.data.message) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.data.message, timestamp: new Date() }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Simulation engine error: Failed to process physiological question. Please verify connection and retry.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'What if I walk briskly for 30 minutes daily?',
    'What dietary modifications help stabilize fasting glucose?',
    'What nutritional steps should I take if hemoglobin is low?',
    'How do hydration and quality sleep affect creatinine levels?'
  ];

  return (
    <div className="medx-card" style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '680px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--medx-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ backgroundColor: '#F3E8FF', color: '#9333EA', padding: '0.5rem', borderRadius: 'var(--medx-radius-md)' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--medx-navy)' }}>
              What-If Health Simulator
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--medx-text-secondary)' }}>
              Simulate physiological lifestyle interventions grounded in your latest laboratory biomarkers.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested prompts if empty chat */}
      {messages.length === 0 && (
        <div style={{ backgroundColor: 'var(--medx-surface-muted)', padding: '1rem', borderRadius: 'var(--medx-radius-md)', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <HelpCircle size={15} /> Suggested Questions:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '9999px',
                  border: '1px solid var(--medx-border)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--medx-navy)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left'
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages Body */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}
          >
            {m.role === 'assistant' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#9333EA',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bot size={18} />
              </div>
            )}

            <div
              style={{
                backgroundColor: m.role === 'user' ? 'var(--medx-primary)' : 'var(--medx-surface-muted)',
                color: m.role === 'user' ? '#FFFFFF' : 'var(--medx-navy)',
                padding: '0.875rem 1rem',
                borderRadius: 'var(--medx-radius-md)',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap'
              }}
            >
              {m.content}
            </div>

            {m.role === 'user' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--medx-navy)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <User size={18} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#9333EA',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Loader2 size={18} className="animate-spin" />
            </div>
            <div style={{ backgroundColor: 'var(--medx-surface-muted)', padding: '0.75rem 1rem', borderRadius: 'var(--medx-radius-md)', fontSize: '0.875rem', color: 'var(--medx-text-secondary)' }}>
              Simulating physiological response...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--medx-border)', paddingTop: '0.75rem' }}
      >
        <input
          type="text"
          className="medx-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a physiological what-if scenario (e.g., 'What if I start exercising daily?')..."
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="medx-button medx-button-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Send size={18} />
          Send
        </button>
      </form>
    </div>
  );
}
