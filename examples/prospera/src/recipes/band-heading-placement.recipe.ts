import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the `HeadingPlacement` rendering parameter
 * on band-shaped listing renderings — where the section heading
 * (Eyebrow / Title / Lead) sits relative to the band's items. Lands at
 * `<enumerationsRoot>/Layout/Heading/HeadingPlacement` per-site.
 *
 * Reference from a component recipe via
 * `sitecore.enumHandle: "band-heading-placement@1"`.
 *
 * Named generically on purpose — the same vocabulary drives the
 * cards-and-lists carousels (heading in the leading column, slides
 * flowing beside it — the Allstate resources-slider read) AND the
 * stats Milestones band (heading occupying the leading cell of the
 * stat row). No enum-level default: each referencing param declares
 * its own (`above`).
 */
export const bandHeadingPlacementEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "band-heading-placement@1",
  name: "HeadingPlacement",
  displayName: "Band Heading Placement",
  description:
    "Where a band's section heading sits relative to its items: `above` (heading on its own row above the items — the default) or `inline` (heading occupies the band's leading column/cell, items flow beside it in the same row).",
  location: { scope: "site", folder: ["Layout", "Heading"] },
  values: [
    { name: "above", displayName: "Above the items" },
    { name: "inline", displayName: "Inline (leading cell)" },
  ],
} satisfies EnumerationRecipe;

export default bandHeadingPlacementEnumRecipe;
