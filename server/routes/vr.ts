import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';
import { logger } from '../logger';
import * as bcrypt from 'bcrypt';

const router = express.Router();

const JWT_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('SESSION_SECRET or JWT_SECRET environment variable is required for VR authentication');
}

type VRDeviceType = 'meta' | 'htc' | 'apple' | 'unknown';

interface VRTokenPayload {
  userId: number;
  email: string;
  deviceType: VRDeviceType;
}

const validateDeviceType = (deviceType: string | undefined): VRDeviceType => {
  if (deviceType === 'meta' || deviceType === 'htc' || deviceType === 'apple') {
    return deviceType;
  }
  return 'unknown';
};

const getDeviceLabel = (deviceType: VRDeviceType): string => {
  switch (deviceType) {
    case 'meta': return 'Meta Quest';
    case 'htc': return 'HTC Vive / Valve Index';
    case 'apple': return 'Apple Vision Pro';
    default: return 'Unknown VR Device';
  }
};

const createVRToken = (userId: number, email: string, deviceType: VRDeviceType): string => {
  return jwt.sign({ userId, email, deviceType }, JWT_SECRET, { expiresIn: '24h' });
};

const verifyVRToken = (token: string): VRTokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as VRTokenPayload;
  } catch {
    return null;
  }
};

const vrAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyVRToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  (req as any).vrUser = decoded;
  next();
};

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password, deviceType: rawDeviceType } = req.body;
    const deviceType = validateDeviceType(rawDeviceType);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      logger.warn('VR login failed: user not found', { email, deviceType, device: getDeviceLabel(deviceType) });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password || '');
    if (!isValidPassword) {
      logger.warn('VR login failed: invalid password', { email, deviceType, device: getDeviceLabel(deviceType) });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createVRToken(user.id, user.email, deviceType);
    
    logger.info('VR login successful', { 
      userId: user.id, 
      email: user.email, 
      deviceType, 
      device: getDeviceLabel(deviceType) 
    });
    
    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username
      }
    });
  } catch (error) {
    logger.error('VR login error', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/tasks', vrAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, deviceType } = (req as any).vrUser;

    logger.info('VR tasks requested', { 
      userId, 
      deviceType, 
      device: getDeviceLabel(deviceType) 
    });

    const userTasks = await storage.getAllTasks(userId);
    
    const vrTasks = userTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.notes || '',
      completed: task.completed,
      priority: task.priority,
      dueDate: task.deadline || null,
      category: task.category
    }));

    res.json({ tasks: vrTasks });
  } catch (error) {
    logger.error('VR get tasks error', { error });
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/sync', vrAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, deviceType } = (req as any).vrUser;
    const { action, taskId, data } = req.body;

    logger.info('VR sync action received', { 
      userId, 
      action, 
      taskId, 
      deviceType, 
      device: getDeviceLabel(deviceType) 
    });

    switch (action) {
      case 'complete_task':
        if (taskId) {
          await storage.updateTask(taskId, { completed: true });
          logger.info('VR task completed', { userId, taskId, deviceType, device: getDeviceLabel(deviceType) });
        }
        break;

      case 'uncomplete_task':
        if (taskId) {
          await storage.updateTask(taskId, { completed: false });
          logger.info('VR task uncompleted', { userId, taskId, deviceType, device: getDeviceLabel(deviceType) });
        }
        break;

      case 'update_progress':
        if (taskId && data?.progress !== undefined) {
          logger.info('VR task progress updated', { userId, taskId, progress: data.progress, deviceType, device: getDeviceLabel(deviceType) });
        }
        break;

      case 'vr_session_start':
        logger.info('VR session started', { userId, deviceType, device: getDeviceLabel(deviceType), timestamp: new Date().toISOString() });
        break;

      case 'vr_session_end':
        logger.info('VR session ended', { userId, deviceType, device: getDeviceLabel(deviceType), timestamp: new Date().toISOString(), data });
        break;

      default:
        logger.warn('Unknown VR sync action', { userId, action, deviceType, device: getDeviceLabel(deviceType) });
    }

    res.json({ status: 'synced', action, taskId });
  } catch (error) {
    logger.error('VR sync error', { error });
    res.status(500).json({ error: 'Sync failed' });
  }
});

router.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    service: 'VR Backend API',
    timestamp: new Date().toISOString()
  });
});

export default router;
