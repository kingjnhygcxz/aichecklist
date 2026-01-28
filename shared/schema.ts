// "No weapon formed against you shall prosper, and every tongue which rises against you in judgment You shall condemn. This is the heritage of the servants of the Lord, and their righteousness is from Me," Says the Lord. - Isaiah 54:17

import { pgTable, text, serial, integer, boolean, timestamp, json, jsonb, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define recurring frequency types
export const RecurringFrequency = z.enum(["daily", "weekly", "biweekly", "monthly", "yearly", "custom"]);
export type RecurringFrequency = z.infer<typeof RecurringFrequency>;

// Task categories
export const TaskCategory = z.enum(["Work", "Personal", "Shopping", "Health", "Business", "Other"]);
export type TaskCategory = z.infer<typeof TaskCategory>;

// Task priorities
export const TaskPriority = z.enum(["Low", "Medium", "High"]);
export type TaskPriority = z.infer<typeof TaskPriority>;

// Tasks table
export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // Allow any string for custom categories
  priority: text("priority").$type<TaskPriority>().notNull(),
  completed: boolean("completed").notNull().default(false),
  timer: integer("timer"), // Optional timer in minutes
  youtubeUrl: text("youtube_url"), // Optional YouTube video URL
  notes: text("notes"), // Optional notes for the task
  displayOrder: integer("display_order").notNull().default(0), // Order for drag and drop
  scheduledDate: timestamp("scheduled_date"), // Calendar scheduling date
  scheduledEnd: timestamp("scheduled_end"), // End time for the event
  durationMin: integer("duration_min"), // Duration in minutes (alternative to scheduledEnd)
  bufferBeforeMin: integer("buffer_before_min").default(5), // Buffer time before event
  bufferAfterMin: integer("buffer_after_min").default(5), // Buffer time after event
  isFixed: boolean("is_fixed").notNull().default(false), // Non-movable events
  flexibility: json("flexibility").$type<{ earliestStart?: string; latestEnd?: string; maxMoveMin?: number }>(), // Scheduling constraints
  dependencyIds: json("dependency_ids").$type<string[]>(), // Task dependencies for ordering
  startDate: timestamp("start_date"), // Optional project start date for Gantt chart
  projectEndDate: timestamp("project_end_date"), // Optional project end date for Gantt chart
  userId: integer("user_id").references(() => users.id), // User-specific tasks
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"), // When task was completed
  // Recurring task fields
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurringFrequency: text("recurring_frequency").$type<RecurringFrequency>(),
  recurringInterval: integer("recurring_interval"), // For custom frequency (e.g., every 2 weeks)
  nextDueDate: timestamp("next_due_date"),
  endDate: timestamp("end_date"), // Optional end date for recurring tasks
  daysOfWeek: json("days_of_week").$type<number[]>(), // For weekly tasks (0=Sunday, 1=Monday, etc.)
  dayOfMonth: integer("day_of_month"), // For monthly tasks
  monthOfYear: integer("month_of_year"), // For yearly tasks
  parentTaskId: text("parent_task_id"), // Reference to parent recurring task (self-reference)
  // Archive fields
  archived: boolean("archived").notNull().default(false),
  archivedAt: timestamp("archived_at"),
  // Checklist items for sub-tasks within tasks
  checklistItems: json("checklist_items").$type<Array<{ id: string; text: string; completed: boolean }>>().default([]),
  // Notion Integration
  notionPageId: text("notion_page_id"), // Link to Notion page if synced
  syncedToNotion: boolean("synced_to_notion").default(false),
  notionSyncedAt: timestamp("notion_synced_at"),
  // Trello Integration
  trelloCardId: text("trello_card_id"), // Link to Trello card if synced
  syncedToTrello: boolean("synced_to_trello").default(false),
  trelloSyncedAt: timestamp("trello_synced_at"),
});

// Task insert schema
export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true
} as const);

