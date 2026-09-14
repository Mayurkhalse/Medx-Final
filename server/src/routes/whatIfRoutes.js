import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { askQuestion, getSessionHistory } from '../controllers/whatIfController.js';

const router = Router();

const patientAuth = [requireAuth, requireRole(['patient'])];

router.post('/ask', ...patientAuth, askQuestion);
router.get('/history/:sessionId', ...patientAuth, getSessionHistory);

// Reserved/unmigrated routes under /whatif return 501
router.all('*', (req, res) => {
  res.status(501).json({
    error: {
      code: 'DOMAIN_RESERVED',
      domain: 'patient',
      message: `The patient domain endpoint '${req.originalUrl}' is reserved in the Phase 1D unified foundation. Domain features will be migrated in subsequent implementation phases.`
    }
  });
});

export default router;
