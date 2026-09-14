const API_BASE_URL = 'http://localhost:5000/api';

// Helper for fetch with error handling
const fetchJson = async (endpoint, options = {}) => {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`API call failed for ${endpoint}:`, error.message);
    throw error;
  }
};

// Doctor Profile APIs
export const apiGetDoctorProfile = () => fetchJson('/doctor');
export const apiUpdateDoctorProfile = (profileData) =>
  fetchJson('/doctor', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
export const apiUpdateAvailability = (availabilityData) =>
  fetchJson('/doctor/availability', {
    method: 'PUT',
    body: JSON.stringify(availabilityData)
  });

// Patient APIs
export const apiGetPatients = () => fetchJson('/patients');
export const apiCreatePatient = (patientData) =>
  fetchJson('/patients', {
    method: 'POST',
    body: JSON.stringify(patientData)
  });
export const apiUpdatePatient = (patientId, patientData) =>
  fetchJson(`/patients/${patientId}`, {
    method: 'PUT',
    body: JSON.stringify(patientData)
  });
export const apiDeletePatient = (patientId) =>
  fetchJson(`/patients/${patientId}`, {
    method: 'DELETE'
  });
export const apiAddPrescription = (patientId, rxData) =>
  fetchJson(`/patients/${patientId}/prescriptions`, {
    method: 'POST',
    body: JSON.stringify({ rxData })
  });
export const apiAddClinicalNote = (patientId, noteData) =>
  fetchJson(`/patients/${patientId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ noteData })
  });
export const apiAddFollowup = (patientId, followupData) =>
  fetchJson(`/patients/${patientId}/followups`, {
    method: 'POST',
    body: JSON.stringify({ followupData })
  });

// Appointment APIs
export const apiGetAppointments = () => fetchJson('/appointments');
export const apiCreateAppointment = (appointmentData) =>
  fetchJson('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData)
  });
export const apiUpdateAppointment = (appointmentId, updates) =>
  fetchJson(`/appointments/${appointmentId}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
export const apiDeleteAppointment = (appointmentId) =>
  fetchJson(`/appointments/${appointmentId}`, {
    method: 'DELETE'
  });

// Emergency Alert & Workflow APIs
export const apiGetEmergencyAlerts = () => fetchJson('/emergency');
export const apiCreateEmergencyAlert = (alertData) =>
  fetchJson('/emergency', {
    method: 'POST',
    body: JSON.stringify(alertData)
  });
export const apiAcknowledgeEmergencyAlert = (alertId) =>
  fetchJson(`/emergency/${alertId}`, {
    method: 'DELETE'
  });
export const apiGetEmergencyWorkflow = () => fetchJson('/emergency/workflow');
export const apiUpdateEmergencyWorkflow = (workflowData) =>
  fetchJson('/emergency/workflow', {
    method: 'PUT',
    body: JSON.stringify(workflowData)
  });

// Messaging APIs
export const apiGetMessages = () => fetchJson('/messages');
export const apiSendMessage = (convId, text, sender = 'doctor') =>
  fetchJson(`/messages/${convId}`, {
    method: 'POST',
    body: JSON.stringify({ text, sender })
  });
