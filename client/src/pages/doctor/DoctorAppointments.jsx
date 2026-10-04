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
  Sparkles,
  RefreshCw,
  X,
  DoorOpen,
  LogIn,
  Check
} from 'lucide-react';
import api from '../../services/api.js';
import appointmentService from '../../services/appointmentService.js';

export default function DoctorAppointments({
  onSelectPatient,
  onOpenCall,
  onOpenPrescription
}) {
  const [activeTab, setActiveTab] = useState('All');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Reschedule Modal
  const [showRescheduleModal, setShowRescheduleModal] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('11:00 AM');
  
  // New Appointment Modal
  const [showNewAptModal, setShowNewAptModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [newAptDate, setNewAptDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAptTime, setNewAptTime] = useState('10:00 AM');
  const [newAptType, setNewAptType] = useState('In-Person');
  const [newAptReason, setNewAptReason] = useState('Follow-up Consultation');
  const [newAptNotes, setNewAptNotes] = useState('');
  const [submittingNewApt, setSubmittingNewApt] = useState(false);

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [patientsRes, aptsRes] = await Promise.allSettled([
        api.get('/doctor/patients'),
        appointmentService.getAppointments()
      ]);

      const loadedPatients = patientsRes.status === 'fulfilled' ? patientsRes.value.data || [] : [];
      setPatients(loadedPatients);

      const loadedApts = aptsRes.status === 'fulfilled' ? aptsRes.value || [] : [];

      if (loadedApts && loadedApts.length > 0) {
        // Map canonical appointments with loaded patient details
        const mapped = loadedApts.map(apt => {
          const rawPat = loadedPatients.find(p => 
            p._id === apt.patientId || p.id === apt.patientId || p.id === apt.patientId?.legacyId
          ) || {
            _id: apt.patientId,
            name: apt.patientName,
            phone: apt.patientPhone,
            age: apt.patientAge,
            gender: apt.patientGender,
            bloodGroup: apt.patientBloodGroup
          };

          const dateStr = apt.appointmentDate ? new Date(apt.appointmentDate).toISOString().split('T')[0] : '';

          return {
            _id: apt._id,
            id: apt.id || apt.legacyId || apt._id,
            patientId: apt.patientId,
            patientName: apt.patientName || rawPat.name || 'Patient',
            age: apt.patientAge || rawPat.age || 40,
            gender: apt.patientGender || rawPat.gender || 'Unspecified',
            photo: apt.patientAvatar || rawPat.avatar || rawPat.userId?.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
            date: dateStr,
            time: apt.timeSlot || '10:00 AM',
            type: apt.type || 'In-Person',
            mode: apt.type === 'Video' ? 'Online Video' : 'In-Person Clinical',
            status: apt.status || 'Scheduled',
            reason: apt.reason || 'Clinical Consultation',
            notes: apt.notes || '',
            rawPatient: rawPat
          };
        });
        setAppointments(mapped);
      } else {
        // If database has no appointments yet, build initial roster from patients
        const initialApts = loadedPatients.slice(0, 5).map((p, idx) => {
          const dateStr = idx % 2 === 0 ? new Date().toISOString().split('T')[0] : '2026-09-28';
          const times = ['09:30 AM', '11:00 AM', '02:15 PM', '04:00 PM', '05:30 PM'];
          const statuses = ['Confirmed', 'Scheduled', 'Scheduled', 'Completed'];

          return {
            id: p._id || p.id || `APT-${100 + idx}`,
            patientId: p._id || p.id,
            patientName: p.name || p.userId?.name || `Patient ${idx + 1}`,
            age: p.age || 42 + idx,
            gender: p.gender || 'Male',
            photo: p.userId?.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
            date: dateStr,
            time: times[idx % times.length],
            type: idx % 2 === 0 ? 'Follow-up' : 'In-Person',
            mode: idx % 3 === 0 ? 'Online Video' : 'In-Person Clinical',
            status: statuses[idx % statuses.length],
            reason: p.medicalHistory?.[0] || 'Routine cardiovascular & metabolic review',
            rawPatient: p
          };
        });
        setAppointments(initialApts);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
      showToast('Error retrieving appointments from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = !searchTerm.trim() || 
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.reason.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'Waiting Outside') return apt.status === 'Waiting';
    if (activeTab === 'In Cabin') return apt.status === 'In-Consultation' || apt.status === 'In Consultation';
    if (activeTab === 'Today') return apt.date === todayStr;
    if (activeTab === 'Upcoming') return apt.status === 'Confirmed' || apt.status === 'Scheduled';
    if (activeTab === 'Confirmed') return apt.status === 'Confirmed';
    if (activeTab === 'Scheduled') return apt.status === 'Scheduled';
    if (activeTab === 'Completed') return apt.status === 'Completed';
    if (activeTab === 'Cancelled') return apt.status === 'Cancelled';
    return true;
  });

  const handleCallIn = async (apt) => {
    try {
      await appointmentService.callInPatient(apt._id);
      showToast(`Admitted ${apt.patientName} into Cabin. Consultation in progress.`);
      await loadData();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to call in patient.');
    }
  };

  const handleMarkWaiting = async (apt) => {
    try {
      await appointmentService.markWaiting(apt._id);
      showToast(`Marked ${apt.patientName} as arrived and waiting outside.`);
      await loadData();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to mark patient as waiting.');
    }
  };

  const handleCompleteApt = async (apt) => {
    try {
      await appointmentService.completeAppointment(apt._id);
      showToast(`Completed consultation for ${apt.patientName}.`);
      await loadData();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to complete appointment.');
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!showRescheduleModal || !rescheduleDate) return;

    try {
      if (showRescheduleModal._id) {
        await appointmentService.rescheduleAppointment(showRescheduleModal._id, {
          appointmentDate: rescheduleDate,
          timeSlot: rescheduleTime
        });
      }
      setAppointments(prev =>
        prev.map(a =>
          a.id === showRescheduleModal.id || a._id === showRescheduleModal._id
            ? { ...a, date: rescheduleDate, time: rescheduleTime, status: 'Scheduled' }
            : a
        )
      );
      showToast(`Appointment for ${showRescheduleModal.patientName} rescheduled to ${rescheduleDate} at ${rescheduleTime}`);
    } catch (err) {
      console.error('Reschedule failed:', err);
      showToast('Failed to reschedule appointment on server.');
    } finally {
      setShowRescheduleModal(null);
    }
  };

  const handleAcceptAppointment = async (apt) => {
    try {
      if (apt._id) {
        await appointmentService.acceptAppointment(apt._id);
      }
      setAppointments(prev =>
        prev.map(a => (a._id === apt._id || a.id === apt.id) ? { ...a, status: 'Confirmed' } : a)
      );
      showToast('Appointment accepted and confirmed.');
    } catch (err) {
      console.error('Accept appointment failed:', err);
      showToast('Error confirming appointment on server.');
    }
  };

  const handleCancelAppointment = async (apt) => {
    if (!window.confirm(`Are you sure you want to cancel the appointment for ${apt.patientName}?`)) return;
    try {
      if (apt._id) {
        await appointmentService.cancelAppointment(apt._id, 'Cancelled by doctor');
      }
      setAppointments(prev =>
        prev.map(a => (a._id === apt._id || a.id === apt.id) ? { ...a, status: 'Cancelled' } : a)
      );
      showToast('Appointment marked as cancelled.');
    } catch (err) {
      console.error('Cancel appointment failed:', err);
      showToast('Error cancelling appointment.');
    }
  };

  const handleCreateNewAppointment = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      showToast('Please select a patient.');
      return;
    }

    try {
      setSubmittingNewApt(true);
      const res = await appointmentService.createAppointment({
        patientId: selectedPatientId,
        appointmentDate: newAptDate,
        timeSlot: newAptTime,
        type: newAptType,
        reason: newAptReason,
        notes: newAptNotes
      });

      showToast('New clinical appointment scheduled successfully!');
      setShowNewAptModal(false);
      setSelectedPatientId('');
      setNewAptNotes('');
      // Reload from backend
      await loadData();
    } catch (err) {
      console.error('Create appointment error:', err);
      showToast(err.response?.data?.error?.message || 'Failed to schedule appointment.');
    } finally {
      setSubmittingNewApt(false);
    }
  };

  const tabs = ['All', 'Waiting Outside', 'In Cabin', 'Today', 'Upcoming', 'Confirmed', 'Completed', 'Cancelled'];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Waiting':
        return { bg: '#FEF3C7', text: '#B45309', label: '🟡 Waiting Outside' };
      case 'In-Consultation':
      case 'In Consultation':
        return { bg: '#DCFCE7', text: '#15803D', label: '🟢 In Cabin' };
      case 'Confirmed':
        return { bg: '#EFF6FF', text: '#1D4ED8', label: 'Confirmed' };
      case 'Scheduled':
      case 'Pending':
        return { bg: '#F1F5F9', text: '#475569', label: 'Scheduled' };
      case 'Completed':
        return { bg: '#F8FAFC', text: '#64748B', label: 'Completed' };
      case 'Cancelled':
        return { bg: '#FEE2E2', text: '#B91C1C', label: 'Cancelled' };
      default:
        return { bg: '#EFF6FF', text: '#1D4ED8', label: status };
    }
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
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          animation: 'slideIn 0.3s ease'
        }}>
          <CheckCircle2 size={18} color="#10B981" />
          {toastMessage}
        </div>
      )}

      {/* Top Header Card */}
      <div className="medx-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--medx-navy)', margin: '0 0 0.25rem 0' }}>
            Clinical Appointment Schedule
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--medx-text-secondary)', margin: 0 }}>
            Review, confirm, reschedule, and manage outpatient consultations
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            className="medx-btn medx-btn-secondary"
            onClick={loadData}
            title="Refresh appointments"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'medx-spin' : ''} />
            Refresh
          </button>

          <button
            type="button"
            className="medx-btn medx-btn-primary"
            onClick={() => setShowNewAptModal(true)}
          >
            <Plus size={16} />
            Schedule Appointment
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="medx-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              type="button"
              className={`medx-btn ${activeTab === tab ? 'medx-btn-primary' : 'medx-btn-secondary'}`}
              style={{ fontSize: '0.8125rem', padding: '0.4rem 0.875rem' }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            className="medx-input"
            placeholder="Search patient, ID, or condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem', height: '36px' }}
          />
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="medx-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--medx-text-secondary)' }}>
          <RefreshCw size={32} className="medx-spin" style={{ margin: '0 auto 1rem auto', color: 'var(--medx-primary)' }} />
          <p style={{ margin: 0, fontWeight: 600 }}>Loading appointment roster...</p>
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAppointments.map(apt => {
            const badge = getStatusBadge(apt.status);
            return (
              <div
                key={apt.id || apt._id}
                className="medx-card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  borderLeft: `4px solid ${apt.status === 'Confirmed' ? '#15803D' : (apt.status === 'Cancelled' ? '#EF4444' : '#EAB308')}`
                }}
              >
                {/* Patient Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '280px' }}>
                  <img
                    src={apt.photo}
                    alt={apt.patientName}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4
                        style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0, cursor: 'pointer' }}
                        onClick={() => onSelectPatient && onSelectPatient(apt.rawPatient)}
                      >
                        {apt.patientName}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', backgroundColor: '#F1F5F9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        {apt.id}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: '0.2rem 0 0 0' }}>
                      {apt.age} yrs • {apt.gender} • Condition: <em>{apt.reason}</em>
                    </p>
                  </div>
                </div>

                {/* Appointment Timing & Mode */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <Calendar size={16} color="#64748B" />
                    <strong>{apt.date || 'Today'}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <Clock size={16} color="#64748B" />
                    <span>{apt.time}</span>
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.625rem',
                    borderRadius: '20px',
                    backgroundColor: apt.type === 'Video' ? '#F3E8FF' : '#E0F2FE',
                    color: apt.type === 'Video' ? '#7E22CE' : '#0369A1'
                  }}>
                    {apt.mode || apt.type}
                  </span>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.625rem',
                    borderRadius: '20px',
                    backgroundColor: badge.bg,
                    color: badge.text
                  }}>
                    {badge.label}
                  </span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Live Queue Transitions */}
                  {apt.status === 'Waiting' && (
                    <button
                      type="button"
                      className="medx-btn"
                      style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem', backgroundColor: '#16A34A', color: '#FFFFFF', fontWeight: 700 }}
                      onClick={() => handleCallIn(apt)}
                    >
                      <DoorOpen size={15} />
                      Call In to Cabin
                    </button>
                  )}

                  {(apt.status === 'In-Consultation' || apt.status === 'In Consultation') && (
                    <button
                      type="button"
                      className="medx-btn"
                      style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem', backgroundColor: '#15803D', color: '#FFFFFF', fontWeight: 700 }}
                      onClick={() => handleCompleteApt(apt)}
                    >
                      <CheckCircle2 size={15} />
                      Finish Visit
                    </button>
                  )}

                  {(apt.status === 'Confirmed' || apt.status === 'Scheduled') && (
                    <button
                      type="button"
                      className="medx-btn"
                      style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem', backgroundColor: '#F59E0B', color: '#FFFFFF', fontWeight: 600 }}
                      onClick={() => handleMarkWaiting(apt)}
                      title="Patient arrived outside - mark waiting in lobby"
                    >
                      <LogIn size={15} />
                      Mark Arrived
                    </button>
                  )}

                  {apt.status === 'Scheduled' && (
                    <button
                      type="button"
                      className="medx-btn medx-btn-primary"
                      style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem', backgroundColor: '#1D4ED8' }}
                      onClick={() => handleAcceptAppointment(apt)}
                    >
                      <CheckCircle2 size={15} />
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
                        onClick={() => {
                          setShowRescheduleModal(apt);
                          setRescheduleDate(apt.date || todayStr);
                          setRescheduleTime(apt.time || '11:00 AM');
                        }}
                      >
                        Reschedule
                      </button>

                      <button
                        type="button"
                        className="medx-btn medx-btn-danger"
                        style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
                        onClick={() => handleCancelAppointment(apt)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="medx-card" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--medx-text-secondary)' }}>
          <Calendar size={42} color="#94A3B8" style={{ margin: '0 auto 0.75rem auto' }} />
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--medx-navy)', fontWeight: 700 }}>
            No appointments found in "{activeTab}"
          </h4>
          <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem' }}>
            You have no outpatient appointments matching the current filter.
          </p>
          <button
            type="button"
            className="medx-btn medx-btn-primary"
            onClick={() => setShowNewAptModal(true)}
            style={{ margin: '0 auto' }}
          >
            <Plus size={16} /> Schedule New Appointment
          </button>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--medx-navy)', margin: 0 }}>
                Reschedule Appointment
              </h3>
              <button
                type="button"
                onClick={() => setShowRescheduleModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: '0 0 1.25rem 0' }}>
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
                  min={todayStr}
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
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:15 AM">11:15 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
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

      {/* Schedule New Appointment Modal */}
      {showNewAptModal && (
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
          <div className="medx-card" style={{ maxWidth: '520px', width: '100%', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--medx-navy)', margin: 0 }}>
                Schedule Clinical Appointment
              </h3>
              <button
                type="button"
                onClick={() => setShowNewAptModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateNewAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="medx-label">Select Patient *</label>
                <select
                  className="medx-input"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Patient from Roster --</option>
                  {patients.map(p => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.name || p.userId?.name} ({p.id || 'PAT'}) — {p.gender}, {p.age} yrs
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="medx-label">Date *</label>
                  <input
                    type="date"
                    className="medx-input"
                    value={newAptDate}
                    onChange={(e) => setNewAptDate(e.target.value)}
                    min={todayStr}
                    required
                  />
                </div>
                <div>
                  <label className="medx-label">Time Slot *</label>
                  <select
                    className="medx-input"
                    value={newAptTime}
                    onChange={(e) => setNewAptTime(e.target.value)}
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:15 AM">11:15 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="medx-label">Consultation Mode *</label>
                <select
                  className="medx-input"
                  value={newAptType}
                  onChange={(e) => setNewAptType(e.target.value)}
                >
                  <option value="In-Person">In-Person Clinical Visit</option>
                  <option value="Video">Online Video Telehealth</option>
                  <option value="Follow-up">Diagnostic Follow-up</option>
                </select>
              </div>

              <div>
                <label className="medx-label">Reason for Visit / Symptoms</label>
                <input
                  type="text"
                  className="medx-input"
                  placeholder="e.g. Hypertension review, lab results follow-up"
                  value={newAptReason}
                  onChange={(e) => setNewAptReason(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="medx-label">Clinical Notes (Optional)</label>
                <textarea
                  className="medx-input"
                  placeholder="Add any preliminary preparation instructions or observations..."
                  value={newAptNotes}
                  onChange={(e) => setNewAptNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="medx-btn medx-btn-secondary"
                  onClick={() => setShowNewAptModal(false)}
                  disabled={submittingNewApt}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="medx-btn medx-btn-primary"
                  disabled={submittingNewApt}
                >
                  {submittingNewApt ? 'Scheduling...' : 'Save & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
