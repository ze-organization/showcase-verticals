import type { ComponentSectionRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { sectionIcons } from "./_component-icons";

/**
 * Section recipe for the `heros-and-promos` group — page-top heros,
 * banners, taglines, page-headers, promo blocks, and other
 * attention-grabbing editorial surfaces. Page-details shells live
 * in `page-details-section@1`. Every `ComponentTemplateRecipe` in this
 * group references it via `section: { handle: "heros-and-promos-section@1" }`.
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
export const herosAndPromosSectionRecipe = {
  kind: "component-section",
  schemaVersion: "1",
  handle: "heros-and-promos-section@1",
  icon: sectionIcons["heros-and-promos-section@1"],
  name: "heros-and-promos",
  displayName: "Heros & Promos",
  description:
    "Page-top heros, full-width banners, taglines, page-headers, and promo blocks — high-impact editorial surfaces that anchor a page.",
} satisfies ComponentSectionRecipe;

export default herosAndPromosSectionRecipe;
