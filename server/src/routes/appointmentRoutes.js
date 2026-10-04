import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getAppointments,
  getAvailableDoctors,
  createAppointment,
  updateAppointment,
  getAppointmentById,
  checkInAppointment,
  getLiveQueueForAppointment
} from '../controllers/appointmentController.js';

const router = Router();

// All appointment endpoints require authentication
router.use(requireAuth);

// 1. Available doctors directory for appointment scheduling
router.get('/doctors', getAvailableDoctors);

// 2. Patient Self Check-in via QR / Appointment ID
router.post('/check-in', checkInAppointment);

// 3. Live waiting room tracker for a checked-in appointment
router.get('/:id/live-queue', getLiveQueueForAppointment);

// 4. Core Appointment CRUD
router.get('/', getAppointments);
router.post('/', createAppointment);
router.get('/:id', getAppointmentById);
router.patch('/:id', updateAppointment);
router.put('/:id', updateAppointment);

export default router;
