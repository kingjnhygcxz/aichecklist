import { useState, useEffect, useRef } from "react";
import { playAlarmSound } from "@/lib/audio";

// Use centralized alarm system - no more duplicate sound mappings

interface UseTimerOptions {
  initialSeconds?: number;
  alarmSound?: string;
  alarmEnabled?: boolean;
  taskId?: string; // Add taskId for unique timer persistence
}

export function useTimer({
  initialSeconds = 1500, // Default to 25 minutes
  alarmSound: propAlarmSound,
  alarmEnabled: propAlarmEnabled,
  taskId
}: UseTimerOptions = {}) {
  // Use the props directly - TaskItem now provides the correct alarm preferences
  const alarmSound = propAlarmSound || "Gentle Bell";
  const alarmEnabled = propAlarmEnabled !== undefined ? propAlarmEnabled : true;
  // Make sure the initial time is at least 1 second to prevent immediate completion
  const safeInitialSeconds = Math.max(1, initialSeconds);
  
  // Load saved timer state on mount if exists
  const loadInitialState = () => {
    if (!taskId) return { timeRemaining: safeInitialSeconds, isActive: false, isPaused: false };
    
    try {
      const key = `timer_${taskId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const state = JSON.parse(saved);
        // Only restore if timer was saved recently (within last 5 minutes)
        if (state.lastSaved && Date.now() - state.lastSaved < 5 * 60 * 1000) {
          return {
            timeRemaining: state.timeRemaining || safeInitialSeconds,
            isActive: state.isActive || false,
            isPaused: state.isPaused || false
          };
        }
      }
    } catch (e) {
      // Ignore errors and use defaults
    }
    return { timeRemaining: safeInitialSeconds, isActive: false, isPaused: false };
  };
  
  const initialState = loadInitialState();
  const [timeRemaining, setTimeRemaining] = useState(initialState.timeRemaining);
  const [isActive, setIsActive] = useState(initialState.isActive);
  const [isPaused, setIsPaused] = useState(initialState.isPaused);
  const [progress, setProgress] = useState((initialState.timeRemaining / safeInitialSeconds) * 100);
  const initialTimeRef = useRef(safeInitialSeconds);
  const timerRef = useRef<number | null>(null);
  const lastActionTimeRef = useRef<number>(0);
  const isInitializedRef = useRef(false);
  
  // Enhanced persistence - save state continuously while timer is active
  useEffect(() => {
    if (!taskId) return;
    const key = `timer_${taskId}`;
    
    // Save state whenever timer is active or paused
    if (isActive || isPaused) {
      const state = {
        timeRemaining,
        isActive,
        isPaused,
        lastSaved: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(state));
    } else if (timeRemaining === 0 || timeRemaining === initialTimeRef.current) {
      // Clear when timer completes or resets
      localStorage.removeItem(key);
    }
  }, [isActive, isPaused, timeRemaining, taskId]); // Watch all state changes for persistence

  // Effect to handle timer changes when props change
  useEffect(() => {
    // Skip updates if timer is active - prevents interruptions
    if (isActive || isPaused) return;
    
    const safeInitialTime = Math.max(1, initialSeconds);
    
    // Only update on significant changes
    if (Math.abs(initialTimeRef.current - safeInitialTime) > 1) {
      setTimeRemaining(safeInitialTime);
      initialTimeRef.current = safeInitialTime;
      setProgress(100);
      setIsActive(false);
      setIsPaused(false);
      
      // Cleanup existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [initialSeconds]);

  // Store alarm settings in refs to avoid timer restarts
  const alarmEnabledRef = useRef(alarmEnabled);
  const alarmSoundRef = useRef(alarmSound);
  
  // Update refs when alarm settings change
  useEffect(() => {
    alarmEnabledRef.current = alarmEnabled;
    alarmSoundRef.current = alarmSound;
  }, [alarmEnabled, alarmSound]);

  // Page visibility handling for background tab operation
  const lastVisibilityTimeRef = useRef<number>(Date.now());
  const isHiddenRef = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      const isHidden = document.hidden;
      
      console.log(`[TIMER DEBUG] Visibility changed: ${isHidden ? 'HIDDEN' : 'VISIBLE'}, active: ${isActive}, paused: ${isPaused}`);
      
      if (!isActive || isPaused) return;

      if (isHidden) {
        // Page is becoming hidden
        isHiddenRef.current = true;
        lastVisibilityTimeRef.current = now;
        console.log(`[TIMER DEBUG] Tab hidden - storing time: ${now}`);
      } else {
        // Page is becoming visible - calculate elapsed time
        isHiddenRef.current = false;
        
        if (lastVisibilityTimeRef.current > 0) {
          const elapsedWhileHidden = Math.floor((now - lastVisibilityTimeRef.current) / 1000);
          
          console.log(`[TIMER DEBUG] Tab visible - elapsed while hidden: ${elapsedWhileHidden}s`);
          
          if (elapsedWhileHidden > 0) {
            setTimeRemaining((prev: number) => {
              const newTime = Math.max(0, prev - elapsedWhileHidden);
              console.log(`[TIMER DEBUG] Updating time: ${prev} -> ${newTime}`);
              
              if (newTime <= 0 && prev > 0) {
                setIsActive(false);
                setIsPaused(false);
                
                // Play alarm if enabled using centralized system
                console.log(`[TIMER DEBUG] ⏰ Timer completed while tab was hidden! Alarm check:`);
                console.log(`[TIMER DEBUG] - alarmEnabled: ${alarmEnabledRef.current}`);
                console.log(`[TIMER DEBUG] - alarmSound: "${alarmSoundRef.current}"`);
                
                if (alarmEnabledRef.current && alarmSoundRef.current) {
                  console.log(`[TIMER DEBUG] 🔔 Hidden timer completed - playing alarm: "${alarmSoundRef.current}"`);
                  playAlarmSound(alarmSoundRef.current, false);
                } else {
                  console.warn(`[TIMER DEBUG] ❌ Hidden alarm not played - enabled: ${alarmEnabledRef.current}, sound: "${alarmSoundRef.current}"`);
                }
                console.log('Task timer completed while tab was hidden');
                return 0;
              }
              
              return newTime;
            });
          }
        }
        lastVisibilityTimeRef.current = now;
      }
    };

    console.log(`[TIMER DEBUG] Adding visibility listener, active: ${isActive}, paused: ${isPaused}`);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      console.log(`[TIMER DEBUG] Removing visibility listener`);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, isPaused]);

  useEffect(() => {
    // Always clear any existing interval first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (isActive && !isPaused && timeRemaining > 0) {
      lastVisibilityTimeRef.current = Date.now();
      
      timerRef.current = window.setInterval(() => {
        // Only tick when page is visible for accuracy
        if (!isHiddenRef.current) {
          setTimeRemaining((prevTime: number) => {
            if (prevTime <= 1) {
              // Timer complete - cleanup immediately
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              setIsActive(false);
              setIsPaused(false);
              
              // Play alarm if enabled
              if (alarmEnabledRef.current && alarmSoundRef.current) {
                playAlarmSound(alarmSoundRef.current, false);
              }
              
              // Clear timer state from localStorage when complete
              const key = taskId ? `timer_${taskId}` : 'timer_global';
              localStorage.removeItem(key);
              
              return 0;
            }
            return prevTime - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, isPaused]);

  useEffect(() => {
    // Calculate and update progress percentage
    const progressValue = (timeRemaining / initialTimeRef.current) * 100;
    setProgress(progressValue);
  }, [timeRemaining]);

  const startTimer = () => {
    const now = Date.now();
    // Prevent rapid consecutive actions (debounce)
    if (now - lastActionTimeRef.current < 200) return;
    lastActionTimeRef.current = now;
    
    // Re-read alarm preferences on start to ensure they're current
    if (propAlarmSound) {
      alarmSoundRef.current = propAlarmSound;
    }
    if (propAlarmEnabled !== undefined) {
      alarmEnabledRef.current = propAlarmEnabled;
    }
    
    if (timeRemaining <= 0) {
      resetTimer();
      // After reset, start the timer
      setTimeout(() => {
        setIsActive(true);
        setIsPaused(false);
      }, 50);
      return;
    }
    
    setIsActive(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < 200) return;
    lastActionTimeRef.current = now;
    setIsPaused(true);
  };

  const stopTimer = () => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < 200) return;
    lastActionTimeRef.current = now;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsActive(false);
    setIsPaused(false);
  };

  const resetTimer = () => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < 200) return;
    lastActionTimeRef.current = now;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeRemaining(initialTimeRef.current);
    setIsActive(false);
    setIsPaused(false);
    setProgress(100);
    
    // Re-read alarm preferences on reset
    if (propAlarmSound) {
      alarmSoundRef.current = propAlarmSound;
    }
    if (propAlarmEnabled !== undefined) {
      alarmEnabledRef.current = propAlarmEnabled;
    }
    
    // Clear saved timer state
    const key = taskId ? `timer_${taskId}` : 'timer_global';
    localStorage.removeItem(key);
  };

  const setDuration = (seconds: number) => {
    initialTimeRef.current = seconds;
    setTimeRemaining(seconds);
    setProgress(100);
  };

  return {
    timeRemaining,
    progress,
    isActive,
    isPaused,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    setDuration,
  };
}
