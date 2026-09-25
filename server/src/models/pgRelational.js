import { query } from '../config/pgPool.js';

// In-Memory Fallback Caches for relational tables when DB server is offline/initializing
const inMemoryTables = {
  users: [],
  doctors: [
    {
      id: 1,
      user_id: 2,
      name: 'Dr. Sarah Jenkins',
      email: 'doctor@medx.org',
      phone: '+1-555-0192',
      specialty: 'Cardiology',
      department: 'Outpatient Triage',
      hospital_name: 'Med-X Central Hospital',
      availability_status: 'Available',
      working_hours: '08:00 AM - 04:00 PM',
      license_number: 'MD-994812'
    }
  ],
  patients: [
    {
      id: 1,
      user_id: 1,
      name: 'John Doe',
      email: 'patient@medx.org',
      phone: '+1-555-0100',
      date_of_birth: '1985-06-15',
      gender: 'Male',
      blood_group: 'O+',
      age: 40,
      address: '123 Health Ave, Metro City',
      emergency_contact: '+1-555-0199',
      symptoms: 'Chest tightness, mild fatigue',
      medical_history: 'Hypertension',
      risk_tier: 'MODERATE',
      clinical_risk_score: 45
    }
  ],
  clinics: [
    {
      id: 1,
      name: 'Med-X Primary Clinic',
      address: '100 Medical Center Blvd',
      phone: '+1-555-0000',
      department: 'Outpatient Triage',
      total_beds: 50,
      available_beds: 24,
      icu_beds: 10,
      icu_available: 4
    }
  ],
  appointments: [
    {
      id: 1,
      patient_id: 1,
      doctor_id: 1,
      clinic_id: 1,
      appointment_date: new Date().toISOString().split('T')[0],
      time_slot: '10:30 AM',
      status: 'scheduled',
      type: 'consultation',
      triage_stage: 'CONSULTATION',
      symptoms: 'Chest tightness, mild fatigue',
      notes: 'Initial outpatient screening scheduled'
    }
  ],
  medical_records: [
    {
      id: 1,
      patient_id: 1,
      doctor_id: 1,
      report_type: 'Diagnostic Biomarker Assessment',
      summary: 'Biomarker levels evaluated. Mild glucose elevation noted.',
      symptoms: 'Chest tightness, mild fatigue',
      findings: 'Fasting Glucose 108 mg/dL, Hb 14.2 g/dL',
      prescription: 'Amoxicillin 500mg - 1 tab twice daily for 7 days',
      lab_results: { fastingGlucose: 108, hemoglobin: 14.2 },
      status: 'finalized'
    }
  ]
};

// ----------------------------------------------------
// PATIENTS RELATIONAL DAO
// ----------------------------------------------------
export async function getRelationalPatients() {
  try {
    const res = await query('SELECT * FROM patients ORDER BY id DESC');
    return res.rows;
  } catch (err) {
    return inMemoryTables.patients;
  }
}

export async function getRelationalPatientById(id) {
  try {
    const res = await query('SELECT * FROM patients WHERE id = $1 OR user_id = $1', [id]);
    return res.rows[0] || null;
  } catch (err) {
    return inMemoryTables.patients.find(p => p.id == id || p.user_id == id) || null;
  }
}

export async function updatePatientSymptomsRelational(patientId, symptoms, medicalHistory = '') {
  try {
    const res = await query(
      `UPDATE patients 
       SET symptoms = $1, medical_history = COALESCE(NULLIF($2, ''), medical_history) 
       WHERE id = $3 RETURNING *`,
      [symptoms, medicalHistory, patientId]
    );
    return res.rows[0];
  } catch (err) {
    const patient = inMemoryTables.patients.find(p => p.id == patientId);
    if (patient) {
      patient.symptoms = symptoms;
      if (medicalHistory) patient.medical_history = medicalHistory;
    }
    return patient;
  }
}

// ----------------------------------------------------
// DOCTORS RELATIONAL DAO
// ----------------------------------------------------
export async function getRelationalDoctors() {
  try {
    const res = await query('SELECT * FROM doctors ORDER BY id ASC');
    return res.rows;
  } catch (err) {
    return inMemoryTables.doctors;
  }
}

export async function getRelationalDoctorById(id) {
  try {
    const res = await query('SELECT * FROM doctors WHERE id = $1 OR user_id = $1', [id]);
    return res.rows[0] || null;
  } catch (err) {
    return inMemoryTables.doctors.find(d => d.id == id || d.user_id == id) || null;
  }
}

export async function updateDoctorAvailabilityRelational(doctorId, status, workingHours) {
  try {
    const res = await query(
      `UPDATE doctors 
       SET availability_status = COALESCE($1, availability_status), 
           working_hours = COALESCE($2, working_hours) 
       WHERE id = $3 RETURNING *`,
      [status, workingHours, doctorId]
    );
    return res.rows[0];
  } catch (err) {
    const doc = inMemoryTables.doctors.find(d => d.id == doctorId);
    if (doc) {
      if (status) doc.availability_status = status;
      if (workingHours) doc.working_hours = workingHours;
    }
    return doc;
  }
}

// ----------------------------------------------------
// CLINICS RELATIONAL DAO
// ----------------------------------------------------
export async function getRelationalClinics() {
  try {
    const res = await query('SELECT * FROM clinics ORDER BY id ASC');
    return res.rows;
  } catch (err) {
    return inMemoryTables.clinics;
  }
}

