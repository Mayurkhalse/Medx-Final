import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldCheck, FlaskConical, AlertCircle } from 'lucide-react';

export function LabWorkspace() {
  const { user, profile, role } = useAuth();

  return (
    <div className="medx-container">
      <div className="medx-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              backgroundColor: '#FFF7ED',
              color: '#C2410C',
              padding: '0.75rem',
              borderRadius: 'var(--medx-radius-md)'
            }}>
              <FlaskConical size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--medx-navy)' }}>
                Diagnostic Laboratory Workspace
              </h1>
              <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem' }}>
                Diagnostic Test Verification & Lab Quality Sign-Off Boundary
              </p>
            </div>
          </div>
          <span className="medx-badge medx-badge-lab" style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}>
            <ShieldCheck size={16} /> Verified Role: {role}
          </span>
        </div>

        <div style={{
          backgroundColor: 'var(--medx-surface-muted)',
          padding: '1.25rem',
          borderRadius: 'var(--medx-radius-md)',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem' }}>Laboratory Specialist Identity:</h3>
          <ul style={{ listStyle: 'none', fontSize: '0.875rem', color: 'var(--medx-text-secondary)' }}>
            <li><strong>Canonical User ID:</strong> {user?.id}</li>
            <li><strong>Specialist Name:</strong> {user?.name}</li>
            <li><strong>Email:</strong> {user?.email}</li>
            <li><strong>Laboratory Name:</strong> {profile?.labName || 'Central Diagnostic Lab'}</li>
            <li><strong>Accreditation:</strong> {profile?.accreditation || 'NABL Accredited'}</li>
            <li><strong>Legacy Lab ID:</strong> {profile?.legacyId || 'LAB-Auto'}</li>
          </ul>
        </div>

        <div style={{
          borderLeft: '4px solid #C2410C',
          backgroundColor: '#FFF7ED',
          padding: '1rem 1.25rem',
          borderRadius: '0 var(--medx-radius-md) var(--medx-radius-md) 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <AlertCircle size={18} color="#C2410C" />
            <strong style={{ color: '#C2410C', fontSize: '0.875rem' }}>Phase 1D Foundation Verified</strong>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)' }}>
            Lab admin authentication and RBAC boundary are active. Diagnostic report ingestion, biomarker parameter verification, and digital sign-off tools will be migrated in subsequent controlled phases.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LabWorkspace;
