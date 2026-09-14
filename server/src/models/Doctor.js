import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
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
    specialty: {
      type: String,
      trim: true,
      default: 'General Physician'
    },
    qualification: {
      type: String,
      trim: true,
      default: 'MBBS'
    },
    department: {
      type: String,
      trim: true,
      default: 'General Medicine'
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null
    },
    licenseNumber: {
      type: String,
      trim: true,
      default: ''
    },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'In Consultation', 'Off Duty'],
      default: 'Available'
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

export const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
