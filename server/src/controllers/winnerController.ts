import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getAllWinners = async (req: Request, res: Response) => {
  try {
    const winners = await prisma.winner.findMany({
      include: {
        draw: true,
        user: { select: { id: true, name: true, avatarUrl: true } }
      },
      orderBy: { selectedAt: 'desc' }
    });

    return res.json({
      success: true,
      data: winners
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve winners list.' });
  }
};

export const getDrawWinner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const winner = await prisma.winner.findUnique({
      where: { drawId: id },
      include: {
        draw: true,
        user: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    if (!winner) {
      return res.status(404).json({ success: false, message: 'Winner has not been selected yet for this draw.' });
    }

    return res.json({
      success: true,
      data: winner
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve draw winner.' });
  }
};
