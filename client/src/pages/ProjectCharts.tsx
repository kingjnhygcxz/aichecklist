import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Network, BarChart3, BarChart2, Trophy, Timer, Mic, Share2, TrendingUp, CheckCircle, Clock, Target, Zap, Activity, Filter, Edit3, Plus, Circle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { ChartShareDialog } from '@/components/sharing/ChartShareDialog';
import { Progress } from '@/components/ui/progress';
import { useTaskManager } from '@/hooks/useTaskManager';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

export function ProjectCharts() {
  const [activeTab, setActiveTab] = useState('gantt');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="text-primary" />
              Project Charts
            </h1>
            <p className="text-muted-foreground mt-2">
              Visualize your tasks with Gantt timelines, PERT network analysis, and comprehensive statistics
            </p>
          </div>
          
          <ChartShareDialog chartType="combined">
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Charts
            </Button>
          </ChartShareDialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="gantt" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Gantt Chart
            </TabsTrigger>
            <TabsTrigger value="pert" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              PERT Chart
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gantt" className="space-y-6">
            <div className="space-y-6" data-chart-container>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Gantt Chart</h2>
                <ChartShareDialog chartType="gantt">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share Gantt
                  </Button>
                </ChartShareDialog>
              </div>
              {/* Gantt Chart content without header */}
              <GanttChartContent />
            </div>
          </TabsContent>

          <TabsContent value="pert" className="space-y-6">
            <div className="space-y-6" data-chart-container>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">PERT Chart</h2>
                <ChartShareDialog chartType="pert">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share PERT
                  </Button>
                </ChartShareDialog>
              </div>
              {/* PERT Chart content without header */}
              <PertChartContent />
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <div className="space-y-6" data-chart-container>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Statistics Dashboard</h2>
                <ChartShareDialog chartType="combined">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share Stats
                  </Button>
                </ChartShareDialog>
              </div>
              {/* Statistics content without header */}
              <StatisticsChartContent />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Extract content components without headers for tab use
import { useState as useTabState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

// Statistics interfaces
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

function StatisticsChartContent() {
  const { tasks } = useTaskManager();
  
  // Fetch user statistics from the API
  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    queryFn: async () => {
      const response = await fetch("/api/user/stats", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch user stats");
      return response.json();
    }
  });

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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{totalTasks}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
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

      {/* Main Statistics Cards */}
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
              <Timer className="mr-2" />
              Productivity Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tasks with Timers</span>
                <span className="font-medium">{tasksWithTimers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Timer Minutes</span>
                <span className="font-medium">{userStats?.totalTimerMinutes || totalTimerMinutes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Voice Tasks Created</span>
                <span className="font-medium">{userStats?.voiceTasksCreated || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tasks This Week</span>
                <span className="font-medium">{recentTasks.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category and Priority Breakdown */}
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

      {/* Database Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown (Database)</CardTitle>
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
              <p className="text-2xl font-bold text-yellow-600">{(userStats as any)?.businessTasks || 0}</p>
              <p className="text-sm text-muted-foreground">Business Tasks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{userStats?.otherTasks || 0}</p>
              <p className="text-sm text-muted-foreground">Other Tasks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GanttChartContent() {
  const { tasks, updateTask, deleteTask } = useTaskManager();
  const [timeRange, setTimeRange] = useTabState<'week' | 'month'>('week');
  const [categoryFilter, setCategoryFilter] = useTabState<string>('All');
  const [editingTask, setEditingTask] = useTabState<any>(null);
  const [newTitle, setNewTitle] = useTabState<string>('');
  const { toast } = useToast();

  // Transform tasks into Gantt format with realistic timeline distribution
  const ganttTasks = useMemo(() => {
    const baseDate = new Date();
    const incompleteTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);
    
    // Distribute incomplete tasks starting from today
    const incompleteGanttTasks = incompleteTasks.map((task, index) => {
      const startOffset = index * 2; // 2 days between tasks
      const duration = task.priority === 'High' ? 3 : task.priority === 'Medium' ? 5 : 7;
      
      return {
        id: task.id,
        title: task.title,
        category: task.category,
        priority: task.priority as 'Low' | 'Medium' | 'High',
        completed: false,
        startDate: addDays(baseDate, startOffset),
        endDate: addDays(baseDate, startOffset + duration),
        progress: Math.floor(Math.random() * 70) + 15 // 15-85% progress
      };
    });
    
    // Place completed tasks in the past
    const completedGanttTasks = completedTasks.map((task, index) => {
      const startOffset = -(completedTasks.length - index) * 3; // Past dates
      const duration = task.priority === 'High' ? 2 : task.priority === 'Medium' ? 4 : 6;
      
      return {
        id: task.id,
        title: task.title,
        category: task.category,
        priority: task.priority as 'Low' | 'Medium' | 'High',
        completed: true,
        startDate: addDays(baseDate, startOffset),
        endDate: addDays(baseDate, startOffset + duration),
        progress: 100
      };
    });
    
    return [...completedGanttTasks, ...incompleteGanttTasks];
  }, [tasks]);

  // Filter tasks by category
  const filteredTasks = ganttTasks.filter(task => 
    categoryFilter === 'All' || task.category === categoryFilter
  );

  // Generate date range for chart based on actual task dates
  const dateRange = useMemo(() => {
    if (filteredTasks.length === 0) {
      const baseDate = new Date();
      if (timeRange === 'week') {
        return eachDayOfInterval({
          start: startOfWeek(baseDate),
          end: endOfWeek(baseDate)
        });
      } else {
        return eachDayOfInterval({
          start: addDays(baseDate, -7),
          end: addDays(baseDate, 21)
        });
      }
    }
    
    // Calculate range based on task dates
    const allDates = filteredTasks.flatMap(task => [task.startDate, task.endDate]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    if (timeRange === 'week') {
      return eachDayOfInterval({
        start: startOfWeek(minDate),
        end: endOfWeek(maxDate)
      });
    } else {
      return eachDayOfInterval({
        start: addDays(minDate, -3),
        end: addDays(maxDate, 7)
      });
    }
  }, [timeRange, filteredTasks]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTaskPosition = (task: any) => {
    const startIndex = dateRange.findIndex(date => isSameDay(date, task.startDate));
    const endIndex = dateRange.findIndex(date => isSameDay(date, task.endDate));
    
    const start = Math.max(0, startIndex);
    const width = Math.max(1, endIndex - startIndex + 1);
    
    return { start, width };
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      await updateTask(taskId, { completed: !completed });
      toast({
        title: completed ? "Task marked incomplete" : "Task completed!",
        description: completed ? "Task moved back to active" : "Great job finishing this task!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleTaskEdit = async () => {
    if (!editingTask || !newTitle.trim()) return;
    
    try {
      await updateTask(editingTask.id, { title: newTitle.trim() });
      toast({
        title: "Task updated",
        description: "Task title has been updated",
      });
      setEditingTask(null);
      setNewTitle('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleTaskDelete = async (taskId: string, taskTitle: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value: 'week' | 'month') => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              <SelectItem value="Work">Work</SelectItem>
              <SelectItem value="Personal">Personal</SelectItem>
              <SelectItem value="Shopping">Shopping</SelectItem>
              <SelectItem value="Health">Health</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Task Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Date Header */}
              <div className="grid grid-cols-[200px_1fr] gap-4 mb-4">
                <div></div>
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${dateRange.length}, 1fr)` }}>
                  {dateRange.map((date, index) => (
                    <div
                      key={index}
                      className={`text-center text-sm p-2 rounded ${
                        isToday(date) ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}
                    >
                      <div className="font-medium">{format(date, 'EEE')}</div>
                      <div className="text-xs">{format(date, 'MMM d')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Task Rows */}
              <div className="space-y-3">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => {
                    const { start, width } = getTaskPosition(task);
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-[200px_1fr] gap-4 items-center group"
                      >
                        {/* Task Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-auto"
                              onClick={() => handleTaskToggle(task.id, task.completed)}
                            >
                              {task.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                            <div className={`font-medium text-sm truncate ${task.completed ? 'line-through text-muted-foreground' : ''}`} title={task.title}>
                              {task.title}
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-0 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    setEditingTask(task);
                                    setNewTitle(task.title);
                                  }}
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Edit Task</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="taskTitle">Task Title</Label>
                                    <Input
                                      id="taskTitle"
                                      value={newTitle}
                                      onChange={(e) => setNewTitle(e.target.value)}
                                      placeholder="Enter task title"
                                    />
                                  </div>
                                  <div className="flex justify-between">
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleTaskDelete(task.id, task.title)}
                                    >
                                      Delete Task
                                    </Button>
                                    <Button onClick={handleTaskEdit}>
                                      Save Changes
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {task.category}
                            </Badge>
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                          </div>
                        </div>

                        {/* Timeline Bar */}
                        <div className="relative h-8" style={{ gridTemplateColumns: `repeat(${dateRange.length}, 1fr)` }}>
                          <div className="absolute inset-0 grid gap-2" style={{ gridTemplateColumns: `repeat(${dateRange.length}, 1fr)` }}>
                            <div
                              className={`relative h-6 rounded ${
                                task.completed ? 'bg-green-500' : getPriorityColor(task.priority)
                              } opacity-80 flex items-center`}
                              style={{
                                gridColumnStart: start + 1,
                                gridColumnEnd: start + width + 1,
                              }}
                            >
                              {/* Progress Bar */}
                              <div
                                className="absolute inset-0 bg-black/20 rounded"
                                style={{ width: `${100 - task.progress}%`, right: 0 }}
                              ></div>
                              
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  {Math.round(task.progress)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks to display</p>
                    <p className="text-sm">Create some tasks to see them on the timeline</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium mb-2">Priority Levels</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <span className="text-sm">High Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-500"></div>
                  <span className="text-sm">Medium Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-sm">Low Priority</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Status</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-sm">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-300"></div>
                  <span className="text-sm">In Progress</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function PertChartContent() {
  const { tasks, updateTask, deleteTask } = useTaskManager();
  const [categoryFilter, setCategoryFilter] = useTabState<string>('All');
  const [showCriticalPath, setShowCriticalPath] = useTabState<boolean>(true);
  const [editingTask, setEditingTask] = useTabState<any>(null);
  const [newTitle, setNewTitle] = useTabState<string>('');
  const { toast } = useToast();

  // Transform tasks into PERT nodes with calculated scheduling
  const { pertNodes, pertEdges } = useMemo(() => {
    const filteredTasks = tasks.filter(task => 
      categoryFilter === 'All' || task.category === categoryFilter
    );

    if (filteredTasks.length === 0) {
      return { pertNodes: [], pertEdges: [] };
    }

    // Create initial nodes with durations
    const nodes = filteredTasks.map((task, index) => {
      const duration = task.priority === 'High' ? 2 : task.priority === 'Medium' ? 3 : 5;
      
      // Create logical dependencies based on categories and priorities
      const dependencies: string[] = [];
      if (index > 0 && Math.random() > 0.6) {
        // Add some logical dependencies
        const prevTaskIndex = Math.max(0, index - 1 - Math.floor(Math.random() * 2));
        if (prevTaskIndex !== index) {
          dependencies.push(filteredTasks[prevTaskIndex].id);
        }
      }

      return {
        id: task.id,
        title: task.title,
        category: task.category,
        priority: task.priority as 'Low' | 'Medium' | 'High',
        completed: task.completed,
        duration,
        dependencies,
        earlyStart: 0,
        earlyFinish: 0,
        lateStart: 0,
        lateFinish: 0,
        slack: 0,
        isCritical: false,
        position: { x: 0, y: 0 }
      };
    });

    // Calculate early start and finish times
    const calculateEarlyTimes = (nodes: any[]) => {
      const processed = new Set<string>();
      const calculate = (nodeId: string): void => {
        if (processed.has(nodeId)) return;
        
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        // Calculate dependencies first
        for (const depId of node.dependencies) {
          calculate(depId);
        }

        // Calculate early start
        if (node.dependencies.length === 0) {
          node.earlyStart = 0;
        } else {
          node.earlyStart = Math.max(
            ...node.dependencies.map((depId: string) => {
              const dep = nodes.find(n => n.id === depId);
              return dep ? dep.earlyFinish : 0;
            })
          );
        }

        node.earlyFinish = node.earlyStart + node.duration;
        processed.add(nodeId);
      };

      nodes.forEach(node => calculate(node.id));
    };

    // Calculate late start and finish times
    const calculateLateTimes = (nodes: any[]) => {
      const projectEnd = Math.max(...nodes.map(n => n.earlyFinish));
      
      // Find nodes with no successors
      const nodeSuccessors = new Map<string, string[]>();
      nodes.forEach(node => {
        nodeSuccessors.set(node.id, []);
      });
      
      nodes.forEach(node => {
        node.dependencies.forEach((depId: string) => {
          const successors = nodeSuccessors.get(depId) || [];
          successors.push(node.id);
          nodeSuccessors.set(depId, successors);
        });
      });

      const processed = new Set<string>();
      const calculate = (nodeId: string): void => {
        if (processed.has(nodeId)) return;
        
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        const successors = nodeSuccessors.get(nodeId) || [];
        
        // Calculate successors first
        for (const succId of successors) {
          calculate(succId);
        }

        // Calculate late finish
        if (successors.length === 0) {
          node.lateFinish = projectEnd;
        } else {
          node.lateFinish = Math.min(
            ...successors.map((succId: string) => {
              const succ = nodes.find(n => n.id === succId);
              return succ ? succ.lateStart : projectEnd;
            })
          );
        }

        node.lateStart = node.lateFinish - node.duration;
        node.slack = node.lateStart - node.earlyStart;
        node.isCritical = node.slack === 0;
        processed.add(nodeId);
      };

      nodes.forEach(node => calculate(node.id));
    };

    // Position nodes for visualization
    const positionNodes = (nodes: any[]) => {
      const levels = new Map<number, any[]>();
      
      nodes.forEach(node => {
        const level = node.earlyStart;
        if (!levels.has(level)) {
          levels.set(level, []);
        }
        levels.get(level)!.push(node);
      });

      Array.from(levels.keys()).sort((a, b) => a - b).forEach((level, levelIndex) => {
        const nodesAtLevel = levels.get(level)!;
        nodesAtLevel.forEach((node, nodeIndex) => {
          node.position = {
            x: levelIndex * 200 + 40, // Reduced spacing from 280 to 200
            y: nodeIndex * 90 + 80     // Reduced spacing from 120 to 90
          };
        });
      });
    };

    calculateEarlyTimes(nodes);
    calculateLateTimes(nodes);
    positionNodes(nodes);

    // Create edges
    const edges: Array<{from: string, to: string, isCritical: boolean}> = [];
    nodes.forEach(node => {
      node.dependencies.forEach((depId: string) => {
        const fromNode = nodes.find(n => n.id === depId);
        if (fromNode) {
          edges.push({
            from: depId,
            to: node.id,
            isCritical: node.isCritical && fromNode.isCritical
          });
        }
      });
    });

    return { pertNodes: nodes, pertEdges: edges };
  }, [tasks, categoryFilter]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'border-red-500 bg-red-50';
      case 'Medium': return 'border-yellow-500 bg-yellow-50';
      case 'Low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const criticalPath = pertNodes.filter(node => node.isCritical);
  const projectDuration = Math.max(...pertNodes.map(n => n.earlyFinish), 0);

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      await updateTask(taskId, { completed: !completed });
      toast({
        title: completed ? "Task marked incomplete" : "Task completed!",
        description: completed ? "Task moved back to active" : "Great job finishing this task!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleTaskEdit = async () => {
    if (!editingTask || !newTitle.trim()) return;
    
    try {
      await updateTask(editingTask.id, { title: newTitle.trim() });
      toast({
        title: "Task updated",
        description: "Task title has been updated",
      });
      setEditingTask(null);
      setNewTitle('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleTaskDelete = async (taskId: string, taskTitle: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              <SelectItem value="Work">Work</SelectItem>
              <SelectItem value="Personal">Personal</SelectItem>
              <SelectItem value="Shopping">Shopping</SelectItem>
              <SelectItem value="Health">Health</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={showCriticalPath ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCriticalPath(!showCriticalPath)}
            className="flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            Critical Path
          </Button>
        </div>
      </div>

      {/* Project Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{projectDuration}</p>
                <p className="text-sm text-muted-foreground">Total Duration (Days)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{criticalPath.length}</p>
                <p className="text-sm text-muted-foreground">Critical Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Network className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{pertNodes.length}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PERT Network Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Network Diagram
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pertNodes.length > 0 ? (
            <div className="relative overflow-x-auto">
              <div 
                className="relative"
                style={{ 
                  width: Math.max(600, Math.max(...pertNodes.map(n => n.position.x)) + 160), // Reduced padding
                  height: Math.max(300, Math.max(...pertNodes.map(n => n.position.y)) + 120)  // Reduced padding
                }}
              >
                {/* Render edges */}
                <svg className="absolute inset-0 pointer-events-none">
                  {pertEdges.map((edge, index) => {
                    const fromNode = pertNodes.find(n => n.id === edge.from);
                    const toNode = pertNodes.find(n => n.id === edge.to);
                    
                    if (!fromNode || !toNode) return null;
                    
                    const isVisible = !showCriticalPath || edge.isCritical;
                    
                    return (
                      <g key={index} opacity={isVisible ? 1 : 0.3}>
                        <line
                          x1={fromNode.position.x + 130} // Adjusted for new node width
                          y1={fromNode.position.y + 35}  // Adjusted for new node height
                          x2={toNode.position.x}
                          y2={toNode.position.y + 35}
                          stroke={edge.isCritical ? "#ef4444" : "#6b7280"}
                          strokeWidth={edge.isCritical ? 3 : 2}
                          markerEnd="url(#arrowhead)"
                        />
                        <defs>
                          <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                          >
                            <polygon
                              points="0 0, 10 3.5, 0 7"
                              fill={edge.isCritical ? "#ef4444" : "#6b7280"}
                            />
                          </marker>
                        </defs>
                      </g>
                    );
                  })}
                </svg>

                {/* Render nodes */}
                {pertNodes.map((node) => {
                  const isVisible = !showCriticalPath || node.isCritical;
                  
                  return (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: isVisible ? 1 : 0.4, scale: 1 }}
                      className={`absolute w-36 h-18 border-2 rounded-lg p-2 bg-white shadow-md cursor-pointer transition-all hover:shadow-lg ${
                        node.isCritical 
                          ? 'border-red-500 bg-red-50' 
                          : getPriorityColor(node.priority)
                      }`}
                      style={{
                        left: node.position.x,
                        top: node.position.y,
                        transform: isVisible ? 'scale(1)' : 'scale(0.9)'
                      }}
                      title={`${node.title}\nEarly: ${node.earlyStart}-${node.earlyFinish}\nLate: ${node.lateStart}-${node.lateFinish}\nSlack: ${node.slack}`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto"
                          onClick={() => handleTaskToggle(node.id, node.completed)}
                        >
                          {node.completed ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <Circle className="h-3 w-3 text-gray-400" />
                          )}
                        </Button>
                        <div className={`text-xs font-medium truncate ${node.completed ? 'line-through text-muted-foreground' : ''}`} title={node.title}>
                          {node.title}
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-auto opacity-0 hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setEditingTask(node);
                                setNewTitle(node.title);
                              }}
                            >
                              <Edit3 className="h-2 w-2" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Edit Task</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="pertTaskTitle">Task Title</Label>
                                <Input
                                  id="pertTaskTitle"
                                  value={newTitle}
                                  onChange={(e) => setNewTitle(e.target.value)}
                                  placeholder="Enter task title"
                                />
                              </div>
                              <div className="flex justify-between">
                                <Button
                                  variant="destructive"
                                  onClick={() => handleTaskDelete(node.id, node.title)}
                                >
                                  Delete Task
                                </Button>
                                <Button onClick={handleTaskEdit}>
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="secondary" className="text-xs px-1">
                          {node.category}
                        </Badge>
                        <span className="font-mono">
                          {node.duration}d
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{node.earlyStart}</span>
                        <span>{node.earlyFinish}</span>
                      </div>
                      {node.isCritical && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Network className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No tasks to analyze</p>
              <p className="text-sm">Create some tasks to see the PERT network diagram</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Critical Path Details */}
      {criticalPath.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Target className="h-5 w-5" />
              Critical Path Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4" />
                Tasks on the critical path have zero slack and determine project duration
              </div>
              
              <div className="grid gap-3">
                {criticalPath.map((node, index) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{node.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {node.category} • {node.priority} Priority
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-mono font-bold">{node.duration} days</div>
                      <div className="text-muted-foreground">
                        Days {node.earlyStart}-{node.earlyFinish}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Node Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-red-500 bg-red-50 rounded"></div>
                  <span>Critical Path Task (Zero Slack)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 bg-gray-50 rounded"></div>
                  <span>Non-Critical Task (Has Slack)</span>
                </div>
                <div className="text-muted-foreground mt-2">
                  Numbers at bottom: Early Start → Early Finish
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Priority Colors</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-red-500 bg-red-50 rounded"></div>
                  <span>High Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-yellow-500 bg-yellow-50 rounded"></div>
                  <span>Medium Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-green-500 bg-green-50 rounded"></div>
                  <span>Low Priority</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}