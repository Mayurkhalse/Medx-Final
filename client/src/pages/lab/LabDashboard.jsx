import React, { useState, useEffect } from 'react';
import {
  FlaskConical, FileCheck2, Clock, AlertTriangle, FileText,
  RefreshCw, PlusCircle, CheckCircle2, ChevronRight, Eye
} from 'lucide-react';
import labService from '../../services/labService.js';

export default function LabDashboard({ onNavigateTab, onSelectReport }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await labService.getDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Lab dashboard load error:', err);
      setError('Unable to load diagnostic laboratory metrics from unified server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--medx-text-secondary)' }}>
        <RefreshCw size={24} className="medx-spin" style={{ marginBottom: '0.75rem' }} />
        <p>Loading laboratory diagnostic metrics...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="medx-card" style={{ borderLeft: '4px solid #EF4444', padding: '1.5rem' }}>
        <p style={{ color: '#EF4444', fontWeight: 600 }}>{error}</p>
        <button
          className="medx-btn medx-btn-secondary"
          onClick={loadDashboard}
          style={{ marginTop: '0.75rem' }}
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const { stats, lab, recentReports = [] } = data || {};

  return (
    <div>
      {/* Header & Quick Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--medx-navy)' }}>
            {lab?.labName || 'Laboratory Diagnostics Hub'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--medx-text-secondary)' }}>
            Code: <strong>{lab?.code || lab?.legacyId || 'LAB-01'}</strong> • Accreditation: {lab?.accreditation || 'NABL & CAP Accredited'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="medx-btn medx-btn-secondary"
            onClick={loadDashboard}
            title="Refresh dashboard metrics"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            className="medx-btn medx-btn-primary"
            onClick={() => onNavigateTab('new_report')}
            style={{ backgroundColor: '#EA580C', borderColor: '#EA580C' }}
          >
            <PlusCircle size={16} /> New Diagnostic Report
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="medx-card" style={{ padding: '1.25rem', borderTop: '4px solid #3B82F6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-text-secondary)', textTransform: 'uppercase' }}>
              Total Diagnostic Reports
            </span>
            <FileText size={20} color="#3B82F6" />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--medx-navy)', marginTop: '0.5rem' }}>
            {stats?.totalReports || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', marginTop: '0.25rem' }}>
            Canonical MedicalReport records
          </div>
        </div>

        <div className="medx-card" style={{ padding: '1.25rem', borderTop: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-text-secondary)', textTransform: 'uppercase' }}>
              Finalized & Signed Off
            </span>
            <FileCheck2 size={20} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: '#10B981', marginTop: '0.5rem' }}>
            {stats?.finalizedReports || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', marginTop: '0.25rem' }}>
            Locked & released to doctors
          </div>
        </div>

        <div className="medx-card" style={{ padding: '1.25rem', borderTop: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-text-secondary)', textTransform: 'uppercase' }}>
              Drafts / In Progress
            </span>
            <Clock size={20} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: '#F59E0B', marginTop: '0.5rem' }}>
            {stats?.draftReports || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', marginTop: '0.25rem' }}>
            Pending final lab validation
          </div>
        </div>

        <div className="medx-card" style={{ padding: '1.25rem', borderTop: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-text-secondary)', textTransform: 'uppercase' }}>
              Critical Flags
            </span>
            <AlertTriangle size={20} color="#EF4444" />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: '#EF4444', marginTop: '0.5rem' }}>
            {stats?.criticalReports || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', marginTop: '0.25rem' }}>
            Requires clinical attention
          </div>
        </div>

        <div className="medx-card" style={{ padding: '1.25rem', borderTop: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-text-secondary)', textTransform: 'uppercase' }}>
              Target Turnaround
            </span>
            <FlaskConical size={20} color="#8B5CF6" />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: '#8B5CF6', marginTop: '0.5rem' }}>
            {stats?.turnaroundHours || 4}h
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', marginTop: '0.25rem' }}>
            Quality service benchmark
          </div>
        </div>
      </div>

      {/* Recent Diagnostic Reports Table */}
      <div className="medx-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--medx-navy)' }}>
            Recent Diagnostic Submissions
          </h3>
          <button
            className="medx-btn medx-btn-secondary"
            onClick={() => onNavigateTab('reports')}
            style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
          >
            View All Reports <ChevronRight size={14} />
          </button>
        </div>

        {recentReports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--medx-text-secondary)' }}>
            <FlaskConical size={36} color="var(--medx-text-secondary)" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
            <p style={{ fontWeight: 500 }}>No diagnostic reports generated yet.</p>
            <button
              className="medx-btn medx-btn-primary"
              onClick={() => onNavigateTab('new_report')}
              style={{ marginTop: '0.75rem', backgroundColor: '#EA580C', borderColor: '#EA580C' }}
            >
              Create First Report
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--medx-border)', textAlign: 'left', color: 'var(--medx-text-secondary)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Report ID</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Patient Name</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Test Profile</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Doctor Review</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Risk Tier</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr key={report._id} style={{ borderBottom: '1px solid var(--medx-border)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                      {report.reportId || report._id.substring(0, 8)}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{report.patientId?.name || 'Unknown Patient'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)' }}>
                        {report.patientId?.legacyId ? `ID: ${report.patientId.legacyId}` : ''}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div>{report.reportName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)' }}>{report.reportType}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className={`medx-badge ${report.status === 'Finalized' ? 'medx-badge-success' : 'medx-badge-warning'}`}>
                        {report.status || 'Finalized'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className={`medx-badge ${report.reviewStatus === 'Reviewed' ? 'medx-badge-success' : 'medx-badge-info'}`}>
                        {report.reviewStatus || 'Pending Review'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: report.mlResult?.riskTier === 'Critical' ? '#FEE2E2' :
                                         report.mlResult?.riskTier === 'High' ? '#FEF3C7' : '#DCFCE7',
                        color: report.mlResult?.riskTier === 'Critical' ? '#DC2626' :
                               report.mlResult?.riskTier === 'High' ? '#D97706' : '#16A34A'
                      }}>
                        {report.mlResult?.riskTier || 'Low'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--medx-text-secondary)' }}>
                      {new Date(report.createdAt || report.reportDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <button
                        className="medx-btn medx-btn-secondary"
                        onClick={() => {
                          if (onSelectReport) onSelectReport(report);
                          onNavigateTab('reports');
                        }}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
