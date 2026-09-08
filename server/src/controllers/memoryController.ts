import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getMemories = async (req: Request, res: Response) => {
  try {
    const memories = await prisma.memory.findMany({
      include: {
        draw: { select: { id: true, title: true } }
      },
      orderBy: { date: 'desc' }
    });

    return res.json({
      success: true,
      data: memories
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve memories.' });
  }
};

export const getMemoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const memory = await prisma.memory.findUnique({
      where: { id },
      include: { draw: true }
    });

    if (!memory) {
      return res.status(404).json({ success: false, message: 'Memory not found.' });
    }

    return res.json({
      success: true,
      data: memory
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve memory details.' });
  }
};
