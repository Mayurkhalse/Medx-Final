const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    scheduledAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'requested'
    },
    reason: { type: String, default: '' },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
