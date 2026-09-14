import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export function UnauthorizedPage() {
  const { user, role } = useAuth();
  const location = useLocation();
  const attemptedRole = location.state?.attemptedRole || role;
  const allowedRoles = location.state?.allowedRoles || [];

  const getAuthorizedHome = () => {
    switch (role) {
      case 'patient': return '/patient';
      case 'doctor': return '/doctor';
      case 'hospital_admin': return '/hospital';
      case 'lab_admin': return '/lab';
      default: return '/';
    }
  };

  return (
    <div className="medx-container" style={{ maxWidth: '540px', margin: '4rem auto', textAlign: 'center' }}>
      <div className="medx-card">
        <div style={{
          display: 'inline-flex',
          backgroundColor: '#FEE2E2',
          color: '#991B1B',
          padding: '1rem',
          borderRadius: 'var(--medx-radius-full)',
          marginBottom: '1.25rem'
        }}>
          <ShieldAlert size={36} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--medx-navy)', marginBottom: '0.75rem' }}>
          403 — Unauthorized Role Access
        </h1>
        <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Your active session role is <strong>{attemptedRole ? attemptedRole.replace('_', ' ').toUpperCase() : 'UNKNOWN'}</strong>. You do not have permission to access this protected workspace.
          {allowedRoles.length > 0 && (
            <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--medx-text-muted)' }}>
              Required role(s): [{allowedRoles.join(', ')}]
            </span>
          )}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link to={getAuthorizedHome()} className="medx-btn medx-btn-primary">
            <ArrowLeft size={16} /> Return to Your Authorized Workspace
          </Link>
          <Link to="/" className="medx-btn medx-btn-secondary">
            <Home size={16} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
