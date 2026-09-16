import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Open-panel footprint preset for the floating widget. All presets
 * clamp to the viewport, so small screens are never overflowed.
 *
 *   compact  ~360x520 — the classic support-widget panel.
 *   default  ~448x576 — roomier panel that fits suggestion chips and
 *            richer assistant answers without scrolling immediately.
 *   tall     default width, up to ~704 tall — content-heavy assistants
 *            (long grounded answers, tool output).
 */
export const aiChatPanelSizeEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "ai-chat-panel-size@1",
  name: "AIChatPanelSize",
  displayName: "AI Chat Panel Size",
  description: "Width/height preset of the open chat panel.",
  location: { scope: "site", folder: ["Components", "AI Chat"] },
  default: "default",
  values: [
    { name: "compact", displayName: "Compact" },
    { name: "default", displayName: "Default" },
    { name: "tall", displayName: "Tall" },
  ],
} satisfies EnumerationRecipe;

export default aiChatPanelSizeEnumRecipe;
