import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'lovedraw_secret_key_romantic_2026_super_secure';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const register = async (req: Request, res: Response) => {
  try {
    const validated = registerSchema.parse(req.body);

    const userCount = await prisma.user.count();
    if (userCount >= 2) {
      return res.status(403).json({ success: false, message: 'This private space is already occupied by the designated couple. Registration is closed.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
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
