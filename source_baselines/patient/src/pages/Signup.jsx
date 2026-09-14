import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, User, Stethoscope, Building2 } from 'lucide-react';

const Signup = () => {
  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');

  // Doctor-specific
  const [specialty, setSpecialty] = useState('General Medicine');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Hospital-specific
  const [hospitalName, setHospitalName] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      name,
      email,
      password,
      role,
      dob: role === 'patient' ? dob : null,
      gender: role === 'patient' ? gender : '',
      specialty: role === 'doctor' ? specialty : undefined,
      licenseNumber: role === 'doctor' ? licenseNumber : undefined,
      hospitalName: role === 'hospital_admin' ? hospitalName : undefined
    };

    const result = await signup(payload);
    setSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '24px 20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', alignSelf: 'center', color: 'var(--accent-1)' }}>
          <Activity size={36} />
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>MedX</h1>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-strong)' }}>Create Your Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Select your stakeholder role to configure your portal</p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: 'var(--surface-2)', padding: '6px', borderRadius: 'var(--radius-md)' }}>
          <button
            type="button"
            onClick={() => setRole('patient')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 4px',
              borderRadius: 'var(--radius-sm)', border: 'none', background: role === 'patient' ? '#ffffff' : 'transparent',
              color: role === 'patient' ? 'var(--accent-1)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem',
              boxShadow: role === 'patient' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer'
            }}
          >
            <User size={18} />
            <span>Patient</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('doctor')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 4px',
              borderRadius: 'var(--radius-sm)', border: 'none', background: role === 'doctor' ? '#ffffff' : 'transparent',
              color: role === 'doctor' ? 'var(--accent-1)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem',
              boxShadow: role === 'doctor' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer'
            }}
          >
            <Stethoscope size={18} />
            <span>Doctor</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('hospital_admin')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 4px',
              borderRadius: 'var(--radius-sm)', border: 'none', background: role === 'hospital_admin' ? '#ffffff' : 'transparent',
              color: role === 'hospital_admin' ? 'var(--accent-1)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem',
              boxShadow: role === 'hospital_admin' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer'
            }}
          >
            <Building2 size={18} />
            <span>Hospital</span>
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--flag-critical-light)', color: 'var(--flag-critical)', fontSize: '0.875rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{role === 'hospital_admin' ? 'Administrator Name' : 'Full Name'}</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === 'doctor' ? 'Dr. Sarah Smith' : 'Sarah Smith'}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@example.com"
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Role conditional fields */}
          {role === 'patient' && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-input"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label">Gender</label>
                <select className="form-input" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {role === 'doctor' && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label">Clinical Specialty</label>
                <input
                  type="text"
                  className="form-input"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g. Cardiology"
                />
              </div>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label">License Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="MED-74829"
                />
              </div>
            </div>
          )}

          {role === 'hospital_admin' && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Hospital / Institution Name</label>
              <input
                type="text"
                className="form-input"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="St. Jude Memorial Hospital"
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={submitting}>
            {submitting ? 'Creating profile...' : `Create ${role === 'hospital_admin' ? 'Hospital' : role.charAt(0).toUpperCase() + role.slice(1)} Account`}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-1)', fontWeight: 700 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
