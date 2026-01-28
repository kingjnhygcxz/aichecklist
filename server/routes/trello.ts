import { Router, Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { logger } from '../logger';

const router = Router();

const TRELLO_API_BASE = 'https://api.trello.com/1';

interface TrelloBoard {
  id: string;
  name: string;
}

interface TrelloList {
  id: string;
  name: string;
}

interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  due: string | null;
  closed: boolean;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

async function trelloRequest<T>(
  endpoint: string,
  apiKey: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${TRELLO_API_BASE}${endpoint}${separator}key=${apiKey}&token=${token}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Trello API error: ${response.status} - ${error}`);
  }
  
  return response.json();
}

async function getTrelloCredentials(userId: number): Promise<{ apiKey: string; token: string } | null> {
  const user = await storage.getUserById(userId);
  if (!user?.trelloApiKey || !user?.trelloToken) {
    return null;
  }
  return { apiKey: user.trelloApiKey, token: user.trelloToken };
}

router.post('/connect', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;
    const { apiKey, token } = req.body;

    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({ error: 'API key is required' });
    }
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token is required' });
    }

    try {
      await trelloRequest<{ id: string; username: string }>('/members/me', apiKey, token);
    } catch (error: any) {
      logger.error('Invalid Trello credentials', { error: error.message });
      return res.status(400).json({ error: 'Invalid Trello credentials. Please check your API key and token.' });
    }

    await storage.updateUserTrelloSettings(userId, { trelloApiKey: apiKey, trelloToken: token });
    
    logger.info('Trello connected successfully', { userId });
    res.json({ success: true, message: 'Trello connected successfully' });
  } catch (error: any) {
    logger.error('Error connecting to Trello', { error: error.message });
    res.status(500).json({ error: 'Failed to connect to Trello' });
  }
});

router.post('/disconnect', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;
    
    await storage.updateUserTrelloSettings(userId, { 
      trelloApiKey: null,
      trelloToken: null,
      trelloDefaultBoardId: null,
      trelloDefaultListId: null
    });
    
    logger.info('Trello disconnected', { userId });
    res.json({ success: true, message: 'Trello disconnected' });
  } catch (error: any) {
    logger.error('Error disconnecting Trello', { error: error.message });
    res.status(500).json({ error: 'Failed to disconnect Trello' });
  }
});

router.get('/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;
    const user = await storage.getUserById(userId);
    
    const connected = !!(user?.trelloApiKey && user?.trelloToken);
    let username = null;
    
    if (connected && user?.trelloApiKey && user?.trelloToken) {
      try {
        const member = await trelloRequest<{ id: string; username: string; fullName: string }>(
          '/members/me',
          user.trelloApiKey,
          user.trelloToken
        );
        username = member.fullName || member.username || 'Connected User';
      } catch (error) {
        await storage.updateUserTrelloSettings(userId, { 
          trelloApiKey: null, 
          trelloToken: null,
          trelloDefaultBoardId: null,
          trelloDefaultListId: null
        });
        return res.json({ 
          connected: false, 
          defaultBoardId: null,
          defaultListId: null 
        });
      }
    }
    
    res.json({ 
      connected,
      username,
      defaultBoardId: user?.trelloDefaultBoardId || null,
      defaultListId: user?.trelloDefaultListId || null
    });
  } catch (error: any) {
    logger.error('Error checking Trello status', { error: error.message });
    res.status(500).json({ error: 'Failed to check Trello status' });
  }
});

router.get('/boards', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;
    const credentials = await getTrelloCredentials(userId);
    
    if (!credentials) {
      return res.status(400).json({ error: 'Trello not connected' });
    }

    const boards = await trelloRequest<TrelloBoard[]>(
      '/members/me/boards?filter=open&fields=id,name',
      credentials.apiKey,
      credentials.token
    );

    res.json({ boards: boards.map(b => ({ id: b.id, name: b.name })) });
  } catch (error: any) {
    logger.error('Error fetching Trello boards', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

router.get('/lists', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;
    const { boardId } = req.query;

    if (!boardId || typeof boardId !== 'string') {
      return res.status(400).json({ error: 'boardId is required' });
    }

    const credentials = await getTrelloCredentials(userId);
    
    if (!credentials) {
      return res.status(400).json({ error: 'Trello not connected' });
    }

    const lists = await trelloRequest<TrelloList[]>(
      `/boards/${boardId}/lists?filter=open&fields=id,name`,
      credentials.apiKey,
      credentials.token
    );

    res.json({ lists: lists.map(l => ({ id: l.id, name: l.name })) });
  } catch (error: any) {
    logger.error('Error fetching Trello lists', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

router.post('/set-default-board', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;
    const { boardId, listId } = req.body;

    await storage.updateUserTrelloSettings(userId, { 
      trelloDefaultBoardId: boardId || null,
      trelloDefaultListId: listId || null
    });
    
    logger.info('Trello default board/list set', { userId, boardId, listId });
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Error setting default board', { error: error.message });
    res.status(500).json({ error: 'Failed to set default board' });
  }
});

router.post('/send-task', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;
    const { taskId, boardId, listId } = req.body;

    const credentials = await getTrelloCredentials(userId);
    if (!credentials) {
      return res.status(400).json({ error: 'Trello not connected' });
    }

    const task = await storage.getTask(taskId, userId);
    if (!task || task.userId !== userId) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const user = await storage.getUserById(userId);
    const targetListId = listId || user?.trelloDefaultListId;
    
    if (!targetListId) {
      return res.status(400).json({ error: 'No list selected. Please set a default list or specify one.' });
    }

    const cardData: any = {
      name: task.title,
      idList: targetListId,
    };

    if (task.notes) {
      cardData.desc = `${task.notes}\n\n---\nSent from AIChecklist.io • Category: ${task.category || 'None'} • Priority: ${task.priority || 'None'}`;
    } else {
      cardData.desc = `Sent from AIChecklist.io • Category: ${task.category || 'None'} • Priority: ${task.priority || 'None'}`;
    }

    if (task.scheduledDate) {
      const dateStr = task.scheduledDate instanceof Date 
        ? task.scheduledDate.toISOString()
        : String(task.scheduledDate);
      cardData.due = dateStr;
    }

    const card = await trelloRequest<TrelloCard>(
      '/cards',
      credentials.apiKey,
      credentials.token,
      {
        method: 'POST',
        body: JSON.stringify(cardData),
      }
    );

    await storage.updateTask(taskId, { 
      trelloCardId: card.id,
      syncedToTrello: true,
      trelloSyncedAt: new Date()
    });

    logger.info('Task sent to Trello', { userId, taskId, cardId: card.id });
    res.json({ 
      success: true, 
      cardId: card.id,
      cardUrl: `https://trello.com/c/${card.id}`
    });
  } catch (error: any) {
    logger.error('Error sending task to Trello', { error: error.message, stack: error.stack });
    res.status(500).json({ error: `Failed to send task to Trello: ${error.message}` });
  }
});

