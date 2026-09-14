import api from './api.js';

export const emergencyService = {
  // Trigger Emergency SOS alert (Patient)
  triggerSOS: async (sosData = {}) => {
    const res = await api.post('/emergency/trigger', sosData);
    return res.data;
  },

  // Get Emergency Alerts (Role-scoped)
  getEmergencyAlerts: async () => {
    const res = await api.get('/emergency');
    return res.data;
  },

  // Get Alert Details by ID
  getEmergencyAlertById: async (id) => {
    const res = await api.get(`/emergency/${id}`);
    return res.data;
  },

  // Acknowledge Emergency Alert (Doctor / Hospital)
  acknowledgeEmergencyAlert: async (id, notes = '') => {
    const res = await api.post(`/emergency/${id}/ack`, {
      dispatchNotes: notes,
      statusText: 'Acknowledged by clinical staff'
    });
    return res.data;
  },

  // Dispatch Response Squad (Doctor / Hospital)
  dispatchEmergencyAlert: async (id, data = {}) => {
    const res = await api.patch(`/emergency/${id}/dispatch`, data);
    return res.data;
  },

  // Resolve Emergency Alert (Doctor / Hospital / Patient)
  resolveEmergencyAlert: async (id, resolutionNotes = '') => {
    const res = await api.post(`/emergency/${id}/resolve`, { resolutionNotes });
    return res.data;
  },

  // Get active SOS counter
  getActiveCount: async () => {
    const res = await api.get('/emergency/stats/active-count');
    return res.data;
  }
};

export default emergencyService;
