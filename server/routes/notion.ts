import { Router, Request, Response, NextFunction } from 'express';
import { Client } from '@notionhq/client';
import { storage } from '../storage';
import { logger } from '../logger';

const router = Router();

interface NotionDatabase {
  id: string;
  title: string;
  icon?: string;
}

interface NotionTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

async function getNotionClient(userId: number): Promise<Client | null> {
  const user = await storage.getUserById(userId);
  if (!user?.notionApiKey) {
    return null;
  }
  return new Client({ auth: user.notionApiKey });
}

router.post('/connect', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;
    const { apiKey } = req.body;

    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({ error: 'API key is required' });
    }

    const notion = new Client({ auth: apiKey });
    
    try {
      await notion.users.me({});
    } catch (error: any) {
      logger.error('Invalid Notion API key', { error: error.message });
      return res.status(400).json({ error: 'Invalid Notion API key. Please check your integration token.' });
    }

    await storage.updateUserNotionSettings(userId, { notionApiKey: apiKey });
    
    logger.info('Notion connected successfully', { userId });
    res.json({ success: true, message: 'Notion connected successfully' });
  } catch (error: any) {
    logger.error('Error connecting to Notion', { error: error.message });
    res.status(500).json({ error: 'Failed to connect to Notion' });
  }
});

router.post('/disconnect', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;
    
    await storage.updateUserNotionSettings(userId, { 
      notionApiKey: null,
      notionDefaultDatabaseId: null 
    });
    
    logger.info('Notion disconnected', { userId });
    res.json({ success: true, message: 'Notion disconnected' });
  } catch (error: any) {
    logger.error('Error disconnecting Notion', { error: error.message });
    res.status(500).json({ error: 'Failed to disconnect Notion' });
  }
});

router.get('/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;
    const user = await storage.getUserById(userId);
    
    const connected = !!user?.notionApiKey;
    let workspaceName = null;
    
    if (connected && user?.notionApiKey) {
      try {
        const notion = new Client({ auth: user.notionApiKey });
        const me = await notion.users.me({});
        workspaceName = me.name || 'Connected Workspace';
      } catch (error) {
        await storage.updateUserNotionSettings(userId, { notionApiKey: null });
        return res.json({ connected: false, defaultDatabaseId: null });
      }
    }
    
    res.json({ 
      connected,
      workspaceName,
      defaultDatabaseId: user?.notionDefaultDatabaseId || null
    });
  } catch (error: any) {
    logger.error('Error checking Notion status', { error: error.message });
    res.status(500).json({ error: 'Failed to check Notion status' });
  }
});

router.get('/databases', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;
    const notion = await getNotionClient(userId);
    
    if (!notion) {
      return res.status(400).json({ error: 'Notion not connected' });
    }

    const response = await notion.search({
      filter: { property: 'object', value: 'database' as const },
      page_size: 100
    });

    const databases: NotionDatabase[] = response.results
      .filter((result: any) => result.object === 'database')
      .map((db: any) => ({
        id: db.id,
        title: db.title?.[0]?.plain_text || 'Untitled Database',
        icon: db.icon?.emoji || db.icon?.external?.url || null
      }));

    res.json({ databases });
  } catch (error: any) {
    logger.error('Error fetching Notion databases', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch databases' });
  }
});

router.post('/set-default-database', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;
    const { databaseId } = req.body;

    await storage.updateUserNotionSettings(userId, { notionDefaultDatabaseId: databaseId || null });
    
    logger.info('Notion default database set', { userId, databaseId });
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Error setting default database', { error: error.message });
    res.status(500).json({ error: 'Failed to set default database' });
  }
});

