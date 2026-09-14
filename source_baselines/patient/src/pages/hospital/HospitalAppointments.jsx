import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CalendarDays, Check, X, Clock } from 'lucide-react';

const HospitalAppointments = () => {
  const { token, API_HOST } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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
    try {
      await fetch(`${API_HOST}/api/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      fetchAppointments();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-strong)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarDays size={28} color="var(--accent-1)" />
          Hospital Appointment Master Calendar
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Facility-wide clinical appointment bookings, doctor scheduling, and status tracking
        </p>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Loading appointment schedule...</p>
        ) : appointments.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>No appointments booked across facility.</p>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Attending Physician</th>
                  <th>Scheduled Date & Time</th>
                  <th>Clinical Reason</th>
                  <th>Status</th>
                  <th>Manage Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{apt.patientId?.name || 'Patient'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.patientId?.email}</div>
                    </td>
                    <td>Dr. {apt.doctorId?.userId?.name || 'Physician'}</td>
                    <td style={{ fontWeight: 600 }}>{new Date(apt.scheduledAt).toLocaleString()}</td>
                    <td>{apt.reason || 'General Checkup'}</td>
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
                            Confirm
                          </button>
                        )}
                        {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                          <button
                            onClick={() => updateStatus(apt._id, 'completed')}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            Complete
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

export default HospitalAppointments;
