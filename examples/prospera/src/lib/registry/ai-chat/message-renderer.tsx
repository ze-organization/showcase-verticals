"use client";

import type { UIMessage } from "ai";
import { Copy, FileText, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/registry/primitives/ai-elements/chatbot/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageBranch,
  MessageBranchContent,
  MessageBranchNext,
  MessageBranchPage,
  MessageBranchPrevious,
  MessageBranchSelector,
  MessageContent,
  MessageResponse,
} from "@/components/registry/primitives/ai-elements/chatbot/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/registry/primitives/ai-elements/chatbot/reasoning";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/registry/primitives/ai-elements/chatbot/sources";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import { NextImage } from "@/components/registry/primitives/editables/image";
import { cn } from "@/lib/registry/cn";
import { WELCOME_MESSAGE_ID } from "./constants";
import { DEFAULT_LABELS, type ResolvedAIChatLabels } from "./labels";
import { ToolPart } from "./tool-part";
import type { AssistantBranchSnapshot } from "./use-chat-controller";

interface MessageRendererProps {
  messages: UIMessage[];
  isStreaming: boolean;
  /**
   * Localizable chrome strings (labels, action tooltips, tool-call copy).
   * Defaults to the English label set when omitted, so the renderer can be
   * used standalone; the chat variants always pass a fully-resolved set.
   */
  labels?: ResolvedAIChatLabels;
  assistantLabel?: ReactNode;
  userLabel?: ReactNode;
  className?: string;
  viewportClassName?: string;
  assistantBubbleClass?: string;
  assistantIconClass?: string;
  assistantAvatarSrc?: string;
  /**
   * Per-assistant-id snapshot of older replies. When a slot has ≥ 1 sibling,
   * the row wraps in <MessageBranch> so the operator can flip between the
   * live response and its prior siblings. See `useChatController.branches`.
   */
  branches?: Record<string, AssistantBranchSnapshot[]>;
  /**
   * Wire-up for the per-assistant regenerate action. When omitted, the
   * regenerate icon is hidden entirely (e.g. preview-only contexts that don't
   * carry a controller).
   */
  onRegenerate?: (assistantMessageId: string) => void;
}

/**
 * Renders a UIMessage[] thread using AI Elements primitives (Conversation,
 * Message, MessageResponse, Reasoning, Sources). Auto-stick-to-bottom comes
 * from `<Conversation>` (use-stick-to-bottom under the hood); replaces the
 * older `ScrollArea` + manual scrollIntoView pattern.
 *
 * Per-part mapping:
 *   - text          → <MessageResponse> (Streamdown w/ cjk/code/math/mermaid)
 *   - tool-<name>   → <ToolPart> (project-specific; AI Elements <Tool> can
 *                     replace this in a follow-up)
 *   - dynamic-tool  → <ToolPart>
 *   - reasoning     → <Reasoning>/<ReasoningTrigger>/<ReasoningContent>
 *   - source-url    → aggregated into <Sources>
 *   - source-document → aggregated into <Sources>
 *   - file          → file chip (kept inline; no AI Elements analogue)
 *   - step-start    → small divider
 *   - data-*        → ignored
 */
