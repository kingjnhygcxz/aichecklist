import { Card, CardContent } from "@/components/ui/card";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { Lightbulb, TrendingUp, CheckCircle, Clock } from "lucide-react";

export function AIInsights() {
  const { insights } = useAIAssistant();

  // Don't show AI insights if there's no real data
  if (insights.length === 0) {
    return (
      <Card className="bg-card animate-fade-in">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4">
            <Lightbulb className="text-primary text-xl mr-2" />
            <h2 className="text-lg font-medium">AI Insights</h2>
          </div>
          
          <div className="border border-border rounded-md p-4 bg-background/50">
            <p className="text-sm text-muted-foreground text-center py-4">
              Complete a few tasks to unlock personalized AI insights based on your actual productivity patterns.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card animate-fade-in">
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <Lightbulb className="text-primary text-xl mr-2" />
          <h2 className="text-lg font-medium">AI Insights</h2>
        </div>
        
        <div className="border border-border rounded-md p-4 bg-background/50">
          <p className="text-sm text-muted-foreground mb-3">Based on your completion patterns:</p>
          <ul className="space-y-2 text-sm">
            {insights.map((insight, index) => {
              let Icon = TrendingUp;
              
              if (insight.includes("productive")) {
                Icon = TrendingUp;
              } else if (insight.includes("completed")) {
                Icon = CheckCircle;
              } else if (insight.includes("time") || insight.includes("period") || insight.includes("min")) {
                Icon = Clock;
              }
              
              return (
                <li key={index} className="flex items-start">
                  <Icon className="text-primary mt-0.5 mr-2 h-4 w-4" />
                  <span>{insight}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default AIInsights;
