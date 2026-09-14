import mongoose from 'mongoose';

/**
 * Canonical Appointment Schema
 * Harmonizes appointment scheduling across Patient, Doctor, and Hospital modules
 * per Phase 1C Unified Contract Section 15.
 */
const appointmentSchema = new mongoose.Schema(
  {
    legacyId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required'],
      index: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
      index: true
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
      index: true
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
      index: true
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      default: '10:00 AM'
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Scheduled',
      index: true
    },
    type: {
      type: String,
      enum: ['In-Person', 'Video', 'Follow-up'],
      default: 'In-Person'
    },
    reason: {
      type: String,
      trim: true,
      default: 'Routine Clinical Consultation'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Pre-save hook to generate human-readable legacyId if not provided
appointmentSchema.pre('save', function (next) {
  if (!this.legacyId) {
    this.legacyId = `APT-${Math.floor(100 + Math.random() * 900)}`;
  }
  next();
});

export const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
