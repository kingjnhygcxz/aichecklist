import { useUserPreferences } from '@/hooks/useUserPreferences';

// Hook to provide smart defaults for new tasks based on user preferences and history
export function useTaskFormDefaults() {
  const { preferences, updateLastUsedCategory, updateLastUsedPriority, updateLastUsedTimerMinutes } = useUserPreferences();

  const getDefaultCategory = () => {
    return preferences?.selectedCategory || 'Work';
  };

  const getDefaultPriority = () => {
    return preferences?.selectedPriority || 'Medium';
  };

  const getDefaultTimerMinutes = () => {
    return preferences?.lastUsedTimerMinutes || 25;
  };

  const shouldShowTimer = () => {
    return preferences?.showTimerByDefault || false;
  };

  // Update preferences when user makes selections
  const rememberCategory = (category: string) => {
    updateLastUsedCategory(category);
  };

  const rememberPriority = (priority: string) => {
    updateLastUsedPriority(priority);
  };

  const rememberTimerMinutes = (minutes: number) => {
    updateLastUsedTimerMinutes(minutes);
  };

  return {
    getDefaultCategory,
    getDefaultPriority,
    getDefaultTimerMinutes,
    shouldShowTimer,
    rememberCategory,
    rememberPriority,
    rememberTimerMinutes,
  };
}