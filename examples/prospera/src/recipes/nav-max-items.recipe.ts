import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the `MaxItems` rendering parameter — how
 * many top-level nav links the main strip shows before the rest collapse
 * into a "More" menu. Lands at `<enumerationsRoot>/Navigation/MaxItems`.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "nav-max-items@1"`.
 *
 * Real sites cap their primary nav at roughly five to seven items and
 * push the remainder into "More" or a mega-panel; a generated header
 * that renders every discovered link inline produces the `header-overflow`
 * defect — the 2026-08-04 benchmark had uwa cramming its entire sitemap
 * into one horizontal row, and heart, helsinkifestival and oneok doing
 * the same. `auto` is the default and imposes no cap, so an unset param
 * renders exactly as before.
 */
export const navMaxItemsEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "nav-max-items@1",
  name: "MaxItems",
  displayName: "Max Nav Items",
  description:
    "How many top-level links the nav strip shows inline before the remainder collapse into a 'More' menu. `auto` (default) shows every item — matching the pre-existing behaviour. Cap at the count the source site shows (typically 5-7) when the discovered link set is larger, so the bar stays readable instead of overflowing.",
  location: { scope: "site", folder: ["Navigation"] },
  default: "auto",
  values: [
    { name: "auto", displayName: "Auto (no cap)" },
    { name: "4", displayName: "4 items" },
    { name: "5", displayName: "5 items" },
    { name: "6", displayName: "6 items" },
    { name: "7", displayName: "7 items" },
    { name: "8", displayName: "8 items" },
  ],
} satisfies EnumerationRecipe;

export default navMaxItemsEnumRecipe;
