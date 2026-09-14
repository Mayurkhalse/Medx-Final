import mongoose from 'mongoose';

const careTaskSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    category: {
      type: String,
      enum: [
        'New Patients',
        'Reports Pending Review',
        'Critical Alerts',
        'Doctor Assignment Pending',
        'Follow-up Required',
        'Completed',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Routine'],
      default: 'Medium',
    },
    assignedDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    relatedReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalReport',
    },
    relatedAlertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthAlert',
    },
    status: {
      type: String,
      enum: ['Active', 'In Progress', 'Completed', 'Escalated'],
      default: 'Active',
    },
    time: {
      type: String,
      default: 'Just now',
    },
    actionTaken: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const CareTask = mongoose.model('CareTask', careTaskSchema);
