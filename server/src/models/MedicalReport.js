import mongoose from 'mongoose';

const parameterDetailSchema = new mongoose.Schema(
  {
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    unit: {
      type: String,
      default: ''
    },
    ref_range: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Normal', 'High', 'Low', 'Critical', 'normal', 'high', 'low', 'critical_high', 'critical_low', 'Borderline'],
      default: 'Normal'
    }
  },
  { _id: false }
);

const medicalReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      index: true
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
      index: true
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
      default: null,
      index: true
    },
    reportName: {
      type: String,
      default: 'Complete Blood Biomarker Analysis',
      trim: true
    },
    reportType: {
      type: String,
      default: 'Complete Blood Count (CBC)',
      trim: true
    },
    sourceType: {
      type: String,
      enum: ['manual', 'upload', 'lab_direct'],
      required: true
    },
    fileUrl: {
      type: String,
      default: ''
    },
    parameters: {
      type: Map,
      of: parameterDetailSchema,
      required: true
    },
    mlResult: {
      flags: {
        type: Map,
        of: String,
        default: () => new Map()
      },
      diseaseRisks: {
        type: Map,
        of: Number,
        default: () => new Map()
      },
      overallRiskScore: {
        type: Number,
        default: 0
      },
      riskTier: {
        type: String,
        enum: ['Low', 'Moderate', 'High', 'Critical'],
        default: 'Low'
      },
      modelVersion: {
        type: String,
        default: 'v1.0.0'
      }
    },
    reviewStatus: {
      type: String,
      enum: ['Pending Review', 'Requires Review', 'Reviewed'],
      default: 'Pending Review'
    },
    reviewedByDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null
    },
    reviewNotes: {
      type: String,
      default: ''
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    reportDate: {
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

export const MedicalReport = mongoose.model('MedicalReport', medicalReportSchema);
export default MedicalReport;
