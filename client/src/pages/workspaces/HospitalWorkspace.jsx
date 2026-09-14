import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldCheck, Building2, AlertCircle } from 'lucide-react';

export function HospitalWorkspace() {
  const { user, profile, role } = useAuth();

  return (
    <div className="medx-container">
      <div className="medx-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              backgroundColor: '#FAF5FF',
              color: '#7E22CE',
              padding: '0.75rem',
              borderRadius: 'var(--medx-radius-md)'
            }}>
              <Building2 size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--medx-navy)' }}>
                Hospital Operations Center
              </h1>
              <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem' }}>
                Institutional Operations, Bed Management & Care Queue Boundary
              </p>
            </div>
          </div>
          <span className="medx-badge medx-badge-hospital" style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}>
            <ShieldCheck size={16} /> Verified Role: {role}
          </span>
        </div>

        <div style={{
          backgroundColor: 'var(--medx-surface-muted)',
          padding: '1.25rem',
          borderRadius: 'var(--medx-radius-md)',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem' }}>Hospital Administrator Identity:</h3>
          <ul style={{ listStyle: 'none', fontSize: '0.875rem', color: 'var(--medx-text-secondary)' }}>
            <li><strong>Canonical User ID:</strong> {user?.id}</li>
            <li><strong>Administrator Name:</strong> {user?.name}</li>
            <li><strong>Email:</strong> {user?.email}</li>
            <li><strong>Facility Name:</strong> {profile?.facilityName || 'Main Hospital'}</li>
            <li><strong>Total Capacity:</strong> {profile?.totalBeds || 100} beds ({profile?.icuBeds || 10} ICU)</li>
            <li><strong>Legacy Facility ID:</strong> {profile?.legacyId || 'HOSP-Auto'}</li>
          </ul>
        </div>

        <div style={{
          borderLeft: '4px solid #7E22CE',
          backgroundColor: '#FAF5FF',
          padding: '1rem 1.25rem',
          borderRadius: '0 var(--medx-radius-md) var(--medx-radius-md) 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <AlertCircle size={18} color="#7E22CE" />
            <strong style={{ color: '#7E22CE', fontSize: '0.875rem' }}>Phase 1D Foundation Verified</strong>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)' }}>
            Hospital admin authentication and RBAC boundary are active. 6-stage clinical care queue, bed occupancy management, doctor roster assignment, and Ant Design scoped components will be migrated in subsequent controlled phases.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HospitalWorkspace;
