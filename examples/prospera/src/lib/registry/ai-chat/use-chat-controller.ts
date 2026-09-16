"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import { useComponentAnalytics } from "@/lib/registry/analytics/use-component-analytics";
import {
  composeSystemPrompt,
  getMessageText,
  getRichTextAsPlainText,
  isEnabled,
  toFiniteNumber,
} from "./compose";
import { WELCOME_MESSAGE_ID } from "./constants";
import type { AIChatAnalyticsMeta, AIChatProps, AIChatVariant } from "./types";
import type { UseAttachmentsResult } from "./use-attachments";
import { useChatHistory } from "./use-history";
import { usePageContext } from "./use-page-context";

/**
 * Per-assistant-message branch snapshot. Stored when the operator triggers
 * regenerate so the prior response stays browsable through the
 * <MessageBranch> chrome. The "live" branch is always whatever the AI SDK
 * currently has in `messages` — these snapshots are the older siblings.
 */
export interface AssistantBranchSnapshot {
  /** Stable per-snapshot id; used as the React key. */
  id: string;
  /** Plain-text rendering of the assistant reply at snapshot time. */
  text: string;
}

interface UseChatControllerResult {
  /** Resolved enum value from the Variant rendering param. */
  resolvedVariant: AIChatVariant;
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  error: Error | undefined;
  isStreaming: boolean;
  hasUserMessage: boolean;
  /** True only when there's at least one user message OR a non-welcome assistant message. */
  hasContent: boolean;
  handleSubmit: (value: string) => void;
  handleStop: () => void;
  handleNewChat: () => void;
  /**
   * Re-stream the assistant reply for the given assistant message id. Captures
   * the current reply as a sibling branch first so the operator can flip back
   * to it through <MessageBranch>. Falls back to regenerating the last reply
   * when no id is supplied.
   */
  handleRegenerate: (assistantMessageId?: string) => void;
  /**
   * Fire the `widget-opened` engagement event. Called by the
   * floating-widget variant when the launcher button is clicked.
   * No-op when trackEvents is off or the event has already fired
   * once in this session.
   */
  handleWidgetOpened: () => void;
  /**
   * Per-assistant-id snapshot map. Keyed by the assistant message id that
   * "owns" the slot — value is the list of older replies the operator can
   * flip back to. The live reply is NOT in this map (it lives in `messages`).
   */
  branches: Record<string, AssistantBranchSnapshot[]>;
  /** Bound to the root element of each variant so the view event observer attaches. */
  rootRef: React.RefObject<HTMLDivElement | null>;
}

interface UseChatControllerOptions {
  props: AIChatProps;
  attachments: UseAttachmentsResult;
  /**
   * The Sitecore-side rendering variant the caller is rendering. Used
   * for analytics meta + (in card.tsx) layout decisions. Passed
   * directly by each exported variant in `ai-chat.tsx` — no longer
   * read from a rendering parameter, because the variant identity IS
   * the exported function name.
   */
  variant: AIChatVariant;
  /**
   * Recipe name the CDP catalog is keyed under for this placement.
   * Defaults to `"ai-chat"` (the card variants). The floating widget
   * ships as its own component/recipe, so it passes `"ai-chat-widget"`
   * to attribute its events to that recipe.
   */
  analyticsComponentName?: string;
}

