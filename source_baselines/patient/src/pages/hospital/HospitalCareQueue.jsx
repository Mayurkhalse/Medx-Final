import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ListOrdered, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

const HospitalCareQueue = () => {
  const { token, API_HOST } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_HOST}/api/hospital/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.careQueue) {
        setItems(data.careQueue);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchQueue();
  }, [token, API_HOST]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-strong)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ListOrdered size={28} color="var(--accent-1)" />
          Prioritized Patient Care Queue
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Automatic triage queue populated when patient biomarkers reflect High or Critical disease risk tiers
        </p>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Loading Care Queue entries...</p>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <CheckCircle2 size={40} color="var(--flag-success)" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 700, color: 'var(--text-strong)' }}>Care Queue is clear.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No patients currently flagged for acute triage review.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Risk Tier</th>
                  <th>Status</th>
                  <th>Logged Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td style={{ fontWeight: 700 }}>{item.patientId?.name || 'Patient'}</td>
                    <td>
                      <span className={`badge badge-${item.riskTier?.toLowerCase()}`}>
                        {item.riskTier} RISK
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{item.status}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                    <td>
                      <button
                        onClick={() => alert(`Reviewing patient care protocol for ${item.patientId?.name || 'Patient'}`)}
                        className="btn btn-primary btn-sm"
                      >
                        Initiate Protocol
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalCareQueue;
