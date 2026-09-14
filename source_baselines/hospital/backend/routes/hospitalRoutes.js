import express from 'express';
import {
  getDashboard,
  getPatients,
  getPatientById,
  getReports,
  getReportById,
  reviewReport,
  getAlerts,
  updateAlert,
  getDoctors,
  assignDoctor,
  getCareQueue,
  updateCareTask,
  getAppointments,
  updateAppointment,
  getDepartments,
  getAnalytics,
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/hospitalController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = express.Router();

// Apply auth and hospital_admin role check to all hospital endpoints
router.use(requireAuth);
router.use(requireRole('hospital_admin'));

// Dashboard
router.get('/dashboard', getDashboard);

// Patients
router.get('/patients', getPatients);
router.get('/patients/:id', getPatientById);

// Reports
router.get('/reports', getReports);
router.get('/reports/:id', getReportById);
router.patch('/reports/:id/review', reviewReport);

// Critical Alerts
router.get('/alerts', getAlerts);
router.patch('/alerts/:id', updateAlert);

// Doctors & Assignment
router.get('/doctors', getDoctors);
router.post('/assign-doctor', assignDoctor);

// Care Queue
router.get('/care-queue', getCareQueue);
router.patch('/care-queue/:id', updateCareTask);

// Appointments
router.get('/appointments', getAppointments);
router.patch('/appointments/:id', updateAppointment);

// Departments
router.get('/departments', getDepartments);

// Analytics
router.get('/analytics', getAnalytics);

// Hospital Profile
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.put('/profile', updateProfile);

// Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.post('/notifications/mark-all-read', markAllNotificationsRead);

export default router;
