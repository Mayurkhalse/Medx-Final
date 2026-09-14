const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, default: null },
    avatarUrl: { type: String, default: '' },

    role: {
      type: String,
      enum: ['patient', 'doctor', 'hospital_admin'],
      required: true,
      default: 'patient'
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'profileModel',
      default: null
    },
    profileModel: {
      type: String,
      enum: ['Doctor', 'Hospital'],
      default: null
    },

    // Patient demographic fields
    dob: { type: Date, default: null },
    gender: { type: String, default: '' },

    // Patient care assignment
    assignedDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
