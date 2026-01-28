import { Router } from 'express';
import { db } from '../db';
import { scheduleShares, users, tasks } from '@shared/schema';
import { eq, and, or, sql } from 'drizzle-orm';
import { logger } from '../logger';
import { z } from 'zod';

const createShareSchema = z.object({
  recipientIdentifier: z.string().min(1, 'Recipient is required'),
  permission: z.enum(['view', 'edit', 'full']).default('view'),
  shareType: z.enum(['full', 'selective']).default('full'),
  selectedTaskIds: z.array(z.string()).nullable().optional(),
  message: z.string().nullable().optional(),
});

const updateShareSchema = z.object({
  permission: z.enum(['view', 'edit', 'full']).optional(),
  shareType: z.enum(['full', 'selective']).optional(),
  selectedTaskIds: z.array(z.string()).nullable().optional(),
  message: z.string().nullable().optional(),
});

const router = Router();

// Note: Authentication is handled by requireAuth middleware in routes.ts
// All routes receive req.userId and req.user from that middleware

router.post('/create', async (req, res) => {
  try {
    const parsed = createShareSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        message: 'Invalid request data', 
        errors: parsed.error.errors 
      });
    }
    
    const { recipientIdentifier, permission, shareType, selectedTaskIds, message } = parsed.data;
    const ownerUserId = (req as any).userId;

    // Case-insensitive email lookup
    const normalizedIdentifier = recipientIdentifier.toLowerCase().trim();
    const recipientUser = await db
      .select({ id: users.id, username: users.username, email: users.email })
      .from(users)
      .where(
        or(
          eq(users.username, recipientIdentifier),
          sql`LOWER(${users.email}) = ${normalizedIdentifier}`
        )
      )
      .limit(1);

    if (recipientUser.length === 0) {
      return res.status(404).json({ message: 'User not found. Please enter a valid AIChecklist username or email.' });
    }

    const recipient = recipientUser[0];

    if (recipient.id === ownerUserId) {
      return res.status(400).json({ message: 'You cannot share your schedule with yourself.' });
    }

    const existingShare = await db
      .select()
      .from(scheduleShares)
      .where(
        and(
          eq(scheduleShares.ownerUserId, ownerUserId),
          eq(scheduleShares.sharedWithUserId, recipient.id),
          eq(scheduleShares.isActive, true)
        )
      )
      .limit(1);

    if (existingShare.length > 0) {
      return res.status(400).json({ message: 'You already have an active share with this user. Update or remove the existing share first.' });
    }

    const [newShare] = await db.insert(scheduleShares).values({
      ownerUserId,
      sharedWithUserId: recipient.id,
      sharedWithUsername: recipient.username,
      sharedWithEmail: recipient.email,
      permission: permission || 'view',
      shareType: shareType || 'full',
      selectedTaskIds: shareType === 'selective' ? selectedTaskIds : null,
      message: message || null,
      isActive: true,
    }).returning();

    res.json({ 
      success: true, 
      share: newShare,
      message: `Schedule shared successfully with ${recipient.username}` 
    });
  } catch (error) {
    logger.error('Error creating schedule share:', error);
    res.status(500).json({ message: 'Failed to create schedule share' });
  }
});

