import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from './config/config.js';
import {
  User,
  Patient,
  Doctor,
  Hospital,
  Lab,
  MedicalReport,
  Appointment,
  Bed,
  CareTask,
  EmergencyAlert,
  Prescription,
  ChatHistory
} from './models/index.js';

export async function seedDatabase(options = {}) {
  const isSilent = options.silent || false;
  const log = (...args) => { if (!isSilent) console.log(...args); };

  log('====================================================');
  log('  MED-X UNIFIED SYSTEM — DATABASE SEEDING ENGINE');
  log('====================================================');

  const uri = options.uri || config.MONGODB_URI || 'mongodb://localhost:27017/medx_unified';
  
  if (mongoose.connection.readyState === 0) {
    log(`[DATABASE] Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri, { autoIndex: true });
    log('[DATABASE] Connected successfully.');
  }

  log('\n[1/10] Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Doctor.deleteMany({}),
    Hospital.deleteMany({}),
    Lab.deleteMany({}),
    MedicalReport.deleteMany({}),
    Appointment.deleteMany({}),
    Bed.deleteMany({}),
    CareTask.deleteMany({}),
    EmergencyAlert.deleteMany({}),
    Prescription.deleteMany({}),
    ChatHistory.deleteMany({})
  ]);
  log('✓ All collections reset cleanly.');

  // Pre-hashed default password for maximum efficiency: "Password123!"
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  // ==========================================
  // [2/10] SEEDING USERS
  // ==========================================
  log('\n[2/10] Creating canonical User identities...');
  const usersToCreate = [
    // 1. Hospital Admin
    {
      name: 'Admin Med-X Hospital',
      email: 'hospital@medx.org',
      password: passwordHash,
      role: 'hospital_admin',
      phone: '+91 22 2456 7890'
    },
    // 2. Attending Physicians / Doctors
    {
      name: 'Dr. Sarah Jenkins',
      email: 'doctor@medx.org',
      password: passwordHash,
      role: 'doctor',
      phone: '+91 98112 34567'
    },
    {
      name: 'Dr. Rajesh Sharma',
      email: 'dr.rajesh@medx.org',
      password: passwordHash,
      role: 'doctor',
      phone: '+91 98112 34568'
    },
    {
      name: 'Dr. Priya Desai',
      email: 'dr.priya@medx.org',
      password: passwordHash,
      role: 'doctor',
      phone: '+91 98112 34569'
    },
    {
      name: 'Dr. Vikram Malhotra',
      email: 'dr.vikram@medx.org',
      password: passwordHash,
      role: 'doctor',
      phone: '+91 98112 34570'
    },
    // 3. Laboratory Admin
    {
      name: 'Dr. Arthur Vance',
      email: 'lab@medx.org',
      password: passwordHash,
      role: 'lab_admin',
      phone: '+91 22 2456 9900'
    },
    // 4. Patients
    {
      name: 'John Doe',
      email: 'patient@medx.org',
      password: passwordHash,
      role: 'patient',
      phone: '+91 98112 00100'
    },
    {
      name: 'Emma Watson',
      email: 'emma.watson@medx.org',
      password: passwordHash,
      role: 'patient',
      phone: '+91 98112 00101'
    },
    {
      name: 'Robert Chen',
      email: 'robert.chen@medx.org',
      password: passwordHash,
      role: 'patient',
      phone: '+91 98112 00102'
    },
    {
      name: 'Sarah Miller',
      email: 'sarah.miller@medx.org',
      password: passwordHash,
      role: 'patient',
      phone: '+91 98112 00103'
    },
    {
      name: 'David Kumar',
      email: 'david.kumar@medx.org',
      password: passwordHash,
      role: 'patient',
      phone: '+91 98112 00104'
    }
  ];

  // Insert raw users with bypassed pre-save to utilize pre-hashed password
  const createdUsers = await User.insertMany(usersToCreate);
  const userMap = {};
  createdUsers.forEach(u => { userMap[u.email] = u; });
  log(`✓ Created ${createdUsers.length} users.`);

  // ==========================================
  // [3/10] SEEDING HOSPITAL
  // ==========================================
  log('\n[3/10] Creating Hospital facility profile...');
  const hospital = await Hospital.create({
    userId: userMap['hospital@medx.org']._id,
    legacyId: 'HOSP-1001',
    code: 'HOSP-MEDX-01',
    facilityName: 'Med-X Metro Super Specialty Teaching Hospital',
    facilityType: 'Super Specialty',
    address: {
      street: '100 Health City Expressway, Bandra Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      zip: '400051',
      country: 'India'
    },
    phone: '+91 22 2456 7890',
    email: 'contact@medx-hospital.org',
    emergencyContact: '+91 22 2456 0911',
    totalBeds: 80,
    availableBeds: 52,
    icuBeds: 16,
    bedCapacity: {
      total: 80,
      occupied: 28,
      icuAvailable: 11
    },
    departments: [
      'Emergency & Trauma',
      'General Medicine',
      'Cardiology',
      'Endocrinology & Diabetology',
      'Intensive Care (ICU)',
      'Clinical Pathology & Diagnostics'
    ]
  });
  log(`✓ Created Hospital: "${hospital.facilityName}" (Code: ${hospital.code})`);

  // ==========================================
  // [4/10] SEEDING DOCTORS
  // ==========================================
  log('\n[4/10] Creating Doctor clinical profiles...');
  const doctorsData = [
    {
      userEmail: 'doctor@medx.org',
      legacyId: 'DOC-101',
      specialty: 'Diagnostic Medicine & Cardiology',
      qualification: 'MBBS, MD (Med), DM (Cardiology)',
      department: 'Cardiology',
      experienceYears: 14,
      consultationFee: 75,
      licenseNumber: 'MCI-CARD-78901',
      availabilityStatus: 'Available'
    },
    {
      userEmail: 'dr.rajesh@medx.org',
      legacyId: 'DOC-102',
      specialty: 'Internal & Preventive Medicine',
      qualification: 'MBBS, MD (General Medicine)',
      department: 'General Medicine',
      experienceYears: 11,
      consultationFee: 50,
      licenseNumber: 'MCI-GEN-45120',
      availabilityStatus: 'Available'
    },
    {
      userEmail: 'dr.priya@medx.org',
      legacyId: 'DOC-103',
      specialty: 'Endocrinology & Diabetology',
      qualification: 'MBBS, MD, MCh (Endocrinology)',
      department: 'Endocrinology & Diabetology',
      experienceYears: 9,
      consultationFee: 65,
      licenseNumber: 'MCI-ENDO-99213',
      availabilityStatus: 'Available'
    },
    {
      userEmail: 'dr.vikram@medx.org',
      legacyId: 'DOC-104',
      specialty: 'Pulmonology & Critical Care',
      qualification: 'MBBS, MD, FCCP (Critical Care)',
      department: 'Intensive Care (ICU)',
      experienceYears: 16,
      consultationFee: 80,
      licenseNumber: 'MCI-ICU-33120',
      availabilityStatus: 'In Consultation'
    }
  ];

  const doctorDocs = [];
  const doctorMap = {};
  for (const d of doctorsData) {
    const doc = await Doctor.create({
      userId: userMap[d.userEmail]._id,
      hospitalId: hospital._id,
      legacyId: d.legacyId,
      specialty: d.specialty,
      qualification: d.qualification,
      department: d.department,
      experienceYears: d.experienceYears,
      consultationFee: d.consultationFee,
      licenseNumber: d.licenseNumber,
      availabilityStatus: d.availabilityStatus
    });
    doctorDocs.push(doc);
    doctorMap[d.userEmail] = doc;
  }
  log(`✓ Created ${doctorDocs.length} Doctor profiles.`);

  // ==========================================
  // [5/10] SEEDING LABORATORY
  // ==========================================
  log('\n[5/10] Creating Diagnostic Laboratory profile...');
  const lab = await Lab.create({
    userId: userMap['lab@medx.org']._id,
    hospitalId: hospital._id,
    legacyId: 'LAB-101',
    code: 'LAB-MEDX-01',
    labName: 'Med-X Advanced Diagnostic Pathology & Molecular Labs',
    licenseNumber: 'NABL-MEDX-PATH-2026-90',
    accreditation: 'NABL & CAP Certified (ISO 15189 Quality Standards)',
    phone: '+91 22 2456 9900',
    email: 'diagnostics@medx-labs.org',
    contactPerson: 'Dr. Arthur Vance, Lab Director',
    turnaroundHours: 4,
    address: 'Wing C, Diagnostic Annex, Med-X Health Campus, Mumbai'
  });
  log(`✓ Created Laboratory: "${lab.labName}"`);

  // ==========================================
  // [6/10] SEEDING PATIENTS
  // ==========================================
  log('\n[6/10] Creating Patient health dossiers...');
  const patientsData = [
    {
      email: 'patient@medx.org',
      legacyId: 'PAT-1001',
      gender: 'Male',
      dateOfBirth: new Date('1984-06-15'),
      bloodGroup: 'O+',
      primaryDoctor: 'doctor@medx.org',
      status: 'Active',
      currentCondition: 'Impaired Fasting Glucose & Mild Hypertension Review',
      vitalSigns: { bloodPressure: '128/82 mmHg', heartRate: '72 bpm', temperature: '98.4 F', spo2: '98%' },
      allergies: ['Penicillin', 'Sulfa Drugs'],
      medicalHistory: ['Hypertension (Stage 1)', 'Mild Hyperlipidemia']
    },
    {
      email: 'emma.watson@medx.org',
      legacyId: 'PAT-1002',
      gender: 'Female',
      dateOfBirth: new Date('1997-04-15'),
      bloodGroup: 'A+',
      primaryDoctor: 'dr.rajesh@medx.org',
      status: 'Active',
      currentCondition: 'Iron Deficiency Anemia & Fatigue Follow-up',
      vitalSigns: { bloodPressure: '112/74 mmHg', heartRate: '78 bpm', temperature: '98.6 F', spo2: '99%' },
      allergies: ['Shellfish'],
      medicalHistory: ['Microcytic Anemia']
    },
    {
      email: 'robert.chen@medx.org',
      legacyId: 'PAT-1003',
      gender: 'Male',
      dateOfBirth: new Date('1968-11-20'),
      bloodGroup: 'B+',
      primaryDoctor: 'dr.priya@medx.org',
      status: 'Critical',
      currentCondition: 'Type 2 Diabetes & Mild Renal Filtration Strain',
      vitalSigns: { bloodPressure: '142/90 mmHg', heartRate: '84 bpm', temperature: '99.1 F', spo2: '96%' },
      allergies: ['Aspirin'],
      medicalHistory: ['Type 2 Diabetes Mellitus', 'Chronic Kidney Disease (Stage 2)']
    },
    {
      email: 'sarah.miller@medx.org',
      legacyId: 'PAT-1004',
      gender: 'Female',
      dateOfBirth: new Date('1992-09-08'),
      bloodGroup: 'O-',
      primaryDoctor: 'dr.rajesh@medx.org',
      status: 'Active',
      currentCondition: 'Annual Wellness Screening & Lipid Check',
      vitalSigns: { bloodPressure: '118/76 mmHg', heartRate: '70 bpm', temperature: '98.4 F', spo2: '99%' },
      allergies: [],
      medicalHistory: ['Routine Health Maintenance']
    },
    {
      email: 'david.kumar@medx.org',
      legacyId: 'PAT-1005',
      gender: 'Male',
      dateOfBirth: new Date('1979-02-14'),
      bloodGroup: 'AB+',
      primaryDoctor: 'dr.vikram@medx.org',
      status: 'Waiting',
      currentCondition: 'Chronic Respiratory Review & Leukocyte Elevation',
      vitalSigns: { bloodPressure: '130/85 mmHg', heartRate: '88 bpm', temperature: '99.5 F', spo2: '95%' },
      allergies: ['Dust', 'Pollen'],
      medicalHistory: ['Bronchial Asthma']
    }
  ];

  const patientDocs = [];
  const patientMap = {};
  for (const p of patientsData) {
    const pat = await Patient.create({
      userId: userMap[p.email]._id,
      hospitalId: hospital._id,
      primaryDoctorId: doctorMap[p.primaryDoctor]._id,
      legacyId: p.legacyId,
      gender: p.gender,
      dateOfBirth: p.dateOfBirth,
      bloodGroup: p.bloodGroup,
      status: p.status,
      currentCondition: p.currentCondition,
      vitalSigns: p.vitalSigns,
      allergies: p.allergies,
      medicalHistory: p.medicalHistory,
      address: '100 Marine Drive, Bandra West, Mumbai, Maharashtra 400050'
    });
    patientDocs.push(pat);
    patientMap[p.email] = pat;
  }
  log(`✓ Created ${patientDocs.length} Patient dossiers.`);

  // ==========================================
  // [7/10] SEEDING DIAGNOSTIC MEDICAL REPORTS
  // ==========================================
  log('\n[7/10] Ingesting longitudinal diagnostic lab reports...');
  const johnUser = userMap['patient@medx.org'];
  const johnPat = patientMap['patient@medx.org'];

  const reportsToCreate = [
    // John Doe Report 1 (3 Months Ago - Elevated Glucose)
    {
      reportId: 'RPT-1001',
      userId: johnUser._id,
      patientId: johnPat._id,
      hospitalId: hospital._id,
      labId: lab._id,
      labName: lab.labName,
      reportName: 'Comprehensive Blood Chemistry Panel (Initial)',
      reportType: 'Complete Blood Count (CBC)',
      sourceType: 'manual',
      reportDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      parameters: {
        glucose_fasting: { value: 135, unit: 'mg/dL', ref_range: '70-100', status: 'High' },
        hemoglobin: { value: 12.4, unit: 'g/dL', ref_range: '12-17', status: 'Normal' },
        wbc_count: { value: 7400, unit: '/uL', ref_range: '4000-11000', status: 'Normal' },
        creatinine: { value: 1.05, unit: 'mg/dL', ref_range: '0.6-1.3', status: 'Normal' },
        platelets: { value: 285000, unit: '/uL', ref_range: '150000-450000', status: 'Normal' }
      },
      mlResult: {
        overallRiskScore: 48,
        riskTier: 'Moderate',
        diseaseRisks: { anemia: 0.15, diabetes: 0.62, kidney_dysfunction: 0.12, infection: 0.14, cardiovascular: 0.38 },
        modelVersion: 'v1.0.0'
      },
      reviewStatus: 'Reviewed',
      reviewedBy: doctorMap['doctor@medx.org']._id,
      reviewedAt: new Date(Date.now() - 88 * 24 * 60 * 60 * 1000),
      clinicalFindings: 'Fasting glucose elevated at 135 mg/dL. Recommended dietary lifestyle changes and 30-day glycemic re-evaluation.'
    },
    // John Doe Report 2 (1 Month Ago - Improving)
    {
      reportId: 'RPT-1002',
      userId: johnUser._id,
      patientId: johnPat._id,
      hospitalId: hospital._id,
      labId: lab._id,
      labName: lab.labName,
      reportName: 'Follow-up Metabolic & Glycemic Monitoring Panel',
      reportType: 'Metabolic Panel',
      sourceType: 'manual',
      reportDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      parameters: {
        glucose_fasting: { value: 118, unit: 'mg/dL', ref_range: '70-100', status: 'High' },
        hemoglobin: { value: 13.2, unit: 'g/dL', ref_range: '12-17', status: 'Normal' },
        wbc_count: { value: 6800, unit: '/uL', ref_range: '4000-11000', status: 'Normal' },
        creatinine: { value: 0.98, unit: 'mg/dL', ref_range: '0.6-1.3', status: 'Normal' },
        platelets: { value: 275000, unit: '/uL', ref_range: '150000-450000', status: 'Normal' }
      },
      mlResult: {
        overallRiskScore: 34,
        riskTier: 'Moderate',
        diseaseRisks: { anemia: 0.11, diabetes: 0.36, kidney_dysfunction: 0.09, infection: 0.12, cardiovascular: 0.24 },
        modelVersion: 'v1.0.0'
      },
      reviewStatus: 'Reviewed',
      reviewedBy: doctorMap['doctor@medx.org']._id,
      reviewedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
      clinicalFindings: 'Positive response to lifestyle modifications. Fasting glucose decreased to 118 mg/dL.'
    },
    // John Doe Report 3 (Last Week - Near Optimal)
    {
      reportId: 'RPT-1003',
      userId: johnUser._id,
      patientId: johnPat._id,
      hospitalId: hospital._id,
      labId: lab._id,
      labName: lab.labName,
      reportName: 'Latest Longitudinal Health Profile',
      reportType: 'Complete Blood Count (CBC)',
      sourceType: 'manual',
      reportDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      parameters: {
        glucose_fasting: { value: 102, unit: 'mg/dL', ref_range: '70-100', status: 'Borderline' },
        hemoglobin: { value: 14.1, unit: 'g/dL', ref_range: '12-17', status: 'Normal' },
        wbc_count: { value: 6500, unit: '/uL', ref_range: '4000-11000', status: 'Normal' },
        creatinine: { value: 0.94, unit: 'mg/dL', ref_range: '0.6-1.3', status: 'Normal' },
        platelets: { value: 295000, unit: '/uL', ref_range: '150000-450000', status: 'Normal' }
      },
      mlResult: {
        overallRiskScore: 22,
        riskTier: 'Low',
        diseaseRisks: { anemia: 0.08, diabetes: 0.18, kidney_dysfunction: 0.07, infection: 0.09, cardiovascular: 0.15 },
        modelVersion: 'v1.0.0'
      },
      reviewStatus: 'Pending Review',
      clinicalFindings: ''
    },
    // Emma Watson Report (Anemia Profile)
    {
      reportId: 'RPT-1004',
      userId: userMap['emma.watson@medx.org']._id,
      patientId: patientMap['emma.watson@medx.org']._id,
      hospitalId: hospital._id,
      labId: lab._id,
      labName: lab.labName,
      reportName: 'Complete Hemogram & Iron Profile',
      reportType: 'Hematology Panel',
      sourceType: 'manual',
      reportDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      parameters: {
        glucose_fasting: { value: 88, unit: 'mg/dL', ref_range: '70-100', status: 'Normal' },
        hemoglobin: { value: 10.2, unit: 'g/dL', ref_range: '12-17', status: 'Low' },
        wbc_count: { value: 5900, unit: '/uL', ref_range: '4000-11000', status: 'Normal' },
        creatinine: { value: 0.82, unit: 'mg/dL', ref_range: '0.6-1.3', status: 'Normal' },
        platelets: { value: 240000, unit: '/uL', ref_range: '150000-450000', status: 'Normal' }
      },
      mlResult: {
        overallRiskScore: 42,
        riskTier: 'Moderate',
        diseaseRisks: { anemia: 0.72, diabetes: 0.09, kidney_dysfunction: 0.06, infection: 0.11, cardiovascular: 0.14 },
        modelVersion: 'v1.0.0'
      },
      reviewStatus: 'Reviewed',
      reviewedBy: doctorMap['dr.rajesh@medx.org']._id,
      clinicalFindings: 'Microcytic anemia confirmed. Prescribed oral iron supplementation with Vitamin C.'
    },
    // Robert Chen Report (Critical Diabetes & Kidney Strain)
    {
      reportId: 'RPT-1005',
      userId: userMap['robert.chen@medx.org']._id,
      patientId: patientMap['robert.chen@medx.org']._id,
      hospitalId: hospital._id,
      labId: lab._id,
      labName: lab.labName,
      reportName: 'Renal & Glycemic Diagnostic Battery',
      reportType: 'Comprehensive Metabolic Panel',
      sourceType: 'manual',
      reportDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      parameters: {
        glucose_fasting: { value: 168, unit: 'mg/dL', ref_range: '70-100', status: 'Critical' },
        hemoglobin: { value: 13.5, unit: 'g/dL', ref_range: '12-17', status: 'Normal' },
        wbc_count: { value: 9200, unit: '/uL', ref_range: '4000-11000', status: 'Normal' },
        creatinine: { value: 1.58, unit: 'mg/dL', ref_range: '0.6-1.3', status: 'High' },
        platelets: { value: 260000, unit: '/uL', ref_range: '150000-450000', status: 'Normal' }
      },
      mlResult: {
        overallRiskScore: 78,
        riskTier: 'Critical',
        diseaseRisks: { anemia: 0.12, diabetes: 0.88, kidney_dysfunction: 0.74, infection: 0.28, cardiovascular: 0.65 },
        modelVersion: 'v1.0.0'
      },
      reviewStatus: 'Pending Review',
      clinicalFindings: ''
    }
  ];

  const createdReports = await MedicalReport.insertMany(reportsToCreate);
  log(`✓ Ingested ${createdReports.length} diagnostic medical reports.`);

  // ==========================================
  // [8/10] SEEDING APPOINTMENTS
  // ==========================================
  log('\n[8/10] Scheduling realistic clinical appointments...');
  const appointmentsToCreate = [
    // 1. IN CONSULTATION (Inside Cabin) - Robert Chen with Dr. Sarah Jenkins
    {
      legacyId: 'APT-1001',
      patientId: patientMap['robert.chen@medx.org']._id,
      doctorId: doctorMap['doctor@medx.org']._id,
      hospitalId: hospital._id,
      appointmentDate: new Date(),
      timeSlot: '09:30 AM',
      type: 'In-Person',
      status: 'In-Consultation',
      consultationStartedAt: new Date(Date.now() - 12 * 60 * 1000),
      reason: 'Acute Chest Discomfort & Tachycardia Investigation',
      notes: 'Patient currently inside Cabin 1 with Dr. Sarah Jenkins.'
    },
    // 2. WAITING OUTSIDE (Token #1) - Sarah Miller with Dr. Sarah Jenkins
    {
      legacyId: 'APT-1002',
      patientId: patientMap['sarah.miller@medx.org']._id,
      doctorId: doctorMap['doctor@medx.org']._id,
      hospitalId: hospital._id,
      appointmentDate: new Date(),
      timeSlot: '10:00 AM',
      type: 'In-Person',
      status: 'Waiting',
      queueToken: 1,
      arrivedAt: new Date(Date.now() - 18 * 60 * 1000),
      reason: 'Annual Preventive Health Panel & Lipid Follow-up',
      notes: 'Patient checked in at reception desk. Waiting in Outpatient Lobby A.'
    },
    // 3. UPCOMING TODAY - John Doe with Dr. Sarah Jenkins
    {
      legacyId: 'APT-1003',
      patientId: patientMap['patient@medx.org']._id,
      doctorId: doctorMap['doctor@medx.org']._id,
      hospitalId: hospital._id,
      appointmentDate: new Date(),
      timeSlot: '11:15 AM',
      type: 'In-Person',
      status: 'Confirmed',
      reason: 'Longitudinal Biomarker Review & Cardiovascular Check',
      notes: 'Upcoming appointment. Fasting lab reports ready.'
    },
    // 4. WAITING OUTSIDE - Emma Watson with Dr. Rajesh Sharma
    {
      legacyId: 'APT-1004',
      patientId: patientMap['emma.watson@medx.org']._id,
      doctorId: doctorMap['dr.rajesh@medx.org']._id,
      hospitalId: hospital._id,
      appointmentDate: new Date(),
      timeSlot: '10:30 AM',
      type: 'In-Person',
      status: 'Waiting',
      queueToken: 2,
      arrivedAt: new Date(Date.now() - 9 * 60 * 1000),
      reason: 'Microcytic Anemia & Dietary Iron Prescription Consultation',
      notes: 'Waiting outside in Outpatient Waiting Area.'
    },
    // 5. UPCOMING - David Kumar with Dr. Vikram Malhotra
    {
      legacyId: 'APT-1005',
      patientId: patientMap['david.kumar@medx.org']._id,
      doctorId: doctorMap['dr.vikram@medx.org']._id,
      hospitalId: hospital._id,
      appointmentDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      timeSlot: '02:00 PM',
      type: 'In-Person',
      status: 'Scheduled',
      reason: 'Asthma Management & Pulmonary Spirometry Assessment',
      notes: 'Follow-up scheduled.'
    },
    // 6. COMPLETED - John Doe with Dr. Rajesh Sharma
    {
      legacyId: 'APT-1006',
      patientId: patientMap['patient@medx.org']._id,
      doctorId: doctorMap['dr.rajesh@medx.org']._id,
      hospitalId: hospital._id,
      appointmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      timeSlot: '09:00 AM',
      type: 'Follow-up',
      status: 'Completed',
      consultationEndedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      reason: 'General Outpatient Blood Pressure Follow-up',
      notes: 'Prescription issued. Vital signs normalized.'
    }
  ];

  const createdAppointments = await Appointment.insertMany(appointmentsToCreate);
  log(`✓ Created ${createdAppointments.length} cross-linked appointments.`);

  // ==========================================
  // [9/10] SEEDING BEDS, CARE QUEUE & PRESCRIPTIONS
  // ==========================================
  log('\n[9/10] Initializing Bed Matrix, Care Queue, and Prescriptions...');

  // Prescriptions
  await Prescription.create([
    {
      prescriptionId: 'RX-1001',
      prescriptionNumber: 'RX-MEDX-9941',
      patientId: patientMap['patient@medx.org']._id,
      userId: userMap['patient@medx.org']._id,
      doctorId: doctorMap['doctor@medx.org']._id,
      doctorName: 'Dr. Sarah Jenkins',
      hospitalId: hospital._id,
      diagnosis: 'Impaired Fasting Glucose & Dyslipidemia Risk',
      medicines: [
        { name: 'Metformin Hydrochloride', dosage: '500 mg', frequency: '1-0-1', duration: '30 Days', route: 'Oral', instructions: 'Take with main meals' },
        { name: 'Atorvastatin Calcium', dosage: '10 mg', frequency: '0-0-1', duration: '30 Days', route: 'Oral', instructions: 'Take at bedtime' }
      ],
      clinicalAdvice: 'Maintain 30 minutes of aerobic activity daily. Limit refined carbohydrates and carbonated beverages.'
    },
    {
      prescriptionId: 'RX-1002',
      prescriptionNumber: 'RX-MEDX-9942',
      patientId: patientMap['emma.watson@medx.org']._id,
      userId: userMap['emma.watson@medx.org']._id,
      doctorId: doctorMap['dr.rajesh@medx.org']._id,
      doctorName: 'Dr. Rajesh Sharma',
      hospitalId: hospital._id,
      diagnosis: 'Microcytic Hypochromic Anemia',
      medicines: [
        { name: 'Ferrous Ascorbate + Folic Acid', dosage: '100 mg / 1.5 mg', frequency: '1-0-0', duration: '60 Days', route: 'Oral', instructions: 'Take on empty stomach with citrus juice' },
        { name: 'Vitamin C (Ascorbic Acid)', dosage: '500 mg', frequency: '1-0-0', duration: '30 Days', route: 'Oral', instructions: 'Supports iron absorption' }
      ],
      clinicalAdvice: 'Incorporate dark leafy greens, lentils, and citrus fruits. Repeat CBC test in 6 weeks.'
    }
  ]);

  // Beds (12 beds across General, ICU, Emergency, and Cardiology wards)
  const bedsData = [
    { bedNumber: 'GEN-101', ward: 'General', roomNumber: '101', bedType: 'General', status: 'Occupied', patientId: patientMap['patient@medx.org']._id, assignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { bedNumber: 'GEN-102', ward: 'General', roomNumber: '101', bedType: 'General', status: 'Available' },
    { bedNumber: 'GEN-103', ward: 'General', roomNumber: '102', bedType: 'General', status: 'Available' },
    { bedNumber: 'GEN-104', ward: 'General', roomNumber: '102', bedType: 'General', status: 'Maintenance', notes: 'Scheduled for biometric sensor replacement' },
    { bedNumber: 'ICU-201', ward: 'Intensive Care', roomNumber: 'ICU-A', bedType: 'ICU', status: 'Occupied', patientId: patientMap['robert.chen@medx.org']._id, assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { bedNumber: 'ICU-202', ward: 'Intensive Care', roomNumber: 'ICU-A', bedType: 'ICU', status: 'Available' },
    { bedNumber: 'ICU-203', ward: 'Intensive Care', roomNumber: 'ICU-B', bedType: 'ICU', status: 'Available' },
    { bedNumber: 'EMG-001', ward: 'Emergency', roomNumber: 'ER-Bay 1', bedType: 'Emergency', status: 'Occupied', patientId: patientMap['david.kumar@medx.org']._id, assignedAt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
    { bedNumber: 'EMG-002', ward: 'Emergency', roomNumber: 'ER-Bay 2', bedType: 'Emergency', status: 'Available' },
    { bedNumber: 'CARD-301', ward: 'Cardiology', roomNumber: '301', bedType: 'Semi-Private', status: 'Available' },
    { bedNumber: 'CARD-302', ward: 'Cardiology', roomNumber: '302', bedType: 'Private', status: 'Available' }
  ];

  await Bed.insertMany(bedsData.map(b => ({ ...b, hospitalId: hospital._id })));

  // Care Queue Tasks across 6 stages
  await CareTask.create([
    {
      hospitalId: hospital._id,
      patientId: patientMap['david.kumar@medx.org']._id,
      category: 'New Patients',
      title: 'Emergency Intake & Triage - David Kumar',
      reason: 'Acute respiratory shortness of breath. Triage stage evaluation required.',
      priority: 'High',
      assignedDoctorId: doctorMap['dr.vikram@medx.org']._id,
      status: 'Active',
      time: '15 mins ago'
    },
    {
      hospitalId: hospital._id,
      patientId: patientMap['patient@medx.org']._id,
      category: 'Reports Pending Review',
      title: 'Review Longitudinal Panel RPT-1003 - John Doe',
      reason: 'Latest follow-up blood report logged. Physician review required.',
      priority: 'Medium',
      assignedDoctorId: doctorMap['doctor@medx.org']._id,
      status: 'Active',
      time: '1 hour ago'
    },
    {
      hospitalId: hospital._id,
      patientId: patientMap['robert.chen@medx.org']._id,
      category: 'Critical Alerts',
      title: 'Critical Glycemic Spike Warning - Robert Chen',
      reason: 'Fasting glucose 168 mg/dL + Creatinine 1.58 mg/dL. Nephrology/Endocrine consult mandated.',
      priority: 'Critical',
      assignedDoctorId: doctorMap['dr.priya@medx.org']._id,
      status: 'Active',
      time: '3 hours ago'
    },
    {
      hospitalId: hospital._id,
      patientId: patientMap['emma.watson@medx.org']._id,
      category: 'Doctor Assignment Pending',
      title: 'Assign Hematology Specialist - Emma Watson',
      reason: 'Ferritin & Reticulocyte sub-panel requested by attending team.',
      priority: 'Medium',
      assignedDoctorId: null,
      status: 'Active',
      time: '4 hours ago'
    },
    {
      hospitalId: hospital._id,
      patientId: patientMap['sarah.miller@medx.org']._id,
      category: 'Follow-up Required',
      title: 'Schedule Annual Diagnostic Retest - Sarah Miller',
      reason: 'Routine outpatient health surveillance milestone.',
      priority: 'Routine',
      assignedDoctorId: doctorMap['dr.rajesh@medx.org']._id,
      status: 'Active',
      time: '1 day ago'
    },
    {
      hospitalId: hospital._id,
      patientId: patientMap['patient@medx.org']._id,
      category: 'Completed',
      title: 'Discharge Summary Finalized - John Doe',
      reason: 'Outpatient consultation completed with signed digital prescription.',
      priority: 'Routine',
      assignedDoctorId: doctorMap['doctor@medx.org']._id,
      status: 'Completed',
      time: '2 days ago'
    }
  ]);

  log('✓ Initialized Beds, Care Queue, and Clinical Prescriptions.');

  // ==========================================
  // [10/10] EMERGENCY SOS & CHAT SIMULATIONS
  // ==========================================
  log('\n[10/10] Seeding Emergency SOS alerts and What-If AI histories...');

  await EmergencyAlert.create([
    {
      alertId: 'SOS-2026-001',
      patientId: userMap['robert.chen@medx.org']._id,
      patientProfileId: patientMap['robert.chen@medx.org']._id,
      patientName: 'Robert Chen',
      age: 58,
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '+91 98112 00102',
      hospitalId: hospital._id,
      doctorId: doctorMap['dr.priya@medx.org']._id,
      status: 'ACTIVE',
      reason: 'Severe chest tightness and acute dizziness reported',
      triggerReason: 'Patient triggered Emergency SOS: Acute physiological distress',
      alertType: 'Emergency SOS Distress Signal',
      location: {
        latitude: 19.0760,
        longitude: 72.8777,
        address: 'Bandra West, Mumbai (GPS Verified)',
        coordinatesText: '19.0760° N, 72.8777° E'
      }
    },
    {
      alertId: 'SOS-2026-002',
      patientId: userMap['patient@medx.org']._id,
      patientProfileId: patientMap['patient@medx.org']._id,
      patientName: 'John Doe',
      age: 42,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+91 98112 00100',
      hospitalId: hospital._id,
      doctorId: doctorMap['doctor@medx.org']._id,
      status: 'IN_PROGRESS',
      reason: 'Rapid escalation: Systolic pressure > 165 mmHg',
      triggerReason: 'Emergency SOS Signal Dispatch',
      dispatchStatus: 'Rapid Response Medical Squad En Route',
      acknowledgedBy: doctorMap['doctor@medx.org']._id,
      acknowledgedAt: new Date(Date.now() - 10 * 60 * 1000),
      dispatchedAt: new Date(Date.now() - 5 * 60 * 1000),
      location: {
        latitude: 19.0825,
        longitude: 72.8812,
        address: 'BKC Avenue 4, Metro City',
        coordinatesText: '19.0825° N, 72.8812° E'
      }
    },
    {
      alertId: 'SOS-2026-003',
      patientId: userMap['emma.watson@medx.org']._id,
      patientProfileId: patientMap['emma.watson@medx.org']._id,
      patientName: 'Emma Watson',
      age: 29,
      gender: 'Female',
      bloodGroup: 'A+',
      phone: '+91 98112 00101',
      hospitalId: hospital._id,
      status: 'RESOLVED',
      reason: 'Severe lightheadedness and acute fatigue',
      resolutionNotes: 'Patient attended by campus clinic. Oral fluids and vitals stabilized.',
      resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ]);

  // Seed interactive What-If history for John Doe
  await ChatHistory.create({
    userId: userMap['patient@medx.org']._id,
    sessionId: 'session_demo_seed',
    messages: [
      {
        role: 'user',
        content: 'What if I commit to a 30-minute brisk walk every morning?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        role: 'assistant',
        content: 'Based on your latest recorded laboratory biomarkers: A brisk 30-minute daily walk can increase insulin sensitivity and lower fasting glucose by approximately 15-25 mg/dL over 4-6 weeks, bringing your current glucose (102 mg/dL) safely into the optimal baseline range.\n\nDisclaimer: This simulation provides predictive physiological interpretations. Consult your physician before changing medication or diet.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1000)
      }
    ]
  });

  log('✓ Seeded Emergency SOS records and What-If AI interactive chat history.');

  log('\n====================================================');
  log('  DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  log('====================================================');
  log('\n🔑 Quick Login Credentials (Password for all: Password123!):');
  log('----------------------------------------------------');
  log('• Patient:       patient@medx.org       (John Doe)');
  log('• Patient 2:     emma.watson@medx.org   (Emma Watson)');
  log('• Patient 3:     robert.chen@medx.org   (Robert Chen - Critical)');
  log('• Doctor:        doctor@medx.org        (Dr. Sarah Jenkins - Cardiology)');
  log('• Doctor 2:      dr.rajesh@medx.org     (Dr. Rajesh Sharma - Internal Med)');
  log('• Doctor 3:      dr.priya@medx.org      (Dr. Priya Desai - Endocrinology)');
  log('• Hospital Admin: hospital@medx.org     (Admin Med-X Hospital)');
  log('• Lab Admin:     lab@medx.org           (Dr. Arthur Vance - Lab Specialist)');
  log('====================================================\n');

  return { success: true };
}

// Allow direct CLI execution: node src/seed.js
const isDirectExecution = process.argv[1] && (process.argv[1].endsWith('src\\seed.js') || process.argv[1].endsWith('src/seed.js'));
if (isDirectExecution) {
  seedDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('[FATAL SEED ERROR]', err);
      process.exit(1);
    });
}

export default seedDatabase;
