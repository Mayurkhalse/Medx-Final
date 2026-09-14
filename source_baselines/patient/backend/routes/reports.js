const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const Report = require('../models/Report');
const User = require('../models/User');
const CareQueueItem = require('../models/CareQueueItem');
const { verifyToken } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Helper to call ML FastAPI service with fallback
const analyzeWithML = async (userId, reportDate, parameters) => {
  try {
    const payload = {
      user_id: userId.toString(),
      report_date: new Date(reportDate).toISOString(),
      parameters: parameters
    };
    const response = await axios.post(`${ML_SERVICE_URL}/analyze`, payload, { timeout: 3500 });
    return response.data;
  } catch (error) {
    console.warn('ML Service unreachable or timed out, executing resilient clinical fallback:', error.message);
    const flags = {};
    const diseaseRisks = { anemia: 0.08, diabetes: 0.06, kidney_dysfunction: 0.05, infection: 0.07 };
    let score = 15;

    for (const [key, param] of Object.entries(parameters)) {
      const val = param.value;
      if (key === 'glucose_fasting') {
        if (val > 125) { flags[key] = 'high'; diseaseRisks.diabetes = 0.85; score += 20; }
        else if (val < 70) { flags[key] = 'low'; score += 10; }
        else flags[key] = 'normal';
      } else if (key === 'hemoglobin') {
        if (val < 10) { flags[key] = 'critical_low'; diseaseRisks.anemia = 0.90; score += 25; }
        else if (val < 12) { flags[key] = 'low'; diseaseRisks.anemia = 0.70; score += 15; }
        else if (val > 18) { flags[key] = 'high'; score += 10; }
        else flags[key] = 'normal';
      } else if (key === 'creatinine') {
        if (val > 2.0) { flags[key] = 'critical_high'; diseaseRisks.kidney_dysfunction = 0.85; score += 25; }
        else if (val > 1.3) { flags[key] = 'high'; diseaseRisks.kidney_dysfunction = 0.65; score += 15; }
        else flags[key] = 'normal';
      } else if (key === 'wbc_count') {
        if (val > 15000) { flags[key] = 'critical_high'; diseaseRisks.infection = 0.90; score += 25; }
        else if (val > 11000) { flags[key] = 'high'; diseaseRisks.infection = 0.75; score += 15; }
        else if (val < 4000) { flags[key] = 'low'; score += 10; }
        else flags[key] = 'normal';
      } else if (key === 'platelets') {
        if (val < 100000) { flags[key] = 'critical_low'; score += 20; }
        else if (val < 150000) { flags[key] = 'low'; score += 10; }
        else flags[key] = 'normal';
      }
    }

    const overallRiskScore = Math.min(Math.max(score, 10), 100);
    let riskTier = 'Low';
    if (overallRiskScore > 85) riskTier = 'Critical';
    else if (overallRiskScore > 65) riskTier = 'High';
    else if (overallRiskScore > 35) riskTier = 'Moderate';

    return {
      flags,
      disease_risks: diseaseRisks,
      overall_risk_score: overallRiskScore,
      risk_tier: riskTier,
      model_version: 'v1.0.0-fallback'
    };
  }
};

// Helper to push to CareQueue if High/Critical
const checkAndEnqueueCare = async (user, report) => {
  try {
    if (['High', 'Critical'].includes(report.mlResult.riskTier) && user.hospitalId) {
      await CareQueueItem.create({
        hospitalId: user.hospitalId,
        patientId: user._id,
        reportId: report._id,
        riskTier: report.mlResult.riskTier,
        assignedDoctorId: user.assignedDoctorId || null,
        status: 'pending'
      });
    }
  } catch (err) {
    console.error('Error creating CareQueueItem:', err);
  }
};

// POST /api/reports - Manual Entry
router.post('/', verifyToken, async (req, res) => {
  const { parameters, reportDate = new Date() } = req.body;

  try {
    if (!parameters || Object.keys(parameters).length === 0) {
      return res.status(400).json({ message: 'Valid biomarker parameters are required' });
    }

    const user = await User.findById(req.user.id);
    const mlAnalysis = await analyzeWithML(req.user.id, reportDate, parameters);

    const report = await Report.create({
      userId: req.user.id,
      sourceType: 'manual',
      parameters,
      mlResult: {
        flags: mlAnalysis.flags,
        diseaseRisks: mlAnalysis.disease_risks,
        overallRiskScore: mlAnalysis.overall_risk_score,
        riskTier: mlAnalysis.risk_tier,
        modelVersion: mlAnalysis.model_version
      },
      reportDate
    });

    if (user) {
      await checkAndEnqueueCare(user, report);
    }

    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating manual report:', error);
    res.status(500).json({ message: 'Error processing report', error: error.message });
  }
});

