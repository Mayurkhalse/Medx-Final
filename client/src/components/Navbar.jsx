import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Activity,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Stethoscope,
  Building2,
  FlaskConical,
  Heart,
  Calendar,
  Settings,
  Clock,
  Menu,
  X,
  Sparkles,
  FileText,
  Users,
  AlertTriangle,
  LayoutDashboard,
  ListOrdered,
  BedDouble,
  Layers,
  AlertOctagon,
  PlusCircle
} from 'lucide-react';
import MedXLogo from './MedXLogo.jsx';
import jankotiLogo from '../assets/jankoti-logo.png';
import ManageProfileModal from './ManageProfileModal.jsx';

export function Navbar() {
  const { user, profile, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [manageProfileOpen, setManageProfileOpen] = useState(false);

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

  // Close menus on route change
  useEffect(() => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const isLandingPage = location.pathname === '/';

  // Role metadata definition
  const getRoleMetadata = () => {
    switch (role) {
      case 'patient':
        return {
          title: 'Personal Health Portal',
          icon: Heart,
          color: '#2563EB',
          bg: '#EFF6FF',
          roleDisplay: 'Patient'
        };
      case 'doctor':
        return {
          title: 'Clinical Workstation',
          icon: Stethoscope,
          color: '#15803D',
          bg: '#F0FDF4',
          roleDisplay: 'Attending Physician'
        };
      case 'hospital_admin':
        return {
          title: 'Operations Command Center',
          icon: Building2,
          color: '#1E40AF',
          bg: '#EFF6FF',
          roleDisplay: 'Hospital Administrator'
        };
      case 'lab_admin':
        return {
          title: 'Diagnostic Laboratory',
          icon: FlaskConical,
          color: '#EA580C',
          bg: '#FFF7ED',
          roleDisplay: 'Laboratory Specialist'
        };
      default:
        return {
          title: 'Connected Health',
          icon: Activity,
          color: '#7C3AED',
          bg: '#F5F3FF',
          roleDisplay: 'User'
        };
    }
  };

  const roleMeta = getRoleMetadata();

  // Active workspace navigation items
  const getRoleNavItems = () => {
    switch (role) {
      case 'patient':
        return [
          { id: 'dashboard', label: 'Dashboard', path: '/patient?tab=dashboard', icon: LayoutDashboard },
          { id: 'reports', label: 'Reports', path: '/patient?tab=reports', icon: FileText },
          { id: 'appointments', label: 'Appointments', path: '/patient?tab=appointments', icon: Calendar },
          { id: 'whatif', label: 'What-If AI', path: '/patient?tab=whatif', icon: Sparkles }
        ];
      case 'doctor':
        return [
          { id: 'workstation', label: 'Workstation', path: '/doctor?tab=workstation', icon: Activity },
          { id: 'patients', label: 'Patients', path: '/doctor?tab=patients', icon: Users },
          { id: 'reports', label: 'Reviews', path: '/doctor?tab=reports', icon: FileText },
          { id: 'appointments', label: 'Appointments', path: '/doctor?tab=appointments', icon: Calendar },
          { id: 'availability', label: 'Availability', path: '/doctor?tab=availability', icon: Clock },
          { id: 'emergency', label: 'SOS Desk', path: '/doctor?tab=emergency', icon: AlertTriangle, isAlert: true }
        ];
      case 'hospital_admin':
        return [
          { id: 'dashboard', label: 'Dashboard', path: '/hospital?tab=dashboard', icon: LayoutDashboard },
          { id: 'care-queue', label: 'Care Queue', path: '/hospital?tab=care-queue', icon: ListOrdered },
          { id: 'beds', label: 'Beds & ICU', path: '/hospital?tab=beds', icon: BedDouble },
          { id: 'patients', label: 'Inpatients', path: '/hospital?tab=patients', icon: Users },
          { id: 'doctors', label: 'Physicians', path: '/hospital?tab=doctors', icon: Stethoscope },
          { id: 'departments', label: 'Departments', path: '/hospital?tab=departments', icon: Layers },
          { id: 'profile-settings', label: 'Facility', path: '/hospital?tab=profile-settings', icon: Settings },
          { id: 'emergency', label: 'Critical SOS', path: '/hospital?tab=emergency', icon: AlertOctagon, isAlert: true }
        ];
      case 'lab_admin':
        return [
          { id: 'dashboard', label: 'Worklist', path: '/lab?tab=dashboard', icon: LayoutDashboard },
          { id: 'reports', label: 'Diagnostic Reports', path: '/lab?tab=reports', icon: FileText },
          { id: 'new_report', label: 'New Report', path: '/lab?tab=new_report', icon: PlusCircle },
          { id: 'profile', label: 'Facility Profile', path: '/lab?tab=profile', icon: Building2 }
        ];
      default:
        return [];
    }
  };

  const navItems = getRoleNavItems();
  const searchParams = new URLSearchParams(location.search);
  const isOverviewPage = location.pathname === '/';
  const currentTab = isOverviewPage
    ? 'home'
    : (searchParams.get('tab') || (role === 'doctor' ? 'workstation' : 'dashboard'));

  const isItemActive = (item) => {
    if (isOverviewPage) {
      return item.id === 'home' || item.path === '/';
    }
    if (item.id === 'home' || item.path === '/') {
      return false;
    }
    const [itemBasePath] = item.path.split('?');
    if (location.pathname !== itemBasePath) {
      return false;
    }
    return currentTab === item.id || (item.id === 'biomarkers' && currentTab === 'dashboard');
  };

  return (
    <>
      <header style={{
        background: 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.25)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '64px',
        boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)',
        transition: 'all 0.2s ease'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          gap: '0.75rem'
        }}>
          {/* LEFT: Authoritative Brand Lockup ([MedX] | [Jankoti]) */}
          <Link
            to={isAuthenticated ? (roleMeta.defaultPath || '/') : '/'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              textDecoration: 'none',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
            aria-label="Med-X Home"
          >
            {/* MedX Authoritative Identity */}
            <MedXLogo size="md" />

            {/* Subtle Vertical Divider */}
            <div style={{
              width: '1px',
              height: '22px',
              backgroundColor: '#CBD5E1',
              margin: '0 0.1rem',
              flexShrink: 0
            }} />

            {/* Jankoti Association (34px height, authentic asset, legible text) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <img
                src={jankotiLogo}
                alt="Jankoti"
                style={{
                  height: '34px',
                  width: 'auto',
                  display: 'block',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </Link>

          {/* CENTER: Primary Workspace Navigation in Sticky Navbar (Desktop) */}
          {isAuthenticated && navItems.length > 0 && (
            <nav
              className="medx-desktop-nav"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                flexWrap: 'nowrap',
                flex: 1,
                justifyContent: 'center',
                padding: '0.25rem 0'
              }}
              aria-label="Workspace Navigation"
            >
              {navItems.map((item) => {
                const ItemIcon = item.icon;
                const isActive = isItemActive(item);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.65rem',
                      borderRadius: 'var(--medx-radius-sm, 6px)',
                      border: 'none',
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      backgroundColor: isActive
                        ? (item.isAlert ? '#FEE2E2' : '#F5F3FF')
                        : 'transparent',
                      color: isActive
                        ? (item.isAlert ? '#DC2626' : '#7C3AED')
                        : '#475569',
                      borderBottom: isActive
                        ? `2px solid ${item.isAlert ? '#DC2626' : '#7C3AED'}`
                        : '2px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <ItemIcon size={15} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* RIGHT: Profile & Account Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {isAuthenticated ? (
              <>
                {/* Mobile Workspace Menu Toggle */}
                <button
                  type="button"
                  id="medx-mobile-nav-toggle"
                  className="medx-mobile-nav-toggle"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  style={{
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid var(--medx-border)',
                    backgroundColor: mobileMenuOpen ? 'var(--medx-surface-muted)' : 'transparent',
                    cursor: 'pointer',
                    color: 'var(--medx-navy)'
                  }}
                  aria-label="Toggle navigation drawer"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                {/* Profile Dropdown Container */}
                <div ref={menuRef} style={{ position: 'relative' }}>
                  {/* Compact Profile Avatar Trigger [PFP Only] */}
                  <button
                    id="profile-menu-toggle"
                    type="button"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease'
                    }}
                    aria-expanded={profileMenuOpen}
                    aria-label="Account Menu"
                  >
                    {/* User Avatar / PFP */}
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: '#7C3AED',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      boxShadow: profileMenuOpen ? '0 0 0 2px #7C3AED' : '0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'all 0.15s ease'
                    }}>
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </button>

                  {/* Concise Account Profile Dropdown (Strictly Account Management) */}
                  {profileMenuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: '240px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 'var(--medx-radius-lg, 12px)',
                        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
                        border: '1px solid var(--medx-border)',
                        zIndex: 100,
                        overflow: 'hidden',
                        animation: 'dropdownFadeIn 0.15s ease-out'
                      }}
                      role="menu"
                    >
                      {/* Identity Header: Name, Email, Role */}
                      <div style={{
                        padding: '0.875rem 1rem',
                        backgroundColor: '#F8FAFC',
                        borderBottom: '1px solid #E2E8F0'
                      }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--medx-navy)', wordBreak: 'break-word' }}>
                          {user?.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', marginTop: '0.15rem', wordBreak: 'break-all' }}>
                          {user?.email}
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '9999px',
                            backgroundColor: roleMeta.bg,
                            color: roleMeta.color,
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em'
                          }}>
                            <ShieldCheck size={12} />
                            {role?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Manage Profile */}
                      <div style={{ padding: '0.35rem 0' }}>
                        <button
                          type="button"
                          id="nav-manage-profile-btn"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            setManageProfileOpen(true);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            padding: '0.6rem 1rem',
                            border: 'none',
                            background: 'none',
                            color: '#334155',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background-color 0.15s ease'
                          }}
                          className="medx-dropdown-item"
                        >
                          <Settings size={16} color="#64748B" />
                          <span>Manage Profile</span>
                        </button>
                      </div>

                      <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: 0 }} />

                      {/* Sign Out */}
                      <div style={{ padding: '0.35rem 0' }}>
                        <button
                          type="button"
                          id="nav-sign-out-btn"
                          onClick={handleLogout}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            padding: '0.6rem 1rem',
                            border: 'none',
                            background: 'none',
                            color: '#334155',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background-color 0.15s ease'
                          }}
                          className="medx-dropdown-item"
                        >
                          <LogOut size={16} color="#64748B" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Public / Unauthenticated Navigation */
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Link
                  to="/login"
                  className="medx-btn medx-btn-outline"
                  style={{ fontSize: '0.8125rem', padding: '0.45rem 0.75rem', whiteSpace: 'nowrap' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="medx-btn medx-btn-primary"
                  style={{ fontSize: '0.8125rem', padding: '0.45rem 0.75rem', whiteSpace: 'nowrap', backgroundColor: '#7C3AED', borderColor: '#7C3AED' }}
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && isAuthenticated && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid #CBD5E1',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              zIndex: 49
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Workspace Navigation
            </div>
            {navItems.map((item) => {
              const ItemIcon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    backgroundColor: isActive
                      ? (item.isAlert ? '#FEE2E2' : '#F5F3FF')
                      : '#F8FAFC',
                    color: isActive
                      ? (item.isAlert ? '#DC2626' : '#7C3AED')
                      : '#334155'
                  }}
                >
                  <ItemIcon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Account Profile Management Modal */}
      <ManageProfileModal
        isOpen={manageProfileOpen}
        onClose={() => setManageProfileOpen(false)}
      />
    </>
  );
}

export default Navbar;
