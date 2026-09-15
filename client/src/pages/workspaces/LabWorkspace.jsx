import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldCheck, FlaskConical } from 'lucide-react';
import LabDashboard from '../lab/LabDashboard.jsx';
import LabReports from '../lab/LabReports.jsx';
import LabNewReport from '../lab/LabNewReport.jsx';
import { useSearchParams } from 'react-router-dom';
import LabProfile from '../lab/LabProfile.jsx';

export function LabWorkspace() {
  const { user, profile, role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard'; // 'dashboard' | 'reports' | 'new_report' | 'profile'
  const setActiveTab = (tab) => setSearchParams({ tab });
  const [selectedReportForView, setSelectedReportForView] = useState(null);

  const handleSelectReport = (report) => {
    setSelectedReportForView(report);
  };

  return (
    <div className="medx-container" style={{ paddingBottom: '3rem' }}>
      {/* Laboratory Identity Header */}
      <div className="medx-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              backgroundColor: '#FFF7ED',
              color: '#EA580C',
              padding: '0.75rem',
              borderRadius: 'var(--medx-radius-md)'
            }}>
              <FlaskConical size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                {profile?.labName || 'Diagnostic Laboratory Hub'}
              </h1>
              <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                Diagnostic Testing • Diagnostic Report Issuance & Validation • Quality Sign-Off • Laboratory Management
              </p>
            </div>
          </div>
          <span className="medx-badge medx-badge-lab" style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}>
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
          <div><strong>Lab Specialist:</strong> {user?.name} ({user?.email})</div>
          <div><strong>Facility Code:</strong> {profile?.code || profile?.legacyId || 'LAB-01'}</div>
          <div><strong>Accreditation:</strong> {profile?.accreditation || 'NABL & CAP Certified'}</div>
          <div><strong>Quality Standard:</strong> <span style={{ color: '#16A34A', fontWeight: 600 }}>ISO 15189 Quality Compliant</span></div>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'dashboard' && (
        <LabDashboard
          onNavigateTab={(tab) => setActiveTab(tab)}
          onSelectReport={handleSelectReport}
        />
      )}

      {activeTab === 'reports' && (
        <LabReports
          selectedReportFromDash={selectedReportForView}
          onClearSelected={() => setSelectedReportForView(null)}
        />
      )}

      {activeTab === 'new_report' && (
        <LabNewReport
          onReportCreated={(rep) => {
            setSelectedReportForView(rep);
            setActiveTab('reports');
          }}
        />
      )}

      {activeTab === 'profile' && (
        <LabProfile />
      )}
    </div>
  );
}

export default LabWorkspace;
