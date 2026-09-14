import mongoose from 'mongoose';

const messageConversationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: { type: String },
  patientName: { type: String, required: true },
  photo: { type: String },
  lastMessage: { type: String },
  time: { type: String },
  unreadCount: { type: Number, default: 0 },
  conversation: [
    {
      sender: { type: String, required: true },
      text: { type: String, required: true },
      time: { type: String, required: true }
    }
  ]
}, { timestamps: true });

export default mongoose.model('Message', messageConversationSchema);
