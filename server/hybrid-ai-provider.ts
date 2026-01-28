import OpenAI from "openai";
import { chatWithGemini, geminiCompletion } from "./gemini";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = "gpt-4o";

export interface AIResponse {
  content: string;
  provider: 'openai' | 'gemini' | 'offline';
}

export interface AIGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

/**
 * Hybrid AI Provider - automatically falls back between providers
 * Priority: OpenAI → Gemini → Offline (handled client-side)
 * 
 * For offline mode, the client should detect connection status
 * and use WebLLM directly in the browser.
 */
export class HybridAIProvider {
  
  /**
   * Generate AI completion with automatic fallback
   * Tries OpenAI first, then Gemini
   */
  async generateCompletion(
    systemPrompt: string,
    userMessage: string,
    options: AIGenerationOptions = {}
  ): Promise<AIResponse> {
    const { temperature = 0.7, maxTokens = 2048, jsonMode = false } = options;

    // Try OpenAI first
    try {
      console.log('Attempting OpenAI completion...');
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature,
        max_tokens: maxTokens,
        ...(jsonMode && { response_format: { type: "json_object" } })
      });

      const content = response.choices[0].message.content || '';
      console.log('OpenAI completion successful');
      
      return {
        content,
        provider: 'openai'
      };
    } catch (openaiError) {
      console.log('OpenAI failed, attempting Gemini fallback:', 
        openaiError instanceof Error ? openaiError.message : String(openaiError)
      );

      // Fallback to Gemini
      try {
        const content = await geminiCompletion(systemPrompt, userMessage, { 
          jsonMode,
          temperature,
          maxTokens 
        });
        
        console.log('Gemini fallback successful');
        
        return {
          content,
          provider: 'gemini'
        };
      } catch (geminiError) {
        console.error('Both OpenAI and Gemini failed:', {
          openaiError: openaiError instanceof Error ? openaiError.message : String(openaiError),
          geminiError: geminiError instanceof Error ? geminiError.message : String(geminiError)
        });
        
        throw new Error('All cloud AI providers failed. Please check your connection or try offline mode.');
      }
    }
  }

  /**
   * Chat completion with conversation history
   */
  async chat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options: AIGenerationOptions = {}
  ): Promise<AIResponse> {
    const { temperature = 0.7, maxTokens = 2048 } = options;

    // Try OpenAI first
    try {
      console.log('Attempting OpenAI chat...');
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages,
        temperature,
        max_tokens: maxTokens
      });

      const content = response.choices[0].message.content || '';
      console.log('OpenAI chat successful');
      
      return {
        content,
        provider: 'openai'
      };
    } catch (openaiError) {
      console.log('OpenAI chat failed, attempting Gemini fallback');

      // Fallback to Gemini
      try {
        // Extract system and user messages for Gemini
        const systemMessages = messages.filter(m => m.role === 'system');
        const userMessages = messages.filter(m => m.role !== 'system');
        
        const systemPrompt = systemMessages.map(m => m.content).join('\n') || 
          'You are a helpful AI assistant.';
        const conversationHistory = userMessages.map(m => 
          `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
        ).join('\n');

        const content = await chatWithGemini(systemPrompt, conversationHistory, { 
          temperature,
          maxTokens 
        });
        
        console.log('Gemini chat fallback successful');
        
        return {
          content,
          provider: 'gemini'
        };
      } catch (geminiError) {
        console.error('Both OpenAI and Gemini chat failed');
        throw new Error('All cloud AI providers failed. Please check your connection or try offline mode.');
      }
    }
  }

  /**
   * Generate a task report using AI
   */
  async generateReport(
    reportType: string,
    data: any,
    options: AIGenerationOptions = {}
  ): Promise<AIResponse> {
    const systemPrompt = `You are an AI assistant that generates detailed, professional reports for task management.
Generate a comprehensive ${reportType} report based on the provided data.
Format the report in markdown with clear sections, insights, and actionable recommendations.`;

    const userMessage = `Generate a ${reportType} report using this data:\n\n${JSON.stringify(data, null, 2)}`;

    return this.generateCompletion(systemPrompt, userMessage, options);
  }
}

// Singleton instance
export const hybridAI = new HybridAIProvider();