// Shared tasks table
export const sharedTasks = pgTable("shared_tasks", {
  shareId: text("share_id").primaryKey(),
  taskId: text("task_id").notNull().references(() => tasks.id),
  taskData: json("task_data").$type<Task>().notNull(), // Store the entire task data
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Shared task insert schema
export const insertSharedTaskSchema = createInsertSchema(sharedTasks).omit({
  createdAt: true
} as const);

// Direct task shares table - for sharing tasks directly with AIChecklist users
export const directTaskShares = pgTable("direct_task_shares", {
  id: serial("id").primaryKey(),
  taskId: text("task_id").notNull().references(() => tasks.id),
  taskData: json("task_data").$type<Task>().notNull(), // Store the entire task data
  sharedByUserId: integer("shared_by_user_id").notNull().references(() => users.id),
  sharedWithUserId: integer("shared_with_user_id").notNull().references(() => users.id),
  sharedWithUsername: text("shared_with_username").notNull(), // Store username for reference
  message: text("message"), // Optional message from the sender
  isAccepted: boolean("is_accepted").default(false),
  isImported: boolean("is_imported").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at"),
});

// Direct task share insert schema
const directTaskShareBase = createInsertSchema(directTaskShares);
export const insertDirectTaskShareSchema = directTaskShareBase
  .omit({ id: true, createdAt: true, acceptedAt: true } as const)
  .extend({ isAccepted: z.literal(false).optional(), isImported: z.literal(false).optional() });

// Users table (comprehensive customer management)
// System Migrations Table (for tracking one-time data backfills)
export const systemMigrations = pgTable("system_migrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  runAt: timestamp("run_at").notNull(),
  checksum: text("checksum"), // For validation
  status: text("status").notNull(), // 'success', 'failed', 'running'
  metadata: jsonb("metadata"), // Counts, duration, etc.
  errorMessage: text("error_message"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  
  // Personal Information
  firstName: text("first_name"),
  lastName: text("last_name"),
  fullName: text("full_name"), // Combined first and last name
  email: text("email").unique(),
  phone: text("phone"),
  profilePictureUrl: text("profile_picture_url"),
  
  // Enhanced Voice Authentication
  voicePassword: text("voice_password"), // Store the voice passphrase
  voiceEnabled: boolean("voice_enabled").default(false),
  voiceTrainingData: text("voice_training_data"), // JSON string of voice patterns
  voicePrint: text("voice_print"), // Store voice biometric fingerprint
  voiceFeatures: text("voice_features"), // Store audio characteristics for matching
  
  // Multi-Factor Authentication
  mfaEnabled: boolean("mfa_enabled").default(false),
  voicePin: text("voice_pin"), // Optional PIN for voice authentication
  challengeQuestions: text("challenge_questions"), // JSON array of challenge/response pairs
  backupCodes: text("backup_codes"), // JSON array of backup authentication codes
  
  // Adaptive Voice Learning
  voiceSamples: text("voice_samples"), // JSON array of voice learning samples
  voiceConfidenceScore: integer("voice_confidence_score").default(0), // 0-100 confidence rating
  voiceAdaptationLevel: integer("voice_adaptation_level").default(1), // Level of voice learning
  lastVoiceTraining: timestamp("last_voice_training"),
  
  // Voice Health Monitoring
  voiceHealthBaseline: text("voice_health_baseline"), // JSON of baseline voice characteristics
  voiceHealthHistory: text("voice_health_history"), // JSON array of voice health records
  voiceEnvironmentProfiles: text("voice_environment_profiles"), // JSON of different environment settings
  voiceQualityThreshold: integer("voice_quality_threshold").default(75), // Minimum quality score
  adaptiveThresholdEnabled: boolean("adaptive_threshold_enabled").default(true),
  
  // Timer Preferences
  timerSound: text("timer_sound").default("Gentle Bell"),
  timerEnabled: boolean("timer_enabled").default(true),
  
  // Alarm Preferences (separate from timer)
  alarmSound: text("alarm_sound").default("Gentle Bell"),
  alarmEnabled: boolean("alarm_enabled").default(true),
  
  // Business Information
  company: text("company"),
  companyName: text("company_name"), // Alternative company field for profile
  jobTitle: text("job_title"),
  industry: text("industry"),
  
  // Address Information
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country").default("US"),
  
  // IP Tracking
  signupIpAddress: text("signup_ip_address"),
  lastLoginIpAddress: text("last_login_ip_address"),
  
  // Subscription & Payment
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("free"),
  subscriptionPlan: text("subscription_plan").default("free"),
  preferredBillingCycle: text("preferred_billing_cycle").default("monthly"), // monthly or yearly
  trialEndsAt: timestamp("trial_ends_at"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  
  // Customer Status & Tracking
  customerStatus: text("customer_status").default("active"), // active, inactive, suspended
  
  // DomoAI Voice Features (Enterprise only)
  domoVoiceEnabled: boolean("domo_voice_enabled").default(false),
  domoVoiceTrialStarted: timestamp("domo_voice_trial_started"),
  domoVoiceTrialEnded: timestamp("domo_voice_trial_ended"),
  domoVoiceUnlimited: boolean("domo_voice_unlimited").default(false), // True for enterprise accounts
  voiceTrialStartDate: timestamp("voice_trial_start_date"), // When voice trial started for demo accounts
  voiceTrialActive: boolean("voice_trial_active").default(true), // Whether trial is still active
  customerType: text("customer_type").default("individual"), // individual, business, enterprise
  referralSource: text("referral_source"), // How they found us
  utmSource: text("utm_source"), // Marketing tracking
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  
  // Preferences
  timezone: text("timezone").default("America/New_York"),
  language: text("language").default("en"),
  emailNotifications: boolean("email_notifications").default(true),
  marketingEmails: boolean("marketing_emails").default(true),
  // Archive settings
  autoArchiveEnabled: boolean("auto_archive_enabled").default(false),
  autoArchiveHours: integer("auto_archive_hours").default(24), // 12, 24, 48, or 72 hours
  deleteArchivedAfterDays: integer("delete_archived_after_days"), // null = keep forever, 7-365 days (no default = NULL)
  
  // Public Page Branding Colors (Legacy - kept for compatibility)
  brandPrimaryColor: text("brand_primary_color").default("#16a34a"), // Green default
  brandBackgroundColor: text("brand_background_color").default("#ffffff"), // White default
  brandAccentColor: text("brand_accent_color").default("#16a34a"), // Green default
  
  // Regular Appointment Page Colors
  appointmentPagePrimaryColor: text("appointment_page_primary_color").default("#16a34a"),
  appointmentPageBackgroundColor: text("appointment_page_background_color").default("#ffffff"),
  appointmentPageAccentColor: text("appointment_page_accent_color").default("#16a34a"),
  
  // Appointment Page V2 Colors
  appointmentPageV2PrimaryColor: text("appointment_page_v2_primary_color").default("#16a34a"),
  appointmentPageV2BackgroundColor: text("appointment_page_v2_background_color").default("#ffffff"),
  appointmentPageV2AccentColor: text("appointment_page_v2_accent_color").default("#16a34a"),
  appointmentPageV2CalendarBg: text("appointment_page_v2_calendar_bg").default("blue"), // "blue" or "grey"
  
  // Public Booking Pages
  reservationPageEnabled: boolean("reservation_page_enabled").default(false), // Enable animated reservation flow
  
  // Calendar Integration (Google, Microsoft, etc.)
  calendarProvider: text("calendar_provider"), // "google", "microsoft", or null
  calendarAccessToken: text("calendar_access_token"), // OAuth access token (encrypted)
  calendarRefreshToken: text("calendar_refresh_token"), // OAuth refresh token (encrypted)
  calendarTokenExpiry: timestamp("calendar_token_expiry"), // When access token expires
  calendarSyncEnabled: boolean("calendar_sync_enabled").default(false), // Whether sync is active
  calendarId: text("calendar_id").default("primary"), // Which calendar to sync (primary, work, etc.)
  lastCalendarSync: timestamp("last_calendar_sync"), // Last successful sync timestamp
  calendarEmail: text("calendar_email"), // Email of connected calendar account
  
  // Achievement and Data Collection Preferences
  achievementsEnabled: boolean("achievements_enabled").default(true),
  dataCollectionConsent: boolean("data_collection_consent").default(false),
  
  // Competitive Use Protection
  termsAcceptedAt: timestamp("terms_accepted_at"),
  termsVersion: text("terms_version").default('v1.0'),
  
  // Notion Integration
  notionApiKey: text("notion_api_key"), // Encrypted Notion integration token
  notionDefaultDatabaseId: text("notion_default_database_id"), // User's default Notion database
  
  // Trello Integration
  trelloApiKey: text("trello_api_key"), // Trello API key
  trelloToken: text("trello_token"), // Trello user token
  trelloDefaultBoardId: text("trello_default_board_id"), // User's default Trello board
  trelloDefaultListId: text("trello_default_list_id"), // User's default Trello list for new cards
  
  // AIDOMO Usage Tracking (for trial-expired users)
  aidomoDailyUsageCount: integer("aidomo_daily_usage_count").default(0),
  aidomoLastUsageDate: text("aidomo_last_usage_date"), // YYYY-MM-DD format
  
  // Timestamps
  lastLoginAt: timestamp("last_login_at"),
  emailVerifiedAt: timestamp("email_verified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
} as const);

// Sessions table - store user sessions persistently
export const sessions = pgTable("sessions", {
  sessionId: text("session_id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  lastActivityAt: timestamp("last_activity_at").notNull().defaultNow(),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  createdAt: true,
  lastActivityAt: true,
} as const);

// Timer Analytics table - track timer sessions for productivity insights
export const timerAnalytics = pgTable("timer_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  taskId: text("task_id").references(() => tasks.id), // Optional - null for focus timers
  timerType: text("timer_type").notNull(), // "focus" or "task"
  plannedDuration: integer("planned_duration").notNull(), // in seconds
  actualDuration: integer("actual_duration").notNull(), // in seconds
  completedEarly: boolean("completed_early").notNull().default(false),
  earlyCompletionPercentage: integer("early_completion_percentage"), // % of time saved (0-100)
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Timer analytics insert schema
export const insertTimerAnalyticsSchema = createInsertSchema(timerAnalytics).omit({
  id: true,
  createdAt: true,
} as const);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertTimerAnalytics = z.infer<typeof insertTimerAnalyticsSchema>;
export type TimerAnalytics = typeof timerAnalytics.$inferSelect;

// Voice Authentication Sessions table
export const voiceAuthSessions = pgTable("voice_auth_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionToken: text("session_token").notNull().unique(),
  voiceFeatures: text("voice_features").notNull(), // JSON of captured voice features
  confidenceScore: integer("confidence_score").notNull(), // 0-100 confidence rating
  environmentData: text("environment_data"), // JSON of environmental conditions
  mfaCompleted: boolean("mfa_completed").default(false),
  challengeAnswered: boolean("challenge_answered").default(false),
  isSuccessful: boolean("is_successful").default(false),
  failureReason: text("failure_reason"), // Reason for authentication failure
  deviceInfo: text("device_info"), // JSON of device characteristics
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Voice Health Records table
export const voiceHealthRecords = pgTable("voice_health_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionId: integer("session_id").references(() => voiceAuthSessions.id),
  voiceFeatures: text("voice_features").notNull(), // JSON of voice characteristics
  qualityScore: integer("quality_score").notNull(), // 0-100 voice quality
  backgroundNoise: integer("background_noise"), // Noise level measurement
  voiceStrain: integer("voice_strain"), // Voice strain/health indicator
  environmentType: text("environment_type"), // quiet, noisy, outdoor, etc.
  healthStatus: text("health_status"), // healthy, sick, tired, etc.
  adaptationRecommendations: text("adaptation_recommendations"), // JSON of recommendations
  anomaliesDetected: text("anomalies_detected"), // JSON of detected anomalies
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Voice Training Sessions table
export const voiceTrainingSessions = pgTable("voice_training_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionType: text("session_type").notNull(), // initial, adaptation, recovery
  samplesCollected: integer("samples_collected").default(0),
  voiceSamples: text("voice_samples").notNull(), // JSON array of voice samples
  qualityMetrics: text("quality_metrics"), // JSON of quality assessments
  improvementMetrics: text("improvement_metrics"), // JSON of learning progress
  trainingComplete: boolean("training_complete").default(false),
  confidenceImprovement: integer("confidence_improvement"), // Before/after confidence delta
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Insert schemas for new tables
export const insertVoiceAuthSessionSchema = createInsertSchema(voiceAuthSessions).omit({
  id: true,
  createdAt: true,
} as const);

export const insertVoiceHealthRecordSchema = createInsertSchema(voiceHealthRecords).omit({
  id: true,
  createdAt: true,
} as const);

export const insertVoiceTrainingSessionSchema = createInsertSchema(voiceTrainingSessions).omit({
  id: true,
  createdAt: true,
} as const);

// Types for new tables
export type VoiceAuthSession = typeof voiceAuthSessions.$inferSelect;
export type InsertVoiceAuthSession = z.infer<typeof insertVoiceAuthSessionSchema>;
export type VoiceHealthRecord = typeof voiceHealthRecords.$inferSelect;
export type InsertVoiceHealthRecord = z.infer<typeof insertVoiceHealthRecordSchema>;
export type VoiceTrainingSession = typeof voiceTrainingSessions.$inferSelect;
export type InsertVoiceTrainingSession = z.infer<typeof insertVoiceTrainingSessionSchema>;

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Price in cents
  interval: text("interval").notNull().default("month"), // 'month' or 'year'
  stripePriceId: text("stripe_price_id"),
  features: json("features").$type<string[]>().default([]),
  trialDays: integer("trial_days").notNull().default(7), // Trial period in days
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
} as const);

export type InsertSharedTask = z.infer<typeof insertSharedTaskSchema>;
export type SharedTask = typeof sharedTasks.$inferSelect;

export type InsertDirectTaskShare = z.infer<typeof insertDirectTaskShareSchema>;
export type DirectTaskShare = typeof directTaskShares.$inferSelect;

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// Feedback table
export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  category: text("category").notNull(),
  rating: integer("rating").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: text("status").default("pending").notNull(), // pending, reviewed, responded
});

const feedbackBase = createInsertSchema(feedback);
export const insertFeedbackSchema = feedbackBase
  .omit({ id: true, createdAt: true } as const)
  .extend({ status: z.literal('pending').optional() });

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

// Community Templates - User submitted templates
export const communityTemplates = pgTable("community_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  tags: json("tags").$type<string[]>().default([]),
  submittedByUserId: integer("submitted_by_user_id").notNull().references(() => users.id),
  submittedByName: text("submitted_by_name").notNull(), // Display name for template creator
  submittedByEmail: text("submitted_by_email").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  rejectionReason: text("rejection_reason"), // If rejected, why?
  approvedByUserId: integer("approved_by_user_id").references(() => users.id), // Admin who approved
  isPublic: boolean("is_public").notNull().default(true), // Can be seen by all users
  usageCount: integer("usage_count").notNull().default(0), // How many times it's been used
  rating: integer("rating").default(0), // Average user rating 1-5
  ratingCount: integer("rating_count").default(0), // Number of ratings
  createdAt: timestamp("created_at").notNull().defaultNow(),
  approvedAt: timestamp("approved_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCommunityTemplateSchema = createInsertSchema(communityTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true,
  rating: true,
  ratingCount: true,
} as const);

// Community Template Tasks - Tasks within community templates
export const communityTemplateTasks = pgTable("community_template_tasks", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull().references(() => communityTemplates.id),
  title: text("title").notNull(),
  category: text("category").notNull(),
  priority: text("priority").$type<TaskPriority>().notNull(),
  timer: integer("timer"), // Optional timer in minutes
  scheduledDaysFromNow: integer("scheduled_days_from_now"), // For scheduling tasks (0=today, 7=week, 30=month)
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCommunityTemplateTaskSchema = createInsertSchema(communityTemplateTasks).omit({
  id: true,
  createdAt: true,
} as const);

export type InsertCommunityTemplate = z.infer<typeof insertCommunityTemplateSchema>;
export type CommunityTemplate = typeof communityTemplates.$inferSelect;

export type InsertCommunityTemplateTask = z.infer<typeof insertCommunityTemplateTaskSchema>;
export type CommunityTemplateTask = typeof communityTemplateTasks.$inferSelect;

// Achievement types
export const AchievementType = z.enum(["task_completion", "streak", "category", "timer", "voice", "sharing", "milestone"]);
export type AchievementType = z.infer<typeof AchievementType>;

// Achievements table - defines all possible achievements
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").$type<AchievementType>().notNull(),
  icon: text("icon").notNull(), // Lucide icon name
  condition: json("condition").$type<{ target: number; category?: string; frequency?: string }>().notNull(),
  points: integer("points").notNull().default(10),
  rarity: text("rarity").notNull().default("common"), // common, rare, epic, legendary
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
} as const);

// User achievements table - tracks which achievements users have earned
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  progress: integer("progress").notNull().default(0),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  createdAt: true,
} as const);

// User stats table - tracks user statistics for achievements
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  totalTasks: integer("total_tasks").notNull().default(0),
  completedTasks: integer("completed_tasks").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastCompletionDate: timestamp("last_completion_date"),
  totalPoints: integer("total_points").notNull().default(0),
  // Category-specific stats
  workTasks: integer("work_tasks").notNull().default(0),
  personalTasks: integer("personal_tasks").notNull().default(0),
  shoppingTasks: integer("shopping_tasks").notNull().default(0),
  healthTasks: integer("health_tasks").notNull().default(0),
  businessTasks: integer("business_tasks").notNull().default(0),
  otherTasks: integer("other_tasks").notNull().default(0),
  // Timer stats
  totalTimerMinutes: integer("total_timer_minutes").notNull().default(0),
  timerTasksCompleted: integer("timer_tasks_completed").notNull().default(0),
  // Voice command stats
  voiceTasksCreated: integer("voice_tasks_created").notNull().default(0),
  // Sharing stats
  tasksShared: integer("tasks_shared").notNull().default(0),
  tasksReceived: integer("tasks_received").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  updatedAt: true,
} as const);

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;

