import type { UIMessage } from "ai";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { RichTextSource } from "@/components/registry/primitives/editables/richtext";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import type { CmsProps } from "@/lib/registry/sitecore";

export type AIChatVariant =
  | "default"
  | "compact"
  | "floating-widget"
  | "hero-collapsible";

export type AIChatPosition = "inline" | "sticky-top" | "sticky-bottom";

/** Floating launcher shape — round avatar tile or wider pill with a label. */
export type AIChatLauncherShape = "round" | "pill";

/** Floating launcher fill style. Solid uses the colorScheme fill, outline is
 *  transparent with a colored border, gradient pulls the matching gradient
 *  scheme. Decoupled from `colorScheme` so brands can pick scheme + style
 *  independently. */
export type AIChatLauncherStyle = "solid" | "outline" | "gradient";

/**
 * The face the closed floating launcher renders. `avatar` (default)
 * shows the chat's Avatar image and falls back to the bot icon when the
 * Avatar is blank; `letter` shows a monogram; `bot` forces the generic
 * bot icon; `chat` is the classic chat-bubble glyph (matches the
 * icon-name@1 vocabulary's `chat`); `sparkle` is the AI-assistant
 * sparkles glyph many branded launchers use.
 */
export type AIChatLauncherIcon =
  | "avatar"
  | "letter"
  | "bot"
  | "chat"
  | "sparkle";

/**
 * Which viewport corner the floating widget pins to. Logical
 * inline-end/-start so the choice flips automatically under RTL.
 * `bottom-end` (default) is the near-universal chat-widget corner;
 * `bottom-start` is for sites whose end corner is already occupied
 * (cookie badge, back-to-top, a second widget).
 */
export type AIChatWidgetPlacement = "bottom-end" | "bottom-start";

/**
 * Floating launcher size preset. `default` is the 56px Intercom-class
 * tile; `compact` (48px) suits dense utility sites; `large` (64px)
 * suits launchers meant to read as a primary support entry point.
 * Pill heights scale accordingly.
 */
export type AIChatLauncherSize = "compact" | "default" | "large";

/**
 * Open-panel header treatment.
 *   tinted  (default) the existing low-alpha accent strip over the page
 *           background — quiet, brand-hinted.
 *   solid   full ColorScheme fill with the role's foreground text — the
 *           branded-header convention of most commercial chat widgets.
 *   plain   no accent at all; clean white/background header.
 */
export type AIChatPanelHeaderStyle = "tinted" | "solid" | "plain";

/**
 * Open-panel footprint preset. `default` is 28rem x 36rem (clamped to
 * the viewport); `compact` is the classic ~360x520 support-widget
 * panel; `tall` keeps the default width but stretches toward the
 * viewport height for content-heavy assistants.
 */
export type AIChatPanelSize = "compact" | "default" | "tall";

export type AIChatColorScheme =
  | "none"
  | "white"
  | "black"
  | "neutral"
  | "primary"
  | "primary-gradient"
  | "secondary"
  | "secondary-gradient"
  | "tertiary"
  | "accent"
  | "accent-2"
  | "accent-3"
  | "info"
  | "success"
  | "warning"
  | "destructive";

/**
 * Localizable UI strings for the chat chrome — the composer, header, message
 * thread, tool-call cards, drop overlay, new-chat confirm dialog, and floating
 * launcher. Every key is optional; anything omitted falls back to the English
 * default in `labels.ts` (`DEFAULT_LABELS`). Pass a partial object on the
 * `labels` prop to localize the surface without touching the per-instance
 * content fields (Title / Description / WelcomeMessage / …), which localize
 * through their own Sitecore language versions.
 *
 * A couple of values are templates with `{name}` / `{title}` placeholders —
 * substitute with `formatLabel()` from `labels.ts`.
 */
export interface AIChatLabels {
  // Composer
  sendLabel?: string;
  composerAriaLabel?: string;
  listeningPlaceholder?: string;
  composerHint?: string;
  listeningHint?: string;
  attachLabel?: string;
  attachHint?: string;
  startDictationLabel?: string;
  stopDictationLabel?: string;
  dictateHint?: string;
  thinkingLabel?: string;
  thinkingAriaLabel?: string;
  stopLabel?: string;
  stopHint?: string;
  sendError?: string;
  unreadableFileHint?: string;
  /** `{name}` → attachment file name. */
  removeAttachmentLabel?: string;

  // Header
  newChatLabel?: string;
  newChatAriaLabel?: string;
  closeLabel?: string;

  // Message thread
  userLabel?: string;
  assistantLabel?: string;
  copyLabel?: string;
  copiedLabel?: string;
  regenerateLabel?: string;
  helpfulLabel?: string;
  notHelpfulLabel?: string;
  responseVariantsLabel?: string;
  stepLabel?: string;
  sourceFallbackLabel?: string;
  fileFallbackLabel?: string;

  // Tool-call card
  toolRunningLabel?: string;
  toolInputLabel?: string;
  toolOutputLabel?: string;
  toolErrorLabel?: string;
  toolWaitingLabel?: string;
  toolStateCalling?: string;
  toolStateWaitingForOutput?: string;
  toolStateCompleted?: string;
  toolStateErrored?: string;
  toolStateAwaitingApproval?: string;
  toolStateApprovalResponded?: string;
  toolStateDenied?: string;

