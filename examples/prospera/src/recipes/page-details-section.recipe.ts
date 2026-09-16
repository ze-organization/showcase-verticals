import type { ComponentSectionRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { sectionIcons } from "./_component-icons";

/**
 * Section recipe for the `page-details` group — full-page detail
 * views (article, product, person, event, and the rest of the
 * insertable-type shells). Every `ComponentTemplateRecipe` in this
 * group references it via `section: { handle: "page-details-section@1" }`.
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
export const pageDetailsSectionRecipe = {
  kind: "component-section",
  schemaVersion: "1",
  handle: "page-details-section@1",
  icon: sectionIcons["page-details-section@1"],
  name: "page-details",
  displayName: "Page Details",
  description:
    "Full-page detail views for insertable types — article, product, person, event, and related shells that bind to the current page item.",
} satisfies ComponentSectionRecipe;

export default pageDetailsSectionRecipe;
