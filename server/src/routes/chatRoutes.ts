import { Router } from 'express';
import { getUsers, getOrCreateRoom, getMyRooms, getMessages, sendMessage } from '../controllers/chatController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/users', getUsers);
router.get('/rooms', getMyRooms);
router.post('/rooms', getOrCreateRoom);
router.get('/rooms/:id/messages', getMessages);
router.post('/rooms/:id/messages', sendMessage);

export default router;
