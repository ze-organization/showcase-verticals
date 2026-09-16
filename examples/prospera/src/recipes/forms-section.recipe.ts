import type { ComponentSectionRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { sectionIcons } from "./_component-icons";

/**
 * Section recipe for the `forms` group — subscribe banners, contact
 * forms, submission-shell wrappers, and the FormBuilder compose-your-own
 * surface. Every `ComponentTemplateRecipe` in this directory references
 * it via `section: { handle: "forms-section@1" }`.
 *
 * Owns the section-level Sitecore items emitted once per `(site, section)`
 * — templates folder, component-folders bucket, presentation-parameters
 * bucket, renderings-tree folder, headless-variants folder, and the
 * cross-recipe Available Renderings aggregate. See `ui-section.recipe.ts`
 * for the full enumeration; the mechanism is identical.
 */
export const formsSectionRecipe = {
  kind: "component-section",
  schemaVersion: "1",
  handle: "forms-section@1",
  icon: sectionIcons["forms-section@1"],
  name: "forms",
  displayName: "Forms",
  description:
    "Lead-capture and submission surfaces — subscribe banners, contact forms, embed shells, the FormBuilder compose-your-own pattern.",
} satisfies ComponentSectionRecipe;

export default formsSectionRecipe;
