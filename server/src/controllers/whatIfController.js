import axios from 'axios';
import { ChatHistory } from '../models/ChatHistory.js';
import { MedicalReport } from '../models/MedicalReport.js';

// Deterministic physiological fallback rule engine preserved from Patient source baseline
function getPhysiologicalSimulationResponse(question, report) {
  const q = question.toLowerCase();
  const intro = 'Based on your latest recorded laboratory biomarkers: ';
  const disclaimer = '\n\nDisclaimer: This simulation provides predictive physiological interpretations. Consult your physician before changing medication or diet.';

  if (!report) {
    return "I don't see any blood reports on file yet. Once you log your biomarkers, I can simulate physiological lifestyle scenarios tailored specifically to you." + disclaimer;
  }

  const glucoseParam = report.parameters instanceof Map ? report.parameters.get('glucose_fasting') : report.parameters?.glucose_fasting;
  const hbParam = report.parameters instanceof Map ? report.parameters.get('hemoglobin') : report.parameters?.hemoglobin;

  const glucose = glucoseParam?.value || 90;
  const hb = hbParam?.value || 14;

  if (q.includes('walk') || q.includes('exercise') || q.includes('run') || q.includes('workout')) {
    if (glucose > 115) {
      return intro + `A brisk 30-minute daily walk can increase insulin sensitivity and lower fasting glucose by approximately 15-25 mg/dL over 4-6 weeks, bringing your current glucose (${glucose} mg/dL) closer to normal.` + disclaimer;
    } else {
      return intro + `Your glucose is currently stable (${glucose} mg/dL). Regular cardiovascular exercise will help maintain insulin sensitivity and support heart health.` + disclaimer;
    }
  } else if (q.includes('sugar') || q.includes('carb') || q.includes('diet') || q.includes('eat')) {
    return intro + `Reducing high-glycemic carbohydrates and increasing dietary fiber directly reduces postprandial blood sugar spikes. With your current fasting glucose at ${glucose} mg/dL, clean eating will help stabilize metabolic indicators.` + disclaimer;
  } else if (q.includes('iron') || q.includes('spinach') || q.includes('fatigue') || q.includes('tired')) {
    if (hb < 12) {
      return intro + `Your hemoglobin is low at ${hb} g/dL. Incorporating iron-rich foods (spinach, lentils, lean meats) combined with Vitamin C can help restore red blood cell counts.` + disclaimer;
    } else {
      return intro + `Your hemoglobin level (${hb} g/dL) is within normal reference bounds. Fatigue may stem from hydration, sleep deficit, or stress rather than anemia.` + disclaimer;
    }
  }

  return intro + `With an overall health risk score of ${report.mlResult?.overallRiskScore || 25}/100, adopting progressive lifestyle modifications—such as 7-8 hours of sleep, balanced hydration, and 150 minutes of moderate activity per week—will protect your key biomarker levels.` + disclaimer;
}

/**
 * Ask the What-If simulation engine a question.
 */
export async function askQuestion(req, res, next) {
  try {
    const { sessionId, question } = req.body;

    if (!question || !sessionId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Question and sessionId are required.'
        }
      });
    }

    // Retrieve latest patient report for physiological context
    const latestReport = await MedicalReport.findOne({ userId: req.user._id }).sort({ reportDate: -1 });

    let botReply = '';
    const geminiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;

    if (geminiKey && !geminiKey.includes('your_gemini')) {
      try {
        const prompt = `You are MedX What-If AI, an expert medical biomarker interpreter.
User Name: ${req.user.name || 'Patient'}
Latest Lab Report: ${latestReport ? JSON.stringify(Object.fromEntries(latestReport.parameters)) : 'No report on file'}
ML Evaluated Risk Tier: ${latestReport?.mlResult?.riskTier || 'N/A'}
User Scenario/Question: "${question}"

Provide a concise, encouraging physiological interpretation explaining what bodily pathways change and how biomarkers might adjust. Include an explicit medical disclaimer at the end.`;

        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          { contents: [{ parts: [{ text: prompt }] }] },
          { timeout: 7000 }
        );

        botReply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (err) {
        console.warn('Gemini API call failed, falling back to rule-based physiological simulator:', err.message);
        botReply = getPhysiologicalSimulationResponse(question, latestReport);
      }
    } else {
      botReply = getPhysiologicalSimulationResponse(question, latestReport);
    }

    // Persist conversation to ChatHistory
    let chat = await ChatHistory.findOne({ userId: req.user._id, sessionId });
    if (!chat) {
      chat = new ChatHistory({
        userId: req.user._id,
        sessionId,
        messages: []
      });
    }

    chat.messages.push({ role: 'user', content: question, timestamp: new Date() });
    chat.messages.push({ role: 'assistant', content: botReply, timestamp: new Date() });
    await chat.save();

    return res.status(200).json({ message: botReply, sessionId });
  } catch (error) {
    next(error);
  }
}

/**
 * Get conversation history for a given session.
 */
export async function getSessionHistory(req, res, next) {
  try {
    const chat = await ChatHistory.findOne({
      userId: req.user._id,
      sessionId: req.params.sessionId
    });

    return res.status(200).json({ messages: chat ? chat.messages : [] });
  } catch (error) {
    next(error);
  }
}

export default { askQuestion, getSessionHistory };
