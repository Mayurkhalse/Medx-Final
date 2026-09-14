import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Activity, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const data = await login(email, password);

      // Navigate to intended destination or user's authorized workspace
      if (from) {
        navigate(from, { replace: true });
      } else {
        switch (data.user.role) {
          case 'patient': navigate('/patient'); break;
          case 'doctor': navigate('/doctor'); break;
          case 'hospital_admin': navigate('/hospital'); break;
          case 'lab_admin': navigate('/lab'); break;
          default: navigate('/');
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Initiate Google OAuth boundary
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="medx-container" style={{ maxWidth: '480px', margin: '2rem auto' }}>
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
            Sign In to Med-X
          </h1>
          <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Access your secure healthcare workspace
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
            <label className="medx-label">Select Workspace Role</label>
            <select
              className="medx-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="patient">Patient Portal</option>
              <option value="doctor">Doctor Workstation</option>
              <option value="hospital_admin">Hospital Operations</option>
              <option value="lab_admin">Diagnostic Laboratory</option>
            </select>
          </div>

          {/* Email Input */}
          <div className="medx-form-group">
            <label className="medx-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="medx-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="medx-form-group">
            <label className="medx-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="medx-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="medx-btn medx-btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Google OAuth (Patient & Doctor only) */}
        {(role === 'patient' || role === 'doctor') && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--medx-text-muted)',
              fontSize: '0.75rem',
              marginBottom: '1rem'
            }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--medx-border)' }} />
              <span>OR CONTINUE WITH</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--medx-border)' }} />
            </div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="medx-btn medx-btn-secondary"
              style={{ width: '100%', padding: '0.625rem', fontSize: '0.875rem' }}
            >
              Sign In with Google ({role})
            </button>
          </div>
        )}

        {/* Register Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--medx-text-secondary)' }}>
          Don't have an account?{' '}
          <Link to={`/register?role=${role}`} style={{ fontWeight: 600 }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
