import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Plus, Check, X, Stethoscope, ShieldCheck } from 'lucide-react';

const HospitalDoctors = () => {
  const { token, API_HOST } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('Cardiology');
  const [departmentId, setDepartmentId] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdInfo, setCreatedInfo] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [docsRes, deptsRes] = await Promise.all([
        fetch(`${API_HOST}/api/hospital/doctors`, { headers }),
        fetch(`${API_HOST}/api/departments`, { headers })
      ]);

      const [docsData, deptsData] = await Promise.all([docsRes.json(), deptsRes.json()]);
      if (docsRes.ok) setDoctors(docsData);
      if (deptsRes.ok) {
        setDepartments(deptsData);
        if (deptsData.length > 0) setDepartmentId(deptsData[0]._id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token, API_HOST]);

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setCreatedInfo(null);

    try {
      const res = await fetch(`${API_HOST}/api/hospital/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, specialty, departmentId, licenseNumber })
      });

      const data = await res.json();
      if (res.ok) {
        setCreatedInfo({ name, email, password: data.defaultPassword });
        setName('');
        setEmail('');
        setLicenseNumber('');
        fetchData();
      } else {
        alert(data.message || 'Error creating doctor');
      }
    } catch (e) {
      alert('Error creating doctor');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActiveStatus = async (doctor) => {
    try {
      await fetch(`${API_HOST}/api/hospital/doctors/${doctor._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ active: !doctor.active })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-strong)' }}>
            Clinical Doctor Roster
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage medical staff, credentialing, specialty assignments, and practice status
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <Plus size={16} />
          Onboard New Doctor
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Loading doctors roster...</p>
        ) : doctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Stethoscope size={40} color="var(--accent-1)" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-strong)' }}>No doctors currently assigned to this hospital.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Click 'Onboard New Doctor' to invite medical staff.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Clinical Specialty</th>
                  <th>License Number</th>
                  <th>Active Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-strong)' }}>
                        Dr. {d.userId?.name || 'Doctor'}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{d.userId?.email}</div>
                    </td>
                    <td>{d.departmentId?.name || 'Unassigned'}</td>
                    <td>{d.specialty}</td>
                    <td><code>{d.licenseNumber}</code></td>
                    <td>
                      <span className={`badge ${d.active ? 'badge-low' : 'badge-danger'}`}>
                        {d.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleActiveStatus(d)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                      >
                        {d.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Onboard Doctor Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                Onboard Medical Doctor
              </h2>
              <button onClick={() => { setShowModal(false); setCreatedInfo(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {createdInfo ? (
              <div style={{ backgroundColor: 'var(--flag-success-light)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--flag-success)', fontWeight: 700, marginBottom: '8px' }}>
                  <Check size={18} />
                  <span>Doctor Account Created!</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#065f46' }}>
                  Provide these initial credentials to <strong>Dr. {createdInfo.name}</strong>:
                </p>
                <div style={{ marginTop: '8px', fontSize: '0.825rem', background: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid var(--surface-border)' }}>
                  <div><strong>Email:</strong> {createdInfo.email}</div>
                  <div><strong>Temporary Password:</strong> {createdInfo.password}</div>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleCreateDoctor} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="dr.jenkins@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Specialty</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Cardiology / Internal Medicine"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Department</label>
                <select className="form-input" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                  <option value="">Unassigned</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">License Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="MED-94812"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }} disabled={submitting}>
                {submitting ? 'Creating Profile...' : 'Confirm Doctor Onboarding'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDoctors;
