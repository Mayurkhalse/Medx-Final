import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system', 'model'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sessionId: {
      type: String,
      required: true,
      index: true
    },
    messages: [messageSchema]
  },
  { timestamps: true }
);

// Compound index for user and session
chatHistorySchema.index({ userId: 1, sessionId: 1 });

export const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
export default ChatHistory;
