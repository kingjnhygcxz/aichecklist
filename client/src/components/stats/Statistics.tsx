import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart2 } from "lucide-react";
import { useTaskManager } from "@/hooks/useTaskManager";

export function Statistics() {
  const { tasks } = useTaskManager();
  
  // Calculate task completion stats
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Calculate focus time for today (in minutes)
  const focusTime = 105; // 1h 45m in minutes - this would normally come from tracking actual time
  const dailyGoalFocusTime = 300; // 5 hours in minutes
  const focusTimePercentage = Math.min(100, (focusTime / dailyGoalFocusTime) * 100);
  
  // Weekly goal progress (simplified for demonstration)
  const weeklyGoalProgress = 65;

  return (
    <Card className="bg-card animate-fade-in">
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <BarChart2 className="text-primary text-xl mr-2" />
          <h2 className="text-lg font-medium">Statistics</h2>
        </div>
        
        <div className="space-y-4">
          <div className="border border-border rounded-md p-3 bg-background/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tasks Completed</span>
              <span className="font-medium">{completedTasks}/{totalTasks}</span>
            </div>
            <Progress className="w-full h-1.5 bg-background mt-2" value={completionRate} />
          </div>
          
          <div className="border border-border rounded-md p-3 bg-background/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Focus Time Today</span>
              <span className="font-medium">{Math.floor(focusTime / 60)}h {focusTime % 60}m</span>
            </div>
            <Progress className="w-full h-1.5 bg-background mt-2" value={focusTimePercentage} />
          </div>
          
          <div className="border border-border rounded-md p-3 bg-background/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Weekly Goal</span>
              <span className="font-medium">{weeklyGoalProgress}%</span>
            </div>
            <Progress className="w-full h-1.5 bg-background mt-2" value={weeklyGoalProgress} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default Statistics;
