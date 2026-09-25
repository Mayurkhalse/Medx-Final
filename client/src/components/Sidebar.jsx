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
  PlusCircle,
  ChevronRight,
  Home,
  HelpCircle,
  PhoneCall
} from 'lucide-react';
import MedXLogo from './MedXLogo.jsx';
import jankotiLogo from '../assets/jankoti-logo.png';
import ManageProfileModal from './ManageProfileModal.jsx';

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, profile, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [manageProfileOpen, setManageProfileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  }, [location.pathname, location.search, setMobileOpen]);

  const handleLogout = async () => {
    if (setMobileOpen) setMobileOpen(false);
    await logout();
    navigate('/login');
  };

  // Role metadata definition
  const getRoleMetadata = () => {
    switch (role) {
      case 'patient':
        return {
          title: 'Personal Health Portal',
          icon: Heart,
          color: '#2563EB',
          bg: '#EFF6FF',
          roleDisplay: 'Patient',
          defaultPath: '/patient'
        };
      case 'doctor':
        return {
          title: 'Clinical Workstation',
          icon: Stethoscope,
          color: '#15803D',
          bg: '#F0FDF4',
          roleDisplay: 'Attending Physician',
          defaultPath: '/doctor'
        };
      case 'hospital_admin':
        return {
          title: 'Operations Center',
          icon: Building2,
          color: '#1E40AF',
          bg: '#EFF6FF',
          roleDisplay: 'Hospital Administrator',
          defaultPath: '/hospital'
        };
      case 'lab_admin':
        return {
          title: 'Diagnostic Laboratory',
          icon: FlaskConical,
          color: '#EA580C',
          bg: '#FFF7ED',
          roleDisplay: 'Laboratory Specialist',
          defaultPath: '/lab'
        };
      default:
        return {
          title: 'Connected Health',
          icon: Activity,
          color: '#7C3AED',
          bg: '#F5F3FF',
          roleDisplay: 'User',
          defaultPath: '/'
        };
    }
  };

  const roleMeta = getRoleMetadata();

  // Navigation Items per role
  const getRoleNavItems = () => {
    switch (role) {
      case 'patient':
        return [
          { id: 'dashboard', label: 'Dashboard', path: '/patient?tab=dashboard', icon: LayoutDashboard },
          { id: 'reports', label: 'Reports', path: '/patient?tab=reports', icon: FileText },
          { id: 'whatif', label: 'What-If AI', path: '/patient?tab=whatif', icon: Sparkles },
          { id: 'home', label: 'Overview', path: '/', icon: Home }
        ];
      case 'doctor':
        return [
          { id: 'workstation', label: 'Workstation', path: '/doctor?tab=workstation', icon: Activity },
          { id: 'patients', label: 'Patients', path: '/doctor?tab=patients', icon: Users },
          { id: 'reports', label: 'Reviews', path: '/doctor?tab=reports', icon: FileText },
          { id: 'appointments', label: 'Appointments', path: '/doctor?tab=appointments', icon: Calendar },
          { id: 'availability', label: 'Availability', path: '/doctor?tab=availability', icon: Clock },
          { id: 'emergency', label: 'SOS Desk', path: '/doctor?tab=emergency', icon: AlertTriangle, isAlert: true },
          { id: 'home', label: 'Overview', path: '/', icon: Home }
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
          { id: 'emergency', label: 'Critical SOS', path: '/hospital?tab=emergency', icon: AlertOctagon, isAlert: true },
          { id: 'home', label: 'Overview', path: '/', icon: Home }
        ];
      case 'lab_admin':
        return [
          { id: 'dashboard', label: 'Worklist', path: '/lab?tab=dashboard', icon: LayoutDashboard },
          { id: 'reports', label: 'Diagnostic Reports', path: '/lab?tab=reports', icon: FileText },
          { id: 'new_report', label: 'New Report', path: '/lab?tab=new_report', icon: PlusCircle },
          { id: 'profile', label: 'Facility Profile', path: '/lab?tab=profile', icon: Building2 },
          { id: 'home', label: 'Overview', path: '/', icon: Home }
        ];
      default:
        return [
          { id: 'home', label: 'Overview', path: '/', icon: Home },
          { id: 'features', label: 'Solutions', path: '/#features', icon: ShieldCheck },
          { id: 'how-it-works', label: 'How It Works', path: '/#how-it-works', icon: HelpCircle },
          { id: 'contact', label: 'Inquiries', path: '/#contact', icon: PhoneCall }
        ];
    }
  };

  const navItems = getRoleNavItems();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || (role === 'doctor' ? 'workstation' : (role === 'patient' ? 'dashboard' : 'dashboard'));

  const RoleIcon = roleMeta.icon;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div
        className={`medx-sidebar-backdrop ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Global Vertical Left Sidebar */}
      <aside className={`medx-sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* 1. BRANDING PLACEMENT: MedX / Jankoti Logo anchored at very top */}
        <div style={{
          padding: '1.25rem 1.25rem 1rem 1.25rem',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                textDecoration: 'none',
                flexShrink: 0
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

              {/* Jankoti Association */}
              <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <img
                  src={jankotiLogo}
                  alt="Jankoti"
                  style={{
                    height: '32px',
                    width: 'auto',
                    display: 'block',
                    objectFit: 'contain'
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </Link>

            {/* Mobile close toggle */}
            <button
              type="button"
              className="medx-mobile-close-btn"
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'none',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: '#64748B',
                padding: '0.25rem'
              }}
              aria-label="Close Sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Active Role/Workspace Badge Header */}
          {isAuthenticated && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              backgroundColor: roleMeta.bg,
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--medx-radius-md, 8px)',
              border: `1px solid ${roleMeta.color}25`
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: roleMeta.color,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <RoleIcon size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: '0.78125rem',
                  fontWeight: 700,
                  color: 'var(--medx-navy)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {roleMeta.title}
                </div>
                <div style={{
                  fontSize: '0.6875rem',
                  color: roleMeta.color,
                  fontWeight: 600
                }}>
                  {roleMeta.roleDisplay}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. NAVIGATION LINKS: Vertical List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.75rem 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          <div style={{
            fontSize: '0.6875rem',
            fontWeight: 800,
            color: '#94A3B8',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '0.5rem 1.25rem 0.25rem 1.25rem'
          }}>
            {isAuthenticated ? 'Workspace Navigation' : 'Platform Links'}
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {navItems.map((item) => {
              const ItemIcon = item.icon;
              const isActive = isAuthenticated
                ? (currentTab === item.id || (item.id === 'biomarkers' && currentTab === 'dashboard'))
                : (location.pathname === item.path || (location.pathname === '/' && item.path === '/'));

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (setMobileOpen) setMobileOpen(false);
                    if (item.path.startsWith('/#')) {
                      navigate('/');
                      setTimeout(() => {
                        const elem = document.querySelector(item.path.substring(1));
                        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    } else {
                      navigate(item.path);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: 'calc(100% - 1.5rem)',
                    margin: '0 0.75rem',
                    padding: '0.65rem 0.875rem',
                    borderRadius: 'var(--medx-radius-sm, 6px)',
                    border: 'none',
                    borderLeft: isActive
                      ? `3.5px solid ${item.isAlert ? '#DC2626' : '#7C3AED'}`
                      : '3.5px solid transparent',
                    fontSize: '0.84375rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    textAlign: 'left',
                    backgroundColor: isActive
                      ? (item.isAlert ? '#FEE2E2' : '#F5F3FF')
                      : 'transparent',
                    color: isActive
                      ? (item.isAlert ? '#DC2626' : '#7C3AED')
                      : '#475569',
                    transition: 'all 0.15s ease'
                  }}
                  className="medx-sidebar-nav-item"
                >
                  <ItemIcon size={18} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.isAlert && (
                    <span style={{
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      fontSize: '0.625rem',
                      fontWeight: 800,
                      padding: '0.1rem 0.4rem',
                      borderRadius: '9999px',
                      textTransform: 'uppercase'
                    }}>
                      SOS
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 3. USER PROFILE & ACCOUNT CONTROLS: Anchored at bottom of vertical sidebar */}
        <div style={{
          borderTop: '1px solid rgba(148, 163, 184, 0.25)',
          backgroundColor: '#F8FAFC',
          padding: '0.875rem 1rem'
        }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* User Identity Preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#7C3AED',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  flexShrink: 0
                }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: '0.84375rem',
                    fontWeight: 700,
                    color: 'var(--medx-navy)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {user?.name}
                  </div>
                  <div style={{
                    fontSize: '0.71875rem',
                    color: 'var(--medx-text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Manage Profile & Sign Out */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <button
                  type="button"
                  id="nav-manage-profile-btn"
                  onClick={() => {
                    if (setMobileOpen) setMobileOpen(false);
                    setManageProfileOpen(true);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontSize: '0.78125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  className="medx-sidebar-btn"
                >
                  <Settings size={15} color="#64748B" />
                  <span>Manage Profile</span>
                </button>

                <button
                  type="button"
                  id="nav-sign-out-btn"
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#DC2626',
                    fontSize: '0.78125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  className="medx-sidebar-btn"
                >
                  <LogOut size={15} color="#DC2626" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Unauthenticated Access Buttons */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                to="/login"
                className="medx-btn medx-btn-outline"
                style={{
                  width: '100%',
                  fontSize: '0.8125rem',
                  padding: '0.5rem',
                  justifyContent: 'center'
                }}
                onClick={() => setMobileOpen && setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="medx-btn medx-btn-primary"
                style={{
                  width: '100%',
                  fontSize: '0.8125rem',
                  padding: '0.5rem',
                  justifyContent: 'center',
                  backgroundColor: '#7C3AED',
                  borderColor: '#7C3AED'
                }}
                onClick={() => setMobileOpen && setMobileOpen(false)}
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Account Profile Management Modal */}
      <ManageProfileModal
        isOpen={manageProfileOpen}
        onClose={() => setManageProfileOpen(false)}
      />
    </>
  );
}

export default Sidebar;
