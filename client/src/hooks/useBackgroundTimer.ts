import { useState, useEffect, useRef, useCallback } from 'react';

interface UseBackgroundTimerOptions {
  initialSeconds?: number;
  alarmSound?: string;
  alarmEnabled?: boolean;
}

export function useBackgroundTimer({
  initialSeconds = 300,
  alarmSound = "Gentle Bell",
  alarmEnabled = true
}: UseBackgroundTimerOptions = {}) {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  
  const initialTimeRef = useRef(initialSeconds);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const lastVisibilityTimeRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isHiddenRef = useRef(false);

  // Update refs when props change
  useEffect(() => {
    initialTimeRef.current = initialSeconds;
    setTimeRemaining(initialSeconds);
    setProgress(100);
  }, [initialSeconds]);

  // Handle page visibility changes
  const handleVisibilityChange = useCallback(() => {
    const now = Date.now();
    const isHidden = document.hidden;
    
    if (!isActive || isPaused) return;

    if (isHidden) {
      // Page is becoming hidden - store current time
      isHiddenRef.current = true;
      lastVisibilityTimeRef.current = now;
    } else {
      // Page is becoming visible - calculate elapsed time
      isHiddenRef.current = false;
      
      if (lastVisibilityTimeRef.current > 0) {
        const elapsedWhileHidden = Math.floor((now - lastVisibilityTimeRef.current) / 1000);
        
        if (elapsedWhileHidden > 0) {
          setTimeRemaining(prev => {
            const newTime = Math.max(0, prev - elapsedWhileHidden);
            
            // Check if timer completed while hidden
            if (newTime <= 0 && prev > 0) {
              setIsActive(false);
              setIsPaused(false);
              // Play alarm if enabled
              if (alarmEnabled && alarmSound) {
                console.log('Timer completed while tab was hidden');
                // Here you would play the alarm sound
              }
              return 0;
            }
            
            return newTime;
          });
        }
      }
      lastVisibilityTimeRef.current = now;
    }
  }, [isActive, isPaused, alarmEnabled, alarmSound]);

  // Setup visibility change listener
  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  // Main timer effect
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isActive && !isPaused && timeRemaining > 0) {
      startTimeRef.current = Date.now() - (initialTimeRef.current - timeRemaining) * 1000;
      
      intervalRef.current = setInterval(() => {
        if (!isHiddenRef.current) {
          // Only update when page is visible
          setTimeRemaining(prev => {
            if (prev <= 1) {
              setIsActive(false);
              setIsPaused(false);
              
              // Play alarm if enabled
              if (alarmEnabled && alarmSound) {
                console.log(`Timer completed. Playing alarm: ${alarmSound}`);
                // Here you would play the alarm sound
              }
              
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isPaused, timeRemaining, alarmEnabled, alarmSound]);

  // Update progress
  useEffect(() => {
    const progressValue = (timeRemaining / initialTimeRef.current) * 100;
    setProgress(Math.max(0, progressValue));
  }, [timeRemaining]);

  const startTimer = () => {
    if (timeRemaining <= 0) {
      resetTimer();
      return;
    }
    setIsActive(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    lastVisibilityTimeRef.current = Date.now();
  };

  const pauseTimer = () => {
    setIsPaused(true);
    pausedTimeRef.current = Date.now();
  };

  const resumeTimer = () => {
    setIsPaused(false);
    const now = Date.now();
    if (pausedTimeRef.current > 0) {
      const pausedDuration = now - pausedTimeRef.current;
      startTimeRef.current += pausedDuration;
    }
    lastVisibilityTimeRef.current = now;
  };

  const stopTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTimeRemaining(initialTimeRef.current);
    setProgress(100);
    startTimeRef.current = 0;
    pausedTimeRef.current = 0;
  };

  const setDuration = (seconds: number) => {
    const safeDuration = Math.max(1, seconds);
    initialTimeRef.current = safeDuration;
    setTimeRemaining(safeDuration);
    setProgress(100);
    
    if (isActive) {
      stopTimer();
    }
  };

  return {
    timeRemaining,
    isActive,
    isPaused,
    progress,
    startTimer,
    pauseTimer: isPaused ? resumeTimer : pauseTimer,
    stopTimer,
    resetTimer,
    setDuration
  };
}