router.get('/import-cards', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;
    const { boardId, listId } = req.query;

    if (!listId || typeof listId !== 'string') {
      return res.status(400).json({ error: 'listId is required' });
    }

    const credentials = await getTrelloCredentials(userId);
    if (!credentials) {
      return res.status(400).json({ error: 'Trello not connected' });
    }

    const cards = await trelloRequest<TrelloCard[]>(
      `/lists/${listId}/cards?filter=open&fields=id,name,desc,due,closed`,
      credentials.apiKey,
      credentials.token
    );

    const formattedCards = cards.map(card => ({
      id: card.id,
      title: card.name,
      description: card.desc,
      dueDate: card.due,
      completed: card.closed
    }));

    res.json({ cards: formattedCards, count: formattedCards.length });
  } catch (error: any) {
    logger.error('Error importing cards from Trello', { error: error.message });
    res.status(500).json({ error: 'Failed to import cards from Trello' });
  }
});

router.post('/import-card', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;
    const { trelloCardId } = req.body;

    if (!trelloCardId || typeof trelloCardId !== 'string') {
      return res.status(400).json({ error: 'trelloCardId is required' });
    }

    const credentials = await getTrelloCredentials(userId);
    if (!credentials) {
      return res.status(400).json({ error: 'Trello not connected' });
    }

    const card = await trelloRequest<TrelloCard>(
      `/cards/${trelloCardId}?fields=id,name,desc,due,closed`,
      credentials.apiKey,
      credentials.token
    );

    const scheduledDate = card.due ? new Date(card.due) : null;

    const task = await storage.createTask({
      userId,
      title: card.name || 'Untitled Task from Trello',
      completed: card.closed,
      scheduledDate,
      category: 'Trello Import',
      priority: 'Medium',
      notes: card.desc || null,
      trelloCardId: card.id,
      syncedToTrello: true,
      trelloSyncedAt: new Date()
    });

    logger.info('Task imported from Trello', { userId, taskId: task.id, trelloCardId });
    res.json({ success: true, task });
  } catch (error: any) {
    logger.error('Error importing task from Trello', { error: error.message });
    res.status(500).json({ error: 'Failed to import task from Trello' });
  }
});

export default router;
