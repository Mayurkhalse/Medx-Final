import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { X, Save, AlertCircle, CheckCircle, Shield } from 'lucide-react';

export function EditProfileModal({ isOpen, onClose }) {
  const { user, profile, role, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    // Patient
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    address: '',
    emergencyContact: '',
    // Doctor
    specialty: '',
    qualifications: '',
    experienceYears: '',
    consultationFee: '',
    department: '',
    // Hospital
    facilityName: '',
    totalBeds: '',
    emergencyUnits: '',
    // Lab
    labName: '',
    accreditation: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        gender: profile?.gender || '',
        dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.substring(0, 10) : '',
        bloodGroup: profile?.bloodGroup || '',
        address: profile?.address || '',
        emergencyContact: profile?.emergencyContact || '',
        specialty: profile?.specialty || '',
        qualifications: profile?.qualifications || '',
        experienceYears: profile?.experienceYears || '',
        consultationFee: profile?.consultationFee || '',
        department: profile?.department || '',
        facilityName: profile?.facilityName || '',
        totalBeds: profile?.totalBeds || '',
        emergencyUnits: profile?.emergencyUnits || '',
        labName: profile?.labName || '',
        accreditation: profile?.accreditation || ''
      });
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, user, profile]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateProfile(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--medx-radius-lg, 12px)',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
              Edit Account Profile
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: '0.2rem 0 0 0' }}>
              Manage your personal and credential information
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B',
              padding: '0.35rem',
              borderRadius: '6px'
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.5rem', flex: 1 }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: '6px',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: '6px',
              backgroundColor: '#F0FDF4',
              color: '#16A34A',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              <CheckCircle size={18} />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {/* Read-Only Identity Strip */}
          <div style={{
            backgroundColor: 'var(--medx-surface-muted, #F8FAFC)',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1.25rem',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ color: '#64748B' }}>Email: </span>
              <strong>{user?.email}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748B' }}>
              <Shield size={14} />
              <span>Role: <strong>{role}</strong></span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="medx-input"
                style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.35rem' }}>
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="medx-input"
                placeholder="+1 (555) 000-0000"
                style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
              />
            </div>

            {/* Role-Specific Fields */}
            {role === 'patient' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.35rem' }}>
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="medx-input"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                  >
                    <option value="">Select Blood Group</option>
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
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.35rem' }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="medx-input"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.35rem' }}>
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="medx-input"
                    placeholder="Contact Name & Phone"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                  />
                </div>
              </>
            )}

            {role === 'doctor' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.35rem' }}>
                    Specialty
                  </label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="medx-input"
                    placeholder="e.g. Cardiology, Internal Medicine"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.35rem' }}>
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="medx-input"
                    placeholder="e.g. Cardiology"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.35rem' }}>
                    Qualifications
                  </label>
                  <input
                    type="text"
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    className="medx-input"
                    placeholder="e.g. MD, MBBS, FACC"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.35rem' }}>
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="medx-input"
                    min="0"
                    max="60"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                  />
                </div>
              </>
            )}

            {role === 'hospital_admin' && (
              <>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.35rem' }}>
                    Facility Name
                  </label>
                  <input
                    type="text"
                    value={formData.facilityName}
                    onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                    className="medx-input"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.35rem' }}>
                    Total Licensed Beds
                  </label>
                  <input
                    type="number"
                    value={formData.totalBeds}
                    onChange={(e) => setFormData({ ...formData, totalBeds: e.target.value })}
                    className="medx-input"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.35rem' }}>
                    ICU / Emergency Units
                  </label>
                  <input
                    type="number"
                    value={formData.emergencyUnits}
                    onChange={(e) => setFormData({ ...formData, emergencyUnits: e.target.value })}
                    className="medx-input"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                  />
                </div>
              </>
            )}

            {role === 'lab_admin' && (
              <>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.35rem' }}>
                    Laboratory Name
                  </label>
                  <input
                    type="text"
                    value={formData.labName}
                    onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                    className="medx-input"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.35rem' }}>
                    Accreditation & Quality Standards
                  </label>
                  <input
                    type="text"
                    value={formData.accreditation}
                    onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                    className="medx-input"
                    placeholder="e.g. NABL / CAP / ISO 15189"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                  />
                </div>
              </>
            )}

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.35rem' }}>
                Address / Location
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="medx-input"
                rows={2}
                style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button
              type="button"
              onClick={onClose}
              className="medx-btn medx-btn-secondary"
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="medx-btn medx-btn-primary"
              style={{ fontSize: '0.875rem', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              disabled={loading}
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
