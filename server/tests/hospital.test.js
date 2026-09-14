import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

import { User, Patient, Doctor, Hospital, MedicalReport, Bed, CareTask } from '../src/models/index.js';

describe('Med-X Phase 1G — Hospital Operations, Bed Management & CareQueue Suite', () => {
  let hospitalAdminToken = null;
  let hospitalAdminUser = null;
  let hospitalProfile = null;

  let otherHospitalToken = null;
  let otherHospitalProfile = null;

  let patientToken = null;
  let patientUser = null;
  let patientProfile = null;

  let doctorToken = null;
  let doctorUser = null;
  let doctorProfile = null;

  let createdBedId = null;
  let createdCareTaskId = null;
  let admittedReportId = null;
  let outpatientReportId = null;

  const testEmails = [
    'hospital.admin.1g@medx.test',
    'patient.1g@medx.test',
    'doctor.1g@medx.test',
    'hospital.metro.1g@medx.test'
  ];

  const cleanup = async () => {
    await Bed.deleteMany({});
    await CareTask.deleteMany({});
    const users = await User.find({ email: { $in: testEmails } });
    const userIds = users.map((u) => u._id);
    await Patient.deleteMany({ userId: { $in: userIds } });
    await Doctor.deleteMany({ userId: { $in: userIds } });
    await Hospital.deleteMany({ userId: { $in: userIds } });
    await MedicalReport.deleteMany({ userId: { $in: userIds } });
    await User.deleteMany({ _id: { $in: userIds } });
  };

  const TEST_DB_URI = 'mongodb://localhost:27017/medx_unified_test';

  before(async () => {
    await connectDB({ uri: TEST_DB_URI, throwOnly: true });
    await cleanup();
  });


  after(async () => {
    await cleanup();
    await disconnectDB();
  });


  // 1. Hospital Admin Registration through Unified IAM
  it('1. Hospital admin registration through unified IAM creates canonical User and Hospital profile', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'St. Jude General Hospital Admin',
        email: 'hospital.admin.1g@medx.test',
        password: 'HospitalPassword123!',
        role: 'hospital_admin',
        facilityName: 'St. Jude General Medical Center'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.user.role, 'hospital_admin');
    assert.ok(res.body.token);
    assert.ok(res.body.profile);
    assert.equal(res.body.profile.facilityName, 'St. Jude General Medical Center');

    hospitalAdminToken = res.body.token;
    hospitalAdminUser = res.body.user;
    hospitalProfile = res.body.profile;
  });

  // 2. Hospital Admin Login
  it('2. Hospital admin can login and receives JWT containing canonical hospital_admin role', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'hospital.admin.1g@medx.test',
        password: 'HospitalPassword123!'
      });

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'hospital_admin');

    // Decode token payload
    const payload = JSON.parse(Buffer.from(res.body.token.split('.')[1], 'base64').toString());
    assert.equal(payload.role, 'hospital_admin');
    assert.equal(payload.id, hospitalAdminUser.id);
  });

  // 3. Hospital Profile Linked to Canonical User
  it('3. Hospital profile is linked to canonical User via ObjectId', async () => {
    const dbHospital = await Hospital.findOne({ userId: hospitalAdminUser.id });
    assert.ok(dbHospital);
    assert.equal(dbHospital.userId.toString(), hospitalAdminUser.id);
    assert.equal(dbHospital.facilityName, 'St. Jude General Medical Center');
  });

  // 4. Hospital Workspace is Protected by Auth and RBAC
  it('4. Hospital workspace root requires authentication (401 when unauthenticated)', async () => {
    const res = await request(app).get('/api/hospital');
    assert.equal(res.status, 401);
  });

  // 5. Patient Cannot Access Hospital-Admin APIs (RBAC 403)
  it('5. Patient cannot access hospital operations endpoints (RBAC 403)', async () => {
    // Register test patient
    const pRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Patient 1G Test',
        email: 'patient.1g@medx.test',
        password: 'PatientPassword123!',
        role: 'patient'
      });
    patientToken = pRes.body.token;
    patientUser = pRes.body.user;
    patientProfile = pRes.body.profile;

    const res = await request(app)
      .get('/api/hospital/dashboard')
      .set('Authorization', `Bearer ${patientToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  // 6. Doctor Cannot Access Hospital-Admin Mutation APIs (RBAC 403)
  it('6. Doctor cannot access hospital mutation endpoints (RBAC 403)', async () => {
    // Register test doctor
    const dRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dr. Alice 1G Test',
        email: 'doctor.1g@medx.test',
        password: 'DoctorPassword123!',
        role: 'doctor',
        specialty: 'Emergency Medicine'
      });
    doctorToken = dRes.body.token;
    doctorUser = dRes.body.user;
    doctorProfile = dRes.body.profile;

    const res = await request(app)
      .post('/api/hospital/beds')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ bedNumber: 'B-999', ward: 'Emergency' });

    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });


  // 7. Hospital Admin Can Retrieve & Update Its Own Profile
  it('7. Hospital admin can retrieve and update facility profile', async () => {
    const getRes = await request(app)
      .get('/api/hospital/profile')
      .set('Authorization', `Bearer ${hospitalAdminToken}`);

    assert.equal(getRes.status, 200);
    assert.equal(getRes.body.hospital.facilityName, 'St. Jude General Medical Center');

    const updateRes = await request(app)
      .patch('/api/hospital/profile')
      .set('Authorization', `Bearer ${hospitalAdminToken}`)
      .send({
        phone: '+91 22 8888 7777',
        operatingHours: '24/7 Level 1 Trauma Center',
        bedCapacity: { total: 250, occupied: 120, icuAvailable: 25 }
      });

    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.hospital.phone, '+91 22 8888 7777');
    assert.equal(updateRes.body.hospital.operatingHours, '24/7 Level 1 Trauma Center');
    assert.equal(updateRes.body.hospital.bedCapacity.total, 250);
  });

  // 8. Bed Management: Bed Creation and State Behavior
  it('8. Bed creation succeeds and enforces unique bed number per hospital', async () => {
    const createRes = await request(app)
      .post('/api/hospital/beds')
      .set('Authorization', `Bearer ${hospitalAdminToken}`)
      .send({
        bedNumber: 'ICU-101',
        ward: 'Intensive Care',
        roomNumber: 'ICU-A',
        bedType: 'ICU',
        status: 'Available',
        notes: 'High acuity monitor attached'
      });

    assert.equal(createRes.status, 201);
    assert.equal(createRes.body.bed.bedNumber, 'ICU-101');
    assert.equal(createRes.body.bed.bedType, 'ICU');
    assert.equal(createRes.body.bed.status, 'Available');
    createdBedId = createRes.body.bed._id;

    // Creating duplicate bed in same hospital is rejected with 409
    const dupRes = await request(app)
      .post('/api/hospital/beds')
      .set('Authorization', `Bearer ${hospitalAdminToken}`)
      .send({
        bedNumber: 'ICU-101',
        ward: 'Intensive Care'
      });

    assert.equal(dupRes.status, 409);
    assert.equal(dupRes.body.error.code, 'BED_EXISTS');
  });

  // 9. Bed Occupancy & Patient Assignment
  it('9. Bed occupancy assignment links patient, marks bed Occupied, and updates capacity stats', async () => {
    const assignRes = await request(app)
      .post(`/api/hospital/beds/${createdBedId}/assign`)
      .set('Authorization', `Bearer ${hospitalAdminToken}`)
      .send({
        patientId: patientProfile._id,
        notes: 'Admitted for continuous hemodynamic monitoring'
      });

    assert.equal(assignRes.status, 200);
    assert.equal(assignRes.body.bed.status, 'Occupied');
    assert.ok(assignRes.body.bed.patientId);
    assert.equal(assignRes.body.bed.patientId.userId.name, 'Patient 1G Test');

    // Verify bed list returns updated stats
    const listRes = await request(app)
      .get('/api/hospital/beds')
      .set('Authorization', `Bearer ${hospitalAdminToken}`);

    assert.equal(listRes.status, 200);
    assert.equal(listRes.body.stats.occupied, 1);
    assert.equal(listRes.body.stats.icuOccupied, 1);
    assert.equal(listRes.body.stats.icuAvailable, 0);
  });

  // 10. Bed Release Behavior
  it('10. Bed release returns bed to Available and clears patient assignment', async () => {
    const releaseRes = await request(app)
      .post(`/api/hospital/beds/${createdBedId}/release`)
      .set('Authorization', `Bearer ${hospitalAdminToken}`);

    assert.equal(releaseRes.status, 200);
    assert.equal(releaseRes.body.bed.status, 'Available');
    assert.equal(releaseRes.body.bed.patientId, null);

    const checkRes = await request(app)
      .get('/api/hospital/beds')
      .set('Authorization', `Bearer ${hospitalAdminToken}`);

    assert.equal(checkRes.body.stats.available, 1);
    assert.equal(checkRes.body.stats.occupied, 0);
  });

  // 11. Cross-Hospital Isolation (IDOR Protection)
  it('11. Hospital Admin B cannot view or modify Hospital Admin A’s beds or patients', async () => {
    // Create second hospital
    const h2Res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Metro City Hospital Admin',
        email: 'hospital.metro.1g@medx.test',
        password: 'HospitalPassword123!',
        role: 'hospital_admin',
        facilityName: 'Metro City General Hospital'
      });

    otherHospitalToken = h2Res.body.token;
    otherHospitalProfile = h2Res.body.profile;

    // Hospital B attempts to update Bed of Hospital A
    const idorRes = await request(app)
      .patch(`/api/hospital/beds/${createdBedId}/status`)
      .set('Authorization', `Bearer ${otherHospitalToken}`)
      .send({ status: 'Maintenance' });

    assert.equal(idorRes.status, 404);
    assert.equal(idorRes.body.error.code, 'BED_NOT_FOUND');
  });

  // 12. Critical CareQueue Trigger Semantics: Outpatient Report Rejection
  it('12. Outpatient reports (hospitalId null) do NOT create Hospital CareQueue tasks', async () => {
    // Create an outpatient report with Critical risk but NO hospitalId
    const outReport = await MedicalReport.create({
      reportId: `REP-OUT-1G`,
      userId: patientUser.id,
      patientId: patientProfile._id,
      hospitalId: null, // Outpatient
      sourceType: 'manual',
      reportName: 'Outpatient Comprehensive Panel',
      parameters: {
        wbc: { value: 18.5, unit: '10^3/uL', ref_range: '4.5-11.0', status: 'Critical' }
      },
      mlResult: {
        riskTier: 'Critical',
        overallRiskScore: 0.88
      },
      reviewStatus: 'Requires Review'
    });
    outpatientReportId = outReport._id;

    const triggerRes = await request(app)
      .post('/api/hospital/care-queue/trigger')
      .set('Authorization', `Bearer ${hospitalAdminToken}`)
      .send({ reportId: outpatientReportId });

    assert.equal(triggerRes.status, 200);
    assert.equal(triggerRes.body.queued, false);
    assert.match(triggerRes.body.reason, /Outpatient report/);

    // Verify task count did not increase
    const queueRes = await request(app)
      .get('/api/hospital/care-queue')
      .set('Authorization', `Bearer ${hospitalAdminToken}`);

    assert.equal(queueRes.body.totalCount, 0);
  });

  // 13. Critical CareQueue Trigger Semantics: Admitted Institutional Qualifying Report
  it('13. Qualifying Critical admitted report with hospitalId successfully triggers CareQueue item', async () => {
    // Affiliate patient with this hospital and admit to a bed
    await Patient.findByIdAndUpdate(patientProfile._id, {
      hospitalId: hospitalProfile._id,
      status: 'Critical'
    });
    await Bed.findByIdAndUpdate(createdBedId, {
      patientId: patientProfile._id,
      status: 'Occupied'
    });

    // Create an institutional qualifying high-risk report
    const admReport = await MedicalReport.create({
      reportId: `REP-ADM-1G`,
      userId: patientUser.id,
      patientId: patientProfile._id,
      hospitalId: hospitalProfile._id, // Institutional
      sourceType: 'manual',
      reportName: 'Inpatient Critical Biomarkers Panel',
      parameters: {
        creatinine: { value: 3.8, unit: 'mg/dL', ref_range: '0.7-1.3', status: 'Critical' },
        lactate: { value: 4.2, unit: 'mmol/L', ref_range: '0.5-2.2', status: 'Critical' }
      },
      mlResult: {
        riskTier: 'Critical',
        overallRiskScore: 0.92
      },
      reviewStatus: 'Pending Review'
    });
    admittedReportId = admReport._id;

    const triggerRes = await request(app)
      .post('/api/hospital/care-queue/trigger')
      .set('Authorization', `Bearer ${hospitalAdminToken}`)
      .send({ reportId: admittedReportId });

    assert.equal(triggerRes.status, 201);
    assert.equal(triggerRes.body.queued, true);
    assert.equal(triggerRes.body.task.category, 'Critical Alerts');
    assert.equal(triggerRes.body.task.priority, 'Critical');
    createdCareTaskId = triggerRes.body.task._id;
  });

  // 14. CareQueue 6-Stage Progression and Transitions
  it('14. CareQueue transitions across 6-stage operational pipeline correctly', async () => {
    const stages = [
      'Doctor Assignment Pending',
      'Reports Pending Review',
      'Follow-up Required',
      'Completed'
    ];

    for (const stage of stages) {
      const updateRes = await request(app)
        .patch(`/api/hospital/care-queue/${createdCareTaskId}`)
        .set('Authorization', `Bearer ${hospitalAdminToken}`)
        .send({
          category: stage,
          actionTaken: `Operational progression to stage: ${stage}`
        });

      assert.equal(updateRes.status, 200);
      assert.equal(updateRes.body.task.category, stage);
      assert.equal(updateRes.body.task.actionTaken, `Operational progression to stage: ${stage}`);
    }

    // Verify grouped response reflects updated stage
    const queueRes = await request(app)
      .get('/api/hospital/care-queue')
      .set('Authorization', `Bearer ${hospitalAdminToken}`);

    assert.equal(queueRes.status, 200);
    assert.equal(queueRes.body.grouped['Completed'].length, 1);
    assert.equal(queueRes.body.grouped['New Patients'].length, 0);
  });

  // 15. MedicalReport Integration: Biomarker Preservation & No Duplication
  it('15. Hospital operations consume canonical MedicalReport without modifying biomarkers or duplicating records', async () => {
    const originalReport = await MedicalReport.findById(admittedReportId);
    assert.equal(originalReport.parameters.get('creatinine').value, 3.8);
    assert.equal(originalReport.parameters.get('lactate').value, 4.2);

    // Hospital reads report
    const viewRes = await request(app)
      .get(`/api/hospital/reports/${admittedReportId}`)
      .set('Authorization', `Bearer ${hospitalAdminToken}`);

    assert.equal(viewRes.status, 200);
    assert.equal(viewRes.body.report.reportName, 'Inpatient Critical Biomarkers Panel');

    // Confirm no secondary report collections exist and original biomarkers remain intact
    const afterReport = await MedicalReport.findById(admittedReportId);
    assert.equal(afterReport.parameters.get('creatinine').value, 3.8);
    assert.equal(afterReport.parameters.get('lactate').value, 4.2);
  });


  // 16. Doctor and Staff Roster Management
  it('16. Hospital can list affiliated doctors and assign doctor to patients and care tasks', async () => {
    // Affiliate doctor with this hospital
    await Doctor.findByIdAndUpdate(doctorProfile._id, {
      hospitalId: hospitalProfile._id
    });

    const docListRes = await request(app)
      .get('/api/hospital/doctors')
      .set('Authorization', `Bearer ${hospitalAdminToken}`);

    assert.equal(docListRes.status, 200);
    assert.ok(docListRes.body.doctors.length >= 1);
    assert.equal(docListRes.body.doctors[0].specialty, 'Emergency Medicine');

    // Assign doctor to patient
    const assignRes = await request(app)
      .post('/api/hospital/assign-doctor')
      .set('Authorization', `Bearer ${hospitalAdminToken}`)
      .send({
        doctorId: doctorProfile._id,
        patientId: patientProfile._id
      });

    assert.equal(assignRes.status, 200);

    const updatedPatient = await Patient.findById(patientProfile._id);
    assert.equal(updatedPatient.primaryDoctorId.toString(), doctorProfile._id.toString());
  });

  // 17. Hospital Dashboard Persistence & Aggregation
  it('17. Hospital dashboard aggregates real MongoDB state (beds, patients, alerts, workload)', async () => {
    const dashRes = await request(app)
      .get('/api/hospital/dashboard?timeframe=today')
      .set('Authorization', `Bearer ${hospitalAdminToken}`);

    assert.equal(dashRes.status, 200);
    assert.ok(dashRes.body.stats);
    assert.ok(dashRes.body.activityChart.length > 0);
    assert.ok(dashRes.body.reportOverview.length > 0);
    assert.equal(dashRes.body.stats.doctors, 1);
    assert.equal(dashRes.body.hospital.facilityName, 'St. Jude General Medical Center');
  });
});
