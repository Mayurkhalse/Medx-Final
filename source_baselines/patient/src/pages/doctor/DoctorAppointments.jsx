import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';

const DoctorAppointments = () => {
  const { token, API_HOST } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_HOST}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setAppointments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAppointments();
  }, [token, API_HOST]);

  const updateStatus = async (id, status) => {
    let notes = undefined;
    if (status === 'completed') {
      notes = prompt('Enter clinical consultation summary notes:') || '';
    }

    try {
      await fetch(`${API_HOST}/api/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes })
      });
      fetchAppointments();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = appointments.filter((a) => {
    if (filter === 'requested') return a.status === 'requested';
    if (filter === 'confirmed') return a.status === 'confirmed';
    if (filter === 'completed') return a.status === 'completed';
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-strong)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={28} color="var(--accent-1)" />
            Clinical Appointments
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage scheduled patient consultations, intake requests, and clinical notes
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'requested', 'confirmed', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Loading appointment roster...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No appointments matching current filter.</p>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Scheduled Time</th>
                  <th>Reason / Chief Complaint</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((apt) => (
                  <tr key={apt._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{apt.patientId?.name || 'Patient'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.patientId?.email}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{new Date(apt.scheduledAt).toLocaleString()}</td>
                    <td>{apt.reason || 'General Consultation'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{apt.notes || '--'}</td>
                    <td>
                      <span className={`badge ${apt.status === 'confirmed' ? 'badge-low' : apt.status === 'requested' ? 'badge-warning' : apt.status === 'completed' ? 'badge-low' : 'badge-danger'}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {apt.status === 'requested' && (
                          <button
                            onClick={() => updateStatus(apt._id, 'confirmed')}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            Accept
                          </button>
                        )}
                        {apt.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(apt._id, 'completed')}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            Complete & Note
                          </button>
                        )}
                        {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                          <button
                            onClick={() => updateStatus(apt._id, 'cancelled')}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                            title="Cancel appointment"
                          >
                            <XCircle size={16} />
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

export default DoctorAppointments;
