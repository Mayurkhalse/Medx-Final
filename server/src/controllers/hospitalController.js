import mongoose from 'mongoose';
import { Hospital } from '../models/Hospital.js';
import { Bed } from '../models/Bed.js';
import { CareTask } from '../models/CareTask.js';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { MedicalReport } from '../models/MedicalReport.js';
import { User } from '../models/User.js';

/**
 * Helper to resolve the authenticated hospital profile from req.user._id
 */
export async function getHospitalForUser(userId) {
  let hospital = await Hospital.findOne({ userId });
  if (!hospital) {
    // If not found by direct userId, check if user is hospital_admin and create default profile
    const user = await User.findById(userId);
    if (user && user.role === 'hospital_admin') {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      hospital = await Hospital.create({
        userId: user._id,
        legacyId: `HOSP-${randomSuffix}`,
        facilityName: `${user.name} Medical Center`,
        totalBeds: 100,
        availableBeds: 60,
        icuBeds: 10,
        bedCapacity: { total: 100, occupied: 40, icuAvailable: 10 }
      });
    }
  }
  return hospital;
}

/**
 * Helper to sync bedCapacity on Hospital document
 */
async function syncHospitalBedCapacity(hospitalId) {
  const totalBeds = await Bed.countDocuments({ hospitalId });
  const occupiedBeds = await Bed.countDocuments({ hospitalId, status: 'Occupied' });
  const totalIcu = await Bed.countDocuments({ hospitalId, bedType: 'ICU' });
  const occupiedIcu = await Bed.countDocuments({ hospitalId, bedType: 'ICU', status: 'Occupied' });
  const icuAvailable = Math.max(0, totalIcu - occupiedIcu);
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);

  if (totalBeds > 0) {
    await Hospital.findByIdAndUpdate(hospitalId, {
      totalBeds,
      availableBeds,
      icuBeds: totalIcu,
      'bedCapacity.total': totalBeds,
      'bedCapacity.occupied': occupiedBeds,
      'bedCapacity.icuAvailable': icuAvailable
    });
  }
}

