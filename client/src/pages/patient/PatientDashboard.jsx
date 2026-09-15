import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api.js';
import emergencyService from '../../services/emergencyService.js';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  Activity, ShieldCheck, ShieldAlert, Heart, AlertTriangle,
  Calendar, FileText, ChevronRight, TrendingUp, Info, RefreshCw, Eye, X, MapPin, CheckCircle
} from 'lucide-react';

const BIOMARKER_SPECS = {
  glucose_fasting: {
    key: 'glucose_fasting',
    label: 'Glucose',
    fullName: 'Fasting Glucose',
    unit: 'mg/dL',
    refRange: '70–100',
    midpoint: 85,
    color: '#8B5CF6'
  },
  hemoglobin: {
    key: 'hemoglobin',
    label: 'Hemoglobin',
    fullName: 'Hemoglobin (Hb)',
    unit: 'g/dL',
    refRange: '12–17',
    midpoint: 14.5,
    color: '#EF4444'
  },
  wbc_count: {
    key: 'wbc_count',
    label: 'WBC Count',
    fullName: 'White Blood Cells',
    unit: '/uL',
    refRange: '4k–11k',
    midpoint: 7500,
    color: '#3B82F6'
  },
  creatinine: {
    key: 'creatinine',
    label: 'Creatinine',
    fullName: 'Serum Creatinine',
    unit: 'mg/dL',
    refRange: '0.6–1.3',
    midpoint: 0.9,
    color: '#F97316'
  },
  platelets: {
    key: 'platelets',
    label: 'Platelets',
    fullName: 'Platelet Count',
    unit: '/uL',
    refRange: '150k–450k',
    midpoint: 300000,
    color: '#10B981'
  },
  riskScore: {
    key: 'riskScore',
    label: 'Risk Score',
    fullName: 'Composite Clinical Risk Score',
    unit: '/100',
    refRange: '0–35 (Low)',
    midpoint: 35,
    color: '#D97706'
  }
};