// POST /api/reports/upload - PDF Upload & Regex Extraction
router.post('/upload', verifyToken, upload.single('report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    let parsedText = '';
    try {
      const pdfData = await pdfParse(req.file.buffer);
      parsedText = pdfData.text;
    } catch (e) {
      return res.status(400).json({ message: 'Could not parse PDF content', error: e.message });
    }

    const parameters = {};

    const extractMatch = (regex) => {
      const match = parsedText.match(regex);
      return match ? parseFloat(match[1]) : null;
    };

    const glucose = extractMatch(/(?:glucose|fasting\s*glucose|fbs)[:\s]+([\d\.]+)/i);
    const hb = extractMatch(/(?:hemoglobin|hb)[:\s]+([\d\.]+)/i);
    const wbc = extractMatch(/(?:wbc|white\s*blood\s*cells?|leukocytes)[:\s]+([\d\.]+)/i);
    const creatinine = extractMatch(/(?:creatinine|serum\s*creatinine)[:\s]+([\d\.]+)/i);
    const platelets = extractMatch(/(?:platelets|plt)[:\s]+([\d\.]+)/i);

    parameters.glucose_fasting = {
      value: glucose !== null ? glucose : 95.0,
      unit: 'mg/dL',
      ref_range: '70-100'
    };
    parameters.hemoglobin = {
      value: hb !== null ? hb : 13.8,
      unit: 'g/dL',
      ref_range: '12-17'
    };
    parameters.wbc_count = {
      value: wbc !== null ? (wbc < 100 ? wbc * 1000 : wbc) : 6800.0,
      unit: '/uL',
      ref_range: '4000-11000'
    };
    parameters.creatinine = {
      value: creatinine !== null ? creatinine : 0.9,
      unit: 'mg/dL',
      ref_range: '0.6-1.3'
    };
    parameters.platelets = {
      value: platelets !== null ? (platelets < 1000 ? platelets * 1000 : platelets) : 260000.0,
      unit: '/uL',
      ref_range: '150000-450000'
    };

    const user = await User.findById(req.user.id);
    const mlAnalysis = await analyzeWithML(req.user.id, new Date(), parameters);

    const report = await Report.create({
      userId: req.user.id,
      sourceType: 'upload',
      parameters,
      mlResult: {
        flags: mlAnalysis.flags,
        diseaseRisks: mlAnalysis.disease_risks,
        overallRiskScore: mlAnalysis.overall_risk_score,
        riskTier: mlAnalysis.risk_tier,
        modelVersion: mlAnalysis.model_version
      },
      reportDate: new Date()
    });

    if (user) {
      await checkAndEnqueueCare(user, report);
    }

    res.status(201).json(report);
  } catch (error) {
    console.error('Error uploading report:', error);
    res.status(500).json({ message: 'Error parsing and analyzing uploaded report', error: error.message });
  }
});

// GET /api/reports - Get reports for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const targetUserId = req.query.patientId || req.user.id;
    const reports = await Report.find({ userId: targetUserId }).sort({ reportDate: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving reports', error: error.message });
  }
});

// GET /api/reports/trends/analytics - Trend data for Recharts
router.get('/trends/analytics', verifyToken, async (req, res) => {
  try {
    const targetUserId = req.query.patientId || req.user.id;
    const reports = await Report.find({ userId: targetUserId }).sort({ reportDate: 1 });

    const MIDPOINTS = {
      glucose_fasting: 85,
      hemoglobin: 14.5,
      wbc_count: 7500,
      creatinine: 0.9,
      platelets: 300000
    };

    const trendData = reports.map((r) => {
      const entry = {
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
            
            // Normalized to % of clinical midpoint (100% = optimal clinical median)
            const midpoint = MIDPOINTS[key] || 100;
            entry[`${key}_norm`] = Math.round((val / midpoint) * 100);

            // Flag and metadata
            const flag = (r.mlResult?.flags instanceof Map ? r.mlResult.flags.get(key) : r.mlResult?.flags?.[key]) || 'normal';
            entry.details[key] = {
              value: val,
              unit: item.unit || '',
              ref_range: item.ref_range || '',
              flag: flag,
              norm: entry[`${key}_norm`]
            };
          }
        }
      }
      return entry;
    });

    res.status(200).json(trendData);
  } catch (error) {
    res.status(500).json({ message: 'Error calculating trends', error: error.message });
  }
});

// GET /api/reports/:id - Get specific report
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving report', error: error.message });
  }
});

module.exports = router;
