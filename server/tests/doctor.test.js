import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';

import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Doctor } from '../src/models/Doctor.js';
import { Patient } from '../src/models/Patient.js';
import { Hospital } from '../src/models/Hospital.js';
import { Lab } from '../src/models/Lab.js';
import { MedicalReport } from '../src/models/MedicalReport.js';
import { Prescription } from '../src/models/Prescription.js';

const TEST_DB_URI = 'mongodb://localhost:27017/medx_unified_test';

describe('Med-X Phase 1F — Doctor Workstation, Triage, Report Review & Prescription Suite', () => {
  let doctorAToken = '';
  let doctorAUser = null;
  let doctorAProfile = null;

  let doctorBToken = '';
  let doctorBUser = null;
  let doctorBProfile = null;

  let patientToken = '';
  let patientUser = null;
  let patientProfile = null;

  let hospitalAdminToken = '';

  let createdPatientId = '';
  let createdReportId = '';

  before(async () => {
    await connectDB({ uri: TEST_DB_URI, throwOnly: true });

    assert.equal(
      mongoose.connection.name,
      'medx_unified_test',
      'CRITICAL SAFETY ASSERTION: Integration tests must strictly run against medx_unified_test'
    );

    // Clean up test collections in test database
    await Prescription.deleteMany({});
    await MedicalReport.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Hospital.deleteMany({});
    await Lab.deleteMany({});
    await User.deleteMany({
      email: {
        $in: [
          'doc.stephen@medx.test',
          'doc.claire@medx.test',
          'patient.sarah@medx.test',
          'admin.cuddy@medx.test',
          'logan.wolverine@medx.test'
        ]
      }
    });

    // 1. Register Doctor A
    const regDocA = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dr. Stephen Strange',
        email: 'doc.stephen@medx.test',
        password: 'Password123!',
        role: 'doctor',
        specialty: 'Neurosurgery & Diagnostic Medicine'
      });
    assert.equal(regDocA.status, 201);
    doctorAToken = regDocA.body.token;
    doctorAUser = regDocA.body.user;
    doctorAProfile = regDocA.body.profile;

    // 2. Register Doctor B
    const regDocB = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dr. Claire Temple',
        email: 'doc.claire@medx.test',
        password: 'Password123!',
        role: 'doctor',
        specialty: 'Emergency Medicine'
      });
    assert.equal(regDocB.status, 201);
    doctorBToken = regDocB.body.token;
    doctorBUser = regDocB.body.user;
    doctorBProfile = regDocB.body.profile;

    // 3. Register Patient
    const regPatient = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Sarah Connor',
        email: 'patient.sarah@medx.test',
        password: 'Password123!',
        role: 'patient'
      });
    assert.equal(regPatient.status, 201);
    patientToken = regPatient.body.token;
    patientUser = regPatient.body.user;
    patientProfile = regPatient.body.profile;

    // 4. Register Hospital Admin
    const regHospital = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dr. Lisa Cuddy',
        email: 'admin.cuddy@medx.test',
        password: 'Password123!',
        role: 'hospital_admin'
      });
    assert.equal(regHospital.status, 201);
    hospitalAdminToken = regHospital.body.token;
  });

  after(async () => {
    await disconnectDB();
  });

  // 1. Doctor Registration & JWT role claim
  it('1. Doctor registration creates linked profile with canonical doctor role', async () => {
    assert.equal(doctorAUser.role, 'doctor');
    assert.ok(doctorAProfile.legacyId.startsWith('DOC-'));
    assert.equal(doctorAProfile.specialty, 'Neurosurgery & Diagnostic Medicine');
  });

  // 2. RBAC: Doctor workspace root access
  it('2. Authenticated doctor can access /api/doctor workspace root', async () => {
    const res = await request(app)
      .get('/api/doctor')
      .set('Authorization', `Bearer ${doctorAToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Med-X Unified Doctor Workspace API');
    assert.equal(res.body.user.role, 'doctor');
  });

  // 3. RBAC: Patient cannot access doctor endpoints
  it('3. Patient cannot access doctor-only endpoints (RBAC rejection 403)', async () => {
    const res = await request(app)
      .get('/api/doctor/patients')
      .set('Authorization', `Bearer ${patientToken}`);
    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  // 4. RBAC: Hospital Admin cannot access doctor-only clinical endpoints
  it('4. Hospital Admin cannot access doctor-only endpoints (RBAC rejection 403)', async () => {
    const res = await request(app)
      .get('/api/doctor/patients')
      .set('Authorization', `Bearer ${hospitalAdminToken}`);
    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  // 5. Auth: Unauthenticated request returns 401
  it('5. Unauthenticated request to /api/doctor returns 401 UNAUTHORIZED', async () => {
    const res = await request(app).get('/api/doctor/profile');
    assert.equal(res.status, 401);
  });

  // 6. Doctor profile retrieval and update
  it('6. Doctor can retrieve and update profile via /api/doctor/profile', async () => {
    const resGet = await request(app)
      .get('/api/doctor/profile')
      .set('Authorization', `Bearer ${doctorAToken}`);
    assert.equal(resGet.status, 200);
    assert.equal(resGet.body.name, 'Dr. Stephen Strange');
    assert.equal(resGet.body.specialty, 'Neurosurgery & Diagnostic Medicine');

    const resUpdate = await request(app)
      .put('/api/doctor/profile')
      .set('Authorization', `Bearer ${doctorAToken}`)
      .send({
        qualification: 'MD, PhD, FACS',
        department: 'Advanced Neuro-Diagnostics'
      });
    assert.equal(resUpdate.status, 200);
    assert.equal(resUpdate.body.qualification, 'MD, PhD, FACS');
    assert.equal(resUpdate.body.department, 'Advanced Neuro-Diagnostics');
  });

  // 7. Doctor patient enrollment & roster assignment
  it('7. Doctor can enroll new patient with vitals and assigned primaryDoctorId', async () => {
    const res = await request(app)
      .post('/api/doctor/patients')
      .set('Authorization', `Bearer ${doctorAToken}`)
      .send({
        name: 'James Logan',
        email: 'logan.wolverine@medx.test',
        gender: 'Male',
        dateOfBirth: '1982-05-15',
        bloodGroup: 'O+',
        phone: '+91 98877 66554',
        currentCondition: 'Severe Acute Hyperglycemia and Fatigue',
        vitalSigns: {
          bloodPressure: '145/95 mmHg',
          heartRate: '92 bpm',
          temperature: '98.6 °F',
          spo2: '97%'
        }
      });
    assert.equal(res.status, 201);
    assert.ok(res.body.patientId);
    assert.equal(res.body.name, 'James Logan');
    assert.equal(res.body.vitalSigns.bloodPressure, '145/95 mmHg');

    createdPatientId = res.body._id;

    // Verify patient is listed in Doctor A's patient roster
    const resList = await request(app)
      .get('/api/doctor/patients')
      .set('Authorization', `Bearer ${doctorAToken}`);
    assert.equal(resList.status, 200);
    assert.ok(Array.isArray(resList.body));
    const found = resList.body.find(p => p._id === createdPatientId);
    assert.ok(found, 'Created patient should be in doctor roster');
    assert.equal(found.primaryDoctorName, 'Dr. Stephen Strange');
  });

  // 8. Doctor can view patient dossier
  it('8. Doctor can view full patient clinical dossier', async () => {
    const res = await request(app)
      .get(`/api/doctor/patients/${createdPatientId}`)
      .set('Authorization', `Bearer ${doctorAToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.name, 'James Logan');
    assert.equal(res.body.currentCondition, 'Severe Acute Hyperglycemia and Fatigue');
    assert.ok(res.body.vitalSigns);
  });

  // 9. IDOR protection: Unassigned doctor cannot access patient without clinical relationship
  it('9. Security: Doctor B cannot access Doctor A’s private patient (IDOR protection)', async () => {
    const res = await request(app)
      .get(`/api/doctor/patients/${createdPatientId}`)
      .set('Authorization', `Bearer ${doctorBToken}`);
    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'PATIENT_ACCESS_FORBIDDEN');
  });

  // 10. MedicalReport integration: Patient report visibility for Doctor
  it('10. Doctor can view patient canonical MedicalReport', async () => {
    // Find patient record created
    const patientDoc = await Patient.findById(createdPatientId);

    // Create a canonical MedicalReport for this patient
    const report = await MedicalReport.create({
      patientId: patientDoc._id,
      userId: patientDoc.userId,
      reportName: 'Comprehensive Metabolic Panel',
      reportType: 'Blood Test',
      sourceType: 'manual',
      parameters: new Map([
        ['glucose', { value: 215, unit: 'mg/dL', ref_range: '70-99', status: 'High' }],
        ['hba1c', { value: 9.4, unit: '%', ref_range: '<5.7', status: 'High' }]
      ]),
      mlResult: {
        riskTier: 'High',
        overallRiskScore: 92,
        diseaseRisks: new Map([['diabetes', 94]]),
        flags: new Map([['glucose', 'High'], ['hba1c', 'High']])
      },
      reviewStatus: 'Pending Review'
    });
    createdReportId = report._id.toString();

    // Doctor A retrieves reports
    const resReports = await request(app)
      .get('/api/doctor/reports')
      .set('Authorization', `Bearer ${doctorAToken}`);
    assert.equal(resReports.status, 200);
    assert.ok(Array.isArray(resReports.body));
    const foundReport = resReports.body.find(r => r._id === createdReportId);
    assert.ok(foundReport, 'Report should be in doctor reports list');
    assert.equal(foundReport.reviewStatus, 'Pending Review');
  });

  // 11. Report Review: Doctor reviews report, persists review status & notes, preserves raw biomarkers
  it('11. Doctor can review MedicalReport, updating reviewStatus and preserving biomarkers', async () => {
    const resReview = await request(app)
      .put(`/api/doctor/reports/${createdReportId}/review`)
      .set('Authorization', `Bearer ${doctorAToken}`)
      .send({
        reviewStatus: 'Reviewed',
        reviewNotes: 'Clinical assessment: Severe Type 2 Diabetes with poor glycemic control. Immediate Metformin and lifestyle modification required.'
      });

    assert.equal(resReview.status, 200);
    assert.equal(resReview.body.reviewStatus, 'Reviewed');
    assert.ok(resReview.body.reviewedByDoctorId);
    assert.equal(resReview.body.reviewedByDoctorName, 'Dr. Stephen Strange');
    assert.ok(resReview.body.reviewedAt);

    // Verify raw biomarker parameters remain completely intact in MongoDB
    const updatedDbReport = await MedicalReport.findById(createdReportId);
    assert.equal(updatedDbReport.reviewStatus, 'Reviewed');
    assert.equal(updatedDbReport.parameters.get('glucose').value, 215);
    assert.equal(updatedDbReport.parameters.get('glucose').status, 'High');
    assert.equal(updatedDbReport.parameters.get('hba1c').value, 9.4);
    assert.equal(updatedDbReport.mlResult.riskTier, 'High');
    assert.equal(updatedDbReport.reviewNotes, 'Clinical assessment: Severe Type 2 Diabetes with poor glycemic control. Immediate Metformin and lifestyle modification required.');
  });

  // 12. Digital Prescription: Author and persist prescription
  it('12. Doctor can author and persist digital prescription for patient', async () => {
    const resRx = await request(app)
      .post(`/api/doctor/patients/${createdPatientId}/prescriptions`)
      .set('Authorization', `Bearer ${doctorAToken}`)
      .send({
        diagnosis: 'Type 2 Diabetes Mellitus with Essential Hypertension',
        medicines: [
          {
            name: 'Metformin Hydrochloride',
            dosage: '500 mg',
            frequency: 'Twice daily',
            duration: '30 days',
            instructions: 'Take with or immediately after meals'
          },
          {
            name: 'Telmisartan',
            dosage: '40 mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take in the morning'
          }
        ],
        advice: 'Low glycemic index diet, 30 min daily brisk walking, monitor fasting blood sugar twice a week.'
      });

    assert.equal(resRx.status, 201);
    assert.ok(resRx.body.prescriptionNumber.startsWith('RX-'));
    assert.equal(resRx.body.medicines.length, 2);
    assert.equal(resRx.body.doctorName, 'Dr. Stephen Strange');

    // Verify persisted in standalone Prescription collection
    const rxDb = await Prescription.findOne({ prescriptionNumber: resRx.body.prescriptionNumber });
    assert.ok(rxDb);
    assert.equal(rxDb.patientId.toString(), createdPatientId);

    // Verify synced into Patient document prescriptions array
    const patientDb = await Patient.findById(createdPatientId);
    assert.ok(patientDb.prescriptions.length > 0);
    assert.equal(patientDb.prescriptions[0].prescriptionNumber, resRx.body.prescriptionNumber);
  });

  // 13. Clinical Notes and Follow-up Planning
  it('13. Doctor can add clinical notes and follow-up planning to patient record', async () => {
    const resNote = await request(app)
      .post(`/api/doctor/patients/${createdPatientId}/notes`)
      .set('Authorization', `Bearer ${doctorAToken}`)
      .send({
        note: 'Patient advised on HbA1c target < 7.0%. Family history of premature coronary artery disease.'
      });
    assert.equal(resNote.status, 200);
    assert.ok(resNote.body.clinicalNotes.length > 0);

    const resFollowup = await request(app)
      .post(`/api/doctor/patients/${createdPatientId}/followups`)
      .set('Authorization', `Bearer ${doctorAToken}`)
      .send({
        date: '2026-10-15',
        purpose: 'Review glycemic response to Metformin and blood pressure control',
        instructions: 'Bring 14-day fasting blood glucose log.'
      });
    assert.equal(resFollowup.status, 200);
    assert.equal(resFollowup.body.followupPlan.purpose, 'Review glycemic response to Metformin and blood pressure control');
  });

  // 14. Doctor Outpatient Consultation Queue
  it('14. Doctor can retrieve outpatient triage and consultation queue', async () => {
    const resQueue = await request(app)
      .get('/api/doctor/queue')
      .set('Authorization', `Bearer ${doctorAToken}`);
    assert.equal(resQueue.status, 200);
    assert.ok(Array.isArray(resQueue.body));
    const queuedPatient = resQueue.body.find(q => q.patientName === 'James Logan');
    assert.ok(queuedPatient);
    assert.ok(queuedPatient.tokenNumber);
    assert.equal(queuedPatient.priority, 'Routine');
  });
});
