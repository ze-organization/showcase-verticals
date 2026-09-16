import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration for the edge a sliding panel enters from — backs
 * `mobile-menu@1`'s `DrawerSide` rendering parameter. Lands at
 * `<enumerationsRoot>/Layout/DrawerSide`.
 *
 * The Drawer variant used to hardcode `side="start"`, which made the
 * slide-in edge a property of the VARIANT rather than of the placement.
 * That is backwards: which edge a drawer enters from is a per-placement
 * presentation choice an author changes across different page designs,
 * not a distinct UX pattern deserving its own rendering. Drawer /
 * Overlay / BottomSheet remain the variant axis (three genuinely
 * different patterns); the edge is now a param that composes with the
 * Drawer variant.
 *
 * Logical values so they flip correctly under RTL:
 *
 *   inline-start  panel slides in from the inline-start edge (the
 *                 historical hardcoded behaviour, so it is the default
 *                 and stored placements are unchanged).
 *   inline-end    panel slides in from the inline-end edge.
 *
 * Only the Drawer variant reads it — Overlay is full-screen and
 * BottomSheet always rises from the block-end edge, so both ignore it.
 * No `default` literal in the values list: the recipe's `default`
 * carries the fallback.
 */
export const drawerSideEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "drawer-side@1",
  name: "DrawerSide",
  displayName: "Drawer Side",
  description:
    "Which edge a sliding drawer panel enters from. `inline-start` (default) matches the historical drawer behaviour; `inline-end` slides in from the opposite edge. Logical values flip under RTL. Read only by the Drawer variant — Overlay and BottomSheet ignore it.",
  location: { scope: "site", folder: ["Layout"] },
  default: "inline-start",
  values: [
    { name: "inline-start", displayName: "Inline Start" },
    { name: "inline-end", displayName: "Inline End" },
  ],
} satisfies EnumerationRecipe;

export default drawerSideEnumRecipe;
