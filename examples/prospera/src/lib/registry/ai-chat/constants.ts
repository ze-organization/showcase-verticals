import type {
  AIChatColorScheme,
  AIChatLauncherSize,
  AIChatPanelSize,
  AIChatPosition,
  AIChatWidgetPlacement,
} from "./types";

export const WELCOME_MESSAGE_ID = "assistant-welcome";

export const DEFAULT_TITLE = "AI Chat";
export const DEFAULT_DESCRIPTION = "Ask questions and get quick guidance.";
export const DEFAULT_PLACEHOLDER = "Ask a question about this page...";
export const DEFAULT_WELCOME =
  "Hi, I am here to help. Ask me anything about content, products, or navigation.";

export const ATTACHMENT_TEXT_LIMIT = 500_000;
export const ATTACHMENT_FILE_SIZE_LIMIT = 50_000_000;
export const ATTACHMENT_TOTAL_TEXT_LIMIT = 1_000_000;

export const PAGE_CONTEXT_BODY_LIMIT = 8_000;
export const PAGE_CONTEXT_HEADING_LIMIT = 40;
export const PAGE_CONTEXT_META_LIMIT = 30;
export const PAGE_CONTEXT_QUERY_VALUE_LIMIT = 200;

export const POSITION_CLASSES: Record<AIChatPosition, string> = {
  inline: "",
  "sticky-top": "sticky top-0 z-40",
  "sticky-bottom": "sticky bottom-0 z-40",
};

export const CARD_BORDER_CLASSES: Record<AIChatColorScheme, string> = {
  none: "",
  white: "border-theme-white/40 focus-within:border-theme-white/60",
  black: "border-theme-black/40 focus-within:border-theme-black/60",
  neutral: "",
  primary: "border-primary/30 focus-within:border-primary/50",
  "primary-gradient": "border-primary/30 focus-within:border-primary/50",
  secondary: "border-secondary/30 focus-within:border-secondary/50",
  "secondary-gradient": "border-secondary/30 focus-within:border-secondary/50",
  tertiary: "border-tertiary/30 focus-within:border-tertiary/50",
  accent: "border-accent/30 focus-within:border-accent/50",
  "accent-2": "border-accent-2/30 focus-within:border-accent-2/50",
  "accent-3": "border-accent-3/30 focus-within:border-accent-3/50",
  info: "border-info/30 focus-within:border-info/50",
  success: "border-success/30 focus-within:border-success/50",
  warning: "border-warning/30 focus-within:border-warning/50",
  destructive: "border-destructive/30 focus-within:border-destructive/50",
};

export const HEADER_ACCENT_STRIP_CLASSES: Record<AIChatColorScheme, string> = {
  none: "",
  white: "bg-linear-to-r from-theme-white/15 via-theme-white/5 to-transparent",
  black: "bg-linear-to-r from-theme-black/15 via-theme-black/5 to-transparent",
  neutral: "",
  primary: "bg-linear-to-r from-primary/15 via-primary/5 to-transparent",
  // Gradient schemes use the full gradient at low alpha — same brand
  // signal as the colorScheme=primary-gradient surface treatment.
  "primary-gradient": "bg-gradient-to-br from-primary/20 to-secondary/20",
  secondary: "bg-linear-to-r from-secondary/15 via-secondary/5 to-transparent",
  "secondary-gradient": "bg-gradient-to-br from-secondary/20 to-accent/20",
  tertiary: "bg-linear-to-r from-tertiary/15 via-tertiary/5 to-transparent",
  accent: "bg-linear-to-r from-accent/15 via-accent/5 to-transparent",
  "accent-2": "bg-linear-to-r from-accent-2/15 via-accent-2/5 to-transparent",
  "accent-3": "bg-linear-to-r from-accent-3/15 via-accent-3/5 to-transparent",
  info: "bg-linear-to-r from-info/15 via-info/5 to-transparent",
  success: "bg-linear-to-r from-success/15 via-success/5 to-transparent",
  warning: "bg-linear-to-r from-warning/15 via-warning/5 to-transparent",
  destructive:
    "bg-linear-to-r from-destructive/15 via-destructive/5 to-transparent",
};

