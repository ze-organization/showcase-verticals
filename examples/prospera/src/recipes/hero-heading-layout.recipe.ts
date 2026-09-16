import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Heading SCALE preset for the unified Hero component (`hero@1`),
 * independent of frame layout. Despite the "layout" name it does not
 * rearrange anything — it picks the DEFAULT title size ramp and the
 * eyebrow scale:
 *
 *   - `display` → oversized display title (4xl→7xl, tight 1.08
 *                 leading) + kicker-size eyebrow (default).
 *   - `compact` → smaller title ramp (2xl→4xl) + discreet label
 *                 eyebrow, for narrow overlays / inline uses.
 *
 * An explicit `TitleSize` pick overrides the title ramp, leaving this
 * preset in charge of the eyebrow scale only. It is NOT a line-height
 * axis — the tight display leading rides along with the display ramp.
 *
 * Mirrors `HeroHeadingLayout` in `hero.types.ts`. Reference from
 * `hero@1` via `sitecore.enumHandle: "hero-heading-layout@1"`.
 */
export const heroHeadingLayoutEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "hero-heading-layout@1",
  name: "Hero Heading Layout",
  displayName: "Hero Heading Layout",
  description:
    "Heading scale preset — `display` (oversized title ramp + kicker eyebrow, default) or `compact` (smaller ramp + discreet eyebrow). Sets the DEFAULT title size ramp; an explicit TitleSize overrides the title part. Not a line-height control.",
  location: { scope: "site", folder: ["Hero"] },
  default: "display",
  values: [
    { name: "display", displayName: "Display" },
    { name: "compact", displayName: "Compact" },
  ],
} satisfies EnumerationRecipe;

export default heroHeadingLayoutEnumRecipe;
