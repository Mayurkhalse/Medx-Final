const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sourceType: {
      type: String,
      enum: ['manual', 'upload'],
      required: true
    },
    fileUrl: {
      type: String,
      default: ''
    },
    parameters: {
      type: Map,
      of: {
        value: Number,
        unit: String,
        ref_range: String
      },
      required: true
    },
    mlResult: {
      flags: {
        type: Map,
        of: String
      },
      diseaseRisks: {
        type: Map,
        of: Number
      },
      overallRiskScore: {
        type: Number,
        required: true
      },
      riskTier: {
        type: String,
        enum: ['Low', 'Moderate', 'High', 'Critical'],
        required: true
      },
      modelVersion: {
        type: String,
        default: 'v1.0.0'
      }
    },
    reportDate: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
