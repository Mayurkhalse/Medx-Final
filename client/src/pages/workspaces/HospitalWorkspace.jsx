import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  ShieldCheck, Building2, LayoutDashboard,
  ListOrdered, BedDouble, Users, Stethoscope
} from 'lucide-react';
import HospitalDashboard from '../hospital/HospitalDashboard.jsx';
import HospitalCareQueue from '../hospital/HospitalCareQueue.jsx';
import HospitalBeds from '../hospital/HospitalBeds.jsx';
import HospitalPatients from '../hospital/HospitalPatients.jsx';
import HospitalDoctors from '../hospital/HospitalDoctors.jsx';

export function HospitalWorkspace() {
  const { user, profile, role } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'care-queue' | 'beds' | 'patients' | 'doctors'

  return (
    <div className="medx-container" style={{ paddingBottom: '3rem' }}>
      {/* Hospital Identity Header */}
      <div className="medx-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
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
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                {profile?.facilityName || 'Institutional Hospital Operations Center'}
              </h1>
              <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                Bed Management • ICU Acuity • 6-Stage Care Queue • Staff & Inpatient Operations
              </p>
            </div>
          </div>
          <span className="medx-badge medx-badge-hospital" style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}>
            <ShieldCheck size={16} /> Verified Role: {role}
          </span>
        </div>

        {/* Facility Identity Strip */}
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
          <div><strong>Administrator:</strong> {user?.name} ({user?.email})</div>
          <div><strong>Facility Code:</strong> {profile?.legacyId || profile?.code || 'HOSP-MEDX-01'}</div>
          <div><strong>Total Capacity:</strong> {profile?.totalBeds || 100} beds ({profile?.icuBeds || 10} ICU)</div>
          <div><strong>Status:</strong> <span style={{ color: '#16A34A', fontWeight: 600 }}>24/7 Active Inpatient Operations</span></div>
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
          onClick={() => setActiveTab('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: activeTab === 'dashboard' ? '#7E22CE' : 'var(--medx-text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'dashboard' ? '2px solid #7E22CE' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <LayoutDashboard size={18} />
          Operations Dashboard
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('care-queue')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: activeTab === 'care-queue' ? '#7E22CE' : 'var(--medx-text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'care-queue' ? '2px solid #7E22CE' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <ListOrdered size={18} />
          Care Queue (6-Stage)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('beds')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: activeTab === 'beds' ? '#7E22CE' : 'var(--medx-text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'beds' ? '2px solid #7E22CE' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <BedDouble size={18} />
          Beds & ICU Management
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
            color: activeTab === 'patients' ? '#7E22CE' : 'var(--medx-text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'patients' ? '2px solid #7E22CE' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Users size={18} />
          Inpatient Directory
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('doctors')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: activeTab === 'doctors' ? '#7E22CE' : 'var(--medx-text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'doctors' ? '2px solid #7E22CE' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Stethoscope size={18} />
          Physician Roster
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'dashboard' && <HospitalDashboard onNavigateTab={setActiveTab} />}
      {activeTab === 'care-queue' && <HospitalCareQueue />}
      {activeTab === 'beds' && <HospitalBeds />}
      {activeTab === 'patients' && <HospitalPatients />}
      {activeTab === 'doctors' && <HospitalDoctors />}
    </div>
  );
}

export default HospitalWorkspace;
