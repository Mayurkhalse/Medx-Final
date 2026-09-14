import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    patientId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    assignedDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    bloodGroup: {
      type: String,
      default: 'O+',
    },
    contact: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: '',
    },
    emergencyContact: {
      name: { type: String, default: 'Relative' },
      relation: { type: String, default: 'Family' },
      phone: { type: String, default: '+91 98765 00000' },
    },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
    },
    conditions: [{ type: String }],
    allergies: [{ type: String }],
    familyHistory: [{ type: String }],
    medicalNotes: { type: String, default: '' },
    latestReportSummary: { type: String, default: 'No recent reports' },
    alertStatus: {
      type: String,
      enum: ['None', 'Normal', 'Requires Review', 'Critical', 'High'],
      default: 'None',
    },
    reportStatus: {
      type: String,
      enum: ['No Reports', 'Pending Review', 'Reviewed', 'Requires Review'],
      default: 'No Reports',
    },
    lastVisit: {
      type: Date,
      default: Date.now,
    },
    vitals: {
      bloodPressure: { type: String, default: '120/80' },
      heartRate: { type: Number, default: 72 },
      spO2: { type: Number, default: 98 },
      temperature: { type: Number, default: 98.6 },
      glucose: { type: Number, default: 110 },
      lastRecorded: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

export const Patient = mongoose.model('Patient', patientSchema);
