import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      default: 'MBBS, MD',
    },
    experienceYears: {
      type: Number,
      default: 8,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Busy', 'On Leave', 'In Surgery'],
      default: 'Available',
    },
    todayPatientsCount: {
      type: Number,
      default: 0,
    },
    pendingReviewsCount: {
      type: Number,
      default: 0,
    },
    roomNumber: {
      type: String,
      default: 'OPD-102',
    },
    rating: {
      type: Number,
      default: 4.8,
    },
  },
  { timestamps: true }
);

export const Doctor = mongoose.model('Doctor', doctorSchema);