export function MessageRenderer({
  messages,
  isStreaming,
  labels = DEFAULT_LABELS,
  assistantLabel = labels.assistantLabel,
  userLabel = labels.userLabel,
  className,
  viewportClassName,
  assistantBubbleClass,
  assistantIconClass,
  assistantAvatarSrc,
  branches,
  onRegenerate,
}: MessageRendererProps) {
  const visible = messages.filter((m) => m.role !== "system");
  return (
    <Conversation
      className={cn(
        "min-h-56 w-full rounded-lg border bg-background",
        className,
      )}
      // Conversation already carries `role="log"` via the underlying
      // primitive. Explicit `aria-live="polite"` ensures all ATs
      // announce streaming chunks (some browsers don't apply the
      // implicit live-region from role=log). `aria-busy` mirrors the
      // streaming state so AT users know to wait for content.
      aria-live="polite"
      aria-busy={isStreaming || undefined}
    >
      <ConversationContent
        className={cn("space-y-3 p-3 sm:p-4", viewportClassName)}
      >
        {visible.map((message, index) => (
          <MessageRow
            key={message.id}
            message={message}
            isLast={index === visible.length - 1}
            isStreaming={isStreaming}
            labels={labels}
            assistantLabel={assistantLabel}
            userLabel={userLabel}
            assistantBubbleClass={assistantBubbleClass}
            assistantIconClass={assistantIconClass}
            assistantAvatarSrc={assistantAvatarSrc}
            siblingBranches={branches?.[message.id]}
            onRegenerate={onRegenerate}
          />
        ))}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}

interface MessageRowProps {
  message: UIMessage;
  isLast: boolean;
  isStreaming: boolean;
  labels: ResolvedAIChatLabels;
  assistantLabel?: ReactNode;
  userLabel?: ReactNode;
  assistantBubbleClass?: string;
  assistantIconClass?: string;
  assistantAvatarSrc?: string;
  /** Older sibling responses for this assistant slot. */
  siblingBranches?: AssistantBranchSnapshot[];
  onRegenerate?: (assistantMessageId: string) => void;
}

function MessageRow({
  message,
  isLast,
  isStreaming,
  labels,
  assistantLabel,
  userLabel,
  assistantBubbleClass,
  assistantIconClass,
  assistantAvatarSrc,
  siblingBranches,
  onRegenerate,
}: MessageRowProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const label = isUser ? userLabel : assistantLabel;
  const streaming = isStreaming && isAssistant && isLast;
  const parts = message.parts ?? [];

  if (isUser) {
    const text = collectText(parts);
    return (
      <Message from="user">
        <div className="flex items-center gap-1.5 self-end text-[11px] uppercase tracking-wide opacity-60">
          <span className="font-medium">{label}</span>
        </div>
        <MessageContent>
          <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
        </MessageContent>
      </Message>
    );
  }

  const sources = parts.filter(
    (p) => p.type === "source-url" || p.type === "source-document",
    // biome-ignore lint/suspicious/noExplicitAny: discriminated union extends in SDK
  ) as any[];

  const liveBody = (
    <MessageContent>
      {parts.map((part, index) =>
        renderAssistantPart(
          part,
          `${message.id}-${index}`,
          streaming && index === parts.length - 1,
          labels,
        ),
      )}
      {sources.length > 0 ? (
        <SourceList sources={sources} labels={labels} />
      ) : null}
      <FileList parts={parts} labels={labels} />
    </MessageContent>
  );

  // MessageBranch is opt-in per the AI Elements contract — we only wrap when
  // the operator has triggered at least one regenerate for this slot. The
  // live response is always the LAST branch so the default `currentBranch`
  // points to it (operators move backward through history with the
  // previous arrow).
  const siblingCount = siblingBranches?.length ?? 0;
  const hasBranches = siblingCount > 0;
  const branchedBody = hasBranches ? (
    <MessageBranch defaultBranch={siblingCount}>
      <MessageBranchContent>
        {[
          ...(siblingBranches ?? []).map((snapshot) => (
            <BranchSnapshotBody key={snapshot.id} text={snapshot.text} />
          )),
          <div key={`${message.id}-live`}>{liveBody}</div>,
        ]}
      </MessageBranchContent>
      <MessageBranchSelector
        className="self-start"
        aria-label={labels.responseVariantsLabel}
      >
        <MessageBranchPrevious />
        <MessageBranchPage />
        <MessageBranchNext />
      </MessageBranchSelector>
    </MessageBranch>
  ) : (
    liveBody
  );

  // Show actions for assistant replies that have finished streaming. The
  // welcome bubble has no preceding user prompt, so regenerate is hidden
  // there (otherwise we'd re-stream against an empty context).
  const showActions = !streaming && collectText(parts).trim().length > 0;
  const canRegenerate =
    Boolean(onRegenerate) && message.id !== WELCOME_MESSAGE_ID;

  return (
    <Message from="assistant">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full",
            assistantBubbleClass,
          )}
        >
          {assistantAvatarSrc ? (
            // `unoptimized`: avatars are author-supplied CDN URLs, outside the
            // next/image remote-pattern allowlist.
            <NextImage
              value={{ src: assistantAvatarSrc, alt: "" }}
              alt=""
              width={28}
              height={28}
              unoptimized
              className="size-full object-cover"
            />
          ) : (
            <LibraryIcon
              name="bot"
              className={cn("size-3.5", assistantIconClass)}
              aria-hidden
            />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide opacity-60">
            <span className="font-medium">{label}</span>
          </div>
          {branchedBody}
          {showActions ? (
            <AssistantActions
              message={message}
              canRegenerate={canRegenerate}
              labels={labels}
              onRegenerate={
                canRegenerate ? () => onRegenerate?.(message.id) : undefined
              }
            />
          ) : null}
        </div>
      </div>
    </Message>
  );
}

/**
 * Per-snapshot body rendered inside <MessageBranchContent>. The primitive
 * wants children with a stable `key` prop — wrapping each branch in its own
 * component gives us that and isolates the visibility toggle.
 */
function BranchSnapshotBody({ text }: { text: string }) {
  return (
    <MessageContent>
      <div className="text-sm leading-relaxed">
        <MessageResponse>{text}</MessageResponse>
      </div>
    </MessageContent>
  );
}

interface AssistantActionsProps {
  message: UIMessage;
  canRegenerate: boolean;
  labels: ResolvedAIChatLabels;
  onRegenerate?: () => void;
}

function AssistantActions({
  message,
  canRegenerate,
  labels,
  onRegenerate,
}: AssistantActionsProps) {
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  const handleCopy = useCallback(async () => {
    const text = collectText(message.parts).trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard denied (rare; iframes, insecure contexts). Swallow silently —
      // a noisy toast for a soft failure isn't worth the extra dependency.
    }
  }, [message.parts]);

  return (
    <MessageActions className="ms-0 mt-1 text-muted-foreground">
      <MessageAction
        tooltip={copied ? labels.copiedLabel : labels.copyLabel}
        onClick={handleCopy}
        className="text-muted-foreground hover:text-foreground"
      >
        <Copy className="size-3.5" aria-hidden />
      </MessageAction>
      {canRegenerate ? (
        <MessageAction
          tooltip={labels.regenerateLabel}
          onClick={onRegenerate}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="size-3.5" aria-hidden />
        </MessageAction>
      ) : null}
      <MessageAction
        tooltip={labels.helpfulLabel}
        onClick={() => setVote((current) => (current === "up" ? null : "up"))}
        className={cn(
          "text-muted-foreground hover:text-foreground",
          vote === "up" && "text-primary",
        )}
      >
        <ThumbsUp className="size-3.5" aria-hidden />
      </MessageAction>
      <MessageAction
        tooltip={labels.notHelpfulLabel}
        onClick={() =>
          setVote((current) => (current === "down" ? null : "down"))
        }
        className={cn(
          "text-muted-foreground hover:text-foreground",
          vote === "down" && "text-destructive",
        )}
      >
        <ThumbsDown className="size-3.5" aria-hidden />
      </MessageAction>
    </MessageActions>
  );
}