// Appointment status enum
export const AppointmentStatus = z.enum(["scheduled", "confirmed", "cancelled", "completed", "no_show"]);
export type AppointmentStatus = z.infer<typeof AppointmentStatus>;

// Scheduling Settings table - user's scheduling configuration
export const schedulingSettings = pgTable("scheduling_settings", {
  userId: integer("user_id").primaryKey().references(() => users.id),
  slug: text("slug").notNull().unique(), // Public booking URL slug (e.g., /schedule/john-doe)
  isEnabled: boolean("is_enabled").notNull().default(false),
  bookingWindowDays: integer("booking_window_days").notNull().default(30), // How far ahead can people book
  minNoticeMinutes: integer("min_notice_minutes").notNull().default(60), // Minimum advance notice
  slotDuration: integer("slot_duration").notNull().default(30), // Duration of each appointment in minutes
  availability: json("availability").$type<{
    [key: string]: { // Day of week (monday, tuesday, etc.)
      enabled: boolean;
      slots: { start: string; end: string }[]; // Array of time ranges (e.g., [{start: "09:00", end: "12:00"}])
    };
  }>().notNull().default({
    monday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
    tuesday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
    wednesday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
    thursday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
    friday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] },
  }),
  meetingTitle: text("meeting_title").notNull().default("Meeting"),
  meetingDescription: text("meeting_description"),
  timezone: text("timezone").notNull().default("America/New_York"),
  notificationEmail: text("notification_email"), // Email to send booking notifications to
  blockedDates: text("blocked_dates").array().default([]), // Array of blocked dates in YYYY-MM-DD format
  blockedTimeSlots: json("blocked_time_slots").$type<{
    date: string; // YYYY-MM-DD
    slots: { start: string; end: string }[]; // Time ranges to block on that date
  }[]>().default([]), // Array of specific time slots blocked on specific dates
  // Private labeling options
  showBranding: boolean("show_branding").notNull().default(false), // Toggle to show/hide custom branding
  businessName: text("business_name"), // Custom business/company name
  businessPhone: text("business_phone"), // Business phone number
  brandingLogoUrl: text("branding_logo_url"), // Custom logo/profile picture URL
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSchedulingSettingsSchema = createInsertSchema(schedulingSettings).omit({
  createdAt: true,
  updatedAt: true,
} as const);

