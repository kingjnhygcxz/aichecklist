import { Router } from 'express';
import { storage } from '../storage';
import { logger } from '../logger';

const router = Router();

// Get user preferences
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return all user preferences
    const preferences = {
      // Timer & Alarm Preferences
      timerSound: user.timerSound || "Gentle Bell",
      timerEnabled: user.timerEnabled ?? true,
      alarmSound: user.alarmSound || "Gentle Bell",
      alarmEnabled: user.alarmEnabled ?? true,
      
      // General Preferences
      timezone: user.timezone || "America/New_York",
      language: user.language || "en",
      emailNotifications: user.emailNotifications ?? true,
      marketingEmails: user.marketingEmails ?? true,
      
      // Archive Settings
      autoArchiveEnabled: user.autoArchiveEnabled ?? false,
      autoArchiveHours: user.autoArchiveHours || 24,
      // Explicitly return null for keep-forever (don't default to 30)
      deleteArchivedAfterDays: user.deleteArchivedAfterDays !== undefined ? user.deleteArchivedAfterDays : null,
      
      // Achievement Preferences
      achievementsEnabled: user.achievementsEnabled ?? true,
      dataCollectionConsent: user.dataCollectionConsent ?? false,
      
      // Voice Settings (for enterprise users)
      voiceEnabled: user.voiceEnabled ?? false,
      domoVoiceEnabled: user.domoVoiceEnabled ?? false,
    };

    logger.info('User preferences retrieved', { userId, preferences: Object.keys(preferences) });
    res.json(preferences);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to retrieve user preferences', { error: errorMessage, userId: (req as any).userId });
    res.status(500).json({ message: 'Failed to retrieve preferences' });
  }
});

// Update user preferences
router.patch('/', async (req, res) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const updates = req.body;
    
    // Validate the updates contain only allowed preference fields
    const allowedFields = [
      'timerSound', 'timerEnabled', 'alarmSound', 'alarmEnabled',
      'timezone', 'language', 'emailNotifications', 'marketingEmails',
      'autoArchiveEnabled', 'autoArchiveHours', 'deleteArchivedAfterDays',
      'achievementsEnabled', 'dataCollectionConsent',
      'voiceEnabled', 'domoVoiceEnabled'
    ];
    
    const filteredUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        // Validate deleteArchivedAfterDays: must be null or >= 7
        if (key === 'deleteArchivedAfterDays') {
          if (value !== null && (typeof value !== 'number' || value < 7)) {
            return res.status(400).json({ 
              message: 'deleteArchivedAfterDays must be null (keep forever) or a number >= 7 days' 
            });
          }
        }
        // Validate autoArchiveHours: must be >= 1
        if (key === 'autoArchiveHours') {
          if (typeof value !== 'number' || value < 1) {
            return res.status(400).json({ 
              message: 'autoArchiveHours must be a number >= 1 hour' 
            });
          }
        }
        filteredUpdates[key] = value;
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ message: 'No valid preference updates provided' });
    }

    // Update user preferences
    const updatedUser = await storage.updateUserProfile(userId, filteredUpdates);
    if (!updatedUser) {
      return res.status(500).json({ message: 'Failed to update preferences' });
    }

    logger.info('User preferences updated', { userId, updates: Object.keys(filteredUpdates) });
    res.json({ message: 'Preferences updated successfully', updatedFields: Object.keys(filteredUpdates) });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to update user preferences', { error: errorMessage, userId: (req as any).userId });
    res.status(500).json({ message: 'Failed to update preferences' });
  }
});

export default router;