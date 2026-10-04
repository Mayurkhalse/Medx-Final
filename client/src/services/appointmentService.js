import api from './api.js';

export const appointmentService = {
  /**
   * Get appointments for current user (role-aware: patient gets own, doctor gets assigned)
   */
  getAppointments: async (params = {}) => {
    const res = await api.get('/appointments', { params });
    return res.data;
  },

  /**
   * Get list of available doctors for appointment scheduling
   */
  getAvailableDoctors: async () => {
    const res = await api.get('/appointments/doctors');
    return res.data;
  },

  /**
   * Create / schedule a new appointment
   */
  createAppointment: async (appointmentData) => {
    const res = await api.post('/appointments', appointmentData);
    return res.data;
  },

  /**
   * Update appointment details
   */
  updateAppointment: async (id, updateData) => {
    const res = await api.patch(`/appointments/${id}`, updateData);
    return res.data;
  },

  /**
   * Accept / Confirm appointment (Doctor action)
   */
  acceptAppointment: async (id) => {
    const res = await api.patch(`/appointments/${id}`, { status: 'Confirmed' });
    return res.data;
  },

  /**
   * Cancel appointment (Patient or Doctor action)
   */
  cancelAppointment: async (id, reason = '') => {
    const res = await api.patch(`/appointments/${id}`, { status: 'Cancelled', notes: reason });
    return res.data;
  },

  /**
   * Reschedule appointment date and time
   */
  rescheduleAppointment: async (id, { appointmentDate, timeSlot }) => {
    const res = await api.patch(`/appointments/${id}`, {
      appointmentDate,
      timeSlot,
      status: 'Scheduled'
    });
    return res.data;
  },

  /**
   * Mark patient as arrived / waiting outside
   */
  markWaiting: async (id) => {
    const res = await api.patch(`/doctor/queue/${id}/status`, { status: 'Waiting' });
    return res.data;
  },

  /**
   * Call patient into cabin / start consultation
   */
  callInPatient: async (id) => {
    const res = await api.patch(`/doctor/queue/${id}/status`, { status: 'In-Consultation' });
    return res.data;
  },

  /**
   * Mark appointment as completed
   */
  completeAppointment: async (id) => {
    const res = await api.patch(`/doctor/queue/${id}/status`, { status: 'Completed' });
    return res.data;
  },

  /**
   * Generic queue status update
   */
  updateQueueStatus: async (id, status, notes = '') => {
    const res = await api.patch(`/doctor/queue/${id}/status`, { status, notes });
    return res.data;
  },

  /**
   * Check in via Appointment ID (QR Code Check-in)
   */
  checkIn: async (appointmentCode) => {
    const res = await api.post('/appointments/check-in', { appointmentCode });
    return res.data;
  },

  /**
   * Get live waiting room queue tracking for an appointment
   */
  getLiveQueue: async (appointmentId) => {
    const res = await api.get(`/appointments/${appointmentId}/live-queue`);
    return res.data;
  }
};

export default appointmentService;