function renderAssistantPart(
  // biome-ignore lint/suspicious/noExplicitAny: discriminated union from AI SDK; handled via runtime checks
  part: any,
  key: string,
  showCursor: boolean,
  labels: ResolvedAIChatLabels,
): ReactNode {
  const type: string = part?.type ?? "";

  if (type === "text") {
    return (
      <div key={key} className="text-sm leading-relaxed">
        <MessageResponse>{part.text ?? ""}</MessageResponse>
        {showCursor ? (
          <span className="ms-1 inline-block animate-pulse text-current opacity-60">
            |
          </span>
        ) : null}
      </div>
    );
  }

  if (type === "reasoning") {
    return (
      <Reasoning key={key} isStreaming={showCursor}>
        <ReasoningTrigger />
        <ReasoningContent>{part.text ?? ""}</ReasoningContent>
      </Reasoning>
    );
  }

  if (
    type === "dynamic-tool" ||
    (typeof type === "string" && type.startsWith("tool-"))
  ) {
    const name: string =
      part.toolName ?? (type.startsWith("tool-") ? type.slice(5) : "tool");
    return (
      <ToolPart
        key={key}
        name={name}
        state={part.state ?? "input-available"}
        input={part.input}
        output={part.output}
        errorText={part.errorText}
        labels={labels}
      />
    );
  }

  if (type === "step-start") {
    return (
      <div
        key={key}
        className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wide"
      >
        <span className="h-px flex-1 bg-border" />
        <span>{labels.stepLabel}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    );
  }

  return null;
}

function collectText(parts: UIMessage["parts"]): string {
  let out = "";
  for (const part of parts ?? []) {
    if (part.type === "text") out += part.text;
  }
  return out;
}

function SourceList({
  sources,
  labels,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: discriminated union extends in SDK
  sources: any[];
  labels: ResolvedAIChatLabels;
}) {
  return (
    <Sources>
      <SourcesTrigger count={sources.length} />
      <SourcesContent>
        {sources.map((source, index) => {
          const isUrl = source.type === "source-url";
          const href: string | undefined = isUrl
            ? typeof source.url === "string"
              ? source.url
              : undefined
            : undefined;
          const title: string =
            source.title ??
            source.url ??
            source.sourceId ??
            labels.sourceFallbackLabel;
          const key = source.url ?? source.sourceId ?? `src-${index}`;
          return <Source key={key} href={href ?? "#"} title={title} />;
        })}
      </SourcesContent>
    </Sources>
  );
}

function FileList({
  parts,
  labels,
}: {
  parts: UIMessage["parts"];
  labels: ResolvedAIChatLabels;
}) {
  const files = (parts ?? []).filter(
    (p) => p.type === "file",
    // biome-ignore lint/suspicious/noExplicitAny: discriminated union extends in SDK
  ) as any[];
  if (files.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {files.map((file, index) => (
        <span
          key={file.url ?? file.filename ?? `file-${index}`}
          className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2 py-0.5 text-xs"
        >
          <FileText className="size-3" aria-hidden />
          <span className="max-w-[14rem] truncate">
            {file.filename ?? file.url ?? labels.fileFallbackLabel}
          </span>
        </span>
      ))}
    </div>
  );
}
