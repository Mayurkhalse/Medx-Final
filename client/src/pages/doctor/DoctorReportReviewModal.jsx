import React, { useState } from 'react';
import { X, ShieldCheck, Activity, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import api from '../../services/api.js';

export function DoctorReportReviewModal({ report, onClose, onSuccess }) {
  const [reviewStatus, setReviewStatus] = useState(report?.reviewStatus || 'Reviewed');
  const [reviewNotes, setReviewNotes] = useState(report?.reviewNotes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!report) return null;

  // Extract parameters
  const params = report.parameters ? Object.entries(report.parameters) : [];
  const mlResult = report.mlResult || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSaving(true);
      const res = await api.put(`/doctor/reports/${report._id || report.id}/review`, {
        reviewStatus,
        reviewNotes: reviewNotes.trim()
      });

      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      console.error('Failed to submit report review:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to submit clinical report review');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1150,
      padding: '1rem',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--medx-radius-lg)',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--medx-radius-md)',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                Clinical Diagnostic Report Review
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: '0.125rem 0 0 0' }}>
                Report: <strong>{report.name || report.reportName}</strong> • Date: {report.date || new Date().toISOString().split('T')[0]}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--medx-text-secondary)',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              borderRadius: 'var(--medx-radius-sm)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div style={{
              backgroundColor: '#FEF2F2',
              color: '#B91C1C',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--medx-radius-sm)',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          {/* ML Risk Summary Banner */}
          {mlResult.riskTier && (
            <div style={{
              backgroundColor: mlResult.riskTier === 'Critical' || mlResult.riskTier === 'High' ? '#FEF2F2' : '#F0FDF4',
              border: `1px solid ${mlResult.riskTier === 'Critical' || mlResult.riskTier === 'High' ? '#FCA5A5' : '#86EFAC'}`,
              borderRadius: 'var(--medx-radius-md)',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Activity size={20} color={mlResult.riskTier === 'Critical' || mlResult.riskTier === 'High' ? '#DC2626' : '#16A34A'} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--medx-navy)' }}>
                    AI Clinical Diagnostics Risk: {mlResult.riskTier}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)' }}>
                    Aggregate Risk Score: {mlResult.overallRiskScore || 85}/100 • Automated biomarker analysis
                  </div>
                </div>
              </div>
              <span className="medx-badge" style={{
                backgroundColor: mlResult.riskTier === 'Critical' || mlResult.riskTier === 'High' ? '#EF4444' : '#22C55E',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.8125rem'
              }}>
                {mlResult.riskTier} Risk
              </span>
            </div>
          )}

          {/* Biomarkers Table */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.5rem' }}>
              Patient Biomarker Parameters ({params.length})
            </h4>
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 'var(--medx-radius-md)',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: 'var(--medx-text-secondary)' }}>
                    <th style={{ padding: '0.625rem 1rem', fontWeight: 600 }}>Biomarker / Test</th>
                    <th style={{ padding: '0.625rem 1rem', fontWeight: 600 }}>Result Value</th>
                    <th style={{ padding: '0.625rem 1rem', fontWeight: 600 }}>Reference Range</th>
                    <th style={{ padding: '0.625rem 1rem', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {params.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--medx-text-secondary)' }}>
                        No individual biomarker parameters mapped.
                      </td>
                    </tr>
                  ) : (
                    params.map(([key, val], idx) => {
                      const isAbnormal = val.status === 'High' || val.status === 'Low' || val.status === 'Critical';
                      return (
                        <tr key={key} style={{ borderBottom: idx < params.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                          <td style={{ padding: '0.625rem 1rem', fontWeight: 500, color: 'var(--medx-navy)' }}>
                            {key.replace(/_/g, ' ').toUpperCase()}
                          </td>
                          <td style={{ padding: '0.625rem 1rem', fontWeight: 700, color: isAbnormal ? '#DC2626' : '#0F172A' }}>
                            {val.value} {val.unit}
                          </td>
                          <td style={{ padding: '0.625rem 1rem', color: '#64748B' }}>
                            {val.ref_range || val.referenceRange || 'Standard'}
                          </td>
                          <td style={{ padding: '0.625rem 1rem' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '9999px',
                              fontWeight: 600,
                              backgroundColor: isAbnormal ? '#FEF2F2' : '#F0FDF4',
                              color: isAbnormal ? '#B91C1C' : '#15803D'
                            }}>
                              {val.status || 'Normal'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor Review Sign-Off Form */}
          <form onSubmit={handleSubmit} style={{
            backgroundColor: '#F8FAFC',
            padding: '1.25rem',
            borderRadius: 'var(--medx-radius-md)',
            border: '1px solid #CBD5E1'
          }}>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--medx-navy)', margin: '0 0 0.75rem 0' }}>
              Clinician Assessment & Review Decision
            </h4>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-text-secondary)', marginBottom: '0.25rem' }}>
                Review Status
              </label>
              <select
                className="medx-input"
                style={{ width: '100%', maxWidth: '300px' }}
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
              >
                <option value="Reviewed">Reviewed & Verified</option>
                <option value="Sign-Off Required">Sign-Off Required by Senior Consultant</option>
                <option value="Pending Review">Pending Diagnostic Correlation</option>
                <option value="Rejected">Rejected / Inconclusive Sample</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-text-secondary)', marginBottom: '0.25rem' }}>
                Clinical Review Notes & Recommendations
              </label>
              <textarea
                className="medx-input"
                style={{ width: '100%', minHeight: '90px', resize: 'vertical' }}
                placeholder="Enter clinical assessment, therapeutic adjustments, or instructions for the patient..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="medx-btn medx-btn-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="medx-btn medx-btn-primary"
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              >
                <ShieldCheck size={16} /> {saving ? 'Recording Review...' : 'Sign & Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DoctorReportReviewModal;
