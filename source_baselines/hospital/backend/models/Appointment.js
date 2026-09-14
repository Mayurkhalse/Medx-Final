import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true,
      unique: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
      default: '10:00 AM - 10:30 AM',
    },
    type: {
      type: String,
      enum: ['In-Person', 'Teleconsultation', 'Emergency Consult', 'Follow-up Review'],
      default: 'In-Person',
    },
    status: {
      type: String,
      enum: ['Today', 'Upcoming', 'Completed', 'Cancelled', 'In Progress'],
      default: 'Upcoming',
    },
    reason: {
      type: String,
      default: 'Regular Clinical Consultation',
    },
    hospitalNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model('Appointment', appointmentSchema);
