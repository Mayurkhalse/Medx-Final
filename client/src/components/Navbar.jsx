import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Activity,
  LogOut,
  User as UserIcon,
  ChevronDown,
  ShieldCheck,
  Stethoscope,
  Building2,
  FlaskConical,
  Heart,
  Calendar,
  Settings,
  Clock
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import jankotiLogo from '../assets/jankoti-logo.png';

export function Navbar() {
  const { user, profile, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setProfileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setProfileMenuOpen(false);
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

  const getRoleMetadata = () => {
    switch (role) {
      case 'patient':
        return {
          title: 'Personal Health Portal',
          icon: Heart,
          badgeClass: 'medx-badge-patient',
          color: '#2563EB',
          bg: '#EFF6FF',
          roleDisplay: 'Patient'
        };
      case 'doctor':
        return {
          title: 'Clinical Workstation',
          icon: Stethoscope,
          badgeClass: 'medx-badge-doctor',
          color: '#15803D',
          bg: '#F0FDF4',
          roleDisplay: 'Attending Physician'
        };
      case 'hospital_admin':
        return {
          title: 'Operations Command Center',
          icon: Building2,
          badgeClass: 'medx-badge-hospital',
          color: '#1E40AF',
          bg: '#EFF6FF',
          roleDisplay: 'Hospital Administrator'
        };
      case 'lab_admin':
        return {
          title: 'Diagnostic Laboratory',
          icon: FlaskConical,
          badgeClass: 'medx-badge-lab',
          color: '#D97706',
          bg: '#FEF3C7',
          roleDisplay: 'Laboratory Specialist'
        };
      default:
        return {
          title: 'Connected Health',
          icon: Activity,
          badgeClass: '',
          color: '#2563EB',
          bg: '#EFF6FF',
          roleDisplay: 'User'
        };
    }
  };

  const roleMeta = getRoleMetadata();
  const RoleIcon = roleMeta.icon;

  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(148, 163, 184, 0.25)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      height: '68px',
      boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)',
      transition: 'all 0.2s ease'
    }}>
      <div className="medx-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%'
      }}>
        {/* LEFT: Authoritative Brand Lockup (Med-X + Jankoti) */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
            textDecoration: 'none'
          }}
          aria-label="Med-X Home"
        >
          {/* Med-X Emblem */}
          <img
            src={logoImg}
            alt="Med-X Logo"
            style={{
              height: '34px',
              width: 'auto',
              display: 'block',
              borderRadius: '6px'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />

          {/* Med-X Wordmark */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              color: 'var(--medx-navy)',
              fontFamily: 'var(--medx-font-display)',
              lineHeight: 1
            }}>
              MED<span style={{ color: 'var(--medx-primary)' }}>-X</span>
            </span>
          </div>

          {/* Subtle Vertical Divider */}
          <div style={{
            width: '1px',
            height: '22px',
            backgroundColor: '#CBD5E1',
            margin: '0 0.15rem'
          }} />

          {/* Jankoti Association Lockup */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}>
            <img
              src={jankotiLogo}
              alt="Jankoti"
              style={{
                height: '24px',
                width: 'auto',
                display: 'block',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span style={{
              fontSize: '0.78125rem',
              fontWeight: 700,
              color: '#475569',
              letterSpacing: '0.02em',
              display: 'inline-block'
            }}>
              Jankoti
            </span>
          </div>
        </Link>

        {/* CENTER: Contextual Role Workspace Indicator (when authenticated) */}
        {isAuthenticated && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: roleMeta.bg,
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            border: `1px solid ${roleMeta.color}25`
          }}>
            <RoleIcon size={16} color={roleMeta.color} />
            <span style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: roleMeta.color,
              letterSpacing: '0.01em'
            }}>
              {roleMeta.title}
            </span>
          </div>
        )}

        {/* RIGHT: Profile & Account Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div ref={menuRef} style={{ position: 'relative' }}>
              {/* Profile Menu Trigger */}
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.35rem 0.65rem 0.35rem 0.45rem',
                  backgroundColor: profileMenuOpen ? 'var(--medx-surface-muted)' : 'transparent',
                  border: '1px solid var(--medx-border)',
                  borderRadius: 'var(--medx-radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                aria-expanded={profileMenuOpen}
                aria-label="Account Menu"
              >
                {/* User Avatar Circle */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: roleMeta.color,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.875rem'
                }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>

                {/* User Name & Role Pill */}
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--medx-navy)', lineHeight: 1.2 }}>
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--medx-text-secondary)', fontWeight: 500 }}>
                    {roleMeta.roleDisplay}
                  </span>
                </div>

                <ChevronDown
                  size={15}
                  color="var(--medx-text-secondary)"
                  style={{
                    transform: profileMenuOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.15s ease'
                  }}
                />
              </button>

              {/* Profile & Account Dropdown Panel */}
              {profileMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '300px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--medx-radius-lg)',
                  boxShadow: '0 20px 35px -10px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(15, 23, 42, 0.08)',
                  padding: '1rem',
                  zIndex: 100,
                  animation: 'fadeIn 0.15s ease'
                }}>
                  {/* Account Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    paddingBottom: '0.875rem',
                    borderBottom: '1px solid var(--medx-border)'
                  }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: roleMeta.color,
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.125rem',
                      flexShrink: 0
                    }}>
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--medx-navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.email}
                      </div>
                      <span className={`medx-badge ${roleMeta.badgeClass}`} style={{ fontSize: '0.6875rem', padding: '0.1rem 0.45rem', marginTop: '0.25rem', display: 'inline-block' }}>
                        <ShieldCheck size={12} /> {roleMeta.roleDisplay}
                      </span>
                    </div>
                  </div>

                  {/* Profile Contextual Info */}
                  <div style={{
                    backgroundColor: 'var(--medx-surface-muted)',
                    padding: '0.75rem',
                    borderRadius: 'var(--medx-radius-sm)',
                    margin: '0.75rem 0',
                    fontSize: '0.75rem',
                    color: 'var(--medx-text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}>
                    {role === 'doctor' && (
                      <>
                        <div><strong>Specialty:</strong> {profile?.specialty || 'General Medicine'}</div>
                        <div><strong>Affiliation:</strong> {profile?.hospitalName || 'Med-X Network'}</div>
                      </>
                    )}
                    {role === 'hospital_admin' && (
                      <>
                        <div><strong>Facility:</strong> {profile?.facilityName || 'Institutional Hospital'}</div>
                        <div><strong>Capacity:</strong> {profile?.totalBeds || 100} Beds ({profile?.icuBeds || 10} ICU)</div>
                      </>
                    )}
                    {role === 'patient' && (
                      <>
                        <div><strong>Health Dossier:</strong> Connected & Synchronized</div>
                        <div><strong>Emergency SOS:</strong> Real-Time GPS Active</div>
                      </>
                    )}
                    {role === 'lab_admin' && (
                      <>
                        <div><strong>Laboratory:</strong> Clinical Diagnostics Center</div>
                        <div><strong>Sign-off:</strong> Official Medical Technologist</div>
                      </>
                    )}
                  </div>

                  {/* Role Specific Workspace Links */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <Link
                      to={getWorkspacePath()}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--medx-radius-sm)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: 'var(--medx-navy)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      className="medx-menu-item"
                    >
                      <RoleIcon size={16} color={roleMeta.color} />
                      Open {roleMeta.title}
                    </Link>
                  </div>

                  {/* Logout Button */}
                  <div style={{ paddingTop: '0.75rem', marginTop: '0.75rem', borderTop: '1px solid var(--medx-border)' }}>
                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--medx-radius-sm)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: '#DC2626',
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FEE2E2',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <LogOut size={15} />
                      Sign Out of Med-X
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="medx-btn medx-btn-outline"
                style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="medx-btn medx-btn-primary"
                style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
