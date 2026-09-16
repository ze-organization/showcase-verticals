import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Floating-widget launcher shape. `round` is a 56px avatar tile (the
 * Intercom / Drift convention); `pill` widens to fit a label like "Ask
 * AI" or "Help" and reads as a more inviting button on desktop.
 */
export const aiChatLauncherShapeEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "ai-chat-launcher-shape@1",
  name: "AIChatLauncherShape",
  displayName: "AI Chat Launcher Shape",
  description: "Shape of the floating launcher button (round vs pill).",
  location: { scope: "site", folder: ["Components", "AI Chat"] },
  default: "round",
  values: [
    { name: "round", displayName: "Round" },
    { name: "pill", displayName: "Pill (with label)" },
  ],
} satisfies EnumerationRecipe;

export default aiChatLauncherShapeEnumRecipe;