router.get('/my-shares', async (req, res) => {
  try {
    const userId = (req as any).userId;

    // Return active shares + declined shares (but not manually removed ones)
    // Active: isActive = true (pending or accepted)
    // Declined: isActive = false AND declinedAt IS NOT NULL
    // Manually removed: isActive = false AND declinedAt IS NULL (hide these)
    const myShares = await db
      .select({
        id: scheduleShares.id,
        sharedWithUserId: scheduleShares.sharedWithUserId,
        sharedWithUsername: scheduleShares.sharedWithUsername,
        sharedWithEmail: scheduleShares.sharedWithEmail,
        permission: scheduleShares.permission,
        shareType: scheduleShares.shareType,
        selectedTaskIds: scheduleShares.selectedTaskIds,
        isActive: scheduleShares.isActive,
        acceptedAt: scheduleShares.acceptedAt,
        declinedAt: scheduleShares.declinedAt,
        message: scheduleShares.message,
        createdAt: scheduleShares.createdAt,
      })
      .from(scheduleShares)
      .where(
        and(
          eq(scheduleShares.ownerUserId, userId),
          or(
            eq(scheduleShares.isActive, true),
            sql`${scheduleShares.declinedAt} IS NOT NULL`
          )
        )
      );

    res.json(myShares);
  } catch (error) {
    logger.error('Error fetching my shares:', error);
    res.status(500).json({ message: 'Failed to fetch shares' });
  }
});

router.get('/shared-with-me', async (req, res) => {
  try {
    const userId = (req as any).userId;

    const sharedWithMe = await db
      .select({
        id: scheduleShares.id,
        ownerUserId: scheduleShares.ownerUserId,
        ownerUsername: users.username,
        ownerEmail: users.email,
        permission: scheduleShares.permission,
        shareType: scheduleShares.shareType,
        selectedTaskIds: scheduleShares.selectedTaskIds,
        isActive: scheduleShares.isActive,
        acceptedAt: scheduleShares.acceptedAt,
        message: scheduleShares.message,
        createdAt: scheduleShares.createdAt,
      })
      .from(scheduleShares)
      .innerJoin(users, eq(users.id, scheduleShares.ownerUserId))
      .where(
        and(
          eq(scheduleShares.sharedWithUserId, userId),
          eq(scheduleShares.isActive, true)
        )
      );

    res.json(sharedWithMe);
  } catch (error) {
    logger.error('Error fetching shares with me:', error);
    res.status(500).json({ message: 'Failed to fetch shares' });
  }
});

// Get all shared calendar events from accepted shares - combines events from all users who shared with current user
router.get('/shared-events', async (req, res) => {
  try {
    const userId = (req as any).userId;
    
    logger.info('Fetching shared events for user', { userId });

    // Find all accepted shares where current user is the recipient
    const acceptedShares = await db
      .select({
        id: scheduleShares.id,
        ownerUserId: scheduleShares.ownerUserId,
        ownerUsername: users.username,
        permission: scheduleShares.permission,
        shareType: scheduleShares.shareType,
        selectedTaskIds: scheduleShares.selectedTaskIds,
      })
      .from(scheduleShares)
      .innerJoin(users, eq(users.id, scheduleShares.ownerUserId))
      .where(
        and(
          eq(scheduleShares.sharedWithUserId, userId),
          eq(scheduleShares.isActive, true),
          sql`${scheduleShares.acceptedAt} IS NOT NULL`
        )
      );
    
    logger.info('Found accepted shares', { userId, sharesCount: acceptedShares.length, shares: acceptedShares.map(s => ({ id: s.id, ownerUserId: s.ownerUserId, ownerUsername: s.ownerUsername })) });

    if (acceptedShares.length === 0) {
      return res.json([]);
    }

    // Collect all shared events from all owners
    const allSharedEvents: any[] = [];

    for (const share of acceptedShares) {
      let ownerTasks;
      
      if (share.shareType === 'full') {
        // Full schedule - get all scheduled tasks from owner (exclude archived)
        ownerTasks = await db
          .select()
          .from(tasks)
          .where(and(
            eq(tasks.userId, share.ownerUserId),
            eq(tasks.archived, false)
          ));
        
        ownerTasks = ownerTasks.filter(task => task.scheduledDate !== null);
        logger.info('Found owner tasks for share', { shareId: share.id, ownerUserId: share.ownerUserId, tasksCount: ownerTasks.length });
      } else {
        // Selective - only get selected tasks
        const taskIds = share.selectedTaskIds || [];
        if (taskIds.length === 0) {
          ownerTasks = [];
        } else {
          ownerTasks = await db
            .select()
            .from(tasks)
            .where(eq(tasks.userId, share.ownerUserId));
          
          ownerTasks = ownerTasks.filter(task => 
            taskIds.includes(task.id) && task.scheduledDate !== null
          );
        }
      }

      // Add owner info and permission to each task
      for (const task of ownerTasks) {
        allSharedEvents.push({
          ...task,
          isShared: true,
          shareOwnerUsername: share.ownerUsername,
          shareOwnerId: share.ownerUserId,
          sharePermission: share.permission,
          shareId: share.id
        });
      }
    }

    res.json(allSharedEvents);
  } catch (error) {
    logger.error('Error fetching shared events:', error);
    res.status(500).json({ message: 'Failed to fetch shared events' });
  }
});

