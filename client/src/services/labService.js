import api from './api.js';

export const labService = {
  // Dashboard
  getDashboard: async () => {
    const res = await api.get('/lab/dashboard');
    return res.data;
  },

  // Profile
  getProfile: async () => {
    const res = await api.get('/lab/profile');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/lab/profile', data);
    return res.data;
  },

  // Diagnostic Reports
  getReports: async (params = {}) => {
    const res = await api.get('/lab/reports', { params });
    return res.data;
  },

  getReportById: async (id) => {
    const res = await api.get(`/lab/reports/${id}`);
    return res.data;
  },

  createDiagnosticReport: async (reportData) => {
    const res = await api.post('/lab/reports', reportData);
    return res.data;
  },

  updateReport: async (id, data) => {
    const res = await api.put(`/lab/reports/${id}`, data);
    return res.data;
  },

  finalizeReport: async (id) => {
    const res = await api.post(`/lab/reports/${id}/finalize`);
    return res.data;
  },

  // Patients & Facilities
  getAffiliatedPatients: async (params = {}) => {
    const res = await api.get('/lab/patients', { params });
    return res.data;
  },

  getAffiliatedHospitals: async () => {
    const res = await api.get('/lab/hospitals');
    return res.data;
  }
};

export default labService;
