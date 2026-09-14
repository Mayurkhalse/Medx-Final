import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import app from '../src/app.js';
import config from '../src/config/config.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Patient } from '../src/models/Patient.js';
import { MedicalReport } from '../src/models/MedicalReport.js';
import { ChatHistory } from '../src/models/ChatHistory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_DB_URI = 'mongodb://localhost:27017/medx_unified_test';
const SAMPLE_PDF_PATH = path.join(__dirname, 'fixtures', 'sample_report.pdf');

describe('Med-X Phase 1E — Patient Diagnostics, Report Ingestion, Biomarkers & ML Test Suite', () => {
  let patientAToken = '';
  let patientAUser = null;
  let patientAPreProfile = null;

  let patientBToken = '';
  let patientBUser = null;

  let doctorToken = '';
  let createdReportId = '';

  before(async () => {
    await connectDB({ uri: TEST_DB_URI, throwOnly: true });

    assert.equal(
      mongoose.connection.name,
      'medx_unified_test',
      'CRITICAL SAFETY ASSERTION: Integration tests must strictly run against medx_unified_test'
    );

    // Clean up test collections in test database
    await MedicalReport.deleteMany({});
    await ChatHistory.deleteMany({});
    await User.deleteMany({ email: { $in: ['patient.alice@medx.test', 'patient.bob@medx.test', 'doctor.dave@medx.test'] } });
    await Patient.deleteMany({});

    // 1. Register Patient A
    const regA = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Patient',
        email: 'patient.alice@medx.test',
        password: 'Password123!',
        role: 'patient'
      });
    assert.equal(regA.status, 201);
    patientAToken = regA.body.token;
    patientAUser = regA.body.user;

    patientAPreProfile = await Patient.findOne({ userId: patientAUser.id });
    assert.ok(patientAPreProfile, 'Linked Patient profile must exist for Alice');

    // 2. Register Patient B
    const regB = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob Patient',
        email: 'patient.bob@medx.test',
        password: 'Password123!',
        role: 'patient'
      });
    assert.equal(regB.status, 201);
    patientBToken = regB.body.token;
    patientBUser = regB.body.user;

    // 3. Register Doctor
    const regDoc = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dr. Dave Clinical',
        email: 'doctor.dave@medx.test',
        password: 'Password123!',
        role: 'doctor',
        specialty: 'Internal Medicine'
      });
    assert.equal(regDoc.status, 201);
    doctorToken = regDoc.body.token;
  });

  after(async () => {
    await MedicalReport.deleteMany({});
    await ChatHistory.deleteMany({});
    await User.deleteMany({ email: { $in: ['patient.alice@medx.test', 'patient.bob@medx.test', 'doctor.dave@medx.test'] } });
    await Patient.deleteMany({});
    await disconnectDB();
  });

  // 1. Authenticated Patient can access workspace
  it('1. Authenticated Patient can access patient workspace API root', async () => {
    const res = await request(app)
      .get('/api/patient')
      .set('Authorization', `Bearer ${patientAToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, 'patient');
    assert.equal(res.body.user.email, 'patient.alice@medx.test');
  });

  // 2. Non-patient role cannot access patient workspace
  it('2. Non-patient role (e.g. Doctor) cannot access patient workspace', async () => {
    const res = await request(app)
      .get('/api/patient')
      .set('Authorization', `Bearer ${doctorToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  // 3. Manual report creation persists to real MongoDB & links identity
  it('3. Manual report creation persists to real MongoDB with correct Patient/User identity', async () => {
    const reportPayload = {
      reportName: 'Baseline Complete Blood Count',
      reportDate: new Date('2026-03-01').toISOString(),
      reportType: 'Complete Blood Count (CBC)',
      parameters: {
        glucose_fasting: { value: 86.5, unit: 'mg/dL', ref_range: '70-100' },
        hemoglobin: { value: 14.2, unit: 'g/dL', ref_range: '12-17' },
        wbc_count: { value: 6500, unit: '/uL', ref_range: '4000-11000' },
        creatinine: { value: 0.92, unit: 'mg/dL', ref_range: '0.6-1.3' },
        platelets: { value: 280000, unit: '/uL', ref_range: '150000-450000' }
      }
    };

    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${patientAToken}`)
      .send(reportPayload);

    assert.equal(res.status, 201);
    assert.ok(res.body._id);
    createdReportId = res.body._id;

    // Direct MongoDB verification
    const dbReport = await MedicalReport.findById(createdReportId);
    assert.ok(dbReport, 'Report must be queryable in real MongoDB');
    assert.equal(dbReport.userId.toString(), patientAUser.id);
    assert.equal(dbReport.patientId.toString(), patientAPreProfile._id.toString());
    assert.equal(dbReport.reportName, 'Baseline Complete Blood Count');
    assert.equal(dbReport.sourceType, 'manual');
  });

  // 4. Biomarker data & units/reference context are preserved
  it('4. Biomarker data, units, and reference ranges are preserved in parameters schema', async () => {
    const dbReport = await MedicalReport.findById(createdReportId);
    assert.ok(dbReport.parameters);

    const glucose = dbReport.parameters.get('glucose_fasting');
    assert.equal(glucose.value, 86.5);
    assert.equal(glucose.unit, 'mg/dL');
    assert.equal(glucose.ref_range, '70-100');

    const platelets = dbReport.parameters.get('platelets');
    assert.equal(platelets.value, 280000);
    assert.equal(platelets.unit, '/uL');
    assert.equal(platelets.ref_range, '150000-450000');
  });

  // 5. ML integration works and result is persisted
  it('5. ML integration works through service boundary and results are mapped and persisted', async () => {
    const dbReport = await MedicalReport.findById(createdReportId);
    assert.ok(dbReport.mlResult);
    assert.ok(typeof dbReport.mlResult.overallRiskScore === 'number');
    assert.ok(['Low', 'Moderate', 'High', 'Critical'].includes(dbReport.mlResult.riskTier));
    assert.ok(dbReport.mlResult.modelVersion);
    assert.ok(dbReport.reportDate instanceof Date);
  });

  // 6. Patient can access own report
  it('6. Patient can access own report by ID', async () => {
    const res = await request(app)
      .get(`/api/reports/${createdReportId}`)
      .set('Authorization', `Bearer ${patientAToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body._id, createdReportId);
    assert.equal(res.body.reportName, 'Baseline Complete Blood Count');
  });

  // 7. Security: Cross-patient report access is rejected (Patient B cannot access Patient A's report)
  it('7. Security: Patient B cannot access Patient A’s report (IDOR protection)', async () => {
    const res = await request(app)
      .get(`/api/reports/${createdReportId}`)
      .set('Authorization', `Bearer ${patientBToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  // 8. PDF lab report ingestion & regex biomarker extraction
  it('8. PDF lab report upload extracts standard biomarkers and persists report', async () => {
    assert.ok(fs.existsSync(SAMPLE_PDF_PATH), 'Sample PDF fixture must exist');

    const res = await request(app)
      .post('/api/reports/upload')
      .set('Authorization', `Bearer ${patientAToken}`)
      .attach('report', SAMPLE_PDF_PATH);

    assert.equal(res.status, 201);
    assert.ok(res.body._id);
    assert.equal(res.body.sourceType, 'upload');

    // Verify extracted biomarkers from fixture: Glucose: 105.5, Hb: 13.2, WBC: 7100, Creatinine: 1.1, Platelets: 240000
    const dbUpload = await MedicalReport.findById(res.body._id);
    assert.ok(dbUpload);
    assert.equal(dbUpload.parameters.get('glucose_fasting').value, 105.5);
    assert.equal(dbUpload.parameters.get('hemoglobin').value, 13.2);
    assert.equal(dbUpload.parameters.get('wbc_count').value, 7100);
    assert.equal(dbUpload.parameters.get('creatinine').value, 1.1);
    assert.equal(dbUpload.parameters.get('platelets').value, 240000);
  });

  // 9. Malformed / unsupported input fails safely
  it('9. Malformed input fails safely without corrupting database', async () => {
    // Empty body
    const emptyRes = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${patientAToken}`)
      .send({});
    assert.equal(emptyRes.status, 400);
    assert.equal(emptyRes.body.error.code, 'MISSING_PARAMETERS');

    // Upload with non-PDF text file
    const invalidFileRes = await request(app)
      .post('/api/reports/upload')
      .set('Authorization', `Bearer ${patientAToken}`)
      .attach('report', Buffer.from('NOT A PDF FILE AT ALL'), 'fake.pdf');
    assert.equal(invalidFileRes.status, 400);
    assert.equal(invalidFileRes.body.error.code, 'PDF_PARSE_ERROR');
  });

  // 10. Longitudinal report history preserves multiple reports
  it('10. Report history preserves multiple reports chronologically', async () => {
    const res = await request(app)
      .get('/api/reports')
      .set('Authorization', `Bearer ${patientAToken}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 2, 'Should contain both manual and uploaded reports');
    // Ensure all returned reports belong strictly to Patient A
    for (const r of res.body) {
      assert.equal(r.userId, patientAUser.id);
    }
  });

  // 11. Biomarker trend analytics calculation works
  it('11. Longitudinal biomarker trend analytics returns normalized data for Recharts', async () => {
    const res = await request(app)
      .get('/api/reports/trends/analytics')
      .set('Authorization', `Bearer ${patientAToken}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 2);

    const firstEntry = res.body[0];
    assert.ok(firstEntry.date);
    assert.ok(firstEntry.glucose_fasting !== undefined);
    assert.ok(firstEntry.glucose_fasting_norm !== undefined);
    assert.ok(firstEntry.details.glucose_fasting);
  });

  // 12. What-If Simulation works and saves ChatHistory
  it('12. What-If Health Simulator answers physiological questions and persists chat history', async () => {
    const sessionId = 'test-session-alice-123';

    const askRes = await request(app)
      .post('/api/patient/whatif/ask')
      .set('Authorization', `Bearer ${patientAToken}`)
      .send({
        sessionId,
        question: 'What if I start running and reduce dietary sugar?'
      });

    assert.equal(askRes.status, 200);
    assert.ok(askRes.body.message);
    assert.ok(askRes.body.message.includes('glucose') || askRes.body.message.includes('biomarker') || askRes.body.message.includes('Disclaimer'));

    // Check history persistence
    const histRes = await request(app)
      .get(`/api/patient/whatif/history/${sessionId}`)
      .set('Authorization', `Bearer ${patientAToken}`);

    assert.equal(histRes.status, 200);
    assert.ok(Array.isArray(histRes.body.messages));
    assert.equal(histRes.body.messages.length, 2);
    assert.equal(histRes.body.messages[0].role, 'user');
    assert.equal(histRes.body.messages[1].role, 'assistant');
  });
});
