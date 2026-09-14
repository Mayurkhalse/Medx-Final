import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import DoctorHome from './components/DoctorHome';
import MyPatients from './components/MyPatients';
import AppointmentsView from './components/AppointmentsView';
import EmergencyView from './components/EmergencyView';
import MessagesView from './components/MessagesView';
import AvailabilityView from './components/AvailabilityView';
import ProfileView from './components/ProfileView';
import PatientProfileModal from './components/PatientProfileModal';
import StartConsultationModal from './components/StartConsultationModal';
import LabReportModal from './components/LabReportModal';
import PrescriptionSlipModal from './components/PrescriptionSlipModal';
import ActivePhoneCallModal from './components/ActivePhoneCallModal';
import Toast from './components/Toast';

import {
  initialDoctorProfile,
  initialPatients,
  initialAppointments,
  initialEmergencyAlerts,
  initialMessages,
  initialNeedsAttention,
  initialPatientQueue,
  initialEmergencyWorkflowData,
  initialRecentActivity,
  initialMyDaySchedule
} from './data/mockData';
import {
  initNotificationService,
  requestPushNotificationPermission,
  sendWebPushNotification,
  dispatchGatewaySmsAlert,
  executeEmergencyBroadcast
} from './services/notificationService';
import {
  apiGetDoctorProfile,
  apiUpdateDoctorProfile,
  apiUpdateAvailability,
  apiGetPatients,
  apiCreatePatient,
  apiDeletePatient,
  apiAddPrescription,
  apiAddClinicalNote,
  apiAddFollowup,
  apiGetAppointments,
  apiUpdateAppointment,
  apiGetEmergencyAlerts,
  apiCreateEmergencyAlert,
  apiAcknowledgeEmergencyAlert,
  apiGetEmergencyWorkflow,
  apiUpdateEmergencyWorkflow,
  apiGetMessages,
  apiSendMessage
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data states
  const [doctorProfile, setDoctorProfile] = useState(initialDoctorProfile);
  const [patients, setPatients] = useState(() => {
    try {
      const saved = localStorage.getItem('medx_patients');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('localStorage read error:', e);
    }
    return initialPatients;
  });
  const [appointments, setAppointments] = useState(initialAppointments);
  const [emergencyAlerts, setEmergencyAlerts] = useState(initialEmergencyAlerts);
  const [messages, setMessages] = useState(initialMessages);

  // Fetch persistent data from Express/MongoDB Atlas on mount
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const [docProf, pts, appts, emgAlerts, msgs, emgWf] = await Promise.allSettled([
          apiGetDoctorProfile(),
          apiGetPatients(),
          apiGetAppointments(),
          apiGetEmergencyAlerts(),
          apiGetMessages(),
          apiGetEmergencyWorkflow()
        ]);

        if (docProf.status === 'fulfilled' && docProf.value) setDoctorProfile(docProf.value);
        if (pts.status === 'fulfilled' && Array.isArray(pts.value) && pts.value.length > 0) setPatients(pts.value);
        if (appts.status === 'fulfilled' && Array.isArray(appts.value) && appts.value.length > 0) setAppointments(appts.value);
        if (emgAlerts.status === 'fulfilled' && Array.isArray(emgAlerts.value)) setEmergencyAlerts(emgAlerts.value);
        if (msgs.status === 'fulfilled' && Array.isArray(msgs.value) && msgs.value.length > 0) setMessages(msgs.value);
        if (emgWf.status === 'fulfilled' && emgWf.value) setEmergencyWorkflow(emgWf.value);
      } catch (err) {
        console.warn('Backend initial data load fallback:', err.message);
      }
    };
    loadBackendData();
  }, []);

  // Sync patients to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('medx_patients', JSON.stringify(patients));
    } catch (e) {
      console.warn('localStorage write error:', e);
    }
  }, [patients]);

  const handleAddPatient = async (newPatient) => {
    setPatients(prev => [newPatient, ...prev]);
    showToast(`Patient ${newPatient.name} (${newPatient.id}) enrolled successfully!`, 'success');
    try {
      await apiCreatePatient(newPatient);
    } catch (e) {
      console.warn('Backend sync error for createPatient:', e.message);
    }
  };

  const handleDeletePatient = async (patientId) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
    if (selectedPatientForProfile && selectedPatientForProfile.id === patientId) {
      setSelectedPatientForProfile(null);
    }
    showToast('Patient record deleted permanently.', 'warning');
    try {
      await apiDeletePatient(patientId);
    } catch (e) {
      console.warn('Backend sync error for deletePatient:', e.message);
    }
  };

  // Enhancement data states
  const [needsAttention, setNeedsAttention] = useState(initialNeedsAttention);
  const [patientQueue, setPatientQueue] = useState(initialPatientQueue);
  const [emergencyWorkflow, setEmergencyWorkflow] = useState(initialEmergencyWorkflowData);
  const [recentActivity, setRecentActivity] = useState(initialRecentActivity);
  const [myDaySchedule, setMyDaySchedule] = useState(initialMyDaySchedule);

  // Modal active states
  const [selectedPatientForProfile, setSelectedPatientForProfile] = useState(null);
  const [selectedConsultationAppointment, setSelectedConsultationAppointment] = useState(null);
  const [selectedLabReport, setSelectedLabReport] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [activePhoneCall, setActivePhoneCall] = useState(null);

  const handleCallPatient = (callTarget) => {
    if (!callTarget) return;
    const name = callTarget.name || callTarget.patientName || 'Patient';
    const phone = callTarget.phone || callTarget.emergencyPhone || '+91 98112 34567';
    const photo = callTarget.photo;
    const age = callTarget.age;
    const bloodGroup = callTarget.bloodGroup;

    setActivePhoneCall({ name, phone, photo, age, bloodGroup });
    showToast(`Initiating cellular HD phone call to ${name} (${phone})...`, 'info');
    try {
      window.location.href = `tel:${phone}`;
    } catch (e) {
      console.warn('tel protocol trigger:', e);
    }
  };

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Global Audio & Web Notification State
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const audioRef = useRef(null);

  const activeEmergencyCount = emergencyAlerts.length;

  // Initialize Service Worker and global tab switcher on mount
  useEffect(() => {
    initNotificationService();
    if (typeof window !== 'undefined') {
      window.setActiveTabGlobal = setActiveTab;
    }
  }, []);

  // Request browser notification permission
  const requestDeviceNotificationPermission = async () => {
    const permission = await requestPushNotificationPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      showToast('Live Web Push & Device notifications enabled for critical SOS alerts!', 'success');
    } else if (permission === 'denied') {
      showToast('Notification permission denied by browser settings.', 'warning');
    } else {
      showToast('Web Notifications API not supported on this browser.', 'warning');
    }
  };

  // Dispatch Emergency SOS Alert across Web Push, SMS Gateway & Alarm
  const handleTriggerEmergencySOS = async (customAlert = null, recipientPhone = '+91 98112 34567', gatewayConfig = {}) => {
    const alertToDispatch = customAlert || {
      id: `SOS-${Math.floor(100 + Math.random() * 900)}`,
      patientId: 'PX-10482',
      patientName: 'Rajesh Kumar',
      age: 64,
      alertType: 'Critical Arrhythmia & HR Spikes (142 BPM)',
      vitalSeverity: 'Critical High Risk',
      vitalsAtAlert: 'BP: 88/54 mmHg | HR: 142 BPM | SpO2: 89%',
      location: 'Emergency Bay ER-2',
      coordinates: '28.6139° N, 77.2090° E',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'SOS ACTIVE'
    };

    setEmergencyAlerts(prev => [alertToDispatch, ...prev.filter(a => a.id !== alertToDispatch.id)]);
    setIsMuted(false);

    try {
      await apiCreateEmergencyAlert(alertToDispatch);
    } catch (e) {
      console.warn('Backend sync failed for emergency alert:', e.message);
    }

    const result = await executeEmergencyBroadcast(alertToDispatch, recipientPhone, gatewayConfig);

    showToast(
      `🚨 LIVE SOS BROADCAST DISPATCHED! Web Push (${result.webPushResult.method || 'Sent'}) & SMS (${result.smsResult.status || 'Delivered'}) sent to connected phone & laptop.`,
      'error'
    );

    return result;
  };

  // Global Emergency SOS Audio Manager
  useEffect(() => {
    if (activeEmergencyCount > 0 && !isMuted) {
      if (!audioRef.current) {
        try {
          audioRef.current = new Audio('/sos-alarm.mp3');
          audioRef.current.loop = true;
        } catch (err) {
          console.error('Failed to create global Audio instance:', err);
          setAudioError(true);
        }
      }

      if (audioRef.current) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlayingAudio(true);
              setAudioError(false);
            })
            .catch(err => {
              console.warn('Global SOS audio autoplay blocked by browser:', err);
              setIsPlayingAudio(false);
              setAudioError(true);
            });
        }
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlayingAudio(false);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlayingAudio(false);
      }
    };
  }, [activeEmergencyCount, isMuted]);

  // Fire Web System Notification when active emergency alerts exist
  useEffect(() => {
    if (activeEmergencyCount > 0 && notificationPermission === 'granted') {
      const latestAlert = emergencyAlerts[0];
      if (latestAlert) {
        try {
          const matchedPatient = patients.find(p => p.id === latestAlert.patientId);
          const notification = new Notification(`🚨 CRITICAL EMERGENCY SOS: ${latestAlert.patientName}`, {
            body: `Alert: ${latestAlert.alertType}\nLocation: ${latestAlert.location}\nVitals: ${latestAlert.vitalsAtAlert}`,
            icon: matchedPatient?.photo || '/favicon.svg',
            tag: `sos-${latestAlert.id}`,
            requireInteraction: true
          });

          notification.onclick = () => {
            window.focus();
            setActiveTab('emergency');
          };
        } catch (e) {
          console.warn('System notification launch error:', e);
        }
      }
    }
  }, [activeEmergencyCount, notificationPermission]);

  // Global Audio Mute / Unmute Toggle
  const toggleAudioMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (activeEmergencyCount > 0 && audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsPlayingAudio(true);
            setAudioError(false);
          })
          .catch(err => {
            console.warn('Manual audio play failed:', err);
            setAudioError(true);
          });
      }
    } else {
      setIsMuted(true);
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      }
    }
  };

  // Global Test Audio Trigger
  const triggerAudioTest = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sos-alarm.mp3');
      audioRef.current.loop = true;
    }
    if (isPlayingAudio) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    } else {
      setIsMuted(false);
      audioRef.current.play()
        .then(() => {
          setIsPlayingAudio(true);
          setAudioError(false);
        })
        .catch(err => {
          console.warn('Audio test failed:', err);
          setAudioError(true);
        });
    }
  };

  // Dynamic summary stats calculation
  const summaryStats = {
    patientsToday: 18,
    waiting: 4,
    completed: 11,
    reportsPending: 3,
    followupsDue: 7,
    unreadMessages: messages.reduce((acc, m) => acc + (m.unreadCount || 0), 0),
    todaysAppointments: appointments.filter(a => a.date === '2026-08-25').length,
    totalPatients: patients.length,
    pendingAppointments: appointments.filter(a => a.status === 'Pending').length,
    emergencyAlerts: emergencyAlerts.length
  };

  // HANDLERS
  const handleViewPatient = (patient) => {
    const freshPatient = patients.find(p => p.id === patient.id) || patient;
    setSelectedPatientForProfile(freshPatient);
  };

  const handleStartConsultation = (appointment, patient) => {
    setSelectedConsultationAppointment({
      appointment: appointment || {
        id: `APT-${Math.floor(100 + Math.random() * 900)}`,
        patientId: patient.id,
        patientName: patient.name,
        age: patient.age,
        gender: patient.gender,
        reason: patient.currentCondition,
        mode: 'In-person'
      },
      patient: patient || patients.find(p => p.id === appointment?.patientId)
    });
  };

  const handleCompleteConsultation = async ({ appointmentId, patientId, diagnosis, notes }) => {
    setAppointments(prev =>
      prev.map(apt => apt.id === appointmentId ? { ...apt, status: 'Completed' } : apt)
    );

    if (notes) {
      const now = new Date();
      const noteData = {
        id: `CN-${Math.floor(100 + Math.random() * 900)}`,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        doctor: doctorProfile.name,
        note: `Consultation (${diagnosis || 'Routine'}): ${notes}`
      };

      setPatients(prev =>
        prev.map(p => p.id === patientId ? { ...p, clinicalNotes: [noteData, ...(p.clinicalNotes || [])] } : p)
      );

      try {
        await apiAddClinicalNote(patientId, noteData);
      } catch (e) {
        console.warn('Backend sync failed for clinical note:', e.message);
      }
    }

    try {
      await apiUpdateAppointment(appointmentId, { status: 'Completed' });
    } catch (e) {
      console.warn('Backend sync failed for completed appointment:', e.message);
    }

    setSelectedConsultationAppointment(null);
    showToast('Consultation completed successfully & clinical note logged!');
  };

  const handleSavePrescription = async (patientId, rxData) => {
    setPatients(prev =>
      prev.map(p => {
        if (p.id === patientId) {
          const updatedPrescriptions = [rxData, ...(p.prescriptions || [])];
          const newMedList = rxData.medicines.map((m, idx) => ({
            id: `MED-NEW-${idx}`,
            name: m.name,
            dosage: m.dosage,
            frequency: m.frequency,
            route: 'Oral',
            startDate: rxData.date,
            endDate: 'Ongoing',
            prescribingDoctor: rxData.doctor,
            instructions: m.instructions
          }));

          return {
            ...p,
            prescriptions: updatedPrescriptions,
            currentMedications: [...newMedList, ...(p.currentMedications || [])]
          };
        }
        return p;
      })
    );

    if (selectedPatientForProfile && selectedPatientForProfile.id === patientId) {
      setSelectedPatientForProfile(prev => ({
        ...prev,
        prescriptions: [rxData, ...(prev.prescriptions || [])]
      }));
    }

    try {
      await apiAddPrescription(patientId, rxData);
    } catch (e) {
      console.warn('Backend sync failed for prescription:', e.message);
    }

    showToast(`Prescription #${rxData.id} saved & added to patient records!`);
  };

  const handleSaveClinicalNote = async (patientId, noteData) => {
    setPatients(prev =>
      prev.map(p => p.id === patientId ? { ...p, clinicalNotes: [noteData, ...(p.clinicalNotes || [])] } : p)
    );

    if (selectedPatientForProfile && selectedPatientForProfile.id === patientId) {
      setSelectedPatientForProfile(prev => ({
        ...prev,
        clinicalNotes: [noteData, ...(prev.clinicalNotes || [])]
      }));
    }

    try {
      await apiAddClinicalNote(patientId, noteData);
    } catch (e) {
      console.warn('Backend sync failed for clinical note:', e.message);
    }

    showToast('Clinical note added to patient record!');
  };

  const handleSaveFollowup = async (patientId, followupData) => {
    setPatients(prev =>
      prev.map(p => p.id === patientId ? { ...p, followupPlan: [followupData, ...(p.followupPlan || [])] } : p)
    );

    if (selectedPatientForProfile && selectedPatientForProfile.id === patientId) {
      setSelectedPatientForProfile(prev => ({
        ...prev,
        followupPlan: [followupData, ...(prev.followupPlan || [])]
      }));
    }

    try {
      await apiAddFollowup(patientId, followupData);
    } catch (e) {
      console.warn('Backend sync failed for followup:', e.message);
    }

    showToast(`Follow-up scheduled for ${followupData.date}! Appears on Dashboard.`);
  };

  const handleRescheduleAppointment = async (appointmentId, newDate, newTime) => {
    setAppointments(prev =>
      prev.map(apt => apt.id === appointmentId ? { ...apt, date: newDate, time: newTime, status: 'Confirmed' } : apt)
    );
    showToast(`Appointment rescheduled to ${newDate} at ${newTime}`);
    try {
      await apiUpdateAppointment(appointmentId, { date: newDate, time: newTime, status: 'Confirmed' });
    } catch (e) {
      console.warn('Backend sync failed for reschedule:', e.message);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    setAppointments(prev =>
      prev.map(apt => apt.id === appointmentId ? { ...apt, status: 'Cancelled' } : apt)
    );
    showToast('Appointment cancelled.', 'warning');
    try {
      await apiUpdateAppointment(appointmentId, { status: 'Cancelled' });
    } catch (e) {
      console.warn('Backend sync failed for cancel appointment:', e.message);
    }
  };

  const handleAcceptAppointment = async (appointmentId) => {
    setAppointments(prev =>
      prev.map(apt => apt.id === appointmentId ? { ...apt, status: 'Confirmed' } : apt)
    );
    showToast('Appointment confirmed!');
    try {
      await apiUpdateAppointment(appointmentId, { status: 'Confirmed' });
    } catch (e) {
      console.warn('Backend sync failed for accept appointment:', e.message);
    }
  };

  const handleSendMessage = async (convId, text) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev =>
      prev.map(conv => {
        if (conv.id === convId) {
          return {
            ...conv,
            lastMessage: text,
            time: timeStr,
            unreadCount: 0,
            conversation: [
              ...conv.conversation,
              { sender: 'doctor', text, time: timeStr }
            ]
          };
        }
        return conv;
      })
    );

    showToast('Message sent to patient!');

    try {
      await apiSendMessage(convId, text);
    } catch (e) {
      console.warn('Backend sync failed for sendMessage:', e.message);
    }
  };

  const handleSaveAvailability = async (newAvailability) => {
    setDoctorProfile(prev => ({ ...prev, availability: newAvailability }));
    showToast('Doctor availability & slot timing saved!');
    try {
      await apiUpdateAvailability(newAvailability);
    } catch (e) {
      console.warn('Backend sync failed for availability:', e.message);
    }
  };

  const handleUpdateDoctorProfile = async (newProfile) => {
    setDoctorProfile(newProfile);
    showToast('Doctor profile updated successfully!');
    try {
      await apiUpdateDoctorProfile(newProfile);
    } catch (e) {
      console.warn('Backend sync failed for doctor profile:', e.message);
    }
  };

  const handleAcknowledgeEmergency = async (alertId) => {
    setEmergencyAlerts(prev => prev.filter(a => a.id !== alertId));
    showToast('Emergency SOS alert acknowledged & status updated!', 'warning');
    try {
      await apiAcknowledgeEmergencyAlert(alertId);
    } catch (e) {
      console.warn('Backend sync failed for acknowledge emergency:', e.message);
    }
  };

  const handleDownloadReport = (report) => {
    const element = document.createElement('a');
    const file = new Blob([`MEDX PATHOLOGY REPORT\n\nReport: ${report.name}\nDate: ${report.date}\nDoctor: ${report.doctor}\nStatus: ${report.status}\nDetails: ${report.details}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showToast(`Downloaded report file: ${report.name}`);
  };

  const handleQuickAction = (actionType) => {
    if (actionType === 'consultation') {
      const firstPatient = patients[0];
      handleStartConsultation(null, firstPatient);
    } else if (actionType === 'prescription') {
      const firstPatient = patients[0];
      handleViewPatient(firstPatient);
    } else if (actionType === 'lab') {
      showToast('Lab test order form opened for patient');
    }
  };

  const handleCallResponder = (responder) => {
    showToast(`Connecting direct line to ${responder.name} (${responder.phone})...`, 'info');
    window.open(`tel:${responder.phone}`);
  };

  const handleMessageResponder = (responder) => {
    showToast(`Opening clinical message thread with ${responder.name}...`, 'info');
    setActiveTab('messages');
  };

  return (
    <div className="min-h-screen font-sans flex flex-col antialiased selection:bg-purple-600 selection:text-white">
      
      {/* Sticky Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        doctorProfile={doctorProfile}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        unreadMessagesCount={summaryStats.unreadMessages}
        emergencyCount={summaryStats.emergencyAlerts}
        onOpenGlobalSearch={() => setActiveTab('patients')}
        isMuted={isMuted}
        isPlayingAudio={isPlayingAudio}
        onToggleAudioMute={toggleAudioMute}
        notificationPermission={notificationPermission}
        onRequestNotificationPermission={requestDeviceNotificationPermission}
      />

      {/* Main Page Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: HOME / DASHBOARD */}
        {activeTab === 'home' && (
          <DoctorHome
            doctorProfile={doctorProfile}
            summaryStats={summaryStats}
            appointments={appointments}
            patients={patients}
            emergencyAlerts={emergencyAlerts}
            needsAttention={needsAttention}
            patientQueue={patientQueue}
            emergencyWorkflow={emergencyWorkflow}
            recentActivity={recentActivity}
            myDaySchedule={myDaySchedule}
            onNavigateTab={setActiveTab}
            onViewPatient={handleViewPatient}
            onStartConsultation={(apt, pat) => handleStartConsultation(apt, pat)}
            onUpdateEmergencyWorkflow={setEmergencyWorkflow}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onQuickAction={handleQuickAction}
            onCallResponder={handleCallResponder}
            onMessageResponder={handleMessageResponder}
          />
        )}

        {/* VIEW 2: MY PATIENTS */}
        {activeTab === 'patients' && (
          <MyPatients
            patients={patients}
            onViewPatient={handleViewPatient}
            onMessagePatient={(p) => {
              const conv = messages.find(m => m.patientId === p.id);
              if (conv) setActiveTab('messages');
              else handleViewPatient(p);
            }}
            onViewMedicalHistory={(p) => handleViewPatient(p)}
            onStartConsultation={(apt, pat) => handleStartConsultation(apt, pat)}
            onCallPatient={handleCallPatient}
            onAddPatient={handleAddPatient}
            onDeletePatient={handleDeletePatient}
          />
        )}

        {/* VIEW 3: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <AppointmentsView
            appointments={appointments}
            patients={patients}
            onViewPatient={handleViewPatient}
            onStartConsultation={(apt, pat) => handleStartConsultation(apt, pat)}
            onRescheduleAppointment={handleRescheduleAppointment}
            onCancelAppointment={handleCancelAppointment}
            onAcceptAppointment={handleAcceptAppointment}
            onCallPatient={handleCallPatient}
          />
        )}

        {/* VIEW 4: MEDICAL RECORDS */}
        {activeTab === 'records' && (
          <MyPatients
            patients={patients}
            onViewPatient={handleViewPatient}
            onMessagePatient={(p) => setActiveTab('messages')}
            onViewMedicalHistory={(p) => handleViewPatient(p)}
            onStartConsultation={(apt, pat) => handleStartConsultation(apt, pat)}
            onCallPatient={handleCallPatient}
            onAddPatient={handleAddPatient}
            onDeletePatient={handleDeletePatient}
          />
        )}

        {/* VIEW 5: MESSAGES */}
        {activeTab === 'messages' && (
          <MessagesView
            messages={messages}
            patients={patients}
            onSendMessage={handleSendMessage}
            onViewPatient={handleViewPatient}
          />
        )}

        {/* VIEW 6: EMERGENCY ALERTS */}
        {activeTab === 'emergency' && (
          <EmergencyView
            emergencyAlerts={emergencyAlerts}
            patients={patients}
            onViewPatient={handleViewPatient}
            onAcknowledgeEmergency={handleAcknowledgeEmergency}
            isMuted={isMuted}
            isPlayingAudio={isPlayingAudio}
            onToggleAudioMute={toggleAudioMute}
            onTriggerAudioTest={triggerAudioTest}
            onCallPatient={handleCallPatient}
            onStartConsultation={(apt, pat) => handleStartConsultation(apt, pat)}
            notificationPermission={notificationPermission}
            onRequestNotificationPermission={requestDeviceNotificationPermission}
            onTriggerEmergencySOS={handleTriggerEmergencySOS}
          />
        )}

        {/* VIEW 7: AVAILABILITY */}
        {activeTab === 'availability' && (
          <AvailabilityView
            doctorProfile={doctorProfile}
            onSaveAvailability={handleSaveAvailability}
          />
        )}

        {/* VIEW 8: DOCTOR PROFILE */}
        {activeTab === 'profile' && (
          <ProfileView
            doctorProfile={doctorProfile}
            onUpdateDoctorProfile={handleUpdateDoctorProfile}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-purple-100/80 py-8 mt-16 text-center text-xs text-slate-600 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm">Med<span className="text-purple-600">X</span> Clinical</span>
            <span className="text-slate-400">|</span>
            <p>© 2026 MedX Clinical Technologies. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-4 font-medium text-slate-500">
            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-[11px] font-semibold border border-purple-200">
              Strictly Confidential Clinical Workstation
            </span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {selectedPatientForProfile && (
        <PatientProfileModal
          patient={selectedPatientForProfile}
          doctorProfile={doctorProfile}
          onClose={() => setSelectedPatientForProfile(null)}
          onSavePrescription={handleSavePrescription}
          onSaveClinicalNote={handleSaveClinicalNote}
          onSaveFollowup={handleSaveFollowup}
          onViewLabReport={(report) => setSelectedLabReport({ report, patient: selectedPatientForProfile })}
          onViewPrescription={(rx) => setSelectedPrescription({ prescription: rx, patient: selectedPatientForProfile })}
          onDownloadReport={handleDownloadReport}
          onStartConsultation={(apt) => handleStartConsultation(apt, selectedPatientForProfile)}
          onCallPatient={handleCallPatient}
        />
      )}

      {selectedConsultationAppointment && (
        <StartConsultationModal
          appointment={selectedConsultationAppointment.appointment}
          patient={selectedConsultationAppointment.patient}
          onClose={() => setSelectedConsultationAppointment(null)}
          onComplete={handleCompleteConsultation}
        />
      )}

      {activePhoneCall && (
        <ActivePhoneCallModal
          callData={activePhoneCall}
          onClose={() => setActivePhoneCall(null)}
        />
      )}

      {selectedLabReport && (
        <LabReportModal
          report={selectedLabReport.report}
          patient={selectedLabReport.patient}
          onClose={() => setSelectedLabReport(null)}
          onDownload={handleDownloadReport}
        />
      )}

      {selectedPrescription && (
        <PrescriptionSlipModal
          prescription={selectedPrescription.prescription}
          patient={selectedPrescription.patient}
          doctorProfile={doctorProfile}
          onClose={() => setSelectedPrescription(null)}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
