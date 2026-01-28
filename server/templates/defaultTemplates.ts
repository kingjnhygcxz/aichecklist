import { TaskPriority } from "@shared/schema";

// Comprehensive collection of templates organized by category
// Easy to add new templates - just add them to this array!

export const defaultTemplates = [
  // ============= PERSONAL PRODUCTIVITY =============
  {
    name: "📋 Weekly Review & Planning",
    description: "GTD-style weekly review to stay organized without manual setup",
    category: "Personal Productivity",
    tags: ["gtd", "weekly", "review", "planning"],
    tasks: [
      { title: "Review completed tasks from last week", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Clear inbox and process loose ends", category: "Personal", priority: "High" as TaskPriority },
      { title: "Plan next week's priorities", category: "Work", priority: "High" as TaskPriority },
      { title: "Schedule focused work blocks", category: "Work", priority: "Medium" as TaskPriority, timer: 90 },
      { title: "Review and update project statuses", category: "Work", priority: "Medium" as TaskPriority },
    ]
  },
  {
    name: "🎯 Deep Work Session",
    description: "Structured focus blocks to support concentration in a distracted world",
    category: "Personal Productivity",
    tags: ["focus", "deep-work", "productivity"],
    tasks: [
      { title: "Clear workspace and close distractions", category: "Personal", priority: "High" as TaskPriority },
      { title: "Deep work block - Core project", category: "Work", priority: "High" as TaskPriority, timer: 120 },
      { title: "5-minute break and hydration", category: "Health", priority: "Low" as TaskPriority },
      { title: "Review and document progress", category: "Work", priority: "Medium" as TaskPriority },
    ]
  },
  {
    name: "🌅 Morning Routine",
    description: "Start your day with intention and energy",
    category: "Personal Productivity",
    tags: ["morning", "routine", "daily", "habits"],
    tasks: [
      { title: "Wake up and hydrate", category: "Health", priority: "High" as TaskPriority },
      { title: "Morning exercise or stretching", category: "Health", priority: "High" as TaskPriority, timer: 20 },
      { title: "Healthy breakfast", category: "Health", priority: "Medium" as TaskPriority },
      { title: "Review today's priorities", category: "Personal", priority: "High" as TaskPriority },
      { title: "Set daily intention", category: "Personal", priority: "Medium" as TaskPriority },
    ]
  },
  {
    name: "🌙 Evening Wind-Down",
    description: "Prepare for restful sleep and tomorrow's success",
    category: "Personal Productivity",
    tags: ["evening", "routine", "daily", "sleep"],
    tasks: [
      { title: "Review today's accomplishments", category: "Personal", priority: "Low" as TaskPriority },
      { title: "Prepare clothes for tomorrow", category: "Personal", priority: "Low" as TaskPriority },
      { title: "10-minute tidy up", category: "Personal", priority: "Medium" as TaskPriority, timer: 10 },
      { title: "No screens time - reading or journaling", category: "Personal", priority: "High" as TaskPriority, timer: 30 },
      { title: "Sleep preparation routine", category: "Health", priority: "High" as TaskPriority },
    ]
  },
  {
    name: "🍽️ Weekly Meal Planning",
    description: "Personal-life organization that brings mental clarity and saves time",
    category: "Personal Productivity", 
    tags: ["meal-prep", "planning", "health", "weekly"],
    tasks: [
      { title: "Check pantry and fridge inventory", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Plan 7 meals for the week", category: "Personal", priority: "High" as TaskPriority },
      { title: "Create shopping list", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Shop for groceries", category: "Shopping", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 1 },
      { title: "Prep ingredients for 3 meals", category: "Personal", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 2 },
    ]
  },
  {
    name: "Digital Detox Day",
    description: "Intentional break from technology to recharge",
    category: "Personal Productivity",
    tags: ["detox", "wellness", "mindfulness", "break"],
    tasks: [
      { title: "Set out-of-office messages", category: "Personal", priority: "High" as TaskPriority },
      { title: "Plan offline activities", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Prepare physical books or magazines", category: "Personal", priority: "Low" as TaskPriority },
      { title: "Outdoor activity without devices", category: "Health", priority: "High" as TaskPriority, timer: 60 },
      { title: "Reflect on digital habits", category: "Personal", priority: "Medium" as TaskPriority },
    ]
  },

  // ============= PROJECT MANAGEMENT =============
  {
    name: "Project Sprint Planning",
    description: "Team alignment and structured workflows for cross-functional execution",
    category: "Project Management",
    tags: ["sprint", "agile", "team", "planning"],
    tasks: [
      { title: "Review previous sprint outcomes", category: "Work", priority: "High" as TaskPriority },
      { title: "Define sprint goals and scope", category: "Work", priority: "High" as TaskPriority },
      { title: "Break down user stories", category: "Work", priority: "High" as TaskPriority },
      { title: "Estimate effort and assign tasks", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Set up daily standup schedule", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Plan sprint review and retrospective", category: "Work", priority: "Low" as TaskPriority, scheduledDaysFromNow: 14 },
    ]
  },
  {
    name: "Project Timeline & Milestones",
    description: "Visual planning for managing deadlines and dependencies effectively",
    category: "Project Management",
    tags: ["timeline", "gantt", "milestones", "deadlines"],
    tasks: [
      { title: "Map out project phases", category: "Work", priority: "High" as TaskPriority },
      { title: "Identify key milestones", category: "Work", priority: "High" as TaskPriority },
      { title: "Define task dependencies", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Set realistic deadlines", category: "Work", priority: "High" as TaskPriority },
      { title: "Create contingency plans", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Schedule milestone reviews", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
    ]
  },
  {
    name: "Product Launch Checklist",
    description: "Comprehensive steps for successful product release",
    category: "Project Management",
    tags: ["launch", "product", "release", "marketing"],
    tasks: [
      { title: "Finalize product features and testing", category: "Work", priority: "High" as TaskPriority },
      { title: "Prepare marketing materials", category: "Work", priority: "High" as TaskPriority },
      { title: "Set up customer support documentation", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Schedule launch announcement", category: "Work", priority: "High" as TaskPriority },
      { title: "Prepare PR and media outreach", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Set up analytics tracking", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Plan launch day activities", category: "Work", priority: "High" as TaskPriority },
    ]
  },
  {
    name: "Client Onboarding Process",
    description: "Systematic approach to welcoming new clients",
    category: "Project Management",
    tags: ["client", "onboarding", "process", "welcome"],
    tasks: [
      { title: "Send welcome email with next steps", category: "Work", priority: "High" as TaskPriority },
      { title: "Schedule kickoff meeting", category: "Work", priority: "High" as TaskPriority },
      { title: "Gather client requirements and goals", category: "Work", priority: "High" as TaskPriority },
      { title: "Set up client accounts and access", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Create project timeline and milestones", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Schedule first check-in call", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
    ]
  },

  // ============= STRATEGIC PLANNING =============
  {
    name: "SMART Goal Tracker",
    description: "Enable progress in life and work with visible metrics and accountability",
    category: "Strategic Planning",
    tags: ["goals", "smart", "tracking", "metrics"],
    tasks: [
      { title: "Define specific goal outcome", category: "Personal", priority: "High" as TaskPriority },
      { title: "Set measurable success criteria", category: "Personal", priority: "High" as TaskPriority },
      { title: "Identify 3 key action steps", category: "Work", priority: "High" as TaskPriority },
      { title: "Schedule weekly progress check", category: "Personal", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Document lessons learned", category: "Personal", priority: "Low" as TaskPriority, scheduledDaysFromNow: 14 },
    ]
  },
  {
    name: "5-Year Strategic Vision",
    description: "Long-term planning for remote teams seeking clarity over extended periods",
    category: "Strategic Planning",
    tags: ["strategy", "vision", "long-term", "planning"],
    tasks: [
      { title: "Envision ideal 5-year outcome", category: "Work", priority: "High" as TaskPriority },
      { title: "Identify core strengths to leverage", category: "Work", priority: "High" as TaskPriority },
      { title: "Map year-by-year milestones", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Define annual success metrics", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Create quarterly review schedule", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Build support network", category: "Personal", priority: "Low" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Quarterly OKR Planning",
    description: "Set and track objectives and key results",
    category: "Strategic Planning",
    tags: ["okr", "quarterly", "objectives", "results"],
    tasks: [
      { title: "Review last quarter's OKR performance", category: "Work", priority: "High" as TaskPriority },
      { title: "Define 3-5 key objectives", category: "Work", priority: "High" as TaskPriority },
      { title: "Set measurable key results for each objective", category: "Work", priority: "High" as TaskPriority },
      { title: "Align team on priorities", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Create tracking dashboard", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Schedule monthly OKR check-ins", category: "Work", priority: "Low" as TaskPriority },
    ]
  },

  // ============= HEALTH & FITNESS =============
  {
    name: "Fitness Challenge - 30 Days",
    description: "Build sustainable exercise habits with progressive challenges",
    category: "Health & Fitness",
    tags: ["fitness", "challenge", "exercise", "30days"],
    tasks: [
      { title: "Take before photos and measurements", category: "Health", priority: "Medium" as TaskPriority },
      { title: "Week 1: 15-min daily workout", category: "Health", priority: "High" as TaskPriority, timer: 15 },
      { title: "Week 2: Increase to 20-min workouts", category: "Health", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Week 3: Add strength training", category: "Health", priority: "High" as TaskPriority, scheduledDaysFromNow: 14 },
      { title: "Week 4: Full 30-min sessions", category: "Health", priority: "High" as TaskPriority, scheduledDaysFromNow: 21 },
      { title: "Final assessment and celebration", category: "Health", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Mental Health Check-In",
    description: "Regular self-care and mental wellness routine",
    category: "Health & Fitness",
    tags: ["mental-health", "wellness", "self-care", "mindfulness"],
    tasks: [
      { title: "Mood and energy level assessment", category: "Health", priority: "High" as TaskPriority },
      { title: "10-minute meditation or breathing exercise", category: "Health", priority: "High" as TaskPriority, timer: 10 },
      { title: "Journal thoughts and feelings", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Connect with a friend or loved one", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Plan one self-care activity", category: "Health", priority: "Low" as TaskPriority },
    ]
  },
  {
    name: "Hydration Challenge",
    description: "Build better water drinking habits",
    category: "Health & Fitness",
    tags: ["hydration", "water", "health", "daily"],
    tasks: [
      { title: "Morning: Drink 2 glasses of water", category: "Health", priority: "High" as TaskPriority },
      { title: "Mid-morning: Refill water bottle", category: "Health", priority: "Medium" as TaskPriority },
      { title: "Lunch: Drink water before eating", category: "Health", priority: "Medium" as TaskPriority },
      { title: "Afternoon: Hydration break", category: "Health", priority: "Medium" as TaskPriority },
      { title: "Evening: Final hydration check", category: "Health", priority: "Low" as TaskPriority },
    ]
  },

  // ============= HOME & LIFESTYLE =============
  {
    name: "Home Deep Clean Weekend",
    description: "Systematic approach to thorough home cleaning",
    category: "Home & Lifestyle",
    tags: ["cleaning", "home", "weekend", "organization"],
    tasks: [
      { title: "Declutter living spaces", category: "Personal", priority: "High" as TaskPriority, timer: 30 },
      { title: "Deep clean kitchen and appliances", category: "Personal", priority: "High" as TaskPriority, timer: 45 },
      { title: "Bathroom deep clean", category: "Personal", priority: "High" as TaskPriority, timer: 30 },
      { title: "Vacuum and mop all floors", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Wash bedding and towels", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Organize one problem area", category: "Personal", priority: "Low" as TaskPriority },
    ]
  },
  {
    name: "Monthly Budget Review",
    description: "Stay on top of finances with regular review",
    category: "Home & Lifestyle",
    tags: ["budget", "finance", "monthly", "money"],
    tasks: [
      { title: "Review last month's expenses", category: "Personal", priority: "High" as TaskPriority },
      { title: "Check account balances", category: "Personal", priority: "High" as TaskPriority },
      { title: "Pay upcoming bills", category: "Personal", priority: "High" as TaskPriority },
      { title: "Review and adjust budget categories", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Set savings goal for the month", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Plan for upcoming large expenses", category: "Personal", priority: "Low" as TaskPriority },
    ]
  },
  {
    name: "Seasonal Wardrobe Transition",
    description: "Organize clothing for the changing season",
    category: "Home & Lifestyle",
    tags: ["wardrobe", "clothing", "seasonal", "organization"],
    tasks: [
      { title: "Sort through current season clothes", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Donate or sell unworn items", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Clean and store out-of-season clothes", category: "Personal", priority: "High" as TaskPriority },
      { title: "Bring out next season wardrobe", category: "Personal", priority: "High" as TaskPriority },
      { title: "Identify any needed purchases", category: "Shopping", priority: "Low" as TaskPriority },
      { title: "Organize closet by category", category: "Personal", priority: "Low" as TaskPriority },
    ]
  },

  // ============= LEARNING & DEVELOPMENT =============
  {
    name: "VIBE CODING",
    description: "No-code development using Replit and Bolt AI-powered tools for fast app creation",
    category: "Learning & Development",
    tags: ["coding", "replit", "bolt", "no-code", "development", "ai"],
    tasks: [
      { title: "Create a free Replit account", category: "Work", priority: "High" as TaskPriority },
      { title: "Explore Bolt's AI-powered app builder", category: "Work", priority: "High" as TaskPriority },
      { title: "Build a small project (e.g., landing page or to-do app)", category: "Work", priority: "High" as TaskPriority, timer: 60 },
      { title: "Share project link for feedback", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Learn Replit's built-in database and hosting", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Use Bolt to scaffold a full-stack app", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Set up team collaboration in Replit", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Deploy and test your app live", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
    ]
  },
  {
    name: "Vibe Coder - Developer Checklist",
    description: "Ongoing developer habits using cloud coding and collaboration tools",
    category: "Learning & Development",
    tags: ["coding", "replit", "bolt", "developer", "habits", "collaboration"],
    tasks: [
      { title: "Start daily coding journal in Replit", category: "Work", priority: "High" as TaskPriority },
      { title: "Build and share 1 small project per week", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Pair program with a peer on Replit", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Learn GitHub and integrate with Replit", category: "Work", priority: "High" as TaskPriority },
    ]
  },
  {
    name: "Vibe Coder - Game Developer Checklist",
    description: "Game development workflow using Replit, Unity, Unreal Engine, and AI tools",
    category: "Learning & Development",
    tags: ["game-development", "unity", "unreal", "replit", "prototyping", "multiplayer"],
    tasks: [
      { title: "Draft a simple game concept doc", category: "Work", priority: "High" as TaskPriority },
      { title: "Prototype 1 mechanic in Unity/Unreal", category: "Work", priority: "High" as TaskPriority, timer: 90 },
      { title: "Use Replit for multiplayer backend", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Playtest weekly and log feedback", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
    ]
  },
  {
    name: "Learn New Skill - 21 Day Plan",
    description: "Structured approach to acquiring a new skill",
    category: "Learning & Development",
    tags: ["learning", "skill", "education", "21days"],
    tasks: [
      { title: "Research and choose learning resources", category: "Personal", priority: "High" as TaskPriority },
      { title: "Week 1: Learn fundamentals", category: "Personal", priority: "High" as TaskPriority, timer: 30 },
      { title: "Week 1: Practice basic exercises", category: "Personal", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 3 },
      { title: "Week 2: Intermediate concepts", category: "Personal", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Week 2: Build mini-project", category: "Personal", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 10 },
      { title: "Week 3: Advanced techniques", category: "Personal", priority: "High" as TaskPriority, scheduledDaysFromNow: 14 },
      { title: "Final project and skill assessment", category: "Personal", priority: "High" as TaskPriority, scheduledDaysFromNow: 21 },
    ]
  },
  {
    name: "Book Reading Challenge",
    description: "Finish a book with structured reading sessions",
    category: "Learning & Development",
    tags: ["reading", "books", "learning", "challenge"],
    tasks: [
      { title: "Choose book and set reading goal", category: "Personal", priority: "High" as TaskPriority },
      { title: "Read chapters 1-3", category: "Personal", priority: "Medium" as TaskPriority, timer: 30 },
      { title: "Write notes on key concepts", category: "Personal", priority: "Low" as TaskPriority },
      { title: "Read chapters 4-6", category: "Personal", priority: "Medium" as TaskPriority, timer: 30, scheduledDaysFromNow: 3 },
      { title: "Discuss or share learnings", category: "Personal", priority: "Low" as TaskPriority, scheduledDaysFromNow: 5 },
      { title: "Finish remaining chapters", category: "Personal", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Write book review or summary", category: "Personal", priority: "Low" as TaskPriority, scheduledDaysFromNow: 8 },
    ]
  },

  // ============= BUSINESS & ENTREPRENEURSHIP =============
  {
    name: "Startup MVP Development",
    description: "Build and validate minimum viable product",
    category: "Business & Entrepreneurship",
    tags: ["startup", "mvp", "product", "validation"],
    tasks: [
      { title: "Define core value proposition", category: "Work", priority: "High" as TaskPriority },
      { title: "Identify must-have features only", category: "Work", priority: "High" as TaskPriority },
      { title: "Create basic prototype or mockup", category: "Work", priority: "High" as TaskPriority },
      { title: "Recruit 5-10 beta testers", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Collect and analyze feedback", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Iterate based on user input", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 10 },
      { title: "Plan next development phase", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 14 },
    ]
  },
  {
    name: "Sales Pipeline Review",
    description: "Optimize your sales process and close more deals",
    category: "Business & Entrepreneurship",
    tags: ["sales", "pipeline", "crm", "revenue"],
    tasks: [
      { title: "Review all open opportunities", category: "Work", priority: "High" as TaskPriority },
      { title: "Update deal stages and probabilities", category: "Work", priority: "High" as TaskPriority },
      { title: "Identify stalled deals needing attention", category: "Work", priority: "High" as TaskPriority },
      { title: "Schedule follow-ups with hot leads", category: "Work", priority: "High" as TaskPriority },
      { title: "Clean up lost or dead opportunities", category: "Work", priority: "Low" as TaskPriority },
      { title: "Forecast revenue for next quarter", category: "Work", priority: "Medium" as TaskPriority },
    ]
  },
  {
    name: "Content Marketing Sprint",
    description: "Create and schedule content for the month",
    category: "Business & Entrepreneurship",
    tags: ["content", "marketing", "social-media", "blogging"],
    tasks: [
      { title: "Brainstorm content topics", category: "Work", priority: "High" as TaskPriority },
      { title: "Write blog post draft", category: "Work", priority: "High" as TaskPriority, timer: 60 },
      { title: "Create social media graphics", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Schedule social media posts", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Record video or podcast content", category: "Work", priority: "Medium" as TaskPriority, timer: 45 },
      { title: "Engage with community comments", category: "Work", priority: "Low" as TaskPriority },
      { title: "Analyze content performance", category: "Work", priority: "Low" as TaskPriority, scheduledDaysFromNow: 7 },
    ]
  },
  {
    name: "Ultimate Solo AI Entrepreneur Checklist",
    description: "Comprehensive AI-powered business building checklist covering MVP creation, marketing, finance, automation, and scaling for solo entrepreneurs",
    category: "Business & Entrepreneurship",
    tags: ["ai-entrepreneur", "solo-business", "ai-tools", "automation", "mvp", "marketing", "scaling"],
    tasks: [
      // Build Phase (MVP Creation)
      { title: "Define problem + solution in 1 sentence", category: "Work", priority: "High" as TaskPriority },
      { title: "Use AI (Bolt/Replit) to prototype app/site", category: "Work", priority: "High" as TaskPriority, timer: 120 },
      { title: "Create landing page with Webflow/Softr", category: "Work", priority: "High" as TaskPriority },
      { title: "Add waitlist signup (Airtable + Zapier automation)", category: "Work", priority: "High" as TaskPriority },
      { title: "Generate logo & branding (Canva AI)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Test idea with first 10-20 users", category: "Work", priority: "High" as TaskPriority },
      // Marketing & Growth
      { title: "Use AI to create 30-day social content calendar", category: "Work", priority: "High" as TaskPriority },
      { title: "Record AI-edited short videos (Runway / Descript)", category: "Work", priority: "Medium" as TaskPriority, timer: 60 },
      { title: "Automate email drip campaign (Mailerlite / Resend + AI copy)", category: "Work", priority: "High" as TaskPriority },
      { title: "Run small paid ad tests (Google/Meta) with AI copy", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Build SEO blog with AI-assisted writing (ChatGPT + SurferSEO)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Launch referral program (e.g., gamified waitlist)", category: "Work", priority: "Low" as TaskPriority, scheduledDaysFromNow: 14 },
      // Finance & Operations
      { title: "Open solo business bank account", category: "Personal", priority: "High" as TaskPriority },
      { title: "Track income & expenses (Airtable/Sheets + AI categorization)", category: "Work", priority: "High" as TaskPriority },
      { title: "Automate invoices (QuickBooks + Zapier)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Use AI to project 3-6 month runway", category: "Work", priority: "High" as TaskPriority },
      { title: "Set up subscription payments (Stripe/PayPal)", category: "Work", priority: "High" as TaskPriority },
      // Automation & Scaling
      { title: "Automate customer onboarding emails", category: "Work", priority: "High" as TaskPriority },
      { title: "Use AI chatbot for customer service", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Create automated content workflows (Notion → Zapier → Social)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Delegate repetitive tasks to AI agents", category: "Work", priority: "Low" as TaskPriority, scheduledDaysFromNow: 21 },
      { title: "Track KPIs in AI-generated dashboards", category: "Work", priority: "Medium" as TaskPriority },
      // Mindset & Productivity
      { title: "Daily AI-generated task list (Notion AI)", category: "Personal", priority: "High" as TaskPriority },
      { title: "Weekly reflection & pivot plan", category: "Personal", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Set '1 Big Win' per day", category: "Personal", priority: "High" as TaskPriority },
      { title: "Block distractions with focus apps", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Network in 1 AI/entrepreneur community weekly", category: "Personal", priority: "Low" as TaskPriority, scheduledDaysFromNow: 7 },
    ]
  },
  {
    name: "💍 Diamond Supply Chain Checklist",
    description: "Diamonds require strict control from mine to market. Authenticity, ethical sourcing, and storytelling are central.",
    category: "Business & Entrepreneurship",
    tags: ["luxury", "diamonds", "supply-chain", "ethics", "jewelry"],
    tasks: [
      // Daily
      { title: "Inspect incoming shipments for quality, weight, and certification", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate chain-of-custody documentation (Kimberley Process, blockchain logs)", category: "Work", priority: "High" as TaskPriority },
      { title: "Review security systems for vaults and transport", category: "Work", priority: "High" as TaskPriority },
      { title: "Manage communication with suppliers and cutters", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Update digital inventory with lab-grown and mined separation", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Conduct gem grading sessions with certified gemologists", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Audit ethical sourcing compliance with suppliers", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Update brand storytelling campaigns with 'heritage + ethical' positioning", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Hold staff training sessions on security and handling protocols", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Review pricing trends in global diamond markets", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Publish sustainability reports (ethical sourcing, environmental responsibility)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Host private client showings and exclusive sales events", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Audit insurance policies and security infrastructure", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Develop new designs with luxury jewelry houses", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Build partnerships with influencers and high-net-worth collectors", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "⌚ Luxury Watch Brand Launch Checklist",
    description: "Watch brands thrive on heritage, craftsmanship, and exclusivity. The launch process requires global events, collectors, and high-touch marketing.",
    category: "Business & Entrepreneurship",
    tags: ["luxury", "watches", "brand-launch", "craftsmanship", "collectibles"],
    tasks: [
      // Daily
      { title: "Inspect new watch components for quality", category: "Work", priority: "High" as TaskPriority },
      { title: "Review precision engineering metrics for movements", category: "Work", priority: "High" as TaskPriority },
      { title: "Update design and prototype progress logs", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Manage communications with artisans and suppliers", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Monitor competitor launches and pricing", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Finalize design storytelling for heritage and craftsmanship", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Host limited private previews for collectors and VIPs", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Test new watch prototypes for precision and durability", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Review influencer and ambassador contracts", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Update brand visuals (photoshoots, video campaigns)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Host international launch events at luxury hubs (Geneva, Dubai, New York)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Release exclusive limited-edition runs", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Update after-sales service protocols for clients", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Publish collector's journals and media campaigns", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Partner with auction houses for resale brand value growth", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🖼️ Fine Art Investment Fund Checklist",
    description: "Art funds require curation, authentication, storage, and resale strategy to preserve and grow value.",
    category: "Business & Entrepreneurship",
    tags: ["luxury", "art", "investment", "curation", "authentication"],
    tasks: [
      // Daily
      { title: "Track global art auctions and sales databases", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate artwork provenance and authenticity with experts", category: "Work", priority: "High" as TaskPriority },
      { title: "Monitor storage conditions (temperature, humidity, security)", category: "Work", priority: "High" as TaskPriority },
      { title: "Review insurance coverages for new acquisitions", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Communicate with artists and galleries", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Hold internal curation board meetings for acquisitions", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Conduct valuations and update asset portfolio models", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Negotiate gallery and dealer contracts", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Host private collector previews and investor updates", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Audit transport and logistics for art movements", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Publish investor reports with portfolio performance", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Participate in global art fairs (Basel, Frieze, Venice Biennale)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Build media campaigns around major acquisitions", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Update long-term strategy for asset appreciation", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Review partnerships with museums for exhibition placements", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🌌 Space Tourism Luxury Experience Checklist",
    description: "Space tourism mixes extreme adventure with luxury. Beyond rockets, the experience must feel like private jet + 5-star hotel in orbit.",
    category: "Business & Entrepreneurship",
    tags: ["luxury", "space-tourism", "aerospace", "hospitality", "premium-experience"],
    tasks: [
      // Daily
      { title: "Inspect spacecraft readiness and safety systems", category: "Work", priority: "High" as TaskPriority },
      { title: "Review astronaut training schedules for private clients", category: "Work", priority: "High" as TaskPriority },
      { title: "Monitor AI-assisted medical data from clients", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate luxury in-flight menu and accommodations", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Track orbital weather and launch conditions", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Host training sessions at ground-based luxury facilities", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Coordinate with PR for client confidentiality and exclusivity", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Conduct emergency simulation drills with staff and clients", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Update space tourism packages (orbital hotels, moon flybys)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Maintain partnerships with luxury brands for co-branded experiences", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Host VIP preview events at global space hubs", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Publish exclusive client content (curated, NDA-safe)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Secure long-term contracts with launch providers", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Release new luxury space packages with tiered pricing", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Audit health, safety, and insurance frameworks", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🌺 Rare Perfume Brand Checklist",
    description: "Rare perfumes thrive on ingredient sourcing, artisan craftsmanship, storytelling, and exclusivity.",
    category: "Business & Entrepreneurship",
    tags: ["luxury", "perfume", "fragrance", "artisan", "exclusivity"],
    tasks: [
      // Daily
      { title: "Review ingredient shipments (rare flowers, resins, spices)", category: "Work", priority: "High" as TaskPriority },
      { title: "Inspect lab blending for precision and quality", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate olfactory profile testing results", category: "Work", priority: "High" as TaskPriority },
      { title: "Track inventory of rare oils and essences", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Manage artisan perfume bottling and finishing", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Host fragrance testing panels with experts and VIPs", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Develop heritage and brand storytelling campaigns", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Review compliance with international fragrance regulations", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Coordinate luxury packaging and artisan design workshops", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Engage celebrity endorsers and niche influencers", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Launch limited-edition perfume drops", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Host global fragrance events in luxury hubs (Paris, Dubai, Tokyo)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Audit supply chains for sustainability and rarity verification", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Publish content in luxury lifestyle magazines", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Build partnerships with fashion houses and jewelry brands", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🏝️ Private Island Development & Management Checklist",
    description: "Owning or developing a private island requires infrastructure, luxury amenities, sustainability, and extreme exclusivity.",
    category: "Business & Entrepreneurship",
    tags: ["luxury", "private-island", "real-estate", "hospitality", "sustainability"],
    tasks: [
      // Daily
      { title: "Inspect security perimeters and surveillance systems", category: "Work", priority: "High" as TaskPriority },
      { title: "Monitor sustainability systems (solar, desalination, waste management)", category: "Work", priority: "High" as TaskPriority },
      { title: "Review staff schedules for hospitality and maintenance teams", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Validate guest arrival logistics (private jets, yachts, helicopters)", category: "Work", priority: "High" as TaskPriority },
      { title: "Manage client dietary and lifestyle personalization", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Conduct full property inspections (villas, beaches, docks)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Host elite experiences (private chefs, diving, safaris, concerts)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Update island marketing packages (virtual tours, drone footage)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Coordinate with travel concierges and luxury travel agencies", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Train staff in ultra-high-net-worth (UHNW) client protocol", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Host private invitation-only retreats for VIPs", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Audit sustainability and eco-certification frameworks", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Expand infrastructure projects (new villas, spas, marinas)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Publish curated content for select clients (print or digital)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Build partnerships with celebrity or royal guests for PR leverage", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🚗 Ultra-Rare Hypercar Brand Checklist",
    description: "Hypercar brands thrive on limited production, precision engineering, extreme design, and billionaire clientele.",
    category: "Business & Entrepreneurship",
    tags: ["luxury", "hypercar", "automotive", "engineering", "exclusive"],
    tasks: [
      // Daily
      { title: "Inspect precision parts (engines, carbon fiber, custom metals)", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate testing results for speed, aerodynamics, safety", category: "Work", priority: "High" as TaskPriority },
      { title: "Track supply chain for rare materials (titanium, composites)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Manage client customization requests (bespoke interiors, paintwork)", category: "Work", priority: "High" as TaskPriority },
      { title: "Update engineering logs on new prototypes", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Host private driving experiences on closed tracks", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Engage with select collectors via one-on-one brand ambassadors", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Update design storytelling campaigns with innovation highlights", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Coordinate PR with luxury lifestyle magazines", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Audit production line quality and exclusivity thresholds", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Release limited production announcements (under 10 units)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Host global hypercar launch events (Monaco, Dubai, Geneva)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Build secondary-market hype through auction houses", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Partner with luxury lifestyle brands (watches, yachts, fashion)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Publish engineering journals for prestige and heritage", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "✈️ Private Jet Charter & Management Checklist",
    description: "Ultra-high-net-worth (UHNW) individuals rely on seamless, discreet, luxury jet experiences. It's about flawless operations, security, and personalization.",
    category: "Business & Entrepreneurship",
    tags: ["luxury", "aviation", "private-jet", "charter", "vip-service"],
    tasks: [
      // Daily
      { title: "Inspect jet fleet for mechanical readiness and luxury interior standards", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate crew rosters, licenses, and wellness checks", category: "Work", priority: "High" as TaskPriority },
      { title: "Review flight schedules, routes, and clearances", category: "Work", priority: "High" as TaskPriority },
      { title: "Personalize guest requests (menus, wines, cabin ambiance)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Track global fuel price fluctuations and optimize flight plans", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Host internal training on VIP guest protocols", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Audit aviation compliance logs (FAA, ICAO, EASA, etc.)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Update aircraft maintenance and detailing schedules", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Negotiate luxury catering and hospitality contracts", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Review fleet utilization and profitability", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Host VIP client appreciation events", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Publish safety, sustainability, and service innovation reports", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Evaluate aircraft acquisitions or upgrades (Gulfstream, Bombardier, Dassault)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Expand partnerships with luxury travel and lifestyle brands", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Audit cybersecurity for client data and flight manifests", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🎩 Airshow Luxury Experience Checklist",
    description: "Elite airshows (Paris, Farnborough, Dubai) mix aviation engineering, luxury networking, and collector culture. Some airshows cater only to the wealthiest aircraft buyers and enthusiasts.",
    category: "Business & Entrepreneurship",
    tags: ["luxury", "airshow", "aviation", "networking", "events"],
    tasks: [
      // Daily
      { title: "Validate aircraft showcase readiness (polished, secure, certified)", category: "Work", priority: "High" as TaskPriority },
      { title: "Coordinate with pilots for rehearsals and demonstration flights", category: "Work", priority: "High" as TaskPriority },
      { title: "Manage VIP guest passes and ultra-exclusive lounges", category: "Work", priority: "High" as TaskPriority },
      { title: "Track safety clearances for air demonstrations", category: "Work", priority: "High" as TaskPriority },
      { title: "Document event footage for luxury brand campaigns", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Host private showings for high-value buyers (military & civilian)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Engage UHNW guests with tailored aviation experiences", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Audit catering, lounges, and hospitality setups", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Review partnerships with sponsors and luxury brands", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Train staff in high-security and confidential client handling", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Host gala dinners for collectors and aviation executives", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Publish insider aviation reports for members or VIP buyers", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Evaluate exhibitor ROI and sales pipeline conversion", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Renew contracts with aerospace companies for exclusivity", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Expand luxury programming (VIP jet tours, simulators, pilots' clubs)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Experimental Aircraft & Futuristic Pilot Program Checklist",
    description: "Testing and flying experimental or futuristic aircraft requires elite pilots, safety precision, and investor storytelling. This sector is a mix of aerospace engineering and luxury adventure.",
    category: "Business & Entrepreneurship",
    tags: ["luxury", "experimental-aircraft", "aerospace", "innovation", "testing"],
    tasks: [
      // Daily
      { title: "Inspect prototype aircraft readiness and logs", category: "Work", priority: "High" as TaskPriority },
      { title: "Conduct pre-flight simulations and pilot briefings", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate safety protocols and data monitoring systems", category: "Work", priority: "High" as TaskPriority },
      { title: "Track experimental design testing metrics", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Communicate results to engineers, sponsors, and regulators", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Host investor updates and private demonstrations", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Audit compliance with airspace regulations and innovation licenses", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Conduct crash safety, eVTOL, and hydrogen-electric testing", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Review AI-assisted autopilot development", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Manage global PR with controlled storytelling", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Release investor reports with progress milestones", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Host exclusive 'future flight' experiences for UHNW early adopters", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Partner with universities and defense contractors for research", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Audit insurance and liability frameworks for test flights", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Publish whitepapers and secure media coverage in elite aviation circles", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Luxury Pilot Training Academy Checklist",
    description: "Some elites pursue private pilot licenses (PPL), aerobatic training, or even astronaut prep as a luxury lifestyle badge. Training academies must deliver prestige, safety, and exclusivity.",
    category: "Business & Entrepreneurship",
    tags: ["luxury", "pilot-training", "aviation", "education", "prestige"],
    tasks: [
      // Daily
      { title: "Inspect training aircraft (Cessna, Cirrus, jets) for readiness", category: "Work", priority: "High" as TaskPriority },
      { title: "Track student schedules and VIP training preferences", category: "Work", priority: "High" as TaskPriority },
      { title: "Conduct daily safety briefings with staff and students", category: "Work", priority: "High" as TaskPriority },
      { title: "Review airfield conditions and airspace restrictions", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Personalize lessons with simulators and AI tools", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Host networking dinners with instructors, pilots, and VIPs", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Audit simulator programs and update digital training modules", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Validate student performance tracking with precision reports", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Conduct elite aerobatic and advanced pilot skill drills", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Partner with luxury concierge services for clients' families", category: "Work", priority: "Low" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Host certificate award ceremonies with prestige branding", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Publish academy progress reports and media features", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Launch 'pilot lifestyle' packages (jet clubs, co-ownership programs)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Expand into spaceflight and astronaut readiness training", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Audit academy safety and global aviation authority compliance", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🛫 Ultra-Luxury Sky Cruise Concept Checklist",
    description: "The futuristic concept of luxury sky cruises (flying hotels in the sky) requires a blend of aviation, luxury hospitality, and extreme innovation.",
    category: "Business & Entrepreneurship",
    tags: ["luxury", "sky-cruise", "innovation", "hospitality", "futuristic"],
    tasks: [
      // Daily
      { title: "Inspect massive airborne vessel readiness (engines, AI systems)", category: "Work", priority: "High" as TaskPriority },
      { title: "Review onboard hospitality services (restaurants, spas, suites)", category: "Work", priority: "High" as TaskPriority },
      { title: "Monitor guest experience data (luxury comfort, safety, entertainment)", category: "Work", priority: "High" as TaskPriority },
      { title: "Track real-time weather and flight route optimization", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Manage pilot and crew scheduling with luxury client preferences", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Host themed luxury events onboard (gala dinners, concerts, art shows)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Train staff in VIP and UHNW client management", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Audit luxury facilities (gyms, pools, theaters) for elite standards", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Develop content and PR campaigns showcasing exclusivity", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Coordinate partnerships with global tourism boards and luxury brands", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Release limited 'sky voyage' packages for VIPs", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Audit compliance with aviation mega-regulations", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Publish curated documentaries to build mystique and prestige", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Expand offerings into space tourism hybrid packages", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Host media events to reinforce the 'future of luxury travel' branding", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "📸 Luxury Brand Photographer Checklist",
    description: "Shooting for luxury fashion, watches, jewelry, or cars means flawless lighting, exclusivity, and brand storytelling.",
    category: "Business & Entrepreneurship",
    tags: ["luxury", "photography", "brand", "fashion", "creative"],
    tasks: [
      // Daily
      { title: "Inspect and calibrate high-end cameras, lenses, and lighting rigs", category: "Work", priority: "High" as TaskPriority },
      { title: "Review creative brief with brand executives", category: "Work", priority: "High" as TaskPriority },
      { title: "Scout and test shoot locations (studio, rooftop, exotic landscapes)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Coordinate with stylists, makeup artists, and set designers", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Capture test shots and adjust settings for brand color standards", category: "Work", priority: "High" as TaskPriority },
      // Weekly
      { title: "Manage editing and retouching with brand-approved filters and tones", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Deliver secure previews to VIP clients and art directors", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Host review meetings with creative teams and marketing leads", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Backup and archive photos with encrypted cloud systems", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Audit contracts and licensing for brand campaigns", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Release final curated sets for global ad campaigns", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Update luxury photography portfolio with approved work", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Build behind-the-scenes storytelling content", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Partner with magazines, influencers, and PR firms for cross-promotion", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Invest in next-gen gear (medium format, 8K video rigs, drones)", category: "Work", priority: "Low" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🦁 Wildlife & Expedition Photographer Checklist",
    description: "Capturing rare animals, safaris, or extreme expeditions requires gear ruggedness, patience, and safety.",
    category: "Business & Entrepreneurship",
    tags: ["luxury", "photography", "wildlife", "expedition", "conservation"],
    tasks: [
      // Daily
      { title: "Check weather and terrain conditions for shoots", category: "Work", priority: "High" as TaskPriority },
      { title: "Inspect rugged cameras, telephoto lenses, drones, and protective cases", category: "Work", priority: "High" as TaskPriority },
      { title: "Review local wildlife behavior and safety precautions", category: "Work", priority: "High" as TaskPriority },
      { title: "Secure permits for protected areas and species", category: "Work", priority: "High" as TaskPriority },
      { title: "Capture golden hour and night-vision wildlife sequences", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Sync with local guides, scientists, and trackers", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Backup and geo-tag images in secure storage systems", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Host field reviews with sponsors or media teams", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Audit equipment wear-and-tear from rugged use", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Develop educational or conservation storytelling", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Deliver curated wildlife stories for magazines, NGOs, or sponsors", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Exhibit works in galleries or exclusive events", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "License rare images for luxury publications and documentaries", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Partner with conservation initiatives for prestige branding", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Scout new global hotspots for upcoming expeditions", category: "Work", priority: "Low" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },

  // ============= TRAVEL & VACATION =============
  {
    name: "Vacation Planning Checklist",
    description: "Everything you need for a stress-free trip",
    category: "Travel & Vacation",
    tags: ["travel", "vacation", "planning", "checklist"],
    tasks: [
      { title: "Book flights and accommodation", category: "Personal", priority: "High" as TaskPriority },
      { title: "Check passport and visa requirements", category: "Personal", priority: "High" as TaskPriority },
      { title: "Research activities and attractions", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Create packing list", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Arrange pet/house sitting", category: "Personal", priority: "High" as TaskPriority, scheduledDaysFromNow: -7 },
      { title: "Set out-of-office messages", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: -1 },
      { title: "Pack luggage", category: "Personal", priority: "High" as TaskPriority, scheduledDaysFromNow: -2 },
    ]
  },
  {
    name: "Business Trip Preparation",
    description: "Professional travel made efficient",
    category: "Travel & Vacation",
    tags: ["business", "travel", "work", "preparation"],
    tasks: [
      { title: "Confirm meeting schedules", category: "Work", priority: "High" as TaskPriority },
      { title: "Prepare presentation materials", category: "Work", priority: "High" as TaskPriority },
      { title: "Book travel and hotel", category: "Work", priority: "High" as TaskPriority },
      { title: "Print business cards and documents", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Pack business attire", category: "Personal", priority: "Medium" as TaskPriority, scheduledDaysFromNow: -1 },
      { title: "Download offline maps and apps", category: "Personal", priority: "Low" as TaskPriority },
    ]
  },
  {
    name: "🔭 Astronomy Research Checklist",
    description: "Modern astronomical research combining observational work, AI data processing, instrumentation, and public engagement with space-based telescopes",
    category: "Academic & Research",
    tags: ["astronomy", "telescopes", "observational", "data-analysis", "space", "research"],
    tasks: [
      // Daily tasks
      { title: "Calibrate telescopes (optical, radio, space-based) to ensure accuracy", category: "Work", priority: "High" as TaskPriority, timer: 45 },
      { title: "Review observation schedules aligned with celestial events (eclipses, transits, supernovae)", category: "Work", priority: "High" as TaskPriority, timer: 30 },
      { title: "Monitor real-time data feeds from satellites, probes, and ground telescopes", category: "Work", priority: "High" as TaskPriority, timer: 40 },
      { title: "Run nightly sky surveys (star mapping, galaxy identification, exoplanet transit detection)", category: "Work", priority: "Medium" as TaskPriority, timer: 180 },
      { title: "Archive raw astronomical data into secure digital storage for long-term analysis", category: "Work", priority: "Medium" as TaskPriority, timer: 30 },
      // Weekly tasks
      { title: "Process imaging data with AI/ML for anomaly detection (new stars, comets, fast radio bursts)", category: "Work", priority: "High" as TaskPriority, timer: 240, scheduledDaysFromNow: 7 },
      { title: "Collaborate with global observatories on shared observation targets", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Submit observation logs to international databases (IAU, NASA, ESA)", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Host astronomy outreach events (planetarium shows, star parties, student lectures)", category: "Work", priority: "Low" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Maintain telescope hardware: optics cleaning, sensor recalibration, dome mechanics", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Publish preliminary findings in astronomy bulletins or journals", category: "Work", priority: "Medium" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Update stellar catalogs with new data on exoplanets, nebulae, and galaxies", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Coordinate with astrophysics teams on modeling (dark matter, cosmology, black holes)", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Apply for telescope observation time on major facilities (Hubble, James Webb, ALMA)", category: "Work", priority: "High" as TaskPriority, timer: 240, scheduledDaysFromNow: 30 },
      { title: "Secure grants and funding for future research projects", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🛰 Space Observatory & Satellite Checklist",
    description: "Space-based astronomical missions managing spacecraft operations, data transmission, and orbital telescopes like JWST and Hubble",
    category: "Academic & Research", 
    tags: ["space-observatory", "satellites", "spacecraft", "mission-control", "jwst", "hubble"],
    tasks: [
      // Daily tasks
      { title: "Track orbital status of telescopes and satellites", category: "Work", priority: "High" as TaskPriority, timer: 20 },
      { title: "Validate data transmission integrity from instruments to ground stations", category: "Work", priority: "High" as TaskPriority, timer: 30 },
      { title: "Monitor spacecraft health (fuel levels, solar array output, sensor alignment)", category: "Work", priority: "High" as TaskPriority, timer: 40 },
      { title: "Detect space weather events (solar flares, cosmic ray interference)", category: "Work", priority: "Medium" as TaskPriority, timer: 25 },
      { title: "Update observation tasking systems for targets of opportunity (gamma-ray bursts, supernovae)", category: "Work", priority: "Medium" as TaskPriority, timer: 35 },
      // Weekly tasks
      { title: "Conduct software updates for spacecraft instrumentation", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Analyze imaging anomalies for sensor degradation or cosmic dust interference", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Coordinate observation campaigns across multiple observatories", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Disseminate space imagery to science and media partners", category: "Work", priority: "Low" as TaskPriority, timer: 45, scheduledDaysFromNow: 7 },
      { title: "Hold mission status meetings with engineering + science teams", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Publish mission progress reports for funding agencies", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Archive datasets in open science repositories for global access", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Plan future observation schedules for rare celestial alignments", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Test backup systems for spacecraft safety and longevity", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Propose new mission objectives for extended satellite operations", category: "Work", priority: "Medium" as TaskPriority, timer: 150, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🪐 Planetary & Cosmology Research Checklist", 
    description: "Advanced research in exoplanets, habitability, cosmic evolution, and theoretical astrophysics with computational modeling",
    category: "Academic & Research",
    tags: ["planetary-science", "cosmology", "exoplanets", "astrophysics", "theoretical", "modeling"],
    tasks: [
      // Daily tasks
      { title: "Run simulations of planetary atmospheres and orbital mechanics", category: "Work", priority: "High" as TaskPriority, timer: 120 },
      { title: "Monitor new exoplanet discoveries from missions like TESS and Kepler archives", category: "Work", priority: "Medium" as TaskPriority, timer: 30 },
      { title: "Update cosmological models with recent observational data (CMB, galaxy clusters)", category: "Work", priority: "High" as TaskPriority, timer: 60 },
      { title: "Coordinate with astrobiology teams on biosignature detection methods", category: "Work", priority: "Medium" as TaskPriority, timer: 45 },
      { title: "Track gravitational wave alerts and follow-up observations", category: "Work", priority: "Medium" as TaskPriority, timer: 25 },
      // Weekly tasks
      { title: "Collaborate with space agencies on mission planning (Mars, Europa, Titan, exoplanet probes)", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Analyze telescope spectra for atmospheric chemistry of exoplanets", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Engage AI models for galaxy formation simulations", category: "Work", priority: "High" as TaskPriority, timer: 240, scheduledDaysFromNow: 7 },
      { title: "Present findings in virtual colloquia or departmental seminars", category: "Work", priority: "Low" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Cross-check cosmological constants with new observational results", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Submit peer-reviewed papers on planetary or cosmological studies", category: "Work", priority: "High" as TaskPriority, timer: 300, scheduledDaysFromNow: 30 },
      { title: "Attend global astronomy/astrophysics conferences (IAU, AAS, COSPAR)", category: "Work", priority: "Medium" as TaskPriority, timer: 480, scheduledDaysFromNow: 30 },
      { title: "Apply for supercomputing time for large-scale simulations", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Review theoretical models of dark matter, dark energy, and cosmic inflation", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Propose new missions or instrument concepts to space agencies", category: "Work", priority: "Medium" as TaskPriority, timer: 240, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🌠 Public Astronomy & Education Checklist",
    description: "Astronomy outreach and science communication building public engagement, STEM education, and citizen science participation",
    category: "Academic & Research",
    tags: ["astronomy-outreach", "science-education", "planetarium", "citizen-science", "public-engagement", "stem"],
    tasks: [
      // Daily tasks
      { title: "Update planetarium or science museum programming with current celestial events", category: "Work", priority: "Medium" as TaskPriority, timer: 30 },
      { title: "Manage social media astronomy accounts with daily skywatching tips", category: "Work", priority: "Low" as TaskPriority, timer: 20 },
      { title: "Respond to public inquiries about astronomy phenomena (eclipses, meteor showers)", category: "Work", priority: "Medium" as TaskPriority, timer: 45 },
      { title: "Track citizen science contributions (Galaxy Zoo, exoplanet hunters, SETI)", category: "Work", priority: "Low" as TaskPriority, timer: 30 },
      { title: "Capture astrophotography images for public distribution", category: "Work", priority: "Low" as TaskPriority, timer: 60 },
      // Weekly tasks
      { title: "Host star parties, telescope nights, and online live streams of sky events", category: "Work", priority: "Medium" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Develop educational content for schools, universities, and online platforms", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Publish astronomy newsletters with observation guides", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Partner with influencers and educators for outreach campaigns", category: "Work", priority: "Low" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Engage students in research projects with professional astronomers", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Release public reports on astronomy discoveries and upcoming sky events", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Apply for funding and grants tied to STEM education initiatives", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Collaborate with TV, film, and media companies for science content", category: "Work", priority: "Low" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Create global events for eclipses, planetary alignments, or comet passes", category: "Work", priority: "Medium" as TaskPriority, timer: 240, scheduledDaysFromNow: 30 },
      { title: "Build community networks for amateur astronomers worldwide", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🧠 Cybersecurity Research Lab Checklist",
    description: "A dedicated cybersecurity lab focuses on offensive & defensive testing, AI-driven threat analysis, and publishing research papers.",
    category: "Academic & Research",
    tags: ["cybersecurity", "research", "penetration-testing", "ai-security", "threat-analysis"],
    tasks: [
      // Daily
      { title: "Review live threat feeds (zero-day exploits, ransomware, APT groups)", category: "Work", priority: "High" as TaskPriority },
      { title: "Conduct penetration testing on sandboxed environments", category: "Work", priority: "High" as TaskPriority, timer: 120 },
      { title: "Monitor honeypots for malicious actor activity", category: "Work", priority: "High" as TaskPriority },
      { title: "Test AI/ML models for anomaly detection accuracy", category: "Work", priority: "Medium" as TaskPriority, timer: 90 },
      { title: "Document all experiments with reproducible logs", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Host internal research reviews with team leads", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Audit lab isolation and air-gapped systems for integrity", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Run red team vs. blue team drills", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Update repositories with shared open-source or proprietary tools", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Sync with external researchers and publish findings (when ethical)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Publish formal research whitepapers or journal submissions", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Present results at cybersecurity conferences (Black Hat, DEF CON, RSA)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Secure new funding or grants for lab expansion", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Upgrade infrastructure (quantum-resilient cryptography, AI GPU clusters)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Build partnerships with universities, enterprises, and government orgs", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🛡️ Corporate Cyber Defense Team Checklist",
    description: "Large enterprises face constant cyberattacks and require structured defense routines for CISOs, IT teams, and compliance managers.",
    category: "Academic & Research",
    tags: ["cybersecurity", "corporate-defense", "siem", "compliance", "incident-response"],
    tasks: [
      // Daily
      { title: "Review SIEM dashboards for anomalies (Splunk, Sentinel, etc.)", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate endpoint protection status across global devices", category: "Work", priority: "High" as TaskPriority },
      { title: "Test phishing filters with simulated emails", category: "Work", priority: "High" as TaskPriority },
      { title: "Track network traffic for exfiltration attempts", category: "Work", priority: "High" as TaskPriority },
      { title: "Patch critical vulnerabilities across infrastructure", category: "Work", priority: "High" as TaskPriority },
      // Weekly
      { title: "Run vulnerability scans and risk assessments", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Conduct insider threat monitoring audits", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Review IAM (identity & access management) logs", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Train employees with micro-cyber lessons", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Audit compliance (GDPR, HIPAA, PCI-DSS, SOC 2, ISO 27001)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Host red team attack simulations vs. blue team defenders", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Publish internal security reports to executives & board", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Update incident response playbooks with real-world lessons", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Renew penetration testing contracts with ethical hackers", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Evaluate cyber insurance policies and liabilities", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🎓 Academic Cybersecurity Researcher Checklist",
    description: "Professors, PhD candidates, and deep researchers create new theories, cryptographic models, and AI security breakthroughs.",
    category: "Academic & Research",
    tags: ["cybersecurity", "academic-research", "cryptography", "ai-security", "peer-review"],
    tasks: [
      // Daily
      { title: "Review academic papers and citations in security journals", category: "Work", priority: "High" as TaskPriority },
      { title: "Conduct experiments on controlled datasets", category: "Work", priority: "High" as TaskPriority, timer: 120 },
      { title: "Train AI security models for adversarial resilience", category: "Work", priority: "Medium" as TaskPriority, timer: 90 },
      { title: "Document findings in structured research notes", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Mentor graduate students on lab work and thesis prep", category: "Work", priority: "Medium" as TaskPriority, timer: 60 },
      // Weekly
      { title: "Host seminars on recent cyber incidents and lessons", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Collaborate with other universities or cross-border teams", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Audit research ethics and compliance with data laws", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Draft working papers for conferences", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Apply new frameworks (zero trust, homomorphic encryption, quantum-safe crypto)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Publish peer-reviewed papers in journals (IEEE, ACM, Nature Cybersecurity)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Present at international research summits", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Apply for grants from NSF, DARPA, Horizon Europe, etc.", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Host hackathons and AI-augmented research challenges", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Train new researchers on lab protocols and cyber ethics", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "⚙️ MLOps Engineer Checklist (AI Infrastructure & Deployment)",
    description: "Monitor production pipelines, manage AI infrastructure, and ensure reliable deployment of machine learning models at scale",
    category: "Academic & Research",
    tags: ["mlops", "ai-infrastructure", "deployment", "devops", "kubernetes"],
    tasks: [
      // Daily
      { title: "Monitor production pipelines for errors (data ingestion, feature extraction, training jobs)", category: "Work", priority: "High" as TaskPriority },
      { title: "Check resource usage (GPU/TPU utilization, cloud cost spikes)", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate CI/CD builds for ML workflows (Jenkins, GitHub Actions, GitLab CI)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Roll back failed deployments quickly using versioned models", category: "Work", priority: "High" as TaskPriority },
      { title: "Inspect system logs for hardware failures", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Test disaster recovery scenarios for production AI systems", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Update orchestration configs (Kubernetes, Airflow, Kubeflow Pipelines)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Run integration tests for API endpoints serving models", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Optimize caching & storage for large datasets (object storage, databases)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Train ops team in new tools (Docker updates, Terraform scripts)", category: "Work", priority: "Low" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Audit cloud costs and optimize (spot instances, model compression)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Benchmark performance of serving infrastructure (latency, throughput, uptime)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Perform security audits (API access logs, token expirations)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Update infrastructure documentation for future scaling", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Validate compliance with GDPR, HIPAA, SOC 2", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🧬 AI Research Scientist Checklist",
    description: "Conduct cutting-edge AI research, publish papers, prototype novel architectures, and collaborate with academic communities",
    category: "Academic & Research",
    tags: ["ai-research", "machine-learning", "publications", "grants", "academia"],
    tasks: [
      // Daily
      { title: "Read new AI/ML papers (arXiv, NeurIPS, ICML, CVPR)", category: "Work", priority: "High" as TaskPriority, timer: 60 },
      { title: "Prototype small experiments to test novel architectures", category: "Work", priority: "High" as TaskPriority, timer: 120 },
      { title: "Document reproducibility challenges in lab notes", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Share findings with peers for peer review", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Track citations and references in research database", category: "Work", priority: "Low" as TaskPriority },
      // Weekly
      { title: "Conduct ablation studies on models to test component importance", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Review datasets for hidden biases and representation gaps", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Submit progress reports for ongoing grants/projects", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Mentor junior researchers and graduate students", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Host lab seminars on recent breakthroughs", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Submit research papers to conferences/journals", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Apply for new grants or renew current funding", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Collaborate with cross-disciplinary teams (biology, physics, law)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Release open-source tools or datasets for community impact", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Evaluate emerging research trends (quantum ML, neuromorphic AI)", category: "Work", priority: "Low" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "⚖️ AI Ethics & Responsible AI Checklist",
    description: "Ensure fairness, transparency, and accountability in AI systems through bias audits, ethical reviews, and regulatory compliance",
    category: "Academic & Research",
    tags: ["ai-ethics", "responsible-ai", "bias-detection", "fairness", "compliance"],
    tasks: [
      // Daily
      { title: "Audit training datasets for fairness, diversity, and bias", category: "Work", priority: "High" as TaskPriority, timer: 45 },
      { title: "Document sources of training data for transparency", category: "Work", priority: "High" as TaskPriority },
      { title: "Run fairness metrics (equalized odds, demographic parity)", category: "Work", priority: "High" as TaskPriority },
      { title: "Monitor deployed AI for discriminatory outputs", category: "Work", priority: "High" as TaskPriority },
      { title: "Maintain a log of ethical risks per project", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Host ethics review sessions with stakeholders", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Cross-check model outputs against regulatory guidelines", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Update ethical checklists based on evolving laws (EU AI Act, US AI Bill of Rights)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Draft responsible AI documentation (model cards, datasheets for datasets)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Engage with affected communities for feedback", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Publish bias audit reports for transparency", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Update AI explainability methods (SHAP, LIME, counterfactuals)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Work with legal/compliance teams on risk assessments", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Hold cross-functional workshops (engineers, ethicists, lawyers, policymakers)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Present ethics findings at academic/industry events", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "📊 AI Data Engineer Checklist",
    description: "Build robust data pipelines, ensure data quality, and manage large-scale datasets for machine learning projects",
    category: "Academic & Research",
    tags: ["data-engineering", "etl", "data-quality", "pipelines", "big-data"],
    tasks: [
      // Daily
      { title: "Validate new data for quality and consistency", category: "Work", priority: "High" as TaskPriority },
      { title: "Run ETL (Extract, Transform, Load) pipelines into data warehouses", category: "Work", priority: "High" as TaskPriority },
      { title: "Monitor ingestion jobs for errors", category: "Work", priority: "High" as TaskPriority },
      { title: "Ensure data labeling tools are functioning correctly", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Track anomalies in streaming data pipelines", category: "Work", priority: "High" as TaskPriority },
      // Weekly
      { title: "Perform schema validation across datasets", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Rebalance data for underrepresented classes", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Optimize storage formats (Parquet, ORC, TFRecords)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Audit PII removal/anonymization for privacy laws", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Train annotation teams on labeling accuracy", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Run large-scale data audits and generate lineage reports", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Update data dictionaries and feature stores", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Integrate new data sources into pipelines", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Archive outdated data to reduce storage costs", category: "Work", priority: "Low" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Test scalability of pipelines for larger workloads", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "👁️ Computer Vision Engineer Checklist",
    description: "Develop and optimize computer vision models for image/video processing, object detection, and visual recognition tasks",
    category: "Academic & Research",
    tags: ["computer-vision", "image-processing", "deep-learning", "object-detection", "cv"],
    tasks: [
      // Daily
      { title: "Test models on diverse image/video datasets", category: "Work", priority: "High" as TaskPriority, timer: 90 },
      { title: "Validate bounding boxes and segmentation accuracy", category: "Work", priority: "High" as TaskPriority },
      { title: "Run augmentations (rotation, lighting, scaling)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Inspect mislabeled/unclear images", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Monitor GPU training performance", category: "Work", priority: "High" as TaskPriority },
      // Weekly
      { title: "Benchmark against SOTA architectures (YOLOv8, ViTs, SAM, CLIP)", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Test robustness on real-world noisy/blurred images", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Generate adversarial images to test resilience", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Validate domain transfer (synthetic → real-world data)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Train pipelines on new datasets (medical, satellite, retail)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Release vision models as APIs or apps", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Optimize inference (ONNX, TensorRT, pruning, quantization)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Test edge deployment on mobile/cameras/IoT", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Audit datasets for ethical issues (facial recognition, surveillance)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Publish benchmarks for external validation", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "💬 NLP / LLM Developer Checklist",
    description: "Build and fine-tune natural language processing models, large language models, and conversational AI systems",
    category: "Academic & Research",
    tags: ["nlp", "llm", "language-models", "fine-tuning", "chatbots"],
    tasks: [
      // Daily
      { title: "Evaluate new prompts and fine-tuning results", category: "Work", priority: "High" as TaskPriority, timer: 60 },
      { title: "Track hallucinations in model outputs", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate embeddings and tokenization performance", category: "Work", priority: "High" as TaskPriority },
      { title: "Inspect sentiment, toxicity, and coherence", category: "Work", priority: "High" as TaskPriority },
      { title: "Monitor training loss during LLM fine-tuning", category: "Work", priority: "High" as TaskPriority },
      // Weekly
      { title: "Run evaluation benchmarks (GLUE, SuperGLUE, HELM)", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Train/fine-tune with domain-specific datasets (legal, finance, medicine)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Test multilingual and cross-lingual performance", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Build retrieval-augmented generation (RAG) pipelines", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Audit model outputs for harmful content", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Release new fine-tuned models or LLM APIs", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Publish benchmark comparisons against competitors", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Integrate guardrails for safety (RLHF, constitutional AI)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Test long-context performance (1M tokens+)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Review compliance with copyright/IP policies", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🎮 Reinforcement Learning Engineer Checklist",
    description: "Develop RL algorithms, train agents in simulated environments, and deploy reinforcement learning systems for real-world applications",
    category: "Academic & Research",
    tags: ["reinforcement-learning", "rl", "agents", "simulation", "optimization"],
    tasks: [
      // Daily
      { title: "Monitor training stability (avoid divergence)", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate environment parameters and reward signals", category: "Work", priority: "High" as TaskPriority },
      { title: "Track exploration vs. exploitation balance", category: "Work", priority: "High" as TaskPriority },
      { title: "Log simulation results for reproducibility", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Debug agent behavior anomalies", category: "Work", priority: "High" as TaskPriority },
      // Weekly
      { title: "Conduct robustness tests in different environments", category: "Work", priority: "High" as TaskPriority, timer: 150, scheduledDaysFromNow: 7 },
      { title: "Run hyperparameter sweeps to optimize learning", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Compare on-policy vs. off-policy algorithms", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Evaluate transfer learning across similar tasks", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Benchmark against baselines (DQN, PPO, A3C, SAC)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Publish agent performance metrics and leaderboards", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Test RL in real-world scenarios (robots, games, logistics)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Optimize compute usage (parallelization, distributed training)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Release open-source environments for community testing", category: "Work", priority: "Low" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Document ethical risks (reward hacking, unsafe exploration)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🛡️ AI Security & Adversarial ML Checklist",
    description: "Protect AI systems from adversarial attacks, conduct security audits, and develop robust defenses for machine learning models",
    category: "Academic & Research",
    tags: ["ai-security", "adversarial-ml", "security-audits", "attack-defense", "robustness"],
    tasks: [
      // Daily
      { title: "Run adversarial attacks (FGSM, PGD, DeepFool)", category: "Work", priority: "High" as TaskPriority, timer: 90 },
      { title: "Monitor poisoning/backdoor attempts on datasets", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate defenses (adversarial training, defensive distillation)", category: "Work", priority: "High" as TaskPriority },
      { title: "Inspect logs for anomaly patterns", category: "Work", priority: "High" as TaskPriority },
      { title: "Track open vulnerabilities in ML libraries (TensorFlow, PyTorch, Hugging Face)", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Conduct red team vs. AI model penetration tests", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Validate security of model APIs (rate limiting, access controls)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Test membership inference & model extraction attacks", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Audit third-party datasets for tampering risks", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Train team in secure ML practices", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Publish internal security reports for stakeholders", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Patch vulnerabilities in ML frameworks", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Update adversarial training pipelines with new threats", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Collaborate with external AI security researchers", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Validate compliance with AI safety/security regulations", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🌾 AI in Agriculture & Food Systems Checklist",
    description: "Apply AI to optimize farming operations, monitor crop health, and enhance global food security through precision agriculture",
    category: "Academic & Research",
    tags: ["ai-agriculture", "agtech", "precision-farming", "food-systems", "sustainability"],
    tasks: [
      // Daily
      { title: "Monitor drone/satellite imagery for crop health", category: "Work", priority: "High" as TaskPriority },
      { title: "Run AI-based irrigation and fertilization optimization", category: "Work", priority: "High" as TaskPriority },
      { title: "Track livestock health using computer vision sensors", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate greenhouse sensors for humidity/temperature", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Log real-time farm yield predictions", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Train new crop disease detection models", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Audit AI recommendations for sustainability compliance", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Test supply chain optimization for perishable goods", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Collaborate with agri-tech startups on soil analytics", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Validate new vertical farming AI models", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Release yield forecasts for agricultural markets", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Test carbon-footprint reduction strategies", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Benchmark AI solutions against traditional farming results", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Publish reports to agricultural councils & NGOs", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Review AI's role in global food security strategies", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "💻 AI + Software Development Grant Checklist",
    description: "Complete grant proposal checklist for AI software development - NSF SBIR, ARPA-I, DOE, and state innovation programs",
    category: "Academic & Research",
    tags: ["ai-software", "grant-writing", "nsf", "sbir", "arpa", "doe", "innovation", "research"],
    tasks: [
      // Strategic Alignment
      { title: "Define measurable industry bottleneck and quantify cost ($ loss/hr)", category: "Work", priority: "High" as TaskPriority },
      { title: "Document AI necessity (why classical software cannot solve it)", category: "Work", priority: "High" as TaskPriority },
      { title: "Reference National AI R&D Strategic Plan 2023-2024", category: "Work", priority: "High" as TaskPriority },
      { title: "Tie proposal to 'AI for Economic Competitiveness' or 'Secure Infrastructure'", category: "Work", priority: "High" as TaskPriority },
      { title: "Include societal/workforce benefit (job creation, ethical AI, training)", category: "Work", priority: "High" as TaskPriority },
      // Technical Architecture & Implementation
      { title: "Draw system blueprint (UI → API → Model → Database → Monitoring)", category: "Work", priority: "High" as TaskPriority, timer: 90 },
      { title: "Document microservices (Docker containers, REST/GraphQL endpoints)", category: "Work", priority: "High" as TaskPriority },
      { title: "Define algorithms (BERT, CNN, XGBoost, LSTM) and data schema", category: "Work", priority: "High" as TaskPriority },
      { title: "Identify data sources (open datasets, client data, synthetic)", category: "Work", priority: "High" as TaskPriority },
      { title: "Build labeling protocol (inter-annotator ≥0.85) and choose platform", category: "Work", priority: "High" as TaskPriority },
      { title: "Draft data license agreements and IP assignment", category: "Work", priority: "High" as TaskPriority },
      { title: "Apply de-identification and document U.S. AI Bill of Rights compliance", category: "Work", priority: "High" as TaskPriority },
      { title: "Set encryption standards (AES-256, TLS 1.3) and RBAC with audit logs", category: "Work", priority: "High" as TaskPriority },
      { title: "Define data lifecycle (≤3 years retention, auto-purge scripts)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Plan model training (70/20/10 split, MLflow/DVC, reproducible)", category: "Work", priority: "High" as TaskPriority },
      { title: "Conduct bias audit (check <5% variance across demographic subsets)", category: "Work", priority: "High" as TaskPriority },
      { title: "Set up CI/CD pipeline (GitHub Actions or Jenkins)", category: "Work", priority: "High" as TaskPriority },
      { title: "Containerize with Docker + Kubernetes orchestration", category: "Work", priority: "High" as TaskPriority },
      { title: "Implement monitoring (Prometheus, Grafana) and drift alerts", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Schedule model retraining cycle (every 30 days)", category: "Work", priority: "Medium" as TaskPriority },
      // Team Structure & Documentation
      { title: "Identify core roles (CTO-PI, AI Engineer, DevOps, Backend, UX/UI, PM)", category: "Work", priority: "High" as TaskPriority },
      { title: "Secure advisory support (research mentor or university AI lab)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Prepare résumés (2 pages max), bios, commitment letters, org chart", category: "Work", priority: "High" as TaskPriority },
      { title: "Set governance (weekly sprint review, monthly compliance review)", category: "Work", priority: "Medium" as TaskPriority },
      // Budget & Cost Narrative
      { title: "Calculate personnel rates × hours, justify by task", category: "Work", priority: "High" as TaskPriority },
      { title: "Request cloud credits (AWS Activate, GCP for Startups)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Budget hardware (GPUs, storage, networking)", category: "Work", priority: "High" as TaskPriority },
      { title: "Include software licenses (IDE, labeling tool)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Budget security audits & compliance testing", category: "Work", priority: "High" as TaskPriority },
      { title: "Create multi-year cash-flow projection", category: "Work", priority: "High" as TaskPriority },
      // Responsible & Trustworthy AI
      { title: "Align with NIST AI Risk Management Framework (Govern-Map-Measure-Manage)", category: "Work", priority: "High" as TaskPriority },
      { title: "Create Model Card for each trained model (purpose, data, metrics, bias)", category: "Work", priority: "High" as TaskPriority },
      { title: "Create Data Sheet for each dataset (source, collection, intended use)", category: "Work", priority: "High" as TaskPriority },
      { title: "Add interpretability methods (SHAP, LIME)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Provide user transparency (explainability UI)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Conduct quarterly fairness testing & maintain audit logs", category: "Work", priority: "High" as TaskPriority },
      { title: "Perform security vulnerability scanning (OWASP Top 10)", category: "Work", priority: "High" as TaskPriority },
      // Evaluation, Impact & Scalability
      { title: "Define KPIs (latency ms, cost per inference, accuracy %, satisfaction %)", category: "Work", priority: "High" as TaskPriority },
      { title: "Build dashboard (Grafana, Superset)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Create scalability plan (multi-tenant architecture, horizontal scaling)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Estimate compute CO₂ footprint and add mitigation plan", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Define commercialization pathway (MVP → Beta → Production → SaaS)", category: "Work", priority: "High" as TaskPriority },
      // Submission Package
      { title: "Complete SBIR/NSF templates (Project Summary, Technical Narrative, Budget)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 40 },
      { title: "Finalize Data Management & Responsible AI appendices", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 45 },
      { title: "Collect letters of support (partners, beta customers)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 50 },
      { title: "Proofread for grammar and consistency", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 55 },
      { title: "Upload via Research.gov/Grants.gov ≥5 days before deadline", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 60 },
    ]
  },
  {
    name: "🌿 AI + Aquaponics Grant Writing Checklist",
    description: "Comprehensive grant proposal checklist for AI-powered aquaponics systems - USDA/NIFA aligned with federal AI priorities",
    category: "Academic & Research",
    tags: ["ai-agriculture", "grant-writing", "aquaponics", "usda", "nifa", "federal-funding", "research"],
    tasks: [
      // Problem + Alignment
      { title: "Draft problem definition with baseline numbers (pH drift, ammonia spikes, yield data)", category: "Work", priority: "High" as TaskPriority },
      { title: "Write AI solution statement (ML model type, ≥90% predictive reliability)", category: "Work", priority: "High" as TaskPriority },
      { title: "Align with USDA/NIFA priorities (sustainable intensification, water efficiency)", category: "Work", priority: "High" as TaskPriority },
      { title: "Reference U.S. AI Action Plan Pillars (Innovation, Trustworthy AI, Workforce)", category: "Work", priority: "High" as TaskPriority },
      // Technical Design
      { title: "Create system architecture diagram (Sensors → Edge MCU → Cloud → AI → Dashboard)", category: "Work", priority: "High" as TaskPriority, timer: 90 },
      { title: "List sensors & data streams (pH, DO, ammonia, nitrates, temp, EC, light, flow)", category: "Work", priority: "High" as TaskPriority },
      { title: "Design data labeling plan with QA process (2-person verification)", category: "Work", priority: "High" as TaskPriority },
      { title: "Define data ownership & licensing (farm partner retains rights)", category: "Work", priority: "High" as TaskPriority },
      { title: "Create data privacy & security plan (AES-256, TLS 1.3, RBAC)", category: "Work", priority: "High" as TaskPriority },
      { title: "Plan model training & validation (80/20 split, k-fold cross-validation)", category: "Work", priority: "High" as TaskPriority },
      { title: "Identify compute infrastructure (NVIDIA A100 or cloud credits)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Draft deployment plan (edge inference + cloud retraining schedule)", category: "Work", priority: "Medium" as TaskPriority },
      // Team & Partnerships
      { title: "Identify PI (AI Engineer or Ag Technologist)", category: "Work", priority: "High" as TaskPriority },
      { title: "List partner farms & universities", category: "Work", priority: "High" as TaskPriority },
      { title: "Draft MOUs (data sharing, pond access, equipment installation)", category: "Work", priority: "High" as TaskPriority },
      { title: "Prepare CVs & bios (AI Engineer, Aquaponics Expert, Field Tech, Extension Agent)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Collect signed letters of support (PDF format)", category: "Work", priority: "Medium" as TaskPriority },
      // Budget & Finance
      { title: "Create itemized budget (Sensors 20%, AI Compute 15%, Personnel 40%, etc.)", category: "Work", priority: "High" as TaskPriority },
      { title: "Generate 3-year cash-flow projection", category: "Work", priority: "High" as TaskPriority },
      { title: "Write budget justification (each line item ↔ specific task)", category: "Work", priority: "High" as TaskPriority },
      { title: "Prepare cost-share commitment letter", category: "Work", priority: "Medium" as TaskPriority },
      // Responsible AI & Compliance
      { title: "Conduct bias assessment (test on ≥3 farms multi-site data)", category: "Work", priority: "High" as TaskPriority },
      { title: "Document model transparency (version, training set, date lineage)", category: "Work", priority: "High" as TaskPriority },
      { title: "Define accountability (human-in-the-loop for >10% anomaly alerts)", category: "Work", priority: "High" as TaskPriority },
      { title: "Quantify environmental impact (kg N saved per year)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Obtain Institutional Ethics Board or university compliance note", category: "Work", priority: "High" as TaskPriority },
      // Impact & Sustainability
      { title: "Quantify KPIs (Yield ↑≥20%, Water use ↓≥30%)", category: "Work", priority: "High" as TaskPriority },
      { title: "Create dissemination plan (2 field days/year, 1 white paper/year)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Build commercialization plan (SaaS dashboard or OEM partnership)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Draft long-term expansion plan (regional replicability)", category: "Work", priority: "Low" as TaskPriority },
      // Submission Package
      { title: "Complete SF-424 forms", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Include biosketches, budget narrative, MOUs in submission", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 35 },
      { title: "Name files per grant guidelines", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 40 },
      { title: "Submit ≥48 hours before deadline", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 45 },
    ]
  },
  {
    name: "AI in Luxury & Rare Asset Industries Checklist",
    description: "Apply AI for authentication, valuation, and market analysis of diamonds, art, watches, wine, and collectible assets",
    category: "Academic & Research",
    tags: ["luxury-ai", "authentication", "rare-assets", "blockchain", "market-analysis"],
    tasks: [
      // Daily
      { title: "Run AI-powered authentication (gem scans, provenance tracking)", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate blockchain-based ownership records", category: "Work", priority: "High" as TaskPriority },
      { title: "Detect counterfeit goods using image recognition", category: "Work", priority: "High" as TaskPriority },
      { title: "Monitor real-time luxury auction platforms", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Log pricing anomalies in secondary markets", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Train market forecasting models for rare assets", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Audit AI for bias in luxury valuations", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Collaborate with curators & experts for labeling datasets", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Test AI-driven marketing campaigns for ultra-HNW clients", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Run generative AI models for concept luxury designs", category: "Work", priority: "Low" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Publish authentication transparency reports", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Test AI in private clienteling (personalized recommendations for UHNWIs)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Benchmark AI valuation against Christie's, Sotheby's, etc.", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Develop partnerships with insurers for rare assets", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Host invite-only demos of AI-curated luxury collections", category: "Work", priority: "Low" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🚀 AI for Space Exploration & Astronomy Checklist",
    description: "Leverage AI for deep space observations, spacecraft navigation, and astronomical discoveries using advanced machine learning",
    category: "Academic & Research",
    tags: ["space-ai", "astronomy", "spacecraft", "exoplanets", "astrophysics"],
    tasks: [
      // Daily
      { title: "Process telescope/satellite image data for noise reduction", category: "Work", priority: "High" as TaskPriority, timer: 90 },
      { title: "Detect anomalies in deep-space observations (new stars, exoplanets, comets)", category: "Work", priority: "High" as TaskPriority },
      { title: "Run AI-driven navigation simulations for spacecraft", category: "Work", priority: "High" as TaskPriority },
      { title: "Test ML pipelines on planetary rovers (Mars, Moon missions)", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate astronomical event predictions against observatory logs", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Train AI on star catalog updates from Hubble, JWST, Gaia", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Audit AI for false positives in exoplanet detection", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Simulate autonomous navigation for spacecraft fleets", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Collaborate with astrophysicists for data validation", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Benchmark AI discovery models against human astronomers", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Publish findings to astrophysics journals or NASA/ESA reports", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Test AI in low-power environments for space-ready hardware", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Generate AI-driven space weather forecasts (solar storms, cosmic rays)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Audit ethics of AI-guided asteroid mining projects", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Plan for AI integration into international space station and lunar bases", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "⚛️ Quantum AI / Neuromorphic Computing Checklist",
    description: "Develop and test quantum AI algorithms and neuromorphic computing systems for next-generation artificial intelligence",
    category: "Academic & Research",
    tags: ["quantum-ai", "neuromorphic", "quantum-computing", "qml", "advanced-computing"],
    tasks: [
      // Daily
      { title: "Test AI workloads on hybrid quantum-classical systems", category: "Work", priority: "High" as TaskPriority, timer: 120 },
      { title: "Validate quantum circuits for ML algorithms", category: "Work", priority: "High" as TaskPriority },
      { title: "Track performance of neuromorphic chips on spiking neural networks", category: "Work", priority: "High" as TaskPriority },
      { title: "Debug quantum decoherence in training runs", category: "Work", priority: "High" as TaskPriority },
      { title: "Document experimental outcomes in quantum logbooks", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Benchmark quantum ML against classical ML baselines", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Test optimization problems (QAOA, VQE) with real-world data", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Collaborate with physicists on algorithm design", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Validate reproducibility across different quantum devices", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Audit scaling performance (number of qubits, error correction overhead)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Publish results in quantum computing journals", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Integrate neuromorphic chips into robotics prototypes", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Run energy-efficiency comparisons to GPUs/TPUs", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Apply for funding from advanced tech councils (DARPA, EU Quantum Flagship)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Review ethical implications of military/defense use cases", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🏙️ AI for Smart Cities & Urban Systems Checklist",
    description: "Implement AI solutions for urban planning, traffic management, energy optimization, and citizen services in smart cities",
    category: "Academic & Research",
    tags: ["smart-cities", "urban-ai", "iot", "traffic-management", "digital-twin"],
    tasks: [
      // Daily
      { title: "Monitor live IoT feeds from traffic, utilities, and sensors", category: "Work", priority: "High" as TaskPriority },
      { title: "Predict anomalies in energy consumption or traffic flow", category: "Work", priority: "High" as TaskPriority },
      { title: "Test real-time video analytics for public safety", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate edge-AI systems for low latency response", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Document system errors and public feedback", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Train AI for urban planning simulations (zoning, crowd control, emergency response)", category: "Work", priority: "High" as TaskPriority, timer: 150, scheduledDaysFromNow: 7 },
      { title: "Audit bias in surveillance AI and citizen monitoring systems", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Test energy grid balancing with renewable inputs", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Collaborate with city planners and civil engineers", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Update AI-driven digital twin of the city", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Publish smart city performance reports for governance boards", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Benchmark AI systems for ethical governance (privacy, security, autonomy)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Review partnerships with private vendors (Google Sidewalk Labs, Huawei SmartCity)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Conduct public town halls for AI policy feedback", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Develop new resilience models for natural disasters", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "📚 AI for Learning & Education Checklist",
    description: "Deploy AI to enhance educational outcomes through personalized learning, adaptive content, and intelligent tutoring systems",
    category: "Academic & Research",
    tags: ["education-ai", "adaptive-learning", "edtech", "personalization", "tutoring"],
    tasks: [
      // Daily
      { title: "Update adaptive learning models with student engagement data", category: "Work", priority: "High" as TaskPriority },
      { title: "Track student progress against personalized learning pathways", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate language/translation AI for inclusivity and accuracy", category: "Work", priority: "High" as TaskPriority },
      { title: "Run content recommendation engines for relevance (courses, modules)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Audit chatbot tutors for factual correctness", category: "Work", priority: "High" as TaskPriority },
      // Weekly
      { title: "Train AI models on diverse curriculum datasets", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Test generative AI for lesson plan and quiz creation", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Evaluate student feedback and adjust AI personalization", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Collaborate with teachers and professors for content alignment", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Run experiments on gamification and motivation strategies", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Benchmark AI learning outcomes vs. traditional education methods", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Review AI compliance with educational regulations (FERPA, UNESCO standards)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Publish reports on learning efficiency and dropout prevention", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Retrain AI models with new knowledge graph expansions", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Host AI-for-education workshops for teachers and policymakers", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🛠️ AI for Job Creation & Workforce Development Checklist",
    description: "Utilize AI for job matching, skills development, and workforce planning to enhance employment outcomes and career growth",
    category: "Academic & Research",
    tags: ["workforce-ai", "job-matching", "skills-development", "career-planning", "hr-tech"],
    tasks: [
      // Daily
      { title: "Monitor AI-powered job-matching platforms (skills → roles)", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate resume parsing and skill recommendation models", category: "Work", priority: "High" as TaskPriority },
      { title: "Track demand signals from labor market datasets", category: "Work", priority: "High" as TaskPriority },
      { title: "Run skill-gap detection analysis across industries", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Document worker feedback on AI-generated job matches", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Train predictive models for future job demand (emerging industries, automation risks)", category: "Work", priority: "High" as TaskPriority, timer: 150, scheduledDaysFromNow: 7 },
      { title: "Audit AI bias in job recommendations (age, gender, geography)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Run upskilling simulations (what courses boost employability fastest)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Collaborate with recruiters, unions, and HR leaders", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Test micro-credentialing integrations with online platforms", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Publish workforce AI readiness reports for governments and NGOs", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Host AI-driven career fairs and workforce training sessions", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Benchmark AI employment models against real-world job placements", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Partner with universities, trade schools, and corporate training programs", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Release whitepapers on job creation policy + AI integration", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "👥 AI for Building & Managing an AI Team Checklist",
    description: "Establish and manage high-performing AI teams with best practices for collaboration, development, and project delivery",
    category: "Academic & Research",
    tags: ["ai-team-management", "mlops-team", "collaboration", "project-management", "ai-leadership"],
    tasks: [
      // Daily
      { title: "Review open project tasks and bug trackers", category: "Work", priority: "High" as TaskPriority },
      { title: "Sync with data engineers, ML researchers, and product managers", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate data pipelines for freshness and reliability", category: "Work", priority: "High" as TaskPriority },
      { title: "Track model training experiments and results", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Document knowledge in shared repositories (Confluence, Notion, GitHub)", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Host cross-functional standups (data science, MLOps, ethics, domain experts)", category: "Work", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Run peer code/model reviews for quality control", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Train junior team members in best practices for reproducibility", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Audit security and privacy practices in data/model handling", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Evaluate vendor tools and cloud infrastructure usage", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Update roadmap alignment with business goals and KPIs", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Benchmark team's models against industry/state-of-the-art baselines", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Host AI ethics and compliance workshops", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Publish internal research papers, blogs, or conference submissions", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Conduct retrospective on sprint performance and adjust team structures", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🏗️ AI in Structural Engineering Checklist",
    description: "Apply AI for structural design optimization, real-time safety monitoring, and predictive maintenance of buildings and infrastructure",
    category: "Academic & Research",
    tags: ["structural-engineering", "ai-design", "infrastructure", "safety-monitoring", "predictive-maintenance"],
    tasks: [
      // Daily
      { title: "Collect real-time IoT sensor data from buildings, bridges, or construction sites (stress, strain, vibration)", category: "Work", priority: "High" as TaskPriority },
      { title: "Run anomaly detection models for cracks, deformation, or load-bearing issues", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate AI structural simulations against ongoing construction work", category: "Work", priority: "High" as TaskPriority },
      { title: "Check safety compliance reports generated by AI monitoring tools", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Log structural incidents or warnings in AI dashboard", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Train AI models on new civil/structural datasets (CAD models, stress-test results)", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Benchmark AI-assisted finite element analysis (FEA) simulations", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Run predictive models for material fatigue and lifespan estimation", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Evaluate risk analysis outputs for seismic or wind-load simulations", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Collaborate with architects and project managers on AI design optimizations", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Audit AI compliance with building codes and safety standards (IBC, Eurocodes, ISO)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Retrain models with updated city/region-specific environmental data", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Generate future-proofing reports (climate resilience, disaster mitigation)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Present AI structural insights to stakeholders (engineers, city planners, regulators)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Publish findings in civil engineering or smart city journals", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "⚡ AI in Circuit / Electrical Engineering Checklist",
    description: "Leverage AI for circuit design acceleration, chip development, PCB layout optimization, and electrical system power efficiency",
    category: "Academic & Research",
    tags: ["electrical-engineering", "circuit-design", "chip-development", "pcb-layout", "power-optimization"],
    tasks: [
      // Daily
      { title: "Run AI-driven circuit design validation (EDA tool outputs)", category: "Work", priority: "High" as TaskPriority },
      { title: "Check for anomalies in circuit simulations (signal integrity, thermal hotspots)", category: "Work", priority: "High" as TaskPriority },
      { title: "Train reinforcement learning models for layout optimization", category: "Work", priority: "High" as TaskPriority, timer: 90 },
      { title: "Validate AI-suggested component placements against electrical constraints", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Log design errors into shared version control", category: "Work", priority: "Medium" as TaskPriority },
      // Weekly
      { title: "Benchmark AI-assisted IC design against manual design workflows", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Run AI optimization for power efficiency and speed trade-offs", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Test circuit performance with adversarial fault injection (shorts, overloads)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Validate fabrication-ready designs against foundry requirements", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Collaborate with hardware security engineers to prevent AI-designed backdoors", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly
      { title: "Update AI training datasets with new chip performance test results", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Audit compliance with safety and manufacturing standards (IEC, IEEE)", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Publish energy efficiency and yield-improvement reports", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Integrate AI models with hardware-software co-design pipelines", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Present research findings at electronics/semiconductor conferences", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "🌾 2025 Farmer Grant Eligibility Checklist",
    description: "Complete eligibility checklist for USDA farmer grants including VAPG, EQIP, FMPP, and UAIP programs to help farmers access funding assistance",
    category: "Academic & Research",
    tags: ["farming", "agriculture", "grants", "usda", "rural", "funding", "eligibility"],
    tasks: [
      // Section 1 - Farm Operation Status
      { title: "Confirm I operate an active farm, ranch, or agricultural business", category: "Work", priority: "High" as TaskPriority },
      { title: "Verify I produce crops, livestock, specialty crops, or aquaculture", category: "Work", priority: "High" as TaskPriority },
      { title: "Gather proof of production (records or receipts)", category: "Work", priority: "High" as TaskPriority },
      { title: "Confirm land ownership OR valid lease agreement", category: "Work", priority: "High" as TaskPriority },
      { title: "Verify farm is currently in operation for 2025 cycle", category: "Work", priority: "High" as TaskPriority },
      // Section 2 - Business Entity & Registration
      { title: "Determine entity type (Individual, LLC, Corporation, Partnership, Cooperative, Nonprofit)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Obtain UEI Number", category: "Work", priority: "High" as TaskPriority },
      { title: "Complete SAM.gov Registration", category: "Work", priority: "High" as TaskPriority },
      { title: "Obtain EIN / Tax ID", category: "Work", priority: "High" as TaskPriority },
      { title: "Complete state business registration (if applicable)", category: "Work", priority: "Medium" as TaskPriority },
      // Section 3 - Value-Added Producer Grant (VAPG)
      { title: "VAPG: Confirm I produce an agricultural raw commodity", category: "Work", priority: "High" as TaskPriority },
      { title: "VAPG: Verify project adds value (processing, packaging, branding, marketing)", category: "Work", priority: "High" as TaskPriority },
      { title: "VAPG: Confirm ability to provide matching funds (cash or in-kind)", category: "Work", priority: "High" as TaskPriority },
      { title: "VAPG: Prepare business plan or feasibility study", category: "Work", priority: "High" as TaskPriority },
      { title: "VAPG: Confirm project will create new revenue or expand sales", category: "Work", priority: "Medium" as TaskPriority },
      // Section 4 - EQIP
      { title: "EQIP: Verify project involves conservation or resource improvement", category: "Work", priority: "High" as TaskPriority },
      { title: "EQIP: Confirm land control for contract duration", category: "Work", priority: "High" as TaskPriority },
      { title: "EQIP: Verify project supports soil, water, air, livestock, or habitat priorities", category: "Work", priority: "High" as TaskPriority },
      { title: "EQIP: Confirm USDA conservation compliance requirements met", category: "Work", priority: "Medium" as TaskPriority },
      // Section 5 - Farmers Market Promotion Program (FMPP)
      { title: "FMPP: Confirm direct-to-consumer sales (CSA, markets, stands)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "FMPP: Verify project increases local market access or distribution", category: "Work", priority: "Medium" as TaskPriority },
      { title: "FMPP: Confirm eligible applicant type (farmer group, cooperative, nonprofit, tribe, local gov)", category: "Work", priority: "Medium" as TaskPriority },
      // Section 6 - Urban Agriculture & Innovative Production (UAIP)
      { title: "UAIP: Verify farm is in urban or suburban area", category: "Work", priority: "Medium" as TaskPriority },
      { title: "UAIP: Confirm use of innovative agriculture (hydroponics, vertical, greenhouse)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "UAIP: Confirm eligible entity type (farm, coop, nonprofit, tribal)", category: "Work", priority: "Medium" as TaskPriority },
      // Section 7 - Special Farmer Programs
      { title: "Check if beginning farmer (10 years or less experience)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Check if veteran farmer or rancher", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Check if member of socially disadvantaged group", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Check if organization provides training/outreach to special groups", category: "Work", priority: "Low" as TaskPriority },
      // Section 8 - Financial & Documentation
      { title: "Prepare basic financial records (income/expenses)", category: "Work", priority: "High" as TaskPriority },
      { title: "Document matching contributions if required", category: "Work", priority: "High" as TaskPriority },
      { title: "Set up expense tracking system for federal compliance", category: "Work", priority: "High" as TaskPriority },
      { title: "Create project budget for grant application", category: "Work", priority: "High" as TaskPriority },
      // Section 9 - Project Readiness
      { title: "Develop clear project plan with goals and outcomes", category: "Work", priority: "High" as TaskPriority },
      { title: "Create timeline and projected budget", category: "Work", priority: "High" as TaskPriority },
      { title: "Align project with USDA program objectives", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Confirm ability to begin project within USDA-required timeframe", category: "Work", priority: "Medium" as TaskPriority },
      // Section 10 - Final Eligibility Summary
      { title: "Determine eligibility for Value-Added Producer Grant (VAPG)", category: "Work", priority: "High" as TaskPriority },
      { title: "Determine eligibility for EQIP Conservation Funding", category: "Work", priority: "High" as TaskPriority },
      { title: "Determine eligibility for Farmers Market Promotion Program (FMPP)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Determine eligibility for Urban Agriculture / Innovative Production Grant (UAIP)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Determine eligibility for Beginning / Veteran / Socially Disadvantaged Farmer Grants", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Research other USDA or state-level agricultural funding programs", category: "Work", priority: "Low" as TaskPriority },
    ]
  },

  // ============= NEURODIVERSE-FRIENDLY / ADHD =============
  {
    name: "ADHD Daily Flow",
    description: "Structured micro-steps for focus and productivity with ADHD",
    category: "Neurodiverse-Friendly",
    tags: ["adhd", "neurodiversity", "focus", "micro-steps", "timeboxing"],
    tasks: [
      { title: "Prime: Hydrate and set intention (5 min)", category: "Personal", priority: "High" as TaskPriority, timer: 5 },
      { title: "Clear workspace and close distractions", category: "Personal", priority: "High" as TaskPriority, timer: 5 },
      { title: "Focus Sprint 1: Main task (25 min)", category: "Work", priority: "High" as TaskPriority, timer: 25 },
      { title: "Break: Movement and hydration (5 min)", category: "Health", priority: "Medium" as TaskPriority, timer: 5 },
      { title: "Focus Sprint 2: Continue or switch task (25 min)", category: "Work", priority: "High" as TaskPriority, timer: 25 },
      { title: "Admin burst: Quick emails/messages (10 min)", category: "Work", priority: "Medium" as TaskPriority, timer: 10 },
      { title: "Break: Stretch and breathe (5 min)", category: "Health", priority: "Medium" as TaskPriority, timer: 5 },
      { title: "Focus Sprint 3: Deep work (25 min)", category: "Work", priority: "High" as TaskPriority, timer: 25 },
      { title: "Wind-down: Review wins and plan next (10 min)", category: "Personal", priority: "Low" as TaskPriority, timer: 10 },
    ]
  },
  {
    name: "Executive Function Rescue",
    description: "Quick micro-steps for when you're stuck or overwhelmed",
    category: "Neurodiverse-Friendly",
    tags: ["adhd", "executive-function", "stuck", "overwhelm", "micro-steps"],
    tasks: [
      { title: "Locate the file or resource you need", category: "Personal", priority: "High" as TaskPriority, timer: 5 },
      { title: "Open just that one thing", category: "Personal", priority: "High" as TaskPriority, timer: 2 },
      { title: "Write 3 bullet points of what to do", category: "Work", priority: "High" as TaskPriority, timer: 5 },
      { title: "Do the easiest bullet point first", category: "Work", priority: "Medium" as TaskPriority, timer: 10 },
      { title: "Take a 2-minute movement break", category: "Health", priority: "Low" as TaskPriority, timer: 2 },
      { title: "Do the second bullet point", category: "Work", priority: "Medium" as TaskPriority, timer: 10 },
      { title: "Celebrate small win and continue", category: "Personal", priority: "Low" as TaskPriority, timer: 2 },
    ]
  },
  {
    name: "Essay/Report Scaffold (Neuro-Inclusive)",
    description: "Break down writing tasks into manageable chunks",
    category: "Neurodiverse-Friendly",
    tags: ["adhd", "writing", "essay", "report", "scaffold"],
    tasks: [
      { title: "Write topic in one sentence", category: "Work", priority: "High" as TaskPriority, timer: 5 },
      { title: "List 3 main points (bullets only)", category: "Work", priority: "High" as TaskPriority, timer: 10 },
      { title: "Find 3 sources (just URLs for now)", category: "Work", priority: "Medium" as TaskPriority, timer: 15 },
      { title: "Write ugly first paragraph for point 1", category: "Work", priority: "High" as TaskPriority, timer: 15 },
      { title: "Take a break - walk or stretch", category: "Health", priority: "Low" as TaskPriority, timer: 5 },
      { title: "Write ugly paragraph for point 2", category: "Work", priority: "High" as TaskPriority, timer: 15 },
      { title: "Write ugly paragraph for point 3", category: "Work", priority: "High" as TaskPriority, timer: 15 },
      { title: "Write intro paragraph (now that you know content)", category: "Work", priority: "Medium" as TaskPriority, timer: 10 },
      { title: "Write conclusion (summary only)", category: "Work", priority: "Medium" as TaskPriority, timer: 10 },
      { title: "Quick edit pass - good enough is perfect", category: "Work", priority: "Low" as TaskPriority, timer: 15 },
    ]
  },
  {
    name: "Interview/Presentation Prep (ADHD-Friendly)",
    description: "Structured preparation with time boxes and clear steps",
    category: "Neurodiverse-Friendly",
    tags: ["adhd", "interview", "presentation", "prep", "timeboxed"],
    tasks: [
      { title: "Research company/topic (set timer!)", category: "Work", priority: "High" as TaskPriority, timer: 20 },
      { title: "Write 3 key stories using STAR format", category: "Work", priority: "High" as TaskPriority, timer: 15 },
      { title: "Create simple note cards (keywords only)", category: "Work", priority: "Medium" as TaskPriority, timer: 10 },
      { title: "Practice run 1: Just speak it out loud", category: "Work", priority: "High" as TaskPriority, timer: 10 },
      { title: "Break - do something completely different", category: "Personal", priority: "Low" as TaskPriority, timer: 10 },
      { title: "Practice run 2: Record yourself", category: "Work", priority: "Medium" as TaskPriority, timer: 10 },
      { title: "Practice run 3: Full dress rehearsal", category: "Work", priority: "High" as TaskPriority, timer: 15 },
      { title: "Prep day-of checklist (clothes, tech, links)", category: "Personal", priority: "High" as TaskPriority, timer: 10 },
    ]
  },
  {
    name: "ADHD Morning Momentum",
    description: "Build momentum with tiny wins to start the day",
    category: "Neurodiverse-Friendly",
    tags: ["adhd", "morning", "routine", "momentum", "micro-wins"],
    tasks: [
      { title: "Get out of bed and make it (2 min)", category: "Personal", priority: "High" as TaskPriority, timer: 2 },
      { title: "Drink water - full glass", category: "Health", priority: "High" as TaskPriority, timer: 1 },
      { title: "Quick movement - jumping jacks or stretch", category: "Health", priority: "Medium" as TaskPriority, timer: 3 },
      { title: "Eat something - anything counts", category: "Health", priority: "High" as TaskPriority, timer: 10 },
      { title: "Look at today's top 3 tasks only", category: "Work", priority: "Medium" as TaskPriority, timer: 2 },
      { title: "Do the tiniest task first for a win", category: "Work", priority: "Low" as TaskPriority, timer: 5 },
      { title: "Set timer for first real work block", category: "Work", priority: "High" as TaskPriority, timer: 1 },
    ]
  },
  {
    name: "Hyperfocus Exit Strategy",
    description: "Gentle transitions out of hyperfocus states",
    category: "Neurodiverse-Friendly",
    tags: ["adhd", "hyperfocus", "transitions", "breaks", "self-care"],
    tasks: [
      { title: "Notice you're in hyperfocus (set hourly reminder)", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Save/commit your work right now", category: "Work", priority: "High" as TaskPriority, timer: 2 },
      { title: "Write one sentence about where you are", category: "Work", priority: "Medium" as TaskPriority, timer: 1 },
      { title: "Stand up and stretch for 60 seconds", category: "Health", priority: "High" as TaskPriority, timer: 1 },
      { title: "Hydrate and check if hungry", category: "Health", priority: "High" as TaskPriority, timer: 2 },
      { title: "5-minute walk or different room", category: "Health", priority: "Medium" as TaskPriority, timer: 5 },
      { title: "Decide: continue or switch tasks?", category: "Personal", priority: "Low" as TaskPriority, timer: 2 },
    ]
  },
  {
    name: "ADHD End-of-Day Reset",
    description: "Close loops and prep tomorrow without overwhelm",
    category: "Neurodiverse-Friendly",
    tags: ["adhd", "evening", "reset", "planning", "wind-down"],
    tasks: [
      { title: "Brain dump: everything on your mind (5 min)", category: "Personal", priority: "Medium" as TaskPriority, timer: 5 },
      { title: "Pick just 3 things for tomorrow", category: "Work", priority: "High" as TaskPriority, timer: 3 },
      { title: "Set out clothes for tomorrow", category: "Personal", priority: "Low" as TaskPriority, timer: 2 },
      { title: "Put keys/wallet/phone in launch spot", category: "Personal", priority: "Medium" as TaskPriority, timer: 1 },
      { title: "Quick tidy: just flat surfaces", category: "Personal", priority: "Low" as TaskPriority, timer: 5 },
      { title: "Set bedtime alarm as reminder", category: "Personal", priority: "High" as TaskPriority, timer: 1 },
      { title: "One calming activity (your choice)", category: "Personal", priority: "Medium" as TaskPriority, timer: 10 },
    ]
  },

  // ============= PROJECT MANAGEMENT (Additional) =============
  {
    name: "Project Planning & Execution Checklist",
    description: "Keeps teams aligned, prevents missed steps in launching a project with Gantt/PERT chart integration",
    category: "Project Management",
    tags: ["planning", "execution", "team", "gantt", "pert"],
    tasks: [
      { title: "Define project goals", category: "Work", priority: "High" as TaskPriority },
      { title: "Identify stakeholders", category: "Work", priority: "High" as TaskPriority },
      { title: "Assign roles & responsibilities", category: "Work", priority: "High" as TaskPriority },
      { title: "Build timeline (Gantt/PERT ready)", category: "Work", priority: "High" as TaskPriority },
      { title: "Review milestones", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Post-project evaluation", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "User Onboarding Checklist",
    description: "Ensures smooth user experience when someone signs up with AI-powered flow optimization",
    category: "Project Management",
    tags: ["onboarding", "user-experience", "conversion", "tutorial"],
    tasks: [
      { title: "Verify email/phone number", category: "Work", priority: "High" as TaskPriority },
      { title: "Walkthrough product tutorial", category: "Work", priority: "High" as TaskPriority },
      { title: "Complete profile setup", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Create first task/project", category: "Work", priority: "High" as TaskPriority },
      { title: "Configure notifications", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Collect first feedback", category: "Work", priority: "Low" as TaskPriority, scheduledDaysFromNow: 3 },
    ]
  },

  // ============= SECURITY & COMPLIANCE =============
  {
    name: "Security & Compliance Checklist",
    description: "Protects data, ensures legal/industry compliance with automated scanning and audit support",
    category: "Security & Compliance",
    tags: ["security", "compliance", "gdpr", "ccpa", "audit", "encryption"],
    tasks: [
      { title: "Verify encryption on all endpoints", category: "Work", priority: "High" as TaskPriority },
      { title: "Check access logs", category: "Work", priority: "High" as TaskPriority },
      { title: "Test 2FA authentication", category: "Work", priority: "High" as TaskPriority },
      { title: "Confirm GDPR/CCPA compliance", category: "Work", priority: "High" as TaskPriority },
      { title: "Backup & recovery drill", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Audit external APIs", category: "Work", priority: "Medium" as TaskPriority },
    ]
  },

  // ============= OPERATIONS & MANAGEMENT =============
  {
    name: "Grocery Store Manager Checklist",
    description: "Comprehensive daily, weekly, and monthly tasks for managing grocery store operations, staff, inventory, and customer experience",
    category: "Operations & Management",
    tags: ["retail", "grocery", "management", "operations", "staff"],
    tasks: [
      // Daily tasks
      { title: "Open store: check cash drawers, registers, and POS systems", category: "Work", priority: "High" as TaskPriority },
      { title: "Walk store floor: check cleanliness, stock levels, and signage", category: "Work", priority: "High" as TaskPriority, timer: 30 },
      { title: "Manage staff scheduling and delegate tasks", category: "Work", priority: "High" as TaskPriority },
      { title: "Resolve customer complaints or escalations", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Inspect perishables for freshness and compliance", category: "Work", priority: "High" as TaskPriority, timer: 20 },
      { title: "Verify safety standards (food handling, refrigeration, temperature logs)", category: "Work", priority: "High" as TaskPriority },
      { title: "Monitor sales targets and adjust promotions if needed", category: "Work", priority: "Medium" as TaskPriority },
      { title: "End-of-day cash reconciliation", category: "Work", priority: "High" as TaskPriority },
      // Weekly tasks (scheduled for future days)
      { title: "Place supplier and vendor orders", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Conduct inventory counts and identify shrink/loss issues", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Plan weekly promotions or store events", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Hold staff training meetings (customer service, compliance, safety)", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Inspect storage and backroom organization", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Review competitor pricing for adjustments", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Meet with department heads (produce, meat, bakery, deli)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Analyze financial performance (P&L, expenses, margins)", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Plan seasonal promotions and community engagement events", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Conduct employee evaluations and performance reviews", category: "Work", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
      { title: "Update safety compliance reports", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Coordinate with corporate or franchise leadership on targets", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Audit store security and loss-prevention systems", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Real Estate Professional Checklist",
    description: "Daily, weekly, and monthly tasks for real estate professionals managing property sales, rentals, client relationships, and market research",
    category: "Operations & Management",
    tags: ["real-estate", "sales", "client-management", "property", "networking"],
    tasks: [
      // Daily tasks
      { title: "Check new property listings and MLS updates", category: "Work", priority: "High" as TaskPriority, timer: 15 },
      { title: "Respond to client inquiries via phone/email/text", category: "Work", priority: "High" as TaskPriority },
      { title: "Schedule and confirm property showings", category: "Work", priority: "High" as TaskPriority },
      { title: "Update CRM with leads and client notes", category: "Work", priority: "Medium" as TaskPriority, timer: 20 },
      { title: "Research comparable properties for pricing strategy", category: "Work", priority: "Medium" as TaskPriority, timer: 30 },
      { title: "Review legal documents for accuracy (disclosures, contracts)", category: "Work", priority: "High" as TaskPriority },
      { title: "Prepare marketing materials for current listings (photos, virtual tours, ads)", category: "Work", priority: "Medium" as TaskPriority, timer: 45 },
      // Weekly tasks
      { title: "Hold open houses and property tours", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Prospect for new clients (calls, emails, networking events)", category: "Work", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Review leads pipeline and prioritize follow-ups", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Negotiate offers and present counteroffers", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Meet with mortgage brokers, appraisers, inspectors", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Analyze market trends and adjust pricing strategies", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Post social media and online ads for listings", category: "Work", priority: "Medium" as TaskPriority, timer: 30, scheduledDaysFromNow: 7 },
      // Monthly tasks  
      { title: "Review commission and financial performance reports", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Audit marketing effectiveness (leads vs. conversions)", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
      { title: "Attend real estate board meetings or professional development seminars", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Update legal compliance documentation", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Expand professional network through community events", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Refresh personal branding (website, business cards, advertising strategy)", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Evaluate client satisfaction and request testimonials/referrals", category: "Work", priority: "High" as TaskPriority, timer: 45, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Diamond Business Checklist",
    description: "Luxury diamond trade operations with sourcing compliance, transparency, customer experiences, and market positioning",
    category: "Operations & Management",
    tags: ["diamonds", "luxury", "compliance", "sourcing", "blockchain", "customer-service"],
    tasks: [
      // Daily tasks
      { title: "Verify diamond sourcing certificates (Kimberley Process, blockchain tracing)", category: "Business", priority: "High" as TaskPriority, timer: 30 },
      { title: "Inspect inventory for clarity, cut, carat, and color accuracy", category: "Work", priority: "High" as TaskPriority, timer: 45 },
      { title: "Update pricing with live market trends (Rapaport reports, auctions)", category: "Business", priority: "High" as TaskPriority, timer: 20 },
      { title: "Provide concierge-level client services (private showings, secure deliveries)", category: "Business", priority: "Medium" as TaskPriority, timer: 60 },
      { title: "Monitor competitor pricing and emerging lab-grown diamond markets", category: "Business", priority: "Medium" as TaskPriority, timer: 25 },
      // Weekly tasks
      { title: "Run quality audits with gemologists for authenticity assurance", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Refresh digital catalogues with HD photography & 360° product scans", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Host private client events (jewelry showcases, wine & diamonds nights)", category: "Business", priority: "Medium" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Train staff on customer storytelling and luxury sales psychology", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Publish social media updates highlighting craftsmanship and heritage", category: "Business", priority: "Low" as TaskPriority, timer: 30, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Release luxury brand campaigns tied to seasonal gifting trends", category: "Business", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Audit ethical sourcing compliance for all diamond channels", category: "Business", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Collaborate with luxury magazines, influencers, and VIP client networks", category: "Business", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Explore expansion into lab-grown diamonds or high-jewelry artistry", category: "Business", priority: "Low" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Conduct financial audits against global luxury benchmarks", category: "Business", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Luxury Watch Brand Business Checklist",
    description: "Premium timepiece brand management with craftsmanship focus, exclusivity strategy, and heritage storytelling",
    category: "Operations & Management",
    tags: ["watches", "luxury", "craftsmanship", "exclusivity", "heritage", "collectors"],
    tasks: [
      // Daily tasks
      { title: "Inspect production quality across movements, cases, dials, straps", category: "Work", priority: "High" as TaskPriority, timer: 60 },
      { title: "Update CRM with VIP leads and collectors' inquiries", category: "Business", priority: "Medium" as TaskPriority, timer: 30 },
      { title: "Monitor gray-market resale pricing for brand value control", category: "Business", priority: "Medium" as TaskPriority, timer: 20 },
      { title: "Provide boutique staff with fresh storytelling points on each collection", category: "Work", priority: "Medium" as TaskPriority, timer: 25 },
      { title: "Refresh website for limited-edition availability", category: "Work", priority: "Low" as TaskPriority, timer: 15 },
      // Weekly tasks
      { title: "Collaborate with watch forums, influencers, and collector clubs", category: "Business", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Release behind-the-scenes footage of artisans & watchmakers", category: "Business", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Audit supply chain for authenticity and limited-batch integrity", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Train brand ambassadors on heritage storytelling & exclusivity", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Publish horology insights (history, mechanics, innovation stories)", category: "Business", priority: "Low" as TaskPriority, timer: 45, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Host private events at global hubs (Geneva, Dubai, Hong Kong, NYC)", category: "Business", priority: "Medium" as TaskPriority, timer: 240, scheduledDaysFromNow: 30 },
      { title: "Launch capsule limited editions tied to anniversaries or celebrity collabs", category: "Business", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Analyze resale and auction data to fine-tune scarcity strategy", category: "Business", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
      { title: "Expand partnerships with luxury retailers, yachts, private jet companies", category: "Business", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Release annual innovation reports (materials, movements, sustainability)", category: "Business", priority: "Low" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "SaaS Business Launch Checklist",
    description: "Software as a Service startup operations with product development, user metrics, retention strategies, and growth optimization",
    category: "Operations & Management",
    tags: ["saas", "software", "startup", "product-market-fit", "retention", "growth"],
    tasks: [
      // Daily tasks (Pre-Launch & Early Stage)
      { title: "Validate product-market fit through beta feedback loops", category: "Business", priority: "High" as TaskPriority, timer: 60 },
      { title: "Track user activity metrics (DAU, WAU, churn) in dashboards", category: "Business", priority: "High" as TaskPriority, timer: 30 },
      { title: "Optimize onboarding flows for simplicity + stickiness", category: "Work", priority: "High" as TaskPriority, timer: 45 },
      { title: "Respond to customer support tickets in under 2 hours", category: "Work", priority: "High" as TaskPriority, timer: 90 },
      { title: "Monitor competitor updates & pricing", category: "Business", priority: "Medium" as TaskPriority, timer: 20 },
      // Weekly tasks
      { title: "Ship new features or UX improvements (agile sprint cycles)", category: "Work", priority: "High" as TaskPriority, timer: 240, scheduledDaysFromNow: 7 },
      { title: "Run A/B tests on pricing, messaging, and onboarding flows", category: "Business", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Host webinars or community sessions for user education", category: "Business", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Publish blog posts, case studies, or how-to guides", category: "Business", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Test integrations with popular platforms (Slack, Salesforce, Zapier)", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Launch referral programs or viral growth loops", category: "Business", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Review CAC (Customer Acquisition Cost) vs. LTV (Lifetime Value)", category: "Business", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Roll out major product updates in staged releases", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Secure enterprise partnerships or developer ecosystems", category: "Business", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Audit retention strategies and subscription churn", category: "Business", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Brand Video Production Checklist",
    description: "High-impact video campaign creation from pre-production through distribution with cinematic storytelling and multi-platform optimization",
    category: "Operations & Management",
    tags: ["video-production", "branding", "cinematography", "marketing", "storytelling", "distribution"],
    tasks: [
      // Pre-Production tasks
      { title: "Define campaign objective (awareness, launch, lifestyle branding)", category: "Business", priority: "High" as TaskPriority, timer: 60 },
      { title: "Script narrative arc (problem → solution → aspiration → call to action)", category: "Work", priority: "High" as TaskPriority, timer: 120 },
      { title: "Scout filming locations aligned with luxury tone", category: "Work", priority: "Medium" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Select actors, influencers, or brand ambassadors", category: "Business", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Align soundtrack with emotional triggers (epic, minimal, cinematic)", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      // Production tasks
      { title: "Shoot high-quality footage (4K+, multiple angles)", category: "Work", priority: "High" as TaskPriority, timer: 480, scheduledDaysFromNow: 14 },
      { title: "Capture behind-the-scenes for social snippets", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 14 },
      { title: "Record multiple length cuts (15s, 30s, 60s, 3m)", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 14 },
      { title: "Ensure consistent brand color grading & tone", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 14 },
      { title: "Protect IP & clear music/footage licenses", category: "Business", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 14 },
      // Post-Production & Launch tasks
      { title: "Edit into cinematic, social-first, and micro-format versions", category: "Work", priority: "High" as TaskPriority, timer: 240, scheduledDaysFromNow: 21 },
      { title: "Test ad performance with A/B copy variations", category: "Business", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 28 },
      { title: "Launch teaser campaigns before full video drop", category: "Business", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
      { title: "Optimize video metadata for SEO & platforms (YouTube, TikTok, IG)", category: "Work", priority: "Medium" as TaskPriority, timer: 45, scheduledDaysFromNow: 30 },
      { title: "Monitor engagement, conversion, and emotional impact metrics", category: "Business", priority: "High" as TaskPriority, timer: 30, scheduledDaysFromNow: 35 },
    ]
  },
  {
    name: "Marketing Campaign Checklist (Future-Proof)",
    description: "Advanced marketing operations with AI targeting, omnichannel engagement, community building, and data-driven optimization",
    category: "Operations & Management",
    tags: ["marketing", "ai-targeting", "omnichannel", "community", "campaigns", "roi"],
    tasks: [
      // Daily tasks
      { title: "Track ad performance across Google, Meta, TikTok, X", category: "Business", priority: "High" as TaskPriority, timer: 30 },
      { title: "Monitor community sentiment in Discord, Reddit, Instagram comments", category: "Business", priority: "High" as TaskPriority, timer: 25 },
      { title: "Adjust targeting based on live customer behavior data", category: "Business", priority: "High" as TaskPriority, timer: 20 },
      { title: "Engage with top fans, influencers, and brand advocates", category: "Business", priority: "Medium" as TaskPriority, timer: 45 },
      { title: "Refresh trending hashtags, memes, and cultural hooks", category: "Business", priority: "Low" as TaskPriority, timer: 15 },
      // Weekly tasks
      { title: "Run A/B tests on headlines, creatives, CTAs", category: "Business", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Release new content across short-form (TikTok, Reels) and long-form (YouTube, blogs)", category: "Business", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Collaborate with micro-influencers for authenticity boosts", category: "Business", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Measure funnel health (impressions → clicks → conversions → LTV)", category: "Business", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Train marketing AI assistants for predictive targeting", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Run \"hero campaigns\" tied to launches, events, or seasonal moments", category: "Business", priority: "High" as TaskPriority, timer: 240, scheduledDaysFromNow: 30 },
      { title: "Publish thought leadership content (whitepapers, trend reports, case studies)", category: "Business", priority: "Medium" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Analyze omni-channel spend vs. ROI", category: "Business", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Host customer storytelling campaigns (UGC, testimonials, reviews)", category: "Business", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Refresh overall creative direction with brand team", category: "Business", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Workforce Development Council Checklist",
    description: "Regional economic development through skills pipelines, training programs, and labor market innovation strategies for communities and cities",
    category: "Operations & Management",
    tags: ["workforce-development", "training", "labor-market", "skills", "economic-development", "education"],
    tasks: [
      // Daily tasks
      { title: "Monitor job postings and labor market analytics (skills gaps, demand surges)", category: "Work", priority: "High" as TaskPriority, timer: 30 },
      { title: "Track participation in training and reskilling programs", category: "Work", priority: "High" as TaskPriority, timer: 25 },
      { title: "Engage with local businesses to update hiring needs", category: "Business", priority: "High" as TaskPriority, timer: 45 },
      { title: "Provide guidance to career centers and apprenticeship providers", category: "Work", priority: "Medium" as TaskPriority, timer: 30 },
      { title: "Communicate with unemployed or transitioning workers about opportunities", category: "Work", priority: "Medium" as TaskPriority, timer: 40 },
      // Weekly tasks
      { title: "Hold council meetings with industry, government, and educational leaders", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Update workforce development dashboards with KPIs (placements, retention)", category: "Work", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Launch pilot training programs in high-demand sectors (AI, green energy, healthcare)", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Partner with universities and technical schools on curriculum updates", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Run job fairs, career expos, and employer matchmaking events", category: "Work", priority: "Medium" as TaskPriority, timer: 240, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Audit employer satisfaction and program outcomes", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Release labor market reports and forecasts to policymakers", category: "Work", priority: "Medium" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Secure funding for workforce initiatives (federal, state, NGO, private)", category: "Business", priority: "High" as TaskPriority, timer: 240, scheduledDaysFromNow: 30 },
      { title: "Develop long-term skills strategies (digital literacy, renewable energy, biotech)", category: "Work", priority: "High" as TaskPriority, timer: 210, scheduledDaysFromNow: 30 },
      { title: "Review equity and inclusion progress in workforce programs", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
    ]
  },

  // ============= SPECIALIZED INDUSTRIES =============
  {
    name: "Space Habitat Engineer Checklist (Mars/Moon Colonies)",
    description: "Managing off-Earth habitats with oxygen systems, radiation shielding, food production, and crew safety for Mars and Moon colonies",
    category: "Specialized Industries",
    tags: ["space", "engineering", "habitat", "mars", "moon", "colonies", "survival", "terraforming"],
    tasks: [
      // Daily tasks
      { title: "Check oxygen levels and atmospheric pressure inside habitat", category: "Work", priority: "High" as TaskPriority },
      { title: "Monitor radiation shielding integrity", category: "Work", priority: "High" as TaskPriority },
      { title: "Inspect hydroponic/aquaponic food systems", category: "Work", priority: "High" as TaskPriority, timer: 30 },
      { title: "Review waste recycling systems (water + solid)", category: "Work", priority: "High" as TaskPriority, timer: 20 },
      { title: "Log astronaut health and psychological well-being", category: "Health", priority: "Medium" as TaskPriority, timer: 15 },
      // Weekly tasks
      { title: "Perform external hull inspections via EVA", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Rotate crops and monitor nutrient balance in food systems", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Maintain energy systems (solar, nuclear, batteries)", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Conduct habitat drills for emergencies (fire, decompression)", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Send weekly reports back to Earth mission control", category: "Work", priority: "Medium" as TaskPriority, timer: 45, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Expand habitat modules or research labs", category: "Work", priority: "High" as TaskPriority, timer: 240, scheduledDaysFromNow: 30 },
      { title: "Review food and water reserves vs. consumption", category: "Work", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
      { title: "Analyze soil and regolith experiments for terraforming progress", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Publish scientific findings to space research journals", category: "Work", priority: "Medium" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Conduct long-term crew health evaluations", category: "Health", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Fantasy Theme Park Creator Checklist",
    description: "Building and operating immersive fantasy theme parks combining storytelling, engineering, live entertainment, and safety regulations",
    category: "Specialized Industries",
    tags: ["entertainment", "theme-park", "fantasy", "storytelling", "creative", "operations"],
    tasks: [
      // Daily tasks
      { title: "Inspect rides, animatronics, and set pieces for safety", category: "Work", priority: "High" as TaskPriority, timer: 45 },
      { title: "Brief cast members and performers on daily scripts", category: "Work", priority: "High" as TaskPriority, timer: 30 },
      { title: "Monitor guest satisfaction and crowd flow", category: "Work", priority: "Medium" as TaskPriority, timer: 20 },
      { title: "Restock themed merchandise and food stands", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Check lighting, pyrotechnics, and sound systems", category: "Work", priority: "High" as TaskPriority, timer: 25 },
      // Weekly tasks
      { title: "Hold creative brainstorming with writers/designers", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Test new ride mechanics or immersive experiences", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Train performers and update choreography/scripts", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Rotate seasonal attractions (Halloween, Winter, Summer)", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Review safety compliance reports and audits", category: "Work", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Launch new storylines or character arcs in park narrative", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Evaluate guest surveys for continuous improvement", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Refresh set designs, costumes, and merchandising", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Partner with media/film studios for cross-promotions", category: "Business", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
      { title: "Expand themed zones or upgrade attractions", category: "Work", priority: "High" as TaskPriority, timer: 240, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Underwater Research Station Checklist",
    description: "Operating deep-sea research facilities with life support monitoring, marine biology studies, and extreme isolation protocols",
    category: "Specialized Industries",
    tags: ["marine-biology", "research", "underwater", "habitat", "ocean", "scientific"],
    tasks: [
      // Daily tasks
      { title: "Monitor oxygen and CO₂ scrubber systems", category: "Work", priority: "High" as TaskPriority },
      { title: "Check external pressure seals and hull integrity", category: "Work", priority: "High" as TaskPriority, timer: 30 },
      { title: "Log marine life activity outside habitat windows", category: "Work", priority: "Medium" as TaskPriority, timer: 20 },
      { title: "Record environmental variables (salinity, currents, temperature)", category: "Work", priority: "Medium" as TaskPriority, timer: 15 },
      { title: "Maintain communication with surface base", category: "Work", priority: "High" as TaskPriority },
      // Weekly tasks
      { title: "Conduct diving expeditions for sample collection", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Service external cameras and monitoring equipment", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Rotate experimental specimens in aquaria", category: "Work", priority: "Medium" as TaskPriority, timer: 45, scheduledDaysFromNow: 7 },
      { title: "Calibrate scientific instruments for accuracy", category: "Work", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Perform crew psychological check-ins", category: "Health", priority: "Medium" as TaskPriority, timer: 30, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Publish marine biology findings to journals", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Conduct habitat maintenance and deep-cleaning", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Evaluate long-term sustainability of food/water cycles", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Host live-stream educational events for schools/universities", category: "Work", priority: "Low" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
      { title: "Update mission goals with global oceanic research teams", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "DIY Genetic Biohacker Lab Checklist",
    description: "Independent genetic research and CRISPR experiments with strict safety protocols and ethical compliance for biohacker communities",
    category: "Specialized Industries",
    tags: ["genetics", "CRISPR", "biohacking", "synthetic-biology", "research", "lab-safety"],
    tasks: [
      // Daily tasks
      { title: "Sanitize lab surfaces and equipment", category: "Work", priority: "High" as TaskPriority, timer: 20 },
      { title: "Log temperature/humidity for culture environments", category: "Work", priority: "High" as TaskPriority },
      { title: "Feed and monitor bacterial/yeast cultures", category: "Work", priority: "High" as TaskPriority, timer: 15 },
      { title: "Check CRISPR experiments for growth/progress", category: "Work", priority: "Medium" as TaskPriority, timer: 30 },
      { title: "Document results in lab notebook", category: "Work", priority: "Medium" as TaskPriority, timer: 20 },
      // Weekly tasks
      { title: "Sequence DNA results and cross-check with controls", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Order new reagents and lab consumables", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Review bioethics and safety compliance standards", category: "Work", priority: "High" as TaskPriority, timer: 45, scheduledDaysFromNow: 7 },
      { title: "Share updates with DIY biohacker community (forums, Discord)", category: "Work", priority: "Low" as TaskPriority, timer: 30, scheduledDaysFromNow: 7 },
      { title: "Run genetic analysis software for anomalies", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Publish results in open-source biotech repositories", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Attend biohacker meetups or conferences", category: "Work", priority: "Low" as TaskPriority, timer: 240, scheduledDaysFromNow: 30 },
      { title: "Audit lab safety equipment (eyewash, fire suppression, PPE)", category: "Work", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
      { title: "Rotate or upgrade experimental strains", category: "Work", priority: "Medium" as TaskPriority, timer: 45, scheduledDaysFromNow: 30 },
      { title: "Develop future experiment roadmap", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Futurist Think Tank Checklist",
    description: "Exploring emerging technologies and societal shifts through scenario planning, trend analysis, and speculative research for strategic foresight",
    category: "Specialized Industries",
    tags: ["futurism", "trend-analysis", "forecasting", "strategic-planning", "innovation", "research"],
    tasks: [
      // Daily tasks
      { title: "Review global news for early signals of change", category: "Work", priority: "Medium" as TaskPriority, timer: 30 },
      { title: "Update megatrend databases (AI, biotech, climate, geopolitics)", category: "Work", priority: "High" as TaskPriority, timer: 45 },
      { title: "Host brainstorming sessions with interdisciplinary experts", category: "Work", priority: "Medium" as TaskPriority, timer: 60 },
      { title: "Create speculative scenarios for specific industries", category: "Work", priority: "Medium" as TaskPriority, timer: 90 },
      { title: "Publish short daily insight briefs", category: "Work", priority: "Medium" as TaskPriority, timer: 20 },
      // Weekly tasks
      { title: "Hold foresight workshops with stakeholders", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Develop trend maps and visualizations", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Test future scenarios using simulations or role-playing", category: "Work", priority: "Medium" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Collaborate with universities and innovation labs", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Review client projects for alignment with futures research", category: "Work", priority: "High" as TaskPriority, timer: 45, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Release 'Future of X' reports", category: "Work", priority: "High" as TaskPriority, timer: 240, scheduledDaysFromNow: 30 },
      { title: "Update global risk and opportunity radar", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Host public talks, podcasts, or webinars", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Apply for funding or grants for new foresight projects", category: "Business", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Conduct peer-review with other futurist organizations", category: "Work", priority: "Low" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Asteroid Mining Crew Checklist",
    description: "Deep space mining operations combining spacecraft engineering, robotic drilling systems, and precious material extraction while maintaining crew safety",
    category: "Specialized Industries",
    tags: ["space", "mining", "robotics", "spacecraft", "deep-space", "resource-extraction", "engineering"],
    tasks: [
      // Daily tasks
      { title: "Check spacecraft navigation, propulsion, and orbit stability", category: "Work", priority: "High" as TaskPriority, timer: 30 },
      { title: "Monitor robotic drilling equipment for overheating/damage", category: "Work", priority: "High" as TaskPriority, timer: 25 },
      { title: "Record mineral yield data (platinum, rare earth elements, water ice)", category: "Work", priority: "Medium" as TaskPriority, timer: 20 },
      { title: "Inspect life-support oxygen and CO₂ scrubbers", category: "Work", priority: "High" as TaskPriority, timer: 15 },
      { title: "Send comm logs to mission control", category: "Work", priority: "Medium" as TaskPriority, timer: 10 },
      // Weekly tasks
      { title: "Rotate crew EVA shifts for surface inspections", category: "Work", priority: "High" as TaskPriority, timer: 240, scheduledDaysFromNow: 7 },
      { title: "Calibrate laser cutters, drills, and autonomous mining bots", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Secure extracted ore into radiation-shielded containers", category: "Work", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Check cryogenic storage systems for water/volatile materials", category: "Work", priority: "Medium" as TaskPriority, timer: 45, scheduledDaysFromNow: 7 },
      { title: "Conduct emergency evacuation drill", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Analyze profitability of mining site (yield vs. resource costs)", category: "Business", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Expand mining zone or reposition craft to new asteroid cluster", category: "Work", priority: "Medium" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Perform full spacecraft systems diagnostic", category: "Work", priority: "High" as TaskPriority, timer: 240, scheduledDaysFromNow: 30 },
      { title: "Upload geological findings to planetary science consortiums", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
      { title: "Renew contracts or funding with Earth-based corporations", category: "Business", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Time Travel Operations Checklist",
    description: "Managing temporal displacement with strict safety protocols, paradox prevention, and historical timeline integrity protection",
    category: "Specialized Industries",
    tags: ["time-travel", "temporal", "paradox-prevention", "timeline", "safety", "experimental"],
    tasks: [
      // Daily tasks
      { title: "Calibrate chrono-stabilizers and time flux capacitors", category: "Work", priority: "High" as TaskPriority, timer: 45 },
      { title: "Verify target timeline coordinates (date, location, historical conditions)", category: "Work", priority: "High" as TaskPriority, timer: 30 },
      { title: "Check paradox-prevention algorithms", category: "Work", priority: "High" as TaskPriority, timer: 25 },
      { title: "Monitor traveler vitals during temporal displacement", category: "Health", priority: "High" as TaskPriority, timer: 20 },
      { title: "Update time-anchoring beacon for safe return", category: "Work", priority: "High" as TaskPriority, timer: 15 },
      // Weekly tasks
      { title: "Audit mission logs for historical contamination", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Cross-check altered timelines for unintended consequences", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Replace temporal shielding components", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Train new operatives in paradox resolution drills", category: "Work", priority: "Medium" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Secure classified archives against timeline leaks", category: "Work", priority: "High" as TaskPriority, timer: 45, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Review ethical board approvals for missions", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Publish internal reports on time ripple monitoring", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Upgrade AI prediction models for paradox avoidance", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Host simulation exercises for catastrophic time fractures", category: "Work", priority: "Medium" as TaskPriority, timer: 240, scheduledDaysFromNow: 30 },
      { title: "Seal permanent time capsules to preserve original records", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Dream Recording Researcher Checklist",
    description: "Neuroscience research translating subconscious dream imagery into visual/audio files with advanced AI interpretation and bioethics compliance",
    category: "Specialized Industries",
    tags: ["neuroscience", "dreams", "AI", "research", "consciousness", "bioethics", "brain-computer-interface"],
    tasks: [
      // Daily tasks
      { title: "Calibrate EEG + fMRI sensors before subject sleep", category: "Work", priority: "High" as TaskPriority, timer: 30 },
      { title: "Sync neural data with AI dream interpretation models", category: "Work", priority: "High" as TaskPriority, timer: 45 },
      { title: "Record subject vitals and sleep stages", category: "Health", priority: "Medium" as TaskPriority, timer: 20 },
      { title: "Extract nightly dream imagery/audio reconstructions", category: "Work", priority: "Medium" as TaskPriority, timer: 60 },
      { title: "Maintain dream privacy agreements with participants", category: "Work", priority: "High" as TaskPriority, timer: 15 },
      // Weekly tasks
      { title: "Refine AI training datasets with validated dream sequences", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Conduct post-dream interviews for accuracy checks", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Publish anonymized datasets for research networks", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Test new neural interfaces for clarity and resolution", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Hold team ethics reviews on subconscious data rights", category: "Work", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Release public updates on dream-to-video breakthroughs", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Audit data security for subconscious intellectual property", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Host workshops on dream therapy applications", category: "Work", priority: "Medium" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Explore cross-linking dream sharing between participants", category: "Work", priority: "Low" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Apply for neuroscience and AI research grants", category: "Business", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Black Hole Tourism Operator Checklist",
    description: "Managing cosmic tourism experiences near black holes with extreme safety protocols, physics education, and gravitational phenomena observation",
    category: "Specialized Industries",
    tags: ["black-hole", "space-tourism", "physics", "cosmic", "safety", "relativity", "extreme-tourism"],
    tasks: [
      // Daily tasks
      { title: "Run gravimetric scans to ensure orbital stability around black hole", category: "Work", priority: "High" as TaskPriority, timer: 45 },
      { title: "Brief tourists on safety protocols and no-go zones", category: "Work", priority: "High" as TaskPriority, timer: 60 },
      { title: "Test onboard shielding against extreme radiation", category: "Work", priority: "High" as TaskPriority, timer: 30 },
      { title: "Calibrate observation decks and gravitational lensing telescopes", category: "Work", priority: "Medium" as TaskPriority, timer: 40 },
      { title: "Record daily time dilation logs for mission archives", category: "Work", priority: "Medium" as TaskPriority, timer: 20 },
      // Weekly tasks
      { title: "Perform maintenance on propulsion systems for escape readiness", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Host cosmic seminars for tourists (time dilation, relativity lessons)", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Update holographic displays with real-time accretion disk visuals", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Monitor psychological stress levels of guests", category: "Health", priority: "Medium" as TaskPriority, timer: 45, scheduledDaysFromNow: 7 },
      { title: "Upload scientific data to interstellar research councils", category: "Work", priority: "Medium" as TaskPriority, timer: 30, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Audit safety compliance against interstellar tourism laws", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Publish findings from black hole observation missions", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Upgrade AI trajectory systems for gravitational distortions", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Plan new tourist routes near safer cosmic objects (neutron stars, pulsars)", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Rotate crew to prevent long-term radiation exposure", category: "Health", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Multiverse Cartographer Checklist",
    description: "Exploring and mapping parallel universes with dimensional stability protocols, reality anchoring, and cross-dimensional research coordination",
    category: "Specialized Industries",
    tags: ["multiverse", "parallel-dimensions", "cartography", "reality-anchors", "dimensional-exploration", "physics"],
    tasks: [
      // Daily tasks
      { title: "Activate dimensional stabilizers before crossing boundaries", category: "Work", priority: "High" as TaskPriority, timer: 30 },
      { title: "Log environmental constants (physics laws, gravity, time flow)", category: "Work", priority: "High" as TaskPriority, timer: 45 },
      { title: "Map sentient life presence in new universes", category: "Work", priority: "Medium" as TaskPriority, timer: 60 },
      { title: "Secure reality anchors to avoid losing baseline coordinates", category: "Work", priority: "High" as TaskPriority, timer: 25 },
      { title: "Record sensory anomalies for cataloging", category: "Work", priority: "Medium" as TaskPriority, timer: 30 },
      // Weekly tasks
      { title: "Compare universe map layers against baseline reality", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Host cross-dimensional knowledge-sharing sessions", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Audit survival gear against altered physics environments", category: "Work", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Train explorers in recognition of hostile multiverse zones", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Secure new data in quantum-encrypted vaults", category: "Work", priority: "Medium" as TaskPriority, timer: 45, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Release updated multiverse atlases", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Evaluate potential colonization candidates", category: "Work", priority: "Medium" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Host ethical reviews on interfering with alternate civilizations", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Run stabilization drills for collapsing universes", category: "Work", priority: "High" as TaskPriority, timer: 240, scheduledDaysFromNow: 30 },
      { title: "Coordinate findings with interdimensional councils", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Dream Recording Lab Technician Checklist",
    description: "Technical operations for dream capture and playback systems using neuroimaging, AI pattern recognition, and memory projection devices",
    category: "Specialized Industries",
    tags: ["neurotechnology", "dreams", "lab-operations", "neuroimaging", "technical", "brain-computer-interface"],
    tasks: [
      // Daily tasks
      { title: "Calibrate EEG and fMRI dream-capture interfaces", category: "Work", priority: "High" as TaskPriority, timer: 40 },
      { title: "Test neural-to-visual AI translation accuracy", category: "Work", priority: "High" as TaskPriority, timer: 35 },
      { title: "Monitor subject vitals during REM sessions", category: "Health", priority: "High" as TaskPriority, timer: 25 },
      { title: "Archive dream footage with timestamped metadata", category: "Work", priority: "Medium" as TaskPriority, timer: 30 },
      { title: "Run dream playback checks for distortion or loss", category: "Work", priority: "Medium" as TaskPriority, timer: 20 },
      // Weekly tasks
      { title: "Update AI dream-to-video models with new datasets", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Repair neuro-electrode helmets and sleep chambers", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Conduct ethical review of dream content storage", category: "Work", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Host feedback sessions with dream subjects", category: "Work", priority: "Medium" as TaskPriority, timer: 45, scheduledDaysFromNow: 7 },
      { title: "Back up archives to encrypted quantum drives", category: "Work", priority: "High" as TaskPriority, timer: 30, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Publish anonymized dream trend reports", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Evaluate risks of subconscious manipulation", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Host seminars on therapeutic dream replay", category: "Work", priority: "Medium" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Upgrade lab security against dream data theft", category: "Work", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
      { title: "Develop new filters for nightmare suppression trials", category: "Work", priority: "Medium" as TaskPriority, timer: 150, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Volcano Hotel Manager Checklist",
    description: "Managing luxury hospitality on volcanic slopes balancing thrill-seeking guests with disaster preparedness and geothermal operations",
    category: "Specialized Industries",
    tags: ["hospitality", "volcano", "extreme-tourism", "disaster-management", "geothermal", "adventure"],
    tasks: [
      // Daily tasks
      { title: "Inspect geothermal heating and spa systems", category: "Work", priority: "High" as TaskPriority, timer: 30 },
      { title: "Check guest rooms for safety and luxury standards", category: "Work", priority: "High" as TaskPriority, timer: 45 },
      { title: "Monitor volcanic activity sensors around hotel perimeter", category: "Work", priority: "High" as TaskPriority, timer: 20 },
      { title: "Train staff in emergency evacuation drills", category: "Work", priority: "High" as TaskPriority, timer: 60 },
      { title: "Curate daily adventure excursions (lava hikes, hot springs)", category: "Work", priority: "Medium" as TaskPriority, timer: 30 },
      // Weekly tasks
      { title: "Repair heat damage to external structures", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Replenish luxury food/wine stock for guests", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Host cultural events with local volcanic communities", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Test evacuation routes and shelter systems", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Review seismic data with geoscience partners", category: "Work", priority: "High" as TaskPriority, timer: 45, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Host international adventure tourism conferences", category: "Business", priority: "Medium" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Publish volcanic safety reports for guests", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Expand geothermal power capacity for hotel use", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Plan new luxury suites with lava views", category: "Business", priority: "Medium" as TaskPriority, timer: 150, scheduledDaysFromNow: 30 },
      { title: "Audit financial and insurance reports", category: "Business", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Primate Behavior Research Station Checklist",
    description: "Field research managing primate observation, habitat protection, and long-term behavioral data collection with bias elimination protocols",
    category: "Specialized Industries",
    tags: ["primatology", "field-research", "animal-behavior", "conservation", "wildlife", "research-station"],
    tasks: [
      // Daily tasks
      { title: "Calibrate observation equipment (cameras, audio recorders, drones)", category: "Work", priority: "High" as TaskPriority, timer: 30 },
      { title: "Record troop movements, feeding habits, and vocalizations", category: "Work", priority: "High" as TaskPriority, timer: 90 },
      { title: "Note individual health conditions and social interactions", category: "Work", priority: "Medium" as TaskPriority, timer: 60 },
      { title: "Ensure research team avoids influencing animal behavior", category: "Work", priority: "High" as TaskPriority, timer: 15 },
      { title: "Update daily digital logbooks with timestamped data", category: "Work", priority: "Medium" as TaskPriority, timer: 30 },
      // Weekly tasks
      { title: "Cross-compare observed behaviors with AI recognition models", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Collect samples (hair, feces, saliva) for genetic and diet analysis", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Repair/recharge hidden camera traps and tracking collars", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Train field assistants in updated observation protocols", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Hold review meetings to eliminate observer bias", category: "Work", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Publish progress notes to global primate conservation networks", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Audit field station food, medical, and equipment supplies", category: "Work", priority: "High" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
      { title: "Update behavioral datasets for long-term studies", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Conduct habitat surveys (tree density, water availability, threats)", category: "Work", priority: "Medium" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Host community outreach with locals to protect primate habitats", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Marine Mammal Research Checklist",
    description: "Oceanographic research tracking whales, dolphins, and seals using advanced technology while maintaining ethical wildlife interaction standards",
    category: "Specialized Industries",
    tags: ["marine-biology", "oceanography", "whales", "dolphins", "conservation", "research"],
    tasks: [
      // Daily tasks
      { title: "Deploy hydrophones to capture marine mammal communication", category: "Work", priority: "High" as TaskPriority, timer: 45 },
      { title: "Log sightings, GPS locations, and behaviors from ship or drone", category: "Work", priority: "High" as TaskPriority, timer: 60 },
      { title: "Record environmental conditions (salinity, currents, plankton levels)", category: "Work", priority: "Medium" as TaskPriority, timer: 30 },
      { title: "Check satellite tags for location updates", category: "Work", priority: "Medium" as TaskPriority, timer: 20 },
      { title: "Maintain ethical distance to avoid stress on animals", category: "Work", priority: "High" as TaskPriority, timer: 15 },
      // Weekly tasks
      { title: "Retrieve and analyze hydrophone audio archives", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Service tracking tags, drones, and underwater sensors", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Train team in marine safety and rescue drills", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Host knowledge sessions on species-specific vocal patterns", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Cross-analyze data with migration models", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Publish reports on population health and migration routes", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Run DNA/genetic analysis from collected samples", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Review ocean pollution impact on studied populations", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "Collaborate with international conservation groups", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
      { title: "Plan next expedition routes based on seasonal behavior", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Botanical Research Greenhouse Checklist",
    description: "Controlled environment plant research studying growth patterns, genetic modifications, and resilience testing with precise environmental controls",
    category: "Specialized Industries", 
    tags: ["botany", "greenhouse", "plant-research", "genetics", "controlled-environment", "agriculture"],
    tasks: [
      // Daily tasks
      { title: "Monitor soil moisture, nutrient levels, and pH balance", category: "Work", priority: "High" as TaskPriority, timer: 30 },
      { title: "Log growth rates of all experimental plant groups", category: "Work", priority: "High" as TaskPriority, timer: 45 },
      { title: "Adjust light cycles, humidity, and CO₂ levels", category: "Work", priority: "High" as TaskPriority, timer: 25 },
      { title: "Collect daily plant tissue samples for molecular analysis", category: "Work", priority: "Medium" as TaskPriority, timer: 40 },
      { title: "Check for pests, fungi, or cross-pollination contamination", category: "Work", priority: "High" as TaskPriority, timer: 20 },
      // Weekly tasks
      { title: "Rotate experimental groups for comparative conditions", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Run photosynthesis efficiency tests with sensors", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Analyze metabolite output (flavonoids, alkaloids, etc.)", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Train assistants in sterile lab/greenhouse protocols", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Service hydroponics, irrigation, and lighting systems", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Publish greenhouse findings to plant science journals", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Review GMO compliance and biosafety protocols", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "File new patents for genetic modifications", category: "Business", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Run ecosystem simulation experiments with mixed species", category: "Work", priority: "Medium" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Host tours for investors, universities, or government partners", category: "Business", priority: "Low" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Rainforest Field Botanist Checklist",
    description: "Wild rainforest research documenting biodiversity, discovering new species, and preserving rare specimens while assessing climate resilience",
    category: "Specialized Industries",
    tags: ["botany", "rainforest", "field-research", "biodiversity", "conservation", "taxonomy"],
    tasks: [
      // Daily tasks
      { title: "Log GPS coordinates of studied plant populations", category: "Work", priority: "High" as TaskPriority, timer: 20 },
      { title: "Photograph and record plant morphology", category: "Work", priority: "High" as TaskPriority, timer: 60 },
      { title: "Collect leaf, seed, and root samples for DNA analysis", category: "Work", priority: "High" as TaskPriority, timer: 45 },
      { title: "Measure canopy density and sunlight penetration", category: "Work", priority: "Medium" as TaskPriority, timer: 30 },
      { title: "Track nearby animal–plant interactions (pollinators, grazers)", category: "Work", priority: "Medium" as TaskPriority, timer: 40 },
      // Weekly tasks
      { title: "Press and preserve collected plant samples in field herbarium", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      { title: "Test soil chemistry and nutrient cycling levels", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Repair/replace field equipment damaged by humidity or insects", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Train local guides/research assistants in taxonomy methods", category: "Work", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Map deforestation or habitat threats in surrounding areas", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Publish field reports with biodiversity counts", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Submit candidate new species for peer verification", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Host workshops with conservation NGOs and governments", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Update global plant databases with findings", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 30 },
      { title: "Expand protection plans for endangered flora", category: "Work", priority: "High" as TaskPriority, timer: 150, scheduledDaysFromNow: 30 },
    ]
  },
  {
    name: "Plant Genome Engineering Checklist",
    description: "Advanced laboratory genetic modification of crops for climate resilience, nutrition enhancement, and sustainable agriculture with strict ethical oversight",
    category: "Specialized Industries",
    tags: ["genetics", "CRISPR", "agriculture", "biotechnology", "genome-editing", "crop-science"],
    tasks: [
      // Daily tasks
      { title: "Run CRISPR gene edits on experimental plant samples", category: "Work", priority: "High" as TaskPriority, timer: 90 },
      { title: "Record success/failure rates of genome integrations", category: "Work", priority: "High" as TaskPriority, timer: 30 },
      { title: "Test resistance to heat, drought, and pests", category: "Work", priority: "High" as TaskPriority, timer: 45 },
      { title: "Monitor growth chambers for abnormal mutations", category: "Work", priority: "Medium" as TaskPriority, timer: 25 },
      { title: "Maintain sterile conditions for tissue culture", category: "Work", priority: "High" as TaskPriority, timer: 20 },
      // Weekly tasks
      { title: "Sequence genomes of modified strains for confirmation", category: "Work", priority: "High" as TaskPriority, timer: 180, scheduledDaysFromNow: 7 },
      { title: "Compare edited traits to control group plants", category: "Work", priority: "High" as TaskPriority, timer: 90, scheduledDaysFromNow: 7 },
      { title: "Run nutrient composition tests", category: "Work", priority: "Medium" as TaskPriority, timer: 60, scheduledDaysFromNow: 7 },
      { title: "Document ethical concerns and biosafety issues", category: "Work", priority: "High" as TaskPriority, timer: 45, scheduledDaysFromNow: 7 },
      { title: "Repair/upgrade genome sequencing hardware", category: "Work", priority: "Medium" as TaskPriority, timer: 120, scheduledDaysFromNow: 7 },
      // Monthly tasks
      { title: "Publish peer-reviewed reports on modified crops", category: "Work", priority: "Medium" as TaskPriority, timer: 180, scheduledDaysFromNow: 30 },
      { title: "Apply for regulatory approvals for field testing", category: "Business", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
      { title: "Host collaborative workshops with biotech companies", category: "Business", priority: "Medium" as TaskPriority, timer: 90, scheduledDaysFromNow: 30 },
      { title: "File intellectual property patents for new crop lines", category: "Business", priority: "Medium" as TaskPriority, timer: 150, scheduledDaysFromNow: 30 },
      { title: "Assess ecological impact of releasing GMO plants", category: "Work", priority: "High" as TaskPriority, timer: 120, scheduledDaysFromNow: 30 },
    ]
  },
  
  // ============= PROFESSIONAL SECURITY TEMPLATES =============
  {
    name: "Cybersecurity Operations Center (SOC)",
    description: "24/7 security monitoring and incident response with AI-powered threat detection and log analysis",
    category: "Security & Compliance",
    tags: ["cybersecurity", "soc", "monitoring", "threat-detection", "incident-response"],
    tasks: [
      { title: "Review overnight security alerts", category: "Work", priority: "High" as TaskPriority },
      { title: "AI-powered log analysis for anomalies", category: "Work", priority: "High" as TaskPriority, timer: 30 },
      { title: "Update threat intelligence feeds", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Validate security tool configurations", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Monitor network traffic patterns", category: "Work", priority: "High" as TaskPriority, timer: 45 },
      { title: "Review and escalate critical incidents", category: "Work", priority: "High" as TaskPriority },
      { title: "Update security dashboard metrics", category: "Work", priority: "Low" as TaskPriority },
      { title: "Document security findings", category: "Work", priority: "Medium" as TaskPriority },
    ]
  },
  {
    name: "Physical Security Assessment",
    description: "Comprehensive physical security evaluation with AI-assisted surveillance analysis and access control",
    category: "Security & Compliance", 
    tags: ["physical-security", "surveillance", "access-control", "perimeter", "facilities"],
    tasks: [
      { title: "Inspect perimeter security controls", category: "Work", priority: "High" as TaskPriority },
      { title: "Test access card systems", category: "Work", priority: "High" as TaskPriority },
      { title: "AI video analytics review", category: "Work", priority: "Medium" as TaskPriority, timer: 60 },
      { title: "Check visitor management logs", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Verify emergency exit procedures", category: "Work", priority: "High" as TaskPriority },
      { title: "Assess lighting and blind spots", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Review security guard patrol logs", category: "Work", priority: "Low" as TaskPriority },
      { title: "Test alarm and notification systems", category: "Work", priority: "High" as TaskPriority },
    ]
  },
  {
    name: "Incident Response & Digital Forensics",
    description: "Rapid security incident containment with AI-guided forensic analysis and automated evidence collection",
    category: "Security & Compliance",
    tags: ["incident-response", "forensics", "breach", "containment", "evidence", "recovery"],
    tasks: [
      { title: "Activate incident response team", category: "Work", priority: "High" as TaskPriority },
      { title: "Contain and isolate affected systems", category: "Work", priority: "High" as TaskPriority, timer: 15 },
      { title: "AI-assisted evidence preservation", category: "Work", priority: "High" as TaskPriority, timer: 30 },
      { title: "Document initial findings", category: "Work", priority: "High" as TaskPriority },
      { title: "Notify stakeholders and authorities", category: "Work", priority: "High" as TaskPriority },
      { title: "Perform digital forensic analysis", category: "Work", priority: "Medium" as TaskPriority, timer: 120 },
      { title: "Generate incident report", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Conduct post-incident review", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 3 },
    ]
  },
  {
    name: "Cloud Security Configuration Review",
    description: "Multi-cloud security assessment with AI-powered configuration analysis and compliance checking",
    category: "Security & Compliance",
    tags: ["cloud-security", "aws", "azure", "gcp", "configuration", "compliance", "devops"],
    tasks: [
      { title: "Review IAM policies and permissions", category: "Work", priority: "High" as TaskPriority },
      { title: "AI scan for misconfigurations", category: "Work", priority: "High" as TaskPriority, timer: 45 },
      { title: "Check encryption at rest and transit", category: "Work", priority: "High" as TaskPriority },
      { title: "Validate network security groups", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Review logging and monitoring setup", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Assess backup and disaster recovery", category: "Work", priority: "High" as TaskPriority },
      { title: "Check compliance with security standards", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Generate security posture report", category: "Work", priority: "Medium" as TaskPriority },
    ]
  },
  {
    name: "Penetration Testing & Red Team Operations",
    description: "Ethical hacking and security testing with AI-guided vulnerability discovery and exploit development",
    category: "Security & Compliance",
    tags: ["penetration-testing", "red-team", "ethical-hacking", "vulnerability", "exploitation"],
    tasks: [
      { title: "Define scope and rules of engagement", category: "Work", priority: "High" as TaskPriority },
      { title: "Conduct reconnaissance and OSINT", category: "Work", priority: "High" as TaskPriority, timer: 90 },
      { title: "AI-powered vulnerability scanning", category: "Work", priority: "High" as TaskPriority, timer: 60 },
      { title: "Manual testing of critical systems", category: "Work", priority: "High" as TaskPriority, timer: 120 },
      { title: "Attempt privilege escalation", category: "Work", priority: "Medium" as TaskPriority, timer: 60 },
      { title: "Test social engineering vectors", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Document findings with proof-of-concept", category: "Work", priority: "High" as TaskPriority },
      { title: "Present results to stakeholders", category: "Work", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 1 },
    ]
  },
  
  // ============= HEALTH & WELLNESS =============
  {
    name: "🌱 Micronutrient Checklist",
    description: "Comprehensive daily tracking of essential vitamins, minerals, and phytochemicals for optimal health and longevity",
    category: "Health & Wellness",
    tags: ["nutrition", "vitamins", "minerals", "supplements", "health-tracking"],
    tasks: [
      { title: "Vitamin A (retinol, beta-carotene) — vision, immune system, skin", category: "Health", priority: "Medium" as TaskPriority },
      { title: "Vitamin B1 (Thiamine) — energy metabolism, nervous system", category: "Health", priority: "Medium" as TaskPriority },
      { title: "Vitamin B2 (Riboflavin) — red blood cell production, antioxidant support", category: "Health", priority: "Medium" as TaskPriority },
      { title: "Vitamin B3 (Niacin) — metabolism, DNA repair", category: "Health", priority: "Medium" as TaskPriority },
      { title: "Vitamin B5 (Pantothenic Acid) — hormone synthesis, stress support", category: "Health", priority: "Medium" as TaskPriority },
      { title: "Vitamin B6 (Pyridoxine) — neurotransmitters, protein metabolism", category: "Health", priority: "Medium" as TaskPriority },
      { title: "Vitamin B7 (Biotin) — hair, nails, skin, fat metabolism", category: "Health", priority: "Medium" as TaskPriority },
      { title: "Vitamin B9 (Folate) — DNA synthesis, pregnancy health, cell repair", category: "Health", priority: "High" as TaskPriority },
      { title: "Vitamin B12 (Cobalamin) — nerve function, red blood cell production", category: "Health", priority: "High" as TaskPriority },
      { title: "Vitamin C — collagen, immune system, antioxidant defense", category: "Health", priority: "High" as TaskPriority },
      { title: "Vitamin D3 — bone health, immune modulation, hormone balance", category: "Health", priority: "High" as TaskPriority },
      { title: "Vitamin E — antioxidant, skin health, anti-inflammatory", category: "Health", priority: "Medium" as TaskPriority },
      { title: "Vitamin K1 & K2 — blood clotting, bone metabolism, heart health", category: "Health", priority: "Medium" as TaskPriority },
      { title: "Calcium — bones, teeth, muscle function", category: "Health", priority: "High" as TaskPriority },
      { title: "Magnesium — 300+ enzyme reactions, stress regulation, sleep", category: "Health", priority: "High" as TaskPriority },
      { title: "Potassium — heart rhythm, hydration, nerve signaling", category: "Health", priority: "High" as TaskPriority },
      { title: "Zinc — immunity, wound healing, hormone balance", category: "Health", priority: "High" as TaskPriority },
      { title: "Iron — oxygen transport, energy metabolism", category: "Health", priority: "High" as TaskPriority },
      { title: "Selenium — thyroid health, antioxidant defense", category: "Health", priority: "Medium" as TaskPriority },
      { title: "Omega-3 fatty acids (EPA, DHA, ALA) — brain, anti-inflammatory", category: "Health", priority: "High" as TaskPriority },
      { title: "CoQ10 — mitochondrial energy production", category: "Health", priority: "Medium" as TaskPriority },
      { title: "NAD+ precursors (NMN, NR, niacin) — aging, cellular repair", category: "Health", priority: "Medium" as TaskPriority },
      { title: "Probiotics & Prebiotics — gut health, nutrient absorption", category: "Health", priority: "High" as TaskPriority },
      { title: "Blood panel test (Vitamin D, B12, Iron, Magnesium, Zinc)", category: "Health", priority: "High" as TaskPriority, scheduledDaysFromNow: 30 },
      { title: "Track hydration + electrolyte balance", category: "Health", priority: "Medium" as TaskPriority }
    ]
  },
  {
    name: "🏃 Marathon Training Plan",
    description: "Complete 16-week progressive training program with nutrition, recovery, and mental preparation",
    category: "Health & Wellness",
    tags: ["running", "marathon", "training", "endurance", "fitness"],
    tasks: [
      { title: "Complete base mileage run (30-45 minutes easy pace)", category: "Health", priority: "High" as TaskPriority, timer: 45 },
      { title: "Speed work - 8x400m intervals with 90sec rest", category: "Health", priority: "High" as TaskPriority, timer: 60 },
      { title: "Long run - gradually increase weekly (8-20 miles)", category: "Health", priority: "High" as TaskPriority, timer: 120 },
      { title: "Cross-training (cycling, swimming, or strength)", category: "Health", priority: "Medium" as TaskPriority, timer: 45 },
      { title: "Foam rolling and mobility work", category: "Health", priority: "Medium" as TaskPriority, timer: 20 },
      { title: "Track weekly mileage and pace improvements", category: "Health", priority: "Medium" as TaskPriority },
      { title: "Plan race day nutrition strategy", category: "Health", priority: "High" as TaskPriority },
      { title: "Mental training - visualization and goal setting", category: "Health", priority: "Medium" as TaskPriority, timer: 15 },
      { title: "Recovery week - reduce mileage by 30%", category: "Health", priority: "High" as TaskPriority, scheduledDaysFromNow: 21 },
      { title: "Taper phase - peak week preparation", category: "Health", priority: "High" as TaskPriority, scheduledDaysFromNow: 105 }
    ]
  },

  // ============= EDUCATION & LEARNING =============
  {
    name: "📚 Self-Directed Learning Mastery",
    description: "Systematic approach to acquiring new skills and knowledge through structured self-education",
    category: "Education & Learning",
    tags: ["learning", "skill-development", "education", "knowledge", "growth"],
    tasks: [
      { title: "Define clear learning objectives and success metrics", category: "Personal", priority: "High" as TaskPriority },
      { title: "Research and select 3-5 high-quality learning resources", category: "Personal", priority: "High" as TaskPriority, timer: 60 },
      { title: "Create weekly study schedule with dedicated time blocks", category: "Personal", priority: "High" as TaskPriority },
      { title: "Complete daily active learning session (30-60 min)", category: "Personal", priority: "High" as TaskPriority, timer: 45 },
      { title: "Practice new concepts through hands-on projects", category: "Personal", priority: "High" as TaskPriority, timer: 90 },
      { title: "Take detailed notes and create knowledge summaries", category: "Personal", priority: "Medium" as TaskPriority, timer: 30 },
      { title: "Teach concepts to others (Feynman technique)", category: "Personal", priority: "Medium" as TaskPriority, timer: 30 },
      { title: "Complete weekly progress assessments", category: "Personal", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 7 },
      { title: "Join relevant communities and discussion groups", category: "Personal", priority: "Low" as TaskPriority },
      { title: "Apply learning to real-world problems and projects", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 14 }
    ]
  },

  // ============= CREATIVE PURSUITS =============
  {
    name: "🎨 Digital Art Creation Workflow",
    description: "Professional digital art creation process from concept to final publication",
    category: "Creative Pursuits",
    tags: ["digital-art", "creativity", "design", "illustration", "workflow"],
    tasks: [
      { title: "Brainstorm and sketch initial concept ideas", category: "Personal", priority: "High" as TaskPriority, timer: 30 },
      { title: "Create detailed composition and layout planning", category: "Personal", priority: "High" as TaskPriority, timer: 45 },
      { title: "Set up canvas with proper resolution and color profile", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Complete rough sketch and basic shapes", category: "Personal", priority: "High" as TaskPriority, timer: 60 },
      { title: "Add base colors and establish lighting direction", category: "Personal", priority: "High" as TaskPriority, timer: 90 },
      { title: "Refine details and add textures", category: "Personal", priority: "High" as TaskPriority, timer: 120 },
      { title: "Color correction and final adjustments", category: "Personal", priority: "Medium" as TaskPriority, timer: 30 },
      { title: "Export in multiple formats (PNG, JPG, PDF)", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Create social media promotional variants", category: "Personal", priority: "Low" as TaskPriority, timer: 30 },
      { title: "Share with art community and gather feedback", category: "Personal", priority: "Low" as TaskPriority }
    ]
  },

  // ============= TECHNOLOGY & DEVELOPMENT =============
  {
    name: "⚡ Full-Stack App Development Sprint",
    description: "Complete development cycle for a full-stack web application from planning to deployment",
    category: "Technology & Development",
    tags: ["web-development", "full-stack", "programming", "deployment", "project"],
    tasks: [
      { title: "Define project requirements and user stories", category: "Work", priority: "High" as TaskPriority, timer: 90 },
      { title: "Design database schema and API endpoints", category: "Work", priority: "High" as TaskPriority, timer: 120 },
      { title: "Set up development environment and project structure", category: "Work", priority: "High" as TaskPriority, timer: 60 },
      { title: "Implement backend API with authentication", category: "Work", priority: "High" as TaskPriority, timer: 180 },
      { title: "Build frontend UI components and routing", category: "Work", priority: "High" as TaskPriority, timer: 240 },
      { title: "Integrate frontend with backend APIs", category: "Work", priority: "High" as TaskPriority, timer: 120 },
      { title: "Write unit tests for critical functionality", category: "Work", priority: "Medium" as TaskPriority, timer: 90 },
      { title: "Implement responsive design and accessibility", category: "Work", priority: "Medium" as TaskPriority, timer: 90 },
      { title: "Deploy to production and configure CI/CD", category: "Work", priority: "High" as TaskPriority, timer: 120 },
      { title: "Monitor performance and fix critical bugs", category: "Work", priority: "High" as TaskPriority, scheduledDaysFromNow: 1 }
    ]
  },

  // ============= FINANCE & INVESTMENTS =============
  {
    name: "💰 Investment Portfolio Review & Rebalancing",
    description: "Quarterly comprehensive analysis and optimization of investment portfolio performance",
    category: "Finance & Investments",
    tags: ["investing", "portfolio", "financial-planning", "wealth-building", "analysis"],
    tasks: [
      { title: "Review current portfolio allocation vs target percentages", category: "Personal", priority: "High" as TaskPriority, timer: 60 },
      { title: "Analyze performance of individual investments", category: "Personal", priority: "High" as TaskPriority, timer: 90 },
      { title: "Research new investment opportunities in target sectors", category: "Personal", priority: "Medium" as TaskPriority, timer: 120 },
      { title: "Calculate dividend yields and reinvestment strategy", category: "Personal", priority: "Medium" as TaskPriority, timer: 45 },
      { title: "Review and adjust risk tolerance based on life changes", category: "Personal", priority: "High" as TaskPriority, timer: 30 },
      { title: "Rebalance portfolio to target allocation", category: "Personal", priority: "High" as TaskPriority },
      { title: "Review tax implications of portfolio changes", category: "Personal", priority: "High" as TaskPriority, timer: 60 },
      { title: "Update investment goals and timeline", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Document investment decisions and rationale", category: "Personal", priority: "Medium" as TaskPriority, timer: 30 },
      { title: "Schedule next quarterly review", category: "Personal", priority: "Low" as TaskPriority, scheduledDaysFromNow: 90 }
    ]
  },

  // ============= CULINARY & COOKING - Individual Countries =============
  {
    name: "🇹🇭 Thailand Herbs & Spices Cooking Checklist",
    description: "Essential Thai herbs and spices for authentic Thai cooking - tom yum, pad thai, curries, and traditional dishes",
    category: "Culinary & Cooking",
    tags: ["thai-cuisine", "southeast-asian", "lemongrass", "galangal", "thai-basil", "authentic"],
    tasks: [
      { title: "Stock lemongrass (fresh stalks for tom yum, curries)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Get kaffir lime leaves (for curry pastes, soups)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Buy Thai basil (holy basil & sweet basil varieties)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Find galangal root (more aromatic than ginger)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Get cilantro with roots (roots essential for curry pastes)", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Stock bird's eye chilies (prik kee noo - very hot)", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Buy fresh mint for salads and garnishes", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Get white pepper (preferred over black in Thai cooking)", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Buy Thai curry pastes (red, green, yellow, panang)", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Stock turmeric root for yellow curries", category: "Shopping", priority: "Low" as TaskPriority },
      { title: "Practice making fresh curry paste from scratch", category: "Personal", priority: "Low" as TaskPriority },
      { title: "Learn proper Thai herb prep techniques", category: "Personal", priority: "Low" as TaskPriority }
    ]
  },
  {
    name: "🇮🇳 India Herbs & Spices Cooking Checklist", 
    description: "Essential Indian spices and herbs for authentic curries, dal, biryani, and regional Indian cuisine",
    category: "Culinary & Cooking",
    tags: ["indian-cuisine", "curry", "garam-masala", "turmeric", "authentic", "spices"],
    tasks: [
      { title: "Stock cumin seeds (jeera) - whole and ground", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Get coriander seeds (dhania) - for tempering and grinding", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Buy turmeric powder (haldi) - for color and health", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Stock green and black cardamom pods", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Get fresh curry leaves (not bay leaves!)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Buy asafoetida (hing) - tiny amounts, huge flavor", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Stock garam masala blend or make your own", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Get fenugreek seeds and dried leaves (methi)", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Buy good quality chili powder (lal mirch)", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Stock tamarind paste for sourness", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Learn to make fresh garam masala", category: "Personal", priority: "Low" as TaskPriority },
      { title: "Practice tempering (tadka) techniques", category: "Personal", priority: "Low" as TaskPriority }
    ]
  },
  {
    name: "🇫🇷 France Herbs & Spices Cooking Checklist",
    description: "Essential French herbs for classic French cuisine - fine herbs, herbes de Provence, and traditional cooking",
    category: "Culinary & Cooking", 
    tags: ["french-cuisine", "fine-herbs", "herbes-de-provence", "tarragon", "classic", "elegant"],
    tasks: [
      { title: "Stock fresh tarragon (king of French herbs)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Get fresh chervil (delicate, anise-like flavor)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Buy French flat-leaf parsley (not curly)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Stock fresh chives for fine herbs blend", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Get dried herbes de Provence blend", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Stock bay leaves for bouquet garni", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Buy fresh thyme sprigs", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Get whole nutmeg for béchamel sauce", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Stock Dijon mustard seeds or prepared mustard", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Buy whole cloves for studding hams", category: "Shopping", priority: "Low" as TaskPriority },
      { title: "Learn to make proper bouquet garni", category: "Personal", priority: "Low" as TaskPriority },
      { title: "Practice fine herbs technique", category: "Personal", priority: "Low" as TaskPriority }
    ]
  },
  {
    name: "🇮🇹 Italy Herbs & Spices Cooking Checklist",
    description: "Essential Italian herbs for authentic pasta, pizza, risotto, and regional Italian cooking",
    category: "Culinary & Cooking",
    tags: ["italian-cuisine", "basil", "oregano", "pasta", "pizza", "authentic"],
    tasks: [
      { title: "Stock fresh basil (Genovese variety for pesto)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Get dried oregano (better dried than fresh)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Buy flat-leaf parsley (never curly for Italian)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Stock fresh rosemary sprigs", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Get fresh sage leaves (for gnocchi, saltimbocca)", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Buy fennel seeds for sausages", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Stock chili flakes (peperoncino)", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Get saffron threads for risotto alla milanese", category: "Shopping", priority: "Low" as TaskPriority },
      { title: "Buy good Parmigiano-Reggiano for grating", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Stock quality extra virgin olive oil", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Learn to make fresh pesto from scratch", category: "Personal", priority: "Low" as TaskPriority },
      { title: "Practice Italian herb combinations by region", category: "Personal", priority: "Low" as TaskPriority }
    ]
  },
  {
    name: "🇲🇽 Mexico Herbs & Spices Cooking Checklist",
    description: "Essential Mexican herbs and spices for authentic tacos, mole, salsas, and traditional Mexican cuisine", 
    category: "Culinary & Cooking",
    tags: ["mexican-cuisine", "cilantro", "chilies", "cumin", "authentic", "spicy"],
    tasks: [
      { title: "Stock fresh cilantro (coriander leaves)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Get epazote (signature herb for beans)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Buy Mexican oregano (different from Mediterranean)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Stock whole cumin seeds and ground cumin", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Get dried chilies: ancho, guajillo, chipotle, pasilla", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Buy Ceylon cinnamon (canela - softer than cassia)", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Stock whole cloves for mole", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Get whole allspice berries", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Buy avocado leaves (for Oaxacan cuisine)", category: "Shopping", priority: "Low" as TaskPriority },
      { title: "Stock Mexican vanilla extract", category: "Shopping", priority: "Low" as TaskPriority },
      { title: "Learn to properly hydrate and prepare dried chilies", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Practice making fresh salsa verde", category: "Personal", priority: "Low" as TaskPriority }
    ]
  },
  {
    name: "🇯🇵 Japan Herbs & Spices Cooking Checklist",
    description: "Essential Japanese seasonings for authentic sushi, ramen, tempura, and traditional Japanese cuisine",
    category: "Culinary & Cooking",
    tags: ["japanese-cuisine", "shiso", "wasabi", "miso", "sushi", "ramen", "authentic"],
    tasks: [
      { title: "Stock fresh shiso leaves (perilla - for sashimi)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Get real wasabi root or good wasabi paste", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Buy quality soy sauce (shoyu) - light and dark", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Stock miso paste (white and red varieties)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Get sansho pepper (Japanese pepper)", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Buy mirin (sweet rice wine for cooking)", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Stock rice vinegar for sushi rice", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Get shichimi togarashi (seven-spice blend)", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Buy mitsuba (Japanese parsley)", category: "Shopping", priority: "Low" as TaskPriority },
      { title: "Stock nori sheets for sushi and onigiri", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Learn proper sushi rice preparation", category: "Personal", priority: "Low" as TaskPriority },
      { title: "Practice making dashi broth from scratch", category: "Personal", priority: "Low" as TaskPriority }
    ]
  },
  {
    name: "🇪🇸 Spain Herbs & Spices Cooking Checklist",
    description: "Essential Spanish herbs and spices for authentic paella, tapas, gazpacho, and regional Spanish cuisine",
    category: "Culinary & Cooking",
    tags: ["spanish-cuisine", "saffron", "paprika", "paella", "tapas", "authentic"],
    tasks: [
      { title: "Stock saffron threads (essential for paella)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Get smoked paprika (pimentón dulce y picante)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Buy Spanish olive oil (extra virgin)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Stock bay leaves for stews and braises", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Get fresh thyme for Mediterranean dishes", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Buy whole cumin for Moorish influences", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Stock anise seeds for desserts and liqueurs", category: "Shopping", priority: "Low" as TaskPriority },
      { title: "Get Spanish sherry vinegar", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Buy Marcona almonds for garnishes", category: "Shopping", priority: "Low" as TaskPriority },
      { title: "Stock Spanish sea salt (flor de sal)", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Learn to make authentic sofrito base", category: "Personal", priority: "Low" as TaskPriority },
      { title: "Practice proper paella rice cooking technique", category: "Personal", priority: "Low" as TaskPriority }
    ]
  },
  {
    name: "🇨🇳 China Herbs & Spices Cooking Checklist",
    description: "Essential Chinese seasonings for authentic stir-fries, dim sum, hot pot, and regional Chinese cuisine",
    category: "Culinary & Cooking", 
    tags: ["chinese-cuisine", "five-spice", "sichuan-pepper", "wok", "dim-sum", "authentic"],
    tasks: [
      { title: "Stock Sichuan peppercorns (mála sensation)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Get Chinese five-spice powder or make fresh", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Buy light and dark soy sauce", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Stock sesame oil (toasted) for finishing", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Get dried shiitake mushrooms", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Buy Chinese cooking wine (Shaoxing)", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Stock white pepper (preferred over black)", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Get star anise for braised dishes", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Buy dried chilies for Sichuan dishes", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Stock fresh ginger and scallions", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Learn proper wok hei (breath of wok) technique", category: "Personal", priority: "Low" as TaskPriority },
      { title: "Practice velvet coating for tender meats", category: "Personal", priority: "Low" as TaskPriority }
    ]
  },
  {
    name: "🇬🇷 Greece Herbs & Spices Cooking Checklist",
    description: "Essential Greek herbs for authentic moussaka, souvlaki, spanakopita, and Mediterranean Greek cuisine",
    category: "Culinary & Cooking",
    tags: ["greek-cuisine", "oregano", "mediterranean", "olive-oil", "feta", "authentic"],
    tasks: [
      { title: "Stock Greek oregano (rigani - stronger than Italian)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Get fresh dill (aníthos) - for tzatziki, fish", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Buy Greek olive oil (extra virgin, fruity)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Stock fresh mint for salads and lamb", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Get bay leaves for stews and braises", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Buy mastic (for desserts and ouzo)", category: "Shopping", priority: "Low" as TaskPriority },
      { title: "Stock saffron for special occasion dishes", category: "Shopping", priority: "Low" as TaskPriority },
      { title: "Get fresh parsley (flat-leaf)", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Buy good feta cheese for authentic flavor", category: "Shopping", priority: "Medium" as TaskPriority },
      { title: "Stock lemon for finishing many dishes", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Learn to make authentic Greek marinade", category: "Personal", priority: "Low" as TaskPriority },
      { title: "Practice proper phyllo dough handling", category: "Personal", priority: "Low" as TaskPriority }
    ]
  },
  // ============= LEGAL & INTELLECTUAL PROPERTY =============
  {
    name: "📝 Patent an Item Checklist",
    description: "Complete guide for inventors and entrepreneurs to patent their inventions from initial concept to commercialization",
    category: "Executive & Business Leadership",
    tags: ["patent", "intellectual-property", "invention", "legal", "business", "uspto"],
    tasks: [
      // 1. Initial Idea & Concept Development
      { title: "Clearly define the invention (what it is, what problem it solves)", category: "Work", priority: "High" as TaskPriority },
      { title: "Write problem statement and how your invention differs", category: "Work", priority: "High" as TaskPriority },
      { title: "Build sketches, diagrams, or digital mockups", category: "Work", priority: "High" as TaskPriority },
      { title: "Record all brainstorms in inventor's journal (with timestamps)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Consider variations and improvements that may be patentable", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Evaluate commercial value and market fit", category: "Work", priority: "Medium" as TaskPriority },
      
      // 2. Prior Art & Patent Search
      { title: "Search free patent databases (USPTO, WIPO, EPO, Google Patents)", category: "Work", priority: "High" as TaskPriority },
      { title: "Review academic papers and technical literature", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Identify prior art that may block your claim", category: "Work", priority: "High" as TaskPriority },
      { title: "Note differences between your invention and existing ones", category: "Work", priority: "High" as TaskPriority },
      { title: "Consider hiring patent search firm for professional review", category: "Work", priority: "Low" as TaskPriority },
      { title: "Document all findings to strengthen claim", category: "Work", priority: "Medium" as TaskPriority },
      
      // 3. Patentability Assessment
      { title: "Check novelty (is it new?)", category: "Work", priority: "High" as TaskPriority },
      { title: "Check non-obviousness (would expert consider it unique?)", category: "Work", priority: "High" as TaskPriority },
      { title: "Check utility (does it serve useful purpose?)", category: "Work", priority: "High" as TaskPriority },
      { title: "Evaluate jurisdictional differences (US, EU, Japan, etc.)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Decide patent type (utility, design, or plant patent)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Assess if trade secret protection might be better", category: "Work", priority: "Low" as TaskPriority },
      
      // 4. Prototype & Proof of Concept
      { title: "Build functional prototype or proof of concept", category: "Work", priority: "High" as TaskPriority },
      { title: "Test for functionality and limitations", category: "Work", priority: "High" as TaskPriority },
      { title: "Document development with photos, notes, test data", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Consider multiple iterations to strengthen claims", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Prepare demonstration materials", category: "Work", priority: "Low" as TaskPriority },
      
      // 5. Patent Filing Strategy
      { title: "Decide: Provisional vs Non-Provisional Patent Application", category: "Work", priority: "High" as TaskPriority },
      { title: "Plan international filings (PCT, EPO, WIPO) if needed", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Plan budget (attorney fees, government fees, translations)", category: "Work", priority: "High" as TaskPriority },
      { title: "Decide self-file vs hire patent attorney/agent", category: "Work", priority: "High" as TaskPriority },
      { title: "Prepare timeline for filing in different regions", category: "Work", priority: "Medium" as TaskPriority },
      
      // 6. Drafting the Patent Application
      { title: "Write clear and detailed description of invention", category: "Work", priority: "High" as TaskPriority },
      { title: "Create claims defining legal scope", category: "Work", priority: "High" as TaskPriority },
      { title: "Include drawings, schematics, flowcharts", category: "Work", priority: "High" as TaskPriority },
      { title: "Add alternative embodiments (variations)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Describe best mode (most effective way of making it)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Check compliance with patent office requirements", category: "Work", priority: "Medium" as TaskPriority },
      
      // 7. Filing the Application
      { title: "File online with USPTO/EPO/WIPO or relevant office", category: "Work", priority: "High" as TaskPriority },
      { title: "Pay required filing fees", category: "Work", priority: "High" as TaskPriority },
      { title: "Get official filing receipt with application number", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Track deadlines for responses and future filings", category: "Work", priority: "Medium" as TaskPriority },
      
      // 8. Patent Prosecution (Review Phase)
      { title: "Respond to Office Actions (examiner questions/objections)", category: "Work", priority: "High" as TaskPriority },
      { title: "Provide clarifications, amendments, or arguments", category: "Work", priority: "High" as TaskPriority },
      { title: "Consider appeals if rejected", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Track deadlines to avoid abandonment", category: "Work", priority: "High" as TaskPriority },
      { title: "Maintain communication with attorney or agent", category: "Work", priority: "Medium" as TaskPriority },
      
      // 9. Post-Grant Actions (if approved)
      { title: "Pay maintenance/renewal fees at required intervals", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Record patent ownership if transferring or licensing", category: "Work", priority: "Low" as TaskPriority },
      { title: "Consider international expansion if only filed in one country", category: "Work", priority: "Low" as TaskPriority },
      { title: "File continuations/divisionals if needed", category: "Work", priority: "Low" as TaskPriority },
      
      // 10. Commercialization & Protection
      { title: "Develop licensing strategy (royalty deals, joint ventures)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Explore manufacturing options", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Build brand strategy around your patent", category: "Work", priority: "Low" as TaskPriority },
      { title: "Monitor for infringement (competitors, marketplaces)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Prepare enforcement strategy (cease-and-desist, lawsuits)", category: "Work", priority: "Low" as TaskPriority },
      { title: "Integrate with trademarks, copyrights for full IP protection", category: "Work", priority: "Low" as TaskPriority }
    ]
  },

  // ============= AVIATION & FLIGHT OPERATIONS =============
  {
    name: "✈️ Pilot Pre-Flight Checklist (Fixed-Wing Aircraft)",
    description: "Comprehensive pre-flight checklist for fixed-wing aircraft pilots covering all phases from planning to shutdown",
    category: "Aviation & Flight Operations",
    tags: ["aviation", "pilot", "pre-flight", "aircraft", "fixed-wing", "safety", "checklist"],
    tasks: [
      // A. Pre-Flight Preparation
      { title: "Review flight plan and weather briefings", category: "Work", priority: "High" as TaskPriority },
      { title: "Check NOTAMs (Notices to Airmen)", category: "Work", priority: "High" as TaskPriority },
      { title: "Confirm fuel requirements and reserves", category: "Work", priority: "High" as TaskPriority },
      { title: "Review aircraft maintenance logs", category: "Work", priority: "High" as TaskPriority },
      { title: "Ensure documents onboard: ARROW (Airworthiness, Registration, Radio License, Operating Limitations, Weight & Balance)", category: "Work", priority: "High" as TaskPriority },
      
      // B. Exterior Inspection
      { title: "Walk-around inspection complete", category: "Work", priority: "High" as TaskPriority },
      { title: "Check fuel levels, quality, and caps secure", category: "Work", priority: "High" as TaskPriority },
      { title: "Check oil levels and engine compartment", category: "Work", priority: "High" as TaskPriority },
      { title: "Inspect control surfaces (ailerons, rudder, elevator)", category: "Work", priority: "High" as TaskPriority },
      { title: "Verify landing gear condition and tires inflated", category: "Work", priority: "High" as TaskPriority },
      { title: "Pitot tube, static ports, and vents clear", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Lights and antennas secure", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Check for leaks or damage", category: "Work", priority: "High" as TaskPriority },
      
      // C. Interior Inspection
      { title: "Remove control locks", category: "Work", priority: "High" as TaskPriority },
      { title: "Check flight instruments and avionics power-up", category: "Work", priority: "High" as TaskPriority },
      { title: "Test communications and navigation radios", category: "Work", priority: "High" as TaskPriority },
      { title: "Verify transponder code set", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Check altimeter setting", category: "Work", priority: "High" as TaskPriority },
      { title: "Confirm emergency equipment onboard (fire extinguisher, first aid, ELT)", category: "Work", priority: "High" as TaskPriority },
      { title: "Seat belts, harnesses, doors secure", category: "Work", priority: "High" as TaskPriority },
      
      // D. Before Engine Start
      { title: "Brakes set", category: "Work", priority: "High" as TaskPriority },
      { title: "Circuit breakers checked", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Fuel selector valve proper position", category: "Work", priority: "High" as TaskPriority },
      { title: "Avionics master OFF", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Beacon ON", category: "Work", priority: "Medium" as TaskPriority },
      
      // E. Engine Start
      { title: "Mixture rich", category: "Work", priority: "High" as TaskPriority },
      { title: "Throttle cracked", category: "Work", priority: "High" as TaskPriority },
      { title: "Master switch ON", category: "Work", priority: "High" as TaskPriority },
      { title: "Magnetos ON / Start engine", category: "Work", priority: "High" as TaskPriority },
      { title: "Oil pressure within limits", category: "Work", priority: "High" as TaskPriority },
      { title: "Alternator output normal", category: "Work", priority: "Medium" as TaskPriority },
      
      // F. Before Takeoff
      { title: "Flight controls free and correct", category: "Work", priority: "High" as TaskPriority },
      { title: "Instruments and avionics set", category: "Work", priority: "High" as TaskPriority },
      { title: "Flaps set for takeoff", category: "Work", priority: "High" as TaskPriority },
      { title: "Trim set", category: "Work", priority: "High" as TaskPriority },
      { title: "Takeoff briefing complete", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Doors and windows closed", category: "Work", priority: "High" as TaskPriority },
      { title: "Lights as required", category: "Work", priority: "Medium" as TaskPriority },
      
      // G. After Takeoff / Climb
      { title: "Gear up (if retractable)", category: "Work", priority: "High" as TaskPriority },
      { title: "Flaps up", category: "Work", priority: "High" as TaskPriority },
      { title: "Power and mixture set", category: "Work", priority: "High" as TaskPriority },
      { title: "Check engine gauges", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Transponder on ALT", category: "Work", priority: "Medium" as TaskPriority },
      
      // H. Cruise
      { title: "Power and mixture set", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Engine instruments monitored", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Navigation and communication confirmed", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Position reports as required", category: "Work", priority: "Low" as TaskPriority },
      
      // I. Descent / Approach
      { title: "ATIS / Weather received", category: "Work", priority: "High" as TaskPriority },
      { title: "Altimeter set", category: "Work", priority: "High" as TaskPriority },
      { title: "Approach briefing complete", category: "Work", priority: "High" as TaskPriority },
      { title: "Fuel selector proper tank", category: "Work", priority: "High" as TaskPriority },
      { title: "Mixture adjusted", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Seat belts and harnesses secure", category: "Work", priority: "High" as TaskPriority },
      
      // J. Landing / Shutdown
      { title: "Flaps set", category: "Work", priority: "High" as TaskPriority },
      { title: "Landing gear down and locked (if applicable)", category: "Work", priority: "High" as TaskPriority },
      { title: "After landing checklist", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Taxi clear of runway", category: "Work", priority: "High" as TaskPriority },
      { title: "Engine shutdown", category: "Work", priority: "High" as TaskPriority },
      { title: "Magnetos OFF", category: "Work", priority: "High" as TaskPriority },
      { title: "Master switch OFF", category: "Work", priority: "High" as TaskPriority },
      { title: "Secure aircraft", category: "Work", priority: "High" as TaskPriority },
    ]
  },
  {
    name: "🚁 Helicopter Pilot Pre-Flight Checklist",
    description: "Complete pre-flight checklist for helicopter pilots covering all phases from planning through shutdown",
    category: "Aviation & Flight Operations",
    tags: ["aviation", "helicopter", "pilot", "pre-flight", "rotorcraft", "safety", "checklist"],
    tasks: [
      // A. Pre-Flight Planning
      { title: "Review weather and NOTAMs", category: "Work", priority: "High" as TaskPriority },
      { title: "Verify flight route and alternates", category: "Work", priority: "High" as TaskPriority },
      { title: "Confirm fuel load and weight/balance", category: "Work", priority: "High" as TaskPriority },
      { title: "Check aircraft maintenance log", category: "Work", priority: "High" as TaskPriority },
      { title: "Ensure required documents onboard", category: "Work", priority: "High" as TaskPriority },
      
      // B. Exterior Inspection
      { title: "Check rotor blades (main and tail) for damage or cracks", category: "Work", priority: "High" as TaskPriority },
      { title: "Verify pitch links and hinges secure", category: "Work", priority: "High" as TaskPriority },
      { title: "Inspect tail rotor gearbox and drive shaft", category: "Work", priority: "High" as TaskPriority },
      { title: "Check fuel and oil levels", category: "Work", priority: "High" as TaskPriority },
      { title: "Inspect landing gear / skids", category: "Work", priority: "High" as TaskPriority },
      { title: "Check lights and antennas", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Remove tie-downs and rotor blade restraints", category: "Work", priority: "High" as TaskPriority },
      
      // C. Cockpit Preparation
      { title: "Remove control locks", category: "Work", priority: "High" as TaskPriority },
      { title: "Check flight controls free and correct", category: "Work", priority: "High" as TaskPriority },
      { title: "Avionics and electrical power ON", category: "Work", priority: "High" as TaskPriority },
      { title: "Radios and navigation set", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Transponder code verified", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Fuel valve ON", category: "Work", priority: "High" as TaskPriority },
      { title: "Circuit breakers checked", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Seat belts and doors secure", category: "Work", priority: "High" as TaskPriority },
      
      // D. Engine Start
      { title: "Throttle idle", category: "Work", priority: "High" as TaskPriority },
      { title: "Master switch ON", category: "Work", priority: "High" as TaskPriority },
      { title: "Fuel pump ON (if applicable)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Engine start per POH procedure", category: "Work", priority: "High" as TaskPriority },
      { title: "Oil pressure rising", category: "Work", priority: "High" as TaskPriority },
      { title: "RPM and engine instruments in normal range", category: "Work", priority: "High" as TaskPriority },
      { title: "Avionics ON after start", category: "Work", priority: "Medium" as TaskPriority },
      
      // E. Before Takeoff (Hover Check)
      { title: "Controls free and centered", category: "Work", priority: "High" as TaskPriority },
      { title: "Check power available vs required", category: "Work", priority: "High" as TaskPriority },
      { title: "Anti-torque pedals adjusted", category: "Work", priority: "High" as TaskPriority },
      { title: "Trim neutral", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Engine and system instruments normal", category: "Work", priority: "High" as TaskPriority },
      { title: "Hover at 3–5 feet, check for vibrations or drift", category: "Work", priority: "High" as TaskPriority },
      
      // F. Takeoff / Climb
      { title: "Collective smooth increase", category: "Work", priority: "High" as TaskPriority },
      { title: "Maintain heading and climb rate", category: "Work", priority: "High" as TaskPriority },
      { title: "Monitor torque, RPM, and temps", category: "Work", priority: "High" as TaskPriority },
      { title: "Clear of obstacles", category: "Work", priority: "High" as TaskPriority },
      
      // G. Cruise
      { title: "Maintain desired altitude and airspeed", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Monitor engine parameters", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Check fuel flow and balance", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Verify navigation", category: "Work", priority: "Medium" as TaskPriority },
      
      // H. Approach / Landing
      { title: "Descent checklist complete", category: "Work", priority: "High" as TaskPriority },
      { title: "Approach path clear", category: "Work", priority: "High" as TaskPriority },
      { title: "Reduce power gradually", category: "Work", priority: "High" as TaskPriority },
      { title: "Maintain control alignment with pedals", category: "Work", priority: "High" as TaskPriority },
      { title: "Smooth collective reduction at touchdown", category: "Work", priority: "High" as TaskPriority },
      
      // I. Shutdown
      { title: "Throttle idle / OFF", category: "Work", priority: "High" as TaskPriority },
      { title: "Rotor brake (if equipped)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Avionics OFF", category: "Work", priority: "High" as TaskPriority },
      { title: "Fuel valve OFF", category: "Work", priority: "High" as TaskPriority },
      { title: "Master switch OFF", category: "Work", priority: "High" as TaskPriority },
      { title: "Secure controls", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Rotor blades tied down", category: "Work", priority: "High" as TaskPriority },
    ]
  },
  {
    name: "✈️ Fixed-Wing Pilot Complete Line-Item Checklist (Professional)",
    description: "Exhaustive professional-grade checklist for fixed-wing aircraft from pre-flight planning through shutdown with detailed line items",
    category: "Aviation & Flight Operations",
    tags: ["aviation", "pilot", "fixed-wing", "professional", "detailed", "commercial", "preflight"],
    tasks: [
      // A. Pre-Flight Planning
      { title: "Review planned route (origin → destination → alternates). Note: include lat/long of alternates", category: "Work", priority: "High" as TaskPriority },
      { title: "Check current METAR/TAF for departure, enroute, destination, alternates. Record observation times", category: "Work", priority: "High" as TaskPriority },
      { title: "Review NOTAMs affecting route, airports, and airspace (temporary restrictions). Log key NOTAM IDs", category: "Work", priority: "High" as TaskPriority },
      { title: "Calculate weight & balance; confirm within POH limits. Attach weight calc", category: "Work", priority: "High" as TaskPriority },
      { title: "Compute fuel required: trip + reserves (per reg/POH) + contingency. Verify fuel uplift needed", category: "Work", priority: "High" as TaskPriority },
      { title: "File flight plan (IFR/VFR) or activate flight plan; record FPL number", category: "Work", priority: "High" as TaskPriority },
      { title: "Review emergency procedures relevant to route (engine failure, forced landing fields)", category: "Work", priority: "High" as TaskPriority },
      { title: "Verify passenger briefings planned (use of seatbelts, evacuation, smoke/EMER procedures)", category: "Work", priority: "Medium" as TaskPriority },
      
      // B. Documents & Paperwork
      { title: "ARROW present and current: Airworthiness cert, Registration, Radio station license (if required), POH/Flight manual, Weight & Balance", category: "Work", priority: "High" as TaskPriority },
      { title: "Pilot medical certificate and photo ID valid", category: "Work", priority: "High" as TaskPriority },
      { title: "Insurance / ops paperwork available (charter/corporate as applicable)", category: "Work", priority: "Medium" as TaskPriority },
      
      // C. Exterior Walkaround
      { title: "Tie-downs removed", category: "Work", priority: "High" as TaskPriority },
      { title: "Fuselage/empennage: no dents, cracks, loose rivets. Note any corrosion", category: "Work", priority: "High" as TaskPriority },
      { title: "Wings & control surfaces: hinges secure, gap seals present, no foreign objects", category: "Work", priority: "High" as TaskPriority },
      { title: "Fuel caps secure; no fuel smell; drain sump sample from each tank; check for water/contamination. Record visual (clear/cloudy/separate phase)", category: "Work", priority: "High" as TaskPriority },
      { title: "Oil dipstick: within POH limits (min/max). Record quarts", category: "Work", priority: "High" as TaskPriority },
      { title: "Landing gear/struts: no leaks; tire pressure checked (psi / condition)", category: "Work", priority: "High" as TaskPriority },
      { title: "Pitot tube/static ports clear & covers removed", category: "Work", priority: "High" as TaskPriority },
      { title: "Antennas and lights secure; lens cracks?", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Fuel quantity visually matches gauges", category: "Work", priority: "High" as TaskPriority },
      
      // D. Cockpit / Before Start
      { title: "Control locks removed; control surfaces free & correct", category: "Work", priority: "High" as TaskPriority },
      { title: "Battery and master ON; avionics MASTER OFF (as required)", category: "Work", priority: "High" as TaskPriority },
      { title: "Circuit breakers IN (checked) and labeled", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Fuel selector(s) correct; primer in/out/locked per POH", category: "Work", priority: "High" as TaskPriority },
      { title: "Brakes set; chocks removed prior to engine start if pilot specified", category: "Work", priority: "High" as TaskPriority },
      { title: "Hobbs/TSO/Flight log updated; squawk/tech log discrepancies reviewed", category: "Work", priority: "Medium" as TaskPriority },
      
      // E. Engine Start
      { title: "Mixture rich (as applicable); throttle set per POH", category: "Work", priority: "High" as TaskPriority },
      { title: "Prime per POH; starter engage; observe oil pressure rising within X seconds (POH value)", category: "Work", priority: "High" as TaskPriority },
      { title: "Check ammeter/voltmeter charging; alternator online after start", category: "Work", priority: "High" as TaskPriority },
      { title: "Radios ON and standby frequencies set", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Avionics warm-up per manufacturer; GPS databases current", category: "Work", priority: "Medium" as TaskPriority },
      
      // F. Before Taxi
      { title: "Flight instruments set (heading, altimeter, attitude if required)", category: "Work", priority: "High" as TaskPriority },
      { title: "Transponder code set; squawk standby/alt as appropriate", category: "Work", priority: "High" as TaskPriority },
      { title: "Flight control check full travel and correct sense", category: "Work", priority: "High" as TaskPriority },
      { title: "Flight plan, FMS, or GPS route loaded and cross-checked", category: "Work", priority: "High" as TaskPriority },
      { title: "Taxi clearance received if controlled field", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Brakes test; steering/caster check", category: "Work", priority: "High" as TaskPriority },
      
      // G. Runup / Before Takeoff
      { title: "Magneto check: RPM drop within limits (list exact %)", category: "Work", priority: "High" as TaskPriority },
      { title: "Engine run-up power set to POH value; temps and pressures within limits", category: "Work", priority: "High" as TaskPriority },
      { title: "Carb heat/cowl flaps check (if applicable)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Flight controls again free & correct; trim set for takeoff", category: "Work", priority: "High" as TaskPriority },
      { title: "Flaps set for takeoff (confirm index/indicator)", category: "Work", priority: "High" as TaskPriority },
      { title: "Takeoff briefing complete: abort criteria, emergency plan, departure frequency, initial altitude", category: "Work", priority: "High" as TaskPriority },
      
      // H. Takeoff / Climb
      { title: "Confirm runway, winds, and rotation speed (VR)", category: "Work", priority: "High" as TaskPriority },
      { title: "Positive rate — gear up (if retractable)", category: "Work", priority: "High" as TaskPriority },
      { title: "Monitor engine gauges every 500 ft; mixture adjust above density altitude as required", category: "Work", priority: "High" as TaskPriority },
      { title: "After climb checklist (flaps up, climb power set, engine instruments green)", category: "Work", priority: "High" as TaskPriority },
      
      // I. Cruise
      { title: "Lean for cruise per POH; record RPM/MP and fuel flow", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Crosscheck nav/fuel/time estimates", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Monitor engine instruments at regular intervals (every 15–30 min)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Log position reports as required by ATC/CFI", category: "Work", priority: "Low" as TaskPriority },
      
      // J. Descent / Approach
      { title: "ATIS/AWOS obtained for destination", category: "Work", priority: "High" as TaskPriority },
      { title: "Altimeter set to current QNH", category: "Work", priority: "High" as TaskPriority },
      { title: "Approach briefing: runway, approach type, frequencies, missed approach procedure", category: "Work", priority: "High" as TaskPriority },
      { title: "Fuel selector and mixture adjusted for descent", category: "Work", priority: "High" as TaskPriority },
      { title: "Seats/seatbelts verified; secure loose items", category: "Work", priority: "High" as TaskPriority },
      
      // K. Landing / After Landing
      { title: "Landing checklist completed (gear/flaps/airspeeds per POH)", category: "Work", priority: "High" as TaskPriority },
      { title: "Confirm touchdown zone and roll-out plan", category: "Work", priority: "High" as TaskPriority },
      { title: "After landing: flaps up, transponder STBY if required, lights as needed", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Taxi clear of runway, brakes checked", category: "Work", priority: "High" as TaskPriority },
      
      // L. Shutdown & Securing
      { title: "Parking area: brake set", category: "Work", priority: "High" as TaskPriority },
      { title: "Avionics OFF, lights OFF per SOP", category: "Work", priority: "High" as TaskPriority },
      { title: "Mixture cutoff, mags OFF, master OFF", category: "Work", priority: "High" as TaskPriority },
      { title: "Control locks installed; pitot cover on", category: "Work", priority: "High" as TaskPriority },
      { title: "Fuel caps secured; chocks placed; tie-downs applied", category: "Work", priority: "High" as TaskPriority },
      { title: "Post-flight log entry: hours, issues, squawks. Report discrepancies to maintenance", category: "Work", priority: "Medium" as TaskPriority },
    ]
  },
  {
    name: "🚁 Helicopter Pilot Complete Line-Item Checklist (Professional)",
    description: "Exhaustive professional-grade checklist for helicopter operations from pre-flight planning through shutdown",
    category: "Aviation & Flight Operations",
    tags: ["aviation", "helicopter", "rotorcraft", "professional", "detailed", "commercial", "preflight"],
    tasks: [
      // A. Pre-Flight Planning
      { title: "Flight route, alternates, and landing zones planned with coordinates", category: "Work", priority: "High" as TaskPriority },
      { title: "Check METAR/TAF and low-level winds aloft; rotor icing potential", category: "Work", priority: "High" as TaskPriority },
      { title: "NOTAMs, TFRs, and airspace limitations reviewed", category: "Work", priority: "High" as TaskPriority },
      { title: "Weight & balance and CG check: include payload, fuel, and any external load", category: "Work", priority: "High" as TaskPriority },
      { title: "Confirm fuel uplift, endurance, reserves, and refueling points", category: "Work", priority: "High" as TaskPriority },
      
      // B. Documents & Ops
      { title: "Airworthiness, registration, POH/AFM on board", category: "Work", priority: "High" as TaskPriority },
      { title: "Pilot licences and medical valid", category: "Work", priority: "High" as TaskPriority },
      { title: "Operational approvals for special ops (offshore, HEMS, external load)", category: "Work", priority: "Medium" as TaskPriority },
      
      // C. Exterior Inspection — Rotor System
      { title: "Main rotor blades: leading edge erosion, nicks, delamination, blade tracking", category: "Work", priority: "High" as TaskPriority },
      { title: "Blade root attachments, pitch link bearings, and bolts torque checked", category: "Work", priority: "High" as TaskPriority },
      { title: "Tail rotor blades and gearbox: free of foreign object damage", category: "Work", priority: "High" as TaskPriority },
      { title: "Drive shaft / couplings: security and safety wire intact", category: "Work", priority: "High" as TaskPriority },
      { title: "Hydraulic lines and reservoirs: no leaks; fluid at correct level", category: "Work", priority: "High" as TaskPriority },
      { title: "Gearboxes: oil level & condition (no metal chips)", category: "Work", priority: "High" as TaskPriority },
      { title: "Skids or wheels: intact, no cracks; tie-downs removed", category: "Work", priority: "High" as TaskPriority },
      { title: "Fuel vents and caps secure", category: "Work", priority: "High" as TaskPriority },
      
      // D. Cockpit Preparation
      { title: "Control locks removed; cyclic/collective pedals free & full travel", category: "Work", priority: "High" as TaskPriority },
      { title: "Master ON; battery voltage within limits", category: "Work", priority: "High" as TaskPriority },
      { title: "Fuel pump ON/test per POH; fuel valve ON", category: "Work", priority: "High" as TaskPriority },
      { title: "Avionics set; GPS/flight instruments set for planned route", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Fire extinguisher onboard and serviceable", category: "Work", priority: "High" as TaskPriority },
      { title: "Passenger briefings prepared (headset, boarding procedures, doors)", category: "Work", priority: "Medium" as TaskPriority },
      
      // E. Engine Start
      { title: "Follow POH start sequence: ignition/checklist items per model", category: "Work", priority: "High" as TaskPriority },
      { title: "Observe oil pressure, N1/N2 (engine RPM) stabilization within POH limits", category: "Work", priority: "High" as TaskPriority },
      { title: "Rotor engagement/check idle RPM: ensure rotor systems warm-up to normal range", category: "Work", priority: "High" as TaskPriority },
      { title: "Test hydraulic functions and flight controls responsiveness", category: "Work", priority: "High" as TaskPriority },
      { title: "Radios and transponder set", category: "Work", priority: "Medium" as TaskPriority },
      
      // F. Hover Check / Before Takeoff
      { title: "Conduct hover check at 3–5 ft: controls centered, no unusual vibration", category: "Work", priority: "High" as TaskPriority },
      { title: "Confirm power margins for takeoff (hover-in-ground-effect/out-of-ground-effect) vs OGE power required", category: "Work", priority: "High" as TaskPriority },
      { title: "Anti-torque pedals set; collective trimmed", category: "Work", priority: "High" as TaskPriority },
      { title: "Doors secured; passengers briefed and seated", category: "Work", priority: "High" as TaskPriority },
      
      // G. Takeoff / Departure
      { title: "Smooth collective application to climb power; maintain heading", category: "Work", priority: "High" as TaskPriority },
      { title: "Monitor torques, temperatures, rotor RPM (Nr), and engine instruments", category: "Work", priority: "High" as TaskPriority },
      { title: "Confirm obstacle clearance and departure route", category: "Work", priority: "High" as TaskPriority },
      
      // H. Cruise / Enroute
      { title: "Establish cruise power settings per POH (torque/Nr/RPM)", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Monitor engine parameters at regular intervals and log any anomalies", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Check fuel remaining versus ETA and alternates every 15–30 minutes", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Maintain situational awareness for downdrafts, turbulence, or confined areas", category: "Work", priority: "Medium" as TaskPriority },
      
      // I. Approach / Landing
      { title: "Approach briefing: landing zone size, surface, obstacles, wind, spot for touchdown", category: "Work", priority: "High" as TaskPriority },
      { title: "Reduce airspeed, set descent rate controlled by collective/pedals/cyclic", category: "Work", priority: "High" as TaskPriority },
      { title: "Conduct confined area/autorotation brief if applicable", category: "Work", priority: "High" as TaskPriority },
      { title: "For touchdown: smooth collective reduction; maintain heading alignment", category: "Work", priority: "High" as TaskPriority },
      
      // J. Shutdown & Securing
      { title: "Move to designated shutdown area clear of people/debris", category: "Work", priority: "High" as TaskPriority },
      { title: "Throttle/mixture (or equivalent) to idle; follow POH shutdown sequence", category: "Work", priority: "High" as TaskPriority },
      { title: "Rotor brake as required; remove helicopter from active area", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Avionics and master OFF; control locks in place", category: "Work", priority: "High" as TaskPriority },
      { title: "Secure skids with tie-downs if outdoors", category: "Work", priority: "High" as TaskPriority },
      { title: "Post-flight log entry and report squawks", category: "Work", priority: "Medium" as TaskPriority },
    ]
  },
  {
    name: "🛠 Aircraft Maintenance Daily / A-Check Checklist",
    description: "Detailed daily and A-check style maintenance checklist for aircraft technicians and maintenance crews",
    category: "Aviation & Flight Operations",
    tags: ["aviation", "maintenance", "aircraft", "inspection", "technician", "a-check", "daily"],
    tasks: [
      // A. Maintenance Preparation
      { title: "Verify work order and aircraft tail number", category: "Work", priority: "High" as TaskPriority },
      { title: "Review last inspection signoffs and deferred defects log", category: "Work", priority: "High" as TaskPriority },
      { title: "Confirm required tooling and parts available", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Verify maintenance release / MEL items applicable", category: "Work", priority: "High" as TaskPriority },
      
      // B. General Airframe & Systems
      { title: "Exterior cleaning & inspection: corrosion, dents, fasteners", category: "Work", priority: "High" as TaskPriority },
      { title: "Landing gear: struts, brakes, torque checks, retraction function (if retractable)", category: "Work", priority: "High" as TaskPriority },
      { title: "Control surfaces: hinge bolts, cable tensions, balance weights", category: "Work", priority: "High" as TaskPriority },
      { title: "Flight control actuators: leakage and lash", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Doors/hatches: latches, seals, and emergency exits operational", category: "Work", priority: "High" as TaskPriority },
      
      // C. Powerplant
      { title: "Oil level and condition; sample for contamination if scheduled", category: "Work", priority: "High" as TaskPriority },
      { title: "Fuel system: filters, lines, pumps, vents operational; check for leaks", category: "Work", priority: "High" as TaskPriority },
      { title: "Engine mounts and cowling security", category: "Work", priority: "High" as TaskPriority },
      { title: "Exhaust system for cracks/leaks", category: "Work", priority: "High" as TaskPriority },
      { title: "Propeller/rotor: nicks, blade tracking, de-ice boots", category: "Work", priority: "High" as TaskPriority },
      
      // D. Hydraulics & Pneumatics
      { title: "Reservoir levels and filter condition", category: "Work", priority: "High" as TaskPriority },
      { title: "Pressure test of hydraulic system at operational points", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Leak checks at fittings and actuators", category: "Work", priority: "High" as TaskPriority },
      
      // E. Electrical & Avionics
      { title: "Battery load test and charging system (alternator/generator) output", category: "Work", priority: "High" as TaskPriority },
      { title: "Circuit breaker panel inspection; ground test as required", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Radios, transponder, GPS, autopilot functional test", category: "Work", priority: "Medium" as TaskPriority },
      { title: "ELT test per interval", category: "Work", priority: "Medium" as TaskPriority },
      
      // F. Safety & Emergency
      { title: "Fire extinguishers serviceable and inspected", category: "Work", priority: "High" as TaskPriority },
      { title: "First aid kit present and not expired", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Life rafts/personal flotation devices (if applicable) inspected", category: "Work", priority: "Medium" as TaskPriority },
      
      // G. Documentation & Signoff
      { title: "Record all inspections, parts changed, torque values, and test results", category: "Work", priority: "High" as TaskPriority },
      { title: "Return to service only after test flights/ground checks as required", category: "Work", priority: "High" as TaskPriority },
      { title: "Update logbook and maintenance records; get certifying signature", category: "Work", priority: "High" as TaskPriority },
    ]
  },
  {
    name: "🌤️ Pre-Flight Weather Briefing (Exhaustive)",
    description: "Comprehensive weather briefing checklist for pilots covering all meteorological factors and decision-making criteria",
    category: "Aviation & Flight Operations",
    tags: ["aviation", "weather", "briefing", "meteorology", "planning", "safety", "metar", "taf"],
    tasks: [
      { title: "Obtain METAR for departure (time-stamp) and destination (time-stamp)", category: "Work", priority: "High" as TaskPriority },
      { title: "Obtain TAF for destination and alternates (validity periods)", category: "Work", priority: "High" as TaskPriority },
      { title: "Review area forecast and winds aloft for enroute altitudes", category: "Work", priority: "High" as TaskPriority },
      { title: "Check current radar/satellite for convective activity and fronts", category: "Work", priority: "High" as TaskPriority },
      { title: "Confirm ceiling and visibility: note lowest expected values during ETA window", category: "Work", priority: "High" as TaskPriority },
      { title: "Check icing probability (clouds, freezing levels) and turbulence SIGMETs", category: "Work", priority: "High" as TaskPriority },
      { title: "Note wind shear advisories or LLWAS reports if available", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Check NOTAMs and AIRMET/SIGMET affecting weather or airport conditions", category: "Work", priority: "High" as TaskPriority },
      { title: "Evaluate crosswind components against aircraft limits (compute gust factor)", category: "Work", priority: "High" as TaskPriority },
      { title: "Decide on go / no-go criteria and document contingency plan", category: "Work", priority: "High" as TaskPriority },
    ]
  },
  {
    name: "🛩 Drone (UAV) Operator Operational Checklist",
    description: "Detailed operational checklist for commercial and recreational drone pilots covering pre-flight through post-flight procedures",
    category: "Aviation & Flight Operations",
    tags: ["drone", "uav", "quadcopter", "aerial", "commercial", "part-107", "operator", "safety"],
    tasks: [
      // A. Pre-Flight
      { title: "Verify pilot registration and drone registration numbers valid", category: "Work", priority: "High" as TaskPriority },
      { title: "Check local airspace authorization (LAANC or manual)", category: "Work", priority: "High" as TaskPriority },
      { title: "Confirm weather (wind, precipitation, visibility) within safe limits", category: "Work", priority: "High" as TaskPriority },
      { title: "Firmware up to date; battery charge ≥ operational minimum plus reserves", category: "Work", priority: "High" as TaskPriority },
      { title: "Inspect airframe: props, motors, arms, gimbal secure", category: "Work", priority: "High" as TaskPriority },
      { title: "Calibrate compass & IMU per manufacturer; verify GPS lock", category: "Work", priority: "High" as TaskPriority },
      { title: "Test camera and gimbal movement; confirm SD card recording", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Check remote controller battery and antenna", category: "Work", priority: "High" as TaskPriority },
      { title: "Confirm emergency procedures (RTH height, lost link)", category: "Work", priority: "High" as TaskPriority },
      
      // B. Flight
      { title: "Launch area clear of people and obstacles; announce operations", category: "Work", priority: "High" as TaskPriority },
      { title: "Takeoff vertical then hover check for stability", category: "Work", priority: "High" as TaskPriority },
      { title: "Monitor battery % and flight time remaining; respect reserve thresholds", category: "Work", priority: "High" as TaskPriority },
      { title: "Maintain VLOS/observer as required; maintain separation", category: "Work", priority: "High" as TaskPriority },
      { title: "Log flight start time, mission objectives, deviations", category: "Work", priority: "Medium" as TaskPriority },
      
      // C. Post-Flight
      { title: "Land in designated area; power down motors; remove battery", category: "Work", priority: "High" as TaskPriority },
      { title: "Inspect drone for damage; clean sensors & gimbals", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Download flight logs and media; back up to server", category: "Work", priority: "Medium" as TaskPriority },
      { title: "Record battery cycles & maintenance items", category: "Work", priority: "Low" as TaskPriority },
    ]
  },

  // ============= PROFESSIONAL OPERATIONS =============
  {
    name: "👥 New Employee Onboarding — Detailed Checklist (First 30 Days)",
    description: "Comprehensive new hire onboarding process from pre-start through first 30 days, covering HR, IT, training, and performance checkpoints",
    category: "Professional & Business",
    tags: ["onboarding", "hr", "employee", "training", "new-hire", "30-days"],
    tasks: [
      {
        title: "Day 0 / Pre-Start Preparation",
        category: "Work",
        priority: "High" as TaskPriority,
        checklistItems: [
          { id: "1", text: "Send welcome email with start time, parking, dress code, contacts", completed: false },
          { id: "2", text: "Provision workstation, email account, and software licenses", completed: false },
          { id: "3", text: "Print and prepare new hire packet (tax, direct deposit, NDA)", completed: false },
        ]
      },
      {
        title: "Day 1 - First Day",
        category: "Work",
        priority: "High" as TaskPriority,
        checklistItems: [
          { id: "1", text: "Greet and tour facilities; introduce to team and manager", completed: false },
          { id: "2", text: "Provide hardware (laptop), login credentials, network access", completed: false },
          { id: "3", text: "Review company handbook, policies, and role expectations", completed: false },
          { id: "4", text: "Set up HR documents and benefits enrollment walkthrough", completed: false },
          { id: "5", text: "Assign mentor and 1st-week schedule", completed: false },
        ]
      },
      {
        title: "Week 1 - Integration",
        category: "Work",
        priority: "High" as TaskPriority,
        checklistItems: [
          { id: "1", text: "Complete role-specific training modules; shadow tasks", completed: false },
          { id: "2", text: "Set 30/60/90 day goals and KPIs with manager", completed: false },
          { id: "3", text: "Verify access permissions to required systems", completed: false },
          { id: "4", text: "Feedback meeting at end of week 1", completed: false },
        ]
      },
      {
        title: "First 30 Days - Development",
        category: "Work",
        priority: "Medium" as TaskPriority,
        checklistItems: [
          { id: "1", text: "Complete required compliance trainings (security, safety)", completed: false },
          { id: "2", text: "Participate in cross-team introductions and product demos", completed: false },
          { id: "3", text: "Performance check-in at 30 days; adjust training plan", completed: false },
        ]
      },
    ]
  },
  {
    name: "💻 IT & Systems Maintenance — Detailed Operational Checklist",
    description: "Comprehensive IT maintenance schedule covering daily monitoring, weekly maintenance, monthly security updates, and incident response readiness",
    category: "Professional & Business",
    tags: ["it", "systems", "maintenance", "security", "operations", "devops", "monitoring"],
    tasks: [
      {
        title: "A. Daily Operations",
        category: "Work",
        priority: "High" as TaskPriority,
        checklistItems: [
          { id: "1", text: "Check system status dashboard; note service degradations", completed: false },
          { id: "2", text: "Review security alerts and patch notifications", completed: false },
          { id: "3", text: "Confirm backups completed and verify integrity for at least one sample restore", completed: false },
          { id: "4", text: "Monitor disk usage and queue alerts for >80% utilization", completed: false },
        ]
      },
      {
        title: "B. Weekly Maintenance",
        category: "Work",
        priority: "High" as TaskPriority,
        checklistItems: [
          { id: "1", text: "Apply non-critical patches in staging; document changes", completed: false },
          { id: "2", text: "Review user account activity logs for anomalies", completed: false },
          { id: "3", text: "Validate disaster recovery replication health", completed: false },
          { id: "4", text: "Test monitoring alert escalation path", completed: false },
        ]
      },
      {
        title: "C. Monthly Security & Compliance",
        category: "Work",
        priority: "High" as TaskPriority,
        checklistItems: [
          { id: "1", text: "Apply critical security patches in maintenance window (pre-announced)", completed: false },
          { id: "2", text: "Rotate service account keys/passwords per policy", completed: false },
          { id: "3", text: "Audit user access and remove inactive accounts >90 days", completed: false },
          { id: "4", text: "Run penetration test recon or schedule external pentest", completed: false },
        ]
      },
      {
        title: "D. Incident Response Readiness",
        category: "Work",
        priority: "Medium" as TaskPriority,
        checklistItems: [
          { id: "1", text: "Confirm playbook contact list (names, phones, escalation)", completed: false },
          { id: "2", text: "Run tabletop drill quarterly for major incident types", completed: false },
          { id: "3", text: "Ensure forensic logging retention meets policy (time period)", completed: false },
        ]
      },
    ]
  },
  {
    name: "🚨 Emergency Response / Incident — Actionable Checklist",
    description: "Critical incident response protocol from immediate safety assessment through recovery and post-incident review",
    category: "Professional & Business",
    tags: ["emergency", "incident", "response", "crisis", "safety", "disaster-recovery", "security"],
    tasks: [
      {
        title: "Immediate Response (0–5 minutes)",
        category: "Work",
        priority: "High" as TaskPriority,
        checklistItems: [
          { id: "1", text: "Ensure personal safety (A:Assess immediate hazards)", completed: false },
          { id: "2", text: "Call emergency services (911) if life-threatening", completed: false },
          { id: "3", text: "Activate internal emergency channel and notify supervisor", completed: false },
          { id: "4", text: "Isolate incident area if safe to do so (containment)", completed: false },
        ]
      },
      {
        title: "Short Term Response (5–60 minutes)",
        category: "Work",
        priority: "High" as TaskPriority,
        checklistItems: [
          { id: "1", text: "Triage affected people and provide first aid as needed", completed: false },
          { id: "2", text: "Preserve evidence and log initial facts (who, what, when, where)", completed: false },
          { id: "3", text: "Shut down impacted systems if cyber incident (isolate network segments)", completed: false },
          { id: "4", text: "Notify legal and compliance teams for regulatory matters", completed: false },
        ]
      },
      {
        title: "Recovery & Follow-Up",
        category: "Work",
        priority: "Medium" as TaskPriority,
        checklistItems: [
          { id: "1", text: "Initiate recovery plan (DR site, backups as applicable)", completed: false },
          { id: "2", text: "Compile incident report: timeline, root cause hypothesis, immediate actions", completed: false },
          { id: "3", text: "Schedule post-incident review and implement corrective actions", completed: false },
          { id: "4", text: "Communicate to stakeholders/customers per policy (timing and content controlled)", completed: false },
        ]
      },
    ]
  },
  {
    name: "🚀 Product Launch — Detailed Launch Checklist (MVP → Full Rollout)",
    description: "End-to-end product launch protocol covering planning, technical readiness, marketing, launch day operations, and post-launch monitoring",
    category: "Professional & Business",
    tags: ["product-launch", "startup", "mvp", "go-to-market", "deployment", "marketing", "sales"],
    tasks: [
      {
        title: "Planning Phase",
        category: "Work",
        priority: "High" as TaskPriority,
        checklistItems: [
          { id: "1", text: "Finalize product scope and 'must-have' vs 'nice-to-have' features", completed: false },
          { id: "2", text: "QA: all critical test cases passed (list pass rate)", completed: false },
          { id: "3", text: "Legal/compliance signoff on terms, privacy policy, and regulatory needs", completed: false },
          { id: "4", text: "Pricing, billing, and tax rules configured and tested", completed: false },
        ]
      },
      {
        title: "Technical Readiness",
        category: "Work",
        priority: "High" as TaskPriority,
        checklistItems: [
          { id: "1", text: "Deployment plan with rollback steps and test windows", completed: false },
          { id: "2", text: "Load test to target concurrency; verify autoscaling thresholds", completed: false },
          { id: "3", text: "Monitoring: availability, error rate, latency dashboards configured", completed: false },
          { id: "4", text: "Feature flags in place for instant rollback or staged release", completed: false },
        ]
      },
      {
        title: "Marketing & Sales Preparation",
        category: "Work",
        priority: "High" as TaskPriority,
        checklistItems: [
          { id: "1", text: "Messaging and creative assets finalized; approval signoffs logged", completed: false },
          { id: "2", text: "Sales enablement: scripts, FAQs, training for support/sales teams", completed: false },
          { id: "3", text: "Launch email/social schedule ready with tracking links and UTM parameters", completed: false },
          { id: "4", text: "Press / outreach list prepared; embargo rules clarified", completed: false },
        ]
      },
      {
        title: "Launch Day Operations",
        category: "Work",
        priority: "High" as TaskPriority,
        checklistItems: [
          { id: "1", text: "Morning pre-launch checklist: final smoke test, DB migrations, cache warm", completed: false },
          { id: "2", text: "Deploy during agreed window; monitor 15-min health checks for first 2 hours", completed: false },
          { id: "3", text: "Confirm error budget thresholds; notify engineering if crossed", completed: false },
          { id: "4", text: "Customer success team prepared for spikes in inquiries", completed: false },
        ]
      },
      {
        title: "Post-Launch Monitoring",
        category: "Work",
        priority: "Medium" as TaskPriority,
        checklistItems: [
          { id: "1", text: "24–72 hour hypercare: daily debriefs, bug triage, and rollback if necessary", completed: false },
          { id: "2", text: "Gather analytics: signups, conversions, retention signals", completed: false },
          { id: "3", text: "Iterate quick fixes on high-impact bugs; schedule next sprint roadmap", completed: false },
        ]
      },
    ]
  },
];