import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  X, User, Shield, Phone, Mail, Save, AlertCircle,
  CheckCircle2, Trash2, ShieldAlert, AlertTriangle
} from 'lucide-react';

export function ManageProfileModal({ isOpen, onClose }) {
  const { user, profile, role, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('profile'); // 'profile' | 'account'

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    address: '',
    emergencyContact: '',
    specialty: '',
    qualifications: '',
    experienceYears: '',
    consultationFee: '',
    department: '',
    facilityName: '',
    totalBeds: '',
    emergencyUnits: '',
    labName: '',
    accreditation: ''
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Delete account states
  const [confirmDeleteStep, setConfirmDeleteStep] = useState(false);
  const [deleteConfirmPhrase, setDeleteConfirmPhrase] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

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
      setSaveError(null);
      setSaveSuccess(false);
      setConfirmDeleteStep(false);
      setDeleteConfirmPhrase('');
      setDeleteError(null);
    }
  }, [isOpen, user, profile]);

  if (!isOpen || !user) return null;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateProfile(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.response?.data?.error?.message || err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirmPhrase.trim() !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm deactivation.');
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteAccount('DELETE');
      onClose();
      navigate('/login?deactivated=true');
    } catch (err) {
      setDeleteError(err.response?.data?.error?.message || err.message || 'Failed to deactivate account.');
      setDeleting(false);
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
          maxWidth: '580px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#7C3AED',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem'
            }}>
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                Manage Profile
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)' }}>
                {user.email} • <strong style={{ color: '#7C3AED', textTransform: 'capitalize' }}>{role?.replace('_', ' ')}</strong>
              </span>
            </div>
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

        {/* Section Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          padding: '0 1.5rem'
        }}>
          <button
            type="button"
            onClick={() => setActiveSection('profile')}
            style={{
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeSection === 'profile' ? '#7C3AED' : '#64748B',
              border: 'none',
              borderBottom: activeSection === 'profile' ? '2px solid #7C3AED' : '2px solid transparent',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <User size={16} />
            Profile Information
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('account')}
            style={{
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeSection === 'account' ? '#7C3AED' : '#64748B',
              border: 'none',
              borderBottom: activeSection === 'account' ? '2px solid #7C3AED' : '2px solid transparent',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Shield size={16} />
            Account Management
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ overflowY: 'auto', padding: '1.5rem', flex: 1 }}>
          {/* SECTION 1: PROFILE INFORMATION */}
          {activeSection === 'profile' && (
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {saveSuccess && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  color: '#15803D',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle2 size={16} />
                  Profile updated successfully.
                </div>
              )}

              {saveError && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={16} />
                  {saveError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="medx-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="medx-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="medx-label">Phone Number</label>
                  <input
                    type="tel"
                    className="medx-input"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Patient Fields */}
              {role === 'patient' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="medx-label">Blood Group</label>
                    <select
                      className="medx-select"
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="medx-label">Emergency Contact Phone</label>
                    <input
                      type="text"
                      className="medx-input"
                      placeholder="e.g., Jane Doe: +1-555-0199"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Doctor Fields */}
              {role === 'doctor' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="medx-label">Clinical Specialty</label>
                    <input
                      type="text"
                      className="medx-input"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="medx-label">Qualifications</label>
                    <input
                      type="text"
                      className="medx-input"
                      placeholder="e.g. MBBS, MD, FACC"
                      value={formData.qualifications}
                      onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Hospital Fields */}
              {role === 'hospital_admin' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="medx-label">Facility Name</label>
                    <input
                      type="text"
                      className="medx-input"
                      value={formData.facilityName}
                      onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="medx-label">Total Bed Capacity</label>
                    <input
                      type="number"
                      className="medx-input"
                      value={formData.totalBeds}
                      onChange={(e) => setFormData({ ...formData, totalBeds: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Lab Fields */}
              {role === 'lab_admin' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="medx-label">Lab Facility Name</label>
                    <input
                      type="text"
                      className="medx-input"
                      value={formData.labName}
                      onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="medx-label">Accreditation</label>
                    <input
                      type="text"
                      className="medx-input"
                      placeholder="e.g. NABL & CAP Accredited"
                      value={formData.accreditation}
                      onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="medx-label">Mailing / Physical Address</label>
                <input
                  type="text"
                  className="medx-input"
                  placeholder="Street, City, State, ZIP"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="medx-btn medx-btn-secondary"
                  style={{ fontSize: '0.875rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="medx-btn medx-btn-primary"
                  style={{ fontSize: '0.875rem', backgroundColor: '#7C3AED', borderColor: '#7C3AED' }}
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* SECTION 2: ACCOUNT MANAGEMENT */}
          {activeSection === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Account Identity Details */}
              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '1rem'
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--medx-navy)', marginBottom: '0.75rem' }}>
                  Account Security & Credentials
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8125rem' }}>
                  <div>
                    <span style={{ color: '#64748B' }}>Primary Email:</span>
                    <div style={{ fontWeight: 600, color: 'var(--medx-navy)' }}>{user.email}</div>
                  </div>

                  <div>
                    <span style={{ color: '#64748B' }}>Assigned Role:</span>
                    <div style={{ fontWeight: 600, color: '#7C3AED', textTransform: 'capitalize' }}>{role?.replace('_', ' ')}</div>
                  </div>

                  <div>
                    <span style={{ color: '#64748B' }}>Account Status:</span>
                    <div style={{ fontWeight: 600, color: '#16A34A' }}>Active & Verified</div>
                  </div>

                  <div>
                    <span style={{ color: '#64748B' }}>Role ID:</span>
                    <div style={{ fontWeight: 600, color: 'var(--medx-navy)', fontSize: '0.75rem' }}>
                      {profile?._id || user.id}
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone: Delete Account */}
              <div style={{
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                backgroundColor: '#FEF2F2',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991B1B', fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.5rem' }}>
                  <ShieldAlert size={18} />
                  <span>Account Deactivation & Deletion</span>
                </div>

                <p style={{ fontSize: '0.8125rem', color: '#7F1D1D', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                  Permanently deactivate your Med-X account and invalidate all active session credentials.
                  Once deactivated, this account cannot be recovered.
                </p>

                {!confirmDeleteStep ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteStep(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={15} />
                    Delete Account
                  </button>
                ) : (
                  <form onSubmit={handleDeleteAccount} style={{
                    marginTop: '0.75rem',
                    padding: '1rem',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '6px',
                    border: '1px solid #F87171'
                  }}>
                    {deleteError && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#DC2626',
                        fontSize: '0.8125rem',
                        marginBottom: '0.75rem'
                      }}>
                        <AlertTriangle size={15} />
                        <span>{deleteError}</span>
                      </div>
                    )}

                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#991B1B', marginBottom: '0.4rem' }}>
                      To confirm deactivation, please type <strong style={{ color: '#B91C1C' }}>DELETE</strong> below:
                    </label>

                    <input
                      type="text"
                      className="medx-input"
                      placeholder="Type DELETE"
                      value={deleteConfirmPhrase}
                      onChange={(e) => setDeleteConfirmPhrase(e.target.value)}
                      style={{ borderColor: '#FCA5A5', marginBottom: '0.75rem' }}
                      autoFocus
                    />

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDeleteStep(false);
                          setDeleteConfirmPhrase('');
                          setDeleteError(null);
                        }}
                        className="medx-btn medx-btn-secondary"
                        style={{ fontSize: '0.8125rem', padding: '0.4rem 0.8rem' }}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={deleting || deleteConfirmPhrase.trim() !== 'DELETE'}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.4rem 0.9rem',
                          backgroundColor: '#DC2626',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          cursor: (deleting || deleteConfirmPhrase.trim() !== 'DELETE') ? 'not-allowed' : 'pointer',
                          opacity: (deleting || deleteConfirmPhrase.trim() !== 'DELETE') ? 0.6 : 1
                        }}
                      >
                        <Trash2 size={14} />
                        {deleting ? 'Deactivating...' : 'Confirm Account Deactivation'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageProfileModal;