  // Hero-collapsible history toggle
  showHistoryLabel?: string;
  hideHistoryLabel?: string;

  // Drag-and-drop overlay
  dropTitle?: string;
  dropDescription?: string;

  // New-chat confirm dialog
  discardTitle?: string;
  discardDescription?: string;
  discardCancelLabel?: string;
  discardConfirmLabel?: string;

  // Floating launcher
  widgetTitleFallback?: string;
  /** `{title}` → the widget title. */
  openLauncherLabel?: string;
}

/**
 * Meta payload routed to the CDP catalog via `extensionData` / `ext`.
 * `instanceKey` and `id` are the stable matching keys for personalization.
 */
export interface AIChatAnalyticsMeta {
  id?: string;
  instanceKey?: string;
  instanceScope?: "site" | "page";
  variant?: AIChatVariant;
  model?: string;
  promptLength?: number;
  responseLength?: number;
  durationMs?: number;
  errorCode?: string;
}

/**
 * Flattened `ai-skill@1` linked item (post `flattenLinkedItems: ["Skills"]`).
 */
export interface AIChatSkill {
  id?: string;
  name?: string;
  Name?: TextSource;
  Instructions?: TextSource;
}

/**
 * Flattened `ai-context-item@1` linked item.
 */
export interface AIChatContextItem {
  id?: string;
  name?: string;
  Title?: TextSource;
  Content?: TextSource;
}

/**
 * Session-attached file. Text content lives in memory; the BFF receives only
 * the (truncated) extracted text via the composed system prompt.
 */
export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  content: string;
  unreadable?: boolean;
}

export interface AIChatProps extends CmsProps {
  title?: TextSource;
  description?: TextSource;
  placeholderText?: TextSource;
  welcomeMessage?: TextSource;
  avatar?: ImageSource;
  systemPrompt?: RichTextSource;
  searchSourceId?: TextSource;
  searchTopK?: string | number;
  skills?: AIChatSkill[];
  context?: AIChatContextItem[];
  colorScheme?: AIChatColorScheme;
  assistantName?: TextSource;
  model?: TextSource;
  temperature?: TextSource | number;
  maxTokens?: TextSource | number;
  position?: AIChatPosition;
  initialMessages?: UIMessage[];
  hideWelcome?: boolean;
  /**
   * Follow-up prompt chips rendered above the composer when the thread is
   * idle (no in-flight stream + at least one prior turn). Clicking a chip
   * submits its text as a new user message. When omitted, no suggestions row
   * renders — this is an additive affordance for the showcase / customer
   * demos that want to demonstrate conversational steering.
   */
  suggestions?: string[];
  /**
   * Localizable UI strings for the chat chrome (Send, Enter-to-send hint,
   * tooltips, aria-labels, confirm-dialog copy, …). Separate from the
   * per-instance content fields above — use it to translate the fixed chrome.
   *
   * Any subset may be supplied; omitted keys fall back to the English
   * `DEFAULT_LABELS`. The `ai-chat-ui-labels@1` Sitecore Dictionary is the
   * authoring source for the translations; a host resolves those phrases
   * (through its own i18n runtime) and feeds them in here — either by passing
   * this object, or via the optional `t` overload of `resolveLabels`. The
   * component itself takes no hard i18n dependency so it stays installable in
   * targets that don't ship one.
   */
  labels?: AIChatLabels;
  /**
   * Floating launcher options — only honored by the `floating-widget`
   * variant. Authors pick the launcher shape (round vs pill), fill
   * style (solid / outline / gradient), launcher face (avatar image /
   * monogram / bot icon / chat bubble / sparkles), size preset, and
   * optional label text (rendered inside the pill shape).
   */
  launcherShape?: AIChatLauncherShape;
  launcherStyle?: AIChatLauncherStyle;
  launcherIcon?: AIChatLauncherIcon;
  launcherLabel?: TextSource;
  launcherSize?: AIChatLauncherSize;
  /**
   * Viewport corner for the floating widget (launcher + panel). Logical
   * bottom-end (default) / bottom-start; flips under RTL automatically.
   * Only honored by the `floating-widget` variant.
   */
  placement?: AIChatWidgetPlacement;
  /** Open-panel header treatment — tinted (default) / solid brand fill / plain. */
  panelHeaderStyle?: AIChatPanelHeaderStyle;
  /** Open-panel footprint preset — compact / default / tall. */
  panelSize?: AIChatPanelSize;
  /**
   * Presentational initial open state for the floating widget. SSR-safe:
   * it only seeds the client `useState`, so server and client render the
   * same markup deterministically. Used by showcase previews/screenshots
   * to capture the expanded panel; not part of the Sitecore author
   * surface (real placements start closed).
   */
  defaultOpen?: boolean;
  apiEndpoint?: string;
  instanceKey?: string;
  instanceScope?: "site" | "page";
  trackEvents?: string | boolean;
  /** Persist conversation history across reloads (scope follows InstanceScope). */
  enablePersistence?: string | boolean;
  onView?: (meta: AIChatAnalyticsMeta) => void;
  onPromptSubmit?: (meta: AIChatAnalyticsMeta) => void;
  onResponseComplete?: (meta: AIChatAnalyticsMeta) => void;
  onResponseStop?: (meta: AIChatAnalyticsMeta) => void;
  onResponseError?: (meta: AIChatAnalyticsMeta) => void;
  className?: string;
}
