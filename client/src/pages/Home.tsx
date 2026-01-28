import { useState, useEffect, Suspense, lazy } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { TrialBanner } from "@/components/TrialBanner";
import { FeatureGate, LockedFeatureBadge } from "@/components/FeatureGate";
import { TaskList } from "@/components/task/TaskList";
import { VoiceCommandButton } from "@/components/task/VoiceCommandButton";
import { SharedTasksInbox } from "@/components/SharedTasksInbox";
import { AchievementNotification } from "@/components/achievements/AchievementNotification";
import { DomoAIMicroLogo } from "@/components/domoai/DomoAIMicroLogo";

// Lazy load heavy components to reduce initial bundle size
const TaskInput = lazy(() => import("@/components/task/TaskInput"));
const MainTimer = lazy(() => import("@/components/timer/MainTimer"));
const Statistics = lazy(() => import("@/components/stats/Statistics"));
const AIInsights = lazy(() => import("@/components/stats/AIInsights"));
const RecurringTaskForm = lazy(() => import("@/components/task/RecurringTaskForm").then(module => ({ default: module.RecurringTaskForm })));
const ModernVoiceModalPreview = lazy(() => import("@/components/ui/ModernVoiceModal").then(module => ({ default: module.ModernVoiceModalPreview })));
const PrintTaskList = lazy(() => import("@/components/print/PrintTaskList").then(module => ({ default: module.PrintTaskList })));
const DomoAI = lazy(() => import("@/components/domoai/DomoAI").then(module => ({ default: module.DomoAI })));
const ChecklistView = lazy(() => import("@/components/ChecklistView").then(module => ({ default: module.ChecklistView })));
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";


import { queryClient } from "@/lib/queryClient";


import { useVoiceCommands } from "@/hooks/useVoiceCommands";
import { useAchievements } from "@/hooks/useAchievements";
import { useTimerPreferences } from "@/hooks/useTimerPreferences";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useGlobalTaskTimer } from "@/hooks/useGlobalTaskTimer";

import { useTaskManager } from "@/hooks/useTaskManager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MicIcon, HelpCircleIcon, RepeatIcon, BugIcon, Sparkles, Printer, ListTodo, ListChecks, Calendar, Eye, PlayCircle, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { DownloadCounter } from "@/components/stats/DownloadCounter";
import { playAlarmSound } from "@/lib/audio";
import { safeRedirect } from "@/lib/security";

// Loading component for lazy-loaded components
function ComponentLoader() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  );
}

