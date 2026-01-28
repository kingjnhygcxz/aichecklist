import type { MultiPlan, PlannedStep, ToolName } from "./multiActionPlanner";

export type ToolResult =
  | {
      ok: true;
      tool: ToolName;
      data: unknown;
      message?: string;
    }
  | {
      ok: false;
      tool: ToolName;
      error: string;
      needsClarification?: boolean;
      clarificationQuestion?: string;
    };

export type ExecuteToolFn = (step: PlannedStep) => Promise<ToolResult>;

export type RunPlanOptions = {
  dryRun?: boolean;
  stopOnError?: boolean;
};

export type RunPlanOutcome =
  | {
      status: "done";
      results: ToolResult[];
      dryRun: boolean;
    }
  | {
      status: "blocked";
      results: ToolResult[];
      dryRun: boolean;
      question: string;
    }
  | {
      status: "partial";
      results: ToolResult[];
      dryRun: boolean;
    };

export async function runPlanSequential(
  plan: MultiPlan,
  execTool: ExecuteToolFn,
  opts: RunPlanOptions = {}
): Promise<RunPlanOutcome> {
  const dryRun = !!opts.dryRun;
  const stopOnError = opts.stopOnError ?? false;

  const results: ToolResult[] = [];

  for (const step of plan.steps) {
    if (dryRun) {
      results.push({
        ok: true,
        tool: step.tool,
        data: { wouldExecute: true, args: step.args, sourceText: step.sourceText },
        message: `[DRY RUN] Would execute ${step.tool}`,
      });
      continue;
    }

    const r = await execTool(step);
    results.push(r);

    if (!r.ok && r.needsClarification) {
      return {
        status: "blocked",
        results,
        dryRun,
        question:
          r.clarificationQuestion ||
          "I need one detail before I can continue. Can you clarify?",
      };
    }

    if (!r.ok && stopOnError) {
      return { status: "partial", results, dryRun };
    }
  }

  const anyErrors = results.some(r => !r.ok);
  if (anyErrors) return { status: "partial", results, dryRun };
  return { status: "done", results, dryRun };
}

export function formatPlanResults(results: ToolResult[]): string {
  return results
    .map((r) => {
      if (r.ok) {
        const msg = r.message || `Completed: ${r.tool}`;
        return `✅ ${msg}`;
      }
      return `⚠️ ${r.tool}: ${r.error}`;
    })
    .join("\n");
}
