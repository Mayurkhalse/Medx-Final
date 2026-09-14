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
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {savedRx ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--medx-navy)', margin: '0 0 0.5rem 0' }}>
                Prescription Successfully Authored
              </h3>
              <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem', margin: '0 0 1.5rem 0' }}>
                Prescription Number: <strong>{savedRx.prescriptionNumber || savedRx.prescriptionId}</strong> has been saved to the unified database and synchronized with the patient dossier.
              </p>

              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 'var(--medx-radius-md)',
                padding: '1.25rem',
                textAlign: 'left',
                maxWidth: '500px',
                margin: '0 auto 1.5rem auto'
              }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)' }}>
                  <strong>Doctor:</strong> {savedRx.doctorName}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', marginTop: '0.25rem' }}>
                  <strong>Diagnosis:</strong> {savedRx.diagnosis}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--medx-text-secondary)', marginTop: '0.25rem' }}>
                  <strong>Items:</strong> {savedRx.medicines?.length} medications prescribed
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="medx-btn medx-btn-secondary"
                  onClick={() => window.print()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                >
                  <Printer size={16} /> Print Rx Slip
                </button>
                <button
                  type="button"
                  className="medx-btn medx-btn-primary"
                  onClick={onClose}
                >
                  Done
                </button>
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
