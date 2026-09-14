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
    code: {
      type: String,
      sparse: true,
      trim: true
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
      index: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      default: ''
    },
    contactPerson: {
      type: String,
      trim: true,
      default: ''
    },
    accreditation: {
      type: String,
      trim: true,
      default: 'NABL & CAP Accredited'
    },
    turnaroundHours: {
      type: Number,
      default: 4
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

// Virtual for name to match hospital source baseline
labSchema.virtual('name').get(function () {
  return this.labName;
}).set(function (v) {
  this.labName = v;
});

// Virtual for contact object to match hospital source baseline
labSchema.virtual('contact').get(function () {
  return {
    phone: this.phone,
    email: this.email,
    address: this.address
  };
});

export const Lab = mongoose.model('Lab', labSchema);
export default Lab;
