import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { RecurringFrequency, TaskCategory, TaskPriority } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

interface RecurringTaskFormProps {
  open: boolean;
  onClose: () => void;
}

export function RecurringTaskForm({ open, onClose }: RecurringTaskFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Task details state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("Other");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  
  // Recurring settings state
  const [frequency, setFrequency] = useState<RecurringFrequency>("daily");
  const [interval, setInterval] = useState(1);
  const [nextDueDate, setNextDueDate] = useState<Date>(new Date());
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // Weekly recurrence settings
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  
  // Monthly recurrence settings
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  
  // Yearly recurrence settings
  const [monthOfYear, setMonthOfYear] = useState<number>(0);

  // Form control and visibility based on frequency
  const showIntervalField = ["daily", "weekly", "biweekly", "monthly", "yearly"].includes(frequency);
  const showDaysOfWeekField = frequency === "weekly" || frequency === "biweekly";
  const showDayOfMonthField = frequency === "monthly";
  const showMonthOfYearField = frequency === "yearly";

  // Handle days of week toggling
  const toggleDayOfWeek = (day: number) => {
    setDaysOfWeek(current => 
      current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day]
    );
  };

  // Create recurring task mutation
  const createRecurringTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const res = await apiRequest("POST", "/api/recurring-tasks", taskData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Recurring task created successfully",
      });
      onClose();
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create recurring task: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setTitle("");
    setCategory("Other");
    setPriority("Medium");
    setFrequency("daily");
    setInterval(1);
    setNextDueDate(new Date());
    setHasEndDate(false);
    setEndDate(null);
    setDaysOfWeek([]);
    setDayOfMonth(1);
    setMonthOfYear(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      title,
      category,
      priority,
      recurringFrequency: frequency,
      recurringInterval: interval,
      nextDueDate,
      endDate: hasEndDate ? endDate : null,
      daysOfWeek: showDaysOfWeekField ? daysOfWeek : undefined,
      dayOfMonth: showDayOfMonthField ? dayOfMonth : undefined,
      monthOfYear: showMonthOfYearField ? monthOfYear : undefined,
    };
    
    createRecurringTaskMutation.mutate(taskData);
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create Recurring Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Task details */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as TaskCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as TaskPriority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-3">Recurrence Settings</h3>
            
            <div className="space-y-4">
              {/* Frequency Selection */}
              <div className="space-y-2">
                <Label htmlFor="frequency">Repeat</Label>
                <Select
                  value={frequency}
                  onValueChange={(value) => setFrequency(value as RecurringFrequency)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Biweekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Interval (for daily, weekly, monthly, yearly) */}
              {showIntervalField && (
                <div className="space-y-2">
                  <Label htmlFor="interval">Every</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="interval"
                      type="number"
                      min={1}
                      value={interval}
                      onChange={e => setInterval(parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                    <span>
                      {frequency === "daily" ? "days" : 
                       frequency === "weekly" ? "weeks" : 
                       frequency === "biweekly" ? "weeks" : 
                       frequency === "monthly" ? "months" : "years"}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Days of Week (for weekly recurrence) */}
              {showDaysOfWeekField && (
                <div className="space-y-2">
                  <Label>Days of Week</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                      <div key={day} className="flex items-center space-x-2 border rounded p-2">
                        <Checkbox
                          id={`day-${index}`}
                          checked={daysOfWeek.includes(index)}
                          onCheckedChange={() => toggleDayOfWeek(index)}
                        />
                        <label
                          htmlFor={`day-${index}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Day of Month (for monthly recurrence) */}
              {showDayOfMonthField && (
                <div className="space-y-2">
                  <Label htmlFor="dayOfMonth">Day of Month</Label>
                  <Input
                    id="dayOfMonth"
                    type="number"
                    min={1}
                    max={31}
                    value={dayOfMonth}
                    onChange={e => setDayOfMonth(parseInt(e.target.value) || 1)}
                  />
                </div>
              )}
              
              {/* Month of Year (for yearly recurrence) */}
              {showMonthOfYearField && (
                <div className="space-y-2">
                  <Label htmlFor="monthOfYear">Month</Label>
                  <Select
                    value={monthOfYear.toString()}
                    onValueChange={(value) => setMonthOfYear(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {["January", "February", "March", "April", "May", "June", "July", 
                        "August", "September", "October", "November", "December"].map((month, index) => (
                        <SelectItem key={month} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Next Due Date Picker */}
              <div className="space-y-2">
                <Label htmlFor="nextDueDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {nextDueDate ? format(nextDueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={nextDueDate}
                      onSelect={(date) => date && setNextDueDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* End Date Toggle and Picker */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasEndDate"
                    checked={hasEndDate}
                    onCheckedChange={(checked) => setHasEndDate(!!checked)}
                  />
                  <Label htmlFor="hasEndDate" className="cursor-pointer">
                    Set end date
                  </Label>
                </div>
                
                {hasEndDate && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick an end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate || undefined}
                        onSelect={(date) => setEndDate(date || null)}
                        initialFocus
                        disabled={(date) => date < nextDueDate}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="mt-2"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createRecurringTaskMutation.isPending}
              className="mt-2"
            >
              {createRecurringTaskMutation.isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}