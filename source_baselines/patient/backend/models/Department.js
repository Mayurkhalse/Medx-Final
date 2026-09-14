const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    name: { type: String, required: true, trim: true },
    headDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
    capacity: { type: Number, default: 0 },
    activeStaffCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);
