import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../src/config/config.js';
import { User, Patient, Doctor, Hospital, Lab, MedicalReport } from '../src/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Med-X Phase 1H — Laboratory Management & Diagnostics Migration Suite', () => {
  let labTokenA = null;
  let labUserA = null;
  let labProfileA = null;

  let labTokenB = null;
  let labUserB = null;
  let labProfileB = null;

  let patientToken = null;
  let patientUser = null;
  let patientProfile = null;

  let doctorToken = null;
  let doctorUser = null;
  let doctorProfile = null;

  let hospitalToken = null;
  let hospitalUser = null;
  let hospitalProfile = null;

  let createdReportId = null;
  let draftReportId = null;

  const testEmails = [
    'lab.central.1h@medx.test',
    'lab.metro.1h@medx.test',
    'patient.1h@medx.test',
    'doctor.1h@medx.test',
    'hospital.admin.1h@medx.test'
  ];

  const cleanup = async () => {
    const users = await User.find({ email: { $in: testEmails } });
    const userIds = users.map((u) => u._id);
    await Patient.deleteMany({ userId: { $in: userIds } });
    await Doctor.deleteMany({ userId: { $in: userIds } });
    await Hospital.deleteMany({ userId: { $in: userIds } });
    await Lab.deleteMany({ userId: { $in: userIds } });
    await MedicalReport.deleteMany({ userId: { $in: userIds } });
    await MedicalReport.deleteMany({ labName: { $regex: /1H Test Lab/i } });
    await User.deleteMany({ _id: { $in: userIds } });
  };

  const TEST_DB_URI = 'mongodb://localhost:27017/medx_unified_test';

  before(async () => {
    await connectDB({ uri: TEST_DB_URI, throwOnly: true });
    assert.equal(
      mongoose.connection.name,
      'medx_unified_test',
      'CRITICAL SAFETY ASSERTION: Integration tests must strictly run against medx_unified_test'
    );
    await cleanup();
  });

  after(async () => {
    await cleanup();
    await disconnectDB();
  });

  // 1. lab_admin registration through unified IAM
  it('1. lab_admin registration through unified IAM creates canonical User and Lab profile', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dr. Ashok Diagnostics',
        email: 'lab.central.1h@medx.test',
        password: 'LabPassword123!',
        role: 'lab_admin',
        labName: '1H Test Lab Central'
      });

    assert.equal(res.status, 201);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'lab_admin');
    assert.ok(res.body.profile._id);

    labTokenA = res.body.token;
    labUserA = res.body.user;
    labProfileA = res.body.profile;
  });

  // 2. lab_admin login
  it('2. lab_admin can login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'lab.central.1h@medx.test',
        password: 'LabPassword123!'
      });

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'lab_admin');
  });

  // 3. JWT claims verification
  it('3. JWT contains canonical lab_admin role and labId claims', async () => {
    const tokenParts = labTokenA.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    assert.equal(payload.role, 'lab_admin');
    assert.ok(payload.id);
    assert.equal(payload.labId, labProfileA._id.toString());
  });

  // 4. Lab profile is linked to canonical User via ObjectId
  it('4. Lab profile is linked to canonical User via ObjectId', async () => {
    const labInDb = await Lab.findById(labProfileA._id);
    assert.ok(labInDb);
    assert.equal(labInDb.userId.toString(), labUserA.id.toString());
    assert.equal(labInDb.labName, '1H Test Lab Central');
  });

  // 5. /api/lab workspace requires authentication
  it('5. /api/lab workspace root requires authentication (401 when unauthenticated)', async () => {
    const res = await request(app).get('/api/lab');
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });

  // 6. Patient cannot access Lab admin endpoints (RBAC 403)
  it('6. Patient cannot access Lab admin endpoints (RBAC rejection 403)', async () => {
    // Register Patient
    const pRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Rohan Sharma',
        email: 'patient.1h@medx.test',
        password: 'PatientPassword123!',
        role: 'patient'
      });
    assert.equal(pRes.status, 201);
    patientToken = pRes.body.token;
    patientUser = pRes.body.user;
    patientProfile = pRes.body.profile;

    const res = await request(app)
      .get('/api/lab')
      .set('Authorization', `Bearer ${patientToken}`);
    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  // 7. Doctor cannot access Lab admin endpoints (RBAC 403)
  it('7. Doctor cannot access Lab admin endpoints (RBAC rejection 403)', async () => {
    // Register Doctor
    const dRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dr. Vivek Murthy',
        email: 'doctor.1h@medx.test',
        password: 'DoctorPassword123!',
        role: 'doctor',
        specialization: 'Pathology & Internal Medicine'
      });
    assert.equal(dRes.status, 201);
    doctorToken = dRes.body.token;
    doctorUser = dRes.body.user;
    doctorProfile = dRes.body.profile;

    const res = await request(app)
      .get('/api/lab')
      .set('Authorization', `Bearer ${doctorToken}`);
    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  // 8. hospital_admin cannot perform Lab mutations (RBAC 403)
  it('8. hospital_admin cannot perform Lab mutations (RBAC rejection 403)', async () => {
    // Register Hospital Admin
    const hRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Metro City Hospital Admin',
        email: 'hospital.admin.1h@medx.test',
        password: 'HospitalPassword123!',
        role: 'hospital_admin',
        facilityName: 'Metro City Medical Center'
      });
    assert.equal(hRes.status, 201);
    hospitalToken = hRes.body.token;
    hospitalUser = hRes.body.user;
    hospitalProfile = hRes.body.profile;

    const res = await request(app)
      .post('/api/lab/reports')
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({
        patientId: patientProfile._id,
        reportName: 'Unauthorized Report',
        parameters: { glucose_fasting: 110 }
      });
    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  // 9. lab_admin can access authorized Lab workspace
  it('9. lab_admin can access authorized Lab workspace', async () => {
    const res = await request(app)
      .get('/api/lab')
      .set('Authorization', `Bearer ${labTokenA}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, 'lab_admin');
  });

  // 10. Lab can create an authorized diagnostic report using canonical MedicalReport
  it('10. Lab can create an authorized diagnostic report using canonical MedicalReport', async () => {
    const res = await request(app)
      .post('/api/lab/reports')
      .set('Authorization', `Bearer ${labTokenA}`)
      .send({
        patientId: patientProfile._id,
        hospitalId: hospitalProfile._id,
        reportName: 'Comprehensive Metabolic Panel & Lipid Profile',
        reportType: 'Comprehensive Metabolic Panel',
        sampleCollectedAt: new Date().toISOString(),
        parameters: {
          glucose_fasting: { value: 145, unit: 'mg/dL', ref_range: '70 - 99 mg/dL', status: 'High' },
          hemoglobin: { value: 13.8, unit: 'g/dL', ref_range: '12.0 - 16.0 g/dL', status: 'Normal' },
          creatinine: { value: 1.1, unit: 'mg/dL', ref_range: '0.7 - 1.3 mg/dL', status: 'Normal' },
          total_cholesterol: { value: 240, unit: 'mg/dL', ref_range: '< 200 mg/dL', status: 'High' }
        },
        status: 'Finalized',
        notes: 'Specimen collected fasting (10h). High glucose and cholesterol noted.'
      });

    assert.equal(res.status, 201);
    assert.ok(res.body.success);
    assert.ok(res.body.report._id);
    assert.ok(res.body.report.reportId.startsWith('REP-LAB-'));
    createdReportId = res.body.report._id;
  });

  // 11. MedicalReport contains canonical patient/lab relationship
  it('11. MedicalReport contains canonical patientId, labId, and hospitalId relationships', async () => {
    const report = await MedicalReport.findById(createdReportId);
    assert.ok(report);
    assert.equal(report.patientId.toString(), patientProfile._id.toString());
    assert.equal(report.userId.toString(), patientUser.id.toString());
    assert.equal(report.labId.toString(), labProfileA._id.toString());
    assert.equal(report.hospitalId.toString(), hospitalProfile._id.toString());
    assert.equal(report.labName, '1H Test Lab Central');
  });

  // 12. MedicalReport is not duplicated into a second report collection
  it('12. MedicalReport is not duplicated into a second report collection', async () => {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    assert.ok(collectionNames.includes('medicalreports'), 'medicalreports collection must exist');
    assert.ok(!collectionNames.includes('labreports'), 'LabReport collection must NOT exist');
    assert.ok(!collectionNames.includes('laboratoryreports'), 'LaboratoryReport collection must NOT exist');
    assert.ok(!collectionNames.includes('diagnosticreports'), 'DiagnosticReport collection must NOT exist');
  });

  // 13. Lab report values persist in real MongoDB
  it('13. Lab report values persist in real MongoDB (medx_unified_test)', async () => {
    assert.equal(mongoose.connection.name, 'medx_unified_test');
    const directDoc = await mongoose.connection.db.collection('medicalreports').findOne({
      _id: new mongoose.Types.ObjectId(createdReportId)
    });
    assert.ok(directDoc);
    assert.equal(directDoc.sourceType, 'lab_direct');
    assert.equal(directDoc.status, 'Finalized');
  });

  // 14. Report parameters preserve units and reference context
  it('14. Report parameters preserve units and reference context in extensible Map', async () => {
    const report = await MedicalReport.findById(createdReportId);
    assert.ok(report.parameters instanceof Map);

    const glucose = report.parameters.get('glucose_fasting');
    assert.ok(glucose);
    assert.equal(glucose.value, 145);
    assert.equal(glucose.unit, 'mg/dL');
    assert.equal(glucose.ref_range, '70 - 99 mg/dL');
    assert.equal(glucose.status, 'High');

    const chol = report.parameters.get('total_cholesterol');
    assert.ok(chol);
    assert.equal(chol.value, 240);
    assert.equal(chol.unit, 'mg/dL');
    assert.equal(chol.status, 'High');
  });

  // 15. Existing report source semantics remain intact ('lab_direct')
  it('15. Existing report source semantics remain intact (sourceType === lab_direct)', async () => {
    const report = await MedicalReport.findById(createdReportId);
    assert.equal(report.sourceType, 'lab_direct');
  });

  // 16. Existing Lab finalization/sign-off behavior works where present
  it('16. Draft report creation and subsequent lab finalization/sign-off works correctly', async () => {
    // Create draft report
    const draftRes = await request(app)
      .post('/api/lab/reports')
      .set('Authorization', `Bearer ${labTokenA}`)
      .send({
        patientId: patientProfile._id,
        reportName: 'Routine CBC Work-in-Progress',
        reportType: 'Complete Blood Count (CBC)',
        parameters: {
          wbc_count: { value: 7200, unit: 'cells/mcL', ref_range: '4,500 - 11,000 cells/mcL', status: 'Normal' }
        },
        status: 'Draft'
      });

    assert.equal(draftRes.status, 201);
    assert.equal(draftRes.body.report.status, 'Draft');
    draftReportId = draftRes.body.report._id;

    // Finalize report
    const finalizeRes = await request(app)
      .post(`/api/lab/reports/${draftReportId}/finalize`)
      .set('Authorization', `Bearer ${labTokenA}`);

    assert.equal(finalizeRes.status, 200);
    assert.equal(finalizeRes.body.report.status, 'Finalized');
    assert.ok(finalizeRes.body.report.finalizedAt);
  });

  // 17. Lab cannot write Doctor review metadata
  it('17. Lab cannot write Doctor review metadata or impersonate a physician', async () => {
    const report = await MedicalReport.findById(createdReportId);
    assert.equal(report.reviewedByDoctorId, null);
    assert.equal(report.reviewStatus, 'Pending Review');
    assert.equal(report.reviewNotes, '');

    // Attempt to inject doctor review fields during report update
    const hackRes = await request(app)
      .put(`/api/lab/reports/${createdReportId}`)
      .set('Authorization', `Bearer ${labTokenA}`)
      .send({
        reviewedByDoctorId: doctorProfile._id,
        reviewStatus: 'Reviewed',
        reviewNotes: 'Malicious review authored by lab technician'
      });

    // Should be rejected (either 400 because finalized or 403 because unauthorized doctor impersonation)
    assert.ok([400, 403].includes(hackRes.status));

    // Verify database remains untouched
    const reportCheck = await MedicalReport.findById(createdReportId);
    assert.equal(reportCheck.reviewedByDoctorId, null);
    assert.equal(reportCheck.reviewStatus, 'Pending Review');
  });

  // 18. Doctor can retrieve the Lab-created MedicalReport where authorized
  it('18. Doctor can retrieve the Lab-created MedicalReport via Doctor workspace', async () => {
    const res = await request(app)
      .get(`/api/doctor/reports/${createdReportId}`)
      .set('Authorization', `Bearer ${doctorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body._id.toString(), createdReportId.toString());
    assert.equal(res.body.labName, '1H Test Lab Central');
  });

  // 19. Doctor can perform the existing Phase 1F review workflow
  it('19. Doctor can perform clinical review on Lab-created report preserving biomarkers', async () => {
    const res = await request(app)
      .put(`/api/doctor/reports/${createdReportId}/review`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        reviewStatus: 'Reviewed',
        reviewNotes: 'Blood glucose indicates impaired fasting glycaemia. Recommend dietary changes and HbA1c re-test.'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.reviewStatus, 'Reviewed');
    assert.equal(res.body.reviewedByDoctorId.toString(), doctorProfile._id.toString());

    // Verify raw biomarkers are strictly preserved
    const report = await MedicalReport.findById(createdReportId);
    const glucose = report.parameters.get('glucose_fasting');
    assert.equal(glucose.value, 145);
  });

  // 20. Hospital can retrieve the report where authorized
  it('20. Hospital can retrieve the report where authorized via hospitalId affiliation', async () => {
    const res = await request(app)
      .get(`/api/hospital/reports/${createdReportId}`)
      .set('Authorization', `Bearer ${hospitalToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.success);
    assert.equal(res.body.report._id.toString(), createdReportId.toString());
  });

  // 21. Patient can retrieve the report where authorized
  it('21. Patient can retrieve own Lab-created report via Patient workspace', async () => {
    const res = await request(app)
      .get(`/api/patient/reports/${createdReportId}`)
      .set('Authorization', `Bearer ${patientToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body._id.toString(), createdReportId.toString());
  });

  // 22. Cross-patient access is rejected
  it('22. Cross-patient access is rejected (Patient B cannot access Patient A report)', async () => {
    // Register Patient B
    const pbRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Patient Bob',
        email: 'patient.bob.1h@medx.test',
        password: 'Password123!',
        role: 'patient'
      });
    assert.equal(pbRes.status, 201);
    const patientBToken = pbRes.body.token;

    const res = await request(app)
      .get(`/api/patient/reports/${createdReportId}`)
      .set('Authorization', `Bearer ${patientBToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'FORBIDDEN');

    // Cleanup Patient B
    await User.findByIdAndDelete(pbRes.body.user.id);
    await Patient.findByIdAndDelete(pbRes.body.profile._id);
  });

  // 23. Cross-lab access is rejected (IDOR protection)
  it('23. Cross-lab access is rejected (Lab B cannot view or modify Lab A reports)', async () => {
    // Register Lab B
    const lbRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'City Pathology Admin',
        email: 'lab.metro.1h@medx.test',
        password: 'LabBPassword123!',
        role: 'lab_admin',
        labName: 'City Pathology & Reference Labs'
      });
    assert.equal(lbRes.status, 201);
    labTokenB = lbRes.body.token;
    labUserB = lbRes.body.user;
    labProfileB = lbRes.body.profile;

    // Lab B tries to view Lab A's report
    const viewRes = await request(app)
      .get(`/api/lab/reports/${createdReportId}`)
      .set('Authorization', `Bearer ${labTokenB}`);
    assert.equal(viewRes.status, 403);
    assert.equal(viewRes.body.error.code, 'FORBIDDEN_CROSS_LAB_ACCESS');

    // Lab B tries to finalize Lab A's draft report
    const finRes = await request(app)
      .post(`/api/lab/reports/${draftReportId}/finalize`)
      .set('Authorization', `Bearer ${labTokenB}`);
    assert.equal(finRes.status, 403);
    assert.equal(finRes.body.error.code, 'FORBIDDEN_CROSS_LAB_MUTATION');
  });

  // 24. Cross-hospital access is rejected where applicable
  it('24. Cross-hospital access is rejected (Hospital B cannot access Hospital A reports)', async () => {
    // Register Hospital B
    const hbRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'St. Peter Hospital Admin',
        email: 'hospital.peter.1h@medx.test',
        password: 'Password123!',
        role: 'hospital_admin',
        facilityName: 'St. Peter Hospital'
      });
    assert.equal(hbRes.status, 201);
    const hospitalBToken = hbRes.body.token;

    const res = await request(app)
      .get(`/api/hospital/reports/${createdReportId}`)
      .set('Authorization', `Bearer ${hospitalBToken}`);
    assert.equal(res.status, 403);

    // Cleanup Hospital B
    await User.findByIdAndDelete(hbRes.body.user.id);
    await Hospital.findByIdAndDelete(hbRes.body.profile._id);
  });

  // 25. Unauthorized report mutation is rejected
  it('25. Unauthorized report mutation is rejected (unauthenticated or non-lab)', async () => {
    const unauthRes = await request(app)
      .put(`/api/lab/reports/${createdReportId}`)
      .send({ reportName: 'Hacked Title' });
    assert.equal(unauthRes.status, 401);

    const docMutateRes = await request(app)
      .put(`/api/lab/reports/${createdReportId}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ reportName: 'Hacked by Doctor' });
    assert.equal(docMutateRes.status, 403);
  });

  // 26. Finalized reports cannot be improperly altered
  it('26. Finalized reports cannot be improperly altered (locked biomarker results)', async () => {
    const res = await request(app)
      .put(`/api/lab/reports/${createdReportId}`)
      .set('Authorization', `Bearer ${labTokenA}`)
      .send({
        parameters: {
          glucose_fasting: { value: 90, status: 'Normal' }
        }
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'REPORT_FINALIZED_IMMUTABLE');

    // Verify value was NOT altered
    const report = await MedicalReport.findById(createdReportId);
    assert.equal(report.parameters.get('glucose_fasting').value, 145);
  });

  // 27. No duplicate MedicalReport is created
  it('27. No duplicate MedicalReport records are created during finalization or review', async () => {
    const count = await MedicalReport.countDocuments({ reportId: { $regex: /^REP-LAB-/ } });
    // Exactly 2 reports were created in this suite: createdReportId and draftReportId
    assert.equal(count, 2);
  });

  // 28. No destructive startup seed exists
  it('28. No destructive startup seed exists in the unified runtime', () => {
    const serverPath = path.resolve(__dirname, '../src/server.js');
    const content = fs.readFileSync(serverPath, 'utf8');
    assert.ok(!content.includes('deleteMany'), 'server.js must not perform destructive deleteMany');
    assert.ok(!content.includes('dropDatabase'), 'server.js must not perform destructive dropDatabase');
    assert.ok(!content.includes('seedDatabase'), 'server.js must not perform automatic startup seeding');
  });

  // 29. No runtime MongoMemoryServer fallback exists
  it('29. Real MongoDB connection is enforced without in-memory fallback', async () => {
    assert.equal(mongoose.connection.readyState, 1);
    assert.equal(mongoose.connection.name, 'medx_unified_test');
    assert.ok(!process.env.MONGO_MEMORY_SERVER_URI);
  });

  // 30. Existing ML service boundary remains unchanged
  it('30. Existing ML service boundary points to designated microservice', () => {
    assert.equal(config.ML_SERVICE_URL, 'http://127.0.0.1:8000');
  });

  // 31. Lab Dashboard metrics aggregate real MongoDB state
  it('31. Lab dashboard aggregates real MongoDB diagnostic statistics', async () => {
    const res = await request(app)
      .get('/api/lab/dashboard')
      .set('Authorization', `Bearer ${labTokenA}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.success);
    assert.ok(res.body.stats.totalReports >= 2);
    assert.ok(res.body.stats.finalizedReports >= 2);
    assert.ok(Array.isArray(res.body.recentReports));
  });

  // 32. Lab profile retrieval and update
  it('32. Lab can retrieve and update facility profile', async () => {
    const updateRes = await request(app)
      .put('/api/lab/profile')
      .set('Authorization', `Bearer ${labTokenA}`)
      .send({
        labName: '1H Test Lab Central - Advanced Diagnostics',
        code: 'LAB-CENTRAL-01',
        phone: '+91 22 2456 7888',
        email: 'lab.central@medx.test',
        turnaroundHours: 3
      });

    assert.equal(updateRes.status, 200);
    assert.ok(updateRes.body.success);
    assert.equal(updateRes.body.lab.labName, '1H Test Lab Central - Advanced Diagnostics');
    assert.equal(updateRes.body.lab.code, 'LAB-CENTRAL-01');
    assert.equal(updateRes.body.lab.turnaroundHours, 3);
  });
});
