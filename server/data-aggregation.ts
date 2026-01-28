import { db } from "./db";
import { dataAggregation } from "@shared/schema";
import crypto from "crypto";

export interface AggregationEvent {
  eventType: string;
  metadata: Record<string, any>;
  userId?: number;
  userAgent?: string;
  sessionId?: string;
}

export class DataAggregationService {
  private static instance: DataAggregationService;
  private sessionCache = new Map<string, string>();
  private readonly hashSalt: string;

  private constructor() {
    this.hashSalt = process.env.DATA_HASH_SALT || process.env.SESSION_SECRET || crypto.randomBytes(16).toString('hex');
  }

  static getInstance(): DataAggregationService {
    if (!DataAggregationService.instance) {
      DataAggregationService.instance = new DataAggregationService();
    }
    return DataAggregationService.instance;
  }

  /**
   * Create a one-way hash of user ID for privacy
   */
  private hashUserId(userId: number): string {
    return crypto.createHash('sha256').update(`${userId}_${this.hashSalt}`).digest('hex');
  }

  /**
   * Generate or retrieve anonymous session ID
   */
  private getSessionId(ip?: string, userAgent?: string): string {
    const key = `${ip || 'unknown'}_${userAgent || 'unknown'}`;
    
    if (this.sessionCache.has(key)) {
      return this.sessionCache.get(key)!;
    }

    const sessionId = crypto.randomUUID();
    this.sessionCache.set(key, sessionId);
    
    // Clean up old sessions (keep only last 1000)
    if (this.sessionCache.size > 1000) {
      const firstKey = this.sessionCache.keys().next().value;
      this.sessionCache.delete(firstKey);
    }
    
    return sessionId;
  }

  /**
   * Anonymize metadata to remove personally identifiable information
   */
  private anonymizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const anonymized = { ...metadata };
    
    // Remove or hash any potentially identifying fields
    delete anonymized.email;
    delete anonymized.username;
    delete anonymized.name;
    delete anonymized.phone;
    delete anonymized.address;
    
    // Keep only statistical/behavioral data
    const allowedFields = [
      'taskCategory', 'priority', 'completionTime', 'timerDuration',
      'achievementType', 'achievementCount', 'streakLength', 'featureName',
      'errorType', 'responseTime', 'deviceType', 'browserType'
    ];
    
    const filtered: Record<string, any> = {};
    for (const [key, value] of Object.entries(anonymized)) {
      if (allowedFields.includes(key) || key.startsWith('count_') || key.startsWith('time_')) {
        filtered[key] = value;
      }
    }
    
    return filtered;
  }

  /**
   * Log an aggregation event if user has consented
   */
  async logEvent(event: AggregationEvent, req?: any): Promise<void> {
    try {
      // Check if user has data collection consent
      if (event.userId) {
        const user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, event.userId),
          columns: { dataCollectionConsent: true }
        });
        
        if (!user?.dataCollectionConsent) {
          return; // Skip logging if no consent
        }
      }

      const hashedUserId = event.userId ? this.hashUserId(event.userId) : null;
      const sessionId = this.getSessionId(req?.ip, req?.get?.('user-agent'));
      const anonymizedMetadata = this.anonymizeMetadata(event.metadata);

      await db.insert(dataAggregation).values({
        eventType: event.eventType,
        metadata: anonymizedMetadata,
        hashedUserId,
        userAgent: event.userAgent || req?.get?.('user-agent'),
        sessionId: event.sessionId || sessionId,
        version: process.env.npm_package_version || '1.0'
      });

    } catch (error) {
      console.error('Failed to log aggregation event:', error);
      // Don't throw - logging should never break the main flow
    }
  }

  /**
   * Log achievement events for software improvement
   */
  async logAchievementEvent(userId: number, achievementType: string, metadata: Record<string, any>, req?: any): Promise<void> {
    await this.logEvent({
      eventType: 'achievement_earned',
      metadata: {
        achievementType,
        ...metadata
      },
      userId
    }, req);
  }

  /**
   * Log task completion patterns
   */
  async logTaskCompletion(userId: number, taskData: Record<string, any>, req?: any): Promise<void> {
    await this.logEvent({
      eventType: 'task_completed',
      metadata: {
        taskCategory: taskData.category,
        priority: taskData.priority,
        hadTimer: !!taskData.timer,
        timerDuration: taskData.timer,
        completionTime: new Date().getHours(), // Hour of day
        dayOfWeek: new Date().getDay()
      },
      userId
    }, req);
  }

  /**
   * Log feature usage for UX improvements
   */
  async logFeatureUsage(userId: number, featureName: string, metadata: Record<string, any> = {}, req?: any): Promise<void> {
    await this.logEvent({
      eventType: 'feature_used',
      metadata: {
        featureName,
        ...metadata
      },
      userId
    }, req);
  }

  /**
   * Export aggregated data for analysis (admin only)
   */
  async exportAggregatedData(dateFrom?: Date, dateTo?: Date): Promise<any[]> {
    const query = db.select().from(dataAggregation);
    
    if (dateFrom || dateTo) {
      // Add date filtering logic here if needed
    }
    
    return await query;
  }
}

export const dataAggregationService = DataAggregationService.getInstance();