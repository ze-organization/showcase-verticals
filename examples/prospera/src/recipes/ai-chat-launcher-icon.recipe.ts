import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Floating-widget launcher face — what the closed launcher button shows.
 *
 *   avatar  The chat's Avatar image (default). This is the assistant's
 *           face, so the closed launcher reads as "the assistant is
 *           here." Falls back to the bot icon when the Avatar is blank.
 *   letter  The first letter of the chat's Title / Launcher Label —
 *           a monogram treatment some brands prefer.
 *   bot     The generic lucide bot icon — an explicit, brand-neutral
 *           fallback for placements with no avatar and no monogram.
 *   chat    The classic chat-bubble glyph (the icon-name@1 vocabulary's
 *           `chat` / MessageCircle) — pick when the source site's
 *           launcher shows a speech bubble.
 *   sparkle The AI sparkles glyph — pick when the source site frames
 *           the widget as an AI assistant ("Ask AI") rather than
 *           live-chat support.
 *
 * The former `none` (empty launcher) option was dropped: a launcher with
 * no face is unrecognisable as a chat affordance. Author a pill-shaped
 * launcher with a label instead when a glyph isn't wanted.
 */
export const aiChatLauncherIconEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "ai-chat-launcher-icon@1",
  name: "AIChatLauncherIcon",
  displayName: "AI Chat Launcher Icon",
  description:
    "Face rendered on the closed floating launcher (avatar / letter / bot / chat bubble / AI sparkles).",
  location: { scope: "site", folder: ["Components", "AI Chat"] },
  default: "avatar",
  values: [
    { name: "avatar", displayName: "Avatar" },
    { name: "letter", displayName: "Monogram" },
    { name: "bot", displayName: "Bot icon" },
    {
      name: "chat",
      displayName: "Chat bubble",
      description:
        "Speech-bubble glyph — pick when the source launcher reads as live chat/support.",
    },
    {
      name: "sparkle",
      displayName: "AI sparkles",
      description:
        "Sparkles glyph — pick when the source launcher reads as an AI assistant ('Ask AI').",
    },
  ],
} satisfies EnumerationRecipe;

export default aiChatLauncherIconEnumRecipe;
