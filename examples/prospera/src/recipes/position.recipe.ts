import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing a component's `Position` rendering
 * parameter — controls whether the component renders inline at its
 * placement, or sticks to the top/bottom of the nearest scroll
 * container. Lands at `<enumerationsRoot>/Position` per-site.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "position@1"`. Sticky placements rely on CSS `position: sticky`, so
 * the authored value is scoped to the placement's scroll context —
 * drop the component near the page root for true viewport-pinned
 * behavior.
 */
export const positionEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "position@1",
  name: "Position",
  displayName: "Position",
  description:
    "Inline vs sticky placement. Sticky values use CSS `position: sticky` relative to the nearest scroll container.",
  location: { scope: "site", folder: ["Layout"] },
  default: "inline",
  values: [
    { name: "inline", displayName: "Inline" },
    { name: "sticky-top", displayName: "Sticky Top" },
    { name: "sticky-bottom", displayName: "Sticky Bottom" },
  ],
} satisfies EnumerationRecipe;

export default positionEnumRecipe;
