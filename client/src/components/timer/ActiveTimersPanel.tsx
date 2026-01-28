import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  Timer,
  Eye,
  EyeOff
} from "lucide-react";
import { Task } from "@/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTabletContext } from "@/context/TabletContext";

interface ActiveTimer {
  taskId: string;
  taskTitle: string;
  duration: number;
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;
  progress: number;
  category: string;
}

interface ActiveTimersPanelProps {
  tasks: Task[];
  onTimerAction: (taskId: string, action: 'start' | 'pause' | 'stop' | 'reset') => void;
  activeTimers: ActiveTimer[];
}

export function ActiveTimersPanel({ tasks, onTimerAction, activeTimers }: ActiveTimersPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const { isTablet, touchDevice } = useTabletContext();

  const runningTimers = activeTimers.filter(timer => timer.isActive && !timer.isPaused);
  const pausedTimers = activeTimers.filter(timer => timer.isPaused);
  const hasActiveTimers = activeTimers.length > 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Work': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Personal': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Health': 'bg-red-500/20 text-red-300 border-red-500/30',
      'Shopping': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'Business': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Other': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    };
    return colors[category] || colors['Other'];
  };

  if (!hasActiveTimers && isVisible) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed top-20 right-4 z-50 w-80",
        !isVisible && "pointer-events-none",
        isTablet && "tablet-fixed-panel"
      )}
    >
      <Card className={cn(
        "bg-card/95 backdrop-blur-sm border border-border shadow-lg",
        isTablet && "tablet-card"
      )}>
        <CardContent className={cn(
          "p-4",
          isTablet && "tablet-active-timers"
        )}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">
                Active Timers ({activeTimers.length})
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6",
                  isTablet && "tablet-touch-target"
                )}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6",
                  isTablet && "tablet-touch-target"
                )}
                onClick={() => setIsVisible(false)}
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <ScrollArea className="max-h-60">
                  <div className="space-y-3">
                    {runningTimers.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-green-400 mb-2 flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          Running ({runningTimers.length})
                        </div>
                        {runningTimers.map((timer) => (
                          <TimerCard 
                            key={timer.taskId} 
                            timer={timer} 
                            onAction={onTimerAction}
                            getCategoryColor={getCategoryColor}
                            formatTime={formatTime}
                          />
                        ))}
                      </div>
                    )}

                    {pausedTimers.length > 0 && (
                      <>
                        {runningTimers.length > 0 && <Separator />}
                        <div>
                          <div className="text-xs font-medium text-yellow-400 mb-2 flex items-center gap-1">
                            <Pause className="h-3 w-3" />
                            Paused ({pausedTimers.length})
                          </div>
                          {pausedTimers.map((timer) => (
                            <TimerCard 
                              key={timer.taskId} 
                              timer={timer} 
                              onAction={onTimerAction}
                              getCategoryColor={getCategoryColor}
                              formatTime={formatTime}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Minimized view toggle */}
      {!isVisible && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed top-20 right-4 z-50"
        >
          <Button
            variant="default"
            size="icon"
            className="h-10 w-10 rounded-full bg-primary hover:bg-primary/80"
            onClick={() => setIsVisible(true)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

interface TimerCardProps {
  timer: ActiveTimer;
  onAction: (taskId: string, action: 'start' | 'pause' | 'stop' | 'reset') => void;
  getCategoryColor: (category: string) => string;
  formatTime: (seconds: number) => string;
}

function TimerCard({ timer, onAction, getCategoryColor, formatTime }: TimerCardProps) {
  const { isTablet } = useTabletContext();
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "bg-background/50 border border-border rounded-md p-3 space-y-2",
        isTablet && "tablet-card"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {timer.taskTitle}
          </p>
          <Badge 
            variant="outline" 
            className={cn("text-xs", getCategoryColor(timer.category))}
          >
            {timer.category}
          </Badge>
        </div>
        <div className="text-lg font-mono text-primary">
          {formatTime(timer.timeRemaining)}
        </div>
      </div>

      <Progress 
        value={timer.progress} 
        className="h-1.5 bg-muted"
      />

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {Math.round(timer.progress)}% complete
        </div>
        
        <div className="flex items-center gap-1">
          {timer.isActive && !timer.isPaused ? (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6",
                isTablet && "tablet-touch-target min-h-[44px] min-w-[44px]"
              )}
              onClick={() => onAction(timer.taskId, 'pause')}
            >
              <Pause className="h-3 w-3" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6",
                isTablet && "tablet-touch-target min-h-[44px] min-w-[44px]"
              )}
              onClick={() => onAction(timer.taskId, 'start')}
            >
              <Play className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6",
              isTablet && "tablet-touch-target min-h-[44px] min-w-[44px]"
            )}
            onClick={() => onAction(timer.taskId, 'stop')}
          >
            <Square className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6",
              isTablet && "tablet-touch-target min-h-[44px] min-w-[44px]"
            )}
            onClick={() => onAction(timer.taskId, 'reset')}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}