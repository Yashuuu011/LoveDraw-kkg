import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { DailyMessageService } from '../services/DailyMessageService';
import { AuthRequest } from '../middleware/auth';

export const getTodayMessage = async (req: Request, res: Response) => {
  try {
    // Current date string in YYYY-MM-DD format
    const todayStr = new Date().toISOString().split('T')[0];
    const message = await DailyMessageService.getMessageForDate(todayStr);

    return res.json({
      success: true,
      date: todayStr,
      data: message
    });
  } catch (error) {
    console.error('Error in getTodayMessage:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve today\'s love message.' });
  }
};

export const getAllMessages = async (req: Request, res: Response) => {
  try {
    const { category, search, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = { active: true };
    if (category && category !== 'All') {
      where.category = category as string;
    }
    if (search) {
      where.message = { contains: search as string };
    }

    const [messages, total] = await Promise.all([
      prisma.dailyMessage.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.dailyMessage.count({ where })
    ]);

    return res.json({
      success: true,
      data: messages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve love messages.' });
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { messageId } = req.body;
    if (!messageId) {
      return res.status(400).json({ success: false, message: 'messageId is required.' });
    }

    const existingFav = await prisma.favoriteMessage.findUnique({
      where: {
        userId_messageId: {
          userId: req.user.id,
          messageId
        }
      }
    });

    if (existingFav) {
      await prisma.favoriteMessage.delete({
        where: { id: existingFav.id }
      });
      return res.json({ success: true, favorited: false, message: 'Removed from favorites.' });
    } else {
      await prisma.favoriteMessage.create({
        data: {
          userId: req.user.id,
          messageId
        }
      });
      return res.json({ success: true, favorited: true, message: 'Saved to your favorite love notes! ❤️' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update favorite message.' });
  }
};

export const getUserFavorites = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const favorites = await prisma.favoriteMessage.findMany({
      where: { userId: req.user.id },
      include: { message: true },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      data: favorites.map(f => f.message)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve favorite messages.' });
  }
};
