/**
 * Offline Data Sync Service
 * Syncs task data to IndexedDB while online so it's available for offline report generation
 */

interface TaskData {
  id: string;
  title: string;
  category: string;
  priority: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  timerDuration: number;
  archived: boolean;
}

interface OfflineCache {
  tasks: TaskData[];
  lastSync: string;
}

const DB_NAME = 'AIChecklistOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offlineCache';

class OfflineDataSyncService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  async syncTasks(tasks: any[]): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    const cacheData: OfflineCache = {
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        category: t.category || 'Uncategorized',
        priority: t.priority || 'Medium',
        completed: t.completed || false,
        completedAt: t.completedAt,
        createdAt: t.createdAt,
        timerDuration: t.timerDuration || 0,
        archived: t.archived || false,
      })),
      lastSync: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.put(cacheData, 'tasks');
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('Tasks synced to offline storage:', tasks.length);
        resolve();
      };
    });
  }

  async getCachedTasks(): Promise<OfflineCache | null> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.get('tasks');
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  }

  async hasCachedData(): Promise<boolean> {
    try {
      const cached = await this.getCachedTasks();
      return cached !== null && cached.tasks.length > 0;
    } catch (error) {
      console.error('Error checking cached data:', error);
      return false;
    }
  }

  async clearCache(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.delete('tasks');
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('Offline cache cleared');
        resolve();
      };
    });
  }
}

export const offlineDataSync = new OfflineDataSyncService();
export type { TaskData, OfflineCache };
