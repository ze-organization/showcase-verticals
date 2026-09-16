import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `TrailStyle` rendering parameter on
 * `breadcrumb@1` — how much of the ancestor trail renders. Mirrors
 * the `BreadcrumbNav` primitive's `trailStyle` axis one-to-one.
 * Lands at `<enumerationsRoot>/Navigation/BreadcrumbTrailStyle`
 * per-site with one child item per value.
 *
 * Concrete default (`responsive`) — no "default" placeholder value,
 * per the registry-wide enum rule.
 */
export const breadcrumbTrailStyleEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "breadcrumb-trail-style@1",
  name: "BreadcrumbTrailStyle",
  displayName: "Breadcrumb Trail Style",
  description:
    "Trail-length treatment for the breadcrumb: responsive (collapse on narrow screens, expand on wide), full (always show the long trail), or shortened (always collapse middle ancestors into an ellipsis dropdown).",
  location: { scope: "site", folder: ["Navigation"] },
  default: "responsive",
  values: [
    {
      name: "responsive",
      displayName: "Responsive (collapse on narrow screens)",
    },
    { name: "full", displayName: "Full (long trail, never collapsed)" },
    { name: "shortened", displayName: "Shortened (always collapsed)" },
  ],
} satisfies EnumerationRecipe;

export default breadcrumbTrailStyleEnumRecipe;