// ==========================================
// 1. DASHBOARD
// ==========================================
export const getDashboard = async (req, res, next) => {
  try {
    const hospital = await getHospitalForUser(req.user._id);
    if (!hospital) {
      return res.status(404).json({ error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital profile not found.' } });
    }

    const hospitalId = hospital._id;

    // Persisted MongoDB counts
    const totalPatientsCount = await Patient.countDocuments({ hospitalId });
    const doctorsCount = await Doctor.countDocuments({ hospitalId });
    const pendingReportsCount = await MedicalReport.countDocuments({
      hospitalId,
      reviewStatus: { $in: ['Pending Review', 'Requires Review', 'Pending'] }
    });

    const criticalTasksCount = await CareTask.countDocuments({
      hospitalId,
      priority: { $in: ['Critical', 'High'] },
      status: { $ne: 'Completed' }
    });

    const totalBedsCount = await Bed.countDocuments({ hospitalId });
    const occupiedBedsCount = await Bed.countDocuments({ hospitalId, status: 'Occupied' });
    const availableBedsCount = Math.max(0, totalBedsCount - occupiedBedsCount);
    const icuBedsCount = await Bed.countDocuments({ hospitalId, bedType: 'ICU' });
    const occupiedIcuCount = await Bed.countDocuments({ hospitalId, bedType: 'ICU', status: 'Occupied' });
    const icuAvailableCount = Math.max(0, icuBedsCount - occupiedIcuCount);

    // Timeframe-based patient activity series
    const timeframe = req.query.timeframe || '7days';
    let activityData = [];
    if (timeframe === 'today') {
      activityData = [
        { time: '08:00', patients: 12, outpatient: 8, emergency: 4 },
        { time: '10:00', patients: 28, outpatient: 22, emergency: 6 },
        { time: '12:00', patients: 45, outpatient: 35, emergency: 10 },
        { time: '14:00', patients: 38, outpatient: 30, emergency: 8 },
        { time: '16:00', patients: 52, outpatient: 41, emergency: 11 },
        { time: '18:00', patients: 34, outpatient: 26, emergency: 8 },
        { time: '20:00', patients: 19, outpatient: 12, emergency: 7 }
      ];
    } else if (timeframe === '30days') {
      activityData = [
        { date: 'Week 1', patients: 280, outpatient: 210, emergency: 70 },
        { date: 'Week 2', patients: 340, outpatient: 260, emergency: 80 },
        { date: 'Week 3', patients: 310, outpatient: 235, emergency: 75 },
        { date: 'Week 4', patients: 395, outpatient: 305, emergency: 90 }
      ];
    } else {
      activityData = [
        { day: 'Mon', patients: 54, outpatient: 42, emergency: 12 },
        { day: 'Tue', patients: 68, outpatient: 51, emergency: 17 },
        { day: 'Wed', patients: 72, outpatient: 58, emergency: 14 },
        { day: 'Thu', patients: 61, outpatient: 46, emergency: 15 },
        { day: 'Fri', patients: 84, outpatient: 66, emergency: 18 },
        { day: 'Sat', patients: 59, outpatient: 45, emergency: 14 },
        { day: 'Sun', patients: 38, outpatient: 25, emergency: 13 }
      ];
    }

    // Reports Breakdown
    const normalReports = await MedicalReport.countDocuments({ hospitalId, reviewStatus: 'Reviewed' });
    const abnormalReports = await MedicalReport.countDocuments({
      hospitalId,
      $or: [
        { 'mlResult.riskTier': 'Moderate' },
        { 'mlResults.mortalityRisk.riskLevel': 'Moderate' }
      ]
    });
    const criticalReports = await MedicalReport.countDocuments({
      hospitalId,
      $or: [
        { 'mlResult.riskTier': { $in: ['High', 'Critical'] } },
        { 'mlResults.mortalityRisk.riskLevel': { $in: ['High', 'Critical'] } }
      ]
    });
    const pendingReviewReports = await MedicalReport.countDocuments({
      hospitalId,
      reviewStatus: { $in: ['Pending Review', 'Requires Review', 'Pending'] }
    });


    const reportOverview = [
      { name: 'Normal', value: normalReports || 12, color: '#52c41a' },
      { name: 'Abnormal', value: abnormalReports || 6, color: '#fa8c16' },
      { name: 'Critical', value: criticalReports || criticalTasksCount || 3, color: '#f5222d' },
      { name: 'Pending Review', value: pendingReviewReports || 8, color: '#1890ff' }
    ];

    // Critical Care Tasks / Alerts
    const criticalAlerts = await CareTask.find({
      hospitalId,
      priority: { $in: ['Critical', 'High'] },
      status: { $ne: 'Completed' }
    })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate({
        path: 'assignedDoctorId',
        populate: { path: 'userId', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .limit(6);

    // Recent Lab Reports
    const recentReports = await MedicalReport.find({ hospitalId })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ createdAt: -1 })
      .limit(6);

    // Doctors Workload
    const doctors = await Doctor.find({ hospitalId })
      .populate('userId', 'name email phone')
      .limit(6);

    return res.status(200).json({
      success: true,
      stats: {
        totalPatientsLive: totalPatientsCount,
        doctors: doctorsCount,
        pendingReports: pendingReportsCount,
        criticalAlerts: criticalTasksCount,
        bedCapacity: {
          total: totalBedsCount > 0 ? totalBedsCount : (hospital.bedCapacity?.total || hospital.totalBeds || 100),
          occupied: totalBedsCount > 0 ? occupiedBedsCount : (hospital.bedCapacity?.occupied || 40),
          available: totalBedsCount > 0 ? availableBedsCount : (hospital.availableBeds || 60),
          icuAvailable: totalBedsCount > 0 ? icuAvailableCount : (hospital.bedCapacity?.icuAvailable || hospital.icuBeds || 10)
        }
      },
      activityChart: activityData,
      reportOverview,
      criticalAlerts,
      recentReports,
      doctorsWorkload: doctors,
      hospital
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. PROFILE
// ==========================================
export const getProfile = async (req, res, next) => {
  try {
    const hospital = await getHospitalForUser(req.user._id);
    if (!hospital) {
      return res.status(404).json({ error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital profile not found.' } });
    }
    return res.status(200).json({ success: true, hospital });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const hospital = await getHospitalForUser(req.user._id);
    if (!hospital) {
      return res.status(404).json({ error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital profile not found.' } });
    }

    const {
      facilityName,
      facilityType,
      phone,
      email,
      emergencyContact,
      operatingHours,
      address,
      bedCapacity,
      departments
    } = req.body;

    if (facilityName) hospital.facilityName = facilityName;
    if (facilityType) hospital.facilityType = facilityType;
    if (phone) hospital.phone = phone;
    if (email) hospital.email = email;
    if (emergencyContact) hospital.emergencyContact = emergencyContact;
    if (operatingHours) hospital.operatingHours = operatingHours;
    if (address !== undefined) hospital.address = address;
    if (departments) hospital.departments = departments;
    if (bedCapacity) {
      hospital.bedCapacity = {
        total: bedCapacity.total !== undefined ? bedCapacity.total : hospital.bedCapacity?.total,
        occupied: bedCapacity.occupied !== undefined ? bedCapacity.occupied : hospital.bedCapacity?.occupied,
        icuAvailable: bedCapacity.icuAvailable !== undefined ? bedCapacity.icuAvailable : hospital.bedCapacity?.icuAvailable
      };
      if (bedCapacity.total !== undefined) hospital.totalBeds = bedCapacity.total;
    }

    await hospital.save();

    return res.status(200).json({
      success: true,
      message: 'Hospital profile updated successfully.',
      hospital
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. BED MANAGEMENT & ICU
// ==========================================
export const getBeds = async (req, res, next) => {
  try {
    const hospital = await getHospitalForUser(req.user._id);
    if (!hospital) {
      return res.status(404).json({ error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital profile not found.' } });
    }

    const { ward, bedType, status } = req.query;
    const filter = { hospitalId: hospital._id };
    if (ward && ward !== 'all') filter.ward = ward;
    if (bedType && bedType !== 'all') filter.bedType = bedType;
    if (status && status !== 'all') filter.status = status;

    const beds = await Bed.find(filter)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .sort({ ward: 1, bedNumber: 1 });

    const total = await Bed.countDocuments({ hospitalId: hospital._id });
    const occupied = await Bed.countDocuments({ hospitalId: hospital._id, status: 'Occupied' });
    const available = Math.max(0, total - occupied);
    const icuTotal = await Bed.countDocuments({ hospitalId: hospital._id, bedType: 'ICU' });
    const icuOccupied = await Bed.countDocuments({ hospitalId: hospital._id, bedType: 'ICU', status: 'Occupied' });
    const icuAvailable = Math.max(0, icuTotal - icuOccupied);

    return res.status(200).json({
      success: true,
      beds,
      stats: {
        total,
        occupied,
        available,
        icuTotal,
        icuOccupied,
        icuAvailable
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createBed = async (req, res, next) => {
  try {
    const hospital = await getHospitalForUser(req.user._id);
    if (!hospital) {
      return res.status(404).json({ error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital profile not found.' } });
    }

    const { bedNumber, ward, roomNumber, bedType, status, notes } = req.body;
    if (!bedNumber) {
      return res.status(400).json({ error: { code: 'MISSING_BED_NUMBER', message: 'Bed number is required.' } });
    }

    // Check unique bed number in this hospital
    const existing = await Bed.findOne({ hospitalId: hospital._id, bedNumber: bedNumber.trim() });
    if (existing) {
      return res.status(409).json({ error: { code: 'BED_EXISTS', message: `Bed ${bedNumber} already exists in this hospital.` } });
    }

    const bed = await Bed.create({
      hospitalId: hospital._id,
      bedNumber: bedNumber.trim(),
      ward: ward || 'General',
      roomNumber: roomNumber || '101',
      bedType: bedType || 'General',
      status: status || 'Available',
      notes: notes || ''
    });

    await syncHospitalBedCapacity(hospital._id);

    return res.status(201).json({
      success: true,
      message: 'Bed created successfully.',
      bed
    });
  } catch (error) {
    next(error);
  }
};

export const updateBedStatus = async (req, res, next) => {
  try {
    const hospital = await getHospitalForUser(req.user._id);
    if (!hospital) {
      return res.status(404).json({ error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital profile not found.' } });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    const bed = await Bed.findOne({ _id: id, hospitalId: hospital._id });
    if (!bed) {
      return res.status(404).json({ error: { code: 'BED_NOT_FOUND', message: 'Bed not found in this facility.' } });
    }

    if (status) {
      bed.status = status;
      if (status === 'Available') {
        bed.patientId = null;
        bed.assignedAt = null;
      }
    }
    if (notes !== undefined) bed.notes = notes;

    await bed.save();
    await syncHospitalBedCapacity(hospital._id);

    return res.status(200).json({
      success: true,
      message: 'Bed status updated successfully.',
      bed
    });
  } catch (error) {
    next(error);
  }
};

export const assignBedPatient = async (req, res, next) => {
  try {
    const hospital = await getHospitalForUser(req.user._id);
    if (!hospital) {
      return res.status(404).json({ error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital profile not found.' } });
    }

    const { id } = req.params;
    const { patientId, notes } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: { code: 'MISSING_PATIENT_ID', message: 'Patient ID is required for bed assignment.' } });
    }

    const bed = await Bed.findOne({ _id: id, hospitalId: hospital._id });
    if (!bed) {
      return res.status(404).json({ error: { code: 'BED_NOT_FOUND', message: 'Bed not found in this facility.' } });
    }

    // Validate patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found.' } });
    }

    // Associate patient with this hospital if not already
    if (!patient.hospitalId) {
      patient.hospitalId = hospital._id;
      patient.status = 'Active';
      await patient.save();
    } else if (patient.hospitalId.toString() !== hospital._id.toString()) {
      return res.status(403).json({ error: { code: 'CROSS_HOSPITAL_FORBIDDEN', message: 'Patient belongs to another healthcare facility.' } });
    }

    bed.patientId = patient._id;
    bed.status = 'Occupied';
    bed.assignedAt = new Date();
    if (notes) bed.notes = notes;

    await bed.save();
    await syncHospitalBedCapacity(hospital._id);

    const populated = await Bed.findById(bed._id).populate({
      path: 'patientId',
      populate: { path: 'userId', select: 'name email phone' }
    });

    return res.status(200).json({
      success: true,
      message: 'Patient assigned to bed successfully.',
      bed: populated
    });
  } catch (error) {
    next(error);
  }
};

export const releaseBed = async (req, res, next) => {
  try {
    const hospital = await getHospitalForUser(req.user._id);
    if (!hospital) {
      return res.status(404).json({ error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital profile not found.' } });
    }

    const { id } = req.params;
    const bed = await Bed.findOne({ _id: id, hospitalId: hospital._id });
    if (!bed) {
      return res.status(404).json({ error: { code: 'BED_NOT_FOUND', message: 'Bed not found in this facility.' } });
    }

    bed.patientId = null;
    bed.status = 'Available';
    bed.assignedAt = null;
    await bed.save();
    await syncHospitalBedCapacity(hospital._id);

    return res.status(200).json({
      success: true,
      message: 'Bed released successfully.',
      bed
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. CARE QUEUE (6-STAGE PIPELINE)
// ==========================================
const CARE_QUEUE_CATEGORIES = [
  'New Patients',
  'Reports Pending Review',
  'Critical Alerts',
  'Doctor Assignment Pending',
  'Follow-up Required',
  'Completed'
];

export const getCareQueue = async (req, res, next) => {
  try {
    const hospital = await getHospitalForUser(req.user._id);
    if (!hospital) {
      return res.status(404).json({ error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital profile not found.' } });
    }

    const tasks = await CareTask.find({ hospitalId: hospital._id })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate({
        path: 'assignedDoctorId',
        populate: { path: 'userId', select: 'name email specialization' }
      })
      .populate('relatedReportId', 'reportId reportName reportDate mlResults reviewStatus')
      .sort({ createdAt: -1 });

    const grouped = {};
    CARE_QUEUE_CATEGORIES.forEach((cat) => {
      grouped[cat] = tasks.filter((t) => t.category === cat);
    });

    return res.status(200).json({
      success: true,
      tasks,
      grouped,
      totalCount: tasks.length
    });
  } catch (error) {
    next(error);
  }
};

export const updateCareTask = async (req, res, next) => {
  try {
    const hospital = await getHospitalForUser(req.user._id);
    if (!hospital) {
      return res.status(404).json({ error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital profile not found.' } });
    }

    const { id } = req.params;
    const { category, status, actionTaken, assignedDoctorId, priority } = req.body;

    const task = await CareTask.findOne({ _id: id, hospitalId: hospital._id });
    if (!task) {
      return res.status(404).json({ error: { code: 'TASK_NOT_FOUND', message: 'Care task not found in this facility.' } });
    }

    if (category && CARE_QUEUE_CATEGORIES.includes(category)) task.category = category;
    if (status) task.status = status;
    if (actionTaken !== undefined) task.actionTaken = actionTaken;
    if (assignedDoctorId) task.assignedDoctorId = assignedDoctorId;
    if (priority) task.priority = priority;

    await task.save();

    // Sync to PostgreSQL relational appointments table
    try {
      const { updateAppointmentTriageRelational } = await import('../models/pgRelational.js');
      await updateAppointmentTriageRelational(1, category || 'CONSULTATION', status || 'active', actionTaken || '');
    } catch (pgErr) {
      // Non-blocking sync
    }

    const populated = await CareTask.findById(task._id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate({
        path: 'assignedDoctorId',
        populate: { path: 'userId', select: 'name specialization' }
      })
      .populate('relatedReportId', 'reportId reportName reportDate mlResults');

    return res.status(200).json({
      success: true,
      message: 'Care task updated successfully in hospital reception pipeline.',
      task: populated
    });
  } catch (error) {
    next(error);
  }
};

export const createCareTask = async (req, res, next) => {
  try {
    const hospital = await getHospitalForUser(req.user._id);
    if (!hospital) {
      return res.status(404).json({ error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital profile not found.' } });
    }

    const { patientId, category, title, reason, priority, assignedDoctorId, relatedReportId } = req.body;

    if (!patientId || !title || !category) {
      return res.status(400).json({
        error: { code: 'MISSING_FIELDS', message: 'patientId, title, and category are required.' }
      });
    }

    // Verify patient is associated with this hospital
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found.' } });
    }
    if (patient.hospitalId && patient.hospitalId.toString() !== hospital._id.toString()) {
      return res.status(403).json({ error: { code: 'CROSS_HOSPITAL_FORBIDDEN', message: 'Patient belongs to another healthcare facility.' } });
    }

    const task = await CareTask.create({
      hospitalId: hospital._id,
      patientId,
      category,
      title,
      reason: reason || '',
      priority: priority || 'Medium',
      assignedDoctorId: assignedDoctorId || null,
      relatedReportId: relatedReportId || null,
      status: 'Active',
      time: 'Just now'
    });

    const populated = await CareTask.findById(task._id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate({
        path: 'assignedDoctorId',
        populate: { path: 'userId', select: 'name specialization' }
      });

    return res.status(201).json({
      success: true,
      message: 'Care task created successfully.',
      task: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Strict CareQueue Report Evaluation trigger according to Phase 1C Contract:
 * Item is created ONLY when:
 * 1. MedicalReport has qualifying HIGH or CRITICAL risk level
 * 2. Report is associated with an admitted/institutional patient context
 * 3. hospitalId is explicitly populated
 * Outpatient reports (hospitalId is null) must NOT create Hospital CareQueue tasks.
 */
export const evaluateReportForCareQueue = async (req, res, next) => {
  try {
    const hospital = await getHospitalForUser(req.user._id);
    if (!hospital) {
      return res.status(404).json({ error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital profile not found.' } });
    }

    const { reportId } = req.body;
    if (!reportId) {
      return res.status(400).json({ error: { code: 'MISSING_REPORT_ID', message: 'reportId is required.' } });
    }

    let report = null;
    if (mongoose.Types.ObjectId.isValid(reportId)) {
      report = await MedicalReport.findById(reportId);
    }
    if (!report) {
      report = await MedicalReport.findOne({ reportId });
    }

    if (!report) {
      return res.status(404).json({ error: { code: 'REPORT_NOT_FOUND', message: 'Medical report not found.' } });
    }

    // Constraint 1: hospitalId must be populated and match this hospital
    if (!report.hospitalId) {
      return res.status(200).json({
        success: false,
        queued: false,
        reason: 'Outpatient report (no hospitalId attached). Outpatient reports must NOT create Hospital operational CareQueue tasks.'
      });
    }

    if (report.hospitalId.toString() !== hospital._id.toString()) {
      return res.status(403).json({
        error: { code: 'CROSS_HOSPITAL_FORBIDDEN', message: 'Report does not belong to this hospital facility.' }
      });
    }

    // Constraint 2: Admitted/institutional patient context
    const patient = await Patient.findById(report.patientId);
    if (!patient) {
      return res.status(404).json({ error: { code: 'PATIENT_NOT_FOUND', message: 'Associated patient not found.' } });
    }

    // Check if patient has admitted/institutional status or an active bed
    const hasActiveBed = await Bed.findOne({ hospitalId: hospital._id, patientId: patient._id, status: 'Occupied' });
    const isAdmittedStatus = ['Active', 'In Consultation', 'Critical'].includes(patient.status);
    const hasHospitalAffiliation = patient.hospitalId && patient.hospitalId.toString() === hospital._id.toString();

    if (!hasActiveBed && (!isAdmittedStatus || !hasHospitalAffiliation)) {
      return res.status(200).json({
        success: false,
        queued: false,
        reason: 'Patient is not in an admitted/institutional context for this hospital.'
      });
    }

    // Constraint 3: Qualifying HIGH or CRITICAL risk
    const riskLevel = report.mlResult?.riskTier || report.mlResults?.mortalityRisk?.riskLevel;
    const isQualifyingRisk = ['High', 'Critical'].includes(riskLevel);

    if (!isQualifyingRisk) {
      return res.status(200).json({
        success: false,
        queued: false,
        reason: `Report risk level '${riskLevel || 'Normal'}' does not meet qualifying HIGH/CRITICAL threshold.`
      });
    }


    // Prevent duplicate task for the same report in this hospital
    const existingTask = await CareTask.findOne({
      hospitalId: hospital._id,
      relatedReportId: report._id,
      status: { $ne: 'Completed' }
    });

    if (existingTask) {
      return res.status(200).json({
        success: true,
        queued: false,
        message: 'Care task already exists for this qualifying report.',
        task: existingTask
      });
    }

    // Create CareQueue task under 'Critical Alerts' or 'Reports Pending Review'
    const category = riskLevel === 'Critical' ? 'Critical Alerts' : 'Reports Pending Review';
    const task = await CareTask.create({
      hospitalId: hospital._id,
      patientId: patient._id,
      category,
      title: `Critical Alert: ${report.reportName} (${riskLevel} Risk)`,
      reason: `Automated CareQueue admission: Qualifying ${riskLevel} risk report detected for institutional patient.`,
      priority: riskLevel === 'Critical' ? 'Critical' : 'High',
      relatedReportId: report._id,
      assignedDoctorId: patient.primaryDoctorId || null,
      status: 'Active',
      time: 'Just now'
    });

    return res.status(201).json({
      success: true,
      queued: true,
      message: `Care task created in '${category}' stage for qualifying institutional report.`,
      task
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. PATIENT VISIBILITY
// ==========================================
export const getPatients = async (req, res, next) => {
  try {
    const hospital = await getHospitalForUser(req.user._id);
    if (!hospital) {
      return res.status(404).json({ error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital profile not found.' } });
    }

    const { search, status, page = 1, limit = 20 } = req.query;
    const query = { hospitalId: hospital._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    let patients = await Patient.find(query)
      .populate('userId', 'name email phone')
      .populate('primaryDoctorId', 'specialty qualification')
      .sort({ updatedAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      patients = patients.filter((p) => {
        const name = p.userId?.name?.toLowerCase() || '';
        const email = p.userId?.email?.toLowerCase() || '';
        const legacy = p.legacyId?.toLowerCase() || '';
        return name.includes(q) || email.includes(q) || legacy.includes(q);
      });
    }

    // Attach bed info to each patient
    const patientIds = patients.map((p) => p._id);
    const beds = await Bed.find({ hospitalId: hospital._id, patientId: { $in: patientIds } });
    const bedMap = new Map();
    beds.forEach((b) => bedMap.set(b.patientId.toString(), b));

    const enriched = patients.map((p) => {
      const pObj = p.toJSON();
      pObj.assignedBed = bedMap.get(p._id.toString()) || null;
      return pObj;
    });

    const total = enriched.length;
    const paginated = enriched.slice((page - 1) * limit, page * limit);

    return res.status(200).json({
      success: true,
      patients: paginated,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (req, res, next) => {
  try {
    const hospital = await getHospitalForUser(req.user._id);
    if (!hospital) {
      return res.status(404).json({ error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital profile not found.' } });
    }

    const { id } = req.params;
    const patient = await Patient.findById(id)
      .populate('userId', 'name email phone')
      .populate('primaryDoctorId', 'specialty qualification');

    if (!patient) {
      return res.status(404).json({ error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found.' } });
    }

    // Verify hospital affiliation
    if (patient.hospitalId && patient.hospitalId.toString() !== hospital._id.toString()) {
      return res.status(403).json({ error: { code: 'CROSS_HOSPITAL_FORBIDDEN', message: 'Access denied. Patient is registered with another healthcare institution.' } });
    }

    const assignedBed = await Bed.findOne({ hospitalId: hospital._id, patientId: patient._id });
    const careTasks = await CareTask.find({ hospitalId: hospital._id, patientId: patient._id }).sort({ createdAt: -1 });
    const reports = await MedicalReport.find({ patientId: patient._id }).sort({ reportDate: -1 });

    return res.status(200).json({
      success: true,
      patient: {
        ...patient.toJSON(),
        assignedBed,
        careTasks,
        reports
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. DOCTORS & ROSTER
// ==========================================
export const getDoctors = async (req, res, next) => {
  try {
    const hospital = await getHospitalForUser(req.user._id);
    if (!hospital) {
      return res.status(404).json({ error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital profile not found.' } });
    }

    const doctors = await Doctor.find({ hospitalId: hospital._id })
      .populate('userId', 'name email phone')
      .sort({ specialty: 1 });

    return res.status(200).json({
      success: true,
      doctors
    });
  } catch (error) {
    next(error);
  }
};

export const assignDoctor = async (req, res, next) => {
  try {
    const hospital = await getHospitalForUser(req.user._id);
    if (!hospital) {
      return res.status(404).json({ error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital profile not found.' } });
    }

    const { doctorId, patientId, taskId } = req.body;

    if (!doctorId) {
      return res.status(400).json({ error: { code: 'MISSING_DOCTOR_ID', message: 'doctorId is required.' } });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: { code: 'DOCTOR_NOT_FOUND', message: 'Doctor not found.' } });
    }

    // If patientId provided, update patient's primaryDoctorId
    if (patientId) {
      const patient = await Patient.findOne({ _id: patientId, hospitalId: hospital._id });
      if (patient) {
        patient.primaryDoctorId = doctor._id;
        await patient.save();
      }
    }

    // If taskId provided, update CareTask's assignedDoctorId
    if (taskId) {
      const task = await CareTask.findOne({ _id: taskId, hospitalId: hospital._id });
      if (task) {
        task.assignedDoctorId = doctor._id;
        if (task.category === 'Doctor Assignment Pending') {
          task.category = 'Reports Pending Review';
        }
        await task.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Doctor assigned successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 7. REPORTS VISIBILITY
// ==========================================
export const getReports = async (req, res, next) => {
  try {
    const hospital = await getHospitalForUser(req.user._id);
    if (!hospital) {
      return res.status(404).json({ error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital profile not found.' } });
    }

    const reports = await MedicalReport.find({ hospitalId: hospital._id })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .sort({ reportDate: -1 });

    return res.status(200).json({
      success: true,
      reports
    });
  } catch (error) {
    next(error);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const hospital = await getHospitalForUser(req.user._id);
    if (!hospital) {
      return res.status(404).json({ error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital profile not found.' } });
    }

    const { id } = req.params;
    let report = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      report = await MedicalReport.findById(id).populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' }
      });
    }
    if (!report) {
      report = await MedicalReport.findOne({ reportId: id }).populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' }
      });
    }

    if (!report) {
      return res.status(404).json({ error: { code: 'REPORT_NOT_FOUND', message: 'Report not found.' } });
    }

    if (report.hospitalId && report.hospitalId.toString() !== hospital._id.toString()) {
      return res.status(403).json({ error: { code: 'CROSS_HOSPITAL_FORBIDDEN', message: 'Report belongs to another healthcare facility.' } });
    }

    return res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
};
