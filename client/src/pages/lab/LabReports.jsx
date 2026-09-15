import React, { useState, useEffect } from 'react';
import {
  FileText, Search, Filter, RefreshCw, Eye, CheckCircle2,
  AlertTriangle, Lock, User, Calendar, Building2, X
} from 'lucide-react';
import labService from '../../services/labService.js';

export default function LabReports({ selectedReportFromDash, onClearSelected }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeReport, setActiveReport] = useState(null);
  const [finalizing, setFinalizing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res = await labService.getReports(params);
      if (res.success) {
        setReports(res.reports || []);
      }
    } catch (err) {
      console.error('Failed to load lab reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  useEffect(() => {
    if (selectedReportFromDash) {
      setActiveReport(selectedReportFromDash);
    }
  }, [selectedReportFromDash]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const handleFinalize = async (reportId) => {
    try {
      setFinalizing(true);
      const res = await labService.finalizeReport(reportId);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Report successfully finalized and released.' });
        setActiveReport(res.report);
        fetchReports();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error?.message || 'Failed to finalize report.'
      });
    } finally {
      setFinalizing(false);
    }
  };

  // Convert parameters Map/Object to Array for table rendering
  const getParametersList = (report) => {
    if (!report || !report.parameters) return [];
    if (report.parameters instanceof Map) {
      return Array.from(report.parameters.entries()).map(([key, val]) => ({ key, ...val }));
    }
    return Object.entries(report.parameters).map(([key, val]) => ({ key, ...val }));
  };

  return (
    <div>
      {/* Header & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--medx-navy)' }}>
            Diagnostic Reports Inventory
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--medx-text-secondary)' }}>
            Search, review, and sign off official laboratory diagnostic reports
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--medx-text-secondary)' }} />
              <input
                type="text"
                placeholder="Search report name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  border: '1px solid var(--medx-border)',
                  borderRadius: 'var(--medx-radius-sm)',
                  fontSize: '0.875rem',
                  width: '220px'
                }}
              />
            </div>
            <button type="submit" className="medx-btn medx-btn-secondary" style={{ padding: '0.5rem 0.75rem' }}>
              Search
            </button>
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--medx-border)',
              borderRadius: 'var(--medx-radius-sm)',
              fontSize: '0.875rem',
              backgroundColor: '#fff'
            }}
          >
            <option value="">All Statuses</option>
            <option value="Finalized">Finalized</option>
            <option value="Draft">Draft</option>
          </select>

          <button
            className="medx-btn medx-btn-secondary"
            onClick={fetchReports}
            title="Refresh list"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {feedback && (
        <div style={{
          padding: '0.875rem 1rem',
          borderRadius: 'var(--medx-radius-sm)',
          marginBottom: '1rem',
          backgroundColor: feedback.type === 'success' ? '#DCFCE7' : '#FEE2E2',
          color: feedback.type === 'success' ? '#15803D' : '#B91C1C',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Reports Table */}
      <div className="medx-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--medx-text-secondary)' }}>
            <RefreshCw size={24} className="medx-spin" style={{ marginBottom: '0.75rem' }} />
            <p>Loading diagnostic reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--medx-text-secondary)' }}>
            <FileText size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
            <p style={{ fontWeight: 600 }}>No reports found matching your criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--medx-border)', textAlign: 'left', color: 'var(--medx-text-secondary)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Report ID</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Patient Name</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Report Title</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Doctor Review</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Risk Score</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Collection Date</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rep) => (
                  <tr key={rep._id} style={{ borderBottom: '1px solid var(--medx-border)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                      {rep.reportId || rep._id.substring(0, 8)}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{rep.patientId?.name || 'Unknown Patient'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)' }}>
                        {rep.patientId?.legacyId || ''} • {rep.patientId?.gender || ''}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 500 }}>{rep.reportName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)' }}>{rep.reportType}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className={`medx-badge ${rep.status === 'Finalized' ? 'medx-badge-success' : 'medx-badge-warning'}`}>
                        {rep.status || 'Finalized'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className={`medx-badge ${rep.reviewStatus === 'Reviewed' ? 'medx-badge-success' : 'medx-badge-info'}`}>
                        {rep.reviewStatus || 'Pending Review'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: rep.mlResult?.riskTier === 'Critical' ? '#FEE2E2' :
                                         rep.mlResult?.riskTier === 'High' ? '#FEF3C7' : '#DCFCE7',
                        color: rep.mlResult?.riskTier === 'Critical' ? '#DC2626' :
                               rep.mlResult?.riskTier === 'High' ? '#D97706' : '#16A34A'
                      }}>
                        {rep.mlResult?.riskTier || 'Low'} ({rep.mlResult?.overallRiskScore ?? 0})
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--medx-text-secondary)' }}>
                      {new Date(rep.sampleCollectedAt || rep.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <button
                        className="medx-btn medx-btn-secondary"
                        onClick={() => setActiveReport(rep)}
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                      >
                        <Eye size={14} /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      {activeReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 'var(--medx-radius-lg)',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--medx-border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--medx-navy)' }}>
                  Diagnostic Report Dossier
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)' }}>
                  Report ID: <strong>{activeReport.reportId || activeReport._id}</strong>
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveReport(null);
                  if (onClearSelected) onClearSelected();
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--medx-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Patient & Facility Summary */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              backgroundColor: 'var(--medx-surface-muted)',
              padding: '1rem',
              borderRadius: 'var(--medx-radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.875rem'
            }}>
              <div>
                <div style={{ color: 'var(--medx-text-secondary)', fontSize: '0.75rem' }}>Patient Name</div>
                <div style={{ fontWeight: 600 }}>{activeReport.patientId?.name || 'N/A'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)' }}>
                  {activeReport.patientId?.gender} • {activeReport.patientId?.age ? `${activeReport.patientId.age} yrs` : ''} • {activeReport.patientId?.bloodGroup}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--medx-text-secondary)', fontSize: '0.75rem' }}>Lab Issuance & Status</div>
                <div style={{ fontWeight: 600 }}>{activeReport.labName || 'Central Lab'}</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span className={`medx-badge ${activeReport.status === 'Finalized' ? 'medx-badge-success' : 'medx-badge-warning'}`}>
                    {activeReport.status || 'Finalized'}
                  </span>
                  <span className={`medx-badge ${activeReport.reviewStatus === 'Reviewed' ? 'medx-badge-success' : 'medx-badge-info'}`}>
                    Doctor: {activeReport.reviewStatus || 'Pending'}
                  </span>
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--medx-text-secondary)', fontSize: '0.75rem' }}>Collection Timestamp</div>
                <div style={{ fontWeight: 600 }}>
                  {new Date(activeReport.sampleCollectedAt || activeReport.createdAt).toLocaleString()}
                </div>
                {activeReport.finalizedAt && (
                  <div style={{ fontSize: '0.75rem', color: '#15803D' }}>
                    Signed: {new Date(activeReport.finalizedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Biomarker Parameters Table */}
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--medx-navy)' }}>
              Quantitative Biomarker Parameters
            </h4>
            <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--medx-border)', backgroundColor: '#F8FAFC', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem' }}>Biomarker</th>
                    <th style={{ padding: '0.5rem' }}>Result Value</th>
                    <th style={{ padding: '0.5rem' }}>Unit</th>
                    <th style={{ padding: '0.5rem' }}>Reference Range</th>
                    <th style={{ padding: '0.5rem' }}>Clinical Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getParametersList(activeReport).map((param, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--medx-border)' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 600 }}>
                        {param.key ? param.key.replace(/_/g, ' ').toUpperCase() : param.name || `Param ${idx + 1}`}
                      </td>
                      <td style={{ padding: '0.5rem', fontWeight: 700, color: 'var(--medx-navy)' }}>
                        {param.value}
                      </td>
                      <td style={{ padding: '0.5rem', color: 'var(--medx-text-secondary)' }}>
                        {param.unit || '—'}
                      </td>
                      <td style={{ padding: '0.5rem', fontSize: '0.8125rem', color: 'var(--medx-text-secondary)' }}>
                        {param.ref_range || param.referenceRange || 'Standard Lab Range'}
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <span style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: param.status === 'Critical' ? '#FEE2E2' :
                                           param.status === 'High' || param.status === 'Low' ? '#FEF3C7' : '#DCFCE7',
                          color: param.status === 'Critical' ? '#DC2626' :
                                 param.status === 'High' || param.status === 'Low' ? '#D97706' : '#16A34A'
                        }}>
                          {param.status || 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes if present */}
            {activeReport.notes && (
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '4px', fontSize: '0.875rem' }}>
                <strong>Laboratory Notes:</strong> {activeReport.notes}
              </div>
            )}

            {/* Doctor Review Notice (Read-only for Lab Staff) */}
            <div style={{
              borderLeft: '3px solid #3B82F6',
              backgroundColor: '#EFF6FF',
              padding: '0.75rem 1rem',
              borderRadius: '0 4px 4px 0',
              marginBottom: '1.5rem',
              fontSize: '0.8125rem',
              color: '#1E40AF'
            }}>
              <strong>Clinical Review Boundary:</strong> Doctor review status is <strong>{activeReport.reviewStatus || 'Pending Review'}</strong>.
              {activeReport.reviewedByDoctorId && (
                <div>Reviewed by Dr. {activeReport.reviewedByDoctorId?.name || 'Physician'} on {new Date(activeReport.reviewedAt).toLocaleDateString()}</div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              {activeReport.status === 'Draft' && (
                <button
                  className="medx-btn medx-btn-primary"
                  onClick={() => handleFinalize(activeReport._id)}
                  disabled={finalizing}
                  style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}
                >
                  <CheckCircle2 size={16} /> {finalizing ? 'Finalizing...' : 'Finalize & Sign Off'}
                </button>
              )}
              <button
                className="medx-btn medx-btn-secondary"
                onClick={() => {
                  setActiveReport(null);
                  if (onClearSelected) onClearSelected();
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
