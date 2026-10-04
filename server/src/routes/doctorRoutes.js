import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorPatients,
  getDoctorPatientById,
  createDoctorPatient,
  addPrescription,
  addClinicalNote,
  addFollowup,
  getDoctorReports,
  getDoctorReportById,
  reviewMedicalReport,
  getDoctorQueue,
  updateDoctorQueueStatus,
  getDoctorAppointments,
  createDoctorAppointment,
  updateDoctorAppointment
} from '../controllers/doctorController.js';

const router = Router();

// Base workspace info
router.get('/', requireAuth, requireRole(['doctor']), (req, res) => {
  res.status(200).json({
    message: 'Med-X Unified Doctor Workspace API',
    user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role }
  });
});

// Profile endpoints
router.get('/profile', requireAuth, requireRole(['doctor']), getDoctorProfile);
router.put('/profile', requireAuth, requireRole(['doctor']), updateDoctorProfile);

// Patient management & roster endpoints
router.get('/patients', requireAuth, requireRole(['doctor']), getDoctorPatients);
router.post('/patients', requireAuth, requireRole(['doctor']), createDoctorPatient);
router.get('/patients/:id', requireAuth, requireRole(['doctor']), getDoctorPatientById);

// Clinical actions: Prescription, Notes, Follow-ups
router.post('/patients/:id/prescriptions', requireAuth, requireRole(['doctor']), addPrescription);
router.post('/patients/:id/notes', requireAuth, requireRole(['doctor']), addClinicalNote);
router.post('/patients/:id/followups', requireAuth, requireRole(['doctor']), addFollowup);

// Appointments (Canonical Appointment collection)
router.get('/appointments', requireAuth, requireRole(['doctor']), getDoctorAppointments);
router.post('/appointments', requireAuth, requireRole(['doctor']), createDoctorAppointment);
router.patch('/appointments/:id', requireAuth, requireRole(['doctor']), updateDoctorAppointment);
router.put('/appointments/:id', requireAuth, requireRole(['doctor']), updateDoctorAppointment);

// Canonical MedicalReport retrieval & review
router.get('/reports', requireAuth, requireRole(['doctor']), getDoctorReports);
router.get('/reports/:id', requireAuth, requireRole(['doctor']), getDoctorReportById);
router.put('/reports/:id/review', requireAuth, requireRole(['doctor']), reviewMedicalReport);

// Clinical live queue
router.get('/queue', requireAuth, requireRole(['doctor']), getDoctorQueue);
router.patch('/queue/:id/status', requireAuth, requireRole(['doctor']), updateDoctorQueueStatus);
router.put('/queue/:id/status', requireAuth, requireRole(['doctor']), updateDoctorQueueStatus);

// Unmatched routes under /doctor return 501 DOMAIN_RESERVED
router.all('*', (req, res) => {
  res.status(501).json({
    error: {
      code: 'DOMAIN_RESERVED',
      domain: 'doctor',
      message: `The doctor domain endpoint '${req.originalUrl}' is reserved in the Phase 1D unified foundation. Domain features will be migrated in subsequent implementation phases.`
    }
  });
});

export default router;
