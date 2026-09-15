import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldCheck, Stethoscope } from 'lucide-react';
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

export function DoctorWorkspace() {
  const { user, profile, role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'workstation'; // 'workstation' | 'patients' | 'reports' | 'appointments' | 'availability' | 'emergency'
  const setActiveTab = (tab) => setSearchParams({ tab });

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
