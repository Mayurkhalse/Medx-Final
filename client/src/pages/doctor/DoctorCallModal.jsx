import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Volume2, VolumeX, PhoneOff, User, Clock, Stethoscope } from 'lucide-react';
import api from '../../services/api.js';

export function DoctorCallModal({ patient, onClose, onCallEnded }) {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callNotes, setCallNotes] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEndCall = async () => {
    if (callNotes.trim() && patient?._id) {
      try {
        setSavingNote(true);
        await api.post(`/doctor/patients/${patient._id}/notes`, {
          note: `[Consultation Call (${formatTime(seconds)})]: ${callNotes.trim()}`
        });
      } catch (err) {
        console.error('Failed to auto-save call note:', err);
      } finally {
        setSavingNote(false);
      }
    }
    if (onCallEnded) onCallEnded();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: '1rem',
      backdropFilter: 'blur(6px)'
    }}>
      <div style={{
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        borderRadius: 'var(--medx-radius-lg)',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        border: '1px solid #334155'
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #1E293B'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontSize: '0.8125rem', fontWeight: 600 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
            Active Clinical Audio Consultation
          </div>
          <button
            type="button"
            onClick={handleEndCall}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Patient Profile & Timer Area */}
        <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#1E293B',
            color: '#38BDF8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            border: '3px solid #0284C7'
          }}>
            <User size={40} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#FFFFFF' }}>
            {patient?.name || 'Registered Patient'}
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '0 0 1rem 0' }}>
            ID: {patient?.id || patient?.legacyId || patient?._id} • {patient?.phone || '+91 98112 34567'}
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            backgroundColor: '#1E293B',
            padding: '0.375rem 0.875rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#38BDF8'
          }}>
            <Clock size={15} /> {formatTime(seconds)}
          </div>
        </div>

        {/* In-Call Note Taking */}
        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.375rem', textTransform: 'uppercase' }}>
            Consultation Observations & Notes
          </label>
          <textarea
            style={{
              width: '100%',
              minHeight: '75px',
              backgroundColor: '#1E293B',
              color: '#F8FAFC',
              border: '1px solid #334155',
              borderRadius: 'var(--medx-radius-sm)',
              padding: '0.5rem 0.75rem',
              fontSize: '0.8125rem',
              resize: 'none'
            }}
            placeholder="Type notes during the call to automatically save to the patient dossier..."
            value={callNotes}
            onChange={(e) => setCallNotes(e.target.value)}
          />
        </div>

        {/* Audio Controls Bar */}
        <div style={{
          backgroundColor: '#090D16',
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1.5rem',
          borderTop: '1px solid #1E293B'
        }}>
          {/* Mute Button */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: isMuted ? '#EF4444' : '#1E293B',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={handleEndCall}
            disabled={savingNote}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
            }}
            title="End Consultation Call"
          >
            <PhoneOff size={24} />
          </button>

          {/* Speaker Button */}
          <button
            type="button"
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: isSpeakerOn ? '#1E293B' : '#64748B',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
          >
            {isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoctorCallModal;
