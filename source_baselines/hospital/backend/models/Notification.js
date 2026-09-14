import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['alert', 'report', 'assignment', 'appointment', 'system'],
      default: 'system',
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'warning', 'info'],
      default: 'info',
    },
    link: {
      type: String,
      default: '/hospital',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
