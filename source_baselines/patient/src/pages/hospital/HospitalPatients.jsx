import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Users, User, ShieldAlert, Calendar } from 'lucide-react';

const HospitalPatients = () => {
  const { token, API_HOST } = useAuth();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPatients = async (query = '') => {
    try {
      setLoading(true);
      const res = await fetch(`${API_HOST}/api/hospital/patients?search=${encodeURIComponent(query)}`, {
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients(search);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-strong)' }}>
            Patient Registry
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Comprehensive directory of patients under facility care and risk stratifications
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px', width: '280px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Loading patient registry...</p>
        ) : patients.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No patients found.</p>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Contact Email</th>
                  <th>Gender / DOB</th>
                  <th>Assigned Physician</th>
                  <th>Latest Risk Tier</th>
                  <th>Risk Score</th>
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
                      <td>{p.assignedDoctor?.specialty ? `Dr. (Spec: ${p.assignedDoctor.specialty})` : 'Unassigned'}</td>
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

export default HospitalPatients;
