import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the link-list `ListMarker` rendering
 * parameter — the item marker for the vertical link variants. Lands at
 * `<enumerationsRoot>/Navigation/ListMarker` per-site.
 *
 * Reference from a component recipe via
 * `sitecore.enumHandle: "list-marker@1"`.
 *
 * `none` (the default) keeps the plain markerless link stack.
 * `bulleted` renders real `list-disc` markers whose color follows the
 * row's text token — honored by the plain-text vertical layouts
 * (`Default` vertical, `Compact`, and each `MultiColumn` column) and
 * ignored by the horizontal / inline / pill / icon-led / chevron
 * layouts where a disc is meaningless. No enum-level default: the
 * referencing param declares its own (`none`).
 *
 * Shared enum (not inline droplist) for the same reason as
 * `column-count@1` / `separator-glyph@1`: SXA Headless's Pages
 * rendering-parameter dialog reliably surfaces Droplink +
 * folder-of-enum-values only.
 */
export const listMarkerEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "list-marker@1",
  name: "ListMarker",
  displayName: "List Marker",
  description:
    "Item marker for the vertical link variants: `none` (plain markerless stack — the default) or `bulleted` (real disc markers whose color follows the row's text token).",
  location: { scope: "site", folder: ["Navigation"] },
  values: [
    { name: "none", displayName: "None" },
    { name: "bulleted", displayName: "Bulleted" },
  ],
} satisfies EnumerationRecipe;

export default listMarkerEnumRecipe;
