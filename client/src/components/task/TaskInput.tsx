import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTaskManager } from "@/hooks/useTaskManager";
import { useCategories } from "@/hooks/useCategories";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Clock, LightbulbIcon, Video, Repeat, Tag, Edit2, Trash2, Calendar, List, CalendarDays, Trophy, BarChart2, BarChart3, CreditCard, MessageSquare, Settings, Home, ChevronDown, ChevronUp, Minimize2, Maximize2, FileText, ListChecks } from "lucide-react";
import AIAssistant from "./AIAssistant";
import { TemplateSelector } from "@/components/templates/TemplateSelector";
import { ChecklistDialog } from "./ChecklistDialog";
import { TaskCategory, TaskPriority } from "@/types";
import { RecurringFrequency } from "@shared/schema";
import { isValidYouTubeUrl } from "@/utils/youtube";
import { format, addDays, startOfDay, isBefore, addMonths } from "date-fns";
import { Calendar as CalendarWidget } from "@/components/ui/calendar";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Task title is required",
  }),
  category: z.string().default("Work"),
  priority: z.string().default("Medium"),
  timer: z.string().optional(),
  youtubeUrl: z.string().optional().refine(
    (url) => !url || isValidYouTubeUrl(url),
    "Please enter a valid YouTube URL"
  ),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.string().optional(),
  recurringInterval: z.string().optional(),
  startDate: z.date().optional(),
  projectEndDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskInputProps {
  onTaskCreated?: (task: any) => void;
}

