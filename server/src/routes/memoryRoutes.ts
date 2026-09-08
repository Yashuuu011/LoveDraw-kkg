import { Router } from 'express';
import { getMemories, getMemoryById } from '../controllers/memoryController';

const router = Router();

router.get('/', getMemories);
router.get('/:id', getMemoryById);

export default router;
