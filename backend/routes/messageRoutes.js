import express from 'express';
import { getAllMessages, createMessage, markAsRead, deleteMessage } from '../controller/message.js';

const router = express.Router();

router.get('/', getAllMessages);
router.post('/', createMessage);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteMessage);

export default router;
