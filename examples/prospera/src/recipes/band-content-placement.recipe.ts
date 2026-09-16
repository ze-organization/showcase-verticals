import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing a band-style component's `ContentPlacement`
 * rendering parameter — where the section's heading stack (eyebrow /
 * title / lead + CTA) sits relative to the band's media treatment.
 * Lands at `<enumerationsRoot>/Layout/ContentPlacement` per-site.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "band-content-placement@1"`. First consumer: `media-wall@1`'s Arc
 * variant — `center` moves the heading into the well inside the photo
 * arch, `above` keeps the family's normal heading placement. Variants
 * without a center well ignore the param.
 */
export const bandContentPlacementEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "band-content-placement@1",
  name: "BandContentPlacement",
  displayName: "Band Content Placement",
  description:
    "Where a band's heading stack sits relative to its media treatment: `above` (normal section heading) or `center` (inside the media composition's center well).",
  location: { scope: "site", folder: ["Layout"] },
  default: "above",
  values: [
    { name: "above", displayName: "Above" },
    { name: "center", displayName: "Center" },
  ],
} satisfies EnumerationRecipe;

export default bandContentPlacementEnumRecipe;