// Appointments table
export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").notNull().references(() => users.id), // Host user
  taskId: text("task_id").references(() => tasks.id), // Linked task created for this appointment
  attendeeName: text("attendee_name").notNull(),
  attendeeEmail: text("attendee_email").notNull(),
  attendeeNotes: text("attendee_notes"),
  additionalEmails: text("additional_emails").array(), // Additional emails to share calendar invite with
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").$type<AppointmentStatus>().notNull().default("scheduled"),
  cancellationToken: text("cancellation_token").notNull().unique(), // Token for cancellation link
  calendarEventId: text("calendar_event_id"), // Google/Microsoft Calendar event ID for syncing
  metadata: json("metadata").$type<{ [key: string]: any }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
} as const);

export type InsertSchedulingSettings = z.infer<typeof insertSchedulingSettingsSchema>;
export type SchedulingSettings = typeof schedulingSettings.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Customer Analytics table - track customer behavior and engagement
export const customerAnalytics = pgTable("customer_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventType: text("event_type").notNull(), // login, task_created, task_completed, subscription_started, etc.
  eventData: json("event_data"), // Additional event-specific data
  sessionId: text("session_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  platform: text("platform"), // web, mobile, desktop
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCustomerAnalyticsSchema = createInsertSchema(customerAnalytics).omit({
  id: true,
  createdAt: true,
} as const);

export type InsertCustomerAnalytics = z.infer<typeof insertCustomerAnalyticsSchema>;
export type CustomerAnalytics = typeof customerAnalytics.$inferSelect;

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  email: text("email").notNull(), // Store email to validate during reset
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  usedAt: timestamp("used_at"),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
  usedAt: true,
} as const);