router.post('/send-task', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;
    const { taskId, databaseId } = req.body;

    const notion = await getNotionClient(userId);
    if (!notion) {
      return res.status(400).json({ error: 'Notion not connected' });
    }

    const task = await storage.getTask(taskId, userId);
    if (!task || task.userId !== userId) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const user = await storage.getUserById(userId);
    const targetDatabaseId = databaseId || user?.notionDefaultDatabaseId;
    
    if (!targetDatabaseId) {
      return res.status(400).json({ error: 'No database selected. Please set a default database or specify one.' });
    }

    const dbInfo = await notion.databases.retrieve({ database_id: targetDatabaseId }) as any;
    const properties: any = dbInfo.properties || {};
    
    const pageProperties: any = {};
    
    const titleProperty = Object.entries(properties).find(([_, prop]: [string, any]) => prop.type === 'title');
    if (titleProperty) {
      pageProperties[titleProperty[0]] = {
        title: [{ text: { content: task.title } }]
      };
    }

    const statusProperty = Object.entries(properties).find(([key, prop]: [string, any]) => 
      prop.type === 'checkbox' || (prop.type === 'status') || (prop.type === 'select' && key.toLowerCase().includes('status'))
    );
    if (statusProperty) {
      const [name, prop] = statusProperty as [string, any];
      if (prop.type === 'checkbox') {
        pageProperties[name] = { checkbox: task.completed };
      } else if (prop.type === 'status') {
        pageProperties[name] = { 
          status: { name: task.completed ? 'Done' : 'To Do' }
        };
      }
    }

    const dateProperty = Object.entries(properties).find(([key, prop]: [string, any]) => 
      prop.type === 'date' && (key.toLowerCase().includes('due') || key.toLowerCase().includes('date'))
    );
    if (dateProperty && task.scheduledDate) {
      const dateStr = task.scheduledDate instanceof Date 
        ? task.scheduledDate.toISOString().split('T')[0]
        : String(task.scheduledDate).split('T')[0];
      pageProperties[dateProperty[0]] = {
        date: { start: dateStr }
      };
    }

    const priorityProperty = Object.entries(properties).find(([key, prop]: [string, any]) => 
      prop.type === 'select' && key.toLowerCase().includes('priority')
    );
    if (priorityProperty && task.priority) {
      const priorityMap: { [key: string]: string } = {
        'High': 'High',
        'Medium': 'Medium', 
        'Low': 'Low'
      };
      pageProperties[priorityProperty[0]] = {
        select: { name: priorityMap[task.priority] || task.priority }
      };
    }

    const children: any[] = [];
    
    if (task.notes) {
      children.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: task.notes } }]
        }
      });
    }

    children.push({
      object: 'block',
      type: 'callout',
      callout: {
        icon: { emoji: '✅' },
        rich_text: [{ 
          type: 'text', 
          text: { content: `Sent from AIChecklist.io • Category: ${task.category || 'None'} • Priority: ${task.priority || 'None'}` } 
        }]
      }
    });

    const page = await notion.pages.create({
      parent: { database_id: targetDatabaseId },
      properties: pageProperties,
      children: children.length > 0 ? children : undefined
    });

    await storage.updateTask(taskId, { 
      notionPageId: page.id,
      syncedToNotion: true,
      notionSyncedAt: new Date()
    });

    logger.info('Task sent to Notion', { userId, taskId, pageId: page.id });
    res.json({ 
      success: true, 
      pageId: page.id,
      pageUrl: `https://notion.so/${page.id.replace(/-/g, '')}`
    });
  } catch (error: any) {
    logger.error('Error sending task to Notion', { error: error.message, stack: error.stack });
    res.status(500).json({ error: `Failed to send task to Notion: ${error.message}` });
  }
});

router.get('/import-tasks', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;
    const { databaseId } = req.query;

    const notion = await getNotionClient(userId);
    if (!notion) {
      return res.status(400).json({ error: 'Notion not connected' });
    }

    const user = await storage.getUserById(userId);
    const targetDatabaseId = (databaseId as string) || user?.notionDefaultDatabaseId;
    
    if (!targetDatabaseId) {
      return res.status(400).json({ error: 'No database selected' });
    }

    const response = await notion.databases.query({
      database_id: targetDatabaseId,
      page_size: 100
    });

    const tasks: NotionTask[] = response.results.map((page: any) => {
      const titleProperty = Object.values(page.properties).find((prop: any) => prop.type === 'title') as any;
      const title = titleProperty?.title?.[0]?.plain_text || 'Untitled';

      const statusProperty = Object.values(page.properties).find((prop: any) => 
        prop.type === 'checkbox' || prop.type === 'status'
      ) as any;
      let completed = false;
      if (statusProperty?.type === 'checkbox') {
        completed = statusProperty.checkbox;
      } else if (statusProperty?.type === 'status') {
        completed = statusProperty.status?.name?.toLowerCase() === 'done';
      }

      const dateProperty = Object.values(page.properties).find((prop: any) => prop.type === 'date') as any;
      const dueDate = dateProperty?.date?.start || undefined;

      return {
        id: page.id,
        title,
        completed,
        dueDate
      };
    });

    res.json({ tasks, count: tasks.length });
  } catch (error: any) {
    logger.error('Error importing tasks from Notion', { error: error.message });
    res.status(500).json({ error: 'Failed to import tasks from Notion' });
  }
});

router.post('/import-task', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number;
    const { notionPageId } = req.body;

    const notion = await getNotionClient(userId);
    if (!notion) {
      return res.status(400).json({ error: 'Notion not connected' });
    }

    const page = await notion.pages.retrieve({ page_id: notionPageId }) as any;
    
    const titleProperty = Object.values(page.properties).find((prop: any) => prop.type === 'title') as any;
    const title = titleProperty?.title?.[0]?.plain_text || 'Untitled Task from Notion';

    const statusProperty = Object.values(page.properties).find((prop: any) => 
      prop.type === 'checkbox' || prop.type === 'status'
    ) as any;
    let completed = false;
    if (statusProperty?.type === 'checkbox') {
      completed = statusProperty.checkbox;
    } else if (statusProperty?.type === 'status') {
      completed = statusProperty.status?.name?.toLowerCase() === 'done';
    }

    const dateProperty = Object.values(page.properties).find((prop: any) => prop.type === 'date') as any;
    const scheduledDate = dateProperty?.date?.start ? new Date(dateProperty.date.start) : null;

    const task = await storage.createTask({
      userId,
      title,
      completed,
      scheduledDate,
      category: 'Notion Import',
      priority: 'Medium',
      notionPageId,
      syncedToNotion: true,
      notionSyncedAt: new Date()
    });

    logger.info('Task imported from Notion', { userId, taskId: task.id, notionPageId });
    res.json({ success: true, task });
  } catch (error: any) {
    logger.error('Error importing task from Notion', { error: error.message });
    res.status(500).json({ error: 'Failed to import task from Notion' });
  }
});

export default router;
