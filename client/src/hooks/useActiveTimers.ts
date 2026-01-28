import { useState, useEffect, useCallback, useRef } from "react";
import { Task } from "@/types";

interface ActiveTimer {
  taskId: string;
  taskTitle: string;
  duration: number;
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;
  progress: number;
  category: string;
  startTime?: number;
  pausedTime?: number;
}

export function useActiveTimers() {
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Update timers every second
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveTimers(prevTimers => {
        const updatedTimers = prevTimers.map(timer => {
          if (timer.isActive && !timer.isPaused) {
            const newTimeRemaining = Math.max(0, timer.timeRemaining - 1);
            const progress = ((timer.duration - newTimeRemaining) / timer.duration) * 100;
            
            return {
              ...timer,
              timeRemaining: newTimeRemaining,
              progress: Math.min(100, Math.max(0, progress))
            };
          }
          return timer;
        });

        // Remove completed timers after a delay
        return updatedTimers.filter(timer => 
          timer.timeRemaining > 0 || timer.isPaused || !timer.isActive
        );
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const addTimer = useCallback((task: Task) => {
    if (!task.timer || task.timer <= 0) return;

    const newTimer: ActiveTimer = {
      taskId: task.id,
      taskTitle: task.title,
      duration: task.timer * 60, // Convert minutes to seconds
      timeRemaining: task.timer * 60,
      isActive: false,
      isPaused: false,
      progress: 0,
      category: task.category || 'Other'
    };

    setActiveTimers(prev => {
      // Remove existing timer for this task if it exists
      const filtered = prev.filter(t => t.taskId !== task.id);
      return [...filtered, newTimer];
    });
  }, []);

  const startTimer = useCallback((taskId: string) => {
    setActiveTimers(prev => 
      prev.map(timer => 
        timer.taskId === taskId 
          ? { ...timer, isActive: true, isPaused: false, startTime: Date.now() }
          : timer
      )
    );
  }, []);

  const pauseTimer = useCallback((taskId: string) => {
    setActiveTimers(prev => 
      prev.map(timer => 
        timer.taskId === taskId 
          ? { ...timer, isPaused: true, pausedTime: Date.now() }
          : timer
      )
    );
  }, []);

  const stopTimer = useCallback((taskId: string) => {
    setActiveTimers(prev => 
      prev.filter(timer => timer.taskId !== taskId)
    );
  }, []);

  const resetTimer = useCallback((taskId: string) => {
    setActiveTimers(prev => 
      prev.map(timer => 
        timer.taskId === taskId 
          ? { 
              ...timer, 
              timeRemaining: timer.duration,
              progress: 0,
              isActive: false,
              isPaused: false
            }
          : timer
      )
    );
  }, []);

  const getTimer = useCallback((taskId: string) => {
    return activeTimers.find(timer => timer.taskId === taskId);
  }, [activeTimers]);

  const hasActiveTimer = useCallback((taskId: string) => {
    const timer = getTimer(taskId);
    return timer && (timer.isActive || timer.isPaused);
  }, [getTimer]);

  return {
    activeTimers,
    addTimer,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    getTimer,
    hasActiveTimer
  };
}