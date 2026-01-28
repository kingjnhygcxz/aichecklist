import { Router } from "express";
import { logger } from "../logger";

const router = Router();

const FEATURE_CATEGORIES = {
  "Task Management": [
    "Create, edit, delete tasks with title, category, priority",
    "Drag-and-drop task reordering",
    "Task completion with confetti celebration",
    "Task archiving with configurable auto-archive",
    "Task notes and descriptions",
    "Timer assignment to tasks (1-120 minutes)",
    "YouTube video attachment to tasks",
    "Task scheduling with date/time picker",
    "Recurring task creation (daily, weekly, biweekly, monthly, yearly, custom)",
    "Task dependencies for ordering",
    "Buffer time before/after events",
    "Fixed vs flexible scheduling",
    "Subtask tree view with nested subtasks",
    "Checklist items within tasks",
    "Task sharing via unique links",
    "Import shared tasks from others",
    "Optimistic UI updates for instant feedback",
    "Up/down arrow task reordering"
  ],
  "AIDOMO AI Assistant": [
    "GPT-4o powered chat assistant",
    "Automatic fallback to Gemini 2.5-Pro",
    "Calendar task creation from natural language",
    "Task suggestions based on context",
    "Template recommendations",
    "Voice task parsing (speech-to-task)",
    "Conversation history with save/load",
    "Word document export of conversations",
    "Print-formatted conversation export",
    "Token-based usage tracking",
    "Fullscreen immersive chat mode",
    "ADHD-friendly prompts and responses",
    "Professional report generation",
    "Multi-turn conversation context"
  ],
  "Voice & Biometrics": [
    "Voice command recognition (add, complete, list tasks)",
    "Voice biometric authentication",
    "Adaptive voice learning over time",
    "Voice health monitoring",
    "Multi-factor authentication with voice",
    "Environment data capture for security",
    "Confidence scoring for voice matches",
    "Browser-native Web Speech API integration"
  ],
  "Templates & Productivity": [
    "226+ pre-loaded productivity templates",
    "Template categories (ADHD, business, personal, creative, etc.)",
    "Custom template creation",
    "Template usage tracking",
    "Template search by name, category, tags",
    "Relative date scheduling in templates",
    "Timer presets in templates",
    "Template duplication prevention"
  ],
  "Timer & Focus": [
    "Pomodoro-style task timers",
    "Customizable alarm sounds (8 options)",
    "Timer persistence across navigation",
    "Global task timer management",
    "Visual progress bar",
    "Start/pause/resume/stop controls",
    "Auto-clear on completion",
    "Timer analytics tracking"
  ],
  "Calendar & Scheduling": [
    "Interactive calendar view",
    "Month/week/day views",
    "Google Calendar two-way sync",
    "Abstract calendar provider architecture",
    "Task-to-calendar event mapping",
    "Drag events between dates",
    "Clean print view (calendar only)",
    "All-day event support",
    "Event color coding by category"
  ],
  "Appointment Scheduling": [
    "Public booking pages (2 versions)",
    "3-step animated reservation flow",
    "Customizable brand colors",
    "Business name and logo display",
    "Weekly availability configuration",
    "Blocked dates and time slots",
    "Email notifications for bookings",
    "Booking window configuration",
    "Slot duration settings",
    "V2 calendar background themes"
  ],
  "Achievements & Gamification": [
    "Achievement badges for milestones",
    "Golden confetti celebrations",
    "Achievement progress tracking",
    "Achievement notifications",
    "Leaderboard functionality",
    "First task, streak, and category achievements",
    "Timer master achievements",
    "Data collection consent for tracking"
  ],
  "Statistics & Insights": [
    "Task completion statistics",
    "Category distribution charts",
    "Priority analysis",
    "AI-generated productivity insights",
    "Weekly/monthly trends",
    "Timer usage analytics",
    "Completion rate tracking",
    "Download counter display"
  ],
  "Authentication & Security": [
    "Email/password login",
    "Email code verification",
    "Remember me session extension (30 days)",
    "Database-backed sessions",
    "Role-based access control (admin, user, guest)",
    "Session management with user control",
    "Secure password reset flow",
    "Voice biometric 2FA option"
  ],
  "VR & Immersive": [
    "Meta Quest VR support",
    "HTC Vive VR support",
    "Valve Index VR support",
    "Apple Vision Pro spatial computing",
    "VR session token management",
    "VR device type logging",
    "Unified VR task API",
    "VR headset-specific experiences"
  ],
  "Subscription & Billing": [
    "Free tier with basic features",
    "Pro tier with advanced features",
    "Enterprise tier with voice auth",
    "Stripe payment integration",
    "Subscription management",
    "Usage-based AIDOMO tokens",
    "Bonus token system for admins"
  ],
  "Data & Export": [
    "Word document conversation export",
    "PDF task reports",
    "Calendar print export",
    "Task list printing",
    "Web page summarization",
    "Offline AI with WebLLM",
    "Local storage caching",
    "Database backup compatibility"
  ],
  "UI & Accessibility": [
    "Dark mode support",
    "Responsive mobile design",
    "Resizable panels",
    "Auto-collapsing UI elements",
    "Timer panel toggle with persistence",
    "Keyboard navigation",
    "Screen reader compatibility",
    "Print-friendly styles"
  ],
  "Mobile & Cross-Platform": [
    "React Native mobile app",
    "Expo audio processing",
    "AsyncStorage persistence",
    "Cross-platform voice commands",
    "Mobile-optimized touch targets",
    "Offline mobile capabilities"
  ]
};

