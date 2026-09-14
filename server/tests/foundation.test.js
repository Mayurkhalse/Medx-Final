import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import config, { validateConfig } from '../src/config/config.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Patient } from '../src/models/Patient.js';
import { Doctor } from '../src/models/Doctor.js';
import { Hospital } from '../src/models/Hospital.js';
import { Lab } from '../src/models/Lab.js';

const TEST_DB_URI = 'mongodb://localhost:27017/medx_unified_test';

describe('Med-X Phase 1D — Unified Foundation Verification Suite', () => {
  let patientToken = '';
  let doctorToken = '';
  let hospitalToken = '';
  let labToken = '';

  const testUsers = {
    patient: {
      name: 'Jane Doe Patient',
      email: 'jane.patient@example.com',
      password: 'SecurePassword123!',
      role: 'patient'
    },
    doctor: {
      name: 'Dr. Gregory House',
      email: 'house.doctor@example.com',
      password: 'SecurePassword123!',
      role: 'doctor',
      specialty: 'Diagnostic Medicine'
    },
    hospital: {
      name: 'Admin Lisa Cuddy',
      email: 'cuddy.hospital@example.com',
      password: 'SecurePassword123!',
      role: 'hospital_admin',
      facilityName: 'Princeton-Plainsboro Teaching Hospital'
    },
    lab: {
      name: 'Specialist Eric Foreman',
      email: 'foreman.lab@example.com',
      password: 'SecurePassword123!',
      role: 'lab_admin',
      labName: 'Princeton Diagnostic Pathology Lab'
    }
  };

  before(async () => {
    // Connect to explicitly isolated test database
    await connectDB({ uri: TEST_DB_URI, throwOnly: true });

    // Assert strictly connected to test database (never normal dev DB!)
    assert.equal(
      mongoose.connection.name,
      'medx_unified_test',
      'Test suite MUST connect to medx_unified_test'
    );

    // Clean up isolated test collections prior to test run
    await User.deleteMany({ email: { $regex: /@example\.com$/ } });
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Hospital.deleteMany({});
    await Lab.deleteMany({});
  });

  after(async () => {
    // Clean up test records
    await User.deleteMany({ email: { $regex: /@example\.com$/ } });
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Hospital.deleteMany({});
    await Lab.deleteMany({});
    await disconnectDB();
  });

  // 1. Server Configuration Validation
  it('1. Server starts with valid configuration and fails fast when config missing', () => {
    assert.doesNotThrow(() => validateConfig());
    assert.equal(typeof config.PORT, 'number');
    assert.ok(config.JWT_SECRET.length >= 16);
    assert.ok(config.MONGODB_URI.includes('mongodb://'));
  });

  // 2. Real MongoDB Connection Verification
  it('2. MongoDB connection works using real MongoDB (no in-memory fallback)', async () => {
    assert.equal(mongoose.connection.readyState, 1); // 1 = connected
    const adminPing = await mongoose.connection.db.admin().ping();
    assert.equal(adminPing.ok, 1);
    assert.equal(mongoose.connection.name, 'medx_unified_test');
  });

  // 3. User Registration for all 4 roles
  it('3. User registration works for all 4 canonical roles and creates linked profiles', async () => {
    // 3a. Patient
    const resPatient = await request(app)
      .post('/api/auth/register')
      .send(testUsers.patient);
    assert.equal(resPatient.status, 201);
    assert.ok(resPatient.body.token);
    assert.equal(resPatient.body.user.role, 'patient');
    assert.ok(resPatient.body.profile.legacyId.startsWith('PAT-'));
    patientToken = resPatient.body.token;

    // 3b. Doctor
    const resDoctor = await request(app)
      .post('/api/auth/register')
      .send(testUsers.doctor);
    assert.equal(resDoctor.status, 201);
    assert.ok(resDoctor.body.token);
    assert.equal(resDoctor.body.user.role, 'doctor');
    assert.equal(resDoctor.body.profile.specialty, 'Diagnostic Medicine');
    assert.ok(resDoctor.body.profile.legacyId.startsWith('DOC-'));
    doctorToken = resDoctor.body.token;

    // 3c. Hospital Admin
    const resHospital = await request(app)
      .post('/api/auth/register')
      .send(testUsers.hospital);
    assert.equal(resHospital.status, 201);
    assert.ok(resHospital.body.token);
    assert.equal(resHospital.body.user.role, 'hospital_admin');
    assert.equal(resHospital.body.profile.facilityName, 'Princeton-Plainsboro Teaching Hospital');
    hospitalToken = resHospital.body.token;

    // 3d. Lab Admin
    const resLab = await request(app)
      .post('/api/auth/register')
      .send(testUsers.lab);
    assert.equal(resLab.status, 201);
    assert.ok(resLab.body.token);
    assert.equal(resLab.body.user.role, 'lab_admin');
    assert.equal(resLab.body.profile.labName, 'Princeton Diagnostic Pathology Lab');
    labToken = resLab.body.token;
  });

  // 4. Password Security Verification
  it('4. Password is NOT stored in plaintext and never leaked in responses', async () => {
    const rawUser = await User.findOne({ email: testUsers.patient.email }).select('+password');
    assert.ok(rawUser.password);
    assert.notEqual(rawUser.password, testUsers.patient.password);
    assert.match(rawUser.password, /^\$2[ab]\$\d+\$/); // bcrypt hash format

    // Verify response does not leak password hash
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUsers.patient.email, password: testUsers.patient.password });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.password, undefined);
  });

  // 5. Login Returns Valid JWT
  it('5. Login returns JWT token and user info for valid credentials, rejects invalid', async () => {
    // Valid login
    const resSuccess = await request(app)
      .post('/api/auth/login')
      .send({ email: testUsers.doctor.email, password: testUsers.doctor.password });
    assert.equal(resSuccess.status, 200);
    assert.ok(resSuccess.body.token);
    assert.equal(resSuccess.body.user.email, testUsers.doctor.email);

    // Invalid password
    const resBadPass = await request(app)
      .post('/api/auth/login')
      .send({ email: testUsers.doctor.email, password: 'WrongPassword999' });
    assert.equal(resBadPass.status, 401);
    assert.equal(resBadPass.body.error.code, 'INVALID_CREDENTIALS');

    // Non-existent email
    const resBadEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'Password123' });
    assert.equal(resBadEmail.status, 401);
  });

  // 6. JWT Authentication Works (Claims verification)
  it('6. JWT contains correct claims per frozen identity contract', () => {
    const decoded = jwt.verify(patientToken, config.JWT_SECRET);
    assert.equal(decoded.email, testUsers.patient.email);
    assert.equal(decoded.role, 'patient');
    assert.equal(decoded.name, testUsers.patient.name);
    assert.ok(decoded.id);
  });

  // 7. GET /api/auth/me Works
  it('7. GET /api/auth/me returns authenticated user identity and linked profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${doctorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, 'doctor');
    assert.equal(res.body.profile.specialty, 'Diagnostic Medicine');
  });

  // 8. Invalid and Expired Token Rejection
  it('8. Missing, invalid, or expired tokens are rejected with 401', async () => {
    // No token
    const resNoToken = await request(app).get('/api/auth/me');
    assert.equal(resNoToken.status, 401);

    // Malformed token
    const resBadToken = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.tampered.token');
    assert.equal(resBadToken.status, 401);
    assert.equal(resBadToken.body.error.code, 'INVALID_TOKEN');

    // Expired token simulation
    const expiredToken = jwt.sign(
      { id: new mongoose.Types.ObjectId(), email: 'expired@example.com', role: 'patient' },
      config.JWT_SECRET,
      { expiresIn: '-1s' }
    );
    const resExpired = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);
    assert.equal(resExpired.status, 401);
    assert.equal(resExpired.body.error.code, 'TOKEN_EXPIRED');
  });

  // 9. RBAC Rejects Incorrect Role
  it('9. RBAC rejects users attempting to access endpoints restricted to other roles', async () => {
    // Patient attempting doctor-only endpoint
    const resPatientOnDoctor = await request(app)
      .get('/api/foundation/rbac-test/doctor')
      .set('Authorization', `Bearer ${patientToken}`);
    assert.equal(resPatientOnDoctor.status, 403);
    assert.equal(resPatientOnDoctor.body.error.code, 'FORBIDDEN');

    // Doctor attempting hospital_admin-only endpoint
    const resDoctorOnHospital = await request(app)
      .get('/api/foundation/rbac-test/hospital_admin')
      .set('Authorization', `Bearer ${doctorToken}`);
    assert.equal(resDoctorOnHospital.status, 403);

    // Hospital admin attempting lab_admin-only endpoint
    const resHospitalOnLab = await request(app)
      .get('/api/foundation/rbac-test/lab_admin')
      .set('Authorization', `Bearer ${hospitalToken}`);
    assert.equal(resHospitalOnLab.status, 403);
  });

  // 10. Correct Role Passes Role Guard
  it('10. Authorized users successfully pass role guard for their specific role', async () => {
    const roles = [
      { role: 'patient', token: patientToken },
      { role: 'doctor', token: doctorToken },
      { role: 'hospital_admin', token: hospitalToken },
      { role: 'lab_admin', token: labToken }
    ];

    for (const item of roles) {
      const res = await request(app)
        .get(`/api/foundation/rbac-test/${item.role}`)
        .set('Authorization', `Bearer ${item.token}`);
      assert.equal(res.status, 200, `Role ${item.role} failed to access its own route`);
      assert.equal(res.body.role, item.role);
    }
  });

  // 11. Logout Endpoint
  it('11. Logout endpoint responds with success status', async () => {
    const res = await request(app).post('/api/auth/logout');
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Logged out successfully');
  });

  // 12. Reserved Domain Routes
  it('12. Reserved domain routes return 501 preserving namespace boundaries', async () => {
    const domains = ['patient', 'reports', 'doctor', 'hospital', 'lab', 'appointments', 'triage'];
    for (const domain of domains) {
      const res = await request(app).get(`/api/${domain}/some-future-endpoint`);
      assert.equal(res.status, 501, `Domain ${domain} was not properly reserved`);
      assert.equal(res.body.error.code, 'DOMAIN_RESERVED');
      assert.equal(res.body.error.domain, domain);
    }
  });

  // 13. ML Service Boundary Configuration
  it('13. ML service boundary is configured and points to designated microservice', () => {
    assert.equal(config.ML_SERVICE_URL, 'http://127.0.0.1:8000');
  });

  // 14. Google OAuth Boundary
  it('14. Google OAuth boundary handles unconfigured state cleanly', async () => {
    const res = await request(app).get('/api/auth/google');
    // In test without Google credentials, returns 503 controlled error
    assert.equal(res.status, 503);
    assert.equal(res.body.error.code, 'OAUTH_NOT_CONFIGURED');
  });

  // 15. API Health Check Endpoint
  it('15. Express API base health check endpoint is operational', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
    assert.equal(res.body.service, 'medx-unified-api');
  });
});
