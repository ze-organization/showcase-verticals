import type { AIChatLabels } from "./types";

/**
 * Fully-resolved label set — every key present. Sub-components consume this
 * shape; the public {@link AIChatLabels} lets callers override any subset.
 */
export type ResolvedAIChatLabels = Required<AIChatLabels>;

/**
 * English defaults for every localizable UI string in the chat chrome.
 *
 * These are the strings that were previously hardcoded across the composer,
 * header, message thread, drop overlay, new-chat confirm dialog, and floating
 * launcher. Keeping them here (rather than inline) is what makes the whole
 * component localizable: a caller passes a partial `labels` object and the
 * rest fall back to these values.
 *
 * A handful carry `{name}` / `{title}` placeholders — substitute with
 * {@link formatLabel} at the call site.
 */
export const DEFAULT_LABELS: ResolvedAIChatLabels = {
  // ---- Composer ----
  sendLabel: "Send",
  composerAriaLabel: "Chat message",
  listeningPlaceholder: "Listening…",
  composerHint: "Enter to send · Shift+Enter for newline",
  listeningHint: "Listening — click the mic to stop.",
  attachLabel: "Attach files",
  attachHint: "Attach files for context",
  startDictationLabel: "Start dictation",
  stopDictationLabel: "Stop dictation",
  dictateHint: "Speak to type",
  thinkingLabel: "Assistant is thinking…",
  thinkingAriaLabel: "Assistant is thinking",
  stopLabel: "Stop",
  stopHint: "Stop (Esc)",
  sendError:
    "Couldn't send your message. Try again, or refresh the page if it keeps failing.",
  unreadableFileHint: "Picked up, but this file type isn't read as text yet.",
  /** `{name}` → attachment file name. */
  removeAttachmentLabel: "Remove {name}",

  // ---- Header ----
  newChatLabel: "New chat",
  newChatAriaLabel: "Start a new chat",
  closeLabel: "Close AI chat",

  // ---- Message thread ----
  userLabel: "You",
  assistantLabel: "Assistant",
  copyLabel: "Copy",
  copiedLabel: "Copied",
  regenerateLabel: "Regenerate",
  helpfulLabel: "Helpful",
  notHelpfulLabel: "Not helpful",
  responseVariantsLabel: "Response variants",
  stepLabel: "Step",
  sourceFallbackLabel: "Source",
  fileFallbackLabel: "File",

  // ---- Tool-call card ----
  toolRunningLabel: "Tool running",
  toolInputLabel: "Input",
  toolOutputLabel: "Output",
  toolErrorLabel: "Error",
  toolWaitingLabel: "Waiting…",
  toolStateCalling: "Calling…",
  toolStateWaitingForOutput: "Waiting for output…",
  toolStateCompleted: "Completed",
  toolStateErrored: "Errored",
  toolStateAwaitingApproval: "Awaiting approval",
  toolStateApprovalResponded: "Approval responded",
  toolStateDenied: "Denied",

  // ---- Hero-collapsible history toggle ----
  showHistoryLabel: "Show history",
  hideHistoryLabel: "Hide history",

  // ---- Drag-and-drop overlay ----
  dropTitle: "Drop files to attach",
  dropDescription: "They'll be added as context for the next turn.",

  // ---- New-chat confirm dialog ----
  discardTitle: "Discard this conversation?",
  discardDescription:
    "This will clear every message in the current chat. The page won't reload, but anything you've discussed here will be gone.",
  discardCancelLabel: "Keep chatting",
  discardConfirmLabel: "Start a new chat",

  // ---- Floating launcher ----
  widgetTitleFallback: "AI Assistant",
  /** `{title}` → the widget title. */
  openLauncherLabel: "Open {title}",
};

/**
 * Sitecore Dictionary phrase key for each label. Keys are stable identifiers
 * shared with the `ai-chat-ui-labels@1` dictionary recipe — renaming one here
 * means renaming the matching phrase there (and vice-versa). The `ai-chat-`
 * prefix namespaces these against `core-ui-labels@1` and any other dictionary
 * merged into the same runtime `lngDict`.
 */
