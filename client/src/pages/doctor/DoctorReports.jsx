import React, { useState, useEffect } from 'react';
import {
  FileText, Search, ShieldCheck, AlertTriangle, CheckCircle2,
  Calendar, Activity, RefreshCw, Eye
} from 'lucide-react';
import api from '../../services/api.js';

export function DoctorReports({ onOpenReview }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctor/reports');
      setReports(res.data || []);
    } catch (err) {
      console.error('Failed to fetch doctor reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(r => {
    const matchSearch = (r.reportName || r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.reportType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.id || r._id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || r.reviewStatus === statusFilter;
    const matchRisk = riskFilter === 'ALL' || r.mlResult?.riskTier === riskFilter;
    return matchSearch && matchStatus && matchRisk;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header Card */}
      <div className="medx-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
              Diagnostic Report Review Center
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: '0.25rem 0 0 0' }}>
              Comprehensive medical reports submitted by patients, clinicians, and laboratories
            </p>
          </div>

          <button
            type="button"
            className="medx-btn medx-btn-secondary"
            onClick={fetchReports}
            disabled={loading}
            style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '3fr 1fr 1fr',
          gap: '0.75rem',
          marginTop: '1.25rem'
        }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="medx-input"
              style={{ width: '100%', paddingLeft: '2.25rem' }}
              placeholder="Search reports by name, type, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="medx-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Review Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Sign-Off Required">Sign-Off Required</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            className="medx-input"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="medx-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: 'var(--medx-text-secondary)' }}>
              <th style={{ padding: '0.875rem 1.25rem', fontWeight: 600 }}>Report Title & ID</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>Date & Source</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>ML Risk Tier</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>Review Status</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>Physician Review</th>
              <th style={{ padding: '0.875rem 1.25rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--medx-text-secondary)' }}>
                  Loading medical reports...
                </td>
              </tr>
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--medx-text-secondary)' }}>
                  No medical diagnostic reports match your filters.
                </td>
              </tr>
            ) : (
              filteredReports.map((r, idx) => {
                const isReviewed = r.reviewStatus === 'Reviewed';
                const isCritical = r.mlResult?.riskTier === 'Critical' || r.mlResult?.riskTier === 'High';
                return (
                  <tr
                    key={r._id || idx}
                    style={{
                      borderBottom: idx < filteredReports.length - 1 ? '1px solid #F1F5F9' : 'none',
                      backgroundColor: isCritical && !isReviewed ? '#FFF5F5' : 'transparent',
                      transition: 'background-color 0.15s'
                    }}
                  >
                    {/* Title */}
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--medx-navy)', fontSize: '0.9375rem' }}>
                        {r.reportName || r.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', marginTop: '0.125rem' }}>
                        ID: <strong>{r.id || r.reportId || r._id}</strong> • Type: {r.reportType}
                      </div>
                    </td>

                    {/* Date & Source */}
                    <td style={{ padding: '0.875rem 1rem', color: '#475569', fontSize: '0.8125rem' }}>
                      <div>{new Date(r.reportDate || Date.now()).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'capitalize' }}>
                        Source: {r.sourceType}
                      </div>
                    </td>

                    {/* ML Risk Tier */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        backgroundColor: isCritical ? '#FEE2E2' : '#F0FDF4',
                        color: isCritical ? '#B91C1C' : '#15803D',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <Activity size={12} /> {r.mlResult?.riskTier || 'Normal'} ({r.mlResult?.overallRiskScore || 15}/100)
                      </span>
                    </td>

                    {/* Review Status */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className="medx-badge" style={{
                        backgroundColor: isReviewed ? '#DCFCE7' : '#FEF3C7',
                        color: isReviewed ? '#15803D' : '#B45309',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {isReviewed ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                        {r.reviewStatus || 'Pending Review'}
                      </span>
                    </td>

                    {/* Physician Review Notes */}
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#475569', maxWidth: '220px' }}>
                      {r.reviewNotes ? (
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.reviewNotes}>
                          {r.reviewNotes}
                        </div>
                      ) : (
                        <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Awaiting doctor review</span>
                      )}
                      {r.reviewedAt && (
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                          Signed: {new Date(r.reviewedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="medx-btn"
                        style={{
                          backgroundColor: isReviewed ? '#F1F5F9' : 'var(--medx-teal)',
                          color: isReviewed ? '#0F172A' : '#FFFFFF',
                          padding: '0.375rem 0.75rem',
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        onClick={() => onOpenReview(r)}
                      >
                        <ShieldCheck size={13} /> {isReviewed ? 'Edit Sign-Off' : 'Review & Sign'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DoctorReports;
