import { useState, useEffect, useRef, useCallback } from 'react';

const TASK_TIMER_STATE_KEY = 'globalTaskTimerState';

interface TaskTimerState {
  id: string;
  title: string;
  timer: number;
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;
  progress: number;
  lastUpdated: number;
}

export function useGlobalTaskTimer() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load initial state from localStorage
  const loadState = (): TaskTimerState | null => {
    try {
      const saved = localStorage.getItem(TASK_TIMER_STATE_KEY);
      if (saved) {
        const state = JSON.parse(saved) as TaskTimerState;
        const now = Date.now();
        const elapsed = Math.floor((now - state.lastUpdated) / 1000);
        const twoHoursInSeconds = 2 * 60 * 60; // 2 hours
        
        // Check if paused for more than 2 hours
        if (state.isPaused && elapsed > twoHoursInSeconds) {
          console.log('[GlobalTaskTimer] Timer was paused for over 2 hours, keeping it paused but ready to resume');
          // Keep the timer paused but ready to be resumed
          state.isActive = false;
          state.isPaused = true;
          // Don't adjust time remaining - keep it where it was when paused
        } else if (state.isActive && !state.isPaused && elapsed > 0) {
          // If timer was active, adjust for elapsed time
          state.timeRemaining = Math.max(0, state.timeRemaining - elapsed);
          state.progress = ((state.timer * 60 - state.timeRemaining) / (state.timer * 60)) * 100;
          
          // If timer completed while tab was away, mark as inactive
          if (state.timeRemaining <= 0) {
            state.isActive = false;
            state.progress = 100;
          }
        }
        
        return state;
      }
    } catch (error) {
      console.error('Failed to load task timer state:', error);
    }
    return null;
  };
  
  const [timerState, setTimerState] = useState<TaskTimerState | null>(loadState);
  
  // Save state to localStorage whenever it changes
  const saveState = useCallback((state: TaskTimerState | null) => {
    try {
      if (state) {
        localStorage.setItem(TASK_TIMER_STATE_KEY, JSON.stringify({
          ...state,
          lastUpdated: Date.now()
        }));
      } else {
        localStorage.removeItem(TASK_TIMER_STATE_KEY);
      }
    } catch (error) {
      console.error('Failed to save task timer state:', error);
    }
  }, []);
  
  // Save state whenever it changes
  useEffect(() => {
    saveState(timerState);
  }, [timerState, saveState]);
  
  // Start or resume timer
  const startTimer = useCallback((task?: {
    id: string;
    title: string;
    timer: number;
  }) => {
    // If task provided, initialize new timer
    if (task) {
      const newState: TaskTimerState = {
        id: task.id,
        title: task.title,
        timer: task.timer,
        timeRemaining: task.timer * 60,
        isActive: true,
        isPaused: false,
        progress: 0,
        lastUpdated: Date.now()
      };
      setTimerState(newState);
      console.log('[GlobalTaskTimer] Started new timer for task:', task.title);
    } else if (timerState) {
      // Resume existing timer (even after 2+ hour pause)
      console.log('[GlobalTaskTimer] Resuming timer after pause:', timerState.title, 'Time remaining:', timerState.timeRemaining);
      setTimerState(prev => prev ? {
        ...prev,
        isActive: true,
        isPaused: false,
        lastUpdated: Date.now()
      } : null);
    }
  }, [timerState]);
  
  // Pause timer
  const pauseTimer = useCallback(() => {
    setTimerState(prev => prev ? {
      ...prev,
      isActive: false,
      isPaused: true,
      lastUpdated: Date.now()
    } : null);
  }, []);
  
  // Stop timer
  const stopTimer = useCallback(() => {
    setTimerState(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  // Reset timer
  const resetTimer = useCallback(() => {
    setTimerState(prev => prev ? {
      ...prev,
      timeRemaining: prev.timer * 60,
      progress: 0,
      isActive: false,
      isPaused: false,
      lastUpdated: Date.now()
    } : null);
  }, []);
  
  // Timer countdown effect - BULLETPROOF VERSION
  useEffect(() => {
    if (timerState?.isActive && !timerState.isPaused) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => {
          if (!prev || !prev.isActive || prev.isPaused) return prev;
          
          const newTimeRemaining = Math.max(0, prev.timeRemaining - 1);
          const newProgress = ((prev.timer * 60 - newTimeRemaining) / (prev.timer * 60)) * 100;
          
          if (newTimeRemaining <= 0) {
            // Timer completed - handle completion in global store
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return {
              ...prev,
              timeRemaining: 0,
              progress: 100,
              isActive: false,
              lastUpdated: Date.now()
            };
          }
          
          return {
            ...prev,
            timeRemaining: newTimeRemaining,
            progress: newProgress,
            lastUpdated: Date.now()
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    // BULLETPROOF CLEANUP - only clear interval, DON'T call stopTimer()
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        // ❌ DON'T call stopTimer() here - that kills timer state on tab switch
      }
    };
  }, [timerState?.isActive, timerState?.isPaused]);
  
  // Load state on mount and handle tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible, reload state
        const state = loadState();
        if (state) {
          setTimerState(state);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also sync on storage events (for multi-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TASK_TIMER_STATE_KEY) {
        const state = loadState();
        setTimerState(state);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return {
    timerState,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer
  };
}