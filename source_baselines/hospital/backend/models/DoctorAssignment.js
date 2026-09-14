import mongoose from 'mongoose';

const doctorAssignmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthAlert',
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalReport',
    },
    priority: {
      type: String,
      enum: ['Urgent', 'High', 'Standard', 'Routine'],
      default: 'High',
    },
    hospitalNote: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'In Review', 'Completed'],
      default: 'Pending',
    },
    assignedBy: {
      type: String,
      default: 'Hospital Admin',
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const DoctorAssignment = mongoose.model('DoctorAssignment', doctorAssignmentSchema);
