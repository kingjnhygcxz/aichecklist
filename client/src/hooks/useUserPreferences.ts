import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

export interface UserPreferences {
  // Timer & Alarm Preferences
  timerSound: string;
  timerEnabled: boolean;
  alarmSound: string;
  alarmEnabled: boolean;
  
  // General Preferences
  timezone: string;
  language: string;
  emailNotifications: boolean;
  marketingEmails: boolean;
  
  // Archive Settings
  autoArchiveEnabled: boolean;
  autoArchiveHours: number;
  
  // Achievement Preferences
  achievementsEnabled: boolean;
  dataCollectionConsent: boolean;
  
  // Voice Settings (for enterprise users)
  voiceEnabled: boolean;
  domoVoiceEnabled: boolean;
  
  // UI Preferences (stored locally but synced)
  selectedCategory?: string;
  selectedPriority?: string;
  lastUsedTimerMinutes?: number;
  showTimerByDefault?: boolean;
  
  // Task Details View Preferences
  taskDetailsExpanded?: boolean; // true = expanded (show all details), false = collapsed
  
  // Panel Visibility Preferences (persisted across sessions)
  timerPanelCollapsed?: boolean; // true = timer panel hidden, false = visible
}

const DEFAULT_PREFERENCES: UserPreferences = {
  timerSound: "Gentle Bell",
  timerEnabled: true,
  alarmSound: "Gentle Bell", 
  alarmEnabled: true,
  timezone: "America/New_York",
  language: "en",
  emailNotifications: true,
  marketingEmails: true,
  autoArchiveEnabled: false,
  autoArchiveHours: 24,
  achievementsEnabled: true,
  dataCollectionConsent: false,
  voiceEnabled: false,
  domoVoiceEnabled: false,
  lastUsedTimerMinutes: 25,
  showTimerByDefault: false,
};

