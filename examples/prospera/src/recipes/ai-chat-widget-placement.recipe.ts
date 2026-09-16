import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Viewport corner the floating widget (launcher + panel) pins to.
 * Logical inline positions — `bottom-end` renders bottom-right in LTR
 * and bottom-left in RTL, so the corner choice localizes for free.
 *
 * `bottom-end` is the near-universal chat-widget convention (Intercom,
 * Drift, Salesforce, and both ResMed- and SUSE-style AI assistants sit
 * there); pick `bottom-start` only when the source site shows the
 * widget in the other corner or the end corner is already occupied
 * (cookie badge, back-to-top button, a second widget).
 */
export const aiChatWidgetPlacementEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "ai-chat-widget-placement@1",
  name: "AIChatWidgetPlacement",
  displayName: "AI Chat Widget Placement",
  description:
    "Viewport corner the floating launcher and panel pin to (logical; flips under RTL).",
  location: { scope: "site", folder: ["Components", "AI Chat"] },
  default: "bottom-end",
  values: [
    { name: "bottom-end", displayName: "Bottom end (default)" },
    { name: "bottom-start", displayName: "Bottom start" },
  ],
} satisfies EnumerationRecipe;

export default aiChatWidgetPlacementEnumRecipe;
