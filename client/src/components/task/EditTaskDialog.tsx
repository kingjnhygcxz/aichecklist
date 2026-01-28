import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Task } from "@/types";
import { useTaskManager } from "@/hooks/useTaskManager";
import { format, addDays } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pencil, Calendar, Settings, User, Mail, MessageSquare } from "lucide-react";

// Form schema
const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  priority: z.enum(["Low", "Medium", "High"]),
  timer: z.union([z.number().min(0), z.null()]).optional().nullable(),
  notes: z.string().optional(),
  scheduledDate: z.date().optional().nullable(),
  scheduledTime: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTaskDialogProps {
  task: Task;
}

export function EditTaskDialog({ task }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const { updateTask } = useTaskManager();
  const [activeTab, setActiveTab] = useState("general");
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    task.scheduledDate ? new Date(task.scheduledDate) : null
  );

  // Initialize form with task data - use lazy initialization to prevent re-renders
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title,
      category: task.category,
      priority: task.priority,
      timer: task.timer,
      notes: task.notes || "",
      scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : null,
      scheduledTime: task.scheduledDate ? format(new Date(task.scheduledDate), 'HH:mm') : "09:00",
    },
  });
  
  // Reset form when dialog opens to get latest task data
  useEffect(() => {
    if (open) {
      form.reset({
        title: task.title,
        category: task.category,
        priority: task.priority,
        timer: task.timer,
        notes: task.notes || "",
        scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : null,
        scheduledTime: task.scheduledDate ? format(new Date(task.scheduledDate), 'HH:mm') : "09:00",
      });
      setSelectedDate(task.scheduledDate ? new Date(task.scheduledDate) : null);
    }
  }, [open, task, form]);

  const onSubmit = async (data: FormValues) => {
    // Handle scheduled date/time
    let scheduledDateTime = null;
    if (selectedDate && data.scheduledTime) {
      const [hours, minutes] = data.scheduledTime.split(':').map(Number);
      scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);
    }

    // Convert null to undefined for timer if needed
    // Convert empty notes string to undefined to preserve appointment notes
    const updatedData = {
      ...data,
      timer: data.timer === null ? undefined : data.timer,
      notes: data.notes?.trim() === '' ? undefined : data.notes,
      scheduledDate: scheduledDateTime,
    };
    
    // Call the updateTask mutation
    await updateTask(task.id, updatedData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          aria-label="Edit task"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["Work", "Personal", "Shopping", "Health", "Other"].map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["Low", "Medium", "High"].map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timer (minutes, optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="25" 
                      {...field}
                      value={field.value === null ? '' : field.value}
                      onChange={e => {
                        const value = e.target.value;
                        field.onChange(value === '' ? null : parseInt(value, 10));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add notes about this task..." 
                      className="min-h-[100px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {task.appointment && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                <h3 className="font-semibold text-green-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  APPOINTMENT DETAILS
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-green-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-700">Attendee:</span>
                      <p className="text-gray-900">{task.appointment.attendeeName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-green-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p className="text-gray-900">{task.appointment.attendeeEmail}</p>
                    </div>
                  </div>
                  {task.appointment.attendeeNotes && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-green-700 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="inline-block px-2 py-0.5 bg-green-600 text-white text-xs font-semibold rounded mb-2">
                          NOTES
                        </div>
                        <div className="max-h-[200px] overflow-y-auto p-3 bg-white border border-green-200 rounded-md">
                          <p className="text-gray-900 whitespace-pre-wrap text-sm leading-relaxed">{task.appointment.attendeeNotes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

              </TabsContent>

              <TabsContent value="schedule" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {selectedDate ? "Current Schedule" : "Add Schedule"}
                    </Label>
                    {selectedDate && (
                      <div className="text-sm text-muted-foreground mb-3 p-2 bg-muted rounded">
                        Scheduled for: {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {form.watch("scheduledTime") || "09:00"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Quick Date Selection</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)).map((date, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant={selectedDate && date.toDateString() === selectedDate.toDateString() ? "default" : "outline"}
                          size="sm"
                          className="text-xs p-2 h-auto flex flex-col"
                          onClick={() => setSelectedDate(date)}
                        >
                          <span className="font-medium">{format(date, 'EEE')}</span>
                          <span>{format(date, 'MMM d')}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {selectedDate && (
                    <FormField
                      control={form.control}
                      name="scheduledTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              className="w-full"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedDate && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedDate(null);
                        form.setValue("scheduledTime", "09:00");
                      }}
                    >
                      Remove Schedule
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EditTaskDialog;