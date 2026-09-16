import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration for the `MobilePlacement` rendering parameter on
 * the `header@1` shell. Lands at
 * `<enumerationsRoot>/Layout/HeaderMobilePlacement`.
 *
 * Picks which inline side the `header-mobile-{*}` slot — in practice the
 * hamburger trigger — sits on. The shell used to render that slot as the
 * last child of the header row unconditionally, so the hamburger was
 * always pinned to the inline-end with no way to move it. Plenty of
 * brands put it on the opposite side (hamburger inline-start, logo
 * centred or trailing), and that is a per-placement choice, not a reason
 * to fork the shell into another variant.
 *
 *   inline-end    trigger trails the row (the historical behaviour, so
 *                 it is the default and stored placements are unchanged).
 *   inline-start  trigger leads the row, ahead of the brand slot.
 *
 * Logical values, so they flip correctly under RTL.
 *
 * Read by the Standard, TwoTier, Overlay and CenteredStack arrangements.
 * CenteredInline deliberately IGNORES it: there the mobile trigger rides
 * inside the menu cluster, whose side is already the `MenuPlacement`
 * axis — honouring both would let an author split the cluster across
 * opposite edges.
 */
export const mobilePlacementEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "mobile-placement@1",
  name: "HeaderMobilePlacement",
  displayName: "Mobile Placement",
  description:
    "Which inline side the header's mobile slot (the hamburger trigger) sits on. `inline-end` (default) trails the row — the historical behaviour; `inline-start` leads it, ahead of the brand. Logical values flip under RTL. Ignored by the CenteredInline arrangement, where the trigger rides the menu cluster and follows MenuPlacement instead.",
  location: { scope: "site", folder: ["Layout"] },
  default: "inline-end",
  values: [
    { name: "inline-start", displayName: "Inline Start" },
    { name: "inline-end", displayName: "Inline End" },
  ],
} satisfies EnumerationRecipe;

export default mobilePlacementEnumRecipe;
