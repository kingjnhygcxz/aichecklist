// Audio utility for playing alarm and notification sounds
let lastPlayedSound: { id: string; timestamp: number } | null = null;

export function playSound(soundId: string, volume: number = 0.5): void {
  try {
    // Prevent double-playing the same sound within 500ms
    const now = Date.now();
    if (lastPlayedSound && lastPlayedSound.id === soundId && now - lastPlayedSound.timestamp < 500) {
      console.log(`[AUDIO DEBUG] Skipping duplicate sound: ${soundId} (played ${now - lastPlayedSound.timestamp}ms ago)`);
      return;
    }
    
    console.log(`[AUDIO DEBUG] Attempting to play sound ID: "${soundId}"`);
    const audio = document.getElementById(soundId) as HTMLAudioElement;
    
    if (audio) {
      console.log(`[AUDIO DEBUG] Found audio element for: ${soundId}`);
      console.log(`[AUDIO DEBUG] Audio ready state: ${audio.readyState}, paused: ${audio.paused}`);
      
      // Reset audio to beginning and set volume
      audio.currentTime = 0;
      audio.volume = Math.max(0, Math.min(1, volume));
      
      console.log(`[AUDIO DEBUG] Set volume to: ${audio.volume}, attempting to play...`);
      
      // Mark sound as played to prevent duplicates
      lastPlayedSound = { id: soundId, timestamp: now };
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`[AUDIO DEBUG] ✅ Successfully playing sound: ${soundId}`);
          })
          .catch(err => {
            console.error(`[AUDIO DEBUG] ❌ Audio play failed for ${soundId}:`, err);
            console.error(`[AUDIO DEBUG] Error details:`, {
              name: err.name,
              message: err.message,
              code: err.code
            });
          });
      } else {
        console.warn(`[AUDIO DEBUG] Play promise is undefined for: ${soundId}`);
      }
    } else {
      console.error(`[AUDIO DEBUG] ❌ Audio element NOT FOUND for sound ID: "${soundId}"`);
      console.error(`[AUDIO DEBUG] Available audio elements:`, 
        Array.from(document.querySelectorAll('audio')).map(el => el.id).filter(id => id)
      );
    }
  } catch (error) {
    console.error(`[AUDIO DEBUG] ❌ Exception in playSound for ${soundId}:`, error);
  }
}

