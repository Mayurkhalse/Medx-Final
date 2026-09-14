import React, { useState, useEffect } from 'react';
import {
  Stethoscope, RefreshCw, UserPlus, Phone,
  Mail, Shield, Award, X
} from 'lucide-react';
import hospitalService from '../../services/hospitalService.js';

export default function HospitalDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);

  // Assignment Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [assignPatientId, setAssignPatientId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hospitalService.getDoctors();
      if (res.success) {
        setDoctors(res.doctors || []);
      }
    } catch (err) {
      console.error('Error loading hospital doctors:', err);
      setError('Failed to fetch hospital physician staff directory.');
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const res = await hospitalService.getPatients({ limit: 100 });
      if (res.success) setPatients(res.patients || []);
    } catch (err) {
      console.error('Error loading patients:', err);
    }
  };

  useEffect(() => {
    loadDoctors();
    loadPatients();
  }, []);

  const handleOpenAssign = (doctor) => {
    setSelectedDoctor(doctor);
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssignment = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !assignPatientId) return;

    try {
      setSubmitting(true);
      const res = await hospitalService.assignDoctor({
        doctorId: selectedDoctor._id,
        patientId: assignPatientId
      });
      if (res.success) {
        setIsAssignModalOpen(false);
        setSelectedDoctor(null);
        setAssignPatientId('');
        loadDoctors();
      }
    } catch (err) {
      console.error('Error assigning doctor:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
            Hospital Medical Staff & Physician Roster
          </h2>
          <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Institutional clinicians, department specializations, and inpatient coverage
          </p>
        </div>
        <button
          className="medx-btn medx-btn-secondary"
          onClick={loadDoctors}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div className="medx-card" style={{ borderLeft: '4px solid #EF4444', padding: '1rem' }}>
          <p style={{ color: '#EF4444', margin: 0, fontWeight: 600 }}>{error}</p>
        </div>
      )}

      {/* Doctor Cards Grid */}
      {doctors.length === 0 ? (
        <div className="medx-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--medx-text-secondary)' }}>
          <Stethoscope size={36} color="#94A3B8" style={{ marginBottom: '0.5rem' }} />
          <p>No physician staff currently affiliated with this hospital facility.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.25rem'
        }}>
          {doctors.map((d) => (
            <div
              key={d._id}
              className="medx-card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                      Dr. {d.userId?.name || 'Physician'}
                    </h3>
                    <p style={{ color: 'var(--medx-teal)', fontSize: '0.8125rem', fontWeight: 600, margin: '0.25rem 0 0 0' }}>
                      {d.specialty || 'General Practice'}
                    </p>
                  </div>
                  <span className={`medx-badge ${d.availabilityStatus === 'Available' ? 'medx-badge-success' : 'medx-badge-warning'}`} style={{ fontSize: '0.6875rem' }}>
                    {d.availabilityStatus || 'On Duty'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '1rem', fontSize: '0.8125rem', color: '#64748B' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={14} />
                    <span><strong>Qualification:</strong> {d.qualification || 'MBBS'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={14} />
                    <span><strong>Department:</strong> {d.department || 'General Medicine'}</span>
                  </div>
                  {d.userId?.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={14} />
                      <span>{d.userId.email}</span>
                    </div>
                  )}
                  {d.userId?.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={14} />
                      <span>{d.userId.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                <button
                  className="medx-btn medx-btn-primary"
                  onClick={() => handleOpenAssign(d)}
                  style={{ width: '100%', fontSize: '0.8125rem', padding: '0.375rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}
                >
                  <UserPlus size={14} /> Assign to Inpatient
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doctor Assignment Modal */}
      {isAssignModalOpen && selectedDoctor && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="medx-card" style={{ maxWidth: '450px', width: '100%', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                Assign Dr. {selectedDoctor.userId?.name}
              </h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--medx-navy)' }}>
                  Select Inpatient *
                </label>
                <select
                  required
                  value={assignPatientId}
                  onChange={(e) => setAssignPatientId(e.target.value)}
                  className="medx-input"
                >
                  <option value="">Choose Inpatient...</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.userId?.name || p.legacyId} ({p.status})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="medx-btn medx-btn-secondary"
                  onClick={() => setIsAssignModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="medx-btn medx-btn-primary"
                >
                  {submitting ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
