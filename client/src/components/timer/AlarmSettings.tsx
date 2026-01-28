import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Square } from "lucide-react";
import { playSound, SoundId, stopCurrentAlarm, isAlarmPlaying } from "@/lib/audio";
import { useToast } from "@/hooks/use-toast";

interface AlarmSettingsProps {
  alarmEnabled: boolean;
  setAlarmEnabled: (enabled: boolean) => void;
  alarmSound: string;
  setAlarmSound: (sound: string) => void;
}

export function AlarmSettings({ 
  alarmEnabled, 
  setAlarmEnabled, 
  alarmSound, 
  setAlarmSound 
}: AlarmSettingsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  // Debug logging
  console.log('[AlarmSettings] Render with props:', { alarmEnabled, alarmSound });
  
  // Force re-render when alarmSound changes
  useEffect(() => {
    console.log('[AlarmSettings] alarmSound prop changed to:', alarmSound);
  }, [alarmSound]);

  // Add state to track the current selection to ensure UI updates
  // Initialize from localStorage if available for immediate persistence
  const getInitialSelection = () => {
    const saved = localStorage.getItem('userPreferences_alarmSound');
    return saved || alarmSound;
  };
  
  const [currentSelection, setCurrentSelection] = useState(getInitialSelection());

  // Sync currentSelection with alarmSound prop changes
  useEffect(() => {
    // Only update if the prop actually changed and is different
    if (alarmSound && alarmSound !== currentSelection) {
      setCurrentSelection(alarmSound);
      console.log('[AlarmSettings] Syncing currentSelection to:', alarmSound);
    }
  }, [alarmSound]);
  
  // Only sync with parent when component first loads, not on every change
  useEffect(() => {
    if (alarmSound && alarmSound !== currentSelection && !isPlaying) {
      console.log('[AlarmSettings] Initial sync with parent prop:', alarmSound);
      setCurrentSelection(alarmSound);
    }
  }, [alarmSound]); // Only respond to actual prop changes

  // Simple playing state check - only when testing sounds
  const updatePlayingState = useCallback(() => {
    const playing = isAlarmPlaying();
    if (isPlaying !== playing) {
      setIsPlaying(playing);
    }
  }, [isPlaying]);
  
  // Map display names to sound IDs
  const soundMap: Record<string, SoundId> = {
    "Gentle Bell": "gentle_bell",
    "Digital Alarm": "digital_alarm",
    "Subtle Chime": "subtle_chime",
    "Alert Tone": "alert_tone",
    "Mozart Symphony": "mozart_symphony",
    "Classical Minuet": "classical_minuet",
    "Baroque Harpsichord": "baroque_harpsichord",
    "Cyber Pulse": "cyber_pulse",
    "Quantum Beep": "quantum_beep",
    "Neon Synth": "neon_synth",
    // Work sounds with speech
    "Tech Beep (Work)": "work_tech_beep",
    "Elegant Door (Work)": "work_elegant_door", 
    "Facility Alarm (Work)": "work_facility_alarm",
    // Personal sounds with speech
    "Happy Bells (Personal)": "personal_happy_bells",
    "Flute Alert (Personal)": "personal_flute_alert",
    "Page Chime (Personal)": "personal_page_chime",
    // Vacation sounds with speech
    "Violin Jingle (Vacation)": "vacation_violin_jingle",
    "Orchestral (Vacation)": "vacation_orchestral",
    "Bell Promise (Vacation)": "vacation_bell_promise",
    // Gym sounds with speech
    "Achievement Drums (Gym)": "gym_achievement_drums",
    "War Drums (Gym)": "gym_war_drums",
    "Epic Orchestra (Gym)": "gym_epic_orchestra",
    // Other sounds with speech
    "Arcade Score (Other)": "other_arcade_score",
    "Electronics Power (Other)": "other_electronics_power",
    "Guitar Slow (Other)": "other_guitar_slow",
    "Cartoon Bells (Other)": "other_cartoon_bells",
    "Melodic Gold (Other)": "other_melodic_gold",
    // New Achievement sounds
    "Small Win (Achievement)": "achievement_small_win",
    "Trumpet Fanfare (Achievement)": "achievement_trumpet_fanfare", 
    "Unlock Game (Achievement)": "achievement_unlock_game",
    "Winning (Achievement)": "achievement_winning",
    // New Personal sounds
    "Relaxing Chime (Personal)": "personal_relaxing_chime",
    "Uplifting Bells (Personal)": "personal_uplifting_bells",
    // New Work sounds  
    "Street Alarm (Work)": "work_street_alarm"
  };

  const handleTestSound = () => {
    if (isPlaying) {
      // Stop the currently playing sound
      stopCurrentAlarm();
      setIsPlaying(false);
      toast({
        title: "Sound Stopped",
        description: "Test sound stopped.",
        duration: 2000,
      });
    } else {
      // Start playing the sound
      const soundId = soundMap[currentSelection];
      
      toast({
        title: "Testing Sound",
        description: `Playing "${currentSelection}" sound...`,
        duration: 3000,
      });
      
      console.log(`[ALARM TEST] 🧪 Testing sound: ${currentSelection} → ID: ${soundId}`);
      setIsPlaying(true);
      playSound(soundId);
      
      // Auto-update playing state after a delay
      setTimeout(updatePlayingState, 100);
    }
  };

  return (
    <div className="mt-4 px-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">Alarm</span>
        <Switch
          checked={alarmEnabled}
          onCheckedChange={(checked) => {
            console.log('[AlarmSettings] Toggling alarm enabled from', alarmEnabled, 'to', checked);
            setAlarmEnabled(checked);
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-2">
          <Select
          value={currentSelection}
          onValueChange={(value) => {
            console.log('[AlarmSettings] User selected new sound:', value);
            
            // Stop any currently playing sound immediately
            if (isPlaying) {
              stopCurrentAlarm();
              setIsPlaying(false);
            }
            
            // Update selection and notify parent
            setCurrentSelection(value);
            setAlarmSound(value);
            
            // Save to localStorage for persistence
            localStorage.setItem('userPreferences_alarmSound', value);
            console.log('[AlarmSettings] Sound selection saved:', value);
          }}
          disabled={!alarmEnabled}
        >
          <SelectTrigger className="bg-background border border-border py-1.5 px-3 text-sm h-9">
            <SelectValue placeholder="Select sound" />
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Standard Alarms</div>
            <SelectItem value="Gentle Bell">Gentle Bell</SelectItem>
            <SelectItem value="Digital Alarm">Digital Alarm</SelectItem>
            <SelectItem value="Subtle Chime">Subtle Chime</SelectItem>
            <SelectItem value="Alert Tone">Alert Tone</SelectItem>
            
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground mt-2">Work Sounds</div>
            <SelectItem value="Tech Beep (Work)">Tech Beep</SelectItem>
            <SelectItem value="Elegant Door (Work)">Elegant Door</SelectItem>
            <SelectItem value="Street Alarm (Work)">Street Alarm</SelectItem>
            
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground mt-2">Personal Sounds</div>
            <SelectItem value="Happy Bells (Personal)">Happy Bells</SelectItem>
            <SelectItem value="Flute Alert (Personal)">Flute Alert</SelectItem>
            <SelectItem value="Page Chime (Personal)">Page Chime</SelectItem>
            <SelectItem value="Relaxing Chime (Personal)">Relaxing Chime</SelectItem>
            <SelectItem value="Uplifting Bells (Personal)">Uplifting Bells</SelectItem>
            
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground mt-2">Vacation Sounds</div>
            <SelectItem value="Violin Jingle (Vacation)">Violin Jingle</SelectItem>
            <SelectItem value="Orchestral (Vacation)">Orchestral</SelectItem>
            <SelectItem value="Bell Promise (Vacation)">Bell Promise</SelectItem>
            
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground mt-2">Gym Sounds</div>
            <SelectItem value="Achievement Drums (Gym)">Achievement Drums</SelectItem>
            <SelectItem value="War Drums (Gym)">War Drums</SelectItem>
            <SelectItem value="Epic Orchestra (Gym)">Epic Orchestra</SelectItem>
            
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground mt-2">Achievement Sounds</div>
            <SelectItem value="Small Win (Achievement)">Small Win</SelectItem>
            <SelectItem value="Trumpet Fanfare (Achievement)">Trumpet Fanfare</SelectItem>
            <SelectItem value="Unlock Game (Achievement)">Unlock Game</SelectItem>
            <SelectItem value="Winning (Achievement)">Winning</SelectItem>
            
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground mt-2">Classical</div>
            <SelectItem value="Mozart Symphony">Mozart Symphony</SelectItem>
            <SelectItem value="Classical Minuet">Classical Minuet</SelectItem>
            <SelectItem value="Baroque Harpsichord">Baroque Harpsichord</SelectItem>
            
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground mt-2">Futuristic</div>
            <SelectItem value="Cyber Pulse">Cyber Pulse</SelectItem>
            <SelectItem value="Quantum Beep">Quantum Beep</SelectItem>
            <SelectItem value="Neon Synth">Neon Synth</SelectItem>
          </SelectContent>
          </Select>
        </div>
        <Button
          variant={isPlaying ? "default" : "ghost"}
          size="icon"
          onClick={handleTestSound}
          disabled={!alarmEnabled}
          className={`p-1.5 rounded-md transition-colors opacity-0 ${isPlaying ? 'bg-red-500 hover:bg-red-600 text-white' : 'hover:bg-primary/10'}`}
          aria-label={isPlaying ? "Stop test sound" : "Test sound"}
        >
          {isPlaying ? (
            <Square className="h-4 w-4 text-white" />
          ) : (
            <Play className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  );
}

export default AlarmSettings;
