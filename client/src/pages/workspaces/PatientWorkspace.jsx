import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldCheck, User } from 'lucide-react';
import PatientDashboard from '../patient/PatientDashboard.jsx';
import PatientReportEntry from '../patient/PatientReportEntry.jsx';
import PatientWhatIf from '../patient/PatientWhatIf.jsx';
import PatientAppointments from '../patient/PatientAppointments.jsx';
import PatientLiveVitals from '../patient/PatientLiveVitals.jsx';

export function PatientWorkspace() {
  const { user, profile, role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard'; // 'dashboard' | 'entry' | 'whatif' | 'appointments' | 'sos' | 'iot'

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  return (
    <div className="medx-container" style={{ paddingBottom: '3rem' }}>
      {/* Patient Workspace Identity Header */}
      <div className="medx-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
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
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                Patient Workspace
              </h1>
              <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                Secure Patient Diagnostics, Biomarker Analytics, Live IoT Telemetry & Consultations
              </p>
            </div>
          </div>
          <span className="medx-badge medx-badge-patient" style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}>
            <ShieldCheck size={16} /> Verified Role: {role}
          </span>
        </div>

        {/* Active Session Identity Strip */}
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
          <div><strong>User:</strong> {user?.name || 'Patient'} ({user?.email})</div>
          <div><strong>User ID:</strong> {user?.id}</div>
          <div><strong>Patient Profile:</strong> {profile?._id || 'Linked'}</div>
          <div><strong>Legacy ID:</strong> {profile?.legacyId || 'PAT-Auto'}</div>
        </div>
      </div>

      {/* Primary Tab Panels */}
      {(activeTab === 'biomarkers' || activeTab === 'dashboard' || activeTab === 'sos') && (
        <PatientDashboard
          onNavigateToEntry={() => setActiveTab('reports')}
          onNavigateToIot={() => setActiveTab('iot')}
          scrollToSos={activeTab === 'sos'}
        />
      )}

      {(activeTab === 'reports' || activeTab === 'entry') && (
        <PatientReportEntry onReportCreated={() => setActiveTab('dashboard')} />
      )}

      {(activeTab === 'iot' || activeTab === 'vitals' || activeTab === 'live') && (
        <PatientLiveVitals
          onReportCreated={() => {}}
          onNavigateToReports={() => setActiveTab('dashboard')}
        />
      )}

      {(activeTab === 'what-if' || activeTab === 'whatif') && (
        <PatientWhatIf />
      )}

      {activeTab === 'appointments' && (
        <PatientAppointments />
      )}
    </div>
  );
}

export default PatientWorkspace;
