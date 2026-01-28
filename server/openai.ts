import OpenAI from 'openai';
import { logger } from './logger';
import { geminiCompletion, safeJSONParse, validateKeys } from './gemini';

// Create an OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate task suggestions and insights based on user's existing tasks
export async function generateTaskSuggestions(tasks: any[]) {
  try {
    logger.info('Requesting AI suggestions from OpenAI', { taskCount: tasks.length });
    
    // Extract relevant task information
    const taskInfo = tasks.map(t => ({
      title: t.title,
      category: t.category,
      priority: t.priority,
      completed: t.completed
    }));
    
    // Build the system prompt
    const systemPrompt = `You are an AI assistant that helps users manage their tasks more effectively.
Analyze the user's existing tasks and suggest new tasks they might want to consider.
Also provide helpful insights about their task patterns and productivity.

- Provide 5 suggested new tasks based on their existing tasks
- Provide 3 insights about their productivity patterns
- Format your response as a JSON object with "suggestions" and "insights" arrays
- Keep suggestions concise (under 60 characters each)
- Each suggestion should be a complete task title
- Make suggestions relevant to the categories and priorities they already use`;
    
    // The user prompt with the task data
    const userPrompt = `Here are my current tasks: ${JSON.stringify(taskInfo, null, 2)}

Please respond with a JSON object containing suggestions and insights arrays.`;
    
    let content: string | null | undefined = null;

    // Try OpenAI first, fall back to Gemini
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1024,
        temperature: 0.7
      });
      
      content = response.choices[0].message.content;
    } catch (openaiError) {
      logger.warn('OpenAI failed for task suggestions, attempting Gemini fallback', {
        error: openaiError instanceof Error ? openaiError.message : String(openaiError)
      });
      
      try {
        // Fallback to Gemini (JSON mode enabled for structured output)
        content = await geminiCompletion(systemPrompt, userPrompt, { jsonMode: true });
        logger.info('Gemini fallback successful for task suggestions');
      } catch (geminiError) {
        logger.error('Both OpenAI and Gemini failed for task suggestions', {
          openaiError: openaiError instanceof Error ? openaiError.message : String(openaiError),
          geminiError: geminiError instanceof Error ? geminiError.message : String(geminiError)
        });
        throw openaiError; // Will be caught by outer try-catch
      }
    }
    
    // Parse and validate the response with fallback
    const defaultResult = {
      suggestions: [
        'Review completed tasks for patterns',
        'Set up weekly task planning session',
        'Create task templates for recurring work',
        'Implement time tracking for tasks',
        'Schedule regular task review meetings'
      ],
      insights: [
        'Focus on completing high-priority tasks first',
        'Consider breaking large tasks into smaller steps',
        'Regular task reviews help maintain productivity'
      ]
    };
    
    const parsed = safeJSONParse(content || '{}', defaultResult);
    const result = validateKeys(parsed, ['suggestions', 'insights'], defaultResult);
    
    // Ensure arrays
    const suggestions = Array.isArray(result.suggestions) ? result.suggestions : defaultResult.suggestions;
    const insights = Array.isArray(result.insights) ? result.insights : defaultResult.insights;
    
    logger.info('Successfully generated AI suggestions', {
      suggestionCount: suggestions.length,
      insightCount: insights.length
    });
    
    return {
      suggestions: suggestions.slice(0, 5), // Limit to 5 suggestions
      insights: insights.slice(0, 3)        // Limit to 3 insights
    };
  } catch (error) {
    logger.error('Error generating AI suggestions from OpenAI', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

// Parse speech transcript to extract individual tasks
export async function parseTasksFromTranscript(transcript: string): Promise<string[]> {
  try {
    logger.info('Parsing tasks from transcript using OpenAI', { transcriptLength: transcript.length });
    
    const systemPrompt = `You are an AI assistant that parses speech transcripts to extract individual tasks from task lists.

Your job is to:
1. Identify individual task items mentioned in the speech
2. Clean up and format each task as a clear, actionable item
3. Remove navigation words like "next item", "add another", "next task"
4. Return each task as a separate item in a JSON array

Examples:
- Input: "Buy groceries next item call the dentist next item schedule meeting"
- Output: ["Buy groceries", "Call the dentist", "Schedule meeting"]

- Input: "I need to create a list for my business next item research competitors add another marketing plan"
- Output: ["Create a list for my business", "Research competitors", "Marketing plan"]

Return only a JSON object with a "tasks" array containing the individual task strings.`;

    const userPrompt = `Parse this speech transcript and extract individual tasks: "${transcript}"

Return a JSON object with a "tasks" array.`;

    let content: string | null | undefined = null;

    // Try OpenAI first, fall back to Gemini
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 512,
        temperature: 0.3
      });

      content = response.choices[0].message.content;
    } catch (openaiError) {
      logger.warn('OpenAI failed for voice task parsing, attempting Gemini fallback', {
        error: openaiError instanceof Error ? openaiError.message : String(openaiError)
      });
      
      try {
        // Fallback to Gemini (JSON mode enabled for structured output)
        content = await geminiCompletion(systemPrompt, userPrompt, { jsonMode: true });
        logger.info('Gemini fallback successful for voice task parsing');
      } catch (geminiError) {
        logger.error('Both OpenAI and Gemini failed for voice task parsing', {
          openaiError: openaiError instanceof Error ? openaiError.message : String(openaiError),
          geminiError: geminiError instanceof Error ? geminiError.message : String(geminiError)
        });
        throw openaiError; // Will be caught by outer try-catch
      }
    }
    // Parse and validate the response with fallback
    const defaultResult = {
      tasks: transcript
        .split(/\b(next item|next task|add another|another task|next)\b/gi)
        .map(t => t.trim())
        .filter(t => t.length > 3 && !/(next item|next task|add another|another task|next)/gi.test(t))
    };
    
    // If default parsing found nothing, use original transcript
    if (defaultResult.tasks.length === 0) {
      defaultResult.tasks = [transcript.trim()];
    }

    const parsed = safeJSONParse(content || '{}', defaultResult);
    const result = validateKeys(parsed, ['tasks'], defaultResult);
    
    // Ensure tasks is an array
    const tasks = Array.isArray(result.tasks) ? result.tasks : defaultResult.tasks;
    
    logger.info('Successfully parsed tasks from transcript', {
      taskCount: tasks.length,
      tasks: tasks
    });

    return tasks.length > 0 ? tasks : [transcript.trim()];
  } catch (error) {
    logger.error('Error parsing tasks from transcript', {
      error: error instanceof Error ? error.message : String(error)
    });
    // Fallback to original transcript
    return [transcript.trim()];
  }
}
