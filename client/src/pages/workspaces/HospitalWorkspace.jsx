import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  ShieldCheck, Building2, LayoutDashboard,
  ListOrdered, BedDouble, Users, Stethoscope, AlertOctagon
} from 'lucide-react';
import HospitalDashboard from '../hospital/HospitalDashboard.jsx';
import HospitalCareQueue from '../hospital/HospitalCareQueue.jsx';
import HospitalBeds from '../hospital/HospitalBeds.jsx';
import HospitalPatients from '../hospital/HospitalPatients.jsx';
import HospitalDoctors from '../hospital/HospitalDoctors.jsx';
import HospitalEmergency from '../hospital/HospitalEmergency.jsx';
import emergencyService from '../../services/emergencyService.js';

export function HospitalWorkspace() {
  const { user, profile, role } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'care-queue' | 'beds' | 'patients' | 'doctors' | 'emergency'
  const [activeSosCount, setActiveSosCount] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Poll hospital active emergency alerts every 5s
  useEffect(() => {
    const pollAlerts = async () => {
      try {
        const res = await emergencyService.getActiveCount();
        if (res && typeof res.activeCount === 'number') {
          setActiveSosCount(res.activeCount);
        }
      } catch (err) {
        // quiet ignore for badge polling
      }
    };
    pollAlerts();
    const interval = setInterval(pollAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Operations Dashboard',
      shortLabel: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'care-queue',
      label: 'Care Queue (6-Stage)',
      shortLabel: 'Care Queue',
      icon: ListOrdered,
      badge: null
    },
    {
      id: 'beds',
      label: 'Beds & ICU Occupancy',
      shortLabel: 'Beds/ICU',
      icon: BedDouble,
      badge: `${profile?.totalBeds || 100} Beds`
    },
    {
      id: 'patients',
      label: 'Inpatient Directory',
      shortLabel: 'Patients',
      icon: Users,
      badge: null
    },
    {
      id: 'doctors',
      label: 'Physician Roster',
      shortLabel: 'Physicians',
      icon: Stethoscope,
      badge: null
    },
    {
      id: 'emergency',
      label: 'Critical Alerts & SOS Desk',
      shortLabel: 'Emergency SOS',
      icon: AlertOctagon,
      badge: activeSosCount > 0 ? activeSosCount : null,
      isEmergency: true
    }
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: 'calc(100vh - 72px)',
      backgroundColor: 'var(--medx-bg)',
      transition: 'all 0.2s ease'
    }}>
      {/* 1. RESTORED AUTHENTIC HOSPITAL OPERATIONAL SIDEBAR */}
      <aside
        aria-label="Hospital Operations Navigation"
        style={{
          width: sidebarCollapsed ? '72px' : '260px',
          backgroundColor: '#0B1329', // Authentic dark operational slate
          color: '#E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid #1E293B',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0,
          position: 'sticky',
          top: '72px',
          height: 'calc(100vh - 72px)',
          zIndex: 40,
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Sidebar Header & Brand Stamp */}
        <div>
          <div style={{
            padding: sidebarCollapsed ? '1.25rem 0.5rem' : '1.25rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            borderBottom: '1px solid #1E293B'
          }}>
            {!sidebarCollapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
                <div style={{
                  backgroundColor: '#7E22CE',
                  color: '#FFFFFF',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 12px rgba(126, 34, 206, 0.5)'
                }}>
                  <Building2 size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.8125rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    color: '#F8FAFC',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    COMMAND DESK
                  </div>
                  <div style={{
                    fontSize: '0.6875rem',
                    color: '#94A3B8',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {profile?.code || 'HOSP-MEDX-01'}
                  </div>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <div style={{
                backgroundColor: '#7E22CE',
                color: '#FFFFFF',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(126, 34, 206, 0.5)'
              }}>
                <Building2 size={20} />
              </div>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand Navigation Sidebar' : 'Collapse Sidebar'}
              style={{
                background: '#1E293B',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                borderRadius: '4px',
                padding: '0.35rem',
                display: sidebarCollapsed ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: '0.75rem' }}>◀</span>
            </button>
          </div>

          {/* Expand Button for Collapsed Mode */}
          {sidebarCollapsed && (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                title="Expand Navigation Sidebar"
                style={{
                  background: '#1E293B',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem'
                }}
              >
                ▶
              </button>
            </div>
          )}

          {/* Operational Navigation List */}
          <nav style={{ padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                    gap: '0.75rem',
                    width: '100%',
                    padding: sidebarCollapsed ? '0.75rem 0' : '0.6875rem 0.875rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isActive ? 'rgba(126, 34, 206, 0.22)' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 700 : 500,
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? 'inset 3px 0 0 #A855F7' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = '#F8FAFC';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#94A3B8';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <Icon size={19} color={isActive ? '#C084FC' : item.isEmergency && activeSosCount > 0 ? '#F43F5E' : 'currentColor'} />
                    {!sidebarCollapsed && (
                      <span style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.label}
                      </span>
                    )}
                  </div>

                  {!sidebarCollapsed && item.badge && (
                    <span style={{
                      backgroundColor: item.isEmergency && activeSosCount > 0 ? '#E11D48' : '#334155',
                      color: '#FFFFFF',
                      borderRadius: '9999px',
                      padding: '0.1rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      boxShadow: item.isEmergency && activeSosCount > 0 ? '0 0 10px rgba(225, 29, 72, 0.6)' : 'none'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Institutional Footer */}
        {!sidebarCollapsed && (
          <div style={{
            padding: '1rem',
            borderTop: '1px solid #1E293B',
            fontSize: '0.75rem',
            color: '#64748B'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
              <span style={{ color: '#10B981', fontWeight: 600 }}>Triage Online (24/7)</span>
            </div>
            <div style={{ color: '#94A3B8' }}>
              {profile?.facilityName || 'Institutional General Hospital'}
            </div>
          </div>
        )}
      </aside>

      {/* 2. OPERATIONAL MAIN CONTENT CANVAS */}
      <main style={{ flex: 1, minWidth: 0, padding: '1.75rem 2rem 3.5rem' }}>
        {/* Institutional Command Header Bar */}
        <div
          className="medx-card"
          style={{
            marginBottom: '1.75rem',
            padding: '1.25rem 1.5rem',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--medx-shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#7E22CE',
                  backgroundColor: '#FAF5FF',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #E9D5FF'
                }}>
                  Operational Command Center
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  • Facility ID: {profile?.code || 'HOSP-MEDX-01'}
                </span>
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--medx-navy)', margin: 0 }}>
                {profile?.facilityName || 'Institutional Hospital Operations Center'}
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Quick Facility Metric Strip */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                backgroundColor: 'var(--medx-surface-muted)',
                padding: '0.5rem 0.875rem',
                borderRadius: 'var(--medx-radius-md)',
                fontSize: '0.78125rem',
                border: '1px solid var(--medx-border)'
              }}>
                <div><strong>Admin:</strong> {user?.name?.split(' ')[0] || 'Administrator'}</div>
                <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--medx-border)' }} />
                <div><strong>Capacity:</strong> {profile?.totalBeds || 100} Beds ({profile?.icuBeds || 10} ICU)</div>
                <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--medx-border)' }} />
                <div>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: '#15803D',
                    fontWeight: 700
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
                    Active Duty
                  </span>
                </div>
              </div>

              <span className="medx-badge medx-badge-hospital" style={{ fontSize: '0.75rem', padding: '0.35rem 0.625rem' }}>
                <ShieldCheck size={14} /> {role}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Operational View */}
        {activeTab === 'dashboard' && <HospitalDashboard onNavigateTab={setActiveTab} />}
        {activeTab === 'care-queue' && <HospitalCareQueue />}
        {activeTab === 'beds' && <HospitalBeds />}
        {activeTab === 'patients' && <HospitalPatients />}
        {activeTab === 'doctors' && <HospitalDoctors />}
        {activeTab === 'emergency' && <HospitalEmergency />}
      </main>
    </div>
  );
}

export default HospitalWorkspace;
