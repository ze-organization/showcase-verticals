"use client";

import { Wrench } from "lucide-react";
import { Spinner } from "@/components/registry/primitives/core/spinner";
import { cn } from "@/lib/registry/cn";
import type { ResolvedAIChatLabels } from "./labels";

type ToolState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "output-error"
  | "approval-requested"
  | "approval-responded"
  | "output-denied";

interface ToolPartProps {
  /** Tool name. Extracted from `tool-<name>` parts or the `toolName` field of dynamic-tool parts. */
  name: string;
  state: ToolState | string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  /** Localizable chrome strings (state labels, Input/Output/Error/Waiting). */
  labels: ResolvedAIChatLabels;
}

const STATE_BADGE_STYLES: Record<string, string> = {
  "input-streaming": "border-info/40 bg-info/10 text-info",
  "input-available": "border-info/40 bg-info/10 text-info",
  "output-available": "border-success/40 bg-success/10 text-success",
  "output-error": "border-destructive/40 bg-destructive/10 text-destructive",
  "approval-requested": "border-warning/40 bg-warning/10 text-warning",
  "approval-responded": "border-info/40 bg-info/10 text-info",
  "output-denied": "border-muted/40 bg-muted text-muted-foreground",
};

/** Map a tool state to its localized badge label. */
function stateLabel(
  state: string,
  labels: ResolvedAIChatLabels,
): string | undefined {
  switch (state) {
    case "input-streaming":
      return labels.toolStateCalling;
    case "input-available":
      return labels.toolStateWaitingForOutput;
    case "output-available":
      return labels.toolStateCompleted;
    case "output-error":
      return labels.toolStateErrored;
    case "approval-requested":
      return labels.toolStateAwaitingApproval;
    case "approval-responded":
      return labels.toolStateApprovalResponded;
    case "output-denied":
      return labels.toolStateDenied;
    default:
      return undefined;
  }
}

function formatJson(value: unknown): string {
  if (value === undefined || value === null) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/**
 * Renders a single tool-call message part (static `tool-<name>` or
 * `dynamic-tool`) as a collapsible card sitting above the assistant text.
 *
 * Shows the tool name, a state pill, and a `<details>` body with input JSON
 * + output JSON or the error text. Streaming states get a spinner; output
 * states are open by default so the user can see the result without
 * clicking.
 */
export function ToolPart({
  name,
  state,
  input,
  output,
  errorText,
  labels,
}: ToolPartProps) {
  const badgeClass =
    STATE_BADGE_STYLES[state] ?? STATE_BADGE_STYLES["input-available"];
  const label = stateLabel(state, labels) ?? state;
  const isStreaming = state === "input-streaming";
  const hasOutput = state === "output-available" || state === "output-error";
  const inputJson = formatJson(input);
  const outputJson = formatJson(output);

  return (
    <details
      open={hasOutput || isStreaming}
      className="group rounded-lg border bg-muted/30 text-xs"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2">
        <Wrench className="size-3.5 text-muted-foreground" aria-hidden />
        <span className="font-medium">{name}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-1.5 py-0 text-[10px]",
            badgeClass,
          )}
        >
          {isStreaming ? (
            <Spinner
              size="sm"
              colorScheme="primary"
              aria-label={labels.toolRunningLabel}
            />
          ) : null}
          {label}
        </span>
        <span className="ms-auto text-[10px] text-muted-foreground/70 transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="space-y-2 border-border/60 border-t px-3 py-2">
        {inputJson ? (
          <div>
            <div className="mb-1 text-[10px] text-muted-foreground uppercase tracking-wide">
              {labels.toolInputLabel}
            </div>
            <pre className="whitespace-pre-wrap break-words rounded bg-background/60 p-2 font-mono text-[11px]">
              {inputJson}
            </pre>
          </div>
        ) : null}
        {errorText ? (
          <div>
            <div className="mb-1 text-[10px] text-destructive uppercase tracking-wide">
              {labels.toolErrorLabel}
            </div>
            <pre className="whitespace-pre-wrap break-words rounded bg-destructive/5 p-2 font-mono text-[11px] text-destructive">
              {errorText}
            </pre>
          </div>
        ) : null}
        {outputJson && !errorText ? (
          <div>
            <div className="mb-1 text-[10px] text-muted-foreground uppercase tracking-wide">
              {labels.toolOutputLabel}
            </div>
            <pre className="whitespace-pre-wrap break-words rounded bg-background/60 p-2 font-mono text-[11px]">
              {outputJson}
            </pre>
          </div>
        ) : null}
        {!inputJson && !outputJson && !errorText ? (
          <div className="text-muted-foreground">{labels.toolWaitingLabel}</div>
        ) : null}
      </div>
    </details>
  );
}
