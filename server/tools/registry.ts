import { z } from "zod";
import { AddContactArgsSchema, FindContactArgsSchema } from "./contacts";
import { SendMessageArgsSchema, ListInboxArgsSchema, ReadMessageArgsSchema } from "./messages";

export const ToolSchemas = {
  CREATE_TASK: z.object({
    title: z.string().min(1),
    category: z.string().default("General"),
    priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
    scheduledDate: z.string().optional(),
    scheduledTime: z.string().optional(),
    timer: z.number().optional(),
    youtubeUrl: z.string().optional(),
    needsCalendar: z.boolean().optional(),
  }),

  CREATE_CHECKLIST: z.object({
    title: z.string().min(1),
    category: z.string().optional(),
    priority: z.enum(["Low", "Medium", "High"]).optional(),
    checklistItems: z.array(z.object({
      text: z.string().min(1),
      completed: z.boolean().default(false),
    })).min(1),
  }),

  ROLLING_TASKS: z.union([
    z.object({
      tasks: z.array(z.object({
        title: z.string().min(1),
        category: z.string().optional(),
        priority: z.enum(["Low", "Medium", "High"]).optional(),
        scheduledDate: z.string().optional(),
        scheduledTime: z.string().optional(),
        timer: z.number().optional(),
      })).min(1),
    }),
    z.array(z.object({
      title: z.string().min(1),
      category: z.string().optional(),
      priority: z.enum(["Low", "Medium", "High"]).optional(),
      scheduledDate: z.string().optional(),
      scheduledTime: z.string().optional(),
      timer: z.number().optional(),
    })).min(1),
  ]),

  PRINT_REQUEST: z.union([
    z.literal("conversation"),
    z.literal("todo_list"),
    z.literal("checklist"),
    z.literal("template_list"),
    z.literal("stats_dashboard"),
    z.literal("high_priority_tasks"),
    z.literal("work_tasks"),
    z.literal("personal_tasks"),
    z.literal("shopping_tasks"),
    z.literal("health_tasks"),
  ]),

  SUMMARIZE_REQUEST: z.object({
    mode: z.enum(["summary", "accessible", "highlights", "pdf", "full"]).default("summary"),
    url: z.string().url(),
  }),

  TEMPLATE_REQUEST: z.object({
    template_name: z.string().min(1),
  }),

  HIGH_PRIORITY_REQUEST: z.object({
    value: z.boolean(),
  }),

  SHARE_SCHEDULE: z.object({
    recipient: z.string().min(1),
    permission: z.enum(["view", "edit", "full"]),
    shareType: z.string().optional(),
    message: z.string().optional(),
  }),

  WEEKLY_REPORT_REQUEST: z.object({
    timeframe: z.enum(["this_week", "last_week", "last_7_days"]).default("this_week"),
    includeCategories: z.boolean().default(true),
    includeAppointments: z.boolean().default(true),
    maxItemsPerSection: z.number().int().min(1).max(50).default(10),
  }),

  ADD_CONTACT: AddContactArgsSchema,
  FIND_CONTACT: FindContactArgsSchema,
  SEND_MESSAGE: SendMessageArgsSchema,
  LIST_INBOX: ListInboxArgsSchema,
  READ_MESSAGE: ReadMessageArgsSchema,
} as const;

export type ToolName = keyof typeof ToolSchemas;

export function isValidToolName(name: string): name is ToolName {
  return name in ToolSchemas;
}

export function getSchema(name: ToolName) {
  return ToolSchemas[name];
}
