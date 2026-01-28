import { users } from "../../shared/schema";

export interface UserSettings {
  autoArchiveEnabled: boolean;
  autoArchiveHours: number;
  emailNotifications?: boolean;
  marketingEmails?: boolean;
  timezone?: string;
  language?: string;
}

// Convert DB row → frontend settings
export function toUserSettings(userRow: typeof users.$inferSelect): UserSettings {
  return {
    autoArchiveEnabled: userRow.autoArchiveEnabled || false,
    autoArchiveHours: userRow.autoArchiveHours || 24,
    emailNotifications: userRow.emailNotifications,
    marketingEmails: userRow.marketingEmails,
    timezone: userRow.timezone,
    language: userRow.language,
  };
}

// Convert frontend input → DB update
export function toUserUpdate(updates: Partial<UserSettings>): Partial<typeof users.$inferInsert> {
  const updateData: any = { updatedAt: new Date() };

  // Validate archive hours if provided
  if (updates.autoArchiveHours !== undefined) {
    const validHours = [1, 3, 6, 12, 24, 48, 72];
    if (!validHours.includes(updates.autoArchiveHours)) {
      throw new Error("Invalid autoArchiveHours. Must be 1, 3, 6, 12, 24, 48, or 72.");
    }
  }

  if (updates.autoArchiveEnabled !== undefined) {
    updateData.autoArchiveEnabled = updates.autoArchiveEnabled;
  }
  if (updates.autoArchiveHours !== undefined) {
    updateData.autoArchiveHours = updates.autoArchiveHours;
  }
  if (updates.emailNotifications !== undefined) {
    updateData.emailNotifications = updates.emailNotifications;
  }
  if (updates.marketingEmails !== undefined) {
    updateData.marketingEmails = updates.marketingEmails;
  }
  if (updates.timezone !== undefined) {
    updateData.timezone = updates.timezone;
  }
  if (updates.language !== undefined) {
    updateData.language = updates.language;
  }

  return updateData;
}