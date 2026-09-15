import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, Plus, Eye, Pill, Phone,
  AlertCircle, CheckCircle2, UserPlus, RefreshCw, X
} from 'lucide-react';
import api from '../../services/api.js';

export function DoctorPatients({ onSelectPatient, onOpenCall, onOpenPrescription }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');

  // New Patient Enrollment Modal State
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollData, setEnrollData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dateOfBirth: '1985-06-15',
    bloodGroup: 'O+',
    currentCondition: 'Routine Health Monitoring & Vitals Check',
    vitalSigns: {
      bloodPressure: '120/80 mmHg',
      heartRate: '72 bpm',
      temperature: '98.6 °F',
      spo2: '99%'
    }
  });
  const [enrollSaving, setEnrollSaving] = useState(false);
  const [enrollError, setEnrollError] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctor/patients');
      setPatients(res.data || []);
    } catch (err) {
      console.error('Failed to fetch doctor patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    setEnrollError('');
    if (!enrollData.name.trim()) {
      setEnrollError('Patient full name is required');
      return;
    }

    try {
      setEnrollSaving(true);
      const res = await api.post('/doctor/patients', enrollData);
      setShowEnrollModal(false);
      setEnrollData({
        name: '',
        email: '',
        phone: '',
        gender: 'Male',
        dateOfBirth: '1985-06-15',
        bloodGroup: 'O+',
        currentCondition: 'Routine Health Monitoring & Vitals Check',
        vitalSigns: {
          bloodPressure: '120/80 mmHg',
          heartRate: '72 bpm',
          temperature: '98.6 °F',
          spo2: '99%'
        }
      });
      fetchPatients();
      // Auto open newly enrolled patient dossier
      if (res.data?._id) {
        const fullPatient = await api.get(`/doctor/patients/${res.data._id}`);
        onSelectPatient(fullPatient.data);
      }
    } catch (err) {
      console.error('Failed to enroll patient:', err);
      setEnrollError(err.response?.data?.error?.message || err.message || 'Failed to enroll patient');
    } finally {
      setEnrollSaving(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    const matchSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.currentCondition || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchGender = genderFilter === 'ALL' || p.gender === genderFilter;
    return matchSearch && matchStatus && matchGender;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Controls Header */}
      <div className="medx-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
              Clinical Patient Roster
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: '0.25rem 0 0 0' }}>
              Authorized patients assigned to your care or affiliated facility
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              className="medx-btn medx-btn-secondary"
              onClick={fetchPatients}
              disabled={loading}
              style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>
            <button
              type="button"
              className="medx-btn medx-btn-primary"
              onClick={() => setShowEnrollModal(true)}
              style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <UserPlus size={16} /> Enroll New Patient
            </button>
          </div>
        </div>

        {/* Search & Filter Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '3fr 1fr 1fr',
          gap: '0.75rem',
          marginTop: '1.25rem'
        }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="medx-input"
              style={{ width: '100%', paddingLeft: '2.25rem' }}
              placeholder="Search patients by name, patient ID, condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="medx-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Critical">Critical</option>
            <option value="Waiting">Waiting</option>
            <option value="In Consultation">In Consultation</option>
          </select>

          <select
            className="medx-input"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="ALL">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Patient Table */}
      <div className="medx-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: 'var(--medx-text-secondary)' }}>
              <th style={{ padding: '0.875rem 1.25rem', fontWeight: 600 }}>Patient Details</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>Demographics</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>Vital Signs</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>Clinical History</th>
              <th style={{ padding: '0.875rem 1.25rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--medx-text-secondary)' }}>
                  Loading clinical patient roster...
                </td>
              </tr>
            ) : filteredPatients.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--medx-text-secondary)' }}>
                  No patients match your search filters.
                </td>
              </tr>
            ) : (
              filteredPatients.map((p, idx) => {
                const isCritical = p.status === 'Critical';
                const vitals = p.vitalSigns || {};
                return (
                  <tr
                    key={p._id || idx}
                    style={{
                      borderBottom: idx < filteredPatients.length - 1 ? '1px solid #F1F5F9' : 'none',
                      backgroundColor: isCritical ? '#FFF5F5' : 'transparent',
                      transition: 'background-color 0.15s'
                    }}
                  >
                    {/* Patient Name & ID */}
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--medx-navy)', fontSize: '0.9375rem' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', marginTop: '0.125rem' }}>
                        ID: <strong>{p.id}</strong> • {p.email}
                      </div>
                    </td>

                    {/* Demographics */}
                    <td style={{ padding: '0.875rem 1rem', color: '#475569', fontSize: '0.8125rem' }}>
                      <div>{p.gender} • {p.age} yrs</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Blood Group: <strong>{p.bloodGroup || 'O+'}</strong></div>
                    </td>

                    {/* Vitals */}
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#334155' }}>
                      <div>BP: <strong>{vitals.bloodPressure || '120/80'}</strong></div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        HR: {typeof vitals.heartRate === 'number' ? `${vitals.heartRate} bpm` : (vitals.heartRate || '72 bpm')}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className="medx-badge" style={{
                        backgroundColor: isCritical ? '#FEE2E2' : '#EFF6FF',
                        color: isCritical ? '#DC2626' : '#1D4ED8',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {p.status || 'Active'}
                      </span>
                    </td>

                    {/* Clinical History */}
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#475569' }}>
                      <div style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.currentCondition || 'Routine Monitoring'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        Rx: {p.prescriptionsCount || 0} • Notes: {p.clinicalNotesCount || 0}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        <button
                          type="button"
                          className="medx-btn medx-btn-secondary"
                          style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          onClick={async () => {
                            try {
                              const res = await api.get(`/doctor/patients/${p._id || p.id}`);
                              onSelectPatient(res.data);
                            } catch (err) {
                              alert('Failed to load dossier: ' + (err.response?.data?.error?.message || err.message));
                            }
                          }}
                          title="View Patient Clinical Dossier"
                        >
                          <Eye size={13} /> Dossier
                        </button>

                        <button
                          type="button"
                          className="medx-btn"
                          style={{
                            backgroundColor: '#10B981',
                            color: '#FFFFFF',
                            padding: '0.375rem 0.625rem',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                          onClick={async () => {
                            try {
                              const res = await api.get(`/doctor/patients/${p._id || p.id}`);
                              onOpenCall(res.data);
                            } catch (err) {
                              onOpenCall(p);
                            }
                          }}
                          title="Consultation Call"
                        >
                          <Phone size={13} /> Call
                        </button>

                        <button
                          type="button"
                          className="medx-btn"
                          style={{
                            backgroundColor: 'var(--medx-teal)',
                            color: '#FFFFFF',
                            padding: '0.375rem 0.625rem',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                          onClick={() => onOpenPrescription(p)}
                          title="Author Digital Prescription"
                        >
                          <Pill size={13} /> Rx
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Enroll Patient Modal */}
      {showEnrollModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--medx-radius-lg)',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#F8FAFC'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} color="var(--medx-teal)" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                  Enroll New Patient in Clinical Care
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {enrollError && (
                <div style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', padding: '0.75rem', borderRadius: 'var(--medx-radius-sm)', fontSize: '0.8125rem' }}>
                  {enrollError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.25rem' }}>Full Name *</label>
                  <input
                    type="text"
                    className="medx-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. Johnathan Doe"
                    value={enrollData.name}
                    onChange={(e) => setEnrollData({ ...enrollData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.25rem' }}>Email Address</label>
                  <input
                    type="email"
                    className="medx-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. john.doe@example.com"
                    value={enrollData.email}
                    onChange={(e) => setEnrollData({ ...enrollData, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.25rem' }}>Gender</label>
                  <select
                    className="medx-input"
                    value={enrollData.gender}
                    onChange={(e) => setEnrollData({ ...enrollData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.25rem' }}>Date of Birth</label>
                  <input
                    type="date"
                    className="medx-input"
                    value={enrollData.dateOfBirth}
                    onChange={(e) => setEnrollData({ ...enrollData, dateOfBirth: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.25rem' }}>Blood Group</label>
                  <select
                    className="medx-input"
                    value={enrollData.bloodGroup}
                    onChange={(e) => setEnrollData({ ...enrollData, bloodGroup: e.target.value })}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.25rem' }}>Phone</label>
                  <input
                    type="text"
                    className="medx-input"
                    placeholder="+91 98112 34567"
                    value={enrollData.phone}
                    onChange={(e) => setEnrollData({ ...enrollData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.25rem' }}>Clinical Condition / Chief Complaint</label>
                <input
                  type="text"
                  className="medx-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Type 2 Diabetes evaluation, intermittent chest tightness..."
                  value={enrollData.currentCondition}
                  onChange={(e) => setEnrollData({ ...enrollData, currentCondition: e.target.value })}
                />
              </div>

              {/* Initial Vitals Strip */}
              <div style={{
                backgroundColor: '#F8FAFC',
                padding: '1rem',
                borderRadius: 'var(--medx-radius-md)',
                border: '1px solid #E2E8F0'
              }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--medx-navy)', marginBottom: '0.5rem' }}>
                  Initial Vital Signs
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)' }}>Blood Pressure</span>
                    <input
                      type="text"
                      className="medx-input"
                      placeholder="120/80 mmHg"
                      value={enrollData.vitalSigns.bloodPressure}
                      onChange={(e) => setEnrollData({
                        ...enrollData,
                        vitalSigns: { ...enrollData.vitalSigns, bloodPressure: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)' }}>Heart Rate</span>
                    <input
                      type="text"
                      className="medx-input"
                      placeholder="72 bpm"
                      value={enrollData.vitalSigns.heartRate}
                      onChange={(e) => setEnrollData({
                        ...enrollData,
                        vitalSigns: { ...enrollData.vitalSigns, heartRate: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)' }}>Temperature</span>
                    <input
                      type="text"
                      className="medx-input"
                      placeholder="98.6 °F"
                      value={enrollData.vitalSigns.temperature}
                      onChange={(e) => setEnrollData({
                        ...enrollData,
                        vitalSigns: { ...enrollData.vitalSigns, temperature: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)' }}>SpO2 Oxygen</span>
                    <input
                      type="text"
                      className="medx-input"
                      placeholder="99%"
                      value={enrollData.vitalSigns.spo2}
                      onChange={(e) => setEnrollData({
                        ...enrollData,
                        vitalSigns: { ...enrollData.vitalSigns, spo2: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="medx-btn medx-btn-secondary"
                  onClick={() => setShowEnrollModal(false)}
                  disabled={enrollSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="medx-btn medx-btn-primary"
                  disabled={enrollSaving}
                >
                  {enrollSaving ? 'Enrolling...' : 'Enroll Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorPatients;
