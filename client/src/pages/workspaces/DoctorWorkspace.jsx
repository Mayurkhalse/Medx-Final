import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldCheck, Stethoscope, AlertCircle } from 'lucide-react';

export function DoctorWorkspace() {
  const { user, profile, role } = useAuth();

  return (
    <div className="medx-container">
      <div className="medx-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
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
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--medx-navy)' }}>
                Doctor Clinical Workstation
              </h1>
              <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem' }}>
                Attending Physician Workstation & Triage Command Boundary
              </p>
            </div>
          </div>
          <span className="medx-badge medx-badge-doctor" style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}>
            <ShieldCheck size={16} /> Verified Role: {role}
          </span>
        </div>

        <div style={{
          backgroundColor: 'var(--medx-surface-muted)',
          padding: '1.25rem',
          borderRadius: 'var(--medx-radius-md)',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem' }}>Clinician Profile Identity:</h3>
          <ul style={{ listStyle: 'none', fontSize: '0.875rem', color: 'var(--medx-text-secondary)' }}>
            <li><strong>Canonical User ID:</strong> {user?.id}</li>
            <li><strong>Doctor Name:</strong> Dr. {user?.name}</li>
            <li><strong>Email:</strong> {user?.email}</li>
            <li><strong>Specialty:</strong> {profile?.specialty || 'General Physician'}</li>
            <li><strong>Legacy Doctor ID:</strong> {profile?.legacyId || 'DOC-Auto'}</li>
          </ul>
        </div>

        <div style={{
          borderLeft: '4px solid #10B981',
          backgroundColor: '#ECFDF5',
          padding: '1rem 1.25rem',
          borderRadius: '0 var(--medx-radius-md) var(--medx-radius-md) 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <AlertCircle size={18} color="#15803D" />
            <strong style={{ color: '#15803D', fontSize: '0.875rem' }}>Phase 1D Foundation Verified</strong>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)' }}>
            Doctor authentication and RBAC boundary are active. Clinical triage queue, prescription authoring slip, and Leaflet GPS ambulance dispatch map will be migrated in subsequent controlled phases.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DoctorWorkspace;
