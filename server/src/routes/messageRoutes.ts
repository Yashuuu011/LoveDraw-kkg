import { Router } from 'express';
import { getTodayMessage, getAllMessages, toggleFavorite, getUserFavorites } from '../controllers/messageController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/today', getTodayMessage);
router.get('/', getAllMessages);
router.post('/favorite', authenticateUser, toggleFavorite);
router.get('/user-favorites', authenticateUser, getUserFavorites);

export default router;
