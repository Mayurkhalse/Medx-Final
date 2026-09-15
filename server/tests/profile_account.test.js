import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Patient } from '../src/models/Patient.js';
import { Doctor } from '../src/models/Doctor.js';

const TEST_DB_URI = 'mongodb://localhost:27017/medx_unified_test';

describe('Med-X Final — Profile Management & Safe Account Deactivation Suite', () => {
  let patientToken = '';
  let doctorToken = '';
  let patientUserId = '';

  const testPatient = {
    name: 'Profile Test Patient',
    email: 'profile.patient@example.com',
    password: 'SecurePassword123!',
    role: 'patient',
    phone: '+15550001111'
  };

  const testDoctor = {
    name: 'Dr. Profile Test',
    email: 'profile.doctor@example.com',
    password: 'SecurePassword123!',
    role: 'doctor',
    specialty: 'Neurology'
  };

  before(async () => {
    await connectDB({ uri: TEST_DB_URI, throwOnly: true });

    // Clean test accounts
    await User.deleteMany({ email: { $in: [testPatient.email, testDoctor.email] } });

    // Register test patient
    const pRes = await request(app)
      .post('/api/auth/register')
      .send(testPatient);
    assert.equal(pRes.status, 201);
    patientToken = pRes.body.token;
    patientUserId = pRes.body.user.id;

    // Register test doctor
    const dRes = await request(app)
      .post('/api/auth/register')
      .send(testDoctor);
    assert.equal(dRes.status, 201);
    doctorToken = dRes.body.token;
  });

  after(async () => {
    await User.deleteMany({ email: { $in: [testPatient.email, testDoctor.email] } });
    await disconnectDB();
  });

  it('1. Authenticated Patient can view current profile via GET /api/auth/me', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${patientToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, testPatient.email);
    assert.equal(res.body.user.role, 'patient');
    assert.ok(res.body.profile);
  });

  it('2. Authenticated Patient can update profile fields via PUT /api/auth/profile', async () => {
    const updatePayload = {
      name: 'Updated Patient Name',
      phone: '+15559998888',
      bloodGroup: 'O+',
      emergencyContact: 'Jane Doe (+15551234567)',
      address: '123 Health Ave, City'
    };

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${patientToken}`)
      .send(updatePayload);

    assert.equal(res.status, 200);
    assert.equal(res.body.user.name, 'Updated Patient Name');
    assert.equal(res.body.user.phone, '+15559998888');
    assert.equal(res.body.profile.bloodGroup, 'O+');
    assert.equal(res.body.profile.emergencyContact, 'Jane Doe (+15551234567)');
    assert.equal(res.body.profile.address, '123 Health Ave, City');

    // Verify persisted directly in MongoDB
    const dbUser = await User.findById(patientUserId);
    assert.equal(dbUser.name, 'Updated Patient Name');
    const dbPatient = await Patient.findOne({ userId: patientUserId });
    assert.equal(dbPatient.bloodGroup, 'O+');
  });

  it('3. User cannot escalate privileges or modify role through PUT /api/auth/profile', async () => {
    const maliciousPayload = {
      name: 'Hacker Attempt',
      role: 'hospital_admin',
      id: 'malicious-id'
    };

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${patientToken}`)
      .send(maliciousPayload);

    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, 'patient'); // strictly untouched
    assert.equal(res.body.user.name, 'Hacker Attempt');
  });

  it('4. Authenticated Doctor can update clinical profile via PUT /api/auth/profile', async () => {
    const doctorPayload = {
      name: 'Dr. Gregory House Updated',
      specialty: 'Interventional Cardiology',
      qualifications: 'MD, FACC, PhD',
      experienceYears: 18,
      consultationFee: 250
    };

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(doctorPayload);

    assert.equal(res.status, 200);
    assert.equal(res.body.user.name, 'Dr. Gregory House Updated');
    assert.equal(res.body.profile.specialty, 'Interventional Cardiology');
    assert.equal(res.body.profile.qualification, 'MD, FACC, PhD');
    assert.equal(res.body.profile.experienceYears, 18);
    assert.equal(res.body.profile.consultationFee, 250);
  });

  it('5. Delete Account rejects requests without explicit confirmation phrase', async () => {
    const res = await request(app)
      .post('/api/auth/delete-account')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ confirmation: 'WRONG' });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'CONFIRMATION_REQUIRED');
  });

  it('6. Delete Account deactivates user safely when confirmed with DELETE', async () => {
    const res = await request(app)
      .post('/api/auth/delete-account')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ confirmation: 'DELETE' });

    assert.equal(res.status, 200);
    assert.ok(res.body.message.includes('safely deactivated'));

    // Verify user marked isDeactivated in MongoDB
    const dbUser = await User.findById(patientUserId);
    assert.equal(dbUser.isDeactivated, true);
    assert.ok(dbUser.deactivatedAt);
  });

  it('7. Deactivated user token is rejected on subsequent requests (401)', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${patientToken}`);

    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'ACCOUNT_DEACTIVATED');
  });

  it('8. Deactivated user cannot log back in (403)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testPatient.email,
        password: testPatient.password
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'ACCOUNT_DEACTIVATED');
  });
});
