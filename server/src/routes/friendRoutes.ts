import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  removeFriend
} from '../controllers/friendController';

const router = express.Router();

router.post('/request', authenticate, sendFriendRequest);
router.get('/requests', authenticate, getFriendRequests);
router.post('/accept/:id', authenticate, acceptFriendRequest);
router.post('/reject/:id', authenticate, rejectFriendRequest);
router.delete('/request/:id', authenticate, rejectFriendRequest); // cancellation
router.get('/', authenticate, getFriends);
router.delete('/:friendId', authenticate, removeFriend);

export default router;
