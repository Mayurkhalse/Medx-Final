import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Users, Calendar, MessageSquare, AlertTriangle, Search,
  Clock, CheckCircle, ArrowRight, ShieldAlert, Stethoscope
} from 'lucide-react';

const DoctorHome = () => {
  const { user, token, API_HOST } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_HOST}/api/doctor/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const d = await res.json();
        if (res.ok) setData(d);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchHomeData();
  }, [token, API_HOST]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div>
      {/* Active SOS Ticker */}
      {data?.activeSOS && data.activeSOS.length > 0 && (
        <div className="sos-ticker">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} />
            <span>
              URGENT: {data.activeSOS.length} Emergency SOS alert{data.activeSOS.length > 1 ? 's' : ''} currently awaiting triage!
            </span>
          </div>
          <Link to="/emergency-sos" className="btn btn-secondary btn-sm" style={{ backgroundColor: '#ffffff', color: '#991b1b', border: 'none', fontWeight: 700 }}>
            Open Emergency Desk &rarr;
          </Link>
        </div>
      )}

      {/* Greeting Banner */}
      <div className="portal-hero-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9, fontSize: '0.9rem', marginBottom: '4px' }}>
            <Stethoscope size={18} />
            <span>{user?.doctorProfile?.specialty || 'General Practice'} &bull; Clinical Workstation</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {getGreeting()}, Dr. {user?.name}
          </h1>
          <p style={{ opacity: 0.85, fontSize: '0.9rem', marginTop: '6px' }}>
            "Observation, reason, human understanding, courage; these make the physician."
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>Today</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-1)' }}>
            <span className="kpi-label">Assigned Patients</span>
            <Users size={20} />
          </div>
          <div className="kpi-value">{data?.kpis?.assignedPatients ?? '--'}</div>
          <Link to="/patients" style={{ fontSize: '0.8rem', color: 'var(--accent-1)', fontWeight: 600 }}>
            Patient directory &rarr;
          </Link>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7' }}>
            <span className="kpi-label">Today's Schedule</span>
            <Calendar size={20} />
          </div>
          <div className="kpi-value">{data?.kpis?.todaysAppointments ?? '--'}</div>
          <Link to="/appointments" style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600 }}>
            View appointments &rarr;
          </Link>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
            <span className="kpi-label">Unread Messages</span>
            <MessageSquare size={20} />
          </div>
          <div className="kpi-value">{data?.kpis?.unreadMessages ?? '0'}</div>
          <Link to="/messages" style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
            Consultation inbox &rarr;
          </Link>
        </div>

        <div className="kpi-card" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', backgroundColor: 'var(--flag-critical-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--flag-critical)' }}>
            <span className="kpi-label" style={{ color: 'var(--flag-critical)' }}>Emergency SOS</span>
            <AlertTriangle size={20} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--flag-critical)' }}>{data?.kpis?.openSOS ?? '0'}</div>
          <Link to="/emergency-sos" style={{ fontSize: '0.8rem', color: 'var(--flag-critical)', fontWeight: 700 }}>
            Manage alerts &rarr;
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Appointments + Quick Patient Lookup */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        {/* Today's Schedule */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-strong)' }}>
              Upcoming Consultations
            </h3>
            <Link to="/appointments" className="btn btn-secondary btn-sm">
              Full Calendar
            </Link>
          </div>

          {(!data?.upcomingAppointments || data.upcomingAppointments.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
              <CheckCircle size={32} color="var(--flag-success)" style={{ margin: '0 auto 8px' }} />
              <p>No remaining consultations scheduled for today.</p>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.upcomingAppointments.map((apt) => (
                    <tr key={apt._id}>
                      <td style={{ fontWeight: 600 }}>
                        {new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ fontWeight: 700 }}>{apt.patientId?.name || 'Patient'}</td>
                      <td>{apt.reason || 'Routine Follow-up'}</td>
                      <td>
                        <span className="badge badge-low">{apt.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions & Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-strong)' }}>
              Quick Clinical Navigation
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/medical-records" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Search size={16} />
                Lookup Patient Biomarkers
              </Link>
              <Link to="/availability" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Clock size={16} />
                Edit Weekly Availability Slots
              </Link>
              <Link to="/messages" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <MessageSquare size={16} />
                Doctor↔Patient Chat Thread
              </Link>
            </div>
          </div>

          <div className="card" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--surface-border)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-1)', marginBottom: '6px' }}>
              Clinical Decision Support Active
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              All patient reports are pre-evaluated by the MultiOutput Random Forest ML model on ingest. Look for Critical/High tier indicators in your patient directory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorHome;
