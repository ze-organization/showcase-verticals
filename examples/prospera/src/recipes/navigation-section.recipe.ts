import type { ComponentSectionRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { sectionIcons } from "./_component-icons";

/**
 * Section recipe for the `navigation` group of components — link lists,
 * breadcrumbs, language switchers, and (in time) the decomposed Header
 * and Footer surfaces. All `ComponentTemplateRecipe`s in this directory
 * reference it via `section: { handle: "navigation-section@1" }`.
 *
 * Owns the section-level Sitecore items emitted once per `(site, section)`:
 *
 *   1. Templates section folder         — `<componentsRoot>/navigation/`
 *   2. Component Folders bucket         — `<componentsRoot>/navigation/Component Folders/`
 *   3. Presentation Parameters bucket   — `<componentsRoot>/navigation/Presentation Parameters/`
 *   4. Renderings-tree section folder   — `<renderingsRoot>/navigation/`
 *   5. Headless Variants section        — `<headlessVariantsRoot>/navigation/`
 *   6. Available Renderings section     — populated by the cross-recipe
 *                                         aggregator from every component
 *                                         recipe referencing this section.
 *
 * The handle is load-bearing — uuidv5 derives the section folder GUIDs
 * from it (and from the section `name`). Renaming the handle creates a
 * different section.
 */
export const navigationSectionRecipe = {
  kind: "component-section",
  schemaVersion: "1",
  handle: "navigation-section@1",
  icon: sectionIcons["navigation-section@1"],
  name: "navigation",
  displayName: "Navigation",
  description:
    "Wayfinding building blocks — link lists, breadcrumbs, language switchers, header/footer surfaces.",
} satisfies ComponentSectionRecipe;

export default navigationSectionRecipe;
