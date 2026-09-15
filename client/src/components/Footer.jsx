import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import jankotiLogo from '../assets/jankoti-logo.png';
import MedXLogo from './MedXLogo.jsx';
import { Activity, ShieldCheck, Heart, Stethoscope, Building2, FlaskConical } from 'lucide-react';

export function Footer() {
  const location = useLocation();
  const pathname = location.pathname;

  const isWorkspace =
    pathname.startsWith('/hospital') ||
    pathname.startsWith('/doctor') ||
    pathname.startsWith('/patient') ||
    pathname.startsWith('/lab');

  // Operational Compact Footer for Workspace Pages
  if (isWorkspace) {
    return (
      <footer style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--medx-border)',
        padding: '0.875rem 0',
        fontSize: '0.75rem',
        color: 'var(--medx-text-muted)'
      }}>
        <div className="medx-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <MedXLogo size="sm" />
            <span>•</span>
            <span style={{ color: '#64748B' }}>Powered by Jankoti</span>
            <span>•</span>
            <span>Unified Clinical Governance</span>
          </div>
          <div>
            © {new Date().getFullYear()} MedX. All rights reserved.
          </div>
        </div>
      </footer>
    );
  }

  // Full Rich Brand Footer for Public Pages (Landing, Login, Register)
  return (
    <footer style={{
      backgroundColor: '#0A1128',
      color: '#E2E8F0',
      borderTop: '1px solid #1E293B',
      paddingTop: '3.5rem',
      paddingBottom: '2rem'
    }}>
      <div className="medx-container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          paddingBottom: '3rem',
          borderBottom: '1px solid #1E293B'
        }}>
          {/* Brand & Mission Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <MedXLogo size="lg" />
            </div>

            <p style={{
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: '#94A3B8',
              margin: 0
            }}>
              Connected health information and clinical workflow ecosystem uniting patients, attending physicians, hospital facilities, and diagnostic laboratories.
            </p>

            {/* Jankoti Brand Endorsement */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--medx-radius-sm)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              width: 'fit-content'
            }}>
              <img
                src={jankotiLogo}
                alt="Jankoti - Igniting Future Ideas"
                style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Platform Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li>
                <a href="/#features" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Problem Areas & Solutions
                </a>
              </li>
              <li>
                <a href="/#coverage" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  System Coverage
                </a>
              </li>
              <li>
                <a href="/#how-it-works" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#contact" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Institutional Inquiries
                </a>
              </li>
            </ul>
          </div>

          {/* Clinical Workspaces */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Integrated Roles
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/patient" style={{ color: '#94A3B8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Heart size={14} color="#60A5FA" />
                  Personal Health Portal
                </Link>
              </li>
              <li>
                <Link to="/doctor" style={{ color: '#94A3B8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Stethoscope size={14} color="#4ADE80" />
                  Clinician Workstation
                </Link>
              </li>
              <li>
                <Link to="/hospital" style={{ color: '#94A3B8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building2 size={14} color="#38BDF8" />
                  Hospital Operations
                </Link>
              </li>
              <li>
                <Link to="/lab" style={{ color: '#94A3B8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FlaskConical size={14} color="#FBBF24" />
                  Diagnostic Laboratory
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Access */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Access Portal
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to="/login"
                className="medx-btn"
                style={{
                  backgroundColor: '#1E293B',
                  color: '#FFFFFF',
                  borderColor: '#334155',
                  fontSize: '0.8125rem',
                  padding: '0.5rem 1rem',
                  textAlign: 'center'
                }}
              >
                Sign In to Account
              </Link>
              <Link
                to="/register"
                className="medx-btn medx-btn-primary"
                style={{
                  fontSize: '0.8125rem',
                  padding: '0.5rem 1rem',
                  textAlign: 'center'
                }}
              >
                Create New Account
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom Strip */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingTop: '1.5rem',
          fontSize: '0.78125rem',
          color: '#64748B'
        }}>
          <div>
            © {new Date().getFullYear()} Med-X. Developed in partnership with Jankoti. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Clinical Data Governance</span>
            <span>Role-Based Access Security</span>
            <span>Interoperable Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
