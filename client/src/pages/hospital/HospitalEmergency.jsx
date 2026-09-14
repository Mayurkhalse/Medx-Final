import React, { useState, useEffect } from 'react';
import {
  AlertOctagon, CheckCircle2, Clock, ShieldAlert, Phone,
  RefreshCw, MapPin, Check, Filter, X
} from 'lucide-react';
import emergencyService from '../../services/emergencyService.js';

export default function HospitalEmergency() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const [ackModalAlert, setAckModalAlert] = useState(null);
  const [dispatchStatus, setDispatchStatus] = useState('Hospital Emergency Squad Dispatched');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchAlerts = async () => {
    try {
      const data = await emergencyService.getEmergencyAlerts();
      if (Array.isArray(data)) {
        setAlerts(data);
      }
    } catch (err) {
      console.error('[HOSPITAL EMERGENCY] Error polling alerts:', err);
      setError(err.response?.data?.error?.message || 'Failed to retrieve hospital emergency alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenDispatchModal = (alert) => {
    setAckModalAlert(alert);
    setDispatchStatus('Hospital Emergency Squad Dispatched');
    setDispatchNotes('');
  };

  const handleConfirmDispatch = async () => {
    if (!ackModalAlert) return;
    setIsProcessing(true);
    try {
      await emergencyService.dispatchEmergencyAlert(ackModalAlert._id, {
        statusText: dispatchStatus,
        dispatchNotes: dispatchNotes.trim()
      });
      setAckModalAlert(null);
      await fetchAlerts();
    } catch (err) {
      alert('Failed to dispatch hospital emergency squad: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolveAlert = async (alert) => {
    const notes = prompt('Enter institutional emergency resolution notes:') || 'Facility triage completed, emergency stabilized.';
    try {
      await emergencyService.resolveEmergencyAlert(alert._id, notes);
      await fetchAlerts();
    } catch (err) {
      alert('Failed to resolve alert: ' + (err.response?.data?.error?.message || err.message));
    }
  };

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE' || a.status === 'IN_PROGRESS');

  const filteredAlerts = alerts.filter(alert => {
    if (activeFilter === 'Active') return alert.status === 'ACTIVE';
    if (activeFilter === 'Dispatched') return alert.status === 'IN_PROGRESS';
    if (activeFilter === 'Resolved') return alert.status === 'RESOLVED';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div
        className="medx-card"
        style={{
          background: 'linear-gradient(135deg, #FAF5FF 0%, #FFFFFF 100%)',
          border: '2px solid #E9D5FF',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#9333EA',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertOctagon size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--medx-navy)', margin: 0 }}>
                Critical Alerts & Hospital SOS Monitoring Desk
              </h1>
              <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                Affiliated distress broadcasts, telemetry events & rapid clinical squad dispatch
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              backgroundColor: activeAlerts.length > 0 ? '#E11D48' : '#16A34A',
              color: '#FFFFFF',
              padding: '0.4rem 0.875rem',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 800
            }}
          >
            {activeAlerts.length} Active Incident{activeAlerts.length === 1 ? '' : 's'}
          </span>
          <button
            onClick={fetchAlerts}
            className="medx-button medx-button-secondary"
            style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['All', 'Active', 'Dispatched', 'Resolved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`medx-button ${activeFilter === tab ? 'medx-button-primary' : 'medx-button-secondary'}`}
            style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
          >
            {tab} {tab === 'All' ? `(${alerts.length})` : tab === 'Active' ? `(${alerts.filter(a => a.status === 'ACTIVE').length})` : ''}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="medx-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading && alerts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--medx-text-secondary)' }}>
            Loading emergency alerts...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#DCFCE7',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <CheckCircle2 size={28} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--medx-navy)', margin: '0 0 0.5rem 0' }}>
              All Facility Alerts Resolved
            </h3>
            <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              No active emergency distress broadcasts currently pending triage for this hospital facility.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--medx-surface-muted)', borderBottom: '1px solid #E2E8F0', color: 'var(--medx-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.875rem 1.25rem' }}>Patient Name / ID</th>
                  <th style={{ padding: '0.875rem 1.25rem' }}>Distress Reason / Vitals</th>
                  <th style={{ padding: '0.875rem 1.25rem' }}>Location Telemetry</th>
                  <th style={{ padding: '0.875rem 1.25rem' }}>Logged Time</th>
                  <th style={{ padding: '0.875rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Operational Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert) => {
                  const isResolved = alert.status === 'RESOLVED';
                  const isInProgress = alert.status === 'IN_PROGRESS';

                  return (
                    <tr
                      key={alert._id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        backgroundColor: isResolved ? '#FFFFFF' : isInProgress ? '#FFFDF5' : '#FFF5F5'
                      }}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--medx-navy)' }}>
                          {alert.patientName || alert.patientId?.name || 'Emergency Patient'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', fontFamily: 'monospace' }}>
                          {alert.alertId || alert._id}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: '#991B1B' }}>
                          {alert.triggerReason || 'Acute Physiological Distress'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)' }}>
                          {alert.vitalsAtAlert || alert.vitalSeverity}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem' }}>
                          <MapPin size={14} color="#E11D48" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--medx-navy)' }}>
                              {alert.location?.address || 'Device GPS Capture'}
                            </div>
                            {alert.location?.coordinatesText && (
                              <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--medx-text-secondary)' }}>
                                {alert.location.coordinatesText}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', color: 'var(--medx-text-secondary)', fontSize: '0.8125rem' }}>
                        {new Date(alert.createdAt).toLocaleString()}
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            backgroundColor: isResolved ? '#F1F5F9' : isInProgress ? '#FEF3C7' : '#FEE2E2',
                            color: isResolved ? '#64748B' : isInProgress ? '#B45309' : '#BE123C'
                          }}
                        >
                          {alert.status}
                        </span>
                        {alert.dispatch?.statusText && (
                          <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '0.25rem', fontWeight: 600 }}>
                            {alert.dispatch.statusText}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        {!isResolved && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleOpenDispatchModal(alert)}
                              className="medx-button"
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.35rem 0.65rem',
                                backgroundColor: '#FEE2E2',
                                color: '#B91C1C',
                                border: '1px solid #FCA5A5'
                              }}
                            >
                              Dispatch Squad
                            </button>
                            <button
                              onClick={() => handleResolveAlert(alert)}
                              className="medx-button medx-button-secondary"
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                            >
                              Resolve
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispatch Modal */}
      {ackModalAlert && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="medx-card" style={{ maxWidth: '480px', width: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--medx-navy)', margin: 0 }}>
                Dispatch Hospital Response Squad
              </h3>
              <button
                onClick={() => setAckModalAlert(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--medx-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--medx-text-secondary)', margin: 0 }}>
              Dispatch rapid response personnel to patient <strong>{ackModalAlert.patientName}</strong> ({ackModalAlert.alertId}).
            </p>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Response Status
              </label>
              <select
                value={dispatchStatus}
                onChange={(e) => setDispatchStatus(e.target.value)}
                className="medx-input"
                style={{ width: '100%' }}
              >
                <option value="Hospital Emergency Squad Dispatched">Hospital Emergency Squad Dispatched</option>
                <option value="Rapid Response Inpatient Team En Route">Rapid Response Inpatient Team En Route</option>
                <option value="ER Bay Prepared for Admission">ER Bay Prepared for Admission</option>
                <option value="Critical Care Attending Assigned">Critical Care Attending Assigned</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Operational Notes
              </label>
              <textarea
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
                placeholder="Directives for ER staff, transport or ambulance..."
                className="medx-input"
                style={{ width: '100%', height: '80px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => setAckModalAlert(null)}
                className="medx-button medx-button-secondary"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDispatch}
                className="medx-button"
                disabled={isProcessing}
                style={{ backgroundColor: '#9333EA', color: '#FFFFFF', fontWeight: 700 }}
              >
                {isProcessing ? 'Dispatching...' : 'Confirm Squad Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
