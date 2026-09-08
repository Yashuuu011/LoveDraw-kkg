import crypto from 'crypto';
import prisma from '../utils/prisma';

export class FairDrawService {
  /**
   * Conducts a fair, server-side cryptographically secure draw selection.
   */
  static async selectWinnerForDraw(drawId: string, announcementNote?: string) {
    // 1. Verify draw exists and hasn't already had a winner selected
    const draw = await prisma.draw.findUnique({
      where: { id: drawId },
      include: { winner: true }
    });

    if (!draw) {
      throw new Error('Draw not found.');
    }

    if (draw.winner) {
      throw new Error('A winner has already been selected for this draw.');
    }

    // 2. Fetch all valid entries for this draw
    const entries = await prisma.entry.findMany({
      where: {
        drawId,
        status: 'COMPLETED'
      },
      include: {
        user: true
      }
    });

    if (entries.length === 0) {
      throw new Error('No eligible completed entries found for this draw.');
    }

    // 3. Select winner using cryptographically strong random index
    const randomIndex = crypto.randomInt(0, entries.length);
    const winningEntry = entries[randomIndex];

    // 4. Save Winner record & update Draw status in a Prisma transaction
    const winnerRecord = await prisma.$transaction(async (tx) => {
      const winner = await tx.winner.create({
        data: {
          drawId,
          entryId: winningEntry.id,
          userId: winningEntry.userId,
          announcementNote: announcementNote || `Congratulations to ${winningEntry.user.name}! May your love continue to bloom and inspire! ❤️`
        },
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true }
          },
          draw: true,
          entry: true
        }
      });

      // Update draw status to COMPLETED
      await tx.draw.update({
        where: { id: drawId },
        data: { status: 'COMPLETED' }
      });

      // Create Audit Log
      await tx.auditLog.create({
        data: {
          drawId,
          action: 'FAIR_WINNER_SELECTED',
          metadata: JSON.stringify({
            winnerUserId: winningEntry.userId,
            winnerName: winningEntry.user.name,
            winningEntryId: winningEntry.id,
            winningRefCode: winningEntry.referenceCode,
            totalEligibleEntries: entries.length,
            selectedIndex: randomIndex,
            timestamp: new Date().toISOString()
          })
        }
      });

      return winner;
    });

    return winnerRecord;
  }
}
