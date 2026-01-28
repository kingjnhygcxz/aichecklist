import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { 
  Mic, 
  Brain, 
  Timer, 
  Users, 
  Trophy, 
  Share, 
  Calendar, 
  Flag, 
  Play, 
  Youtube, 
  Zap, 
  Check,
  Plus,
  Settings,
  BarChart3,
  MessageSquare,
  Lock,
  Smartphone,
  HelpCircle,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/layout/Footer";

export function HelpPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const features = [
    {
      id: "voice-commands",
      title: "Voice Commands",
      icon: <Mic className="h-6 w-6" />,
      description: "Control your tasks with natural voice commands",
      details: [
        "Click the microphone button to activate voice listening",
        "Say 'Add task [task name]' to create new tasks",
        "Say 'Complete task [task name]' to mark tasks as done",
        "Say 'Delete task [task name]' to remove tasks",
        "AI automatically detects categories and priorities from your speech",
        "Supports multiple tasks in one voice command (e.g., 'Add buy groceries and call dentist')",
        "Voice recognition works in real-time with instant feedback"
      ]
    },
    {
      id: "ai-assistance",
      title: "AI Task Assistance",
      icon: <Brain className="h-6 w-6" />,
      description: "Get intelligent task suggestions and parsing",
      details: [
        "AI analyzes your existing tasks to suggest new ones",
        "Automatically categorizes tasks (Work, Personal, Shopping, Health, Other)",
        "Detects task priorities from your language (urgent, important, low priority)",
        "Provides insights about your task completion patterns",
        "Suggests optimal timing for different types of tasks",
        "Powered by OpenAI GPT-4o for advanced natural language understanding"
      ]
    },
    {
      id: "task-timers",
      title: "Task Timers",
      icon: <Timer className="h-6 w-6" />,
      description: "Built-in countdown timers for focused work",
      details: [
        "Set custom timer duration for each task (1-60 minutes)",
        "Visual countdown display with progress bar",
        "Play/pause functionality for interruptions",
        "Audio alarm notifications when timer completes",
        "Choose from different alarm sounds (Gentle Bell, Electronic Beep, etc.)",
        "Timer state persists across page refreshes",
        "Perfect for Pomodoro technique or time-boxing tasks"
      ]
    },
    {
      id: "task-sharing",
      title: "Task Sharing",
      icon: <Share className="h-6 w-6" />,
      description: "Share tasks with others via multiple methods",
      details: [
        "Share individual tasks via email with detailed descriptions",
        "Send task links via SMS to anyone with a phone number",
        "Direct user-to-user sharing with registered AIChecklist users",
        "Create shareable links that others can import as their own tasks",
        "Shared tasks inbox to manage received tasks from other users",
        "Accept or decline shared tasks before adding to your list",
        "Optional messages when sharing tasks directly with users"
      ]
    },
    {
      id: "achievements",
      title: "Achievement System",
      icon: <Trophy className="h-6 w-6" />,
      description: "Gamified progress tracking with rewards",
      details: [
        "22 different achievements to unlock across various categories",
        "Common, Rare, Epic, and Legendary achievement rarities",
        "Beautiful golden fireworks celebration when achievements unlock",
        "Track completion streaks, task milestones, and productivity patterns",
        "Achievement notifications with animated displays",
        "Points system for measuring overall progress",
        "Categories include: First Steps, Productivity, Consistency, Exploration, and Mastery"
      ]
    },
    {
      id: "recurring-tasks",
      title: "Recurring Tasks",
      icon: <Calendar className="h-6 w-6" />,
      description: "Automate repetitive tasks with schedules",
      details: [
        "Create tasks that repeat daily, weekly, monthly, or yearly",
        "Set custom start dates and times for recurring tasks",
        "Automatic generation of new instances based on schedule",
        "View child tasks created from recurring parent tasks",
        "Modify or pause recurring task schedules as needed",
        "Perfect for habits, regular meetings, or routine maintenance",
        "Background processing ensures tasks appear on schedule"
      ]
    },
    {
      id: "categories-priorities",
      title: "Categories & Priorities",
      icon: <Flag className="h-6 w-6" />,
      description: "Organize tasks with categories and priority levels",
      details: [
        "Five main categories: Work, Personal, Shopping, Health, Other",
        "Three priority levels: High (red), Medium (blue), Low (gray)",
        "Visual indicators with colored flags for quick identification",
        "Filter and sort tasks by category or priority",
        "AI automatically suggests appropriate categories based on task content",
        "Batch operations for changing categories or priorities",
        "Color-coded organization for visual task management"
      ]
    },
    {
      id: "youtube-integration",
      title: "YouTube Integration",
      icon: <Youtube className="h-6 w-6" />,
      description: "Attach YouTube videos to tasks for reference",
      details: [
        "Add YouTube video URLs to any task",
        "Embedded video player appears in task details",
        "Perfect for tutorials, training videos, or reference materials",
        "Video thumbnails show in task list for quick identification",
        "Supports all YouTube video formats and playlists",
        "Videos remain accessible even when task is completed",
        "Great for learning-based tasks or instructional content"
      ]
    },
    {
      id: "voice-biometrics",
      title: "Voice Biometric Authentication",
      icon: <Lock className="h-6 w-6" />,
      description: "Secure login using voice characteristics",
      details: [
        "Unique voice pattern recognition for secure access",
        "Analyzes pitch, frequency, energy, and voice characteristics",
        "Admin access with passphrase: 'welcome to the best ai list'",
        "Automatic user setup for new voice patterns",
        "Fallback authentication methods available",
        "Voice data encrypted and securely stored",
        "Hands-free login experience"
      ]
    },
    {
      id: "mobile-app",
      title: "Mobile Application",
      icon: <Smartphone className="h-6 w-6" />,
      description: "Native mobile app for iOS and Android",
      details: [
        "Full-featured React Native app with Expo",
        "Offline support with local data synchronization",
        "Push notifications for task reminders and achievements",
        "Dark theme optimized for mobile viewing",
        "Touch-friendly interface with gesture support",
        "Camera integration for task attachments",
        "Cross-platform compatibility (iOS and Android)",
        "Synchronizes with web version in real-time"
      ]
    },
    {
      id: "analytics",
      title: "Analytics & Insights",
      icon: <BarChart3 className="h-6 w-6" />,
      description: "Track your productivity patterns and progress",
      details: [
        "Personal productivity statistics and trends",
        "Task completion rates by category and priority",
        "Streak tracking for consistent task completion",
        "Time-based analytics showing peak productivity hours",
        "Achievement progress tracking with detailed metrics",
        "Weekly and monthly productivity reports",
        "Customer analytics for business insights (admin users)",
        "Export data for external analysis tools"
      ]
    },
    {
      id: "feedback-system",
      title: "Feedback System",
      icon: <MessageSquare className="h-6 w-6" />,
      description: "Submit feedback and feature requests",
      details: [
        "Comprehensive feedback form with multiple categories",
        "Bug reporting with detailed information capture",
        "Feature request submission and voting",
        "Rating system for overall satisfaction",
        "Direct communication with development team",
        "Status tracking for submitted feedback",
        "Community-driven feature development",
        "Regular updates based on user feedback"
      ]
    }
  ];

  const quickStartSteps = [
    {
      step: 1,
      title: "Create Your First Task",
      description: "Click 'Add Task' or use voice commands to create your first task. Try saying 'Add task buy groceries'.",
      icon: <Plus className="h-5 w-5" />
    },
    {
      step: 2,
      title: "Set Categories & Priorities",
      description: "Organize your tasks with categories (Work, Personal, etc.) and priorities (High, Medium, Low).",
      icon: <Flag className="h-5 w-5" />
    },
    {
      step: 3,
      title: "Use Voice Commands",
      description: "Click the microphone button and speak naturally. AI will understand and create tasks automatically.",
      icon: <Mic className="h-5 w-5" />
    },
    {
      step: 4,
      title: "Complete & Celebrate",
      description: "Mark tasks as complete and enjoy the achievement celebrations with golden fireworks!",
      icon: <Trophy className="h-5 w-5" />
    }
  ];

  const voiceCommands = [
    { command: "Add task [task name]", description: "Creates a new task" },
    { command: "Complete task [task name]", description: "Marks a task as completed" },
    { command: "Delete task [task name]", description: "Removes a task" },
    { command: "Add buy groceries and call dentist", description: "Creates multiple tasks at once" },
    { command: "Add urgent meeting tomorrow", description: "Creates high priority task" },
    { command: "Add personal task exercise", description: "Creates task with specific category" },
    { command: "List my tasks", description: "Shows current task list" },
    { command: "Show completed tasks", description: "Displays finished tasks" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Tasks
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">AIChecklist Help</h1>
                <p className="text-muted-foreground">Complete guide to all features</p>
              </div>
            </div>
            <Badge variant="secondary">
              <HelpCircle className="h-3 w-3 mr-1" />
              Support
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="voice-guide">Voice Guide</TabsTrigger>
            <TabsTrigger value="quick-start">Quick Start</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-6 w-6 text-amber-500" />
                    <span>Welcome to AIChecklist</span>
                  </CardTitle>
                  <CardDescription>
                    Your intelligent task management companion powered by AI and voice recognition
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">What Makes AIChecklist Special</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium">Voice-First Experience</p>
                            <p className="text-sm text-muted-foreground">Natural voice commands for hands-free task management</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium">AI-Powered Intelligence</p>
                            <p className="text-sm text-muted-foreground">Smart task parsing, suggestions, and categorization</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium">Gamified Progress</p>
                            <p className="text-sm text-muted-foreground">Achievement system with golden celebration effects</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Key Statistics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary">22</div>
                          <div className="text-sm text-muted-foreground">Achievements</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary">5</div>
                          <div className="text-sm text-muted-foreground">Categories</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary">3</div>
                          <div className="text-sm text-muted-foreground">Platforms</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary">∞</div>
                          <div className="text-sm text-muted-foreground">Possibilities</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
                    <h3 className="font-semibold text-amber-900 mb-2">New User?</h3>
                    <p className="text-amber-800 mb-4">
                      Start with the Quick Start guide to get up and running in minutes. 
                      Then explore the voice commands for a truly hands-free experience.
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => setActiveSection("quick-start")}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        Quick Start Guide
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setActiveSection("voice-guide")}
                        className="border-amber-300 text-amber-800 hover:bg-amber-50"
                      >
                        Voice Commands
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <div className="text-primary">{feature.icon}</div>
                          <span>{feature.title}</span>
                        </CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible>
                          <AccordionItem value="details">
                            <AccordionTrigger>View Details</AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2">
                                {feature.details.map((detail, i) => (
                                  <li key={i} className="flex items-start space-x-2">
                                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="voice-guide" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mic className="h-6 w-6 text-primary" />
                    <span>Voice Commands Guide</span>
                  </CardTitle>
                  <CardDescription>
                    Master voice commands for effortless task management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Getting Started</h3>
                    <ol className="text-blue-800 space-y-1 text-sm">
                      <li>1. Click the microphone button in the task interface</li>
                      <li>2. Allow microphone access when prompted</li>
                      <li>3. Wait for the "Listening..." indicator</li>
                      <li>4. Speak clearly and naturally</li>
                      <li>5. AI will process and create your tasks automatically</li>
                    </ol>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Common Voice Commands</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {voiceCommands.map((cmd, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Mic className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-mono text-sm font-medium">"{cmd.command}"</div>
                            <div className="text-sm text-muted-foreground">{cmd.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">Pro Tips</h3>
                    <ul className="text-green-800 space-y-1 text-sm">
                      <li>• Speak naturally - AI understands context and intent</li>
                      <li>• Use priority keywords: "urgent", "important", "low priority"</li>
                      <li>• Include category hints: "work meeting", "personal task", "shopping"</li>
                      <li>• Add multiple tasks in one command: "Add X and Y and Z"</li>
                      <li>• Use "next item" to continue adding more tasks</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="quick-start" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-6 w-6 text-primary" />
                    <span>Quick Start Guide</span>
                  </CardTitle>
                  <CardDescription>
                    Get up and running with AIChecklist in 4 simple steps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {quickStartSteps.map((step, index) => (
                      <motion.div
                        key={step.step}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        className="flex items-start space-x-4"
                      >
                        <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                          <p className="text-muted-foreground mb-3">{step.description}</p>
                          <div className="flex items-center space-x-2 text-primary">
                            {step.icon}
                            <span className="text-sm font-medium">Try it now</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-2">Ready to Start?</h3>
                    <p className="text-blue-800 mb-4">
                      Head back to your task list and try creating your first task with voice commands!
                    </p>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                      <Link href="/">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go to Task List
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}