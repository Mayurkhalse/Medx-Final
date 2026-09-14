import mongoose from 'mongoose';
import { Lab } from '../models/Lab.js';
import { MedicalReport } from '../models/MedicalReport.js';
import { Patient } from '../models/Patient.js';
import { Hospital } from '../models/Hospital.js';
import { User } from '../models/User.js';
import { analyzeBiomarkersWithML } from '../services/mlService.js';

/**
 * Standard reference ranges and units for common biomarkers.
 * Extensible: unknown parameters are accepted with caller-provided units and ranges.
 */
const STANDARD_REFERENCE_RANGES = {
  glucose_fasting: { unit: 'mg/dL', ref_range: '70 - 99 mg/dL', low: 70, high: 99, critical_high: 200, critical_low: 50 },
  hemoglobin: { unit: 'g/dL', ref_range: '12.0 - 16.0 g/dL', low: 12.0, high: 16.0, critical_low: 8.0, critical_high: 20.0 },
  wbc_count: { unit: 'cells/mcL', ref_range: '4,500 - 11,000 cells/mcL', low: 4500, high: 11000, critical_high: 20000, critical_low: 2000 },
  platelets: { unit: 'cells/mcL', ref_range: '150,000 - 450,000 cells/mcL', low: 150000, high: 450000, critical_low: 50000, critical_high: 1000000 },
  creatinine: { unit: 'mg/dL', ref_range: '0.7 - 1.3 mg/dL', low: 0.7, high: 1.3, critical_high: 3.0, critical_low: 0.4 },
  urea: { unit: 'mg/dL', ref_range: '7 - 20 mg/dL', low: 7, high: 20, critical_high: 50, critical_low: 5 },
  total_cholesterol: { unit: 'mg/dL', ref_range: '< 200 mg/dL', low: 100, high: 200, critical_high: 300, critical_low: 50 },
  triglycerides: { unit: 'mg/dL', ref_range: '< 150 mg/dL', low: 50, high: 150, critical_high: 500, critical_low: 30 },
  hdl_cholesterol: { unit: 'mg/dL', ref_range: '> 40 mg/dL', low: 40, high: 100, critical_low: 20, critical_high: 120 },
  ldl_cholesterol: { unit: 'mg/dL', ref_range: '< 100 mg/dL', low: 50, high: 100, critical_high: 190, critical_low: 40 },
  hba1c: { unit: '%', ref_range: '< 5.7%', low: 4.0, high: 5.6, critical_high: 9.0, critical_low: 3.5 }
};

/**
 * Generate human-readable report ID
 */
function generateReportId() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `REP-LAB-${rand}`;
}

/**
 * Helper to resolve the authenticated lab profile from req.user._id
 */
export async function getLabForUser(userId) {
  let lab = await Lab.findOne({ userId });
  if (!lab) {
    const user = await User.findById(userId);
    if (user && user.role === 'lab_admin') {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      lab = await Lab.create({
        userId: user._id,
        legacyId: `LAB-${randomSuffix}`,
        labName: `${user.name} Diagnostics`,
        code: `LAB-${randomSuffix}`,
        accreditation: 'NABL & CAP Accredited',
        turnaroundHours: 4
      });
    }
  }
  return lab;
}

/**
 * Normalizes parameter entries to canonical parameterDetailSchema
 */
function normalizeParameters(rawParams = {}) {
  const normalized = new Map();

  for (const [key, rawVal] of Object.entries(rawParams)) {
    if (rawVal === undefined || rawVal === null) continue;

    const std = STANDARD_REFERENCE_RANGES[key] || {};
    let value, unit, ref_range, status;

    if (typeof rawVal === 'object' && !Array.isArray(rawVal) && rawVal.value !== undefined) {
      value = rawVal.value;
      unit = rawVal.unit || std.unit || '';
      ref_range = rawVal.ref_range || rawVal.referenceRange || std.ref_range || 'Normal laboratory reference range';
      status = rawVal.status;
    } else {
      value = rawVal;
      unit = std.unit || '';
      ref_range = std.ref_range || 'Normal laboratory reference range';
    }

    // Auto-calculate status if not explicitly given
    if (!status) {
      const num = Number(value);
      if (!isNaN(num) && std.low !== undefined && std.high !== undefined) {
        if (std.critical_high && num >= std.critical_high) status = 'Critical';
        else if (std.critical_low && num <= std.critical_low) status = 'Critical';
        else if (num > std.high) status = 'High';
        else if (num < std.low) status = 'Low';
        else status = 'Normal';
      } else {
        status = 'Normal';
      }
    }

    normalized.set(key, { value, unit, ref_range, status });
  }

  return normalized;
}

