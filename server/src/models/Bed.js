import mongoose from 'mongoose';

const bedSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Hospital reference is required']
    },
    bedNumber: {
      type: String,
      required: [true, 'Bed number is required'],
      trim: true
    },
    ward: {
      type: String,
      required: [true, 'Ward name is required'],
      trim: true,
      default: 'General'
    },
    roomNumber: {
      type: String,
      trim: true,
      default: '101'
    },
    bedType: {
      type: String,
      enum: ['General', 'ICU', 'Emergency', 'Semi-Private', 'Private'],
      default: 'General'
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Maintenance', 'Reserved'],
      default: 'Available'
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null
    },
    assignedAt: {
      type: Date,
      default: null
    },
    notes: {
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

// Unique compound index on hospitalId + bedNumber
bedSchema.index({ hospitalId: 1, bedNumber: 1 }, { unique: true });

export const Bed = mongoose.model('Bed', bedSchema);
export default Bed;