export default function PatientDashboard({ onNavigateToEntry }) {
  const [reports, setReports] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [chartMode, setChartMode] = useState('normalized'); // 'normalized' | 'individual'
  const [selectedBiomarker, setSelectedBiomarker] = useState('glucose_fasting');

  // Emergency SOS State
  const [activeSosAlert, setActiveSosAlert] = useState(null);
  const [sosSending, setSosSending] = useState(false);
  const [sosSuccess, setSosSuccess] = useState('');
  const [sosError, setSosError] = useState('');

  const fetchSOSAlert = async () => {
    try {
      const alerts = await emergencyService.getEmergencyAlerts();
      if (Array.isArray(alerts)) {
        const active = alerts.find(a => a.status === 'ACTIVE' || a.status === 'IN_PROGRESS');
        setActiveSosAlert(active || null);
      }
    } catch (err) {
      console.warn('[SOS] Could not poll emergency status:', err.message);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportsRes, trendsRes] = await Promise.all([
        api.get('/reports'),
        api.get('/reports/trends/analytics')
      ]);
      setReports(reportsRes.data || []);
      setTrends(trendsRes.data || []);
      await fetchSOSAlert();
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to load health records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // 5-second polling cadence for emergency SOS status synchronization
    const sosInterval = setInterval(fetchSOSAlert, 5000);
    return () => clearInterval(sosInterval);
  }, []);

  const handleTriggerSOS = async () => {
    if (!window.confirm('Send emergency alert to hospital and clinical staff?')) return;
    setSosSending(true);
    setSosSuccess('');
    setSosError('');

    const captureAndSend = async (coords = null) => {
      try {
        const payload = {
          reason: 'Emergency alert triggered from patient dashboard',
          triggerReason: 'Patient triggered Emergency SOS: Acute physiological distress',
          alertType: 'Emergency SOS Distress Signal'
        };

        if (coords) {
          payload.latitude = coords.latitude;
          payload.longitude = coords.longitude;
        }

        const res = await emergencyService.triggerSOS(payload);
        const createdAlert = res.alert || res.sos;
        setActiveSosAlert(createdAlert);
        setSosSuccess('Emergency SOS dispatched! Hospital and clinical staff have been alerted.');
      } catch (e) {
        console.error('[SOS] Trigger failed:', e);
        setSosError(e.response?.data?.error?.message || 'Failed to dispatch Emergency SOS.');
      } finally {
        setSosSending(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => captureAndSend({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => {
          console.warn('[SOS] Geolocation unavailable, proceeding with default location:', err.message);
          captureAndSend(null);
        },
        { timeout: 4000 }
      );
    } else {
      captureAndSend(null);
    }
  };

  const handleCancelSOS = async () => {
    if (!activeSosAlert) return;
    if (!window.confirm('Are you sure you want to cancel this emergency alert?')) return;
    try {
      await emergencyService.resolveEmergencyAlert(activeSosAlert._id, 'Cancelled by patient from dashboard.');
      setActiveSosAlert(null);
      setSosSuccess('');
    } catch (e) {
      console.error('[SOS] Cancel failed:', e);
      alert('Could not cancel emergency alert: ' + (e.response?.data?.error?.message || e.message));
    }
  };

  const latestReport = useMemo(() => {
    if (!reports || reports.length === 0) return null;
    return reports[0]; // sorted descending by reportDate from API
  }, [reports]);

  // Extract latest biomarker parameters map/object
  const latestParams = useMemo(() => {
    if (!latestReport || !latestReport.parameters) return {};
    if (latestReport.parameters instanceof Map) {
      return Object.fromEntries(latestReport.parameters);
    }
    return latestReport.parameters;
  }, [latestReport]);

  // 5-Axis Authentic ML Disease Vulnerability Radar Calculation
  const diseaseData = useMemo(() => {
    if (!latestReport?.mlResult?.diseaseRisks) {
      return [
        { subject: 'ANEMIA', disease: 'Anemia', value: 12, note: 'Normal hemoglobin status' },
        { subject: 'DIABETES', disease: 'Diabetes', value: 14, note: 'Fasting glucose optimal' },
        { subject: 'KIDNEY', disease: 'Kidney Strain', value: 10, note: 'Creatinine clearance clear' },
        { subject: 'INFECTION', disease: 'Infection', value: 15, note: 'Leukocyte count balanced' },
        { subject: 'CARDIO', disease: 'Cardiovascular', value: 16, note: 'Vascular markers balanced' }
      ];
    }

    const risks = latestReport.mlResult.diseaseRisks instanceof Map
      ? Object.fromEntries(latestReport.mlResult.diseaseRisks)
      : latestReport.mlResult.diseaseRisks;

    const anemiaRisk = Math.round((risks.anemia ?? 0.12) * 100);
    const diabetesRisk = Math.round((risks.diabetes ?? 0.14) * 100);
    const kidneyRisk = Math.round((risks.kidney_dysfunction ?? 0.10) * 100);
    const infectionRisk = Math.round((risks.infection ?? 0.15) * 100);
    const cardioRisk = Math.round((risks.cardiovascular ?? Math.min(100, Math.max(10, Math.round((diabetesRisk * 0.6) + (kidneyRisk * 0.4))))) );

    return [
      {
        subject: 'ANEMIA',
        disease: 'Anemia',
        value: anemiaRisk,
        note: anemiaRisk > 40 ? 'Elevated vulnerability (low Hb)' : 'Normal hemoglobin level'
      },
      {
        subject: 'DIABETES',
        disease: 'Diabetes',
        value: diabetesRisk,
        note: diabetesRisk > 40 ? 'Elevated glycemic index' : 'Fasting glucose optimal'
      },
      {
        subject: 'KIDNEY',
        disease: 'Kidney Strain',
        value: kidneyRisk,
        note: kidneyRisk > 40 ? 'Elevated creatinine clearance strain' : 'Healthy renal filtration'
      },
      {
        subject: 'INFECTION',
        disease: 'Infection',
        value: infectionRisk,
        note: infectionRisk > 40 ? 'Elevated leukocyte response' : 'Normal leukocyte balance'
      },
      {
        subject: 'CARDIO',
        disease: 'Cardiovascular',
        value: cardioRisk,
        note: cardioRisk > 40 ? 'Elevated vascular profile risk' : 'Cardiovascular profile stable'
      }
    ];
  }, [latestReport]);

  const riskTier = latestReport?.mlResult?.riskTier || 'Low';
  const riskScore = latestReport?.mlResult?.overallRiskScore ?? 25;
  const isElevatedRisk = riskTier === 'High' || riskTier === 'Critical';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner: Health Status & Risk Assessment */}
      <div
        className="medx-card"
        style={{
          borderLeft: `5px solid ${isElevatedRisk ? '#EF4444' : '#10B981'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: isElevatedRisk ? '#FEE2E2' : '#ECFDF5',
              color: isElevatedRisk ? '#EF4444' : '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isElevatedRisk ? <ShieldAlert size={26} /> : <ShieldCheck size={26} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                ML Physiological Health Assessment
              </h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  backgroundColor: isElevatedRisk ? '#FEE2E2' : '#ECFDF5',
                  color: isElevatedRisk ? '#B91C1C' : '#047857'
                }}
              >
                {riskTier.toUpperCase()} RISK
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--medx-text-secondary)', margin: '0.25rem 0 0 0' }}>
              {latestReport
                ? `Latest laboratory assessment evaluated on ${new Date(latestReport.reportDate).toLocaleDateString()}. Composite risk score: ${riskScore}/100.`
                : 'No diagnostic reports ingested yet. Log a blood panel to activate ML biomarker analytics.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={fetchData}
            className="medx-button medx-button-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            onClick={handleTriggerSOS}
            disabled={sosSending}
            className="medx-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.875rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              backgroundColor: '#FEE2E2',
              color: '#B91C1C',
              border: '1px solid #FCA5A5',
              cursor: sosSending ? 'not-allowed' : 'pointer'
            }}
          >
            <AlertTriangle size={15} className={sosSending ? 'animate-spin' : ''} />
            <span>{sosSending ? 'Dispatching SOS...' : 'Emergency SOS'}</span>
          </button>
          {onNavigateToEntry && (
            <button
              onClick={onNavigateToEntry}
              className="medx-button medx-button-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}
            >
              <FileText size={15} /> Log Report
            </button>
          )}
        </div>
      </div>

      {/* Active Emergency Alert Banner */}
      {activeSosAlert && (
        <div
          className="medx-card"
          style={{
            backgroundColor: '#FFF1F2',
            border: '2px solid #FDA4AF',
            padding: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#E11D48',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '1rem', color: '#881337' }}>
                  ACTIVE EMERGENCY SOS BROADCAST
                </strong>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    backgroundColor: activeSosAlert.status === 'IN_PROGRESS' ? '#FEF3C7' : '#FFE4E6',
                    color: activeSosAlert.status === 'IN_PROGRESS' ? '#B45309' : '#BE123C'
                  }}
                >
                  {activeSosAlert.status === 'IN_PROGRESS' ? 'IN PROGRESS / DISPATCHED' : 'AWAITING CLINICAL RESPONSE'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#9F1239', fontWeight: 600 }}>
                  ID: {activeSosAlert.alertId || activeSosAlert._id}
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#9F1239', margin: '0.25rem 0 0 0' }}>
                {activeSosAlert.triggerReason || 'Acute physiological distress signal transmitted to hospital and attending physician.'}
              </p>
              {activeSosAlert.location?.coordinatesText && (
                <div style={{ fontSize: '0.75rem', color: '#BE123C', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <MapPin size={13} /> GPS Coordinates: {activeSosAlert.location.coordinatesText} ({activeSosAlert.location.address})
                </div>
              )}
              {activeSosAlert.dispatch?.statusText && (
                <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '0.25rem', fontWeight: 600 }}>
                  Clinical Note: {activeSosAlert.dispatch.statusText} {activeSosAlert.dispatch.dispatchNotes ? `— ${activeSosAlert.dispatch.dispatchNotes}` : ''}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleCancelSOS}
            className="medx-button medx-button-secondary"
            style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', color: '#881337', borderColor: '#FDA4AF' }}
          >
            Cancel / Mark Resolved
          </button>
        </div>
      )}

      {/* SOS Notification Success feedback if alert recently resolved */}
      {sosSuccess && !activeSosAlert && (
        <div
          style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--medx-radius-md)',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <CheckCircle size={16} />
          <span>{sosSuccess}</span>
        </div>
      )}

      {/* SOS Error notification */}
      {sosError && (
        <div
          style={{
            backgroundColor: '#FFF1F2',
            border: '1px solid #FDA4AF',
            color: '#9F1239',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--medx-radius-md)',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <AlertTriangle size={16} />
          <span>{sosError}</span>
        </div>
      )}

      {/* 5 Core Biomarker Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {Object.entries(BIOMARKER_SPECS).map(([key, spec]) => {
          const item = latestParams[key];
          const val = item?.value !== undefined ? item.value : '—';
          const flag = (latestReport?.mlResult?.flags instanceof Map
            ? latestReport.mlResult.flags.get(key)
            : latestReport?.mlResult?.flags?.[key]) || 'normal';
          const isAbnormal = flag !== 'normal';

          return (
            <div
              key={key}
              className="medx-card"
              style={{
                borderTop: `3px solid ${spec.color}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--medx-text-secondary)', textTransform: 'uppercase' }}>
                  {spec.fullName}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    backgroundColor: isAbnormal ? '#FEE2E2' : '#ECFDF5',
                    color: isAbnormal ? '#B91C1C' : '#047857'
                  }}
                >
                  {isAbnormal ? flag.toUpperCase() : 'OPTIMAL'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--medx-navy)' }}>
                  {val}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--medx-text-muted)', marginLeft: '0.375rem' }}>
                  {spec.unit}
                </span>
              </div>

              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--medx-text-secondary)' }}>
                Target: <strong>{spec.refRange} {spec.unit}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. AUTHENTIC PATIENT CENTERPIECE: 5-AXIS DISEASE VULNERABILITY RADAR */}
      <div className="medx-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--medx-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Activity size={20} color="#7C3AED" />
              Disease Vulnerability Radar Mapping
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: '0.25rem 0 0 0' }}>
              Multi-target predictive physiological disease vector mapping derived from current biomarkers.
            </p>
          </div>
          <span style={{
            fontSize: '0.75rem',
            color: '#7C3AED',
            backgroundColor: '#F5F3FF',
            border: '1px solid #DDD6FE',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontWeight: 700
          }}>
            Random Forest v1.0 • 5 Axes
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(280px, 1fr)', gap: '1.5rem', alignItems: 'center' }}>
          {/* Radar Diagram Canvas */}
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={diseaseData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }}
                />
                <PolarRadiusAxis
                  angle={45}
                  domain={[0, 100]}
                  tick={{ fill: '#94A3B8', fontSize: 9 }}
                  stroke="#E2E8F0"
                />
                <Radar
                  name="Risk %"
                  dataKey="value"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  fill="#8B5CF6"
                  fillOpacity={0.32}
                  dot={{ r: 4, fill: '#7C3AED', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                />
                <Tooltip
                  formatter={(val) => [`${val}% Estimated Risk`, 'Risk Probability']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    border: '1px solid #7C3AED',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    color: '#FFFFFF'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Clinical Occurrence Suggestions Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {diseaseData.map((d) => {
              const isElevated = d.value >= 40;
              const isModerate = d.value >= 20 && d.value < 40;
              const statusColor = isElevated ? '#EF4444' : isModerate ? '#F59E0B' : '#10B981';
              const statusBg = isElevated ? '#FEF2F2' : isModerate ? '#FFFBEB' : '#ECFDF5';

              return (
                <div
                  key={d.subject}
                  style={{
                    backgroundColor: statusBg,
                    border: `1px solid ${statusColor}33`,
                    borderRadius: 'var(--medx-radius-md)',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--medx-navy)' }}>
                      {d.disease}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: statusColor }}>
                      {d.value}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--medx-text-secondary)', lineHeight: 1.3 }}>
                    {d.note}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Longitudinal Biomarker Trend Analysis (Recharts) */}
      <div className="medx-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--medx-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <TrendingUp size={20} color="var(--medx-primary)" />
              Longitudinal Biomarker Trajectory
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: '0.25rem 0 0 0' }}>
              Chronological tracking across all historical diagnostic observations.
            </p>
          </div>

          {/* Mode switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', backgroundColor: 'var(--medx-surface-muted)', borderRadius: 'var(--medx-radius-sm)', padding: '0.2rem' }}>
              <button
                type="button"
                onClick={() => setChartMode('normalized')}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 'var(--medx-radius-sm)',
                  cursor: 'pointer',
                  backgroundColor: chartMode === 'normalized' ? '#FFFFFF' : 'transparent',
                  color: chartMode === 'normalized' ? 'var(--medx-primary)' : 'var(--medx-text-secondary)',
                  boxShadow: chartMode === 'normalized' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Normalized (% of Median)
              </button>
              <button
                type="button"
                onClick={() => setChartMode('individual')}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 'var(--medx-radius-sm)',
                  cursor: 'pointer',
                  backgroundColor: chartMode === 'individual' ? '#FFFFFF' : 'transparent',
                  color: chartMode === 'individual' ? 'var(--medx-primary)' : 'var(--medx-text-secondary)',
                  boxShadow: chartMode === 'individual' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Individual Metric
              </button>
            </div>

            {chartMode === 'individual' && (
              <select
                value={selectedBiomarker}
                onChange={(e) => setSelectedBiomarker(e.target.value)}
                className="medx-input"
                style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                {Object.entries(BIOMARKER_SPECS).map(([k, v]) => (
                  <option key={k} value={k}>{v.fullName} ({v.unit})</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {trends.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--medx-text-muted)' }}>
            <Activity size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
            <p style={{ fontWeight: 600 }}>No longitudinal observations recorded yet.</p>
            <p style={{ fontSize: '0.8125rem' }}>Upload or log reports over time to visualize your health trends.</p>
          </div>
        ) : (
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'normalized' ? (
                <LineChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                  <YAxis
                    stroke="#6B7280"
                    fontSize={12}
                    domain={[40, 180]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(value, name) => [`${value}%`, BIOMARKER_SPECS[name.replace('_norm', '')]?.label || name]}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <ReferenceLine y={100} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Optimal Median (100%)', fill: '#10B981', fontSize: 11 }} />
                  <Line type="monotone" dataKey="glucose_fasting_norm" name="Glucose" stroke={BIOMARKER_SPECS.glucose_fasting.color} strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="hemoglobin_norm" name="Hemoglobin" stroke={BIOMARKER_SPECS.hemoglobin.color} strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="wbc_count_norm" name="WBC" stroke={BIOMARKER_SPECS.wbc_count.color} strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="creatinine_norm" name="Creatinine" stroke={BIOMARKER_SPECS.creatinine.color} strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="platelets_norm" name="Platelets" stroke={BIOMARKER_SPECS.platelets.color} strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="riskScore" name="Composite Risk Score (/100)" stroke={BIOMARKER_SPECS.riskScore.color} strokeWidth={3} strokeDasharray="4 4" dot={{ r: 5, fill: BIOMARKER_SPECS.riskScore.color }} />
                </LineChart>
              ) : (
                <LineChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    formatter={(value) => [`${value} ${BIOMARKER_SPECS[selectedBiomarker]?.unit}`, BIOMARKER_SPECS[selectedBiomarker]?.fullName]}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey={selectedBiomarker}
                    name={BIOMARKER_SPECS[selectedBiomarker]?.fullName}
                    stroke={BIOMARKER_SPECS[selectedBiomarker]?.color}
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* RESTORED RISK-SCORE TRAJECTORY & PROGNOSIS CALLOUT */}
        {trends.length > 0 && (
          <div style={{
            marginTop: '1.25rem',
            padding: '1.25rem',
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: 'var(--medx-radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#92400E' }}>
                  Restored Longitudinal Risk Trajectory & Prognosis
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: '#FEF3C7',
                  color: '#B45309',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '9999px',
                  border: '1px solid #FCD34D'
                }}>
                  {latestReport?.mlResult?.riskTier || (trends[trends.length - 1]?.riskTier) || 'Low'} Risk Tier
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: '#78350F' }}>Current Score: </span>
                  <strong style={{ fontSize: '1.125rem', color: '#B45309' }}>
                    {latestReport?.mlResult?.overallRiskScore ?? trends[trends.length - 1]?.riskScore ?? 0}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: '#92400E' }}>/100</span>
                </div>
                {trends.length >= 2 && (
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor:
                      (trends[trends.length - 1]?.riskScore - trends[trends.length - 2]?.riskScore) < 0
                        ? '#DCFCE7'
                        : (trends[trends.length - 1]?.riskScore - trends[trends.length - 2]?.riskScore) > 0
                        ? '#FEE2E2'
                        : '#EFF6FF',
                    color:
                      (trends[trends.length - 1]?.riskScore - trends[trends.length - 2]?.riskScore) < 0
                        ? '#166534'
                        : (trends[trends.length - 1]?.riskScore - trends[trends.length - 2]?.riskScore) > 0
                        ? '#991B1B'
                        : '#1E40AF'
                  }}>
                    {(trends[trends.length - 1]?.riskScore - trends[trends.length - 2]?.riskScore) < 0
                      ? `Improving (${trends[trends.length - 1]?.riskScore - trends[trends.length - 2]?.riskScore} pts)`
                      : (trends[trends.length - 1]?.riskScore - trends[trends.length - 2]?.riskScore) > 0
                      ? `Elevated (+${trends[trends.length - 1]?.riskScore - trends[trends.length - 2]?.riskScore} pts)`
                      : 'Stable (0 pts delta)'}
                  </div>
                )}
              </div>
            </div>

            {/* Chronological Risk History Rail */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              overflowX: 'auto',
              paddingTop: '0.5rem',
              borderTop: '1px solid #FDE68A'
            }}>
              {trends.map((pt, idx) => (
                <div
                  key={pt.id || idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #FDE68A',
                    minWidth: '110px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#78350F', fontWeight: 600 }}>{pt.date}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#B45309', margin: '0.15rem 0' }}>
                    {pt.riskScore} <span style={{ fontSize: '0.7rem' }}>/100</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: pt.riskTier === 'Low' ? '#166534' : pt.riskTier === 'Moderate' ? '#B45309' : '#991B1B' }}>
                    {pt.riskTier || 'Normal'}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.71875rem', color: '#92400E', lineHeight: 1.4 }}>
              <strong>Clinical Methodology:</strong> Risk trajectory reflects multi-organ clinical evaluation and biomarker flag weighting computed from verified laboratory observations and persisted directly in canonical MedicalReport records.
            </div>
          </div>
        )}
      </div>

      {/* Historical Reports Ledger */}
      <div className="medx-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
              Diagnostic Reports Ledger
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: '0.25rem 0 0 0' }}>
              Full chronological audit trail of all verified laboratory submissions.
            </p>
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-primary)' }}>
            {reports.length} Total Records
          </span>
        </div>

        {reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--medx-text-muted)' }}>
            No laboratory reports ingested. Use the Report Entry tab to add your first record.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--medx-border)', color: 'var(--medx-text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Report ID</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Report Title</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Source</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Risk Tier</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => {
                  const tier = r.mlResult?.riskTier || 'Low';
                  const isHigh = tier === 'High' || tier === 'Critical';

                  return (
                    <tr key={r._id} style={{ borderBottom: '1px solid var(--medx-border)', transition: 'background-color 0.15s ease' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--medx-primary)' }}>
                        {r.reportId || r._id.substring(0, 8)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--medx-navy)' }}>
                        {r.reportName || 'Blood Biomarker Panel'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--medx-text-secondary)' }}>
                        {new Date(r.reportDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: r.sourceType === 'upload' ? '#EFF6FF' : '#F3F4F6',
                            color: r.sourceType === 'upload' ? '#1D4ED8' : '#374151'
                          }}
                        >
                          {r.sourceType === 'upload' ? 'PDF Upload' : 'Manual Entry'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '9999px',
                            backgroundColor: isHigh ? '#FEE2E2' : '#ECFDF5',
                            color: isHigh ? '#B91C1C' : '#047857'
                          }}
                        >
                          {tier}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="medx-button medx-button-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="medx-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--medx-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                  {selectedReport.reportName || 'Diagnostic Report Details'}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)' }}>
                  ID: {selectedReport.reportId || selectedReport._id} • {new Date(selectedReport.reportDate).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--medx-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-text-secondary)', marginBottom: '0.5rem' }}>
                Biomarker Parameters
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {Object.entries(
                  selectedReport.parameters instanceof Map
                    ? Object.fromEntries(selectedReport.parameters)
                    : selectedReport.parameters || {}
                ).map(([k, item]) => {
                  const spec = BIOMARKER_SPECS[k];
                  return (
                    <div key={k} style={{ backgroundColor: 'var(--medx-surface-muted)', padding: '0.625rem', borderRadius: 'var(--medx-radius-sm)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', display: 'block' }}>
                        {spec?.fullName || k}
                      </span>
                      <strong style={{ fontSize: '0.9375rem', color: 'var(--medx-navy)' }}>
                        {item.value} {item.unit}
                      </strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--medx-text-muted)', display: 'block', marginTop: '0.125rem' }}>
                        Ref: {item.ref_range || spec?.refRange || 'Standard'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--medx-surface-muted)', padding: '0.875rem', borderRadius: 'var(--medx-radius-sm)', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.375rem' }}>
                Machine Learning Evaluation
              </h4>
              <p style={{ fontSize: '0.8125rem', margin: '0 0 0.25rem 0' }}>
                Overall Risk Score: <strong>{selectedReport.mlResult?.overallRiskScore ?? 'N/A'}/100</strong> ({selectedReport.mlResult?.riskTier || 'Low'})
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', margin: 0 }}>
                Engine: {selectedReport.mlResult?.modelSignature || 'MedX FastAPI Diagnostic Engine'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedReport(null)}
                className="medx-button medx-button-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