export async function updateClinicBedsRelational(clinicId, availableBeds, icuAvailable) {
  try {
    const res = await query(
      `UPDATE clinics 
       SET available_beds = COALESCE($1, available_beds), 
           icu_available = COALESCE($2, icu_available) 
       WHERE id = $3 RETURNING *`,
      [availableBeds, icuAvailable, clinicId]
    );
    return res.rows[0];
  } catch (err) {
    const clinic = inMemoryTables.clinics.find(c => c.id == clinicId);
    if (clinic) {
      if (availableBeds !== undefined) clinic.available_beds = availableBeds;
      if (icuAvailable !== undefined) clinic.icu_available = icuAvailable;
    }
    return clinic;
  }
}

// ----------------------------------------------------
// APPOINTMENTS RELATIONAL DAO
// ----------------------------------------------------
export async function getRelationalAppointments(filter = {}) {
  try {
    let sql = 'SELECT * FROM appointments WHERE 1=1';
    const params = [];
    if (filter.doctor_id) {
      params.push(filter.doctor_id);
      sql += ` AND doctor_id = $${params.length}`;
    }
    if (filter.patient_id) {
      params.push(filter.patient_id);
      sql += ` AND patient_id = $${params.length}`;
    }
    if (filter.status) {
      params.push(filter.status);
      sql += ` AND status = $${params.length}`;
    }
    sql += ' ORDER BY created_at DESC';
    const res = await query(sql, params);
    return res.rows;
  } catch (err) {
    return inMemoryTables.appointments.filter(a => {
      if (filter.doctor_id && a.doctor_id != filter.doctor_id) return false;
      if (filter.patient_id && a.patient_id != filter.patient_id) return false;
      if (filter.status && a.status != filter.status) return false;
      return true;
    });
  }
}

export async function createRelationalAppointment(appointmentData) {
  const { patient_id, doctor_id, clinic_id, appointment_date, time_slot, type, triage_stage, symptoms, notes } = appointmentData;
  try {
    const res = await query(
      `INSERT INTO appointments (patient_id, doctor_id, clinic_id, appointment_date, time_slot, type, triage_stage, symptoms, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [patient_id, doctor_id, clinic_id, appointment_date || new Date().toISOString().split('T')[0], time_slot || '10:00 AM', type || 'consultation', triage_stage || 'TRIAGE', symptoms || '', notes || '']
    );
    return res.rows[0];
  } catch (err) {
    const newAppt = {
      id: inMemoryTables.appointments.length + 1,
      patient_id,
      doctor_id,
      clinic_id,
      appointment_date: appointment_date || new Date().toISOString().split('T')[0],
      time_slot: time_slot || '10:00 AM',
      status: 'scheduled',
      type: type || 'consultation',
      triage_stage: triage_stage || 'TRIAGE',
      symptoms: symptoms || '',
      notes: notes || '',
      created_at: new Date().toISOString()
    };
    inMemoryTables.appointments.push(newAppt);
    return newAppt;
  }
}

export async function updateAppointmentTriageRelational(appointmentId, triageStage, status, notes) {
  try {
    const res = await query(
      `UPDATE appointments 
       SET triage_stage = COALESCE($1, triage_stage), 
           status = COALESCE($2, status), 
           notes = COALESCE($3, notes) 
       WHERE id = $4 RETURNING *`,
      [triageStage, status, notes, appointmentId]
    );
    return res.rows[0];
  } catch (err) {
    const appt = inMemoryTables.appointments.find(a => a.id == appointmentId);
    if (appt) {
      if (triageStage) appt.triage_stage = triageStage;
      if (status) appt.status = status;
      if (notes) appt.notes = notes;
    }
    return appt;
  }
}

// ----------------------------------------------------
// MEDICAL RECORDS RELATIONAL DAO
// ----------------------------------------------------
export async function getRelationalMedicalRecords(filter = {}) {
  try {
    let sql = 'SELECT * FROM medical_records WHERE 1=1';
    const params = [];
    if (filter.patient_id) {
      params.push(filter.patient_id);
      sql += ` AND patient_id = $${params.length}`;
    }
    if (filter.doctor_id) {
      params.push(filter.doctor_id);
      sql += ` AND doctor_id = $${params.length}`;
    }
    sql += ' ORDER BY created_at DESC';
    const res = await query(sql, params);
    return res.rows;
  } catch (err) {
    return inMemoryTables.medical_records;
  }
}

export async function createRelationalMedicalRecord(recordData) {
  const { patient_id, doctor_id, report_type, summary, symptoms, findings, prescription, lab_results, status } = recordData;
  try {
    const res = await query(
      `INSERT INTO medical_records (patient_id, doctor_id, report_type, summary, symptoms, findings, prescription, lab_results, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [patient_id, doctor_id, report_type || 'General Assessment', summary || '', symptoms || '', findings || '', prescription || '', JSON.stringify(lab_results || {}), status || 'finalized']
    );
    return res.rows[0];
  } catch (err) {
    const newRecord = {
      id: inMemoryTables.medical_records.length + 1,
      patient_id,
      doctor_id,
      report_type: report_type || 'General Assessment',
      summary: summary || '',
      symptoms: symptoms || '',
      findings: findings || '',
      prescription: prescription || '',
      lab_results: lab_results || {},
      status: status || 'finalized',
      created_at: new Date().toISOString()
    };
    inMemoryTables.medical_records.push(newRecord);
    return newRecord;
  }
}

export default {
  getRelationalPatients,
  getRelationalPatientById,
  updatePatientSymptomsRelational,
  getRelationalDoctors,
  getRelationalDoctorById,
  updateDoctorAvailabilityRelational,
  getRelationalClinics,
  updateClinicBedsRelational,
  getRelationalAppointments,
  createRelationalAppointment,
  updateAppointmentTriageRelational,
  getRelationalMedicalRecords,
  createRelationalMedicalRecord
};
