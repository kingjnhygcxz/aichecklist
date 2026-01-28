import { z } from "zod";
import { storage } from "../storage";

export const SendMessageArgsSchema = z.object({
  toUserId: z.number().int().optional(),
  toContactId: z.number().int().optional(),
  toEmail: z.string().email().optional(),
  subject: z.string().optional(),
  body: z.string().min(1),
  threadId: z.number().int().optional(),
});

export const ListInboxArgsSchema = z.object({
  limit: z.number().int().min(1).max(50).optional(),
  unreadOnly: z.boolean().optional(),
});

export const ReadMessageArgsSchema = z.object({
  messageId: z.number().int(),
  markRead: z.boolean().optional(),
});

export async function execSendMessage(params: {
  userId: number;
  args: unknown;
}) {
  const parsed = SendMessageArgsSchema.parse(params.args);

  let toUserId: number | null = null;

  if (parsed.toUserId) toUserId = parsed.toUserId;

  if (!toUserId && parsed.toContactId) {
    const contact = await storage.getContactById(
      params.userId,
      parsed.toContactId
    );

    if (!contact) {
      return {
        ok: false,
        needsClarification: true,
        clarificationQuestion: "I couldn't find that contact. Who should I message?",
      };
    }

    if (contact.contactUserId) {
      toUserId = contact.contactUserId;
    } else {
      return {
        ok: false,
        needsClarification: true,
        clarificationQuestion:
          `"${contact.displayName}" isn't linked to an AIChecklist account yet. Do you want to invite them (so they can receive messages)?`,
      };
    }
  }

  if (!toUserId && parsed.toEmail) {
    return {
      ok: false,
      needsClarification: true,
      clarificationQuestion:
        `I can send messages inside AIChecklist only to team members with an account. Is ${parsed.toEmail} already a user, or should we invite them?`,
    };
  }

  if (!toUserId) {
    return {
      ok: false,
      needsClarification: true,
      clarificationQuestion:
        "Who should I message? (Pick a contact or specify a team member.)",
    };
  }

  const { message: msg, thread } = await storage.sendMessage({
    fromUserId: params.userId,
    toUserId,
    subject: parsed.subject ?? null,
    body: parsed.body,
    threadId: parsed.threadId ?? null,
  });

  // Get recipient display name for clean response
  const recipient = await storage.getUser(toUserId);
  const recipientName = recipient?.fullName?.trim() || recipient?.username || recipient?.email || "user";
  const recipientTitle = contact?.title ? ` (${contact.title})` : "";

  return {
    ok: true,
    displayMessage: `✅ Sent to ${recipientName}${recipientTitle}`,
    deepLink: `/aidomo/inbox/thread/${thread.id}`,
    message: {
      id: msg.id,
      threadId: thread.id,
      toUserId: msg.toUserId,
      subject: msg.subject,
      body: msg.body,
      createdAt: msg.createdAt,
    },
  };
}

export async function execListInbox(params: {
  userId: number;
  args: unknown;
}) {
  const parsed = ListInboxArgsSchema.parse(params.args);

  const rows = await storage.listInbox(
    params.userId,
    parsed.limit ?? 25,
    parsed.unreadOnly ?? false
  );

  return {
    ok: true,
    inbox: rows.map((m) => ({
      id: m.id,
      fromUserId: m.fromUserId,
      fromDisplayName: m.fromDisplayName || m.fromUsername || `User ${m.fromUserId}`,
      subject: m.subject,
      snippet: (m.body ?? "").slice(0, 140),
      createdAt: m.createdAt,
      readAt: m.readAt,
      isUnread: !m.readAt,
      threadId: m.threadId,
      deepLink: m.threadId ? `/aidomo/inbox/thread/${m.threadId}` : `/aidomo/inbox/${m.id}`,
    })),
  };
}

export async function execReadMessage(params: {
  userId: number;
  args: unknown;
}) {
  const parsed = ReadMessageArgsSchema.parse(params.args);

  const msg = await storage.readMessage(params.userId, parsed.messageId);
  if (!msg) {
    return { ok: false, error: "Message not found." };
  }

  if (parsed.markRead) {
    await storage.markMessageRead(params.userId, parsed.messageId);
  }

  return {
    ok: true,
    message: {
      id: msg.id,
      fromUserId: msg.fromUserId,
      toUserId: msg.toUserId,
      subject: msg.subject,
      body: msg.body,
      createdAt: msg.createdAt,
      readAt: msg.readAt,
      deepLink: `/aidomo/inbox/${msg.id}`,
    },
  };
}