export function useChatController({
  props,
  attachments,
  variant,
  analyticsComponentName = "ai-chat",
}: UseChatControllerOptions): UseChatControllerResult {
  const {
    title,
    systemPrompt,
    searchSourceId,
    searchTopK,
    skills,
    context,
    model,
    temperature,
    maxTokens,
    initialMessages,
    apiEndpoint = "/api/ai-chat",
    instanceKey,
    instanceScope = "site",
    trackEvents,
    enablePersistence,
    onView,
    onPromptSubmit,
    onResponseComplete,
    onResponseStop,
    onResponseError,
    id,
    isEditing,
  } = props;

  const resolvedVariant = variant;
  const systemPromptText = getRichTextAsPlainText(systemPrompt);
  const modelText = getSourceText(model);
  const pageContext = usePageContext();

  // Seed messages: caller-provided > empty. The welcome message used
  // to be seeded as an assistant turn so it'd render in-thread, but
  // the pre-user-message state is now owned by the `EmptyState`
  // component (avatar + welcome + suggestion chips) — keeping a seed
  // welcome would double up. Authors that want a true assistant-first
  // turn can pass `initialMessages` explicitly.
  const seedMessages = useMemo<UIMessage[]>(
    () => initialMessages ?? [],
    [initialMessages],
  );

  const composedSystem = useMemo(
    () =>
      composeSystemPrompt(
        systemPromptText,
        pageContext,
        skills,
        context,
        attachments.attachedFiles,
      ),
    [systemPromptText, pageContext, skills, context, attachments.attachedFiles],
  );

  const searchSourceIdText = getSourceText(searchSourceId);
  const transport = useMemo(() => {
    const temperatureNumber =
      typeof temperature === "number"
        ? temperature
        : toFiniteNumber(getSourceText(temperature));
    const maxTokensNumber =
      typeof maxTokens === "number"
        ? maxTokens
        : toFiniteNumber(getSourceText(maxTokens));
    const searchTopKNumber = toFiniteNumber(searchTopK);
    const body: Record<string, unknown> = {};
    if (composedSystem) body.system = composedSystem;
    if (modelText) body.model = modelText;
    if (temperatureNumber != null) body.temperature = temperatureNumber;
    if (maxTokensNumber != null) body.maxTokens = maxTokensNumber;
    if (searchSourceIdText) body.searchSourceId = searchSourceIdText;
    if (searchTopKNumber != null) body.searchTopK = searchTopKNumber;
    return new DefaultChatTransport({ api: apiEndpoint, body });
  }, [
    apiEndpoint,
    composedSystem,
    modelText,
    temperature,
    maxTokens,
    searchSourceIdText,
    searchTopK,
  ]);

  // Analytics wiring matches the alert-banner convention. Explicit overrides
  // bypass the catalog (and still fire even when trackEvents is off — only
  // the catalog path is gated).
  const analytics = useComponentAnalytics<AIChatAnalyticsMeta>(
    analyticsComponentName,
  );
  const eventsEnabled = isEnabled(trackEvents);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hasFiredViewRef = useRef(false);
  const turnStartRef = useRef<number | null>(null);

  // Three-stage engagement funnel: widget-opened → conversation-started
  // → conversation-deepened. Each fires once per session via ref gates.
  // The "deepened" signal requires a completed response between two
  // user prompts — spamming submit before any answer arrives doesn't
  // count as deepening the conversation.
  const hasFiredOpenedRef = useRef(false);
  const hasFiredStartedRef = useRef(false);
  const hasFiredDeepenedRef = useRef(false);
  const responseCompletedSinceLastPromptRef = useRef(false);

  const baseMeta = useMemo<AIChatAnalyticsMeta>(() => {
    const titleTextValue = getSourceText(title);
    return {
      id,
      instanceKey: instanceKey || titleTextValue || id,
      instanceScope,
      variant: resolvedVariant,
      model: modelText,
    };
  }, [id, instanceKey, instanceScope, resolvedVariant, modelText, title]);

  const {
    messages,
    sendMessage,
    stop,
    status,
    error,
    setMessages,
    regenerate,
  } = useChat({
    transport,
    messages: seedMessages,
    onFinish: ({ message }) => {
      const responseLength = getMessageText(message).length;
      const durationMs =
        turnStartRef.current != null
          ? performance.now() - turnStartRef.current
          : undefined;
      turnStartRef.current = null;
      // A successful response means the next user prompt can fire
      // conversation-deepened — they're responding to something.
      responseCompletedSinceLastPromptRef.current = true;
      // CDP-side response-complete fire dropped (the engagement funnel
      // captures it via the prompt-deepened signal instead). The
      // onResponseComplete consumer callback still fires — it's a
      // component API independent of CDP.
      if (onResponseComplete) {
        onResponseComplete({ ...baseMeta, responseLength, durationMs });
      }
    },
    onError: (err) => {
      // User stops abort with AbortError — already handled by handleStop.
      const code = err?.name || "Error";
      if (code === "AbortError") return;
      // CDP-side response-error fire dropped during the migration.
      // Consumer callback still fires.
      if (onResponseError) {
        onResponseError({ ...baseMeta, errorCode: err?.message || code });
      }
    },
  });

  const isStreaming = status === "submitted" || status === "streaming";
  const hasUserMessage = useMemo(
    () => messages.some((message) => message.role === "user"),
    [messages],
  );
  const hasContent = useMemo(
    () =>
      messages.some(
        (message) =>
          message.role === "user" ||
          (message.role === "assistant" && message.id !== WELCOME_MESSAGE_ID),
      ),
    [messages],
  );

  const handleSubmit = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || isStreaming) return;
      turnStartRef.current = performance.now();

      // Three-stage engagement funnel — see ai-chat.recipe.ts events
      // block for the marketing-story rationale. Refs gate each fire
      // to once-per-session.
      //
      //   First prompt          → conversation-started
      //   Subsequent prompt
      //     AFTER a response    → conversation-deepened (once)
      //     before any response → no fire (spam-clicks don't count)
      if (eventsEnabled) {
        if (!hasFiredStartedRef.current) {
          hasFiredStartedRef.current = true;
          analytics.fire("conversation-started", baseMeta);
        } else if (
          responseCompletedSinceLastPromptRef.current &&
          !hasFiredDeepenedRef.current
        ) {
          hasFiredDeepenedRef.current = true;
          analytics.fire("conversation-deepened", baseMeta);
        }
      }
      // Reset the response-completed gate so the next deepened check
      // requires a fresh response cycle.
      responseCompletedSinceLastPromptRef.current = false;

      // Consumer callback still fires — component API independent of CDP.
      if (onPromptSubmit) {
        onPromptSubmit({ ...baseMeta, promptLength: trimmed.length });
      }

      sendMessage({ text: trimmed });
    },
    [
      isStreaming,
      sendMessage,
      eventsEnabled,
      analytics,
      baseMeta,
      onPromptSubmit,
    ],
  );

  /**
   * Fires `widget-opened` the first time the operator opens the
   * floating chat widget in this session. The floating-widget variant
   * calls this from its launcher click handler; other variants don't
   * need it (their chat panel is visible by default).
   */
  const handleWidgetOpened = useCallback(() => {
    if (!eventsEnabled) return;
    if (hasFiredOpenedRef.current) return;
    hasFiredOpenedRef.current = true;
    analytics.fire("widget-opened", baseMeta);
  }, [eventsEnabled, analytics, baseMeta]);

  // Per-assistant-id snapshot store. We capture the current reply text BEFORE
  // calling `regenerate` — the AI SDK trims `messages` in-place to truncate
  // the assistant turn it's about to rewrite, so anything we want to keep as
  // a sibling has to be snapshotted on the way in.
  const [branches, setBranches] = useState<
    Record<string, AssistantBranchSnapshot[]>
  >({});
  const branchCounterRef = useRef(0);

  const handleRegenerate = useCallback(
    (assistantMessageId?: string) => {
      if (isStreaming) return;
      // Resolve the assistant message we're rewriting. With no id, mirror
      // the SDK default of "the most recent assistant message".
      const target = assistantMessageId
        ? messages.find((message) => message.id === assistantMessageId)
        : [...messages]
            .reverse()
            .find((message) => message.role === "assistant");
      if (target?.role !== "assistant") return;

      const snapshotText = getMessageText(target).trim();
      if (snapshotText.length > 0) {
        branchCounterRef.current += 1;
        const snapshot: AssistantBranchSnapshot = {
          id: `${target.id}-branch-${branchCounterRef.current}`,
          text: snapshotText,
        };
        setBranches((previous) => ({
          ...previous,
          [target.id]: [...(previous[target.id] ?? []), snapshot],
        }));
      }

      regenerate({ messageId: target.id }).catch((err: unknown) => {
        // CDP-side response-error fire dropped during the migration.
        // Consumer callback still fires.
        if (err instanceof Error && err.name === "AbortError") return;
        const code =
          err instanceof Error ? err.message || err.name : "regenerate-error";
        if (onResponseError) {
          onResponseError({ ...baseMeta, errorCode: code });
        }
      });
    },
    [isStreaming, messages, regenerate, baseMeta, onResponseError],
  );

  const handleStop = useCallback(() => {
    const lastMessage = messages[messages.length - 1];
    const inflightText =
      lastMessage?.role === "assistant" ? getMessageText(lastMessage) : "";
    const durationMs =
      turnStartRef.current != null
        ? performance.now() - turnStartRef.current
        : undefined;
    turnStartRef.current = null;
    stop();
    // CDP-side response-stop fire dropped during the migration —
    // user-initiated stop is captured as the absence of a deepened
    // signal. Consumer callback still fires.
    if (onResponseStop) {
      onResponseStop({
        ...baseMeta,
        responseLength: inflightText.length,
        durationMs,
      });
    }
  }, [messages, stop, baseMeta, onResponseStop]);

  // Persistence — keyed on instanceKey or id, scope follows InstanceScope.
  // Skipped when the caller controls seed messages explicitly.
  const persistenceKey = instanceKey || id;
  const persistenceEnabled =
    isEnabled(enablePersistence) && !initialMessages && !isEditing;
  const { reset: resetHistory } = useChatHistory({
    key: persistenceKey,
    scope: instanceScope,
    enabled: persistenceEnabled,
    messages,
    status,
    setMessages,
    seedMessages,
  });

  const handleNewChat = useCallback(() => {
    if (isStreaming) stop();
    resetHistory();
    attachments.resetAttachments();
    setBranches({});
    turnStartRef.current = null;
  }, [isStreaming, stop, resetHistory, attachments]);

  // Fire `view` once when the panel is >= 50% visible. Routed
  // through the SDK pageView() via the catalog's cdpEventType:
  // "VIEW". onView consumer callback fires alongside as a component
  // API. Skipped in editing mode.
  useEffect(() => {
    if (isEditing) return;
    if (!eventsEnabled && !onView) return;
    if (hasFiredViewRef.current) return;
    const node = rootRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") return;

    const fireView = () => {
      hasFiredViewRef.current = true;
      if (onView) onView(baseMeta);
      else if (eventsEnabled) analytics.fire("view", baseMeta);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (hasFiredViewRef.current) return;
        const crossed = entries.some(
          (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5,
        );
        if (!crossed) return;
        fireView();
        observer.disconnect();
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isEditing, onView, eventsEnabled, analytics, baseMeta]);

  return {
    resolvedVariant,
    messages,
    status,
    error,
    isStreaming,
    hasUserMessage,
    hasContent,
    handleSubmit,
    handleStop,
    handleNewChat,
    handleRegenerate,
    handleWidgetOpened,
    branches,
    rootRef,
  };
}

export type { UseChatControllerResult };
