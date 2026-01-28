import { notificationService } from './notification-service';
import { logger } from './logger';

class TaskScheduler {
  private intervals: NodeJS.Timeout[] = [];

  // Start daily calendar reminder job
  startDailyReminderJob() {
    const EVERY_24_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // Run immediately on startup
    this.createDailyReminders();
    
    // Then run every 24 hours
    const interval = setInterval(() => {
      this.createDailyReminders();
    }, EVERY_24_HOURS);
    
    this.intervals.push(interval);
    
    logger.info('Daily calendar reminder job started');
  }

  // Run the daily reminder creation
  private async createDailyReminders() {
    try {
      logger.info('Running daily calendar reminder job');
      
      const remindersCreated = await notificationService.createCalendarReminders();
      
      logger.info('Daily calendar reminder job completed', { 
        remindersCreated,
        timestamp: new Date().toISOString()
      });
      
      // Also cleanup old notifications
      await notificationService.cleanupOldNotifications();
      
    } catch (error) {
      logger.error('Error in daily calendar reminder job', { error });
    }
  }

  // Start download counter increment job
  startDownloadCounterJob() {
    const EVERY_30_SECONDS = 30 * 1000; // 30 seconds in milliseconds
    
    // Run immediately on startup to initialize
    this.updateDownloadCounter();
    
    // Then run every 30 seconds to keep counter running
    const interval = setInterval(() => {
      this.updateDownloadCounter();
    }, EVERY_30_SECONDS);
    
    this.intervals.push(interval);
    
    logger.info('Download counter increment job started - increments every 30 seconds');
  }

  // Update download counter
  private async updateDownloadCounter() {
    try {
      const { storage } = await import('./storage');
      
      // Get current downloads count
      let currentDownloads = await storage.getAppStatistic('downloads');
      
      if (!currentDownloads) {
        // Initialize to 500,000 if not exists
        await storage.setAppStatistic('downloads', 500000);
        logger.info('Download counter initialized to 500,000');
        return;
      }
      
      // Increment by random amount between 1-5 to simulate realistic downloads
      const increment = Math.floor(Math.random() * 5) + 1;
      const newValue = currentDownloads.currentValue + increment;
      
      await storage.setAppStatistic('downloads', newValue);
      
      // Only log occasionally to avoid spam
      if (newValue % 100 === 0) {
        logger.info('Download counter updated', { 
          previousValue: currentDownloads.currentValue,
          newValue,
          increment 
        });
      }
      
    } catch (error) {
      logger.error('Error updating download counter', { error });
    }
  }

  // Start auto-archive job
  startAutoArchiveJob() {
    const EVERY_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds
    
    // Run immediately on startup
    this.processAutoArchive();
    
    // Then run every hour
    const interval = setInterval(() => {
      this.processAutoArchive();
    }, EVERY_HOUR);
    
    this.intervals.push(interval);
    
    logger.info('Auto-archive job started - runs every hour');
  }

  // Process auto-archive tasks
  private async processAutoArchive() {
    try {
      logger.info('Running auto-archive job');
      
      const { storage } = await import('./storage');
      const result = await storage.autoArchiveCompletedTasks();
      const { archivedCount, deletedCount } = result;
      
      if (archivedCount > 0 || deletedCount > 0) {
        logger.info('Auto-archive job completed', { 
          archivedCount,
          deletedCount,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      logger.error('Error in auto-archive job', { error });
    }
  }

  // Start all scheduled jobs
  startAllJobs() {
    this.startDailyReminderJob();
    this.startDownloadCounterJob();
    this.startAutoArchiveJob();
    logger.info('All scheduled jobs started');
  }

  // Stop all scheduled jobs
  stopAllJobs() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    logger.info('All scheduled jobs stopped');
  }
}

export const taskScheduler = new TaskScheduler();