router.get('/shared-schedule/:shareId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { shareId } = req.params;

    const share = await db
      .select()
      .from(scheduleShares)
      .where(
        and(
          eq(scheduleShares.id, parseInt(shareId)),
          eq(scheduleShares.sharedWithUserId, userId),
          eq(scheduleShares.isActive, true)
        )
      )
      .limit(1);

    if (share.length === 0) {
      return res.status(404).json({ message: 'Share not found or access denied' });
    }

    const shareData = share[0];
    
    let scheduledTasks;
    if (shareData.shareType === 'full') {
      scheduledTasks = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, shareData.ownerUserId)
          )
        );
      
      scheduledTasks = scheduledTasks.filter(task => task.scheduledDate !== null);
    } else {
      const taskIds = shareData.selectedTaskIds || [];
      if (taskIds.length === 0) {
        scheduledTasks = [];
      } else {
        scheduledTasks = await db
          .select()
          .from(tasks)
          .where(eq(tasks.userId, shareData.ownerUserId));
        
        scheduledTasks = scheduledTasks.filter(task => 
          taskIds.includes(task.id) && task.scheduledDate !== null
        );
      }
    }

    res.json({
      share: shareData,
      tasks: scheduledTasks,
      permission: shareData.permission
    });
  } catch (error) {
    logger.error('Error fetching shared schedule:', error);
    res.status(500).json({ message: 'Failed to fetch shared schedule' });
  }
});

router.post('/accept/:shareId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { shareId } = req.params;

    const [updated] = await db
      .update(scheduleShares)
      .set({ acceptedAt: new Date() })
      .where(
        and(
          eq(scheduleShares.id, parseInt(shareId)),
          eq(scheduleShares.sharedWithUserId, userId),
          eq(scheduleShares.isActive, true)
        )
      )
      .returning();

    if (!updated) {
      return res.status(404).json({ message: 'Share not found or access denied' });
    }

    res.json({ success: true, message: 'Share accepted successfully' });
  } catch (error) {
    logger.error('Error accepting share:', error);
    res.status(500).json({ message: 'Failed to accept share' });
  }
});

router.post('/decline/:shareId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { shareId } = req.params;

    const [declined] = await db
      .update(scheduleShares)
      .set({ isActive: false, declinedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(scheduleShares.id, parseInt(shareId)),
          eq(scheduleShares.sharedWithUserId, userId),
          eq(scheduleShares.isActive, true)
        )
      )
      .returning();

    if (!declined) {
      return res.status(404).json({ message: 'Share not found or access denied' });
    }

    res.json({ success: true, message: 'Share declined successfully' });
  } catch (error) {
    logger.error('Error declining share:', error);
    res.status(500).json({ message: 'Failed to decline share' });
  }
});

