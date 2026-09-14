import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  photo: { type: String },
  time: { type: String },
  date: { type: String },
  type: { type: String },
  reason: { type: String },
  mode: { type: String, default: 'In-person' },
  status: { type: String, default: 'Confirmed' }
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);
