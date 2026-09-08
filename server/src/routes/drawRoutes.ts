import { Router } from 'express';
import { getDraws, getDrawById, createDrawEntry, getDrawEntries } from '../controllers/drawController';
import { authenticateUser, optionalAuthenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', getDraws);
router.get('/:id', optionalAuthenticateUser, getDrawById);
router.post('/:id/entry', authenticateUser, createDrawEntry);
router.get('/:id/entries', getDrawEntries);

export default router;
