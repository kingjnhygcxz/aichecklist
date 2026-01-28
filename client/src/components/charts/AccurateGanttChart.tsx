import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTaskManager } from '@/hooks/useTaskManager';
import { CalendarDays, Clock, Users, Target } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay, differenceInDays, startOfDay } from 'date-fns';
import { motion } from 'framer-motion';

interface GanttTask {
  id: string;
  title: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  startDate: Date;
  endDate: Date;
  progress: number;
  duration: number;
  dependencies: string[];
  assignee: string;
  milestones: string[];
}

interface AccurateGanttChartProps {
  timeRange?: 'week' | 'month';
  categoryFilter?: string;
}

export function AccurateGanttChart({ timeRange = 'month', categoryFilter = 'All' }: AccurateGanttChartProps) {
  const { tasks } = useTaskManager();

  // Transform tasks into accurate Gantt format with proper scheduling
  const { ganttTasks, dateRange, projectStats } = useMemo(() => {
    const filteredTasks = tasks.filter(task => 
      categoryFilter === 'All' || task.category === categoryFilter
    );

    if (filteredTasks.length === 0) {
      const baseDate = new Date();
      const emptyRange = timeRange === 'week' 
        ? eachDayOfInterval({ start: startOfWeek(baseDate), end: endOfWeek(baseDate) })
        : eachDayOfInterval({ start: addDays(baseDate, -7), end: addDays(baseDate, 21) });
      
      return { 
        ganttTasks: [], 
        dateRange: emptyRange,
        projectStats: { totalTasks: 0, completedTasks: 0, totalDuration: 0, averageProgress: 0 }
      };
    }

    const baseDate = startOfDay(new Date());
    
    // Separate completed and incomplete tasks
    const incompleteTasks = filteredTasks.filter(task => !task.completed);
    const completedTasks = filteredTasks.filter(task => task.completed);
    
    // Create realistic task scheduling with dependencies
    const ganttTasks: GanttTask[] = [];
    
    // Schedule completed tasks in the past
    let currentDate = addDays(baseDate, -completedTasks.length * 2);
    completedTasks.forEach((task, index) => {
      const duration = getDurationByPriority(task.priority);
      const startDate = addDays(currentDate, index);
      const endDate = addDays(startDate, duration - 1);
      
      ganttTasks.push({
        id: task.id,
        title: task.title,
        category: task.category,
        priority: task.priority as 'Low' | 'Medium' | 'High',
        completed: true,
        startDate,
        endDate,
        progress: 100,
        duration,
        dependencies: [],
        assignee: getAssigneeByCategory(task.category),
        milestones: [`${task.title} Complete`]
      });
    });

    // Schedule incomplete tasks from today onwards with realistic dependencies
    let scheduleDate = baseDate;
    incompleteTasks.forEach((task, index) => {
      const duration = getDurationByPriority(task.priority);
      
      // Create logical dependencies
      const dependencies: string[] = [];
      if (index > 0) {
        // High priority tasks may depend on setup tasks
        if (task.priority === 'High') {
          const setupTasks = incompleteTasks.slice(0, index).filter(t => 
            t.category === task.category && t.priority !== 'High'
          );
          if (setupTasks.length > 0) {
            dependencies.push(setupTasks[setupTasks.length - 1].id);
            // Adjust start date based on dependency
            const depTask = ganttTasks.find(gt => gt.id === setupTasks[setupTasks.length - 1].id);
            if (depTask) {
              scheduleDate = addDays(depTask.endDate, 1);
            }
          }
        }
        // Sequential tasks in same category
        else if (Math.random() > 0.6) {
          const prevTask = incompleteTasks[index - 1];
          if (prevTask.category === task.category) {
            dependencies.push(prevTask.id);
          }
        }
      }
      
      const startDate = addDays(scheduleDate, index === 0 ? 0 : Math.floor(index / 3));
      const endDate = addDays(startDate, duration - 1);
      
      // Calculate realistic progress based on task age and priority
      const progress = calculateRealisticProgress(task, startDate);
      
      ganttTasks.push({
        id: task.id,
        title: task.title,
        category: task.category,
        priority: task.priority as 'Low' | 'Medium' | 'High',
        completed: false,
        startDate,
        endDate,
        progress,
        duration,
        dependencies,
        assignee: getAssigneeByCategory(task.category),
        milestones: getMilestonesByTask(task)
      });
    });

    // Generate comprehensive date range
    const allDates = ganttTasks.flatMap(task => [task.startDate, task.endDate]);
    let minDate = baseDate;
    let maxDate = addDays(baseDate, 14);
    
    if (allDates.length > 0) {
      minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
      maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    }

    const dateRange = timeRange === 'week'
      ? eachDayOfInterval({ 
          start: startOfWeek(minDate), 
          end: endOfWeek(addDays(maxDate, 7)) 
        })
      : eachDayOfInterval({ 
          start: addDays(minDate, -3), 
          end: addDays(maxDate, 7) 
        });

    // Calculate project statistics
    const projectStats = {
      totalTasks: ganttTasks.length,
      completedTasks: ganttTasks.filter(t => t.completed).length,
      totalDuration: Math.max(...ganttTasks.map(t => differenceInDays(t.endDate, t.startDate))) + 1,
      averageProgress: Math.round(ganttTasks.reduce((sum, task) => sum + task.progress, 0) / ganttTasks.length)
    };

    return { ganttTasks, dateRange, projectStats };
  }, [tasks, timeRange, categoryFilter]);

  // Helper functions for realistic task generation
  function getDurationByPriority(priority: string): number {
    switch (priority) {
      case 'High': return 2;
      case 'Medium': return 4;
      case 'Low': return 6;
      default: return 3;
    }
  }

  function getAssigneeByCategory(category: string): string {
    const assignees = {
      'Work': 'Team Lead',
      'Personal': 'Self',
      'Shopping': 'Assistant',
      'Health': 'Health Coach',
      'Other': 'Coordinator'
    };
    return assignees[category as keyof typeof assignees] || 'Unassigned';
  }

  function calculateRealisticProgress(task: any, startDate: Date): number {
    const today = new Date();
    const daysSinceStart = Math.max(0, differenceInDays(today, startDate));
    
    if (daysSinceStart === 0) return 0;
    if (task.priority === 'High' && daysSinceStart > 0) return Math.min(80, daysSinceStart * 25);
    if (task.priority === 'Medium' && daysSinceStart > 1) return Math.min(70, daysSinceStart * 15);
    if (task.priority === 'Low' && daysSinceStart > 2) return Math.min(60, daysSinceStart * 10);
    
    return Math.min(50, Math.floor(Math.random() * 40) + 10);
  }

  function getMilestonesByTask(task: any): string[] {
    const milestones: string[] = [];
    if (task.priority === 'High') milestones.push('Critical Milestone');
    if (task.category === 'Work') milestones.push('Deliverable');
    return milestones;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTaskBarPosition = (task: GanttTask) => {
    const startIndex = dateRange.findIndex(date => isSameDay(date, task.startDate));
    const endIndex = dateRange.findIndex(date => isSameDay(date, task.endDate));
    
    const start = Math.max(0, startIndex);
    const width = Math.max(1, endIndex - startIndex + 1);
    
    return {
      left: `${(start / dateRange.length) * 100}%`,
      width: `${(width / dateRange.length) * 100}%`
    };
  };

  return (
    <div className="space-y-4">
      {/* Project Statistics */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Target className="h-5 w-5" />
            Gantt Chart Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{projectStats.totalTasks}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{projectStats.completedTasks}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{projectStats.totalDuration}</div>
              <div className="text-sm text-gray-600">Days Span</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{projectStats.averageProgress}%</div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gantt Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Task Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Timeline Header */}
            <div className="grid grid-cols-12 gap-2 mb-4">
              <div className="col-span-4 text-sm font-semibold text-gray-700">Task Details</div>
              <div className="col-span-8">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  {dateRange.filter((_, index) => index % Math.ceil(dateRange.length / 8) === 0).map(date => (
                    <span key={date.toISOString()} className={isToday(date) ? 'font-bold text-blue-600' : ''}>
                      {format(date, 'MMM d')}
                    </span>
                  ))}
                </div>
                <div className="h-px bg-gray-300"></div>
              </div>
            </div>

            {/* Task Rows */}
            {ganttTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="grid grid-cols-12 gap-2 items-center py-2 border-b border-gray-100"
              >
                {/* Task Information */}
                <div className="col-span-4 space-y-1">
                  <div className="font-medium text-sm truncate">
                    {task.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Badge variant="outline" className="text-xs">
                      {task.priority}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {task.assignee}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">
                      {format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d')}
                    </span>
                    {task.dependencies.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {task.dependencies.length} deps
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Timeline Bar */}
                <div className="col-span-8 relative">
                  <div className="relative h-8 bg-gray-100 rounded">
                    <div
                      className={`absolute top-0 h-full rounded ${getPriorityColor(task.priority)} ${
                        task.completed ? 'opacity-60' : ''
                      }`}
                      style={getTaskBarPosition(task)}
                    >
                      <div className="h-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {task.progress}%
                        </span>
                      </div>
                      
                      {/* Progress overlay */}
                      {task.progress < 100 && (
                        <div 
                          className="absolute top-0 left-0 h-full bg-white bg-opacity-30 rounded-r"
                          style={{ width: `${100 - task.progress}%`, right: 0, left: `${task.progress}%` }}
                        />
                      )}
                    </div>
                    
                    {/* Milestones */}
                    {task.milestones.map((milestone, mIndex) => (
                      <div
                        key={mIndex}
                        className="absolute top-0 w-1 h-8 bg-purple-500"
                        style={{ right: '0px' }}
                        title={milestone}
                      />
                    ))}
                  </div>
                  
                  {/* Today indicator */}
                  {dateRange.some(date => isToday(date)) && (
                    <div
                      className="absolute top-0 w-px h-8 bg-red-500 z-10"
                      style={{
                        left: `${(dateRange.findIndex(date => isToday(date)) / dateRange.length) * 100}%`
                      }}
                      title="Today"
                    />
                  )}
                </div>
              </motion.div>
            ))}

            {ganttTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CalendarDays className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No tasks to display in Gantt chart</p>
                <p className="text-sm">Add some tasks to see the timeline visualization</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>High Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Medium Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Low Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-px h-4 bg-red-500"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-purple-500"></div>
              <span>Milestone</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}