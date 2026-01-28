export type TaskCategory = "Work" | "Personal" | "Shopping" | "Health" | "Business" | "Other" | string;
export type TaskPriority = "Low" | "Medium" | "High";
export type RecurringFrequency = "daily" | "weekly" | "biweekly" | "monthly" | "yearly" | "custom";

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  timer?: number; // Timer duration in minutes
  youtubeUrl?: string; // Optional YouTube video URL
  notes?: string; // Optional notes for the task
  displayOrder?: number; // Order for drag and drop
  scheduledDate?: string | Date; // Calendar scheduling date
  createdAt: string;
  // Checklist items for sub-tasks within tasks
  checklistItems?: Array<{ id: string; text: string; completed: boolean }>;
  // Recurring task fields
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
  recurringInterval?: number;
  nextDueDate?: string;
  endDate?: string;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
  parentTaskId?: string;
  // Notion integration
  syncedToNotion?: boolean;
  notionPageId?: string;
  notionSyncedAt?: string;
  // Trello integration
  syncedToTrello?: boolean;
  trelloCardId?: string;
  trelloSyncedAt?: string;
  // Appointment information (if task is linked to an appointment)
  appointment?: {
    attendeeName: string;
    attendeeEmail: string;
    attendeeNotes?: string | null;
    startTime: string;
    endTime: string;
    status: string;
  };
}

export type NewTask = Omit<Task, "id" | "createdAt">;
