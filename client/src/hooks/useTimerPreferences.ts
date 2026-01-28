import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TimerPreferences {
  timerSound: string;
  alarmSound: string;
  timerEnabled: boolean;
  alarmEnabled: boolean;
}

export function useTimerPreferences() {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ["/api/user/timer-preferences"],
    retry: false,
  });

  const updatePreferences = useMutation({
    mutationFn: async (newPreferences: Partial<TimerPreferences>) => {
      console.log('[useTimerPreferences] Updating preferences:', newPreferences);
      
      // Store in localStorage as fallback for non-authenticated users
      const storedPrefs = localStorage.getItem('timerPreferences');
      const currentPrefs = storedPrefs ? JSON.parse(storedPrefs) : { 
        timerSound: "Gentle Bell", 
        alarmSound: "Gentle Bell",
        timerEnabled: true,
        alarmEnabled: true
      };
      const updatedPrefs = { ...currentPrefs, ...newPreferences };
      localStorage.setItem('timerPreferences', JSON.stringify(updatedPrefs));

      // Try to save to server if authenticated using proper apiRequest
      try {
        const result = await apiRequest("PUT", "/api/user/timer-preferences", newPreferences);
        console.log('[useTimerPreferences] Server update successful:', result);
        return result;
      } catch (error) {
        console.log('[useTimerPreferences] Server update failed, using localStorage:', error);
        // Return localStorage data so the UI still updates
        return updatedPrefs;
      }
    },
    onSuccess: async (data) => {
      console.log('[useTimerPreferences] Mutation successful, data:', data);
      // Invalidate and refetch to ensure UI updates immediately
      await queryClient.invalidateQueries({ queryKey: ["/api/user/timer-preferences"] });
      await queryClient.refetchQueries({ queryKey: ["/api/user/timer-preferences"] });
      console.log('[useTimerPreferences] Cache invalidated and refetched');
    },
  });

  // Get preferences from localStorage as fallback
  const getPreferences = () => {
    if (preferences) return preferences;
    
    const storedPrefs = localStorage.getItem('timerPreferences');
    if (storedPrefs) {
      return JSON.parse(storedPrefs);
    }
    
    return { 
      timerSound: "Gentle Bell", 
      alarmSound: "Gentle Bell",
      timerEnabled: true,
      alarmEnabled: true
    };
  };

  return {
    preferences: getPreferences(),
    isLoading,
    updatePreferences: updatePreferences.mutate,
    isUpdating: updatePreferences.isPending,
  };
}