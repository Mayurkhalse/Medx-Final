import mongoose from 'mongoose';

const parameterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  unit: { type: String, default: '' },
  referenceRange: { type: String, default: 'Normal lab reference range' },
  status: {
    type: String,
    enum: ['Normal', 'High', 'Low', 'Critical', 'Borderline'],
    default: 'Normal',
  },
  flagged: { type: Boolean, default: false },
});

const medicalReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
    },
    labName: {
      type: String,
      default: 'Med-X Central Laboratory',
    },
    reportName: {
      type: String,
      required: true,
    },
    reportType: {
      type: String,
      enum: [
        'Complete Blood Count (CBC)',
        'Lipid Profile',
        'Blood Glucose / HbA1c',
        'Comprehensive Metabolic Panel',
        'Thyroid Panel (TSH, T3, T4)',
        'Liver Function Test (LFT)',
        'Renal Function Test (KFT)',
        'Cardiac Markers',
        'Urinalysis',
      ],
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    sampleCollectedAt: {
      type: Date,
      default: Date.now,
    },
    parameters: [parameterSchema],
    extractionStatus: {
      type: String,
      enum: ['Uploaded', 'Processing', 'Processed'],
      default: 'Processed',
    },
    analysisStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Analysis Complete'],
      default: 'Analysis Complete',
    },
    reviewStatus: {
      type: String,
      enum: ['Pending Review', 'Requires Review', 'Reviewed'],
      default: 'Pending Review',
    },
    aiSummary: {
      summaryText: { type: String, default: '' },
      abnormalHighlights: [{ type: String }],
      trendObservations: [{ type: String }],
      clinicalNotice: {
        type: String,
        default:
          'AI-generated information for clinical decision support. Not a medical diagnosis. Final medical decisions remain with qualified doctors.',
      },
    },
    reviewedByDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    reviewNotes: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const MedicalReport = mongoose.model('MedicalReport', medicalReportSchema);
