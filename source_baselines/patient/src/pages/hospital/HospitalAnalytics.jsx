import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LineChart as ChartIcon, Activity, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const HospitalAnalytics = () => {
  const { token, API_HOST } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_HOST}/api/hospital/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setAnalytics(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAnalytics();
  }, [token, API_HOST, timeRange]);

  const biomarkerAverages = [
    { marker: 'Fasting Glucose', avg: 104, normal: 90, unit: 'mg/dL' },
    { marker: 'Hemoglobin', avg: 13.6, normal: 14.5, unit: 'g/dL' },
    { marker: 'WBC Count', avg: 7800, normal: 7000, unit: '/uL' },
    { marker: 'Creatinine', avg: 1.05, normal: 0.9, unit: 'mg/dL' },
    { marker: 'Platelets', avg: 275000, normal: 250000, unit: '/uL' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-strong)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ChartIcon size={28} color="var(--accent-1)" />
            Hospital Population Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Institutional disease incidence trends, biomarker epidemiological averages, and risk stratifications
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['7d', '30d', '3mo'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`btn btn-sm ${timeRange === range ? 'btn-primary' : 'btn-secondary'}`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {biomarkerAverages.map((b, i) => (
          <div key={i} className="card">
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {b.marker}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-strong)', margin: '8px 0' }}>
              {b.avg} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.unit}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Hospital Population Mean (Benchmark: {b.normal} {b.unit})
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-strong)' }}>
          Clinical Workload & Admission Trajectory
        </h3>
        <div style={{ flex: 1, minHeight: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.activityTrends || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="completedReports" fill="#6d28d9" name="Diagnostic Reports" radius={[4, 4, 0, 0]} />
              <Bar dataKey="admitted" fill="#0284c7" name="Patient Intake" radius={[4, 4, 0, 0]} />
              <Bar dataKey="criticalAlerts" fill="#ef4444" name="Critical Events" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HospitalAnalytics;
