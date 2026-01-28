import { useState, useRef, useEffect, useMemo } from "react";
import { useTaskManager } from "@/hooks/useTaskManager";
import { useTimer } from "@/hooks/useTimer";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Check, 
  Pencil, 
  Trash, 
  Flag, 
  Clock, 
  Pause, 
  Play,
  Square, 
  RefreshCw, 
  Share2,
  GripVertical,
  Plus,
  Minus,
  ChevronUp,
  ChevronDown,
  ListChecks,
  Loader2
} from "lucide-react";
import { SiNotion, SiTrello } from "@/components/icons/BrandIcons";
import { Task } from "@/types";
import { EditTaskDialog } from "./EditTaskDialog";
import { ChecklistDialog } from "./ChecklistDialog";
import { ArchiveButton } from "./ArchiveButton";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Pop, 
  ButtonPress, 
  HoverScale, 
  SlideIn, 
  SuccessAnimation 
} from "@/components/animations/MicroAnimations";

import { useToast } from "@/hooks/use-toast";
import { ShareTaskPopup } from "@/components/ShareTaskPopup";
import { YouTubeVideoThumbnail } from "@/components/task/YouTubeVideoThumbnail";
import { useAchievements } from "@/hooks/useAchievements";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface TaskItemProps {
  task: Task;
  onTaskCompleted?: (task: Task) => void;
  isDropTarget?: boolean;
  onStartTimer?: (task: Task) => void;
  onPauseTimer?: (task: Task, currentTimeRemaining?: number) => void;
  onResumeTimer?: (task: Task, currentTimeRemaining?: number) => void;
  onStopTimer?: (task: Task) => void;
}

