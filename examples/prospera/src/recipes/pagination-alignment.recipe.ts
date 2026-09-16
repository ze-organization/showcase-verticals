import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration for the `Alignment` rendering parameter on search-pagination-bar. Superset of the shared alignment@1 scale (adds `split`), which is why it does not reuse that enum.
 *
 * Reference via `sitecore.enumHandle: "pagination-alignment@1"`. Lands at
 * `<enumerationsRoot>/Search/PaginationAlignment` per-site.
 */
export const paginationAlignmentEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "pagination-alignment@1",
  name: "PaginationAlignment",
  displayName: "Pagination Alignment",
  description:
    "How the pagination bar lays out: start, center, end, or split (summary left, controls right).",
  location: { scope: "site", folder: ["Search"] },
  default: "split",
  values: [
    { name: "start", displayName: "Start" },
    { name: "center", displayName: "Center" },
    { name: "end", displayName: "End" },
    { name: "split", displayName: "Split" },
  ],
} satisfies EnumerationRecipe;

export default paginationAlignmentEnumRecipe;