export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// Shares table for sharing charts and achievements
export const shares = pgTable("shares", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'gantt', 'pert', 'combined', 'achievements'
  data: text("data").notNull(), // JSON stringified chart/achievement data
  isPublic: boolean("is_public").default(false).notNull(),
  requiresPassword: boolean("requires_password").default(false).notNull(),
  password: text("password"),
  description: text("description"),
  viewCount: integer("view_count").default(0).notNull(),
  expiresAt: timestamp("expires_at"),
  lastViewedAt: timestamp("last_viewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertShareSchema = createInsertSchema(shares).omit({
  id: true,
  viewCount: true,
  lastViewedAt: true,
  createdAt: true,
  updatedAt: true,
} as const);

export type InsertShare = z.infer<typeof insertShareSchema>;
export type Share = typeof shares.$inferSelect;

// Notifications table for reminders and alerts
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // reminder, achievement, share, calendar_reminder
  title: text("title").notNull(),
  message: text("message").notNull(),
  taskId: text("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  isRead: boolean("is_read").notNull().default(false),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  readAt: true
} as const);

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// App Statistics table - for global counters like downloads
export const appStatistics = pgTable("app_statistics", {
  id: serial("id").primaryKey(),
  metricName: text("metric_name").notNull().unique(), // e.g., "downloads", "users", etc.
  currentValue: integer("current_value").notNull().default(0),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAppStatisticSchema = createInsertSchema(appStatistics).omit({
  id: true,
  lastUpdated: true,
  createdAt: true
} as const);

export type InsertAppStatistic = z.infer<typeof insertAppStatisticSchema>;
export type AppStatistic = typeof appStatistics.$inferSelect;

// Task templates table
export const taskTemplates = pgTable("task_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Personal Productivity, Project Management, Strategic Planning, etc.
  tasks: json("tasks").$type<TemplateTask[]>().notNull(), // Array of template tasks
  isPublic: boolean("is_public").notNull().default(true), // Public templates vs user-created
  createdByUserId: integer("created_by_user_id").references(() => users.id), // null for system templates
  usageCount: integer("usage_count").notNull().default(0), // Track popularity
  tags: json("tags").$type<string[]>().default([]), // Tags for filtering/search
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Template task structure
export interface TemplateTask {
  title: string;
  category: string;
  priority: TaskPriority;
  timer?: number;
  scheduledDaysFromNow?: number; // Relative scheduling
  description?: string;
}

// Template insert schema
export const insertTaskTemplateSchema = createInsertSchema(taskTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
} as const);

export type TaskTemplate = typeof taskTemplates.$inferSelect;
export type InsertTaskTemplate = z.infer<typeof insertTaskTemplateSchema>;

// Template Favorites - Users can save favorite templates for quick access
export const templateFavorites = pgTable("template_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  templateId: integer("template_id").notNull().references(() => taskTemplates.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTemplateFavoriteSchema = createInsertSchema(templateFavorites).omit({
  id: true,
  createdAt: true
} as const);

export type TemplateFavorite = typeof templateFavorites.$inferSelect;
export type InsertTemplateFavorite = z.infer<typeof insertTemplateFavoriteSchema>;

// Template Usage History - Track when users use templates
export const templateUsageHistory = pgTable("template_usage_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  templateId: integer("template_id").notNull().references(() => taskTemplates.id, { onDelete: "cascade" }),
  templateName: text("template_name").notNull(), // Store name in case template is deleted
  usedAt: timestamp("used_at").notNull().defaultNow(),
});

