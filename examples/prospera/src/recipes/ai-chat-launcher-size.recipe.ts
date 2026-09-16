import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Floating launcher size preset.
 *
 *   compact  48px tile / 40px pill — dense utility sites where the
 *            widget should stay out of the way.
 *   default  56px tile / 48px pill — the Intercom-class convention and
 *            the right pick for almost every source site.
 *   large    64px tile / 56px pill — sites that treat the assistant as
 *            a primary support entry point and give the launcher real
 *            visual weight.
 */
export const aiChatLauncherSizeEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "ai-chat-launcher-size@1",
  name: "AIChatLauncherSize",
  displayName: "AI Chat Launcher Size",
  description: "Size preset for the floating launcher button.",
  location: { scope: "site", folder: ["Components", "AI Chat"] },
  default: "default",
  values: [
    { name: "compact", displayName: "Compact" },
    { name: "default", displayName: "Default" },
    { name: "large", displayName: "Large" },
  ],
} satisfies EnumerationRecipe;

export default aiChatLauncherSizeEnumRecipe;
