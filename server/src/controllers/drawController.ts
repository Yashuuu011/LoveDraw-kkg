import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getDraws = async (req: Request, res: Response) => {
  try {
    const { status, type } = req.query;

    const where: any = {};
    if (status) where.status = status as string;
    if (type) where.type = type as string;

    const draws = await prisma.draw.findMany({
      where,
      include: {
        _count: {
          select: { entries: true }
        },
        winner: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = draws.map(d => ({
      ...d,
      participantsCount: d._count.entries
    }));

    return res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve draws.' });
  }
};

export const getDrawById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const draw = await prisma.draw.findUnique({
      where: { id },
      include: {
        _count: { select: { entries: true } },
        winner: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } }
          }
        }
      }
    });

    if (!draw) {
      return res.status(404).json({ success: false, message: 'Draw not found.' });
    }

    let userHasEntered = false;
    let userEntry = null;

    if (req.user) {
      userEntry = await prisma.entry.findFirst({
        where: { drawId: id, userId: req.user.id }
      });
      if (userEntry) userHasEntered = true;
    }

    return res.json({
      success: true,
      data: {
        ...draw,
        participantsCount: draw._count.entries,
        userHasEntered,
        userEntry
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve draw details.' });
  }
};

export const createDrawEntry = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Please login to participate in draws.' });
    }

    const { id } = req.params;
    const draw = await prisma.draw.findUnique({ where: { id } });

    if (!draw) {
      return res.status(404).json({ success: false, message: 'Draw not found.' });
    }

    if (draw.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'This draw is not currently accepting entries.' });
    }

    // Check if user already entered this draw
    const existingEntry = await prisma.entry.findFirst({
      where: { drawId: id, userId: req.user.id }
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'You have already entered this draw!',
        entry: existingEntry
      });
    }

    // Generate unique reference code: LD-YYYY-MM-XXXXXX
    const datePrefix = new Date().toISOString().slice(0, 7).replace('-', '');
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const referenceCode = `LD-${datePrefix}-${randomSuffix}`;

    // Create entry with paymentMode = DEMO
    const entry = await prisma.entry.create({
      data: {
        userId: req.user.id,
        drawId: id,
        referenceCode,
        status: 'COMPLETED',
        paymentMode: process.env.PAYMENT_MODE || 'demo'
      },
      include: {
        draw: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        drawId: id,
        action: 'ENTRY_CREATED_DEMO',
        metadata: JSON.stringify({
          userId: req.user.id,
          referenceCode,
          paymentMode: 'DEMO',
          priceINR: draw.entryPriceINR
        })
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Demo entry registered successfully! Good luck in the draw! ❤️',
      data: entry,
      demoPaymentNotice: 'DEMO PAYMENT SIMULATED. No real money was charged.'
    });
  } catch (error) {
    console.error('Error creating draw entry:', error);
    return res.status(500).json({ success: false, message: 'Failed to create draw entry.' });
  }
};

export const getDrawEntries = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const entries = await prisma.entry.findMany({
      where: { drawId: id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve draw entries.' });
  }
};
