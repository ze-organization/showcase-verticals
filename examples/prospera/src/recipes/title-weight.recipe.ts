import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing a hero's `TitleWeight` rendering parameter —
 * font weight of the display title. `default` reads through the
 * `--heading-weight` theme token (with a per-component fallback — the
 * hero keeps its historical light 300 face) so themes can re-weight
 * headings globally without authors touching params.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "title-weight@1"`. Components map values to Tailwind `font-*`
 * utilities — see `TITLE_WEIGHT_CLASSES` in
 * `src/lib/registry/heros-and-promos/hero-heading.tsx`.
 */
export const titleWeightEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "title-weight@1",
  name: "TitleWeight",
  displayName: "Title Weight",
  description:
    "Display-title font weight. `default` defers to the theme's `--heading-weight` token; explicit values pin light (300) through heavy (800).",
  location: { scope: "site", folder: ["Layout", "Heading"] },
  default: "default",
  values: [
    { name: "default", displayName: "Default (theme)" },
    { name: "light", displayName: "Light (300)" },
    { name: "regular", displayName: "Regular (400)" },
    { name: "semibold", displayName: "Semibold (600)" },
    { name: "bold", displayName: "Bold (700)" },
    { name: "heavy", displayName: "Heavy (800)" },
  ],
} satisfies EnumerationRecipe;

export default titleWeightEnumRecipe;
