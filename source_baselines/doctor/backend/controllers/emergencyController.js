import EmergencyAlert from '../models/EmergencyAlert.js';
import EmergencyWorkflow from '../models/EmergencyWorkflow.js';

// GET /api/emergency
export const getEmergencyAlerts = async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching emergency alerts', error: error.message });
  }
};

// POST /api/emergency
export const createEmergencyAlert = async (req, res) => {
  try {
    const alertData = req.body;
    if (!alertData.id) {
      alertData.id = `EMG-${Math.floor(100 + Math.random() * 900)}`;
    }
    const newAlert = new EmergencyAlert(alertData);
    await newAlert.save();
    res.status(201).json(newAlert);
  } catch (error) {
    res.status(500).json({ message: 'Error creating emergency alert', error: error.message });
  }
};

// DELETE /api/emergency/:id (Acknowledge / Dismiss alert)
export const acknowledgeEmergencyAlert = async (req, res) => {
  try {
    const deleted = await EmergencyAlert.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ message: 'Emergency alert not found' });
    }
    res.json({ message: 'Emergency alert acknowledged', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error acknowledging emergency alert', error: error.message });
  }
};

// GET /api/emergency/workflow
export const getEmergencyWorkflow = async (req, res) => {
  try {
    const workflow = await EmergencyWorkflow.findOne();
    if (!workflow) {
      return res.status(404).json({ message: 'Emergency workflow not found' });
    }
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching emergency workflow', error: error.message });
  }
};

// PUT /api/emergency/workflow
export const updateEmergencyWorkflow = async (req, res) => {
  try {
    let workflow = await EmergencyWorkflow.findOne();
    if (!workflow) {
      workflow = new EmergencyWorkflow(req.body);
    } else {
      Object.assign(workflow, req.body);
    }
    await workflow.save();
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ message: 'Error updating emergency workflow', error: error.message });
  }
};
