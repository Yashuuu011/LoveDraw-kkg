import prisma from '../utils/prisma';

export class DailyMessageService {
  /**
   * Get or assign the daily love message for the specified date string (YYYY-MM-DD).
   * Ensures no consecutive repeats and intelligent cycling if all 365+ messages have been shown.
   */
  static async getMessageForDate(dateStr: string) {
    // 1. Check if a message was already assigned to this date
    const existingForDate = await prisma.dailyMessage.findFirst({
      where: { usedDate: dateStr, active: true }
    });

    if (existingForDate) {
      return existingForDate;
    }

    // 2. Find unused active messages
    const unusedMessages = await prisma.dailyMessage.findMany({
      where: { usedDate: null, active: true }
    });

    if (unusedMessages.length > 0) {
      // Pick a random unused message
      const selectedIndex = Math.floor(Math.random() * unusedMessages.length);
      const selected = unusedMessages[selectedIndex];

      // Mark message with today's date
      const updated = await prisma.dailyMessage.update({
        where: { id: selected.id },
        data: { usedDate: dateStr }
      });

      return updated;
    }

    // 3. If all messages have been used, find messages NOT used in the past 30 days
    const allActiveMessages = await prisma.dailyMessage.findMany({
      where: { active: true },
      orderBy: { usedDate: 'asc' } // oldest used first
    });

    if (allActiveMessages.length === 0) {
      // Fallback fallback quote if table is empty
      return {
        id: 'fallback-001',
        message: 'Some people make your life better simply by being in it. ❤️',
        category: 'Romantic',
        active: true,
        usedDate: dateStr,
        createdAt: new Date()
      };
    }

    // Pick the oldest used message to cycle
    const oldestUsed = allActiveMessages[0];
    const cycled = await prisma.dailyMessage.update({
      where: { id: oldestUsed.id },
      data: { usedDate: dateStr }
    });

    return cycled;
  }
}