export function Home() {
  const [activeTask, setActiveTask] = useState<{ id: string; title: string; timer: number } | undefined>();
  const [showRecurringTaskForm, setShowRecurringTaskForm] = useState(false);
  const [showModernModalPreview, setShowModernModalPreview] = useState(false);
  // Load alarm preferences from user preferences system
  const { preferences: userPreferences, updateAlarmPreferences, updatePreferences } = useUserPreferences();
  
  // Initialize alarm sound from localStorage for immediate access, fallback to preferences or default
  const getInitialAlarmSound = () => {
    const savedSound = localStorage.getItem('userPreferences_alarmSound');
    return savedSound || userPreferences?.alarmSound || "Gentle Bell";
  };
  
  const getInitialAlarmEnabled = () => {
    const savedEnabled = localStorage.getItem('userPreferences_alarmEnabled');
    if (savedEnabled !== null) {
      return savedEnabled === 'true';
    }
    return userPreferences?.alarmEnabled ?? true;
  };
  
  const [alarmSound, setAlarmSound] = useState(getInitialAlarmSound());
  const [alarmEnabled, setAlarmEnabled] = useState(getInitialAlarmEnabled());

  const { tasks } = useTaskManager();
  const { browserSupportsSpeechRecognition } = useVoiceCommands();
  const { toast } = useToast();
  const { preferences: timerPreferences } = useTimerPreferences();
  
  // Update local state when preferences change
  useEffect(() => {
    if (userPreferences?.alarmSound) {
      setAlarmSound(userPreferences.alarmSound);
    }
    if (userPreferences?.alarmEnabled !== undefined) {
      setAlarmEnabled(userPreferences.alarmEnabled);
    }
  }, [userPreferences?.alarmSound, userPreferences?.alarmEnabled]);
  
  // Use global task timer that persists across tab switches
  const { timerState, startTimer, pauseTimer, stopTimer, resetTimer } = useGlobalTaskTimer();
  
  // Handle timer completion - BULLETPROOF VERSION
  useEffect(() => {
    if (timerState && timerState.timeRemaining === 0 && timerState.progress === 100) {
      // Timer just completed
      toast({
        title: "Timer Complete! 🎉",
        description: `"${timerState.title}" timer has finished`,
        variant: "default",
      });
      
      // Play alarm sound if enabled
      if (alarmEnabled && alarmSound) {
        playAlarmSound(alarmSound);
      }
      
      // BULLETPROOF: Store completion timestamp to prevent duplicate stops
      const completionKey = `timer_completed_${timerState.id}_${timerState.timeRemaining}`;
      const alreadyProcessed = localStorage.getItem(completionKey);
      
      if (!alreadyProcessed) {
        localStorage.setItem(completionKey, Date.now().toString());
        // Clear the timer after a short delay - but only once
        setTimeout(() => {
          // Guard: only stop if still completed and not already cleared
          if (timerState && timerState.timeRemaining === 0) {
            stopTimer();
            // Clean up the completion flag after stopping
            localStorage.removeItem(completionKey);
          }
        }, 3000);
      }
    }
  }, [timerState?.timeRemaining, timerState?.progress, alarmEnabled, alarmSound, stopTimer, toast]);

  const handlePrintTasks = () => {
    // Save original title
    const originalTitle = document.title;
    
    // Set custom title for print filename
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    document.title = `aichecklist.io-tasks-${dateString}`;
    
    // Print
    window.print();
    
    // Restore original title after print
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };
  const { 
    newAchievement, 
    showNotification, 
    closeNotification, 
    triggerAchievementCheck,
    showTestAchievement,
    forceShowLatestAchievement
  } = useAchievements();
  
  // Handle task timer actions - using global timer
  const handleTaskTimerStart = (task: any) => {
    console.log('[Home] Starting task timer for:', task.title, 'Duration:', task.timer, 'minutes');
    startTimer({
      id: task.id,
      title: task.title,
      timer: task.timer
    });
  };

  // Handle task timer pause - using global timer
  const handleTaskTimerPause = (task: any, currentTimeRemaining?: number) => {
    console.log('[Home] Pausing task timer for:', task.title);
    if (timerState && timerState.id === task.id) {
      pauseTimer();
    }
  };

  // Handle task timer resume - using global timer  
  const handleTaskTimerResume = (task: any, currentTimeRemaining?: number) => {
    console.log('[Home] Resuming task timer for:', task.title);
    if (timerState && timerState.id === task.id) {
      startTimer(); // Resume without task parameter
    }
  };

  // Handle task timer stop - using global timer
  const handleTaskTimerStop = (task: any) => {
    console.log('[Home] Stopping task timer for:', task.title);
    if (timerState && timerState.id === task.id) {
      stopTimer();
    }
  };
  
  // Show a welcome toast to introduce voice commands when the page loads
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenVoiceCommandsWelcome');
    
    if (!hasSeenWelcome && browserSupportsSpeechRecognition) {
      setTimeout(() => {
        toast({
          title: "Voice Commands Available!",
          description: "Click the microphone icon to enable voice commands for hands-free task management.",
          duration: 8000,
        });
        localStorage.setItem('hasSeenVoiceCommandsWelcome', 'true');
      }, 2000);
    }
  }, [browserSupportsSpeechRecognition, toast]);

  const [activeTab, setActiveTab] = useState("tasks");
  // Timer panel state - persisted across sessions via user preferences
  const [isTimerPanelCollapsed, setIsTimerPanelCollapsed] = useState(() => {
    // Initialize from localStorage for immediate access
    try {
      const stored = localStorage.getItem('userPreferences');
      if (stored) {
        const prefs = JSON.parse(stored);
        return prefs.timerPanelCollapsed ?? false;
      }
    } catch (e) {}
    return false;
  });
  const [isAIDOMOFullscreen, setIsAIDOMOFullscreen] = useState(false);
  const [defaultTimerPanelSize] = useState(32); // Remember the standard position
  
  // Handle timer panel collapse toggle - update preferences for persistence
  const handleTimerPanelToggle = () => {
    const newValue = !isTimerPanelCollapsed;
    setIsTimerPanelCollapsed(newValue);
    // Persist to user preferences
    userPreferences && updatePreferences({ timerPanelCollapsed: newValue });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Refresh tasks when switching to tasks tab
    if (value === "tasks") {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  };

  const handleSecondaryNavClick = (destination: string) => {
    if (destination === "checklists") {
      setActiveTab("checklists");
    } else if (destination === "calendar") {
      // Navigate to calendar page
      safeRedirect("/calendar");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <TrialBanner />
      
      {/* Print-only component - hidden on screen */}
      <PrintTaskList />
      
      <main className="flex-1 container mx-auto px-4 py-6 lg:px-8 max-w-5xl no-print">
        <ResizablePanelGroup 
          direction="horizontal" 
          className="min-h-[600px] md:min-h-[600px] rounded-lg border transition-all duration-300 ease-in-out mobile-scroll-container"
        >
          {/* Main Task Panel - Resizable with smooth animations */}
          <ResizablePanel 
            defaultSize={68} 
            minSize={45} 
            maxSize={85}
            className="transition-all duration-300 ease-in-out"
          >
            <div className="p-6 h-full">
              <Tabs value={activeTab} className="w-full h-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-3 mb-4 transition-all duration-200">
                  <TabsTrigger value="tasks" className="flex items-center gap-2 transition-all duration-200">
                    <ListTodo className="h-4 w-4" />
                    Tasks
                  </TabsTrigger>
                  <TabsTrigger value="checklists" className="flex items-center gap-2 transition-all duration-200">
                    <ListChecks className="h-4 w-4" />
                    Checklists
                  </TabsTrigger>
                  <TabsTrigger value="domoai" className="flex items-center gap-1.5 transition-all duration-200">
                    <DomoAIMicroLogo size={14} />
                    <span className="text-sm">AIDOMO</span>
                  </TabsTrigger>
                </TabsList>


                <TabsContent value="tasks" className="mt-0 h-full">
                  {/* Printable Resources Message */}
                  <p className="text-xs text-muted-foreground text-right mb-1">These are printable resources to help show your staff productivity</p>
                  {/* Task Buttons - Moved Higher Up */}
                  <div className="flex items-center gap-2 transition-all duration-200 mb-0 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center transition-all duration-200 hover:scale-105"
                        onClick={handleTimerPanelToggle}
                        title={isTimerPanelCollapsed ? "Show Timer Panel" : "Hide Timer Panel"}
                        data-testid="button-toggle-timer-panel"
                      >
                        {isTimerPanelCollapsed ? (
                          <ChevronLeft className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center transition-all duration-200 hover:scale-105"
                        onClick={handlePrintTasks}
                        title="Print Tasks"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center space-x-1 transition-all duration-200 hover:scale-105"
                        onClick={forceShowLatestAchievement}
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        <span>Wins</span>
                      </Button>
                      
                      {browserSupportsSpeechRecognition && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="transition-all duration-200 hover:scale-105"
                            onClick={() => {
                              toast({
                                title: "Voice Command Help",
                                description: "Try saying: 'add task buy groceries', 'complete task buy groceries', or 'list tasks'",
                                duration: 5000,
                              });
                            }}
                          >
                            <HelpCircleIcon className="h-4 w-4 mr-2" />
                            Help
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Use the same voice functionality as the microphone button
                              const voiceButton = document.querySelector('[data-voice-button]') as HTMLButtonElement;
                              if (voiceButton) {
                                voiceButton.click();
                              }
                            }}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-105"
                          >
                            VOICE TASK
                          </Button>
                        </>
                      )}
                  </div>
                  
                  <div className="mb-0">
                    <h1 className="text-2xl font-bold transition-all duration-200">Tasks</h1>
                  </div>
                  
                  <div className="transition-all duration-300 ease-in-out">
                    <Suspense fallback={<ComponentLoader />}>
                      <TaskInput onTaskCreated={(task: any) => {
                        // Don't auto-start timer when task is created
                        // Timer should only start when user clicks the play button
                      }} />
                    </Suspense>
                    <TaskList 
                      onStartTimer={handleTaskTimerStart}
                      onPauseTimer={handleTaskTimerPause}
                      onResumeTimer={handleTaskTimerResume}
                      onStopTimer={handleTaskTimerStop}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="checklists" className="mt-0 h-full transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold transition-all duration-200">Checklists</h1>
                  </div>
                  <Suspense fallback={<ComponentLoader />}>
                    <ChecklistView />
                  </Suspense>
                </TabsContent>

                <TabsContent value="domoai" className="mt-0 h-full transition-all duration-300">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 transition-all duration-200 mb-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center transition-all duration-200 hover:scale-105"
                        onClick={() => setIsAIDOMOFullscreen(!isAIDOMOFullscreen)}
                        title={isAIDOMOFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        data-testid={isAIDOMOFullscreen ? "button-minimize-aidomo" : "button-maximize-aidomo"}
                      >
                        {isAIDOMOFullscreen ? (
                          <Minimize2 className="h-4 w-4" />
                        ) : (
                          <Maximize2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center transition-all duration-200 hover:scale-105"
                        onClick={handleTimerPanelToggle}
                        title={isTimerPanelCollapsed ? "Show Timer Panel" : "Hide Timer Panel"}
                        data-testid="button-toggle-timer-aidomo"
                      >
                        {isTimerPanelCollapsed ? (
                          <ChevronLeft className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Suspense fallback={<ComponentLoader />}>
                      <DomoAI isFullscreen={isAIDOMOFullscreen} setIsFullscreen={setIsAIDOMOFullscreen} />
                    </Suspense>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
          
          {/* Conditional Resizable Handle */}
          {!isTimerPanelCollapsed && (
            <ResizableHandle className="bg-border hover:bg-primary/20 transition-all duration-200 w-2" />
          )}
          
          {/* Side Panel with smooth show animation only */}
          {!isTimerPanelCollapsed && (
            <ResizablePanel 
              defaultSize={defaultTimerPanelSize} 
              minSize={25}
              maxSize={55}
              className="animate-in slide-in-from-right-full duration-500 ease-out"
            >
            <div className="p-6 h-full space-y-6 overflow-hidden animate-in fade-in duration-500 animate-delay-150">
              {timerPreferences?.timerEnabled && userPreferences && (
                <div className="transition-all duration-300 ease-in-out transform w-full max-w-full overflow-hidden">
                  <Suspense fallback={<ComponentLoader />}>
                    <MainTimer 
                      activeTask={timerState ? {
                        ...timerState,
                        startTimer: () => startTimer(),
                        pauseTimer: () => pauseTimer(),
                        stopTimer: () => stopTimer(),
                        resetTimer: () => resetTimer()
                      } : undefined}
                      alarmSound={alarmSound}
                      onAlarmSoundChange={(sound) => {
                        setAlarmSound(sound);
                        updateAlarmPreferences(sound, undefined);
                      }}
                      alarmEnabled={alarmEnabled}
                      onAlarmToggle={(enabled) => {
                        setAlarmEnabled(enabled);
                        updateAlarmPreferences(undefined, enabled);
                      }}
                    />
                  </Suspense>
                </div>
              )}
              <div className="transition-all duration-300 ease-in-out transform">
                <SharedTasksInbox />
              </div>
              <div className="transition-all duration-300 ease-in-out transform">
                <Suspense fallback={<ComponentLoader />}>
                  <Statistics />
                </Suspense>
              </div>
              <div className="transition-all duration-300 ease-in-out transform">
                <FeatureGate feature="ai-insights" requiredPlan="pro">
                  <Suspense fallback={<ComponentLoader />}>
                    <AIInsights />
                  </Suspense>
                </FeatureGate>
              </div>
            </div>
          </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </main>
      
      <div className="no-print">
        <Footer />
        
        {/* Recurring Task Form */}
        <Suspense fallback={<ComponentLoader />}>
          <RecurringTaskForm 
            open={showRecurringTaskForm} 
            onClose={() => setShowRecurringTaskForm(false)} 
          />
        </Suspense>
        
        {/* Modern Voice Modal Preview */}
        {showModernModalPreview && (
          <div onClick={() => setShowModernModalPreview(false)}>
            <Suspense fallback={<ComponentLoader />}>
              <ModernVoiceModalPreview />
            </Suspense>
          </div>
        )}
        
        {/* Toast notifications */}
        <Toaster />
        
        {/* Achievement Notification with Fireworks */}
        <AchievementNotification
          achievement={newAchievement}
          isVisible={showNotification}
          onClose={closeNotification}
        />
      </div>
      
      {/* Download Counter Section - Way at the bottom */}
      <div className="w-full bg-background border-t border-border py-8 mt-12 no-print">
        <div className="container mx-auto max-w-5xl flex justify-center">
          <DownloadCounter />
        </div>
      </div>
    </div>
  );
}

export default Home;
