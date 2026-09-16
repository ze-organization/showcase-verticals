import type { ComponentSectionRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { sectionIcons } from "./_component-icons";

/**
 * Section recipe for the `ai` group — chat surfaces, agent panels,
 * generated-content blocks. Every `ComponentTemplateRecipe` in this
 * directory references it via `section: { handle: "ai-section@1" }`.
 *
 * Owns the section-level Sitecore items emitted once per `(site, section)`
 * — templates folder, component-folders bucket, presentation-parameters
 * bucket, renderings-tree folder, headless-variants folder, and the
 * cross-recipe Available Renderings aggregate. See `ui-section.recipe.ts`
 * for the full enumeration; the mechanism is identical.
 *
 * The handle is load-bearing — uuidv5 derives section folder GUIDs from
 * it and from the section `name`. Renaming creates a different section.
 */
export const aiSectionRecipe = {
  kind: "component-section",
  schemaVersion: "1",
  handle: "ai-section@1",
  icon: sectionIcons["ai-section@1"],
  name: "ai",
  displayName: "AI",
  description:
    "AI-powered surfaces — chat panels, agent UIs, generated-content blocks.",
} satisfies ComponentSectionRecipe;

export default aiSectionRecipe;
