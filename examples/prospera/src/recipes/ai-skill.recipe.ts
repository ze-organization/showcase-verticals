import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Content template for an AI Skill — a reusable prompt fragment that
 * gets concatenated into the system prompt of any `ai-chat@1` instance
 * that references it via the `Skills` Treelist.
 *
 * Modeled as content (no rendering, no React file) so marketers can
 * library-up a set of capabilities ("travel-savings-tips",
 * "product-comparison-style", "tone-warm-and-concise") and mix-and-match
 * them per chat placement.
 *
 * The shape is deliberately minimal: just a Name (used for the optional
 * `## Skill: <name>` header in the composed prompt) and Instructions
 * (the prompt fragment itself). MCPs, tool-calling, and runtime
 * function execution are NOT modeled here — see
 * [[scai-mcp-tool-shape]] for why those live outside the CMS surface.
 */
export const aiSkillRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "ai-skill@1",
  name: "ai-skill",
  displayName: "AI Skill",
  description:
    "Reusable prompt fragment that gets concatenated into the system prompt of any AI Chat instance that references it.",

  fields: [
    {
      name: "Name",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Short human-readable name used in the composed system prompt and for marketer reference.",
        sortOrder: 100,
      },
    },
    {
      name: "Instructions",
      shape: "text",
      sitecore: {
        type: "multi-line-text",
        required: true,
        hint: "Prompt fragment appended to the chat's SystemPrompt. Plain text, no formatting.",
        sortOrder: 200,
      },
    },
  ],
} satisfies ContentTemplateRecipe;

export default aiSkillRecipe;
