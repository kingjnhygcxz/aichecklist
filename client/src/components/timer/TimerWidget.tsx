import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Timer, Pause, Play, Square, RefreshCw, Volume2, VolumeX, TestTube, VolumeOff } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import AlarmSettings from "./AlarmSettings";
import { useToast } from "@/hooks/use-toast";
import { testSound, isAudioUnlocked, stopCurrentAlarm, isAlarmPlaying } from "@/lib/audio";

interface TimerWidgetProps {
  activeTask?: { id: string; title: string; timer: number };
}

export function TimerWidget({ activeTask }: TimerWidgetProps) {
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [alarmSound, setAlarmSound] = useState("Gentle Bell");
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(false);
  const { toast } = useToast();
  
  const { 
    startTimer, 
    pauseTimer, 
    stopTimer, 
    resetTimer, 
    timeRemaining, 
    progress, 
    isActive,
    isPaused
  } = useTimer({
    initialSeconds: activeTask?.timer ? activeTask.timer * 60 : 25 * 60,
    alarmSound: alarmSound,
    alarmEnabled: alarmEnabled
  });

  // Check if audio is unlocked
  useEffect(() => {
    const checkAudioUnlock = () => {
      // Try to detect if user has interacted with the page
      const hasInteracted = localStorage.getItem('audio-unlocked') === 'true';
      setAudioUnlocked(hasInteracted);
    };
    
    checkAudioUnlock();
    
    // Listen for user interactions to unlock audio
    const unlockAudio = () => {
      localStorage.setItem('audio-unlocked', 'true');
      setAudioUnlocked(true);
    };
    
    ['click', 'touchstart', 'keydown'].forEach(event => {
      document.addEventListener(event, unlockAudio, { once: true, passive: true });
    });
    
    return () => {
      ['click', 'touchstart', 'keydown'].forEach(event => {
        document.removeEventListener(event, unlockAudio);
      });
    };
  }, []);

  const handleTimerStart = () => {
    if (alarmEnabled && !audioUnlocked) {
      toast({
        title: "🔔 Enable Timer Sounds",
        description: "Click anywhere on the page now to enable alarm sounds when timer finishes.",
        duration: 3000,
      });
    }
    startTimer();
  };

  const handleStopAlarm = () => {
    if (stopCurrentAlarm()) {
      setCurrentlyPlaying(false);
      toast({
        title: "🔇 Alarm Silenced",
        description: "Timer alarm stopped early.",
        duration: 2000,
      });
    }
  };

  // Check if alarm is playing and update state
  useEffect(() => {
    const checkAlarmStatus = () => {
      const playing = isAlarmPlaying();
      setCurrentlyPlaying(playing);
    };

    const interval = setInterval(checkAlarmStatus, 500); // Check every 500ms
    return () => clearInterval(interval);
  }, []);

  // Also update audio unlock status when page is interacted with
  useEffect(() => {
    const handleInteraction = () => {
      const wasUnlocked = localStorage.getItem('audio-unlocked') === 'true';
      if (wasUnlocked !== audioUnlocked) {
        setAudioUnlocked(wasUnlocked);
      }
    };
    
    // Check every few seconds if audio got unlocked
    const interval = setInterval(handleInteraction, 2000);
    return () => clearInterval(interval);
  }, [audioUnlocked]);

  // Convert alarm sound name to proper sound ID - COMPLETE MAPPING
  const getSoundId = (soundName: string) => {
    const soundMap: Record<string, string> = {
      // Standard alarms
      'Gentle Bell': 'gentle_bell',
      'Digital Alarm': 'digital_alarm',
      'Subtle Chime': 'subtle_chime',
      'Alert Tone': 'alert_tone',
      
      // Work sounds
      'Tech Beep (Work)': 'work_tech_beep',
      'Elegant Door (Work)': 'work_elegant_door', 
      'Facility Alarm (Work)': 'work_facility_alarm',
      'Street Alarm (Work)': 'work_street_alarm',
      
      // Personal sounds
      'Happy Bells (Personal)': 'personal_happy_bells',
      'Flute Alert (Personal)': 'personal_flute_alert',
      'Page Chime (Personal)': 'personal_page_chime',
      'Relaxing Chime (Personal)': 'personal_relaxing_chime',
      'Uplifting Bells (Personal)': 'personal_uplifting_bells',
      
      // Vacation sounds
      'Violin Jingle (Vacation)': 'vacation_violin_jingle',
      'Orchestral (Vacation)': 'vacation_orchestral',
      'Bell Promise (Vacation)': 'vacation_bell_promise',
      
      // Gym sounds
      'Achievement Drums (Gym)': 'gym_achievement_drums',
      'War Drums (Gym)': 'gym_war_drums',
      'Epic Orchestra (Gym)': 'gym_epic_orchestra',
      
      // Achievement sounds  
      'Small Win (Achievement)': 'achievement_small_win',
      'Trumpet Fanfare (Achievement)': 'achievement_trumpet_fanfare', 
      'Unlock Game (Achievement)': 'achievement_unlock_game',
      'Winning (Achievement)': 'achievement_winning',
      
      // Classical (mapped to appropriate existing files)
      'Mozart Symphony': 'orchestral-violin',
      'Classical Minuet': 'mythical-violin-1',
      'Baroque Harpsichord': 'melodic-gold',
      
      // Futuristic (mapped to appropriate existing files)
      'Cyber Pulse': 'high-tech-bleep',
      'Quantum Beep': 'electronics-power',
      'Neon Synth': 'unlock-game',
      
      // Other sounds
      'Arcade Score (Other)': 'other_arcade_score',
      'Electronics Power (Other)': 'other_electronics_power',
      'Guitar Slow (Other)': 'other_guitar_slow',
      'Cartoon Bells (Other)': 'other_cartoon_bells',
      'Melodic Gold (Other)': 'other_melodic_gold'
    };
    return soundMap[soundName] || 'gentle_bell';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-card animate-fade-in">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Timer className="text-primary text-xl mr-2" />
            <h2 className="text-lg font-medium">Active Timer</h2>
          </div>
          {alarmEnabled && (
            <div className="flex items-center gap-2">
              {audioUnlocked ? (
                <Volume2 className="h-4 w-4 text-green-500" />
              ) : (
                <VolumeX className="h-4 w-4 text-orange-500" />
              )}
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => testSound(getSoundId(alarmSound))}
                className="h-6 px-2 text-xs"
              >
                Test
              </Button>
            </div>
          )}
        </div>
        
        <div className="border border-border rounded-md p-4 bg-background/50">
          <h3 className="font-medium">
            {activeTask?.title || "No active task"}
          </h3>
          <div className="mt-6 flex flex-col items-center">
            <span className="text-4xl font-semibold font-mono text-primary">
              {formatTime(timeRemaining)}
            </span>
            <Progress 
              className="w-full h-2 bg-background mt-4" 
              value={progress} 
            />
            <div className="flex items-center space-x-3 mt-4">
              {isActive && !isPaused ? (
                <Button 
                  className="p-2 bg-primary hover:bg-primary/80 text-primary-foreground rounded-full flex items-center justify-center" 
                  size="icon"
                  onClick={pauseTimer}
                  aria-label="Pause timer"
                >
                  <Pause className="h-5 w-5" />
                </Button>
              ) : isPaused ? (
                <Button 
                  className="p-2 bg-primary hover:bg-primary/80 text-primary-foreground rounded-full flex items-center justify-center" 
                  size="icon"
                  onClick={startTimer}
                  aria-label="Resume timer"
                >
                  <Play className="h-5 w-5" />
                </Button>
              ) : (
                <Button 
                  className="p-2 bg-primary hover:bg-primary/80 text-primary-foreground rounded-full flex items-center justify-center" 
                  size="icon"
                  onClick={handleTimerStart}
                  aria-label="Start timer"
                >
                  <Timer className="h-5 w-5" />
                </Button>
              )}
              <Button 
                variant="outline" 
                size="icon"
                className="p-2 border border-border hover:bg-primary/10 rounded-full flex items-center justify-center" 
                onClick={stopTimer}
                aria-label="Stop timer"
              >
                <Square className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="p-2 border border-border hover:bg-primary/10 rounded-full flex items-center justify-center" 
                onClick={resetTimer}
                aria-label="Restart timer"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
              {currentlyPlaying && (
                <Button 
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center animate-pulse" 
                  size="icon"
                  onClick={handleStopAlarm}
                  aria-label="Silence alarm"
                >
                  <VolumeOff className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <AlarmSettings 
          alarmEnabled={alarmEnabled}
          setAlarmEnabled={setAlarmEnabled}
          alarmSound={alarmSound}
          setAlarmSound={setAlarmSound}
        />
      </CardContent>
    </Card>
  );
}

export default TimerWidget;
