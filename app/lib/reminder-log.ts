// lib/reminder-log.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fallback in-memory storage for development if DB fails
const fallbackStorage = new Map<number, Date>();

export async function getReminderLog(userId: number) {
  try {
    return await prisma.reminderLog.findUnique({
      where: { userId }
    });
  } catch (error) {
    console.error('Database error, using fallback storage:', error);
    const lastSent = fallbackStorage.get(userId);
    return lastSent ? { userId, lastSent, id: userId } : null;
  }
}

export async function createOrUpdateReminderLog(userId: number) {
  try {
    return await prisma.reminderLog.upsert({
      where: { userId },
      update: { 
        lastSent: new Date(),
        updatedAt: new Date()
      },
      create: {
        userId,
        lastSent: new Date()
      }
    });
  } catch (error) {
    console.error('Database error, using fallback storage:', error);
    fallbackStorage.set(userId, new Date());
    return { userId, lastSent: new Date(), id: userId };
  }
}

export async function canSendReminder(userId: number): Promise<{canSend: boolean; daysUntilNext: number; lastSent: Date | null}> {
  try {
    const log = await getReminderLog(userId);
    
    if (!log) {
      return { canSend: true, daysUntilNext: 0, lastSent: null };
    }

    const lastSent = new Date(log.lastSent);
    const nextAvailable = new Date(lastSent.getTime() + 7 * 24 * 60 * 60 * 1000);
    const canSend = Date.now() >= nextAvailable.getTime();
    const daysUntilNext = canSend ? 0 : Math.ceil((nextAvailable.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return { canSend, daysUntilNext, lastSent };
  } catch (error) {
    console.error('Error checking reminder status:', error);
    // If there's an error, allow sending as fallback
    return { canSend: true, daysUntilNext: 0, lastSent: null };
  }
}

export async function getAllReminderStatuses() {
  try {
    const logs = await prisma.reminderLog.findMany();
    
    return logs.map(log => {
      const lastSent = new Date(log.lastSent);
      const nextAvailable = new Date(lastSent.getTime() + 7 * 24 * 60 * 60 * 1000);
      const canSend = Date.now() >= nextAvailable.getTime();
      const daysUntilNext = canSend ? 0 : Math.ceil((nextAvailable.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      return {
        userId: log.userId,
        lastSent: log.lastSent.toISOString(),
        canSend,
        daysUntilNext
      };
    });
  } catch (error) {
    console.error('Error fetching all reminder statuses:', error);
    return [];
  }
}