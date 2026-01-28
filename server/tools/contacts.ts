import { z } from "zod";
import { storage } from "../storage";

export const AddContactArgsSchema = z.object({
  displayName: z.string().min(1),
  email: z.string().email(),
  title: z.string().optional(),
  department: z.string().optional(),
  aliases: z.array(z.string().min(1)).optional(),
});

export const FindContactArgsSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(25).optional(),
});

export async function execAddContact(params: {
  userId: number;
  args: unknown;
}) {
  const parsed = AddContactArgsSchema.parse(params.args);

  const aliasesCsv = (parsed.aliases ?? [])
    .map((s) => s.trim())
    .filter(Boolean)
    .join(",");

  const contact = await storage.addContact({
    ownerUserId: params.userId,
    displayName: parsed.displayName,
    email: parsed.email.toLowerCase(),
    title: parsed.title ?? null,
    department: parsed.department ?? null,
    aliasesCsv,
  });

  return {
    ok: true,
    contact: {
      id: contact.id,
      displayName: contact.displayName,
      email: contact.email,
      title: contact.title,
      department: contact.department,
      linkedUserId: contact.contactUserId ?? null,
    },
  };
}

export async function execFindContact(params: {
  userId: number;
  args: unknown;
}) {
  const parsed = FindContactArgsSchema.parse(params.args);

  const matches = await storage.findContacts(
    params.userId,
    parsed.query,
    parsed.limit ?? 10
  );

  return {
    ok: true,
    matches: matches.map((c) => ({
      id: c.id,
      displayName: c.displayName,
      email: c.email,
      title: c.title,
      department: c.department,
      linkedUserId: c.contactUserId ?? null,
    })),
  };
}