/**
 * Solid header treatment for the floating widget's open panel
 * (`panelHeaderStyle="solid"`) — the branded-header convention of most
 * commercial chat widgets. Each entry is a full role composition per
 * the color-roles contract: `bg-<X>` paired with `text-<X>-foreground`.
 * Gradient schemes reuse the brand gradient at full strength with the
 * FROM role's foreground. `none` and `neutral` fall back to a quiet
 * muted surface so "solid" still reads as a distinct header.
 */
export const HEADER_SOLID_CLASSES: Record<AIChatColorScheme, string> = {
  none: "bg-muted text-foreground",
  neutral: "bg-neutral text-neutral-foreground",
  white: "bg-theme-white text-theme-black",
  black: "bg-theme-black text-theme-white",
  primary: "bg-primary text-primary-foreground",
  "primary-gradient":
    "bg-gradient-to-br from-primary to-secondary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  "secondary-gradient":
    "bg-gradient-to-br from-secondary to-accent text-secondary-foreground",
  tertiary: "bg-tertiary text-tertiary-foreground",
  accent: "bg-accent text-accent-foreground",
  "accent-2": "bg-accent-2 text-accent-2-foreground",
  "accent-3": "bg-accent-3 text-accent-3-foreground",
  info: "bg-info text-info-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  destructive: "bg-destructive text-destructive-foreground",
};

/**
 * Viewport-corner classes for the floating widget. Logical properties
 * (`end-*` / `start-*`) so `bottom-end` sits bottom-right in LTR and
 * bottom-left in RTL without any extra handling.
 */
export const WIDGET_PLACEMENT_CLASSES: Record<
  AIChatWidgetPlacement,
  { launcher: string; panel: string }
> = {
  "bottom-end": { launcher: "end-4 bottom-4", panel: "end-4 bottom-24" },
  "bottom-start": { launcher: "start-4 bottom-4", panel: "start-4 bottom-24" },
};

/** Launcher size presets — round tile size and pill height/padding. */
export const LAUNCHER_SIZE_CLASSES: Record<
  AIChatLauncherSize,
  { round: string; pill: string }
> = {
  compact: { round: "size-12", pill: "h-10 px-4" },
  default: { round: "size-14", pill: "h-12 px-5" },
  large: { round: "size-16", pill: "h-14 px-6" },
};

/**
 * Open-panel footprint presets. Every preset clamps to the viewport so
 * the panel never overflows small screens.
 */
export const PANEL_SIZE_CLASSES: Record<AIChatPanelSize, string> = {
  compact:
    "w-[min(22.5rem,calc(100vw-2rem))] h-[min(32.5rem,calc(100vh-8rem))]",
  default: "w-[min(28rem,calc(100vw-2rem))] h-[min(36rem,calc(100vh-8rem))]",
  tall: "w-[min(28rem,calc(100vw-2rem))] h-[min(44rem,calc(100vh-8rem))]",
};

export const ASSISTANT_BUBBLE_CLASSES: Record<AIChatColorScheme, string> = {
  none: "",
  white: "ring-theme-white/40 bg-theme-white/10",
  black: "ring-theme-black/40 bg-theme-black/10",
  neutral: "",
  primary: "ring-primary/30 bg-primary/5",
  "primary-gradient": "ring-primary/30 bg-primary/5",
  secondary: "ring-secondary/30 bg-secondary/5",
  "secondary-gradient": "ring-secondary/30 bg-secondary/5",
  tertiary: "ring-tertiary/30 bg-tertiary/5",
  accent: "ring-accent/30 bg-accent/5",
  "accent-2": "ring-accent-2/30 bg-accent-2/5",
  "accent-3": "ring-accent-3/30 bg-accent-3/5",
  info: "ring-info/30 bg-info/5",
  success: "ring-success/30 bg-success/5",
  warning: "ring-warning/30 bg-warning/5",
  destructive: "ring-destructive/30 bg-destructive/5",
};

export const ASSISTANT_ICON_CLASSES: Record<AIChatColorScheme, string> = {
  none: "",
  white: "text-theme-white",
  black: "text-theme-black",
  neutral: "",
  primary: "text-primary",
  "primary-gradient": "text-primary",
  secondary: "text-secondary",
  "secondary-gradient": "text-secondary",
  tertiary: "text-tertiary",
  accent: "text-accent",
  "accent-2": "text-accent-2",
  "accent-3": "text-accent-3",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};
