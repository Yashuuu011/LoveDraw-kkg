import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const processDemoPayment = async (req: Request, res: Response) => {
  try {
    const { drawId, referenceCode } = req.body;

    if (!drawId || !referenceCode) {
      return res.status(400).json({ success: false, message: 'drawId and referenceCode are required.' });
    }

    const entry = await prisma.entry.findUnique({
      where: { referenceCode },
      include: { draw: true, user: true }
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Transaction reference not found.' });
    }

    return res.json({
      success: true,
      mode: process.env.PAYMENT_MODE || 'demo',
      status: 'CONFIRMED',
      message: 'DEMO PAYMENT SUCCESSFUL! Entry is officially confirmed. ❤️',
      transaction: {
        referenceCode: entry.referenceCode,
        amountINR: entry.draw.entryPriceINR,
        paymentMode: 'DEMO / MOCK GATEWAY',
        timestamp: new Date().toISOString(),
        note: 'This was a simulated demo payment. No real money was charged.'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to process demo payment.' });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    const entry = await prisma.entry.findUnique({
      where: { referenceCode: reference },
      include: { draw: true }
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Reference not found.' });
    }

    return res.json({
      success: true,
      referenceCode: entry.referenceCode,
      status: entry.status,
      drawTitle: entry.draw.title,
      entryDate: entry.createdAt
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch reference status.' });
  }
};
