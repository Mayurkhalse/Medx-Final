const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// Helper to make deterministic conversation ID
const getConversationId = (id1, id2) => {
  return [id1.toString(), id2.toString()].sort().join('_');
};

// GET /api/messages/conversations - List conversations
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.user.id }, { receiverId: req.user.id }]
    })
      .populate('senderId', 'name email role')
      .populate('receiverId', 'name email role')
      .sort({ createdAt: -1 });

    const convoMap = {};
    messages.forEach((msg) => {
      if (!convoMap[msg.conversationId]) {
        const otherParty =
          msg.senderId._id.toString() === req.user.id.toString()
            ? msg.receiverId
            : msg.senderId;
        convoMap[msg.conversationId] = {
          conversationId: msg.conversationId,
          lastMessage: msg.content,
          createdAt: msg.createdAt,
          otherParty
        };
      }
    });

    res.status(200).json(Object.values(convoMap));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving conversations', error: error.message });
  }
});

// GET /api/messages/:conversationId - Get thread
router.get('/:conversationId', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('senderId', 'name email role')
      .populate('receiverId', 'name email role')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error loading conversation', error: error.message });
  }
});

// POST /api/messages - Send message
router.post('/', verifyToken, async (req, res) => {
  const { receiverId, content } = req.body;

  try {
    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver ID and content are required' });
    }

    const conversationId = getConversationId(req.user.id, receiverId);

    const message = await Message.create({
      conversationId,
      senderId: req.user.id,
      receiverId,
      content
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

module.exports = router;
