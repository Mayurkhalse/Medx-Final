import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldCheck, User, Activity, AlertCircle } from 'lucide-react';

export function PatientWorkspace() {
  const { user, profile, role } = useAuth();

  return (
    <div className="medx-container">
      <div className="medx-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              padding: '0.75rem',
              borderRadius: 'var(--medx-radius-md)'
            }}>
              <User size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--medx-navy)' }}>
                Patient Workspace
              </h1>
              <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem' }}>
                Secure Patient Portal & Biomarker Analytics Boundary
              </p>
            </div>
          </div>
          <span className="medx-badge medx-badge-patient" style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}>
            <ShieldCheck size={16} /> Verified Role: {role}
          </span>
        </div>

        <div style={{
          backgroundColor: 'var(--medx-surface-muted)',
          padding: '1.25rem',
          borderRadius: 'var(--medx-radius-md)',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem' }}>Active Session Identity:</h3>
          <ul style={{ listStyle: 'none', fontSize: '0.875rem', color: 'var(--medx-text-secondary)' }}>
            <li><strong>Canonical User ID:</strong> {user?.id}</li>
            <li><strong>Full Name:</strong> {user?.name}</li>
            <li><strong>Email:</strong> {user?.email}</li>
            <li><strong>Linked Patient ID:</strong> {profile?._id || 'Registered'}</li>
            <li><strong>Legacy Patient Code:</strong> {profile?.legacyId || 'PAT-Auto'}</li>
          </ul>
        </div>

        <div style={{
          borderLeft: '4px solid var(--medx-primary)',
          backgroundColor: 'var(--medx-primary-light)',
          padding: '1rem 1.25rem',
          borderRadius: '0 var(--medx-radius-md) var(--medx-radius-md) 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <AlertCircle size={18} color="var(--medx-primary)" />
            <strong style={{ color: 'var(--medx-primary)', fontSize: '0.875rem' }}>Phase 1D Foundation Verified</strong>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)' }}>
            Route protection, RBAC enforcement, and canonical user-profile mapping are active. Diagnostic report upload, Recharts biomarker trendlines, and ML risk prediction UI will be migrated in subsequent controlled phases.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PatientWorkspace;
