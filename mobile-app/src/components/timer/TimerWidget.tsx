import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  AppState,
  AppStateStatus,
  Platform,
  Vibration
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { playSound, stopSound } from '../../utils/audio';

const TimerWidget = () => {
  const { activeTask, setActiveTask, alarmEnabled, alarmSound } = useAppContext();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeLeftRef = useRef<number | null>(null);
  const appStateRef = useRef(AppState.currentState);
  
  // Initialize timer when activeTask changes
  useEffect(() => {
    if (activeTask && activeTask.timer) {
      // Convert minutes to seconds
      const seconds = activeTask.timer * 60;
      setTimeLeft(seconds);
      setIsPaused(false);
      setIsComplete(false);
      startTimeRef.current = Date.now();
      pausedTimeLeftRef.current = null;
    } else {
      // Clear timer when there's no active task
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimeLeft(0);
      stopAllSounds();
    }
  }, [activeTask]);

  // Handle app state changes (background/foreground) to adjust timer
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground
        if (activeTask && !isPaused && startTimeRef.current && !isComplete) {
          const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const newTimeLeft = (activeTask.timer * 60) - elapsedSeconds;
          
          if (newTimeLeft <= 0) {
            // Timer would have completed while app was in background
            setTimeLeft(0);
            setIsComplete(true);
            triggerAlarm();
          } else {
            setTimeLeft(newTimeLeft);
          }
        } else if (pausedTimeLeftRef.current !== null) {
          // Timer was paused, restore the paused time
          setTimeLeft(pausedTimeLeftRef.current);
        }
      } else if (nextAppState.match(/inactive|background/) && appStateRef.current === 'active') {
        // App went to background
        if (isPaused) {
          pausedTimeLeftRef.current = timeLeft;
        }
      }
      
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [activeTask, isPaused, isComplete]);

  // Timer countdown logic
  useEffect(() => {
    if (activeTask && !isPaused && !isComplete && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(current => {
          if (current <= 1) {
            // Timer complete
            clearInterval(timerRef.current!);
            triggerAlarm();
            setIsComplete(true);
            return 0;
          }
          return current - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeTask, isPaused, isComplete]);

  // Play alarm sound when timer completes
  const triggerAlarm = () => {
    if (alarmEnabled) {
      // Play sound
      playSound(alarmSound);
      
      // Vibrate device
      if (Platform.OS !== 'web') {
        const PATTERN = [0, 500, 200, 500];
        Vibration.vibrate(PATTERN, true);
      }
    }
  };

  // Stop all sounds
  const stopAllSounds = () => {
    stopSound(alarmSound);
    if (Platform.OS !== 'web') {
      Vibration.cancel();
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (isComplete) {
      // Reset timer
      setIsComplete(false);
      setIsPaused(false);
      stopAllSounds();
      
      if (activeTask && activeTask.timer) {
        const seconds = activeTask.timer * 60;
        setTimeLeft(seconds);
        startTimeRef.current = Date.now();
      }
    } else {
      setIsPaused(!isPaused);
      
      if (isPaused) {
        // Resuming from pause - update start time reference
        startTimeRef.current = Date.now() - ((activeTask?.timer || 0) * 60 - timeLeft) * 1000;
        pausedTimeLeftRef.current = null;
      } else {
        // Pausing - store current timeLeft
        pausedTimeLeftRef.current = timeLeft;
      }
    }
  };

  // Cancel timer
  const cancelTimer = () => {
    if (isComplete) {
      stopAllSounds();
    }
    setActiveTask(null);
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!activeTask) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isComplete ? 'Timer Complete!' : 'Active Timer'}
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={cancelTimer}>
          <Ionicons name="close" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.taskName} numberOfLines={1}>
          {activeTask.title}
        </Text>
        
        <Text style={[
          styles.timerDisplay, 
          isComplete && styles.timerComplete
        ]}>
          {formatTime(timeLeft)}
        </Text>
        
        <View style={styles.controls}>
          <TouchableOpacity 
            style={[
              styles.controlButton,
              isComplete && styles.resetButton
            ]} 
            onPress={togglePlayPause}
          >
            <Ionicons 
              name={
                isComplete ? "refresh" : 
                isPaused ? "play" : "pause"
              } 
              size={24} 
              color="#ffffff" 
            />
            <Text style={styles.controlText}>
              {isComplete ? "Reset" : isPaused ? "Resume" : "Pause"}
            </Text>
          </TouchableOpacity>
          
          {!isComplete && (
            <TouchableOpacity style={styles.controlButton} onPress={cancelTimer}>
              <Ionicons name="stop" size={24} color="#ffffff" />
              <Text style={styles.controlText}>Stop</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  title: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  taskName: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '500',
    maxWidth: '90%',
  },
  timerDisplay: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
    fontVariant: ['tabular-nums'],
  },
  timerComplete: {
    color: '#ffffff',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlText: {
    color: '#ffffff',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default TimerWidget;