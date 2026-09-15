import React, { useState, useEffect } from 'react';
import {
  FlaskConical, Plus, Trash2, CheckCircle2, AlertCircle,
  RefreshCw, User, Building2, FileText, ArrowRight
} from 'lucide-react';
import labService from '../../services/labService.js';

const COMMON_PRESETS = [
  { key: 'glucose_fasting', label: 'Fasting Blood Glucose', unit: 'mg/dL', ref_range: '70 - 99 mg/dL' },
  { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', ref_range: '12.0 - 16.0 g/dL' },
  { key: 'wbc_count', label: 'WBC Count', unit: 'cells/mcL', ref_range: '4,500 - 11,000 cells/mcL' },
  { key: 'platelets', label: 'Platelet Count', unit: 'cells/mcL', ref_range: '150,000 - 450,000 cells/mcL' },
  { key: 'creatinine', label: 'Serum Creatinine', unit: 'mg/dL', ref_range: '0.7 - 1.3 mg/dL' },
  { key: 'urea', label: 'Blood Urea', unit: 'mg/dL', ref_range: '7 - 20 mg/dL' },
  { key: 'total_cholesterol', label: 'Total Cholesterol', unit: 'mg/dL', ref_range: '< 200 mg/dL' },
  { key: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', ref_range: '< 150 mg/dL' },
  { key: 'hdl_cholesterol', label: 'HDL Cholesterol', unit: 'mg/dL', ref_range: '> 40 mg/dL' },
  { key: 'ldl_cholesterol', label: 'LDL Cholesterol', unit: 'mg/dL', ref_range: '< 100 mg/dL' }
];

export default function LabNewReport({ onReportCreated }) {
  const [patients, setPatients] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [reportName, setReportName] = useState('Comprehensive Diagnostic Biomarker Analysis');
  const [reportType, setReportType] = useState('Comprehensive Metabolic Panel');
  const [status, setStatus] = useState('Finalized');
  const [sampleCollectedAt, setSampleCollectedAt] = useState(new Date().toISOString().substring(0, 16));
  const [notes, setNotes] = useState('');

  // Biomarkers rows
  const [parameters, setParameters] = useState([
    { key: 'glucose_fasting', value: '', unit: 'mg/dL', ref_range: '70 - 99 mg/dL', status: 'Normal' },
    { key: 'hemoglobin', value: '', unit: 'g/dL', ref_range: '12.0 - 16.0 g/dL', status: 'Normal' },
    { key: 'wbc_count', value: '', unit: 'cells/mcL', ref_range: '4,500 - 11,000 cells/mcL', status: 'Normal' },
    { key: 'creatinine', value: '', unit: 'mg/dL', ref_range: '0.7 - 1.3 mg/dL', status: 'Normal' }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [patRes, hospRes] = await Promise.all([
          labService.getAffiliatedPatients({ limit: 100 }),
          labService.getAffiliatedHospitals()
        ]);
        if (patRes.success) setPatients(patRes.patients || []);
        if (hospRes.success) setHospitals(hospRes.hospitals || []);
      } catch (err) {
        console.error('Failed to load form prerequisites:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleAddPreset = (preset) => {
    if (parameters.some((p) => p.key === preset.key)) return;
    setParameters([...parameters, { ...preset, value: '', status: 'Normal' }]);
  };

  const handleAddCustomRow = () => {
    setParameters([
      ...parameters,
      { key: `custom_marker_${parameters.length + 1}`, value: '', unit: '', ref_range: 'Normal', status: 'Normal' }
    ]);
  };

  const handleParamChange = (idx, field, val) => {
    const next = [...parameters];
    next[idx][field] = val;
    setParameters(next);
  };

  const handleRemoveParam = (idx) => {
    setParameters(parameters.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessResult(null);

    if (!selectedPatientId) {
      setError('Please select a registered patient for this diagnostic report.');
      return;
    }

    // Filter out rows where value is empty
    const filledParams = parameters.filter((p) => p.value !== '' && p.value !== undefined);
    if (filledParams.length === 0) {
      setError('Please provide result values for at least one biomarker parameter.');
      return;
    }

    // Construct parameters object
    const paramsMap = {};
    filledParams.forEach((p) => {
      paramsMap[p.key] = {
        value: Number(p.value) || p.value,
        unit: p.unit || '',
        ref_range: p.ref_range || '',
        status: p.status || 'Normal'
      };
    });

    try {
      setSubmitting(true);
      const payload = {
        patientId: selectedPatientId,
        hospitalId: selectedHospitalId || null,
        reportName,
        reportType,
        parameters: paramsMap,
        sampleCollectedAt: new Date(sampleCollectedAt),
        status,
        notes
      };

      const res = await labService.createDiagnosticReport(payload);
      if (res.success) {
        setSuccessResult(res.report);
      }
    } catch (err) {
      console.error('Diagnostic report creation error:', err);
      setError(err.response?.data?.error?.message || 'Failed to submit diagnostic report.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successResult) {
    return (
      <div className="medx-card" style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center', padding: '2.5rem' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: '#DCFCE7', borderRadius: '50%', color: '#15803D', marginBottom: '1rem' }}>
          <CheckCircle2 size={40} />
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--medx-navy)', marginBottom: '0.5rem' }}>
          Diagnostic Report Created!
        </h3>
        <p style={{ color: 'var(--medx-text-secondary)', marginBottom: '1.5rem' }}>
          Diagnostic Report <strong>{successResult.reportId}</strong> has been recorded successfully with status <strong>{successResult.status}</strong>.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            className="medx-btn medx-btn-secondary"
            onClick={() => {
              setSuccessResult(null);
              setParameters([
                { key: 'glucose_fasting', value: '', unit: 'mg/dL', ref_range: '70 - 99 mg/dL', status: 'Normal' },
                { key: 'hemoglobin', value: '', unit: 'g/dL', ref_range: '12.0 - 16.0 g/dL', status: 'Normal' }
              ]);
            }}
          >
            Create Another Report
          </button>
          <button
            className="medx-btn medx-btn-primary"
            onClick={() => {
              if (onReportCreated) onReportCreated(successResult);
            }}
            style={{ backgroundColor: '#EA580C', borderColor: '#EA580C' }}
          >
            View in Reports Inventory <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--medx-navy)' }}>
          Create Diagnostic Medical Report
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--medx-text-secondary)' }}>
          Direct diagnostic test entry into verified Med-X clinical records
        </p>
      </div>

      {error && (
        <div style={{
          padding: '0.875rem 1rem',
          borderRadius: 'var(--medx-radius-sm)',
          backgroundColor: '#FEE2E2',
          color: '#B91C1C',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Patient and Affiliation Section */}
        <div className="medx-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '1rem' }}>
            1. Patient & Institutional Affiliation
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Select Patient *
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  border: '1px solid var(--medx-border)',
                  borderRadius: 'var(--medx-radius-sm)',
                  fontSize: '0.875rem',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">-- Choose Registered Patient --</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.legacyId || 'ID'} • {p.gender} • {p.age ? `${p.age}y` : ''})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Affiliated Hospital (Optional)
              </label>
              <select
                value={selectedHospitalId}
                onChange={(e) => setSelectedHospitalId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  border: '1px solid var(--medx-border)',
                  borderRadius: 'var(--medx-radius-sm)',
                  fontSize: '0.875rem',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">-- Outpatient / No Facility Affiliation --</option>
                {hospitals.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.facilityName} ({h.legacyId || 'Facility'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Report Metadata Section */}
        <div className="medx-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '1rem' }}>
            2. Report Specifications & Lifecycle
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Report Title
              </label>
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  border: '1px solid var(--medx-border)',
                  borderRadius: 'var(--medx-radius-sm)',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  border: '1px solid var(--medx-border)',
                  borderRadius: 'var(--medx-radius-sm)',
                  fontSize: '0.875rem',
                  backgroundColor: '#fff'
                }}
              >
                <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                <option value="Comprehensive Metabolic Panel">Comprehensive Metabolic Panel</option>
                <option value="Lipid Profile">Lipid Profile</option>
                <option value="Blood Glucose / HbA1c">Blood Glucose / HbA1c</option>
                <option value="Renal Function Test (KFT)">Renal Function Test (KFT)</option>
                <option value="Liver Function Test (LFT)">Liver Function Test (LFT)</option>
                <option value="Thyroid Panel (TSH, T3, T4)">Thyroid Panel (TSH, T3, T4)</option>
                <option value="Urinalysis">Urinalysis</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Sample Collected At
              </label>
              <input
                type="datetime-local"
                value={sampleCollectedAt}
                onChange={(e) => setSampleCollectedAt(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  border: '1px solid var(--medx-border)',
                  borderRadius: 'var(--medx-radius-sm)',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Submission State
            </label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="radio"
                  name="status"
                  value="Finalized"
                  checked={status === 'Finalized'}
                  onChange={() => setStatus('Finalized')}
                />
                <strong>Finalized & Signed Off</strong> (Releases immediately to Patient & Doctor)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="radio"
                  name="status"
                  value="Draft"
                  checked={status === 'Draft'}
                  onChange={() => setStatus('Draft')}
                />
                <strong>Save as Draft</strong> (Work in progress, not yet finalized)
              </label>
            </div>
          </div>
        </div>

        {/* Biomarkers Table Section */}
        <div className="medx-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                3. Biomarker Results & Reference Context
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)' }}>
                Standardized biomarker and parameter documentation
              </p>
            </div>
            <button
              type="button"
              className="medx-btn medx-btn-secondary"
              onClick={handleAddCustomRow}
              style={{ fontSize: '0.8125rem' }}
            >
              <Plus size={14} /> Add Custom Marker
            </button>
          </div>

          {/* Quick presets buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', alignSelf: 'center', marginRight: '0.25rem' }}>
              Quick Presets:
            </span>
            {COMMON_PRESETS.map((pr) => (
              <button
                key={pr.key}
                type="button"
                onClick={() => handleAddPreset(pr)}
                disabled={parameters.some((p) => p.key === pr.key)}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  border: '1px solid var(--medx-border)',
                  backgroundColor: parameters.some((p) => p.key === pr.key) ? '#F1F5F9' : '#fff',
                  cursor: parameters.some((p) => p.key === pr.key) ? 'default' : 'pointer',
                  opacity: parameters.some((p) => p.key === pr.key) ? 0.6 : 1
                }}
              >
                + {pr.label}
              </button>
            ))}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--medx-border)', backgroundColor: '#F8FAFC', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>Biomarker Key</th>
                  <th style={{ padding: '0.5rem', width: '130px' }}>Result Value</th>
                  <th style={{ padding: '0.5rem', width: '100px' }}>Unit</th>
                  <th style={{ padding: '0.5rem' }}>Reference Range</th>
                  <th style={{ padding: '0.5rem', width: '120px' }}>Status</th>
                  <th style={{ padding: '0.5rem', width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {parameters.map((param, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--medx-border)' }}>
                    <td style={{ padding: '0.5rem' }}>
                      <input
                        type="text"
                        value={param.key}
                        onChange={(e) => handleParamChange(idx, 'key', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.5rem',
                          border: '1px solid var(--medx-border)',
                          borderRadius: '4px',
                          fontSize: '0.8125rem'
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input
                        type="number"
                        step="any"
                        placeholder="Value"
                        value={param.value}
                        onChange={(e) => handleParamChange(idx, 'value', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.5rem',
                          border: '1px solid var(--medx-border)',
                          borderRadius: '4px',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input
                        type="text"
                        value={param.unit}
                        onChange={(e) => handleParamChange(idx, 'unit', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.5rem',
                          border: '1px solid var(--medx-border)',
                          borderRadius: '4px',
                          fontSize: '0.8125rem'
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input
                        type="text"
                        value={param.ref_range}
                        onChange={(e) => handleParamChange(idx, 'ref_range', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.5rem',
                          border: '1px solid var(--medx-border)',
                          borderRadius: '4px',
                          fontSize: '0.8125rem'
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <select
                        value={param.status}
                        onChange={(e) => handleParamChange(idx, 'status', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.5rem',
                          border: '1px solid var(--medx-border)',
                          borderRadius: '4px',
                          fontSize: '0.8125rem',
                          backgroundColor: '#fff'
                        }}
                      >
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Low">Low</option>
                        <option value="Critical">Critical</option>
                        <option value="Borderline">Borderline</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveParam(idx)}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                        title="Remove marker"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes & Submission */}
        <div className="medx-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.75rem' }}>
            4. Clinical Observations & Laboratory Notes
          </h3>
          <textarea
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter technician observations, sample condition notes, or instrumentation details..."
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--medx-border)',
              borderRadius: 'var(--medx-radius-sm)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="submit"
              className="medx-btn medx-btn-primary"
              disabled={submitting}
              style={{
                backgroundColor: '#EA580C',
                borderColor: '#EA580C',
                padding: '0.625rem 1.5rem',
                fontSize: '0.9375rem'
              }}
            >
              {submitting ? 'Persisting to Unified Database...' : status === 'Finalized' ? 'Sign Off & Finalize Report' : 'Save Draft Report'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
