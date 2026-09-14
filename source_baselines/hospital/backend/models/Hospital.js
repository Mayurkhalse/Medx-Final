import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: { type: String, default: 'India' },
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    emergencyContact: {
      type: String,
      required: true,
    },
    operatingHours: {
      type: String,
      default: '24/7 Emergency & Inpatient, Outpatient: 08:00 AM - 08:00 PM',
    },
    bedCapacity: {
      total: { type: Number, default: 350 },
      occupied: { type: Number, default: 210 },
      icuAvailable: { type: Number, default: 18 },
    },
    logo: {
      type: String,
      default: '',
    },
    licenseNumber: {
      type: String,
      default: 'HOSP-MEDX-2026-9921',
    },
  },
  { timestamps: true }
);

export const Hospital = mongoose.model('Hospital', hospitalSchema);
