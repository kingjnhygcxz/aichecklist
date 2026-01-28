import { storage } from "./storage";
import { TaskPriority } from "@shared/schema";

// Popular 2025 templates based on Todoist and Asana trends
const popularTemplates = [
  {
    name: "Weekly Review & Planning",
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
    name: "Deep Work Session",
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
    name: "Weekly Meal Planning",
    description: "Personal-life organization that brings mental clarity and saves time",
    category: "Personal Productivity", 
    tags: ["meal-prep", "planning", "health"],
    tasks: [
      { title: "Check pantry and fridge inventory", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Plan 7 meals for the week", category: "Personal", priority: "High" as TaskPriority },
      { title: "Create shopping list", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Shop for groceries", category: "Shopping", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 1 },
      { title: "Prep ingredients for 3 meals", category: "Personal", priority: "Medium" as TaskPriority, scheduledDaysFromNow: 2 },
    ]
  },
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
  }
];

export async function seedTemplates() {
  try {
    console.log("Seeding popular 2025 templates...");
    
    for (const templateData of popularTemplates) {
      const template = await storage.createTemplate({
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        tasks: templateData.tasks,
        isPublic: true,
        createdByUserId: null, // System templates
        tags: templateData.tags,
      });
      console.log(`✓ Created template: ${template.name}`);
    }
    
    console.log(`Successfully seeded ${popularTemplates.length} templates!`);
  } catch (error) {
    console.error("Error seeding templates:", error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTemplates().then(() => process.exit(0));
}