import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskManager } from '@/hooks/useTaskManager';
import { CalendarDays, Clock, Filter, BarChart3, Printer } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { useToast } from "@/hooks/use-toast";
import DOMPurify from 'dompurify';

interface GanttTask {
  id: string;
  title: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  startDate: Date;
  endDate: Date;
  progress: number;
}

export function GanttChart() {
  const { tasks } = useTaskManager();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const handlePrint = async () => {
    try {
      // For Gantt chart, we'll print the current task timeline
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          request: 'print task timeline gantt chart'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate Gantt chart report');
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
          title.textContent = result.title || 'Gantt Chart Report';
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
          title: "Gantt Chart Report Generated",
          description: "Your task timeline report is ready for printing!"
        });
      } else {
        throw new Error(result.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: "Print Error",
        description: "Failed to generate Gantt chart report. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Transform tasks into Gantt format with realistic timeline distribution
  const ganttTasks = useMemo((): GanttTask[] => {
    const baseDate = new Date();
    const incompleteTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);
    
    // Distribute incomplete tasks starting from today
    const incompleteGanttTasks = incompleteTasks.map((task, index) => {
      let startDate: Date;
      let endDate: Date;
      
      // Use actual dates from task if available
      if (task.startDate && task.projectEndDate) {
        startDate = new Date(task.startDate);
        endDate = new Date(task.projectEndDate);
      } else {
        // Fallback to calculated dates based on priority
        const startOffset = index * 2; // 2 days between tasks
        const duration = task.priority === 'High' ? 3 : task.priority === 'Medium' ? 5 : 7;
        startDate = addDays(baseDate, startOffset);
        endDate = addDays(baseDate, startOffset + duration);
      }
      
      return {
        id: task.id,
        title: task.title,
        category: task.category,
        priority: task.priority as 'Low' | 'Medium' | 'High',
        completed: false,
        startDate,
        endDate,
        progress: Math.floor(Math.random() * 70) + 15 // 15-85% progress
      };
    });
    
    // Place completed tasks in the past
    const completedGanttTasks = completedTasks.map((task, index) => {
      let startDate: Date;
      let endDate: Date;
      
      // Use actual dates from task if available
      if (task.startDate && task.projectEndDate) {
        startDate = new Date(task.startDate);
        endDate = new Date(task.projectEndDate);
      } else {
        // Fallback to calculated dates based on priority
        const startOffset = -(completedTasks.length - index) * 3; // Past dates
        const duration = task.priority === 'High' ? 2 : task.priority === 'Medium' ? 4 : 6;
        startDate = addDays(baseDate, startOffset);
        endDate = addDays(baseDate, startOffset + duration);
      }
      
      return {
        id: task.id,
        title: task.title,
        category: task.category,
        priority: task.priority as 'Low' | 'Medium' | 'High',
        completed: true,
        startDate,
        endDate,
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

  const getTaskPosition = (task: GanttTask) => {
    const startIndex = dateRange.findIndex(date => isSameDay(date, task.startDate));
    const endIndex = dateRange.findIndex(date => isSameDay(date, task.endDate));
    
    const start = Math.max(0, startIndex);
    const width = Math.max(1, endIndex - startIndex + 1);
    
    return { start, width };
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="text-primary" />
            Gantt Chart
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualize task progress and timeline
          </p>
        </div>
        
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

          <Button 
            onClick={handlePrint}
            className="flex items-center gap-2"
            size="sm"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
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
                        className="grid grid-cols-[200px_1fr] gap-4 items-center"
                      >
                        {/* Task Info */}
                        <div className="space-y-1">
                          <div className="font-medium text-sm truncate" title={task.title}>
                            {task.title}
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
      </div>
    </div>
  );
}