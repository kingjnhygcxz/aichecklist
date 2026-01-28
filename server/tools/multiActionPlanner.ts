import { z } from "zod";

export type ToolName =
  | "CREATE_TASK"
  | "CREATE_CHECKLIST"
  | "ROLLING_TASKS"
  | "PRINT_REQUEST"
  | "SUMMARIZE_REQUEST"
  | "TEMPLATE_REQUEST"
  | "HIGH_PRIORITY_REQUEST"
  | "SHARE_SCHEDULE";

export type PlannedStep = {
  tool: ToolName;
  args: unknown;
  sourceText: string;
};

export type MultiPlan = {
  mode: "single" | "multi";
  steps: PlannedStep[];
  meta: {
    usedLabels: boolean;
    segments: Array<{ kind: string; text: string }>;
  };
};

export type Segment = {
  kind: "calendar" | "todolist" | "checklist" | "unknown";
  text: string;
};

const LABEL_ALIASES: Record<string, Segment["kind"]> = {
  calendar: "calendar",
  cal: "calendar",
  schedule: "calendar",
  appointment: "calendar",

  todo: "todolist",
  "to-do": "todolist",
  todolist: "todolist",
  "todo list": "todolist",
  tasks: "todolist",

  checklist: "checklist",
  check: "checklist",
};

function normalize(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

function hasAnyLabels(text: string) {
  const t = text.toLowerCase();
  return (
    t.includes("calendar:") ||
    t.includes("todo:") ||
    t.includes("todolist:") ||
    t.includes("checklist:")
  );
}

export function splitByLabels(text: string): Segment[] {
  const lower = text.toLowerCase();

  const labelRegex = /\b(calendar|todo|todolist|checklist)\s*:\s*/gi;

  const matches: Array<{ label: string; index: number; end: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = labelRegex.exec(lower)) !== null) {
    matches.push({ label: m[1], index: m.index, end: labelRegex.lastIndex });
  }

  if (matches.length === 0) {
    return [{ kind: "unknown", text: normalize(text) }].filter(s => s.text.length > 0);
  }

  const segments: Segment[] = [];
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const next = matches[i + 1];
    const segmentText = text.slice(cur.end, next ? next.index : text.length);
    const kind = LABEL_ALIASES[cur.label.toLowerCase()] ?? "unknown";
    const clean = normalize(segmentText);
    if (clean) segments.push({ kind, text: clean });
  }

  return segments.length ? segments : [{ kind: "unknown", text: normalize(text) }];
}

export function splitByConnectors(text: string): Segment[] {
  const raw = text;

  const normalized = raw
    .replace(/\b(and\s+also|then\s+also|after\s+that|next)\b/gi, " then ")
    .replace(/\bthen\b/gi, " then ")
    .replace(/\balso\b/gi, " then ")
    .replace(/\.\s+/g, " then ")
    .replace(/\n+/g, " then ");

  const parts = normalized
    .split(/\bthen\b/gi)
    .map(p => normalize(p))
    .filter(Boolean);

  return parts.map((p) => {
    const l = p.toLowerCase();
    if (/\b(checklist)\b/.test(l)) return { kind: "checklist" as const, text: p };
    if (/\b(todo|to-do|todolist|todo list|tasks)\b/.test(l)) return { kind: "todolist" as const, text: p };
    if (/\b(calendar|schedule|appointment)\b/.test(l)) return { kind: "calendar" as const, text: p };
    return { kind: "unknown" as const, text: p };
  });
}

export type ClassifySegmentFn = (input: {
  segmentText: string;
  hintKind: Segment["kind"];
  fullText: string;
}) => Promise<{ tool: ToolName; args: unknown }>;

export async function planMultiAction(params: {
  userText: string;
  classifySegment: ClassifySegmentFn;
  maxSteps?: number;
}): Promise<MultiPlan> {
  const { userText, classifySegment } = params;
  const maxSteps = params.maxSteps ?? 5;

  const usedLabels = hasAnyLabels(userText);
  const segments = usedLabels ? splitByLabels(userText) : splitByConnectors(userText);

  const cappedSegments = segments.slice(0, maxSteps);

  const steps: PlannedStep[] = [];
  for (const seg of cappedSegments) {
    if (!seg.text.trim()) continue;

    const { tool, args } = await classifySegment({
      segmentText: seg.text,
      hintKind: seg.kind,
      fullText: userText,
    });

    steps.push({
      tool,
      args,
      sourceText: seg.text,
    });
  }

  return {
    mode: steps.length > 1 ? "multi" : "single",
    steps,
    meta: {
      usedLabels,
      segments: cappedSegments.map(s => ({ kind: s.kind, text: s.text })),
    },
  };
}
