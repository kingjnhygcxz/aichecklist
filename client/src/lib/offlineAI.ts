export interface OfflineAIProgress {
  progress: number;
  timeElapsed: number;
  text: string;
}

export class OfflineAIService {
  private isAvailable = false;

  async initialize(onProgress?: (progress: OfflineAIProgress) => void): Promise<void> {
    console.log('Offline AI feature is disabled in this build');
    throw new Error('Offline AI is not available. Please use cloud AI features.');
  }

  async generateCompletion(
    systemPrompt: string,
    userMessage: string,
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    throw new Error('Offline AI is not available. Please use cloud AI features.');
  }

  async chat(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>): Promise<string> {
    throw new Error('Offline AI is not available. Please use cloud AI features.');
  }

  isReady(): boolean {
    return false;
  }

  getModelId(): string {
    return 'disabled';
  }

  async unload(): Promise<void> {
  }
}

export const offlineAI = new OfflineAIService();
