import React from 'react';
import Navbar from './Navbar.jsx';

export function Layout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: '1 0 auto', padding: '2rem 0' }}>
        {children}
      </main>
      <footer style={{
        backgroundColor: 'var(--medx-surface)',
        borderTop: '1px solid var(--medx-border)',
        padding: '1.5rem 0',
        textAlign: 'center',
        fontSize: '0.8125rem',
        color: 'var(--medx-text-muted)'
      }}>
        <div className="medx-container">
          <p>© 2026 Med-X Unified Healthcare Platform. All clinical systems protected under unified governance.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
