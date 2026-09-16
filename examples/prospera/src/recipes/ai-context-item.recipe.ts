import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Content template for an AI Context item — a reusable piece of
 * supplemental context (product summary, FAQ excerpt, policy
 * paragraph, brand-voice note) that gets concatenated into the system
 * prompt of any `ai-chat@1` instance that references it via the
 * `Context` Treelist.
 *
 * Similar shape to `ai-skill@1` but conceptually distinct: Skills
 * change HOW the assistant responds (tone, persona, behavior); Context
 * items provide WHAT the assistant should know (facts, policies,
 * documents). The split lets marketers compose a chat instance
 * declaratively — "use the friendly-tour-guide skill PLUS the
 * spring-2026-destinations context".
 */
export const aiContextItemRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "ai-context-item@1",
  name: "ai-context-item",
  displayName: "AI Context Item",
  description:
    "Reusable supplemental context (facts, policies, excerpts) that gets concatenated into the system prompt of any AI Chat instance that references it.",

  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Short human-readable title used in the composed system prompt and for marketer reference.",
        sortOrder: 100,
      },
    },
    {
      name: "Content",
      shape: "text",
      sitecore: {
        type: "multi-line-text",
        required: true,
        hint: "Context body appended to the chat's SystemPrompt. Plain text, no formatting.",
        sortOrder: 200,
      },
    },
  ],
} satisfies ContentTemplateRecipe;

export default aiContextItemRecipe;