router.get("/", (req, res) => {
  try {
    logger.info("AI Features API accessed");
    
    const totalFeatures = Object.values(FEATURE_CATEGORIES).reduce(
      (sum, features) => sum + features.length, 
      0
    );
    
    res.json({
      success: true,
      platform: "AIChecklist.io",
      description: "AI-Powered Task Management Platform with ADHD-friendly features",
      totalFeatures,
      categories: Object.keys(FEATURE_CATEGORIES).length,
      features: FEATURE_CATEGORIES,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Error fetching AI features", { error });
    res.status(500).json({ success: false, error: "Failed to fetch features" });
  }
});

router.get("/categories", (req, res) => {
  try {
    const categories = Object.keys(FEATURE_CATEGORIES).map(name => ({
      name,
      count: FEATURE_CATEGORIES[name as keyof typeof FEATURE_CATEGORIES].length
    }));
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    logger.error("Error fetching feature categories", { error });
    res.status(500).json({ success: false, error: "Failed to fetch categories" });
  }
});

router.get("/category/:name", (req, res) => {
  try {
    const { name } = req.params;
    const categoryKey = Object.keys(FEATURE_CATEGORIES).find(
      k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === name.toLowerCase().replace(/[^a-z0-9]/g, '')
    );
    
    if (!categoryKey) {
      return res.status(404).json({ 
        success: false, 
        error: "Category not found",
        availableCategories: Object.keys(FEATURE_CATEGORIES)
      });
    }
    
    res.json({
      success: true,
      category: categoryKey,
      features: FEATURE_CATEGORIES[categoryKey as keyof typeof FEATURE_CATEGORIES]
    });
  } catch (error) {
    logger.error("Error fetching category features", { error });
    res.status(500).json({ success: false, error: "Failed to fetch category" });
  }
});

router.get("/search", (req, res) => {
  try {
    const query = (req.query.q as string || "").toLowerCase();
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        error: "Query parameter 'q' is required" 
      });
    }
    
    const results: { category: string; feature: string }[] = [];
    
    for (const [category, features] of Object.entries(FEATURE_CATEGORIES)) {
      for (const feature of features) {
        if (feature.toLowerCase().includes(query)) {
          results.push({ category, feature });
        }
      }
    }
    
    res.json({
      success: true,
      query,
      count: results.length,
      results
    });
  } catch (error) {
    logger.error("Error searching features", { error });
    res.status(500).json({ success: false, error: "Failed to search features" });
  }
});

export default router;
