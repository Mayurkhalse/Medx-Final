import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Navbar = () => {
  const {
    user,
    isAuthenticated,
    isOrganization,
    logout
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [showDropdown, setShowDropdown] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const [showMobileMenu, setShowMobileMenu] = useState(false);

  /*
   * The OAuth-selected workspace is retained in sessionStorage.
   * This is useful during the current UI/mockup phase because
   * the backend role is not yet a persistent clinical role model.
   */
  const selectedWorkspace =
    sessionStorage.getItem('medxSelectedRole');

  const professionalWorkspace =
    isOrganization ||
    selectedWorkspace === 'organization';

  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    setAvatarError(false);
    setShowDropdown(false);
    setShowMobileMenu(false);
  }, [user?.profilePicture, location.pathname]);

  const handleLogout = async () => {
    sessionStorage.removeItem('medxSelectedRole');
    await logout();
    navigate('/login');
    setShowDropdown(false);
  };

  const scrollToLandingSection = (sectionId) => {
    setShowMobileMenu(false);
    if (isLandingPage) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  /*
   * Keep the complete Med-X feature ecosystem visible.
   *
   * The workspace entry differs by role, but shared Med-X
   * capabilities remain available.
   */
  const navigationLinks = professionalWorkspace
    ? [
        { path: '/professional', label: 'Workspace' },
        { path: '/professional/patients', label: 'Patients' },
        { path: '/professional/reports', label: 'Reports' },
        { path: '/professional/monitoring', label: 'Monitoring' },
        { path: '/professional/alerts', label: 'Alerts' },
        { path: '/professional/ask-medx', label: 'Ask Med-X' }
      ]
    : [
        { path: '/dashboard', label: 'Home' },
        { path: '/health', label: 'My Health' },
        { path: '/reports', label: 'Reports' },
        { path: '/monitoring', label: 'Monitoring' },
        { path: '/alerts', label: 'Alerts' },
        { path: '/ask-medx', label: 'Ask Med-X' }
      ];

  const landingNavItems = [
    { id: 'features', label: 'Features' },
    { id: 'coverage', label: 'Coverage' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'contact', label: 'Contact' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return (
        location.pathname === '/dashboard'
      );
    }

    // Workspace is only active on the professional home page.
    if (path === '/professional') {
      return location.pathname === '/professional';
    }

    // Other professional sections remain active for their sub-routes.
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  const homePath = professionalWorkspace
    ? '/professional'
    : '/dashboard';

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <div className="navbar-container">

        <Link
          to="/"
          className="navbar-logo"
          aria-label="Med-X Home"
        >
          <img
            src={logo}
            alt="Med-X"
            className="navbar-logo-image"
          />
        </Link>

        {/* Center Navigation: Landing Page Sections OR Authenticated Workspace Links */}
        <div className="navbar-links">

          {isLandingPage ? (
            <div className="landing-nav-links" role="menubar">
              {landingNavItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="landing-nav-link"
                  onClick={() => scrollToLandingSection(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : (
            isAuthenticated &&
            navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${
                  isActive(link.path) ? 'nav-link-active' : ''
                }`}
              >
                {link.label}
              </Link>
            ))
          )}

          {isAuthenticated ? (

            <div className="user-menu">

              {isLandingPage && (
                <Link
                  to={homePath}
                  className="btn btn-outline btn-sm"
                  style={{ marginRight: '6px' }}
                >
                  {professionalWorkspace ? 'Workspace' : 'Dashboard'}
                </Link>
              )}

              <div className="dropdown">

                <button
                  type="button"
                  className="user-menu-btn"
                  onClick={() =>
                    setShowDropdown((value) => !value)
                  }
                  aria-expanded={showDropdown}
                >

                  {user?.profilePicture && !avatarError ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name || 'User avatar'}
                      className="user-avatar"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {user?.name
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <span>
                    {user?.name || 'Account'}
                  </span>

                  <span className="user-menu-chevron">
                    ▾
                  </span>

                </button>

                {showDropdown && (
                  <div className="dropdown-content">

                    <Link to={homePath}>
                      {professionalWorkspace
                        ? 'Workspace'
                        : 'Dashboard'}
                    </Link>

                    <Link to="/profile">
                      Profile & Settings
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                    >
                      Sign out
                    </button>

                  </div>
                )}

              </div>

            </div>

          ) : (

            <>
              <Link
                to="/login"
                className="btn btn-outline btn-sm"
              >
                Sign in
              </Link>

              <Link
                to="/register"
                className="btn btn-primary btn-sm"
              >
                Create account
              </Link>
            </>

          )}

          {/* Mobile Menu Toggle for Landing Page */}
          {isLandingPage && (
            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setShowMobileMenu((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={showMobileMenu}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {showMobileMenu ? (
                  <path d="M18 6L6 18M6 6l12 12"></path>
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18"></path>
                )}
              </svg>
            </button>
          )}

        </div>

      </div>

      {/* Mobile Drawer Menu for Landing Page */}
      {isLandingPage && showMobileMenu && (
        <div className="landing-mobile-menu">
          {landingNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToLandingSection(item.id)}
            >
              {item.label}
            </button>
          ))}
          {!isAuthenticated && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <Link
                to="/login"
                className="btn btn-outline btn-sm"
                onClick={() => setShowMobileMenu(false)}
                style={{ flex: 1 }}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-sm"
                onClick={() => setShowMobileMenu(false)}
                style={{ flex: 1 }}
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

