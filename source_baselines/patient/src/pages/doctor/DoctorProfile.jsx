import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Stethoscope, Award, FileText, Phone, DollarSign, Save, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DoctorProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    specialty: '',
    licenseNumber: '',
    consultationFee: 0,
    experienceYears: 0,
    bio: '',
    phone: '',
    qualifications: [],
    status: 'active'
  });
  const [qualInput, setQualInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/doctor/profile');
      if (res.data.success && res.data.doctor) {
        const d = res.data.doctor;
        setProfile({
          specialty: d.specialty || '',
          licenseNumber: d.licenseNumber || '',
          consultationFee: d.consultationFee || 0,
          experienceYears: d.experienceYears || 0,
          bio: d.bio || '',
          phone: d.phone || '',
          qualifications: Array.isArray(d.qualifications) ? d.qualifications : [],
          status: d.status || 'active',
          hospitalName: d.hospitalId?.name || 'Associated Medical Center'
        });
      }
    } catch (err) {
      console.error('Failed to load profile', err);
      setMessage({ type: 'danger', text: 'Failed to load doctor profile data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddQualification = (e) => {
    e.preventDefault();
    if (qualInput.trim() && !profile.qualifications.includes(qualInput.trim())) {
      setProfile({
        ...profile,
        qualifications: [...profile.qualifications, qualInput.trim()]
      });
      setQualInput('');
    }
  };

  const handleRemoveQualification = (qual) => {
    setProfile({
      ...profile,
      qualifications: profile.qualifications.filter(q => q !== qual)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      const res = await axios.patch('/api/doctor/profile', profile);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Physician profile updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted">
        <RefreshCw className="animate-spin mr-2" size={20} /> Loading physician profile...
      </div>
    );
  }

  return (
    <div className="doctor-profile-page animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="text-primary" /> Physician Profile & Credentials
          </h1>
          <p className="text-muted text-sm mt-1">
            Manage your medical licensing, clinical specialty, and patient consultation preferences.
          </p>
        </div>
      </div>

      {message.text && (
        <div className={`badge badge-${message.type} p-4 mb-6 flex items-center gap-2 w-full`} style={{ borderRadius: 'var(--radius-md)' }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Header Overview Card */}
      <div className="card mb-6 p-6 flex flex-wrap items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(30, 27, 75, 0.4) 100%)' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-primary shadow-glow">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Dr. {user?.name || 'Physician'}
              <span className={`badge ${profile.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                {profile.status}
              </span>
            </h2>
            <div className="text-sm text-primary flex items-center gap-1 mt-1">
              <Stethoscope size={14} /> {profile.specialty || 'General Physician'} • {profile.hospitalName}
            </div>
            <div className="text-xs text-muted mt-0.5">
              License: <span className="font-mono text-white">{profile.licenseNumber || 'PENDING'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="card p-3 text-center" style={{ minWidth: '110px', background: 'rgba(255, 255, 255, 0.04)' }}>
            <div className="text-xs text-muted">Experience</div>
            <div className="text-xl font-bold text-white mt-1">{profile.experienceYears} Yrs</div>
          </div>
          <div className="card p-3 text-center" style={{ minWidth: '110px', background: 'rgba(255, 255, 255, 0.04)' }}>
            <div className="text-xs text-muted">Consult Fee</div>
            <div className="text-xl font-bold text-white mt-1">${profile.consultationFee}</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-6">
        <h3 className="text-lg font-bold text-white border-b border-white-10 pb-3">
          Clinical Details & Practice Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="text-xs text-muted uppercase font-semibold block mb-2">
              Medical Specialty
            </label>
            <div className="flex items-center gap-2 input-field">
              <Stethoscope size={16} className="text-muted" />
              <input
                type="text"
                className="bg-transparent w-full text-white outline-none"
                placeholder="e.g. Cardiology, Endocrinology, Internal Medicine"
                value={profile.specialty}
                onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="text-xs text-muted uppercase font-semibold block mb-2">
              Medical License / Registration ID
            </label>
            <div className="flex items-center gap-2 input-field">
              <Award size={16} className="text-muted" />
              <input
                type="text"
                className="bg-transparent w-full text-white outline-none"
                placeholder="e.g. MED-894721"
                value={profile.licenseNumber}
                onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="text-xs text-muted uppercase font-semibold block mb-2">
              Years of Clinical Experience
            </label>
            <input
              type="number"
              className="input-field w-full"
              min="0"
              max="60"
              value={profile.experienceYears}
              onChange={(e) => setProfile({ ...profile, experienceYears: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label className="text-xs text-muted uppercase font-semibold block mb-2">
              Consultation Fee ($ USD)
            </label>
            <div className="flex items-center gap-2 input-field">
              <DollarSign size={16} className="text-muted" />
              <input
                type="number"
                className="bg-transparent w-full text-white outline-none"
                min="0"
                value={profile.consultationFee}
                onChange={(e) => setProfile({ ...profile, consultationFee: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="text-xs text-muted uppercase font-semibold block mb-2">
              Contact Phone
            </label>
            <div className="flex items-center gap-2 input-field">
              <Phone size={16} className="text-muted" />
              <input
                type="tel"
                className="bg-transparent w-full text-white outline-none"
                placeholder="+1 (555) 000-0000"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="text-xs text-muted uppercase font-semibold block mb-2">
              Clinical Status
            </label>
            <select
              className="input-field w-full"
              value={profile.status}
              onChange={(e) => setProfile({ ...profile, status: e.target.value })}
            >
              <option value="active" className="bg-neutral-900">Active Practice</option>
              <option value="on_leave" className="bg-neutral-900">On Leave</option>
              <option value="inactive" className="bg-neutral-900">Inactive</option>
            </select>
          </div>
        </div>

        {/* Qualifications Multi-tag */}
        <div className="form-group">
          <label className="text-xs text-muted uppercase font-semibold block mb-2">
            Degrees & Board Certifications
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="e.g. MD, FACC, MBBS, Board Certified Cardiologist"
              value={qualInput}
              onChange={(e) => setQualInput(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddQualification}
            >
              Add Credential
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.qualifications.map((q, idx) => (
              <span key={idx} className="badge badge-primary flex items-center gap-1.5 py-1 px-3">
                {q}
                <button
                  type="button"
                  className="hover:text-red-300 font-bold ml-1"
                  onClick={() => handleRemoveQualification(q)}
                >
                  ×
                </button>
              </span>
            ))}
            {profile.qualifications.length === 0 && (
              <span className="text-xs text-muted italic">No credentials listed yet.</span>
            )}
          </div>
        </div>

        {/* Clinical Bio */}
        <div className="form-group">
          <label className="text-xs text-muted uppercase font-semibold block mb-2">
            Professional Bio & Focus Areas
          </label>
          <textarea
            className="input-field w-full"
            rows="4"
            placeholder="Brief overview of clinical training, research interests, patient care philosophy..."
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-white-10">
          <button
            type="submit"
            className="btn btn-primary flex items-center gap-2"
            disabled={saving}
          >
            {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
            Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  );
}
