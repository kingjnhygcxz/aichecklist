type ConnectionStatus = 'online' | 'offline' | 'checking';
type ConnectionListener = (status: ConnectionStatus) => void;

class ConnectionMonitor {
  private status: ConnectionStatus = 'checking';
  private listeners: Set<ConnectionListener> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Initial check
    this.updateStatus();

    // Listen to browser online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Periodic connectivity check (every 30 seconds)
    this.checkInterval = setInterval(() => {
      this.verifyConnection();
    }, 30000);
  }

  private handleOnline = () => {
    console.log('Browser reports online');
    this.verifyConnection();
  };

  private handleOffline = () => {
    console.log('Browser reports offline');
    this.setStatus('offline');
  };

  private async verifyConnection(): Promise<void> {
    try {
      // Try to fetch a lightweight endpoint with no-cache
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        this.setStatus('online');
      } else {
        this.setStatus('offline');
      }
    } catch (error) {
      console.log('Connection verification failed:', error);
      this.setStatus('offline');
    }
  }

  private updateStatus() {
    if (navigator.onLine) {
      this.verifyConnection();
    } else {
      this.setStatus('offline');
    }
  }

  private setStatus(newStatus: ConnectionStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      console.log('Connection status changed:', newStatus);
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.status);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  isOnline(): boolean {
    return this.status === 'online';
  }

  subscribe(listener: ConnectionListener): () => void {
    this.listeners.add(listener);
    
    // Immediately notify with current status
    listener(this.status);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  destroy() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    this.listeners.clear();
  }
}

export const connectionMonitor = new ConnectionMonitor();
export type { ConnectionStatus };
