import React, { useState, useEffect } from 'react';
import {
  Activity, Users, FileText, Pill, Clock, CheckCircle2,
  AlertTriangle, Phone, Stethoscope, RefreshCw, ChevronRight, Eye, Sparkles
} from 'lucide-react';
import api from '../../services/api.js';

const CLINICAL_QUOTES = [
  { quote: "Wherever the art of Medicine is loved, there is also a love of Humanity.", author: "Hippocrates" },
  { quote: "The good physician treats the disease; the great physician treats the patient who has the disease.", author: "Sir William Osler" },
  { quote: "Medicine is a science of uncertainty and an art of probability.", author: "Sir William Osler" },
  { quote: "To cure sometimes, to relieve often, to comfort always.", author: "Edward Livingston Trudeau" },
  { quote: "Care more particularly for the individual patient than for the special features of the disease.", author: "Sir William Osler" }
];

export function DoctorWorkstation({
  onSelectPatient,
  onOpenCall,
  onOpenPrescription,
  onOpenReview,
  onNavigateTab
}) {
  const [queue, setQueue] = useState([]);
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [emergencyCount, setEmergencyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quoteIdx, setQuoteIdx] = useState(0);

  const loadWorkstationData = async () => {
    try {
      setLoading(true);
      setError('');
      const [queueRes, patientsRes, reportsRes, emgRes] = await Promise.allSettled([
        api.get('/doctor/queue'),
        api.get('/doctor/patients'),
        api.get('/doctor/reports'),
        api.get('/emergency/stats/active-count')
      ]);

      if (queueRes.status === 'fulfilled') setQueue(queueRes.value.data || []);
      if (patientsRes.status === 'fulfilled') setPatients(patientsRes.value.data || []);
      if (reportsRes.status === 'fulfilled') setReports(reportsRes.value.data || []);
      if (emgRes.status === 'fulfilled' && emgRes.value.data) {
        setEmergencyCount(emgRes.value.data.activeCount || 0);
      }
    } catch (err) {
      console.error('Failed to load doctor workstation data:', err);
      setError('Unable to load workstation data. Please verify network and authentication.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkstationData();
  }, []);

  const pendingReports = reports.filter(r => r.reviewStatus !== 'Reviewed');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Clinical Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        {/* Metric 1: Total Patients */}
        <div
          className="medx-card"
          style={{ padding: '1.25rem', cursor: 'pointer' }}
          onClick={() => onNavigateTab && onNavigateTab('patients')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>
                ACTIVE PATIENTS
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--medx-navy)', marginTop: '0.25rem' }}>
                {loading ? '...' : patients.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={13} /> Under Clinical Roster
              </div>
            </div>
            <div style={{ backgroundColor: '#EFF6FF', color: '#2563EB', padding: '0.625rem', borderRadius: 'var(--medx-radius-md)' }}>
              <Users size={22} />
            </div>
          </div>
        </div>

        {/* Metric 2: Today's Triage Queue */}
        <div className="medx-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>
                CONSULTATION QUEUE
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--medx-navy)', marginTop: '0.25rem' }}>
                {loading ? '...' : queue.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={13} /> Outpatient Walk-ins
              </div>
            </div>
            <div style={{ backgroundColor: '#FEF3C7', color: '#D97706', padding: '0.625rem', borderRadius: 'var(--medx-radius-md)' }}>
              <Clock size={22} />
            </div>
          </div>
        </div>

        {/* Metric 3: Pending Diagnostic Reports */}
        <div
          className="medx-card"
          style={{ padding: '1.25rem', cursor: 'pointer' }}
          onClick={() => onNavigateTab && onNavigateTab('reports')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>
                PENDING REVIEWS
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: pendingReports.length > 0 ? '#DC2626' : 'var(--medx-navy)', marginTop: '0.25rem' }}>
                {loading ? '...' : pendingReports.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: pendingReports.length > 0 ? '#DC2626' : '#16A34A', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {pendingReports.length > 0 ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
                {pendingReports.length > 0 ? 'Diagnostic Sign-off Needed' : 'All Reports Verified'}
              </div>
            </div>
            <div style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '0.625rem', borderRadius: 'var(--medx-radius-md)' }}>
              <FileText size={22} />
            </div>
          </div>
        </div>

        {/* Metric 4: Clinical Prescriptions */}
        <div className="medx-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>
                PRESCRIPTIONS ISSUED
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--medx-navy)', marginTop: '0.25rem' }}>
                {loading ? '...' : patients.reduce((acc, p) => acc + (p.prescriptionsCount || 0), 0)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={13} /> Synchronized to MongoDB
              </div>
            </div>
            <div style={{ backgroundColor: '#ECFDF5', color: '#059669', padding: '0.625rem', borderRadius: 'var(--medx-radius-md)' }}>
              <Pill size={22} />
            </div>
          </div>
        </div>

        {/* Metric 5: Emergency Alerts */}
        <div
          className="medx-card"
          style={{
            padding: '1.25rem',
            cursor: 'pointer',
            borderLeft: emergencyCount > 0 ? '4px solid #E11D48' : 'none'
          }}
          onClick={() => onNavigateTab && onNavigateTab('emergency')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>
                EMERGENCY SOS DESK
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: emergencyCount > 0 ? '#E11D48' : 'var(--medx-navy)', marginTop: '0.25rem' }}>
                {loading ? '...' : emergencyCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: emergencyCount > 0 ? '#E11D48' : '#64748B', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertTriangle size={13} /> {emergencyCount > 0 ? 'Urgent SOS Broadcasts' : 'All Clear / Monitoring'}
              </div>
            </div>
            <div style={{ backgroundColor: emergencyCount > 0 ? '#FFE4E6' : '#F1F5F9', color: emergencyCount > 0 ? '#E11D48' : '#64748B', padding: '0.625rem', borderRadius: 'var(--medx-radius-md)' }}>
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Inspirational Clinical Perspective (Doctor Baseline Preservation) */}
      <div style={{
        backgroundColor: '#F3EEFF',
        border: '1px solid #DDD6FE',
        borderRadius: 'var(--medx-radius-md)',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        color: '#5B21B6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sparkles size={18} style={{ color: '#7C3AED', flexShrink: 0 }} />
          <span style={{ fontSize: '0.875rem', fontStyle: 'italic', fontWeight: 500 }}>
            "{CLINICAL_QUOTES[quoteIdx].quote}"
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7C3AED', whiteSpace: 'nowrap' }}>
            — {CLINICAL_QUOTES[quoteIdx].author}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setQuoteIdx((prev) => (prev + 1) % CLINICAL_QUOTES.length)}
          className="medx-btn medx-btn-outline"
          style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderColor: '#C4B5FD', color: '#6D28D9', borderRadius: '4px' }}
          title="Rotate clinical perspective"
        >
          Next Quote
        </button>
      </div>

      {/* Main Workstation Layout: Queue on Left, Action Center on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Outpatient Triage & Consultation Queue */}
        <div className="medx-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                Outpatient Consultation Triage Queue
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: '0.25rem 0 0 0' }}>
                Real-time patient intake and diagnostic triage queue
              </p>
            </div>
            <button
              type="button"
              className="medx-btn medx-btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              onClick={loadWorkstationData}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--medx-text-secondary)' }}>
              Loading outpatient consultation queue...
            </div>
          ) : queue.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--medx-radius-md)',
              border: '1px dashed #CBD5E1'
            }}>
              <CheckCircle2 size={36} color="#16A34A" style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--medx-navy)', fontSize: '1rem' }}>No Patients Waiting</h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--medx-text-secondary)' }}>
                Your outpatient consultation triage queue is completely cleared.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {queue.map((item, idx) => {
                const isCritical = item.priority === 'Critical' || item.status === 'Critical';
                const isUrgent = item.priority === 'Urgent' || item.status === 'Urgent';
                const urgencyBorder = isCritical ? '4px solid #EF4444' : isUrgent ? '4px solid #F59E0B' : '4px solid #10B981';
                const urgencyBg = isCritical ? '#FEF2F2' : isUrgent ? '#FFFBEB' : '#ECFDF5';
                const urgencyColor = isCritical ? '#B91C1C' : isUrgent ? '#B45309' : '#047857';

                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: `1px solid ${isCritical ? '#FECACA' : isUrgent ? '#FDE68A' : '#E2E8F0'}`,
                      borderLeft: urgencyBorder,
                      borderRadius: 'var(--medx-radius-md)',
                      padding: '0.875rem 1.125rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.875rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        backgroundColor: isCritical ? '#FEE2E2' : isUrgent ? '#FEF3C7' : '#F1F5F9',
                        color: isCritical ? '#DC2626' : isUrgent ? '#D97706' : '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.8125rem',
                        border: `1px solid ${isCritical ? '#FCA5A5' : isUrgent ? '#FDE68A' : '#CBD5E1'}`
                      }}>
                        #{item.tokenNumber}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, color: 'var(--medx-navy)', fontSize: '0.95rem' }}>
                            {item.patientName}
                          </span>
                          <span style={{
                            fontSize: '0.6875rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            backgroundColor: urgencyBg,
                            color: urgencyColor,
                            border: `1px solid ${isCritical ? '#FCA5A5' : isUrgent ? '#FDE68A' : '#A7F3D0'}`
                          }}>
                            {item.priority || 'Routine'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78125rem', color: 'var(--medx-text-secondary)', marginTop: '0.2rem' }}>
                          {item.gender} • {item.age} yrs • Blood: <strong style={{ color: 'var(--medx-navy)' }}>{item.bloodGroup}</strong> • Est. Wait: <strong>{item.estimatedWaitTime}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="medx-btn medx-btn-secondary"
                        style={{ fontSize: '0.78125rem', padding: '0.35rem 0.625rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={async () => {
                          try {
                            const res = await api.get(`/doctor/patients/${item.patientId}`);
                            onSelectPatient(res.data);
                          } catch (err) {
                            alert('Failed to load patient dossier: ' + (err.response?.data?.error?.message || err.message));
                          }
                        }}
                      >
                        <Eye size={13} /> Dossier
                      </button>

                      <button
                        type="button"
                        className="medx-btn medx-btn-secondary"
                        style={{ fontSize: '0.78125rem', padding: '0.35rem 0.625rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6D28D9', borderColor: '#DDD6FE' }}
                        onClick={async () => {
                          try {
                            const res = await api.get(`/doctor/patients/${item.patientId}`);
                            onOpenPrescription(res.data);
                          } catch (err) {
                            onOpenPrescription({ name: item.patientName, id: item.patientId });
                          }
                        }}
                      >
                        <Pill size={13} /> Prescribe
                      </button>

                      <button
                        type="button"
                        className="medx-btn"
                        style={{
                          backgroundColor: '#10B981',
                          color: '#FFFFFF',
                          fontSize: '0.78125rem',
                          padding: '0.35rem 0.625rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        onClick={async () => {
                          try {
                            const res = await api.get(`/doctor/patients/${item.patientId}`);
                            onOpenCall(res.data);
                          } catch (err) {
                            onOpenCall({ name: item.patientName, id: item.patientId });
                          }
                        }}
                      >
                        <Phone size={13} /> Consult
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Quick Workstation Shortcuts & Pending Diagnostics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Diagnostic Reviews Panel */}
          <div className="medx-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--medx-navy)', margin: 0 }}>
                Reports Needing Review
              </h3>
              <span className="medx-badge" style={{ backgroundColor: '#FEF2F2', color: '#DC2626', fontSize: '0.75rem' }}>
                {pendingReports.length} pending
              </span>
            </div>

            {pendingReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', fontSize: '0.8125rem', color: 'var(--medx-text-secondary)' }}>
                No reports awaiting sign-off.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {pendingReports.slice(0, 4).map((rep) => (
                  <div
                    key={rep._id}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#F8FAFC',
                      borderRadius: 'var(--medx-radius-sm)',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer'
                    }}
                    onClick={() => onOpenReview(rep)}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--medx-navy)' }}>
                      {rep.reportName || rep.name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--medx-text-secondary)', marginTop: '0.25rem' }}>
                      <span>Date: {new Date(rep.reportDate || Date.now()).toLocaleDateString()}</span>
                      <span style={{ color: rep.mlResult?.riskTier === 'High' ? '#DC2626' : '#2563EB', fontWeight: 600 }}>
                        {rep.mlResult?.riskTier || 'Review Required'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clinical Workstation Status Box */}
          <div className="medx-card" style={{ padding: '1.25rem', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Stethoscope size={18} color="#16A34A" />
              <strong style={{ fontSize: '0.875rem', color: '#166534' }}>Physician Workstation Online</strong>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#166534', margin: 0, lineHeight: 1.5 }}>
              Connected to <strong>medx_unified</strong> MongoDB cluster. All prescription events, review signatures, and dossier updates are authenticated via unified RBAC.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorWorkstation;
