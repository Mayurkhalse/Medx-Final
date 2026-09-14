import mongoose from 'mongoose';

const medicineItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      default: '1 Tab',
      trim: true
    },
    frequency: {
      type: String,
      default: '1-0-1',
      trim: true
    },
    duration: {
      type: String,
      default: '30 Days',
      trim: true
    },
    route: {
      type: String,
      default: 'Oral',
      trim: true
    },
    instructions: {
      type: String,
      default: 'Take after meals',
      trim: true
    }
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    prescriptionNumber: {
      type: String,
      sparse: true,
      index: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true
    },
    doctorName: {
      type: String,
      required: true,
      trim: true
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalReport',
      default: null,
      index: true
    },
    diagnosis: {
      type: String,
      default: 'Routine Clinical Evaluation',
      trim: true
    },
    medicines: {
      type: [medicineItemSchema],
      default: []
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
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

export const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
