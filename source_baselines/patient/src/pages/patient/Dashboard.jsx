import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceArea, ReferenceLine,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  Plus, ShieldCheck, ShieldAlert, Heart, Activity, AlertTriangle,
  Calendar, Stethoscope, ChevronRight, TrendingUp, Info
} from 'lucide-react';

const BIOMARKERS = {
  glucose_fasting: {
    key: 'glucose_fasting',
    label: 'Glucose',
    fullName: 'Fasting Glucose',
    unit: 'mg/dL',
    refRange: '70–100 mg/dL',
    midpoint: 85,
    color: '#a855f7' // Violet
  },
  hemoglobin: {
    key: 'hemoglobin',
    label: 'Hemoglobin',
    fullName: 'Hemoglobin (Hb)',
    unit: 'g/dL',
    refRange: '13.5–17.5 g/dL',
    midpoint: 14.5,
    color: '#ef4444' // Coral
  },
  wbc_count: {
    key: 'wbc_count',
    label: 'WBC',
    fullName: 'White Blood Cells',
    unit: '/uL',
    refRange: '4k–11k /uL',
    midpoint: 7500,
    color: '#3b82f6' // Blue
  },
  creatinine: {
    key: 'creatinine',
    label: 'Creatinine',
    fullName: 'Serum Creatinine',
    unit: 'mg/dL',
    refRange: '0.6–1.2 mg/dL',
    midpoint: 0.9,
    color: '#f97316' // Orange
  },
  platelets: {
    key: 'platelets',
    label: 'Platelets',
    fullName: 'Platelet Count',
    unit: '/uL',
    refRange: '150k–450k /uL',
    midpoint: 300000,
    color: '#10b981' // Green
  },
  riskScore: {
    key: 'riskScore',
    label: 'Risk Score',
    fullName: 'Composite Risk Score',
    unit: '/100',
    refRange: '0–35 (Low)',
    midpoint: 35,
    color: '#eab308' // Gold
  }
};

