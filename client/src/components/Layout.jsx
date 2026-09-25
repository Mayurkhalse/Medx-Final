import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';
import MedXLogo from './MedXLogo.jsx';
import jankotiLogo from '../assets/jankoti-logo.png';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export function Layout({ children }) {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isZeroPadding =
    location.pathname === '/' ||
    location.pathname.startsWith('/hospital');

  return (
    <div className="medx-app-wrapper">
      {/* 1. Global Vertical Sidebar (Anchored on Left on Desktop, Drawer on Mobile) */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* 2. Main Content Wrapper (Positioned comfortably next to Left Sidebar) */}
      <div className="medx-main-wrapper">
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
