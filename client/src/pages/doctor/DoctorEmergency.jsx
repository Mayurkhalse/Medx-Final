import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle, MapPin, Phone, User, CheckCircle2, ShieldAlert,
  Navigation, Volume2, VolumeX, Bell, Activity, Clock, RefreshCw,
  Filter, Check, X, ShieldCheck
} from 'lucide-react';
import emergencyService from '../../services/emergencyService.js';

export default function DoctorEmergency({
  onSelectPatient,
  onOpenCall,
  patients = []
}) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedMapAlert, setSelectedMapAlert] = useState(null);

  // Acknowledge & Dispatch Modal
  const [ackModalAlert, setAckModalAlert] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [dispatchStatus, setDispatchStatus] = useState('Rapid Response Squad Dispatched');
  const [isProcessing, setIsProcessing] = useState(false);

  // Audio Context ref for synthesized simulation
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);

  const fetchAlerts = async () => {
    try {
      const data = await emergencyService.getEmergencyAlerts();
      if (Array.isArray(data)) {
        setAlerts(data);
      }
    } catch (err) {
      console.error('[DOCTOR EMERGENCY] Error polling alerts:', err);
      setError(err.response?.data?.error?.message || 'Failed to fetch emergency alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Doctor polling approximately every 5 seconds per Phase 1C Contract
    const timer = setInterval(fetchAlerts, 5000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio Synth for Alarm simulation
  const triggerAudioTest = () => {
    if (isPlayingAudio) {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch (_) {}
        oscRef.current = null;
      }
      setIsPlayingAudio(false);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);

      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 500);
    } catch (e) {
      console.warn('[AUDIO] Synthesizer error:', e);
    }
  };

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE' || a.status === 'IN_PROGRESS');
  const criticalCount = alerts.filter(a =>
    a.vitalSeverity?.toLowerCase().includes('critical') || a.status === 'ACTIVE'
  ).length;
  const pendingCount = alerts.filter(a => a.status === 'ACTIVE').length;

  const filteredAlerts = alerts.filter(alert => {
    if (activeFilter === 'Critical') {
      return alert.vitalSeverity?.toLowerCase().includes('critical') || alert.status === 'ACTIVE';
    }
    if (activeFilter === 'Pending') {
      return alert.status === 'ACTIVE';
    }
    if (activeFilter === 'Resolved') {
      return alert.status === 'RESOLVED';
    }
    return alert.status !== 'RESOLVED'; // Default All shows open/in-progress
  });

  const handleOpenAckModal = (alert) => {
    setAckModalAlert(alert);
    setResolutionNote('');
    setDispatchStatus('Rapid Response Squad Dispatched');
  };

  const handleConfirmAck = async () => {
    if (!ackModalAlert) return;
    setIsProcessing(true);
    try {
      const finalNote = resolutionNote.trim()
        ? `[${dispatchStatus}] ${resolutionNote}`
        : dispatchStatus;

      await emergencyService.dispatchEmergencyAlert(ackModalAlert._id, {
        statusText: dispatchStatus,
        dispatchNotes: finalNote
      });

      setAckModalAlert(null);
      await fetchAlerts();
    } catch (err) {
      alert('Failed to dispatch response: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolveAlert = async (alert) => {
    const notes = prompt('Enter clinical resolution documentation for this patient:') || 'Patient evaluated, condition stabilized, acute distress resolved.';
    try {
      await emergencyService.resolveEmergencyAlert(alert._id, notes);
      await fetchAlerts();
    } catch (err) {
      alert('Failed to resolve alert: ' + (err.response?.data?.error?.message || err.message));
    }
  };

  const presetNotes = [
    'Rapid Response Squad Dispatched',
    'Physician Attending in ER Bay 2',
    'Patient Stabilized - Meds Administered',
    'Ambulance En Route to Location',
    'Transferred to Inpatient Bed'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Title & Emergency Control Header */}
      <div
        className="medx-card"
        style={{
          background: 'linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 100%)',
          border: '2px solid #FDA4AF',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#E11D48',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#881337', margin: 0 }}>
                Emergency Alerts & SOS Desk
              </h1>
              <p style={{ color: '#9F1239', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                Real-time critical patient SOS signals, telemetry monitor alerts & clinical response dispatch
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          <span
            style={{
              backgroundColor: '#BE123C',
              color: '#FFFFFF',
              padding: '0.4rem 0.875rem',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            <Bell size={15} />
            <span>{activeAlerts.length} Active SOS Alert{activeAlerts.length === 1 ? '' : 's'}</span>
          </span>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="medx-button"
            style={{
              fontSize: '0.8125rem',
              padding: '0.4rem 0.75rem',
              backgroundColor: isMuted ? '#F1F5F9' : '#FEE2E2',
              color: isMuted ? '#475569' : '#BE123C',
              border: '1px solid #CBD5E1',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span>{isMuted ? 'Alarm Muted' : 'Alarm Active'}</span>
          </button>

          <button
            onClick={triggerAudioTest}
            className="medx-button medx-button-secondary"
            style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <Activity size={15} />
            <span>{isPlayingAudio ? 'Sound Active...' : 'Test Siren (Simulated)'}</span>
          </button>

          {activeAlerts.length > 0 && (
            <button
              onClick={() => setSelectedMapAlert(activeAlerts[0])}
              className="medx-button medx-button-primary"
              style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <Navigation size={15} />
              <span>GPS Radar ({activeAlerts.length})</span>
            </button>
          )}

          <button
            onClick={fetchAlerts}
            className="medx-button medx-button-secondary"
            style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--medx-navy)" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--medx-navy)', textTransform: 'uppercase' }}>
            Filter Alerts:
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveFilter('All')}
            className={`medx-button ${activeFilter === 'All' ? 'medx-button-primary' : 'medx-button-secondary'}`}
            style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
          >
            Active & In Progress ({activeAlerts.length})
          </button>
          <button
            onClick={() => setActiveFilter('Pending')}
            className={`medx-button ${activeFilter === 'Pending' ? 'medx-button-primary' : 'medx-button-secondary'}`}
            style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
          >
            Pending Awaiting Triage ({pendingCount})
          </button>
          <button
            onClick={() => setActiveFilter('Critical')}
            className={`medx-button ${activeFilter === 'Critical' ? 'medx-button-primary' : 'medx-button-secondary'}`}
            style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
          >
            Critical Severity ({criticalCount})
          </button>
          <button
            onClick={() => setActiveFilter('Resolved')}
            className={`medx-button ${activeFilter === 'Resolved' ? 'medx-button-primary' : 'medx-button-secondary'}`}
            style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
          >
            Resolved History
          </button>
        </div>
      </div>

      {/* Alerts Feed */}
      {loading && alerts.length === 0 ? (
        <div className="medx-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--medx-text-secondary)' }}>Polling active emergency alerts...</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="medx-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#DCFCE7',
            color: '#16A34A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <CheckCircle2 size={28} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--medx-navy)', margin: '0 0 0.5rem 0' }}>
            All Emergency Broadcasts Clear
          </h3>
          <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            No patient emergency alerts currently requiring immediate physician response in this view.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAlerts.map((alert) => {
            const isResolved = alert.status === 'RESOLVED';
            const isInProgress = alert.status === 'IN_PROGRESS';

            return (
              <div
                key={alert._id || alert.alertId}
                className="medx-card"
                style={{
                  border: `2px solid ${isResolved ? '#E2E8F0' : isInProgress ? '#FBBF24' : '#FDA4AF'}`,
                  background: isResolved ? '#FFFFFF' : isInProgress ? '#FFFDF5' : '#FFF5F5',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      backgroundColor: isResolved ? '#94A3B8' : isInProgress ? '#F59E0B' : '#E11D48',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 900
                    }}>
                      🚨
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--medx-navy)' }}>
                          {alert.alertType || 'Emergency SOS Distress Signal'}
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            backgroundColor: isResolved ? '#F1F5F9' : isInProgress ? '#FEF3C7' : '#FFE4E6',
                            color: isResolved ? '#64748B' : isInProgress ? '#B45309' : '#BE123C'
                          }}
                        >
                          {alert.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <span>Alert ID: <strong style={{ fontFamily: 'monospace' }}>{alert.alertId || alert._id}</strong></span>
                        <span>•</span>
                        <span>Logged: {new Date(alert.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '0.25rem 0.625rem',
                      borderRadius: '6px',
                      backgroundColor: '#FEE2E2',
                      color: '#991B1B',
                      border: '1px solid #FECACA'
                    }}
                  >
                    {alert.vitalSeverity || 'Critical High Risk'}
                  </span>
                </div>

                {/* 3 Information Blocks */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {/* Patient Details */}
                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.875rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--medx-text-secondary)', textTransform: 'uppercase' }}>
                      Patient Details
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--medx-navy)', marginTop: '0.25rem' }}>
                      {alert.patientName || alert.patientId?.name || 'Emergency Patient'}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', marginTop: '0.2rem' }}>
                      Age: {alert.age || '—'} Yrs • Blood Group: <strong style={{ color: '#BE123C' }}>{alert.bloodGroup || '—'}</strong>
                    </div>
                  </div>

                  {/* Vitals at SOS */}
                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.875rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--medx-text-secondary)', textTransform: 'uppercase' }}>
                      Recorded Vitals at Alert
                    </div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'monospace', color: '#9F1239', marginTop: '0.25rem' }}>
                      {alert.vitalsAtAlert || 'Distress telemetry flagged by patient'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', marginTop: '0.2rem' }}>
                      Reason: {alert.triggerReason || 'Acute Distress'}
                    </div>
                  </div>

                  {/* Telemetry Location */}
                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.875rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--medx-text-secondary)', textTransform: 'uppercase' }}>
                      Telemetry Location
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem', marginTop: '0.25rem' }}>
                      <MapPin size={15} color="#E11D48" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                          {alert.location?.address || 'Location detected via device GPS'}
                        </div>
                        {alert.location?.coordinatesText && (
                          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--medx-text-secondary)' }}>
                            {alert.location.coordinatesText}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dispatch & Clinical Notes Strip */}
                {(alert.dispatch?.statusText || alert.resolutionNotes) && (
                  <div style={{
                    backgroundColor: isResolved ? '#F8FAFC' : '#FEF3C7',
                    border: `1px solid ${isResolved ? '#CBD5E1' : '#FDE68A'}`,
                    padding: '0.625rem 0.875rem',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    color: isResolved ? '#334155' : '#92400E'
                  }}>
                    <strong>Clinical Action:</strong> {alert.dispatch?.statusText || 'Resolved'} {alert.dispatch?.dispatchNotes ? `— ${alert.dispatch.dispatchNotes}` : ''} {alert.resolutionNotes ? `• Resolution: ${alert.resolutionNotes}` : ''}
                  </div>
                )}

                {/* Action Buttons */}
                {!isResolved && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
                    <button
                      onClick={() => onSelectPatient && onSelectPatient({
                        _id: alert.patientProfileId || alert.patientId?._id || alert.patientId,
                        name: alert.patientName || alert.patientId?.name,
                        phone: alert.phone
                      })}
                      className="medx-button medx-button-primary"
                      style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                    >
                      <User size={14} /> View Dossier
                    </button>

                    <button
                      onClick={() => setSelectedMapAlert(alert)}
                      className="medx-button medx-button-secondary"
                      style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                    >
                      <Navigation size={14} /> GPS Radar
                    </button>

                    <button
                      onClick={() => onOpenCall && onOpenCall({
                        _id: alert.patientProfileId || alert.patientId?._id || alert.patientId,
                        name: alert.patientName,
                        phone: alert.phone || '+91 98112 34567'
                      })}
                      className="medx-button"
                      style={{
                        fontSize: '0.8125rem',
                        padding: '0.4rem 0.75rem',
                        backgroundColor: '#DCFCE7',
                        color: '#15803D',
                        border: '1px solid #BBF7D0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem'
                      }}
                    >
                      <Phone size={14} /> Call Patient (Simulated)
                    </button>

                    <button
                      onClick={() => handleOpenAckModal(alert)}
                      className="medx-button"
                      style={{
                        fontSize: '0.8125rem',
                        padding: '0.4rem 0.75rem',
                        backgroundColor: '#FEE2E2',
                        color: '#B91C1C',
                        border: '1px solid #FCA5A5',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem'
                      }}
                    >
                      <ShieldAlert size={14} /> Acknowledge & Dispatch
                    </button>

                    <button
                      onClick={() => handleResolveAlert(alert)}
                      className="medx-button medx-button-secondary"
                      style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                    >
                      <CheckCircle2 size={14} /> Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Acknowledge & Dispatch Modal */}
      {ackModalAlert && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="medx-card" style={{ maxWidth: '520px', width: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#881337', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={20} /> Acknowledge & Dispatch Response
              </h3>
              <button
                onClick={() => setAckModalAlert(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--medx-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--medx-text-secondary)', margin: 0 }}>
              Dispatch rapid response personnel and acknowledge patient <strong>{ackModalAlert.patientName}</strong> ({ackModalAlert.alertId}).
            </p>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Operational Response Status
              </label>
              <select
                value={dispatchStatus}
                onChange={(e) => setDispatchStatus(e.target.value)}
                className="medx-input"
                style={{ width: '100%' }}
              >
                {presetNotes.map((note) => (
                  <option key={note} value={note}>{note}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Clinical Directives & Dispatch Notes
              </label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Optional operational instructions for ambulance or clinical response team..."
                className="medx-input"
                style={{ width: '100%', height: '80px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => setAckModalAlert(null)}
                className="medx-button medx-button-secondary"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAck}
                className="medx-button"
                disabled={isProcessing}
                style={{ backgroundColor: '#E11D48', color: '#FFFFFF', fontWeight: 700 }}
              >
                {isProcessing ? 'Dispatching...' : 'Confirm Response & Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GPS Radar Modal (Integrated Visual Map & Telemetry Coordinates) */}
      {selectedMapAlert && (
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
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="medx-card" style={{ maxWidth: '640px', width: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Navigation size={22} color="#E11D48" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--medx-navy)', margin: 0 }}>
                  Telemetry GPS Location Radar
                </h3>
              </div>
              <button
                onClick={() => setSelectedMapAlert(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--medx-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              height: '240px',
              backgroundColor: '#0F172A',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #334155'
            }}>
              {/* Concentric Radar Rings */}
              <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', border: '1px solid rgba(225, 29, 72, 0.2)' }} />
              <div style={{ position: 'absolute', width: '140px', height: '140px', borderRadius: '50%', border: '1px solid rgba(225, 29, 72, 0.3)' }} />
              <div style={{ position: 'absolute', width: '80px', height: '80px', borderRadius: '50%', border: '1px solid rgba(225, 29, 72, 0.4)' }} />
              {/* Radar Crosshairs */}
              <div style={{ position: 'absolute', width: '100%', height: '1px', backgroundColor: 'rgba(225, 29, 72, 0.2)' }} />
              <div style={{ position: 'absolute', height: '100%', width: '1px', backgroundColor: 'rgba(225, 29, 72, 0.2)' }} />

              {/* Patient Pin */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                animation: 'pulse 2s infinite'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#E11D48',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px #E11D48'
                }}>
                  <MapPin size={20} />
                </div>
                <span style={{ color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 800, marginTop: '4px', textShadow: '0 1px 4px #000' }}>
                  {selectedMapAlert.patientName}
                </span>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--medx-surface-muted)', padding: '0.875rem', borderRadius: '8px', fontSize: '0.8125rem' }}>
              <div><strong>Address:</strong> {selectedMapAlert.location?.address || 'Patient Device GPS'}</div>
              <div style={{ marginTop: '0.25rem' }}>
                <strong>Coordinates:</strong> <span style={{ fontFamily: 'monospace', color: '#BE123C' }}>
                  {selectedMapAlert.location?.coordinatesText || `${selectedMapAlert.location?.latitude || 28.6139}° N, ${selectedMapAlert.location?.longitude || 77.2090}° E`}
                </span>
              </div>
              <div style={{ marginTop: '0.25rem', color: 'var(--medx-text-secondary)', fontSize: '0.75rem' }}>
                Note: GPS rendering displays localized browser and device coordinates captured during patient SOS transmission.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedMapAlert(null)}
                className="medx-button medx-button-primary"
              >
                Close Radar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
