import {
  updatePatientSymptomsRelational,
  getRelationalPatientById,
  createRelationalMedicalRecord,
  getRelationalMedicalRecords
} from '../models/pgRelational.js';
import { Patient } from '../models/Patient.js';
import { MedicalReport } from '../models/MedicalReport.js';

/**
 * Submit patient symptoms and map to relational patients & medical_records tables
 */
export async function submitPatientSymptoms(req, res, next) {
  try {
    const { symptoms, medicalHistory, severity, duration } = req.body;
    const userId = req.user._id || req.user.id;

    if (!symptoms) {
      return res.status(400).json({
        error: {
          code: 'MISSING_SYMPTOMS',
          message: 'Symptom description is required.'
        }
      });
    }

    // 1. Update relational patients table
    let relationalPatient = await getRelationalPatientById(userId);
    const patientId = relationalPatient ? relationalPatient.id : 1;

    const updatedRelationalPatient = await updatePatientSymptomsRelational(
      patientId,
      symptoms,
      medicalHistory || ''
    );

    // 2. Create entry in relational medical_records table
    const medicalRecord = await createRelationalMedicalRecord({
      patient_id: patientId,
      doctor_id: null,
      report_type: 'Patient Symptom Intake',
      summary: `Patient submitted symptoms: ${symptoms} (Severity: ${severity || 'Moderate'}, Duration: ${duration || 'N/A'})`,
      symptoms,
      findings: `Medical History: ${medicalHistory || 'None noted'}`,
      prescription: '',
      lab_results: { severity: severity || 'Moderate', duration: duration || 'Recent' },
      status: 'submitted'
    });

    // 3. Sync to Mongoose model if Mongo is active
    try {
      let patientDoc = await Patient.findOne({ userId });
      if (patientDoc) {
        if (!patientDoc.medicalHistory) patientDoc.medicalHistory = {};
        patientDoc.medicalHistory.conditions = symptoms;
        await patientDoc.save();
      }
    } catch (mongoErr) {
      // Ignore Mongo error if operating purely on PostgreSQL pool
    }

    return res.status(201).json({
      message: 'Symptom submission recorded successfully in relational medical records.',
      patient: updatedRelationalPatient,
      record: medicalRecord
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get patient symptom history from relational medical_records
 */
export async function getPatientSymptomHistory(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const relationalPatient = await getRelationalPatientById(userId);
    const patientId = relationalPatient ? relationalPatient.id : 1;

    const records = await getRelationalMedicalRecords({ patient_id: patientId });

    return res.status(200).json({
      patientId,
      records
    });
  } catch (error) {
    next(error);
  }
}

export default {
  submitPatientSymptoms,
  getPatientSymptomHistory
};
