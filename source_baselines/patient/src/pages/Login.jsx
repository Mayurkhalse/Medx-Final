import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, User, Stethoscope, Building2, Zap } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    role: 'Patient',
    email: 'patient@medx.com',
    password: 'password123',
    icon: User,
    color: '#10b981',
    desc: 'Marcus Chen (Personal Dashboard & Labs)'
  },
  {
    role: 'Hospital Admin',
    email: 'hospital@medx.com',
    password: 'password123',
    icon: Building2,
    color: '#6d28d9',
    desc: 'Metro General Health (Census & Triage)'
  },
  {
    role: 'Doctor',
    email: 'doctor@medx.com',
    password: 'password123',
    icon: Stethoscope,
    color: '#3b82f6',
    desc: 'Dr. Sarah Mitchell (Cardiology Workstation)'
  }
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (loginEmail, loginPass) => {
    setError('');
    setSubmitting(true);
    const result = await login(loginEmail, loginPass);
    setSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLoginSubmit(email, password);
  };

  const handleQuickDemoLogin = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
    handleLoginSubmit(demo.email, demo.password);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '24px 20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', alignSelf: 'center', color: 'var(--accent-1)' }}>
          <Activity size={36} />
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>MedX</h1>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-strong)' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sign in to access your healthcare portal</p>
        </div>

        {/* 1-Click Demo Logins Banner */}
        <div style={{ background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.25)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.775rem', fontWeight: 800, color: 'var(--accent-1)', textTransform: 'uppercase', marginBottom: '8px' }}>
            <Zap size={14} />
            <span>1-Click Demo Login</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {DEMO_ACCOUNTS.map((demo) => {
              const IconComp = demo.icon;
              return (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleQuickDemoLogin(demo)}
                  disabled={submitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: 'var(--text-strong)',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = demo.color)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: `${demo.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: demo.color }}>
                      <IconComp size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{demo.role}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{demo.email}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.725rem', fontWeight: 700, color: demo.color }}>
                    Sign In →
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--flag-critical-light)', color: 'var(--flag-critical)', fontSize: '0.875rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Or Custom Login</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@medx.com"
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={submitting}>
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-1)', fontWeight: 700 }}>Create account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
