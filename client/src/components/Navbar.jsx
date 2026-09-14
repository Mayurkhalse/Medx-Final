import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Activity, LogOut, User as UserIcon } from 'lucide-react';

export function Navbar() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getWorkspacePath = () => {
    switch (role) {
      case 'patient': return '/patient';
      case 'doctor': return '/doctor';
      case 'hospital_admin': return '/hospital';
      case 'lab_admin': return '/lab';
      default: return '/';
    }
  };

  const getRoleBadgeClass = () => {
    switch (role) {
      case 'patient': return 'medx-badge medx-badge-patient';
      case 'doctor': return 'medx-badge medx-badge-doctor';
      case 'hospital_admin': return 'medx-badge medx-badge-hospital';
      case 'lab_admin': return 'medx-badge medx-badge-lab';
      default: return 'medx-badge';
    }
  };

  return (
    <header style={{
      backgroundColor: 'var(--medx-surface)',
      borderBottom: '1px solid var(--medx-border)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="medx-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            backgroundColor: 'var(--medx-primary)',
            color: 'var(--medx-text-inverse)',
            padding: '0.5rem',
            borderRadius: 'var(--medx-radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--medx-navy)' }}>
              MED<span style={{ color: 'var(--medx-primary)' }}>-X</span>
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <>
              <Link to={getWorkspacePath()} className="medx-btn medx-btn-secondary" style={{ fontSize: '0.875rem' }}>
                Go to Workspace
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
                <span className={getRoleBadgeClass()}>
                  {role ? role.replace('_', ' ').toUpperCase() : 'USER'}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--medx-text-secondary)' }}>
                  {user?.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="medx-btn medx-btn-outline"
                style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
                title="Log out"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="medx-btn medx-btn-outline" style={{ fontSize: '0.875rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="medx-btn medx-btn-primary" style={{ fontSize: '0.875rem' }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
