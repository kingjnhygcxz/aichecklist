import { Task, tasks, InsertTask, users, User, InsertUser, feedback, InsertFeedback, Feedback, directTaskShares, InsertDirectTaskShare, DirectTaskShare, achievements, Achievement, userAchievements, UserAchievement, userStats, UserStats, InsertUserStats, InsertUserAchievement, customerAnalytics, CustomerAnalytics, InsertCustomerAnalytics, passwordResetTokens, PasswordResetToken, InsertPasswordResetToken, appStatistics, AppStatistic, InsertAppStatistic, timerAnalytics, TimerAnalytics, InsertTimerAnalytics, taskTemplates, TaskTemplate, InsertTaskTemplate, templateFavorites, templateUsageHistory, aidomoConversations, AidomoConversation, InsertAidomoConversation, aidomoTokens, AidomoTokens, InsertAidomoTokens, loginCodes, LoginCode, InsertLoginCode, siteAnalytics, SiteAnalytics, InsertSiteAnalytics, visitorSessions, VisitorSession, InsertVisitorSession, pageViews, PageView, InsertPageView, schedulingSettings, SchedulingSettings, InsertSchedulingSettings, appointments, Appointment, InsertAppointment, AppointmentStatus, contacts, Contact, InsertContact, messages, Message, InsertMessage, messageThreads, MessageThread, InsertMessageThread } from "@shared/schema";
import { logger } from "./logger";
import { db } from "./db";
import { eq, desc, asc, or, and, ilike, lt, gte, inArray, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Interface for storage operations
export interface IStorage {
  getAllTasks(userId: number): Promise<Task[]>;
  getHighPriorityTasks(userId: number): Promise<Task[]>;
  getTask(id: string, userId?: number): Promise<Task | undefined>;
  createTask(task: Omit<Task, "id" | "createdAt">): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  initializeDatabase(): Promise<void>;
  // New methods for recurring tasks
  createRecurringTask(taskData: Omit<Task, "id" | "createdAt">): Promise<Task>;
  getChildTasks(parentTaskId: string): Promise<Task[]>;
  processRecurringTasks(): Promise<void>; // Process due recurring tasks
  // User authentication methods
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;
  updateUserEmailVerification(userId: number, verifiedAt: Date): Promise<User | undefined>;
  updateUserLastLogin(userId: number): Promise<void>;
  updateUserProfile(userId: number, profileData: Partial<User>): Promise<User | undefined>;
  
  // Feedback methods
  createFeedback(feedbackData: InsertFeedback): Promise<Feedback>;
  getAllFeedback(): Promise<Feedback[]>;
  updateFeedbackStatus(id: string, status: string): Promise<Feedback | undefined>;
  
  // Direct task sharing methods
  createDirectTaskShare(shareData: InsertDirectTaskShare): Promise<DirectTaskShare>;
  getDirectTaskSharesForUser(userId: number): Promise<DirectTaskShare[]>;
  acceptDirectTaskShare(shareId: number, userId: number): Promise<boolean>;
  importDirectTaskShare(shareId: number, userId: number): Promise<Task>;
  getUserByUsernameOrEmail(identifier: string): Promise<User | undefined>;
  
  // Achievement methods
  initializeAchievements(): Promise<void>;
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  getUserStats(userId: number): Promise<UserStats>;
  updateUserStats(userId: number, updates: Partial<UserStats>): Promise<UserStats>;
  checkAndUpdateAchievements(userId: number): Promise<UserAchievement[]>;
  recordTaskCompletion(userId: number, task: Task): Promise<void>;
  
  // Customer management methods
  getAllCustomers(): Promise<User[]>;
  getCustomerById(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  updateCustomer(id: number, updates: Partial<User>): Promise<User | undefined>;
  getCustomerAnalytics(userId: number): Promise<CustomerAnalytics[]>;
  recordCustomerEvent(eventData: InsertCustomerAnalytics): Promise<CustomerAnalytics>;
  getCustomersByStatus(status: string): Promise<User[]>;
  getCustomersBySubscriptionStatus(subscriptionStatus: string): Promise<User[]>;
  searchCustomers(query: string): Promise<User[]>;
  
  // Password reset methods
  createPasswordResetToken(userId: number, email: string, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenAsUsed(tokenId: number): Promise<void>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<User | undefined>;
  cleanupExpiredPasswordResetTokens(): Promise<void>;
  
  // App statistics methods
  getAppStatistic(metricName: string): Promise<AppStatistic | undefined>;
  setAppStatistic(metricName: string, value: number): Promise<AppStatistic>;
  incrementAppStatistic(metricName: string, incrementBy?: number): Promise<AppStatistic>;

  // Timer Analytics methods
  recordTimerSession(analyticsData: InsertTimerAnalytics): Promise<TimerAnalytics>;
  getUserTimerAnalytics(userId: number, days?: number): Promise<TimerAnalytics[]>;
  getProductivityStats(userId: number): Promise<{
    totalSessions: number;
    earlyCompletions: number;
    averageEarlyPercentage: number;
    productivityTrend: string;
  }>;
  
  // Template methods
  getTemplates(): Promise<TaskTemplate[]>;
  getTemplate(id: number): Promise<TaskTemplate | undefined>;
  createTemplate(data: InsertTaskTemplate): Promise<TaskTemplate>;
  incrementTemplateUsage(id: number): Promise<void>;
  getTasksByIds(taskIds: string[], userId: number): Promise<Task[]>;
  deleteUserTemplate(templateId: number, userId: number): Promise<boolean>;
  
  // Template Favorites methods
  getTemplateFavorites(userId: number): Promise<number[]>;
  addTemplateFavorite(userId: number, templateId: number): Promise<void>;
  removeTemplateFavorite(userId: number, templateId: number): Promise<void>;
  isTemplateFavorite(userId: number, templateId: number): Promise<boolean>;
  
  // Template Usage History methods
  recordTemplateUsage(userId: number, templateId: number, templateName: string): Promise<void>;
  getTemplateUsageHistory(userId: number, limit?: number): Promise<{ templateId: number; templateName: string; usedAt: Date }[]>;
  
  // User Memory methods for AI context
  getUserMemory(userId: number): Promise<any>;
  saveUserMemory(userId: number, memoryData: any): Promise<any>;
  addConversationToMemory(userId: number, conversation: any): Promise<void>;
  updateUserMemoryField(userId: number, field: string, value: any): Promise<void>;
  
  // AIDOMO Conversation methods
  createAidomoConversation(conversationData: InsertAidomoConversation): Promise<AidomoConversation>;
  getAidomoConversation(sessionId: string, userId: number): Promise<AidomoConversation | undefined>;
  getUserAidomoConversations(userId: number): Promise<AidomoConversation[]>;
  updateAidomoConversation(sessionId: string, updates: Partial<AidomoConversation>): Promise<AidomoConversation | undefined>;
  updateAidomoConversationMessages(sessionId: string, messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string; timestamp: string; tokensUsed?: number }>): Promise<void>;
  addMessageToConversation(sessionId: string, message: { role: 'user' | 'assistant' | 'system'; content: string; timestamp: string; tokensUsed?: number }): Promise<void>;
  archiveAidomoConversation(sessionId: string, userId: number): Promise<boolean>;
  deleteAidomoConversation(sessionId: string, userId: number): Promise<boolean>;
  
  // AIDOMO Token management methods
  getUserAidomoTokens(userId: number): Promise<AidomoTokens>;
  createAidomoTokens(tokenData: InsertAidomoTokens): Promise<AidomoTokens>;
  updateAidomoTokens(userId: number, updates: Partial<AidomoTokens>): Promise<AidomoTokens>;
  deductTokens(userId: number, tokensUsed: number): Promise<boolean>;
  addBonusTokens(userId: number, bonusTokens: number): Promise<void>;
  resetMonthlyTokens(userId: number): Promise<void>;
  checkTokenLimit(userId: number, tokensNeeded: number): Promise<boolean>;
  
  // Login code methods for email authentication
  createLoginCode(email: string, code: string, userId?: number): Promise<LoginCode>;
  verifyLoginCode(email: string, code: string): Promise<LoginCode | undefined>;
  cleanupExpiredLoginCodes(): Promise<void>;
  markLoginCodeAsUsed(id: number): Promise<void>;
  
  // Calendar conflict resolution methods
  getEventsByDate(userId: number, date: Date): Promise<Task[]>;
  detectCalendarConflicts(userId: number, date: Date, eventId?: string, time?: Date): Promise<{
    conflicts: Array<{ task1: Task; task2: Task; type: 'overlap' | 'buffer' | 'dependency' }>;
    graph: Record<string, string[]>;
  }>;
  suggestRescheduling(userId: number, date: Date, conflictInfo: any): Promise<Array<{
    proposalId: string;
    changes: Array<{ id: string; newStart: Date; newEnd: Date }>;
    cost: number;
    impact: string;
  }>>;
  applyRescheduling(userId: number, changes: Array<{ id: string; scheduledDate: Date; scheduledEnd?: Date }>): Promise<Task[]>;
  bulkUpdateTasks(updates: Array<{ id: string; updates: Partial<Task> }>): Promise<void>;
  snapshotDaySchedule(userId: number, date: Date): Promise<string>;
  restoreDaySchedule(userId: number, snapshotId: string): Promise<void>;
  
  // Analytics methods
  trackPageView(data: any): Promise<void>;
  trackEvent(data: any): Promise<void>;
  createVisitorSession(data: any): Promise<string>;
  updateVisitorSession(sessionId: string, updates: any): Promise<void>;
  getSiteAnalytics(startDate: Date, endDate: Date): Promise<any[]>;
  getVisitorSessions(filters?: any): Promise<any[]>;
  getPageViews(sessionId?: string): Promise<any[]>;
  updateDailyAnalytics(date: Date, updates: any): Promise<void>;
  getAnalyticsDashboard(): Promise<{
    today: any;
    yesterday: any;
    last7Days: any;
    last30Days: any;
    topPages: any[];
    activeUsers: number;
    totalUsers: number;
  }>;
  
  // Scheduling methods
  getSchedulingSettings(userId: number): Promise<SchedulingSettings | undefined>;
  getSchedulingSettingsBySlug(slug: string): Promise<SchedulingSettings | undefined>;
  createSchedulingSettings(data: InsertSchedulingSettings): Promise<SchedulingSettings>;
  updateSchedulingSettings(userId: number, updates: Partial<SchedulingSettings>): Promise<SchedulingSettings | undefined>;
  createAppointment(data: InsertAppointment): Promise<Appointment>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  getUserAppointments(userId: number): Promise<Appointment[]>;
  updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment | undefined>;
  getAppointmentByCancellationToken(token: string): Promise<Appointment | undefined>;
  getAppointmentsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Appointment[]>;
  
  // Notion integration methods
  updateUserNotionSettings(userId: number, settings: { notionApiKey?: string | null; notionDefaultDatabaseId?: string | null }): Promise<User | undefined>;
  
  // Trello integration methods
  updateUserTrelloSettings(userId: number, settings: { trelloApiKey?: string | null; trelloToken?: string | null; trelloDefaultBoardId?: string | null; trelloDefaultListId?: string | null }): Promise<User | undefined>;
  
  // Health check method
  healthCheck(): Promise<boolean>;
  
  // Contacts methods
  addContact(input: { ownerUserId: number; contactUserId?: number | null; displayName: string; title?: string | null; department?: string | null; email: string; aliasesCsv?: string | null }): Promise<Contact>;
  findContacts(ownerUserId: number, query: string, limit?: number): Promise<Contact[]>;
  getContactById(ownerUserId: number, contactId: number): Promise<Contact | null>;
  
  // Messages methods
  sendMessage(input: { fromUserId: number; toUserId: number; subject?: string | null; body: string; threadId?: number | null }): Promise<{ message: Message; thread: MessageThread }>;
  listInbox(userId: number, limit?: number, unreadOnly?: boolean): Promise<(Message & { fromDisplayName?: string; fromUsername?: string })[]>;
  readMessage(userId: number, messageId: number): Promise<Message | null>;
  markMessageRead(userId: number, messageId: number): Promise<Message | null>;
  
  // Thread methods
  findOrCreateThread(userAId: number, userBId: number, title?: string): Promise<MessageThread>;
  getThread(threadId: number, userId: number): Promise<{ thread: MessageThread; messages: Message[] } | null>;
  markThreadRead(threadId: number, userId: number): Promise<number>;
  
  // Notification methods
  listNotifications(params: { userId: number; limit?: number; unreadOnly?: boolean }): Promise<{
    id: number;
    threadId: number | null;
    title: string;
    snippet: string;
    createdAt: Date;
    readAt: Date | null;
    from: { userId: number; name: string; email: string | null };
    deepLink: string;
  }[]>;
  getUnreadNotificationCount(userId: number): Promise<number>;
  
  // Premium thread notifications (one per thread with unread count)
  listThreadNotifications(params: { userId: number; limit?: number; unreadOnly?: boolean }): Promise<{
    threadId: number;
    latestMessageId: number;
    unreadCount: number;
    title: string;
    snippet: string;
    createdAt: Date;
    from: { userId: number; name: string; email: string | null };
    deepLink: string;
  }[]>;
  getUnreadThreadNotificationCount(userId: number): Promise<number>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  
  constructor() {
    logger.info("Database storage initialized");
  }
  
  // Create a recurring task with appropriate scheduling
  async createRecurringTask(taskData: Omit<Task, "id" | "createdAt">): Promise<Task> {
    try {
      // Generate parent task ID
      const parentTaskId = uuidv4();
      
      // Insert parent recurring task
      const [parentTask] = await db.insert(tasks).values({
        id: parentTaskId,
        ...taskData,
        isRecurring: true,
        createdAt: new Date(),
      }).returning();
      
      // Create the first instance of the recurring task
      await this.createNextRecurringInstance(parentTask);
      
      logger.info(`Created recurring task: ${parentTaskId}`, { taskTitle: taskData.title });
      return parentTask;
    } catch (error) {
      logger.error("Error creating recurring task", { error });
      throw new Error("Failed to create recurring task");
    }
  }
  
  // Get all child tasks for a parent recurring task
  async getChildTasks(parentTaskId: string): Promise<Task[]> {
    try {
      return await db.select().from(tasks)
        .where(eq(tasks.parentTaskId, parentTaskId))
        .orderBy(asc(tasks.nextDueDate));
    } catch (error) {
      logger.error("Error fetching child tasks", { error, parentTaskId });
      return [];
    }
  }
  
  // Process due recurring tasks and create next instances
  async processRecurringTasks(): Promise<void> {
    try {
      const now = new Date();
      
      // Find all recurring parent tasks
      const recurringTasks = await db.select().from(tasks)
        .where(eq(tasks.isRecurring, true));
      
      for (const task of recurringTasks) {
        // Find the most recent child task
        const [latestChild] = await db.select().from(tasks)
          .where(eq(tasks.parentTaskId, task.id))
          .orderBy(desc(tasks.nextDueDate))
          .limit(1);
        
        // If no child exists or the latest child's due date has passed
        if (!latestChild || (latestChild.nextDueDate && latestChild.nextDueDate < now)) {
          await this.createNextRecurringInstance(task);
        }
      }
      
      logger.info("Processed recurring tasks");
    } catch (error) {
      logger.error("Error processing recurring tasks", { error });
    }
  }
  
  // Helper method to create the next instance of a recurring task
  private async createNextRecurringInstance(parentTask: Task): Promise<Task | null> {
    try {
      if (!parentTask.isRecurring || !parentTask.recurringFrequency) {
        return null;
      }
      
      const nextDueDate = this.calculateNextDueDate(parentTask);
      if (!nextDueDate) return null;
      
      // Don't create if we've reached the end date
      if (parentTask.endDate && nextDueDate > parentTask.endDate) {
        return null;
      }
      
      // Create the next instance
      const [childTask] = await db.insert(tasks).values({
        id: uuidv4(),
        title: parentTask.title,
        category: parentTask.category,
        priority: parentTask.priority,
        completed: false,
        timer: parentTask.timer,
        createdAt: new Date(),
        isRecurring: false, // Child tasks are not recurring themselves
        parentTaskId: parentTask.id,
        nextDueDate: nextDueDate
      }).returning();
      
      logger.info(`Created next instance of recurring task`, { 
        parentId: parentTask.id, 
        childId: childTask.id,
        dueDate: nextDueDate
      });
      
      return childTask;
    } catch (error) {
      logger.error("Error creating next recurring instance", { error, taskId: parentTask.id });
      return null;
    }
  }
  
  // Calculate the next due date based on frequency and other parameters
  private calculateNextDueDate(task: Task): Date | null {
    if (!task.recurringFrequency) return null;
    
    const now = new Date();
    let nextDate = new Date();
    
    // Start from the last due date or now if none exists
    if (task.nextDueDate) {
      nextDate = new Date(task.nextDueDate);
    }
    
    const interval = task.recurringInterval || 1;
    
    switch (task.recurringFrequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + interval);
        break;
        
      case 'weekly':
        // Handle specific days of week if provided
        if (task.daysOfWeek && task.daysOfWeek.length > 0) {
          // Find the next day of week that's in our list
          const currentDayOfWeek = nextDate.getDay();
          let daysToAdd = 1;
          
          for (let i = 1; i <= 7; i++) {
            const nextDayOfWeek = (currentDayOfWeek + i) % 7;
            if (task.daysOfWeek.includes(nextDayOfWeek)) {
              daysToAdd = i;
              break;
            }
          }
          
          nextDate.setDate(nextDate.getDate() + daysToAdd);
        } else {
          // Simple weekly interval
          nextDate.setDate(nextDate.getDate() + (7 * interval));
        }
        break;
        
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + (14 * interval));
        break;
        
      case 'monthly':
        // Handle specific day of month if provided
        if (task.dayOfMonth && task.dayOfMonth > 0 && task.dayOfMonth <= 31) {
          nextDate.setDate(task.dayOfMonth);
          nextDate.setMonth(nextDate.getMonth() + interval);
          
          // If we've gone backward, we need to move forward another month
          if (nextDate <= now) {
            nextDate.setMonth(nextDate.getMonth() + 1);
          }
        } else {
          // Simple monthly interval
          nextDate.setMonth(nextDate.getMonth() + interval);
        }
        break;
        
      case 'yearly':
        // Handle specific month and day if provided
        if (task.monthOfYear && task.monthOfYear >= 0 && task.monthOfYear <= 11 &&
            task.dayOfMonth && task.dayOfMonth > 0 && task.dayOfMonth <= 31) {
          nextDate.setMonth(task.monthOfYear);
          nextDate.setDate(task.dayOfMonth);
          nextDate.setFullYear(nextDate.getFullYear() + interval);
          
          // If we've gone backward, we need to move forward another year
          if (nextDate <= now) {
            nextDate.setFullYear(nextDate.getFullYear() + 1);
          }
        } else {
          // Simple yearly interval
          nextDate.setFullYear(nextDate.getFullYear() + interval);
        }
        break;
        
      case 'custom':
        // For custom frequency, just use the interval as days
        nextDate.setDate(nextDate.getDate() + interval);
        break;
        
      default:
        return null;
    }
    
    return nextDate;
  }

  async initializeDatabase(): Promise<void> {
    try {
      // Initialize achievements (but don't create demo tasks globally)
      await this.initializeAchievements();
      logger.info("Database initialized successfully - no demo tasks created");
    } catch (error) {
      logger.error("Failed to initialize database", { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  async getAllTasks(userId: number): Promise<Task[]> {
    try {
      // Security: userId is now required to prevent data leaks between users
      if (!userId) {
        throw new Error("User ID is required to retrieve tasks - this prevents data leaks between accounts");
      }
      
      // Filter by user ID and exclude archived tasks
      const conditions = [
        eq(tasks.archived, false),
        eq(tasks.userId, userId) // Always filter by userId for security
      ];
      
      const allTasks = await db
        .select({
          task: tasks,
          appointment: appointments
        })
        .from(tasks)
        .leftJoin(appointments, eq(tasks.id, appointments.taskId))
        .where(and(...conditions))
        .orderBy(
          asc(tasks.completed), // Incomplete tasks first
          asc(tasks.displayOrder), // Then by display order within each group
          desc(tasks.createdAt) // Fallback to creation time for tasks without displayOrder
        );
      
      // Transform the result to include appointment data in the task object
      const tasksWithAppointments = allTasks.map(row => ({
        ...row.task,
        appointment: row.appointment ? {
          attendeeName: row.appointment.attendeeName,
          attendeeEmail: row.appointment.attendeeEmail,
          attendeeNotes: row.appointment.attendeeNotes,
          startTime: row.appointment.startTime.toISOString(),
          endTime: row.appointment.endTime.toISOString(),
          status: row.appointment.status
        } : undefined
      }));
      
      logger.debug("Retrieved tasks", { 
        count: tasksWithAppointments.length, 
        userId,
        taskOrder: tasksWithAppointments.map(t => ({ id: t.id.slice(0,8), title: t.title?.slice(0,20), completed: t.completed, displayOrder: t.displayOrder }))
      });
      return tasksWithAppointments;
    } catch (error) {
      logger.error("Failed to retrieve tasks", { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  async getHighPriorityTasks(userId: number): Promise<Task[]> {
    try {
      // Security: Only authenticated users can access their own high priority tasks
      if (!userId) {
        throw new Error("Authentication required to access high priority tasks");
      }
      
      const conditions = [
        eq(tasks.userId, userId),
        eq(tasks.priority, 'High'),
        eq(tasks.archived, false),
        eq(tasks.completed, false) // Only show uncompleted high priority tasks
      ];
      
      const highPriorityTasks = await db
        .select()
        .from(tasks)
        .where(and(...conditions))
        .orderBy(desc(tasks.createdAt));
      
      logger.info("Retrieved high priority tasks", { 
        count: highPriorityTasks.length, 
        userId,
        userRequested: true 
      });
      
      return highPriorityTasks;
    } catch (error) {
      logger.error("Failed to retrieve high priority tasks", { 
        error: error instanceof Error ? error.message : String(error),
        userId
      });
      throw error;
    }
  }

  async getTask(id: string, userId?: number): Promise<Task | undefined> {
    try {
      const conditions = [eq(tasks.id, id)];
      
      // Add userId filter if provided for security (prevents cross-user data access)
      if (userId) {
        conditions.push(eq(tasks.userId, userId));
        logger.debug(`Getting task with user validation: ${id}`, { userId });
      } else {
        logger.debug(`Getting task without user validation: ${id} - USE WITH CAUTION`);
      }
      
      const [task] = await db.select().from(tasks).where(and(...conditions));
      
      if (task) {
        logger.debug(`Retrieved task: ${id}`, { taskTitle: task.title, userId: task.userId });
        return task;
      } else {
        logger.debug(`Task not found or access denied: ${id}`, { requestedUserId: userId });
        return undefined;
      }
    } catch (error) {
      logger.error(`Failed to retrieve task: ${id}`, { 
        error: error instanceof Error ? error.message : String(error),
        userId 
      });
      throw error;
    }
  }

  async createTask(taskData: Omit<Task, "id" | "createdAt">): Promise<Task> {
    try {
      // Handle scheduledDate conversion - ensure it's a proper Date object
      const processedTaskData = { ...taskData };
      if ('scheduledDate' in processedTaskData && processedTaskData.scheduledDate) {
        if (typeof processedTaskData.scheduledDate === 'string') {
          // Convert string to Date object to avoid toISOString errors
          processedTaskData.scheduledDate = new Date(processedTaskData.scheduledDate);
          logger.debug(`Converting scheduledDate string to Date object for new task`);
        }
      }
      
      // Prepare the task with an ID and createdAt timestamp
      const task: Task = {
        ...processedTaskData,
        id: uuidv4(),
        createdAt: new Date(),
      };
      
      // Insert the task
      await db.insert(tasks).values(task);
      
      logger.info(`Created new task: ${task.id}`, { 
        taskTitle: task.title,
        category: task.category,
        priority: task.priority,
        userId: task.userId
      });
      
      return task;
    } catch (error) {
      logger.error("Failed to create task", { 
        error: error instanceof Error ? error.message : String(error),
        taskData
      });
      throw error;
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    try {
      // First, check if the task exists
      const existingTask = await this.getTask(id);
      if (!existingTask) {
        logger.warn(`Failed to update task: ${id} - Task not found`);
        return undefined;
      }
      
      // Handle completion timestamp logic
      const updatedData = { ...updates };
      
      // Handle date field conversions - ensure they're proper Date objects
      const dateFields = ['scheduledDate', 'scheduledEnd', 'nextDueDate', 'endDate', 'completedAt', 'archivedAt', 'createdAt'] as const;
      for (const field of dateFields) {
        if (field in updates && updates[field as keyof Task]) {
          const value = updates[field as keyof Task];
          if (typeof value === 'string') {
            // Convert string to Date object to avoid toISOString errors
            (updatedData as any)[field] = new Date(value);
            logger.debug(`Converting ${field} string to Date object for task: ${id}`);
          }
        }
      }
      
      // Remove fields that shouldn't be updated (read-only or virtual fields)
      delete (updatedData as any).appointment;
      delete (updatedData as any).id; // ID shouldn't be changed
      
      if ('completed' in updates) {
        if (updates.completed && !existingTask.completed) {
          // Task is being marked as completed
          updatedData.completedAt = new Date();
          logger.debug(`Setting completedAt timestamp for task: ${id}`);
        } else if (!updates.completed && existingTask.completed) {
          // Task is being marked as not completed
          updatedData.completedAt = null;
          logger.debug(`Clearing completedAt timestamp for task: ${id}`);
        }
      }
      
      // Update the task
      await db
        .update(tasks)
        .set(updatedData)
        .where(eq(tasks.id, id));
      
      // Get the updated task
      const updatedTask = await this.getTask(id);
      
      logger.info(`Updated task: ${id}`, { 
        taskTitle: existingTask.title,
        updates: Object.keys(updates),
        completedStatusChanged: 'completed' in updates
      });
      
      return updatedTask;
    } catch (error) {
      logger.error(`Failed to update task: ${id}`, { 
        error: error instanceof Error ? error.message : String(error),
        updates
      });
      throw error;
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      // Check if the task exists
      const task = await this.getTask(id);
      if (!task) {
        logger.warn(`Failed to delete task: ${id} - Task not found`);
        return false;
      }
      
      // Delete the task
      await db.delete(tasks).where(eq(tasks.id, id));
      
      // Since we already checked that the task exists, deletion was successful
      logger.info(`Deleted task: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete task: ${id}`, { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  async archiveTask(id: string): Promise<boolean> {
    try {
      // Check if the task exists
      const task = await this.getTask(id);
      if (!task) {
        logger.warn(`Failed to archive task: ${id} - Task not found`);
        return false;
      }

      // Only allow archiving completed tasks
      if (!task.completed) {
        logger.warn(`Failed to archive task: ${id} - Task not completed`);
        return false;
      }
      
      // Archive the task
      const [archivedTask] = await db.update(tasks)
        .set({ 
          archived: true, 
          archivedAt: new Date() 
        })
        .where(eq(tasks.id, id))
        .returning();
      
      if (archivedTask) {
        logger.info(`Archived task: ${id}`, { title: archivedTask.title });
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error(`Failed to archive task: ${id}`, { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  async getArchivedTasks(userId?: number): Promise<Task[]> {
    try {
      // Add WHERE clauses
      const conditions = [eq(tasks.archived, true)];
      if (userId) {
        conditions.push(eq(tasks.userId, userId));
      }
      
      const archivedTasks = await db.select()
        .from(tasks)
        .where(and(...conditions))
        .orderBy(desc(tasks.archivedAt));
      logger.debug(`Retrieved archived tasks`, { 
        count: archivedTasks.length, 
        userId 
      });
      
      return archivedTasks;
    } catch (error) {
      logger.error('Failed to get archived tasks', { error, userId });
      throw error;
    }
  }

  async autoArchiveCompletedTasks(): Promise<{ archivedCount: number; deletedCount: number }> {
    try {
      // Get all users with auto-archive enabled
      const usersWithAutoArchive = await db.select()
        .from(users)
        .where(eq(users.autoArchiveEnabled, true));

      let totalArchivedCount = 0;
      let totalDeletedCount = 0;

      for (const user of usersWithAutoArchive) {
        // Persist repaired values for users with null settings (transitional guardrail)
        let repairedUser = false;
        if (user.autoArchiveHours === null) {
          await db.update(users)
            .set({ autoArchiveHours: 24 })
            .where(eq(users.id, user.id));
          user.autoArchiveHours = 24;
          repairedUser = true;
          logger.info(`[AUTO-ARCHIVE] Repaired null autoArchiveHours for user ${user.id}`, {
            userId: user.id,
            repairedTo: 24
          });
        }

        // STEP 1: Archive completed tasks
        // Use UTC time to avoid timezone issues across multi-timezone deployments
        const now = new Date();
        const archiveThresholdMs = now.getTime() - ((user.autoArchiveHours || 24) * 60 * 60 * 1000);
        const archiveThreshold = new Date(archiveThresholdMs);

        // Find completed tasks that are old enough to archive
        const tasksToArchive = await db.select()
          .from(tasks)
          .where(
            and(
              eq(tasks.userId, user.id),
              eq(tasks.completed, true),
              eq(tasks.archived, false),
              lt(tasks.completedAt, archiveThreshold)
            )
          );

        if (tasksToArchive.length > 0) {
          // Archive the tasks - preserve historical timestamps by using completedAt or createdAt
          // This ensures deletion checks can work immediately for eligible tasks
          const taskIdsToArchive = tasksToArchive.map(t => t.id);
          
          // Update each task with proper archived_at timestamp
          for (const task of tasksToArchive) {
            await db.update(tasks)
              .set({
                archived: true,
                archivedAt: task.completedAt || task.createdAt
              })
              .where(eq(tasks.id, task.id));
          }

          // Fetch the archived tasks for logging
          const archivedTasks = await db.select()
            .from(tasks)
            .where(
              and(
                eq(tasks.userId, user.id),
                eq(tasks.archived, true),
                inArray(tasks.id, taskIdsToArchive)
              )
            )
            .limit(tasksToArchive.length);

          totalArchivedCount += archivedTasks.length;
          
          logger.info(`Auto-archived tasks for user ${user.id}`, {
            userId: user.id,
            archivedCount: archivedTasks.length,
            thresholdUTC: archiveThreshold.toISOString(),
            autoArchiveHours: user.autoArchiveHours || 24,
            sampleTaskIds: archivedTasks.slice(0, 5).map(t => t.id), // First 5 task IDs for audit
            sampleTaskTitles: archivedTasks.slice(0, 3).map(t => t.title) // First 3 titles for context
          });
        }

        // STEP 2: Delete old archived tasks (if retention policy is enabled and >= 7 days)
        if (user.deleteArchivedAfterDays && user.deleteArchivedAfterDays >= 7) {
          const deleteThresholdMs = now.getTime() - (user.deleteArchivedAfterDays * 24 * 60 * 60 * 1000);
          const deleteThreshold = new Date(deleteThresholdMs);

          // Find archived tasks that are old enough to delete (archivedAt must not be null)
          const tasksToDelete = await db.select()
            .from(tasks)
            .where(
              and(
                eq(tasks.userId, user.id),
                eq(tasks.archived, true),
                sql`${tasks.archivedAt} IS NOT NULL`,
                lt(tasks.archivedAt, deleteThreshold)
              )
            );

          if (tasksToDelete.length > 0) {
            const taskIdsToDelete = tasksToDelete.map(t => t.id);
            
            // First, delete any appointments that reference these tasks
            await db.delete(appointments)
              .where(inArray(appointments.taskId, taskIdsToDelete));
            
            // Then hard delete the tasks
            await db.delete(tasks)
              .where(
                and(
                  eq(tasks.userId, user.id),
                  eq(tasks.archived, true),
                  sql`${tasks.archivedAt} IS NOT NULL`,
                  lt(tasks.archivedAt, deleteThreshold)
                )
              );

            totalDeletedCount += tasksToDelete.length;

            logger.info(`Auto-deleted archived tasks for user ${user.id}`, {
              userId: user.id,
              deletedCount: tasksToDelete.length,
              thresholdUTC: deleteThreshold.toISOString(),
              deleteArchivedAfterDays: user.deleteArchivedAfterDays,
              sampleTaskIds: tasksToDelete.slice(0, 5).map(t => t.id), // First 5 task IDs for audit
              sampleTaskTitles: tasksToDelete.slice(0, 3).map(t => t.title), // First 3 titles for context
              oldestArchivedAt: tasksToDelete.length > 0 ? tasksToDelete[0].archivedAt : null
            });
          }
        }
      }

      return { archivedCount: totalArchivedCount, deletedCount: totalDeletedCount };
    } catch (error) {
      logger.error('Failed to auto-archive tasks', { error });
      throw error;
    }
  }

  // User authentication methods
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      logger.error('Failed to get user by username', { error, username });
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Case-insensitive email lookup
      const normalizedEmail = email.toLowerCase().trim();
      const [user] = await db.select().from(users).where(sql`LOWER(${users.email}) = ${normalizedEmail}`);
      return user || undefined;
    } catch (error) {
      logger.error('Failed to get user by email', { error, email });
      return undefined;
    }
  }

  async updateUserEmailVerification(userId: number, verifiedAt: Date): Promise<User | undefined> {
    try {
      const [updatedUser] = await db.update(users)
        .set({ emailVerifiedAt: verifiedAt })
        .where(eq(users.id, userId))
        .returning();
      
      if (updatedUser) {
        logger.info(`Email verified for user ${userId}`);
      }
      return updatedUser;
    } catch (error) {
      logger.error('Failed to update email verification', { error, userId });
      return undefined;
    }
  }

  async updateUserLastLogin(userId: number): Promise<void> {
    try {
      await db.update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, userId));
      logger.info(`Last login updated for user ${userId}`);
    } catch (error) {
      logger.error('Failed to update last login', { error, userId });
    }
  }

  async updateUserProfile(userId: number, profileData: Partial<User>): Promise<User | undefined> {
    try {
      // Build update object with all provided fields
      const updateFields: Partial<User> = {};
      
      // Profile fields
      if (profileData.fullName !== undefined) updateFields.fullName = profileData.fullName;
      if (profileData.companyName !== undefined) updateFields.companyName = profileData.companyName;
      if (profileData.address !== undefined) updateFields.address = profileData.address;
      if (profileData.profilePictureUrl !== undefined) updateFields.profilePictureUrl = profileData.profilePictureUrl;
      
      // Achievement and data collection preferences
      if (profileData.achievementsEnabled !== undefined) updateFields.achievementsEnabled = profileData.achievementsEnabled;
      if (profileData.dataCollectionConsent !== undefined) updateFields.dataCollectionConsent = profileData.dataCollectionConsent;
      
      // Timer and alarm settings
      if (profileData.timerSound !== undefined) updateFields.timerSound = profileData.timerSound;
      if (profileData.timerEnabled !== undefined) updateFields.timerEnabled = profileData.timerEnabled;
      if (profileData.alarmSound !== undefined) updateFields.alarmSound = profileData.alarmSound;
      if (profileData.alarmEnabled !== undefined) updateFields.alarmEnabled = profileData.alarmEnabled;
      
      // Archive settings
      if (profileData.autoArchiveEnabled !== undefined) updateFields.autoArchiveEnabled = profileData.autoArchiveEnabled;
      if (profileData.autoArchiveHours !== undefined) updateFields.autoArchiveHours = profileData.autoArchiveHours;
      if (profileData.deleteArchivedAfterDays !== undefined) updateFields.deleteArchivedAfterDays = profileData.deleteArchivedAfterDays;
      
      // General settings
      if (profileData.timezone !== undefined) updateFields.timezone = profileData.timezone;
      if (profileData.language !== undefined) updateFields.language = profileData.language;
      if (profileData.emailNotifications !== undefined) updateFields.emailNotifications = profileData.emailNotifications;
      if (profileData.marketingEmails !== undefined) updateFields.marketingEmails = profileData.marketingEmails;
      
      // Voice settings
      if (profileData.voiceEnabled !== undefined) updateFields.voiceEnabled = profileData.voiceEnabled;
      if (profileData.domoVoiceEnabled !== undefined) updateFields.domoVoiceEnabled = profileData.domoVoiceEnabled;
      
      // Only update if there are fields to update
      if (Object.keys(updateFields).length === 0) {
        logger.warn("No valid fields to update in user profile", { userId });
        return await this.getUserById(userId);
      }
      
      const [updatedUser] = await db.update(users)
        .set(updateFields)
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    } catch (error) {
      logger.error("Error updating user profile", { error, userId });
      throw error;
    }
  }

  async updateUserNotionSettings(userId: number, settings: { notionApiKey?: string | null; notionDefaultDatabaseId?: string | null }): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(settings)
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserTrelloSettings(userId: number, settings: { trelloApiKey?: string | null; trelloToken?: string | null; trelloDefaultBoardId?: string | null; trelloDefaultListId?: string | null }): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(settings)
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateVoiceBiometric(userId: number, voiceData: { voicePrint: string; voiceFeatures: string }): Promise<void> {
    await db.update(users).set(voiceData).where(eq(users.id, userId));
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      const [newUser] = await db.insert(users).values({
        username: userData.username,
        password: userData.password,
        email: userData.email || null,
        voicePassword: userData.voicePassword || null,
        voiceEnabled: userData.voiceEnabled || false,
        emailVerifiedAt: userData.emailVerifiedAt || null,
      }).returning();
      
      logger.info(`Created new user: ${userData.username}`, { userId: newUser.id });
      return newUser;
    } catch (error) {
      logger.error('Failed to create user', { error, username: userData.username });
      throw error;
    }
  }

  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    try {
      const [newFeedback] = await db.insert(feedback).values(feedbackData).returning();
      logger.info(`Created feedback: ${newFeedback.subject}`, { feedbackId: newFeedback.id });
      return newFeedback;
    } catch (error) {
      logger.error('Failed to create feedback', { error, subject: feedbackData.subject });
      throw error;
    }
  }

  async getAllFeedback(): Promise<Feedback[]> {
    try {
      const allFeedback = await db.select().from(feedback).orderBy(desc(feedback.createdAt));
      logger.debug("Retrieved all feedback", { count: allFeedback.length });
      return allFeedback;
    } catch (error) {
      logger.error('Failed to retrieve feedback', { error });
      throw error;
    }
  }

  async updateFeedbackStatus(id: string, status: string): Promise<Feedback | undefined> {
    try {
      const [updatedFeedback] = await db
        .update(feedback)
        .set({ status })
        .where(eq(feedback.id, id))
        .returning();
      
      if (updatedFeedback) {
        logger.info(`Updated feedback status: ${id}`, { status });
      }
      return updatedFeedback;
    } catch (error) {
      logger.error('Failed to update feedback status', { error, id, status });
      throw error;
    }
  }

  // Direct task sharing methods
  async createDirectTaskShare(shareData: InsertDirectTaskShare): Promise<DirectTaskShare> {
    try {
      const [newShare] = await db.insert(directTaskShares).values(shareData).returning();
      
      logger.info(`Created direct task share: ${newShare.id}`, { 
        taskId: shareData.taskId,
        sharedWith: shareData.sharedWithUsername
      });
      
      return newShare;
    } catch (error) {
      logger.error("Error creating direct task share", { error, shareData });
      throw new Error("Failed to create direct task share");
    }
  }

  async getDirectTaskSharesForUser(userId: number): Promise<DirectTaskShare[]> {
    try {
      return await db.select().from(directTaskShares)
        .where(and(
          eq(directTaskShares.sharedWithUserId, userId),
          eq(directTaskShares.isImported, false)
        ))
        .orderBy(desc(directTaskShares.createdAt));
    } catch (error) {
      logger.error("Error fetching direct task shares", { error, userId });
      return [];
    }
  }

  async acceptDirectTaskShare(shareId: number, userId: number): Promise<boolean> {
    try {
      const [updatedShare] = await db.update(directTaskShares)
        .set({ 
          isAccepted: true,
          acceptedAt: new Date()
        })
        .where(and(
          eq(directTaskShares.id, shareId),
          eq(directTaskShares.sharedWithUserId, userId)
        ))
        .returning();
      
      if (updatedShare) {
        logger.info(`Accepted direct task share: ${shareId}`, { userId });
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error("Error accepting direct task share", { error, shareId, userId });
      return false;
    }
  }

  async importDirectTaskShare(shareId: number, userId: number): Promise<Task> {
    try {
      // Get the share data
      const [share] = await db.select().from(directTaskShares)
        .where(and(
          eq(directTaskShares.id, shareId),
          eq(directTaskShares.sharedWithUserId, userId)
        ));
      
      if (!share) {
        throw new Error("Direct task share not found");
      }
      
      // Create a new task from the shared task data
      const newTask = await this.createTask({
        title: share.taskData.title,
        category: share.taskData.category,
        priority: share.taskData.priority,
        completed: false, // Always start as not completed
        timer: share.taskData.timer,
        youtubeUrl: share.taskData.youtubeUrl,
        displayOrder: 0,
        scheduledDate: share.taskData.scheduledDate,
        userId: userId,
        isRecurring: false, // Don't copy recurring settings
        recurringFrequency: null,
        recurringInterval: null,
        nextDueDate: null,
        endDate: null,
        daysOfWeek: null,
        dayOfMonth: null,
        monthOfYear: null,
        parentTaskId: null,
        archived: false,
        archivedAt: null,
        completedAt: null,
        checklistItems: []
      });
      
      // Mark the share as imported
      await db.update(directTaskShares)
        .set({ isImported: true })
        .where(eq(directTaskShares.id, shareId));
      
      logger.info(`Imported direct task share: ${shareId}`, { 
        newTaskId: newTask.id,
        userId 
      });
      
      return newTask;
    } catch (error) {
      logger.error("Error importing direct task share", { error, shareId, userId });
      throw new Error("Failed to import direct task share");
    }
  }

  async getUserByUsernameOrEmail(identifier: string): Promise<User | undefined> {
    try {
      // Case-insensitive email lookup, case-sensitive username
      const normalizedIdentifier = identifier.toLowerCase().trim();
      const [user] = await db.select().from(users)
        .where(or(
          eq(users.username, identifier),
          sql`LOWER(${users.email}) = ${normalizedIdentifier}`
        ))
        .limit(1);
      
      return user;
    } catch (error) {
      logger.error("Error fetching user by username or email", { error, identifier });
      return undefined;
    }
  }

  // Achievement methods
  async initializeAchievements(): Promise<void> {
    try {
      // Check if achievements are already initialized
      const existingAchievements = await db.select().from(achievements).limit(1);
      if (existingAchievements.length > 0) {
        return;
      }

      // Define default achievements
      const defaultAchievements = [
        // Task completion achievements
        { name: "First Steps", description: "Complete your first task", type: "task_completion", icon: "CheckCircle", condition: { target: 1 }, points: 10, rarity: "common" },
        { name: "Getting Started", description: "Complete 5 tasks", type: "task_completion", icon: "Target", condition: { target: 5 }, points: 25, rarity: "common" },
        { name: "Productive", description: "Complete 10 tasks", type: "task_completion", icon: "Award", condition: { target: 10 }, points: 50, rarity: "common" },
        { name: "Task Master", description: "Complete 25 tasks", type: "task_completion", icon: "Trophy", condition: { target: 25 }, points: 100, rarity: "rare" },
        { name: "Achievement Hunter", description: "Complete 50 tasks", type: "task_completion", icon: "Star", condition: { target: 50 }, points: 200, rarity: "rare" },
        { name: "Legendary", description: "Complete 100 tasks", type: "task_completion", icon: "Crown", condition: { target: 100 }, points: 500, rarity: "legendary" },
        
        // Streak achievements
        { name: "Consistent", description: "Complete tasks for 3 days in a row", type: "streak", icon: "Flame", condition: { target: 3 }, points: 30, rarity: "common" },
        { name: "Dedicated", description: "Complete tasks for 7 days in a row", type: "streak", icon: "FireExtinguisher", condition: { target: 7 }, points: 75, rarity: "rare" },
        { name: "Unstoppable", description: "Complete tasks for 30 days in a row", type: "streak", icon: "Zap", condition: { target: 30 }, points: 300, rarity: "epic" },
        
        // Category achievements
        { name: "Work Warrior", description: "Complete 10 work tasks", type: "category", icon: "Briefcase", condition: { target: 10, category: "Work" }, points: 50, rarity: "common" },
        { name: "Personal Growth", description: "Complete 10 personal tasks", type: "category", icon: "User", condition: { target: 10, category: "Personal" }, points: 50, rarity: "common" },
        { name: "Health Hero", description: "Complete 10 health tasks", type: "category", icon: "Heart", condition: { target: 10, category: "Health" }, points: 50, rarity: "common" },
        { name: "Shopping Spree", description: "Complete 10 shopping tasks", type: "category", icon: "ShoppingCart", condition: { target: 10, category: "Shopping" }, points: 50, rarity: "common" },
        
        // Timer achievements
        { name: "Time Keeper", description: "Complete 5 timed tasks", type: "timer", icon: "Clock", condition: { target: 5 }, points: 40, rarity: "common" },
        { name: "Time Master", description: "Complete 25 timed tasks", type: "timer", icon: "Timer", condition: { target: 25 }, points: 125, rarity: "rare" },
        { name: "Marathon Runner", description: "Complete 60 minutes of timed tasks", type: "timer", icon: "Activity", condition: { target: 60 }, points: 150, rarity: "rare" },
        
        // Voice achievements
        { name: "Voice Commander", description: "Create 10 tasks using voice", type: "voice", icon: "Mic", condition: { target: 10 }, points: 75, rarity: "common" },
        { name: "Voice Master", description: "Create 50 tasks using voice", type: "voice", icon: "MicOff", condition: { target: 50 }, points: 200, rarity: "rare" },
        
        // Sharing achievements
        { name: "Team Player", description: "Share 5 tasks with others", type: "sharing", icon: "Share", condition: { target: 5 }, points: 60, rarity: "common" },
        { name: "Collaboration King", description: "Share 25 tasks with others", type: "sharing", icon: "Users", condition: { target: 25 }, points: 150, rarity: "rare" },
        
        // Milestone achievements
        { name: "Power User", description: "Reach 500 total points", type: "milestone", icon: "Gem", condition: { target: 500 }, points: 100, rarity: "epic" },
        { name: "Elite", description: "Reach 1000 total points", type: "milestone", icon: "Diamond", condition: { target: 1000 }, points: 200, rarity: "legendary" },
      ];

      // Insert default achievements
      await db.insert(achievements).values(defaultAchievements.map(ach => ({
        ...ach,
        type: ach.type as any,
        condition: ach.condition as any,
      })));

      logger.info("Initialized default achievements", { count: defaultAchievements.length });
    } catch (error) {
      logger.error("Failed to initialize achievements", { error });
      throw error;
    }
  }

  async getAllAchievements(): Promise<Achievement[]> {
    try {
      const allAchievements = await db.select().from(achievements)
        .where(eq(achievements.isActive, true))
        .orderBy(asc(achievements.points));
      
      logger.debug("Retrieved all achievements", { count: allAchievements.length });
      return allAchievements;
    } catch (error) {
      logger.error("Failed to retrieve achievements", { error });
      throw error;
    }
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    try {
      const userAchievementList = await db.select().from(userAchievements)
        .where(eq(userAchievements.userId, userId))
        .orderBy(desc(userAchievements.completedAt));
      
      logger.debug("Retrieved user achievements", { userId, count: userAchievementList.length });
      return userAchievementList;
    } catch (error) {
      logger.error("Failed to retrieve user achievements", { error, userId });
      throw error;
    }
  }

  async getUserStats(userId: number): Promise<UserStats> {
    try {
      const [stats] = await db.select().from(userStats)
        .where(eq(userStats.userId, userId))
        .limit(1);
      
      if (!stats) {
        // Create initial stats for new user
        const initialStats: InsertUserStats = {
          userId,
          totalTasks: 0,
          completedTasks: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalPoints: 0,
          workTasks: 0,
          personalTasks: 0,
          shoppingTasks: 0,
          healthTasks: 0,
          otherTasks: 0,
          totalTimerMinutes: 0,
          timerTasksCompleted: 0,
          voiceTasksCreated: 0,
          tasksShared: 0,
          tasksReceived: 0,
        };
        
        const [newStats] = await db.insert(userStats).values(initialStats).returning();
        logger.info("Created initial user stats", { userId });
        return newStats;
      }
      
      return stats;
    } catch (error) {
      logger.error("Failed to retrieve user stats", { error, userId });
      throw error;
    }
  }

  async updateUserStats(userId: number, updates: Partial<UserStats>): Promise<UserStats> {
    try {
      const [updatedStats] = await db.update(userStats)
        .set(updates)
        .where(eq(userStats.userId, userId))
        .returning();
      
      if (!updatedStats) {
        throw new Error("User stats not found");
      }
      
      logger.debug("Updated user stats", { userId, updates: Object.keys(updates) });
      return updatedStats;
    } catch (error) {
      logger.error("Failed to update user stats", { error, userId, updates });
      throw error;
    }
  }

  async checkAndUpdateAchievements(userId: number): Promise<UserAchievement[]> {
    try {
      const stats = await this.getUserStats(userId);
      const allAchievements = await this.getAllAchievements();
      const userAchievementList = await this.getUserAchievements(userId);
      const newAchievements: UserAchievement[] = [];
      
      // Check each achievement
      for (const achievement of allAchievements) {
        const existingUserAchievement = userAchievementList.find(ua => ua.achievementId === achievement.id);
        
        if (!existingUserAchievement || !existingUserAchievement.isCompleted) {
          const progress = this.calculateAchievementProgress(achievement, stats);
          const isCompleted = progress >= achievement.condition.target;
          
          if (existingUserAchievement) {
            // Update existing achievement progress
            const [updatedAchievement] = await db.update(userAchievements)
              .set({ 
                progress, 
                isCompleted,
                completedAt: isCompleted ? new Date() : null
              })
              .where(eq(userAchievements.id, existingUserAchievement.id))
              .returning();
            
            if (isCompleted && !existingUserAchievement.isCompleted) {
              newAchievements.push(updatedAchievement);
              // Award points
              await this.updateUserStats(userId, { 
                totalPoints: stats.totalPoints + achievement.points 
              });
            }
          } else {
            // Create new achievement record
            const newUserAchievement: InsertUserAchievement = {
              userId,
              achievementId: achievement.id,
              progress,
              isCompleted,
              completedAt: isCompleted ? new Date() : undefined,
            };
            
            const [createdAchievement] = await db.insert(userAchievements)
              .values(newUserAchievement)
              .returning();
            
            if (isCompleted) {
              newAchievements.push(createdAchievement);
              // Award points
              await this.updateUserStats(userId, { 
                totalPoints: stats.totalPoints + achievement.points 
              });
            }
          }
        }
      }
      
      logger.debug("Checked and updated achievements", { 
        userId, 
        newAchievements: newAchievements.length 
      });
      
      return newAchievements;
    } catch (error) {
      logger.error("Failed to check and update achievements", { error, userId });
      throw error;
    }
  }

  private calculateAchievementProgress(achievement: Achievement, stats: UserStats): number {
    switch (achievement.type) {
      case "task_completion":
        return stats.completedTasks;
      case "streak":
        return Math.max(stats.currentStreak, stats.longestStreak);
      case "category":
        switch (achievement.condition.category) {
          case "Work": return stats.workTasks;
          case "Personal": return stats.personalTasks;
          case "Shopping": return stats.shoppingTasks;
          case "Health": return stats.healthTasks;
          case "Other": return stats.otherTasks;
          default: return 0;
        }
      case "timer":
        return achievement.condition.target <= 60 ? stats.totalTimerMinutes : stats.timerTasksCompleted;
      case "voice":
        return stats.voiceTasksCreated;
      case "sharing":
        return stats.tasksShared;
      case "milestone":
        return stats.totalPoints;
      default:
        return 0;
    }
  }

  async recordTaskCompletion(userId: number, task: Task): Promise<void> {
    try {
      const stats = await this.getUserStats(userId);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastCompletion = stats.lastCompletionDate ? new Date(stats.lastCompletionDate) : null;
      const lastCompletionDay = lastCompletion ? new Date(lastCompletion.getFullYear(), lastCompletion.getMonth(), lastCompletion.getDate()) : null;
      
      // Calculate streak
      let currentStreak = stats.currentStreak;
      if (!lastCompletionDay) {
        currentStreak = 1;
      } else {
        const daysDiff = Math.floor((today.getTime() - lastCompletionDay.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 0) {
          // Same day, keep current streak
        } else if (daysDiff === 1) {
          // Next day, increment streak
          currentStreak += 1;
        } else {
          // Gap in days, reset streak
          currentStreak = 1;
        }
      }
      
      // Update category-specific stats
      const categoryUpdates: Partial<UserStats> = {};
      switch (task.category) {
        case "Work": categoryUpdates.workTasks = stats.workTasks + 1; break;
        case "Personal": categoryUpdates.personalTasks = stats.personalTasks + 1; break;
        case "Shopping": categoryUpdates.shoppingTasks = stats.shoppingTasks + 1; break;
        case "Health": categoryUpdates.healthTasks = stats.healthTasks + 1; break;
        case "Other": categoryUpdates.otherTasks = stats.otherTasks + 1; break;
      }
      
      // Update timer stats
      const timerUpdates: Partial<UserStats> = {};
      if (task.timer) {
        timerUpdates.totalTimerMinutes = stats.totalTimerMinutes + task.timer;
        timerUpdates.timerTasksCompleted = stats.timerTasksCompleted + 1;
      }
      
      // Update overall stats
      const updates: Partial<UserStats> = {
        ...categoryUpdates,
        ...timerUpdates,
        completedTasks: stats.completedTasks + 1,
        currentStreak,
        longestStreak: Math.max(currentStreak, stats.longestStreak),
        lastCompletionDate: now,
      };
      
      await this.updateUserStats(userId, updates);
      
      // Check for new achievements
      await this.checkAndUpdateAchievements(userId);
      
      logger.info("Recorded task completion", { userId, taskId: task.id });
    } catch (error) {
      logger.error("Failed to record task completion", { error, userId, taskId: task.id });
      throw error;
    }
  }

  // Customer management methods
  async getAllCustomers(): Promise<User[]> {
    try {
      return await db.select().from(users).orderBy(users.createdAt);
    } catch (error) {
      logger.error("Failed to get all customers", { error });
      throw error;
    }
  }

  async getCustomerById(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      logger.error("Failed to get customer by ID", { error, id });
      throw error;
    }
  }

  async updateUserTimerPreferences(userId: number, preferences: { 
    timerSound?: string; 
    timerEnabled?: boolean;
    alarmSound?: string;
    alarmEnabled?: boolean;
  }): Promise<void> {
    try {
      await db.update(users)
        .set({
          timerSound: preferences.timerSound,
          timerEnabled: preferences.timerEnabled,
          alarmSound: preferences.alarmSound,
          alarmEnabled: preferences.alarmEnabled,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    } catch (error) {
      logger.error("Failed to update timer preferences", { error, userId });
      throw error;
    }
  }

  async getUserById(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      logger.error("Failed to get user by ID", { error, id });
      throw error;
    }
  }

  async updateCustomer(id: number, updates: Partial<User>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      
      if (updatedUser) {
        logger.info("Updated customer", { userId: id, updates: Object.keys(updates) });
      }
      return updatedUser || undefined;
    } catch (error) {
      logger.error("Failed to update customer", { error, id, updates });
      throw error;
    }
  }

  async getCustomerAnalytics(userId: number): Promise<CustomerAnalytics[]> {
    try {
      return await db.select().from(customerAnalytics)
        .where(eq(customerAnalytics.userId, userId))
        .orderBy(desc(customerAnalytics.createdAt));
    } catch (error) {
      logger.error("Failed to get customer analytics", { error, userId });
      throw error;
    }
  }

  async recordCustomerEvent(eventData: InsertCustomerAnalytics): Promise<CustomerAnalytics> {
    try {
      const [event] = await db
        .insert(customerAnalytics)
        .values(eventData)
        .returning();
      
      logger.info("Recorded customer event", { 
        userId: eventData.userId, 
        eventType: eventData.eventType 
      });
      
      return event;
    } catch (error) {
      logger.error("Failed to record customer event", { error, eventData });
      throw error;
    }
  }

  async getCustomersByStatus(status: string): Promise<User[]> {
    try {
      return await db.select().from(users)
        .where(eq(users.customerStatus, status))
        .orderBy(users.createdAt);
    } catch (error) {
      logger.error("Failed to get customers by status", { error, status });
      throw error;
    }
  }

  async getCustomersBySubscriptionStatus(subscriptionStatus: string): Promise<User[]> {
    try {
      return await db.select().from(users)
        .where(eq(users.subscriptionStatus, subscriptionStatus))
        .orderBy(users.createdAt);
    } catch (error) {
      logger.error("Failed to get customers by subscription status", { error, subscriptionStatus });
      throw error;
    }
  }

  async searchCustomers(query: string): Promise<User[]> {
    try {
      const searchPattern = `%${query}%`;
      return await db.select().from(users).where(
        or(
          ilike(users.username, searchPattern),
          ilike(users.email, searchPattern),
          ilike(users.firstName, searchPattern),
          ilike(users.lastName, searchPattern),
          ilike(users.company, searchPattern)
        )
      ).orderBy(users.createdAt);
    } catch (error) {
      logger.error("Failed to search customers", { error, query });
      throw error;
    }
  }

  // Password reset methods
  async createPasswordResetToken(userId: number, email: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    try {
      const [resetToken] = await db.insert(passwordResetTokens).values({
        userId,
        email,
        token,
        expiresAt,
        isUsed: false,
      }).returning();
      
      logger.info("Password reset token created", { userId, tokenId: resetToken.id });
      return resetToken;
    } catch (error) {
      logger.error("Error creating password reset token:", error);
      throw new Error("Failed to create password reset token");
    }
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    try {
      const [resetToken] = await db.select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.token, token));
      
      return resetToken;
    } catch (error) {
      logger.error("Error getting password reset token:", error);
      throw new Error("Failed to get password reset token");
    }
  }

  async markPasswordResetTokenAsUsed(tokenId: number): Promise<void> {
    try {
      await db.update(passwordResetTokens)
        .set({ 
          isUsed: true, 
          usedAt: new Date() 
        })
        .where(eq(passwordResetTokens.id, tokenId));
      
      logger.info("Password reset token marked as used", { tokenId });
    } catch (error) {
      logger.error("Error marking password reset token as used:", error);
      throw new Error("Failed to mark token as used");
    }
  }

  async updateUserPassword(userId: number, hashedPassword: string): Promise<User | undefined> {
    try {
      const [updatedUser] = await db.update(users)
        .set({ 
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      
      logger.info("User password updated", { userId });
      return updatedUser;
    } catch (error) {
      logger.error("Error updating user password:", error);
      throw new Error("Failed to update user password");
    }
  }

  async cleanupExpiredPasswordResetTokens(): Promise<void> {
    try {
      const now = new Date();
      await db.delete(passwordResetTokens)
        .where(eq(passwordResetTokens.expiresAt, now));
      
      logger.info("Expired password reset tokens cleaned up");
    } catch (error) {
      logger.error("Error cleaning up expired password reset tokens:", error);
    }
  }

  // App statistics methods
  async getAppStatistic(metricName: string): Promise<AppStatistic | undefined> {
    try {
      const [statistic] = await db.select()
        .from(appStatistics)
        .where(eq(appStatistics.metricName, metricName));
      
      return statistic;
    } catch (error) {
      logger.error("Error getting app statistic:", error);
      return undefined;
    }
  }

  async setAppStatistic(metricName: string, value: number): Promise<AppStatistic> {
    try {
      // Try to update first
      const [updated] = await db.update(appStatistics)
        .set({ 
          currentValue: value,
          lastUpdated: new Date()
        })
        .where(eq(appStatistics.metricName, metricName))
        .returning();

      if (updated) {
        return updated;
      }

      // If no rows were updated, create new record
      const [created] = await db.insert(appStatistics).values({
        metricName,
        currentValue: value,
      }).returning();
      
      logger.info("App statistic set", { metricName, value });
      return created;
    } catch (error) {
      logger.error("Error setting app statistic:", error);
      throw new Error("Failed to set app statistic");
    }
  }

  async incrementAppStatistic(metricName: string, incrementBy: number = 1): Promise<AppStatistic> {
    try {
      // Get current value
      const current = await this.getAppStatistic(metricName);
      const newValue = (current?.currentValue || 0) + incrementBy;
      
      return await this.setAppStatistic(metricName, newValue);
    } catch (error) {
      logger.error("Error incrementing app statistic:", error);
      throw new Error("Failed to increment app statistic");
    }
  }

  // Timer Analytics methods
  async recordTimerSession(analyticsData: InsertTimerAnalytics): Promise<TimerAnalytics> {
    try {
      const [session] = await db.insert(timerAnalytics).values(analyticsData).returning();
      logger.info("Timer session recorded", { 
        userId: analyticsData.userId, 
        timerType: analyticsData.timerType,
        completedEarly: analyticsData.completedEarly 
      });
      return session;
    } catch (error) {
      logger.error("Error recording timer session:", error);
      throw new Error("Failed to record timer session");
    }
  }

  async getUserTimerAnalytics(userId: number, days: number = 30): Promise<TimerAnalytics[]> {
    try {
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - days);
      
      const analytics = await db.select()
        .from(timerAnalytics)
        .where(and(
          eq(timerAnalytics.userId, userId),
          gte(timerAnalytics.startedAt, sinceDate)
        ))
        .orderBy(desc(timerAnalytics.completedAt));
      
      logger.debug("Retrieved timer analytics", { userId, count: analytics.length, days });
      return analytics;
    } catch (error) {
      logger.error("Error getting timer analytics:", error);
      throw new Error("Failed to get timer analytics");
    }
  }

  async getProductivityStats(userId: number): Promise<{
    totalSessions: number;
    earlyCompletions: number;
    averageEarlyPercentage: number;
    productivityTrend: string;
  }> {
    try {
      const analytics = await this.getUserTimerAnalytics(userId, 30);
      
      const totalSessions = analytics.length;
      const earlyCompletions = analytics.filter(session => session.completedEarly).length;
      
      let totalEarlyPercentage = 0;
      let earlySessionCount = 0;
      
      analytics.forEach(session => {
        if (session.completedEarly && session.earlyCompletionPercentage) {
          totalEarlyPercentage += session.earlyCompletionPercentage;
          earlySessionCount++;
        }
      });
      
      const averageEarlyPercentage = earlySessionCount > 0 ? Math.round(totalEarlyPercentage / earlySessionCount) : 0;
      
      // Calculate productivity trend (last 7 days vs previous 7 days)
      const last7Days = analytics.filter(session => {
        const sessionDate = new Date(session.completedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return sessionDate >= weekAgo;
      });
      
      const previous7Days = analytics.filter(session => {
        const sessionDate = new Date(session.completedAt);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return sessionDate >= twoWeeksAgo && sessionDate < weekAgo;
      });
      
      const recentEarlyRate = last7Days.length > 0 ? 
        (last7Days.filter(s => s.completedEarly).length / last7Days.length) * 100 : 0;
      const previousEarlyRate = previous7Days.length > 0 ? 
        (previous7Days.filter(s => s.completedEarly).length / previous7Days.length) * 100 : 0;
      
      let productivityTrend = "stable";
      if (recentEarlyRate > previousEarlyRate + 10) {
        productivityTrend = "improving";
      } else if (recentEarlyRate < previousEarlyRate - 10) {
        productivityTrend = "declining";
      }
      
      logger.debug("Generated productivity stats", { 
        userId, 
        totalSessions, 
        earlyCompletions, 
        averageEarlyPercentage,
        productivityTrend 
      });
      
      return {
        totalSessions,
        earlyCompletions,
        averageEarlyPercentage,
        productivityTrend
      };
    } catch (error) {
      logger.error("Error getting productivity stats:", error);
      throw new Error("Failed to get productivity stats");
    }
  }

  // Template methods
  async getTemplates(): Promise<TaskTemplate[]> {
    return await db.select().from(taskTemplates).orderBy(taskTemplates.usageCount);
  }

  async getTemplate(id: number): Promise<TaskTemplate | undefined> {
    const [template] = await db.select().from(taskTemplates).where(eq(taskTemplates.id, id));
    return template;
  }

  async createTemplate(data: InsertTaskTemplate): Promise<TaskTemplate> {
    const [template] = await db.insert(taskTemplates).values(data).returning();
    return template;
  }

  async incrementTemplateUsage(id: number): Promise<void> {
    await db.update(taskTemplates)
      .set({ usageCount: sql`${taskTemplates.usageCount} + 1` })
      .where(eq(taskTemplates.id, id));
  }

  async getTasksByIds(taskIds: string[], userId: number): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(and(inArray(tasks.id, taskIds), eq(tasks.userId, userId)));
  }

  async deleteUserTemplate(templateId: number, userId: number): Promise<boolean> {
    try {
      const result = await db.delete(taskTemplates)
        .where(and(
          eq(taskTemplates.id, templateId),
          eq(taskTemplates.createdByUserId, userId)
        ));
      return result.rowCount > 0;
    } catch (error) {
      logger.error("Error deleting user template", { error, templateId, userId });
      return false;
    }
  }

  // Template Favorites methods
  async getTemplateFavorites(userId: number): Promise<number[]> {
    try {
      const favorites = await db.select({ templateId: templateFavorites.templateId })
        .from(templateFavorites)
        .where(eq(templateFavorites.userId, userId));
      return favorites.map(f => f.templateId);
    } catch (error) {
      logger.error("Error fetching template favorites", { error, userId });
      return [];
    }
  }

  async addTemplateFavorite(userId: number, templateId: number): Promise<void> {
    try {
      await db.insert(templateFavorites)
        .values({ userId, templateId })
        .onConflictDoNothing();
    } catch (error) {
      logger.error("Error adding template favorite", { error, userId, templateId });
    }
  }

  async removeTemplateFavorite(userId: number, templateId: number): Promise<void> {
    try {
      await db.delete(templateFavorites)
        .where(and(
          eq(templateFavorites.userId, userId),
          eq(templateFavorites.templateId, templateId)
        ));
    } catch (error) {
      logger.error("Error removing template favorite", { error, userId, templateId });
    }
  }

  async isTemplateFavorite(userId: number, templateId: number): Promise<boolean> {
    try {
      const result = await db.select()
        .from(templateFavorites)
        .where(and(
          eq(templateFavorites.userId, userId),
          eq(templateFavorites.templateId, templateId)
        ))
        .limit(1);
      return result.length > 0;
    } catch (error) {
      logger.error("Error checking template favorite", { error, userId, templateId });
      return false;
    }
  }

  // Template Usage History methods
  async recordTemplateUsage(userId: number, templateId: number, templateName: string): Promise<void> {
    try {
      await db.insert(templateUsageHistory)
        .values({ userId, templateId, templateName });
    } catch (error) {
      logger.error("Error recording template usage", { error, userId, templateId });
    }
  }

  async getTemplateUsageHistory(userId: number, limit: number = 20): Promise<{ templateId: number; templateName: string; usedAt: Date }[]> {
    try {
      const history = await db.select({
        templateId: templateUsageHistory.templateId,
        templateName: templateUsageHistory.templateName,
        usedAt: templateUsageHistory.usedAt
      })
        .from(templateUsageHistory)
        .where(eq(templateUsageHistory.userId, userId))
        .orderBy(desc(templateUsageHistory.usedAt))
        .limit(limit);
      return history;
    } catch (error) {
      logger.error("Error fetching template usage history", { error, userId });
      return [];
    }
  }

  // User Memory management methods for AI context
  async getUserMemory(userId: number): Promise<any> {
    try {
      // For now, return a default structure since table may not exist yet
      // This will be updated once the table is created in production
      return {
        preferredName: null,
        personalDetails: {},
        recentConversations: [],
        userPreferences: {},
        productivityInsights: {},
        lastInteraction: new Date(),
        memoryVersion: 1
      };
    } catch (error) {
      logger.error("Error fetching user memory", { error, userId });
      return {
        preferredName: null,
        personalDetails: {},
        recentConversations: [],
        userPreferences: {},
        productivityInsights: {}
      };
    }
  }

  async saveUserMemory(userId: number, memoryData: any): Promise<any> {
    try {
      // For now, just return the data since table may not exist yet
      // This will be updated once the table is created in production
      logger.info("Memory data would be saved", { userId, memoryData });
      return memoryData;
    } catch (error) {
      logger.error("Error saving user memory", { error, userId });
      throw new Error("Failed to save user memory");
    }
  }

  async addConversationToMemory(userId: number, conversation: any): Promise<void> {
    try {
      // For now, just log the conversation since table may not exist yet
      // This will be updated once the table is created in production
      logger.info("Conversation would be added to memory", { userId, conversation });
    } catch (error) {
      logger.error("Error adding conversation to memory", { error, userId });
      throw new Error("Failed to add conversation to memory");
    }
  }

  async updateUserMemoryField(userId: number, field: string, value: any): Promise<void> {
    try {
      // For now, just log the update since table may not exist yet
      // This will be updated once the table is created in production
      logger.info("Memory field would be updated", { userId, field, value });
    } catch (error) {
      logger.error("Error updating user memory field", { error, userId, field });
      throw new Error("Failed to update user memory field");
    }
  }

  // AIDOMO Conversation methods implementation
  async createAidomoConversation(conversationData: InsertAidomoConversation): Promise<AidomoConversation> {
    try {
      const [conversation] = await db.insert(aidomoConversations).values({
        ...conversationData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      
      logger.info("Created AIDOMO conversation", { sessionId: conversation.sessionId, userId: conversation.userId });
      return conversation;
    } catch (error) {
      logger.error("Error creating AIDOMO conversation", { error, conversationData });
      throw new Error("Failed to create AIDOMO conversation");
    }
  }

  async getAidomoConversation(sessionId: string, userId: number): Promise<AidomoConversation | undefined> {
    try {
      const conversation = await db.select().from(aidomoConversations)
        .where(and(eq(aidomoConversations.sessionId, sessionId), eq(aidomoConversations.userId, userId)))
        .limit(1);
      
      return conversation[0];
    } catch (error) {
      logger.error("Error getting AIDOMO conversation", { error, sessionId, userId });
      return undefined;
    }
  }

  async getUserAidomoConversations(userId: number): Promise<AidomoConversation[]> {
    try {
      const conversations = await db.select().from(aidomoConversations)
        .where(eq(aidomoConversations.userId, userId))
        .orderBy(desc(aidomoConversations.lastMessageAt));
      
      return conversations;
    } catch (error) {
      logger.error("Error getting user AIDOMO conversations", { error, userId });
      return [];
    }
  }

  async updateAidomoConversation(sessionId: string, updates: Partial<AidomoConversation>): Promise<AidomoConversation | undefined> {
    try {
      const [conversation] = await db.update(aidomoConversations)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(aidomoConversations.sessionId, sessionId))
        .returning();
      
      return conversation;
    } catch (error) {
      logger.error("Error updating AIDOMO conversation", { error, sessionId, updates });
      return undefined;
    }
  }

  async updateAidomoConversationMessages(sessionId: string, messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string; timestamp: string; tokensUsed?: number }>): Promise<void> {
    try {
      // Calculate total tokens from messages
      const totalTokens = messages.reduce((sum, msg) => sum + (msg.tokensUsed || 0), 0);
      
      // Find the last message timestamp
      const lastMessageTimestamp = messages.length > 0 
        ? new Date(messages[messages.length - 1].timestamp)
        : new Date();
      
      await db.update(aidomoConversations)
        .set({
          messages: messages as any,
          totalMessages: messages.length,
          totalTokensUsed: totalTokens,
          lastMessageAt: lastMessageTimestamp,
          updatedAt: new Date(),
        })
        .where(eq(aidomoConversations.sessionId, sessionId));
      
      logger.info("Updated AIDOMO conversation messages", { sessionId, messageCount: messages.length });
    } catch (error) {
      logger.error("Error updating conversation messages", { error, sessionId });
      throw new Error("Failed to update conversation messages");
    }
  }

  async addMessageToConversation(sessionId: string, message: { role: 'user' | 'assistant' | 'system'; content: string; timestamp: string; tokensUsed?: number }): Promise<void> {
    try {
      const conversation = await db.select().from(aidomoConversations)
        .where(eq(aidomoConversations.sessionId, sessionId))
        .limit(1);
      
      if (conversation[0]) {
        const existingMessages = conversation[0].messages || [];
        const updatedMessages = [...existingMessages, message];
        
        await db.update(aidomoConversations)
          .set({
            messages: updatedMessages,
            totalMessages: updatedMessages.length,
            totalTokensUsed: conversation[0].totalTokensUsed + (message.tokensUsed || 0),
            lastMessageAt: new Date(message.timestamp),
            updatedAt: new Date(),
          })
          .where(eq(aidomoConversations.sessionId, sessionId));
      }
    } catch (error) {
      logger.error("Error adding message to conversation", { error, sessionId, message });
      throw new Error("Failed to add message to conversation");
    }
  }

  async archiveAidomoConversation(sessionId: string, userId: number): Promise<boolean> {
    try {
      const [conversation] = await db.update(aidomoConversations)
        .set({ isArchived: true, archivedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(aidomoConversations.sessionId, sessionId), eq(aidomoConversations.userId, userId)))
        .returning();
      
      return !!conversation;
    } catch (error) {
      logger.error("Error archiving AIDOMO conversation", { error, sessionId, userId });
      return false;
    }
  }

  async deleteAidomoConversation(sessionId: string, userId: number): Promise<boolean> {
    try {
      const result = await db.delete(aidomoConversations)
        .where(and(eq(aidomoConversations.sessionId, sessionId), eq(aidomoConversations.userId, userId)))
        .returning();
      
      logger.info("Deleted AIDOMO conversation", { sessionId, userId });
      return result.length > 0;
    } catch (error) {
      logger.error("Error deleting AIDOMO conversation", { error, sessionId, userId });
      return false;
    }
  }

  // AIDOMO Token management methods implementation
  async getUserAidomoTokens(userId: number): Promise<AidomoTokens> {
    try {
      const tokens = await db.select().from(aidomoTokens)
        .where(eq(aidomoTokens.userId, userId))
        .limit(1);
      
      if (tokens[0]) {
        // Check if we need to reset monthly tokens
        const lastReset = new Date(tokens[0].lastResetAt);
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        
        if (lastReset < oneMonthAgo && tokens[0].resetPeriod === 'monthly') {
          await this.resetMonthlyTokens(userId);
          // Fetch updated tokens
          const updatedTokens = await db.select().from(aidomoTokens)
            .where(eq(aidomoTokens.userId, userId))
            .limit(1);
          return updatedTokens[0];
        }
        
        return tokens[0];
      } else {
        // Create default token record for new user
        return await this.createAidomoTokens({ userId });
      }
    } catch (error) {
      logger.error("Error getting user AIDOMO tokens", { error, userId });
      throw new Error("Failed to get user AIDOMO tokens");
    }
  }

  async createAidomoTokens(tokenData: InsertAidomoTokens): Promise<AidomoTokens> {
    try {
      const [tokens] = await db.insert(aidomoTokens).values({
        ...tokenData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      
      logger.info("Created AIDOMO tokens record", { userId: tokens.userId });
      return tokens;
    } catch (error) {
      logger.error("Error creating AIDOMO tokens", { error, tokenData });
      throw new Error("Failed to create AIDOMO tokens");
    }
  }

  async updateAidomoTokens(userId: number, updates: Partial<AidomoTokens>): Promise<AidomoTokens> {
    try {
      const [tokens] = await db.update(aidomoTokens)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(aidomoTokens.userId, userId))
        .returning();
      
      return tokens;
    } catch (error) {
      logger.error("Error updating AIDOMO tokens", { error, userId, updates });
      throw new Error("Failed to update AIDOMO tokens");
    }
  }

  async deductTokens(userId: number, tokensUsed: number): Promise<boolean> {
    try {
      const userTokens = await this.getUserAidomoTokens(userId);
      const availableTokens = userTokens.monthlyLimit + userTokens.bonusTokens - userTokens.currentUsage;
      
      if (availableTokens >= tokensUsed) {
        await db.update(aidomoTokens)
          .set({
            currentUsage: userTokens.currentUsage + tokensUsed,
            totalUsage: userTokens.totalUsage + tokensUsed,
            lastUsedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(aidomoTokens.userId, userId));
        
        return true;
      }
      
      return false; // Not enough tokens
    } catch (error) {
      logger.error("Error deducting tokens", { error, userId, tokensUsed });
      return false;
    }
  }

  async addBonusTokens(userId: number, bonusTokens: number): Promise<void> {
    try {
      const userTokens = await this.getUserAidomoTokens(userId);
      
      await db.update(aidomoTokens)
        .set({
          bonusTokens: userTokens.bonusTokens + bonusTokens,
          updatedAt: new Date(),
        })
        .where(eq(aidomoTokens.userId, userId));
      
      logger.info("Added bonus tokens", { userId, bonusTokens });
    } catch (error) {
      logger.error("Error adding bonus tokens", { error, userId, bonusTokens });
      throw new Error("Failed to add bonus tokens");
    }
  }

  async resetMonthlyTokens(userId: number): Promise<void> {
    try {
      await db.update(aidomoTokens)
        .set({
          currentUsage: 0,
          lastResetAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(aidomoTokens.userId, userId));
      
      logger.info("Reset monthly tokens", { userId });
    } catch (error) {
      logger.error("Error resetting monthly tokens", { error, userId });
      throw new Error("Failed to reset monthly tokens");
    }
  }

  async checkTokenLimit(userId: number, tokensNeeded: number): Promise<boolean> {
    try {
      const userTokens = await this.getUserAidomoTokens(userId);
      const availableTokens = userTokens.monthlyLimit + userTokens.bonusTokens - userTokens.currentUsage;
      
      return availableTokens >= tokensNeeded;
    } catch (error) {
      logger.error("Error checking token limit", { error, userId, tokensNeeded });
      return false;
    }
  }

  // Login code methods implementation
  async createLoginCode(email: string, code: string, userId?: number): Promise<LoginCode> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      
      const [loginCode] = await db.insert(loginCodes).values({
        email: normalizedEmail,
        code,
        userId,
        expiresAt,
        createdAt: new Date(),
      }).returning();
      
      logger.info("Created login code", { email: normalizedEmail, userId });
      return loginCode;
    } catch (error) {
      logger.error("Error creating login code", { error, email });
      throw new Error("Failed to create login code");
    }
  }

  async verifyLoginCode(email: string, code: string): Promise<LoginCode | undefined> {
    try {
      const now = new Date();
      const trimmedCode = code.trim();
      const trimmedEmail = email.trim().toLowerCase();
      
      // Use case-insensitive email matching to handle legacy data
      const result = await db.select().from(loginCodes)
        .where(and(
          ilike(loginCodes.email, trimmedEmail),
          eq(loginCodes.code, trimmedCode),
          eq(loginCodes.used, false),
          gte(loginCodes.expiresAt, now)
        ))
        .limit(1);
      
      if (result[0]) {
        logger.info("Login code verified", { email: trimmedEmail });
      } else {
        // Debug: Find why it failed
        const anyCode = await db.select().from(loginCodes)
          .where(ilike(loginCodes.email, trimmedEmail))
          .orderBy(sql`created_at DESC`)
          .limit(1);
        
        if (anyCode[0]) {
          logger.warn("Login code verification failed", { 
            email: trimmedEmail,
            inputCode: trimmedCode,
            storedCode: anyCode[0].code,
            codesMatch: anyCode[0].code === trimmedCode,
            used: anyCode[0].used,
            expired: anyCode[0].expiresAt < now
          });
        } else {
          logger.warn("No login codes found for email", { email: trimmedEmail });
        }
      }
      
      return result[0];
    } catch (error) {
      logger.error("Error verifying login code", { error, email });
      return undefined;
    }
  }

  async markLoginCodeAsUsed(id: number): Promise<void> {
    try {
      await db.update(loginCodes)
        .set({ used: true })
        .where(eq(loginCodes.id, id));
      
      logger.info("Marked login code as used", { id });
    } catch (error) {
      logger.error("Error marking login code as used", { error, id });
      throw new Error("Failed to mark login code as used");
    }
  }

  async cleanupExpiredLoginCodes(): Promise<void> {
    try {
      const now = new Date();
      const deleted = await db.delete(loginCodes)
        .where(or(
          lt(loginCodes.expiresAt, now),
          eq(loginCodes.used, true)
        ));
      
      logger.info("Cleaned up expired login codes");
    } catch (error) {
      logger.error("Error cleaning up expired login codes", { error });
    }
  }

  // Calendar conflict resolution methods
  async getEventsByDate(userId: number, date: Date): Promise<Task[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const events = await db.select().from(tasks)
        .where(and(
          eq(tasks.userId, userId),
          gte(tasks.scheduledDate, startOfDay),
          lt(tasks.scheduledDate, endOfDay),
          eq(tasks.archived, false)
        ))
        .orderBy(asc(tasks.scheduledDate));
      
      return events;
    } catch (error) {
      logger.error("Error getting events by date", { error, userId, date });
      throw new Error("Failed to get events by date");
    }
  }

  async detectCalendarConflicts(userId: number, date: Date, eventId?: string, time?: Date): Promise<{
    conflicts: Array<{ task1: Task; task2: Task; type: 'overlap' | 'buffer' | 'dependency' }>;
    graph: Record<string, string[]>;
  }> {
    try {
      const events = await this.getEventsByDate(userId, date);
      const conflicts: Array<{ task1: Task; task2: Task; type: 'overlap' | 'buffer' | 'dependency' }> = [];
      const graph: Record<string, string[]> = {};
      
      // Check for time overlaps and buffer violations
      for (let i = 0; i < events.length; i++) {
        const event1 = events[i];
        if (!event1.scheduledDate) continue;
        
        const start1 = new Date(event1.scheduledDate);
        const end1 = event1.scheduledEnd ? new Date(event1.scheduledEnd) : 
                     new Date(start1.getTime() + (event1.durationMin || 30) * 60000);
        const bufferBefore1 = (event1.bufferBeforeMin || 5) * 60000;
        const bufferAfter1 = (event1.bufferAfterMin || 5) * 60000;
        
        for (let j = i + 1; j < events.length; j++) {
          const event2 = events[j];
          if (!event2.scheduledDate) continue;
          
          const start2 = new Date(event2.scheduledDate);
          const end2 = event2.scheduledEnd ? new Date(event2.scheduledEnd) : 
                       new Date(start2.getTime() + (event2.durationMin || 30) * 60000);
          const bufferBefore2 = (event2.bufferBeforeMin || 5) * 60000;
          
          // Check for time overlap
          if (start2 < end1 && end2 > start1) {
            conflicts.push({ task1: event1, task2: event2, type: 'overlap' });
            if (!graph[event1.id]) graph[event1.id] = [];
            if (!graph[event2.id]) graph[event2.id] = [];
            graph[event1.id].push(event2.id);
            graph[event2.id].push(event1.id);
          }
          // Check for buffer violations
          else if (start2 - bufferBefore2 < end1 + bufferAfter1) {
            conflicts.push({ task1: event1, task2: event2, type: 'buffer' });
            if (!graph[event1.id]) graph[event1.id] = [];
            if (!graph[event2.id]) graph[event2.id] = [];
            graph[event1.id].push(event2.id);
            graph[event2.id].push(event1.id);
          }
          
          // Check for dependency violations
          if (event1.dependencyIds && Array.isArray(event1.dependencyIds)) {
            if (event1.dependencyIds.includes(event2.id) && start1 < end2) {
              conflicts.push({ task1: event1, task2: event2, type: 'dependency' });
              if (!graph[event1.id]) graph[event1.id] = [];
              graph[event1.id].push(event2.id);
            }
          }
        }
      }
      
      return { conflicts, graph };
    } catch (error) {
      logger.error("Error detecting calendar conflicts", { error, userId, date });
      throw new Error("Failed to detect calendar conflicts");
    }
  }

  async suggestRescheduling(userId: number, date: Date, conflictInfo: any): Promise<Array<{
    proposalId: string;
    changes: Array<{ id: string; newStart: Date; newEnd: Date }>;
    cost: number;
    impact: string;
  }>> {
    try {
      const { conflicts, graph } = await this.detectCalendarConflicts(userId, date);
      const proposals = [];
      
      // Simple greedy rescheduling algorithm
      for (const conflict of conflicts) {
        const changes = [];
        let cost = 0;
        
        // Try to move the more flexible event
        const task1Flexible = !conflict.task1.isFixed;
        const task2Flexible = !conflict.task2.isFixed;
        
        if (task1Flexible && !task2Flexible) {
          // Move task1
          const duration = conflict.task1.durationMin || 30;
          const newStart = new Date(conflict.task2.scheduledEnd || conflict.task2.scheduledDate!);
          newStart.setMinutes(newStart.getMinutes() + (conflict.task2.bufferAfterMin || 5));
          const newEnd = new Date(newStart.getTime() + duration * 60000);
          
          changes.push({
            id: conflict.task1.id,
            newStart,
            newEnd
          });
          cost = 10; // Base cost for moving one event
        } else if (task2Flexible && !task1Flexible) {
          // Move task2
          const duration = conflict.task2.durationMin || 30;
          const newStart = new Date(conflict.task1.scheduledEnd || conflict.task1.scheduledDate!);
          newStart.setMinutes(newStart.getMinutes() + (conflict.task1.bufferAfterMin || 5));
          const newEnd = new Date(newStart.getTime() + duration * 60000);
          
          changes.push({
            id: conflict.task2.id,
            newStart,
            newEnd
          });
          cost = 10;
        } else if (task1Flexible && task2Flexible) {
          // Move the lower priority task
          const movingTask = conflict.task1.priority === 'High' ? conflict.task2 : conflict.task1;
          const stationaryTask = movingTask === conflict.task1 ? conflict.task2 : conflict.task1;
          
          const duration = movingTask.durationMin || 30;
          const newStart = new Date(stationaryTask.scheduledEnd || stationaryTask.scheduledDate!);
          newStart.setMinutes(newStart.getMinutes() + (stationaryTask.bufferAfterMin || 5));
          const newEnd = new Date(newStart.getTime() + duration * 60000);
          
          changes.push({
            id: movingTask.id,
            newStart,
            newEnd
          });
          cost = movingTask.priority === 'High' ? 20 : 10;
        }
        
        if (changes.length > 0) {
          proposals.push({
            proposalId: uuidv4(),
            changes,
            cost,
            impact: `Move ${changes.length} event(s) to resolve ${conflict.type} conflict`
          });
        }
      }
      
      // Sort proposals by cost (lower is better)
      proposals.sort((a, b) => a.cost - b.cost);
      
      // Return top 3 proposals
      return proposals.slice(0, 3);
    } catch (error) {
      logger.error("Error suggesting rescheduling", { error, userId, date });
      throw new Error("Failed to suggest rescheduling");
    }
  }

  async applyRescheduling(userId: number, changes: Array<{ id: string; scheduledDate: Date; scheduledEnd?: Date }>): Promise<Task[]> {
    try {
      const updatedTasks = [];
      
      for (const change of changes) {
        const [updated] = await db.update(tasks)
          .set({ 
            scheduledDate: change.scheduledDate,
            scheduledEnd: change.scheduledEnd 
          })
          .where(and(
            eq(tasks.id, change.id),
            eq(tasks.userId, userId)
          ))
          .returning();
        
        if (updated) {
          updatedTasks.push(updated);
        }
      }
      
      logger.info("Applied rescheduling", { userId, changesCount: changes.length });
      return updatedTasks;
    } catch (error) {
      logger.error("Error applying rescheduling", { error, userId });
      throw new Error("Failed to apply rescheduling");
    }
  }

  async bulkUpdateTasks(updates: Array<{ id: string; updates: Partial<Task> }>): Promise<void> {
    try {
      for (const update of updates) {
        await db.update(tasks)
          .set(update.updates)
          .where(eq(tasks.id, update.id));
      }
      
      logger.info("Bulk updated tasks", { count: updates.length });
    } catch (error) {
      logger.error("Error bulk updating tasks", { error });
      throw new Error("Failed to bulk update tasks");
    }
  }

  async snapshotDaySchedule(userId: number, date: Date): Promise<string> {
    try {
      const events = await this.getEventsByDate(userId, date);
      const snapshotId = uuidv4();
      
      // Store snapshot in a temporary location (could be improved with a dedicated snapshot table)
      const snapshot = {
        id: snapshotId,
        userId,
        date,
        events,
        createdAt: new Date()
      };
      
      // For now, return the snapshot ID (in production, this would be stored in a database)
      logger.info("Created schedule snapshot", { snapshotId, userId, date });
      return snapshotId;
    } catch (error) {
      logger.error("Error creating schedule snapshot", { error, userId, date });
      throw new Error("Failed to create schedule snapshot");
    }
  }

  async restoreDaySchedule(userId: number, snapshotId: string): Promise<void> {
    try {
      // In production, this would retrieve and restore from a snapshot table
      logger.info("Restored schedule from snapshot", { snapshotId, userId });
    } catch (error) {
      logger.error("Error restoring schedule", { error, userId, snapshotId });
      throw new Error("Failed to restore schedule");
    }
  }

  // Analytics methods implementation
  async trackPageView(data: any): Promise<void> {
    try {
      const { sessionId, visitorId, userId, path, title, referrer, timeOnPage, scrollDepth, clicks } = data;
      
      // Skip if required fields are missing
      if (!sessionId || !visitorId) {
        logger.warn("Skipping page view tracking - missing required fields", { sessionId: !!sessionId, visitorId: !!visitorId, path });
        return;
      }
      
      await db.insert(pageViews).values({
        sessionId,
        visitorId,
        userId,
        path,
        title,
        referrer,
        timeOnPage,
        scrollDepth,
        clicks: clicks || 0,
      });
      
      // Update session page views count
      if (sessionId) {
        await db
          .update(visitorSessions)
          .set({ 
            pageViews: sql`${visitorSessions.pageViews} + 1`,
            lastActivityAt: new Date(),
            exitPage: path 
          })
          .where(eq(visitorSessions.sessionId, sessionId));
      }
      
      logger.info("Page view tracked", { path, sessionId });
    } catch (error) {
      logger.error("Error tracking page view", { error, data });
    }
  }

  async trackEvent(data: any): Promise<void> {
    try {
      const { userId, eventType, eventData, sessionId, ipAddress, userAgent, platform } = data;
      
      // Only track events for logged-in users in customerAnalytics table
      // Anonymous visitor events are tracked in visitorSessions/siteAnalytics
      if (userId && userId > 0) {
        await db.insert(customerAnalytics).values({
          userId,
          eventType,
          eventData,
          sessionId,
          ipAddress,
          userAgent,
          platform: platform || 'web',
        });
      }
      
      // Update daily analytics based on event type
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const updates: any = {};
      
      switch (eventType) {
        case 'signup_completed':
          updates.signups = sql`${siteAnalytics.signups} + 1`;
          break;
        case 'login':
          updates.logins = sql`${siteAnalytics.logins} + 1`;
          break;
        case 'task_created':
          updates.tasksCreated = sql`${siteAnalytics.tasksCreated} + 1`;
          break;
        case 'task_completed':
          updates.tasksCompleted = sql`${siteAnalytics.tasksCompleted} + 1`;
          break;
        case 'aidomo_query':
          updates.aiInteractions = sql`${siteAnalytics.aiInteractions} + 1`;
          break;
        case 'subscription_completed':
          updates.subscriptions = sql`${siteAnalytics.subscriptions} + 1`;
          if (eventData?.amount) {
            updates.revenue = sql`${siteAnalytics.revenue} + ${eventData.amount}`;
          }
          break;
      }
      
      if (Object.keys(updates).length > 0) {
        await this.updateDailyAnalytics(today, updates);
      }
      
      logger.info("Event tracked", { eventType, userId });
    } catch (error) {
      logger.error("Error tracking event", { error, data });
    }
  }

  async createVisitorSession(data: any): Promise<string> {
    try {
      const sessionId = uuidv4();
      const { visitorId, userId, ipAddress, userAgent, referrer, landingPage, country, city, device, browser, os } = data;
      
      await db.insert(visitorSessions).values({
        sessionId,
        visitorId: visitorId || uuidv4(),
        userId,
        ipAddress,
        userAgent,
        referrer,
        landingPage,
        country,
        city,
        device,
        browser,
        os,
        isLoggedIn: !!userId,
      });
      
      // Update daily unique visitors
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await this.updateDailyAnalytics(today, {
        visitors: sql`${siteAnalytics.visitors} + 1`,
        activeSessions: sql`${siteAnalytics.activeSessions} + 1`,
      });
      
      logger.info("Visitor session created", { sessionId, visitorId });
      return sessionId;
    } catch (error) {
      logger.error("Error creating visitor session", { error, data });
      throw error;
    }
  }

  async updateVisitorSession(sessionId: string, updates: any): Promise<void> {
    try {
      await db
        .update(visitorSessions)
        .set({
          ...updates,
          lastActivityAt: new Date(),
        })
        .where(eq(visitorSessions.sessionId, sessionId));
      
      logger.info("Visitor session updated", { sessionId });
    } catch (error) {
      logger.error("Error updating visitor session", { error, sessionId });
    }
  }

  async getSiteAnalytics(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      return await db
        .select()
        .from(siteAnalytics)
        .where(
          and(
            gte(siteAnalytics.date, startDate),
            lt(siteAnalytics.date, endDate)
          )
        )
        .orderBy(desc(siteAnalytics.date));
    } catch (error) {
      logger.error("Error getting site analytics", { error, startDate, endDate });
      return [];
    }
  }

  async getVisitorSessions(filters?: any): Promise<any[]> {
    try {
      let query = db.select().from(visitorSessions);
      
      if (filters) {
        const conditions = [];
        if (filters.startDate) {
          conditions.push(gte(visitorSessions.createdAt, filters.startDate));
        }
        if (filters.endDate) {
          conditions.push(lt(visitorSessions.createdAt, filters.endDate));
        }
        if (filters.isLoggedIn !== undefined) {
          conditions.push(eq(visitorSessions.isLoggedIn, filters.isLoggedIn));
        }
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
      }
      
      return await query.orderBy(desc(visitorSessions.createdAt));
    } catch (error) {
      logger.error("Error getting visitor sessions", { error, filters });
      return [];
    }
  }

  async getPageViews(sessionId?: string): Promise<any[]> {
    try {
      if (sessionId) {
        return await db
          .select()
          .from(pageViews)
          .where(eq(pageViews.sessionId, sessionId))
          .orderBy(desc(pageViews.createdAt));
      } else {
        return await db
          .select()
          .from(pageViews)
          .orderBy(desc(pageViews.createdAt))
          .limit(100);
      }
    } catch (error) {
      logger.error("Error getting page views", { error, sessionId });
      return [];
    }
  }

  async updateDailyAnalytics(date: Date, updates: any): Promise<void> {
    try {
      // Try to update existing record
      const result = await db
        .update(siteAnalytics)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(siteAnalytics.date, date));
      
      // If no record exists, create one
      if (!result) {
        const newData: any = {
          date,
          visitors: 0,
          pageViews: 0,
          signups: 0,
          logins: 0,
          activeSessions: 0,
          tasksCreated: 0,
          tasksCompleted: 0,
          aiInteractions: 0,
          subscriptions: 0,
          revenue: 0,
        };
        
        // Apply the updates to the new data
        Object.keys(updates).forEach(key => {
          if (typeof updates[key] === 'number') {
            newData[key] = updates[key];
          }
        });
        
        await db.insert(siteAnalytics).values(newData);
      }
      
      logger.info("Daily analytics updated", { date });
    } catch (error) {
      logger.error("Error updating daily analytics", { error, date });
    }
  }

  async getAnalyticsDashboard(): Promise<{
    today: any;
    yesterday: any;
    last7Days: any;
    last30Days: any;
    topPages: any[];
    activeUsers: number;
    totalUsers: number;
  }> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const last7Days = new Date(today);
      last7Days.setDate(last7Days.getDate() - 7);
      const last30Days = new Date(today);
      last30Days.setDate(last30Days.getDate() - 30);
      
      // Get today's analytics
      const [todayData] = await db
        .select()
        .from(siteAnalytics)
        .where(eq(siteAnalytics.date, today));
      
      // Get yesterday's analytics
      const [yesterdayData] = await db
        .select()
        .from(siteAnalytics)
        .where(eq(siteAnalytics.date, yesterday));
      
      // Get last 7 days aggregate
      const last7DaysData = await db
        .select({
          visitors: sql`SUM(${siteAnalytics.visitors})`,
          pageViews: sql`SUM(${siteAnalytics.pageViews})`,
          signups: sql`SUM(${siteAnalytics.signups})`,
          logins: sql`SUM(${siteAnalytics.logins})`,
          tasksCreated: sql`SUM(${siteAnalytics.tasksCreated})`,
          tasksCompleted: sql`SUM(${siteAnalytics.tasksCompleted})`,
          aiInteractions: sql`SUM(${siteAnalytics.aiInteractions})`,
          subscriptions: sql`SUM(${siteAnalytics.subscriptions})`,
          revenue: sql`SUM(${siteAnalytics.revenue})`,
        })
        .from(siteAnalytics)
        .where(
          and(
            gte(siteAnalytics.date, last7Days),
            lt(siteAnalytics.date, today)
          )
        );
      
      // Get last 30 days aggregate
      const last30DaysData = await db
        .select({
          visitors: sql`SUM(${siteAnalytics.visitors})`,
          pageViews: sql`SUM(${siteAnalytics.pageViews})`,
          signups: sql`SUM(${siteAnalytics.signups})`,
          logins: sql`SUM(${siteAnalytics.logins})`,
          tasksCreated: sql`SUM(${siteAnalytics.tasksCreated})`,
          tasksCompleted: sql`SUM(${siteAnalytics.tasksCompleted})`,
          aiInteractions: sql`SUM(${siteAnalytics.aiInteractions})`,
          subscriptions: sql`SUM(${siteAnalytics.subscriptions})`,
          revenue: sql`SUM(${siteAnalytics.revenue})`,
        })
        .from(siteAnalytics)
        .where(
          and(
            gte(siteAnalytics.date, last30Days),
            lt(siteAnalytics.date, today)
          )
        );
      
      // Get top pages
      const topPages = await db
        .select({
          path: pageViews.path,
          views: sql`COUNT(*)`,
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, last7Days))
        .groupBy(pageViews.path)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);
      
      // Get active users (logged in within last 30 minutes)
      const thirtyMinutesAgo = new Date();
      thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
      
      const [activeUsersResult] = await db
        .select({
          count: sql`COUNT(DISTINCT ${visitorSessions.userId})`,
        })
        .from(visitorSessions)
        .where(
          and(
            gte(visitorSessions.lastActivityAt, thirtyMinutesAgo),
            eq(visitorSessions.isLoggedIn, true)
          )
        );
      
      // Get total users
      const [totalUsersResult] = await db
        .select({
          count: sql`COUNT(*)`,
        })
        .from(users);
      
      return {
        today: todayData || this.createEmptyAnalytics(),
        yesterday: yesterdayData || this.createEmptyAnalytics(),
        last7Days: last7DaysData[0] || this.createEmptyAnalytics(),
        last30Days: last30DaysData[0] || this.createEmptyAnalytics(),
        topPages,
        activeUsers: Number(activeUsersResult?.count || 0),
        totalUsers: Number(totalUsersResult?.count || 0),
      };
    } catch (error) {
      logger.error("Error getting analytics dashboard", { error });
      return {
        today: this.createEmptyAnalytics(),
        yesterday: this.createEmptyAnalytics(),
        last7Days: this.createEmptyAnalytics(),
        last30Days: this.createEmptyAnalytics(),
        topPages: [],
        activeUsers: 0,
        totalUsers: 0,
      };
    }
  }

  private createEmptyAnalytics() {
    return {
      visitors: 0,
      pageViews: 0,
      signups: 0,
      logins: 0,
      activeSessions: 0,
      tasksCreated: 0,
      tasksCompleted: 0,
      aiInteractions: 0,
      subscriptions: 0,
      revenue: 0,
    };
  }

  async getSchedulingSettings(userId: number): Promise<SchedulingSettings | undefined> {
    try {
      const [settings] = await db.select().from(schedulingSettings).where(eq(schedulingSettings.userId, userId));
      return settings || undefined;
    } catch (error) {
      logger.error("Failed to get scheduling settings", { error, userId });
      throw error;
    }
  }

  async getSchedulingSettingsBySlug(slug: string): Promise<SchedulingSettings | undefined> {
    try {
      const [settings] = await db.select().from(schedulingSettings).where(eq(schedulingSettings.slug, slug));
      return settings || undefined;
    } catch (error) {
      logger.error("Failed to get scheduling settings by slug", { error, slug });
      throw error;
    }
  }

  async createSchedulingSettings(data: InsertSchedulingSettings): Promise<SchedulingSettings> {
    try {
      const [settings] = await db.insert(schedulingSettings).values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      
      logger.info(`Created scheduling settings for user ${data.userId}`);
      return settings;
    } catch (error) {
      logger.error("Failed to create scheduling settings", { error, data });
      throw error;
    }
  }

  async updateSchedulingSettings(userId: number, updates: Partial<SchedulingSettings>): Promise<SchedulingSettings | undefined> {
    try {
      const [updated] = await db
        .update(schedulingSettings)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schedulingSettings.userId, userId))
        .returning();
      
      logger.info(`Updated scheduling settings for user ${userId}`);
      return updated || undefined;
    } catch (error) {
      logger.error("Failed to update scheduling settings", { error, userId, updates });
      throw error;
    }
  }

  async createAppointment(data: InsertAppointment): Promise<Appointment> {
    try {
      const [appointment] = await db.insert(appointments).values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      
      logger.info(`Created appointment ${appointment.id} for user ${data.userId}`);
      return appointment;
    } catch (error) {
      logger.error("Failed to create appointment", { error, data });
      throw error;
    }
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    try {
      const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
      return appointment || undefined;
    } catch (error) {
      logger.error("Failed to get appointment", { error, id });
      throw error;
    }
  }

  async getUserAppointments(userId: number): Promise<Appointment[]> {
    try {
      return await db.select().from(appointments).where(eq(appointments.userId, userId)).orderBy(desc(appointments.startTime));
    } catch (error) {
      logger.error("Failed to get user appointments", { error, userId });
      throw error;
    }
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment | undefined> {
    try {
      const [updated] = await db
        .update(appointments)
        .set({ status, updatedAt: new Date() })
        .where(eq(appointments.id, id))
        .returning();
      
      logger.info(`Updated appointment ${id} status to ${status}`);
      return updated || undefined;
    } catch (error) {
      logger.error("Failed to update appointment status", { error, id, status });
      throw error;
    }
  }

  async getAppointmentByCancellationToken(token: string): Promise<Appointment | undefined> {
    try {
      const [appointment] = await db.select().from(appointments).where(eq(appointments.cancellationToken, token));
      return appointment || undefined;
    } catch (error) {
      logger.error("Failed to get appointment by cancellation token", { error, token });
      throw error;
    }
  }

  async getAppointmentsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Appointment[]> {
    try {
      return await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.userId, userId),
            gte(appointments.startTime, startDate),
            lt(appointments.startTime, endDate)
          )
        )
        .orderBy(asc(appointments.startTime));
    } catch (error) {
      logger.error("Failed to get appointments by date range", { error, userId, startDate, endDate });
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simple query to test database connectivity and warm up connection pool
      await db.execute(sql`SELECT 1`);
      return true;
    } catch (error) {
      logger.error("Database health check failed", { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  // ---- CONTACTS ----

  async addContact(input: { ownerUserId: number; contactUserId?: number | null; displayName: string; title?: string | null; department?: string | null; email: string; aliasesCsv?: string | null }): Promise<Contact> {
    try {
      let contactUserId = input.contactUserId ?? null;

      if (!contactUserId && input.email) {
        const [u] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);
        if (u?.id) contactUserId = u.id;
      }

      const [row] = await db
        .insert(contacts)
        .values({
          ownerUserId: input.ownerUserId,
          displayName: input.displayName,
          email: input.email,
          title: input.title ?? null,
          department: input.department ?? null,
          contactUserId,
          aliasesCsv: input.aliasesCsv ?? "",
        })
        .returning();

      logger.info(`Added contact ${row.displayName} for user ${input.ownerUserId}`);
      return row;
    } catch (error) {
      logger.error("Failed to add contact", { error, input });
      throw error;
    }
  }

  async findContacts(ownerUserId: number, query: string, limit = 10): Promise<Contact[]> {
    try {
      const q = query.trim();
      if (!q) return [];

      const like = `%${q}%`;

      const rows = await db
        .select()
        .from(contacts)
        .where(
          and(
            eq(contacts.ownerUserId, ownerUserId),
            or(
              ilike(contacts.displayName, like),
              ilike(contacts.email, like),
              ilike(contacts.title, like),
              ilike(contacts.department, like),
              ilike(contacts.aliasesCsv, like)
            )
          )
        )
        .orderBy(desc(contacts.updatedAt))
        .limit(limit);

      return rows;
    } catch (error) {
      logger.error("Failed to find contacts", { error, ownerUserId, query });
      throw error;
    }
  }

  async getContactById(ownerUserId: number, contactId: number): Promise<Contact | null> {
    try {
      const [row] = await db
        .select()
        .from(contacts)
        .where(and(eq(contacts.ownerUserId, ownerUserId), eq(contacts.id, contactId)))
        .limit(1);
      return row ?? null;
    } catch (error) {
      logger.error("Failed to get contact by id", { error, ownerUserId, contactId });
      throw error;
    }
  }

  // ---- MESSAGES ----

  async sendMessage(input: { fromUserId: number; toUserId: number; subject?: string | null; body: string; threadId?: number | null }): Promise<{ message: Message; thread: MessageThread }> {
    try {
      const thread = await this.findOrCreateThread(input.fromUserId, input.toUserId);
      
      const [row] = await db.insert(messages).values({
        fromUserId: input.fromUserId,
        toUserId: input.toUserId,
        subject: input.subject ?? null,
        body: input.body,
        threadId: thread.id,
      }).returning();

      // Update thread's updatedAt so it bubbles to the top
      await db
        .update(messageThreads)
        .set({ updatedAt: new Date() })
        .where(eq(messageThreads.id, thread.id));

      logger.info(`Message sent from user ${input.fromUserId} to user ${input.toUserId} in thread ${thread.id}`);
      return { message: row, thread };
    } catch (error) {
      logger.error("Failed to send message", { error, input });
      throw error;
    }
  }

  async listInbox(userId: number, limit = 25, unreadOnly = false): Promise<(Message & { fromDisplayName?: string; fromUsername?: string })[]> {
    try {
      const whereClause = unreadOnly
        ? and(eq(messages.toUserId, userId), sql`${messages.readAt} is null`)
        : eq(messages.toUserId, userId);

      const rows = await db
        .select({
          id: messages.id,
          fromUserId: messages.fromUserId,
          toUserId: messages.toUserId,
          threadId: messages.threadId,
          subject: messages.subject,
          body: messages.body,
          createdAt: messages.createdAt,
          readAt: messages.readAt,
          fromDisplayName: users.fullName,
          fromUsername: users.username,
        })
        .from(messages)
        .leftJoin(users, eq(messages.fromUserId, users.id))
        .where(whereClause)
        .orderBy(desc(messages.createdAt))
        .limit(limit);

      return rows;
    } catch (error) {
      logger.error("Failed to list inbox", { error, userId });
      throw error;
    }
  }

  async readMessage(userId: number, messageId: number): Promise<Message | null> {
    try {
      const [row] = await db
        .select()
        .from(messages)
        .where(and(eq(messages.toUserId, userId), eq(messages.id, messageId)))
        .limit(1);

      return row ?? null;
    } catch (error) {
      logger.error("Failed to read message", { error, userId, messageId });
      throw error;
    }
  }

  async markMessageRead(userId: number, messageId: number): Promise<Message | null> {
    try {
      const [row] = await db
        .update(messages)
        .set({ readAt: new Date() })
        .where(and(eq(messages.toUserId, userId), eq(messages.id, messageId)))
        .returning();

      return row ?? null;
    } catch (error) {
      logger.error("Failed to mark message as read", { error, userId, messageId });
      throw error;
    }
  }

  async findOrCreateThread(userAId: number, userBId: number, title?: string): Promise<MessageThread> {
    const [minId, maxId] = userAId < userBId ? [userAId, userBId] : [userBId, userAId];
    
    // First check for existing thread
    const [existing] = await db
      .select()
      .from(messageThreads)
      .where(
        and(
          eq(messageThreads.participantAUserId, minId),
          eq(messageThreads.participantBUserId, maxId)
        )
      )
      .limit(1);

    if (existing) {
      return existing;
    }

    // Try to create - handle race condition with unique constraint
    try {
      const [thread] = await db
        .insert(messageThreads)
        .values({
          createdByUserId: userAId,
          participantAUserId: minId,
          participantBUserId: maxId,
          title: title ?? null,
        })
        .returning();

      logger.info(`Created new message thread between users ${minId} and ${maxId}`);
      return thread;
    } catch (error: any) {
      // Handle unique constraint violation (race condition)
      if (error?.code === '23505' || error?.message?.includes('unique constraint')) {
        logger.info(`Thread creation race condition - re-selecting existing thread for ${minId} ↔ ${maxId}`);
        const [raceThread] = await db
          .select()
          .from(messageThreads)
          .where(
            and(
              eq(messageThreads.participantAUserId, minId),
              eq(messageThreads.participantBUserId, maxId)
            )
          )
          .limit(1);
        
        if (raceThread) return raceThread;
      }
      logger.error("Failed to find or create thread", { error, userAId, userBId });
      throw error;
    }
  }

  async getThread(threadId: number, userId: number): Promise<{ thread: MessageThread; messages: Message[] } | null> {
    try {
      const [thread] = await db
        .select()
        .from(messageThreads)
        .where(
          and(
            eq(messageThreads.id, threadId),
            or(
              eq(messageThreads.participantAUserId, userId),
              eq(messageThreads.participantBUserId, userId)
            )
          )
        )
        .limit(1);

      if (!thread) return null;

      const threadMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.threadId, threadId))
        .orderBy(asc(messages.createdAt));

      return { thread, messages: threadMessages };
    } catch (error) {
      logger.error("Failed to get thread", { error, threadId, userId });
      throw error;
    }
  }

  async markThreadRead(threadId: number, userId: number): Promise<number> {
    try {
      const result = await db
        .update(messages)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(messages.threadId, threadId),
            eq(messages.toUserId, userId),
            sql`${messages.readAt} is null`
          )
        )
        .returning();

      logger.info(`Marked ${result.length} messages as read in thread ${threadId}`);
      return result.length;
    } catch (error) {
      logger.error("Failed to mark thread as read", { error, threadId, userId });
      throw error;
    }
  }

  async listNotifications(params: { userId: number; limit?: number; unreadOnly?: boolean }): Promise<{
    id: number;
    threadId: number | null;
    title: string;
    snippet: string;
    createdAt: Date;
    readAt: Date | null;
    from: { userId: number; name: string; email: string | null };
    deepLink: string;
  }[]> {
    try {
      const limit = params.limit ?? 20;
      const unreadOnly = params.unreadOnly ?? true;

      const whereClause = unreadOnly
        ? and(eq(messages.toUserId, params.userId), sql`${messages.readAt} IS NULL`)
        : eq(messages.toUserId, params.userId);

      const rows = await db
        .select({
          messageId: messages.id,
          threadId: messages.threadId,
          subject: messages.subject,
          body: messages.body,
          createdAt: messages.createdAt,
          readAt: messages.readAt,
          fromUserId: messages.fromUserId,
          senderFullName: users.fullName,
          senderUsername: users.username,
          senderEmail: users.email,
        })
        .from(messages)
        .innerJoin(users, eq(users.id, messages.fromUserId))
        .where(whereClause)
        .orderBy(desc(messages.createdAt))
        .limit(limit);

      return rows.map((r) => {
        const senderName =
          (r.senderFullName && r.senderFullName.trim()) ||
          (r.senderUsername && r.senderUsername.trim()) ||
          (r.senderEmail ?? "User");

        return {
          id: r.messageId,
          threadId: r.threadId ?? null,
          title: r.subject ?? `Message from ${senderName}`,
          snippet: (r.body ?? "").slice(0, 140),
          createdAt: r.createdAt,
          readAt: r.readAt,
          from: {
            userId: r.fromUserId,
            name: senderName,
            email: r.senderEmail ?? null,
          },
          deepLink: r.threadId
            ? `/aidomo/inbox/thread/${r.threadId}`
            : `/aidomo/inbox/${r.messageId}`,
        };
      });
    } catch (error) {
      logger.error("Failed to list notifications", { error, params });
      throw error;
    }
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    try {
      const [row] = await db
        .select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(and(eq(messages.toUserId, userId), sql`${messages.readAt} IS NULL`));

      return Number(row?.count ?? 0);
    } catch (error) {
      logger.error("Failed to get unread notification count", { error, userId });
      throw error;
    }
  }

  async listThreadNotifications(params: {
    userId: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<{
    threadId: number;
    latestMessageId: number;
    unreadCount: number;
    title: string;
    snippet: string;
    createdAt: Date;
    from: { userId: number; name: string; email: string | null };
    deepLink: string;
  }[]> {
    try {
      const limit = params.limit ?? 20;
      const unreadOnly = params.unreadOnly ?? true;

      const whereUnreadFilter = unreadOnly
        ? sql`AND COALESCE(unread_counts.unread_count, 0) > 0`
        : sql``;

      const rows = await db.execute(sql`
        WITH unread_counts AS (
          SELECT thread_id, count(*)::int AS unread_count
          FROM messages
          WHERE to_user_id = ${params.userId}
            AND read_at IS NULL
            AND thread_id IS NOT NULL
          GROUP BY thread_id
        )
        SELECT DISTINCT ON (m.thread_id)
          m.thread_id                         AS "threadId",
          m.id                                AS "messageId",
          m.subject                           AS "subject",
          m.body                              AS "body",
          m.created_at                        AS "createdAt",
          m.read_at                           AS "readAt",
          m.from_user_id                      AS "fromUserId",
          u.full_name                         AS "senderFullName",
          u.username                          AS "senderUsername",
          u.email                             AS "senderEmail",
          COALESCE(unread_counts.unread_count, 0) AS "unreadCount"
        FROM messages m
        INNER JOIN users u ON u.id = m.from_user_id
        LEFT JOIN unread_counts ON unread_counts.thread_id = m.thread_id
        WHERE m.to_user_id = ${params.userId}
          AND m.thread_id IS NOT NULL
          ${whereUnreadFilter}
        ORDER BY m.thread_id, m.created_at DESC
        LIMIT ${limit};
      `);

      const data = (rows as any).rows ?? rows;

      return (data as any[]).map((r) => {
        const senderName =
          (r.senderFullName && String(r.senderFullName).trim()) ||
          (r.senderUsername && String(r.senderUsername).trim()) ||
          (r.senderEmail ?? "User");

        return {
          threadId: Number(r.threadId),
          latestMessageId: Number(r.messageId),
          unreadCount: Number(r.unreadCount ?? 0),
          title: r.subject ?? `Message from ${senderName}`,
          snippet: (r.body ?? "").slice(0, 140),
          createdAt: r.createdAt,
          from: {
            userId: Number(r.fromUserId),
            name: senderName,
            email: r.senderEmail ?? null,
          },
          deepLink: `/aidomo/inbox/thread/${Number(r.threadId)}`,
        };
      });
    } catch (error) {
      logger.error("Failed to list thread notifications", { error, params });
      throw error;
    }
  }

  async getUnreadThreadNotificationCount(userId: number): Promise<number> {
    try {
      const res = await db.execute(sql`
        SELECT COUNT(*)::int AS "count"
        FROM (
          SELECT m.thread_id
          FROM messages m
          WHERE m.to_user_id = ${userId}
            AND m.read_at IS NULL
            AND m.thread_id IS NOT NULL
          GROUP BY m.thread_id
        ) t;
      `);

      const row = ((res as any).rows?.[0]) ?? (res as any)[0];
      return Number(row?.count ?? 0);
    } catch (error) {
      logger.error("Failed to get unread thread notification count", { error, userId });
      throw error;
    }
  }
}

// Export a singleton instance
export const storage = new DatabaseStorage();
