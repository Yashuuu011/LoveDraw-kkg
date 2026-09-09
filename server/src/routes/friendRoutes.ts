import express from 'express';
import { authenticateUser } from '../middleware/auth';
import {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  removeFriend
} from '../controllers/friendController';

const router = express.Router();

router.post('/request', authenticateUser, sendFriendRequest);
router.get('/requests', authenticateUser, getFriendRequests);
router.post('/accept/:id', authenticateUser, acceptFriendRequest);
router.post('/reject/:id', authenticateUser, rejectFriendRequest);
router.delete('/request/:id', authenticateUser, rejectFriendRequest); // cancellation
router.get('/', authenticateUser, getFriends);
router.delete('/:friendId', authenticateUser, removeFriend);

export default router;
