const mongoose = require('mongoose');

const careQueueItemSchema = new mongoose.Schema(
  {
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
    riskTier: { type: String, enum: ['High', 'Critical'], required: true },
    status: { type: String, enum: ['pending', 'in_review', 'resolved'], default: 'pending' },
    assignedDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CareQueueItem', careQueueItemSchema);
