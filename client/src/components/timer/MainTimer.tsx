import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Play, Pause, RotateCcw, Timer, Focus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlarmSettings } from './AlarmSettings';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTabletContext } from '@/context/TabletContext';
import { playAlarmSound } from '@/lib/audio';
import { cn } from '@/lib/utils';
import '@/styles/focus-timer.css';

interface MainTimerProps {
  activeTask?: { 
    id: string; 
    title: string; 
    timer: number;
    timeRemaining: number;
    isActive: boolean;
    isPaused: boolean;
    progress: number;
    startTimer: () => void;
    pauseTimer: () => void;
    stopTimer: () => void;
    resetTimer: () => void;
  };
  onTimerComplete?: () => void;
  alarmSound?: string;
  onAlarmSoundChange?: (sound: string) => void;
  alarmEnabled?: boolean;
  onAlarmToggle?: (enabled: boolean) => void;
}

// Timer state persistence key
const TIMER_STATE_KEY = 'mainTimer_focusState';

export default function MainTimer({ 
  activeTask, 
  onTimerComplete, 
  alarmSound = "Gentle Bell",
  onAlarmSoundChange,
  alarmEnabled = true,
  onAlarmToggle
}: MainTimerProps) {
  // Use comprehensive user preferences system and tablet detection
  const { preferences, updateTimerPreferences, updateAlarmPreferences, isInitialized } = useUserPreferences();
  const { isTablet, touchDevice } = useTabletContext();
  // Load persistent state from localStorage
  const loadTimerState = () => {
    try {
      const saved = localStorage.getItem(TIMER_STATE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        const now = Date.now();
        const elapsed = Math.floor((now - state.lastSaved) / 1000);
        
        // If timer was active, calculate elapsed time
        if (state.isFocusActive && !state.isFocusPaused && elapsed > 0) {
          const newTime = Math.max(0, state.focusTimeRemaining - elapsed);
          return {
            ...state,
            focusTimeRemaining: newTime,
            isFocusActive: newTime > 0 ? state.isFocusActive : false
          };
        }
        return state;
      }
    } catch (error) {
      console.error('Failed to load timer state:', error);
    }
    return {
      focusMode: true,
      selectedMinutes: 25,
      focusTimeRemaining: 25 * 60,
      isFocusActive: false,
      isFocusPaused: false
    };
  };

  // Focus Timer state - always load from localStorage to maintain persistence
  const [initialState, setInitialState] = useState(() => loadTimerState());
  const [focusMode, setFocusMode] = useState(activeTask ? false : initialState.focusMode);
  const [selectedMinutes, setSelectedMinutes] = useState(initialState.selectedMinutes);
  const [focusTimeRemaining, setFocusTimeRemaining] = useState(initialState.focusTimeRemaining);
  const [isFocusActive, setIsFocusActive] = useState(initialState.isFocusActive);
  const [isFocusPaused, setIsFocusPaused] = useState(initialState.isFocusPaused);
  
  // Load state on component mount only - avoid focus events that trigger during menu navigation
  useEffect(() => {
    // Only load state when component mounts, not on every focus event
    const state = loadTimerState();
    if (state.isFocusActive || state.isFocusPaused) {
      console.log('[MainTimer] Loading persistent timer state:', state);
      setFocusMode(state.focusMode);
      setSelectedMinutes(state.selectedMinutes);
      setFocusTimeRemaining(state.focusTimeRemaining);
      setIsFocusActive(state.isFocusActive);
      setIsFocusPaused(state.isFocusPaused);
    }
  }, []); // Only run once on mount - no window focus handling
  const [isDragging, setIsDragging] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);
  const focusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompletedRef = useRef<boolean>(false); // Flag to prevent duplicate completions

  // Auto-switch to task mode when activeTask is present
  useEffect(() => {
    if (activeTask) {
      // Always sync with active task when it exists
      setFocusMode(false);
      
      // If task has time remaining and is paused, prepare timer to resume
      if (activeTask.timeRemaining > 0 && activeTask.isPaused) {
        console.log('[MainTimer] Task timer is paused, ready to resume:', activeTask.title);
        // Timer state will sync when user clicks play
        // This ensures timer shows on both task countdown AND right-side clock
      }
    }
  }, [activeTask]);

  // Use timer state from active task or focus timer
  const timeRemaining = focusMode ? focusTimeRemaining : (activeTask?.timeRemaining || 0);
  const isActive = focusMode ? isFocusActive : (activeTask?.isActive || false);
  const isPaused = focusMode ? isFocusPaused : (activeTask?.isPaused || false);
  const progress = focusMode ? 
    ((selectedMinutes * 60 - focusTimeRemaining) / (selectedMinutes * 60)) * 100 : 
    (activeTask?.progress || 0);

  // Background-aware timer that works across tab switches
  const startTimeRef = useRef<number>(0);
  const lastVisibilityTimeRef = useRef<number>(Date.now());
  const isHiddenRef = useRef(false);

  // Save timer state to localStorage whenever it changes
  const saveTimerState = useCallback(() => {
    try {
      const state = {
        focusMode,
        selectedMinutes,
        focusTimeRemaining,
        isFocusActive,
        isFocusPaused,
        lastSaved: Date.now()
      };
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save timer state:', error);
    }
  }, [focusMode, selectedMinutes, focusTimeRemaining, isFocusActive, isFocusPaused]);

  // Save state whenever timer values change
  useEffect(() => {
    saveTimerState();
  }, [saveTimerState]);

  // Handle page visibility changes for focus timer
  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      const isHidden = document.hidden;
      

      
      if (!isFocusActive || isFocusPaused) return;

      if (isHidden) {
        // Page is becoming hidden
        isHiddenRef.current = true;
        lastVisibilityTimeRef.current = now;

      } else {
        // Page is becoming visible - calculate elapsed time
        isHiddenRef.current = false;
        
        if (lastVisibilityTimeRef.current > 0) {
          const elapsedWhileHidden = Math.floor((now - lastVisibilityTimeRef.current) / 1000);
          

          
          if (elapsedWhileHidden > 0) {
            setFocusTimeRemaining((prev: number) => {
              const newTime = Math.max(0, prev - elapsedWhileHidden);
              
              if (newTime <= 0 && prev > 0 && !hasCompletedRef.current) {
                // Set completion flag immediately
                hasCompletedRef.current = true;
                
                // Clear interval BEFORE state updates to prevent duplicate completions
                if (focusIntervalRef.current) {
                  clearInterval(focusIntervalRef.current);
                  focusIntervalRef.current = null;
                }
                
                setIsFocusActive(false);
                
                // FIXED: Only play alarm if there was actually a timer running AND user wants alarms
                // Don't play on random tab switches when no timer is active
                if (preferences.timerEnabled && preferences.timerSound && isFocusActive && prev > 30) {
                  // Only play if timer was actually running (isFocusActive) and had substantial time (>30 seconds)
                  playAlarmSound(preferences.timerSound, false);
                }
                
                if (onTimerComplete) onTimerComplete();
                
                // Clear saved state
                localStorage.removeItem(TIMER_STATE_KEY);
                return 0;
              }
              
              return newTime;
            });
          }
        }
        lastVisibilityTimeRef.current = now;
      }
    };


    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {

      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isFocusActive, isFocusPaused, onTimerComplete]);

  // Focus timer functions with proper persistence
  useEffect(() => {
    // Clear any existing interval first
    if (focusIntervalRef.current) {
      clearInterval(focusIntervalRef.current);
      focusIntervalRef.current = null;
    }
    
    if (isFocusActive && !isFocusPaused && focusTimeRemaining > 0) {
      startTimeRef.current = Date.now();
      lastVisibilityTimeRef.current = Date.now();
      
      focusIntervalRef.current = setInterval(() => {
        // Only tick when page is visible to maintain accuracy
        if (!isHiddenRef.current) {
          setFocusTimeRemaining((prev: number) => {
            if (prev <= 1 && !hasCompletedRef.current) {
              // Set completion flag immediately
              hasCompletedRef.current = true;
              
              // Clear interval BEFORE state updates to prevent duplicate completions
              if (focusIntervalRef.current) {
                clearInterval(focusIntervalRef.current);
                focusIntervalRef.current = null;
              }
              
              setIsFocusActive(false);
              
              // FIXED: Only play alarm when timer legitimately completes while user is actively using app
              if (preferences.timerEnabled && preferences.timerSound && !isHiddenRef.current) {
                // Only play if page is visible (user is present) to avoid random sounds on tab focus
                playAlarmSound(preferences.timerSound, false);
              }
              
              if (onTimerComplete) onTimerComplete();
              
              // Clear saved state when timer completes
              localStorage.removeItem(TIMER_STATE_KEY);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    
    return () => {
      if (focusIntervalRef.current) {
        clearInterval(focusIntervalRef.current);
        focusIntervalRef.current = null;
      }
    };
  }, [isFocusActive, isFocusPaused]);
  
  // Additional safeguard: Clear interval when timer becomes inactive
  useEffect(() => {
    if (!isFocusActive && focusIntervalRef.current) {
      clearInterval(focusIntervalRef.current);
      focusIntervalRef.current = null;
    }
  }, [isFocusActive]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDialInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dialRef.current || isFocusActive) return;
    
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const angle = Math.atan2(clientY - centerY, clientX - centerX);
    const degrees = (angle * 180 / Math.PI + 90 + 360) % 360;
    
    // Map degrees to minutes (0-360 degrees to 5-60 minutes)
    const minutes = Math.max(5, Math.min(60, Math.round(degrees / 6)));
    setSelectedMinutes(minutes);
    setFocusTimeRemaining(minutes * 60);
  };

  const handleMainTimerToggle = () => {
    if (focusMode) {
      // Focus Timer behavior
      if (isFocusActive && !isFocusPaused) {
        setIsFocusPaused(true);
        saveTimerState(); // Save immediately
      } else if (isFocusActive && isFocusPaused) {
        setIsFocusPaused(false);
        saveTimerState(); // Save immediately
      } else {
        hasCompletedRef.current = false; // Reset completion flag when starting new timer
        setFocusTimeRemaining(selectedMinutes * 60);
        setIsFocusActive(true);
        setIsFocusPaused(false);
        saveTimerState(); // Save immediately
      }
    } else {
      // Task Timer behavior - control the active task
      if (activeTask) {
        if (activeTask.isActive && !activeTask.isPaused) {
          if (activeTask.pauseTimer) activeTask.pauseTimer();
        } else if (activeTask.isActive && activeTask.isPaused) {
          if (activeTask.startTimer) activeTask.startTimer();
        } else {
          if (activeTask.startTimer) activeTask.startTimer();
        }
      }
    }
  };

  const handleMainTimerReset = () => {
    if (focusMode) {
      // Focus Timer reset - Clear interval FIRST
      if (focusIntervalRef.current) {
        clearInterval(focusIntervalRef.current);
        focusIntervalRef.current = null;
      }
      
      hasCompletedRef.current = false; // Reset completion flag
      setIsFocusActive(false);
      setIsFocusPaused(false);
      setFocusTimeRemaining(selectedMinutes * 60);
      localStorage.removeItem(TIMER_STATE_KEY); // Clear saved state on reset
    } else {
      // Task Timer reset
      if (activeTask && activeTask.resetTimer) {
        activeTask.resetTimer();
      }
    }
  };

  // Show original Focus Timer always - never show task-specific timer in main display
  return (
    <Card className={cn(
      "w-full max-w-full overflow-hidden",
      isTablet && "tablet-card"
    )}>
      <CardContent className={cn(
        "p-6 max-w-full overflow-hidden",
        isTablet && "tablet-timer-container"
      )}>
        <div className={cn(
          "text-center space-y-4 max-w-full overflow-hidden",
          isTablet && "tablet-main-timer"
        )}>
          <div className="flex items-center justify-center gap-2 mb-4">
            {focusMode ? <Focus className="h-5 w-5 text-primary" /> : <Timer className="h-5 w-5 text-primary" />}
            <h3 className="text-lg font-semibold">
              {focusMode ? "Focus Timer" : (activeTask ? `Task Timer: ${activeTask.title}` : "Timer")}
            </h3>
            {/* Toggle button when both modes are available */}
            {(activeTask || !focusMode) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFocusMode(!focusMode)}
                className="ml-auto text-xs"
              >
                {focusMode ? "Task Timer" : "Focus Timer"}
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <div className="space-y-4">
                  <div className={cn(
                    `focus-timer-dial relative mx-auto ${isDragging ? 'dragging' : ''} ${(isFocusActive || (activeTask?.isActive && !focusMode)) ? 'focus-timer-active' : ''}`,
                    isTablet && "tablet-timer-dial"
                  )} style={{ width: '200px', height: '200px' }}>
                    <svg 
                      width="200" 
                      height="200" 
                      className="transform -rotate-90"
                    >
                      {/* Background circle */}
                      <circle
                        cx="100"
                        cy="100"
                        r="90"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-muted-foreground/20"
                      />
                      {/* Progress circle - shows time set when not active, countdown progress when active */}
                      <circle
                        cx="100"
                        cy="100"
                        r="90"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${
                          focusMode 
                            ? (isFocusActive 
                                ? ((focusTimeRemaining / (selectedMinutes * 60)) * 565.48)
                                : ((selectedMinutes / 60) * 565.48))
                            : (activeTask 
                                ? (activeTask.isActive
                                    ? ((activeTask.timeRemaining / (activeTask.timer * 60)) * 565.48)
                                    : ((activeTask.timer / 60) * 565.48))
                                : 0)
                        } 565.48`}
                        className={`${(isFocusActive || activeTask?.isActive) ? 'text-primary' : 'text-primary'} transition-all duration-300`}
                        strokeLinecap="round"
                      />
                      {/* Tick marks for every 5 minutes */}
                      {[...Array(12)].map((_, i) => (
                        <g key={i} transform={`rotate(${i * 30} 100 100)`}>
                          <line
                            x1="100"
                            y1="15"
                            x2="100"
                            y2={i % 3 === 0 ? "30" : "25"}
                            stroke="currentColor"
                            strokeWidth={i % 3 === 0 ? "3" : "2"}
                            className="text-muted-foreground/40"
                          />
                          {i % 3 === 0 && !isFocusActive && (
                            <text
                              x="100"
                              y="45"
                              textAnchor="middle"
                              className="text-xs fill-muted-foreground"
                              transform={`rotate(${-i * 30} 100 45)`}
                            >
                              {i === 0 ? "60" : i * 5}
                            </text>
                          )}
                        </g>
                      ))}
                    </svg>
                    {/* Interactive dial or countdown display */}
                    <div 
                      ref={dialRef}
                      className={cn(
                        `absolute inset-0 ${(focusMode && !isFocusActive) ? 'cursor-pointer' : ''}`,
                        isTablet && (focusMode && !isFocusActive) && "tablet-touch-target"
                      )}
                      onMouseDown={(e) => {
                        if (focusMode && !isFocusActive) {
                          setIsDragging(true);
                          handleDialInteraction(e);
                        }
                      }}
                      onMouseMove={(e) => focusMode && !isFocusActive && isDragging && handleDialInteraction(e)}
                      onMouseUp={() => setIsDragging(false)}
                      onMouseLeave={() => setIsDragging(false)}
                      onTouchStart={(e) => {
                        if (focusMode && !isFocusActive) {
                          e.preventDefault(); // Prevent scroll on touch
                          setIsDragging(true);
                          handleDialInteraction(e);
                        }
                      }}
                      onTouchMove={(e) => {
                        if (focusMode && !isFocusActive && isDragging) {
                          e.preventDefault(); // Prevent scroll during drag
                          handleDialInteraction(e);
                        }
                      }}
                      onTouchEnd={() => setIsDragging(false)}
                    >
                      {/* Center display - shows countdown or setup time */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {focusMode ? (
                          // Focus Timer Display
                          isFocusActive ? (
                            <div className={`text-3xl font-mono font-bold ${
                              focusTimeRemaining <= 60 ? 'text-green-400' : 
                              focusTimeRemaining <= 300 ? 'text-green-500' : 'text-green-600'
                            }`}>
                              {formatTime(focusTimeRemaining)}
                            </div>
                          ) : (
                            <>
                              <div className="text-3xl font-mono font-bold text-primary">
                                {selectedMinutes}
                              </div>
                              <div className="text-sm text-muted-foreground">minutes</div>
                            </>
                          )
                        ) : (
                          // Task Timer Display
                          activeTask ? (
                            <div className={`text-3xl font-mono font-bold ${
                              activeTask.timeRemaining <= 60 ? 'text-green-400' : 
                              activeTask.timeRemaining <= 300 ? 'text-green-500' : 'text-green-600'
                            }`}>
                              {formatTime(activeTask.timeRemaining)}
                            </div>
                          ) : (
                            <div className="text-lg text-muted-foreground text-center">
                              <div>No Task Timer</div>
                              <div className="text-sm">Click a task timer to start</div>
                            </div>
                          )
                        )}
                      </div>
                      {/* Dial handle - only show when in focus mode and not active */}
                      {focusMode && !isFocusActive && (
                        <div 
                          className="focus-timer-handle absolute w-5 h-5 bg-primary rounded-full transition-transform"
                          style={{
                            top: '50%',
                            left: '50%',
                            transform: `translate(-50%, -50%) rotate(${(selectedMinutes / 60) * 360}deg) translateY(-90px)`
                          }}
                        />
                      )}
                    </div>
                  </div>
                  {focusMode ? (
                    // Focus Timer Instructions
                    !isFocusActive ? (
                      <p className="text-xs text-muted-foreground">
                        Drag the dial to set focus time (5-60 minutes)
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground animate-pulse">
                        Focus session in progress...
                      </p>
                    )
                  ) : (
                    // Task Timer Instructions
                    activeTask ? (
                      activeTask.isActive ? (
                        <p className="text-xs text-muted-foreground animate-pulse">
                          Task timer running: {activeTask.title}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Task timer ready: {activeTask.title}
                        </p>
                      )
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Click on any task timer to display it here
                      </p>
                    )
                  )}
                </div>
              
              
              <div className={cn(
                "flex items-center justify-center gap-2 mt-4",
                isTablet && "tablet-timer-controls"
              )}>
                <Button
                  onClick={handleMainTimerToggle}
                  variant={
                    focusMode 
                      ? (isFocusActive && !isFocusPaused ? "destructive" : "default")
                      : (activeTask?.isActive && !activeTask?.isPaused ? "destructive" : "default")
                  }
                  size={isTablet ? "lg" : "sm"}
                  className={cn(
                    isTablet && "tablet-timer-button tablet-touch-target"
                  )}
                >
                  {focusMode 
                    ? (isFocusActive && !isFocusPaused ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />)
                    : (activeTask?.isActive && !activeTask?.isPaused ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />)
                  }
                  {focusMode 
                    ? (isFocusActive && !isFocusPaused ? " Pause" : " Start")
                    : (activeTask?.isActive && !activeTask?.isPaused ? " Pause" : " Start")
                  }
                </Button>
                <Button
                  onClick={handleMainTimerReset}
                  variant="outline"
                  size={isTablet ? "lg" : "sm"}
                  className={cn(
                    isTablet && "tablet-timer-button tablet-touch-target"
                  )}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
              
              {/* Alarm Settings */}
              <div className="mt-3 pt-3 border-t">
                <AlarmSettings
                  alarmSound={preferences?.alarmSound ?? alarmSound}
                  setAlarmSound={(sound) => {
                    console.log('[MainTimer] Changing alarm sound to:', sound);
                    updateAlarmPreferences(sound, preferences?.alarmEnabled);
                    onAlarmSoundChange?.(sound);
                    // Play preview sound (debounce prevents doubles)
                    playAlarmSound(sound, true);
                  }}
                  alarmEnabled={preferences?.alarmEnabled ?? alarmEnabled}
                  setAlarmEnabled={(enabled) => {
                    console.log('[MainTimer] Toggling alarm enabled:', enabled);
                    // CRITICAL FIX: Don't override current sound selection with old database preference
                    // Get current UI selection instead of old database value
                    const currentSound = preferences?.alarmSound ?? alarmSound;
                    updateAlarmPreferences(currentSound, enabled);
                    onAlarmToggle?.(enabled);
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}