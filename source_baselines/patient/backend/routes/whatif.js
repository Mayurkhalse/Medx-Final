const express = require('express');
const router = express.Router();
const axios = require('axios');
const ChatHistory = require('../models/ChatHistory');
const Report = require('../models/Report');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const GEMINI_API_KEY = process.env.LLM_API_KEY;

// Deterministic clinical fallback if LLM key is absent or API is down
const getMockResponse = (question, report) => {
  const q = question.toLowerCase();
  const intro = "Based on your latest recorded laboratory values: ";
  const disclaimer = "\n\nDisclaimer: This simulation provides predictive physiological interpretations. Consult your physician before changing medication or diet.";

  if (!report) {
    return "I don't see any blood reports on file yet. Once you log your biomarkers, I can simulate physiological lifestyle scenarios tailored specifically to you." + disclaimer;
  }

  const glucose = report.parameters?.get ? report.parameters.get('glucose_fasting')?.value : report.parameters?.glucose_fasting?.value || 90;
  const hb = report.parameters?.get ? report.parameters.get('hemoglobin')?.value : report.parameters?.hemoglobin?.value || 14;

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
};

// POST /api/whatif/ask
router.post('/ask', verifyToken, async (req, res) => {
  const { sessionId, question } = req.body;

  if (!question || !sessionId) {
    return res.status(400).json({ message: 'Question and sessionId are required' });
  }

  try {
    const user = await User.findById(req.user.id);
    const latestReport = await Report.findOne({ userId: req.user.id }).sort({ reportDate: -1 });

    let botReply = '';

    if (GEMINI_API_KEY && !GEMINI_API_KEY.includes('your_gemini')) {
      try {
        const prompt = `You are MedX What-If AI, an expert medical biomarker interpreter.
User Name: ${user?.name || 'Patient'}
User Demographics: Gender: ${user?.gender || 'N/A'}, DOB: ${user?.dob || 'N/A'}
Latest Lab Report:
${latestReport ? JSON.stringify(latestReport.parameters) : 'No report on file'}
ML Evaluated Risk Tier: ${latestReport?.mlResult?.riskTier || 'N/A'}
ML Disease Probabilities: ${latestReport ? JSON.stringify(latestReport.mlResult?.diseaseRisks) : 'N/A'}

User Scenario/Question: "${question}"

Provide a concise, encouraging physiological interpretation explaining what bodily pathways change and how biomarkers might adjust. Include an explicit medical disclaimer at the end.`;

        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: prompt }] }]
          },
          { timeout: 8000 }
        );

        botReply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (err) {
        console.warn('Gemini API call failed, using mock response:', err.message);
        botReply = getMockResponse(question, latestReport);
      }
    } else {
      botReply = getMockResponse(question, latestReport);
    }

    // Persist to ChatHistory
    let chat = await ChatHistory.findOne({ userId: req.user.id, sessionId });
    if (!chat) {
      chat = new ChatHistory({
        userId: req.user.id,
        sessionId,
        messages: []
      });
    }

    chat.messages.push({ role: 'user', content: question, timestamp: new Date() });
    chat.messages.push({ role: 'assistant', content: botReply, timestamp: new Date() });
    await chat.save();

    res.status(200).json({ message: botReply, sessionId });
  } catch (error) {
    console.error('What-If error:', error);
    res.status(500).json({ message: 'Error processing simulation question', error: error.message });
  }
});

// GET /api/whatif/history/:sessionId
router.get('/history/:sessionId', verifyToken, async (req, res) => {
  try {
    const chat = await ChatHistory.findOne({
      userId: req.user.id,
      sessionId: req.params.sessionId
    });
    res.status(200).json({ messages: chat ? chat.messages : [] });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving chat history', error: error.message });
  }
});

module.exports = router;
