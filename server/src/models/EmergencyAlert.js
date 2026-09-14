import mongoose from 'mongoose';

const emergencyAlertSchema = new mongoose.Schema(
  {
    alertId: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient User ID is required'],
      index: true
    },
    patientProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null,
      index: true
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true
    },
    age: {
      type: Number,
      default: null
    },
    gender: {
      type: String,
      default: ''
    },
    bloodGroup: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null,
      index: true
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
      index: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'IN_PROGRESS', 'RESOLVED'],
      default: 'ACTIVE',
      index: true
    },
    alertType: {
      type: String,
      default: 'Emergency SOS Distress Signal'
    },
    triggerReason: {
      type: String,
      default: 'Acute Distress - Immediate Medical Attention Requested'
    },
    vitalsAtAlert: {
      type: String,
      default: ''
    },
    vitalSeverity: {
      type: String,
      default: 'Critical High Risk'
    },
    location: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
        default: null
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
        default: null
      },
      address: {
        type: String,
        default: ''
      },
      coordinatesText: {
        type: String,
        default: ''
      }
    },
    dispatch: {
      dispatchedAt: {
        type: Date,
        default: null
      },
      dispatchedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      statusText: {
        type: String,
        default: ''
      },
      dispatchNotes: {
        type: String,
        default: ''
      }
    },
    acknowledgedAt: {
      type: Date,
      default: null
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolutionNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook for unique human-readable alertId
emergencyAlertSchema.pre('save', function (next) {
  if (!this.alertId) {
    this.alertId = `EMG-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

export const EmergencyAlert = mongoose.model('EmergencyAlert', emergencyAlertSchema);
export default EmergencyAlert;
