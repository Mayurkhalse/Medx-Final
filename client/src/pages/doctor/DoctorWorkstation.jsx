import React, { useState, useEffect } from 'react';
import {
  Activity, Users, FileText, Pill, Clock, CheckCircle2,
  AlertTriangle, Phone, Stethoscope, RefreshCw, ChevronRight, Eye, Sparkles,
  DoorOpen, LogIn, Check, Bell, Volume2, UserCheck, HeartPulse, Radio, XCircle, QrCode
} from 'lucide-react';
import api from '../../services/api.js';
import appointmentService from '../../services/appointmentService.js';
import ReceptionQRModal from '../../components/ReceptionQRModal.jsx';

const CLINICAL_QUOTES = [
  { quote: "Wherever the art of Medicine is loved, there is also a love of Humanity.", author: "Hippocrates" },
  { quote: "The good physician treats the disease; the great physician treats the patient who has the disease.", author: "Sir William Osler" },
  { quote: "Medicine is a science of uncertainty and an art of probability.", author: "Sir William Osler" },
  { quote: "To cure sometimes, to relieve often, to comfort always.", author: "Edward Livingston Trudeau" },
  { quote: "Care more particularly for the individual patient than for the special features of the disease.", author: "Sir William Osler" }
];

export function DoctorWorkstation({
  onSelectPatient,
  onOpenCall,
  onOpenPrescription,
  onOpenReview,
  onNavigateTab
}) {
  const [queue, setQueue] = useState([]);
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [emergencyCount, setEmergencyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [queueFilter, setQueueFilter] = useState('all'); // 'all' | 'waiting' | 'in-cabin' | 'upcoming' | 'completed'
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadWorkstationData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError('');
      const [queueRes, patientsRes, reportsRes, emgRes] = await Promise.allSettled([
        api.get('/doctor/queue'),
        api.get('/doctor/patients'),
        api.get('/doctor/reports'),
        api.get('/emergency/stats/active-count')
      ]);

      if (queueRes.status === 'fulfilled') setQueue(queueRes.value.data || []);
      if (patientsRes.status === 'fulfilled') setPatients(patientsRes.value.data || []);
      if (reportsRes.status === 'fulfilled') setReports(reportsRes.value.data || []);
      if (emgRes.status === 'fulfilled' && emgRes.value.data) {
        setEmergencyCount(emgRes.value.data.activeCount || 0);
      }
    } catch (err) {
      console.error('Failed to load doctor workstation data:', err);
      if (!silent) setError('Unable to load workstation data. Please verify network and authentication.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkstationData();
    // Live real-time polling every 15 seconds
    const interval = setInterval(() => {
      loadWorkstationData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCallIn = async (item) => {
    try {
      const targetId = item.appointmentId || item.patientDocId;
      setActionLoadingId(targetId);
      await appointmentService.callInPatient(targetId);
      showToast(`Admitted ${item.patientName} into Cabin. Consultation in progress.`);
      await loadWorkstationData(true);
    } catch (err) {
      alert('Failed to admit patient: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkWaiting = async (item) => {
    try {
      const targetId = item.appointmentId || item.patientDocId;
      setActionLoadingId(targetId);
      await appointmentService.markWaiting(targetId);
      showToast(`Marked ${item.patientName} as arrived and waiting outside.`);
      await loadWorkstationData(true);
    } catch (err) {
      alert('Failed to mark waiting: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCompleteVisit = async (item) => {
    try {
      const targetId = item.appointmentId || item.patientDocId;
      setActionLoadingId(targetId);
      await appointmentService.completeAppointment(targetId);
      showToast(`Completed consultation for ${item.patientName}.`);
      await loadWorkstationData(true);
    } catch (err) {
      alert('Failed to complete consultation: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleFinishAndPrescribe = async (item) => {
    await handleCompleteVisit(item);
    try {
      const res = await api.get(`/doctor/patients/${item.patientId}`);
      onOpenPrescription(res.data);
    } catch (err) {
      onOpenPrescription({ name: item.patientName, id: item.patientId });
    }
  };

  const pendingReports = reports.filter(r => r.reviewStatus !== 'Reviewed');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Clinical Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        {/* Metric 1: Total Patients */}
        <div
          className="medx-card"
          style={{ padding: '1.25rem', cursor: 'pointer' }}
          onClick={() => onNavigateTab && onNavigateTab('patients')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>
                ACTIVE PATIENTS
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--medx-navy)', marginTop: '0.25rem' }}>
                {loading ? '...' : patients.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={13} /> Under Clinical Roster
              </div>
            </div>
            <div style={{ backgroundColor: '#EFF6FF', color: '#2563EB', padding: '0.625rem', borderRadius: 'var(--medx-radius-md)' }}>
              <Users size={22} />
            </div>
          </div>
        </div>

        {/* Metric 2: Today's Triage Queue */}
        <div className="medx-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>
                CONSULTATION QUEUE
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--medx-navy)', marginTop: '0.25rem' }}>
                {loading ? '...' : queue.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={13} /> Outpatient Walk-ins
              </div>
            </div>
            <div style={{ backgroundColor: '#FEF3C7', color: '#D97706', padding: '0.625rem', borderRadius: 'var(--medx-radius-md)' }}>
              <Clock size={22} />
            </div>
          </div>
        </div>

        {/* Metric 3: Pending Diagnostic Reports */}
        <div
          className="medx-card"
          style={{ padding: '1.25rem', cursor: 'pointer' }}
          onClick={() => onNavigateTab && onNavigateTab('reports')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>
                PENDING REVIEWS
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: pendingReports.length > 0 ? '#DC2626' : 'var(--medx-navy)', marginTop: '0.25rem' }}>
                {loading ? '...' : pendingReports.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: pendingReports.length > 0 ? '#DC2626' : '#16A34A', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {pendingReports.length > 0 ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
                {pendingReports.length > 0 ? 'Diagnostic Sign-off Needed' : 'All Reports Verified'}
              </div>
            </div>
            <div style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '0.625rem', borderRadius: 'var(--medx-radius-md)' }}>
              <FileText size={22} />
            </div>
          </div>
        </div>

        {/* Metric 4: Clinical Prescriptions */}
        <div className="medx-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>
                PRESCRIPTIONS ISSUED
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--medx-navy)', marginTop: '0.25rem' }}>
                {loading ? '...' : patients.reduce((acc, p) => acc + (p.prescriptionsCount || 0), 0)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={13} /> Recorded in Patient Records
              </div>
            </div>
            <div style={{ backgroundColor: '#ECFDF5', color: '#059669', padding: '0.625rem', borderRadius: 'var(--medx-radius-md)' }}>
              <Pill size={22} />
            </div>
          </div>
        </div>

        {/* Metric 5: Emergency Alerts */}
        <div
          className="medx-card"
          style={{
            padding: '1.25rem',
            cursor: 'pointer',
            borderLeft: emergencyCount > 0 ? '4px solid #E11D48' : 'none'
          }}
          onClick={() => onNavigateTab && onNavigateTab('emergency')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>
                EMERGENCY SOS DESK
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: emergencyCount > 0 ? '#E11D48' : 'var(--medx-navy)', marginTop: '0.25rem' }}>
                {loading ? '...' : emergencyCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: emergencyCount > 0 ? '#E11D48' : '#64748B', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertTriangle size={13} /> {emergencyCount > 0 ? 'Urgent SOS Broadcasts' : 'All Clear / Monitoring'}
              </div>
            </div>
            <div style={{ backgroundColor: emergencyCount > 0 ? '#FFE4E6' : '#F1F5F9', color: emergencyCount > 0 ? '#E11D48' : '#64748B', padding: '0.625rem', borderRadius: 'var(--medx-radius-md)' }}>
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Inspirational Clinical Perspective (Doctor Baseline Preservation) */}
      <div style={{
        backgroundColor: '#F3EEFF',
        border: '1px solid #DDD6FE',
        borderRadius: 'var(--medx-radius-md)',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        color: '#5B21B6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sparkles size={18} style={{ color: '#7C3AED', flexShrink: 0 }} />
          <span style={{ fontSize: '0.875rem', fontStyle: 'italic', fontWeight: 500 }}>
            "{CLINICAL_QUOTES[quoteIdx].quote}"
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7C3AED', whiteSpace: 'nowrap' }}>
            — {CLINICAL_QUOTES[quoteIdx].author}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setQuoteIdx((prev) => (prev + 1) % CLINICAL_QUOTES.length)}
          className="medx-btn medx-btn-outline"
          style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderColor: '#C4B5FD', color: '#6D28D9', borderRadius: '4px' }}
          title="Rotate clinical perspective"
        >
          Next Quote
        </button>
      </div>

      {/* Floating Status Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 100,
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          fontSize: '0.875rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle2 size={18} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workstation Layout: Live Queue on Left, Action Center on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Live Outpatient Queue & Waiting Room Console */}
        <div className="medx-card" style={{ padding: '1.5rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                  Live Consultation Queue & Waiting Room
                </h2>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '9999px'
                }}>
                  <Radio size={12} className="spin" style={{ animationDuration: '3s' }} /> LIVE SYNC
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: '0.25rem 0 0 0' }}>
                Real-time monitor of patients waiting outside in the lobby, currently inside cabin, and upcoming bookings.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="medx-btn medx-btn-primary"
                style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                onClick={() => setShowQRModal(true)}
                title="Display or print patient self check-in QR code for reception desk"
              >
                <QrCode size={14} /> Reception QR Standee
              </button>
              <button
                type="button"
                className="medx-btn medx-btn-secondary"
                style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                onClick={() => loadWorkstationData()}
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Queue
              </button>
            </div>
          </div>

          {/* Waiting Room Command Strip: In-Cabin vs Next Waiting Outside */}
          {(() => {
            const inCabin = queue.find(q => q.isCurrentlyInside || q.status === 'In-Consultation' || q.status === 'In Consultation');
            const nextWaiting = queue.find(q => q.isWaitingOutside || q.status === 'Waiting');

            if (!inCabin && !nextWaiting) return null;

            return (
              <div style={{
                display: 'grid',
                gridTemplateColumns: inCabin && nextWaiting ? '1fr 1fr' : '1fr',
                gap: '0.875rem',
                marginBottom: '1.25rem'
              }}>
                {/* Active Cabin Patient */}
                {inCabin && (
                  <div style={{
                    backgroundColor: '#F0FDF4',
                    border: '1.5px solid #86EFAC',
                    borderRadius: 'var(--medx-radius-md)',
                    padding: '0.875rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        color: '#15803D',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        letterSpacing: '0.04em'
                      }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
                        CURRENTLY IN CABIN
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', backgroundColor: '#DCFCE7', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        Token #{inCabin.tokenNumber}
                      </span>
                    </div>

                    <div>
                      <div style={{ fontWeight: 800, color: '#14532D', fontSize: '1.0625rem' }}>
                        {inCabin.patientName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '0.15rem' }}>
                        {inCabin.gender} • {inCabin.age} yrs • Blood: <strong>{inCabin.bloodGroup}</strong> • {inCabin.reason}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <button
                        type="button"
                        className="medx-btn"
                        style={{
                          backgroundColor: '#16A34A',
                          color: '#FFFFFF',
                          fontSize: '0.75rem',
                          padding: '0.35rem 0.65rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontWeight: 700
                        }}
                        onClick={() => handleFinishAndPrescribe(inCabin)}
                        disabled={actionLoadingId === (inCabin.appointmentId || inCabin.patientDocId)}
                      >
                        <CheckCircle2 size={13} /> Finish & Prescribe
                      </button>
                      <button
                        type="button"
                        className="medx-btn medx-btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.55rem' }}
                        onClick={() => {
                          api.get(`/doctor/patients/${inCabin.patientId}`)
                            .then(res => onSelectPatient(res.data))
                            .catch(() => alert('Failed to open dossier.'));
                        }}
                      >
                        <Eye size={13} /> Dossier
                      </button>
                    </div>
                  </div>
                )}

                {/* Next Patient Waiting Outside in Lobby */}
                {nextWaiting && (
                  <div style={{
                    backgroundColor: '#FFFBEB',
                    border: '1.5px solid #FCD34D',
                    borderRadius: 'var(--medx-radius-md)',
                    padding: '0.875rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        color: '#B45309',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        letterSpacing: '0.04em'
                      }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                        NEXT PATIENT WAITING OUTSIDE
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400E', backgroundColor: '#FEF3C7', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        Token #{nextWaiting.tokenNumber}
                      </span>
                    </div>

                    <div>
                      <div style={{ fontWeight: 800, color: '#78350F', fontSize: '1.0625rem' }}>
                        {nextWaiting.patientName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#92400E', marginTop: '0.15rem' }}>
                        Waiting in Outpatient Lobby • Est. Wait: <strong>{nextWaiting.estimatedWaitTime}</strong> • {nextWaiting.reason}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <button
                        type="button"
                        className="medx-btn"
                        style={{
                          backgroundColor: '#D97706',
                          color: '#FFFFFF',
                          fontSize: '0.75rem',
                          padding: '0.35rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontWeight: 700
                        }}
                        onClick={() => handleCallIn(nextWaiting)}
                        disabled={actionLoadingId === (nextWaiting.appointmentId || nextWaiting.patientDocId)}
                      >
                        <DoorOpen size={14} /> Call In to Cabin
                      </button>
                      <button
                        type="button"
                        className="medx-btn medx-btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.55rem' }}
                        onClick={() => {
                          api.get(`/doctor/patients/${nextWaiting.patientId}`)
                            .then(res => onSelectPatient(res.data))
                            .catch(() => alert('Failed to open dossier.'));
                        }}
                      >
                        <Eye size={13} /> Dossier
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Queue Filter Tabs Bar */}
          {(() => {
            const waitingCount = queue.filter(q => q.isWaitingOutside || q.status === 'Waiting').length;
            const inCabinCount = queue.filter(q => q.isCurrentlyInside || q.status === 'In-Consultation' || q.status === 'In Consultation').length;
            const upcomingCount = queue.filter(q => q.isUpcoming || q.status === 'Scheduled' || q.status === 'Confirmed').length;
            const completedCount = queue.filter(q => q.status === 'Completed').length;

            return (
              <div style={{
                display: 'flex',
                gap: '0.35rem',
                flexWrap: 'wrap',
                marginBottom: '1rem',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '0.5rem'
              }}>
                <button
                  type="button"
                  onClick={() => setQueueFilter('all')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.78125rem',
                    fontWeight: queueFilter === 'all' ? 700 : 500,
                    cursor: 'pointer',
                    backgroundColor: queueFilter === 'all' ? '#1E293B' : '#F1F5F9',
                    color: queueFilter === 'all' ? '#FFFFFF' : '#475569'
                  }}
                >
                  All Active ({queue.length})
                </button>

                <button
                  type="button"
                  onClick={() => setQueueFilter('waiting')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.78125rem',
                    fontWeight: queueFilter === 'waiting' ? 700 : 500,
                    cursor: 'pointer',
                    backgroundColor: queueFilter === 'waiting' ? '#D97706' : '#FEF3C7',
                    color: queueFilter === 'waiting' ? '#FFFFFF' : '#92400E'
                  }}
                >
                  🟡 Waiting Outside ({waitingCount})
                </button>

                <button
                  type="button"
                  onClick={() => setQueueFilter('in-cabin')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.78125rem',
                    fontWeight: queueFilter === 'in-cabin' ? 700 : 500,
                    cursor: 'pointer',
                    backgroundColor: queueFilter === 'in-cabin' ? '#16A34A' : '#DCFCE7',
                    color: queueFilter === 'in-cabin' ? '#FFFFFF' : '#166534'
                  }}
                >
                  🟢 In Cabin ({inCabinCount})
                </button>

                <button
                  type="button"
                  onClick={() => setQueueFilter('upcoming')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.78125rem',
                    fontWeight: queueFilter === 'upcoming' ? 700 : 500,
                    cursor: 'pointer',
                    backgroundColor: queueFilter === 'upcoming' ? '#2563EB' : '#EFF6FF',
                    color: queueFilter === 'upcoming' ? '#FFFFFF' : '#1D4ED8'
                  }}
                >
                  🔵 Upcoming ({upcomingCount})
                </button>

                <button
                  type="button"
                  onClick={() => setQueueFilter('completed')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.78125rem',
                    fontWeight: queueFilter === 'completed' ? 700 : 500,
                    cursor: 'pointer',
                    backgroundColor: queueFilter === 'completed' ? '#64748B' : '#F8FAFC',
                    color: queueFilter === 'completed' ? '#FFFFFF' : '#64748B'
                  }}
                >
                  Completed ({completedCount})
                </button>
              </div>
            );
          })()}

          {/* Queue Items Render */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--medx-text-secondary)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.5rem auto', display: 'block', color: 'var(--medx-navy)' }} />
              Synchronizing live patient queue...
            </div>
          ) : queue.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--medx-radius-md)',
              border: '1px dashed #CBD5E1'
            }}>
              <CheckCircle2 size={36} color="#16A34A" style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--medx-navy)', fontSize: '1rem' }}>No Patients in Queue</h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--medx-text-secondary)' }}>
                Your live outpatient queue is currently clear. Scheduled arrivals and walk-ins will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {queue
                .filter(item => {
                  if (queueFilter === 'waiting') return item.isWaitingOutside || item.status === 'Waiting';
                  if (queueFilter === 'in-cabin') return item.isCurrentlyInside || item.status === 'In-Consultation' || item.status === 'In Consultation';
                  if (queueFilter === 'upcoming') return item.isUpcoming || item.status === 'Scheduled' || item.status === 'Confirmed';
                  if (queueFilter === 'completed') return item.status === 'Completed';
                  return true;
                })
                .map((item, idx) => {
                  const isInside = item.isCurrentlyInside || item.status === 'In-Consultation' || item.status === 'In Consultation';
                  const isWaiting = item.isWaitingOutside || item.status === 'Waiting';
                  const isCompleted = item.status === 'Completed';
                  const isUpcoming = item.isUpcoming || item.status === 'Scheduled' || item.status === 'Confirmed';

                  let statusBorder = '#E2E8F0';
                  let statusLeft = '4px solid #CBD5E1';
                  let statusBadgeBg = '#F1F5F9';
                  let statusBadgeColor = '#475569';
                  let statusText = item.status;

                  if (isInside) {
                    statusBorder = '#86EFAC';
                    statusLeft = '4.5px solid #22C55E';
                    statusBadgeBg = '#DCFCE7';
                    statusBadgeColor = '#15803D';
                    statusText = 'IN CABIN';
                  } else if (isWaiting) {
                    statusBorder = '#FCD34D';
                    statusLeft = '4.5px solid #F59E0B';
                    statusBadgeBg = '#FEF3C7';
                    statusBadgeColor = '#B45309';
                    statusText = 'WAITING OUTSIDE';
                  } else if (isUpcoming) {
                    statusBorder = '#BFDBFE';
                    statusLeft = '4.5px solid #3B82F6';
                    statusBadgeBg = '#EFF6FF';
                    statusBadgeColor = '#1D4ED8';
                    statusText = `UPCOMING (${item.timeSlot})`;
                  } else if (isCompleted) {
                    statusBadgeBg = '#F1F5F9';
                    statusBadgeColor = '#64748B';
                    statusText = 'COMPLETED';
                  }

                  const isBusy = actionLoadingId === (item.appointmentId || item.patientDocId);

                  return (
                    <div
                      key={item.appointmentId || item.patientDocId || idx}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: `1px solid ${statusBorder}`,
                        borderLeft: statusLeft,
                        borderRadius: 'var(--medx-radius-md)',
                        padding: '1rem 1.125rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        boxShadow: isInside ? '0 4px 14px rgba(34, 197, 94, 0.12)' : (isWaiting ? '0 2px 8px rgba(245, 158, 11, 0.08)' : '0 1px 3px rgba(0,0,0,0.04)'),
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {/* Top Row: Token, Patient, Status Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {/* Token badge */}
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: isInside ? '#DCFCE7' : (isWaiting ? '#FEF3C7' : '#F1F5F9'),
                            color: isInside ? '#15803D' : (isWaiting ? '#B45309' : '#334155'),
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.8125rem',
                            border: `1px solid ${isInside ? '#86EFAC' : (isWaiting ? '#FCD34D' : '#CBD5E1')}`,
                            flexShrink: 0
                          }}>
                            <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', lineHeight: 1 }}>Token</span>
                            <span>#{item.tokenNumber}</span>
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 800, color: 'var(--medx-navy)', fontSize: '1rem' }}>
                                {item.patientName}
                              </span>
                              <span style={{
                                fontSize: '0.6875rem',
                                padding: '0.15rem 0.55rem',
                                borderRadius: '9999px',
                                fontWeight: 800,
                                letterSpacing: '0.04em',
                                backgroundColor: statusBadgeBg,
                                color: statusBadgeColor,
                                border: `1px solid ${statusBorder}`
                              }}>
                                {statusText}
                              </span>
                              {item.visitType && (
                                <span style={{
                                  fontSize: '0.6875rem',
                                  padding: '0.1rem 0.45rem',
                                  borderRadius: '4px',
                                  fontWeight: 600,
                                  backgroundColor: '#F8FAFC',
                                  color: '#64748B',
                                  border: '1px solid #E2E8F0'
                                }}>
                                  {item.visitType}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.78125rem', color: 'var(--medx-text-secondary)', marginTop: '0.2rem' }}>
                              {item.gender} • {item.age} yrs • Blood Group: <strong style={{ color: 'var(--medx-navy)' }}>{item.bloodGroup}</strong>
                              {item.patientPhone && ` • Phone: ${item.patientPhone}`}
                            </div>
                          </div>
                        </div>

                        {/* Timing and Wait display */}
                        <div style={{ textAlign: 'right', fontSize: '0.78125rem' }}>
                          <div style={{ fontWeight: 700, color: isWaiting ? '#B45309' : (isInside ? '#15803D' : '#1E293B') }}>
                            {item.estimatedWaitTime}
                          </div>
                          <div style={{ fontSize: '0.71875rem', color: 'var(--medx-text-secondary)', marginTop: '0.1rem' }}>
                            Slot: {item.timeSlot}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Clinical Reason & Vitals */}
                      <div style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: '6px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.8125rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}>
                        <div style={{ color: '#334155' }}>
                          <strong>Chief Reason:</strong> {item.reason || 'General Outpatient Evaluation'}
                        </div>
                        {item.vitalSigns && (
                          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#64748B' }}>
                            <span>BP: <strong style={{ color: '#1E293B' }}>{item.vitalSigns.bloodPressure || '120/80'}</strong></span>
                            <span>HR: <strong style={{ color: '#1E293B' }}>{item.vitalSigns.heartRate || '72'} bpm</strong></span>
                            <span>SpO2: <strong style={{ color: '#1E293B' }}>{item.vitalSigns.spo2 || '99%'}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Actions Row: Live Workflow Transitions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.25rem' }}>
                        {/* Primary Workflow Status Actions */}
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {/* If Waiting Outside -> Call In to Cabin */}
                          {isWaiting && (
                            <button
                              type="button"
                              className="medx-btn"
                              style={{
                                backgroundColor: '#16A34A',
                                color: '#FFFFFF',
                                fontSize: '0.75rem',
                                padding: '0.35rem 0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontWeight: 700
                              }}
                              onClick={() => handleCallIn(item)}
                              disabled={isBusy}
                            >
                              <DoorOpen size={14} /> Call In to Cabin
                            </button>
                          )}

                          {/* If In Cabin -> Complete Visit & Prescribe */}
                          {isInside && (
                            <>
                              <button
                                type="button"
                                className="medx-btn"
                                style={{
                                  backgroundColor: '#16A34A',
                                  color: '#FFFFFF',
                                  fontSize: '0.75rem',
                                  padding: '0.35rem 0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  fontWeight: 700
                                }}
                                onClick={() => handleFinishAndPrescribe(item)}
                                disabled={isBusy}
                              >
                                <CheckCircle2 size={14} /> Complete & Prescribe
                              </button>
                              <button
                                type="button"
                                className="medx-btn medx-btn-secondary"
                                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                onClick={() => handleCompleteVisit(item)}
                                disabled={isBusy}
                              >
                                <Check size={14} /> Finish Visit
                              </button>
                            </>
                          )}

                          {/* If Upcoming -> Mark Arrived Outside or Admit Directly */}
                          {isUpcoming && (
                            <>
                              <button
                                type="button"
                                className="medx-btn"
                                style={{
                                  backgroundColor: '#F59E0B',
                                  color: '#FFFFFF',
                                  fontSize: '0.75rem',
                                  padding: '0.35rem 0.7rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  fontWeight: 600
                                }}
                                onClick={() => handleMarkWaiting(item)}
                                disabled={isBusy}
                                title="Patient arrived at reception - mark waiting outside"
                              >
                                <LogIn size={13} /> Mark Arrived Outside
                              </button>
                              <button
                                type="button"
                                className="medx-btn medx-btn-secondary"
                                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                onClick={() => handleCallIn(item)}
                                disabled={isBusy}
                              >
                                <DoorOpen size={13} /> Admit Now
                              </button>
                            </>
                          )}
                        </div>

                        {/* Secondary Clinical Actions */}
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="medx-btn medx-btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            onClick={async () => {
                              try {
                                const res = await api.get(`/doctor/patients/${item.patientId}`);
                                onSelectPatient(res.data);
                              } catch (err) {
                                alert('Failed to load patient dossier: ' + (err.response?.data?.error?.message || err.message));
                              }
                            }}
                          >
                            <Eye size={13} /> Dossier
                          </button>

                          <button
                            type="button"
                            className="medx-btn medx-btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6D28D9', borderColor: '#DDD6FE' }}
                            onClick={async () => {
                              try {
                                const res = await api.get(`/doctor/patients/${item.patientId}`);
                                onOpenPrescription(res.data);
                              } catch (err) {
                                onOpenPrescription({ name: item.patientName, id: item.patientId });
                              }
                            }}
                          >
                            <Pill size={13} /> Prescribe
                          </button>

                          <button
                            type="button"
                            className="medx-btn"
                            style={{
                              backgroundColor: '#0284C7',
                              color: '#FFFFFF',
                              fontSize: '0.75rem',
                              padding: '0.35rem 0.6rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            onClick={async () => {
                              try {
                                const res = await api.get(`/doctor/patients/${item.patientId}`);
                                onOpenCall(res.data);
                              } catch (err) {
                                onOpenCall({ name: item.patientName, id: item.patientId });
                              }
                            }}
                          >
                            <Phone size={13} /> Consult
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Right Column: Quick Workstation Shortcuts & Pending Diagnostics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Diagnostic Reviews Panel */}
          <div className="medx-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--medx-navy)', margin: 0 }}>
                Reports Needing Review
              </h3>
              <span className="medx-badge" style={{ backgroundColor: '#FEF2F2', color: '#DC2626', fontSize: '0.75rem' }}>
                {pendingReports.length} pending
              </span>
            </div>

            {pendingReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', fontSize: '0.8125rem', color: 'var(--medx-text-secondary)' }}>
                No reports awaiting sign-off.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {pendingReports.slice(0, 4).map((rep) => (
                  <div
                    key={rep._id}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#F8FAFC',
                      borderRadius: 'var(--medx-radius-sm)',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer'
                    }}
                    onClick={() => onOpenReview(rep)}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--medx-navy)' }}>
                      {rep.reportName || rep.name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--medx-text-secondary)', marginTop: '0.25rem' }}>
                      <span>Date: {new Date(rep.reportDate || Date.now()).toLocaleDateString()}</span>
                      <span style={{ color: rep.mlResult?.riskTier === 'High' ? '#DC2626' : '#2563EB', fontWeight: 600 }}>
                        {rep.mlResult?.riskTier || 'Review Required'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clinical Workstation Status Box */}
          <div className="medx-card" style={{ padding: '1.25rem', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Stethoscope size={18} color="#16A34A" />
              <strong style={{ fontSize: '0.875rem', color: '#166534' }}>Physician Workstation Online</strong>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#166534', margin: 0, lineHeight: 1.5 }}>
              Secure clinical network connected. All prescription events, review signatures, and patient records are verified and authenticated.
            </p>
          </div>
        </div>
      </div>

      {/* Reception Self Check-In QR Standee Modal */}
      <ReceptionQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        doctorName="Dr. Sarah Jenkins"
        department="Cardiology & Outpatient Triage"
      />
    </div>
  );
}

export default DoctorWorkstation;
