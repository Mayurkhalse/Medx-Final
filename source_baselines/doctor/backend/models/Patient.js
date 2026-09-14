import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  dob: { type: String },
  bloodGroup: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  city: { type: String },
  photo: { type: String },
  emergencyContact: { type: String },
  emergencyPhone: { type: String },
  height: { type: String },
  weight: { type: String },
  bmi: { type: String },
  lastVisit: { type: String },
  nextAppointment: { type: String },
  currentCondition: { type: String },
  status: { type: String, default: 'Active' },
  clinicalFlags: [{ type: String }],
  alertFlags: { type: mongoose.Schema.Types.Mixed, default: {} },
  vitals: { type: mongoose.Schema.Types.Mixed, default: {} },
  allergies: { type: Array, default: [] },
  medicalHistory: { type: Array, default: [] },
  currentMedications: { type: Array, default: [] },
  labReports: { type: Array, default: [] },
  prescriptions: { type: Array, default: [] },
  clinicalNotes: { type: Array, default: [] },
  followupPlan: { type: Array, default: [] },
  surgeries: { type: Array, default: [] },
  vaccinations: { type: Array, default: [] },
  familyHistory: { type: Array, default: [] }
}, { timestamps: true });

export default mongoose.model('Patient', patientSchema);
