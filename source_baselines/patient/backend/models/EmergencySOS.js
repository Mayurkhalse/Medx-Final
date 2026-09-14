const mongoose = require('mongoose');

const emergencySOSSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null, index: true },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    status: { type: String, enum: ['open', 'acknowledged', 'resolved'], default: 'open' },
    triggerReason: { type: String, default: '' },
    acknowledgedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    resolutionNotes: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmergencySOS', emergencySOSSchema);
