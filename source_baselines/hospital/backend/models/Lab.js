import mongoose from 'mongoose';

const labSchema = new mongoose.Schema(
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
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    contact: {
      phone: String,
      email: String,
      address: String,
    },
    accreditation: {
      type: String,
      default: 'NABL & CAP Accredited',
    },
    turnaroundHours: {
      type: Number,
      default: 4,
    },
  },
  { timestamps: true }
);

export const Lab = mongoose.model('Lab', labSchema);
