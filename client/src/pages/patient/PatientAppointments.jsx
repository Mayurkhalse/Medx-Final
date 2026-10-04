import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Stethoscope,
  Building2,
  ChevronRight,
  Sparkles,
  RefreshCw,
  X,
  FileText,
  LogIn,
  Radio,
  QrCode
} from 'lucide-react';
import appointmentService from '../../services/appointmentService.js';

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingType, setBookingType] = useState('In-Person');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Reschedule Modal State
  const [showRescheduleModal, setShowRescheduleModal] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('10:00 AM');
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [aptsData, docsData] = await Promise.allSettled([
        appointmentService.getAppointments(),
        appointmentService.getAvailableDoctors()
      ]);

      if (aptsData.status === 'fulfilled' && Array.isArray(aptsData.value)) {
        setAppointments(aptsData.value);
      } else {
        setAppointments([]);
      }

      if (docsData.status === 'fulfilled' && Array.isArray(docsData.value)) {
        setDoctors(docsData.value);
        if (docsData.value.length > 0 && !selectedDoctorId) {
          setSelectedDoctorId(docsData.value[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load patient appointments:', err);
      showToast('Error loading your appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering
  const filteredAppointments = appointments.filter(apt => {
    const doctorName = apt.doctorName || '';
    const reason = apt.reason || '';
    const id = apt.id || apt.legacyId || '';

    const matchesSearch = !searchTerm.trim() ||
      doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const aptDateStr = apt.appointmentDate ? new Date(apt.appointmentDate).toISOString().split('T')[0] : '';

    if (activeTab === 'Waiting in Lobby') return apt.status === 'Waiting';
    if (activeTab === 'In Cabin') return apt.status === 'In-Consultation' || apt.status === 'In Consultation';
    if (activeTab === 'Upcoming') {
      return (apt.status === 'Scheduled' || apt.status === 'Confirmed' || apt.status === 'Waiting' || apt.status === 'In-Consultation') && aptDateStr >= todayStr;
    }
    if (activeTab === 'Confirmed') return apt.status === 'Confirmed';
    if (activeTab === 'Scheduled') return apt.status === 'Scheduled';
    if (activeTab === 'Completed') return apt.status === 'Completed';
    if (activeTab === 'Cancelled') return apt.status === 'Cancelled';
    return true;
  });

  // Booking submit
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      showToast('Please select a doctor for your consultation.');
      return;
    }

    try {
      setSubmittingBooking(true);
      await appointmentService.createAppointment({
        doctorId: selectedDoctorId,
        appointmentDate: bookingDate,
        timeSlot: bookingTime,
        type: bookingType,
        reason: bookingReason || 'General Medical Consultation',
        notes: bookingNotes
      });

      showToast('Appointment successfully scheduled!');
      setShowBookingModal(false);
      setBookingReason('');
      setBookingNotes('');
      await loadData();
    } catch (err) {
      console.error('Booking failed:', err);
      showToast(err.response?.data?.error?.message || 'Failed to book appointment.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Reschedule submit
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!showRescheduleModal || !rescheduleDate) return;

    try {
      setSubmittingReschedule(true);
      await appointmentService.rescheduleAppointment(showRescheduleModal._id || showRescheduleModal.id, {
        appointmentDate: rescheduleDate,
        timeSlot: rescheduleTime
      });

      showToast('Appointment rescheduled successfully.');
      setShowRescheduleModal(null);
      await loadData();
    } catch (err) {
      console.error('Reschedule failed:', err);
      showToast(err.response?.data?.error?.message || 'Failed to reschedule appointment.');
    } finally {
      setSubmittingReschedule(false);
    }
  };

  // Cancel appointment
  const handleCancelAppointment = async (apt) => {
    if (!window.confirm(`Are you sure you want to cancel your appointment with ${apt.doctorName}?`)) return;

    try {
      await appointmentService.cancelAppointment(apt._id || apt.id, 'Cancelled by patient');
      showToast('Appointment cancelled.');
      await loadData();
    } catch (err) {
      console.error('Cancel failed:', err);
      showToast('Error cancelling appointment.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Waiting':
        return { bg: '#FEF3C7', text: '#B45309', label: '🟡 Waiting Outside in Lobby' };
      case 'In-Consultation':
      case 'In Consultation':
        return { bg: '#DCFCE7', text: '#15803D', label: '🟢 In Cabin with Doctor' };
      case 'Confirmed':
        return { bg: '#DCFCE7', text: '#15803D', label: 'Confirmed' };
      case 'Scheduled':
      case 'Pending':
        return { bg: '#EFF6FF', text: '#1D4ED8', label: 'Scheduled' };
      case 'Completed':
        return { bg: '#F1F5F9', text: '#475569', label: 'Completed' };
      case 'Cancelled':
        return { bg: '#FEE2E2', text: '#B91C1C', label: 'Cancelled' };
      default:
        return { bg: '#EFF6FF', text: '#1D4ED8', label: status };
    }
  };

  // Quick Stats
  const waitingCount = appointments.filter(a => a.status === 'Waiting').length;
  const inCabinCount = appointments.filter(a => a.status === 'In-Consultation' || a.status === 'In Consultation').length;
  const upcomingCount = appointments.filter(a => (a.status === 'Confirmed' || a.status === 'Scheduled' || a.status === 'Waiting' || a.status === 'In-Consultation') && (new Date(a.appointmentDate).toISOString().split('T')[0] >= todayStr)).length;
  const confirmedCount = appointments.filter(a => a.status === 'Confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;

  const tabs = ['All', 'Waiting in Lobby', 'Upcoming', 'Confirmed', 'Completed', 'Cancelled'];

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

      {/* Header Banner */}
      <div className="medx-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#2563EB',
              backgroundColor: '#EFF6FF',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px'
            }}>
              Outpatient Consultations
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--medx-navy)', margin: '0 0 0.25rem 0' }}>
            My Clinical Appointments
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--medx-text-secondary)', margin: 0 }}>
            Schedule and manage consultations with certified hospital specialists
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            className="medx-btn medx-btn-secondary"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'medx-spin' : ''} />
            Refresh
          </button>

          <button
            type="button"
            className="medx-btn medx-btn-primary"
            onClick={() => setShowBookingModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} />
            Book Consultation
          </button>
        </div>
      </div>

      {/* Metric Counters Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="medx-card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563EB' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>Total Bookings</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--medx-navy)', marginTop: '0.25rem' }}>{appointments.length}</div>
        </div>

        <div className="medx-card" style={{ padding: '1.25rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>Upcoming Active</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706', marginTop: '0.25rem' }}>{upcomingCount}</div>
        </div>

        <div className="medx-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>Confirmed Visits</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>{confirmedCount}</div>
        </div>

        <div className="medx-card" style={{ padding: '1.25rem', borderLeft: '4px solid #64748B' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>Completed History</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#475569', marginTop: '0.25rem' }}>{completedCount}</div>
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
            placeholder="Search doctor, condition, ID..."
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
          <p style={{ margin: 0, fontWeight: 600 }}>Loading your appointments...</p>
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAppointments.map(apt => {
            const badge = getStatusBadge(apt.status);
            const formattedDate = apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }) : 'Date not set';

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
                {/* Doctor Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '280px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    border: '2px solid #DBEAFE'
                  }}>
                    <Stethoscope size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                        {apt.doctorName}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', backgroundColor: '#F1F5F9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        {apt.id}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: '0.2rem 0 0 0' }}>
                      {apt.doctorSpecialty} • {apt.doctorDepartment}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.2rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Building2 size={13} /> {apt.hospitalName}
                    </p>
                  </div>
                </div>

                {/* Timing, Type & Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                    <Calendar size={16} color="#64748B" />
                    <strong>{formattedDate}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                    <Clock size={16} color="#64748B" />
                    <span>{apt.timeSlot || '10:00 AM'}</span>
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.625rem',
                    borderRadius: '20px',
                    backgroundColor: apt.type === 'Video' ? '#F3E8FF' : '#E0F2FE',
                    color: apt.type === 'Video' ? '#7E22CE' : '#0369A1'
                  }}>
                    {apt.type === 'Video' ? 'Online Video Telehealth' : (apt.type === 'Follow-up' ? 'Follow-up Review' : 'In-Person Clinical')}
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

                {/* Live Waiting Queue Notification Banners */}
                {apt.status === 'Waiting' && (
                  <div style={{
                    width: '100%',
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FCD34D',
                    borderRadius: '6px',
                    padding: '0.625rem 0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    color: '#92400E',
                    fontSize: '0.8125rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Radio size={16} className="medx-spin" style={{ color: '#D97706', animationDuration: '3s' }} />
                      <span>
                        <strong>Checked In — Waiting in Outpatient Lobby</strong>. You are in the doctor's live queue.
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      {apt.queueToken && (
                        <span style={{ backgroundColor: '#FDE68A', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 800 }}>
                          Queue Token #{apt.queueToken}
                        </span>
                      )}
                      <Link
                        to={`/check-in?id=${apt.legacyId || apt.id || apt._id}`}
                        style={{
                          fontSize: '0.78125rem',
                          fontWeight: 700,
                          color: '#B45309',
                          textDecoration: 'underline'
                        }}
                      >
                        Track Live Queue Board &rarr;
                      </Link>
                    </div>
                  </div>
                )}

                {(apt.status === 'In-Consultation' || apt.status === 'In Consultation') && (
                  <div style={{
                    width: '100%',
                    backgroundColor: '#DCFCE7',
                    border: '1px solid #86EFAC',
                    borderRadius: '6px',
                    padding: '0.625rem 0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    color: '#15803D',
                    fontSize: '0.8125rem',
                    fontWeight: 600
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="#16A34A" />
                      <span>Admitted into Doctor's Cabin — Consultation is actively in progress.</span>
                    </div>
                    <Link
                      to={`/check-in?id=${apt.legacyId || apt.id || apt._id}`}
                      style={{
                        fontSize: '0.78125rem',
                        fontWeight: 700,
                        color: '#15803D',
                        textDecoration: 'underline'
                      }}
                    >
                      View Live Cabin Call Screen &rarr;
                    </Link>
                  </div>
                )}

                {/* Reason & Notes */}
                {apt.reason && (
                  <div style={{ width: '100%', fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', backgroundColor: '#F8FAFC', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                    <strong>Reason for visit:</strong> {apt.reason}
                    {apt.notes && <span> • <em>Note: {apt.notes}</em></span>}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: 'auto', flexWrap: 'wrap' }}>
                  {(apt.status === 'Confirmed' || apt.status === 'Scheduled') && (
                    <div style={{
                      fontSize: '0.78125rem',
                      color: '#475569',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '0.4rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem'
                    }}>
                      <QrCode size={15} color="#2563EB" />
                      <span>Hospital Arrival: Scan reception QR with ID <strong style={{ color: 'var(--medx-navy)' }}>{apt.id}</strong></span>
                    </div>
                  )}

                  {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                    <>
                      <button
                        type="button"
                        className="medx-btn medx-btn-secondary"
                        style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
                        onClick={() => {
                          setShowRescheduleModal(apt);
                          setRescheduleDate(apt.appointmentDate ? new Date(apt.appointmentDate).toISOString().split('T')[0] : todayStr);
                          setRescheduleTime(apt.timeSlot || '10:00 AM');
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
          <Calendar size={48} color="#94A3B8" style={{ margin: '0 auto 0.75rem auto' }} />
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--medx-navy)', fontWeight: 700 }}>
            No appointments found in "{activeTab}"
          </h4>
          <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem' }}>
            Book a clinical consultation with one of our specialized physicians today.
          </p>
          <button
            type="button"
            className="medx-btn medx-btn-primary"
            onClick={() => setShowBookingModal(true)}
            style={{ margin: '0 auto' }}
          >
            <Plus size={16} /> Book Your First Appointment
          </button>
        </div>
      )}

      {/* Book New Appointment Modal */}
      {showBookingModal && (
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
          <div className="medx-card" style={{ maxWidth: '540px', width: '100%', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--medx-navy)', margin: 0 }}>
                  Book Clinical Consultation
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: '0.2rem 0 0 0' }}>
                  Select an attending physician and desired time slot
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label className="medx-label">Choose Physician / Specialist *</label>
                <select
                  className="medx-input"
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  required
                >
                  <option value="">-- Select Specialist --</option>
                  {doctors.map(doc => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} — {doc.specialty} ({doc.department || 'Outpatient'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="medx-label">Preferred Date *</label>
                  <input
                    type="date"
                    className="medx-input"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={todayStr}
                    required
                  />
                </div>

                <div>
                  <label className="medx-label">Time Slot *</label>
                  <select
                    className="medx-input"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:15 AM">11:15 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="medx-label">Consultation Mode *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className={`medx-btn ${bookingType === 'In-Person' ? 'medx-btn-primary' : 'medx-btn-secondary'}`}
                    onClick={() => setBookingType('In-Person')}
                    style={{ fontSize: '0.8125rem', padding: '0.6rem' }}
                  >
                    In-Person Clinical Visit
                  </button>
                  <button
                    type="button"
                    className={`medx-btn ${bookingType === 'Video' ? 'medx-btn-primary' : 'medx-btn-secondary'}`}
                    onClick={() => setBookingType('Video')}
                    style={{ fontSize: '0.8125rem', padding: '0.6rem' }}
                  >
                    <Video size={15} /> Video Telehealth
                  </button>
                </div>
              </div>

              <div>
                <label className="medx-label">Reason for Consultation *</label>
                <input
                  type="text"
                  className="medx-input"
                  placeholder="e.g. Chronic fatigue, check blood biomarkers, second opinion"
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="medx-label">Symptoms & Notes for Physician (Optional)</label>
                <textarea
                  className="medx-input"
                  placeholder="Describe your current symptoms, relevant history, or questions..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="medx-btn medx-btn-secondary"
                  onClick={() => setShowBookingModal(false)}
                  disabled={submittingBooking}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="medx-btn medx-btn-primary"
                  disabled={submittingBooking}
                >
                  {submittingBooking ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
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
              Choose a new date and time for consultation with <strong>{showRescheduleModal.doctorName}</strong>.
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
                  <option value="03:30 PM">03:30 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="medx-btn medx-btn-secondary"
                  onClick={() => setShowRescheduleModal(null)}
                  disabled={submittingReschedule}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="medx-btn medx-btn-primary"
                  disabled={submittingReschedule}
                >
                  {submittingReschedule ? 'Saving...' : 'Confirm New Time'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
