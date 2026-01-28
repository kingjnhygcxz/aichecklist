import { z } from "zod";
import { storage } from "../storage";

export const ListThreadNotificationsArgsSchema = z.object({
  limit: z.number().int().min(1).max(50).optional(),
  unreadOnly: z.boolean().optional(),
});

export async function execListThreadNotifications(params: {
  userId: number;
  args: unknown;
}) {
  const parsed = ListThreadNotificationsArgsSchema.parse(params.args);
  const threads = await storage.listThreadNotifications({
    userId: params.userId,
    limit: parsed.limit ?? 20,
    unreadOnly: parsed.unreadOnly ?? true,
  });
  return { ok: true, threads };
}

export async function execUnreadThreadCount(params: {
  userId: number;
}) {
  const unreadThreadCount = await storage.getUnreadThreadNotificationCount(params.userId);
  return { ok: true, unreadThreadCount };
}
