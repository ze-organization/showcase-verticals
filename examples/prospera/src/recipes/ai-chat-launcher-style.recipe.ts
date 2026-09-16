import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Floating-widget launcher fill style. `solid` follows the chat's
 * `ColorScheme` fill; `outline` is transparent with a colored border;
 * `gradient` routes to the matching `*-gradient` scheme so the
 * launcher reads with the brand's gradient treatment regardless of
 * the chat surface's own colorScheme.
 */
export const aiChatLauncherStyleEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "ai-chat-launcher-style@1",
  name: "AIChatLauncherStyle",
  displayName: "AI Chat Launcher Style",
  description: "Fill style for the floating launcher button.",
  location: { scope: "site", folder: ["Components", "AI Chat"] },
  default: "solid",
  values: [
    { name: "solid", displayName: "Solid" },
    { name: "outline", displayName: "Outline" },
    { name: "gradient", displayName: "Gradient" },
  ],
} satisfies EnumerationRecipe;

export default aiChatLauncherStyleEnumRecipe;