export const insertTemplateUsageHistorySchema = createInsertSchema(templateUsageHistory).omit({
  id: true,
  usedAt: true
} as const);

export type TemplateUsageHistory = typeof templateUsageHistory.$inferSelect;
export type InsertTemplateUsageHistory = z.infer<typeof insertTemplateUsageHistorySchema>;

// User Memory table for AI context and personalization
export const userMemory = pgTable("user_memory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Core user info that AI should remember
  preferredName: text("preferred_name"), // What the user likes to be called
  personalDetails: json("personal_details").$type<{
    occupation?: string;
    interests?: string[];
    goals?: string[];
    challenges?: string[];
    workStyle?: string;
    timezone?: string;
    personalityTraits?: string[];
  }>().default({}),
  
  // Conversation context and history
  recentConversations: json("recent_conversations").$type<Array<{
    timestamp: string;
    topic: string;
    summary: string;
    keyPoints: string[];
    userMood?: string;
    taskContext?: string;
  }>>().default([]),
  
  // AI learning and adaptation
  userPreferences: json("user_preferences").$type<{
    communicationStyle?: string; // formal, casual, encouraging, direct
    responseLength?: string; // brief, detailed, balanced
    helpfulFeatures?: string[];
    frequentRequests?: string[];
    learningStyle?: string;
    motivationStyle?: string;
  }>().default({}),
  
  // Task and productivity patterns
  productivityInsights: json("productivity_insights").$type<{
    mostProductiveTime?: string;
    commonTaskTypes?: string[];
    preferredCategories?: string[];
    completionPatterns?: string;
    challengingAreas?: string[];
    successfulStrategies?: string[];
  }>().default({}),
  
  // Memory metadata
  lastInteraction: timestamp("last_interaction").defaultNow(),
  memoryVersion: integer("memory_version").notNull().default(1), // For schema evolution
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User memory insert schema
export const insertUserMemorySchema = createInsertSchema(userMemory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastInteraction: true
} as const);

