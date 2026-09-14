import mongoose from 'mongoose';

const healthAlertSchema = new mongoose.Schema(
  {
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
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalReport',
    },
    reportName: {
      type: String,
      default: 'Laboratory Report',
    },
    parameter: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    referenceRange: {
      type: String,
      default: 'Normal lab reference range',
    },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'High',
    },
    status: {
      type: String,
      enum: ['Active', 'Requires Review', 'Assigned', 'Resolved'],
      default: 'Requires Review',
    },
    assignedDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    hospitalNote: {
      type: String,
      default: '',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const HealthAlert = mongoose.model('HealthAlert', healthAlertSchema);