export function TaskInput({ onTaskCreated }: TaskInputProps = {}) {
  const { addTask, createTask, tasks } = useTaskManager();
  const { allCategories, addCustomCategory } = useCategories();
  const { toast } = useToast();
  const [timerActive, setTimerActive] = useState(false);
  const [videoActive, setVideoActive] = useState(false);
  const [recurringActive, setRecurringActive] = useState(false);
  const [timelineActive, setTimelineActive] = useState(false);
  const [showCustomCategoryDialog, setShowCustomCategoryDialog] = useState(false);
  const [newCustomCategory, setNewCustomCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  const [showChecklistDialog, setShowChecklistDialog] = useState(false);
  const [checklistItems, setChecklistItems] = useState<Array<{id: string, text: string, completed: boolean}>>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [projectEndDate, setProjectEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  
  // Minimize/Expand states for collapsible sections
  const [isFormMinimized, setIsFormMinimized] = useState(false);
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);
  
  // Initialize bottom options state from localStorage
  const [isBottomOptionsMinimized, setIsBottomOptionsMinimized] = useState(() => {
    try {
      const saved = localStorage.getItem('taskInput-bottomOptionsMinimized');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Save bottom options state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('taskInput-bottomOptionsMinimized', JSON.stringify(isBottomOptionsMinimized));
    } catch {
      // Ignore localStorage errors (e.g., in private browsing mode)
    }
  }, [isBottomOptionsMinimized]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "Work",
      priority: "Medium",
      timer: "",
      youtubeUrl: "",
      isRecurring: false,
      recurringFrequency: "weekly",
      recurringInterval: "1",
    },
  });

  const handleAddCustomCategory = () => {
    const categoryName = newCustomCategory.trim();
    if (categoryName && addCustomCategory(categoryName)) {
      form.setValue("category", categoryName);
      setNewCustomCategory("");
      setShowCustomCategoryDialog(false);
    }
  };

  const handleEditCategory = (oldName: string, newName: string) => {
    if (newName.trim() && newName !== oldName) {
      // For now, we'll just add the new category
      // In a full implementation, you'd want to update all tasks with the old category
      addCustomCategory(newName.trim());
      setEditingCategory(null);
      setEditCategoryName("");
    }
  };

  const startEditingCategory = (categoryName: string) => {
    setEditingCategory(categoryName);
    setEditCategoryName(categoryName);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditCategoryName("");
  };

  const onSubmit = (data: FormValues) => {
    const timer = data.timer ? parseInt(data.timer) : undefined;
    const youtubeUrl = data.youtubeUrl?.trim() || undefined;
    const recurringInterval = data.recurringInterval ? parseInt(data.recurringInterval) : undefined;
    
    // Validate timeline dates if both are set
    if (timelineActive && startDate && projectEndDate) {
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(projectEndDate);
      
      // Apply time to dates
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);
      endDateTime.setHours(endHours, endMinutes, 0, 0);
      
      if (endDateTime <= startDateTime) {
        toast({
          title: "Invalid Timeline",
          description: "End date/time must be after start date/time",
          variant: "destructive"
        });
        return;
      }
    }
    
    // Build task with timeline fields
    const newTask: any = {
      title: data.title,
      category: data.category as TaskCategory,
      priority: data.priority as TaskPriority,
      timer: timer,
      youtubeUrl: youtubeUrl,
      checklistItems: checklistItems.length > 0 ? checklistItems : undefined,
      completed: false,
      isRecurring: data.isRecurring,
      recurringFrequency: data.isRecurring ? (data.recurringFrequency as RecurringFrequency) : undefined,
      recurringInterval: data.isRecurring ? recurringInterval : undefined,
    };
    
    // Add timeline fields if active and dates are set
    if (timelineActive && startDate && projectEndDate) {
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(projectEndDate);
      
      // Apply time to dates
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);
      endDateTime.setHours(endHours, endMinutes, 0, 0);
      
      newTask.startDate = startDateTime;
      newTask.projectEndDate = endDateTime;
    }
    
    addTask(newTask);
    
    // Trigger callback for timer management
    if (onTaskCreated) {
      onTaskCreated(newTask);
    }
    
    form.reset();
    setTimerActive(false);
    setVideoActive(false);
    setRecurringActive(false);
    setTimelineActive(false);
    setChecklistItems([]);
    setStartDate(null);
    setProjectEndDate(null);
    setStartTime("09:00");
    setEndTime("17:00");
  };

  // Calendar Schedule Popup Component
  const CalendarSchedulePopup = ({ onSchedule, onCancel }: { 
    onSchedule: (task: any) => void; 
    onCancel: () => void; 
  }) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskCategory, setTaskCategory] = useState("Work");
    const [taskPriority, setTaskPriority] = useState("Medium");
    const [scheduledTime, setScheduledTime] = useState("09:00");

    // Generate next 7 days for quick selection
    const quickDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

    // Get scheduled tasks from the task manager
    const scheduledTasks = tasks?.filter(task => task.scheduledDate) || [];

    const handleSchedule = () => {
      if (!selectedDate || !taskTitle.trim()) return;

      const [hours, minutes] = scheduledTime.split(':').map(Number);
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      const scheduledTask = {
        title: taskTitle.trim(),
        category: taskCategory,
        priority: taskPriority,
        completed: false,
        timer: null,
        youtubeUrl: null,
        scheduledDate: scheduledDateTime,
      };

      onSchedule(scheduledTask);
      // Reset form
      setSelectedDate(null);
      setTaskTitle("");
      setTaskCategory("Work");
      setTaskPriority("Medium");
      setScheduledTime("09:00");
    };

    return (
      <div className="space-y-4 p-2">
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Scheduled ({scheduledTasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="task-title" className="text-sm font-medium">Task Title</label>
              <Input
                id="task-title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Enter task title..."
                className="w-full"
              />
            </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="task-category" className="text-sm font-medium">Category</label>
            <Select value={taskCategory} onValueChange={setTaskCategory}>
              <SelectTrigger className="w-full">
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
          
          <div className="space-y-2">
            <label htmlFor="task-priority" className="text-sm font-medium">Priority</label>
            <Select value={taskPriority} onValueChange={setTaskPriority}>
              <SelectTrigger className="w-full">
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Choose Date from Calendar</label>
          <div className="border rounded-lg p-2 bg-muted/30">
            <CalendarWidget
              mode="single"
              selected={selectedDate || undefined}
              onSelect={(date) => setSelectedDate(date || null)}
              disabled={(date) => isBefore(date, startOfDay(new Date()))}
              className="rounded-md border-0 w-full"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                month: "space-y-4 w-full",
                caption: "flex justify-center pt-1 relative items-center w-full",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex w-full",
                head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] text-center",
                row: "flex w-full mt-2",
                cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
                day: "h-10 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                day_range_end: "day-range-end",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
          </div>
        </div>

        {selectedDate && (
          <div className="space-y-2">
            <label htmlFor="scheduled-time" className="text-sm font-medium">Time</label>
            <Input
              id="scheduled-time"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full"
            />
          </div>
        )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSchedule}
                disabled={!selectedDate || !taskTitle.trim()}
                className="bg-primary hover:bg-primary/80"
              >
                Schedule Task
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4 mt-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Your Scheduled Tasks
              </h3>
              
              {scheduledTasks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No scheduled tasks yet</p>
                  <p className="text-xs">Create your first scheduled task using the "New Task" tab</p>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {scheduledTasks
                    .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())
                    .map((task) => (
                      <div
                        key={task.id}
                        className="p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-sm truncate pr-2">{task.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.priority === 'High' ? 'bg-red-100 text-red-800' :
                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded">
                            {task.category}
                          </span>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(task.scheduledDate!), 'MMM d, yyyy • h:mm a')}
                          </div>
                        </div>
                        {task.completed && (
                          <div className="mt-1 text-xs text-green-600 font-medium">
                            ✓ Completed
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
              
              <div className="flex justify-end pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Close
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Navigation Menu */}
        <div className="border-t border-border pt-4 mt-4">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" size="sm" asChild className="justify-start h-8">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            
            <Button variant="ghost" size="sm" asChild className="justify-start h-8">
              <Link href="/achievements">
                <Trophy className="h-4 w-4 mr-2" />
                Achievements
              </Link>
            </Button>
            
            <Button variant="ghost" size="sm" asChild className="justify-start h-8">
              <Link href="/statistics">
                <BarChart2 className="h-4 w-4 mr-2" />
                Statistics
              </Link>
            </Button>
            
            <Button variant="ghost" size="sm" asChild className="justify-start h-8">
              <Link href="/charts">
                <BarChart3 className="h-4 w-4 mr-2" />
                Charts
              </Link>
            </Button>
            
            <Button variant="ghost" size="sm" asChild className="justify-start h-8">
              <Link href="/calendar">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Link>
            </Button>
            
            <Button variant="ghost" size="sm" asChild className="justify-start h-8">
              <Link href="/admin">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="mb-0 bg-card border-2 border-green-500 shadow-lg shadow-green-500/20">
      <CardContent className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <LightbulbIcon className="text-primary text-xl mr-2" />
            <h2 className="text-lg font-medium">
              {isFormMinimized ? "Quick Add Task" : "AI Suggestions"}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => setIsFormMinimized(!isFormMinimized)}
            aria-label={isFormMinimized ? "Expand form" : "Minimize form"}
          >
            {isFormMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
        </div>
        
        {!isFormMinimized && (
          <AIAssistant onSelectSuggestion={(suggestion) => {
            form.setValue("title", suggestion);
            // Auto-submit the form when a suggestion is selected
            setTimeout(() => {
              form.handleSubmit(onSubmit)();
            }, 100); // Small delay to ensure the form value is set
          }} />
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <div className="relative flex items-center">
                    <FormControl>
                      <Input 
                        placeholder="Add a new task..." 
                        className="bg-background border border-border py-3 px-4 pr-40 w-full focus:ring-primary focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <div className="absolute right-3 flex space-x-2">
                      <TemplateSelector />
                      <Dialog open={showCalendarPopup} onOpenChange={setShowCalendarPopup}>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="p-1.5 rounded-md border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                            aria-label="Schedule task on calendar"
                            title="Schedule on Calendar"
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center">
                              <Calendar className="mr-2 h-5 w-5" />
                              Schedule & View Tasks
                            </DialogTitle>
                          </DialogHeader>
                          <CalendarSchedulePopup 
                            onSchedule={(scheduledTask) => {
                              createTask(scheduledTask);
                              setShowCalendarPopup(false);
                            }}
                            onCancel={() => setShowCalendarPopup(false)}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="p-1.5 rounded-md bg-green-500/20 border-green-500 text-green-600 hover:bg-green-500 hover:text-white transition-all duration-200"
                        aria-label="Add checklist to task"
                        title="Add Checklist"
                        onClick={() => setShowChecklistDialog(true)}
                      >
                        <ListChecks className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary/80 text-primary-foreground p-1.5 rounded-md"
                        size="icon"
                        aria-label="Add task"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </FormItem>
              )}
            />
            
            {/* Show Advanced Options button - only when not expanded for minimal interface */}
            {!isFormMinimized && !isAdvancedExpanded && (
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-primary"
                  onClick={() => setIsAdvancedExpanded(true)}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  More Options
                </Button>
              </div>
            )}
            
            {/* Advanced Options - Fixed redundant condition */}
            {!isFormMinimized && isAdvancedExpanded && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">More Options</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-muted-foreground hover:text-primary"
                    onClick={() => setIsAdvancedExpanded(false)}
                  >
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Hide
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                  {/* Timer option */}
                  <div className="flex items-center space-x-2 p-2 border border-border rounded-md bg-background/50">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm">Timer (minutes)</span>
                    <Button
                      type="button"
                      variant={timerActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimerActive(!timerActive)}
                    >
                      {timerActive ? "On" : "Off"}
                    </Button>
                  </div>

                  {/* YouTube option */}
                  <div className="flex items-center space-x-2 p-2 border border-border rounded-md bg-background/50">
                    <Video className="h-4 w-4 text-primary" />
                    <span className="text-sm">YouTube Link</span>
                    <Button
                      type="button"
                      variant={videoActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setVideoActive(!videoActive)}
                    >
                      {videoActive ? "On" : "Off"}
                    </Button>
                  </div>

                  {/* Recurring option */}
                  <div className="flex items-center space-x-2 p-2 border border-border rounded-md bg-background/50">
                    <Repeat className="h-4 w-4 text-primary" />
                    <span className="text-sm">Recurring</span>
                    <Button
                      type="button"
                      variant={recurringActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRecurringActive(!recurringActive)}
                    >
                      {recurringActive ? "On" : "Off"}
                    </Button>
                  </div>

                  {/* Project Timeline option for Pert/Gantt charts */}
                  <div className="flex items-center space-x-2 p-2 border border-border rounded-md bg-background/50">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span className="text-sm">Project Timeline</span>
                    <Button
                      type="button"
                      variant={timelineActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimelineActive(!timelineActive)}
                      data-testid="button-timeline-toggle"
                    >
                      {timelineActive ? "On" : "Off"}
                    </Button>
                  </div>
                </div>

                {/* Timeline Date/Time Pickers */}
                {timelineActive && (
                  <div className="space-y-4 p-4 border border-border rounded-md bg-background/50 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Set Start & End Times for Pert/Gantt Charts</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Start Date/Time */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date & Time</label>
                        <div className="space-y-2">
                          <CalendarWidget
                            mode="single"
                            selected={startDate || undefined}
                            onSelect={(date) => setStartDate(date || null)}
                            className="rounded-md border"
                            data-testid="calendar-start-date"
                          />
                          <Input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full"
                            data-testid="input-start-time"
                          />
                        </div>
                      </div>

                      {/* End Date/Time */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Date & Time</label>
                        <div className="space-y-2">
                          <CalendarWidget
                            mode="single"
                            selected={projectEndDate || undefined}
                            onSelect={(date) => setProjectEndDate(date || null)}
                            disabled={(date) => startDate ? isBefore(date, startDate) : false}
                            className="rounded-md border"
                            data-testid="calendar-end-date"
                          />
                          <Input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full"
                            data-testid="input-end-time"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {startDate && projectEndDate && !isBefore(projectEndDate, startDate) && (
                      <div className="text-xs text-muted-foreground">
                        Duration: {Math.round((projectEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </form>
        </Form>

        {/* Bottom Options Section - Collapsible like AI section */}
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Settings className="text-primary text-xl mr-2" />
              <h3 className="text-lg font-medium">
                {isBottomOptionsMinimized ? "Task Options" : "Categories, Priorities & More"}
              </h3>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => setIsBottomOptionsMinimized(!isBottomOptionsMinimized)}
              aria-label={isBottomOptionsMinimized ? "Expand options" : "Minimize options"}
            >
              {isBottomOptionsMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
          </div>
          
          {!isBottomOptionsMinimized && (
            <Form {...form}>
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                {/* Category and Priority Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-muted-foreground">Category</FormLabel>
                    <div className="flex space-x-2">
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background border border-border flex-1">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-50">
                          {allCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Dialog open={showCustomCategoryDialog} onOpenChange={setShowCustomCategoryDialog}>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="bg-background border border-border hover:bg-accent"
                            aria-label="Manage categories"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="flex items-center">
                              <Tag className="mr-2 h-5 w-5" />
                              Manage Categories
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            {/* Add new category section */}
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-muted-foreground">Add New Category</h4>
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="Enter category name..."
                                  value={newCustomCategory}
                                  onChange={(e) => setNewCustomCategory(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddCustomCategory();
                                    }
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  onClick={handleAddCustomCategory}
                                  disabled={!newCustomCategory.trim() || allCategories.includes(newCustomCategory.trim())}
                                  size="sm"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add
                                </Button>
                              </div>
                            </div>

                            {/* Existing categories section */}
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-muted-foreground">Existing Categories</h4>
                              <div className="max-h-60 overflow-y-auto space-y-1">
                                {allCategories.map((category) => (
                                  <div key={category} className="flex items-center space-x-2 p-2 rounded-md border">
                                    {editingCategory === category ? (
                                      <>
                                        <Input
                                          value={editCategoryName}
                                          onChange={(e) => setEditCategoryName(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              handleEditCategory(category, editCategoryName);
                                            }
                                            if (e.key === 'Escape') {
                                              cancelEditing();
                                            }
                                          }}
                                          className="flex-1 text-sm"
                                          autoFocus
                                        />
                                        <Button
                                          onClick={() => handleEditCategory(category, editCategoryName)}
                                          size="sm"
                                          variant="ghost"
                                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                        >
                                          ✓
                                        </Button>
                                        <Button
                                          onClick={cancelEditing}
                                          size="sm"
                                          variant="ghost"
                                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                        >
                                          ✕
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <span className="flex-1 text-sm">{category}</span>
                                        <Button
                                          onClick={() => startEditingCategory(category)}
                                          size="sm"
                                          variant="ghost"
                                          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                        >
                                          <Edit2 className="h-3 w-3" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setNewCustomCategory("");
                                  setShowCustomCategoryDialog(false);
                                  cancelEditing();
                                }}
                              >
                                Close
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-muted-foreground">Priority</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background border border-border">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-50">
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
                </div>
                
                {/* Timer and YouTube Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="timer"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="flex items-center text-sm font-medium text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Timer (optional)</span>
                        </FormLabel>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="99"
                              placeholder="25" 
                              className="bg-background border border-border w-20 text-center"
                              {...field} 
                            />
                          </FormControl>
                          <span className="text-muted-foreground text-sm">min</span>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="youtubeUrl"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="flex items-center text-sm font-medium text-muted-foreground">
                          <Video className="h-4 w-4 mr-1" />
                          <span>YouTube Video (optional)</span>
                        </FormLabel>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Input 
                              type="url" 
                              placeholder="https://youtube.com/watch?v=..." 
                              className="bg-background border border-border"
                              {...field} 
                            />
                          </FormControl>
                          <Button 
                            type="button" 
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                            onClick={() => setVideoActive(!videoActive)}
                          >
                            <Video className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Recurring Task Section */}
                <div className="space-y-4">
                  <Separator />
                  <FormField
                    control={form.control}
                    name="isRecurring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center text-sm font-medium text-muted-foreground">
                            <Repeat className="h-4 w-4 mr-1" />
                            Make this task recurring
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Automatically create new instances of this task
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              setRecurringActive(checked);
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("isRecurring") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <FormField
                        control={form.control}
                        name="recurringFrequency"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-medium text-muted-foreground">Frequency</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-background border border-border">
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-50">
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="recurringInterval"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-medium text-muted-foreground">
                              Repeat every
                            </FormLabel>
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="365"
                                  placeholder="1" 
                                  className="bg-background border border-border w-20 text-center"
                                  {...field} 
                                />
                              </FormControl>
                              <span className="text-muted-foreground text-sm">
                                {form.watch("recurringFrequency") === "daily" ? "day(s)" :
                                 form.watch("recurringFrequency") === "weekly" ? "week(s)" :
                                 form.watch("recurringFrequency") === "monthly" ? "month(s)" :
                                 form.watch("recurringFrequency") === "yearly" ? "year(s)" :
                                 "period(s)"}
                              </span>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Form>
          )}
        </div>

        {/* Checklist Dialog */}
        <ChecklistDialog
          isNewTask={true}
          initialItems={checklistItems}
          onItemsChange={setChecklistItems}
          open={showChecklistDialog}
          onOpenChange={setShowChecklistDialog}
        >
          <div />
        </ChecklistDialog>

      </CardContent>
    </Card>
  );
}

export default TaskInput;