export type UserMemory = typeof userMemory.$inferSelect;
export type InsertUserMemory = z.infer<typeof insertUserMemorySchema>;

// AIDOMO Conversations table - store user chat sessions with AIDOMO
export const aidomoConversations = pgTable("aidomo_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id").notNull().unique(), // Unique identifier for each conversation session
  title: text("title").notNull(), // Auto-generated title based on first message
  
  // Conversation data
  messages: json("messages").$type<Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    tokensUsed?: number;
  }>>().notNull().default([]),
  
  // Metadata
  totalMessages: integer("total_messages").notNull().default(0),
  totalTokensUsed: integer("total_tokens_used").notNull().default(0),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  
  // Status and archiving
  isArchived: boolean("is_archived").notNull().default(false),
  archivedAt: timestamp("archived_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// AIDOMO Tokens table - track token usage and limits per user
export const aidomoTokens = pgTable("aidomo_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Token allocation and usage
  monthlyLimit: integer("monthly_limit").notNull().default(10000), // Monthly token limit
  currentUsage: integer("current_usage").notNull().default(0), // Current month usage
  totalUsage: integer("total_usage").notNull().default(0), // All-time usage
  
  // Reset tracking
  lastResetAt: timestamp("last_reset_at").notNull().defaultNow(), // When monthly counter was reset
  resetPeriod: text("reset_period").notNull().default("monthly"), // monthly, unlimited, etc.
  
  // Premium features
  bonusTokens: integer("bonus_tokens").notNull().default(0), // Extra tokens from purchases/promotions
  subscriptionTier: text("subscription_tier").notNull().default("free"), // free, premium, enterprise
  
  // Usage tracking
  conversationsCount: integer("conversations_count").notNull().default(0),
  lastUsedAt: timestamp("last_used_at").defaultNow(),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// AIDOMO conversation insert schema
export const insertAidomoConversationSchema = createInsertSchema(aidomoConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// AIDOMO tokens insert schema
export const insertAidomoTokensSchema = createInsertSchema(aidomoTokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type AidomoConversation = typeof aidomoConversations.$inferSelect;
export type InsertAidomoConversation = z.infer<typeof insertAidomoConversationSchema>;
export type AidomoTokens = typeof aidomoTokens.$inferSelect;
export type InsertAidomoTokens = z.infer<typeof insertAidomoTokensSchema>;

// Login codes table - For simple email + code authentication
export const loginCodes = pgTable("login_codes", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  userId: integer("user_id").references(() => users.id), // null for new users
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Login codes insert schema
export const insertLoginCodeSchema = createInsertSchema(loginCodes).omit({
  id: true,
  createdAt: true,
  used: true,
});

// Login code types
export type LoginCode = typeof loginCodes.$inferSelect;
export type InsertLoginCode = z.infer<typeof insertLoginCodeSchema>;

// Site Analytics table - track overall site activity
export const siteAnalytics = pgTable("site_analytics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(), // Date for aggregation
  visitors: integer("visitors").notNull().default(0), // Unique visitors
  pageViews: integer("page_views").notNull().default(0), // Total page views
  signups: integer("signups").notNull().default(0), // New registrations
  logins: integer("logins").notNull().default(0), // Total logins
  activeSessions: integer("active_sessions").notNull().default(0), // Active users
  tasksCreated: integer("tasks_created").notNull().default(0),
  tasksCompleted: integer("tasks_completed").notNull().default(0),
  aiInteractions: integer("ai_interactions").notNull().default(0), // AIDOMO interactions
  subscriptions: integer("subscriptions").notNull().default(0), // New subscriptions
  revenue: integer("revenue").notNull().default(0), // Revenue in cents
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Site analytics insert schema
export const insertSiteAnalyticsSchema = createInsertSchema(siteAnalytics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Visitor Sessions table - track individual visitor sessions
export const visitorSessions = pgTable("visitor_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  visitorId: text("visitor_id").notNull(), // Cookie-based visitor ID
  userId: integer("user_id").references(() => users.id), // null for anonymous visitors
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  landingPage: text("landing_page"),
  exitPage: text("exit_page"),
  pageViews: integer("page_views").notNull().default(0),
  duration: integer("duration"), // Session duration in seconds
  country: text("country"),
  city: text("city"),
  device: text("device"), // desktop, mobile, tablet
  browser: text("browser"),
  os: text("os"),
  isLoggedIn: boolean("is_logged_in").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastActivityAt: timestamp("last_activity_at").notNull().defaultNow(),
});

// Visitor sessions insert schema
export const insertVisitorSessionSchema = createInsertSchema(visitorSessions).omit({
  id: true,
  createdAt: true,
});

// Page Views table - detailed page view tracking
export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  visitorId: text("visitor_id").notNull(),
  userId: integer("user_id").references(() => users.id),
  path: text("path").notNull(),
  title: text("title"),
  referrer: text("referrer"),
  timeOnPage: integer("time_on_page"), // Time in seconds
  scrollDepth: integer("scroll_depth"), // Percentage (0-100)
  clicks: integer("clicks").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Page views insert schema
export const insertPageViewSchema = createInsertSchema(pageViews).omit({
  id: true,
  createdAt: true,
});

// Schedule Share Permission Levels
export const ScheduleSharePermission = z.enum(["view", "edit", "full"]);
export type ScheduleSharePermission = z.infer<typeof ScheduleSharePermission>;

// Schedule Shares table - for sharing calendars/schedules with other AIChecklist users
export const scheduleShares = pgTable("schedule_shares", {
  id: serial("id").primaryKey(),
  ownerUserId: integer("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sharedWithUserId: integer("shared_with_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sharedWithUsername: text("shared_with_username").notNull(),
  sharedWithEmail: text("shared_with_email"),
  permission: text("permission").$type<ScheduleSharePermission>().notNull().default("view"),
  shareType: text("share_type").notNull().default("full"), // "full" = entire schedule, "selective" = specific appointments
  selectedTaskIds: json("selected_task_ids").$type<string[]>(), // For selective sharing, list of task IDs
  isActive: boolean("is_active").notNull().default(true),
  acceptedAt: timestamp("accepted_at"), // When the recipient accepted the share
  declinedAt: timestamp("declined_at"), // When the recipient declined the share
  message: text("message"), // Optional message from sharer
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Schedule share insert schema
export const insertScheduleShareSchema = createInsertSchema(scheduleShares).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  acceptedAt: true,
});

// Types
export type ScheduleShare = typeof scheduleShares.$inferSelect;
export type InsertScheduleShare = z.infer<typeof insertScheduleShareSchema>;

export type SiteAnalytics = typeof siteAnalytics.$inferSelect;
export type InsertSiteAnalytics = z.infer<typeof insertSiteAnalyticsSchema>;
export type VisitorSession = typeof visitorSessions.$inferSelect;
export type InsertVisitorSession = z.infer<typeof insertVisitorSessionSchema>;
export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = z.infer<typeof insertPageViewSchema>;

// CONTACTS - For storing user contacts (team members, collaborators)
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  ownerUserId: integer("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contactUserId: integer("contact_user_id").references(() => users.id),
  displayName: text("display_name").notNull(),
  title: text("title"),
  department: text("department"),
  email: text("email").notNull(),
  aliasesCsv: text("aliases_csv").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

// MESSAGE_THREADS - For grouping conversations between users
export const messageThreads = pgTable("message_threads", {
  id: serial("id").primaryKey(),
  createdByUserId: integer("created_by_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  participantAUserId: integer("participant_a_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  participantBUserId: integer("participant_b_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMessageThreadSchema = createInsertSchema(messageThreads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type MessageThread = typeof messageThreads.$inferSelect;
export type InsertMessageThread = z.infer<typeof insertMessageThreadSchema>;

// MESSAGES - Text-only inbox for AIDOMO messaging
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  toUserId: integer("to_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  threadId: integer("thread_id").references(() => messageThreads.id),
  subject: text("subject"),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  readAt: timestamp("read_at"),
}, (t) => ({
  inboxThreadSortIdx: index("messages_inbox_thread_sort_idx").on(
    t.toUserId,
    t.threadId,
    t.createdAt
  ),
  unreadIdx: index("messages_unread_idx").on(
    t.toUserId,
    t.readAt,
    t.threadId
  ),
}));

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
