import React, { useState, useEffect } from 'react';
import {
  BedDouble, Activity, Plus, RefreshCw, UserCheck,
  UserX, Wrench, ShieldAlert, CheckCircle2, X
} from 'lucide-react';
import hospitalService from '../../services/hospitalService.js';

const WARDS = ['All', 'General', 'Intensive Care', 'Emergency', 'Cardiology', 'Surgery', 'Pediatrics'];
const STATUSES = ['All', 'Available', 'Occupied', 'Maintenance', 'Reserved'];

export default function HospitalBeds() {
  const [beds, setBeds] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wardFilter, setWardFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [patients, setPatients] = useState([]);

  // Add Bed Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBed, setNewBed] = useState({
    bedNumber: '',
    ward: 'General',
    roomNumber: '101',
    bedType: 'General',
    status: 'Available',
    notes: ''
  });

  // Assign Patient Modal
  const [assigningBed, setAssigningBed] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadBeds = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (wardFilter !== 'All') params.ward = wardFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await hospitalService.getBeds(params);
      if (res.success) {
        setBeds(res.beds || []);
        setStats(res.stats || {});
      }
    } catch (err) {
      console.error('Error loading beds:', err);
      setError('Failed to fetch bed and ICU allocations.');
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const res = await hospitalService.getPatients({ limit: 100 });
      if (res.success) {
        setPatients(res.patients || []);
      }
    } catch (err) {
      console.error('Error loading patients for bed assignment:', err);
    }
  };

  useEffect(() => {
    loadBeds();
  }, [wardFilter, statusFilter]);

  useEffect(() => {
    loadPatients();
  }, []);

  const handleCreateBed = async (e) => {
    e.preventDefault();
    if (!newBed.bedNumber) return;

    try {
      setSubmitting(true);
      const res = await hospitalService.createBed(newBed);
      if (res.success) {
        setIsAddModalOpen(false);
        setNewBed({
          bedNumber: '',
          ward: 'General',
          roomNumber: '101',
          bedType: 'General',
          status: 'Available',
          notes: ''
        });
        loadBeds();
      }
    } catch (err) {
      console.error('Error creating bed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignPatient = async (e) => {
    e.preventDefault();
    if (!assigningBed || !selectedPatientId) return;

    try {
      setSubmitting(true);
      const res = await hospitalService.assignBedPatient(assigningBed._id, {
        patientId: selectedPatientId,
        notes: assignNotes
      });
      if (res.success) {
        setAssigningBed(null);
        setSelectedPatientId('');
        setAssignNotes('');
        loadBeds();
      }
    } catch (err) {
      console.error('Error assigning patient to bed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReleaseBed = async (bedId) => {
    try {
      const res = await hospitalService.releaseBed(bedId);
      if (res.success) {
        loadBeds();
      }
    } catch (err) {
      console.error('Error releasing bed:', err);
    }
  };

  const handleStatusChange = async (bedId, status) => {
    try {
      const res = await hospitalService.updateBedStatus(bedId, { status });
      if (res.success) {
        loadBeds();
      }
    } catch (err) {
      console.error('Error updating bed status:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Metric Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
            Inpatient Bed & ICU Occupancy Management
          </h2>
          <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Real-time ward capacity tracking and acute inpatient allocation
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="medx-btn medx-btn-secondary"
            onClick={loadBeds}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            className="medx-btn medx-btn-primary"
            onClick={() => setIsAddModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} /> Add Bed
          </button>
        </div>
      </div>

      {/* Capacity Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem'
      }}>
        <div className="medx-card" style={{ padding: '1rem', borderLeft: '4px solid #3B82F6' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', margin: 0 }}>Total Beds Tracked</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--medx-navy)', margin: '0.25rem 0' }}>
            {stats.total ?? beds.length}
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#3B82F6', fontWeight: 600 }}>Active Hospital Registry</span>
        </div>

        <div className="medx-card" style={{ padding: '1rem', borderLeft: '4px solid #10B981' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', margin: 0 }}>Available Beds</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981', margin: '0.25rem 0' }}>
            {stats.available ?? 0}
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>Ready for Admission</span>
        </div>

        <div className="medx-card" style={{ padding: '1rem', borderLeft: '4px solid #EF4444' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', margin: 0 }}>Occupied Beds</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#EF4444', margin: '0.25rem 0' }}>
            {stats.occupied ?? 0}
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600 }}>Inpatient Assigned</span>
        </div>

        <div className="medx-card" style={{ padding: '1rem', borderLeft: '4px solid #8B5CF6' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', margin: 0 }}>ICU Available</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8B5CF6', margin: '0.25rem 0' }}>
            {stats.icuAvailable ?? 0} / {stats.icuTotal ?? 0}
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#8B5CF6', fontWeight: 600 }}>Critical Care Acuity</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="medx-card" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--medx-text-secondary)', marginRight: '0.5rem' }}>
              Ward:
            </label>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="medx-input"
              style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
            >
              {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--medx-text-secondary)', marginRight: '0.5rem' }}>
              Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="medx-input"
              style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <span style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)' }}>
          Showing <strong>{beds.length}</strong> beds
        </span>
      </div>

      {/* Visual Interactive Bed Grid */}
      {beds.length === 0 ? (
        <div className="medx-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--medx-text-secondary)' }}>
          <BedDouble size={36} color="#94A3B8" style={{ marginBottom: '0.5rem' }} />
          <p>No beds found matching the selected filter criteria.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem'
        }}>
          {beds.map((bed) => {
            const isOccupied = bed.status === 'Occupied';
            const isMaintenance = bed.status === 'Maintenance';
            const isReserved = bed.status === 'Reserved';
            const isAvailable = bed.status === 'Available';

            const statusColor = isOccupied ? '#EF4444' : isMaintenance ? '#F59E0B' : isReserved ? '#3B82F6' : '#10B981';
            const statusBg = isOccupied ? '#FEF2F2' : isMaintenance ? '#FFFBEB' : isReserved ? '#EFF6FF' : '#ECFDF5';

            return (
              <div
                key={bed._id}
                className="medx-card"
                style={{
                  padding: '1.25rem',
                  borderTop: `4px solid ${statusColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--medx-navy)' }}>
                      Bed {bed.bedNumber}
                    </span>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      backgroundColor: statusBg,
                      color: statusColor,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {bed.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', marginTop: '0.375rem' }}>
                    <div><strong>Ward:</strong> {bed.ward} (Rm {bed.roomNumber || '101'})</div>
                    <div><strong>Type:</strong> {bed.bedType} {bed.bedType === 'ICU' && '⚡'}</div>
                  </div>

                  {isOccupied && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '6px',
                      fontSize: '0.8125rem'
                    }}>
                      <div style={{ color: 'var(--medx-navy)', fontWeight: 600 }}>
                        {bed.patientId?.userId?.name || 'Inpatient Assigned'}
                      </div>
                      <div style={{ color: '#64748B', fontSize: '0.75rem' }}>
                        Admitted: {bed.assignedAt ? new Date(bed.assignedAt).toLocaleDateString() : 'Active'}
                      </div>
                    </div>
                  )}

                  {bed.notes && (
                    <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.5rem', fontStyle: 'italic' }}>
                      "{bed.notes}"
                    </p>
                  )}
                </div>

                {/* Bed Action Bar */}
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {isAvailable ? (
                    <button
                      className="medx-btn medx-btn-primary"
                      onClick={() => setAssigningBed(bed)}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                    >
                      <UserCheck size={14} /> Assign Patient
                    </button>
                  ) : isOccupied ? (
                    <button
                      className="medx-btn medx-btn-secondary"
                      onClick={() => handleReleaseBed(bed._id)}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                    >
                      <UserX size={14} /> Release Bed
                    </button>
                  ) : (
                    <button
                      className="medx-btn medx-btn-secondary"
                      onClick={() => handleStatusChange(bed._id, 'Available')}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', flex: 1 }}
                    >
                      Make Available
                    </button>
                  )}

                  {!isOccupied && isAvailable && (
                    <button
                      className="medx-btn medx-btn-secondary"
                      onClick={() => handleStatusChange(bed._id, 'Maintenance')}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#F59E0B' }}
                      title="Mark as Maintenance"
                    >
                      <Wrench size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Bed Modal */}
      {isAddModalOpen && (
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
                Register Hospital Bed
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBed} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--medx-navy)' }}>
                  Bed Identifier / Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B-204 or ICU-04"
                  value={newBed.bedNumber}
                  onChange={(e) => setNewBed({ ...newBed, bedNumber: e.target.value })}
                  className="medx-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--medx-navy)' }}>
                  Ward *
                </label>
                <select
                  value={newBed.ward}
                  onChange={(e) => setNewBed({ ...newBed, ward: e.target.value })}
                  className="medx-input"
                >
                  {WARDS.filter((w) => w !== 'All').map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--medx-navy)' }}>
                  Room Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 204-A"
                  value={newBed.roomNumber}
                  onChange={(e) => setNewBed({ ...newBed, roomNumber: e.target.value })}
                  className="medx-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--medx-navy)' }}>
                  Bed Acuity / Type
                </label>
                <select
                  value={newBed.bedType}
                  onChange={(e) => setNewBed({ ...newBed, bedType: e.target.value })}
                  className="medx-input"
                >
                  <option value="General">General Inpatient</option>
                  <option value="ICU">Intensive Care Unit (ICU)</option>
                  <option value="Emergency">Emergency Resuscitation</option>
                  <option value="Semi-Private">Semi-Private</option>
                  <option value="Private">Private Suite</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--medx-navy)' }}>
                  Clinical Equipment / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Ventilator attached, telemetry monitor..."
                  value={newBed.notes}
                  onChange={(e) => setNewBed({ ...newBed, notes: e.target.value })}
                  className="medx-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="medx-btn medx-btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="medx-btn medx-btn-primary"
                >
                  {submitting ? 'Registering...' : 'Register Bed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Patient Modal */}
      {assigningBed && (
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
                Assign Patient to Bed {assigningBed.bedNumber}
              </h3>
              <button
                onClick={() => setAssigningBed(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignPatient} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--medx-navy)' }}>
                  Inpatient *
                </label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="medx-input"
                >
                  <option value="">Select Inpatient to Admit...</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.userId?.name || p.legacyId} — Status: {p.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--medx-navy)' }}>
                  Admission / Care Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Admission rationale, attending directives..."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="medx-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="medx-btn medx-btn-secondary"
                  onClick={() => setAssigningBed(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="medx-btn medx-btn-primary"
                >
                  {submitting ? 'Admitting...' : 'Confirm Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
