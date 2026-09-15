import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Activity, AlertCircle, ArrowRight, User, Stethoscope, Building2, FlaskConical } from 'lucide-react';
import jankotiLogo from '../assets/jankoti-logo.png';
import MedXLogo from '../components/MedXLogo.jsx';

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'patient';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [phone, setPhone] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [labName, setLabName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('role')) {
      setRole(searchParams.get('role'));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const data = await register({
        name,
        email,
        password,
        role,
        phone,
        facilityName,
        labName,
        specialty
      });
      const userRole = data.user.role;
      const redirectTo = `/${userRole === 'patient' ? 'patient' : userRole === 'doctor' ? 'doctor' : userRole === 'hospital_admin' ? 'hospital' : 'lab'}`;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const roleConfigs = [
    { id: 'patient', label: 'Patient', desc: 'Personal Health', icon: User, color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
    { id: 'doctor', label: 'Doctor', desc: 'Clinical Workstation', icon: Stethoscope, color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
    { id: 'hospital_admin', label: 'Hospital', desc: 'Operational Center', icon: Building2, color: '#7E22CE', bg: '#FAF5FF', border: '#E9D5FF' },
    { id: 'lab_admin', label: 'Laboratory', desc: 'Diagnostic Pathology', icon: FlaskConical, color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' }
  ];

  return (
    <div className="medx-container" style={{ maxWidth: '540px', margin: '3rem auto', padding: '0 1rem' }}>
      <div
        className="medx-card stat-card-glow"
        style={{
          boxShadow: '0 12px 36px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(148, 163, 184, 0.22)',
          padding: '2.25rem 2rem',
          borderRadius: 'var(--medx-radius-xl)'
        }}
      >
        {/* Med-X + Jankoti Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
            <MedXLogo size="lg" />

            <div style={{ width: '1px', height: '24px', backgroundColor: '#CBD5E1', margin: '0 0.15rem' }} />

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={jankotiLogo}
                alt="Jankoti"
                style={{ height: '26px', width: 'auto', objectFit: 'contain' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
            Create Your Account
          </h1>
          <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
            Register your profile across the unified healthcare ecosystem
          </p>
        </div>

        {errorMsg && (
          <div className="medx-alert medx-alert-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Polished Visual Role Selector Grid */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="medx-label" style={{ marginBottom: '0.5rem' }}>Select Account Role</label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.625rem'
          }}>
            {roleConfigs.map((r) => {
              const Icon = r.icon;
              const isSelected = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--medx-radius-md)',
                    border: `1.5px solid ${isSelected ? r.color : 'var(--medx-border)'}`,
                    backgroundColor: isSelected ? r.bg : 'var(--medx-surface)',
                    cursor: 'pointer',
                    transition: 'all var(--medx-transition-fast)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--medx-radius-sm)',
                    backgroundColor: isSelected ? r.color : 'var(--medx-surface-muted)',
                    color: isSelected ? '#FFFFFF' : r.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: isSelected ? r.color : 'var(--medx-navy)'
                    }}>
                      {r.label}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'var(--medx-text-muted)'
                    }}>
                      {r.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
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
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : `Register as ${roleConfigs.find(c => c.id === role)?.label || 'User'}`} <ArrowRight size={16} />
          </button>
        </form>

        {/* Login Link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--medx-text-secondary)' }}>
          Already have an account?{' '}
          <Link to={`/login?role=${role}`} style={{ fontWeight: 700, color: 'var(--medx-primary)' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