router.patch('/:shareId', async (req, res) => {
  try {
    const parsed = updateShareSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        message: 'Invalid request data', 
        errors: parsed.error.errors 
      });
    }
    
    const userId = (req as any).userId;
    const { shareId } = req.params;
    const { permission, shareType, selectedTaskIds, message } = parsed.data;

    const [updated] = await db
      .update(scheduleShares)
      .set({
        permission: permission,
        shareType: shareType,
        selectedTaskIds: shareType === 'selective' ? selectedTaskIds : null,
        message: message,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(scheduleShares.id, parseInt(shareId)),
          eq(scheduleShares.ownerUserId, userId),
          eq(scheduleShares.isActive, true)
        )
      )
      .returning();

    if (!updated) {
      return res.status(404).json({ message: 'Share not found or access denied' });
    }

    res.json({ success: true, share: updated });
  } catch (error) {
    logger.error('Error updating share:', error);
    res.status(500).json({ message: 'Failed to update share' });
  }
});

router.delete('/:shareId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { shareId } = req.params;

    const [deleted] = await db
      .update(scheduleShares)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(scheduleShares.id, parseInt(shareId)),
          or(
            eq(scheduleShares.ownerUserId, userId),
            eq(scheduleShares.sharedWithUserId, userId)
          )
        )
      )
      .returning();

    if (!deleted) {
      return res.status(404).json({ message: 'Share not found or access denied' });
    }

    res.json({ success: true, message: 'Share removed successfully' });
  } catch (error) {
    logger.error('Error deleting share:', error);
    res.status(500).json({ message: 'Failed to delete share' });
  }
});

router.get('/search-users', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { query } = req.query;

    if (!query || typeof query !== 'string' || query.length < 2) {
      return res.json([]);
    }

    const searchResults = await db
      .select({ id: users.id, username: users.username, email: users.email })
      .from(users)
      .limit(10);

    const filtered = searchResults.filter(user => 
      user.id !== userId && 
      (user.username.toLowerCase().includes(query.toLowerCase()) ||
       (user.email && user.email.toLowerCase().includes(query.toLowerCase())))
    ).slice(0, 5);

    res.json(filtered.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null
    })));
  } catch (error) {
    logger.error('Error searching users:', error);
    res.status(500).json({ message: 'Failed to search users' });
  }
});

