import OpenAI from "openai";
import { storage } from "./storage";
import { Task, InsertTask } from "@shared/schema";
import { templateManager } from "./templateManager";
import { printingService } from "./printingService";
import { chatWithGemini, geminiCompletion, safeJSONParse, validateKeys } from "./gemini";
import { webSummarizer } from "./webSummarizer";
import { DateTime } from "luxon";
import { extractFirstCommand, parseToolPayload, safeJsonParse } from "./tools/extract";
import { ToolSchemas, ToolName, isValidToolName } from "./tools/registry";
import { planMultiAction, Segment, PlannedStep, MultiPlan } from "./tools/multiActionPlanner";
import { runPlanSequential, ToolResult, formatPlanResults } from "./tools/runPlanSequential";
import { execAddContact, execFindContact } from "./tools/contacts";
import { execSendMessage, execListInbox, execReadMessage } from "./tools/messages";

function flagOn(name: string): boolean {
  return process.env[name] === "true";
}

function clarificationFor(tool: string): string {
  const clarifications: Record<string, string> = {
    CREATE_TASK: "I can create that task. What title should I use, and what date/time should it be scheduled for?",
    CREATE_CHECKLIST: "I can create that checklist. What should the checklist title be, and what are the items?",
    ROLLING_TASKS: "I can create multiple tasks. Please list the tasks you'd like me to create.",
    SUMMARIZE_REQUEST: "I can summarize a webpage. Please provide the URL.",
    TEMPLATE_REQUEST: "I can apply a template. Which template would you like to use?",
    SHARE_SCHEDULE: "I can share your schedule. Who would you like to share it with?",
  };
  return clarifications[tool] || "I can help with that. Could you provide a bit more detail?";
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Using GPT-4o-mini for faster response times (4-5x faster than GPT-4o) while maintaining high quality
const MODEL = "gpt-4o-mini";

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface TaskCreationRequest {
  title: string;
  category?: string;
  priority?: 'Low' | 'Medium' | 'High';
  timer?: number;
  youtubeUrl?: string;
  scheduledDate?: string;
  scheduledTime?: string; // Separate time field for proper timezone conversion (e.g., "09:00")
  needsCalendar?: boolean;
}

interface RollingTasksRequest {
  tasks: TaskCreationRequest[];
}

interface ChecklistCreationRequest {
  title: string;
  category?: string;
  priority?: 'Low' | 'Medium' | 'High';
  checklistItems: Array<{
    text: string;
    completed: boolean;
  }>;
}

interface TemplateRecommendation {
  templates: Array<{
    name: string;
    description: string;
    category: string;
    reason: string;
  }>;
}

export class DomoAI {
  private templates: any[] = [];

  constructor() {
    this.loadTemplates();
  }

  private async loadTemplates() {
    try {
      this.templates = await storage.getTemplates();
    } catch (error) {
      console.error("Error loading templates:", error);
      this.templates = [];
    }
  }
  // Secure method to get high priority tasks - only accessible by authenticated user request
  async getHighPriorityTasks(userId: number): Promise<Task[]> {
    try {
      if (!userId) {
        throw new Error("User authentication required for high priority task access");
      }
      
      const highPriorityTasks = await storage.getHighPriorityTasks(userId);
      return highPriorityTasks;
    } catch (error) {
      console.error("Error accessing high priority tasks:", error);
      throw error;
    }
  }

  private getTemplateList(): string {
    const templatesByCategory = this.templates.reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(`${template.name}: ${template.description}`);
      return acc;
    }, {} as Record<string, string[]>);

    let templateList = "Available templates by category:\n";
    for (const [category, templates] of Object.entries(templatesByCategory)) {
      templateList += `\n${category}:\n`;
      (templates as string[]).forEach(t => {
        templateList += `- ${t}\n`;
      });
    }
    return templateList;
  }

  async getTemplateRecommendations(userContext: string): Promise<TemplateRecommendation> {
    try {
      const neurodiverseTemplates = this.templates.filter(t => t.category === 'Neurodiverse-Friendly');
      const allTemplates = this.templates;

      const systemPrompt = `You are an expert at matching users with the perfect productivity templates. Analyze the user's needs and recommend 2-3 most relevant templates.

PRIORITIZE ADHD/NEURODIVERSE TEMPLATES when user mentions:
- ADHD, ADD, or neurodiversity
- Difficulty focusing, getting started, or overwhelm
- Need for structure, micro-steps, or time-boxing
- Executive function challenges
- Hyperfocus issues

Available Neurodiverse-Friendly Templates:
${neurodiverseTemplates.map(t => `- ${t.name}: ${t.description}`).join('\n')}

${this.getTemplateList()}

Respond in JSON format with template recommendations and reasons why each is perfect for them.`;

      let responseContent: string | null = null;

      // Try Gemini first (faster), fall back to OpenAI
      try {
        // Gemini as primary provider for speed
        responseContent = await geminiCompletion(systemPrompt, userContext, { jsonMode: true });
        console.log('Gemini successful for template recommendations');
      } catch (geminiError) {
        console.log('Gemini failed for template recommendations, attempting OpenAI fallback');
        
        try {
          // Fallback to OpenAI
          const response = await openai.chat.completions.create({
            model: MODEL,
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              {
                role: "user",
                content: userContext
              }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
          });

          responseContent = response.choices[0].message.content;
          console.log('OpenAI fallback successful for template recommendations');
        } catch (openaiError) {
          console.error('Both Gemini and OpenAI failed for template recommendations:', {
            geminiError: geminiError instanceof Error ? geminiError.message : String(geminiError),
            openaiError: openaiError instanceof Error ? openaiError.message : String(openaiError)
          });
          throw geminiError; // Throw to be caught by outer try-catch
        }
      }

      // Safe JSON parsing with validation
      const parsed = safeJSONParse(responseContent || '{}', { templates: [] });
      const validated = validateKeys(parsed, ['templates'], { templates: [] });
      
      // Ensure templates is an array
      if (!Array.isArray(validated.templates)) {
        console.warn('AI returned non-array templates, using fallback');
        return { templates: [] };
      }
      
      return validated;
    } catch (error) {
      console.error("Error getting template recommendations:", error);
      return { templates: [] };
    }
  }

  async applyADHDTemplate(templateName: string, userId: number): Promise<any> {
    try {
      // Reload templates to ensure we have the latest
      await this.loadTemplates();
      
      // Handle applying ALL ADHD templates
      if (templateName === 'ALL_ADHD') {
        const adhdTemplates = this.templates.filter(t => t.category === 'Neurodiverse-Friendly');
        let allCreatedTasks = [];
        let appliedTemplates = [];
        
        for (const template of adhdTemplates) {
          // Create tasks from each template
          for (const templateTask of template.tasks) {
            const scheduledDate = templateTask.scheduledDaysFromNow 
              ? new Date(Date.now() + templateTask.scheduledDaysFromNow * 24 * 60 * 60 * 1000)
              : undefined;

            const task = await storage.createTask({
              title: `[${template.name}] ${templateTask.title}`,
              category: templateTask.category,
              priority: templateTask.priority,
              userId: userId,
              completed: false,
              completedAt: null,
              timer: templateTask.timer || null,
              youtubeUrl: null,
              displayOrder: 0,
              scheduledDate: scheduledDate || null,
              isRecurring: false,
              recurringFrequency: null,
              recurringInterval: null,
              parentTaskId: null,
              nextDueDate: null,
              endDate: null,
              daysOfWeek: null,
              dayOfMonth: null,
              monthOfYear: null,
              archived: false,
              archivedAt: null,
              checklistItems: []
            });
            allCreatedTasks.push(task);
          }
          
          // Increment template usage
          await storage.incrementTemplateUsage(template.id);
          appliedTemplates.push(template.name);
        }
        
        return {
          templateName: 'All ADHD Super Hero Templates',
          tasksCreated: allCreatedTasks.length,
          tasks: allCreatedTasks,
          appliedTemplates: appliedTemplates
        };
      }
      
      // Handle single template application
      const template = this.templates.find(t => 
        t.name.toLowerCase().includes(templateName.toLowerCase()) ||
        templateName.toLowerCase().includes(t.name.toLowerCase())
      );
      
      if (!template) {
        console.error(`Template not found: ${templateName}`);
        return null;
      }

      // Create tasks from the template
      const createdTasks = [];
      for (const templateTask of template.tasks) {
        const scheduledDate = templateTask.scheduledDaysFromNow 
          ? new Date(Date.now() + templateTask.scheduledDaysFromNow * 24 * 60 * 60 * 1000)
          : undefined;

        const task = await storage.createTask({
          title: templateTask.title,
          category: templateTask.category,
          priority: templateTask.priority,
          userId: userId,
          completed: false,
          completedAt: null,
          timer: templateTask.timer || null,
          youtubeUrl: null,
          displayOrder: 0,
          scheduledDate: scheduledDate || null,
          isRecurring: false,
          recurringFrequency: null,
          recurringInterval: null,
          parentTaskId: null,
          nextDueDate: null,
          endDate: null,
          daysOfWeek: null,
          dayOfMonth: null,
          monthOfYear: null,
          archived: false,
          archivedAt: null,
          checklistItems: []
        });
        createdTasks.push(task);
      }

      // Increment template usage
      await storage.incrementTemplateUsage(template.id);
      
      return {
        templateName: template.name,
        tasksCreated: createdTasks.length,
        tasks: createdTasks
      };
    } catch (error) {
      console.error("Error applying ADHD template:", error);
      return null;
    }
  }

  private getSystemPrompt(userTimezone?: string): string {
    const currentDate = new Date();
    const today = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const tomorrow = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const timezoneNote = userTimezone ? ` (User timezone: ${userTimezone})` : '';
    
    return `You are DomoAI, a calm executive assistant for AICHECKLIST.

WRITING STYLE (ChatGPT-like):
- Use short sentences.
- Prefer periods over commas.
- One idea per line.
- Use blank lines to separate sections.
- Avoid filler (no "Sure!", "Absolutely!", emojis, or exclamation marks).
- Ask at most one question at a time.
- Keep paragraphs to max 2 sentences.
- If confirming an action, use a short standalone line like: "Done." "Added." "Saved."
- Avoid long paragraphs. Do not narrate obvious steps.
- When listing options, prefer stacked lines over bullets unless comparison is required.
- Output must be plain text.

You embody corporate excellence with a refined, sophisticated personality - think of yourself as a blend between a Fortune 500 executive assistant and a strategic business advisor. You are also a diplomatic assistant with a full range of negotiation skills to promote successful transitions for multifaceted power structures. You maintain impeccable professionalism.

ADHD & TEMPLATE REQUESTS - CRITICAL:
When a user mentions any of these keywords:
- "ADHD", "ADD", "adhd todo list", "adhd template", "neurodiverse", "neurodivergent"
- "I need help focusing", "I'm overwhelmed", "can't get started", "executive function"
- "micro-steps", "time-boxing", "break things down", "smaller tasks"
- "templates", "template list", "show templates", "what templates"
- "show me adhd", "give me adhd", "add adhd template", "use adhd template"

Your response MUST START with this exact format:
TEMPLATE_REQUEST: [template_name]

Where [template_name] is ONE of these options based on what the user needs:
- "ADHD Daily Flow" - for general daily structure and focus
- "Executive Function Rescue" - when they're stuck or overwhelmed
- "ADHD Morning Momentum" - for starting the day right
- "ADHD End-of-Day Reset" - for ending the day organized
- "Hyperfocus Exit Strategy" - for transitioning out of hyperfocus
- "Essay/Report Scaffold" - for writing tasks
- "Interview/Presentation Prep" - for preparation tasks
- "ALL_ADHD" - if they ask for "all ADHD templates" or "all templates"

Then continue with your response explaining the Super Hero List and what template you're applying.

Examples:
- If user says "I can't get started": TEMPLATE_REQUEST: Executive Function Rescue
- If user says "I need morning help": TEMPLATE_REQUEST: ADHD Morning Momentum  
- If user says "apply all ADHD templates": TEMPLATE_REQUEST: ALL_ADHD
- If general ADHD request: TEMPLATE_REQUEST: ADHD Daily Flow

HIGH PRIORITY TASK REQUESTS:
When a user asks about high priority tasks (phrases like "high priority", "urgent tasks", "what's important", "priority tasks"), respond with:
HIGH_PRIORITY_REQUEST: true

This triggers secure access to their high priority tasks that only they can authorize.

PRINT REQUESTS - CRITICAL:
When a user asks to print anything (phrases like "print", "print my", "can you print", "print this", "print that") OR uses the SHORT COMMANDS "p checklist", "p todo", "p":

AIDOMO CONVERSATION PRINTING (DEFAULT):
For general print requests in the AIDOMO chat interface, prioritize printing the conversation:
PRINT_REQUEST: conversation

SPECIAL SHORT COMMANDS (DEFAULT TO CONVERSATION):
- "p" (alone) → PRINT_REQUEST: conversation
- "print" → PRINT_REQUEST: conversation  
- "print this" → PRINT_REQUEST: conversation
- "print chat" → PRINT_REQUEST: conversation

SPECIFIC TASK PRINTING (ONLY WHEN EXPLICITLY REQUESTED):
Only use task printing when the user specifically mentions tasks or lists:
- "print my todo list" → PRINT_REQUEST: todo_list
- "print my checklist" → PRINT_REQUEST: checklist  
- "print my work tasks" → PRINT_REQUEST: work_tasks
- "print my personal tasks" → PRINT_REQUEST: personal_tasks
- "print template list" → PRINT_REQUEST: template_list
- "print high priority tasks" → PRINT_REQUEST: high_priority_tasks
- "print my shopping list" → PRINT_REQUEST: shopping_tasks
- "print my health tasks" → PRINT_REQUEST: health_tasks
- "p checklist" → PRINT_REQUEST: checklist
- "p todo" → PRINT_REQUEST: todo_list

For conversation printing, explain that you're preparing a professional print-ready document of your conversation for immediate printing.

WEBPAGE SUMMARIZATION REQUESTS - CRITICAL:
When a user asks to summarize a webpage, extract key insights, or analyze web content, respond with:
SUMMARIZE_REQUEST: [mode]|[url]

Supported modes:
- "summary" - Quick cliff-notes summary with key points
- "accessible" - ADHD & dyslexia-friendly version with simple sentences and bullets
- "highlights" - Mark the 10 most important insights
- "pdf" - Generate a downloadable PDF document
- "full" - All modes combined (summary + accessible + highlights + PDF)

Examples:
- "summarize this article: https://example.com" → SUMMARIZE_REQUEST: summary|https://example.com
- "give me an accessible summary of https://news.com/article" → SUMMARIZE_REQUEST: accessible|https://news.com/article
- "analyze this webpage and create a PDF: https://blog.com" → SUMMARIZE_REQUEST: pdf|https://blog.com
- "full analysis of https://research.org/paper" → SUMMARIZE_REQUEST: full|https://research.org/paper

After triggering the summarization, explain that you're extracting and analyzing the webpage content using advanced AI to provide professional insights.

CURRENT DATE: ${today} (Today is ${currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })})${timezoneNote}
TOMORROW: ${tomorrow}

IMPORTANT: When users say "today", use ${today}. When they say "tomorrow", use ${tomorrow}. Calculate other dates relative to ${today}.

CRITICAL TIME FORMAT RULE: When creating tasks with specific times (like "5pm", "2:30pm", "11am"):
- ALWAYS use 24-hour format in ISO date strings: "YYYY-MM-DDTHH:mm:00"  
- Convert times correctly: 5pm = 17:00, 2:30pm = 14:30, 11am = 11:00, 12pm (noon) = 12:00, 12am (midnight) = 00:00
- Examples: "Schedule at 5pm tomorrow" → "scheduledDate": "${tomorrow}T17:00:00"
- Examples: "Meeting at 2:30pm on Friday" → "scheduledDate": "[Friday date]T14:30:00"

STRICT DATA PRIVACY & SECURITY:
- NEVER share personal user information, task details, or account data
- NEVER reveal information about other users or their tasks
- If asked about user data you don't have direct access to, say "I can only help with what you share with me directly"
- Protect all customer information as strictly confidential
- Only discuss tasks and information that the current user has explicitly shared in this conversation
- HIGH PRIORITY TASK ACCESS: Only show high priority tasks when the user specifically asks for them (e.g., "what are my high priority tasks?", "show me urgent tasks"). Never access task data automatically or for external sources.

FOCUS TIMER INTEGRATION - CRITICAL:
When discussing ANY productivity methods, time management, work sessions, breaks, or the Pomodoro Technique, you MUST ALWAYS reference the FOCUS Timer AND provide location instructions:
- "I recommend utilizing our FOCUS Timer - on the right side of your screen, look for the tab and set your timer for optimal work sessions"
- "The FOCUS Timer provides perfect 25-minute productivity intervals with built-in breaks. You'll find it on the right side of your screen - look for the tab and set your timer"
- "Leverage the FOCUS Timer to implement structured time-blocking methodology. Simply look on the right side of your screen for the tab and set your timer"
- "Our FOCUS Timer is specifically designed for professional productivity enhancement. On the right side of your screen, look for the tab and set your timer"
- ALWAYS include the instruction: "on the right side of your screen, look for the tab and set your timer"
- NEVER mention generic "Pomodoro timers," "external apps," or "other timer tools" - ONLY promote the built-in FOCUS Timer feature

CORE PERSONALITY & PROFESSIONAL STANDARDS:
- Maintain EXCEPTIONAL professionalism at ALL times - you represent executive-level service
- Use sophisticated business vocabulary and polished communication
- Address users with respect (e.g., "Certainly," "I'd be delighted to assist," "Excellent choice")
- Incorporate strategic business insights when discussing productivity and task management
- Use subtle, tasteful business humor sparingly (think Wall Street Journal, not water cooler)
- Demonstrate executive-level thinking: efficiency, ROI, strategic prioritization
- Always position yourself as their trusted business advisor, not just a task manager
- Language should reflect Harvard Business Review, not casual chat
- Example phrases: "Let me optimize your workflow," "I'll ensure maximum productivity," "Strategic task prioritization"

REPORT WRITING & DOCUMENT PRODUCTION:
You are a professional business writer capable of producing comprehensive, high-quality documents. When asked, you CAN and SHOULD create:
- Business reports (financial, market analysis, quarterly reviews, annual reports)
- Business plans and proposals
- Executive summaries and briefs
- Project documentation and specifications
- Meeting agendas and minutes
- Policy documents and procedures
- Marketing copy and content strategies
- Research reports and white papers
- Performance reviews and assessments
- Training materials and guides
- Presentations and pitch decks (in text format)
- Email templates and professional correspondence
- Legal-style documents (non-binding, for review purposes)

When writing reports or documents:
1. Use professional formatting with clear sections and headers
2. Provide comprehensive, detailed content - not abbreviated summaries
3. Include relevant data points, analysis, and actionable recommendations
4. Match the appropriate tone for the document type (formal for reports, persuasive for proposals)
5. Structure content logically with executive summary, main body, and conclusions where appropriate
6. Offer to expand on any section if the user needs more detail

CONTENT MODERATION & SAFETY GUIDELINES (STRICTLY ENFORCED):
You are a BUSINESS-FOCUSED professional assistant. Your content must remain clean, professional, and appropriate at ALL times.

ABSOLUTELY PROHIBITED - You must REFUSE to generate:
- Adult content, sexual content, or anything with romantic/intimate themes
- Violent, graphic, or disturbing content
- Profanity, vulgar language, or crude humor
- Content promoting illegal activities
- Discriminatory, hateful, or offensive material
- Personal attacks or harassment content
- Content involving minors in any inappropriate context
- Drug or substance abuse content (except professional addiction recovery resources)
- Gambling-related promotional content
- Political propaganda or extreme partisan content

WHEN ASKED FOR INAPPROPRIATE CONTENT:
Respond professionally: "I appreciate your inquiry, but I'm designed to focus on professional business content. I'd be delighted to help you with business reports, proposals, strategic documents, or productivity-related materials instead. What business document may I assist you with today?"

PERMITTED CONTENT (focus on these):
- All business and professional documents
- Educational and training materials
- Productivity and self-improvement content
- Health and wellness guidance (professional, non-medical advice)
- Creative business content (marketing, branding, etc.)
- Technical documentation and guides
- Personal development and goal-setting
- Family-friendly lifestyle content

Always maintain the highest standards of professionalism. If in doubt about content appropriateness, err on the side of business-focused, family-friendly content.

TASK CREATION INSTRUCTIONS:
When a user mentions creating a task, setting an alarm, or says something like "create task: [something]", "add task [something]", "set alarm for [something]", "remind me to [something]", "schedule [something]":

1. REMEMBER THE EXACT TASK: Store exactly what they want to do (e.g., "go faster", "buy groceries", "finish report")
2. IDENTIFY IF THEY WANT AN ALARM/TIMER: If they mention "alarm", "timer", "remind me in X minutes", or specific time duration
3. IDENTIFY IF THEY WANT CALENDAR SCHEDULING: If they mention dates like "tomorrow", "next week", "Monday", "December 5th", specific dates
4. Ask: "What category? Work, Personal, Shopping, Health, or Other?"
5. When they reply, create the task IMMEDIATELY with timer and/or scheduled date if mentioned

CHECKLIST CREATION INSTRUCTIONS:
When a user specifically asks for a checklist, like "create a checklist", "make an aichecklist", "checklist for [something]", "create checklist items":

1. DETECT CHECKLIST REQUEST: Look for words like "checklist", "check list", "aichecklist", "list with checkboxes"
2. EXTRACT CHECKLIST ITEMS: If they provide specific items, use those. If not, ask what items they want
3. Ask: "What category? Work, Personal, Shopping, Health, or Other?"
4. When they reply, create ONE TASK with multiple checklist items using CREATE_CHECKLIST format

CREATE_CHECKLIST format:
CREATE_CHECKLIST: {"title": "Checklist items", "category": "[their category choice]", "priority": "Medium", "checklistItems": [{"text": "[item 1]", "completed": false}, {"text": "[item 2]", "completed": false}]}

IMPORTANT: The title MUST always be "Checklist items" - this is the standard label for all checklists created by AIDOMO.

CHECKLIST EXAMPLES:
1. User: "create an aichecklist"
   You: "I'll create a checklist for you! What items should be included? Please list them."
   User: "item 1, item 2, item 3"
   You: "Perfect! What category? Work, Personal, Shopping, Health, or Other?"
   User: "work"
   You generate: CREATE_CHECKLIST: {"title": "Checklist items", "category": "Work", "priority": "Medium", "checklistItems": [{"text": "item 1", "completed": false}, {"text": "item 2", "completed": false}, {"text": "item 3", "completed": false}]}

2. User: "make a shopping checklist with milk, bread, eggs"
   You: "Creating a shopping checklist! What category? Work, Personal, Shopping, Health, or Other?"
   User: "shopping"
   You generate: CREATE_CHECKLIST: {"title": "Checklist items", "category": "Shopping", "priority": "Medium", "checklistItems": [{"text": "milk", "completed": false}, {"text": "bread", "completed": false}, {"text": "eggs", "completed": false}]}

ROLLING TASK CREATION (NEW FEATURE):
When a user says multiple tasks in sequence like "task 1 task 2 task 3 task 4" or "create task one create task two create task three", this is a "rolling task" request:

1. DETECT ROLLING PATTERNS: Look for numbered sequences, multiple "task" mentions, or phrases like:
   - "task 1 task 2 task 3"
   - "task one task two task three"
   - "create task A create task B create task C"
   - "add meeting add research add presentation"
   - "first do X then do Y then do Z"

2. EXTRACT ALL TASKS: Parse each individual task from the sequence
3. Ask: "I see you want to create [NUMBER] tasks! What category should I use for all of them? Work, Personal, Shopping, Health, or Other?"
4. When they reply, create ALL tasks at once using ROLLING_TASKS format

Rolling task creation format:
ROLLING_TASKS: [
  {"title": "[first task]", "category": "[their category choice]", "priority": "Medium"},
  {"title": "[second task]", "category": "[their category choice]", "priority": "Medium"},
  {"title": "[third task]", "category": "[their category choice]", "priority": "Medium"}
]

ROLLING TASK EXAMPLES:
1. User: "task 1 task 2 task 3 task 4"
   You: "Perfect! I see you want to create 4 tasks. What category should I use for all of them? Work, Personal, Shopping, Health, or Other?"
   User: "work"
   You generate: ROLLING_TASKS: [{"title": "task 1", "category": "Work", "priority": "Medium"}, {"title": "task 2", "category": "Work", "priority": "Medium"}, {"title": "task 3", "category": "Work", "priority": "Medium"}, {"title": "task 4", "category": "Work", "priority": "Medium"}]

2. User: "add meeting add research add presentation"
   You: "Great! I'll create 3 tasks for you. What category? Work, Personal, Shopping, Health, or Other?"
   User: "work"
   You generate: ROLLING_TASKS: [{"title": "meeting", "category": "Work", "priority": "Medium"}, {"title": "research", "category": "Work", "priority": "Medium"}, {"title": "presentation", "category": "Work", "priority": "Medium"}]

ALARM/TIMER HANDLING:
- If user says "set alarm" or "set timer", extract the time in minutes
- Common patterns: "5 minute alarm", "alarm for 10 minutes", "remind me in 30 minutes"
- Include the timer in the task creation

Task creation format WITHOUT timer or date:
CREATE_TASK: {"title": "[exact user task here]", "category": "[their category choice]", "priority": "Medium"}

Task creation format WITH timer/alarm:
CREATE_TASK: {"title": "[exact user task here]", "category": "[their category choice]", "priority": "Medium", "timer": [minutes]}

Task creation format WITH calendar date (no specific time):
CREATE_TASK: {"title": "[exact user task here]", "category": "[their category choice]", "priority": "Medium", "scheduledDate": "YYYY-MM-DD"}

Task creation format WITH calendar date AND specific time:
CREATE_TASK: {"title": "[exact user task here]", "category": "[their category choice]", "priority": "Medium", "scheduledDate": "YYYY-MM-DDTHH:mm:00"}

Task creation format WITH BOTH timer and date:
CREATE_TASK: {"title": "[exact user task here]", "category": "[their category choice]", "priority": "Medium", "timer": [minutes], "scheduledDate": "YYYY-MM-DD"}

CALENDAR SCHEDULING EXAMPLES:
1. User: "Schedule a meeting tomorrow"
   You: "I'll schedule that meeting for tomorrow! What category? Work, Personal, Shopping, Health, or Other?"
   User: "work"
   You generate: CREATE_TASK: {"title": "meeting", "category": "Work", "priority": "Medium", "scheduledDate": "${tomorrow}"}

2. User: "Remind me to call mom on Friday"
   You: "I'll add that to your calendar for Friday! What category?"
   User: "personal"
   You generate: CREATE_TASK: {"title": "call mom", "category": "Personal", "priority": "Medium", "scheduledDate": "[calculate Friday's date from ${today}]"}

3. User: "Set a 10 minute timer for break tomorrow"
   You: "Perfect! A 10-minute break timer for tomorrow. What category?"
   User: "personal"
   You generate: CREATE_TASK: {"title": "break", "category": "Personal", "priority": "Medium", "timer": 10, "scheduledDate": "${tomorrow}"}

4. User: "Schedule appointment at 5pm tomorrow"
   You: "I'll schedule that appointment for tomorrow at 5 PM! What category?"
   User: "work"
   You generate: CREATE_TASK: {"title": "appointment", "category": "Work", "priority": "Medium", "scheduledDate": "${tomorrow}T17:00:00"}

5. User: "Meeting at 2:30 PM on Friday"
   You: "Perfect! I'll schedule that meeting for Friday at 2:30 PM. What category?"
   User: "work"
   You generate: CREATE_TASK: {"title": "meeting", "category": "Work", "priority": "Medium", "scheduledDate": "[Friday's date]T14:30:00"}

IMPORTANT TIME HANDLING:
- When user specifies a TIME (e.g., "5pm", "2:30", "at 3"), you MUST include it in scheduledDate using ISO format: "YYYY-MM-DDTHH:mm:00"
- Convert times to 24-hour format: 5pm = 17:00, 2:30pm = 14:30, 11am = 11:00
- If NO specific time mentioned, use just the date: "YYYY-MM-DD"

TIMER EXAMPLES:
1. User: "Set a 5 minute alarm"
   You: "Setting a 5-minute alarm! What category? Work, Personal, Shopping, Health, or Other?"
   User: "work"
   You generate: CREATE_TASK: {"title": "5 minute alarm", "category": "Work", "priority": "Medium", "timer": 5}

2. User: "Remind me to take a break in 15 minutes"
   You: "I'll remind you to take a break in 15 minutes! What category?"
   User: "personal"
   You generate: CREATE_TASK: {"title": "take a break", "category": "Personal", "priority": "Medium", "timer": 15}

After creating a single task say: "Excellent. Task successfully integrated into your workflow. What's your next strategic priority?"
After creating rolling tasks say: "Outstanding. All [NUMBER] deliverables have been strategically allocated to your portfolio. How may I further optimize your productivity?"

FOCUS TIMER INTEGRATION:
When discussing productivity methods, time management, work sessions, or the Pomodoro Technique, ALWAYS reference the FOCUS Timer:
- "I recommend utilizing our FOCUS Timer for optimal work sessions"
- "The FOCUS Timer provides perfect 25-minute productivity intervals"
- "Leverage the FOCUS Timer to implement structured time-blocking methodology"
- Never mention generic "Pomodoro timers" or "external apps" - always promote the built-in FOCUS Timer feature

PROFESSIONAL COMMUNICATION STANDARDS:
- Begin responses with executive-level acknowledgment (e.g., "Excellent.", "Certainly.", "I'll handle that immediately.")
- Use business terminology: "optimize", "leverage", "strategic", "deliverables", "actionable", "ROI", "bandwidth"
- Frame everything in terms of productivity, efficiency, and business value
- End with professional offers of continued service (e.g., "How else may I enhance your productivity today?")
- NEVER use emojis, casual slang, or overly familiar language
- Speak like a Harvard MBA serving a Fortune 500 executive

RESPONSE EXAMPLES:
Instead of: "Great! I'll help you with that!"
Say: "Excellent. I'll optimize that workflow for maximum efficiency."

Instead of: "No problem! What else do you need?"
Say: "Consider it handled. What's your next strategic priority?"

Always maintain this level of professionalism in EVERY response.`;
  }

  async chat(messages: ChatMessage[], userId: number, userMemory?: any, userTimezone?: string, superhumanMode?: 'adhd' | 'normal'): Promise<{ response: string; calendarConflicts?: any }> {
    let taskContext = '';
    let memoryContext = '';
    let systemPrompt = '';
    let adhdModePrompt = '';

    console.log('[AIDOMO DEBUG] Starting chat function for userId:', userId, 'superhumanMode:', superhumanMode);
    
    // ADHD Superhuman Mode formatting instructions
    if (superhumanMode === 'adhd') {
      adhdModePrompt = `

SUPERHUMAN MODE ACTIVE - ADHD-OPTIMIZED RESPONSE FORMAT:
You MUST format ALL responses using these rules:
1. Use bullet points (•) for every list
2. Keep sentences SHORT (under 15 words each)
3. Add priority labels: [HIGH], [MEDIUM], [LOW] for action items
4. Use clear section headers with emojis
5. End with "⚡ Next Step:" followed by ONE specific action
6. No long paragraphs - break everything into scannable chunks
7. Use bold (**text**) for key terms
8. Maximum 3-5 bullet points per section

Example format:
📋 **Summary**
• Key point one
• Key point two

⚡ Next Step: [Specific action to take now]
`;
    }

    try {
      // Check for multi-action patterns in the last user message FIRST
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      const multiActionResult = await this.handleMultiAction(lastUserMessage, userId, userTimezone);
      
      if (multiActionResult.handled && multiActionResult.response) {
        console.log('[AIDOMO DEBUG] Multi-action handled directly');
        return { response: multiActionResult.response };
      }
      
      // Get user's current tasks for context
      console.log('[AIDOMO DEBUG] Fetching user tasks...');
      const userTasks = await storage.getAllTasks(userId);
      console.log('[AIDOMO DEBUG] Got', userTasks.length, 'tasks');
      taskContext = userTasks.length > 0 
        ? `\n\nCURRENT USER TASKS:\n${userTasks.map((task: Task) => 
            `- ${task.title} (${task.category}, ${task.priority}${task.completed ? ' - COMPLETED' : ''})`
          ).join('\n')}`
        : '\n\nUser has no current tasks.';

      // Add user memory context for personalized responses
      memoryContext = '';
      if (userMemory) {
        memoryContext = '\n\nUSER MEMORY & CONTEXT:';
        
        if (userMemory.preferredName) {
          memoryContext += `\n- User prefers to be called: ${userMemory.preferredName}`;
        }
        
        if (userMemory.personalDetails && Object.keys(userMemory.personalDetails).length > 0) {
          const details = userMemory.personalDetails;
          if (details.occupation) memoryContext += `\n- Occupation: ${details.occupation}`;
          if (details.interests && details.interests.length > 0) memoryContext += `\n- Interests: ${details.interests.join(', ')}`;
          if (details.goals && details.goals.length > 0) memoryContext += `\n- Goals: ${details.goals.join(', ')}`;
          if (details.challenges && details.challenges.length > 0) memoryContext += `\n- Challenges: ${details.challenges.join(', ')}`;
          if (details.workStyle) memoryContext += `\n- Work Style: ${details.workStyle}`;
        }
        
        if (userMemory.userPreferences && Object.keys(userMemory.userPreferences).length > 0) {
          const prefs = userMemory.userPreferences;
          if (prefs.communicationStyle) memoryContext += `\n- Communication Preference: ${prefs.communicationStyle}`;
          if (prefs.responseLength) memoryContext += `\n- Response Length Preference: ${prefs.responseLength}`;
          if (prefs.motivationStyle) memoryContext += `\n- Motivation Style: ${prefs.motivationStyle}`;
        }
        
        if (userMemory.recentConversations && userMemory.recentConversations.length > 0) {
          memoryContext += '\n- Recent Topics: ' + userMemory.recentConversations
            .slice(-3) // Last 3 conversations
            .map(conv => conv.topic)
            .join(', ');
        }
        
        memoryContext += '\n\nUSE THIS CONTEXT to provide personalized, relevant responses that build on our relationship and past conversations.';
      }

      console.log('[AIDOMO DEBUG] Building system prompt...');
      systemPrompt = this.getSystemPrompt(userTimezone) + taskContext + memoryContext + adhdModePrompt;
      console.log('[AIDOMO DEBUG] System prompt length:', systemPrompt.length, 'ADHD mode:', superhumanMode === 'adhd');

      // Try Gemini first (faster with gemini-2.0-flash), fall back to OpenAI
      let aiResponse: string;
      try {
        console.log('[AIDOMO DEBUG] Attempting Gemini as primary AI provider...');
        aiResponse = await chatWithGemini(messages, systemPrompt);
        console.log('Gemini response successful');
      } catch (geminiError: any) {
        const geminiErrorDetails = geminiError instanceof Error 
          ? { message: geminiError.message, name: geminiError.name, stack: geminiError.stack?.substring(0, 500) }
          : String(geminiError);
        console.log('[AIDOMO DEBUG] Gemini failed:', JSON.stringify(geminiErrorDetails));
        console.log('[AIDOMO DEBUG] Attempting OpenAI fallback...');
        try {
          // Safely map messages to ensure valid roles
          const safeMessages = messages.map(m => ({
            role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
            content: String(m.content ?? "")
          }));
          
          const response = await openai.chat.completions.create({
            model: MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              ...safeMessages
            ],
            max_tokens: 800,
            temperature: 0.7,
            presence_penalty: 0.2,
            frequency_penalty: 0.1,
          });
          aiResponse = response.choices[0].message.content || "I apologize for the inconvenience. The system requires a moment to process. How may I assist with your strategic priorities?";
          console.log('[AIDOMO DEBUG] OpenAI fallback successful');
        } catch (openaiError: any) {
          const openaiErrorDetails = openaiError instanceof Error 
            ? { message: openaiError.message, name: openaiError.name, stack: openaiError.stack?.substring(0, 500) }
            : String(openaiError);
          console.error('[AIDOMO DEBUG] Both Gemini and OpenAI failed. OpenAI error:', JSON.stringify(openaiErrorDetails));
          throw openaiError;
        }
      }
      
      // Check if the user is asking about calendar conflicts
      const lastMessage = messages[messages.length - 1]?.content || '';
      const conflictResolution = await this.detectAndResolveCalendarConflicts(lastMessage, userId);
      
      if (conflictResolution && conflictResolution.hasConflicts) {
        const conflictResponse = `I've detected ${conflictResolution.conflicts.length} scheduling conflict(s) in your calendar.

${conflictResolution.conflicts.map((c: any, i: number) => 
          `Conflict ${i+1}: ${c.task1.title} overlaps with ${c.task2.title} (${c.type})`
        ).join('\n')}

I've generated ${conflictResolution.proposals.length} rescheduling option(s) to resolve these conflicts. Would you like me to apply the optimal solution that minimizes disruption to your schedule?`;
        
        return {
          response: conflictResponse,
          calendarConflicts: conflictResolution
        };
      }
      
      // TOOL REGISTRY: Extract and validate commands
      const extracted = extractFirstCommand(aiResponse || "");
      
      if (extracted) {
        const tool = extracted.tool;
        const isDryRun = flagOn("DRY_RUN_TOOLS");
        const isStrictMode = flagOn("AIDOMO_ENABLE_STRICT_VALIDATION");
        
        // Enhanced logging for rollout verification
        console.log('[AIDOMO TOOL] ==================== TOOL DETECTION ====================');
        console.log('[AIDOMO TOOL] Extracted tool:', tool);
        console.log('[AIDOMO TOOL] Raw payload text:', extracted.raw?.substring(0, 200));
        console.log('[AIDOMO TOOL] JSON text:', extracted.jsonText?.substring(0, 300));
        console.log('[AIDOMO TOOL] DRY_RUN_TOOLS:', isDryRun);
        console.log('[AIDOMO TOOL] STRICT_VALIDATION:', isStrictMode);
        
        if (!isValidToolName(tool)) {
          console.log('[AIDOMO TOOL] Unknown tool - passing through:', tool);
          return { response: aiResponse };
        }
        
        const schema = ToolSchemas[tool as ToolName];
        const payload = parseToolPayload(tool, extracted.raw, extracted.jsonText);
        
        console.log('[AIDOMO TOOL] Parsed payload:', JSON.stringify(payload, null, 2));
        
        if (payload === null) {
          console.log('[AIDOMO TOOL] PARSE FAILED - payload is null');
          if (isStrictMode && !isDryRun) {
            const clarification = clarificationFor(tool);
            console.log('[AIDOMO TOOL] Returning clarification:', clarification);
            return { response: clarification };
          }
          return { response: aiResponse };
        }
        
        const validated = schema.safeParse(payload);
        
        console.log('[AIDOMO TOOL] Zod validation success:', validated.success);
        if (!validated.success) {
          console.log('[AIDOMO TOOL] Zod validation errors:', JSON.stringify(validated.error.issues, null, 2));
          if (isStrictMode && !isDryRun) {
            const clarification = clarificationFor(tool);
            console.log('[AIDOMO TOOL] Returning clarification:', clarification);
            return { response: clarification };
          }
          return { response: aiResponse };
        }
        
        console.log('[AIDOMO TOOL] Validated data:', JSON.stringify(validated.data, null, 2));
        
        // DRY RUN: Log what would execute but don't actually do it
        if (isDryRun) {
          console.log('[AIDOMO DRY RUN] ========== WOULD EXECUTE ==========');
          console.log('[AIDOMO DRY RUN] Tool:', tool);
          console.log('[AIDOMO DRY RUN] Data:', JSON.stringify(validated.data, null, 2));
          console.log('[AIDOMO DRY RUN] ===================================');
          return { response: aiResponse };
        }
        
        // STRICT MODE: Execute validated tool calls with action receipts
        if (isStrictMode) {
          try {
            if (tool === "CREATE_TASK") {
              const task = await this.createTaskFromChat(validated.data as any, userId, userTimezone);
              console.log('[AIDOMO TOOL] Task created:', task.id, task.title);
              return { 
                response: `Task created: "${task.title}"`,
                actions: [{ type: 'CREATE_TASK', task }]
              };
            }
            
            if (tool === "CREATE_CHECKLIST") {
              const data = validated.data as any;
              const checklist = await this.createChecklistFromChat(data, userId);
              const itemCount = data.checklistItems?.length || 0;
              console.log('[AIDOMO TOOL] Checklist created:', checklist.id, checklist.title, itemCount, 'items');
              return { 
                response: `Checklist created: "${checklist.title}" (${itemCount} items)`,
                actions: [{ type: 'CREATE_CHECKLIST', checklist }]
              };
            }
            
            if (tool === "ROLLING_TASKS") {
              const data = validated.data as any;
              const rollingData = Array.isArray(data) ? { tasks: data } : data;
              const tasks = await this.createRollingTasksFromChat(rollingData, userId);
              const taskTitles = tasks.map(t => t.title).join(', ');
              console.log('[AIDOMO TOOL] Rolling tasks created:', tasks.length, 'tasks');
              return { 
                response: `Created ${tasks.length} tasks: ${taskTitles}`,
                actions: [{ type: 'ROLLING_TASKS', tasks }]
              };
            }
            
            if (tool === "TEMPLATE_REQUEST") {
              const templateName = (validated.data as any).template_name;
              const result = await this.applyADHDTemplate(templateName, userId);
              if (result) {
                console.log('[AIDOMO TOOL] Template applied:', result.templateName, result.tasksCreated, 'tasks');
                return {
                  response: `Template applied: "${result.templateName}" (${result.tasksCreated} tasks created)`,
                  actions: [{ type: 'TEMPLATE_REQUEST', result }]
                };
              }
            }
            
            if (tool === "PRINT_REQUEST") {
              const printType = validated.data as string;
              console.log('[AIDOMO TOOL] Print request:', printType);
              return { 
                response: aiResponse,
                actions: [{ type: 'PRINT_REQUEST', printType }]
              };
            }
            
            if (tool === "SUMMARIZE_REQUEST") {
              const data = validated.data as any;
              console.log('[AIDOMO TOOL] Summarize request:', data.mode, data.url);
              return { 
                response: aiResponse,
                actions: [{ type: 'SUMMARIZE_REQUEST', ...data }]
              };
            }
            
          } catch (execError) {
            console.error('[AIDOMO TOOL] Execution error:', tool, execError);
            return { response: "I encountered an issue while processing that request. Please try again." };
          }
        }
      }
      
      return { response: aiResponse };
    } catch (error: any) {
      const errorDetails = error instanceof Error 
        ? { message: error.message, stack: error.stack, name: error.name }
        : error;
      console.error('DomoAI chat error (both providers failed):', JSON.stringify(errorDetails, null, 2));
      return { response: "I'm experiencing a temporary system optimization. Please allow me another moment to process your request for maximum efficiency." };
    }
  }

  async detectAndResolveCalendarConflicts(message: string, userId: number): Promise<any> {
    try {
      // Check if message mentions scheduling conflicts
      const conflictKeywords = [
        'conflict', 'overlap', 'clash', 'reschedule', 'move meeting', 
        'change time', 'busy at', 'can\'t make', 'double booked',
        'schedule issue', 'time collision'
      ];
      
      const mentionsConflict = conflictKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      );
      
      if (!mentionsConflict) {
        return null;
      }
      
      // Enhanced date/time extraction with better parsing
      const today = new Date();
      let targetDate = new Date(today);
      targetDate.setHours(0, 0, 0, 0);
      
      // Extract date from message
      const datePatterns = [
        { pattern: /today/i, days: 0 },
        { pattern: /tomorrow/i, days: 1 },
        { pattern: /monday/i, dayOfWeek: 1 },
        { pattern: /tuesday/i, dayOfWeek: 2 },
        { pattern: /wednesday/i, dayOfWeek: 3 },
        { pattern: /thursday/i, dayOfWeek: 4 },
        { pattern: /friday/i, dayOfWeek: 5 },
        { pattern: /saturday/i, dayOfWeek: 6 },
        { pattern: /sunday/i, dayOfWeek: 0 },
      ];
      
      for (const dp of datePatterns) {
        if (dp.pattern.test(message)) {
          if (dp.days !== undefined) {
            targetDate.setDate(targetDate.getDate() + dp.days);
          } else if (dp.dayOfWeek !== undefined) {
            const currentDay = targetDate.getDay();
            const daysToAdd = (dp.dayOfWeek - currentDay + 7) % 7 || 7;
            targetDate.setDate(targetDate.getDate() + daysToAdd);
          }
          break;
        }
      }
      
      // Extract specific time if mentioned
      const timeMatch = message.match(/(\d{1,2})(:\d{2})?\s*(am|pm|a\.m\.|p\.m\.)?/i);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2].substring(1)) : 0;
        const meridian = timeMatch[3]?.toLowerCase();
        
        if (meridian && (meridian.includes('p') || meridian.includes('pm'))) {
          if (hour < 12) hour += 12;
        } else if (meridian && (meridian.includes('a') || meridian.includes('am'))) {
          if (hour === 12) hour = 0;
        }
        
        targetDate.setHours(hour, minutes, 0, 0);
      }
      
      // Detect conflicts for the target date
      const conflicts = await storage.detectCalendarConflicts(userId, targetDate);
      
      if (conflicts.conflicts.length === 0) {
        return {
          hasConflicts: false,
          message: "I've analyzed your calendar and found no scheduling conflicts for that time. Your schedule looks clear!"
        };
      }
      
      // Generate rescheduling suggestions
      const proposals = await storage.suggestRescheduling(
        userId, 
        targetDate,
        { conflicts: conflicts.conflicts }
      );
      
      return {
        hasConflicts: true,
        conflicts: conflicts.conflicts,
        proposals: proposals,
        targetDate: targetDate
      };
    } catch (error) {
      console.error('Error detecting calendar conflicts:', error);
      return null;
    }
  }

  async applyCalendarRescheduling(changes: any[], userId: number): Promise<any> {
    try {
      const updatedTasks = await storage.applyRescheduling(userId, changes);
      return {
        success: true,
        updatedTasks,
        message: `Successfully rescheduled ${updatedTasks.length} event(s) to resolve the conflicts.`
      };
    } catch (error) {
      console.error('Error applying rescheduling:', error);
      return {
        success: false,
        message: "I encountered an issue while rescheduling. Please try again."
      };
    }
  }

  async createTaskFromChat(taskData: TaskCreationRequest, userId: number, userTimezone?: string): Promise<Task> {
    try {
      // Use user's timezone or default to America/New_York (EST/EDT)
      const timezone = userTimezone || 'America/New_York';
      
      // DST-safe local time to UTC conversion using Luxon (same as Calendar page)
      const localToUTC = (dateOnly: string, time: string, tz: string): Date => {
        const [year, month, day] = dateOnly.split("-").map(Number);
        const [hour, minute] = time.split(":").map(Number);
        
        // Use Luxon to create a DateTime in the specified timezone
        const localDateTime = DateTime.fromObject(
          { year, month, day, hour, minute, second: 0, millisecond: 0 },
          { zone: tz }
        );
        
        // Check if the conversion was valid
        if (!localDateTime.isValid) {
          console.error('Invalid local time conversion in AIDOMO:', {
            dateOnly, time, tz,
            invalidReason: localDateTime.invalidReason,
            invalidExplanation: localDateTime.invalidExplanation
          });
          // Fallback: treat as UTC
          return new Date(`${dateOnly}T${time}:00Z`);
        }
        
        // Convert to UTC and return as native Date object
        const utcDate = localDateTime.toUTC().toJSDate();
        
        console.log('AIDOMO Luxon timezone conversion successful:', {
          input: `${dateOnly}T${time}`,
          timezone: tz,
          localDateTime: localDateTime.toISO(),
          utcResult: utcDate.toISOString(),
          offset: localDateTime.offset
        });
        
        return utcDate;
      };
      
      // Handle scheduledDate with proper timezone awareness
      let scheduledDate: Date | null = null;
      if (taskData.scheduledDate) {
        let dateStr = taskData.scheduledDate;
        let timeStr = taskData.scheduledTime || '09:00'; // Default to 9am if no time provided
        
        // If scheduledDate contains time (ISO format like "2024-12-02T09:00:00"), extract it
        if (dateStr.includes('T')) {
          const parts = dateStr.split('T');
          dateStr = parts[0]; // Extract date part "2024-12-02"
          // Extract time from ISO string if scheduledTime not provided separately
          if (!taskData.scheduledTime && parts[1]) {
            const timePart = parts[1].split(':');
            if (timePart.length >= 2) {
              timeStr = `${timePart[0]}:${timePart[1]}`;
            }
          }
        }
        
        // Use the same DST-safe conversion as Calendar page
        scheduledDate = localToUTC(dateStr, timeStr, timezone);
        
        console.log('AIDOMO task scheduling with timezone conversion:', {
          originalDate: taskData.scheduledDate,
          originalTime: taskData.scheduledTime,
          extractedDate: dateStr,
          extractedTime: timeStr,
          userTimezone: timezone,
          resultingUTC: scheduledDate.toISOString(),
          note: 'Using same localToUTC as Calendar page for consistency'
        });
      }
      
      const taskInsert: Omit<Task, "id" | "createdAt"> = {
        title: taskData.title,
        category: taskData.category || 'Personal',
        priority: taskData.priority || 'Medium',
        completed: false,
        completedAt: null,
        userId: userId,
        timer: taskData.timer || null,
        youtubeUrl: taskData.youtubeUrl || null,
        scheduledDate: scheduledDate,
        displayOrder: 0,
        isRecurring: false,
        recurringFrequency: null,
        recurringInterval: null,
        nextDueDate: null,
        endDate: null,
        daysOfWeek: null,
        dayOfMonth: null,
        monthOfYear: null,
        parentTaskId: null,
        archived: false,
        archivedAt: null,
        checklistItems: []
      };

      const newTask = await storage.createTask(taskInsert);
      return newTask;
    } catch (error) {
      console.error('Error creating task from chat:', error);
      throw new Error('Failed to create task');
    }
  }

  async createChecklistFromChat(checklistData: ChecklistCreationRequest, userId: number): Promise<Task> {
    try {
      const taskInsert: Omit<Task, "id" | "createdAt"> = {
        title: checklistData.title,
        category: checklistData.category || 'Personal',
        priority: checklistData.priority || 'Medium',
        completed: false,
        completedAt: null,
        userId: userId,
        timer: null,
        youtubeUrl: null,
        scheduledDate: null,
        displayOrder: 0,
        isRecurring: false,
        recurringFrequency: null,
        recurringInterval: null,
        nextDueDate: null,
        endDate: null,
        daysOfWeek: null,
        dayOfMonth: null,
        monthOfYear: null,
        parentTaskId: null,
        archived: false,
        archivedAt: null,
        checklistItems: checklistData.checklistItems.map((item, index) => ({
          ...item,
          id: `${Date.now()}-${index}`
        }))
      };

      const newTask = await storage.createTask(taskInsert);
      return newTask;
    } catch (error) {
      console.error('Error creating checklist from chat:', error);
      throw new Error('Failed to create checklist');
    }
  }

  async createRollingTasksFromChat(rollingData: RollingTasksRequest, userId: number): Promise<Task[]> {
    try {
      const createdTasks: Task[] = [];
      
      // Create each task in sequence
      for (const taskData of rollingData.tasks) {
        const taskInsert: Omit<Task, "id" | "createdAt"> = {
          title: taskData.title,
          category: taskData.category || 'Personal',
          priority: taskData.priority || 'Medium',
          completed: false,
          completedAt: null,
          userId: userId,
          timer: taskData.timer || null,
          youtubeUrl: taskData.youtubeUrl || null,
          scheduledDate: taskData.scheduledDate ? new Date(taskData.scheduledDate) : null,
          displayOrder: 0,
          isRecurring: false,
          recurringFrequency: null,
          recurringInterval: null,
          nextDueDate: null,
          endDate: null,
          daysOfWeek: null,
          dayOfMonth: null,
          monthOfYear: null,
          parentTaskId: null,
          archived: false,
          archivedAt: null,
          checklistItems: []
        };

        const newTask = await storage.createTask(taskInsert);
        createdTasks.push(newTask);
      }

      console.log(`Successfully created ${createdTasks.length} rolling tasks for user ${userId}`);
      return createdTasks;
    } catch (error) {
      console.error('Error creating rolling tasks from chat:', error);
      throw new Error('Failed to create rolling tasks');
    }
  }

  async analyzeTasks(userId: number): Promise<string> {
    try {
      const userTasks = await storage.getAllTasks(userId);
      
      if (userTasks.length === 0) {
        return "Your task portfolio is currently unallocated. I recommend we establish your strategic priorities immediately. What key deliverables shall we schedule for optimization?";
      }

      const completed = userTasks.filter((task: Task) => task.completed).length;
      const total = userTasks.length;
      const completionRate = Math.round((completed / total) * 100);

      const categoryBreakdown = userTasks.reduce((acc: Record<string, number>, task: Task) => {
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const priorityBreakdown = userTasks.reduce((acc: Record<string, number>, task: Task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return `Executive Task Portfolio Analysis:

PERFORMANCE METRICS:
• Completion Rate: ${completionRate}% (${completed}/${total} deliverables executed)
• Efficiency Rating: ${completionRate > 70 ? "EXCEPTIONAL" : completionRate > 50 ? "STRONG" : "DEVELOPING"}

PORTFOLIO ALLOCATION BY CATEGORY:
${Object.entries(categoryBreakdown).map(([cat, count]) => `• ${cat}: ${count} strategic items`).join('\n')}

PRIORITY DISTRIBUTION:
${Object.entries(priorityBreakdown).map(([pri, count]) => `• ${pri} Priority: ${count} actionable items`).join('\n')}

STRATEGIC RECOMMENDATION: ${completionRate > 70 ? 
  "Your execution metrics demonstrate exceptional performance. I recommend leveraging this momentum for high-impact initiatives." : 
  "Focus on high-priority deliverables to optimize your completion velocity and maximize ROI on time investment."}

How may I further optimize your productivity trajectory?`;
    } catch (error) {
      console.error('Error analyzing tasks:', error);
      return "I had trouble analyzing your tasks, but I'm here to help you stay organized! What can I assist you with?";
    }
  }

  async generateWeeklyReport(
    userId: number, 
    options: { timeframe: string; includeCategories: boolean; includeAppointments: boolean; maxItemsPerSection: number },
    userTimezone?: string
  ): Promise<{
    range: { startDate: string; endDate: string };
    totals: { completedTasks: number; inProgressTasks: number; overdueTasks: number; appointmentsCompleted: number };
    byCategory: Array<{ category: string; completed: number; inProgress: number }>;
    sections: { completed: string[]; inProgress: string[]; overdue: string[] };
    highlights: string[];
  }> {
    const tz = userTimezone || "America/Chicago";
    const now = DateTime.now().setZone(tz);
    let startDate: DateTime;
    let endDate: DateTime;
    
    if (options.timeframe === "last_week") {
      startDate = now.minus({ weeks: 1 }).startOf("week");
      endDate = startDate.endOf("week");
    } else if (options.timeframe === "last_7_days") {
      endDate = now.endOf("day");
      startDate = now.minus({ days: 7 }).startOf("day");
    } else {
      startDate = now.startOf("week");
      endDate = now.endOf("week");
    }
    
    const startJS = startDate.toJSDate();
    const endJS = endDate.toJSDate();
    const nowJS = now.toJSDate();
    
    const allTasks = await storage.getAllTasks(userId);
    
    const completedTasks = allTasks.filter((t: Task) => 
      t.completed && t.completedAt && 
      new Date(t.completedAt) >= startJS && 
      new Date(t.completedAt) <= endJS
    );
    
    const inProgressTasks = allTasks.filter((t: Task) => 
      !t.completed && !t.archived &&
      t.createdAt && new Date(t.createdAt) <= endJS
    );
    
    const overdueTasks = allTasks.filter((t: Task) => 
      !t.completed && 
      t.scheduledDate && 
      new Date(t.scheduledDate) < nowJS &&
      new Date(t.scheduledDate) >= startJS
    );
    
    let appointmentsCount = 0;
    if (options.includeAppointments) {
      const appointmentTasks = allTasks.filter((t: Task) => {
        const cat = (t.category || "").toLowerCase();
        const isAppointment = cat === "calendar" || cat === "appointments" || cat === "meetings";
        if (!isAppointment) return false;
        if (t.scheduledDate) {
          const schedDate = new Date(t.scheduledDate);
          return schedDate >= startJS && schedDate <= endJS;
        }
        if (t.completed && t.completedAt) {
          const compDate = new Date(t.completedAt);
          return compDate >= startJS && compDate <= endJS;
        }
        return false;
      });
      appointmentsCount = appointmentTasks.length;
    }
    
    const categoryMap = new Map<string, { completed: number; inProgress: number }>();
    
    if (options.includeCategories) {
      for (const task of completedTasks) {
        const cat = task.category || "General";
        const existing = categoryMap.get(cat) || { completed: 0, inProgress: 0 };
        existing.completed++;
        categoryMap.set(cat, existing);
      }
      
      for (const task of inProgressTasks) {
        const cat = task.category || "General";
        const existing = categoryMap.get(cat) || { completed: 0, inProgress: 0 };
        existing.inProgress++;
        categoryMap.set(cat, existing);
      }
    }
    
    const byCategory = options.includeCategories 
      ? Array.from(categoryMap.entries())
          .map(([category, counts]) => ({ category, ...counts }))
          .sort((a, b) => (b.completed + b.inProgress) - (a.completed + a.inProgress))
      : [];
    
    const maxItems = options.maxItemsPerSection;
    
    const highlights: string[] = [];
    if (completedTasks.length > 0) {
      highlights.push(`Strong execution: ${completedTasks.length} tasks completed`);
    }
    if (overdueTasks.length > 0) {
      highlights.push(`${overdueTasks.length} overdue items need attention`);
    }
    if (options.includeAppointments && appointmentsCount > 0) {
      highlights.push(`${appointmentsCount} appointments this period`);
    }
    
    return {
      range: {
        startDate: startDate.toISODate() || startDate.toISO()?.split('T')[0] || "",
        endDate: endDate.toISODate() || endDate.toISO()?.split('T')[0] || "",
      },
      totals: {
        completedTasks: completedTasks.length,
        inProgressTasks: inProgressTasks.length,
        overdueTasks: overdueTasks.length,
        appointmentsCompleted: appointmentsCount,
      },
      byCategory,
      sections: {
        completed: completedTasks.slice(0, maxItems).map((t: Task) => t.title),
        inProgress: inProgressTasks.slice(0, maxItems).map((t: Task) => t.title),
        overdue: overdueTasks.slice(0, maxItems).map((t: Task) => t.title),
      },
      highlights,
    };
  }

  formatWeeklyReportMessage(report: {
    range: { startDate: string; endDate: string };
    totals: { completedTasks: number; inProgressTasks: number; overdueTasks: number; appointmentsCompleted: number };
    byCategory: Array<{ category: string; completed: number; inProgress: number }>;
    sections: { completed: string[]; inProgress: string[]; overdue: string[] };
    highlights: string[];
  }): string {
    const lines: string[] = [];
    
    lines.push(`📊 **Weekly Summary (${report.range.startDate} to ${report.range.endDate})**`);
    lines.push("");
    lines.push("**Performance Metrics:**");
    lines.push(`✅ Completed: ${report.totals.completedTasks}`);
    lines.push(`⏳ In Progress: ${report.totals.inProgressTasks}`);
    lines.push(`⚠️ Overdue: ${report.totals.overdueTasks}`);
    lines.push(`📅 Appointments: ${report.totals.appointmentsCompleted}`);
    
    if (report.byCategory.length > 0) {
      lines.push("");
      lines.push("**By Category:**");
      for (const cat of report.byCategory.slice(0, 5)) {
        lines.push(`• ${cat.category}: ${cat.completed} done, ${cat.inProgress} in progress`);
      }
    }
    
    if (report.highlights.length > 0) {
      lines.push("");
      lines.push("**Highlights:**");
      for (const h of report.highlights) {
        lines.push(`• ${h}`);
      }
    }
    
    return lines.join("\n");
  }

  async getProductivityTips(): Promise<string> {
    const tips = [
      "🍅 **FOCUS Timer**: Use our built-in FOCUS Timer for perfect 25-minute work sessions with 5-minute breaks. It's the ideal way to implement the Pomodoro method right here in AICHECKLIST!",
      "📝 **Write it down**: Your brain is for having ideas, not storing them. Get those thoughts into tasks!",
      "🎯 **One priority**: Pick your most important task each morning and tackle it first when your energy is highest.",
      "⏰ **Time blocking**: Schedule specific times for different types of work. Your future self will thank you!",
      "🧹 **2-minute rule**: If a task takes less than 2 minutes, do it now instead of adding it to your list.",
      "🎉 **Celebrate wins**: Completed a task? Take a moment to feel proud! You earned it!",
      "🌅 **Morning routine**: Start your day with intention. Review your tasks and set your priorities.",
      "📱 **Minimize distractions**: Put your phone in another room when focusing on important work."
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    return `${randomTip}

Remember, productivity isn't about being perfect - it's about making consistent progress! What area of productivity would you like to improve? I'm here to help! 💪✨`;
  }

  async classifySegment(input: { segmentText: string; hintKind: Segment["kind"]; fullText: string }): Promise<{ tool: ToolName; args: unknown }> {
    const { segmentText, hintKind } = input;
    
    const command = extractFirstCommand(segmentText);
    if (command && isValidToolName(command.tool)) {
      const payload = parseToolPayload(command.tool, command.raw, command.jsonText);
      return { tool: command.tool as ToolName, args: payload };
    }
    
    const lower = segmentText.toLowerCase();
    
    if (hintKind === "checklist" || /\bchecklist\b/.test(lower)) {
      const items = this.extractChecklistItems(segmentText);
      return { 
        tool: "CREATE_CHECKLIST", 
        args: { title: "Checklist items", category: "Personal", checklistItems: items } 
      };
    }
    
    if (/\b(weekly\s*(report|summary|recap|overview|stats)|status\s*report|this\s*week\s*summary|last\s*week\s*summary|how\s*many\s*(tasks?|items?)\s*(did|have|completed|finished))\b/i.test(lower)) {
      let timeframe: "this_week" | "last_week" | "last_7_days" = "this_week";
      if (/last\s*week/i.test(lower)) {
        timeframe = "last_week";
      } else if (/last\s*7\s*days/i.test(lower)) {
        timeframe = "last_7_days";
      }
      return { 
        tool: "WEEKLY_REPORT_REQUEST", 
        args: { timeframe, includeCategories: true, includeAppointments: true, maxItemsPerSection: 10 } 
      };
    }
    
    if (hintKind === "todolist" || /\b(todo|tasks?)\b/.test(lower)) {
      const tasks = this.extractTodoItems(segmentText);
      console.log("[CLASSIFY] Todolist segment:", segmentText);
      console.log("[CLASSIFY] Extracted tasks:", tasks.length, tasks.map(t => t.title));
      if (tasks.length > 1) {
        console.log("[CLASSIFY] Using ROLLING_TASKS for", tasks.length, "items");
        return { tool: "ROLLING_TASKS", args: { tasks } };
      }
      return { 
        tool: "CREATE_TASK", 
        args: { title: this.extractTaskTitle(segmentText), category: "Personal" } 
      };
    }
    
    if (hintKind === "calendar" || /\b(appointment|meeting|schedule|at\s+\d)/i.test(lower)) {
      const taskData = this.extractCalendarTask(segmentText);
      return { tool: "CREATE_TASK", args: taskData };
    }
    
    return { 
      tool: "CREATE_TASK", 
      args: { title: this.extractTaskTitle(segmentText), category: "Personal" } 
    };
  }

  private extractChecklistItems(text: string): Array<{ text: string; completed: boolean }> {
    const items = text
      .split(/[,;]|\band\b/)
      .map(s => s.trim())
      .filter(s => s.length > 2 && !/^(add|create|make|my|to|checklist)$/i.test(s));
    
    return items.length > 0 
      ? items.map(text => ({ text, completed: false }))
      : [{ text: "Item 1", completed: false }];
  }

  private extractTodoItems(text: string): Array<{ title: string; category: string }> {
    const items = text
      .split(/[,;]|\band\b/)
      .map(s => s.trim())
      .filter(s => s.length > 2 && !/^(add|create|make|my|to|todo|todolist|list)$/i.test(s));
    
    return items.map(title => ({ title, category: "Personal" }));
  }

  private extractTaskTitle(text: string): string {
    let title = text
      .replace(/^(create|add|make|schedule|book|set)\s+(a\s+)?/i, "")
      .replace(/^(task|appointment|meeting|reminder)\s*:?\s*/i, "")
      .trim();
    return title || "Untitled task";
  }

  private extractCalendarTask(text: string): { title: string; category: string; scheduledDate?: string } {
    const title = this.extractTaskTitle(text);
    
    const timeMatch = text.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    const dateMatch = text.match(/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
    
    const result: { title: string; category: string; scheduledDate?: string } = {
      title,
      category: "Work",
    };
    
    if (timeMatch || dateMatch) {
      const today = new Date();
      let targetDate = new Date(today);
      
      if (dateMatch) {
        const dayName = dateMatch[1].toLowerCase();
        if (dayName === "tomorrow") {
          targetDate.setDate(targetDate.getDate() + 1);
        } else if (dayName !== "today") {
          const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
          const targetDay = days.indexOf(dayName);
          const currentDay = targetDate.getDay();
          const daysToAdd = (targetDay - currentDay + 7) % 7 || 7;
          targetDate.setDate(targetDate.getDate() + daysToAdd);
        }
      }
      
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const meridian = timeMatch[3]?.toLowerCase();
        
        if (meridian === "pm" && hour < 12) hour += 12;
        if (meridian === "am" && hour === 12) hour = 0;
        
        const dateStr = targetDate.toISOString().split("T")[0];
        result.scheduledDate = `${dateStr}T${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
      } else {
        result.scheduledDate = targetDate.toISOString().split("T")[0];
      }
    }
    
    return result;
  }

  async executeToolStep(step: PlannedStep, userId: number, userTimezone?: string): Promise<ToolResult> {
    const { tool, args, sourceText } = step;
    
    try {
      const schema = ToolSchemas[tool];
      if (!schema) {
        return { ok: false, tool, error: `Unknown tool: ${tool}` };
      }
      
      const validated = schema.safeParse(args);
      if (!validated.success) {
        const issues = validated.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ");
        const needsClarification = /title|scheduledDate|checklistItems/.test(issues);
        return {
          ok: false,
          tool,
          error: issues,
          needsClarification,
          clarificationQuestion: needsClarification 
            ? clarificationFor(tool)
            : undefined,
        };
      }
      
      if (tool === "CREATE_TASK") {
        const task = await this.createTaskFromChat(validated.data as any, userId, userTimezone);
        return { 
          ok: true, 
          tool, 
          data: task,
          message: `Task created: "${task.title}"`,
        };
      }
      
      if (tool === "CREATE_CHECKLIST") {
        const data = validated.data as any;
        const checklist = await this.createChecklistFromChat(data, userId);
        const itemCount = data.checklistItems?.length || 0;
        return { 
          ok: true, 
          tool, 
          data: checklist,
          message: `Checklist created: "${checklist.title}" (${itemCount} items)`,
        };
      }
      
      if (tool === "ROLLING_TASKS") {
        const data = validated.data as any;
        const rollingData = Array.isArray(data) ? { tasks: data } : data;
        console.log("[ROLLING_TASKS] Creating multiple tasks:", JSON.stringify(rollingData.tasks.map((t: any) => t.title)));
        const tasks = await this.createRollingTasksFromChat(rollingData, userId);
        console.log("[ROLLING_TASKS] Created", tasks.length, "separate tasks:", tasks.map(t => t.title).join(", "));
        return { 
          ok: true, 
          tool, 
          data: tasks,
          message: `Created ${tasks.length} tasks: ${tasks.map(t => `"${t.title}"`).join(", ")}`,
        };
      }
      
      if (tool === "TEMPLATE_REQUEST") {
        const templateName = (validated.data as any).template_name;
        const result = await this.applyADHDTemplate(templateName, userId);
        if (result) {
          return {
            ok: true,
            tool,
            data: result,
            message: `Template applied: "${result.templateName}" (${result.tasksCreated} tasks)`,
          };
        }
        return { ok: false, tool, error: "Template not found" };
      }
      
      if (tool === "WEEKLY_REPORT_REQUEST") {
        const options = validated.data as { 
          timeframe: string; 
          includeCategories: boolean; 
          includeAppointments: boolean;
          maxItemsPerSection: number;
        };
        const report = await this.generateWeeklyReport(userId, options, userTimezone);
        return {
          ok: true,
          tool,
          data: report,
          message: this.formatWeeklyReportMessage(report),
        };
      }
      
      if (tool === "ADD_CONTACT") {
        const result = await execAddContact({ userId, args: validated.data });
        if (result.ok) {
          return {
            ok: true,
            tool,
            data: result.contact,
            message: `Contact added: "${result.contact.displayName}" (${result.contact.email})`,
          };
        }
        return { ok: false, tool, error: "Failed to add contact" };
      }
      
      if (tool === "FIND_CONTACT") {
        const result = await execFindContact({ userId, args: validated.data });
        if (result.ok) {
          const count = result.matches.length;
          return {
            ok: true,
            tool,
            data: result.matches,
            message: count > 0 
              ? `Found ${count} contact${count > 1 ? 's' : ''}: ${result.matches.map((c: any) => c.displayName).join(", ")}`
              : "No contacts found matching your search",
          };
        }
        return { ok: false, tool, error: "Failed to search contacts" };
      }
      
      if (tool === "SEND_MESSAGE") {
        const result = await execSendMessage({ userId, args: validated.data });
        if (result.ok) {
          return {
            ok: true,
            tool,
            data: result.message,
            message: `Message sent successfully`,
          };
        }
        if (result.needsClarification) {
          return {
            ok: false,
            tool,
            error: result.clarificationQuestion || "Need clarification",
            needsClarification: true,
            clarificationQuestion: result.clarificationQuestion,
          };
        }
        return { ok: false, tool, error: "Failed to send message" };
      }
      
      if (tool === "LIST_INBOX") {
        const result = await execListInbox({ userId, args: validated.data });
        if (result.ok) {
          const count = result.inbox.length;
          return {
            ok: true,
            tool,
            data: result.inbox,
            message: count > 0 
              ? `You have ${count} message${count > 1 ? 's' : ''} in your inbox`
              : "Your inbox is empty",
          };
        }
        return { ok: false, tool, error: "Failed to fetch inbox" };
      }
      
      if (tool === "READ_MESSAGE") {
        const result = await execReadMessage({ userId, args: validated.data });
        if (result.ok) {
          return {
            ok: true,
            tool,
            data: result.message,
            message: `Message: "${result.message.subject || '(No subject)'}"`,
          };
        }
        return { ok: false, tool, error: result.error || "Failed to read message" };
      }
      
      return { ok: true, tool, data: validated.data, message: `${tool} processed` };
      
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { ok: false, tool, error: msg };
    }
  }

  async handleMultiAction(userMessage: string, userId: number, userTimezone?: string): Promise<{ handled: boolean; response?: string; actions?: any[] }> {
    const hasLabels = userMessage.toLowerCase().includes("calendar:") || 
                      userMessage.toLowerCase().includes("todo:") || 
                      userMessage.toLowerCase().includes("checklist:");
    
    const connectorPattern = /\b(then|also|and also|after that|next)\b/i;
    const hasConnectors = connectorPattern.test(userMessage);
    
    if (!hasLabels && !hasConnectors) {
      return { handled: false };
    }
    
    console.log("[AIDOMO MULTI-ACTION] Detected multi-action request");
    console.log("[AIDOMO MULTI-ACTION] Has labels:", hasLabels, "Has connectors:", hasConnectors);
    
    try {
      const plan = await planMultiAction({
        userText: userMessage,
        classifySegment: (input) => this.classifySegment(input),
        maxSteps: 5,
      });
      
      console.log("[AIDOMO MULTI-ACTION] Plan created:", plan.mode, plan.steps.length, "steps");
      console.log("[AIDOMO MULTI-ACTION] Segments:", JSON.stringify(plan.meta.segments, null, 2));
      
      if (plan.steps.length <= 1) {
        return { handled: false };
      }
      
      const isDryRun = flagOn("DRY_RUN_TOOLS");
      
      const outcome = await runPlanSequential(
        plan,
        (step) => this.executeToolStep(step, userId, userTimezone),
        { dryRun: isDryRun, stopOnError: false }
      );
      
      console.log("[AIDOMO MULTI-ACTION] Outcome:", outcome.status, "Results:", outcome.results.length);
      
      const responseLines: string[] = [];
      const actions: any[] = [];
      
      for (const result of outcome.results) {
        if (result.ok) {
          responseLines.push(result.message || `Completed: ${result.tool}`);
          actions.push({ type: result.tool, data: result.data });
        } else {
          responseLines.push(`Could not complete: ${result.error}`);
        }
      }
      
      if (outcome.status === "blocked") {
        responseLines.push("");
        responseLines.push(outcome.question);
      }
      
      return {
        handled: true,
        response: responseLines.join("\n"),
        actions,
      };
      
    } catch (error) {
      console.error("[AIDOMO MULTI-ACTION] Error:", error);
      return { handled: false };
    }
  }
}

export const domoAI = new DomoAI();