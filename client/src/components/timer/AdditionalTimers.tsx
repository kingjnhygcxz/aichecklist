import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Plus, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimerData {
  id: string;
  name: string;
  duration: number; // in seconds
  timeLeft: number;
  isRunning: boolean;
}

export function AdditionalTimers() {
  const [timers, setTimers] = useState<TimerData[]>([
    { id: '1', name: 'Break Timer', duration: 300, timeLeft: 300, isRunning: false }, // 5 minutes
    { id: '2', name: 'Focus Session', duration: 1500, timeLeft: 1500, isRunning: false }, // 25 minutes
    { id: '3', name: 'Quick Task', duration: 600, timeLeft: 600, isRunning: false }, // 10 minutes
    { id: '4', name: 'Long Break', duration: 900, timeLeft: 900, isRunning: false }, // 15 minutes
  ]);
  
  const [newTimerName, setNewTimerName] = useState('');
  const [newTimerDuration, setNewTimerDuration] = useState(5);
  const [showAddForm, setShowAddForm] = useState(false);

  // Timer countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers => 
        prevTimers.map(timer => {
          if (timer.isRunning && timer.timeLeft > 0) {
            const newTimeLeft = timer.timeLeft - 1;
            if (newTimeLeft === 0) {
              // Timer completed - play sound and show notification
              playCompletionSound();
              showCompletionNotification(timer.name);
              return { ...timer, timeLeft: 0, isRunning: false };
            }
            return { ...timer, timeLeft: newTimeLeft };
          }
          return timer;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const playCompletionSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const showCompletionNotification = (timerName: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Timer Complete: ${timerName}`, {
        body: 'Your timer has finished!',
        icon: '/favicon.ico'
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = (id: string) => {
    setTimers(prevTimers =>
      prevTimers.map(timer =>
        timer.id === id
          ? { ...timer, isRunning: !timer.isRunning }
          : timer
      )
    );
  };

  const resetTimer = (id: string) => {
    setTimers(prevTimers =>
      prevTimers.map(timer =>
        timer.id === id
          ? { ...timer, timeLeft: timer.duration, isRunning: false }
          : timer
      )
    );
  };

  const removeTimer = (id: string) => {
    setTimers(prevTimers => prevTimers.filter(timer => timer.id !== id));
  };

  const addCustomTimer = () => {
    if (newTimerName.trim() && newTimerDuration > 0) {
      const newTimer: TimerData = {
        id: Date.now().toString(),
        name: newTimerName,
        duration: newTimerDuration * 60, // Convert minutes to seconds
        timeLeft: newTimerDuration * 60,
        isRunning: false
      };
      setTimers(prev => [...prev, newTimer]);
      setNewTimerName('');
      setNewTimerDuration(5);
      setShowAddForm(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Additional Timers
          </CardTitle>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Add Timer
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="timer-name">Timer Name</Label>
                  <Input
                    id="timer-name"
                    value={newTimerName}
                    onChange={(e) => setNewTimerName(e.target.value)}
                    placeholder="e.g., Study Session"
                  />
                </div>
                <div>
                  <Label htmlFor="timer-duration">Duration (minutes)</Label>
                  <Input
                    id="timer-duration"
                    type="number"
                    min="1"
                    max="120"
                    value={newTimerDuration}
                    onChange={(e) => setNewTimerDuration(parseInt(e.target.value) || 5)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addCustomTimer} size="sm">Add Timer</Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {timers.map((timer) => (
              <motion.div
                key={timer.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative"
              >
                <Card className={`border-2 ${
                  timer.isRunning 
                    ? 'border-primary' 
                    : timer.timeLeft === 0 
                      ? 'border-green-500' 
                      : 'border-border'
                }`}>
                  <CardContent className="p-4 text-center space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{timer.name}</h4>
                      {timers.length > 1 && (
                        <Button
                          onClick={() => removeTimer(timer.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    <div className={`text-2xl font-mono font-bold ${
                      timer.timeLeft === 0 ? 'text-green-500' :
                      timer.timeLeft <= 60 ? 'text-destructive' : 
                      timer.timeLeft <= 300 ? 'text-yellow-500' : 'text-foreground'
                    }`}>
                      {formatTime(timer.timeLeft)}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        onClick={() => toggleTimer(timer.id)}
                        variant={timer.isRunning ? "destructive" : "default"}
                        size="sm"
                        className="flex-1"
                        disabled={timer.timeLeft === 0}
                      >
                        {timer.isRunning ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        onClick={() => resetTimer(timer.id)}
                        variant="outline"
                        size="sm"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}