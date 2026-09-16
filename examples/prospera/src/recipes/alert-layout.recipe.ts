import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the AlertBanner `Layout` rendering parameter.
 * Controls width + horizontal alignment (the shape axis). Pairs with
 * `position@1` (the vertical placement axis: inline / sticky-top /
 * sticky-bottom) — together they cover system banners, contained
 * alerts, and toast-style placements.
 *
 * Scoped to alert-banner today; if another component picks up the same
 * width+alignment axis, promote to a shared handle (`layout@1` or
 * similar).
 */
export const alertLayoutEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "alert-layout@1",
  name: "AlertLayout",
  displayName: "Alert Layout",
  description:
    "Width and horizontal alignment for an alert banner. Composes with the Position param for full system banner / contained / toast placements.",
  location: { scope: "site", folder: ["Layout"] },
  default: "contained",
  values: [
    { name: "full-width", displayName: "Full Width (edge-to-edge)" },
    { name: "contained", displayName: "Contained (rounded)" },
    { name: "toast-start", displayName: "Toast — Start" },
    { name: "toast-center", displayName: "Toast — Center" },
    { name: "toast-end", displayName: "Toast — End" },
  ],
} satisfies EnumerationRecipe;

export default alertLayoutEnumRecipe;
