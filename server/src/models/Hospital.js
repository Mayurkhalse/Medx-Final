import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    legacyId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    facilityName: {
      type: String,
      required: [true, 'Facility name is required'],
      trim: true
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true
    },
    facilityType: {
      type: String,
      enum: ['General Hospital', 'Super Specialty', 'Clinic', 'Trauma Center'],
      default: 'General Hospital'
    },
    address: {
      type: mongoose.Schema.Types.Mixed,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: '+91 22 2456 7890'
    },
    email: {
      type: String,
      trim: true,
      default: 'admin@medx-hospital.org'
    },
    emergencyContact: {
      type: String,
      trim: true,
      default: '+91 22 2456 0911'
    },
    operatingHours: {
      type: String,
      default: '24/7 Emergency & Inpatient, Outpatient: 08:00 AM - 08:00 PM'
    },
    licenseNumber: {
      type: String,
      default: 'MH-MEDX-HOSP-2026-8819'
    },
    totalBeds: {
      type: Number,
      default: 100
    },
    availableBeds: {
      type: Number,
      default: 40
    },
    icuBeds: {
      type: Number,
      default: 10
    },
    bedCapacity: {
      total: { type: Number, default: 100 },
      occupied: { type: Number, default: 60 },
      icuAvailable: { type: Number, default: 10 }
    },
    departments: {
      type: [String],
      default: ['Emergency', 'General Medicine', 'Cardiology', 'Pathology', 'Intensive Care (ICU)', 'Orthopedics']
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

export const Hospital = mongoose.model('Hospital', hospitalSchema);
export default Hospital;

