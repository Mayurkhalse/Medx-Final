import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  LayoutDashboard,
  Users,
  UserCheck,
  FolderKanban,
  FileSpreadsheet,
  AlertOctagon,
  ListOrdered,
  CalendarDays,
  LineChart,
  Settings,
  LogOut,
  Bell
} from 'lucide-react';

const HospitalLayout = ({ children }) => {
  const { user, token, API_HOST, logout } = useAuth();
  const navigate = useNavigate();
  const [criticalCount, setCriticalCount] = useState(0);

  useEffect(() => {
    const fetchCriticalCounts = async () => {
      try {
        const res = await fetch(`${API_HOST}/api/hospital/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.kpis) {
          setCriticalCount(data.kpis.criticalAlerts || 0);
        }
      } catch (e) {
        // Silently handle in dev
      }
    };
    if (token) fetchCriticalCounts();
  }, [token, API_HOST]);

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header className="portal-topbar">
        <div className="portal-topbar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-1)' }}>
              <Building2 size={28} />
              <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>MedX Hospital</span>
            </div>
            <span style={{ fontSize: '0.75rem', background: 'var(--surface-2)', color: 'var(--accent-1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              INSTITUTIONAL PORTAL
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {criticalCount > 0 && (
              <NavLink to="/critical-alerts" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--flag-critical-light)', color: 'var(--flag-critical)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700 }}>
                <AlertOctagon size={16} />
                <span>{criticalCount} Critical Alerts</span>
              </NavLink>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                  {user?.hospitalProfile?.name || user?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hospital Administrator</div>
              </div>
            </div>

            <button onClick={handleSignOut} className="btn btn-secondary btn-sm" title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="portal-nav-bar">
          <nav className="portal-nav-links">
            <NavLink to="/" end className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/patients" className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}>
              <Users size={16} />
              <span>Patients</span>
            </NavLink>
            <NavLink to="/doctors" className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}>
              <UserCheck size={16} />
              <span>Doctors</span>
            </NavLink>
            <NavLink to="/departments" className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}>
              <FolderKanban size={16} />
              <span>Departments</span>
            </NavLink>
            <NavLink to="/lab-reports" className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}>
              <FileSpreadsheet size={16} />
              <span>Lab Reports</span>
            </NavLink>
            <NavLink to="/critical-alerts" className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}>
              <AlertOctagon size={16} />
              <span>Critical Alerts</span>
            </NavLink>
            <NavLink to="/care-queue" className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}>
              <ListOrdered size={16} />
              <span>Care Queue</span>
            </NavLink>
            <NavLink to="/appointments" className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}>
              <CalendarDays size={16} />
              <span>Appointments</span>
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}>
              <LineChart size={16} />
              <span>Analytics</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}>
              <Settings size={16} />
              <span>Profile</span>
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main View Area */}
      <main style={{ flex: 1, padding: '32px 24px', maxWidth: '1360px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  );
};

export default HospitalLayout;
