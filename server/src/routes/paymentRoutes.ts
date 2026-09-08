import { Router } from 'express';
import { processDemoPayment, getPaymentStatus } from '../controllers/paymentController';

const router = Router();

router.post('/demo', processDemoPayment);
router.get('/:reference', getPaymentStatus);

export default router;
