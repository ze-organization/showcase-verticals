import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the Promo `ContentVAlign` rendering parameter —
 * vertical alignment of the copy block within a two-column split.
 * Lands at `<enumerationsRoot>/Layout/ContentVAlign` per-site.
 *
 * Distinct from `bottom-alignment@1` (a hero-frame axis with
 * start/center/end semantics); this one speaks the copy-block
 * vocabulary (`top` / `center` / `bottom`) the composer binds from
 * the source's measured copy position. Inert outside the `start` /
 * `end` ImagePositions.
 */
export const contentVAlignEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "content-valign@1",
  name: "ContentVAlign",
  displayName: "Content Vertical Alignment",
  description:
    "Vertical alignment of the copy block in side-by-side promos: `top`, `center` (default), or `bottom` relative to the media column.",
  location: { scope: "site", folder: ["Layout"] },
  default: "center",
  values: [
    { name: "top", displayName: "Top" },
    { name: "center", displayName: "Center" },
    { name: "bottom", displayName: "Bottom" },
  ],
} satisfies EnumerationRecipe;

export default contentVAlignEnumRecipe;