// Sleek glassmorphic tooltip
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(124, 58, 237, 0.3)',
        borderRadius: '10px',
        padding: '12px 14px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        minWidth: '240px',
        fontSize: '0.8rem',
        color: '#f3f4f6'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
        <span style={{ fontWeight: 700, color: '#fff' }}>{label}</span>
        <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Standardized View</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {payload.map((item) => {
          const key = item.dataKey.replace('_norm', '');
          const cfg = BIOMARKERS[key];
          if (!cfg) return null;

          const rawVal = item.payload[key];
          const normVal = item.value;
          const isNormal = normVal >= 80 && normVal <= 120;
          const statusText = isNormal ? 'Normal' : normVal > 120 ? 'Elevated' : 'Low';
          const statusColor = isNormal ? '#10b981' : normVal > 120 ? '#f97316' : '#ef4444';

          return (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: cfg.color }} />
                <span style={{ color: '#d1d5db', fontWeight: 500 }}>{cfg.label}:</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: '#fff' }}>
                  {rawVal !== undefined ? rawVal.toLocaleString() : '--'}
                  <span style={{ fontSize: '0.65rem', color: '#9ca3af', marginLeft: '2px' }}>{cfg.unit}</span>
                </span>
                <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '3px', color: statusColor, background: `${statusColor}18`, fontWeight: 700 }}>
                  {statusText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user, token, API_HOST } = useAuth();
  const [reports, setReports] = useState([]);
  const [rawTrends, setRawTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sosSending, setSosSending] = useState(false);
  const [sosSuccess, setSosSuccess] = useState('');

  // Active series toggles (Glucose, Hemoglobin, WBC, Creatinine, Platelets, Risk Score)
  const [activeSeries, setActiveSeries] = useState({
    glucose_fasting: true,
    hemoglobin: true,
    wbc_count: true,
    creatinine: true,
    platelets: true,
    riskScore: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [reportsRes, trendsRes] = await Promise.all([
          fetch(`${API_HOST}/api/reports`, { headers }),
          fetch(`${API_HOST}/api/reports/trends/analytics`, { headers })
        ]);

        const [reportsData, trendsData] = await Promise.all([
          reportsRes.json(),
          trendsRes.json()
        ]);

        if (reportsRes.ok) setReports(reportsData);
        if (trendsRes.ok) setRawTrends(trendsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token, API_HOST]);

  // Normalize all points on the fly for the unified graph
  const processedTrends = useMemo(() => {
    return rawTrends.map((point) => {
      const copy = { ...point };
      Object.keys(BIOMARKERS).forEach((key) => {
        const config = BIOMARKERS[key];
        const val = point[key];
        if (val !== undefined && val !== null) {
          copy[key] = val;
          if (copy[`${key}_norm`] === undefined) {
            copy[`${key}_norm`] = Math.round((val / config.midpoint) * 100);
          }
        }
      });
      return copy;
    });
  }, [rawTrends]);

  const toggleSeries = (key) => {
    setActiveSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTriggerSOS = async () => {
    if (!window.confirm('Send emergency alert to hospital and clinical staff?')) return;
    setSosSending(true);
    setSosSuccess('');
    try {
      const res = await fetch(`${API_HOST}/api/emergency/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Emergency alert triggered from patient dashboard' })
      });
      if (res.ok) {
        setSosSuccess('Emergency SOS dispatched! Clinical staff have been alerted.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSosSending(false);
    }
  };

  const latestReport = reports.length > 0 ? reports[0] : null;

  // Compute biomarker statistics
  const latestTrendPoint = processedTrends.length > 0 ? processedTrends[processedTrends.length - 1] : null;
  const biomarkersList = ['glucose_fasting', 'hemoglobin', 'wbc_count', 'creatinine', 'platelets'];
  
  const inRangeCount = latestTrendPoint
    ? biomarkersList.filter((k) => {
        const norm = latestTrendPoint[`${k}_norm`];
        return norm >= 80 && norm <= 120;
      }).length
    : 0;

  const abnormalBiomarkers = latestTrendPoint
    ? biomarkersList
        .filter((k) => {
          const norm = latestTrendPoint[`${k}_norm`];
          return norm < 80 || norm > 120;
        })
        .map((k) => ({
          ...BIOMARKERS[k],
          status: latestTrendPoint[`${k}_norm`] > 120 ? 'Elevated' : 'Low',
          value: latestTrendPoint[k]
        }))
    : [];

  const diseaseData = useMemo(() => {
    if (!latestReport?.mlResult?.diseaseRisks) {
      return [
        { subject: 'ANEMIA', disease: 'Anemia', value: 10, note: 'Normal hemoglobin status' },
        { subject: 'DIABETES', disease: 'Diabetes', value: 10, note: 'Fasting glucose optimal' },
        { subject: 'KIDNEY', disease: 'Kidney Strain', value: 10, note: 'Creatinine clearance clear' },
        { subject: 'INFECTION', disease: 'Infection', value: 10, note: 'Leukocyte count balanced' }
      ];
    }

    const risks = latestReport.mlResult.diseaseRisks instanceof Map
      ? Object.fromEntries(latestReport.mlResult.diseaseRisks)
      : latestReport.mlResult.diseaseRisks;

    return [
      {
        subject: 'ANEMIA',
        disease: 'Anemia',
        value: Math.round((risks.anemia || 0) * 100),
        note: (risks.anemia || 0) > 0.4 ? 'Elevated vulnerability (low Hb)' : 'Normal hemoglobin level'
      },
      {
        subject: 'DIABETES',
        disease: 'Diabetes',
        value: Math.round((risks.diabetes || 0) * 100),
        note: (risks.diabetes || 0) > 0.4 ? 'Elevated glycemic index' : 'Fasting glucose optimal'
      },
      {
        subject: 'KIDNEY',
        disease: 'Kidney Strain',
        value: Math.round((risks.kidney_dysfunction || 0) * 100),
        note: (risks.kidney_dysfunction || 0) > 0.4 ? 'Elevated creatinine markers' : 'Healthy renal filtration'
      },
      {
        subject: 'INFECTION',
        disease: 'Infection',
        value: Math.round((risks.infection || 0) * 100),
        note: (risks.infection || 0) > 0.4 ? 'Elevated leukocyte count' : 'Normal leukocyte count'
      }
    ];
  }, [latestReport]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* 1. TOP EXECUTIVE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-strong)', letterSpacing: '-0.02em', margin: 0 }}>
            Health Overview
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '3px', margin: 0 }}>
            Welcome back, {user?.name}. Longitudinal biometric trajectory & risk modeling.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleTriggerSOS}
            disabled={sosSending}
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--flag-danger)', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}
          >
            <AlertTriangle size={15} />
            <span>{sosSending ? 'Sending SOS...' : 'Emergency SOS'}</span>
          </button>

          <Link to="/entry" className="btn btn-primary btn-sm">
            <Plus size={15} />
            <span>Log Report</span>
          </Link>
        </div>
      </div>

      {sosSuccess && (
        <div style={{ backgroundColor: 'var(--flag-critical-light)', color: 'var(--flag-critical)', padding: '10px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} />
          <span>{sosSuccess}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid rgba(124, 58, 237, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading clinical metrics...</p>
        </div>
      ) : !latestReport ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Heart size={42} color="var(--accent-1)" style={{ margin: '0 auto 14px' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '6px' }}>No Clinical Reports Recorded</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px', fontSize: '0.85rem' }}>
            Upload your lab test or input your blood numbers to instantly plot trends and evaluate physiological health.
          </p>
          <Link to="/entry" className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Log Your First Report</span>
          </Link>
        </div>
      ) : (
        <>
          {/* 2. REFINED 4-CARD HEALTH VITALS STRIP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {/* Card 1: Risk Score */}
            <div className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Health Risk Score
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-strong)' }}>
                    {latestReport.mlResult.overallRiskScore}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/100</span>
                </div>
                <div style={{ marginTop: '4px' }}>
                  <span className={`badge badge-${latestReport.mlResult.riskTier.toLowerCase()}`} style={{ fontSize: '0.675rem', padding: '2px 8px' }}>
                    {latestReport.mlResult.riskTier} Risk
                  </span>
                </div>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--flag-success)' }}>
                <ShieldCheck size={22} />
              </div>
            </div>

            {/* Card 2: Biomarker Equilibrium */}
            <div className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Clinical Equilibrium
                </span>
                <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-strong)', marginTop: '2px' }}>
                  {inRangeCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>of 5 Normal</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: abnormalBiomarkers.length > 0 ? '#ef4444' : '#10b981', fontWeight: 600, marginTop: '4px' }}>
                  {abnormalBiomarkers.length > 0
                    ? `1 Flag: ${abnormalBiomarkers[0].label} (${abnormalBiomarkers[0].status})`
                    : 'All parameters balanced'}
                </div>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(109, 40, 217, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-1)' }}>
                <Activity size={22} />
              </div>
            </div>

            {/* Card 3: Primary Health Focus */}
            <div className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Key Physiological Monitor
                </span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-strong)', marginTop: '4px' }}>
                  Hematology Recovery
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Hb +1.4 g/dL gain since last report
                </div>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                <TrendingUp size={22} />
              </div>
            </div>

            {/* Card 4: Next Consultation */}
            <div className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Upcoming Clinical Review
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-strong)', marginTop: '4px' }}>
                  Dr. Sarah Mitchell
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-1)', fontWeight: 600, marginTop: '4px' }}>
                  Cardiology Follow-up
                </div>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308' }}>
                <Calendar size={22} />
              </div>
            </div>
          </div>

          {/* 3. SLEEK UNIFIED BIOMARKER TRAJECTORY CHART (CLEAN, UNCLUTTERED) */}
          <div
            className="card"
            style={{
              marginBottom: '20px',
              padding: '20px 22px',
              background: 'linear-gradient(180deg, rgba(23, 23, 28, 0.85) 0%, rgba(15, 17, 23, 0.95) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {/* Chart Header with Clean Chips */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Biomarker Trajectory</span>
                  <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                    Safe Corridor (80%–120%)
                  </span>
                </h2>
              </div>

              {/* Minimalist Series Toggle Chips */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                {Object.values(BIOMARKERS).map((cfg) => {
                  const isActive = activeSeries[cfg.key];
                  return (
                    <button
                      key={cfg.key}
                      onClick={() => toggleSeries(cfg.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: isActive ? cfg.color : 'rgba(255, 255, 255, 0.1)',
                        backgroundColor: isActive ? `${cfg.color}15` : 'transparent',
                        color: isActive ? '#fff' : '#71717a',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: cfg.color }} />
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Unified Graph Canvas */}
            <div style={{ width: '100%', height: '310px' }}>
              {processedTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedTrends} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      style={{ fontSize: '11px' }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      domain={[50, 160]}
                      ticks={[60, 80, 100, 120, 150]}
                      tickFormatter={(v) => `${v}%`}
                      style={{ fontSize: '11px' }}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />

                    {/* Clinically Safe Target Zone Shading (80% - 120%) */}
                    <ReferenceArea
                      y1={80}
                      y2={120}
                      fill="#10b981"
                      fillOpacity={0.08}
                      stroke="#10b981"
                      strokeOpacity={0.25}
                      strokeDasharray="3 3"
                    />

                    {/* 100% Target Baseline */}
                    <ReferenceLine
                      y={100}
                      stroke="#10b981"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      label={{
                        value: 'Optimal Baseline',
                        fill: '#10b981',
                        fontSize: 10,
                        position: 'insideTopRight'
                      }}
                    />

                    {/* Active Lines */}
                    {activeSeries.glucose_fasting && (
                      <Line
                        type="monotone"
                        dataKey="glucose_fasting_norm"
                        stroke={BIOMARKERS.glucose_fasting.color}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: BIOMARKERS.glucose_fasting.color }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    {activeSeries.hemoglobin && (
                      <Line
                        type="monotone"
                        dataKey="hemoglobin_norm"
                        stroke={BIOMARKERS.hemoglobin.color}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: BIOMARKERS.hemoglobin.color }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    {activeSeries.wbc_count && (
                      <Line
                        type="monotone"
                        dataKey="wbc_count_norm"
                        stroke={BIOMARKERS.wbc_count.color}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: BIOMARKERS.wbc_count.color }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    {activeSeries.creatinine && (
                      <Line
                        type="monotone"
                        dataKey="creatinine_norm"
                        stroke={BIOMARKERS.creatinine.color}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: BIOMARKERS.creatinine.color }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    {activeSeries.platelets && (
                      <Line
                        type="monotone"
                        dataKey="platelets_norm"
                        stroke={BIOMARKERS.platelets.color}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: BIOMARKERS.platelets.color }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    {activeSeries.riskScore && (
                      <Line
                        type="monotone"
                        dataKey="riskScore"
                        stroke={BIOMARKERS.riskScore.color}
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={{ r: 3, fill: BIOMARKERS.riskScore.color }}
                        activeDot={{ r: 5 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Add a second report to plot your longitudinal health trajectory.
                </div>
              )}
            </div>

            {/* Subtle Chart Footnote */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '12px', fontSize: '0.725rem', color: '#9ca3af' }}>
              <span>
                🌿 Shaded corridor represents healthy reference equilibrium (80%–120% of clinical target).
              </span>
              <span>Hover points to view raw lab units.</span>
            </div>
          </div>

          {/* 4. BALANCED TWO-COLUMN SECTION: CURRENT BIOMARKERS & DISEASE RISKS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            {/* Left: Latest Tracked Biomarkers List */}
            <div className="card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-strong)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Current Biomarkers
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(latestReport.reportDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {latestReport.parameters &&
                  Object.entries(
                    latestReport.parameters instanceof Map
                      ? Object.fromEntries(latestReport.parameters)
                      : latestReport.parameters
                  ).map(([key, item]) => {
                    const cfg = BIOMARKERS[key];
                    const flag = (latestReport.mlResult?.flags && (latestReport.mlResult.flags[key] || latestReport.mlResult.flags.get?.(key))) || 'normal';
                    const isNormal = flag === 'normal';

                    return (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          backgroundColor: isNormal ? 'rgba(255, 255, 255, 0.02)' : 'rgba(239, 68, 68, 0.06)',
                          border: isNormal ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(239, 68, 68, 0.25)'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                            {cfg?.fullName || key.replace('_', ' ')}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Standard range: {item.ref_range || cfg?.refRange || 'Normal'}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                            {item.value} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>{item.unit}</span>
                          </div>
                          <span
                            className={`badge badge-${isNormal ? 'success' : flag.includes('critical') ? 'danger' : 'warning'}`}
                            style={{ fontSize: '0.65rem', padding: '1px 6px', marginTop: '2px' }}
                          >
                            {flag.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Right: ML Disease Risk Radar Diagram & Occurrence Suggestions */}
            <div className="card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-strong)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Disease Vulnerability Diagram
                  </span>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    AI multi-target predictive disease risk mapping
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-1)', background: 'rgba(109, 40, 217, 0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  Random Forest v1.0
                </span>
              </div>

              {/* Radar Diagram Canvas */}
              <div style={{ width: '100%', height: '210px', margin: '4px 0 10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="68%" data={diseaseData}>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: '#e4e4e7', fontSize: 10, fontWeight: 700 }}
                    />
                    <PolarRadiusAxis
                      angle={45}
                      domain={[0, 100]}
                      tick={{ fill: '#71717a', fontSize: 8.5 }}
                      stroke="rgba(255, 255, 255, 0.08)"
                    />
                    <Radar
                      name="Risk %"
                      dataKey="value"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="#a855f7"
                      fillOpacity={0.35}
                      dot={{ r: 3.5, fill: '#c084fc', stroke: '#fff', strokeWidth: 1 }}
                    />
                    <Tooltip
                      formatter={(val) => [`${val}% Probability`, 'Estimated Risk']}
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid rgba(124, 58, 237, 0.3)',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        color: '#fff'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Clinical Occurrence Suggestions Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: 'auto' }}>
                {diseaseData.map((d) => {
                  const isElevated = d.value >= 40;
                  const isModerate = d.value >= 20 && d.value < 40;
                  const statusColor = isElevated ? '#ef4444' : isModerate ? '#f59e0b' : '#10b981';

                  return (
                    <div
                      key={d.subject}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: isElevated ? 'rgba(239, 68, 68, 0.07)' : 'rgba(255, 255, 255, 0.02)',
                        border: isElevated ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                          {d.disease}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: statusColor }}>
                          {d.value}%
                        </span>
                      </div>
                      <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {d.note}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--surface-border)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Simulate biomarker adjustments:</span>
                <Link to="/whatif" style={{ color: 'var(--accent-1)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  What-If Assistant <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </div>

          {/* 5. MINIMALIST REPORT HISTORY TABLE */}
          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-strong)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Diagnostic Timeline History
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {reports.length} Records Logged
              </span>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Input Source</th>
                    <th>Composite Score</th>
                    <th>Clinical Tier</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((rep) => (
                    <tr key={rep._id}>
                      <td style={{ fontWeight: 600 }}>
                        {new Date(rep.reportDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{rep.sourceType}</td>
                      <td style={{ fontWeight: 800 }}>
                        {rep.mlResult.overallRiskScore}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}> /100</span>
                      </td>
                      <td>
                        <span className={`badge badge-${rep.mlResult.riskTier.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                          {rep.mlResult.riskTier}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Validated & Archival
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
