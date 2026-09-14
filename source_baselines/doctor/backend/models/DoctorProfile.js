import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  workingDays: [{ type: String }],
  startTime: { type: String, default: '09:00 AM' },
  endTime: { type: String, default: '05:00 PM' },
  breakTime: { type: String, default: '01:00 PM - 02:00 PM' },
  slotDuration: { type: String, default: '30 Mins' },
  onlineConsultation: { type: Boolean, default: true },
  inPersonConsultation: { type: Boolean, default: true }
}, { _id: false });

const doctorProfileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  title: { type: String },
  specialty: { type: String },
  hospital: { type: String },
  department: { type: String },
  experienceYears: { type: Number },
  phone: { type: String },
  email: { type: String },
  consultationFee: { type: String },
  languages: [{ type: String }],
  rating: { type: Number, default: 4.9 },
  totalConsultations: { type: Number, default: 0 },
  photo: { type: String },
  about: { type: String },
  availability: availabilitySchema
}, { timestamps: true });

export default mongoose.model('DoctorProfile', doctorProfileSchema);
