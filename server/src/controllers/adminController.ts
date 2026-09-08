import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { FairDrawService } from '../services/FairDrawService';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      activeDraws,
      completedDraws,
      totalEntries,
      totalMessages,
      recentUsers,
      recentEntries,
      recentWinners
    ] = await Promise.all([
      prisma.user.count(),
      prisma.draw.count({ where: { status: 'ACTIVE' } }),
      prisma.draw.count({ where: { status: 'COMPLETED' } }),
      prisma.entry.count(),
      prisma.dailyMessage.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, createdAt: true }
      }),
      prisma.entry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          draw: { select: { title: true } }
        }
      }),
      prisma.winner.findMany({
        take: 5,
        orderBy: { selectedAt: 'desc' },
        include: {
          user: { select: { name: true } },
          draw: { select: { title: true } }
        }
      })
    ]);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        activeDraws,
        completedDraws,
        totalEntries,
        totalMessages,
        demoModeActive: process.env.PAYMENT_MODE === 'demo'
      },
      recentUsers,
      recentEntries,
      recentWinners
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load admin dashboard stats.' });
  }
};

export const createDraw = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      type,
      startDate,
      endDate,
      drawDate,
      prizeTitle,
      prizeDescription,
      prizeImage,
      entryPriceINR
    } = req.body;

    if (!title || !description || !prizeTitle || !prizeImage) {
      return res.status(400).json({ success: false, message: 'Missing required draw fields.' });
    }

    const draw = await prisma.draw.create({
      data: {
        title,
        description,
        type: type || 'MONTHLY',
        startDate: new Date(startDate || Date.now()),
        endDate: new Date(endDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
        drawDate: new Date(drawDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        prizeTitle,
        prizeDescription: prizeDescription || description,
        prizeImage,
        entryPriceINR: Number(entryPriceINR) || 99
      }
    });

    await prisma.auditLog.create({
      data: {
        drawId: draw.id,
        action: 'DRAW_CREATED',
        metadata: JSON.stringify({ title, createdBy: req.user?.id })
      }
    });

    return res.status(201).json({
      success: true,
      message: 'New romantic draw created successfully! ❤️',
      data: draw
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create draw.' });
  }
};

export const updateDraw = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    if (updateData.drawDate) updateData.drawDate = new Date(updateData.drawDate);

    const updated = await prisma.draw.update({
      where: { id },
      data: updateData
    });

    return res.json({
      success: true,
      message: 'Draw updated successfully!',
      data: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update draw.' });
  }
};

export const deleteDraw = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.draw.delete({ where: { id } });

    return res.json({ success: true, message: 'Draw removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete draw.' });
  }
};

export const selectWinner = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { announcementNote } = req.body;

    const winner = await FairDrawService.selectWinnerForDraw(id, announcementNote);

    return res.json({
      success: true,
      message: 'Winner selected fair and square! 🎉❤️',
      data: winner
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Error selecting winner.' });
  }
};

export const createMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { message, category } = req.body;
    if (!message || !category) {
      return res.status(400).json({ success: false, message: 'Message text and category required.' });
    }

    const newMessage = await prisma.dailyMessage.create({
      data: { message, category, active: true }
    });

    return res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create message.' });
  }
};

export const updateMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { message, category, active } = req.body;

    const updated = await prisma.dailyMessage.update({
      where: { id },
      data: {
        ...(message && { message }),
        ...(category && { category }),
        ...(typeof active === 'boolean' && { active })
      }
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update message.' });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.dailyMessage.delete({ where: { id } });

    return res.json({ success: true, message: 'Message deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete message.' });
  }
};
