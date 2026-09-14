import mongoose from 'mongoose';

const emergencyAlertSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: { type: String },
  patientName: { type: String, required: true },
  age: { type: Number },
  bloodGroup: { type: String },
  location: { type: String },
  coordinates: { type: String },
  time: { type: String },
  status: { type: String, default: 'SOS ACTIVE' },
  alertType: { type: String },
  vitalsAtAlert: { type: String },
  vitalSeverity: { type: String }
}, { timestamps: true });

export default mongoose.model('EmergencyAlert', emergencyAlertSchema);
