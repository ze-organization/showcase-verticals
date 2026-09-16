import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the TaglineBanner `AlignY` rendering parameter.
 * Block-axis alignment within the banner's height.
 *
 * Distinct from the shared `alignment@1` (which is inline-axis only)
 * because Y-alignment is `top` / `middle` / `bottom` — the three
 * vertical anchors — not `start` / `end`.
 */
export const taglineBannerAlignYEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "tagline-banner-align-y@1",
  name: "TaglineBannerAlignY",
  displayName: "Tagline Banner Vertical Alignment",
  description:
    "Block-axis alignment of the text block within the tagline banner's height.",
  location: { scope: "site", folder: ["Tagline Banner"] },
  default: "top",
  values: [
    { name: "top", displayName: "Top" },
    { name: "middle", displayName: "Middle" },
    { name: "bottom", displayName: "Bottom" },
  ],
} satisfies EnumerationRecipe;

export default taglineBannerAlignYEnumRecipe;
