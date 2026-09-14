import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

const DoctorEmergencySOS = () => {
  const { token, API_HOST } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_HOST}/api/emergency`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAlerts();
  }, [token, API_HOST]);

  const handleAcknowledge = async (id) => {
    try {
      await fetch(`${API_HOST}/api/emergency/${id}/ack`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolve = async (id) => {
    const notes = prompt('Enter clinical resolution notes:') || 'Physician contacted patient and resolved distress situation.';
    try {
      await fetch(`${API_HOST}/api/emergency/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ resolutionNotes: notes })
      });
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-strong)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={28} color="var(--flag-critical)" />
          Physician Emergency SOS Queue
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Immediate notifications broadcasted when assigned patients activate the distress beacon
        </p>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Checking for emergency broadcasts...</p>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <CheckCircle size={40} color="var(--flag-success)" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 700, color: 'var(--text-strong)' }}>All SOS queues clear.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active distress alerts logged by your patient cohort.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Status</th>
                  <th>Distress Description</th>
                  <th>Timestamp</th>
                  <th>Clinical Resolution</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={a._id} style={{ backgroundColor: a.status === 'open' ? 'var(--flag-critical-light)' : 'transparent' }}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{a.patientId?.name || 'Patient'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.patientId?.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${a.status === 'open' ? 'badge-critical' : a.status === 'acknowledged' ? 'badge-warning' : 'badge-low'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>{a.triggerReason}</td>
                    <td>{new Date(a.createdAt).toLocaleString()}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.resolutionNotes || '--'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {a.status === 'open' && (
                          <button
                            onClick={() => handleAcknowledge(a._id)}
                            className="btn btn-secondary btn-sm"
                          >
                            Acknowledge
                          </button>
                        )}
                        {a.status !== 'resolved' && (
                          <button
                            onClick={() => handleResolve(a._id)}
                            className="btn btn-primary btn-sm"
                          >
                            Resolve Case
                          </button>
                        )}
                      </div>
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

export default DoctorEmergencySOS;
