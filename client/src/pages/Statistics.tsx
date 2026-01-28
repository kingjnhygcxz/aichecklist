import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  BarChart2, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Zap,
  Trophy,
  Users,
  Share2,
  Mic,
  Timer,
  Activity,
  Printer
} from "lucide-react";
import { useTaskManager } from "@/hooks/useTaskManager";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@/types";
import { useToast } from "@/hooks/use-toast";
import DOMPurify from 'dompurify';

interface UserStats {
  id: number;
  userId: number;
  totalTasks: number;
  completedTasks: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null;
  totalPoints: number;
  workTasks: number;
  personalTasks: number;
  shoppingTasks: number;
  healthTasks: number;
  otherTasks: number;
  totalTimerMinutes: number;
  timerTasksCompleted: number;
  voiceTasksCreated: number;
  tasksShared: number;
  tasksReceived: number;
}

export function Statistics() {
  const { tasks } = useTaskManager();
  const { toast } = useToast();
  
  // Fetch user statistics from the API
  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    queryFn: async () => {
      const response = await fetch("/api/user/stats", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch user stats");
      return response.json();
    }
  });

  const handlePrint = async () => {
    try {
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          request: 'print statistics dashboard'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate statistics report');
      }

      const result = await response.json();
      
      if (result.success) {
        const printWindow = window.open('', '_blank', 'noopener,noreferrer');
        if (printWindow) {
          // Safely construct document using DOM methods instead of document.write
          const doc = printWindow.document;
          doc.open();
          
          // Create document structure
          const html = doc.createElement('html');
          const head = doc.createElement('head');
          const body = doc.createElement('body');
          
          // Set title safely
          const title = doc.createElement('title');
          title.textContent = result.title || 'Statistics Report';
          head.appendChild(title);
          
          // Add styles safely
          const style = doc.createElement('style');
          style.textContent = `
            body { margin: 0; padding: 20px; }
            @media print {
              body { margin: 0; }
            }
          `;
          head.appendChild(style);
          
          // Sanitize and set body content safely
          if (result.content) {
            const sanitizedContent = DOMPurify.sanitize(result.content, {
              ALLOWED_TAGS: ['p', 'br', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th'],
              ALLOWED_ATTR: ['style', 'class'],
              FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'href', 'src'],
              FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'select', 'textarea', 'a', 'img']
            });
            const parser = new DOMParser();
            const contentDoc = parser.parseFromString(sanitizedContent, 'text/html');
            if (contentDoc.body) {
              while (contentDoc.body.firstChild) {
                body.appendChild(doc.importNode(contentDoc.body.firstChild, true));
              }
            }
          }
          
          // Assemble the document
          html.appendChild(head);
          html.appendChild(body);
          doc.appendChild(html);
          doc.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 250);
        }
        
        toast({
          title: "Statistics Report Generated",
          description: "Your statistics report is ready for printing!"
        });
      } else {
        throw new Error(result.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: "Print Error",
        description: "Failed to generate statistics report. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Calculate real-time task statistics
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.filter(task => !task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate category breakdown
  const categoryStats = {
    Work: tasks.filter(task => task.category === 'Work').length,
    Personal: tasks.filter(task => task.category === 'Personal').length,
    Shopping: tasks.filter(task => task.category === 'Shopping').length,
    Health: tasks.filter(task => task.category === 'Health').length,
    Business: tasks.filter(task => task.category === 'Business').length,
    Other: tasks.filter(task => task.category === 'Other').length,
  };

  // Calculate priority breakdown
  const priorityStats = {
    High: tasks.filter(task => task.priority === 'High').length,
    Medium: tasks.filter(task => task.priority === 'Medium').length,
    Low: tasks.filter(task => task.priority === 'Low').length,
  };

  // Calculate timer usage
  const tasksWithTimers = tasks.filter(task => task.timer && task.timer > 0).length;
  const totalTimerMinutes = tasks.reduce((total, task) => {
    return total + (task.timer || 0);
  }, 0);

  // Calculate recent activity (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentTasks = tasks.filter(task => {
    const taskDate = new Date(task.createdAt);
    return taskDate >= oneWeekAgo;
  });

  if (statsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 lg:px-8 max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading your statistics...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 lg:px-8 max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <BarChart2 className="mr-3 text-primary" />
                Statistics Dashboard
              </h1>
              <p className="text-muted-foreground">
                Comprehensive overview of your task management and productivity metrics
              </p>
            </div>
            <Button 
              onClick={handlePrint}
              className="flex items-center gap-2"
              size="default"
            >
              <Printer className="h-4 w-4" />
              Print Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="productivity">Productivity</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Tasks</p>
                      <p className="text-2xl font-bold">{userStats?.totalTasks || totalTasks}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{userStats?.completedTasks || completedTasks}</p>
                    </div>
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                      <p className="text-2xl font-bold text-orange-600">{userStats?.currentStreak || 0}</p>
                    </div>
                    <Zap className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Points</p>
                      <p className="text-2xl font-bold text-purple-600">{userStats?.totalPoints || 0}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2" />
                    Task Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Overall Progress</span>
                      <span className="font-medium">{completionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={completionRate} className="w-full" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                        <p className="text-muted-foreground">Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{pendingTasks}</p>
                        <p className="text-muted-foreground">Pending</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tasks This Week</span>
                      <span className="font-medium">{recentTasks.length}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-lg font-bold">{userStats?.longestStreak || 0}</p>
                        <p className="text-muted-foreground">Longest Streak</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{userStats?.currentStreak || 0}</p>
                        <p className="text-muted-foreground">Current Streak</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Productivity Tab */}
          <TabsContent value="productivity" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Timer className="mr-2" />
                    Timer Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tasks with Timers</span>
                      <span className="font-medium">{tasksWithTimers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Timer Minutes</span>
                      <span className="font-medium">{userStats?.totalTimerMinutes || totalTimerMinutes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Timer Tasks Completed</span>
                      <span className="font-medium">{userStats?.timerTasksCompleted || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mic className="mr-2" />
                    Voice Commands
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Voice Tasks Created</span>
                      <span className="font-medium">{userStats?.voiceTasksCreated || 0}</span>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{userStats?.voiceTasksCreated || 0}</p>
                      <p className="text-sm text-muted-foreground">Voice interactions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Share2 className="mr-2" />
                    Collaboration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tasks Shared</span>
                      <span className="font-medium">{userStats?.tasksShared || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tasks Received</span>
                      <span className="font-medium">{userStats?.tasksReceived || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Task Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(categoryStats).map(([category, count]) => {
                      const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{category}</span>
                            <span className="text-sm text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="w-full" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(priorityStats).map(([priority, count]) => {
                      const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
                      const color = priority === 'High' ? 'text-red-600' : 
                                   priority === 'Medium' ? 'text-yellow-600' : 'text-green-600';
                      return (
                        <div key={priority} className="space-y-2">
                          <div className="flex justify-between">
                            <span className={`text-sm font-medium ${color}`}>{priority}</span>
                            <span className="text-sm text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="w-full" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown by Database</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{userStats?.workTasks || 0}</p>
                    <p className="text-sm text-muted-foreground">Work Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{userStats?.personalTasks || 0}</p>
                    <p className="text-sm text-muted-foreground">Personal Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{userStats?.shoppingTasks || 0}</p>
                    <p className="text-sm text-muted-foreground">Shopping Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{userStats?.healthTasks || 0}</p>
                    <p className="text-sm text-muted-foreground">Health Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{userStats?.businessTasks || 0}</p>
                    <p className="text-sm text-muted-foreground">Business Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-600">{userStats?.otherTasks || 0}</p>
                    <p className="text-sm text-muted-foreground">Other Tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 text-yellow-600" />
                    Achievement Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-yellow-600">{userStats?.totalPoints || 0}</p>
                    <p className="text-muted-foreground">Total Points Earned</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="mr-2 text-orange-600" />
                    Streak Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{userStats?.currentStreak || 0}</p>
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{userStats?.longestStreak || 0}</p>
                      <p className="text-sm text-muted-foreground">Longest Streak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 text-blue-600" />
                    Social Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{userStats?.tasksShared || 0}</p>
                      <p className="text-sm text-muted-foreground">Tasks Shared</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{userStats?.tasksReceived || 0}</p>
                      <p className="text-sm text-muted-foreground">Tasks Received</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}

export default Statistics;