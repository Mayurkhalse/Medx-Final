const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    specialty: { type: String, default: '' },
    licenseNumber: { type: String, default: '' },
    assignedPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    availability: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6 }, // 0 = Sunday
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '17:00' }
      }
    ],
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
