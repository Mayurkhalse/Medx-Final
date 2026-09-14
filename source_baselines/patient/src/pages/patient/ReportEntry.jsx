import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, ArrowLeft, Upload, Send } from 'lucide-react';

const ReportEntry = () => {
  const { token, API_HOST } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manual');

  // Manual form state
  const [glucose, setGlucose] = useState('90');
  const [hemoglobin, setHemoglobin] = useState('14.2');
  const [wbc, setWbc] = useState('6800');
  const [creatinine, setCreatinine] = useState('0.95');
  const [platelets, setPlatelets] = useState('260000');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // File upload state
  const [file, setFile] = useState(null);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const parameters = {
      glucose_fasting: { value: parseFloat(glucose), unit: 'mg/dL', ref_range: '70-100' },
      hemoglobin: { value: parseFloat(hemoglobin), unit: 'g/dL', ref_range: '12-17' },
      wbc_count: { value: parseFloat(wbc), unit: '/uL', ref_range: '4000-11000' },
      creatinine: { value: parseFloat(creatinine), unit: 'mg/dL', ref_range: '0.6-1.3' },
      platelets: { value: parseFloat(platelets), unit: '/uL', ref_range: '150000-450000' }
    };

    try {
      const response = await fetch(`${API_HOST}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ parameters, reportDate })
      });

      if (response.ok) {
        navigate('/');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to submit report');
      }
    } catch (err) {
      setError('Connection to health server failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a lab report PDF file to upload');
      return;
    }

    setError('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('report', file);

    try {
      const response = await fetch(`${API_HOST}/api/reports/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        navigate('/');
      } else {
        const data = await response.json();
        setError(data.message || 'Error processing uploaded lab report');
      }
    } catch (err) {
      setError('Connection to health server failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-strong)' }}>
          Record Clinical Biomarkers
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manually enter recent laboratory parameters or upload a diagnostic PDF report
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--flag-critical-light)', color: 'var(--flag-critical)', padding: '12px 18px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`btn ${activeTab === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <FileText size={16} />
          Manual Entry
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Upload size={16} />
          PDF Lab Upload
        </button>
      </div>

      {activeTab === 'manual' ? (
        <form onSubmit={handleManualSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-strong)' }}>
            Biomarker Values
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Fasting Glucose (mg/dL)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Normal range: 70 - 100 mg/dL</span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Hemoglobin (g/dL)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={hemoglobin}
                onChange={(e) => setHemoglobin(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Normal range: 12 - 17 g/dL</span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">White Blood Cells (/uL)</label>
              <input
                type="number"
                step="1"
                className="form-input"
                value={wbc}
                onChange={(e) => setWbc(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Normal range: 4000 - 11000 /uL</span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Serum Creatinine (mg/dL)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={creatinine}
                onChange={(e) => setCreatinine(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Normal range: 0.6 - 1.3 mg/dL</span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Platelet Count (/uL)</label>
              <input
                type="number"
                step="1000"
                className="form-input"
                value={platelets}
                onChange={(e) => setPlatelets(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Normal range: 150000 - 450000 /uL</span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Test Date</label>
              <input
                type="date"
                className="form-input"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={submitting}>
            <Send size={18} />
            {submitting ? 'Running ML Inference...' : 'Analyze & Save Biomarkers'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleFileUpload} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-strong)' }}>
            Upload Diagnostic PDF
          </h2>

          <div className="dropzone" onClick={() => document.getElementById('pdf-file-input').click()}>
            <Upload size={36} color="var(--accent-1)" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-strong)' }}>
              {file ? file.name : 'Click to select or drag and drop your blood report PDF'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
              Standard lab PDF format (CBC, Metabolic Panel, Lipid Profiles)
            </p>
            <input
              id="pdf-file-input"
              type="file"
              accept=".pdf,text/plain"
              style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={submitting}>
            <Upload size={18} />
            {submitting ? 'Parsing PDF & Evaluating...' : 'Upload & Process Lab Report'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ReportEntry;
