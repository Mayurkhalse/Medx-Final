import axios from 'axios';
import config from '../config/config.js';

/**
 * Invokes the preserved FastAPI ML microservice (/analyze) with resilient clinical fallback.
 *
 * @param {string} userId - Canonical user ID
 * @param {Date|string} reportDate - Date of the medical report
 * @param {Object} parameters - Biomarker parameters map
 * @returns {Promise<Object>} Formatted ML analysis response
 */
export async function analyzeBiomarkersWithML(userId, reportDate, parameters) {
  try {
    const payload = {
      user_id: userId ? userId.toString() : 'anonymous',
      report_date: new Date(reportDate || Date.now()).toISOString(),
      parameters: parameters
    };

    const response = await axios.post(`${config.ML_SERVICE_URL}/analyze`, payload, {
      timeout: 4000,
      headers: { 'Content-Type': 'application/json' }
    });

    return {
      flags: response.data.flags || {},
      diseaseRisks: response.data.disease_risks || {},
      overallRiskScore: response.data.overall_risk_score || 0,
      riskTier: response.data.risk_tier || 'Low',
      modelVersion: response.data.model_version || 'v1.0.0'
    };
  } catch (error) {
    console.warn(`[ML SERVICE BOUNDARY] ML Service at ${config.ML_SERVICE_URL} unreachable or timed out (${error.message}). Executing authoritative clinical reference fallback.`);
    
    // Authoritative clinical reference fallback preserved from source baseline
    const flags = {};
    const diseaseRisks = { anemia: 0.08, diabetes: 0.06, kidney_dysfunction: 0.05, infection: 0.07 };
    let score = 15;

    for (const [key, param] of Object.entries(parameters || {})) {
      const val = typeof param === 'object' && param !== null ? Number(param.value) : Number(param);
      if (isNaN(val)) continue;

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
      diseaseRisks,
      overallRiskScore,
      riskTier,
      modelVersion: 'v1.0.0-clinical-fallback'
    };
  }
}

export default { analyzeBiomarkersWithML };
