import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Users, Search, FileText, ArrowRight } from 'lucide-react';

const DoctorPatients = () => {
  const { token, API_HOST } = useAuth();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPatients = async (query = '') => {
    try {
      setLoading(true);
      const res = await fetch(`${API_HOST}/api/doctor/patients?search=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setPatients(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPatients(search);
  }, [token, API_HOST]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-strong)' }}>
            My Assigned Patients
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Direct clinical cohort under your medical oversight and care management
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px', width: '280px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name..."
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Loading cohort...</p>
        ) : patients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Users size={40} color="var(--accent-1)" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 700, color: 'var(--text-strong)' }}>No patients assigned yet.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Patients will appear here once intake staff assign them to your clinic.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Contact Email</th>
                  <th>Demographics</th>
                  <th>Latest Risk Tier</th>
                  <th>Composite Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => {
                  const riskTier = p.latestReport?.latestRiskTier || 'N/A';
                  const riskScore = p.latestReport?.latestRiskScore ?? '--';
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-strong)' }}>{p.name}</td>
                      <td>{p.email}</td>
                      <td>{p.gender || '--'} {p.dob ? `(${new Date(p.dob).toLocaleDateString()})` : ''}</td>
                      <td>
                        {riskTier !== 'N/A' ? (
                          <span className={`badge badge-${riskTier.toLowerCase()}`}>
                            {riskTier}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No Reports</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 800 }}>{riskScore !== '--' ? `${riskScore}/100` : '--'}</td>
                      <td>
                        <Link to={`/medical-records?patientId=${p.id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                          <FileText size={14} />
                          Medical Records
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatients;
