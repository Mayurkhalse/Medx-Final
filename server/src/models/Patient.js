import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
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
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Unspecified'],
      default: 'Unspecified'
    },
    dateOfBirth: {
      type: Date
    },
    bloodGroup: {
      type: String,
      trim: true,
      default: ''
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null
    },
    primaryDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null
    },
    allergies: {
      type: [String],
      default: []
    },
    medicalHistory: {
      type: [String],
      default: []
    },
    currentCondition: {
      type: String,
      trim: true,
      default: 'Routine Health Monitoring & Vitals Check'
    },
    status: {
      type: String,
      enum: ['Active', 'In Consultation', 'Waiting', 'Critical', 'Discharged'],
      default: 'Active'
    },
    clinicalFlags: {
      type: [String],
      default: []
    },
    vitalSigns: {
      bloodPressure: { type: String, default: '120/80 mmHg' },
      heartRate: { type: mongoose.Schema.Types.Mixed, default: 72 },
      temperature: { type: mongoose.Schema.Types.Mixed, default: 98.6 },
      oxygenSaturation: { type: mongoose.Schema.Types.Mixed, default: 99 },
      spo2: { type: mongoose.Schema.Types.Mixed, default: '99%' },
      respiratoryRate: { type: mongoose.Schema.Types.Mixed, default: 16 },
      height: { type: String, default: '172 cm' },
      weight: { type: String, default: '68 kg' },
      bmi: { type: String, default: '23.0' },
      recordedAt: { type: Date, default: Date.now }
    },
    prescriptions: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    clinicalNotes: {
      type: [
        {
          id: String,
          date: String,
          time: String,
          doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
          doctorName: String,
          note: String
        }
      ],
      default: []
    },
    followupPlan: {
      type: [
        {
          id: String,
          date: String,
          purpose: String,
          reason: String,
          recommendedTests: String,
          instructions: String
        }
      ],
      default: []
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

export const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