// Play alarm sound with sound name mapping - UNIFIED SYSTEM
export function playAlarmSound(soundName: string, isPreview: boolean = false): void {
  console.log(`[ALARM DEBUG] 🔔 playAlarmSound called with: "${soundName}", isPreview: ${isPreview}`);
  
  // PREVENT OVERLAPPING ALARMS: If a sound is already playing, don't play another
  if (!isPreview && isAlarmPlaying()) {
    console.log(`[ALARM DEBUG] ⏸️ Skipping alarm - another sound is already playing`);
    return;
  }
  
  // COMPREHENSIVE sound mapping that matches AlarmSettings exactly
  const soundMap: Record<string, string> = {
    // Standard Alarms (matching GlobalAudioElements)
    "Gentle Bell": "relaxing-bell",
    "Digital Alarm": "happy-bells", 
    "Subtle Chime": "arcade-score",
    "Alert Tone": "kids-cartoon-bells",
    
    // Work sounds
    "Tech Beep (Work)": "high-tech-bleep",
    "Elegant Door (Work)": "elegant-door", 
    "Facility Alarm (Work)": "facility-alarm",
    "Street Alarm (Work)": "street-alarm",
    
    // Personal sounds
    "Happy Bells (Personal)": "happy-bells",
    "Flute Alert (Personal)": "flute-notification",
    "Page Chime (Personal)": "page-forward",
    "Relaxing Chime (Personal)": "relaxing-bell",
    "Uplifting Bells (Personal)": "uplifting-bells",
    
    // Vacation sounds
    "Violin Jingle (Vacation)": "mythical-violin-1",
    "Orchestral (Vacation)": "orchestral-violin",
    "Bell Promise (Vacation)": "bell-promise",
    
    // Gym sounds
    "Achievement Drums (Gym)": "achievement-drums",
    "War Drums (Gym)": "drums-war-1",
    "Epic Orchestra (Gym)": "epic-orchestra",
    
    // Achievement sounds
    "Small Win (Achievement)": "small-win",
    "Trumpet Fanfare (Achievement)": "trumpet-fanfare", 
    "Unlock Game (Achievement)": "unlock-game",
    "Winning (Achievement)": "winning-notification",
    
    // Other sounds
    "Arcade Score (Other)": "arcade-score",
    "Electronics Power (Other)": "electronics-power",
    "Guitar Slow (Other)": "guitar-stroke",
    "Cartoon Bells (Other)": "kids-cartoon-bells",
    "Melodic Gold (Other)": "melodic-gold",
    
    // Classical sounds (mapped to appropriate existing files)
    "Mozart Symphony": "orchestral-violin",
    "Classical Minuet": "mythical-violin-1", 
    "Baroque Harpsichord": "melodic-gold",
    
    // Futuristic sounds (mapped to appropriate existing files)
    "Cyber Pulse": "high-tech-bleep",
    "Quantum Beep": "electronics-power",
    "Neon Synth": "unlock-game",
    
    // Legacy sound names for backwards compatibility
    "Happy Bells": "happy-bells",
    "Kids Cartoon": "kids-cartoon-bells", 
    "Page Forward": "page-forward",
    "Street Alarm": "street-alarm",
    "Trumpet Fanfare": "trumpet-fanfare",
    "Unlock Game": "unlock-game",
    "Uplifting Bells": "uplifting-bells",
    "Winning Notification": "winning-notification",
    "Achievement Drums": "achievement-drums",
    "Bell Promise": "bell-promise",
    "Drums War": "drums-war-1",
    "Electronics Power": "electronics-power",
    "Elegant Door": "elegant-door",
    "Epic Orchestra": "epic-orchestra",
    "Facility Alarm": "facility-alarm",
    "Flute Notification": "flute-notification",
    "Guitar Stroke": "guitar-stroke",
    "High Tech Bleep": "high-tech-bleep",
    "Melodic Gold": "melodic-gold",
    "Mythical Violin": "mythical-violin-1",
  };

  const soundId = soundMap[soundName] || "relaxing-bell";
  console.log(`[ALARM DEBUG] 🎵 Sound mapping: "${soundName}" → "${soundId}"`);
  console.log(`[ALARM DEBUG] 🔊 Volume: ${isPreview ? 0.3 : 0.7} (preview: ${isPreview})`);
  
  const volume = isPreview ? 0.3 : 0.7; // Lower volume for previews
  
  console.log(`[ALARM DEBUG] 🎯 About to call playSound("${soundId}", ${volume})`);
  
  // Track currently playing sound to prevent overlaps
  if (!isPreview) {
    currentlyPlayingSound = soundId;
    // Clear the playing sound after a reasonable duration (most sounds are under 5 seconds)
    setTimeout(() => {
      currentlyPlayingSound = null;
    }, 5000);
  }
  
  playSound(soundId, volume);
}

// Play task completion sound
export function playTaskCompletionSound(): void {
  playAlarmSound("Winning Notification", false);
}

// Play achievement unlock sound
export function playAchievementSound(): void {
  playAlarmSound("Achievement Drums", false);
}

// Audio playback status tracking
let currentlyPlayingSound: string | null = null;

export function isAlarmPlaying(): boolean {
  return currentlyPlayingSound !== null;
}

export function stopCurrentAlarm(): boolean {
  let stopped = false;
  // Find and stop all audio elements
  const audioElements = document.querySelectorAll('audio');
  audioElements.forEach(audio => {
    if (!audio.paused) {
      audio.pause();
      audio.currentTime = 0;
      stopped = true;
    }
  });
  currentlyPlayingSound = null;
  return stopped;
}

export function testSound(soundId: string): void {
  playSound(soundId, 0.5);
}

export function isAudioUnlocked(): boolean {
  // Check if audio context is allowed (simple implementation)
  return true; // For now, assume audio is always available
}

// Sound ID type for type safety
export type SoundId = string;