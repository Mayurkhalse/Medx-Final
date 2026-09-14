import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  ShieldAlert,
  Navigation,
  Volume2,
  VolumeX,
  Bell,
  Activity,
  Heart,
  Clock,
  RefreshCw,
  ExternalLink,
  Filter,
  MessageSquare,
  Send,
  X,
  ShieldCheck,
  FileText,
  BellRing,
  Smartphone,
  Radio,
  Zap,
  Check,
  Settings
} from 'lucide-react';
import RealGpsMapModal from './RealGpsMapModal';
import { executeEmergencyBroadcast } from '../services/notificationService';

export default function EmergencyView({
  emergencyAlerts = [],
  patients = [],
  onViewPatient,
  onAcknowledgeEmergency,
  emergencyWorkflow,
  isMuted: globalIsMuted,
  isPlayingAudio: globalIsPlayingAudio,
  onToggleAudioMute: globalToggleAudioMute,
  onTriggerAudioTest: globalTriggerAudioTest,
  onCallPatient,
  onStartConsultation,
  notificationPermission = 'default',
  onRequestNotificationPermission,
  onTriggerEmergencySOS
}) {
  const [selectedMapAlert, setSelectedMapAlert] = useState(null);
  const [localIsMuted, setLocalIsMuted] = useState(false);
  const [localIsPlayingAudio, setLocalIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef(null);

  const isMuted = globalToggleAudioMute !== undefined ? globalIsMuted : localIsMuted;
  const isPlayingAudio = globalToggleAudioMute !== undefined ? globalIsPlayingAudio : localIsPlayingAudio;

  const [activeFilter, setActiveFilter] = useState('All');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [ackModalAlert, setAckModalAlert] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [dispatchStatus, setDispatchStatus] = useState('Rapid Response Squad Dispatched');

  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastPatientId, setBroadcastPatientId] = useState(patients[0]?.id || 'PX-10482');
  const [broadcastAlertType, setBroadcastAlertType] = useState('Critical Vent Oxygen Pressure Drop');
  const [broadcastVitals, setBroadcastVitals] = useState('BP: 84/52 mmHg | HR: 138 BPM | SpO2: 88%');
  const [broadcastPhone, setBroadcastPhone] = useState('+91 98112 34567');
  const [broadcastWebhook, setBroadcastWebhook] = useState('');
  const [broadcastLogs, setBroadcastLogs] = useState([]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const activeAlertsCount = emergencyAlerts.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsedTime = (totalSec) => {
    if (totalSec < 60) return `${totalSec}s`;
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const toggleAudioMute = () => {
    if (globalToggleAudioMute) {
      globalToggleAudioMute();
      return;
    }
    setLocalIsMuted(!localIsMuted);
  };

  const triggerAudioTest = () => {
    if (globalTriggerAudioTest) {
      globalTriggerAudioTest();
      return;
    }
  };

  const filteredAlerts = emergencyAlerts.filter(alert => {
    if (activeFilter === 'Critical') {
      return (
        alert.vitalSeverity?.toLowerCase().includes('critical') ||
        alert.status?.toLowerCase().includes('critical')
      );
    }
    if (activeFilter === 'Pending') {
      return (
        alert.status?.toLowerCase().includes('sos active') ||
        alert.status?.toLowerCase().includes('pending')
      );
    }
    return true;
  });

  const criticalCount = emergencyAlerts.filter(a =>
    a.vitalSeverity?.toLowerCase().includes('critical') || a.status?.toLowerCase().includes('critical')
  ).length;

  const pendingCount = emergencyAlerts.filter(a =>
    a.status?.toLowerCase().includes('sos active') || a.status?.toLowerCase().includes('pending')
  ).length;

  const handleOpenAckModal = (alert) => {
    setAckModalAlert(alert);
    setResolutionNote('');
    setDispatchStatus('Rapid Response Squad Dispatched');
  };

  const handleConfirmAck = () => {
    if (!ackModalAlert) return;
    const finalNote = resolutionNote.trim()
      ? `[${dispatchStatus}] ${resolutionNote}`
      : dispatchStatus;

    if (onAcknowledgeEmergency) {
      onAcknowledgeEmergency(ackModalAlert.id, finalNote);
    }

    setAckModalAlert(null);
    setResolutionNote('');
  };

  const matchedPatientForMap = selectedMapAlert
    ? patients.find(p => p.id === selectedMapAlert.patientId)
    : null;

  const presetNotes = [
    'Rapid Response Squad Dispatched',
    'Physician Attending in ER Room 2',
    'Patient Stabilized - Meds Administered',
    'Ambulance En Route to Location',
    'Patient Transferred to ICU'
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title & Emergency Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-200 pb-4 bg-gradient-to-r from-rose-50 to-purple-50/40 p-5 rounded-3xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-rose-950 flex items-center gap-2.5">
            <AlertTriangle className="w-7 h-7 text-rose-600 animate-pulse" />
            <span>Emergency Alerts & SOS Desk</span>
          </h1>
          <p className="text-xs text-rose-800 font-medium mt-1">
            Real-time critical patient SOS signals, telemetry monitor alerts & immediate response dispatch
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="btn btn-danger btn-sm">
            <Bell className="w-4 h-4 animate-bounce" />
            <span>{activeAlertsCount} Active SOS Alert{activeAlertsCount === 1 ? '' : 's'}</span>
          </span>

          <button
            onClick={toggleAudioMute}
            className={`btn btn-sm ${isMuted ? 'btn-secondary' : 'btn-danger'}`}
            title={isMuted ? 'Unmute SOS Siren' : 'Mute SOS Siren'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-white" />}
            <span>{isMuted ? 'Alarm Muted' : 'Siren Active'}</span>
          </button>

          <button
            onClick={triggerAudioTest}
            className="btn btn-outline btn-sm"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isPlayingAudio ? 'Stop Sound' : 'Test Sound'}</span>
          </button>

          {activeAlertsCount > 0 && (
            <button
              onClick={() => setSelectedMapAlert(emergencyAlerts[0])}
              className="btn btn-primary btn-sm"
              title="Open Multi-Patient GPS Map Radar"
            >
              <Navigation className="w-3.5 h-3.5 text-white" />
              <span>GPS Radar ({activeAlertsCount})</span>
            </button>
          )}

          <button
            onClick={() => setShowBroadcastModal(true)}
            className="btn btn-danger btn-sm"
            title="Dispatch Live Web Push & Twilio SMS SOS Alert to connected phone and laptop"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            <span>Dispatch SOS Push</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Filter Alerts:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveFilter('All')}
            className={`btn btn-sm ${activeFilter === 'All' ? 'btn-primary' : 'btn-outline'}`}
          >
            <span>All Alerts</span>
            <span className="badge badge-primary ml-1">{emergencyAlerts.length}</span>
          </button>

          <button
            onClick={() => setActiveFilter('Critical')}
            className={`btn btn-sm ${activeFilter === 'Critical' ? 'btn-danger' : 'btn-outline'}`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Critical</span>
            <span className="badge bg-rose-100 text-rose-800 ml-1">{criticalCount}</span>
          </button>

          <button
            onClick={() => setActiveFilter('Pending')}
            className={`btn btn-sm ${activeFilter === 'Pending' ? 'btn-primary' : 'btn-outline'}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
            <span className="badge bg-amber-100 text-amber-800 ml-1">{pendingCount}</span>
          </button>
        </div>
      </div>

      {/* Emergency Cards Feed */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert, index) => {
            const matchedPatient = patients.find(p => p.id === alert.patientId) || {
              id: alert.patientId || 'PX-10482',
              name: alert.patientName || 'Rajesh Kumar',
              age: alert.age || 64,
              gender: alert.gender || 'Male',
              bloodGroup: alert.bloodGroup || 'O-',
              phone: alert.phone || '+91 98112 34567',
              photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80'
            };

            const alertElapsedSec = elapsedSeconds + (index + 1) * 145;

            return (
              <div
                key={alert.id}
                className="job-card border-2 border-rose-300 bg-gradient-to-r from-rose-50/80 via-white to-white space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center text-xl font-black shadow-sm animate-pulse flex-shrink-0">
                      🚨
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-base text-rose-950">{alert.alertType}</span>
                        <span className="badge bg-rose-600 text-white uppercase">
                          {alert.status || 'SOS ACTIVE'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-rose-700 font-medium mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Triggered: {alert.time}</span>
                        </span>
                        <span>•</span>
                        <span>Alert ID: <strong className="font-mono">{alert.id}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    <div className="bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-700 animate-spin" />
                      <span>Active for <strong className="font-mono text-amber-950">{formatElapsedTime(alertElapsedSec)}</strong></span>
                    </div>

                    <span className="badge bg-rose-100 text-rose-800 font-extrabold border border-rose-300">
                      {alert.vitalSeverity || 'Critical High Risk'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Patient Details</span>
                    <strong className="text-slate-900 text-sm font-extrabold block">{alert.patientName || matchedPatient.name}</strong>
                    <div className="text-slate-600 font-medium space-y-0.5">
                      <p>Age & Gender: <strong>{alert.age || matchedPatient.age} Yrs ({matchedPatient.gender})</strong></p>
                      <p>Blood Group: <strong className="text-rose-700 font-bold">{alert.bloodGroup || matchedPatient.bloodGroup}</strong></p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Recorded Vitals at SOS</span>
                    <strong className="text-slate-900 font-mono font-bold text-xs text-rose-950 block">
                      {alert.vitalsAtAlert || 'BP: 88/56 mmHg | HR: 118 BPM | SpO2: 91%'}
                    </strong>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded border border-rose-200">
                        BP: 88/56 Low
                      </span>
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded border border-rose-200">
                        HR: 118 High
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Telemetry Location</span>
                    <div className="text-slate-800 font-semibold flex items-start gap-1.5 pt-0.5">
                      <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5 animate-bounce" />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{alert.location || 'Emergency Room 2'}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{alert.coordinates || '28.6139° N, 77.2090° E'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => onViewPatient && onViewPatient(matchedPatient)}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    <User className="w-4 h-4 text-white" />
                    <span>View Patient Profile</span>
                  </button>

                  <button
                    onClick={() => setSelectedMapAlert(alert)}
                    className="btn btn-outline btn-sm flex-1"
                  >
                    <Navigation className="w-4 h-4 text-purple-600" />
                    <span>View Real GPS Location</span>
                  </button>

                  <button
                    onClick={() => onCallPatient ? onCallPatient(matchedPatient) : window.open(`tel:${matchedPatient.phone || alert.phone || '+919811234567'}`)}
                    className="btn btn-success btn-sm flex-1"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Patient SOS</span>
                  </button>

                  <button
                    onClick={() => handleOpenAckModal(alert)}
                    className="btn btn-danger btn-sm flex-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Acknowledge SOS</span>
                  </button>
                </div>

              </div>
            );
          })
        ) : (
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                {activeFilter === 'All' ? 'All Emergency SOS Clear' : `No ${activeFilter} Emergency Alerts`}
              </h3>
              <p className="text-xs text-slate-500">
                {activeFilter === 'All'
                  ? 'There are currently no active patient emergency alerts requiring physician dispatch.'
                  : `There are currently no active emergency alerts matching the "${activeFilter}" filter.`}
              </p>
            </div>
            {activeFilter !== 'All' && (
              <button
                onClick={() => setActiveFilter('All')}
                className="btn btn-primary btn-sm inline-block"
              >
                Reset Filter to All
              </button>
            )}
          </div>
        )}
      </div>

      {/* RESOLUTION NOTES MODAL */}
      {ackModalAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-purple-100 overflow-hidden">
            
            <div className="bg-gradient-to-r from-purple-800 to-rose-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">Acknowledge SOS Alert</h3>
                  <p className="text-xs text-purple-100 font-medium">Record dispatch action & resolution notes</p>
                </div>
              </div>
              <button
                onClick={() => setAckModalAlert(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-rose-950 text-sm">{ackModalAlert.alertType}</span>
                  <span className="badge bg-rose-600 text-white">
                    {ackModalAlert.id}
                  </span>
                </div>
                <p className="text-rose-800 font-medium">
                  Patient: <strong>{ackModalAlert.patientName}</strong> • Location: <strong>{ackModalAlert.location}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <label className="form-label uppercase">Quick Dispatch Status</label>
                <div className="flex flex-wrap gap-2">
                  {presetNotes.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDispatchStatus(preset)}
                      className={`btn btn-sm ${dispatchStatus === preset ? 'btn-primary' : 'btn-outline'}`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="form-label">Additional Resolution Notes (Optional)</label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Oxygen administered by Nurse Priya. Dr. Vance proceeding to ER."
                  className="form-control"
                />
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAckModalAlert(null)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAck}
                className="btn btn-primary btn-sm"
              >
                <Send className="w-4 h-4" />
                <span>Confirm Acknowledgement</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {selectedMapAlert && (
        <RealGpsMapModal
          alert={selectedMapAlert}
          alerts={emergencyAlerts}
          patient={matchedPatientForMap}
          patients={patients}
          onClose={() => setSelectedMapAlert(null)}
        />
      )}

    </div>
  );
}
