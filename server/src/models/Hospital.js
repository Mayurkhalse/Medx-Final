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
    facilityType: {
      type: String,
      enum: ['General Hospital', 'Super Specialty', 'Clinic', 'Trauma Center'],
      default: 'General Hospital'
    },
    address: {
      type: String,
      trim: true,
      default: ''
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
    departments: {
      type: [String],
      default: ['Emergency', 'General Medicine', 'Cardiology', 'Pathology']
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
