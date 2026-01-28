import { Audio } from 'expo-av';

// Define the sound types
export type SoundId = 'gentle_bell' | 'digital_alarm' | 'subtle_chime' | 'alert_tone';

// Cache for loaded sounds
const soundCache: Record<string, Audio.Sound> = {};

// Map sound IDs to their file paths
const soundFiles: Record<string, any> = {
  gentle_bell: require('../../assets/sounds/gentle_bell.mp3'),
  digital_alarm: require('../../assets/sounds/digital_alarm.mp3'),
  subtle_chime: require('../../assets/sounds/subtle_chime.mp3'),
  alert_tone: require('../../assets/sounds/alert_tone.mp3'),
};

// Pre-load a sound
const loadSound = async (soundId: string): Promise<Audio.Sound> => {
  if (soundCache[soundId]) {
    return soundCache[soundId];
  }
  
  try {
    // Check if the soundId exists in our mapping
    const soundFile = soundFiles[soundId];
    if (!soundFile) {
      console.error(`Sound ID not found: ${soundId}`);
      throw new Error(`Sound ID not found: ${soundId}`);
    }
    
    const { sound } = await Audio.Sound.createAsync(soundFile);
    soundCache[soundId] = sound;
    
    // Set up completion handler to clean up properly
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        // Reset the sound to beginning when it finishes
        sound.setPositionAsync(0);
      }
    });
    
    return sound;
  } catch (error) {
    console.error('Error loading sound:', error);
    throw error;
  }
};

// Play a sound by ID
export const playSound = async (soundId: string): Promise<void> => {
  try {
    // Initialize audio session
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
    
    const sound = await loadSound(soundId);
    
    // Stop sound if it's already playing
    const status = await sound.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await sound.stopAsync();
      await sound.setPositionAsync(0);
    }
    
    await sound.playAsync();
  } catch (error) {
    console.error(`Error playing sound ${soundId}:`, error);
  }
};

// Stop a sound by ID
export const stopSound = async (soundId: string): Promise<void> => {
  try {
    if (soundCache[soundId]) {
      const sound = soundCache[soundId];
      const status = await sound.getStatusAsync();
      
      if (status.isLoaded && status.isPlaying) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
      }
    }
  } catch (error) {
    console.error(`Error stopping sound ${soundId}:`, error);
  }
};

// Stop all currently playing sounds
export const stopAllSounds = async (): Promise<void> => {
  try {
    const soundIds = Object.keys(soundCache);
    for (const soundId of soundIds) {
      await stopSound(soundId);
    }
  } catch (error) {
    console.error('Error stopping all sounds:', error);
  }
};

// Get all available sound IDs
export const getSoundIds = (): string[] => {
  return Object.keys(soundFiles);
};

// Clean up sounds when app closes
export const unloadAllSounds = async (): Promise<void> => {
  try {
    const soundIds = Object.keys(soundCache);
    for (const soundId of soundIds) {
      await soundCache[soundId].unloadAsync();
    }
    
    // Clear the cache
    Object.keys(soundCache).forEach(key => {
      delete soundCache[key];
    });
  } catch (error) {
    console.error('Error unloading sounds:', error);
  }
};