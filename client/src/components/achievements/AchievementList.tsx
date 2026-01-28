import { useQuery } from "@tanstack/react-query";
import { AchievementCard } from "./AchievementCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Achievement, UserAchievement } from "@shared/schema";
import { Trophy, Star, Target, BarChart3 } from "lucide-react";

export function AchievementList() {
  const { data: achievements, isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  const { data: userAchievements, isLoading: userAchievementsLoading } = useQuery<UserAchievement[]>({
    queryKey: ["/api/user/achievements"],
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
  });

  if (achievementsLoading || userAchievementsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!achievements || !userAchievements) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load achievements</p>
      </div>
    );
  }

  const completedAchievements = userAchievements.filter(ua => ua.isCompleted);
  const totalPoints = userStats?.totalPoints || 0;

  // Group achievements by category
  const groupedAchievements = achievements.reduce((acc, achievement) => {
    const category = achievement.type;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const categoryIcons = {
    task_completion: Target,
    streak: Star,
    category: BarChart3,
    timer: Trophy,
    voice: Trophy,
    sharing: Trophy,
    milestone: Trophy,
  };

  const categoryNames = {
    task_completion: "Task Completion",
    streak: "Consistency",
    category: "Category Focus",
    timer: "Time Management",
    voice: "Voice Commands",
    sharing: "Collaboration",
    milestone: "Milestones",
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedAchievements.length} / {achievements.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((completedAchievements.length / achievements.length) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Categories */}
      {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => {
        const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
        const categoryName = categoryNames[category as keyof typeof categoryNames];
        
        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <CategoryIcon className="h-5 w-5" />
              <h3 className="text-lg font-semibold">{categoryName}</h3>
              <Badge variant="outline">
                {categoryAchievements.length} achievements
              </Badge>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryAchievements.map((achievement) => {
                const userAchievement = userAchievements.find(
                  ua => ua.achievementId === achievement.id
                );
                
                return (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    userAchievement={userAchievement}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}