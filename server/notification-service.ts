import { db } from './db';
import { notifications, tasks, users } from '@shared/schema';
import { eq, and, lte, isNull, lt, gte } from 'drizzle-orm';
import { logger } from './logger';

export class NotificationService {
  // Create a new notification
  async createNotification(notification: {
    userId: number;
    type: string;
    title: string;
    message: string;
    taskId?: string;
    scheduledFor?: Date;
  }) {
    try {
      const [createdNotification] = await db
        .insert(notifications)
        .values({
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          taskId: notification.taskId || null,
          scheduledFor: notification.scheduledFor || null,
          isRead: false,
        })
        .returning();

      logger.info('Notification created', { 
        notificationId: createdNotification.id,
        userId: notification.userId,
        type: notification.type
      });

      return createdNotification;
    } catch (error) {
      logger.error('Error creating notification', { error, notification });
      throw error;
    }
  }

  // Get notifications for a user
  async getUserNotifications(userId: number, includeRead = false) {
    try {
      const conditions = includeRead 
        ? [eq(notifications.userId, userId)]
        : [eq(notifications.userId, userId), eq(notifications.isRead, false)];

      const userNotifications = await db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(notifications.createdAt);

      return userNotifications;
    } catch (error) {
      logger.error('Error fetching user notifications', { error, userId });
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: number, userId: number) {
    try {
      await db
        .update(notifications)
        .set({ 
          isRead: true, 
          readAt: new Date() 
        })
        .where(and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        ));

      logger.info('Notification marked as read', { notificationId, userId });
    } catch (error) {
      logger.error('Error marking notification as read', { error, notificationId, userId });
      throw error;
    }
  }

  // Create calendar reminders for tasks scheduled tomorrow
  async createCalendarReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const endOfTomorrow = new Date(tomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);

      // Find tasks scheduled for tomorrow that don't have completed status
      const tasksForTomorrow = await db
        .select({
          id: tasks.id,
          title: tasks.title,
          userId: tasks.userId,
          scheduledDate: tasks.scheduledDate,
        })
        .from(tasks)
        .where(and(
          gte(tasks.scheduledDate, tomorrow),
          lte(tasks.scheduledDate, endOfTomorrow),
          eq(tasks.completed, false),
          eq(tasks.archived, false)
        ));

      // Check if reminders already exist for these tasks
      const existingReminders = await db
        .select({ taskId: notifications.taskId })
        .from(notifications)
        .where(eq(notifications.type, 'calendar_reminder'));

      const existingTaskIds = new Set(existingReminders.map(r => r.taskId));

      // Create reminders for tasks that don't already have them
      const remindersToCreate = tasksForTomorrow.filter(task => 
        task.userId && !existingTaskIds.has(task.id)
      );

      for (const task of remindersToCreate) {
        if (!task.userId) continue;

        await this.createNotification({
          userId: task.userId,
          type: 'calendar_reminder',
          title: 'Upcoming Task Tomorrow',
          message: `Don't forget: "${task.title}" is scheduled for tomorrow!`,
          taskId: task.id,
          scheduledFor: new Date(), // Send immediately
        });
      }

      logger.info('Calendar reminders created', { 
        remindersCreated: remindersToCreate.length,
        tasksChecked: tasksForTomorrow.length 
      });

      return remindersToCreate.length;
    } catch (error) {
      logger.error('Error creating calendar reminders', { error });
      throw error;
    }
  }

  // Cleanup old read notifications (older than 30 days)
  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await db
        .delete(notifications)
        .where(and(
          eq(notifications.isRead, true),
          lte(notifications.readAt, thirtyDaysAgo)
        ));

      logger.info('Old notifications cleaned up', {});
    } catch (error) {
      logger.error('Error cleaning up old notifications', { error });
      throw error;
    }
  }

  // Create a day-before reminder for a scheduled task
  async createScheduledTaskReminder(task: { id: string; title: string; userId: number; scheduledDate: Date }) {
    try {
      // Calculate the day before the scheduled date
      const reminderDate = new Date(task.scheduledDate);
      reminderDate.setDate(reminderDate.getDate() - 1);
      reminderDate.setHours(9, 0, 0, 0); // Send reminder at 9 AM the day before

      // Only create reminder if it's in the future
      if (reminderDate > new Date()) {
        await this.createNotification({
          userId: task.userId,
          type: 'calendar_reminder',
          title: 'Tomorrow\'s Task Reminder',
          message: `Reminder: "${task.title}" is scheduled for tomorrow!`,
          taskId: task.id,
          scheduledFor: reminderDate,
        });

        logger.info('Scheduled task reminder created', { 
          taskId: task.id, 
          reminderDate: reminderDate.toISOString() 
        });
      }
    } catch (error) {
      logger.error('Error creating scheduled task reminder', { error, taskId: task.id });
      throw error;
    }
  }

}

export const notificationService = new NotificationService();