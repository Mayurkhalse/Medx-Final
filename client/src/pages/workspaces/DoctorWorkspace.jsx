import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  ShieldCheck, Stethoscope, Users, FileText, Activity,
  Clock, Pill, Phone, AlertTriangle
} from 'lucide-react';
import DoctorWorkstation from '../doctor/DoctorWorkstation.jsx';
import DoctorPatients from '../doctor/DoctorPatients.jsx';
import DoctorReports from '../doctor/DoctorReports.jsx';
import DoctorEmergency from '../doctor/DoctorEmergency.jsx';
import DoctorAppointments from '../doctor/DoctorAppointments.jsx';
import DoctorAvailability from '../doctor/DoctorAvailability.jsx';
import DoctorPatientModal from '../doctor/DoctorPatientModal.jsx';
import DoctorPrescriptionModal from '../doctor/DoctorPrescriptionModal.jsx';
import DoctorCallModal from '../doctor/DoctorCallModal.jsx';
import DoctorReportReviewModal from '../doctor/DoctorReportReviewModal.jsx';
import emergencyService from '../../services/emergencyService.js';
import { Calendar } from 'lucide-react';

export function DoctorWorkspace() {
  const { user, profile, role } = useAuth();
  const [activeTab, setActiveTab] = useState('workstation'); // 'workstation' | 'patients' | 'reports' | 'emergency'
  const [activeSosCount, setActiveSosCount] = useState(0);

  // Poll active emergency alerts count every 5s
  useEffect(() => {
    const pollSos = async () => {
      try {
        const res = await emergencyService.getActiveCount();
        if (res && typeof res.activeCount === 'number') {
          setActiveSosCount(res.activeCount);
        }
      } catch (err) {
        // quiet ignore for badge polling
      }
    };
    pollSos();
    const interval = setInterval(pollSos, 5000);
    return () => clearInterval(interval);
  }, []);

  // Modal states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptionPatient, setPrescriptionPatient] = useState(null);
  const [callPatient, setCallPatient] = useState(null);
  const [reviewingReport, setReviewingReport] = useState(null);

  return (
    <div className="medx-container" style={{ paddingBottom: '3rem' }}>
      {/* Clinician Identity Header */}
      <div className="medx-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              backgroundColor: '#F0FDF4',
              color: '#15803D',
              padding: '0.75rem',
              borderRadius: 'var(--medx-radius-md)'
            }}>
              <Stethoscope size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                Doctor Clinical Workstation
              </h1>
              <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                Attending Physician Command Center • Outpatient Triage, Dossier Review & Prescriptions
              </p>
            </div>
          </div>
          <span className="medx-badge medx-badge-doctor" style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}>
            <ShieldCheck size={16} /> Verified Role: {role}
          </span>
        </div>

        {/* Active Clinician Identity Strip */}
        <div style={{
          backgroundColor: 'var(--medx-surface-muted)',
          padding: '0.875rem 1.25rem',
          borderRadius: 'var(--medx-radius-md)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          fontSize: '0.8125rem',
          color: 'var(--medx-text-secondary)'
        }}>
          <div><strong>Clinician:</strong> Dr. {user?.name} ({user?.email})</div>
          <div><strong>Specialty:</strong> {profile?.specialty || 'Diagnostic Medicine & Cardiology'}</div>
          <div><strong>Legacy ID:</strong> {profile?.legacyId || 'DOC-001'}</div>
          <div><strong>Department:</strong> {profile?.department || 'Internal Medicine'}</div>
          <div><strong>Status:</strong> <span style={{ color: '#16A34A', fontWeight: 600 }}>Available on Duty</span></div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid #E2E8F0',
        marginBottom: '1.5rem',
        overflowX: 'auto'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('workstation')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: activeTab === 'workstation' ? '#15803D' : 'var(--medx-text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'workstation' ? '2px solid #15803D' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Activity size={18} />
          Clinical Workstation & Queue
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('patients')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: activeTab === 'patients' ? '#15803D' : 'var(--medx-text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'patients' ? '2px solid #15803D' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Users size={18} />
          Patient Roster
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: activeTab === 'reports' ? '#15803D' : 'var(--medx-text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'reports' ? '2px solid #15803D' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <FileText size={18} />
          Report Reviews
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appointments')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: activeTab === 'appointments' ? '#15803D' : 'var(--medx-text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'appointments' ? '2px solid #15803D' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Calendar size={18} />
          Appointments Workspace
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('availability')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: activeTab === 'availability' ? '#15803D' : 'var(--medx-text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'availability' ? '2px solid #15803D' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Clock size={18} />
          Schedule & Availability
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('emergency')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: activeTab === 'emergency' ? '#E11D48' : 'var(--medx-text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'emergency' ? '2px solid #E11D48' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <AlertTriangle size={18} />
          Emergency SOS Desk
          {activeSosCount > 0 && (
            <span style={{
              backgroundColor: '#E11D48',
              color: '#FFFFFF',
              borderRadius: '9999px',
              padding: '0.1rem 0.45rem',
              fontSize: '0.75rem',
              fontWeight: 800
            }}>
              {activeSosCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'workstation' && (
        <DoctorWorkstation
          onSelectPatient={(p) => setSelectedPatient(p)}
          onOpenCall={(p) => setCallPatient(p)}
          onOpenPrescription={(p) => setPrescriptionPatient(p)}
          onOpenReview={(r) => setReviewingReport(r)}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === 'patients' && (
        <DoctorPatients
          onSelectPatient={(p) => setSelectedPatient(p)}
          onOpenCall={(p) => setCallPatient(p)}
          onOpenPrescription={(p) => setPrescriptionPatient(p)}
        />
      )}

      {activeTab === 'appointments' && (
        <DoctorAppointments
          onSelectPatient={(p) => setSelectedPatient(p)}
          onOpenCall={(p) => setCallPatient(p)}
          onOpenPrescription={(p) => setPrescriptionPatient(p)}
        />
      )}

      {activeTab === 'availability' && (
        <DoctorAvailability />
      )}

      {activeTab === 'reports' && (
        <DoctorReports
          onOpenReview={(r) => setReviewingReport(r)}
        />
      )}

      {activeTab === 'emergency' && (
        <DoctorEmergency
          onSelectPatient={(p) => setSelectedPatient(p)}
          onOpenCall={(p) => setCallPatient(p)}
        />
      )}

      {/* MODALS */}
      {/* 1. Patient Full Dossier Modal */}
      {selectedPatient && (
        <DoctorPatientModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onRefresh={async () => {
            try {
              const res = await api.get(`/doctor/patients/${selectedPatient._id || selectedPatient.id}`);
              setSelectedPatient(res.data);
            } catch (err) {
              console.error('Failed to refresh dossier:', err);
            }
          }}
          onOpenPrescription={(p) => {
            setPrescriptionPatient(p);
          }}
          onOpenCall={(p) => {
            setCallPatient(p);
          }}
          onReviewReport={(r) => {
            setReviewingReport(r);
          }}
        />
      )}

      {/* 2. Digital Prescription Authoring Modal */}
      {prescriptionPatient && (
        <DoctorPrescriptionModal
          patient={prescriptionPatient}
          onClose={() => setPrescriptionPatient(null)}
          onSuccess={async () => {
            if (selectedPatient) {
              try {
                const res = await api.get(`/doctor/patients/${selectedPatient._id || selectedPatient.id}`);
                setSelectedPatient(res.data);
              } catch (err) {
                console.error(err);
              }
            }
          }}
        />
      )}

      {/* 3. Interactive Audio Consultation Call Modal */}
      {callPatient && (
        <DoctorCallModal
          patient={callPatient}
          onClose={() => setCallPatient(null)}
          onCallEnded={async () => {
            if (selectedPatient) {
              try {
                const res = await api.get(`/doctor/patients/${selectedPatient._id || selectedPatient.id}`);
                setSelectedPatient(res.data);
              } catch (err) {
                console.error(err);
              }
            }
          }}
        />
      )}

      {/* 4. Diagnostic Report Review Modal */}
      {reviewingReport && (
        <DoctorReportReviewModal
          report={reviewingReport}
          onClose={() => setReviewingReport(null)}
          onSuccess={async () => {
            if (selectedPatient) {
              try {
                const res = await api.get(`/doctor/patients/${selectedPatient._id || selectedPatient.id}`);
                setSelectedPatient(res.data);
              } catch (err) {
                console.error(err);
              }
            }
          }}
        />
      )}
    </div>
  );
}

export default DoctorWorkspace;