// Admin routes for schedule sharing analytics
router.get('/admin/summary', async (req, res) => {
  try {
    const userId = (req as any).userId;
    
    // Check if user is admin
    const user = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (user.length === 0 || user[0].role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Get summary statistics
    const allShares = await db.select().from(scheduleShares);
    
    const totalShares = allShares.length;
    const activeShares = allShares.filter(s => s.isActive).length;
    const pendingShares = allShares.filter(s => s.isActive && !s.acceptedAt).length;
    const acceptedShares = allShares.filter(s => s.isActive && s.acceptedAt).length;
    const declinedShares = allShares.filter(s => !s.isActive).length;
    
    // Permission breakdown
    const viewOnly = allShares.filter(s => s.isActive && s.permission === 'view').length;
    const canEdit = allShares.filter(s => s.isActive && s.permission === 'edit').length;
    const fullAccess = allShares.filter(s => s.isActive && s.permission === 'full').length;
    
    // Share type breakdown
    const fullSchedule = allShares.filter(s => s.isActive && s.shareType === 'full').length;
    const selective = allShares.filter(s => s.isActive && s.shareType === 'selective').length;
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentShares = allShares.filter(s => new Date(s.createdAt) >= sevenDaysAgo).length;
    const recentAccepted = allShares.filter(s => s.acceptedAt && new Date(s.acceptedAt) >= sevenDaysAgo).length;
    
    res.json({
      summary: {
        totalShares,
        activeShares,
        pendingShares,
        acceptedShares,
        declinedShares
      },
      permissions: {
        viewOnly,
        canEdit,
        fullAccess
      },
      shareTypes: {
        fullSchedule,
        selective
      },
      recentActivity: {
        newSharesLast7Days: recentShares,
        acceptedLast7Days: recentAccepted
      }
    });
  } catch (error) {
    logger.error('Error fetching admin summary:', error);
    res.status(500).json({ message: 'Failed to fetch summary' });
  }
});

router.get('/admin/list', async (req, res) => {
  try {
    const userId = (req as any).userId;
    
    // Check if user is admin
    const user = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (user.length === 0 || user[0].role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { status, permission, limit: limitParam, offset: offsetParam } = req.query;
    const limit = parseInt(limitParam as string) || 50;
    const offset = parseInt(offsetParam as string) || 0;
    
    // Get all shares with user info
    let shares = await db
      .select({
        id: scheduleShares.id,
        ownerUserId: scheduleShares.ownerUserId,
        ownerUsername: users.username,
        sharedWithUserId: scheduleShares.sharedWithUserId,
        sharedWithUsername: scheduleShares.sharedWithUsername,
        permission: scheduleShares.permission,
        shareType: scheduleShares.shareType,
        isActive: scheduleShares.isActive,
        acceptedAt: scheduleShares.acceptedAt,
        message: scheduleShares.message,
        createdAt: scheduleShares.createdAt,
        updatedAt: scheduleShares.updatedAt
      })
      .from(scheduleShares)
      .innerJoin(users, eq(users.id, scheduleShares.ownerUserId))
      .orderBy(scheduleShares.createdAt)
      .limit(limit)
      .offset(offset);
    
    // Apply filters
    if (status === 'active') {
      shares = shares.filter(s => s.isActive);
    } else if (status === 'pending') {
      shares = shares.filter(s => s.isActive && !s.acceptedAt);
    } else if (status === 'accepted') {
      shares = shares.filter(s => s.isActive && s.acceptedAt);
    } else if (status === 'declined') {
      shares = shares.filter(s => !s.isActive);
    }
    
    if (permission && ['view', 'edit', 'full'].includes(permission as string)) {
      shares = shares.filter(s => s.permission === permission);
    }
    
    res.json({
      shares,
      pagination: {
        limit,
        offset,
        total: shares.length
      }
    });
  } catch (error) {
    logger.error('Error fetching admin share list:', error);
    res.status(500).json({ message: 'Failed to fetch shares' });
  }
});

router.get('/admin/timeline', async (req, res) => {
  try {
    const userId = (req as any).userId;
    
    // Check if user is admin
    const user = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (user.length === 0 || user[0].role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { days: daysParam } = req.query;
    const days = parseInt(daysParam as string) || 30;
    
    const allShares = await db.select().from(scheduleShares);
    
    // Group shares by date
    const timeline: { [date: string]: { created: number; accepted: number; declined: number } } = {};
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Initialize all dates in range
    for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      timeline[dateKey] = { created: 0, accepted: 0, declined: 0 };
    }
    
    // Count shares by date
    allShares.forEach(share => {
      const createdDate = new Date(share.createdAt).toISOString().split('T')[0];
      if (timeline[createdDate]) {
        timeline[createdDate].created++;
      }
      
      if (share.acceptedAt) {
        const acceptedDate = new Date(share.acceptedAt).toISOString().split('T')[0];
        if (timeline[acceptedDate]) {
          timeline[acceptedDate].accepted++;
        }
      }
      
      if (!share.isActive && share.updatedAt) {
        const declinedDate = new Date(share.updatedAt).toISOString().split('T')[0];
        if (timeline[declinedDate]) {
          timeline[declinedDate].declined++;
        }
      }
    });
    
    // Convert to array format
    const timelineArray = Object.entries(timeline).map(([date, counts]) => ({
      date,
      ...counts
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    res.json({ timeline: timelineArray });
  } catch (error) {
    logger.error('Error fetching admin timeline:', error);
    res.status(500).json({ message: 'Failed to fetch timeline' });
  }
});

// Update a shared task (requires 'edit' or 'full' permission)
router.patch('/shared-task/:taskId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { taskId } = req.params;
    const updates = req.body;

    // Find the task first
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has edit or full permission to this task via a share
    const shares = await db
      .select({
        id: scheduleShares.id,
        permission: scheduleShares.permission,
        shareType: scheduleShares.shareType,
        selectedTaskIds: scheduleShares.selectedTaskIds,
      })
      .from(scheduleShares)
      .where(
        and(
          eq(scheduleShares.ownerUserId, task.userId),
          eq(scheduleShares.sharedWithUserId, userId),
          eq(scheduleShares.isActive, true),
          sql`${scheduleShares.acceptedAt} IS NOT NULL`,
          sql`${scheduleShares.permission} IN ('edit', 'full')`
        )
      );

    if (shares.length === 0) {
      return res.status(403).json({ message: 'You do not have permission to edit this task' });
    }

    // Check if this specific task is included in a selective share
    const validShare = shares.find(share => {
      if (share.shareType === 'full') return true;
      if (share.shareType === 'selective') {
        const taskIds = share.selectedTaskIds || [];
        return taskIds.includes(taskId);
      }
      return false;
    });

    if (!validShare) {
      return res.status(403).json({ message: 'This task is not included in the share' });
    }

    // Update the task (only allow certain fields to be updated)
    const allowedUpdates: any = {};
    if (updates.title !== undefined) allowedUpdates.title = updates.title;
    if (updates.category !== undefined) allowedUpdates.category = updates.category;
    if (updates.priority !== undefined) allowedUpdates.priority = updates.priority;
    if (updates.timer !== undefined) allowedUpdates.timer = updates.timer;
    if (updates.scheduledDate !== undefined) allowedUpdates.scheduledDate = updates.scheduledDate;
    if (updates.notes !== undefined) allowedUpdates.notes = updates.notes;
    if (updates.youtubeUrl !== undefined) allowedUpdates.youtubeUrl = updates.youtubeUrl;

    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(400).json({ message: 'No valid updates provided' });
    }

    const [updatedTask] = await db
      .update(tasks)
      .set(allowedUpdates)
      .where(eq(tasks.id, taskId))
      .returning();

    logger.info('Shared task updated', { taskId, userId, updates: Object.keys(allowedUpdates) });
    res.json({ success: true, task: updatedTask });
  } catch (error) {
    logger.error('Error updating shared task:', error);
    res.status(500).json({ message: 'Failed to update shared task' });
  }
});

// Delete a shared task (requires 'full' permission only)
router.delete('/shared-task/:taskId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { taskId } = req.params;

    // Find the task first
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has FULL permission to this task via a share
    const shares = await db
      .select({
        id: scheduleShares.id,
        permission: scheduleShares.permission,
        shareType: scheduleShares.shareType,
        selectedTaskIds: scheduleShares.selectedTaskIds,
      })
      .from(scheduleShares)
      .where(
        and(
          eq(scheduleShares.ownerUserId, task.userId),
          eq(scheduleShares.sharedWithUserId, userId),
          eq(scheduleShares.isActive, true),
          sql`${scheduleShares.acceptedAt} IS NOT NULL`,
          eq(scheduleShares.permission, 'full')
        )
      );

    if (shares.length === 0) {
      return res.status(403).json({ message: 'You do not have permission to delete this task. Full access is required.' });
    }

    // Check if this specific task is included in a selective share
    const validShare = shares.find(share => {
      if (share.shareType === 'full') return true;
      if (share.shareType === 'selective') {
        const taskIds = share.selectedTaskIds || [];
        return taskIds.includes(taskId);
      }
      return false;
    });

    if (!validShare) {
      return res.status(403).json({ message: 'This task is not included in the share' });
    }

    // Delete the task
    await db.delete(tasks).where(eq(tasks.id, taskId));

    logger.info('Shared task deleted', { taskId, userId });
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    logger.error('Error deleting shared task:', error);
    res.status(500).json({ message: 'Failed to delete shared task' });
  }
});

export default router;