export function TaskItem({ task, onTaskCompleted, isDropTarget = false, onStartTimer, onPauseTimer, onResumeTimer, onStopTimer }: TaskItemProps) {
  const { toggleTaskComplete, deleteTask, tasks, reorderTasks } = useTaskManager();
  const [wasCompleted, setWasCompleted] = useState(task.completed);
  const [isCompleting, setIsCompleting] = useState(false);
  const checkboxRef = useRef<HTMLButtonElement>(null);
  const taskRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const lastTimerActionRef = useRef<number>(0);
  const { triggerAchievementCheck } = useAchievements();
  
  // Notion integration - query for connection status (fetch once with staleTime)
  const { data: notionStatus } = useQuery<{ connected: boolean; workspaceName?: string | null }>({
    queryKey: ['/api/notion/status'],
    staleTime: Infinity,
    retry: false,
  });
  
  // Trello integration - query for connection status
  const { data: trelloStatus } = useQuery<{ connected: boolean; username?: string | null }>({
    queryKey: ['/api/trello/status'],
    staleTime: Infinity,
    retry: false,
  });
  
  // Mutation for sending task to Notion
  const sendToNotionMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiRequest('POST', '/api/notion/send-task', { taskId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sent to Notion",
        description: "Task has been successfully sent to your Notion workspace.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send to Notion",
        description: error.message || "Please check your Notion connection and try again.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for sending task to Trello
  const sendToTrelloMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiRequest('POST', '/api/trello/send-task', { taskId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sent to Trello",
        description: "Task has been successfully sent to your Trello board.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send to Trello",
        description: error.message || "Could not send task to Trello",
        variant: "destructive",
      });
    },
  });
  
  // Drag and drop functionality - simplified like the example
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    disabled: task.completed // Disable drag for completed tasks
  });
  
  // Get timer value safely and stabilize it
  const timerValue = task.timer ?? 0;
  
  // Only show timer when there's a valid timer value
  const hasValidTimer = timerValue > 0;
  // Check if timer should be shown based on saved state
  const [showTimer, setShowTimer] = useState(() => {
    if (!hasValidTimer) return false;
    try {
      const key = `timer_${task.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const state = JSON.parse(saved);
        return state.isActive || state.isPaused || false;
      }
    } catch (e) {
      // Ignore errors
    }
    return false;
  });
  
  // Stabilize timer duration - only change if task.timer actually changes
  const [stableTimerDuration, setStableTimerDuration] = useState(() => {
    return hasValidTimer ? timerValue * 60 : 25 * 60; // Default to 25 minutes if no timer
  });
  
  // Track if timer is running - check localStorage for active state
  const [timerRunning, setTimerRunning] = useState(() => {
    try {
      const key = `timer_${task.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const state = JSON.parse(saved);
        return state.isActive || false;
      }
    } catch (e) {
      // Ignore errors
    }
    return false;
  });
  
  // Import user preferences hook for alarm settings  
  const { preferences } = useUserPreferences();
  
  // Get alarm preferences efficiently - memoized to prevent recalculation
  const timerPrefs = useMemo(() => {
    const localPref = localStorage.getItem('userPreferences_alarmSound');
    return {
      alarmSound: localPref || preferences?.alarmSound || "Gentle Bell",
      alarmEnabled: preferences?.alarmEnabled ?? true
    };
  }, [preferences?.alarmSound, preferences?.alarmEnabled]);

  const { startTimer, pauseTimer, stopTimer, resetTimer, timeRemaining, progress, isActive, isPaused } = useTimer({
    initialSeconds: stableTimerDuration,
    alarmEnabled: timerPrefs.alarmEnabled,
    alarmSound: timerPrefs.alarmSound,
    taskId: task.id // Add taskId for unique timer persistence across navigation
  });
  
  // Only update stable duration if task.timer actually changes AND timer is not running
  useEffect(() => {
    // Skip if timer is active - prevents unnecessary updates
    if (timerRunning || isActive) return;
    
    const newDuration = hasValidTimer ? timerValue * 60 : 25 * 60;
    setStableTimerDuration(prevDuration => 
      newDuration !== prevDuration ? newDuration : prevDuration
    );
  }, [timerValue, hasValidTimer, timerRunning, isActive]);

  // Track timer completion and sync visual state
  useEffect(() => {
    if (timeRemaining === 0 && isActive) {
      setTimerRunning(false);
      setShowTimer(false);
    }
    // Sync visual state with actual timer state
    if (isActive || isPaused) {
      setShowTimer(true);
      setTimerRunning(isActive);
    }
  }, [timeRemaining, isActive, isPaused]);

  // Track task completion for animation
  useEffect(() => {
    // If task was just completed (previously not completed, now completed)
    if (!wasCompleted && task.completed && onTaskCompleted) {
      // Start completion animation
      setIsCompleting(true);
      
      // Create golden glow effect
      if (taskRef.current) {
        taskRef.current.style.boxShadow = "0 0 20px rgba(251, 191, 36, 0.5)";
        taskRef.current.style.borderColor = "rgba(251, 191, 36, 0.8)";
      }
      
      // Trigger the confetti celebration after a short delay
      setTimeout(() => {
        onTaskCompleted(task);
        setIsCompleting(false);
        
        // Remove golden glow
        if (taskRef.current) {
          taskRef.current.style.boxShadow = "";
          taskRef.current.style.borderColor = "";
        }
      }, 800);
    }
    
    // Update the wasCompleted state to match current task completion state
    setWasCompleted(task.completed);
  }, [task.completed, wasCompleted, onTaskCompleted, task]);

  const handleToggleComplete = async () => {
    // If marking as complete, start animation immediately
    if (!task.completed) {
      setIsCompleting(true);
    }
    
    await toggleTaskComplete(task.id);
    
    // If task is being marked as completed, trigger achievement check
    if (!task.completed) {
      // Trigger achievement check immediately for faster response
      triggerAchievementCheck();
    } else {
      // If uncompleting, stop animation
      setIsCompleting(false);
    }
  };



  const getPriorityIcon = () => {
    switch (task.priority) {
      case "High": 
        return <Flag className="h-4 w-4 mr-1 fill-current" />;
      case "Medium": 
        return <Flag className="h-4 w-4 mr-1" />;
      case "Low": 
        return <Flag className="h-4 w-4 mr-1 opacity-50" />;
      default: 
        return <Flag className="h-4 w-4 mr-1 opacity-50" />;
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case "High": return "text-red-400";
      case "Medium": return "text-primary";
      case "Low": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  const getCategoryColor = () => {
    return task.completed ? "bg-primary/5 text-muted-foreground" : "bg-primary/10 text-primary";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Check if task has checklist items
  const hasChecklist = task.checklistItems && task.checklistItems.length > 0;

  return (
    <motion.div 
      ref={setNodeRef}
      style={style}
      className={cn(
        "border border-border rounded-md p-4 bg-background/50 hover:bg-background group relative overflow-hidden",
        "transition-colors duration-150 ease-out", // Only transition colors, not transforms
        "cursor-default",
        isCompleting && "scale-[1.02]",
        task.completed && "bg-gradient-to-r from-amber-50/20 to-yellow-50/20 opacity-70",
        isDragging && "opacity-80 shadow-2xl scale-[1.03] z-50 rotate-2 bg-primary/10 border-primary/30",
        isDropTarget && "bg-primary/5 border-primary/40 shadow-lg shadow-primary/20",
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isDragging ? 0.85 : 1, 
        y: 0,
        scale: isCompleting ? 1.02 : (isDragging ? 1.03 : 1),
        rotate: isDragging ? 2 : 0,
      }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ 
        duration: isDragging ? 0.1 : 0.15, // Ultra-fast animations during drag
        scale: { duration: 0.1, ease: "easeOut" },
        rotate: { duration: 0.08, ease: "easeOut" },
        type: isDragging ? "tween" : "spring", // Tween for dragging, spring for rest
        stiffness: 400, 
        damping: 25
      }}
      layout
    >
      {/* Golden completion ripple effect */}
      <AnimatePresence>
        {isCompleting && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-yellow-400/30 to-orange-400/20 rounded-md"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, 0.8, 0],
              scale: [0.8, 1.1, 1.2]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.8,
              ease: "easeOut",
              opacity: { times: [0, 0.3, 1] }
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Completion sparkle particles */}
      <AnimatePresence>
        {isCompleting && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-amber-400 rounded-full"
                initial={{ 
                  opacity: 0,
                  x: "50%",
                  y: "50%",
                  scale: 0
                }}
                animate={{
                  opacity: [0, 1, 0],
                  x: `${50 + (Math.random() - 0.5) * 200}%`,
                  y: `${50 + (Math.random() - 0.5) * 200}%`,
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
      <div className="flex items-start gap-3">
        <ButtonPress>
          <Button
            ref={checkboxRef}
            variant="outline"
            size="icon"
            className={cn(
              "mt-0.5 flex-shrink-0 h-5 w-5 rounded-full border-2 p-0 flex items-center justify-center transition-all duration-300",
              task.completed 
                ? "bg-gradient-to-r from-amber-400 to-yellow-400 border-amber-400 shadow-lg shadow-amber-400/30" 
                : "border-primary hover:bg-primary/10 hover:border-amber-400/50",
              isCompleting && "animate-pulse shadow-lg shadow-amber-400/50"
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleComplete();
            }}
          >
            <AnimatePresence mode="wait">
              {task.completed && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ 
                    duration: 0.4,
                    type: "spring", 
                    stiffness: 200,
                    damping: 15
                  }}
                >
                  <Check className="h-3 w-3 text-white font-bold" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </ButtonPress>
        
        <div className="flex-1 relative">
          <div className="flex items-start justify-between">
            <div>
              <motion.h3 
                className={cn(
                  "font-medium transition-all duration-300 text-foreground",
                  task.completed && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </motion.h3>
              <div className="flex items-center mt-1 text-muted-foreground text-sm space-x-2">
                <span className={cn("px-2 py-0.5 rounded-full text-xs", getCategoryColor())}>
                  {task.category}
                </span>
                <span className={cn("flex items-center", getPriorityColor())}>
                  {getPriorityIcon()}
                  <span>{task.priority}</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {/* UP/DOWN ARROWS - Like Microsoft To Do, Todoist, etc. */}
              <div className="flex flex-col space-y-0.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 hover:bg-primary/10"
                  title="Move task up"
                  onClick={async (e) => {
                    e.stopPropagation();
                    // Move this task up by swapping with previous task
                    const currentIndex = tasks?.findIndex(t => t.id === task.id) ?? -1;
                    if (currentIndex > 0 && tasks) {
                      const newOrder = [...tasks];
                      [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
                      // Update display order
                      const reorderedTasks = newOrder.map((t, i) => ({ ...t, displayOrder: i }));
                      await reorderTasks(reorderedTasks);
                    }
                  }}
                >
                  <ChevronUp className="h-3 w-3 text-muted-foreground hover:text-primary" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 hover:bg-primary/10"
                  title="Move task down"
                  onClick={async (e) => {
                    e.stopPropagation();
                    // Move this task down by swapping with next task
                    const currentIndex = tasks?.findIndex(t => t.id === task.id) ?? -1;
                    if (currentIndex >= 0 && currentIndex < (tasks?.length ?? 0) - 1 && tasks) {
                      const newOrder = [...tasks];
                      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
                      // Update display order
                      const reorderedTasks = newOrder.map((t, i) => ({ ...t, displayOrder: i }));
                      await reorderTasks(reorderedTasks);
                    }
                  }}
                >
                  <ChevronDown className="h-3 w-3 text-muted-foreground hover:text-primary" />
                </Button>
              </div>
              
              {/* DRAG HANDLE - Clean implementation like the example */}
              {!task.completed && (
                <button
                  className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary p-1 hover:bg-primary/10 rounded transition-colors"
                  title="Drag to reorder"
                  {...attributes}
                  {...listeners}
                >
                  <GripVertical className="h-4 w-4" />
                </button>
              )}
              
              <ShareTaskPopup 
                taskId={task.id}
                taskTitle={task.title}
                taskCategory={task.category}
                taskPriority={task.priority}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Share task"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </ShareTaskPopup>
              
              {/* Send to Notion Button - Only show when Notion is connected */}
              {notionStatus?.connected && (
                <HoverScale>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 transition-all duration-200",
                      task.syncedToNotion
                        ? "bg-emerald-500/20 border border-emerald-500 text-emerald-600"
                        : "hover:bg-primary/10"
                    )}
                    aria-label={task.syncedToNotion ? "Already synced to Notion" : "Send to Notion"}
                    title={task.syncedToNotion ? "Synced to Notion" : "Send to Notion"}
                    disabled={sendToNotionMutation.isPending || task.syncedToNotion}
                    data-testid={`button-send-to-notion-${task.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!task.syncedToNotion) {
                        sendToNotionMutation.mutate(task.id);
                      }
                    }}
                  >
                    {sendToNotionMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : task.syncedToNotion ? (
                      <div className="relative">
                        <SiNotion className="h-4 w-4 text-emerald-600" />
                        <Check className="h-2 w-2 absolute -bottom-0.5 -right-0.5 text-emerald-600" />
                      </div>
                    ) : (
                      <SiNotion className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </HoverScale>
              )}
              
              {/* Send to Trello Button - Only show when Trello is connected */}
              {trelloStatus?.connected && (
                <HoverScale>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 transition-all duration-200",
                      task.syncedToTrello
                        ? "bg-emerald-500/20 border border-emerald-500 text-emerald-600"
                        : "hover:bg-primary/10"
                    )}
                    aria-label={task.syncedToTrello ? "Already synced to Trello" : "Send to Trello"}
                    title={task.syncedToTrello ? "Synced to Trello" : "Send to Trello"}
                    disabled={sendToTrelloMutation.isPending || task.syncedToTrello}
                    data-testid={`button-send-to-trello-${task.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!task.syncedToTrello) {
                        sendToTrelloMutation.mutate(task.id);
                      }
                    }}
                  >
                    {sendToTrelloMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : task.syncedToTrello ? (
                      <div className="relative">
                        <SiTrello className="h-4 w-4 text-emerald-600" />
                        <Check className="h-2 w-2 absolute -bottom-0.5 -right-0.5 text-emerald-600" />
                      </div>
                    ) : (
                      <SiTrello className="h-4 w-4" style={{ color: '#0079BF' }} />
                    )}
                  </Button>
                </HoverScale>
              )}
              
              <HoverScale>
                <div onClick={(e) => e.stopPropagation()}>
                  <ChecklistDialog task={{...task}}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 transition-all duration-200",
                        hasChecklist 
                          ? "bg-orange-400/20 border border-orange-400 text-orange-600 hover:bg-orange-500 hover:text-white"
                          : "bg-green-500/20 border border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                      )}
                      aria-label="Manage checklist"
                      title="Checklists"
                    >
                      <ListChecks className="h-4 w-4" />
                    </Button>
                  </ChecklistDialog>
                </div>
              </HoverScale>
              
              <HoverScale>
                <div onClick={(e) => e.stopPropagation()}>
                  <EditTaskDialog task={{...task}} />
                </div>
              </HoverScale>
              
              <ButtonPress>
                <HoverScale>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    aria-label="Delete task"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                  >
                    <Trash className="h-4 w-4 text-muted-foreground transition-colors hover:text-red-500" />
                  </Button>
                </HoverScale>
              </ButtonPress>
              
              {/* Archive Button - Only show for completed tasks */}
              <ArchiveButton task={task} />
            </div>
          </div>
          
          {/* Timer Section - Original Bar Design (Subtle Version) */}
          {(showTimer || hasValidTimer) && (
            <motion.div 
              className="mt-2 p-2 border border-border/50 rounded-md bg-background/30"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="text-primary h-3 w-3" />
                  <span className="text-xs font-medium text-foreground">
                    {showTimer ? `${formatTime(timeRemaining)} remaining` : `${timerValue} minute timer`}
                  </span>
                  {showTimer && (
                    <span className="text-xs text-muted-foreground">
                      • {task.title}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  {showTimer ? (
                    <>
                      {isActive && !isPaused ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            pauseTimer();
                            // Sync with MainTimer - pass current time remaining
                            if (onPauseTimer) {
                              onPauseTimer(task, timeRemaining);
                            }
                          }}
                        >
                          <Pause className="h-3 w-3 text-primary" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            startTimer();
                            // Sync with MainTimer - use resume if paused, start if new
                            if (isPaused && onResumeTimer) {
                              onResumeTimer(task, timeRemaining);
                            } else if (onStartTimer) {
                              onStartTimer(task);
                            }
                          }}
                        >
                          <Play className="h-3 w-3 text-primary" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          stopTimer();
                          setShowTimer(false);
                          setTimerRunning(false); // Mark timer as not running
                          // Sync with MainTimer
                          if (onStopTimer) {
                            onStopTimer(task);
                          }
                        }}
                      >
                        <Square className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        
                        // Ensure timer is properly reset before starting
                        if (timeRemaining <= 0 || timeRemaining !== stableTimerDuration) {
                          resetTimer();
                        }
                        
                        // Mark timer as running to prevent resets
                        setTimerRunning(true);
                        setShowTimer(true);
                        
                        // Start timer with small delay for state readiness
                        setTimeout(() => {
                          startTimer();
                        }, 50);
                        
                        // Sync with MainTimer
                        if (onStartTimer && timerValue > 0) {
                          onStartTimer({
                            ...task,
                            timer: timerValue
                          });
                        }
                      }}
                    >
                      Start
                    </Button>
                  )}
                </div>
              </div>
              {showTimer && (
                <div className="mt-1">
                  <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-1000 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
          
          {task.youtubeUrl && (
            <motion.div 
              className="mt-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <YouTubeVideoThumbnail 
                url={task.youtubeUrl} 
                className="rounded-md overflow-hidden"
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default TaskItem;
