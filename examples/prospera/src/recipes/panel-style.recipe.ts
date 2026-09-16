import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `PanelStyle` rendering parameter on
 * tabular/list components that wrap their rows in a card slab
 * (ranking-table, versus-list).
 *
 *   - `card` (default) — rows sit inside a bordered, elevated
 *     `bg-card` panel (the classic dashboard treatment).
 *   - `flat` — drops the border / background / shadow so rows sit
 *     directly on the section surface (the editorial/broadcast
 *     treatment — standings and fixtures directly on a dark band).
 */
export const panelStyleEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "panel-style@1",
  name: "PanelStyle",
  displayName: "Panel Style",
  description:
    "Chrome around tabular rows — `card` (bordered elevated panel, default) or `flat` (rows directly on the section surface).",
  location: { scope: "site", folder: ["Card"] },
  default: "card",
  values: [
    { name: "card", displayName: "Card (bordered panel)" },
    { name: "flat", displayName: "Flat (on surface)" },
  ],
} satisfies EnumerationRecipe;

export default panelStyleEnumRecipe;
