import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useTaskManager } from "@/hooks/useTaskManager";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, Trash2, Edit3, Printer, Minimize2, Maximize2, Bot, Send, Sparkles, Share2 } from "lucide-react";
import { DomoAIMicroLogo } from "@/components/domoai/DomoAIMicroLogo";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addDays, isBefore, startOfDay } from "date-fns";
import type { Task, InsertTask } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { PrintCalendar } from "@/components/print/PrintCalendar";
import { ScheduleShareDialog } from "@/components/sharing/ScheduleShareDialog";
import DOMPurify from 'dompurify';

export function Calendar() {
  const { tasks, createTask, updateTask, deleteTask } = useTaskManager();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCompactView, setIsCompactView] = useState(false);
  const upcomingTasksRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [newTask, setNewTask] = useState({
    title: "",
    category: "Work",
    priority: "Medium" as "Low" | "Medium" | "High",
    timer: "",
    youtubeUrl: "",
    scheduledTime: "09:00",
    notes: ""
  });
  
  // AIDOMO chat state
  const [isAidomoOpen, setIsAidomoOpen] = useState(false);
  const [aidomoInput, setAidomoInput] = useState("");
  const [aidomoResponse, setAidomoResponse] = useState("");
  const [isAidomoLoading, setIsAidomoLoading] = useState(false);
  
  // Schedule sharing state
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  
  // Fetch pending shares to show notification badge
  const { data: sharedWithMe = [] } = useQuery<any[]>({
    queryKey: ['/api/schedule-shares/shared-with-me'],
  });
  
  // Fetch shared calendar events from accepted shares
  const { data: sharedEvents = [] } = useQuery<any[]>({
    queryKey: ['/api/schedule-shares/shared-events'],
  });
  
  const pendingSharesCount = sharedWithMe.filter((s: any) => !s.acceptedAt).length;
  
  // Show toast notification for pending shares on initial load
  useEffect(() => {
    if (pendingSharesCount > 0) {
      toast({
        title: "📬 New Schedule Shares!",
        description: `You have ${pendingSharesCount} pending schedule share${pendingSharesCount > 1 ? 's' : ''} waiting for your response. Click the Share button to view.`,
        duration: 8000,
      });
    }
  }, [pendingSharesCount > 0]); // Only trigger when going from 0 to >0

  // AIDOMO AI function with task creation capability
  const handleAidomoRequest = async (messageOverride?: string) => {
    const message = messageOverride !== undefined ? messageOverride : aidomoInput;
    
    if (!message.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a message for AIDOMO to respond to.",
        variant: "destructive"
      });
      return;
    }

    setIsAidomoLoading(true);
    setAidomoResponse("");

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          context: 'calendar_task_creator',
          currentDate: format(currentDate, 'yyyy-MM-dd'),
          selectedDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      setAidomoResponse(data.response);

      // Check if AI response includes task creation instructions
      let createdCount = 0;
      if (data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
        for (const taskData of data.tasks) {
          try {
            // Send raw date string to backend - let server handle timezone conversion with Luxon
            const dateStr = taskData.scheduledDate || format(selectedDate || new Date(), 'yyyy-MM-dd');
            
            // Create a placeholder Date object for the scheduledDate field (backend will override with correct time)
            const taskDate = new Date(`${dateStr}T00:00:00Z`);
            
            await createTask({
              title: taskData.title || "New Task",
              category: taskData.category || "Work",
              priority: taskData.priority || "Medium",
              timer: taskData.timer && taskData.timer !== "" ? parseInt(taskData.timer) : null,
              youtubeUrl: taskData.youtubeUrl || null,
              scheduledDate: taskDate,
              // Send raw time string to server for Luxon conversion
              scheduledTime: taskData.scheduledTime || "09:00",
              notes: taskData.notes || null
            });
            createdCount++;
          } catch (error) {
            console.error('Failed to create task:', taskData.title, error);
          }
        }
        
        if (createdCount > 0) {
          toast({
            title: `✅ ${createdCount} Task${createdCount > 1 ? 's' : ''} Created!`,
            description: `AIDOMO has successfully added ${createdCount} appointment${createdCount > 1 ? 's' : ''} to your calendar.`,
          });
        }
      } else if (data.response && (data.response.toLowerCase().includes('creating') || 
                                  data.response.toLowerCase().includes('scheduling') || 
                                  data.response.toLowerCase().includes('adding'))) {
        // AIDOMO mentioned creating something but no tasks were extracted
        toast({
          title: "⚠️ Task Creation Issue",
          description: "AIDOMO mentioned creating a task, but I couldn't extract the details. Try being more specific with dates and times.",
          variant: "destructive"
        });
      } else if (createdCount === 0) {
        // Only show general response notification if no tasks were created
        toast({
          title: "AIDOMO Response Ready! ✨",
          description: "Your AI assistant has analyzed your request.",
        });
      }
    } catch (error) {
      console.error('AIDOMO error:', error);
      setAidomoResponse("Sorry, I'm having trouble connecting right now. Please try again in a moment.");
      
      toast({
        title: "Connection Error",
        description: "AIDOMO is temporarily unavailable. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAidomoLoading(false);
    }
  };

  // Print function - simplified approach
  const handlePrintCalendar = () => {
    // Make the hidden print content visible temporarily
    const printElement = document.getElementById('calendar-print-content');
    if (!printElement) {
      console.error('Print calendar element not found!');
      return;
    }
    
    // Show the print content
    printElement.style.display = 'block';
    
    // Hide everything except the calendar
    const printStyles = document.createElement('style');
    printStyles.id = 'print-styles-temp';
    printStyles.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        #calendar-print-content, #calendar-print-content * {
          visibility: visible;
        }
        #calendar-print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(printStyles);
    
    // Trigger browser print
    window.print();
    
    // Clean up after print dialog closes and hide the element again
    setTimeout(() => {
      const tempStyles = document.getElementById('print-styles-temp');
      if (tempStyles) {
        tempStyles.remove();
      }
      if (printElement) {
        printElement.style.display = 'none';
      }
    }, 1000);
  };

  // Create print calendar content
  const createPrintCalendarContent = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = addDays(monthStart, -monthStart.getDay());
    const calendarEnd = addDays(monthEnd, 6 - monthEnd.getDay());
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Filter scheduled tasks for this calendar
    const sixMonthsFromNow = addDays(new Date(), 180);
    const oneYearAgo = addDays(new Date(), -365);
    const printScheduledTasks = tasks.filter(task => 
      task.scheduledDate && 
      !isBefore(new Date(task.scheduledDate), oneYearAgo) &&
      isBefore(new Date(task.scheduledDate), sixMonthsFromNow)
    );

    // Get tasks for a specific date
    const getTasksForDatePrint = (date: Date) => {
      return printScheduledTasks.filter(task => {
        if (!task.scheduledDate) return false;
        
        const taskDate = new Date(task.scheduledDate);
        const compareDate = new Date(date);
        
        taskDate.setHours(0, 0, 0, 0);
        compareDate.setHours(0, 0, 0, 0);
        
        return taskDate.getTime() === compareDate.getTime();
      });
    };

    const getPriorityClass = (priority: string) => {
      switch (priority) {
        case 'High': return 'task-high';
        case 'Medium': return 'task-medium';
        case 'Low': return 'task-low';
        default: return 'task-medium';
      }
    };

    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      .map(day => `<div class="day-header">${day}</div>`)
      .join('');

    const calendarCells = calendarDays.map(day => {
      const tasksForDay = getTasksForDatePrint(day);
      const isCurrentMonth = isSameMonth(day, currentDate);
      const isCurrentDay = isToday(day);
      
      const taskItems = tasksForDay.slice(0, 4).map(task => {
        const priorityClass = getPriorityClass(task.priority);
        const taskTitle = task.title.length > 20 ? task.title.substring(0, 20) + '...' : task.title;
        const completedIcon = task.completed ? '✓ ' : '';
        return `<div class="task-item ${priorityClass}">${completedIcon}${taskTitle}</div>`;
      }).join('');
      
      const overflowIndicator = tasksForDay.length > 4 
        ? `<div style="font-size: 8px; color: #666; font-style: italic;">+${tasksForDay.length - 4} more</div>`
        : '';

      const dayClasses = [
        'calendar-day',
        !isCurrentMonth ? 'other-month' : '',
        isCurrentDay ? 'today' : ''
      ].filter(Boolean).join(' ');

      return `
        <div class="${dayClasses}">
          <div class="day-number">${format(day, 'd')}</div>
          ${taskItems}
          ${overflowIndicator}
        </div>
      `;
    }).join('');

    return `
      <div class="header">
        <h1>${format(currentDate, 'MMMM yyyy')} Calendar</h1>
        <p>AIChecklist.io - Print & Fill Calendar</p>
      </div>
      
      <div class="calendar-grid">
        ${dayHeaders}
        ${calendarCells}
      </div>
      
      <div style="margin-top: 20px; font-size: 12px;">
        <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 5px;">
            <div style="width: 12px; height: 12px; background: #dc2626; border-radius: 2px;"></div>
            High Priority
          </div>
          <div style="display: flex; align-items: center; gap: 5px;">
            <div style="width: 12px; height: 12px; background: #ea580c; border-radius: 2px;"></div>
            Medium Priority
          </div>
          <div style="display: flex; align-items: center; gap: 5px;">
            <div style="width: 12px; height: 12px; background: #16a34a; border-radius: 2px;"></div>
            Low Priority
          </div>
          <div>✓ = Completed Task</div>
        </div>
      </div>
      
      <div class="footer">
        Printed from AIChecklist.io on ${format(new Date(), 'MMMM d, yyyy')}
      </div>
    `;
  };

  // Filter tasks that have scheduled dates (include past dates for debugging calendar issues)
  const scheduledTasks = useMemo(() => {
    const sixMonthsFromNow = addDays(new Date(), 180);
    const oneYearAgo = addDays(new Date(), -365);
    return tasks.filter(task => 
      task.scheduledDate && 
      !isBefore(new Date(task.scheduledDate), oneYearAgo) &&
      isBefore(new Date(task.scheduledDate), sixMonthsFromNow)
    );
  }, [tasks]);

  // Memoize upcoming tasks and next task ID for efficient rendering (includes shared events)
  const upcomingTasksData = useMemo(() => {
    // Get personal upcoming tasks
    const upcomingPersonal = scheduledTasks
      .filter(task => !isBefore(new Date(task.scheduledDate!), currentTime))
      .map(task => ({ ...task, isShared: false }));
    
    // Get shared events that are upcoming today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const upcomingShared = sharedEvents
      .filter((event: any) => {
        if (!event.scheduledDate) return false;
        const eventDate = new Date(event.scheduledDate);
        // Include shared events from today that are still in the future
        return !isBefore(eventDate, currentTime) && isBefore(eventDate, tomorrow);
      })
      .map((event: any) => ({ ...event, isShared: true }));
    
    // Combine and sort by scheduled date
    const allUpcoming = [...upcomingPersonal, ...upcomingShared]
      .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime());
    
    // Next task is always a personal task (not shared)
    const nextPersonalTask = upcomingPersonal.length > 0 ? upcomingPersonal[0] : null;
    
    return {
      tasks: allUpcoming,
      nextTaskId: nextPersonalTask?.id ?? null
    };
  }, [scheduledTasks, sharedEvents, currentTime]);

  // Update current time every minute to trigger recalculation of upcoming tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to next appointment when time passes - DISABLED
  // useEffect(() => {
  //   if (upcomingTasksData.nextTaskId && upcomingTasksRef.current) {
  //     const element = document.getElementById(`task-${upcomingTasksData.nextTaskId}`);
  //     if (element) {
  //       element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  //     }
  //   }
  // }, [upcomingTasksData.nextTaskId]);

  // Get tasks for a specific date (including shared events)
  const getTasksForDate = (date: Date, includeShared: boolean = true) => {
    const userTasks = scheduledTasks.filter(task => {
      if (!task.scheduledDate) return false;
      
      // Use date-only comparison to avoid timezone issues
      const taskDate = new Date(task.scheduledDate);
      const compareDate = new Date(date);
      
      // Reset time to avoid timezone issues
      taskDate.setHours(0, 0, 0, 0);
      compareDate.setHours(0, 0, 0, 0);
      
      return taskDate.getTime() === compareDate.getTime();
    });
    
    if (!includeShared) return userTasks;
    
    // Add shared events for this date
    const sharedTasksForDate = sharedEvents.filter((task: any) => {
      if (!task.scheduledDate) return false;
      
      const taskDate = new Date(task.scheduledDate);
      const compareDate = new Date(date);
      
      taskDate.setHours(0, 0, 0, 0);
      compareDate.setHours(0, 0, 0, 0);
      
      return taskDate.getTime() === compareDate.getTime();
    });
    
    return [...userTasks, ...sharedTasksForDate];
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = addDays(monthStart, -monthStart.getDay());
  const calendarEnd = addDays(monthEnd, 6 - monthEnd.getDay());
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    // Limit to 6 months in the future
    const nextMonth = addMonths(currentDate, 1);
    if (isBefore(nextMonth, addMonths(new Date(), 6))) {
      setCurrentDate(nextMonth);
    }
  };

  const handleDateClick = (date: Date) => {
    // Don't allow scheduling in the past
    if (isBefore(date, startOfDay(new Date()))) {
      toast({
        title: "Invalid Date",
        description: "Cannot schedule tasks in the past.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedDate(date);
    
    // Check if there are existing PERSONAL tasks on this date (exclude shared events)
    const personalTasksForDate = getTasksForDate(date, false); // false = exclude shared events
    
    if (personalTasksForDate.length > 0) {
      // If personal tasks exist, populate form with the first task for editing
      const firstTask = personalTasksForDate[0];
      setEditingTask(firstTask);
      const taskDate = new Date(firstTask.scheduledDate!);
      setNewTask({
        title: firstTask.title,
        category: firstTask.category,
        priority: firstTask.priority as "Low" | "Medium" | "High",
        timer: firstTask.timer?.toString() || "",
        youtubeUrl: firstTask.youtubeUrl || "",
        scheduledTime: format(taskDate, 'HH:mm'),
        notes: firstTask.notes || ""
      });
      setIsEditTaskOpen(true);
    } else {
      // No personal tasks exist, open add task dialog
      setIsAddTaskOpen(true);
    }
  };

  const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteTask(taskId);
      toast({
        title: "Task Deleted",
        description: "Task has been successfully deleted from your calendar.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    const taskDate = new Date(task.scheduledDate!);
    setSelectedDate(taskDate);
    setNewTask({
      title: task.title,
      category: task.category,
      priority: task.priority as "Low" | "Medium" | "High",
      timer: task.timer?.toString() || "",
      youtubeUrl: task.youtubeUrl || "",
      scheduledTime: format(taskDate, 'HH:mm'),
      notes: task.notes || ""
    });
    setIsEditTaskOpen(true);
  };

  // Handle editing shared tasks (for edit/full permission)
  const handleEditSharedTask = (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // Store the shared task info for editing
    setEditingTask({ ...task, _isSharedTask: true });
    const taskDate = new Date(task.scheduledDate!);
    setSelectedDate(taskDate);
    setNewTask({
      title: task.title,
      category: task.category,
      priority: task.priority as "Low" | "Medium" | "High",
      timer: task.timer?.toString() || "",
      youtubeUrl: task.youtubeUrl || "",
      scheduledTime: format(taskDate, 'HH:mm'),
      notes: task.notes || ""
    });
    setIsEditTaskOpen(true);
  };

  // Handle deleting shared tasks (for full permission only)
  const handleDeleteSharedTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/schedule-shares/shared-task/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete shared task');
      }
      
      // Refetch shared events
      queryClient.invalidateQueries({ queryKey: ['/api/schedule-shares/shared-events'] });
      
      toast({
        title: "Shared Task Deleted",
        description: "The shared task has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete shared task. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Check if user can edit a shared task
  const canEditSharedTask = (task: any) => {
    return task.isShared && (task.sharePermission === 'edit' || task.sharePermission === 'full');
  };

  // Check if user can delete a shared task
  const canDeleteSharedTask = (task: any) => {
    return task.isShared && task.sharePermission === 'full';
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a task title.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: "No Date Selected",
        description: "Please select a date for the task.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Combine selected date with scheduled time
      const [hours, minutes] = newTask.scheduledTime.split(':').map(Number);
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      const taskData: InsertTask = {
        title: newTask.title,
        category: newTask.category,
        priority: newTask.priority,
        completed: false,
        timer: newTask.timer && newTask.timer !== "" ? parseInt(newTask.timer) : null,
        youtubeUrl: newTask.youtubeUrl || null,
        scheduledDate: scheduledDateTime,
        notes: newTask.notes || null
      };

      await createTask(taskData);
      
      // Reset form
      setNewTask({
        title: "",
        category: "Work",
        priority: "Medium",
        timer: "",
        youtubeUrl: "",
        scheduledTime: "09:00",
        notes: ""
      });
      setIsAddTaskOpen(false);
      setSelectedDate(null);

      toast({
        title: "Task Scheduled",
        description: `Task scheduled for ${format(scheduledDateTime, 'PPP')} at ${format(scheduledDateTime, 'p')}`,
      });
    } catch (error) {
      console.error('Failed to create scheduled task:', error);
      toast({
        title: "Error",
        description: "Failed to schedule task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a task title.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedDate || !editingTask) {
      toast({
        title: "Invalid Operation",
        description: "Task update failed. Please try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Combine selected date with scheduled time
      const [hours, minutes] = newTask.scheduledTime.split(':').map(Number);
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      const updatedTaskData = {
        title: newTask.title,
        category: newTask.category,
        priority: newTask.priority,
        timer: newTask.timer && newTask.timer !== "" ? parseInt(newTask.timer) : null,
        youtubeUrl: newTask.youtubeUrl || null,
        scheduledDate: scheduledDateTime,
        notes: newTask.notes || null
      };

      // Check if this is a shared task (marked when opening the edit dialog)
      const isSharedTask = (editingTask as any)._isSharedTask === true;
      
      if (isSharedTask) {
        // Update shared task via the schedule-shares API
        const response = await fetch(`/api/schedule-shares/shared-task/${editingTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(updatedTaskData),
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to update shared task');
        }
        
        // Refetch shared events
        queryClient.invalidateQueries({ queryKey: ['/api/schedule-shares/shared-events'] });
      } else {
        // Update personal task normally
        await updateTask(editingTask.id, { ...editingTask, ...updatedTaskData });
      }
      
      // Reset form and close dialog
      setNewTask({
        title: "",
        category: "Work",
        priority: "Medium",
        timer: "",
        youtubeUrl: "",
        scheduledTime: "09:00",
        notes: ""
      });
      setIsEditTaskOpen(false);
      setEditingTask(null);
      setSelectedDate(null);

      toast({
        title: isSharedTask ? "Shared Task Updated" : "Task Updated",
        description: `Task updated and rescheduled for ${format(scheduledDateTime, 'PPP')} at ${format(scheduledDateTime, 'p')}`,
      });
    } catch (error: any) {
      console.error('Failed to update scheduled task:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Work': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Personal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Shopping': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Health': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Business': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <CalendarIcon className="mr-3 h-8 w-8 text-primary" />
          Task Calendar
        </h1>
        <div className="text-sm text-muted-foreground">
          Schedule tasks up to 6 months in advance
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center space-x-3">
                <Select
                  value={format(currentDate, 'MMMM')}
                  onValueChange={(month) => {
                    const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'].indexOf(month);
                    const newDate = new Date(currentDate.getFullYear(), monthIndex, 1);
                    setCurrentDate(newDate);
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={currentDate.getFullYear().toString()}
                  onValueChange={(year) => {
                    const newDate = new Date(parseInt(year), currentDate.getMonth(), 1);
                    setCurrentDate(newDate);
                  }}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col items-end gap-1">
                <p className="text-xs text-muted-foreground">These are printable resources to help show your staff productivity</p>
                <div className="flex items-center space-x-2">
                <Link href="/settings#scheduling">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="no-print bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30"
                    title="Manage Scheduling & Availability"
                    data-testid="scheduling-button"
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsShareDialogOpen(true)}
                  className="no-print bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 relative"
                  title="Share Schedule"
                  data-testid="share-schedule-button"
                >
                  <Share2 className="h-4 w-4" />
                  {pendingSharesCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {pendingSharesCount}
                    </span>
                  )}
                </Button>
                <Button 
                  variant={isCompactView ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setIsCompactView(!isCompactView)}
                  className="no-print"
                  title={isCompactView ? "Switch to Full View" : "Switch to Compact View"}
                >
                  {isCompactView ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrintCalendar}
                  className="no-print"
                  title="Print Calendar"
                >
                  <Printer className="h-4 w-4" />
                </Button>
                
                {/* AIDOMO Button */}
                <Dialog open={isAidomoOpen} onOpenChange={setIsAidomoOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="no-print bg-green-500/10 hover:bg-green-500/20 border-green-500/30"
                      title="Ask AIDOMO ✨"
                    >
                      <DomoAIMicroLogo size={16} />
                      <Sparkles className="h-3 w-3 ml-1" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <DomoAIMicroLogo size={20} />
                        AIDOMO ✨ AI Assistant
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 scrollbar-none">
                      <div className="px-2">
                        <Label htmlFor="aidomo-input">Ask AIDOMO anything about your calendar or tasks:</Label>
                        <Textarea
                          id="aidomo-input"
                          placeholder="e.g., 'Help me prioritize my tasks for this week' or 'What should I focus on today?'"
                          value={aidomoInput}
                          onChange={(e) => setAidomoInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              const currentValue = e.currentTarget.value;
                              if (currentValue.trim() && !isAidomoLoading) {
                                setAidomoInput(''); // Clear input immediately
                                handleAidomoRequest(currentValue);
                              }
                            }
                          }}
                          className="mt-2 min-h-[80px] border-2 border-green-500 focus:border-green-600"
                        />
                      </div>
                      
                      <div className="flex gap-2 px-2">
                        <Button 
                          onClick={handleAidomoRequest} 
                          disabled={isAidomoLoading || !aidomoInput.trim()}
                          className="flex-1"
                        >
                          {isAidomoLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              AIDOMO is thinking...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Ask AIDOMO
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setAidomoInput("");
                            setAidomoResponse("");
                          }}
                          disabled={isAidomoLoading}
                        >
                          Clear
                        </Button>
                      </div>
                      
                      {aidomoResponse && (
                        <div className="mt-4 mx-2 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 print:bg-white print:border-gray-400">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <DomoAIMicroLogo size={16} />
                              <p className="text-sm font-medium text-green-800 dark:text-green-200 print:text-black">
                                AIDOMO Response:
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                const printWindow = window.open('', 'AIDOMOResponse', 'width=800,height=600,noopener,noreferrer');
                                if (printWindow) {
                                  printWindow.opener = null; // Additional security
                                  // Safely construct document using DOM methods instead of document.write
                                  const doc = printWindow.document;
                                  doc.open();
                                  
                                  // Create document structure
                                  const html = doc.createElement('html');
                                  const head = doc.createElement('head');
                                  const body = doc.createElement('body');
                                  
                                  // Set title safely
                                  const title = doc.createElement('title');
                                  title.textContent = 'AIDOMO Response - AIChecklist.io';
                                  head.appendChild(title);
                                  
                                  // Add styles safely
                                  const style = doc.createElement('style');
                                  style.textContent = `
                                    body { 
                                      font-family: Arial, sans-serif; 
                                      margin: 20px; 
                                      line-height: 1.6;
                                      color: #000;
                                    }
                                    .header { 
                                      border-bottom: 2px solid #22c55e; 
                                      padding-bottom: 10px; 
                                      margin-bottom: 20px;
                                    }
                                    .response { 
                                      white-space: pre-wrap; 
                                      font-size: 14px;
                                      background: #f9f9f9;
                                      padding: 15px;
                                      border-radius: 8px;
                                      border: 1px solid #e0e0e0;
                                    }
                                  `;
                                  head.appendChild(style);
                                  
                                  // Create header safely
                                  const headerDiv = doc.createElement('div');
                                  headerDiv.className = 'header';
                                  
                                  const headerTitle = doc.createElement('h2');
                                  headerTitle.textContent = '🤖 AIDOMO AI Response';
                                  headerDiv.appendChild(headerTitle);
                                  
                                  const dateP = doc.createElement('p');
                                  dateP.textContent = `Generated on ${new Date().toLocaleString()}`;
                                  headerDiv.appendChild(dateP);
                                  
                                  const brandP = doc.createElement('p');
                                  const strong = doc.createElement('strong');
                                  strong.textContent = 'AIChecklist.io';
                                  brandP.appendChild(strong);
                                  brandP.appendChild(doc.createTextNode(' - ADHD-Friendly Task Management'));
                                  headerDiv.appendChild(brandP);
                                  
                                  // Create response div safely with sanitized content
                                  const responseDiv = doc.createElement('div');
                                  responseDiv.className = 'response';
                                  // SECURITY: DOMPurify sanitization is the industry-standard approach
                                  // recommended by OWASP for safely rendering HTML content.
                                  // This strict whitelist configuration ensures:
                                  // - Only basic text formatting tags allowed (no links, images, forms)
                                  // - Zero attributes permitted (blocks all event handlers, URLs, etc.)
                                  // - All dangerous tags explicitly forbidden
                                  const sanitizedResponse = DOMPurify.sanitize(aidomoResponse || '', {
                                    ALLOWED_TAGS: ['p', 'br', 'div', 'span', 'strong', 'em', 'u', 'b', 'i'],
                                    ALLOWED_ATTR: [],
                                    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'href', 'src', 'style', 'class', 'id'],
                                    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'select', 'textarea', 'a', 'img', 'svg', 'math', 'template', 'style', 'link', 'meta', 'base'],
                                    KEEP_CONTENT: true,
                                    SANITIZE_DOM: true
                                  });
                                  responseDiv.innerHTML = sanitizedResponse;
                                  
                                  // Assemble document
                                  body.appendChild(headerDiv);
                                  body.appendChild(responseDiv);
                                  html.appendChild(head);
                                  html.appendChild(body);
                                  doc.appendChild(html);
                                  doc.close();
                                  printWindow.focus();
                                  printWindow.print();
                                }
                              }}
                              className="flex items-center gap-1"
                            >
                              <Printer className="h-3 w-3" />
                              Print
                            </Button>
                          </div>
                          <div className="max-h-80 overflow-y-auto bg-white dark:bg-gray-900 rounded print:bg-white print:border-gray-300 print:max-h-none border-l-8 border-l-green-500 border border-gray-200 dark:border-gray-700 mx-1 scrollbar-none">
                            <div className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap leading-relaxed print:text-black print:text-base p-4 pl-6">
                              {aidomoResponse}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePreviousMonth}
                  disabled={isSameMonth(currentDate, new Date())}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleNextMonth}
                  disabled={!isBefore(currentDate, addMonths(new Date(), 5))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              <TooltipProvider>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const tasksForDay = getTasksForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isPassedDate = isBefore(day, startOfDay(new Date()));
                    
                    return (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <div
                            className={`
                              ${isCompactView ? 'min-h-[50px]' : 'min-h-[80px]'} p-1 border rounded-lg cursor-pointer transition-all hover:bg-accent
                              ${isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                              ${isToday(day) ? 'ring-2 ring-primary' : ''}
                              ${isPassedDate ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            onClick={() => !isPassedDate && handleDateClick(day)}
                          >
                      <div className={`text-sm font-medium mb-1 ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {format(day, 'd')}
                      </div>
                      <div className={isCompactView ? "space-y-0.5" : "space-y-1"}>
                        {tasksForDay.map((task: any) => {
                          const isSharedEvent = task.isShared === true;
                          const taskColor = isSharedEvent ? 'bg-orange-500' : getPriorityColor(task.priority);
                          
                          return (
                          <div key={task.id} className="space-y-0.5">
                            <div
                              className={`${isCompactView ? 'text-xs p-0.5' : 'text-xs p-1'} rounded text-white truncate ${taskColor} group relative`}
                              title={isSharedEvent 
                                ? `Shared by ${task.shareOwnerUsername}: ${task.title} - ${format(new Date(task.scheduledDate!), 'h:mm a')}`
                                : `${task.title} - ${format(new Date(task.scheduledDate!), 'h:mm a')}`
                              }
                            >
                              <div className="flex items-center justify-between">
                                <span className="flex-1 truncate">
                                  {isSharedEvent && <Share2 className="h-3 w-3 inline mr-1" />}
                                  {isCompactView 
                                    ? `${format(new Date(task.scheduledDate!), 'h:mm a')} ${task.title.substring(0, 15)}${task.title.length > 15 ? '...' : ''}`
                                    : `${format(new Date(task.scheduledDate!), 'h:mm a')} ${task.title}`
                                  }
                                </span>
                                {/* Show edit/delete buttons for personal tasks */}
                                {!isSharedEvent && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => handleEditTask(task, e)}
                                    className="p-1 hover:bg-white/20 rounded"
                                    title="Edit task"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteTask(task.id, e)}
                                    className="p-1 hover:bg-white/20 rounded"
                                    title="Delete task"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                                )}
                                {/* Show edit/delete buttons for shared tasks based on permission */}
                                {isSharedEvent && (canEditSharedTask(task) || canDeleteSharedTask(task)) && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {canEditSharedTask(task) && (
                                  <button
                                    onClick={(e) => handleEditSharedTask(task, e)}
                                    className="p-1 hover:bg-white/20 rounded"
                                    title="Edit shared task"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                  )}
                                  {canDeleteSharedTask(task) && (
                                  <button
                                    onClick={(e) => handleDeleteSharedTask(task.id, e)}
                                    className="p-1 hover:bg-white/20 rounded"
                                    title="Delete shared task"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                  )}
                                </div>
                                )}
                              </div>
                            </div>
                            {isSharedEvent && (
                              <div className="px-1 py-0.5 bg-orange-600 text-white text-[10px] rounded flex items-center gap-1">
                                <Share2 className="h-2 w-2" />
                                <span className="truncate">From: {task.shareOwnerUsername}</span>
                              </div>
                            )}
                            {task.appointment?.attendeeNotes && (
                              <div className="px-1 py-0.5 bg-green-600 text-white text-[10px] rounded flex items-center gap-1">
                                <span className="font-semibold">NOTES:</span>
                                <span className="truncate">{task.appointment.attendeeNotes}</span>
                              </div>
                            )}
                            {task.notes && !task.appointment?.attendeeNotes && !isSharedEvent && (
                              <div className="px-1 py-0.5 bg-blue-600 text-white text-[10px] rounded flex items-center gap-1">
                                <span className="font-semibold">NOTES:</span>
                                <span className="truncate">{task.notes}</span>
                              </div>
                            )}
                          </div>
                        )})}
                          </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{format(day, 'EEEE, MMMM do, yyyy')}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Tasks Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div 
                ref={upcomingTasksRef}
                className="max-h-[600px] overflow-y-auto p-6 space-y-3"
              >
              {upcomingTasksData.tasks.map((task: any) => {
                  const isPast = isBefore(new Date(task.scheduledDate!), currentTime);
                  const isNext = task.id === upcomingTasksData.nextTaskId;
                  const isSharedTask = task.isShared === true;
                  
                  return (
                    <div 
                      key={`${isSharedTask ? 'shared-' : ''}${task.id}`} 
                      id={`task-${task.id}`}
                      className={`p-3 border rounded-lg space-y-2 group hover:bg-accent/50 transition-all ${
                        isNext ? 'ring-2 ring-primary bg-primary/5' : ''
                      } ${isPast ? 'opacity-50' : ''} ${isSharedTask ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/20' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-medium text-sm flex-1">
                          {isNext && <span className="text-primary mr-1">→</span>}
                          {isSharedTask && <Share2 className="h-3 w-3 inline mr-1 text-orange-500" />}
                          {task.title}
                        </div>
                        {/* Show edit/delete buttons for personal tasks */}
                        {!isSharedTask && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleEditTask(task, e)}
                            className="p-1 hover:bg-background rounded"
                            title="Edit task"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteTask(task.id, e)}
                            className="p-1 hover:bg-background rounded text-destructive"
                            title="Delete task"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        )}
                        {/* Show edit/delete buttons for shared tasks based on permission */}
                        {isSharedTask && (canEditSharedTask(task) || canDeleteSharedTask(task)) && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canEditSharedTask(task) && (
                          <button
                            onClick={(e) => handleEditSharedTask(task, e)}
                            className="p-1 hover:bg-background rounded text-orange-600"
                            title="Edit shared task"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          )}
                          {canDeleteSharedTask(task) && (
                          <button
                            onClick={(e) => handleDeleteSharedTask(task.id, e)}
                            className="p-1 hover:bg-background rounded text-destructive"
                            title="Delete shared task"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          )}
                        </div>
                        )}
                      </div>
                      {isSharedTask && (
                        <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                          <Share2 className="h-3 w-3" />
                          <span>Shared by: {task.shareOwnerUsername}{task.sharePermission === 'full' ? ' (Full Access)' : task.sharePermission === 'edit' ? ' (Can Edit)' : ''}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className={isSharedTask ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : getCategoryColor(task.category)}>
                          {task.category}
                        </Badge>
                        <div className={`w-2 h-2 rounded-full ${isSharedTask ? 'bg-orange-500' : getPriorityColor(task.priority)}`} />
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(task.scheduledDate!), 'MMM d, p')}
                      </div>
                      {task.notes && !isSharedTask && (
                        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border-l-2 border-primary">
                          <span className="font-semibold">Notes:</span> {task.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              
              {upcomingTasksData.tasks.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No scheduled tasks</p>
                  <p className="text-sm">Click on a date to add one!</p>
                </div>
              )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>



      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Schedule Task for {selectedDate && format(selectedDate, 'PPP')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Work">Work</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="time">Scheduled Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newTask.scheduledTime}
                  onChange={(e) => setNewTask({ ...newTask, scheduledTime: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="timer">Timer (minutes)</Label>
                <Input
                  id="timer"
                  type="number"
                  value={newTask.timer}
                  onChange={(e) => setNewTask({ ...newTask, timer: e.target.value })}
                  placeholder="Optional"
                  min="1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="youtube">YouTube URL (Optional)</Label>
              <Input
                id="youtube"
                value={newTask.youtubeUrl}
                onChange={(e) => setNewTask({ ...newTask, youtubeUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={newTask.notes}
                onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                placeholder="Add any additional notes or details about this task..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Edit Task: {editingTask?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Task Title *</Label>
              <Input
                id="edit-title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Work">Work</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-date">Scheduled Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="edit-time">Scheduled Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={newTask.scheduledTime}
                  onChange={(e) => setNewTask({ ...newTask, scheduledTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-timer">Timer (minutes)</Label>
              <Input
                id="edit-timer"
                type="number"
                value={newTask.timer}
                onChange={(e) => setNewTask({ ...newTask, timer: e.target.value })}
                placeholder="Optional"
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="edit-youtube">YouTube URL (Optional)</Label>
              <Input
                id="edit-youtube"
                value={newTask.youtubeUrl}
                onChange={(e) => setNewTask({ ...newTask, youtubeUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea
                id="edit-notes"
                value={newTask.notes}
                onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                placeholder="Add any additional notes or details about this task..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => {
                setIsEditTaskOpen(false);
                setEditingTask(null);
                setSelectedDate(null);
                setNewTask({
                  title: "",
                  category: "Work",
                  priority: "Medium",
                  timer: "",
                  youtubeUrl: "",
                  scheduledTime: "09:00",
                  notes: ""
                });
              }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTask}>
                <Edit3 className="h-4 w-4 mr-2" />
                Update Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Hidden Print Calendar - only visible when printing */}
      <div id="calendar-print-content" style={{ display: 'none' }}>
        <PrintCalendar currentDate={currentDate} />
      </div>
      
      {/* Schedule Sharing Dialog */}
      <ScheduleShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        scheduledTasks={scheduledTasks}
      />
      
      </main>
      <Footer />
    </div>
  );
}