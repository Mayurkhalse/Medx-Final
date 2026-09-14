import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Activity, AlertCircle, ArrowRight } from 'lucide-react';

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'patient';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(initialRole);
  const [specialty, setSpecialty] = useState('General Physician');
  const [facilityName, setFacilityName] = useState('');
  const [labName, setLabName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Name, email, and password are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const payload = {
        name,
        email,
        password,
        role,
        phone,
        specialty: role === 'doctor' ? specialty : undefined,
        facilityName: role === 'hospital_admin' ? facilityName : undefined,
        labName: role === 'lab_admin' ? labName : undefined
      };

      const data = await register(payload);

      // Navigate to authorized workspace
      switch (data.user.role) {
        case 'patient': navigate('/patient'); break;
        case 'doctor': navigate('/doctor'); break;
        case 'hospital_admin': navigate('/hospital'); break;
        case 'lab_admin': navigate('/lab'); break;
        default: navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Registration failed. Please verify your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medx-container" style={{ maxWidth: '520px', margin: '2rem auto' }}>
      <div className="medx-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            backgroundColor: 'var(--medx-primary-light)',
            color: 'var(--medx-primary)',
            padding: '0.75rem',
            borderRadius: 'var(--medx-radius-lg)',
            marginBottom: '0.75rem'
          }}>
            <Activity size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--medx-navy)' }}>
            Create Med-X Account
          </h1>
          <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Register your profile across the unified healthcare ecosystem
          </p>
        </div>

        {errorMsg && (
          <div className="medx-alert medx-alert-error">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Target Role Selector */}
          <div className="medx-form-group">
            <label className="medx-label">Select Account Role</label>
            <select
              className="medx-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor / Clinician</option>
              <option value="hospital_admin">Hospital Administrator</option>
              <option value="lab_admin">Diagnostic Lab Specialist</option>
            </select>
          </div>

          {/* Full Name */}
          <div className="medx-form-group">
            <label className="medx-label">Full Name</label>
            <input
              type="text"
              className="medx-input"
              placeholder="Dr. Jane Doe / John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="medx-form-group">
            <label className="medx-label">Email Address</label>
            <input
              type="email"
              className="medx-input"
              placeholder="name@healthcare.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Phone */}
          <div className="medx-form-group">
            <label className="medx-label">Phone Number (Optional)</label>
            <input
              type="tel"
              className="medx-input"
              placeholder="+1 555-0199"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Role-Specific Fields */}
          {role === 'doctor' && (
            <div className="medx-form-group">
              <label className="medx-label">Medical Specialty</label>
              <input
                type="text"
                className="medx-input"
                placeholder="Cardiology / General Physician"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>
          )}

          {role === 'hospital_admin' && (
            <div className="medx-form-group">
              <label className="medx-label">Hospital / Facility Name</label>
              <input
                type="text"
                className="medx-input"
                placeholder="Metro General Hospital"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
              />
            </div>
          )}

          {role === 'lab_admin' && (
            <div className="medx-form-group">
              <label className="medx-label">Diagnostic Laboratory Name</label>
              <input
                type="text"
                className="medx-input"
                placeholder="Central PathLabs & Diagnostics"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
              />
            </div>
          )}

          {/* Password */}
          <div className="medx-form-group">
            <label className="medx-label">Password</label>
            <input
              type="password"
              className="medx-input"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="medx-btn medx-btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Login Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--medx-text-secondary)' }}>
          Already have an account?{' '}
          <Link to={`/login?role=${role}`} style={{ fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
