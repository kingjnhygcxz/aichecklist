import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Achievement, UserAchievement } from "@shared/schema";

const SHOWN_ACHIEVEMENTS_KEY = "shownAchievementNotifications";

function getShownAchievements(): Set<string> {
  try {
    const stored = localStorage.getItem(SHOWN_ACHIEVEMENTS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function markAchievementAsShown(achievementKey: string): void {
  try {
    const shown = getShownAchievements();
    shown.add(achievementKey);
    localStorage.setItem(SHOWN_ACHIEVEMENTS_KEY, JSON.stringify(Array.from(shown)));
  } catch {
    // Ignore localStorage errors
  }
}

export function useAchievements() {
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const hasCheckedRef = useRef(false);
  const queryClient = useQueryClient();

  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  const { data: userAchievements } = useQuery<UserAchievement[]>({
    queryKey: ["/api/user/achievements"],
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
  });

  // Check for new achievements when user achievements change
  useEffect(() => {
    // Only check once per mount to prevent repeated checks on re-renders
    if (hasCheckedRef.current) return;
    
    if (userAchievements && achievements) {
      const completedAchievements = userAchievements.filter(ua => ua.isCompleted);
      const lastCompletedAchievement = completedAchievements
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];

      if (lastCompletedAchievement) {
        const achievement = achievements.find(a => a.id === lastCompletedAchievement.achievementId);
        if (achievement) {
          // Use achievement ID + completion timestamp as unique key
          const achievementKey = `${lastCompletedAchievement.achievementId}-${lastCompletedAchievement.completedAt}`;
          const shownAchievements = getShownAchievements();
          
          // Check if this is a recent achievement (within last 2 minutes) and not already shown
          const completedAt = new Date(lastCompletedAchievement.completedAt!);
          const now = new Date();
          const timeDiff = now.getTime() - completedAt.getTime();
          
          if (timeDiff < 120000 && !shownAchievements.has(achievementKey)) { // 2 minutes
            setNewAchievement(achievement);
            setShowNotification(true);
            // Mark as shown in localStorage immediately so it won't show again
            markAchievementAsShown(achievementKey);
            hasCheckedRef.current = true;
          }
        }
      }
    }
  }, [userAchievements, achievements]);

  const closeNotification = () => {
    setShowNotification(false);
    setNewAchievement(null);
  };

  const triggerAchievementCheck = async () => {
    // Invalidate queries to refetch and check for new achievements
    await queryClient.invalidateQueries({ queryKey: ["/api/user/achievements"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
  };

  // Function to manually trigger achievement notification (for testing)
  const showTestAchievement = () => {
    if (achievements && achievements.length > 0) {
      setNewAchievement(achievements[0]);
      setShowNotification(true);
    }
  };

  // Function to force check for the latest completed achievement
  const forceShowLatestAchievement = () => {
    if (userAchievements && achievements) {
      const completedAchievements = userAchievements.filter(ua => ua.isCompleted);
      const lastCompletedAchievement = completedAchievements
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];

      if (lastCompletedAchievement) {
        const achievement = achievements.find(a => a.id === lastCompletedAchievement.achievementId);
        if (achievement) {
          setNewAchievement(achievement);
          setShowNotification(true);
        }
      }
    }
  };

  return {
    achievements,
    userAchievements,
    userStats,
    newAchievement,
    showNotification,
    closeNotification,
    triggerAchievementCheck,
    showTestAchievement,
    forceShowLatestAchievement,
  };
}