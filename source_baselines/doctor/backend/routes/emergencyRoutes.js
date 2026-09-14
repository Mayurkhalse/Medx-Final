import express from 'express';
import {
  getEmergencyAlerts,
  createEmergencyAlert,
  acknowledgeEmergencyAlert,
  getEmergencyWorkflow,
  updateEmergencyWorkflow
} from '../controllers/emergencyController.js';

const router = express.Router();

router.get('/', getEmergencyAlerts);
router.post('/', createEmergencyAlert);
router.delete('/:id', acknowledgeEmergencyAlert);
router.put('/:id/acknowledge', acknowledgeEmergencyAlert);

router.get('/workflow', getEmergencyWorkflow);
router.put('/workflow', updateEmergencyWorkflow);

export default router;
