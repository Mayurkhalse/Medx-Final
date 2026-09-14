/*
 * MED-X UI MOCK DATA
 *
 * This file contains presentation-only data for the UI phase.
 * Later these objects will be replaced by API responses.
 *
 * No value in this file represents a real patient.
 */

export const mockPatient = {
  name: 'Alex Sharma',
  age: 28,
  sex: 'Not specified',
  lastUpdated: '22 Aug 2026'
};

export const mockReports = [
  {
    id: 'RPT-001',
    title: 'Complete Blood Count',
    laboratory: 'Demo Laboratory',
    date: '20 Aug 2026',
    status: 'Processed',
    observations: 8
  },
  {
    id: 'RPT-002',
    title: 'Comprehensive Metabolic Panel',
    laboratory: 'Demo Laboratory',
    date: '14 Aug 2026',
    status: 'Processed',
    observations: 12
  }
];

export const mockObservations = [
  {
    id: 'OBS-001',
    component: 'Hemoglobin',
    result: '13.5',
    unit: 'g/dL',
    referenceRange: '12.0–16.0',
    flag: 'Normal',
    domain: 'Hematology',
    time: '20 Aug 2026'
  },
  {
    id: 'OBS-002',
    component: 'ALT',
    result: '32',
    unit: 'U/L',
    referenceRange: 'Report-specific',
    flag: 'Normal',
    domain: 'Liver Function',
    time: '20 Aug 2026'
  },
  {
    id: 'OBS-003',
    component: 'Creatinine',
    result: '0.9',
    unit: 'mg/dL',
    referenceRange: 'Report-specific',
    flag: 'Normal',
    domain: 'Kidney Function',
    time: '20 Aug 2026'
  },
  {
    id: 'OBS-004',
    component: 'Calcium',
    result: '9.4',
    unit: 'mg/dL',
    referenceRange: 'Report-specific',
    flag: 'Normal',
    domain: 'Electrolytes',
    time: '20 Aug 2026'
  }
];

export const mockTrends = [
  { component: 'Hemoglobin', values: ['13.1', '13.4', '13.5', '13.6'] },
  { component: 'ALT', values: ['29', '31', '30', '32'] },
  { component: 'Creatinine', values: ['0.9', '0.8', '0.9', '0.9'] }
];

export const mockAlerts = [
  {
    id: 'ALT-CHANGE',
    level: 'Info',
    title: 'Recent liver-function result available',
    description:
      'A new ALT observation is available from the latest processed report.',
    date: '20 Aug 2026',
    status: 'New'
  },
  {
    id: 'REPORT-READY',
    level: 'Info',
    title: 'Report processing completed',
    description:
      'Your latest blood report has been converted into structured observations.',
    date: '20 Aug 2026',
    status: 'Resolved'
  }
];

export const mockMedicines = [
  {
    name: 'Medication example',
    dose: 'Not specified',
    frequency: 'Not specified',
    status: 'Demo record'
  }
];

export const mockDevices = [
  {
    name: 'Statescope',
    type: 'Smart medical device',
    status: 'Not connected',
    lastSync: '—'
  },
  {
    name: 'Heart Monitor',
    type: 'Heart monitoring device',
    status: 'Not connected',
    lastSync: '—'
  }
];

export const mockAiQuestions = [
  'What does this result mean?',
  'How has this measurement changed?',
  'What should I discuss with my doctor?'
];
