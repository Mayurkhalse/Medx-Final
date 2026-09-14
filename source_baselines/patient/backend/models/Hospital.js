const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    doctorCount: { type: Number, default: 0 },
    patientCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hospital', hospitalSchema);
