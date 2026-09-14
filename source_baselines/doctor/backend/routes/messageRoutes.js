import express from 'express';
import {
  getMessages,
  sendMessage
} from '../controllers/messageController.js';

const router = express.Router();

router.get('/', getMessages);
router.post('/:convId', sendMessage);

export default router;
