import React, { useState, useEffect } from 'react';
import {
  Users, Search, RefreshCw, Eye, BedDouble,
  Stethoscope, Heart, Activity, FileText, X
} from 'lucide-react';
import hospitalService from '../../services/hospitalService.js';

export default function HospitalPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail Modal
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await hospitalService.getPatients(params);
      if (res.success) {
        setPatients(res.patients || []);
      }
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Failed to fetch hospital patient records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPatients();
  };

  const handleViewPatient = async (patientId) => {
    try {
      setLoadingDetail(true);
      const res = await hospitalService.getPatientById(patientId);
      if (res.success) {
        setSelectedPatient(res.patient);
      }
    } catch (err) {
      console.error('Error loading patient detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
            Inpatient & Institutional Patient Directory
          </h2>
          <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Registered inpatients, bed assignments, and clinical dossier tracking
          </p>
        </div>
        <button
          className="medx-btn medx-btn-secondary"
          onClick={loadPatients}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="medx-card" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px', maxWidth: '450px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search by name, email, or legacy ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="medx-input"
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          </div>
          <button type="submit" className="medx-btn medx-btn-primary" style={{ padding: '0.5rem 1rem' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--medx-text-secondary)' }}>
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="medx-input"
            style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
          >
            <option value="all">All Patients</option>
            <option value="Active">Active</option>
            <option value="Critical">Critical</option>
            <option value="In Consultation">In Consultation</option>
            <option value="Waiting">Waiting</option>
            <option value="Discharged">Discharged</option>
          </select>
        </div>
      </div>

      {/* Patient Table */}
      <div className="medx-card" style={{ padding: '1rem' }}>
        {patients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--medx-text-secondary)' }}>
            <Users size={36} color="#94A3B8" style={{ marginBottom: '0.5rem' }} />
            <p>No patients found registered under this hospital facility.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: 'var(--medx-text-secondary)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Patient Name</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Legacy ID</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Gender / Blood</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Assigned Bed</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Primary Doctor</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                      {p.userId?.name || 'Inpatient'}
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 400 }}>
                        {p.userId?.email}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                      {p.legacyId || 'PAT-Auto'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {p.gender || 'Unspecified'} {p.bloodGroup && `(${p.bloodGroup})`}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {p.assignedBed ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#059669', fontWeight: 600 }}>
                          <BedDouble size={14} /> Bed {p.assignedBed.bedNumber} ({p.assignedBed.ward})
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {p.primaryDoctorId ? `Dr. (${p.primaryDoctorId.specialty || 'General'})` : <span style={{ color: '#94A3B8' }}>Unassigned</span>}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className={`medx-badge ${p.status === 'Critical' ? 'medx-badge-danger' : p.status === 'Active' ? 'medx-badge-success' : 'medx-badge-primary'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <button
                        className="medx-btn medx-btn-secondary"
                        onClick={() => handleViewPatient(p._id)}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Eye size={13} /> View Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Clinical Dossier Modal */}
      {selectedPatient && (
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
          <div className="medx-card" style={{ maxWidth: '650px', width: '100%', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                  {selectedPatient.userId?.name}
                </h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)' }}>
                  Institutional Patient Dossier • {selectedPatient.legacyId}
                </span>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Vitals Summary */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-navy)', margin: '0 0 0.5rem 0' }}>
                  Latest Physiological Vitals
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', fontSize: '0.8125rem' }}>
                  <div><strong>BP:</strong> {selectedPatient.vitalSigns?.bloodPressure || '120/80 mmHg'}</div>
                  <div><strong>Heart Rate:</strong> {selectedPatient.vitalSigns?.heartRate || '72'} bpm</div>
                  <div><strong>SpO2:</strong> {selectedPatient.vitalSigns?.spo2 || '99%'}</div>
                  <div><strong>Temperature:</strong> {selectedPatient.vitalSigns?.temperature || '98.6'} °F</div>
                </div>
              </div>

              {/* Bed Assignment */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-navy)', margin: '0 0 0.5rem 0' }}>
                  Current Inpatient Allocation
                </h4>
                {selectedPatient.assignedBed ? (
                  <p style={{ fontSize: '0.8125rem', color: '#059669', margin: 0 }}>
                    Admitted to <strong>Bed {selectedPatient.assignedBed.bedNumber}</strong> ({selectedPatient.assignedBed.ward} Ward, Rm {selectedPatient.assignedBed.roomNumber})
                  </p>
                ) : (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: 0 }}>
                    No bed currently assigned (Outpatient / Ambulatory status).
                  </p>
                )}
              </div>

              {/* Inpatient Reports */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-navy)', margin: '0 0 0.5rem 0' }}>
                  Institutional Medical Reports ({selectedPatient.reports?.length || 0})
                </h4>
                {selectedPatient.reports?.length === 0 ? (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: 0 }}>
                    No reports on record.
                  </p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedPatient.reports?.map((r) => (
                      <li key={r._id} style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem', backgroundColor: '#F1F5F9', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{r.reportName}</span>
                        <span style={{ fontWeight: 600, color: r.reviewStatus === 'Reviewed' ? '#10B981' : '#F59E0B' }}>
                          {r.reviewStatus}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Care Queue History */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-navy)', margin: '0 0 0.5rem 0' }}>
                  Care Queue Operations ({selectedPatient.careTasks?.length || 0})
                </h4>
                {selectedPatient.careTasks?.length === 0 ? (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: 0 }}>
                    No active care queue items for this patient.
                  </p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedPatient.careTasks?.map((t) => (
                      <li key={t._id} style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{t.title}</span>
                        <span style={{ fontWeight: 600, color: '#3B82F6' }}>
                          Stage: {t.category}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="medx-btn medx-btn-secondary"
                onClick={() => setSelectedPatient(null)}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
