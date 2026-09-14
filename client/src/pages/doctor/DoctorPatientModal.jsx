import React, { useState } from 'react';
import {
  X, User, Activity, FileText, Pill, Calendar, AlertCircle, Plus,
  Stethoscope, Clock, ShieldCheck, CheckCircle2, ChevronRight
} from 'lucide-react';
import api from '../../services/api.js';

export function DoctorPatientModal({ patient, onClose, onRefresh, onOpenPrescription, onOpenCall, onReviewReport }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'reports' | 'prescriptions' | 'notes' | 'followup'
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  const [followupDate, setFollowupDate] = useState('');
  const [followupPurpose, setFollowupPurpose] = useState('');
  const [followupInstructions, setFollowupInstructions] = useState('');
  const [followupSaving, setFollowupSaving] = useState(false);

  if (!patient) return null;

  const vitals = patient.vitalSigns || {};
  const labReports = patient.labReports || [];
  const prescriptions = patient.prescriptions || [];
  const clinicalNotes = patient.clinicalNotes || [];
  const followupPlan = patient.followupPlan || [];

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      setNoteSaving(true);
      await api.post(`/doctor/patients/${patient._id || patient.id}/notes`, {
        note: noteText.trim()
      });
      setNoteText('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to add note:', err);
      alert('Failed to save clinical note: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setNoteSaving(false);
    }
  };

  const handleAddFollowup = async (e) => {
    e.preventDefault();
    if (!followupDate || !followupPurpose.trim()) {
      alert('Please provide follow-up date and purpose');
      return;
    }
    try {
      setFollowupSaving(true);
      await api.post(`/doctor/patients/${patient._id || patient.id}/followups`, {
        date: followupDate,
        purpose: followupPurpose.trim(),
        instructions: followupInstructions.trim()
      });
      setFollowupDate('');
      setFollowupPurpose('');
      setFollowupInstructions('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to add follow-up:', err);
      alert('Failed to save follow-up plan: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setFollowupSaving(false);
    }
  };

  return (
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
      padding: '1rem',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--medx-radius-lg)',
        width: '100%',
        maxWidth: '960px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#E0F2FE',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.125rem'
            }}>
              {patient.name ? patient.name.charAt(0) : 'P'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                  {patient.name}
                </h2>
                <span className="medx-badge" style={{
                  backgroundColor: patient.status === 'Critical' ? '#FEE2E2' : '#E0F2FE',
                  color: patient.status === 'Critical' ? '#DC2626' : '#0369A1',
                  fontSize: '0.75rem'
                }}>
                  {patient.status || 'Active'}
                </span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', marginTop: '0.25rem' }}>
                ID: <strong>{patient.id || patient.legacyId || patient._id}</strong> • {patient.gender || 'Unspecified'} • {patient.age || '42'} yrs • Blood: <strong>{patient.bloodGroup || 'O+'}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {onOpenCall && (
              <button
                type="button"
                className="medx-btn"
                style={{
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  padding: '0.5rem 0.875rem',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}
                onClick={() => onOpenCall(patient)}
              >
                <Stethoscope size={15} /> Consultation Call
              </button>
            )}
            {onOpenPrescription && (
              <button
                type="button"
                className="medx-btn"
                style={{
                  backgroundColor: 'var(--medx-teal)',
                  color: '#FFFFFF',
                  padding: '0.5rem 0.875rem',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}
                onClick={() => onOpenPrescription(patient)}
              >
                <Pill size={15} /> Author Rx
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--medx-text-secondary)',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                borderRadius: 'var(--medx-radius-sm)'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Dossier Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 1.5rem',
          backgroundColor: '#FFFFFF',
          gap: '1rem',
          overflowX: 'auto'
        }}>
          {[
            { key: 'overview', label: 'Clinical Vitals & Overview', icon: Activity },
            { key: 'reports', label: `Lab Reports (${labReports.length})`, icon: FileText },
            { key: 'prescriptions', label: `Prescriptions (${prescriptions.length})`, icon: Pill },
            { key: 'notes', label: `Clinical Notes (${clinicalNotes.length})`, icon: Stethoscope },
            { key: 'followup', label: `Follow-up Plan (${followupPlan.length})`, icon: Calendar }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--medx-teal)' : 'var(--medx-text-secondary)',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--medx-teal)' : '2px solid transparent',
                  background: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, backgroundColor: '#FAFAFA' }}>
          {/* TAB 1: OVERVIEW & VITALS */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Primary Condition & Flags */}
              <div style={{
                backgroundColor: '#FFFFFF',
                padding: '1.25rem',
                borderRadius: 'var(--medx-radius-md)',
                border: '1px solid #E2E8F0'
              }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.5rem' }}>
                  Current Clinical Condition & Presentation
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                  {patient.currentCondition || 'Routine Health Monitoring & Vitals Check'}
                </p>
                {patient.clinicalFlags && patient.clinicalFlags.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    {patient.clinicalFlags.map((flag, idx) => (
                      <span key={idx} style={{
                        backgroundColor: '#FEF2F2',
                        color: '#B91C1C',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <AlertCircle size={12} /> {flag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Vitals Grid */}
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.75rem' }}>
                  Recorded Vital Signs
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.875rem'
                }}>
                  {[
                    { label: 'Blood Pressure', value: vitals.bloodPressure || '120/80 mmHg', color: '#6366F1' },
                    { label: 'Heart Rate', value: typeof vitals.heartRate === 'number' ? `${vitals.heartRate} bpm` : (vitals.heartRate || '72 bpm'), color: '#EF4444' },
                    { label: 'Body Temp', value: typeof vitals.temperature === 'number' ? `${vitals.temperature} °F` : (vitals.temperature || '98.6 °F'), color: '#F59E0B' },
                    { label: 'SpO2 Oxygen', value: vitals.spo2 || (typeof vitals.oxygenSaturation === 'number' ? `${vitals.oxygenSaturation}%` : (vitals.oxygenSaturation || '99%')), color: '#10B981' },
                    { label: 'Respiratory Rate', value: typeof vitals.respiratoryRate === 'number' ? `${vitals.respiratoryRate} bpm` : (vitals.respiratoryRate || '16 bpm'), color: '#3B82F6' },
                    { label: 'BMI / Weight', value: `${vitals.bmi || '23.0'} (${vitals.weight || '68 kg'})`, color: '#8B5CF6' }
                  ].map((v, i) => (
                    <div key={i} style={{
                      backgroundColor: '#FFFFFF',
                      padding: '1rem',
                      borderRadius: 'var(--medx-radius-md)',
                      border: '1px solid #E2E8F0',
                      borderLeft: `4px solid ${v.color}`
                    }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                        {v.label}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--medx-navy)', marginTop: '0.25rem' }}>
                        {v.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* History & Allergies */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: 'var(--medx-radius-md)', border: '1px solid #E2E8F0' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.5rem' }}>
                    Allergies
                  </h4>
                  {patient.allergies && patient.allergies.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#475569' }}>
                      {patient.allergies.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  ) : (
                    <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>No known drug allergies reported</span>
                  )}
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: 'var(--medx-radius-md)', border: '1px solid #E2E8F0' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.5rem' }}>
                    Medical History
                  </h4>
                  {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#475569' }}>
                      {patient.medicalHistory.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                  ) : (
                    <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>No prior hospitalizations or surgical history</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LAB REPORTS */}
          {activeTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {labReports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--medx-radius-md)', border: '1px solid #E2E8F0' }}>
                  <FileText size={36} color="#94A3B8" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--medx-navy)', margin: '0 0 0.25rem 0' }}>No Lab Reports Found</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: 0 }}>This patient has not uploaded or generated any laboratory diagnostic reports yet.</p>
                </div>
              ) : (
                labReports.map(report => (
                  <div key={report._id || report.id} style={{
                    backgroundColor: '#FFFFFF',
                    padding: '1.25rem',
                    borderRadius: 'var(--medx-radius-md)',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--medx-navy)', fontSize: '0.9375rem' }}>
                          {report.name || report.reportName}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                          fontWeight: 600,
                          backgroundColor: report.reviewStatus === 'Reviewed' ? '#DCFCE7' : '#FEF3C7',
                          color: report.reviewStatus === 'Reviewed' ? '#15803D' : '#B45309'
                        }}>
                          {report.reviewStatus || 'Pending Review'}
                        </span>
                        {report.mlResult?.riskTier && (
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '9999px',
                            fontWeight: 600,
                            backgroundColor: report.mlResult.riskTier === 'Critical' || report.mlResult.riskTier === 'High' ? '#FEE2E2' : '#F1F5F9',
                            color: report.mlResult.riskTier === 'Critical' || report.mlResult.riskTier === 'High' ? '#B91C1C' : '#475569'
                          }}>
                            ML Risk: {report.mlResult.riskTier}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', marginTop: '0.25rem' }}>
                        Date: {report.date} • Source: {report.sourceType} • Report ID: {report.id}
                      </div>
                      {report.reviewNotes && (
                        <div style={{ fontSize: '0.8125rem', color: '#1E293B', backgroundColor: '#F8FAFC', padding: '0.5rem 0.75rem', borderRadius: 'var(--medx-radius-sm)', marginTop: '0.5rem', borderLeft: '3px solid #10B981' }}>
                          <strong>Doctor Review:</strong> {report.reviewNotes}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {onReviewReport && (
                        <button
                          type="button"
                          className="medx-btn"
                          style={{
                            backgroundColor: report.reviewStatus === 'Reviewed' ? '#F1F5F9' : 'var(--medx-teal)',
                            color: report.reviewStatus === 'Reviewed' ? '#0F172A' : '#FFFFFF',
                            padding: '0.375rem 0.75rem',
                            fontSize: '0.8125rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                          onClick={() => onReviewReport(report)}
                        >
                          <ShieldCheck size={14} /> {report.reviewStatus === 'Reviewed' ? 'Edit Review' : 'Review Report'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                  Digital Prescriptions Record
                </h4>
                {onOpenPrescription && (
                  <button
                    type="button"
                    className="medx-btn medx-btn-primary"
                    style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                    onClick={() => onOpenPrescription(patient)}
                  >
                    <Plus size={14} /> Author New Prescription
                  </button>
                )}
              </div>

              {prescriptions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--medx-radius-md)', border: '1px solid #E2E8F0' }}>
                  <Pill size={36} color="#94A3B8" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--medx-text-secondary)' }}>No active prescriptions authored yet.</p>
                </div>
              ) : (
                prescriptions.map((rx, idx) => (
                  <div key={idx} style={{
                    backgroundColor: '#FFFFFF',
                    padding: '1.25rem',
                    borderRadius: 'var(--medx-radius-md)',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--medx-navy)', fontSize: '0.9375rem' }}>
                          {rx.prescriptionNumber || rx.prescriptionId || `RX-${idx + 1}`}
                        </span>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)' }}>
                          Prescribed by: {rx.doctorName || 'Attending Physician'} • Date: {new Date(rx.date).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="medx-badge" style={{ backgroundColor: '#F0FDF4', color: '#166534', fontSize: '0.75rem' }}>
                        Active Rx
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: '#334155', marginBottom: '0.75rem' }}>
                      <strong>Diagnosis:</strong> {rx.diagnosis || 'General Clinical Management'}
                    </div>

                    {/* Medicines List */}
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--medx-radius-sm)',
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--medx-text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Prescribed Medications ({rx.medicines?.length || 0})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {rx.medicines?.map((med, mIdx) => (
                          <div key={mIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', borderBottom: mIdx < rx.medicines.length - 1 ? '1px dashed #E2E8F0' : 'none', paddingBottom: '0.375rem' }}>
                            <div>
                              <strong style={{ color: 'var(--medx-navy)' }}>{med.name}</strong> • {med.dosage} ({med.frequency})
                              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{med.instructions}</div>
                            </div>
                            <span style={{ color: '#475569', fontWeight: 500 }}>{med.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {(rx.notes || rx.advice) && (
                      <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
                        <strong>Clinical Advice:</strong> {rx.notes || rx.advice}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: CLINICAL NOTES */}
          {activeTab === 'notes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} style={{
                backgroundColor: '#FFFFFF',
                padding: '1.25rem',
                borderRadius: 'var(--medx-radius-md)',
                border: '1px solid #E2E8F0'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                  Add Clinical Consultation Note
                </h4>
                <textarea
                  className="medx-input"
                  style={{ width: '100%', minHeight: '80px', marginBottom: '0.75rem', resize: 'vertical' }}
                  placeholder="Record symptoms, physical exam findings, patient responses, or differential diagnosis..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    className="medx-btn medx-btn-primary"
                    disabled={noteSaving}
                    style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                  >
                    {noteSaving ? 'Saving...' : 'Add Note to Dossier'}
                  </button>
                </div>
              </form>

              {/* Notes Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                  Consultation Notes Timeline
                </h4>
                {clinicalNotes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--medx-radius-md)', border: '1px solid #E2E8F0', color: 'var(--medx-text-secondary)', fontSize: '0.875rem' }}>
                    No clinical consultation notes recorded yet.
                  </div>
                ) : (
                  clinicalNotes.map((n, idx) => (
                    <div key={idx} style={{
                      backgroundColor: '#FFFFFF',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--medx-radius-md)',
                      border: '1px solid #E2E8F0',
                      borderLeft: '4px solid var(--medx-teal)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--medx-text-secondary)', marginBottom: '0.375rem' }}>
                        <span><strong>{n.doctorName || 'Attending Physician'}</strong></span>
                        <span>{n.date} {n.time || ''}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#1E293B', lineHeight: 1.5 }}>
                        {n.note || n.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: FOLLOW-UP PLAN */}
          {activeTab === 'followup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Schedule Followup Form */}
              <form onSubmit={handleAddFollowup} style={{
                backgroundColor: '#FFFFFF',
                padding: '1.25rem',
                borderRadius: 'var(--medx-radius-md)',
                border: '1px solid #E2E8F0'
              }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                  Schedule Clinical Follow-Up & Tests
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--medx-text-secondary)', marginBottom: '0.25rem' }}>Follow-Up Date</label>
                    <input
                      type="date"
                      className="medx-input"
                      value={followupDate}
                      onChange={(e) => setFollowupDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--medx-text-secondary)', marginBottom: '0.25rem' }}>Purpose & Objectives</label>
                    <input
                      type="text"
                      className="medx-input"
                      placeholder="e.g. Recheck blood glucose and review medication response"
                      value={followupPurpose}
                      onChange={(e) => setFollowupPurpose(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--medx-text-secondary)', marginBottom: '0.25rem' }}>Patient Instructions</label>
                  <input
                    type="text"
                    className="medx-input"
                    placeholder="e.g. 10-hour fasting required prior to lab visit"
                    value={followupInstructions}
                    onChange={(e) => setFollowupInstructions(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    className="medx-btn medx-btn-primary"
                    disabled={followupSaving}
                    style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                  >
                    {followupSaving ? 'Saving...' : 'Set Follow-up Plan'}
                  </button>
                </div>
              </form>

              {/* Followups List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                  Scheduled Appointments & Plans
                </h4>
                {followupPlan.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--medx-radius-md)', border: '1px solid #E2E8F0', color: 'var(--medx-text-secondary)', fontSize: '0.875rem' }}>
                    No follow-up consultations currently scheduled.
                  </div>
                ) : (
                  followupPlan.map((fp, idx) => (
                    <div key={idx} style={{
                      backgroundColor: '#FFFFFF',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--medx-radius-md)',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--medx-navy)', fontSize: '0.875rem' }}>
                          {fp.purpose || fp.reason || 'Clinical Consultation'}
                        </div>
                        {fp.instructions && (
                          <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '0.25rem' }}>
                            Instructions: {fp.instructions}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="medx-badge" style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', fontSize: '0.75rem' }}>
                          <Calendar size={12} /> {fp.date}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorPatientModal;
