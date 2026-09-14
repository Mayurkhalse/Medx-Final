import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, Calendar, FileText, AlertOctagon,
  TrendingUp, RefreshCw, CheckCircle2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const HospitalDashboard = () => {
  const { token, API_HOST } = useAuth();
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [dashRes, analRes] = await Promise.all([
        fetch(`${API_HOST}/api/hospital/dashboard`, { headers }),
        fetch(`${API_HOST}/api/hospital/analytics`, { headers })
      ]);

      const [dashData, analData] = await Promise.all([dashRes.json(), analRes.json()]);
      if (dashRes.ok) setData(dashData);
      if (analRes.ok) setAnalytics(analData);
    } catch (e) {
      console.error('Error fetching hospital dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDashboard();
  }, [token, API_HOST]);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#991b1b'];

  const pieData = analytics?.riskDistribution
    ? analytics.riskDistribution.map((d) => ({ name: d._id || 'Low', value: d.count }))
    : [
        { name: 'Low', value: 34 },
        { name: 'Moderate', value: 18 },
        { name: 'High', value: 7 },
        { name: 'Critical', value: 3 }
      ];

  const trendData = analytics?.activityTrends || [
    { day: 'Mon', admitted: 12, completedReports: 28, criticalAlerts: 1 },
    { day: 'Tue', admitted: 18, completedReports: 34, criticalAlerts: 2 },
    { day: 'Wed', admitted: 14, completedReports: 30, criticalAlerts: 0 },
    { day: 'Thu', admitted: 22, completedReports: 42, criticalAlerts: 4 },
    { day: 'Fri', admitted: 19, completedReports: 38, criticalAlerts: 1 },
    { day: 'Sat', admitted: 9, completedReports: 18, criticalAlerts: 0 },
    { day: 'Sun', admitted: 7, completedReports: 14, criticalAlerts: 1 }
  ];

  return (
    <div>
      {/* Top Banner */}
      <div className="portal-hero-banner">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
            Hospital Command Center
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>
            {data?.hospital?.name || 'Central Facility'} — Population Health, Roster & Critical Triage
          </p>
        </div>

        <button onClick={fetchDashboard} className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}>
          <RefreshCw size={16} />
          Refresh Feed
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-1)' }}>
            <span className="kpi-label">Total Patients</span>
            <Users size={20} />
          </div>
          <div className="kpi-value">{data?.kpis?.totalPatients ?? '--'}</div>
          <Link to="/patients" style={{ fontSize: '0.8rem', color: 'var(--accent-1)', fontWeight: 600 }}>
            View directory &rarr;
          </Link>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7' }}>
            <span className="kpi-label">Active Doctors</span>
            <UserCheck size={20} />
          </div>
          <div className="kpi-value">{data?.kpis?.activeDoctors ?? '--'}</div>
          <Link to="/doctors" style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600 }}>
            Manage roster &rarr;
          </Link>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
            <span className="kpi-label">Today's Appointments</span>
            <Calendar size={20} />
          </div>
          <div className="kpi-value">{data?.kpis?.todaysAppointments ?? '--'}</div>
          <Link to="/appointments" style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
            View schedule &rarr;
          </Link>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706' }}>
            <span className="kpi-label">Care Queue Pending</span>
            <FileText size={20} />
          </div>
          <div className="kpi-value">{data?.kpis?.pendingReports ?? '--'}</div>
          <Link to="/care-queue" style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600 }}>
            Triage queue &rarr;
          </Link>
        </div>

        <div className="kpi-card" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', backgroundColor: 'var(--flag-critical-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--flag-critical)' }}>
            <span className="kpi-label" style={{ color: 'var(--flag-critical)' }}>Critical Alerts</span>
            <AlertOctagon size={20} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--flag-critical)' }}>{data?.kpis?.criticalAlerts ?? '--'}</div>
          <Link to="/critical-alerts" style={{ fontSize: '0.8rem', color: 'var(--flag-critical)', fontWeight: 700 }}>
            Active SOS triage &rarr;
          </Link>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '28px' }}>
        <div className="card" style={{ minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-strong)' }}>
            Patient Activity & Lab Triage Trends
          </h3>
          <div style={{ flex: 1, minHeight: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completedReports" fill="#6d28d9" name="Reports Analyzed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="admitted" fill="#0284c7" name="Admissions" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-strong)' }}>
            Patient Risk Tier Distribution
          </h3>
          <div style={{ flex: 1, minHeight: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Alerts & Triage Feed */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-strong)' }}>
            Live Emergency & Care Queue Triage
          </h3>
          <Link to="/care-queue" className="btn btn-secondary btn-sm">
            View All Care Items
          </Link>
        </div>

        {(!data?.careQueue || data.careQueue.length === 0) && (!data?.criticalAlerts || data.criticalAlerts.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} color="var(--flag-success)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontWeight: 600 }}>All clinical alerts and care queues are currently clear.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Risk Tier / Reason</th>
                  <th>Received</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.criticalAlerts?.map((alert) => (
                  <tr key={alert._id}>
                    <td style={{ fontWeight: 600 }}>{alert.patientId?.name || 'Emergency Patient'}</td>
                    <td>
                      <span className="badge badge-critical">EMERGENCY SOS</span>
                    </td>
                    <td>{alert.triggerReason || 'Immediate Help Requested'}</td>
                    <td>{new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <Link to="/critical-alerts" className="btn btn-danger btn-sm">
                        Triage SOS
                      </Link>
                    </td>
                  </tr>
                ))}

                {data?.careQueue?.map((item) => (
                  <tr key={item._id}>
                    <td style={{ fontWeight: 600 }}>{item.patientId?.name || 'Patient'}</td>
                    <td>Care Queue Review</td>
                    <td>
                      <span className={`badge badge-${item.riskTier?.toLowerCase()}`}>
                        {item.riskTier} Tier Report
                      </span>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to="/care-queue" className="btn btn-primary btn-sm">
                        Review Case
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;
