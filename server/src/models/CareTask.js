import mongoose from 'mongoose';

const careTaskSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Hospital reference is required']
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required']
    },
    category: {
      type: String,
      enum: [
        'New Patients',
        'Reports Pending Review',
        'Critical Alerts',
        'Doctor Assignment Pending',
        'Follow-up Required',
        'Completed'
      ],
      required: [true, 'Care task category is required']
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    reason: {
      type: String,
      trim: true,
      default: ''
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Routine'],
      default: 'Medium'
    },
    assignedDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null
    },
    relatedReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalReport',
      default: null
    },
    status: {
      type: String,
      enum: ['Active', 'In Progress', 'Completed', 'Escalated'],
      default: 'Active'
    },
    time: {
      type: String,
      default: 'Just now'
    },
    actionTaken: {
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

careTaskSchema.index({ hospitalId: 1, category: 1 });
careTaskSchema.index({ hospitalId: 1, status: 1 });
careTaskSchema.index({ patientId: 1 });

export const CareTask = mongoose.model('CareTask', careTaskSchema);
export default CareTask;
