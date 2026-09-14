import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileSpreadsheet, Eye, Filter, CheckCircle2 } from 'lucide-react';

const HospitalLabReports = () => {
  const { token, API_HOST } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        // Query reports from API
        const res = await fetch(`${API_HOST}/api/reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setReports(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchReports();
  }, [token, API_HOST]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-strong)' }}>
          Laboratory Diagnostic Reports Triage
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Real-time stream of ingested patient blood panels, ML disease risks, and reference range flags
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedReport ? '1fr 380px' : '1fr', gap: '24px' }}>
        <div className="card">
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Loading lab reports stream...</p>
          ) : reports.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No lab reports logged across facility.</p>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Source</th>
                    <th>Risk Score</th>
                    <th>Triage Tier</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r._id}>
                      <td style={{ fontWeight: 600 }}>
                        {new Date(r.reportDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{r.sourceType}</td>
                      <td style={{ fontWeight: 800 }}>{r.mlResult.overallRiskScore}/100</td>
                      <td>
                        <span className={`badge badge-${r.mlResult.riskTier.toLowerCase()}`}>
                          {r.mlResult.riskTier}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                          <Eye size={14} />
                          Examine Panel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Report Inspection Drawer */}
        {selectedReport && (
          <div className="card" style={{ height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                Biomarker Panel Details
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 700 }}
              >
                &times; Close
              </button>
            </div>

            <div style={{ marginBottom: '16px', background: 'var(--surface-2)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assessed Tier</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                {selectedReport.mlResult.overallRiskScore}/100 ({selectedReport.mlResult.riskTier})
              </div>
            </div>

            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Extracted Parameters
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedReport.parameters &&
                Object.entries(
                  selectedReport.parameters instanceof Map
                    ? Object.fromEntries(selectedReport.parameters)
                    : selectedReport.parameters
                ).map(([key, item]) => {
                  const flag = (selectedReport.mlResult?.flags && (selectedReport.mlResult.flags[key] || selectedReport.mlResult.flags.get?.(key))) || 'normal';
                  return (
                    <div key={key} className={`parameter-item ${flag}`} style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {key.replace('_', ' ')}
                      </span>
                      <div style={{ fontWeight: 800 }}>
                        {item.value} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.unit}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalLabReports;
