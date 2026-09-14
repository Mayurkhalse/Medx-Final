import React, { useState } from 'react';
import api from '../../services/api.js';
import { FileText, Upload, PlusCircle, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function PatientReportEntry({ onReportCreated }) {
  const [activeTab, setActiveTab] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Manual biomarker form fields
  const [reportName, setReportName] = useState('Routine Blood Panel');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [glucose, setGlucose] = useState('88');
  const [hemoglobin, setHemoglobin] = useState('14.2');
  const [wbc, setWbc] = useState('6800');
  const [creatinine, setCreatinine] = useState('0.95');
  const [platelets, setPlatelets] = useState('260000');

  // PDF file state
  const [file, setFile] = useState(null);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const parameters = {
        glucose_fasting: { value: parseFloat(glucose), unit: 'mg/dL', ref_range: '70-100' },
        hemoglobin: { value: parseFloat(hemoglobin), unit: 'g/dL', ref_range: '12-17' },
        wbc_count: { value: parseFloat(wbc), unit: '/uL', ref_range: '4000-11000' },
        creatinine: { value: parseFloat(creatinine), unit: 'mg/dL', ref_range: '0.6-1.3' },
        platelets: { value: parseFloat(platelets), unit: '/uL', ref_range: '150000-450000' }
      };

      const res = await api.post('/reports', {
        reportName,
        reportDate,
        reportType: 'Complete Blood Count (CBC)',
        parameters
      });

      setSuccess(`Report "${res.data.reportName || 'Diagnostic Report'}" successfully created with ID ${res.data.reportId || res.data._id}!`);
      if (onReportCreated) onReportCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to submit manual report.');
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF diagnostic report to upload.');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('report', file);

    try {
      const res = await api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(`Lab report "${file.name}" successfully parsed and ingested! Extracted biomarkers recorded.`);
      setFile(null);
      if (onReportCreated) onReportCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to process lab PDF upload.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medx-card" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--medx-border)', paddingBottom: '1rem' }}>
        <div style={{ backgroundColor: 'var(--medx-primary-light)', padding: '0.5rem', borderRadius: 'var(--medx-radius-md)', color: 'var(--medx-primary)' }}>
          <FileText size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--medx-navy)' }}>
            Log Diagnostic Medical Report
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--medx-text-secondary)' }}>
            Ingest lab panels via direct manual biomarker entry or automated PDF document parsing.
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: 'var(--medx-surface-muted)', padding: '0.25rem', borderRadius: 'var(--medx-radius-md)' }}>
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            borderRadius: 'var(--medx-radius-sm)',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            backgroundColor: activeTab === 'manual' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'manual' ? 'var(--medx-primary)' : 'var(--medx-text-secondary)',
            boxShadow: activeTab === 'manual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <PlusCircle size={18} />
          Manual Biomarker Entry
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            borderRadius: 'var(--medx-radius-sm)',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            backgroundColor: activeTab === 'upload' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'upload' ? 'var(--medx-primary)' : 'var(--medx-text-secondary)',
            boxShadow: activeTab === 'upload' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Upload size={18} />
          Upload Lab PDF
        </button>
      </div>

      {/* Status Alerts */}
      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          border: '1px solid #F87171',
          color: '#B91C1C',
          padding: '0.875rem 1.25rem',
          borderRadius: 'var(--medx-radius-md)',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#ECFDF5',
          border: '1px solid #6EE7B7',
          color: '#047857',
          padding: '0.875rem 1.25rem',
          borderRadius: 'var(--medx-radius-md)',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Manual Entry Form */}
      {activeTab === 'manual' && (
        <form onSubmit={handleManualSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-text-secondary)', marginBottom: '0.375rem' }}>
                Report Title
              </label>
              <input
                type="text"
                className="medx-input"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="e.g. Complete Blood Panel"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-text-secondary)', marginBottom: '0.375rem' }}>
                Observation Date
              </label>
              <input
                type="date"
                className="medx-input"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--medx-surface-muted)', padding: '1rem', borderRadius: 'var(--medx-radius-md)', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--medx-navy)', marginBottom: '0.75rem' }}>
              Standard Blood Biomarkers
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Fasting Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="medx-input"
                  value={glucose}
                  onChange={(e) => setGlucose(e.target.value)}
                  placeholder="Ref: 70 - 100"
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-muted)' }}>Normal: 70-100 mg/dL</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Hemoglobin (g/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="medx-input"
                  value={hemoglobin}
                  onChange={(e) => setHemoglobin(e.target.value)}
                  placeholder="Ref: 12 - 17"
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-muted)' }}>Normal: 12-17 g/dL</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  WBC Count (/uL)
                </label>
                <input
                  type="number"
                  step="100"
                  className="medx-input"
                  value={wbc}
                  onChange={(e) => setWbc(e.target.value)}
                  placeholder="Ref: 4000 - 11000"
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-muted)' }}>Normal: 4,000-11,000 /uL</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Serum Creatinine (mg/dL)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="medx-input"
                  value={creatinine}
                  onChange={(e) => setCreatinine(e.target.value)}
                  placeholder="Ref: 0.6 - 1.3"
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-muted)' }}>Normal: 0.6-1.3 mg/dL</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Platelet Count (/uL)
                </label>
                <input
                  type="number"
                  step="1000"
                  className="medx-input"
                  value={platelets}
                  onChange={(e) => setPlatelets(e.target.value)}
                  placeholder="Ref: 150000 - 450000"
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-muted)' }}>Normal: 150,000-450,000 /uL</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={loading}
              className="medx-button medx-button-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
              {loading ? 'Evaluating & Saving...' : 'Save Diagnostic Report'}
            </button>
          </div>
        </form>
      )}

      {/* PDF Upload Form */}
      {activeTab === 'upload' && (
        <form onSubmit={handlePdfUpload}>
          <div
            style={{
              border: '2px dashed var(--medx-border)',
              borderRadius: 'var(--medx-radius-md)',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              backgroundColor: '#FAFAFA',
              marginBottom: '1.5rem',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('medx-pdf-input').click()}
          >
            <input
              id="medx-pdf-input"
              type="file"
              accept=".pdf,application/pdf"
              style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--medx-primary-light)',
              color: 'var(--medx-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <Upload size={24} />
            </div>

            {file ? (
              <div>
                <p style={{ fontWeight: 600, color: 'var(--medx-navy)', fontSize: '0.9375rem' }}>
                  {file.name}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', marginTop: '0.25rem' }}>
                  {(file.size / 1024).toFixed(1)} KB — Ready to parse
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontWeight: 600, color: 'var(--medx-navy)', fontSize: '0.9375rem' }}>
                  Click or drag and drop laboratory report PDF
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', marginTop: '0.25rem' }}>
                  Automated regex extraction will identify Fasting Glucose, Hemoglobin, WBC, Creatinine, and Platelets.
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={loading || !file}
              className="medx-button medx-button-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              {loading ? 'Parsing PDF & Analyzing...' : 'Upload & Parse PDF'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
