import { Router } from 'express';
import { getAllWinners, getDrawWinner } from '../controllers/winnerController';

const router = Router();

router.get('/', getAllWinners);
router.get('/draw/:id', getDrawWinner);

export default router;
