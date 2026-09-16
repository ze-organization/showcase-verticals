import type { ComponentSectionRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { sectionIcons } from "./_component-icons";

/**
 * Section recipe for the `ui` group of components — buttons, cards,
 * accordions, badges, rich-text, etc. All `ComponentTemplateRecipe`s
 * in this directory reference it via `section: { handle: "ui-section@1" }`.
 *
 * Owns the section-level Sitecore items emitted once per `(site, section)`:
 *
 *   1. Templates section folder         — `<componentsRoot>/ui/`
 *   2. Component Folders bucket         — `<componentsRoot>/ui/Component Folders/`
 *   3. Presentation Parameters bucket   — `<componentsRoot>/ui/Presentation Parameters/`
 *   4. Renderings-tree section folder   — `<renderingsRoot>/ui/`
 *   5. Headless Variants section        — `<headlessVariantsRoot>/ui/`
 *   6. Available Renderings section     — populated by the cross-recipe
 *                                         aggregator from every component
 *                                         recipe referencing this section.
 *
 * The handle is load-bearing — uuidv5 derives the section folder GUIDs
 * from it (and from the section `name`). Renaming the handle creates a
 * different section.
 */
export const cardsAndListsSectionRecipe = {
  kind: "component-section",
  schemaVersion: "1",
  handle: "cards-and-lists-section@1",
  icon: sectionIcons["cards-and-lists-section@1"],
  name: "cards-and-lists",
  displayName: "Cards and Lists",
  description: "Cards and lists of items.",
} satisfies ComponentSectionRecipe;

export default cardsAndListsSectionRecipe;
