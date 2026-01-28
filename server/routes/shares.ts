import { Router } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../db';
import { shares, sessions } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import { logger } from '../logger';

// Get user ID from database session
async function getUserIdFromSession(sessionId: string): Promise<number | null> {
  try {
    const result = await db
      .select({ userId: sessions.userId })
      .from(sessions)
      .where(eq(sessions.sessionId, sessionId))
      .limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    // Update last activity timestamp
    await db
      .update(sessions)
      .set({ lastActivityAt: new Date() })
      .where(eq(sessions.sessionId, sessionId));
    
    return result[0].userId;
  } catch (error) {
    logger.error('Error getting user from session', { error, sessionId });
    return null;
  }
}

const router = Router();

// Auth middleware for protected routes
async function requireAuth(req: any, res: any, next: any) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const userId = sessionId ? await getUserIdFromSession(sessionId) : null;
  
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  req.userId = userId;
  next();
}

// Create a new share (requires auth)
router.post('/create', requireAuth, async (req, res) => {
  try {
    const { type, data, settings } = req.body;
    const userId = (req as any).userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const shareId = randomUUID();
    const expiresAt = settings.expiryDays > 0 
      ? new Date(Date.now() + settings.expiryDays * 24 * 60 * 60 * 1000)
      : null;

    // Ensure data is properly stringified, fallback to empty object if null/undefined
    const shareData = data ? JSON.stringify(data) : JSON.stringify({});
    
    console.log('Creating share with data:', { type, dataExists: !!data, settings });

    const [share] = await db.insert(shares).values({
      id: shareId,
      userId,
      type,
      data: shareData,
      isPublic: settings.isPublic || false,
      requiresPassword: settings.requiresPassword || false,
      password: settings.password || null,
      description: settings.description || null,
      expiresAt: expiresAt || null
    }).returning();

    res.json({ shareId: share.id, url: `/shared/${share.id}` });
  } catch (error) {
    console.error('Error creating share:', error);
    res.status(500).json({ message: 'Failed to create share' });
  }
});

// Get share by ID (public access, no auth required)
router.get('/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;
    const { password } = req.query;

    const [share] = await db
      .select()
      .from(shares)
      .where(
        and(
          eq(shares.id, shareId),
          shares.expiresAt ? gt(shares.expiresAt, new Date()) : undefined
        )
      );

    if (!share) {
      return res.status(404).json({ message: 'Share not found or expired' });
    }

    // Check if public access is allowed
    if (!share.isPublic) {
      // For private shares, check if user is authenticated and is the owner
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      const userId = sessionId ? getUserIdFromSession(sessionId) : null;
      
      if (!userId || userId !== share.userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Check password if required
    if (share.requiresPassword && share.password !== password) {
      return res.status(401).json({ 
        message: 'Password required',
        requiresPassword: true 
      });
    }

    // Increment view count
    await db
      .update(shares)
      .set({ 
        viewCount: (share.viewCount || 0) + 1,
        lastViewedAt: new Date()
      })
      .where(eq(shares.id, shareId));

    // Parse data and return
    const shareData = {
      id: share.id,
      type: share.type,
      data: JSON.parse(share.data),
      description: share.description,
      createdAt: share.createdAt,
      viewCount: share.viewCount + 1
    };

    res.json(shareData);
  } catch (error) {
    console.error('Error fetching share:', error);
    res.status(500).json({ message: 'Failed to fetch share' });
  }
});

// Get user's shares
router.get('/user/list', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userShares = await db
      .select({
        id: shares.id,
        type: shares.type,
        description: shares.description,
        isPublic: shares.isPublic,
        viewCount: shares.viewCount,
        createdAt: shares.createdAt,
        expiresAt: shares.expiresAt,
        lastViewedAt: shares.lastViewedAt
      })
      .from(shares)
      .where(eq(shares.userId, userId))
      .orderBy(shares.createdAt);

    res.json(userShares);
  } catch (error) {
    console.error('Error fetching user shares:', error);
    res.status(500).json({ message: 'Failed to fetch shares' });
  }
});

// Delete a share
router.delete('/:shareId', requireAuth, async (req, res) => {
  try {
    const { shareId } = req.params;
    const userId = (req as any).userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const [deletedShare] = await db
      .delete(shares)
      .where(and(eq(shares.id, shareId), eq(shares.userId, userId)))
      .returning();

    if (!deletedShare) {
      return res.status(404).json({ message: 'Share not found' });
    }

    res.json({ message: 'Share deleted successfully' });
  } catch (error) {
    console.error('Error deleting share:', error);
    res.status(500).json({ message: 'Failed to delete share' });
  }
});

export default router;