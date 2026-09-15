import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Activity, LogOut, User as UserIcon } from 'lucide-react';
import logoImg from '../assets/logo.png';

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
      background: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(148, 163, 184, 0.22)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
    }}>
      <div className="medx-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px'
      }}>
        {/* Brand Logo & Identifier */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={logoImg}
            alt="Med-X Logo"
            style={{ height: '36px', width: 'auto', display: 'block', borderRadius: '4px' }}
            onError={(e) => {
              // fallback if image not loaded
              e.target.style.display = 'none';
            }}
          />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--medx-navy)', fontFamily: 'var(--medx-font-display)' }}>
              MED<span style={{ color: 'var(--medx-primary)' }}>-X</span>
            </span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--medx-text-muted)', textTransform: 'uppercase' }}>
              Healthcare Platform
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.25rem' }}>
                <span className={getRoleBadgeClass()}>
                  {role ? role.replace('_', ' ').toUpperCase() : 'USER'}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-text-secondary)' }}>
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
              <Link to="/login" className="medx-btn medx-btn-outline" style={{ fontSize: '0.875rem', padding: '0.55rem 1.15rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="medx-btn medx-btn-primary" style={{ fontSize: '0.875rem', padding: '0.55rem 1.15rem' }}>
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
