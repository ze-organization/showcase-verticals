import type { ComponentSectionRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { sectionIcons } from "./_component-icons";

/**
 * Section recipe for the `social` group — share buttons, follow rows,
 * and other social-platform-aware surfaces. Every
 * `ComponentTemplateRecipe` in this directory references it via
 * `section: { handle: "social-section@1" }`.
 *
 * Owns the section-level Sitecore items emitted once per `(site, section)`
 * — templates folder, component-folders bucket, presentation-parameters
 * bucket, renderings-tree folder, headless-variants folder, and the
 * cross-recipe Available Renderings aggregate. See `ui-section.recipe.ts`
 * for the full enumeration; the mechanism is identical.
 *
 * Note: `social-follow-content@1` is a *content template* and lives in
 * `components/navigation/` because it piggybacks on the `link-list@1`
 * rendering. Anything that ships its own rendering (Share, Feed, …)
 * belongs here.
 *
 * The handle is load-bearing — uuidv5 derives section folder GUIDs from
 * it and from the section `name`. Renaming creates a different section.
 */
export const socialSectionRecipe = {
  kind: "component-section",
  schemaVersion: "1",
  handle: "social-section@1",
  icon: sectionIcons["social-section@1"],
  name: "social",
  displayName: "Social",
  description:
    "Social-platform surfaces — share buttons, follow rows, and other components that integrate with external social networks.",
} satisfies ComponentSectionRecipe;

export default socialSectionRecipe;
