import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import {
  getDashboard,
  getProfile,
  updateProfile,
  getReports,
  getReportById,
  createDiagnosticReport,
  finalizeReport,
  updateReport,
  getAffiliatedPatients,
  getAffiliatedHospitals
} from '../controllers/labController.js';

const router = Router();

// Strict RBAC: All laboratory endpoints require lab_admin role
const labAuth = [requireAuth, requireRole(['lab_admin'])];

// Workspace root verification
router.get('/', labAuth, (req, res) => {
  res.status(200).json({
    message: 'Med-X Unified Laboratory Management API',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// 1. Dashboard
router.get('/dashboard', labAuth, getDashboard);

// 2. Profile
router.get('/profile', labAuth, getProfile);
router.put('/profile', labAuth, updateProfile);
router.patch('/profile', labAuth, updateProfile);

// 3. Diagnostic Reports (Canonical MedicalReport collection)
router.get('/reports', labAuth, getReports);
router.post('/reports', labAuth, createDiagnosticReport);
router.get('/reports/:id', labAuth, getReportById);
router.put('/reports/:id', labAuth, updateReport);
router.patch('/reports/:id', labAuth, updateReport);
router.post('/reports/:id/finalize', labAuth, finalizeReport);

// 4. Affiliated Patients & Facilities
router.get('/patients', labAuth, getAffiliatedPatients);
router.get('/hospitals', labAuth, getAffiliatedHospitals);

// Reserved sub-paths boundary fallback
router.all('*', (req, res) => {
  res.status(501).json({
    error: {
      code: 'DOMAIN_RESERVED',
      domain: 'lab',
      message: `The lab domain endpoint '${req.originalUrl}' is reserved in the Phase 1D unified foundation. Domain features will be migrated in subsequent implementation phases.`
    }
  });
});

export default router;
