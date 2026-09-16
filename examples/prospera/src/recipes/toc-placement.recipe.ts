import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing `TocPlacement` on `article-with-toc-details@1`.
 * Lands at `<enumerationsRoot>/Layout/TocPlacement` per-site.
 *
 *   - `end`     (default) — TOC in the trailing column beside the body.
 *   - `start`             — TOC in the leading column.
 *   - `hidden`            — no TOC; body uses the full copy column.
 */
export const tocPlacementEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "toc-placement@1",
  name: "TocPlacement",
  displayName: "TOC Placement",
  description:
    "Where the on-this-page table of contents sits relative to the article body. `end` (default) trails the copy; `start` leads it; `hidden` suppresses the TOC.",
  location: { scope: "site", folder: ["Layout"] },
  default: "end",
  values: [
    { name: "end", displayName: "End (beside body)" },
    { name: "start", displayName: "Start (leading column)" },
    { name: "hidden", displayName: "Hidden" },
  ],
} satisfies EnumerationRecipe;

export default tocPlacementEnumRecipe;
