import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import {
  getDashboard,
  getProfile,
  updateProfile,
  getBeds,
  createBed,
  updateBedStatus,
  assignBedPatient,
  releaseBed,
  getCareQueue,
  updateCareTask,
  createCareTask,
  evaluateReportForCareQueue,
  getPatients,
  getPatientById,
  getDoctors,
  assignDoctor,
  getReports,
  getReportById
} from '../controllers/hospitalController.js';

const router = Router();

const hospitalAuth = [requireAuth, requireRole(['hospital_admin'])];

// Base workspace info
router.get('/', hospitalAuth, (req, res) => {
  res.status(200).json({
    message: 'Med-X Unified Hospital Operations API',
    user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role }
  });
});

// 1. Dashboard
router.get('/dashboard', hospitalAuth, getDashboard);

// 2. Profile
router.get('/profile', hospitalAuth, getProfile);
router.patch('/profile', hospitalAuth, updateProfile);
router.put('/profile', hospitalAuth, updateProfile);

// 3. Bed Management & ICU
router.get('/beds', hospitalAuth, getBeds);
router.post('/beds', hospitalAuth, createBed);
router.patch('/beds/:id/status', hospitalAuth, updateBedStatus);
router.post('/beds/:id/assign', hospitalAuth, assignBedPatient);
router.post('/beds/:id/release', hospitalAuth, releaseBed);

// 4. Care Queue (6-Stage Pipeline)
router.get('/care-queue', hospitalAuth, getCareQueue);
router.post('/care-queue', hospitalAuth, createCareTask);
router.post('/care-queue/trigger', hospitalAuth, evaluateReportForCareQueue);
router.patch('/care-queue/:id', hospitalAuth, updateCareTask);

// 5. Patient Visibility
router.get('/patients', hospitalAuth, getPatients);
router.get('/patients/:id', hospitalAuth, getPatientById);

// 6. Doctors & Assignments
router.get('/doctors', hospitalAuth, getDoctors);
router.post('/assign-doctor', hospitalAuth, assignDoctor);

// 7. Medical Reports Visibility
router.get('/reports', hospitalAuth, getReports);
router.get('/reports/:id', hospitalAuth, getReportById);

// Unimplemented reserved hospital domain endpoints
router.all('*', (req, res) => {
  res.status(501).json({
    error: {
      code: 'DOMAIN_RESERVED',
      domain: 'hospital',
      message: `The hospital domain endpoint '${req.originalUrl}' is reserved in the Phase 1D unified foundation. Domain features will be migrated in subsequent implementation phases.`
    }
  });
});

export default router;

