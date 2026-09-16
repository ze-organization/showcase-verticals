import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Open-panel header treatment for the floating widget.
 *
 *   tinted  (default) Low-alpha ColorScheme accent strip over the page
 *           background — quiet, brand-hinted.
 *   solid   Full ColorScheme fill with the role's foreground text —
 *           the branded-header convention of most commercial chat
 *           widgets (pick when the source panel shows a colored
 *           header bar with white/contrast text).
 *   plain   No accent at all — a clean white/background header (pick
 *           when the source panel is minimal and monochrome).
 */
export const aiChatPanelHeaderStyleEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "ai-chat-panel-header-style@1",
  name: "AIChatPanelHeaderStyle",
  displayName: "AI Chat Panel Header Style",
  description:
    "Header treatment of the open chat panel (tinted accent / solid brand fill / plain).",
  location: { scope: "site", folder: ["Components", "AI Chat"] },
  default: "tinted",
  values: [
    { name: "tinted", displayName: "Tinted accent (default)" },
    { name: "solid", displayName: "Solid brand fill" },
    { name: "plain", displayName: "Plain" },
  ],
} satisfies EnumerationRecipe;

export default aiChatPanelHeaderStyleEnumRecipe;
