import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Hospital } from '../models/Hospital.js';
import { Department } from '../models/Department.js';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { Lab } from '../models/Lab.js';
import { MedicalReport } from '../models/MedicalReport.js';
import { HealthAlert } from '../models/HealthAlert.js';
import { DoctorAssignment } from '../models/DoctorAssignment.js';
import { Appointment } from '../models/Appointment.js';
import { CareTask } from '../models/CareTask.js';
import { Notification } from '../models/Notification.js';

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await Department.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Lab.deleteMany({});
    await MedicalReport.deleteMany({});
    await HealthAlert.deleteMany({});
    await DoctorAssignment.deleteMany({});
    await Appointment.deleteMany({});
    await CareTask.deleteMany({});
    await Notification.deleteMany({});

    console.log('[Seed] Creating Hospital...');
    const hospital = await Hospital.create({
      name: 'Med-X City Multispecialty Hospital',
      code: 'MEDX-HOSP-01',
      phone: '+91 22 2456 7890',
      email: 'admin@medx-hospital.org',
      emergencyContact: '+91 22 2456 0911',
      address: {
        street: '104 Healthcare Boulevard, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400050',
        country: 'India',
      },
      operatingHours: '24/7 Emergency & Inpatient, OPD: 08:00 AM - 08:00 PM',
      bedCapacity: {
        total: 350,
        occupied: 218,
        icuAvailable: 14,
      },
      licenseNumber: 'MH-MEDX-HOSP-2026-8819',
    });

    console.log('[Seed] Creating Departments...');
    const deptGenMed = await Department.create({
      name: 'General Medicine',
      code: 'GEN-MED',
      description: 'Comprehensive adult medical evaluation and acute care coordination.',
      hospitalId: hospital._id,
      headDoctorName: 'Dr. Sonali Sen',
      color: '#1890ff',
      floor: 'Floor 1, Wing A',
    });

    const deptCardio = await Department.create({
      name: 'Cardiology',
      code: 'CARDIO',
      description: 'Advanced cardiovascular diagnosis, preventive heart care & rehabilitation.',
      hospitalId: hospital._id,
      headDoctorName: 'Dr. Priyanka Sharma',
      color: '#eb2f96',
      floor: 'Floor 2, Wing B',
    });

    const deptDiab = await Department.create({
      name: 'Diabetology & Endocrinology',
      code: 'DIAB-ENDO',
      description: 'Metabolic disorders, glycemic management & endocrine profiling.',
      hospitalId: hospital._id,
      headDoctorName: 'Dr. Rahul Verma',
      color: '#722ed1',
      floor: 'Floor 1, Wing C',
    });

    const deptPath = await Department.create({
      name: 'Pathology & Diagnostics',
      code: 'PATH-LAB',
      description: 'Automated molecular diagnostics, clinical biochemistry & hematology.',
      hospitalId: hospital._id,
      headDoctorName: 'Dr. Arvind Joshi',
      color: '#52c41a',
      floor: 'Ground Floor, Wing D',
    });

    const deptEmerg = await Department.create({
      name: 'Emergency & Trauma Care',
      code: 'EMERG-CARE',
      description: '24/7 Level 1 Trauma, resuscitation & acute stabilization unit.',
      hospitalId: hospital._id,
      headDoctorName: 'Dr. Meera Patel',
      color: '#f5222d',
      floor: 'Ground Floor, Emergency Gate',
    });

    console.log('[Seed] Creating Laboratories...');
    const labCentral = await Lab.create({
      name: 'Med-X Central Diagnostics Lab',
      code: 'LAB-MEDX-01',
      hospitalId: hospital._id,
      contact: {
        phone: '+91 22 2456 7888',
        email: 'reports@medxlabs.org',
        address: 'Ground Floor, Wing D, Med-X City Hospital',
      },
      accreditation: 'NABL & CAP Certified (ISO 15189)',
      turnaroundHours: 3,
    });

    const labCity = await Lab.create({
      name: 'City Pathology & Reference Labs',
      code: 'LAB-CITY-02',
      hospitalId: hospital._id,
      contact: {
        phone: '+91 22 2654 3321',
        email: 'info@citypathology.com',
        address: '42 Medical Enclave, Mumbai',
      },
      accreditation: 'NABL Accredited',
      turnaroundHours: 6,
    });

    console.log('[Seed] Creating Doctors...');
    const drSonali = await Doctor.create({
      hospitalId: hospital._id,
      departmentId: deptGenMed._id,
      name: 'Dr. Sonali Sen',
      specialization: 'Internal Medicine & Critical Care',
      qualification: 'MBBS, MD (Medicine), MRCP',
      experienceYears: 12,
      email: 'dr.sonali@medx.com',
      phone: '+91 98201 11223',
      availabilityStatus: 'Available',
      todayPatientsCount: 18,
      pendingReviewsCount: 5,
      roomNumber: 'OPD-101',
      rating: 4.9,
    });

    const drPriyanka = await Doctor.create({
      hospitalId: hospital._id,
      departmentId: deptCardio._id,
      name: 'Dr. Priyanka Sharma',
      specialization: 'Interventional Cardiology',
      qualification: 'MBBS, MD, DM (Cardiology)',
      experienceYears: 10,
      email: 'dr.priyanka@medx.com',
      phone: '+91 98202 22334',
      availabilityStatus: 'Busy',
      todayPatientsCount: 14,
      pendingReviewsCount: 2,
      roomNumber: 'CARD-205',
      rating: 4.8,
    });

    const drRahul = await Doctor.create({
      hospitalId: hospital._id,
      departmentId: deptDiab._id,
      name: 'Dr. Rahul Verma',
      specialization: 'Consultant Diabetologist & Endocrinologist',
      qualification: 'MBBS, MD, Fellowship in Diabetology',
      experienceYears: 8,
      email: 'dr.rahul@medx.com',
      phone: '+91 98203 33445',
      availabilityStatus: 'Available',
      todayPatientsCount: 16,
      pendingReviewsCount: 4,
      roomNumber: 'DIAB-108',
      rating: 4.7,
    });

    const drArvind = await Doctor.create({
      hospitalId: hospital._id,
      departmentId: deptPath._id,
      name: 'Dr. Arvind Joshi',
      specialization: 'Clinical Pathology & Hematology',
      qualification: 'MBBS, MD (Pathology)',
      experienceYears: 14,
      email: 'dr.arvind@medx.com',
      phone: '+91 98204 44556',
      availabilityStatus: 'Available',
      todayPatientsCount: 22,
      pendingReviewsCount: 8,
      roomNumber: 'PATH-012',
      rating: 4.9,
    });

    const drMeera = await Doctor.create({
      hospitalId: hospital._id,
      departmentId: deptEmerg._id,
      name: 'Dr. Meera Patel',
      specialization: 'Emergency & Trauma Medicine',
      qualification: 'MBBS, MD (Emergency Medicine)',
      experienceYears: 9,
      email: 'dr.meera@medx.com',
      phone: '+91 98205 55667',
      availabilityStatus: 'In Surgery',
      todayPatientsCount: 20,
      pendingReviewsCount: 3,
      roomNumber: 'EMERG-001',
      rating: 4.8,
    });

    console.log('[Seed] Creating Patients...');
    const patientMayur = await Patient.create({
      patientId: 'PT-1001',
      name: 'Mayur Deshmukh',
      age: 48,
      gender: 'Male',
      bloodGroup: 'B+',
      contact: '+91 98190 12345',
      email: 'mayur@medx.com',
      hospitalId: hospital._id,
      assignedDoctorId: drRahul._id,
      departmentId: deptDiab._id,
      emergencyContact: {
        name: 'Anita Deshmukh',
        relation: 'Spouse',
        phone: '+91 98190 99887',
      },
      address: {
        street: 'Flat 402, Sunshine Heights, Andheri East',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400069',
      },
      conditions: ['Type 2 Diabetes Mellitus', 'Essential Hypertension'],
      allergies: ['Penicillin', 'Sulfa drugs'],
      familyHistory: ['Maternal Type 2 Diabetes', 'Paternal CAD'],
      medicalNotes: 'Follow-up for elevated glycemic index and recurrent fatigue. Monitored on Metformin.',
      latestReportSummary: 'Elevated Fasting Blood Glucose (280 mg/dL) & HbA1c (9.4%). Critical review required.',
      alertStatus: 'Critical',
      reportStatus: 'Requires Review',
      vitals: {
        bloodPressure: '142/92',
        heartRate: 84,
        spO2: 98,
        temperature: 98.4,
        glucose: 280,
      },
    });

    const patientSana = await Patient.create({
      patientId: 'PT-1002',
      name: 'Sana Khan',
      age: 32,
      gender: 'Female',
      bloodGroup: 'A+',
      contact: '+91 98200 45678',
      email: 'sana@medx.com',
      hospitalId: hospital._id,
      assignedDoctorId: drSonali._id,
      departmentId: deptGenMed._id,
      emergencyContact: {
        name: 'Farhan Khan',
        relation: 'Brother',
        phone: '+91 98200 88776',
      },
      address: {
        street: '12 Green Park Villa, Bandra',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400050',
      },
      conditions: ['Microcytic Hypochromic Anemia'],
      allergies: ['Dust / Pollen'],
      familyHistory: ['None reported'],
      medicalNotes: 'Presented with generalized fatigue, pale conjunctiva and mild exertional dyspnea.',
      latestReportSummary: 'Low Hemoglobin (9.8 g/dL) & Low Serum Ferritin (14 ng/mL). Requires medical review.',
      alertStatus: 'Requires Review',
      reportStatus: 'Requires Review',
      vitals: {
        bloodPressure: '114/74',
        heartRate: 76,
        spO2: 99,
        temperature: 98.6,
        glucose: 92,
      },
    });

    const patientRahul = await Patient.create({
      patientId: 'PT-1003',
      name: 'Rahul Kulkarni',
      age: 55,
      gender: 'Male',
      bloodGroup: 'O+',
      contact: '+91 98330 34567',
      email: 'rahul.kulkarni@medx.com',
      hospitalId: hospital._id,
      assignedDoctorId: drPriyanka._id,
      departmentId: deptCardio._id,
      emergencyContact: {
        name: 'Neelam Kulkarni',
        relation: 'Spouse',
        phone: '+91 98330 99112',
      },
      address: {
        street: '503 Sea View Towers, Worli',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400018',
      },
      conditions: ['Coronary Artery Disease (Post-PCI 2024)', 'Dyslipidemia'],
      allergies: ['Aspirin sensitivity'],
      familyHistory: ['Premature CAD in father (age 50)'],
      medicalNotes: 'Routine post-stent cardiac evaluation. Lipid profile monitoring.',
      latestReportSummary: 'Elevated LDL Cholesterol (165 mg/dL). Triglycerides borderline elevated.',
      alertStatus: 'High',
      reportStatus: 'Requires Review',
      vitals: {
        bloodPressure: '138/88',
        heartRate: 68,
        spO2: 97,
        temperature: 98.6,
        glucose: 114,
      },
    });

    const patientAarav = await Patient.create({
      patientId: 'PT-1004',
      name: 'Aarav Mehta',
      age: 29,
      gender: 'Male',
      bloodGroup: 'O-',
      contact: '+91 98450 78901',
      email: 'aarav@medx.com',
      hospitalId: hospital._id,
      assignedDoctorId: drSonali._id,
      departmentId: deptGenMed._id,
      emergencyContact: {
        name: 'Ritu Mehta',
        relation: 'Mother',
        phone: '+91 98450 11223',
      },
      address: {
        street: 'B-21 Palm Grove, Powai',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400076',
      },
      conditions: ['None'],
      allergies: ['None known'],
      familyHistory: ['None known'],
      medicalNotes: 'Annual executive health screening. All baseline parameters within normal range.',
      latestReportSummary: 'Complete Blood Count & Liver Panel within normal reference ranges.',
      alertStatus: 'Normal',
      reportStatus: 'Reviewed',
      vitals: {
        bloodPressure: '118/78',
        heartRate: 70,
        spO2: 99,
        temperature: 98.4,
        glucose: 88,
      },
    });

    const patientPriya = await Patient.create({
      patientId: 'PT-1005',
      name: 'Priya Nambiar',
      age: 41,
      gender: 'Female',
      bloodGroup: 'AB+',
      contact: '+91 98670 65432',
      email: 'priya@medx.com',
      hospitalId: hospital._id,
      assignedDoctorId: drRahul._id,
      departmentId: deptDiab._id,
      emergencyContact: {
        name: 'Girish Nambiar',
        relation: 'Spouse',
        phone: '+91 98670 12998',
      },
      address: {
        street: '8th Floor, Silver Arch, Thane West',
        city: 'Thane',
        state: 'Maharashtra',
        zip: '400601',
      },
      conditions: ['Subclinical Hypothyroidism'],
      allergies: ['NSAIDs (Ibuprofen)'],
      familyHistory: ['Maternal Autoimmune Thyroiditis'],
      medicalNotes: 'Thyroid panel review. TSH monitored on Levothyroxine 50mcg.',
      latestReportSummary: 'Elevated TSH (6.8 uIU/mL). Normal Free T4. Requires dosage titration review.',
      alertStatus: 'High',
      reportStatus: 'Requires Review',
      vitals: {
        bloodPressure: '122/80',
        heartRate: 72,
        spO2: 98,
        temperature: 98.2,
        glucose: 102,
      },
    });

    console.log('[Seed] Creating Users...');
    // Hospital Admin User
    await User.create({
      name: 'Dr. Rajesh Nair (Admin)',
      email: 'admin@medx.com',
      password: 'admin123',
      role: 'hospital_admin',
      phone: '+91 98000 11111',
      hospitalId: hospital._id,
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    });

    // Doctor User
    await User.create({
      name: 'Dr. Sonali Sen',
      email: 'dr.sonali@medx.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+91 98201 11223',
      hospitalId: hospital._id,
      doctorId: drSonali._id,
      avatar: 'https://images.unsplash.com/photo-1594824813570-588d92994793?w=150&auto=format&fit=crop&q=80',
    });

    // Patient User
    await User.create({
      name: 'Mayur Deshmukh',
      email: 'mayur@medx.com',
      password: 'patient123',
      role: 'patient',
      phone: '+91 98190 12345',
      hospitalId: hospital._id,
      patientId: patientMayur._id,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    // Lab Admin User
    await User.create({
      name: 'Med-X Lab Supervisor',
      email: 'lab@medx.com',
      password: 'lab123',
      role: 'lab_admin',
      phone: '+91 98000 22222',
      hospitalId: hospital._id,
    });

    console.log('[Seed] Creating Medical Reports with Extracted Parameters & Non-Diagnostic AI Summaries...');
    // Report 1: Mayur's Critical Glucose Report
    const reportMayur = await MedicalReport.create({
      reportId: 'REP-2026-001',
      patientId: patientMayur._id,
      hospitalId: hospital._id,
      labId: labCentral._id,
      labName: 'Med-X Central Diagnostics Lab',
      reportName: 'Comprehensive Diabetic & Metabolic Profile',
      reportType: 'Blood Glucose / HbA1c',
      uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      parameters: [
        {
          name: 'Fasting Blood Glucose',
          value: 280,
          unit: 'mg/dL',
          referenceRange: '70 - 99 mg/dL (Fasting)',
          status: 'Critical',
          flagged: true,
        },
        {
          name: 'HbA1c (Glycated Hemoglobin)',
          value: 9.4,
          unit: '%',
          referenceRange: '< 5.7% (Normal), 5.7 - 6.4% (Prediabetes)',
          status: 'Critical',
          flagged: true,
        },
        {
          name: 'Post-Prandial Glucose (2hr)',
          value: 345,
          unit: 'mg/dL',
          referenceRange: '< 140 mg/dL',
          status: 'Critical',
          flagged: true,
        },
        {
          name: 'Serum Creatinine',
          value: 1.1,
          unit: 'mg/dL',
          referenceRange: '0.7 - 1.3 mg/dL',
          status: 'Normal',
          flagged: false,
        },
        {
          name: 'Estimated GFR (eGFR)',
          value: 88,
          unit: 'mL/min/1.73m²',
          referenceRange: '> 90 mL/min/1.73m²',
          status: 'Borderline',
          flagged: false,
        },
      ],
      extractionStatus: 'Processed',
      analysisStatus: 'Analysis Complete',
      reviewStatus: 'Requires Review',
      aiSummary: {
        summaryText:
          'AI-assisted parameters note marked elevation in Fasting Blood Glucose (280 mg/dL) and HbA1c (9.4%). Values exceed laboratory standard reference limits.',
        abnormalHighlights: [
          'Fasting Glucose: 280 mg/dL (Reference: 70-99 mg/dL) — Critical',
          'HbA1c: 9.4% (Reference: < 5.7%) — Critical',
          'Post-Prandial Glucose: 345 mg/dL (Reference: < 140 mg/dL) — Critical',
        ],
        trendObservations: [
          'Glucose has trended upward (+70 mg/dL) compared to previous baseline test in July 2026.',
        ],
        clinicalNotice:
          'AI-generated information for clinical decision support. Not a medical diagnosis. Final medical decisions remain with qualified doctors.',
      },
    });

    // Report 2: Sana's Anemia & CBC Report
    const reportSana = await MedicalReport.create({
      reportId: 'REP-2026-002',
      patientId: patientSana._id,
      hospitalId: hospital._id,
      labId: labCity._id,
      labName: 'City Pathology & Reference Labs',
      reportName: 'Complete Blood Count (CBC) & Iron Profile',
      reportType: 'Complete Blood Count (CBC)',
      uploadedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      parameters: [
        {
          name: 'Hemoglobin (Hb)',
          value: 9.8,
          unit: 'g/dL',
          referenceRange: '12.0 - 15.5 g/dL (Adult Female)',
          status: 'Low',
          flagged: true,
        },
        {
          name: 'RBC Count',
          value: 3.6,
          unit: 'million/mcL',
          referenceRange: '4.0 - 5.2 million/mcL',
          status: 'Low',
          flagged: true,
        },
        {
          name: 'Total Leucocyte Count (WBC)',
          value: 6800,
          unit: '/cumm',
          referenceRange: '4,500 - 11,000 /cumm',
          status: 'Normal',
          flagged: false,
        },
        {
          name: 'Platelet Count',
          value: 245000,
          unit: '/cumm',
          referenceRange: '150,000 - 450,000 /cumm',
          status: 'Normal',
          flagged: false,
        },
        {
          name: 'Serum Ferritin',
          value: 14,
          unit: 'ng/mL',
          referenceRange: '20 - 200 ng/mL',
          status: 'Low',
          flagged: true,
        },
      ],
      extractionStatus: 'Processed',
      analysisStatus: 'Analysis Complete',
      reviewStatus: 'Requires Review',
      aiSummary: {
        summaryText:
          'AI-assisted extraction shows decreased Hemoglobin (9.8 g/dL) and low Serum Ferritin (14 ng/mL). RBC parameters indicate hypochromic microcytic pattern.',
        abnormalHighlights: [
          'Hemoglobin: 9.8 g/dL (Reference: 12.0-15.5 g/dL) — Low',
          'Serum Ferritin: 14 ng/mL (Reference: 20-200 ng/mL) — Low',
        ],
        trendObservations: [
          'Hemoglobin decreased by 1.4 g/dL relative to last CBC recorded 3 months prior.',
        ],
        clinicalNotice:
          'AI-generated information for clinical decision support. Not a medical diagnosis. Discuss findings with attending physician.',
      },
    });

    // Report 3: Rahul Kulkarni Lipid Panel
    const reportRahul = await MedicalReport.create({
      reportId: 'REP-2026-003',
      patientId: patientRahul._id,
      hospitalId: hospital._id,
      labId: labCentral._id,
      labName: 'Med-X Central Diagnostics Lab',
      reportName: 'Standard Lipid Profile & Coronary Risk Markers',
      reportType: 'Lipid Profile',
      uploadedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      parameters: [
        {
          name: 'Total Cholesterol',
          value: 245,
          unit: 'mg/dL',
          referenceRange: '< 200 mg/dL',
          status: 'High',
          flagged: true,
        },
        {
          name: 'LDL Cholesterol',
          value: 165,
          unit: 'mg/dL',
          referenceRange: '< 100 mg/dL (Desirable for CAD: < 70)',
          status: 'High',
          flagged: true,
        },
        {
          name: 'HDL Cholesterol',
          value: 38,
          unit: 'mg/dL',
          referenceRange: '> 40 mg/dL (Male)',
          status: 'Low',
          flagged: true,
        },
        {
          name: 'Triglycerides',
          value: 210,
          unit: 'mg/dL',
          referenceRange: '< 150 mg/dL',
          status: 'High',
          flagged: true,
        },
      ],
      extractionStatus: 'Processed',
      analysisStatus: 'Analysis Complete',
      reviewStatus: 'Requires Review',
      aiSummary: {
        summaryText:
          'AI-assisted extraction notes elevated total cholesterol (245 mg/dL) and LDL (165 mg/dL) in a patient with recorded cardiovascular history.',
        abnormalHighlights: [
          'LDL Cholesterol: 165 mg/dL — High',
          'Triglycerides: 210 mg/dL — High',
          'HDL Cholesterol: 38 mg/dL — Low',
        ],
        trendObservations: ['Lipid fractions show mild upward variation over the last quarter.'],
        clinicalNotice:
          'AI-assisted information — not a medical diagnosis. Doctor clinical evaluation required.',
      },
    });

    // Report 4: Aarav's Normal Checkup
    await MedicalReport.create({
      reportId: 'REP-2026-004',
      patientId: patientAarav._id,
      hospitalId: hospital._id,
      labId: labCentral._id,
      labName: 'Med-X Central Diagnostics Lab',
      reportName: 'Annual Executive Health Panel',
      reportType: 'Complete Blood Count (CBC)',
      uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      parameters: [
        { name: 'Hemoglobin', value: 14.8, unit: 'g/dL', referenceRange: '13.5 - 17.5 g/dL', status: 'Normal' },
        { name: 'WBC Count', value: 7200, unit: '/cumm', referenceRange: '4,500 - 11,000 /cumm', status: 'Normal' },
        { name: 'Fasting Blood Sugar', value: 88, unit: 'mg/dL', referenceRange: '70 - 99 mg/dL', status: 'Normal' },
        { name: 'Total Cholesterol', value: 172, unit: 'mg/dL', referenceRange: '< 200 mg/dL', status: 'Normal' },
      ],
      extractionStatus: 'Processed',
      analysisStatus: 'Analysis Complete',
      reviewStatus: 'Reviewed',
      reviewedByDoctorId: drSonali._id,
      reviewedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      reviewNotes: 'All laboratory parameters optimal. Recommended regular exercise and annual review.',
      aiSummary: {
        summaryText: 'All extracted parameters fall well within standard laboratory reference limits.',
        abnormalHighlights: [],
        trendObservations: ['Stable baseline indicators.'],
        clinicalNotice: 'AI-assisted information for clinical support. Not a medical diagnosis.',
      },
    });

    console.log('[Seed] Creating Health Alerts...');
    // Alert 1: Mayur's Critical Glucose
    const alertMayur = await HealthAlert.create({
      patientId: patientMayur._id,
      hospitalId: hospital._id,
      reportId: reportMayur._id,
      reportName: reportMayur.reportName,
      parameter: 'Glucose (Fasting)',
      value: '280 mg/dL',
      referenceRange: '70 - 99 mg/dL (Configured Lab Range)',
      severity: 'Critical',
      status: 'Requires Review',
      assignedDoctorId: drRahul._id,
      hospitalNote: 'High priority alert: Fasting glucose significantly elevated. Requires medical review.',
      generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    });

    // Alert 2: Sana's Low Hemoglobin
    const alertSana = await HealthAlert.create({
      patientId: patientSana._id,
      hospitalId: hospital._id,
      reportId: reportSana._id,
      reportName: reportSana.reportName,
      parameter: 'Hemoglobin',
      value: '9.8 g/dL',
      referenceRange: '12.0 - 15.5 g/dL (Adult Female)',
      severity: 'High',
      status: 'Requires Review',
      assignedDoctorId: drSonali._id,
      hospitalNote: 'Low hemoglobin level detected. Dietary & iron supplementation assessment advised.',
      generatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    });

    // Alert 3: Rahul's LDL Alert
    await HealthAlert.create({
      patientId: patientRahul._id,
      hospitalId: hospital._id,
      reportId: reportRahul._id,
      reportName: reportRahul.reportName,
      parameter: 'LDL Cholesterol',
      value: '165 mg/dL',
      referenceRange: '< 100 mg/dL (Target for CAD: < 70 mg/dL)',
      severity: 'High',
      status: 'Active',
      assignedDoctorId: drPriyanka._id,
      hospitalNote: 'Elevated atherogenic lipid fraction in patient with cardiac history.',
      generatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    });

    // Alert 4: Priya's TSH Alert
    await HealthAlert.create({
      patientId: patientPriya._id,
      hospitalId: hospital._id,
      parameter: 'Thyroid Stimulating Hormone (TSH)',
      value: '6.8 uIU/mL',
      referenceRange: '0.45 - 4.5 uIU/mL',
      severity: 'Medium',
      status: 'Active',
      assignedDoctorId: drRahul._id,
      hospitalNote: 'Thyroid hormone outside reference range. Levothyroxine dosage review recommended.',
      generatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    });

    // Alert 5: Resolved demo alert
    await HealthAlert.create({
      patientId: patientAarav._id,
      hospitalId: hospital._id,
      parameter: 'Vitamin D3 (25-OH)',
      value: '18 ng/mL',
      referenceRange: '30 - 100 ng/mL',
      severity: 'Medium',
      status: 'Resolved',
      assignedDoctorId: drSonali._id,
      hospitalNote: 'Prescribed oral cholecalciferol 60,000 IU weekly for 8 weeks.',
      generatedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      resolvedBy: 'Dr. Sonali Sen',
    });

    console.log('[Seed] Creating Doctor Assignments...');
    await DoctorAssignment.create({
      patientId: patientMayur._id,
      doctorId: drRahul._id,
      departmentId: deptDiab._id,
      hospitalId: hospital._id,
      alertId: alertMayur._id,
      reportId: reportMayur._id,
      priority: 'Urgent',
      hospitalNote: 'Assigned for immediate glycemic triage and treatment adjustment.',
      status: 'Accepted',
      assignedBy: 'Hospital Admin',
    });

    await DoctorAssignment.create({
      patientId: patientSana._id,
      doctorId: drSonali._id,
      departmentId: deptGenMed._id,
      hospitalId: hospital._id,
      alertId: alertSana._id,
      reportId: reportSana._id,
      priority: 'High',
      hospitalNote: 'Assigned for anemia workup & follow-up blood panel review.',
      status: 'Pending',
      assignedBy: 'Hospital Admin',
    });

    console.log('[Seed] Creating Appointments...');
    await Appointment.create({
      appointmentId: 'APT-2026-101',
      patientId: patientMayur._id,
      doctorId: drRahul._id,
      departmentId: deptDiab._id,
      hospitalId: hospital._id,
      date: new Date(),
      timeSlot: '11:00 AM - 11:30 AM',
      type: 'In-Person',
      status: 'Today',
      reason: 'Urgent glycemic review & diabetic care plan consultation',
    });

    await Appointment.create({
      appointmentId: 'APT-2026-102',
      patientId: patientSana._id,
      doctorId: drSonali._id,
      departmentId: deptGenMed._id,
      hospitalId: hospital._id,
      date: new Date(),
      timeSlot: '02:30 PM - 03:00 PM',
      type: 'In-Person',
      status: 'Today',
      reason: 'Hemoglobin evaluation & nutrition guidance',
    });

    await Appointment.create({
      appointmentId: 'APT-2026-103',
      patientId: patientRahul._id,
      doctorId: drPriyanka._id,
      departmentId: deptCardio._id,
      hospitalId: hospital._id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      timeSlot: '10:00 AM - 10:30 AM',
      type: 'In-Person',
      status: 'Upcoming',
      reason: 'Quarterly cardiovascular review & lipid management',
    });

    await Appointment.create({
      appointmentId: 'APT-2026-104',
      patientId: patientPriya._id,
      doctorId: drRahul._id,
      departmentId: deptDiab._id,
      hospitalId: hospital._id,
      date: new Date(Date.now() + 48 * 60 * 60 * 1000),
      timeSlot: '04:00 PM - 04:30 PM',
      type: 'Teleconsultation',
      status: 'Upcoming',
      reason: 'Thyroid function test titration follow-up',
    });

    console.log('[Seed] Creating Care Queue Tasks...');
    await CareTask.create({
      hospitalId: hospital._id,
      patientId: patientMayur._id,
      category: 'Critical Alerts',
      title: 'Critical Glucose Alert (280 mg/dL)',
      reason: 'Requires physician correlation and urgent insulin/oral hypoglycemic review.',
      priority: 'Critical',
      assignedDoctorId: drRahul._id,
      relatedAlertId: alertMayur._id,
      relatedReportId: reportMayur._id,
      status: 'In Progress',
      time: '10 mins ago',
    });

    await CareTask.create({
      hospitalId: hospital._id,
      patientId: patientSana._id,
      category: 'Reports Pending Review',
      title: 'CBC & Iron Profile Review',
      reason: 'Low Hemoglobin (9.8 g/dL) pending physician sign-off.',
      priority: 'High',
      assignedDoctorId: drSonali._id,
      relatedReportId: reportSana._id,
      status: 'Active',
      time: '25 mins ago',
    });

    await CareTask.create({
      hospitalId: hospital._id,
      patientId: patientRahul._id,
      category: 'Doctor Assignment Pending',
      title: 'Lipid Panel Review & Statin Titration',
      reason: 'Cardiology team allocation pending confirmation.',
      priority: 'High',
      assignedDoctorId: drPriyanka._id,
      status: 'Active',
      time: '1 hour ago',
    });

    await CareTask.create({
      hospitalId: hospital._id,
      patientId: patientPriya._id,
      category: 'Follow-up Required',
      title: 'Thyroid Panel Titration Follow-up',
      reason: 'Teleconsultation scheduled for Friday 4:00 PM.',
      priority: 'Medium',
      assignedDoctorId: drRahul._id,
      status: 'Active',
      time: '3 hours ago',
    });

    await CareTask.create({
      hospitalId: hospital._id,
      patientId: patientAarav._id,
      category: 'Completed',
      title: 'Annual Executive Health Screening Sign-off',
      reason: 'All lab reports reviewed and patient discharge summary delivered.',
      priority: 'Routine',
      assignedDoctorId: drSonali._id,
      status: 'Completed',
      time: 'Yesterday',
    });

    console.log('[Seed] Creating Notifications...');
    await Notification.create({
      hospitalId: hospital._id,
      title: 'Critical Alert Detected',
      message: 'Critical Glucose value (280 mg/dL) for Patient Mayur Deshmukh requires urgent clinical review.',
      type: 'alert',
      severity: 'critical',
      link: '/hospital/alerts',
      read: false,
    });

    await Notification.create({
      hospitalId: hospital._id,
      title: 'Doctor Assigned',
      message: 'Patient Mayur Deshmukh has been assigned to Dr. Rahul Verma (Diabetology).',
      type: 'assignment',
      severity: 'info',
      link: '/hospital/patients',
      read: false,
    });

    await Notification.create({
      hospitalId: hospital._id,
      title: 'New Lab Report Uploaded',
      message: 'CBC & Iron Profile uploaded by City Pathology Labs for Sana Khan.',
      type: 'report',
      severity: 'warning',
      link: '/hospital/reports',
      read: false,
    });

    await Notification.create({
      hospitalId: hospital._id,
      title: 'Follow-up Scheduled',
      message: 'Follow-up consultation confirmed for patient Priya Nambiar with Dr. Rahul Verma.',
      type: 'appointment',
      severity: 'info',
      link: '/hospital/appointments',
      read: true,
    });

    console.log('[Seed] Database seeding completed successfully!');
  } catch (error) {
    console.error('[Seed Error]:', error);
    throw error;
  }
};

// If run directly via `node seeds/seed.js`
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  })();
}
