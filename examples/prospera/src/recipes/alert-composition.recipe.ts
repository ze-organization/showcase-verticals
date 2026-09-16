import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the AlertBanner's `Composition` rendering
 * parameter — controls how title and description are arranged.
 *
 *   stacked                      title above description (shadcn default)
 *   row                          title + description inline on one row
 *   row-with-divider             title in a colored slab on the
 *                                inline-start side, description on the
 *                                pale alert tint to the inline-end;
 *                                slab end is a flush vertical edge
 *   row-with-angled-divider      same as row-with-divider but the slab
 *                                ends in a slash cut (clip-path
 *                                polygon) — editorial energy lifted
 *                                from SUSE-style news banners
 *
 * Referenced by AlertBanner via `sitecore.enumHandle: "alert-composition@1"`.
 * Could be reused by other feedback components with the same title +
 * description shape if/when needed.
 */
export const alertCompositionEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "alert-composition@1",
  name: "AlertComposition",
  displayName: "Alert Composition",
  description:
    "Title and description placement: stacked, row, row with vertical divider, or row with angled divider.",
  location: { scope: "site", folder: ["Feedback"] },
  default: "stacked",
  values: [
    { name: "stacked", displayName: "Stacked" },
    { name: "row", displayName: "Row" },
    { name: "row-with-divider", displayName: "Row with Divider" },
    { name: "row-with-angled-divider", displayName: "Row with Angled Divider" },
  ],
} satisfies EnumerationRecipe;

export default alertCompositionEnumRecipe;
