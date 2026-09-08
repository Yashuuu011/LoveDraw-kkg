import { Router } from 'express';
import { register, login, adminLogin, getMe, forgotPassword, updateProfile, sendOtp, verifyOtp } from '../controllers/authController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/forgot-password', forgotPassword);
router.get('/me', authenticateUser, getMe);
router.put('/profile', authenticateUser, updateProfile);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

export default router;
