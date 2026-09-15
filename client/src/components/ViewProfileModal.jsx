import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { X, Edit2, Shield, User, Mail, Phone, MapPin, Building, Award } from 'lucide-react';

export function ViewProfileModal({ isOpen, onClose, onEdit }) {
  const { user, profile, role } = useAuth();

  if (!isOpen || !user) return null;

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
          maxWidth: '520px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#7C3AED',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem'
            }}>
              {user.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                {user.name}
              </h2>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {role?.replace('_', ' ')}
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

        {/* Profile Content */}
        <div style={{ overflowY: 'auto', padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem'
          }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                <Mail size={14} /> Email Address
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-navy)', wordBreak: 'break-all' }}>
                {user.email}
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                <Phone size={14} /> Phone
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                {user.phone || 'Not provided'}
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                <Shield size={14} /> Account Status
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#16A34A' }}>
                Active & Verified
              </div>
            </div>

            {/* Role Specific Details */}
            {role === 'patient' && (
              <>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                  <div style={{ color: '#64748B', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Blood Group</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                    {profile?.bloodGroup || 'Not specified'}
                  </div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                  <div style={{ color: '#64748B', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Emergency Contact</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                    {profile?.emergencyContact || 'None listed'}
                  </div>
                </div>
              </>
            )}

            {role === 'doctor' && (
              <>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                  <div style={{ color: '#64748B', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Clinical Specialty</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                    {profile?.specialty || 'General Medicine'}
                  </div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                  <div style={{ color: '#64748B', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Qualifications</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                    {profile?.qualifications || 'MD'}
                  </div>
                </div>
              </>
            )}

            {role === 'hospital_admin' && (
              <>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                  <div style={{ color: '#64748B', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Hospital Facility</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                    {profile?.facilityName || 'Med-X Central Hospital'}
                  </div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                  <div style={{ color: '#64748B', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Licensed Beds</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                    {profile?.totalBeds || 100}
                  </div>
                </div>
              </>
            )}

            {role === 'lab_admin' && (
              <>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                  <div style={{ color: '#64748B', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Laboratory Facility</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                    {profile?.labName || 'Med-X Diagnostic Center'}
                  </div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                  <div style={{ color: '#64748B', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Accreditation</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                    {profile?.accreditation || 'NABL & CAP Certified'}
                  </div>
                </div>
              </>
            )}
          </div>

          {profile?.address && (
            <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                <MapPin size={14} /> Address
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--medx-navy)' }}>
                {profile.address}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem'
        }}>
          <button
            type="button"
            onClick={onClose}
            className="medx-btn medx-btn-secondary"
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit();
            }}
            className="medx-btn medx-btn-primary"
            style={{ fontSize: '0.875rem', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#7C3AED', borderColor: '#7C3AED' }}
          >
            <Edit2 size={15} />
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewProfileModal;
