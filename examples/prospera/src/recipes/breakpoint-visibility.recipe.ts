import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration for the `VisibleAt` rendering parameter on the
 * `mobile-menu@1` component. Lands at
 * `<enumerationsRoot>/Layout/BreakpointVisibility`.
 *
 * Gates the rendering's visibility by viewport width. A hamburger is
 * almost always the first or last thing in a row (never stacked), so a
 * placement can pin the mobile menu to small viewports only and let a
 * desktop nav strip take over above the `md` breakpoint:
 *
 *   all          visible at every breakpoint (the recipe default —
 *                the placement's own container decides responsive
 *                visibility, unchanged behavior).
 *   mobile-only  hidden at `md` and up (`md:hidden`) — shows only on
 *                small viewports, so the same placement can sit beside a
 *                desktop nav that appears at `md`+.
 *
 * No `default` literal value in the enum — the recipe's `default`
 * carries the fallback (`all`).
 */
export const breakpointVisibilityEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "breakpoint-visibility@1",
  name: "BreakpointVisibility",
  displayName: "Breakpoint Visibility",
  description:
    "Gate a rendering's visibility by viewport width. `all` (default) keeps it visible at every breakpoint; `mobile-only` hides it at the `md` breakpoint and up (md:hidden) so it shows only on small viewports.",
  location: { scope: "site", folder: ["Layout"] },
  default: "all",
  values: [
    { name: "all", displayName: "All Breakpoints" },
    { name: "mobile-only", displayName: "Mobile Only" },
  ],
} satisfies EnumerationRecipe;

export default breakpointVisibilityEnumRecipe;
