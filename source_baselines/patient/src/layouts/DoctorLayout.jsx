import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope,
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileText,
  MessageSquare,
  AlertTriangle,
  Clock,
  User,
  LogOut
} from 'lucide-react';

const DoctorLayout = ({ children }) => {
  const { user, token, API_HOST, logout } = useAuth();
  const navigate = useNavigate();
  const [sosCount, setSosCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchSosCount = async () => {
      try {
        const res = await fetch(`${API_HOST}/api/doctor/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.kpis) {
          setSosCount(data.kpis.openSOS || 0);
        }
      } catch (e) {
        // Silently handle
      }
    };
    if (token) fetchSosCount();
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
              <Stethoscope size={28} />
              <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>MedX Clinical</span>
            </div>
            <span style={{ fontSize: '0.75rem', background: 'var(--surface-2)', color: 'var(--accent-1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              DOCTOR WORKSTATION
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <Clock size={16} />
              <span>{currentTime}</span>
            </div>

            {sosCount > 0 && (
              <NavLink to="/emergency-sos" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--flag-critical-light)', color: 'var(--flag-critical)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700 }}>
                <AlertTriangle size={16} />
                <span>{sosCount} Active SOS</span>
              </NavLink>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                  Dr. {user?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {user?.doctorProfile?.specialty || 'General Physician'}
                </div>
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
              <span>Home</span>
            </NavLink>
            <NavLink to="/patients" className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}>
              <Users size={16} />
              <span>My Patients</span>
            </NavLink>
            <NavLink to="/appointments" className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}>
              <CalendarCheck size={16} />
              <span>Appointments</span>
            </NavLink>
            <NavLink to="/medical-records" className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}>
              <FileText size={16} />
              <span>Medical Records</span>
            </NavLink>
            <NavLink to="/messages" className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}>
              <MessageSquare size={16} />
              <span>Messages</span>
            </NavLink>
            <NavLink to="/emergency-sos" className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}>
              <AlertTriangle size={16} />
              <span>Emergency SOS</span>
            </NavLink>
            <NavLink to="/availability" className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}>
              <Clock size={16} />
              <span>Availability</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}>
              <User size={16} />
              <span>My Profile</span>
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

export default DoctorLayout;
