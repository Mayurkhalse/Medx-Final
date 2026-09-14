import mongoose from 'mongoose';

const emergencyWorkflowSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true },
  patientName: { type: String },
  patientId: { type: String },
  bloodGroup: { type: String },
  location: { type: String },
  sosTriggerTime: { type: String },
  status: { type: String },
  vitals: { type: mongoose.Schema.Types.Mixed, default: {} },
  doctorEta: { type: String },
  isDoctorOnWay: { type: Boolean, default: false },
  nurseNotified: { type: Boolean, default: false },
  responders: { type: Array, default: [] },
  timeline: { type: Array, default: [] },
  interventions: { type: Array, default: [] }
}, { timestamps: true });

export default mongoose.model('EmergencyWorkflow', emergencyWorkflowSchema);
