import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FolderKanban, Plus, Trash2, Building, Users } from 'lucide-react';

const HospitalDepartments = () => {
  const { token, API_HOST } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('25');
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_HOST}/api/departments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setDepartments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDepartments();
  }, [token, API_HOST]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_HOST}/api/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, capacity: parseInt(capacity) })
      });
      if (res.ok) {
        setName('');
        fetchDepartments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this department?')) return;
    try {
      await fetch(`${API_HOST}/api/departments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDepartments();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-strong)' }}>
            Hospital Departments & Wards
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Clinical specialty units, patient capacity thresholds, and staffing allocations
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Department Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', alignContent: 'start' }}>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading departments...</p>
          ) : departments.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              <FolderKanban size={40} color="var(--accent-1)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-strong)' }}>No clinical departments configured yet.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Use the form on the right to establish units.</p>
            </div>
          ) : (
            departments.map((dept) => (
              <div key={dept._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-1)' }}>
                      <Building size={20} />
                    </div>
                    <button onClick={() => handleDelete(dept._id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} title="Delete Department">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '6px' }}>
                    {dept.name}
                  </h3>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    Head Doctor: {dept.headDoctorId?.specialty ? `Assigned (${dept.headDoctorId.specialty})` : 'To be assigned'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--surface-border)', paddingTop: '12px', marginTop: '16px', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  <span>Patient Capacity: <strong>{dept.capacity || 20}</strong></span>
                  <span>Active Staff: <strong>{dept.activeStaffCount || 4}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Department Card */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-strong)' }}>
            Add Clinical Department
          </h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Department Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Cardiology, Hematology, Emergency"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Capacity (Beds / Units)</label>
              <input
                type="number"
                className="form-input"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }} disabled={submitting}>
              <Plus size={16} />
              {submitting ? 'Creating...' : 'Create Department'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HospitalDepartments;