// ==========================================
// 1. LAB DASHBOARD
// ==========================================
export const getDashboard = async (req, res, next) => {
  try {
    const lab = await getLabForUser(req.user._id);
    if (!lab) {
      return res.status(404).json({ error: { code: 'LAB_NOT_FOUND', message: 'Laboratory profile not found.' } });
    }

    const [totalReports, finalizedReports, draftReports, criticalReports, recentReports] = await Promise.all([
      MedicalReport.countDocuments({ labId: lab._id }),
      MedicalReport.countDocuments({ labId: lab._id, status: 'Finalized' }),
      MedicalReport.countDocuments({ labId: lab._id, status: 'Draft' }),
      MedicalReport.countDocuments({ labId: lab._id, 'mlResult.riskTier': { $in: ['High', 'Critical'] } }),
      MedicalReport.find({ labId: lab._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('patientId', 'name age gender bloodGroup legacyId phone')
        .populate('hospitalId', 'facilityName')
    ]);

    return res.status(200).json({
      success: true,
      lab,
      stats: {
        totalReports,
        finalizedReports,
        draftReports,
        criticalReports,
        turnaroundHours: lab.turnaroundHours || 4
      },
      recentReports
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. LAB PROFILE
// ==========================================
export const getProfile = async (req, res, next) => {
  try {
    const lab = await getLabForUser(req.user._id);
    if (!lab) {
      return res.status(404).json({ error: { code: 'LAB_NOT_FOUND', message: 'Laboratory profile not found.' } });
    }

    return res.status(200).json({
      success: true,
      lab
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const lab = await getLabForUser(req.user._id);
    if (!lab) {
      return res.status(404).json({ error: { code: 'LAB_NOT_FOUND', message: 'Laboratory profile not found.' } });
    }

    const {
      labName,
      name,
      code,
      phone,
      email,
      contactPerson,
      accreditation,
      turnaroundHours,
      address,
      licenseNumber,
      hospitalId
    } = req.body;

    if (labName || name) lab.labName = (labName || name).trim();
    if (code !== undefined) lab.code = code.trim();
    if (phone !== undefined) lab.phone = phone.trim();
    if (email !== undefined) lab.email = email.trim();
    if (contactPerson !== undefined) lab.contactPerson = contactPerson.trim();
    if (accreditation !== undefined) lab.accreditation = accreditation.trim();
    if (turnaroundHours !== undefined) lab.turnaroundHours = Number(turnaroundHours) || 4;
    if (address !== undefined) lab.address = address.trim();
    if (licenseNumber !== undefined) lab.licenseNumber = licenseNumber.trim();

    if (hospitalId) {
      if (mongoose.Types.ObjectId.isValid(hospitalId)) {
        const hosp = await Hospital.findById(hospitalId);
        if (hosp) lab.hospitalId = hosp._id;
      }
    }

    await lab.save();

    return res.status(200).json({
      success: true,
      message: 'Laboratory profile updated successfully.',
      lab
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. DIAGNOSTIC REPORT OPERATIONS
// ==========================================

/**
 * List all reports issued by this laboratory (IDOR protected)
 */
export const getReports = async (req, res, next) => {
  try {
    const lab = await getLabForUser(req.user._id);
    if (!lab) {
      return res.status(404).json({ error: { code: 'LAB_NOT_FOUND', message: 'Laboratory profile not found.' } });
    }

    const { status, patientId, search, page = 1, limit = 50 } = req.query;

    const filter = { labId: lab._id };

    if (status) {
      filter.status = status;
    }

    if (patientId && mongoose.Types.ObjectId.isValid(patientId)) {
      filter.patientId = patientId;
    }

    if (search) {
      filter.$or = [
        { reportName: { $regex: search, $options: 'i' } },
        { reportId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [reports, total] = await Promise.all([
      MedicalReport.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('patientId', 'name age gender bloodGroup legacyId phone conditions')
        .populate('hospitalId', 'facilityName')
        .populate('reviewedByDoctorId', 'name specialization email'),
      MedicalReport.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      reports,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single report by ID (IDOR protected: only owning lab can view via lab namespace)
 */
export const getReportById = async (req, res, next) => {
  try {
    const lab = await getLabForUser(req.user._id);
    if (!lab) {
      return res.status(404).json({ error: { code: 'LAB_NOT_FOUND', message: 'Laboratory profile not found.' } });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: { code: 'INVALID_ID', message: 'Invalid report ID format.' } });
    }

    const report = await MedicalReport.findById(req.params.id)
      .populate('patientId', 'name age gender bloodGroup legacyId phone conditions allergies vitals')
      .populate('hospitalId', 'facilityName address phone')
      .populate('reviewedByDoctorId', 'name specialization email');

    if (!report) {
      return res.status(404).json({ error: { code: 'REPORT_NOT_FOUND', message: 'Medical report not found.' } });
    }

    // Strict Cross-Lab IDOR Isolation
    if (!report.labId || report.labId.toString() !== lab._id.toString()) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN_CROSS_LAB_ACCESS',
          message: 'Access denied. This diagnostic report belongs to another laboratory facility.'
        }
      });
    }

    return res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new Diagnostic Report using canonical MedicalReport collection
 */
export const createDiagnosticReport = async (req, res, next) => {
  try {
    const lab = await getLabForUser(req.user._id);
    if (!lab) {
      return res.status(404).json({ error: { code: 'LAB_NOT_FOUND', message: 'Laboratory profile not found.' } });
    }

    const {
      patientId,
      hospitalId,
      reportName,
      reportType,
      parameters,
      sampleCollectedAt,
      reportDate,
      status = 'Finalized',
      notes
    } = req.body;

    // 1. Validate Patient Identity
    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PATIENT_ID',
          message: 'A valid patientId is required to associate diagnostic report.'
        }
      });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        error: {
          code: 'PATIENT_NOT_FOUND',
          message: 'Referenced patient profile does not exist in the unified system.'
        }
      });
    }

    // 2. Validate Parameters
    if (!parameters || typeof parameters !== 'object' || Object.keys(parameters).length === 0) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'Biomarker parameters are required for diagnostic report creation.'
        }
      });
    }

    // 3. Resolve Hospital Facility
    let finalHospitalId = null;
    if (hospitalId && mongoose.Types.ObjectId.isValid(hospitalId)) {
      const hosp = await Hospital.findById(hospitalId);
      if (hosp) finalHospitalId = hosp._id;
    } else if (patient.hospitalId) {
      finalHospitalId = patient.hospitalId;
    } else if (lab.hospitalId) {
      finalHospitalId = lab.hospitalId;
    }

    // 4. Normalize parameters and preserve clinical values/ranges
    const normalizedParameters = normalizeParameters(parameters);

    // 5. Build raw object for ML evaluation
    const rawParamObj = {};
    for (const [key, detail] of normalizedParameters.entries()) {
      rawParamObj[key] = detail.value;
    }

    const repDate = reportDate ? new Date(reportDate) : new Date();
    const mlAnalysis = await analyzeBiomarkersWithML(patient.userId, repDate, rawParamObj);

    // 6. Enforce strict Doctor Clinical Review separation:
    // Lab code CANNOT impersonate a doctor or author reviewedByDoctorId
    const reportStatus = status === 'Draft' ? 'Draft' : 'Finalized';
    const isFinalized = reportStatus === 'Finalized';

    const report = await MedicalReport.create({
      reportId: generateReportId(),
      userId: patient.userId,
      patientId: patient._id,
      hospitalId: finalHospitalId,
      labId: lab._id,
      labName: lab.labName,
      reportName: reportName || 'Diagnostic Blood Biomarker Analysis',
      reportType: reportType || 'Complete Blood Count (CBC)',
      sourceType: 'lab_direct',
      parameters: normalizedParameters,
      status: reportStatus,
      sampleCollectedAt: sampleCollectedAt ? new Date(sampleCollectedAt) : new Date(),
      finalizedAt: isFinalized ? new Date() : null,
      finalizedBy: isFinalized ? req.user._id : null,
      notes: notes || '',
      mlResult: mlAnalysis,
      // Strictly separated Doctor Review boundary:
      reviewStatus: 'Pending Review',
      reviewedByDoctorId: null,
      reviewNotes: '',
      reviewedAt: null,
      reportDate: repDate
    });

    const populated = await MedicalReport.findById(report._id)
      .populate('patientId', 'name age gender bloodGroup legacyId phone')
      .populate('hospitalId', 'facilityName');

    return res.status(201).json({
      success: true,
      message: isFinalized
        ? 'Diagnostic report generated and finalized successfully.'
        : 'Diagnostic report draft saved successfully.',
      report: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Finalize/Sign-off on a laboratory report (Lab administrative finalization)
 * Does NOT mark doctor review complete.
 */
export const finalizeReport = async (req, res, next) => {
  try {
    const lab = await getLabForUser(req.user._id);
    if (!lab) {
      return res.status(404).json({ error: { code: 'LAB_NOT_FOUND', message: 'Laboratory profile not found.' } });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: { code: 'INVALID_ID', message: 'Invalid report ID.' } });
    }

    const report = await MedicalReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: { code: 'REPORT_NOT_FOUND', message: 'Report not found.' } });
    }

    // IDOR Protection
    if (!report.labId || report.labId.toString() !== lab._id.toString()) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN_CROSS_LAB_MUTATION',
          message: 'Cannot finalize report belonging to another laboratory facility.'
        }
      });
    }

    if (report.status === 'Finalized') {
      return res.status(200).json({
        success: true,
        message: 'Report is already finalized.',
        report
      });
    }

    report.status = 'Finalized';
    report.finalizedAt = new Date();
    report.finalizedBy = req.user._id;

    // Critical Contract: Lab finalization NEVER writes doctor review metadata
    report.reviewedByDoctorId = report.reviewedByDoctorId || null;

    await report.save();

    return res.status(200).json({
      success: true,
      message: 'Report successfully signed off and finalized by laboratory.',
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update report (Pre-finalization editing only)
 * Prevents mutation if report is already finalized!
 */
export const updateReport = async (req, res, next) => {
  try {
    const lab = await getLabForUser(req.user._id);
    if (!lab) {
      return res.status(404).json({ error: { code: 'LAB_NOT_FOUND', message: 'Laboratory profile not found.' } });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: { code: 'INVALID_ID', message: 'Invalid report ID.' } });
    }

    const report = await MedicalReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: { code: 'REPORT_NOT_FOUND', message: 'Report not found.' } });
    }

    // IDOR check
    if (!report.labId || report.labId.toString() !== lab._id.toString()) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN_CROSS_LAB_MUTATION',
          message: 'Cannot modify report belonging to another laboratory.'
        }
      });
    }

    // Mutability Guard: Prevent altering finalized reports
    if (report.status === 'Finalized') {
      return res.status(400).json({
        error: {
          code: 'REPORT_FINALIZED_IMMUTABLE',
          message: 'This diagnostic report is finalized. Biomarker results are locked to preserve clinical integrity.'
        }
      });
    }

    // Reject attempt by lab to author Doctor review metadata
    if (req.body.reviewedByDoctorId || req.body.reviewStatus || req.body.reviewNotes) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN_DOCTOR_IMPERSONATION',
          message: 'Laboratory staff cannot write or alter Doctor clinical review metadata.'
        }
      });
    }

    const { reportName, reportType, parameters, notes, sampleCollectedAt, status } = req.body;

    if (reportName) report.reportName = reportName.trim();
    if (reportType) report.reportType = reportType.trim();
    if (notes !== undefined) report.notes = notes;
    if (sampleCollectedAt) report.sampleCollectedAt = new Date(sampleCollectedAt);

    if (parameters && typeof parameters === 'object') {
      const normalized = normalizeParameters(parameters);
      report.parameters = normalized;

      const rawParamObj = {};
      for (const [k, d] of normalized.entries()) {
        rawParamObj[k] = d.value;
      }
      report.mlResult = await analyzeBiomarkersWithML(report.userId, report.reportDate, rawParamObj);
    }

    if (status === 'Finalized') {
      report.status = 'Finalized';
      report.finalizedAt = new Date();
      report.finalizedBy = req.user._id;
    }

    await report.save();

    return res.status(200).json({
      success: true,
      message: 'Draft report updated successfully.',
      report
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. PATIENT & HOSPITAL AFFILIATIONS
// ==========================================

/**
 * List registered patients for report assignment
 */
export const getAffiliatedPatients = async (req, res, next) => {
  try {
    const lab = await getLabForUser(req.user._id);
    if (!lab) {
      return res.status(404).json({ error: { code: 'LAB_NOT_FOUND', message: 'Laboratory profile not found.' } });
    }

    const { search, limit = 50 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { legacyId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await Patient.find(filter)
      .limit(Number(limit))
      .select('name age gender bloodGroup legacyId phone hospitalId conditions allergies');

    return res.status(200).json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List active hospital facilities
 */
export const getAffiliatedHospitals = async (req, res, next) => {
  try {
    const hospitals = await Hospital.find({})
      .select('facilityName legacyId address phone totalBeds accreditation')
      .limit(50);

    return res.status(200).json({
      success: true,
      hospitals
    });
  } catch (error) {
    next(error);
  }
};
