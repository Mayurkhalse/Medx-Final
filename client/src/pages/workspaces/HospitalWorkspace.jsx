import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldCheck, Building2 } from 'lucide-react';
import HospitalDashboard from '../hospital/HospitalDashboard.jsx';
import HospitalCareQueue from '../hospital/HospitalCareQueue.jsx';
import HospitalBeds from '../hospital/HospitalBeds.jsx';
import HospitalPatients from '../hospital/HospitalPatients.jsx';
import HospitalDoctors from '../hospital/HospitalDoctors.jsx';
import HospitalEmergency from '../hospital/HospitalEmergency.jsx';
import HospitalDepartments from '../hospital/HospitalDepartments.jsx';
import HospitalProfile from '../hospital/HospitalProfile.jsx';

export function HospitalWorkspace() {
  const { user, profile, role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard'; // 'dashboard' | 'care-queue' | 'beds' | 'patients' | 'doctors' | 'departments' | 'profile-settings' | 'emergency'
  const setActiveTab = (tab) => setSearchParams({ tab });

  return (
    <div className="medx-container" style={{ padding: '1.75rem 1.5rem 3.5rem' }}>
      {/* Institutional Command Header Bar */}
      <div
        className="medx-card"
        style={{
          marginBottom: '1.75rem',
          padding: '1.25rem 1.5rem',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--medx-shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{
              backgroundColor: '#FAF5FF',
              color: '#7E22CE',
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #E9D5FF'
            }}>
              <Building2 size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#7E22CE',
                  backgroundColor: '#FAF5FF',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #E9D5FF'
                }}>
                  Operational Command Center
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  • Facility ID: {profile?.code || 'HOSP-MEDX-01'}
                </span>
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--medx-navy)', margin: 0 }}>
                {profile?.facilityName || 'Institutional Hospital Operations Center'}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Quick Facility Metric Strip */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              backgroundColor: 'var(--medx-surface-muted)',
              padding: '0.5rem 0.875rem',
              borderRadius: 'var(--medx-radius-md)',
              fontSize: '0.78125rem',
              border: '1px solid var(--medx-border)'
            }}>
              <div><strong>Admin:</strong> {user?.name?.split(' ')[0] || 'Administrator'}</div>
              <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--medx-border)' }} />
              <div><strong>Capacity:</strong> {profile?.totalBeds || 100} Beds ({profile?.icuBeds || 10} ICU)</div>
              <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--medx-border)' }} />
              <div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: '#15803D',
                  fontWeight: 700
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
                  Active Duty
                </span>
              </div>
            </div>

            <span className="medx-badge medx-badge-hospital" style={{ fontSize: '0.75rem', padding: '0.35rem 0.625rem' }}>
              <ShieldCheck size={14} /> {role}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Operational View */}
      {activeTab === 'dashboard' && <HospitalDashboard onNavigateTab={setActiveTab} />}
      {activeTab === 'care-queue' && <HospitalCareQueue />}
      {activeTab === 'beds' && <HospitalBeds />}
      {activeTab === 'patients' && <HospitalPatients />}
      {activeTab === 'doctors' && <HospitalDoctors />}
      {activeTab === 'departments' && <HospitalDepartments />}
      {activeTab === 'profile-settings' && <HospitalProfile />}
      {activeTab === 'emergency' && <HospitalEmergency />}
    </div>
  );
}

export default HospitalWorkspace;
