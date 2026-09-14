import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import {
  createEmergencyAlert,
  getEmergencyAlerts,
  getEmergencyAlertById,
  acknowledgeEmergencyAlert,
  dispatchEmergencyAlert,
  resolveEmergencyAlert,
  getActiveSOSCount
} from '../controllers/emergencyController.js';

const router = Router();

// All emergency routes require authentication
router.use(requireAuth);

// Emergency SOS Trigger (Patient role)
router.post('/trigger', requireRole(['patient']), createEmergencyAlert);
router.post('/', requireRole(['patient']), createEmergencyAlert);

// Active Emergency Count for Notification Badges
router.get('/stats/active-count', requireRole(['patient', 'doctor', 'hospital_admin']), getActiveSOSCount);

// List Emergency Alerts (Role-scoped query)
router.get('/', requireRole(['patient', 'doctor', 'hospital_admin']), getEmergencyAlerts);

// Specific Alert Details
router.get('/:id', requireRole(['patient', 'doctor', 'hospital_admin']), getEmergencyAlertById);

// Acknowledge Emergency Alert (Doctor & Hospital Admin)
router.post('/:id/ack', requireRole(['doctor', 'hospital_admin']), acknowledgeEmergencyAlert);
router.put('/:id/acknowledge', requireRole(['doctor', 'hospital_admin']), acknowledgeEmergencyAlert);
router.delete('/:id', requireRole(['doctor', 'hospital_admin']), acknowledgeEmergencyAlert);

// Dispatch Emergency Response (Doctor & Hospital Admin)
router.patch('/:id/dispatch', requireRole(['doctor', 'hospital_admin']), dispatchEmergencyAlert);

// Resolve Emergency Alert (Doctor, Hospital Admin, or Patient for own alert)
router.post('/:id/resolve', requireRole(['patient', 'doctor', 'hospital_admin']), resolveEmergencyAlert);

// Unmatched routes under /emergency return 501 DOMAIN_RESERVED
router.all('*', (req, res) => {
  res.status(501).json({
    error: {
      code: 'DOMAIN_RESERVED',
      domain: 'emergency',
      message: `The emergency domain endpoint '${req.originalUrl}' is reserved in the Phase 1D unified foundation. Domain features will be migrated in subsequent implementation phases.`
    }
  });
});

export default router;
