import { Router } from 'express';
import {
  getDashboardStats,
  createDraw,
  updateDraw,
  deleteDraw,
  selectWinner,
  createMessage,
  updateMessage,
  deleteMessage
} from '../controllers/adminController';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

// Protect all admin routes
router.use(authenticateAdmin);

router.get('/dashboard', getDashboardStats);

// Draw management
router.post('/draws', createDraw);
router.put('/draws/:id', updateDraw);
router.delete('/draws/:id', deleteDraw);
router.post('/draws/:id/select-winner', selectWinner);

// Daily message management
router.post('/messages', createMessage);
router.put('/messages/:id', updateMessage);
router.delete('/messages/:id', deleteMessage);

export default router;
