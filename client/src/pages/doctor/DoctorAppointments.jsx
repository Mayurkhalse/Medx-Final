import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Phone,
  Pill,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import api from '../../services/api.js';

export default function DoctorAppointments({
  onSelectPatient,
  onOpenCall,
  onOpenPrescription
}) {
  const [activeTab, setActiveTab] = useState('All');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRescheduleModal, setShowRescheduleModal] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('11:00 AM');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [patientsRes, queueRes] = await Promise.allSettled([
        api.get('/doctor/patients'),
        api.get('/doctor/queue')
      ]);

      const loadedPatients = patientsRes.status === 'fulfilled' ? patientsRes.value.data || [] : [];
      setPatients(loadedPatients);

      // Build synthesized appointments list from patient queue and patient dossiers
      const queueList = queueRes.status === 'fulfilled' ? queueRes.value.data || [] : [];

      const initialApts = loadedPatients.map((p, idx) => {
        const queueItem = queueList.find(q => (q.patientId?._id || q.patientId) === p._id || (q.patientId?.id || q.patientId) === p.id);
        const dateStr = idx % 2 === 0 ? new Date().toISOString().split('T')[0] : '2026-09-18';
        const times = ['09:30 AM', '11:00 AM', '02:15 PM', '04:00 PM', '05:30 PM'];
        const statuses = ['Confirmed', 'Pending', 'Scheduled', 'Completed'];

        return {
          id: p._id || p.id || `APT-${100 + idx}`,
          patientId: p._id || p.id,
          patientName: p.userId?.name || p.name || `Patient ${idx + 1}`,
          age: p.age || 42 + idx,
          gender: p.gender || 'Male',
          photo: p.userId?.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
          date: dateStr,
          time: times[idx % times.length],
          type: idx % 2 === 0 ? 'Follow-up Consultation' : 'Initial Diagnostic Evaluation',
          mode: idx % 3 === 0 ? 'Online Video' : 'In-Person Clinical',
          status: queueItem ? (queueItem.status === 'IN_PROGRESS' ? 'Confirmed' : 'Scheduled') : statuses[idx % statuses.length],
          reason: p.medicalHistory?.[0] || 'Routine cardiovascular & metabolic review',
          rawPatient: p
        };
      });

      setAppointments(initialApts);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments.filter(apt => {
    if (activeTab === 'Today') return apt.date === todayStr;
    if (activeTab === 'Upcoming') return apt.status === 'Confirmed' || apt.status === 'Scheduled' || apt.status === 'Pending';
    if (activeTab === 'Completed') return apt.status === 'Completed';
    if (activeTab === 'Cancelled') return apt.status === 'Cancelled';
    return true;
  });

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (!showRescheduleModal || !rescheduleDate) return;

    setAppointments(prev =>
      prev.map(a =>
        a.id === showRescheduleModal.id
          ? { ...a, date: rescheduleDate, time: rescheduleTime, status: 'Scheduled' }
          : a
      )
    );
    showToast(`Appointment for ${showRescheduleModal.patientName} rescheduled to ${rescheduleDate} at ${rescheduleTime}`);
    setShowRescheduleModal(null);
  };

  const handleAcceptAppointment = (aptId) => {
    setAppointments(prev =>
      prev.map(a => a.id === aptId ? { ...a, status: 'Confirmed' } : a)
    );
    showToast('Appointment accepted and confirmed.');
  };

  const handleCancelAppointment = (aptId) => {
    setAppointments(prev =>
      prev.map(a => a.id === aptId ? { ...a, status: 'Cancelled' } : a)
    );
    showToast('Appointment marked as cancelled.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '84px',
          right: '24px',
          zIndex: 100,
          backgroundColor: 'var(--medx-navy)',
          color: '#FFFFFF',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--medx-radius-md)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          fontSize: '0.875rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderLeft: '4px solid #16A34A'
        }}>
          <Sparkles size={16} color="#4ADE80" />
          {toastMessage}
        </div>
      )}

      {/* Header & Filter Controls */}
      <div className="medx-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--medx-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={22} color="#15803D" />
              Doctor Appointment Workspace
            </h2>
            <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0 0' }}>
              Schedule, review, launch teleconsultations, and manage upcoming outpatient appointments
            </p>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--medx-surface-muted)', padding: '0.25rem', borderRadius: 'var(--medx-radius-sm)' }}>
            {['All', 'Today', 'Upcoming', 'Completed', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  borderRadius: 'var(--medx-radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === tab ? '#15803D' : 'transparent',
                  color: activeTab === tab ? '#FFFFFF' : 'var(--medx-text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment Cards List */}
      {loading ? (
        <div className="medx-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--medx-text-secondary)' }}>
          Loading outpatient appointment records...
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="medx-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.25rem',
                borderLeft: apt.status === 'Confirmed' ? '4px solid #16A34A' : apt.status === 'Cancelled' ? '4px solid #EF4444' : '4px solid #6366F1',
                padding: '1.25rem 1.5rem'
              }}
            >
              {/* Left: Patient Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '280px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#E0F2FE',
                  color: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.125rem'
                }}>
                  {apt.patientName.charAt(0)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                      {apt.patientName}
                    </h3>
                    <span className="medx-badge medx-badge-doctor" style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
                      {apt.age}y • {apt.gender}
                    </span>
                  </div>
                  <div style={{ color: 'var(--medx-text-secondary)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                    <strong>{apt.type}</strong>
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#475569',
                    backgroundColor: '#F1F5F9',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    display: 'inline-block',
                    marginTop: '0.35rem'
                  }}>
                    Condition: {apt.reason}
                  </div>
                </div>
              </div>

              {/* Center: Schedule & Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                  <Clock size={16} color="#6366F1" />
                  <span>{apt.time} • {apt.date}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    backgroundColor: apt.mode.includes('Online') ? '#EEF2FF' : '#F0FDF4',
                    color: apt.mode.includes('Online') ? '#4F46E5' : '#15803D',
                    fontWeight: 700
                  }}>
                    {apt.mode}
                  </span>
                </div>
                <div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    backgroundColor: apt.status === 'Confirmed' ? '#DCFCE7' : apt.status === 'Cancelled' ? '#FEE2E2' : '#FEF3C7',
                    color: apt.status === 'Confirmed' ? '#166534' : apt.status === 'Cancelled' ? '#991B1B' : '#92400E'
                  }}>
                    Status: {apt.status}
                  </span>
                </div>
              </div>

              {/* Right: Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="medx-btn medx-btn-secondary"
                  style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
                  onClick={() => onSelectPatient && onSelectPatient(apt.rawPatient)}
                >
                  <User size={15} />
                  Dossier
                </button>

                {apt.status === 'Pending' && (
                  <button
                    type="button"
                    className="medx-btn medx-btn-primary"
                    style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem', backgroundColor: '#15803D' }}
                    onClick={() => handleAcceptAppointment(apt.id)}
                  >
                    Accept
                  </button>
                )}

                {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                  <>
                    <button
                      type="button"
                      className="medx-btn medx-btn-primary"
                      style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
                      onClick={() => onOpenCall && onOpenCall(apt.rawPatient)}
                    >
                      <Video size={15} />
                      Consultation
                    </button>

                    <button
                      type="button"
                      className="medx-btn medx-btn-secondary"
                      style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
                      onClick={() => onOpenPrescription && onOpenPrescription(apt.rawPatient)}
                      title="Generate Prescription"
                    >
                      <Pill size={15} />
                      Rx
                    </button>

                    <button
                      type="button"
                      className="medx-btn medx-btn-secondary"
                      style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
                      onClick={() => setShowRescheduleModal(apt)}
                    >
                      Reschedule
                    </button>

                    <button
                      type="button"
                      className="medx-btn medx-btn-danger"
                      style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
                      onClick={() => handleCancelAppointment(apt.id)}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="medx-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--medx-text-secondary)' }}>
          <Calendar size={36} color="#94A3B8" style={{ margin: '0 auto 0.75rem auto' }} />
          <p style={{ margin: 0, fontWeight: 600 }}>No appointments found under tab "{activeTab}".</p>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="medx-card" style={{ maxWidth: '440px', width: '100%', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--medx-navy)', margin: '0 0 1rem 0' }}>
              Reschedule Appointment
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: '0 0 1rem 0' }}>
              Select a new consultation date and time slot for <strong>{showRescheduleModal.patientName}</strong>.
            </p>

            <form onSubmit={handleRescheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="medx-label">New Consultation Date</label>
                <input
                  type="date"
                  className="medx-input"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="medx-label">New Time Slot</label>
                <select
                  className="medx-input"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:15 AM">11:15 AM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="medx-btn medx-btn-secondary"
                  onClick={() => setShowRescheduleModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="medx-btn medx-btn-primary"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
