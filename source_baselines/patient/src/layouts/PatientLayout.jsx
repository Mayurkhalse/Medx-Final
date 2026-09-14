import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LayoutDashboard, PlusCircle, Sparkles, LogOut, User } from 'lucide-react';

const PatientLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div className="logo-section">
            <Activity size={28} />
            <span>MedX</span>
          </div>

          <nav>
            <ul className="nav-links">
              <li>
                <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/entry" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <PlusCircle size={20} />
                  <span>Log Results</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/whatif" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <Sparkles size={20} />
                  <span>What-If AI</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>

        {/* User Identity & Logout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--surface-border)', paddingTop: '20px' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-1)' }}>
                <User size={18} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-strong)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Patient Account
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default PatientLayout;
