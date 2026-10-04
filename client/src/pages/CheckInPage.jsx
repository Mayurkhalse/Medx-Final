import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  QrCode,
  CheckCircle2,
  Clock,
  User,
  Stethoscope,
  Building2,
  AlertCircle,
  RefreshCw,
  DoorOpen,
  ArrowRight,
  Radio,
  Sparkles,
  Search,
  LogIn,
  ChevronRight,
  ShieldCheck,
  Bell
} from 'lucide-react';
import appointmentService from '../services/appointmentService.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function CheckInPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointmentCodeInput, setAppointmentCodeInput] = useState(searchParams.get('id') || '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeQueueData, setActiveQueueData] = useState(null);
  const [loadingActiveQueue, setLoadingActiveQueue] = useState(false);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loadingTodayApts, setLoadingTodayApts] = useState(true);

  // Audio / visual alert ref when doctor calls in
  const previousStatusRef = useRef(null);
  const [calledInAlert, setCalledInAlert] = useState(false);

  // Load patient's today appointments on mount
  useEffect(() => {
    const fetchTodayApts = async () => {
      try {
        setLoadingTodayApts(true);
        const apts = await appointmentService.getAppointments();
        if (Array.isArray(apts)) {
          const todayStr = new Date().toISOString().split('T')[0];
          const forToday = apts.filter(a => {
            const dateStr = a.appointmentDate ? new Date(a.appointmentDate).toISOString().split('T')[0] : '';
            return dateStr === todayStr || a.status === 'Waiting' || a.status === 'In-Consultation';
          });
          setTodayAppointments(forToday);

          // If an appointment is already waiting or in-consultation, auto-load its live queue!
          const activeApt = forToday.find(a => a.status === 'Waiting' || a.status === 'In-Consultation');
          if (activeApt && !activeQueueData) {
            loadLiveQueue(activeApt.legacyId || activeApt.id || activeApt._id);
          }
        }
      } catch (err) {
        console.error('Failed to load appointments for check-in:', err);
      } finally {
        setLoadingTodayApts(false);
      }
    };

    fetchTodayApts();
  }, []);

  // Poll live queue every 10 seconds if active
  useEffect(() => {
    if (!activeQueueData?.appointment?._id && !activeQueueData?.appointment?.legacyId) return;

    const targetId = activeQueueData.appointment.legacyId || activeQueueData.appointment._id;
    const interval = setInterval(() => {
      loadLiveQueue(targetId, true);
    }, 10000);

    return () => clearInterval(interval);
  }, [activeQueueData?.appointment?._id, activeQueueData?.appointment?.legacyId]);

  // Load live queue data for an appointment
  const loadLiveQueue = async (aptId, silent = false) => {
    try {
      if (!silent) setLoadingActiveQueue(true);
      setErrorMsg('');
      const data = await appointmentService.getLiveQueue(aptId);
      setActiveQueueData(data);

      // Check if status changed from Waiting to In-Consultation (Doctor called in!)
      if (previousStatusRef.current === 'Waiting' && data.yourStatus === 'In-Consultation') {
        setCalledInAlert(true);
      }
      previousStatusRef.current = data.yourStatus;
    } catch (err) {
      console.error('Failed to fetch live queue data:', err);
      if (!silent) {
        setErrorMsg(err.response?.data?.error?.message || 'Could not retrieve live queue status.');
      }
    } finally {
      if (!silent) setLoadingActiveQueue(false);
    }
  };

  // Handle Form Check-In Submission
  const handleCheckInSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!appointmentCodeInput.trim()) {
      setErrorMsg('Please enter your Appointment ID (e.g. APT-1003).');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const checkInResult = await appointmentService.checkIn(appointmentCodeInput.trim());

      // Then load its live queue
      const apt = checkInResult.appointment;
      await loadLiveQueue(apt.legacyId || apt.id || apt._id);
    } catch (err) {
      console.error('Check-in error:', err);
      setErrorMsg(err.response?.data?.error?.message || 'Failed to check in. Please verify your Appointment ID.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      {/* Visual Alert Modal when Doctor calls patient into cabin */}
      {calledInAlert && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div className="medx-card" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '2rem',
            textAlign: 'center',
            border: '3px solid #22C55E',
            boxShadow: '0 25px 50px rgba(34, 197, 94, 0.35)',
            animation: 'pulse 2s infinite'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <DoorOpen size={36} />
            </div>

            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#15803D',
              backgroundColor: '#DCFCE7',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px'
            }}>
              YOUR TURN TO ENTER
            </span>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--medx-navy)', margin: '0.75rem 0 0.5rem' }}>
              Doctor is Ready for You!
            </h2>

            <p style={{ fontSize: '0.9375rem', color: '#334155', margin: '0 0 1.5rem 0' }}>
              <strong>{activeQueueData?.doctorName}</strong> has called you in. Please proceed to <strong>Cabin 1 (Outpatient Consultation Room)</strong> now.
            </p>

            <button
              type="button"
              className="medx-btn"
              style={{
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                fontWeight: 700
              }}
              onClick={() => setCalledInAlert(false)}
            >
              I Am Entering Cabin
            </button>
          </div>
        </div>
      )}

      {/* Top Branding Banner */}
      <div className="medx-card" style={{
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        color: '#FFFFFF',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <QrCode size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.71875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#60A5FA' }}>
                Outpatient Reception Kiosk
              </span>
              <span style={{ fontSize: '0.6875rem', backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ADE80', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Radio size={10} className="medx-spin" style={{ animationDuration: '2s' }} /> LIVE
              </span>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.2rem 0 0 0', color: '#FFFFFF' }}>
              Hospital Arrival & Live Queue Tracker
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/patient"
            className="medx-btn medx-btn-outline"
            style={{ fontSize: '0.78125rem', padding: '0.35rem 0.75rem', color: '#93C5FD', borderColor: 'rgba(147, 197, 253, 0.3)' }}
          >
            Patient Portal
          </Link>
        </div>
      </div>

      {/* Main View: Check-In Form vs Active Live Queue Tracker */}
      {!activeQueueData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Check-In Card */}
          <div className="medx-card" style={{ padding: '2rem' }}>
            <div style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto 1.75rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                border: '2px solid #DBEAFE'
              }}>
                <LogIn size={26} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--medx-navy)', margin: '0 0 0.35rem' }}>
                Self Check-In on Arrival
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--medx-text-secondary)', margin: 0 }}>
                Enter your Appointment Reference ID to confirm your arrival, receive your queue token, and monitor your turn in real time.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: '#DC2626',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCheckInSubmit} style={{ maxWidth: '440px', margin: '0 auto' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--medx-navy)', marginBottom: '0.4rem' }}>
                  Appointment ID / Reference Code
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="medx-input"
                    placeholder="e.g. APT-1003"
                    value={appointmentCodeInput}
                    onChange={(e) => setAppointmentCodeInput(e.target.value.toUpperCase())}
                    style={{
                      height: '46px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      paddingLeft: '1rem',
                      textTransform: 'uppercase'
                    }}
                    autoFocus
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Quick Fill Seed IDs:</span>
                  {[
                    { id: 'APT-1003', label: 'APT-1003 (John Doe)' },
                    { id: 'APT-1002', label: 'APT-1002 (Sarah Miller)' },
                    { id: 'APT-1001', label: 'APT-1001 (Robert Chen)' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAppointmentCodeInput(item.id)}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        border: '1px solid #BFDBFE',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem' }}>
                  You received this ID when booking your consultation or in your confirmation details.
                </div>
              </div>

              <button
                type="submit"
                className="medx-btn medx-btn-primary"
                disabled={submitting}
                style={{
                  width: '100%',
                  height: '46px',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={18} className="medx-spin" /> Confirming Arrival...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} /> Confirm Arrival & Join Queue
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Today's Scheduled Appointments Quick Selection */}
          {todayAppointments.length > 0 && (
            <div className="medx-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--medx-navy)', margin: '0 0 1rem 0' }}>
                Your Scheduled Consultations Today
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {todayAppointments.map(apt => (
                  <div
                    key={apt.id || apt._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.875rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--medx-navy)', fontSize: '0.9375rem' }}>
                          {apt.doctorName}
                        </span>
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#EFF6FF', color: '#2563EB', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                          {apt.id}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', marginTop: '0.2rem' }}>
                        Slot: <strong>{apt.timeSlot}</strong> • {apt.doctorSpecialty} • Reason: {apt.reason}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="medx-btn medx-btn-secondary"
                      style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={() => setAppointmentCodeInput(apt.id || apt.legacyId || apt._id)}
                      title="Insert this Appointment ID into the check-in field above"
                    >
                      Use ID: {apt.id}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* LIVE WAITING ROOM TRACKER VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Live Status Toast Banner */}
          <div style={{
            backgroundColor: activeQueueData.yourStatus === 'In-Consultation' ? '#DCFCE7' : '#FEF3C7',
            border: `1.5px solid ${activeQueueData.yourStatus === 'In-Consultation' ? '#86EFAC' : '#FCD34D'}`,
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {activeQueueData.yourStatus === 'In-Consultation' ? (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#22C55E', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DoorOpen size={20} />
                </div>
              ) : (
                <Radio size={22} className="medx-spin" style={{ color: '#D97706', animationDuration: '3s' }} />
              )}
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: activeQueueData.yourStatus === 'In-Consultation' ? '#14532D' : '#78350F' }}>
                  {activeQueueData.yourStatus === 'In-Consultation'
                    ? '🟢 Active Consultation in Progress'
                    : '🟡 Successfully Checked In — Waiting in Outpatient Lobby'}
                </div>
                <div style={{ fontSize: '0.8125rem', color: activeQueueData.yourStatus === 'In-Consultation' ? '#166534' : '#92400E', marginTop: '0.15rem' }}>
                  {activeQueueData.yourStatus === 'In-Consultation'
                    ? 'Please proceed into the doctor\'s cabin immediately.'
                    : 'Take a seat in the waiting area. Your doctor is notified of your arrival.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                className="medx-btn medx-btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                onClick={() => loadLiveQueue(activeQueueData?.appointment?.legacyId || activeQueueData?.appointment?._id || appointmentCodeInput)}
                disabled={loadingActiveQueue}
              >
                <RefreshCw size={13} className={loadingActiveQueue ? 'medx-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {/* Prominent Token Display Card */}
          <div className="medx-card" style={{
            padding: '2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem 2.5rem',
              borderRadius: '16px',
              backgroundColor: activeQueueData.yourStatus === 'In-Consultation' ? '#F0FDF4' : '#FFFBEB',
              border: `3px solid ${activeQueueData.yourStatus === 'In-Consultation' ? '#22C55E' : '#F59E0B'}`,
              boxShadow: activeQueueData.yourStatus === 'In-Consultation' ? '0 10px 30px rgba(34, 197, 94, 0.15)' : '0 10px 30px rgba(245, 158, 11, 0.12)',
              marginBottom: '1.5rem'
            }}>
              <span style={{
                fontSize: '0.8125rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: activeQueueData.yourStatus === 'In-Consultation' ? '#15803D' : '#B45309'
              }}>
                YOUR QUEUE TOKEN
              </span>
              <span style={{
                fontSize: '3.5rem',
                fontWeight: 900,
                lineHeight: 1.1,
                color: activeQueueData.yourStatus === 'In-Consultation' ? '#15803D' : '#92400E',
                margin: '0.25rem 0'
              }}>
                {activeQueueData.yourToken ? `#${activeQueueData.yourToken}` : '—'}
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: activeQueueData.yourStatus === 'In-Consultation' ? '#DCFCE7' : '#FEF3C7',
                color: activeQueueData.yourStatus === 'In-Consultation' ? '#166534' : '#B45309',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px'
              }}>
                {activeQueueData.yourStatus === 'In-Consultation' ? 'CURRENTLY IN CABIN' : 'WAITING OUTSIDE'}
              </span>
            </div>

            {/* Metrics Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              textAlign: 'left',
              marginTop: '0.5rem'
            }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>PATIENTS AHEAD</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--medx-navy)', marginTop: '0.15rem' }}>
                  {activeQueueData.patientsAhead === 0 ? 'None (You\'re Next)' : `${activeQueueData.patientsAhead} Patient${activeQueueData.patientsAhead > 1 ? 's' : ''}`}
                </div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>ESTIMATED WAIT</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D97706', marginTop: '0.15rem' }}>
                  {activeQueueData.estimatedWaitTimeText}
                </div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>ATTENDING PHYSICIAN</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--medx-navy)', marginTop: '0.25rem' }}>
                  {activeQueueData.doctorName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', marginTop: '0.1rem' }}>
                  {activeQueueData.doctorSpecialty}
                </div>
              </div>
            </div>
          </div>

          {/* Live Outpatient Board */}
          <div className="medx-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--medx-navy)', margin: 0 }}>
                  Live Outpatient Triage Board
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: '0.2rem 0 0 0' }}>
                  Live queue progression for {activeQueueData.doctorName} • Cabin 1
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#059669', backgroundColor: '#ECFDF5', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                <Radio size={12} className="medx-spin" style={{ animationDuration: '3s' }} /> Auto-syncing
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {activeQueueData.queueBoard && activeQueueData.queueBoard.length > 0 ? (
                activeQueueData.queueBoard.map((item, idx) => {
                  const isInCabin = item.status === 'In-Consultation';
                  const isYou = item.isYou;

                  return (
                    <div
                      key={item.id || idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: isYou
                          ? '2px solid #3B82F6'
                          : (isInCabin ? '1.5px solid #86EFAC' : '1px solid #E2E8F0'),
                        backgroundColor: isYou
                          ? '#EFF6FF'
                          : (isInCabin ? '#F0FDF4' : '#FFFFFF'),
                        boxShadow: isYou ? '0 2px 8px rgba(59, 130, 246, 0.15)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: isInCabin ? '#DCFCE7' : (isYou ? '#DBEAFE' : '#F1F5F9'),
                          color: isInCabin ? '#15803D' : (isYou ? '#1D4ED8' : '#475569'),
                          fontWeight: 800,
                          fontSize: '0.8125rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          #{item.tokenNumber}
                        </div>
                        <div>
                          <div style={{ fontWeight: isYou ? 800 : 600, color: isYou ? '#1D4ED8' : 'var(--medx-navy)', fontSize: '0.9375rem' }}>
                            {item.displayName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
                            {isInCabin ? 'Currently In Cabin with Physician' : 'Waiting Outside in Outpatient Lobby'}
                          </div>
                        </div>
                      </div>

                      <span style={{
                        fontSize: '0.71875rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        backgroundColor: isInCabin ? '#DCFCE7' : (isYou ? '#DBEAFE' : '#FEF3C7'),
                        color: isInCabin ? '#15803D' : (isYou ? '#1D4ED8' : '#B45309')
                      }}>
                        {isInCabin ? '🟢 IN CABIN' : (isYou ? '⭐ YOU' : '🟡 WAITING')}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748B', fontSize: '0.875rem' }}>
                  No other patients in queue.
                </div>
              )}
            </div>
          </div>

          {/* Reset / Check In Another Appointment Button */}
          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="medx-btn medx-btn-secondary"
              onClick={() => {
                setActiveQueueData(null);
                setAppointmentCodeInput('');
              }}
              style={{ fontSize: '0.8125rem', padding: '0.4rem 0.85rem' }}
            >
              Check In Another Appointment Reference
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
