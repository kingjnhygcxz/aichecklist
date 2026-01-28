import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Crown, Gem, Diamond } from "lucide-react";
import { Achievement, UserAchievement } from "@shared/schema";
import { format } from "date-fns";

interface AchievementCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
}

const rarityColors = {
  common: "bg-slate-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-yellow-500",
};

const rarityIcons = {
  common: Star,
  rare: Trophy,
  epic: Crown,
  legendary: Diamond,
};

export function AchievementCard({ achievement, userAchievement }: AchievementCardProps) {
  const isCompleted = userAchievement?.isCompleted || false;
  const progress = userAchievement?.progress || 0;
  const progressPercentage = Math.min((progress / achievement.condition.target) * 100, 100);
  
  const RarityIcon = rarityIcons[achievement.rarity];
  const rarityColor = rarityColors[achievement.rarity];

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${
      isCompleted ? "ring-2 ring-green-500 bg-green-50/50" : ""
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <RarityIcon className={`h-5 w-5 ${isCompleted ? "text-green-600" : "text-gray-400"}`} />
            {achievement.name}
          </CardTitle>
          <Badge className={`text-white ${rarityColor}`}>
            {achievement.rarity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {achievement.description}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {achievement.points} points
          </span>
          {isCompleted && userAchievement?.completedAt && (
            <span className="text-green-600 font-medium">
              Completed {format(new Date(userAchievement.completedAt), "MMM d, yyyy")}
            </span>
          )}
        </div>
        
        {!isCompleted && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress} / {achievement.condition.target}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
        
        {isCompleted && (
          <div className="flex items-center gap-2 text-green-600">
            <Trophy className="h-4 w-4" />
            <span className="font-medium">Achievement Unlocked!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}