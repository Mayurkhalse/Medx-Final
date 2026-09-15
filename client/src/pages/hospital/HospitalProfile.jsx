import React, { useState, useEffect } from 'react';
import {
  Building2,
  Phone,
  Mail,
  Clock,
  Save,
  ShieldCheck,
  BedDouble,
  AlertTriangle,
  Sparkles,
  MapPin
} from 'lucide-react';
import { hospitalService } from '../../services/hospitalService.js';

export default function HospitalProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [formData, setFormData] = useState({
    facilityName: '',
    facilityType: 'General Hospital',
    phone: '',
    email: '',
    emergencyContact: '',
    operatingHours: '',
    licenseNumber: '',
    street: '100 Medical Enclave, Central Healthcare District',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip: '400012',
    totalBeds: 100,
    occupiedBeds: 60,
    icuAvailable: 10
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await hospitalService.getProfile();
      if (res?.hospital) {
        const h = res.hospital;
        setProfile(h);
        setFormData({
          facilityName: h.facilityName || '',
          facilityType: h.facilityType || 'General Hospital',
          phone: h.phone || '+91 22 2456 7890',
          email: h.email || 'admin@medx-hospital.org',
          emergencyContact: h.emergencyContact || '+91 22 2456 0911',
          operatingHours: h.operatingHours || '24/7 Emergency & Inpatient, Outpatient: 08:00 AM - 08:00 PM',
          licenseNumber: h.licenseNumber || 'MH-MEDX-HOSP-2026-8819',
          street: typeof h.address === 'object' ? (h.address?.street || '') : (h.address || '100 Medical Enclave'),
          city: typeof h.address === 'object' ? (h.address?.city || 'Mumbai') : 'Mumbai',
          state: typeof h.address === 'object' ? (h.address?.state || 'Maharashtra') : 'Maharashtra',
          zip: typeof h.address === 'object' ? (h.address?.zip || '400012') : '400012',
          totalBeds: h.bedCapacity?.total || h.totalBeds || 100,
          occupiedBeds: h.bedCapacity?.occupied || 60,
          icuAvailable: h.bedCapacity?.icuAvailable || h.icuBeds || 10
        });
      }
    } catch (err) {
      console.error('Failed to load hospital profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await hospitalService.updateProfile({
        facilityName: formData.facilityName,
        facilityType: formData.facilityType,
        phone: formData.phone,
        email: formData.email,
        emergencyContact: formData.emergencyContact,
        operatingHours: formData.operatingHours,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip
        }
      });
      showToast('Hospital administrative facility profile updated successfully.');
    } catch (err) {
      console.error('Failed to update hospital profile:', err);
      showToast('Error updating hospital profile. Please retry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '84px',
          right: '24px',
          zIndex: 100,
          backgroundColor: 'var(--medx-navy)',
          color: '#FFFFFF',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--medx-radius-md)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          fontSize: '0.875rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderLeft: '4px solid #16A34A'
        }}>
          <Sparkles size={16} color="#4ADE80" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="medx-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            backgroundColor: '#EFF6FF',
            color: '#1E40AF',
            padding: '0.75rem',
            borderRadius: 'var(--medx-radius-md)'
          }}>
            <Building2 size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--medx-navy)', margin: 0 }}>
              Hospital Facility Profile & Settings
            </h2>
            <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0 0' }}>
              Facility credentials, administrative contacts, emergency hotline, and operating capacity
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="medx-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--medx-text-secondary)' }}>
          Loading facility profile...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="medx-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Facility Info */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--medx-navy)', margin: '0 0 1rem 0', borderBottom: '1px solid var(--medx-border)', paddingBottom: '0.5rem' }}>
              Facility Identification & Accreditation
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label className="medx-label">Hospital / Center Name</label>
                <input
                  type="text"
                  className="medx-input"
                  value={formData.facilityName}
                  onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="medx-label">Facility Classification</label>
                <select
                  className="medx-input"
                  value={formData.facilityType}
                  onChange={(e) => setFormData({ ...formData, facilityType: e.target.value })}
                >
                  <option value="General Hospital">General Hospital</option>
                  <option value="Super Specialty">Super Specialty</option>
                  <option value="Clinic">Outpatient Clinic</option>
                  <option value="Trauma Center">Level 1 Trauma Center</option>
                </select>
              </div>

              <div>
                <label className="medx-label">Accredited License Number</label>
                <input
                  type="text"
                  className="medx-input"
                  value={formData.licenseNumber}
                  readOnly
                  style={{ backgroundColor: 'var(--medx-surface-muted)', cursor: 'not-allowed' }}
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--medx-navy)', margin: '0 0 1rem 0', borderBottom: '1px solid var(--medx-border)', paddingBottom: '0.5rem' }}>
              Communication & Emergency Hotline
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label className="medx-label">Primary Administrative Phone</label>
                <input
                  type="text"
                  className="medx-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="medx-label">Official Facility Email</label>
                <input
                  type="email"
                  className="medx-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="medx-label" style={{ color: '#DC2626', fontWeight: 700 }}>
                  24/7 Emergency SOS Hotline
                </label>
                <input
                  type="text"
                  className="medx-input"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  style={{ borderColor: '#FCA5A5' }}
                />
              </div>
            </div>
          </div>

          {/* Operating Schedule */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--medx-navy)', margin: '0 0 1rem 0', borderBottom: '1px solid var(--medx-border)', paddingBottom: '0.5rem' }}>
              Operating Schedule & Physical Location
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="medx-label">Operational Hours</label>
                <input
                  type="text"
                  className="medx-input"
                  value={formData.operatingHours}
                  onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <div>
                  <label className="medx-label">Street Address</label>
                  <input
                    type="text"
                    className="medx-input"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  />
                </div>

                <div>
                  <label className="medx-label">City</label>
                  <input
                    type="text"
                    className="medx-input"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div>
                  <label className="medx-label">State / Region</label>
                  <input
                    type="text"
                    className="medx-input"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>

                <div>
                  <label className="medx-label">Postal / ZIP Code</label>
                  <input
                    type="text"
                    className="medx-input"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bed Capacity Readout */}
          <div style={{
            backgroundColor: 'var(--medx-surface-muted)',
            padding: '1rem',
            borderRadius: 'var(--medx-radius-md)',
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: '1rem',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>Total Facility Beds</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--medx-navy)' }}>{formData.totalBeds}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>Active Inpatient Occupancy</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#D97706' }}>{formData.occupiedBeds}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>ICU Available Units</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16A34A' }}>{formData.icuAvailable}</div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--medx-border)' }}>
            <button
              type="submit"
              disabled={saving}
              className="medx-btn medx-btn-primary"
              style={{ padding: '0.65rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
