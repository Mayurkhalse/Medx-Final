import { MedicalReport } from '../models/MedicalReport.js';
import { Patient } from '../models/Patient.js';
import { analyzeBiomarkersWithML } from '../services/mlService.js';
import { extractBiomarkersFromPdf } from '../services/pdfExtractor.js';

// Clinical midpoints preserved from Patient source baseline for trendline normalization
const MIDPOINTS = {
  glucose_fasting: 85,
  hemoglobin: 14.5,
  wbc_count: 7500,
  creatinine: 0.9,
  platelets: 300000
};

// Generates human-readable dual-key legacy ID (e.g. RPT-4821)
function generateReportLegacyId() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RPT-${rand}`;
}

/**
 * Create a new report via manual biomarker entry.
 */
export async function createManualReport(req, res, next) {
  try {
    const { parameters, reportDate = new Date(), reportName, reportType } = req.body;

    if (!parameters || typeof parameters !== 'object' || Object.keys(parameters).length === 0) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'Valid biomarker parameters are required for manual report entry.'
        }
      });
    }

    // Resolve patient profile linked to authenticated user
    const patientProfile = await Patient.findOne({ userId: req.user._id });
    const patientId = patientProfile ? patientProfile._id : null;
    const hospitalId = patientProfile?.hospitalId || null;

    // Execute ML intelligence analysis (or authoritative fallback)
    const mlAnalysis = await analyzeBiomarkersWithML(req.user._id, reportDate, parameters);

    const report = await MedicalReport.create({
      reportId: generateReportLegacyId(),
      userId: req.user._id,
      patientId,
      hospitalId,
      sourceType: 'manual',
      reportName: reportName || 'Manual Blood Biomarker Entry',
      reportType: reportType || 'Complete Blood Count (CBC)',
      parameters,
      mlResult: mlAnalysis,
      reportDate: new Date(reportDate)
    });

    return res.status(201).json(report);
  } catch (error) {
    next(error);
  }
}

/**
 * Upload and parse a PDF diagnostic report.
 */
export async function uploadPdfReport(req, res, next) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        error: {
          code: 'NO_FILE_UPLOADED',
          message: 'Please upload a valid laboratory report PDF file.'
        }
      });
    }

    let extracted;
    try {
      extracted = await extractBiomarkersFromPdf(req.file.buffer);
    } catch (parseErr) {
      return res.status(400).json({
        error: {
          code: 'PDF_PARSE_ERROR',
          message: `Failed to extract text from PDF: ${parseErr.message}`
        }
      });
    }

    // Resolve patient profile
    const patientProfile = await Patient.findOne({ userId: req.user._id });
    const patientId = patientProfile ? patientProfile._id : null;
    const hospitalId = patientProfile?.hospitalId || null;

    // Run ML analysis
    const mlAnalysis = await analyzeBiomarkersWithML(req.user._id, new Date(), extracted.parameters);

    const report = await MedicalReport.create({
      reportId: generateReportLegacyId(),
      userId: req.user._id,
      patientId,
      hospitalId,
      sourceType: 'upload',
      reportName: req.file.originalname || 'Uploaded Lab Report',
      reportType: 'Complete Blood Count (CBC)',
      parameters: extracted.parameters,
      mlResult: mlAnalysis,
      reportDate: new Date()
    });

    return res.status(201).json(report);
  } catch (error) {
    next(error);
  }
}

/**
 * Get report history strictly scoped to the authenticated patient.
 */
export async function getReports(req, res, next) {
  try {
    // Strict ownership: A patient can only view their own records
    const reports = await MedicalReport.find({ userId: req.user._id }).sort({ reportDate: -1 });
    return res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
}

/**
 * Get a specific report by ID with strict ownership authorization.
 */
export async function getReportById(req, res, next) {
  try {
    const report = await MedicalReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        error: {
          code: 'REPORT_NOT_FOUND',
          message: 'Medical report not found.'
        }
      });
    }

    // Server-side ownership verification: Reject unauthorized cross-patient queries
    if (!report.userId.equals(req.user._id) && req.user.role === 'patient') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: You do not own this medical report.'
        }
      });
    }

    return res.status(200).json(report);
  } catch (error) {
    next(error);
  }
}

/**
 * Get biomarker trend analytics formatted for Recharts.
 */
export async function getBiomarkerTrends(req, res, next) {
  try {
    const reports = await MedicalReport.find({ userId: req.user._id }).sort({ reportDate: 1 });

    const trendData = reports.map((r) => {
      const entry = {
        id: r._id,
        reportId: r.reportId,
        date: r.reportDate.toISOString().split('T')[0],
        riskScore: r.mlResult?.overallRiskScore || 0,
        riskTier: r.mlResult?.riskTier || 'Low',
        details: {}
      };

      if (r.parameters) {
        const paramEntries = r.parameters instanceof Map
          ? Array.from(r.parameters.entries())
          : Object.entries(r.parameters);

        for (const [key, item] of paramEntries) {
          if (item && item.value !== undefined && item.value !== null) {
            const val = Number(item.value);
            entry[key] = val;

            const midpoint = MIDPOINTS[key] || 100;
            entry[`${key}_norm`] = Math.round((val / midpoint) * 100);

            const flag = (r.mlResult?.flags instanceof Map ? r.mlResult.flags.get(key) : r.mlResult?.flags?.[key]) || 'normal';

            entry.details[key] = {
              value: val,
              unit: item.unit || '',
              ref_range: item.ref_range || '',
              flag,
              norm: entry[`${key}_norm`]
            };
          }
        }
      }

      return entry;
    });

    return res.status(200).json(trendData);
  } catch (error) {
    next(error);
  }
}

/**
 * Record a continuous 1-minute IoT vital signs session into Medical Reports and update Patient vitals.
 */
export async function createIotReport(req, res, next) {
  try {
    const {
      durationSeconds = 60,
      avgBpm,
      minBpm,
      maxBpm,
      avgSpo2,
      minSpo2,
      maxSpo2,
      avgEcg,
      avgPpg,
      totalSamples = 0,
      sessionNotes = '',
      reportName = 'IoT Live Vital Monitoring Session (1-Min)'
    } = req.body;

    const bpmVal = Math.round(Number(avgBpm) || 0);
    const spo2Val = Math.round(Number(avgSpo2) || 0);

    if (bpmVal <= 0 && spo2Val <= 0) {
      return res.status(400).json({
        error: {
          code: 'INVALID_IOT_VITALS',
          message: 'Valid physiological readings (Heart Rate or SpO2) are required from the IoT monitoring session.'
        }
      });
    }

    // Resolve patient profile linked to authenticated user
    const patientProfile = await Patient.findOne({ userId: req.user._id });
    const patientId = patientProfile ? patientProfile._id : null;
    const hospitalId = patientProfile?.hospitalId || null;

    // Evaluate clinical status for vital signs
    let bpmStatus = 'Normal';
    let bpmFlag = 'normal';
    if (bpmVal > 100) { bpmStatus = 'High'; bpmFlag = 'high'; }
    else if (bpmVal < 60) { bpmStatus = 'Low'; bpmFlag = 'low'; }

    let spo2Status = 'Normal';
    let spo2Flag = 'normal';
    if (spo2Val < 90) { spo2Status = 'Critical'; spo2Flag = 'critical_low'; }
    else if (spo2Val < 95) { spo2Status = 'Low'; spo2Flag = 'low'; }

    const parameters = {
      heart_rate: {
        value: bpmVal,
        unit: 'BPM',
        ref_range: '60-100',
        status: bpmStatus
      },
      spo2: {
        value: spo2Val,
        unit: '%',
        ref_range: '95-100',
        status: spo2Status
      }
    };

    if (avgEcg !== undefined && avgEcg !== null) {
      parameters.ecg_mean = {
        value: Math.round(Number(avgEcg)),
        unit: 'ADC (0-4095)',
        ref_range: '1000-3000',
        status: 'Normal'
      };
    }

    if (avgPpg !== undefined && avgPpg !== null) {
      parameters.ppg_amplitude = {
        value: Math.round(Number(avgPpg)),
        unit: 'counts',
        ref_range: '>50000',
        status: 'Normal'
      };
    }

    // Clinical Risk Assessment
    let overallRiskScore = 15;
    const diseaseRisks = {
      arrhythmia_risk: bpmStatus !== 'Normal' ? (bpmVal > 120 || bpmVal < 50 ? 0.75 : 0.45) : 0.05,
      hypoxemia_risk: spo2Status === 'Critical' ? 0.90 : (spo2Status === 'Low' ? 0.60 : 0.04),
      cardiovascular_strain: (bpmStatus !== 'Normal' || spo2Status !== 'Normal') ? 0.55 : 0.06
    };

    if (spo2Status === 'Critical' || bpmVal > 130 || bpmVal < 45) {
      overallRiskScore = 85;
    } else if (spo2Status === 'Low' || bpmStatus !== 'Normal') {
      overallRiskScore = 48;
    }

    let riskTier = 'Low';
    if (overallRiskScore >= 80) riskTier = 'Critical';
    else if (overallRiskScore >= 60) riskTier = 'High';
    else if (overallRiskScore >= 35) riskTier = 'Moderate';

    const report = await MedicalReport.create({
      reportId: generateReportLegacyId(),
      userId: req.user._id,
      patientId,
      hospitalId,
      sourceType: 'iot_device',
      reportName,
      reportType: 'Real-Time Vital Signs & Continuous Telemetry',
      parameters,
      mlResult: {
        flags: {
          heart_rate: bpmFlag,
          spo2: spo2Flag
        },
        diseaseRisks,
        overallRiskScore,
        riskTier,
        modelVersion: 'v1.0.0-iot-telemetry'
      },
      notes: sessionNotes || `Continuous ${durationSeconds}s IoT vital screening via ESP32, MAX30105 PPG & AD8232 ECG. Samples: ${totalSamples}. BPM Range: ${minBpm || bpmVal}-${maxBpm || bpmVal}. SpO2 Range: ${minSpo2 || spo2Val}-${maxSpo2 || spo2Val}%.`,
      reportDate: new Date()
    });

    // Update patient profile vital signs in database
    if (patientProfile) {
      patientProfile.vitalSigns = {
        ...patientProfile.vitalSigns,
        heartRate: bpmVal,
        spo2: `${spo2Val}%`,
        oxygenSaturation: spo2Val,
        recordedAt: new Date()
      };
      await patientProfile.save();
    }

    return res.status(201).json({
      success: true,
      message: '1-minute IoT vital monitoring session recorded and saved to clinical records.',
      report
    });
  } catch (error) {
    next(error);
  }
}

export default {
  createManualReport,
  uploadPdfReport,
  createIotReport,
  getReports,
  getReportById,
  getBiomarkerTrends
};

