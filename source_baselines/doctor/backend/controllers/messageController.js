import Message from '../models/Message.js';

// GET /api/messages
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ updatedAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

// POST /api/messages/:convId
export const sendMessage = async (req, res) => {
  try {
    const { text, sender = 'doctor' } = req.body;
    const { convId } = req.params;

    const conversation = await Message.findOne({ id: convId });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation thread not found' });
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    conversation.lastMessage = text;
    conversation.time = timeStr;
    conversation.unreadCount = 0;
    conversation.conversation.push({ sender, text, time: timeStr });

    await conversation.save();
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};
