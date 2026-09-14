import mongoose from 'mongoose';

const labSchema = new mongoose.Schema(
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
    labName: {
      type: String,
      required: [true, 'Lab name is required'],
      trim: true
    },
    licenseNumber: {
      type: String,
      trim: true,
      default: ''
    },
    accreditation: {
      type: String,
      trim: true,
      default: 'NABL Accredited'
    },
    address: {
      type: String,
      trim: true,
      default: ''
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

export const Lab = mongoose.model('Lab', labSchema);
export default Lab;
