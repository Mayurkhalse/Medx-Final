import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import config from '../src/config/config.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import {
  User, Patient, Doctor, Hospital, Lab,
  MedicalReport, Bed, CareTask, EmergencyAlert, Appointment
} from '../src/models/index.js';

describe('Med-X Phase 1J — Cross-Role Release Verification & End-to-End Test Suite', () => {
  let patientAUser, patientAToken, patientAProfile;
  let patientBUser, patientBToken, patientBProfile;
  let doctorUser, doctorToken, doctorProfile;
  let hospitalAUser, hospitalAToken, hospitalAProfile;
  let hospitalBUser, hospitalBToken, hospitalBProfile;
  let labUser, labToken, labProfile;

  const testEmails = [
    'patA.1j@medx.test',
    'patB.1j@medx.test',
    'doc.1j@medx.test',
    'hospA.1j@medx.test',
    'hospB.1j@medx.test',
    'lab.1j@medx.test'
  ];

  const cleanup = async () => {
    await EmergencyAlert.deleteMany({});
    await Appointment.deleteMany({});
    await Bed.deleteMany({});
    await CareTask.deleteMany({});
    const users = await User.find({ email: { $in: testEmails } });
    const userIds = users.map(u => u._id);
    await Patient.deleteMany({ userId: { $in: userIds } });
    await Doctor.deleteMany({ userId: { $in: userIds } });
    await Hospital.deleteMany({ userId: { $in: userIds } });
    await Lab.deleteMany({ userId: { $in: userIds } });
    await MedicalReport.deleteMany({ userId: { $in: userIds } });
    await User.deleteMany({ _id: { $in: userIds } });
  };

  const TEST_DB_URI = 'mongodb://localhost:27017/medx_unified_test';

  before(async () => {
    await connectDB({ uri: TEST_DB_URI, throwOnly: true });
    await cleanup();

    // 1. Register Hospital A
    const resHospA = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Metro City Hospital A',
        email: 'hospA.1j@medx.test',
        password: 'Password123!',
        role: 'hospital_admin',
        facilityName: 'Metro City General Hospital A'
      });
    hospitalAUser = resHospA.body.user;
    hospitalAToken = resHospA.body.token;
    hospitalAProfile = resHospA.body.profile;

    // 2. Register Hospital B (for tenant isolation)
    const resHospB = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Apex Trauma Center B',
        email: 'hospB.1j@medx.test',
        password: 'Password123!',
        role: 'hospital_admin',
        facilityName: 'Apex Trauma Center B'
      });
    hospitalBUser = resHospB.body.user;
    hospitalBToken = resHospB.body.token;
    hospitalBProfile = resHospB.body.profile;

    // 3. Register Doctor
    const resDoc = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dr. Sarah Smith',
        email: 'doc.1j@medx.test',
        password: 'Password123!',
        role: 'doctor',
        specialty: 'Internal Medicine'
      });
    doctorUser = resDoc.body.user;
    doctorToken = resDoc.body.token;
    doctorProfile = resDoc.body.profile;

    // 4. Register Patient A (affiliated with Hospital A and Doctor)
    const resPatA = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Johnson',
        email: 'patA.1j@medx.test',
        password: 'Password123!',
        role: 'patient',
        phone: '+91 98111 22334'
      });
    patientAUser = resPatA.body.user;
    patientAToken = resPatA.body.token;
    patientAProfile = resPatA.body.profile;

    // Link Patient A to Hospital A and primary doctor
    await Patient.findByIdAndUpdate(patientAProfile._id, {
      hospitalId: hospitalAProfile._id,
      primaryDoctorId: doctorProfile._id,
      bloodGroup: 'O+',
      gender: 'Female',
      dateOfBirth: new Date('1990-05-15')
    });

    // 5. Register Patient B (for IDOR isolation)
    const resPatB = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob Williams',
        email: 'patB.1j@medx.test',
        password: 'Password123!',
        role: 'patient',
        phone: '+91 98222 33445'
      });
    patientBUser = resPatB.body.user;
    patientBToken = resPatB.body.token;
    patientBProfile = resPatB.body.profile;

    // 6. Register Lab Admin
    const resLab = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Metro Clinical Labs',
        email: 'lab.1j@medx.test',
        password: 'Password123!',
        role: 'lab_admin',
        labName: 'Metro Diagnostic Center'
      });
    labUser = resLab.body.user;
    labToken = resLab.body.token;
    labProfile = resLab.body.profile;
  });

  after(async () => {
    await cleanup();
    await disconnectDB();
  });

  // =========================================================================
  // TEST A: PATIENT -> DOCTOR WORKFLOW
  // =========================================================================
  describe('TEST A: Patient -> Doctor Lifecycle & Review Verification', () => {
    let patientReportId = null;

    it('A1. Authenticated Patient creates a MedicalReport with biomarkers', async () => {
      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${patientAToken}`)
        .send({
          reportName: 'Annual Routine Bloodwork',
          reportType: 'Complete Blood Count (CBC)',
          sourceType: 'manual',
          parameters: {
            glucose_fasting: { value: 110, unit: 'mg/dL', ref_range: '70-100' },
            hemoglobin: { value: 13.8, unit: 'g/dL', ref_range: '12-16' },
            platelets: { value: 240000, unit: '/mcL', ref_range: '150000-450000' }
          }
        });

      assert.equal(res.status, 201);
      assert.ok(res.body._id);
      patientReportId = res.body._id;

      // Verify MongoDB persistence
      const saved = await MedicalReport.findById(patientReportId);
      assert.ok(saved);
      assert.equal(saved.userId.toString(), patientAUser.id);
      assert.equal(saved.reviewStatus, 'Pending Review');
    });

    it('A2. Doctor can access the Patient report for clinical evaluation', async () => {
      const res = await request(app)
        .get(`/api/doctor/reports/${patientReportId}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body._id.toString(), patientReportId.toString());
      assert.equal(res.body.reviewStatus, 'Pending Review');
      assert.ok(res.body.parameters);
    });

    it('A3. Doctor reviews the report and persists clinical findings', async () => {
      const res = await request(app)
        .put(`/api/doctor/reports/${patientReportId}/review`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          reviewStatus: 'Reviewed',
          reviewNotes: 'Blood parameters stable. Slight fasting glucose elevation; recommended dietary modifications.'
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.reviewStatus, 'Reviewed');
      assert.equal(res.body.reviewedByDoctorId.toString(), doctorProfile._id.toString());
      assert.ok(res.body.reviewNotes.includes('dietary modifications'));
      assert.ok(res.body.reviewedAt);

      // Verify real MongoDB persistence
      const updated = await MedicalReport.findById(patientReportId);
      assert.equal(updated.reviewStatus, 'Reviewed');
      assert.equal(updated.reviewedByDoctorId.toString(), doctorProfile._id.toString());
      assert.ok(updated.reviewNotes.includes('dietary modifications'));
    });

    it('A4. Doctor prescribes medication for the patient', async () => {
      const res = await request(app)
        .post(`/api/doctor/patients/${patientAProfile._id}/prescriptions`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          diagnosis: 'Borderline Impaired Fasting Glucose',
          medicines: [
            { name: 'Metformin', dosage: '500mg', frequency: '0-0-1', duration: '30 Days', instructions: 'Take with dinner' }
          ],
          notes: '30-minute daily walking encouraged'
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.diagnosis, 'Borderline Impaired Fasting Glucose');
      assert.equal(res.body.doctorId.toString(), doctorProfile._id.toString());
    });

    it('A5. Patient can see the persisted review state and physician notes in workspace', async () => {
      const res = await request(app)
        .get(`/api/reports/${patientReportId}`)
        .set('Authorization', `Bearer ${patientAToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.reviewStatus, 'Reviewed');
      assert.ok(res.body.reviewNotes.includes('dietary modifications'));
      assert.ok(res.body.reviewedAt);
    });
  });

  // =========================================================================
  // TEST B: LAB -> PATIENT -> DOCTOR WORKFLOW
  // =========================================================================
  describe('TEST B: Lab -> Patient -> Doctor Diagnostic Flow', () => {
    let labReportId = null;

    it('B1. Authenticated Lab Admin creates diagnostic report for Patient A', async () => {
      const res = await request(app)
        .post('/api/lab/reports')
        .set('Authorization', `Bearer ${labToken}`)
        .send({
          patientId: patientAProfile._id,
          reportName: 'Comprehensive Metabolic Panel',
          reportType: 'Metabolic & Renal Profile',
          hospitalId: hospitalAProfile._id,
          status: 'Draft',
          parameters: {
            creatinine: { value: 1.1, unit: 'mg/dL', ref_range: '0.7-1.3' },
            blood_urea_nitrogen: { value: 18, unit: 'mg/dL', ref_range: '7-20' },
            wbc_count: { value: 7200, unit: '/mcL', ref_range: '4500-11000' }
          },
          notes: 'Sample verified and analyzed'
        });

      assert.equal(res.status, 201);
      assert.ok(res.body.report);
      assert.equal(res.body.report.status, 'Draft');
      assert.equal(res.body.report.sourceType, 'lab_direct');
      labReportId = res.body.report._id;
    });

    it('B2. Lab Admin finalizes the diagnostic report with official sign-off', async () => {
      const res = await request(app)
        .post(`/api/lab/reports/${labReportId}/finalize`)
        .set('Authorization', `Bearer ${labToken}`);

      assert.equal(res.status, 200);
      assert.ok(res.body.report);
      assert.equal(res.body.report.status, 'Finalized');
      assert.ok(res.body.report.finalizedAt);
      assert.equal(res.body.report.finalizedBy.toString(), labUser.id);
    });

    it('B3. Patient A can view the finalized Lab report in Patient Workspace', async () => {
      const res = await request(app)
        .get(`/api/reports/${labReportId}`)
        .set('Authorization', `Bearer ${patientAToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'Finalized');
      assert.equal(res.body.sourceType, 'lab_direct');
      assert.equal(res.body.reviewStatus, 'Pending Review');
    });

    it('B4. Attending Doctor views the Lab report and conducts clinical review', async () => {
      const res = await request(app)
        .get(`/api/doctor/reports/${labReportId}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'Finalized');

      // Doctor conducts physician review
      const reviewRes = await request(app)
        .put(`/api/doctor/reports/${labReportId}/review`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          reviewStatus: 'Reviewed',
          reviewNotes: 'Renal function tests within normal physiological parameters.'
        });

      assert.equal(reviewRes.status, 200);
      assert.equal(reviewRes.body.report.status, 'Finalized'); // Lab status remains Finalized
      assert.equal(reviewRes.body.reviewStatus, 'Reviewed'); // Clinical status is Reviewed
      assert.ok(reviewRes.body.reviewNotes.includes('normal physiological parameters'));
    });
  });

  // =========================================================================
  // TEST C: PATIENT -> HOSPITAL WORKFLOW
  // =========================================================================
  describe('TEST C: Patient -> Hospital Relationship & Care Operations', () => {
    let createdBedId = null;

    it('C1. Hospital Admin retrieves patient directory and confirms Patient A visibility', async () => {
      const res = await request(app)
        .get('/api/hospital/patients')
        .set('Authorization', `Bearer ${hospitalAToken}`);

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.patients));
      const found = res.body.patients.find(p => p._id.toString() === patientAProfile._id.toString());
      assert.ok(found, 'Patient A should be present in Hospital A patient directory');
    });

    it('C2. Hospital Admin configures bed and assigns admitted patient', async () => {
      // Create bed
      const bedRes = await request(app)
        .post('/api/hospital/beds')
        .set('Authorization', `Bearer ${hospitalAToken}`)
        .send({
          bedNumber: '101-A',
          ward: 'Internal Medicine Ward',
          roomNumber: '101',
          bedType: 'General'
        });

      assert.equal(bedRes.status, 201);
      assert.ok(bedRes.body.bed);
      createdBedId = bedRes.body.bed._id;

      // Assign patient to bed
      const assignRes = await request(app)
        .post(`/api/hospital/beds/${createdBedId}/assign`)
        .set('Authorization', `Bearer ${hospitalAToken}`)
        .send({
          patientId: patientAProfile._id,
          notes: 'Admitted for diagnostic observation'
        });

      assert.equal(assignRes.status, 200);
      assert.ok(assignRes.body.bed);
      assert.equal(assignRes.body.bed.status, 'Occupied');
      assert.equal(assignRes.body.bed.patientId._id.toString(), patientAProfile._id.toString());
    });

    it('C3. Hospital dashboard aggregates real MongoDB occupancy and care statistics', async () => {
      const res = await request(app)
        .get('/api/hospital/dashboard')
        .set('Authorization', `Bearer ${hospitalAToken}`);

      assert.equal(res.status, 200);
      assert.ok(res.body.stats);
      assert.ok(res.body.stats.bedCapacity.occupied >= 1);
    });
  });

  // =========================================================================
  // TEST D: PATIENT -> DOCTOR -> HOSPITAL EMERGENCY WORKFLOW
  // =========================================================================
  describe('TEST D: Cross-Role Emergency / SOS Lifecycle Verification', () => {
    let activeAlertId = null;

    it('D1. Patient triggers Emergency SOS with GPS location coordinates', async () => {
      const res = await request(app)
        .post('/api/emergency/trigger')
        .set('Authorization', `Bearer ${patientAToken}`)
        .send({
          latitude: 19.0760,
          longitude: 72.8777,
          address: 'Bandra West, Mumbai',
          triggerReason: 'Severe chest discomfort and shortness of breath',
          vitalSeverity: 'Critical High Risk'
        });

      assert.equal(res.status, 201);
      assert.ok(res.body.alert);
      assert.equal(res.body.alert.status, 'ACTIVE');
      assert.equal(res.body.alert.location.latitude, 19.0760);
      assert.equal(res.body.alert.location.longitude, 72.8777);
      assert.ok(res.body.alert._id);
      activeAlertId = res.body.alert._id;

      // Verify MongoDB persistence
      const saved = await EmergencyAlert.findById(activeAlertId);
      assert.ok(saved);
      assert.equal(saved.status, 'ACTIVE');
      assert.equal(saved.patientId.toString(), patientAUser.id);
    });

    it('D2. Doctor Workstation observes the active alert via polling endpoint', async () => {
      const res = await request(app)
        .get(`/api/emergency/${activeAlertId}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'ACTIVE');
      assert.equal(res.body.location.latitude, 19.0760);
    });

    it('D3. Attending Doctor dispatches emergency ambulance response (transitions to IN_PROGRESS)', async () => {
      const res = await request(app)
        .patch(`/api/emergency/${activeAlertId}/dispatch`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          statusText: 'Paramedic Unit 4 dispatched with Advanced Life Support equipment',
          dispatchNotes: 'Estimated ETA 7 minutes. Clinician alerted.'
        });

      assert.equal(res.status, 200);
      assert.ok(res.body.alert);
      assert.equal(res.body.alert.status, 'IN_PROGRESS');
      assert.equal(res.body.alert.dispatch.dispatchedBy.toString(), doctorUser.id);
      assert.ok(res.body.alert.dispatch.dispatchedAt);
    });

    it('D4. Hospital Critical Alerts desk observes the same alert in IN_PROGRESS state', async () => {
      const res = await request(app)
        .get(`/api/emergency/${activeAlertId}`)
        .set('Authorization', `Bearer ${hospitalAToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'IN_PROGRESS');
      assert.ok(res.body.dispatch.statusText.includes('Paramedic Unit 4'));
    });

    it('D5. Hospital Admin resolves the emergency alert upon patient arrival', async () => {
      const res = await request(app)
        .post(`/api/emergency/${activeAlertId}/resolve`)
        .set('Authorization', `Bearer ${hospitalAToken}`)
        .send({
          resolutionNotes: 'Patient safely received in ER Trauma Bay 1. Stabilized.'
        });

      assert.equal(res.status, 200);
      assert.ok(res.body.alert);
      assert.equal(res.body.alert.status, 'RESOLVED');
      assert.ok(res.body.alert.resolvedAt);
      assert.equal(res.body.alert.resolvedBy.toString(), hospitalAUser.id);
    });

    it('D6. Resolved alert is immutable and rejects further dispatch attempts', async () => {
      const res = await request(app)
        .patch(`/api/emergency/${activeAlertId}/dispatch`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ statusText: 'Duplicate dispatch test' });

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'INVALID_STATE_TRANSITION');
    });

    it('D7. Patient views the final RESOLVED state in own workspace banner', async () => {
      const res = await request(app)
        .get(`/api/emergency/${activeAlertId}`)
        .set('Authorization', `Bearer ${patientAToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'RESOLVED');
      assert.ok(res.body.resolutionNotes.includes('Trauma Bay 1'));
    });
  });

  // =========================================================================
  // TEST E: SECURITY & TENANCY ISOLATION VERIFICATION
  // =========================================================================
  describe('TEST E: Security & Tenancy Isolation Verification', () => {
    it('E1. Cross-Patient IDOR: Patient B cannot view Patient A medical report', async () => {
      const reports = await MedicalReport.find({ userId: patientAUser.id });
      assert.ok(reports.length > 0);
      const targetReportId = reports[0]._id;

      const res = await request(app)
        .get(`/api/reports/${targetReportId}`)
        .set('Authorization', `Bearer ${patientBToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    it('E2. Cross-Patient IDOR: Patient B cannot trigger emergency alert with Patient A identity', async () => {
      const res = await request(app)
        .post('/api/emergency/trigger')
        .set('Authorization', `Bearer ${patientBToken}`)
        .send({
          patientId: patientAUser.id,
          triggerReason: 'IDOR attack attempt'
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'IDOR_VIOLATION');
    });

    it('E3. Cross-Hospital Isolation: Hospital B cannot view Hospital A beds or patients', async () => {
      const res = await request(app)
        .get('/api/hospital/beds')
        .set('Authorization', `Bearer ${hospitalBToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.beds.length, 0, 'Hospital B must not see Hospital A beds');
    });

    it('E4. Cross-Role Isolation: Lab Admin cannot trigger or dispatch emergency alerts', async () => {
      const resTrigger = await request(app)
        .post('/api/emergency/trigger')
        .set('Authorization', `Bearer ${labToken}`)
        .send({ triggerReason: 'Lab unauthorized trigger' });

      assert.equal(resTrigger.status, 403);

      const alerts = await EmergencyAlert.find({});
      if (alerts.length > 0) {
        const resDispatch = await request(app)
          .patch(`/api/emergency/${alerts[0]._id}/dispatch`)
          .set('Authorization', `Bearer ${labToken}`)
          .send({ statusText: 'Unauthorized lab dispatch' });

        assert.equal(resDispatch.status, 403);
      }
    });

    it('E5. Expired and malformed JWT tokens are strictly rejected with 401', async () => {
      const expiredToken = jwt.sign(
        { id: patientAUser.id, email: patientAUser.email, role: 'patient' },
        config.JWT_SECRET,
        { expiresIn: '-1s' }
      );

      const resExpired = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      assert.equal(resExpired.status, 401);
      assert.equal(resExpired.body.error.code, 'TOKEN_EXPIRED');

      const resMalformed = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer totally-invalid-jwt-token-string');

      assert.equal(resMalformed.status, 401);
      assert.equal(resMalformed.body.error.code, 'INVALID_TOKEN');
    });

    it('E6. Role mismatch is rejected with 403 (Patient accessing doctor queue)', async () => {
      const res = await request(app)
        .get('/api/doctor/queue')
        .set('Authorization', `Bearer ${patientAToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });
  });

  // =========================================================================
  // TEST F: CANONICAL APPOINTMENT PERSISTENCE & RELATIONSHIPS
  // =========================================================================
  describe('TEST F: Canonical Appointment Schema & Relationship Verification', () => {
    it('F1. Canonical Appointment creates valid record with references to Patient, Doctor, and Hospital', async () => {
      const appointment = await Appointment.create({
        patientId: patientAProfile._id,
        doctorId: doctorProfile._id,
        hospitalId: hospitalAProfile._id,
        appointmentDate: new Date('2026-10-15T10:00:00Z'),
        timeSlot: '10:00 AM - 10:30 AM',
        status: 'Scheduled',
        type: 'In-Person',
        reason: 'Post-discharge cardiovascular consultation',
        notes: 'Review lab biomarkers and fasting glucose'
      });

      assert.ok(appointment._id);
      assert.ok(appointment.legacyId.startsWith('APT-'));
      assert.equal(appointment.patientId.toString(), patientAProfile._id.toString());
      assert.equal(appointment.doctorId.toString(), doctorProfile._id.toString());
      assert.equal(appointment.hospitalId.toString(), hospitalAProfile._id.toString());
      assert.equal(appointment.status, 'Scheduled');

      // Verify Mongoose populate capability across canonical entities
      const populated = await Appointment.findById(appointment._id)
        .populate('patientId')
        .populate('doctorId')
        .populate('hospitalId');

      assert.ok(populated.patientId);
      assert.ok(populated.doctorId);
      assert.ok(populated.hospitalId);
      assert.equal(populated.hospitalId.facilityName, 'Metro City General Hospital A');
    });

    it('F2. Appointment validates status enum and transitions correctly', async () => {
      const apt = await Appointment.findOne({ patientId: patientAProfile._id });
      assert.ok(apt);

      // Transition to Confirmed then Completed
      apt.status = 'Confirmed';
      await apt.save();
      assert.equal(apt.status, 'Confirmed');

      apt.status = 'Completed';
      await apt.save();
      assert.equal(apt.status, 'Completed');

      // Invalid status must be rejected by schema validation
      apt.status = 'INVALID_STATUS';
      await assert.rejects(async () => {
        await apt.save();
      }, /ValidationError/);
    });
  });
});
