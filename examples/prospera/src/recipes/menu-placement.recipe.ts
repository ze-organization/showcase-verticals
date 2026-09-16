import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration for the `MenuPlacement` rendering parameter on the
 * `header@1` Default shell. Lands at
 * `<enumerationsRoot>/Layout/HeaderMenuPlacement`.
 *
 * Picks which inline side the primary nav / menu cluster sits on in the
 * `centered-inline` bar layout (menu one side, logo centered, actions
 * the other side — the Södra-style single-row masthead). Logical values
 * so they flip correctly under RTL:
 *
 *   inline-start  the nav / menu cluster is pinned to the inline-start
 *                 edge and the actions cluster to the inline-end (the
 *                 recipe default — menu-left / logo-center / actions-right).
 *   inline-end    the two swap: nav / menu on the inline-end, actions on
 *                 the inline-start.
 *
 * Only the `centered-inline` layout reads it; the other layouts keep
 * their fixed slot order and ignore it. No `default` literal value in
 * the enum — the recipe's `default` carries the fallback (`inline-start`).
 */
export const menuPlacementEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "menu-placement@1",
  name: "HeaderMenuPlacement",
  displayName: "Menu Placement",
  description:
    "Which inline side the primary nav / menu cluster occupies in the header's centered-inline bar layout. `inline-start` (default) puts the menu on the inline-start with the actions cluster on the inline-end; `inline-end` swaps them. Logical values flip under RTL. Ignored by the other bar layouts.",
  location: { scope: "site", folder: ["Layout"] },
  default: "inline-start",
  values: [
    { name: "inline-start", displayName: "Inline Start" },
    { name: "inline-end", displayName: "Inline End" },
  ],
} satisfies EnumerationRecipe;

export default menuPlacementEnumRecipe;
