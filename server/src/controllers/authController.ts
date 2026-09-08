import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import twilio from 'twilio';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'lovedraw_secret_key_romantic_2026_super_secure';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const twilioClient = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone must be valid').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone is required",
  path: ["email"]
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const register = async (req: Request, res: Response) => {
  try {
    const validated = registerSchema.parse(req.body);

    const userCount = await prisma.user.count();
    if (userCount >= 5) {
      return res.status(403).json({ success: false, message: 'This space has reached the maximum capacity of 5 users.' });
    }

    if (validated.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validated.email }
      });
      if (existingUser) return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    if (validated.phone) {
      const existingUser = await prisma.user.findUnique({
        where: { phone: validated.phone }
      });
      if (existingUser) return res.status(400).json({ success: false, message: 'An account with this phone already exists.' });
    }

    const passwordHash = validated.password ? await bcrypt.hash(validated.password, 10) : undefined;

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email || null,
        phone: validated.phone || null,
        passwordHash,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(validated.name)}`
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: 'USER' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to LoveDraw. ❤️',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: 'USER' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Welcome back to LoveDraw! ❤️',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);

    const admin = await prisma.admin.findUnique({
      where: { email: validated.email }
    });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const isMatch = await bcrypt.compare(validated.password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Admin access granted. Welcome to LoveDraw Portal.',
      token,
      user: {
        id: admin.id,
        name: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    return res.status(500).json({ success: false, message: 'Server error during admin login.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
      const admin = await prisma.admin.findUnique({ where: { id: req.user.id } });
      if (!admin) return res.status(404).json({ success: false, message: 'Admin user not found.' });

      return res.json({
        success: true,
        user: {
          id: admin.id,
          name: admin.username,
          email: admin.email,
          role: admin.role
        }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        entries: {
          include: { draw: true }
        },
        winners: {
          include: { draw: true }
        },
        favorites: {
          include: { message: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        entriesCount: user.entries.length,
        winningsCount: user.winners.length,
        favoritesCount: user.favorites.length,
        entries: user.entries,
        winners: user.winners,
        favorites: user.favorites.map(f => f.message)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching user profile.' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  // Demo password reset acknowledgement
  return res.json({
    success: true,
    message: 'If an account exists for this email, password reset instructions have been sent. 💕'
  });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
    const { name, avatarUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(avatarUrl && { avatarUrl })
      }
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

export const sendOtp = async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required.' });

  try {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(404).json({ success: false, message: 'User with this phone not found. Please register first.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: otp, otpExpiresAt }
    });

    if (twilioClient && TWILIO_PHONE_NUMBER) {
      await twilioClient.messages.create({
        body: `Your LoveDraw login code is: ${otp}`,
        from: TWILIO_PHONE_NUMBER,
        to: phone
      });
      console.log(`[Twilio] Sent OTP to ${phone}`);
    } else {
      console.log(`[Simulated OTP] LoveDraw code for ${phone} is: ${otp}`);
    }

    return res.json({ success: true, message: 'OTP sent successfully!' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send OTP. Check server logs.' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });

  try {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (user.otpCode !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    // Clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpiresAt: null }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: 'USER' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Verified successfully. Welcome back! ❤️',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during OTP verification.' });
  }
};
