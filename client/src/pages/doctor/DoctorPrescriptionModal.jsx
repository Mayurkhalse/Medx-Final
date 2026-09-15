import React, { useState } from 'react';
import { X, Pill, Plus, Trash2, CheckCircle2, AlertCircle, Printer } from 'lucide-react';
import api from '../../services/api.js';

export function DoctorPrescriptionModal({ patient, onClose, onSuccess }) {
  const [diagnosis, setDiagnosis] = useState(patient?.currentCondition || '');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '500 mg', frequency: 'Twice daily', duration: '14 days', instructions: 'Take after meals' }
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedRx, setSavedRx] = useState(null);
  const [previewSlip, setPreviewSlip] = useState(false);

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { name: '', dosage: '1 Tab', frequency: 'Once daily', duration: '7 days', instructions: 'Take with water' }
    ]);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validMeds = medicines.filter(m => m.name.trim() !== '');
    if (validMeds.length === 0) {
      setError('Please add at least one medicine with a valid name.');
      return;
    }

    try {
      setSaving(true);
      const res = await api.post(`/doctor/patients/${patient._id || patient.id}/prescriptions`, {
        diagnosis: diagnosis || 'Clinical Management',
        medicines: validMeds,
        notes: notes.trim()
      });

      setSavedRx(res.data);
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      console.error('Failed to submit prescription:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to persist prescription');
    } finally {
      setSaving(false);
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
      zIndex: 1100,
      padding: '1rem',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--medx-radius-lg)',
        width: '100%',
        maxWidth: '750px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--medx-radius-md)',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Pill size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                Digital Prescription Authoring
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', margin: '0.125rem 0 0 0' }}>
                Patient: <strong>{patient?.name}</strong> • ID: {patient?.id || patient?.legacyId || patient?._id}
              </p>
            </div>
          </div>

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

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div style={{
              backgroundColor: '#FEF2F2',
              color: '#B91C1C',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--medx-radius-sm)',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* 1. AUTHENTIC PAPER-STYLE PRESCRIPTION SLIP PRESENTATION */}
          {(savedRx || previewSlip) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {savedRx && (
                <div style={{
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--medx-radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  <CheckCircle2 size={18} color="#10B981" />
                  Prescription successfully signed and synchronized with patient dossier.
                </div>
              )}

              {/* Authentic Paper Pad */}
              <div
                id="printable-rx-slip"
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '2rem',
                  borderRadius: 'var(--medx-radius-lg)',
                  border: '1.5px solid #E2E8F0',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                  color: '#0F172A',
                  fontFamily: 'var(--medx-font-sans)'
                }}
              >
                {/* Doctor Letterhead */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '2.5px solid #0F172A',
                  paddingBottom: '1rem',
                  marginBottom: '1.25rem'
                }}>
                  <div>
                    <h2 style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      margin: 0,
                      fontFamily: 'var(--medx-font-display)'
                    }}>
                      {savedRx?.doctorName || 'Dr. Attending Physician'}
                    </h2>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#6D28D9', margin: '0.2rem 0' }}>
                      MD, Physician Specialist • General & Diagnostic Medicine
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                      Med-X Unified Healthcare System • Clinical Decision Support Workstation
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      letterSpacing: '-0.03em',
                      color: '#0F172A',
                      fontFamily: 'var(--medx-font-display)'
                    }}>
                      MED<span style={{ color: '#6D28D9' }}>-X</span> CLINICAL
                    </div>
                    <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748B', margin: '0.25rem 0 0 0' }}>
                      Rx ID: {savedRx?.prescriptionNumber || savedRx?.prescriptionId || 'RX-MEDX-PENDING'}
                    </p>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', margin: '0.15rem 0 0 0' }}>
                      Date: {new Date(savedRx?.datePrescribed || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Patient Information Box */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.75rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 'var(--medx-radius-md)',
                  padding: '0.75rem 1rem',
                  fontSize: '0.8125rem',
                  marginBottom: '1.25rem'
                }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase' }}>Patient Name</span>
                    <strong style={{ color: '#0F172A' }}>{patient?.name || 'Patient'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase' }}>Age / Gender</span>
                    <strong style={{ color: '#0F172A' }}>{patient?.age || '—'} yrs / {patient?.gender || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase' }}>Patient ID</span>
                    <strong style={{ color: '#0F172A' }}>{patient?.patientId || patient?._id?.substring(0, 8) || 'P-001'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase' }}>Blood Group</span>
                    <strong style={{ color: '#6D28D9' }}>{patient?.bloodGroup || 'O+'}</strong>
                  </div>
                </div>

                {/* Diagnosis / Clinical Indication */}
                <div style={{
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #E9D5FF',
                  borderRadius: 'var(--medx-radius-md)',
                  padding: '0.625rem 0.875rem',
                  fontSize: '0.8125rem',
                  marginBottom: '1.25rem'
                }}>
                  <strong style={{ color: '#6D28D9', display: 'block', marginBottom: '0.15rem' }}>
                    Clinical Diagnosis & Indications:
                  </strong>
                  <span style={{ color: '#1E293B', fontWeight: 500 }}>
                    {savedRx?.diagnosis || diagnosis || 'Clinical Management'}
                  </span>
                </div>

                {/* Rx Glyph & Medication Table */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                    <span style={{
                      fontFamily: 'serif',
                      fontSize: '1.75rem',
                      fontWeight: 900,
                      fontStyle: 'italic',
                      color: '#6D28D9',
                      lineHeight: 1
                    }}>
                      ℞
                    </span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Prescribed Medicines & Posology
                    </span>
                  </div>

                  <div style={{ border: '1px solid #E2E8F0', borderRadius: 'var(--medx-radius-md)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                          <th style={{ padding: '0.625rem 0.75rem' }}>Medicine Name</th>
                          <th style={{ padding: '0.625rem 0.75rem' }}>Dosage</th>
                          <th style={{ padding: '0.625rem 0.75rem' }}>Frequency</th>
                          <th style={{ padding: '0.625rem 0.75rem' }}>Duration</th>
                          <th style={{ padding: '0.625rem 0.75rem' }}>Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(savedRx?.medicines || medicines).map((med, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '0.625rem 0.75rem', fontWeight: 700, color: '#0F172A' }}>
                              {med.name || '—'}
                            </td>
                            <td style={{ padding: '0.625rem 0.75rem', color: '#334155' }}>
                              {med.dosage}
                            </td>
                            <td style={{ padding: '0.625rem 0.75rem' }}>
                              <span style={{
                                backgroundColor: '#FAF5FF',
                                color: '#7E22CE',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}>
                                {med.frequency}
                              </span>
                            </td>
                            <td style={{ padding: '0.625rem 0.75rem', color: '#334155' }}>
                              {med.duration}
                            </td>
                            <td style={{ padding: '0.625rem 0.75rem', color: '#64748B' }}>
                              {med.instructions}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Additional Clinical Advice / Notes */}
                {(savedRx?.notes || notes) && (
                  <div style={{ marginBottom: '1.25rem', fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                      Clinical Advice & Instructions:
                    </span>
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 'var(--medx-radius-md)',
                      padding: '0.625rem 0.875rem',
                      fontStyle: 'italic',
                      color: '#334155'
                    }}>
                      "{savedRx?.notes || notes}"
                    </div>
                  </div>
                )}

                {/* Clinician Signature & Certification Block */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  borderTop: '1px solid #E2E8F0',
                  paddingTop: '1.25rem',
                  fontSize: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#6D28D9', fontWeight: 600 }}>
                    <CheckCircle2 size={16} />
                    <span>Med-X Authenticated Electronic Prescription (E-Rx)</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      width: '160px',
                      borderBottom: '1.5px solid #0F172A',
                      fontFamily: 'serif',
                      fontStyle: 'italic',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: '#0F172A',
                      paddingBottom: '0.25rem',
                      marginBottom: '0.25rem'
                    }}>
                      {savedRx?.doctorName || 'Dr. Attending Physician'}
                    </div>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>Attending Physician Signature</div>
                    <div style={{ color: '#94A3B8', fontSize: '0.6875rem' }}>MCI Verified Clinical License</div>
                  </div>
                </div>
              </div>

              {/* Slip Action Controls */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                {!savedRx && (
                  <button
                    type="button"
                    className="medx-btn medx-btn-secondary"
                    onClick={() => setPreviewSlip(false)}
                  >
                    Back to Edit
                  </button>
                )}
                <button
                  type="button"
                  className="medx-btn medx-btn-secondary"
                  onClick={() => window.print()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                >
                  <Printer size={16} /> Print Prescription Slip
                </button>
                {savedRx && (
                  <button
                    type="button"
                    className="medx-btn medx-btn-primary"
                    onClick={() => {
                      if (onSuccess) onSuccess();
                      onClose();
                    }}
                  >
                    Done & Return to Workstation
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Diagnosis Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.375rem' }}>
                  Clinical Diagnosis & Indications
                </label>
                <input
                  type="text"
                  className="medx-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Type 2 Diabetes Mellitus with Essential Hypertension"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                />
              </div>

              {/* Medicines Builder */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)' }}>
                    Prescribed Medicines & Posology
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--medx-teal)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Plus size={14} /> Add Medicine
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {medicines.map((med, index) => (
                    <div key={index} style={{
                      backgroundColor: '#F8FAFC',
                      padding: '0.875rem',
                      borderRadius: 'var(--medx-radius-md)',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                        <div>
                          <input
                            type="text"
                            className="medx-input"
                            style={{ width: '100%', fontSize: '0.8125rem', padding: '0.375rem 0.5rem' }}
                            placeholder="Medicine name (e.g. Metformin)"
                            value={med.name}
                            onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            className="medx-input"
                            style={{ width: '100%', fontSize: '0.8125rem', padding: '0.375rem 0.5rem' }}
                            placeholder="Dosage (500mg)"
                            value={med.dosage}
                            onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            className="medx-input"
                            style={{ width: '100%', fontSize: '0.8125rem', padding: '0.375rem 0.5rem' }}
                            placeholder="Freq (1-0-1)"
                            value={med.frequency}
                            onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            className="medx-input"
                            style={{ width: '100%', fontSize: '0.8125rem', padding: '0.375rem 0.5rem' }}
                            placeholder="Duration (30 days)"
                            value={med.duration}
                            onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(index)}
                          disabled={medicines.length === 1}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: medicines.length === 1 ? '#CBD5E1' : '#EF4444',
                            cursor: medicines.length === 1 ? 'not-allowed' : 'pointer',
                            padding: '0.375rem',
                            display: 'flex'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div>
                        <input
                          type="text"
                          className="medx-input"
                          style={{ width: '100%', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          placeholder="Special instructions (e.g. Take after meals, with a full glass of water)"
                          value={med.instructions}
                          onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice / Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-navy)', marginBottom: '0.375rem' }}>
                  General Clinical Advice & Dietary Precautions
                </label>
                <textarea
                  className="medx-input"
                  style={{ width: '100%', minHeight: '70px', resize: 'vertical' }}
                  placeholder="e.g. Low sodium diet, 30-min daily exercise, monitor fasting blood sugar twice weekly..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="medx-btn medx-btn-secondary"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="medx-btn medx-btn-secondary"
                  onClick={() => setPreviewSlip(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                >
                  <Printer size={16} /> Preview Rx Slip
                </button>
                <button
                  type="submit"
                  className="medx-btn medx-btn-primary"
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                >
                  <Pill size={16} /> {saving ? 'Authoring & Persisting...' : 'Authorize & Sign Prescription'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorPrescriptionModal;
