import React, { useState, useEffect } from 'react';
import {
  Users, Stethoscope, AlertTriangle, FileText,
  Activity, BedDouble, RefreshCw, CheckCircle2, ChevronRight, Clock
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, PieChart, Pie, Cell
} from 'recharts';
import hospitalService from '../../services/hospitalService.js';

const PIE_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

export default function HospitalDashboard({ onNavigateTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('7days');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hospitalService.getDashboard(timeframe);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Hospital dashboard load error:', err);
      setError('Unable to load hospital operational metrics from unified server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [timeframe]);

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--medx-text-secondary)' }}>
        <RefreshCw size={24} className="medx-spin" style={{ marginBottom: '0.75rem' }} />
        <p>Loading real-time hospital operational metrics...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="medx-card" style={{ borderLeft: '4px solid #EF4444', padding: '1.5rem' }}>
        <p style={{ color: '#EF4444', fontWeight: 600 }}>{error}</p>
        <button
          className="medx-btn medx-btn-secondary"
          onClick={loadDashboard}
          style={{ marginTop: '0.75rem' }}
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const stats = data?.stats || {};
  const bedCap = stats.bedCapacity || {};
  const activityData = data?.activityChart || [];
  const reportOverview = data?.reportOverview || [];
  const criticalAlerts = data?.criticalAlerts || [];
  const recentReports = data?.recentReports || [];
  const doctors = data?.doctorsWorkload || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Operational Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div className="medx-card" style={{ padding: '1.25rem', borderTop: '4px solid var(--medx-teal)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--medx-text-secondary)', textTransform: 'uppercase', margin: 0 }}>
                Inpatient Roster
              </p>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--medx-navy)', margin: '0.25rem 0' }}>
                {stats.totalPatientsLive ?? 0}
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
                Active Institutional
              </span>
            </div>
            <div style={{ backgroundColor: '#ECFDF5', color: '#059669', padding: '0.625rem', borderRadius: '8px' }}>
              <Users size={22} />
            </div>
          </div>
        </div>

        <div className="medx-card" style={{ padding: '1.25rem', borderTop: '4px solid #3B82F6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--medx-text-secondary)', textTransform: 'uppercase', margin: 0 }}>
                Total Bed Capacity
              </p>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--medx-navy)', margin: '0.25rem 0' }}>
                {bedCap.total ?? 100}
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#3B82F6', fontWeight: 600 }}>
                {bedCap.available ?? 60} Available ({bedCap.occupied ?? 40} Occupied)
              </span>
            </div>
            <div style={{ backgroundColor: '#EFF6FF', color: '#2563EB', padding: '0.625rem', borderRadius: '8px' }}>
              <BedDouble size={22} />
            </div>
          </div>
        </div>

        <div className="medx-card" style={{ padding: '1.25rem', borderTop: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--medx-text-secondary)', textTransform: 'uppercase', margin: 0 }}>
                ICU Occupancy & Availability
              </p>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--medx-navy)', margin: '0.25rem 0' }}>
                {bedCap.icuAvailable ?? 10}
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#8B5CF6', fontWeight: 600 }}>
                ICU Beds Available for Critical Care
              </span>
            </div>
            <div style={{ backgroundColor: '#F5F3FF', color: '#7C3AED', padding: '0.625rem', borderRadius: '8px' }}>
              <Activity size={22} />
            </div>
          </div>
        </div>

        <div className="medx-card" style={{ padding: '1.25rem', borderTop: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--medx-text-secondary)', textTransform: 'uppercase', margin: 0 }}>
                Critical Queue Alerts
              </p>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#EF4444', margin: '0.25rem 0' }}>
                {stats.criticalAlerts ?? 0}
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600 }}>
                Requires Clinical Action
              </span>
            </div>
            <div style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '0.625rem', borderRadius: '8px' }}>
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>

        <div className="medx-card" style={{ padding: '1.25rem', borderTop: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--medx-text-secondary)', textTransform: 'uppercase', margin: 0 }}>
                Physician Staff
              </p>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--medx-navy)', margin: '0.25rem 0' }}>
                {stats.doctors ?? 0}
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
                Active on Institutional Duty
              </span>
            </div>
            <div style={{ backgroundColor: '#ECFDF5', color: '#059669', padding: '0.625rem', borderRadius: '8px' }}>
              <Stethoscope size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Charts Section: Patient Activity & Report Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Activity Area Chart */}
        <div className="medx-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                Institutional Patient Flow & Admissions
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', margin: '0.25rem 0 0 0' }}>
                Outpatient triage vs. inpatient emergency admissions
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {['today', '7days', '30days'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  style={{
                    padding: '0.25rem 0.625rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: timeframe === tf ? 'var(--medx-teal)' : '#fff',
                    color: timeframe === tf ? '#fff' : 'var(--medx-text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  {tf === 'today' ? 'Today' : tf === '7days' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorOutpatient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--medx-teal)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--medx-teal)" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorEmergency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey={timeframe === 'today' ? 'time' : timeframe === '30days' ? 'date' : 'day'} stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '0.75rem' }} />
                <Area type="monotone" dataKey="outpatient" stroke="var(--medx-teal)" fillOpacity={1} fill="url(#colorOutpatient)" name="Outpatient" />
                <Area type="monotone" dataKey="emergency" stroke="#EF4444" fillOpacity={1} fill="url(#colorEmergency)" name="Emergency/Inpatient" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Report Overview Distribution */}
        <div className="medx-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
            Inpatient Diagnostic Report Overview
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', margin: '0.25rem 0 1rem 0' }}>
            Biomarker risk distribution across active hospital records
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: 220 }}>
            <div style={{ width: 180, height: 180 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={reportOverview}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {reportOverview.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '0.75rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
              {reportOverview.map((item, idx) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span style={{ color: 'var(--medx-text-secondary)' }}>{item.name}:</span>
                  <strong style={{ color: 'var(--medx-navy)' }}>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Priority Care Tasks & High Risk Alerts */}
      <div className="medx-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
              Operational Critical Care Tasks & Escalations
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', margin: '0.25rem 0 0 0' }}>
              High-priority clinical items in the institutional queue
            </p>
          </div>
          {onNavigateTab && (
            <button
              className="medx-btn medx-btn-secondary"
              onClick={() => onNavigateTab('care-queue')}
              style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
            >
              Open Care Queue <ChevronRight size={14} />
            </button>
          )}
        </div>

        {criticalAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--medx-text-secondary)', fontSize: '0.875rem' }}>
            <CheckCircle2 size={32} color="#10B981" style={{ marginBottom: '0.5rem' }} />
            <p>No unaddressed critical alerts in hospital operations queue.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: 'var(--medx-text-secondary)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Priority</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Task / Alert Title</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Patient</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Category Stage</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Assigned Doctor</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {criticalAlerts.map((task) => (
                  <tr key={task._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className={`medx-badge ${task.priority === 'Critical' ? 'medx-badge-danger' : 'medx-badge-warning'}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                      {task.title}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {task.patientId?.userId?.name || 'Inpatient'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--medx-text-secondary)' }}>
                      {task.category}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {task.assignedDoctorId?.userId?.name ? `Dr. ${task.assignedDoctorId.userId.name}` : <span style={{ color: '#94A3B8' }}>Unassigned</span>}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className="medx-badge medx-badge-primary">
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Recent Inpatient Lab Reports */}
      <div className="medx-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
              Recent Inpatient Laboratory Diagnostics
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', margin: '0.25rem 0 0 0' }}>
              Canonical MedicalReports associated with institutional care
            </p>
          </div>
        </div>

        {recentReports.length === 0 ? (
          <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>
            No recent laboratory records for this facility.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: 'var(--medx-text-secondary)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Report ID</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Panel Name</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Patient</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Review Status</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((r) => (
                  <tr key={r._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                      {r.reportId || r._id.substring(0, 8)}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {r.reportName}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {r.patientId?.userId?.name || 'Inpatient'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className={`medx-badge ${r.reviewStatus === 'Reviewed' ? 'medx-badge-success' : 'medx-badge-warning'}`}>
                        {r.reviewStatus}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--medx-text-secondary)' }}>
                      {new Date(r.reportDate || r.createdAt).toLocaleDateString()}
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
}
