import api from './api.js';

export const hospitalService = {
  // Dashboard
  getDashboard: async (timeframe = '7days') => {
    const res = await api.get(`/hospital/dashboard?timeframe=${timeframe}`);
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

  // Bed & ICU Management
  getBeds: async (params = {}) => {
    const res = await api.get('/hospital/beds', { params });
    return res.data;
  },

  createBed: async (bedData) => {
    const res = await api.post('/hospital/beds', bedData);
    return res.data;
  },

  updateBedStatus: async (id, data) => {
    const res = await api.patch(`/hospital/beds/${id}/status`, data);
    return res.data;
  },

  assignBedPatient: async (id, data) => {
    const res = await api.post(`/hospital/beds/${id}/assign`, data);
    return res.data;
  },

  releaseBed: async (id) => {
    const res = await api.post(`/hospital/beds/${id}/release`);
    return res.data;
  },

  // Care Queue (6-Stage Pipeline)
  getCareQueue: async () => {
    const res = await api.get('/hospital/care-queue');
    return res.data;
  },

  updateCareTask: async (id, data) => {
    const res = await api.patch(`/hospital/care-queue/${id}`, data);
    return res.data;
  },

  createCareTask: async (data) => {
    const res = await api.post('/hospital/care-queue', data);
    return res.data;
  },

  evaluateReportForCareQueue: async (reportId) => {
    const res = await api.post('/hospital/care-queue/trigger', { reportId });
    return res.data;
  },

  // Patient Visibility
  getPatients: async (params = {}) => {
    const res = await api.get('/hospital/patients', { params });
    return res.data;
  },

  getPatientById: async (id) => {
    const res = await api.get(`/hospital/patients/${id}`);
    return res.data;
  },

  // Doctors & Roster
  getDoctors: async () => {
    const res = await api.get('/hospital/doctors');
    return res.data;
  },

  assignDoctor: async (data) => {
    const res = await api.post('/hospital/assign-doctor', data);
    return res.data;
  },

  // Reports Visibility
  getReports: async () => {
    const res = await api.get('/hospital/reports');
    return res.data;
  },

  getReportById: async (id) => {
    const res = await api.get(`/hospital/reports/${id}`);
    return res.data;
  }
};

export default hospitalService;
