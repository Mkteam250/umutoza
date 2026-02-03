import express from 'express';
import quizRoutes from '../routes/quizRoutes.js';
import sessionRoutes from '../routes/sessionRoutes.js';
import promotionRoutes from '../routes/promotionRoutes.js';
import messageRoutes from '../routes/messageRoutes.js';

const router = express.Router();

router.use('/admin/quiz', quizRoutes);
router.use('/sessions', sessionRoutes);
router.use('/promotions', promotionRoutes);
router.use('/messages', messageRoutes);
router.use('/uploads', express.static('uploads'));

export default router;