export const LABEL_DICTIONARY_KEYS: Record<keyof ResolvedAIChatLabels, string> =
  {
    sendLabel: "ai-chat-send",
    composerAriaLabel: "ai-chat-composer-aria",
    listeningPlaceholder: "ai-chat-listening-placeholder",
    composerHint: "ai-chat-composer-hint",
    listeningHint: "ai-chat-listening-hint",
    attachLabel: "ai-chat-attach",
    attachHint: "ai-chat-attach-hint",
    startDictationLabel: "ai-chat-start-dictation",
    stopDictationLabel: "ai-chat-stop-dictation",
    dictateHint: "ai-chat-dictate-hint",
    thinkingLabel: "ai-chat-thinking",
    thinkingAriaLabel: "ai-chat-thinking-aria",
    stopLabel: "ai-chat-stop",
    stopHint: "ai-chat-stop-hint",
    sendError: "ai-chat-send-error",
    unreadableFileHint: "ai-chat-unreadable-file",
    removeAttachmentLabel: "ai-chat-remove-attachment",
    newChatLabel: "ai-chat-new-chat",
    newChatAriaLabel: "ai-chat-new-chat-aria",
    closeLabel: "ai-chat-close",
    userLabel: "ai-chat-user",
    assistantLabel: "ai-chat-assistant",
    copyLabel: "ai-chat-copy",
    copiedLabel: "ai-chat-copied",
    regenerateLabel: "ai-chat-regenerate",
    helpfulLabel: "ai-chat-helpful",
    notHelpfulLabel: "ai-chat-not-helpful",
    responseVariantsLabel: "ai-chat-response-variants",
    stepLabel: "ai-chat-step",
    sourceFallbackLabel: "ai-chat-source",
    fileFallbackLabel: "ai-chat-file",
    toolRunningLabel: "ai-chat-tool-running",
    toolInputLabel: "ai-chat-tool-input",
    toolOutputLabel: "ai-chat-tool-output",
    toolErrorLabel: "ai-chat-tool-error",
    toolWaitingLabel: "ai-chat-tool-waiting",
    toolStateCalling: "ai-chat-tool-calling",
    toolStateWaitingForOutput: "ai-chat-tool-waiting-output",
    toolStateCompleted: "ai-chat-tool-completed",
    toolStateErrored: "ai-chat-tool-errored",
    toolStateAwaitingApproval: "ai-chat-tool-awaiting-approval",
    toolStateApprovalResponded: "ai-chat-tool-approval-responded",
    toolStateDenied: "ai-chat-tool-denied",
    showHistoryLabel: "ai-chat-show-history",
    hideHistoryLabel: "ai-chat-hide-history",
    dropTitle: "ai-chat-drop-title",
    dropDescription: "ai-chat-drop-description",
    discardTitle: "ai-chat-discard-title",
    discardDescription: "ai-chat-discard-description",
    discardCancelLabel: "ai-chat-discard-cancel",
    discardConfirmLabel: "ai-chat-discard-confirm",
    widgetTitleFallback: "ai-chat-widget-title",
    openLauncherLabel: "ai-chat-open-launcher",
  };

/**
 * A translate function shaped like the host dictionary's `t`. Returns the
 * localized phrase for a key, or an empty string / the key itself when the
 * key is absent from the active locale's dictionary.
 */
export type TranslateFn = (key: string) => string | undefined;

/**
 * Resolve the full label set with three layers of precedence, lowest first:
 *
 *   1. English `DEFAULT_LABELS`.
 *   2. Sitecore Dictionary phrases, when a `t` (the host's next-intl
 *      translate) is passed —
 *      each `LABEL_DICTIONARY_KEYS[key]` is looked up and, if the active locale
 *      defines it, overrides the default. A missing phrase (empty string, or
 *      `t` echoing the key back) is ignored so English shows through.
 *   3. Explicit `partial` overrides from the `labels` prop — a caller who
 *      passes a string wins over both the dictionary and the default.
 *
 * Only string values override, so callers can safely spread a sparse object.
 */
export function resolveLabels(
  partial?: AIChatLabels,
  t?: TranslateFn,
): ResolvedAIChatLabels {
  if (!partial && !t) return DEFAULT_LABELS;
  const merged: ResolvedAIChatLabels = { ...DEFAULT_LABELS };

  if (t) {
    for (const key of Object.keys(merged) as (keyof ResolvedAIChatLabels)[]) {
      const dictKey = LABEL_DICTIONARY_KEYS[key];
      const phrase = t(dictKey);
      // Guard against `t` echoing the key back for a missing phrase (some
      // rosetta-family versions do) so we never render "ai-chat-send".
      if (
        typeof phrase === "string" &&
        phrase.length > 0 &&
        phrase !== dictKey
      ) {
        merged[key] = phrase;
      }
    }
  }

  if (partial) {
    for (const key of Object.keys(partial) as (keyof AIChatLabels)[]) {
      const value = partial[key];
      if (typeof value === "string") merged[key] = value;
    }
  }

  return merged;
}

/**
 * Substitute `{token}` placeholders in a label template. Unknown tokens are
 * left intact so a mis-keyed override is visible rather than silently blank.
 *
 * @example formatLabel("Remove {name}", { name: "notes.txt" }) // "Remove notes.txt"
 */
export function formatLabel(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const value = vars[key];
    return value === undefined ? `{${key}}` : value;
  });
}
