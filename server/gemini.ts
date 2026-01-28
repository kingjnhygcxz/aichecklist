import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI with flexible configuration:
// 1. First tries Replit AI Integrations (when deployed on Replit)
// 2. Falls back to standard GEMINI_API_KEY (for non-Replit deployments)
const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const baseURL = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || process.env.GEMINI_BASE_URL;

// Use Replit AI Integrations format if baseURL is set, otherwise use standard SDK
const ai = baseURL 
  ? new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        apiVersion: "",
        baseUrl: baseURL,
      }
    })
  : new GoogleGenAI({ apiKey });

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Safely parse JSON with fallback
 */
export function safeJSONParse<T>(text: string, fallback: T): T {
  try {
    const parsed = JSON.parse(text);
    return parsed as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
}

/**
 * Validate that a parsed object has required keys
 */
export function validateKeys<T extends Record<string, any>>(
  obj: any,
  requiredKeys: (keyof T)[],
  fallback: T
): T {
  if (!obj || typeof obj !== 'object') {
    return fallback;
  }
  
  for (const key of requiredKeys) {
    if (!(key in obj)) {
      console.warn(`Missing required key: ${String(key)}`);
      return fallback;
    }
  }
  
  return obj as T;
}

/**
 * Chat with Gemini AI - used as a fallback when OpenAI fails
 * @param messages - Array of chat messages in OpenAI format
 * @param systemPrompt - System prompt to set AI behavior
 * @returns AI response as a string
 */
export async function chatWithGemini(
  messages: ChatMessage[], 
  systemPrompt: string
): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    // Build conversation history for context
    let conversationText = systemPrompt + "\n\n";
    
    // Add all previous messages for context
    for (const msg of messages) {
      if (msg.role === 'user') {
        conversationText += `User: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        conversationText += `Assistant: ${msg.content}\n`;
      }
    }

    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      throw new Error("No user message found");
    }

    // Add final instruction
    conversationText += `\nPlease respond professionally to the user's latest message: "${lastUserMessage.content}"`;

    // Use proper Google GenAI SDK format with contents array
    // Using gemini-2.5-flash for fast response times (supported by Replit AI Integrations)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: conversationText }]
        }
      ],
      config: {
        maxOutputTokens: 800,
        temperature: 0.7,
      },
    });

    const text = response.text || "";
    
    return text || "I apologize for the inconvenience. The system requires a moment to process. How may I assist with your strategic priorities?";
  } catch (error: any) {
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack, name: error.name }
      : error;
    console.error('Gemini chat error:', JSON.stringify(errorDetails, null, 2));
    throw error;
  }
}

/**
 * Generic Gemini completion - for single-turn requests like task extraction, recommendations, etc.
 * @param systemPrompt - System instructions
 * @param userPrompt - User's request
 * @param options - Optional parameters like temperature, max tokens, JSON mode
 * @returns AI response as a string
 */
export async function geminiCompletion(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean; // If true, will enforce JSON response format
  }
): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    // Combine system prompt and user prompt
    // If JSON mode is requested, add explicit JSON instruction
    let fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    if (options?.jsonMode) {
      fullPrompt += `\n\nIMPORTANT: You MUST respond with ONLY valid JSON. Do not include any explanation, markdown formatting, or text outside the JSON object/array. Your entire response should be parseable by JSON.parse().`;
    }

    // Build generation config
    const generationConfig: any = {};
    if (options?.temperature !== undefined) {
      generationConfig.temperature = options.temperature;
    }
    if (options?.maxTokens) {
      generationConfig.maxOutputTokens = options.maxTokens;
    }
    // Force JSON output format when JSON mode is enabled
    if (options?.jsonMode) {
      generationConfig.responseMimeType = 'application/json';
    }

    // Use proper Google GenAI SDK format with contents array
    // Using gemini-2.5-flash for fast response times (supported by Replit AI Integrations)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: fullPrompt }]
        }
      ],
      config: Object.keys(generationConfig).length > 0 ? generationConfig : undefined,
    });

    let text = response.text || "";
    
    // If JSON mode, try to extract and clean JSON from the response
    if (options?.jsonMode && text) {
      // Remove markdown code blocks if present
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try to find JSON array or object if not already clean
      if (!text.startsWith('{') && !text.startsWith('[')) {
        const jsonArrayMatch = text.match(/\[[\s\S]*\]/);
        const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
        
        if (jsonArrayMatch) {
          text = jsonArrayMatch[0];
        } else if (jsonObjectMatch) {
          text = jsonObjectMatch[0];
        }
      }
    }
    
    return text || "Unable to generate response";
  } catch (error) {
    console.error('Gemini completion error:', error);
    throw error;
  }
}

export async function analyzeTaskPatterns(tasks: any[]): Promise<string> {
  // TEMPORARY: Return basic analysis until Gemini API is configured
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'High').length;
  
  return `Task Analysis (Basic Mode):
• Total tasks: ${totalTasks}
• Completed: ${completedTasks} (${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
• High priority: ${highPriorityTasks}

Basic insights: Focus on completing high-priority tasks first. Break down large tasks into smaller, manageable steps. Advanced AI analysis will be available soon.`;
}

export async function generateTaskSuggestions(recentTasks: any[]): Promise<string[]> {
  // TEMPORARY: Return generic suggestions until Gemini API is configured
  return [
    "Review weekly goals",
    "Plan tomorrow's priorities", 
    "Update project status",
    "Check calendar for upcoming deadlines",
    "Organize workspace"
  ];
}

export async function getProductivityTips(): Promise<string> {
  // TEMPORARY: Return static tips until Gemini API is configured
  return "1. Break large tasks into smaller steps\n2. Set specific deadlines\n3. Review and prioritize daily";
}