export function useUserPreferences() {
  const [localPreferences, setLocalPreferences] = useState<Partial<UserPreferences>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch user preferences from database
  const { data: dbPreferences, isLoading } = useQuery({
    queryKey: ["/api/user/preferences"],
    enabled: !!localStorage.getItem('sessionId'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Combined preferences (database + local overrides)
  const preferences: UserPreferences = {
    ...DEFAULT_PREFERENCES,
    ...(dbPreferences || {}),
    ...localPreferences,
  };

  // Initialize from localStorage on first load
  useEffect(() => {
    if (isInitialized) return;
    
    try {
      // Load UI-specific preferences from localStorage
      const stored = localStorage.getItem('userPreferences');
      if (stored) {
        const localData = JSON.parse(stored);
        setLocalPreferences({
          selectedCategory: localData.selectedCategory,
          selectedPriority: localData.selectedPriority,
          lastUsedTimerMinutes: localData.lastUsedTimerMinutes,
          showTimerByDefault: localData.showTimerByDefault,
          timerPanelCollapsed: localData.timerPanelCollapsed,
          taskDetailsExpanded: localData.taskDetailsExpanded,
        });
      }
      
      // CRITICAL: Also load alarm preferences from localStorage
      const savedAlarmSound = localStorage.getItem('userPreferences_alarmSound');
      const savedAlarmEnabled = localStorage.getItem('userPreferences_alarmEnabled');
      
      if (savedAlarmSound || savedAlarmEnabled !== null) {
        setLocalPreferences(prev => ({
          ...prev,
          ...(savedAlarmSound && { alarmSound: savedAlarmSound }),
          ...(savedAlarmEnabled !== null && { alarmEnabled: savedAlarmEnabled === 'true' })
        }));
      }
      
      // Migrate old timer preferences if they exist
      const oldTimerPrefs = localStorage.getItem('timerPreferences');
      if (oldTimerPrefs && !stored) {
        try {
          const oldData = JSON.parse(oldTimerPrefs);
          if (oldData.timerSound || oldData.timerEnabled !== undefined) {
            updatePreferences({
              timerSound: oldData.timerSound || DEFAULT_PREFERENCES.timerSound,
              timerEnabled: oldData.timerEnabled ?? DEFAULT_PREFERENCES.timerEnabled,
            });
            localStorage.removeItem('timerPreferences'); // Clean up old data
          }
        } catch (error) {
          console.warn('Failed to migrate old timer preferences:', error);
        }
      }
    } catch (error) {
      console.warn('Failed to load local preferences:', error);
    }
    
    setIsInitialized(true);
  }, [isInitialized]);

  // Save UI preferences to localStorage
  const saveLocalPreferences = (prefs: Partial<UserPreferences>) => {
    try {
      const localData = {
        selectedCategory: prefs.selectedCategory,
        selectedPriority: prefs.selectedPriority,
        lastUsedTimerMinutes: prefs.lastUsedTimerMinutes,
        showTimerByDefault: prefs.showTimerByDefault,
        timerPanelCollapsed: prefs.timerPanelCollapsed,
        taskDetailsExpanded: prefs.taskDetailsExpanded,
      };
      localStorage.setItem('userPreferences', JSON.stringify(localData));
    } catch (error) {
      console.warn('Failed to save local preferences:', error);
    }
  };

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<UserPreferences>) => {
      // Separate database preferences from UI-only preferences
      const { selectedCategory, selectedPriority, lastUsedTimerMinutes, showTimerByDefault, timerPanelCollapsed, taskDetailsExpanded, ...dbUpdates } = updates;
      
      // Save UI preferences locally
      const localUpdates = { selectedCategory, selectedPriority, lastUsedTimerMinutes, showTimerByDefault, timerPanelCollapsed, taskDetailsExpanded };
      if (Object.values(localUpdates).some(v => v !== undefined)) {
        setLocalPreferences(prev => ({ ...prev, ...localUpdates }));
        saveLocalPreferences({ ...localPreferences, ...localUpdates });
      }

      // Save database preferences if any
      if (Object.keys(dbUpdates).length > 0) {
        const response = await apiRequest("PATCH", "/api/user/preferences", dbUpdates);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
    },
    onError: (error) => {
      console.error('Failed to update preferences:', error);
    }
  });

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    updatePreferencesMutation.mutate(updates);
  };

  // Specific preference updaters for common use cases
  const updateTimerPreferences = (timerSound?: string, timerEnabled?: boolean) => {
    updatePreferences({ 
      ...(timerSound && { timerSound }),
      ...(timerEnabled !== undefined && { timerEnabled })
    });
  };

  const updateAlarmPreferences = (alarmSound?: string, alarmEnabled?: boolean) => {
    // CRITICAL: Store alarm sound in localStorage immediately for instant access
    if (alarmSound) {
      localStorage.setItem('userPreferences_alarmSound', alarmSound);
      console.log(`[PREFERENCES] Saved alarm sound to localStorage: "${alarmSound}"`);
    }
    if (alarmEnabled !== undefined) {
      localStorage.setItem('userPreferences_alarmEnabled', String(alarmEnabled));
    }
    
    updatePreferences({ 
      ...(alarmSound && { alarmSound }),
      ...(alarmEnabled !== undefined && { alarmEnabled })
    });
  };

  const updateLastUsedCategory = (category: string) => {
    updatePreferences({ selectedCategory: category });
  };

  const updateLastUsedPriority = (priority: string) => {
    updatePreferences({ selectedPriority: priority });
  };

  const updateLastUsedTimerMinutes = (minutes: number) => {
    updatePreferences({ lastUsedTimerMinutes: minutes });
  };

  return {
    preferences,
    isLoading,
    isInitialized,
    updatePreferences,
    updateTimerPreferences,
    updateAlarmPreferences,
    updateLastUsedCategory,
    updateLastUsedPriority,
    updateLastUsedTimerMinutes,
  };
}