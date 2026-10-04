import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getWorkspacePathForRole, isPathAllowedForRole } from '../utils/roleUtils.js';
import { Activity, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Stethoscope, Building2, FlaskConical, User } from 'lucide-react';
import jankotiLogo from '../assets/jankoti-logo.png';
import MedXLogo from '../components/MedXLogo.jsx';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'patient';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from;

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['patient', 'doctor', 'hospital_admin', 'lab_admin'].includes(roleParam)) {
      setRole(roleParam);
    }
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
    }
  }, [searchParams, location.state]);

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
      const userRole = data?.user?.role || role;

      // Determine role workspace path dynamically
      let redirectPath = getWorkspacePathForRole(userRole);
      if (from?.pathname && isPathAllowedForRole(from.pathname, userRole)) {
        redirectPath = from.pathname + (from.search || '');
      }

      navigate(redirectPath, { replace: true });
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

  const roleConfigs = [
    { id: 'patient', label: 'Patient', desc: 'Personal Health', icon: User, color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
    { id: 'doctor', label: 'Doctor', desc: 'Clinical Workstation', icon: Stethoscope, color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
    { id: 'hospital_admin', label: 'Hospital', desc: 'Operational Center', icon: Building2, color: '#7E22CE', bg: '#FAF5FF', border: '#E9D5FF' },
    { id: 'lab_admin', label: 'Laboratory', desc: 'Diagnostic Pathology', icon: FlaskConical, color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' }
  ];

  return (
    <div className="medx-container" style={{ maxWidth: '520px', margin: '3rem auto', padding: '0 1rem' }}>
      <div
        className="medx-card stat-card-glow"
        style={{
          boxShadow: '0 12px 36px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(148, 163, 184, 0.22)',
          padding: '2.25rem 2rem',
          borderRadius: 'var(--medx-radius-xl)'
        }}
      >
        {/* Med-X + Jankoti Branded Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
            <MedXLogo size="lg" />

            <div style={{ width: '1px', height: '24px', backgroundColor: '#CBD5E1', margin: '0 0.15rem' }} />

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={jankotiLogo}
                alt="Jankoti"
                style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
            Sign In to Your Workspace
          </h1>
          <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
            Select your healthcare role to access your dedicated workspace
          </p>
        </div>

        {/* 1-Click Demo Login Shortcuts */}
        <div style={{
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '0.875rem 1rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ⚡ 1-Click Demo Accounts (Password: Password123!)
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {[
              { role: 'patient', label: 'Patient (John Doe)', email: 'patient@medx.org', pass: 'Password123!', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
              { role: 'doctor', label: 'Doctor (Dr. Jenkins)', email: 'doctor@medx.org', pass: 'Password123!', color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
              { role: 'hospital_admin', label: 'Hospital Admin', email: 'hospital@medx.org', pass: 'Password123!', color: '#7E22CE', bg: '#FAF5FF', border: '#E9D5FF' },
              { role: 'lab_admin', label: 'Lab Specialist', email: 'lab@medx.org', pass: 'Password123!', color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' }
            ].map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setRole(acc.role);
                  setEmail(acc.email);
                  setPassword(acc.pass);
                  setErrorMsg('');
                }}
                style={{
                  padding: '0.45rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: acc.color,
                  backgroundColor: acc.bg,
                  border: `1px solid ${acc.border}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
                title={`Click to autofill ${acc.email} / ${acc.pass}`}
              >
                <span>{acc.label}</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>Fill</span>
              </button>
            ))}
          </div>
        </div>

        {successMsg && (
          <div className="medx-alert medx-alert-info" style={{ marginBottom: '1.25rem', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="medx-alert medx-alert-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} />
            <div style={{ flex: 1 }}>
              <div>{errorMsg}</div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#B91C1C' }}>
                Tip: Seeded accounts use password <strong>Password123!</strong>. Click any demo account above to autofill.
              </div>
            </div>
          </div>
        )}

        {/* Polished Visual Role Selector Grid */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="medx-label" style={{ marginBottom: '0.5rem' }}>Select Workspace Role</label>
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
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : `Sign In as ${roleConfigs.find(c => c.id === role)?.label || 'User'}`} <ArrowRight size={16} />
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
              style={{
                width: '100%',
                padding: '0.7rem',
                fontSize: '0.875rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.625rem'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign In with Google ({roleConfigs.find(c => c.id === role)?.label})</span>
            </button>
          </div>
        )}

        {/* Register Link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--medx-text-secondary)' }}>
          Don't have an account?{' '}
          <Link to={`/register?role=${role}`} style={{ fontWeight: 700, color: 'var(--medx-primary)' }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
