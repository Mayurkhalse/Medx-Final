import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';
import MedXLogo from './MedXLogo.jsx';
import jankotiLogo from '../assets/jankoti-logo.png';
import { Menu, X, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export function Layout({ children }) {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('medx_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('medx_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle navigation bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isZeroPadding =
    location.pathname === '/' ||
    location.pathname.startsWith('/hospital');

  return (
    <div className={`medx-app-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* 1. Global Vertical Sidebar (Anchored on Left on Desktop, Drawer on Mobile) */}
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* 2. Main Content Wrapper (Positioned comfortably next to Left Sidebar) */}
      <div className="medx-main-wrapper">
        {/* Floating Unhide / Expand Navigation Bar Button (Desktop only when collapsed) */}
        {sidebarCollapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="medx-unhide-sidebar-btn"
            title="Show navigation bar (Ctrl+B)"
            aria-label="Show navigation bar"
          >
            <PanelLeftOpen size={16} />
            <span>Show Navigation</span>
          </button>
        )}
        {/* Mobile Header Bar (Only visible on small screens < 900px) */}
        <header className="medx-mobile-header">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <MedXLogo size="sm" />
            <div style={{ width: '1px', height: '18px', backgroundColor: '#CBD5E1' }} />
            <img
              src={jankotiLogo}
              alt="Jankoti"
              style={{ height: '26px', width: 'auto', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            {isAuthenticated && (
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: '#7C3AED',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8125rem'
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid var(--medx-border)',
                backgroundColor: mobileOpen ? 'var(--medx-surface-muted)' : 'transparent',
                cursor: 'pointer',
                color: 'var(--medx-navy)'
              }}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* Primary Page Content */}
        <main style={{
          flex: '1 0 auto',
          padding: isZeroPadding ? '0' : '1.75rem 0',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {children}
        </main>

        {/* Global Operational Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
