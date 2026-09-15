import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

export function Layout({ children }) {
  const location = useLocation();
  const isZeroPadding =
    location.pathname === '/' ||
    location.pathname.startsWith('/hospital');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: 'var(--medx-bg)'
    }}>
      <Navbar />
      <main style={{
        flex: '1 0 auto',
        padding: isZeroPadding ? '0' : '1.75rem 0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
