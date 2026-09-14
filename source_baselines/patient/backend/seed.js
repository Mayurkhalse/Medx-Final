const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Hospital = require('./models/Hospital');
const Doctor = require('./models/Doctor');
const Department = require('./models/Department');
const Report = require('./models/Report');
const CareQueueItem = require('./models/CareQueueItem');
const Appointment = require('./models/Appointment');
const Message = require('./models/Message');
const EmergencySOS = require('./models/EmergencySOS');
const ChatHistory = require('./models/ChatHistory');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medx';

async function seed(disconnectAfter = true) {
  try {
    if (mongoose.connection.readyState === 0) {
      console.log(`Connecting to MongoDB at: ${MONGO_URI}...`);
      await mongoose.connect(MONGO_URI);
      console.log('MongoDB connected successfully.');
    }
    console.log('Clearing existing collections...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Hospital.deleteMany({}),
      Doctor.deleteMany({}),
      Department.deleteMany({}),
      Report.deleteMany({}),
      CareQueueItem.deleteMany({}),
      Appointment.deleteMany({}),
      Message.deleteMany({}),
      EmergencySOS.deleteMany({}),
      ChatHistory.deleteMany({})
    ]);
    console.log('Collections cleared.');

    // Common password hash for all demo users: "password123"
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // ==========================================
    // 1. CREATE HOSPITAL ADMIN & HOSPITAL
    // ==========================================
    console.log('Seeding Hospital Administrator & Facility...');
    const adminUser = await User.create({
      name: 'Arthur Vance',
      email: 'hospital@medx.com',
      passwordHash: passwordHash,
      role: 'hospital_admin'
    });

    const hospital = await Hospital.create({
      name: 'Metro General Health Center',
      address: '450 Lexington Avenue, New York, NY 10017, USA',
      contactPhone: '+1 (555) 888-0100',
      contactEmail: 'hospital@medx.com',
      adminUserId: adminUser._id,
      doctorCount: 3,
      patientCount: 3
    });

    adminUser.profileId = hospital._id;
    adminUser.profileModel = 'Hospital';
    adminUser.hospitalId = hospital._id;
    await adminUser.save();

    // ==========================================
    // 2. CREATE DOCTORS & DEPARTMENTS
    // ==========================================
    console.log('Seeding Doctors and Medical Departments...');
    
    // Doctor 1: Cardiologist (Primary demo doctor)
    const docUser1 = await User.create({
      name: 'Sarah Mitchell',
      email: 'doctor@medx.com',
      passwordHash: passwordHash,
      role: 'doctor',
      hospitalId: hospital._id
    });

    const doctor1 = await Doctor.create({
      userId: docUser1._id,
      hospitalId: hospital._id,
      specialty: 'Cardiology',
      licenseNumber: 'MD-CARD-77382',
      availability: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '13:00' },
        { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '16:00' }
      ],
      active: true
    });

    docUser1.profileId = doctor1._id;
    docUser1.profileModel = 'Doctor';
    await docUser1.save();

    // Doctor 2: Endocrinologist
    const docUser2 = await User.create({
      name: 'James Reynolds',
      email: 'jreynolds@medx.com',
      passwordHash: passwordHash,
      role: 'doctor',
      hospitalId: hospital._id
    });

    const doctor2 = await Doctor.create({
      userId: docUser2._id,
      hospitalId: hospital._id,
      specialty: 'Endocrinology',
      licenseNumber: 'MD-ENDO-44910',
      availability: [
        { dayOfWeek: 1, startTime: '08:30', endTime: '16:30' },
        { dayOfWeek: 2, startTime: '08:30', endTime: '16:30' },
        { dayOfWeek: 4, startTime: '08:30', endTime: '16:30' }
      ],
      active: true
    });

    docUser2.profileId = doctor2._id;
    docUser2.profileModel = 'Doctor';
    await docUser2.save();

    // Doctor 3: Nephrologist
    const docUser3 = await User.create({
      name: 'Elena Rostova',
      email: 'erostova@medx.com',
      passwordHash: passwordHash,
      role: 'doctor',
      hospitalId: hospital._id
    });

    const doctor3 = await Doctor.create({
      userId: docUser3._id,
      hospitalId: hospital._id,
      specialty: 'Nephrology',
      licenseNumber: 'MD-NEPH-61803',
      availability: [
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }
      ],
      active: true
    });

    docUser3.profileId = doctor3._id;
    docUser3.profileModel = 'Doctor';
    await docUser3.save();

    // Create Departments
    const deptCardio = await Department.create({
      hospitalId: hospital._id,
      name: 'Cardiology',
      headDoctorId: doctor1._id,
      capacity: 50,
      activeStaffCount: 12
    });

    const deptEndo = await Department.create({
      hospitalId: hospital._id,
      name: 'Endocrinology & Diabetes',
      headDoctorId: doctor2._id,
      capacity: 30,
      activeStaffCount: 8
    });

    const deptNeph = await Department.create({
      hospitalId: hospital._id,
      name: 'Nephrology & Renal Care',
      headDoctorId: doctor3._id,
      capacity: 35,
      activeStaffCount: 10
    });

    const deptEmergency = await Department.create({
      hospitalId: hospital._id,
      name: 'Emergency & Acute Trauma',
      headDoctorId: null,
      capacity: 40,
      activeStaffCount: 18
    });

    hospital.departments = [deptCardio._id, deptEndo._id, deptNeph._id, deptEmergency._id];
    await hospital.save();

    doctor1.departmentId = deptCardio._id;
    await doctor1.save();
    doctor2.departmentId = deptEndo._id;
    await doctor2.save();
    doctor3.departmentId = deptNeph._id;
    await doctor3.save();

    // ==========================================
    // 3. CREATE PATIENTS
    // ==========================================
    console.log('Seeding Patients...');

    // Patient 1: Primary Demo Patient (Marcus Chen)
    const patient1 = await User.create({
      name: 'Marcus Chen',
      email: 'patient@medx.com',
      passwordHash: passwordHash,
      role: 'patient',
      dob: new Date('1988-06-14'),
      gender: 'Male',
      hospitalId: hospital._id,
      assignedDoctorId: doctor1._id
    });

    // Patient 2: Eleanor Davis (Diabetic)
    const patient2 = await User.create({
      name: 'Eleanor Davis',
      email: 'edavis@patient.medx.com',
      passwordHash: passwordHash,
      role: 'patient',
      dob: new Date('1965-03-21'),
      gender: 'Female',
      hospitalId: hospital._id,
      assignedDoctorId: doctor2._id
    });

    // Patient 3: Robert Taylor (Renal Impairment)
    const patient3 = await User.create({
      name: 'Robert Taylor',
      email: 'rtaylor@patient.medx.com',
      passwordHash: passwordHash,
      role: 'patient',
      dob: new Date('1972-11-09'),
      gender: 'Male',
      hospitalId: hospital._id,
      assignedDoctorId: doctor3._id
    });

    doctor1.assignedPatients = [patient1._id];
    await doctor1.save();
    doctor2.assignedPatients = [patient2._id];
    await doctor2.save();
    doctor3.assignedPatients = [patient3._id];
    await doctor3.save();

    // ==========================================
    // 4. CREATE CLINICAL LAB REPORTS
    // ==========================================
    console.log('Seeding Clinical Lab Reports & Risk Scores...');

    // Report 1 for Marcus Chen (Baseline - 2 weeks ago)
    const report1 = await Report.create({
      userId: patient1._id,
      sourceType: 'manual',
      reportDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      parameters: {
        glucose_fasting: { value: 92, unit: 'mg/dL', ref_range: '70-100' },
        hemoglobin: { value: 9.8, unit: 'g/dL', ref_range: '13.5-17.5' },
        wbc_count: { value: 7100, unit: '/uL', ref_range: '4000-11000' },
        creatinine: { value: 0.9, unit: 'mg/dL', ref_range: '0.6-1.2' },
        platelets: { value: 240000, unit: '/uL', ref_range: '150000-450000' }
      },
      mlResult: {
        flags: {
          glucose_fasting: 'normal',
          hemoglobin: 'low',
          wbc_count: 'normal',
          creatinine: 'normal',
          platelets: 'normal'
        },
        diseaseRisks: {
          anemia: 0.88,
          diabetes: 0.04,
          kidney_dysfunction: 0.02,
          infection: 0.01
        },
        overallRiskScore: 42,
        riskTier: 'Moderate',
        modelVersion: 'v1.0.0'
      }
    });

    // Report 2 for Marcus Chen (Recent Follow-up - Yesterday)
    const report2 = await Report.create({
      userId: patient1._id,
      sourceType: 'manual',
      reportDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      parameters: {
        glucose_fasting: { value: 90, unit: 'mg/dL', ref_range: '70-100' },
        hemoglobin: { value: 11.2, unit: 'g/dL', ref_range: '13.5-17.5' },
        wbc_count: { value: 6800, unit: '/uL', ref_range: '4000-11000' },
        creatinine: { value: 0.88, unit: 'mg/dL', ref_range: '0.6-1.2' },
        platelets: { value: 265000, unit: '/uL', ref_range: '150000-450000' }
      },
      mlResult: {
        flags: {
          glucose_fasting: 'normal',
          hemoglobin: 'low',
          wbc_count: 'normal',
          creatinine: 'normal',
          platelets: 'normal'
        },
        diseaseRisks: {
          anemia: 0.52,
          diabetes: 0.02,
          kidney_dysfunction: 0.01,
          infection: 0.01
        },
        overallRiskScore: 28,
        riskTier: 'Low',
        modelVersion: 'v1.0.0'
      }
    });

    // Critical Diabetic Report for Eleanor Davis
    const report3 = await Report.create({
      userId: patient2._id,
      sourceType: 'manual',
      reportDate: new Date(),
      parameters: {
        glucose_fasting: { value: 245, unit: 'mg/dL', ref_range: '70-100' },
        hemoglobin: { value: 13.5, unit: 'g/dL', ref_range: '12.0-15.5' },
        wbc_count: { value: 8900, unit: '/uL', ref_range: '4000-11000' },
        creatinine: { value: 1.1, unit: 'mg/dL', ref_range: '0.6-1.2' },
        platelets: { value: 220000, unit: '/uL', ref_range: '150000-450000' }
      },
      mlResult: {
        flags: {
          glucose_fasting: 'critical_high',
          hemoglobin: 'normal',
          wbc_count: 'normal',
          creatinine: 'normal',
          platelets: 'normal'
        },
        diseaseRisks: {
          anemia: 0.02,
          diabetes: 0.99,
          kidney_dysfunction: 0.15,
          infection: 0.05
        },
        overallRiskScore: 88,
        riskTier: 'Critical',
        modelVersion: 'v1.0.0'
      }
    });

    // Renal Impairment Report for Robert Taylor
    const report4 = await Report.create({
      userId: patient3._id,
      sourceType: 'manual',
      reportDate: new Date(),
      parameters: {
        glucose_fasting: { value: 108, unit: 'mg/dL', ref_range: '70-100' },
        hemoglobin: { value: 11.5, unit: 'g/dL', ref_range: '13.5-17.5' },
        wbc_count: { value: 9200, unit: '/uL', ref_range: '4000-11000' },
        creatinine: { value: 3.4, unit: 'mg/dL', ref_range: '0.6-1.2' },
        platelets: { value: 185000, unit: '/uL', ref_range: '150000-450000' }
      },
      mlResult: {
        flags: {
          glucose_fasting: 'high',
          hemoglobin: 'low',
          wbc_count: 'normal',
          creatinine: 'critical_high',
          platelets: 'normal'
        },
        diseaseRisks: {
          anemia: 0.45,
          diabetes: 0.28,
          kidney_dysfunction: 0.99,
          infection: 0.06
        },
        overallRiskScore: 92,
        riskTier: 'Critical',
        modelVersion: 'v1.0.0'
      }
    });

    // ==========================================
    // 5. SEED CARE QUEUE (TRIAGE)
    // ==========================================
    console.log('Seeding Hospital Care Queue...');
    await CareQueueItem.create([
      {
        hospitalId: hospital._id,
        patientId: patient2._id,
        reportId: report3._id,
        riskTier: 'Critical',
        status: 'pending',
        assignedDoctorId: doctor2._id
      },
      {
        hospitalId: hospital._id,
        patientId: patient3._id,
        reportId: report4._id,
        riskTier: 'Critical',
        status: 'in_review',
        assignedDoctorId: doctor3._id
      }
    ]);

    // ==========================================
    // 6. SEED APPOINTMENTS
    // ==========================================
    console.log('Seeding Consultations & Appointments...');
    await Appointment.create([
      {
        patientId: patient1._id,
        doctorId: doctor1._id,
        hospitalId: hospital._id,
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
        status: 'confirmed',
        reason: 'Hemoglobin recovery review & iron supplementation check',
        notes: 'Bring previous complete blood count panels.'
      },
      {
        patientId: patient2._id,
        doctorId: doctor2._id,
        hospitalId: hospital._id,
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // In 1 day
        status: 'confirmed',
        reason: 'Urgent glucose stabilization & insulin protocol adjustment',
        notes: 'Fasting state required.'
      }
    ]);

    // ==========================================
    // 7. SEED DIRECT CLINICAL MESSAGES
    // ==========================================
    console.log('Seeding Secure Messages...');
    const convId = `${patient1._id}_${docUser1._id}`;
    await Message.create([
      {
        conversationId: convId,
        senderId: patient1._id,
        receiverId: docUser1._id,
        content: 'Good morning Dr. Mitchell, I received my latest lab results. My hemoglobin improved to 11.2, but I still feel mild fatigue in the evenings.',
        readAt: new Date()
      },
      {
        conversationId: convId,
        senderId: docUser1._id,
        receiverId: patient1._id,
        content: 'Hi Marcus! That is substantial progress from your baseline of 9.8. Continue the iron supplementation and stay well hydrated. We will review during our appointment.',
        readAt: null
      }
    ]);

    // ==========================================
    // 8. SEED EMERGENCY SOS
    // ==========================================
    console.log('Seeding Emergency SOS...');
    await EmergencySOS.create({
      patientId: patient2._id,
      doctorId: doctor2._id,
      hospitalId: hospital._id,
      status: 'open',
      triggerReason: 'Patient triggered Emergency SOS from portal dashboard: Acute hyperglycemia confusion'
    });

    // ==========================================
    // 9. SEED WHAT-IF ASSISTANT CHAT HISTORY
    // ==========================================
    console.log('Seeding What-If Assistant Chat History...');
    await ChatHistory.create({
      userId: patient1._id,
      sessionId: `session_${patient1._id}_default`,
      messages: [
        {
          role: 'user',
          content: 'What happens to my risk score if my hemoglobin increases from 11.2 to 14.0 g/dL through iron supplementation?'
        },
        {
          role: 'assistant',
          content: 'If your Hemoglobin increases to 14.0 g/dL (well within the healthy adult male reference range of 13.5–17.5 g/dL):\n\n1. **Anemia Probability**: Drops from 52% down to **< 3%**.\n2. **Composite Risk Score**: Decreases from 28 (Low) to an optimal **10 (Optimal Baseline)**.\n3. **Physiological Impact**: Significantly enhanced arterial oxygen delivery, improved endurance, and resolution of chronic fatigue.\n\n*Clinical Recommendation*: Maintain regular iron-rich dietary intake and avoid taking calcium supplements concurrently with iron to maximize intestinal absorption.'
        }
      ]
    });

    console.log('\n======================================================');
    console.log('  MEDX HEALTH INTELLIGENCE DATABASE SEEDED SUCCESSFULLY');
    console.log('======================================================');
    console.log('\n--- DEMO LOGIN CREDENTIALS ---');
    console.log('1. PATIENT PORTAL:');
    console.log('   Email:    patient@medx.com');
    console.log('   Password: password123');
    console.log('   Features: Marcus Chen, 2 longitudinal lab reports with trends, What-If simulation chat history.');
    console.log('\n2. HOSPITAL ADMIN PORTAL:');
    console.log('   Email:    hospital@medx.com');
    console.log('   Password: password123');
    console.log('   Features: Metro General Hospital, 4 departments, 3 doctors, care queue, critical alerts.');
    console.log('\n3. DOCTOR PORTAL:');
    console.log('   Email:    doctor@medx.com');
    console.log('   Password: password123');
    console.log('   Features: Dr. Sarah Mitchell (Cardiology), assigned patients, schedule, appointments, SOS.\n');

    if (disconnectAfter) {
      await mongoose.disconnect();
      console.log('MongoDB connection closed.');
      process.exit(0);
    }
  } catch (error) {
    console.error('Seeding failed with error:', error);
    if (disconnectAfter && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      process.exit(1);
    }
    throw error;
  }
}

if (require.main === module) {
  seed(true);
}

module.exports = { seed };
