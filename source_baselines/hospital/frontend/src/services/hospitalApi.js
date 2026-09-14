import api from './api';

export const hospitalApi = {
  // Dashboard
  getDashboard: async (timeframe = '7days') => {
    const res = await api.get(`/hospital/dashboard?timeframe=${timeframe}`);
    return res.data;
  },

  // Patients
  getPatients: async (params = {}) => {
    const res = await api.get('/hospital/patients', { params });
    return res.data;
  },

  getPatientById: async (id) => {
    const res = await api.get(`/hospital/patients/${id}`);
    return res.data;
  },

  // Reports
  getReports: async (params = {}) => {
    const res = await api.get('/hospital/reports', { params });
    return res.data;
  },

  getReportById: async (id) => {
    const res = await api.get(`/hospital/reports/${id}`);
    return res.data;
  },

  reviewReport: async (id, data) => {
    const res = await api.patch(`/hospital/reports/${id}/review`, data);
    return res.data;
  },

  // Health Alerts
  getAlerts: async (params = {}) => {
    const res = await api.get('/hospital/alerts', { params });
    return res.data;
  },

  updateAlert: async (id, data) => {
    const res = await api.patch(`/hospital/alerts/${id}`, data);
    return res.data;
  },

  // Doctors & Assignment
  getDoctors: async (params = {}) => {
    const res = await api.get('/hospital/doctors', { params });
    return res.data;
  },

  assignDoctor: async (assignmentData) => {
    const res = await api.post('/hospital/assign-doctor', assignmentData);
    return res.data;
  },

  // Care Queue
  getCareQueue: async () => {
    const res = await api.get('/hospital/care-queue');
    return res.data;
  },

  updateCareTask: async (id, data) => {
    const res = await api.patch(`/hospital/care-queue/${id}`, data);
    return res.data;
  },

  // Appointments
  getAppointments: async (params = {}) => {
    const res = await api.get('/hospital/appointments', { params });
    return res.data;
  },

  updateAppointment: async (id, data) => {
    const res = await api.patch(`/hospital/appointments/${id}`, data);
    return res.data;
  },

  // Departments
  getDepartments: async () => {
    const res = await api.get('/hospital/departments');
    return res.data;
  },

  // Analytics
  getAnalytics: async (range = '30days') => {
    const res = await api.get(`/hospital/analytics?range=${range}`);
    return res.data;
  },

  // Profile
  getProfile: async () => {
    const res = await api.get('/hospital/profile');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.patch('/hospital/profile', data);
    return res.data;
  },

  // Notifications
  getNotifications: async () => {
    const res = await api.get('/hospital/notifications');
    return res.data;
  },

  markNotificationRead: async (id) => {
    const res = await api.patch(`/hospital/notifications/${id}/read`);
    return res.data;
  },

  markAllNotificationsRead: async () => {
    const res = await api.post('/hospital/notifications/mark-all-read');
    return res.data;
  },
};
