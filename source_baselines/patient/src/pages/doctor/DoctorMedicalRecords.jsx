import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { FileText, User, Activity, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DoctorMedicalRecords = () => {
  const { token, API_HOST } = useAuth();
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(searchParams.get('patientId') || '');
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`${API_HOST}/api/doctor/patients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setPatients(data);
          if (!selectedPatientId && data.length > 0) {
            setSelectedPatientId(data[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (token) fetchPatients();
  }, [token, API_HOST]);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!selectedPatientId) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_HOST}/api/doctor/patients/${selectedPatientId}/records`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setRecords(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (token && selectedPatientId) fetchRecords();
  }, [selectedPatientId, token, API_HOST]);

  const trendData = records?.reports
    ? records.reports.slice().reverse().map((r) => {
        const entry = {
          date: new Date(r.reportDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          riskScore: r.mlResult.overallRiskScore
        };
        if (r.parameters) {
          for (const [k, v] of Object.entries(
            r.parameters instanceof Map ? Object.fromEntries(r.parameters) : r.parameters
          )) {
            entry[k] = v.value;
          }
        }
        return entry;
      })
    : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-strong)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={28} color="var(--accent-1)" />
            Patient Longitudinal Records
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Chronological biomarker trajectories, clinical flags, and predictive diagnostics
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label className="form-label" style={{ margin: 0 }}>Select Patient:</label>
          <select
            className="form-input"
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            style={{ width: '240px' }}
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading patient record history...</p>
        </div>
      ) : !records?.patient ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <User size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Select a patient from your assigned cohort above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Patient Header Card */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                {records.patient.name}
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Email: {records.patient.email} &bull; Gender: {records.patient.gender || 'N/A'} &bull; DOB: {records.patient.dob ? new Date(records.patient.dob).toLocaleDateString() : 'N/A'}
              </div>
            </div>

            <div>
              <span className="badge badge-low" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                {records.reports?.length || 0} Total Logged Panels
              </span>
            </div>
          </div>

          {/* Longitudinal Chart */}
          <div className="card" style={{ minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-strong)' }}>
              Biomarker Risk Score Evolution
            </h3>
            <div style={{ flex: 1, minHeight: '240px' }}>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="riskScore" stroke="#6d28d9" strokeWidth={3} activeDot={{ r: 6 }} name="Composite Risk" />
                    <Line type="monotone" dataKey="glucose_fasting" stroke="#f59e0b" strokeWidth={2} name="Glucose (mg/dL)" />
                    <Line type="monotone" dataKey="hemoglobin" stroke="#0284c7" strokeWidth={2} name="Hemoglobin (g/dL)" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                  No historical test data logged for this patient.
                </div>
              )}
            </div>
          </div>

          {/* Historical Panels Table */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-strong)' }}>
              Individual Lab Panels
            </h3>

            {records.reports?.map((rep) => (
              <div key={rep._id} style={{ border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--text-strong)' }}>
                      Report Date: {new Date(rep.reportDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '12px' }}>
                      Source: {rep.sourceType}
                    </span>
                  </div>
                  <span className={`badge badge-${rep.mlResult.riskTier.toLowerCase()}`}>
                    {rep.mlResult.riskTier} Tier ({rep.mlResult.overallRiskScore}/100)
                  </span>
                </div>

                <div className="parameters-list">
                  {Object.entries(
                    rep.parameters instanceof Map ? Object.fromEntries(rep.parameters) : rep.parameters || {}
                  ).map(([key, item]) => {
                    const flag = (rep.mlResult?.flags && (rep.mlResult.flags[key] || rep.mlResult.flags.get?.(key))) || 'normal';
                    return (
                      <div key={key} className={`parameter-item ${flag}`} style={{ padding: '8px 12px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorMedicalRecords;
