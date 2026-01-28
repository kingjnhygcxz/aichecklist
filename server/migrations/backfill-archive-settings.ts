import { db } from '../db';
import { users, tasks } from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { logger } from '../logger';

/**
 * One-time migration to backfill archive settings for legacy users
 * and set archivedAt timestamps for existing archived tasks.
 * 
 * This script is idempotent and can be run multiple times safely.
 */
export async function backfillArchiveSettings() {
  const migrationStart = new Date();
  logger.info('[MIGRATION] Starting archive settings backfill', {
    timestamp: migrationStart.toISOString()
  });

  try {
    // STEP 1: Set archivedAt for legacy archived tasks without timestamp
    logger.info('[MIGRATION] Step 1: Backfilling archivedAt timestamps for archived tasks');
    
    const legacyArchivedTasks = await db.select()
      .from(tasks)
      .where(
        and(
          eq(tasks.archived, true),
          sql`${tasks.archivedAt} IS NULL`
        )
      );

    const legacyTaskCount = legacyArchivedTasks.length;
    logger.info('[MIGRATION] Found legacy archived tasks without archivedAt', {
      count: legacyTaskCount,
      sampleTaskIds: legacyArchivedTasks.slice(0, 5).map(t => t.id)
    });

    if (legacyTaskCount > 0) {
      // Set archivedAt to completedAt (or createdAt as fallback) to preserve historical ordering
      await db.execute(sql`
        UPDATE ${tasks}
        SET archived_at = COALESCE(completed_at, created_at)
        WHERE archived = true AND archived_at IS NULL
      `);
      
      logger.info('[MIGRATION] Updated legacy archived tasks with archivedAt (using completedAt/createdAt)', {
        updatedCount: legacyTaskCount,
        sampleOldestTask: legacyArchivedTasks.length > 0 ? {
          id: legacyArchivedTasks[0].id,
          completedAt: legacyArchivedTasks[0].completedAt,
          createdAt: legacyArchivedTasks[0].createdAt
        } : null
      });
    }

    // STEP 2: Set default retention settings for users with null values
    logger.info('[MIGRATION] Step 2: Setting default archive settings for legacy users');
    
    // Find users with null deleteArchivedAfterDays (need to keep as null for "keep forever")
    // and users with null autoArchiveHours (need to set to 24)
    const usersNeedingDefaults = await db.select()
      .from(users)
      .where(sql`${users.autoArchiveHours} IS NULL`);

    const usersNeedingDefaultsCount = usersNeedingDefaults.length;
    logger.info('[MIGRATION] Found users needing default autoArchiveHours', {
      count: usersNeedingDefaultsCount,
      sampleUserIds: usersNeedingDefaults.slice(0, 5).map(u => u.id)
    });

    // Capture per-user stats before/after
    const usersStats = usersNeedingDefaults.map(u => ({
      id: u.id,
      before: {
        autoArchiveHours: u.autoArchiveHours,
        deleteArchivedAfterDays: u.deleteArchivedAfterDays
      }
    }));

    if (usersNeedingDefaultsCount > 0) {
      // Update users with null autoArchiveHours to 24 (default)
      // Keep deleteArchivedAfterDays as null (keep forever) by default
      await db.update(users)
        .set({ 
          autoArchiveHours: 24
          // deleteArchivedAfterDays stays null for "keep forever" by default
        })
        .where(sql`${users.autoArchiveHours} IS NULL`);
      
      logger.info('[MIGRATION] Updated users with default autoArchiveHours', {
        updatedCount: usersNeedingDefaultsCount,
        sampleStats: usersStats.slice(0, 3).map(s => ({
          ...s,
          after: { autoArchiveHours: 24, deleteArchivedAfterDays: null }
        }))
      });
    }

    // STEP 3: Generate migration summary report
    const migrationEnd = new Date();
    const duration = migrationEnd.getTime() - migrationStart.getTime();
    
    logger.info('[MIGRATION] Archive settings backfill completed successfully', {
      duration: `${duration}ms`,
      startTime: migrationStart.toISOString(),
      endTime: migrationEnd.toISOString(),
      results: {
        archivedTasksUpdated: legacyTaskCount,
        usersDefaultsSet: usersNeedingDefaultsCount
      }
    });

    return {
      success: true,
      archivedTasksUpdated: legacyTaskCount,
      usersDefaultsSet: usersNeedingDefaultsCount,
      duration
    };

  } catch (error) {
    logger.error('[MIGRATION] Archive settings backfill failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    throw error;
  }
}

// Allow running this script directly
if (require.main === module) {
  backfillArchiveSettings()
    .then((result) => {
      console.log('Migration completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
