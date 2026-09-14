import React, { useState, useEffect } from 'react';
import { Building2, Save, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import labService from '../../services/labService.js';

export default function LabProfile() {
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    labName: '',
    code: '',
    phone: '',
    email: '',
    contactPerson: '',
    accreditation: '',
    turnaroundHours: 4,
    address: '',
    licenseNumber: ''
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await labService.getProfile();
      if (res.success && res.lab) {
        setLab(res.lab);
        setFormData({
          labName: res.lab.labName || '',
          code: res.lab.code || res.lab.legacyId || '',
          phone: res.lab.phone || '',
          email: res.lab.email || '',
          contactPerson: res.lab.contactPerson || '',
          accreditation: res.lab.accreditation || 'NABL & CAP Accredited',
          turnaroundHours: res.lab.turnaroundHours || 4,
          address: res.lab.address || '',
          licenseNumber: res.lab.licenseNumber || ''
        });
      }
    } catch (err) {
      console.error('Failed to load lab profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setFeedback(null);
      const res = await labService.updateProfile(formData);
      if (res.success) {
        setLab(res.lab);
        setFeedback({ type: 'success', message: 'Laboratory profile updated successfully.' });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error?.message || 'Failed to update profile.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !lab) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--medx-text-secondary)' }}>
        <RefreshCw size={24} className="medx-spin" style={{ marginBottom: '0.75rem' }} />
        <p>Loading laboratory profile...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--medx-navy)' }}>
          Laboratory Facility Profile
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--medx-text-secondary)' }}>
          Manage your diagnostic laboratory identity, accreditations, and quality service standards
        </p>
      </div>

      {feedback && (
        <div style={{
          padding: '0.875rem 1rem',
          borderRadius: 'var(--medx-radius-sm)',
          marginBottom: '1.5rem',
          backgroundColor: feedback.type === 'success' ? '#DCFCE7' : '#FEE2E2',
          color: feedback.type === 'success' ? '#15803D' : '#B91C1C',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="medx-card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Laboratory Facility Name *
            </label>
            <input
              type="text"
              name="labName"
              value={formData.labName}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid var(--medx-border)',
                borderRadius: 'var(--medx-radius-sm)',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Facility Identifier / Code
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid var(--medx-border)',
                borderRadius: 'var(--medx-radius-sm)',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Accreditation Standard
            </label>
            <input
              type="text"
              name="accreditation"
              value={formData.accreditation}
              onChange={handleChange}
              placeholder="e.g. NABL & CAP Certified (ISO 15189)"
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid var(--medx-border)',
                borderRadius: 'var(--medx-radius-sm)',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Target Turnaround Hours
            </label>
            <input
              type="number"
              name="turnaroundHours"
              value={formData.turnaroundHours}
              onChange={handleChange}
              min="1"
              max="72"
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid var(--medx-border)',
                borderRadius: 'var(--medx-radius-sm)',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Contact Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 22 2456 7888"
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid var(--medx-border)',
                borderRadius: 'var(--medx-radius-sm)',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Official Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="reports@medxlabs.org"
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid var(--medx-border)',
                borderRadius: 'var(--medx-radius-sm)',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Lab Director / Contact Person
            </label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="Dr. S. K. Mehta"
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid var(--medx-border)',
                borderRadius: 'var(--medx-radius-sm)',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              License Number
            </label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              placeholder="MH-LAB-2026-981"
              style={{
                width: '100%',
                padding: '0.625rem',
                border: '1px solid var(--medx-border)',
                borderRadius: 'var(--medx-radius-sm)',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
            Facility Physical Address
          </label>
          <textarea
            rows="2"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Ground Floor, Wing D, Diagnostic Complex..."
            style={{
              width: '100%',
              padding: '0.625rem',
              border: '1px solid var(--medx-border)',
              borderRadius: 'var(--medx-radius-sm)',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="medx-btn medx-btn-primary"
            disabled={saving}
            style={{ backgroundColor: '#EA580C', borderColor: '#EA580C' }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Update Lab Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
