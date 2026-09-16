import type { ComponentSectionRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { sectionIcons } from "./_component-icons";

/**
 * Section recipe for the `layout` group — containers, splitters, and
 * the section wrapper. Every `ComponentTemplateRecipe` in this directory
 * references it via `section: { handle: "layout-section@1" }`.
 *
 * Owns the section-level Sitecore items emitted once per `(site, section)`
 * — templates folder, component-folders bucket, presentation-parameters
 * bucket, renderings-tree folder, headless-variants folder, and the
 * cross-recipe Available Renderings aggregate. See `ui-section.recipe.ts`
 * for the full enumeration; the mechanism is identical.
 *
 * Layout renderings are deliberately permissive — they expose placeholder
 * slots that accept arbitrary child renderings rather than enumerating
 * an allow-list. The allow-list pattern is reserved for slots with a
 * real authoring constraint (e.g. a carousel that only takes specific
 * card types).
 *
 * The handle is load-bearing — uuidv5 derives section folder GUIDs from
 * it and from the section `name`. Renaming creates a different section.
 */
export const layoutSectionRecipe = {
  kind: "component-section",
  schemaVersion: "1",
  handle: "layout-section@1",
  icon: sectionIcons["layout-section@1"],
  name: "layout",
  displayName: "Layout",
  description:
    "Page structure — containers, splitters, and section wrappers. Container components that expose placeholder slots for nested renderings.",
} satisfies ComponentSectionRecipe;

export default layoutSectionRecipe;
