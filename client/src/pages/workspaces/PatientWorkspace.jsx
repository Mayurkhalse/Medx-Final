import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldCheck, User, Activity, FileText, Sparkles } from 'lucide-react';
import PatientDashboard from '../patient/PatientDashboard.jsx';
import PatientReportEntry from '../patient/PatientReportEntry.jsx';
import PatientWhatIf from '../patient/PatientWhatIf.jsx';

export function PatientWorkspace() {
  const { user, profile, role } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'entry' | 'whatif'

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
                Secure Patient Diagnostics, Biomarker Analytics & What-If AI Simulation
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

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        backgroundColor: '#FFFFFF',
        padding: '0.375rem',
        borderRadius: 'var(--medx-radius-md)',
        border: '1px solid var(--medx-border)'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--medx-radius-sm)',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            backgroundColor: activeTab === 'dashboard' ? 'var(--medx-primary-light)' : 'transparent',
            color: activeTab === 'dashboard' ? 'var(--medx-primary)' : 'var(--medx-text-secondary)',
            transition: 'all 0.15s ease'
          }}
        >
          <Activity size={18} />
          Biomarker Dashboard & Trends
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('entry')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--medx-radius-sm)',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            backgroundColor: activeTab === 'entry' ? 'var(--medx-primary-light)' : 'transparent',
            color: activeTab === 'entry' ? 'var(--medx-primary)' : 'var(--medx-text-secondary)',
            transition: 'all 0.15s ease'
          }}
        >
          <FileText size={18} />
          Log Report (Manual / PDF)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('whatif')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--medx-radius-sm)',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            backgroundColor: activeTab === 'whatif' ? '#F3E8FF' : 'transparent',
            color: activeTab === 'whatif' ? '#9333EA' : 'var(--medx-text-secondary)',
            transition: 'all 0.15s ease'
          }}
        >
          <Sparkles size={18} />
          What-If Health Simulator
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'dashboard' && (
        <PatientDashboard onNavigateToEntry={() => setActiveTab('entry')} />
      )}

      {activeTab === 'entry' && (
        <PatientReportEntry onReportCreated={() => setActiveTab('dashboard')} />
      )}

      {activeTab === 'whatif' && (
        <PatientWhatIf />
      )}
    </div>
  );
}

export default PatientWorkspace;
