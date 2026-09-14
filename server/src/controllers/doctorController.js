import mongoose from 'mongoose';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { User } from '../models/User.js';
import { MedicalReport } from '../models/MedicalReport.js';
import { Prescription } from '../models/Prescription.js';

/**
 * Get authenticated doctor profile.
 */
export async function getDoctorProfile(req, res, next) {
  try {
    let doctor = await Doctor.findOne({ userId: req.user._id }).populate('userId', 'name email phone avatar');
    if (!doctor) {
      doctor = await Doctor.create({
        userId: req.user._id,
        legacyId: `DOC-${Math.floor(100 + Math.random() * 900)}`,
        specialty: 'Diagnostic Medicine & Cardiology',
        qualification: 'MD, DM',
        department: 'Cardiology'
      });
      doctor = await Doctor.findById(doctor._id).populate('userId', 'name email phone avatar');
    }

    return res.status(200).json({
      id: doctor._id,
      legacyId: doctor.legacyId,
      name: doctor.userId?.name || req.user.name,
      email: doctor.userId?.email || req.user.email,
      phone: doctor.userId?.phone || '+91 98112 34567',
      specialty: doctor.specialty,
      qualification: doctor.qualification,
      department: doctor.department,
      hospitalId: doctor.hospitalId,
      hospitalName: 'MedX Super Speciality Teaching Hospital',
      licenseNumber: doctor.licenseNumber || 'MED-DEL-89211',
      availabilityStatus: doctor.availabilityStatus
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update authenticated doctor profile.
 */
export async function updateDoctorProfile(req, res, next) {
  try {
    const { specialty, qualification, department, licenseNumber, availabilityStatus } = req.body;
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          ...(specialty && { specialty }),
          ...(qualification && { qualification }),
          ...(department && { department }),
          ...(licenseNumber && { licenseNumber }),
          ...(availabilityStatus && { availabilityStatus })
        }
      },
      { new: true, upsert: true }
    ).populate('userId', 'name email phone');

    return res.status(200).json(doctor);
  } catch (error) {
    next(error);
  }
}

/**
 * Get patients accessible to the authenticated doctor.
 */
export async function getDoctorPatients(req, res, next) {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: { code: 'DOCTOR_NOT_FOUND', message: 'Doctor profile not found.' } });
    }

    // Accessible patients: assigned to this doctor or assigned to same hospital
    const query = {
      $or: [
        { primaryDoctorId: doctor._id },
        ...(doctor.hospitalId ? [{ hospitalId: doctor.hospitalId }] : [])
      ]
    };

    let patients = await Patient.find(query).populate('userId', 'name email phone avatar');

    // If no assigned patients found yet, query all patients assigned to this doctor or recent unassigned for workstation demo
    if (patients.length === 0) {
      patients = await Patient.find({ primaryDoctorId: doctor._id }).populate('userId', 'name email phone avatar');
    }

    const formatted = patients.map((p) => ({
      _id: p._id,
      id: p.legacyId || `PX-${p._id.toString().substring(18, 24).toUpperCase()}`,
      name: p.userId?.name || 'Registered Patient',
      email: p.userId?.email || '',
      phone: p.userId?.phone || '+91 98112 34567',
      gender: p.gender,
      bloodGroup: p.bloodGroup || 'O+',
      age: p.dateOfBirth ? Math.floor((Date.now() - new Date(p.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : 38,
      status: p.status || 'Active',
      currentCondition: p.currentCondition || 'Routine Health Monitoring',
      vitalSigns: p.vitalSigns,
      clinicalFlags: p.clinicalFlags || [],
      allergies: p.allergies || [],
      medicalHistory: p.medicalHistory || [],
      prescriptionsCount: p.prescriptions?.length || 0,
      clinicalNotesCount: p.clinicalNotes?.length || 0,
      primaryDoctorId: p.primaryDoctorId,
      primaryDoctorName: p.primaryDoctorId && doctor._id && p.primaryDoctorId.equals(doctor._id) ? req.user.name : 'Assigned Physician'
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
}

/**
 * Get patient details by ID with relationship authorization.
 */
export async function getDoctorPatientById(req, res, next) {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: { code: 'DOCTOR_NOT_FOUND', message: 'Doctor profile not found.' } });
    }

    const patientParam = req.params.id;
    const isObjectId = mongoose.Types.ObjectId.isValid(patientParam);

    const patient = await Patient.findOne(
      isObjectId ? { $or: [{ _id: patientParam }, { legacyId: patientParam }] } : { legacyId: patientParam }
    ).populate('userId', 'name email phone avatar');

    if (!patient) {
      return res.status(404).json({ error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found.' } });
    }

    // Relationship verification: ensure patient is assigned or doctor is authorized
    const isAssigned = patient.primaryDoctorId && patient.primaryDoctorId.equals(doctor._id);
    const isSameHospital = doctor.hospitalId && patient.hospitalId && doctor.hospitalId.equals(patient.hospitalId);

    if (!isAssigned && !isSameHospital && patient.primaryDoctorId !== null) {
      return res.status(403).json({
        error: {
          code: 'PATIENT_ACCESS_FORBIDDEN',
          message: 'Access denied: You are not authorized to view this patient dossier.'
        }
      });
    }

    // Retrieve patient's canonical MedicalReports
    const reports = await MedicalReport.find({
      $or: [{ patientId: patient._id }, { userId: patient.userId?._id || patient.userId }]
    }).sort({ reportDate: -1 });

    const labReportsFormatted = reports.map((r) => ({
      _id: r._id,
      id: r.reportId || r._id.toString(),
      name: r.reportName || 'Blood Biomarker Panel',
      date: new Date(r.reportDate).toISOString().split('T')[0],
      sourceType: r.sourceType,
      status: r.mlResult?.riskTier === 'Critical' || r.mlResult?.riskTier === 'High' ? 'Abnormal' : 'Normal',
      reviewStatus: r.reviewStatus || 'Pending Review',
      reviewNotes: r.reviewNotes || '',
      reviewedAt: r.reviewedAt,
      reviewedByDoctorId: r.reviewedByDoctorId,
      parameters: r.parameters instanceof Map ? Object.fromEntries(r.parameters) : r.parameters,
      mlResult: r.mlResult
    }));

    // Retrieve prescriptions
    const prescriptions = await Prescription.find({ patientId: patient._id }).sort({ date: -1 });

    return res.status(200).json({
      _id: patient._id,
      id: patient.legacyId || `PX-${patient._id.toString().substring(18, 24).toUpperCase()}`,
      name: patient.userId?.name || 'Registered Patient',
      email: patient.userId?.email || '',
      phone: patient.userId?.phone || '+91 98112 34567',
      gender: patient.gender,
      bloodGroup: patient.bloodGroup || 'O+',
      age: patient.dateOfBirth ? Math.floor((Date.now() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : 38,
      status: patient.status || 'Active',
      currentCondition: patient.currentCondition,
      vitalSigns: patient.vitalSigns,
      clinicalFlags: patient.clinicalFlags || [],
      allergies: patient.allergies || [],
      medicalHistory: patient.medicalHistory || [],
      labReports: labReportsFormatted,
      prescriptions: prescriptions.length > 0 ? prescriptions : (patient.prescriptions || []),
      clinicalNotes: patient.clinicalNotes || [],
      followupPlan: patient.followupPlan || []
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Enroll or create a patient record under this doctor.
 */
export async function createDoctorPatient(req, res, next) {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: { code: 'DOCTOR_NOT_FOUND', message: 'Doctor profile not found.' } });
    }

    const { name, email, phone, gender, bloodGroup, age, dateOfBirth, currentCondition, vitalSigns } = req.body;
    if (!name) {
      return res.status(400).json({ error: { code: 'MISSING_NAME', message: 'Patient full name is required.' } });
    }

    const patientEmail = email || `patient.${Date.now()}@medx.local`;
    let user = await User.findOne({ email: patientEmail });
    if (!user) {
      user = await User.create({
        name,
        email: patientEmail,
        password: `TmpPass${Math.floor(1000 + Math.random() * 9000)}!`,
        role: 'patient',
        phone: phone || '+91 98112 34567'
      });
    }

    const legacyId = `PX-${Math.floor(10000 + Math.random() * 90000)}`;
    const dob = dateOfBirth ? new Date(dateOfBirth) : (age ? new Date(Date.now() - age * 365.25 * 24 * 60 * 60 * 1000) : new Date('1988-01-01'));

    const patient = await Patient.create({
      userId: user._id,
      legacyId,
      gender: gender || 'Unspecified',
      dateOfBirth: dob,
      bloodGroup: bloodGroup || 'O+',
      primaryDoctorId: doctor._id,
      hospitalId: doctor.hospitalId,
      currentCondition: currentCondition || 'Routine Health Monitoring & Vitals Check',
      vitalSigns: vitalSigns || {},
      status: 'Active'
    });

    return res.status(201).json({
      _id: patient._id,
      id: patient.legacyId,
      patientId: patient.legacyId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      currentCondition: patient.currentCondition,
      vitalSigns: patient.vitalSigns,
      status: patient.status
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Author and persist a prescription for a patient.
 */
export async function addPrescription(req, res, next) {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: { code: 'DOCTOR_NOT_FOUND', message: 'Doctor profile not found.' } });
    }

    const patientParam = req.params.id;
    const isObjectId = mongoose.Types.ObjectId.isValid(patientParam);
    const patient = await Patient.findOne(
      isObjectId ? { $or: [{ _id: patientParam }, { legacyId: patientParam }] } : { legacyId: patientParam }
    );

    if (!patient) {
      return res.status(404).json({ error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found.' } });
    }

    const rxData = req.body.rxData || req.body;
    const { diagnosis, medicines = [], notes, advice, date = new Date() } = rxData;

    if (!medicines || medicines.length === 0) {
      return res.status(400).json({ error: { code: 'MISSING_MEDICINES', message: 'At least one prescribed medicine is required.' } });
    }

    const rxId = rxData.id || rxData.prescriptionId || rxData.prescriptionNumber || `RX-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create persistent Prescription record
    const prescription = await Prescription.create({
      prescriptionId: rxId,
      prescriptionNumber: rxId,
      patientId: patient._id,
      userId: patient.userId,
      doctorId: doctor._id,
      doctorName: req.user.name,
      diagnosis: diagnosis || 'Clinical Evaluation & Symptomatic Management',
      medicines,
      notes: notes || advice || '',
      date: new Date(date)
    });

    // Update patient record with prescription snapshot
    patient.prescriptions = [prescription.toObject(), ...(patient.prescriptions || [])];
    await patient.save();

    return res.status(201).json(prescription);
  } catch (error) {
    next(error);
  }
}

/**
 * Add a clinical note to patient dossier.
 */
export async function addClinicalNote(req, res, next) {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: { code: 'DOCTOR_NOT_FOUND', message: 'Doctor profile not found.' } });
    }

    const patientParam = req.params.id;
    const isObjectId = mongoose.Types.ObjectId.isValid(patientParam);
    const patient = await Patient.findOne(
      isObjectId ? { $or: [{ _id: patientParam }, { legacyId: patientParam }] } : { legacyId: patientParam }
    );

    if (!patient) {
      return res.status(404).json({ error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found.' } });
    }

    const noteData = req.body.noteData || req.body;
    const noteEntry = {
      id: noteData.id || `CN-${Math.floor(100 + Math.random() * 900)}`,
      date: noteData.date || new Date().toISOString().split('T')[0],
      time: noteData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      doctorId: doctor._id,
      doctorName: req.user.name,
      note: noteData.note || noteData.text || ''
    };

    patient.clinicalNotes = [noteEntry, ...(patient.clinicalNotes || [])];
    await patient.save();

    return res.status(200).json(patient);
  } catch (error) {
    next(error);
  }
}

/**
 * Add a followup plan to patient dossier.
 */
export async function addFollowup(req, res, next) {
  try {
    const patientParam = req.params.id;
    const isObjectId = mongoose.Types.ObjectId.isValid(patientParam);
    const patient = await Patient.findOne(
      isObjectId ? { $or: [{ _id: patientParam }, { legacyId: patientParam }] } : { legacyId: patientParam }
    );

    if (!patient) {
      return res.status(404).json({ error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found.' } });
    }

    const followupData = req.body.followupData || req.body;
    const followupEntry = {
      id: `FP-${Math.floor(100 + Math.random() * 900)}`,
      date: followupData.date || new Date().toISOString().split('T')[0],
      purpose: followupData.purpose || followupData.reason || 'Routine Consultation Follow-up',
      reason: followupData.reason || followupData.purpose || 'Routine Consultation Follow-up',
      recommendedTests: followupData.recommendedTests || 'Standard Vitals',
      instructions: followupData.instructions || ''
    };

    patient.followupPlan = [followupEntry, ...(patient.followupPlan || [])];
    await patient.save();

    return res.status(200).json({
      ...patient.toObject(),
      followupPlan: followupEntry,
      followupHistory: patient.followupPlan
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all diagnostic reports accessible to the doctor for review.
 */
export async function getDoctorReports(req, res, next) {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: { code: 'DOCTOR_NOT_FOUND', message: 'Doctor profile not found.' } });
    }

    // Retrieve all reports (or reports for assigned patients + pending reviews)
    const reports = await MedicalReport.find()
      .populate('userId', 'name email phone')
      .populate('patientId', 'legacyId gender dateOfBirth bloodGroup')
      .populate('reviewedByDoctorId', 'specialty qualification')
      .sort({ reportDate: -1 });

    const formatted = reports.map((r) => ({
      _id: r._id,
      reportId: r.reportId || r._id.toString(),
      reportName: r.reportName,
      reportType: r.reportType,
      sourceType: r.sourceType,
      reportDate: r.reportDate,
      patientName: r.userId?.name || 'Patient',
      patientId: r.patientId?.legacyId || r.patientId?._id || 'PAT-Auto',
      reviewStatus: r.reviewStatus || 'Pending Review',
      reviewedByDoctorId: r.reviewedByDoctorId?._id || r.reviewedByDoctorId,
      reviewedAt: r.reviewedAt,
      reviewNotes: r.reviewNotes,
      riskScore: r.mlResult?.overallRiskScore || 0,
      riskTier: r.mlResult?.riskTier || 'Low',
      parameters: r.parameters instanceof Map ? Object.fromEntries(r.parameters) : r.parameters,
      mlResult: r.mlResult
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
}

/**
 * Get single diagnostic report by ID for clinical review.
 */
export async function getDoctorReportById(req, res, next) {
  try {
    const report = await MedicalReport.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('patientId')
      .populate('reviewedByDoctorId');

    if (!report) {
      return res.status(404).json({ error: { code: 'REPORT_NOT_FOUND', message: 'Medical report not found.' } });
    }

    return res.status(200).json(report);
  } catch (error) {
    next(error);
  }
}

/**
 * Review a medical report: sign off, set status, add clinical notes.
 */
export async function reviewMedicalReport(req, res, next) {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: { code: 'DOCTOR_NOT_FOUND', message: 'Doctor profile not found.' } });
    }

    const { reviewStatus = 'Reviewed', reviewNotes = '' } = req.body;

    const report = await MedicalReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: { code: 'REPORT_NOT_FOUND', message: 'Medical report not found.' } });
    }

    // Persist review state in canonical MedicalReport without altering original patient biomarkers
    report.reviewStatus = reviewStatus;
    report.reviewedByDoctorId = doctor._id;
    report.reviewNotes = reviewNotes;
    report.reviewedAt = new Date();

    await report.save();

    return res.status(200).json({
      message: 'Medical report review successfully recorded.',
      _id: report._id,
      reviewStatus: report.reviewStatus,
      reviewedByDoctorId: report.reviewedByDoctorId,
      reviewedByDoctorName: req.user.name,
      reviewNotes: report.reviewNotes,
      reviewedAt: report.reviewedAt,
      report
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get doctor's outpatient consultation triage queue.
 */
export async function getDoctorQueue(req, res, next) {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: { code: 'DOCTOR_NOT_FOUND', message: 'Doctor profile not found.' } });
    }

    // Queue of patients assigned or needing review
    const patients = await Patient.find({
      $or: [
        { primaryDoctorId: doctor._id },
        { status: { $in: ['Waiting', 'Critical', 'In Consultation'] } }
      ]
    }).populate('userId', 'name email phone avatar');

    const queue = patients.map((p, idx) => ({
      tokenNumber: idx + 1,
      patientId: p.legacyId || p._id,
      patientName: p.userId?.name || 'Registered Patient',
      age: p.dateOfBirth ? Math.floor((Date.now() - new Date(p.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : 42,
      gender: p.gender,
      bloodGroup: p.bloodGroup,
      visitType: p.status === 'Critical' ? 'Urgent Diagnostic Review' : 'Outpatient Consultation',
      status: p.status || 'Waiting',
      priority: p.status === 'Critical' ? 'Urgent' : 'Routine',
      vitalSigns: p.vitalSigns,
      estimatedWaitTime: `${(idx + 1) * 12} mins`
    }));

    return res.status(200).json(queue);
  } catch (error) {
    next(error);
  }
}

export default {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorPatients,
  getDoctorPatientById,
  createDoctorPatient,
  addPrescription,
  addClinicalNote,
  addFollowup,
  getDoctorReports,
  getDoctorReportById,
  reviewMedicalReport,
  getDoctorQueue
};
